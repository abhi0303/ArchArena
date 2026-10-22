import { R, S, T, ck, defineQuestion } from '../dsl';
import type { QuestionDefinition } from '../types';

const PRIMER = 'https://github.com/donnemartin/system-design-primer';

export const easyQuestions: QuestionDefinition[] = [
  // ───────────────────────────────────────────────────────────────────────────
  defineQuestion({
    id: 'e01',
    slug: 'url-shortener-basic',
    title: 'URL Shortener (Basic)',
    difficulty: 'easy',
    category: 'Web Services',
    minutes: 25,
    tags: ['hashing', 'key-value', 'caching', 'read-heavy'],
    concepts: ['Short code generation', 'Read-heavy workloads', 'Cache-aside', 'Unique constraints'],
    statement: {
      en: 'Design a service that turns long URLs into short links (like bit.ly/abc123). When anyone opens a short link, they must be redirected to the original URL quickly. Focus on a clean, working first version for a single region.',
      hi: 'Ek aisi service design karo jo lambe URLs ko chhote links mein badal de (jaise bit.ly/abc123). Jab bhi koi short link open kare, use turant original URL pe redirect hona chahiye. Abhi ek single region ke liye ek clean, working first version pe focus karo.',
    },
    functional: [
      ['Users can submit a long URL and get back a unique short code.', 'User ek lamba URL submit kare aur use ek unique short code wapas mile.', ['create-flow', 'unique-codes']],
      ['Opening a short link redirects to the original URL.', 'Short link open karne pe user original URL pe redirect ho jaye.', ['create-flow', 'redirect-cache']],
      ['Short links keep working until they expire or are deleted.', 'Short links tab tak kaam karte rahein jab tak woh expire ya delete na ho jayein.', ['persist']],
    ],
    nonFunctional: [
      ['Redirects should be fast (well under 100 ms on a cache hit).', 'Redirects fast hone chahiye (cache hit pe 100 ms se kaafi kam).', ['redirect-cache']],
      ['The service should handle traffic spikes without going down.', 'Traffic spike aaye toh bhi service down nahi honi chahiye.', ['entry', 'scale-out']],
      ['A mapping, once created, must never be lost.', 'Ek baar mapping ban gayi toh woh kabhi lose nahi honi chahiye.', ['persist', 'db-replication']],
    ],
    constraints: {
      en: [
        'Reads (redirects) outnumber writes (new links) roughly 100 to 1.',
        'Short codes are 7 characters from [a-zA-Z0-9].',
        'Custom aliases and analytics are out of scope for this version.',
      ],
      hi: [
        'Reads (redirects) writes (naye links) se lagbhag 100 guna zyada hain.',
        'Short codes 7 characters ke hain, [a-zA-Z0-9] se bane.',
        'Custom aliases aur analytics is version ke scope mein nahi hain.',
      ],
    },
    clarifications: [
      [
        'Can two different long URLs ever get the same short code?',
        'Kya do alag long URLs ko kabhi same short code mil sakta hai?',
        'No. Code generation must be collision-safe, e.g. a unique constraint on the code column or an ID generator.',
        'Nahi. Code generation collision-safe honi chahiye, jaise code column pe unique constraint ya ek ID generator.',
      ],
      [
        'Should redirects be 301 or 302?',
        'Redirect 301 hona chahiye ya 302?',
        'Either is fine; 302 keeps redirects flowing through your service, 301 lets browsers cache them.',
        'Dono theek hain; 302 se redirects tumhari service se hokar jaate hain, 301 se browser unhe cache kar leta hai.',
      ],
    ],
    scale: [
      ['New links per day', '1 million'],
      ['Redirects per day', '100 million (~1,200/s average)'],
      ['Stored mappings after 5 years', '~2 billion'],
    ],
    hints: [
      ['This is a read-heavy key-value lookup: short code → long URL. What makes the read path fast?', 'Yeh ek read-heavy key-value lookup hai: short code → long URL. Read path ko fast kya banayega?'],
      ['Think about cache-aside: check a cache first and only go to the database on a miss.', 'Cache-aside ke baare mein socho: pehle cache check karo, miss hone par hi database pe jao.'],
      ['You need a durable store for mappings and a way to guarantee codes are unique (unique constraint or ID generator).', 'Mappings ke liye ek durable store chahiye, aur codes unique rahein iska guarantee bhi (unique constraint ya ID generator).'],
      ['Random codes need a collision check; counter-based codes (base62 of an ID) avoid collisions but are guessable. Pick one and explain why.', 'Random codes mein collision check lagta hai; counter-based codes (ID ka base62) collision se bachte hain par guess ho sakte hain. Ek choose karo aur reason batao.'],
    ],
    rubric: {
      checks: [
        ck({
          id: 'create-flow',
          cat: 'functional',
          pts: 4,
          title: 'Create and redirect requests reach the URL service and storage',
          rule: R.path(S.client, S.db, [S.service]),
          pass: 'Requests flow from the client through the URL service to the database, covering both shortening and redirects.',
          fail: 'There is no complete flow from the client through an application service to the database, so links cannot be created or resolved.',
          fix: 'Connect Client → (Load Balancer) → URL Service → Database so the service can store new mappings and look them up on redirect.',
          critical: true,
        }),
        ck({
          id: 'persist',
          cat: 'functional',
          pts: 3,
          title: 'Mappings are stored durably',
          rule: R.edge(S.service, S.db),
          pass: 'The service writes mappings to a durable database.',
          fail: 'The service is not connected to a durable database, so links would disappear on restart.',
          fix: 'Connect the URL service directly to a database that stores short code → long URL mappings.',
          critical: true,
        }),
        ck({
          id: 'unique-codes',
          cat: 'data',
          pts: 2,
          title: 'Short codes cannot collide',
          rule: R.any(
            R.has(S.idGen),
            R.prop(S.db, 'concurrencyControl', ['conditional-writes', 'serializable', 'optimistic', 'pessimistic-locks']),
          ),
          pass: 'Code generation is collision-safe (ID generator or conditional/unique writes).',
          fail: 'Nothing guarantees uniqueness of short codes, so two URLs could receive the same code.',
          fix: 'Use an ID generator (base62 of a unique ID) or set the database’s Concurrency control to conditional/unique writes so duplicates are rejected and retried.',
        }),
        ck({
          id: 'redirect-cache',
          cat: 'data',
          pts: 3,
          title: 'Hot redirects are served from a cache',
          rule: R.edge(S.service, S.cache),
          pass: 'The service checks a cache before the database (cache-aside), keeping redirects fast.',
          fail: 'Every redirect hits the database, which adds latency and limits read throughput.',
          fix: 'Connect the URL service to a cache (cache-aside) in addition to the database. Popular codes are then served from memory in under a millisecond.',
        }),
        ck({
          id: 'cache-policy',
          cat: 'data',
          pts: 1,
          optional: true,
          title: 'Cache eviction policy chosen',
          rule: R.prop(S.cache, 'evictionPolicy', ['lru', 'lfu', 'ttl']),
          pass: 'The cache has an eviction policy, so it keeps the hottest links in memory.',
          fail: 'The cache eviction policy is not set.',
          fix: 'Set an eviction policy such as LRU so the cache keeps popular links and evicts cold ones.',
        }),
        ck({
          id: 'store-choice',
          cat: 'components',
          pts: 3,
          title: 'A database stores the mappings',
          rule: R.has(S.db),
          pass: 'A database is used for the code → URL mappings.',
          fail: 'No database stores the mappings.',
          fix: 'Add a database. A key-value/NoSQL store or a SQL table with an index on the short code both work.',
        }),
        ck({
          id: 'cache-choice',
          cat: 'components',
          pts: 2,
          title: 'A cache is part of the design',
          rule: R.has(S.cache),
          pass: 'A cache absorbs the read-heavy redirect traffic.',
          fail: 'No cache, even though redirects outnumber writes 100:1.',
          fix: 'Add a distributed cache for hot short codes.',
        }),
        ck({
          id: 'service-choice',
          cat: 'components',
          pts: 2,
          title: 'An application service owns the logic',
          rule: R.has(S.service),
          pass: 'A dedicated service handles shortening and redirects.',
          fail: 'There is no application service to generate codes and handle redirects.',
          fix: 'Add an Application Server (the URL service) between clients and storage.',
        }),
        T.entry({ pts: 2 }),
        T.scaleOut(S.service, { pts: 2 }),
        T.dbReplication(S.db, { pts: 2 }),
        T.observability(),
      ],
      discouraged: [
        { types: ['data-warehouse', 'event-stream', 'ml-service', 'transcoder', 'media-server'], reason: 'is not needed for a basic URL shortener and only adds moving parts.' },
      ],
    },
    reference: {
      nodes: [
        ['web', 'web-client', 'Users create short links and open them in a browser.'],
        ['lb', 'load-balancer', 'Spreads requests across URL service instances and removes unhealthy ones.', { props: { lbAlgorithm: 'round-robin', healthChecks: true } }],
        ['app', 'app-server', 'Stateless URL service: generates base62 codes on create, resolves codes on redirect.', { label: 'URL Service', props: { instances: 'autoscaled', stateless: true, role: 'Shorten and redirect' } }],
        ['cache', 'distributed-cache', 'Cache-aside store for hot short codes; most redirects never touch the database.', { label: 'Redirect Cache', props: { evictionPolicy: 'lru', writePolicy: 'cache-aside', ttl: '24h' } }],
        ['db', 'sql-db', 'Durable mapping table with a unique index on short_code; inserts that collide are retried with a new code.', { label: 'URL Mappings DB', props: { replication: 'leader-follower-async', concurrencyControl: 'conditional-writes', backups: 'daily' } }],
        ['mon', 'metrics-monitoring', 'Tracks redirect latency, cache hit rate and error rates.'],
      ],
      edges: [
        'web>lb',
        ['lb>app', 'All traffic goes through the load balancer so URL service instances can scale and fail independently.'],
        ['app>cache', 'Redirects check the cache first (cache-aside) — this is what keeps the read path fast.'],
        ['app>db', 'New mappings are inserted with a unique constraint; cache misses read from here.'],
        'app>mon',
      ],
      summary:
        'A stateless URL service behind a load balancer generates collision-safe codes and stores mappings in a replicated database. Because redirects dominate, a cache-aside layer serves hot codes from memory, keeping latency low and protecting the database.',
      tradeoffs: [
        'Base62 of an auto-increment ID is collision-free but predictable; random codes are unguessable but need a uniqueness check and retry.',
        'A 302 redirect keeps every click flowing through the service (good for future analytics); a 301 is cheaper but cached by browsers.',
        'SQL is simple and enough at this scale; a key-value store becomes attractive when mappings reach many billions.',
      ],
      alternatives: [
        'Use a NoSQL key-value store keyed by short code with conditional (put-if-absent) writes.',
        'Pre-generate codes with a key generation service and hand them out in batches.',
      ],
    },
    sources: [
      ['System Design Primer — Design Pastebin.com (or Bit.ly)', `${PRIMER}/blob/master/solutions/system_design/pastebin/README.md`, 'interview-prep', 'Covers short-link generation and the read-heavy access pattern.'],
    ],
  }),
];
