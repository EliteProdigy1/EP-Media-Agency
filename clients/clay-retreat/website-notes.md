# Website Notes — Clay Retreat

---

## Design Decisions

**Hero Style:** Image background with cinematic bowl zoom → video overlay reveal
**Animation:** Full GSAP (scroll scrub, pinned zoom, entrance blur-in, dust particles)
**Template:** Custom build (not ep-media-os template — predates OS)

## Pages / Sections

| Section | Status | Notes |
|---------|--------|-------|
| Hero | ✅ Built | Sticky hero, bowl zoom on scroll, video overlay transition |
| About / Story | ✅ Built | 2-col grid, corner accent, parallax image |
| Collection Strip | ✅ Built | 3-col grid, hover labels |
| Contact Form | ✅ Built | Netlify form, name/email/message |
| Footer | ⬜ Not built | Could add later — currently ends at contact |

## Bugs Fixed

- Double `transitionToAbout` call when video missing — safety timeout now cleared in catch branch
- Scroll-position loss on `resetVideo` — now restores `window.scrollY` before clearing `position:fixed`

## Build Notes

- Video overlay skips gracefully if `hero-video.mp4` is absent or blocked (3.5s safety timeout)
- Dust particle canvas: 60 particles, requestAnimationFrame loop, respects resize
- `hero-active` body class hides scrollbar during hero; removed when video triggers
- Collection grid shows 2 items on mobile (3rd hidden via `display:none`)
