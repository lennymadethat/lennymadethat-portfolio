/* lennymadethat.com — THE BRAIN infrastructure scrollytelling.
   The house embers converge into a rotating brain point-cloud wired with
   synapse lines; pulses fire along them while two copy plates tell the
   Vault + Data Engine story. Scroll forms it, scroll releases it.
   three.js r169 (MIT, vendored). Reduced motion / no WebGL: static section. */
import * as THREE from "./vendor/three.module.min.js";

const wrap = document.querySelector(".brain");
const canvas = document.getElementById("brain-canvas");

const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (wrap && canvas && !reduce) {
  try { boot(); } catch (e) { wrap.classList.add("is-static"); }
} else if (wrap) {
  wrap.classList.add("is-static");
}

function boot() {
  const scrollEl = wrap.querySelector(".brain-scroll");
  const stage = wrap.querySelector(".brain-stage");
  const copies = wrap.querySelectorAll(".brain-copy");
  if (!scrollEl || !stage) { wrap.classList.add("is-static"); return; }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -2000, 2000);

  let W = 1, H = 1;
  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;
  const N = isMobile ? 5200 : 9500;
  const SEG = isMobile ? 220 : 420;
  const PULSES = isMobile ? 26 : 44;

  /* ---------- brain surface ---------- */
  function brainPoint() {
    /* unit sphere → squashed, wrinkled, fissured brain-ish surface */
    let x = 0, y = 0, z = 0, l = 0;
    do {
      x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
      l = Math.sqrt(x * x + y * y + z * z);
    } while (l < 0.0001 || l > 1);
    x /= l; y /= l; z /= l;
    /* proportions: wide oval, slightly flattened */
    let px = x * 1.32, py = y * 0.92, pz = z * 1.02;
    /* cortical folds: big, low-frequency, deep enough to shape the silhouette */
    const w =
      Math.sin(px * 3.4 + py * 1.7) * 0.55 +
      Math.sin(py * 4.6 + pz * 2.2) * 0.3 +
      Math.sin(pz * 5.3 + px * 2.9) * 0.25;
    const amp = 0.13 * w;
    px += x * amp; py += y * amp; pz += z * amp;
    /* interhemispheric fissure: deep cut along the top midline,
       hemispheres pushed slightly apart */
    const fz = Math.max(0, 1 - Math.abs(px) / 0.2);
    if (py > -0.25) py -= 0.3 * fz * fz;
    px += (px < 0 ? -1 : 1) * 0.05 * fz;
    /* temporal lobes: low sides bulge outward */
    if (py < -0.15 && Math.abs(px) > 0.45) { px *= 1.08; py *= 1.04; }
    /* underside tapers toward a stem instead of a flat base */
    if (py < -0.5) { py = -0.5 - (py + 0.5) * 0.45; px *= 0.9; pz *= 0.92; }
    /* gentle tilt so the long axis isn't dead level */
    const ta = -0.12, ct = Math.cos(ta), st = Math.sin(ta);
    const tx = px * ct - py * st, ty = px * st + py * ct;
    return { x: tx, y: ty, z: pz };
  }

  /* ---------- ember cloud (forms the brain) ---------- */
  const uniforms = {
    uTime: { value: 0 },
    uForm: { value: 0 },
    uPulse: { value: 0 },
    uRelease: { value: 0 },
    uCenter: { value: new THREE.Vector2(0, 0) },
    uRadius: { value: 100 },
    uDpr: { value: 1 }
  };

  const vert = `
    uniform float uTime;
    uniform float uForm;
    uniform float uPulse;
    uniform float uRelease;
    uniform vec2  uCenter;
    uniform float uRadius;
    uniform float uDpr;
    attribute vec3 aBrain;   /* unit brain-space position */
    attribute vec3 aScatter; /* px scatter origin */
    attribute vec4 aSeed;
    varying float vHeat;
    varying float vAlpha;
    float easeS(float t){ t = clamp(t, 0.0, 1.0); return t*t*(3.0-2.0*t); }
    void main(){
      float ph = aSeed.x, spd = aSeed.y, szf = aSeed.z;

      /* slow rotation around the vertical axis */
      float a = uTime * 0.22;
      float ca = cos(a), sa = sin(a);
      vec3 b = aBrain;
      vec3 rb = vec3(b.x * ca + b.z * sa, b.y, -b.x * sa + b.z * ca);

      vec2 brainPx = uCenter + vec2(rb.x, -rb.y) * uRadius;
      float depth = (rb.z + 1.4) / 2.8;   /* 0 back … 1 front */

      float t = easeS((uForm - ph * 0.3) / 0.7);
      vec2 sc = aScatter.xy;
      sc.x += sin(uTime * (0.4 + spd * 0.4) + ph * 6.28318) * 30.0;
      sc.y += cos(uTime * (0.35 + spd * 0.3) + ph * 4.0) * 24.0;
      vec2 pos = mix(sc, brainPx, t);

      /* release: stream down into the plate grid below */
      float r = easeS(uRelease);
      pos.y += r * (260.0 + 420.0 * ph);

      /* synapse flash: nearby heat when the pulse layer is hot */
      vHeat = 0.4 + 0.4 * depth + uPulse * 0.3 * (0.5 + 0.5 * sin(uTime * 2.0 + ph * 25.0));
      vAlpha = (0.16 + 0.78 * depth) * t * (1.0 - r) + (1.0 - t) * 0.5;

      vec4 mv = modelViewMatrix * vec4(pos, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (1.3 + 1.6 * szf) * (0.6 + 0.7 * depth) * uDpr;
    }
  `;
  const frag = `
    precision mediump float;
    varying float vHeat;
    varying float vAlpha;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float disc = smoothstep(0.5, 0.06, d);
      float core = smoothstep(0.22, 0.0, d);
      vec3 ember  = vec3(0.5, 0.13, 0.03);
      vec3 orange = vec3(0.95, 0.36, 0.15);
      vec3 hot    = vec3(1.0, 0.85, 0.6);
      float heat = clamp(vHeat, 0.0, 1.5);
      vec3 col = mix(ember, orange, clamp(heat, 0.0, 1.0));
      col = mix(col, hot, core * clamp(heat * 1.1 - 0.3, 0.0, 1.0));
      float alp = disc * clamp(vAlpha, 0.0, 1.0);
      if (alp < 0.004) discard;
      gl_FragColor = vec4(col * (0.5 + 0.8 * heat), alp);
    }
  `;

  const brainPts = new Array(N);
  for (let i = 0; i < N; i++) brainPts[i] = brainPoint();

  const geo = new THREE.BufferGeometry();
  const posArr = new Float32Array(N * 3);
  const brainArr = new Float32Array(N * 3);
  const scatterArr = new Float32Array(N * 3);
  const seedArr = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    brainArr[i * 3] = brainPts[i].x;
    brainArr[i * 3 + 1] = brainPts[i].y;
    brainArr[i * 3 + 2] = brainPts[i].z;
    seedArr[i * 4] = Math.random();
    seedArr[i * 4 + 1] = 0.6 + Math.random();
    seedArr[i * 4 + 2] = Math.random();
    seedArr[i * 4 + 3] = Math.random();
  }
  geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute("aBrain", new THREE.BufferAttribute(brainArr, 3));
  geo.setAttribute("aScatter", new THREE.BufferAttribute(scatterArr, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seedArr, 4));
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending
  });
  const cloud = new THREE.Points(geo, mat);
  cloud.frustumCulled = false;
  scene.add(cloud);

  /* ---------- synapse lines (faint lattice between surface points) ---------- */
  const lineUniforms = { uTime: uniforms.uTime, uForm: uniforms.uForm, uRelease: uniforms.uRelease, uCenter: uniforms.uCenter, uRadius: uniforms.uRadius };
  const lineVert = `
    uniform float uTime;
    uniform float uForm;
    uniform float uRelease;
    uniform vec2  uCenter;
    uniform float uRadius;
    attribute vec3 aBrain;
    varying float vDepth;
    void main(){
      float a = uTime * 0.22;
      float ca = cos(a), sa = sin(a);
      vec3 b = aBrain;
      vec3 rb = vec3(b.x * ca + b.z * sa, b.y, -b.x * sa + b.z * ca);
      vec2 pos = uCenter + vec2(rb.x, -rb.y) * uRadius;
      pos.y += uRelease * 300.0;
      vDepth = (rb.z + 1.4) / 2.8;
      vec4 mv = modelViewMatrix * vec4(pos, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
    }
  `;
  const lineFrag = `
    precision mediump float;
    uniform float uForm;
    uniform float uRelease;
    varying float vDepth;
    void main(){
      float alp = 0.13 * uForm * (1.0 - uRelease) * (0.25 + 0.75 * vDepth);
      gl_FragColor = vec4(0.95, 0.42, 0.2, alp);
    }
  `;
  const lgeo = new THREE.BufferGeometry();
  const lpos = new Float32Array(SEG * 2 * 3);
  const lbrain = new Float32Array(SEG * 2 * 3);
  for (let i = 0; i < SEG; i++) {
    const a = brainPts[(Math.random() * N) | 0];
    /* partner: a nearby-ish point so the lattice reads cortical, not chaotic */
    let b = null, best = 1e9;
    for (let k = 0; k < 8; k++) {
      const c = brainPts[(Math.random() * N) | 0];
      const d = (a.x - c.x) ** 2 + (a.y - c.y) ** 2 + (a.z - c.z) ** 2;
      if (d > 0.01 && d < best) { best = d; b = c; }
    }
    b = b || brainPts[(Math.random() * N) | 0];
    lbrain.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
  }
  lgeo.setAttribute("position", new THREE.BufferAttribute(lpos, 3));
  lgeo.setAttribute("aBrain", new THREE.BufferAttribute(lbrain, 3));
  const lmat = new THREE.ShaderMaterial({
    uniforms: lineUniforms, vertexShader: lineVert, fragmentShader: lineFrag,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending
  });
  const lattice = new THREE.LineSegments(lgeo, lmat);
  lattice.frustumCulled = false;
  scene.add(lattice);

  /* ---------- firing pulses (bright packets on arcs between points) ---------- */
  const pulseVert = `
    uniform float uTime;
    uniform float uForm;
    uniform float uPulse;
    uniform float uRelease;
    uniform vec2  uCenter;
    uniform float uRadius;
    uniform float uDpr;
    attribute vec3 aFrom;
    attribute vec3 aTo;
    attribute vec4 aSeed;
    varying float vGlow;
    void main(){
      float ph = aSeed.x, spd = aSeed.y;
      float a = uTime * 0.22;
      float ca = cos(a), sa = sin(a);
      vec3 f = vec3(aFrom.x * ca + aFrom.z * sa, aFrom.y, -aFrom.x * sa + aFrom.z * ca);
      vec3 t = vec3(aTo.x * ca + aTo.z * sa, aTo.y, -aTo.x * sa + aTo.z * ca);
      float u = fract(uTime * (0.14 + spd * 0.12) + ph);
      vec3 midv = mix(f, t, 0.5) * 1.25;      /* bulge outward */
      vec3 p = mix(mix(f, midv, u), mix(midv, t, u), u);
      vec2 pos = uCenter + vec2(p.x, -p.y) * uRadius;
      pos.y += uRelease * 300.0;
      float depth = (p.z + 1.6) / 3.2;
      vGlow = sin(u * 3.14159) * uForm * (1.0 - uRelease) * (0.35 + 0.65 * uPulse);
      vec4 mv = modelViewMatrix * vec4(pos, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (4.0 + 4.5 * vGlow) * (0.6 + 0.6 * depth) * uDpr;
    }
  `;
  const pulseFrag = `
    precision mediump float;
    varying float vGlow;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float disc = smoothstep(0.5, 0.0, d);
      float alp = disc * vGlow;
      if (alp < 0.004) discard;
      vec3 col = mix(vec3(0.95, 0.4, 0.18), vec3(1.0, 0.9, 0.7), smoothstep(0.3, 0.0, d));
      gl_FragColor = vec4(col * (0.8 + vGlow), alp);
    }
  `;
  const pgeo = new THREE.BufferGeometry();
  const ppos = new Float32Array(PULSES * 3);
  const pfrom = new Float32Array(PULSES * 3);
  const pto = new Float32Array(PULSES * 3);
  const pseed = new Float32Array(PULSES * 4);
  for (let i = 0; i < PULSES; i++) {
    const a = brainPts[(Math.random() * N) | 0];
    const b = brainPts[(Math.random() * N) | 0];
    pfrom.set([a.x, a.y, a.z], i * 3);
    pto.set([b.x, b.y, b.z], i * 3);
    pseed[i * 4] = Math.random();
    pseed[i * 4 + 1] = 0.5 + Math.random();
    pseed[i * 4 + 2] = Math.random();
    pseed[i * 4 + 3] = Math.random();
  }
  pgeo.setAttribute("position", new THREE.BufferAttribute(ppos, 3));
  pgeo.setAttribute("aFrom", new THREE.BufferAttribute(pfrom, 3));
  pgeo.setAttribute("aTo", new THREE.BufferAttribute(pto, 3));
  pgeo.setAttribute("aSeed", new THREE.BufferAttribute(pseed, 4));
  const pmat = new THREE.ShaderMaterial({
    uniforms, vertexShader: pulseVert, fragmentShader: pulseFrag,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending
  });
  const pulses = new THREE.Points(pgeo, pmat);
  pulses.frustumCulled = false;
  scene.add(pulses);

  /* ---------- layout ---------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (w < 2 || h < 2) return;
    W = w; H = h;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = h;
    camera.updateProjectionMatrix();
    uniforms.uDpr.value = dpr;
    /* brain sits high-center on phone (copy below), center-right on desktop */
    if (isMobile || w < 900) {
      uniforms.uCenter.value.set(w / 2, h * 0.36);
      uniforms.uRadius.value = Math.min(w, h) * 0.3;
    } else {
      uniforms.uCenter.value.set(w * 0.62, h * 0.48);
      uniforms.uRadius.value = Math.min(w, h) * 0.34;
    }
    const diag = Math.sqrt(w * w + h * h);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = diag * (0.3 + Math.random() * 0.45);
      scatterArr[i * 3] = w / 2 + Math.cos(a) * r;
      scatterArr[i * 3 + 1] = h / 2 + Math.sin(a) * r * 0.7;
    }
    geo.attributes.aScatter.needsUpdate = true;
  }

  /* ---------- scroll + beats ---------- */
  let running = false, raf = 0;
  const header = document.querySelector(".site-header");
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const t = now / 1000;
    uniforms.uTime.value = t;

    const headerH = header ? header.offsetHeight : 60;
    const r = scrollEl.getBoundingClientRect();
    const max = Math.max(1, scrollEl.offsetHeight - stage.offsetHeight);
    const p = clamp01((headerH - r.top) / max);

    uniforms.uForm.value = clamp01(p / 0.32);
    uniforms.uPulse.value = clamp01((p - 0.42) / 0.18);
    uniforms.uRelease.value = clamp01((p - 0.84) / 0.16);

    const beat = p < 0.46 ? 0 : 1;
    copies.forEach(function (c, i) {
      const on = i === beat && p > 0.08 && p < 0.86;
      c.classList.toggle("is-on", on);
    });

    renderer.render(scene, camera);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  const io = new IntersectionObserver(function (es) {
    if (es[0] && es[0].isIntersecting) start(); else stop();
  }, { threshold: 0.01 });
  io.observe(stage);

  let rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize();
  start();
}
