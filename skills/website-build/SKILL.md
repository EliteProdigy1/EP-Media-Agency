# Premium Service Website Build

**id:** `website-build` · **category:** Website Production · **status:** Ready · **v1.1.0**

## Purpose
Generate a responsive, EPSG-styled local-service website from a verified client
config + assets, ready for GitHub + Netlify. One command turns
`config/<slug>.json` + `assets/<slug>/` into `dist/<slug>/`.

## When to use
- A new local-service client (contractor, landscaper, pressure washing, gym,
  barber, home services) needs a premium site fast.
- You have **verified** business facts and at least a logo.

## When NOT to use
- Facts are unverified or invented — this skill will not fabricate ratings,
  services, licenses, or reviews.
- The client needs a bespoke app, e-commerce, or a non-`premium-service`
  layout that isn't a factory template yet.
- No brand assets at all and the client won't accept branded placeholders.

## Required inputs
- `config/<slug>.json` (business facts, services, brand colors, purchase config)
- `assets/<slug>/` with a logo (filename contains "logo"); hero + gallery
  optional (branded fallbacks generated if missing).

## Workflow
1. `npm run ep:validate -- <slug>` — schema + business-rule check.
2. `npm run ep:build -- <slug>` — validate → media (WebP/srcset) → render →
   preflight → BUILD-REPORT.md.
3. Read `dist/<slug>/BUILD-REPORT.md`: readiness = **READY FOR CLIENT REVIEW /
   READY FOR PUBLIC LAUNCH / NOT READY**; resolve blockers.
4. Hand off to **Responsive & Accessibility QA** (`responsive-qa`).

## Tools / connectors
EP Website Factory (required) · GitHub (CONNECTED) · Netlify (MANUAL — Drop or
GitHub auto-deploy) · Sharp (AVAILABLE, enables WebP) · Lighthouse (AVAILABLE).

## Outputs
Production site, JSON-LD LocalBusiness, contact form, robots.txt, sitemap.xml,
404, per-client netlify.toml, BUILD-REPORT.md.

## Approvals
Client-review approval before showing the client; **approve-for-launch**
required before any public deployment.

## Failure handling
- Validation errors → build aborts; fix the config.
- Missing `purchaseUrl` → purchase CTA hidden (launch blocker, not a dead
  button); site stays REVIEW-ready.
- No `sharp` → images copied through (no WebP); reported, not fatal.
- Oversized hero → flagged in the report.

## Examples
- **H&M Services** (Jul 2026): 15 services → 5 grouped categories, branded
  hero, deposit-only pricing, Lighthouse 82/100/96/100, READY FOR CLIENT REVIEW.
