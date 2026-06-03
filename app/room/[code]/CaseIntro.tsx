"use client";

import { motion } from "framer-motion";
import type { CaseMeta } from "@/data/cases/0044/case";
import { suspects } from "@/data/cases/0044/suspects";

/**
 * Cinematic case briefing shown before the investigation begins, and
 * re-openable any time from the settings menu. Gives players context
 * instead of dropping them straight onto the board.
 */
export default function CaseIntro({
  caseMeta,
  onBegin,
}: {
  caseMeta: CaseMeta;
  onBegin: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-cold-black/97 px-5 py-10"
    >
      <div className="w-full max-w-xl">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-cold-muted">
          {caseMeta.number} · {caseMeta.genre} · {caseMeta.difficulty}
        </p>
        <h1 className="mt-3 text-center font-display text-5xl tracking-wide text-cold-gold sm:text-6xl">
          {caseMeta.name}
        </h1>

        <div className="mx-auto mt-8 max-w-md border-y border-cold-border py-6">
          <p className="font-type text-base leading-relaxed text-cold-text/85">
            A guest checked into Room 304 of The Meridian Hotel. By 02:15h he was
            dead — no forced entry, no witnesses, a half-finished whiskey on the
            nightstand. The official report calls it inconclusive.
          </p>
          <p className="mt-4 font-type text-base leading-relaxed text-cold-text/85">
            You and your partner have been handed the raw file. Read the
            evidence, pull on the threads, and question the people who were
            there. The truth is in the gaps between their stories.
          </p>
        </div>

        {/* Briefing facts */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Fact label="Time limit" value={caseMeta.estimatedTime.replace("~", "")} />
          <Fact label="Suspects" value={`${suspects.length}`} />
          <Fact label="Phases" value={`${caseMeta.phases}`} />
        </div>

        <div className="mt-6 border border-cold-border bg-cold-dark p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cold-gold">
            How it works
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-snug text-cold-text/70">
            <li>— Each of you holds private clues. Talk to each other.</li>
            <li>— Pin evidence to the board and connect it with string.</li>
            <li>— Interview suspects; they won&apos;t volunteer the truth.</li>
            <li>— Submit a theory before the clock runs out.</li>
          </ul>
        </div>

        <button
          onClick={onBegin}
          className="mt-8 w-full bg-cold-gold py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-cold-black transition-transform hover:-translate-y-0.5"
        >
          Enter the investigation →
        </button>
      </div>
    </motion.div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-cold-border bg-cold-dark py-3">
      <p className="font-display text-2xl text-cold-text">{value}</p>
      <p className="text-[9px] uppercase tracking-widest text-cold-muted">
        {label}
      </p>
    </div>
  );
}
