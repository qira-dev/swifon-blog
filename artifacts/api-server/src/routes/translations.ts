import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, translationsTable } from "@workspace/db";
import { GetTranslationsResponse, UpsertTranslationsBody, UpsertTranslationsResponse } from "@workspace/api-zod";
import { requireModeratorOrAdmin } from "../middleware/auth";
import { logAudit } from "../lib/audit";

const router: IRouter = Router();

const VALID_CONTENT_TYPES = ["post", "category", "product", "comparison"] as const;
type ContentType = (typeof VALID_CONTENT_TYPES)[number];

function parseContentParams(contentType: string, contentId: string): { type: ContentType; id: number } | null {
  if (!VALID_CONTENT_TYPES.includes(contentType as ContentType)) return null;
  const id = parseInt(contentId, 10);
  if (isNaN(id)) return null;
  return { type: contentType as ContentType, id };
}

router.get("/translations/:contentType/:contentId", async (req, res): Promise<void> => {
  const params = parseContentParams(req.params.contentType, req.params.contentId);
  if (!params) {
    res.status(400).json({ error: "Invalid content type or ID" });
    return;
  }

  const translations = await db
    .select()
    .from(translationsTable)
    .where(
      and(
        eq(translationsTable.contentType, params.type),
        eq(translationsTable.contentId, params.id)
      )
    )
    .orderBy(translationsTable.langCode, translationsTable.field);

  res.json(GetTranslationsResponse.parse(translations));
});

/* Moderators and above can update translations */
router.put("/translations/:contentType/:contentId", requireModeratorOrAdmin, async (req, res): Promise<void> => {
  const params = parseContentParams(String(req.params.contentType), String(req.params.contentId));
  if (!params) {
    res.status(400).json({ error: "Invalid content type or ID" });
    return;
  }

  const parsed = UpsertTranslationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { langCode, fields } = parsed.data;

  await Promise.all(
    Object.entries(fields).map(([field, value]) =>
      db
        .insert(translationsTable)
        .values({ contentType: params.type, contentId: params.id, langCode, field, value })
        .onConflictDoUpdate({
          target: [
            translationsTable.contentType,
            translationsTable.contentId,
            translationsTable.langCode,
            translationsTable.field,
          ],
          set: { value, updatedAt: new Date() },
        })
    )
  );

  const translations = await db
    .select()
    .from(translationsTable)
    .where(
      and(
        eq(translationsTable.contentType, params.type),
        eq(translationsTable.contentId, params.id),
        eq(translationsTable.langCode, langCode)
      )
    );

  logAudit(req, "TRANSLATION_UPDATED", params.type, params.id, {
    langCode,
    fieldCount: Object.keys(fields).length,
  });

  res.json(UpsertTranslationsResponse.parse(translations));
});

export default router;
