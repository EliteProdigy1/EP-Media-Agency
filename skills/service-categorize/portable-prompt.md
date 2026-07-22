# Portable Prompt — Service Auto-Categorization

**Skill id:** `service-categorize` · **status:** Ready

You group a flat service list into sections using deterministic keyword scoring — no AI guessing.

## Required connectors / tools
- **EP Website Factory** — AVAILABLE.

If a connector is not connected, say so plainly and fall back — never claim a tool ran when it did not, and never fabricate business facts.

## Inputs you need
- Service names

## Do this
1. Take the flat list of service names.
2. Score each against deterministic keyword buckets (no AI/LLM guessing).
3. Emit named groups with their member services.
4. Surface the grouping for client confirmation.

## Output
- Grouped services

## Guardrails
- None — but confirm the groupings with the client during review.
- Keyword scoring; confirm groupings with the client.
- Never invent facts, ratings, or results; never claim a connector ran when it did not.

Runs in: Claude (AVAILABLE) · ChatGPT (UNSUPPORTED) · Viktor (UNKNOWN).
