# BSC — The Complete Family Store
## Master Design & Build Prompt (with 3D Scroll-based “Anime-Action” Motion Spec)

> Paste-ready prompts for any AI builder (v0 / Lovable / Figma AI / Midjourney / Runway / Veo), plus the full
> specification used to build this project. Every section below reflects the real company profile supplied by
> the BSC owner (Davanagere flagship, since 1938).

---

## 0 · BRAND SNAPSHOT (give this to any AI first)

```
Brand: BSC — "BSC EXCLUSIVE — DAVANAGERE — SINCE 1938"
What: The Complete Family Store of Karnataka. 88 years old (est. 1938).
Root: Began as a village-to-village pushcart selling cloth; first store opened in Davanagere in 1938.
Today: Fashion & lifestyle destination — clothing (sarees, ethnic, casual, party, dress materials,
formals for men/women/kids), accessories (imitation jewellery, cosmetics, footwear, fashion
accessories), home & lifestyle (furnishings, seasonal/occasion essentials) + expert tailoring.
Stores: 3 — BSC Exclusive, Davanagere (50,000 sq ft, 300 staff, 3 floors, birthplace) ·
BSC Textile Mall, Belagavi (1,00,000 sq ft, 500 staff, largest textile showroom in
Karnataka/Maharashtra/Goa) · BSC Shivamogga (1,50,000 sq ft, 500 staff, newest chapter).
Totals: 3 showrooms · 3,00,000 sq ft retail · 1,300+ employees · 10,000+ daily footfall.
Timings: 10:00 AM – 10:00 PM, every day of the week.
Leadership: 3rd/4th/5th generations of the founding family —
Mr. Umapathy Bankapur (Founder & Director), Mr. Chandrashekar Bankapur (Managing Director),
Mr. Ved Bankapur (Director, 5th gen: brand building, CX, innovation).
Logo meaning: twin flowing curves above the name = saree folds (textile heritage) and waves of
generations building on one another. Red serif "BSC" wordmark + navy curves.
Colors sampled from the logo: BSC Red #CA2125 (deep #BF0908), BSC Navy #203A85 (deep #0B2C96),
paper #FAF8F4, ink #171B2C, accent gold #C77F2B, bridal maroon #8E1D26.
Voice: warm, plainspoken, generational trust. "Built on Trust Since 1938." Never loud, never slangy.
Legal: consent-based analytics only (DPDP Act 2023). Decline = zero data collected.
```

## 1 · MASTER WEBSITE PROMPT (full site, minimalism)

```
Design a complete, production-grade marketing website for BSC, "The Complete Family Store"
of Davanagere, Karnataka (est. 1938). Aesthetic: warm minimalism — ivory paper background
(#FAF8F4), huge editorial serif display type (Iowan/Palatino/Georgia), one red (#CA2125)
and one navy (#203A85) as the only brand accents, hairline rules (#E2DCD0), generous white
space, 18px card radii, no drop-shadows except soft hover lifts. Mobile-first, semantic
HTML, keyboard-accessible, prefers-reduced-motion honored.

Build these sections, in order, tracking each section id (see §4):
1. HERO — full-viewport, 3D scroll-driven "twin saree wave" ribbons (spec §2), oversized
   headline "The Complete Family Store", italic red emphasis on "Store", eyebrow mono line
   "EXCLUSIVE — DAVANAGERE · SINCE 1938", two pill CTAs (Explore Collections / Our story ↓),
   animated scroll cue.
2. MARQUEE — thin infinite ticker of categories (Sarees ◆ Ethnic ◆ Formals ◆ Wedding ◆ Kids ◆
   Home furnishings ◆ Cosmetics ◆ Footwear ◆ Jewellery ◆ Tailoring).
3. STATS BAND — 88 years · 3 cities · 3,00,000 sq ft · 1,300+ team · 10,000+ daily footfall,
   count-up on scroll with anime overshoot wobble.
4. HERITAGE TIMELINE — scroll-pinned horizontal rail of 5 cards (pushcart → 1938 first store →
   evolution → 3 cities → 5th generation). Middle card solid red, last card navy.
5. COLLECTIONS — asymmetric 6-column grid; tall cards for Women / Men / Kids, one full-width
   wide card for Wedding & Occasion, one for Home Furnishings; line-art SVG garment icons tinted
   by each card's accent; pointer-driven 3D tilt with back.out(2.4) spring-back.
6. BRAND PROPOSITION — full-bleed navy band, centered serif quote: "Make family shopping
   complete, convenient and joyful."
7. WEDDING FEATURE — maroon gradient art panel + checklist (bridal/groom silks, family sets,
   jewellery, gifting, bespoke tailoring) + CTA "Plan a store visit".
8. HOME & LIFESTYLE — 4 numbered tiles (linen, curtains, décor, essentials).
9. CURATED BRANDS — 6 category tiles (saree houses, menswear, kids, home textile mills,
   beauty, footwear) — replaceable brand-wall placeholders.
10. AISLES — 6 pill chips (jewellery, cosmetics, footwear, accessories, fabrics, tailoring).
11. BRAND IDENTITY — navy band; live 2D wave canvas echoing the logo's twin curves; copy:
    saree folds + waves of generations.
12. SERVICES — 4 tiles (tailoring, planned family shopping, gifting, assisted selection).
13. OUR STORES — 3 location cards (Davanagere flagship, Belagavi Textile Mall, Shivamogga) with
    sq ft, staff, highlight sentence, Google-Maps deep link; a timings badge "10:00 AM – 10:00
    PM, open every day" + totals strip.
14. COMPANY PROFILE — long-form serif narrative (pushcart story, 1938, growth, 5th gen) +
    4-column "Clothing / Accessories / Home & Lifestyle / Services" product matrix.
15. LEADERSHIP — 3 portrait-initial cards (UB/CB/VB monograms), middle one red-accented.
16. VISIT CTA — red gradient band with diagonal fabric weave texture.
17. FOOTER — inverted ink panel: transparent logo, three store lines, timings, sitemap,
    Terms & Privacy link, "© 1938–2026 — all generations reserved."
```

## 2 · 3D SCROLL-BASED “ANIME-ACTION” MOTION PROMPT

```
Build a scroll-driven WebGL hero for a heritage textile brand. Scene = three.js (r15x+),
alpha canvas behind the headline.

OBJECTS
· Two broad parametric ribbons (PlaneGeometry 16×2.6 & 15×2.1, 220×26 segments) — the logo's
  "twin flowing curves" as physical silk: upper ribbon navy (#182E6E→#3A5CC0), lower ribbon red
  (#B81B20→#E05A52); a third thin gold (#C77F2B) thread ribbon beneath.
· Custom ShaderMaterial: vertex wave = sin(u·3.4+t)·0.5 + sin(u·8.1−1.7t)·0.16 + sin(u·17+t·.6)·.05,
  windowed by sin(πu); z-fold = cos(u·5+.8t); twist = (u−.5)·θ·(1+scroll·2.2) rotated in YZ —
  DoubleSide, transparent, silky center-line highlight in fragment (pow(1−|uv.y−.5|·2, 6)).
· 260 dust "thread" points for depth, slow rotation.

SCROLL CHOREOGRAPHY (GSAP ScrollTrigger, scrub .9, damped in RAF at k=0.07 — this damping is
the "anime follow-through": the cloth arrives a beat late, then settles with overshoot)
· progress 0.00 → ribbons flat, framing the headline like a saree pallu opening.
· 0.00→0.45 → amplitude grows ×1.9, twist increases 2.2×, upper ribbon lifts +1.15y and −2.4z,
  lower slides −1.4x, both rotate apart (−0.22 / +0.16 rad) — the waves "unfold the story".
· 0.45→1.0 → camera dollies 9.2→6.6 z, drops −1.35 y; headline parallaxes up 120px & fades
  (1.35× rate) so the cloth never fights the type; letterspacing opens −.015→+.005em.
· Pointer parallax: camera x/y ±0.55, damped k=0.045. Pause rendering when tab hidden/hero offscreen.

ANIME-ACTION LANGUAGE (site-wide motion identity)
· Easings: snap cubic-bezier(.16,1.02,.28,1) for entrances; swoop cubic-bezier(.22,.9,.12,1)
  for reveals; elastic.out(1,.4) for magnetic buttons; back.out(2.4) for tilt spring-back.
· Line-mask rises: every display headline sits in overflow-hidden lines, translate 112%→0,
  second line delayed 140ms.
· Anticipation: cards lower 4px for 60ms before launching (scale 1→.98→1.02).
· Follow-through: counters end with ±1.2% sine wobble; wave canvas keeps micro-motion after scroll stops.
· Stagger 70–120ms between siblings; one big moment per screen, never two.
· Reduced-motion: all of the above collapses to opacity-only.
· Performance: DPR ≤1.75, single canvas, no post-processing; graceful 2D-canvas twin when WebGL
  unavailable (same wave math, layered strokes + blur shadow layer).
```

### 2b · Video / motion-tool prompt (Runway · Veo · Sora) for hero B-roll or campaign film

```
3D anime-cel-shaded cinematic shot: two enormous ribbons of silk — one indigo navy, one
vermilion red — flow weightlessly across an ivory void like the curves of a calligraphic logo.
Camera tracks along the silk as it twists into saree pleats; dust motes drift like loose
threads catching light. The ribbons slow-motion coil around an invisible mannequin and release
into the wordmark "BSC", deep serif letters in red with the twin navy curves above them, tiny
gold flourishes. Ink-wash background, warm film grain, 24fps cadence with anime smear frames
on fast folds, dramatic anticipation-then-snap motion. Vertical 9:16 + horizontal 16:9.
```

### 2c · Image-generation prompts (hero textures / collection imagery)

```
(a) HERO TEXTURE — "Minimal editorial still life: a single vermilion-red silk saree fold and one
indigo navy fold floating on warm ivory paper, long soft shadows, macro thread detail, no text,
16:9, muted luxury."
(b) WOMEN — "Flat-lay of a folded kanjivaram silk saree with gold zari border on ivory linen,
overhead, natural window light, catalogue minimalism."
(c) MEN — "Neatly folded navy formal shirt and charcoal suiting fabric on ivory, single red
pocket square accent, studio light, negative space right side."
(d) WEDDING — "Bridal maroon silk with temple zari border draped on a wooden mannequin in an
ivory room, brass lamp bokeh, warm, reverent, no faces."
(e) KIDS — "Small festive cotton kurta set, red and ivory, folded next to tiny leather sandals,
top-down on ivory linen, soft daylight."
(f) HOME — "Ivory and indigo bed linen stack with one red cushion, folded quilts, morning light
across a minimal room."
```

## 3 · ANALYTICS + ADMIN PROMPT (the “only-admin view” role)

```
Add a self-hosted, consent-gated analytics system to the site. No third-party trackers.

DATABASE (SQLite, WAL, file data/bsc-analytics.db)
· sessions(id uuid, created_at, last_seen, consent, consent_at, email, email_source,
  lat, lng, accuracy, geo_district, geo_city, geo_state, geo_country, ua, device_type,
  browser, browser_ver, os, os_ver, screen, dpr, lang, tz, touch, platform, online, ip,
  referrer, landing, pages)
· events(session_id, ts, date, type ∈ {pageview, section_view, click, scroll_depth, heartbeat},
  section, element, value (dwell seconds / %), meta)
· consent_log(session_id, ts, accepted, version, ip) · audit(ts, actor, action, meta)

CLIENT RULES (privacy = default)
1. First paint: if no stored consent → show a blocking gate with the exact data list.
   Accept → write session+consent; Decline → NOTHING is sent, and the gate re-appears
   periodically (45s) and via a floating pill until accepted. No cookies, no fingerprinting.
2. Email: step 2 of the gate, optional — browser account autofill (FedCM) with typed fallback,
   regex-validated; source ('browser'/'typed') recorded.
3. Live location: step 3, optional — navigator.geolocation (browser permission), then free
   keyless reverse geocode (BigDataCloud) → store only district/city/state/country + coords.
4. Section tracking: IntersectionObserver 22% visibility — on enter record t0, on exit emit
   section_view with dwell seconds. Delegation-capture every [data-el] click (nav, cards, CTAs).
   Scroll-depth milestones 25/50/75/100. 30s visibility heartbeat; flush every ≤12 events,
   on 4s scroll-idle, and sendBeacon on pagehide. Server refuses all events for
   consentless sessions (403) — enforcement is server-side, not just UI.

ADMIN DASHBOARD (cookie-auth, scrypt-hashed password, rate-limited login, /admin)
· KPIs: visitors (today/range), currently-live, pageviews, clicks, avg visit duration,
  emails in range/total, located visits, raw event rows.
· Calendar (month grid): bar = visitors/day, second bar = clicks; click any day → modal with
  hourly activity bars, per-session table (device, OS/browser, duration, pages, district/state,
  email) and the full timestamped event stream for that day.
· Sections tab: per-section views, unique people, total/avg dwell, clicks, share bar.
  Clicks table: top clicked elements with % of all clicks.
· People tab: device type, screen, browser, OS distributions; state & district tables.
· Emails tab: collected addresses with source + nearest city. Live tab: 30-min active
  sessions with last event label, auto-refresh 10s. CSV exports: sessions, events, emails,
  consent log. Roles: admin views everything; visitors never see analytics.
```

## 4 · TRACKING TAXONOMY (section ids used by this build)

```
hero · stats · heritage · collections (els: Women, Men, Kids, Wedding, Home) ·
brand-promise · wedding (bridal, family, jewellery, gifting, tailoring, book-visit) ·
home-lifestyle (linen, curtains, decor, essentials) · brands (6 wall tiles) ·
aisles (6 chips) · identity · services (tailoring, family-shopping, gifting, assist) ·
stores (davanagere, belagavi, shivamogga) · about · leadership (umapathy, chandrashekar, ved) ·
visit-cta (directions, collections) · footer · nav · consent-gate (accept/decline)
```

## 5 · ACCEPTANCE CHECKLIST

- [ ] Logo used verbatim in header/footer; palette derived from it (#CA2125/#203A85)
- [ ] All 17 sections present; store cards show **10 AM–10 PM, every day**
- [ ] Company profile, brand identity, proposition, leadership — word-faithful to the profile
- [ ] Declining consent ⇒ zero network calls except the decline log
- [ ] Every section view + click lands in SQLite and shows in dashboard + calendar
- [ ] Admin route rejects anonymous access (401); exports stream CSV
- [ ] prefers-reduced-motion, keyboard nav, no external requests except optional geocode
```
