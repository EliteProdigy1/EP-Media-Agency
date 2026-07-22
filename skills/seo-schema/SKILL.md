# SEO & Schema

**id:** `seo-schema` · **category:** Website Production · **status:** Ready · **v1.0.0**

## Purpose
Generate title/meta/OG, canonical, JSON-LD LocalBusiness, robots + sitemap from verified data only.

## When to use
- Every production build — head tags, canonical, JSON-LD, robots and sitemap.
- When verified location/service data exists in the client config.

## When NOT to use
- Never invent ratings, review counts, addresses, or service areas for schema.
- Not for off-site SEO or link building.

## Required inputs
- Business facts
- Location
- Services

## Workflow
1. Read verified business facts, location and services from the config.
2. Generate title/meta/OG + canonical.
3. Emit JSON-LD LocalBusiness using only verified fields.
4. Write robots.txt + sitemap.xml.

## Tools / connectors
EP Website Factory (AVAILABLE). Required: EP Website Factory.

## Outputs
- Meta head
- JSON-LD
- robots.txt
- sitemap.xml

## Approvals
None — output is verifiable against the client config.

## Failure handling
- Missing required fact → the field is omitted from schema, never fabricated.
- No location → LocalBusiness geo fields are dropped, not guessed.

## Known limitations
JSON-LD from verified data only.

## Examples
**H&M Services:** full head + LocalBusiness JSON-LD + robots/sitemap from verified facts.
