import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, comparisonsTable, productsTable, categoriesTable, translationsTable } from "@workspace/db";
import { requireModeratorOrAdmin, requireAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router: IRouter = Router();

async function applyTranslations<T extends Record<string, unknown>>(
  record: T,
  contentType: string,
  contentId: number,
  lang: string
): Promise<T> {
  if (!lang || lang === "en") return record;
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
  return { ...record, ...overlay } as T;
}

function parseId(val: string): number | null {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 && Number.isInteger(n) ? n : null;
}

const ALLOWED_COMPARISON_FIELDS = [
  "title", "slug", "categoryId", "description", "productIds", "comparisonFields",
  "verdict", "metaTitle", "metaDescription"
] as const;

function pickAllowed(body: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    if (key in body) result[key] = body[key];
  }
  return result;
}

router.get("/comparisons", async (req, res) => {
  try {
    const { categoryId, lang } = req.query;
    const conditions = [];

    if (categoryId) {
      const catId = parseId(String(categoryId));
      if (!catId) { res.status(400).json({ error: "Invalid categoryId" }); return; }
      conditions.push(eq(comparisonsTable.categoryId, catId));
    }

    const comparisons = await db
      .select()
      .from(comparisonsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(comparisonsTable.title));

    const langStr = lang ? String(lang) : "en";
    const translated = await Promise.all(
      comparisons.map(c => applyTranslations({ ...c } as Record<string, unknown>, "comparison", c.id, langStr))
    );
    res.json(translated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comparisons" });
  }
});

router.get("/comparisons/slug/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const lang = req.query.lang ? String(req.query.lang) : "en";
    const [comparison] = await db
      .select()
      .from(comparisonsTable)
      .where(eq(comparisonsTable.slug, slug));

    if (!comparison) {
      res.status(404).json({ error: "Comparison not found" });
      return;
    }

    const translatedComparison = await applyTranslations({ ...comparison } as Record<string, unknown>, "comparison", comparison.id, lang);

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, comparison.categoryId));

    const translatedCategory = category
      ? await applyTranslations({ ...category } as Record<string, unknown>, "category", category.id, lang)
      : category;

    const productIds = (comparison.productIds as number[]) || [];
    const products = productIds.length > 0
      ? await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.categoryId, comparison.categoryId))
          .orderBy(asc(productsTable.rank))
      : [];

    const orderedProducts = productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    const translatedProducts = await Promise.all(
      orderedProducts.map(p => applyTranslations({ ...p } as Record<string, unknown>, "product", p!.id, lang))
    );

    res.json({ comparison: translatedComparison, category: translatedCategory, products: translatedProducts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comparison" });
  }
});

router.get("/comparisons/category/:categoryId", async (req, res) => {
  try {
    const categoryId = parseId(String(req.params.categoryId));
    if (!categoryId) { res.status(400).json({ error: "Invalid categoryId" }); return; }
    const lang = req.query.lang ? String(req.query.lang) : "en";

    const comparisons = await db
      .select()
      .from(comparisonsTable)
      .where(eq(comparisonsTable.categoryId, categoryId));

    const translated = await Promise.all(
      comparisons.map(c => applyTranslations({ ...c } as Record<string, unknown>, "comparison", c.id, lang))
    );
    res.json(translated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comparisons" });
  }
});

router.get("/comparisons/:id", async (req, res) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) { res.status(400).json({ error: "Invalid comparison ID" }); return; }

    const [comparison] = await db
      .select()
      .from(comparisonsTable)
      .where(eq(comparisonsTable.id, id));

    if (!comparison) {
      res.status(404).json({ error: "Comparison not found" });
      return;
    }
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comparison" });
  }
});

router.post("/comparisons", requireModeratorOrAdmin, async (req, res) => {
  try {
    const data = pickAllowed(req.body, ALLOWED_COMPARISON_FIELDS);
    if (!data.title || !data.slug || !data.categoryId) {
      res.status(400).json({ error: "title, slug, and categoryId are required" });
      return;
    }
    const [comparison] = await db.insert(comparisonsTable).values(data as any).returning();
    logAudit(req, "COMPARISON_CREATED", "comparison", comparison.id, { title: comparison.title });
    res.status(201).json(comparison);
  } catch (err) {
    res.status(500).json({ error: "Failed to create comparison" });
  }
});

router.patch("/comparisons/:id", requireModeratorOrAdmin, async (req, res) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) { res.status(400).json({ error: "Invalid comparison ID" }); return; }

    const data = pickAllowed(req.body, ALLOWED_COMPARISON_FIELDS);
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const [comparison] = await db
      .update(comparisonsTable)
      .set(data as any)
      .where(eq(comparisonsTable.id, id))
      .returning();

    if (!comparison) {
      res.status(404).json({ error: "Comparison not found" });
      return;
    }
    logAudit(req, "COMPARISON_UPDATED", "comparison", id, { title: comparison.title, fields: Object.keys(data) });
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ error: "Failed to update comparison" });
  }
});

/* Admins (and Super Admin) can delete comparisons — moderators cannot */
router.delete("/comparisons/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) { res.status(400).json({ error: "Invalid comparison ID" }); return; }

    const deleted = await db.delete(comparisonsTable).where(eq(comparisonsTable.id, id)).returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Comparison not found" });
      return;
    }
    logAudit(req, "COMPARISON_DELETED", "comparison", id, { title: deleted[0]?.title });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comparison" });
  }
});

export default router;
