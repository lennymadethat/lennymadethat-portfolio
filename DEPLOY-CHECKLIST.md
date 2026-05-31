# DEPLOY-CHECKLIST.md — finish-the-wiring steps for Lenny

The repo, branches, and GitHub remote are set up by Claude. The remaining steps
need the **Cloudflare dashboard** and **DNS** — they can't be done from the CLI
in this environment. Do them in order.

Cloudflare account: `ianleonard1988@gmail.com` (Account ID `925da99e77700b4e1ab81b9d5a00567f`).

---

## 1. Create the Cloudflare Pages project (connect to GitHub)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Authorize the GitHub org/account `retail-investor-report` if not already.
3. Select repo **`retail-investor-report/lennymadethat-portfolio`**.
4. Project name: **`lennymadethat-portfolio`** (must match — CLAUDE.md references it).
5. Production branch: **`main`**.
6. Build settings:
   - Framework preset: **None**
   - Build command: **(leave empty)**
   - Build output directory: **`/`**
7. Save and Deploy. First deploy runs from `main`.

> Note: the GitHub repo is **PRIVATE** for now. Cloudflare Pages can still
> connect to a private repo via the GitHub App — that's fine. We flip the repo
> public at launch (step 5 below).

After this, **pushes auto-deploy**:
- push to `main` → production deploy
- push to `dev` (or any non-prod branch) → preview deploy

The `dev` preview will be reachable at a stable per-branch URL:
`https://dev.lennymadethat-portfolio.pages.dev`
(Cloudflare also generates a per-commit `<hash>.lennymadethat-portfolio.pages.dev`.)

---

## 2. Wire the DEV custom domain → dev.lennymadethat.com

Only do this once the Pages project exists and the `dev` branch has deployed.

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter **`dev.lennymadethat.com`**.
3. Cloudflare will offer to add the DNS record automatically **if
   `lennymadethat.com` is on Cloudflare DNS**. ⚠️ See step 4 — the domain may
   still be at Squarespace. If so, you must first move DNS to Cloudflare (step 4)
   or add a CNAME at the current DNS host:
   - `dev` CNAME → `lennymadethat-portfolio.pages.dev`
4. Bind this custom domain to the **`dev`** branch (Pages → custom domain →
   branch = `dev`), so dev.lennymadethat.com always serves the dev preview.

---

## 3. Wire the LIVE custom domains → apex + www

1. Pages project → **Custom domains** → add **`lennymadethat.com`** (apex).
2. Add **`www.lennymadethat.com`**.
3. Both bind to the **production (`main`)** branch by default.
4. DNS records (created automatically if domain is on Cloudflare):
   - apex `lennymadethat.com` → CNAME-flattened to `lennymadethat-portfolio.pages.dev`
   - `www` CNAME → `lennymadethat-portfolio.pages.dev`
5. Decide redirect direction (apex ↔ www). Recommended: redirect `www` → apex
   via a Cloudflare Bulk Redirect or a `_redirects` file in the repo.

---

## 4. Squarespace cutover (the live domain currently points at the old site)

`lennymadethat.com` today serves the old Squarespace page. To cut over:

**Option A — move DNS to Cloudflare (recommended, cleanest):**
1. At your domain registrar, find where `lennymadethat.com` nameservers point
   (likely Squarespace / Google Domains / Squarespace Domains).
2. In Cloudflare dashboard → **Add a site** → `lennymadethat.com` → Free plan.
3. Cloudflare scans existing DNS — review the imported records.
4. Cloudflare gives you two nameservers. At the **registrar**, replace the
   nameservers with Cloudflare's.
5. Wait for activation (minutes–hours). Then steps 2 & 3 above can auto-create
   the Pages DNS records.
6. **Before** flipping, confirm the new site looks right on the `*.pages.dev`
   URL so the apex doesn't briefly serve a half-built site.

**Option B — keep DNS at Squarespace (more manual, partial CF features):**
1. Add CNAME/records at Squarespace pointing the relevant hostnames to
   `lennymadethat-portfolio.pages.dev`. Apex CNAME may not be supported at
   Squarespace — Option A avoids that limitation.

⚠️ **Sequencing:** verify the new site on `*.pages.dev` first, THEN point the
apex. Don't take down the Squarespace page until the Pages deploy is confirmed
good on its own URL.

---

## 5. Flip the repo to PUBLIC (at launch only)

When ready to launch:
1. Re-run the sanitization scan over the full history (not just latest commit):
   `git log -p` for any secret, Supabase key, US3/private path, financial data.
   If anything leaked, scrub history (e.g. `git filter-repo`) BEFORE going public.
2. GitHub → repo **Settings** → **General** → **Danger Zone** →
   **Change visibility** → **Public**.
3. Confirm Cloudflare Pages still deploys (it will — the GitHub App connection
   persists across visibility changes).

---

## Quick reference

| Item | Value |
|---|---|
| GitHub repo | `retail-investor-report/lennymadethat-portfolio` (private → public at launch) |
| CF Pages project | `lennymadethat-portfolio` |
| Production branch | `main` |
| Dev branch | `dev` |
| Dev pages.dev URL | `https://dev.lennymadethat-portfolio.pages.dev` |
| Dev custom domain | `dev.lennymadethat.com` (branch: `dev`) |
| Live domains | `lennymadethat.com` + `www.lennymadethat.com` (branch: `main`) |
| Build command | none (static) |
| Output dir | `/` |
