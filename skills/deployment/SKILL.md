# Deployment

**id:** `deployment` · **category:** Deployment · **status:** Ready · **v1.0.0**

## Purpose
Package a build for Netlify Drop, or ship via GitHub→Netlify auto-deploy.

## When to use
- A build is approved and needs a disposable preview (Netlify Drop) or a public deploy.
- Shipping via the GitHub→Netlify auto-deploy on push.

## When NOT to use
- Never deploy publicly without an approve-for-launch decision.
- Not for creating new permanent Netlify sites during review.

## Required inputs
- dist/<slug>

## Workflow
1. Confirm the build is READY and launch blockers are cleared (or it is a disposable review preview).
2. For review: zip dist/<slug> for Netlify Drop.
3. For launch: push to the deploy branch and let GitHub→Netlify build.
4. Return the preview/site URL.

## Tools / connectors
GitHub (CONNECTED) · Netlify (MANUAL). Required: Netlify · Optional: GitHub.

## Outputs
- Preview URL
- Netlify site

## Approvals
Approve-for-launch required before any public deployment.

## Failure handling
- Launch blockers present → stop; only a disposable review preview is allowed.
- Netlify connector is MANUAL → the human performs the Drop; never claim an auto-deploy that did not run.

## Known limitations
Netlify Drop is manual; per-client auto-deploy is planned.

## Examples
**H&M Services:** disposable Netlify Drop review package; public deploy held for approval.
