# Factory Core — Source Map

Canonical design assets reused by the EP Website Factory. **Elite Prodigy
Sports Group (EPSG) is the upstream design authority.** These files are
copied in (not forked-and-diverged) so the factory produces sites in the
same premium cinematic language as EPSG.

**Upstream repository:** `EliteProdigy1/Elite-Prodigy-sports-group`
**Inspected commit:** `31e59365ca429a26e1755bf88f5a3bd859fc8e43` (2026-07-05)
**Copied on:** 2026-07-18

Do **not** edit the upstream EPSG files. If EPSG's core evolves, re-copy the
files below and note the new commit here. The factory never maintains a
second, conflicting token system — `ep-tokens.css` is authoritative.

| Factory path | Upstream source path | Reason reused | Modified? |
|---|---|---|---|
| `factory/core/ep-tokens.css` | `css/ep-tokens.css` | Canonical design tokens — colors, type scale, motion, z-index, shadows, glass. Single source of truth. | No — verbatim |
| `factory/core/ep-core.js` | `js/ep-core.js` | Shared runtime: nav scroll, accessible mobile menu (ARIA + Escape + outside-click), progress bar, session popup, reduced-motion / touch / viewport utilities. | No — verbatim |
| `factory/core/gsap-animations.js` | `js/gsap-animations.js` | GSAP scroll library: blur-in hero, Pattern A reveals, counters, staggered grids, mask-wipe, card tilt — each with a built-in mobile fallback branch. | No — verbatim |
| `factory/core/ep-forms.css` | `css/forms.css` | Dark-luxury shared form styling used by EPSG's on-site forms. | No — verbatim |

## Factory-authored (built ON the tokens above, NOT copied from EPSG)

These are new files that compose the EPSG design language into reusable,
config-driven blocks. They add no new color/type/motion primitives — every
value resolves to a token from `ep-tokens.css`.

| Factory path | Purpose |
|---|---|
| `factory/core/ep-components.css` | Nav, hero, service cards, gallery, proof, purchase, contact, footer, mobile menu — composed from EPSG tokens + the button/type patterns in EPSG's `.claude/skills/epsg-design/SKILL.md`. |
| `factory/components/a11y.css` | Accessibility baseline (skip link, sr-only, visible focus, touch targets, reduced motion). |

## Referenced but NOT copied

| Upstream asset | Why not copied |
|---|---|
| `css/styles.css` (4,727 ln) | Page-specific to EPSG (`#hero`, `#our-story`). The factory composes its own component CSS from tokens instead of forking a page stylesheet. |
| `js/scroll-scrub.js`, `js/three-bg.js`, `js/cursor.js` | Heavy cinematic extras (video-frame scrubbing, Three.js particles, custom cursor). Out of scope for Phase 1A; can be added as opt-in template features later. |
| `.claude/skills/epsg-design/SKILL.md` | Persistent design skill — referenced as the design authority for component styling and copy tone; lives in EPSG, not duplicated here. |
| `tools/lighthouse-audit/` | Preflight Lighthouse runner. The factory documents how to invoke it against a built preview rather than duplicating it. |
