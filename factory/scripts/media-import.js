'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — MEDIA IMPORT
   Copies a client's raw images from a source folder into
   assets/<slug>/ with predictable names the build pipeline
   understands: logo-<slug>, hero-<slug>, project-01…NN.
   Does NOT optimize (that happens at build via sharp) — it
   only organizes and renames. Never alters image bytes.

   API: importMedia(slug, sourceDir, opts) → summary
   CLI: node factory/scripts/media-import.js <slug> <sourceDir>
   ══════════════════════════════════════════════════════ */

const { fs, path, ASSETS_DIR, log, IMAGE_EXTS } = require('./lib');

function listImages(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir)
    .filter((f) => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

function importMedia(slug, sourceDir, opts = {}) {
  const destDir = path.join(ASSETS_DIR, slug);
  fs.mkdirSync(destDir, { recursive: true });

  const files = listImages(sourceDir);
  const summary = { logo: null, hero: null, projects: [], copied: [], sourceDir, destDir, count: files.length };
  if (!files.length) return summary;

  const copy = (src, name) => {
    const dest = path.join(destDir, name);
    fs.copyFileSync(path.join(sourceDir, src), dest);
    summary.copied.push({ from: src, to: name });
    return name;
  };

  const isLogo = (f) => /logo/i.test(f);
  const isHero = (f) => /hero|cover|banner|main/i.test(f) && !isLogo(f);

  const logoFile = files.find(isLogo);
  const heroFile = files.find(isHero);

  if (logoFile) summary.logo = copy(logoFile, `logo-${slug}${path.extname(logoFile).toLowerCase()}`);
  if (heroFile) summary.hero = copy(heroFile, `hero-${slug}${path.extname(heroFile).toLowerCase()}`);

  const rest = files.filter((f) => f !== logoFile && f !== heroFile);
  rest.forEach((f, i) => {
    const name = `project-${String(i + 1).padStart(2, '0')}${path.extname(f).toLowerCase()}`;
    summary.projects.push(copy(f, name));
  });

  return summary;
}

module.exports = { importMedia };

/* ── CLI ── */
if (require.main === module) {
  const [slug, sourceDir] = process.argv.slice(2);
  if (!slug || !sourceDir) { log.err('Usage: node factory/scripts/media-import.js <slug> <sourceDir>'); process.exit(2); }
  log.head(`Import media — ${slug}`);
  const s = importMedia(slug, sourceDir);
  if (!s.count) { log.warn(`No images found in ${sourceDir}`); process.exit(0); }
  if (s.logo) log.ok(`logo  → assets/${slug}/${s.logo}`);
  if (s.hero) log.ok(`hero  → assets/${slug}/${s.hero}`);
  s.projects.forEach((p) => log.ok(`photo → assets/${slug}/${p}`));
  log.info(`${s.copied.length} file(s) imported into assets/${slug}/`);
  if (!s.hero) log.warn('No hero image detected — build will auto-select or use a branded fallback.');
}
