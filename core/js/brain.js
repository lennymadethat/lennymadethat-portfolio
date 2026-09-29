/* CORE memory brain — GPU point cloud + geodesic cage + synapse pulses.
   House recipe: dark ground, additive glow, depth, mouse heat.
   three.js r169 MIT, vendored. Procedural brain surface (no model file). */
import * as THREE from "../../vendor/three.module.min.js";

const FILES = [
  "CLAUDE.md", "digest.json", "state-of-play", "rico-voice.md",
  "morning-brief", "sentinel.json", "carl-schema", "vault/index",
  "playletter.apk", "aloud/karaoke", "us3-ops", "gym/mesocycle",
  "family/kylo", "yield/watch", "rir/sunday", "particle-forge",
  "mothership", "harvester", "voice-engine", "brief.mp3",
  "agent-inbox", "lonzone", "chronos", "assembly",
  "health/sleep", "tax-2025", "irish-estate", "photo-engine",
  "fleet/workers", "lenny-os", "triton", "flip-desk",
  "newsletter", "g-brain", "coach", "sellstuff"
];

function brainPoint() {
  let x = 0, y = 0, z = 0, l = 0;
  do {
    x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
    l = Math.sqrt(x * x + y * y + z * z);
  } while (l < 0.0001 || l > 1);
  x /= l; y /= l; z /= l;
  let px = x * 1.32, py = y * 0.92, pz = z * 1.02;
  const w =
    Math.sin(px * 3.4 + py * 1.7) * 0.55 +
    Math.sin(py * 4.6 + pz * 2.2) * 0.3 +
    Math.sin(pz * 5.3 + px * 2.9) * 0.25;
  px += x * 0.13 * w; py += y * 0.13 * w; pz += z * 0.13 * w;
  const fz = Math.max(0, 1 - Math.abs(px) / 0.2);
  if (py > -0.25) py -= 0.3 * fz * fz;
  px += (px < 0 ? -1 : 1) * 0.05 * fz;
  if (py < -0.15 && Math.abs(px) > 0.45) { px *= 1.08; py *= 1.04; }
  if (py < -0.5) { py = -0.5 - (py + 0.5) * 0.45; px *= 0.9; pz *= 0.92; }
  const ta = -0.12, ct = Math.cos(ta), st = Math.sin(ta);
  return { x: px * ct - py * st, y: px * st + py * ct, z: pz };
}

function lobeColor(p) {
  const ang = Math.atan2(p.z, p.x);
  const t = (ang + Math.PI) / (Math.PI * 2);
  const bands = [
    [1.00, 0.42, 0.16],
    [0.75, 0.42, 1.00],
    [0.18, 0.90, 0.80],
    [0.91, 0.71, 0.35],
    [0.36, 0.62, 1.00],
    [0.95, 0.36, 0.56],
  ];
  const u = t * bands.length;
  const i = Math.floor(u) % bands.length;
  const j = (i + 1) % bands.length;
  const f = u - Math.floor(u);
  const a = bands[i], b = bands[j];
  const mix = (q) => a[q] + (b[q] - a[q]) * f;
  const r = mix(0);
  const g = mix(1);
  const bl = mix(2);
  return [r, g, bl];
}

function icosphere(subdiv) {
  const t = (1 + Math.sqrt(5)) / 2;
  const nrm = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(nrm);
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const midCache = new Map();
  const mid = (a, b) => {
    const k = a < b ? a + "," + b : b + "," + a;
    if (midCache.has(k)) return midCache.get(k);
    const va = verts[a], vb = verts[b];
    const i = verts.length;
    verts.push(nrm([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]));
    midCache.set(k, i);
    return i;
  };
  for (let s = 0; s < subdiv; s++) {
    const next = [];
    midCache.clear();
    for (const [a, b, c] of faces) {
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }
  const edges = new Set();
  const pushE = (a, b) => edges.add(a < b ? a + "-" + b : b + "-" + a);
  for (const [a, b, c] of faces) { pushE(a, b); pushE(b, c); pushE(c, a); }
  const pos = [];
  for (const e of edges) {
    const [a, b] = e.split("-").map(Number);
    pos.push(...verts[a], ...verts[b]);
  }
  return { verts, pos: new Float32Array(pos) };
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uForm;
  uniform float uExplode;
  uniform float uRot;
  uniform vec2  uPointer;
  uniform float uHeat;
  uniform vec3  uTint;
  uniform float uTintAmt;
  uniform float uDpr;
  uniform float uSize;
  attribute vec3 aBrain;
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute vec4 aSeed;
  varying vec3 vColor;
  varying float vHeat;
  varying float vAlpha;

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }
  float easeS(float t) { t = clamp(t, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }

  void main() {
    float stagger = aSeed.x;
    float form = easeS((uForm - stagger * 0.45) / 0.55);
    vec3 brain = aBrain;
    float breathe = 1.0 + 0.018 * sin(uTime * 1.4 + aSeed.y * 6.28);
    brain *= breathe;
    float ex = easeS(uExplode) * (0.55 + aSeed.z * 0.9);
    vec3 n = normalize(aBrain + 0.0001);
    brain += n * ex;
    vec3 pos = mix(aScatter, brain, form);
    pos = rotY(pos, uRot);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / max(clip.w, 0.0001);
    vec2 dp = ndc - uPointer;
    float d2 = dot(dp, dp);
    float inf = exp(-d2 * 16.0) * uHeat;
    mv.xy += normalize(dp + 0.0001) * inf * 0.22;

    float depth = clamp((-mv.z - 1.6) / 2.8, 0.0, 1.0);
    float front = mix(0.18, 1.0, 1.0 - depth);
    vHeat = aSeed.w * 0.28 + inf * 0.9;
    vHeat = clamp(vHeat, 0.0, 1.2);
    vColor = mix(aColor, uTint, uTintAmt * 0.85);
    vAlpha = front * mix(0.2, 1.0, form) * (0.75 + 0.35 * (1.0 - ex * 0.4));

    gl_Position = projectionMatrix * mv;
    float sz = uSize * (0.75 + aSeed.z * 1.1) * mix(0.55, 1.35, front) * (1.0 + inf * 1.4) * (1.2 - length(aBrain) * 0.4);
    gl_PointSize = sz * uDpr;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vHeat;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.08, d);
    float core = smoothstep(0.22, 0.0, d);
    vec3 hot = mix(vColor * 1.15, vec3(1.0, 0.86, 0.58), clamp(vHeat * 0.22, 0.0, 1.0));
    vec3 col = hot * disc + vec3(1.0, 0.94, 0.82) * core * vHeat * 0.45;
    float a = (disc * 0.85 + core * 0.55) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
  }
`;

const LINE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uRot;
  uniform float uForm;
  uniform float uAlpha;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vA;
  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }
  void main() {
    vec3 p = rotY(position, uRot);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float front = clamp(1.0 - ((-mv.z - 1.4) / 3.0), 0.12, 1.0);
    vColor = aColor;
    vA = uAlpha * front * uForm;
    gl_Position = projectionMatrix * mv;
  }
`;
const LINE_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vA;
  void main() { gl_FragColor = vec4(vColor, vA); }
`;

const PULSE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uRot;
  uniform float uDpr;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vA;
  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }
  void main() {
    float u = fract(uTime * (0.12 + aSeed.y * 0.22) + aSeed.x);
    vec3 mid = mix(aFrom, aTo, 0.5);
    mid += normalize(mid + 0.0001) * 0.28;
    vec3 p = mix(mix(aFrom, mid, u), mix(mid, aTo, u), u);
    p = rotY(p, uRot);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vColor = aColor;
    vA = sin(u * 3.14159);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (4.2 + vA * 5.5) * uDpr;
  }
`;
const PULSE_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vA;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(mix(vColor, vec3(1.0), 0.45) * disc, disc * vA);
  }
`;

const GLOW_VERT = /* glsl */ `
  uniform float uRot;
  uniform float uForm;
  varying vec3 vN;
  varying vec3 vV;
  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }
  void main() {
    vec3 p = rotY(position * (0.92 + 0.08 * uForm), uRot);
    vec4 w = modelMatrix * vec4(p, 1.0);
    vN = normalize(p);
    vV = cameraPosition - w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const GLOW_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uTint;
  uniform float uTintAmt;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
    vec3 c = mix(vec3(0.75, 0.35, 1.0), vec3(1.0, 0.45, 0.18), 0.4);
    c = mix(c, uTint, uTintAmt);
    gl_FragColor = vec4(c, f * 0.42);
  }
`;

export function createBrain(canvas, opts = {}) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: false, powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0.06, 3.9);
  camera.lookAt(0, 0, 0);

  const uniforms = {
    uTime: { value: 0 },
    uForm: { value: reduce ? 1 : 0 },
    uExplode: { value: 0 },
    uRot: { value: 0 },
    uPointer: { value: new THREE.Vector2(8, 8) },
    uHeat: { value: 1 },
    uTint: { value: new THREE.Vector3(1.0, 0.42, 0.16) },
    uTintAmt: { value: 0 },
    uDpr: { value: 1 },
    uSize: { value: 7.2 },
    uAlpha: { value: 0.16 },
  };

  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 720;
  const N = isMobile ? 9000 : 18000;

  const aBrain = new Float32Array(N * 3);
  const aScatter = new Float32Array(N * 3);
  const aColor = new Float32Array(N * 3);
  const aSeed = new Float32Array(N * 4);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const p = brainPoint();
    /* dense core: most motes live inside the vault, not on a giant shell */
    const roll = Math.random();
    const s = roll < 0.55 ? 0.10 + Math.random() * 0.22
      : roll < 0.88 ? 0.32 + Math.random() * 0.22
      : 0.52 + Math.random() * 0.16;
    p.x *= s; p.y *= s; p.z *= s;
    aBrain[i * 3] = p.x; aBrain[i * 3 + 1] = p.y; aBrain[i * 3 + 2] = p.z;
    pts.push(p);
    const ang = Math.random() * Math.PI * 2;
    const rad = 1.6 + Math.random() * 2.4;
    aScatter[i * 3] = Math.cos(ang) * rad;
    aScatter[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
    aScatter[i * 3 + 2] = Math.sin(ang) * rad;
    const c = lobeColor(p);
    aColor[i * 3] = c[0]; aColor[i * 3 + 1] = c[1]; aColor[i * 3 + 2] = c[2];
    aSeed[i * 4] = Math.random();
    aSeed[i * 4 + 1] = Math.random();
    aSeed[i * 4 + 2] = Math.random();
    aSeed[i * 4 + 3] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("aBrain", new THREE.BufferAttribute(aBrain, 3));
  geo.setAttribute("aScatter", new THREE.BufferAttribute(aScatter, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 4));
  geo.setAttribute("position", new THREE.BufferAttribute(aBrain, 3));
  const cloud = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(cloud);

  const ico = icosphere(2);
  const cageGeo = new THREE.BufferGeometry();
  const cagePos = ico.pos.map((v) => v * 1.28);
  cageGeo.setAttribute("position", new THREE.BufferAttribute(cagePos, 3));
  const cageCol = new Float32Array(cagePos.length);
  for (let i = 0; i < cageCol.length; i += 3) {
    cageCol[i] = 0.42; cageCol[i + 1] = 0.46; cageCol[i + 2] = 0.58;
  }
  cageGeo.setAttribute("aColor", new THREE.BufferAttribute(cageCol, 3));
  const cage = new THREE.LineSegments(cageGeo, new THREE.ShaderMaterial({
    uniforms, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(cage);

  const SYN = isMobile ? 180 : 360;
  const synPos = [];
  const synCol = [];
  const used = [];
  for (let i = 0; i < SYN; i++) {
    const a = (Math.random() * N) | 0;
    let best = a, bestD = 99;
    for (let k = 0; k < 12; k++) {
      const b = (Math.random() * N) | 0;
      const dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD && d > 0.04) { bestD = d; best = b; }
    }
    synPos.push(pts[a].x, pts[a].y, pts[a].z, pts[best].x, pts[best].y, pts[best].z);
    const ca = lobeColor(pts[a]);
    synCol.push(ca[0], ca[1], ca[2], ca[0], ca[1], ca[2]);
    used.push([a, best]);
  }
  const synGeo = new THREE.BufferGeometry();
  synGeo.setAttribute("position", new THREE.Float32BufferAttribute(synPos, 3));
  synGeo.setAttribute("aColor", new THREE.Float32BufferAttribute(synCol, 3));
  const synUni = {
    ...uniforms,
    uAlpha: { value: 0.13 },
  };
  scene.add(new THREE.LineSegments(synGeo, new THREE.ShaderMaterial({
    uniforms: synUni, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  const PUL = isMobile ? 28 : 56;
  const pFrom = new Float32Array(PUL * 3);
  const pTo = new Float32Array(PUL * 3);
  const pSeed = new Float32Array(PUL * 4);
  const pCol = new Float32Array(PUL * 3);
  for (let i = 0; i < PUL; i++) {
    const pair = used[(Math.random() * used.length) | 0];
    const A = pts[pair[0]], B = pts[pair[1]];
    pFrom[i * 3] = A.x; pFrom[i * 3 + 1] = A.y; pFrom[i * 3 + 2] = A.z;
    pTo[i * 3] = B.x; pTo[i * 3 + 1] = B.y; pTo[i * 3 + 2] = B.z;
    pSeed[i * 4] = Math.random();
    pSeed[i * 4 + 1] = Math.random();
    pSeed[i * 4 + 2] = Math.random();
    pSeed[i * 4 + 3] = Math.random();
    const c = lobeColor(A);
    pCol[i * 3] = c[0]; pCol[i * 3 + 1] = c[1]; pCol[i * 3 + 2] = c[2];
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pFrom, 3));
  pGeo.setAttribute("aFrom", new THREE.BufferAttribute(pFrom, 3));
  pGeo.setAttribute("aTo", new THREE.BufferAttribute(pTo, 3));
  pGeo.setAttribute("aSeed", new THREE.BufferAttribute(pSeed, 4));
  pGeo.setAttribute("aColor", new THREE.BufferAttribute(pCol, 3));
  scene.add(new THREE.Points(pGeo, new THREE.ShaderMaterial({
    uniforms, vertexShader: PULSE_VERT, fragmentShader: PULSE_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  const FN = FILES.length;
  const fBrain = new Float32Array(FN * 3);
  const fScatter = new Float32Array(FN * 3);
  const fColor = new Float32Array(FN * 3);
  const fSeed = new Float32Array(FN * 4);
  const filePts = [];
  for (let i = 0; i < FN; i++) {
    const p = brainPoint();
    const s = 0.92 + Math.random() * 0.18;
    const q = { x: p.x * s, y: p.y * s, z: p.z * s, name: FILES[i] };
    filePts.push(q);
    fBrain[i * 3] = q.x; fBrain[i * 3 + 1] = q.y; fBrain[i * 3 + 2] = q.z;
    const ang = (i / FN) * Math.PI * 2;
    fScatter[i * 3] = Math.cos(ang) * 2.6;
    fScatter[i * 3 + 1] = Math.sin(i * 1.7) * 0.4;
    fScatter[i * 3 + 2] = Math.sin(ang) * 2.6;
    const c = lobeColor(p);
    fColor[i * 3] = c[0]; fColor[i * 3 + 1] = c[1]; fColor[i * 3 + 2] = c[2];
    fSeed[i * 4] = 0.15 + (i / FN) * 0.5;
    fSeed[i * 4 + 1] = Math.random();
    fSeed[i * 4 + 2] = 0.85;
    fSeed[i * 4 + 3] = 0.8;
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute("aBrain", new THREE.BufferAttribute(fBrain, 3));
  fGeo.setAttribute("aScatter", new THREE.BufferAttribute(fScatter, 3));
  fGeo.setAttribute("aColor", new THREE.BufferAttribute(fColor, 3));
  fGeo.setAttribute("aSeed", new THREE.BufferAttribute(fSeed, 4));
  fGeo.setAttribute("position", new THREE.BufferAttribute(fBrain, 3));
  const fileExplode = { value: 0 };
  const fUni = {
    uTime: uniforms.uTime,
    uForm: uniforms.uForm,
    uExplode: fileExplode,
    uRot: uniforms.uRot,
    uPointer: uniforms.uPointer,
    uHeat: uniforms.uHeat,
    uTint: uniforms.uTint,
    uTintAmt: uniforms.uTintAmt,
    uDpr: uniforms.uDpr,
    uSize: { value: 4.2 },
  };
  scene.add(new THREE.Points(fGeo, new THREE.ShaderMaterial({
    uniforms: fUni, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 48, 32),
    new THREE.ShaderMaterial({
      uniforms, vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  scene.add(glow);

  let W = 1, H = 1, dpr = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    uniforms.uDpr.value = dpr;
    uniforms.uSize.value = isMobile ? 3.8 : 4.8;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);

  let rot = 0;
  let rotVel = reduce ? 0 : 0.18;
  let dragging = false;
  let lastX = 0;
  let explodeT = 0;
  let explodeDir = 0;
  let form = reduce ? 1 : 0;
  let tintAmt = 0;
  let targetTintAmt = 0;
  const tint = new THREE.Color("#ff6a2a");
  let pointerNdc = new THREE.Vector2(8, 8);
  let running = true;
  const t0 = performance.now();

  function hexToVec(hex) {
    const c = new THREE.Color(hex);
    uniforms.uTint.value.set(c.r, c.g, c.b);
  }

  function projectFile(i, rotAngle) {
    const q = filePts[i];
    const c = Math.cos(rotAngle), s = Math.sin(rotAngle);
    const x = q.x * c + q.z * s;
    const z = -q.x * s + q.z * c;
    const ex = fileExplode.value;
    const mag = 1 + ex * 1.15;
    const v = new THREE.Vector3(x * mag, q.y * mag, z * mag);
    v.project(camera);
    return {
      name: q.name,
      x: (v.x * 0.5 + 0.5) * W,
      y: (-v.y * 0.5 + 0.5) * H,
      z: v.z,
      visible: v.z < 1,
    };
  }

  let raf = 0;
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    uniforms.uTime.value = t;
    if (!reduce && !dragging) rot += rotVel * 0.016;
    rotVel *= 0.96;
    if (!reduce && !dragging) rotVel += 0.18 * 0.016;
    uniforms.uRot.value = rot;
    if (form < 1) {
      form = Math.min(1, form + 0.02);
      uniforms.uForm.value = form * form * (3 - 2 * form);
      if (form >= 1 && opts.onFormed) opts.onFormed();
    }
    if (explodeDir !== 0) {
      explodeT = Math.max(0, Math.min(1, explodeT + explodeDir * 0.022));
      fileExplode.value = explodeT * explodeT * (3 - 2 * explodeT);
      if (explodeT >= 1 && explodeDir > 0) explodeDir = 0;
      if (explodeT <= 0 && explodeDir < 0) explodeDir = 0;
    }
    tintAmt += (targetTintAmt - tintAmt) * 0.08;
    uniforms.uExplode.value = 0;
    uniforms.uTintAmt.value = tintAmt;
    uniforms.uPointer.value.copy(pointerNdc);
    renderer.render(scene, camera);
    if (opts.onFrame) opts.onFrame({ rot, explode: uniforms.uExplode.value, form: uniforms.uForm.value });
  }
  raf = requestAnimationFrame(frame);

  const el = canvas.parentElement || canvas;
  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("a, button, input, textarea, .node, .widget, .hud, .core-hit")) return;
    dragging = true;
    lastX = e.clientX;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointerup", () => { dragging = false; });
  el.addEventListener("pointerleave", () => {
    pointerNdc.set(8, 8);
    dragging = false;
  });
  el.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointerNdc.set(nx, ny);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rot += dx * 0.008;
      rotVel = dx * 0.12;
    }
  });

  return {
    setTint(hex, amt = 1) {
      hexToVec(hex);
      targetTintAmt = amt;
    },
    clearTint() { targetTintAmt = 0; },
    explode() {
      if (explodeT > 0.5) explodeDir = -1;
      else explodeDir = 1;
    },
    isExploded() { return explodeT > 0.5; },
    files() { return filePts; },
    projectFiles() {
      const out = [];
      for (let i = 0; i < FN; i++) out.push(projectFile(i, rot));
      return out;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
    },
  };
}
