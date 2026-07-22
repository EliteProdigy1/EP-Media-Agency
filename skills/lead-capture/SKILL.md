# Website Lead Capture

**id:** `lead-capture` · **category:** Client Management · **status:** Connected · **v1.0.0**

## Purpose
Capture inbound quote-form submissions from client sites and route them to the inbox.

## When to use
- Every client site build — wire the Netlify contact form to email notifications.
- Confirming inbound submissions reach the inbox.

## When NOT to use
- Not a CRM — routing only, until the unified inbox stage.
- Not for outbound messaging.

## Required inputs
- Website form

## Workflow
1. Ensure the site ships the Netlify contact form with a unique form name (<slug>-contact).
2. Confirm form notifications point to the client (or EP) inbox.
3. Verify a test submission lands.
4. Hand ongoing monitoring to maintenance.

## Tools / connectors
Netlify Forms (CONNECTED) · Gmail (CONNECTED). Required: Netlify Forms · Optional: Gmail.

## Outputs
- Lead notification

## Approvals
None — inbound capture is passive.

## Failure handling
- Duplicate form name → preflight blocks it; assign a unique <slug>-contact.
- Notification email not set → flagged as a launch blocker, not silently ignored.

## Known limitations
Netlify Forms only; unified inbox is a later stage.

## Examples
Live on client sites: Netlify form submissions route to eliteprodigyway@gmail.com.
