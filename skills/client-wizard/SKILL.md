# Client Wizard / Intake

**id:** `client-wizard` · **category:** Sales & Client Success · **status:** Ready · **v1.0.0**

## Purpose
Interactive intake that turns business facts + photos into a buildable client config.

## When to use
- Onboarding a brand-new client from raw facts + a photos folder.
- You need a validated config/<slug>.json to start a build.

## When NOT to use
- Not for editing an existing live client site.
- Not a place to invent facts the owner did not provide.

## Required inputs
- Owner answers
- Photos folder

## Workflow
1. Collect verified business facts through the interactive prompts.
2. Import + auto-rename the client photos into assets/<slug>/.
3. Write config/<slug>.json.
4. Hand off to validate + build.

## Tools / connectors
EP Website Factory (AVAILABLE). Required: EP Website Factory.

## Outputs
- client.json
- Imported media

## Approvals
None — the produced config is validated before any build.

## Failure handling
- Missing required fact → the wizard asks again; it does not fabricate.
- No photos → the config records assets as pending, build hides those sections.

## Known limitations
CLI wizard; not yet in the dashboard UI.

## Examples
**Bayside test:** wizard verified end-to-end (facts → services → media → config).
