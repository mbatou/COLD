"use client";

import { memo } from "react";
import type { BoardItem, BoardString } from "@/lib/types";
import { BOARD_WIDTH, BOARD_HEIGHT, sizeFor, STRING_STROKE } from "./boardConfig";

function StringLayer({
  items,
  strings,
  onContextMenu,
}: {
  items: BoardItem[];
  strings: BoardString[];
  onContextMenu: (stringId: string, x: number, y: number) => void;
}) {
  const byId = new Map(items.map((i) => [i.id, i]));

  function center(item: BoardItem) {
    const { w, h } = sizeFor(item.type);
    return { x: item.pos_x + w / 2, y: item.pos_y + h / 2 };
  }

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      style={{ zIndex: 5 }}
    >
      {strings.map((s) => {
        const from = byId.get(s.from_item_id);
        const to = byId.get(s.to_item_id);
        if (!from || !to) return null;
        const a = center(from);
        const b = center(to);
        const dashed = s.color !== "red";
        return (
          <g key={s.id}>
            {/* Invisible fat hit-area for right-click */}
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="transparent"
              strokeWidth={14}
              style={{ pointerEvents: "stroke", cursor: "context-menu" }}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu(s.id, e.clientX, e.clientY);
              }}
            />
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={STRING_STROKE[s.color]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={dashed ? "7 6" : undefined}
              opacity={0.9}
            />
            {/* Pins at each end */}
            <circle cx={a.x} cy={a.y} r={4} fill={STRING_STROKE[s.color]} />
            <circle cx={b.x} cy={b.y} r={4} fill={STRING_STROKE[s.color]} />
          </g>
        );
      })}
    </svg>
  );
}

export default memo(StringLayer);
