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

### Settling bets against real scores

Real settlement is built in. A second serverless function
(`netlify/functions/scores.js`) pulls **final scores from ESPN's public
scoreboard** — **no API key needed** — and the front end grades each open bet
against them:

- **Moneyline** — winner by final score (tie → push)
- **Spread** — margin vs. the line, with correct home/away sign and whole-number
  pushes
- **Total** — combined score vs. the line, with pushes
- **Parlays** — any losing leg loses the bet; a pushed leg drops out and the
  payout recomputes on the surviving legs

Behavior by mode:

- **LIVE mode** — the **Settle Bets** button grades open bets against real final
  scores. Games that aren't final yet stay open. Bets also **auto-settle
  silently on page load**, so a returning player just sees their winnings.
- **DEMO mode** — the button reads **Simulate Results** and resolves instantly
  (demo games are in the future and have no real scores).

Grading logic is covered by unit tests for every market and edge case (spread
push, underdog cover, total push, moneyline tie).

**Team-name matching:** the odds feed and the score feed can name teams slightly
differently, so matching normalizes hard and falls back to the team nickname.
ESPN's default scoreboard returns the current slate; pass `?date=YYYYMMDD` to
`scores` for a specific day if you need to backfill older games.

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
