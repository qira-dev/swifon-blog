import { Layout } from "@/components/layout/Layout";
import { useListPosts, useListCategories, getListPostsQueryKey } from "@workspace/api-client-react";
import { useProductsByCategorySlug, useComparisonsByCategoryId } from "@/lib/api-hooks";
import { useParams, Link } from "wouter";
import { ChevronRight, Clock, Star, Check, X, ArrowRight, BarChart3, Trophy, Medal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { getCategoryTheme } from "@/lib/category-colors";

function StarRating({ rating, accentHex }: { rating: number; accentHex: string }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="w-4 h-4"
          style={{
            fill: i <= Math.round(rating) ? accentHex : "transparent",
            color: i <= Math.round(rating) ? accentHex : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
      <span className="text-sm font-bold ml-1 text-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

function RankBadge({ rank, theme }: { rank: number; theme: ReturnType<typeof getCategoryTheme> }) {
  const icons: Record<number, React.ReactNode> = {
    1: <Trophy className="w-3.5 h-3.5" />,
    2: <Medal className="w-3.5 h-3.5" />,
    3: <Medal className="w-3.5 h-3.5" />,
  };
  return (
    <div
      className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
      style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
    >
      {icons[rank] || <Zap className="w-3 h-3" />}
      <span>#{rank}</span>
    </div>
  );
}

export default function CategoryDetail() {
  const { slug } = useParams();
  const { langCode, t } = useTranslation();

  const { data: categories } = useListCategories({ lang: langCode });
  const category = categories?.find(c => c.slug === slug);
  const theme = getCategoryTheme(category?.name || slug);

  const { data: productData, isLoading: productsLoading } = useProductsByCategorySlug(slug, langCode);
  const products = productData?.products || [];
  const hasProducts = products.length > 0;

  const { data: comparisons } = useComparisonsByCategoryId(category?.id, langCode);

  const queryParams = { categoryId: category?.id, limit: 20, lang: langCode };
  const { data: posts, isLoading: postsLoading } = useListPosts(queryParams, {
    query: {
      enabled: !!category?.id,
      queryKey: getListPostsQueryKey(queryParams),
    }
  });

  return (
    <Layout>
      <div className="pb-16 max-w-7xl mx-auto">

        {/* Hero header */}
        <div
          className="relative px-4 pt-10 pb-12 md:pt-14 md:pb-16 overflow-hidden border-b border-card-border"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${theme.bg} 0%, transparent 80%)` }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
            <ChevronRight className="w-3 h-3 mx-1.5" />
            <Link href="/categories" className="hover:text-foreground transition-colors">{t("categories")}</Link>
            <ChevronRight className="w-3 h-3 mx-1.5" />
            <span style={{ color: theme.accentHex }}>{category?.name || slug}</span>
          </div>

          {/* Category label */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold section-label mb-4"
            style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
          >
            <Zap className="w-3.5 h-3.5" />
            Category
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-6xl font-extrabold leading-none mb-4 tracking-tight"
            style={{
              background: `linear-gradient(135deg, #ffffff 0%, ${theme.accentHex} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {category?.name || "Loading..."}
          </h1>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            {category?.description || `Explore all articles, tutorials, and guides in the ${category?.name || ""} category.`}
          </p>

          {/* Stat badges */}
          {hasProducts && (
            <div className="mt-6 flex gap-3 flex-wrap">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold section-label"
                style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
              >
                {products.length} {t("productsReviewed")}
              </span>
              {comparisons && comparisons.length > 0 && (
                <Link href={`/compare/${comparisons[0].slug}`}>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold section-label bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {t("viewComparison")}
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="px-4 pt-10">

          {/* Top Products */}
          {hasProducts && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full" style={{ background: theme.accentHex }} />
                  <div>
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">{t("top5Picks")}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("expertRated")}</p>
                  </div>
                </div>
                {comparisons && comparisons.length > 0 && (
                  <Link href={`/compare/${comparisons[0].slug}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-card-border text-foreground hover:bg-card"
                      style={{ borderColor: theme.border, color: theme.accentHex }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> {t("compareAll")}
                    </Button>
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-card border border-card-border rounded-xl overflow-hidden transition-all duration-300"
                    style={index === 0 ? { boxShadow: theme.glow, borderColor: theme.border } : {}}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = index === 0 ? theme.glow : "")}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div
                        className="md:w-56 lg:w-72 flex items-center justify-center p-6 shrink-0"
                        style={{ background: theme.bg }}
                      >
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-44 object-cover rounded-lg" />
                        ) : (
                          <div
                            className="w-full h-44 rounded-lg flex items-center justify-center"
                            style={{ background: `rgba(255,255,255,0.04)`, border: `1px solid ${theme.border}` }}
                          >
                            <span className="text-xs text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 md:p-7">
                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <RankBadge rank={product.rank} theme={theme} />
                            <h3 className="text-lg font-extrabold text-foreground">{product.name}</h3>
                          </div>
                          {product.pricing && (
                            <span
                              className="text-xs font-bold px-3 py-1.5 rounded-full section-label"
                              style={{ background: theme.bg, color: theme.accentHex, border: `1px solid ${theme.border}` }}
                            >
                              {product.pricing}
                            </span>
                          )}
                        </div>

                        <StarRating rating={product.rating} accentHex={theme.accentHex} />

                        <p className="text-muted-foreground mt-3 mb-5 text-sm leading-relaxed">
                          {product.shortDescription || product.description?.substring(0, 200)}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-widest mb-2.5" style={{ color: "#00e676" }}>
                              {t("pros")}
                            </h4>
                            <ul className="space-y-1.5">
                              {(product.pros || []).slice(0, 3).map((pro, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#00e676" }} />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-widest mb-2.5" style={{ color: "#ff4757" }}>
                              {t("cons")}
                            </h4>
                            <ul className="space-y-1.5">
                              {(product.cons || []).slice(0, 3).map((con, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                  <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ff4757" }} />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          <Link href={`/product/${product.slug}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-card-border text-foreground hover:bg-card"
                              style={{ borderColor: theme.border }}
                            >
                              {t("fullReview")} <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                          </Link>
                          {product.websiteUrl && (
                            <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <Button
                                size="sm"
                                style={{ background: theme.accentHex, color: "#000", fontWeight: 700 }}
                                className="hover:opacity-90"
                              >
                                {t("visitWebsite")}
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Feature Comparison Table */}
          {hasProducts && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: theme.accentHex }} />
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">{t("quickComparison")}</h2>
              </div>
              <div className="bg-card border border-card-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: theme.bg }}>
                      <th className="text-left p-4 font-bold text-foreground border-b border-card-border sticky left-0 min-w-[140px]" style={{ background: theme.bg }}>
                        Feature
                      </th>
                      {products.map(p => (
                        <th key={p.id} className="text-center p-4 font-bold text-foreground border-b border-card-border min-w-[120px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <RankBadge rank={p.rank} theme={theme} />
                            <span className="text-xs mt-0.5">{p.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-card-border">
                      <td className="p-4 font-semibold text-muted-foreground sticky left-0 bg-card">Rating</td>
                      {products.map(p => (
                        <td key={p.id} className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold" style={{ color: theme.accentHex }}>
                            <Star className="w-4 h-4" style={{ fill: theme.accentHex, color: theme.accentHex }} />
                            {p.rating.toFixed(1)}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-card-border">
                      <td className="p-4 font-semibold text-muted-foreground sticky left-0 bg-card">Pricing</td>
                      {products.map(p => (
                        <td key={p.id} className="p-4 text-center font-bold" style={{ color: theme.accentHex }}>{p.pricing || "N/A"}</td>
                      ))}
                    </tr>
                    {Array.from(new Set(products.flatMap(p => Object.keys(p.features || {})))).map((key, i) => (
                      <tr key={key} className="border-b border-card-border last:border-b-0">
                        <td className="p-4 font-semibold text-muted-foreground sticky left-0 bg-card">{key}</td>
                        {products.map(p => (
                          <td key={p.id} className="p-4 text-center text-foreground/70 text-xs">
                            {(p.features || {})[key] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {comparisons && comparisons.length > 0 && (
                <div className="mt-5 text-center">
                  <Link href={`/compare/${comparisons[0].slug}`}>
                    <Button variant="outline" className="border-card-border" style={{ borderColor: theme.border, color: theme.accentHex }}>
                      View Full Comparison <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Articles */}
          <section>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-6 rounded-full" style={{ background: theme.accentHex }} />
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                {hasProducts ? "Related Articles" : "Articles"}
              </h2>
            </div>

            {postsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="bg-card border border-card-border rounded-xl h-[360px] animate-pulse"
                  />
                ))}
              </div>
            ) : posts?.length === 0 ? (
              <div
                className="text-center py-16 bg-card border border-card-border rounded-xl"
                style={{ borderColor: theme.border }}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: theme.bg }}>
                  <Zap className="w-6 h-6" style={{ color: theme.accentHex }} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">No articles yet</h3>
                <p className="text-muted-foreground text-sm">Check back later for content in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts?.map((post, i) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <article
                      className="group bg-card border border-card-border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300"
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
                    >
                      {/* Accent top stripe */}
                      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${theme.accentHex}, transparent)` }} />

                      {/* Image */}
                      <div className="aspect-video w-full overflow-hidden relative" style={{ background: theme.bg }}>
                        {post.featuredImageUrl ? (
                          <img
                            src={post.featuredImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-40">
                            <Zap className="w-8 h-8" style={{ color: theme.accentHex }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-base text-foreground mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                          {post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 110) + '…'}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-card-border mt-auto">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTimeMinutes || 5} min
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
