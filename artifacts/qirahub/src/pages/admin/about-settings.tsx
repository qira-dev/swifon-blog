import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { useSiteSetting, useUpdateSiteSetting } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, Info, Loader2, CheckCircle, Eye } from "lucide-react";

export default function AdminAboutSettings() {
  const { data: titleData, isLoading: loadingTitle } = useSiteSetting("about_title");
  const { data: contentData, isLoading: loadingContent } = useSiteSetting("about_content");
  const updateMutation = useUpdateSiteSetting();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (titleData?.value) setTitle(titleData.value);
  }, [titleData]);

  useEffect(() => {
    if (contentData?.value) setContent(contentData.value);
  }, [contentData]);

  const handleSave = async () => {
    await Promise.all([
      updateMutation.mutateAsync({ key: "about_title", value: title }),
      updateMutation.mutateAsync({ key: "about_content", value: content }),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isLoading = loadingTitle || loadingContent;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">About Us</h1>
            <p className="text-muted-foreground mt-1">Customize the About Us page content</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)} className="gap-2">
              <Eye className="w-4 h-4" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || isLoading}
              className="gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : preview ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">{title || "About Us"}</h1>
              <div
                className="prose prose-invert max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: content || "<p>No content yet.</p>" }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Page Content</h3>
                <p className="text-sm text-muted-foreground">Edit the title and content of your About Us page</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Page Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="About QiraHub"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Page Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter your About Us content here... Use HTML tags for formatting."
                />
                <p className="text-xs text-muted-foreground">
                  Supports HTML formatting. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; tags for structured content.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
