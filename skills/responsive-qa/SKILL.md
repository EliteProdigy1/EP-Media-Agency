# Responsive & Accessibility QA

**id:** `responsive-qa` · **category:** Website Production · **status:** Ready · **v1.0.0**

## Purpose
Verify a built site before it reaches the client: structural preflight (32
checks), Lighthouse scores, and scripted real-browser interaction checks
(mobile menu, aria, skip link, keyboard focus, reduced motion).

## When to use
- Immediately after `website-build`, before client-review approval.
- After any change that touches markup, media, or the shared core.

## When NOT to use
- As a substitute for human visual review — this catches structure and
  accessibility, not taste or brand nuance.
- On an unbuilt slug (run `ep:build` first).

## Required inputs
- A built site at `dist/<slug>/` (index.html + assets + core).

## Workflow
1. `npm run ep:preflight -- <slug>` — 32 structural/SEO/a11y checks; exit
   non-zero on **review** blockers (launch-only items don't fail review).
2. Serve + run Lighthouse (mobile) via the EPSG lighthouse-audit tool; record
   Performance / Accessibility / Best-Practices / SEO.
3. Scripted browser checks (Playwright): one H1, mobile menu open/close,
   `aria-expanded`, Escape, skip link, keyboard focus ring, reduced-motion,
   no JS errors.
4. Attach results to the handoff; hand to the human for client-review approval.

## Tools / connectors
EP Website Factory preflight (required) · Lighthouse (AVAILABLE) · Playwright
(AVAILABLE). Thresholds: Perf 70 · A11y 85 · Best-Practices 90 · SEO 80.

## Outputs
Preflight pass/blocker list, Lighthouse scores, interaction pass/fail, a11y
notes. Never claim Lighthouse passed unless it actually ran.

## Approvals
No gate to run. Its output is what the human approves against.

## Failure handling
- Review blocker (missing H1, broken asset, unresolved token, unlabeled form)
  → site is NOT READY FOR CLIENT REVIEW; return to `website-build`.
- Launch-only item (purchase URL, intake URL, form-notification email) →
  reviewable now, blocks public launch only.
- Sandbox blocks external CDNs → Best-Practices dips from console errors; note
  it as environmental, not a defect.

## Examples
- **H&M Services:** preflight 32/32, Lighthouse 82/100/96/100, a11y raised
  95→100 (inline-link underline), browser interactions all pass.
