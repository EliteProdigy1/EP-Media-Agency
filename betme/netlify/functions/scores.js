/* ══════════════════════════════════════════════════════════════
   BETME — Final scores proxy (Netlify serverless function)
   Pulls completed game scores so open bets settle against REAL
   results. Uses ESPN's public scoreboard endpoints — no API key
   required — so it works as soon as the site is deployed.

   The front end (app.js) calls /.netlify/functions/scores, matches
   each open bet's legs to a completed result by team name, grades
   the market, and pays out. Games not yet final stay open.

   Optional query: ?date=YYYYMMDD to pull a specific day's slate
   (defaults to ESPN's current scoreboard for each league).
   ══════════════════════════════════════════════════════════════ */

const ESPN = "https://site.api.espn.com/apis/site/v2/sports";

// BETME league key → ESPN sport/league path
const PATHS = {
  NFL:   "football/nfl",
  NBA:   "basketball/nba",
  NCAAF: "football/college-football",
  MLB:   "baseball/mlb",
  NHL:   "hockey/nhl"
};

exports.handler = async function (event) {
  const date = (event.queryStringParameters || {}).date; // optional YYYYMMDD
  const leagues = Object.keys(PATHS);

  try {
    const all = await Promise.all(leagues.map(lg => fetchLeague(lg, date)));
    const results = all.flat().filter(Boolean);
    return json({ results, count: results.length });
  } catch (e) {
    return json({ results: [], error: String(e) });
  }
};

async function fetchLeague(league, date) {
  const url = `${ESPN}/${PATHS[league]}/scoreboard` + (date ? `?dates=${date}` : "");
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events || []).map(ev => normalize(ev, league)).filter(Boolean);
  } catch {
    return [];
  }
}

function normalize(ev, league) {
  const comp = (ev.competitions || [])[0];
  if (!comp) return null;
  const status = comp.status?.type || ev.status?.type || {};
  const home = (comp.competitors || []).find(c => c.homeAway === "home");
  const away = (comp.competitors || []).find(c => c.homeAway === "away");
  if (!home || !away) return null;

  return {
    league,
    home: home.team?.displayName || home.team?.name || "",
    away: away.team?.displayName || away.team?.name || "",
    homeScore: Number(home.score),
    awayScore: Number(away.score),
    completed: !!status.completed,
    state: status.state || "",          // "pre" | "in" | "post"
    commence: ev.date || ""
  };
}

const json = (obj) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=45" },
  body: JSON.stringify(obj)
});
