import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToggleButton() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 200);
      setVisible(y > 80 || document.documentElement.scrollHeight > window.innerHeight + 80);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleClick = () => {
    if (scrolled) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <Button
      onClick={handleClick}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
      aria-label={scrolled ? "Scroll to top" : "Scroll to bottom"}
    >
      {scrolled ? (
        <ChevronUp className="w-5 h-5" />
      ) : (
        <ChevronDown className="w-5 h-5" />
      )}
    </Button>
  );
}
