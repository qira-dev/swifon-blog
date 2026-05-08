import { Router, type IRouter } from "express";
import { eq, and, asc, ilike, desc } from "drizzle-orm";
import { db, productsTable, categoriesTable, translationsTable } from "@workspace/db";
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

const ALLOWED_PRODUCT_FIELDS = [
  "name", "slug", "categoryId", "description", "shortDescription", "rating", "rank",
  "pros", "cons", "features", "pricing", "affiliateUrl", "websiteUrl", "imageUrl",
  "metaTitle", "metaDescription"
] as const;

function pickAllowed(body: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    if (key in body) result[key] = body[key];
  }
  return result;
}

router.get("/products", async (req, res) => {
  try {
    const { categoryId, search, limit, lang } = req.query;
    const conditions = [];

    if (categoryId) {
      const catId = parseId(String(categoryId));
      if (!catId) { res.status(400).json({ error: "Invalid categoryId" }); return; }
      conditions.push(eq(productsTable.categoryId, catId));
    }
    if (search) {
      conditions.push(ilike(productsTable.name, `%${search}%`));
    }

    const parsedLimit = limit ? Math.min(Math.max(1, Number(limit) || 100), 200) : 100;

    const products = await db
      .select()
      .from(productsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(productsTable.rank))
      .limit(parsedLimit);

    const langStr = lang ? String(lang) : "en";
    const translated = await Promise.all(
      products.map(p => applyTranslations({ ...p } as Record<string, unknown>, "product", p.id, langStr))
    );
    res.json(translated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/category/:categoryId", async (req, res) => {
  try {
    const categoryId = parseId(String(req.params.categoryId));
    if (!categoryId) { res.status(400).json({ error: "Invalid categoryId" }); return; }
    const lang = req.query.lang ? String(req.query.lang) : "en";

    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.categoryId, categoryId))
      .orderBy(asc(productsTable.rank))
      .limit(10);

    const translated = await Promise.all(
      products.map(p => applyTranslations({ ...p } as Record<string, unknown>, "product", p.id, lang))
    );
    res.json(translated);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/by-category-slug/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const lang = req.query.lang ? String(req.query.lang) : "en";
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug));

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const translatedCategory = await applyTranslations({ ...category } as Record<string, unknown>, "category", category.id, lang);

    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.categoryId, category.id))
      .orderBy(asc(productsTable.rank))
      .limit(10);

    const translatedProducts = await Promise.all(
      products.map(p => applyTranslations({ ...p } as Record<string, unknown>, "product", p.id, lang))
    );

    res.json({ category: translatedCategory, products: translatedProducts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/slug/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const lang = req.query.lang ? String(req.query.lang) : "en";
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug));

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const translatedProduct = await applyTranslations({ ...product } as Record<string, unknown>, "product", product.id, lang);

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, product.categoryId));

    const translatedCategory = category
      ? await applyTranslations({ ...category } as Record<string, unknown>, "category", category.id, lang)
      : category;

    const relatedProducts = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.categoryId, product.categoryId))
      .orderBy(asc(productsTable.rank))
      .limit(5);

    const translatedRelated = await Promise.all(
      relatedProducts.filter(p => p.id !== product.id).map(p =>
        applyTranslations({ ...p } as Record<string, unknown>, "product", p.id, lang)
      )
    );

    res.json({ product: translatedProduct, category: translatedCategory, relatedProducts: translatedRelated });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/products", requireModeratorOrAdmin, async (req, res) => {
  try {
    const data = pickAllowed(req.body, ALLOWED_PRODUCT_FIELDS);
    if (!data.name || !data.slug || !data.categoryId) {
      res.status(400).json({ error: "name, slug, and categoryId are required" });
      return;
    }
    const [product] = await db.insert(productsTable).values(data as any).returning();
    logAudit(req, "PRODUCT_CREATED", "product", product.id, { name: product.name });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/products/:id", requireModeratorOrAdmin, async (req, res) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const data = pickAllowed(req.body, ALLOWED_PRODUCT_FIELDS);
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const [product] = await db
      .update(productsTable)
      .set(data as any)
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    logAudit(req, "PRODUCT_UPDATED", "product", id, { name: product.name, fields: Object.keys(data) });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

/* Admins (and Super Admin) can delete products — moderators cannot */
router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) { res.status(400).json({ error: "Invalid product ID" }); return; }

    const deleted = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    logAudit(req, "PRODUCT_DELETED", "product", id, { name: deleted[0]?.name });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
