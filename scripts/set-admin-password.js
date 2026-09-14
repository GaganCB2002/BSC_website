'use strict';
/* Change the admin dashboard password:  npm run admin:pass -- "new password" */
const path = require('path'); const fs = require('fs'); const crypto = require('crypto');
const DATA_DIR = process.env.BSC_DATA_DIR || path.join(__dirname, '..', 'database', 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const pass = process.argv[2];
if (!pass || pass.length < 8) { console.error('Usage: npm run admin:pass -- "<new password (8+ chars)>"'); process.exit(1); }
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(pass, salt, 64).toString('hex');
const user = (() => { try { return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8')).user; } catch { return 'admin'; } })();
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(ADMIN_FILE, JSON.stringify({ user, salt, hash }, null, 2), { mode: 0o600 });
console.log('Admin password updated. Log in at /admin as', user, '(open sessions were revoked).');
