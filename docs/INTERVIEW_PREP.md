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

### The shape of an answer

Answers follow one style: **simple, informative and straight to the point** — a short answer first, then numbered parts full of concrete examples, then what you would actually say in the interview. The REST API question (`content/backend.ts`) is the reference example.

| Field | Required | Shown as |
| --- | --- | --- |
| `id` | yes | The URL: `/prep/<category>/<id>`. Lower-case words joined by `-`, unique |
| `category`, `topic` | yes | Where it appears |
| `question` | yes | The question (English as asked in interviews, plus Hinglish) |
| `kind`, `level`, `tags` | yes | Badges and search |
| `answer` | yes | **Short answer** — the direct answer in two or three sentences, in the first person (“I focus on…”) |
| `sections` | yes, at least 3 | **Numbered parts**, each a title plus blocks (see below). Use a running example (an expense app, an order service) |
| `interview.text` | yes | **Interview-ready answer** — one or two spoken paragraphs; shown in English, with the Hinglish version behind “Hinglish mein samjho” |
| `interview.keywords` | yes, at least 6 | Terms to use |
| `listenFor` | yes | What the interviewer listens for |
| `mistakes` | recommended | Common mistakes |
| `followUps` | yes, at least 1 | Follow-up questions with how to answer them |
| `related` | optional | Links to Learn guides (component types) and challenges (slugs) |

Blocks, written with the helpers in `dsl.ts`:

| Helper | Use it for |
| --- | --- |
| `p(en, hi)` | A paragraph. Text supports `**bold**` and `` `inline code` `` |
| `h(en, hi)` | A sub-heading inside a part |
| `ul(...)`, `ol(...)` | Bullet or numbered lists; each item is `[English, Hinglish]` |
| `table(columns, rows)` | Endpoint lists, comparisons, “cause → check → fix” tables |
| `code(lang, source, title?)` | Code, commands, JSON, config, console output — never translated |
| `note(tone, en, hi)` | `important`, `tip`, `warning` or `example` callouts |
| `steps(...)` | A sequence: a migration, a debugging order, a deploy |
| `options(...)` | Alternatives side by side, optionally with a badge such as “My default” |
| `figure(scene)` | A diagram, using the Learn helpers (`scene`, `c`, `a`). Keep labels to a couple of words |

The tests require at least two concrete blocks (code, table, steps, options or a diagram) per answer, and a table for every comparison question.

### Glossary terms

Technical terms in answers are underlined automatically when they appear in the glossary (`apps/web/src/features/glossary/terms-*.ts`). If a new answer uses jargon that is not underlined, add a term there: a title, the aliases to match, a simple meaning in English and Hinglish and, when it helps, a real-life example. Terms that appear in the question itself are not underlined in its answer.

### Writing style

- Every explanation is written twice with `bi('English', 'Hinglish')`. Hinglish is Hindi in Roman script mixed with the English technical terms people actually use — not a word-for-word translation. The tests fail if the two are identical.
- Plain strings (no `bi`) are allowed only where text is the same in both languages: table cells with technical terms, part titles such as “Fix 2 — locks”, diagram labels.
- Write in the first person, the way you would answer: “I use…”, “My default is…”.
- Keep sentences short. Explain a term the first time it appears. Prefer one concrete example (an endpoint, a JSON body, a command, a number) over three abstract sentences.
- Questions are shown in file order inside a section, so put easier questions first.
