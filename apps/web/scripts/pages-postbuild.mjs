/**
 * Finishes the GitHub Pages build (run after `vite build --mode pages`):
 *  - 404.html: GitHub Pages serves it for any unknown path, so deep links such as
 *    /ArchArena/learn/cdn load the app and the client-side router shows the right page.
 *  - .nojekyll: publish files as-is, without Jekyll processing.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(`${dist}index.html`)) {
  console.error('dist/index.html not found — run the Pages build first.');
  process.exit(1);
}
copyFileSync(`${dist}index.html`, `${dist}404.html`);
writeFileSync(`${dist}.nojekyll`, '');
console.log('GitHub Pages: wrote 404.html (SPA fallback) and .nojekyll');
