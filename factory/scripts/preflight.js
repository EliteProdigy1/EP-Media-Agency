'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — PREFLIGHT
   Structural QA on the generated dist/<slug>/index.html.
   Returns blockers (non-zero exit) and warnings. Does NOT
   run Lighthouse — it documents how to. Never claims a check
   passed that did not run.

   CLI:  node factory/scripts/preflight.js <slug>
   API:  const { runPreflight } = require('./preflight');
   ══════════════════════════════════════════════════════ */

const {
  fs, path, DIST_DIR, CONFIG_DIR, log, readJSON, deriveFormName, humanSize,
} = require('./lib');

const OVERSIZE_BYTES = 2.5 * 1024 * 1024;

// Phrases that usually signal fabricated marketing claims — flag for human review.
const FABRICATION_MARKERS = [
  /\b#1\s+(rated|ranked|choice)\b/i, /\baward[- ]winning\b/i, /\bvoted\s+best\b/i,
  /\b5[- ]star\b/i, /\b100%\s+guarantee/i, /\bthousands of (happy )?customers\b/i,
  /\bnumber one\b/i, /\bbest in (town|the state|alabama)\b/i, /\blicensed\s*&\s*insured\b/i,
];
const PLACEHOLDER_MARKERS = [
  /lorem ipsum/i, /\byour business\b/i, /\bplaceholder\b/i, /\bTODO\b/, /\bTBD\b/,
  /example\.com/i, /\bclient name\b/i, /\bindustry name\b/i,
];

function runPreflight(slug, ctx = {}) {
  const outRoot = path.join(DIST_DIR, slug);
  const indexPath = path.join(outRoot, 'index.html');
  const checks = [];
  const add = (name, pass, level, detail, launchOnly) => checks.push({ name, pass, level: level || 'warn', detail: detail || '', launchOnly: !!launchOnly });

  if (!fs.existsSync(indexPath)) {
    add('index.html exists', false, 'blocker', `dist/${slug}/index.html not found`);
    return finalize(checks);
  }
  const html = fs.readFileSync(indexPath, 'utf8');
  const config = ctx.config || safeConfig(slug);

  // ── Head / SEO ──
  add('Has <title>', /<title>[^<]{3,}<\/title>/i.test(html), 'blocker');
  add('Has meta description', /<meta\s+name=["']description["']\s+content=["'][^"']{10,}/i.test(html), 'blocker');
  add('Has canonical or documented default', /<link\s+rel=["']canonical/i.test(html), 'warn',
    /<link\s+rel=["']canonical/i.test(html) ? '' : 'no canonicalUrl in config');
  ['og:title', 'og:description', 'og:image'].forEach((p) => {
    add(`Open Graph ${p}`, new RegExp(`property=["']${p}["']`).test(html), p === 'og:image' ? 'warn' : 'blocker',
      p === 'og:image' && !new RegExp(`property=["']${p}["']`).test(html) ? 'no hero image to use as og:image' : '');
  });
  add('Has JSON-LD LocalBusiness', /application\/ld\+json[\s\S]*?LocalBusiness/i.test(html), 'blocker');

  // ── Headings ──
  const h1s = (html.match(/<h1\b/gi) || []).length;
  add('Exactly one <h1>', h1s === 1, 'blocker', `found ${h1s}`);

  // ── Landmarks / skip link ──
  add('Has <main> landmark', /<main\b/i.test(html), 'blocker');
  add('Has skip-to-content link', /class=["']ep-skip-link["']/.test(html), 'blocker');
  add('Has <header> landmark', /<header\b/i.test(html), 'warn');
  add('Has <footer> landmark', /<footer\b/i.test(html), 'warn');

  // ── Unresolved tokens ──
  const tokens = html.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
  add('No unresolved template tokens', tokens.length === 0, 'blocker', tokens.length ? tokens.join(', ') : '');

  // ── Images / alt ──
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter((t) => !/\salt=/.test(t));
  add('All images have alt', noAlt.length === 0, 'blocker', noAlt.length ? `${noAlt.length} without alt` : '');

  // ── Links ──
  const emptyHash = (html.match(/href=["']#["']/g) || []).length;
  add('No href="#" dead links', emptyHash === 0, 'warn', emptyHash ? `${emptyHash} found` : '');
  const emptyLinks = (html.match(/<a\b[^>]*>\s*<\/a>/gi) || []).length;
  add('No empty links', emptyLinks === 0, 'warn', emptyLinks ? `${emptyLinks} found` : '');

  // ── Duplicate IDs ──
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  add('No duplicate IDs', dupes.length === 0, 'blocker', dupes.length ? [...new Set(dupes)].join(', ') : '');

  // ── Form labels & accessible names ──
  const controls = html.match(/<(input|select|textarea)\b[^>]*>/gi) || [];
  const unlabeled = controls.filter((t) => {
    if (/type=["']hidden["']/.test(t)) return false;
    if (/name=["']bot-field["']/.test(t)) return false; // honeypot wrapped in <label>
    if (/aria-label=/.test(t)) return false;
    const idm = t.match(/\sid=["']([^"']+)["']/);
    if (!idm) return true;
    return !new RegExp(`<label[^>]*for=["']${idm[1]}["']`).test(html);
  });
  add('All form controls labeled', unlabeled.length === 0, 'blocker', unlabeled.length ? `${unlabeled.length} unlabeled` : '');

  const buttons = html.match(/<button\b[^>]*>([\s\S]*?)<\/button>/gi) || [];
  const namelessBtn = buttons.filter((b) => {
    const inner = b.replace(/<[^>]+>/g, '').trim();
    return !inner && !/aria-label=/.test(b);
  });
  add('All buttons have accessible names', namelessBtn.length === 0, 'blocker', namelessBtn.length ? `${namelessBtn.length} nameless` : '');

  // ── Netlify form markup ──
  const formName = ctx.formName || deriveFormName(config || { slug });
  add('Netlify form present', /data-netlify=["']true["']/.test(html) && new RegExp(`value=["']${formName}["']`).test(html), 'blocker');
  add('Form honeypot present', /netlify-honeypot=["']bot-field["']/.test(html), 'warn');

  // ── Duplicate form-name risk across configs ──
  const collision = formNameCollision(slug, formName);
  add('Unique Netlify form name', collision.length === 0, 'blocker',
    collision.length ? `"${formName}" also used by: ${collision.join(', ')}` : '');

  // ── Purchase / intake / notifications — these gate PUBLIC LAUNCH, not client review ──
  const purchase = (config && config.purchase) || {};
  if (purchase.enabled) {
    add('Purchase URL present (purchase enabled)', !!purchase.purchaseUrl, 'blocker',
      purchase.purchaseUrl ? '' : 'purchase.enabled but no purchaseUrl — active purchase button hidden', true);
    add('Intake URL present (purchase enabled)', !!purchase.intakeUrl, 'warn',
      purchase.intakeUrl ? '' : 'no intakeUrl — post-purchase intake CTA hidden', true);
  }
  add('Contact notification destination documented',
    !!(config && config.contact && config.contact.notificationDestinationDocumented === true), 'blocker',
    (config && config.contact && config.contact.notificationDestinationDocumented === true) ? '' : 'confirm the Netlify form email notification before public launch', true);

  // ── Local asset references resolve ──
  const refs = [...html.matchAll(/(?:src|href)=["'](?!https?:|mailto:|tel:|#|data:)([^"']+)["']/g)].map((m) => m[1]);
  const broken = refs.filter((r) => !fs.existsSync(path.join(outRoot, r.split(/[?#]/)[0])));
  add('Local asset references resolve', broken.length === 0, 'blocker', broken.length ? broken.join(', ') : '');

  // ── Oversized images in output ──
  const assetsDir = path.join(outRoot, 'assets');
  let oversized = [];
  if (fs.existsSync(assetsDir)) {
    oversized = fs.readdirSync(assetsDir)
      .map((f) => ({ f, size: fs.statSync(path.join(assetsDir, f)).size }))
      .filter((x) => x.size > OVERSIZE_BYTES);
  }
  add('No oversized images (>2.5MB)', oversized.length === 0, 'warn',
    oversized.length ? oversized.map((x) => `${x.f} ${humanSize(x.size)}`).join(', ') : '');

  // ── robots / sitemap ──
  add('robots.txt present', fs.existsSync(path.join(outRoot, 'robots.txt')), 'blocker');
  add('sitemap.xml present', fs.existsSync(path.join(outRoot, 'sitemap.xml')), 'blocker');
  add('404.html present', fs.existsSync(path.join(outRoot, '404.html')), 'warn');

  // ── Placeholder / fabrication markers ──
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '); // strip tags → visible text only (attributes like placeholder="" are not content)
  const ph = PLACEHOLDER_MARKERS.filter((r) => r.test(bodyText));
  add('No placeholder text', ph.length === 0, 'blocker', ph.length ? `matched ${ph.length} placeholder pattern(s)` : '');
  const fab = FABRICATION_MARKERS.filter((r) => r.test(bodyText));
  add('No fabricated-claim markers', fab.length === 0, 'warn',
    fab.length ? `review these claims for verifiability: ${fab.map((r) => r.source).join(' | ')}` : '');

  return finalize(checks);
}

function finalize(checks) {
  const fmt = (c) => `${c.name}${c.detail ? ` (${c.detail})` : ''}`;
  const failedBlockers = checks.filter((c) => !c.pass && c.level === 'blocker');
  const blockers = failedBlockers.map(fmt);
  // Review blockers stop even a client preview; launch blockers only stop PUBLIC launch.
  const reviewBlockers = failedBlockers.filter((c) => !c.launchOnly).map(fmt);
  const launchBlockers = checks.filter((c) => !c.pass && c.launchOnly).map(fmt);
  const warnings = checks.filter((c) => !c.pass && c.level === 'warn' && !c.launchOnly).map(fmt);
  return { checks, blockers, reviewBlockers, launchBlockers, warnings, passCount: checks.filter((c) => c.pass).length };
}

function safeConfig(slug) {
  try { return readJSON(path.join(CONFIG_DIR, `${slug}.json`)); } catch { return { slug }; }
}

function formNameCollision(slug, formName) {
  if (!fs.existsSync(CONFIG_DIR)) return [];
  const hits = [];
  fs.readdirSync(CONFIG_DIR).filter((f) => f.endsWith('.json') && f !== 'client.example.json').forEach((f) => {
    const otherSlug = f.replace(/\.json$/, '');
    if (otherSlug === slug) return;
    try {
      const other = readJSON(path.join(CONFIG_DIR, f));
      if (deriveFormName(other) === formName) hits.push(otherSlug);
    } catch { /* ignore malformed */ }
  });
  return hits;
}

module.exports = { runPreflight };

/* ── CLI ── */
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { log.err('Usage: node factory/scripts/preflight.js <slug>'); process.exit(2); }
  log.head(`Preflight — ${slug}`);
  const pf = runPreflight(slug);
  pf.checks.forEach((c) => {
    const tag = c.launchOnly ? ' [launch]' : '';
    const icon = c.pass ? '✓' : (c.level === 'blocker' ? '✗' : '⚠');
    const line = `${icon} ${c.name}${tag}${c.detail ? ` — ${c.detail}` : ''}`;
    c.pass ? log.ok(line) : (c.level === 'blocker' && !c.launchOnly ? log.err(line) : log.warn(line));
  });
  log.head(`${pf.passCount}/${pf.checks.length} passed · ${pf.reviewBlockers.length} review blocker(s) · ${pf.launchBlockers.length} launch-only item(s) · ${pf.warnings.length} warning(s)`);
  process.exit(pf.reviewBlockers.length ? 1 : 0);
}
