# EP MEDIA OS — DESIGN SYSTEM
*The visual language behind every EP website. Never deviate from this unless explicitly overriding for a client theme.*

---

## PHILOSOPHY

Every EP website should feel like it was designed by Apple, built for Nike, and experienced like a luxury hotel.

**The four non-negotiables:**
1. **Black background** — Deep, cinematic. Never white-background sports sites.
2. **Gold accents sparingly** — Headlines, CTAs, and ruled lines only. Never as fill.
3. **Serif + sans combination** — Playfair Display (emotion) + Montserrat (precision).
4. **Motion as storytelling** — Blur-in, parallax, and scrub — never for decoration.

---

## COLOR SYSTEM

### EP Sports Group (Gold × Black)
```
Primary:     #C9A84C  (ep-gold)        — Headlines, CTAs, accents
Gold Light:  #E8D49A  (ep-gold-light)  — Hover states, warm fills
Gold Dark:   #8B6914  (ep-gold-dark)   — Scrollbar, subdued accent
Background:  #050505  (ep-black)       — Page background
Surface 1:   #0a0a0a  (ep-black-rich)  — Cards, panels
Surface 2:   #141414  (ep-black-mid)   — Alternating sections
Text:        #F8F6F0  (ep-white)       — 98% white — never pure #fff
Silver:      #B8B8B8  (ep-silver)      — Secondary text
Gunmetal:    #1C1C1E  (ep-gunmetal)    — Dark accent
```

### EP Youth (Green × Black)
```
Primary:     #00cc55  (ep-green)       — Same role as gold
Surface:     #050505  (ep-black)       — Same backgrounds
```

### Client Themes (override in [client]-theme.css)
```css
/* Example: Red team sport client */
:root {
  --brand-primary:   #C0392B;
  --brand-secondary: #922B21;
  --brand-surface:   #0a0a0a;
}

/* Apply: replace var(--ep-gold) → var(--brand-primary) in client CSS */
```

---

## TYPOGRAPHY

### Font Families
```
Display (emotion/luxury):
  'Playfair Display', Georgia, serif
  Use: Hero titles, section headings, profile names, CTA headings
  Weights: 400, 700, 900; italic variants

Editorial (body/longform):
  'Cormorant Garamond', Georgia, serif
  Use: Subtitles, body copy, quotes, editorial paragraphs
  Weights: 300, 400; italic variants

UI (precision/interface):
  'Montserrat', system-ui, sans-serif
  Use: Nav links, buttons, labels, badges, eyebrows, small text
  Weights: 300, 400, 500, 600, 700
```

### Type Scale (always use clamp — never hardcode px)
```css
--ep-text-xs:   clamp(0.65rem, 1vw, 0.75rem)     /* labels, eyebrows */
--ep-text-sm:   clamp(0.75rem, 1.2vw, 0.875rem)  /* body small */
--ep-text-base: clamp(0.9rem, 1.5vw, 1rem)        /* body default */
--ep-text-md:   clamp(1rem, 1.8vw, 1.125rem)      /* body large */
--ep-text-lg:   clamp(1.1rem, 2vw, 1.375rem)      /* sub-heading */
--ep-text-xl:   clamp(1.25rem, 2.5vw, 1.75rem)    /* section sub-title */
--ep-text-2xl:  clamp(1.5rem, 3.5vw, 2.5rem)      /* section title */
--ep-text-3xl:  clamp(2rem, 5vw, 3.5rem)           /* large heading */
--ep-text-4xl:  clamp(2.5rem, 7vw, 5rem)           /* hero heading */
--ep-text-hero: clamp(3rem, 10vw, 8rem)             /* mega hero */
```

### Letter Spacing (tracking)
```
Eyebrow text:    0.20–0.25em (heavily tracked uppercase)
Button labels:   0.12–0.14em (tracked uppercase)
Nav links:       0.10–0.12em (tracked uppercase)
Body text:       0 (natural, no extra tracking)
Section titles:  -0.01 to -0.02em (slightly tight for luxury feel)
```

### Line Heights
```
Hero titles:     0.92–1.0 (tight, impactful)
Section titles:  1.1–1.2
Subtitles:       1.4–1.5
Body copy:       1.7 (spacious, readable)
Labels/badges:   1.0
```

---

## SPACING SYSTEM

### Section Padding (CLAUDE.md rule)
```css
--ep-section-pad:    clamp(80px, 10vw, 140px)  /* desktop max 140px, mobile min 80px */
--ep-section-pad-sm: clamp(48px, 6vw, 80px)    /* reduced version */
```

**Never hardcode section padding. Always use these variables.**

### Container Widths
```css
--ep-container:    1280px  /* default page width */
--ep-container-sm:  900px  /* form / article / narrow content */
--ep-gutter:       clamp(20px, 4vw, 48px)  /* horizontal padding */
```

### Gap System (grid spacing)
```css
--ep-gap: clamp(16px, 2.5vw, 32px)
```

---

## MOTION SYSTEM

### Easing Curves
```css
--ep-ease:        cubic-bezier(.25, .46, .45, .94)   /* Apple-feel default */
--ep-ease-out:    cubic-bezier(0, 0, 0.2, 1)         /* snappy decel */
--ep-ease-in-out: cubic-bezier(.45, 0, .55, 1)       /* symmetric */
--ep-ease-spring: cubic-bezier(.34, 1.56, .64, 1)    /* bouncy, use sparingly */
--ep-ease-power3: cubic-bezier(.215, .61, .355, 1)   /* GSAP power3.out */
```

### Duration Scale
```css
--ep-dur-micro:  0.18s  /* microinteractions: hover color, border */
--ep-dur-fast:   0.32s  /* quick transitions: button hover, menu */
--ep-dur-base:   0.55s  /* standard: card lift, color swap */
--ep-dur-slow:   0.85s  /* cinematic: nav open, hero transition */
--ep-dur-reveal: 1.20s  /* scroll reveals, blur-in animations */
```

### Animation Patterns
```
Blur-in:          opacity 0→1, y 20→0, filter blur(12px)→blur(0)
                  Used on: hero title, eyebrow, subtitle, hero actions
                  Duration: 1.5s, ease: power3.out

Section reveal:   opacity 0→1, y 36→0, filter blur(8px)→blur(0)
                  Triggered by: scroll (top 88%)
                  Duration: 1.2s, scrub: 0.4

Counter:          number 0→target, duration: 2s, ease: power2.out
                  Triggered by: scroll (top 80%)

Stagger:          children cascade, 0.08s between each
                  Duration per child: 0.9s, ease: power3.out

Card tilt:        perspective(900px) rotateX/Y on mousemove
                  Max rotation: ±7° Y, ±5° X
                  Reset duration: 0.6s, ease: power3.out

Magnetic button:  translate(dx, dy) on mousemove, pull factor: 0.28
                  Reset: 0.5s, ease: power3.out

Parallax (scroll):yPercent -100*speed on scroll
                  Speed: 0.10–0.20 (subtle)
                  Triggers: scrub, start "top bottom", end "bottom top"

Video scrub:      video.currentTime = progress * duration
                  Pin: true (CSS sticky or GSAP pin)
                  Scrub: true (direct scroll tie)
```

---

## COMPONENT PATTERNS

### Eyebrow Text
```html
<p class="ep-eyebrow">CATEGORY · DETAIL</p>
```
- Font: Montserrat 600
- Size: 0.65–0.75rem
- Color: var(--ep-gold)
- Letter-spacing: 0.20em
- Text-transform: uppercase
- Always appears above the section title
- Format: "CATEGORY · SUBCATEGORY" or "EP · GULF COAST"

### Section Title
```html
<h2 class="ep-title">Main <em>Emphasis</em></h2>
```
- Font: Playfair Display 700–900
- Size: clamp(2rem, 5vw, 3.5rem)
- The `<em>` receives gold italic treatment automatically
- One or two lines maximum
- Never put a period at the end

### Gold Rule (visual divider)
```html
<div class="ep-rule"></div>
```
- 48px wide, 1px tall
- Background: var(--ep-gold)
- Use between eyebrow/title and body copy for luxury feel

### Buttons
```html
<!-- Primary: gold filled -->
<a href="#" class="ep-btn ep-btn--primary">Get Started</a>

<!-- Secondary: outline -->
<a href="#" class="ep-btn ep-btn--outline">Learn More</a>

<!-- Ghost: gold outline -->
<a href="#" class="ep-btn ep-btn--ghost">View All</a>
```
- Font: Montserrat 700
- Letter-spacing: 0.14em
- Text-transform: uppercase
- Padding: 16px 36px
- Radius: var(--ep-radius) = 4px
- Magnetic effect: enabled via ep-cursor.js

### Glass Panels
```css
background: var(--ep-glass-bg);         /* rgba(4,3,2,0.72) */
border: 1px solid var(--ep-glass-border); /* rgba(201,168,76,0.28) */
backdrop-filter: var(--ep-glass-blur);   /* blur(18px) saturate(1.3) */
border-radius: var(--ep-radius-lg);      /* 8px */
```
Use for: overlays, panels, cards over video backgrounds, modal dialogs.

---

## WHAT NEVER TO DO

```
❌ Gold text on gold background
❌ White background (ever, on any EP project)
❌ Inter font (the default AI/startup font)
❌ Purple-to-blue gradients
❌ Cards nested inside cards
❌ Hardcoded pixel section padding
❌ !important in CSS
❌ GSAP pin on sections with sticky children (conflict)
❌ Three.js canvas with pointer-events other than none
❌ Autoplay video without muted playsinline
❌ Generic sports layouts (scoreboards, standings)
❌ More than 3 nav items as top-level (keep it clean)
❌ External links inside the nav
❌ Mixing font families arbitrarily (stick to the 3-font system)
❌ Animations that can't be skipped (no mandatory intros)
❌ Pure white (#ffffff) anywhere
❌ Padding reduction below 80px on mobile sections
```
