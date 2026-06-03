export type RoomStatus = "waiting" | "active" | "resolved";

export interface Room {
  id: string;
  code: string;
  case_id: string;
  host_id: string | null;
  status: RoomStatus;
  phase: number;
  started_at: string | null;
  created_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  role: string;
  private_clue: { label: string; text: string } | null;
  joined_at: string;
}

export type BoardItemType =
  | "note"
  | "photo"
  | "doc"
  | "newspaper"
  | "suspect"
  | "map";

export interface BoardItem {
  id: string;
  room_id: string;
  type: BoardItemType;
  content: Record<string, unknown>;
  pos_x: number;
  pos_y: number;
  rotation: number;
  created_by: string | null;
  created_at: string;
}

export type StringColor = "red" | "gold" | "blue";

export interface BoardString {
  id: string;
  room_id: string;
  from_item_id: string;
  to_item_id: string;
  color: StringColor;
  created_by: string | null;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  content: string;
  is_private: boolean;
  created_at: string;
}

export interface InterviewMessage {
  id: string;
  room_id: string;
  suspect_id: string;
  role: "user" | "suspect";
  content: string;
  asked_by: string | null;
  created_at: string;
}

export interface Theory {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  suspect_id: string;
  reasoning: string;
  is_correct: boolean;
  created_at: string;
}
