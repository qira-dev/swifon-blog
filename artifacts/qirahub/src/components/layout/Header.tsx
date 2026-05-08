import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  Check,
  Languages,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, LANGUAGES, useTranslation } from "@/lib/i18n";
import { adminLogout, isAdminAuthed } from "@/lib/admin-auth";
import { useAuthStore } from "@/lib/user-auth";
import { useSiteSetting } from "@/lib/api-hooks";
import { AvatarDisplay } from "@/components/AvatarPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function stripLangPrefix(path: string): string {
  const match = path.match(/^\/(en|es|hi|ar|fr|bn|de|pt|ko|ru|zh|ja)(\/.*)?$/);
  if (match) return match[2] || "/";
  return path;
}

export function Header() {
  const [location, navigate] = useLocation();
  const { langCode, setLangCode } = useLanguage();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];
  const isAuthed = isAdminAuthed();
  const strippedLocation = stripLangPrefix(location);

  const { data: siteNameData } = useSiteSetting("site_name");
  const { data: logoUrlData } = useSiteSetting("logo_url");
  const siteName = siteNameData?.value || "";
  const logoUrl = logoUrlData?.value || "";

  function handleLogout() {
    adminLogout();
    clearAuth();
    navigate("/");
    setMobileOpen(false);
  }

  function handleLangChange(code: string) {
    setLangCode(code);
    const basePath = stripLangPrefix(location);
    if (code === "en") {
      navigate(basePath);
    } else {
      navigate(`/${code}${basePath === "/" ? "" : basePath}`);
    }
  }

  const navLinks = [
    { href: "/", label: t("home"), active: strippedLocation === "/" },
    { href: "/blog", label: t("blog"), active: strippedLocation.startsWith("/blog") },
    { href: "/categories", label: t("categories"), active: strippedLocation.startsWith("/categories") },
    { href: "/reviews", label: t("reviews"), active: strippedLocation.startsWith("/reviews") },
    { href: "/comparisons", label: "Compare", active: strippedLocation.startsWith("/comparisons") || strippedLocation.startsWith("/compare") },
    { href: "/contact", label: t("contact"), active: strippedLocation === "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto px-4 h-[62px] flex items-center gap-6">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            onClick={() => setMobileOpen(false)}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName || "QiraHub"}
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-primary/30 group-hover:shadow-md transition-shadow">
                  <span className="font-black text-primary-foreground text-base leading-none tracking-tighter">
                    {siteName ? siteName.charAt(0).toUpperCase() : "Q"}
                  </span>
                </div>
                <span className="font-extrabold text-[17px] tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {siteName || <span>Qira<span className="text-primary">Hub</span></span>}
                </span>
              </>
            )}
          </Link>

          {/* ── Separator ── */}
          <div className="hidden md:block h-5 w-px bg-border shrink-0" />

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    "relative px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150 select-none",
                    link.active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                  {link.active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                  )}
                </span>
              </Link>
            ))}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Language picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 px-2.5 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-transparent hover:border-border/50 transition-all"
                >
                  <img
                    src={`https://flagcdn.com/w20/${currentLang.countryCode}.png`}
                    alt={currentLang.name}
                    width={20}
                    height={15}
                    className="rounded-sm object-cover shrink-0"
                  />
                  <span className="hidden sm:inline text-xs font-semibold tracking-wide uppercase">
                    {currentLang.code}
                  </span>
                  <ChevronDown className="h-3 w-3 hidden sm:block opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[230px] p-1.5 bg-card border-border shadow-xl rounded-xl"
              >
                <div className="px-2 py-1.5 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    <Languages className="w-3 h-3" />
                    Language
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = langCode === lang.code;
                    return (
                      <DropdownMenuItem
                        key={lang.code}
                        onSelect={() => handleLangChange(lang.code)}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold focus:bg-primary/15"
                            : "text-foreground hover:bg-muted focus:bg-muted"
                        )}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                          alt={lang.name}
                          width={20}
                          height={15}
                          className="rounded-sm object-cover shrink-0"
                        />
                        <span className="flex-1 truncate text-[13px]">{lang.name}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 shrink-0 text-primary" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Separator */}
            <div className="hidden sm:block h-5 w-px bg-border" />

            {/* User menu (desktop) */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 px-2.5 h-8 rounded-full text-foreground hover:bg-muted/70 border border-transparent hover:border-border/50 transition-all"
                    data-testid="user-menu-trigger"
                  >
                    <AvatarDisplay avatarUrl={user.avatarUrl} size={24} />
                    <span className="text-sm font-medium max-w-[90px] truncate leading-none">
                      {user.displayName || user.username}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-card border-border shadow-xl rounded-xl p-1.5"
                >
                  {/* User header */}
                  <div className="px-3 py-3 flex items-center gap-3 rounded-lg bg-muted/40 mb-1">
                    <AvatarDisplay avatarUrl={user.avatarUrl} size={40} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onSelect={() => navigate("/profile")}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer"
                    data-testid="link-profile"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    {t("myProfile")}
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem
                      onSelect={() => navigate("/admin")}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      {t("admin")}
                    </DropdownMenuItem>
                  )}
                  {!user.isAdmin && user.role === "moderator" && (
                    <DropdownMenuItem
                      onSelect={() => navigate("/admin")}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-primary focus:text-primary"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Moderator Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-border/60" />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    data-testid="btn-user-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button
                  size="sm"
                  className="h-8 px-4 text-sm font-semibold rounded-full gap-1.5 shadow-sm hover:shadow-primary/20 hover:shadow-md transition-shadow"
                  data-testid="link-login"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t("signIn")}
                </Button>
              </Link>
            )}

            {/* Admin-only logout (when admin key login but no user session) */}
            {!user && isAuthed && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex h-8 px-3 text-sm text-muted-foreground hover:text-foreground rounded-full"
                data-testid="link-logout"
                onClick={handleLogout}
              >
                {t("logout")}
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-lg"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </Button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-background/98 backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
            <div className="container mx-auto px-4 py-3 space-y-0.5">
              {/* Nav links */}
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                      link.active
                        ? "text-primary bg-primary/8 border border-primary/20"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {link.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    {link.label}
                  </div>
                </Link>
              ))}

              {/* Language section */}
              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Language
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = langCode === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLangChange(lang.code);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                          alt={lang.name}
                          width={20}
                          height={15}
                          className="rounded-sm object-cover shrink-0"
                        />
                        <span className="flex-1 truncate text-xs">{lang.name}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User section */}
              <div className="border-t border-border/60 pt-2 space-y-0.5">
                {user ? (
                  <>
                    <div className="px-3 py-2.5 flex items-center gap-3 rounded-xl bg-muted/40">
                      <AvatarDisplay avatarUrl={user.avatarUrl} size={36} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        {t("myProfile")}
                      </div>
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                          {t("admin")}
                        </div>
                      </Link>
                    )}
                    {!user.isAdmin && user.role === "moderator" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10">
                          <LayoutDashboard className="w-4 h-4" />
                          Moderator Panel
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-sm">
                      <LogIn className="h-4 w-4" />
                      {t("signIn")}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          style={{ top: "62px" }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
