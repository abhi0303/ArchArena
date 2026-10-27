import { bi, code, note, p, section, table, ul } from '../dsl';
import type { PrepQuestion } from '../types';

export const practicesQuestions: PrepQuestion[] = [
  {
    id: 'how-do-you-ensure-quality',
    category: 'practices',
    topic: 'quality',
    question: bi('How do you ensure your work is of good quality?', 'Aap kaise ensure karte ho ki aapka kaam acchi quality ka hai?'),
    kind: 'behavioral',
    level: 'beginner',
    tags: ['quality', 'testing', 'code review', 'ci', 'shift left', 'test pyramid', 'tdd'],
    answer: bi(
      'I build quality in from the start instead of relying on QA at the end — “shift left”. I clarify requirements and edge cases, keep changes small, write tests myself at the right levels, let CI run every check automatically on each pull request, get a proper code review, and watch the feature in production after release.',
      'Main aakhir mein QA pe nirbhar rehne ki jagah shuru se quality banata hoon — “shift left”. Requirements aur edge cases saaf karta hoon, changes chhote rakhta hoon, sahi levels pe tests khud likhta hoon, CI ko har pull request pe har check apne aap chalane deta hoon, dhang ka code review karwata hoon, aur release ke baad production mein feature dekhta hoon.',
    ),
    sections: [
      section(
        'Before coding',
        'Coding se pehle',
        ul(
          ['Clarify acceptance criteria and edge cases: empty lists, invalid input, duplicates, permissions, time zones.', 'Acceptance criteria aur edge cases saaf karo: khaali lists, galat input, duplicates, permissions, time zones.'],
          ['Note the non-functional needs — performance, security, accessibility.', 'Non-functional zarooratein note karo — performance, security, accessibility.'],
          ['For bigger changes, a short design note that a teammate reviews.', 'Badi changes ke liye ek chhota design note jise saathi review kare.'],
        ),
      ),
      section(
        'Testing at the right levels',
        'Sahi levels pe testing',
        table(
          ['Test type', bi('What it checks', 'Kya check karta hai'), 'Speed', bi('How many', 'Kitne')],
          [
            ['Unit', bi('One function or class on its own', 'Ek function ya class akele'), bi('Milliseconds', 'Milliseconds mein'), bi('Many', 'Bahut saare')],
            ['Integration', bi('Code with a real database, API or queue', 'Asli database, API ya queue ke saath code'), bi('Seconds', 'Seconds mein'), bi('Some', 'Kuch')],
            ['Contract', bi('Two services agree on their API', 'Do services apne API pe sehmat hain'), 'Fast', bi('One per integration', 'Har integration pe ek')],
            ['End-to-end', bi('A real user journey through the whole app', 'Poori app mein ek asli user journey'), 'Slow', bi('A few critical paths', 'Kuch critical paths')],
          ],
        ),
        p('I write the tests myself, and every bug fix comes with a regression test. A unit test for a pricing rule:', 'Main tests khud likhta hoon, aur har bug fix ke saath regression test aata hai. Ek pricing rule ka unit test:'),
        code(
          'ts',
          `
describe('calculateTotal', () => {
  it('applies the discount before tax', () => {
    expect(calculateTotal({ subtotal: 1000, discount: 0.1, taxRate: 0.18 })).toBe(1062);
  });

  it('never returns a negative total', () => {
    expect(calculateTotal({ subtotal: 100, discount: 2, taxRate: 0.18 })).toBe(0);
  });
});`,
        ),
      ),
      section(
        'Automation in CI',
        'CI mein automation',
        ul(
          ['Lint, formatting and type checks.', 'Lint, formatting aur type checks.'],
          ['Unit and integration tests with coverage.', 'Coverage ke saath unit aur integration tests.'],
          ['Dependency and secret scanning, static analysis.', 'Dependency aur secret scanning, static analysis.'],
          ['Branch protection: nothing merges unless every check is green and a reviewer approved.', 'Branch protection: har check green aur reviewer approval ke bina kuch merge nahi hota.'],
        ),
        note(
          'tip',
          'Automation means nobody has to remember the checks — and feedback arrives in minutes, while the change is still fresh in your head.',
          'Automation ka matlab hai kisi ko checks yaad nahi rakhne padte — aur feedback minutes mein aata hai, jab change abhi dimaag mein taaza hai.',
        ),
      ),
      section(
        'Code review',
        'Code review',
        ul(
          ['Small pull requests with a clear description and screenshots.', 'Saaf description aur screenshots ke saath chhote pull requests.'],
          ['I review my own diff first.', 'Main pehle apna diff khud review karta hoon.'],
          ['When reviewing others, I look at correctness, design, tests, security and readability — not just style.', 'Doosron ka review karte waqt correctness, design, tests, security aur readability dekhta hoon — sirf style nahi.'],
        ),
      ),
      section(
        'After the release',
        'Release ke baad',
        ul(
          ['Feature flags and canary releases for risky changes.', 'Risky changes ke liye feature flags aur canary releases.'],
          ['Error tracking and dashboards to catch what tests missed.', 'Tests se chhoote problems pakadne ke liye error tracking aur dashboards.'],
          ['I track escaped bugs, flaky tests and the change failure rate, and improve the process when they rise.', 'Main escaped bugs, flaky tests aur change failure rate track karta hoon, aur badhne pe process sudhaarta hoon.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I treat quality as part of the work from the start rather than something QA checks at the end. Before coding I clarify acceptance criteria and edge cases. I keep changes small and write the tests myself across the test pyramid — many fast unit tests, focused integration and contract tests, and a few end-to-end tests for critical journeys — and every bug fix gets a regression test.',
          'Main quality ko shuru se kaam ka hissa maanta hoon, na ki aisi cheez jo QA aakhir mein check kare. Coding se pehle acceptance criteria aur edge cases saaf karta hoon. Changes chhote rakhta hoon aur test pyramid ke har level pe tests khud likhta hoon — bahut saare fast unit tests, focused integration aur contract tests, aur critical journeys ke liye kuch end-to-end tests — aur har bug fix ke saath regression test.',
        ),
        bi(
          'All of it runs in CI on every pull request — lint, type checks, static analysis, security scans and tests — with branch protection, so nothing merges unless it is green and reviewed. After release I use feature flags, canaries and error tracking, and I watch signals like escaped defects, flaky tests and change failure rate to keep improving.',
          'Yeh sab har pull request pe CI mein chalta hai — lint, type checks, static analysis, security scans aur tests — branch protection ke saath, to green aur reviewed hue bina kuch merge nahi hota. Release ke baad feature flags, canaries aur error tracking use karta hoon, aur escaped defects, flaky tests aur change failure rate jaise signals dekh ke sudhaar karta rehta hoon.',
        ),
      ],
      keywords: ['Shift left', 'Test pyramid', 'Unit / integration / E2E tests', 'Contract testing', 'Regression test', 'TDD', 'Continuous Integration', 'Branch protection', 'Static analysis', 'Code review', 'Change failure rate (DORA)'],
    },
    listenFor: [
      bi('Do they talk about different types of testing and the benefit of each?', 'Kya woh alag-alag testing types aur har ek ke fayde ki baat karte hain?'),
      bi('Do they write the tests themselves, and do the tests run in CI?', 'Kya woh tests khud likhte hain, aur kya tests CI mein chalte hain?'),
      bi('Do they have a shift-left mentality?', 'Kya unki soch shift-left hai?'),
    ],
    mistakes: [bi('“QA tests it.”', '“QA test karta hai.”'), bi('Chasing 100% coverage as the goal.', '100% coverage ko hi lakshya banana.')],
    followUps: [
      {
        q: bi('How do you deal with flaky tests?', 'Flaky tests ka kya karte ho?'),
        a: bi(
          'Track them, quarantine them and fix them quickly — they usually come from timing, shared state or external dependencies. Ignoring them destroys trust in CI.',
          'Unhe track karo, alag karo aur jaldi theek karo — aam taur pe yeh timing, shared state ya external dependencies se aate hain. Ignore karne se CI pe bharosa khatam ho jaata hai.',
        ),
      },
    ],
  },
];
