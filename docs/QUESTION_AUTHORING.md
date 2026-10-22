# Question authoring

All 100 questions are TypeScript in `packages/shared/src/questions/data/`. They are written with a small DSL (`questions/dsl.ts`), validated in tests and by `npm run questions:check`, and loaded into PostgreSQL by `npm run db:seed`.

## Workflow

1. Add or edit a `defineQuestion({...})` block in the right file (`easy*.ts`, `medium-*.ts`, `hard-*.ts`), and register any new file in `questions/index.ts`.
2. Run `npm run questions:check`. It validates the whole bank and evaluates every reference design against its own rubric.
3. Run `npm test -w @arch-arena/shared`.
4. If you added source URLs, run `npm run sources:verify -w @arch-arena/shared`.
5. Run `npm run db:seed`. Questions are upserted. When a rubric's content changes, its version increases, so stored attempts keep pointing at the rubric they were scored with. Questions removed from the bank are archived, not deleted.

## Anatomy of a question

```ts
defineQuestion({
  id: 'm01', slug: 'url-shortener-at-scale', title: 'URL Shortener at Scale',
  difficulty: 'medium', category: 'Web Services', minutes: 35,
  tags: [...], concepts: [...],
  statement: { en: '…', hi: '…' },                 // Hinglish must differ from English
  functional:    [['English', 'Hinglish', ['check-id', …]], …],
  nonFunctional: [['English', 'Hinglish', ['check-id', …]], …],
  constraints: { en: [...], hi: [...] },            // same length
  scale: [['Reads per second', '100,000'], …],
  starter: ['web-client'],                          // what the canvas starts with
  suggested: ['clients', 'application', …],         // library categories shown first
  hints: [[en, hi] × 4],                            // exactly four, from gentle to specific
  rubric: { checks: [...], discouraged: [...], weights?: {...} },
  reference: { nodes: [...], edges: [...], summary, tradeoffs, alternatives },
  sources: [[title, https-url, type, note?]],
});
```

Each requirement lists the check ids that prove it. Requirement coverage in the report comes from these links.

## Writing checks

```ts
C(id, category, points, title, rule, passText, failText, fixText, { critical?, optional?, concern? })
```

- Use selectors from `S` (`S.client`, `S.entry`, `S.service`, `S.cache`, `S.channel`, `S.nosql`, …), `anyOf(name, ...selectors)` for alternatives, and rule builders from `R` (`R.path`, `R.edge`, `R.async`, `R.guarded`, `R.redundant`, `R.prop`, `R.has`, `R.any`, `R.all`, …).
- Reuse templates from `T` for common concerns: `T.entry()`, `T.scaleOut()`, `T.dbReplication()`, `T.observability()`, `T.rateLimit()`, `T.cdn()`, `T.auth()`, `T.shard()`, `T.idempotent(sel)`, `T.multiRegion(sel)`, `T.geoRouting()`, `T.dlq()`. Any field can be overridden: `T.cdn({ id: 'playback', pts: 1 })`.
- Prefer **flow rules** (`path`, `edge`, `async`, `guarded`) over presence (`has`). They test that components are actually wired correctly.
- Mark a check `critical` only when the design is meaningless without it (for example "requests reach the database"). Critical failures cap the score at 50.
- Write fail texts that explain the consequence and fix texts that say exactly what to add or connect. Avoid "you should consider…".
- Accept reasonable alternatives with `anyOf` or `R.any`. Rubrics must not reward only one vendor-specific answer.

### Rules the validator enforces

- At least 6 checks, including at least one required **functional** and one required **components** check, and at least one connection rule.
- Every requirement links to at least one existing check.
- Every component type, property key and value exists in the catalog, and every reference component supports the properties set on it.
- Exactly 4 hints. Hinglish text present and different from English everywhere. Source URLs use `https`.
- Unique ids, slugs and titles, and a bank distribution of 15 Easy / 35 Medium / 50 Hard.

### Rules the consistency check enforces

For every question, `questions:check` and the shared tests evaluate:

| Diagram | Required score |
| --- | --- |
| The reference architecture | ≥ 90 (all current references score 100) |
| The reference with all connections removed | < 45 |
| The starter canvas | < 30 |

This catches rubrics that are impossible to satisfy, and rubrics that reward dropping boxes on the canvas without wiring them.

## Reference architectures

```ts
nodes: [['lb', 'load-balancer', 'Why it is here.', { label?, props?, at? }], …],
edges: ['client>lb', ['lb>api', 'Why this connection matters.'], 'a<>b', …],
```

- Every node needs a one-line "why". Edges with a "why" are shown as critical connections.
- Positions are optional; the layered auto-layout places nodes.
- The reference must be a *good* design, not a minimal one: redundant services and databases, no clients calling services directly, every queue with a producer and a consumer, every worker with an input, observability connected.

## Hinglish

Hinglish is Hindi written in Latin script, mixed with English technical terms the way engineers speak: *"Cache ko service ke paas rakho taaki reads fast hon."* Keep technical terms (cache, shard, queue, idempotency) in English, and keep sentences short. Only explanatory content is translated (statement, requirements, constraints, hints, clarifications). The UI stays English.

## Sources

`src(title, url, type, note?)` with type `paper`, `engineering-blog`, `documentation` or `interview-prep`. Sources are background reading only:

- Never invent a URL or citation. Prefer papers, official documentation and first-party engineering blogs.
- Never claim a company asks a question. Every question is described as a commonly discussed interview-style problem.
- `npm run sources:verify -w @arch-arena/shared` records each URL's HTTP status in `source-verification.json`. Only URLs that answered 2xx/3xx are shown as **verified**. Others are shown as **pending**, which may simply mean the site blocks automated checks.
