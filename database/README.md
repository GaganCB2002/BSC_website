# BSC — Database Layer

Everything the site stores lives in this folder. The backend (`backend/db.js`) opens the
SQLite database here on boot; `database/data/` is machine-generated state (git-ignored),
everything else is documentation/schema you can commit.

```
database/
├─ schema.sql           full schema reference (analytics + content) — for review & migrations
├─ README.md            this file
└─ data/                LIVE data (git-ignored)
   ├─ bsc-analytics.db  SQLite database, WAL mode
   ├─ admin.json        owner (super) account — scrypt hash  ← npm run admin:pass
   └─ admins.json       extra accounts (view-only "admin" role / super) ← npm run admin:view
```

## Tables

**Analytics (written only after visitor consent — DPDP Act 2023)**

- `sessions` — one row per visitor session: consent state + timestamp, optional email
  (+ source), optional live location (`lat/lng/accuracy` + resolved `geo_district`,
  `geo_city`, `geo_state`, `geo_country`), device fingerprint-free tech data
  (`device_type`, `browser`, `browser_ver`, `os`, `os_ver`, `screen`, `dpr`, `lang`,
  `tz`, `touch`, `platform`), `ip`, `referrer`, `landing`, `pages`.
- `events` — interaction stream: `type` ∈ pageview / section_view (value = dwell seconds) /
  click / scroll_depth / heartbeat, with `section`, `element`, `value`, `meta`, `date` (UTC
  day — the calendar indexes this).
- `consent_log` — every accept/decline with version + IP (audit trail for the consent gate).
- `audit` — admin actions: logins, failed logins, CSV exports.

**Content (seeded by `backend/content.js` on first boot; re-apply with `npm run db:reseed`)**

- `collections` — the full catalogue: women, men, kids, wedding & occasion, home
  furnishings, dress materials, imitation jewellery, cosmetics, footwear, accessories,
  curated brands, expert tailoring (JSON `highlights`, accent colour, image, sort).
- `stores` — the 3 showrooms with sq ft, staff, badge, note, hours
  (`10:00 AM – 10:00 PM · every day`) and Google-Maps query.
- `leaders` — the leadership (3rd / 4th / 5th generation).

Served read-only by the backend at `GET /api/content/collections|stores|leaders`.

## Backups & scaling

- **Backup**: stop the server (or `PRAGMA wal_checkpoint(TRUNCATE)` via any sqlite3 CLI)
  and copy `data/bsc-analytics.db`.
- **Scale path**: the backend talks to SQLite through `node:sqlite` prepared statements
  only. For MySQL/Postgres later, port `backend/db.js`'s statements to your driver and
  translate `schema.sql` — routes, validation and the frontend stay untouched.
- **Retention**: sessions/events grow with traffic; export CSVs from the dashboard, then
  `DELETE FROM events WHERE date < 'YYYY-MM-DD'` periodically (owner decision under DPDP).
