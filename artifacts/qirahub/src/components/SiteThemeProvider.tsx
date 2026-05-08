import { createContext, useContext, useEffect, useState } from "react";
import {
  applyTheme,
  DEFAULT_THEME_ID,
  getThemeDef,
  SITE_THEMES,
  SiteThemeDef,
  THEME_STORAGE_KEY,
} from "@/lib/site-theme";
import { useAuthStore } from "@/lib/user-auth";

interface SiteThemeContextValue {
  themeId: string;
  themeDef: SiteThemeDef;
  allThemes: SiteThemeDef[];
  setAndSaveTheme: (id: string) => Promise<void>;
  isLoading: boolean;
}

const SiteThemeContext = createContext<SiteThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  themeDef: getThemeDef(DEFAULT_THEME_ID),
  allThemes: SITE_THEMES,
  setAndSaveTheme: async () => {},
  isLoading: false,
});

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Apply cached theme immediately on mount
  useEffect(() => {
    applyTheme(themeId);
  }, []);

  // Load theme from DB on mount
  useEffect(() => {
    fetch("/api/settings/site_theme")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: { value?: string }) => {
        const id = data?.value;
        if (id && id !== themeId) {
          setThemeId(id);
          applyTheme(id);
          try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch {}
        }
      })
      .catch(() => {
        // Settings not found yet — keep cached/default
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Re-apply theme whenever it changes
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const setAndSaveTheme = async (id: string): Promise<void> => {
    // Apply immediately for instant feedback
    setThemeId(id);
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch {}

    // Try to persist to DB (requires admin JWT in sessionStorage)
    const sessionToken = sessionStorage.getItem("qirahub_user_token");
    const publicToken = useAuthStore.getState().token;
    const activeToken = sessionToken || publicToken;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

    const res = await fetch("/api/settings/site_theme", {
      method: "PUT",
      headers,
      body: JSON.stringify({ value: id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to save" }));
      throw new Error(err?.error ?? "Failed to save theme");
    }
  };

  return (
    <SiteThemeContext.Provider
      value={{
        themeId,
        themeDef: getThemeDef(themeId),
        allThemes: SITE_THEMES,
        setAndSaveTheme,
        isLoading,
      }}
    >
      {children}
    </SiteThemeContext.Provider>
  );
}
