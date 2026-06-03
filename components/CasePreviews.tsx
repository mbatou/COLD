"use client";

import Reveal from "./Reveal";

type Case = {
  number: string;
  genre: string;
  name: string;
  teaser: string;
  difficulty: "EASY" | "MED" | "HARD";
  players: string;
  time: string;
  featured?: boolean;
};

const cases: Case[] = [
  {
    number: "#0007",
    genre: "NOIR",
    name: "The Meridian Hotel",
    teaser: "A guest checked into room 1408. No one ever saw them check out.",
    difficulty: "HARD",
    players: "2–4 players",
    time: "~90 min",
    featured: true,
  },
  {
    number: "#0012",
    genre: "SCI-FI",
    name: "Signal from Dolus-9",
    teaser: "The mining colony went silent. The last transmission was a lullaby.",
    difficulty: "MED",
    players: "2–6 players",
    time: "~60 min",
  },
  {
    number: "#0019",
    genre: "TRUE CRIME",
    name: "The Lakeshore Tapes",
    teaser: "Forty hours of recovered audio. One voice doesn't belong.",
    difficulty: "EASY",
    players: "2–3 players",
    time: "~45 min",
  },
];

const difficultyColor: Record<Case["difficulty"], string> = {
  EASY: "text-cold-gold border-cold-gold/40",
  MED: "text-cold-paper border-cold-paper/40",
  HARD: "text-cold-blood border-cold-blood/50",
};

export default function CasePreviews() {
  return (
    <section id="cases" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <h2 className="font-display text-4xl tracking-[0.06em] text-cold-text sm:text-5xl">
          Open cases — pick your investigation
        </h2>
      </Reveal>

      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
        {cases.map((c, i) => (
          <Reveal
            key={c.number}
            delay={i * 0.12}
            className="min-w-[80%] snap-start sm:min-w-[55%] md:min-w-0"
          >
            <article
              className={`group flex h-full flex-col border bg-cold-bg2/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-cold-gold ${
                c.featured
                  ? "border-cold-gold/40 md:scale-[1.03] md:shadow-[0_0_40px_rgba(232,201,122,0.08)]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl leading-none text-cold-text/25">
                  {c.number}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-cold-text/45">
                  {c.genre}
                </span>
              </div>

              <h3 className="mt-6 font-type text-2xl text-cold-text">
                {c.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cold-text/55">
                {c.teaser}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span
                  className={`rounded-sm border px-2 py-1 font-mono text-[10px] tracking-[0.18em] ${
                    difficultyColor[c.difficulty]
                  }`}
                >
                  {c.difficulty}
                </span>
                <span className="text-right text-[11px] leading-tight text-cold-text/45">
                  {c.players}
                  <br />
                  {c.time}
                </span>
              </div>

              {c.featured && (
                <span className="mt-4 inline-block font-mono text-[10px] tracking-[0.2em] text-cold-gold">
                  ★ FEATURED CASE
                </span>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
