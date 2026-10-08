// lennymadethat.com — every piece of content on the page lives here.
// The layout (skeleton.js) only renders what this file says. Later sessions drop in media and copy
// by editing this file: a `video` path fills a slot, a `null` shows a labelled placeholder.
// `todo` names the to-do row that fills a gap (the rebuild to-do list, rows F/V/A/P/L).

// ---------- 1. THE PRODUCT SWIPE ----------
export const products = [
  {
    slug: "retail-investor-report",
    name: "Retail Investor Report",
    hook: "A full income-investing platform, shipped.",
    logo: "/img/products/rir-mark.svg",
    // The ambient desk (scenes/rir-desk): Carl rises out of the centre screen and strikes the real product onto the glass.
    scene: "/scenes/rir-desk/?embed=1",
    sceneBg: "#070B12",   // the night desk's colour while it loads
    video: null, poster: null, todo: null,
    visit: { label: "Visit Retail Investor Report", href: "https://retailinvestorreport.com" },
    explainer: null,
  },
  {
    slug: "playletter",
    name: "PlayLetter",
    hook: "Your newsletters, out loud.",
    logo: "/img/products/playletter-512.png",
    // The ambient room (scenes/playletter-room) replaces the film on the swipe; the films stay for fallback.
    scene: "/scenes/playletter-room/?embed=1",
    film: true,
    // v5 = the karaoke loop: Lily's words lighting up on the real word clock, 12 s, seamless,
    // reads with the sound off (the carousel autoplays muted). Unmute and she speaks.
    video: "/media/films/playletter-wide-v5.mp4",
    videoMobile: "/media/films/playletter-mobile-v2.mp4",
    poster: "/media/films/playletter-wide-v5.jpg",
    posterMobile: "/media/films/playletter-mobile-v2.jpg",
    todo: null,
    visit: { label: "Visit PlayLetter", href: "https://playletter.com" },
    // The maker's cut (32 s, narrated by Lily, sound on) opens on tap.
    explainer: { label: "Watch the film", href: "/media/films/playletter-maker-v1.mp4" },
  },
  {
    slug: "assembly-floor",
    name: "Assembly Floor",
    hook: "Agents installed in your company, by the person who built them.",
    logo: "/img/products/assembly-floor.svg",
    // Original film is a temporary stand-in while the showcase is reworked.
    film: true,
    video: "/media/films/assembly-floor-placeholder-v1.mp4",
    poster: "/media/films/assembly-floor-placeholder-v1.png",
    todo: null,
    visit: { label: "See Assembly Floor", href: null, todo: "P1" }, // its own landing page, four tiers
    explainer: null,
  },
  {
    slug: "mothership",
    name: "Mothership",
    hook: "Your machines, in your pocket.",
    logo: "/img/products/mothership-512.png",
    video: null, poster: null, todo: "V4",
    visit: { label: "Get Mothership", href: "https://github.com/lennymadethat/mothership" },
    explainer: null,
  },
  {
    slug: "yield-agents",
    name: "Yield Agents",
    hook: "Agents that manage yield, with real money.",
    logo: "/img/products/yield-agents-180.png",
    video: null, poster: null, todo: "V5",
    visit: { label: "Visit Yield Agents", href: "https://yieldagents.io" },
    explainer: null,
  },
  // Agent Hub joins when it is done (V6).
];

// ---------- 2. AGENT SELECT ----------
// stats: `value` null = the real number is not in yet (A3). Never invent one.
export const agents = [
  {
    slug: "sellstuff",
    name: "Agent Sell Stuff",
    title: "The Stall",
    line: "Snap a pic. He sells it.",
    art: "/img/agents/sellstuff.png", idle: null, special: null, todo: "A1 / A2",
    stats: [{ label: "Listings posted", value: null }, { label: "Avg. time to list", value: null }, { label: "Items sold", value: null }],
    equipment: ["Telegram", "Claude", "eBay"],
    skills: ["Writes the listing", "Prices it", "Posts on one tap", "Drops the price", "Takes it down"],
    button: { label: "Download", href: null, todo: "A4" },
  },
  {
    slug: "harvester",
    name: "Harry the Harvester",
    title: "The Researcher",
    line: "A YouTube link in. A structured brief out.",
    art: "/img/agents/harvester.png", idle: null, special: null, todo: "A1 / A2",
    stats: [{ label: "Videos harvested", value: null }, { label: "Lenses", value: null }, { label: "Pages filed", value: null }],
    equipment: ["Gemini", "Claude", "Your library"],
    skills: ["Watches the whole video", "Reads through your lens", "Visuals lens", "Writes the brief", "Routes the to-dos"],
    button: { label: "Download", href: "https://github.com/lennymadethat/harvester" },
  },
  {
    slug: "ingester",
    name: "The Ingester",
    title: "The Filer",
    line: "Chaos in. Filed knowledge out.",
    art: "/img/agents/ingester.png", idle: null, special: null, todo: "A1 / A2",
    stats: [{ label: "Files filed", value: null }, { label: "Specialist agents", value: null }, { label: "Runs per day", value: null }],
    equipment: ["Inbox", "Claude", "Your library"],
    skills: ["Reads any file", "Sorts it", "Tags and links it", "Pulls the action items", "Runs with your computer off"],
    button: { label: "Download", href: "https://github.com/lennymadethat/ingester" },
  },
  {
    slug: "carl",
    name: "CARL",
    title: "The Market Research Guru",
    line: "Retail Investor Report's own analyst, on call.",
    art: "/img/agents/carl.png", idle: null, special: null, todo: "A1 / A2",
    stats: [{ label: "Funds tracked", value: null }, { label: "Data sources", value: null }, { label: "Questions answered", value: null }],
    equipment: ["RIR database", "Live market data", "Chat memory"],
    skills: ["Answers from live data", "Remembers the conversation", "Rides on every page", "Cites the numbers on screen"],
    button: { label: "Use it now", href: "https://retailinvestorreport.com" },
  },
];

// The crews: agents at work inside the platforms. Each becomes a chapter of that product's
// explainer page (P2 / A5).
export const crews = [
  { name: "PlayLetter's crew", line: "The agents that read, voice and publish every letter.", href: null, todo: "A5" },
  { name: "RIR's crew", line: "The agents that research, guard and tend the platform.", href: null, todo: "A5" },
  { name: "The Floor's workers", line: "The agents installed on a company's floor.", href: null, todo: "A5" },
];

// ---------- 3. THE SECOND BRAIN ----------
// Scroll-scrubbed frame sequence. Stand-in = the v2 draft film (V7 replaces it).
export const secondBrain = {
  frames: { dir: "/frames/second-brain/", count: 145, pad: 3, ext: "webp", width: 854, height: 480 },
  todo: "V7",
  beats: [
    { at: 0.00, text: "Tell one AI something." },
    { at: 0.25, text: "The rulebook checks it at the door." },
    { at: 0.50, text: "The librarian files it by meaning." },
    { at: 0.75, text: "Ask any other AI. Same memory comes back." },
  ],
  download: { label: "Get Second Brain", href: "https://github.com/lennymadethat/second-brain" },
};

// ---------- 4. DOWNLOADS ----------
export const downloads = [
  { name: "Second Brain", line: "Persistent memory for any AI agent.", img: "/img/downloads/second-brain.png",
    desc: "A rulebook handed to every agent the moment it connects, a memory server with five tools, and a hosted library with a vector index. Claude, ChatGPT, Grok, Gemini, any CLI: if it speaks MCP, it remembers. You own the files.",
    code: "https://github.com/lennymadethat/second-brain", setup: "https://github.com/lennymadethat/second-brain/blob/master/KIT.md" },
  { name: "Ingester", line: "Drop a file. Get a memory.", img: "/img/downloads/ingester.png",
    desc: "Receipts, transcripts, scans, photos of whiteboards. One inbox, read by the model, filed by a squad of small agents into your Second Brain, rolled up onto the right project page. Runs with your computer off.",
    code: "https://github.com/lennymadethat/ingester", setup: "https://github.com/lennymadethat/ingester/blob/main/KIT.md" },
  { name: "Harvester", line: "Paste a link. Get the lessons.", img: "/img/downloads/harvester.png",
    desc: "A YouTube video, an article, a post. One model watches the whole thing; another reads it through a lens you define, with your own rulebook loaded. A page lands in your library and the to-dos land on your project.",
    code: "https://github.com/lennymadethat/harvester", setup: "https://github.com/lennymadethat/harvester/blob/main/KIT.md" },
  { name: "Mothership", line: "Your machines, in your pocket.", img: null,
    desc: "Run a coding agent as chat, open a real terminal, watch live stats and control your always-on computers from your phone, through one relay. No open ports, no VPN.",
    code: "https://github.com/lennymadethat/mothership", setup: "https://github.com/lennymadethat/mothership/blob/main/KIT.md" },
  { name: "Skills", line: "Six ways of working, installable.", img: null,
    desc: "A loop that finishes a build without you. A review that catches systems doing the wrong thing without a single error. A redesign method that beats months of patching. And three ways to make a page look expensive on purpose.",
    code: "https://github.com/lennymadethat/skills", setup: "https://github.com/lennymadethat/skills/blob/main/KIT.md" },
  { name: "Agent Sell Stuff", line: "Snap a pic. He sells it.", img: null,
    desc: "Send a photo. He writes the listing and prices it. You tap once and it posts. Same tap to drop the price or take it down.",
    code: "https://github.com/lennymadethat/sellstuff", setup: "https://github.com/lennymadethat/sellstuff/blob/main/KIT.md" },
];

// ---------- 5. CONTACT / FOLLOW ----------
export const contact = {
  email: "hello@lennymadethat.com",
  follow: [{ label: "X · @LennyMadeThat", href: "https://x.com/LennyMadeThat" }], // more handles: P4
};
