/* lennymadethat.com — product signature objects.
   A product page whose slug has a baked point cloud gets a dark stage above
   the hero: the object forms from embers, slowly turns with real depth, drifts
   on a noise field, reacts to the pointer, and fires an ambient signal pulse.
   Each signature carries its own palette — the material-identity system v1.
   No points file / no WebGL / reduced motion → the page simply stays as it is. */
import * as THREE from "/vendor/three.module.min.js";

const SIGNATURES = {
  mothership: {
    bin: "/points/voyager",
    label: "VOYAGER · NASA/VTAD SCAN · LAUNCHED '77 · STILL ON THE CLOCK",
    /* starlight: cool steel-blue body, sparse white-hot cores */
    palA: [0.3, 0.36, 0.47], palB: [0.2, 0.22, 0.27], palD: [0.52, 0.5, 0.47],
    core: [0.92, 0.97, 1.0],
    spin: 0.16
  }
};

const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function slugFromPath() {
  const m = location.pathname.match(/\/products\/([a-z0-9-]+)/i);
  if (m) return m[1].toLowerCase();
  const q = new URLSearchParams(location.search).get("p");
  return q ? q.toLowerCase() : null;
}

const slug = slugFromPath();
const sig = slug && SIGNATURES[slug];
if (sig && !reduce) {
  try { boot(sig); } catch (e) { /* page stays plain */ }
}

function boot(sig) {
  const heroSection = document.querySelector(".product-hero");
  if (!heroSection) return;

  const stage = document.createElement("section");
  stage.className = "object-stage";
  stage.innerHTML = '<canvas class="object-stage__canvas" aria-hidden="true"></canvas>'
    + '<p class="object-stage__label spec">' + sig.label + "</p>";
  heroSection.parentNode.insertBefore(stage, heroSection);

  const canvas = stage.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -2000, 2000);

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;

  const uniforms = {
    uTime: { value: 0 },
    uForm: { value: 0 },
    uFire: { value: new THREE.Vector3() },
    uFireT: { value: -100 },
    uPointer: { value: new THREE.Vector2(-9999, -9999) },
    uCenter: { value: new THREE.Vector2() },
    uRadius: { value: 100 },
    uSpin: { value: sig.spin },
    uPalA: { value: new THREE.Vector3().fromArray(sig.palA) },
    uPalB: { value: new THREE.Vector3().fromArray(sig.palB) },
    uPalD: { value: new THREE.Vector3().fromArray(sig.palD) },
    uCore: { value: new THREE.Vector3().fromArray(sig.core) },
    uDpr: { value: 1 }
  };

  const vert = `
    uniform float uTime;
    uniform float uForm;
    uniform vec3  uFire;
    uniform float uFireT;
    uniform vec2  uPointer;
    uniform vec2  uCenter;
    uniform float uRadius;
    uniform float uSpin;
    uniform float uDpr;
    attribute vec3 aPos;
    attribute vec3 aScatter;
    attribute vec4 aSeed;
    varying float vHeat;
    varying float vAlpha;
    float easeS(float t){ t = clamp(t, 0.0, 1.0); return t*t*(3.0-2.0*t); }
    void main(){
      float ph = aSeed.x, spd = aSeed.y, szf = aSeed.z;
      float a = uTime * uSpin;
      float ca = cos(a), sa = sin(a);
      vec3 b = aPos;
      vec3 rb = vec3(b.x * ca + b.z * sa, b.y, -b.x * sa + b.z * ca);
      vec2 objPx = uCenter + vec2(rb.x, -rb.y) * uRadius;
      float depth = (rb.z + 1.5) / 3.0;

      float t = easeS((uForm - ph * 0.3) / 0.7);
      vec2 sc = aScatter.xy;
      sc.x += sin(uTime * (0.4 + spd * 0.4) + ph * 6.28318) * 26.0;
      sc.y += cos(uTime * (0.35 + spd * 0.3) + ph * 4.0) * 20.0;
      vec2 pos = mix(sc, objPx, t);

      vHeat = 0.3 + 0.42 * depth;
      vAlpha = (0.16 + 0.72 * depth) * t + (1.0 - t) * 0.5;

      /* signal pulse ripple */
      float ft = uTime - uFireT;
      if (ft > 0.0 && ft < 1.6) {
        vec3 df = aPos - uFire;
        float flash = exp(-dot(df, df) * 3.0) * (1.0 - ft / 1.6);
        vHeat += flash * 1.4;
        vAlpha += flash * 0.35;
      }

      /* pointer heat */
      vec2 dp = pos - uPointer;
      float d2 = dot(dp, dp);
      float inf = exp(-d2 / 8100.0);
      pos += normalize(dp + vec2(0.0001)) * inf * 20.0;
      vHeat += inf * 0.8;

      vec4 mv = modelViewMatrix * vec4(pos, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (1.4 + 1.7 * szf) * (0.6 + 0.75 * depth) * uDpr;
    }
  `;
  const frag = `
    precision highp float;
    uniform vec3 uPalA;
    uniform vec3 uPalB;
    uniform vec3 uPalD;
    uniform vec3 uCore;
    varying float vHeat;
    varying float vAlpha;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float disc = smoothstep(0.5, 0.06, d);
      float core = smoothstep(0.22, 0.0, d);
      float heat = clamp(vHeat, 0.0, 1.5);
      float t = clamp(heat, 0.0, 1.0);
      vec3 col = uPalA + uPalB * cos(6.28318 * (0.5 * t + uPalD));
      col = mix(col, uCore, core * clamp(heat * 1.1 - 0.3, 0.0, 1.0));
      float alp = disc * clamp(vAlpha, 0.0, 1.0);
      if (alp < 0.004) discard;
      gl_FragColor = vec4(col * (0.6 + 0.95 * heat), alp);
    }
  `;

  let pts = [];
  let cloud = null, geo = null;
  let W = 1, H = 1;

  function build() {
    const n = pts.length;
    geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const apos = new Float32Array(n * 3);
    const scat = new Float32Array(n * 3);
    const seed = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      apos[i * 3] = pts[i].x; apos[i * 3 + 1] = pts[i].y; apos[i * 3 + 2] = pts[i].z;
      seed[i * 4] = Math.random();
      seed[i * 4 + 1] = 0.6 + Math.random();
      seed[i * 4 + 2] = Math.random();
      seed[i * 4 + 3] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aPos", new THREE.BufferAttribute(apos, 3));
    geo.setAttribute("aScatter", new THREE.BufferAttribute(scat, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms, vertexShader: vert, fragmentShader: frag,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending
    });
    cloud = new THREE.Points(geo, mat);
    cloud.frustumCulled = false;
    scene.add(cloud);
    resize();
    start();
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (w < 2 || h < 2 || !geo) return;
    W = w; H = h;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = h;
    camera.updateProjectionMatrix();
    uniforms.uDpr.value = dpr;
    uniforms.uCenter.value.set(w / 2, h * 0.5);
    uniforms.uRadius.value = Math.min(w * 0.42, h * 0.52);
    const scat = geo.attributes.aScatter.array;
    const diag = Math.sqrt(w * w + h * h);
    for (let i = 0; i < pts.length; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = diag * (0.25 + Math.random() * 0.4);
      scat[i * 3] = w / 2 + Math.cos(ang) * r;
      scat[i * 3 + 1] = h / 2 + Math.sin(ang) * r * 0.7;
    }
    geo.attributes.aScatter.needsUpdate = true;
  }

  let running = false, raf = 0, t0 = 0, lastFire = 0;
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    uniforms.uTime.value = t;
    uniforms.uForm.value = Math.min(1, t / 2.2);
    if (uniforms.uForm.value > 0.95 && t - lastFire > 4.0) {
      lastFire = t;
      const p = pts[(Math.random() * pts.length) | 0];
      uniforms.uFire.value.set(p.x, p.y, p.z);
      uniforms.uFireT.value = t;
    }
    renderer.render(scene, camera);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  stage.addEventListener("pointermove", function (e) {
    const r = stage.getBoundingClientRect();
    uniforms.uPointer.value.set(e.clientX - r.left, e.clientY - r.top);
  }, { passive: true });
  stage.addEventListener("pointerleave", function () {
    uniforms.uPointer.value.set(-9999, -9999);
  }, { passive: true });

  const io = new IntersectionObserver(function (es) {
    if (es[0] && es[0].isIntersecting) start(); else stop();
  }, { threshold: 0.01 });
  io.observe(stage);
  let rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });

  const mobileCap = isMobile ? 10000 : 18000;
  Promise.all([fetch(sig.bin + ".bin"), fetch(sig.bin + ".json")])
    .then(function (rs) {
      if (!rs[0].ok || !rs[1].ok) throw new Error("no points");
      return Promise.all([rs[0].arrayBuffer(), rs[1].json()]);
    })
    .then(function (loaded) {
      const f = new Float32Array(loaded[0]);
      const count = loaded[1].count;
      const stride = loaded[1].stride || 6;
      const step = Math.max(1, Math.ceil(count / mobileCap));
      pts = [];
      for (let i = 0; i < count; i += step) {
        pts.push({ x: f[i * stride], y: f[i * stride + 1], z: f[i * stride + 2] });
      }
      build();
    })
    .catch(function () { stage.remove(); });
}
