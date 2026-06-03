# COLD — Cases Only Lead Deeper

**COLD** is a multiplayer web investigation game where 2–6 players receive real
case files and solve crimes together. This repo contains the marketing landing
page **and** the Case Room — the live, realtime gameplay screen.

> Dark, cinematic, serious — like a real detective briefing room, not a game ad.

## Stack

- **Next.js 14** (App Router)
- **Supabase** — anonymous auth, Postgres, Realtime
- **Anthropic Claude** (`claude-sonnet-4-20250514`) for AI suspect interviews
- **Tailwind CSS** + custom CSS for the board canvas
- **Framer Motion** for animations
- **Lucide React** icons
- **Google Fonts** — Bebas Neue · Special Elite · DM Sans · Courier Prime

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + Anthropic keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend setup

1. Create a Supabase project and run the migration in
   `supabase/migrations/001_cold_schema.sql` (SQL editor or `supabase db push`).
   It creates every table, RLS policy, and Realtime publication.
2. Enable **Anonymous sign-ins** in Supabase Auth settings.
3. Populate `.env.local` with the Supabase URL, anon key, service-role key, and
   `ANTHROPIC_API_KEY` (server-side only — never exposed to the client).

## Gameplay routes

| Route          | Purpose                                                        |
| -------------- | ------------------------------------------------------------- |
| `/`            | Landing page                                                  |
| `/play`        | Anonymous auth · create or join a room (8-char code)          |
| `/room/[code]` | Waiting lobby (status `waiting`) **or** the Case Room (`active`) |

### Case Room

- **Topbar** — case title, phase badge, 90-minute countdown (pulses red under 10 min), player avatars.
- **Left sidebar** — evidence files (phase-locked), plus a private clue visible only to you (RLS-enforced).
- **Main canvas** — switches between three views:
  - **Board** — pannable/zoomable 2000×1500 cork board with draggable notes, suspect cards, docs, newspaper, photo and map items, colored string connections, a minimap, and live remote cursors. All moves sync via Supabase Realtime.
  - **Files** — documents rendered as React components (autopsy report, terminal call log, room polaroid) with a native Tamtam ad slot.
  - **Interview** — chat-based AI interrogation of suspects via `/api/interview`.
- **Right sidebar** — suspects panel, theory submission box, and realtime team chat.
- **Resolution** — cinematic full-screen reveal with a typed-out verdict and case debrief.

The single shipped case is **#0044 — The Meridian Hotel** (`data/cases/0044`).
Seed default board items with `npm run seed -- <ROOM_ID>` (also done automatically
at room creation).

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
