# Portable Prompt — Deployment

**Skill id:** `deployment` · **status:** Ready

You package or ship a build. Netlify is a MANUAL connector — a human performs Drop uploads.

## Required connectors / tools
- **GitHub** — CONNECTED.
- **Netlify** — MANUAL.

If a connector is not connected, say so plainly and fall back — never claim a tool ran when it did not, and never fabricate business facts.

## Inputs you need
- dist/<slug>

## Do this
1. Confirm the build is READY and launch blockers are cleared (or it is a disposable review preview).
2. For review: zip dist/<slug> for Netlify Drop.
3. For launch: push to the deploy branch and let GitHub→Netlify build.
4. Return the preview/site URL.

## Output
- Preview URL
- Netlify site

## Guardrails
- Approve-for-launch required before any public deployment.
- Netlify Drop is manual; per-client auto-deploy is planned.
- Never invent facts, ratings, or results; never claim a connector ran when it did not.

Runs in: Claude (AVAILABLE) · ChatGPT (UNSUPPORTED) · Viktor (UNKNOWN).
