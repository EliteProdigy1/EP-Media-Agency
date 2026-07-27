# EP Luxe — Luxury Portfolio Framework (v2)

The reusable EP Media system for **high-end portfolio clients**: architects,
landscape architects, custom home builders, pool & outdoor-living companies,
luxury real estate. Quiet luxury — Architectural Digest, not flashy.

GDSI (Garden Design Solutions) is the **reference build** this framework was
extracted from. Every future luxury client swaps *branding, imagery, copy,
colours, content* — never the functionality.

## How a new client is spun up

```
1. cp -r framework/luxe   dist/<client>/luxe          # the shared engines
2. cp framework/luxe/css/theme.template.css  dist/<client>/theme.css   # fill palette + fonts
3. author dist/<client>/index.html using the .lx-* components
4. drop client photos in dist/<client>/assets/
5. deploy dist/<client>/ to its own repo + Netlify site
```

Load order in `<head>`: **`luxe/css/luxe.css` → `theme.css`**, then before `</body>`: optional GSAP CDN → **`luxe/js/luxe.js`**.

## Modules

| Module | File | Shared / Client | Status |
|---|---|---|---|
| Utility library | `js/luxe.js › U` | shared | ✅ |
| Navigation engine | `js/luxe.js › Nav` | shared | ✅ |
| Animation engine (reveal) | `js/luxe.js › Anim` | shared | ✅ GSAP ScrollTrigger → IO fallback |
| Parallax engine | `js/luxe.js › Parallax` | shared | ✅ |
| Project Story engine | `js/luxe.js › Story` | shared (data is client) | ✅ |
| Hero / Section / Service-card / Process / Ethos / Contact / Footer | `css/luxe.css` (`.lx-*`) | shared | ✅ |
| Theme (palette, fonts) | `css/theme.template.css` | **client** | ✅ contract |
| GSAP ScrollTrigger pinning (advanced) | — | shared | 🔜 roadmap |
| Scroll-Scrub engine (video frames) | port of EPSG `scroll-scrub.js` | shared | 🔜 roadmap (opt-in; GDSI = photo-led, no video) |
| PDF Portfolio generator | — | shared (branded per client) | 🔜 roadmap |
| Gallery engine (lightbox) | — | shared | 🔜 roadmap |

## Shared vs client-specific

- **Shared (this framework):** all `.lx-*` component CSS, all JS engines, layout,
  motion, responsive behaviour, a11y, the theme *contract*.
- **Client-specific (per site):** `theme.css` values (palette + fonts), the HTML
  content, the `EP_LUXE_STORIES` data array, photography, copy, contact details,
  Netlify form name.

## Provenance

Extracted from the **Elite Prodigy Sports Group** cinematic system
(`scroll-scrub.js`, `gsap-animations.js`, `ep-core.js`, `cinematic-listings`)
and evolved into a client-agnostic, theme-driven framework. Honour the EP golden
rule: **never invent business facts** (ratings, project counts, "millions
invested") — luxury clients are burned by fake numbers. Use only verified copy.

## Framework-improvement log (fill as you build)

- v2.0.0 — Extracted Nav, Animation, Parallax, Story engines + full component
  CSS from the GDSI reference build. Theme-driven; GSAP-or-fallback.
- _Next:_ PDF Portfolio generator, GSAP pinning module, Gallery lightbox,
  optional Scroll-Scrub for clients who shoot video.
