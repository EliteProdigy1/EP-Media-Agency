# Service Auto-Categorization

**id:** `service-categorize` · **category:** Website Production · **status:** Ready · **v1.0.0**

## Purpose
Group a flat service list into logical sections by deterministic keyword scoring (no AI).

## When to use
- A client provides a long flat list of services that needs logical sections.
- During intake, before the build lays out service groups.

## When NOT to use
- Not when the client already provided their own grouping — use theirs.
- Not a copywriting step; it groups, it does not rename services.

## Required inputs
- Service names

## Workflow
1. Take the flat list of service names.
2. Score each against deterministic keyword buckets (no AI/LLM guessing).
3. Emit named groups with their member services.
4. Surface the grouping for client confirmation.

## Tools / connectors
EP Website Factory (AVAILABLE). Required: EP Website Factory.

## Outputs
- Grouped services

## Approvals
None — but confirm the groupings with the client during review.

## Failure handling
- Ambiguous service → placed in the best-scoring bucket and flagged for confirmation.
- No keyword match → grouped under a general section, never dropped.

## Known limitations
Keyword scoring; confirm groupings with the client.

## Examples
**H&M Services:** 15 services deterministically grouped into 5 categories.
