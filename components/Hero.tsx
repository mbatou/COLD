"use client";

import { motion } from "framer-motion";

// Faint scattered "papers on a desk" — CSS only, no images.
const fragments = [
  { top: "12%", left: "8%", w: 120, h: 150, rot: -14 },
  { top: "20%", left: "78%", w: 140, h: 100, rot: 9 },
  { top: "58%", left: "14%", w: 160, h: 110, rot: 6 },
  { top: "64%", left: "72%", w: 120, h: 160, rot: -8 },
  { top: "38%", left: "44%", w: 180, h: 120, rot: 3 },
  { top: "8%", left: "52%", w: 90, h: 120, rot: -5 },
  { top: "74%", left: "40%", w: 130, h: 90, rot: 12 },
  { top: "30%", left: "24%", w: 100, h: 130, rot: -10 },
];

const lines = [
  ["C", "O"],
  ["L", "D"],
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const letter = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-20"
    >
      {/* Document fragment texture */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {fragments.map((f, i) => (
          <div
            key={i}
            className="absolute border border-cold-text/10 bg-cold-text/[0.025]"
            style={{
              top: f.top,
              left: f.left,
              width: f.w,
              height: f.h,
              transform: `rotate(${f.rot}deg)`,
            }}
          />
        ))}
      </div>

      {/* Giant COLD */}
      <motion.h1
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center leading-[0.82] text-cold-text"
        aria-label="COLD"
      >
        {lines.map((line, li) => (
          <span key={li} className="flex">
            {line.map((ch, ci) => (
              <motion.span
                key={ci}
                variants={letter}
                className="font-display text-[24vw] tracking-[0.12em] sm:text-[22vw] md:text-[20vw]"
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h1>

      {/* Tagline */}
      <motion.p
        variants={fade}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.9 }}
        className="relative z-10 mt-6 font-type text-lg text-cold-gold sm:text-2xl"
      >
        Cases Only Lead Deeper
      </motion.p>

      {/* Subtext */}
      <motion.p
        variants={fade}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.05 }}
        className="relative z-10 mt-4 max-w-xl text-center text-sm text-cold-text/60 sm:text-base"
      >
        A multiplayer investigation game. Receive real files. Work with your
        partner. Find the truth.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
      >
        <a
          href="/play"
          className="rounded-sm bg-cold-gold px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cold-bg transition-transform hover:-translate-y-0.5"
        >
          Open a case
        </a>
        <a
          href="#evidence"
          className="rounded-sm border border-cold-text/25 px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cold-text transition-colors hover:border-cold-text/60"
        >
          Watch the trailer
        </a>
      </motion.div>

      {/* Case file rule */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.4 }}
        className="absolute inset-x-0 bottom-8 z-10 mx-auto flex max-w-3xl items-center gap-4 px-6"
      >
        <span className="h-px flex-1 bg-cold-text/15" />
        <span className="whitespace-nowrap font-mono text-[10px] tracking-[0.25em] text-cold-text/40">
          CASE FILE #0001 — CLASSIFIED
        </span>
        <span className="h-px flex-1 bg-cold-text/15" />
      </motion.div>
    </section>
  );
}
