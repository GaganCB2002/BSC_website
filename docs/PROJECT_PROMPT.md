# BSC — Full Project Prompt (architecture + features + 3D scroll “anime-action”)

> This is the complete, paste-ready master prompt for the BSC website as actually built.
> The deep creative specs it references live in `docs/BSC_WEBSITE_DESIGN_PROMPT.md`
> (section-by-section design, 3D shader math, motion language, video/image prompts).

---

## 0 · ONE-PARAGRAPH BRIEF

Build a **full-stack, three-folder project** — `frontend/`, `backend/`, `database/` — for
**BSC, The Complete Family Store of Karnataka (est. 1938, Davanagere · Belagavi ·
Shivamogga)**. Warm-minimalist single-page site with a **3D scroll-driven WebGL hero**
(twin saree-wave silk ribbons) and anime-action motion (GSAP ScrollTrigger, line-mask
reveals, pinned heritage timeline, tilt cards), the complete company profile (story, brand
identity, proposition, products & services, 3 stores with **10 AM – 10 PM daily** timings,
leadership of the 3rd/4th/5th generation), **all collections** (women, men, kids, wedding &
bridal, home furnishings, dress materials, jewellery, cosmetics, footwear, accessories,
curated brands, tailoring) — plus a **self-hosted, consent-gated visitor-analytics platform**
with a **role-based admin dashboard**: owner (full control incl. CSV exports) and a
view-only **admin** role. Every action and validation happens **server-side only**; the
frontend holds no secrets, no logic worth stealing.

## 1 · FOLDER STRUCTURE (functional, scale-ready)

```
frontend/   index.html · terms.html · admin/index.html · css/styles.css
            js/{track,content,motion,hero3d,hero2d}.js · vendor/{three,gsap} · assets/
backend/    server.js (Express API + static) · db.js (SQLite) · content.js (catalogue seed)
database/   schema.sql · README.md · data/{bsc-analytics.db, admin.json, admins.json}
docs/       BSC_WEBSITE_DESIGN_PROMPT.md · PROJECT_PROMPT.md
scripts/    set-admin-password.js · admin-account.js
```

Scaling rule: content tables (`collections`, `stores`, `leaders`) are read by the frontend
through `GET /api/content/*`, so future admin tooling (or a headless CMS) can edit the
catalogue without touching frontend code; swapping SQLite for MySQL/Postgres later means
porting one file (`backend/db.js`).

## 2 · WEBSITE (17 tracked sections, warm minimalism)

Ivory paper `#FAF8F4`, editorial serif display type, BSC Red `#CA2125` + Navy `#203A85`
only, hairline rules, generous whitespace, `prefers-reduced-motion` honored.
Order: **HERO** (3D ribbons, “The Complete Family Store”) → **marquee** of categories →
**stats band** (88 years · 3 cities · 3,00,000 sq ft · 1,300+ team · 10,000+ daily footfall)
→ **pinned horizontal heritage timeline** (pushcart → 1938 → evolution → 3 cities → 5th
generation) → **collections grid** (Women / Men / Kids / Wedding wide-card / Home, line-art
SVG garments, 3D tilt) → **DB-driven full directory** (every aisle) → **brand proposition**
navy quote band → **wedding feature** (bridal wing checklist) → **home & lifestyle** tiles →
**curated brands** wall → **aisles** chips → **brand identity** (twin-curve wave canvas +
“meaning behind the mark”) → **services** (tailoring, planned family shopping, gifting,
assisted selection) → **stores** (3 cards: Davanagere 50,000 sq ft · 300 staff · birthplace;
Belagavi 1,00,000 sq ft · 500 staff · largest in KA/MH/GOA; Shivamogga 1,50,000 sq ft · 500
staff · new chapter; **10:00 AM – 10:00 PM every day** + totals strip) → **company profile**
(word-faithful narrative + Clothing/Accessories/Home/Services matrix) → **leadership**
(Umapathy · Chandrashekar · Ved Bankapur) → **visit CTA** → **footer**.

## 3 · 3D SCROLL “ANIME-ACTION” HERO (summary — full spec in the design doc)

three.js, alpha canvas behind the headline. Two parametric silk ribbons (navy + red, custom
ShaderMaterial: sin-wave vertex displacement ×3 octaves, z-fold, scroll-driven twist,
silky center highlight) + a thin gold thread + 260 dust points. GSAP ScrollTrigger scrub
(.9) with **damped RAF follow-through (k = 0.07)** so the cloth arrives a beat late and
settles with overshoot — the “anime” feel: ribbons unfold like a saree pallu as amplitude
×1.9 and twist ×2.2 over the first 45% of scroll, then the camera dollies 9.2→6.6 while the
headline parallaxes up and fades. Pointer parallax ±0.55 (k = 0.045). DPR ≤ 1.75, pause
when hidden/offscreen, automatic 2D-canvas fallback. Site-wide motion identity: line-mask
headline rises (112% → 0, +140 ms stagger), anticipation (cards dip 4 px before launch),
`back.out(2.4)` tilt spring-back, magnetic buttons `elastic.out(1,.4)`, counter ±1.2% wobble.

## 4 · CONSENT-GATED ANALYTICS (the “who visited us” system)

**Gate (blocking, first paint):** discloses exactly what is collected — device & browser,
interactions per section, optional **email**, optional **live location (district & state
only)** — linking `/terms`. **Accept** → proceed (+ optional email step with FedCM browser
autofill, optional geolocation step with the browser’s own permission dialog → reverse
geocoded to district/state). **Decline** → zero collection, gate **re-prompts every 45 s**
and via floating pill until accepted. Consent versioned, every decision logged with IP.

**Collected per session (server-validated):** UUID sid; device type / OS / browser(+ver) /
screen / DPR / language / timezone / touch / platform; IP; referrer; landing page; email
(+source); lat/lng/accuracy + district/city/state/country. **Events:** pageview,
section_view (IntersectionObserver 22% + dwell seconds), click (`data-el` delegation),
scroll-depth 25/50/75/100, 30 s heartbeat; batched ≤12, flushed on scroll-idle 4 s,
`sendBeacon` on pagehide. Server refuses all events without consent (403) and rate-limits
writes per IP — **validation lives only in the backend**.

## 5 · ADMIN DASHBOARD + ROLES (`/admin`)

Cookie session (HttpOnly, SameSite=Strict, 12 h), scrypt-hashed accounts, timing-safe
compare, login rate-limit 12/min/IP, audit log. **KPIs** (visitors today/range, currently
live, pageviews, clicks, avg visit, emails, located visits, events stored) · **30-day
chart** · **calendar month grid** (visitors + clicks per day; any day drills into hourly
activity, per-session table — device, OS/browser, duration, district/state, email — and the
timestamped event stream) · **sections & clicks** tables (views, unique people, total/avg
dwell, % of clicks) · **devices & locations** (device/screen/browser/OS, states, districts)
· **emails** table · **live feed** (10 s auto-refresh) · **CSV exports** (sessions, events,
emails, consent log).

Roles: **super / owner** = everything above incl. exports (server-enforced 403 for others);
**admin / view-only** = all analytics, **no** exports or mutations. Create view-only staff:
`npm run admin:view -- <user> <pass>`.

## 6 · SECURITY CHECKLIST (non-negotiable)

- Every validation, permission check and rate limit **server-side**; frontend holds no
  secrets and cannot bypass anything.
- Parameterised SQL only; JSON body cap 256 kb; nosniff / frame / referrer headers;
  no `x-powered-by`.
- Consentless sessions rejected (403) at the API, not just hidden in the UI.
- scrypt + timing-safe + rate-limit + HttpOnly/SameSite cookies + audit trail.
- Optional data (email, location) stays optional and twice-consented; store district/state,
  never a movement trail.

## 7 · ACCEPTANCE CHECKLIST

- [ ] Three-folder layout (frontend / backend / database), runs with `npm install && npm start`
- [ ] All 17 sections + DB-driven directory; store cards show **10 AM–10 PM, every day**
- [ ] 3D scroll hero with 2D fallback; reduced-motion respected
- [ ] Consent gate blocks + re-prompts until accepted; decline = zero collection
- [ ] Email + live location (district/state) stored only after opt-in, visible in dashboard
- [ ] Calendar day-drill-down shows sessions, hourly bars, full event stream
- [ ] View-only admin sees everything but cannot export (server 403)
- [ ] All catalogue content reachable from the database via `/api/content/*`
