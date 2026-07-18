'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — CLIENT WIZARD (ep:new)
   Walks a non-technical user through creating a new client:
   business facts → services (auto-categorized) → media import
   → config generation → optional build. Dependency-free.

   CLI:
     npm run ep:new                 # interactive wizard
     npm run ep:new -- <slug> --quick   # blank scaffold from example
   ══════════════════════════════════════════════════════ */

const readline = require('readline');
const { spawnSync } = require('child_process');
const {
  fs, path, CONFIG_DIR, ASSETS_DIR, FACTORY, log, readJSON, slugify, c,
} = require('./lib');
const { groupsOf } = require('./categorize');
const { importMedia } = require('./media-import');

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const positional = argv.filter((a) => !a.startsWith('--'));

/* ───────── prompt helpers ─────────
   Interactive over a TTY; deterministic over piped stdin (read all lines
   up front and serve them in order — avoids the readline/EOF race and makes
   the wizard scriptable/testable). */
const isTTY = process.stdin.isTTY;
const rl = isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
let queue = null;
if (!isTTY) { try { queue = fs.readFileSync(0, 'utf8').split('\n'); } catch { queue = []; } }
const closeRl = () => { if (rl) rl.close(); };

const ask = (q) => {
  if (isTTY) return new Promise((res) => rl.question(q, (a) => res(String(a).trim())));
  process.stdout.write(q);
  const line = queue && queue.length ? queue.shift() : '';
  process.stdout.write(`${line}\n`);
  return Promise.resolve(String(line).trim());
};

async function prompt(label, opts = {}) {
  const { def = '', required = false, validate, hint } = opts;
  for (;;) {
    const defTxt = def ? ` ${c.dim}[${def}]${c.reset}` : '';
    const hintTxt = hint ? `\n   ${c.dim}${hint}${c.reset}` : '';
    const a = await ask(`\n${c.cyan}?${c.reset} ${label}${defTxt}${hintTxt}\n  ${c.bold}›${c.reset} `);
    const val = a || def;
    if (required && !val) { console.log(`  ${c.yellow}(required)${c.reset}`); continue; }
    if (validate && val) { const e = validate(val); if (e) { console.log(`  ${c.yellow}${e}${c.reset}`); continue; } }
    return val;
  }
}
const yes = async (label, def = true) => {
  const a = (await ask(`\n${c.cyan}?${c.reset} ${label} ${c.dim}[${def ? 'Y/n' : 'y/N'}]${c.reset} ${c.bold}›${c.reset} `)).toLowerCase();
  if (!a) return def;
  return a.startsWith('y');
};

/* ───────── quick scaffold (unchanged behavior) ───────── */
function quickScaffold(rawSlug) {
  const slug = slugify(rawSlug);
  const configOut = path.join(CONFIG_DIR, `${slug}.json`);
  const assetsOut = path.join(ASSETS_DIR, slug);
  if (fs.existsSync(configOut) && !flags.has('--force')) { log.err(`config/${slug}.json exists — use --force to overwrite.`); process.exit(1); }
  const example = readJSON(path.join(CONFIG_DIR, 'client.example.json'));
  delete example._comment;
  example.slug = slug;
  example.media = { ...example.media, folder: slug };
  example.contact = { formName: `${slug}-contact`, notificationDestinationDocumented: false };
  example.seo = { ...example.seo, canonicalUrl: `https://${slug}.netlify.app/` };
  example._TODO = 'Fill with VERIFIED facts. Delete this key when done.';
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(configOut, JSON.stringify(example, null, 2) + '\n');
  fs.mkdirSync(assetsOut, { recursive: true });
  fs.writeFileSync(path.join(assetsOut, 'README.md'), `# Assets — ${slug}\nDrop logo (name contains "logo"), hero, and gallery photos here, then \`npm run ep:build -- ${slug}\`.\n`);
  log.ok(`Scaffolded config/${slug}.json + assets/${slug}/`);
  process.exit(0);
}

/* ───────── interactive wizard ───────── */
async function wizard() {
  console.log(`\n${c.bold}══ EP Website Factory — New Client ══${c.reset}`);
  console.log(`${c.dim}Answer each prompt. Press Enter to accept a [default]. Verified facts only —\nleave things blank rather than guessing; the build flags anything missing.${c.reset}`);

  const businessName = await prompt('Business name', { required: true });
  let slug = slugify(businessName);
  slug = (await prompt('URL slug (kebab-case)', { def: slug, validate: (v) => (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v) ? '' : 'letters, numbers and hyphens only') })) || slug;

  const configOut = path.join(CONFIG_DIR, `${slug}.json`);
  if (fs.existsSync(configOut) && !flags.has('--force')) {
    log.err(`config/${slug}.json already exists — refusing to overwrite (re-run with --force).`);
    closeRl(); process.exit(1);
  }

  const industry = await prompt('Industry', { required: true, hint: 'e.g. Landscaping, Roofing, Property Services / Outdoor Construction' });
  const description = await prompt('One–two sentence description', { required: true, validate: (v) => (v.length >= 20 ? '' : 'a little longer, please (min ~20 chars)') });
  const tagline = await prompt('Tagline (optional)', {});
  const location = await prompt('Location (City, State)', { required: true });
  const serviceAreasRaw = await prompt('Service areas (comma-separated, optional)', { hint: 'e.g. Fairhope, Baldwin County' });
  const phone = await prompt('Phone', { required: true, validate: (v) => (v.replace(/[^\d]/g, '').length >= 7 ? '' : 'looks too short') });
  const email = await prompt('Public email (optional — leave blank if none yet)', {});

  // Services → auto-categorized
  console.log(`\n${c.cyan}?${c.reset} Services — type or paste them, comma-separated or one per line.`);
  console.log(`  ${c.dim}Enter a blank line when done. Descriptions optional as "Name: description".${c.reset}`);
  const serviceLines = [];
  for (;;) {
    const line = await ask(`  ${c.bold}›${c.reset} `);
    if (!line) break;
    line.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => serviceLines.push(s));
  }
  const services = groupsOf(serviceLines.map((s) => {
    const [name, ...rest] = s.split(':');
    return { name: name.trim(), description: rest.join(':').trim() || undefined };
  }).map((s) => (s.description ? s : { name: s.name }))).flatMap((g) => g.services);
  if (services.length) {
    console.log(`\n  ${c.green}Auto-categorized:${c.reset}`);
    groupsOf(services).forEach((g) => console.log(`   ${c.bold}${g.category}${c.reset} — ${g.services.map((s) => s.name).join(', ')}`));
  }

  // Brand
  const primaryColor = await prompt('Brand accent color (hex)', { def: '#C9A84C', hint: 'the gold/accent used for headlines & CTAs', validate: hex });
  const accentColor = await prompt('Lighter accent (hex)', { def: '#E8D49A', validate: hex });

  // Socials
  const facebook = await prompt('Facebook URL (optional)', {});
  const instagram = await prompt('Instagram URL (optional)', {});

  // Purchase
  const usePackage = await yes('Offer the standard EP website package ($1,000 · $500 deposit · $100/mo)?', true);

  // Media import
  let heroImage = '';
  const importDir = await prompt('Folder with the client\'s photos to import (optional, absolute path)', {});
  if (importDir) {
    if (fs.existsSync(importDir)) {
      const s = importMedia(slug, importDir);
      if (s.count) {
        if (s.logo) log.ok(`logo → assets/${slug}/${s.logo}`);
        if (s.hero) { heroImage = s.hero; log.ok(`hero → assets/${slug}/${s.hero}`); }
        s.projects.forEach((p) => log.ok(`photo → assets/${slug}/${p}`));
      } else log.warn(`No images found in ${importDir}`);
    } else log.warn(`Folder not found: ${importDir} — you can add photos to assets/${slug}/ later.`);
  } else {
    fs.mkdirSync(path.join(ASSETS_DIR, slug), { recursive: true });
  }

  // Build config
  const serviceAreas = serviceAreasRaw ? serviceAreasRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const autoCategorized = services.length > 0;
  const config = {
    businessName, slug, industry, template: 'premium-service',
    description, tagline, location, serviceAreas, phone, email,
    services,
    socialLinks: { facebook, instagram, linkedin: '' },
    brand: { logo: '', primaryColor, accentColor, styleNotes: '' },
    media: { folder: slug, heroImage, galleryImages: [] },
    purchase: {
      enabled: usePackage,
      fullPrice: 1000, depositAmount: 500, balanceAmount: 500, monthlyPlan: 100,
      purchaseUrl: '', intakeUrl: '',
    },
    contact: { formName: `${slug}-contact`, notificationDestinationDocumented: false },
    seo: {
      title: `${businessName} — ${tagline || industry}`.trim(),
      description: description.slice(0, 155),
      canonicalUrl: `https://${slug}.netlify.app/`,
    },
    pendingVerification: [
      autoCategorized ? 'Services were auto-categorized by keyword — confirm the groupings and wording with the client.' : null,
      !email ? 'Public email / form notification destination — not yet provided.' : null,
      'Purchase deposit link (purchaseUrl) and intake link (intakeUrl) — not yet provided.',
      !heroImage ? 'No hero image imported — a branded fallback or client photo is needed before launch.' : null,
    ].filter(Boolean),
  };

  fs.writeFileSync(configOut, JSON.stringify(config, null, 2) + '\n');
  fs.writeFileSync(path.join(ASSETS_DIR, slug, 'README.md'),
    `# Assets — ${businessName}\nReal client media only. logo (name contains "logo"), hero, project photos. Then \`npm run ep:build -- ${slug}\`.\n`);

  console.log(`\n${c.green}✓${c.reset} Wrote ${c.bold}config/${slug}.json${c.reset} and ${c.bold}assets/${slug}/${c.reset}`);
  console.log(`\n${c.bold}Next:${c.reset}`);
  console.log(`  npm run ep:validate -- ${slug}`);
  console.log(`  npm run ep:build    -- ${slug}`);
  console.log(`  npm run ep:preview  -- ${slug}`);

  const buildNow = await yes('Build the site now?', true);
  closeRl();
  if (buildNow) {
    const r = spawnSync('node', [path.join(FACTORY, 'scripts', 'build.js'), slug], { stdio: 'inherit' });
    process.exit(r.status || 0);
  }
  process.exit(0);
}

function hex(v) { return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? '' : 'use a hex color like #C9A84C'; }

/* ───────── entry ───────── */
(async () => {
  try {
    if (flags.has('--quick')) {
      if (!positional[0]) { log.err('Usage: npm run ep:new -- <slug> --quick'); process.exit(2); }
      quickScaffold(positional[0]);
    } else {
      await wizard();
    }
  } catch (e) { log.err(e.message); closeRl(); process.exit(1); }
})();
