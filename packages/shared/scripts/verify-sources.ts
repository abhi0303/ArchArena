/**
 * Checks every question source URL and records the HTTP status in
 * src/questions/source-verification.json. A source is shown as "verified" only
 * when its URL answered with a 2xx/3xx status; everything else stays "pending".
 *
 * Usage: npm run sources:verify -w @arch-arena/shared
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QUESTIONS } from '../src/questions/index';

const OUT = fileURLToPath(new URL('../src/questions/source-verification.json', import.meta.url));
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 6;
const HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; HLD-Arena-source-check/1.0)',
  accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
};

async function check(url: string): Promise<number> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, { method, headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
      // Some sites reject HEAD; fall through to GET in that case.
      if (method === 'HEAD' && (res.status === 405 || res.status === 403 || res.status >= 500)) continue;
      return res.status;
    } catch {
      if (method === 'GET') return 0;
    }
  }
  return 0;
}

const urls = [...new Set(QUESTIONS.flatMap((q) => q.sources.map((s) => s.url)))].sort();
const results: Record<string, { status: number; checkedAt: string }> = {};
let next = 0;

async function worker() {
  while (next < urls.length) {
    const url = urls[next++]!;
    const status = await check(url);
    results[url] = { status, checkedAt: new Date().toISOString() };
    const ok = status >= 200 && status < 400;
    console.log(`${ok ? '✓' : '✗'} ${String(status).padStart(3)}  ${url}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
const failed = Object.entries(results).filter(([, r]) => !(r.status >= 200 && r.status < 400));
console.log(`\n${urls.length - failed.length}/${urls.length} source URLs verified. Results written to ${OUT}.`);
if (failed.length) console.log(`Unverified (shown as "pending" in the app):\n${failed.map(([u, r]) => `  ${r.status || 'ERR'}  ${u}`).join('\n')}`);
