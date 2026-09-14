/* BSC motion — "anime action" scroll choreography.
   Uses vendored GSAP+ScrollTrigger when present; every feature degrades gracefully. */
(function () {
  'use strict';
  const G = window.gsap || null;
  const ST = window.ScrollTrigger || null;
  if (G && ST) G.registerPlugin(ST);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* global scroll progress shared with the 3D hero */
  let progress = 0;
  const updateProgress = () => {
    progress = Math.min(1, Math.max(0, scrollY / Math.max(1, innerHeight * 2.4)));
    window.__bsc = window.__bsc || {}; window.__bsc.heroProgress = progress;
  };
  addEventListener('scroll', updateProgress, { passive: true }); updateProgress();

  /* ---------- 1. hero intro (line-mask rise) ---------- */
  const h1 = $('.hero h1');
  if (h1) requestAnimationFrame(() => setTimeout(() => h1.classList.add('lit'), 60));

  /* ---------- 2. header behaviour ---------- */
  const head = $('#header');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    head.classList.toggle('stuck', y > 24);
    head.classList.toggle('hide', y > 420 && y > lastY + 6 && !document.getElementById('nav').classList.contains('open'));
    lastY = y;
  }, { passive: true });
  const burger = $('#burger'), nav = $('#nav');
  if (burger) burger.addEventListener('click', () => nav.classList.toggle('open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- 3. section reveals ---------- */
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); }
  }, { threshold: .12 });
  $$('[data-section],.prop').forEach(s => io.observe(s));
  /* late-added sections (DB directory injected after fetch) get observed too */
  const watch = new MutationObserver((ms) => {
    for (const m of ms) for (const n of m.addedNodes)
      if (n.nodeType === 1) (n.matches?.('[data-section]') ? [n] : [...(n.querySelectorAll?.('[data-section]') || [])])
        .forEach(s => io.observe(s));
  });
  watch.observe(document.body, { childList: true, subtree: true });

  /* ---------- 3b. leadership flip cards — tap / Enter toggles the photo side ---------- */
  $$('.ld-card.flip').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flipped'); }
    });
  });

  /* ---------- 4. hero parallax + canvas breathing ---------- */
  if (G && ST && !RM) {
    ST.create({
      trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: self => {
        const p = self.progress;
        const inner = $('.hero-inner');
        inner.style.transform = `translateY(${-p * 120}px) scale(${1 - p * 0.06})`;
        inner.style.opacity = String(Math.max(0, 1 - p * 1.35));
      }
    });
    ST.create({ trigger: '.hero h1', start: 'top 85%', scrub: .6,
      onUpdate: s => { $('.hero h1').style.letterSpacing = (-.015 + s.progress * .02) + 'em'; } });
  }

  /* ---------- 5. heritage rail — pinned horizontal (desktop) + wheel (else) ---------- */
  const heritage = $('.heritage'), rail = $('#hScroll');
  if (heritage && rail) {
    let pinned = false;
    if (G && ST && !RM && innerWidth >= 1100) {
      const tw = () => rail.scrollWidth - heritage.clientWidth + 40;
      G.set(rail, { x: 0 });
      ST.create({
        trigger: heritage, start: 'top 12%', end: () => '+=' + tw(),
        pin: true, scrub: .9, anticipatePin: 1, invalidateOnRefresh: true,
        animation: G.to(rail, { x: () => -tw(), ease: 'none' }),
        onToggle: s => { pinned = s.isActive; },
      });
    } else if (fine) {
      heritage.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const max = rail.scrollWidth - rail.clientWidth;
          const next = Math.min(max, Math.max(0, rail.scrollLeft + e.deltaY * 1.15));
          if (next > 0 && next < max) e.preventDefault();
          rail.scrollLeft = next;
        }
      }, { passive: false });
    }
  }

  /* ---------- 6. tilt cards (3D pointer tilt w/ anime overshoot) ---------- */
  if (fine && !RM) {
    $$('.tilt').forEach(el => {
      let raf = null, tx = 0, ty = 0, cx = 0, cy = 0, active = false;
      el.style.transformStyle = 'preserve-3d'; el.style.perspective = '900px';
      el.addEventListener('pointerenter', () => { active = true; loop(); });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * 2;
        ty = ((e.clientY - r.top) / r.height - .5) * 2;
      });
      el.addEventListener('pointerleave', () => {
        active = false;
        if (G) G.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: .9, ease: 'back.out(2.4)', overwrite: true, onUpdate: null });
        el.style.transform = '';
      });
      function loop() {
        cx = lerp(cx, tx, .12); cy = lerp(cy, ty, .12);
        if (!active && Math.abs(cx) < .002 && Math.abs(cy) < .002) { raf = null; return; }
        el.style.transform = `perspective(900px) rotateX(${-cy * 5}deg) rotateY(${cx * 7}deg) translateZ(6px)`;
        raf = requestAnimationFrame(loop);
      }
    });
  }

  /* ---------- 7. counters ---------- */
  $$('.count').forEach(el => {
    const to = parseFloat(el.dataset.to), suf = el.dataset.suffix || '';
    const fmt = (n) => {
      let s = Math.round(n).toLocaleString('en-IN');
      if (to === 3 && suf === ',00,000') s = '3,00,000';
      return s + suf;
    };
    if (RM) { el.textContent = fmt(to); return; }
    const ob = new IntersectionObserver((es) => {
      if (!es.some(e => e.isIntersecting)) return; ob.disconnect();
      const t0 = performance.now(), D = 1400;
      (function tick(t) {
        const p = Math.min(1, (t - t0) / D);
        const eased = 1 - Math.pow(1 - p, 4) + Math.sin(p * Math.PI * 3) * .012 * (1 - p); /* subtle anime wobble */
        el.textContent = fmt(to * Math.min(1, eased));
        if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(to);
      })(t0);
    }, { threshold: .6 });
    ob.observe(el);
  });

  /* ---------- 8. identity wave canvas (logo curves, alive) ---------- */
  const wave = $('#idWave');
  if (wave) {
    const ctx = wave.getContext('2d');
    const W = wave.width, H = wave.height;
    let seen = false;
    new IntersectionObserver(e => seen = e[0].isIntersecting, { threshold: .1 }).observe(wave);
    const curve = (t, ph, amp, col, wid) => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const u = x / W;
        const y = H / 2 + Math.sin(u * 3.1 + t + ph) * amp * Math.sin(u * Math.PI)
          + Math.sin(u * 7.3 - t * 1.4) * amp * .22;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = col; ctx.lineWidth = wid; ctx.lineCap = 'round';
      ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
    };
    (function draw(t) {
      requestAnimationFrame(draw);
      if (!seen) return;
      ctx.clearRect(0, 0, W, H);
      const s = t * .001;
      curve(s, 0, 44, 'rgba(202,33,37,.95)', 5);
      curve(s * .8, 1.4, 30, 'rgba(255,255,255,.75)', 3);
      curve(s * .65, 2.6, 20, 'rgba(199,127,43,.8)', 2.2);
    })(0);
  }

  /* ---------- 9. magnetic primary buttons ---------- */
  if (fine && !RM) $$('.btn-red,.btn-navy,.btn-paper').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .14}px,${(e.clientY - r.top - r.height / 2) * .22}px)`;
    });
    b.addEventListener('pointerleave', () => { if (G) G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }); else b.style.transform = ''; });
  });

  /* ---------- 11. full-page scroll layer: progress bar + parallax + velocity skew ---------- */
  /* (a) reading-progress bar — framework-free, always on */
  const bar = document.createElement('div');
  bar.className = 'scroll-bar'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let barTick = false;
  const setBar = () => {
    barTick = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', () => { if (!barTick) { barTick = true; requestAnimationFrame(setBar); } }, { passive: true });
  addEventListener('resize', setBar); setBar();

  if (G && ST && !RM) {
    document.documentElement.classList.add('fx-on');
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));

    /* (b) depth parallax — imagery drifts against the scroll while its section passes */
    const parallax = (target, trigger, amt, scaled) => {
      if (!target) return;
      G.fromTo(target,
        { yPercent: -amt, ...(scaled ? { scale: 1.12 } : {}) },
        { yPercent: amt, ...(scaled ? { scale: 1.12 } : {}), ease: 'none',
          scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    };
    $$('.c-photo').forEach(img => parallax(img, img.closest('.c-card'), 6, true));
    parallax('.stats-art img', '.stats', 7, true);
    parallax('#idWave', '.identity', 6, false);
    parallax('.wed-art svg', '.wed', 6, false);

    /* (d) 3D headline rise — every section title lands with a perspective flip */
    $$('.sec-head').forEach(head => {
      const h2 = head.querySelector('h2');
      if (!h2) return;
      G.fromTo(h2,
        { rotateX: -14, y: 46, transformPerspective: 900, transformOrigin: '50% 100%' },
        { rotateX: 0, y: 0, ease: 'none',
          scrollTrigger: { trigger: head, start: 'top 92%', end: 'top 45%', scrub: .5 } });
    });
    G.fromTo('.visit h2',
      { rotateX: -32, scale: .9, transformPerspective: 900, transformOrigin: '50% 100%' },
      { rotateX: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.visit', start: 'top 90%', end: 'top 30%', scrub: .5 } });

    /* (c) scroll-velocity skew on the card walls — anime-style lean, damped to rest */
    if (fine && innerWidth >= 900) {
      $$('.c-grid,.st-grid,.ld-grid,.sv-grid,.b-grid,.hls,.aisles').forEach(grid => {
        const lean = G.quickTo(grid, 'skewY', { duration: .55, ease: 'power3.out' });
        ST.create({
          trigger: grid.closest('[data-section]') || grid,
          start: 'top bottom', end: 'bottom top',
          onUpdate: self => lean(clamp(self.getVelocity() / -400, 1.5)),
          onLeave: () => lean(0), onLeaveBack: () => lean(0)
        });
      });
    }
  }

  /* Hero watchdog removed as the flag effect is intentionally disabled. */
})();
