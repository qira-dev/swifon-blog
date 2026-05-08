import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router = Router();

/* Admin-only: list all settings */
router.get("/settings", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable).orderBy(siteSettingsTable.key);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/* Public: get a single setting by key */
router.get("/settings/:key", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, req.params.key))
      .limit(1);
    res.json({ key: req.params.key, value: row?.value ?? "" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch setting" });
  }
});

/* Admin-only: update a setting */
router.put("/settings/:key", requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    if (typeof value !== "string") {
      return res.status(400).json({ error: "value must be a string" });
    }

    const existing = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, req.params.key))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(siteSettingsTable)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettingsTable.key, req.params.key))
        .returning();
      logAudit(req, "SETTING_UPDATED", "setting", null, { key: req.params.key });
      return res.json(updated);
    }

    const [created] = await db
      .insert(siteSettingsTable)
      .values({ key: req.params.key, value })
      .returning();
    logAudit(req, "SETTING_UPDATED", "setting", null, { key: req.params.key });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
