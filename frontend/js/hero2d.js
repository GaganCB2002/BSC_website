/* 2D-canvas twin of the WebGL hero (loaded automatically if three.js/WebGL is unavailable).
   Layered sine ribbons — navy, red, gold — scroll-reactive. */
(function () {
  'use strict';
  const canvas = document.getElementById('gl'); if (!canvas || canvas.dataset.live) return;
  canvas.dataset.live = '1';
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  let W, H, dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  addEventListener('resize', resize); resize();
  let scroll = 0, mx = 0, smx = 0;
  addEventListener('pointermove', e => mx = e.clientX / innerWidth - .5, { passive: true });
  const layers = [
    { c: 'rgba(32,58,133,.85)', w: 46, y: .28, s: 1.00, ph: 0, blur: 0 },
    { c: 'rgba(202,33,37,.9)', w: 64, y: .46, s: 1.35, ph: 2.2, blur: 0 },
    { c: 'rgba(199,127,43,.5)', w: 10, y: .68, s: 2.1, ph: 4.1, blur: 0 },
    { c: 'rgba(32,58,133,.12)', w: 90, y: .36, s: .8, ph: 1.1, blur: 1 },
  ];
  (function draw(t) {
    requestAnimationFrame(draw);
    if (document.hidden) return;
    const target = (window.__bsc && window.__bsc.heroProgress) || 0;
    scroll += (target - scroll) * .08; smx += (mx - smx) * .05;
    const time = t * .001, s = scroll;
    ctx.clearRect(0, 0, W, H);
    for (const L of layers) {
      ctx.beginPath();
      const baseY = H * L.y * (1 - s * .18) + H * .12 * s + smx * 26;
      const amp = (L.w * .5 + s * L.w * 1.2);
      for (let x = -10; x <= W + 10; x += 6) {
        const u = x / W;
        const y = baseY
          + Math.sin(u * 3.1 * L.s + time * 1.05 + L.ph) * amp * Math.sin(u * Math.PI)
          + Math.sin(u * 8.7 * L.s - time * 1.6) * amp * .22
          + Math.sin(u * 21 + time * .5) * 3;
        x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineWidth = Math.max(3, L.w * .18 * (1 - s * .3));
      ctx.strokeStyle = L.c; ctx.lineCap = 'round';
      if (L.blur) { ctx.filter = 'blur(14px)'; } else ctx.filter = 'none';
      ctx.stroke(); ctx.filter = 'none';
    }
    /* drifting threads */
    for (let i = 0; i < 26; i++) {
      const x = ((i * 137.5 + time * (9 + i % 5)) % (W + 40)) - 20;
      const y = (i * 97 % H) + Math.sin(time + i) * 8;
      ctx.fillStyle = i % 2 ? 'rgba(32,58,133,.14)' : 'rgba(202,33,37,.12)';
      ctx.fillRect(x, y, 2.2, 2.2);
    }
  })(0);
})();
