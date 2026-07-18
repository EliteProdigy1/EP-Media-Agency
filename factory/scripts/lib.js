'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — SHARED LIBRARY
   Dependency-free helpers used by validate / media / build /
   preflight. No third-party packages required to run the
   factory; optional `sharp` is used by media.js if present.
   ══════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');            // EP-Media-Agency/
const FACTORY = path.join(ROOT, 'factory');
const CONFIG_DIR = path.join(ROOT, 'config');
const ASSETS_DIR = path.join(ROOT, 'assets');
const DIST_DIR = path.join(ROOT, 'dist');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m',
};
const log = {
  info: (m) => console.log(`${c.cyan}▸${c.reset} ${m}`),
  ok: (m) => console.log(`${c.green}✓${c.reset} ${m}`),
  warn: (m) => console.log(`${c.yellow}⚠${c.reset} ${m}`),
  err: (m) => console.log(`${c.red}✗${c.reset} ${m}`),
  head: (m) => console.log(`\n${c.bold}${m}${c.reset}`),
};

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** HTML-escape untrusted config text before injection into markup. */
function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Escape for use inside an HTML attribute (URLs, etc.). */
function escAttr(s) { return esc(s); }

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function deriveFormName(config) {
  if (config.contact && config.contact.formName) return config.contact.formName;
  return `${config.slug}-contact`;
}

function configPath(slug) { return path.join(CONFIG_DIR, `${slug}.json`); }

function loadClientConfig(slug) {
  const p = configPath(slug);
  if (!fs.existsSync(p)) {
    throw new Error(`Config not found: config/${slug}.json`);
  }
  return { config: readJSON(p), path: p };
}

/* ── Minimal JSON-Schema (draft-07 subset) validator ──
   Supports: type, required, minLength, minimum, pattern,
   enum, format:email, nested properties, array items.
   Returns an array of human-readable error strings. */
function validateAgainstSchema(data, schema, prefix = '') {
  const errors = [];
  const at = (k) => (prefix ? `${prefix}.${k}` : k);

  const typeOf = (v) => Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;

  function checkNode(value, node, label) {
    // Empty strings mean "not provided" — required-ness is enforced separately
    // via the `required` array, so skip format/pattern checks on blanks.
    if (value === '') return;
    if (node.type) {
      const t = typeOf(value);
      const want = node.type === 'number' ? ['number'] : [node.type];
      if (!want.includes(t) && !(node.type === 'number' && t === 'number')) {
        errors.push(`${label}: expected ${node.type}, got ${t}`);
        return;
      }
    }
    if (node.enum && !node.enum.includes(value)) {
      errors.push(`${label}: "${value}" is not one of ${node.enum.join(', ')}`);
    }
    if (node.type === 'string' && typeof value === 'string') {
      if (node.minLength && value.length < node.minLength) {
        errors.push(`${label}: too short (min ${node.minLength} chars)`);
      }
      if (node.pattern && !new RegExp(node.pattern).test(value)) {
        errors.push(`${label}: does not match required format`);
      }
      if (node.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${label}: not a valid email`);
      }
    }
    if (node.type === 'number' && typeof value === 'number') {
      if (node.minimum !== undefined && value < node.minimum) {
        errors.push(`${label}: must be >= ${node.minimum}`);
      }
    }
    if (node.type === 'object' && value && typeof value === 'object') {
      (node.required || []).forEach((k) => {
        if (value[k] === undefined || value[k] === '' ) {
          errors.push(`${label}.${k}: required`);
        }
      });
      if (node.properties) {
        Object.keys(node.properties).forEach((k) => {
          if (value[k] !== undefined) checkNode(value[k], node.properties[k], `${label}.${k}`);
        });
      }
    }
    if (node.type === 'array' && Array.isArray(value) && node.items) {
      value.forEach((item, i) => checkNode(item, node.items, `${label}[${i}]`));
    }
  }

  // Top-level required
  (schema.required || []).forEach((k) => {
    if (data[k] === undefined || data[k] === '') errors.push(`${at(k)}: required`);
  });
  if (schema.properties) {
    Object.keys(schema.properties).forEach((k) => {
      if (data[k] !== undefined) checkNode(data[k], schema.properties[k], at(k));
    });
  }
  return errors;
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

module.exports = {
  fs, path, ROOT, FACTORY, CONFIG_DIR, ASSETS_DIR, DIST_DIR,
  c, log, readJSON, slugify, esc, escAttr, humanSize, deriveFormName,
  configPath, loadClientConfig, validateAgainstSchema, IMAGE_EXTS,
};
