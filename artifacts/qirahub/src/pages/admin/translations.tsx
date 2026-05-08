import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListPosts,
  useListCategories,
  useGetTranslations,
  useUpsertTranslations,
} from "@workspace/api-client-react";
import { useProducts, useComparisons } from "@/lib/api-hooks";
import { LANGUAGES } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Save, Loader2, Globe, FileText, Package, BarChart3,
  Folder, ChevronRight, Sparkles, CheckCircle2, Languages,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ContentTypeKey = "post" | "product" | "comparison" | "category";
type FieldType = "text" | "textarea" | "textarea-lg";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
}

const CONTENT_CONFIG: Record<
  ContentTypeKey,
  { label: string; icon: React.ReactNode; fields: FieldDef[] }
> = {
  post: {
    label: "Posts",
    icon: <FileText className="w-4 h-4" />,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "excerpt", label: "Excerpt / Summary", type: "textarea" },
      { key: "content", label: "Full Content (plain text)", type: "textarea-lg" },
      { key: "metaTitle", label: "SEO Meta Title", type: "text", hint: "Shown in browser tab & search results" },
      { key: "metaDescription", label: "SEO Meta Description", type: "textarea", hint: "Search engine snippet" },
      { key: "focusKeyword", label: "Focus Keyword", type: "text", hint: "Primary SEO keyword for this language" },
      { key: "videoUrl", label: "Video URL", type: "text", hint: "Optional embedded video for this language" },
    ],
  },
  product: {
    label: "Products",
    icon: <Package className="w-4 h-4" />,
    fields: [
      { key: "name", label: "Product Name", type: "text" },
      { key: "shortDescription", label: "Short Description", type: "text", hint: "One-line summary" },
      { key: "description", label: "Full Description", type: "textarea-lg" },
      { key: "pricing", label: "Pricing Text", type: "text", hint: 'e.g. "Free / $12/mo"' },
      { key: "metaTitle", label: "SEO Meta Title", type: "text" },
      { key: "metaDescription", label: "SEO Meta Description", type: "textarea" },
    ],
  },
  comparison: {
    label: "Comparisons",
    icon: <BarChart3 className="w-4 h-4" />,
    fields: [
      { key: "title", label: "Comparison Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "verdict", label: "Verdict / Conclusion", type: "textarea-lg", hint: "Final recommendation for users" },
      { key: "metaTitle", label: "SEO Meta Title", type: "text" },
      { key: "metaDescription", label: "SEO Meta Description", type: "textarea" },
    ],
  },
  category: {
    label: "Categories",
    icon: <Folder className="w-4 h-4" />,
    fields: [
      { key: "name", label: "Category Name", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "metaTitle", label: "SEO Meta Title", type: "text" },
      { key: "metaDescription", label: "SEO Meta Description", type: "textarea" },
    ],
  },
};

const NON_EN_LANGUAGES = LANGUAGES.filter((l) => l.code !== "en");

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("qirahub_user_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function useItemList(contentType: ContentTypeKey) {
  const posts = useListPosts({ limit: 200 }, { query: { enabled: contentType === "post" } });
  const products = useProducts({});
  const comparisons = useComparisons({});
  const categories = useListCategories({});

  if (contentType === "post") return (posts.data ?? []).map((p: any) => ({ id: p.id, label: p.title || `Post #${p.id}` }));
  if (contentType === "product") return (products.data ?? []).map((p: any) => ({ id: p.id, label: p.name || `Product #${p.id}` }));
  if (contentType === "comparison") return (comparisons.data ?? []).map((c: any) => ({ id: c.id, label: c.title || `Comparison #${c.id}` }));
  if (contentType === "category") return (categories.data ?? []).map((c: any) => ({ id: c.id, label: c.name || `Category #${c.id}` }));
  return [];
}

function getOriginalValue(item: any, field: string): string {
  if (!item) return "";
  const val = item[field];
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function useOriginalItem(contentType: ContentTypeKey, itemId: number | null) {
  const posts = useListPosts({ limit: 200 }, { query: { enabled: contentType === "post" && itemId != null } });
  const products = useProducts({});
  const comparisons = useComparisons({});
  const categories = useListCategories({});

  if (itemId == null) return null;
  if (contentType === "post") return (posts.data ?? []).find((p: any) => p.id === itemId) ?? null;
  if (contentType === "product") return (products.data ?? []).find((p: any) => p.id === itemId) ?? null;
  if (contentType === "comparison") return (comparisons.data ?? []).find((c: any) => c.id === itemId) ?? null;
  if (contentType === "category") return (categories.data ?? []).find((c: any) => c.id === itemId) ?? null;
  return null;
}

interface TranslationPanelProps {
  contentType: ContentTypeKey;
  itemId: number;
  originalItem: any;
}

function TranslationPanel({ contentType, itemId, originalItem }: TranslationPanelProps) {
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState(NON_EN_LANGUAGES[0].code);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [translatingLang, setTranslatingLang] = useState<string | null>(null);
  const [translatingAll, setTranslatingAll] = useState(false);
  const [allDoneCount, setAllDoneCount] = useState(0);

  const fields = CONTENT_CONFIG[contentType].fields;

  const { data: existingTranslations, isLoading: loadingTrans, refetch } = useGetTranslations(
    contentType,
    itemId,
    { query: { enabled: itemId != null } }
  );

  const upsertMutation = useUpsertTranslations();

  useEffect(() => {
    if (!existingTranslations) return;
    const forLang = existingTranslations.filter((t: any) => t.langCode === activeLang);
    const mapped: Record<string, string> = {};
    for (const t of forLang) mapped[t.field] = t.value;
    setFormValues(mapped);
  }, [existingTranslations, activeLang]);

  const handleSave = useCallback(async () => {
    const nonEmpty: Record<string, string> = {};
    for (const [k, v] of Object.entries(formValues)) {
      if (v && v.trim()) nonEmpty[k] = v.trim();
    }
    upsertMutation.mutate(
      { contentType, contentId: itemId, data: { langCode: activeLang, fields: nonEmpty } },
      {
        onSuccess: () => {
          refetch();
          toast({ title: "Translations saved", description: `Saved ${Object.keys(nonEmpty).length} field(s) for ${activeLang.toUpperCase()}` });
        },
        onError: () => {
          toast({ title: "Save failed", description: "Could not save translations.", variant: "destructive" });
        },
      }
    );
  }, [contentType, itemId, activeLang, formValues, upsertMutation, refetch, toast]);

  async function callAutoTranslate(lang: string): Promise<Record<string, string> | null> {
    const res = await fetch("/api/translations/auto-translate", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ contentType, contentId: itemId, targetLang: lang }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[lang] ?? null;
  }

  async function handleAutoTranslateCurrent() {
    setTranslatingLang(activeLang);
    try {
      const result = await callAutoTranslate(activeLang);
      if (!result) {
        toast({ title: "Auto-translate failed", description: "Could not translate content. Please try again.", variant: "destructive" });
        return;
      }
      setFormValues(result);
      await refetch();
      const langName = LANGUAGES.find((l) => l.code === activeLang)?.name || activeLang;
      toast({ title: `✨ Auto-translated to ${langName}`, description: `${Object.keys(result).length} fields translated and saved automatically.` });
    } catch {
      toast({ title: "Error", description: "Translation request failed.", variant: "destructive" });
    } finally {
      setTranslatingLang(null);
    }
  }

  async function handleTranslateAll() {
    setTranslatingAll(true);
    setAllDoneCount(0);
    let done = 0;
    for (const lang of NON_EN_LANGUAGES) {
      setTranslatingLang(lang.code);
      try {
        await callAutoTranslate(lang.code);
        done++;
        setAllDoneCount(done);
      } catch {}
      await new Promise((r) => setTimeout(r, 200));
    }
    setTranslatingLang(null);
    setTranslatingAll(false);
    await refetch();
    const forActive = existingTranslations?.filter((t: any) => t.langCode === activeLang) ?? [];
    if (forActive.length > 0) {
      const mapped: Record<string, string> = {};
      for (const t of forActive) mapped[t.field] = t.value;
      setFormValues(mapped);
    }
    toast({
      title: `✨ All ${NON_EN_LANGUAGES.length} languages translated!`,
      description: `Auto-translated and saved ${done} languages for this ${contentType}.`,
    });
    await refetch();
  }

  function countForLang(lang: string) {
    if (!existingTranslations) return 0;
    return existingTranslations.filter((t: any) => t.langCode === lang && t.value).length;
  }

  const isTranslatingCurrent = translatingLang === activeLang && !translatingAll;
  const activeLangInfo = LANGUAGES.find((l) => l.code === activeLang);

  return (
    <div className="flex flex-col h-full">
      {/* Translate All Banner */}
      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-2.5 shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Languages className="w-3.5 h-3.5 text-primary" />
          {translatingAll ? (
            <span className="text-primary font-medium animate-pulse">
              Translating… {allDoneCount}/{NON_EN_LANGUAGES.length} languages done
            </span>
          ) : (
            <span>One click to auto-translate into all 11 languages at once</span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
          onClick={handleTranslateAll}
          disabled={translatingAll || translatingLang !== null}
        >
          {translatingAll ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Translating all…</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" />Translate All 11 Languages</>
          )}
        </Button>
      </div>

      {/* Language tabs */}
      <div className="border-b border-border bg-muted/30 px-5 py-3 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {NON_EN_LANGUAGES.map((lang) => {
            const count = countForLang(lang.code);
            const total = fields.length;
            const isActive = activeLang === lang.code;
            const isComplete = count === total;
            const isPartial = count > 0 && count < total;
            const isThisTranslating = translatingLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : isComplete
                    ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                    : isPartial
                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {isThisTranslating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>{lang.flag}</span>
                )}
                <span>{lang.name}</span>
                {count > 0 && !isThisTranslating && (
                  <span className={`rounded-full px-1 text-[10px] font-bold ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : isComplete ? "bg-green-500/20 text-green-500" : "bg-orange-500/20 text-orange-500"}`}>
                    {count}/{total}
                  </span>
                )}
                {isComplete && !isActive && !isThisTranslating && (
                  <CheckCircle2 className="w-3 h-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {loadingTrans ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading translations…</span>
          </div>
        ) : isTranslatingCurrent ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-primary/40" />
              <Loader2 className="w-5 h-5 text-primary animate-spin absolute -bottom-1 -right-1" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Auto-translating to {activeLangInfo?.name}…</p>
              <p className="text-xs mt-1">Translating all {fields.length} fields using AI translation. This takes a few seconds.</p>
            </div>
          </div>
        ) : (
          fields.map((field) => {
            const original = getOriginalValue(originalItem, field.key);
            const translation = formValues[field.key] ?? "";
            return (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">{field.label}</label>
                  {field.hint && <span className="text-xs text-muted-foreground">{field.hint}</span>}
                </div>
                {original && (
                  <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-md px-3 py-2 leading-relaxed">
                    <span className="font-medium text-muted-foreground/70 mr-1">EN:</span>
                    {original.length > 200 ? original.slice(0, 200) + "…" : original}
                  </div>
                )}
                {field.type === "text" && (
                  <Input
                    value={translation}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={`${activeLang.toUpperCase()} translation…`}
                    className="text-sm"
                    dir={activeLang === "ar" ? "rtl" : "ltr"}
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    value={translation}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={`${activeLang.toUpperCase()} translation…`}
                    rows={3}
                    className="text-sm resize-none"
                    dir={activeLang === "ar" ? "rtl" : "ltr"}
                  />
                )}
                {field.type === "textarea-lg" && (
                  <Textarea
                    value={translation}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={`${activeLang.toUpperCase()} translation…`}
                    rows={8}
                    className="text-sm font-mono"
                    dir={activeLang === "ar" ? "rtl" : "ltr"}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-muted/20 shrink-0 gap-3">
        <div className="text-xs text-muted-foreground">
          {activeLangInfo?.flag}{" "}
          Editing <strong className="text-foreground">{activeLangInfo?.name}</strong> translations
          {activeLang === "ar" && <span className="ml-2 text-orange-500 font-medium">(RTL language)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoTranslateCurrent}
            disabled={isTranslatingCurrent || translatingAll || translatingLang !== null}
            className="gap-1.5 text-xs h-8 border-primary/40 text-primary hover:bg-primary/10"
          >
            {isTranslatingCurrent ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Translating…</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" />Auto Translate</>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={upsertMutation.isPending || isTranslatingCurrent || translatingAll}
            className="gap-1.5 text-xs h-8"
          >
            {upsertMutation.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
            ) : (
              <><Save className="w-3.5 h-3.5" />Save {activeLang.toUpperCase()}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTranslations() {
  const [contentType, setContentType] = useState<ContentTypeKey>("post");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const items = useItemList(contentType);
  const originalItem = useOriginalItem(contentType, selectedItemId);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleTypeChange(type: ContentTypeKey) {
    setContentType(type);
    setSelectedItemId(null);
    setSearch("");
  }

  const contentTypes: { key: ContentTypeKey; label: string; icon: React.ReactNode }[] = [
    { key: "post", label: "Posts", icon: <FileText className="w-4 h-4" /> },
    { key: "product", label: "Products", icon: <Package className="w-4 h-4" /> },
    { key: "comparison", label: "Comparisons", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "category", label: "Categories", icon: <Folder className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Translation Management</h1>
            <Badge variant="outline" className="text-xs gap-1 ml-1 text-primary border-primary/30">
              <Sparkles className="w-3 h-3" />
              Auto-Translate
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Select a content item, pick a language, and click <strong className="text-foreground">Auto Translate</strong> — all fields are translated and saved instantly. Or use <strong className="text-foreground">Translate All 11 Languages</strong> to do everything at once.
          </p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 border-r border-border bg-card flex flex-col shrink-0">
            <div className="p-3 border-b border-border bg-muted/30">
              <div className="grid grid-cols-2 gap-1">
                {contentTypes.map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => handleTypeChange(ct.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      contentType === ct.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {ct.icon}
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${CONTENT_CONFIG[contentType].label.toLowerCase()}…`}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">No items found</div>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-border/60 flex items-center justify-between gap-2 transition-colors ${
                      selectedItemId === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {selectedItemId === item.id && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-primary" />}
                  </button>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center">
              {filtered.length} {CONTENT_CONFIG[contentType].label.toLowerCase()}
            </div>
          </div>

          {/* Main panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedItemId == null ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-4 px-8">
                <div className="relative">
                  <Globe className="w-12 h-12 text-muted-foreground/20" />
                  <Sparkles className="w-5 h-5 text-primary/40 absolute -top-1 -right-1" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">Select an item to translate</p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Choose a {CONTENT_CONFIG[contentType].label.toLowerCase().slice(0, -1)} from the list, then auto-translate into any language with one click.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {NON_EN_LANGUAGES.map((l) => (
                    <span key={l.code} className="text-lg" title={l.name}>{l.flag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="px-5 py-3 border-b border-border bg-muted/20 shrink-0 flex items-center gap-2">
                  {CONTENT_CONFIG[contentType].icon}
                  <span className="font-semibold text-foreground text-sm truncate">
                    {items.find((i) => i.id === selectedItemId)?.label}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    ID #{selectedItemId}
                  </Badge>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TranslationPanel
                    key={`${contentType}-${selectedItemId}`}
                    contentType={contentType}
                    itemId={selectedItemId}
                    originalItem={originalItem}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
