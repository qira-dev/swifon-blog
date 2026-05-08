import { Router } from "express";
import { db, adsTable, adNetworkCredentialsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router = Router();

/* Public: fetch active ads */
router.get("/ads", async (req, res) => {
  try {
    const { page, position } = req.query as { page?: string; position?: string };

    const allActive = await db
      .select()
      .from(adsTable)
      .where(eq(adsTable.isActive, true))
      .orderBy(asc(adsTable.sortOrder), asc(adsTable.createdAt));

    let result = allActive;

    if (page) {
      result = result.filter((ad) => ad.page === page || ad.page === "all");
    }

    if (position) {
      result = result.filter((ad) => ad.position === position);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

/* Admin: list all ads */
router.get("/ads/all", requireAdmin, async (_req, res) => {
  try {
    const ads = await db
      .select()
      .from(adsTable)
      .orderBy(asc(adsTable.page), asc(adsTable.position), asc(adsTable.sortOrder));
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

/* Admin: get single ad */
router.get("/ads/:id", requireAdmin, async (req, res) => {
  try {
    const [ad] = await db
      .select()
      .from(adsTable)
      .where(eq(adsTable.id, Number(req.params.id)))
      .limit(1);
    if (!ad) return res.status(404).json({ error: "Ad not found" });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ad" });
  }
});

/* Admin: create ad */
router.post("/ads", requireAdmin, async (req, res) => {
  try {
    const {
      name, type, page, position, network, title, description,
      imageUrl, videoUrl, redirectUrl, adCode, width, height, sortOrder, isActive,
    } = req.body;

    if (!name || !type || !page || !position) {
      return res.status(400).json({ error: "name, type, page, and position are required" });
    }

    const [created] = await db
      .insert(adsTable)
      .values({
        name,
        type,
        page,
        position,
        network: network || "custom",
        title: title || null,
        description: description || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        redirectUrl: redirectUrl || null,
        adCode: adCode || null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();

    logAudit(req, "AD_CREATED", "ad", created.id, { name: created.name, page: created.page, position: created.position });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create ad" });
  }
});

/* Admin: update ad */
router.put("/ads/:id", requireAdmin, async (req, res) => {
  try {
    const {
      name, type, page, position, network, title, description,
      imageUrl, videoUrl, redirectUrl, adCode, width, height, sortOrder, isActive,
    } = req.body;

    const [updated] = await db
      .update(adsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(page !== undefined && { page }),
        ...(position !== undefined && { position }),
        ...(network !== undefined && { network }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(redirectUrl !== undefined && { redirectUrl }),
        ...(adCode !== undefined && { adCode }),
        ...(width !== undefined && { width: width ? Number(width) : null }),
        ...(height !== undefined && { height: height ? Number(height) : null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(adsTable.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Ad not found" });
    logAudit(req, "AD_UPDATED", "ad", Number(req.params.id), { name: updated.name });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update ad" });
  }
});

/* Admin: toggle ad active state */
router.patch("/ads/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const [ad] = await db
      .select()
      .from(adsTable)
      .where(eq(adsTable.id, Number(req.params.id)))
      .limit(1);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    const [updated] = await db
      .update(adsTable)
      .set({ isActive: !ad.isActive, updatedAt: new Date() })
      .where(eq(adsTable.id, Number(req.params.id)))
      .returning();

    logAudit(req, "AD_TOGGLED", "ad", Number(req.params.id), { name: ad.name, isActive: !ad.isActive });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle ad" });
  }
});

/* Admin: delete ad */
router.delete("/ads/:id", requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(adsTable)
      .where(eq(adsTable.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Ad not found" });
    logAudit(req, "AD_DELETED", "ad", Number(req.params.id), { name: deleted.name });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ad" });
  }
});

/* Admin: list ad network credentials */
router.get("/ad-network-credentials", requireAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(adNetworkCredentialsTable)
      .orderBy(asc(adNetworkCredentialsTable.network));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ad network credentials" });
  }
});

/* Public: ad network public credentials */
router.get("/ad-network-credentials/public", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(adNetworkCredentialsTable)
      .where(eq(adNetworkCredentialsTable.isEnabled, true));
    const result: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      try {
        result[row.network] = JSON.parse(row.credentials);
      } catch {
        result[row.network] = {};
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public ad credentials" });
  }
});

/* Admin: update ad network credentials */
router.put("/ad-network-credentials/:network", requireAdmin, async (req, res) => {
  try {
    const { network } = req.params;
    const { credentials, isEnabled } = req.body as {
      credentials?: Record<string, string>;
      isEnabled?: boolean;
    };

    const existing = await db
      .select()
      .from(adNetworkCredentialsTable)
      .where(eq(adNetworkCredentialsTable.network, network))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(adNetworkCredentialsTable)
        .set({
          ...(credentials !== undefined && { credentials: JSON.stringify(credentials) }),
          ...(isEnabled !== undefined && { isEnabled }),
          updatedAt: new Date(),
        })
        .where(eq(adNetworkCredentialsTable.network, network))
        .returning();
      logAudit(req, "AD_NETWORK_UPDATED", "ad_network", null, { network, isEnabled });
      return res.json(updated);
    }

    const [created] = await db
      .insert(adNetworkCredentialsTable)
      .values({
        network,
        credentials: credentials ? JSON.stringify(credentials) : "{}",
        isEnabled: isEnabled ?? false,
      })
      .returning();
    logAudit(req, "AD_NETWORK_UPDATED", "ad_network", null, { network, isEnabled });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to save ad network credentials" });
  }
});

export default router;
