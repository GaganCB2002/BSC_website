'use strict';
/* BSC analytics — SQLite store (node:sqlite, built-in). */
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = process.env.BSC_DATA_DIR || path.join(__dirname, '..', 'database', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'bsc-analytics.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA synchronous = NORMAL');

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  created_at    INTEGER NOT NULL,
  last_seen     INTEGER NOT NULL,
  consent       INTEGER NOT NULL DEFAULT 0,
  consent_at    INTEGER,
  email         TEXT,
  email_source  TEXT,
  lat           REAL, lng REAL, accuracy REAL,
  geo_district  TEXT, geo_city TEXT, geo_state TEXT, geo_country TEXT,
  ua            TEXT, device_type TEXT, browser TEXT, browser_ver TEXT,
  os TEXT, os_ver TEXT, screen TEXT, dpr REAL, lang TEXT, tz TEXT,
  touch INTEGER DEFAULT 0, platform TEXT, online INTEGER DEFAULT 1,
  ip TEXT, referrer TEXT, landing TEXT, pages INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  section TEXT, element TEXT,
  value INTEGER DEFAULT 1,
  meta TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_date   ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_type   ON events(type, date);
CREATE INDEX IF NOT EXISTS idx_events_sect   ON events(section, type, date);
CREATE TABLE IF NOT EXISTS consent_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL, ts INTEGER NOT NULL,
  accepted INTEGER NOT NULL, version TEXT, ip TEXT
);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, actor TEXT, action TEXT, meta TEXT
);
`);

/* transaction helper (node:sqlite has no built-in db.transaction) */
db._origPrepare = db.prepare.bind(db);
db.transaction = function (fn) {
  return function (...args) {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  };
};

/* ---- user-agent parsing (dependency-free) ---- */
function parseUA(ua) {
  ua = String(ua || '');
  const pick = (re) => { const m = ua.match(re); return m || []; };
  let browser = 'Other', browserVer = '', os = 'Unknown', osVer = '', device = 'desktop';
  if (/ipad|tablet/i.test(ua)) device = 'tablet';
  else if (/mobile|android|iphone|ipod/i.test(ua)) device = 'mobile';
  const order = [[/EdgA?\/([\d.]+)/, 'Edge'], [/OPR\/([\d.]+)/, 'Opera'], [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
    [/Firefox\/([\d.]+)/, 'Firefox'], [/FxiOS\/([\d.]+)/, 'Firefox (iOS)'], [/CriOS\/([\d.]+)/, 'Chrome (iOS)'],
    [/Chrome\/([\d.]+)/, 'Chrome'], [/Version\/([\d.]+).*Safari/, 'Safari'], [/Safari\/([\d.]+)/, 'Safari']];
  for (const [re, nm] of order) { const mm = ua.match(re); if (mm) { browser = nm; browserVer = mm[1]; break; } }
  if (/Windows NT 10/i.test(ua)) { os = 'Windows'; osVer = '10/11'; }
  else if (/Windows/i.test(ua)) { os = 'Windows'; }
  else if (/Android ([\d.]+)/i.test(ua)) { os = 'Android'; osVer = ua.match(/Android ([\d.]+)/i)[1]; }
  else if (/iPhone|iPad|iPod/i.test(ua)) { os = 'iOS'; osVer = (ua.match(/OS (\d+[_.\d]*)/i) || [])[1]?.replace(/_/g, '.') || ''; }
  else if (/Mac OS X ([\d_]+)/i.test(ua)) { os = 'macOS'; osVer = (ua.match(/Mac OS X ([\d_]+)/i) || [])[1]?.replace(/_/g, '.') || ''; }
  else if (/Macintosh/i.test(ua)) os = 'macOS';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  return { browser, browserVer, os, osVer, device };
}

const dayOf = (ts) => new Date(ts).toISOString().slice(0, 10);

/* ---- prepared statements ---- */
const Q = {
  upsertSession: db.prepare(`
    INSERT INTO sessions (id, created_at, last_seen, ua, device_type, browser, browser_ver, os, os_ver,
      screen, dpr, lang, tz, touch, platform, online, ip, referrer, landing, pages)
    VALUES (@id, @now, @now, @ua, @device, @browser, @browserVer, @os, @osVer, @screen, @dpr, @lang, @tz,
      @touch, @platform, @online, @ip, @referrer, @landing, 1)
    ON CONFLICT(id) DO UPDATE SET
      last_seen = excluded.last_seen,
      pages = pages + 1,
      ua = excluded.ua, device_type = excluded.device_type, browser = excluded.browser,
      browser_ver = excluded.browser_ver, os = excluded.os, os_ver = excluded.os_ver,
      screen = excluded.screen, dpr = excluded.dpr, lang = excluded.lang, tz = excluded.tz,
      touch = excluded.touch, platform = excluded.platform, online = excluded.online
  `),
  setConsent: db.prepare(`UPDATE sessions SET consent=1, consent_at=@now WHERE id=@id`),
  declineConsent: db.prepare(`UPDATE sessions SET consent=0 WHERE id=@id`),
  setEmail: db.prepare(`UPDATE sessions SET email=@email, email_source=@source WHERE id=@id`),
  setGeo: db.prepare(`UPDATE sessions SET lat=@lat, lng=@lng, accuracy=@accuracy, geo_district=@district,
      geo_city=@city, geo_state=@state, geo_country=@country WHERE id=@id`),
  insEvent: db.prepare(`INSERT INTO events (session_id, ts, date, type, section, element, value, meta)
      VALUES (@sid, @ts, @date, @type, @section, @element, @value, @meta)`),
  insConsent: db.prepare(`INSERT INTO consent_log (session_id, ts, accepted, version, ip) VALUES (?,?,?,?,?)`),
  insAudit: db.prepare(`INSERT INTO audit (ts, actor, action, meta) VALUES (?,?,?,?)`),
};

/* ---- site content (collections / stores / leadership) — DB-driven so future admin
   tools can edit rows without touching the frontend ---- */
db.exec(`
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  highlights TEXT,
  image TEXT,
  accent TEXT,
  sort INTEGER DEFAULT 100
);
CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  badge TEXT,
  sqft TEXT,
  employees TEXT,
  note TEXT,
  hours TEXT NOT NULL DEFAULT '10:00 AM - 10:00 PM',
  maps_query TEXT,
  sort INTEGER DEFAULT 100
);
CREATE TABLE IF NOT EXISTS leaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  generation TEXT,
  bio TEXT,
  initials TEXT,
  sort INTEGER DEFAULT 100
);
`);

module.exports = { db, Q, parseUA, dayOf, DATA_DIR };
