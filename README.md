# EP Media Agency

Internal operations hub for Elite Prodigy Media — the agency behind EPSG and all client websites — **and** the home of the EP Website Factory + skill packages.

Contact: eliteprodigyway@gmail.com · 251.223.0812

## What lives here

| Folder / File | Purpose |
|---|---|
| `CLIENT-REGISTRY.md` | Master client roster, site status, revenue tracker |
| `REPOSITORY-AUDIT.md` | Repo-by-repo audit of the EliteProdigy1 GitHub org |
| `clients/` | Per-client working folders (profiles, content, assets-needed, deployment notes) |
| `templates/client-template/` | Blank client folder template — copy for each new client |
| `ep-media-os/` | EP Media OS: reusable CSS/JS core, site templates, SOPs, AI workflows, design system docs |
| `factory/` | **EP Website Factory** — config + assets → premium static client site (`dist/<slug>/`) |
| `config/`, `dist/` | Factory client configs and generated site output (e.g. `dist/hm-services/`) |
| `skills/` | Source-of-truth **skill packages** + generated `REGISTRY.json` the Command Center consumes |

## What does NOT live here

- **Public media pages** (`/ep-media`, `/cinematic-listings`, `/submit-listing`) stay on the
  EPSG site repo — they are live URLs with registered Netlify Forms.
- **Client websites** — one repo per client (Clay-Retreat, Azalea-Turf-and-Lawn,
  Warren-Landscape, Metal-and-Mud, 22-Builds, Head-Locd, Gulf-Coast-Karate).

Moved here from the Elite-Prodigy-sports-group repo on 2026-07-05 to keep agency
operations separate from the public sports site.

---

## EP Website Factory

Turn a small JSON file and a folder of photos into a premium, cinematic client
website in the Elite Prodigy Sports Group design language — validated,
accessibility-checked, and ready for GitHub + Netlify.

```
config/<slug>.json  +  assets/<slug>/  +  one command  →  dist/<slug>/
```

**Design authority:** Elite Prodigy Sports Group. Canonical tokens, JS, and
GSAP patterns are copied into `factory/core/` (see `factory/core/SOURCE-MAP.md`).
This factory never invents business facts and never ships a dead payment button.

### Commands

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

### Guarantees

- One `<h1>`, semantic landmarks, skip link, visible focus, labeled forms,
  reduced-motion support, alt on every image.
- JSON-LD `LocalBusiness` built from verified config only.
- Unique Netlify form name per client, honeypot included.
- Purchase CTA hidden (not faked) when no `purchaseUrl` — flagged as a launch
  blocker in the report.

> **Note:** `dist/hm-services/` is a bespoke, mobile-first one-page production
> site maintained directly (not regenerated from the generic template). See its
> `BUILD-REPORT.md`.

## Skill packages

`skills/<slug>/` holds the source-of-truth skill definitions (SKILL.md,
manifest.json, portable-prompt.md, CHANGELOG.md). `skills/REGISTRY.json` is
**generated** from the manifests (`npm run ep:skills:index`) and validated
(`npm run ep:skills:validate`); `npm run ep:skills:audit` runs a non-destructive
drift audit. The Command Center consumes the generated registry and layers
operational metadata on top — it never hand-maintains skill definitions.

---

*EP Media digital agency — internal. Contact: eliteprodigyway@gmail.com*
