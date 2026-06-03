"use client";

import { Camera } from "lucide-react";

export default function RoomPhoto() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="bg-white p-3 pb-12 shadow-2xl">
        {/* Photo */}
        <div
          className="relative flex h-80 items-center justify-center bg-[#2a2418]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(122,110,90,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(122,110,90,0.18) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        >
          <Camera size={40} className="text-cold-muted/40" />
          {/* faint room layout suggestion */}
          <div className="absolute inset-8 border border-cold-muted/20" />
          <div className="absolute bottom-12 left-12 h-16 w-24 border border-cold-muted/25" />
        </div>
        <p className="mt-4 text-center font-type text-sm text-cold-ink">
          Rm 304 — discovered 02:15h
        </p>
      </div>

      {/* Metadata strip */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 border border-cold-border bg-cold-dark px-3 py-2 font-courier text-[10px] text-cold-muted">
        <span>CAM: Ricoh GR III</span>
        <span>TS: 14-OCT 02:17:44</span>
        <span>FLASH: YES</span>
        <span>EXHIBIT: A-1</span>
      </div>
    </div>
  );
}
