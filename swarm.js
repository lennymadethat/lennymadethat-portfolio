/* lennymadethat.com — factory swarm.
   Scroll morphs real cards through a shop-floor bee cloud.
   No dependencies. Reduced motion: stacked cards, no canvas. */
(function () {
  "use strict";

  var root = document.getElementById("factory");
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    root.classList.add("is-static");
    return;
  }

  var scrollEl = root.querySelector(".swarm-scroll");
  var stage = root.querySelector(".swarm-stage");
  var canvas = document.getElementById("swarm-canvas");
  var captionEl = document.getElementById("swarm-caption");
  var cueEl = root.querySelector(".swarm-cue");
  var maker = root.querySelector("[data-lock='maker']");
  var portrait = root.querySelector(".swarm-portrait");
  var destEl = root.querySelector(".swarm-dest");
  if (!scrollEl || !stage || !canvas || !destEl) return;

  var ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    root.classList.add("is-static");
    return;
  }

  var header = document.querySelector(".site-header");
  var sampleCanvas = document.createElement("canvas");
  var locks = root.querySelectorAll("[data-lock]");

  var W = 1, H = 1, N = 900;
  var bees = [];
  var clouds = {};
  var map = [];
  var mapBeat = "";
  var progress = 0;
  var shown = 0;
  var running = false;
  var colors = { steel: "#5B6670", safety: "#F04D23", ink: "#14181B", paper: "#F2F1EC", heading: "#14181B", onInk: "#EDEBE4" };
  var pointer = { x: 0, y: 0, on: false, fine: false };
  var t0 = performance.now();
  var lastBeat = "";
  var cover = [];

  var CHARSET = "01$#¥%/<>|+RIRNAVSEC";

  var BEATS = [
    { id: "assemble", a: 0.00, b: 0.10, from: "scatter", to: "wordmark", mode: "bee", caption: "THE SHOP COMES ONLINE", whip: 1 },
    { id: "portrait", a: 0.10, b: 0.18, from: "wordmark", to: "face", mode: "bee", caption: "THE MAKER", whip: 0.7 },
    { id: "playletter", a: 0.18, b: 0.32, from: "newsletter", via: "wave", to: "phone", split: 0.42, mode: "wave", caption: "PAPER BECOMES VOICE", whip: 1.35, lock: "playletter" },
    { id: "rir", a: 0.32, b: 0.46, from: "phone", via: "matrix", to: "rir", split: 0.4, mode: "matrix", caption: "THE MARKET, OWNED", whip: 0.9, lock: "rir" },
    { id: "floor", a: 0.46, b: 0.58, from: "rir", via: "bolts", to: "floor", split: 0.4, mode: "bolt", caption: "A REAL FLOOR", whip: 0.55, lock: "floor" },
    { id: "mothership", a: 0.58, b: 0.68, from: "floor", via: "center", to: "orb", split: 0.45, mode: "orb", caption: "IN YOUR POCKET", whip: -0.8, lock: "mothership" },
    { id: "crew", a: 0.68, b: 0.82, from: "orb", to: "crew", mode: "bee", caption: "A CREW, NOT AN AI", whip: 1.1, lock: "crew" },
    { id: "vault", a: 0.82, b: 0.94, from: "crew", to: "vault", mode: "bee", caption: "ONE BRAIN", whip: 0.85, lock: "vault" },
    { id: "rest", a: 0.94, b: 1.01, from: "vault", to: "vault", mode: "rest", caption: "ONE BRAIN", whip: 0, lock: "vault" }
  ];

  function clamp(n, a, b) { return n < a ? a : n > b ? b : n; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function rand(s) {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s;
  }

  function relRect(el) {
    var s = stage.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }

  function evenPick(pts, n) {
    var out = new Array(n);
    if (!pts || !pts.length) {
      for (var i = 0; i < n; i++) out[i] = { x: W / 2, y: H / 2 };
      return out;
    }
    var len = pts.length;
    if (len === n) return pts.slice();
    for (var i = 0; i < n; i++) {
      var t = (i * len) / n;
      var a = pts[Math.floor(t) % len];
      var b = pts[Math.ceil(t) % len];
      var f = t - Math.floor(t);
      out[i] = { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) };
    }
    return out;
  }

  function shuffleMap(n, seed) {
    var a = new Array(n);
    for (var i = 0; i < n; i++) a[i] = i;
    var s = seed || 1;
    for (var i = n - 1; i > 0; i--) {
      s = rand(s);
      var j = s % (i + 1);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function outlineRect(x, y, w, h, n) {
    var pts = [];
    var peri = Math.max(1, 2 * (w + h));
    for (var i = 0; i < n; i++) {
      var d = (i / n) * peri;
      if (d < w) pts.push({ x: x + d, y: y });
      else if (d < w + h) pts.push({ x: x + w, y: y + (d - w) });
      else if (d < 2 * w + h) pts.push({ x: x + w - (d - w - h), y: y + h });
      else pts.push({ x: x, y: y + h - (d - 2 * w - h) });
    }
    return pts;
  }

  function fillRect(x, y, w, h, n, jitter) {
    var pts = [];
    var cols = Math.max(2, Math.round(Math.sqrt(n * (w / Math.max(1, h)))));
    var rows = Math.max(2, Math.round(n / cols));
    var k = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (k >= n) return pts;
        var jx = jitter ? ((k * 17) % 7) - 3 : 0;
        var jy = jitter ? ((k * 31) % 7) - 3 : 0;
        pts.push({
          x: x + (c + 0.5) / cols * w + jx,
          y: y + (r + 0.5) / rows * h + jy
        });
        k++;
      }
    }
    while (pts.length < n) pts.push(pts[pts.length % Math.max(1, k)] || { x: x, y: y });
    return pts;
  }

  function ellipseFill(cx, cy, rx, ry, n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var rad = Math.sqrt((i * 0.618) % 1);
      pts.push({ x: cx + Math.cos(a) * rx * rad, y: cy + Math.sin(a) * ry * rad });
    }
    return pts;
  }

  function sampleText(el, n) {
    if (!el) return [];
    var r = relRect(el);
    var w = Math.max(8, Math.floor(r.w));
    var h = Math.max(8, Math.floor(r.h));
    sampleCanvas.width = w;
    sampleCanvas.height = h;
    var c = sampleCanvas.getContext("2d");
    c.clearRect(0, 0, w, h);
    var cs = getComputedStyle(el);
    c.fillStyle = "#fff";
    c.font = cs.font;
    c.textAlign = "center";
    c.textBaseline = "middle";
    try { c.letterSpacing = cs.letterSpacing; } catch (e) {}
    var text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (cs.textTransform === "uppercase") text = text.toUpperCase();
    else if (cs.textTransform === "lowercase") text = text.toLowerCase();
    var lh = parseFloat(cs.lineHeight);
    if (!lh || isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.02 || 40;
    var words = text.split(" ");
    var lines = [];
    var line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (c.measureText(test).width > w - 8 && line) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
    var totalH = lines.length * lh;
    var y0 = (h - totalH) / 2 + lh / 2;
    for (var i = 0; i < lines.length; i++) {
      c.fillText(lines[i], w / 2, y0 + i * lh);
    }
    var data;
    try { data = c.getImageData(0, 0, w, h).data; } catch (e) { return outlineRect(r.x, r.y, r.w, r.h, n); }
    var raw = [];
    var step = w > 400 ? 3 : 2;
    for (var yy = 0; yy < h; yy += step) {
      for (var xx = 0; xx < w; xx += step) {
        if (data[(yy * w + xx) * 4 + 3] > 90) raw.push({ x: r.x + xx, y: r.y + yy });
      }
    }
    if (raw.length < 20) return outlineRect(r.x, r.y, r.w, r.h, n);
    return evenPick(raw, n);
  }

  function sourceBox() {
    var mobile = W < 720;
    if (mobile) {
      return { x: 18, y: Math.max(96, H * 0.16), w: W - 36, h: Math.max(80, H * 0.28) };
    }
    return { x: 28, y: H * 0.22, w: Math.min(340, W * 0.34), h: H * 0.46 };
  }

  function destBox() {
    var r = relRect(destEl);
    if (r.w < 8 || r.h < 8) {
      var mobile = W < 720;
      if (mobile) return { x: 16, y: H * 0.5, w: W - 32, h: H * 0.42 };
      return { x: W * 0.52, y: H * 0.18, w: W * 0.42, h: H * 0.64 };
    }
    return r;
  }

  function effectBox() {
    var d = destBox();
    var mobile = W < 720;
    var top = 88;
    if (mobile) {
      var h = Math.max(90, d.y - top - 12);
      return { x: 16, y: top, w: W - 32, h: h };
    }
    return { x: 24, y: 88, w: Math.max(160, d.x - 48), h: Math.max(160, H - 140) };
  }

  function inBox(x, y, b, pad) {
    pad = pad || 0;
    return x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad;
  }

  function newsletterCloud(n) {
    var b = sourceBox();
    var pts = [];
    var rows = 11;
    var per = Math.ceil(n / rows);
    for (var row = 0; row < rows; row++) {
      var y = b.y + 10 + row * (b.h - 20) / (rows - 1);
      var inset = row === 0 ? b.w * 0.25 : (row % 4 === 3 ? b.w * 0.35 : 0);
      for (var i = 0; i < per && pts.length < n; i++) {
        pts.push({
          x: b.x + 8 + (i / Math.max(1, per - 1)) * (b.w - 16 - inset),
          y: y
        });
      }
    }
    return evenPick(pts, n);
  }

  function waveCloud(n) {
    var e = effectBox();
    var b = { x: e.x, y: e.y + e.h * 0.28, w: e.w, h: e.h * 0.44 };
    var pts = [];
    for (var i = 0; i < n; i++) {
      var u = i / (n - 1);
      var x = b.x + u * b.w;
      var y = b.y + b.h / 2 + Math.sin(u * Math.PI * 6) * (b.h * 0.42) * (0.35 + 0.65 * Math.sin(u * Math.PI));
      pts.push({ x: x, y: y });
    }
    return pts;
  }

  function phoneCloud(n) {
    var e = effectBox();
    var w = Math.min(e.w * 0.42, 150, e.h * 0.38);
    var h = w * 2.05;
    if (h > e.h * 0.92) { h = e.h * 0.92; w = h / 2.05; }
    var x = e.x + (e.w - w) / 2;
    var y = e.y + Math.max(8, (e.h - h) / 2);
    var rim = outlineRect(x, y, w, h, Math.floor(n * 0.55));
    var screen = fillRect(x + 10, y + 18, w - 20, h - 36, n - rim.length, true);
    return evenPick(rim.concat(screen), n);
  }

  function matrixCloud(n) {
    var cols = Math.max(8, Math.round(W / 22));
    var rows = Math.max(8, Math.round(H / 18));
    var pts = [];
    for (var i = 0; i < n; i++) {
      var c = i % cols;
      var r = Math.floor(i / cols) % rows;
      pts.push({
        x: (c + 0.35) * (W / cols) + ((i * 13) % 7) - 3,
        y: (r + 0.2) * (H / rows) + ((i * 29) % 9) - 4
      });
    }
    return pts;
  }

  function boltsCloud(n) {
    var e = effectBox();
    return fillRect(e.x + 12, e.y + 12, e.w - 24, e.h - 24, n, true);
  }

  function plateCloud(lockName, n) {
    var el = root.querySelector("[data-lock='" + lockName + "']");
    if (!el) return outlineRect(destBox().x, destBox().y, destBox().w, destBox().h, n);
    var r = relRect(el);
    var pad = 2;
    var rim = outlineRect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, Math.floor(n * 0.72));
    var rest = n - rim.length;
    var inner = fillRect(r.x + 10, r.y + 8, r.w - 20, 6, rest, false);
    return evenPick(rim.concat(inner), n);
  }

  function crewCloud(n) {
    var el = root.querySelector("[data-lock='crew']");
    if (!el) return plateCloud("crew", n);
    var kids = el.querySelectorAll(".swarm-mini");
    if (!kids.length) return plateCloud("crew", n);
    var per = Math.floor(n / kids.length);
    var pts = [];
    for (var i = 0; i < kids.length; i++) {
      var r = relRect(kids[i]);
      pts = pts.concat(outlineRect(r.x, r.y, r.w, r.h, per));
    }
    return evenPick(pts, n);
  }

  function vaultCloud(n) {
    var d = destBox();
    var pts = [];
    var drawers = 3;
    var per = Math.floor(n / drawers);
    var gap = 10;
    var dh = (d.h - gap * (drawers - 1)) / drawers;
    for (var i = 0; i < drawers; i++) {
      var y = d.y + i * (dh + gap);
      pts = pts.concat(outlineRect(d.x, y, d.w, dh, per));
    }
    return evenPick(pts, n);
  }

  function orbCloud(n) {
    var e = effectBox();
    var cx = e.x + e.w / 2;
    var cy = e.y + e.h / 2;
    var rad = Math.min(e.w, e.h) * 0.34;
    var pts = ellipseFill(cx, cy, rad, rad, Math.floor(n * 0.45));
    var ring = [];
    for (var i = 0; i < Math.floor(n * 0.3); i++) {
      var a = (i / (n * 0.3)) * Math.PI * 2;
      ring.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad });
    }
    var chords = [];
    for (var i = 0; i < n - pts.length - ring.length; i++) {
      var a1 = (i * 2.4);
      var a2 = a1 + 1.1;
      var u = (i % 7) / 7;
      chords.push({
        x: lerp(cx + Math.cos(a1) * rad, cx + Math.cos(a2) * rad, u),
        y: lerp(cy + Math.sin(a1) * rad, cy + Math.sin(a2) * rad, u)
      });
    }
    return evenPick(pts.concat(ring, chords), n);
  }

  function scatterCloud(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var side = i % 4;
      var u = (Math.floor(i / 4) / Math.max(1, n / 4));
      if (side === 0) pts.push({ x: u * W, y: -8 - (i % 18) });
      else if (side === 1) pts.push({ x: W + 8 + (i % 18), y: u * H });
      else if (side === 2) pts.push({ x: (1 - u) * W, y: H + 8 + (i % 18) });
      else pts.push({ x: -8 - (i % 18), y: (1 - u) * H });
    }
    return pts;
  }

  function centerCloud(n) {
    var e = effectBox();
    return ellipseFill(e.x + e.w / 2, e.y + e.h / 2, 16, 16, n);
  }

  function faceCloud(n) {
    if (!portrait) return ellipseFill(W * 0.5, H * 0.42, 50, 64, n);
    var r = relRect(portrait);
    return ellipseFill(r.x + r.w / 2, r.y + r.h / 2, r.w * 0.48, r.h * 0.48, n);
  }

  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    colors.steel = (cs.getPropertyValue("--steel") || colors.steel).trim();
    colors.safety = (cs.getPropertyValue("--safety") || colors.safety).trim();
    colors.ink = (cs.getPropertyValue("--ink") || colors.ink).trim();
    colors.paper = (cs.getPropertyValue("--paper") || colors.paper).trim();
    colors.heading = (cs.getPropertyValue("--heading") || colors.heading).trim();
    colors.onInk = (cs.getPropertyValue("--text-on-ink") || colors.onInk).trim();
  }

  function rebuildClouds() {
    N = W < 480 ? 620 : W < 800 ? 920 : 1280;
    clouds.scatter = scatterCloud(N);
    clouds.wordmark = sampleText(root.querySelector(".swarm-maker h1"), N);
    clouds.face = faceCloud(N);
    clouds.newsletter = newsletterCloud(N);
    clouds.wave = waveCloud(N);
    clouds.phone = phoneCloud(N);
    clouds.matrix = matrixCloud(N);
    clouds.rir = plateCloud("rir", N);
    clouds.bolts = boltsCloud(N);
    clouds.floor = plateCloud("floor", N);
    clouds.center = centerCloud(N);
    clouds.orb = orbCloud(N);
    clouds.crew = crewCloud(N);
    clouds.vault = vaultCloud(N);
    if (bees.length !== N) spawnBees();
  }

  function spawnBees() {
    bees = new Array(N);
    var scatter = clouds.scatter || scatterCloud(N);
    for (var i = 0; i < N; i++) {
      var p = scatter[i] || { x: W / 2, y: H / 2 };
      bees[i] = {
        x: p.x,
        y: p.y,
        phase: (i * 0.137) % Math.PI * 2,
        glyph: CHARSET[i % CHARSET.length],
        lamp: 0.45 + (i % 5) * 0.1
      };
    }
    mapBeat = "";
  }

  function beatAt(p) {
    for (var i = 0; i < BEATS.length; i++) {
      if (p < BEATS[i].b) return BEATS[i];
    }
    return BEATS[BEATS.length - 1];
  }

  function cloudOf(name) {
    return clouds[name] || clouds.wordmark || scatterCloud(N);
  }

  function morphPoint(beat, i, local) {
    var from = cloudOf(beat.from);
    var to = cloudOf(beat.to);
    var idx = map[i] % N;
    var a, b, u;
    if (beat.via) {
      var mid = cloudOf(beat.via);
      var split = beat.split == null ? 0.5 : beat.split;
      if (local < split) {
        a = from[idx % from.length];
        b = mid[idx % mid.length];
        u = ease(local / split);
      } else {
        a = mid[idx % mid.length];
        b = to[idx % to.length];
        u = ease((local - split) / Math.max(0.0001, 1 - split));
      }
    } else {
      a = from[idx % from.length];
      b = to[idx % to.length];
      u = ease(local);
    }
    var mx = (a.x + b.x) * 0.5;
    var my = (a.y + b.y) * 0.5;
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var amp = (beat.whip || 0) * Math.sin(u * Math.PI) * (W < 720 ? 42 : 70);
    var px = mx + (-dy / len) * amp;
    var py = my + (dx / len) * amp;
    var x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * px + u * u * b.x;
    var y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * py + u * u * b.y;
    return { x: x, y: y, u: u, vx: b.x - a.x, vy: b.y - a.y };
  }

  function lockVisibility(name, p) {
    if (name === "maker" || name === "cue") {
      return name === "maker" ? 1 : 0;
    }
    var beat = null;
    for (var i = 0; i < BEATS.length; i++) {
      if (BEATS[i].lock === name) { beat = BEATS[i]; break; }
    }
    if (!beat) return 0;
    var span = beat.b - beat.a;
    var inStart = beat.a + span * 0.5;
    var inEnd = beat.a + span * 0.64;
    var fade = clamp((p - inStart) / Math.max(0.001, inEnd - inStart), 0, 1);
    var next = null;
    for (var j = 0; j < BEATS.length; j++) {
      if (BEATS[j].a >= beat.b && BEATS[j].lock && BEATS[j].lock !== name) {
        next = BEATS[j];
        break;
      }
    }
    if (next) {
      var out = clamp((next.a + (next.b - next.a) * 0.22 - p) / Math.max(0.02, (next.b - next.a) * 0.22), 0, 1);
      fade = Math.min(fade, out);
    }
    return fade;
  }

  function updateLocks(p) {
    for (var i = 0; i < locks.length; i++) {
      var name = locks[i].getAttribute("data-lock");
      if (name === "cue") continue;
      var v = lockVisibility(name, p);
      locks[i].style.opacity = String(v);
      if (name !== "maker") {
        locks[i].style.pointerEvents = v > 0.7 ? "auto" : "none";
      }
      locks[i].classList.toggle("is-locked", v > 0.75);
    }
    if (maker) {
      maker.classList.toggle("is-docked", p > 0.155);
      var dock = clamp((p - 0.1) / 0.08, 0, 1);
      maker.style.setProperty("--dock", dock.toFixed(3));
    }
    if (portrait) {
      var pv = clamp((p - 0.11) / 0.07, 0, 1);
      portrait.style.opacity = String(Math.max(pv, p > 0.18 ? 1 : pv));
    }
    if (cueEl) cueEl.style.opacity = String(clamp(1 - progress / 0.035, 0, 1));
  }

  function setMode(mode) {
    stage.setAttribute("data-mode", mode === "rest" ? "bee" : mode);
  }

  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);
    var headerH = header ? header.offsetHeight : 60;
    var r = scrollEl.getBoundingClientRect();
    var max = Math.max(1, scrollEl.offsetHeight - stage.offsetHeight);
    var raw = clamp((headerH - r.top) / max, 0, 1);
    progress = raw;
    var intro = progress < 0.01 ? Math.min(0.085, ((now - t0) / 2200) * 0.085) : 0;
    shown += (Math.max(progress, intro) - shown) * 0.2;

    var beat = beatAt(shown);
    if (beat.id !== mapBeat) {
      map = shuffleMap(N, 900 + beat.id.length * 97);
      mapBeat = beat.id;
    }
    if (beat.id !== lastBeat) {
      lastBeat = beat.id;
      if (captionEl) captionEl.textContent = beat.caption;
      setMode(beat.mode);
      rebuildClouds();
    }

    updateLocks(shown);

    cover = [];
    if (maker && shown > 0.185) {
      var mr = relRect(maker);
      if (mr.w > 8 && mr.h > 8) cover.push({ b: mr, pad: 12 });
    }
    if (beat.lock && lockVisibility(beat.lock, shown) > 0.55) {
      cover.push({ b: destBox(), pad: 8 });
    }

    var local = (shown - beat.a) / Math.max(0.0001, beat.b - beat.a);
    local = clamp(local, 0, 1);
    var time = (now - t0) / 1000;
    var dark = beat.mode === "matrix" || beat.mode === "bolt" || beat.id === "mothership" || beat.id === "crew";
    var body = dark ? colors.onInk : colors.steel;
    var settle = beat.mode === "rest" || local > 0.92;

    for (var i = 0; i < N; i++) {
      var m = morphPoint(beat, i, local);
      var bee = bees[i];
      var nx = m.x;
      var ny = m.y;
      if (settle) {
        nx += Math.sin(time * 0.7 + bee.phase) * 0.7;
        ny += Math.cos(time * 0.55 + bee.phase) * 0.55;
      } else {
        nx += Math.sin(time * 2.2 + bee.phase) * (1.6 * (1 - m.u));
        ny += Math.cos(time * 1.8 + bee.phase) * (1.4 * (1 - m.u));
      }
      if (pointer.on && pointer.fine) {
        var pdx = nx - pointer.x;
        var pdy = ny - pointer.y;
        var pd = pdx * pdx + pdy * pdy;
        if (pd < 6400 && pd > 4) {
          var f = 18 / pd;
          nx += pdx * f * 40;
          ny += pdy * f * 40;
        }
      }
      bee.x = nx;
      bee.y = ny;
      bee.vx = m.vx;
      bee.vy = m.vy;
      bee.u = m.u;
      if (beat.mode === "matrix" && ((i + Math.floor(time * 6)) % 11 === 0)) {
        bee.glyph = CHARSET[(i + Math.floor(time * 9)) % CHARSET.length];
      }
    }

    draw(beat, time, body, local);
  }

  function draw(beat, time, body, local) {
    ctx.clearRect(0, 0, W, H);
    var mode = beat.mode;
    var inFlight = mode !== "rest" && local < 0.9;
    function covered(x, y) {
      for (var k = 0; k < cover.length; k++) {
        if (inBox(x, y, cover[k].b, cover[k].pad)) return true;
      }
      return false;
    }

    if (mode === "matrix") {
      ctx.save();
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(61,255,122,0.55)");
      g.addColorStop(1, "rgba(61,255,122,0.12)");
      ctx.fillStyle = g;
      var glyphN = Math.min(N, 280);
      for (var i = 0; i < glyphN; i += 1) {
        var bee = bees[i];
        if (covered(bee.x, bee.y)) continue;
        ctx.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(time * 3 + bee.phase));
        ctx.fillText(bee.glyph, bee.x, bee.y);
      }
      ctx.restore();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = "#3DFF7A";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (var i = glyphN; i < N; i++) {
        var bee = bees[i];
        if (covered(bee.x, bee.y)) continue;
        ctx.moveTo(bee.x - 1.4, bee.y);
        ctx.lineTo(bee.x + 1.4, bee.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (mode === "bolt") {
      ctx.fillStyle = body;
      var s = 3.2;
      for (var i = 0; i < N; i++) {
        var bee = bees[i];
        if (covered(bee.x, bee.y)) continue;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(bee.x - s, bee.y - 1, s * 2, 2);
        ctx.fillRect(bee.x - 1, bee.y - s, 2, s * 2);
      }
      ctx.fillStyle = colors.safety;
      ctx.globalAlpha = 0.9;
      for (var i = 0; i < N; i += 3) {
        if (covered(bees[i].x, bees[i].y)) continue;
        ctx.fillRect(bees[i].x - 1, bees[i].y - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
      return;
    }

    var len = mode === "wave" ? 7.5 : mode === "rest" ? 3.4 : 5.2;
    ctx.strokeStyle = body;
    ctx.lineWidth = mode === "wave" ? 1.7 : 1.45;
    ctx.globalAlpha = mode === "rest" ? 0.55 : 0.82;
    ctx.beginPath();
    for (var i = 0; i < N; i++) {
      var bee = bees[i];
      if (covered(bee.x, bee.y)) continue;
      var ang = Math.atan2(bee.vy || 0, bee.vx || 1);
      if (!inFlight) ang = bee.phase * 0.4;
      var dx = Math.cos(ang) * len * 0.5;
      var dy = Math.sin(ang) * len * 0.5;
      ctx.moveTo(bee.x - dx, bee.y - dy);
      ctx.lineTo(bee.x + dx, bee.y + dy);
    }
    ctx.stroke();

    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = body;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    var wing = mode === "wave" ? 0 : 2;
    if (wing) {
      for (var i = 0; i < N; i += 2) {
        var bee = bees[i];
        if (covered(bee.x, bee.y)) continue;
        var flap = Math.sin(time * 14 + bee.phase);
        ctx.moveTo(bee.x, bee.y);
        ctx.lineTo(bee.x + flap * 3.5, bee.y - 3.2);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.safety;
    var lampEvery = mode === "rest" ? 4 : 1;
    for (var i = 0; i < N; i += lampEvery) {
      var bee = bees[i];
      if (covered(bee.x, bee.y)) continue;
      var pulse = 0.55 + 0.45 * Math.sin(time * 2.4 + bee.phase);
      ctx.globalAlpha = (mode === "wave" ? 0.95 : 0.8) * pulse;
      ctx.fillRect(bee.x - 0.9, bee.y - 0.9, 2.1, 2.1);
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (w < 2 || h < 2) return;
    W = w;
    H = h;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readTheme();
    rebuildClouds();
  }

  function onScrollProgress() {
    /* rAF reads layout; this just keeps the loop hot if it was paused */
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
  }

  pointer.fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (pointer.fine) {
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.on = true;
    });
    stage.addEventListener("pointerleave", function () { pointer.on = false; });
  }

  var ro = new ResizeObserver(function () { resize(); });
  ro.observe(stage);

  var io = new IntersectionObserver(function (entries) {
    if (entries[0] && entries[0].isIntersecting) start();
    else stop();
  }, { threshold: 0.02 });
  io.observe(stage);

  var themeWatch = new MutationObserver(function () { readTheme(); });
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function boot() {
    readTheme();
    resize();
    start();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () { resize(); });
  window.addEventListener("scroll", onScrollProgress, { passive: true });
})();
