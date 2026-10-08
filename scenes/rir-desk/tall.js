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
  const [plate, man, orb, halo, ...rest] = await Promise.all([
    load(DIR + L.plate), load(DIR + "man.webp"), load(DIR + "orb.webp"), load(DIR + "halo.webp"),
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

  // little light sprites, made once
  const dot = (size, inner) => {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d"), r = size / 2, gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, inner); gr.addColorStop(1, "rgba(138,199,222,0)");
    g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
  };
  const SPARK = dot(64, "rgba(235,248,255,1)"), STAR = dot(16, "rgba(235,245,255,1)");

  // ---------- camera: the whole width, framed from the top (the words live in the sky) ----------
  let dpr = 1, cw = 1, ch = 1, s = 1, X = 0, Y = 0;
  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = view.clientWidth; ch = view.clientHeight;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    s = Math.max(cw / W, ch / H);
    X = (cw - W * s) / 2;
    Y = Math.min(0, Math.max(ch - H * s, -(L.focusY || 0) * s));
    placeCallouts();
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
  layout();

  // ---------- strikes ----------
  const strikes = L.placed.map((p, i) => ({ ...p, img: bolts[i] }));
  let live = [], nextStrike = 1300, turn = 0, count = 0;
  function schedule(t) {
    count++;
    const both = count % 5 === 0;
    const pick = [strikes[turn % strikes.length]]; turn++;
    if (both) { pick.push(strikes[turn % strikes.length]); turn++; }
    for (const st of pick) live.push({ st, t0: t, swapped: false });
    nextStrike = t + rand(3200, 4600);
  }
  const CHARGE = 600, TRAVEL = 160, HOLD = 700, FADE = 420;
  function advance(k, t) {
    const sc = screens[k]; sc.prev = sc.cur; sc.cur = (sc.cur + 1) % sc.imgs.length; sc.fadeAt = t;
    return sc.names[sc.cur];
  }

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
    ctx.globalAlpha = Math.min(1, 0.75 + breath * 0.2 + charge * 0.5);
    ctx.drawImage(halo, L.halo.x, L.halo.y + bob, L.halo.w, L.halo.h);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    const sc = 1 + breath * 0.01 + charge * 0.025;
    const ow = L.orb.w * sc, oh = L.orb.h * sc;
    ctx.drawImage(orb, O.x - ow / 2, O.y - oh / 2 + bob, ow, oh);
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
      ctx.save(); ctx.beginPath(); ctx.rect(st.x - 20, st.y, st.w + 40, reachY - st.y); ctx.clip();
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
    if (now - lastDraw >= 32) {
      lastDraw = now;
      if (now > nextStrike) schedule(now);
      draw(now);
    }
    requestAnimationFrame(frame);
  }
  const start = () => { if (running || reduced) return; running = true; requestAnimationFrame(frame); };
  const stop = () => { running = false; };
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  addEventListener("message", (e) => {
    if (e.origin !== location.origin) return;
    if (e.data === "scene:pause") stop();
    if (e.data === "scene:play") start();
  });
  addEventListener("resize", () => { if (!running) draw(performance.now()); });
  draw(0);
  start();
}
