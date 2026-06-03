"use client";

import { useMemo } from "react";
import { pickAd } from "@/data/ads";

/**
 * Native in-document ad — styled as a period newspaper advertisement.
 * This is the Tamtam integration hook; the ad config is swapped for a
 * dynamic console fetch in production.
 */
export default function AdSlot() {
  const ad = useMemo(() => pickAd(), []);
  return (
    <div className="my-4 border border-cold-ink/25 bg-[#ece6d4] p-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[11px] font-bold text-cold-black"
          style={{ background: ad.logo_color }}
        >
          {ad.logo_text}
        </span>
        <div className="min-w-0">
          <p className="font-courier text-[11px] font-bold text-cold-ink">
            {ad.brand}
          </p>
          <p className="font-courier text-[10px] leading-tight text-cold-ink/75">
            {ad.copy}
          </p>
        </div>
      </div>
      <p className="mt-1 text-right text-[8px] uppercase tracking-widest text-cold-ink/45">
        {ad.tag}
      </p>
    </div>
  );
}
