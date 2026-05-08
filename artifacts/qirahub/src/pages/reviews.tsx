import { Layout } from "@/components/layout/Layout";
import { useProducts } from "@/lib/api-hooks";
import { useListCategories } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  ChevronRight, Star, ArrowRight, Trophy, Medal, ExternalLink,
  Shield, Zap, Globe, Key, Package, Check, X, BarChart3, Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { getCategoryTheme } from "@/lib/category-colors";
import { AdSlot } from "@/components/ads/AdSlot";
import { useState } from "react";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/25"}`}
        />
      ))}
      <span className="text-sm font-bold text-foreground ml-1.5">{rating.toFixed(1)}</span>
    </div>
  );
}

function getCategoryIcon(name: string) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("ai") || lower.includes("tool")) return <Zap className="w-4 h-4" />;
  if (lower.includes("vpn") || lower.includes("privacy")) return <Shield className="w-4 h-4" />;
  if (lower.includes("host")) return <Globe className="w-4 h-4" />;
  if (lower.includes("password")) return <Key className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
}

function ProductCard({ product, index, categoryName }: { product: any; index: number; categoryName?: string }) {
  const [, navigate] = useLocation();
  const theme = getCategoryTheme(categoryName || "", index);
  const isTopPick = index === 0;
  const isMedal = index === 1 || index === 2;

  return (
    <article
      className="group relative bg-card border border-card-border rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${product.slug}`)}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
    >
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }} />

        {/* Image area */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `radial-gradient(ellipse at center, ${theme.bg} 0%, transparent 70%)` }}
            >
              <div style={{ color: theme.accentHex, opacity: 0.5 }} className="scale-150">
                {getCategoryIcon(categoryName || "")}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

          {/* Rank badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {isTopPick ? (
              <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Trophy className="w-3 h-3" /> Top Pick
              </span>
            ) : isMedal ? (
              <span className="flex items-center gap-1 bg-muted/80 text-muted-foreground border border-border text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Medal className="w-3 h-3" /> #{index + 1}
              </span>
            ) : null}
          </div>

          {/* Rating badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border/60 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-foreground">{product.rating?.toFixed(1) || "N/A"}</span>
          </div>

          {/* Category badge */}
          {categoryName && (
            <span
              className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}`, backdropFilter: "blur(8px)" }}
            >
              {categoryName}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>

          <StarRating rating={product.rating || 0} size="md" />

          {product.pricing && (
            <p className="text-sm font-bold text-primary mt-2">{product.pricing}</p>
          )}

          {product.shortDescription && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Pros/Cons preview */}
          {((product.pros?.length > 0) || (product.cons?.length > 0)) && (
            <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-3">
              {product.pros?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-green-500 uppercase tracking-wider mb-1">Pros</p>
                  {product.pros.slice(0, 2).map((pro: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 text-[11px] text-foreground">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      <span className="leading-snug line-clamp-1">{pro}</span>
                    </div>
                  ))}
                </div>
              )}
              {product.cons?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Cons</p>
                  {product.cons.slice(0, 2).map((con: string, i: number) => (
                    <div key={i} className="flex items-start gap-1 text-[11px] text-foreground">
                      <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                      <span className="leading-snug line-clamp-1">{con}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/60 mt-auto">
            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all flex-1">
              Full Review <ArrowRight className="w-3 h-3" />
            </span>
            {product.websiteUrl && (
              <a
                href={product.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5">
                  Visit <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            )}
          </div>
        </div>
    </article>
  );
}

export default function Reviews() {
  const { t, langCode } = useTranslation();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "rank">("rating");

  const { data: products, isLoading } = useProducts({ lang: langCode });
  const { data: categories } = useListCategories({});

  const categoriesWithProducts = (categories || []).filter((c: any) =>
    (products || []).some((p: any) => p.categoryId === c.id)
  );

  const categoryMap = Object.fromEntries(
    (categories || []).map((c: any) => [c.id, c.name])
  );

  const filtered = (products || [])
    .filter(p => activeCategoryId ? p.categoryId === activeCategoryId : true)
    .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : a.rank - b.rank);

  return (
    <Layout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{t("reviews")}</span>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-primary" />
            Expert Product Reviews
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 leading-tight">
            {t("reviews")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            In-depth, unbiased reviews of the best software, VPNs, AI tools, and more — with ratings, pros, cons, and pricing.
          </p>
        </div>

        {/* Filters */}
        {(categoriesWithProducts.length > 0 || !isLoading) && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setActiveCategoryId(null)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategoryId === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                All ({(products || []).length})
              </button>
              {categoriesWithProducts.map((cat: any) => {
                const count = (products || []).filter((p: any) => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
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
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
              <button
                onClick={() => setSortBy("rating")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === "rating" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                By Rating
              </button>
              <button
                onClick={() => setSortBy("rank")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortBy === "rank" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                By Rank
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-2xl bg-muted/20">
            <Star className="w-12 h-12 text-muted-foreground/25 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{t("noReviewsFound")}</h3>
            <p className="text-muted-foreground mb-5">No products found. Check back soon.</p>
            <Link href="/admin/products">
              <Button variant="outline" size="sm">Add Products in Admin</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                categoryName={categoryMap[product.categoryId] || ""}
              />
            ))}
          </div>
        )}

        <AdSlot page="reviews" position="between_posts" className="mt-6" label />

        {/* Compare CTA */}
        {filtered.length > 1 && (
          <div className="mt-14 bg-card border border-card-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Compare Products Side-by-Side</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Use our interactive compare tool to select any products and instantly see a detailed feature-by-feature comparison.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/compare-tool">
                <Button className="gap-2 font-semibold">
                  <BarChart3 className="w-4 h-4" /> Compare Now
                </Button>
              </Link>
              <Link href="/comparisons">
                <Button variant="outline" className="gap-2">
                  <Scale className="w-4 h-4" /> Browse Comparisons
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
