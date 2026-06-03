"use client";

import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <>
      <section
        id="cta"
        className="relative overflow-hidden border-t border-white/5 bg-black px-5 py-28 sm:py-36"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="font-type text-4xl leading-tight text-cold-text sm:text-6xl">
              A case is waiting for you.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-md text-sm text-cold-text/55 sm:text-base">
              Free to play. No account needed. Just you, your partner, and the
              evidence.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <a
              href="#cases"
              className="mt-10 inline-block rounded-sm bg-cold-gold px-9 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-cold-bg transition-transform hover:-translate-y-0.5"
            >
              Open your first case →
            </a>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-cold-bg px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cold-gold" />
            <span className="font-display text-2xl tracking-[0.18em] text-cold-gold">
              COLD
            </span>
          </div>

          <nav className="flex gap-6 text-[11px] uppercase tracking-[0.2em] text-cold-text/50">
            <a href="#cases" className="hover:text-cold-text">
              Cases
            </a>
            <a href="#evidence" className="hover:text-cold-text">
              How it works
            </a>
            <a href="#cta" className="hover:text-cold-text">
              Play
            </a>
          </nav>

          <p className="font-mono text-[10px] tracking-[0.15em] text-cold-text/35">
            © 2025 COLD · Built for the obsessed
          </p>
        </div>
      </footer>
    </>
  );
}
