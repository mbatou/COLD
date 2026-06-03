"use client";

import { useEffect } from "react";

/**
 * Top-level error boundary. Catches anything not handled by a nested
 * error.tsx and renders the real message on the page so production crashes
 * are diagnosable without opening the console.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          background: "#0f0e0c",
          color: "#f0e8d8",
          fontFamily: "monospace",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#e8c97a", letterSpacing: "0.18em", fontSize: 20 }}>
          • COLD
        </p>
        <p style={{ marginTop: 16, fontSize: 14 }}>Something broke.</p>
        <pre
          style={{
            marginTop: 12,
            maxWidth: 680,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#c0392b",
            fontSize: 13,
          }}
        >
          {error?.message || "Unknown client-side error."}
          {error?.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <button
          onClick={reset}
          style={{
            marginTop: 20,
            border: "1px solid #2a2620",
            background: "transparent",
            color: "#f0e8d8",
            padding: "10px 20px",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
