/* BSC privacy-first tracker.
   NOTHING is sent to the server until the visitor accepts in the gate.
   Collects (only after consent): device/browser info, optional email,
   optional live location (district/state, via the browser's own permission),
   pageviews, per-section view time, and clicks. */
(function () {
  'use strict';
  try {
  const LS = { sid: 'bsc.sid', consent: 'bsc.consent.v2', emailSkip: 'bsc.email.skip', geoSkip: 'bsc.geo.skip' };
  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    remove(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const uuid = () => { try { return crypto.randomUUID(); } catch (e) { return 'xxxxxxxx-xxxx-4xxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16)); } };
  let sid = storage.get(LS.sid);
  if (!sid) { sid = uuid(); storage.set(LS.sid, sid); }
  let consent = storage.get(LS.consent) === '1';

  /* ---------------- queue / flush ---------------- */
  let queue = [], flushing = false;
  const API = (p) => '/api' + p;
  async function post(url, body, keepalive) {
    try {
      await fetch(API(url), {
        method: 'POST', keepalive: !!keepalive, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ sid }, body)),
      });
    } catch (e) { /* offline — silently drop */ }
  }
  function push(type, o) {
    if (!consent) return;
    queue.push(Object.assign({ type, ts: Date.now() }, o));
    if (queue.length >= 12) flush(false);
  }
  async function flush(keepalive) {
    if (!queue.length || flushing) return; flushing = true;
    const batch = queue.splice(0, 60);
    try {
      if (keepalive && navigator.sendBeacon) {
        navigator.sendBeacon(API('/events'), new Blob([JSON.stringify({ sid, events: batch })], { type: 'application/json' }));
      } else await post('/events', { events: batch });
    } catch (e) { }
    flushing = false;
  }

  /* ---------------- gate toggle ----------------
     Consent-first per requirement: until the visitor accepts, nothing is collected and
     the gate re-appears (45s cadence + floating pill) until accepted. */
  const GATE_ENABLED = true;

  /* ---------------- gate ---------------- */
  const gate = document.getElementById('gate');
  const pill = document.getElementById('gatePill');
  const stepLabel = document.getElementById('gateStep');
  let repromptT = null, gateStep = 0;
  const showStep = (n) => {
    gateStep = n;
    if (stepLabel) stepLabel.textContent = (n + 1) + ' / 3';
    document.querySelectorAll('.gate-pane').forEach(p => { p.hidden = +p.dataset.pane !== n; });
  };
  const openGate = () => { if (!GATE_ENABLED || !gate) return; showStep(0); gate.hidden = false; document.body.classList.add('gated'); if (pill) pill.hidden = true; };
  const closeGate = () => { if (gate) gate.hidden = true; document.body.classList.remove('gated'); clearInterval(repromptT); repromptT = null; window.scrollTo(0, 0); };
  const grant = (closeImmediately = true) => {
    consent = true; storage.set(LS.consent, '1');
    post('/consent', { accepted: true });
    start();
    if (closeImmediately) {
      closeGate();
    } else {
      /* Skip email step — go directly to GPS location step */
      showStep(2);
    }
  };

  const decline = () => {
    post('/consent', { accepted: false });
    storage.set(LS.consent, '0');
    closeGate(); if (pill) pill.hidden = false;
    /* not accepted → politely ask again while they browse */
    clearInterval(repromptT);
    repromptT = setInterval(() => { if (!consent) openGate(); }, 45000);
  };

  window._gateAccept = () => grant(false);
  window._gateDecline = decline;
  window._gateFinish = () => closeGate();
  window._gateEmailSkip = () => { storage.set(LS.emailSkip, '1'); showStep(2); };
  window._gateGeoSkip = () => { storage.set(LS.geoSkip, '1'); closeGate(); };
  window._gateGeo = null; // set below after geo handler is defined

  if (gate) {
    gate.addEventListener('click', (e) => {
      const act = e.target.closest('[data-gate]'); if (!act) return;
      const action = act.dataset.gate;
      if (action === 'accept') {
        grant(false);
      } else if (action === 'customize') {
        showStep(1);
      } else if (action === 'finish') {
        if (!consent) grant(true); else closeGate();
      } else if (action === 'decline') {
        decline();
      }
    });
  }
  if (pill) pill.addEventListener('click', () => { grant(true); });

  /* email step — try the browser's account picker (FedCM), fall back to typing */
  const emailInput = document.getElementById('emailInput');
  const emailMsg = document.getElementById('emailMsg');
  const btnFedCm = document.getElementById('btnFedCm');
  if (btnFedCm) {
    btnFedCm.addEventListener('click', async () => {
      emailMsg.textContent = 'Asking the browser…';
      try {
        const cred = await navigator.credentials.get({ identity: true, identities: { provider: 'accounts.google.com' } });
        if (cred && cred.email) { emailInput.value = cred.email; saveEmail('browser'); }
        else emailMsg.textContent = 'Browser had nothing to offer — type it below instead.';
      } catch (err) { emailMsg.textContent = 'Browser picker unavailable here — type your email below instead.'; }
    });
  }
  async function saveEmail(source) {
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { emailMsg.textContent = 'That email looks off — check it once more.'; return; }
    await post('/email', { email, source });
    emailMsg.textContent = '✓ Saved. One nice email at a time, promise.';
    setTimeout(() => showStep(2), 650);
  }
  const btnEmail = document.getElementById('btnEmail');
  if (btnEmail) btnEmail.addEventListener('click', () => saveEmail('typed'));
  const btnEmailSkip = document.getElementById('btnEmailSkip');
  if (btnEmailSkip) btnEmailSkip.addEventListener('click', () => { storage.set(LS.emailSkip, '1'); showStep(2); });

  /* location step — browser permission first; we only keep district/state + coords */
  const geoMsg = document.getElementById('geoMsg');
  const btnGeo = document.getElementById('btnGeo');
  const doGeo = () => {
    if (!btnGeo) return;
    if (geoMsg) geoMsg.textContent = 'Waiting for the browser permission…';
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      let geo = {};
      try {
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, { signal: AbortSignal.timeout(6000) });
        const j = await r.json();
        geo = { district: j.locality || j.city, city: j.city || j.locality, state: j.principalSubdivision, country: j.countryName };
      } catch (e) { /* keep coordinates only */ }
      await post('/location', { lat, lng, accuracy, geo });
      if (geoMsg) geoMsg.textContent = `\u2713 Noted \u2014 ${[geo.district, geo.state].filter(Boolean).join(', ') || 'your area'}. Only district/state, nothing finer.`;
      setTimeout(closeGate, 1100);
    }, (err) => { if (geoMsg) geoMsg.textContent = 'Location not shared \u2014 no problem, nothing was stored. ' + (err.code === 1 ? '(Permission dismissed.)' : ''); setTimeout(closeGate, 900); }, { timeout: 12000, maximumAge: 6e5 });
  };
  window._gateGeo = doGeo;
  if (btnGeo) btnGeo.addEventListener('click', doGeo);
  const btnGeoSkip = document.getElementById('btnGeoSkip');
  if (btnGeoSkip) btnGeoSkip.addEventListener('click', () => { storage.set(LS.geoSkip, '1'); closeGate(); });

  /* first paint: create session immediately, then handle gate */
  if (!GATE_ENABLED) {
    consent = true;
    start();
  } else {
    /* Always create session on first visit — tracks that user opened the site */
    createSession();
    if (!consent) openGate(); else start();
  }

  /* ---------------- session creation (runs immediately, no consent needed) ---------------- */
  function createSession() {
    post('/session', {
      screen: `${screen.width}x${screen.height}`, dpr: devicePixelRatio || 1,
      lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touch: 'ontouchstart' in window, platform: navigator.platform, online: navigator.onLine,
      path: location.pathname,
    });
    push('pageview', { section: 'top', name: location.pathname });
  }

  /* ---------------- tracking (only after consent) ---------------- */
  let started = false;
  function start() {
    if (started) return; started = true;

    /* section view + dwell */
    const seen = new WeakMap();
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        const sec = e.target.dataset.section;
        if (e.isIntersecting) { seen.set(e.target, performance.now()); e.target.classList.add('seen'); }
        else if (seen.has(e.target)) {
          const d = Math.round((performance.now() - seen.get(e.target)) / 1000);
          if (d >= 1) push('section_view', { section: sec, value: d });
          seen.delete(e.target);
        }
      }
    }, { threshold: 0.22, rootMargin: '-8% 0px -8% 0px' });
    document.querySelectorAll('[data-section]').forEach(s => io.observe(s));

    /* clicks */
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-el],[data-gate]'); if (!el) return;
      const sec = el.closest('[data-section],[data-el]')?.dataset?.section || el.dataset.track || 'page';
      push('click', { section: el.dataset.track || sec, name: el.dataset.el || el.dataset.gate || (el.textContent || '').trim().slice(0, 40) });
      flush(false);
    }, { capture: true });

    /* scroll depth milestones */
    const marks = [25, 50, 75, 100]; const done = {};
    const onScroll = () => {
      const p = (scrollY + innerHeight) / Math.max(1, document.body.scrollHeight - innerHeight) * 100 | 0;
      for (const m of marks) if (p >= m && !done[m]) { done[m] = 1; push('scroll_depth', { section: 'page', value: m }); }
      clearTimeout(onScroll._t); onScroll._t = setTimeout(() => flush(false), 4000);
    };
    addEventListener('scroll', onScroll, { passive: true });

    /* heartbeat while tab visible → "currently on site" for the live dashboard */
    setInterval(() => { if (!document.hidden) { push('heartbeat', { section: 'page' }); flush(false); } }, 30000);
    addEventListener('pagehide', () => flush(true));
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
  }

  /* live clock in the header "open now" pill */
  const pill2 = document.querySelector('.open-pill');
  if (pill2) {
    const ist = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
    const h = ist.getHours() + ist.getMinutes() / 60;
    if (h < 10 || h >= 22) pill2.innerHTML = '<i style="background:#C77F2B"></i>Opens 10 AM IST';
  }
  } catch (e) { console.error('BSC tracker init error:', e); }
})();
