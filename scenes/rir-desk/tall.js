// The tall RIR desk (phones), drawn into ONE canvas.
// The first phone build stacked ~100 composited layers (screen strips, blended glows, animated filters) and
// Android Chrome ran out of tile memory: black squares, a hollow Carl, flashing. Here the heavy work is done
// at build time (pages pre-bent onto the curved glass, bloom baked into the bolts) and the phone composites
// one canvas: plate, screens, Carl, him, light — light added with 'lighter', which is true additive.

const rand = (a, b) => a + Math.random() * (b - a);
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const load = (src) => new Promise((res, rej) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = rej; im.src = src; });

export async function run({ L, DIR, SHOTS, view, stage, reduced }) {
  const [W, H] = L.size;
  stage.style.display = "none";
  const cv = document.createElement("canvas");
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  view.appendChild(cv);
  const ctx = cv.getContext("2d", { alpha: false });

  // ---------- assets ----------
  const keys = Object.keys(L.warped);
  const [plate, man, orb, ...rest] = await Promise.all([
    load(DIR + L.plate), load(DIR + "man.webp"), load(DIR + "orb.webp"),
    ...L.placed.map((p) => load("img/" + p.src)),
    ...keys.flatMap((k) => L.warped[k].shots.map((n) => load(DIR + n))),
  ]);
  const bolts = rest.slice(0, L.placed.length);
  let at = L.placed.length;
  const screens = {};
  for (const k of keys) {
    const w = L.warped[k];
    screens[k] = { box: w, imgs: rest.slice(at, at + w.shots.length), names: w.shots.map((n) => n.replace(`warp-${k}-`, "").replace(".webp", "")), cur: 0, prev: -1, fadeAt: 0, flash: 0 };
    at += w.shots.length;
  }
  const O = { x: L.orbCentre.x, y: L.orbCentre.y, r: L.orbCentre.r };

  // Carl alive: a looping clip of his sphere (Gemini Veo, from his own painting), drawn through a soft round mask.
  // Until it can play (or if it never can), the painted sphere stands in.
  let carlVid = null, carlReady = false, vc = null, vg = null, mask = null;
  if (L.carlVideo) {
    carlVid = Object.assign(document.createElement("video"), { muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto" });
    carlVid.setAttribute("muted", ""); carlVid.setAttribute("playsinline", "");
    carlVid.src = "img/" + L.carlVideo.src;
    carlVid.addEventListener("playing", () => (carlReady = true));
    carlVid.play().catch(() => {});
    const SZ = 512;
    vc = document.createElement("canvas"); vc.width = vc.height = SZ; vg = vc.getContext("2d");
    mask = document.createElement("canvas"); mask.width = mask.height = SZ;
    const mg = mask.getContext("2d"), gr = mg.createRadialGradient(SZ / 2, SZ / 2, 0, SZ / 2, SZ / 2, SZ / 2);
    const inner = L.carlVideo.solid || 0.72;
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(inner, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    mg.fillStyle = gr; mg.fillRect(0, 0, SZ, SZ);
  }

  // little light sprites, made once
  const dot = (size, inner) => {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d"), r = size / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, inner); gr.addColorStop(1, "rgba(138,199,222,0)");
    g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
  };
  const SPARK = dot(64, "rgba(235,248,255,1)"), STAR = dot(16, "rgba(235,245,255,1)");

  // ---------- camera ----------
  // Inside the portfolio swipe the homepage pins this slide and the page scroll drives it (Lenny 10-08): the desk is
  // drawn whole at the phone's width, its top edge under the site header. The scene tells the homepage how tall that
  // is ({scene:"height", h}); the homepage makes the frame that tall and slides it up on the GPU as you scroll.
  // Standalone it covers the screen, framed from the top (the words live in the sky).
  const embedded = document.documentElement.classList.contains("embed") && window.parent !== window;
  // the site header's real height (thinner on phones since 10-08); the desk's top edge sits right under it
  let TOP = 0;
  try { TOP = embedded ? (window.parent.document.querySelector(".sk-nav")?.offsetHeight || 68) : 0; } catch { TOP = embedded ? 68 : 0; }
  const copyEl = document.getElementById("copy");
  if (embedded && copyEl) copyEl.style.top = TOP + 6 + "px";
  let dpr = 1, cw = 1, ch = 1, s = 1, X = 0, Y = 0, asked = -1, driven = false;
  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = view.clientWidth; ch = view.clientHeight;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    if (embedded) {
      // the whole desk at the phone's width; the homepage makes this frame that tall and slides it
      s = cw / W; X = 0; Y = TOP;
      const need = Math.ceil(TOP + H * s);
      if (need !== asked) { asked = need; window.parent.postMessage({ scene: "height", h: need }, location.origin); }
    } else {
      s = Math.max(cw / W, ch / H);
      X = (cw - W * s) / 2;
      Y = Math.min(0, Math.max(ch - H * s, -(L.focusY || 0) * s));
    }
    placeCallouts(); placeSentinels();
  }

  // ---------- callouts: a lower third on the struck screen ----------
  const callouts = {};
  for (const k of keys) {
    const c = document.createElement("div"); c.className = "callout";
    c.innerHTML = '<div class="k"></div><div class="t"></div><div class="s"></div>';
    document.body.appendChild(c); callouts[k] = { el: c, until: 0 };
  }
  function placeCallouts() {
    const vr = view.getBoundingClientRect();
    for (const [k, c] of Object.entries(callouts)) {
      const edge = L.curved[k], mid = edge.bot[Math.floor(edge.bot.length / 2)];
      const w = Math.min(360, (edge.bot[edge.bot.length - 1][0] - edge.bot[0][0]) * s * 0.86);
      c.el.style.width = w + "px";
      c.el.style.left = vr.left + X + mid[0] * s + "px";
      c.el.style.top = vr.top + Y + (mid[1] - 18) * s + "px";
    }
  }
  function showCallout(k, shot, t) {
    const c = callouts[k], words = SHOTS[shot]; if (!c || !words) return;
    c.el.querySelector(".k").textContent = words[0];
    c.el.querySelector(".t").textContent = words[1];
    c.el.querySelector(".s").textContent = words[2];
    c.el.classList.add("on"); c.until = t + 3400;
  }
  addEventListener("resize", layout);

  // ---------- strikes ----------
  // four kinds of strike: each bolt Gemini painted, and the same bolt mirrored through Carl (lands on the other side)
  const strikes = L.placed.flatMap((p, i) => [
    { ...p, img: bolts[i], flip: false },
    { ...p, img: bolts[i], flip: true, hit: [2 * O.x - p.hit[0], p.hit[1]] },
  ]);
  const byScreen = {};
  for (const st of strikes) (byScreen[st.screen] ||= []).push(st);
  const pickN = {};
  let live = [], nextStrike = 1600, turn = 0, count = 0;
  function fire(st, t) { live.push({ st, t0: t, swapped: false }); }
  function schedule(t) {
    count++;
    const order = [0, 2, 1, 3];                         // top, bottom, top mirrored, bottom mirrored
    fire(strikes[order[turn++ % order.length]], t);
    if (count % 5 === 0) fire(strikes[order[turn++ % order.length]], t);
    nextStrike = t + rand(4200, 6200);
  }
  // scrolling a screen through the middle of the phone makes Carl strike it
  let lastHit = {};
  function strikeScreen(k) {
    if (driven) return;
    const t = performance.now();
    if (t - (lastHit[k] || -1e9) < 1400) return;
    lastHit[k] = t;
    const list = byScreen[k]; pickN[k] = (pickN[k] || 0) + 1;
    fire(list[pickN[k] % list.length], t);
    nextStrike = Math.max(nextStrike, t + 3000);
  }
  const sentinels = {};
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) strikeScreen(e.target.dataset.k); }),
    { rootMargin: "-36% 0px -36% 0px" });
  for (const k of keys) {
    const d = document.createElement("div");
    d.dataset.k = k; d.style.cssText = "position:absolute;left:0;right:0;height:2px;pointer-events:none";
    view.appendChild(d); sentinels[k] = d; io.observe(d);
  }
  function placeSentinels() {
    for (const [k, d] of Object.entries(sentinels)) { const b = L.warped[k]; d.style.top = Y + (b.y + b.h / 2) * s + "px"; }
  }
  placeSentinels();
  // scroll strikes: the top screen, the bottom screen, then both at once (the mirrored bolts take turns)
  let lastA = 0;
  function scrollStrike(k) {
    const t = performance.now(), which = k === 0 ? ["T"] : k === 1 ? ["B"] : ["T", "B"];
    for (const scr of which) {
      const list = byScreen[scr]; pickN[scr] = (pickN[scr] || 0) + 1;
      fire(list[pickN[scr] % list.length], t);
    }
  }
  const CHARGE = 600, TRAVEL = 160, HOLD = 700, FADE = 420;
  function advance(k, t) {
    const sc = screens[k]; sc.prev = sc.cur; sc.cur = (sc.cur + 1) % sc.imgs.length; sc.fadeAt = t;
    return sc.names[sc.cur];
  }

  layout();

  // ---------- stars from the painting ----------
  const lights = (L.lights || []).map(([x, y, v]) => ({ x, y, v, f: rand(0.4, 1.6), ph: rand(0, 6.28), city: y > (L.cityY || 1e9) }));
  const motes = Array.from({ length: 30 }, () => ({ a: rand(0, 6.28), r: rand(10, O.r * 0.78), w: rand(0.15, 0.6) * (Math.random() < 0.5 ? -1 : 1), z: rand(6, 14), al: rand(0.15, 0.4), ph: rand(0, 6) }));

  // ---------- one frame ----------
  function draw(t) {
    // strike state
    let charge = 0;
    const st8 = new Map();
    live = live.filter((sv) => {
      const u = t - sv.t0, o = st8.get(sv.st) || { level: 0, reach: 0, hit: 0 };
      st8.set(sv.st, o);
      if (u < CHARGE) { charge = Math.max(charge, u / CHARGE); return true; }
      const v = u - CHARGE;
      if (v < TRAVEL + HOLD) {
        charge = Math.max(charge, 1 - (v / (TRAVEL + HOLD)) * 0.6);
        o.reach = Math.min(1, v / TRAVEL);
        o.level = Math.random() < 0.16 ? rand(0.45, 0.65) : rand(0.88, 1);
        if (v >= TRAVEL) {
          const w = (v - TRAVEL) / HOLD;
          o.hit = (1 - w) * rand(0.8, 1);
          screens[sv.st.screen].flash = Math.max(0, 1 - w * 1.5);
          if (!sv.swapped) { sv.swapped = true; showCallout(sv.st.screen, advance(sv.st.screen, t), t); }
        }
        return true;
      }
      const f = (v - TRAVEL - HOLD) / FADE;
      if (f < 1) { o.level = (1 - f) * 0.7; o.reach = 1; return true; }
      screens[sv.st.screen].flash = 0;
      return false;
    });
    for (const c of Object.values(callouts)) if (c.until && t > c.until) { c.el.classList.remove("on"); c.until = 0; }

    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * X, dpr * Y);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.drawImage(plate, 0, 0, W, H);

    // the platform on the glass, crossfading on each strike
    for (const sc of Object.values(screens)) {
      const b = sc.box, k = sc.prev >= 0 ? ease((t - sc.fadeAt) / 420) : 1;
      if (k < 1) { ctx.globalAlpha = 1; ctx.drawImage(sc.imgs[sc.prev], b.x, b.y, b.w, b.h); ctx.globalAlpha = k; }
      ctx.drawImage(sc.imgs[sc.cur], b.x, b.y, b.w, b.h); ctx.globalAlpha = 1;
      if (k >= 1) sc.prev = -1;
    }

    ctx.globalCompositeOperation = "lighter";
    // the glass lights up where a bolt lands
    for (const st of strikes) {
      const sc = screens[st.screen]; if (!sc.flash) continue;
      const b = sc.box, [hx, hy] = st.hit;
      ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, b.w * 0.55);
      g.addColorStop(0, `rgba(170,220,240,${0.55 * sc.flash})`); g.addColorStop(1, "rgba(138,199,222,0)");
      ctx.fillStyle = g; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.restore();
    }
    // Carl: halo, glass, motes
    const breath = 0.5 - 0.5 * Math.cos((t / 4200) * Math.PI * 2);
    const bob = Math.sin(t / 2900) * 6;
    const gR = O.r * (1.75 + breath * 0.12 + charge * 0.35);
    const gg = ctx.createRadialGradient(O.x, O.y + bob, O.r * 0.85, O.x, O.y + bob, gR);
    gg.addColorStop(0, `rgba(120,190,230,${0.34 + breath * 0.1 + charge * 0.35})`);
    gg.addColorStop(0.45, `rgba(90,160,215,${0.12 + breath * 0.05 + charge * 0.15})`);
    gg.addColorStop(1, "rgba(80,150,210,0)");
    ctx.fillStyle = gg; ctx.fillRect(O.x - gR, O.y + bob - gR, gR * 2, gR * 2);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    const sc = 1 + breath * 0.01 + charge * 0.025;
    const ow = L.orb.w * sc, oh = L.orb.h * sc;
    if (carlReady && carlVid.readyState >= 2) {
      // the clip, masked round so its own sky melts into ours
      const SZ = vc.width;
      vg.globalCompositeOperation = "source-over"; vg.clearRect(0, 0, SZ, SZ);
      vg.drawImage(carlVid, 0, 0, SZ, SZ);
      vg.globalCompositeOperation = "destination-in"; vg.drawImage(mask, 0, 0);
      const vr = L.carlVideo.r * sc;
      ctx.drawImage(vc, O.x - vr, O.y - vr + bob, vr * 2, vr * 2);
    } else {
      ctx.drawImage(orb, O.x - ow / 2, O.y - oh / 2 + bob, ow, oh);
    }
    ctx.globalCompositeOperation = "lighter";
    if (charge > 0.02) { ctx.globalAlpha = charge * 0.45; ctx.drawImage(orb, O.x - ow / 2, O.y - oh / 2 + bob, ow, oh); }
    ctx.save(); ctx.beginPath(); ctx.arc(O.x, O.y + bob, O.r - 8, 0, Math.PI * 2); ctx.clip();
    for (const m of motes) {
      const a = m.a + (t / 1000) * m.w * (1 + charge * 3);
      ctx.globalAlpha = Math.min(1, m.al * (0.7 + 0.5 * Math.sin(t / 600 + m.ph)) * (1 + charge * 1.5));
      ctx.drawImage(SPARK, O.x + Math.cos(a) * m.r - m.z, O.y + bob + Math.sin(a) * m.r * 0.8 - m.z, m.z * 2, m.z * 2);
    }
    ctx.restore();

    // him, breathing
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    const db = 3 * Math.sin((t / 4200) * Math.PI * 2);
    ctx.drawImage(man, L.man.x, L.man.y - db, L.man.w, L.man.h + db);

    // the bolts: revealed from Carl down to the glass, flickering, then the spark where they land
    ctx.globalCompositeOperation = "lighter";
    for (const st of strikes) {
      const o = st8.get(st); if (!o || o.level <= 0) continue;
      const reachY = O.y + (st.hit[1] - O.y + 80) * o.reach;
      ctx.save();
      if (st.flip) { ctx.translate(2 * O.x, 0); ctx.scale(-1, 1); }
      ctx.beginPath(); ctx.rect(st.x - 20, st.y, st.w + 40, reachY - st.y); ctx.clip();
      ctx.globalAlpha = o.level; ctx.drawImage(st.img, st.x, st.y, st.w, st.h);
      ctx.restore();
      if (o.hit > 0) { const r = 150 * (0.8 + o.hit * 0.4); ctx.globalAlpha = o.hit; ctx.drawImage(SPARK, st.hit[0] - r, st.hit[1] - r, r * 2, r * 2); }
    }

    // stars and city lights
    for (const p of lights) {
      const a = (p.city ? 0.25 : 0.45) * Math.pow(0.5 + 0.5 * Math.sin((t / 1000) * p.f + p.ph), 3) * (p.v / 255);
      if (a < 0.02) continue;
      const r = p.city ? 10 : 5;
      ctx.globalAlpha = a; ctx.drawImage(STAR, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  // ---------- loop: 30 frames a second is plenty for light and breath ----------
  let running = false, lastDraw = 0;
  function frame(now) {
    if (!running) return;
    if (now - lastDraw >= (live.length ? 0 : 32)) {
      lastDraw = now;
      if (!driven && now > nextStrike) schedule(now);
      draw(now);
    }
    requestAnimationFrame(frame);
  }
  const start = () => { if (running || reduced) return; running = true; carlVid?.play().catch(() => {}); requestAnimationFrame(frame); };
  const stop = () => { running = false; carlVid?.pause(); };
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  addEventListener("message", (e) => {
    if (e.origin !== location.origin) return;
    if (e.data === "scene:pause") stop();
    if (e.data === "scene:play") { asked = -1; layout(); start(); }   // re-send the height each time the slide shows
    // the homepage scroll: a = how far through the freeze (three strikes at 1/6, 1/2, 5/6)
    if (e.data && e.data.scene === "scroll") {
      driven = true;
      const a = Math.max(0, Math.min(1, +e.data.a || 0));
      [1 / 6, 1 / 2, 5 / 6].forEach((th, k) => { if ((lastA < th) !== (a < th)) scrollStrike(k); });
      lastA = a;
    }
  });
  addEventListener("resize", () => { if (!running) draw(performance.now()); });
  draw(0);
  document.documentElement.classList.add("ready");
  start();
}
