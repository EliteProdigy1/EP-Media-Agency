# Deployment — Clay Retreat

| Field | Value |
|-------|-------|
| GitHub Repo | EliteProdigy1/Clay-Retreat |
| Branch | main |
| Publish Directory | `.` |
| Netlify URL | https://clayretreat.netlify.app |
| Custom Domain | TBD |
| Form Name | clay-retreat-contact |
| Form Notifications | eliteprodigyway@gmail.com (set up in Netlify dashboard) |

## Netlify Reconnect Steps (PENDING)

The Netlify site `clayretreat` was previously connected to the main EP repo.
It must be reconnected to the new standalone repo:

1. Netlify → clayretreat → Deploy settings
2. Link to a different repository → EliteProdigy1/Clay-Retreat
3. Branch: main · Publish dir: `.` · No build command
4. Trigger deploy
5. Confirm green deploy
6. Set up form notification email

## Security Headers

✅ Confirmed in `netlify.toml`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Permissions-Policy
- Asset cache: immutable on /assets/*
