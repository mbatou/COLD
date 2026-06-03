"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: (rot: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: rot,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function EvidencePreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="evidence"
      ref={ref}
      className="bg-cold-bg2 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Evidence desk */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          transition={{ staggerChildren: 0.15 }}
          className="relative mx-auto h-[420px] w-full max-w-md sm:h-[460px]"
        >
          {/* Sticky note */}
          <motion.div
            variants={item}
            custom={-7}
            className="absolute left-[6%] top-[8%] h-32 w-32 bg-cold-gold/90 p-3 shadow-xl"
          >
            <p className="font-type text-[13px] leading-snug text-cold-bg">
              who knew about the 2nd key?
            </p>
          </motion.div>

          {/* Torn newspaper headline */}
          <motion.div
            variants={item}
            custom={4}
            className="absolute right-[2%] top-[4%] w-52 bg-cold-paper/90 p-3 shadow-xl"
            style={{
              clipPath:
                "polygon(0 0, 100% 2%, 98% 100%, 4% 96%, 0 60%, 3% 30%)",
            }}
          >
            <p className="font-mono text-[8px] tracking-widest text-cold-bg/60">
              THE MERIDIAN HERALD
            </p>
            <p className="mt-1 font-display text-xl leading-none tracking-tight text-cold-bg">
              GUEST VANISHES FROM ROOM 1408
            </p>
            <p className="mt-1.5 text-[9px] leading-tight text-cold-bg/70">
              Hotel staff report no sign of forced entry. Police baffled.
            </p>
          </motion.div>

          {/* Blurred photo placeholder */}
          <motion.div
            variants={item}
            custom={-4}
            className="absolute bottom-[6%] left-[4%] h-44 w-36 bg-black/60 p-2 shadow-2xl ring-1 ring-white/10"
          >
            <div className="h-full w-full bg-cold-text/15 [filter:blur(3px)]">
              <div className="h-1/2 w-full bg-cold-text/10" />
              <div className="mt-6 ml-4 h-10 w-10 rounded-full bg-cold-text/20" />
            </div>
            <span className="absolute bottom-3 right-3 font-mono text-[8px] tracking-widest text-cold-text/50">
              EXHIBIT C
            </span>
          </motion.div>

          {/* Hand-drawn circle + arrow */}
          <motion.div
            variants={item}
            custom={9}
            className="absolute bottom-[14%] right-[8%] h-40 w-40"
          >
            <svg viewBox="0 0 160 160" className="h-full w-full">
              <ellipse
                cx="80"
                cy="78"
                rx="58"
                ry="46"
                fill="none"
                stroke="#c0392b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 0"
                transform="rotate(-8 80 78)"
                opacity="0.85"
              />
              <path
                d="M150 14 C120 30, 110 40, 118 60"
                fill="none"
                stroke="#c0392b"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M118 60 L110 48 M118 60 L131 56"
                fill="none"
                stroke="#c0392b"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Copy */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-type text-3xl leading-tight text-cold-text sm:text-4xl"
          >
            You won&apos;t find game menus here.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-lg text-base leading-relaxed text-cold-text/60"
          >
            Every case ships as a real file dump. PDFs with redactions. Audio
            with background noise. Websites of suspects. Encrypted folders that
            need a password you haven&apos;t found yet. Investigation is the
            interface.
          </motion.p>
          <motion.a
            href="#cases"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 inline-block font-type text-base text-cold-gold transition-opacity hover:opacity-75"
          >
            See a sample case file →
          </motion.a>
        </div>
      </div>
    </section>
  );
}
