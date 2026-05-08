import { Router } from "express";
import { db, couponsTable, couponAdsTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { requireModeratorOrAdmin, requireAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router = Router();

/* Public: list active coupons */
router.get("/coupons", async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    const all = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.isActive, true))
      .orderBy(asc(couponsTable.sortOrder), desc(couponsTable.createdAt));

    const result = category && category !== "all"
      ? all.filter(c => c.category.toLowerCase() === category.toLowerCase())
      : all;

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

/* Public: get ad(s) for a coupon */
router.get("/coupons/:id/ads", async (req, res) => {
  try {
    const couponId = parseInt(req.params.id);
    const all = await db
      .select()
      .from(couponAdsTable)
      .where(eq(couponAdsTable.isActive, true))
      .orderBy(asc(couponAdsTable.sortOrder), asc(couponAdsTable.createdAt));

    const specific = all.filter(a => a.couponId === couponId);
    const global = all.filter(a => a.couponId === null);
    res.json(specific.length > 0 ? specific : global);
  } catch {
    res.status(500).json({ error: "Failed to fetch coupon ads" });
  }
});

/* Admin: list all coupons — moderators and above */
router.get("/coupons/all", requireModeratorOrAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(couponsTable)
      .orderBy(asc(couponsTable.sortOrder), desc(couponsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

/* Admin: create coupon — moderators and above */
router.post("/coupons", requireModeratorOrAdmin, async (req, res) => {
  try {
    const body = req.body;
    const [row] = await db.insert(couponsTable).values({
      title: body.title,
      code: body.code,
      category: body.category || "Other",
      type: body.type || "percentage",
      discount: body.discount || null,
      description: body.description || null,
      terms: body.terms || null,
      logoUrl: body.logoUrl || null,
      websiteUrl: body.websiteUrl || null,
      affiliateUrl: body.affiliateUrl || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
      isVerified: body.isVerified ?? false,
      sortOrder: body.sortOrder ?? 0,
    }).returning();
    logAudit(req, "COUPON_CREATED", "coupon", row.id, { title: row.title, code: row.code });
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

/* Admin: update coupon — moderators and above */
router.put("/coupons/:id", requireModeratorOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) { res.status(400).json({ error: "Invalid coupon ID" }); return; }
    const body = req.body;
    const [row] = await db.update(couponsTable).set({
      title: body.title,
      code: body.code,
      category: body.category,
      type: body.type,
      discount: body.discount || null,
      description: body.description || null,
      terms: body.terms || null,
      logoUrl: body.logoUrl || null,
      websiteUrl: body.websiteUrl || null,
      affiliateUrl: body.affiliateUrl || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive,
      isVerified: body.isVerified,
      sortOrder: body.sortOrder ?? 0,
      updatedAt: new Date(),
    }).where(eq(couponsTable.id, id)).returning();
    logAudit(req, "COUPON_UPDATED", "coupon", id, { title: row?.title, code: row?.code });
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

/* Admin: toggle coupon active — moderators and above */
router.patch("/coupons/:id/toggle", requireModeratorOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) { res.status(400).json({ error: "Invalid coupon ID" }); return; }
    const [current] = await db.select().from(couponsTable).where(eq(couponsTable.id, id));
    if (!current) return res.status(404).json({ error: "Coupon not found" });
    const [row] = await db.update(couponsTable).set({
      isActive: !current.isActive,
      updatedAt: new Date(),
    }).where(eq(couponsTable.id, id)).returning();
    logAudit(req, "COUPON_TOGGLED", "coupon", id, { title: current.title, isActive: !current.isActive });
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to toggle coupon" });
  }
});

/* Admin: delete coupon — admin and above only */
router.delete("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) { res.status(400).json({ error: "Invalid coupon ID" }); return; }
    const [deleted] = await db.delete(couponsTable).where(eq(couponsTable.id, id)).returning();
    logAudit(req, "COUPON_DELETED", "coupon", id, { title: deleted?.title });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

/* Admin: list all coupon ads — moderators and above */
router.get("/coupon-ads/all", requireModeratorOrAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(couponAdsTable)
      .orderBy(asc(couponAdsTable.sortOrder), desc(couponAdsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch coupon ads" });
  }
});

/* Admin: create coupon ad — moderators and above */
router.post("/coupon-ads", requireModeratorOrAdmin, async (req, res) => {
  try {
    const body = req.body;
    const [row] = await db.insert(couponAdsTable).values({
      name: body.name,
      couponId: body.couponId ? parseInt(body.couponId) : null,
      type: body.type || "banner",
      title: body.title || null,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      redirectUrl: body.redirectUrl || null,
      adCode: body.adCode || null,
      width: body.width ? parseInt(body.width) : null,
      height: body.height ? parseInt(body.height) : null,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    }).returning();
    logAudit(req, "COUPON_AD_CREATED", "coupon_ad", row.id, { name: row.name });
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to create coupon ad" });
  }
});

/* Admin: update coupon ad — moderators and above */
router.put("/coupon-ads/:id", requireModeratorOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [row] = await db.update(couponAdsTable).set({
      name: body.name,
      couponId: body.couponId ? parseInt(body.couponId) : null,
      type: body.type,
      title: body.title || null,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      redirectUrl: body.redirectUrl || null,
      adCode: body.adCode || null,
      width: body.width ? parseInt(body.width) : null,
      height: body.height ? parseInt(body.height) : null,
      isActive: body.isActive,
      sortOrder: body.sortOrder ?? 0,
      updatedAt: new Date(),
    }).where(eq(couponAdsTable.id, id)).returning();
    logAudit(req, "COUPON_AD_UPDATED", "coupon_ad", id, { name: row?.name });
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to update coupon ad" });
  }
});

/* Admin: toggle coupon ad — moderators and above */
router.patch("/coupon-ads/:id/toggle", requireModeratorOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [current] = await db.select().from(couponAdsTable).where(eq(couponAdsTable.id, id));
    if (!current) return res.status(404).json({ error: "Ad not found" });
    const [row] = await db.update(couponAdsTable).set({
      isActive: !current.isActive,
      updatedAt: new Date(),
    }).where(eq(couponAdsTable.id, id)).returning();
    logAudit(req, "COUPON_AD_TOGGLED", "coupon_ad", id, { name: current.name, isActive: !current.isActive });
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to toggle coupon ad" });
  }
});

/* Admin: delete coupon ad — admin and above only */
router.delete("/coupon-ads/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(couponAdsTable).where(eq(couponAdsTable.id, id)).returning();
    logAudit(req, "COUPON_AD_DELETED", "coupon_ad", id, { name: deleted?.name });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete coupon ad" });
  }
});

export default router;
