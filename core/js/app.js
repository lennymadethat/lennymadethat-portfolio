/* CORE dashboard — project ring, edge widgets, brain glue.
   Vibe-code widgets by adding to WIDGET_CATALOG or using the Custom card. */
import { createBrain } from "./brain.js?v=4";

const MS = "https://mothership.lennymadethat.com";
const PROJECTS = [
  { id: "playletter",  mark: "PL",  name: "PlayLetter",     color: "#3ddc84", line: "Letters that read themselves.", href: "https://playletter.com" },
  { id: "rir",         mark: "RIR", name: "Retail Investor",color: "#22d3ee", line: "The report for people who actually own the funds.", href: "https://retailinvestorreport.com" },
  { id: "mothership",  mark: "MS",  name: "Mothership",     color: "#5b9dff", line: "The phone that runs the shop.", href: MS },
  { id: "us3",         mark: "US3", name: "US3 Ops",        color: "#f2b84b", line: "Gas-monitor ops floor. Paper still happens.", href: "https://us3ops.com" },
  { id: "aloud",       mark: "AL",  name: "Aloud",          color: "#ff7a45", line: "Karaoke for anything you write.", href: "https://aloud.lennymadethat.com" },
  { id: "harvester",   mark: "HV",  name: "Harvester",      color: "#b6e34a", line: "Overnight research that shows up ready.", href: `${MS}/#/harvest` },
  { id: "rico",        mark: "RC",  name: "RICO",           color: "#ff5d8f", line: "Lenny's ghostwriter. Don't let him sound like a robot.", href: "https://os.lennymadethat.com" },
  { id: "family",      mark: "FAM", name: "Family OS",      color: "#ff9a3c", line: "The house, the dogs, the calendar.", href: `${MS}/#/morning` },
  { id: "gym",         mark: "GYM", name: "Gym",            color: "#f87171", line: "The mesocycle, not the vibe.", href: "https://gym.lennymadethat.com" },
  { id: "yield",       mark: "YA",  name: "Yield Agents",   color: "#cdd5e0", line: "On-chain income that doesn't sleep.", href: "https://yieldagents.io" },
  { id: "vault",       mark: "GB",  name: "G-Brain",        color: "#d68cff", line: "The second brain every agent reads.", href: `${MS}/#/files` },
  { id: "desk",        mark: "DK",  name: "The Desk",       color: "#8be8b4", line: "Posts that go out without opening a tab.", href: "https://playletter.com" },
  { id: "lennyos",     mark: "OS",  name: "Lenny OS",       color: "#7ec8ff", line: "The private dashboard.", href: "https://os.lennymadethat.com" },
  { id: "triton",      mark: "TL",  name: "Triton Labs",    color: "#8b7cff", line: "Experiments that earned a name.", href: "https://lennymadethat.com" },
  { id: "assembly",    mark: "AF",  name: "Assembly Floor", color: "#9aa5b5", line: "The shop, in software.", href: "https://assemblyfloor.ianleonard1988.workers.dev" },
  { id: "chronos",     mark: "CH",  name: "Chronos",        color: "#94a3b8", line: "The workstation that never sleeps.", href: MS },
  { id: "lmt",         mark: "LMT", name: "lennymadethat",  color: "#fb923c", line: "The public face.", href: "https://lennymadethat.com" },
  { id: "health",      mark: "HT",  name: "Health",         color: "#fb7185", line: "Sleep, gut, the cut.", href: "https://gym.lennymadethat.com" },
];

const TZ = [
  { id: "pt", label: "Pacific", zone: "America/Los_Angeles" },
  { id: "et", label: "Eastern", zone: "America/New_York" },
  { id: "ie", label: "Dublin",  zone: "Europe/Dublin" },
];

function pad(n) { return String(n).padStart(2, "0"); }
function fmtTime(d, zone) {
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: zone }).format(d);
  } catch { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
}
function fmtClock(d) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Los_Angeles",
    }).format(d) + " PT";
  } catch { return d.toLocaleString(); }
}

function calEvents(d) {
  return [
    { t: "06:10", title: "Morning Brief", href: `${MS}/#/brief` },
    { t: "09:00", title: "US3 pipeline", href: "https://us3ops.com" },
    { t: "12:30", title: "Family — lunch window", href: `${MS}/#/morning` },
    { t: "16:00", title: "RIR Sunday pass", href: "https://retailinvestorreport.com" },
    { t: "19:00", title: "Gym — mesocycle", href: "https://gym.lennymadethat.com" },
  ];
}

const MAIL = [
  { from: "Beehiiv",   sub: "Sunday report is in draft", when: "14m", c: "#ff5d8f", href: "https://retailinvestorreport.com" },
  { from: "Ming / US3",sub: "Sensor lot ETA Thursday",   when: "1h",  c: "#f2b84b", href: "https://us3ops.com" },
  { from: "Gartlan Furey", sub: "Estate questionnaire follow-up", when: "3h", c: "#7ec8ff", href: `${MS}/#/morning` },
  { from: "PlayLetter", sub: "Author invite ready to send", when: "5h", c: "#3ddc84", href: "https://playletter.com" },
];

const AGENTS = [
  { who: "Sentinel",  msg: "29 checks green. Nothing to wake you for.", when: "2m", c: "#2ee6c8", href: `${MS}/#/fleet` },
  { who: "RICO",      msg: "Voice pass queued on the Sunday draft.", when: "11m", c: "#ff5d8f", href: "https://os.lennymadethat.com" },
  { who: "Harvester", msg: "12 overnight items. 3 flagged for you.", when: "41m", c: "#b6e34a", href: `${MS}/#/harvest` },
  { who: "CARL",      msg: "Two names moved on the yield watch.", when: "1h", c: "#22d3ee", href: `${MS}/#/carl` },
];

const CHORES = [
  { t: "06:10", title: "Morning Brief", state: "done", href: `${MS}/#/brief` },
  { t: "09:00", title: "US3 pipeline review", state: "next", href: "https://us3ops.com" },
  { t: "11:30", title: "Inbox zero the agent tray", state: "open", href: `${MS}/#/agents` },
  { t: "16:00", title: "RIR newsletter pass", state: "open", href: "https://retailinvestorreport.com" },
  { t: "21:00", title: "Wrap it up — vault log", state: "open", href: `${MS}/#/files` },
];

function rowLink(href, inner) {
  if (!href) return inner;
  return `<a class="row-link" href="${href}" target="_blank" rel="noopener">${inner}</a>`;
}

const WIDGET_CATALOG = {
  calendar: {
    title: "Calendar",
    accent: "#e8b45a",
    render() {
      const d = new Date();
      const zones = TZ.map((z) => `<span>${z.label}<b>${fmtTime(d, z.zone)}</b></span>`).join("");
      const events = calEvents(d).map((e) =>
        rowLink(e.href, `<div class="event"><time>${e.t}</time><div>${e.title}</div></div>`)
      ).join("");
      return `
        <div class="cal-now">${fmtTime(d, "America/Los_Angeles")}</div>
        <div class="cal-date">${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
        <div class="zones">${zones}</div>
        ${events}`;
    },
  },
  email: {
    title: "Mail",
    accent: "#ff6a2a",
    render() {
      const rows = MAIL.map((m) =>
        rowLink(m.href, `<div class="mail"><i class="pip" style="--c:${m.c}"></i><div>${m.sub}<small><br>${m.from}</small></div><span class="ago">${m.when}</span></div>`)
      ).join("");
      return `<div class="stat-row"><b>${MAIL.length}</b><span>waiting</span></div>${rows}`;
    },
  },
  inbox: {
    title: "Agent inbox",
    accent: "#c084fc",
    render() {
      const rows = AGENTS.map((a) =>
        rowLink(a.href, `<div class="agent"><i class="pip" style="--c:${a.c}"></i><div><strong>${a.who}</strong> — ${a.msg}</div><span class="ago">${a.when}</span></div>`)
      ).join("");
      return rows;
    },
  },
  today: {
    title: "Today",
    accent: "#2ee6c8",
    render() {
      return CHORES.map((c) =>
        rowLink(c.href, `<div class="chore"><i class="pip" style="--c:${c.state === "done" ? "#2ee6c8" : c.state === "next" ? "#ff6a2a" : "#8d8894"}"></i><div>${c.title}<small><br>${c.t}${c.state === "next" ? " · up next" : c.state === "done" ? " · done" : ""}</small></div><span class="ago">${c.state === "next" ? "NOW" : ""}</span></div>`)
      ).join("");
    },
  },
  skills: {
    title: "Skills on deck",
    accent: "#5b9dff",
    render() {
      const items = [
        ["rir-newsletter", "Sunday voice pass"],
        ["particle-forge", "brain orb (this)"],
        ["wrap-it-up", "session harvest"],
        ["frontend-design", "CORE dashboard"],
      ];
      return items.map(([k, v]) =>
        `<div class="chore"><i class="pip" style="--c:#5b9dff"></i><div><strong>${k}</strong><small><br>${v}</small></div></div>`
      ).join("");
    },
  },
  custom: {
    title: "Custom",
    accent: "#e8b45a",
    editable: true,
    render(w) {
      return `<div class="custom-body">${w.html || "<p>Click the menu and choose Edit. Paste HTML. This is your vibe-coded card.</p>"}</div>`;
    },
  },
};

const DEFAULT_LAYOUT = {
  left: [
    { type: "calendar", id: "w1" },
    { type: "inbox", id: "w2" },
  ],
  right: [
    { type: "email", id: "w3" },
    { type: "today", id: "w4" },
  ],
};

const LS_KEY = "core-dashboard-layout-v1";
function loadLayout() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (v && Array.isArray(v.left) && Array.isArray(v.right)) return v;
  } catch { /* ignore */ }
  return structuredClone(DEFAULT_LAYOUT);
}
function saveLayout(l) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(l)); } catch { /* ignore */ }
}

const $ = (id) => document.getElementById(id);
const layout = loadLayout();
let brain = null;
let addTarget = "left";
let editId = null;
let hotId = null;
let pinned = null;
let thoughtTimer = 0;

function renderRing() {
  const ring = $("ring");
  const n = PROJECTS.length;
  ring.innerHTML = PROJECTS.map((p, i) => {
    const a = ((i / n) * 360 - 90) * Math.PI / 180;
    return `<a class="node" data-id="${p.id}" style="--a:${a}rad;--c:${p.color}" href="${p.href}" target="_blank" rel="noopener" title="Open ${p.name}">
      <span class="node-orb">${p.mark}</span>
      <span class="node-name">${p.name}</span>
    </a>`;
  }).join("");
  ring.querySelectorAll(".node").forEach((el) => {
    el.addEventListener("pointerenter", () => heat(el.dataset.id, true));
    el.addEventListener("pointerleave", () => heat(el.dataset.id, false));
    el.addEventListener("focus", () => heat(el.dataset.id, true));
    el.addEventListener("blur", () => heat(el.dataset.id, false));
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = el.dataset.id;
      select(id);
      const p = PROJECTS.find((x) => x.id === id);
      if (p?.href) window.open(p.href, "_blank", "noopener,noreferrer");
    });
  });
  drawArcs();
}

function drawArcs() {
  const svg = $("arcs");
  const stage = $("stage");
  const w = stage.clientWidth, h = stage.clientHeight;
  const cx = w / 2, cy = h / 2;
  const cs = getComputedStyle(document.documentElement);
  const ring = parseFloat(cs.getPropertyValue("--ring")) || 260;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.innerHTML = PROJECTS.map((p, i) => {
    const a = ((i / PROJECTS.length) * 360 - 90) * Math.PI / 180;
    const x = cx + Math.cos(a) * ring;
    const y = cy + Math.sin(a) * ring;
    const mx = cx + Math.cos(a) * ring * 0.55;
    const my = cy + Math.sin(a) * ring * 0.55;
    return `<path class="spoke" data-id="${p.id}" d="M ${cx} ${cy} Q ${mx} ${my} ${x} ${y}"
      fill="none" stroke="${p.color}" stroke-width="1.2" stroke-linecap="round"
      opacity="0.07" pathLength="1" />
      <circle class="pkt" data-id="${p.id}" r="2.4" fill="${p.color}" opacity="0">
        <animateMotion dur="2.4s" rotate="auto" fill="freeze">
          <mpath href="#none"/>
        </animateMotion>
      </circle>`;
  }).join("");
}

function fireSpoke(id) {
  const svg = $("arcs");
  const path = svg.querySelector(`.spoke[data-id="${id}"]`);
  if (!path) return;
  path.style.transition = "opacity 400ms";
  path.style.opacity = "0.55";
  path.style.strokeDasharray = "0.18 0.82";
  path.style.strokeDashoffset = "1";
  path.animate(
    [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }],
    { duration: 900, easing: "cubic-bezier(.2,.82,.2,1)" }
  );
  setTimeout(() => { path.style.opacity = hotId === id ? "0.35" : "0.07"; path.style.strokeDasharray = "none"; }, 1000);
}

function heat(id, on) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  const node = document.querySelector(`.node[data-id="${id}"]`);
  if (on) {
    if (hotId && hotId !== id) {
      document.querySelector(`.node[data-id="${hotId}"]`)?.classList.remove("is-hot");
    }
    hotId = id;
    node?.classList.add("is-hot");
    brain?.setTint(p.color, 0.85);
    const hud = $("hud");
    hud.hidden = false;
    hud.style.setProperty("--c", p.color);
    hud.innerHTML = `<b style="color:${p.color}">${p.name}</b><p>${p.line}</p>
      <a class="open" href="${p.href}" target="_blank" rel="noopener">Open ${p.name}</a>`;
    $("coreTitle").textContent = p.name;
    $("coreSub").textContent = p.line;
    fireSpoke(id);
  } else if (hotId === id) {
    if (pinned === id) return;
    hotId = null;
    node?.classList.remove("is-hot");
    brain?.clearTint();
    $("hud").hidden = true;
    $("coreTitle").textContent = "memory core";
    $("coreSub").textContent = `${PROJECTS.length} projects · 36 files · live`;
  }
}

function select(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  if (pinned && pinned !== id) {
    document.querySelector(`.node[data-id="${pinned}"]`)?.classList.remove("is-hot");
  }
  pinned = id;
  heat(id, true);
  const hud = $("hud");
  hud.hidden = false;
  hud.style.setProperty("--c", p.color);
  hud.innerHTML = `<b style="color:${p.color}">${p.name}</b><p>${p.line}</p>
    <a class="open" href="${p.href}" target="_blank" rel="noopener">Open ${p.name}</a>`;
}

function unpin() {
  const id = pinned;
  pinned = null;
  if (id) heat(id, false);
}

function filterProjects(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll(".node").forEach((el) => {
    const p = PROJECTS.find((x) => x.id === el.dataset.id);
    const hit = !q || p.name.toLowerCase().includes(q) || p.mark.toLowerCase().includes(q) || p.line.toLowerCase().includes(q);
    el.classList.toggle("is-dim", !hit);
    if (q && hit && document.querySelectorAll(".node:not(.is-dim)").length === 1) heat(p.id, true);
  });
  if (!q) {
    document.querySelectorAll(".node.is-hot").forEach((el) => el.classList.remove("is-hot"));
    brain?.clearTint();
  }
}

function widgetHtml(w, side) {
  const spec = WIDGET_CATALOG[w.type] || WIDGET_CATALOG.custom;
  const body = spec.render(w);
  return `<article class="widget" data-id="${w.id}" style="--w-accent:${w.accent || spec.accent}">
    <div class="widget-head">
      <h3>${w.title || spec.title}</h3>
      <div class="widget-menu">
        <button type="button" data-menu="${w.id}" aria-label="Widget menu">⋯</button>
        <div class="menu" data-for="${w.id}" hidden>
          <button type="button" data-act="up">Move up</button>
          <button type="button" data-act="down">Move down</button>
          <button type="button" data-act="flip">Move to other side</button>
          ${spec.editable || w.type === "custom" ? `<button type="button" data-act="edit">Edit / vibe-code</button>` : ""}
          <button type="button" data-act="remove">Remove</button>
        </div>
      </div>
    </div>
    <div class="widget-body">${body}</div>
  </article>`;
}

function renderRails() {
  for (const side of ["left", "right"]) {
    const el = side === "left" ? $("railL") : $("railR");
    el.innerHTML = layout[side].map((w) => widgetHtml(w, side)).join("")
      + `<button class="add-w" type="button" data-add="${side}">+ widget</button>`;
  }
}

function findWidget(id) {
  for (const side of ["left", "right"]) {
    const i = layout[side].findIndex((w) => w.id === id);
    if (i >= 0) return { side, i, w: layout[side][i] };
  }
  return null;
}

function closeMenus() {
  document.querySelectorAll(".menu").forEach((m) => { m.hidden = true; });
}

function uid() { return "w" + Math.random().toString(36).slice(2, 8); }

function addWidget(type) {
  const spec = WIDGET_CATALOG[type];
  const w = { type, id: uid(), title: spec.title, accent: spec.accent };
  if (type === "custom") w.html = "<p>Write anything. This card is yours.</p>";
  layout[addTarget].push(w);
  saveLayout(layout);
  renderRails();
}

function openPicker(side) {
  addTarget = side;
  const box = $("pickerList");
  box.innerHTML = Object.entries(WIDGET_CATALOG).map(([k, v]) =>
    `<button class="pick" type="button" data-type="${k}"><i style="--c:${v.accent}"></i>${v.title}</button>`
  ).join("");
  $("picker").hidden = false;
}

function openEdit(id) {
  const found = findWidget(id);
  if (!found) return;
  editId = id;
  $("editTitle").textContent = "Edit · " + (found.w.title || "widget");
  $("editName").value = found.w.title || "";
  const wrap = $("editHtmlWrap");
  wrap.style.display = (found.w.type === "custom") ? "" : "none";
  $("editHtml").value = found.w.html || "";
  $("editSheet").hidden = false;
}

function tickClock() {
  const d = new Date();
  const el = $("clock");
  el.dateTime = d.toISOString();
  el.textContent = fmtClock(d);
}

function thoughtLoop() {
  thoughtTimer = setInterval(() => {
    if (hotId) return;
    const p = PROJECTS[(Math.random() * PROJECTS.length) | 0];
    fireSpoke(p.id);
    brain?.setTint(p.color, 0.35);
    setTimeout(() => { if (!hotId) brain?.clearTint(); }, 1200);
  }, 4200);
}

function syncFileChips() {
  if (!brain) return;
  const layer = $("files");
  const exploded = brain.isExploded();
  const pos = brain.projectFiles();
  if (!layer.childElementCount) {
    layer.innerHTML = pos.map((f) => `<span class="file-chip" data-name="${f.name}">${f.name}</span>`).join("");
  }
  const chips = layer.querySelectorAll(".file-chip");
  pos.forEach((f, i) => {
    const c = chips[i];
    if (!c) return;
    c.style.left = f.x + "px";
    c.style.top = f.y + "px";
    const show = exploded && f.visible && f.z < 0.98;
    c.classList.toggle("on", show);
  });
}

function boot() {
  renderRing();
  renderRails();
  tickClock();
  setInterval(tickClock, 1000);

  const canvas = $("brain");
  try {
    brain = createBrain(canvas, {
      onFormed() {
        $("coreSub").textContent = `${PROJECTS.length} projects · 36 files · live`;
      },
      onFrame() { syncFileChips(); },
    });
  } catch (err) {
    console.warn("WebGL brain failed", err);
    $("coreSub").textContent = "static core · WebGL unavailable";
  }

  $("find").addEventListener("input", (e) => filterProjects(e.target.value));

  $("coreHit").addEventListener("pointerdown", (e) => e.stopPropagation());
  $("hud").addEventListener("pointerdown", (e) => e.stopPropagation());
  $("hud").addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(a.href, "_blank", "noopener,noreferrer");
  });
  $("coreHit").addEventListener("click", () => {
    unpin();
    const was = brain?.isExploded();
    brain?.explode();
    const on = !was;
    $("coreTitle").textContent = on ? "memory burst" : "memory core";
    $("coreSub").textContent = on
      ? "files peeling off the core — click again to fold them back"
      : `${PROJECTS.length} projects · 36 files · live`;
  });

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { openPicker(add.dataset.add); return; }
    const menuBtn = e.target.closest("[data-menu]");
    if (menuBtn) {
      const id = menuBtn.dataset.menu;
      const menu = document.querySelector(`.menu[data-for="${id}"]`);
      const open = menu && !menu.hidden;
      closeMenus();
      if (menu && !open) menu.hidden = false;
      return;
    }
    const act = e.target.closest("[data-act]");
    if (act) {
      const menu = act.closest(".menu");
      const id = menu?.dataset.for;
      const found = findWidget(id);
      if (found) {
        const { side, i } = found;
        const other = side === "left" ? "right" : "left";
        if (act.dataset.act === "remove") layout[side].splice(i, 1);
        if (act.dataset.act === "up" && i > 0) {
          const [w] = layout[side].splice(i, 1);
          layout[side].splice(i - 1, 0, w);
        }
        if (act.dataset.act === "down" && i < layout[side].length - 1) {
          const [w] = layout[side].splice(i, 1);
          layout[side].splice(i + 1, 0, w);
        }
        if (act.dataset.act === "flip") {
          const [w] = layout[side].splice(i, 1);
          layout[other].push(w);
        }
        if (act.dataset.act === "edit") openEdit(id);
        saveLayout(layout);
        renderRails();
      }
      closeMenus();
      return;
    }
    if (!e.target.closest(".widget-menu")) closeMenus();
  });

  $("pickerClose").addEventListener("click", () => { $("picker").hidden = true; });
  $("picker").addEventListener("click", (e) => {
    if (e.target.id === "picker") $("picker").hidden = true;
    const pick = e.target.closest("[data-type]");
    if (pick) {
      addWidget(pick.dataset.type);
      $("picker").hidden = true;
    }
  });
  $("editClose").addEventListener("click", () => { $("editSheet").hidden = true; });
  $("editCancel").addEventListener("click", () => { $("editSheet").hidden = true; });
  $("editSave").addEventListener("click", () => {
    const found = findWidget(editId);
    if (found) {
      found.w.title = $("editName").value.trim() || found.w.title;
      if (found.w.type === "custom") found.w.html = $("editHtml").value;
      saveLayout(layout);
      renderRails();
    }
    $("editSheet").hidden = true;
  });

  $("drawerToggle").addEventListener("click", () => {
    document.body.classList.toggle("show-widgets");
    $("drawerScrim").hidden = !document.body.classList.contains("show-widgets");
  });
  $("drawerScrim").addEventListener("click", () => {
    document.body.classList.remove("show-widgets");
    $("drawerScrim").hidden = true;
  });

  window.addEventListener("resize", () => { drawArcs(); });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $("picker").hidden = true;
      $("editSheet").hidden = true;
      document.body.classList.remove("show-widgets");
      unpin();
    }
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const i = Math.max(0, PROJECTS.findIndex((p) => p.id === hotId));
      const n = PROJECTS.length;
      const j = e.key === "ArrowRight" ? (i + 1) % n : (i - 1 + n) % n;
      if (hotId) document.querySelector(`.node[data-id="${hotId}"]`)?.classList.remove("is-hot");
      heat(PROJECTS[j].id, true);
    }
  });

  thoughtLoop();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
