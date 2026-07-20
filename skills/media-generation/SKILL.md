# Media Generation — Hero & Gallery

**id:** `media-generation` · **category:** Media & Creative · **status:** Ready · **v0.9.0**

## Purpose
Produce on-brand hero and gallery imagery for a client site. Two modes:
(1) **branded treatments** from the client logo via Sharp/SVG (available now),
(2) **full AI imagery/video** via Higgsfield (ready to connect). Also optimizes
uploaded photos to responsive WebP.

## When to use
- A client has a logo but no usable hero/project photos yet, and you need a
  premium placeholder to ship a review build.
- You have real photos that need optimization + a hero treatment.

## When NOT to use
- Never to fabricate photos of real completed projects or to imply work that
  didn't happen. Branded tiles are clearly brand graphics, not job-site photos.
- Full AI video/image generation when Higgsfield isn't connected — fall back to
  branded treatments and say so.

## Required inputs
- Client logo (image), brand palette (hex), industry. Real photos optional.

## Workflow
1. Branded hero: dark textured gradient + brand-gold glow + faint logo
   watermark → `assets/<slug>/hero-<slug>.jpg`.
2. Branded gallery tiles: framed dark tiles with the logo monogram (varied),
   neutral — no captions implying real projects.
3. Optimize any real photos → WebP + srcset variants (via `media.js` at build).
4. Flag alt text for human review; hand to `website-build`.

## Tools / connectors
Sharp (AVAILABLE, required for branded treatments + WebP) · Higgsfield
(READY TO CONNECT, for AI hero video/image) · ChatGPT image (READY TO CONNECT).

## Outputs
`hero-<slug>.jpg`, `project-01..NN.jpg` (branded), optimized WebP variants,
alt-text-needs-review list.

## Approvals
Human review before publish. Real client photos should replace branded tiles
before public launch (tracked as pending client verification).

## Failure handling
- No Higgsfield → branded Sharp/SVG treatment only; never claim AI generation
  occurred.
- Logo missing → cannot brand; request the logo (do not fabricate a mark).
- Oversized source → optimize; if still heavy, flag in the build report.

## Examples
- **H&M Services:** branded hero (gold glow + logo watermark) + 4 branded tiles
  from the logo; flagged "replace with real job-site photos" for launch.
