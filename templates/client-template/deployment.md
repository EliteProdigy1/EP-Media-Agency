# Deployment — [CLIENT NAME]

---

## Repository

**GitHub Org:** EliteProdigy1
**Repo Name:** [repo-name]
**Repo URL:** https://github.com/EliteProdigy1/[repo-name]
**Branch:** main
**Publish Directory:** `.` (root, no build step)
**Build Command:** (none)

---

## Netlify

**Site Name:** [name].netlify.app
**Live URL:** https://[name].netlify.app
**Custom Domain:** [domain.com] (if applicable)
**Form Name:** `[client-slug]-contact`
**Form Notifications:** eliteprodigyway@gmail.com

### Netlify Setup Checklist

- [ ] Repo linked to Netlify
- [ ] Branch set to `main`
- [ ] Publish directory set to `.`
- [ ] Deploy triggered and green
- [ ] Forms → notifications set up
- [ ] Custom domain added (if applicable)
- [ ] DNS pointed to Netlify (if applicable)
- [ ] HTTPS confirmed active

---

## Security Headers (netlify.toml)

Confirm these are in the `netlify.toml`:
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Strict-Transport-Security`
- [ ] `Permissions-Policy`
- [ ] Asset cache headers (`/assets/*`)

---

## Domain

**Registrar:**
**Current DNS host:**
**Nameservers pointed to Netlify:** ⬜ Yes / ⬜ No / ⬜ N/A
**SSL active:** ⬜ Yes / ⬜ Pending

---

## Go-Live Checklist

- [ ] All pages tested on desktop Chrome
- [ ] All pages tested on mobile Safari
- [ ] Contact form tested (submission received)
- [ ] All images loading (no 404s)
- [ ] Video autoplay working (mobile fallback confirmed)
- [ ] Meta description correct
- [ ] OG image set
- [ ] Canonical URL correct
- [ ] Google Business profile updated with new URL
- [ ] Client notified of launch

---

## Launch Date

**Soft launch (Netlify URL):**
**Hard launch (custom domain):**
**Client sign-off date:**

---

## Post-Launch

**Monthly maintenance plan:** ⬜ Yes ($100/mo) / ⬜ No
**Next scheduled update:**
**Who manages updates:** Jonathan / EP Media / Client self-manages
