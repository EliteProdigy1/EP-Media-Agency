# Build Report — H&M Services

> **FICTIONAL/TEST DATA** is used only where a config is explicitly marked as a sample. This report reflects exactly what shipped to `dist/hm-services/`.

**Slug:** `hm-services`
**Template:** `premium-service`
**Status:** 🟡 **READY FOR CLIENT REVIEW** — not yet ready for public launch (see launch items below)

---

## Files generated
- `404.html`
- `assets`
- `core`
- `index.html`
- `media-manifest.json`
- `netlify.toml`
- `robots.txt`
- `sitemap.xml`

## Client facts used (from config only)
- brand colors: --brand-primary:#B88A32, --brand-accent:#D4A94A
- business name, industry, location, phone
- 15 services (grouped by category)
- description
- 4 gallery images
- 4 capability pillars
- 4 why-us points
- purchase pricing from config

## Pending client verification (internal — never shown publicly)
- ⏳ All 15 services were inferred from the H&M flyer icons and marketing graphic — confirm the exact list and wording with Josh Hendrick.
- ⏳ Broader service area beyond Fairhope and Baldwin County — confirm actual coverage before claiming it.
- ⏳ Project gallery uses branded placeholder tiles — replace with real H&M job-site photos when available.
- ⏳ Public email address / Netlify form notification destination — not yet provided.
- ⏳ Purchase deposit link (purchaseUrl) and client intake link (intakeUrl) — not yet provided.

## Sections hidden (missing/optional data)
- none

## Media
**Selected hero:** `assets/hero-1600.webp` — client-specified (media.heroImage)
**Optimization:** responsive WebP variants via sharp (srcset + width/height emitted)

- hero: `hero-hm-services.jpg` → `assets/hero-1600.webp` — 53.0 KB → 15.3 KB (71% smaller) · 3 responsive widths (768/1200/1600)
- logo: `logo-hm-services.jpg` → `assets/logo.jpg` — copied (147.8 KB, preserved as-is)
- gallery: `project-01.jpg` → `assets/gallery-01-800.webp` — 23.8 KB → 8.1 KB (66% smaller) · 3 responsive widths (400/600/800)
- gallery: `project-02.jpg` → `assets/gallery-02-800.webp` — 23.4 KB → 8.1 KB (66% smaller) · 3 responsive widths (400/600/800)
- gallery: `project-03.jpg` → `assets/gallery-03-800.webp` — 23.7 KB → 8.3 KB (65% smaller) · 3 responsive widths (400/600/800)
- gallery: `project-04.jpg` → `assets/gallery-04-800.webp` — 23.6 KB → 8.2 KB (65% smaller) · 3 responsive widths (400/600/800)

### Alt text requiring human review
- ⚠️ assets/gallery-01-800.webp: "H&M Services — Project 01" (derived from filename/context — confirm it describes the image)
- ⚠️ assets/gallery-02-800.webp: "H&M Services — Project 02" (derived from filename/context — confirm it describes the image)
- ⚠️ assets/gallery-03-800.webp: "H&M Services — Project 03" (derived from filename/context — confirm it describes the image)
- ⚠️ assets/gallery-04-800.webp: "H&M Services — Project 04" (derived from filename/context — confirm it describes the image)

## Contact
**Netlify form name:** `hm-services-contact` (must be unique across all EP client sites)
**Notification destination documented:** ⚠️ not confirmed

## Purchase
**Status:** enabled-no-url (public purchase button hidden — pending launch)
- 🟡 No `purchaseUrl` yet — the public purchase button is hidden and the section routes to a real call/contact action (no dead button, no public "coming soon" copy). Add the URL before public launch. _Purchase link available after final review._

## Preflight — Accessibility / SEO / Assets
- ✅ Has <title>
- ✅ Has meta description
- ✅ Has canonical or documented default
- ✅ Open Graph og:title
- ✅ Open Graph og:description
- ✅ Open Graph og:image
- ✅ Has JSON-LD LocalBusiness
- ✅ Exactly one <h1> — found 1
- ✅ Has <main> landmark
- ✅ Has skip-to-content link
- ✅ Has <header> landmark
- ✅ Has <footer> landmark
- ✅ No unresolved template tokens
- ✅ All images have alt
- ✅ No href="#" dead links
- ✅ No empty links
- ✅ No duplicate IDs
- ✅ All form controls labeled
- ✅ All buttons have accessible names
- ✅ Netlify form present
- ✅ Form honeypot present
- ✅ Unique Netlify form name
- 🟡 Purchase URL present (purchase enabled) _[launch-only]_ — purchase.enabled but no purchaseUrl — active purchase button hidden
- 🟡 Intake URL present (purchase enabled) _[launch-only]_ — no intakeUrl — post-purchase intake CTA hidden
- 🟡 Contact notification destination documented _[launch-only]_ — confirm the Netlify form email notification before public launch
- ✅ Local asset references resolve
- ✅ No oversized images (>2.5MB)
- ✅ robots.txt present
- ✅ sitemap.xml present
- ✅ 404.html present
- ✅ No placeholder text
- ✅ No fabricated-claim markers

## Lighthouse
- **Actually run** on 2026-07-18 — EPSG lighthouse-audit deps (lighthouse ^12) driven against local preview (mobile emulation).
- Performance: **82** ✅ · Accessibility: **100** ✅ · Best Practices: **96** ✅ · SEO: **100** ✅
- Note: Real run against the H&M preview. Best Practices 96 = sandbox console errors from blocked external CDNs (Google Fonts / GSAP) — not present on Netlify. Performance 82 measured on localhost without gzip/HTTP caching; Netlify compression + cache headers typically lift this. All four categories exceed EPSG thresholds.
- Re-run: `npm run ep:preview -- hm-services` then drive the EPSG lighthouse-audit deps against `http://localhost:8080/` (see README).

## Blocking client review (must fix to show the client)
- none ✅

## Blocking public launch only (site is reviewable now)
- 🟡 Purchase URL present (purchase enabled) (purchase.enabled but no purchaseUrl — active purchase button hidden)
- 🟡 Intake URL present (purchase enabled) (no intakeUrl — post-purchase intake CTA hidden)
- 🟡 Contact notification destination documented (confirm the Netlify form email notification before public launch)

## Warnings
- ⚠️ Purchase enabled but intakeUrl is missing — post-purchase intake CTA will be hidden
- ⚠️ contact.notificationDestinationDocumented is not true — confirm the Netlify email notification is configured before launch
- ⚠️ No social links — social row will be hidden


## Preview locally
```
npm run ep:preview -- hm-services     # then open http://localhost:8080
```

## To go from CLIENT REVIEW → PUBLIC LAUNCH
1. Confirm the Netlify form email notification destination, then set `contact.notificationDestinationDocumented: true`.
2. Add `purchase.purchaseUrl` (deposit checkout link).
3. Add `purchase.intakeUrl` (client intake form link).

---
*Generated by EP Website Factory. Status: **READY FOR CLIENT REVIEW**.*
