"use client";

import { useScrolled } from "./ScrollProvider";

export function BackToTop() {
  const scrolled = useScrolled();

  if (!scrolled) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
