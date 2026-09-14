# BSC — The Complete Family Store · full project

A minimalist heritage-retail website for **BSC Exclusive, Davanagere (since 1938)** with a
3D scroll-driven hero (WebGL saree-wave ribbons, 2D fallback), the complete company profile,
all collections (women / men / kids / wedding / home & furnishings / brands / accessories),
store pages (10 AM – 10 PM, every day) — **plus a self-hosted, consent-first analytics
platform with an admin-only dashboard** (visitor counts, per-section dwell, clicks, calendar
drill-down, device data, emails, district/state locations, SQLite storage, CSV export).

The project is divided into **three functional folders**:

```
bsc-website/
├─ frontend/               everything the browser loads (site + admin dashboard)
│  ├─ index.html           the BSC site (17 tracked sections + consent gate)
│  ├─ terms.html           Terms & Privacy — email + location disclosure
│  ├─ admin/index.html     analytics dashboard (login, calendar, drill-down, roles)
│  ├─ css/styles.css       minimalist brand system (logo-derived palette)
│  ├─ js/{track,content,motion,hero3d,hero2d}.js
│  ├─ vendor/{three,gsap}/ locally vendored libs (offline-safe)
│  └─ assets/              your logo + transparent + favicon + collection imagery
├─ backend/                the only place logic & validation live (server-side)
│  ├─ server.js            Express: static hosting + collect API + admin API + roles
│  ├─ db.js                SQLite (node:sqlite built-in) schema + prepared statements
│  └─ content.js           collections / stores / leadership seed + queries
├─ database/               the data layer (see database/README.md)
│  ├─ schema.sql           full schema reference (analytics + content)
│  └─ data/                LIVE: bsc-analytics.db (SQLite WAL) + admin accounts
├─ docs/                   design & build prompts (website, 3D motion, video, imagery)
└─ scripts/                admin password / view-only account / content reseed
```

## Run it

```bash
cd bsc-website
npm install        # express only (SQLite is Node's built-in; three & gsap vendored)
npm start          # → http://localhost:3000
```

- **Site** → `/`
- **Admin dashboard** → `/admin` (first boot prints the default password in the console;
  default `bsc@Family2026` — change it: `npm run admin:pass -- "newpassword"`)
- **Legal** → `/terms`
- **Data** → `database/data/bsc-analytics.db` (SQLite, WAL)

## Roles on the dashboard

| Role | Login | Can do |
|---|---|---|
| **owner (super)** | `admin` + your password | view **all** analytics **and** CSV exports |
| **admin (view-only)** | any account from `npm run admin:view -- name pass` | view **all** analytics — **no** exports, no mutations (blocked server-side, not just hidden) |

```bash
npm run admin:pass -- "owner-password"        # rotate the owner password
npm run admin:view -- ravi "ravis-password"   # create a VIEW-ONLY staff account
npm run db:reseed                             # re-apply canonical collections/stores/leaders
```

## What the analytics does (privacy by default)

1. New visitor sees a **consent gate** (Terms & Privacy lists email + location collection).
   Declining collects nothing; the gate **re-prompts every 45 s** and via a floating pill
   until accepted — exactly as required.
2. On accept the session records: device type, OS, browser, screen/DPR, language, timezone,
   touch, IP, referrer, landing page.
3. Optional step: **email** via the browser's account picker (FedCM) or typed entry.
   Optional step: **live location** via `navigator.geolocation` — **district & state** only,
   resolved with the free BigDataCloud API (degrades to raw coords if offline).
4. Every **section view (with dwell seconds)**, **click** (`data-el` elements) and
   scroll-depth milestone is batched → `POST /api/events` → SQLite. The server refuses
   events from consentless sessions (403) — **enforcement is server-side**, like every
   validation in this project (sid format, email regex, clamps, rate limits).
5. Dashboard: KPIs, 30-day chart, **calendar with per-day drill-down** (sessions + hourly
   activity + event stream), sections table, top clicks, device/browser/OS, states/districts,
   emails, live feed, CSV exports (owner only).

Compliance note: aligns with India's DPDP Act 2023 basics — notice, consent, minimisation,
optional sensitive steps, export path for deletion requests. For production add HTTPS,
`Set-Cookie; Secure`, and your real addresses/phone numbers before launch.

## 3D “anime-action” motion

- `frontend/js/hero3d.js` — three.js twin **saree-wave ribbons** (red/navy shaders), scroll
  drives amplitude, twist, dolly; pointer parallax with damped follow-through; auto-falls
  back to `hero2d.js` canvas twin if WebGL/module loading fails.
- `frontend/js/motion.js` — GSAP+ScrollTrigger: line-mask headline rises, pinned horizontal
  heritage timeline, count-up wobble, 3D tilt cards with `back.out` overshoot, magnetic
  buttons, animated logo-wave canvas. All disabled under `prefers-reduced-motion`.
- Full design/animation prompts → `docs/BSC_WEBSITE_DESIGN_PROMPT.md`, architecture +
  feature prompt → `docs/PROJECT_PROMPT.md`.

## Security model (all server-side)

- scrypt-hashed admin accounts (`database/data/admins.json`), timing-safe compare,
  rate-limited login (12/min/IP), HttpOnly + SameSite=Strict session cookies,
  audit log of every login/export.
- Every write endpoint validates format + consent **on the server** and rate-limits per IP;
  nothing sensitive, no business logic, no secrets in the frontend.
- helmet-style headers, JSON body cap, static max-age, parameterised SQL only.
- Content is DB-driven (`collections` / `stores` / `leaders`) so future admin tooling can
  scale the catalogue without touching the frontend.

## Cautions

- Sample brand-wall names are placeholders → swap in real partner brands.
- Store addresses/phone numbers are descriptive, not exact — add real ones.
- Keep admin credentials out of git (`database/data/` is git-ignored).
