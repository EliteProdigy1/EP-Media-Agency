# CLAUDE.md — EP-Media-Agency / EP Website Factory

This repository is the **home of the EP Website Factory** — the system that
turns `config/<slug>.json` + `assets/<slug>/` into a premium, EPSG-styled
static client website in `dist/<slug>/`, ready for GitHub + Netlify.

## Design authority

**Elite Prodigy Sports Group (`Elite-Prodigy-sports-group`) is the upstream
design authority.** Its cinematic dark/gold system — tokens, `ep-core.js`,
GSAP patterns, forms — is copied verbatim into `factory/core/` and documented
in `factory/core/SOURCE-MAP.md`. Do **not** fork or diverge the tokens. If
EPSG's core evolves, re-copy and update the source map. Azalea is **not** a
visual foundation.

## Golden rules

- **Never invent business facts.** No ratings, reviews, licenses, guarantees,
  staff names, addresses, service areas, or statistics that aren't in the
  client's config. Missing required data fails validation; missing optional
  data hides its section cleanly.
- **Never ship a dead/fake payment button.** If `purchase.purchaseUrl` is
  missing, the active CTA is hidden and it becomes a launch blocker.
- **Every client gets a unique Netlify form name** (`<slug>-contact` by
  default). Preflight blocks duplicates.
- **Never claim Lighthouse passed unless it actually ran.** Preflight is
  structural only; Lighthouse is invoked separately (see README).
- Additive only. Do not modify live EPSG pages or existing client sites.

## Structure

```
factory/
  core/         canonical EPSG assets (copied) + component/brand CSS + SOURCE-MAP.md
  templates/    premium-service.html (token shell)
  components/   purchase.html, contact.html, a11y.css
  schemas/      client.schema.json
  scripts/      lib · validate · media · build · preflight · preview
config/         <slug>.json client configs (+ client.example.json)
assets/         <slug>/ client media
dist/           generated sites (git-ignored build output)
```

## Commands

```
npm run ep:new                   # interactive client wizard (facts → services → media → config → build)
npm run ep:new       -- <slug> --quick   # blank scaffold from client.example.json
npm run ep:validate  -- <slug>   # schema + business-rule check
npm run ep:media     -- <slug>   # optimize/organize media → manifest
npm run ep:import    -- <slug> <dir>   # import + auto-rename client photos into assets/<slug>/
npm run ep:build     -- <slug>   # full generate (validate→media→render→preflight→report)
npm run ep:preflight -- <slug>   # structural QA on dist/<slug>/index.html
npm run ep:preview   -- <slug>   # serve dist/<slug> at localhost:8080
npm run ep:projects              # write factory/reports/projects.json (Command Center data contract)
npm run ep:dashboard             # regenerate registry + serve the managed-projects dashboard
```

## Command Center integration

`ep:projects` scans every `config/*.json` + build output and emits
`factory/reports/projects.json` — the honest data contract the Elite Prodigy
Command Center consumes so each generated site appears as a managed project
(status, deployment, analytics, maintenance). `factory/dashboard/` is a
self-contained cinematic dashboard that renders it (Horizon-X-inspired layout,
EP tokens). Live analytics/deploy state are never faked — they read
`connected:false` / `environment:preview` until real integrations exist.

`ep:build` exits non-zero when there are launch blockers. Read
`dist/<slug>/BUILD-REPORT.md` after every build — it lists facts used, hidden
sections, media decisions, alt text needing review, and readiness (READY /
NOT READY).

## Scope guardrails (Phase 1A)

Do NOT, in this phase: retrofit existing client repos, connect the Command
Center, connect Notion/Firecrawl, integrate Stripe, auto-deploy, or build
every industry template. One template (`premium-service`) and one proof
client (`sample-home-services`, fictional) only.
