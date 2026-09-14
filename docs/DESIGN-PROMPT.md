# 🎬 BSC — 3D Scroll-Based “Anime-Action” Website · Master Design Prompt

*(Everything below is already implemented in this repo. This file is the prompt you can reuse with any
AI designer / builder — v0, Lovable, Figma AI, Runway, Midjourney — to re-express or extend the site.)*

---

## PROMPT 1 — Full website prompt (paste into any AI builder)

> Design the complete website for **BSC — "The Complete Family Store", Davanagere, Karnataka — established 1938**.
>
> **Brand & soul.** BSC began as a pushcart travelling village to village; in 1938 the first store opened in
> Davanagere. 88 years later it is a fashion & lifestyle destination in 3 cities with 3,00,000 sq ft retail,
> 1,300+ employees and 10,000+ daily customers, still led by the founding family (3rd, 4th and 5th generation).
> Voice: warm, plainspoken, generational trust — "Built on Trust Since 1938". Never loud, never slangy.
>
> **Design language — WARM MINIMALISM.** Ivory paper background `#FAF8F4`; ink `#171B2C`; exactly two accents —
> BSC Red `#CA2125` (deep `#BF0908`) and BSC Navy `#203A85` (deep `#0B2C96`) — both sampled from the real logo;
> one gold thread `#C77F2B`; bridal maroon `#8E1D26` for the wedding section only. Oversized editorial serif
> display type (Iowan Old Style → Georgia fallback) with italic red emphasis; mono uppercase kickers
> (letter-spacing .2em); hairline rules `#E2DCD0`; 18px card radii; no heavy shadows — only soft hover lifts;
> asymmetric 6-column grid; generous white space; mobile-first, semantic, keyboard-accessible.
>
> **Sections, in order:** ① Full-viewport 3D hero (prompt 2) with headline "The Complete Family *Store*" and
> eyebrow "EXCLUSIVE — DAVANAGERE · SINCE 1938" ② category marquee ticker (Sarees ◆ Ethnic ◆ Formals ◆ Wedding
> ◆ Kids ◆ Home furnishings ◆ Cosmetics ◆ Footwear ◆ Jewellery ◆ Tailoring) ③ stats band — 88 years · 3 cities ·
> 3,00,000 sq ft · 1,300+ team · 10,000+ daily footfall, count-up animation ④ scroll-pinned horizontal heritage
> timeline (pushcart → 1938 → evolution → 3 cities → 5th generation) ⑤ collections grid — Women (sarees,
> silks, dress materials, party & casual), Men (formals, shirts, suiting, ethnic sets), Kids & Teens, a
> full-width **Wedding & Bridal Wing** card, and **Home Furnishings** (linen, curtains, décor, essentials)
> — flat-lay photography, pointer-driven 3D tilt ⑥ navy brand-proposition band: "Make family shopping
> *complete*, *convenient* and *joyful*" ⑦ wedding feature checklist (bridal/groom silks, family sets, jewellery,
> gifting, bespoke tailoring) ⑧ home & lifestyle tiles ⑨ curated-brands wall (partner-brand placeholder tiles)
> ⑩ aisle chips (imitation jewellery, cosmetics, footwear, accessories, fabrics, tailoring) ⑪ brand-identity
> band on navy: the twin curves = saree folds + waves of generations, with a live wave canvas ⑫ services
> tiles (expert tailoring, planned family shopping, gifting, assisted selection) ⑬ stores — 3 cards:
> **BSC Exclusive Davanagere** (50,000 sq ft · 300 staff · 3 floors, the birthplace), **BSC Textile Mall
> Belagavi** (1,00,000 sq ft · 500 staff · largest textile showroom in Karnataka/Maharashtra/Goa),
> **BSC Shivamogga** (1,50,000 sq ft · 500 staff · the new chapter); big timings badge
> **"10:00 AM – 10:00 PM · every day"**; Google-Maps links ⑭ full company-profile narrative +
> products & services matrix (Clothing / Accessories / Home & Lifestyle / Services) ⑮ leadership cards —
> Mr. Umapathy Bankapur (Founder & Director), Mr. Chandrashekar Bankapur (Managing Director),
> Mr. Ved Bankapur (Director, 5th gen) ⑯ red "Doors open. Generations welcome." CTA band ⑰ dark footer with
> the transparent logo, sitemap, timings, terms.

## PROMPT 2 — 3D scroll-based ANIME-ACTION motion (the hero)

> Build a **scroll-driven WebGL hero** with three.js. The logo's twin flowing curves become **two physical silk
> ribbons**: upper = navy gradient (#182E6E→#3A5CC0), lower = red gradient (#B81B20→#E05A52), plus a thin gold
> thread ribbon and 260 drifting "loose thread" particles on an ivory void.
>
> **Geometry/shading:** PlaneGeometry 16×2.6 and 15×2.1 (220×26 segments) with a custom shader — vertex wave
> `sin(u·3.4+t)·.5 + sin(u·8.1−1.7t)·.16 + sin(u·17+.6t)·.05`, windowed by `sin(πu)`; z-fold
> `cos(u·5+.8t)`; twist `(u−.5)·θ·(1+scroll·2.2)` rotated in YZ; fragment gets a silky centre-line highlight
> `pow(1−|uv.y−.5|·2,6)`; DoubleSide, transparent, no post-processing, DPR ≤ 1.75.
>
> **Scroll choreography (GSAP ScrollTrigger, scrub .9):** at progress 0 the ribbons lie flat, framing the
> headline like an opening pallu. 0→.45: amplitude ×1.9, twist increases, upper ribbon lifts +1.15y and −2.4z
> while the lower slides −1.4x and both rotate apart (−.22 / +.16 rad) — the cloth "unfolds the story".
> .45→1: camera dollies 9.2→6.6 and drops −1.35y; headline parallaxes up 120px, fades at 1.35× and its
> letter-spacing opens −.015→+.005em so type never fights cloth. Pointer parallax ±0.55 on camera.
>
> **Anime-action physics:** everything moves with anticipation + follow-through. Scroll influence is damped in
> the RAF loop (k=0.07) so the silk settles a beat late, then micro-overshoots to rest. Easings: snap
> `cubic-bezier(.16,1.02,.28,1)` for entrances, swoop `cubic-bezier(.22,.9,.12,1)` for reveals,
> `elastic.out(1,.4)` for magnetic buttons, `back.out(2.4)` for card tilt spring-back. Headlines rise from
> overflow-hidden line masks (112%→0, second line +140ms). Counters end with a ±1.2% wobble. One big moment
> per screen; 70–120ms sibling stagger. `prefers-reduced-motion` collapses to opacity-only; a 2D-canvas twin
> (same wave math, layered strokes) auto-replaces WebGL on weak devices. Pause rendering when the tab is hidden.

## PROMPT 3 — Video / film prompt (Runway · Veo · Sora)

> 3D anime-cel-shaded cinematic shot: two enormous ribbons of silk — one indigo navy, one vermilion red — flow
> weightlessly across an ivory void like the strokes of a calligraphic logo. The camera tracks along the silk
> as it twists into saree pleats; dust motes drift like loose threads catching light. In slow motion the ribbons
> coil around an invisible mannequin, then release into the wordmark "BSC" — deep red serif letters with twin
> navy curves above and a hairline of gold beneath. Ink-wash background, warm film grain, 24 fps cadence with
> anime smear frames on fast folds, anticipation-then-snap motion. Deliver 16:9 and 9:16.

## PROMPT 4 — Photography prompt pack (for real shoots / image models)

> **Hero texture:** "A single fold of vermilion-red silk and one of indigo navy silk floating on warm ivory,
> long soft shadows, macro thread detail, no text." · **Women:** "Folded kanjivaram with gold zari border and
> one brass bangle, flat-lay on ivory linen, window light." · **Men:** "Navy formal shirt + charcoal suiting
> fold, red pocket square accent, negative space right." · **Wedding:** "Bridal maroon temple-zari silk on a
> wooden dress form, brass-lamp bokeh, no faces." · **Kids:** "Ivory-and-red kurta set with tiny leather
> sandals, top-down on linen." · **Home:** "Stack of ivory/indigo linens with a red cushion, morning-light
> stripe." All: 4:5, muted luxury, no text, no people unless noted.

## PROMPT 5 — Analytics & admin role (what this project actually ships)

> Add a **self-hosted, consent-first analytics platform**. Visitors: if consent is declined, nothing is
> recorded and the gate re-appears until accepted (floating pill + 45s re-open). On accept record device,
> browser, OS, screen, language, timezone, touch, IP, referrer, landing page; optional step 2 **email** via
> browser account autofill (FedCM) or typed; optional step 3 **live location** via browser geolocation —
> store only district/state/city + coordinates. Track every section view with dwell-seconds, every click
> (`data-el`), scroll depth, 30s heartbeat; batch to SQLite; server refuses all events without consent (403).
> Admin dashboard (cookie-auth, `/admin`, nobody else can view): KPIs, 30-day bar chart, **calendar — tap a
> day → hourly activity + per-session table + event stream**, sections & clicks league tables, device/browser/OS,
> state & district, emails, live-feed (10s auto-refresh), CSV exports. Comply with DPDP Act 2023: notice,
> consent, minimisation, no third-party trackers or fingerprinting.

---

### 🎨 Palette tokens (sampled from your uploaded logo)

| Token | Hex | Where |
|---|---|---|
| BSC Red | `#CA2125` / deep `#BF0908` | CTAs, emphasis, wave, hover marks |
| BSC Navy | `#203A85` / deep `#0B2C96` | headlines accents, bands, upper wave |
| Ink | `#171B2C` | body text, footer |
| Paper | `#FAF8F4` / `#F3EFE7` | backgrounds |
| Gold thread | `#C77F2B` | wedding ring dot, badge, hairline wave |
| Bridal maroon | `#8E1D26` | wedding section only |
| Snap | `cubic-bezier(.16,1.02,.28,1)` | entrances |
| Swoop | `cubic-bezier(.22,.9,.12,1)` | reveals, parallax |
