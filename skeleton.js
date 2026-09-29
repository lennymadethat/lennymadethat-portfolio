// lennymadethat.com — SKELETON (F0). Renders data/site.js into the five sections and runs the
// mechanics: nav, product swipe, pinned agent select, scroll-scrubbed Second Brain, downloads.
import { products, agents, crews, secondBrain, downloads, contact } from "./data/site.js?v=20260929a";

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

// ---------- 2. agent select (pinned; scroll moves through the roster) ----------
{
  const section = $("#agents");
  section.style.setProperty("--sk-agents", String(agents.length + 0.5));
  const left = $(".sk-panel--left"), right = $(".sk-panel--right"), char = $(".sk-fighter__char"), skills = $(".sk-skills");
  const dots = $(".sk-agent-dots"), grid = $(".sk-grid"), gridBtn = $(".sk-agents__gridbtn");
  let cur = -1;
  const statsHtml = (stats) => stats.map((s) => {
    const pending = s.value == null;
    return `<div class="sk-stat"><div class="sk-stat__row"><span>${esc(s.label)}</span><span>${pending ? "A3" : esc(s.value)}</span></div>
      <div class="sk-stat__bar${pending ? " sk-stat__bar--pending" : ""}"><i style="width:${pending ? 0 : Math.min(100, Number(s.pct ?? 60))}%"></i></div></div>`;
  }).join("");
  const render = (i) => {
    if (i === cur) return;
    cur = i;
    const a = agents[i];
    left.innerHTML = `<p class="sk-panel__title">Agent ${String(i + 1).padStart(2, "0")} / ${String(agents.length).padStart(2, "0")}</p>
      <h3 class="sk-agent__name">${esc(a.name)}</h3><p class="sk-agent__title">${esc(a.title)}</p>
      <p class="sk-agent__line">${esc(a.line)}</p>${statsHtml(a.stats)}${linkBtn(a.button)}`;
    right.innerHTML = `<p class="sk-panel__title">Equipment</p><ul class="sk-equip">${a.equipment.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <p style="margin-top:14px">${todo(a.todo, "character film")}</p>`;
    char.classList.remove("is-swap"); void char.offsetWidth; char.classList.add("is-swap");
    char.innerHTML = a.idle
      ? `<video src="${esc(a.idle)}" muted loop playsinline autoplay></video>`
      : `<img src="${esc(a.art)}" alt="${esc(a.name)}" />`;
    skills.innerHTML = a.skills.map((s) => `<span>${esc(s)}</span>`).join("");
    [...dots.children].forEach((d, j) => d.setAttribute("aria-selected", j === i ? "true" : "false"));
  };
  const range = () => { const top = section.offsetTop; return { top, len: section.offsetHeight - innerHeight }; };
  const jump = (i) => {
    const { top, len } = range();
    const p = (Math.max(0, Math.min(agents.length - 1, i)) + 0.5) / agents.length;
    scrollTo({ top: top + p * len, behavior: reduced ? "auto" : "smooth" });
  };
  agents.forEach((a, i) => {
    const d = el("button", { type: "button", role: "tab", "aria-label": a.name });
    d.addEventListener("click", () => jump(i));
    dots.append(d);
    const g = el("button", { type: "button" }, `<img src="${esc(a.art)}" alt="" /><span>${esc(a.name)}</span>`);
    g.addEventListener("click", () => { toggleGrid(false); jump(i); });
    grid.append(g);
  });
  const onScroll = () => {
    const { top, len } = range();
    const p = Math.max(0, Math.min(0.9999, (scrollY - top) / len));
    render(Math.floor(p * agents.length));
  };
  addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener("resize", onScroll);
  $(".sk-agent-prev").addEventListener("click", () => jump(cur - 1));
  $(".sk-agent-next").addEventListener("click", () => jump(cur + 1));
  $(".sk-skip").addEventListener("click", () => $("#crews").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
  const toggleGrid = (on) => { grid.hidden = !on; gridBtn.setAttribute("aria-pressed", String(on)); gridBtn.textContent = on ? "Close grid" : "Grid view"; };
  gridBtn.addEventListener("click", () => toggleGrid(grid.hidden));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !grid.hidden) toggleGrid(false); });
  render(0);
}

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
