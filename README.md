# EP Website Factory

Turn a small JSON file and a folder of photos into a premium, cinematic client
website in the Elite Prodigy Sports Group design language — validated,
accessibility-checked, and ready for GitHub + Netlify.

```
config/<slug>.json  +  assets/<slug>/  +  one command  →  dist/<slug>/
```

**Design authority:** Elite Prodigy Sports Group. Canonical tokens, JS, and
GSAP patterns are copied into `factory/core/` (see
`factory/core/SOURCE-MAP.md`). This factory never invents business facts and
never ships a dead payment button.

---

## Workflow — 6 steps

1. **Create the client.** Run `npm run ep:new` for the **interactive wizard** —
   it walks a non-technical user through business facts, services (auto-grouped
   into categories), optional photo import, and writes `config/<slug>.json` for
   you (then offers to build). Prefer a blank file? `npm run ep:new -- <slug>
   --quick`. Verified facts only — leave fields blank rather than guessing.
2. **Add the media.** Put the logo and photos in `assets/<slug>/`. Name the
   hero `hero.jpg`/`hero.png` (or set `media.heroImage`); name the logo with
   "logo" in it.
3. **Validate.** `npm run ep:validate -- <slug>` — fix any errors it reports.
4. **Build.** `npm run ep:build -- <slug>` — validates, optimizes media,
   renders the site, runs preflight, and writes `dist/<slug>/BUILD-REPORT.md`.
5. **Review.** `npm run ep:preview -- <slug>` then open
   `http://localhost:8080`. Read `BUILD-REPORT.md` — resolve every launch
   blocker until it says **READY**. Optionally run Lighthouse (below).
6. **Ship.** Push `dist/<slug>/` to the client's repo and connect Netlify. The
   generated `netlify.toml`, `robots.txt`, `sitemap.xml`, and `404.html` are
   included.

## Commands

| Command | Does |
|---|---|
| `npm run ep:new` | Interactive client wizard (facts → services → media → config → build) |
| `npm run ep:new -- <slug> --quick` | Blank scaffold from the example |
| `npm run ep:import -- <slug> <dir>` | Import + auto-rename a folder of client photos |
| `npm run ep:validate -- <slug>` | Schema + business-rule check |
| `npm run ep:media -- <slug>` | Optimize/organize media, write manifest |
| `npm run ep:build -- <slug>` | Full generate (the main command) |
| `npm run ep:preflight -- <slug>` | Structural QA on the built HTML |
| `npm run ep:preview -- <slug>` | Local static preview server |
| `npm run ep:projects` | Write the Command Center projects registry |
| `npm run ep:dashboard` | Serve the managed-projects dashboard |

## Command Center dashboard

`npm run ep:dashboard` regenerates `factory/reports/projects.json` (the data
contract) and serves `factory/dashboard/` — a cinematic managed-projects view
showing each site's status, Lighthouse, deployment, analytics, and maintenance.
It's self-contained and portable, ready to embed in / link from the Elite
Prodigy Command Center. Nothing is faked: analytics and live-deploy state read
as "not connected" / "preview" until real integrations are wired in.

## Media optimization (optional)

Images are copied through by default. To enable automatic WebP optimization,
install the optional dependency once:

```
npm install sharp
```

The factory detects it and optimizes on the next `ep:build`. Without it, the
build still works and the report notes that originals were copied.

## Lighthouse (run it, don't assume it)

Preflight is structural only. For real performance/accessibility scores, run
the EPSG Lighthouse tool against a preview or the deployed URL:

```
cd ../Elite-Prodigy-sports-group/tools/lighthouse-audit
npm install
node run-audit.js --site <key>
```

Never report Lighthouse as passing unless it actually ran.

## Proof build

A fictional test client ships with the factory:

```
npm run ep:build -- sample-home-services
npm run ep:preview -- sample-home-services
```

`sample-home-services` is **demo data** — not a real business. Do not deploy it.

## Guarantees

- One `<h1>`, semantic landmarks, skip link, visible focus, labeled forms,
  reduced-motion support, alt on every image.
- JSON-LD `LocalBusiness` built from verified config only.
- Unique Netlify form name per client, honeypot included.
- Purchase CTA hidden (not faked) when no `purchaseUrl` — flagged as a launch
  blocker in the report.

---

*EP Media digital agency — internal. Contact: eliteprodigyway@gmail.com*
