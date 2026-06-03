"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateRoomCode } from "@/lib/utils";
import { CASE_0044 } from "@/data/cases/0044/case";
import { seedRowsForRoom } from "@/data/cases/0044/board";

export const dynamic = "force-dynamic";

type Mode = "menu" | "create" | "join";

export default function PlayPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("menu");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anonymous auth on landing.
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("signInAnonymously failed:", error);
          if (active)
            setError(
              `Could not start a session: ${error.message}. ` +
                "If this mentions anonymous sign-ins, enable them in Supabase → Authentication → Sign In / Providers."
            );
        } else if (active) {
          setUserId(data.user?.id ?? null);
        }
      } else if (active) {
        setUserId(session.user.id);
      }
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleCreate() {
    if (!name.trim() || !userId) return;
    setBusy(true);
    setError(null);
    try {
      // Generate a unique code with collision check.
      let code = generateRoomCode();
      for (let i = 0; i < 5; i++) {
        const { data: existing } = await supabase
          .from("rooms")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!existing) break;
        code = generateRoomCode();
      }

      const { data: room, error: roomErr } = await supabase
        .from("rooms")
        .insert({
          code,
          case_id: CASE_0044.id,
          host_id: userId,
          status: "waiting",
          phase: 1,
        })
        .select()
        .single();
      if (roomErr || !room) throw roomErr ?? new Error("Room creation failed");

      const { error: playerErr } = await supabase.from("room_players").insert({
        room_id: room.id,
        user_id: userId,
        display_name: name.trim(),
        role: "host",
        private_clue: CASE_0044.privateClues[0] ?? null,
      });
      if (playerErr) throw playerErr;

      // Seed the default board for this case.
      await supabase.from("board_items").insert(seedRowsForRoom(room.id));

      router.push(`/room/${code}`);
    } catch (e) {
      console.error(e);
      setError("Could not create the room. Try again.");
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!name.trim() || !userId) return;
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z]{4}-?\d{4}$/.test(code)) {
      setError("That doesn't look like a valid code.");
      return;
    }
    const normalized = code.includes("-")
      ? code
      : `${code.slice(0, 4)}-${code.slice(4)}`;

    setBusy(true);
    setError(null);
    try {
      const { data: room } = await supabase
        .from("rooms")
        .select("id, status")
        .eq("code", normalized)
        .maybeSingle();

      if (!room) {
        setError("No room found with that code.");
        setBusy(false);
        return;
      }
      if (room.status !== "waiting") {
        setError("That investigation has already started.");
        setBusy(false);
        return;
      }

      // Insert membership (idempotent on the room_id+user_id unique constraint).
      const players = await supabase
        .from("room_players")
        .select("id", { count: "exact", head: true })
        .eq("room_id", room.id);
      const order = players.count ?? 0;

      await supabase.from("room_players").upsert(
        {
          room_id: room.id,
          user_id: userId,
          display_name: name.trim(),
          role: "investigator",
          private_clue:
            CASE_0044.privateClues[order % CASE_0044.privateClues.length] ?? null,
        },
        { onConflict: "room_id,user_id" }
      );

      router.push(`/room/${normalized}`);
    } catch (e) {
      console.error(e);
      setError("Could not join the room. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-cold-black px-5">
      <div className="mb-10 flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-cold-gold" />
        <span className="font-display text-3xl tracking-[0.18em] text-cold-gold">
          COLD
        </span>
      </div>

      <div className="w-full max-w-sm border border-cold-border bg-cold-dark p-7">
        {!ready ? (
          <p className="text-center text-sm text-cold-muted">
            Establishing secure session…
          </p>
        ) : (
          <>
            <label className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-cold-gold">
              Your investigator name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. J. Calloway"
              maxLength={24}
              className="mb-6 w-full border border-cold-border bg-cold-surface px-3 py-2.5 text-sm text-cold-text outline-none placeholder:text-cold-muted/60 focus:border-cold-gold"
            />

            {mode === "menu" && (
              <div className="space-y-3">
                <button
                  disabled={!name.trim()}
                  onClick={() => setMode("create")}
                  className="w-full bg-cold-gold px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cold-black transition-opacity disabled:opacity-30"
                >
                  Create a room
                </button>
                <button
                  disabled={!name.trim()}
                  onClick={() => setMode("join")}
                  className="w-full border border-cold-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cold-text transition-colors hover:border-cold-gold disabled:opacity-30"
                >
                  Join a room
                </button>
              </div>
            )}

            {mode === "create" && (
              <div>
                <div className="mb-5 border border-cold-border bg-cold-surface p-4">
                  <p className="font-type text-base text-cold-text">
                    {CASE_0044.number} — {CASE_0044.name}
                  </p>
                  <p className="mt-1 text-xs text-cold-muted">
                    {CASE_0044.genre} · {CASE_0044.difficulty} ·{" "}
                    {CASE_0044.estimatedTime}
                  </p>
                </div>
                <button
                  disabled={busy}
                  onClick={handleCreate}
                  className="w-full bg-cold-gold px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cold-black disabled:opacity-40"
                >
                  {busy ? "Opening case…" : "Open case & get code"}
                </button>
                <BackButton onClick={() => setMode("menu")} disabled={busy} />
              </div>
            )}

            {mode === "join" && (
              <div>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="KITE-7743"
                  maxLength={9}
                  className="mb-4 w-full border border-cold-border bg-cold-surface px-3 py-2.5 text-center font-display text-2xl tracking-[0.3em] text-cold-gold outline-none placeholder:text-cold-muted/40 focus:border-cold-gold"
                />
                <button
                  disabled={busy}
                  onClick={handleJoin}
                  className="w-full bg-cold-gold px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cold-black disabled:opacity-40"
                >
                  {busy ? "Joining…" : "Join investigation"}
                </button>
                <BackButton onClick={() => setMode("menu")} disabled={busy} />
              </div>
            )}

            {error && (
              <p className="mt-4 text-center text-xs text-cold-red">{error}</p>
            )}
          </>
        )}
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-cold-muted/60">
        Free to play · No account needed
      </p>
    </main>
  );
}

function BackButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-3 w-full text-center text-[10px] uppercase tracking-[0.2em] text-cold-muted transition-colors hover:text-cold-text disabled:opacity-30"
    >
      ← Back
    </button>
  );
}
