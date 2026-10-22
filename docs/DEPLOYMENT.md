# Deployment

HLD Arena runs as **one Node.js process** (the API, which also serves the built web app) plus **PostgreSQL**. Serving both from the same origin keeps session cookies first-party and avoids CORS.

## Build

```bash
npm ci
npm run build          # apps/server/dist (API bundle) and apps/web/dist (static PWA)
```

`npm run build` also generates the Prisma client and type-checks the web app.

## Database

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/archarena?schema=public"
npm run db:deploy      # apply migrations (safe to run on every release)
npm run db:seed        # upsert the question bank (idempotent)
```

Run both on every release. The seed is safe to repeat: it updates questions in place, increases a rubric's version only when its content changes, and archives questions that were removed. It never deletes user data.

Back up PostgreSQL regularly (for example point-in-time recovery on a managed service). All user progress, attempts and the XP ledger live there.

## Run

```bash
NODE_ENV=production \
DATABASE_URL=... \
PORT=4000 \
APP_ORIGIN=https://arena.example.com \
BEHIND_PROXY=true \
WEB_DIST_DIR=apps/web/dist \
npm start
```

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` (enables `Secure` cookies and production logging) |
| `APP_ORIGIN` | The public HTTPS origin of the site, for example `https://arena.example.com` |
| `BEHIND_PROXY` | `true` when a load balancer or reverse proxy terminates TLS |
| `WEB_DIST_DIR` | Path to `apps/web/dist`, so the API serves the PWA |
| `SESSION_TTL_DAYS` | Session lifetime (default 30) |
| `GOOGLE_CLIENT_ID` | Optional, see below |

Health check: `GET /api/health` returns `200 {"ok":true,"database":true}` when the API can reach the database, otherwise `503`.

### HTTPS is required

- Session cookies are `Secure` in production, so browsers only send them over HTTPS. Plain-HTTP deployments cannot sign in, except on `localhost`.
- Service workers (offline mode, install, update prompts) only work on HTTPS or `localhost`.
- With `BEHIND_PROXY=true` the CSP also tells browsers to upgrade any `http://` sub-resource to `https://`.

Terminate TLS at your proxy or load balancer and forward `X-Forwarded-Proto` and `X-Forwarded-For`.

### Caching

The API sets cache headers itself:

- `/assets/*` (hashed filenames): `public, max-age=31536000, immutable`
- `index.html`, `sw.js`, the manifest and other root files: `no-cache`, so new releases are picked up and the in-app "Update available" prompt appears.
- Public question endpoints: `public, max-age=60, stale-while-revalidate=600`. Private endpoints: `private, no-store`.

If you put a CDN in front, respect these headers. In particular, never cache `/api/*` responses that carry cookies.

## Google sign-in (optional)

1. In Google Cloud Console, create an **OAuth client ID** of type *Web application*.
2. Add your site origin (for example `https://arena.example.com`) to **Authorised JavaScript origins**. Add `http://localhost:5173` for local development.
3. Set `GOOGLE_CLIENT_ID` on the API and restart. The sign-in pages show the Google button automatically.

The API verifies Google ID tokens against Google's public keys (issuer, audience and expiry). An existing email/password account with the same verified email is linked to the Google identity.

## Scaling notes

- The API is stateless (sessions live in PostgreSQL), so you can run several instances behind a load balancer.
- Rate limits are kept in memory per instance. With many instances, either accept per-instance limits or switch `express-rate-limit` to a shared store (for example Redis).
- Each instance caches questions in memory for 5 minutes, so a re-seed is visible everywhere within 5 minutes or after a restart.
- Evaluations take milliseconds of CPU per request. The per-user limits keep any one user from monopolising an instance.

## GitHub Pages (browser-only)

GitHub Pages only serves static files, so the Pages build replaces the API with an in-browser implementation of it (`apps/web/src/lib/local/server.ts`). It uses the same question bank, evaluation engine and reward rules as the server, answers the same requests with the same response shapes, and stores data in the visitor’s IndexedDB.

**One-time setup**

1. Push the repository to GitHub.
2. Open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the *Deploy to GitHub Pages* workflow manually). [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) installs dependencies, runs the shared and web unit tests, builds the site and deploys it.

The site is published at `https://<owner>.github.io/<repo>/`. The workflow sets `BASE_PATH=/<repo>/` from the repository name, so a renamed repo or fork keeps working.

**How the static build works**

- `vite build --mode pages` sets the compile-time flag `__STATIC_MODE__`. In the normal build this flag is `false`, so the in-browser API and the bundled question bank are dropped from the bundle entirely.
- Every visitor gets an automatic local profile. The sign-in and register pages redirect to the dashboard, and a dismissible notice explains that data stays on the device. **Settings → Erase all progress** wipes it.
- `apps/web/scripts/pages-postbuild.mjs` copies `index.html` to `404.html`. GitHub Pages serves that file for unknown paths, so deep links such as `/ArchArena/learn/cdn` open the right page. It also writes `.nojekyll`.
- The router, service worker, manifest (`id`, `start_url`, `scope`, shortcuts) and plain links all respect the base path. The service worker precaches the whole app, including the question bank, so the site works fully offline after the first visit.

**Limitations of the browser-only build**

- There are no accounts and no sync between devices. Progress lives in one browser and is lost if the visitor clears site data.
- Scores and XP are computed on the visitor’s device, so they are fine for practice but not tamper-proof. Use the full deployment if scores must be trusted.
- Google sign-in is not available.

**Preview locally**

```bash
npm run build:pages                         # BASE_PATH=/ArchArena/ by default
node apps/web/scripts/serve-pages.mjs       # GitHub Pages emulator → http://localhost:4175/ArchArena/
npm run test:e2e:pages -w @arch-arena/web   # builds, serves and tests the Pages version
```

## Pre-release checklist

```bash
npm run lint && npm run typecheck
npm test                      # needs a reachable test database (archarena_test by default)
npm run test:e2e              # needs archarena_e2e; starts its own servers on :4099 / :5199
npm run questions:check
npm run build
```
