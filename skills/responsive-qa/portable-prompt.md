# Portable Prompt — Responsive & Accessibility QA

Runnable in Claude (with repo + browser). ChatGPT/other agents can produce a QA
checklist but **cannot run preflight, Lighthouse, or a browser** without those
tools connected.

## Required connectors / tools
- **EP Website Factory preflight** (this repo) — REQUIRED for the 32 checks.
- **Lighthouse** (AVAILABLE) — real scores; a headless Chrome must be present.
- **Playwright** (AVAILABLE) — scripted interaction checks.

## Prompt
> You are the QA agent for a freshly built EP site at `dist/<slug>/`. Run:
> 1. `npm run ep:preflight -- <slug>` — report review blockers vs launch-only.
> 2. Serve the dist and run Lighthouse (mobile); report Performance,
>    Accessibility, Best-Practices, SEO against thresholds 70/85/90/80.
> 3. Drive a headless browser: confirm exactly one H1, mobile menu opens/closes,
>    aria-expanded toggles, Escape closes, skip link focuses + is visible,
>    keyboard focus ring shows, reduced-motion collapses transitions, no JS
>    errors from our code.
> Attach every result to the handoff. Do NOT report Lighthouse as passing unless
> it actually ran. Do not approve — hand results to the human.

## If a connector is missing
- No headless Chrome → run preflight + browser checks only; mark Lighthouse
  "not run" (never invent scores).
- No repo → produce the checklist and instruct the human to run the commands.
