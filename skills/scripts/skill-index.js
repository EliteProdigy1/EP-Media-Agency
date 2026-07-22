'use strict';

/* ══════════════════════════════════════════════════════
   EP SKILLS — INDEX BUILDER + VALIDATOR
   Builds skills/REGISTRY.json ENTIRELY from the per-skill
   manifest.json files. The index is never hand-authored;
   it is always fully reproducible from the source folders.

   CLI:
     node skills/scripts/skill-index.js --validate   # validate only
     node skills/scripts/skill-index.js              # validate + write REGISTRY.json
   ══════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.resolve(__dirname, '..');            // skills/
const REPO_ROOT = path.resolve(SKILLS_DIR, '..');            // EP-Media-Agency/
const OUT = path.join(SKILLS_DIR, 'REGISTRY.json');

const STATUS_VOCAB = ['Ready', 'Connected', 'Ready to connect', 'Planned', 'Needs credentials'];
const CONN_VOCAB = ['CONNECTED', 'AVAILABLE', 'READY TO CONNECT', 'MANUAL', 'PLANNED', 'UNSUPPORTED', 'UNKNOWN'];
const COMPAT_KEYS = ['claude', 'chatgpt', 'viktor'];

function listSkillDirs() {
  return fs.readdirSync(SKILLS_DIR)
    .filter((d) => {
      const p = path.join(SKILLS_DIR, d);
      return fs.statSync(p).isDirectory() && d !== 'scripts' && fs.existsSync(path.join(p, 'manifest.json'));
    })
    .sort();
}

function validateManifest(slug, m, seenIds, errors, warnings) {
  const at = (f) => `${slug}/manifest.json → ${f}`;
  const reqStr = (f) => { if (!m[f] || typeof m[f] !== 'string') errors.push(`${at(f)}: required non-empty string`); };
  const reqArr = (f, allowEmpty) => { if (!Array.isArray(m[f]) || (!allowEmpty && !m[f].length)) errors.push(`${at(f)}: required${allowEmpty ? '' : ' non-empty'} array`); };

  reqStr('id'); reqStr('name'); reqStr('version'); reqStr('category'); reqStr('status');
  reqStr('approvalRules'); reqStr('sourceRepo'); reqStr('lastVerified');
  reqArr('authorizedAgents'); reqArr('requiredTools'); reqArr('optionalTools', true);
  reqArr('inputs'); reqArr('outputs'); reqArr('sourcePaths'); reqArr('connectors', true);

  // id unique + matches folder
  if (m.id) {
    if (seenIds.has(m.id)) errors.push(`${at('id')}: duplicate id "${m.id}"`);
    seenIds.add(m.id);
    if (m.id !== slug) warnings.push(`${at('id')}: id "${m.id}" != folder "${slug}" (kept, but 1:1 slugs are preferred)`);
  }
  // version semver-ish
  if (m.version && !/^\d+\.\d+\.\d+$/.test(m.version)) errors.push(`${at('version')}: "${m.version}" not X.Y.Z`);
  // status vocab
  if (m.status && !STATUS_VOCAB.includes(m.status)) errors.push(`${at('status')}: "${m.status}" not in [${STATUS_VOCAB.join(', ')}]`);
  // lastVerified date
  if (m.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(m.lastVerified)) errors.push(`${at('lastVerified')}: "${m.lastVerified}" not YYYY-MM-DD`);
  // connectors
  (m.connectors || []).forEach((c, i) => {
    if (!c || !c.name) errors.push(`${at('connectors[' + i + ']')}: missing name`);
    if (!c || !CONN_VOCAB.includes(c.status)) errors.push(`${at('connectors[' + i + '].status')}: "${c && c.status}" not in connector vocab`);
  });
  // compatibility
  if (!m.compatibility || typeof m.compatibility !== 'object') errors.push(`${at('compatibility')}: required object`);
  else COMPAT_KEYS.forEach((k) => {
    if (!m.compatibility[k]) errors.push(`${at('compatibility.' + k)}: required`);
    else if (!CONN_VOCAB.includes(m.compatibility[k])) errors.push(`${at('compatibility.' + k)}: "${m.compatibility[k]}" not in vocab`);
  });
  // required companion files present
  ['SKILL.md', 'portable-prompt.md', 'CHANGELOG.md'].forEach((f) => {
    if (!fs.existsSync(path.join(SKILLS_DIR, slug, f))) errors.push(`${slug}/: missing ${f}`);
  });
  // sourcePaths existence. In-repo must exist — EXCEPT a Planned skill may
  // name where its implementation will live before it is built (warn, not
  // error). Cross-repo paths always warn only.
  const isPlanned = m.status === 'Planned';
  (m.sourcePaths || []).forEach((sp) => {
    const abs = path.resolve(REPO_ROOT, sp);
    if (!fs.existsSync(abs)) {
      if (sp.startsWith('..')) warnings.push(`${at('sourcePaths')}: cross-repo path not present here: ${sp}`);
      else if (isPlanned) warnings.push(`${at('sourcePaths')}: planned skill — source not built yet: ${sp}`);
      else errors.push(`${at('sourcePaths')}: path not found: ${sp}`);
    }
  });
}

function build() {
  const dirs = listSkillDirs();
  const errors = [], warnings = [], seenIds = new Set(), skills = [];
  dirs.forEach((slug) => {
    let m;
    try { m = JSON.parse(fs.readFileSync(path.join(SKILLS_DIR, slug, 'manifest.json'), 'utf8')); }
    catch (e) { errors.push(`${slug}/manifest.json: invalid JSON — ${e.message}`); return; }
    validateManifest(slug, m, seenIds, errors, warnings);
    skills.push({ ...m, slug, skillPath: `skills/${slug}` });
  });
  skills.sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  return { errors, warnings, registry: { generatedAt: new Date().toISOString().slice(0, 10), source: 'EP-Media-Agency/skills', count: skills.length, skills } };
}

if (require.main === module) {
  const validateOnly = process.argv.includes('--validate');
  const { errors, warnings, registry } = build();
  warnings.forEach((w) => console.log(`⚠ ${w}`));
  if (errors.length) { errors.forEach((e) => console.log(`✗ ${e}`)); console.log(`\n${errors.length} error(s) — index not written.`); process.exit(1); }
  console.log(`✓ ${registry.count} skill(s) valid${warnings.length ? ` (${warnings.length} warning[s])` : ''}: ${registry.skills.map((s) => s.id).join(', ')}`);
  if (!validateOnly) { fs.writeFileSync(OUT, JSON.stringify(registry, null, 2) + '\n'); console.log(`✓ Wrote skills/REGISTRY.json`); }
}

module.exports = { build };
