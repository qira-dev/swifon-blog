import { canDelete } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import {
  useAllAds,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
  useToggleAd,
  type Ad,
} from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  X,
  Save,
  Eye,
  EyeOff,
  Image,
  Video,
  Code2,
  Type,
  LayoutGrid,
  Megaphone,
  Wifi,
  Key,
  Zap,
} from "lucide-react";
import { AD_NETWORKS, getNetworkDef } from "@/lib/ad-networks";
import { NetworkCredentialsTab } from "@/components/ads/NetworkCredentialsTab";

const AD_TYPES = [
  { value: "banner", label: "Banner Ad", icon: <Image className="w-4 h-4" />, color: "text-blue-500" },
  { value: "adsense", label: "Ad Script / Code", icon: <LayoutGrid className="w-4 h-4" />, color: "text-orange-500" },
  { value: "custom_html", label: "Custom HTML", icon: <Code2 className="w-4 h-4" />, color: "text-purple-500" },
  { value: "text_link", label: "Text Link", icon: <Type className="w-4 h-4" />, color: "text-green-500" },
  { value: "video_corner", label: "Corner Video", icon: <Video className="w-4 h-4" />, color: "text-red-500" },
];


const AD_PAGES = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Home" },
  { value: "blog", label: "Blog" },
  { value: "category", label: "Category" },
  { value: "reviews", label: "Reviews" },
  { value: "comparisons", label: "Comparisons" },
  { value: "contact", label: "Contact" },
  { value: "profile", label: "Profile" },
];

const AD_POSITIONS = [
  { value: "header_top", label: "Header Top" },
  { value: "sidebar", label: "Sidebar" },
  { value: "footer_top", label: "Before Footer" },
  { value: "inline", label: "Inline / In-Content" },
  { value: "corner", label: "Corner (Fixed)" },
  { value: "between_posts", label: "Between Posts / Cards" },
];

function getTypeInfo(type: string) {
  return AD_TYPES.find((t) => t.value === type) || AD_TYPES[0];
}

function getPageLabel(page: string) {
  return AD_PAGES.find((p) => p.value === page)?.label || page;
}

function getPositionLabel(pos: string) {
  return AD_POSITIONS.find((p) => p.value === pos)?.label || pos;
}

function getNetworkInfo(network: string) {
  return getNetworkDef(network);
}

const DEFAULT_FORM: Partial<Ad> = {
  name: "",
  type: "banner",
  page: "all",
  position: "sidebar",
  network: "custom",
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  redirectUrl: "",
  adCode: "",
  slotId: "",
  width: null,
  height: null,
  sortOrder: 0,
  isActive: true,
};

function AdForm({
  ad,
  onSave,
  onCancel,
  saving,
}: {
  ad?: Ad;
  onSave: (data: Partial<Ad>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Ad>>(
    ad ? { ...ad } : { ...DEFAULT_FORM }
  );

  const set = (key: keyof Ad, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!form.name?.trim()) { toast({ title: "Ad name is required", variant: "destructive" }); return; }
    if (!form.type) { toast({ title: "Ad type is required", variant: "destructive" }); return; }
    if (!form.page) { toast({ title: "Page is required", variant: "destructive" }); return; }
    if (!form.position) { toast({ title: "Position is required", variant: "destructive" }); return; }
    onSave(form);
  };

  const needsImage = form.type === "banner";
  const needsVideo = form.type === "video_corner";
  const needsCode = form.type === "adsense" || form.type === "custom_html";
  const needsLink = form.type === "banner" || form.type === "text_link" || form.type === "video_corner";
  const needsSize = form.type === "banner" || form.type === "video_corner";
  const selectedNetwork = getNetworkInfo(form.network || "custom");
  const canAutoGenerate = selectedNetwork.canAutoGenerate && needsCode;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          {ad ? "Edit Ad" : "New Ad"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Sort Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Ad Name *</label>
            <Input
              value={form.name || ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Homepage Sidebar Banner"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Sort Order</label>
            <Input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className="bg-background"
            />
          </div>
        </div>

        {/* Ad Network — full width, prominent */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Wifi className="w-4 h-4 text-primary" />
            Ad Network
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {AD_NETWORKS.map((net) => (
              <button
                key={net.value}
                type="button"
                onClick={() => set("network", net.value)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
                  form.network === net.value
                    ? `${net.color} shadow-sm ring-1 ring-current`
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background"
                }`}
              >
                {net.label}
              </button>
            ))}
          </div>
          {selectedNetwork.hint && (
            <p className="text-xs text-muted-foreground pl-1">
              <span className={`font-medium ${selectedNetwork.color.split(" ")[1]}`}>{selectedNetwork.label}:</span>{" "}
              {selectedNetwork.hint}
            </p>
          )}
        </div>

        {/* Type + Page + Position */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Ad Type *</label>
            <select
              value={form.type || "banner"}
              onChange={(e) => set("type", e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {AD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Page / Section *</label>
            <select
              value={form.page || "all"}
              onChange={(e) => set("page", e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {AD_PAGES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Position *</label>
            <select
              value={form.position || "sidebar"}
              onChange={(e) => set("position", e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {AD_POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title + Description (optional metadata) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Display Title</label>
            <Input
              value={form.title || ""}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Optional visible title"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional short description"
              className="bg-background"
            />
          </div>
        </div>

        {needsImage && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Image URL *</label>
            <Input
              value={form.imageUrl || ""}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://example.com/ad-banner.jpg"
              className="bg-background"
            />
            {form.imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-border/50 max-h-32">
                <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
          </div>
        )}

        {needsVideo && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Video URL *</label>
            <Input
              value={form.videoUrl || ""}
              onChange={(e) => set("videoUrl", e.target.value)}
              placeholder="https://example.com/ad-video.mp4"
              className="bg-background"
            />
          </div>
        )}

        {needsLink && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Redirect / Click URL</label>
            <Input
              value={form.redirectUrl || ""}
              onChange={(e) => set("redirectUrl", e.target.value)}
              placeholder="https://advertiser.com/landing-page"
              className="bg-background"
            />
          </div>
        )}

        {canAutoGenerate && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-primary" />
              {selectedNetwork.slotLabel || "Slot ID"}
              <span className="text-[10px] font-normal text-muted-foreground bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">
                Auto-configured
              </span>
            </label>
            <Input
              value={form.slotId || ""}
              onChange={(e) => set("slotId", e.target.value)}
              placeholder={selectedNetwork.slotLabel?.includes("AdSense") ? "e.g. 1234567890" : "Enter slot / unit ID"}
              className="bg-background font-mono text-sm"
            />
            {selectedNetwork.slotHint && (
              <p className="text-xs text-muted-foreground">{selectedNetwork.slotHint}</p>
            )}
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                The full embed code will be <span className="text-primary font-medium">auto-generated</span> from your saved{" "}
                {selectedNetwork.label} credentials + this Slot ID. You can still paste a custom code below to override.
              </p>
            </div>
          </div>
        )}

        {needsCode && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {canAutoGenerate
                ? `Override Code (optional — leave blank to auto-generate)`
                : form.type === "adsense"
                ? `${selectedNetwork.label} Ad Code *`
                : "Custom HTML Code *"}
            </label>
            <textarea
              value={form.adCode || ""}
              onChange={(e) => set("adCode", e.target.value)}
              placeholder={
                canAutoGenerate
                  ? `<!-- Leave blank to auto-generate from ${selectedNetwork.label} credentials + Slot ID above -->`
                  : form.type === "adsense"
                  ? `<!-- Paste your ${selectedNetwork.label} script/tag here -->\n<script async src="..."></script>\n<ins class="adsbygoogle" ...></ins>`
                  : "<!-- Your custom HTML or ad network code here -->"
              }
              rows={canAutoGenerate ? 4 : 7}
              className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
            {!canAutoGenerate && form.network !== "custom" && form.network !== "other" && form.type === "adsense" && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full bg-current ${getNetworkInfo(form.network || "custom").color.split(" ")[1]}`} />
                Paste the full script/tag provided by {selectedNetwork.label} into the box above.
              </p>
            )}
          </div>
        )}

        {needsSize && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Width (px)</label>
              <Input
                type="number"
                value={form.width || ""}
                onChange={(e) => set("width", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 300"
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Height (px)</label>
              <Input
                type="number"
                value={form.height || ""}
                onChange={(e) => set("height", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 250"
                className="bg-background"
              />
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-3 pt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => set("isActive", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            <span className="ms-2 text-sm font-medium text-foreground">Active</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Ad"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminAds() {
  const { data: ads, isLoading } = useAllAds();
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();
  const toggleAd = useToggleAd();

  const [activeTab, setActiveTab] = useState<"ads" | "credentials">("ads");
  const [activePageFilter, setActivePageFilter] = useState("all");
  const [activeNetworkFilter, setActiveNetworkFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = (ads ?? []).filter((a) => {
    const pageMatch = activePageFilter === "all" || a.page === activePageFilter || a.page === "all";
    const networkMatch = activeNetworkFilter === "all" || (a.network || "custom") === activeNetworkFilter;
    return pageMatch && networkMatch;
  });

  const usedNetworks = [...new Set((ads ?? []).map(a => a.network || "custom"))];

  const handleSave = async (data: Partial<Ad>) => {
    try {
      if (editingAd) {
        await updateAd.mutateAsync({ id: editingAd.id, ...data });
        toast({ title: "Ad updated successfully" });
      } else {
        await createAd.mutateAsync(data);
        toast({ title: "Ad created successfully" });
      }
      setShowForm(false);
      setEditingAd(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Failed to save ad", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAd.mutateAsync(id);
      toast({ title: "Ad deleted" });
      setDeletingId(null);
    } catch {
      toast({ title: "Failed to delete ad", variant: "destructive" });
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleAd.mutateAsync(id);
    } catch {
      toast({ title: "Failed to toggle ad", variant: "destructive" });
    }
  };

  const saving = createAd.isPending || updateAd.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Ad Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure ads per page, position, and ad network — banner, video, script, or custom HTML.
              </p>
            </div>
            {!showForm && activeTab === "ads" && (
              <Button
                onClick={() => { setShowForm(true); setEditingAd(null); }}
                className="gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Ad
              </Button>
            )}
          </div>

          {/* Tab switcher */}
          <div className="mt-4 pt-4 border-t border-border flex gap-1.5">
            <button
              onClick={() => setActiveTab("ads")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "ads"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Ad Units
            </button>
            <button
              onClick={() => setActiveTab("credentials")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "credentials"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Key className="w-4 h-4" />
              Network Credentials
            </button>
          </div>

          {/* Page filter — only shown on Ads tab */}
          {activeTab === "ads" && <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Page</p>
              <div className="flex gap-1.5 flex-wrap">
                {[{ value: "all", label: "All" }, ...AD_PAGES.slice(1)].map((page) => (
                  <button
                    key={page.value}
                    onClick={() => setActivePageFilter(page.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activePageFilter === page.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Network filter — only show if multiple networks in use */}
            {usedNetworks.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Network</p>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveNetworkFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      activeNetworkFilter === "all"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Networks
                  </button>
                  {usedNetworks.map(net => {
                    const info = getNetworkInfo(net);
                    return (
                      <button
                        key={net}
                        onClick={() => setActiveNetworkFilter(net)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          activeNetworkFilter === net
                            ? `${info.color} shadow-sm`
                            : "border-border bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>}
        </div>

        {/* Credentials tab panel */}
        {activeTab === "credentials" && <NetworkCredentialsTab />}

        {activeTab === "ads" && (showForm || editingAd) && (
          <AdForm
            ad={editingAd || undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingAd(null); }}
            saving={saving}
          />
        )}

        {activeTab === "ads" && (isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading ads...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-foreground font-medium">No ads configured yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Add Ad" to create your first ad for this section.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ad) => {
              const typeInfo = getTypeInfo(ad.type);
              const networkInfo = getNetworkInfo(ad.network || "custom");
              const isDeleting = deletingId === ad.id;

              return (
                <div
                  key={ad.id}
                  className={`bg-card border rounded-xl p-4 transition-all ${
                    ad.isActive ? "border-border" : "border-border/40 opacity-60"
                  }`}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <p className="text-sm text-foreground font-medium">
                        Delete <span className="text-destructive">"{ad.name}"</span>? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(ad.id)}
                          disabled={deleteAd.isPending}
                          className="h-8 text-xs"
                        >
                          {deleteAd.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, Delete"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)} className="h-8 text-xs">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`flex-shrink-0 ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground truncate">{ad.name}</span>
                          {/* Network badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${networkInfo.color}`}>
                            {networkInfo.label}
                          </span>
                          {/* Type badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground bg-muted`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                            {getPageLabel(ad.page)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                            {getPositionLabel(ad.position)}
                          </span>
                          {ad.redirectUrl && (
                            <span className="truncate max-w-[180px]" title={ad.redirectUrl}>
                              → {ad.redirectUrl}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggle(ad.id)}
                          title={ad.isActive ? "Disable ad" : "Enable ad"}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            ad.isActive
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {ad.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {ad.isActive ? "Live" : "Off"}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditingAd(ad); setShowForm(false); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {canDelete() && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(ad.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Network overview summary — ads tab only */}
        {activeTab === "ads" && (ads ?? []).length > 0 && (
          <div className="bg-muted/40 border border-border/60 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Ad Network Overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {AD_NETWORKS.filter(net => (ads ?? []).some(a => (a.network || "custom") === net.value)).map((net) => {
                  const count = (ads ?? []).filter(a => (a.network || "custom") === net.value && a.isActive).length;
                  const total = (ads ?? []).filter(a => (a.network || "custom") === net.value).length;
                  return (
                    <div key={net.value} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${net.color}`}>
                      <span className="text-xs font-medium truncate">{net.label}</span>
                      <span className="text-xs font-bold ml-2 shrink-0">{count}/{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Position Overview</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {AD_POSITIONS.map((pos) => {
                  const count = (ads ?? []).filter((a) => a.position === pos.value && a.isActive).length;
                  return (
                    <div key={pos.value} className="flex items-center justify-between bg-card border border-border/60 rounded-lg px-3 py-2">
                      <span className="text-xs text-foreground">{pos.label}</span>
                      <span className={`text-xs font-bold ${count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {count} active
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
