import { Switch, Route, Router as WouterRouter, Redirect, useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteThemeProvider } from "@/components/SiteThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToggleButton } from "@/components/ScrollToggleButton";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import BlogList from "@/pages/blog/index";
import BlogPost from "@/pages/blog/[slug]";
import CategoryList from "@/pages/categories/index";
import CategoryDetail from "@/pages/categories/[slug]";
import Reviews from "@/pages/reviews";
import Contact from "@/pages/contact";
import ProductReview from "@/pages/product/[slug]";
import ComparisonPage from "@/pages/compare/[slug]";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import Profile from "@/pages/profile";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/index";
import AdminPosts from "@/pages/admin/posts/index";
import AdminPostForm from "@/pages/admin/posts/form";
import AdminCategories from "@/pages/admin/categories";
import AdminTranslations from "@/pages/admin/translations";
import AdminProducts from "@/pages/admin/products";
import AdminComparisons from "@/pages/admin/comparisons";
import AdminSiteSettings from "@/pages/admin/site-settings";
import AdminSeoSettings from "@/pages/admin/seo-settings";
import AdminSecuritySettings from "@/pages/admin/security-settings";
import AdminAboutSettings from "@/pages/admin/about-settings";
import AdminSocialLinks from "@/pages/admin/social-links";
import AdminMessages from "@/pages/admin/messages";
import AdminUsers from "@/pages/admin/users";
import AdminAppearance from "@/pages/admin/appearance";
import AdminDemoSections from "@/pages/admin/demo-sections";
import AdminAds from "@/pages/admin/ads";
import AdminCoupons from "@/pages/admin/coupons";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminEmailSettings from "@/pages/admin/email-settings";
import AdminAuditLog from "@/pages/admin/audit-log";
import CouponsPage from "@/pages/coupons";
import ComparisonsPage from "@/pages/comparisons/index";
import CompareTool from "@/pages/compare-tool";
import { AdminGuard } from "@/components/layout/AdminGuard";
import { GlobalSeoHead } from "@/components/GlobalSeoHead";

import { useLanguage, LANGUAGES } from "@/lib/i18n";
import { useAuthStore } from "@/lib/user-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LANG_CODES = new Set(LANGUAGES.map(l => l.code));

function LangSyncer() {
  const { lang } = useParams<{ lang: string }>();
  const { setLangCode } = useLanguage();
  useEffect(() => {
    if (lang && LANG_CODES.has(lang)) {
      setLangCode(lang);
    }
  }, [lang, setLangCode]);
  return null;
}

function HreflangTags() {
  const [location] = useLocation();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const canonicalPath = location.replace(/^\/(en|es|hi|ar|fr|bn|de|pt|ko|ru|zh|ja)(?=\/|$)/, "");

  const tags = (
    <>
      {LANGUAGES.map(lang => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={`${base}/${lang.code}${canonicalPath || "/"}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${base}${canonicalPath || "/"}`} />
    </>
  );

  return createPortal(tags, document.head);
}

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/posts/new">
        {() => <AdminGuard><AdminPostForm /></AdminGuard>}
      </Route>
      <Route path="/admin/posts/:id/edit">
        {() => <AdminGuard><AdminPostForm /></AdminGuard>}
      </Route>
      <Route path="/admin/posts">
        {() => <AdminGuard><AdminPosts /></AdminGuard>}
      </Route>
      <Route path="/admin/categories">
        {() => <AdminGuard><AdminCategories /></AdminGuard>}
      </Route>
      <Route path="/admin/products">
        {() => <AdminGuard><AdminProducts /></AdminGuard>}
      </Route>
      <Route path="/admin/comparisons">
        {() => <AdminGuard><AdminComparisons /></AdminGuard>}
      </Route>
      <Route path="/admin/translations">
        {() => <AdminGuard><AdminTranslations /></AdminGuard>}
      </Route>
      <Route path="/admin/seo-settings">
        {() => <AdminGuard><AdminSeoSettings /></AdminGuard>}
      </Route>
      <Route path="/admin/security-settings">
        {() => <AdminGuard><AdminSecuritySettings /></AdminGuard>}
      </Route>
      <Route path="/admin/site-settings">
        {() => <AdminGuard><AdminSiteSettings /></AdminGuard>}
      </Route>
      <Route path="/admin/about-settings">
        {() => <AdminGuard><AdminAboutSettings /></AdminGuard>}
      </Route>
      <Route path="/admin/social-links">
        {() => <AdminGuard><AdminSocialLinks /></AdminGuard>}
      </Route>
      <Route path="/admin/email-settings">
        {() => <AdminGuard><AdminEmailSettings /></AdminGuard>}
      </Route>
      <Route path="/admin/messages">
        {() => <AdminGuard><AdminMessages /></AdminGuard>}
      </Route>
      <Route path="/admin/users">
        {() => <AdminGuard><AdminUsers /></AdminGuard>}
      </Route>
      <Route path="/admin/appearance">
        {() => <AdminGuard><AdminAppearance /></AdminGuard>}
      </Route>
      <Route path="/admin/demo-sections">
        {() => <AdminGuard><AdminDemoSections /></AdminGuard>}
      </Route>
      <Route path="/admin/ads">
        {() => <AdminGuard><AdminAds /></AdminGuard>}
      </Route>
      <Route path="/admin/coupons">
        {() => <AdminGuard><AdminCoupons /></AdminGuard>}
      </Route>
      <Route path="/admin/analytics">
        {() => <AdminGuard><AdminAnalytics /></AdminGuard>}
      </Route>
      <Route path="/admin/audit-log">
        {() => <AdminGuard><AdminAuditLog /></AdminGuard>}
      </Route>
      <Route path="/admin">
        {() => <AdminGuard><AdminDashboard /></AdminGuard>}
      </Route>

      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/profile" component={Profile} />

      {/* Non-prefixed public routes */}
      <Route path="/" component={Home} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/categories" component={CategoryList} />
      <Route path="/categories/:slug" component={CategoryDetail} />
      <Route path="/product/:slug" component={ProductReview} />
      <Route path="/compare-tool" component={CompareTool} />
      <Route path="/comparisons" component={ComparisonsPage} />
      <Route path="/compare/:slug" component={ComparisonPage} />
      <Route path="/compare">
        {() => <Redirect to="/comparisons" />}
      </Route>
      <Route path="/products">
        {() => <Redirect to="/reviews" />}
      </Route>
      <Route path="/reviews" component={Reviews} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/coupons" component={CouponsPage} />

      {/* Language-prefixed public routes */}
      <Route path="/:lang/blog/:slug">
        {() => (<><LangSyncer /><BlogPost /></>)}
      </Route>
      <Route path="/:lang/blog">
        {() => (<><LangSyncer /><BlogList /></>)}
      </Route>
      <Route path="/:lang/categories/:slug">
        {() => (<><LangSyncer /><CategoryDetail /></>)}
      </Route>
      <Route path="/:lang/categories">
        {() => (<><LangSyncer /><CategoryList /></>)}
      </Route>
      <Route path="/:lang/product/:slug">
        {() => (<><LangSyncer /><ProductReview /></>)}
      </Route>
      <Route path="/:lang/compare-tool">
        {() => (<><LangSyncer /><CompareTool /></>)}
      </Route>
      <Route path="/:lang/comparisons">
        {() => (<><LangSyncer /><ComparisonsPage /></>)}
      </Route>
      <Route path="/:lang/compare/:slug">
        {() => (<><LangSyncer /><ComparisonPage /></>)}
      </Route>
      <Route path="/:lang/reviews">
        {() => (<><LangSyncer /><Reviews /></>)}
      </Route>
      <Route path="/:lang/contact">
        {() => (<><LangSyncer /><Contact /></>)}
      </Route>
      <Route path="/:lang">
        {() => (<><LangSyncer /><Home /></>)}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    useAuthStore.getState().loadFromStorage();
  }, []);

  return (
    <SiteThemeProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalSeoHead />
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <HreflangTags />
            <ScrollToTop />
            <Router />
            <ScrollToggleButton />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </SiteThemeProvider>
  );
}

export default App;
