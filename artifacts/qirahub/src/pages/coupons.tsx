import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCoupons, useCouponAdsForCoupon, type Coupon, type CouponAd } from "@/lib/api-hooks";
import {
  Tag, Copy, Check, ExternalLink, ShieldCheck, Clock, ChevronDown, ChevronUp,
  Ticket, Loader2
} from "lucide-react";

const CATEGORIES = ["All", "VPN", "Hosting", "Software", "Antivirus", "Password Manager", "Cloud Storage", "Design Tools", "VoIP", "Other"];

const TYPE_LABELS: Record<string, string> = {
  percentage: "OFF",
  fixed: "OFF",
  free_trial: "Free Trial",
  free_shipping: "Free Shipping",
  bogo: "BOGO",
  other: "Deal",
};

const TYPE_COLORS: Record<string, string> = {
  percentage: "bg-green-500/20 text-green-400 border-green-500/30",
  fixed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  free_trial: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  free_shipping: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  bogo: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  other: "bg-muted text-muted-foreground border-border",
};

function daysUntil(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  if (days <= 7) return `Expires in ${days} days`;
  return `Expires ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function CouponAdRenderer({ ad }: { ad: CouponAd }) {
  if (ad.type === "banner" && ad.imageUrl) {
    const inner = (
      <img
        src={ad.imageUrl}
        alt={ad.title || "Advertisement"}
        className="max-w-full rounded-lg"
        style={{ width: ad.width || "auto", height: ad.height || "auto", objectFit: "cover" }}
      />
    );
    return (
      <div className="flex justify-center my-2">
        {ad.redirectUrl ? (
          <a href={ad.redirectUrl} target="_blank" rel="noopener noreferrer sponsored">{inner}</a>
        ) : inner}
      </div>
    );
  }
  if ((ad.type === "adsense" || ad.type === "custom_html") && ad.adCode) {
    return (
      <div
        className="my-2 flex justify-center"
        dangerouslySetInnerHTML={{ __html: ad.adCode }}
      />
    );
  }
  if (ad.type === "text_link") {
    return (
      <div className="my-2 p-3 bg-muted/40 rounded-lg border border-border">
        {ad.title && <p className="font-semibold text-foreground text-sm mb-1">{ad.title}</p>}
        {ad.description && <p className="text-xs text-muted-foreground mb-2">{ad.description}</p>}
        {ad.redirectUrl && (
          <a href={ad.redirectUrl} target="_blank" rel="noopener noreferrer sponsored"
            className="text-xs text-primary underline">{ad.redirectUrl}</a>
        )}
      </div>
    );
  }
  return null;
}

function RevealModal({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { data: ads = [], isLoading: adsLoading } = useCouponAdsForCoupon(coupon.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiry = daysUntil(coupon.expiresAt);
  const isExpired = expiry === "Expired";

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-card border-border">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {coupon.logoUrl ? (
                <img src={coupon.logoUrl} alt={coupon.title} className="w-10 h-10 rounded-lg object-contain bg-background border border-border p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <DialogTitle className="text-foreground text-base leading-tight">{coupon.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs border-primary/40 text-primary">{coupon.category}</Badge>
                  {coupon.isVerified && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {expiry && (
                    <span className={`flex items-center gap-1 text-xs ${isExpired ? "text-red-400" : "text-muted-foreground"}`}>
                      <Clock className="w-3 h-3" /> {expiry}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {/* Sponsored Ad */}
          {adsLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : ads.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-right">Sponsored</p>
              {ads.slice(0, 1).map(ad => <CouponAdRenderer key={ad.id} ad={ad} />)}
            </div>
          ) : null}

          {/* Coupon Code Box */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Your Coupon Code:</p>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full group relative overflow-hidden rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 py-4 px-6 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
              >
                <div className="blur-sm select-none font-mono text-xl font-bold text-foreground tracking-widest">
                  {coupon.code}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Click to Reveal Code
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="w-full rounded-xl border-2 border-primary bg-primary/10 py-4 px-6 text-center cursor-pointer hover:bg-primary/20 transition-all group"
              >
                <div className="font-mono text-2xl font-bold text-primary tracking-widest mb-1">
                  {coupon.code}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
                  {copied ? (
                    <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Copied!</span></>
                  ) : (
                    <><Copy className="w-4 h-4" /><span>Click to Copy</span></>
                  )}
                </div>
              </button>
            )}

            {coupon.discount && (
              <p className="text-center text-sm text-muted-foreground">
                Discount: <span className="font-semibold text-foreground">{coupon.discount}</span>
              </p>
            )}
          </div>

          {/* Visit Website */}
          {(coupon.affiliateUrl || coupon.websiteUrl) && (
            <a
              href={coupon.affiliateUrl || coupon.websiteUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full" size="lg">
                Visit Website <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          )}

          {/* Description */}
          {coupon.description && (
            <p className="text-sm text-muted-foreground text-center leading-relaxed">{coupon.description}</p>
          )}

          {/* Terms */}
          {coupon.terms && (
            <div>
              <button
                onClick={() => setShowTerms(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full justify-center"
              >
                Terms & Conditions {showTerms ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showTerms && (
                <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground leading-relaxed border border-border">
                  {coupon.terms}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CouponCard({ coupon, onClick }: { coupon: Coupon; onClick: () => void }) {
  const expiry = daysUntil(coupon.expiresAt);
  const isExpired = expiry === "Expired";
  const initials = coupon.title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 ${isExpired ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="p-5 pb-3 flex items-start gap-3">
        {coupon.logoUrl ? (
          <img
            src={coupon.logoUrl}
            alt={coupon.title}
            className="w-12 h-12 rounded-xl object-contain bg-background border border-border p-1.5 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <span className="font-bold text-primary text-sm">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">{coupon.category}</Badge>
            {coupon.isVerified && (
              <span className="flex items-center gap-0.5 text-xs text-green-400">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{coupon.title}</h3>
        </div>
      </div>

      {/* Discount Banner */}
      {coupon.discount && (
        <div className="mx-5 mb-3">
          <div className={`rounded-lg border px-3 py-2 text-center text-sm font-bold ${TYPE_COLORS[coupon.type] || TYPE_COLORS.other}`}>
            {coupon.discount} {TYPE_LABELS[coupon.type] || "Deal"}
          </div>
        </div>
      )}

      {/* Description */}
      {coupon.description && (
        <p className="px-5 text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{coupon.description}</p>
      )}

      {/* Footer */}
      <div className="mt-auto px-5 pb-5 space-y-3">
        {expiry && (
          <div className={`flex items-center gap-1.5 text-xs ${isExpired ? "text-red-400" : "text-muted-foreground"}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{expiry}</span>
          </div>
        )}

        <Button
          onClick={onClick}
          disabled={isExpired}
          className="w-full"
          variant={isExpired ? "outline" : "default"}
          size="sm"
        >
          {isExpired ? (
            "Expired"
          ) : (
            <><Tag className="w-4 h-4 mr-2" />Reveal Code</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useCoupons(activeCategory === "All" ? undefined : activeCategory);

  return (
    <Layout>
      <div className="py-10 px-4 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Exclusive Deals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Coupon Codes & Deals</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Save more with our verified coupon codes for top software, VPN, hosting, and more.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Coupons Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-24">
            <Ticket className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No coupons yet</h3>
            <p className="text-muted-foreground">
              {activeCategory === "All" ? "No coupons available right now. Check back soon!" : `No coupons for "${activeCategory}" yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coupons.map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClick={() => setSelectedCoupon(coupon)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reveal Modal */}
      {selectedCoupon && (
        <RevealModal
          coupon={selectedCoupon}
          onClose={() => setSelectedCoupon(null)}
        />
      )}
    </Layout>
  );
}
