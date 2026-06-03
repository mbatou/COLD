"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
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
  const [showQR, setShowQR] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const isHost = room.host_id === userId;
  const host = players.find((p) => p.user_id === room.host_id);
  const canStart = players.length >= 2;
  const [letters, digits] = room.code.split("-");

  // Build the scannable join link once the origin is known (client only).
  useEffect(() => {
    setJoinUrl(`${window.location.origin}/play?join=${room.code}`);
  }, [room.code]);

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

      {/* QR join option — scan to join when players are together in person */}
      <button
        onClick={() => setShowQR((v) => !v)}
        className="mt-4 flex items-center gap-2 border border-cold-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cold-text transition-colors hover:border-cold-gold"
      >
        <QrCode size={14} />
        {showQR ? "Hide QR code" : "Show QR to join"}
      </button>

      {showQR && joinUrl && (
        <div className="mt-4 flex flex-col items-center">
          <div className="bg-cold-paper p-4 shadow-xl">
            <QRCodeSVG
              value={joinUrl}
              size={184}
              bgColor="#f4f0e4"
              fgColor="#1a1810"
              level="M"
            />
          </div>
          <p className="mt-2 max-w-[200px] text-center text-[10px] leading-snug text-cold-muted">
            Scan with a phone camera to open the case and join this room.
          </p>
        </div>
      )}

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
