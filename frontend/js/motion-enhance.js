/* ═══════════════════════════════════════════════════════════
   BSC MOTION ENHANCE — Full-page animated experience
   Cursor follow · Scroll reveals · 3D depth · Parallax
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (!G || !ST) return;
  G.registerPlugin(ST);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  if (RM) return;

  /* ═══════════════════════════════════════════════════════
     1. GLOBAL CURSOR GLOW
     ═══════════════════════════════════════════════════════ */
  if (fine) {
    const glow = document.createElement('div');
    glow.className = 'bsc-cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function tick() {
      cx = lerp(cx, mx, 0.1);
      cy = lerp(cy, my, 0.1);
      glow.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
      requestAnimationFrame(tick);
    })();
  }

  /* ═══════════════════════════════════════════════════════
     2. SCROLL-LINKED REVEALS — every section
     ═══════════════════════════════════════════════════════ */
  const revealSections = $$('[data-section]');
  revealSections.forEach(sec => {
    /* Section title */
    const h2 = sec.querySelector('h2');
    if (h2 && !h2.closest('.cc-header')) {
      G.fromTo(h2,
        { opacity: 0, y: 50, rotateX: -10, transformPerspective: 800, transformOrigin: '50% 100%' },
        {
          opacity: 1, y: 0, rotateX: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: h2,
            start: 'top 88%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    /* Kicker text */
    const kickers = sec.querySelectorAll('.kicker');
    kickers.forEach(k => {
      G.fromTo(k,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: k,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    /* Cards / tiles with stagger */
    const cards = sec.querySelectorAll('.c-card, .h-card, .b-tile, .st-card, .sv, .ld-card, .hl, .aisle');
    if (cards.length) {
      G.fromTo(cards,
        { opacity: 0, y: 40, rotateX: -6, transformPerspective: 900, transformOrigin: '50% 0%' },
        {
          opacity: 1, y: 0, rotateX: 0,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: cards[0].closest('.c-grid, .b-grid, .st-grid, .sv-grid, .ld-grid, .hls, .aisles') || cards[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }
  });

  /* ═══════════════════════════════════════════════════════
     3. HERO PARALLAX — enhanced depth
     ═══════════════════════════════════════════════════════ */
  const heroInner = $('.hero-inner');
  if (heroInner) {
    ST.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: self => {
        const p = self.progress;
        heroInner.style.transform = `translateY(${-p * 140}px) scale(${1 - p * 0.08})`;
        heroInner.style.opacity = String(Math.max(0, 1 - p * 1.4));
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     4. STATS COUNTER — animated count-up
     ═══════════════════════════════════════════════════════ */
  $$('.count').forEach(el => {
    const to = parseFloat(el.dataset.to);
    const suf = el.dataset.suffix || '';
    if (!to) return;
    const fmt = n => Math.round(n).toLocaleString('en-IN') + suf;
    const ob = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      ob.disconnect();
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min(1, (t - t0) / 1400);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(to * e);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(to);
      })(t0);
    }, { threshold: 0.6 });
    ob.observe(el);
  });

  /* ═══════════════════════════════════════════════════════
     5. PARALLAX IMAGES — depth layers
     ═══════════════════════════════════════════════════════ */
  const parallaxImg = (target, trigger, amt) => {
    if (!target) return;
    G.fromTo(target,
      { yPercent: -amt, scale: 1.12 },
      {
        yPercent: amt, scale: 1.12,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        }
      }
    );
  };

  $$('.c-photo').forEach(img => parallaxImg(img, img.closest('.c-card'), 6));
  parallaxImg('.stats-art img', '.stats', 7);
  parallaxImg('#idWave', '.identity', 6);
  parallaxImg('.wed-art svg', '.wed', 6);

  /* ═══════════════════════════════════════════════════════
     6. 3D HEADLINE RISE — perspective flip
     ═══════════════════════════════════════════════════════ */
  $$('.sec-head').forEach(head => {
    const h2 = head.querySelector('h2');
    if (!h2 || h2.closest('.cc-header')) return;
    G.fromTo(h2,
      { rotateX: -14, y: 46, transformPerspective: 900, transformOrigin: '50% 100%' },
      {
        rotateX: 0, y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: head,
          start: 'top 92%',
          end: 'top 45%',
          scrub: 0.5,
        }
      }
    );
  });

  /* ═══════════════════════════════════════════════════════
     7. VISIT CTA — dramatic entrance
     ═══════════════════════════════════════════════════════ */
  const visitH2 = $('.visit h2');
  if (visitH2) {
    G.fromTo(visitH2,
      { rotateX: -30, scale: 0.88, transformPerspective: 900, transformOrigin: '50% 100%' },
      {
        rotateX: 0, scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.visit',
          start: 'top 85%',
          end: 'top 25%',
          scrub: 0.5,
        }
      }
    );
  }

  /* ═══════════════════════════════════════════════════════
     8. SCROLL VELOCITY SKEW — anime lean
     ═══════════════════════════════════════════════════════ */
  if (fine && innerWidth >= 900) {
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    $$('.c-grid, .st-grid, .ld-grid, .sv-grid, .b-grid, .hls, .aisles').forEach(grid => {
      const lean = G.quickTo(grid, 'skewY', { duration: 0.55, ease: 'power3.out' });
      ST.create({
        trigger: grid.closest('[data-section]') || grid,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: self => lean(clamp(self.getVelocity() / -400, 1.5)),
        onLeave: () => lean(0),
        onLeaveBack: () => lean(0),
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     9. COLLECTIONS — image hover magnetic pull
     ═══════════════════════════════════════════════════════ */
  if (fine) {
    $$('.c-card').forEach(card => {
      const img = card.querySelector('.c-photo');
      if (!img) return;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `scale(1.06) translate(${x * -10}px, ${y * -10}px)`;
      });
      card.addEventListener('pointerleave', () => {
        img.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     10. HERITAGE HORIZONTAL SCROLL
     ═══════════════════════════════════════════════════════ */
  const heritage = $('.heritage');
  const rail = $('#hScroll');
  if (heritage && rail && innerWidth >= 1100) {
    const tw = () => rail.scrollWidth - heritage.clientWidth + 40;
    G.set(rail, { x: 0 });
    ST.create({
      trigger: heritage,
      start: 'top 12%',
      end: () => '+=' + tw(),
      pin: true,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: G.to(rail, { x: () => -tw(), ease: 'none' }),
    });
  }

  /* ═══════════════════════════════════════════════════════
     11. FOOTER REVEAL
     ═══════════════════════════════════════════════════════ */
  const footGrid = $('.foot-grid');
  if (footGrid) {
    const cols = footGrid.children;
    G.fromTo(cols,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footGrid,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }

  /* ═══════════════════════════════════════════════════════
     12. BRAND TILE — entrance animation
     ═══════════════════════════════════════════════════════ */
  $$('.b-tile').forEach((tile, i) => {
    G.fromTo(tile,
      { opacity: 0, y: 30, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: tile,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });

  /* ═══════════════════════════════════════════════════════
     13. WEDDING SECTION — dramatic reveal
     ═══════════════════════════════════════════════════════ */
  const wedArt = $('.wed-art');
  if (wedArt) {
    G.fromTo(wedArt,
      { opacity: 0, x: -60, rotateY: -8, transformPerspective: 1000 },
      {
        opacity: 1, x: 0, rotateY: 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.wed',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  }

  /* ═══════════════════════════════════════════════════════
     14. AISLES — circular entrance
     ═══════════════════════════════════════════════════════ */
  $$('.aisle').forEach((a, i) => {
    G.fromTo(a,
      { opacity: 0, scale: 0.7, rotation: -10 + i * 3 },
      {
        opacity: 1, scale: 1, rotation: 0,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: a.closest('.aisles'),
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });

  /* ═══════════════════════════════════════════════════════
     15. LEADERSHIP — staggered rise
     ═══════════════════════════════════════════════════════ */
  $$('.ld-card').forEach((card, i) => {
    G.fromTo(card,
      { opacity: 0, y: 50, rotateX: -8, transformPerspective: 1000, transformOrigin: '50% 0%' },
      {
        opacity: 1, y: 0, rotateX: 0,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });

  /* ═══════════════════════════════════════════════════════
     16. IDENTITY WAVE — alive canvas
     ═══════════════════════════════════════════════════════ */
  const wave = $('#idWave');
  if (wave) {
    const ctx = wave.getContext('2d');
    const W = wave.width, H = wave.height;
    let seen = false;
    new IntersectionObserver(e => seen = e[0].isIntersecting, { threshold: 0.1 }).observe(wave);

    const curve = (t, ph, amp, col, wid) => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const u = x / W;
        const y = H / 2 + Math.sin(u * 3.1 + t + ph) * amp * Math.sin(u * Math.PI)
          + Math.sin(u * 7.3 - t * 1.4) * amp * 0.22;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = wid;
      ctx.lineCap = 'round';
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    (function draw(t) {
      requestAnimationFrame(draw);
      if (!seen) return;
      ctx.clearRect(0, 0, W, H);
      const s = t * 0.001;
      curve(s, 0, 44, 'rgba(202,33,37,.95)', 5);
      curve(s * 0.8, 1.4, 30, 'rgba(255,255,255,.75)', 3);
      curve(s * 0.65, 2.6, 20, 'rgba(199,127,43,.8)', 2.2);
    })(0);
  }

  /* ═══════════════════════════════════════════════════════
     17. MAGNETIC BUTTONS
     ═══════════════════════════════════════════════════════ */
  if (fine) {
    $$('.btn-red, .btn-navy, .btn-paper').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.14}px,${(e.clientY - r.top - r.height / 2) * 0.22}px)`;
      });
      b.addEventListener('pointerleave', () => {
        G.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

})();
