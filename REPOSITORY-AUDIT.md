# Elite Prodigy Media — Repository Audit & Migration Plan

**Date:** July 4, 2026  
**Auditor:** Chief Operating Officer  
**Target Repository:** `EliteProdigy1/Elite-Prodigy-sports-group-website`  
**Production Branch:** `claude/great-keller-ku4ha0`

---

## 1. Executive Summary

The current `Elite-Prodigy-sports-group-website` repository has evolved into a monorepo containing multiple distinct projects, client websites, and internal tools. This structure violates separation of concerns and creates deployment risks.

While 9 empty repositories were created in the GitHub organization (e.g., `EP-Command-Center`, `22-Builds`, `Metal-and-Mud`), **only `Clay-Retreat` contains migrated code**. The rest of the client websites currently live in isolated branches within the main EPSG repository.

**Core Directives:**
1. Do NOT delete files from the current repo.
2. Do NOT change the Netlify production branch (`claude/great-keller-ku4ha0`).
3. Migrate distinct projects to their dedicated repositories.

---

## 2. File & Folder Inventory (Production Branch)

### A. Elite Prodigy Sports Group (EPSG Core)
These files constitute the main sports agency website and should **remain** in the current repository.

* **HTML:** `epsg.html`, `eliteprodigy.html`, `universe.html`, `athlete-platform.html`, `athletes.html`, `leadership.html`, `onboarding.html`, `coach-interest.html`, `contact-youth.html`, `nominate.html`
* **Assets:** `/assets/athletes/`, `/assets/founders/`, `/assets/sports/`, `/assets/videos/`, helmet/uniform images
* **CSS:** `/css/athlete-platform.css`, `/css/profiles.css`, `/css/universe.css`, `/css/youth.css`, `/css/styles.css`
* **JS:** `/js/universe.js`, `/js/scroll-scrub.js`, `/js/three-bg.js`

### B. EP Media / Agency
These files represent the media agency arm and should be migrated to `EP-Media-Agency`.

* **HTML:** `ep-media.html`, `agency.html`, `agency-inquiry.html`, `brand-development.html`, `brand-inquiry.html`, `cinematic-listings.html`, `submit-listing.html`, `social-checklist.html`, `ep-select.html`
* **Assets:** `/assets/cinematic-listings/`, `cl-*.png` (cinematic listing assets)
* **CSS:** `/css/ep-media.css`, `/css/cinematic-listings.css`
* **JS:** `/js/cinematic-listings.js`
* **Docs:** `/docs/EP_MEDIA_*.md` (Playbook, Operations, Pricing Strategy, Competitive Analysis)

### C. EP Command Center
Internal dashboard and tools. Should be migrated to `EP-Command-Center`.

* **HTML:** `command-center.html`
* **CSS:** `/css/command-center.css`

### D. EP Agency Core (EP Media OS)
The reusable framework and templates used to build client sites. Should be migrated to `EP-Agency-Core`.

* **Folders:** `/ep-media-os/` (contains core CSS, JS, templates, SOPs, gateway systems)
* **CSS Tokens:** `/css/ep-tokens.css`
* **JS Core:** `/js/ep-core.js`, `/js/ep-popup.js`, `/js/gsap-animations.js`, `/js/cursor.js`
* **Templates:** `/templates/client-template/`
* **Docs:** `/docs/MASTER_DIRECTIVE.md`, `/docs/DESIGN_SYSTEM.md`, `/docs/JUNIOR_OPERATING_SYSTEM.md`

### E. Client Websites (Documentation)
Client intake forms, assets needed, and deployment notes. The actual code for these sites lives in separate branches, but these docs are in `main`.

* **Folders:** `/clients/22-builds/`, `/clients/azalea-turf-lawns/`, `/clients/clay-retreat/`, `/clients/head-locd/`, `/clients/metal-and-mud/`, `/clients/warren-landscape/`

---

## 3. Branch Inventory (The Hidden Code)

The actual code for client websites does not live in the `main` or production branch. It exists in isolated feature branches:

1. **Azalea Turf & Lawns:** `claude/azalea-turf-lawn-site-knj2so`
2. **Clay Retreat:** `claude/clay-retreat-cost-analysis-rupwus` (Already migrated to standalone repo)
3. **Metal & Mud:** `claude/metal-mud-dark-cinematic-r0y4he`
4. **Warren Landscape:** `claude/warren-landscape-rebuild-qjzumo`
5. **22 Builds:** `claude/elite-prodigy-luxury-site-qrcnnb` (Next.js concept in `/22builds-concept/`)
6. **Gulf Coast Karate:** `claude/gulf-coast-karate-redesign-ianop1` (Next.js concept in `/gulf-coast-karate/`)

---

## 4. Proposed Target Structure & Migration Plan

### Step 1: Initialize Empty Repositories
The following repositories exist but are empty. They need to be initialized with their respective code from the branches:

| Target Repository | Source Branch | Action |
| :--- | :--- | :--- |
| `EliteProdigy1/Azalea-Turf-and-Lawn` | `claude/azalea-turf-lawn-site-knj2so` | Extract `/azalea-turf-lawn/` directory |
| `EliteProdigy1/Metal-and-Mud` | `claude/metal-mud-dark-cinematic-r0y4he` | Extract `metal-and-mud.html` & assets |
| `EliteProdigy1/Warren-Landscape` | `claude/warren-landscape-rebuild-qjzumo` | Extract `warren-landscape.html` & assets |
| `EliteProdigy1/22-Builds` | `claude/elite-prodigy-luxury-site-qrcnnb` | Extract `/22builds-concept/` Next.js app |
| `EliteProdigy1/Head-Locd` | N/A | Initialize empty; await development |
| `EliteProdigy1/Clay-Retreat` | N/A | **Complete.** Code already migrated. |

### Step 2: Extract EP Media & Agency Operations
Move all agency-facing assets to `EliteProdigy1/EP-Media-Agency`:
* All `ep-media*.html` files
* All `cinematic-listings` files
* All `/docs/EP_MEDIA_*.md` documentation

### Step 3: Extract the Operating System
Move the shared framework to `EliteProdigy1/EP-Agency-Core`:
* The entire `/ep-media-os/` directory
* Shared scripts: `ep-core.js`, `gsap-animations.js`, `cursor.js`
* Shared CSS: `ep-tokens.css`

### Step 4: Build the Command Center
Initialize `EliteProdigy1/EP-Command-Center` with the new internal dashboard mockup (Task 2).

---

## 5. Risk Assessment & Warnings

⚠️ **Netlify Deployment Warning:**
The current `netlify.toml` in the production branch handles redirects for **everything**—EPSG, EP Media, Cinematic Listings, and Forms.
If we remove `ep-media.html` from this repo without first setting up the new Netlify site for `EP-Media-Agency` and updating DNS/redirects, **live links will break**.

**Safe-to-Keep Items:**
* `epsg.html`, `eliteprodigy.html`, `universe.html`, `athlete-platform.html`
* `/assets/athletes/`, `/assets/sports/`
* `netlify.toml` (Do not modify until migration is complete)

**Safe-to-Move Items:**
* `/clients/` directory (Move to respective client repos)
* `/ep-media-os/` (Move to `EP-Agency-Core`)

**Do-Not-Touch Production Items:**
* Branch: `claude/great-keller-ku4ha0`
* Any file currently handling active traffic or form submissions.
