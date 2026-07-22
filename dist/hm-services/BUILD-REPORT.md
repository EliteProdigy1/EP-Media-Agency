# BUILD REPORT — H&M Services LLC (`hm-services`)

**Type:** Production update — compact, mobile-first one-page site
**Artifact:** `dist/hm-services/index.html` (committed + deployed; this is the live production file)
**Maintenance model:** Bespoke one-page layout maintained **directly** in `dist/hm-services/`.
It does **not** regenerate from the generic `premium-service` template — do not run
`ep:build -- hm-services` against it without first porting these one-page features into the
factory template. Editable service lists live in a single `HM_DATA` object at the top of the
page's inline `<script>` (accordion, gallery, estimate options); primary-service cards + copy
are static HTML for SEO.

## Readiness

- **READY FOR CLIENT REVIEW** — preflight **29/30**, **0 review blockers**.
- **1 launch-only item** (does not block review): Netlify form email-notification destination
  not yet documented (email address pending from client).

## Business facts used (verified from the client brief)

- Business: **H&M Services LLC** · Phone: **251-240-8386** (`tel:+12512408386`)
- Location: **Fairhope, Alabama** · Service area: **Baldwin County, Alabama**
- Tagline: **Built. Maintained. Removed. Improved.**
- Positioning: property improvement, landscaping, concrete and material delivery throughout
  Fairhope and Baldwin County.

## Content correction applied

- **"Masonry" removed** as a category everywhere. Replaced with **Concrete**, described via
  Driveways · Patios · Walkways · Concrete pads · Slabs · Repairs and replacements.
  (0 remaining "masonry" references in the page or config.)

## Sections built (per brief)

1. Sticky nav — transparent over hero → solid black on scroll (Home · Services · Projects ·
   About · Free Estimate · Call Now); mobile hamburger.
2. Hero — compact (~78–82vh desktop / ~78svh mobile), exact copy, two CTAs, three trust
   indicators (Locally Operated · Residential & Commercial · Free Estimates).
3. Primary services — Landscaping · Concrete · Pine Straw Distribution (cards + subservice
   chips + images) and the highlighted **"Need pine straw in volume?"** callout.
4. More services — keyboard-accessible **"View All Property Services"** accordion → 12-item grid
   (single editable array `HM_DATA.additionalServices`).
5. Project gallery — horizontal, scroll-snap slider with prev/next + arrow-key support;
   categories: Concrete · Landscaping · Pine straw · Clearing and excavation · Before and after.
6. About — brief, exact copy.
7. Estimate form — Name · Phone · Email · Project address · Main service · Description · Photo
   upload · Preferred contact method; JS validation, success + error states, Netlify Forms
   (`hm-services-contact`) + honeypot spam protection; `enctype=multipart/form-data` for uploads.
8. Mobile bottom action bar — **Call H&M** (`tel:+12512408386`) + **Get Estimate** (scrolls to form).
9. Closing CTA — exact copy + two buttons.

## Demo purchase bar

- **Removed from the client production view.** Controlled by a single value:
  `HM_DATA.showDemoPurchaseBar = false` (mirrored in `config/hm-services.json`
  → `showDemoPurchaseBar: false`, `purchase.enabled: false`).
- The reusable bar markup/logic is **retained in code** (renders only when the flag is true) so
  Elite Prodigy Media can reuse it for future prospect sites.

## Technical

- Semantic HTML, single `<h1>`, `<main>` landmark, skip link, labeled controls, keyboard
  accordion + slider, accessible contrast (black/silver/gold), `prefers-reduced-motion` honored.
- SEO title + meta description, canonical, Open Graph + Twitter, **LocalBusiness/GeneralContractor
  JSON-LD** (verified facts only — no ratings/reviews/founding date invented).
- Optimized WebP imagery (existing responsive variants), lazy-loading below the fold,
  explicit width/height, click-to-call links, `robots.txt` + `sitemap.xml` + `404.html` present.
- Industrial display type (Oswald) + Montserrat body, with system fallbacks.

## TEMPORARY IMAGES (replace before public launch)

- **Hero background** (`assets/hero-1600.webp`) — currently the H&M branded logo graphic
  placeholder. Replace with a real H&M project/hero photo.
- **Primary service card images** (`gallery-01/02/03`) and **all 5 gallery slides** — temporary
  branded placeholders with honest alt text and "coming soon" notes. Replace with real job-site
  photos per category (concrete, landscaping, pine straw, clearing/excavation, before/after).

## CLIENT INFORMATION STILL NEEDED BEFORE LAUNCH

1. Real photos: hero + concrete / landscaping / pine straw / clearing / before-and-after.
2. Netlify form **notification email** destination (so estimate requests are delivered).
3. Confirm the **exact primary + additional service wording/scope** with the owner.
4. Confirm whether **pine straw "Installation"** is offered (currently shown as pending).
5. Confirm **service area** beyond Fairhope + Baldwin County before claiming more.
6. Optional: public **email address** and a **street address** for richer LocalBusiness schema.

## Not done (by rule)

No invented guarantees, licensing, certifications, years in business, project counts, staff
names, or reviews. No masonry terminology. No fake testimonials. No lorem ipsum.
