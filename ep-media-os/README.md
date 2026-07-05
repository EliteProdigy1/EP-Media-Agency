# EP MEDIA OPERATING SYSTEM
## Version 1.0 — Built from Elite Prodigy Sports Group

> **The goal:** No future website starts from scratch.
> Every project inherits this system and ships faster, at higher quality.

---

## WHAT THIS IS

The EP Media OS is a complete, production-ready web agency framework reverse-engineered from the Elite Prodigy Sports Group website ecosystem.

It contains:
- A reusable **Core Engine** (CSS + JS modules)
- **Industry HTML templates** (ready to populate)
- **Gateway system** documentation and code
- A **project initializer** config
- **SOPs** for every client workflow stage
- **AI tool guides** for the full production stack
- **Design system** documentation
- **Client packages** with internal pricing

---

## FOLDER STRUCTURE

```
ep-media-os/
│
├── core/                         ← Import these on every project
│   ├── css/
│   │   ├── ep-variables.css      ← Design tokens (colors, type, spacing, motion)
│   │   ├── ep-base.css           ← Reset + global styles + utility classes
│   │   ├── ep-nav.css            ← Navigation (desktop + mobile + hamburger)
│   │   ├── ep-hero.css           ← Hero variants (video, image, split, text, gateway)
│   │   ├── ep-components.css     ← Cards, stats, features, testimonials, gallery, footer
│   │   └── ep-forms.css          ← Form fields, validation, multi-step, confirmation
│   └── js/
│       ├── ep-core.js            ← Nav scroll, mobile menu, popup, utilities
│       ├── ep-gsap.js            ← All GSAP animations (blur-in, reveal, counter, tilt)
│       ├── ep-cursor.js          ← Custom cursor + magnetic + card tilt + parallax
│       ├── ep-cursor.css         ← Cursor styles (include alongside ep-cursor.js)
│       └── ep-forms.js           ← Netlify form submission + validation + multi-step
│
├── templates/                    ← Starting points per industry
│   ├── sports.html               ← Sports organizations, programs, youth leagues
│   ├── roofing.html              ← Roofing / HVAC / home services
│   ├── real-estate.html          ← [TODO] Real estate agents + listings
│   ├── restaurant.html           ← [TODO] Restaurants + food/beverage
│   ├── medical.html              ← [TODO] Med spas, gyms, wellness
│   └── professional-services.html← [TODO] Lawyers, consultants, coaches
│
├── gateway/
│   └── gateway-systems.md        ← Docs + code for all gateway types
│
├── config/
│   └── project-config.json       ← Master config template (copy per client)
│
├── sops/
│   └── client-workflow.md        ← Full SOP: intake → discovery → deposit → launch
│
├── ai-workflows/
│   └── ai-tools-guide.md         ← Every tool: purpose, inputs, outputs, workflow
│
├── packages/
│   └── packages.md               ← Client packages + internal pricing + time targets
│
├── docs/
│   └── design-system.md          ← Colors, type, spacing, motion, component patterns
│
└── README.md                     ← This file
```

---

## HOW TO START A NEW PROJECT

### Step 1 — Copy config
```bash
cp ep-media-os/config/project-config.json config/[client-slug]-config.json
```
Fill in all fields: brand, colors, hero, nav links, forms, analytics.

### Step 2 — Create theme override
```css
/* config/[client-slug]-theme.css */
:root {
  --brand-primary:   #[CLIENT_COLOR];
  --brand-secondary: #[CLIENT_SECONDARY];
}
```

### Step 3 — Copy the right template
```bash
cp ep-media-os/templates/[industry].html [client-slug]/index.html
```

### Step 4 — Replace all tokens
Find all `{{PLACEHOLDER}}` values in the HTML and replace with client content.

```bash
# Quick scan for unfilled tokens
grep -r "{{" [client-slug]/
```

### Step 5 — Wire core engine
Update the script/CSS paths to point to `/ep-media-os/core/` or copy the core files into the client project.

### Step 6 — Add hero assets
- Video: compress to under 8MB (H.264, 1080p)
- Poster: first frame as JPG, same dimensions
- Images: WebP, under 200KB each

### Step 7 — Configure Netlify
```toml
# netlify.toml
[[redirects]]
  from = "/"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

### Step 8 — Push and deploy
```bash
git add .
git commit -m "Launch: [client-slug] website"
git push -u origin main
```
Netlify auto-deploys from main.

---

## CORE ENGINE — QUICK REFERENCE

### CSS import order (always this order)
```html
<link rel="stylesheet" href="/ep-media-os/core/css/ep-variables.css">
<link rel="stylesheet" href="/ep-media-os/core/css/ep-base.css">
<link rel="stylesheet" href="/ep-media-os/core/css/ep-nav.css">
<link rel="stylesheet" href="/ep-media-os/core/css/ep-hero.css">
<link rel="stylesheet" href="/ep-media-os/core/css/ep-components.css">
<link rel="stylesheet" href="/ep-media-os/core/css/ep-forms.css">
<link rel="stylesheet" href="/ep-media-os/core/js/ep-cursor.css">
<link rel="stylesheet" href="/config/[client]-theme.css">   <!-- last, overrides -->
```

### JS load order
```html
<!-- In <head> or early in <body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="/ep-media-os/core/js/ep-core.js"></script>
<script src="/ep-media-os/core/js/ep-gsap.js"></script>
<script src="/ep-media-os/core/js/ep-cursor.js"></script>
<script src="/ep-media-os/core/js/ep-forms.js" defer></script>
```

### HTML data attributes (no custom JS needed)
```
data-gsap="blur-in"          → hero element blur-in animation
data-delay="0.3"             → delay in seconds for blur-in
data-counter="42"            → animated counter (+ data-suffix="%")
data-cursor-label="EXPLORE"  → section-specific cursor label
data-parallax-speed="0.1"    → parallax scroll speed
data-ep-nav                  → auto-attach scroll behavior
data-ep-hamburger            → mobile menu toggle button
data-ep-menu                 → mobile menu panel
data-ep-overlay              → mobile menu overlay
```

### CSS utility classes
```
.reveal               → scroll-triggered reveal (opacity/blur/y)
.ep-stagger-parent    → children animate in with stagger
.ep-tilt              → 3D card tilt on hover
.ep-magnetic          → magnetic pull on hover
.ep-parallax          → vertical parallax on scroll
.ep-container         → max-width 1280px centered
.ep-container--sm     → max-width 900px centered
.ep-section           → section padding
.ep-section--sm       → reduced section padding
```

---

## PRODUCTION TIME TARGETS

| Deliverable             | Goal with EP OS |
|-------------------------|-----------------|
| Starter Website (5-page)| 4–6 hours       |
| Premium Website (8-page) | 10–14 hours    |
| Signature Experience    | 20–30 hours     |
| Brand Starter Package   | 4–6 hours       |
| Brand Launch Package    | 16–24 hours     |
| Org Buildout            | 35–50 hours     |

**Baseline comparison (without OS): 12–80 hours per project**
**Efficiency gain: 60–70% time reduction**

---

## TOKENS TO REPLACE IN TEMPLATES

Every template uses `{{TOKEN}}` placeholders. Replace all of them before launch.

| Token                  | Where to get it         |
|------------------------|-------------------------|
| `{{BRAND_NAME}}`       | Client config           |
| `{{TAGLINE}}`          | Client discovery call   |
| `{{SEO_DESCRIPTION}}`  | Write or use ChatGPT    |
| `{{CANONICAL_URL}}`    | Client domain           |
| `{{OG_IMAGE}}`         | Generate with Seedream  |
| `{{LOGO_SVG}}`         | Client assets           |
| `{{HERO_VIDEO}}`       | Generate with Higgsfield|
| `{{HERO_POSTER}}`      | First frame of video    |
| `{{HERO_EYEBROW}}`     | "CITY · INDUSTRY"       |
| `{{HERO_TITLE}}`       | Write or use ChatGPT    |
| `{{HERO_TITLE_EM}}`    | The italic emphasis word|
| `{{HERO_SUBTITLE}}`    | One-sentence value prop |
| `{{CLIENT_EMAIL}}`     | Client intake           |
| `{{PHONE_DISPLAY}}`    | Client intake           |
| `{{YEAR}}`             | Current year            |
| `{{CLIENT_SLUG}}`      | URL-safe client name    |
| `{{POPUP_FORM_NAME}}`  | `[client]-email-leads`  |
| `{{ESTIMATE_FORM_NAME}}`| `[client]-[purpose]`   |

---

## WHAT'S NEXT (ROADMAP)

### Templates to build:
- [ ] `real-estate.html` — Agent profile + listing gallery
- [ ] `restaurant.html` — Menu + reservation form + gallery
- [ ] `medical.html` — Services + booking + HIPAA-safe contact
- [ ] `gym.html` — Class schedule + membership inquiry
- [ ] `professional-services.html` — Lawyer / consultant / coach

### Tools to add:
- [ ] `ep-scroll-scrub.js` — Video scrub engine (extracted from scroll-scrub.js)
- [ ] `ep-three-bg.js` — Three.js hero background (extracted from three-bg.js)
- [ ] `ep-popup.css` — Popup email capture styles
- [ ] Netlify.toml base template (security headers + redirects)

### Automation opportunities:
- [ ] Script that reads `project-config.json` → generates populated HTML
- [ ] GitHub Action: auto-creates Netlify site on config push
- [ ] Airtable integration: client inquiry → auto-creates project record

---

## BUILT FROM

The EP Media OS was reverse-engineered from:
- `epsg.html` — Main EPSG site
- `eliteprodigy.html` — Youth program site
- `athletes/izaiah-walton.html` — Athlete profile system
- `cinematic-listings.html` — Cinematic real estate walker
- `universe.html` — 8-world cinematic journey
- `onboarding.html` — Multi-step athlete onboarding
- `css/ep-tokens.css` — Design token system
- `js/ep-core.js` — Core behaviors
- `js/gsap-animations.js` — Animation patterns
- `js/cursor.js` — Cursor system
- `js/scroll-scrub.js` — Video scrub
- `js/three-bg.js` — Three.js background
- `js/cinematic-listings.js` — Estate walker engine
- `js/universe.js` — Scroll storytelling

**Everything was real production code. Nothing is theoretical.**
