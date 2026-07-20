# Portable Prompt — Premium Service Website Build

Runnable in Claude (with Claude Code / repo access), or as a planning prompt in
ChatGPT / another agent (which can draft the config + copy but **cannot execute
the factory** — see connectors).

## Required connectors / tools
- **EP Website Factory** (this repo) — REQUIRED to actually build. Without repo
  execution you can only produce the config + copy, not the site.
- **GitHub** (CONNECTED) — to commit/push the result.
- **Netlify** (MANUAL) — deploy via Netlify Drop or GitHub auto-deploy.
- **Sharp** (optional) — WebP + srcset. **Lighthouse** (optional) — scores.

## Prompt
> You are building a premium local-service website with the EP Website Factory.
> Use ONLY verified facts I provide — never invent ratings, services, licenses,
> reviews, staff, or service areas. Steps:
> 1. Draft `config/<slug>.json` (businessName, slug, industry, description,
>    tagline, location, serviceAreas, phone, email, services[] with categories,
>    brand colors, purchase config). Flag every missing/uncertain fact as
>    pending client verification.
> 2. If you have repo/tool access: `npm run ep:validate -- <slug>` then
>    `npm run ep:build -- <slug>`; otherwise output the finished config and tell
>    me to run those commands.
> 3. Report readiness (REVIEW / LAUNCH / NOT READY) and every launch blocker.
> Do not deploy publicly without explicit approve-for-launch.

## If a connector is missing
- No repo execution → deliver the validated config + copy; instruct the human
  to run the two commands. Do not claim the site was built.
- No Netlify → produce the dist and hand off a Netlify Drop package; never
  fake a deploy URL.
