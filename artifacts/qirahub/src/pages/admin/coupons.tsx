import { canDelete } from "@/lib/admin-auth";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  useAllCoupons, useCreateCoupon, useUpdateCoupon, useToggleCoupon, useDeleteCoupon,
  useAllCouponAds, useCreateCouponAd, useUpdateCouponAd, useToggleCouponAd, useDeleteCouponAd,
  type Coupon, type CouponAd,
} from "@/lib/api-hooks";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Ticket, ShieldCheck, Megaphone,
  ExternalLink, X, ChevronDown, ChevronUp,
} from "lucide-react";

const CATEGORIES = ["VPN", "Hosting", "Software", "Antivirus", "Password Manager", "Cloud Storage", "Design Tools", "VoIP", "Other"];
const COUPON_TYPES = [
  { value: "percentage", label: "Percentage (e.g. 70% OFF)" },
  { value: "fixed", label: "Fixed Amount (e.g. $5 OFF)" },
  { value: "free_trial", label: "Free Trial" },
  { value: "free_shipping", label: "Free Shipping" },
  { value: "bogo", label: "Buy One Get One" },
  { value: "other", label: "Other Deal" },
];
const AD_TYPES = [
  { value: "banner", label: "Banner (Image)" },
  { value: "adsense", label: "AdSense / Ad Script" },
  { value: "custom_html", label: "Custom HTML" },
  { value: "text_link", label: "Text Link / Sponsor" },
];

const DEFAULT_COUPON: Partial<Coupon> = {
  title: "", code: "", category: "Software", type: "percentage",
  discount: "", description: "", terms: "", logoUrl: "", websiteUrl: "", affiliateUrl: "",
  expiresAt: null, isActive: true, isVerified: false, sortOrder: 0,
};
const DEFAULT_AD: Partial<CouponAd> = {
  name: "", couponId: null, type: "banner", title: "", description: "",
  imageUrl: "", redirectUrl: "", adCode: "", width: undefined, height: undefined,
  isActive: true, sortOrder: 0,
};

/* ─── Coupon Form ─── */
function CouponForm({
  coupon, coupons, onSave, onCancel,
}: {
  coupon: Partial<Coupon> | null; coupons: Coupon[];
  onSave: (data: Partial<Coupon>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Coupon>>(coupon ? { ...coupon } : { ...DEFAULT_COUPON });
  const set = (k: keyof Coupon, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!form.title?.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    if (!form.code?.trim()) { toast({ title: "Coupon code is required", variant: "destructive" }); return; }
    onSave(form);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">{coupon?.id ? "Edit Coupon" : "Add New Coupon"}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Title *</Label>
          <Input value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="Get 70% off NordVPN Premium" />
        </div>
        <div>
          <Label>Coupon Code *</Label>
          <Input value={form.code || ""} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="QIRA70" className="font-mono" />
        </div>
        <div>
          <Label>Category</Label>
          <select
            value={form.category || "Software"}
            onChange={e => set("category", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label>Type</Label>
          <select
            value={form.type || "percentage"}
            onChange={e => set("type", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            {COUPON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label>Discount Value</Label>
          <Input value={form.discount || ""} onChange={e => set("discount", e.target.value)} placeholder='e.g. "70%", "$10", "3 months free"' />
        </div>
        <div>
          <Label>Logo URL</Label>
          <Input value={form.logoUrl || ""} onChange={e => set("logoUrl", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label>Website URL</Label>
          <Input value={form.websiteUrl || ""} onChange={e => set("websiteUrl", e.target.value)} placeholder="https://nordvpn.com" />
        </div>
        <div>
          <Label>Affiliate / Tracking URL</Label>
          <Input value={form.affiliateUrl || ""} onChange={e => set("affiliateUrl", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label>Expires At (optional)</Label>
          <Input
            type="date"
            value={form.expiresAt ? form.expiresAt.slice(0, 10) : ""}
            onChange={e => set("expiresAt", e.target.value || null)}
            className="text-foreground"
          />
        </div>
        <div>
          <Label>Sort Order</Label>
          <Input type="number" value={form.sortOrder ?? 0} onChange={e => set("sortOrder", parseInt(e.target.value) || 0)} />
        </div>
        <div className="md:col-span-2">
          <Label>Short Description</Label>
          <Input value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Brief description visible on the card" />
        </div>
        <div className="md:col-span-2">
          <Label>Terms & Conditions</Label>
          <Textarea value={form.terms || ""} onChange={e => set("terms", e.target.value)} placeholder="List any usage restrictions, eligible plans, etc." rows={3} />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive ?? true} onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-foreground">Active (public)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isVerified ?? false} onChange={e => set("isVerified", e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-foreground">Verified</span>
          </label>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <Button type="submit" className="flex-1">{coupon?.id ? "Save Changes" : "Create Coupon"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

/* ─── Coupon Ad Form ─── */
function CouponAdForm({
  ad, coupons, onSave, onCancel,
}: {
  ad: Partial<CouponAd> | null; coupons: Coupon[];
  onSave: (data: Partial<CouponAd>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<CouponAd>>(ad ? { ...ad } : { ...DEFAULT_AD });
  const set = (k: keyof CouponAd, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!form.name?.trim()) { toast({ title: "Ad name is required", variant: "destructive" }); return; }
    onSave(form);
  };

  const needsImage = form.type === "banner";
  const needsCode = form.type === "adsense" || form.type === "custom_html";
  const needsLink = form.type === "banner" || form.type === "text_link";

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">{ad?.id ? "Edit Coupon Ad" : "Add Coupon Ad"}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Ad Name *</Label>
          <Input value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="e.g. NordVPN Banner" />
        </div>
        <div>
          <Label>Ad Type</Label>
          <select value={form.type || "banner"} onChange={e => set("type", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
            {AD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label>Assign to Coupon (optional — leave blank to show for all coupons)</Label>
          <select
            value={form.couponId ?? ""}
            onChange={e => set("couponId", e.target.value ? parseInt(e.target.value) : null)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">All coupons (global fallback)</option>
            {coupons.map(c => <option key={c.id} value={c.id}>{c.title} — [{c.code}]</option>)}
          </select>
        </div>
        {needsImage && (
          <div className="md:col-span-2">
            <Label>Image URL</Label>
            <Input value={form.imageUrl || ""} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." />
          </div>
        )}
        {needsLink && (
          <div className="md:col-span-2">
            <Label>Redirect URL (click destination)</Label>
            <Input value={form.redirectUrl || ""} onChange={e => set("redirectUrl", e.target.value)} placeholder="https://..." />
          </div>
        )}
        {(form.type === "text_link") && (
          <>
            <div>
              <Label>Ad Title</Label>
              <Input value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="Sponsored offer" />
            </div>
            <div>
              <Label>Ad Description</Label>
              <Input value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Short sponsor text" />
            </div>
          </>
        )}
        {needsCode && (
          <div className="md:col-span-2">
            <Label>Ad Code / Script</Label>
            <Textarea value={form.adCode || ""} onChange={e => set("adCode", e.target.value)} placeholder="<script>...</script> or AdSense code" rows={4} className="font-mono text-xs" />
          </div>
        )}
        {needsImage && (
          <div>
            <Label>Width (px)</Label>
            <Input type="number" value={form.width || ""} onChange={e => set("width", parseInt(e.target.value) || undefined)} placeholder="300" />
          </div>
        )}
        {needsImage && (
          <div>
            <Label>Height (px)</Label>
            <Input type="number" value={form.height || ""} onChange={e => set("height", parseInt(e.target.value) || undefined)} placeholder="250" />
          </div>
        )}
        <div>
          <Label>Sort Order</Label>
          <Input type="number" value={form.sortOrder ?? 0} onChange={e => set("sortOrder", parseInt(e.target.value) || 0)} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive ?? true} onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-foreground">Active</span>
          </label>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <Button type="submit" className="flex-1">{ad?.id ? "Save Changes" : "Create Ad"}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminCoupons() {
  const [activeTab, setActiveTab] = useState<"coupons" | "ads">("coupons");
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null | false>(false);
  const [editingAd, setEditingAd] = useState<Partial<CouponAd> | null | false>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "coupon" | "ad"; id: number } | null>(null);
  const [expandedCoupon, setExpandedCoupon] = useState<number | null>(null);

  const { data: coupons = [], isLoading: loadingCoupons } = useAllCoupons();
  const { data: couponAds = [], isLoading: loadingAds } = useAllCouponAds();

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const toggleCoupon = useToggleCoupon();
  const deleteCoupon = useDeleteCoupon();

  const createAd = useCreateCouponAd();
  const updateAd = useUpdateCouponAd();
  const toggleAd = useToggleCouponAd();
  const deleteAd = useDeleteCouponAd();

  const handleSaveCoupon = (data: Partial<Coupon>) => {
    if (editingCoupon && (editingCoupon as Coupon).id) {
      updateCoupon.mutate({ id: (editingCoupon as Coupon).id, ...data }, {
        onSuccess: () => { toast({ title: "Coupon updated" }); setEditingCoupon(false); },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      });
    } else {
      createCoupon.mutate(data, {
        onSuccess: () => { toast({ title: "Coupon created" }); setEditingCoupon(false); },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      });
    }
  };

  const handleSaveAd = (data: Partial<CouponAd>) => {
    if (editingAd && (editingAd as CouponAd).id) {
      updateAd.mutate({ id: (editingAd as CouponAd).id, ...data }, {
        onSuccess: () => { toast({ title: "Ad updated" }); setEditingAd(false); },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      });
    } else {
      createAd.mutate(data, {
        onSuccess: () => { toast({ title: "Ad created" }); setEditingAd(false); },
        onError: () => toast({ title: "Failed to create", variant: "destructive" }),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "coupon") {
      deleteCoupon.mutate(deleteConfirm.id, {
        onSuccess: () => { toast({ title: "Coupon deleted" }); setDeleteConfirm(null); },
      });
    } else {
      deleteAd.mutate(deleteConfirm.id, {
        onSuccess: () => { toast({ title: "Ad deleted" }); setDeleteConfirm(null); },
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Coupon Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage coupon codes and their dedicated ads</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-muted/30 border border-border rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "coupons" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Ticket className="w-4 h-4" /> Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ads" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Megaphone className="w-4 h-4" /> Coupon Ads ({couponAds.length})
          </button>
        </div>

        {/* ─── COUPONS TAB ─── */}
        {activeTab === "coupons" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {coupons.filter(c => c.isActive).length} active, {coupons.filter(c => !c.isActive).length} inactive
              </p>
              <Button onClick={() => setEditingCoupon(null)}>
                <Plus className="w-4 h-4 mr-2" /> Add Coupon
              </Button>
            </div>

            {editingCoupon !== false && (
              <CouponForm
                coupon={editingCoupon}
                coupons={coupons}
                onSave={handleSaveCoupon}
                onCancel={() => setEditingCoupon(false)}
              />
            )}

            {loadingCoupons ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground font-semibold mb-2">No coupons yet</p>
                <p className="text-muted-foreground text-sm mb-4">Click "Add Coupon" to create your first coupon</p>
              </div>
            ) : (
              <div className="space-y-2">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      {/* Logo or initials */}
                      {coupon.logoUrl ? (
                        <img src={coupon.logoUrl} alt={coupon.title} className="w-10 h-10 rounded-lg object-contain border border-border bg-background p-1 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Ticket className="w-5 h-5 text-primary" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm truncate">{coupon.title}</span>
                          <code className="text-xs bg-muted border border-border px-2 py-0.5 rounded font-mono text-primary">{coupon.code}</code>
                          <Badge variant="outline" className="text-xs">{coupon.category}</Badge>
                          {coupon.isVerified && (
                            <span className="flex items-center gap-0.5 text-xs text-green-400"><ShieldCheck className="w-3 h-3" />Verified</span>
                          )}
                          {!coupon.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {coupon.discount && <span className="text-xs text-muted-foreground">{coupon.discount} • {coupon.type}</span>}
                          {coupon.expiresAt && (
                            <span className="text-xs text-muted-foreground">
                              Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost" size="icon"
                          className={coupon.isActive ? "text-green-400" : "text-muted-foreground"}
                          onClick={() => toggleCoupon.mutate(coupon.id)}
                          title={coupon.isActive ? "Deactivate" : "Activate"}
                        >
                          {coupon.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingCoupon(coupon)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {coupon.websiteUrl && (
                          <a href={coupon.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {canDelete() && (
                          <Button
                            variant="ghost" size="icon" className="text-red-400 hover:text-red-500"
                            onClick={() => setDeleteConfirm({ type: "coupon", id: coupon.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="icon" className="text-muted-foreground"
                          onClick={() => setExpandedCoupon(expandedCoupon === coupon.id ? null : coupon.id)}
                        >
                          {expandedCoupon === coupon.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCoupon === coupon.id && (
                      <div className="border-t border-border bg-muted/20 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {coupon.description && <div><span className="text-muted-foreground">Description: </span><span className="text-foreground">{coupon.description}</span></div>}
                        {coupon.terms && <div><span className="text-muted-foreground">Terms: </span><span className="text-foreground line-clamp-2">{coupon.terms}</span></div>}
                        {coupon.websiteUrl && <div><span className="text-muted-foreground">Website: </span><a href={coupon.websiteUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{coupon.websiteUrl}</a></div>}
                        {coupon.affiliateUrl && <div><span className="text-muted-foreground">Affiliate: </span><a href={coupon.affiliateUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Link</a></div>}
                        <div><span className="text-muted-foreground">Sort: </span><span className="text-foreground">{coupon.sortOrder}</span></div>
                        <div><span className="text-muted-foreground">Coupon Ads: </span><span className="text-foreground">{couponAds.filter(a => a.couponId === coupon.id).length} specific</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ADS TAB ─── */}
        {activeTab === "ads" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {couponAds.filter(a => a.isActive).length} active ads • Ads assigned to a specific coupon show only for that coupon; unassigned ads are global fallbacks.
                </p>
              </div>
              <Button onClick={() => setEditingAd(null)}>
                <Plus className="w-4 h-4 mr-2" /> Add Coupon Ad
              </Button>
            </div>

            {editingAd !== false && (
              <CouponAdForm
                ad={editingAd}
                coupons={coupons}
                onSave={handleSaveAd}
                onCancel={() => setEditingAd(false)}
              />
            )}

            {/* Info box */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground/80">
              <strong className="text-foreground">How it works:</strong> When a user clicks "Reveal Code" on a coupon, the system first checks for ads assigned to that specific coupon. If none exist, it shows global (unassigned) ads as a fallback. You can create different ads per coupon for maximum relevance.
            </div>

            {loadingAds ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : couponAds.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground font-semibold mb-2">No coupon ads yet</p>
                <p className="text-muted-foreground text-sm">Add ads that appear when users reveal coupon codes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {couponAds.map(ad => {
                  const linkedCoupon = coupons.find(c => c.id === ad.couponId);
                  return (
                    <div key={ad.id} className="bg-card border border-border rounded-xl flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Megaphone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">{ad.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">{ad.type.replace("_", " ")}</Badge>
                          {linkedCoupon ? (
                            <Badge variant="outline" className="text-xs border-primary/40 text-primary">{linkedCoupon.title}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">Global (all coupons)</Badge>
                          )}
                          {!ad.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {ad.redirectUrl && <span>→ {ad.redirectUrl.substring(0, 50)}{ad.redirectUrl.length > 50 ? "…" : ""}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost" size="icon"
                          className={ad.isActive ? "text-green-400" : "text-muted-foreground"}
                          onClick={() => toggleAd.mutate(ad.id)}
                        >
                          {ad.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingAd(ad)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {canDelete() && (
                          <Button
                            variant="ghost" size="icon" className="text-red-400 hover:text-red-500"
                            onClick={() => setDeleteConfirm({ type: "ad", id: ad.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Delete Confirm ─── */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-foreground mb-2">Confirm Delete</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to delete this {deleteConfirm.type === "coupon" ? "coupon" : "ad"}? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button>
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
