# CLAUDE.md — lennymadethat-portfolio

Repo-specific instructions for Claude Code. Extends the global rules in
`~/.claude/CLAUDE.md` (dev → main, two surfaces only). This file documents the
deploy quirks and the **sanitization gate** specific to this repo.

---

## Purpose

This is the **PUBLIC storefront / résumé site** for Lenny, at **lennymadethat.com**.

It is the *opposite* of Lenny OS (`os.lennymadethat.com`), which is the private
cockpit. This repo holds a single static marketing/portfolio site:

- Public-facing positioning: "operator who builds" — head of manufacturing who
  ships AI systems.
- Three audiences: manufacturing/ops leadership hirers, AI/agent hirers, and
  buyers of downloadable tools.
- **Static only for now.** Plain HTML/CSS/JS. No backend, no database, no API
  keys, no data fetching.

---

## 🔒 STANDING RULE — Sanitization gate (this is a PUBLIC repo)

Everything committed here is (or will be) world-readable. **Clean from commit #1.**

NEVER commit:
- API keys, tokens, secrets, `.env` contents, `.dev.vars`
- Supabase URLs / anon keys / service-role keys / any DB connection string
- Personal or financial data
- US3 / employer-confidential material
- Internal vault paths (`G:\My Drive\vault\...`), private repo paths, or
  references to the private Lenny OS internals

Before EVERY commit: scan the diff for the above. If unsure, it does not go in.
`.gitignore` carries a sanitization block — extend it before adding anything
sensitive, never after.

---

## Dev → main workflow (per global rule)

- **`dev` branch = the dev site.** Iterate here. Auto-deploys to the dev URL.
- **`main` branch = production.** Live customer-facing site. Auto-deploys to live.
- Work on `dev`, commit + push to `origin/dev`, tell Lenny it's live on dev.
- Merge `dev` → `main` only when Lenny says "ship to main" / "ship it".
- No per-feature preview branches unless Lenny explicitly asks.

---

## URLs

| Surface | Branch | URL | Status |
|---|---|---|---|
| Dev site | `dev` | `https://dev.lennymadethat.com` (custom domain) — until wired: `https://dev.lennymadethat-portfolio.pages.dev` | ⚠️ custom domain pending CF dashboard/DNS |
| Live site | `main` | `https://lennymadethat.com` + `https://www.lennymadethat.com` | ⚠️ apex + www pending CF dashboard/DNS + Squarespace cutover |

The `*.pages.dev` branch URLs work as soon as the Cloudflare Pages project is
connected to GitHub. Custom domains require dashboard + DNS steps (see below).

---

## Deploy specifics — Cloudflare Pages

- **CF Pages project name:** `lennymadethat-portfolio`
- **Production branch:** `main`
- **Build command:** none (static site — serve repo root as-is)
- **Build output directory:** `/` (root)
- Git integration auto-deploys: push to `main` → live; push to any other branch
  (incl. `dev`) → a preview deploy. The `dev` branch preview is the dev site.

### One-time dashboard/DNS setup (NOT automatable via wrangler CLI here)

Connecting a Pages project to a GitHub repo and attaching custom domains must be
done in the Cloudflare dashboard. See `DEPLOY-CHECKLIST.md` in this repo for the
exact step-by-step. Until that's done, push to `dev` does not deploy anywhere —
flag this to Lenny rather than silently pushing.

---

## Site architecture (since the 2026-08-06 "THE LINE" redesign)

Product-led portfolio. **`products.js` is the single source of truth** — it holds
the 9-product catalog (THE LINE) and the Agent Shop kit list. Both surfaces render
from it:

- `index.html` + `script.js` — landing: hero, THE LINE plate grid, story, proof
  (live data-engine readout), THE AGENT SHOP, hire doors.
- `product.html` + `product.js` — one template for all product detail pages.
  Clean URLs via `_redirects` (`/products/* → /product.html 200`); slug resolved
  from the path, `?p=slug` as fallback. Unknown slug redirects home.
- `img/products/` — logos. PlayLetter/RIR/Mothership/Yield Agents/The Desk are
  copied from their product repos; Assembly Floor, Personal Agents, Ingester, and
  Harvester are hand-authored house-style SVGs (dark plate, safety-orange detail).

Design system: ink steel `#14181B` / shop paper `#F2F1EC` / safety orange
`#F04D23`, heritage teal kept as secondary. Type: Anton (display) / Public Sans
(body) / IBM Plex Mono (spec labels). Signature element: the machined nameplate
("plate") card.

To add or edit a product: edit `products.js` only. To change page furniture,
edit the templates.

## Repo facts

- GitHub: `retail-investor-report/lennymadethat-portfolio` (PRIVATE for now;
  flip to PUBLIC at launch — see DEPLOY-CHECKLIST.md).
- Local path: `C:\Users\lenny\Documents\lennymadethat-portfolio`
- Stack: hand-written `index.html` + `styles.css` + `script.js`. No framework,
  no build step.

## Generated pages — run the builder after editing the catalog or résumé

`resume.html`, `products/<slug>.html` (one per catalog entry), `404.html`,
`sitemap.xml`, and `robots.txt` are GENERATED, not hand-edited. They exist so
crawlers and link-preview bots get a real `<title>`, description, and Open
Graph tags without executing JS — `product.js` only sets `document.title`
client-side, which those bots never see.

```
node scripts/build-pages.mjs
```

Run it after any edit to `products.js` or `resume.json`, and commit the output.
Editing a generated file by hand will be overwritten on the next run — change
the source or the generator instead.

Routing note: `_redirects` no longer carries a `/products/* /product 200`
catch-all. Cloudflare Pages resolves `/products/<slug>` to the generated
`products/<slug>.html` directly, so an unknown slug now falls through to
`404.html` instead of silently returning the homepage with a 200.
`/products/sellstuff` is still redirected to its richer dedicated page.
