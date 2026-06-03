"use client";

import Reveal from "./Reveal";

const stats = [
  { num: "48", label: "active cases" },
  { num: "2–6", label: "players per room" },
  { num: "Free", label: "to play" },
  { num: "Weekly", label: "new case every week" },
];

export default function LiveStats() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.1}
            className={`flex flex-col items-center px-4 py-8 text-center md:py-4 ${
              i !== 0 ? "md:border-l md:border-white/10" : ""
            } ${i % 2 !== 0 ? "border-l border-white/10 md:border-l" : ""}`}
          >
            <span className="font-display text-5xl leading-none text-cold-text sm:text-6xl">
              {s.num}
            </span>
            <span className="mt-3 text-xs uppercase tracking-[0.2em] text-cold-text/50">
              {s.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
