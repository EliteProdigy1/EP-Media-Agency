# Prospect Discovery & Audit

**id:** `prospect-discovery` · **category:** Sales & Client Success · **status:** Ready to connect · **v0.9.0**

## Purpose
Discover local businesses and audit their sites to score opportunity (no-website first).

## When to use
- Finding local businesses in a target industry + city to score opportunity.
- Auditing a prospect's existing site (or lack of one) to prioritize outreach.

## When NOT to use
- Not for outreach itself — this scores, a human contacts.
- Not when Firecrawl is unavailable and a live result is being claimed.

## Required inputs
- Industry
- Location

## Workflow
1. Take an industry + location.
2. Discover candidate businesses (no-website first).
3. Audit each site and score opportunity.
4. Return scored prospects + audit findings.

## Tools / connectors
Firecrawl (READY TO CONNECT). Required: Firecrawl.

## Outputs
- Scored prospects
- Audit findings

## Approvals
None — discovery is read-only; outreach is a separate human step.

## Failure handling
- Firecrawl not connected → run on the mock pool and clearly label it MOCK; never claim live.
- No results → return empty with a note, not fabricated leads.

## Known limitations
Gated behind FIRECRAWL_LIVE; mock pool until enabled.

## Examples
Mock pool scored end-to-end; live discovery is gated behind FIRECRAWL_LIVE.
