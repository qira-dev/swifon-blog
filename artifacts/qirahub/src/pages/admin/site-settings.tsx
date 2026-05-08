import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { useSiteSetting, useUpdateSiteSetting } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, Shield, Loader2, CheckCircle } from "lucide-react";

function SettingEditor({ settingKey, title, icon, description }: {
  settingKey: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}) {
  const { data, isLoading } = useSiteSetting(settingKey);
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.value) setValue(data.value);
  }, [data]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({ key: settingKey, value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
      <div className="p-4">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
          placeholder={`Enter your ${title.toLowerCase()} content here... You can use HTML tags for formatting.`}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Supports HTML formatting. Use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; tags for structured content.
        </p>
      </div>
    </div>
  );
}

export default function AdminSiteSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your Privacy Policy and Terms of Service content</p>
        </div>

        <SettingEditor
          settingKey="privacy_policy"
          title="Privacy Policy"
          icon={<Shield className="w-5 h-5" />}
          description="Update the privacy policy displayed on your website"
        />

        <SettingEditor
          settingKey="terms_of_service"
          title="Terms of Service"
          icon={<FileText className="w-5 h-5" />}
          description="Update the terms of service displayed on your website"
        />
      </div>
    </AdminLayout>
  );
}
