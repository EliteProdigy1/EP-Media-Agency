/* ══════════════════════════════════════════════════════════════
   BETME — Play-money betting engine
   PLAY MONEY ONLY. No cash in, no cash out, no wagering license
   needed. Coins have no monetary value. Entertainment only.
   ══════════════════════════════════════════════════════════════ */

const BETME = (() => {
  "use strict";

  const START_BALANCE = 10000;
  const LS = {
    balance: "betme_balance",
    open:    "betme_open_bets",
    history: "betme_history",
    name:    "betme_name",
    streak:  "betme_streak"
  };

  let games = [];
  let slip = [];            // pending selections not yet placed
  let activeLeague = "ALL";

  /* ── Storage helpers ─────────────────────────────── */
  const get = (k, def) => {
    try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); }
    catch { return def; }
  };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const balance = () => get(LS.balance, START_BALANCE);
  const setBalance = (v) => set(LS.balance, Math.max(0, Math.round(v)));
  const openBets = () => get(LS.open, []);
  const history  = () => get(LS.history, []);
  const streak   = () => get(LS.streak, 0);
  const playerName = () => get(LS.name, "You");

  /* ── Odds conversion ─────────────────────────────── */
  // Internal odds are decimal. Display as American.
  const toAmerican = (dec) => {
    if (dec >= 2) return "+" + Math.round((dec - 1) * 100);
    return "" + Math.round(-100 / (dec - 1));
  };
  const impliedProb = (dec) => 1 / dec;

  /* ── Data loading: live first, demo fallback ─────── */
  async function loadGames() {
    // Try the Netlify serverless odds proxy (key lives server-side).
    try {
      const res = await fetch("/.netlify/functions/odds", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.games) && data.games.length) {
          setMode("LIVE");
          return data.games;
        }
      }
    } catch { /* offline / no function / no key → demo */ }
    setMode("DEMO");
    return window.BETME_DEMO_GAMES.slice();
  }

  function setMode(mode) {
    const el = document.getElementById("data-mode");
    if (!el) return;
    el.textContent = mode === "LIVE" ? "LIVE ODDS" : "DEMO ODDS";
    el.className = "betme-mode " + (mode === "LIVE" ? "is-live" : "is-demo");
  }

  /* ── Rendering: odds board ───────────────────────── */
  function leagues() {
    const set = new Map();
    games.forEach(g => set.set(g.league, g.leagueLabel));
    return [["ALL", "All Sports"], ...set.entries()];
  }

  function renderLeagueTabs() {
    const wrap = document.getElementById("league-tabs");
    wrap.innerHTML = leagues().map(([id, label]) =>
      `<button class="betme-tab${id === activeLeague ? " is-active" : ""}" data-league="${id}">${label}</button>`
    ).join("");
    wrap.querySelectorAll(".betme-tab").forEach(b =>
      b.onclick = () => { activeLeague = b.dataset.league; renderLeagueTabs(); renderBoard(); });
  }

  function marketButton(gameId, market, pick, label, dec) {
    const key = `${gameId}|${market}|${pick}`;
    const picked = slip.some(s => s.key === key);
    return `<button class="betme-odd${picked ? " is-picked" : ""}"
              data-key="${key}" data-dec="${dec}" data-label="${label}">
              <span class="betme-odd-label">${label}</span>
              <span class="betme-odd-val">${toAmerican(dec)}</span>
            </button>`;
  }

  function renderBoard() {
    const board = document.getElementById("odds-board");
    const list = games.filter(g => activeLeague === "ALL" || g.league === activeLeague);
    if (!list.length) { board.innerHTML = `<p class="betme-empty">No games listed.</p>`; return; }

    board.innerHTML = list.map(g => {
      const t = new Date(g.commence);
      const when = t.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
      const m = g.markets;
      const synthTag = g.synthetic
        ? `<span class="betme-synth" title="No sportsbook posts high-school odds. BETME generates these house lines from records & rankings.">HOUSE LINE</span>`
        : "";
      return `
      <article class="betme-game">
        <header class="betme-game-head">
          <span class="betme-game-league">${g.leagueLabel} ${synthTag}</span>
          <span class="betme-game-time">${when}${g.venue ? " · " + g.venue : ""}</span>
        </header>
        <div class="betme-game-grid">
          <div class="betme-col-team">
            <div class="betme-team">${g.away}</div>
            <div class="betme-team">${g.home}</div>
          </div>
          <div class="betme-col-market">
            <div class="betme-market-label">Spread</div>
            ${marketButton(g.id, "spread", "away", fmtLine(-m.spread.line) , m.spread.away)}
            ${marketButton(g.id, "spread", "home", fmtLine(m.spread.line), m.spread.home)}
          </div>
          <div class="betme-col-market">
            <div class="betme-market-label">Total</div>
            ${marketButton(g.id, "total", "over", "O " + m.total.line, m.total.over)}
            ${marketButton(g.id, "total", "under", "U " + m.total.line, m.total.under)}
          </div>
          <div class="betme-col-market">
            <div class="betme-market-label">Money</div>
            ${marketButton(g.id, "moneyline", "away", "Win", m.moneyline.away)}
            ${marketButton(g.id, "moneyline", "home", "Win", m.moneyline.home)}
          </div>
        </div>
      </article>`;
    }).join("");

    board.querySelectorAll(".betme-odd").forEach(btn =>
      btn.onclick = () => toggleSelection(btn));
  }

  const fmtLine = (n) => (n > 0 ? "+" + n : "" + n);

  /* ── Bet slip ────────────────────────────────────── */
  function toggleSelection(btn) {
    const key = btn.dataset.key;
    const [gameId, market, pick] = key.split("|");
    const game = games.find(g => g.id === gameId);
    const idx = slip.findIndex(s => s.key === key);
    if (idx >= 0) { slip.splice(idx, 1); }
    else {
      // one selection per game (no correlated same-game picks in v1)
      const removeSame = slip.filter(s => s.gameId !== gameId);
      slip = removeSame;
      slip.push({
        key, gameId, market, pick,
        dec: parseFloat(btn.dataset.dec),
        label: btn.dataset.label,
        matchup: `${game.away} @ ${game.home}`,
        leagueLabel: game.leagueLabel,
        synthetic: !!game.synthetic
      });
    }
    renderBoard();
    renderSlip();
  }

  function renderSlip() {
    const wrap = document.getElementById("bet-slip");
    const count = document.getElementById("slip-count");
    count.textContent = slip.length;

    if (!slip.length) {
      wrap.innerHTML = `<p class="betme-slip-empty">Tap an odd to add it to your slip.</p>`;
      document.getElementById("slip-footer").hidden = true;
      return;
    }
    document.getElementById("slip-footer").hidden = false;

    wrap.innerHTML = slip.map(s => `
      <div class="betme-slip-item">
        <button class="betme-slip-x" data-key="${s.key}" aria-label="Remove">×</button>
        <div class="betme-slip-pick">${s.label} <span class="betme-slip-odd">${toAmerican(s.dec)}</span></div>
        <div class="betme-slip-match">${s.matchup}${s.synthetic ? ' <span class="betme-synth-mini">HOUSE</span>' : ''}</div>
      </div>`).join("");

    wrap.querySelectorAll(".betme-slip-x").forEach(b =>
      b.onclick = () => { slip = slip.filter(s => s.key !== b.dataset.key); renderBoard(); renderSlip(); });

    updatePayout();
  }

  // Parlay: multiply decimals. Single: one decimal.
  const combinedDec = () => slip.reduce((acc, s) => acc * s.dec, 1);

  function updatePayout() {
    const stake = Math.max(0, parseInt(document.getElementById("stake").value || "0", 10));
    const dec = combinedDec();
    const payout = Math.round(stake * dec);
    const profit = payout - stake;
    document.getElementById("slip-type").textContent = slip.length > 1 ? `${slip.length}-Leg Parlay` : "Single";
    document.getElementById("slip-odds").textContent = toAmerican(dec);
    document.getElementById("slip-payout").textContent = payout.toLocaleString();
    document.getElementById("slip-profit").textContent = "+" + profit.toLocaleString();
    const place = document.getElementById("place-bet");
    place.disabled = stake <= 0 || stake > balance();
    place.textContent = stake > balance() ? "Not enough coins" : "Place Bet";
  }

  function placeBet() {
    const stake = Math.max(0, parseInt(document.getElementById("stake").value || "0", 10));
    if (stake <= 0 || stake > balance()) return;
    const dec = combinedDec();
    const bet = {
      id: "b" + Date.now(),
      legs: slip.map(s => ({ ...s })),
      stake, dec,
      payout: Math.round(stake * dec),
      placedAt: new Date().toISOString(),
      status: "OPEN"
    };
    setBalance(balance() - stake);
    const open = openBets(); open.unshift(bet); set(LS.open, open);
    slip = [];
    document.getElementById("stake").value = "";
    toast(`Bet placed · ${stake.toLocaleString()} coins to win ${bet.payout.toLocaleString()}`);
    refreshAll();
  }

  /* ── Settlement (demo) ───────────────────────────── */
  // Resolve each open bet leg by implied probability + variance.
  // In LIVE mode this would be replaced by real final scores.
  function simulateResults() {
    const open = openBets();
    if (!open.length) { toast("No open bets to settle."); return; }
    const hist = history();
    let net = 0, wins = 0;

    open.forEach(bet => {
      const won = bet.legs.every(leg => Math.random() < impliedProb(leg.dec) * 0.96);
      bet.status = won ? "WON" : "LOST";
      bet.settledAt = new Date().toISOString();
      if (won) { setBalance(balance() + bet.payout); net += (bet.payout - bet.stake); wins++; }
      else { net -= bet.stake; }
      hist.unshift(bet);
    });

    // streak: count consecutive most-recent wins
    let s = 0; for (const b of hist) { if (b.status === "WON") s++; else break; }
    set(LS.streak, s);
    set(LS.history, hist.slice(0, 100));
    set(LS.open, []);

    toast(`${wins}/${open.length} bets won · net ${net >= 0 ? "+" : ""}${net.toLocaleString()} coins`);
    refreshAll();
  }

  /* ── Open bets + history render ──────────────────── */
  function renderTickets() {
    const openWrap = document.getElementById("open-bets");
    const open = openBets();
    openWrap.innerHTML = open.length ? open.map(ticketHTML).join("")
      : `<p class="betme-slip-empty">No open bets.</p>`;

    const histWrap = document.getElementById("history-list");
    const h = history().slice(0, 12);
    histWrap.innerHTML = h.length ? h.map(ticketHTML).join("")
      : `<p class="betme-slip-empty">Settle some bets to build history.</p>`;
  }

  function ticketHTML(bet) {
    const tag = bet.status === "OPEN" ? "" : bet.status.toLowerCase();
    return `
    <div class="betme-ticket is-${tag || 'open'}">
      <div class="betme-ticket-top">
        <span class="betme-ticket-type">${bet.legs.length > 1 ? bet.legs.length + "-Leg Parlay" : bet.legs[0].label}</span>
        <span class="betme-ticket-status">${bet.status}</span>
      </div>
      ${bet.legs.map(l => `<div class="betme-ticket-leg">${l.label} · ${l.matchup}</div>`).join("")}
      <div class="betme-ticket-foot">
        <span>Stake ${bet.stake.toLocaleString()}</span>
        <span>${bet.status === "WON" ? "Won " + bet.payout.toLocaleString() : "To win " + bet.payout.toLocaleString()}</span>
      </div>
    </div>`;
  }

  /* ── Leaderboard ─────────────────────────────────── */
  function renderLeaderboard() {
    const rows = [...window.BETME_SEED_PLAYERS,
      { name: playerName(), balance: balance(), streak: streak(), you: true }];
    rows.sort((a, b) => b.balance - a.balance);
    const wrap = document.getElementById("leaderboard");
    wrap.innerHTML = rows.map((r, i) => `
      <div class="betme-lb-row${r.you ? " is-you" : ""}">
        <span class="betme-lb-rank">${i + 1}</span>
        <span class="betme-lb-name">${r.name}${r.you ? " (you)" : ""}</span>
        <span class="betme-lb-streak">${r.streak > 0 ? "🔥" + r.streak : ""}</span>
        <span class="betme-lb-coins">${r.balance.toLocaleString()}</span>
      </div>`).join("");
  }

  /* ── HUD (balance / streak) ──────────────────────── */
  function renderHUD() {
    document.getElementById("hud-balance").textContent = balance().toLocaleString();
    const st = streak();
    document.getElementById("hud-streak").textContent = st > 0 ? `🔥 ${st} win streak` : "No streak";
    document.getElementById("open-count").textContent = openBets().length;
  }

  /* ── Utilities ───────────────────────────────────── */
  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  function dailyBonus() {
    const today = new Date().toDateString();
    const last = get("betme_bonus_day", "");
    if (last === today) { toast("Daily bonus already claimed today."); return; }
    set("betme_bonus_day", today);
    setBalance(balance() + 500);
    toast("+500 daily coins claimed!");
    refreshAll();
  }

  function resetAccount() {
    if (!confirm("Reset your BETME account to 10,000 coins and clear all bets?")) return;
    [LS.balance, LS.open, LS.history, LS.streak, "betme_bonus_day"].forEach(k => localStorage.removeItem(k));
    slip = [];
    toast("Account reset to 10,000 coins.");
    refreshAll();
  }

  function refreshAll() {
    renderHUD(); renderBoard(); renderSlip(); renderTickets(); renderLeaderboard();
  }

  /* ── Init ────────────────────────────────────────── */
  async function init() {
    if (balance() === undefined) setBalance(START_BALANCE);
    games = await loadGames();
    renderLeagueTabs();
    refreshAll();

    document.getElementById("stake").addEventListener("input", updatePayout);
    document.querySelectorAll("[data-quick]").forEach(b =>
      b.onclick = () => { document.getElementById("stake").value = b.dataset.quick; updatePayout(); });
    document.getElementById("place-bet").onclick = placeBet;
    document.getElementById("simulate").onclick = simulateResults;
    document.getElementById("daily-bonus").onclick = dailyBonus;
    document.getElementById("reset-acct").onclick = resetAccount;

    // mobile slip toggle
    const slipToggle = document.getElementById("slip-toggle");
    if (slipToggle) slipToggle.onclick = () =>
      document.getElementById("slip-panel").classList.toggle("is-open");
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", BETME.init);
