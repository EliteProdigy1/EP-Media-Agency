/* ══════════════════════════════════════════════════════════════
   BETME — Live odds proxy (Netlify serverless function)
   Keeps your API key OFF the browser. The front-end calls
   /.netlify/functions/odds ; this reads ODDS_API_KEY from the
   environment and returns games normalized to BETME's shape.

   SETUP:
     1. Get a free key at https://the-odds-api.com  (500 req/mo)
     2. In Netlify → Site settings → Environment variables, add:
          ODDS_API_KEY = your_key_here
     3. (optional) ODDS_SPORTS = comma list of sport keys
        default: americanfootball_nfl,basketball_nba,americanfootball_ncaaf
   Without a key set, this returns {games:[]} and the site falls
   back to demo data automatically — nothing breaks.
   ══════════════════════════════════════════════════════════════ */

const API = "https://api.the-odds-api.com/v4";

const LEAGUE_MAP = {
  americanfootball_nfl:   { league: "NFL",    label: "NFL" },
  basketball_nba:         { league: "NBA",    label: "NBA" },
  americanfootball_ncaaf: { league: "NCAAF",  label: "College FB" },
  baseball_mlb:           { league: "MLB",    label: "MLB" },
  icehockey_nhl:          { league: "NHL",    label: "NHL" }
};

exports.handler = async function () {
  const key = process.env.ODDS_API_KEY;
  if (!key) return json({ games: [], mode: "demo", reason: "no ODDS_API_KEY set" });

  const sports = (process.env.ODDS_SPORTS ||
    "americanfootball_nfl,basketball_nba,americanfootball_ncaaf")
    .split(",").map(s => s.trim()).filter(Boolean);

  try {
    const results = await Promise.all(sports.map(sport =>
      fetch(`${API}/sports/${sport}/odds/?apiKey=${key}` +
            `&regions=us&markets=h2h,spreads,totals&oddsFormat=decimal`)
        .then(r => r.ok ? r.json() : [])
        .then(arr => Array.isArray(arr) ? arr.map(g => normalize(g, sport)) : [])
        .catch(() => [])
    ));
    const games = results.flat().filter(Boolean);
    return json({ games, mode: "live", count: games.length });
  } catch (e) {
    return json({ games: [], mode: "demo", reason: String(e) });
  }
};

/* Convert The Odds API event → BETME game shape.
   Note: real HS football is not covered by any odds provider; those
   remain house-generated on the front end (demo-data.js). */
function normalize(ev, sport) {
  const meta = LEAGUE_MAP[sport] || { league: sport, label: sport };
  const book = (ev.bookmakers || [])[0];
  if (!book) return null;

  const mkt = (k) => (book.markets || []).find(m => m.key === k);
  const h2h = mkt("h2h"), spreads = mkt("spreads"), totals = mkt("totals");
  const price = (m, name) => (m?.outcomes || []).find(o => o.name === name);

  const home = ev.home_team, away = ev.away_team;
  const mlH = price(h2h, home), mlA = price(h2h, away);
  const spH = price(spreads, home), spA = price(spreads, away);
  const ov = price(totals, "Over"), un = price(totals, "Under");
  if (!mlH || !mlA) return null;

  return {
    id: ev.id,
    league: meta.league, leagueLabel: meta.label,
    home, away, commence: ev.commence_time, synthetic: false,
    markets: {
      moneyline: { home: mlH.price, away: mlA.price },
      spread: {
        line: spH?.point ?? 0,
        home: spH?.price ?? 1.91, away: spA?.price ?? 1.91
      },
      total: {
        line: ov?.point ?? 0,
        over: ov?.price ?? 1.91, under: un?.price ?? 1.91
      }
    }
  };
}

const json = (obj) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  body: JSON.stringify(obj)
});
