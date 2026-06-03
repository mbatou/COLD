"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { CaseMeta } from "@/data/cases/0044/case";
import { suspects } from "@/data/cases/0044/suspects";
import type { Room, RoomPlayer, Theory } from "@/lib/types";
import { initials, colorFor, formatCountdown } from "@/lib/utils";

export default function ResolutionScreen({
  caseMeta,
  room,
  players,
  theories,
  onClose,
}: {
  caseMeta: CaseMeta;
  room: Room;
  players: RoomPlayer[];
  theories: Theory[];
  onClose: () => void;
}) {
  const router = useRouter();
  const correct = suspects.find((s) => s.id === caseMeta.correctSuspectId);
  const anyCorrect = theories.some((t) => t.is_correct);

  const revealLine = anyCorrect
    ? `${correct?.name}. The bartender knew.`
    : `${correct?.name}.`;
  const typed = useTyped(revealLine, 55);

  const elapsed = room.started_at
    ? formatCountdown(Date.now() - new Date(room.started_at).getTime())
    : "—";

  function suspectName(id: string) {
    return suspects.find((s) => s.id === id)?.name ?? "Unknown";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-cold-black/97 px-5 py-12"
    >
      <p
        className={`font-display text-5xl tracking-wide sm:text-7xl ${
          anyCorrect ? "text-cold-gold" : "text-cold-red"
        }`}
      >
        {anyCorrect ? "Case solved." : "Case unsolved."}
      </p>
      {anyCorrect && (
        <p className="mt-2 text-sm text-cold-muted">
          Time taken — {elapsed}
        </p>
      )}

      {/* Typed reveal */}
      <p className="mt-8 min-h-[2.5rem] font-type text-2xl text-cold-text sm:text-3xl">
        {typed}
        <span className="ml-0.5 animate-pulse text-cold-gold">|</span>
      </p>

      {/* Theories side by side */}
      {theories.length > 0 && (
        <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          {theories.map((t) => (
            <div
              key={t.id}
              className={`border bg-cold-dark p-4 ${
                t.is_correct ? "border-cold-gold" : "border-cold-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-cold-black"
                  style={{ background: colorFor(t.user_id) }}
                >
                  {initials(t.display_name)}
                </span>
                <span className="text-sm text-cold-text">{t.display_name}</span>
                <span
                  className={`ml-auto text-[10px] uppercase tracking-widest ${
                    t.is_correct ? "text-cold-gold" : "text-cold-red"
                  }`}
                >
                  {t.is_correct ? "Correct" : "Wrong"}
                </span>
              </div>
              <p className="mt-2 font-type text-sm text-cold-text">
                Accused: {suspectName(t.suspect_id)}
              </p>
              {t.reasoning && (
                <p className="mt-1 text-xs leading-snug text-cold-muted">
                  {t.reasoning}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Debrief */}
      <div className="mt-10 max-w-xl text-center">
        <h3 className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cold-gold">
          Case debrief
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-cold-text/75">
          {caseMeta.debrief}
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push("/play")}
          className="bg-cold-gold px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cold-black"
        >
          Return to lobby
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(
              `I just ${anyCorrect ? "solved" : "investigated"} ${caseMeta.name} on COLD — ${room.code}`
            );
          }}
          className="border border-cold-border px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-cold-text transition-colors hover:border-cold-gold"
        >
          Share result
        </button>
        <button
          onClick={onClose}
          className="px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-cold-muted transition-colors hover:text-cold-text"
        >
          Back to board
        </button>
      </div>
    </motion.div>
  );
}

function useTyped(text: string, speed: number) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}
