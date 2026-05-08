import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { useSiteSetting, useUpdateSiteSetting } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, CheckCircle, Globe, Type, Image, Info, Share2, ShieldCheck, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function TextField({
  settingKey,
  label,
  placeholder,
  hint,
  maxLen,
  prefix,
}: {
  settingKey: string;
  label: string;
  placeholder?: string;
  hint?: string;
  maxLen?: number;
  prefix?: string;
}) {
  const { data, isLoading } = useSiteSetting(settingKey);
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.value !== undefined) setValue(data.value ?? "");
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ key: settingKey, value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={settingKey}>{label}</Label>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending} className="h-7 text-xs gap-1.5">
          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Save className="w-3 h-3" />}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
      {prefix ? (
        <div className="flex items-center border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
          <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r border-border select-none">{prefix}</span>
          <Input
            id={settingKey}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLen}
            className="border-0 focus-visible:ring-0 rounded-none"
          />
        </div>
      ) : (
        <Input
          id={settingKey}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLen}
        />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {maxLen && (
        <div className="flex items-center justify-between">
          <span />
          <p className={`text-xs ${value.length > maxLen * 0.9 ? "text-orange-500" : "text-muted-foreground"}`}>
            {value.length}/{maxLen} characters
          </p>
        </div>
      )}
    </div>
  );
}

function TextAreaField({
  settingKey,
  label,
  placeholder,
  hint,
  maxLen,
  rows = 4,
}: {
  settingKey: string;
  label: string;
  placeholder?: string;
  hint?: string;
  maxLen?: number;
  rows?: number;
}) {
  const { data, isLoading } = useSiteSetting(settingKey);
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.value !== undefined) setValue(data.value ?? "");
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ key: settingKey, value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-24 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={settingKey}>{label}</Label>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending} className="h-7 text-xs gap-1.5">
          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Save className="w-3 h-3" />}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
      <Textarea
        id={settingKey}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLen}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {maxLen && (
        <div className="flex items-center justify-between">
          <span />
          <p className={`text-xs ${value.length > maxLen * 0.9 ? "text-orange-500" : "text-muted-foreground"}`}>
            {value.length}/{maxLen} characters
          </p>
        </div>
      )}
    </div>
  );
}

function SelectField({
  settingKey,
  label,
  hint,
  options,
}: {
  settingKey: string;
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
}) {
  const { data, isLoading } = useSiteSetting(settingKey);
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.value !== undefined) setValue(data.value ?? options[0].value);
  }, [data]);

  const handleChange = async (val: string) => {
    setValue(val);
    try {
      await updateMutation.mutateAsync({ key: settingKey, value: val });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={settingKey}>{label}</Label>
        {saved && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved!</span>}
      </div>
      <Select value={value || options[0].value} onValueChange={handleChange}>
        <SelectTrigger id={settingKey}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ImagePreview({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div className="mt-2">
      <img
        src={url}
        alt="Preview"
        className="h-10 object-contain rounded border border-border bg-muted/30 p-1"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

function OgImageField() {
  const { data, isLoading } = useSiteSetting("og_image_url");
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.value !== undefined) setValue(data.value ?? "");
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ key: "og_image_url", value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="h-10 bg-muted animate-pulse rounded-md" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="og_image_url">Default Social Share Image</Label>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending} className="h-7 text-xs gap-1.5">
          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Save className="w-3 h-3" />}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
      <Input id="og_image_url" value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com/og-image.jpg" />
      <p className="text-xs text-muted-foreground">Used as <code className="bg-muted px-1 rounded text-[11px]">og:image</code> and <code className="bg-muted px-1 rounded text-[11px]">twitter:image</code> when sharing on social media. Recommended size: <strong>1200 × 630 px</strong>.</p>
      {value && (
        <div className="border border-border rounded-lg overflow-hidden bg-muted/30 mt-2">
          <img
            src={value}
            alt="OG image preview"
            className="w-full max-h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <p className="text-xs text-muted-foreground px-2 py-1">Social share preview (1200×630 recommended)</p>
        </div>
      )}
    </div>
  );
}

function FaviconField() {
  const { data, isLoading } = useSiteSetting("favicon_url");
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.value !== undefined) setValue(data.value ?? "");
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ key: "favicon_url", value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="h-10 bg-muted animate-pulse rounded-md" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="favicon_url">Favicon URL</Label>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending} className="h-7 text-xs gap-1.5">
          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Save className="w-3 h-3" />}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
      <Input id="favicon_url" value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com/favicon.ico" />
      <p className="text-xs text-muted-foreground">URL to your favicon (recommended: 32×32 .ico or .png)</p>
      {value && (
        <img
          src={value}
          alt="Favicon preview"
          className="w-8 h-8 object-contain rounded border border-border bg-muted/30 p-0.5"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}

function LogoField() {
  const { data, isLoading } = useSiteSetting("logo_url");
  const updateMutation = useUpdateSiteSetting();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (data?.value !== undefined) setValue(data.value ?? "");
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ key: "logo_url", value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="h-10 bg-muted animate-pulse rounded-md" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="logo_url">Logo URL</Label>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={updateMutation.isPending} className="h-7 text-xs gap-1.5">
          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Save className="w-3 h-3" />}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
      <Input id="logo_url" value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com/logo.png" />
      <p className="text-xs text-muted-foreground">URL to your logo image (recommended: 200×50 px, transparent background)</p>
      <ImagePreview url={value} />
    </div>
  );
}

const SECTION_HEADER = (icon: React.ReactNode, title: string, subtitle: string) => (
  <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

export default function AdminSeoSettings() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO & Site Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure site identity, meta tags, structured data, and social sharing. Every field here is reflected on the public site automatically.
          </p>
        </div>

        {/* General */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {SECTION_HEADER(<Info className="w-4 h-4" />, "General Information", "Your site's name, tagline, and author")}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                settingKey="site_name"
                label="Site Name"
                placeholder="QiraHub"
                hint="Shown in the browser tab, header, and used in schema.org structured data."
              />
              <TextField
                settingKey="site_tagline"
                label="Tagline"
                placeholder="Your trusted product comparison hub"
                hint="Appended to the site name when no custom meta title is set."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                settingKey="author_name"
                label="Author / Publisher Name"
                placeholder="QiraHub Editorial"
                hint='Used in the <meta name="author"> tag and Article schema for posts.'
              />
              <TextField
                settingKey="site_url"
                label="Canonical Site URL"
                placeholder="https://www.example.com"
                hint="Your primary domain, used for canonical links, og:url, and structured data. Include https://, no trailing slash."
              />
            </div>
            <TextAreaField
              settingKey="site_description"
              label="Site Description"
              placeholder="Describe your website in 1–2 sentences..."
              rows={3}
              hint="Used internally and as a fallback in the site schema. Keep it under 200 characters."
            />
          </div>
        </div>

        {/* SEO Meta Tags */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {SECTION_HEADER(<Globe className="w-4 h-4" />, "Search Engine Meta Tags", "What appears in Google search results")}
          <div className="p-6 space-y-6">
            <TextField
              settingKey="meta_title"
              label="Homepage Meta Title"
              placeholder="QiraHub – Your trusted product comparison hub"
              maxLen={60}
              hint="The clickable headline shown in search results. Keep it 50–60 characters for best results."
            />
            <TextAreaField
              settingKey="meta_description"
              label="Homepage Meta Description"
              placeholder="Discover expert product reviews and comparisons at QiraHub. Find the best tools, apps, and services for your needs."
              maxLen={160}
              rows={3}
              hint="The snippet shown under your title in search results. Aim for 120–160 characters. Include your main keyword naturally."
            />
            <TextField
              settingKey="meta_keywords"
              label="Meta Keywords"
              placeholder="product reviews, comparisons, software tools, best apps"
              hint="Comma-separated. This tag has minimal ranking impact today but is still read by some smaller search engines."
            />
            <SelectField
              settingKey="robots_meta"
              label="Search Engine Crawling (Robots)"
              options={[
                { value: "index, follow", label: "index, follow — Allow indexing & link following (recommended)" },
                { value: "noindex, follow", label: "noindex, follow — Block indexing, allow link following" },
                { value: "index, nofollow", label: "index, nofollow — Allow indexing, block link following" },
                { value: "noindex, nofollow", label: "noindex, nofollow — Block everything (use for staging/dev)" },
              ]}
              hint='Controls the <meta name="robots"> tag. Individual pages (posts, products) manage their own robots directives.'
            />
          </div>
        </div>

        {/* Social Sharing (Open Graph + Twitter) */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {SECTION_HEADER(<Share2 className="w-4 h-4" />, "Social Sharing", "How your site looks when shared on Facebook, X/Twitter, LinkedIn, WhatsApp")}
          <div className="p-6 space-y-6">
            <OgImageField />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                settingKey="twitter_handle"
                label="Twitter / X Handle"
                placeholder="@yoursite"
                prefix="@"
                hint='Added to twitter:site and twitter:creator meta tags. Enter without the @ symbol (it is added automatically).'
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold text-foreground mb-1">How these tags are used</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li><code className="bg-background border border-border rounded px-1">og:image</code> — used by Facebook, LinkedIn, WhatsApp, Slack, Discord</li>
                <li><code className="bg-background border border-border rounded px-1">twitter:card</code> — always set to <em>summary_large_image</em> for maximum visibility</li>
                <li><code className="bg-background border border-border rounded px-1">twitter:site</code> — attributes the card to your account</li>
                <li>Individual blog posts override these with their own featured images automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {SECTION_HEADER(<Image className="w-4 h-4" />, "Branding Assets", "Logo and favicon shown on the site")}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LogoField />
              <FaviconField />
            </div>
          </div>
        </div>

        {/* Verification & Schema */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {SECTION_HEADER(<ShieldCheck className="w-4 h-4" />, "Search Console & Verification", "Verify ownership with Google and other search engines")}
          <div className="p-6 space-y-6">
            <TextField
              settingKey="google_site_verification"
              label="Google Site Verification"
              placeholder="abc123XYZ..."
              hint='The content value from the <meta name="google-site-verification"> tag provided by Google Search Console. Paste only the value, not the full tag.'
            />
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">How to get your Google verification code</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to <strong>Google Search Console</strong> → Add Property</li>
                <li>Choose <strong>URL prefix</strong> and enter your site URL</li>
                <li>Select <strong>HTML tag</strong> as the verification method</li>
                <li>Copy only the <code className="bg-background border border-border rounded px-1">content="..."</code> value and paste it above</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Structured Data info */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {SECTION_HEADER(<Code2 className="w-4 h-4" />, "Structured Data (JSON-LD)", "Automatically generated from your settings above")}
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              The site automatically injects two structured data schemas into every page using the settings above. No manual configuration is needed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold text-foreground mb-2">WebSite Schema</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Site name, URL, and description</li>
                  <li>• SearchAction for Google Sitelinks Search Box</li>
                  <li>• Updated automatically when settings change</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold text-foreground mb-2">Organization Schema</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Publisher name and URL</li>
                  <li>• Logo image</li>
                  <li>• Social media profiles (Twitter handle)</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold text-foreground mb-2">Article Schema (per post)</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Headline, description, image</li>
                  <li>• Published & modified date</li>
                  <li>• Author and publisher</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold text-foreground mb-2">Product Schema (per product)</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Product name, description, image</li>
                  <li>• Star rating and review count</li>
                  <li>• Enables rich snippets in search results</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
