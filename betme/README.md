# BETME — Play-Money Sports Picks

A free, **play-money** sports prediction game. Users start with 10,000 virtual
coins, back picks on real matchups (NFL, NBA, College FB, and **Alabama high-school
football**), build streaks, and climb a leaderboard. **No real money** — no cash in,
no cash out, no wagering license required. Entertainment only, 18+.

> Original work. Not a copy of any existing site. Styled with the Elite Prodigy
> (EPSG) dark/gold token system so it matches the rest of the factory.

## Run it locally

It's a static site — just open `index.html` in a browser. It ships with realistic
**demo games** (in `js/demo-data.js`) so everything is clickable with zero setup.

Or serve it:

```bash
cd betme
npx serve .        # or: python3 -m http.server 8080
```

## What works out of the box (demo mode)

- Odds board with spread / total / moneyline for each game
- Bet slip → single bets **and** parlays (odds multiply), coin stake, live payout
- Place bets (deducts coins), **Simulate Results** to settle them
- Coin balance, win streaks, daily +500 bonus (all saved in the browser)
- Leaderboard (you vs. seeded regulars) and recent-results history
- Alabama HS football as its own league with **house-generated lines**

Everything persists per-browser via `localStorage`. "Reset my account" (footer)
wipes it back to 10,000 coins.

## Going live with real odds

BETME reads real lines through a serverless proxy so **your API key never touches
the browser**.

1. **Get a free key** at <https://the-odds-api.com> — the free plan is 500
   requests/month, plenty for launch. The key arrives by email instantly.
2. **Deploy to Netlify** (drag-and-drop the `betme/` folder, or connect the repo).
3. In **Netlify → Site settings → Environment variables**, add:
   - `ODDS_API_KEY` = your key
   - *(optional)* `ODDS_SPORTS` = comma list of sport keys
     (default: `americanfootball_nfl,basketball_nba,americanfootball_ncaaf`)
4. Redeploy. The top-bar badge flips from **DEMO ODDS** to **LIVE ODDS**
   automatically when the function returns games.

If the key is missing or the API is unreachable, the site **falls back to demo
data** — it never breaks.

### Settling live bets

Demo mode uses the **Simulate Results** button. For production you'd settle bets
against real final scores — wire a second function to a scores source
(API-Sports at <https://api-sports.io>, or ESPN's public scoreboard endpoints,
no key) and replace the `simulateResults()` path in `js/app.js`. Left as the
next step so v1 ships now.

## Alabama high-school football — important

**No sportsbook posts odds on high-school games**, and MaxPreps has **no public
API** (scraping it violates their terms). So HS games in BETME carry
**house-generated lines** — flagged `synthetic:true` in the data and labeled
**"HOUSE LINE"** in the UI. Schedules/scores for real HS games would come from
manual entry or ScoreStream's API; the synthetic odds are BETME's own.

## Files

```
betme/
  index.html               app shell (hero + board + slip + leaderboard)
  styles.css               EPSG dark/gold styling (tokens copied, not forked)
  js/
    demo-data.js           sample games + seed leaderboard (embedded, no fetch)
    app.js                 play-money engine (odds, slip, settle, storage)
  netlify/functions/
    odds.js                live-odds proxy (reads ODDS_API_KEY server-side)
  netlify.toml             deploy + security headers
```

## Compliance notes (keep these)

- Virtual coins have **no monetary value** and cannot be purchased or redeemed.
- No payment integration exists and none should be added without proper licensing.
- Keep the **PLAY MONEY / entertainment-only / 18+** disclaimers in the footer
  and hero — they're what keep this a game and not gambling.
