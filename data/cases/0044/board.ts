import type { BoardItemType } from "@/lib/types";

export interface SeedBoardItem {
  type: BoardItemType;
  content: Record<string, unknown>;
  pos_x: number;
  pos_y: number;
  rotation: number;
}

/**
 * Default board layout for Case #0044 — placed at sensible starting positions
 * on the 2000x1500 board. Inserted when a new room for this case is created.
 */
export const defaultBoardItems: SeedBoardItem[] = [
  {
    type: "doc",
    content: {
      ref: "CASE #0044",
      title: "Post-Mortem Summary",
      rows: ["DECEASED: ████████", "TOD: ~01:50h", "CAUSE: ████ trauma"],
      redactions: 2,
    },
    pos_x: 760,
    pos_y: 420,
    rotation: -3,
  },
  {
    type: "suspect",
    content: {
      suspectId: "victor-harmon",
      name: "Victor Harmon",
      role: "Bartender",
      flagged: false,
    },
    pos_x: 1080,
    pos_y: 340,
    rotation: 2,
  },
  {
    type: "suspect",
    content: {
      suspectId: "dana-acheampong",
      name: "Dana Acheampong",
      role: "Hotel Manager",
      flagged: false,
    },
    pos_x: 1100,
    pos_y: 640,
    rotation: -2,
  },
  {
    type: "newspaper",
    content: {
      masthead: "THE MERIDIAN HERALD",
      headline: "GUEST FOUND DEAD IN ROOM 304",
      body: "Hotel staff report no sign of forced entry. Police have not named a suspect. Management declined to comment on the late-night check-in.",
    },
    pos_x: 720,
    pos_y: 760,
    rotation: 3,
  },
  {
    type: "map",
    content: {
      label: "The Meridian — 3rd Floor",
      marker: "Room 304",
    },
    pos_x: 1360,
    pos_y: 480,
    rotation: -1,
  },
];

/** Build insertable rows for a given room. */
export function seedRowsForRoom(roomId: string) {
  return defaultBoardItems.map((item) => ({
    room_id: roomId,
    type: item.type,
    content: item.content,
    pos_x: item.pos_x,
    pos_y: item.pos_y,
    rotation: item.rotation,
    created_by: null,
  }));
}
