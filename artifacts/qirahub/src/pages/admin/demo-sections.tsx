import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useSiteSetting, useUpdateSiteSetting } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Star,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  LayoutGrid,
  Info,
  Check,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface DemoSection {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  previewHref: string;
  previewLabel: string;
  details: string[];
}

const DEMO_SECTIONS: DemoSection[] = [
  {
    key: "demo_blog_enabled",
    title: "Blog Posts Demo",
    description: "Shows featured and recent blog posts on the homepage as a showcase section. Users can browse your latest articles directly from the front page.",
    icon: <FileText className="w-5 h-5" />,
    previewHref: "/",
    previewLabel: "View on Home Page",
    details: [
      "Displays up to 6 featured or recent posts",
      "Shows post images, titles, excerpts",
      "Links to individual post pages",
      "Includes a 'View All' button to the blog",
    ],
  },
  {
    key: "demo_reviews_enabled",
    title: "Product Reviews Demo",
    description: "Displays your top-rated products as a review showcase section on the homepage. Helps users discover the best products you cover.",
    icon: <Star className="w-5 h-5" />,
    previewHref: "/",
    previewLabel: "View on Home Page",
    details: [
      "Shows top products sorted by rating",
      "Displays star ratings, pricing, pros & cons",
      "Links to individual product review pages",
      "Includes a 'See All Reviews' button",
    ],
  },
  {
    key: "demo_comparisons_enabled",
    title: "Comparisons Demo",
    description: "Shows recent product comparisons on the homepage. Highlights your side-by-side comparison content and drives traffic to the comparisons section.",
    icon: <BarChart3 className="w-5 h-5" />,
    previewHref: "/comparisons",
    previewLabel: "View Comparisons Page",
    details: [
      "Displays recent/featured comparisons",
      "Shows products being compared",
      "Links to full comparison pages",
      "Includes a 'Compare Tool' CTA",
    ],
  },
];

function DemoSectionCard({ section }: { section: DemoSection }) {
  const { toast } = useToast();
  const { data, isLoading } = useSiteSetting(section.key);
  const updateMutation = useUpdateSiteSetting();

  const isEnabled = data?.value !== "false";

  function toggle() {
    const newValue = isEnabled ? "false" : "true";
    updateMutation.mutate(
      { key: section.key, value: newValue },
      {
        onSuccess: () => {
          toast({
            title: isEnabled ? "Demo section hidden" : "Demo section enabled",
            description: `${section.title} is now ${isEnabled ? "hidden from" : "visible on"} the website.`,
          });
        },
        onError: () => {
          toast({
            title: "Failed to update",
            description: "Could not save the setting. Make sure you are logged in as admin.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${isEnabled ? "border-card-border" : "border-border opacity-75"}`}>
      <div className={`h-1 ${isEnabled ? "bg-primary" : "bg-muted"}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {section.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{section.title}</h3>
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                ) : (
                  <Badge
                    variant="outline"
                    className={isEnabled
                      ? "border-green-500/20 bg-green-500/10 text-green-500 text-[10px]"
                      : "border-border bg-muted text-muted-foreground text-[10px]"
                    }
                  >
                    {isEnabled ? "Visible" : "Hidden"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Setting key: <code className="font-mono text-primary/80">{section.key}</code>
              </p>
            </div>
          </div>

          <Button
            onClick={toggle}
            disabled={updateMutation.isPending || isLoading}
            variant={isEnabled ? "outline" : "default"}
            size="sm"
            className="shrink-0 gap-1.5"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isEnabled ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {isEnabled ? "Hide" : "Show"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{section.description}</p>

        <ul className="space-y-1.5 mb-5">
          {section.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isEnabled ? "text-primary" : "text-muted-foreground/50"}`} />
              {detail}
            </li>
          ))}
        </ul>

        <Link href={section.previewHref}>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-3 h-3" /> {section.previewLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDemoSections() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Demo Section Management</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Control which demo sections are visible on your website. Toggle any section on or off — changes take effect immediately for all visitors.
          </p>

          <div className="mt-4 flex items-start gap-2 bg-muted/40 border border-border rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Demo sections appear on the homepage to showcase your content. When a section is <strong className="text-foreground">hidden</strong>, it's completely removed from the public website. When <strong className="text-foreground">visible</strong>, it shows real content from your database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {DEMO_SECTIONS.map(section => (
            <DemoSectionCard key={section.key} section={section} />
          ))}
        </div>

        <div className="bg-muted/20 border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" /> Preview Home Page
              </Button>
            </Link>
            <Link href="/comparisons">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BarChart3 className="w-3.5 h-3.5" /> Comparisons Page
              </Button>
            </Link>
            <Link href="/compare-tool">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <LayoutGrid className="w-3.5 h-3.5" /> Compare Tool
              </Button>
            </Link>
            <Link href="/admin/comparisons">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BarChart3 className="w-3.5 h-3.5" /> Manage Comparisons
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Star className="w-3.5 h-3.5" /> Manage Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
