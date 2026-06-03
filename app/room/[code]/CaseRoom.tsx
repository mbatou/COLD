"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Room, RoomPlayer, Theory } from "@/lib/types";
import { getCase } from "@/data/cases/0044/case";
import TopBar from "./TopBar";
import LeftSidebar from "./sidebar/LeftSidebar";
import RightSidebar from "./sidebar/RightSidebar";
import EvidenceBoard from "./board/EvidenceBoard";
import FileViewer from "./files/FileViewer";
import InterviewPanel from "./interview/InterviewPanel";
import ResolutionScreen from "./ResolutionScreen";
import CaseIntro from "./CaseIntro";

export type MainView = "board" | "files" | "interview";
export type MobilePane = MainView | "chat";

/** True when the viewport is below the md breakpoint. Defaults to desktop on
 *  first render, then corrects on mount — so only one layout tree mounts. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export default function CaseRoom({
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
  const caseMeta = getCase(room.case_id);
  const [view, setView] = useState<MainView>("board");
  const [mobilePane, setMobilePane] = useState<MobilePane>("board");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

  const [theories, setTheories] = useState<Theory[]>([]);
  const [resolved, setResolved] = useState(false);
  const isMobile = useIsMobile();

  // Show the case briefing once per room per browser; re-openable from settings.
  const [showBriefing, setShowBriefing] = useState(false);
  useEffect(() => {
    const key = `cold:briefed:${room.code}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      setShowBriefing(true);
    }
  }, [room.code]);

  function dismissBriefing() {
    if (typeof window !== "undefined") {
      localStorage.setItem(`cold:briefed:${room.code}`, "1");
    }
    setShowBriefing(false);
  }

  // --- Theories + resolution realtime ---
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("theories")
        .select("*")
        .eq("room_id", room.id);
      if (active && data) setTheories(data as Theory[]);
    })();

    const channel = supabase
      .channel(`theories-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "theories",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setTheories((prev) => [...prev, payload.new as Theory]);
          setResolved(true);
        }
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, room.id]);

  function openFile(fileId: string) {
    setSelectedFile(fileId);
    setView("files");
    setMobilePane("files");
  }

  function openInterview(suspectId: string) {
    setSelectedSuspect(suspectId);
    setView("interview");
    setMobilePane("interview");
  }

  function switchView(v: MainView) {
    setView(v);
    setMobilePane(v);
  }

  const mainContent = useMemo(() => {
    if (view === "files") {
      return (
        <FileViewer
          caseMeta={caseMeta}
          fileId={selectedFile}
          phase={room.phase}
        />
      );
    }
    if (view === "interview") {
      return (
        <InterviewPanel
          roomId={room.id}
          suspectId={selectedSuspect}
          supabase={supabase}
          userId={userId}
        />
      );
    }
    return (
      <EvidenceBoard
        roomId={room.id}
        userId={userId}
        me={me}
        onOpenInterview={openInterview}
        supabase={supabase}
      />
    );
  }, [view, selectedFile, selectedSuspect, room.phase, room.id, caseMeta]);

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-cold-black text-cold-text">
      <TopBar
        caseMeta={caseMeta}
        room={room}
        players={players}
        view={view}
        userId={userId}
        supabase={supabase}
        onSwitchView={switchView}
        onShowBriefing={() => setShowBriefing(true)}
      />

      {/* Render a single layout tree to avoid double-mounting realtime
          subscriptions (desktop + mobile simultaneously). */}
      {!isMobile ? (
        <div className="grid flex-1 grid-cols-[240px_1fr_220px] overflow-hidden">
          <LeftSidebar
            caseMeta={caseMeta}
            phase={room.phase}
            me={me}
            selectedFile={selectedFile}
            onOpenFile={openFile}
          />
          <div className="relative overflow-hidden border-x border-cold-border">
            {mainContent}
          </div>
          <RightSidebar
            caseMeta={caseMeta}
            room={room}
            me={me}
            userId={userId}
            players={players}
            supabase={supabase}
            onOpenInterview={openInterview}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-hidden">
            {mobilePane === "board" && (
              <EvidenceBoard
                roomId={room.id}
                userId={userId}
                me={me}
                onOpenInterview={openInterview}
                supabase={supabase}
              />
            )}
            {mobilePane === "files" && (
              <div className="flex h-full">
                <div className="w-1/3 min-w-[150px] overflow-y-auto">
                  <LeftSidebar
                    caseMeta={caseMeta}
                    phase={room.phase}
                    me={me}
                    selectedFile={selectedFile}
                    onOpenFile={openFile}
                  />
                </div>
                <div className="flex-1 overflow-hidden border-l border-cold-border">
                  <FileViewer
                    caseMeta={caseMeta}
                    fileId={selectedFile}
                    phase={room.phase}
                  />
                </div>
              </div>
            )}
            {mobilePane === "interview" && (
              <InterviewPanel
                roomId={room.id}
                suspectId={selectedSuspect}
                supabase={supabase}
                userId={userId}
              />
            )}
            {mobilePane === "chat" && (
              <RightSidebar
                caseMeta={caseMeta}
                room={room}
                me={me}
                userId={userId}
                players={players}
                supabase={supabase}
                onOpenInterview={openInterview}
              />
            )}
          </div>
          <nav className="grid grid-cols-4 border-t border-cold-border bg-cold-dark">
            {(["board", "files", "interview", "chat"] as MobilePane[]).map((p) => (
              <button
                key={p}
                onClick={() => setMobilePane(p)}
                className={`py-3 text-[10px] uppercase tracking-[0.15em] ${
                  mobilePane === p ? "text-cold-gold" : "text-cold-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </nav>
        </div>
      )}

      {showBriefing && (
        <CaseIntro caseMeta={caseMeta} onBegin={dismissBriefing} />
      )}

      {resolved && (
        <ResolutionScreen
          caseMeta={caseMeta}
          room={room}
          players={players}
          theories={theories}
          onClose={() => setResolved(false)}
        />
      )}
    </div>
  );
}
