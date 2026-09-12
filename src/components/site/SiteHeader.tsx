"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useScrolled } from "./ScrollProvider";
import { TrackedLink } from "./TrackedLink";
import type { MenuItem } from "@/types";

export function SiteHeader({ name, menu }: { name: string; menu: MenuItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  const sheetRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (sheetRef.current?.contains(target)) return;
      if (burgerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const handleScroll = () => setMenuOpen(false);

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <button
          ref={burgerRef}
          type="button"
          className="burger-btn"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="burger-bar" />
          <span className="burger-bar" />
          <span className="burger-bar" />
        </button>

        <span className={`header-name${scrolled ? " is-visible" : ""}`}>{name}</span>

        <nav className="header-nav">
          <Link href="/" className={`nav-btn${!isAbout ? " is-active" : ""}`}>
            Links
          </Link>
          <Link href="/about" className={`nav-btn${isAbout ? " is-active" : ""}`}>
            About
          </Link>
        </nav>
      </header>

      {menuOpen ? (
        <div className="burger-sheet" ref={sheetRef}>
          {menu.map((item) => (
            <TrackedLink
              key={item.id}
              trackId={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="burger-item"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              <span className="burger-item-arrow">↗</span>
            </TrackedLink>
          ))}
          <button type="button" className="burger-close" onClick={() => setMenuOpen(false)}>
            Close
          </button>
        </div>
      ) : null}
    </>
  );
}
