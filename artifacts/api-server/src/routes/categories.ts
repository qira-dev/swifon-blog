import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, categoriesTable, postsTable, translationsTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  GetCategoryResponse,
  ListCategoriesResponse,
  GetCategoryTreeResponse,
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

async function buildCategoryTree(parentId: number | null = null, lang: string = "en"): Promise<ReturnType<typeof GetCategoryTreeResponse.parse>> {
  const cats = await db
    .select()
    .from(categoriesTable)
    .where(parentId === null ? sql`${categoriesTable.parentId} IS NULL` : eq(categoriesTable.parentId, parentId))
    .orderBy(categoriesTable.sortOrder, categoriesTable.name);

  const result = await Promise.all(
    cats.map(async (cat) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(postsTable)
        .where(eq(postsTable.categoryId, cat.id));

      const translated = await applyTranslations({ ...cat } as Record<string, unknown>, "category", cat.id, lang);
      const children = await buildCategoryTree(cat.id, lang);
      return { ...translated, postCount: countResult?.count ?? 0, children };
    })
  );
  return result;
}

router.get("/categories/tree", async (req, res): Promise<void> => {
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";
  const tree = await buildCategoryTree(null, lang);
  res.json(GetCategoryTreeResponse.parse(tree));
});

router.get("/categories", async (req, res): Promise<void> => {
  const { parentId } = req.query;
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";

  let cats;
  if (parentId === "null" || parentId === "") {
    cats = await db
      .select()
      .from(categoriesTable)
      .where(sql`${categoriesTable.parentId} IS NULL`)
      .orderBy(categoriesTable.sortOrder, categoriesTable.name);
  } else if (parentId !== undefined) {
    const pid = parseInt(parentId as string, 10);
    cats = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.parentId, pid))
      .orderBy(categoriesTable.sortOrder, categoriesTable.name);
  } else {
    cats = await db
      .select()
      .from(categoriesTable)
      .orderBy(categoriesTable.sortOrder, categoriesTable.name);
  }

  const catsWithData = await Promise.all(
    cats.map(async (cat) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(postsTable)
        .where(eq(postsTable.categoryId, cat.id));

      const children = await buildCategoryTree(cat.id, lang);
      const translated = await applyTranslations({ ...cat } as Record<string, unknown>, "category", cat.id, lang);
      return { ...translated, postCount: countResult?.count ?? 0, children };
    })
  );

  res.json(ListCategoriesResponse.parse(catsWithData));
});

router.post("/categories", requireModeratorOrAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cat] = await db
    .insert(categoriesTable)
    .values({ ...parsed.data, sortOrder: parsed.data.sortOrder ?? 0, isVisible: parsed.data.isVisible ?? true })
    .returning();

  logAudit(req, "CATEGORY_CREATED", "category", cat.id, { name: cat.name });
  res.status(201).json(GetCategoryResponse.parse({ ...cat, postCount: 0, children: [] }));
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid category ID" });
    return;
  }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.categoryId, id));

  const children = await buildCategoryTree(id);
  res.json(GetCategoryResponse.parse({ ...cat, postCount: countResult?.count ?? 0, children }));
});

router.patch("/categories/:id", requireModeratorOrAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid category ID" });
    return;
  }

  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(categoriesTable)
    .set(parsed.data)
    .where(eq(categoriesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.categoryId, id));

  const children = await buildCategoryTree(id);
  logAudit(req, "CATEGORY_UPDATED", "category", id, { name: updated.name, fields: Object.keys(parsed.data) });
  res.json(GetCategoryResponse.parse({ ...updated, postCount: countResult?.count ?? 0, children }));
});

/* Admins (and Super Admin) can delete categories — moderators cannot */
router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid category ID" });
    return;
  }

  const reassignTo = req.query.reassignTo ? parseInt(req.query.reassignTo as string, 10) : null;

  if (reassignTo && !isNaN(reassignTo)) {
    await db.update(postsTable).set({ categoryId: reassignTo }).where(eq(postsTable.categoryId, id));
  } else {
    await db.update(postsTable).set({ categoryId: null }).where(eq(postsTable.categoryId, id));
  }

  const [deletedCat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (deletedCat) {
    await db.update(categoriesTable).set({ parentId: deletedCat.parentId }).where(eq(categoriesTable.parentId, id));
  }

  const [deleted] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  logAudit(req, "CATEGORY_DELETED", "category", id, { name: deleted.name });
  res.sendStatus(204);
});

export default router;
