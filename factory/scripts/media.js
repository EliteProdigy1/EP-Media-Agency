'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — MEDIA PIPELINE
   Organizes and optimizes client media into dist/<slug>/assets.
   - Optimizes to WebP when `sharp` is installed; otherwise
     copies originals through and reports that optimization
     was skipped (no silent failure, no fake compression).
   - Never performs AI visual analysis. Alt text is derived
     from filename + client description and flagged for review.
   - Deterministic hero selection when not explicitly set.

   CLI:  node factory/scripts/media.js <slug>
   API:  const { processMedia } = require('./media');
   ══════════════════════════════════════════════════════ */

const {
  fs, path, ASSETS_DIR, DIST_DIR, log, IMAGE_EXTS, humanSize, deriveFormName,
} = require('./lib');

// Optional dependency — the factory runs fine without it.
let sharp = null;
try { sharp = require('sharp'); } catch (_) { sharp = null; }

const HERO_WARN_BYTES = 800 * 1024;      // warn above ~800 KB
const HERO_BLOCK_BYTES = 2.5 * 1024 * 1024; // launch blocker above ~2.5 MB
const GALLERY_WARN_BYTES = 1.2 * 1024 * 1024;

function titleFromFilename(file) {
  return path.basename(file, path.extname(file))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

function isLogo(file) { return /logo/i.test(file); }

// Responsive width targets per role (native width is always added as the max).
const WIDTHS = { hero: [768, 1200], gallery: [400, 600] };
const SIZES_ATTR = { hero: '100vw', gallery: '(max-width: 700px) 100vw, 33vw' };

async function optimizeOrCopy(srcPath, outDir, baseName, { role }) {
  const ext = path.extname(srcPath).toLowerCase();
  const originalSize = fs.statSync(srcPath).size;

  // Logos: copy without destructive alteration (no resize, no re-encode).
  if (role === 'logo' || !sharp) {
    const outName = baseName + ext;
    fs.copyFileSync(srcPath, path.join(outDir, outName));
    let dim = {};
    if (sharp) { try { const m = await sharp(srcPath).metadata(); dim = { width: m.width, height: m.height }; } catch { /* ignore */ } }
    return { out: `assets/${outName}`, srcset: '', sizes: '', originalSize, optimizedSize: originalSize, optimized: false, variants: [], ...dim };
  }

  // Responsive WebP variants when sharp is available.
  try {
    const meta = await sharp(srcPath).metadata();
    const nativeW = meta.width || 1600;
    const nativeH = meta.height || Math.round(nativeW * 9 / 16);
    const targets = [...new Set((WIDTHS[role] || []).filter((w) => w < nativeW).concat(nativeW))].sort((a, b) => a - b);
    const variants = [];
    for (const w of targets) {
      const outName = `${baseName}-${w}.webp`;
      await sharp(srcPath).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outDir, outName));
      variants.push({ width: w, out: `assets/${outName}`, size: fs.statSync(path.join(outDir, outName)).size });
    }
    const primary = variants[variants.length - 1];              // native-width variant
    const srcset = variants.map((v) => `${v.out} ${v.width}w`).join(', ');
    return {
      out: primary.out, srcset, sizes: SIZES_ATTR[role] || '100vw',
      width: nativeW, height: nativeH,
      originalSize, optimizedSize: primary.size, optimized: true, variants,
    };
  } catch (e) {
    const outName = baseName + ext;
    fs.copyFileSync(srcPath, path.join(outDir, outName));
    return { out: `assets/${outName}`, srcset: '', sizes: '', originalSize, optimizedSize: originalSize, optimized: false, variants: [], error: e.message };
  }
}

async function processMedia(slug, config) {
  const mediaFolder = (config.media && config.media.folder) || slug;
  const srcDir = path.join(ASSETS_DIR, mediaFolder);
  const outDir = path.join(DIST_DIR, slug, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  const warnings = [];
  const altFlags = [];
  const results = [];

  const files = listImages(srcDir);
  if (!sharp) warnings.push('sharp not installed — images copied without WebP optimization (install sharp to enable)');
  if (files.length === 0) {
    warnings.push(`No images found in assets/${mediaFolder}/`);
    const manifest = { slug, sourceFolder: mediaFolder, sharp: !!sharp, hero: null, logo: null, gallery: [], images: [] };
    fs.writeFileSync(path.join(DIST_DIR, slug, 'media-manifest.json'), JSON.stringify(manifest, null, 2));
    return { manifest, results, warnings, altFlags, hero: null, logo: null, gallery: [] };
  }

  // ── Deterministic hero selection ──
  const explicitHero = config.media && config.media.heroImage;
  let heroFile = null;
  let heroReason = '';
  if (explicitHero && files.includes(explicitHero)) {
    heroFile = explicitHero; heroReason = 'client-specified (media.heroImage)';
  } else {
    if (explicitHero) warnings.push(`media.heroImage "${explicitHero}" not found in assets — falling back to deterministic pick`);
    const byName = files.find((f) => /hero|cover|banner|main/i.test(f) && !isLogo(f));
    if (byName) { heroFile = byName; heroReason = 'filename match (hero/cover/banner/main)'; }
    else { heroFile = files.find((f) => !isLogo(f)) || files[0]; heroReason = 'first non-logo image alphabetically'; }
  }

  const logoFile = files.find(isLogo) || null;
  const galleryFiles = files.filter((f) => f !== heroFile && f !== logoFile && !isLogo(f));

  const clientCtx = config.businessName ? `${config.businessName}` : slug;

  async function handle(file, role, index) {
    const base = role === 'hero' ? 'hero'
      : role === 'logo' ? 'logo'
      : `gallery-${String(index + 1).padStart(2, '0')}`;
    const r = await optimizeOrCopy(path.join(srcDir, file), outDir, base, { role });

    // Alt text — derived, never asserted as fact.
    let alt;
    let needsReview = false;
    if (role === 'logo') { alt = `${clientCtx} logo`; }
    else if (role === 'hero') { alt = config.tagline ? `${clientCtx} — ${config.tagline}` : `${clientCtx}`; needsReview = !config.tagline; }
    else { alt = `${clientCtx} — ${titleFromFilename(file)}`; needsReview = true; }
    if (needsReview) altFlags.push(`${r.out}: "${alt}" (derived from filename/context — confirm it describes the image)`);

    // Size guardrails — check the ORIGINAL source weight for the hero (that's
    // what the client uploaded), plus the shipped weight of each output.
    if (role === 'hero') {
      if (r.originalSize > HERO_BLOCK_BYTES) warnings.push(`BLOCKER: hero source ${file} is ${humanSize(r.originalSize)} (> ${humanSize(HERO_BLOCK_BYTES)}) — too heavy; recompress before shipping`);
      else if (r.originalSize > HERO_WARN_BYTES) warnings.push(`hero source ${file} is ${humanSize(r.originalSize)} — larger than ${humanSize(HERO_WARN_BYTES)}; consider a lighter original`);
      if (r.optimizedSize > HERO_BLOCK_BYTES) warnings.push(`BLOCKER: shipped hero ${r.out} is ${humanSize(r.optimizedSize)} — too heavy to ship`);
    } else if (role === 'gallery' && r.optimizedSize > GALLERY_WARN_BYTES) {
      warnings.push(`gallery image ${r.out} is ${humanSize(r.optimizedSize)} — consider compressing`);
    }

    const rec = {
      source: file, out: r.out, srcset: r.srcset, sizes: r.sizes, role,
      width: r.width, height: r.height,
      originalSize: r.originalSize, optimizedSize: r.optimizedSize,
      savedPct: r.originalSize ? Math.round((1 - r.optimizedSize / r.originalSize) * 100) : 0,
      optimized: r.optimized, variants: r.variants || [], alt, altNeedsReview: needsReview,
    };
    results.push(rec);
    return rec;
  }

  const heroRec = await handle(heroFile, 'hero', 0);
  const logoRec = logoFile ? await handle(logoFile, 'logo', 0) : null;
  const galleryRecs = [];
  for (let i = 0; i < galleryFiles.length; i++) galleryRecs.push(await handle(galleryFiles[i], 'gallery', i));

  const manifest = {
    slug, sourceFolder: mediaFolder, sharp: !!sharp,
    hero: { ...heroRec, selectionReason: heroReason },
    logo: logoRec, gallery: galleryRecs, images: results,
  };
  fs.writeFileSync(path.join(DIST_DIR, slug, 'media-manifest.json'), JSON.stringify(manifest, null, 2));

  return { manifest, results, warnings, altFlags, hero: manifest.hero, logo: logoRec, gallery: galleryRecs, heroReason };
}

module.exports = { processMedia };

/* ── CLI ── */
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { log.err('Usage: node factory/scripts/media.js <slug>'); process.exit(2); }
  const { loadClientConfig } = require('./lib');
  (async () => {
    let config;
    try { config = loadClientConfig(slug).config; }
    catch (e) { log.err(e.message); process.exit(2); }
    log.head(`Media — ${slug}`);
    const res = await processMedia(slug, config);
    res.results.forEach((r) => {
      const opt = r.optimized ? `→ ${humanSize(r.optimizedSize)} (${r.savedPct}% smaller)` : `(copied, ${humanSize(r.optimizedSize)})`;
      log.ok(`${r.role.padEnd(7)} ${r.source} ${opt}`);
    });
    if (res.hero) log.info(`Hero: ${res.hero.out} — ${res.heroReason}`);
    res.warnings.forEach((w) => log.warn(w));
    res.altFlags.forEach((a) => log.warn(`alt review — ${a}`));
    log.ok(`\nManifest → dist/${slug}/media-manifest.json`);
  })();
}
