'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — SERVICE CATEGORIZER
   Deterministic keyword scoring — no AI, no API calls.
   Groups a flat list of service names into logical
   categories the premium-service template renders as
   grouped sections. Fully offline and reproducible.

   API: categorize(name) → categoryLabel
        categorizeServices(services) → services with .category filled
        groupsOf(services) → [{ category, services }] in first-seen order
   ══════════════════════════════════════════════════════ */

// Priority-ordered categories. Each service is scored against every
// category's keywords; the highest score wins, ties broken by array order.
const CATEGORIES = [
  { label: 'Site & Earthwork', keywords: ['excavat', 'grading', 'grade', 'dirt work', 'site prep', 'site work', 'earthwork', 'land clearing', 'clearing', 'grubbing', 'drainage', 'french drain', 'erosion', 'foundation dig'] },
  { label: 'Demolition & Removal', keywords: ['demolition', 'demo', 'removal', 'remove', 'tear out', 'teardown', 'junk', 'debris', 'stump', 'tree removal', 'tree', 'haul off'] },
  { label: 'Concrete, Masonry & Structures', keywords: ['concrete', 'flatwork', 'slab', 'masonry', 'brick', 'block', 'paver', 'hardscape', 'retaining', 'fence', 'fencing', 'shed', 'structure', 'building', 'outbuilding', 'barn', 'fireplace', 'firepit', 'patio', 'deck', 'pergola'] },
  { label: 'Maintenance & Finishing', keywords: ['lawn', 'mow', 'maintenance', 'landscap', 'irrigation', 'sprinkler', 'paint', 'pressure wash', 'power wash', 'gutter', 'window', 'cleanup', 'clean up', 'sod', 'mulch', 'trim'] },
  { label: 'Hauling & Materials', keywords: ['haul', 'dump truck', 'dump', 'gravel', 'aggregate', 'material', 'delivery', 'deliver', 'rock', 'sand', 'fill dirt', 'topsoil'] },
];
const DEFAULT_CATEGORY = 'Additional Services';

function scoreCategory(text, cat) {
  let score = 0;
  for (const kw of cat.keywords) if (text.includes(kw)) score += 1;
  return score;
}

/** Return the best-matching category label for a single service name. */
function categorize(name) {
  const text = String(name || '').toLowerCase();
  let best = { label: DEFAULT_CATEGORY, score: 0, idx: 999 };
  CATEGORIES.forEach((cat, idx) => {
    const score = scoreCategory(text, cat);
    if (score > best.score || (score === best.score && score > 0 && idx < best.idx)) {
      best = { label: cat.label, score, idx };
    }
  });
  return best.score > 0 ? best.label : DEFAULT_CATEGORY;
}

/** Fill .category on each service that doesn't already have one. */
function categorizeServices(services) {
  return (services || []).map((s) => {
    const svc = typeof s === 'string' ? { name: s } : { ...s };
    if (!svc.category) svc.category = categorize(svc.name);
    return svc;
  });
}

/** Group services into [{category, services}] preserving first-seen order. */
function groupsOf(services) {
  const order = [];
  const byCat = {};
  categorizeServices(services).forEach((s) => {
    if (!byCat[s.category]) { byCat[s.category] = []; order.push(s.category); }
    byCat[s.category].push(s);
  });
  return order.map((category) => ({ category, services: byCat[category] }));
}

module.exports = { categorize, categorizeServices, groupsOf, CATEGORIES, DEFAULT_CATEGORY };

/* ── CLI: echo categorization for a comma/newline-separated list ── */
if (require.main === module) {
  const input = process.argv.slice(2).join(' ');
  if (!input) { console.log('Usage: node factory/scripts/categorize.js "Excavation, Land Clearing, Painting"'); process.exit(2); }
  const names = input.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  groupsOf(names).forEach((g) => {
    console.log(`\n${g.category}`);
    g.services.forEach((s) => console.log(`  - ${s.name}`));
  });
}
