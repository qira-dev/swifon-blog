import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ArrowRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListCategories } from "@workspace/api-client-react";
import { useTranslation } from "@/lib/i18n";

const FALLBACK_GRADIENTS = [
  "from-slate-900 via-teal-900 to-slate-900",
  "from-slate-900 via-indigo-900 to-slate-900",
  "from-slate-900 via-violet-900 to-slate-900",
  "from-slate-900 via-blue-900 to-slate-900",
  "from-slate-900 via-emerald-900 to-slate-900",
  "from-slate-900 via-rose-900 to-slate-900",
  "from-slate-900 via-amber-900 to-slate-900",
  "from-slate-900 via-cyan-900 to-slate-900",
];

export function CategorySlider() {
  const { langCode, t } = useTranslation();
  const { data: categories, isLoading } = useListCategories({ lang: langCode });
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = (categories ?? []).filter((c) => c.isVisible !== false);
  const total = slides.length;

  const go = useCallback(
    (idx: number) => {
      if (isTransitioning || total === 0) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(((idx % total) + total) % total);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, total]
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    if (total === 0) return;
    timerRef.current = setInterval(next, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, total]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[520px] bg-slate-900 rounded-2xl mx-auto max-w-7xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (total === 0) return null;

  const slide = slides[current];
  const gradient = FALLBACK_GRADIENTS[current % FALLBACK_GRADIENTS.length];

  return (
    <div
      className="relative w-full h-[520px] overflow-hidden rounded-2xl mx-auto max-w-7xl bg-slate-900 group"
      data-testid="category-slider"
    >
      {slides.map((cat, idx) => {
        const isActive = idx === current;
        const isGrad = FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];

        return (
          <div
            key={cat.id}
            className={`absolute inset-0 transition-all duration-700 ${
              isActive
                ? isTransitioning
                  ? "opacity-0 scale-105"
                  : "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            {cat.imageUrl ? (
              <>
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
              </>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${isGrad}`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
                  <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-white blur-2xl" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div
        className={`absolute bottom-0 left-0 right-0 z-20 px-10 pb-14 transition-all duration-500 ${
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
            <Folder className="w-3.5 h-3.5" />
            {slide.icon || t("categories")}
          </span>
          {slide.postCount != null && slide.postCount > 0 && (
            <span className="bg-teal-500/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {slide.postCount} {slide.postCount === 1 ? "post" : t("posts")}
            </span>
          )}
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg max-w-2xl">
          {slide.name}
        </h2>

        {slide.description && (
          <p className="text-white/75 text-base md:text-lg mb-8 max-w-xl line-clamp-2 leading-relaxed">
            {slide.description}
          </p>
        )}

        <Link href={`/categories/${slide.slug}`}>
          <Button className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6 py-3 text-sm rounded-xl shadow-lg">
            {t("readMore")} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      <button
        className="absolute inset-y-0 left-0 z-30 w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={() => { prev(); resetTimer(); }}
        aria-label="Previous"
        data-testid="category-slider-prev"
      >
        <div className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </div>
      </button>

      <button
        className="absolute inset-y-0 right-0 z-30 w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={() => { next(); resetTimer(); }}
        aria-label="Next"
        data-testid="category-slider-next"
      >
        <div className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors">
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 flex-wrap justify-center max-w-xs">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { go(idx); resetTimer(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white w-6" : "bg-white/35 hover:bg-white/60 w-1.5"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="absolute top-6 right-6 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white/70 text-xs font-medium">
        {current + 1} / {total}
      </div>
    </div>
  );
}
