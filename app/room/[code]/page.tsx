"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Room, RoomPlayer } from "@/lib/types";
import Lobby from "./Lobby";
import CaseRoom from "./CaseRoom";

export const dynamic = "force-dynamic";

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "denied">(
    "loading"
  );

  // Initial load + auth.
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/play");
        return;
      }
      if (active) setUserId(user.id);

      const { data: roomRow } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (!roomRow) {
        if (active) setStatus("notfound");
        return;
      }

      const { data: playerRows } = await supabase
        .from("room_players")
        .select("*")
        .eq("room_id", roomRow.id)
        .order("joined_at", { ascending: true });

      const isMember = (playerRows ?? []).some((p) => p.user_id === user.id);
      if (!isMember) {
        if (active) setStatus("denied");
        return;
      }

      if (active) {
        setRoom(roomRow as Room);
        setPlayers((playerRows ?? []) as RoomPlayer[]);
        setStatus("ok");
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase, code, router]);

  // Realtime: room status/phase + player list.
  useEffect(() => {
    if (!room) return;
    const channel = supabase
      .channel(`room-meta-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (payload) => setRoom(payload.new as Room)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${room.id}`,
        },
        async () => {
          const { data } = await supabase
            .from("room_players")
            .select("*")
            .eq("room_id", room.id)
            .order("joined_at", { ascending: true });
          setPlayers((data ?? []) as RoomPlayer[]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, room?.id]);

  const me = useMemo(
    () => players.find((p) => p.user_id === userId) ?? null,
    [players, userId]
  );

  if (status === "loading") {
    return <CenterMessage text="Accessing case room…" />;
  }
  if (status === "notfound") {
    return (
      <CenterMessage
        text="No case room with that code."
        action={{ label: "Back to lobby", href: "/play" }}
      />
    );
  }
  if (status === "denied") {
    return (
      <CenterMessage
        text="You're not assigned to this investigation."
        action={{ label: "Join a room", href: "/play" }}
      />
    );
  }
  if (!room || !me || !userId) return <CenterMessage text="Loading…" />;

  if (room.status === "waiting") {
    return (
      <Lobby
        room={room}
        players={players}
        me={me}
        userId={userId}
        supabase={supabase}
      />
    );
  }

  return (
    <CaseRoom
      room={room}
      players={players}
      me={me}
      userId={userId}
      supabase={supabase}
    />
  );
}

function CenterMessage({
  text,
  action,
}: {
  text: string;
  action?: { label: string; href: string };
}) {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-cold-black px-5 text-center">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-cold-gold" />
        <span className="font-display text-2xl tracking-[0.18em] text-cold-gold">
          COLD
        </span>
      </div>
      <p className="text-sm text-cold-muted">{text}</p>
      {action && (
        <a
          href={action.href}
          className="mt-5 border border-cold-border px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-cold-text transition-colors hover:border-cold-gold"
        >
          {action.label}
        </a>
      )}
    </main>
  );
}
