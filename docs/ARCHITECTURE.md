# Architecture

HLD Arena is an npm-workspaces monorepo with three packages:

```text
┌──────────────────────────┐        /api (JSON, cookies)        ┌──────────────────────────┐
│ apps/web  (React PWA)    │ ─────────────────────────────────▶ │ apps/server  (Express)   │
│  playground, results,    │                                    │  auth, drafts, attempts, │
│  dashboard, explorer     │ ◀───────────────────────────────── │  submissions, questions  │
│  IndexedDB drafts        │                                    │  Prisma ─▶ PostgreSQL    │
└────────────┬─────────────┘                                    └────────────┬─────────────┘
             │ imports                                                       │ imports
             └──────────────────────▶  packages/shared  ◀────────────────────┘
                     catalog · diagram model · evaluation engine · gamification
                     question bank (100) · API schemas
```

The most important design decision is that **the evaluation engine is shared code**. The browser runs it for instant *Validate* feedback, and the server runs the same code for the authoritative *Evaluate* score. Because it is deterministic and has no side effects, both always agree for the same diagram and rubric version.

## packages/shared

| Module | Contents |
| --- | --- |
| `catalog/` | 57 component definitions (category, tags, icon, properties), property fields with allowed values and help text, connection types and protocols, and `inferConnectionProps` for sensible defaults |
| `diagram/` | `DiagramSnapshot` (version 1: component, note and group nodes, plus edges), a Zod schema with size limits, a semantic hash (ignores positions), `DiagramGraph` (selectors, paths with required waypoints, reachability, connected groups), and a layered auto-layout |
| `evaluation/` | Rule primitives, structural analysis and the scoring engine — see [EVALUATION.md](EVALUATION.md) |
| `gamification/` | Star thresholds, rating, XP formula, levels and achievements. All tunables are in `config.ts` |
| `questions/` | A small DSL for writing questions, the 100 question definitions in `data/`, validation, and source-verification results |
| `api/` | Zod request schemas (validated on the server, reused by forms) and response DTO types |

The web app and the API import the TypeScript source directly. `tsup` bundles it into the API build, and Vite bundles it into the web build.

## apps/server

Express 5 with Prisma 6 on PostgreSQL.

### Request pipeline

1. `helmet` (CSP when the API also serves the web app), JSON body limit of 1 MB, cookie parser.
2. `originCheck` — state-changing requests that carry an `Origin` header must come from `APP_ORIGIN` or the API's own origin. This is defence in depth on top of `SameSite=Lax` cookies.
3. `attachUser` — resolves the `aa_session` cookie. Only a SHA-256 hash of the session token is stored, so a database leak does not expose usable sessions.
4. Routers, each with `requireUser` where needed and route-specific rate limits.
5. A JSON error handler: `{ error: { code, message, details? } }`. Validation errors list each failing field.

### API

| Method & path | Auth | Purpose |
| --- | --- | --- |
| `GET /api/health` | – | Liveness plus a database check |
| `GET /api/auth/config` | – | Whether Google sign-in is enabled |
| `GET /api/auth/me` | – | Current user or `null` |
| `POST /api/auth/register` · `login` · `google` · `logout` | – | Session management (rate limited) |
| `GET /api/questions` | – | Question summaries (publicly cacheable) |
| `GET /api/questions/:idOrSlug` | – | Full question incl. rubric and hints, without the reference |
| `GET /api/questions/:idOrSlug/reference` | user | Reference architecture; `403` until the user has evaluated an attempt |
| `POST /api/questions/:idOrSlug/hints` | optional | Records which hint levels were opened |
| `GET/PUT/DELETE /api/drafts/:questionId` · `GET /api/drafts` | user | Server copy of drafts with optimistic concurrency |
| `POST /api/attempts` · `GET /api/attempts` · `GET /api/attempts/:id` | user | Authoritative evaluation and history |
| `POST /api/submissions` · `GET /api/submissions/:id` | user | Final submission with rewards (idempotent) |
| `GET /api/me/dashboard` · `progress` · `achievements` · `PATCH preferences` | user | Profile and progress |

Every query for user data filters by the signed-in user's id. Another user's attempt, draft or submission returns `404`, not `403`, so ids cannot be probed.

### Data model

| Table | Notes |
| --- | --- |
| `users`, `sessions` | Email (unique, lower-cased), scrypt password hash or Google subject, XP, level, preferred explanation language |
| `questions`, `question_sources`, `question_requirements`, `question_rubrics`, `question_reference_architectures` | Seeded from the shared bank. A rubric's version increases when its content hash changes |
| `design_drafts` | One per user and question; `revision` drives optimistic concurrency |
| `design_attempts`, `evaluation_results` | Every server evaluation with the full report, rubric version and engine version |
| `design_submissions` | Unique per attempt and per `(user, idempotencyKey)` |
| `user_question_progress` | Status, best score and stars, XP value already awarded, hint usage |
| `user_xp_transactions` | Ledger of every XP grant, each with a unique `dedupeKey` |
| `user_achievements`, `hint_usage` | Unique per user and achievement / per user, question and hint level |

### Server-authoritative rewards

`services/submissions.ts` handles a final submission in one transaction:

1. `SELECT … FOR UPDATE` on the user row serialises concurrent submissions by the same user.
2. If a submission with this attempt or idempotency key already exists, its stored result is returned (`replayed: true`).
3. Score and stars come from the stored server-side evaluation. The client never sends reward data.
4. XP lines are written with unique dedupe keys (for example `first-completion:<user>:<question>`). A race that slips past the lock fails on the unique index, and the winner's result is returned.
5. Challenge XP is paid as the difference between the new value and what was already awarded for that question, so resubmitting the same quality earns nothing.

### Questions at runtime

`QuestionStore` keeps the published questions in memory, refreshed from the database every 5 minutes. Rubrics are stored with a version so old attempts stay explainable after a rubric changes.

## apps/web

React 19 with React Router 7 (lazy-loaded pages), TanStack Query for server state and Zustand for local state.

### Playground

- `features/playground/store.ts` — the canvas model (nodes, edges, groups, notes) with undo/redo history, selection, duplicate, group/ungroup, auto-layout, and conversion to and from `DiagramSnapshot`. `replaceComponent` swaps a component’s type in place (same id, so edges stay attached), keeps the settings the new type supports, renames default names, and re-infers only connection properties the user never changed — as one undo step. `ReplaceDialog.tsx` offers same-category components first.
- `Canvas.tsx` — React Flow in controlled mode with loose connection mode. Each node has four handles, and edges show protocol and sync/async styling.
- `ComponentLibrary.tsx` (search, categories, suggested categories first, click or drag to add), `PropertiesPanel.tsx` (component properties and connection properties, with help text), `ValidationPanel.tsx`, `Walkthrough.tsx`.
- Shortcuts: undo/redo (⌘/Ctrl+Z, ⇧⌘Z or Ctrl+Y), duplicate (⌘/Ctrl+D), group (⌘/Ctrl+G), save now (⌘/Ctrl+S), Delete/Backspace, Esc, `?` for help.
- Small screens use slide-over drawers for the library and properties, plus an overflow menu for secondary actions.

### Drafts and sync

`useDraftPersistence` saves every change to IndexedDB right away, in a namespace per signed-in user or for guests. Signed-in users also get a debounced `PUT /api/drafts/:id` with `baseRevision`. On `409 DRAFT_CONFLICT` a dialog shows both versions and the user decides. A forced save is sent only after that choice. The save indicator shows *Saving…*, *Saved* (to your account), *Saved on this device* (guests), *Offline changes pending*, *Save failed* (work stays on the device and is retried) or *Needs your decision* (conflict). `DraftSyncManager` uploads pending drafts when the connection returns.

### Browser-only mode (GitHub Pages)

`lib/api.ts` is the single place the web app talks to the API. When the compile-time flag `__STATIC_MODE__` is true (`vite build --mode pages`), `api()` sends each request to `lib/local/server.ts` instead of the network. That module implements every route the web app uses: auth (one local profile), questions, drafts with the same revision/conflict rules, attempts (shared `evaluateDesign`), idempotent final submissions with XP dedupe keys and achievements, dashboard, progress, hints and the reference unlock. It mirrors the server’s logic and DTOs, stores data in IndexedDB, and serialises requests with the Web Locks API so tabs cannot interleave writes. `test/local-server.test.ts` checks it against the same behaviours as the server’s integration tests. See [DEPLOYMENT.md](DEPLOYMENT.md#github-pages-browser-only).

### Learn

`features/learn/` holds the Learn tab (`/learn`, `/learn/settings`, `/learn/:type`, `/learn/compare/:slug`):

- `content/*.ts` — one guide per catalog component and 26 comparisons, all bilingual. Explanations follow the global explanation-language toggle; headings stay English. Plain strings are shown unchanged in both languages (for example technical terms in tables).
- `dsl.ts` and `SceneView.tsx` — illustrations are declared as columns of nodes plus arrows (`a>b` request, `a~>b` async, `a!>b` broken, `a.>b` optional, `a<>b` two-way). They render as responsive SVG with animated “packets”, which are skipped for users who prefer reduced motion.
- `LearnDialog.tsx` — opens a guide from the playground’s Properties panel without leaving the canvas.
- Configuration guide — `settingsCatalog.ts` lists every setting (the shared `PROPERTY_FIELDS` plus the connection fields), sorts them into themed groups and records which components use each one. `content/settings/*.ts` holds the bilingual explanations (what, why, real-life example, every option, good values for free text, tips for challenges). `SettingsGuidePage.tsx` renders them with search and a component filter (`?component=load-balancer`, in Properties-panel order) and per-setting anchors (`#setting-replication`, `#connection-mode`); `SettingsDialog.tsx` shows the selected component’s or connection’s settings inside the playground and highlights the current values.
- `lib/useUrlFilters.ts` — keeps page filters (Learn, Configuration guide, Challenges) in local state and mirrors them into the URL, so quick consecutive changes cannot overwrite each other.
- `related.ts` — maps a failed rubric check to the component guides it is about (from the rule’s selectors; vague selectors such as “any service” are skipped) and to the settings its `prop` rules check, so result pages can show “Learn: …” and “Setting: …” links next to each finding.
- The content is code-split: only Learn pages and the Learn and settings dialogs load it, and the service worker precaches it, so Learn works offline.
- `test/learn.test.ts` checks that every component has a complete guide, that every illustration references real nodes and icons, that every “compare” link includes both components, and that every Hinglish text exists and differs from the English. `test/settings-guide.test.ts` checks that every component and connection setting is explained, sits in exactly one group, has every option (or both on/off states) explained, and that every setting a challenge checks has an explanation.

### Interview Prep

`features/prep/` holds the Interview Prep tab (`/prep`, `/prep/:category`, `/prep/:category/:questionId`):

- `catalog.ts` — categories and their sections; `content/*.ts` — the questions (`PrepQuestion` in `types.ts`), bilingual and split into parts; `content/index.ts` sorts them by category and section.
- `PrepHomePage.tsx` (search, progress, categories, “revise later” list), `PrepCategoryPage.tsx` (section tabs and a progress filter, kept in the URL with `useUrlFilters`) and `PrepQuestionPage.tsx` (every part of the answer, a jump-to bar, practice mode, a copyable English interview answer with a Hinglish version, follow-ups, links to Learn guides and challenges, and prev/next).
- `progress.ts` — “I knew this / Revise later” and practice mode, stored in `localStorage` (a personal study aid, not graded progress).
- Diagrams reuse the Learn `SceneView`. The content is code-split and precached, so the tab works offline and in the browser-only build.
- `test/prep.test.ts` checks the requested categories and sections, that every original question is present in the right place, that every answer has all its parts (scenarios explain the situation, comparisons have a table, at least four interview points and six keywords), that every Hinglish text differs from the English, and that links and diagrams point to real components, challenges and icons. See [INTERVIEW_PREP.md](INTERVIEW_PREP.md).

### PWA and offline

`src/sw.ts` (Workbox, `injectManifest`):

- Precaches the app shell and static assets. Navigations fall back to the cached `index.html`.
- `GET /api/questions*` uses stale-while-revalidate, so challenges you have opened are available offline.
- All other `/api` calls are network-only. Private data is never cached by the service worker.
- `offline.html` is served when a navigation fails and nothing is cached.
- New versions wait for the user. `PwaManager` shows an "Update available" prompt and an install button where supported.

## Security summary

- Passwords hashed with scrypt (`N=16384, r=8, p=1`, 64-byte key, per-user salt). Login compares against a dummy hash for unknown emails, so timing does not reveal which emails exist.
- Opaque random session tokens in `httpOnly`, `SameSite=Lax` cookies, marked `Secure` when `NODE_ENV=production` or `BEHIND_PROXY=true`. The database stores only their SHA-256 hash, and logout deletes the session.
- Origin check on state-changing requests, a strict CSP (no inline scripts), and helmet's other headers.
- Rate limits: sign-in/registration 30 per 15 minutes per IP, evaluations 15 per minute per user, writes 240 per minute per user, and 60 evaluations per question per user per day.
- Zod validation for every request body. Diagrams are size-limited by `DIAGRAM_LIMITS`.
- Google ID tokens are verified with Google's JWKS (issuer, audience and expiry).

## Testing

| Suite | Location | What it covers |
| --- | --- | --- |
| Engine and question bank | `packages/shared/test` | Rule semantics, scoring, and all 100 questions: validation, Hinglish present and different from English, each reference design scores ≥ 90, without edges < 45, starter < 30 |
| Web unit | `apps/web/test` | Editor store (undo/redo, grouping, conversion), draft persistence/conflicts, and Learn content validation |
| API integration | `apps/server/test` | Auth, sessions, origin check, authorization between users, evaluation, reference gating, draft conflicts, idempotent and concurrent final submissions, anti-farming, hint bonus, dashboard |
| End to end | `apps/web/e2e` | Full journey on desktop (register → read → build → validate → evaluate → improve → final submit → dashboard → reference → draft restore) the Learn tab (guides, language toggle, comparisons, quiz, in-playground guide), the configuration guide (search, component filter, deep links, in-playground “Explain settings” with current values), Interview Prep (categories, search, sections, a full answer, language toggle, practice mode, progress), and phone layouts (navigation, drawers, toolbar, Learn pages, no rubber-band scrolling) |
