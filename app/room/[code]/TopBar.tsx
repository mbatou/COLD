"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import type { Room, RoomPlayer } from "@/lib/types";
import type { CaseMeta } from "@/data/cases/0044/case";
import type { MainView } from "./CaseRoom";
import { initials, colorFor, formatCountdown } from "@/lib/utils";

export default function TopBar({
  caseMeta,
  room,
  players,
  view,
  onSwitchView,
}: {
  caseMeta: CaseMeta;
  room: Room;
  players: RoomPlayer[];
  view: MainView;
  onSwitchView: (v: MainView) => void;
}) {
  const remaining = useCountdown(room.started_at, caseMeta.durationMinutes);
  const urgent = remaining !== null && remaining < 10 * 60 * 1000;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-cold-border bg-cold-dark px-3 sm:px-4">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cold-gold" />
          <span className="font-display text-lg leading-none tracking-[0.15em] text-cold-gold">
            COLD
          </span>
        </div>
        <span className="hidden h-5 w-px bg-cold-border sm:block" />
        <span className="hidden truncate font-type text-sm text-cold-text sm:block">
          {caseMeta.number} — {caseMeta.name}
        </span>
        <span className="hidden shrink-0 border border-cold-border px-2 py-0.5 text-[9px] uppercase tracking-widest text-cold-muted lg:block">
          Phase {room.phase} of {caseMeta.phases}
        </span>
      </div>

      {/* Center — view tabs */}
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {(["board", "files", "interview"] as MainView[]).map((v) => (
          <button
            key={v}
            onClick={() => onSwitchView(v)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors ${
              view === v
                ? "bg-cold-surface text-cold-gold"
                : "text-cold-muted hover:text-cold-text"
            }`}
          >
            {v}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span
          className={`font-display text-xl tabular-nums tracking-wider ${
            urgent ? "animate-pulsered text-cold-red" : "text-cold-gold"
          }`}
        >
          {remaining === null ? "90:00" : formatCountdown(remaining)}
        </span>
        <div className="flex -space-x-1.5">
          {players.slice(0, 6).map((p) => (
            <span
              key={p.id}
              title={p.display_name}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-cold-dark text-[10px] font-bold text-cold-black"
              style={{ background: colorFor(p.user_id) }}
            >
              {initials(p.display_name)}
            </span>
          ))}
        </div>
        <button
          className="text-cold-muted transition-colors hover:text-cold-text"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}

function useCountdown(startedAt: string | null, durationMinutes: number) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setRemaining(durationMinutes * 60 * 1000);
      return;
    }
    const end = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    const tick = () => setRemaining(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationMinutes]);

  return remaining;
}
