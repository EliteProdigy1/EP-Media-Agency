/* ══════════════════════════════════════════════════════════════
   BETME — Demo data
   Realistic sample games so the site is fully clickable with NO
   API key. When a live odds key is configured (Netlify function),
   app.js replaces these at runtime. Nothing here is a real line.
   ══════════════════════════════════════════════════════════════ */

// Decimal odds are the internal format. Payout = stake * decimal.
// American odds are shown in the UI (converted in app.js).

window.BETME_DEMO_GAMES = [
  // ── NFL ─────────────────────────────────────────────
  {
    id: "nfl-1", league: "NFL", leagueLabel: "NFL",
    home: "Kansas City Chiefs", away: "Buffalo Bills",
    commence: hoursFromNow(6), synthetic: false,
    markets: {
      moneyline: { home: 1.65, away: 2.35 },
      spread:    { line: -3.5, home: 1.91, away: 1.91 },
      total:     { line: 48.5, over: 1.91, under: 1.91 }
    }
  },
  {
    id: "nfl-2", league: "NFL", leagueLabel: "NFL",
    home: "San Francisco 49ers", away: "Dallas Cowboys",
    commence: hoursFromNow(28), synthetic: false,
    markets: {
      moneyline: { home: 1.50, away: 2.70 },
      spread:    { line: -5.5, home: 1.91, away: 1.91 },
      total:     { line: 45.5, over: 1.87, under: 1.95 }
    }
  },
  // ── NBA ─────────────────────────────────────────────
  {
    id: "nba-1", league: "NBA", leagueLabel: "NBA",
    home: "Boston Celtics", away: "Denver Nuggets",
    commence: hoursFromNow(3), synthetic: false,
    markets: {
      moneyline: { home: 1.55, away: 2.55 },
      spread:    { line: -4.5, home: 1.91, away: 1.91 },
      total:     { line: 224.5, over: 1.91, under: 1.91 }
    }
  },
  {
    id: "nba-2", league: "NBA", leagueLabel: "NBA",
    home: "Los Angeles Lakers", away: "Golden State Warriors",
    commence: hoursFromNow(30), synthetic: false,
    markets: {
      moneyline: { home: 2.10, away: 1.75 },
      spread:    { line: 2.5, home: 1.91, away: 1.91 },
      total:     { line: 231.5, over: 1.91, under: 1.91 }
    }
  },
  // ── College Football ────────────────────────────────
  {
    id: "cfb-1", league: "NCAAF", leagueLabel: "College FB",
    home: "Alabama Crimson Tide", away: "Georgia Bulldogs",
    commence: hoursFromNow(50), synthetic: false,
    markets: {
      moneyline: { home: 1.80, away: 2.05 },
      spread:    { line: -2.5, home: 1.91, away: 1.91 },
      total:     { line: 52.5, over: 1.91, under: 1.91 }
    }
  },
  // ── Alabama High School Football (HOUSE-GENERATED lines) ──
  // No sportsbook posts HS odds, so BETME generates its own from
  // records/rankings. Flagged synthetic:true and labeled in the UI.
  {
    id: "alhs-1", league: "AL-HS", leagueLabel: "AL HS FB",
    home: "Thompson Warriors", away: "Central-Phenix City Red Devils",
    commence: hoursFromNow(20), synthetic: true, venue: "Alabaster, AL",
    markets: {
      moneyline: { home: 1.72, away: 2.15 },
      spread:    { line: -3.5, home: 1.91, away: 1.91 },
      total:     { line: 45.5, over: 1.91, under: 1.91 }
    }
  },
  {
    id: "alhs-2", league: "AL-HS", leagueLabel: "AL HS FB",
    home: "Hoover Buccaneers", away: "Auburn Tigers",
    commence: hoursFromNow(21), synthetic: true, venue: "Hoover, AL",
    markets: {
      moneyline: { home: 1.60, away: 2.40 },
      spread:    { line: -6.5, home: 1.91, away: 1.91 },
      total:     { line: 48.5, over: 1.91, under: 1.91 }
    }
  },
  {
    id: "alhs-3", league: "AL-HS", leagueLabel: "AL HS FB",
    home: "Saraland Spartans", away: "Pinson Valley Indians",
    commence: hoursFromNow(44), synthetic: true, venue: "Saraland, AL",
    markets: {
      moneyline: { home: 2.00, away: 1.82 },
      spread:    { line: 1.5, home: 1.91, away: 1.91 },
      total:     { line: 51.5, over: 1.91, under: 1.91 }
    }
  }
];

// Seed leaderboard "regulars" (fictional bots) so a new player isn't alone.
window.BETME_SEED_PLAYERS = [
  { name: "GulfCoastGambler", balance: 18420, streak: 4 },
  { name: "BamaLockGod",      balance: 15230, streak: 2 },
  { name: "TideRoller99",     balance: 13675, streak: 0 },
  { name: "ParlayQueen",      balance: 12110, streak: 1 },
  { name: "UnderdogUncle",    balance:  9880, streak: 0 },
  { name: "MobileMoneyline",  balance:  8540, streak: 0 }
];

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}
