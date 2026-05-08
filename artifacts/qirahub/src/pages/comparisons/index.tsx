import { Layout } from "@/components/layout/Layout";
import { useComparisons, useProducts } from "@/lib/api-hooks";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ChevronRight, ArrowRight, Scale, Zap, Sparkles } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-colors";
import { useState } from "react";

function ComparisonCard({ comparison, categories, products, index }: {
  comparison: any;
  categories: any[];
  products: any[];
  index: number;
}) {
  const category = categories.find((c: any) => c.id === comparison.categoryId);
  const theme = getCategoryTheme(category?.name || "", index);
  const comparedProducts = (comparison.productIds || [])
    .map((id: number) => products.find((p: any) => p.id === id))
    .filter(Boolean);

  return (
    <Link href={`/compare/${comparison.slug}`}>
      <div
        className="group relative bg-card border border-card-border rounded-xl p-5 h-full flex flex-col transition-all duration-300 cursor-pointer overflow-hidden"
        onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }}
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${theme.bg} 0%, transparent 60%)` }}
        />

        <div className="relative flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
          >
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {category && (
              <Badge
                variant="outline"
                className="text-[10px] mb-1.5 font-semibold"
                style={{ color: theme.accentHex, borderColor: theme.border, background: theme.bg }}
              >
                {category.name}
              </Badge>
            )}
            <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {comparison.title}
            </h3>
          </div>
        </div>

        {comparison.description && (
          <p className="relative text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {comparison.description}
          </p>
        )}

        {comparedProducts.length > 0 && (
          <div className="relative flex flex-wrap gap-1.5 mb-4">
            {comparedProducts.slice(0, 4).map((p: any) => (
              <span
                key={p.id}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
              >
                {p.name}
              </span>
            ))}
            {comparedProducts.length > 4 && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{comparedProducts.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="relative mt-auto flex items-center justify-between pt-3 border-t border-border/60">
          <span className="text-xs text-muted-foreground">
            {(comparison.productIds || []).length} products
          </span>
          <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            View Comparison <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ComparisonsPage() {
  const { langCode } = useTranslation();
  const { data: comparisons, isLoading: comparisonsLoading } = useComparisons({ lang: langCode });
  const { data: categories } = useListCategories({});
  const { data: products } = useProducts({ lang: langCode });
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const categoriesWithComparisons = (categories || []).filter((c: any) =>
    (comparisons || []).some((comp: any) => comp.categoryId === c.id)
  );

  const filtered = activeCategoryId
    ? (comparisons || []).filter((c: any) => c.categoryId === activeCategoryId)
    : (comparisons || []);

  return (
    <Layout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Comparisons</span>
        </div>

        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            <Scale className="w-4 h-4" />
            Side-by-Side Comparisons
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
            Find the Best Product<br />for Your Needs
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Detailed comparisons of top products across categories — features, pricing, pros & cons.
          </p>
          <Link href="/compare-tool" className="inline-block mt-6">
            <Button className="gap-2 h-11 px-6 font-semibold">
              <Zap className="w-4 h-4" />
              Interactive Compare Tool
            </Button>
          </Link>
        </div>

        {categoriesWithComparisons.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveCategoryId(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategoryId === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              All ({(comparisons || []).length})
            </button>
            {categoriesWithComparisons.map((cat: any) => {
              const count = (comparisons || []).filter((c: any) => c.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeCategoryId === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {comparisonsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-5 space-y-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-2xl bg-muted/20">
            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-1">No comparisons yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Check back soon, or use our interactive compare tool to build your own comparison.
            </p>
            <Link href="/compare-tool">
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" /> Try Compare Tool
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((comparison: any, i: number) => (
              <ComparisonCard
                key={comparison.id}
                comparison={comparison}
                categories={categories || []}
                products={products || []}
                index={i}
              />
            ))}
          </div>
        )}

        <div className="mt-16 bg-card border border-card-border rounded-2xl p-8 text-center">
          <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground mb-2">Build Your Own Comparison</h2>
          <p className="text-muted-foreground text-sm mb-5 max-w-lg mx-auto">
            Use our interactive tool to select any products and instantly see a detailed side-by-side comparison.
          </p>
          <Link href="/compare-tool">
            <Button className="gap-2 font-semibold">
              <Scale className="w-4 h-4" /> Open Compare Tool
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
