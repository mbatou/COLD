"use client";

import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "You receive the case files",
    body: "Autopsy reports. Intercepted messages. Blurry photographs. A matchbook from a bar no one remembers.",
  },
  {
    n: "02",
    title: "You divide the evidence",
    body: "Some clues are yours alone. Some are your partner's. The only way to solve it is to talk.",
  },
  {
    n: "03",
    title: "You find the truth — or you don't",
    body: "Submit your theory before time runs out. Wrong guesses cost you. The clock doesn't stop.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <h2 className="font-display text-4xl tracking-[0.06em] text-cold-text sm:text-5xl">
          How an investigation works
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12} className="flex flex-col">
            <span className="font-display text-7xl leading-none text-cold-gold/35 sm:text-8xl">
              {s.n}
            </span>
            <h3 className="mt-4 font-type text-xl text-cold-text">{s.title}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cold-text/55">
              {s.body}
            </p>
          </Reveal>
        ))}
      </div>

      {/* Faded redacted police form — CSS only */}
      <Reveal delay={0.2} className="mt-20 flex justify-center md:justify-end">
        <div className="w-full max-w-sm rotate-[-3deg] border border-cold-paperdark/25 bg-cold-paper/[0.04] p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-cold-paperdark/30 pb-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-cold-text/45">
              FORM 27-B / INTAKE
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-cold-blood/70">
              CONFIDENTIAL
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <FormRow label="SUBJECT" redacted="w-32" />
            <FormRow label="LOCATION" redacted="w-44" />
            <FormRow label="TIME OF EVENT" redacted="w-20" />
            <FormRow label="OFFICER" redacted="w-36" />
            <div className="pt-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-cold-text/40">
                NOTES
              </span>
              <div className="mt-1.5 space-y-1.5">
                <div className="h-2 w-full rounded-sm bg-cold-text/10" />
                <div className="h-2 w-5/6 rounded-sm bg-cold-text/10" />
                <div className="h-2 w-2/3 rounded-sm bg-cold-blood/20" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FormRow({ label, redacted }: { label: string; redacted: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 font-mono text-[9px] tracking-[0.18em] text-cold-text/40">
        {label}
      </span>
      <span className={`h-3 ${redacted} bg-black/70`} />
    </div>
  );
}
