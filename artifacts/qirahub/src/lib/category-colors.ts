export interface CategoryTheme {
  accent: string;
  accentHex: string;
  accentRgb: string;
  bg: string;
  border: string;
  glow: string;
  badgeClass: string;
  glowClass: string;
}

const THEMES: CategoryTheme[] = [
  {
    accent: "cyan",
    accentHex: "#00e5ff",
    accentRgb: "0,229,255",
    bg: "rgba(0,229,255,0.07)",
    border: "rgba(0,229,255,0.25)",
    glow: "0 0 0 1px rgba(0,229,255,0.25), 0 8px 32px rgba(0,229,255,0.12)",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    glowClass: "card-glow-cyan",
  },
  {
    accent: "violet",
    accentHex: "#a750ff",
    accentRgb: "167,80,255",
    bg: "rgba(167,80,255,0.07)",
    border: "rgba(167,80,255,0.25)",
    glow: "0 0 0 1px rgba(167,80,255,0.25), 0 8px 32px rgba(167,80,255,0.12)",
    badgeClass: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    glowClass: "card-glow-violet",
  },
  {
    accent: "amber",
    accentHex: "#ffb800",
    accentRgb: "255,184,0",
    bg: "rgba(255,184,0,0.07)",
    border: "rgba(255,184,0,0.25)",
    glow: "0 0 0 1px rgba(255,184,0,0.25), 0 8px 32px rgba(255,184,0,0.12)",
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    glowClass: "card-glow-amber",
  },
  {
    accent: "green",
    accentHex: "#00e676",
    accentRgb: "0,230,118",
    bg: "rgba(0,230,118,0.07)",
    border: "rgba(0,230,118,0.25)",
    glow: "0 0 0 1px rgba(0,230,118,0.25), 0 8px 32px rgba(0,230,118,0.12)",
    badgeClass: "bg-green-500/10 text-green-400 border border-green-500/20",
    glowClass: "card-glow-green",
  },
  {
    accent: "coral",
    accentHex: "#ff4757",
    accentRgb: "255,71,87",
    bg: "rgba(255,71,87,0.07)",
    border: "rgba(255,71,87,0.25)",
    glow: "0 0 0 1px rgba(255,71,87,0.25), 0 8px 32px rgba(255,71,87,0.12)",
    badgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    glowClass: "card-glow-coral",
  },
  {
    accent: "blue",
    accentHex: "#2979ff",
    accentRgb: "41,121,255",
    bg: "rgba(41,121,255,0.07)",
    border: "rgba(41,121,255,0.25)",
    glow: "0 0 0 1px rgba(41,121,255,0.25), 0 8px 32px rgba(41,121,255,0.12)",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    glowClass: "card-glow-cyan",
  },
  {
    accent: "orange",
    accentHex: "#ff6d00",
    accentRgb: "255,109,0",
    bg: "rgba(255,109,0,0.07)",
    border: "rgba(255,109,0,0.25)",
    glow: "0 0 0 1px rgba(255,109,0,0.25), 0 8px 32px rgba(255,109,0,0.12)",
    badgeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    glowClass: "card-glow-amber",
  },
  {
    accent: "pink",
    accentHex: "#f50057",
    accentRgb: "245,0,87",
    bg: "rgba(245,0,87,0.07)",
    border: "rgba(245,0,87,0.25)",
    glow: "0 0 0 1px rgba(245,0,87,0.25), 0 8px 32px rgba(245,0,87,0.12)",
    badgeClass: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    glowClass: "card-glow-coral",
  },
];

export function getCategoryTheme(name?: string | null, index?: number): CategoryTheme {
  if (!name && index !== undefined) return THEMES[index % THEMES.length];
  if (!name) return THEMES[0];

  const lower = name.toLowerCase();

  if (lower.includes("ai") || lower.includes("tool") || lower.includes("tech")) return THEMES[0];       // cyan
  if (lower.includes("vpn") || lower.includes("privacy") || lower.includes("compare")) return THEMES[1]; // violet
  if (lower.includes("review") || lower.includes("tutorial") || lower.includes("tip")) return THEMES[2]; // amber
  if (lower.includes("antivirus") || lower.includes("security") || lower.includes("password")) return THEMES[3]; // green
  if (lower.includes("news") || lower.includes("story") || lower.includes("report")) return THEMES[4]; // coral
  if (lower.includes("host") || lower.includes("cloud") || lower.includes("server")) return THEMES[5]; // blue
  if (lower.includes("software") || lower.includes("app") || lower.includes("program")) return THEMES[6]; // orange
  if (lower.includes("guide") || lower.includes("how") || lower.includes("learn")) return THEMES[7]; // pink

  const hash = Array.from(lower).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return THEMES[hash % THEMES.length];
}
