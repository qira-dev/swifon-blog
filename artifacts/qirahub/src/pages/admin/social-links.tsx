import { canDelete } from "@/lib/admin-auth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import {
  useSocialLinks,
  useCreateSocialLink,
  useUpdateSocialLink,
  useDeleteSocialLink,
  type SocialLink,
} from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  Save,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
  MessageCircle,
} from "lucide-react";

const PLATFORM_OPTIONS = [
  { value: "facebook", label: "Facebook", icon: <Facebook className="w-4 h-4" /> },
  { value: "twitter", label: "Twitter / X", icon: <Twitter className="w-4 h-4" /> },
  { value: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" /> },
  { value: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" /> },
  { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-4 h-4" /> },
  { value: "github", label: "GitHub", icon: <Github className="w-4 h-4" /> },
  { value: "tiktok", label: "TikTok", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "pinterest", label: "Pinterest", icon: <Globe className="w-4 h-4" /> },
  { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "telegram", label: "Telegram", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "discord", label: "Discord", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <Globe className="w-4 h-4" /> },
];

function getPlatformIcon(platform: string) {
  const p = PLATFORM_OPTIONS.find((o) => o.value === platform.toLowerCase());
  return p?.icon || <Globe className="w-4 h-4" />;
}

function LinkForm({
  link,
  onSave,
  onCancel,
  saving,
}: {
  link?: SocialLink;
  onSave: (data: Partial<SocialLink>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [platform, setPlatform] = useState(link?.platform || "");
  const [url, setUrl] = useState(link?.url || "");
  const [sortOrder, setSortOrder] = useState(link?.sortOrder ?? 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-foreground">
        {link ? "Edit Social Link" : "Add New Social Link"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select platform...</option>
            {PLATFORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Sort Order</label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <X className="w-4 h-4" /> Cancel
        </Button>
        <Button
          onClick={() => onSave({ platform, url, icon: platform, sortOrder })}
          disabled={!platform || !url || saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {link ? "Update" : "Add"} Link
        </Button>
      </div>
    </div>
  );
}

export default function AdminSocialLinks() {
  const { data: links, isLoading } = useSocialLinks();
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  const deleteMutation = useDeleteSocialLink();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialLink | null>(null);

  const handleCreate = async (data: Partial<SocialLink>) => {
    await createMutation.mutateAsync(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: Partial<SocialLink>) => {
    if (!editing) return;
    await updateMutation.mutateAsync({ id: editing.id, ...data });
    setEditing(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Social Media Links</h1>
            <p className="text-muted-foreground mt-1">Manage your social media links displayed in the footer</p>
          </div>
          {!showForm && !editing && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Link
            </Button>
          )}
        </div>

        {showForm && (
          <LinkForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={createMutation.isPending}
          />
        )}

        {editing && (
          <LinkForm
            link={editing}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
            saving={updateMutation.isPending}
          />
        )}

        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : !links?.length ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Globe className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Social Links Yet</h3>
            <p className="text-muted-foreground mb-4">Add your social media profiles to display them in the website footer.</p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Your First Link
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 bg-muted/40 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {links.length} Social Link{links.length !== 1 ? "s" : ""}
              </h3>
            </div>
            <div className="divide-y divide-border/60">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground">
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground capitalize">{link.platform}</h4>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      link.isActive
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {link.isActive ? "Active" : "Hidden"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(link);
                        setShowForm(false);
                      }}
                    >
                      Edit
                    </Button>
                    {canDelete() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this social link?")) {
                            deleteMutation.mutate(link.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
