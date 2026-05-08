export interface SiteThemeDef {
  id: string;
  name: string;
  description: string;
  type: "dark" | "light";
  primaryHex: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  emoji: string;
}

export const SITE_THEMES: SiteThemeDef[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Electric cyan on deep black — neon city vibes",
    type: "dark",
    primaryHex: "#00e5ff",
    bgHex: "#0c0e13",
    cardHex: "#111418",
    accentHex: "#00b8d4",
    emoji: "⚡",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Sky blue on deep navy — cool and professional",
    type: "dark",
    primaryHex: "#60a5fa",
    bgHex: "#070d1c",
    cardHex: "#0d1424",
    accentHex: "#3b82f6",
    emoji: "🌙",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Vivid green on forest black — nature meets tech",
    type: "dark",
    primaryHex: "#4ade80",
    bgHex: "#050f08",
    cardHex: "#0a1a0d",
    accentHex: "#22c55e",
    emoji: "🌿",
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Golden amber on deep violet — royal and dramatic",
    type: "dark",
    primaryHex: "#fbbf24",
    bgHex: "#09050e",
    cardHex: "#110a1e",
    accentHex: "#f59e0b",
    emoji: "👑",
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Hot pink on void black — bold and electric",
    type: "dark",
    primaryHex: "#f472b6",
    bgHex: "#0f060a",
    cardHex: "#1a0c12",
    accentHex: "#ec4899",
    emoji: "🌹",
  },
  {
    id: "slate",
    name: "Slate Pro",
    description: "Indigo on clean gray — polished and minimal",
    type: "light",
    primaryHex: "#6366f1",
    bgHex: "#f1f5f9",
    cardHex: "#ffffff",
    accentHex: "#4f46e5",
    emoji: "💼",
  },
  {
    id: "parchment",
    name: "Parchment",
    description: "Deep teal on warm cream — editorial and timeless",
    type: "light",
    primaryHex: "#0d9488",
    bgHex: "#faf6ef",
    cardHex: "#fffdf8",
    accentHex: "#0f766e",
    emoji: "📰",
  },
];

export const DEFAULT_THEME_ID = "cyberpunk";

export const THEME_STORAGE_KEY = "qirahub-site-theme";

export function getThemeDef(id: string): SiteThemeDef {
  return SITE_THEMES.find((t) => t.id === id) ?? SITE_THEMES[0];
}

export function applyTheme(id: string): void {
  document.documentElement.setAttribute("data-theme", id);
  // Remove .dark class since we manage dark mode via data-theme
  document.documentElement.classList.remove("dark");
}
