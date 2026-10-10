// lennymadethat.com — SKELETON (F0). Renders data/site.js into the five sections and runs the
// mechanics: nav, product swipe, pinned agent select, Second Brain opening film, downloads.
import { products, agents, crews, secondBrain, downloads, contact } from "./data/site.js?v=20261010b";

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
  const dots = $("#platforms > .sk-dots");
  const mobileFilm = matchMedia("(max-width: 640px)");
  const sourceFor = (p) => mobileFilm.matches && p.videoMobile ? p.videoMobile : p.video;
  const posterFor = (p) => mobileFilm.matches && p.posterMobile ? p.posterMobile : p.poster;
  products.forEach((p, i) => {
    const media = p.video
      ? `<video${posterFor(p) ? ` poster="${esc(posterFor(p))}"` : ""} aria-label="${esc(p.name)} product film" controls muted loop playsinline preload="none"></video>`
      : `<div class="sk-placeholder"><p>FILM SLOT<br>${esc(p.name)}</p></div>`;
    const slide = el("article", { class: `sk-slide${p.film ? " sk-slide--film" : ""}`, "aria-roledescription": "slide", "aria-label": `${i + 1} of ${products.length}: ${p.name}` },
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
  const go = (i) => { i = (i + slides.length) % slides.length; track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" }); };
  const sync = () => {
    const i = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    if (i === cur) return;
    cur = i;
    [...dots.children].forEach((d, j) => d.setAttribute("aria-selected", j === i ? "true" : "false"));
    playVisible();
  };
  track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  $("#platforms .sk-arrow--prev").addEventListener("click", () => go(cur - 1));
  $("#platforms .sk-arrow--next").addEventListener("click", () => go(cur + 1));
  track.addEventListener("keydown", (e) => {
    if (e.target.closest("video, a, button")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
  });
  let onScreen = false;
  const playVisible = () => slides.forEach((s, j) => {
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
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; playVisible(); }, { threshold: 0.4 }).observe($("#platforms"));
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
