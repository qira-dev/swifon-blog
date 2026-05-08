import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useGetPostsPerCategory, useGetRecentPosts, useGetFeaturedPosts } from "@workspace/api-client-react";
import { useProducts, useComparisons, useSiteSetting, useCoupons, type Coupon } from "@/lib/api-hooks";
import { ArrowRight, Clock, Zap, Star, Shield, Globe, Cpu, Layout as LayoutIcon, Key, Package, Scale, BarChart3, Check, X, Trophy, Ticket, Tag, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { CategorySlider } from "@/components/CategorySlider";
import { getCategoryTheme } from "@/lib/category-colors";
import { AdSlot } from "@/components/ads/AdSlot";

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("ai") || lower.includes("tool")) return <Zap className="w-5 h-5" />;
  if (lower.includes("vpn") || lower.includes("privacy")) return <Shield className="w-5 h-5" />;
  if (lower.includes("host")) return <Globe className="w-5 h-5" />;
  if (lower.includes("password")) return <Key className="w-5 h-5" />;
  if (lower.includes("cpu") || lower.includes("hardware")) return <Cpu className="w-5 h-5" />;
  if (lower.includes("software")) return <Package className="w-5 h-5" />;
  if (lower.includes("review")) return <Star className="w-5 h-5" />;
  return <LayoutIcon className="w-5 h-5" />;
}

function PostCard({ post, index }: { post: any; index: number }) {
  const { t } = useTranslation();
  const theme = getCategoryTheme(post.categoryName, index);
  return (
    <Link href={`/blog/${post.slug}`} data-testid={`link-post-${post.id}`}>
      <article
        className={`group relative bg-card border border-card-border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 ${theme.glowClass}`}
        style={{ "--tw-ring-color": theme.accentHex } as any}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10"
          style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }} />
        <div className="aspect-video w-full overflow-hidden relative bg-card">
          {post.featuredImageUrl ? (
            <img src={post.featuredImageUrl} alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `radial-gradient(ellipse at center, ${theme.bg} 0%, transparent 70%)` }}>
              <div style={{ color: theme.accentHex, opacity: 0.4 }}>{getCategoryIcon(post.categoryName || "")}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
          <span className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded section-label"
            style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}`, backdropFilter: "blur(8px)" }}>
            {post.categoryName || "Article"}
          </span>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-base leading-snug text-foreground mb-2 line-clamp-2 transition-colors duration-200"
            style={{ ["--hover-color" as any]: theme.accentHex }}>
            <span className="group-hover:text-[--hover-color] transition-colors" style={{ ["--hover-color" as any]: theme.accentHex }}>
              {post.title}
            </span>
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
            {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 110) + '…'}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-card-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {post.readTimeMinutes || Math.max(1, Math.ceil(post.content.length / 1000))} {t("minRead")}
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function CategoryCard({ category, index }: { category: any; index: number }) {
  const { t } = useTranslation();
  const theme = getCategoryTheme(category.categoryName, index);
  return (
    <Link href={`/categories/${category.categorySlug}`} data-testid={`link-category-${category.categoryId}`}>
      <div
        className="group relative bg-card border border-card-border rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 cursor-pointer h-32 overflow-hidden"
        onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
          style={{ background: `radial-gradient(ellipse at center, ${theme.bg} 0%, transparent 70%)` }} />
        <div className="relative w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
          style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}>
          {getCategoryIcon(category.categoryName)}
        </div>
        <h3 className="relative font-bold text-sm text-foreground leading-tight mb-1">{category.categoryName}</h3>
        <span className="relative text-xs text-muted-foreground">{category.postCount || 0} {(category.postCount || 0) === 1 ? "post" : t("posts")}</span>
      </div>
    </Link>
  );
}

function ProductReviewCard({ product, index }: { product: any; index: number }) {
  const { t } = useTranslation();
  const theme = getCategoryTheme("", index);
  return (
    <Link href={`/product/${product.slug}`}>
      <div
        className="group relative bg-card border border-card-border rounded-xl p-5 flex flex-col h-full transition-all duration-300 cursor-pointer overflow-hidden"
        onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }} />

        <div className="flex items-start gap-3 mb-3">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name}
              className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-lg font-black"
              style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}>
              {product.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {index === 0 && <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
              <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
              ))}
              <span className="text-xs font-bold text-foreground ml-1">{product.rating?.toFixed(1)}</span>
            </div>
          </div>
          {product.pricing && (
            <span className="text-xs font-bold text-primary shrink-0 ml-auto">
              {product.pricing}
            </span>
          )}
        </div>

        {product.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {(product.pros?.length > 0 || product.cons?.length > 0) && (
          <div className="flex gap-4 mt-auto pt-3 border-t border-border/60">
            {product.pros?.length > 0 && (
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-green-500 mb-1">{t("pros").toUpperCase()}</p>
                {product.pros.slice(0, 2).map((pro: string, i: number) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-foreground">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" /> {pro}
                  </div>
                ))}
              </div>
            )}
            {product.cons?.length > 0 && (
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-red-400 mb-1">{t("cons").toUpperCase()}</p>
                {product.cons.slice(0, 2).map((con: string, i: number) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-foreground">
                    <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" /> {con}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function ComparisonDemoCard({ comparison, index }: { comparison: any; index: number }) {
  const { t } = useTranslation();
  const theme = getCategoryTheme("", index);
  return (
    <Link href={`/compare/${comparison.slug}`}>
      <div
        className="group bg-card border border-card-border rounded-xl p-5 flex flex-col transition-all duration-300 cursor-pointer h-full overflow-hidden relative"
        onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }} />
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}>
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {comparison.title}
          </h3>
        </div>
        {comparison.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {comparison.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
          <span>{(comparison.productIds || []).length} {t("productsCompared")}</span>
          <span className="text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            {t("view")} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

const COUPON_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  percentage:    { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", border: "rgba(34,197,94,0.3)" },
  fixed:         { bg: "rgba(59,130,246,0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  free_trial:    { bg: "rgba(168,85,247,0.12)", text: "#c084fc", border: "rgba(168,85,247,0.3)" },
  free_shipping: { bg: "rgba(6,182,212,0.12)",  text: "#22d3ee", border: "rgba(6,182,212,0.3)" },
  bogo:          { bg: "rgba(249,115,22,0.12)", text: "#fb923c", border: "rgba(249,115,22,0.3)" },
  other:         { bg: "rgba(100,116,139,0.12)",text: "#94a3b8", border: "rgba(100,116,139,0.3)" },
};

function HomeCouponCard({ coupon }: { coupon: Coupon }) {
  const { t } = useTranslation();
  const typeColor = COUPON_TYPE_COLORS[coupon.type] || COUPON_TYPE_COLORS.other;
  const discountLabel = coupon.discount
    ? (coupon.type === "percentage" ? `${coupon.discount} OFF` : coupon.discount)
    : coupon.type === "free_trial" ? "Free Trial"
    : coupon.type === "free_shipping" ? "Free Shipping"
    : coupon.type === "bogo" ? "BOGO"
    : "Deal";

  return (
    <Link href="/coupons">
      <div className="group relative bg-card border border-card-border rounded-xl p-4 flex gap-3 items-start h-full transition-all duration-300 cursor-pointer overflow-hidden hover:border-primary/40"
        style={{ ["--hover-shadow" as any]: "0 0 0 1px rgba(var(--primary-rgb),0.2), 0 4px 20px rgba(var(--primary-rgb),0.1)" }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${typeColor.text}, transparent)` }} />

        {/* Logo or icon */}
        <div className="shrink-0">
          {coupon.logoUrl ? (
            <img src={coupon.logoUrl} alt={coupon.title}
              className="w-11 h-11 rounded-lg object-contain bg-background border border-border p-1" />
          ) : (
            <div className="w-11 h-11 rounded-lg flex items-center justify-center text-base font-black shrink-0"
              style={{ background: typeColor.bg, color: typeColor.text, border: `1px solid ${typeColor.border}` }}>
              {coupon.title.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Discount badge + category */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[11px] font-black px-2 py-0.5 rounded-md"
              style={{ background: typeColor.bg, color: typeColor.text, border: `1px solid ${typeColor.border}` }}>
              {discountLabel}
            </span>
            <span className="text-[10px] text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">
              {coupon.category}
            </span>
            {coupon.isVerified && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-400">
                <ShieldCheck className="w-3 h-3" /> {t("verified")}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
            {coupon.title}
          </p>

          {/* Blurred code + reveal hint */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs text-foreground/80 select-none blur-sm tracking-widest">
                {coupon.code}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-primary shrink-0 flex items-center gap-0.5 group-hover:underline">
              {t("reveal")} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function useDemoEnabled(key: string): boolean {
  const { data } = useSiteSetting(key);
  if (!data) return true;
  return data.value !== "false";
}

export default function Home() {
  const { langCode, t } = useTranslation();
  const { data: recentPosts, isLoading: postsLoading } = useGetRecentPosts({ limit: 6, lang: langCode });
  const { data: featuredPosts } = useGetFeaturedPosts({ lang: langCode });
  const { data: categoriesData } = useGetPostsPerCategory({ lang: langCode });
  const { data: products } = useProducts({ lang: langCode });
  const { data: comparisons } = useComparisons({ lang: langCode });
  const { data: allCoupons } = useCoupons();

  const blogEnabled = useDemoEnabled("demo_blog_enabled");
  const reviewsEnabled = useDemoEnabled("demo_reviews_enabled");
  const comparisonsEnabled = useDemoEnabled("demo_comparisons_enabled");

  const featuredCoupons = (allCoupons || []).filter((c: Coupon) => c.isActive).slice(0, 6);

  const topPosts = featuredPosts || recentPosts || [];
  const topProducts = (products || [])
    .slice()
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, 6);
  const recentComparisons = (comparisons || []).slice(0, 6);

  return (
    <Layout>
      {/* Hero Slider */}
      <section className="px-4 mt-4 max-w-7xl mx-auto" data-testid="hero-carousel">
        <CategorySlider />
      </section>

      {/* Blog Posts Demo Section */}
      {blogEnabled && (
        <section className="py-14 px-4" data-testid="featured-posts-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-primary" />
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">{t("featuredPosts")}</h2>
              </div>
              <Link href="/blog" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity" data-testid="link-view-all-posts">
                {t("readMore")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {postsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-2/3" /><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topPosts.length === 0 ? (
              <div className="text-center py-16 border border-card-border rounded-xl text-muted-foreground">
                {t("noPostsYet")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {topPosts.slice(0, 6).map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <AdSlot page="home" position="inline" className="px-4 py-2 max-w-7xl mx-auto w-full" label />

      {/* Featured Coupons Section */}
      {featuredCoupons.length > 0 && (
        <section className="py-12 px-4 border-t border-card-border" data-testid="featured-coupons-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #4ade80, #22d3ee)" }} />
                <div>
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-green-400" />
                    {t("exclusiveCouponCodes")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("verifiedDealsDesc")}</p>
                </div>
              </div>
              <Link href="/coupons" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
                {t("allCoupons")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCoupons.map((coupon: Coupon) => (
                <HomeCouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>

            {/* CTA strip */}
            <div className="mt-5 p-4 bg-card border border-card-border rounded-xl flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t("saveWithPromoCodes")}</p>
                  <p className="text-xs text-muted-foreground">{t("clickToReveal")}</p>
                </div>
              </div>
              <Link href="/coupons">
                <Button className="gap-2 shrink-0" size="sm">
                  <Ticket className="w-4 h-4" /> {t("browseAllDeals")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Product Reviews Demo Section */}
      {reviewsEnabled && topProducts.length > 0 && (
        <section className="py-12 px-4 border-t border-card-border" data-testid="reviews-demo-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #f59e0b, #ef4444)" }} />
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">{t("topRatedProducts")}</h2>
              </div>
              <Link href="/reviews" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
                {t("seeAllReviews")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topProducts.map((product: any, i: number) => (
                <ProductReviewCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/compare-tool">
                <Button variant="outline" className="gap-2">
                  <Scale className="w-4 h-4" /> {t("compareProductsSideBySide")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Comparisons Demo Section */}
      {comparisonsEnabled && recentComparisons.length > 0 && (
        <section className="py-12 px-4 border-t border-card-border" data-testid="comparisons-demo-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">{t("featuredComparisons")}</h2>
              </div>
              <Link href="/comparisons" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
                {t("allComparisons")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentComparisons.map((comp: any, i: number) => (
                <ComparisonDemoCard key={comp.id} comparison={comp} index={i} />
              ))}
            </div>
            <div className="mt-6 p-5 bg-card border border-card-border rounded-xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-foreground text-sm">{t("compareAnyProducts")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("compareAnyProductsDesc")}</p>
              </div>
              <Link href="/compare-tool">
                <Button className="gap-2 shrink-0">
                  <BarChart3 className="w-4 h-4" /> {t("openCompareTool")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <AdSlot page="home" position="between_posts" className="px-4 py-2 max-w-7xl mx-auto w-full" label />

      {/* Browse by Category */}
      <section className="py-12 px-4 border-t border-card-border mb-12" data-testid="browse-categories-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #00e5ff, #a750ff)" }} />
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{t("browseByCategory")}</h2>
          </div>

          {categoriesData && categoriesData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoriesData.slice(0, 6).map((category, i) => (
                <CategoryCard key={category.categoryId} category={category} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {["AI Tools", "VPN", "Antivirus", "Hosting", "Password", "Software"].map((name, i) => (
                <div key={i} className="bg-card border border-card-border rounded-xl p-5 flex flex-col items-center text-center h-32">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                    {getCategoryIcon(name)}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
