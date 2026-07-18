'use strict';

/* ══════════════════════════════════════════════════════
   EP FACTORY — DASHBOARD SERVER
   Regenerates the projects registry, then serves the
   managed-projects dashboard (factory/dashboard) locally.
   CLI: node factory/scripts/dashboard.js [port]
   ══════════════════════════════════════════════════════ */

const http = require('http');
const { fs, path, FACTORY, log } = require('./lib');
const { writeRegistry } = require('./projects');

const port = parseInt(process.argv[2], 10) || 8080;
const root = path.join(FACTORY, 'dashboard');

const { registry } = writeRegistry();
log.ok(`Registry: ${registry.count} projects (${registry.summary.launchReady} launch-ready, ${registry.summary.inReview} in review)`);

const TYPES = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const filePath = path.join(root, rel);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
}).listen(port, () => log.ok(`Dashboard → http://localhost:${port}  (Ctrl+C to stop)`));
