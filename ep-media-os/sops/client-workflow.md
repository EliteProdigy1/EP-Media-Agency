# EP MEDIA — CLIENT WORKFLOW SOP
*Standard Operating Procedure. Every client. Every time.*

---

## STAGE 1 — LEAD INTAKE

### Sources
- Netlify form submission (agency-inquiry.html or brand-inquiry.html)
- Direct DM on @eliteprodigy_sg
- Referral / word of mouth
- Walk-in / in-person

### Response rule: **within 24 hours, always**

**First response template (text/DM):**
> Hey [Name] — this is Jonathan with EP Media. Thanks for reaching out! I saw your inquiry about [service]. I'd love to connect and learn more about your project. Are you available for a quick 15-minute call this week?

**Information to capture at intake:**
- Business name
- Owner name + contact
- Industry / type of business
- What they need (website, brand, both)
- Budget range (if they mention it — don't ask first)
- Timeline / urgency
- Existing website? (yes/no/URL)
- Social media presence? (@handle)
- Location (city/state)

---

## STAGE 2 — DISCOVERY CALL

**Duration:** 15–30 minutes

**Agenda:**
1. Introduce yourself and EP briefly (2 min)
2. Ask about their business — let them talk (8 min)
3. Ask about their problem — what's not working? (5 min)
4. Share how EP solves it — briefly (5 min)
5. Next steps: "I'll send you a proposal by [date]" (2 min)

**Questions to ask:**
- "Tell me about your business. What do you do and who are your customers?"
- "What made you reach out to us specifically?"
- "What do you feel is missing or not working right now?"
- "If we could build you exactly what you need, what would that look like?"
- "Do you have existing photos or videos we could use? Or would you need us to create those?"
- "What's your timeline — when would you want this live?"
- "Have you worked with a web or branding company before?"

**Do NOT ask about budget on the first call. Let them tell you or wait for the proposal response.**

---

## STAGE 3 — PROPOSAL

**Send within 24–48 hours of discovery call.**

**Proposal format (simple, clear):**
```
[Date]
For: [Business Name] — [Owner Name]

EP MEDIA — PROJECT PROPOSAL

WHAT WE BUILD FOR YOU:
• [Deliverable 1]
• [Deliverable 2]
• [Deliverable 3]

INVESTMENT:
  Starter / Premium / Signature (match to their scope)
  Starting at: [contact-driven — confirm on call]

TIMELINE:
  Deposit paid → project starts within [X] business days
  Draft delivered: [X] days after start
  Launch: [X] days after approval

TO BEGIN:
  50% deposit via Venmo (@eliteprodigy) or Cash App ($ELITEPRODIGYLLC)
  
  Questions? Reply to this message or call/text: 251.223.0812

We're excited to build this with you.
— Jonathan Walton, EP Media
```

---

## STAGE 4 — DEPOSIT

**When client says yes:**
1. Confirm scope in writing (text or email recap)
2. Request 50% deposit
   - Venmo: @eliteprodigy
   - Cash App: $ELITEPRODIGYLLC
3. Do NOT start work before deposit is received
4. Acknowledge receipt: "Got it! We're officially on the schedule. I'll be in touch with next steps."

**Deposit amounts (guide — adjust per scope):**
| Package          | Deposit         |
|------------------|-----------------|
| Starter Website  | 50% of total    |
| Premium Website  | 50% of total    |
| Signature        | 50% of total    |
| Brand Package    | 50% of total    |

---

## STAGE 5 — ASSET COLLECTION

**After deposit, send asset checklist:**

```
Hi [Name] — we're ready to start!

To build your site, we need:

REQUIRED:
□ Your logo (SVG, PNG with transparent background preferred)
□ 5–10 photos of your business, team, or work
□ Any videos you already have
□ Your business description (even a paragraph is fine)
□ List of services / programs you offer
□ Contact info to display publicly

OPTIONAL BUT HELPFUL:
□ Brand colors (hex codes if you have them)
□ Fonts or other brand materials
□ Competitor sites you like the look of
□ Google Business Profile link
□ Social media handles

Please send to: eliteprodigyway@gmail.com

If you don't have certain items, that's fine — 
we'll work with what you have or we can create what's missing.
```

---

## STAGE 6 — PRODUCTION (EP INTERNAL)

### Step 1: Config setup (Day 1)
- Duplicate `ep-media-os/config/project-config.json`
- Fill in all client fields
- Create `/config/[client]-theme.css` with brand colors

### Step 2: Template selection (Day 1)
- Choose industry template: `ep-media-os/templates/[industry].html`
- Copy to client project folder
- Wire up CSS variable overrides

### Step 3: Hero asset production (Day 1–2)
- Use Higgsfield or client assets to generate hero video/image
- Target size: under 8MB for video, under 500KB for image (WebP)
- Generate poster image at same first frame

### Step 4: Content population (Day 2–3)
- Replace all `{{PLACEHOLDER}}` tokens with client content
- Write or refine: headlines, section copy, CTA labels
- Populate gallery images (compress to WebP)

### Step 5: Forms setup (Day 3)
- Name Netlify forms per config: `[client]-[purpose]`
- Configure email notifications in Netlify dashboard
- Test each form submission

### Step 6: SEO + Performance (Day 3)
- Set canonical, OG tags, favicon
- Compress all images (target < 200KB each)
- Compress video if needed (FFmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow output.mp4`)

### Step 7: Deploy preview (Day 3)
- Push to Netlify branch
- Send preview URL to client
- "Here's your draft site: [URL]. Let me know what you'd like adjusted."

---

## STAGE 7 — CLIENT REVIEW

**Send preview with clear instruction:**
> "Here's your draft! Please review and give me your feedback on:
> 1. Any text changes
> 2. Any photo swaps
> 3. Overall look and feel
> 
> You have one round of revisions included. I'll make changes within 24 hours of your feedback."

**Hold firm on one revision round. Extras = additional cost.**

---

## STAGE 8 — REVISIONS

- Implement feedback within 24 hours
- Prioritize: text changes → image swaps → layout tweaks
- If client requests something outside original scope: "Happy to add that — it'll be an additional [price]."
- After revisions: "Revisions are complete. Everything look good to go live?"

---

## STAGE 9 — LAUNCH

**Pre-launch checklist:**
- [ ] All forms tested and receiving submissions
- [ ] All links working
- [ ] Mobile view tested (iOS Safari + Chrome Android)
- [ ] Images compressed
- [ ] Canonical + OG tags correct
- [ ] Favicon present
- [ ] 404 page configured
- [ ] Security headers active

**Go live:**
1. Connect custom domain in Netlify
2. DNS records updated (A record + CNAME)
3. SSL certificate auto-issued (Netlify handles this)
4. Push to main/production branch
5. Verify live at custom domain

**Launch message to client:**
> "Your site is live at [domain]! 🎉 Here are your login details for [Netlify account if applicable].
> 
> Please bookmark your Netlify dashboard at app.netlify.com to see form submissions.
> 
> Want me to help you get set up on Google Search Console and Google Analytics? It's a 15-minute setup and it'll track all your traffic."

---

## STAGE 10 — HANDOFF + UPSELL

**Send final handoff doc:**
- Live URL
- Netlify dashboard instructions
- Form submission walkthrough
- Google Search Console setup instructions
- How to check site traffic

**Always offer Monthly Growth at handoff:**
> "Now that your site is live, the next step is keeping it updated and getting more visitors. We offer a Monthly Growth plan — I handle updates, Google optimizations, and keep everything running. Would you like to hear about that?"

**Monthly plan pitch:**
- Monthly Growth ($100/mo): 1 update/month, hosting support, monthly check-in
- Premium Growth ($250/mo): Unlimited updates, SEO reporting, priority response

---

## STAGE 11 — MAINTENANCE

**Monthly checklist (Growth Plan clients):**
- [ ] Check Netlify form submissions — notify client of any
- [ ] Verify site is live and loading correctly
- [ ] Implement any requested update from client
- [ ] Check Google Analytics (if GA4 installed)
- [ ] Send monthly summary: "Site is healthy. X visitors this month."

---

## TIMELINE BENCHMARKS

| Phase                  | Target Time      |
|------------------------|------------------|
| Lead response          | < 24 hours       |
| Discovery → Proposal   | 24–48 hours      |
| Proposal → Deposit     | 1–3 days (client)|
| Deposit → Draft        | 3–5 business days|
| Draft → Revisions      | 24 hours         |
| Revisions → Launch     | 24 hours         |
| **Total Project Time** | **1–2 weeks**    |

Goal: reduce total time below 5 business days for Starter tier.
