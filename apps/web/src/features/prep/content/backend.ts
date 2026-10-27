import { bi } from '@/features/learn/dsl';
import type { PrepQuestion } from '../types';

export const backendQuestions: PrepQuestion[] = [
  {
    id: 'rest-api-design-and-versioning',
    category: 'backend',
    topic: 'general',
    question: bi(
      'When designing a REST API, what are the key principles you follow? How do you handle versioning?',
      'REST API design karte waqt aap kaun se key principles follow karte ho? Aur versioning kaise handle karte ho?',
    ),
    kind: 'concept',
    level: 'intermediate',
    tags: ['rest', 'api', 'http', 'versioning', 'status codes', 'pagination', 'idempotency', 'openapi'],
    simple: bi(
      'A REST API is the menu your server offers to other programs. Every “thing” (a user, an order) gets its own address (URL), and standard HTTP verbs say what to do with it: GET to read, POST to create, PUT/PATCH to update, DELETE to remove. Good design makes that menu predictable — anyone who has used one well-designed API can guess how yours works. Versioning is how you change the menu later without breaking the apps that already use it.',
      'REST API woh menu hai jo aapka server doosre programs ko deta hai. Har “cheez” (user, order) ka apna address (URL) hota hai, aur standard HTTP verbs batate hain ki uske saath kya karna hai: GET padhne ke liye, POST banane ke liye, PUT/PATCH update ke liye, DELETE hatane ke liye. Accha design menu ko predictable banata hai — jisne ek accha API use kiya hai woh aapka API bhi andaaze se samajh le. Versioning ka matlab hai baad mein menu badalna bina un apps ko tode jo use pehle se use kar rahe hain.',
    ),
    example: bi(
      'A restaurant menu: every dish has a fixed number (a resource with a URL), everyone orders the same way (HTTP verbs), and the waiter answers in standard phrases — “here you go” (200), “we don’t have that” (404), “you ordered something that isn’t possible” (400). When the chef changes recipes, the restaurant prints “Menu v2” but keeps serving the old dishes to regulars for a few months.',
      'Restaurant ka menu: har dish ka fixed number hai (URL wala resource), sab ek hi tareeke se order karte hain (HTTP verbs), aur waiter standard jawab deta hai — “yeh lijiye” (200), “yeh hamare paas nahi hai” (404), “aisa order ho hi nahi sakta” (400). Jab chef recipes badalta hai, restaurant “Menu v2” chhaapta hai par purane customers ke liye kuch mahine purani dishes bhi banata rehta hai.',
    ),
    why: bi(
      'Many clients — web, mobile, partners — depend on your API. Consistency means fewer bugs and faster integrations, and mobile apps cannot be force-updated, so old versions keep calling your API for months.',
      'Bahut saare clients — web, mobile, partners — aapke API pe depend karte hain. Consistency ka matlab kam bugs aur jaldi integration, aur mobile apps zabardasti update nahi karwa sakte, isliye purane versions mahinon tak aapka API call karte rehte hain.',
    ),
    without: bi(
      'Every endpoint behaves differently (/getUser, /user/delete?id=, “200 OK” with an error inside), so clients write special cases everywhere — and renaming one field silently breaks old mobile apps in production.',
      'Har endpoint alag behave karta hai (/getUser, /user/delete?id=, andar error ke saath “200 OK”), to clients ko har jagah special case likhna padta hai — aur ek field ka naam badalte hi purane mobile apps production mein chupchaap toot jaate hain.',
    ),
    partsTitle: bi('The key principles, one by one', 'Key principles, ek-ek karke'),
    parts: [
      {
        title: bi('1. Resources are nouns, HTTP methods are verbs', '1. Resources noun hain, HTTP methods verb'),
        text: bi(
          'Use plural nouns and nesting for relationships: /orders, /orders/42, /users/7/orders. The method carries the action, so avoid /getOrders or /createOrder. Use query parameters for filtering and sorting: /orders?status=paid&sort=-createdAt.',
          'Plural nouns aur relationships ke liye nesting use karo: /orders, /orders/42, /users/7/orders. Action method batata hai, isliye /getOrders ya /createOrder se bacho. Filtering aur sorting ke liye query parameters: /orders?status=paid&sort=-createdAt.',
        ),
      },
      {
        title: bi('2. Use methods correctly — safety and idempotency', '2. Methods sahi use karo — safety aur idempotency'),
        text: bi(
          'GET is safe (changes nothing) and idempotent. PUT and DELETE are idempotent: doing them twice has the same effect as once. POST is not idempotent, so for critical actions such as payments accept an Idempotency-Key header and return the saved result when the same key arrives again. PUT replaces a whole resource; PATCH changes part of it.',
          'GET safe hai (kuch nahi badalta) aur idempotent hai. PUT aur DELETE idempotent hain: do baar karo ya ek baar, asar same. POST idempotent nahi hai, isliye payments jaise critical actions ke liye Idempotency-Key header lo aur same key dobara aaye to saved result lauta do. PUT poora resource replace karta hai; PATCH sirf hissa badalta hai.',
        ),
      },
      {
        title: bi('3. Meaningful status codes and one error format', '3. Sahi status codes aur ek hi error format'),
        text: bi(
          '200 OK, 201 Created (with a Location header), 204 No Content; 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (logged in but not allowed), 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests; 500 and 503 for server problems. Every error returns the same shape, e.g. { code, message, details, requestId }, and never leaks stack traces.',
          '200 OK, 201 Created (Location header ke saath), 204 No Content; 400 Bad Request, 401 Unauthorized (login nahi hai), 403 Forbidden (login hai par permission nahi), 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests; server ki problem ke liye 500 aur 503. Har error ek hi shape mein, jaise { code, message, details, requestId }, aur stack trace kabhi bahar nahi.',
        ),
      },
      {
        title: '4. Stateless requests',
        text: bi(
          'Each request carries everything needed to handle it (for example an auth token). The server keeps no per-user session in memory between requests, so any instance can serve any request and you can scale horizontally behind a load balancer.',
          'Har request apne saath sab kuch laati hai jo use handle karne ke liye chahiye (jaise auth token). Server requests ke beech user ka session memory mein nahi rakhta, isliye koi bhi instance koi bhi request serve kar sakta hai aur load balancer ke peeche horizontally scale kar sakte ho.',
        ),
      },
      {
        title: bi('5. Pagination, filtering and sorting for collections', '5. Collections ke liye pagination, filtering aur sorting'),
        text: bi(
          'Never return an unbounded list. Use limit plus a cursor (?limit=20&cursor=abc) for large or fast-changing data: offset pagination (?page=500) gets slow on deep pages and skips or repeats items when rows are inserted. Return the next cursor in the response.',
          'Kabhi bhi bina limit ki list mat lautao. Bade ya tezi se badalte data ke liye limit plus cursor (?limit=20&cursor=abc) use karo: offset pagination (?page=500) gehre pages pe slow ho jaata hai aur nayi rows aane pe items skip ya repeat karta hai. Response mein agla cursor lautao.',
        ),
      },
      {
        title: bi('6. Security by default', '6. Default se security'),
        text: bi(
          'HTTPS only; authentication with OAuth 2.0 / JWT; authorization checked for every resource (can this user see order 42?); validate all input; rate limiting per client; no sensitive data in URLs, because URLs end up in logs.',
          'Sirf HTTPS; OAuth 2.0 / JWT se authentication; har resource pe authorization check (kya yeh user order 42 dekh sakta hai?); har input validate karo; har client pe rate limiting; URL mein sensitive data nahi, kyunki URLs logs mein chale jaate hain.',
        ),
      },
      {
        title: bi('7. Caching, performance and documentation', '7. Caching, performance aur documentation'),
        text: bi(
          'Use Cache-Control and ETags so clients can get a cheap 304 Not Modified; compress responses; let clients ask for related data or fewer fields to avoid many round trips. Publish an OpenAPI (Swagger) specification with examples — it is the contract, and it lets you generate clients and run contract tests.',
          'Cache-Control aur ETags use karo taaki client ko sasta 304 Not Modified mil sake; responses compress karo; clients ko related data ya kam fields maangne do taaki baar-baar round trip na ho. Examples ke saath OpenAPI (Swagger) specification publish karo — yahi contract hai, isse clients generate kar sakte ho aur contract tests chala sakte ho.',
        ),
      },
      {
        title: bi('8. Versioning strategies', '8. Versioning ke tareeke'),
        text: bi(
          'URL path (/v1/orders) is the most common: explicit, easy to route, cache and test in a browser. A header (Accept: application/vnd.shop.v2+json or API-Version: 2) keeps URLs clean but is harder to test and see. A query parameter (?version=2) is simple but easy to forget. Some companies use date-based versions (Stripe-Version: 2024-06-20) pinned per client.',
          'URL path (/v1/orders) sabse common hai: saaf dikhta hai, route, cache aur browser mein test karna aasaan. Header (Accept: application/vnd.shop.v2+json ya API-Version: 2) URLs saaf rakhta hai par test karna aur dekhna mushkil. Query parameter (?version=2) simple hai par bhoolna aasaan. Kuch companies date-based versions use karti hain (Stripe-Version: 2024-06-20) jo har client ke liye fixed hota hai.',
        ),
      },
      {
        title: bi('9. Evolve without breaking — and deprecate politely', '9. Bina tode badlo — aur tameez se deprecate karo'),
        text: bi(
          'Additive changes (a new optional field, a new endpoint) are not breaking, so they do not need a new version; clients should ignore fields they do not know (“tolerant reader”). Breaking changes — removing or renaming a field, changing a type or meaning, making an optional field required, changing status codes — need a new major version. Deprecate the old one: announce it, send Deprecation and Sunset headers, track who still calls it, help them migrate, then remove it.',
          'Additive changes (naya optional field, naya endpoint) breaking nahi hote, isliye naye version ki zaroorat nahi; clients ko anjaan fields ignore karne chahiye (“tolerant reader”). Breaking changes — field hatana ya rename karna, type ya matlab badalna, optional field ko required banana, status codes badalna — ke liye naya major version chahiye. Purane ko deprecate karo: announce karo, Deprecation aur Sunset headers bhejo, track karo kaun abhi bhi call kar raha hai, unhe migrate karne mein madad karo, phir hatao.',
        ),
      },
    ],
    table: {
      columns: ['Versioning style', 'Example', 'Good', 'Watch out'],
      rows: [
        ['URL path', '/v1/orders', bi('Explicit, easy routing and caching', 'Saaf, routing aur caching aasaan'), bi('URLs change between versions', 'Versions ke beech URLs badalte hain')],
        ['Header', 'API-Version: 2', bi('Clean URLs', 'Saaf URLs'), bi('Hidden, harder to test in a browser', 'Chhupa hua, browser mein test karna mushkil')],
        ['Query parameter', '?version=2', bi('Very simple', 'Bahut simple'), bi('Easy to forget; awkward for caching', 'Bhoolna aasaan; caching mein gadbad')],
        ['Date-based', 'Stripe-Version: 2024-06-20', bi('Each client stays on what it tested', 'Har client usi pe rehta hai jo usne test kiya'), bi('More work to maintain many versions', 'Kai versions sambhalne mein zyaada mehnat')],
      ],
    },
    interview: {
      opening: bi(
        'I design REST APIs around resources with predictable URLs, correct HTTP semantics and consistent errors, and I version with a major version in the URL while keeping most changes backward-compatible, so a new version is rarely needed.',
        'Main REST APIs ko resources ke around design karta hoon — predictable URLs, sahi HTTP semantics aur consistent errors ke saath — aur versioning URL mein major version se karta hoon, saath hi zyaadatar changes backward-compatible rakhta hoon taaki naya version kam hi banana pade.',
      ),
      points: [
        bi('Resource-oriented URLs with plural nouns; the HTTP verb expresses the action.', 'Plural nouns wale resource-oriented URLs; action HTTP verb batata hai.'),
        bi('Correct status codes and one consistent error format with a request ID.', 'Sahi status codes aur request ID ke saath ek consistent error format.'),
        bi('Stateless, token-based requests so any instance can serve them and the API scales horizontally.', 'Stateless, token-based requests taaki koi bhi instance serve kar sake aur API horizontally scale ho.'),
        bi('Idempotency: GET, PUT and DELETE are idempotent; POST on critical actions takes an Idempotency-Key.', 'Idempotency: GET, PUT aur DELETE idempotent hain; critical POST actions Idempotency-Key lete hain.'),
        bi('Cursor-based pagination, filtering and sorting — never unbounded responses.', 'Cursor-based pagination, filtering aur sorting — kabhi bina limit ke response nahi.'),
        bi('Security: HTTPS, OAuth 2.0/JWT, per-resource authorization, input validation, rate limiting.', 'Security: HTTPS, OAuth 2.0/JWT, har resource pe authorization, input validation, rate limiting.'),
        bi('Caching with Cache-Control and ETags; an OpenAPI spec as the contract.', 'Cache-Control aur ETags se caching; contract ke roop mein OpenAPI spec.'),
        bi('Versioning: /v1 in the path for major versions; additive changes need no new version, breaking changes do.', 'Versioning: major versions ke liye path mein /v1; additive changes ko naya version nahi chahiye, breaking changes ko chahiye.'),
        bi('Deprecation: announce, Deprecation/Sunset headers, monitor old-version traffic, migrate clients, then remove.', 'Deprecation: announce karo, Deprecation/Sunset headers, purane version ka traffic monitor karo, clients migrate karo, phir hatao.'),
      ],
      keywords: [
        'Resource-oriented design',
        'HTTP semantics',
        'Idempotency',
        'Statelessness',
        'Status codes',
        'Cursor pagination',
        'OpenAPI',
        'Backward compatibility',
        'Breaking vs non-breaking change',
        'Tolerant reader',
        'Deprecation / Sunset header',
        'ETag',
      ],
    },
    listenFor: [
      bi('Consistency and predictability, not just a list of HTTP verbs.', 'Consistency aur predictability, sirf HTTP verbs ki list nahi.'),
      bi('Knowing which changes are breaking and which are not.', 'Yeh pata hona ki kaunse changes breaking hain aur kaunse nahi.'),
      bi('A real plan for old clients, such as mobile apps that cannot be force-updated.', 'Purane clients ke liye asli plan, jaise mobile apps jinhe zabardasti update nahi kar sakte.'),
      bi('Bringing up idempotency, pagination and security without being prompted.', 'Bina pooche idempotency, pagination aur security ki baat karna.'),
    ],
    mistakes: [
      bi('Verbs in URLs: /getUser, /createOrder.', 'URLs mein verbs: /getUser, /createOrder.'),
      bi('Returning 200 OK with an error message inside the body.', 'Body ke andar error message ke saath 200 OK lautana.'),
      bi('Mixing up 401 (who are you?) and 403 (I know you, but no).', '401 (aap kaun ho?) aur 403 (pehchaanta hoon, par permission nahi) ko mila dena.'),
      bi('A new version for every small change — or never versioning and breaking clients.', 'Har chhote change pe naya version — ya kabhi versioning na karna aur clients tod dena.'),
      bi('Returning whole tables without pagination.', 'Bina pagination ke poori table lauta dena.'),
    ],
    followUps: [
      {
        q: bi('What is the difference between PUT and PATCH?', 'PUT aur PATCH mein kya fark hai?'),
        a: bi(
          'PUT sends the complete new version of the resource and is idempotent. PATCH sends only the changes; whether it is idempotent depends on the patch (“set name to X” is, “add 1 to count” is not).',
          'PUT resource ka poora naya version bhejta hai aur idempotent hai. PATCH sirf changes bhejta hai; idempotent hai ya nahi yeh patch pe depend karta hai (“name ko X karo” idempotent hai, “count mein 1 jodo” nahi).',
        ),
      },
      {
        q: bi('How do you make a POST safe to retry?', 'POST ko retry ke liye safe kaise banate ho?'),
        a: bi(
          'The client sends a unique Idempotency-Key per logical operation. The server stores the key with the result (for example for 24 hours); a repeat with the same key returns the stored result instead of running again.',
          'Client har logical operation ke liye ek unique Idempotency-Key bhejta hai. Server key ko result ke saath store karta hai (jaise 24 ghante ke liye); same key se repeat aaye to dobara chalane ki jagah stored result lautata hai.',
        ),
      },
      {
        q: bi('REST vs GraphQL vs gRPC — when would you pick each?', 'REST vs GraphQL vs gRPC — kab kaunsa chunoge?'),
        a: bi(
          'REST: simple, cacheable, ideal for public APIs. GraphQL: clients choose exactly the fields they need — great when many different frontends use the same data, but caching and rate limiting are harder. gRPC: fast binary protocol with typed contracts — great for service-to-service calls.',
          'REST: simple, cacheable, public APIs ke liye best. GraphQL: client bilkul wahi fields maangta hai jo chahiye — jab kai alag frontends same data use karein tab badhiya, par caching aur rate limiting mushkil. gRPC: typed contracts wala fast binary protocol — service-to-service calls ke liye badhiya.',
        ),
      },
    ],
    related: { components: ['api-gateway', 'app-server'], challenges: ['api-gateway-basic', 'distributed-api-gateway'] },
  },

  {
    id: 'what-is-a-race-condition',
    category: 'backend',
    topic: 'general',
    question: bi('What is a race condition?', 'Race condition kya hoti hai?'),
    kind: 'concept',
    level: 'beginner',
    tags: ['concurrency', 'race condition', 'locking', 'transactions', 'atomic', 'optimistic locking'],
    simple: bi(
      'A race condition happens when two things run at the same time, touch the same data, and the final result depends on which one happens to finish first. Each one is correct on its own, but together they step on each other — usually because both read the old value before either of them writes the new one.',
      'Race condition tab hoti hai jab do kaam ek saath chalte hain, same data ko chhoote hain, aur final result is pe depend karta hai ki kaun pehle khatam hua. Akele dono sahi hain, par saath mein ek doosre ka kaam bigaad dete hain — aam taur pe isliye kyunki dono ne nayi value likhne se pehle purani value padh li.',
    ),
    example: bi(
      'A joint bank account has ₹1,000. Two people withdraw ₹800 at two different ATMs at the same second. Both ATMs read “balance 1,000”, both approve, both write “200”. ₹1,600 left the bank but the balance only dropped by ₹800. The same thing happens when two people book the last seat in a cinema at the same moment.',
      'Ek joint bank account mein ₹1,000 hain. Do log ek hi second mein do alag ATMs se ₹800 nikalte hain. Dono ATMs padhte hain “balance 1,000”, dono approve karte hain, dono likhte hain “200”. Bank se ₹1,600 nikal gaye par balance sirf ₹800 kam hua. Yahi tab hota hai jab do log cinema ki aakhri seat ek hi pal mein book karte hain.',
    ),
    why: bi(
      'Race conditions cause wrong balances, double bookings, overselling and lost updates — and they are hard to find because they only appear under real concurrent load, never in a quiet local test.',
      'Race conditions se galat balance, double booking, overselling aur lost updates hote hain — aur inhe dhoondhna mushkil hai kyunki yeh sirf asli concurrent load mein dikhti hain, shaant local test mein kabhi nahi.',
    ),
    without: bi(
      'If you ignore them you get bugs that “cannot be reproduced”, corrupt data discovered weeks later, and customers charged twice or seats sold twice.',
      'Inhe ignore karoge to aise bugs milenge jo “reproduce hi nahi hote”, hafton baad pata chalne wala kharab data, aur customers se do baar paise ya ek seat do baar bikna.',
    ),
    partsTitle: bi('How it happens and how to prevent it', 'Yeh kaise hota hai aur kaise roken'),
    parts: [
      {
        title: bi('The classic shape: read → modify → write', 'Classic shape: padho → badlo → likho'),
        text: bi(
          'x = read(); x = x + 1; write(x). Two workers interleave: both read 5, both write 6 — one increment is lost. This is called a “lost update”.',
          'x = read(); x = x + 1; write(x). Do workers beech-beech mein chalte hain: dono 5 padhte hain, dono 6 likhte hain — ek increment gayab. Ise “lost update” kehte hain.',
        ),
      },
      {
        title: bi('The other shape: check → then act', 'Doosra shape: check karo → phir karo'),
        text: bi(
          'if (seatIsFree) bookSeat(). Between the check and the action someone else books the seat. This gap is called time-of-check to time-of-use (TOCTOU).',
          'if (seatIsFree) bookSeat(). Check aur action ke beech koi aur seat book kar leta hai. Is gap ko time-of-check to time-of-use (TOCTOU) kehte hain.',
        ),
      },
      {
        title: bi('Where they appear', 'Yeh kahan dikhti hain'),
        text: bi(
          'Threads in one process; several requests on different servers hitting the same database row; two browser tabs; async code in Node.js (other requests run between your awaits); and distributed workers processing a duplicated message.',
          'Ek process ke threads; alag servers pe kai requests jo same database row chhooti hain; do browser tabs; Node.js ka async code (aapke awaits ke beech doosri requests chal jaati hain); aur duplicate message process karte distributed workers.',
        ),
      },
      {
        title: bi('Fix 1 — make it atomic', 'Fix 1 — ise atomic banao'),
        text: bi(
          'Do the check and the change in one indivisible step: UPDATE accounts SET balance = balance - 800 WHERE id = 1 AND balance >= 800, then check how many rows changed. Or use atomic operations such as Redis INCR or compare-and-swap.',
          'Check aur change ek hi na-tootne wale step mein karo: UPDATE accounts SET balance = balance - 800 WHERE id = 1 AND balance >= 800, phir dekho kitni rows badli. Ya Redis INCR ya compare-and-swap jaise atomic operations use karo.',
        ),
      },
      {
        title: 'Fix 2 — locks (pessimistic)',
        text: bi(
          'Take a lock before touching the data: a mutex inside one process, a row lock in the database (SELECT … FOR UPDATE), or a distributed lock (Redis, ZooKeeper) with an expiry when several services are involved. Safe when conflicts are frequent, but others must wait, and careless locking can deadlock.',
          'Data chhoone se pehle lock lo: ek process ke andar mutex, database mein row lock (SELECT … FOR UPDATE), ya kai services hon to expiry ke saath distributed lock (Redis, ZooKeeper). Jab conflicts zyaada hon tab safe, par baakiyon ko wait karna padta hai, aur laparwah locking se deadlock ho sakta hai.',
        ),
      },
      {
        title: 'Fix 3 — optimistic concurrency',
        text: bi(
          'Give each row a version number: UPDATE … SET …, version = 8 WHERE id = 1 AND version = 7. If zero rows changed, someone else got there first — re-read and retry. Great when conflicts are rare.',
          'Har row ka version number rakho: UPDATE … SET …, version = 8 WHERE id = 1 AND version = 7. Agar zero rows badli, to koi aur pehle pahunch gaya — dobara padho aur retry karo. Jab conflicts kam hon tab badhiya.',
        ),
      },
      {
        title: bi('Fix 4 — constraints, idempotency and ordering', 'Fix 4 — constraints, idempotency aur ordering'),
        text: bi(
          'Let the database refuse impossible states (a unique constraint on show + seat), use a suitable transaction isolation level, make retried requests idempotent, or route all changes for one key through a single queue partition so they happen one at a time.',
          'Database ko namumkin states mana karne do (show + seat pe unique constraint), sahi transaction isolation level use karo, retry hone wali requests ko idempotent banao, ya ek key ke saare changes ek hi queue partition se bhejo taaki woh ek-ek karke hon.',
        ),
      },
      {
        title: bi('How to find them', 'Inhe kaise dhoondhein'),
        text: bi(
          'They rarely show up in normal tests. Look for read-modify-write and check-then-act patterns in code review, run concurrent load tests, use race detectors where available (Go’s -race), and keep database constraints as a safety net that turns silent corruption into a visible error.',
          'Normal tests mein yeh kam hi dikhti hain. Code review mein read-modify-write aur check-then-act patterns dhoondho, concurrent load tests chalao, jahan mile race detectors use karo (Go ka -race), aur database constraints ko safety net rakho jo chupe hue kharab data ko dikhne wali error bana dete hain.',
        ),
      },
    ],
    table: {
      columns: ['Technique', 'How', 'Best when'],
      rows: [
        ['Atomic update', 'UPDATE … WHERE balance >= 800', bi('A single row or counter changes', 'Ek row ya counter badalta ho')],
        ['Pessimistic lock', 'SELECT … FOR UPDATE', bi('Conflicts are frequent (hot items)', 'Conflicts zyaada hon (hot items)')],
        ['Optimistic lock', 'WHERE version = 7', bi('Conflicts are rare', 'Conflicts kam hon')],
        ['Unique constraint', 'UNIQUE (show_id, seat_id)', bi('Duplicates must be impossible', 'Duplicate namumkin hona chahiye')],
      ],
    },
    interview: {
      opening: bi(
        'A race condition is a bug where the outcome depends on the timing of concurrent operations on shared state — typically two operations read the same value and both write, so one update is lost.',
        'Race condition ek bug hai jisme result shared state pe chal rahe concurrent operations ki timing pe depend karta hai — aam taur pe do operations same value padhte hain aur dono likhte hain, to ek update kho jaata hai.',
      ),
      points: [
        bi('Common shapes: read-modify-write (lost update) and check-then-act (TOCTOU).', 'Common shapes: read-modify-write (lost update) aur check-then-act (TOCTOU).'),
        bi('It happens across threads, async tasks, multiple app instances and distributed workers — not only in multi-threaded code.', 'Yeh threads, async tasks, kai app instances aur distributed workers mein hoti hai — sirf multi-threaded code mein nahi.'),
        bi('Prevent with atomic operations: a single conditional UPDATE, INCR, compare-and-swap.', 'Atomic operations se roko: ek conditional UPDATE, INCR, compare-and-swap.'),
        bi('Or pessimistic locking (SELECT … FOR UPDATE, mutex, distributed lock with a TTL) when contention is high.', 'Ya contention zyaada ho to pessimistic locking (SELECT … FOR UPDATE, mutex, TTL wala distributed lock).'),
        bi('Or optimistic concurrency with a version column and retry when conflicts are rare.', 'Ya conflicts kam hon to version column aur retry ke saath optimistic concurrency.'),
        bi('Back it with database constraints and idempotency for retried requests.', 'Saath mein database constraints aur retry hone wali requests ke liye idempotency.'),
        bi('Detect with concurrent load tests and code review; they rarely reproduce locally.', 'Concurrent load tests aur code review se pakdo; yeh local mein kam hi reproduce hoti hain.'),
      ],
      keywords: [
        'Shared mutable state',
        'Critical section',
        'Lost update',
        'Check-then-act / TOCTOU',
        'Atomicity',
        'Mutex',
        'Pessimistic locking',
        'Optimistic concurrency control',
        'Compare-and-swap',
        'Isolation level',
        'Distributed lock',
        'Idempotency',
      ],
    },
    listenFor: [
      bi('A concrete example, such as money or a booking.', 'Ek thos example, jaise paise ya booking.'),
      bi('More than one fix, with the trade-offs between them.', 'Ek se zyaada fix, unke trade-offs ke saath.'),
      bi('Understanding that it also happens across servers (at the database), not just between threads.', 'Yeh samajh ki yeh servers ke beech (database pe) bhi hoti hai, sirf threads mein nahi.'),
      bi('How they would test for it or detect it.', 'Ise test ya detect kaise karenge.'),
    ],
    mistakes: [
      bi('“Node.js is single-threaded, so it cannot have race conditions” — it can, between awaits and across instances.', '“Node.js single-threaded hai, isliye race condition nahi ho sakti” — ho sakti hai, awaits ke beech aur instances ke beech.'),
      bi('Using an in-memory lock when the app runs on several servers.', 'App kai servers pe chal raha ho tab bhi in-memory lock use karna.'),
      bi('Locks without timeouts, which can freeze the system (deadlocks).', 'Bina timeout ke locks, jo system ko jam kar sakte hain (deadlocks).'),
    ],
    followUps: [
      {
        q: bi('What is the difference between a race condition and a deadlock?', 'Race condition aur deadlock mein kya fark hai?'),
        a: bi(
          'A race condition gives a wrong result because of timing. A deadlock is when two operations each wait for a lock the other one holds, so both stop forever.',
          'Race condition timing ki wajah se galat result deti hai. Deadlock tab hota hai jab do operations ek doosre ke paas wale lock ka wait karte hain, aur dono hamesha ke liye ruk jaate hain.',
        ),
      },
      {
        q: bi('How would you stop the same seat from being booked twice?', 'Ek seat do baar book hone se kaise rokoge?'),
        a: bi(
          'A unique constraint on (show_id, seat_id) or a conditional update “WHERE status = free”, combined with a short reservation hold that expires if payment does not complete.',
          '(show_id, seat_id) pe unique constraint ya “WHERE status = free” wala conditional update, saath mein chhota reservation hold jo payment poora na ho to expire ho jaaye.',
        ),
      },
    ],
    related: {
      components: ['sql-db', 'coordination-service'],
      challenges: ['ticket-booking-system', 'distributed-inventory-reservation-system', 'distributed-wallet-and-ledger'],
    },
  },

  {
    id: 'should-every-failed-request-be-retried',
    category: 'backend',
    topic: 'general',
    question: bi('Should every failed request be retried?', 'Kya har failed request ko retry karna chahiye?'),
    kind: 'concept',
    level: 'intermediate',
    tags: ['retry', 'backoff', 'jitter', 'idempotency', 'circuit breaker', 'resilience', 'timeouts'],
    simple: bi(
      'No. Retry only when the failure is probably temporary AND repeating the request is safe. A timeout or “503 busy” may work the second time; a “400 bad request” or “card declined” will fail the same way every time. And if the first attempt might already have worked (like a payment), retrying blindly can do it twice.',
      'Nahi. Retry sirf tab karo jab failure shayad temporary ho AUR request dobara karna safe ho. Timeout ya “503 busy” doosri baar chal sakta hai; “400 bad request” ya “card declined” har baar waise hi fail hoga. Aur agar pehli koshish shayad ho chuki ho (jaise payment), to aankh band karke retry use do baar kar sakta hai.',
    ),
    example: bi(
      'Calling a friend: if the line is busy, you call again in a few minutes (temporary — retry). If the number does not exist, calling ten more times will not help (permanent — do not retry). If a UPI payment shows “pending”, you do not just press Pay again — you check first, or you might pay twice (not safe to repeat).',
      'Dost ko call karna: line busy hai to kuch minute baad dobara call karte ho (temporary — retry). Number exist hi nahi karta to das baar aur call karne se kuch nahi hoga (permanent — retry mat karo). UPI payment “pending” dikhaye to aap bas dobara Pay nahi dabaate — pehle check karte ho, warna do baar pay ho sakta hai (dobara karna safe nahi).',
    ),
    why: bi(
      'Good retries quietly hide short network blips and restarts, so users never notice them.',
      'Acche retries chhote network blips aur restarts ko chupchaap chhupa dete hain, users ko pata bhi nahi chalta.',
    ),
    without: bi(
      'Bad retries cause retry storms — thousands of clients retrying instantly multiply the load on a struggling service and turn a small slowdown into an outage — and duplicate payments, emails and orders.',
      'Kharab retries retry storm laate hain — hazaaron clients turant retry karke pehle se pareshaan service pe load kai guna kar dete hain aur chhoti slowness ko outage bana dete hain — aur duplicate payments, emails aur orders bhi.',
    ),
    partsTitle: bi('How to decide, step by step', 'Kaise decide karein, step by step'),
    parts: [
      {
        title: bi('1. Is the failure temporary?', '1. Kya failure temporary hai?'),
        text: bi(
          'Retry: timeouts, connection resets, 502/503/504, 429 (after the Retry-After time), database deadlocks or serialization failures. Do not retry: 400, 401, 403, 404, 409, 422 and business errors such as “insufficient balance”.',
          'Retry karo: timeouts, connection resets, 502/503/504, 429 (Retry-After time ke baad), database deadlocks ya serialization failures. Retry mat karo: 400, 401, 403, 404, 409, 422 aur business errors jaise “balance kam hai”.',
        ),
      },
      {
        title: bi('2. Is the operation safe to repeat?', '2. Kya operation dobara karna safe hai?'),
        text: bi(
          'GET, PUT and DELETE are idempotent. POST is not — unless the client sends an Idempotency-Key that the server uses to de-duplicate. A timeout does not mean the action failed; it means you do not know.',
          'GET, PUT aur DELETE idempotent hain. POST nahi — jab tak client Idempotency-Key na bheje jisse server duplicate pehchaan sake. Timeout ka matlab yeh nahi ki action fail hua; matlab yeh hai ki aapko pata nahi.',
        ),
      },
      {
        title: bi('3. Retry gently', '3. Aaram se retry karo'),
        text: bi(
          'Exponential backoff (100 ms, 200 ms, 400 ms…) plus random jitter, a small maximum (2–3 attempts) and an overall deadline, so the user is not kept waiting forever.',
          'Exponential backoff (100 ms, 200 ms, 400 ms…) plus random jitter, chhota maximum (2–3 attempts) aur ek overall deadline, taaki user hamesha wait na karta rahe.',
        ),
      },
      {
        title: bi('4. Retry at one layer only', '4. Sirf ek layer pe retry karo'),
        text: bi(
          'If the app, the gateway and the service each retry three times, one failure turns into 27 calls (retry amplification). Pick one layer — usually the one closest to the failing call.',
          'Agar app, gateway aur service teeno teen-teen baar retry karein, to ek failure 27 calls ban jaata hai (retry amplification). Ek layer chuno — aam taur pe jo fail hoti call ke sabse paas ho.',
        ),
      },
      {
        title: bi('5. Protect the dependency', '5. Dependency ko bachao'),
        text: bi(
          'A circuit breaker stops retrying when the dependency is clearly down; honour Retry-After; use timeouts so retries do not pile up waiting threads.',
          'Jab dependency saaf down ho to circuit breaker retry rok deta hai; Retry-After maano; timeouts use karo taaki retries wait karte threads jama na karein.',
        ),
      },
      {
        title: bi('6. Make failures visible', '6. Failures dikhne chahiye'),
        text: bi(
          'Count retries in metrics and alert when they rise. For background work, retry from the queue and move the message to a dead-letter queue after the last attempt.',
          'Retries ko metrics mein gino aur badhne pe alert karo. Background kaam ke liye queue se retry karo aur aakhri attempt ke baad message ko dead-letter queue mein bhej do.',
        ),
      },
    ],
    table: {
      columns: ['Failure', 'Retry?', 'Why'],
      rows: [
        ['Timeout / connection reset', bi('Yes, with backoff — if safe to repeat', 'Haan, backoff ke saath — agar dobara karna safe ho'), bi('Probably temporary', 'Shayad temporary')],
        ['502 / 503 / 504', bi('Yes', 'Haan'), bi('Server overloaded or restarting', 'Server overloaded ya restart ho raha')],
        ['429', bi('Yes, after Retry-After', 'Haan, Retry-After ke baad'), bi('You are being rate limited', 'Aap pe rate limit lagi hai')],
        ['400 / 422', bi('No', 'Nahi'), bi('The request itself is wrong', 'Request khud galat hai')],
        ['401 / 403', bi('No (refresh the token once on 401)', 'Nahi (401 pe ek baar token refresh)'), bi('Authentication or permission problem', 'Authentication ya permission ki problem')],
        ['404 / 409', bi('No — re-read and decide', 'Nahi — dobara padho aur decide karo'), bi('Missing or conflicting data needs a decision', 'Missing ya conflicting data pe decision chahiye')],
        ['500', bi('Maybe once or twice', 'Shayad ek-do baar'), bi('Could be a bug (permanent) or a blip', 'Bug (permanent) ya blip, kuch bhi ho sakta hai')],
      ],
    },
    interview: {
      opening: bi(
        'No — I retry only transient failures on idempotent operations, with exponential backoff and jitter, a small attempt limit and a circuit breaker, because blind retries cause duplicate side effects and retry storms.',
        'Nahi — main sirf idempotent operations ke transient failures retry karta hoon, exponential backoff aur jitter, chhoti attempt limit aur circuit breaker ke saath, kyunki aankh band karke retry duplicate side effects aur retry storms laate hain.',
      ),
      points: [
        bi('Classify errors: retry timeouts, connection errors, 502/503/504 and 429 (honour Retry-After); never 4xx validation or auth errors.', 'Errors classify karo: timeouts, connection errors, 502/503/504 aur 429 (Retry-After maano) retry karo; 4xx validation ya auth errors kabhi nahi.'),
        bi('Retry only idempotent operations; make the others safe with idempotency keys.', 'Sirf idempotent operations retry karo; baaki ko idempotency keys se safe banao.'),
        bi('Exponential backoff with jitter, 2–3 attempts at most, and an overall deadline.', 'Jitter ke saath exponential backoff, zyaada se zyaada 2–3 attempts, aur ek overall deadline.'),
        bi('Retry at a single layer to avoid retry amplification.', 'Retry amplification se bachne ke liye ek hi layer pe retry.'),
        bi('Circuit breaker and timeouts so we fail fast when a dependency is down.', 'Circuit breaker aur timeouts taaki dependency down ho to jaldi fail karein.'),
        bi('Asynchronous work: retry from the queue, then a dead-letter queue after N attempts.', 'Asynchronous kaam: queue se retry, N attempts ke baad dead-letter queue.'),
        bi('Monitor the retry rate — rising retries are an early warning.', 'Retry rate monitor karo — badhte retries ek early warning hain.'),
      ],
      keywords: [
        'Transient vs permanent failure',
        'Idempotency key',
        'Exponential backoff',
        'Jitter',
        'Retry budget',
        'Retry storm / thundering herd',
        'Retry amplification',
        'Circuit breaker',
        'Retry-After header',
        'Dead-letter queue',
        'Timeout',
      ],
    },
    listenFor: [
      bi('Separating temporary failures from permanent ones.', 'Temporary aur permanent failures ko alag karna.'),
      bi('Linking retries to idempotency.', 'Retries ko idempotency se jodna.'),
      bi('Backoff with jitter, and awareness of retry storms and amplification.', 'Jitter ke saath backoff, aur retry storms aur amplification ki samajh.'),
    ],
    mistakes: [
      bi('Retrying everything immediately in a tight loop.', 'Sab kuch turant, tight loop mein retry karna.'),
      bi('Retrying payment POSTs without idempotency keys.', 'Bina idempotency keys ke payment POST retry karna.'),
      bi('Retrying 4xx errors that can never succeed.', '4xx errors retry karna jo kabhi succeed nahi honge.'),
      bi('Infinite retries with no dead-letter queue; retries at every layer.', 'Bina dead-letter queue ke infinite retries; har layer pe retries.'),
    ],
    followUps: [
      {
        q: bi('Why add jitter?', 'Jitter kyun jodte hain?'),
        a: bi(
          'Without it, every client retries at exactly the same moments and hits the server in synchronized waves. Random jitter spreads the retries out.',
          'Iske bina har client bilkul same pal pe retry karta hai aur server pe ek saath lehron mein girta hai. Random jitter retries ko faila deta hai.',
        ),
      },
      {
        q: bi('What does a circuit breaker do?', 'Circuit breaker kya karta hai?'),
        a: bi(
          'After too many failures it “opens” and fails fast for a cool-down period, then lets a few trial requests through (“half-open”); if they succeed it closes again and normal traffic resumes.',
          'Bahut failures ke baad yeh “open” ho jaata hai aur kuch der turant fail karta hai, phir kuch trial requests jaane deta hai (“half-open”); woh succeed karein to wapas close hota hai aur normal traffic shuru.',
        ),
      },
    ],
    related: { components: ['background-worker', 'dead-letter-queue', 'payment-provider'], challenges: ['payment-processing-platform', 'notification-platform-at-scale'] },
  },
];
