"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SCROLL_THRESHOLD = 260;

const ScrollContext = createContext(false);

export function useScrolled() {
  return useContext(ScrollContext);
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled((prev) => {
        const next = y > SCROLL_THRESHOLD;
        return next === prev ? prev : next;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.scrollTo({ top: 0 });
    setScrolled(false);
  }, [pathname]);

  return <ScrollContext.Provider value={scrolled}>{children}</ScrollContext.Provider>;
}
