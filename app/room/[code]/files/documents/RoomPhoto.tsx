"use client";

import CrimeSceneSVG from "@/components/CrimeSceneSVG";

export default function RoomPhoto() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="bg-white p-3 pb-12 shadow-2xl">
        {/* Photo */}
        <div className="relative h-80 overflow-hidden bg-[#1a160f]">
          <CrimeSceneSVG className="h-full w-full" />
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
