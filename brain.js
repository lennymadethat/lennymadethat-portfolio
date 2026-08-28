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
  /* marker: the scroll rig is live, so the boot watchdog must not force static */
  wrap.classList.add("is-live");

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -2000, 2000);

  let W = 1, H = 1;
  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;
  const N = isMobile ? 7000 : 14000;
  const SEG = isMobile ? 220 : 420;
  const PULSES = isMobile ? 36 : 64;

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
    uSplit: { value: 0 },
    uFire: { value: new THREE.Vector3(0, 0, 0) },
    uFireT: { value: -100 },
    uCenter: { value: new THREE.Vector2(0, 0) },
    uRadius: { value: 100 },
    uDpr: { value: 1 }
  };

  const vert = `
    uniform float uTime;
    uniform float uForm;
    uniform float uPulse;
    uniform float uRelease;
    uniform float uSplit;
    uniform vec3  uFire;
    uniform float uFireT;
    uniform vec2  uCenter;
    uniform float uRadius;
    uniform float uDpr;
    attribute vec3 aBrain;   /* unit brain-space position */
    attribute vec3 aScatter; /* px scatter origin */
    attribute vec4 aSeed;
    varying float vHeat;
    varying float vAlpha;
    float easeS(float t){ t = clamp(t, 0.0, 1.0); return t*t*(3.0-2.0*t); }
    /* Simplex 2D noise — (c) Ashima Arts / Stefan Gustavson, MIT
       (github.com/stegu/webgl-noise) */
    vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    float fbm2(vec2 p){ return snoise(p) * 0.65 + snoise(p * 2.13 + 7.7) * 0.35; }
    void main(){
      float ph = aSeed.x, spd = aSeed.y, szf = aSeed.z;

      /* slow rotation around the vertical axis */
      float a = uTime * 0.22;
      float ca = cos(a), sa = sin(a);
      vec3 b = aBrain;
      vec3 rb = vec3(b.x * ca + b.z * sa, b.y, -b.x * sa + b.z * ca);

      vec2 brainPx = uCenter + vec2(rb.x, -rb.y) * uRadius;
      /* hemisphere parting: the halves slide apart on screen along the
         left/right axis (aBrain.z) while the lattice stays stretched between */
      brainPx.x += sign(aBrain.z) * uSplit * uRadius * 0.11;
      float depth = (rb.z + 1.4) / 2.8;   /* 0 back … 1 front */

      float t = easeS((uForm - ph * 0.3) / 0.7);
      vec2 sc = aScatter.xy;
      float fa = fbm2(aScatter.xy * 0.0042 + uTime * vec2(0.05, 0.04)) * 6.28318 + ph * 6.28318;
      sc += vec2(cos(fa), sin(fa)) * (26.0 + 30.0 * spd);
      vec2 pos = mix(sc, brainPx, t);

      /* release: stream down into the plate grid below */
      float r = easeS(uRelease);
      pos.y += r * (260.0 + 420.0 * ph);

      /* synapse flash: nearby heat when the pulse layer is hot */
      vHeat = 0.5 + 0.42 * depth + uPulse * 0.3 * (0.5 + 0.5 * sin(uTime * 2.0 + ph * 25.0));
      vAlpha = (0.22 + 0.78 * depth) * t * (1.0 - r) + (1.0 - t) * 0.5;
      /* thought ripple: particles near a firing point flare and fade */
      float ft2 = uTime - uFireT;
      if (ft2 > 0.0 && ft2 < 1.4) {
        vec3 df = aBrain - uFire;
        float flash = exp(-dot(df, df) * 3.5) * (1.0 - ft2 / 1.4);
        vHeat += flash * 1.5;
        vAlpha += flash * 0.35;
      }

      vec4 mv = modelViewMatrix * vec4(pos, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (1.7 + 2.1 * szf) * (0.6 + 0.75 * depth) * uDpr;
    }
  `;
  const frag = `
    precision highp float;
    varying float vHeat;
    varying float vAlpha;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float disc = smoothstep(0.5, 0.06, d);
      float core = smoothstep(0.22, 0.0, d);
      /* cosine palette (IQ, MIT) fitted to the house ember ramp */
      float heat = clamp(vHeat, 0.0, 1.5);
      float t = clamp(heat, 0.0, 1.0);
      vec3 col = vec3(0.735, 0.23, 0.085)
               + vec3(0.215, 0.11, 0.055) * cos(6.28318 * (0.5 * t + vec3(0.50, 0.44, 0.42)));
      col = mix(col, vec3(1.0, 0.88, 0.62), core * clamp(heat * 1.1 - 0.3, 0.0, 1.0));
      float alp = disc * clamp(vAlpha, 0.0, 1.0);
      if (alp < 0.004) discard;
      gl_FragColor = vec4(col * (0.6 + 0.95 * heat), alp);
    }
  `;

  /* procedural fallback cloud; replaced by the baked MRI scan when it loads */
  let brainPts = new Array(N);
  for (let i = 0; i < N; i++) brainPts[i] = brainPoint();

  const geo = new THREE.BufferGeometry();
  const posArr = new Float32Array(N * 3);
  const brainArr = new Float32Array(N * 3);
  const scatterArr = new Float32Array(N * 3);
  const seedArr = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    seedArr[i * 4] = Math.random();
    seedArr[i * 4 + 1] = 0.6 + Math.random();
    seedArr[i * 4 + 2] = Math.random();
    seedArr[i * 4 + 3] = Math.random();
  }
  function fillCloud(pts) {
    for (let i = 0; i < N; i++) {
      const p = pts[Math.floor((i * pts.length) / N) % pts.length];
      brainArr[i * 3] = p.x;
      brainArr[i * 3 + 1] = p.y;
      brainArr[i * 3 + 2] = p.z;
    }
    if (geo.attributes.aBrain) geo.attributes.aBrain.needsUpdate = true;
  }
  fillCloud(brainPts);
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
    precision highp float;
    uniform float uForm;
    uniform float uRelease;
    varying float vDepth;
    void main(){
      float alp = 0.17 * uForm * (1.0 - uRelease) * (0.25 + 0.75 * vDepth);
      gl_FragColor = vec4(0.95, 0.42, 0.2, alp);
    }
  `;
  const lgeo = new THREE.BufferGeometry();
  const lpos = new Float32Array(SEG * 2 * 3);
  const lbrain = new Float32Array(SEG * 2 * 3);
  function fillLattice(pts) {
    for (let i = 0; i < SEG; i++) {
      const a = pts[(Math.random() * pts.length) | 0];
      /* partner: a nearby-ish point so the lattice reads cortical, not chaotic */
      let b = null, best = 1e9;
      for (let k = 0; k < 8; k++) {
        const c = pts[(Math.random() * pts.length) | 0];
        const d = (a.x - c.x) ** 2 + (a.y - c.y) ** 2 + (a.z - c.z) ** 2;
        if (d > 0.01 && d < best) { best = d; b = c; }
      }
      b = b || pts[(Math.random() * pts.length) | 0];
      lbrain.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    }
    if (lgeo.attributes.aBrain) lgeo.attributes.aBrain.needsUpdate = true;
  }
  fillLattice(brainPts);
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
    uniform vec3  uFire;
    uniform float uFireT;
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
      vec3 from3 = aFrom;
      float u = fract(uTime * (0.14 + spd * 0.12) + ph);
      /* touch-fire: ~35% of pulses re-originate from the touched spot */
      float ft = uTime - uFireT;
      if (aSeed.z < 0.35 && ft > 0.0 && ft < 1.6) {
        from3 = uFire;
        u = clamp(ft / (0.7 + aSeed.z), 0.0, 1.0);
      }
      vec3 f = vec3(from3.x * ca + from3.z * sa, from3.y, -from3.x * sa + from3.z * ca);
      vec3 t = vec3(aTo.x * ca + aTo.z * sa, aTo.y, -aTo.x * sa + aTo.z * ca);
      vec3 midv = mix(f, t, 0.5) * 1.25;      /* bulge outward */
      vec3 p = mix(mix(f, midv, u), mix(midv, t, u), u);
      vec2 pos = uCenter + vec2(p.x, -p.y) * uRadius;
      pos.y += uRelease * 300.0;
      float depth = (p.z + 1.6) / 3.2;
      /* neuron impulse: sharp attack, long decay (shaped, not a sine hump) */
      float imp = pow(clamp(u * 5.0, 0.0, 1.0), 0.6) * pow(1.0 - u, 1.6) * 1.9;
      vGlow = imp * uForm * (1.0 - uRelease) * (0.35 + 0.65 * uPulse);
      vec4 mv = modelViewMatrix * vec4(pos, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (5.0 + 5.5 * vGlow) * (0.6 + 0.6 * depth) * uDpr;
    }
  `;
  const pulseFrag = `
    precision highp float;
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
    pseed[i * 4] = Math.random();
    pseed[i * 4 + 1] = 0.5 + Math.random();
    pseed[i * 4 + 2] = Math.random();
    pseed[i * 4 + 3] = Math.random();
  }
  function fillPulses(pts) {
    for (let i = 0; i < PULSES; i++) {
      const a = pts[(Math.random() * pts.length) | 0];
      const b = pts[(Math.random() * pts.length) | 0];
      pfrom.set([a.x, a.y, a.z], i * 3);
      pto.set([b.x, b.y, b.z], i * 3);
    }
    if (pgeo.attributes.aFrom) {
      pgeo.attributes.aFrom.needsUpdate = true;
      pgeo.attributes.aTo.needsUpdate = true;
    }
  }
  fillPulses(brainPts);
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

  /* ---------- the real brain: baked MRI point cloud (NIH 3DPX-021161, CC BY) ----------
     Hot-swaps over the procedural fallback whenever it arrives; a failed fetch
     simply leaves the procedural brain in place. */
  Promise.all([fetch("points/brain-mri.bin"), fetch("points/brain-mri.json")])
    .then(function (rs) {
      if (!rs[0].ok || !rs[1].ok) throw new Error("points missing");
      return Promise.all([rs[0].arrayBuffer(), rs[1].json()]);
    })
    .then(function (loaded) {
      const f = new Float32Array(loaded[0]);
      const count = loaded[1].count;
      const stride = loaded[1].stride || 6;
      const pts = new Array(count);
      for (let i = 0; i < count; i++) {
        pts[i] = { x: f[i * stride], y: f[i * stride + 1], z: f[i * stride + 2] };
      }
      brainPts = pts;
      fillCloud(pts);
      fillLattice(pts);
      fillPulses(pts);
    })
    .catch(function () { /* procedural brain stays */ });

  /* touch-fire: tapping the brain makes that spot think */
  stage.addEventListener("pointerdown", function (e) {
    if (!brainPts.length) return;
    const r = stage.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const a = uniforms.uTime.value * 0.22;
    const ca = Math.cos(a), sa = Math.sin(a);
    const C = uniforms.uCenter.value, R = uniforms.uRadius.value;
    let best = -1, bd = 1e9;
    for (let i = 0; i < brainPts.length; i += 7) {
      const p = brainPts[i];
      const sx = C.x + (p.x * ca + p.z * sa) * R + Math.sign(p.z) * uniforms.uSplit.value * R * 0.11;
      const sy = C.y - p.y * R;
      const d = (sx - mx) * (sx - mx) + (sy - my) * (sy - my);
      if (d < bd) { bd = d; best = i; }
    }
    if (best >= 0 && bd < R * R * 0.4) {
      const p = brainPts[best];
      uniforms.uFire.value.set(p.x, p.y, p.z);
      uniforms.uFireT.value = uniforms.uTime.value;
    }
  }, { passive: true });

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
  let lastAutoFire = 0;
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
    /* Vault beat: the hemispheres part — one memory, two halves — then seal */
    uniforms.uSplit.value = clamp01((p - 0.16) / 0.07) * clamp01((0.42 - p) / 0.07);

    /* the brain thinks on its own: ambient firing every few seconds once formed */
    if (uniforms.uForm.value > 0.9 && t - lastAutoFire > 3.4 && brainPts.length) {
      lastAutoFire = t;
      if (t - uniforms.uFireT.value > 2.0) {
        const p2 = brainPts[(Math.random() * brainPts.length) | 0];
        uniforms.uFire.value.set(p2.x, p2.y, p2.z);
        uniforms.uFireT.value = t;
      }
    }

    /* halo glow follows formation, pulse beat, and firings */
    const fireGlow = Math.max(0, 1 - (t - uniforms.uFireT.value) / 1.2) * 0.4;
    stage.style.setProperty("--brain-glow",
      (0.4 * uniforms.uForm.value * (1 - uniforms.uRelease.value)
        + 0.35 * uniforms.uPulse.value + fireGlow).toFixed(3));

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
