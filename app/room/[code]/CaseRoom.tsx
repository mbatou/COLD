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

export type MainView = "board" | "files" | "interview";
export type MobilePane = MainView | "chat";

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
        onSwitchView={switchView}
      />

      {/* Desktop grid */}
      <div className="hidden flex-1 overflow-hidden md:grid md:grid-cols-[240px_1fr_220px]">
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

      {/* Mobile single-column with pane tabs */}
      <div className="flex flex-1 flex-col overflow-hidden md:hidden">
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
