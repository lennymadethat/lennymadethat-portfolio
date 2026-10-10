// lennymadethat.com — SKELETON (F0). Renders data/site.js into the five sections and runs the
// mechanics: nav, product swipe, pinned agent select, Second Brain opening film, downloads.
import { products, agents, crews, secondBrain, downloads, contact } from "./data/site.js?v=20261010a";

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, html = "") => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  if (html) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const todo = (row, what) => `<span class="sk-todo">${esc(row)}${what ? " · " + esc(what) : ""}</span>`;
const linkBtn = (b, cls = "sk-btn") => b?.href
  ? `<a class="${cls}" href="${esc(b.href)}"${/^https?:/.test(b.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(b.label)}</a>`
  : `<span class="${cls}" aria-disabled="true">${esc(b?.label ?? "Soon")}</span>${b?.todo ? " " + todo(b.todo) : ""}`;

// ---------- nav ----------
const nav = $(".sk-nav");
const hero = $("#top");
new IntersectionObserver(([e]) => nav.classList.toggle("is-on", !e.isIntersecting), { threshold: 0.15 }).observe(hero);
const navLinks = [...nav.querySelectorAll(".sk-nav__links a")];
const sectionObs = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) {
    const id = e.target.id === "crews" ? "agents" : e.target.id;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
  }
}, { rootMargin: "-45% 0px -50% 0px" });
["platforms", "agents", "crews", "second-brain", "downloads", "contact"].forEach((id) => sectionObs.observe(document.getElementById(id)));

// ---------- 1. product swipe ----------
{
  const track = $(".sk-products__track");
  const dots = $("#platforms .sk-dots");
  const mobileFilm = matchMedia("(max-width: 640px)");
  const sourceFor = (p) => mobileFilm.matches && p.videoMobile ? p.videoMobile : p.video;
  const posterFor = (p) => mobileFilm.matches && p.posterMobile ? p.posterMobile : p.poster;
  products.forEach((p, i) => {
    const media = p.scene
      ? `<iframe class="sk-scene" title="${esc(p.name)}: an ambient room" data-src="${esc(p.scene)}" allow="autoplay"${p.sceneBg ? ` style="background:${esc(p.sceneBg)}"` : ""}></iframe>`
      : p.video
      ? `<video${posterFor(p) ? ` poster="${esc(posterFor(p))}"` : ""} aria-label="${esc(p.name)} product film" controls muted loop playsinline preload="none"></video>`
      : `<div class="sk-placeholder"><p>FILM SLOT<br>${esc(p.name)}</p></div>`;
    const slide = el("article", { class: `sk-slide${p.scene ? " sk-slide--scene" : p.film ? " sk-slide--film" : ""}`, "aria-roledescription": "slide", "aria-label": `${i + 1} of ${products.length}: ${p.name}` },
      `<div class="sk-slide__media">${media}</div>
       ${p.todo ? todo(p.todo, p.video ? "stand-in footage" : "film") : ""}
       <div class="sk-slide__copy">
         ${p.logo ? `<img class="sk-slide__logo" src="${esc(p.logo)}" alt="" />` : ""}
         <div class="sk-slide__text">
           <h2 class="sk-slide__name">${esc(p.name)}</h2>
           <p class="sk-slide__hook">${esc(p.hook)}</p>
         </div>
         <div class="sk-slide__ctas">${linkBtn(p.visit)}${p.film && !p.explainer ? "" : linkBtn(p.explainer ?? { label: "How it's built", todo: "P2" }, "sk-btn sk-btn--ghost")}</div>
       </div>`);
    track.append(slide);
    const d = el("button", { type: "button", role: "tab", "aria-label": p.name, "aria-selected": i === 0 ? "true" : "false" });
    d.addEventListener("click", () => go(i));
    dots.append(d);
  });
  const slides = [...track.children];
  let cur = 0;
  const go = (i) => {
    i = (i + slides.length) % slides.length;
    // inside the story, RIR and PlayLetter are places on the page, not just slides: scroll there
    if (story && phases && (i <= 1 || (i === 2 && phases.F))) {
      const top = section.getBoundingClientRect().top + scrollY;
      const at = i === 0 ? phases.A * 0.08 : i === 1 ? phases.A + phases.B + phases.C + 2 : phases.A + phases.B + phases.C + phases.D + phases.E + 2;
      scrollTo({ top: top + at, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };
  const sync = () => {
    const i = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    if (i === cur) return;
    cur = i;
    [...dots.children].forEach((d, j) => d.setAttribute("aria-selected", j === i ? "true" : "false"));
    playVisible();
  };
  track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  // ---------- the story: RIR, then PlayLetter, driven by the page scroll (Lenny, 10-08) ----------
  // The swipe pins under the header. Scrolling first makes Carl strike the screens three times (the desk is frozen),
  // then runs the RIR desk down to him, then slides PlayLetter in from the right out of a fade, then runs
  // PlayLetter's day from morning to midnight. Then the page moves on. Each scene gets its own progress by
  // postMessage ({scene:"scroll", a, pan} for RIR, {scene:"scroll", p} for PlayLetter); RIR reports how far its
  // desk runs below the screen ({scene:"pan", px}), which is how long that part of the scroll is.
  const section = $("#platforms"), pin = section.querySelector(".sk-products__pin");
  const story = !reduced && !!(products[0]?.scene && products[1]?.scene);
  // Assembly Floor is the third act when its scene exists: PlayLetter slides off, the AF story runs on the scroll (Lenny 10-08)
  const afAct = story && !!products[2]?.scene;
  const actN = afAct ? 3 : 2;
  let rirNeed = 0, phases = null, storyY = -1, storyPhase = "", moving = false;
  const frameOf = (i) => slides[i]?.querySelector("iframe.sk-scene");
  const send = (i, msg) => { const f = frameOf(i); if (f && f.src) f.contentWindow?.postMessage(msg, location.origin); };
  function measure() {
    if (!story) return;
    const vh = pin.clientHeight || innerHeight;
    // the RIR desk may be taller than the screen: its frame is made that tall and slid up on the GPU (no redraws)
    const B = Math.max(0, rirNeed - vh), f0 = frameOf(0);
    if (f0) f0.style.height = B ? `${rirNeed}px` : "";
    // PlayLetter's day gets 3.6 screens of scroll (1.8 felt far too fast on his phone, 10-08)
    // the freeze takes six strikes now (Lenny 10-08: "at least four or five bolts, keep scrolling down")
    const A = Math.round(2.4 * vh), C = Math.round(0.9 * vh), D = Math.round(3.6 * vh);
    // Assembly Floor: a hand-off like PlayLetter's, then 6 screens for the whole story (intro, sidebar, floor, van, Foreman)
    const E = afAct ? Math.round(0.9 * vh) : 0, F = afAct ? Math.round(6 * vh) : 0;
    phases = { A, B, C, D, E, F, total: A + B + C + D + E + F };
    section.style.height = `${vh + phases.total}px`;
  }
  function drive() {
    if (!phases) return;
    const y = Math.max(0, Math.min(phases.total, Math.round(-section.getBoundingClientRect().top)));
    if (y === storyY) return;
    storyY = y;
    const { A, B, C, D, E, F } = phases, w = track.clientWidth;
    const phase = y < A + B ? "rir" : y < A + B + C ? "move" : y < A + B + C + D || !F ? "pl" : y < A + B + C + D + E ? "move2" : "af";
    let t = 0;
    const f0 = frameOf(0), pan = B > 0 ? Math.max(0, Math.min(1, (y - A) / B)) : 0;
    if (phase === "rir") send(0, { scene: "scroll", a: Math.min(1, y / A), pan });
    if (phase === "move") { t = (y - A - B) / C; send(0, { scene: "scroll", a: 1, pan: 1 }); send(1, { scene: "scroll", p: 0 }); }
    if (phase === "pl") { t = 1; send(1, { scene: "scroll", p: Math.min(1, (y - A - B - C) / D) }); }
    let t2 = 0;
    if (phase === "move2") { t = 1; t2 = (y - A - B - C - D) / E; send(1, { scene: "scroll", p: 1 }); send(2, { scene: "scroll", p: 0 }); }
    if (phase === "af") { t = 1; t2 = 1; send(2, { scene: "scroll", p: Math.min(1, (y - A - B - C - D - E) / F) }); }
    // down the desk: the tall frame slides up (a GPU move, in step with the finger)
    if (f0) f0.style.transform = B ? `translate3d(0, ${-Math.round((phase === "rir" ? pan : 1) * B)}px, 0)` : "";
    // the hand-off: RIR slides off to the left and dims, PlayLetter comes in out of the dark.
    // While it moves the two slides are translated inside the track (GPU; the track is a scroll container and clips
    // anything outside its own box, so it can't be the thing that moves); at rest its scroll position holds the slide.
    slides[0].style.opacity = String(1 - 0.6 * t);
    slides[1].style.opacity = phase === "rir" ? "" : String((0.4 + 0.6 * t) * (1 - 0.6 * t2));
    if (afAct) slides[2].style.opacity = phase === "move2" || phase === "af" ? String(0.4 + 0.6 * t2) : "";
    if (phase === "move") {
      if (storyPhase !== "move") { track.style.scrollSnapType = "none"; track.scrollLeft = 0; }
      slides[0].style.transform = `translate3d(${-t * w}px, 0, 0) scale(${1 - 0.06 * t})`;
      slides[1].style.transform = `translate3d(${-t * w}px, 0, 0)`;
    } else if (phase === "move2") {
      if (storyPhase !== "move2") { track.style.scrollSnapType = "none"; slides[0].style.transform = ""; track.scrollLeft = w; }
      slides[1].style.transform = `translate3d(${-t2 * w}px, 0, 0) scale(${1 - 0.06 * t2})`;
      slides[2].style.transform = `translate3d(${-t2 * w}px, 0, 0)`;
    } else if (phase !== storyPhase) {
      slides.slice(0, actN).forEach((s) => (s.style.transform = ""));
      track.style.scrollSnapType = "";
      track.scrollLeft = phase === "af" ? 2 * w : phase === "pl" ? w : 0;
    }
    const wasMoving = moving;
    moving = phase === "move" || phase === "move2";
    if (phase !== storyPhase || moving !== wasMoving) { storyPhase = phase; playVisible(); }
  }
  addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || e.data.scene !== "height") return;
    if (frameOf(0)?.contentWindow !== e.source) return;
    rirNeed = Math.max(0, +e.data.h || 0); measure(); storyY = -1; drive();
  });
  if (story) {
    section.classList.add("is-story");
    measure();
    addEventListener("scroll", () => requestAnimationFrame(drive), { passive: true });
    addEventListener("resize", () => { measure(); storyY = -1; drive(); });
    // a scene that has just loaded gets told where the scroll is
    [...Array(actN).keys()].forEach((i) => frameOf(i)?.addEventListener("load", () => { storyY = -1; drive(); playVisible(); }));
  }
  $("#platforms .sk-arrow--prev").addEventListener("click", () => go(cur - 1));
  $("#platforms .sk-arrow--next").addEventListener("click", () => go(cur + 1));
  track.addEventListener("keydown", (e) => {
    if (e.target.closest("video, iframe, a, button")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
  });
  let onScreen = false;
  const playVisible = () => slides.forEach((s, j) => {
    const f = s.querySelector("iframe.sk-scene");
    if (f) {
      // the ambient room loads the first time its slide shows, and sleeps while off screen;
      // in the story both scenes load with the section and both run while one slides into the other
      const pair = storyPhase === "move2" ? (j === 1 || j === 2) : j <= 1;
      const active = onScreen && (j === cur || (moving && pair)) && !document.hidden;
      if ((active || (story && onScreen && j < actN)) && !f.src) f.src = f.dataset.src;
      f.contentWindow?.postMessage(active ? "scene:play" : "scene:pause", location.origin);
      return;
    }
    const v = s.querySelector("video");
    if (!v) return;
    const active = onScreen && j === cur && !document.hidden;
    if (active) {
      // Load only the visible film, in the format appropriate for this screen.
      const p = products[j], src = sourceFor(p);
      if (v.getAttribute("src") !== src) {
        v.poster = posterFor(p) || "";
        v.src = src;
      }
      if (!reduced) v.play().catch(() => {});
    } else v.pause();
  });
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; playVisible(); }, { threshold: 0.4 }).observe(pin);
  if (story) new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    [...Array(actN).keys()].forEach((i) => { const f = frameOf(i); if (f && !f.src) f.src = f.dataset.src; });
  }, { rootMargin: "150% 0px" }).observe(section);
  document.addEventListener("visibilitychange", playVisible);
  mobileFilm.addEventListener("change", () => {
    slides.forEach((s, j) => {
      const v = s.querySelector("video");
      if (v) v.poster = posterFor(products[j]) || "";
    });
    playVisible();
  });
  // A review link can open a product without changing the carousel's order.
  const requested = products.findIndex((p) => p.slug === new URLSearchParams(location.search).get("product"));
  if (requested >= 0) requestAnimationFrame(() => {
    track.scrollTo({ left: requested * track.clientWidth, behavior: "instant" });
    sync();
  });
}

// ---------- 2. agent select: lives in agents/agent-select.js ----------

// ---------- 2b. crews ----------
$(".sk-crews__row").innerHTML = crews.map((c) =>
  `<${c.href ? `a href="${esc(c.href)}"` : "div"} class="sk-crew"><h3>${esc(c.name)}</h3><p>${esc(c.line)}</p>${c.href ? "" : todo(c.todo, "explainer chapter")}</${c.href ? "a" : "div"}>`).join("");

// ---------- second brain: play once when the opening film comes into view ----------
{
  const section = $("#second-brain"), film = $("#brain-film"), play = $("#brain-play");
  const beatEl = $(".sk-brain__beat"), source = $(".sk-brain__source");
  source.href = secondBrain.download.href;
  source.textContent = secondBrain.download.label;
  let onScreen = false, userPaused = false;
  const syncButton = () => { play.textContent = film.ended ? "Replay film" : film.paused ? "Play film" : "Pause film"; };
  const start = () => film.play().catch(syncButton);
  const syncPlayback = () => {
    if (!onScreen || document.hidden) film.pause();
    else if (!reduced && !userPaused && !film.ended) start();
  };
  play.addEventListener("click", () => {
    if (!film.paused) { userPaused = true; film.pause(); }
    else { userPaused = false; if (film.ended) film.currentTime = 0; start(); }
  });
  ["play", "pause", "ended"].forEach((event) => film.addEventListener(event, syncButton));
  film.addEventListener("timeupdate", () => {
    const progress = film.duration ? film.currentTime / film.duration : 0;
    const beat = secondBrain.beats.reduce((current, next) => progress >= next.at ? next : current);
    if (beatEl.textContent !== beat.text) beatEl.textContent = beat.text;
  });
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    syncPlayback();
  }, { threshold: 0.5 }).observe(section);
  document.addEventListener("visibilitychange", syncPlayback);
  film.controls = false;
  play.hidden = false;
}

// ---------- 4. downloads: the wall lives in downloads/wall.js ----------

// ---------- 5. contact ----------
$(".sk-contact__links").innerHTML = `<a class="sk-btn" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`
  + contact.follow.map((f) => linkBtn(f, "sk-btn sk-btn--ghost")).join("") + " " + todo("P4", "more handles");
