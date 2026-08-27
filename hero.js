/* lennymadethat.com — THE FORGE hero.
   Molten sparks swirl in, forge the wordmark white-hot, quench into real
   type, then live on as ambient embers rising off the letters.
   three.js r169 (MIT, vendored at vendor/three.module.min.js).
   Fallbacks: reduced motion / no WebGL / no JS all get the finished
   static hero (CSS handles it via .is-lit / .js gating). */
import * as THREE from "./vendor/three.module.min.js";

const section = document.querySelector(".forge");
const canvas = document.getElementById("forge-canvas");
const title = document.querySelector(".forge-title");

function settleStatic() {
  if (section) section.classList.add("is-lit");
}

const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!section || !canvas || !title || reduce) {
  settleStatic();
} else {
  try {
    boot();
  } catch (e) {
    settleStatic();
  }
}

function boot() {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  let W = 1, H = 1;
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -50, 50);

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;
  const CAP = isMobile ? 14000 : 32000;
  const DUST_N = isMobile ? 500 : 1100;

  /* Replay visitors get the short cut of the film. */
  let timeScale = 1;
  try { if (sessionStorage.getItem("lmt-forged")) timeScale = 2.1; } catch (e) {}

  /* ---------- timeline (seconds, pre-timeScale) ---------- */
  const T_ASSEMBLE_START = 0.55;
  const T_ASSEMBLE_END = 2.55;
  const T_QUENCH = 3.0;
  const QUENCH_LEN = 0.85;

  /* ---------- sparks ---------- */
  const sparkUniforms = {
    uTime: { value: 0 },
    uAssemble: { value: 0 },
    uQuench: { value: 0 },
    uCalm: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2(-9999, -9999) },
    uCenter: { value: new THREE.Vector2(0.5, 0.45) },
    uDpr: { value: 1 }
  };

  const sparkVert = `
    uniform float uTime;
    uniform float uAssemble;
    uniform float uQuench;
    uniform float uCalm;
    uniform float uScroll;
    uniform vec2  uPointer;
    uniform vec2  uCenter;
    uniform float uDpr;
    attribute vec3 aStart;
    attribute vec3 aTarget;
    attribute vec4 aSeed;   /* x phase01, y speed, z sizeFactor, w role01 */
    varying float vHeat;
    varying float vAlpha;

    float easeS(float t){ t = clamp(t, 0.0, 1.0); return t*t*(3.0-2.0*t); }

    void main(){
      float ph  = aSeed.x;
      float spd = aSeed.y;
      float szf = aSeed.z;
      float role = aSeed.w;

      /* staggered per-particle assembly progress */
      float t = easeS( (uAssemble - ph*0.38) / 0.62 );

      /* pre-lock flight: wandering swirl */
      vec3 sw = aStart;
      float ang = uTime * (0.6 + spd*0.8) + ph*6.28318;
      sw.x += sin(ang + aStart.y*0.011) * 88.0;
      sw.y += cos(ang*0.83 + aStart.x*0.009) * 66.0;

      /* quadratic bezier toward the glyph, arcing upward */
      vec3 mid = mix(sw, aTarget, 0.5);
      mid.y -= 70.0 + 110.0*ph;
      vec3 pos = mix(mix(sw, mid, t), mix(mid, aTarget, t), t);

      vHeat = 0.48 + 0.52*t;
      vAlpha = 0.72 + 0.28*t;

      /* quench: burst off the glyph, then ambient embers rise */
      float q = easeS(uQuench);
      if (q > 0.0005) {
        vec2 away = aTarget.xy - uCenter;
        away += vec2(sin(ph*43.0), cos(ph*29.0)) * 60.0;
        away = normalize(away + vec2(0.0001));
        vec3 burst = aTarget;
        burst.xy += away * q * (26.0 + 70.0*ph);
        burst.y  -= q * 24.0;

        float live = step(0.85, role);          /* ~15% stay as embers */
        float cycle = fract(uTime * 0.10 * spd + ph);
        vec3 amb = aTarget;
        amb.y -= cycle * (70.0 + 120.0*spd);
        amb.x += sin(uTime*spd*1.4 + ph*21.0) * 24.0 * cycle;

        pos = mix(pos, burst, q);
        pos = mix(pos, amb, q * live);

        float burstFade = (1.0 - q) * 0.9;
        float emberA = live * (1.0 - cycle) * (1.0 - cycle) * 0.85 * (1.0 - 0.6*uCalm);
        vAlpha = mix(vAlpha, max(burstFade, emberA), q);
        vHeat  = mix(vHeat, 0.45 + 0.55*(1.0-cycle), q);
      }

      /* pointer heat: repel + brighten nearby embers */
      vec2 dp = pos.xy - uPointer;
      float d2 = dot(dp, dp);
      float inf = exp(-d2 / 8100.0);          /* ~90px falloff */
      pos.xy += normalize(dp + vec2(0.0001)) * inf * 24.0;
      vHeat += inf * 0.9;

      /* scroll: everything streams up and thins out */
      pos.y -= uScroll * (240.0 + 420.0*ph) ;
      vAlpha *= (1.0 - uScroll);

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;
      float size = (1.5 + 1.7*szf) * (0.85 + vHeat*0.7);
      gl_PointSize = size * uDpr;
    }
  `;

  const sparkFrag = `
    precision mediump float;
    varying float vHeat;
    varying float vAlpha;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float disc = smoothstep(0.5, 0.05, d);
      float core = smoothstep(0.24, 0.0, d);
      vec3 ember  = vec3(0.52, 0.12, 0.025);
      vec3 orange = vec3(0.95, 0.34, 0.14);
      vec3 hot    = vec3(1.0, 0.85, 0.58);
      float heat = clamp(vHeat, 0.0, 1.6);
      vec3 col = mix(ember, orange, clamp(heat, 0.0, 1.0));
      col = mix(col, hot, core * clamp(heat*1.15 - 0.3, 0.0, 1.0));
      float a = disc * clamp(vAlpha, 0.0, 1.0);
      if (a < 0.004) discard;
      gl_FragColor = vec4(col * (0.5 + 0.9*heat), a);
    }
  `;

  const sparkMat = new THREE.ShaderMaterial({
    uniforms: sparkUniforms,
    vertexShader: sparkVert,
    fragmentShader: sparkFrag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });

  let sparkGeo = null;
  let sparks = null;

  /* ---------- background steel dust (depth layer) ---------- */
  const dustUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uDpr: { value: 1 }
  };
  const dustVert = `
    uniform float uTime;
    uniform float uScroll;
    uniform float uDpr;
    attribute vec3 aSeed3;   /* phase, speed, size */
    varying float vA;
    void main(){
      vec3 pos = position;
      pos.x += sin(uTime*0.11*aSeed3.y + aSeed3.x*6.28318) * 26.0;
      pos.y += cos(uTime*0.09*aSeed3.y + aSeed3.x*4.0) * 20.0;
      pos.y -= uScroll * 120.0 * aSeed3.y;
      vA = (0.10 + 0.16 * aSeed3.x) * (1.0 - uScroll);
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (0.8 + aSeed3.z*1.3) * uDpr;
    }
  `;
  const dustFrag = `
    precision mediump float;
    varying float vA;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float disc = smoothstep(0.5, 0.1, length(uv));
      float a = disc * vA;
      if (a < 0.003) discard;
      gl_FragColor = vec4(vec3(0.42, 0.47, 0.52), a);
    }
  `;
  const dustMat = new THREE.ShaderMaterial({
    uniforms: dustUniforms,
    vertexShader: dustVert,
    fragmentShader: dustFrag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending
  });
  let dustGeo = null;
  let dust = null;

  /* ---------- wordmark sampling ---------- */
  function sampleTitle() {
    const rect = title.getBoundingClientRect();
    const sRect = section.getBoundingClientRect();
    const cx = rect.left - sRect.left + rect.width / 2;
    const cy = rect.top - sRect.top + rect.height / 2;
    const cs = getComputedStyle(title);
    const fontPx = parseFloat(cs.fontSize) || 80;
    const maxW = Math.max(200, title.clientWidth);

    const c = document.createElement("canvas");
    const pad = 20;
    c.width = Math.ceil(maxW + pad * 2);
    const lineH = fontPx * 1.02;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.font = fontPx + "px " + (cs.fontFamily || "Anton, sans-serif");
    const text = "LENNY MADE THAT.";
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const t = line ? line + " " + words[i] : words[i];
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = t;
    }
    if (line) lines.push(line);
    c.height = Math.ceil(lines.length * lineH + pad * 2);
    /* canvas resize resets state */
    g.font = fontPx + "px " + (cs.fontFamily || "Anton, sans-serif");
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    for (let i = 0; i < lines.length; i++) {
      g.fillText(lines[i], c.width / 2, pad + lineH * (i + 0.5));
    }
    let data;
    try { data = g.getImageData(0, 0, c.width, c.height).data; }
    catch (e) { return []; }
    const pts = [];
    const step = isMobile ? 3 : 2;
    for (let y = 0; y < c.height; y += step) {
      for (let x = 0; x < c.width; x += step) {
        if (data[(y * c.width + x) * 4 + 3] > 110) {
          pts.push(
            cx + (x - c.width / 2),
            cy + (y - c.height / 2)
          );
        }
      }
    }
    return pts;
  }

  function buildSparks() {
    const pts = sampleTitle();
    const targets = pts.length / 2;
    if (!targets) return false;
    const N = Math.min(CAP, Math.max(targets, 6000));

    const start = new Float32Array(N * 3);
    const target = new Float32Array(N * 3);
    const seed = new Float32Array(N * 4);
    const pos = new Float32Array(N * 3); /* unused by shader; three needs 'position' */

    const diag = Math.sqrt(W * W + H * H);
    for (let i = 0; i < N; i++) {
      /* spawn: loose ring around the stage — most of it visible from the
         first frame, so the opening second reads as a live swirl */
      const a = Math.random() * Math.PI * 2;
      const r = diag * (0.2 + Math.random() * 0.55);
      start[i * 3] = W / 2 + Math.cos(a) * r;
      start[i * 3 + 1] = H * 0.52 + Math.sin(a) * r * 0.62;
      start[i * 3 + 2] = 0;

      const ti = (i % targets) * 2;
      target[i * 3] = pts[ti] + (Math.random() - 0.5) * 1.6;
      target[i * 3 + 1] = pts[ti + 1] + (Math.random() - 0.5) * 1.6;
      target[i * 3 + 2] = 0;

      seed[i * 4] = Math.random();
      seed[i * 4 + 1] = 0.6 + Math.random();
      seed[i * 4 + 2] = Math.random();
      seed[i * 4 + 3] = Math.random();
    }

    if (sparks) { scene.remove(sparks); sparkGeo.dispose(); }
    sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    sparkGeo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    sparkGeo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    sparkGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.frustumCulled = false;
    scene.add(sparks);

    const tr = title.getBoundingClientRect();
    const sr = section.getBoundingClientRect();
    sparkUniforms.uCenter.value.set(
      tr.left - sr.left + tr.width / 2,
      tr.top - sr.top + tr.height / 2
    );
    return true;
  }

  function buildDust() {
    const p = new Float32Array(DUST_N * 3);
    const s = new Float32Array(DUST_N * 3);
    for (let i = 0; i < DUST_N; i++) {
      p[i * 3] = Math.random() * W;
      p[i * 3 + 1] = Math.random() * H;
      p[i * 3 + 2] = 0;
      s[i * 3] = Math.random();
      s[i * 3 + 1] = 0.5 + Math.random();
      s[i * 3 + 2] = Math.random();
    }
    if (dust) { scene.remove(dust); dustGeo.dispose(); }
    dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    dustGeo.setAttribute("aSeed3", new THREE.BufferAttribute(s, 3));
    dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = section.clientWidth;
    const h = section.clientHeight;
    if (w < 2 || h < 2) return;
    W = w; H = h;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.left = 0; camera.right = w;
    camera.top = 0; camera.bottom = h;
    camera.updateProjectionMatrix();
    sparkUniforms.uDpr.value = dpr;
    dustUniforms.uDpr.value = dpr;
    buildDust();
    buildSparks();
  }

  /* ---------- state machine ---------- */
  let t0 = 0;
  let quenchAt = 0;
  let lit = false;
  let running = false;
  let raf = 0;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function tick(nowMs) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!t0) t0 = nowMs;
    const t = ((nowMs - t0) / 1000) * timeScale;

    sparkUniforms.uTime.value = t;
    dustUniforms.uTime.value = t;

    sparkUniforms.uAssemble.value = clamp01(
      (t - T_ASSEMBLE_START) / (T_ASSEMBLE_END - T_ASSEMBLE_START)
    );

    if (!lit && t >= T_QUENCH) {
      lit = true;
      quenchAt = t;
      section.classList.add("is-hot", "is-lit");
      setTimeout(function () { section.classList.remove("is-hot"); }, 1400 / timeScale);
      try { sessionStorage.setItem("lmt-forged", "1"); } catch (e) {}
    }
    if (lit) {
      sparkUniforms.uQuench.value = clamp01((t - quenchAt) / QUENCH_LEN);
      /* embers calm to a whisper over the seconds after the quench */
      sparkUniforms.uCalm.value = clamp01((t - quenchAt - 1.2) / 3.0);
    }

    const sc = clamp01(window.scrollY / (H * 0.85));
    sparkUniforms.uScroll.value = sc;
    dustUniforms.uScroll.value = sc;

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  /* pointer heat */
  section.addEventListener("pointermove", function (e) {
    const r = section.getBoundingClientRect();
    sparkUniforms.uPointer.value.set(e.clientX - r.left, e.clientY - r.top);
  }, { passive: true });
  section.addEventListener("pointerleave", function () {
    sparkUniforms.uPointer.value.set(-9999, -9999);
  }, { passive: true });

  let resizeT = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 150);
  });

  const io = new IntersectionObserver(function (entries) {
    if (entries[0] && entries[0].isIntersecting) start();
    else stop();
  }, { threshold: 0.01 });
  io.observe(section);

  /* Anton must be loaded before glyph sampling; race a timeout so a
     blocked font CDN can't stall the show. */
  const fontReady = (document.fonts && document.fonts.load)
    ? Promise.race([
        document.fonts.load("100px Anton").then(function () {
          return (document.fonts.ready || Promise.resolve());
        }),
        new Promise(function (res) { setTimeout(res, 1600); })
      ])
    : Promise.resolve();

  fontReady.then(function () {
    resize();
    if (!sparks) { settleStatic(); stop(); return; }
    start();
    /* absolute fail-safe: content must never stay hidden */
    setTimeout(function () { settleStatic(); }, 6000);
  });
}
