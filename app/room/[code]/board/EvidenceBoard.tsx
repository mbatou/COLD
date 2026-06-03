"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { StickyNote, Link2, UserPlus, Crosshair, ChevronDown } from "lucide-react";
import type { BoardItem as TItem, BoardString, RoomPlayer, StringColor } from "@/lib/types";
import { suspects } from "@/data/cases/0044/suspects";
import { colorFor } from "@/lib/utils";
import BoardItem from "./BoardItem";
import StringLayer from "./StringLayer";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  STRING_CYCLE,
  STRING_STROKE,
} from "./boardConfig";

interface Cursor {
  x: number;
  y: number;
  name: string;
  color: string;
  t: number;
}

interface StringMenu {
  stringId: string;
  x: number;
  y: number;
}

export default function EvidenceBoard({
  roomId,
  userId,
  me,
  onOpenInterview,
  supabase,
}: {
  roomId: string;
  userId: string;
  me: RoomPlayer;
  onOpenInterview: (suspectId: string) => void;
  supabase: SupabaseClient;
}) {
  const [items, setItems] = useState<TItem[]>([]);
  const [strings, setStrings] = useState<BoardString[]>([]);
  const [view, setView] = useState({ x: -560, y: -260, scale: 0.7 });
  const [connectMode, setConnectMode] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [noteMenu, setNoteMenu] = useState(false);
  const [stringMenu, setStringMenu] = useState<StringMenu | null>(null);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});

  const viewportRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const panning = useRef<{ x: number; y: number } | null>(null);
  const lastCursorSent = useRef(0);

  /* -------- initial load + realtime -------- */
  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: itemRows }, { data: stringRows }] = await Promise.all([
        supabase.from("board_items").select("*").eq("room_id", roomId),
        supabase.from("board_strings").select("*").eq("room_id", roomId),
      ]);
      if (!active) return;
      if (itemRows) setItems(itemRows as TItem[]);
      if (stringRows) setStrings(stringRows as BoardString[]);
    })();

    const channel = supabase
      .channel(`board-${roomId}`, { config: { broadcast: { self: false } } })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "board_items", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const it = payload.new as TItem;
            setItems((prev) => (prev.some((i) => i.id === it.id) ? prev : [...prev, it]));
          } else if (payload.eventType === "UPDATE") {
            const it = payload.new as TItem;
            setItems((prev) => prev.map((i) => (i.id === it.id ? it : i)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            setItems((prev) => prev.filter((i) => i.id !== id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "board_strings", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const s = payload.new as BoardString;
            setStrings((prev) => (prev.some((x) => x.id === s.id) ? prev : [...prev, s]));
          } else if (payload.eventType === "UPDATE") {
            const s = payload.new as BoardString;
            setStrings((prev) => prev.map((x) => (x.id === s.id ? s : x)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            setStrings((prev) => prev.filter((x) => x.id !== id));
          }
        }
      )
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        if (payload.userId === userId) return;
        setCursors((prev) => ({
          ...prev,
          [payload.userId]: {
            x: payload.x,
            y: payload.y,
            name: payload.name,
            color: payload.color,
            t: Date.now(),
          },
        }));
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      active = false;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [supabase, roomId, userId]);

  // Expire stale cursors.
  useEffect(() => {
    const id = setInterval(() => {
      setCursors((prev) => {
        const now = Date.now();
        const next: Record<string, Cursor> = {};
        for (const [k, c] of Object.entries(prev)) if (now - c.t < 5000) next[k] = c;
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  /* -------- item drag (optimistic + persist) -------- */
  const handleDrag = useCallback(
    (id: string, dx: number, dy: number, last: boolean) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, pos_x: i.pos_x + dx, pos_y: i.pos_y + dy } : i
        );
        if (last) {
          const moved = next.find((i) => i.id === id);
          if (moved) {
            supabase
              .from("board_items")
              .update({ pos_x: moved.pos_x, pos_y: moved.pos_y })
              .eq("id", id)
              .then(() => {});
          }
        }
        return next;
      });
    },
    [supabase]
  );

  const handleEdit = useCallback(
    (id: string, text: string) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, content: { ...i.content, text } } : i
        )
      );
      const item = items.find((i) => i.id === id);
      if (item) {
        supabase
          .from("board_items")
          .update({ content: { ...item.content, text } })
          .eq("id", id)
          .then(() => {});
      }
    },
    [supabase, items]
  );

  /* -------- connect mode -------- */
  const handleConnectClick = useCallback(
    (id: string) => {
      setPending((prev) => {
        if (!prev) return id;
        if (prev === id) return null;
        // Create string prev -> id.
        const row = {
          room_id: roomId,
          from_item_id: prev,
          to_item_id: id,
          color: "red" as StringColor,
          created_by: userId,
        };
        supabase
          .from("board_strings")
          .insert(row)
          .select()
          .single()
          .then(({ data }) => {
            if (data) setStrings((s) => [...s, data as BoardString]);
          });
        return null;
      });
    },
    [supabase, roomId, userId]
  );

  /* -------- add items -------- */
  function viewCenterBoardCoords() {
    const rect = viewportRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    return {
      x: (cx - view.x) / view.scale,
      y: (cy - view.y) / view.scale,
    };
  }

  async function addNote(color: "yellow" | "blue" | "red") {
    setNoteMenu(false);
    const c = viewCenterBoardCoords();
    const row = {
      room_id: roomId,
      type: "note" as const,
      content: { color, text: "", author: me.display_name },
      pos_x: c.x - 70 + (Math.random() * 40 - 20),
      pos_y: c.y - 50 + (Math.random() * 40 - 20),
      rotation: Math.random() * 6 - 3,
      created_by: userId,
    };
    const { data } = await supabase.from("board_items").insert(row).select().single();
    if (data) setItems((prev) => [...prev, data as TItem]);
  }

  async function addSuspect() {
    const onBoard = new Set(
      items.filter((i) => i.type === "suspect").map((i) => i.content.suspectId)
    );
    const next = suspects.find((s) => !onBoard.has(s.id)) ?? suspects[0];
    const c = viewCenterBoardCoords();
    const row = {
      room_id: roomId,
      type: "suspect" as const,
      content: { suspectId: next.id, name: next.name, role: next.role, flagged: false },
      pos_x: c.x - 80,
      pos_y: c.y - 50,
      rotation: Math.random() * 4 - 2,
      created_by: userId,
    };
    const { data } = await supabase.from("board_items").insert(row).select().single();
    if (data) setItems((prev) => [...prev, data as TItem]);
  }

  function resetView() {
    setView({ x: -560, y: -260, scale: 0.7 });
  }

  /* -------- string context menu -------- */
  async function cycleStringColor(s: BoardString) {
    const idx = STRING_CYCLE.indexOf(s.color);
    const color = STRING_CYCLE[(idx + 1) % STRING_CYCLE.length];
    setStrings((prev) => prev.map((x) => (x.id === s.id ? { ...x, color } : x)));
    await supabase.from("board_strings").update({ color }).eq("id", s.id);
    setStringMenu(null);
  }
  async function deleteString(id: string) {
    setStrings((prev) => prev.filter((x) => x.id !== id));
    await supabase.from("board_strings").delete().eq("id", id);
    setStringMenu(null);
  }

  /* -------- pan + zoom + cursor broadcast -------- */
  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0 || connectMode) return;
    panning.current = { x: e.clientX - view.x, y: e.clientY - view.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (panning.current) {
      // Capture before setView: the functional updater may run after
      // onPointerUp has cleared panning.current, which would read null.x.
      const p = panning.current;
      setView((v) => ({ ...v, x: e.clientX - p.x, y: e.clientY - p.y }));
    }
    // Broadcast cursor (throttled).
    const now = Date.now();
    if (now - lastCursorSent.current > 60 && channelRef.current) {
      lastCursorSent.current = now;
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        channelRef.current.send({
          type: "broadcast",
          event: "cursor",
          payload: {
            userId,
            name: me.display_name,
            color: colorFor(userId),
            x: (e.clientX - rect.left - view.x) / view.scale,
            y: (e.clientY - rect.top - view.y) / view.scale,
          },
        });
      }
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    panning.current = null;
  }
  function onWheel(e: React.WheelEvent) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(2, Math.max(0.25, view.scale * factor));
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Keep the point under the cursor fixed.
    const nx = mx - ((mx - view.x) * newScale) / view.scale;
    const ny = my - ((my - view.y) * newScale) / view.scale;
    setView({ x: nx, y: ny, scale: newScale });
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-cold-surface">
      {/* Toolbar */}
      <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-1 border border-cold-border bg-cold-dark/95 p-1 shadow-xl backdrop-blur">
        <div className="relative">
          <ToolButton active={noteMenu} onClick={() => setNoteMenu((v) => !v)}>
            <StickyNote size={14} /> Pin Note <ChevronDown size={12} />
          </ToolButton>
          {noteMenu && (
            <div className="absolute left-0 top-full mt-1 flex flex-col border border-cold-border bg-cold-dark p-1 shadow-xl">
              {(["yellow", "blue", "red"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => addNote(c)}
                  className="flex items-center gap-2 px-2 py-1.5 text-left text-[11px] capitalize text-cold-text hover:bg-cold-surface"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: c === "yellow" ? "#f5f0d8" : c === "blue" ? "#d8e8f0" : "#f8e8e8" }}
                  />
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <ToolButton active={connectMode} onClick={() => { setConnectMode((v) => !v); setPending(null); }}>
          <Link2 size={14} /> Connect
        </ToolButton>
        <ToolButton onClick={addSuspect}>
          <UserPlus size={14} /> Add Suspect
        </ToolButton>
        <ToolButton onClick={resetView}>
          <Crosshair size={14} /> Reset View
        </ToolButton>
      </div>

      {connectMode && (
        <div className="absolute left-1/2 top-16 z-30 -translate-x-1/2 bg-cold-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cold-black">
          {pending ? "Click a second item to connect" : "Click an item to start a string"}
        </div>
      )}

      {/* Viewport */}
      <div
        ref={viewportRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
        onClick={() => { setNoteMenu(false); setStringMenu(null); }}
        style={{
          backgroundColor: "#1a1814",
          backgroundImage: "radial-gradient(rgba(122,110,90,0.15) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Board surface */}
        <div
          className="relative origin-top-left"
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <StringLayer
            items={items}
            strings={strings}
            onContextMenu={(stringId, x, y) => setStringMenu({ stringId, x, y })}
          />
          {items.map((item) => (
            <BoardItem
              key={item.id}
              item={item}
              scale={view.scale}
              connectMode={connectMode}
              pendingConnect={pending === item.id}
              onDrag={handleDrag}
              onConnectClick={handleConnectClick}
              onEdit={handleEdit}
              onOpenInterview={onOpenInterview}
            />
          ))}

          {/* Remote cursors */}
          {Object.entries(cursors).map(([uid, c]) => (
            <div
              key={uid}
              className="pointer-events-none absolute z-40 flex items-center gap-1"
              style={{ left: c.x, top: c.y }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <span
                className="whitespace-nowrap px-1 text-[10px] text-cold-black"
                style={{ background: c.color }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* String context menu */}
      {stringMenu && (
        <div
          className="fixed z-50 border border-cold-border bg-cold-dark text-xs shadow-xl"
          style={{ left: stringMenu.x, top: stringMenu.y }}
        >
          {(() => {
            const s = strings.find((x) => x.id === stringMenu.stringId);
            if (!s) return null;
            return (
              <>
                <button
                  onClick={() => cycleStringColor(s)}
                  className="block w-full px-3 py-2 text-left text-cold-text hover:bg-cold-surface"
                >
                  Cycle color
                </button>
                <button
                  onClick={() => deleteString(s.id)}
                  className="block w-full px-3 py-2 text-left text-cold-red hover:bg-cold-surface"
                >
                  Delete string
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Minimap */}
      <Minimap items={items} view={view} viewportRef={viewportRef} />

      {/* String legend */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-3 border border-cold-border bg-cold-dark/90 px-2.5 py-1.5 text-[9px] uppercase tracking-wider">
        {(["red", "gold", "blue"] as StringColor[]).map((c) => (
          <span key={c} className="flex items-center gap-1 text-cold-muted">
            <span className="inline-block h-2 w-4" style={{ background: STRING_STROKE[c] }} />
            {c === "red" ? "Confirmed" : c === "gold" ? "Suspected" : "Unverified"}
          </span>
        ))}
      </div>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
        active ? "bg-cold-gold text-cold-black" : "text-cold-text hover:bg-cold-surface"
      }`}
    >
      {children}
    </button>
  );
}

function Minimap({
  items,
  view,
  viewportRef,
}: {
  items: TItem[];
  view: { x: number; y: number; scale: number };
  viewportRef: React.RefObject<HTMLDivElement>;
}) {
  const MM = 1 / 8;
  const rect = viewportRef.current?.getBoundingClientRect();
  const vpW = rect?.width ?? 800;
  const vpH = rect?.height ?? 600;
  // Viewport rectangle in board coords.
  const vx = -view.x / view.scale;
  const vy = -view.y / view.scale;
  const vw = vpW / view.scale;
  const vh = vpH / view.scale;

  return (
    <div
      className="absolute bottom-3 left-3 z-20 overflow-hidden border border-cold-border bg-cold-black/80"
      style={{ width: BOARD_WIDTH * MM, height: BOARD_HEIGHT * MM }}
    >
      {items.map((i) => (
        <span
          key={i.id}
          className="absolute bg-cold-gold/70"
          style={{ left: i.pos_x * MM, top: i.pos_y * MM, width: 14 * MM * 8 * 0.06, height: 3 }}
        />
      ))}
      <span
        className="absolute border border-cold-gold"
        style={{
          left: Math.max(0, vx * MM),
          top: Math.max(0, vy * MM),
          width: vw * MM,
          height: vh * MM,
        }}
      />
    </div>
  );
}
