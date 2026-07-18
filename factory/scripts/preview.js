'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — PREVIEW SERVER
   Zero-dependency static server for dist/<slug>.
   CLI:  node factory/scripts/preview.js <slug> [port]
   ══════════════════════════════════════════════════════ */

const http = require('http');
const { fs, path, DIST_DIR, log } = require('./lib');

const slug = process.argv[2];
const port = parseInt(process.argv[3], 10) || 8080;
if (!slug) { log.err('Usage: node factory/scripts/preview.js <slug> [port]'); process.exit(2); }

const root = path.join(DIST_DIR, slug);
if (!fs.existsSync(root)) { log.err(`dist/${slug}/ not found — run ep:build first.`); process.exit(2); }

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const filePath = path.join(root, rel);
  if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      const nf = path.join(root, '404.html');
      if (fs.existsSync(nf)) { res.writeHead(404, { 'Content-Type': 'text/html' }); return res.end(fs.readFileSync(nf)); }
      res.writeHead(404); return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => {
  log.ok(`Serving dist/${slug} → http://localhost:${port}  (Ctrl+C to stop)`);
});
