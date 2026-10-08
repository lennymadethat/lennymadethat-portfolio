// The download wall: every agent (with a face), tool and app (with a logo) on one screen, each one tap
// from its GitHub. Shared by the homepage #downloads section and /downloads so they never drift.
const GH = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
const SKILLS = '<svg class="dlw-logo" viewBox="0 0 108 108" aria-hidden="true"><rect x="4" y="4" width="100" height="100" rx="22" fill="#141a33" stroke="#56c2ff" stroke-opacity=".5"/><path d="M30 38l14 14-14 14" fill="none" stroke="#56c2ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 70h26" stroke="#eef3fb" stroke-width="7" stroke-linecap="round"/></svg>';

export const WALL = [
  { name: "Agent Sell Stuff", kind: "Agent", tint: "#c27cff", face: "/img/downloads/faces/sellstuff.webp", line: "Snap a photo. He sells it.",
    desc: "Message him a picture on Telegram. He writes the listing, prices it and posts it to Facebook Marketplace when you tap Approve.",
    gh: "https://github.com/lennymadethat/sellstuff", more: { label: "How he works", href: "/agents/sellstuff" } },
  { name: "Harry the Harvester", kind: "Agent", tint: "#3fe6d2", face: "/img/downloads/faces/harvester.webp", line: "Paste a link. Get the lessons.",
    desc: "A YouTube video, an article, a post. He watches the whole thing, reads it through your lens, and files a page with the to-dos in your library.",
    gh: "https://github.com/lennymadethat/harvester", more: { label: "Setup", href: "https://github.com/lennymadethat/harvester/blob/main/KIT.md" } },
  { name: "The Ingester", kind: "Agent", tint: "#ff9d5c", face: "/img/downloads/faces/ingester.webp", line: "Drop a file. Get a memory.",
    desc: "Receipts, scans, voice memos, PDFs. One inbox, read and sorted by a squad of small agents, filed onto the right project page.",
    gh: "https://github.com/lennymadethat/ingester", more: { label: "Setup", href: "https://github.com/lennymadethat/ingester/blob/main/KIT.md" } },
  { name: "Second Brain", kind: "Memory", tint: "#56c2ff", logo: "/img/products/vault.svg", line: "Memory for any AI agent.",
    desc: "A rulebook, a memory server and a hosted library with a search index. Claude, ChatGPT, Gemini, any tool that speaks MCP remembers.",
    gh: "https://github.com/lennymadethat/second-brain", more: { label: "Setup", href: "https://github.com/lennymadethat/second-brain/blob/master/KIT.md" } },
  { name: "Mothership", kind: "Remote control", tint: "#5b9dff", logo: "/img/products/mothership-512.png", line: "Your machines, in your pocket.",
    desc: "Chat with a coding agent, open a terminal and watch your always-on computers from your phone, through one relay. No open ports, no VPN.",
    gh: "https://github.com/lennymadethat/mothership", more: { label: "Setup", href: "https://github.com/lennymadethat/mothership/blob/main/KIT.md" } },
  { name: "Skills", kind: "Claude Code", tint: "#56c2ff", svg: SKILLS, line: "Six ways of working, installable.",
    desc: "A loop that finishes a build on its own, a review that catches systems doing the wrong thing, a redesign method, and three design skills.",
    gh: "https://github.com/lennymadethat/skills", more: { label: "Setup", href: "https://github.com/lennymadethat/skills/blob/main/KIT.md" } },
  { name: "PlayLetter", kind: "Desktop app", tint: "#5fb089", logo: "/img/products/playletter-512.png", line: "Your newsletters, read aloud.",
    desc: "Every issue in your inbox, voiced and karaoke-synced. The Windows installer is on GitHub; phones get it from the stores.",
    gh: "https://github.com/lennymadethat/playletter-releases/releases/latest", ghLabel: "Windows", more: { label: "Site", href: "https://playletter.com" } },
  { name: "Assembly Floor OS", kind: "Coming today", tint: "#ffb547", logo: "/img/products/assembly-floor.svg", line: "Parts, assembly and shipping on one screen.",
    desc: "The shop-floor operating system: parts in, builds tracked, orders out the door. The download lands here today.",
    soon: "Coming today" },
  { name: "Retail Investor Report", kind: "Web app", tint: "#8ac7de", logo: "/img/products/rir-512.png", line: "Income investing, data on screen.",
    desc: "The Income Board, the research desk and CARL, the market-research agent you can ask anything about a fund. Nothing to install.",
    site: { label: "Open", href: "https://retailinvestorreport.com" } },
  { name: "Yield Agents", kind: "Web app", tint: "#7dc8e8", logo: "/img/products/yield-agents-180.png", line: "Agents that manage yield.",
    desc: "Autonomous agents that run yield strategies with real money. Nothing to install, open it in your browser.",
    site: { label: "Open", href: "https://yieldagents.io" } },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (href) => href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";

export function renderWall(el, items = WALL) {
  el.classList.add("dlw");
  el.innerHTML = items.map((x) => {
    const art = x.face ? `<img class="dlw-char" src="${esc(x.face)}" alt="${esc(x.name)}" width="360" height="360" loading="lazy">`
      : x.svg ? x.svg : `<img class="dlw-logo" src="${esc(x.logo)}" alt="${esc(x.name)} logo" loading="lazy">`;
    const main = x.soon ? `<span class="dlw-btn dlw-btn--soon" aria-disabled="true">${esc(x.soon)}</span>`
      : x.gh ? `<a class="dlw-btn dlw-btn--main" href="${esc(x.gh)}"${ext(x.gh)} aria-label="${esc((x.ghLabel || "Download") + " " + x.name)}">${GH}${esc(x.ghLabel || "Download")}</a>`
      : `<a class="dlw-btn dlw-btn--main" href="${esc(x.site.href)}"${ext(x.site.href)} aria-label="${esc("Open " + x.name)}">${esc(x.site.label)} →</a>`;
    const more = x.more ? `<a class="dlw-btn dlw-btn--ghost" href="${esc(x.more.href)}"${ext(x.more.href)}>${esc(x.more.label)}</a>` : "";
    return `<article class="dlw-tile${x.soon ? " dlw-tile--soon" : ""}" style="--t:${x.tint}" title="${esc(x.desc)}">
      <div class="dlw-face">${art}<span class="dlw-kind">${esc(x.kind)}</span></div>
      <div class="dlw-body"><h3>${esc(x.name)}</h3><p class="dlw-line">${esc(x.line)}</p><div class="dlw-acts">${main}${more}</div></div></article>`;
  }).join("");
}
