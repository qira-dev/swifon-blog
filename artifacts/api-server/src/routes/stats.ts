import { Router, type IRouter } from "express";
import { eq, sql, desc, and, gte } from "drizzle-orm";
import { db, postsTable, categoriesTable, tagsTable, postTagsTable, translationsTable, usersTable, productsTable, adsTable, couponsTable, contactMessagesTable } from "@workspace/db";
import {
  GetStatsSummaryResponse,
  GetPostsPerCategoryResponse,
  GetRecentPostsResponse,
  GetFeaturedPostsResponse,
} from "@workspace/api-zod";

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

async function getPostWithRelations(post: typeof postsTable.$inferSelect, lang = "en") {
  let categoryName: string | null = null;
  let categorySlug: string | null = null;
  let categoryColor: string | null = null;

  if (post.categoryId) {
    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, post.categoryId));
    if (cat) {
      const translatedCat = await applyTranslations({ ...cat } as Record<string, unknown>, "category", cat.id, lang);
      categoryName = (translatedCat["name"] as string) ?? cat.name;
      categorySlug = cat.slug;
      categoryColor = cat.color;
    }
  }

  const tags = await db
    .select({ id: tagsTable.id, name: tagsTable.name, slug: tagsTable.slug, createdAt: tagsTable.createdAt })
    .from(tagsTable)
    .innerJoin(postTagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(eq(postTagsTable.postId, post.id));

  const assembled = { ...post, categoryName, categorySlug, categoryColor, tags };
  return applyTranslations(assembled as unknown as Record<string, unknown>, "post", post.id, lang);
}

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalPosts: sql<number>`count(*)::int`,
      publishedPosts: sql<number>`sum(case when status = 'published' then 1 else 0 end)::int`,
      draftPosts: sql<number>`sum(case when status = 'draft' then 1 else 0 end)::int`,
      featuredPosts: sql<number>`sum(case when position = 'featured' then 1 else 0 end)::int`,
    })
    .from(postsTable);

  const [catCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categoriesTable);

  const [tagCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tagsTable);

  const summary = {
    totalPosts: totals?.totalPosts ?? 0,
    publishedPosts: totals?.publishedPosts ?? 0,
    draftPosts: totals?.draftPosts ?? 0,
    totalCategories: catCount?.count ?? 0,
    totalTags: tagCount?.count ?? 0,
    featuredPosts: totals?.featuredPosts ?? 0,
  };

  res.json(GetStatsSummaryResponse.parse(summary));
});

router.get("/stats/posts-per-category", async (req, res): Promise<void> => {
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);

  const result = await Promise.all(
    categories.map(async (cat) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(postsTable)
        .where(eq(postsTable.categoryId, cat.id));

      const translatedCat = await applyTranslations({ ...cat } as Record<string, unknown>, "category", cat.id, lang);
      return {
        categoryId: cat.id,
        categoryName: (translatedCat["name"] as string) ?? cat.name,
        categorySlug: cat.slug,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        postCount: countResult?.count ?? 0,
      };
    })
  );

  res.json(GetPostsPerCategoryResponse.parse(result));
});

router.get("/stats/recent-posts", async (req, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";

  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.status, "published"))
    .orderBy(desc(postsTable.publishedAt))
    .limit(limit);

  const postsWithRelations = await Promise.all(posts.map(p => getPostWithRelations(p, lang)));
  res.json(GetRecentPostsResponse.parse(postsWithRelations));
});

router.get("/stats/featured-posts", async (req, res): Promise<void> => {
  const lang = typeof req.query.lang === "string" ? req.query.lang : "en";

  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.position, "featured"))
    .orderBy(desc(postsTable.publishedAt))
    .limit(5);

  const postsWithRelations = await Promise.all(posts.map(p => getPostWithRelations(p, lang)));
  res.json(GetFeaturedPostsResponse.parse(postsWithRelations));
});

router.get("/stats/analytics-overview", async (_req, res): Promise<void> => {
  try {
  const [postTotals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`sum(case when status = 'published' then 1 else 0 end)::int`,
      draft: sql<number>`sum(case when status = 'draft' then 1 else 0 end)::int`,
      featured: sql<number>`sum(case when position = 'featured' then 1 else 0 end)::int`,
      sidebar: sql<number>`sum(case when position = 'sidebar' then 1 else 0 end)::int`,
      normal: sql<number>`sum(case when position = 'normal' then 1 else 0 end)::int`,
    })
    .from(postsTable);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const postsPerMonthRaw = await db.execute(
    sql`select to_char(date_trunc('month', created_at), 'Mon YYYY') as month,
               count(*)::int as count
        from posts
        where created_at >= ${twelveMonthsAgo.toISOString()}::timestamptz
        group by date_trunc('month', created_at)
        order by date_trunc('month', created_at)`
  );
  const postsPerMonth = (postsPerMonthRaw as unknown as { rows: { month: string; count: number }[] }).rows ?? [];

  const categoryRows = await db
    .select({
      name: categoriesTable.name,
      color: categoriesTable.color,
      count: sql<number>`count(${postsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.color)
    .orderBy(desc(sql`count(${postsTable.id})`))
    .limit(10);

  const userRows = await db
    .select({
      role: usersTable.role,
      count: sql<number>`count(*)::int`,
      active: sql<number>`sum(case when is_active then 1 else 0 end)::int`,
    })
    .from(usersTable)
    .groupBy(usersTable.role);

  const [userTotals] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(usersTable);

  const [productTotals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      avgRating: sql<number>`round(avg(rating)::numeric, 1)::float`,
      highRated: sql<number>`sum(case when rating >= 4 then 1 else 0 end)::int`,
      midRated: sql<number>`sum(case when rating >= 2.5 and rating < 4 then 1 else 0 end)::int`,
      lowRated: sql<number>`sum(case when rating < 2.5 then 1 else 0 end)::int`,
    })
    .from(productsTable);

  const adRows = await db
    .select({
      network: adsTable.network,
      position: adsTable.position,
      count: sql<number>`count(*)::int`,
      active: sql<number>`sum(case when is_active then 1 else 0 end)::int`,
      inactive: sql<number>`sum(case when not is_active then 1 else 0 end)::int`,
    })
    .from(adsTable)
    .groupBy(adsTable.network, adsTable.position);

  const [adTotals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`sum(case when is_active then 1 else 0 end)::int`,
    })
    .from(adsTable);

  const [couponTotals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`sum(case when is_active and (expires_at is null or expires_at > now()) then 1 else 0 end)::int`,
      expired: sql<number>`sum(case when expires_at is not null and expires_at <= now() then 1 else 0 end)::int`,
      inactive: sql<number>`sum(case when not is_active then 1 else 0 end)::int`,
    })
    .from(couponsTable);

  const [msgTotals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      unread: sql<number>`sum(case when status = 'unread' then 1 else 0 end)::int`,
      read: sql<number>`sum(case when status = 'read' then 1 else 0 end)::int`,
      replied: sql<number>`sum(case when status = 'replied' then 1 else 0 end)::int`,
    })
    .from(contactMessagesTable);

  const [tagCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tagsTable);

  const [catCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categoriesTable);

  res.json({
    posts: {
      total: postTotals?.total ?? 0,
      published: postTotals?.published ?? 0,
      draft: postTotals?.draft ?? 0,
      featured: postTotals?.featured ?? 0,
      sidebar: postTotals?.sidebar ?? 0,
      normal: postTotals?.normal ?? 0,
    },
    postsPerMonth,
    postsPerCategory: categoryRows,
    users: {
      total: userTotals?.total ?? 0,
      byRole: userRows,
    },
    products: {
      total: productTotals?.total ?? 0,
      avgRating: productTotals?.avgRating ?? 0,
      highRated: productTotals?.highRated ?? 0,
      midRated: productTotals?.midRated ?? 0,
      lowRated: productTotals?.lowRated ?? 0,
    },
    ads: {
      total: adTotals?.total ?? 0,
      active: adTotals?.active ?? 0,
      inactive: (adTotals?.total ?? 0) - (adTotals?.active ?? 0),
      byNetwork: adRows,
    },
    coupons: {
      total: couponTotals?.total ?? 0,
      active: couponTotals?.active ?? 0,
      expired: couponTotals?.expired ?? 0,
      inactive: couponTotals?.inactive ?? 0,
    },
    messages: {
      total: msgTotals?.total ?? 0,
      unread: msgTotals?.unread ?? 0,
      read: msgTotals?.read ?? 0,
      replied: msgTotals?.replied ?? 0,
    },
    categories: catCount?.count ?? 0,
    tags: tagCount?.count ?? 0,
  });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ error: "Failed to load analytics data" });
  }
});

export default router;
