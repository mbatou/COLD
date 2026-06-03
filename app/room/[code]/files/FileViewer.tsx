"use client";

import { Lock, FolderArchive } from "lucide-react";
import type { CaseMeta } from "@/data/cases/0044/case";
import AutopsyReport from "./documents/AutopsyReport";
import CallLog from "./documents/CallLog";
import RoomPhoto from "./documents/RoomPhoto";

export default function FileViewer({
  caseMeta,
  fileId,
  phase,
}: {
  caseMeta: CaseMeta;
  fileId: string | null;
  phase: number;
}) {
  const file = caseMeta.files.find((f) => f.id === fileId);

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center bg-cold-black p-8 text-center">
        <p className="max-w-xs text-sm text-cold-muted">
          Select an evidence file from the left to open it.
        </p>
      </div>
    );
  }

  if (file.phase > phase) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-cold-black p-8 text-center">
        <Lock size={28} className="text-cold-muted" />
        <p className="mt-3 font-type text-base text-cold-text">{file.name}</p>
        <p className="mt-1 text-xs text-cold-muted">
          Locked — unlocks in Phase {file.phase}.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto bg-cold-black p-5 sm:p-8">
      {file.viewer === "autopsy" && <AutopsyReport />}
      {file.viewer === "callLog" && <CallLog />}
      {file.viewer === "roomPhoto" && <RoomPhoto />}
      {file.viewer === "locked" && (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <FolderArchive size={28} className="text-cold-muted" />
          <p className="mt-3 text-sm text-cold-muted">
            This file is encrypted. Find the password elsewhere in the case.
          </p>
        </div>
      )}
    </div>
  );
}
