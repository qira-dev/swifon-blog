import React from "react";

export interface AvatarDef {
  id: string;
  name: string;
  category: string;
  bg1: string;
  bg2: string;
  accent: string;
  ring: string;
  design: number; // 1-6 visual design
}

const PALETTE = [
  { key: "cyan",   bg1: "#003340", bg2: "#001a24", accent: "#00e5ff", ring: "#00b8d4" },
  { key: "violet", bg1: "#2d0050", bg2: "#140025", accent: "#c060ff", ring: "#9b30d9" },
  { key: "amber",  bg1: "#3a2000", bg2: "#1a0e00", accent: "#ffb800", ring: "#d99200" },
  { key: "green",  bg1: "#003320", bg2: "#001810", accent: "#00e676", ring: "#00b85a" },
  { key: "coral",  bg1: "#3d0010", bg2: "#1a0008", accent: "#ff4d6a", ring: "#d93050" },
];

const NAMES = [
  // Design 1 – Circuit (robotic tech)
  ["Nova",    "Qubit",   "Nexus",  "Volt",   "Pixel"],
  // Design 2 – Specter (phantom/ghost)
  ["Wraith",  "Cipher",  "Shade",  "Veil",   "Mist"],
  // Design 3 – Titan (warrior)
  ["Forge",   "Bastion", "Aegis",  "Rampart","Valor"],
  // Design 4 – Oracle (mystic eye)
  ["Sage",    "Prism",   "Oracle", "Rune",   "Verse"],
  // Design 5 – Blaze (flame energy)
  ["Blaze",   "Ember",   "Torch",  "Flare",  "Cinder"],
  // Design 6 – Cosmos (star/space)
  ["Astral",  "Orbit",   "Pulsar", "Zenith", "Aurora"],
];

const CATEGORIES = ["Cyber", "Phantom", "Titan", "Oracle", "Blaze", "Cosmos"];

export const AVATARS: AvatarDef[] = [];
for (let design = 0; design < 6; design++) {
  for (let palIdx = 0; palIdx < 5; palIdx++) {
    const pal = PALETTE[palIdx];
    const idx = design * 5 + palIdx;
    AVATARS.push({
      id: `avatar-${idx}`,
      name: NAMES[design][palIdx],
      category: CATEGORIES[design],
      bg1: pal.bg1,
      bg2: pal.bg2,
      accent: pal.accent,
      ring: pal.ring,
      design: design + 1,
    });
  }
}

export const AVATAR_COUNT = AVATARS.length;

function SvgDesign1({ accent, size }: { accent: string; size: number }) {
  // Circuit / Android face
  const s = size / 100;
  return (
    <g>
      {/* Head shape */}
      <rect x="28" y="25" width="44" height="50" rx="8" fill={accent + "22"} stroke={accent} strokeWidth="2" />
      {/* Antenna */}
      <line x1="50" y1="25" x2="50" y2="14" stroke={accent} strokeWidth="2" />
      <circle cx="50" cy="11" r="3" fill={accent} />
      {/* Eyes */}
      <rect x="34" y="38" width="12" height="7" rx="2" fill={accent} opacity="0.9" />
      <rect x="54" y="38" width="12" height="7" rx="2" fill={accent} opacity="0.9" />
      {/* Eye glow */}
      <rect x="34" y="38" width="12" height="7" rx="2" fill="white" opacity="0.3" />
      <rect x="54" y="38" width="12" height="7" rx="2" fill="white" opacity="0.3" />
      {/* Mouth / grille */}
      <rect x="36" y="55" width="28" height="4" rx="2" fill={accent} opacity="0.5" />
      <line x1="44" y1="55" x2="44" y2="59" stroke={accent} strokeWidth="1" />
      <line x1="50" y1="55" x2="50" y2="59" stroke={accent} strokeWidth="1" />
      <line x1="56" y1="55" x2="56" y2="59" stroke={accent} strokeWidth="1" />
      {/* Side circuits */}
      <line x1="28" y1="40" x2="20" y2="40" stroke={accent} strokeWidth="1.5" opacity="0.6" />
      <line x1="20" y1="40" x2="20" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.6" />
      <line x1="72" y1="40" x2="80" y2="40" stroke={accent} strokeWidth="1.5" opacity="0.6" />
      <line x1="80" y1="40" x2="80" y2="50" stroke={accent} strokeWidth="1.5" opacity="0.6" />
      {/* Collar */}
      <path d="M35 75 Q50 82 65 75" stroke={accent} strokeWidth="2" fill="none" opacity="0.7" />
    </g>
  );
}

function SvgDesign2({ accent, size }: { accent: string; size: number }) {
  // Specter / Phantom – floating orb with glowing eyes
  return (
    <g>
      {/* Aura rings */}
      <circle cx="50" cy="48" r="28" fill="none" stroke={accent} strokeWidth="1" opacity="0.2" />
      <circle cx="50" cy="48" r="22" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      {/* Head */}
      <ellipse cx="50" cy="47" rx="18" ry="20" fill={accent + "18"} stroke={accent} strokeWidth="1.5" />
      {/* Hood */}
      <path d="M32 40 Q50 20 68 40 Q68 28 50 22 Q32 28 32 40Z" fill={accent} opacity="0.6" />
      {/* Eyes */}
      <ellipse cx="43" cy="47" rx="4" ry="5" fill={accent} />
      <ellipse cx="57" cy="47" rx="4" ry="5" fill={accent} />
      <ellipse cx="43" cy="47" rx="2" ry="3" fill="white" opacity="0.8" />
      <ellipse cx="57" cy="47" rx="2" ry="3" fill="white" opacity="0.8" />
      {/* Bottom fade */}
      <path d="M33 55 Q40 75 50 78 Q60 75 67 55" fill={accent + "22"} />
      {/* Floating particles */}
      <circle cx="25" cy="35" r="2" fill={accent} opacity="0.5" />
      <circle cx="75" cy="38" r="1.5" fill={accent} opacity="0.4" />
      <circle cx="28" cy="62" r="1" fill={accent} opacity="0.3" />
      <circle cx="73" cy="60" r="2" fill={accent} opacity="0.5" />
    </g>
  );
}

function SvgDesign3({ accent, size }: { accent: string; size: number }) {
  // Titan / Warrior – armored helmet
  return (
    <g>
      {/* Neck/collar armor */}
      <path d="M30 80 L30 70 Q50 75 70 70 L70 80 Q50 86 30 80Z" fill={accent} opacity="0.4" stroke={accent} strokeWidth="1" />
      {/* Helmet shape */}
      <path d="M28 55 Q28 28 50 25 Q72 28 72 55 L68 72 Q50 78 32 72 Z" fill={accent + "1a"} stroke={accent} strokeWidth="2" />
      {/* Visor */}
      <path d="M34 45 Q50 42 66 45 L64 58 Q50 62 36 58 Z" fill={accent} opacity="0.7" />
      {/* Visor shine */}
      <path d="M36 45 Q50 43 64 45 L62 49 Q50 47 38 49 Z" fill="white" opacity="0.25" />
      {/* Helmet ridge */}
      <line x1="50" y1="25" x2="50" y2="45" stroke={accent} strokeWidth="3" opacity="0.8" />
      {/* Side vents */}
      <line x1="28" y1="50" x2="34" y2="50" stroke={accent} strokeWidth="2" opacity="0.6" />
      <line x1="28" y1="55" x2="34" y2="55" stroke={accent} strokeWidth="2" opacity="0.6" />
      <line x1="66" y1="50" x2="72" y2="50" stroke={accent} strokeWidth="2" opacity="0.6" />
      <line x1="66" y1="55" x2="72" y2="55" stroke={accent} strokeWidth="2" opacity="0.6" />
      {/* Horn accents */}
      <path d="M50 25 L45 12 L50 18 L55 12 Z" fill={accent} opacity="0.8" />
    </g>
  );
}

function SvgDesign4({ accent, size }: { accent: string; size: number }) {
  // Oracle – all-seeing eye + mystic geometry
  return (
    <g>
      {/* Outer hex */}
      <polygon points="50,10 83,28 83,65 50,83 17,65 17,28" fill={accent + "0d"} stroke={accent} strokeWidth="1.5" opacity="0.7" />
      {/* Inner hex */}
      <polygon points="50,22 72,34 72,58 50,70 28,58 28,34" fill={accent + "14"} stroke={accent} strokeWidth="1" opacity="0.5" />
      {/* Eye outline */}
      <path d="M25 50 Q50 28 75 50 Q50 72 25 50 Z" fill={accent + "22"} stroke={accent} strokeWidth="1.5" />
      {/* Iris */}
      <circle cx="50" cy="50" r="12" fill={accent + "40"} stroke={accent} strokeWidth="1.5" />
      {/* Pupil */}
      <circle cx="50" cy="50" r="6" fill={accent} />
      <circle cx="50" cy="50" r="3" fill="white" opacity="0.9" />
      {/* Light glint */}
      <circle cx="53" cy="47" r="1.5" fill="white" opacity="0.8" />
      {/* Rays */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 13 * Math.cos(rad);
        const y1 = 50 + 13 * Math.sin(rad);
        const x2 = 50 + 22 * Math.cos(rad);
        const y2 = 50 + 22 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="1" opacity="0.5" />;
      })}
    </g>
  );
}

function SvgDesign5({ accent, size }: { accent: string; size: number }) {
  // Blaze / Flame – fire spirit face
  return (
    <g>
      {/* Flames */}
      <path d="M50 15 C42 22 35 30 38 42 C32 35 33 25 36 20 C28 30 25 42 30 52 C22 44 22 32 26 25 C18 38 20 55 28 65 C24 60 22 52 24 46 C18 55 20 68 28 75 Q38 82 50 83 Q62 82 72 75 C80 68 82 55 76 46 C78 52 76 60 72 65 C80 55 82 38 74 25 C78 32 78 44 72 52 C77 42 75 30 67 20 C70 25 71 35 65 42 C68 30 61 22 50 15 Z" fill={accent} opacity="0.75" />
      {/* Inner flame */}
      <path d="M50 28 C46 34 43 40 45 48 C41 43 41 36 43 31 C38 38 37 48 41 56 C37 50 37 42 39 36 C35 44 36 54 41 61 C38 57 37 52 38 47 C34 54 35 64 41 70 Q45 75 50 76 Q55 75 59 70 C65 64 66 54 62 47 C63 52 62 57 59 61 C64 54 65 44 61 36 C63 42 63 50 59 56 C63 48 62 38 57 31 C59 36 59 43 55 48 C57 40 54 34 50 28 Z" fill="white" opacity="0.25" />
      {/* Eyes (embers) */}
      <ellipse cx="43" cy="55" rx="4" ry="4.5" fill={accent} stroke="white" strokeWidth="1" />
      <ellipse cx="57" cy="55" rx="4" ry="4.5" fill={accent} stroke="white" strokeWidth="1" />
      <circle cx="43" cy="54" r="2" fill="white" opacity="0.9" />
      <circle cx="57" cy="54" r="2" fill="white" opacity="0.9" />
      {/* Spark particles */}
      <circle cx="30" cy="30" r="1.5" fill={accent} opacity="0.7" />
      <circle cx="70" cy="28" r="1" fill={accent} opacity="0.6" />
      <circle cx="25" cy="50" r="1" fill={accent} opacity="0.5" />
      <circle cx="75" cy="48" r="1.5" fill={accent} opacity="0.6" />
    </g>
  );
}

function SvgDesign6({ accent, size }: { accent: string; size: number }) {
  // Cosmos / Star – celestial entity
  return (
    <g>
      {/* Orbit rings */}
      <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" transform="rotate(-25 50 50)" />
      <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke={accent} strokeWidth="1" opacity="0.2" transform="rotate(25 50 50)" />
      {/* Star burst */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const inner = i % 2 === 0 ? 16 : 10;
        const outer = i % 2 === 0 ? 32 : 22;
        const x1 = 50 + inner * Math.cos(rad);
        const y1 = 50 + inner * Math.sin(rad);
        const x2 = 50 + outer * Math.cos(rad);
        const y2 = 50 + outer * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={i % 2 === 0 ? 2 : 1} opacity={i % 2 === 0 ? 0.9 : 0.5} />;
      })}
      {/* Core */}
      <circle cx="50" cy="50" r="14" fill={accent + "30"} stroke={accent} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="9" fill={accent} opacity="0.8" />
      <circle cx="50" cy="50" r="5" fill="white" opacity="0.9" />
      {/* Small stars */}
      <circle cx="20" cy="22" r="1.5" fill={accent} opacity="0.8" />
      <circle cx="80" cy="25" r="1" fill={accent} opacity="0.7" />
      <circle cx="18" cy="72" r="1" fill={accent} opacity="0.6" />
      <circle cx="82" cy="70" r="1.5" fill={accent} opacity="0.7" />
      <circle cx="50" cy="15" r="1.5" fill={accent} opacity="0.5" />
    </g>
  );
}

const DESIGNS = [SvgDesign1, SvgDesign2, SvgDesign3, SvgDesign4, SvgDesign5, SvgDesign6];

export function AvatarSVG({
  def,
  size = 100,
  showRing = false,
  isSelected = false,
}: {
  def: AvatarDef;
  size?: number;
  showRing?: boolean;
  isSelected?: boolean;
}) {
  const gradId = `grad-${def.id}`;
  const glowId = `glow-${def.id}`;
  const DesignComp = DESIGNS[def.design - 1];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0, borderRadius: "50%" }}
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={def.bg1} />
          <stop offset="100%" stopColor={def.bg2} />
        </radialGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <circle cx="50" cy="50" r="50" fill={`url(#${gradId})`} />

      {/* Subtle texture ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke={def.accent} strokeWidth="0.5" opacity="0.2" />

      {/* Avatar design */}
      <g filter={`url(#${glowId})`}>
        <DesignComp accent={def.accent} size={size} />
      </g>

      {/* Selected ring */}
      {isSelected && (
        <circle cx="50" cy="50" r="47" fill="none" stroke={def.accent} strokeWidth="3" opacity="0.9" />
      )}
    </svg>
  );
}

export function getAvatarId(index: number): string {
  return `avatar-${index}`;
}

export function getAvatarDef(avatarId: string | null | undefined): AvatarDef | null {
  if (!avatarId || !avatarId.startsWith("avatar-")) return null;
  const idx = parseInt(avatarId.replace("avatar-", ""), 10);
  return AVATARS[idx] ?? null;
}

export function AvatarDisplay({
  avatarUrl,
  size = 40,
  className = "",
}: {
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const def = getAvatarDef(avatarUrl);

  if (def) {
    return (
      <div
        className={`inline-block rounded-full overflow-hidden shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 0 2px ${def.ring}40, 0 0 8px ${def.accent}30`,
        }}
      >
        <AvatarSVG def={def} size={size} />
      </div>
    );
  }

  // Fallback generic avatar
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.45}
        height={size * 0.45}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

export function AvatarPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (avatarUrl: string) => void;
}) {
  const grouped = CATEGORIES.map((cat, catIdx) => ({
    category: cat,
    avatars: AVATARS.filter((a) => a.category === cat),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(({ category, avatars }) => (
        <div key={category}>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
            <span
              className="inline-block w-4 h-0.5 rounded"
              style={{ background: avatars[0]?.accent }}
            />
            {category}
          </p>
          <div className="grid grid-cols-5 gap-3">
            {avatars.map((def) => {
              const isSelected = selected === def.id;
              return (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => onSelect(def.id)}
                  data-testid={`avatar-option-${def.id}`}
                  title={def.name}
                  className="group flex flex-col items-center gap-1.5 focus:outline-none"
                >
                  <div
                    className="relative rounded-full transition-all duration-200"
                    style={
                      isSelected
                        ? {
                            boxShadow: `0 0 0 3px ${def.accent}, 0 0 16px ${def.accent}50`,
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                  >
                    <div
                      className="rounded-full overflow-hidden transition-all duration-200 group-hover:scale-105"
                      style={
                        !isSelected
                          ? {
                              boxShadow: `0 0 0 1px ${def.ring}40`,
                            }
                          : {}
                      }
                    >
                      <AvatarSVG def={def} size={52} isSelected={isSelected} />
                    </div>
                    {isSelected && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: def.accent }}
                      >
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-semibold transition-colors"
                    style={{ color: isSelected ? def.accent : undefined }}
                  >
                    {def.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
