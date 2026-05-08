import { Router, type IRouter } from "express";
import { db, tagsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTagBody, ListTagsResponse, ListTagsResponseItem } from "@workspace/api-zod";
import { requireAdminKey } from "../middleware/auth";

const router: IRouter = Router();

router.get("/tags", async (_req, res): Promise<void> => {
  const tags = await db.select().from(tagsTable).orderBy(tagsTable.name);
  res.json(ListTagsResponse.parse(tags));
});

router.post("/tags", requireAdminKey, async (req, res): Promise<void> => {
  const parsed = CreateTagBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tag] = await db.insert(tagsTable).values(parsed.data).returning();
  res.status(201).json(ListTagsResponseItem.parse(tag));
});

router.patch("/tags/:id", requireAdminKey, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) { res.status(400).json({ error: "Invalid tag ID" }); return; }
    const { name, slug } = req.body as { name?: string; slug?: string };
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No valid fields to update" }); return; }
    const [updated] = await db.update(tagsTable).set(updates).where(eq(tagsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Tag not found" }); return; }
    res.json(ListTagsResponseItem.parse(updated));
  } catch {
    res.status(500).json({ error: "Failed to update tag" });
  }
});

router.delete("/tags/:id", requireAdminKey, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) { res.status(400).json({ error: "Invalid tag ID" }); return; }
    const deleted = await db.delete(tagsTable).where(eq(tagsTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Tag not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

export default router;
