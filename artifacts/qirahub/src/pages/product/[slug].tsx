import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useProductBySlug } from "@/lib/api-hooks";
import { useParams, Link } from "wouter";
import { ChevronRight, Star, Check, X, ExternalLink, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { useSiteSetting } from "@/lib/api-hooks";
import { setPageMeta, resetPageMeta } from "@/lib/page-seo";

function useSiteValue(key: string): string {
  const { data } = useSiteSetting(key);
  return data?.value ?? "";
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const textMap = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${sizeMap[size]} ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className={`${textMap[size]} font-bold text-foreground ml-2`}>{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground ml-1">/ 5.0</span>
    </div>
  );
}

export default function ProductReview() {
  const { slug } = useParams();
  const { langCode, t } = useTranslation();
  const { data, isLoading } = useProductBySlug(slug, langCode);

  const siteName      = useSiteValue("site_name");
  const siteUrl       = useSiteValue("site_url");
  const ogImageDef    = useSiteValue("og_image_url");
  const authorName    = useSiteValue("author_name");
  const twitterHandle = useSiteValue("twitter_handle");

  useEffect(() => {
    if (!data) return;
    const { product, category } = data;

    const canonical = siteUrl
      ? `${siteUrl.replace(/\/$/, "")}/product/${product.slug}`
      : `${window.location.origin}/product/${product.slug}`;

    const twitterSite = twitterHandle
      ? (twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`)
      : undefined;

    const reviewCount = (product.pros?.length || 0) + (product.cons?.length || 0) || 1;

    setPageMeta({
      title: product.metaTitle || `${product.name} Review – ${siteName || "QiraHub"}`,
      description: product.metaDescription || product.shortDescription || product.description?.slice(0, 155) || undefined,
      canonicalUrl: canonical,
      ogType: "article",
      ogImage: product.imageUrl || ogImageDef || undefined,
      ogUrl: canonical,
      siteName: siteName || undefined,
      author: authorName || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.shortDescription || product.description || undefined,
        image: product.imageUrl || undefined,
        url: canonical,
        ...(product.websiteUrl ? { brand: { "@type": "Brand", name: product.name } } : {}),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          bestRating: 5,
          worstRating: 1,
          reviewCount,
        },
        review: {
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: product.rating,
            bestRating: 5,
          },
          author: {
            "@type": "Organization",
            name: siteName || authorName || "QiraHub",
          },
          publisher: {
            "@type": "Organization",
            name: siteName || "QiraHub",
          },
          description: product.metaDescription || product.shortDescription || undefined,
        },
        ...(product.websiteUrl ? { offers: { "@type": "Offer", url: product.websiteUrl, priceCurrency: "USD", price: "0" } } : {}),
        ...(twitterSite ? { sameAs: [product.websiteUrl].filter(Boolean) } : {}),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonical,
        },
      },
    });

    return () => {
      resetPageMeta();
    };
  }, [data, siteUrl, ogImageDef, siteName, authorName, twitterHandle]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-16 px-4 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-2xl" />
            <div className="h-96 bg-muted rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("notFound")}</h1>
          <Link href="/categories">
            <Button>{t("categories")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { product, category, relatedProducts } = data;
  const features = product.features || {};
  const featureKeys = Object.keys(features);

  return (
    <Layout>
      <div className="py-8 px-4 max-w-5xl mx-auto">
        <div className="flex items-center text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-foreground">{t("home")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/categories" className="hover:text-foreground">{t("categories")}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href={`/categories/${category?.slug}`} className="hover:text-foreground">{category?.name}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {product.rank <= 3 && (
                <div className={`${product.rank === 1 ? "bg-yellow-500" : product.rank === 2 ? "bg-slate-400" : "bg-amber-600"} text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                  {product.rank === 1 ? <Trophy className="w-4 h-4" /> : <Medal className="w-4 h-4" />}
                  #{product.rank} in {category?.name}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {product.name} {t("review")}
            </h1>
            <p className="text-lg text-foreground/70 mb-6">{product.shortDescription}</p>
            <StarRating rating={product.rating} size="lg" />

            <div className="flex gap-3 mt-6">
              {product.websiteUrl && (
                <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-primary hover:bg-primary/90">
                    {t("visitWebsite")} <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}
              {product.affiliateUrl && (
                <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-primary text-primary">
                    {t("getSpecialDeal")}
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-xl mb-4" />
            )}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("pricing")}</span>
                <span className="font-semibold text-primary">{product.pricing || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("rating")}</span>
                <span className="font-semibold text-foreground">{product.rating.toFixed(1)} / 5.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("rank")}</span>
                <span className="font-semibold text-foreground">#{product.rank}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" /> {t("pros")}
            </h2>
            <ul className="space-y-3">
              {(product.pros || []).map((pro, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
              <X className="w-5 h-5" /> {t("cons")}
            </h2>
            <ul className="space-y-3">
              {(product.cons || []).map((con, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground">
                  <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {product.description && (
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t("detailedReview")}</h2>
            <div>
              {product.description.split("\n\n").map((para, i) => (
                <p key={i} className="text-foreground/70 leading-relaxed mb-4">{para}</p>
              ))}
            </div>
          </div>
        )}

        {featureKeys.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-12">
            <div className="bg-muted/50 p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{t("keyFeatures")}</h2>
            </div>
            <div className="divide-y divide-border">
              {featureKeys.map((key, i) => (
                <div key={key} className={`flex justify-between items-center p-4 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <span className="font-medium text-foreground/80">{key}</span>
                  <span className="text-foreground/70">{features[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t("otherTopPicks")} — {category?.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rp => (
                <Link key={rp.id} href={`/product/${rp.slug}`}>
                  <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    {rp.imageUrl && (
                      <img src={rp.imageUrl} alt={rp.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">#{rp.rank}</Badge>
                      <h3 className="font-semibold text-foreground text-sm">{rp.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">{rp.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-primary font-medium">{rp.pricing}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
