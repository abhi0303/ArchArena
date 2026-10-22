/**
 * Serves dist/ the way GitHub Pages serves a project site, for local checks and the Pages e2e tests:
 * files live under /<repo>/ (BASE_PATH, default /ArchArena/) and every unknown path gets 404.html
 * with status 404 — exactly the behaviour the SPA fallback relies on.
 *
 * Usage: npm run build:pages && node scripts/serve-pages.mjs   (http://localhost:4175/ArchArena/)
 */
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url));
const BASE = `/${(process.env.BASE_PATH ?? '/ArchArena/').replace(/^\/+|\/+$/g, '')}/`;
const PORT = Number(process.env.PORT ?? 4175);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const send = async (file, status = 200) => {
    res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  };
  if (path.startsWith(BASE)) {
    let rel = normalize(path.slice(BASE.length)).replace(/^(\.\.[/\\])+/, '');
    if (rel === '.' || rel === '' || rel.endsWith('/')) rel = `${rel === '.' ? '' : rel}index.html`;
    try {
      const file = join(ROOT, rel);
      if ((await stat(file)).isFile()) return await send(file);
    } catch {
      /* fall through to 404.html */
    }
  }
  return send(join(ROOT, '404.html'), 404);
}).listen(PORT, () => console.log(`GitHub Pages preview: http://localhost:${PORT}${BASE}`));
