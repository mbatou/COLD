"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room, RoomPlayer } from "@/lib/types";
import { CASE_0044 } from "@/data/cases/0044/case";
import { initials, colorFor } from "@/lib/utils";

export default function Lobby({
  room,
  players,
  me,
  userId,
  supabase,
}: {
  room: Room;
  players: RoomPlayer[];
  me: RoomPlayer;
  userId: string;
  supabase: SupabaseClient;
}) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const isHost = room.host_id === userId;
  const host = players.find((p) => p.user_id === room.host_id);
  const canStart = players.length >= 2;
  const [letters, digits] = room.code.split("-");

  async function startInvestigation() {
    if (!canStart) return;
    setStarting(true);
    await supabase
      .from("rooms")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", room.id);
    // Realtime will flip every client (including host) into the case room.
  }

  function copyCode() {
    navigator.clipboard?.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-cold-black px-5 py-12">
      <div className="mb-10 flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-cold-gold" />
        <span className="font-display text-2xl tracking-[0.18em] text-cold-gold">
          COLD
        </span>
      </div>

      <button
        onClick={copyCode}
        className="group text-center"
        title="Click to copy"
      >
        <div className="font-display text-6xl tracking-[0.12em] text-cold-gold sm:text-7xl">
          {letters} <span className="text-cold-muted">·</span> {digits}
        </div>
      </button>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cold-muted">
        {copied ? "Copied to clipboard" : "Share this code with your partner"}
      </p>

      {/* Players */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2.5 border border-cold-border bg-cold-dark px-3 py-2"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-cold-black"
              style={{ background: colorFor(p.user_id) }}
            >
              {initials(p.display_name)}
            </span>
            <span className="text-sm text-cold-text">{p.display_name}</span>
            {p.user_id === userId && (
              <span className="text-[9px] uppercase tracking-widest text-cold-gold">
                You
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-cold-muted">
        {canStart
          ? `${players.length} investigators ready`
          : `Waiting for players… (${players.length}/2 minimum)`}
      </p>

      {/* Host control / waiting message */}
      <div className="mt-8">
        {isHost ? (
          <button
            disabled={!canStart || starting}
            onClick={startInvestigation}
            className="bg-cold-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-cold-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            {starting ? "Starting…" : "Start investigation"}
          </button>
        ) : (
          <p className="text-sm text-cold-muted">
            Waiting for {host?.display_name ?? "the host"} to start…
          </p>
        )}
      </div>

      {/* Case preview */}
      <div className="mt-14 w-full max-w-sm border border-cold-border bg-cold-dark p-5 text-center">
        <p className="font-type text-lg text-cold-text">
          {CASE_0044.number} — {CASE_0044.name}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cold-muted">
          {CASE_0044.genre} · {CASE_0044.difficulty} · {CASE_0044.estimatedTime}
        </p>
      </div>
    </main>
  );
}
