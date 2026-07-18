'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY → COMMAND CENTER BRIDGE
   Scans every client config + build output and emits a single
   machine-readable registry (factory/reports/projects.json).
   This is the data contract the Elite Prodigy Command Center
   consumes so each generated website shows up as a managed
   project with status, deployment, analytics, and maintenance.

   Honest by construction: nothing is invented. Live analytics
   and deploy state can't be probed from here, so those fields
   are explicit ("connected:false", "environment:preview").

   CLI: node factory/scripts/projects.js   → writes projects.json
   ══════════════════════════════════════════════════════ */

const { fs, path, CONFIG_DIR, DIST_DIR, FACTORY, log, readJSON } = require('./lib');
const { runPreflight } = require('./preflight');
const { validate } = require('./validate');

function statusFor(slug, config) {
  const built = fs.existsSync(path.join(DIST_DIR, slug, 'index.html'));
  if (!built) {
    // Not built yet — is the config even valid?
    let schemaOk = true;
    try { schemaOk = validate(slug).errors.length === 0; } catch { schemaOk = false; }
    return { label: schemaOk ? 'Draft (not built)' : 'Config incomplete', built: false, reviewReady: false, launchReady: false, reviewBlockers: [], launchBlockers: [] };
  }
  const pf = runPreflight(slug, { config });
  const reviewReady = pf.reviewBlockers.length === 0;
  const launchReady = reviewReady && pf.launchBlockers.length === 0;
  const label = !reviewReady ? 'Needs fixes' : launchReady ? 'Launch-ready' : 'Client review';
  return { label, built: true, reviewReady, launchReady, reviewBlockers: pf.reviewBlockers, launchBlockers: pf.launchBlockers };
}

function lighthouseFor(slug) {
  const p = path.join(FACTORY, 'reports', `lighthouse-${slug}.json`);
  if (!fs.existsSync(p)) return null;
  try { const lh = readJSON(p); return { ...lh.scores, runAt: lh.runAt }; } catch { return null; }
}

function lastBuilt(slug) {
  const idx = path.join(DIST_DIR, slug, 'index.html');
  return fs.existsSync(idx) ? fs.statSync(idx).mtime.toISOString() : null;
}

function buildRegistry() {
  const projects = [];
  const configs = fs.existsSync(CONFIG_DIR)
    ? fs.readdirSync(CONFIG_DIR).filter((f) => f.endsWith('.json') && f !== 'client.example.json')
    : [];

  for (const file of configs) {
    const slug = file.replace(/\.json$/, '');
    let config;
    try { config = readJSON(path.join(CONFIG_DIR, file)); } catch { continue; }

    const status = statusFor(slug, config);
    const purchase = config.purchase || {};
    const deployUrl = (config.seo && config.seo.canonicalUrl) || `https://${slug}.netlify.app/`;
    const isDemo = /\(demo\)/i.test(config.businessName || '') || slug === 'sample-home-services';

    projects.push({
      slug,
      businessName: config.businessName || slug,
      industry: config.industry || '',
      location: config.location || '',
      phone: config.phone || '',
      template: config.template || 'premium-service',
      demo: isDemo,
      status: status.label,
      built: status.built,
      reviewReady: status.reviewReady,
      launchReady: status.launchReady,
      counts: {
        services: Array.isArray(config.services) ? config.services.length : 0,
        pillars: Array.isArray(config.pillars) ? config.pillars.length : 0,
        pendingVerification: Array.isArray(config.pendingVerification) ? config.pendingVerification.length : 0,
      },
      blockers: { review: status.reviewBlockers, launch: status.launchBlockers },
      deployment: {
        environment: 'preview',
        url: deployUrl,
        live: false,
        note: 'Preview only — connect the repo to Netlify to deploy.',
        lastBuilt: lastBuilt(slug),
      },
      analytics: {
        connected: !!(config.analytics && (config.analytics.ga4_id || config.analytics.gtm_id)),
        provider: (config.analytics && config.analytics.ga4_id) ? 'GA4' : null,
        note: 'Add config.analytics.ga4_id to enable analytics.',
      },
      maintenance: {
        plan: (purchase.monthlyPlan && purchase.monthlyPlan > 0) ? `$${purchase.monthlyPlan}/mo` : null,
        formName: (config.contact && config.contact.formName) || `${slug}-contact`,
        notificationDocumented: !!(config.contact && config.contact.notificationDestinationDocumented),
      },
      lighthouse: lighthouseFor(slug),
      contact: { formName: (config.contact && config.contact.formName) || `${slug}-contact`, email: config.email || '' },
    });
  }

  // Deterministic order: real clients first (by name), demos last.
  projects.sort((a, b) => (a.demo - b.demo) || a.businessName.localeCompare(b.businessName));

  return {
    generatedAt: new Date().toISOString(),
    source: 'EP Website Factory',
    count: projects.length,
    summary: {
      total: projects.length,
      launchReady: projects.filter((p) => p.launchReady).length,
      inReview: projects.filter((p) => p.reviewReady && !p.launchReady).length,
      needsWork: projects.filter((p) => !p.reviewReady).length,
    },
    projects,
  };
}

function writeRegistry() {
  const registry = buildRegistry();
  const json = JSON.stringify(registry, null, 2) + '\n';
  const out = path.join(FACTORY, 'reports', 'projects.json'); // canonical contract for the Command Center
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, json);
  const dash = path.join(FACTORY, 'dashboard', 'projects.json'); // bundled copy the dashboard loads
  if (fs.existsSync(path.dirname(dash))) fs.writeFileSync(dash, json);
  return { registry, out };
}

module.exports = { buildRegistry, writeRegistry };

/* ── CLI ── */
if (require.main === module) {
  log.head('EP Factory → Command Center registry');
  const { registry, out } = writeRegistry();
  registry.projects.forEach((p) => log.ok(`${p.businessName.padEnd(28)} ${p.status}${p.demo ? '  (demo)' : ''}`));
  log.info(`${registry.summary.launchReady} launch-ready · ${registry.summary.inReview} in review · ${registry.summary.needsWork} need work`);
  log.ok(`Wrote ${path.relative(path.join(FACTORY, '..'), out)}`);
}
