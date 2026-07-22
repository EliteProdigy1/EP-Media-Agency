# Review Request Automation

**id:** `review-automation` · **category:** Client Management · **status:** Planned · **v0.1.0**

## Purpose
After a completed job, request a rating and direct satisfied customers to Google Business.

## When to use
- (Planned) After a completed job, to request a rating with client opt-in.
- Routing satisfied customers toward a Google Business review.

## When NOT to use
- Not until Gmail + Google Business are connected and the client has opted in.
- Never message customers without explicit client opt-in.

## Required inputs
- Completed job

## Workflow
1. (Planned) Detect a completed job.
2. With client opt-in, send a review request via Gmail.
3. Direct satisfied customers to the client's Google Business review link.
4. Record the outcome.

## Tools / connectors
Gmail (READY TO CONNECT) · Google Business (PLANNED). Required: Gmail · Optional: Google Business.

## Outputs
- Review request
- Google review

## Approvals
Client opt-in required before any automated messaging.

## Failure handling
- Gmail not connected → the skill cannot run; it stays Planned, no messages sent.
- No opt-in → do not message; this is a hard stop.

## Known limitations
Planned — needs Gmail + Google Business connections.

## Examples
Planned — no automated messages sent yet; spec defined and awaiting connectors.
