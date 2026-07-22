# Clay Retreat — Project Overview

**Status:** In Build
**Package:** Starter
**Start Date:** June 2026
**Project Lead:** Jonathan Walton · EP Media

---

## Quick Reference

| Field | Value |
|-------|-------|
| Business | Clay Retreat |
| Type | Handmade Pottery Studio |
| Location | Westminster, South Carolina |
| Website | clayretreat.netlify.app |
| GitHub Repo | [EliteProdigy1/Clay-Retreat](https://github.com/EliteProdigy1/Clay-Retreat) |
| Netlify | ✅ Live — needs reconnect to new standalone repo |
| Assets | ✅ hero.webp · hero-video.mp4 |

---

## Current Status

The Clay Retreat site was extracted from the Elite Prodigy Sports Group repo and moved into its own standalone GitHub repository (`EliteProdigy1/Clay-Retreat`). All assets and code are committed to `main`.

**Immediate next action:** In Netlify → Deploy settings → link repository → select `EliteProdigy1/Clay-Retreat` → branch `main` → publish dir `.`

---

## Notes

- All CSS and JS are inline in `index.html` — no build step required
- Netlify form name: `clay-retreat-contact`
- Video overlay triggers on scroll bowl-zoom — gracefully skips if video is absent
- Two bugs were found and fixed: double `transitionToAbout` call and scroll-position loss on `resetVideo`
- OG tags, canonical, and security headers all confirmed in place
