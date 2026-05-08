import { Layout } from "@/components/layout/Layout";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronRight, Zap } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getCategoryTheme } from "@/lib/category-colors";

export default function CategoryList() {
  const { langCode, t } = useTranslation();
  const { data: categories, isLoading } = useListCategories({ includePostCount: true, lang: langCode });

  return (
    <Layout>
      <div className="py-8 px-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
          <ChevronRight className="w-3 h-3 mx-1.5" />
          <span className="text-foreground font-medium">{t("categories")}</span>
        </div>

        {/* Heading */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #00e5ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("browseByCategory")}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{t("categoriesSubtitle")}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-card border border-card-border rounded-xl p-6 h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories?.map((cat, i) => {
              const theme = getCategoryTheme(cat.name, i);
              return (
                <Link key={cat.id} href={`/categories/${cat.slug}`}>
                  <div
                    className="bg-card border border-card-border rounded-xl p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden group"
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
                  >
                    {/* Background glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      style={{ background: `radial-gradient(ellipse at 20% 50%, ${theme.bg} 0%, transparent 70%)` }}
                    />

                    {/* Top accent stripe */}
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }}
                    />

                    {/* Icon */}
                    <div
                      className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
                    >
                      <Zap className="w-5 h-5" style={{ color: theme.accentHex }} />
                    </div>

                    {/* Text */}
                    <div className="relative flex-1 min-w-0">
                      <h2
                        className="text-base font-bold text-foreground mb-1 truncate group-hover:transition-colors"
                        style={{ ["--hover-color" as any]: theme.accentHex }}
                      >
                        <span className="group-hover:text-[--hover-color] transition-colors" style={{ ["--hover-color" as any]: theme.accentHex }}>
                          {cat.name}
                        </span>
                      </h2>
                      <p className="text-xs text-muted-foreground mb-2.5 line-clamp-1">
                        {cat.description || cat.name}
                      </p>
                      <span
                        className="inline-block px-2.5 py-1 text-xs font-bold rounded-full section-label"
                        style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
                      >
                        {cat.postCount || 0} {t("articles")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
