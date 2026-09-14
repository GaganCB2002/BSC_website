/* BSC 3D hero — two flowing ribbons (the logo's saree-fold curves) in WebGL.
   Scroll drives amplitude, twist and camera; pointer adds damped parallax.
   If three.js/WebGL is unavailable, a classic 2D-canvas twin takes over (hero2d.js). */
const state = { scroll: 0, tScroll: 0, mx: 0, my: 0, tmx: 0, tmy: 0, visible: true };
let THREE;
try {
  THREE = await import('three');
} catch (e) {
  inject2D();
}
if (THREE) boot3D().catch((err) => { console.warn('[BSC hero] WebGL failed → 2D fallback', err); inject2D(); });

function inject2D() {
  const s = document.createElement('script');
  s.src = '/js/hero2d.js'; document.body.appendChild(s);
  window.__heroMode = '2d-fallback';
}

async function boot3D() {
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9.2);

  const V = `
    uniform float uTime, uScroll, uAmp, uTwist;
    varying vec2 vUv; varying float vH;
    void main(){
      vUv = uv;
      vec3 p = position;
      float u = uv.x;
      float wave = sin(u*3.4 + uTime*1.1) * 0.5 + sin(u*8.1 - uTime*1.7 + uv.y*2.0)*0.16
                 + sin(u*17.0 + uTime*0.6)*0.05;
      float grow = mix(1.0, 1.9, smoothstep(0.0,1.0,uScroll));
      p.y += wave * uAmp * grow * sin(u*3.14159);
      p.z += cos(u*5.0 + uTime*0.8) * 0.22 * grow;
      float ang = (u - 0.5) * uTwist * (1.0 + uScroll*2.2);
      float c = cos(ang), s = sin(ang);
      p.yz = mat2(c,-s,s,c) * p.yz;
      vH = wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }`;
  const F = `
    uniform vec3 uColA, uColB; uniform float uOpacity; uniform sampler2D uLogo;
    uniform int uHasTexture;
    varying vec2 vUv; varying float vH;
    void main(){
      float lit = 0.55 + 0.45 * sin(vH*3.0 + vUv.x*6.0);
      vec3 col = mix(uColA, uColB, clamp(vUv.y*0.6 + vH*0.9 + 0.2, 0.0, 1.0)) * lit;
      col += pow(1.0 - abs(vUv.y - 0.5)*2.0, 6.0) * 0.25;          /* silky center line */
      float edge = smoothstep(0.0,0.04,vUv.x) * smoothstep(1.0,0.94,vUv.x);
      float fade = smoothstep(0.0,0.12,vUv.y) * smoothstep(1.0,0.82,vUv.y);
      gl_FragColor = vec4(col, uOpacity * edge * fade);
    }`;

  function ribbon(w, h, y, z, colA, colB, amp, twist, op) {
    const geo = new THREE.PlaneGeometry(w, h, 220, 26);
    const mat = new THREE.ShaderMaterial({
      vertexShader: V, fragmentShader: F, transparent: true, side: THREE.DoubleSide, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uAmp: { value: amp }, uTwist: { value: twist }, uOpacity: { value: op }, uColA: { value: new THREE.Color(colA) }, uColB: { value: new THREE.Color(colB) } },
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(0, y, z); m.rotation.z = -0.06; scene.add(m);
    return m;
  }
  const NAVY = 0x182e6e, NAVY2 = 0x3a5cc0, RED = 0xb81b20, RED2 = 0xe05a52, GOLD = 0xc77f2b;
  const r1 = ribbon(16, 2.6, 1.55, -1.4, NAVY, NAVY2, 0.95, 0.24, 0.95);   /* the upper twin curve */
  const r2 = ribbon(15, 2.1, 0.55, -0.2, RED, RED2, 1.15, -0.3, 0.9);       /* the lower fold */
  const r3 = ribbon(13, 0.5, -1.35, -2.2, GOLD, 0xf2d9a7, 0.6, 0.5, 0.5);   /* thin gold thread */
  const r4 = ribbon(19, 3.4, -0.2, -4.5, 0x14265c, 0x2a4aa8, 0.7, -0.18, 0.42); /* deep back curtain */
  const r5 = ribbon(10, 1.1, 2.4, -3.2, 0xd8454b, GOLD, 0.85, 0.42, 0.35);  /* accent thread above */

  /* a soft ring of tiny "thread" particles for depth */
  const pts = new THREE.BufferGeometry();
  const N = 260, arr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { arr[i * 3] = (Math.random() - .5) * 20; arr[i * 3 + 1] = (Math.random() - .5) * 9; arr[i * 3 + 2] = -3 - Math.random() * 9; }
  pts.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const dust = new THREE.Points(pts, new THREE.PointsMaterial({ size: 0.045, color: NAVY, transparent: true, opacity: 0.35 }));
  scene.add(dust);

  /* halo glow behind the headline — breathes on time, swells on scroll */
  const glowTex = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const cx = cv.getContext('2d');
    const g = cx.createRadialGradient(128, 128, 12, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,243,224,.85)');
    g.addColorStop(.38, 'rgba(202,33,37,.26)');
    g.addColorStop(1, 'rgba(202,33,37,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  glow.scale.set(6.5, 6.5, 1); glow.position.set(0, .3, -4); scene.add(glow);

  /* twin 3D rings — the identity curves, in real space; spin with time + scroll */
  const mkRing = (r, col, y, z, op) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.018, 10, 140),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
    );
    m.position.set(0, y, z); m.rotation.x = Math.PI / 2.2; scene.add(m); return m;
  };
  const ringA = mkRing(2.7, GOLD, .15, -5, .45);
  const ringB = mkRing(3.5, 0xd8454b, -.25, -6.5, .28);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize); resize();

  addEventListener('pointermove', (e) => { state.tmx = (e.clientX / innerWidth - .5); state.tmy = (e.clientY / innerHeight - .5); }, { passive: true });
  new IntersectionObserver((es) => state.visible = es[0].isIntersecting, { threshold: 0 }).observe(canvas);

  window.__heroMode = 'gl';
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!state.visible || document.hidden) return;
    const t = clock.getElapsedTime();
    const hp = window.__bsc?.heroProgress ?? 0;
    state.scroll += (hp - state.scroll) * 0.07;               /* damped — the anime "follow-through" */
    state.mx += (state.tmx - state.mx) * .045; state.my += (state.tmy - state.my) * .045;
    const s = state.scroll;
    for (const r of [r1, r2, r3, r4, r5]) {
      r.material.uniforms.uTime.value = t;
      r.material.uniforms.uScroll.value = s;
    }
    camera.position.x = state.mx * 1.1;
    camera.position.y = 0.4 - state.my * .5 - s * 1.35;
    camera.position.z = 9.2 - s * 2.6;
    camera.rotation.z = state.mx * -.05 + s * .05;             /* cinematic roll */
    camera.fov = 46 - s * 6; camera.updateProjectionMatrix();  /* dolly-zoom punch */
    r1.position.y = 1.55 + s * 1.15; r1.position.z = -1.4 - s * 2.4;
    r2.position.y = 0.55 + s * .55; r2.position.z = -0.2 - s * 1.2;
    r3.position.y = -1.35 - s * .7;
    r2.position.x = s * -1.4;                                  /* ribbons drift apart as story begins */
    r4.position.y = -.2 + s * .35; r4.position.z = -4.5 - s * 1.6;
    r5.position.y = 2.4 - s * 1.1; r5.rotation.z = -.12 + s * .3;
    r1.rotation.z = -0.06 - s * 0.22; r2.rotation.z = -0.02 + s * 0.16;
    ringA.rotation.z = t * .14 + s * 1.3; ringB.rotation.z = -t * .1 - s * .9;
    ringA.rotation.x = Math.PI / 2.15 + state.my * .12 + s * .18;
    ringB.rotation.x = Math.PI / 2.6 - state.my * .1 + s * .12;
    ringA.position.y = .15 + s * .4; ringB.position.y = -.25 + s * .3;
    glow.material.opacity = .55 + Math.sin(t * 1.3) * .12;
    glow.scale.setScalar(6.5 + s * 4);
    glow.position.y = .3 - s * .8;
    dust.rotation.y = t * 0.02; dust.rotation.x = s * .55;     /* thread field streams past */
    renderer.render(scene, camera);
  });
}
