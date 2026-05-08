import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useSiteTheme } from "@/components/SiteThemeProvider";
import { SITE_THEMES, SiteThemeDef } from "@/lib/site-theme";
import { Check, Palette, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function ThemePreviewCard({ theme }: { theme: SiteThemeDef }) {
  const isDark = theme.type === "dark";

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden flex flex-col"
      style={{ background: theme.bgHex }}
    >
      {/* Mini browser chrome */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b"
        style={{
          background: isDark
            ? `color-mix(in srgb, ${theme.bgHex} 60%, white 5%)`
            : `color-mix(in srgb, ${theme.bgHex} 80%, black 10%)`,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)",
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff5f57" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#febc2e" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#28c840" }} />
        <div
          className="flex-1 mx-1 h-2 rounded-sm"
          style={{
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
          }}
        />
      </div>

      {/* Content mockup */}
      <div className="flex flex-1 gap-1.5 p-1.5" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <div
          className="flex flex-col gap-1 p-1 rounded"
          style={{
            width: 28,
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.07)",
          }}
        >
          <div className="h-1.5 rounded-sm" style={{ background: theme.primaryHex, width: "90%" }} />
          <div className="h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
          <div className="h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
          <div className="h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)" }} />
          <div className="h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)" }} />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Hero bar */}
          <div
            className="h-3 rounded flex items-center px-1.5 gap-1"
            style={{
              background: theme.cardHex,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            <div className="h-1.5 w-1.5 rounded-sm" style={{ background: theme.primaryHex }} />
            <div className="flex-1 h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" }} />
          </div>
          {/* Cards */}
          <div className="grid grid-cols-2 gap-1 flex-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded flex flex-col gap-0.5 p-1"
                style={{
                  background: theme.cardHex,
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <div
                  className="h-1.5 rounded-sm"
                  style={{
                    background: i === 0 ? theme.primaryHex : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"),
                    width: i === 0 ? "70%" : "55%",
                  }}
                />
                <div className="h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }} />
                <div className="h-1 rounded-sm" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", width: "80%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAppearance() {
  const { themeId, setAndSaveTheme } = useSiteTheme();
  const [pending, setPending] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string>(themeId);

  // Track the last confirmed selection to know if we need to save
  const isDirty = selected !== themeId;

  function handleSelect(id: string) {
    setSelected(id);
    // Instantly preview the theme
    import("@/lib/site-theme").then(({ applyTheme }) => applyTheme(id));
  }

  async function handleSave() {
    if (!isDirty && selected === themeId) return;
    setSaving(true);
    try {
      await setAndSaveTheme(selected);
      toast({
        title: "Theme saved",
        description: `${SITE_THEMES.find(t => t.id === selected)?.name} is now active site-wide.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err?.message ?? "Could not save theme to database.",
        variant: "destructive",
      });
      // Revert preview to saved theme
      import("@/lib/site-theme").then(({ applyTheme }) => applyTheme(themeId));
      setSelected(themeId);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Choose a site-wide theme — every visitor sees the same look instantly.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || selected === themeId}
            className="shrink-0 gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Save Theme"}
          </Button>
        </div>

        {/* Theme grid */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
            Select a Theme
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SITE_THEMES.map((theme) => {
              const isActive = selected === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  data-testid={`theme-card-${theme.id}`}
                  className={cn(
                    "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-primary/40"
                  )}
                  style={isActive ? { boxShadow: `0 0 0 1px ${theme.primaryHex}30, 0 8px 32px ${theme.primaryHex}20` } : {}}
                >
                  {/* Preview */}
                  <div className="h-36 w-full p-2 bg-muted">
                    <ThemePreviewCard theme={theme} />
                  </div>

                  {/* Label strip */}
                  <div
                    className={cn(
                      "px-3 py-2.5 border-t flex items-center gap-2 bg-card",
                      isActive ? "border-primary/30" : "border-border"
                    )}
                  >
                    <span className="text-base leading-none">{theme.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {theme.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{theme.type}</p>
                    </div>

                    {/* Color dot */}
                    <div
                      className="w-4 h-4 rounded-full shrink-0 ring-2 ring-border"
                      style={{ background: theme.primaryHex }}
                    />

                    {/* Check mark */}
                    {isActive && (
                      <span
                        className="absolute top-2 right-2 rounded-full p-0.5 shadow"
                        style={{ background: theme.primaryHex }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected theme detail card */}
        {(() => {
          const t = SITE_THEMES.find(d => d.id === selected);
          if (!t) return null;
          return (
            <div
              className="rounded-2xl border-2 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{
                borderColor: `${t.primaryHex}40`,
                background: `color-mix(in srgb, ${t.bgHex} 85%, transparent)`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${t.primaryHex}20` }}
              >
                {t.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full" style={{ background: t.primaryHex }} />
                    <span className="text-xs text-muted-foreground font-mono">{t.primaryHex}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-border" style={{ background: t.bgHex }} />
                    <span className="text-xs text-muted-foreground font-mono">{t.bgHex}</span>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${t.primaryHex}18`,
                      color: t.primaryHex,
                    }}
                  >
                    {t.type.toUpperCase()}
                  </span>
                </div>
              </div>
              {selected !== themeId && (
                <div className="text-xs text-muted-foreground italic shrink-0">
                  Previewing — save to apply
                </div>
              )}
              {selected === themeId && (
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
                  style={{ background: `${t.primaryHex}18`, color: t.primaryHex }}
                >
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}
            </div>
          );
        })()}

        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-2">
          <Palette className="w-3.5 h-3.5" />
          Changes are saved to the database and apply site-wide for all visitors immediately.
        </p>
      </div>
    </AdminLayout>
  );
}
