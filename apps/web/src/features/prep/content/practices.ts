import { bi } from '@/features/learn/dsl';
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
    scenario: bi(
      'A broad question about your engineering habits. The interviewer wants to hear about the different kinds of testing and the benefit of each, whether you write the tests yourself, whether they run automatically in CI, and whether you think about quality early (“shift left”) instead of relying on QA at the end. Strong answers also mention clear requirements, code review and watching the feature in production.',
      'Aapki engineering aadaton ke baare mein ek bada sawaal. Interviewer alag-alag tarah ki testing aur har ek ke fayde ke baare mein sunna chahta hai, kya aap tests khud likhte ho, kya woh CI mein apne aap chalte hain, aur kya aap quality ke baare mein shuru se sochte ho (“shift left”) na ki aakhir mein QA pe chhod dete ho. Mazboot jawab saaf requirements, code review aur production mein feature dekhne ki baat bhi karte hain.',
    ),
    simple: bi(
      'Quality is built in at every step, not checked at the end. I clarify the requirements and edge cases first, make small clean changes with tests (unit, integration and end-to-end where it matters), let CI run every check automatically on every change, ask for code review, and watch the feature in production after release.',
      'Quality har step pe banaayi jaati hai, aakhir mein check nahi ki jaati. Main pehle requirements aur edge cases saaf karta hoon, tests ke saath chhote saaf changes karta hoon (unit, integration aur jahan zaroori ho end-to-end), CI ko har change pe har check apne aap chalane deta hoon, code review karwata hoon, aur release ke baad production mein feature dekhta hoon.',
    ),
    example: bi(
      'A good cook tastes the dish while cooking (unit tests), checks that the dishes work together as a meal (integration tests), has someone else taste before serving (code review), follows hygiene checks every single day (CI), and asks diners for feedback (monitoring). They do not wait for the food inspector to find the problems (QA at the end).',
      'Accha cook pakaate waqt dish chakhta hai (unit tests), dekhta hai ki dishes milke ek accha khaana banti hain (integration tests), serve karne se pehle kisi aur se chakhwata hai (code review), roz safai ke checks follow karta hai (CI), aur khaane walon se feedback leta hai (monitoring). Woh food inspector ke problems dhoondhne ka wait nahi karta (aakhir mein QA).',
    ),
    why: bi(
      'Bugs are cheapest to fix when caught early — while writing the code — and most expensive once customers find them in production.',
      'Bugs sabse saste tab theek hote hain jab jaldi pakde jaayein — code likhte waqt — aur sabse mehenge tab jab customers unhe production mein dhoondh lein.',
    ),
    without: bi(
      'Without these habits, bugs reach users, releases become scary, refactoring is avoided because nothing protects you, and the codebase slowly rots.',
      'In aadaton ke bina bugs users tak pahunchte hain, releases darawne ho jaate hain, refactoring se bachte ho kyunki koi suraksha nahi, aur codebase dheere-dheere sadta jaata hai.',
    ),
    table: {
      columns: ['Test type', 'What it checks', 'Speed', 'How many'],
      rows: [
        ['Unit', bi('One function or class on its own', 'Ek function ya class akele'), bi('Milliseconds', 'Milliseconds mein'), bi('Many', 'Bahut saare')],
        ['Integration', bi('Pieces working together: database, APIs, queues', 'Hisse saath mein: database, APIs, queues'), bi('Seconds', 'Seconds mein'), bi('Some', 'Kuch')],
        ['Contract', bi('Two services agree on their API', 'Do services apne API pe sehmat hain'), 'Fast', bi('One per integration', 'Har integration pe ek')],
        ['End-to-end', bi('A real user journey through the whole system', 'Poore system se ek asli user journey'), bi('Slow, can be flaky', 'Slow, flaky ho sakte hain'), bi('A few critical paths', 'Kuch critical paths')],
        ['Non-functional', 'Performance, security, accessibility', bi('Varies', 'Alag-alag'), bi('For key flows', 'Zaroori flows ke liye')],
      ],
    },
    partsTitle: bi('What to talk about', 'Kin baaton pe bolein'),
    parts: [
      {
        title: bi('Understand the problem first', 'Pehle problem samjho'),
        text: bi(
          'Clarify requirements, acceptance criteria, edge cases and non-functional needs (performance, security) before coding; write a short design note for bigger changes.',
          'Coding se pehle requirements, acceptance criteria, edge cases aur non-functional zarooratein (performance, security) saaf karo; badi changes ke liye chhota design note likho.',
        ),
      },
      {
        title: bi('The testing pyramid', 'Testing pyramid'),
        text: bi(
          'Many fast unit tests for logic, fewer integration tests for the real database and APIs, and a few end-to-end tests for the critical user journeys — plus contract, performance, security and accessibility tests where they matter.',
          'Logic ke liye bahut saare fast unit tests, asli database aur APIs ke liye kam integration tests, aur critical user journeys ke liye kuch end-to-end tests — plus jahan zaroori ho contract, performance, security aur accessibility tests.',
        ),
      },
      {
        title: bi('I write the tests myself', 'Tests main khud likhta hoon'),
        text: bi(
          'Alongside the code, or before it (TDD) for tricky logic. Every bug fix comes with a regression test that would have caught the bug.',
          'Code ke saath, ya mushkil logic ke liye usse pehle (TDD). Har bug fix ke saath ek regression test jo us bug ko pakad leta.',
        ),
      },
      {
        title: bi('Shift left and automate', 'Shift left aur automate'),
        text: bi(
          'Linters, formatters, type checking, static analysis and dependency/security scans run in pre-commit hooks and in CI on every pull request. Branch protection blocks merging until everything is green, so feedback is fast and nobody has to remember the checks.',
          'Linters, formatters, type checking, static analysis aur dependency/security scans pre-commit hooks mein aur har pull request pe CI mein chalte hain. Branch protection sab green hone tak merge rokta hai, to feedback jaldi milta hai aur kisi ko checks yaad nahi rakhne padte.',
        ),
      },
      {
        title: 'Code review',
        text: bi(
          'Small PRs with clear descriptions, reviewing my own diff first, and reviewing other people’s code thoughtfully — correctness, design, tests, security and readability.',
          'Saaf description ke saath chhote PRs, pehle apna diff khud review karna, aur doosron ka code dhyaan se review karna — correctness, design, tests, security aur readability.',
        ),
      },
      {
        title: bi('Clean, simple design', 'Saaf, simple design'),
        text: bi(
          'Clear names, single responsibility, no premature complexity, continuous small refactoring, and documentation where it helps.',
          'Saaf naam, single responsibility, waqt se pehle complexity nahi, lagaataar chhoti refactoring, aur jahan madad kare wahan documentation.',
        ),
      },
      {
        title: bi('Quality continues in production', 'Quality production mein bhi chalti hai'),
        text: bi(
          'Feature flags, canary releases, error tracking and dashboards — and learning from every incident.',
          'Feature flags, canary releases, error tracking aur dashboards — aur har incident se seekhna.',
        ),
      },
      {
        title: bi('Measure and improve', 'Naapo aur sudhaaro'),
        text: bi(
          'Use test coverage as a guide rather than a target, and watch escaped defects, flaky tests and the change failure rate (one of the DORA metrics).',
          'Test coverage ko target nahi, guide ki tarah use karo, aur escaped defects, flaky tests aur change failure rate (DORA metrics mein se ek) pe nazar rakho.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I treat quality as part of the work from the start — shift left: clear requirements, small well-designed changes, tests I write myself across the test pyramid, automated checks in CI on every pull request, thoughtful code review, and monitoring after release.',
        'Main quality ko shuru se kaam ka hissa maanta hoon — shift left: saaf requirements, chhote acche design wale changes, test pyramid ke har level pe khud likhe tests, har pull request pe CI mein automated checks, dhyaan se code review, aur release ke baad monitoring.',
      ),
      points: [
        bi('Clarify acceptance criteria and edge cases before coding.', 'Coding se pehle acceptance criteria aur edge cases saaf karo.'),
        bi('Testing pyramid: many unit tests, focused integration and contract tests, a few end-to-end tests for critical journeys.', 'Testing pyramid: bahut unit tests, focused integration aur contract tests, critical journeys ke liye kuch end-to-end tests.'),
        bi('I write and maintain the tests; every bug fix gets a regression test.', 'Tests main likhta aur sambhaalta hoon; har bug fix ke saath regression test.'),
        bi('CI runs lint, type-check, static analysis, security scans and tests on every PR; merges are blocked unless green.', 'CI har PR pe lint, type-check, static analysis, security scans aur tests chalata hai; green hue bina merge nahi.'),
        bi('Small PRs, self-review, and peer review with clear descriptions.', 'Chhote PRs, self-review, aur saaf description ke saath peer review.'),
        bi('Quality in production: feature flags, canaries, error tracking and dashboards.', 'Production mein quality: feature flags, canaries, error tracking aur dashboards.'),
        bi('Track escaped defects, flaky tests and change failure rate to improve the process.', 'Process sudhaarne ke liye escaped defects, flaky tests aur change failure rate track karo.'),
      ],
      keywords: [
        'Shift left',
        'Test pyramid',
        'Unit / integration / end-to-end tests',
        'Contract testing',
        'TDD',
        'Regression test',
        'Continuous Integration',
        'Static analysis',
        'Code review',
        'Definition of Done',
        'Test coverage',
        'Change failure rate (DORA)',
      ],
    },
    listenFor: [
      bi('Do they talk about different types of testing and the benefit of each?', 'Kya woh alag-alag testing types aur har ek ke fayde ki baat karte hain?'),
      bi('Do they write the tests themselves?', 'Kya woh tests khud likhte hain?'),
      bi('Do the tests run in CI?', 'Kya tests CI mein chalte hain?'),
      bi('Do they have a shift-left mentality?', 'Kya unki soch shift-left hai?'),
    ],
    mistakes: [
      bi('“QA tests it.”', '“QA test karta hai.”'),
      bi('Only manual testing.', 'Sirf manual testing.'),
      bi('Chasing 100% coverage as the goal.', '100% coverage ko hi lakshya banana.'),
      bi('No mention of CI or automation.', 'CI ya automation ka koi zikr nahi.'),
    ],
    followUps: [
      {
        q: bi('Unit tests vs integration tests?', 'Unit tests aur integration tests mein kya fark hai?'),
        a: bi(
          'Unit tests check one piece in isolation, with its dependencies replaced by fakes. Integration tests check real pieces working together — for example your code with a real database.',
          'Unit tests ek hisse ko akele check karte hain, uski dependencies ki jagah nakli cheezein lagaake. Integration tests asli hisson ko saath kaam karte check karte hain — jaise aapka code asli database ke saath.',
        ),
      },
      {
        q: bi('How do you deal with flaky tests?', 'Flaky tests ka kya karte ho?'),
        a: bi(
          'Track them, quarantine them and fix them quickly — they usually come from timing, shared state or external dependencies. Never just ignore them: they destroy trust in CI.',
          'Unhe track karo, alag karo aur jaldi theek karo — aam taur pe yeh timing, shared state ya external dependencies se aate hain. Kabhi ignore mat karo: yeh CI pe bharosa khatam kar dete hain.',
        ),
      },
    ],
  },
];
