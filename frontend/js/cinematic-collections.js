/* ═══════════════════════════════════════════════════════════
   BSC Cinematic Collection Scroll — FULL REWRITE
   GSAP ScrollTrigger-driven 3D catalogue experience
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (!G || !ST) { console.warn('GSAP/ScrollTrigger missing'); return; }
  G.registerPlugin(ST);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const isMobile = innerWidth < 768;
  const collections = window.BSC_COLLECTIONS || [];
  if (!collections.length) { console.warn('No collections data'); return; }

  /* ── helpers ── */
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ═══════════════════════════════════════════════════════
     1. BUILD THE SECTION
     ═══════════════════════════════════════════════════════ */
  const section = document.createElement('section');
  section.id = 'cinematic-collections';
  section.className = 'cc';
  section.setAttribute('data-section', 'cinematic-collections');

  section.innerHTML = `
    <div class="cc-wrap">

      <div class="cc-header">
        <span class="kicker">FROM THE BSC DATABASE · LIVE DIRECTORY</span>
        <h2 class="cc-header__title">EVERY AISLE, EVERY OCCASION</h2>
        <p class="cc-header__sub">Served from our own catalogue database — the same data our floors run on.</p>
      </div>

      <div class="cc-progress" aria-hidden="true">
        <span class="cc-progress__num">01</span>
        <span class="cc-progress__sep">/</span>
        <span class="cc-progress__total">${String(collections.length).padStart(2, '0')}</span>
        <div class="cc-progress__bar"><div class="cc-progress__fill"></div></div>
      </div>

      <div class="cc-track">
        ${collections.map((c, i) => `
          <article class="cc-item" data-dir="${c.direction}" data-idx="${i}" style="--acc:${c.accent}">
            <div class="cc-item__bg"></div>
            <div class="cc-item__floaters" aria-hidden="true">
              ${(c.floaters || []).map((f, fi) => `
                <div class="cc-fl cc-fl--${f}" data-spd="${0.3 + fi * 0.15}">
                  <div class="cc-fl__shape"></div>
                </div>
              `).join('')}
            </div>
            <div class="cc-item__img">
              <img src="${c.image}" alt="${c.title}" loading="lazy" decoding="async">
              <div class="cc-item__img-shadow"></div>
            </div>
            <div class="cc-item__txt">
              <span class="cc-item__kicker">${c.kicker}</span>
              <h3 class="cc-item__title">${c.title}</h3>
              <p class="cc-item__desc">${c.description}</p>
              <a class="cc-item__cta" href="#${c.id}" data-track="cinematic" data-el="${c.id}">${c.cta}</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  /* ── Replace old collections section ── */
  const oldCollections = document.querySelector('.collections');
  if (oldCollections) {
    oldCollections.style.display = 'none';
  }

  /* Insert after hero marquee area, before stores */
  const insertTarget = document.querySelector('.stores') || document.querySelector('.foot') || document.querySelector('footer');
  if (insertTarget) {
    insertTarget.parentNode.insertBefore(section, insertTarget);
  } else {
    document.body.appendChild(section);
  }

  /* ═══════════════════════════════════════════════════════
     2. HEADER ANIMATION
     ═══════════════════════════════════════════════════════ */
  const headerEl = section.querySelector('.cc-header');
  G.fromTo(headerEl,
    { opacity: 0, y: 80, rotateX: -15, transformPerspective: 900, transformOrigin: '50% 100%' },
    {
      opacity: 1, y: 0, rotateX: 0,
      ease: 'power3.out', duration: 1.2,
      scrollTrigger: {
        trigger: headerEl,
        start: 'top 90%',
        end: 'top 35%',
        toggleActions: 'play none none reverse',
      }
    }
  );

  /* ═══════════════════════════════════════════════════════
     3. EACH COLLECTION — 3-PHASE SCROLL ANIMATION
        Phase A: ENTER  (top-bottom → top-20%)
        Phase B: SETTLE (top-20% → center)
        Phase C: EXIT   (center → bottom-20%)
     ═══════════════════════════════════════════════════════ */
  const items = section.querySelectorAll('.cc-item');
  const total = items.length;

  items.forEach((item, i) => {
    const dir = item.dataset.dir;
    const isL = dir === 'left';
    const img = item.querySelector('.cc-item__img');
    const txt = item.querySelector('.cc-item__txt');
    const fls = item.querySelectorAll('.cc-fl');
    const bg = item.querySelector('.cc-item__bg');

    /* ── Phase A: ENTER ── */
    const enterTl = G.timeline({
      scrollTrigger: {
        trigger: item,
        start: 'top bottom',
        end: 'top 20%',
        scrub: 0.6,
        invalidateOnRefresh: true,
      }
    });

    /* Image: from far side → near side */
    enterTl.fromTo(img, {
      x: isL ? '-100vw' : '100vw',
      z: -500,
      rotationY: isL ? -20 : 20,
      scale: 0.65,
      opacity: 0,
    }, {
      x: isL ? '-12%' : '12%',
      z: -80,
      rotationY: isL ? -4 : 4,
      scale: 0.92,
      opacity: 1,
      ease: 'none',
    }, 0);

    /* Text: from opposite side */
    enterTl.fromTo(txt, {
      x: isL ? '70vw' : '-70vw',
      z: -300,
      opacity: 0,
      rotationY: isL ? 10 : -10,
    }, {
      x: isL ? '5%' : '-5%',
      z: -40,
      opacity: 1,
      rotationY: 0,
      ease: 'none',
    }, 0.05);

    /* Floaters */
    fls.forEach((fl, fi) => {
      enterTl.fromTo(fl, {
        x: isL ? -250 - fi * 100 : 250 + fi * 100,
        y: -80 + fi * 50,
        z: -200 - fi * 60,
        scale: 0.3,
        opacity: 0,
        rotation: isL ? -40 - fi * 20 : 40 + fi * 20,
      }, {
        x: isL ? -40 - fi * 70 : 40 + fi * 70,
        y: -30 + fi * 35,
        z: -60 - fi * 25,
        scale: 0.55 + fi * 0.1,
        opacity: 0.3,
        rotation: isL ? -8 - fi * 6 : 8 + fi * 6,
        ease: 'none',
      }, 0.08);
    });

    /* BG */
    enterTl.fromTo(bg, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0);

    /* ── Phase B: SETTLE (dominant) ── */
    const settleTl = G.timeline({
      scrollTrigger: {
        trigger: item,
        start: 'top 20%',
        end: 'center center',
        scrub: 0.5,
        invalidateOnRefresh: true,
      }
    });

    settleTl.to(img, {
      x: '0%', z: 60, scale: 1.04, rotationY: 0,
      ease: 'none',
    }, 0);

    settleTl.to(txt, {
      x: '0%', z: 40,
      ease: 'none',
    }, 0);

    settleTl.to(fls, {
      opacity: 0.4,
      ease: 'none',
    }, 0);

    /* ── Phase C: EXIT ── */
    const exitTl = G.timeline({
      scrollTrigger: {
        trigger: item,
        start: 'bottom 65%',
        end: 'bottom 5%',
        scrub: 0.7,
        invalidateOnRefresh: true,
      }
    });

    exitTl.to(img, {
      x: isL ? '35%' : '-35%',
      z: -450,
      scale: 0.75,
      rotationY: isL ? 14 : -14,
      opacity: 0.08,
      ease: 'none',
    }, 0);

    exitTl.to(txt, {
      x: isL ? '-50vw' : '50vw',
      z: -200,
      opacity: 0,
      ease: 'none',
    }, 0);

    exitTl.to(fls, {
      opacity: 0, scale: 0.2,
      ease: 'none',
    }, 0);

    exitTl.to(bg, {
      opacity: 0,
      ease: 'none',
    }, 0);

    /* ── Floaters continuous parallax ── */
    fls.forEach(fl => {
      const spd = parseFloat(fl.dataset.spd) || 0.4;
      G.to(fl, {
        y: `+=${80 * spd}`,
        rotation: `+=${20 * spd}`,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    });

    /* ── Image internal parallax ── */
    const imgEl = item.querySelector('.cc-item__img img');
    if (imgEl) {
      G.fromTo(imgEl,
        { yPercent: 10, scale: 1.15 },
        {
          yPercent: -10, scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );
    }
  });

  /* ═══════════════════════════════════════════════════════
     4. PROGRESS INDICATOR
     ═══════════════════════════════════════════════════════ */
  const pNum = section.querySelector('.cc-progress__num');
  const pFill = section.querySelector('.cc-progress__fill');
  const pEl = section.querySelector('.cc-progress');

  ST.create({
    trigger: section,
    start: 'top 15%',
    end: 'bottom 15%',
    onEnter: () => pEl.classList.add('visible'),
    onLeave: () => pEl.classList.remove('visible'),
    onEnterBack: () => pEl.classList.add('visible'),
    onLeaveBack: () => pEl.classList.remove('visible'),
  });

  ST.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: self => {
      const p = self.progress;
      const idx = Math.min(total - 1, Math.floor(p * total));
      pNum.textContent = String(idx + 1).padStart(2, '0');
      pFill.style.transform = `scaleY(${p})`;
    }
  });

  /* ═══════════════════════════════════════════════════════
     5. DESKTOP HOVER TILT
     ═══════════════════════════════════════════════════════ */
  if (fine && !RM && !isMobile) {
    items.forEach(item => {
      const wrap = item.querySelector('.cc-item__img');
      let tx = 0, ty = 0, cx = 0, cy = 0, active = false;

      wrap.addEventListener('pointerenter', () => { active = true; tick(); });
      wrap.addEventListener('pointermove', e => {
        const r = wrap.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      wrap.addEventListener('pointerleave', () => {
        active = false;
        G.to(wrap, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,0.4)', overwrite: true });
      });

      function tick() {
        cx = lerp(cx, tx, 0.07);
        cy = lerp(cy, ty, 0.07);
        if (!active && Math.abs(cx) < 0.003 && Math.abs(cy) < 0.003) return;
        wrap.style.transform = `perspective(1200px) rotateX(${-cy * 5}deg) rotateY(${cx * 7}deg) translateZ(10px)`;
        requestAnimationFrame(tick);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
     6. REFRESH AFTER IMAGES LOAD
     ═══════════════════════════════════════════════════════ */
  let done = false;
  const refresh = () => { if (!done) { done = true; ST.refresh(); } };
  const imgs = section.querySelectorAll('img');
  let loaded = 0;
  const totalImgs = imgs.length;
  if (totalImgs === 0) { setTimeout(refresh, 800); return; }
  imgs.forEach(img => {
    if (img.complete) { loaded++; if (loaded >= totalImgs) refresh(); }
    else {
      img.addEventListener('load', () => { loaded++; if (loaded >= totalImgs) refresh(); });
      img.addEventListener('error', () => { loaded++; if (loaded >= totalImgs) refresh(); });
    }
  });
  setTimeout(refresh, 3000);

})();
