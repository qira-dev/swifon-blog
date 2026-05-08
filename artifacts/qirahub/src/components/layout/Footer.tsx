import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useSocialLinks, useSiteSetting } from "@/lib/api-hooks";
import { useListCategories } from "@workspace/api-client-react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
  MessageCircle,
  Mail,
  ArrowRight,
  Zap,
  Shield,
  Key,
  Package,
  Cpu,
  Star,
  Layout as LayoutIcon,
  Scale,
  BookOpen,
  Rss,
  Phone,
  Info,
  Lock,
  FileText,
  Ticket,
} from "lucide-react";

function getSocialIcon(platform: string) {
  const icons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    x: <Twitter className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    github: <Github className="w-4 h-4" />,
    tiktok: <MessageCircle className="w-4 h-4" />,
    whatsapp: <MessageCircle className="w-4 h-4" />,
    telegram: <MessageCircle className="w-4 h-4" />,
    discord: <MessageCircle className="w-4 h-4" />,
    mail: <Mail className="w-4 h-4" />,
  };
  return icons[platform.toLowerCase()] || <Globe className="w-4 h-4" />;
}

function getCategoryIcon(name: string) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("ai") || lower.includes("tool")) return <Zap className="w-3.5 h-3.5" />;
  if (lower.includes("vpn") || lower.includes("privacy")) return <Shield className="w-3.5 h-3.5" />;
  if (lower.includes("host")) return <Globe className="w-3.5 h-3.5" />;
  if (lower.includes("password")) return <Key className="w-3.5 h-3.5" />;
  if (lower.includes("cpu") || lower.includes("hardware")) return <Cpu className="w-3.5 h-3.5" />;
  if (lower.includes("software")) return <Package className="w-3.5 h-3.5" />;
  if (lower.includes("review")) return <Star className="w-3.5 h-3.5" />;
  if (lower.includes("antivirus") || lower.includes("security")) return <Lock className="w-3.5 h-3.5" />;
  return <LayoutIcon className="w-3.5 h-3.5" />;
}

export function Footer() {
  const { t } = useTranslation();
  const { data: socialLinks } = useSocialLinks();
  const { data: categories } = useListCategories({});
  const { data: siteNameData } = useSiteSetting("site_name");
  const { data: logoUrlData } = useSiteSetting("logo_url");
  const siteName = siteNameData?.value || "";
  const logoUrl = logoUrlData?.value || "";
  const activeLinks = socialLinks?.filter((l) => l.isActive) ?? [];

  const visibleCategories = (categories || [])
    .filter((c: any) => c.isVisible !== false && !c.parentId)
    .slice(0, 8);

  return (
    <footer className="border-t border-border bg-card/80 mt-20">
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(ellipse at bottom left, var(--primary) 0%, transparent 60%)" }} />

      <div className="relative container mx-auto px-4">
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName || "QiraHub"}
                  className="h-9 w-auto max-w-[130px] object-contain"
                />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-primary/40 group-hover:shadow-md transition-shadow">
                    <span className="font-black text-primary-foreground text-base leading-none tracking-tighter">
                      {siteName ? siteName.charAt(0).toUpperCase() : "Q"}
                    </span>
                  </div>
                  <span className="font-extrabold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {siteName || <span>Qira<span className="text-primary">Hub</span></span>}
                  </span>
                </>
              )}
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              {t("heroSubtitle")}
            </p>

            {activeLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary flex items-center justify-center text-muted-foreground transition-all duration-200 border border-border hover:border-primary/30"
                    title={link.platform}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}

            {/* Newsletter mini */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("newsletter")}</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input
                    type="email"
                    placeholder={t("email")}
                    className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50 transition-colors"
                  />
                </div>
                <button className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0">
                  {t("subscribe")}
                </button>
              </div>
            </div>
          </div>

          {/* Categories column */}
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-5 flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              {t("categories")}
            </h4>
            <ul className="space-y-3 text-sm">
              {visibleCategories.length > 0 ? (
                visibleCategories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0">
                        {getCategoryIcon(cat.name)}
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  {[
                    { href: "/categories/ai-tools", icon: <Zap className="w-3.5 h-3.5" />, label: t("aiTools") },
                    { href: "/categories/vpn-services", icon: <Shield className="w-3.5 h-3.5" />, label: t("vpnServices") },
                    { href: "/categories/web-hosting", icon: <Globe className="w-3.5 h-3.5" />, label: t("webHosting") },
                    { href: "/categories/password-managers", icon: <Key className="w-3.5 h-3.5" />, label: t("passwordManagers") },
                    { href: "/categories/software", icon: <Package className="w-3.5 h-3.5" />, label: t("software") },
                  ].map((item, i) => (
                    <li key={i}>
                      <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
                        <span className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Quick Links column */}
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-5 flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/", icon: <LayoutIcon className="w-3.5 h-3.5" />, label: t("home") },
                { href: "/blog", icon: <Rss className="w-3.5 h-3.5" />, label: t("blog") },
                { href: "/reviews", icon: <Star className="w-3.5 h-3.5" />, label: t("reviews") },
                { href: "/comparisons", icon: <Scale className="w-3.5 h-3.5" />, label: "Comparisons" },
                { href: "/compare-tool", icon: <BookOpen className="w-3.5 h-3.5" />, label: "Compare Tool" },
                { href: "/coupons", icon: <Ticket className="w-3.5 h-3.5" />, label: "Coupon Codes" },
                { href: "/about", icon: <Info className="w-3.5 h-3.5" />, label: t("about") },
                { href: "/contact", icon: <Phone className="w-3.5 h-3.5" />, label: t("contact") },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-5 flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/privacy", icon: <Lock className="w-3.5 h-3.5" />, label: t("privacyTitle") },
                { href: "/terms", icon: <FileText className="w-3.5 h-3.5" />, label: t("termsTitle") },
                { href: "/contact", icon: <Mail className="w-3.5 h-3.5" />, label: t("contact") },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-primary/5 border border-primary/15 rounded-xl">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-semibold">Affiliate Disclosure:</span> Some links on this site may earn us a commission at no extra cost to you.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                <span className="font-black text-primary-foreground text-[10px] leading-none">Q</span>
              </div>
              <p>&copy; {new Date().getFullYear()} {siteName || "QiraHub"}. {t("allRightsReserved")}</p>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-primary transition-colors">{t("privacyTitle")}</Link>
              <span className="text-border">·</span>
              <Link href="/terms" className="hover:text-primary transition-colors">{t("termsTitle")}</Link>
              <span className="text-border">·</span>
              <Link href="/contact" className="hover:text-primary transition-colors">{t("contact")}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
