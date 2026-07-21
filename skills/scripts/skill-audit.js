'use strict';

/* ══════════════════════════════════════════════════════════════════
   EP SKILLS — NON-DESTRUCTIVE AUDIT  (N2C)

   Scans the skill packages + their real consumers and REPORTS drift.
   It never renames, moves, deletes, merges, or marks anything Ready.
   Output is a JSON review report (skills/AUDIT.json) that the Command
   Center renders as a human review queue.

   Categories reported:
     registered              — folder + valid manifest (in REGISTRY.json)
     missing-manifest        — a skills/<dir> with no manifest.json
     duplicate               — two skills share an id or a normalized name
     outdated                — lastVerified older than STALE_DAYS
     missing-connector-docs  — a not-yet-connected connector the skill's
                               portable-prompt.md never explains
     used-but-unsaved        — a skill id a consumer references that is NOT
                               saved here as a package (e.g. the Command
                               Center's interim skills)
     possible-unregistered   — a skill-like id referenced in this repo's
                               docs/scripts with no registered package

   CLI:
     node skills/scripts/skill-audit.js            # write skills/AUDIT.json
     node skills/scripts/skill-audit.js --print    # print, don't write
   ══════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');
const { build } = require('./skill-index.js');

const SKILLS_DIR = path.resolve(__dirname, '..');           // skills/
const REPO_ROOT = path.resolve(SKILLS_DIR, '..');           // EP-Media-Agency/
const SIBLINGS_ROOT = path.resolve(REPO_ROOT, '..');        // /home/user (repos live side by side)
const OUT = path.join(SKILLS_DIR, 'AUDIT.json');

const TODAY = new Date().toISOString().slice(0, 10);
const STALE_DAYS = 90;

// Real files that legitimately reference skills (used for "possible-unregistered").
const REPO_REF_FILES = [
  path.join(REPO_ROOT, 'CLAUDE.md'),
  path.join(SKILLS_DIR, 'README.md'),
];
// Consumer repos that declare which skills they USE (used for "used-but-unsaved").
// Each entry names the app file and how to pull skill ids out of it.
const CONSUMERS = [
  { name: 'Elite Prodigy Command Center', file: path.join(SIBLINGS_ROOT, 'EP-Command-Center', 'js', 'app.js') },
];

function daysBetween(a, b) { return Math.round((Date.parse(a) - Date.parse(b)) / 86400000); }
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function readIf(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } }

// Pull skill ids a consumer declares. A skill record carries both `id:` and
// `category:` on its line, so this reliably extracts real ids (no guessing).
function consumerSkillIds(src) {
  const ids = new Set();
  if (!src) return ids;
  src.split('\n').forEach((line) => {
    if (/category\s*:/.test(line)) {
      const m = line.match(/id\s*:\s*'([a-z][a-z0-9-]+)'/);
      if (m) ids.add(m[1]);
    }
  });
  return ids;
}

function audit() {
  const { registry } = build();
  const registered = registry.skills.map((s) => s.id);
  const registeredSet = new Set(registered);
  const byName = {};
  registry.skills.forEach((s) => { const k = norm(s.name); (byName[k] = byName[k] || []).push(s.id); });

  const findings = [];
  const add = (category, id, detail, evidence, suggestedIntent, severity) =>
    findings.push({ category, id, detail, evidence, suggestedIntent, severity: severity || 'info' });

  // ── missing-manifest: skills/<dir> without manifest.json ──
  fs.readdirSync(SKILLS_DIR).forEach((d) => {
    const p = path.join(SKILLS_DIR, d);
    if (!fs.statSync(p).isDirectory() || d === 'scripts') return;
    if (!fs.existsSync(path.join(p, 'manifest.json'))) {
      add('missing-manifest', d, `Folder skills/${d}/ has no manifest.json — it cannot enter the registry.`,
        `skills/${d}/`, `Add a manifest.json (see skills/README.md) or remove the folder.`, 'warn');
    }
  });

  // ── duplicate: same normalized name across two ids ──
  Object.keys(byName).forEach((k) => {
    if (byName[k].length > 1) {
      add('duplicate', byName[k].join(' + '), `Skills share the same name "${k}".`,
        byName[k].map((i) => `skills/${i}`).join(', '), `Review — keep one, or differentiate the names.`, 'warn');
    }
  });

  // ── outdated + missing-connector-docs (per registered skill) ──
  registry.skills.forEach((s) => {
    if (s.lastVerified && daysBetween(TODAY, s.lastVerified) > STALE_DAYS) {
      add('outdated', s.id, `lastVerified ${s.lastVerified} is more than ${STALE_DAYS} days old.`,
        `${s.skillPath}/manifest.json`, `Re-run/verify the skill, then update lastVerified.`, 'warn');
    }
    // Our standard requires portable-prompt.md to explain not-yet-connected connectors.
    const pp = readIf(path.join(SKILLS_DIR, s.slug, 'portable-prompt.md')) || '';
    (s.connectors || []).forEach((c) => {
      const notReady = /READY TO CONNECT|PLANNED|MANUAL/i.test(c.status);
      if (notReady && !new RegExp(c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(pp)) {
        add('missing-connector-docs', s.id,
          `Connector "${c.name}" (${c.status}) is not explained in portable-prompt.md.`,
          `${s.skillPath}/portable-prompt.md`,
          `Document how to run when "${c.name}" is not connected.`, 'info');
      }
    });
  });

  // ── used-but-unsaved: consumer references a skill id we don't package ──
  const consumersScanned = [];
  CONSUMERS.forEach((c) => {
    const src = readIf(c.file);
    if (src === null) return; // consumer repo not present in this session — skip honestly
    consumersScanned.push(path.relative(SIBLINGS_ROOT, c.file));
    consumerSkillIds(src).forEach((id) => {
      if (!registeredSet.has(id)) {
        add('used-but-unsaved', id,
          `${c.name} uses skill "${id}" but it is not saved here as a package.`,
          path.relative(SIBLINGS_ROOT, c.file),
          `Port "${id}" into skills/${id}/ (4-file package) when ready.`, 'warn');
      }
    });
  });

  // ── possible-unregistered: an id named in this repo's docs but not registered ──
  const seenPossible = new Set();
  REPO_REF_FILES.forEach((f) => {
    const src = readIf(f);
    if (!src) return;
    const rel = path.relative(REPO_ROOT, f);
    // kebab tokens inside `skills/<id>` or backtick-wrapped references
    const re = /skills\/([a-z][a-z0-9-]{3,})\b/g;
    let m;
    while ((m = re.exec(src))) {
      const id = m[1];
      if (id === 'scripts' || id === 'README' || registeredSet.has(id) || seenPossible.has(id)) continue;
      seenPossible.add(id);
      add('possible-unregistered', id, `"${id}" is referenced in ${rel} but has no registered package.`,
        rel, `Confirm whether "${id}" should become a skill package.`, 'info');
    }
  });

  const summary = findings.reduce((a, f) => { a[f.category] = (a[f.category] || 0) + 1; return a; }, {});
  summary.registered = registered.length;

  return {
    generatedAt: TODAY,
    today: TODAY,
    staleDays: STALE_DAYS,
    source: 'EP-Media-Agency/skills',
    note: 'Non-destructive report. Nothing is renamed, moved, deleted, merged, or marked Ready by this tool.',
    registered,
    consumersScanned,
    summary,
    findings,
  };
}

if (require.main === module) {
  const printOnly = process.argv.includes('--print');
  const report = audit();
  const counts = Object.entries(report.summary).map(([k, v]) => `${k}: ${v}`).join(' · ');
  console.log(`✓ Audit — ${report.findings.length} finding(s) [${counts}]`);
  report.findings.forEach((f) => console.log(`  • [${f.category}] ${f.id} — ${f.detail}`));
  if (report.consumersScanned.length) console.log(`  consumers scanned: ${report.consumersScanned.join(', ')}`);
  else console.log('  consumers scanned: none present in this session');
  if (!printOnly) { fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n'); console.log(`✓ Wrote skills/AUDIT.json`); }
}

module.exports = { audit };
