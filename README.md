# HLD Arena

An interactive platform for learning high-level system design (HLD). You read a problem, build an architecture on a canvas by dragging components and connecting them, and get an explainable, rubric-based score with concrete suggestions.

The original product specification lives in [docs/SPEC.md](docs/SPEC.md).

**Two ways to run it:** the full version (API + PostgreSQL, accounts, server-side scoring) or a **browser-only version for GitHub Pages** that needs no server: challenges, scoring, XP and drafts run in the browser and are saved on the visitor’s device. See [Deploying to GitHub Pages](docs/DEPLOYMENT.md#github-pages-browser-only).

## Features

- **100 challenges** — 15 Easy, 35 Medium, 50 Hard. Each has a problem statement, functional and non-functional requirements, constraints, expected scale, four progressive hints, a question-specific rubric, a reference architecture (with trade-offs and alternatives) and sources. Explanations can be read in **English or Hinglish**; the rest of the UI stays in English.
- **Learn tab** — a guide for each of the 57 components and 26 side-by-side comparisons of look-alike components, all in English and Hinglish. Each guide covers the problem before the component existed, before/after illustrations, how it works, a real-life analogy, a situation where it fits perfectly, when it is the wrong tool, and how it differs from look-alikes. Comparisons add an everyday story, a feature table and a “Which one would you pick?” quiz. Guides also open from the playground’s Properties panel, and evaluation feedback links each finding to the guides it is about.
- **Interview Prep** (`/prep`) — interview questions grouped by category and section (Frontend: general, React, Angular; Backend: general, Node.js, NestJS; Databases; System Design; Servers & Networking; Security; DevOps & Cloud including Kubernetes; Engineering Practices). Every answer is explained in parts — the scenario, the idea in simple words, a real-life example, why it is needed, what goes wrong without it, the details step by step — and ends with an interview-ready answer, keywords, what the interviewer listens for, common mistakes and follow-up questions. English and Hinglish, search, practice mode (answer first, then reveal) and “I knew this / Revise later” tracking saved in the browser. See [docs/INTERVIEW_PREP.md](docs/INTERVIEW_PREP.md) to add questions.
- **Configuration guide** (`/learn/settings`) — every setting in the Properties panel (73 component settings and 8 connection settings) explained in English and Hinglish: what it means, why it matters, a real-life example, the meaning of every option, and what helps in challenges (including how settings are scored). Filter by component or search; each setting has its own link. In the playground, **Explain settings** opens the explanations for the selected component or connection with your current choices highlighted, and result-page feedback links to the setting it is about.
- **Playground** — a React Flow canvas with 57 components in 7 categories, typed connections (protocol, sync/async, direction, criticality), a properties panel, **Replace with…** (swap a component for another type and keep its connections and applicable settings), undo/redo, grouping, notes, auto-layout, keyboard shortcuts and a first-use tour. Works with mouse, keyboard and touch.
- **Local-first autosave** — drafts are saved to IndexedDB immediately and synced to your account. Edits made on another device or tab are detected and you choose which copy to keep.
- **Three ways to check a design**
  - *Validate* runs in the browser, is free and unlimited, and does not create an attempt.
  - *Evaluate* runs on the server, stores the attempt and its full report, and compares it with your previous attempt.
  - *Final submit* turns an evaluated attempt into a submission and grants rewards. It is idempotent: retries and double-clicks never grant XP twice.
- **Explainable scoring** — seven weighted categories, connection-aware rules, structural analysis (broken flows, single points of failure, reversed arrows…), critical gaps that cap the score, and "needs configuration" when a property must be set before something can be judged. See [docs/EVALUATION.md](docs/EVALUATION.md).
- **Progress** — stars (0–5), a 0–5 rating, XP, levels and 8 achievements, all computed on the server. The dashboard is built from your stored data only.
- **Reference architectures** unlock after your first evaluated attempt on a challenge.
- **Accounts** — email and password (scrypt hashes, httpOnly session cookies) and optional Google sign-in.
- **Installable PWA** — offline app shell and offline page, the whole Learn tab and previously viewed challenges available offline, drafts saved offline, home-screen shortcuts (Challenges, Learn, Dashboard), install-dialog screenshots, safe-area support for notched phones, no rubber-band bounce, and an in-app prompt when an update is available.

## Tech stack

| Layer | Tools |
| --- | --- |
| Web | React 19, TypeScript, Vite 7, React Router 7, TanStack Query 5, Zustand 5, @xyflow/react 12, Tailwind CSS 4, Lucide, vite-plugin-pwa (Workbox) |
| API | Node.js 22, Express 5, Zod 4, Prisma 6, PostgreSQL 16, helmet, express-rate-limit |
| Shared | One TypeScript package with the component catalog, diagram model, evaluation engine, gamification rules, question bank and API schemas — used by both web and API |
| Tests | Vitest 4 (unit + API integration with supertest), Testing Library, Playwright (desktop and mobile) |

## Quick start

**Requirements:** Node.js 22 (see `.nvmrc`; 20.19+ works) and PostgreSQL 14+.

```bash
# 1. Install dependencies
nvm use            # optional, picks Node 22 from .nvmrc
npm install

# 2. Start PostgreSQL (or use your own; see "Using a local PostgreSQL" below)
docker compose up -d

# 3. Configure the API
cp apps/server/.env.example apps/server/.env

# 4. Create the schema and load the 100 questions
npm run db:setup

# 5. Run the API (http://localhost:4000) and the web app (http://localhost:5173)
npm run dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api` to the API, so cookies work without any CORS setup.

### Using a local PostgreSQL

Any PostgreSQL works. Create a role and database that match `DATABASE_URL` in `apps/server/.env`, for example:

```bash
psql -d postgres -c "CREATE ROLE archarena WITH LOGIN PASSWORD 'archarena' CREATEDB;"
psql -d postgres -c "CREATE DATABASE archarena OWNER archarena;"
```

The integration and end-to-end tests use separate databases (`archarena_test` and `archarena_e2e`). Create them the same way, or give the role `CREATEDB`.

## Scripts

Run from the repository root.

| Command | What it does |
| --- | --- |
| `npm run dev` | API (watch mode) and web dev server together |
| `npm run build` | Production build of the API (`apps/server/dist`) and the web app (`apps/web/dist`) |
| `npm run build:pages` | Browser-only build for GitHub Pages (`apps/web/dist`, served from `/ArchArena/`; override with `BASE_PATH`) |
| `npm start` | Runs the built API; serves the web app too when `WEB_DIST_DIR` is set |
| `npm run typecheck` | Type-checks every workspace |
| `npm run lint` | ESLint for the whole repo |
| `npm test` | Unit tests (shared, web) and API integration tests (needs PostgreSQL) |
| `npm run test:e2e` | Playwright journey and mobile tests (starts its own API on :4099 and web on :5199) |
| `npm run test:e2e:pages -w @arch-arena/web` | Playwright tests of the GitHub Pages build, served by a Pages emulator on :4175 (no database needed) |
| `npm run db:migrate` | Create/apply a migration during development (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Upsert the question bank; bumps a rubric's version when it changes |
| `npm run db:setup` | `db:deploy` + `db:seed` |
| `npm run questions:check` | Validates all 100 questions and checks every reference design against its rubric |
| `npm run sources:verify -w @arch-arena/shared` | Checks every source URL and records which ones are verified |

## Configuration

API settings live in `apps/server/.env` (see [`apps/server/.env.example`](apps/server/.env.example)):

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | — | PostgreSQL connection string (required) |
| `PORT` | `4000` | API port |
| `APP_ORIGIN` | `http://localhost:5173` | Allowed browser origin(s) for state-changing requests, comma-separated |
| `SESSION_TTL_DAYS` | `30` | Session lifetime |
| `BEHIND_PROXY` | `false` | Set `true` behind a TLS-terminating proxy (trusts `X-Forwarded-*`, forces `Secure` cookies and adds the HTTPS upgrade rule to the CSP) |
| `GOOGLE_CLIENT_ID` | empty | Enables "Sign in with Google" when set |
| `WEB_DIST_DIR` | empty | Path to `apps/web/dist`; the API then serves the web app from the same origin |

Test-only overrides: `TEST_DATABASE_URL` (API integration tests) and `E2E_DATABASE_URL` (Playwright).

## Project layout

```text
apps/
  server/          Express API, Prisma schema, migrations and seed
    prisma/        schema.prisma, migrations/, seed.ts
    src/           routes/, services/, auth/, http/ (errors, security)
    test/          API integration tests (real PostgreSQL)
  web/             React app (PWA)
    src/app/       layout, router, PWA and draft-sync managers
    src/features/  playground, learn, question, results, dashboard, explorer, auth, settings
    src/sw.ts      service worker (Workbox, injectManifest)
    e2e/           Playwright tests
packages/
  shared/          code used by both apps
    src/catalog/       components, properties, connection types
    src/diagram/       diagram model, schema, graph algorithms, layout, hashing
    src/evaluation/    rules, structural analysis, scoring engine
    src/gamification/  stars, rating, XP, levels, achievements
    src/questions/     question DSL, validation and data/ (the 100 questions)
    src/api/           request schemas and response types
docs/              specification and guides
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — how the pieces fit, data model, API, security, offline behaviour.
- [Evaluation engine](docs/EVALUATION.md) — rules, categories, penalties, stars, XP and what is deliberately not automated.
- [Question authoring](docs/QUESTION_AUTHORING.md) — how to add or change a challenge safely.
- [Interview Prep](docs/INTERVIEW_PREP.md) — how to add interview questions, categories and sections.
- [Deployment](docs/DEPLOYMENT.md) — production build, environment, migrations, HTTPS and Google sign-in.

## Known limitations

- **Sources.** 83 of 84 source URLs answered an automated check. The Instagram Engineering article blocks automated requests, so it is shown as "pending" in the app rather than "verified". The platform never claims that a company asks a particular interview question.
- **Dependency audit.** After upgrading to Vitest 4 and patching esbuild, `npm audit` reports one remaining issue: `deepmerge-ts` inside the Prisma CLI’s config loader (high). It only runs when the Prisma CLI loads its configuration, never while serving requests. Fixing it requires the breaking Prisma 7 upgrade, left as a follow-up.
- **Evaluation is rule-based.** Scores come from deterministic, question-specific rules. The engine cannot judge free-form reasoning such as notes. See [docs/EVALUATION.md](docs/EVALUATION.md#what-is-not-automated).
