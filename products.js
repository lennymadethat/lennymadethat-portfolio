/* lennymadethat.com — THE LINE product catalog.
   Shared by index.html (grid) and product.html (detail pages).
   PUBLIC repo: product-level copy only. No secrets, no internal paths,
   no employer names. See CLAUDE.md sanitization gate. */
window.PRODUCTS = [
  {
    slug: "playletter",
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
    name: "Retail Investor Report",
    unit: "UNIT 02",
    kind: "INVESTING PLATFORM",
    status: "live",
    logo: "/img/products/rir-512.png",
    wordmark: "/img/products/rir-wordmark.png",
    hook: "A full income-investing platform, shipped.",
    what: "A live platform for income-focused investors: screeners, a return simulator, fund-flow intelligence, research dossiers with full fundamentals, brokerage sync, and a member area — real accounts, a real database, and a self-running data engine that recomputes the entire US market every night with my computer off.",
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
    slug: "personal-agents",
    name: "Personal Agents",
    unit: "UNIT 04",
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
    slug: "mothership",
    name: "Mothership",
    unit: "UNIT 05",
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
    name: "Yield Agents",
    unit: "UNIT 06",
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
    slug: "the-desk",
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
  {
    slug: "the-ingester",
    name: "The Ingester",
    unit: "UNIT 08",
    kind: "STANDALONE AGENT",
    status: "live",
    logo: "/img/products/ingester.svg",
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
    name: "The Harvester",
    unit: "UNIT 09",
    kind: "STANDALONE AGENT",
    status: "live",
    logo: "/img/products/harvester.svg",
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
  }
];

window.PRODUCT_STATUS = {
  live: { label: "LIVE", cls: "st-live" },
  open: { label: "OPEN SOURCE", cls: "st-open" },
  beta: { label: "PRIVATE BETA", cls: "st-beta" },
  build: { label: "IN BUILD", cls: "st-build" }
};

/* THE AGENT SHOP — downloadable / sellable agents and kits.
   price: honest label. kit: direct zip. href: external. soon: no artifact yet. */
window.SHOP = [
  { name: "The Ingester", desc: "Drop any file in one inbox; a fleet of agents files it into a searchable knowledge base.", price: "FREE KIT", kit: "/kits/vault-fleet-kit.zip", page: "the-ingester" },
  { name: "The Harvester", desc: "YouTube link in, structured brief out — through the lens you choose.", price: "FREE KIT", kit: "/kits/harvester-kit.zip", page: "the-harvester" },
  { name: "The Content Operative", desc: "Ramble in, on-brand draft out. A ghostwriter agent with a learned voice fingerprint.", price: "FREE KIT", kit: "/kits/rico-kit.zip" },
  { name: "The Forge", desc: "Draw a workflow as a graph, press run. One interpreter executes any graph you draw.", price: "FREE KIT", kit: "/kits/forge-runner-kit.zip" },
  { name: "Income Data API", desc: "The investing platform's dataset behind tiered, agent-priced keys.", price: "KIT", kit: "/kits/rir-api-kit.zip" },
  { name: "Persistent Memory", desc: "Permanent, searchable memory for any AI agent — MCP server + vector store.", price: "OPEN SOURCE · MIT", href: "https://github.com/lennymadethat/persistent-memory" },
  { name: "Mothership", desc: "Any-model, always-on harness for your home machine — reach it from your phone.", price: "OPEN SOURCE · MIT", href: "https://github.com/lennymadethat/mothership", page: "mothership" }
];
