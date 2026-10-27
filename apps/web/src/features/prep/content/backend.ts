import { bi, code, h, note, options, p, section, steps, table, ul } from '../dsl';
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
    tags: ['rest', 'api', 'http', 'versioning', 'status codes', 'pagination', 'idempotency', 'openapi', 'nestjs'],
    answer: bi(
      'When designing a REST API, I focus on consistency, simplicity, scalability, security and backward compatibility. The goal is an API that is easy for frontend developers to consume, easy for backend developers to maintain, and safe to evolve as requirements change.',
      'REST API design karte waqt main consistency, simplicity, scalability, security aur backward compatibility pe focus karta hoon. Goal hai aisa API jo frontend developers ke liye use karna aasaan ho, backend developers ke liye maintain karna aasaan ho, aur requirements badalne pe safely evolve ho sake.',
    ),
    sections: [
      section(
        'Key principles I follow',
        'Key principles jo main follow karta hoon',
        h('Resource-based URL design', 'Resource-based URL design'),
        p(
          'I model APIs around resources (nouns) rather than actions (verbs). For example, for an expense management application:',
          'Main APIs ko actions (verbs) ki jagah resources (nouns) ke around design karta hoon. Jaise, ek expense management application ke liye:',
        ),
        table(
          ['Method', 'Endpoint', bi('Purpose', 'Kaam')],
          [
            ['GET', '/api/v1/expenses', bi('Fetch all expenses', 'Saare expenses laao')],
            ['GET', '/api/v1/expenses/123', bi('Fetch one expense', 'Ek expense laao')],
            ['POST', '/api/v1/expenses', bi('Create an expense', 'Expense banao')],
            ['PATCH', '/api/v1/expenses/123', bi('Partially update an expense', 'Expense ka kuch hissa update karo')],
            ['PUT', '/api/v1/expenses/123', bi('Replace an expense', 'Poora expense replace karo')],
            ['DELETE', '/api/v1/expenses/123', bi('Delete an expense', 'Expense delete karo')],
          ],
        ),
        p(
          'I prefer plural nouns, consistent naming, and nested resources only when the relationship is meaningful, such as `/users/123/expenses`.',
          'Main plural nouns, consistent naming, aur nested resources sirf tab use karta hoon jab relationship meaningful ho, jaise `/users/123/expenses`.',
        ),
        h('Use HTTP methods and status codes correctly', 'HTTP methods aur status codes sahi use karo'),
        ul(
          ['**GET** — read data; must not change server state.', '**GET** — data padho; server state nahi badalni chahiye.'],
          ['**POST** — create a resource, or trigger an operation that fits no other method.', '**POST** — resource banao, ya aisa operation jo kisi aur method mein fit na ho.'],
          ['**PUT** — replace a whole resource; idempotent.', '**PUT** — poora resource replace karo; idempotent.'],
          ['**PATCH** — update part of a resource.', '**PATCH** — resource ka sirf hissa update karo.'],
          ['**DELETE** — delete a resource; idempotent.', '**DELETE** — resource delete karo; idempotent.'],
        ),
        table(
          ['Status', bi('When I use it', 'Kab use karta hoon')],
          [
            ['200 OK', bi('Successful request', 'Request successful')],
            ['201 Created', bi('Resource created (with a Location header)', 'Resource bana (Location header ke saath)')],
            ['204 No Content', bi('Success with no response body', 'Success, par response body nahi')],
            ['400 Bad Request', bi('Invalid syntax or input', 'Galat syntax ya input')],
            ['401 Unauthorized', bi('Missing or invalid authentication', 'Authentication missing ya galat')],
            ['403 Forbidden', bi('Logged in, but not allowed', 'Login hai, par permission nahi')],
            ['404 Not Found', bi('Resource does not exist or is not accessible', 'Resource nahi hai ya access nahi')],
            ['409 Conflict', bi('State conflict or duplicate operation', 'State conflict ya duplicate operation')],
            ['422 Unprocessable Content', bi('Well-formed, but fails business validation', 'Format sahi, par business validation fail')],
            ['429 Too Many Requests', bi('Rate limit exceeded', 'Rate limit paar')],
            ['500 Internal Server Error', bi('Unexpected server failure', 'Server ki anjaani failure')],
          ],
        ),
        note('tip', 'The exact choice between 400 and 422 matters less than using it consistently across the whole API.', '400 aur 422 mein se kaunsa chuno, isse zyaada zaroori hai ki poore API mein ek jaisa use karo.'),
        h('Consistent request and response structures', 'Ek jaisa request aur response structure'),
        p(
          'I keep a predictable response format so clients do not need endpoint-specific parsing logic:',
          'Main response format predictable rakhta hoon taaki clients ko har endpoint ke liye alag parsing logic na likhna pade:',
        ),
        code(
          'json',
          `
{
  "data": {
    "id": "123",
    "amount": 500,
    "category": "Food"
  }
}`,
        ),
        p('For errors, a standard structure with a machine-readable code and a useful message:', 'Errors ke liye ek standard structure, machine-readable code aur kaam ke message ke saath:'),
        code(
          'json',
          `
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid expense amount",
    "details": [
      { "field": "amount", "message": "Amount must be greater than zero" }
    ],
    "requestId": "req_8f2c1a"
  }
}`,
        ),
        p('I never expose stack traces, database errors or internal implementation details.', 'Main stack traces, database errors ya andar ki implementation details kabhi bahar nahi dikhata.'),
        h('Input validation and security', 'Input validation aur security'),
        p('I validate input on the backend even if the frontend already validates it. My checklist:', 'Frontend validate kar chuka ho tab bhi main backend pe input validate karta hoon. Meri checklist:'),
        ul(
          ['Schema validation and correct data types.', 'Schema validation aur sahi data types.'],
          ['Authentication, plus authorization on every resource.', 'Authentication, aur har resource pe authorization.'],
          ['Parameterized queries to prevent SQL injection.', 'SQL injection se bachne ke liye parameterized queries.'],
          ['Rate limiting and request-size limits.', 'Rate limiting aur request-size limits.'],
          ['A CORS policy that fits the application.', 'Application ke hisaab se CORS policy.'],
          ['HTTPS and secure handling of credentials and tokens.', 'HTTPS aur credentials aur tokens ki safe handling.'],
          ['Protection against mass assignment — users updating fields they should not control (such as `role` or `isAdmin`).', 'Mass assignment se bachaav — users aise fields update na kar sakein jo unke control mein nahi hone chahiye (jaise `role` ya `isAdmin`).'],
        ),
        note(
          'important',
          'Authentication answers **who are you?** Authorization answers **what are you allowed to access?** Both are necessary.',
          'Authentication jawab deta hai **aap kaun ho?** Authorization jawab deta hai **aap kya access kar sakte ho?** Dono zaroori hain.',
        ),
        h('Pagination, filtering and sorting', 'Pagination, filtering aur sorting'),
        p('For list endpoints I never return the entire dataset:', 'List endpoints pe main kabhi poora dataset nahi lautata:'),
        code('http', 'GET /api/v1/expenses?page=2&limit=20&sortBy=createdAt&order=desc&category=Food'),
        code(
          'json',
          `
{
  "data": [],
  "pagination": { "page": 2, "limit": 20, "totalItems": 145, "totalPages": 8 }
}`,
        ),
        p(
          'For large or frequently changing data I use cursor-based pagination (`?limit=20&cursor=eyJpZCI6MTIzfQ`), which stays fast on deep pages and does not skip or repeat items when new rows arrive.',
          'Bade ya tezi se badalte data ke liye main cursor-based pagination (`?limit=20&cursor=eyJpZCI6MTIzfQ`) use karta hoon, jo gehre pages pe bhi fast rehta hai aur nayi rows aane pe items skip ya repeat nahi karta.',
        ),
        h('Idempotency and reliability', 'Idempotency aur reliability'),
        p(
          'I think about what happens when a client retries after a timeout. If a payment API creates a transaction and the client retries the POST, I must not create two transactions. So I accept an idempotency key:',
          'Main sochta hoon ki timeout ke baad client retry kare to kya hoga. Agar payment API transaction banata hai aur client POST retry kare, to do transactions nahi banne chahiye. Isliye main idempotency key leta hoon:',
        ),
        code(
          'http',
          `
POST /api/v1/transactions
Idempotency-Key: 7f8c2a1b
Content-Type: application/json`,
        ),
        p(
          'The backend stores the result for that key and returns the same result for a retry instead of running the operation twice. I also add timeouts, logging, monitoring and correlation IDs for troubleshooting.',
          'Backend us key ke saath result store karta hai aur retry pe operation dobara chalane ki jagah wahi result lautata hai. Troubleshooting ke liye main timeouts, logging, monitoring aur correlation IDs bhi jodta hoon.',
        ),
        h('Documentation and testing', 'Documentation aur testing'),
        p('I document the API with OpenAPI/Swagger:', 'Main API ko OpenAPI/Swagger se document karta hoon:'),
        ul(
          ['Endpoints and methods; request and response schemas.', 'Endpoints aur methods; request aur response schemas.'],
          ['Authentication requirements, status codes and error formats.', 'Authentication ki zarooratein, status codes aur error formats.'],
          ['Pagination and filter parameters; deprecated endpoints and version changes.', 'Pagination aur filter parameters; deprecated endpoints aur version changes.'],
        ),
        p(
          'I test validation, authorization, error handling and database integration — not just the happy path.',
          'Main validation, authorization, error handling aur database integration test karta hoon — sirf happy path nahi.',
        ),
      ),
      section(
        'How I handle versioning',
        'Versioning kaise handle karta hoon',
        p(
          'My main rule: introduce a new version only when a change breaks existing clients, and keep backward compatibility whenever practical. There are three common approaches:',
          'Mera main rule: naya version sirf tab jab change existing clients ko tode, aur jahan ho sake backward compatibility rakho. Teen common tareeke hain:',
        ),
        options(
          {
            title: 'URI versioning',
            badge: bi('My default', 'Mera default'),
            code: '/api/v1/users\n/api/v2/users',
            lang: 'http',
            text: bi(
              'The version is explicit and easy to understand. Routing, documentation, monitoring and gradual migration are straightforward.',
              'Version saaf dikhta hai aur samajhna aasaan hai. Routing, documentation, monitoring aur dheere-dheere migration seedha hai.',
            ),
          },
          {
            title: 'Header versioning',
            code: 'GET /api/users\nAccept: application/vnd.company.v2+json',
            lang: 'http',
            text: bi(
              'Keeps URLs clean, but requests are less transparent and debugging, caching and testing get harder.',
              'URLs saaf rehte hain, par requests kam transparent hoti hain aur debugging, caching aur testing mushkil ho jaati hai.',
            ),
          },
          {
            title: 'Query parameter versioning',
            code: 'GET /api/users?version=2',
            lang: 'http',
            text: bi(
              'Simple to implement, but easy to forget and awkward for caching rules.',
              'Implement karna simple hai, par bhoolna aasaan aur caching rules ke liye ajeeb.',
            ),
          },
        ),
        p(
          'For most React/Angular + Node.js applications I start with URI versioning (`/api/v1`) unless the organisation already has a different standard.',
          'Zyaadatar React/Angular + Node.js applications ke liye main URI versioning (`/api/v1`) se shuru karta hoon, jab tak organisation ka koi aur standard na ho.',
        ),
      ),
      section(
        'What changes need a new version?',
        'Kaunse changes ko naya version chahiye?',
        p('Imagine the existing API returns:', 'Maan lo abhi ka API yeh lautata hai:'),
        code('json', '{ "id": 123, "name": "Abhi" }'),
        table(
          ['Change', 'Breaking?', bi('New major version?', 'Naya major version?')],
          [
            [bi('Add an optional response field', 'Optional response field jodna'), bi('No', 'Nahi'), bi('Usually no', 'Aam taur pe nahi')],
            [bi('Add a new endpoint', 'Naya endpoint jodna'), bi('No', 'Nahi'), bi('No', 'Nahi')],
            [bi('Add an optional request field', 'Optional request field jodna'), bi('No', 'Nahi'), bi('Usually no', 'Aam taur pe nahi')],
            [bi('Rename `name` to `fullName`', '`name` ko `fullName` karna'), bi('Yes', 'Haan'), bi('Usually yes', 'Aam taur pe haan')],
            [bi('Remove a response field', 'Response field hatana'), bi('Yes', 'Haan'), bi('Usually yes', 'Aam taur pe haan')],
            [bi('Change a field from number to string', 'Field ko number se string karna'), bi('Yes', 'Haan'), bi('Usually yes', 'Aam taur pe haan')],
            [bi('Make an optional request field mandatory', 'Optional request field ko mandatory karna'), bi('Yes', 'Haan'), bi('Usually yes', 'Aam taur pe haan')],
            [bi('Change what an endpoint means or does', 'Endpoint ka matlab ya kaam badalna'), bi('Potentially', 'Ho sakta hai'), bi('Depends on impact', 'Asar pe depend')],
          ],
        ),
        note(
          'warning',
          'Even adding a response field can break clients that strictly validate schemas or deserialize into rigid models. I verify client compatibility instead of assuming every additive change is safe.',
          'Response field jodna bhi un clients ko tod sakta hai jo schema strictly validate karte hain ya rigid models mein deserialize karte hain. Main har additive change ko safe maanne ki jagah client compatibility check karta hoon.',
        ),
      ),
      section(
        'Migrating from v1 to v2',
        'v1 se v2 pe migrate karna',
        p(
          'Suppose `GET /api/v1/users/123` returns `name`, but v2 needs `firstName` and `lastName`. I migrate in stages:',
          'Maan lo `GET /api/v1/users/123` `name` lautata hai, par v2 ko `firstName` aur `lastName` chahiye. Main stages mein migrate karta hoon:',
        ),
        steps(
          ['Introduce v2', 'v2 laao', 'Add `/api/v2/users/123` with the new contract. Keep v1 working.', 'Naye contract ke saath `/api/v2/users/123` jodo. v1 chalta rahe.'],
          [
            'Reuse business logic',
            'Business logic dobara use karo',
            'Share services, validation and data access; use version-specific controllers or response mappers only where the contracts differ.',
            'Services, validation aur data access share karo; version-specific controllers ya response mappers sirf wahan jahan contracts alag hain.',
          ],
          [
            'Migrate clients gradually',
            'Clients ko dheere-dheere migrate karo',
            'Move frontends and external consumers to v2, and monitor which clients still call v1.',
            'Frontends aur external consumers ko v2 pe le jao, aur monitor karo kaun abhi bhi v1 call kar raha hai.',
          ],
          [
            'Deprecate and retire v1',
            'v1 deprecate aur band karo',
            'Announce a sunset date (with `Deprecation` and `Sunset` headers), share migration steps, watch remaining usage, and retire v1 only when it is safe.',
            'Sunset date announce karo (`Deprecation` aur `Sunset` headers ke saath), migration steps batao, bacha hua usage dekho, aur v1 tabhi band karo jab safe ho.',
          ],
        ),
        p('I keep contract tests for both versions and use API usage metrics so I never break an active consumer.', 'Main dono versions ke contract tests rakhta hoon aur API usage metrics use karta hoon taaki koi active consumer na toote.'),
      ),
      section(
        'Does every change need a new version?',
        'Kya har change ko naya version chahiye?',
        p('No. I do not create v2 for every small change.', 'Nahi. Main har chhote change pe v2 nahi banata.'),
        ul(
          ['**Non-breaking changes** — keep the current version.', '**Non-breaking changes** — wahi version rakho.'],
          ['**Breaking contract changes** — introduce a new version.', '**Breaking contract changes** — naya version laao.'],
          ['**Internal implementation changes** — same version, as long as the contract and behaviour stay compatible.', '**Andar ki implementation changes** — wahi version, jab tak contract aur behaviour compatible rahe.'],
        ),
        note(
          'tip',
          'API versioning is not application versioning: the backend can deploy ten times without changing `/api/v1`, as long as its public contract stays compatible.',
          'API versioning application versioning nahi hai: backend das baar deploy ho sakta hai bina `/api/v1` badle, jab tak uska public contract compatible rahe.',
        ),
      ),
      section(
        'Example in a Node.js / NestJS application',
        'Node.js / NestJS application mein example',
        code(
          'text',
          `
src/
├── users/
│   ├── v1/
│   │   ├── users.controller.ts
│   │   └── users.dto.ts
│   ├── v2/
│   │   ├── users.controller.ts
│   │   └── users.dto.ts
│   ├── users.service.ts      ← shared business logic
│   └── users.module.ts`,
        ),
        p(
          'Both controllers share `users.service.ts` but return different response DTOs, so business logic is not duplicated. URI versioning is enabled once:',
          'Dono controllers `users.service.ts` share karte hain par alag response DTOs lautate hain, to business logic duplicate nahi hota. URI versioning ek baar enable hoti hai:',
        ),
        code(
          'ts',
          `
// main.ts
app.enableVersioning({ type: VersioningType.URI });

// users/v2/users.controller.ts
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserV2Dto> {
    const user = await this.users.findById(id);
    return { id: user.id, firstName: user.firstName, lastName: user.lastName };
  }
}`,
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'When designing REST APIs, I focus on resource-oriented endpoints, correct HTTP methods and status codes, consistent request and response formats, input validation, authentication and authorization, pagination, and clear error handling. I also consider idempotency, rate limiting, logging, monitoring and API documentation.',
          'REST APIs design karte waqt main resource-oriented endpoints, sahi HTTP methods aur status codes, consistent request aur response formats, input validation, authentication aur authorization, pagination aur saaf error handling pe focus karta hoon. Saath mein idempotency, rate limiting, logging, monitoring aur API documentation ka bhi dhyaan rakhta hoon.',
        ),
        bi(
          'For versioning, I generally prefer URI-based versioning such as /api/v1 and /api/v2, because it is explicit and easy to manage. I keep backward compatibility for non-breaking changes and introduce a new version only for breaking changes, like removing fields or changing the response structure. During a migration I run both versions, share business logic, monitor usage, move consumers gradually, and deprecate the old version only when it is safe.',
          'Versioning ke liye main aam taur pe /api/v1 aur /api/v2 jaisi URI-based versioning chunta hoon, kyunki yeh saaf hai aur manage karna aasaan. Non-breaking changes mein backward compatibility rakhta hoon aur naya version sirf breaking changes ke liye laata hoon, jaise fields hatana ya response structure badalna. Migration ke dauraan dono versions chalaata hoon, business logic share karta hoon, usage monitor karta hoon, consumers ko dheere-dheere le jaata hoon, aur purana version tabhi deprecate karta hoon jab safe ho.',
        ),
      ],
      keywords: [
        'Resource-oriented design',
        'HTTP semantics',
        'Status codes',
        'Idempotency key',
        'Statelessness',
        'Cursor pagination',
        'Input validation',
        'Authentication vs authorization',
        'OpenAPI',
        'URI versioning',
        'Backward compatibility',
        'Breaking change',
        'Deprecation / Sunset header',
      ],
    },
    listenFor: [
      bi('Consistency and predictability, not just a list of HTTP verbs.', 'Consistency aur predictability, sirf HTTP verbs ki list nahi.'),
      bi('Knowing which changes are breaking — and a real migration plan for existing clients.', 'Kaunse changes breaking hain yeh jaanna — aur existing clients ke liye asli migration plan.'),
      bi('Bringing up validation, security, idempotency and pagination without being prompted.', 'Bina pooche validation, security, idempotency aur pagination ki baat karna.'),
    ],
    mistakes: [
      bi('Verbs in URLs such as `/getUser` or `/createOrder`.', 'URLs mein verbs, jaise `/getUser` ya `/createOrder`.'),
      bi('Returning `200 OK` with an error message inside the body.', 'Body mein error message ke saath `200 OK` lautana.'),
      bi('Creating a new version for every small change — or never versioning and breaking clients.', 'Har chhote change pe naya version — ya kabhi versioning na karke clients tod dena.'),
    ],
    followUps: [
      {
        q: bi(
          'How would you design versioning if five frontend applications and several external clients depend on the same backend?',
          'Agar paanch frontend applications aur kai external clients ek hi backend pe depend karein to versioning kaise design karoge?',
        ),
        a: bi(
          'Think beyond the URL: contract compatibility, ownership, monitoring who calls which version, and the cost of supporting several versions. Prefer additive changes, publish an OpenAPI contract with contract tests per consumer, track usage per client, give long deprecation windows to external clients, and keep the number of live versions small.',
          'URL se aage socho: contract compatibility, ownership, kaun kaunsa version call kar raha hai iski monitoring, aur kai versions sambhaalne ka kharcha. Additive changes ko tarjeeh do, har consumer ke contract tests ke saath OpenAPI contract publish karo, har client ka usage track karo, external clients ko lamba deprecation time do, aur live versions ki ginti kam rakho.',
        ),
      },
      {
        q: bi('What is the difference between PUT and PATCH?', 'PUT aur PATCH mein kya fark hai?'),
        a: bi(
          'PUT sends the complete new version of the resource and is idempotent. PATCH sends only the changes; it is idempotent for “set name to X” but not for “add 1 to count”.',
          'PUT resource ka poora naya version bhejta hai aur idempotent hai. PATCH sirf changes bhejta hai; “name ko X karo” ke liye idempotent hai par “count mein 1 jodo” ke liye nahi.',
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
    tags: ['concurrency', 'race condition', 'locking', 'transactions', 'atomic', 'optimistic locking', 'node.js'],
    answer: bi(
      'A race condition happens when two or more operations run at the same time on shared data, and the final result depends on which one finishes first. Each operation is correct on its own, but together they overwrite each other — usually because both read the old value before either writes the new one.',
      'Race condition tab hoti hai jab do ya zyaada operations ek saath shared data pe chalte hain, aur final result is pe depend karta hai ki kaun pehle khatam hua. Har operation akele sahi hai, par saath mein ek doosre ko overwrite kar dete hain — aam taur pe isliye kyunki dono ne nayi value likhne se pehle purani value padh li.',
    ),
    sections: [
      section(
        'A simple example',
        'Ek simple example',
        p(
          'A joint account has ₹1,000. Two people withdraw ₹800 at two ATMs at the same moment:',
          'Joint account mein ₹1,000 hain. Do log ek hi pal mein do ATMs se ₹800 nikalte hain:',
        ),
        table(
          ['Time', 'ATM A', 'ATM B', bi('Balance in DB', 'DB mein balance')],
          [
            ['t1', bi('reads 1,000', '1,000 padhta hai'), '—', '1,000'],
            ['t2', '—', bi('reads 1,000', '1,000 padhta hai'), '1,000'],
            ['t3', bi('1,000 ≥ 800 → writes 200', '1,000 ≥ 800 → 200 likhta hai'), '—', '200'],
            ['t4', '—', bi('1,000 ≥ 800 → writes 200', '1,000 ≥ 800 → 200 likhta hai'), '200'],
          ],
        ),
        p(
          '₹1,600 left the account, but the balance dropped by only ₹800. Each request was correct; the interleaving was not. In code it looks innocent:',
          'Account se ₹1,600 nikle, par balance sirf ₹800 kam hua. Har request sahi thi; unka beech-beech mein chalna galat tha. Code mein yeh maasoom dikhta hai:',
        ),
        code(
          'ts',
          `
const account = await db.accounts.findById(id);   // both requests read 1,000
if (account.balance >= amount) {
  account.balance -= amount;                      // both compute 200
  await account.save();                           // last write wins
}`,
        ),
      ),
      section(
        'The two common shapes',
        'Do common shapes',
        ul(
          [
            '**Read → modify → write (lost update):** two workers read 5, both write 6 — one increment disappears.',
            '**Read → modify → write (lost update):** do workers 5 padhte hain, dono 6 likhte hain — ek increment gayab.',
          ],
          [
            '**Check → then act (TOCTOU):** `if (seatIsFree) bookSeat()` — someone books the seat between the check and the action.',
            '**Check → then act (TOCTOU):** `if (seatIsFree) bookSeat()` — check aur action ke beech koi aur seat book kar leta hai.',
          ],
        ),
      ),
      section(
        'Where it happens — not only with threads',
        'Yeh kahan hoti hai — sirf threads mein nahi',
        ul(
          ['Several requests on different servers updating the same database row.', 'Alag servers pe kai requests jo same database row update karti hain.'],
          ['Async code in Node.js — other requests run between your `await`s.', 'Node.js ka async code — aapke `await`s ke beech doosri requests chal jaati hain.'],
          ['Queue consumers processing a duplicated message twice.', 'Queue consumers jo duplicate message do baar process karte hain.'],
          ['Threads in one process, or the same user in two browser tabs.', 'Ek process ke threads, ya do browser tabs mein same user.'],
        ),
        note(
          'warning',
          'Node.js being single-threaded does not protect you: other requests interleave at every `await`, and production runs several instances against the same database.',
          'Node.js ka single-threaded hona aapko nahi bachata: har `await` pe doosri requests beech mein aa jaati hain, aur production mein same database pe kai instances chalte hain.',
        ),
      ),
      section(
        'How I prevent it',
        'Main ise kaise rokta hoon',
        h('1. Make the check and the change one atomic step', '1. Check aur change ko ek atomic step banao'),
        code(
          'sql',
          `
UPDATE accounts
SET    balance = balance - 800
WHERE  id = 1 AND balance >= 800;
-- 1 row updated → success, 0 rows → insufficient balance`,
        ),
        h('2. Lock the row (pessimistic locking)', '2. Row ko lock karo (pessimistic locking)'),
        code(
          'sql',
          `
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;  -- others wait here
UPDATE accounts SET balance = balance - 800 WHERE id = 1;
COMMIT;`,
        ),
        h('3. Version check (optimistic locking)', '3. Version check (optimistic locking)'),
        code(
          'sql',
          `
UPDATE accounts
SET    balance = 200, version = 8
WHERE  id = 1 AND version = 7;
-- 0 rows updated → someone changed it first: re-read and retry`,
        ),
        h('4. Let the database refuse impossible states', '4. Database ko namumkin states mana karne do'),
        code('sql', 'ALTER TABLE bookings ADD CONSTRAINT one_booking_per_seat UNIQUE (show_id, seat_id);'),
        table(
          ['Technique', bi('Best when', 'Kab best'), 'Trade-off'],
          [
            ['Atomic update', bi('One row or counter changes', 'Ek row ya counter badalta ho'), bi('Logic must fit in one statement', 'Logic ek statement mein aana chahiye')],
            ['Pessimistic lock', bi('Conflicts are frequent (hot items)', 'Conflicts zyaada hon (hot items)'), bi('Others wait; risk of deadlocks', 'Baaki wait karte hain; deadlock ka risk')],
            ['Optimistic lock', bi('Conflicts are rare', 'Conflicts kam hon'), bi('Losers must retry', 'Haarne wale ko retry karna padta hai')],
            ['Unique constraint', bi('Duplicates must be impossible', 'Duplicate namumkin hone chahiye'), bi('Handle the constraint error', 'Constraint error handle karna padta hai')],
            [bi('Distributed lock / one queue partition per key', 'Distributed lock / har key ka ek queue partition'), bi('Several services touch the same thing', 'Kai services same cheez chhooti hain'), bi('More infrastructure; locks need expiry', 'Zyaada infrastructure; locks ko expiry chahiye')],
          ],
        ),
      ),
      section(
        'How I find them',
        'Inhe kaise dhoondhta hoon',
        ul(
          ['Look for read-modify-write and check-then-act patterns in code review.', 'Code review mein read-modify-write aur check-then-act patterns dhoondho.'],
          ['Run concurrent load tests — they rarely show up in normal tests.', 'Concurrent load tests chalao — normal tests mein yeh kam hi dikhti hain.'],
          ['Use database constraints as a safety net: silent corruption becomes a visible error.', 'Database constraints ko safety net rakho: chupa hua kharab data dikhne wali error ban jaata hai.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'A race condition is a bug where the result depends on the timing of concurrent operations on shared state. The classic case is read-modify-write: two requests read the same balance, both subtract, and one update is lost. Another is check-then-act, like two users booking the last seat.',
          'Race condition ek bug hai jisme result shared state pe chal rahe concurrent operations ki timing pe depend karta hai. Classic case read-modify-write hai: do requests same balance padhti hain, dono ghataati hain, aur ek update kho jaata hai. Doosra check-then-act hai, jaise do users aakhri seat book karein.',
        ),
        bi(
          'It is not limited to threads — it happens across multiple instances, async code between awaits, and duplicate queue messages. I prevent it with atomic conditional updates, row locks when contention is high, optimistic locking with a version column when conflicts are rare, and unique constraints as a safety net. I test for it with concurrent load tests, because it rarely shows up locally.',
          'Yeh sirf threads tak seemit nahi — kai instances, awaits ke beech async code, aur duplicate queue messages mein bhi hoti hai. Main ise atomic conditional updates, contention zyaada ho to row locks, conflicts kam hon to version column ke saath optimistic locking, aur safety net ke roop mein unique constraints se rokta hoon. Ise concurrent load tests se test karta hoon, kyunki local mein yeh kam hi dikhti hai.',
        ),
      ],
      keywords: [
        'Shared mutable state',
        'Critical section',
        'Lost update',
        'Check-then-act / TOCTOU',
        'Atomic operation',
        'Pessimistic locking',
        'SELECT … FOR UPDATE',
        'Optimistic concurrency control',
        'Unique constraint',
        'Distributed lock',
      ],
    },
    listenFor: [
      bi('A concrete example, such as money or a booking.', 'Ek thos example, jaise paise ya booking.'),
      bi('More than one fix, with the trade-offs between them.', 'Ek se zyaada fix, unke trade-offs ke saath.'),
      bi('Knowing it happens across servers and in async code, not only between threads.', 'Yeh jaanna ki yeh servers ke beech aur async code mein bhi hoti hai, sirf threads mein nahi.'),
    ],
    mistakes: [
      bi('“Node.js is single-threaded, so there are no race conditions.”', '“Node.js single-threaded hai, isliye race conditions nahi hoti.”'),
      bi('Using an in-memory lock when the app runs on several servers.', 'App kai servers pe ho tab bhi in-memory lock use karna.'),
    ],
    followUps: [
      {
        q: bi('What is the difference between a race condition and a deadlock?', 'Race condition aur deadlock mein kya fark hai?'),
        a: bi(
          'A race condition gives a wrong result because of timing. A deadlock is when two operations each wait for a lock the other holds, so both stop forever. Locking in a consistent order and using lock timeouts prevents deadlocks.',
          'Race condition timing ki wajah se galat result deti hai. Deadlock tab hota hai jab do operations ek doosre ke paas wale lock ka wait karte hain aur dono hamesha ke liye ruk jaate hain. Ek tay order mein lock lena aur lock timeouts deadlock rokte hain.',
        ),
      },
      {
        q: bi('How would you stop the same seat from being booked twice?', 'Ek seat do baar book hone se kaise rokoge?'),
        a: bi(
          'A unique constraint on (show_id, seat_id), or a conditional update `WHERE status = ‘free’`, plus a short reservation hold that expires if payment does not complete.',
          '(show_id, seat_id) pe unique constraint, ya conditional update `WHERE status = ‘free’`, saath mein chhota reservation hold jo payment poora na ho to expire ho jaaye.',
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
    answer: bi(
      'No. I retry only when the failure is likely temporary and the operation is safe to repeat. Retrying a permanent error just wastes resources, and retrying a non-idempotent request — like a payment — can execute it twice.',
      'Nahi. Main sirf tab retry karta hoon jab failure shayad temporary ho aur operation dobara karna safe ho. Permanent error ko retry karna bas resources barbaad karta hai, aur non-idempotent request — jaise payment — ko retry karna use do baar chala sakta hai.',
    ),
    sections: [
      section(
        'My decision rule',
        'Mera decision rule',
        steps(
          [
            'Is the failure temporary?',
            'Kya failure temporary hai?',
            'Timeouts, connection resets, 502/503/504 and 429 usually are. Validation, auth and business errors are not.',
            'Timeouts, connection resets, 502/503/504 aur 429 aam taur pe hote hain. Validation, auth aur business errors nahi.',
          ],
          [
            'Is the operation safe to repeat?',
            'Kya operation dobara karna safe hai?',
            'GET, PUT and DELETE are idempotent. POST is not — unless it carries an idempotency key.',
            'GET, PUT aur DELETE idempotent hain. POST nahi — jab tak usme idempotency key na ho.',
          ],
          [
            'Is there time left?',
            'Kya time bacha hai?',
            'Respect the overall deadline. If the user has already waited too long, fail fast with a clear error.',
            'Overall deadline ka dhyaan rakho. User pehle hi bahut wait kar chuka ho to saaf error ke saath jaldi fail karo.',
          ],
        ),
        table(
          ['Failure', 'Retry?', bi('Why', 'Kyun')],
          [
            ['Timeout / connection reset', bi('Yes, if safe to repeat', 'Haan, agar dobara karna safe ho'), bi('Probably temporary', 'Shayad temporary')],
            ['502 / 503 / 504', bi('Yes, with backoff', 'Haan, backoff ke saath'), bi('Server busy or restarting', 'Server busy ya restart ho raha')],
            ['429', bi('Yes, after `Retry-After`', 'Haan, `Retry-After` ke baad'), bi('You are being rate limited', 'Aap pe rate limit lagi hai')],
            ['400 / 422', bi('No', 'Nahi'), bi('The request itself is wrong', 'Request khud galat hai')],
            ['401 / 403', bi('No (refresh the token once on 401)', 'Nahi (401 pe ek baar token refresh)'), bi('Auth or permission problem', 'Auth ya permission ki problem')],
            ['404 / 409', bi('No — re-read and decide', 'Nahi — dobara padho aur decide karo'), bi('Needs a decision, not a repeat', 'Decision chahiye, repeat nahi')],
            ['500', bi('Maybe once', 'Shayad ek baar'), bi('Could be a bug (permanent) or a blip', 'Bug (permanent) ya blip, kuch bhi')],
          ],
        ),
      ),
      section(
        'Making retries safe: idempotency',
        'Retries ko safe banana: idempotency',
        p(
          'A timeout does not mean the request failed — it means **you do not know**. The payment might already have gone through. So for operations with side effects, the client sends a unique key and the server de-duplicates:',
          'Timeout ka matlab yeh nahi ki request fail hui — matlab hai **aapko pata nahi**. Payment shayad ho bhi chuki ho. Isliye side effects wale operations ke liye client ek unique key bhejta hai aur server duplicate pehchaanta hai:',
        ),
        code(
          'http',
          `
POST /api/v1/payments
Idempotency-Key: pay_order_481_attempt
Content-Type: application/json

{ "orderId": 481, "amount": 1499 }`,
        ),
        p(
          'The server saves the result per key (for example for 24 hours). A retry with the same key gets the saved result instead of a second charge.',
          'Server har key ka result save karta hai (jaise 24 ghante ke liye). Same key se retry aane pe doosri baar charge karne ki jagah saved result milta hai.',
        ),
      ),
      section(
        'How I retry: exponential backoff with jitter',
        'Main kaise retry karta hoon: jitter ke saath exponential backoff',
        code(
          'ts',
          `
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1 || !isTransient(err)) throw err;
      const base = 100 * 2 ** i;                       // 100 ms, 200 ms, 400 ms…
      await sleep(base + Math.random() * base);        // + random jitter
    }
  }
}`,
        ),
        ul(
          ['**2–3 attempts at most**, inside an overall deadline.', '**Zyaada se zyaada 2–3 attempts**, ek overall deadline ke andar.'],
          ['**Jitter** spreads retries out so thousands of clients do not hit the server at the same instant.', '**Jitter** retries ko faila deta hai taaki hazaaron clients ek hi pal mein server pe na girein.'],
          ['**Honour `Retry-After`** when the server sends it.', 'Server bheje to **`Retry-After` maano**.'],
        ),
      ),
      section(
        'Avoiding retry storms',
        'Retry storms se bachna',
        p(
          'If the client, the API gateway and the service each retry 3 times, one failing call becomes 3 × 3 × 3 = **27 calls** on a dependency that is already struggling. That turns a small slowdown into an outage.',
          'Agar client, API gateway aur service teeno 3-3 baar retry karein, to ek fail call pehle se pareshaan dependency pe 3 × 3 × 3 = **27 calls** ban jaati hai. Isse chhoti slowness outage ban jaati hai.',
        ),
        ul(
          ['Retry at **one layer** only — usually the one closest to the failing call.', 'Sirf **ek layer** pe retry karo — aam taur pe jo fail hoti call ke sabse paas ho.'],
          ['Add a **circuit breaker**: after repeated failures, fail fast for a while instead of retrying.', '**Circuit breaker** lagao: baar-baar failure ke baad retry ki jagah kuch der jaldi fail karo.'],
          ['Use **timeouts** so retries do not pile up waiting threads.', '**Timeouts** use karo taaki retries wait karte threads jama na karein.'],
        ),
      ),
      section(
        'Background jobs',
        'Background jobs',
        p(
          'For queue-based work I retry from the queue with backoff, and after the last attempt move the message to a **dead-letter queue** and alert, so one bad message never blocks the rest or disappears silently.',
          'Queue-based kaam ke liye main queue se backoff ke saath retry karta hoon, aur aakhri attempt ke baad message ko **dead-letter queue** mein bhej ke alert karta hoon, taaki ek kharab message baaki ko na roke ya chupchaap gayab na ho.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'No. I first classify the failure: timeouts, connection errors, 502/503/504 and 429 are usually transient and worth retrying; validation, authentication and business errors are permanent, so retrying them only adds load.',
          'Nahi. Main pehle failure classify karta hoon: timeouts, connection errors, 502/503/504 aur 429 aam taur pe transient hote hain aur retry karne layak; validation, authentication aur business errors permanent hain, unhe retry karne se sirf load badhta hai.',
        ),
        bi(
          'Second, I only retry operations that are safe to repeat — GET, PUT and DELETE, or POST with an idempotency key — because a timeout does not tell you whether the first attempt succeeded. When I retry, I use exponential backoff with jitter, two or three attempts within an overall deadline, retry at a single layer to avoid amplification, and put a circuit breaker in front of flaky dependencies. For background jobs, failed messages go to a dead-letter queue after the last attempt.',
          'Doosra, main sirf woh operations retry karta hoon jo dobara karna safe hon — GET, PUT aur DELETE, ya idempotency key wala POST — kyunki timeout nahi batata ki pehli koshish succeed hui ya nahi. Retry karte waqt main jitter ke saath exponential backoff, overall deadline ke andar do-teen attempts, amplification se bachne ke liye ek hi layer pe retry, aur unreliable dependencies ke aage circuit breaker use karta hoon. Background jobs mein aakhri attempt ke baad fail messages dead-letter queue mein jaate hain.',
        ),
      ],
      keywords: [
        'Transient vs permanent failure',
        'Idempotency key',
        'Exponential backoff',
        'Jitter',
        'Retry-After',
        'Retry storm',
        'Retry amplification',
        'Circuit breaker',
        'Timeout / deadline',
        'Dead-letter queue',
      ],
    },
    listenFor: [
      bi('Separating temporary failures from permanent ones.', 'Temporary aur permanent failures ko alag karna.'),
      bi('Linking retries to idempotency.', 'Retries ko idempotency se jodna.'),
      bi('Backoff with jitter, and awareness of retry storms.', 'Jitter ke saath backoff, aur retry storms ki samajh.'),
    ],
    mistakes: [
      bi('Retrying everything immediately in a loop.', 'Sab kuch turant, loop mein retry karna.'),
      bi('Retrying payments without an idempotency key.', 'Bina idempotency key ke payments retry karna.'),
    ],
    followUps: [
      {
        q: bi('What does a circuit breaker do?', 'Circuit breaker kya karta hai?'),
        a: bi(
          'After too many failures it “opens” and fails fast for a cool-down period, then lets a few trial requests through (“half-open”). If they succeed it closes and normal traffic resumes. It protects both the caller and the struggling dependency.',
          'Bahut failures ke baad yeh “open” hota hai aur kuch der turant fail karta hai, phir kuch trial requests jaane deta hai (“half-open”). Woh succeed karein to close hota hai aur normal traffic shuru. Yeh caller aur pareshaan dependency dono ko bachata hai.',
        ),
      },
    ],
    related: { components: ['background-worker', 'dead-letter-queue', 'payment-provider'], challenges: ['payment-processing-platform', 'notification-platform-at-scale'] },
  },
];
