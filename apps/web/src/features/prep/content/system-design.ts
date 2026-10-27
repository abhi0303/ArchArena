import { a, c, scene } from '@/features/learn/dsl';
import { bi, code, figure, h, note, p, section, steps, table, ul } from '../dsl';
import type { PrepQuestion } from '../types';

export const systemDesignQuestions: PrepQuestion[] = [
  {
    id: 'monolith-vs-microservices',
    category: 'system-design',
    topic: 'architecture',
    question: bi(
      'What are the pros and cons of a microservices architecture compared to a monolith? When would you choose one over the other?',
      'Monolith ke muqable microservices architecture ke kya fayde aur nuksaan hain? Kab kaunsa chunoge?',
    ),
    kind: 'comparison',
    level: 'intermediate',
    tags: ['microservices', 'monolith', 'modular monolith', 'architecture', 'ddd', 'saga', 'strangler fig'],
    answer: bi(
      'A monolith is one deployable application; microservices split the system into small, independently deployable services, each owning one business capability and its data. Microservices give independent deployment, scaling and team autonomy, but add network, data-consistency and operational complexity. I usually start with a well-structured modular monolith and extract services only when team size, deployment friction or scaling needs justify it.',
      'Monolith ek deploy hone wali application hai; microservices system ko chhoti, alag-alag deploy hone wali services mein baant-te hain, har ek ek business capability aur apne data ki maalik. Microservices alag deployment, scaling aur team autonomy dete hain, par network, data-consistency aur operational complexity badhate hain. Main aam taur pe ek acche structure wale modular monolith se shuru karta hoon aur services tabhi nikaalta hoon jab team size, deployment ki rukawat ya scaling ki zaroorat ise sahi thehraaye.',
    ),
    sections: [
      section(
        'Side by side',
        'Aamne-saamne',
        table(
          ['', 'Monolith', 'Microservices'],
          [
            ['Deployment', bi('One unit — all or nothing', 'Ek unit — sab ya kuch nahi'), bi('Each service independently', 'Har service alag se')],
            ['Scaling', bi('Scale the whole app', 'Poori app scale karo'), bi('Scale only the busy services', 'Sirf busy services scale karo')],
            [bi('Early development speed', 'Shuruaati development speed'), bi('Fast and simple', 'Fast aur simple'), bi('Slower: pipelines, discovery, contracts', 'Slow: pipelines, discovery, contracts')],
            ['Data', bi('One database; easy joins and transactions', 'Ek database; joins aur transactions aasaan'), bi('Database per service; eventual consistency, sagas', 'Har service ka database; eventual consistency, sagas')],
            ['Failures', bi('One bug can take everything down', 'Ek bug sab gira sakta hai'), bi('Isolated — but network failures are new', 'Alag-thalag — par network failures naye')],
            ['Debugging', bi('One process, one log', 'Ek process, ek log'), bi('Needs distributed tracing', 'Distributed tracing chahiye')],
            ['Teams', bi('Shared codebase, more coordination', 'Shared codebase, zyaada coordination'), bi('Teams own services end to end', 'Teams services ki poori maalik')],
            [bi('Operational cost', 'Operational kharcha'), bi('Low', 'Kam'), bi('High', 'Zyaada')],
          ],
        ),
      ),
      section(
        'Pros and cons',
        'Fayde aur nuksaan',
        h('Monolith', 'Monolith ke fayde aur nuksaan'),
        ul(
          ['✅ Simple to build, test, debug and deploy; in-process calls are fast.', '✅ Banana, test, debug aur deploy karna simple; in-process calls fast.'],
          ['✅ ACID transactions and joins across the whole domain.', '✅ Poore domain mein ACID transactions aur joins.'],
          ['❌ Every change redeploys everything; one hot feature forces scaling the whole app.', '❌ Har change pe sab kuch dobara deploy; ek hot feature ke liye poori app scale karni padti hai.'],
          ['❌ As the team grows, people block each other in one codebase and one release train.', '❌ Team badhne pe log ek codebase aur ek release train mein ek doosre ko rokte hain.'],
        ),
        h('Microservices', 'Microservices ke fayde aur nuksaan'),
        ul(
          ['✅ Teams deploy independently and own their service end to end.', '✅ Teams alag deploy karti hain aur apni service ki poori maalik hoti hain.'],
          ['✅ Scale and choose technology per service; a failure can be isolated.', '✅ Har service ka scale aur technology alag; failure ko alag kiya ja sakta hai.'],
          ['❌ Network latency, partial failures, retries and timeouts everywhere.', '❌ Har jagah network latency, partial failures, retries aur timeouts.'],
          ['❌ No cross-service transactions — you need sagas and eventual consistency.', '❌ Services ke beech transactions nahi — sagas aur eventual consistency chahiye.'],
          ['❌ Much more infrastructure: CI/CD per service, service discovery, tracing, on-call.', '❌ Kahin zyaada infrastructure: har service ka CI/CD, service discovery, tracing, on-call.'],
        ),
      ),
      section(
        'When I choose which',
        'Main kab kya chunta hoon',
        table(
          ['Situation', bi('My choice', 'Meri choice')],
          [
            [bi('New product, small team (under ~10–15 engineers)', 'Naya product, chhoti team (~10–15 engineers se kam)'), 'Modular monolith'],
            [bi('Domain still changing every month', 'Domain har mahine badal raha'), bi('Monolith — boundaries are not clear yet', 'Monolith — boundaries abhi saaf nahi')],
            [bi('Many teams blocked on one release train', 'Kai teams ek release train pe ruki'), bi('Extract services along team boundaries', 'Team boundaries ke hisaab se services nikaalo')],
            [bi('One part needs very different scaling (video transcoding)', 'Ek hissa bahut alag scaling maangta hai (video transcoding)'), bi('Extract just that part', 'Sirf wahi hissa nikaalo')],
            [bi('No CI/CD, monitoring or on-call yet', 'Abhi CI/CD, monitoring ya on-call nahi'), bi('Not microservices yet', 'Abhi microservices nahi')],
          ],
        ),
      ),
      section(
        'The middle path: a modular monolith',
        'Beech ka raasta: modular monolith',
        code(
          'text',
          `
src/
├── orders/      ← owns its tables; exposes OrdersService
├── payments/    ← owns its tables; exposes PaymentsService
├── catalog/
└── shared/`,
        ),
        p(
          'One deployable unit, but modules talk only through public interfaces — never through each other’s tables. You get clear boundaries without distributed-system costs, and any module can be extracted later.',
          'Ek deploy hone wali unit, par modules sirf public interfaces se baat karte hain — kabhi ek doosre ki tables se nahi. Distributed system ki keemat ke bina saaf boundaries milti hain, aur koi bhi module baad mein nikaala ja sakta hai.',
        ),
      ),
      section(
        'Migrating safely: the strangler fig pattern',
        'Safely migrate karna: strangler fig pattern',
        steps(
          ['Put a gateway in front', 'Aage gateway lagao', 'All traffic goes through an API gateway or proxy that can route per path.', 'Saara traffic API gateway ya proxy se jaata hai jo path ke hisaab se route kar sake.'],
          ['Extract one capability', 'Ek capability nikaalo', 'Pick the part that changes most or scales differently; move it with its own data.', 'Woh hissa chuno jo sabse zyaada badalta ho ya alag scale hota ho; use apne data ke saath le jao.'],
          ['Shift traffic gradually', 'Traffic dheere-dheere shift karo', 'Route that path to the new service, watch metrics, roll back if needed.', 'Woh path nayi service pe bhejo, metrics dekho, zaroorat ho to roll back.'],
          ['Delete the old code', 'Purana code hatao', 'Remove the module from the monolith, then repeat. No big-bang rewrite.', 'Monolith se module hatao, phir dohraao. Ek jhatke mein sab dobara nahi likhna.'],
        ),
        note(
          'warning',
          'Avoid the **distributed monolith**: services sharing one database, long chains of synchronous calls, or releases that must go out together. You pay every microservice cost and get none of the benefits.',
          '**Distributed monolith** se bacho: ek database share karti services, synchronous calls ki lambi chains, ya saath jaane wale releases. Microservices ka har kharcha lagta hai aur faayda ek bhi nahi.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'A monolith is simpler to build, test, deploy and debug, has local transactions and fast in-process calls, but it couples deployment and scaling, and large teams start blocking each other. Microservices let teams deploy and scale independently and isolate failures, at the cost of network latency, partial failures, eventual consistency, sagas, distributed tracing and much more infrastructure.',
          'Monolith banana, test, deploy aur debug karna simple hai, isme local transactions aur fast in-process calls hote hain, par yeh deployment aur scaling ko jod deta hai, aur badi teams ek doosre ko rokne lagti hain. Microservices teams ko alag deploy aur scale karne dete hain aur failures alag karte hain, par network latency, partial failures, eventual consistency, sagas, distributed tracing aur kahin zyaada infrastructure ki keemat pe.',
        ),
        bi(
          'I usually start with a modular monolith with clear bounded contexts, and extract services with the strangler fig pattern when team size, deployment friction or very different scaling needs justify it — making sure each service owns its data so we do not end up with a distributed monolith.',
          'Main aam taur pe saaf bounded contexts wale modular monolith se shuru karta hoon, aur jab team size, deployment ki rukawat ya bahut alag scaling ki zaroorat ho tab strangler fig pattern se services nikaalta hoon — yeh pakka karte hue ki har service apne data ki maalik ho, taaki distributed monolith na ban jaaye.',
        ),
      ],
      keywords: ['Bounded context', 'Modular monolith', 'Independent deployability', 'Database per service', 'Eventual consistency', 'Saga pattern', 'Transactional outbox', 'Strangler fig pattern', 'Distributed monolith', 'Conway’s law'],
    },
    listenFor: [
      bi('A balanced view rather than hype.', 'Hype ki jagah santulit nazariya.'),
      bi('Tying the decision to team size, domain maturity and operational maturity — plus data ownership and a migration path.', 'Decision ko team size, domain maturity aur operational maturity se jodna — saath mein data ownership aur migration path.'),
    ],
    mistakes: [
      bi('“Microservices are always better.”', '“Microservices hamesha behtar hain.”'),
      bi('Splitting by technical layer (a UI service, a DB service) instead of business capability.', 'Business capability ki jagah technical layer se baantna (UI service, DB service).'),
    ],
    followUps: [
      {
        q: bi('How do you handle a transaction that spans several services?', 'Kai services mein faile transaction ko kaise handle karte ho?'),
        a: bi(
          'With a saga: a sequence of local transactions where each step has a compensating action if a later step fails (cancel the order if payment fails). Steps are coordinated by events or an orchestrator, and the outbox pattern publishes events reliably.',
          'Saga se: local transactions ki series jisme har step ka compensating action hota hai agar aage ka step fail ho (payment fail ho to order cancel). Steps events ya orchestrator se coordinate hote hain, aur outbox pattern events ko reliably publish karta hai.',
        ),
      },
    ],
    related: { components: ['microservice', 'app-server', 'api-gateway', 'event-stream'], challenges: ['amazon-like-ecommerce', 'multi-tenant-saas-platform'] },
  },

  {
    id: 'why-distributed-systems-are-hard-to-debug',
    category: 'system-design',
    topic: 'architecture',
    question: bi('Why might a distributed system be harder to debug than a monolith?', 'Distributed system ko debug karna monolith se mushkil kyun ho sakta hai?'),
    kind: 'concept',
    level: 'intermediate',
    tags: ['distributed systems', 'debugging', 'observability', 'tracing', 'partial failure', 'clock skew', 'correlation id'],
    answer: bi(
      'Because one request crosses many services, machines and networks. Logs and state are scattered, failures are partial, timing changes behaviour, clocks disagree, and asynchronous messages separate the cause from the effect — so you cannot just attach a debugger and step through it. That is why I build in correlation IDs, distributed tracing and centralized structured logs from the start.',
      'Kyunki ek request kai services, machines aur networks se guzarti hai. Logs aur state bikhre hote hain, failures aadhe-adhure hote hain, timing se behaviour badalta hai, ghadiyaan sehmat nahi hotin, aur asynchronous messages kaaran ko asar se alag kar dete hain — isliye debugger jod ke step-by-step nahi chal sakte. Isiliye main shuru se correlation IDs, distributed tracing aur centralized structured logs rakhta hoon.',
    ),
    sections: [
      section(
        'One request, many places',
        'Ek request, kai jagahen',
        p('A single checkout in a microservice system can look like this:', 'Microservice system mein ek checkout aisa dikh sakta hai:'),
        code(
          'text',
          `
trace 4bf92f35  POST /checkout                          2.31 s
├─ api-gateway                                           12 ms
├─ order-service                                         35 ms
│  ├─ inventory-service                                  18 ms
│  └─ payment-service                                  2.10 s   ← timeout, retried once
└─ notification-service   (async, 3 minutes later)       ✗ failed`,
        ),
        p(
          'In a monolith this is one process and one log file. Here it is five services, five sets of logs, possibly five deploy versions — and the email failure appears minutes later, in another service.',
          'Monolith mein yeh ek process aur ek log file hota. Yahan paanch services, paanch tarah ke logs, shayad paanch deploy versions — aur email failure minutes baad, kisi doosri service mein dikhta hai.',
        ),
      ),
      section(
        'What makes it harder',
        'Kya ise mushkil banata hai',
        table(
          ['', 'Monolith', 'Distributed system'],
          [
            [bi('Where to look', 'Kahan dekhein'), bi('One process, one log', 'Ek process, ek log'), bi('Many services, logs, owners and versions', 'Kai services, logs, maalik aur versions')],
            ['Failures', bi('A call works or throws', 'Call chalti hai ya error'), bi('Partial: a timeout does not say whether the remote action happened', 'Partial: timeout nahi batata ki remote action hua ya nahi')],
            ['Network', 'In-memory calls', 'Latency, retries, duplicates, reordering'],
            ['Timing bugs', bi('Rare', 'Kam'), bi('Race conditions across services, visible only under load', 'Services ke beech race conditions, sirf load mein dikhti hain')],
            ['Time', bi('One clock', 'Ek ghadi'), bi('Clock skew: timestamps from different machines can lie about order', 'Clock skew: alag machines ke timestamps order ke baare mein jhooth bol sakte hain')],
            [bi('Cause and effect', 'Kaaran aur asar'), 'Same stack trace', bi('Separated by queues, minutes and services', 'Queues, minutes aur services se alag')],
          ],
        ),
      ),
      section(
        'How I make it debuggable',
        'Main ise debug karne layak kaise banata hoon',
        ul(
          ['**Correlation / trace IDs** created at the edge and passed to every service (W3C `traceparent` header).', 'Edge pe bane **correlation / trace IDs** jo har service tak jaate hain (W3C `traceparent` header).'],
          ['**Distributed tracing** with OpenTelemetry (Jaeger, Tempo) to see the span tree above.', 'Upar jaisa span tree dekhne ke liye OpenTelemetry (Jaeger, Tempo) se **distributed tracing**.'],
          ['**Centralized, structured logs** that include the trace ID, so one search shows the whole story.', '**Centralized, structured logs** jisme trace ID ho, taaki ek search poori kahani dikhaye.'],
          ['**Golden-signal metrics** per service and a service map.', 'Har service ke **golden-signal metrics** aur service map.'],
          ['**Clear timeouts and idempotency**, so partial failures are safe to retry.', '**Saaf timeouts aur idempotency**, taaki partial failures retry karna safe ho.'],
        ),
        code(
          'json',
          `
{
  "level": "error",
  "service": "payment-service",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "orderId": "ord_123",
  "msg": "card authorization timed out after 2000 ms"
}`,
        ),
      ),
      section(
        'How I debug an issue',
        'Main issue kaise debug karta hoon',
        steps(
          ['Start from the symptom', 'Lakshan se shuru', 'An alert or dashboard shows which endpoint and when.', 'Alert ya dashboard batata hai kaunsa endpoint aur kab.'],
          ['Find a failing trace', 'Fail hota trace dhoondho', 'The span tree shows which service is slow or failing.', 'Span tree dikhata hai kaunsi service slow ya fail ho rahi hai.'],
          ['Read the logs for that trace ID', 'Us trace ID ke logs padho', 'Filter centralized logs by the trace ID to get the exact error.', 'Centralized logs ko trace ID se filter karke bilkul sahi error pao.'],
          ['Reproduce and fix', 'Reproduce karo aur theek karo', 'Replay with the same inputs, fix, and add the signal that was missing.', 'Same inputs se dobara chalao, theek karo, aur jo signal missing tha woh jodo.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'Because a single request crosses many processes, machines and networks. Logs and state are spread across services with different versions and owners; failures are partial, so a timeout does not tell you whether the remote operation happened; the network adds latency, retries and duplicates; race conditions appear only under real load; clocks drift, so timestamps can lie about order; and asynchronous messaging separates cause from effect.',
          'Kyunki ek request kai processes, machines aur networks se guzarti hai. Logs aur state alag versions aur maalikon wali services mein bikhre hote hain; failures partial hote hain, to timeout nahi batata ki remote operation hua ya nahi; network latency, retries aur duplicates laata hai; race conditions sirf asli load mein dikhti hain; ghadiyaan khisakti hain, to timestamps order ke baare mein galat bata sakte hain; aur asynchronous messaging kaaran ko asar se alag kar deti hai.',
        ),
        bi(
          'To make it debuggable I propagate correlation and trace IDs everywhere, use distributed tracing with OpenTelemetry, ship structured logs that include the trace ID to one central place, track golden-signal metrics per service, and design for partial failure with timeouts and idempotency.',
          'Ise debug karne layak banane ke liye main har jagah correlation aur trace IDs bhejta hoon, OpenTelemetry se distributed tracing use karta hoon, trace ID wale structured logs ek central jagah bhejta hoon, har service ke golden-signal metrics track karta hoon, aur timeouts aur idempotency ke saath partial failure ke liye design karta hoon.',
        ),
      ],
      keywords: ['Partial failure', 'Network partition', 'Non-determinism', 'Clock skew', 'Correlation ID', 'Distributed tracing', 'OpenTelemetry', 'Context propagation', 'Structured logging', 'Cascading failure', 'Fallacies of distributed computing'],
    },
    listenFor: [
      bi('Specific reasons, not just “there are more services”.', 'Khaas kaaran, sirf “zyaada services hain” nahi.'),
      bi('Knowing tracing and correlation IDs, and designing for partial failure.', 'Tracing aur correlation IDs ki jaankari, aur partial failure ke liye design.'),
    ],
    mistakes: [bi('Only saying “there are more logs to read”.', 'Sirf yeh kehna ki “padhne ko zyaada logs hain”.'), bi('Never mentioning tracing.', 'Tracing ka zikr hi na karna.')],
    followUps: [
      {
        q: bi('What are the fallacies of distributed computing?', 'Fallacies of distributed computing kya hain?'),
        a: bi(
          'Assumptions that fail in real life: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology does not change, there is one administrator, transport cost is zero, and the network is homogeneous.',
          'Woh maanyataayein jo asli duniya mein galat nikalti hain: network reliable hai, latency zero hai, bandwidth anant hai, network secure hai, topology nahi badalti, ek hi administrator hai, transport ka kharcha zero hai, aur network ek jaisa hai.',
        ),
      },
    ],
    related: { components: ['distributed-tracing', 'logging-service', 'metrics-monitoring'], challenges: ['distributed-tracing-system', 'observability-platform'] },
  },

  {
    id: 'when-to-use-a-cache',
    category: 'system-design',
    topic: 'scaling',
    question: bi('When would you use a cache and what problems can it introduce?', 'Cache kab use karoge aur yeh kaun si problems la sakta hai?'),
    kind: 'concept',
    level: 'intermediate',
    tags: ['cache', 'redis', 'ttl', 'invalidation', 'stampede', 'consistency', 'cache-aside'],
    answer: bi(
      'I use a cache when the same data is read far more often than it changes and a slightly stale copy is acceptable — to cut latency and database load. The trade-offs are stale data and invalidation, cache stampedes when popular keys expire, one more system to run, and the risk of overloading the database when the cache fails or is cold.',
      'Main cache tab use karta hoon jab same data badalne se kahin zyaada baar padha jaata ho aur thodi purani copy chal jaaye — taaki latency aur database load kam ho. Trade-offs hain purana data aur invalidation, popular keys expire hone pe cache stampede, chalane ko ek aur system, aur cache fail ya khaali hone pe database overload hone ka risk.',
    ),
    sections: [
      section(
        'When I use a cache',
        'Main cache kab use karta hoon',
        table(
          [bi('Good fit', 'Sahi jagah'), bi('Poor fit', 'Galat jagah')],
          [
            [bi('Read-heavy data (100 reads per write): product pages, profiles', 'Read-heavy data (har write pe 100 reads): product pages, profiles'), bi('Data that must be exact right now: a balance during payment', 'Data jo abhi bilkul sahi hona chahiye: payment ke waqt balance')],
            [bi('Expensive queries or computed results: feeds, recommendations', 'Mehngi queries ya computed results: feeds, recommendations'), bi('Write-heavy data that changes constantly', 'Write-heavy data jo lagaataar badalta hai')],
            [bi('Hot keys: a celebrity profile, a trending product', 'Hot keys: celebrity profile, trending product'), bi('Personal data read once and never again', 'Personal data jo ek baar padha aur phir kabhi nahi')],
            [bi('Sessions, rate-limit counters, static files at a CDN', 'Sessions, rate-limit counters, CDN pe static files'), ''],
          ],
        ),
      ),
      section(
        'How I usually implement it: cache-aside',
        'Main aam taur pe kaise implement karta hoon: cache-aside',
        figure(
          scene(
            [[a('users', 'Users', 'Users')], [c('app-server')], [c('distributed-cache', { state: 'focus', note: '< 1 ms' }), c('sql-db', { note: '5–20 ms' })]],
            ['users>app-server', ['app-server>distributed-cache', bi('check first', 'pehle yahan dekho')], ['app-server.>sql-db', bi('only on a miss', 'sirf miss hone pe')]],
            bi('The app checks the cache first and reads the database only on a miss.', 'App pehle cache dekhta hai aur miss hone pe hi database padhta hai.'),
          ),
        ),
        code(
          'ts',
          `
async function getProduct(id: string) {
  const cached = await redis.get(\`product:\${id}\`);
  if (cached) return JSON.parse(cached);                          // hit

  const product = await db.products.findById(id);                 // miss
  await redis.set(\`product:\${id}\`, JSON.stringify(product), 'EX', 300);  // TTL 5 min
  return product;
}

async function updateProduct(id: string, data: ProductInput) {
  await db.products.update(id, data);
  await redis.del(\`product:\${id}\`);    // invalidate — the next read reloads it
}`,
        ),
        table(
          ['Pattern', bi('How it works', 'Kaise kaam karta hai'), bi('When I use it', 'Kab use karta hoon')],
          [
            ['Cache-aside', bi('App reads cache, loads DB on miss, deletes key on write', 'App cache padhta hai, miss pe DB se laata hai, write pe key delete'), 'Default choice'],
            ['Write-through', bi('Write to cache and DB together', 'Cache aur DB mein saath likho'), bi('Reads must be fresh right after writes', 'Write ke turant baad reads fresh chahiye')],
            ['Write-behind', bi('Write to cache, flush to DB later', 'Cache mein likho, DB mein baad mein'), bi('Counters/metrics where small loss is OK', 'Counters/metrics jahan thoda nuksaan chal jaaye')],
          ],
        ),
      ),
      section(
        'Problems a cache introduces',
        'Cache kaun si problems laata hai',
        table(
          ['Problem', bi('What happens', 'Kya hota hai'), bi('How I handle it', 'Main kaise sambhaalta hoon')],
          [
            [bi('Stale data', 'Purana data'), bi('Users see old prices after an update', 'Update ke baad users ko purani price dikhti hai'), bi('TTL + delete on write; versioned keys', 'TTL + write pe delete; versioned keys')],
            ['Cache stampede', bi('A hot key expires; thousands of misses hit the DB at once', 'Hot key expire; hazaaron misses ek saath DB pe'), 'Request coalescing, stale-while-revalidate, TTL jitter'],
            ['Cache penetration', bi('Requests for missing IDs always miss and hit the DB', 'Missing IDs ki requests hamesha miss hoke DB pe'), bi('Cache “not found” briefly, or a Bloom filter', '“Not found” ko thodi der cache karo, ya Bloom filter')],
            ['Avalanche / cache down', bi('Many keys expire together or Redis dies; DB is flooded', 'Bahut keys ek saath expire ya Redis mar gaya; DB mein baadh'), bi('Spread expiries, replicate the cache, circuit breaker on DB', 'Expiry failao, cache replicate karo, DB pe circuit breaker')],
            ['Hot key', bi('One key gets most traffic and overloads one node', 'Ek key ko zyaada traffic, ek node overload'), bi('Small local cache in front, replicate the key', 'Aage chhota local cache, key replicate karo')],
            ['Cold start', bi('Empty cache after a deploy or restart', 'Deploy ya restart ke baad khaali cache'), bi('Warm up hot keys; roll out gradually', 'Hot keys pehle bharo; dheere-dheere rollout')],
          ],
        ),
        note(
          'tip',
          'On a write I **delete** the key rather than update it. Updating can race with a concurrent read and leave an older value in the cache; after a delete, the next read loads fresh data.',
          'Write pe main key **delete** karta hoon, update nahi. Update karne se concurrent read ke saath race hoke purani value cache mein reh sakti hai; delete ke baad agla read fresh data laata hai.',
        ),
      ),
      section(
        'What I monitor',
        'Main kya monitor karta hoon',
        ul(
          ['Hit ratio — a sudden drop means more load on the database.', 'Hit ratio — achanak giravat matlab database pe zyaada load.'],
          ['Latency, evictions and memory usage.', 'Latency, evictions aur memory usage.'],
          ['Database load next to the cache metrics, to see what a cache failure would cost.', 'Cache metrics ke saath database load, taaki pata ho cache fail hone ki keemat kya hogi.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I add a cache when data is read much more often than it changes and slightly stale reads are acceptable — product pages, profiles, feeds, sessions, expensive computed results. My default is cache-aside with a TTL: read from Redis, load from the database on a miss, and delete the key on writes.',
          'Main cache tab lagata hoon jab data badalne se kahin zyaada padha jaata ho aur thoda purana read chal jaaye — product pages, profiles, feeds, sessions, mehenge computed results. Mera default TTL ke saath cache-aside hai: Redis se padho, miss pe database se laao, aur write pe key delete karo.',
        ),
        bi(
          'The problems are stale data and invalidation, cache stampedes when hot keys expire, penetration from requests for missing keys, avalanches when many keys expire or the cache goes down, hot keys and cold starts. I handle them with TTLs plus invalidation on write, request coalescing and jittered TTLs, caching negative results, a replicated cache with a circuit breaker protecting the database, and I monitor the hit ratio.',
          'Problems hain purana data aur invalidation, hot keys expire hone pe cache stampede, missing keys ki requests se penetration, bahut keys expire ya cache down hone pe avalanche, hot keys aur cold starts. Main inhe write pe invalidation ke saath TTLs, request coalescing aur jitter wale TTLs, negative results cache karke, database ko bachane wale circuit breaker ke saath replicated cache se sambhaalta hoon, aur hit ratio monitor karta hoon.',
        ),
      ],
      keywords: ['Cache hit ratio', 'Cache-aside', 'Write-through', 'Write-behind', 'TTL', 'Cache invalidation', 'Eviction (LRU / LFU)', 'Cache stampede', 'Request coalescing', 'Hot key', 'Cache penetration', 'Cache avalanche'],
    },
    listenFor: [
      bi('Clear criteria for when to cache: read/write ratio and tolerance for staleness.', 'Cache kab karna hai iske saaf criteria: read/write ratio aur purane data ki gunjaish.'),
      bi('Knowing invalidation and stampede problems, and measuring the hit ratio.', 'Invalidation aur stampede problems ki jaankari, aur hit ratio naapna.'),
    ],
    mistakes: [bi('Caching everything, with no TTL.', 'Sab kuch cache karna, bina TTL ke.'), bi('Treating the cache as durable storage.', 'Cache ko durable storage samajhna.')],
    followUps: [
      {
        q: bi('Local in-memory cache or Redis?', 'Local in-memory cache ya Redis?'),
        a: bi(
          'Local memory is the fastest, but every instance has its own copy, so they can disagree. Redis is shared and consistent across instances but adds a network hop. For the hottest keys I sometimes use both: a tiny local cache with a short TTL in front of Redis.',
          'Local memory sabse fast hai, par har instance ki apni copy hoti hai, to woh alag ho sakti hain. Redis shared aur saare instances mein consistent hai par ek network hop jodta hai. Sabse hot keys ke liye main kabhi dono use karta hoon: Redis ke aage chhote TTL wala chhota local cache.',
        ),
      },
    ],
    related: { components: ['distributed-cache', 'in-memory-cache', 'cdn'], challenges: ['distributed-cache', 'url-shortener-basic', 'news-feed-service'] },
  },

  {
    id: 'queue-vs-synchronous-api-call',
    category: 'system-design',
    topic: 'messaging',
    question: bi('When would you use a queue instead of a synchronous API call?', 'Synchronous API call ki jagah queue kab use karoge?'),
    kind: 'comparison',
    level: 'intermediate',
    tags: ['message queue', 'async', 'kafka', 'rabbitmq', 'sqs', 'decoupling', 'outbox'],
    answer: bi(
      'I use a synchronous call when the caller needs the result right now to continue. I use a queue when the work can happen a little later, takes long, arrives in bursts, must survive the consumer being down, or needs to reach several consumers — accepting eventual consistency and the extra work of handling duplicates and failures.',
      'Main synchronous call tab use karta hoon jab caller ko aage badhne ke liye result abhi chahiye. Queue tab use karta hoon jab kaam thodi der baad ho sakta ho, lamba chalta ho, jhatkon mein aata ho, consumer down hone pe bhi bachna ho, ya kai consumers tak pahunchna ho — eventual consistency aur duplicates aur failures sambhaalne ka extra kaam maan ke.',
    ),
    sections: [
      section(
        'How I decide',
        'Main kaise decide karta hoon',
        table(
          [bi('Question', 'Sawaal'), 'Synchronous call', 'Queue'],
          [
            [bi('Does the caller need the result now?', 'Caller ko result abhi chahiye?'), bi('Yes', 'Haan'), bi('No — “accepted, will be done”', 'Nahi — “le liya, ho jaayega”')],
            [bi('How long does the work take?', 'Kaam kitna time leta hai?'), bi('Milliseconds', 'Kuch milliseconds'), bi('Seconds to minutes', 'Seconds se minutes')],
            ['Traffic pattern', 'Steady', bi('Spiky, bursty', 'Spiky, jhatkon mein')],
            [bi('If the receiver is down', 'Agar receiver down ho'), bi('The caller fails too', 'Caller bhi fail'), bi('Messages wait and are processed later', 'Messages wait karte hain, baad mein process')],
            ['Receivers', bi('One', 'Ek'), bi('One or many (pub/sub fan-out)', 'Ek ya kai (pub/sub fan-out)')],
            ['Consistency', bi('Immediate', 'Turant'), bi('Eventual', 'Thodi der baad (eventual)')],
          ],
        ),
      ),
      section(
        'A typical example: placing an order',
        'Ek typical example: order place karna',
        figure(
          scene(
            [
              [a('user', 'User', 'User')],
              [c('app-server', { note: bi('saves the order', 'order save karta hai') })],
              [c('message-queue', { state: 'focus' })],
              [c('background-worker', { note: 'email, invoice' })],
            ],
            ['user>app-server', 'app-server~>message-queue', 'message-queue~>background-worker'],
            bi(
              'The API saves the order and replies straight away (202 Accepted); the slow work waits in the queue and a worker does it in the background.',
              'API order save karke turant jawab deta hai (202 Accepted); slow kaam queue mein wait karta hai aur worker use background mein karta hai.',
            ),
          ),
        ),
        code(
          'ts',
          `
// POST /orders — the fast, synchronous part
const order = await db.orders.create({ ...input, status: 'PENDING' });
await queue.publish('order.placed', { orderId: order.id });
res.status(202).json({ orderId: order.id, status: 'PENDING' });

// worker — the slow part, in the background
queue.subscribe('order.placed', async ({ orderId }) => {
  await sendConfirmationEmail(orderId);
  await generateInvoice(orderId);
});`,
        ),
        p(
          'The user gets a response in milliseconds. If the email provider is down, the messages wait and are retried instead of failing the order.',
          'User ko milliseconds mein jawab milta hai. Email provider down ho to messages wait karte hain aur retry hote hain, order fail nahi hota.',
        ),
        note(
          'warning',
          'There is a subtle bug above: if the app crashes after saving the order but before publishing, the event is lost. The **transactional outbox** pattern fixes it — write the event to an `outbox` table in the same transaction, and let a relay publish it.',
          'Upar ek chhupa bug hai: agar app order save karne ke baad aur publish karne se pehle crash ho, to event kho jaata hai. **Transactional outbox** pattern ise theek karta hai — event ko same transaction mein `outbox` table mein likho, aur ek relay use publish kare.',
        ),
      ),
      section(
        'Where I use queues',
        'Main queues kahan use karta hoon',
        ul(
          ['Emails, SMS and push notifications.', 'Emails, SMS aur push notifications.'],
          ['Image and video processing, PDF and report generation.', 'Image aur video processing, PDF aur report banana.'],
          ['Processing payment webhooks and order fulfilment steps.', 'Payment webhooks aur order fulfilment ke steps process karna.'],
          ['Syncing data to a search index or warehouse; analytics events.', 'Search index ya warehouse tak data sync; analytics events.'],
          ['Events between microservices that should not depend on each other being up.', 'Microservices ke beech events jo ek doosre ke up hone pe depend nahi hone chahiye.'],
        ),
      ),
      section(
        'What a queue demands from you',
        'Queue aapse kya maangti hai',
        ul(
          ['**Idempotent consumers** — most queues deliver at least once, so the same message can arrive twice.', '**Idempotent consumers** — zyaadatar queues at-least-once deliver karti hain, to same message do baar aa sakta hai.'],
          ['**Retries with backoff and a dead-letter queue** for messages that keep failing.', 'Baar-baar fail hone wale messages ke liye **backoff ke saath retries aur dead-letter queue**.'],
          ['**Ordering per key** where it matters (all events of one order in sequence).', 'Jahan zaroori ho **per-key ordering** (ek order ke saare events sequence mein).'],
          ['**Monitoring queue depth and consumer lag**, with alerts on a growing backlog.', '**Queue depth aur consumer lag ki monitoring**, badhte backlog pe alerts ke saath.'],
        ),
        table(
          ['', 'Work queue (SQS, RabbitMQ)', 'Event stream (Kafka)'],
          [
            [bi('After processing', 'Process hone ke baad'), bi('Message is deleted', 'Message delete'), bi('Event is kept for days', 'Event dinon tak rehta hai')],
            ['Consumers', bi('Workers share the messages', 'Workers messages baant-te hain'), bi('Each consumer group reads everything and can replay', 'Har consumer group sab padhta hai aur replay kar sakta hai')],
            [bi('Good for', 'Kiske liye accha'), 'Background jobs', bi('Event-driven systems, analytics, many subscribers', 'Event-driven systems, analytics, kai subscribers')],
          ],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I use a synchronous call when the caller needs the result immediately — reading a balance or validating a card. I use a queue when the work is slow, spiky or can happen later, when it must survive the consumer being down, or when several consumers need the same event: emails, media processing, reports, search indexing and events between microservices.',
          'Main synchronous call tab use karta hoon jab caller ko result turant chahiye — balance padhna ya card validate karna. Queue tab use karta hoon jab kaam slow, spiky ya baad mein ho sakta ho, consumer down hone pe bhi bachna ho, ya kai consumers ko same event chahiye: emails, media processing, reports, search indexing aur microservices ke beech events.',
        ),
        bi(
          'A common pattern is to validate and save synchronously, return 202 Accepted, and do the rest asynchronously. Queues bring eventual consistency and need idempotent consumers, retries with a dead-letter queue, ordering per key where needed, the transactional outbox to avoid lost events, and monitoring of queue depth and consumer lag.',
          'Common pattern hai synchronously validate aur save karna, 202 Accepted lautana, aur baaki asynchronously karna. Queues eventual consistency laati hain aur inhe idempotent consumers, dead-letter queue ke saath retries, zaroorat ho to per-key ordering, events na khone ke liye transactional outbox, aur queue depth aur consumer lag ki monitoring chahiye.',
        ),
      ],
      keywords: ['Temporal coupling', 'Decoupling', 'Load levelling', 'At-least-once delivery', 'Idempotent consumer', 'Dead-letter queue', '202 Accepted', 'Eventual consistency', 'Pub/sub fan-out', 'Transactional outbox', 'Consumer lag'],
    },
    listenFor: [
      bi('Decision criteria: does the caller need the answer now, coupling, spikes.', 'Decision ke criteria: kya caller ko jawab abhi chahiye, coupling, spikes.'),
      bi('Knowing the costs: eventual consistency, duplicates, monitoring.', 'Kharchon ki samajh: eventual consistency, duplicates, monitoring.'),
    ],
    mistakes: [bi('Making everything asynchronous.', 'Sab kuch asynchronous bana dena.'), bi('Ignoring duplicate messages or having no dead-letter queue.', 'Duplicate messages ignore karna ya dead-letter queue na rakhna.')],
    followUps: [
      {
        q: bi('How does the user find out the background job finished?', 'User ko kaise pata chalega ki background job ho gaya?'),
        a: bi(
          'By polling a status endpoint (`GET /orders/481`), a server push (WebSocket or Server-Sent Events), a push notification, or a webhook for server-to-server integrations.',
          'Status endpoint poll karke (`GET /orders/481`), server push se (WebSocket ya Server-Sent Events), push notification se, ya server-to-server integrations ke liye webhook se.',
        ),
      },
    ],
    related: { components: ['message-queue', 'event-stream', 'background-worker', 'dead-letter-queue'], challenges: ['basic-notification-service', 'video-upload-and-transcoding', 'distributed-message-queue'] },
  },
];
