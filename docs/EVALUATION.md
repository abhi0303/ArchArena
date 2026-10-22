# Evaluation engine

The engine (`packages/shared/src/evaluation`) turns a diagram into an explainable score. It is **deterministic and side-effect free**: the same diagram and the same rubric version always produce the same report. The browser runs it for *Validate*, and the server runs the same code for *Evaluate* and stores the result.

Every report records `engineVersion` (currently `1.0.0`) and `rubricVersion`, so old attempts stay explainable after rules change.

## Inputs

- **Diagram** — `DiagramSnapshot`: components (type, label, properties), connections (type, protocol, sync/async, direction, criticality), notes and groups. Positions, notes and groups never affect the score.
- **Rubric** — the question's checks, optional category weights, discouraged components, an optional critical-score cap and structural options.
- **Difficulty** — Easy questions treat some structural findings as gentle hints instead of warnings (see below).

## Checks and rules

A rubric is a list of checks. Each check has a category, points, a rule, and pass, fail and fix texts. It can also be marked **critical** (failing it caps the score), **optional** (bonus only), or tagged with a concern (`security` or `bottleneck`) so it appears in the matching report section.

Rules match components with **selectors**: by type, by tag (for example `cache`, `channel`, `client`), by label words, or by property value. A component that is not connected to anything never satisfies a rule, so an unconnected component cannot earn credit.

| Rule | Passes when | Partial when |
| --- | --- | --- |
| `has(sel, min)` | At least `min` connected components match | Fewer than `min`, or they exist but are unconnected |
| `path(from, to, via[], maxHops)` | A directed path exists that passes through each `via` in order | A path exists that skips the required waypoints, or the arrows point the wrong way |
| `edge(from, to, min)` | A direct connection exists (from `min` distinct callers) | Only reversed, indirect, or from too few callers |
| `async(producer, consumer, channel)` | producer → queue/stream → consumer | Half-wired channel, or a direct synchronous call instead |
| `guarded(from, to, guard)` | Every path from `from` to `to` passes through `guard` | Some path bypasses the guard |
| `redundant(sel)` | Every matching component is redundant (multiple/autoscaled instances, replication, HA, multi-region, managed, or sibling instances behind the same upstream) | Some are |
| `prop(sel, key, values)` | A matching component has the property set to an accepted value | Set to another value |
| `edgeProp`, `absent`, `noEdge`, `any`, `all` | As named; `any`/`all` combine rules | — |

Statuses map to credit: **pass = 100%**, **partial = 50%**, **fail = 0%**. A fourth status, **needs configuration**, means "set this property so I can judge it". It earns no credit, the report says exactly which property to set, and it is never reported as a wrong answer.

## Categories and weights

| Category | Default weight |
| --- | --- |
| Functional correctness | 25 |
| Connections & data flow | 20 |
| Component selection | 15 |
| Scalability | 15 |
| Reliability & availability | 10 |
| Data storage & caching | 10 |
| Simplicity & efficiency | 5 |

A question can override weights. For each category:

```text
base  = min(1, (earned on required checks + earned on optional checks) / points of required checks)
value = clamp(base − structural penalty, 0, 1)
```

- **Connections are first-class.** Every required flow rule (`path`, `edge`, `async`, `guarded`, or combinations of them) from any category also counts towards *Connections & data flow*. A design with the right boxes but wrong wiring loses points in two places.
- A category with no checks and no penalties is **not assessed**, and the remaining weights are rescaled to 100. *Simplicity* and *Connections* are always assessed through structural analysis.
- **Final score** = Σ value × weight share, rounded to an integer between 0 and 100.

### Critical failures

If any critical check fails (or needs configuration), the score is capped at **50** (configurable per rubric). The report lists each critical gap and says that the cap was applied.

## Structural analysis

Independent of the rubric, the engine looks for problems in the diagram's structure. Each finding has a severity, a category, a penalty, and a per-code cap so one repeated mistake cannot wipe out a whole category.

| Code | Category | Penalty (cap) | Meaning |
| --- | --- | --- | --- |
| `no-client` | Connections | 0.25 | No client, so no request can start |
| `isolated-component` | Connections | 0.08 each (0.45) | Component with no connections |
| `disconnected-cluster` | Connections | 0.12 each (0.30) | Group of components no client can reach |
| `client-to-store` | Connections | 0.18 (0.45) | Client talks straight to a database, cache, queue or index |
| `store-initiates` | Connections | 0.08 (0.30) | A data store calls a service (arrow probably reversed). Store → stream (CDC) is allowed |
| `push-to-client` | Connections | 0.04 (0.15) | Arrow into a client from something that cannot push |
| `client-to-client` | Connections | 0.06 (0.15) | Clients bypass the backend |
| `channel-no-producer` / `channel-no-consumer` | Connections | 0.15 (0.40) | Queue or stream missing one side |
| `worker-no-input` | Connections | 0.08 (0.25) | Worker with nothing to trigger it |
| `broken-edge`, `self-loop` | Connections | 0.10 | Dangling or self connection |
| `exposed-service` | Reliability | 0.10, or 0.02 on Easy (0.30) | Client calls a service with no load balancer or gateway |
| `spof` | Reliability | 0.12, or 0.04 on Easy (0.45) | Single instance or unreplicated database on the request path |
| `duplicate-edge` | Simplicity | 0.10 (0.20) | Same connection drawn twice |
| `discouraged-component` | Simplicity | 0.30 (0.60) | A component the question marks as unnecessary |
| `excess-components` | Simplicity | 0.40 | Far more components than a solid answer needs (more than max(2×, +8) the reference size) |

## The report

Every evaluation returns: score, rating, stars and label; per-category scores with plain-language deductions; every check with its status and evidence (the exact path found, or why none was found); requirement coverage (each requirement is linked to the checks that prove it); missing components; missing, invalid and disconnected connections; bottlenecks; unnecessary complexity; security concerns; strengths; weaknesses; and suggestions ranked by how many points they would recover. Findings carry node and edge ids, so the UI can highlight them on the canvas.

## Stars, rating, XP and levels

All values are in `packages/shared/src/gamification/config.ts`.

| Score | Stars |
| --- | --- |
| 0–39 | 0 |
| 40–54 | 1 |
| 55–69 | 2 |
| 70–79 | 3 |
| 80–89 | 4 |
| 90–100 | 5 |

- **Rating** = score ÷ 20, shown with one decimal (for example 86 → 4.3). It is separate from stars.
- **Completion** requires a final submission scoring at least 40.
- **Challenge XP value** = base × quality + stars × 20, where base is 100 / 200 / 350 (Easy / Medium / Hard) and quality scales from 0.5 to 1.0 with the score.
- **Paid XP** = the challenge value minus what was already paid for that question. Improving your best submission pays only the difference, and resubmitting the same quality pays nothing.
- One-time bonuses per question: **first completion +50**, and **no hints opened +25**. Opening hints only skips this bonus; it never costs XP.
- **Achievements** (8) pay their XP once per user.
- **Levels:** reaching level L needs 50 × (L − 1) × (L + 2) total XP. Titles change every three levels.
- **Fair use:** 60 server evaluations per question per user per day, plus per-minute rate limits.

All rewards are computed on the server from the stored evaluation, inside a locked transaction with unique dedupe keys. See [ARCHITECTURE.md](ARCHITECTURE.md#server-authoritative-rewards).

## What is not automated

The engine judges **structure and configuration**: which components exist, how they are connected, in which direction, through which intermediaries, and with which properties. It deliberately does not:

- Read notes or free-text connection descriptions to judge reasoning. (Labels are only used to tell apart several components of the same type, for example "Region A" and "Region B".)
- Run capacity maths (for example "is 3 shards enough for 50k writes/s?"). Scale shows up through properties such as instances, partitioning and replication.
- Simulate failures or latency.
- Give credit for designs that are valid but very different from anything the rubric anticipates. Rubrics accept common alternatives (for example "a cache **or** a CDN", "a gateway **or** a load balancer"), but not every valid design.

Possible future enhancements, kept separate from the deterministic score:

- An optional AI reviewer that comments on notes and trade-offs, shown as advisory feedback rather than points.
- Back-of-the-envelope calculators linked to the question's expected scale.
- Community-submitted alternative reference designs, reviewed before they influence rubrics.
