import { useAds, usePublicAdNetworkCredentials, type Ad } from "@/lib/api-hooks";
import { generateAdCode } from "@/lib/ad-networks";
import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";

const AD_POSITION_LABELS: Record<string, string> = {
  header_top: "Header Top",
  sidebar: "Sidebar",
  footer_top: "Footer Top",
  inline: "Inline",
  corner: "Corner",
  between_posts: "Between Posts",
};

function BannerAd({ ad }: { ad: Ad }) {
  if (!ad.imageUrl) return null;
  const inner = (
    <div
      className="overflow-hidden rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
      style={{ width: ad.width ? `${ad.width}px` : "100%", maxWidth: "100%" }}
    >
      <div className="relative">
        <img
          src={ad.imageUrl}
          alt={ad.title || ad.name}
          className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          style={{ height: ad.height ? `${ad.height}px` : "auto" }}
        />
        {ad.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-white text-sm font-medium">{ad.title}</p>
            {ad.description && (
              <p className="text-white/80 text-xs mt-0.5">{ad.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (ad.redirectUrl) {
    return (
      <a
        href={ad.redirectUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

function TextLinkAd({ ad }: { ad: Ad }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
      {ad.title && (
        <p className="text-sm font-semibold text-foreground">{ad.title}</p>
      )}
      {ad.description && (
        <p className="text-xs text-muted-foreground">{ad.description}</p>
      )}
      {ad.redirectUrl && (
        <a
          href={ad.redirectUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-1"
        >
          Learn More <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Sponsored</p>
    </div>
  );
}

function HtmlAd({ ad, overrideCode }: { ad: Ad; overrideCode?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const code = overrideCode ?? ad.adCode;

  useEffect(() => {
    if (!ref.current || !code) return;
    ref.current.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = code;

    const scripts = Array.from(wrapper.querySelectorAll("script"));
    const nonScripts = Array.from(wrapper.childNodes).filter(
      (n) => !(n as HTMLElement).tagName || (n as HTMLElement).tagName !== "SCRIPT"
    );

    nonScripts.forEach((node) => ref.current!.appendChild(node.cloneNode(true)));
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      if (script.src) newScript.src = script.src;
      if (script.async) newScript.async = true;
      if (script.innerHTML) newScript.innerHTML = script.innerHTML;
      Array.from(script.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      ref.current!.appendChild(newScript);
    });
  }, [code]);

  if (!code) return null;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-xl"
      style={{
        width: ad.width ? `${ad.width}px` : "100%",
        minHeight: ad.height ? `${ad.height}px` : undefined,
        maxWidth: "100%",
      }}
    />
  );
}

function VideoCornerAd({ ad }: { ad: Ad }) {
  const [closed, setClosed] = useState(false);
  if (closed || !ad.videoUrl) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded-2xl overflow-hidden shadow-2xl border border-border/60 bg-card group"
      style={{ width: ad.width ? `${ad.width}px` : "320px" }}
    >
      <div className="relative">
        <button
          onClick={() => setClosed(true)}
          className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
          aria-label="Close ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {ad.title && (
          <div className="bg-primary/10 border-b border-border px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">{ad.title}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Ad</span>
          </div>
        )}
        {ad.redirectUrl ? (
          <a href={ad.redirectUrl} target="_blank" rel="noopener noreferrer sponsored">
            <video
              src={ad.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full"
              style={{ height: ad.height ? `${ad.height}px` : "180px" }}
            />
          </a>
        ) : (
          <video
            src={ad.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full"
            style={{ height: ad.height ? `${ad.height}px` : "180px" }}
          />
        )}
        {ad.description && (
          <div className="px-3 py-2 bg-card">
            <p className="text-xs text-muted-foreground">{ad.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdItem({ ad, autoCode }: { ad: Ad; autoCode?: string }) {
  switch (ad.type) {
    case "banner":
      return <BannerAd ad={ad} />;
    case "text_link":
      return <TextLinkAd ad={ad} />;
    case "video_corner":
      return <VideoCornerAd ad={ad} />;
    case "adsense":
    case "custom_html":
      return <HtmlAd ad={ad} overrideCode={ad.adCode || autoCode} />;
    default:
      return null;
  }
}

interface AdSlotProps {
  page: string;
  position: string;
  className?: string;
  label?: boolean;
}

export function AdSlot({ page, position, className = "", label = false }: AdSlotProps) {
  const { data: ads } = useAds(page, position);
  const { data: credsByNetwork } = usePublicAdNetworkCredentials();

  const visibleAds = (ads ?? []).filter((ad) => ad.isActive);
  if (!visibleAds.length) return null;

  const cornerAds = visibleAds.filter((a) => a.type === "video_corner");
  const inlineAds = visibleAds.filter((a) => a.type !== "video_corner");

  function getAutoCode(ad: Ad): string | undefined {
    if (ad.adCode) return undefined;
    if (!ad.slotId || !ad.network) return undefined;
    const creds = credsByNetwork?.[ad.network];
    if (!creds) return undefined;
    const generated = generateAdCode(ad.network, creds, ad.slotId);
    return generated ?? undefined;
  }

  return (
    <>
      {cornerAds.map((ad) => (
        <AdItem key={ad.id} ad={ad} autoCode={getAutoCode(ad)} />
      ))}
      {inlineAds.length > 0 && (
        <div className={`space-y-3 ${className}`}>
          {label && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Advertisement
            </p>
          )}
          {inlineAds.map((ad) => (
            <AdItem key={ad.id} ad={ad} autoCode={getAutoCode(ad)} />
          ))}
        </div>
      )}
    </>
  );
}
