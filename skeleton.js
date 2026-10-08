// lennymadethat.com — SKELETON (F0). Renders data/site.js into the five sections and runs the
// mechanics: nav, product swipe, pinned agent select, scroll-scrubbed Second Brain, downloads.
import { products, agents, crews, secondBrain, downloads, contact } from "./data/site.js?v=20261007a";

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
    const media = p.scene
      ? `<iframe class="sk-scene" title="${esc(p.name)}: an ambient room" data-src="${esc(p.scene)}" allow="autoplay"></iframe>`
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
    if (e.target.closest("video, iframe, a, button")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
  });
  let onScreen = false;
  const playVisible = () => slides.forEach((s, j) => {
    const f = s.querySelector("iframe.sk-scene");
    if (f) {
      // the ambient room loads the first time its slide shows, and sleeps while off screen
      const active = onScreen && j === cur && !document.hidden;
      if (active && !f.src) f.src = f.dataset.src;
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

// ---------- 3. second brain: scroll-scrubbed frames ----------
{
  const section = $("#second-brain"), canvas = $(".sk-brain__canvas"), ctx = canvas.getContext("2d");
  const beatEl = $(".sk-brain__beat"), f = secondBrain.frames;
  $(".sk-brain__dl").outerHTML = linkBtn(secondBrain.download);
  $("#second-brain .sk-todo--corner").textContent = `${secondBrain.todo} · draft film, stand-in`;
  const imgs = Array.from({ length: f.count }, (_, i) => {
    const im = new Image();
    im.decoding = "async";
    im.src = `${f.dir}f${String(i + 1).padStart(f.pad, "0")}.${f.ext}`;
    return im;
  });
  let last = -1, beat = -1;
  const size = () => { const r = devicePixelRatio || 1; canvas.width = canvas.clientWidth * r; canvas.height = canvas.clientHeight * r; last = -1; draw(); };
  const draw = () => {
    const top = section.offsetTop, len = section.offsetHeight - innerHeight;
    const p = reduced ? 0.6 : Math.max(0, Math.min(1, (scrollY - top) / len));
    let i = Math.min(f.count - 1, Math.floor(p * f.count));
    while (i > 0 && !imgs[i].complete) i--;               // show the nearest loaded frame
    if (i !== last && imgs[i].complete) {
      last = i;
      const cw = canvas.width, ch = canvas.height, s = Math.max(cw / f.width, ch / f.height);
      const w = f.width * s, h = f.height * s;
      ctx.drawImage(imgs[i], (cw - w) / 2, (ch - h) / 2, w, h);
    }
    const b = secondBrain.beats.reduce((k, x, j) => (p >= x.at ? j : k), 0);
    if (b !== beat) {
      beat = b;
      beatEl.classList.add("is-out");
      setTimeout(() => { beatEl.textContent = secondBrain.beats[b].text; beatEl.classList.remove("is-out"); }, 150);
    }
  };
  imgs[0].onload = size;
  addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("resize", size);
  imgs.forEach((im) => im.addEventListener("load", () => { if (last < 0) draw(); }));
}

// ---------- 4. downloads ----------
$(".sk-accordion").innerHTML = downloads.map((d) => `
  <details class="sk-dl">
    <summary><span class="sk-dl__name">${esc(d.name)}</span><span class="sk-dl__line">${esc(d.line)}</span></summary>
    <div class="sk-dl__body">
      ${d.img ? `<img src="${esc(d.img)}" alt="How ${esc(d.name)} works" loading="lazy" />` : `<div class="sk-placeholder-inline"><div class="sk-placeholder"><p>EXPLAINER ART</p></div></div>`}
      <div><p>${esc(d.desc)}</p>
        <div class="sk-slide__ctas">${linkBtn({ label: "Get the code", href: d.code, todo: d.todo })}${d.setup ? linkBtn({ label: "Paste-prompt setup", href: d.setup }, "sk-btn sk-btn--ghost") : ""}</div>
      </div>
    </div>
  </details>`).join("");

// ---------- 5. contact ----------
$(".sk-contact__links").innerHTML = `<a class="sk-btn" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`
  + contact.follow.map((f) => linkBtn(f, "sk-btn sk-btn--ghost")).join("") + " " + todo("P4", "more handles");
