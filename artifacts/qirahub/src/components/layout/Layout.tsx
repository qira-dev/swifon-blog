import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AdSlot } from "@/components/ads/AdSlot";
import { useLocation } from "wouter";

function pathToPageKey(path: string): string {
  if (path === "/" || path === "") return "home";
  if (path.startsWith("/blog")) return "blog";
  if (path.startsWith("/categories")) return "category";
  if (path.startsWith("/reviews")) return "reviews";
  if (path.startsWith("/comparisons") || path.startsWith("/compare")) return "comparisons";
  if (path.startsWith("/contact")) return "contact";
  if (path.startsWith("/profile")) return "profile";
  return "home";
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const pageKey = pathToPageKey(location);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      {!isAdmin && (
        <>
          <AdSlot page={pageKey} position="header_top" className="px-4 py-2 max-w-7xl mx-auto w-full" label />
          <AdSlot page="all" position="header_top" className="px-4 py-2 max-w-7xl mx-auto w-full" label />
        </>
      )}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>
      {!isAdmin && (
        <>
          <AdSlot page={pageKey} position="footer_top" className="px-4 py-3 max-w-7xl mx-auto w-full" label />
          <AdSlot page="all" position="footer_top" className="px-4 py-3 max-w-7xl mx-auto w-full" label />
          <AdSlot page={pageKey} position="corner" />
          <AdSlot page="all" position="corner" />
        </>
      )}
      <Footer />
    </div>
  );
}
