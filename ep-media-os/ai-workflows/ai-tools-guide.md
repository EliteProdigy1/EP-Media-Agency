# EP MEDIA OS — AI TOOLS & WORKFLOW GUIDE
*Every tool, its purpose, inputs, outputs, cost, and how to use it in production.*

---

## TOOL STACK OVERVIEW

| Tool          | Primary Use                          | Cost           | Time/Output     |
|---------------|--------------------------------------|----------------|-----------------|
| Claude Code   | Build, debug, refactor website code  | Per token       | Real-time       |
| ChatGPT       | Copy, headlines, SOP drafts          | $20/mo Plus     | Real-time       |
| Higgsfield    | AI video generation (cinematic hero) | Credits-based   | 2–5 min/clip    |
| Kling AI      | Lip sync, avatar video, motion       | Credits-based   | 3–10 min/clip   |
| Seedream      | Image generation (photorealistic)    | Free/Pro        | 30 sec/image    |
| Netlify       | Hosting, forms, deploy               | Free–$19/mo     | Instant deploy  |
| GitHub        | Version control, collaboration       | Free            | Always on       |
| GSAP          | Animation engine                     | Free (GreenSock)| Runtime         |
| Lenis         | Smooth scroll                        | Free            | Runtime         |

---

## 01 — CLAUDE CODE

**Purpose:** The primary development environment. Builds all websites, debugs code, writes JS/CSS, manages git.

**What to give it:**
- CLAUDE.md (always loaded — includes brand, rules, architecture)
- A clear task: "Build the hero section for a roofing company template"
- Relevant existing files when editing

**What it produces:**
- Production-ready HTML/CSS/JS
- Git commits with clear messages
- Netlify config updates
- New pages, components, forms
- Documentation (like this file)

**Workflow:**
1. Start session → CLAUDE.md auto-loads brand rules
2. Give it a clear task with context
3. Review output before committing
4. Never push without reviewing the diff

**Automation opportunities:**
- One-shot template generation: give it the project-config.json → it generates the full site
- Future: GitHub Action that reads config and generates static HTML on push

**Cost estimate:** Approximately $5–15 per full website build in API tokens

---

## 02 — CHATGPT

**Purpose:** Copy writing, headline generation, testimonial refinement, email templates, proposal drafts.

**What to give it:**
- Business name, industry, audience, tone
- Draft copy you want refined
- SOP outlines you want expanded

**What it produces:**
- Hero headlines and subheadlines
- Service descriptions (5–7 sentences)
- FAQ content
- Email outreach templates
- Proposal language

**Prompt template:**
```
Write 3 hero headline options for [Business Name], a [industry] company in [city].
Audience: [who they serve].
Tone: [premium/approachable/bold/etc].
Format: Main headline (6–8 words) + supporting line (1 sentence).
```

**Where NOT to use it:**
- Code (Claude Code is significantly better)
- Factual claims (hallucination risk)
- Legal/compliance language

---

## 03 — HIGGSFIELD

**Purpose:** Generate cinematic video for hero sections, gateway sequences, and social content.

**Best use cases:**
- Hero video background (sports atmosphere, outdoor scenes, stadiums)
- Helmet gateway explode sequence
- Athlete action footage
- Real estate/property walkthroughs
- Brand identity reels

**Inputs:**
- Text prompt describing the scene
- Reference image (optional but improves results)
- Duration: 4–8 seconds per clip
- Style: cinematic, photorealistic, slow-motion

**Effective prompt structure:**
```
[Subject/scene], [camera movement], [lighting description], [mood/atmosphere].
Shot on RED camera. Cinematic. 4K quality. No text. No watermarks.

Examples:
"Empty football stadium at golden hour, aerial crane shot pulling back slowly, 
dramatic volumetric lighting, fog on field, cinematic."

"Athletic young male wearing gold and black jersey running through stadium tunnel,
slow motion, motion blur, lens flare, cinematic color grade."
```

**Output specs:**
- Download as MP4, H.264
- Target: under 8MB for web use
- Compress with FFmpeg if needed: `ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -movflags faststart output.mp4`

**Cost:** Credit-based per generation. Budget ~5–10 credits per final hero video (10–20 attempts typical).

**Time:** 2–5 minutes per clip generation.

**Workflow integration:**
1. Draft the website layout first (know what hero dimensions/content you need)
2. Generate 3–5 video options in Higgsfield
3. Pick the best, compress with FFmpeg
4. Drop into EP hero template
5. Always provide a poster image (first frame, exported as JPG)

---

## 04 — KLING AI

**Purpose:** Lip-sync, avatar video, motion transfer, video-to-video style transfer.

**Best use cases:**
- Making a founder's photo "come to life" for a profile intro
- Generating a spokesperson clip from a text script
- Sports motion: making an athlete still photo into action video

**Workflow:**
1. Upload reference photo (headshot or full body)
2. Enter text script or motion prompt
3. Export, compress, embed

**Limitations:** Output quality varies. Test first before committing to a client project.

---

## 05 — SEEDREAM / IMAGE GENERATION

**Purpose:** Photorealistic imagery for hero sections, gallery placeholders, team photos when no client photos exist.

**Use cases:**
- Placeholder photos during build phase
- Hero background images (roofing, fitness, medical, restaurant)
- Social media content
- OG/preview images for SEO

**Prompt structure:**
```
[Subject], [environment], [lighting], [style], [camera].
Photorealistic. No text. No watermarks. 4K quality. Wide shot.

Example:
"Professional roofer installing shingles on a suburban home,
golden afternoon light, depth of field, photorealistic, wide shot."
```

**Output:** Download highest resolution available. Compress to WebP for web.

---

## 06 — NETLIFY

**Purpose:** Hosting, continuous deploy, form handling, security headers, redirects.

**What EP uses it for:**
- Hosting all EP sites (free tier supports multiple sites)
- Auto-deploy from GitHub branch push
- Netlify Forms (free, no backend needed)
- Custom headers (HSTS, CSP, etc.)
- 404 and redirect rules

**Daily workflow:**
1. Push to branch → Netlify auto-deploys (2–3 minutes)
2. Check Netlify dashboard for form submissions daily
3. Set up email notifications per form

**Form notification setup:**
```
Netlify Dashboard → Site → Forms → [form name] → Form notifications
→ Add notification → Email notification → eliteprodigyway@gmail.com
```

**Cost:** Free tier supports:
- Unlimited sites
- 100GB bandwidth/month
- 100 form submissions/month (per site)
- Custom domains with SSL

Upgrade to Netlify Pro ($19/mo) if a client exceeds 100 form submissions/month.

---

## 07 — GITHUB

**Purpose:** Version control, branch management, deploy triggers.

**EP branch naming convention:**
- `main` — production (auto-deploys)
- `claude/[feature-slug]` — active development branch
- `claude/[client-slug]` — client project branch

**Daily workflow:**
```bash
# Start session
git pull origin main

# Work on feature
git add [files]
git commit -m "Clear description of what changed"
git push -u origin claude/branch-name

# Deploy: Netlify watches branch, auto-deploys on push
```

**Never push directly to main without review.**

---

## 08 — GSAP + SCROLLTRIGGER

**Purpose:** Scroll-linked animations, pinned sections, counters, reveals, card tilt.

**CDN (always use pinned version):**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

**EP standard patterns (all in ep-gsap.js):**
- `data-gsap="blur-in"` → hero load animation
- `.reveal` → scroll-triggered section reveal
- `data-counter="42"` → animated number counter
- `.ep-stagger-parent` → children stagger in sequence
- `.ep-tilt` → 3D card hover tilt
- `.ep-parallax` → vertical parallax on scroll

**Cost:** Free (GreenSock public license for non-commercial + commercial with credit)

---

## 09 — LENIS (SMOOTH SCROLL)

**Purpose:** Buttery smooth scrolling feel (optional, premium projects only).

```html
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.10/dist/lenis.min.js"></script>
<script>
  const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  // Connect to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
</script>
```

**When to use:** Signature Experience tier only. Adds ~12KB. Not needed for Starter/Premium.

---

## PRODUCTION WORKFLOW (COMBINED)

### Full website in under a week:

**Day 1 — Setup (1 hour)**
- Duplicate project config
- Fill in client data
- Choose template and tier

**Day 1 — Hero Assets (2–3 hours)**
- Generate hero video/image in Higgsfield or Seedream
- Compress assets with FFmpeg/cwebp
- Export poster frame

**Day 2 — Build (4–6 hours)**
- Claude Code: populate template with client content
- Wire forms, set Netlify form names
- Add GA4 if client has tracking ID

**Day 3 — QA + SEO (1–2 hours)**
- Test on mobile (iOS Safari, Chrome Android)
- Check all links and forms
- Verify canonical, OG tags, favicon
- Push to Netlify preview URL

**Day 3 — Client Review + Revisions (1–2 hours after feedback)**
- Send preview URL
- Implement one revision round
- Launch

**Total build time target (Starter): 8–12 hours, including asset creation**
