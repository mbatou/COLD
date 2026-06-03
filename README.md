# COLD — Cases Only Lead Deeper

The landing page for **COLD**, a multiplayer web investigation game where players
receive real case files and solve crimes together.

> Dark, cinematic, serious — like a real detective briefing room, not a game ad.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Framer Motion** for animations
- **Google Fonts** — Bebas Neue (display), Special Elite (typewriter), DM Sans (body)

All visual richness is built from typography, layout, and CSS-crafted document
elements — **no images required**.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Sections

1. **Navbar** — sticky, transparent on load, dark on scroll
2. **Hero** — full-viewport `C O / L D`, scattered-document texture, staggered letter entrance
3. **Tension ticker** — continuous CSS marquee
4. **How it works** — three steps + a redacted intake form (CSS only)
5. **Evidence preview** — a CSS "evidence desk" that staggers in on scroll
6. **Live stats** — four stat blocks with separators
7. **Case previews** — three case cards, featured Meridian Hotel
8. **Final CTA + footer**

## Design tokens

| Token        | Value     | Use                  |
| ------------ | --------- | -------------------- |
| `cold.bg`    | `#0f0e0c` | near-black base      |
| `cold.bg2`   | `#141210` | section shade        |
| `cold.text`  | `#f0e8d8` | warm off-white       |
| `cold.gold`  | `#e8c97a` | accent               |
| `cold.blood` | `#c0392b` | tension              |
| `cold.paper` | `#cabfa6` | document elements    |
