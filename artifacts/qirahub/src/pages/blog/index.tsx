import { Layout } from "@/components/layout/Layout";
import { useListPosts, useListCategories } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { Input } from "@/components/ui/input";
import { Search, Clock, ChevronRight, ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getCategoryTheme } from "@/lib/category-colors";
import { AdSlot } from "@/components/ads/AdSlot";

const PAGE_SIZE = 12;

export default function BlogList() {
  const { langCode, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const activeCategoryId = searchParams.get("category");

  const offset = (currentPage - 1) * PAGE_SIZE;

  const { data: posts, isLoading } = useListPosts({
    limit: PAGE_SIZE,
    offset,
    lang: langCode,
    ...(activeCategoryId ? { categoryId: parseInt(activeCategoryId) } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  });

  const { data: categories } = useListCategories({ lang: langCode });

  const hasPrev = currentPage > 1;
  const hasNext = posts !== undefined && posts.length === PAGE_SIZE;
  const totalPages = hasNext ? currentPage + 1 : currentPage;

  return (
    <Layout>
      <div className="py-8 px-4 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link>
          <ChevronRight className="w-3 h-3 mx-1.5" />
          <span className="text-foreground font-medium">{t("blog")}</span>
        </div>

        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 rounded-full bg-primary" />
              <h1
                className="text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #00e5ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("latestArticles")}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">{t("heroSubtitle")}</p>
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9 bg-card border-card-border text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex overflow-x-auto pb-3 mb-8 gap-2 no-scrollbar">
          <Link href="/blog" onClick={() => setCurrentPage(1)}>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-bold section-label whitespace-nowrap transition-all ${
                !activeCategoryId
                  ? "bg-primary text-background"
                  : "bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {t("allCategories")}
            </button>
          </Link>
          {categories?.map((cat, i) => {
            const theme = getCategoryTheme(cat.name, i);
            const isActive = activeCategoryId === cat.id.toString();
            return (
              <Link key={cat.id} href={`/blog?category=${cat.id}`} onClick={() => setCurrentPage(1)}>
                <button
                  className="px-4 py-1.5 rounded-full text-xs font-bold section-label whitespace-nowrap transition-all"
                  style={isActive ? {
                    background: theme.accentHex,
                    color: "#000",
                  } : {
                    background: "transparent",
                    color: theme.accentHex,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {cat.name}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden h-[360px] animate-pulse" />
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-xl">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h3 className="text-base font-bold text-foreground mb-1">{t("noPostsFound")}</h3>
            <p className="text-muted-foreground text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts?.map((post, i) => {
              const theme = getCategoryTheme(post.categoryName, i);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article
                    className="group bg-card border border-card-border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300"
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = theme.glow)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
                  >
                    {/* Top accent stripe */}
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
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                          <FileText className="w-8 h-8" style={{ color: theme.accentHex }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent" />
                      {/* Category badge */}
                      <span
                        className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded section-label"
                        style={{
                          background: theme.bg,
                          color: theme.accentHex,
                          border: `1px solid ${theme.border}`,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {post.categoryName || t("article")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-base text-foreground mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {post.excerpt || post.content.replace(/<[^>]*>?/gm, "").substring(0, 110) + "…"}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-card-border mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTimeMinutes || 5} {t("minRead")}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        <AdSlot page="blog" position="between_posts" className="my-4" label />

        {/* Pagination */}
        {(hasPrev || hasNext) && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="icon"
              disabled={!hasPrev}
              onClick={() => setCurrentPage(p => p - 1)}
              className="border-card-border hover:bg-card text-foreground"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                className={`w-10 ${page !== currentPage ? "border-card-border hover:bg-card text-foreground" : ""}`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={!hasNext}
              onClick={() => setCurrentPage(p => p + 1)}
              className="border-card-border hover:bg-card text-foreground"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
