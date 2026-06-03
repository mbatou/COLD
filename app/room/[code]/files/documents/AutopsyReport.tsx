"use client";

import AdSlot from "./AdSlot";

function Redact({ w = "w-32" }: { w?: string }) {
  return <span className={`inline-block h-3 ${w} translate-y-0.5 bg-cold-ink`} />;
}

export default function AutopsyReport() {
  return (
    <div className="mx-auto max-w-2xl bg-cold-paper p-8 font-courier text-cold-ink shadow-2xl sm:p-10">
      {/* Stamp */}
      <div className="pointer-events-none absolute right-10 top-10 hidden rotate-[-12deg] border-2 border-cold-red px-3 py-1 sm:block">
        <span className="font-display text-2xl tracking-widest text-cold-red opacity-80">
          CONFIDENTIAL
        </span>
      </div>

      <header className="border-b-2 border-cold-ink/40 pb-3 text-center">
        <h1 className="font-display text-2xl tracking-wide text-cold-ink">
          Metropolitan Forensics Division
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.2em]">
          Post-Mortem Examination Report
        </p>
        <p className="mt-1 text-[11px] text-cold-ink/60">
          Case Ref. MFD/0044 · Page 1 of 4
        </p>
      </header>

      <dl className="mt-5 space-y-2 text-[13px]">
        <Row label="Deceased"><Redact w="w-40" /></Row>
        <Row label="Date of examination">14 OCT, 06:30h</Row>
        <Row label="Cause of death">
          <Redact w="w-24" /> — pending toxicology
        </Row>
        <Row label="Estimated TOD">01:40h – 02:00h</Row>
        <Row label="Toxicology">RESULTS PENDING (TOX-44)</Row>
      </dl>

      <AdSlot />

      <section className="mt-3 space-y-3 text-[12.5px] leading-relaxed">
        <p>
          The deceased, an adult male, was discovered in Room 304 of The Meridian
          Hotel at approximately 02:15h. External examination revealed no defensive
          wounds to the hands or forearms. A single contusion was noted to the
          posterior cranium, consistent with a fall or a blunt impact against a
          fixed edge.
        </p>
        <p>
          Lividity and core temperature place time of death between 01:40h and
          02:00h. No signs of forced restraint. A trace quantity of an unidentified
          compound was recovered from the glassware at the scene; analysis is{" "}
          <Redact w="w-16" /> at the time of writing.
        </p>
        <p className="text-[11px] text-cold-ink/60">
          Examiner signature on file. Distribution restricted to assigned
          investigators.
        </p>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-44 shrink-0 uppercase tracking-wide text-cold-ink/70">
        {label}
      </dt>
      <dd className="flex-1">{children}</dd>
    </div>
  );
}
