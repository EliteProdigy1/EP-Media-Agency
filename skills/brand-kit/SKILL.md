# Brand Kit & Color Mapping

**id:** `brand-kit` · **category:** Media & Creative · **status:** Ready · **v1.0.0**

## Purpose
Map a client palette onto EP design tokens without forking the token system.

## When to use
- A client palette must drive a build while keeping the EP cinematic system intact.
- You need a theme color + override CSS variables from a couple of brand hex values.

## When NOT to use
- Never to redefine the EP token architecture or hand-fork tokens per client.
- Not for full art direction — that is Media Generation.

## Required inputs
- Primary/accent hex
- Style notes

## Workflow
1. Take the client primary/accent hex + any style notes.
2. Map them onto the existing EP token variables (never replace the token file).
3. Emit a small brand-override CSS block + a single theme color for meta.
4. Hand the overrides to the website build.

## Tools / connectors
EP Website Factory (AVAILABLE). Required: EP Website Factory.

## Outputs
- Brand override CSS
- Theme color

## Approvals
None — brand overrides are reviewed as part of the build.

## Failure handling
- Illegible contrast (e.g. gold on gold) → adjust or flag; never ship low-contrast text.
- No usable brand color → fall back to the EP house palette and say so.

## Known limitations
Maps onto EP tokens — will not fork the token system.

## Examples
**H&M Services:** mapped construction gold `#B88A32` onto EP tokens; no token fork.
