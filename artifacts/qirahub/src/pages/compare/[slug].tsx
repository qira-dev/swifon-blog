import { Layout } from "@/components/layout/Layout";
import { useComparisonBySlug } from "@/lib/api-hooks";
import { useParams, Link } from "wouter";
import { ChevronRight, Star, Check, X, Trophy, Medal, ArrowRight, ExternalLink, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-sm font-bold text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ComparisonPage() {
  const { slug } = useParams();
  const { langCode, t } = useTranslation();
  const { data, isLoading } = useComparisonBySlug(slug, langCode);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-16 px-4 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">{t("notFound")}</h1>
          <Link href="/comparisons"><Button>{t("categories")}</Button></Link>
        </div>
      </Layout>
    );
  }

  const { comparison, category, products } = data;
  const allFeatureKeys = Array.from(
    new Set(products.flatMap(p => Object.keys(p.features || {})))
  );

  return (
    <Layout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap gap-1">
          <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/comparisons" className="hover:text-foreground transition-colors">Comparisons</Link>
          <ChevronRight className="w-4 h-4" />
          {category && (
            <>
              <Link href={`/categories/${category.slug}`} className="hover:text-foreground transition-colors">{category.name}</Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-foreground font-medium">{t("comparison")}</span>
        </div>

        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 px-3 py-1.5 gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            {t("sideByComparison")}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{comparison.title}</h1>
          <p className="text-lg text-muted-foreground">{comparison.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`bg-card border rounded-xl p-5 text-center transition-all ${
                index === 0 ? "border-primary/30 ring-2 ring-primary/10" : "border-card-border"
              }`}
            >
              {index === 0 && (
                <Badge className="bg-primary text-primary-foreground mb-3">{t("bestOverall")}</Badge>
              )}
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3 border border-border" />
              )}
              <div className="flex justify-center gap-1.5 mb-2">
                {index === 0 ? <Trophy className="w-5 h-5 text-yellow-500" /> : index < 3 ? <Medal className="w-5 h-5 text-muted-foreground" /> : null}
                <span className="text-sm font-bold text-muted-foreground">#{product.rank}</span>
              </div>
              <h3 className="font-bold text-foreground mb-2">{product.name}</h3>
              <StarRating rating={product.rating} />
              <p className="text-primary font-semibold text-sm mt-2">{product.pricing}</p>
              <Link href={`/product/${product.slug}`}>
                <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                  {t("fullReview")}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-2xl overflow-hidden mb-12">
          <div className="bg-muted/40 p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">{t("featureComparison")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("compareAll")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-foreground sticky left-0 bg-muted/30 min-w-[160px]">{t("keyFeatures")}</th>
                  {products.map(p => (
                    <th key={p.id} className="text-center p-4 font-semibold text-foreground min-w-[140px]">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-card">{t("rating")}</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 justify-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-foreground">{p.rating.toFixed(1)}</span>
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-muted/20">{t("pricing")}</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-center font-semibold text-primary">{p.pricing || "N/A"}</td>
                  ))}
                </tr>
                {allFeatureKeys.map((key, i) => (
                  <tr key={key} className={`border-b border-border ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <td className={`p-4 font-medium text-muted-foreground sticky left-0 ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>{key}</td>
                    {products.map(p => {
                      const val = (p.features || {})[key] || "—";
                      const isYes = val.toLowerCase() === "yes";
                      const isNo = val.toLowerCase() === "no";
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {isYes ? (
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            </div>
                          ) : isNo ? (
                            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                              <X className="w-3.5 h-3.5 text-red-400" />
                            </div>
                          ) : (
                            <span className="text-foreground">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-card">{t("pros")}</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4">
                      <ul className="space-y-1 text-left">
                        {(p.pros || []).map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-green-500">
                            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="text-foreground">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-muted/20">{t("cons")}</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4">
                      <ul className="space-y-1 text-left">
                        {(p.cons || []).map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-red-400">
                            <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="text-foreground">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {comparison.verdict && (
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-3">{t("ourVerdict")}</h2>
            <p className="text-muted-foreground leading-relaxed">{comparison.verdict}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-card border border-card-border rounded-xl p-4 text-center">
              <h3 className="font-bold text-sm text-foreground mb-2">{product.name}</h3>
              <StarRating rating={product.rating} />
              <div className="flex gap-2 mt-3 justify-center">
                <Link href={`/product/${product.slug}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    {t("review")} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
                {product.websiteUrl && (
                  <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs">
                      {t("visitWebsite")} <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {comparison.metaTitle && <title>{comparison.metaTitle}</title>}
    </Layout>
  );
}
