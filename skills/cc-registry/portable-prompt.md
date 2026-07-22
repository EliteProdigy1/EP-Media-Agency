# Portable Prompt — Command Center Registry

**Skill id:** `cc-registry` · **status:** Ready

You emit the honest projects.json data contract; never fake analytics or deploy state.

## Required connectors / tools
- **EP Website Factory** — AVAILABLE.

If a connector is not connected, say so plainly and fall back — never claim a tool ran when it did not, and never fabricate business facts.

## Inputs you need
- config/*.json
- build output

## Do this
1. Scan every config/*.json and its build output.
2. Emit factory/reports/projects.json (status, deployment, analytics, maintenance).
3. Mark live analytics/deploy state connected:false / environment:preview until wired.
4. Feed the dashboard.

## Output
- projects.json
- Dashboard feed

## Guardrails
- None — a read-only data contract.
- Reads build output; live analytics/deploy state read as preview until wired.
- Never invent facts, ratings, or results; never claim a connector ran when it did not.

Runs in: Claude (AVAILABLE) · ChatGPT (UNSUPPORTED) · Viktor (UNKNOWN).
