# Interview Prep: adding questions

The **Interview Prep** tab (`/prep`) is a bank of interview questions grouped into categories and sections. Each answer is explained in several parts, in English and Hinglish, and ends with an interview-ready answer.

Everything lives in `apps/web/src/features/prep/`. No server, database or migration is involved — questions are part of the web app, so they work in the browser-only (GitHub Pages) build and offline.

## Where things are

| File | What it holds |
| --- | --- |
| `catalog.ts` | Categories (Frontend, Backend, Databases…) and their sections (for example General frontend, React, Angular) |
| `content/*.ts` | The questions, one file per area (`backend.ts`, `database.ts`, `devops.ts`…) |
| `content/index.ts` | Collects every file into `PREP_QUESTIONS` (sorted by category and section) |
| `types.ts` | The `PrepQuestion` shape — every field is documented there |
| `test/prep.test.ts` (in `apps/web`) | Checks every question is complete, bilingual and linked correctly |

## Add a question

1. Pick the category and section in `catalog.ts`. To add a new section (say “Vue” under Frontend), add `{ id: 'vue', title: 'Vue', description: bi('…', '…') }` to that category’s `topics`.
2. Add the question to the matching `content/*.ts` file (or a new file that you add to `content/index.ts`). Copy an existing question of the same kind as a template.
3. Run `npm test -w @arch-arena/web`. The tests tell you exactly what is missing.

### The parts of an answer

| Field | Required | Shown as |
| --- | --- | --- |
| `id` | yes | The URL: `/prep/<category>/<id>`. Lower-case words joined by `-`, unique |
| `category`, `topic` | yes | Where it appears |
| `question` | yes | The question (English as asked in interviews, plus Hinglish) |
| `kind` | yes | `concept`, `scenario`, `comparison` or `behavioral` |
| `level` | yes | `beginner`, `intermediate` or `advanced` |
| `tags` | yes | Extra search words |
| `scenario` | for scenario and behavioral questions | “The scenario, explained” — what is going on and what the interviewer is testing |
| `simple` | yes | “In simple words” |
| `example` | yes | “Real-life example” — an everyday analogy |
| `why` | when it makes sense | “Why we need it” |
| `without` | when it makes sense | “What happens without it” |
| `parts` + `partsTitle` | yes, unless there is a table | The detailed explanation, one titled part per principle or step |
| `table` | for comparisons | “At a glance” — a side-by-side table |
| `scene` | optional | A diagram, written with the same helpers as the Learn guides (`scene`, `c`, `a` from `features/learn/dsl.ts`). Keep edge labels and notes to a couple of words |
| `interview` | yes | “Interview-ready answer”: a one-line `opening`, at least four `points` and at least six `keywords` |
| `listenFor` | yes | “What the interviewer listens for” |
| `mistakes` | recommended | “Common mistakes” |
| `followUps` | recommended | “Likely follow-up questions”, each with a short answer |
| `related` | optional | Links to Learn guides (component types) and challenges (slugs) |

### Writing style

- Every explanation is written twice with `bi('English', 'Hinglish')`. Hinglish is Hindi in Roman script mixed with the English technical terms people actually use — not a word-for-word translation. The tests fail if the two are identical.
- Plain strings (no `bi`) are allowed only where text is the same in both languages: table cells with technical terms, part titles such as “Fix 2 — locks”, diagram labels.
- Start simple, then go deep. Explain any term the first time it appears. Prefer one concrete example over three abstract sentences.
- The interview answer is shown in English (interviews usually are); its Hinglish version appears under “Hinglish mein samjho”.
- Questions are shown in file order inside a section, so put easier questions first.
