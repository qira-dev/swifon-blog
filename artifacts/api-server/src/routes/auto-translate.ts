import { Router } from "express";
import { eq, and } from "drizzle-orm";
import {
  db,
  postsTable,
  categoriesTable,
  productsTable,
  comparisonsTable,
  translationsTable,
} from "@workspace/db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

const NON_EN_LANGS = ["es", "hi", "ar", "fr", "bn", "de", "pt", "ko", "ru", "zh", "ja"];

const LANG_PAIR_MAP: Record<string, string> = {
  es: "es",
  hi: "hi",
  ar: "ar",
  fr: "fr",
  bn: "bn",
  de: "de",
  pt: "pt",
  ko: "ko",
  ru: "ru",
  zh: "zh-CN",
  ja: "ja",
};

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const gtLang = LANG_PAIR_MAP[targetLang] || targetLang;

  // Split into chunks to handle long text (Google Translate limit ~5000 chars)
  const CHUNK = 4000;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK) chunks.push(text.slice(i, i + CHUNK));

  const translated: string[] = [];
  for (const chunk of chunks) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(gtLang)}&dt=t&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) { translated.push(chunk); continue; }
      // Response: [[[translated, original, ...], ...], ...]
      const data = await res.json() as Array<Array<Array<string>>>;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const parts = (data[0] as Array<Array<string>>)
          .filter(Boolean)
          .map((r) => (Array.isArray(r) ? r[0] : ""))
          .filter(Boolean);
        translated.push(parts.join(""));
      } else {
        translated.push(chunk);
      }
      // Small delay to avoid hammering the endpoint
      await new Promise((r) => setTimeout(r, 80));
    } catch {
      translated.push(chunk);
    }
  }
  return translated.join(" ");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchSourceFields(
  contentType: string,
  contentId: number
): Promise<Record<string, string> | null> {
  if (contentType === "post") {
    const [row] = await db.select().from(postsTable).where(eq(postsTable.id, contentId)).limit(1);
    if (!row) return null;
    return {
      title: row.title || "",
      excerpt: row.excerpt || "",
      content: row.content ? stripHtml(row.content).slice(0, 1200) : "",
      metaTitle: row.metaTitle || "",
      metaDescription: row.metaDescription || "",
      focusKeyword: row.focusKeyword || "",
    };
  }
  if (contentType === "category") {
    const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, contentId)).limit(1);
    if (!row) return null;
    return {
      name: row.name || "",
      description: row.description || "",
      metaTitle: row.metaTitle || "",
      metaDescription: row.metaDescription || "",
    };
  }
  if (contentType === "product") {
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, contentId)).limit(1);
    if (!row) return null;
    const pricing = typeof row.pricing === "string" ? row.pricing : "";
    return {
      name: row.name || "",
      shortDescription: row.shortDescription || "",
      description: typeof row.description === "string" ? row.description.slice(0, 800) : "",
      pricing,
      metaTitle: row.metaTitle || "",
      metaDescription: row.metaDescription || "",
    };
  }
  if (contentType === "comparison") {
    const [row] = await db.select().from(comparisonsTable).where(eq(comparisonsTable.id, contentId)).limit(1);
    if (!row) return null;
    return {
      title: row.title || "",
      description: row.description || "",
      verdict: row.verdict ? row.verdict.slice(0, 800) : "",
      metaTitle: row.metaTitle || "",
      metaDescription: row.metaDescription || "",
    };
  }
  return null;
}

async function saveTranslation(
  contentType: string,
  contentId: number,
  langCode: string,
  fields: Record<string, string>
) {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());
  await Promise.all(
    entries.map(([field, value]) =>
      db
        .insert(translationsTable)
        .values({ contentType: contentType as any, contentId, langCode, field, value })
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
}

router.post("/translations/auto-translate", requireAdmin, async (req, res): Promise<void> => {
  const { contentType, contentId, targetLang } = req.body as {
    contentType: string;
    contentId: number;
    targetLang: string;
  };

  const VALID = ["post", "category", "product", "comparison"];
  if (!VALID.includes(contentType)) {
    res.status(400).json({ error: "Invalid contentType" });
    return;
  }
  if (!contentId || isNaN(Number(contentId))) {
    res.status(400).json({ error: "Invalid contentId" });
    return;
  }

  const langs = targetLang === "all" ? NON_EN_LANGS : [targetLang];
  for (const l of langs) {
    if (!NON_EN_LANGS.includes(l)) {
      res.status(400).json({ error: `Unsupported language: ${l}` });
      return;
    }
  }

  const source = await fetchSourceFields(contentType, Number(contentId));
  if (!source) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const results: Record<string, Record<string, string>> = {};

  for (const lang of langs) {
    const translated: Record<string, string> = {};
    for (const [field, value] of Object.entries(source)) {
      if (!value || !value.trim()) { translated[field] = ""; continue; }
      translated[field] = await translateText(value, lang);
    }
    await saveTranslation(contentType, Number(contentId), lang, translated);
    results[lang] = translated;
  }

  res.json({ success: true, langs, results });
});

export default router;
