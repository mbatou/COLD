import { suspects } from "./suspects";

export type FileType = "doc" | "image" | "data" | "encrypted";

export interface CaseFile {
  id: string;
  name: string;
  /** Short tag shown next to the file row. */
  tag: string;
  type: FileType;
  /** Lucide icon name resolved in the sidebar. */
  icon: "FileText" | "Image" | "Phone" | "Lock";
  phase: number;
  /** Which document component to render in the File Viewer. */
  viewer: "autopsy" | "callLog" | "roomPhoto" | "locked";
}

export interface PrivateClue {
  label: string;
  text: string;
}

export interface CaseMeta {
  id: string;
  number: string;
  name: string;
  genre: string;
  difficulty: "EASY" | "MED" | "HARD";
  estimatedTime: string;
  durationMinutes: number;
  phases: number;
  correctSuspectId: string;
  debrief: string;
  files: CaseFile[];
  /** Private clues distributed round-robin to players by join order. */
  privateClues: PrivateClue[];
}

export const CASE_0044: CaseMeta = {
  id: "0044",
  number: "#0044",
  name: "The Meridian Hotel",
  genre: "NOIR",
  difficulty: "HARD",
  estimatedTime: "~90 min",
  durationMinutes: 90,
  phases: 3,
  correctSuspectId: "victor-harmon",
  debrief:
    "The victim came to The Meridian to meet someone he feared. Victor Harmon, the bartender, saw the woman from the keycard log enter the corridor at 00:31 and said nothing — protecting a generous regular. That silence let her reach Room 304 unseen. Harmon didn't kill the guest, but he buried the one detail that pointed to who did. The truth was never on the autopsy table. It was behind the bar.",
  files: [
    {
      id: "autopsy",
      name: "Autopsy Report",
      tag: "PDF",
      type: "doc",
      icon: "FileText",
      phase: 1,
      viewer: "autopsy",
    },
    {
      id: "room-photo",
      name: "Room 304 Photo",
      tag: "IMG",
      type: "image",
      icon: "Image",
      phase: 1,
      viewer: "roomPhoto",
    },
    {
      id: "call-log",
      name: "Call Log — V. Harmon",
      tag: "DATA",
      type: "data",
      icon: "Phone",
      phase: 1,
      viewer: "callLog",
    },
    {
      id: "encrypted-folder",
      name: "Encrypted Folder",
      tag: "LOCKED",
      type: "encrypted",
      icon: "Lock",
      phase: 2,
      viewer: "locked",
    },
    {
      id: "security-footage",
      name: "Security Footage",
      tag: "LOCKED",
      type: "encrypted",
      icon: "Lock",
      phase: 2,
      viewer: "locked",
    },
  ],
  privateClues: [
    {
      label: "Physical evidence — your eyes only",
      text: "Matchbook from Club Sablier, found in victim's jacket pocket.",
    },
    {
      label: "System record — your eyes only",
      text: "Hotel keycard log: Room 304 accessed at 00:31h by a card not assigned to the victim.",
    },
  ],
};

export { suspects };

export function getCase(caseId: string): CaseMeta {
  // v1 ships a single hardcoded case.
  return CASE_0044;
}
