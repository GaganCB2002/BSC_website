'use strict';
/* BSC — The Complete Family Store. Web server + analytics API + admin dashboard. */
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const express = require('express');

const { db, Q, parseUA, dayOf, DATA_DIR } = require('./db');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, '..', 'frontend');
const SESSION_TTL_MS = 30 * 60 * 1000;   // a session stays "live" for 30 min of activity
const CONSENT_VERSION = '2026-09';

/* ---------- admin accounts (scrypt-hashed) ----------
   Roles: 'super' = full control (CSV exports, account management) ·
          'admin' = view-only dashboard (the "one more role" — analytics eyes, no exports).
   Accounts live in database/data/admins.json (npm run admin:view). The legacy single-account
   database/data/admin.json is still honoured as the owner (super) so existing installs keep working. */
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'admins.json');
function hashPass(pass, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  return { salt, hash: crypto.scryptSync(String(pass), salt, 64).toString('hex') };
}
function loadAdmin() {
  try { return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8')); } catch { return null; }
}
function ensureAdmin() {
  let cfg = loadAdmin();
  if (!cfg) {
    const pass = process.env.BSC_ADMIN_PASSWORD || 'bsc@Family2026';
    cfg = { user: 'admin', ...hashPass(pass) };
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
    console.log('[BSC] admin.json created — user: admin  password:', pass, '(CHANGE IT: npm run admin:pass -- <newpass>)');
  }
  return cfg;
}
function accounts() {
  let list = [];
  try {
    const j = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
    if (Array.isArray(j.admins)) list = j.admins;
  } catch { /* no multi-account file yet */ }
  /* the legacy owner account (admin.json) always stays available unless superseded
     by an account with the same username */
  const legacy = loadAdmin();
  if (legacy && !list.some((a) => a.user === legacy.user)) list = list.concat([{ ...legacy, role: 'super' }]);
  return list;
}
function checkLogin(user, pass) {
  const acc = accounts().find((a) => a.user === user);
  if (!acc) return null;
  const h = crypto.scryptSync(String(pass), acc.salt, 64).toString('hex');
  try { if (!crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(acc.hash, 'hex'))) return null; } catch { return false; }
  return { user: acc.user, role: acc.role === 'super' ? 'super' : 'admin' };
}

const TOKENS = new Map();           // token -> {exp, user, role}
const LOGIN_TRIES = new Map();      // ip -> {n, t, lockedUntil}
const LOCKOUT_FILE = path.join(DATA_DIR, 'login-lockouts.json');
const MAX_ATTEMPTS = 2;             // wrong passwords before lockout
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout

/* persist lockouts to disk so they survive server restarts */
function loadLockouts() {
  try {
    const data = JSON.parse(fs.readFileSync(LOCKOUT_FILE, 'utf8'));
    const now = Date.now();
    for (const [ip, entry] of Object.entries(data)) {
      if (entry.lockedUntil > now) LOGIN_TRIES.set(ip, entry);
    }
  } catch { /* no lockout file yet */ }
}
function saveLockouts() {
  const obj = {};
  for (const [ip, entry] of LOGIN_TRIES) {
    if (entry.lockedUntil && entry.lockedUntil > Date.now()) obj[ip] = entry;
  }
  try { fs.writeFileSync(LOCKOUT_FILE, JSON.stringify(obj, null, 2), { mode: 0o600 }); } catch {}
}
function newToken(user, role) {
  const t = crypto.randomBytes(24).toString('hex');
  TOKENS.set(t, { exp: Date.now() + 12 * 3600e3, user, role });
  return t;
}
function authed(req) {
  const m = /bsc_admin=([a-f0-9]{48})/.exec(req.headers.cookie || '');
  if (!m) return null;
  const t = TOKENS.get(m[1]);
  if (!t || t.exp < Date.now()) { TOKENS.delete(m[1] || ''); return null; }
  t.exp = Date.now() + 12 * 3600e3;
  return { user: t.user, role: t.role };
}

/* ---------- helpers ---------- */
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  next();
});
app.use(express.json({ limit: '256kb' }));

const ipOf = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  (req.socket && req.socket.remoteAddress) || '';
function safeSid(s) { return /^[a-f0-9-]{8,64}$/i.test(String(s || '')) ? String(s) : null; }
const clampStr = (v, n) => (v == null ? null : String(v).slice(0, n));

function audit(actor, action, meta) { Q.insAudit.run(Date.now(), actor, action, meta ? JSON.stringify(meta).slice(0, 500) : null); }

/* rate-limit tracker writes per IP */
const writeHits = new Map();
function allowWrite(ip) {
  const now = Date.now();
  const e = writeHits.get(ip) || { n: 0, t: now };
  if (now - e.t > 60e3) { e.n = 0; e.t = now; }
  e.n++; writeHits.set(ip, e);
  return e.n < 120;
}

/* ================= PUBLIC (consented) COLLECT API ================= */

/* First contact: create/refresh the anonymous session record with device info. */
app.post('/api/session', (req, res) => {
  const b = req.body || {};
  const id = safeSid(b.sid);
  if (!id || !allowWrite(ipOf(req))) return res.status(b.sid ? 403 : 400).json({ ok: false });
  const ua = parseUA(req.headers['user-agent'] || '');
  Q.upsertSession.run({
    id, now: Date.now(),
    ua: clampStr(req.headers['user-agent'], 400) || '',
    device: ua.device, browser: ua.browser, browserVer: ua.browserVer, os: ua.os, osVer: ua.osVer,
    screen: clampStr(b.screen, 32), dpr: Number(b.dpr) || 1, lang: clampStr(b.lang, 16), tz: clampStr(b.tz, 64),
    touch: b.touch ? 1 : 0, platform: clampStr(b.platform, 32), online: b.online ? 1 : 0,
    ip: ipOf(req).slice(0, 64), referrer: clampStr(req.headers.referer, 300), landing: clampStr(b.path, 120),
  });
  const row = db.prepare('SELECT consent FROM sessions WHERE id=?').get(id);
  res.json({ ok: true, consent: !!(row && row.consent) });
});

/* Consent decision. accept=false keeps collection off; the UI re-prompts. */
app.post('/api/consent', (req, res) => {
  const b = req.body || {};
  const id = safeSid(b.sid);
  if (!id || !allowWrite(ipOf(req))) return res.status(400).json({ ok: false });
  const accepted = !!b.accepted;
  if (accepted) Q.setConsent.run({ id, now: Date.now() }); else Q.declineConsent.run({ id });
  Q.insConsent.run(id, Date.now(), accepted ? 1 : 0, CONSENT_VERSION, ipOf(req));
  res.json({ ok: true, accepted });
});

/* Browser-assisted or typed email. */
app.post('/api/email', (req, res) => {
  const b = req.body || {};
  const id = safeSid(b.sid);
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160);
  if (!id || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return res.status(400).json({ ok: false, err: 'invalid email' });
  const has = db.prepare('SELECT consent FROM sessions WHERE id=?').get(id);
  if (!has || !has.consent) return res.status(403).json({ ok: false, err: 'consent required' });
  Q.setEmail.run({ id, email, source: b.source === 'browser' ? 'browser' : 'typed' });
  res.json({ ok: true });
});

/* Live location — sent only after BOTH site-consent and the browser geolocation permission. */
app.post('/api/location', (req, res) => {
  const b = req.body || {};
  const id = safeSid(b.sid);
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!id || !Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ ok: false });
  const has = db.prepare('SELECT consent FROM sessions WHERE id=?').get(id);
  if (!has || !has.consent) return res.status(403).json({ ok: false, err: 'consent required' });
  const g = b.geo || {};
  Q.setGeo.run({
    id, lat, lng,
    accuracy: Number(b.accuracy) || null,
    district: clampStr(g.district, 80), city: clampStr(g.city, 80),
    state: clampStr(g.state, 80), country: clampStr(g.country, 80),
  });
  res.json({ ok: true });
});

/* Batched interaction events: pageview / section_view / click / scroll_depth / heartbeat … */
app.post('/api/events', (req, res) => {
  const b = req.body || {};
  const id = safeSid(b.sid);
  if (!id || !allowWrite(ipOf(req))) return res.status(400).json({ ok: false });
  const has = db.prepare('SELECT consent FROM sessions WHERE id=?').get(id);
  if (!has || !has.consent) return res.status(403).json({ ok: false, err: 'no consent — events ignored' });
  const evs = Array.isArray(b.events) ? b.events.slice(0, 60) : [];
  let n = 0;
  const tx = db.transaction(() => {
    for (const e of evs) {
      const ts = Math.min(Math.max(Number(e.ts) || Date.now(), Date.now() - 864e5), Date.now() + 5e3);
      Q.insEvent.run({
        sid: id, ts, date: dayOf(ts),
        type: clampStr(e.type, 32) || 'event',
        section: clampStr(e.section, 80), element: clampStr(e.name, 120),
        value: Math.max(0, Math.floor(Number(e.value) || 1)),
        meta: e.meta ? JSON.stringify(e.meta).slice(0, 400) : null,
      });
      n++;
    }
    db.prepare(`UPDATE sessions SET last_seen=?, ip=? WHERE id=?`).run(Date.now(), ipOf(req).slice(0,64), id);
  });
  tx();
  res.json({ ok: true, saved: n });
});

/* ================= ADMIN (cookie-protected, role-aware) ================= */
function requireAdmin(req, res, next) {
  const s = authed(req);
  if (!s) return res.status(401).json({ err: 'auth' });
  req.admin = s; next();
}
/* view-only admins may READ the dashboard; full control needs the super role */
function requireSuper(req, res, next) {
  const s = authed(req);
  if (!s) return res.status(401).json({ err: 'auth' });
  if (s.role !== 'super') return res.status(403).json({ err: 'view-only account — CSV exports are owner-only' });
  req.admin = s; next();
}

app.post('/api/admin/login', (req, res) => {
  const ip = ipOf(req);
  const now = Date.now();
  const t = LOGIN_TRIES.get(ip) || { n: 0, t: now, lockedUntil: 0 };

  /* check if currently locked out */
  if (t.lockedUntil && t.lockedUntil > now) {
    const mins = Math.ceil((t.lockedUntil - now) / 60000);
    audit((req.body || {}).username || '?', 'login_blocked', { ip, remaining: mins });
    return res.status(429).json({ err: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`, lockoutMinutes: mins });
  }

  /* if lockout expired, reset attempts */
  if (t.lockedUntil && t.lockedUntil <= now) {
    t.n = 0;
    t.lockedUntil = 0;
  }

  const pass = String((req.body || {}).password || '');
  const user = String((req.body || {}).username || 'admin');
  const sess = checkLogin(user, pass);

  if (sess) {
    /* success — clear attempts and lockout */
    LOGIN_TRIES.delete(ip);
    saveLockouts();
    const token = newToken(sess.user, sess.role);
    const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
    res.setHeader('Set-Cookie', `bsc_admin=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=43200`);
    audit(sess.user, 'login', { role: sess.role });
    return res.json({ ok: true, role: sess.role });
  }

  /* failed attempt */
  t.n++;
  t.t = now;

  if (t.n >= MAX_ATTEMPTS) {
    /* lockout triggered */
    t.lockedUntil = now + LOCKOUT_MS;
    saveLockouts();
    audit(user || '?', 'login_locked', { ip, attempts: t.n });
    const mins = Math.ceil(LOCKOUT_MS / 60000);
    return res.status(429).json({ err: `Account locked after ${t.n} failed attempts. Try again in ${mins} minutes.`, lockoutMinutes: mins });
  }

  LOGIN_TRIES.set(ip, t);
  saveLockouts();
  audit(user || '?', 'login_failed', { attempts: t.n, remaining: MAX_ATTEMPTS - t.n });
  const remaining = MAX_ATTEMPTS - t.n;
  res.status(401).json({ err: `Invalid password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`, attemptsRemaining: remaining });
});

app.post('/api/admin/logout', (req, res) => {
  const m = /bsc_admin=([a-f0-9]{48})/.exec(req.headers.cookie || '');
  if (m) TOKENS.delete(m[1]);
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `bsc_admin=; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/api/admin/me', (req, res) => {
  const s = authed(req);
  if (!s) return res.status(401).json({ ok: false, err: 'auth' });
  res.json({ ok: true, user: s.user, role: s.role });
});

/* KPI cards + range picker */
app.get('/api/admin/summary', requireAdmin, (req, res) => {
  const { from, to } = range(req);
  const g = (sql, ...p) => db.prepare(sql).get(...p);
  const today = dayOf(Date.now());
  const S = `session_id IN (SELECT id FROM sessions WHERE consent=1)`;
  const inRange = `date BETWEEN ? AND ?`;
  res.json({
    from, to,
    visitors:   g(`SELECT COUNT(*) c FROM sessions WHERE consent=1 AND date(created_at/1000,'unixepoch') BETWEEN ? AND ?`, from, to).c,
    visitorsToday: g(`SELECT COUNT(*) c FROM sessions WHERE consent=1 AND date(created_at/1000,'unixepoch')=?`, today).c,
    visits:     g(`SELECT COUNT(*) c FROM events WHERE type='pageview' AND ${inRange}`, from, to).c,
    clicks:     g(`SELECT COUNT(*) c FROM events WHERE type='click' AND ${inRange}`, from, to).c,
    views30min: g(`SELECT COUNT(*) c FROM sessions WHERE consent=1 AND last_seen > ?`, Date.now() - SESSION_TTL_MS).c,
    emails:     g(`SELECT COUNT(*) c FROM sessions WHERE email IS NOT NULL AND date(created_at/1000,'unixepoch') BETWEEN ? AND ?`, from, to).c,
    emailsTotal:g(`SELECT COUNT(*) c FROM sessions WHERE email IS NOT NULL`).c,
    located:    g(`SELECT COUNT(*) c FROM sessions WHERE lat IS NOT NULL AND date(created_at/1000,'unixepoch') BETWEEN ? AND ?`, from, to).c,
    avgSeconds: g(`SELECT ROUND(AVG(last_seen-created_at)) s FROM sessions WHERE consent=1 AND date(created_at/1000,'unixepoch') BETWEEN ? AND ?`, from, to).s || 0,
    eventsTotal:g(`SELECT COUNT(*) c FROM events`).c,
  });
});
function range(req) {
  const d = (n) => dayOf(Date.now() - n * 864e5);
  const to = /^\d{4}-\d{2}-\d{2}$/.test(req.query.to || '') ? req.query.to : d(0);
  const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from || '') ? req.query.from : dayOf(new Date(to + 'T00:00:00Z').getTime() - 29 * 864e5);
  return { from, to };
}

/* Calendar feed: per-day visitors / visits / clicks / emails / avg time */
app.get('/api/admin/daily', requireAdmin, (req, res) => {
  const { from, to } = range(req);
  const rows = db.prepare(`
    SELECT e.date,
      COUNT(DISTINCT CASE WHEN e.type='pageview' THEN e.session_id END) AS visitors,
      SUM(CASE WHEN e.type='pageview' THEN e.value ELSE 0 END) AS visits,
      SUM(CASE WHEN e.type='click'    THEN e.value ELSE 0 END) AS clicks,
      SUM(CASE WHEN e.type='section_view' THEN 1 ELSE 0 END) AS section_views
    FROM events e WHERE e.date BETWEEN ? AND ? AND e.session_id IN (SELECT id FROM sessions WHERE consent=1)
    GROUP BY e.date ORDER BY e.date`).all(from, to);
  const emails = db.prepare(`SELECT date(created_at/1000,'unixepoch') d, COUNT(email) c FROM sessions
      WHERE email IS NOT NULL AND date(created_at/1000,'unixepoch') BETWEEN ? AND ? GROUP BY d`).all(from, to);
  const em = Object.fromEntries(emails.map(r => [r.d, r.c]));
  res.json(rows.map(r => ({ ...r, emails: em[r.date] || 0 })));
});

/* Which sections are people actually looking at / clicking */
app.get('/api/admin/sections', requireAdmin, (req, res) => {
  const { from, to } = range(req);
  res.json(db.prepare(`
    SELECT section,
      SUM(CASE WHEN type='section_view' THEN 1 ELSE 0 END) AS views,
      SUM(CASE WHEN type='section_view' THEN value ELSE 0 END) AS seconds,
      SUM(CASE WHEN type='click' THEN value ELSE 0 END) AS clicks,
      COUNT(DISTINCT session_id) AS people
    FROM events WHERE type IN ('section_view','click') AND date BETWEEN ? AND ?
      AND section IS NOT NULL AND session_id IN (SELECT id FROM sessions WHERE consent=1)
    GROUP BY section ORDER BY views DESC`).all(from, to));
});

/* Clicked elements (buttons, cards, nav links) */
app.get('/api/admin/clicks', requireAdmin, (req, res) => {
  const { from, to } = range(req);
  res.json(db.prepare(`
    SELECT section, element, SUM(value) clicks FROM events
    WHERE type='click' AND date BETWEEN ? AND ? AND element IS NOT NULL
      AND session_id IN (SELECT id FROM sessions WHERE consent=1)
    GROUP BY section, element ORDER BY clicks DESC LIMIT 25`).all(from, to));
});

app.get('/api/admin/devices', requireAdmin, (req, res) => {
  const { from, to } = range(req);
  const one = (col) => db.prepare(`SELECT COALESCE(${col},'Unknown') k, COUNT(*) c FROM sessions
    WHERE consent=1 AND date(created_at/1000,'unixepoch') BETWEEN ? AND ? GROUP BY k ORDER BY c DESC`).all(from, to);
  res.json({ device: one('device_type'), browser: one('browser'), os: one('os'), screen: one('screen') });
});

app.get('/api/admin/locations', requireAdmin, (req, res) => {
  const { from, to } = range(req);
  res.json({
    state: db.prepare(`SELECT COALESCE(geo_state,'—') k, COUNT(*) c FROM sessions WHERE consent=1 AND lat IS NOT NULL
        AND date(created_at/1000,'unixepoch') BETWEEN ? AND ? GROUP BY k ORDER BY c DESC`).all(from, to),
    district: db.prepare(`SELECT COALESCE(geo_district, geo_city,'—') k, COALESCE(geo_state,'') state, COUNT(*) c FROM sessions
        WHERE consent=1 AND lat IS NOT NULL AND date(created_at/1000,'unixepoch') BETWEEN ? AND ? GROUP BY k, state ORDER BY c DESC LIMIT 30`).all(from, to),
    withCoords: db.prepare(`SELECT COUNT(*) c FROM sessions WHERE lat IS NOT NULL AND date(created_at/1000,'unixepoch') BETWEEN ? AND ?`).get(from, to).c,
  });
});

app.get('/api/admin/emails', requireAdmin, (req, res) => {
  res.json(db.prepare(`SELECT id, email, email_source source, datetime(created_at/1000,'unixepoch') joined,
      COALESCE(geo_city,'') city FROM sessions WHERE email IS NOT NULL ORDER BY created_at DESC LIMIT 300`).all());
});

/* Day drill-down from the calendar */
app.get('/api/admin/day', requireAdmin, (req, res) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : dayOf(Date.now());
  const sessions = db.prepare(`SELECT id sid, datetime(created_at/1000,'unixepoch') joined,
      datetime(last_seen/1000,'unixepoch') left_at, (last_seen-created_at)/1000 seconds,
      pages, device_type device, COALESCE(os,'—') os, COALESCE(browser,'—') browser, email, COALESCE(geo_city,'') city, COALESCE(geo_state,'') state
    FROM sessions WHERE consent=1 AND date(created_at/1000,'unixepoch')=? ORDER BY created_at DESC`).all(date);
  const events = db.prepare(`SELECT type, COALESCE(section,'') section, COALESCE(element,'') element,
      time(ts/1000,'unixepoch') at, value FROM events WHERE date=?
      AND session_id IN (SELECT id FROM sessions WHERE consent=1) ORDER BY ts DESC LIMIT 400`).all(date);
  const hourly = db.prepare(`SELECT CAST(strftime('%H', ts/1000,'unixepoch') AS INTEGER) h, COUNT(*) c
      FROM events WHERE date=? GROUP BY h ORDER BY h`).all(date);
  res.json({ date, sessions, events, hourly, sessionsCount: sessions.length });
});

/* Live feed (auto-refresh in the dashboard) */
app.get('/api/admin/live', requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT s.id sid, datetime(s.created_at/1000,'unixepoch') joined,
      (strftime('%s','now')*1000 - s.last_seen)/1000 ago, s.pages, s.device_type device, s.browser, s.os,
      s.email, COALESCE(s.geo_city,'') city,
      (SELECT section||' · '||type FROM events e WHERE e.session_id=s.id ORDER BY e.ts DESC LIMIT 1) last_event
    FROM sessions s WHERE s.consent=1 AND s.last_seen > ? ORDER BY s.last_seen DESC LIMIT 40`)
    .all(Date.now() - SESSION_TTL_MS);
  res.json(rows);
});

/* CSV export — owner (super) only; view-only admins are refused at the server, not just the UI */
app.get('/api/admin/export/:what', requireSuper, (req, res) => {
  const what = req.params.what;
  const send = (name, rows) => {
    if (!rows.length) return res.status(404).json({ err: 'empty' });
    const cols = Object.keys(rows[0]);
    const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => esc(r[c])).join(','))).join('\n');
    audit((req.admin && req.admin.user) || 'admin', 'export', { what });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bsc-${name}.csv"`);
    res.send(csv);
  };
  if (what === 'sessions') return send('sessions', db.prepare(`SELECT * FROM sessions ORDER BY created_at DESC LIMIT 20000`).all());
  if (what === 'events')   return send('events', db.prepare(`SELECT datetime(ts/1000,'unixepoch') at, type, section, element, value, session_id, meta FROM events ORDER BY ts DESC LIMIT 100000`).all());
  if (what === 'emails')    return send('emails', db.prepare(`SELECT email, email_source, datetime(created_at/1000,'unixepoch') joined, geo_city, geo_state FROM sessions WHERE email IS NOT NULL`).all());
  if (what === 'consent')  return send('consent', db.prepare(`SELECT datetime(ts/1000,'unixepoch') at, session_id, accepted, version FROM consent_log ORDER BY ts DESC LIMIT 50000`).all());
  res.status(400).json({ err: 'unknown export' });
});

/* ================= PUBLIC CONTENT (database-driven; future-proof for an admin CMS) ================= */
const content = require('./content');
content.ensureSeeded();   /* first boot fills the content tables; npm run db:reseed re-applies */

app.get('/api/content/collections', (req, res) => res.json(content.listCollections()));
app.get('/api/content/stores', (req, res) => res.json(content.listStores()));
app.get('/api/content/leaders', (req, res) => res.json(content.listLeaders()));

/* ================= STATIC + PAGES ================= */
app.use(express.static(PUBLIC_DIR, { maxAge: '1h', extensions: ['html'] }));
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin', 'index.html')));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ err: 'no route' });
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'), (e) => { if (e) res.send('Not found'); });
});

/* graceful shutdown and error logging */
function shutdown() { try { db.close(); } catch {} process.exit(0); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => console.error('[UNCAUGHT EXCEPTION]', err));
process.on('unhandledRejection', (reason) => console.error('[UNHANDLED REJECTION]', reason));

ensureAdmin();
loadLockouts();

/* periodic token cleanup — prune expired tokens every 30 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [tok, exp] of TOKENS) { if (exp < now) TOKENS.delete(tok); }
}, 30 * 60 * 1000);

const server = http.createServer(app);
server.listen(PORT, HOST, () => {
  console.log(`\n  BSC — The Complete Family Store`);
  console.log(`  site    → http://localhost:${PORT}`);
  console.log(`  dashboard → http://localhost:${PORT}/admin  (admin · default password printed above)`);
  console.log(`  data    → ${DATA_DIR}/bsc-analytics.db\n`);
});
