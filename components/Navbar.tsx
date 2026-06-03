"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-cold-bg/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="h-2.5 w-2.5 rounded-full bg-cold-gold shadow-[0_0_12px_rgba(232,201,122,0.6)]" />
          <span className="font-display text-3xl leading-none tracking-[0.18em] text-cold-gold">
            COLD
          </span>
        </a>

        {/* Right */}
        <div className="flex items-center gap-4 sm:gap-7">
          <a
            href="#cases"
            className="hidden text-xs uppercase tracking-[0.22em] text-cold-text/70 transition-colors hover:text-cold-text sm:inline-block"
          >
            Open cases
          </a>
          <a
            href="/play"
            className="rounded-sm border border-cold-text/25 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-cold-text transition-all hover:border-cold-gold hover:text-cold-gold"
          >
            Enter investigation
          </a>
        </div>
      </nav>
    </header>
  );
}
