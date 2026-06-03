"use client";

import { FileText, Image as ImageIcon, Phone, Lock } from "lucide-react";
import type { CaseMeta, CaseFile } from "@/data/cases/0044/case";
import type { RoomPlayer } from "@/lib/types";

const ICONS = { FileText, Image: ImageIcon, Phone, Lock } as const;

export default function LeftSidebar({
  caseMeta,
  phase,
  me,
  selectedFile,
  onOpenFile,
}: {
  caseMeta: CaseMeta;
  phase: number;
  me: RoomPlayer;
  selectedFile: string | null;
  onOpenFile: (id: string) => void;
}) {
  return (
    <aside className="flex h-full flex-col overflow-hidden bg-cold-dark">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <h2 className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-cold-gold">
          Evidence files
        </h2>
        <ul className="space-y-1">
          {caseMeta.files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              locked={file.phase > phase}
              selected={selectedFile === file.id}
              onOpen={onOpenFile}
            />
          ))}
        </ul>
      </div>

      {/* Private clue */}
      {me.private_clue && (
        <div className="border-t border-cold-border bg-[#241d12] p-3">
          <h3 className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-cold-gold">
            Your private clue
          </h3>
          <p className="text-[10px] uppercase tracking-wide text-cold-muted">
            {me.private_clue.label}
          </p>
          <p className="mt-1.5 font-courier text-xs leading-snug text-cold-text">
            {me.private_clue.text}
          </p>
        </div>
      )}
    </aside>
  );
}

function FileRow({
  file,
  locked,
  selected,
  onOpen,
}: {
  file: CaseFile;
  locked: boolean;
  selected: boolean;
  onOpen: (id: string) => void;
}) {
  const Icon = ICONS[file.icon];
  // Treat freshly available phase-2+ files as "newly unlocked".
  const newlyUnlocked = !locked && file.phase > 1;

  return (
    <li>
      <button
        disabled={locked}
        onClick={() => onOpen(file.id)}
        title={locked ? `Unlocks in Phase ${file.phase}` : undefined}
        className={`group flex w-full items-center gap-2.5 border px-2.5 py-2 text-left transition-colors ${
          selected
            ? "border-cold-gold bg-cold-surface"
            : "border-transparent hover:border-cold-border hover:bg-cold-surface"
        } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <Icon size={15} className="shrink-0 text-cold-muted" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs text-cold-text">
            {file.name}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-cold-muted">
            {file.tag}
          </span>
        </span>
        {locked ? (
          <Lock size={12} className="shrink-0 text-cold-muted" />
        ) : newlyUnlocked ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cold-gold" />
        ) : null}
      </button>
    </li>
  );
}
