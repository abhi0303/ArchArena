/// <reference lib="webworker" />
/**
 * HLD Arena service worker.
 *
 * Caching strategy (explicit on purpose):
 *  - App shell & static assets: precached at install (versioned by Workbox revision hashes).
 *  - Navigations: served from the cached app shell so the SPA works offline.
 *  - Public question content (GET /api/questions, /api/questions/:key): stale-while-revalidate,
 *    so challenges you have opened stay readable offline.
 *  - Everything else under /api (auth, drafts, attempts, submissions, dashboard, reference):
 *    network-only — private data is never written to the cache.
 */
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }));

const PUBLIC_QUESTION = /^\/api\/questions(\/[^/]+)?\/?$/;

registerRoute(
  ({ url, request }) => request.method === 'GET' && url.origin === self.location.origin && PUBLIC_QUESTION.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'public-questions-v1',
    plugins: [new CacheableResponsePlugin({ statuses: [200] }), new ExpirationPlugin({ maxEntries: 220, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  }),
);

registerRoute(({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'), new NetworkOnly(), 'GET');
registerRoute(({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'), new NetworkOnly(), 'POST');
registerRoute(({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'), new NetworkOnly(), 'PUT');
registerRoute(({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'), new NetworkOnly(), 'PATCH');
registerRoute(({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'), new NetworkOnly(), 'DELETE');

// Offline fallback for documents that cannot be served from the shell.
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    const cached = await caches.match('/offline.html', { ignoreSearch: true });
    if (cached) return cached;
  }
  return Response.error();
});

self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | undefined)?.type === 'SKIP_WAITING') void self.skipWaiting();
});

clientsClaim();
