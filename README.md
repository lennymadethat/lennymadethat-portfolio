# lennymadethat.com

Public portfolio / résumé storefront for Lenny — the operator who builds.

Static site: plain HTML / CSS / JS, no build step, no backend.

- **Live:** https://lennymadethat.com (production = `main`)
- **Dev:** https://dev.lennymadethat.com (dev = `dev`)

## Workflow

`dev` → iterate. `main` → production. Push to `dev` auto-deploys the dev site;
merge `dev` → `main` to ship live. See `CLAUDE.md` for the full workflow and the
**sanitization gate** (this repo is public — never commit secrets).

## Local preview

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Deploy

Cloudflare Pages, git-integrated. See `DEPLOY-CHECKLIST.md` for the one-time
dashboard/DNS setup.
