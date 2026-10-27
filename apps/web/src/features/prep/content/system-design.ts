import { a, bi, c, scene } from '@/features/learn/dsl';
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
    tags: ['microservices', 'monolith', 'modular monolith', 'architecture', 'scaling', 'ddd', 'saga'],
    simple: bi(
      'A monolith is one application, deployed as one unit, that does everything. Microservices split the system into many small applications, each owning one business capability and its own data, talking over the network. Microservices give you independent deployment and scaling, but add a lot of complexity; a monolith is simpler and faster to build and change while the product and the team are small.',
      'Monolith ek application hai, ek unit ki tarah deploy hoti hai, aur sab kuch karti hai. Microservices system ko kai chhoti applications mein baant dete hain, har ek ek business capability aur apne data ki maalik, aur network pe baat karti hain. Microservices alag-alag deploy aur scale karne ki azaadi dete hain, par bahut complexity badhate hain; jab tak product aur team chhote hain, monolith banana aur badalna simple aur fast hai.',
    ),
    example: bi(
      'A small restaurant where one kitchen and one team cook everything (monolith): easy to coordinate and one place to clean — but if the kitchen floods, nothing gets cooked, and it can only grow so big. A food court with separate stalls (microservices): each stall has its own staff, menu and stock and can expand or close on its own — but now you need shared billing and coordination, and customers walk between stalls (network calls).',
      'Chhota restaurant jahan ek kitchen aur ek team sab kuch pakaati hai (monolith): coordinate karna aasaan aur saaf karne ko ek hi jagah — par kitchen mein paani bhar gaya to kuch nahi pakega, aur yeh ek had tak hi bada ho sakta hai. Food court jisme alag-alag stalls (microservices): har stall ka apna staff, menu aur stock, aur woh akela badh ya band ho sakta hai — par ab shared billing aur coordination chahiye, aur customers stalls ke beech chalte hain (network calls).',
    ),
    why: bi(
      'Microservices exist because large organisations with many teams block each other inside one codebase: one release train, one bad deploy takes everything down, one hot feature cannot be scaled on its own.',
      'Microservices isliye bane kyunki kai teams wali badi companies ek codebase mein ek doosre ko rokti hain: ek hi release train, ek kharab deploy sab gira deta hai, ek hot feature ko akele scale nahi kar sakte.',
    ),
    without: bi(
      'Choosing wrongly hurts both ways: microservices too early create a “distributed monolith” — many services that must deploy together, network failures everywhere, slow development. A monolith kept too long at huge scale means slow builds, risky deploys and teams stepping on each other.',
      'Galat choice dono taraf nuksaan karti hai: bahut jaldi microservices “distributed monolith” banate hain — kai services jo saath deploy karni padti hain, har jagah network failures, slow development. Bahut bade scale pe bhi monolith chalaate raho to slow builds, risky deploys aur teams ek doosre pe pair rakhti hain.',
    ),
    table: {
      columns: ['Aspect', 'Monolith', 'Microservices'],
      rows: [
        ['Deployment', bi('One unit, all or nothing', 'Ek unit, sab ya kuch nahi'), bi('Each service on its own', 'Har service alag')],
        ['Scaling', bi('Scale the whole app', 'Poori app scale karo'), bi('Scale only the busy services', 'Sirf busy services scale karo')],
        [bi('Early speed', 'Shuruaati speed'), bi('Fast and simple', 'Fast aur simple'), bi('Slower: lots of setup', 'Slow: bahut setup')],
        ['Teams', bi('Shared codebase, more coordination', 'Shared codebase, zyaada coordination'), bi('Teams own services end to end', 'Teams services ki poori maalik')],
        ['Data', bi('One database, easy joins and transactions', 'Ek database, joins aur transactions aasaan'), bi('Database per service, eventual consistency, sagas', 'Har service ka database, eventual consistency, sagas')],
        ['Failures', bi('One bug can crash everything', 'Ek bug sab gira sakta hai'), bi('Isolated, but network failures are new', 'Alag-thalag, par network failures naye')],
        ['Debugging', bi('One process, simple', 'Ek process, simple'), bi('Needs tracing and contract tests', 'Tracing aur contract tests chahiye')],
        [bi('Ops cost', 'Ops kharcha'), bi('Low', 'Kam'), bi('High: CI/CD per service, discovery, monitoring', 'Zyaada: har service ka CI/CD, discovery, monitoring')],
      ],
    },
    partsTitle: bi('Deciding, step by step', 'Decide karna, step by step'),
    parts: [
      {
        title: bi('Start with a (modular) monolith when…', '(Modular) monolith se shuru karo jab…'),
        text: bi(
          'The product is new, the team is small (roughly under 10–15 engineers), the domain is still changing, and speed matters most. Keep clear module boundaries inside it so pieces can be extracted later.',
          'Product naya ho, team chhoti ho (lagbhag 10–15 engineers se kam), domain abhi badal raha ho, aur speed sabse zaroori ho. Andar saaf module boundaries rakho taaki baad mein hisse alag kiye ja sakein.',
        ),
      },
      {
        title: bi('Choose microservices when…', 'Microservices chuno jab…'),
        text: bi(
          'Many teams need to deploy independently; parts have very different scaling or reliability needs (video transcoding vs user profiles); the domain boundaries are clear and stable; and you have DevOps maturity — CI/CD, observability and on-call.',
          'Kai teams ko alag-alag deploy karna ho; hisson ki scaling ya reliability zaroorat bahut alag ho (video transcoding vs user profiles); domain boundaries saaf aur stable hon; aur DevOps maturity ho — CI/CD, observability aur on-call.',
        ),
      },
      {
        title: bi('The hidden costs of microservices', 'Microservices ke chhupe kharche'),
        text: bi(
          'Network latency and partial failures; transactions across services (sagas, the outbox pattern); keeping data consistent; versioning APIs between services; distributed tracing; and far more infrastructure to run.',
          'Network latency aur partial failures; services ke beech transactions (sagas, outbox pattern); data consistent rakhna; services ke beech APIs ki versioning; distributed tracing; aur chalane ko kahin zyaada infrastructure.',
        ),
      },
      {
        title: bi('The middle path: a modular monolith', 'Beech ka raasta: modular monolith'),
        text: bi(
          'One deployable unit, but strict internal modules that own their data access and talk through clear interfaces. You get most of the benefits of boundaries without paying distributed-system costs. Shopify famously runs this way.',
          'Ek deploy hone wali unit, par andar sakht modules jo apne data access ke maalik hain aur saaf interfaces se baat karte hain. Boundaries ke zyaadatar fayde milte hain bina distributed system ki keemat chukaaye. Shopify mashhoor taur pe aise hi chalta hai.',
        ),
      },
      {
        title: bi('Migrating safely: the strangler fig pattern', 'Safely migrate karna: strangler fig pattern'),
        text: bi(
          'Put a gateway in front of the monolith and extract one capability at a time — usually the one that changes most or scales differently — with its own data. Route its traffic to the new service, then remove the old code. Avoid big-bang rewrites.',
          'Monolith ke aage gateway lagao aur ek-ek capability nikaalo — aam taur pe jo sabse zyaada badalti ho ya alag scale hoti ho — apne data ke saath. Uska traffic nayi service pe bhejo, phir purana code hatao. Ek jhatke mein sab dobara likhne se bacho.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'A monolith is simpler to build, test and operate and is usually the right start; microservices trade that simplicity for independent deployment, scaling and team autonomy, which pays off only when the organisation and the domain are large and stable enough to justify the distributed-systems overhead.',
        'Monolith banana, test karna aur chalana simple hai aur aam taur pe sahi shuruaat hai; microservices yeh simplicity dekar independent deployment, scaling aur team autonomy dete hain, jo tabhi faayda deta hai jab organisation aur domain itne bade aur stable hon ki distributed systems ka bojh uthaya ja sake.',
      ),
      points: [
        bi('Monolith pros: simple development, testing and deployment, local transactions, fast in-process calls, low ops cost.', 'Monolith ke fayde: simple development, testing aur deployment, local transactions, fast in-process calls, kam ops kharcha.'),
        bi('Monolith cons: whole-app deploys, coupled scaling, codebase and team bottlenecks as it grows, larger blast radius.', 'Monolith ke nuksaan: poori app ka deploy, judi hui scaling, badhne pe codebase aur team ki rukawat, bada blast radius.'),
        bi('Microservices pros: independent deploys, per-service scaling, fault isolation, team ownership, technology choice.', 'Microservices ke fayde: alag deploys, har service ki scaling, fault isolation, team ownership, technology ki azaadi.'),
        bi('Microservices cons: network latency and partial failures, eventual consistency and sagas, harder testing and debugging, more infrastructure.', 'Microservices ke nuksaan: network latency aur partial failures, eventual consistency aur sagas, mushkil testing aur debugging, zyaada infrastructure.'),
        bi('I start with a modular monolith with clear bounded contexts and extract services with the strangler fig pattern when team size, deploy friction or scaling needs demand it.', 'Main saaf bounded contexts wale modular monolith se shuru karta hoon aur jab team size, deploy ki rukawat ya scaling ki zaroorat ho tab strangler fig pattern se services nikaalta hoon.'),
        bi('Avoid the distributed monolith: each service owns its data and deploys independently.', 'Distributed monolith se bacho: har service apne data ki maalik ho aur alag deploy ho.'),
      ],
      keywords: [
        'Bounded context',
        'Domain-Driven Design',
        'Modular monolith',
        'Independent deployability',
        'Database per service',
        'Eventual consistency',
        'Saga pattern',
        'Distributed monolith',
        'Conway’s law',
        'Strangler fig pattern',
        'Fault isolation',
        'Service discovery',
      ],
    },
    listenFor: [
      bi('A balanced view rather than hype.', 'Hype ki jagah santulit nazariya.'),
      bi('Tying the decision to team size, domain maturity and operational maturity.', 'Decision ko team size, domain maturity aur operational maturity se jodna.'),
      bi('Data ownership, and a realistic migration path.', 'Data ownership, aur realistic migration path.'),
    ],
    mistakes: [
      bi('“Microservices are always better / more modern.”', '“Microservices hamesha behtar / zyaada modern hain.”'),
      bi('Splitting by technical layer (a UI service, a DB service) instead of by business capability.', 'Business capability ki jagah technical layer se baantna (UI service, DB service).'),
      bi('Several services sharing one database.', 'Kai services ka ek hi database share karna.'),
      bi('Ignoring the operational cost.', 'Operational kharche ko ignore karna.'),
    ],
    followUps: [
      {
        q: bi('How do you handle a transaction that spans several services?', 'Kai services mein faile transaction ko kaise handle karte ho?'),
        a: bi(
          'With a saga: a sequence of local transactions, each with a compensating action if a later step fails, coordinated by events (choreography) or by an orchestrator. The outbox pattern publishes the events reliably.',
          'Saga se: local transactions ki ek series, har ek ke saath compensating action agar aage ka step fail ho, events (choreography) ya orchestrator se coordinate. Outbox pattern events ko reliably publish karta hai.',
        ),
      },
      {
        q: bi('What is a distributed monolith?', 'Distributed monolith kya hai?'),
        a: bi(
          'Services so tightly coupled — a shared database, long synchronous call chains, releases that must go out together — that you pay all the costs of microservices and get none of the benefits.',
          'Services itni judi hui — shared database, lambi synchronous call chains, saath jaane wale releases — ki microservices ke saare kharche lagte hain aur faayda ek bhi nahi.',
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
    tags: ['distributed systems', 'debugging', 'observability', 'tracing', 'partial failure', 'clock skew'],
    simple: bi(
      'In a monolith, one request runs inside one program: you can follow it with a debugger and read one log file. In a distributed system the same request hops across many services, machines and queues. Each has its own logs and its own clock, things fail only partly, messages arrive late or out of order, and the bug often lives in the interaction between services rather than inside any one of them.',
      'Monolith mein ek request ek hi program ke andar chalti hai: debugger se follow kar sakte ho aur ek log file padh sakte ho. Distributed system mein wahi request kai services, machines aur queues se hoke jaati hai. Har ek ke apne logs aur apni ghadi hai, cheezein aadhi-adhuri fail hoti hain, messages der se ya ulte order mein aate hain, aur bug aksar kisi ek service ke andar nahi balki services ke aapsi talmel mein hota hai.',
    ),
    example: bi(
      'Finding out why a parcel arrived late. If one person carried it door to door (a monolith), you just ask them. With a courier network (distributed) — pickup agent, sorting hub, truck, another hub, delivery person — everyone keeps their own notebook, their watches show slightly different times, and the parcel may even have been sent twice. Without a tracking number that everybody writes down (a trace ID), you cannot rebuild the journey.',
      'Pata karna ki parcel der se kyun aaya. Agar ek hi insaan use ghar se ghar tak laaya (monolith), to bas usse pooch lo. Courier network mein (distributed) — pickup agent, sorting hub, truck, doosra hub, delivery wala — sab apni-apni notebook rakhte hain, sabki ghadiyaan thoda alag time dikhaati hain, aur ho sakta hai parcel do baar bhi bheja gaya ho. Ek tracking number ke bina jise sab likhein (trace ID), safar dobara jodna namumkin hai.',
    ),
    why: bi(
      'Most production incidents in microservices are about latency, timeouts and partial failures between services — and you cannot attach a debugger to production, so the tools must be in place before things go wrong.',
      'Microservices ke zyaadatar production incidents services ke beech latency, timeouts aur partial failures ke hote hain — aur production se debugger nahi jod sakte, isliye tools gadbad hone se pehle hi taiyaar hone chahiye.',
    ),
    without: bi(
      'Without good observability you spend hours grepping logs on many machines, teams blame each other, and intermittent bugs never reproduce locally.',
      'Acchi observability ke bina ghanton kai machines pe logs grep karte ho, teams ek doosre ko dosh deti hain, aur kabhi-kabhi aane wale bugs local mein kabhi reproduce nahi hote.',
    ),
    partsTitle: bi('What makes it hard', 'Kya ise mushkil banata hai'),
    parts: [
      {
        title: bi('No single place to look', 'Dekhne ki ek jagah nahi'),
        text: bi(
          'One request spans many services, each with its own logs, metrics, deployed version and owning team.',
          'Ek request kai services mein failti hai, har ek ke apne logs, metrics, deployed version aur maalik team.',
        ),
      },
      {
        title: 'Partial failure',
        text: bi(
          'Some calls succeed while others time out. A timeout does not tell the caller whether the remote action happened — which leads to duplicates and inconsistent state.',
          'Kuch calls succeed hoti hain, kuch time out. Timeout caller ko yeh nahi batata ki remote action hua ya nahi — isse duplicates aur inconsistent state bante hain.',
        ),
      },
      {
        title: bi('An unreliable network', 'Bharosa na karne layak network'),
        text: bi(
          'Latency varies, packets are lost, requests are retried, and messages can be duplicated or reordered.',
          'Latency badalti rehti hai, packets kho jaate hain, requests retry hoti hain, aur messages duplicate ya ulte order mein ho sakte hain.',
        ),
      },
      {
        title: bi('Timing-dependent bugs', 'Timing pe depend bugs'),
        text: bi(
          'Race conditions across services depend on load and timing, so they appear in production and vanish on your laptop.',
          'Services ke beech race conditions load aur timing pe depend karti hain, isliye production mein dikhti hain aur aapke laptop pe gayab.',
        ),
      },
      {
        title: bi('Clocks disagree', 'Ghadiyaan sehmat nahi'),
        text: bi(
          'Each machine’s clock drifts a little (clock skew), so sorting events from different services by timestamp can show the wrong order.',
          'Har machine ki ghadi thodi khisakti hai (clock skew), isliye alag services ke events timestamp se sort karne pe galat order dikh sakta hai.',
        ),
      },
      {
        title: 'Asynchronous hops',
        text: bi(
          'Queues and events separate cause and effect: the error shows up minutes later, in a different service.',
          'Queues aur events kaaran aur asar ko alag kar dete hain: error minutes baad, kisi doosri service mein dikhti hai.',
        ),
      },
      {
        title: bi('Cascading failures and drift', 'Cascading failures aur drift'),
        text: bi(
          'One slow dependency slows its callers, so the symptom appears far from the cause. Services also run different versions and configurations, and local environments cannot mirror production.',
          'Ek slow dependency apne callers ko slow karti hai, to lakshan kaaran se door dikhta hai. Services alag versions aur configurations pe bhi chalti hain, aur local environment production jaisa nahi ban paata.',
        ),
      },
      {
        title: bi('How we make it debuggable', 'Ise debug karne layak kaise banate hain'),
        text: bi(
          'A correlation / trace ID created at the edge and passed to every service and log line (W3C traceparent); distributed tracing (OpenTelemetry, Jaeger); centralized, structured logs; golden-signal metrics per service; service maps; clear timeouts and idempotency; chaos and contract testing; runbooks.',
          'Edge pe bana correlation / trace ID jo har service aur har log line tak jaaye (W3C traceparent); distributed tracing (OpenTelemetry, Jaeger); centralized, structured logs; har service ke golden-signal metrics; service maps; saaf timeouts aur idempotency; chaos aur contract testing; runbooks.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'Because a single request crosses many processes, machines and networks: state and logs are scattered, failures are partial and non-deterministic, clocks disagree, and asynchronous hops separate cause from effect — so you cannot just step through it with a debugger.',
        'Kyunki ek request kai processes, machines aur networks se guzarti hai: state aur logs bikhre hote hain, failures aadhe-adhure aur non-deterministic hote hain, ghadiyaan sehmat nahi hotin, aur asynchronous hops kaaran ko asar se alag kar dete hain — isliye debugger se step-by-step nahi chal sakte.',
      ),
      points: [
        bi('The request path spans services with separate logs, metrics, versions and owners.', 'Request path aisi services mein failta hai jinke logs, metrics, versions aur maalik alag hain.'),
        bi('Partial failures and timeouts: the caller cannot tell whether the remote operation happened.', 'Partial failures aur timeouts: caller nahi jaanta ki remote operation hua ya nahi.'),
        bi('Unreliable network: latency, retries, duplicates and reordering.', 'Unreliable network: latency, retries, duplicates aur reordering.'),
        bi('Non-determinism and race conditions that appear only under production load.', 'Non-determinism aur race conditions jo sirf production load mein dikhti hain.'),
        bi('Clock skew makes cross-service timestamps unreliable for ordering.', 'Clock skew ki wajah se alag services ke timestamps order ke liye bharosemand nahi.'),
        bi('Asynchronous messaging and cascading failures move the symptom away from the root cause.', 'Asynchronous messaging aur cascading failures lakshan ko root cause se door le jaate hain.'),
        bi('Mitigation: correlation/trace IDs, distributed tracing with OpenTelemetry, centralized structured logging, per-service metrics, chaos and contract testing.', 'Upaay: correlation/trace IDs, OpenTelemetry se distributed tracing, centralized structured logging, har service ke metrics, chaos aur contract testing.'),
      ],
      keywords: [
        'Partial failure',
        'Network partition',
        'Non-determinism',
        'Clock skew',
        'Correlation ID',
        'Distributed tracing',
        'OpenTelemetry',
        'Context propagation',
        'Centralized logging',
        'Cascading failure',
        'Fallacies of distributed computing',
        'Observability',
      ],
    },
    listenFor: [
      bi('Specific reasons, not just “there are more services”.', 'Khaas kaaran, sirf “zyaada services hain” nahi.'),
      bi('Knowledge of tracing and correlation IDs.', 'Tracing aur correlation IDs ki jaankari.'),
      bi('Awareness of partial failures and timeouts, and practical tools.', 'Partial failures aur timeouts ki samajh, aur practical tools.'),
    ],
    mistakes: [
      bi('Only saying “there are more logs to read”.', 'Sirf yeh kehna ki “padhne ko zyaada logs hain”.'),
      bi('Never mentioning tracing.', 'Tracing ka zikr hi na karna.'),
      bi('Assuming timestamps from different machines are perfectly comparable.', 'Yeh maanna ki alag machines ke timestamps bilkul compare ho sakte hain.'),
    ],
    followUps: [
      {
        q: bi('What is a correlation ID?', 'Correlation ID kya hai?'),
        a: bi(
          'A unique ID created at the edge for each request, passed in headers to every service and written into every log line, so all the logs for one request can be found together.',
          'Har request ke liye edge pe bana ek unique ID, jo headers mein har service tak jaata hai aur har log line mein likha jaata hai, taaki ek request ke saare logs ek saath mil sakein.',
        ),
      },
      {
        q: bi('What are the fallacies of distributed computing?', 'Fallacies of distributed computing kya hain?'),
        a: bi(
          'Assumptions that fail in real life: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology does not change, there is one administrator, transport cost is zero, the network is homogeneous.',
          'Woh maanyataayein jo asli duniya mein galat nikalti hain: network reliable hai, latency zero hai, bandwidth anant hai, network secure hai, topology nahi badalti, ek hi administrator hai, transport ka kharcha zero hai, network ek jaisa hai.',
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
    simple: bi(
      'A cache keeps a copy of data that is expensive to fetch or compute in fast memory, so the next request gets it instantly. Use one when the same data is read far more often than it changes and a slightly old copy is acceptable. The price: the copy can be out of date, it is one more system to run, and if it fails or empties, all the load suddenly lands on the database.',
      'Cache woh data jo laana ya compute karna mehnga hai, uski copy fast memory mein rakhta hai, taaki agli request ko turant mil jaaye. Tab use karo jab same data badalne se kahin zyaada baar padha jaata ho aur thodi purani copy chal jaaye. Keemat: copy purani ho sakti hai, chalane ko ek aur system, aur agar yeh fail ya khaali ho jaaye to saara load achanak database pe aa girta hai.',
    ),
    example: bi(
      'You keep a water bottle on your desk instead of walking to the kitchen every time you are thirsty (a cache hit). When it is empty you refill it from the kitchen (a cache miss). The problems: the water might be from yesterday (stale data), and if everyone in the office empties their bottle at the same time and runs to the kitchen together, there is a queue at the tap (a cache stampede).',
      'Har baar pyaas lagne pe kitchen jaane ki jagah aap desk pe paani ki bottle rakhte ho (cache hit). Khaali ho jaaye to kitchen se bhar lete ho (cache miss). Problems: paani kal ka ho sakta hai (stale data), aur agar office mein sabki bottle ek saath khaali ho aur sab ek saath kitchen bhaagein, to nal pe line lag jaati hai (cache stampede).',
    ),
    why: bi(
      'Lower latency (memory answers in well under a millisecond, a database in several milliseconds), less database load and cost, protection from read spikes, and a place to keep results of expensive computations such as feeds or recommendations.',
      'Kam latency (memory ek millisecond se bhi kam mein jawab deti hai, database kai milliseconds mein), database pe kam load aur kharcha, read spikes se bachaav, aur mehenge computations jaise feeds ya recommendations ke results rakhne ki jagah.',
    ),
    without: bi(
      'The database serves every read; a hot key such as a celebrity’s profile overwhelms it; latency stays high; and you scale the database at great expense.',
      'Database har read serve karta hai; celebrity ki profile jaisi hot key use dabaa deti hai; latency zyaada rehti hai; aur database ko bahut mehenge mein scale karna padta hai.',
    ),
    scene: scene(
      [
        [a('users', 'Users', 'Users')],
        [c('app-server')],
        [c('distributed-cache', { state: 'focus', note: '< 1 ms' }), c('sql-db', { note: '5–20 ms' })],
      ],
      ['users>app-server', ['app-server>distributed-cache', bi('check first', 'pehle yahan dekho')], ['app-server.>sql-db', bi('only on a miss', 'sirf miss hone pe')]],
      bi(
        'Cache-aside: the app checks the cache first, reads the database only on a miss, and then stores the result in the cache for next time.',
        'Cache-aside: app pehle cache dekhta hai, miss hone pe hi database padhta hai, aur phir agli baar ke liye result cache mein rakh deta hai.',
      ),
    ),
    partsTitle: bi('When to use it, and the problems to plan for', 'Kab use karein, aur kin problems ki tayyari rakhein'),
    parts: [
      {
        title: bi('Good fits', 'Sahi jagahen'),
        text: bi(
          'Read-heavy data (say 100 reads per write), hot items, expensive queries or computations, data that can be a little stale (product details, profiles, feeds), sessions, rate-limit counters — and static files at a CDN.',
          'Read-heavy data (jaise har write pe 100 reads), hot items, mehengi queries ya computations, thoda purana chal jaane wala data (product details, profiles, feeds), sessions, rate-limit counters — aur CDN pe static files.',
        ),
      },
      {
        title: bi('Poor fits', 'Galat jagahen'),
        text: bi(
          'Data that must always be exact at the moment of use (a balance during a payment), write-heavy data, highly personal data that is rarely reused, and data read only once.',
          'Woh data jo use ke pal pe bilkul sahi hona chahiye (payment ke waqt balance), write-heavy data, bahut personal data jo kam hi dobara use hota hai, aur ek hi baar padha jaane wala data.',
        ),
      },
      {
        title: bi('Where caches live, and the patterns', 'Cache kahan hote hain, aur patterns'),
        text: bi(
          'Browser, CDN, in-process memory (per instance), a distributed cache (Redis, Memcached), and the database’s own buffer cache. Patterns: cache-aside (lazy loading, the default), read-through, write-through (always fresh, slower writes), write-behind (fast writes, risk of loss).',
          'Browser, CDN, in-process memory (har instance ki), distributed cache (Redis, Memcached), aur database ka apna buffer cache. Patterns: cache-aside (lazy loading, default), read-through, write-through (hamesha fresh, slow writes), write-behind (fast writes, nuksaan ka risk).',
        ),
      },
      {
        title: bi('Problem 1 — stale data and invalidation', 'Problem 1 — purana data aur invalidation'),
        text: bi(
          '“There are only two hard things in computer science: cache invalidation and naming things.” Use TTLs, delete the key when the data changes, version your keys, or invalidate from change events (CDC). Watch out for races where an old value is written into the cache after an update.',
          '“Computer science mein sirf do mushkil kaam hain: cache invalidation aur cheezon ke naam rakhna.” TTLs use karo, data badalne pe key delete karo, keys ko version do, ya change events (CDC) se invalidate karo. Aise races se savdhaan jahan update ke baad purani value cache mein likh di jaaye.',
        ),
      },
      {
        title: 'Problem 2 — cache stampede (thundering herd)',
        text: bi(
          'A popular key expires and thousands of requests miss at once and hammer the database. Fixes: request coalescing (only one request rebuilds the value while others wait), stale-while-revalidate, random jitter on TTLs, refreshing hot keys before they expire.',
          'Ek popular key expire hoti hai aur hazaaron requests ek saath miss karke database pe toot padti hain. Fix: request coalescing (sirf ek request value banati hai, baaki wait karti hain), stale-while-revalidate, TTLs pe random jitter, hot keys ko expire hone se pehle refresh karna.',
        ),
      },
      {
        title: bi('Problem 3 — penetration and avalanche', 'Problem 3 — penetration aur avalanche'),
        text: bi(
          'Requests for keys that do not exist always miss and go to the database (cache “not found” results briefly, or use a Bloom filter). If many keys expire together or the cache cluster dies, the database is flooded (spread expiries, replicate the cache, protect the database with a circuit breaker, warm the cache after deploys).',
          'Jo keys exist nahi karti unki requests hamesha miss hoke database jaati hain (“not found” ko thodi der cache karo, ya Bloom filter use karo). Bahut keys ek saath expire hon ya cache cluster mar jaaye to database mein baadh aa jaati hai (expiry failao, cache replicate karo, circuit breaker se database bachao, deploy ke baad cache garam karo).',
        ),
      },
      {
        title: bi('Problem 4 — hot keys, memory and complexity', 'Problem 4 — hot keys, memory aur complexity'),
        text: bi(
          'One key can receive most of the traffic (replicate it or add a small local cache). Memory is limited, so choose an eviction policy (LRU/LFU) and size the cache. Per-instance caches disagree with each other. And it is one more system to secure, monitor (hit ratio) and operate.',
          'Ek key ko zyaadatar traffic mil sakta hai (use replicate karo ya chhota local cache lagao). Memory limited hai, to eviction policy (LRU/LFU) chuno aur cache ka size tay karo. Har instance ke cache ek doosre se alag ho sakte hain. Aur yeh ek aur system hai jise secure, monitor (hit ratio) aur chalana padta hai.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I add a cache when data is read much more often than it changes and slightly stale reads are acceptable, to cut latency and database load; the trade-offs are stale data and invalidation, stampedes, cold starts, hot keys and extra operational complexity.',
        'Main cache tab lagata hoon jab data badalne se kahin zyaada padha jaata ho aur thoda purana read chal jaaye, taaki latency aur database load kam ho; trade-offs hain purana data aur invalidation, stampedes, cold starts, hot keys aur extra operational complexity.',
      ),
      points: [
        bi('Use it for read-heavy, hot, expensive data that tolerates staleness; avoid it for strongly consistent or write-heavy data.', 'Read-heavy, hot, mehenge data ke liye jo purana chal jaaye; strongly consistent ya write-heavy data ke liye nahi.'),
        bi('Layers: browser, CDN, in-process, distributed (Redis/Memcached).', 'Layers: browser, CDN, in-process aur distributed (Redis/Memcached) — har level pe cache ho sakta hai.'),
        bi('Cache-aside by default; write-through when freshness matters; write-behind only if a small loss is acceptable.', 'Default cache-aside; freshness zaroori ho to write-through; write-behind sirf jab thoda nuksaan chal jaaye.'),
        bi('Staleness: TTLs plus invalidation on write, versioned keys or change events.', 'Purana data: TTLs plus write pe invalidation, versioned keys ya change events.'),
        bi('Stampede: request coalescing, stale-while-revalidate, jittered TTLs.', 'Stampede: request coalescing, stale-while-revalidate, jitter wale TTLs.'),
        bi('Penetration and avalanche: cache negative results, spread expiries, replicate the cache, protect the database.', 'Penetration aur avalanche: negative results cache karo, expiry failao, cache replicate karo, database bachao.'),
        bi('Measure hit ratio, latency, evictions and memory; plan warm-up after deploys.', 'Hit ratio, latency, evictions aur memory naapo; deploy ke baad warm-up ka plan rakho.'),
      ],
      keywords: [
        'Cache hit ratio',
        'Cache-aside',
        'Write-through',
        'Write-behind',
        'TTL',
        'Cache invalidation',
        'Eviction (LRU / LFU)',
        'Cache stampede / thundering herd',
        'Request coalescing',
        'Stale-while-revalidate',
        'Hot key',
        'Cache penetration',
        'Cache avalanche',
      ],
    },
    listenFor: [
      bi('Clear criteria for when to cache: read/write ratio and tolerance for staleness.', 'Cache kab karna hai iske saaf criteria: read/write ratio aur purane data ki gunjaish.'),
      bi('Knowing invalidation and stampede problems.', 'Invalidation aur stampede problems ki jaankari.'),
      bi('Choosing a pattern and measuring hit ratio.', 'Pattern chunna aur hit ratio naapna.'),
    ],
    mistakes: [
      bi('Caching everything, with no TTL.', 'Sab kuch cache karna, bina TTL ke.'),
      bi('Caching data that must be strongly consistent.', 'Strongly consistent hona chahiye aise data ko cache karna.'),
      bi('Forgetting what happens when the cache fails or treating it as durable storage.', 'Cache fail hone pe kya hoga yeh bhoolna, ya use durable storage samajhna.'),
    ],
    followUps: [
      {
        q: bi('On a write, do you update the cache or delete the key?', 'Write pe cache update karte ho ya key delete?'),
        a: bi(
          'Usually delete (invalidate). Updating can race with a concurrent read and store an older value; after a delete, the next read repopulates the cache with fresh data.',
          'Aam taur pe delete (invalidate). Update karne se concurrent read ke saath race hoke purani value store ho sakti hai; delete ke baad agla read cache ko fresh data se bhar deta hai.',
        ),
      },
      {
        q: bi('Local in-memory cache or Redis?', 'Local in-memory cache ya Redis?'),
        a: bi(
          'Local memory is the fastest, but each instance has its own copy, so they can disagree and memory is duplicated. Redis is shared and consistent across instances but adds a network hop. Many systems use both: a tiny local cache in front of Redis for the hottest keys.',
          'Local memory sabse fast hai, par har instance ki apni copy hoti hai, to woh alag ho sakti hain aur memory duplicate hoti hai. Redis shared hai aur saare instances mein consistent, par ek network hop jodta hai. Kai systems dono use karte hain: sabse hot keys ke liye Redis ke aage chhota local cache.',
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
    tags: ['message queue', 'async', 'kafka', 'rabbitmq', 'sqs', 'decoupling', 'backpressure'],
    simple: bi(
      'Use a synchronous call when the caller needs the answer right now to continue (show the user their balance). Use a queue when the work can happen a little later, takes a long time, comes in bursts, or must survive the other service being down: the caller drops a message in the queue and moves on, and a worker processes it at its own pace.',
      'Synchronous call tab use karo jab caller ko aage badhne ke liye jawab abhi chahiye (user ko uska balance dikhana). Queue tab use karo jab kaam thodi der baad ho sakta ho, lamba chalta ho, jhatkon mein aata ho, ya doosri service down hone pe bhi bachna chahiye: caller queue mein message daal ke aage badh jaata hai, aur worker use apni speed se process karta hai.',
    ),
    example: bi(
      'At a café you order a coffee at the counter and wait for it (synchronous — you need it now). For a birthday cake for tomorrow, they write a ticket and pin it on the kitchen rail (a queue); you leave; bakers pick up tickets in order even if 50 orders arrive at once — and if a baker is off sick, the tickets wait instead of getting lost.',
      'Café mein aap counter pe coffee order karte ho aur wait karte ho (synchronous — abhi chahiye). Kal ke birthday cake ke liye woh ek ticket likh ke kitchen ki rail pe laga dete hain (queue); aap chale jaate ho; 50 orders ek saath aayein tab bhi bakers tickets order se uthaate hain — aur koi baker chhutti pe ho to tickets wait karte hain, khote nahi.',
    ),
    why: bi(
      'A queue decouples the producer from the consumer (neither needs the other to be up right now), absorbs spikes, gives users a fast response, allows retries without blocking anyone, fans work out to many consumers, and lets each side scale on its own.',
      'Queue producer aur consumer ko alag karti hai (dono ko ek doosre ka abhi up hona zaroori nahi), spikes ko sokh leti hai, users ko fast jawab deti hai, kisi ko roke bina retry karne deti hai, kaam ko kai consumers tak failati hai, aur har taraf ko apne aap scale hone deti hai.',
    ),
    without: bi(
      'With only synchronous calls, long user-facing requests (sending emails, generating PDFs, video processing) time out; one slow service slows the whole chain; if the email service is down, placing an order fails; and traffic spikes overload everything downstream.',
      'Sirf synchronous calls hon to lambi user-facing requests (emails bhejna, PDFs banana, video processing) time out hoti hain; ek slow service poori chain ko slow karti hai; email service down ho to order hi fail; aur traffic spikes neeche ki har cheez ko overload karte hain.',
    ),
    scene: scene(
      [
        [a('user', 'User', 'User')],
        [c('app-server', { note: bi('saves the order', 'order save karta hai') })],
        [c('message-queue', { state: 'focus' })],
        [c('background-worker', { note: bi('sends email, invoice', 'email, invoice bhejta hai') })],
      ],
      ['user>app-server', 'app-server~>message-queue', 'message-queue~>background-worker'],
      bi(
        'The API saves the order and replies straight away (202 Accepted); the slow follow-up work waits in the queue and a worker does it in the background.',
        'API order save karke turant jawab deta hai (202 Accepted); slow baad ka kaam queue mein wait karta hai aur worker use background mein karta hai.',
      ),
    ),
    table: {
      columns: ['Question to ask', 'Synchronous call', 'Queue (asynchronous)'],
      rows: [
        [bi('Does the caller need the result now?', 'Caller ko result abhi chahiye?'), bi('Yes', 'Haan'), bi('No — “accepted, will be done”', 'Nahi — “le liya, ho jaayega”')],
        [bi('How long does the work take?', 'Kaam kitna time leta hai?'), 'Milliseconds', bi('Seconds to minutes', 'Seconds se minutes')],
        ['Traffic pattern', 'Steady', bi('Spiky, bursty', 'Spiky, jhatkon mein')],
        [bi('If the receiver is down', 'Agar receiver down ho'), bi('The caller fails too', 'Caller bhi fail'), bi('Messages wait and are processed later', 'Messages wait karte hain, baad mein process')],
        [bi('Number of receivers', 'Receivers kitne'), bi('One', 'Ek'), bi('One or many (pub/sub fan-out)', 'Ek ya kai (pub/sub fan-out)')],
        ['Complexity', bi('Simple, easy to debug', 'Simple, debug aasaan'), 'Broker, idempotent consumers, DLQ, lag monitoring'],
        ['Consistency', bi('Immediate', 'Turant'), 'Eventual'],
      ],
    },
    partsTitle: bi('Choosing, and doing async right', 'Chunna, aur async ko sahi karna'),
    parts: [
      {
        title: bi('Typical queue work', 'Queue ka typical kaam'),
        text: bi(
          'Emails, SMS and push notifications; image and video processing; report generation; processing payment webhooks; order fulfilment steps; analytics events; syncing data to a search index; levelling out spiky load; and events between microservices that should not depend on each other being up.',
          'Emails, SMS aur push notifications; image aur video processing; reports banana; payment webhooks process karna; order fulfilment ke steps; analytics events; search index tak data sync; spiky load ko barabar karna; aur microservices ke beech events jo ek doosre ke up hone pe depend nahi hone chahiye.',
        ),
      },
      {
        title: bi('Keep it synchronous for…', 'Synchronous rakho jab…'),
        text: bi(
          'Reads the user is waiting for, validation that must pass before replying (is this card valid?), and anything that needs strong consistency immediately.',
          'User jin reads ka wait kar raha ho, woh validation jo jawab dene se pehle pass honi chahiye (kya card valid hai?), aur jis cheez ko turant strong consistency chahiye.',
        ),
      },
      {
        title: bi('The common hybrid', 'Common hybrid'),
        text: bi(
          'Accept synchronously — validate, save the order, return 202 Accepted with an ID — then do the rest asynchronously. The client polls a status endpoint or receives a push or webhook when it is done.',
          'Synchronously accept karo — validate karo, order save karo, ID ke saath 202 Accepted lautao — phir baaki kaam asynchronously. Client status endpoint poll karta hai ya kaam hone pe push ya webhook milta hai.',
        ),
      },
      {
        title: bi('Doing async right', 'Async ko sahi karna'),
        text: bi(
          'Most queues deliver at least once, so consumers must be idempotent. Retry with backoff and move failing messages to a dead-letter queue. Keep per-key ordering where it matters. Monitor queue depth and consumer lag. Use the transactional outbox pattern so saving data and publishing the event cannot get out of sync. Version message schemas.',
          'Zyaadatar queues at-least-once deliver karti hain, isliye consumers idempotent hone chahiye. Backoff ke saath retry karo aur fail hote messages ko dead-letter queue mein bhejo. Jahan zaroori ho per-key ordering rakho. Queue depth aur consumer lag monitor karo. Transactional outbox pattern use karo taaki data save karna aur event publish karna kabhi alag na ho. Message schemas ko version do.',
        ),
      },
      {
        title: 'Queue vs stream',
        text: bi(
          'A work queue (SQS, RabbitMQ) hands each message to one worker and deletes it once done. A log or stream (Kafka) keeps events for a while so many consumer groups can each read — and replay — all of them.',
          'Work queue (SQS, RabbitMQ) har message ek worker ko deti hai aur kaam hone pe delete. Log ya stream (Kafka) events kuch samay rakhti hai taaki kai consumer groups sab padh — aur replay — sakein.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I use a synchronous call when the caller needs the result immediately to continue, and a queue when the work is slow, spiky, can be done later, must survive the consumer being down, or needs to fan out — accepting eventual consistency and extra operational complexity.',
        'Main synchronous call tab use karta hoon jab caller ko aage badhne ke liye result turant chahiye, aur queue tab jab kaam slow ho, spiky ho, baad mein ho sake, consumer down hone pe bhi bachna ho, ya fan-out chahiye — eventual consistency aur extra operational complexity maan ke.',
      ),
      points: [
        bi('Synchronous: simple and immediately consistent, but temporally coupled — both sides must be up and fast.', 'Synchronous: simple aur turant consistent, par temporally coupled — dono taraf up aur fast honi chahiye.'),
        bi('Queue: decouples producer and consumer in time, buffers spikes (load levelling), enables retries and independent scaling.', 'Queue: producer aur consumer ko time mein alag karti hai, spikes ko buffer karti hai (load levelling), retries aur alag scaling deti hai.'),
        bi('Typical async work: notifications, media processing, reports, search indexing, inter-service events.', 'Typical async kaam: notifications, media processing, reports, search indexing, services ke beech events.'),
        bi('Pattern: validate and persist synchronously, return 202 Accepted, process asynchronously, notify via polling, push or webhook.', 'Pattern: synchronously validate aur save karo, 202 Accepted lautao, asynchronously process karo, polling, push ya webhook se batao.'),
        bi('Requirements: idempotent consumers, retries with backoff, a DLQ, per-key ordering where needed, a transactional outbox.', 'Zarooratein: idempotent consumers, backoff ke saath retries, DLQ, zaroorat ho to per-key ordering, transactional outbox.'),
        bi('Monitor queue depth and consumer lag and alert on a growing backlog.', 'Queue depth aur consumer lag monitor karo aur badhte backlog pe alert karo.'),
      ],
      keywords: [
        'Temporal coupling',
        'Decoupling',
        'Load levelling',
        'Backpressure',
        'At-least-once delivery',
        'Idempotent consumer',
        'Dead-letter queue',
        '202 Accepted',
        'Eventual consistency',
        'Pub/sub fan-out',
        'Transactional outbox',
        'Consumer lag',
      ],
    },
    listenFor: [
      bi('Decision criteria: does the caller need the answer now, coupling, spikes.', 'Decision ke criteria: kya caller ko jawab abhi chahiye, coupling, spikes.'),
      bi('Knowing the costs: eventual consistency, idempotency, monitoring.', 'Kharchon ki samajh: eventual consistency, idempotency, monitoring.'),
      bi('Concrete examples from real systems.', 'Asli systems ke thos examples.'),
    ],
    mistakes: [
      bi('Making everything asynchronous — harder debugging and no immediate feedback for users.', 'Sab kuch asynchronous banana — debugging mushkil aur users ko turant feedback nahi.'),
      bi('Ignoring duplicate messages.', 'Duplicate messages ko ignore karna.'),
      bi('No dead-letter queue, so one bad message blocks or is lost silently.', 'Dead-letter queue nahi, to ek kharab message rok deta hai ya chupchaap kho jaata hai.'),
    ],
    followUps: [
      {
        q: bi('How does the user find out the background job finished?', 'User ko kaise pata chalega ki background job ho gaya?'),
        a: bi(
          'By polling a status endpoint, via a server push (WebSocket or Server-Sent Events), a mobile push notification, or a webhook for server-to-server integrations.',
          'Status endpoint poll karke, server push se (WebSocket ya Server-Sent Events), mobile push notification se, ya server-to-server integrations ke liye webhook se.',
        ),
      },
      {
        q: bi('What is the transactional outbox pattern?', 'Transactional outbox pattern kya hai?'),
        a: bi(
          'Write the business change and an “event to publish” row in the same database transaction; a separate relay publishes outbox rows to the broker. You never save without publishing, or publish without saving.',
          'Business change aur ek “publish karne wala event” row same database transaction mein likho; ek alag relay outbox rows ko broker pe publish karta hai. Na bina publish kiye save hota hai, na bina save kiye publish.',
        ),
      },
    ],
    related: {
      components: ['message-queue', 'event-stream', 'background-worker', 'dead-letter-queue'],
      challenges: ['basic-notification-service', 'video-upload-and-transcoding', 'distributed-message-queue'],
    },
  },
];
