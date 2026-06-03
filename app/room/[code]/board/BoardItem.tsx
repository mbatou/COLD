"use client";

import { memo, useState } from "react";
import { useDrag } from "@use-gesture/react";
import type { BoardItem as TItem } from "@/lib/types";
import { initials, colorFor } from "@/lib/utils";
import CrimeSceneSVG from "@/components/CrimeSceneSVG";

interface Props {
  item: TItem;
  scale: number;
  connectMode: boolean;
  pendingConnect: boolean;
  onDrag: (id: string, dx: number, dy: number, last: boolean) => void;
  onConnectClick: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onOpenInterview: (suspectId: string) => void;
}

function BoardItemBase({
  item,
  scale,
  connectMode,
  pendingConnect,
  onDrag,
  onConnectClick,
  onEdit,
  onOpenInterview,
}: Props) {
  const [editing, setEditing] = useState(false);

  const bind = useDrag(
    ({ delta: [dx, dy], last, event }) => {
      event.stopPropagation();
      onDrag(item.id, dx / scale, dy / scale, last);
    },
    { enabled: !connectMode && !editing, filterTaps: true, pointer: { keys: false } }
  );

  function handleClick(e: React.MouseEvent) {
    if (connectMode) {
      e.stopPropagation();
      onConnectClick(item.id);
    }
  }

  return (
    <div
      {...bind()}
      onClick={handleClick}
      className="absolute touch-none select-none"
      style={{
        left: item.pos_x,
        top: item.pos_y,
        transform: `rotate(${item.rotation}deg)`,
        zIndex: pendingConnect ? 20 : 10,
        cursor: connectMode ? "crosshair" : "grab",
        outline: pendingConnect ? "2px solid #e8c97a" : undefined,
      }}
    >
      {item.type === "note" && (
        <NoteCard
          item={item}
          editing={editing}
          setEditing={setEditing}
          onEdit={onEdit}
        />
      )}
      {item.type === "suspect" && (
        <SuspectCard item={item} onOpenInterview={onOpenInterview} connectMode={connectMode} />
      )}
      {item.type === "doc" && <DocCard item={item} />}
      {item.type === "newspaper" && <NewspaperCard item={item} />}
      {item.type === "photo" && <PhotoCard item={item} />}
      {item.type === "map" && <MapCard item={item} />}
    </div>
  );
}

/* ---------------- note ---------------- */
const NOTE_BG: Record<string, string> = {
  yellow: "#f5f0d8",
  blue: "#d8e8f0",
  red: "#f8e8e8",
};
const PIN: Record<string, string> = {
  yellow: "#c9a227",
  blue: "#3b6e8f",
  red: "#c0392b",
};

function NoteCard({
  item,
  editing,
  setEditing,
  onEdit,
}: {
  item: TItem;
  editing: boolean;
  setEditing: (v: boolean) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const color = (item.content.color as string) ?? "yellow";
  const text = (item.content.text as string) ?? "";
  const author = (item.content.author as string) ?? "";
  return (
    <div
      className="relative shadow-lg"
      style={{ width: 140, height: 100, background: NOTE_BG[color] }}
      onDoubleClick={() => setEditing(true)}
    >
      <span
        className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full shadow"
        style={{ top: -5, background: PIN[color] }}
      />
      {editing ? (
        <textarea
          autoFocus
          defaultValue={text}
          onBlur={(e) => {
            onEdit(item.id, e.target.value);
            setEditing(false);
          }}
          className="h-full w-full resize-none bg-transparent p-2.5 pt-3.5 font-courier text-[12px] leading-tight text-cold-ink outline-none"
        />
      ) : (
        <p className="h-full w-full overflow-hidden p-2.5 pt-3.5 font-courier text-[12px] leading-tight text-cold-ink">
          {text || "double-click to write"}
        </p>
      )}
      {author && (
        <span className="absolute bottom-1 right-1.5 font-courier text-[8px] text-cold-ink/50">
          {author}
        </span>
      )}
    </div>
  );
}

/* ---------------- suspect ---------------- */
function SuspectCard({
  item,
  onOpenInterview,
  connectMode,
}: {
  item: TItem;
  onOpenInterview: (id: string) => void;
  connectMode: boolean;
}) {
  const suspectId = (item.content.suspectId as string) ?? "";
  const name = (item.content.name as string) ?? "Unknown";
  const role = (item.content.role as string) ?? "";
  const flagged = Boolean(item.content.flagged);
  return (
    <div
      className="border border-cold-border bg-cold-surface p-2.5 shadow-lg"
      style={{ width: 160 }}
      onDoubleClick={() => !connectMode && onOpenInterview(suspectId)}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-cold-black"
          style={{ background: colorFor(suspectId) }}
        >
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-type text-sm text-cold-text">{name}</p>
          <p className="text-[10px] text-cold-muted">{role}</p>
        </div>
      </div>
      {flagged && (
        <span className="mt-2 inline-block bg-cold-red px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-cold-text">
          Suspect
        </span>
      )}
    </div>
  );
}

/* ---------------- doc ---------------- */
function DocCard({ item }: { item: TItem }) {
  const ref = (item.content.ref as string) ?? "CASE FILE";
  const title = (item.content.title as string) ?? "Police Form";
  const rows = (item.content.rows as string[]) ?? [];
  return (
    <div
      className="bg-cold-paper p-3 shadow-lg"
      style={{ width: 160 }}
    >
      <div className="flex items-center justify-between border-b border-cold-ink/20 pb-1">
        <span className="font-courier text-[8px] tracking-widest text-cold-ink/60">
          {ref}
        </span>
        <span className="font-courier text-[8px] tracking-widest text-cold-red">
          CONF.
        </span>
      </div>
      <p className="mt-1.5 font-courier text-[11px] font-bold text-cold-ink">
        {title}
      </p>
      <div className="mt-1.5 space-y-1">
        {rows.map((r, i) => (
          <p key={i} className="font-courier text-[9px] leading-tight text-cold-ink/80">
            {r}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ---------------- newspaper ---------------- */
function NewspaperCard({ item }: { item: TItem }) {
  const masthead = (item.content.masthead as string) ?? "THE HERALD";
  const headline = (item.content.headline as string) ?? "";
  const body = (item.content.body as string) ?? "";
  return (
    <div className="bg-[#efe9d8] p-3 shadow-lg" style={{ width: 180 }}>
      <p className="border-b border-cold-ink/30 pb-1 text-center font-type text-[11px] tracking-wide text-cold-ink">
        {masthead}
      </p>
      <p className="mt-1.5 font-display text-base leading-none tracking-tight text-cold-ink">
        {headline}
      </p>
      <p className="mt-1.5 columns-2 gap-2 font-courier text-[8px] leading-tight text-cold-ink/75">
        {body}
      </p>
    </div>
  );
}

/* ---------------- photo ---------------- */
function PhotoCard({ item }: { item: TItem }) {
  const caption = (item.content.caption as string) ?? "Evidence photo";
  return (
    <div
      className="bg-white shadow-xl"
      style={{ width: 160, padding: "6px 6px 20px" }}
    >
      <div className="relative h-32 overflow-hidden bg-[#1a160f]">
        <CrimeSceneSVG className="h-full w-full" />
      </div>
      <p className="mt-2 px-1 text-center font-type text-[9px] text-cold-ink">
        {caption}
      </p>
    </div>
  );
}

/* ---------------- map ---------------- */
function MapCard({ item }: { item: TItem }) {
  const label = (item.content.label as string) ?? "City Map";
  const marker = (item.content.marker as string) ?? "Scene";
  return (
    <div className="bg-cold-surface p-2 shadow-lg" style={{ width: 160 }}>
      <div
        className="relative h-24 w-full border border-cold-border"
        style={{
          backgroundImage:
            "linear-gradient(#2a2620 1px, transparent 1px), linear-gradient(90deg, #2a2620 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        <span className="absolute left-[58%] top-[42%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cold-red shadow-[0_0_8px_rgba(192,57,43,0.8)]" />
      </div>
      <p className="mt-1.5 text-[9px] uppercase tracking-wide text-cold-muted">
        {label} · {marker}
      </p>
    </div>
  );
}

function propsEqual(a: Props, b: Props) {
  return (
    a.item === b.item &&
    a.scale === b.scale &&
    a.connectMode === b.connectMode &&
    a.pendingConnect === b.pendingConnect
  );
}

export default memo(BoardItemBase, propsEqual);
