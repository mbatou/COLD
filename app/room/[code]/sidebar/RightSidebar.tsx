"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CaseMeta } from "@/data/cases/0044/case";
import { suspects } from "@/data/cases/0044/suspects";
import type { ChatMessage, Room, RoomPlayer } from "@/lib/types";
import { initials, colorFor, relativeTime } from "@/lib/utils";

export default function RightSidebar({
  caseMeta,
  room,
  me,
  userId,
  players,
  supabase,
  onOpenInterview,
}: {
  caseMeta: CaseMeta;
  room: Room;
  me: RoomPlayer;
  userId: string;
  players: RoomPlayer[];
  supabase: SupabaseClient;
  onOpenInterview: (suspectId: string) => void;
}) {
  const [questioned, setQuestioned] = useState<Set<string>>(new Set());
  const [theorySuspect, setTheorySuspect] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Distinct suspects the team has questioned (gates theory submission).
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("interview_messages")
        .select("suspect_id")
        .eq("room_id", room.id)
        .eq("role", "user");
      if (active && data)
        setQuestioned(new Set(data.map((d) => d.suspect_id as string)));
    };
    load();
    const channel = supabase
      .channel(`interview-count-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interview_messages",
          filter: `room_id=eq.${room.id}`,
        },
        load
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, room.id]);

  // Chat history + realtime.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true });
      if (active && data) setMessages(data as ChatMessage[]);
    })();

    const channel = supabase
      .channel(`chat-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // RLS hides others' private messages, but guard client-side too.
          if (msg.is_private && msg.user_id !== userId) return;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, room.id, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    await supabase.from("chat_messages").insert({
      room_id: room.id,
      user_id: userId,
      display_name: me.display_name,
      content,
      is_private: false,
    });
  }

  async function submitTheory() {
    if (!theorySuspect || questioned.size < 2) return;
    setSubmitting(true);
    await supabase.from("theories").insert({
      room_id: room.id,
      user_id: userId,
      display_name: me.display_name,
      suspect_id: theorySuspect,
      reasoning: reasoning.trim(),
      is_correct: theorySuspect === caseMeta.correctSuspectId,
    });
    // Resolution overlay is driven by the realtime INSERT in CaseRoom.
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-cold-dark">
      {/* Suspects */}
      <section className="border-b border-cold-border px-3 py-3">
        <h2 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-cold-gold">
          Suspects
        </h2>
        <ul className="space-y-1.5">
          {suspects.map((s) => {
            const asked = questioned.has(s.id);
            return (
              <li key={s.id}>
                <button
                  onClick={() => onOpenInterview(s.id)}
                  className="flex w-full items-center gap-2.5 border border-transparent px-2 py-1.5 text-left transition-colors hover:border-cold-border hover:bg-cold-surface"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-cold-black"
                    style={{ background: colorFor(s.id) }}
                  >
                    {initials(s.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-cold-text">
                      {s.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-cold-muted">
                      {asked ? "Questioned" : "Not questioned"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Theory box */}
      <section className="border-b border-cold-border px-3 py-3">
        <h2 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-cold-gold">
          Your current theory
        </h2>
        <select
          value={theorySuspect}
          onChange={(e) => setTheorySuspect(e.target.value)}
          className="mb-2 w-full border border-cold-border bg-cold-surface px-2 py-1.5 text-xs text-cold-text outline-none focus:border-cold-gold"
        >
          <option value="">Select the responsible party…</option>
          {suspects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <textarea
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="Your reasoning…"
          rows={2}
          className="mb-2 w-full resize-none border border-cold-border bg-cold-surface px-2 py-1.5 text-xs text-cold-text outline-none placeholder:text-cold-muted/60 focus:border-cold-gold"
        />
        <button
          disabled={!theorySuspect || questioned.size < 2 || submitting}
          onClick={submitTheory}
          className="w-full bg-cold-gold py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cold-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          {submitting ? "Submitting…" : "Submit theory"}
        </button>
        {questioned.size < 2 && (
          <p className="mt-1.5 text-[9px] text-cold-muted">
            Question at least 2 suspects to submit ({questioned.size}/2).
          </p>
        )}
      </section>

      {/* Team chat */}
      <section className="flex min-h-0 flex-1 flex-col">
        <h2 className="px-3 pt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-cold-gold">
          Team chat
        </h2>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
          {me.private_clue && (
            <div className="border border-[#5a4a24] bg-[#241d12] p-2">
              <p className="text-[8px] uppercase tracking-widest text-cold-gold">
                Private · only you
              </p>
              <p className="mt-1 font-courier text-[11px] leading-snug text-cold-text">
                {me.private_clue.text}
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className="text-xs">
              <span
                className="font-semibold"
                style={{ color: colorFor(m.user_id) }}
              >
                {m.display_name}
              </span>
              <span className="ml-1.5 text-[9px] text-cold-muted">
                {relativeTime(m.created_at)}
              </span>
              <p className="leading-snug text-cold-text/90">{m.content}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex items-center gap-1.5 border-t border-cold-border p-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message your team…"
            className="min-w-0 flex-1 border border-cold-border bg-cold-surface px-2 py-1.5 text-xs text-cold-text outline-none placeholder:text-cold-muted/60 focus:border-cold-gold"
          />
          <button
            onClick={sendMessage}
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-cold-surface text-cold-gold transition-colors hover:bg-cold-border"
          >
            <Send size={14} />
          </button>
        </div>
      </section>
    </aside>
  );
}
