"use client";

import { useScrolled } from "./ScrollProvider";

export function HeroHeader({ name, bio }: { name: string; bio: string }) {
  const scrolled = useScrolled();

  return (
    <div className="hero-block">
      <h1 className={`hero-h1${scrolled ? " is-scrolled" : ""}`}>{name}</h1>
      <div className="hero-rule" />
      <p className="hero-bio">{bio}</p>
    </div>
  );
}
