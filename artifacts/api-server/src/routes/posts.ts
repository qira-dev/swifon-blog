import { Router, type IRouter } from "express";
import { eq, ilike, and, desc } from "drizzle-orm";
import { db, postsTable, categoriesTable, tagsTable, postTagsTable, translationsTable } from "@workspace/db";
import {
  CreatePostBody,
  UpdatePostBody,
  ListPostsQueryParams,
  GetPostResponse,
  GetPostBySlugResponse,
  ListPostsResponse,
} from "@workspace/api-zod";
import { requireModeratorOrAdmin, requireAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router: IRouter = Router();

async function applyTranslations<T extends Record<string, unknown>>(
  record: T,
  contentType: "post" | "category",
  contentId: number,
  lang: string
): Promise<T> {
  if (lang === "en") return record;

  const translations = await db
    .select()
    .from(translationsTable)
    .where(
      and(
        eq(translationsTable.contentType, contentType),
        eq(translationsTable.contentId, contentId),
        eq(translationsTable.langCode, lang)
      )
    );

  if (translations.length === 0) return record;

  const overlay: Record<string, unknown> = {};
  for (const t of translations) {
    overlay[t.field] = t.value;
  }

  return { ...record, ...overlay };
}

async function getPostWithRelations(postId: number, lang = "en") {
  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, postId));

  if (!post) return null;

  let categoryName: string | null = null;
  let categorySlug: string | null = null;
  let categoryColor: string | null = null;

  if (post.categoryId) {
    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, post.categoryId));
    if (cat) {
      categoryName = cat.name;
      categorySlug = cat.slug;
      categoryColor = cat.color;
    }
  }

  const tags = await db
    .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug, createdAt: tagsTable.createdAt })
    .from(tagsTable)
    .innerJoin(postTagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(eq(postTagsTable.postId, postId));

  const assembled = { ...post, categoryName, categorySlug, categoryColor, tags };
  return applyTranslations(assembled as Record<string, unknown>, "post", postId, lang) as Promise<typeof assembled>;
}

router.get("/posts", async (req, res): Promise<void> => {
  const params = ListPostsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { categoryId, status, featured, position, limit, offset, search } = params.data;
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";

  const conditions = [];
  if (categoryId) conditions.push(eq(postsTable.categoryId, categoryId));
  if (status) conditions.push(eq(postsTable.status, status));
  if (featured) conditions.push(eq(postsTable.position, "featured"));
  else if (position) conditions.push(eq(postsTable.position, position));
  if (search) conditions.push(ilike(postsTable.title, `%${search}%`));

  const posts = await db
    .select()
    .from(postsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(postsTable.createdAt))
    .limit(limit ?? 20)
    .offset(offset ?? 0);

  const postsWithRelations = await Promise.all(posts.map(p => getPostWithRelations(p.id, lang)));
  const validPosts = postsWithRelations.filter(Boolean);

  res.json(ListPostsResponse.parse(validPosts));
});

router.post("/posts", requireModeratorOrAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tagIds, ...postData } = parsed.data;

  const [post] = await db
    .insert(postsTable)
    .values({
      ...postData,
      status: postData.status ?? "draft",
      position: postData.position ?? "normal",
    })
    .returning();

  if (tagIds && tagIds.length > 0) {
    await db.insert(postTagsTable).values(
      tagIds.map(tagId => ({ postId: post.id, tagId }))
    );
  }

  const result = await getPostWithRelations(post.id);
  logAudit(req, "POST_CREATED", "post", post.id, { title: post.title, status: post.status });
  res.status(201).json(GetPostResponse.parse(result));
});

router.get("/posts/slug/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";

  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.slug, slug));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const result = await getPostWithRelations(post.id, lang);
  res.json(GetPostBySlugResponse.parse(result));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";
  const result = await getPostWithRelations(id, lang);
  if (!result) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(GetPostResponse.parse(result));
});

router.patch("/posts/:id", requireModeratorOrAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tagIds, ...postData } = parsed.data;

  const [updated] = await db
    .update(postsTable)
    .set(postData)
    .where(eq(postsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (tagIds !== undefined) {
    await db.delete(postTagsTable).where(eq(postTagsTable.postId, id));
    if (tagIds.length > 0) {
      await db.insert(postTagsTable).values(tagIds.map(tagId => ({ postId: id, tagId })));
    }
  }

  const result = await getPostWithRelations(id);
  if (!result) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  logAudit(req, "POST_UPDATED", "post", id, { title: updated.title, fields: Object.keys(postData) });
  res.json(GetPostResponse.parse(result));
});

/* Admins (and Super Admin) can delete posts — moderators cannot */
router.delete("/posts/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  await db.delete(postTagsTable).where(eq(postTagsTable.postId, id));
  const [deleted] = await db.delete(postsTable).where(eq(postsTable.id, id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  logAudit(req, "POST_DELETED", "post", id, { title: deleted.title });
  res.sendStatus(204);
});

export default router;
