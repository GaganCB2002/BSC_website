'use strict';
/* Manage admin dashboard accounts (roles):
     npm run admin:view -- <username> <password>            → role "admin"  (view-only dashboard)
     npm run admin:view -- <username> <password> super      → role "super"  (full control + CSV exports)
   Accounts are stored in database/data/admins.json (scrypt-hashed, mode 0600) and take
   effect on the next login — no server restart needed. */
const path = require('path'); const fs = require('fs'); const crypto = require('crypto');
const DATA_DIR = process.env.BSC_DATA_DIR || path.join(__dirname, '..', 'database', 'data');
const FILE = path.join(DATA_DIR, 'admins.json');

const [user, pass, roleArg] = process.argv.slice(2);
const role = roleArg === 'super' ? 'super' : 'admin';
if (!user || !pass || pass.length < 8) {
  console.error('Usage: npm run admin:view -- "<username>" "<password (8+ chars)>" [super|admin]');
  process.exit(1);
}
if (!/^[a-zA-Z0-9._-]{3,40}$/.test(user)) { console.error('Username: 3-40 chars, letters/digits/._- only.'); process.exit(1); }

fs.mkdirSync(DATA_DIR, { recursive: true });
let cfg = { admins: [] };
try { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); if (Array.isArray(j.admins)) cfg = j; } catch { /* first account */ }

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(pass, salt, 64).toString('hex');
const acc = { user, role, salt, hash };
const i = cfg.admins.findIndex((a) => a.user === user);
if (i >= 0) cfg.admins[i] = acc; else cfg.admins.push(acc);
fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
console.log(`Account "${user}" saved — role "${role}" (${role === 'super' ? 'full control' : 'view-only dashboard, no CSV exports'}).`);
console.log('Log in at /admin with that username. Takes effect on next login.');
