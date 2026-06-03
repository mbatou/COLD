const items = [
  "14,280 INVESTIGATORS ONLINE",
  "3 CASES SOLVED IN THE LAST HOUR",
  "YOUR PARTNER IS WAITING",
  "THE CLOCK IS RUNNING",
  "EVIDENCE EXPIRES IN 47:22",
  "JOIN THE INVESTIGATION",
];

export default function TensionTicker() {
  // Duplicate the run so the -50% translate loops seamlessly.
  const run = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-black py-2.5">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {run.map((item, i) => (
          <span
            key={i}
            className="flex items-center font-display text-sm tracking-[0.22em] text-cold-gold/90"
          >
            {item}
            <span className="mx-5 text-cold-gold/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
