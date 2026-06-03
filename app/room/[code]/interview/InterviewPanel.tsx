"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSuspect, MAX_QUESTIONS_PER_SUSPECT } from "@/data/cases/0044/suspects";
import type { InterviewMessage } from "@/lib/types";
import { initials, colorFor } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  Cooperative: "#8aa873",
  Evasive: "#e8c97a",
  Hostile: "#c0392b",
};

export default function InterviewPanel({
  roomId,
  suspectId,
  supabase,
  userId,
}: {
  roomId: string;
  suspectId: string | null;
  supabase: SupabaseClient;
  userId: string;
}) {
  const suspect = suspectId ? getSuspect(suspectId) : undefined;
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Load transcript + realtime for this suspect.
  useEffect(() => {
    if (!suspectId) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("interview_messages")
        .select("*")
        .eq("room_id", roomId)
        .eq("suspect_id", suspectId)
        .order("created_at", { ascending: true });
      if (active && data) setMessages(data as InterviewMessage[]);
    })();

    const channel = supabase
      .channel(`interview-${roomId}-${suspectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interview_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const msg = payload.new as InterviewMessage;
          if (msg.suspect_id !== suspectId) return;
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
  }, [supabase, roomId, suspectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  const questionsAsked = messages.filter((m) => m.role === "user").length;
  const limitReached = questionsAsked >= MAX_QUESTIONS_PER_SUSPECT;

  async function ask() {
    const message = draft.trim();
    if (!message || !suspectId || sending || limitReached) return;
    setDraft("");
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspectId,
          roomId,
          message,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "The suspect didn't respond.");
      }
      // Both turns arrive via the realtime subscription.
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (!suspect) {
    return (
      <div className="flex h-full items-center justify-center bg-cold-black p-8 text-center">
        <p className="max-w-xs text-sm text-cold-muted">
          Select a suspect to begin an interview.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-cold-black">
      {/* Profile (40%) */}
      <div className="hidden w-2/5 flex-col border-r border-cold-border bg-cold-dark p-5 sm:flex">
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-cold-black"
            style={{ background: colorFor(suspect.id) }}
          >
            {initials(suspect.name)}
          </span>
          <div>
            <p className="font-type text-xl text-cold-text">{suspect.name}</p>
            <p className="text-xs text-cold-muted">{suspect.role}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: STATUS_COLOR[suspect.status] }}
          />
          <span className="text-xs uppercase tracking-wider text-cold-muted">
            {suspect.status}
          </span>
        </div>

        <h3 className="mt-6 text-[9px] font-semibold uppercase tracking-[0.2em] text-cold-gold">
          Known facts
        </h3>
        <ul className="mt-2 space-y-2">
          {suspect.knownFacts.map((f, i) => (
            <li key={i} className="flex gap-2 text-xs leading-snug text-cold-text/80">
              <span className="text-cold-muted">—</span>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-cold-border pt-3">
          <p className="text-xs text-cold-muted">
            Questions asked:{" "}
            <span className="text-cold-gold">{questionsAsked}</span> /{" "}
            {MAX_QUESTIONS_PER_SUSPECT}
          </p>
        </div>
      </div>

      {/* Transcript (60%) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && (
            <p className="mt-8 text-center text-xs text-cold-muted">
              {suspect.name} waits. Ask your first question.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 text-sm leading-snug ${
                  m.role === "user"
                    ? "bg-cold-surface text-cold-text"
                    : "bg-cold-paper font-type text-cold-ink"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-cold-paper px-3 py-2 font-type text-sm text-cold-ink/60">
                …
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <p className="px-4 pb-1 text-xs text-cold-red">{error}</p>
        )}

        <div className="border-t border-cold-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              disabled={limitReached || sending}
              placeholder={
                limitReached ? "Question limit reached" : `Ask ${suspect.name}…`
              }
              className="min-w-0 flex-1 border border-cold-border bg-cold-surface px-3 py-2 text-sm text-cold-text outline-none placeholder:text-cold-muted/60 focus:border-cold-gold disabled:opacity-50"
            />
            <button
              onClick={ask}
              disabled={limitReached || sending || !draft.trim()}
              className="bg-cold-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cold-black transition-opacity disabled:opacity-30"
            >
              Ask
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-cold-muted">
            Both investigators can ask questions · {MAX_QUESTIONS_PER_SUSPECT - questionsAsked}{" "}
            remaining
          </p>
        </div>
      </div>
    </div>
  );
}
