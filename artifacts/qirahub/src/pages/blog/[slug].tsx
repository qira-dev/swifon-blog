import { useEffect, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { Layout } from "@/components/layout/Layout";
import { useGetPostBySlug, useListPosts, ListPostsStatus } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import {
  Clock, Calendar, Tag as TagIcon, Share2, Twitter, Facebook, Linkedin,
  ChevronRight, Star, Send, MessageSquare, TrendingUp, LogIn,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { useSiteSetting } from "@/lib/api-hooks";
import { setPageMeta, resetPageMeta } from "@/lib/page-seo";
import { useAuthStore } from "@/lib/user-auth";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "/api";

function useSiteValue(key: string): string {
  const { data } = useSiteSetting(key);
  return data?.value ?? "";
}

/* ─── Star Rating Display ─── */
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}
        />
      ))}
    </span>
  );
}

/* ─── Interactive Star Picker ─── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className="focus:outline-none transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          <Star
            size={24}
            className={
              s <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/40"
            }
          />
        </button>
      ))}
    </span>
  );
}

/* ─── Review Section ─── */
interface Review {
  id: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface ReviewsData {
  reviews: Review[];
  count: number;
  avgRating: number;
}

function PostReviews({ postId }: { postId: number }) {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/reviews`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoadingReviews(false);
    }
  }, [postId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast({ title: "Please choose a star rating", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Review submitted!" });
      fetchReviews();
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const userReview = user && data ? data.reviews.find((r) => r.userId === user.id) : null;
  const otherReviews = user && data ? data.reviews.filter((r) => r.userId !== user.id) : (data?.reviews ?? []);

  return (
    <section className="mt-14 border-t border-border pt-10">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Reviews & Ratings</h2>
        {data && data.count > 0 && (
          <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <StarDisplay rating={data.avgRating} />
            <span className="font-semibold text-foreground">{data.avgRating}</span>
            <span>({data.count} {data.count === 1 ? "review" : "reviews"})</span>
          </span>
        )}
      </div>

      {/* Rating Summary Bar */}
      {data && data.count > 0 && (
        <div className="bg-muted/40 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-6 border border-border">
          <div className="text-center shrink-0">
            <p className="text-5xl font-extrabold text-foreground leading-none">{data.avgRating}</p>
            <StarDisplay rating={data.avgRating} size={20} />
            <p className="text-xs text-muted-foreground mt-1">{data.count} {data.count === 1 ? "review" : "reviews"}</p>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const cnt = data.reviews.filter((r) => r.rating === star).length;
              const pct = data.count > 0 ? Math.round((cnt / data.count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-right text-muted-foreground">{star}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-muted-foreground">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit form */}
      {user ? (
        userReview ? (
          <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8 flex items-center gap-3">
            <Send className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">You have already submitted a review for this post. Reviews cannot be edited after submission.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4">Leave a review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">Rating</span>
                <StarPicker value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                  </span>
                )}
              </div>
              <div>
                <Textarea
                  placeholder="Share your thoughts about this post… (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={submitting || rating === 0} className="gap-2">
                  <Send className="w-4 h-4" />
                  {submitting ? "Submitting…" : "Submit review"}
                </Button>
              </div>
            </form>
          </div>
        )
      ) : (
        <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-6 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground text-sm">Want to leave a review?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sign in to rate and comment on this post.</p>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <LogIn className="w-4 h-4" /> Sign in
            </Button>
          </Link>
        </div>
      )}

      {/* Your review first */}
      {userReview && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Your review</p>
          <ReviewCard review={userReview} isOwn />
        </div>
      )}

      {/* Other reviews */}
      {loadingReviews ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : otherReviews.length > 0 ? (
        <div className="space-y-3">
          {otherReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : !userReview && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No reviews yet. Be the first to share your thoughts!
        </div>
      )}
    </section>
  );
}

function ReviewCard({
  review,
  isOwn = false,
}: {
  review: Review;
  isOwn?: boolean;
}) {
  const name = review.displayName || review.username || "Anonymous";
  const initials = name.charAt(0).toUpperCase();
  return (
    <div className={`rounded-xl border p-4 ${isOwn ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-start gap-3">
        {review.avatarUrl ? (
          <img src={review.avatarUrl} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-foreground shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{name}</span>
            {isOwn && <Badge variant="secondary" className="text-[10px] h-4 px-1.5">You</Badge>}
            <StarDisplay rating={review.rating} size={13} />
            <span className="ml-auto text-xs text-muted-foreground shrink-0">
              {format(new Date(review.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Related / Recent Posts ─── */
interface PostSummary {
  id: number;
  title: string;
  slug: string;
  featuredImageUrl?: string | null;
  categoryName?: string | null;
  readTimeMinutes?: number | null;
  publishedAt?: string | null;
  createdAt: string;
}

function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className="group flex gap-3 items-start hover:bg-muted/40 rounded-xl p-2 -mx-2 transition-colors cursor-pointer">
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
          <img
            src={post.featuredImageUrl || "/hero-1.png"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
            {post.readTimeMinutes && ` · ${post.readTimeMinutes} min`}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const { langCode, t } = useTranslation();
  const { data: post, isLoading } = useGetPostBySlug(slug || "", { lang: langCode });

  const siteName     = useSiteValue("site_name");
  const siteUrl      = useSiteValue("site_url");
  const ogImageDef   = useSiteValue("og_image_url");
  const authorName   = useSiteValue("author_name");
  const twitterHandle = useSiteValue("twitter_handle");

  /* Related posts: same category, published, excluding current */
  const { data: relatedData } = useListPosts({
    categoryId: post?.categoryId ?? undefined,
    status: ListPostsStatus.published,
    limit: 5,
  });

  /* Recent posts */
  const { data: recentData } = useListPosts({ status: ListPostsStatus.published, limit: 6 });

  const relatedPosts: PostSummary[] = (Array.isArray(relatedData) ? relatedData : []).filter(
    (p: any) => p.slug !== slug
  ).slice(0, 4);

  const recentPosts: PostSummary[] = (Array.isArray(recentData) ? recentData : []).filter(
    (p: any) => p.slug !== slug
  ).slice(0, 5);

  useEffect(() => {
    if (!post) return;

    const canonical = siteUrl
      ? `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`
      : `${window.location.origin}/blog/${post.slug}`;

    const twitterSite = twitterHandle
      ? (twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`)
      : undefined;

    setPageMeta({
      title: post.metaTitle || post.title || undefined,
      description: post.metaDescription || post.excerpt || undefined,
      keywords: post.focusKeyword || undefined,
      canonicalUrl: canonical,
      ogType: "article",
      ogImage: post.featuredImageUrl || ogImageDef || undefined,
      ogUrl: canonical,
      siteName: siteName || undefined,
      author: authorName || undefined,
      publishedAt: post.publishedAt || post.createdAt || undefined,
      modifiedAt: post.updatedAt || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || undefined,
        image: post.featuredImageUrl || ogImageDef || undefined,
        url: canonical,
        datePublished: post.publishedAt || post.createdAt || undefined,
        dateModified: post.updatedAt || post.publishedAt || post.createdAt || undefined,
        author: { "@type": "Person", name: authorName || "Admin" },
        publisher: {
          "@type": "Organization",
          name: siteName || "QiraHub",
          logo: { "@type": "ImageObject", url: ogImageDef || undefined },
        },
        ...(post.focusKeyword ? { keywords: post.focusKeyword } : {}),
        ...(twitterSite ? { sameAs: [`https://twitter.com/${twitterSite.replace("@", "")}`] } : {}),
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      },
    });

    return () => { resetPageMeta(); };
  }, [post, siteUrl, ogImageDef, siteName, authorName, twitterHandle]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-12 px-4">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-32 px-4">
          <h1 className="text-3xl font-bold mb-4">{t("postNotFound")}</h1>
          <p className="text-muted-foreground mb-8">{t("postNotFoundText")}</p>
          <Link href="/blog">
            <Button>{t("backToBlog")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="py-8 px-4 max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">{t("home")}</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link href="/blog" className="hover:text-foreground">{t("blog")}</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          {post.categoryName && (
            <>
              <Link href={`/categories/${post.categorySlug}`} className="hover:text-foreground">{post.categoryName}</Link>
              <ChevronRight className="w-4 h-4 mx-1" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-10">
          {post.categoryName && (
            <Badge className="mb-4 bg-teal-100 text-teal-800 hover:bg-teal-200 border-none font-semibold">
              {post.categoryName}
            </Badge>
          )}
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-muted-foreground border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">
                A
              </div>
              <span className="font-medium text-foreground">{authorName || t("admin")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt || post.createdAt}>
                {format(new Date(post.publishedAt || post.createdAt), "MMMM d, yyyy")}
              </time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{post.readTimeMinutes || 5} {t("minRead")}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#1DA1F2]"><Twitter className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#4267B2]"><Facebook className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#2867B2]"><Linkedin className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="ml-2 h-8 flex gap-1"><Share2 className="w-3 h-3" /> {t("share")}</Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImageUrl ? (
          <div className="mb-12 rounded-2xl overflow-hidden border border-border shadow-sm aspect-video bg-muted">
            <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="mb-12 rounded-2xl overflow-hidden border border-border shadow-sm aspect-video bg-card">
            <img src="/hero-1.png" alt="Fallback banner" className="w-full h-full object-cover opacity-80" />
          </div>
        )}

        {/* Post Content */}
        <div
          className="prose-theme prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border mb-12">
            <TagIcon className="w-4 h-4 text-muted-foreground mr-2" />
            {post.tags.map(tag => (
              <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                <Badge variant="secondary" className="font-normal">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Reviews */}
        <PostReviews postId={post.id} />

        {/* Related & Recent Posts */}
        {(relatedPosts.length > 0 || recentPosts.length > 0) && (
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-10">
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <TagIcon className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">Related Posts</h3>
                </div>
                <div className="space-y-1">
                  {relatedPosts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
                {post.categorySlug && (
                  <Link href={`/categories/${post.categorySlug}`}>
                    <Button variant="ghost" size="sm" className="mt-3 text-primary hover:text-primary gap-1">
                      More in {post.categoryName} →
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">Recent Posts</h3>
                </div>
                <div className="space-y-1">
                  {recentPosts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
                <Link href="/blog">
                  <Button variant="ghost" size="sm" className="mt-3 text-primary hover:text-primary gap-1">
                    View all posts →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </article>
    </Layout>
  );
}
