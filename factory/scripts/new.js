'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — NEW CLIENT SCAFFOLD
   Fast setup for a new client without a dashboard.
   Creates config/<slug>.json (from the example) and
   assets/<slug>/ + README, refuses to overwrite, and
   prints exactly what to provide next.

   CLI:  node factory/scripts/new.js <slug>
   ══════════════════════════════════════════════════════ */

const { fs, path, ROOT, CONFIG_DIR, ASSETS_DIR, log, readJSON, slugify, c } = require('./lib');

function main() {
  const raw = process.argv[2];
  if (!raw) { log.err('Usage: npm run ep:new -- <client-slug>'); process.exit(2); }
  const slug = slugify(raw);
  if (slug !== raw) log.warn(`normalized slug to "${slug}"`);

  const configOut = path.join(CONFIG_DIR, `${slug}.json`);
  const assetsOut = path.join(ASSETS_DIR, slug);

  // Refuse to overwrite an existing client.
  if (fs.existsSync(configOut)) { log.err(`config/${slug}.json already exists — refusing to overwrite.`); process.exit(1); }
  if (fs.existsSync(assetsOut) && fs.readdirSync(assetsOut).length) {
    log.err(`assets/${slug}/ already exists and is not empty — refusing to overwrite.`); process.exit(1);
  }

  // Seed config from the example, pre-filling the slug-derived fields.
  const example = readJSON(path.join(CONFIG_DIR, 'client.example.json'));
  delete example._comment;
  example.slug = slug;
  example.media = example.media || {};
  example.media.folder = slug;
  example.contact = example.contact || {};
  example.contact.formName = `${slug}-contact`;
  example.contact.notificationDestinationDocumented = false;
  example.seo = example.seo || {};
  example.seo.canonicalUrl = `https://${slug}.netlify.app/`;
  example._TODO = 'Fill every field with VERIFIED client facts. Do not invent anything. Delete this _TODO key when done.';

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(configOut, JSON.stringify(example, null, 2) + '\n');

  fs.mkdirSync(assetsOut, { recursive: true });
  fs.writeFileSync(path.join(assetsOut, 'README.md'), assetReadme(slug));

  log.ok(`Created config/${slug}.json`);
  log.ok(`Created assets/${slug}/ (+ README.md)`);

  console.log(`\n${c.bold}Provide these FIVE groups (verified facts only — never invent):${c.reset}
  ${c.cyan}1. Business facts${c.reset}   businessName, industry, description, tagline, location, serviceAreas[], phone, email
  ${c.cyan}2. Services${c.reset}        services[]: each { name, description }
  ${c.cyan}3. Logo & photos${c.reset}   drop into assets/${slug}/ — logo (name contains "logo"), hero image, gallery photos
  ${c.cyan}4. Contact${c.reset}         confirm unique formName (${slug}-contact), set notificationDestinationDocumented=true, canonicalUrl
  ${c.cyan}5. Pricing & purchase${c.reset} purchase: fullPrice, depositAmount, balanceAmount, monthlyPlan, purchaseUrl, intakeUrl`);

  console.log(`\n${c.bold}Then run:${c.reset}
  npm run ep:validate -- ${slug}
  npm run ep:build    -- ${slug}
  npm run ep:preview  -- ${slug}\n`);
}

function assetReadme(slug) {
  return `# Assets — ${slug}

Drop the client's real media here. Then run \`npm run ep:build -- ${slug}\`.

## Needed
- [ ] **logo** — filename must contain "logo" (e.g. \`logo.png\`, \`logo.svg\`). Preserved as-is (not re-encoded).
- [ ] **hero** — main banner image. Name it \`hero.jpg\`/\`hero.png\` or set \`media.heroImage\` in the config.
- [ ] **gallery** — 3+ project/work photos (any name). Auto-converted to responsive WebP.

## Rules
- Real photos only. No stock or fabricated imagery presented as the client's work.
- Landscape images work best for hero (≈16:9) and gallery (≈4:3).
- Large originals are fine — the factory generates optimized WebP variants and flags oversized heroes.
- Alt text is derived from filenames + the business description and flagged for your review in BUILD-REPORT.md.
`;
}

if (require.main === module) main();
