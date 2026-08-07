/* lennymadethat.com — catalog. Three shelves: platform / agent / infra.
   Shared by index.html (grids) and product.html (detail pages).
   PUBLIC repo: product-level copy only. No secrets, no internal paths,
   no employer names, no data-source names. See CLAUDE.md sanitization gate. */
window.PRODUCTS = [

  /* ─────────────── THE PLATFORMS ─────────────── */
  {
    slug: "playletter",
    section: "platform",
    name: "PlayLetter",
    unit: "UNIT 01",
    kind: "CONSUMER APP",
    status: "live",
    logo: "/img/products/playletter-512.png",
    hook: "Your newsletters, out loud.",
    what: "An app that turns the newsletters you already subscribe to into a personal audio feed — natural AI voices, morning-show routines, offline listening, resume across devices. Shipped to the iOS App Store and Google Play with a live subscriber base. I designed, built, and run the whole thing: product, apps, billing, and the content pipeline behind it.",
    does: [
      "Reads any newsletter in one of six natural AI voices",
      "Builds personal routines that play like a morning show",
      "Follows publications for you — one tap, no inbox digging",
      "Offline listening and cross-device resume",
      "Native iOS, Android, desktop, and installable web app"
    ],
    tags: ["iOS + Android", "AI audio", "Consumer SaaS", "Cloudflare"],
    cta: { label: "Open playletter.com", href: "https://playletter.com" }
  },
  {
    slug: "retail-investor-report",
    section: "platform",
    name: "Retail Investor Report",
    unit: "UNIT 02",
    kind: "INVESTING PLATFORM",
    status: "live",
    logo: "/img/products/rir-mark.svg",
    wordmark: "/img/products/rir-wordmark.png",
    hook: "A full income-investing platform, shipped.",
    what: "A live platform for income-focused investors: screeners, a return simulator, fund-flow intelligence, research dossiers with full fundamentals, brokerage sync, and a member area — real accounts, a real database, and a self-running data engine that recomputes the entire US market every night with my computer off. Several of the agents below work here.",
    does: [
      "Owns its own copy of the US stock & fund market — no third-party outage can dark it",
      "Seven-stage nightly data pipeline, fully autonomous",
      "AI research dossiers across fundamentals and filings",
      "Brokerage connections with live holdings import",
      "Members, billing, and a paid data API seam"
    ],
    tags: ["Fintech", "Data platform", "Supabase", "Cloudflare Workers"],
    cta: { label: "Open retailinvestorreport.com", href: "https://retailinvestorreport.com" }
  },
  {
    slug: "assembly-floor",
    section: "platform",
    name: "Assembly Floor OS",
    unit: "UNIT 03",
    kind: "COMPANY OS",
    status: "live",
    logo: "/img/products/assembly-floor.svg",
    hook: "An operating system for manufacturers.",
    what: "The company operating system I ran a real manufacturing operation on — productized. Live jobs, sites, and field devices in one pane of glass, with an AI assistant that reads the same source of truth the floor runs on. Built by someone who spent five years as head of manufacturing, not by a software company guessing at the work.",
    does: [
      "Live jobs, sites, and device status in one console",
      "Source-of-truth data sync — the floor and the office see the same numbers",
      "An AI assistant wired into your operation's own data",
      "Ingests the paperwork a factory actually generates",
      "Born on a real production floor, then rebuilt to sell"
    ],
    tags: ["Manufacturing", "Operations", "AI assistant", "Live sync"],
    cta: { label: "See Assembly Floor", href: "https://assemblyfloor.ianleonard1988.workers.dev" }
  },
  {
    slug: "mothership",
    section: "platform",
    name: "Mothership",
    unit: "UNIT 04",
    kind: "ALWAYS-ON HARNESS",
    status: "open",
    logo: "/img/products/mothership-512.png",
    hook: "Any model. Always on. In your pocket.",
    what: "An LLM-agnostic, always-on harness for your home machine: pick any provider — API key, subscription, or free local model — and keep a forever chat running that you can reach from any phone or browser. Sessions survive across devices; no open ports, no VPN. Open-source and MIT-licensed: your box, your keys, your model.",
    does: [
      "LLM-agnostic — any provider API, subscription, or free local model",
      "Forever chat: sessions persist and survive across devices",
      "Reach your always-on machine from any phone or browser",
      "Cloudflare Worker relay — no open ports, no VPN",
      "Self-hosted and MIT-licensed. Your hardware, your keys"
    ],
    tags: ["Open source", "Self-hosted", "Remote control", "Any LLM"],
    cta: { label: "Get it on GitHub", href: "https://github.com/lennymadethat/mothership" }
  },
  {
    slug: "yield-agents",
    section: "platform",
    name: "Yield Agents",
    unit: "UNIT 05",
    kind: "AUTONOMOUS DESK",
    status: "live",
    logo: "/img/products/yield-agents-180.png",
    hook: "Agents that manage yield — with real money.",
    what: "A team of autonomous agents running a real yield strategy with real capital — allocation rules published on the page, accrual computed per-tick, and every number on the dashboard traceable to a real position. Built honest: no fabricated balances, no projected returns dressed up as earned ones.",
    does: [
      "Autonomous tiered agents running a live yield strategy",
      "Per-tick accrual — balances are exact, not projected",
      "Allocation rules published openly on the page",
      "Every dashboard number traceable to a real position",
      "Runs unattended in the cloud, around the clock"
    ],
    tags: ["Autonomous agents", "DeFi / yield", "Real capital", "Transparency"],
    cta: { label: "Open yieldagents.io", href: "https://yieldagents.io" }
  },
  {
    slug: "personal-agents",
    section: "platform",
    name: "Personal Agents",
    unit: "UNIT 06",
    kind: "AGENT SYSTEM",
    status: "build",
    logo: "/img/products/personal-agents.svg",
    hook: "Your own agent, on your own memory.",
    what: "Everything my agents run on, packaged for one person or one company: the vault (a structured knowledge base every agent reads and writes), the persistent memory system, and an agent wired into your own material. Plug in your accounts, bring an Anthropic API key, and you have a personal or professional agent that actually knows your world — and never starts cold.",
    does: [
      "The vault: one source of truth your agents read and write directly",
      "Persistent, searchable memory that survives every session",
      "A personal or company agent grounded in your own data",
      "Bring-your-own-key: your Anthropic API, your data, your machine",
      "The same backbone every product on this page was built with"
    ],
    tags: ["Agents", "Knowledge base", "MCP", "Self-hosted"],
    cta: { label: "Site in build — get early access", href: "mailto:hello@lennymadethat.com?subject=Personal%20Agents%20early%20access" },
    source: "https://github.com/lennymadethat/persistent-memory"
  },
  {
    slug: "the-desk",
    section: "platform",
    name: "The Desk",
    unit: "UNIT 07",
    kind: "MEDIA ENGINE",
    status: "beta",
    logo: "/img/products/the-desk.svg",
    hook: "Your media team, one approval tap.",
    what: "An automatic media engine: it generates social content across every lane of a brand, queues it in a multi-lane approval desk, and publishes only on a human tap — never on its own. Next up: it walks your photo library, assembles memories, and posts them with one click after notifying you. I run my brands on it daily.",
    does: [
      "Generates on-brand posts across multiple content lanes",
      "Multi-lane approval desk — human-tap publish, never auto-post",
      "Installable app; runs as a private production tool today",
      "Coming: photo-library memories, assembled and posted on one click",
      "In daily use across my own brands"
    ],
    tags: ["Content engine", "Social automation", "Approval flow", "PWA"],
    cta: { label: "Private beta — ask me about it", href: "mailto:hello@lennymadethat.com?subject=The%20Desk" }
  },

  /* ─────────────── THE AGENTS ─────────────── */
  {
    slug: "the-ingester",
    section: "agent",
    name: "The Ingester",
    unit: "AGENT 01",
    kind: "THE FILER",
    status: "live",
    logo: "/img/products/ingester.svg",
    art: "/img/agents/ingester.png",
    hook: "Chaos in. Filed knowledge out.",
    what: "Drop anything — notes, PDFs, images, audio, video — into one inbox, and a fleet of specialized agents reads it, classifies it, tags and links it, pulls out the action items, and files it into a single searchable knowledge base. Runs in the cloud on a schedule, so it works with your computer off. Originals always preserved.",
    does: [
      "One inbox for every file type — text, image, audio, video",
      "A sorter routes each file to the right specialist agent",
      "Tags, links, and files everything into one knowledge base",
      "Extracts action items and routes them to the right project",
      "Cloud-scheduled — runs while you sleep"
    ],
    tags: ["Multi-agent", "Automation", "Semantic search", "Cloud"],
    cta: { label: "Download the kit", href: "/kits/vault-fleet-kit.zip", download: true }
  },
  {
    slug: "the-harvester",
    section: "agent",
    name: "The Harvester",
    unit: "AGENT 02",
    kind: "THE RESEARCHER",
    status: "live",
    logo: "/img/products/harvester.svg",
    art: "/img/agents/harvester.png",
    hook: "A YouTube link in. A structured brief out.",
    what: "Paste a YouTube URL, pick a lens, and an AI pipeline watches the video, synthesizes it through your chosen point of view, writes a clean briefing page into your knowledge base, and routes the action items to the right projects. Hours of watching becomes minutes of reading.",
    does: [
      "Native video understanding — no manual transcripts",
      "Synthesizes through a configurable lens you choose",
      "Writes a structured briefing page automatically",
      "Routes action items to the right project",
      "Downloadable kit — bring your own keys and run it"
    ],
    tags: ["AI pipeline", "Video understanding", "Research", "Self-hosted"],
    cta: { label: "Download the kit", href: "/kits/harvester-kit.zip", download: true }
  },
  {
    slug: "sentinel",
    section: "agent",
    name: "Sentinel",
    unit: "AGENT 03",
    kind: "THE WATCHMAN",
    status: "live",
    logo: "/img/products/personal-agents.svg",
    art: "/img/agents/sentinel.png",
    hook: "Nothing goes quietly missing on his watch.",
    what: "The watchman of the investing platform. Sentinel patrols the data day and night looking for the failures that don't announce themselves — stale feeds, silent blanks, numbers that stopped moving. His rule: internal consistency isn't truth, and every blank needs a named reason. When something's wrong, a human hears about it before a member ever sees it.",
    does: [
      "Patrols the platform's data around the clock",
      "Hunts silent failures — stale feeds, frozen numbers, quiet blanks",
      "Every blank must carry a named reason and an expiry",
      "Escalates to a human before members ever notice",
      "Works the floor of Retail Investor Report"
    ],
    tags: ["Monitoring", "Data integrity", "Autonomous", "Fintech"],
    cta: { label: "See the platform he guards", href: "/products/retail-investor-report" }
  },
  {
    slug: "rico",
    section: "agent",
    name: "RICO",
    unit: "AGENT 04",
    kind: "THE GHOSTWRITER",
    status: "live",
    logo: "/img/products/the-desk.svg",
    art: "/img/agents/rico.png",
    hook: "Ramble in. On-brand draft out.",
    what: "The ghostwriter. RICO learns a voice from the published record — the actual sentences, the register, what would never be said — and turns raw input (typed notes, dictation, a phone voice memo) into a finished draft in that voice. Every draft passes voice and compliance checks, lands as a draft in the publishing tool, and never goes out without a human's final click.",
    does: [
      "Learns a voice fingerprint from the real published corpus",
      "Atomizes raw dumps into idea cards, then drafts",
      "Voice + compliance checks on every draft",
      "Delivers to the newsletter tool as a draft — never auto-publishes",
      "Downloadable as The Content Operative kit"
    ],
    tags: ["Voice modeling", "Content", "Newsletter", "Human-in-loop"],
    cta: { label: "Download the kit", href: "/kits/rico-kit.zip", download: true }
  },
  {
    slug: "carl",
    section: "agent",
    name: "Carl",
    unit: "AGENT 05",
    kind: "THE FRONT DESK",
    status: "live",
    logo: "/img/products/rir-512.png",
    art: "/img/agents/carl.png",
    hook: "The platform's own analyst, on call.",
    what: "The front desk of the investing platform. Carl answers members' questions using the platform's own live data — funds, yields, flows, filings — and remembers the conversation, so you never re-explain yourself. He's an overlay on every page: highlight something, ask, get an answer grounded in the numbers on screen.",
    does: [
      "Answers from the platform's live data, not from vibes",
      "Persistent chat memory — conversations pick up where they left off",
      "Rides along on every page as an overlay",
      "Grounded: cites the numbers actually on screen",
      "Works the front desk of Retail Investor Report"
    ],
    tags: ["AI assistant", "RAG", "Chat memory", "Fintech"],
    cta: { label: "Meet him on the platform", href: "https://retailinvestorreport.com" }
  },
  {
    slug: "the-undertaker",
    section: "agent",
    name: "The Undertaker",
    unit: "AGENT 06",
    kind: "THE MORTICIAN",
    status: "live",
    logo: "/img/products/assembly-floor.svg",
    art: "/img/agents/undertaker.png",
    hook: "No fund gets buried without a death certificate.",
    what: "Every investing product eventually has funds die on it — delisted, merged, liquidated. The Undertaker's job is to bury them properly: he declares a fund dead only on documentary evidence from official regulatory filings, never on a data feed's say-so. One source going quiet is not a death. Paperwork is. Then the grave gets a record.",
    does: [
      "Declares death only on documentary regulatory evidence",
      "Never trusts a single data source's silence",
      "Buries delisted and merged funds with a full record",
      "Keeps the living list clean so members never see ghosts",
      "Works the quiet end of Retail Investor Report"
    ],
    tags: ["Data hygiene", "SEC filings", "Evidence-based", "Autonomous"],
    cta: { label: "See the platform he tends", href: "/products/retail-investor-report" }
  },
  {
    slug: "scout",
    section: "agent",
    name: "Scout",
    unit: "AGENT 07",
    kind: "THE PROSPECTOR",
    status: "build",
    logo: "/img/products/playletter-512.png",
    art: "/img/agents/scout.png",
    hook: "Finds the newsletters worth your ears.",
    what: "PlayLetter's prospector. Scout hunts down publications worth following, preps the signups, and hands them to a human desk for the final click — he never subscribes to anything on his own. The goal: your audio feed keeps discovering great writing without you ever digging through an inbox.",
    does: [
      "Hunts down newsletters worth following",
      "Preps signups with everything ready to go",
      "Human-in-the-loop: a person approves every signup",
      "Feeds PlayLetter's discovery shelf",
      "Currently being fitted for duty"
    ],
    tags: ["Discovery", "Human-in-loop", "Consumer", "In build"],
    cta: { label: "See PlayLetter", href: "https://playletter.com" }
  },
  {
    slug: "coach",
    section: "agent",
    name: "Coach",
    unit: "AGENT 08",
    kind: "THE TRAINER",
    status: "beta",
    logo: "/img/products/personal-agents.svg",
    art: "/img/agents/coach.png",
    hook: "A trainer who never forgets a session.",
    what: "A coach built on persistent memory: every session, every number, every note — remembered and recalled. Where a human trainer's memory fades between sessions, Coach picks up exactly where you left off, tracks the long arc, and calls out what actually changed. The same memory system that powers my other agents, pointed at getting better at something.",
    does: [
      "Remembers every session, number, and note",
      "Tracks the long arc, not just today",
      "Calls out real change vs. noise",
      "Built on the persistent-memory backbone",
      "Private beta — ask about it"
    ],
    tags: ["Coaching", "Persistent memory", "Personal", "Beta"],
    cta: { label: "Ask me about Coach", href: "mailto:hello@lennymadethat.com?subject=Coach" }
  },
  {
    slug: "foreman",
    section: "agent",
    name: "Foreman",
    unit: "AGENT 09",
    kind: "THE FLOOR BOSS",
    status: "live",
    logo: "/img/products/assembly-floor.svg",
    art: "/img/agents/foreman.png",
    hook: "Runs the floor inside Assembly Floor OS.",
    what: "The assistant inside Assembly Floor OS. Foreman reads the same source of truth the factory runs on — jobs, sites, devices, paperwork — and answers like someone who's actually walked the floor. Ask what's late, what's idle, what changed overnight; get an answer from the operation's own data.",
    does: [
      "Reads the operation's live source of truth",
      "Answers floor questions from real data",
      "Digests the paperwork a factory generates",
      "Ships inside Assembly Floor OS",
      "Trained by someone who ran a real floor"
    ],
    tags: ["Manufacturing", "AI assistant", "Operations", "Embedded"],
    cta: { label: "See Assembly Floor OS", href: "/products/assembly-floor" }
  },

  {
    slug: "sellstuff",
    section: "agent",
    name: "SellStuff",
    unit: "AGENT 10",
    kind: "THE SALESMAN",
    status: "beta",
    logo: "/img/products/ingester.svg",
    art: "/img/agents/sellstuff.png",
    hook: "Packages the builds. Mans the storefront.",
    what: "The shop's salesman. SellStuff takes a finished build and turns it into something you can actually take home — a clean, documented, bring-your-own-keys distribution kit — and keeps the storefront stocked. Every kit in the Agent Shop below passed through his hands.",
    does: [
      "Packages builds into self-hostable distribution kits",
      "Writes the setup guide and config for every kit",
      "Keeps the Agent Shop shelves stocked and current",
      "Sanitizes everything — no secrets ever ship",
      "Paid licensing desk: coming"
    ],
    tags: ["Packaging", "Distribution", "Storefront", "Automation"],
    cta: { label: "Browse the Agent Shop", href: "/#shop" }
  },

  /* ─────────────── THE INFRASTRUCTURE ─────────────── */
  {
    slug: "the-vault",
    section: "infra",
    name: "The Vault",
    unit: "INFRA 01",
    kind: "THE BRAIN",
    status: "live",
    logo: "/img/products/vault.svg",
    hook: "One brain every agent reads and writes.",
    what: "The brain behind everything on this page: a structured knowledge base with semantic search that every AI agent reads from and writes to directly. Decisions, specs, session logs, project state — captured once, available to every agent forever. No agent starts cold; no context gets re-explained.",
    does: [
      "Single source of truth for every project and agent",
      "Semantic search over everything ever captured",
      "Agents read and write it directly",
      "Versioned, backed up, and self-hosted",
      "The backbone of the whole product line"
    ],
    tags: ["Knowledge base", "MCP", "Semantic search", "Infrastructure"],
    cta: { label: "Packaged inside Personal Agents", href: "/products/personal-agents" }
  },
  {
    slug: "persistent-memory",
    section: "infra",
    name: "Persistent Memory",
    unit: "INFRA 02",
    kind: "THE MEMORY",
    status: "open",
    logo: "/img/products/mothership-512.png",
    hook: "Any agent. Permanent, searchable memory.",
    what: "Open-source memory for AI agents: an MCP server plus a vector store and embedder that gives any assistant a permanent, searchable memory across every session. Self-hostable, MIT-licensed, and battle-tested as the memory layer under my own agents — including the forever chat that never loses the thread.",
    does: [
      "Permanent memory for any MCP-capable assistant",
      "Vector search over everything remembered",
      "Survives every session — no context resets",
      "Self-hostable: your database, your embedder, your keys",
      "MIT-licensed and public on GitHub"
    ],
    tags: ["Open source", "MCP", "Vector search", "Memory"],
    cta: { label: "Get it on GitHub", href: "https://github.com/lennymadethat/persistent-memory" }
  },
  {
    slug: "the-data-engine",
    section: "infra",
    name: "The Data Engine",
    unit: "INFRA 03",
    kind: "THE PULSE",
    status: "live",
    logo: "/img/products/rir-mark.svg",
    hook: "The whole US market, recomputed nightly. Untouched.",
    what: "A data platform that owns its own copy of the entire US stock-and-fund market and recomputes it every night — prices, integrity checks, trend signals, income analytics, breadth, macro — a seven-stage pipeline that runs in the cloud with my computer off. The platforms that read from it can't go dark because of an outside provider. The live readout in the Proof section below runs on it.",
    does: [
      "Owns the data — no live third-party dependency",
      "Seven-stage nightly pipeline, fully autonomous",
      "Integrity checks propose fixes, never auto-apply",
      "Feeds the investing platform and a sellable data API",
      "Its heartbeat is live on this very page"
    ],
    tags: ["Data platform", "Automation", "Cloud cron", "Fintech"],
    cta: { label: "See it beating — Proof", href: "/#proof" }
  }
];

window.PRODUCT_STATUS = {
  live: { label: "LIVE", cls: "st-live" },
  open: { label: "OPEN SOURCE", cls: "st-open" },
  beta: { label: "PRIVATE BETA", cls: "st-beta" },
  build: { label: "IN BUILD", cls: "st-build" }
};

/* THE AGENT SHOP — downloadable / sellable agents and kits. */
window.SHOP = [
  { name: "The Ingester", desc: "Drop any file in one inbox; a fleet of agents files it into a searchable knowledge base.", price: "FREE KIT", kit: "/kits/vault-fleet-kit.zip", page: "the-ingester" },
  { name: "The Harvester", desc: "YouTube link in, structured brief out — through the lens you choose.", price: "FREE KIT", kit: "/kits/harvester-kit.zip", page: "the-harvester" },
  { name: "RICO — The Content Operative", desc: "Ramble in, on-brand draft out. A ghostwriter with a learned voice fingerprint.", price: "FREE KIT", kit: "/kits/rico-kit.zip", page: "rico" },
  { name: "The Forge", desc: "Draw a workflow as a graph, press run. One interpreter executes any graph you draw.", price: "FREE KIT", kit: "/kits/forge-runner-kit.zip" },
  { name: "Income Data API", desc: "The investing platform's dataset behind tiered, agent-priced keys.", price: "KIT", kit: "/kits/rir-api-kit.zip" },
  { name: "Persistent Memory", desc: "Permanent, searchable memory for any AI agent — MCP server + vector store.", price: "OPEN SOURCE · MIT", href: "https://github.com/lennymadethat/persistent-memory", page: "persistent-memory" },
  { name: "Mothership", desc: "Any-model, always-on harness for your home machine — reach it from your phone.", price: "OPEN SOURCE · MIT", href: "https://github.com/lennymadethat/mothership", page: "mothership" }
];
