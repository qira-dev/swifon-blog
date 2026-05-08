import { Router } from "express";
import { db, socialLinksTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdminKey, requireSuperAdmin } from "../middleware/auth";

const router = Router();

router.get("/social-links", async (_req, res) => {
  try {
    const links = await db
      .select()
      .from(socialLinksTable)
      .orderBy(asc(socialLinksTable.sortOrder));
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch social links" });
  }
});

router.post("/social-links", requireAdminKey, async (req, res) => {
  try {
    const { platform, url, icon, sortOrder, isActive } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ error: "platform and url are required" });
    }
    const [created] = await db
      .insert(socialLinksTable)
      .values({
        platform,
        url,
        icon: icon || "link",
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create social link" });
  }
});

router.put("/social-links/:id", requireAdminKey, async (req, res) => {
  try {
    const { platform, url, icon, sortOrder, isActive } = req.body;
    const [updated] = await db
      .update(socialLinksTable)
      .set({
        ...(platform !== undefined && { platform }),
        ...(url !== undefined && { url }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(socialLinksTable.id, Number(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update social link" });
  }
});

router.delete("/social-links/:id", requireSuperAdmin, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(socialLinksTable)
      .where(eq(socialLinksTable.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete social link" });
  }
});

export default router;
