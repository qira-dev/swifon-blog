import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link, useLocation, Redirect } from "wouter";
import { setAdminKeyGetter, setAuthTokenGetter } from "@workspace/api-client-react";
import { getAdminRole, type AdminRole } from "@/lib/admin-auth";
import {
  FileText,
  Folder,
  Globe,
  LayoutDashboard,
  Package,
  BarChart3,
  Shield,
  Share2,
  Info,
  MessageSquare,
  Users,
  ChevronRight,
  Palette,
  Menu,
  X,
  Megaphone,
  Ticket,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  Activity,
  MailCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

setAdminKeyGetter(() => null);
setAuthTokenGetter(() =>
  sessionStorage.getItem("qirahub_admin_authed") === "1"
    ? sessionStorage.getItem("qirahub_user_token")
    : null
);

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: AdminRole[];
};

type MenuGroup = MenuItem[];

const menuGroups: MenuGroup[] = [
  [
    { name: "Dashboard",   href: "/admin",              icon: LayoutDashboard, roles: ["key_admin", "admin", "moderator"] },
    { name: "Analytics",   href: "/admin/analytics",    icon: Activity,        roles: ["key_admin", "admin", "moderator"] },
    { name: "Posts",       href: "/admin/posts",        icon: FileText,        roles: ["key_admin", "admin", "moderator"] },
    { name: "Categories",  href: "/admin/categories",   icon: Folder,          roles: ["key_admin", "admin", "moderator"] },
    { name: "Products",    href: "/admin/products",     icon: Package,         roles: ["key_admin", "admin", "moderator"] },
    { name: "Comparisons", href: "/admin/comparisons",  icon: BarChart3,       roles: ["key_admin", "admin", "moderator"] },
  ],
  [
    { name: "Translations", href: "/admin/translations", icon: Globe,         roles: ["key_admin", "admin", "moderator"] },
    { name: "Coupons",      href: "/admin/coupons",      icon: Ticket,        roles: ["key_admin", "admin", "moderator"] },
    { name: "Messages",     href: "/admin/messages",     icon: MessageSquare, roles: ["key_admin", "admin", "moderator"] },
  ],
  [
    { name: "Audit Log",     href: "/admin/audit-log",      icon: ShieldAlert, roles: ["key_admin"] },
  ],
  [
    { name: "Ad Management", href: "/admin/ads",            icon: Megaphone,  roles: ["key_admin", "admin"] },
    { name: "Appearance",    href: "/admin/appearance",     icon: Palette,    roles: ["key_admin", "admin"] },
    { name: "SEO Settings",  href: "/admin/seo-settings",  icon: Globe,      roles: ["key_admin", "admin"] },
    { name: "Site Settings", href: "/admin/site-settings", icon: Shield,     roles: ["key_admin", "admin"] },
    { name: "About Us",      href: "/admin/about-settings", icon: Info,      roles: ["key_admin", "admin"] },
    { name: "Social Links",  href: "/admin/social-links",  icon: Share2,     roles: ["key_admin", "admin"] },
    { name: "Email Settings",href: "/admin/email-settings",icon: MailCheck,  roles: ["key_admin", "admin"] },
    { name: "Users",         href: "/admin/users",          icon: Users,     roles: ["key_admin", "admin"] },
  ],
];

/** Paths a Moderator is allowed to visit (prefix-matched). */
const MODERATOR_ALLOWED_PATHS = [
  "/admin/analytics",
  "/admin/posts",
  "/admin/categories",
  "/admin/products",
  "/admin/comparisons",
  "/admin/translations",
  "/admin/coupons",
  "/admin/messages",
  "/admin",
];

const STORAGE_KEY = "qirahub_admin_sidebar_collapsed";

const ROLE_LABELS: Record<AdminRole, { label: string; color: string }> = {
  key_admin:  { label: "Admin",     color: "bg-primary/10 text-primary border-primary/20" },
  admin:      { label: "Admin",     color: "bg-primary/10 text-primary border-primary/20" },
  moderator:  { label: "Moderator", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

function NavItem({
  item,
  location,
  collapsed,
  onNavClick,
}: {
  item: MenuItem;
  location: string;
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const Icon = item.icon;
  const isActive =
    item.href === "/admin"
      ? location === "/admin"
      : location.startsWith(item.href);

  return (
    <Link href={item.href} onClick={onNavClick}>
      <div
        title={collapsed ? item.name : undefined}
        className={`group relative flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-150 ${
          collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
        } ${
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Icon className="shrink-0 w-5 h-5" />
        {!collapsed && (
          <>
            <span className="flex-1 text-sm">{item.name}</span>
            {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
          </>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
            <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg">
              {item.name}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function SidebarNav({
  location,
  collapsed,
  role,
  onNavClick,
}: {
  location: string;
  collapsed: boolean;
  role: AdminRole;
  onNavClick?: () => void;
}) {
  const visibleGroups = menuGroups
    .map(group => group.filter(item => item.roles.includes(role)))
    .filter(group => group.length > 0);

  return (
    <nav className="p-2 flex-1 overflow-y-auto">
      {visibleGroups.map((group, idx) => (
        <div key={idx}>
          {idx > 0 && <div className="border-t border-border my-2" />}
          <div className="space-y-0.5">
            {group.map(item => (
              <NavItem
                key={item.href}
                item={item}
                location={location}
                collapsed={collapsed}
                onNavClick={onNavClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Go to Website */}
      <div className="border-t border-border my-2" />
      <a href="/" target="_blank" rel="noopener noreferrer" onClick={onNavClick}>
        <div
          title={collapsed ? "Go to Website" : undefined}
          className={`group relative flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-150 text-muted-foreground hover:bg-muted hover:text-foreground ${
            collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
          }`}
        >
          <ExternalLink className="shrink-0 w-5 h-5" />
          {!collapsed && <span className="flex-1 text-sm">Go to Website</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
              <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg">
                Go to Website
              </div>
            </div>
          )}
        </div>
      </a>
    </nav>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const role = getAdminRole();
  const roleInfo = ROLE_LABELS[role];

  const isModeratorRestricted =
    role === "moderator" &&
    !MODERATOR_ALLOWED_PATHS.some(
      (p) => location === p || location.startsWith(p + "/")
    );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  if (isModeratorRestricted) {
    return <Redirect to="/admin" />;
  }

  return (
    <Layout>
      <div className="py-4 md:py-6 px-3 md:px-4 max-w-7xl mx-auto">

        {/* Mobile top bar */}
        <div className="flex md:hidden items-center justify-between mb-4 bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Toggle admin menu"
              data-testid="admin-mobile-menu-toggle"
              className="h-8 w-8"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Go to Website">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        {mobileOpen && (
          <div className="md:hidden mb-4 bg-card border border-border rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <SidebarNav location={location} collapsed={false} role={role} onNavClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Desktop layout: sidebar + content */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">

          {/* Desktop sidebar */}
          <div
            className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
              collapsed ? "w-[56px]" : "w-64"
            }`}
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-7rem)]">

              {/* Sidebar header */}
              <div className={`border-b border-border flex items-center gap-2 bg-sidebar shrink-0 ${
                collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
              }`}>
                {!collapsed && (
                  <>
                    <LayoutDashboard className="w-4 h-4 text-sidebar-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-sidebar-foreground text-sm select-none truncate">
                        Admin Panel
                      </h2>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border inline-block mt-0.5 ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </>
                )}
                <button
                  onClick={() => setCollapsed(prev => !prev)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  data-testid="admin-sidebar-toggle"
                  className={`flex items-center justify-center rounded-md w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                    collapsed ? "" : "ml-auto"
                  }`}
                >
                  {collapsed
                    ? <PanelLeftOpen className="w-4 h-4" />
                    : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>

              {/* Nav items */}
              <SidebarNav location={location} collapsed={collapsed} role={role} />
            </div>
          </div>

          {/* Main content */}
          <div key={location} className="flex-1 min-w-0 admin-page-enter">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}
