"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Pause, Play, LogOut, BookOpen } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room, RoomPlayer } from "@/lib/types";
import type { CaseMeta } from "@/data/cases/0044/case";
import type { MainView } from "./CaseRoom";
import { initials, colorFor, formatCountdown } from "@/lib/utils";

export default function TopBar({
  caseMeta,
  room,
  players,
  view,
  userId,
  supabase,
  onSwitchView,
  onShowBriefing,
}: {
  caseMeta: CaseMeta;
  room: Room;
  players: RoomPlayer[];
  view: MainView;
  userId: string;
  supabase: SupabaseClient;
  onSwitchView: (v: MainView) => void;
  onShowBriefing: () => void;
}) {
  const router = useRouter();
  const remaining = useCountdown(room, caseMeta.durationMinutes);
  const urgent = remaining < 10 * 60 * 1000 && !room.paused;
  const isHost = room.host_id === userId;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function togglePause() {
    if (!isHost) return;
    if (room.paused) {
      const added = room.paused_at
        ? Date.now() - new Date(room.paused_at).getTime()
        : 0;
      await supabase
        .from("rooms")
        .update({
          paused: false,
          paused_at: null,
          pause_total_ms: room.pause_total_ms + added,
        })
        .eq("id", room.id);
    } else {
      await supabase
        .from("rooms")
        .update({ paused: true, paused_at: new Date().toISOString() })
        .eq("id", room.id);
    }
    setMenuOpen(false);
  }

  async function leaveRoom() {
    await supabase
      .from("room_players")
      .delete()
      .eq("room_id", room.id)
      .eq("user_id", userId);
    router.push("/play");
  }

  return (
    <header className="relative flex h-12 shrink-0 items-center justify-between border-b border-cold-border bg-cold-dark px-3 sm:px-4">
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
            room.paused
              ? "text-cold-muted"
              : urgent
                ? "animate-pulsered text-cold-red"
                : "text-cold-gold"
          }`}
          title={room.paused ? "Paused" : undefined}
        >
          {formatCountdown(remaining)}
        </span>
        {room.paused && (
          <span className="hidden text-[9px] uppercase tracking-widest text-cold-muted sm:inline">
            Paused
          </span>
        )}
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

        {/* Settings menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`transition-colors ${menuOpen ? "text-cold-gold" : "text-cold-muted hover:text-cold-text"}`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 border border-cold-border bg-cold-dark shadow-xl">
              <MenuItem
                onClick={togglePause}
                disabled={!isHost}
                icon={room.paused ? <Play size={14} /> : <Pause size={14} />}
              >
                {room.paused ? "Resume timer" : "Pause timer"}
                {!isHost && (
                  <span className="ml-auto text-[9px] text-cold-muted">host</span>
                )}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onShowBriefing();
                  setMenuOpen(false);
                }}
                icon={<BookOpen size={14} />}
              >
                Case briefing
              </MenuItem>
              <MenuItem onClick={leaveRoom} icon={<LogOut size={14} />} danger>
                Leave room
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  children,
  onClick,
  icon,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors hover:bg-cold-surface disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "text-cold-red" : "text-cold-text"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/** Countdown that freezes while the room is paused. */
function useCountdown(room: Room, durationMinutes: number): number {
  const [, tick] = useState(0);

  useEffect(() => {
    if (room.paused) return; // frozen — no need to tick
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [room.paused]);

  if (!room.started_at) return durationMinutes * 60 * 1000;

  const deadline =
    new Date(room.started_at).getTime() +
    durationMinutes * 60 * 1000 +
    (room.pause_total_ms || 0);

  if (room.paused && room.paused_at) {
    return Math.max(0, deadline - new Date(room.paused_at).getTime());
  }
  return Math.max(0, deadline - Date.now());
}
