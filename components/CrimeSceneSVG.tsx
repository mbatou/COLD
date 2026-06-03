/**
 * A CSS/SVG noir crime-scene illustration of Room 304 — flat shapes, no
 * gradients, period detective-photo feel. Used in the file viewer and (faintly)
 * as evidence on the board/landing so "photo" elements read as real images.
 */
export default function CrimeSceneSVG({
  className,
  blur = false,
}: {
  className?: string;
  blur?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      style={blur ? { filter: "blur(2px)" } : undefined}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Crime scene photograph of a hotel room"
    >
      {/* Wall + floor */}
      <rect x="0" y="0" width="400" height="300" fill="#211d16" />
      <rect x="0" y="180" width="400" height="120" fill="#1a160f" />
      <line x1="0" y1="180" x2="400" y2="180" stroke="#2f291e" strokeWidth="2" />

      {/* Window with blinds */}
      <rect x="36" y="40" width="96" height="96" fill="#13110b" stroke="#39301f" strokeWidth="3" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1="39"
          y1={50 + i * 12}
          x2="129"
          y2={50 + i * 12}
          stroke="#2c2517"
          strokeWidth="3"
        />
      ))}

      {/* Bed */}
      <rect x="232" y="120" width="140" height="70" fill="#2a2418" stroke="#3a3120" strokeWidth="2" />
      <rect x="240" y="110" width="124" height="20" fill="#cabfa6" opacity="0.65" />
      <rect x="246" y="112" width="40" height="14" fill="#e6ddc8" opacity="0.7" />

      {/* Nightstand + lamp glow (flat, no gradient) */}
      <rect x="196" y="150" width="34" height="40" fill="#221d13" stroke="#39301f" strokeWidth="2" />
      <circle cx="213" cy="150" r="30" fill="#e8c97a" opacity="0.08" />
      <circle cx="213" cy="150" r="16" fill="#e8c97a" opacity="0.10" />
      <rect x="208" y="138" width="10" height="14" fill="#3a3120" />

      {/* Chalk body outline on the floor */}
      <g stroke="#d9d2c2" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="222" r="13" />
        <path d="M120 235 L116 270 M120 235 L132 268" />
        <path d="M118 244 L92 252 M122 244 L150 240" />
      </g>

      {/* Evidence markers (numbered tents) */}
      <EvidenceMarker x={150} y={236} n="1" />
      <EvidenceMarker x={205} y={196} n="2" />
      <EvidenceMarker x={300} y={205} n="3" />

      {/* Faint vignette via flat corner rects */}
      <rect x="0" y="0" width="400" height="300" fill="#000000" opacity="0.12" />
    </svg>
  );
}

function EvidenceMarker({ x, y, n }: { x: number; y: number; n: string }) {
  return (
    <g>
      <polygon
        points={`${x},${y - 14} ${x - 10},${y + 6} ${x + 10},${y + 6}`}
        fill="#c0392b"
        stroke="#7a1f15"
        strokeWidth="1.5"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize="9"
        fontFamily="monospace"
        fill="#f4f0e4"
        fontWeight="bold"
      >
        {n}
      </text>
    </g>
  );
}
