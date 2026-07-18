'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — VALIDATE
   Validates config/<slug>.json against the client schema and
   the factory's business rules. Never invents data — only
   reports what is missing.

   CLI:  node factory/scripts/validate.js <slug>
   API:  const { validate } = require('./validate'); validate(slug)
   ══════════════════════════════════════════════════════ */

const {
  fs, path, FACTORY, ASSETS_DIR, log, readJSON,
  loadClientConfig, validateAgainstSchema, deriveFormName,
} = require('./lib');

function validate(slug) {
  const schema = readJSON(path.join(FACTORY, 'schemas', 'client.schema.json'));
  const { config } = loadClientConfig(slug);

  const errors = [];      // block the build
  const warnings = [];    // surface in report, do not block
  const blockers = [];    // launch blockers (build proceeds, site NOT ready)

  // 1. Schema
  validateAgainstSchema(config, schema).forEach((e) => errors.push(e));

  // 2. Slug must match filename
  if (config.slug && config.slug !== slug) {
    errors.push(`slug mismatch: config.slug="${config.slug}" but file is config/${slug}.json`);
  }

  // 3. Media folder / assets
  const mediaFolder = (config.media && config.media.folder) || slug;
  const assetPath = path.join(ASSETS_DIR, mediaFolder);
  if (!fs.existsSync(assetPath)) {
    warnings.push(`assets/${mediaFolder}/ not found — site will build without local media`);
  }

  // 4. Purchase rules (never ship a dead/fake payment button)
  const purchase = config.purchase || {};
  if (purchase.enabled) {
    if (!purchase.purchaseUrl) {
      blockers.push('Purchase enabled but purchaseUrl is missing — active purchase CTA will be hidden');
    }
    if (purchase.intakeUrl === undefined || purchase.intakeUrl === '') {
      warnings.push('Purchase enabled but intakeUrl is missing — post-purchase intake CTA will be hidden');
    }
    if (purchase.fullPrice !== undefined && purchase.depositAmount !== undefined &&
        purchase.balanceAmount !== undefined &&
        purchase.depositAmount + purchase.balanceAmount !== purchase.fullPrice) {
      warnings.push(`Purchase math: deposit (${purchase.depositAmount}) + balance (${purchase.balanceAmount}) != fullPrice (${purchase.fullPrice})`);
    }
  }

  // 5. Contact form name (every client must get a unique one)
  const formName = deriveFormName(config);
  if (!config.contact || !config.contact.formName) {
    warnings.push(`contact.formName not set — auto-derived as "${formName}"`);
  }
  if (!config.contact || config.contact.notificationDestinationDocumented !== true) {
    warnings.push('contact.notificationDestinationDocumented is not true — confirm the Netlify email notification is configured before launch');
  }

  // 6. SEO fallbacks
  if (!config.seo || !config.seo.title) warnings.push('seo.title missing — will fall back to businessName + tagline');
  if (!config.seo || !config.seo.description) warnings.push('seo.description missing — will fall back to description (truncated)');
  if (!config.seo || !config.seo.canonicalUrl) warnings.push('seo.canonicalUrl missing — <link rel=canonical> and og:url will be omitted');

  // 7. Optional-section visibility notes
  if (!config.services || config.services.length === 0) warnings.push('No services listed — Services section will be hidden');
  if (!config.socialLinks || Object.values(config.socialLinks).filter(Boolean).length === 0) {
    warnings.push('No social links — social row will be hidden');
  }

  return { config, errors, warnings, blockers, formName, mediaFolder };
}

module.exports = { validate };

/* ── CLI ── */
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { log.err('Usage: node factory/scripts/validate.js <slug>'); process.exit(2); }
  let res;
  try { res = validate(slug); }
  catch (e) { log.err(e.message); process.exit(2); }

  log.head(`Validation — ${slug}`);
  if (res.errors.length) { res.errors.forEach((e) => log.err(e)); }
  else log.ok('Schema and required fields valid');
  res.blockers.forEach((b) => log.warn(`LAUNCH BLOCKER — ${b}`));
  res.warnings.forEach((w) => log.warn(w));

  if (res.errors.length) { log.err(`\n${res.errors.length} error(s) — build would fail.`); process.exit(1); }
  log.ok(`\nValid. ${res.blockers.length} launch blocker(s), ${res.warnings.length} warning(s).`);
}
