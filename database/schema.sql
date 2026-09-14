-- ============================================================
-- BSC — The Complete Family Store · full schema reference
-- (SQLite, WAL — mirrored by backend/db.js + backend/content.js
--  at boot with CREATE TABLE IF NOT EXISTS; this file is the
--  human-readable / migration reference)
-- ============================================================

-- ---------- ANALYTICS (consent-gated; DPDP Act 2023) ----------

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,            -- random UUID from the browser
  created_at    INTEGER NOT NULL,            -- ms epoch
  last_seen     INTEGER NOT NULL,
  consent       INTEGER NOT NULL DEFAULT 0,  -- 1 only after gate acceptance
  consent_at    INTEGER,
  email         TEXT,                        -- optional (gate step 2)
  email_source  TEXT,                        -- 'browser' (FedCM autofill) | 'typed'
  lat REAL, lng REAL, accuracy REAL,         -- optional live location (gate step 3)
  geo_district  TEXT,                        -- resolved district (never finer)
  geo_city      TEXT,
  geo_state     TEXT,                        -- resolved state
  geo_country   TEXT,
  ua            TEXT,
  device_type   TEXT,                        -- desktop | mobile | tablet
  browser       TEXT, browser_ver TEXT,
  os            TEXT, os_ver TEXT,
  screen        TEXT, dpr REAL, lang TEXT, tz TEXT,
  touch INTEGER DEFAULT 0, platform TEXT, online INTEGER DEFAULT 1,
  ip            TEXT,                        -- abuse prevention / rough fallback
  referrer      TEXT, landing TEXT,
  pages         INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts         INTEGER NOT NULL,               -- ms epoch
  date       TEXT NOT NULL,                  -- UTC YYYY-MM-DD (calendar index)
  type       TEXT NOT NULL,                  -- pageview | section_view | click | scroll_depth | heartbeat
  section    TEXT,                           -- tracked section id (hero, collections, stores, …)
  element    TEXT,                           -- clicked element label (data-el)
  value      INTEGER DEFAULT 1,              -- dwell seconds / scroll % / count
  meta       TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_date    ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type, date);
CREATE INDEX IF NOT EXISTS idx_events_sect    ON events(section, type, date);

CREATE TABLE IF NOT EXISTS consent_log (      -- every accept/decline, with version
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts         INTEGER NOT NULL,
  accepted   INTEGER NOT NULL,
  version    TEXT,
  ip         TEXT
);

CREATE TABLE IF NOT EXISTS audit (            -- admin logins / failed logins / exports
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL, actor TEXT, action TEXT, meta TEXT
);

-- ---------- SITE CONTENT (seeded from backend/content.js) ----------

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,          -- women | men | kids | wedding | home-furnishings | …
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,                 -- clothing | occasion | home | accessories | brands | services
  tagline     TEXT,
  description TEXT,
  highlights  TEXT,                          -- JSON array of bullet points
  image       TEXT,                          -- /assets/img/... (NULL → text-only tile)
  accent      TEXT,                          -- brand accent hex
  sort        INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,           -- davanagere | belagavi | shivamogga
  name       TEXT NOT NULL,
  city       TEXT NOT NULL,
  badge      TEXT,                           -- Birthplace · Flagship / Landmark / New chapter
  sqft       TEXT, employees TEXT,
  note       TEXT,
  hours      TEXT NOT NULL DEFAULT '10:00 AM - 10:00 PM',
  maps_query TEXT,
  sort       INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS leaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,           -- umapathy | chandrashekar | ved
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,                  -- Founder & Director / Managing Director / Director
  generation TEXT,                           -- 3rd / 4th / 5th generation
  bio        TEXT,
  initials   TEXT,
  sort       INTEGER DEFAULT 100
);
