import type { BoardItemType, StringColor } from "@/lib/types";

export const BOARD_WIDTH = 2000;
export const BOARD_HEIGHT = 1500;

/** Approximate render size per item type — used to compute string anchor centers. */
export function sizeFor(type: BoardItemType): { w: number; h: number } {
  switch (type) {
    case "note":
      return { w: 140, h: 100 };
    case "suspect":
      return { w: 160, h: 100 };
    case "doc":
      return { w: 160, h: 180 };
    case "newspaper":
      return { w: 180, h: 160 };
    case "photo":
      return { w: 160, h: 190 };
    case "map":
      return { w: 160, h: 140 };
    default:
      return { w: 150, h: 120 };
  }
}

export const STRING_STROKE: Record<StringColor, string> = {
  red: "#c0392b",
  gold: "#e8c97a",
  blue: "#6a9fb5",
};

export const STRING_CYCLE: StringColor[] = ["red", "gold", "blue"];
