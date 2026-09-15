/* ═══════════════════════════════════════════════════════════
   BSC About & Board of Directors
   Comprehensive company profile + expandable director cards
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (!G || !ST) return;
  G.registerPlugin(ST);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;

  /* ═══════════════════════════════════════════════════════
     BOARD OF DIRECTORS DATA
     ═══════════════════════════════════════════════════════ */
  const directors = [
    {
      name: "Mr. Umapathy Bankapur",
      initials: "UB",
      role: "Founder & Director",
      generation: "2nd Generation",
      photo: "/assets/img/leader-umapathy.png",
      color: "navy",
      experience: "50+ years",
      education: "Commerce background, Davanagere",
      joinedYear: "1965",
      bio: "Mr. Umapathy Bankapur is the foundational pillar of BSC Textiles. Taking over from his father, he transformed a modest Davanagere store into a trusted name across Karnataka. His unwavering commitment to quality, fair pricing and genuine customer care established the values that BSC still stands on today. Under his guidance, BSC became synonymous with trust in the region.",
      achievements: [
        "Expanded BSC from a single store to multiple departments",
        "Established BSC's reputation for quality fabrics",
        "Introduced the 'customer-first' culture",
        "Built long-standing supplier relationships across India",
      ],
      philosophy: "Every customer who walks in should leave happier than when they came in.",
    },
    {
      name: "Mr. Chandrashekar Bankapur",
      initials: "CB",
      role: "Managing Director",
      generation: "3rd Generation",
      photo: "/assets/img/leader-chandrashekar.png",
      color: "red",
      experience: "35+ years",
      education: "Business Administration, Bangalore University",
      joinedYear: "1988",
      bio: "Mr. Chandrashekar Bankapur took BSC from a regional favourite to a multi-city fashion destination. He spearheaded the expansion into Belagavi and Shivamogga, modernised operations, and introduced professional management practices while preserving the family values that define the brand. His strategic vision has been instrumental in scaling BSC's operations.",
      achievements: [
        "Opened BSC Belagavi and Shivamogga showrooms",
        "Grew retail footprint to 3,00,000+ sq ft",
        "Modernised supply chain and inventory systems",
        "Grew employee base to 1,300+ across 3 cities",
      ],
      philosophy: "Growth should never come at the cost of the trust our families place in us.",
    },
    {
      name: "Mr. Ved Bankapur",
      initials: "VB",
      role: "Director — Strategy & Brand",
      generation: "5th Generation",
      photo: "/assets/img/leader-ved.png",
      color: "navy",
      experience: "8+ years",
      education: "Business & Design, London",
      joinedYear: "2018",
      bio: "Mr. Ved Bankapur represents the future of BSC. With a global education and fresh perspective, he is driving brand modernisation, digital transformation and customer experience innovation. He leads BSC's online presence, curated brand partnerships and next-generation retail concepts while deeply respecting the legacy he inherited.",
      achievements: [
        "Launched BSC's e-commerce and digital presence",
        "Introduced curated brand partnerships",
        "Modernised in-store customer experience",
        "Led the rebrand and visual identity refresh",
      ],
      philosophy: "The future of retail is personal. Every interaction should feel like family.",
    },
  ];

  /* ═══════════════════════════════════════════════════════
     REPLACE ABOUT SECTION
     ═══════════════════════════════════════════════════════ */
  const oldAbout = document.getElementById('about');
  if (oldAbout) {
    const newAbout = document.createElement('section');
    newAbout.id = 'about';
    newAbout.className = 'about-new';
    newAbout.setAttribute('data-section', 'about');
    newAbout.innerHTML = `
      <div class="abn-wrap">

        <header class="abn-hero">
          <span class="kicker">Chapter 03 · The Company</span>
          <h2 class="abn-hero__title">Built on Trust<br><em>Since 1938</em></h2>
          <p class="abn-hero__sub">For 88 years, BSC has been a trusted name woven into the lives of generations of families across Karnataka.</p>
        </header>

        <div class="abn-story">
          <div class="abn-story__col abn-story__col--lead">
            <p class="abn-lead">From a pushcart to three cities. From one family's dream to 1,300+ employees. The BSC story is one of relentless quality, genuine care and an unshakable belief that every customer deserves the very best.</p>
          </div>
          <div class="abn-story__col">
            <p>Nearly nine decades ago, BSC began with nothing more than a pushcart and a promise. Our founder travelled from village to village across Karnataka, selling clothes and carrying with him a simple but unwavering belief: <em>every customer deserves the very best in quality, service and trust.</em></p>
            <p>In 1938, that belief took root with the opening of BSC's first store in Davanagere. From those early days, the brand became known for its wide-ranging collections, the warmth and comfort customers felt with every visit, and a quality they could always rely on.</p>
          </div>
          <div class="abn-story__col">
            <p>Over the decades, BSC has evolved gracefully with changing times and customer needs. From a traditional textile store, it has grown into a thriving fashion and lifestyle destination — offering clothing, accessories, occasion shopping and home essentials for every member of the family.</p>
            <p>Today, the founding family continues to lead BSC across generations, with the 5th generation now actively shaping the future of the business — carrying forward the same values of trust, quality and genuine customer-first service that built the brand.</p>
          </div>
        </div>

        <div class="abn-timeline">
          <h3 class="abn-timeline__title">Our Journey</h3>
          <div class="abn-timeline__track">
            ${[
              { year: "1938", event: "First store opens in Davanagere", detail: "Founded with a vision to bring quality fabrics to every family." },
              { year: "1965", event: "Second generation takes the helm", detail: "Mr. Umapathy Bankapur expands operations and builds supplier networks." },
              { year: "1988", event: "Modern era begins", detail: "Mr. Chandrashekar Bankapur introduces professional management." },
              { year: "2005", event: "Belagavi showroom opens", detail: "BSC expands beyond Davanagere for the first time." },
              { year: "2018", event: "5th generation joins", detail: "Mr. Ved Bankapur brings global perspective and digital innovation." },
              { year: "2024", event: "Shivamogga showroom opens", detail: "1,50,000 sq ft — BSC's largest showroom yet." },
              { year: "2026", event: "88 years of trust", detail: "3 cities, 3,00,000+ sq ft, 1,300+ employees, 10,000+ daily footfall." },
            ].map((t, i) => `
              <div class="abn-tl-item" data-i="${i}">
                <div class="abn-tl-dot"></div>
                <div class="abn-tl-year">${t.year}</div>
                <div class="abn-tl-content">
                  <h4>${t.event}</h4>
                  <p>${t.detail}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="abn-numbers">
          <div class="abn-num">
            <span class="abn-num__val" data-to="88">0</span>
            <span class="abn-num__label">Years of Trust</span>
          </div>
          <div class="abn-num">
            <span class="abn-num__val" data-to="3">0</span>
            <span class="abn-num__label">Cities</span>
          </div>
          <div class="abn-num">
            <span class="abn-num__val" data-to="3" data-suffix=",00,000">0</span>
            <span class="abn-num__label">Sq Ft Retail</span>
          </div>
          <div class="abn-num">
            <span class="abn-num__val" data-to="1300" data-suffix="+">0</span>
            <span class="abn-num__label">Employees</span>
          </div>
          <div class="abn-num">
            <span class="abn-num__val" data-to="10000" data-suffix="+">0</span>
            <span class="abn-num__label">Daily Footfall</span>
          </div>
        </div>

        <div class="abn-values">
          <h3>Our Core Values</h3>
          <div class="abn-values__grid">
            ${[
              { icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 3L22 11L31 12.5L24.5 19L26 28L18 23.5L10 28L11.5 19L5 12.5L14 11L18 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="18" cy="18" r="5" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>', title: "Trust", desc: "88 years of keeping promises to every family that walks through our doors." },
              { icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6C18 6 8 14 8 20C8 25.5 12.5 30 18 30C23.5 30 28 25.5 28 20C28 14 18 6 18 6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 20L17 23L23 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>', title: "Quality", desc: "Every fabric, every stitch, every product — curated to the highest standards." },
              { icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 30C18 30 6 22 6 14C6 10 9 7 12.5 7C14.5 7 16.5 8 18 10C19.5 8 21.5 7 23.5 7C27 7 30 10 30 14C30 22 18 30 18 30Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>', title: "Care", desc: "We treat every customer like family. Warmth is not a policy — it's who we are." },
              { icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 30V18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 18C18 18 10 20 8 14C6 8 12 4 18 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 18C18 18 26 20 28 14C30 8 24 4 18 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 30H22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>', title: "Legacy", desc: "Five generations of learning, growing and passing on the right values." },
            ].map((v, i) => `
              <div class="abn-val-card" data-i="${i}">
                <div class="abn-val-icon">${v.icon}</div>
                <h4>${v.title}</h4>
                <p>${v.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="abn-offerings">
          <h3>What We Offer</h3>
          <div class="abn-offer-grid">
            ${[
              { cat: "Clothing", items: "Sarees · Ethnic wear · Casual · Party · Dress materials · Formal · Apparel for men, women & children" },
              { cat: "Accessories", items: "Imitation jewellery · Cosmetics · Footwear · Fashion accessories" },
              { cat: "Home & Lifestyle", items: "Home furnishing collections · Seasonal & occasion-based essentials" },
              { cat: "Services", items: "Expert tailoring for men and women · Fit-on-approval stitching" },
            ].map((o, i) => `
              <div class="abn-offer-card" data-i="${i}">
                <h4>${o.cat}</h4>
                <p>${o.items}</p>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
    oldAbout.replaceWith(newAbout);
  }

  /* ═══════════════════════════════════════════════════════
     REPLACE LEADERSHIP WITH BOARD OF DIRECTORS
     ═══════════════════════════════════════════════════════ */
  const oldLeaders = document.querySelector('.leaders');
  if (oldLeaders) {
    const newBoard = document.createElement('section');
    newBoard.id = 'board';
    newBoard.className = 'board';
    newBoard.setAttribute('data-section', 'board');
    newBoard.innerHTML = `
      <div class="board-wrap">

        <header class="board-header">
          <span class="kicker">Governance</span>
          <h2 class="board-header__title">Board of Directors</h2>
          <p class="board-header__sub">Three generations of leadership — legacy, experience and fresh vision working together.</p>
        </header>

        <div class="board-grid">
          ${directors.map((d, i) => `
            <div class="board-card" data-idx="${i}" data-color="${d.color}">
              <div class="board-card__collapsed">
                <div class="board-card__sig">${d.initials}</div>
                <div class="board-card__info">
                  <h3>${d.name}</h3>
                  <p class="board-card__role">${d.role}</p>
                </div>
                <div class="board-card__arrow">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 8L10 13L15 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <div class="board-card__expanded">
                <div class="board-card__photo">
                  <img src="${d.photo}" alt="Portrait of ${d.name}" loading="lazy">
                  <div class="board-card__photo-overlay"></div>
                </div>
                <div class="board-card__details">
                  <div class="board-card__meta">
                    <span class="board-card__gen">${d.generation}</span>
                    <span class="board-card__exp">${d.experience}</span>
                    <span class="board-card__joined">Since ${d.joinedYear}</span>
                  </div>
                  <p class="board-card__bio">${d.bio}</p>
                  <div class="board-card__edu">
                    <strong>Education:</strong> ${d.education}
                  </div>
                  <div class="board-card__achievements">
                    <strong>Key Achievements:</strong>
                    <ul>
                      ${d.achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                  </div>
                  <blockquote class="board-card__quote">
                    <span class="board-card__quote-mark">"</span>
                    ${d.philosophy}
                  </blockquote>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <p class="board-foot">Together they combine legacy, experience and fresh thinking to lead BSC into its next era.</p>
      </div>
    `;
    oldLeaders.replaceWith(newBoard);
  }

  /* ═══════════════════════════════════════════════════════
     EXPAND / COLLAPSE LOGIC
     ═══════════════════════════════════════════════════════ */
  const cards = document.querySelectorAll('.board-card');
  cards.forEach(card => {
    const collapsed = card.querySelector('.board-card__collapsed');
    const expanded = card.querySelector('.board-card__expanded');

    collapsed.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');

      /* Close all others */
      cards.forEach(c => {
        if (c !== card) {
          c.classList.remove('open');
          const ex = c.querySelector('.board-card__expanded');
          if (ex) {
            G.to(ex, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut' });
          }
        }
      });

      if (isOpen) {
        card.classList.remove('open');
        G.to(expanded, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut' });
      } else {
        card.classList.add('open');
        G.set(expanded, { height: 'auto', opacity: 1 });
        const h = expanded.scrollHeight;
        G.fromTo(expanded, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.6, ease: 'power3.out' });

        /* Animate children */
        const children = expanded.querySelectorAll('.board-card__bio, .board-card__meta, .board-card__edu, .board-card__achievements, .board-card__quote');
        G.fromTo(children,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, delay: 0.2, ease: 'power2.out' }
        );
      }
    });
  });

  /* ═══════════════════════════════════════════════════════
     ANIMATIONS
     ═══════════════════════════════════════════════════════ */

  /* About hero */
  const abnHero = document.querySelector('.abn-hero');
  if (abnHero) {
    G.fromTo(abnHero,
      { opacity: 0, y: 60, rotateX: -10, transformPerspective: 900, transformOrigin: '50% 100%' },
      {
        opacity: 1, y: 0, rotateX: 0,
        ease: 'power3.out',
        scrollTrigger: { trigger: abnHero, start: 'top 85%', end: 'top 35%', toggleActions: 'play none none reverse' }
      }
    );
  }

  /* Story columns */
  const storyCols = document.querySelectorAll('.abn-story__col');
  storyCols.forEach((col, i) => {
    G.fromTo(col,
      { opacity: 0, y: 40, rotateX: -6, transformPerspective: 800, transformOrigin: '50% 0%' },
      {
        opacity: 1, y: 0, rotateX: 0,
        ease: 'power3.out',
        scrollTrigger: { trigger: col, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  /* Timeline — staggered reveal with IntersectionObserver */
  const tlItems = document.querySelectorAll('.abn-tl-item');
  const tlTrack = document.querySelector('.abn-timeline__track');
  if (tlItems.length) {
    /* Animate the title */
    const tlTitle = document.querySelector('.abn-timeline__title');
    if (tlTitle) {
      G.fromTo(tlTitle,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power3.out', duration: 0.8,
          scrollTrigger: { trigger: tlTitle, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      );
    }

    /* Animate the track line drawing */
    if (tlTrack) {
      G.fromTo(tlTrack.querySelector('::before') || tlTrack,
        { '--line-progress': '0%' },
        { '--line-progress': '100%', ease: 'none',
          scrollTrigger: { trigger: tlTrack, start: 'top 80%', end: 'bottom 60%', scrub: 1 }
        }
      );
    }

    /* Staggered item reveal using IntersectionObserver */
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const idx = parseInt(item.dataset.i) || 0;
          const delay = idx * 120;
          setTimeout(() => {
            item.classList.add('seen');
            /* Animate the dot */
            const dot = item.querySelector('.abn-tl-dot');
            if (dot) {
              G.fromTo(dot,
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.15 }
              );
            }
            /* Animate the content card */
            const content = item.querySelector('.abn-tl-content');
            if (content) {
              G.fromTo(content,
                { opacity: 0, y: 20, scale: 0.96 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.25 }
              );
            }
            /* Animate the year badge */
            const year = item.querySelector('.abn-tl-year');
            if (year) {
              G.fromTo(year,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
              );
            }
          }, delay);
          tlObserver.unobserve(item);
        }
      });
    }, { threshold: 0.3, rootMargin: '-5% 0px -5% 0px' });

    tlItems.forEach((item, i) => {
      item.dataset.i = i;
      tlObserver.observe(item);
    });
  }

  /* Numbers */
  const numVals = document.querySelectorAll('.abn-num__val');
  numVals.forEach(el => {
    const to = parseFloat(el.dataset.to);
    const suf = el.dataset.suffix || '';
    const ob = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      ob.disconnect();
      const t0 = performance.now();
      (function tick(t) {
        const p = Math.min(1, (t - t0) / 1400);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(to * e).toLocaleString('en-IN') + suf;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = to.toLocaleString('en-IN') + suf;
      })(t0);
    }, { threshold: 0.6 });
    ob.observe(el);
  });

  /* Value cards */
  const valCards = document.querySelectorAll('.abn-val-card');
  valCards.forEach((card, i) => {
    G.fromTo(card,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  /* Offer cards */
  const offerCards = document.querySelectorAll('.abn-offer-card');
  offerCards.forEach((card, i) => {
    G.fromTo(card,
      { opacity: 0, y: 25, rotateX: -5, transformPerspective: 800 },
      {
        opacity: 1, y: 0, rotateX: 0,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

  /* Board header */
  const boardHeader = document.querySelector('.board-header');
  if (boardHeader) {
    G.fromTo(boardHeader,
      { opacity: 0, y: 50, rotateX: -10, transformPerspective: 900, transformOrigin: '50% 100%' },
      {
        opacity: 1, y: 0, rotateX: 0,
        ease: 'power3.out',
        scrollTrigger: { trigger: boardHeader, start: 'top 85%', end: 'top 35%', toggleActions: 'play none none reverse' }
      }
    );
  }

  /* Board cards stagger */
  const boardCards = document.querySelectorAll('.board-card');
  boardCards.forEach((card, i) => {
    G.fromTo(card,
      { opacity: 0, y: 40, scale: 0.96, rotateX: -6, transformPerspective: 1000, transformOrigin: '50% 0%' },
      {
        opacity: 1, y: 0, scale: 1, rotateX: 0,
        ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );
  });

})();
