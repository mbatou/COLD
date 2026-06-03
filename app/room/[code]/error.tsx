"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary for the Case Room. Surfaces the real error
 * message instead of Next's opaque production "client-side exception" screen.
 */
export default function RoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Case Room error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-cold-black px-5 text-center">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-cold-red" />
        <span className="font-display text-2xl tracking-[0.18em] text-cold-gold">
          COLD
        </span>
      </div>
      <p className="font-type text-lg text-cold-text">The case room hit a snag.</p>
      <p className="mt-3 max-w-md break-words font-mono text-xs text-cold-red">
        {error?.message || "Unknown client-side error."}
      </p>
      {error?.digest && (
        <p className="mt-1 font-mono text-[10px] text-cold-muted">
          digest: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="border border-cold-border px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-cold-text transition-colors hover:border-cold-gold"
        >
          Try again
        </button>
        <a
          href="/play"
          className="border border-cold-border px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-cold-text transition-colors hover:border-cold-gold"
        >
          Back to lobby
        </a>
      </div>
    </main>
  );
}
