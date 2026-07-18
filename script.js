/* lennymadethat.com — minimal progressive-enhancement JS.
   No dependencies. Site is fully readable without it. */
(function () {
  "use strict";

  // ─────────────────────── Mobile nav toggle ───────────────────────
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close the menu after tapping a link (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ─────────────────────── Current year in footer ───────────────────────
  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ─────────────────────── Live engine readout ───────────────────────
  // Progressive enhancement: pulls a PUBLIC, key-less market endpoint and
  // reveals the readout only on success. If the engine is unreachable the
  // block stays hidden — the page never shows a broken widget. No secrets.
  (function () {
    var box = document.getElementById("live-engine");
    var line = document.getElementById("live-engine-line");
    if (!box || !line) return;
    var EP = "https://hyt-data.ianleonard1988.workers.dev/market";
    var ctrl, timer;
    try { ctrl = new AbortController(); timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 6000); } catch (e) {}
    fetch(EP, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
      .then(function (m) {
        if (timer) clearTimeout(timer);
        if (!m || m.total == null || m.stage2 == null) throw new Error("shape");
        var nf = function (n) { return Number(n).toLocaleString(); };
        line.innerHTML =
          "<strong>" + nf(m.stage2) + "</strong> stocks are in a confirmed uptrend right now — "
          + "<strong>" + m.pct_above_sma200 + "%</strong> of the market sits above its 200-day average, "
          + "across <strong>" + nf(m.total) + "</strong> names tracked.";
        var asof = box.querySelector(".live-engine__asof");
        if (asof && m.as_of_date) asof.textContent = m.as_of_date;
        box.hidden = false;
      })
      .catch(function () { if (timer) clearTimeout(timer); /* stay hidden — never show broken */ });
  })();

  // ============================================================
  //  THE FOUNDRY — build catalog
  //  Product-level descriptions ONLY. No secrets, no tokens, no
  //  internal paths, no private IDs. See CLAUDE.md sanitization gate.
  //  status: "live" | "shipped" | "build" | "soon"
  //  download / instructions / agent are honest placeholders.
  // ============================================================
  var BUILDS = [
    {
      id: "content-operative",
      dlUrl: "kits/rico-kit.zip",
      icon: "✍",
      title: "The Content Operative",
      status: "live",
      group: "agent",
      hook: "Ramble in. On-brand draft out.",
      desc: "An AI content agent that turns raw input — typed notes, dictation, or a phone voice memo — into a finished, on-brand draft in your voice, then pushes it straight into your newsletter platform as a draft. It learns a voice fingerprint, runs voice and disclaimer checks on every draft, and never publishes on its own — the final click stays human.",
      tags: ["AI agent", "Voice modeling", "Newsletter", "Cloudflare"],
      agent: [
        "Atomizes raw dumps into idea cards",
        "Drafts in a learned voice fingerprint",
        "Voice + compliance checks before every draft",
        "Drafts to your newsletter tool, never auto-publishes"
      ],
      download: "kit",
      instructions: true
    },
    {
      id: "vault-fleet",
      dlUrl: "kits/vault-fleet-kit.zip",
      icon: "🗄",
      title: "Vault Agent Fleet",
      status: "live",
      group: "agent",
      hook: "A team of AI workers that files your chaos.",
      desc: "Drop any file — notes, PDFs, images, audio, video — into one inbox and a fleet of specialized AI agents reads it, classifies it, tags and links it, pulls out action items, and files it into a single searchable knowledge base. Runs in the cloud on a schedule, so it works even with your computer off. Originals are always preserved and recoverable.",
      tags: ["Multi-agent", "Automation", "Semantic search", "Cloud"],
      agent: [
        "Sorter routes each file to the right workers",
        "8 specialized agents: tag, link, extract, dedupe, scan",
        "Multimodal — reads audio, video, and images as text",
        "Surfaces cross-project opportunities automatically"
      ],
      download: "soon",
      instructions: true
    },
    {
      id: "harvester",
      dlUrl: "kits/harvester-kit.zip",
      icon: "📡",
      title: "The Harvester",
      status: "live",
      group: "agent",
      hook: "A YouTube link in, a structured brief out.",
      desc: "Paste a YouTube URL, pick a lens, and an AI pipeline watches the video, synthesizes it through your chosen point of view, writes a clean briefing page into your knowledge base, and routes the action items to the right projects. Turns hours of watching into minutes of reading.",
      tags: ["AI pipeline", "Video understanding", "Research", "Cloud"],
      agent: [
        "Native video ingestion — no manual transcript",
        "Synthesizes through a configurable lens",
        "Writes a structured briefing automatically",
        "Routes action items to the right project"
      ],
      download: "soon",
      instructions: true
    },
    {
      id: "forge",
      dlUrl: "kits/forge-runner-kit.zip",
      icon: "⚙",
      title: "The Forge",
      status: "shipped",
      group: "agent",
      hook: "Draw a workflow. Press run.",
      desc: "A visual workflow builder paired with a generic execution engine: you draw an automation as a graph of nodes — triggers, AI steps, data reads and writes, outputs — and one interpreter runs any graph you draw. No per-workflow code. Built to be self-hostable from a clean template.",
      tags: ["Workflow engine", "AI orchestration", "No-code", "Self-hostable"],
      agent: [
        "One interpreter runs any visual workflow",
        "AI reasoning nodes wired into the graph",
        "Reads and writes your knowledge base",
        "Drafts only — never auto-posts anywhere"
      ],
      download: "soon",
      instructions: true
    },
    {
      id: "playletter",
      icon: "🎧",
      title: "PlayLetter",
      status: "live",
      group: "app",
      hook: "Your newsletters, as a podcast you actually finish.",
      desc: "My own consumer product: an app that turns the newsletters you already subscribe to into a personal audio feed — natural AI voices, morning-show routines, offline listening, and resume-across-devices. Shipped to the iOS App Store and Google Play with a live subscriber base. Designed, built, and run end to end — the product, the apps, the billing, and the content pipeline behind it.",
      tags: ["Consumer app", "iOS + Android", "AI audio", "SaaS"],
      agent: [
        "Newsletters converted to natural AI narration",
        "Personal routines that play like a morning show",
        "Offline listening + cross-device resume",
        "Native iOS + Android, live in both app stores"
      ],
      // Device-aware app button lights up the moment the public store URLs land:
      // get: { ios: "https://apps.apple.com/app/...", android: "https://play.google.com/store/apps/details?id=..." }
      appPending: true,
      download: "na",
      instructions: true
    },
    {
      id: "data-engine",
      icon: "🛰",
      title: "Self-Running Data Engine",
      status: "live",
      group: "app",
      hook: "The whole US market, recomputed every night — untouched.",
      desc: "A data platform that owns its own copy of the entire US stock-and-fund market and recomputes it automatically every night: prices, data-integrity checks, trend and momentum signals, income analytics, market breadth, sector rotation, and the macro backdrop — a seven-stage pipeline that runs in the cloud with my computer off. The app that reads from it can't go dark because of an outside data provider; the data is owned. A live readout from it runs on this page.",
      tags: ["Data platform", "Automation", "Cloud cron", "Fintech"],
      agent: [
        "Seven-stage nightly pipeline, fully autonomous",
        "Flag-only integrity — proposes fixes, never auto-applies",
        "Owns the data: no live third-party dependency",
        "Powers a live web app and a sellable data API"
      ],
      download: "na",
      instructions: true
    },
    {
      id: "rir-platform",
      icon: "📈",
      title: "Retail Investor Platform",
      status: "live",
      group: "app",
      hook: "A full income-investing platform, shipped.",
      desc: "A live web application for income-focused investors: screening tools, a return simulator, fund-flow intelligence, a research dossier with full fundamentals, and a member area — with real accounts, brokerage connections, and a live database behind it. Designed, built, and deployed end to end on a clean dev→live pipeline.",
      tags: ["Web app", "Fintech", "Supabase", "Cloudflare Workers"],
      agent: [
        "AI research dossier across fundamentals",
        "Brokerage account sync and activity import",
        "Automated holdings + filing intelligence",
        "Shareable, SEO-clean deep links"
      ],
      download: "na",
      instructions: true
    },
    {
      id: "yield-observatory",
      icon: "🪙",
      title: "Yield Observatory",
      status: "shipped",
      group: "app",
      hook: "Stablecoin & RWA yields, scored and mapped.",
      desc: "A fast, static dashboard tracking stablecoin and real-world-asset yields with reliability scoring, per-venue risk dossiers, and an issuer directory — built entirely on public data, zero API keys, with an ambient living-world animation layer tuned by the live yield data. Numbers are sourced, never invented.",
      tags: ["Dashboard", "Data viz", "Public data", "Static"],
      agent: [
        "AI-authored per-venue risk dossiers",
        "Reliability scoring model",
        "Machine-readable data layer for agents"
      ],
      download: "na",
      instructions: true
    },
    {
      id: "podcast-studio",
      icon: "🎙",
      title: "Podcast Studio",
      status: "live",
      group: "app",
      hook: "Record, edit by text, publish.",
      desc: "A browser-based recording studio: capture audio or video, auto-cut dead air, enhance voice, and edit by tapping words in the transcript. Generates AI cover art and publishes to a clean public episode page. Editing runs on-device — no upload round-trips to edit.",
      tags: ["Web app", "Audio/Video", "Transcription", "AI media"],
      agent: [
        "Word-level AI transcription",
        "Edit audio by editing text",
        "AI-generated cover thumbnails"
      ],
      download: "na",
      instructions: true
    },
    {
      id: "us3-ops",
      icon: "🏭",
      title: "Field Ops Console",
      status: "live",
      group: "app",
      hook: "One pane of glass for field operations.",
      desc: "An operations console that syncs live jobs, sites, and field devices into a single application — project and device detail pages, status at a glance, source-of-truth data sync. A real production tool that runs day-to-day field work, built single-file with a clean deploy.",
      tags: ["Web app", "Operations", "Live sync", "Single-file"],
      agent: [],
      download: "na",
      instructions: true
    },
    {
      id: "data-api",
      dlUrl: "kits/rir-api-kit.zip",
      icon: "🔌",
      title: "Income Data API",
      status: "build",
      group: "tool",
      hook: "Programmatic access to the dataset.",
      desc: "A paid API that exposes the income-ETF dataset behind the investor platform for programmatic and agent access — tiered keys, a clean free tier, and a metered wall for automated consumers. The seam for selling data, not just the app.",
      tags: ["API", "Monetization", "Agent-ready"],
      agent: [
        "Agent-priced access wall",
        "Tiered API keys",
        "Built for machine consumers"
      ],
      download: "soon",
      instructions: true
    },
    {
      id: "starter-kit",
      icon: "🧱",
      title: "dev → live Starter Kit",
      status: "build",
      group: "tool",
      hook: "The skeleton behind every build here.",
      desc: "The repo template I spin up for every new project: branch structure, deploy config, and the sanitization gate that keeps secrets out of public builds. The discipline that lets a repo go from empty to deployed in a day. Polishing it to share.",
      tags: ["Template", "DevOps", "Cloudflare"],
      agent: [],
      download: "soon",
      instructions: true
    },
    {
      id: "vault-system",
      icon: "🧠",
      title: "The Vault System",
      status: "live",
      group: "tool",
      hook: "One brain every AI agent reads and writes.",
      desc: "A structured markdown knowledge base backed by a database with semantic search, plus a custom server that lets any AI assistant read from and write to it directly. One source of truth — every agent works from current context instead of starting cold. It's the backbone the rest of these builds run on.",
      tags: ["Knowledge base", "MCP", "Semantic search", "Infrastructure"],
      agent: [
        "Read/write access for any AI assistant",
        "Semantic search over everything you've captured",
        "Shared memory across every agent"
      ],
      get: { source: "https://github.com/lennymadethat/persistent-memory" },
      download: "kit",
      instructions: true
    },
    {
      id: "mothership",
      icon: "🛸",
      title: "Mothership",
      status: "live",
      group: "tool",
      hook: "Port into your always-on home computer from your phone.",
      desc: "A self-hostable control hub that lets you reach a coding agent running on your always-on home machine from any phone or browser — pick up a session on the couch, keep it going on the train. Open-source and MIT-licensed: bring your own machine, arm the access token, and you're in. The backbone of how I build from anywhere.",
      tags: ["Self-hostable", "Cloudflare Worker", "Remote control", "Open source"],
      agent: [
        "Drive a home coding agent from your phone",
        "Sessions survive across devices",
        "Token-gated access, self-hosted — your box, your keys"
      ],
      get: { source: "https://github.com/lennymadethat/mothership" },
      download: "na",
      instructions: true
    }
  ];

  var STATUS_META = {
    live:    { label: "Live · in daily use", cls: "is-live" },
    shipped: { label: "Shipped",             cls: "is-shipped" },
    build:   { label: "In build",            cls: "is-build" },
    soon:    { label: "Coming soon",         cls: "is-soon" }
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ─────────────────────── Device-aware download targets ───────────────────────
  // Resolves the RIGHT artifact for the visitor's device:
  //   desktop → Windows installer (.exe) · iPhone → App Store · Android → Play
  //   any → web app / kit-zip / source. A button only renders when a real URL
  //   exists — no dead links, no fake "download" that goes nowhere.
  function deviceKind() {
    try {
      var ua = navigator.userAgent || "";
      if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
      if (/Android/i.test(ua)) return "android";
      var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      var narrow = (window.innerWidth || 999) < 820;
      if (coarse && narrow) return "mobile";
    } catch (e) {}
    return "desktop";
  }

  // Given a build's `get` map + the device, return {href,label,hint} or null.
  function resolveGet(g, kind) {
    if (!g) return null;
    if (kind === "ios" && g.ios) return { href: g.ios, label: "Get the app", hint: "App Store" };
    if (kind === "android" && g.android) return { href: g.android, label: "Get the app", hint: "Google Play" };
    if (kind === "desktop" && g.windows) return { href: g.windows, label: "Download", hint: "Windows" };
    if ((kind === "ios" || kind === "android" || kind === "mobile") && (g.android || g.ios))
      return { href: g.android || g.ios, label: "Get the app", hint: "mobile" };
    if (g.web) return { href: g.web, label: "Open the app", hint: "web" };
    if (g.source) return { href: g.source, label: "View source", hint: "GitHub" };
    return null;
  }

  // Primary smart-get button (device-resolved). "" when nothing real to offer.
  function getBtn(b, kind) {
    var r = resolveGet(b.get, kind);
    if (!r) return "";
    var external = /^https?:/i.test(r.href);
    var dl = /\.exe($|\?)/i.test(r.href) || /\.zip($|\?)/i.test(r.href);
    return '<a class="kit-btn kit-btn--get" href="' + esc(r.href) + '"'
      + (external ? ' target="_blank" rel="noopener"' : "")
      + (dl ? " download" : "")
      + ' title="' + esc(r.label + " · " + r.hint) + '">'
      + iconExternal() + esc(r.label) + '<span class="kit-btn__hint">' + esc(r.hint) + "</span></a>";
  }

  // Build one card's HTML
  function cardHTML(b) {
    var st = STATUS_META[b.status] || STATUS_META.build;
    var tags = (b.tags || [])
      .map(function (t) { return '<li class="foundry-card__tag">' + esc(t) + "</li>"; })
      .join("");

    var hasAgent = b.agent && b.agent.length;

    // Device-resolved primary action (App Store / Play / Windows / web / source)
    var gb = getBtn(b, deviceKind());

    // Download affordance
    var dl;
    if (b.dlUrl) {
      dl = '<a class="kit-btn kit-btn--download" href="' + esc(b.dlUrl) + '" download title="Download the distribution kit (.zip)">'
         + iconDownload() + 'Download<span class="kit-btn__hint">kit</span></a>';
    } else if (b.download === "kit" || b.download === "soon") {
      dl = '<button class="kit-btn kit-btn--download" data-soon="1" type="button" title="Distribution kit packaging in progress">'
         + iconDownload() + 'Download<span class="kit-btn__hint">soon</span></button>';
    } else if (gb) {
      dl = ""; // a real device-resolved button replaces the passive "Hosted" badge
    } else if (b.appPending) {
      dl = '<span class="kit-btn kit-btn--na" aria-disabled="true" title="Native iOS + Android — public store links coming">'
         + iconDownload() + 'On iOS + Android</span>';
    } else { // "na"
      dl = '<span class="kit-btn kit-btn--na" aria-disabled="true" title="This is a live product, not a downloadable kit">'
         + iconDownload() + 'Hosted</span>';
    }

    // Instructions affordance
    var instr = b.instructions
      ? '<button class="kit-btn" type="button" data-build="' + esc(b.id) + '" data-action="details">'
        + iconBook() + 'Instructions</button>'
      : '<span class="kit-btn kit-btn--na" aria-disabled="true">' + iconBook() + 'Soon</span>';

    // Agent affordance
    var ag = hasAgent
      ? '<button class="kit-btn kit-btn--agent" type="button" data-build="' + esc(b.id) + '" data-action="details">'
        + iconSpark() + 'Agent features<span class="kit-btn__count">' + b.agent.length + "</span></button>"
      : '<span class="kit-btn kit-btn--na" aria-disabled="true">' + iconSpark() + "No agent</span>";

    return ''
      + '<article class="foundry-card" id="build-' + esc(b.id) + '">'
      +   '<div class="foundry-card__head">'
      +     '<span class="foundry-card__icon" aria-hidden="true">' + esc(b.icon) + "</span>"
      +     '<span class="foundry-card__status ' + st.cls + '">' + esc(st.label) + "</span>"
      +   "</div>"
      +   '<h3 class="foundry-card__title">' + esc(b.title) + "</h3>"
      +   '<p class="foundry-card__hook">' + esc(b.hook) + "</p>"
      +   '<p class="foundry-card__desc">' + esc(b.desc) + "</p>"
      +   '<ul class="foundry-card__tags">' + tags + "</ul>"
      +   '<div class="foundry-card__actions">' + gb + dl + instr + ag + "</div>"
      + "</article>";
  }

  // Inline SVG icons (currentColor, decorative)
  function iconDownload() {
    return '<svg class="kit-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>';
  }
  function iconBook() {
    return '<svg class="kit-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-4v16h4a2 2 0 0 1 2 2z"/></svg>';
  }
  function iconSpark() {
    return '<svg class="kit-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/></svg>';
  }
  function iconExternal() {
    return '<svg class="kit-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  }

  // Render the grid + optional filter chips
  var grid = document.getElementById("foundry-grid");
  if (grid) {
    grid.innerHTML = BUILDS.map(cardHTML).join("");

    // Filter chips
    var chips = document.querySelectorAll("[data-filter]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
        var cards = grid.querySelectorAll(".foundry-card");
        BUILDS.forEach(function (b, i) {
          var show = f === "all" || b.group === f;
          if (cards[i]) cards[i].style.display = show ? "" : "none";
        });
      });
    });
  }

  // ─────────────────────── Details modal ───────────────────────
  var modal = document.getElementById("build-modal");
  var lastFocus = null;

  function buildById(id) {
    for (var i = 0; i < BUILDS.length; i++) if (BUILDS[i].id === id) return BUILDS[i];
    return null;
  }

  function openModal(id) {
    if (!modal) return;
    var b = buildById(id);
    if (!b) return;
    var st = STATUS_META[b.status] || STATUS_META.build;

    var agentList = (b.agent && b.agent.length)
      ? '<h4 class="modal__subhead">' + iconSpark() + "What the agent does</h4>"
        + '<ul class="modal__agent">'
        + b.agent.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("")
        + "</ul>"
      : '<p class="modal__muted">No autonomous agent in this build.</p>';

    var dlNote;
    if (b.get && b.get.source) {
      dlNote = "Open source — clone or fork it on GitHub (MIT).";
    } else if (b.appPending) {
      dlNote = "Native iOS + Android app — public store links are on the way.";
    } else if (b.download === "na") {
      dlNote = "This is a hosted, live product — not a downloadable kit.";
    } else {
      dlNote = "A distribution kit (download + setup guide, with Stripe licensing) is being packaged for this build.";
    }

    var body = ''
      + '<div class="modal__head">'
      +   '<span class="foundry-card__icon" aria-hidden="true">' + esc(b.icon) + "</span>"
      +   "<div>"
      +     '<h3 id="build-modal-title" class="modal__title">' + esc(b.title) + "</h3>"
      +     '<span class="foundry-card__status ' + st.cls + '">' + esc(st.label) + "</span>"
      +   "</div>"
      + "</div>"
      + '<p class="modal__hook">' + esc(b.hook) + "</p>"
      + (function () { var g = getBtn(b, deviceKind()); return g ? '<div class="modal__get">' + g + "</div>" : ""; })()
      + '<p class="modal__desc">' + esc(b.desc) + "</p>"
      + '<ul class="foundry-card__tags">'
      +   (b.tags || []).map(function (t) { return '<li class="foundry-card__tag">' + esc(t) + "</li>"; }).join("")
      + "</ul>"
      + agentList
      + '<h4 class="modal__subhead">' + iconBook() + "How it works</h4>"
      + '<p class="modal__muted">A full write-up is on the way. The short version: it runs on a documented dev→live pipeline against real infrastructure, drafts-only by default, with secrets kept out of anything shipped.</p>'
      + '<div class="modal__kit">'
      +   '<span class="modal__kit-label">' + iconDownload() + "Distribution kit</span>"
      +   "<p class=\"modal__muted\">" + esc(dlNote) + "</p>"
      +   (b.download === "na"
            ? ""
            : '<button class="btn btn--primary btn--sm" type="button" data-action="notify">Notify me when it drops</button>')
      + "</div>";

    var content = modal.querySelector(".modal__content");
    if (content) content.innerHTML = '<button class="modal__close" type="button" aria-label="Close">&times;</button>' + body;

    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Event delegation: open details, close, notify, soon-buttons
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest ? e.target.closest("[data-action]") : null;
    if (trigger) {
      var action = trigger.getAttribute("data-action");
      if (action === "details") {
        openModal(trigger.getAttribute("data-build"));
        return;
      }
      if (action === "notify") {
        window.location.href = "#contact";
        closeModal();
        return;
      }
    }
    if (modal && modal.classList.contains("is-open")) {
      if (e.target.classList.contains("modal__close") || e.target === modal) {
        closeModal();
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) closeModal();
  });
})();
