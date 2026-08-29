/* lennymadethat.com — static page generator.
   Emits crawlable, JS-independent pages from the two sources of truth:
     resume.json   -> /resume.html          (the artifact hiring managers open)
     products.js   -> /products/<slug>.html (real <title> + Open Graph per product)
                   -> /404.html, /sitemap.xml, /robots.txt

   Product bodies are still hydrated by product.js from the same catalog; this
   generator guarantees correct head metadata and readable no-JS content.

   Run after editing resume.json or products.js:  node scripts/build-pages.mjs
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://lennymadethat.com";
/* Six catalog marks are SVG-only. Link-preview crawlers (X, Facebook,
   LinkedIn, Slack) will not render SVG, and borrowing another product's PNG
   would preview the wrong brand — so those pages ship no og:image and degrade
   to a text summary card. TODO: generate a real 1200x630 card per product. */
const r = (p) => readFileSync(join(ROOT, p), "utf8");
const w = (p, s) => {
  mkdirSync(dirname(join(ROOT, p)), { recursive: true });
  writeFileSync(join(ROOT, p), s, "utf8");
};

const AMP = String.fromCharCode(38);
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const DQ = String.fromCharCode(34);
const SQ = String.fromCharCode(39);
const ENT = {};
ENT[AMP] = "&amp;";
ENT[LT] = "&lt;";
ENT[GT] = "&gt;";
ENT[DQ] = "&quot;";
ENT[SQ] = "&#39;";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ENT[c]);
/* meta content: strip tags, collapse whitespace, clamp */
const meta = (s, n = 300) =>
  esc(String(s == null ? "" : s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, n));

/* ── load the catalog without a browser ─────────────────────────
   products.js is a classic browser script whose only statement is
   `window.PRODUCTS = [...]`. Shimming `window` and importing it as a module
   evaluates it exactly as the browser would — no eval, no new Function. */
globalThis.window = globalThis.window || {};
await import(pathToFileURL(join(ROOT, "products.js")).href);
const PRODUCTS = globalThis.window.PRODUCTS;
if (!Array.isArray(PRODUCTS) || !PRODUCTS.length) {
  throw new Error("products.js did not populate window.PRODUCTS");
}
const RESUME = JSON.parse(r("resume.json"));

const FAVICON = (r("product.html").match(/<link rel="icon"[^>]*>/) || [""])[0];
const FONTS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">',
].join("\n");
const THEME_BOOT =
  '<script>try{var _t=localStorage.getItem("lmt-theme");if(_t&&_t!=="shop")document.documentElement.setAttribute("data-theme",_t);}catch(e){}</script>';

function head(o) {
  const image = o.image || "";
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "  <title>" + esc(o.title) + "</title>",
    '  <meta name="description" content="' + meta(o.desc) + '" />',
    '  <link rel="canonical" href="' + esc(o.url) + '" />',
    '  <meta property="og:type" content="website" />',
    '  <meta property="og:site_name" content="Lenny Made That" />',
    '  <meta property="og:title" content="' + meta(o.title, 90) + '" />',
    '  <meta property="og:description" content="' + meta(o.desc) + '" />',
    '  <meta property="og:url" content="' + esc(o.url) + '" />',
    image ? '  <meta property="og:image" content="' + esc(image) + '" />' : "",
    '  <meta name="twitter:card" content="' + (image ? "summary_large_image" : "summary") + '" />',
    '  <meta name="twitter:title" content="' + meta(o.title, 90) + '" />',
    '  <meta name="twitter:description" content="' + meta(o.desc) + '" />',
    image ? '  <meta name="twitter:image" content="' + esc(image) + '" />' : "",
    '  <meta name="theme-color" content="#14181B" />',
    "  " + FAVICON,
    "  " + THEME_BOOT,
    "",
    "  " + FONTS,
    '  <link rel="stylesheet" href="/styles.css" />',
    o.extra || "",
    "</head>",
  ].filter((l) => l !== "").join("\n");
}

const NAV = [
  '  <a class="skip-link" href="#main">Skip to content</a>',
  '  <header class="site-header">',
  '    <nav class="nav" aria-label="Primary">',
  '      <a class="nav__brand" href="/" aria-label="Lenny — home">lenny<span class="nav__brand-accent">madethat</span></a>',
  '      <a class="btn btn--ghost" href="/#line">The line</a>',
  "    </nav>",
  "  </header>",
].join("\n");

const FOOT = [
  '  <footer class="site-footer">',
  '    <div class="container site-footer__inner">',
  '      <p class="spec">LENNYMADETHAT · SAN DIEGO, CA</p>',
  '      <p class="spec"><a href="mailto:hello@lennymadethat.com">HELLO@LENNYMADETHAT.COM</a> · <a href="https://github.com/lennymadethat" target="_blank" rel="noopener">GITHUB</a></p>',
  "    </div>",
  "  </footer>",
].join("\n");

/* ── 1. résumé ────────────────────────────────────────────────── */
function buildResume() {
  const b = RESUME.basics || {};
  const loc = b.location ? [b.location.city, b.location.region].filter(Boolean).join(", ") : "";
  const li = (x) => "<li>" + esc(x) + "</li>";

  const skills = (RESUME.skills || [])
    .map((s) =>
      [
        '        <div class="cv-skill">',
        '          <h3 class="cv-skill__name">' + esc(s.name) + "</h3>",
        '          <p class="cv-skill__kw">' + (s.keywords || []).map(esc).join(" · ") + "</p>",
        "        </div>",
      ].join("\n"))
    .join("\n");

  const work = (RESUME.work || [])
    .map((j) =>
      [
        '        <article class="cv-role">',
        '          <h3 class="cv-role__title">' + esc(j.position || "") + "</h3>",
        '          <p class="spec cv-role__meta">' + esc(j.name || "") +
          (j.startDate ? " · " + esc(j.startDate) + "—" + esc(j.endDate || "present") : "") + "</p>",
        j.summary ? '          <p class="cv-role__summary">' + esc(j.summary) + "</p>" : "",
        (j.highlights || []).length ? '          <ul class="cv-list">' + j.highlights.map(li).join("") + "</ul>" : "",
        "        </article>",
      ].filter((x) => x !== "").join("\n"))
    .join("\n");

  const projects = (RESUME.projects || [])
    .map((p) =>
      [
        '        <article class="cv-proj">',
        '          <h3 class="cv-proj__name">' + esc(p.name) + "</h3>",
        '          <p class="cv-proj__desc">' + esc(p.description) + "</p>",
        (p.keywords || []).length
          ? '          <p class="spec cv-proj__kw">' + p.keywords.map(esc).join(" · ") + "</p>"
          : "",
        "        </article>",
      ].filter((x) => x !== "").join("\n"))
    .join("\n");

  const pubs = (RESUME.publications || [])
    .map((p) => '<li><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.name) + "</a></li>")
    .join("");

  const html = [
    head({
      title: (b.name || "Résumé") + " — Résumé",
      desc: b.summary || "",
      url: SITE + "/resume",
      image: SITE + "/img/portrait.jpg",
    }),
    '<body class="cv-body">',
    NAV,
    '  <main id="main">',
    '    <section class="section cv">',
    '      <div class="container container--narrow">',
    "",
    '        <header class="cv-head">',
    '          <p class="section__eyebrow spec">RÉSUMÉ</p>',
    '          <h1 class="cv-name">' + esc(b.name || "") + "</h1>",
    '          <p class="cv-label">' + esc(b.label || "") + "</p>",
    '          <p class="spec cv-contact">' + (loc ? esc(loc) + " · " : "") +
      '<a href="mailto:' + esc(b.email || "") + '">' + esc(b.email || "") + "</a> · " +
      '<a href="https://lennymadethat.com">lennymadethat.com</a></p>',
    '          <div class="cv-actions">',
    '            <a class="btn btn--primary" href="mailto:' + esc(b.email || "") +
      '?subject=Role%20for%20Lenny">Email me</a>',
    '            <a class="btn btn--ghost" href="/resume.json">Résumé as JSON</a>',
    '            <button class="btn btn--ghost" type="button" onclick="window.print()">Print / PDF</button>',
    "          </div>",
    "        </header>",
    "",
    b.summary ? '        <p class="cv-summary">' + esc(b.summary) + "</p>" : "",
    "",
    '        <h2 class="cv-h2">Experience</h2>',
    work,
    "",
    '        <h2 class="cv-h2">Selected builds</h2>',
    '        <p class="cv-note">Every one of these is live and walkable from <a href="/#line">the line</a> — not a description of the work, the work itself.</p>',
    '        <div class="cv-projects">',
    projects,
    "        </div>",
    "",
    '        <h2 class="cv-h2">Skills</h2>',
    '        <div class="cv-skills">',
    skills,
    "        </div>",
    "",
    pubs ? '        <h2 class="cv-h2">Open source</h2>' : "",
    pubs ? '        <ul class="cv-list">' + pubs + "</ul>" : "",
    "",
    "      </div>",
    "    </section>",
    "  </main>",
    FOOT,
    "</body>",
    "</html>",
    "",
  ].filter((l) => l !== "").join("\n");

  w("resume.html", html);
  return 1;
}

/* ── 2. product pages ─────────────────────────────────────────── */
function buildProducts() {
  const shell = r("product.html");
  const body = shell.slice(shell.indexOf("<body>"));
  let n = 0;
  for (const p of PRODUCTS) {
    /* Link-preview crawlers (X, Facebook, LinkedIn, Slack) do not render SVG.
       Six catalog marks are SVG-only, so fall back to a raster card image
       rather than shipping a preview with a broken picture. */
    let img = p.art || p.logo || "";
    if (img.toLowerCase().endsWith(".svg")) img = "";
    const abs = img ? (img.indexOf("http") === 0 ? img : SITE + (img.charAt(0) === "/" ? img : "/" + img)) : "";
    const fallback = [
      "  <noscript>",
      '    <div class="container">',
      "      <h1>" + esc(p.name) + "</h1>",
      "      <p>" + esc(p.hook) + "</p>",
      "      <p>" + esc(p.what) + "</p>",
      (p.does || []).length ? "      <ul>" + p.does.map((d) => "<li>" + esc(d) + "</li>").join("") + "</ul>" : "",
      "    </div>",
      "  </noscript>",
    ].filter((x) => x !== "").join("\n");

    const html =
      head({
        title: p.name + " — " + String(p.kind).toLowerCase() + " by Lenny",
        desc: p.hook + " " + p.what,
        url: SITE + "/products/" + p.slug,
        image: abs,
      }) +
      "\n" +
      body.replace("<body>", "<body>\n" + fallback);

    w("products/" + p.slug + ".html", html);
    n++;
  }
  return n;
}

/* ── 3. 404 ───────────────────────────────────────────────────── */
function build404() {
  const html = [
    head({
      title: "Not found — lennymadethat",
      desc: "That page does not exist. Walk the line instead.",
      url: SITE + "/404",
      extra: '  <meta name="robots" content="noindex" />',
    }),
    '<body class="nf-body">',
    NAV,
    '  <main id="main">',
    '    <section class="section section--dark">',
    '      <div class="container container--narrow">',
    '        <p class="section__eyebrow spec">ERROR 404</p>',
    '        <h1 class="section__title">That part isn’t on the line.</h1>',
    '        <p class="section__lead">The page you asked for doesn’t exist — or it moved when the shop got reorganised. Everything that is built is one click away.</p>',
    '        <div class="cv-actions">',
    '          <a class="btn btn--primary" href="/#line">Walk the line</a>',
    '          <a class="btn btn--ghost" href="/resume">Résumé</a>',
    '          <a class="btn btn--ghost" href="mailto:hello@lennymadethat.com">Email me</a>',
    "        </div>",
    "      </div>",
    "    </section>",
    "  </main>",
    FOOT,
    "</body>",
    "</html>",
    "",
  ].join("\n");
  w("404.html", html);
  return 1;
}

/* ── 4. sitemap + robots ──────────────────────────────────────── */
function buildSitemap() {
  const urls = [SITE + "/", SITE + "/resume"].concat(PRODUCTS.map((p) => SITE + "/products/" + p.slug));
  w("sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => "  <url><loc>" + u + "</loc></url>").join("\n") +
    "\n</urlset>\n");
  w("robots.txt", "User-agent: *\nAllow: /\n\nSitemap: " + SITE + "/sitemap.xml\n");
  return urls.length;
}

const cv = buildResume();
const pr = buildProducts();
const nf = build404();
const sm = buildSitemap();
console.log("resume.html: " + cv + " | product pages: " + pr + " | 404: " + nf + " | sitemap urls: " + sm);
