'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — BUILD (generator)
   config/<slug>.json + assets/<slug>/ + one command
     → validated, EPSG-styled static site in dist/<slug>/
   Deterministic: rebuilding a slug reproduces the same output.

   CLI:  node factory/scripts/build.js <slug>
   ══════════════════════════════════════════════════════ */

const {
  fs, path, FACTORY, DIST_DIR, log, esc, escAttr, humanSize, deriveFormName,
} = require('./lib');
const { validate } = require('./validate');
const { processMedia } = require('./media');
const { runPreflight } = require('./preflight');

const CORE = path.join(FACTORY, 'core');
const COMPONENTS = path.join(FACTORY, 'components');
const TEMPLATES = path.join(FACTORY, 'templates');

function titleCase(s) { return String(s).replace(/\b\w/g, (m) => m.toUpperCase()); }
function fill(str, tokens) {
  return str.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => (tokens[k] !== undefined ? tokens[k] : ''));
}
function money(n) { return `$${Number(n).toLocaleString('en-US')}`; }
// Build an E.164-ish tel: href. US 10-digit numbers get a +1 prefix.
function telLink(phone) {
  let d = String(phone).replace(/[^\d]/g, '');
  if (d.length === 10) d = '1' + d;
  return `tel:+${d}`;
}
function imgTag(rec, { eager } = {}) {
  const srcset = rec.srcset ? ` srcset="${escAttr(rec.srcset)}" sizes="${escAttr(rec.sizes)}"` : '';
  const dims = (rec.width && rec.height) ? ` width="${rec.width}" height="${rec.height}"` : '';
  const load = eager ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  return `<img src="${escAttr(rec.out)}"${srcset}${dims} alt="${escAttr(rec.alt)}"${load}>`;
}

async function build(slug) {
  const report = { warnings: [], notes: [], hiddenSections: [], factsUsed: [], missing: [] };

  // ── 1–3. Validate ──
  const v = validate(slug);
  if (v.errors.length) {
    log.head(`Build aborted — ${slug}`);
    v.errors.forEach((e) => log.err(e));
    return { ok: false, errors: v.errors };
  }
  const config = v.config;
  const formName = v.formName;
  v.warnings.forEach((w) => report.warnings.push(w));
  v.blockers.forEach((b) => report.notes.push(`launch blocker (validate): ${b}`));

  // ── 4. Clean dist ──
  const outRoot = path.join(DIST_DIR, slug);
  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(outRoot, { recursive: true });

  // ── 14. Media (produces dist/<slug>/assets + manifest) ──
  const media = await processMedia(slug, config);
  media.warnings.forEach((w) => report.warnings.push(w));

  // ── Copy core into dist/<slug>/core ──
  const outCore = path.join(outRoot, 'core');
  fs.mkdirSync(outCore, { recursive: true });
  ['ep-tokens.css', 'ep-components.css', 'ep-forms.css', 'ep-core.js', 'gsap-animations.js'].forEach((f) => {
    fs.copyFileSync(path.join(CORE, f), path.join(outCore, f));
  });
  fs.copyFileSync(path.join(COMPONENTS, 'a11y.css'), path.join(outCore, 'a11y.css'));

  // ── Brand overrides ──
  const brand = config.brand || {};
  const brandDecls = [];
  if (brand.primaryColor) brandDecls.push(`--brand-primary:${brand.primaryColor}`);
  if (brand.accentColor) brandDecls.push(`--brand-accent:${brand.accentColor}`);
  if (brand.secondaryColor) { brandDecls.push(`--brand-secondary:${brand.secondaryColor}`); brandDecls.push(`--brand-surface:${brand.secondaryColor}`); }
  if (brand.primaryColor && brand.secondaryColor && brand.primaryColor.toLowerCase() === brand.secondaryColor.toLowerCase()) {
    report.warnings.push('brand.primaryColor equals secondaryColor — risk of low-contrast (e.g. gold text on gold). Review before launch.');
  }
  const brandStyle = brandDecls.length ? `:root{${brandDecls.join(';')};}` : '';
  if (brandDecls.length) report.factsUsed.push(`brand colors: ${brandDecls.join(', ')}`);

  // ── Which sections are present ──
  const hasServices = Array.isArray(config.services) && config.services.length > 0;
  const hasGallery = media.gallery && media.gallery.length > 0;
  const hasAreas = Array.isArray(config.serviceAreas) && config.serviceAreas.length > 0;
  const purchaseEnabled = !!(config.purchase && config.purchase.enabled);
  const hasPurchaseUrl = !!(config.purchase && config.purchase.purchaseUrl);

  // ── Nav / mobile links ──
  const navItems = [];
  if (hasServices) navItems.push(['#services', 'Services']);
  if (hasGallery) navItems.push(['#gallery', 'Work']);
  navItems.push(['#about', 'About']);
  if (purchaseEnabled) navItems.push(['#purchase', 'Get a Site']);
  const navLinks = navItems.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('\n        ')
    + `\n        <li><a href="#contact" class="ep-nav-cta">Contact</a></li>`;
  const mobileLinks = [...navItems, ['#contact', 'Contact']]
    .map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join('\n      ');

  // ── Logo ──
  const logoMarkup = media.logo
    ? `<img src="${escAttr(media.logo.out)}" alt="${escAttr(media.logo.alt)}" height="34">`
    : '';

  // ── Hero ──
  const heroMedia = media.hero
    ? imgTag(media.hero, { eager: true })
    : `<div style="width:100%;height:100%;background:linear-gradient(160deg,var(--brand-surface),var(--brand-secondary));"></div>`;
  if (!media.hero) report.notes.push('No hero image — gradient fallback used.');

  const heroEyebrow = esc([config.location, titleCase(config.industry || '')].filter(Boolean).join(' · '));
  const heroTitle = esc(config.businessName);
  const heroSub = esc(config.tagline || (config.description || '').split(/(?<=[.!?])\s/)[0]);
  const telHref = config.phone ? telLink(config.phone) : '';
  const secondHref = hasServices ? '#services' : '#contact';
  const secondLabel = hasServices ? 'View Services' : 'Get a Quote';
  const heroActions = [
    // Phone-first: the call CTA is the primary action, above the fold.
    config.phone ? `<a href="${telHref}" class="ep-btn ep-btn--primary">Call ${esc(config.phone)}</a>` : '',
    `<a href="${secondHref}" class="ep-btn ep-btn--${config.phone ? 'outline' : 'primary'}">${secondLabel}</a>`,
  ].filter(Boolean).join('\n            ');
  report.factsUsed.push(`business name, industry, location, phone`);

  // ── Services section (grouped by category when any service has one) ──
  let servicesSection = '';
  if (hasServices) {
    const card = (s) => `
          <article class="ep-card reveal">
            <h3 class="ep-card-title">${esc(s.name)}</h3>
            ${s.description ? `<p class="ep-body">${esc(s.description)}</p>` : ''}
          </article>`;
    const grouped = config.services.some((s) => s.category);
    let inner;
    if (grouped) {
      // Preserve first-seen category order.
      const order = [];
      const byCat = {};
      config.services.forEach((s) => {
        const cat = s.category || 'More Services';
        if (!byCat[cat]) { byCat[cat] = []; order.push(cat); }
        byCat[cat].push(s);
      });
      inner = order.map((cat) => `        <div class="ep-svc-group">
          <div class="ep-svc-group-head reveal"><h3>${esc(cat)}</h3><span class="rule"></span></div>
          <div class="ep-grid ep-grid--3">${byCat[cat].map(card).join('')}
          </div>
        </div>`).join('\n');
    } else {
      inner = `        <div class="ep-grid ep-grid--3">${config.services.map(card).join('')}
        </div>`;
    }
    servicesSection = `    <section id="services" class="ep-section ep-section--surface" aria-labelledby="services-title">
      <div class="ep-container">
        <div class="ep-section-head reveal">
          <p class="ep-eyebrow">What We Do</p>
          <h2 id="services-title" class="ep-headline">Our <em>Services</em></h2>
        </div>
${inner}
      </div>
    </section>`;
    report.factsUsed.push(`${config.services.length} services${grouped ? ' (grouped by category)' : ''}`);
  } else { report.hiddenSections.push('Services (no services in config)'); }

  // ── About section (always; factual description only) ──
  const areasBlock = hasAreas
    ? `<p class="ep-body" style="margin-top:20px;"><strong style="color:var(--brand-primary);">Areas served:</strong> ${config.serviceAreas.map(esc).join(' · ')}</p>`
    : '';
  const aboutSection = `    <section id="about" class="ep-section" aria-labelledby="about-title">
      <div class="ep-container">
        <div class="ep-split">
          <div class="reveal">
            <p class="ep-eyebrow">Who We Are</p>
            <h2 id="about-title" class="ep-headline" style="margin:16px 0 20px;">About ${esc(config.businessName)}</h2>
            <p class="ep-lead">${esc(config.description)}</p>
            ${areasBlock}
          </div>
          <div class="reveal">
            <div class="ep-card">
              <h3 class="ep-card-title">Get In Touch</h3>
              <p class="ep-body">${esc(config.location || '')}</p>
              ${config.phone ? `<p class="ep-body"><a href="${telHref}" style="color:var(--brand-primary);">${esc(config.phone)}</a></p>` : ''}
              ${config.email ? `<p class="ep-body"><a href="mailto:${escAttr(config.email)}" style="color:var(--brand-primary);">${esc(config.email)}</a></p>` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>`;
  report.factsUsed.push('description');

  // ── Proof section — factual only (areas served), never fabricated stats ──
  let proofSection = '';
  if (hasAreas) {
    proofSection = `    <section id="proof" class="ep-section ep-section--surface" aria-label="Areas served">
      <div class="ep-container">
        <div class="ep-section-head reveal">
          <p class="ep-eyebrow">Proudly Serving</p>
          <h2 class="ep-headline">Areas We <em>Cover</em></h2>
        </div>
        <div class="ep-trust-row reveal">
          ${config.serviceAreas.map((a) => `<span>${esc(a)}</span>`).join('\n          ')}
        </div>
      </div>
    </section>`;
  } else {
    report.hiddenSections.push('Proof/results (no verified proof points — no fabricated statistics added)');
  }

  // ── Gallery ──
  let gallerySection = '';
  if (hasGallery) {
    const items = media.gallery.map((g) => `
          <figure class="ep-gallery-item reveal">${imgTag(g)}</figure>`).join('');
    const gEyebrow = esc((config.gallery && config.gallery.eyebrow) || 'Our Work');
    const gTitle = (config.gallery && config.gallery.title) || 'Recent <em>Projects</em>';
    gallerySection = `    <section id="gallery" class="ep-section" aria-labelledby="gallery-title">
      <div class="ep-container">
        <div class="ep-section-head reveal">
          <p class="ep-eyebrow">${gEyebrow}</p>
          <h2 id="gallery-title" class="ep-headline">${gTitle}</h2>
        </div>
        <div class="ep-gallery">${items}
        </div>
      </div>
    </section>`;
    report.factsUsed.push(`${media.gallery.length} gallery images`);
  } else { report.hiddenSections.push('Gallery (no gallery images supplied)'); }

  // ── Pillars band (optional) ──
  let pillarsSection = '';
  if (Array.isArray(config.pillars) && config.pillars.length) {
    const items = config.pillars.map((p) => `
        <div class="ep-pillar reveal">
          <div class="ep-pillar-label">${esc(p.label)}</div>
          ${p.blurb ? `<p class="ep-pillar-blurb">${esc(p.blurb)}</p>` : ''}
        </div>`).join('');
    pillarsSection = `    <section class="ep-section--tight" aria-label="Capabilities" style="background:var(--brand-secondary);">
      <div class="ep-container">
        <div class="ep-pillars">${items}
        </div>
      </div>
    </section>`;
    report.factsUsed.push(`${config.pillars.length} capability pillars`);
  }

  // ── Why-us (optional; factual points only) ──
  let whyUsSection = '';
  if (Array.isArray(config.whyUs) && config.whyUs.length) {
    const items = config.whyUs.map((w) => `
          <div class="ep-why-item reveal">
            <h3>${esc(w.title)}</h3>
            ${w.text ? `<p class="ep-body">${esc(w.text)}</p>` : ''}
          </div>`).join('');
    whyUsSection = `    <section id="why" class="ep-section" aria-labelledby="why-title">
      <div class="ep-container">
        <div class="ep-section-head reveal">
          <p class="ep-eyebrow">Why Choose Us</p>
          <h2 id="why-title" class="ep-headline">Why <em>${esc(config.businessName)}</em></h2>
        </div>
        <div class="ep-why">${items}
        </div>
      </div>
    </section>`;
    report.factsUsed.push(`${config.whyUs.length} why-us points`);
  }

  // ── Purchase section ──
  let purchaseSection = '';
  let purchaseStatus = 'disabled';
  if (purchaseEnabled) {
    const p = config.purchase;
    const priceRows = [
      p.fullPrice !== undefined ? `<div class="ep-price"><strong>${money(p.fullPrice)}</strong><span>Full Price</span></div>` : '',
      p.depositAmount !== undefined ? `<div class="ep-price"><strong>${money(p.depositAmount)}</strong><span>Deposit To Begin</span></div>` : '',
      p.balanceAmount !== undefined ? `<div class="ep-price"><strong>${money(p.balanceAmount)}</strong><span>On Completion</span></div>` : '',
    ].filter(Boolean).join('\n        ');
    const monthlyRow = (p.monthlyPlan !== undefined && p.monthlyPlan > 0)
      ? `<p class="ep-purchase-note">Optional monthly support &amp; updates plan: <strong style="color:var(--brand-primary);">${money(p.monthlyPlan)}/mo</strong></p>` : '';

    let actions;
    if (hasPurchaseUrl) {
      actions = `<a href="${escAttr(p.purchaseUrl)}" class="ep-btn ep-btn--primary" rel="noopener">Pay Deposit &amp; Begin</a>`;
      if (p.intakeUrl) actions += `\n        <a href="${escAttr(p.intakeUrl)}" class="ep-btn ep-btn--outline" rel="noopener">Client Intake Form</a>`;
      purchaseStatus = 'active';
    } else {
      // No dead/fake button and no public "coming soon" sales copy — route to a
      // real, working action (phone, else the contact form). The internal
      // "purchase link pending" note lives only in BUILD-REPORT.
      actions = config.phone
        ? `<a href="${telHref}" class="ep-btn ep-btn--primary">Call to Get Started</a>`
        : `<a href="#contact" class="ep-btn ep-btn--primary">Contact Us to Begin</a>`;
      purchaseStatus = 'enabled-no-url (public purchase button hidden — pending launch)';
    }

    const tpl = fs.readFileSync(path.join(COMPONENTS, 'purchase.html'), 'utf8');
    purchaseSection = fill(tpl, {
      PURCHASE_HEADLINE: 'Make This Website Yours',
      PURCHASE_SUB: esc(`A premium, mobile-ready ${config.industry || 'business'} website — built, optimized, and ready to launch.`),
      PRICE_ROWS: priceRows,
      MONTHLY_ROW: monthlyRow,
      PURCHASE_ACTIONS: actions,
      PURCHASE_STEPS: hasPurchaseUrl
        ? 'Next steps: pay the deposit to reserve your build slot, complete the short intake form, and your site launches within days.'
        : 'Next steps: reach out below and we will send your secure deposit link.',
    });
    report.factsUsed.push('purchase pricing from config');
  } else { report.hiddenSections.push('Purchase (purchase.enabled = false)'); }

  // ── Contact section ──
  const serviceOptions = hasServices
    ? config.services.map((s) => `<option>${esc(s.name)}</option>`).join('\n            ')
    : '';
  const social = config.socialLinks || {};
  const socialInline = Object.entries(social).filter(([, u]) => u)
    .map(([k, u]) => `<a href="${escAttr(u)}" rel="noopener" target="_blank">${titleCase(k)}</a>`).join('\n        ');
  const contactDetails = [
    config.phone ? `<a href="${telHref}" style="color:var(--brand-primary);">${esc(config.phone)}</a>` : '',
    config.email ? `<a href="mailto:${escAttr(config.email)}" style="color:var(--brand-primary);">${esc(config.email)}</a>` : '',
    config.location ? `<span>${esc(config.location)}</span>` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');
  const contactTpl = fs.readFileSync(path.join(COMPONENTS, 'contact.html'), 'utf8');
  const contactSection = fill(contactTpl, {
    CONTACT_HEADLINE: 'Start Your Project',
    CONTACT_SUB: esc(`Tell us about your project and we'll get back to you.`),
    FORM_NAME: escAttr(formName),
    SERVICE_OPTIONS: serviceOptions,
    CONTACT_DETAILS: `<p class="ep-body" style="text-align:center;margin-top:28px;">${contactDetails}</p>` +
      (socialInline ? `<div class="ep-social" style="justify-content:center;margin-top:16px;">${socialInline}</div>` : ''),
  });

  // ── SEO / head tokens ──
  const seo = config.seo || {};
  const seoTitle = esc(seo.title || `${config.businessName} — ${config.tagline || titleCase(config.industry || '')}`.trim());
  const seoDesc = esc(seo.description || (config.description || '').slice(0, 155));
  const canonical = seo.canonicalUrl || '';
  const canonicalTag = canonical ? `  <link rel="canonical" href="${escAttr(canonical)}">` : '';
  const ogUrlTag = canonical ? `  <meta property="og:url" content="${escAttr(canonical)}">` : '';
  const ogImage = media.hero ? (canonical ? canonical.replace(/\/?$/, '/') + media.hero.out : media.hero.out) : '';
  const ogImageTag = ogImage ? `  <meta property="og:image" content="${escAttr(ogImage)}">` : '';
  const faviconTag = media.logo ? `  <link rel="icon" href="${escAttr(media.logo.out)}">` : '';

  // ── JSON-LD LocalBusiness (verified config data only) ──
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.businessName,
    description: config.description,
  };
  if (config.phone) ld.telephone = config.phone;
  if (config.email) ld.email = config.email;
  if (canonical) ld.url = canonical;
  if (config.location) ld.address = { '@type': 'PostalAddress', addressLocality: config.location };
  if (hasAreas) ld.areaServed = config.serviceAreas;
  const sameAs = Object.values(social).filter(Boolean);
  if (sameAs.length) ld.sameAs = sameAs;
  const jsonLd = `  <script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n  </script>`;

  // ── Footer ──
  const footerLinks = [...navItems, ['#contact', 'Contact']]
    .map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join('\n          ');
  const footerSocial = socialInline;

  // ── Assemble ──
  const template = fs.readFileSync(path.join(TEMPLATES, `${config.template}.html`), 'utf8');
  let html = fill(template, {
    SEO_TITLE: seoTitle, SEO_DESCRIPTION: seoDesc,
    CANONICAL_TAG: canonicalTag, OG_URL_TAG: ogUrlTag, OG_IMAGE_TAG: ogImageTag, FAVICON_TAG: faviconTag,
    THEME_COLOR: brand.secondaryColor || '#050505',
    BRAND_STYLE: brandStyle, JSON_LD: jsonLd,
    LOGO_MARKUP: logoMarkup, BUSINESS_NAME: esc(config.businessName),
    NAV_LINKS: navLinks, MOBILE_LINKS: mobileLinks,
    HERO_MEDIA: heroMedia, HERO_EYEBROW: heroEyebrow, HERO_TITLE: heroTitle,
    HERO_SUB: heroSub, HERO_ACTIONS: heroActions,
    PILLARS_SECTION: pillarsSection, SERVICES_SECTION: servicesSection, ABOUT_SECTION: aboutSection,
    WHYUS_SECTION: whyUsSection, PROOF_SECTION: proofSection, GALLERY_SECTION: gallerySection,
    PURCHASE_SECTION: purchaseSection, CONTACT_SECTION: contactSection,
    FOOTER_TAGLINE: esc(config.tagline || ''), FOOTER_LINKS: footerLinks, FOOTER_SOCIAL: footerSocial,
    YEAR: new Date().getFullYear(), LOCATION: esc(config.location || ''),
  });
  // Strip authoring/template HTML comments from shipped output (keeps the page
  // clean and prevents any token that appears inside a comment from leaking).
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(path.join(outRoot, 'index.html'), html);

  // ── 12. Support files ──
  const siteBase = canonical ? canonical.replace(/\/?$/, '/') : `https://${slug}.netlify.app/`;
  if (!canonical) report.notes.push(`No canonicalUrl — sitemap/robots default to ${siteBase} (confirm before launch).`);
  fs.writeFileSync(path.join(outRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteBase}sitemap.xml\n`);
  fs.writeFileSync(path.join(outRoot, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteBase}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`);
  fs.writeFileSync(path.join(outRoot, '404.html'), render404(config, brandStyle));
  fs.writeFileSync(path.join(outRoot, 'netlify.toml'), renderNetlifyToml());

  // ── 15. Preflight ──
  const pf = runPreflight(slug, { config, formName, purchaseStatus, media });

  // ── 16. Readiness (two-tier) + build report ──
  const reviewReady = pf.reviewBlockers.length === 0;
  const launchReady = reviewReady && pf.launchBlockers.length === 0;
  const readiness = !reviewReady ? 'NOT READY FOR CLIENT REVIEW'
    : launchReady ? 'READY FOR PUBLIC LAUNCH'
    : 'READY FOR CLIENT REVIEW';
  writeBuildReport(outRoot, slug, config, {
    report, media, formName, purchaseStatus, hasPurchaseUrl, pf, readiness, reviewReady, launchReady,
  });

  return { ok: true, outRoot, pf, readiness, reviewReady, launchReady, purchaseStatus };
}

function render404(config, brandStyle) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page Not Found — ${esc(config.businessName)}</title>
<link rel="stylesheet" href="core/ep-tokens.css"><link rel="stylesheet" href="core/ep-components.css"><link rel="stylesheet" href="core/a11y.css">
<style>${brandStyle}</style></head>
<body><a class="ep-skip-link" href="#main">Skip to content</a>
<main id="main" style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;">
<div><p class="ep-eyebrow">404</p><h1 class="ep-headline" style="margin:16px 0 20px;">Page <em>Not Found</em></h1>
<p class="ep-lead" style="margin:0 auto 28px;">That page doesn't exist. Let's get you back home.</p>
<a href="/" class="ep-btn ep-btn--primary">Return Home</a></div></main></body></html>`;
}

function renderNetlifyToml() {
  return `[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; form-action 'self'; frame-ancestors 'none';"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/core/*"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=2592000"
`;
}

function writeBuildReport(outRoot, slug, config, ctx) {
  const { report, media, formName, purchaseStatus, hasPurchaseUrl, pf, readiness, reviewReady, launchReady } = ctx;
  const readinessBadge = !reviewReady ? '⛔ **NOT READY FOR CLIENT REVIEW**'
    : launchReady ? '✅ **READY FOR PUBLIC LAUNCH**'
    : '🟡 **READY FOR CLIENT REVIEW** — not yet ready for public launch (see launch items below)';
  const pendingList = Array.isArray(config.pendingVerification) ? config.pendingVerification : [];
  const files = fs.readdirSync(outRoot).filter((f) => f !== 'BUILD-REPORT.md');
  const mediaLines = media.results.map((r) => {
    const variants = (r.variants && r.variants.length > 1) ? ` · ${r.variants.length} responsive widths (${r.variants.map((v) => v.width).join('/')})` : '';
    return `- ${r.role}: \`${r.source}\` → \`${r.out}\` — ${r.optimized ? `${humanSize(r.originalSize)} → ${humanSize(r.optimizedSize)} (${r.savedPct}% smaller)${variants}` : `copied (${humanSize(r.optimizedSize)}, preserved as-is)`}`;
  }).join('\n') || '- none';
  const altLines = media.altFlags.length ? media.altFlags.map((a) => `- ⚠️ ${a}`).join('\n') : '- none flagged';

  // Optional committed Lighthouse sidecar (factory/reports/lighthouse-<slug>.json)
  let lighthouseMd;
  const lhPath = path.join(FACTORY, 'reports', `lighthouse-${slug}.json`);
  if (fs.existsSync(lhPath)) {
    try {
      const lh = JSON.parse(fs.readFileSync(lhPath, 'utf8'));
      const s = lh.scores || {};
      const t = lh.thresholds || {};
      const mark = (v, min) => (min !== undefined ? (v >= min ? '✅' : '⛔') : '');
      lighthouseMd = `- **Actually run** ${lh.runAt ? `on ${lh.runAt}` : ''} — ${lh.tool || 'Lighthouse'} (${lh.formFactor || 'mobile'}).
- Performance: **${s.performance}** ${mark(s.performance, t.performance)} · Accessibility: **${s.accessibility}** ${mark(s.accessibility, t.accessibility)} · Best Practices: **${s.bestPractices}** ${mark(s.bestPractices, t.bestPractices)} · SEO: **${s.seo}** ${mark(s.seo, t.seo)}
${lh.notes ? `- Note: ${lh.notes}` : ''}
- Re-run: \`npm run ep:preview -- ${slug}\` then drive the EPSG lighthouse-audit deps against \`http://localhost:8080/\` (see README).`;
    } catch { lighthouseMd = '- ⚠️ lighthouse sidecar present but unreadable.'; }
  } else {
    lighthouseMd = `- ⏳ Not run automatically. Run against a preview and record results in \`factory/reports/lighthouse-${slug}.json\`. Do not report Lighthouse as passing until it has actually run.`;
  }

  const md = `# Build Report — ${config.businessName}

> **FICTIONAL/TEST DATA** is used only where a config is explicitly marked as a sample. This report reflects exactly what shipped to \`dist/${slug}/\`.

**Slug:** \`${slug}\`
**Template:** \`${config.template}\`
**Status:** ${readinessBadge}

---

## Files generated
${files.map((f) => `- \`${f}\``).join('\n')}

## Client facts used (from config only)
${[...new Set(report.factsUsed)].map((f) => `- ${f}`).join('\n')}

## Pending client verification (internal — never shown publicly)
${pendingList.length ? pendingList.map((p) => `- ⏳ ${p}`).join('\n') : '- none'}

## Sections hidden (missing/optional data)
${report.hiddenSections.length ? report.hiddenSections.map((s) => `- ${s}`).join('\n') : '- none'}

## Media
**Selected hero:** ${media.hero ? `\`${media.hero.out}\` — ${media.hero.selectionReason}` : 'none (gradient fallback)'}
**Optimization:** ${media.manifest.sharp ? 'responsive WebP variants via sharp (srcset + width/height emitted)' : 'sharp not installed — originals copied through (run `npm install sharp` to enable WebP + srcset)'}

${mediaLines}

### Alt text requiring human review
${altLines}

## Contact
**Netlify form name:** \`${formName}\` (must be unique across all EP client sites)
**Notification destination documented:** ${config.contact && config.contact.notificationDestinationDocumented ? 'yes' : '⚠️ not confirmed'}

## Purchase
**Status:** ${purchaseStatus}
${purchaseStatus.includes('no-url') ? '- 🟡 No `purchaseUrl` yet — the public purchase button is hidden and the section routes to a real call/contact action (no dead button, no public "coming soon" copy). Add the URL before public launch. _Purchase link available after final review._' : hasPurchaseUrl ? '- Active purchase CTA rendered.' : '- Purchase section not shown.'}

## Preflight — Accessibility / SEO / Assets
${pf.checks.map((c) => `- ${c.pass ? '✅' : (c.launchOnly ? '🟡' : (c.level === 'blocker' ? '⛔' : '⚠️'))} ${c.name}${c.launchOnly ? ' _[launch-only]_' : ''}${c.detail ? ` — ${c.detail}` : ''}`).join('\n')}

## Lighthouse
${lighthouseMd}

## Blocking client review (must fix to show the client)
${pf.reviewBlockers.length ? pf.reviewBlockers.map((b) => `- ⛔ ${b}`).join('\n') : '- none ✅'}

## Blocking public launch only (site is reviewable now)
${pf.launchBlockers.length ? pf.launchBlockers.map((b) => `- 🟡 ${b}`).join('\n') : '- none'}

## Warnings
${report.warnings.length ? [...new Set(report.warnings)].map((w) => `- ⚠️ ${w}`).join('\n') : '- none'}
${pf.warnings.length ? pf.warnings.map((w) => `- ⚠️ ${w}`).join('\n') : ''}

## Preview locally
\`\`\`
npm run ep:preview -- ${slug}     # then open http://localhost:8080
\`\`\`

## To go from CLIENT REVIEW → PUBLIC LAUNCH
1. Confirm the Netlify form email notification destination, then set \`contact.notificationDestinationDocumented: true\`.
2. Add \`purchase.purchaseUrl\` (deposit checkout link).
3. Add \`purchase.intakeUrl\` (client intake form link).

---
*Generated by EP Website Factory. Status: **${readiness}**.*
`;
  fs.writeFileSync(path.join(outRoot, 'BUILD-REPORT.md'), md);
}

module.exports = { build };

/* ── CLI ── */
if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { log.err('Usage: node factory/scripts/build.js <slug>'); process.exit(2); }
  (async () => {
    log.head(`EP Factory build — ${slug}`);
    let res;
    try { res = await build(slug); }
    catch (e) { log.err(e.stack || e.message); process.exit(2); }
    if (!res.ok) { log.err('Build failed — see errors above.'); process.exit(1); }
    log.ok(`Built dist/${slug}/`);
    log.info(`Purchase: ${res.purchaseStatus}`);
    if (res.pf.reviewBlockers.length) { res.pf.reviewBlockers.forEach((b) => log.err(`REVIEW BLOCKER — ${b}`)); }
    if (res.pf.launchBlockers.length) { res.pf.launchBlockers.forEach((b) => log.warn(`launch-only — ${b}`)); }
    log.head(`Status: ${res.readiness}`);
    // Exit 0 when reviewable (launch-only items don't fail the build); 1 only if review is blocked.
    process.exit(res.reviewReady ? 0 : 1);
  })();
}
