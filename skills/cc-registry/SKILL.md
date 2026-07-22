# Command Center Registry

**id:** `cc-registry` · **category:** Operations · **status:** Ready · **v1.0.0**

## Purpose
Emit projects.json so every generated site appears as a managed project (status, deploy, analytics, maintenance).

## When to use
- After builds, to publish the honest projects.json the Command Center consumes.
- To refresh the managed-projects dashboard feed.

## When NOT to use
- Never to fabricate analytics or deployment state — unwired sources read as preview.
- Not a place to edit client configs.

## Required inputs
- config/*.json
- build output

## Workflow
1. Scan every config/*.json and its build output.
2. Emit factory/reports/projects.json (status, deployment, analytics, maintenance).
3. Mark live analytics/deploy state connected:false / environment:preview until wired.
4. Feed the dashboard.

## Tools / connectors
EP Website Factory (AVAILABLE). Required: EP Website Factory.

## Outputs
- projects.json
- Dashboard feed

## Approvals
None — a read-only data contract.

## Failure handling
- No build output for a config → project shows as not-yet-built, not fabricated live.
- No real integration → analytics read preview, never faked numbers.

## Known limitations
Reads build output; live analytics/deploy state read as preview until wired.

## Examples
Phase 2 bridge: projects.json emitted as the Command Center data contract.
