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

## Repo facts

- GitHub: `retail-investor-report/lennymadethat-portfolio` (PRIVATE for now;
  flip to PUBLIC at launch — see DEPLOY-CHECKLIST.md).
- Local path: `C:\Users\lenny\Documents\lennymadethat-portfolio`
- Stack: hand-written `index.html` + `styles.css` + `script.js`. No framework,
  no build step.
