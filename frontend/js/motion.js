/* BSC motion — core scroll choreography.
   Uses vendored GSAP+ScrollTrigger when present; every feature degrades gracefully.
   DUPLICATED features (hero parallax, counters, identity wave, magnetic buttons,
   parallax images, headline rise, velocity skew, heritage scroll) live in
   motion-enhance.js — this file handles only the basics. */
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

  /* ---------- 3b. (leadership flip cards now handled by about-board.js) ---------- */

  /* ---------- 4. hero h1 letter-spacing on scroll ---------- */
  if (G && ST && !RM) {
    ST.create({ trigger: '.hero h1', start: 'top 85%', scrub: .6,
      onUpdate: s => { const h = $('.hero h1'); if (h) h.style.letterSpacing = (-.015 + s.progress * .02) + 'em'; } });
  }

  /* ---------- 5. tilt cards (3D pointer tilt w/ anime overshoot) ---------- */
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

  /* ---------- 6. reading-progress bar ---------- */
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

})();
