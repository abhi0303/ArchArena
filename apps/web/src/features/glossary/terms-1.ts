import { bi } from '@/features/learn/dsl';
import type { GlossaryTerm } from './types';

type Pair = [en: string, hi: string];

/** Compact helper: g(id, title, aliases, [meaning EN, HI], [example EN, HI]?, extras?) */
export function g(id: string, title: string, aliases: string[], simple: Pair, example?: Pair, extra: Pick<GlossaryTerm, 'related' | 'more' | 'component'> = {}): GlossaryTerm {
  return { id, title, aliases, simple: bi(...simple), example: example ? bi(...example) : undefined, ...extra };
}

const PREP = {
  rest: '/prep/backend/rest-api-design-and-versioning',
  race: '/prep/backend/what-is-a-race-condition',
  retry: '/prep/backend/should-every-failed-request-be-retried',
  index: '/prep/database/database-index-and-when-it-hurts',
  slow: '/prep/database/query-fast-last-month-slow-now',
  pool: '/prep/database/database-connection-pool-exhausted',
  monolith: '/prep/system-design/monolith-vs-microservices',
  distributed: '/prep/system-design/why-distributed-systems-are-hard-to-debug',
  cache: '/prep/system-design/when-to-use-a-cache',
  queue: '/prep/system-design/queue-vs-synchronous-api-call',
};

/** APIs, reliability, databases and architecture. */
export const TERMS_1: GlossaryTerm[] = [
  // ───────── APIs & HTTP ─────────
  g(
    'rest',
    'REST API',
    ['REST API', 'REST APIs', 'RESTful', 'REST'],
    [
      'A common style for web APIs: every “thing” (a user, an order) has its own URL, and standard HTTP methods say what to do with it — GET to read, POST to create, PUT/PATCH to update, DELETE to remove.',
      'Web APIs ka ek common style: har “cheez” (user, order) ka apna URL hota hai, aur standard HTTP methods batate hain uske saath kya karna hai — GET padhne, POST banane, PUT/PATCH update aur DELETE hatane ke liye.',
    ],
    [
      'A library with fixed windows: one window to borrow books, one to return them. Everyone knows which window does what without asking.',
      'Library jisme fixed windows hain: ek kitaab lene ki, ek wapas karne ki. Bina pooche sab jaante hain kaunsi window kya karti hai.',
    ],
    { related: ['status-code', 'idempotency', 'versioning'], more: PREP.rest },
  ),
  g(
    'status-code',
    'HTTP status code',
    ['status code', 'status codes', 'HTTP status code', 'HTTP status codes'],
    [
      'A three-digit number in every HTTP response that says how it went: 2xx = success, 4xx = the client sent something wrong, 5xx = the server failed.',
      'Har HTTP response mein ek teen-digit number jo batata hai kya hua: 2xx = success, 4xx = client ne kuch galat bheja, 5xx = server fail hua.',
    ],
    ['A courier’s status: “delivered” (200), “address not found” (404), “our van broke down” (500).', 'Courier ka status: “deliver ho gaya” (200), “address nahi mila” (404), “hamari van kharab ho gayi” (500).'],
    { related: ['rest'] },
  ),
  g(
    'idempotency',
    'Idempotency',
    ['idempotent', 'idempotency', 'non-idempotent', 'non-idempotent request', 'non-idempotent requests', 'non-idempotent operation', 'idempotency key', 'Idempotency-Key', 'idempotent consumer'],
    [
      'An operation is **idempotent** if doing it twice has the same effect as doing it once. A **non-idempotent** request (like “pay ₹500”) does the work again every time it is repeated, so retrying it blindly can charge twice. An idempotency key lets the server spot a repeat and return the first result instead.',
      'Koi operation **idempotent** hai agar use do baar karne ka asar ek baar karne jitna hi ho. **Non-idempotent** request (jaise “₹500 pay karo”) har repeat pe kaam dobara karti hai, isliye use aankh band karke retry karne se do baar paise kat sakte hain. Idempotency key se server repeat pehchaan ke pehla result lauta deta hai.',
    ],
    [
      'A lift button is idempotent — press it five times, one lift comes. A vending machine is not — press “buy” twice and you pay twice.',
      'Lift ka button idempotent hai — paanch baar dabao, ek hi lift aati hai. Vending machine nahi — “buy” do baar dabao to do baar paise katenge.',
    ],
    { related: ['transient', 'exponential-backoff', 'at-least-once'], more: PREP.retry },
  ),
  g(
    'pagination',
    'Pagination',
    ['pagination', 'paginate', 'paginated', 'cursor-based pagination', 'cursor pagination', 'offset pagination'],
    [
      'Returning a long list in small pages (say 20 items) instead of everything at once. **Offset** pagination asks for “page 5”; **cursor** pagination asks for “20 items after this one”, which stays fast and does not skip or repeat items when new data arrives.',
      'Lambi list ko ek saath dene ki jagah chhote pages mein dena (jaise 20 items). **Offset** pagination “page 5” maangta hai; **cursor** pagination “is item ke baad ke 20” maangta hai, jo fast rehta hai aur naya data aane pe items skip ya repeat nahi karta.',
    ],
    ['Search results come ten per page, not all million at once.', 'Search results dus-dus karke aate hain, saare das lakh ek saath nahi.'],
    { more: PREP.rest },
  ),
  g(
    'versioning',
    'API versioning',
    ['API versioning', 'URI versioning', 'header versioning', 'versioning'],
    [
      'Keeping old and new versions of an API side by side (for example `/api/v1` and `/api/v2`) so you can change the API without breaking apps that still use the old one.',
      'API ke purane aur naye versions ko saath chalana (jaise `/api/v1` aur `/api/v2`) taaki API badal sako bina un apps ko tode jo abhi purana use kar rahi hain.',
    ],
    ['A school keeps the old syllabus for students already mid-course while new students start the new one.', 'School beech course wale students ke liye purana syllabus rakhta hai aur naye students naye se shuru karte hain.'],
    { related: ['breaking-change', 'deprecation'], more: PREP.rest },
  ),
  g(
    'breaking-change',
    'Breaking change / backward compatibility',
    ['breaking change', 'breaking changes', 'non-breaking', 'backward compatibility', 'backward-compatible', 'backward compatible'],
    [
      'A **breaking change** makes existing clients fail — renaming or removing a field, changing a type. **Backward compatible** means old clients keep working after the change, for example when you only add a new optional field.',
      '**Breaking change** existing clients ko fail kar deta hai — field ka naam badalna ya hatana, type badalna. **Backward compatible** ka matlab change ke baad bhi purane clients chalte rahein, jaise sirf naya optional field jodna.',
    ],
    [
      'Changing the shape of a plug socket is a breaking change — every old charger stops fitting. Adding an extra USB port next to it is backward compatible.',
      'Plug socket ka shape badalna breaking change hai — har purana charger fit hona band. Bagal mein extra USB port jodna backward compatible hai.',
    ],
    { related: ['versioning', 'deprecation', 'contract-test'] },
  ),
  g(
    'openapi',
    'OpenAPI / Swagger',
    ['OpenAPI', 'Swagger'],
    [
      'A standard file that describes an API — its endpoints, inputs, outputs and errors. Tools turn it into documentation pages, client code and tests.',
      'Ek standard file jo API ko describe karti hai — endpoints, inputs, outputs aur errors. Tools ise documentation pages, client code aur tests mein badal dete hain.',
    ],
    ['A restaurant menu that lists every dish with its ingredients and price, so nobody has to guess.', 'Restaurant ka menu jisme har dish ke ingredients aur price likhe hain, taaki kisi ko andaaza na lagana pade.'],
  ),
  g(
    'dto',
    'DTO',
    ['DTO', 'DTOs', 'data transfer object', 'data transfer objects'],
    [
      'Data Transfer Object: a simple object that defines exactly what data goes in or out of an API — just the shape of the data, no business logic.',
      'Data Transfer Object: ek simple object jo tay karta hai ki API mein kaunsa data aata-jaata hai — bas data ka shape, koi business logic nahi.',
    ],
    ['A printed form: it decides which boxes exist and in what format, not what happens to the form afterwards.', 'Chhapa hua form: yeh tay karta hai kaunse khaane hain aur kis format mein, form ke saath baad mein kya hoga yeh nahi.'],
  ),
  g(
    'rate-limiting',
    'Rate limiting',
    ['rate limiting', 'rate limit', 'rate limiter', 'rate-limited', 'rate-limit'],
    [
      'Capping how many requests a client may send in a time window, for example 100 per minute. Extra requests get `429 Too Many Requests`. It protects the system from abuse and overload.',
      'Ek client ek time window mein kitni requests bhej sakta hai uski limit, jaise 100 per minute. Zyaada requests ko `429 Too Many Requests` milta hai. Yeh system ko misuse aur overload se bachata hai.',
    ],
    ['An ATM card’s daily withdrawal limit.', 'ATM card ki daily withdrawal limit.'],
    { component: 'rate-limiter', more: '/learn/rate-limiter' },
  ),
  g(
    'cors',
    'CORS',
    ['CORS'],
    [
      'Cross-Origin Resource Sharing: a browser rule that blocks a web page from calling an API on a different domain unless the API explicitly allows that domain.',
      'Cross-Origin Resource Sharing: browser ka rule jo web page ko doosre domain ki API call karne se rokta hai, jab tak API khud us domain ko allow na kare.',
    ],
    ['A building that only lets in visitors whose names the host has put on the guest list.', 'Building jo sirf unhi visitors ko andar aane deti hai jinke naam host ne guest list mein daale hain.'],
  ),
  g(
    'sql-injection',
    'SQL injection',
    ['SQL injection', 'parameterized queries', 'parameterized query'],
    [
      'An attack where user input is pasted into a SQL query and changes what the query does. **Parameterized queries** send the input separately, so it is always treated as data, never as code.',
      'Ek attack jisme user ka input SQL query mein chipka diya jaata hai aur query ka kaam badal deta hai. **Parameterized queries** input ko alag bhejti hain, to woh hamesha data maana jaata hai, kabhi code nahi.',
    ],
    [
      'Writing your name on a form as “Rahul — and also show me everyone’s salary”. A careless clerk who reads the whole line aloud might actually do it.',
      'Form pe apna naam likhna “Rahul — aur sabki salary bhi dikha do”. Laparwah clerk jo poori line padh de, shayad sach mein dikha de.',
    ],
  ),
  g(
    'mass-assignment',
    'Mass assignment',
    ['mass assignment'],
    [
      'A bug where an API copies every field from the request into the database record, so a user can set fields they should never control, such as `role` or `isAdmin`.',
      'Ek bug jisme API request ke saare fields database record mein copy kar deti hai, to user woh fields bhi set kar sakta hai jo uske haath mein nahi hone chahiye, jaise `role` ya `isAdmin`.',
    ],
    ['A hotel check-in form where guests can also tick “upgrade me to the presidential suite for free” — and the system honours it.', 'Hotel check-in form jisme guest “mujhe free mein presidential suite do” bhi tick kar sake — aur system maan le.'],
  ),
  g(
    'authentication',
    'Authentication',
    ['authentication', 'authenticate', 'authenticated', 'authenticates'],
    ['Proving **who you are** — logging in with a password, an OTP or a token.', '**Aap kaun ho** yeh saabit karna — password, OTP ya token se login.'],
    ['Showing your ID card at the office gate.', 'Office gate pe ID card dikhana.'],
    { related: ['authorization', 'sso', 'jwt', 'mfa'] },
  ),
  g(
    'authorization',
    'Authorization',
    ['authorization', 'authorize', 'authorized', 'resource-level authorization'],
    [
      'Deciding **what you are allowed to do** once we know who you are — roles, permissions and ownership checks (can this user see order 42?).',
      'Hum jaan gaye aap kaun ho, ab yeh tay karna ki **aap kya kar sakte ho** — roles, permissions aur ownership checks (kya yeh user order 42 dekh sakta hai?).',
    ],
    ['Your ID card gets you into the building, but only the finance team’s card opens the finance room.', 'ID card se building mein aa jaate ho, par finance room sirf finance team ka card kholta hai.'],
    { related: ['authentication'] },
  ),
  g(
    'correlation-id',
    'Correlation ID / trace ID',
    ['correlation ID', 'correlation IDs', 'request ID', 'trace ID', 'trace IDs'],
    [
      'A unique ID given to a request when it enters the system and passed to every service and log line, so you can find everything that happened for that one request.',
      'Ek unique ID jo request ko system mein aate hi milti hai aur har service aur har log line tak jaati hai, taaki us ek request ke saath jo hua sab mil sake.',
    ],
    ['A courier tracking number that every hub writes down — type it in and you see the whole journey.', 'Courier ka tracking number jo har hub likhta hai — daalo aur poora safar dikh jaata hai.'],
    { related: ['distributed-tracing', 'structured-logging'] },
  ),
  g(
    'deprecation',
    'Deprecation',
    ['deprecate', 'deprecated', 'deprecation', 'Sunset header', 'sunset date'],
    [
      'Announcing that an old API or feature will be removed later, so users have time to move. A `Sunset` header tells clients the exact removal date.',
      'Announce karna ki koi purana API ya feature baad mein hataya jaayega, taaki users ko shift hone ka time mile. `Sunset` header clients ko hatane ki exact date batata hai.',
    ],
    ['A bank saying “old cheque books stop working on 1 March — please collect new ones”.', 'Bank ka kehna “purani cheque books 1 March se band — naye le lijiye”.'],
    { related: ['versioning'] },
  ),
  g(
    'contract-test',
    'Contract test',
    ['contract test', 'contract tests', 'contract testing'],
    [
      'A test that checks two services still agree on their API — the request and response shapes — without running the whole system.',
      'Ek test jo check karta hai ki do services abhi bhi apne API pe sehmat hain — request aur response ka shape — bina poora system chalaye.',
    ],
    ['Checking a new charger still fits the phone’s port before shipping it.', 'Ship karne se pehle check karna ki naya charger phone ke port mein fit hota hai.'],
    { related: ['test-pyramid'] },
  ),
  g(
    'stateless',
    'Stateless',
    ['stateless', 'statelessness', 'stateful'],
    [
      'A **stateless** server keeps nothing about a user in its own memory between requests — everything comes with the request or lives in a shared store. Then any server can handle any request, which makes scaling easy. A **stateful** one remembers things locally.',
      '**Stateless** server do requests ke beech user ke baare mein apni memory mein kuch nahi rakhta — sab request ke saath aata hai ya shared store mein rehta hai. Phir koi bhi server koi bhi request sambhaal sakta hai, aur scaling aasaan. **Stateful** cheezein local yaad rakhta hai.',
    ],
    ['A call centre where any agent can help you, because your history is in the shared system, not in one agent’s head.', 'Call centre jahan koi bhi agent madad kar sakta hai, kyunki aapki history shared system mein hai, kisi ek agent ke dimaag mein nahi.'],
    { related: ['horizontal-scaling', 'sticky-sessions'] },
  ),
  g(
    'latency',
    'Latency',
    ['latency', 'latencies'],
    ['How long one request takes from start to finish, usually in milliseconds.', 'Ek request ko shuru se khatam hone mein kitna time lagta hai, aam taur pe milliseconds mein.'],
    ['The time between ordering food and it arriving at your table.', 'Khaana order karne aur table pe aane ke beech ka time.'],
    { related: ['throughput', 'percentile'] },
  ),
  g(
    'throughput',
    'Throughput',
    ['throughput'],
    ['How much work a system completes per unit of time — for example requests per second.', 'System ek samay mein kitna kaam poora karta hai — jaise requests per second.'],
    ['How many customers a restaurant can serve per hour, regardless of how long each one waits.', 'Restaurant ek ghante mein kitne customers serve kar sakta hai, chahe har ek kitna bhi wait kare.'],
    { related: ['latency'] },
  ),
  g(
    'webhook',
    'Webhook',
    ['webhook', 'webhooks'],
    [
      'A URL on your server that another service calls when something happens (a payment succeeded), instead of you asking it again and again.',
      'Aapke server ka ek URL jise doosri service tab call karti hai jab kuch hota hai (payment ho gayi), aapke baar-baar poochne ki jagah.',
    ],
    ['A courier sending you an SMS “Delivered”, instead of you phoning them every hour.', 'Courier aapko “Delivered” ka SMS bhejta hai, aapko har ghante phone nahi karna padta.'],
  ),
  g(
    'grpc',
    'gRPC',
    ['gRPC'],
    [
      'A fast way for services to call each other using a compact binary format and a strict, typed contract. Popular for service-to-service communication.',
      'Services ke aapas mein call karne ka fast tareeka, compact binary format aur sakht, typed contract ke saath. Service-to-service baat-cheet mein popular.',
    ],
  ),
  g(
    'websocket',
    'WebSocket',
    ['WebSocket', 'WebSockets'],
    [
      'A connection that stays open so the server and the browser can both send messages at any time — used for chat, live scores and notifications.',
      'Ek connection jo khula rehta hai taaki server aur browser dono kabhi bhi message bhej sakein — chat, live score aur notifications ke liye.',
    ],
    ['A phone call that stays connected, versus sending a new letter for every sentence.', 'Juda hua phone call, har sentence ke liye nayi chitthi bhejne ke muqable.'],
    { component: 'websocket-server', more: '/learn/websocket-server' },
  ),

  // ───────── Reliability ─────────
  g(
    'transient',
    'Transient vs permanent failure',
    ['transient failure', 'transient failures', 'transient', 'permanent error', 'permanent errors', 'permanent failure'],
    [
      'A **transient** failure is temporary — a timeout, a busy or restarting server — and may succeed if tried again. A **permanent** error (invalid input, card declined) fails the same way every time, so retrying is pointless.',
      '**Transient** failure temporary hoti hai — timeout, busy ya restart hota server — aur dobara try karne pe chal sakti hai. **Permanent** error (galat input, card declined) har baar waise hi fail hota hai, retry bekaar.',
    ],
    ['A busy phone line is transient — call again later. A wrong number is permanent — calling again will not help.', 'Busy phone line transient hai — baad mein call karo. Galat number permanent hai — dobara call se kuch nahi hoga.'],
    { related: ['exponential-backoff', 'idempotency'], more: PREP.retry },
  ),
  g(
    'exponential-backoff',
    'Exponential backoff',
    ['exponential backoff', 'backoff'],
    [
      'Waiting longer after each failed retry — 100 ms, then 200 ms, then 400 ms — so a struggling service gets time to recover instead of being hammered.',
      'Har fail retry ke baad zyaada wait karna — 100 ms, phir 200 ms, phir 400 ms — taaki pareshaan service pe hathoda padne ki jagah use theek hone ka time mile.',
    ],
    ['If a shop is shut, you come back after 1 minute, then 2, then 4 — you do not bang on the door every second.', 'Dukaan band ho to 1 minute baad aate ho, phir 2, phir 4 — har second darwaza nahi peet-te.'],
    { related: ['jitter', 'retry-storm', 'circuit-breaker'], more: PREP.retry },
  ),
  g(
    'jitter',
    'Jitter',
    ['jitter'],
    [
      'A small random amount added to each retry wait, so thousands of clients do not all retry at exactly the same moment.',
      'Har retry wait mein thoda random time jodna, taaki hazaaron clients bilkul ek hi pal mein retry na karein.',
    ],
    ['If everyone leaves office at exactly 6:00, the lift jams; leaving anywhere between 6:00 and 6:10 spreads people out.', 'Sab bilkul 6:00 baje office chhodein to lift jam; 6:00 se 6:10 ke beech kabhi bhi nikalne se log bikhar jaate hain.'],
    { related: ['exponential-backoff', 'retry-storm'] },
  ),
  g(
    'circuit-breaker',
    'Circuit breaker',
    ['circuit breaker', 'circuit breakers', 'circuit-breaker'],
    [
      'A safety switch in front of calls to another service. After too many failures it “opens” and fails fast for a while instead of calling, then lets a few test calls through to see whether the service has recovered.',
      'Doosri service ki calls ke aage ek safety switch. Bahut failures ke baad yeh “open” hota hai aur kuch der call karne ki jagah turant fail karta hai, phir kuch test calls bhej ke dekhta hai ki service theek hui ya nahi.',
    ],
    ['The circuit breaker (MCB) at home cuts the power when there is a fault, instead of letting the wires burn.', 'Ghar ka circuit breaker (MCB) fault hone pe bijli kaat deta hai, wires jalne nahi deta.'],
    { related: ['fail-fast', 'fallback', 'cascading-failure'], more: PREP.retry },
  ),
  g(
    'retry-storm',
    'Retry storm',
    ['retry storm', 'retry storms', 'retry amplification', 'thundering herd'],
    [
      'When many clients — or many layers of the system — retry at once, multiplying the load on a service that is already struggling, so a small slowdown becomes an outage.',
      'Jab bahut saare clients — ya system ki kai layers — ek saath retry karein aur pehle se pareshaan service pe load kai guna kar dein, to chhoti slowness outage ban jaati hai.',
    ],
    ['A ticket website slows down at sale time and everyone keeps pressing refresh, making it even worse.', 'Sale ke time ticket website slow hoti hai aur sab refresh dabaate rehte hain, jisse haalat aur bigad jaati hai.'],
    { related: ['jitter', 'exponential-backoff', 'circuit-breaker'] },
  ),
  g(
    'dlq',
    'Dead-letter queue',
    ['dead-letter queue', 'dead-letter queues', 'DLQ', 'DLQs'],
    [
      'A side queue where messages go after failing several times, so they do not block the main queue and can be inspected and replayed later.',
      'Ek side queue jahan messages kai baar fail hone ke baad jaate hain, taaki main queue na ruke aur unhe baad mein dekha aur dobara chalaya ja sake.',
    ],
    ['The post office’s “undeliverable” shelf for letters with a wrong address.', 'Post office ki “undeliverable” shelf, galat address wali chitthiyon ke liye.'],
    { component: 'dead-letter-queue', more: '/learn/dead-letter-queue', related: ['message-queue'] },
  ),
  g(
    'fail-fast',
    'Fail fast',
    ['fail fast', 'fails fast', 'failing fast'],
    [
      'Giving up quickly with a clear error instead of waiting a long time — so threads, connections and users are not stuck.',
      'Lamba wait karne ki jagah saaf error ke saath jaldi haar maan lena — taaki threads, connections aur users atke na rahein.',
    ],
    ['A shop telling you at the door “sold out”, instead of letting you queue for an hour first.', 'Dukaan darwaze pe hi bata de “khatam ho gaya”, ghanta bhar line mein lagwane ke baad nahi.'],
  ),
  g(
    'timeout',
    'Timeout',
    ['timeout', 'timeouts', 'acquire timeout', 'statement timeout', 'statement timeouts'],
    [
      'The longest you wait for something before giving up. Without timeouts, one slow dependency can make everything wait forever.',
      'Kisi cheez ka zyaada se zyaada kitna wait karoge, phir chhod doge. Timeouts ke bina ek slow dependency sab kuch hamesha ke liye rok sakti hai.',
    ],
    ['Hanging up after 30 seconds of ringing instead of holding the phone all day.', '30 second ring hone ke baad phone rakh dena, din bhar pakad ke na baithna.'],
  ),
  g(
    'backpressure',
    'Backpressure',
    ['backpressure'],
    [
      'A way for a busy system to tell callers to slow down — by rejecting, queueing or delaying work — instead of accepting more than it can handle.',
      'Busy system ka callers ko dheere hone ka ishaara karna — kaam reject, queue ya der karke — apni capacity se zyaada lene ki jagah.',
    ],
    ['A restaurant host saying “30-minute wait”, instead of seating everyone into an overloaded kitchen.', 'Restaurant ka host kehta hai “30 minute wait”, sabko bitha ke kitchen overload karne ki jagah.'],
  ),
  g(
    'bulkhead',
    'Bulkhead',
    ['bulkhead', 'bulkheads'],
    [
      'Giving each part of a system its own separate resources (thread pool, connection pool), so one overloaded part cannot use up everything and drag the rest down.',
      'System ke har hisse ko apne alag resources dena (thread pool, connection pool), taaki ek overloaded hissa sab kuch kha ke baaki ko na gira de.',
    ],
    ['Ships have separate watertight compartments, so one leak does not sink the whole ship.', 'Jahaz mein alag-alag watertight compartments hote hain, taaki ek chhed poora jahaz na duboye.'],
  ),
  g(
    'fallback',
    'Fallback / graceful degradation',
    ['fallback', 'fallbacks', 'degrade gracefully', 'degraded gracefully', 'graceful degradation'],
    [
      'A simpler backup behaviour when a dependency fails — show cached data or skip a non-essential feature — instead of failing completely.',
      'Dependency fail hone pe ek simple backup behaviour — cached data dikhao ya gair-zaroori feature skip karo — poori tarah fail hone ki jagah.',
    ],
    ['If the lift breaks, you take the stairs — slower, but you still reach your floor.', 'Lift kharab ho to seedhiyan — slow, par floor tak pahunch jaate ho.'],
  ),
  g(
    'cascading-failure',
    'Cascading failure',
    ['cascading failure', 'cascading failures', 'cascade', 'cascades'],
    [
      'One failing part makes the parts that depend on it fail too, and the failure spreads across the system.',
      'Ek fail hota hissa us pe depend hisson ko bhi fail kar deta hai, aur failure poore system mein fail jaata hai.',
    ],
    ['One broken-down truck on a highway causes a traffic jam kilometres behind it.', 'Highway pe ek kharab truck kilometres peeche tak jam laga deta hai.'],
    { related: ['circuit-breaker', 'timeout', 'bulkhead'] },
  ),
  g(
    'spof',
    'Single point of failure',
    ['single point of failure', 'single points of failure', 'SPOF'],
    [
      'A part of the system that, if it fails, takes everything down with it — because there is no backup copy.',
      'System ka aisa hissa jo fail ho to sab kuch le doobe — kyunki uska koi backup nahi.',
    ],
    ['A house with one key: lose it and nobody gets in.', 'Ek hi chaabi wala ghar: kho gayi to koi andar nahi ja sakta.'],
    { related: ['high-availability', 'load-balancer'] },
  ),
  g(
    'high-availability',
    'High availability',
    ['high availability', 'highly available', 'availability'],
    [
      'Designing a system so it keeps working when parts of it fail — usually by running several copies and switching away from broken ones automatically.',
      'System ko aise design karna ki uske hisse fail hone pe bhi kaam chalta rahe — aam taur pe kai copies chala ke aur toote hisson se apne aap hat ke.',
    ],
    ['A hospital with backup generators keeps running during a power cut.', 'Backup generators wala hospital bijli jaane pe bhi chalta rehta hai.'],
    { related: ['spof', 'load-balancer', 'health-check'] },
  ),

  // ───────── Concurrency & databases ─────────
  g(
    'race-condition',
    'Race condition',
    ['race condition', 'race conditions'],
    [
      'A bug where two operations run at the same time on the same data and the result depends on which finishes first — usually both read the old value, and one update gets lost.',
      'Ek bug jisme do operations ek saath same data pe chalte hain aur result is pe depend karta hai ki kaun pehle khatam hua — aam taur pe dono purani value padhte hain aur ek update kho jaata hai.',
    ],
    ['Two people withdraw ₹800 from a ₹1,000 joint account at two ATMs at the same second — both are approved.', 'Do log ₹1,000 wale joint account se ek hi second mein do ATMs se ₹800 nikalte hain — dono approve ho jaate hain.'],
    { related: ['lost-update', 'atomic', 'optimistic-locking', 'pessimistic-locking'], more: PREP.race },
  ),
  g(
    'lost-update',
    'Lost update',
    ['lost update', 'lost updates'],
    [
      'When two writers read the same value, both change it and both save — the second save silently overwrites the first.',
      'Jab do writers same value padhte hain, dono badalte hain aur dono save karte hain — doosra save chupchaap pehle ko mita deta hai.',
    ],
    ['Two people edit the same paragraph of a shared notebook at once; whoever saves last wins, and the other’s edits vanish.', 'Do log ek saath shared notebook ka same paragraph edit karte hain; jo aakhir mein save kare wahi jeetta hai, doosre ke edits gayab.'],
    { related: ['race-condition', 'optimistic-locking'] },
  ),
  g(
    'toctou',
    'Check-then-act (TOCTOU)',
    ['TOCTOU', 'check-then-act', 'check then act'],
    [
      'Time-of-check to time-of-use: you check a condition (“the seat is free”), then act on it (“book it”), but something changes in between — so the action is based on stale information.',
      'Time-of-check to time-of-use: aap condition check karte ho (“seat free hai”), phir uspe action lete ho (“book karo”), par beech mein kuch badal jaata hai — action purani jaankari pe hota hai.',
    ],
    ['You see an empty parking spot, walk back to your car, and by the time you drive in someone else has taken it.', 'Aapko khaali parking dikhi, gaadi tak wapas gaye, aur aane tak koi aur le gaya.'],
    { related: ['race-condition', 'atomic'] },
  ),
  g(
    'atomic',
    'Atomic operation',
    ['atomic', 'atomicity', 'atomic operation', 'atomic operations', 'atomic update', 'atomic updates', 'atomic conditional update', 'atomic conditional updates'],
    [
      'An operation that happens completely or not at all, with nothing able to sneak in halfway — for example one `UPDATE … WHERE balance >= 800` that checks and changes in a single step.',
      'Aisa operation jo ya to poora hota hai ya bilkul nahi, beech mein koi ghus nahi sakta — jaise ek `UPDATE … WHERE balance >= 800` jo ek hi step mein check aur change karta hai.',
    ],
    ['A turnstile that checks your ticket and lets you through in one motion — nobody can slip in between the check and the push.', 'Turnstile jo ek hi jhatke mein ticket check karke andar jaane deta hai — check aur dhakke ke beech koi nahi ghus sakta.'],
    { related: ['race-condition', 'acid'] },
  ),
  g(
    'pessimistic-locking',
    'Pessimistic locking',
    ['pessimistic locking', 'pessimistic lock', 'pessimistic locks', 'row lock', 'row locks', 'SELECT … FOR UPDATE', 'FOR UPDATE'],
    [
      'Locking data before changing it, so nobody else can change it at the same time. Safe when conflicts are frequent, but others must wait.',
      'Data badalne se pehle use lock karna, taaki us waqt koi aur na badal sake. Conflicts zyaada hon to safe, par baakiyon ko wait karna padta hai.',
    ],
    ['Taking the only copy of a library book off the shelf: nobody else can use it until you return it.', 'Library ki ikloti kitaab shelf se utha lena: wapas karne tak koi aur use nahi kar sakta.'],
    { related: ['optimistic-locking', 'deadlock'], more: PREP.race },
  ),
  g(
    'optimistic-locking',
    'Optimistic locking',
    ['optimistic locking', 'optimistic lock', 'optimistic concurrency', 'optimistic concurrency control', 'version column'],
    [
      'No lock up front: each row has a version number, and an update succeeds only if the version has not changed since you read it. If it has, you re-read and retry. Great when conflicts are rare.',
      'Pehle se lock nahi: har row ka version number hota hai, aur update tabhi hota hai jab padhne ke baad version nahi badla. Badla ho to dobara padho aur retry karo. Jab conflicts kam hon tab badhiya.',
    ],
    ['Editing a shared document offline: when you upload, it is rejected if someone else saved a newer version in the meantime.', 'Shared document offline edit karna: upload karte waqt reject ho jaata hai agar beech mein kisi ne naya version save kar diya.'],
    { related: ['pessimistic-locking', 'lost-update'] },
  ),
  g(
    'deadlock',
    'Deadlock',
    ['deadlock', 'deadlocks', 'deadlocked'],
    [
      'Two operations each hold something the other one needs and wait for each other forever, so neither can continue.',
      'Do operations ek doosre ki zaroorat ki cheez pakde hue hain aur hamesha ek doosre ka wait karte rehte hain, to koi aage nahi badh paata.',
    ],
    ['Two cars meet on a one-lane bridge and both refuse to reverse.', 'Ek-lane pul pe do gaadiyan aamne-saamne aur dono peeche hatne ko tayyar nahi.'],
    { related: ['pessimistic-locking'] },
  ),
  g(
    'acid',
    'ACID transaction',
    ['ACID', 'ACID transaction', 'ACID transactions', 'database transaction', 'database transactions', 'long transaction', 'long transactions', 'long-running transaction', 'long-running transactions'],
    [
      'A group of database changes that succeed or fail together: **A**tomic (all or nothing), **C**onsistent (rules stay true), **I**solated (others do not see half-done work), **D**urable (saved even after a crash). Long transactions hold locks and connections, so keep them short.',
      'Database changes ka group jo ek saath succeed ya fail hota hai: **A**tomic (sab ya kuch nahi), **C**onsistent (rules sahi rahein), **I**solated (doosre adhoora kaam na dekhein), **D**urable (crash ke baad bhi saved). Lambe transactions locks aur connections pakde rehte hain, isliye chhote rakho.',
    ],
    ['A bank transfer: money leaves one account and arrives in the other — never just one of the two.', 'Bank transfer: paise ek account se nikal ke doosre mein aate hain — kabhi sirf ek kaam nahi hota.'],
    { related: ['atomic', 'isolation-level'] },
  ),
  g(
    'isolation-level',
    'Isolation level',
    ['isolation level', 'isolation levels', 'serializable'],
    [
      'How strictly the database keeps simultaneous transactions from seeing each other’s work. **Serializable** is the strictest — as if transactions ran one after another — but it is the slowest.',
      'Database ek saath chal rahe transactions ko ek doosre ka kaam dekhne se kitni sakhti se rokta hai. **Serializable** sabse sakht hai — jaise transactions ek ke baad ek chale — par sabse slow.',
    ],
  ),
  g(
    'unique-constraint',
    'Unique constraint',
    ['unique constraint', 'unique constraints'],
    [
      'A database rule that refuses duplicates, such as two bookings for the same seat. A safety net that turns a hidden bug into a visible error.',
      'Database ka rule jo duplicate mana karta hai, jaise ek seat ki do bookings. Safety net jo chhupe bug ko dikhne wali error bana deta hai.',
    ],
    ['A cinema hall where each seat has one number — the system refuses to print two tickets for seat F12.', 'Cinema hall jahan har seat ka ek number hai — system F12 ke do tickets chhaapne se mana karta hai.'],
  ),
  g(
    'distributed-lock',
    'Distributed lock',
    ['distributed lock', 'distributed locks'],
    [
      'A lock shared by many servers (kept in Redis or ZooKeeper, for example), so only one of them works on something at a time. It must expire automatically in case the holder crashes.',
      'Kai servers ke beech share hone wala lock (jaise Redis ya ZooKeeper mein), taaki ek waqt pe sirf ek server kisi cheez pe kaam kare. Holder crash ho jaaye to yeh apne aap expire hona chahiye.',
    ],
    ['A single meeting-room key at reception: whoever has it uses the room, and it must be returned by a set time.', 'Reception pe meeting room ki ek chaabi: jiske paas hai wahi room use kare, aur tay time tak lautani padti hai.'],
    { component: 'coordination-service' },
  ),
  g(
    'b-tree',
    'B-tree (index)',
    ['B-tree', 'B-trees', 'database index', 'database indexes'],
    [
      'The sorted tree structure most database indexes use. Finding a value walks a few levels of the tree — just a handful of reads even among millions of rows.',
      'Sorted tree structure jo zyaadatar database indexes use karte hain. Value dhoondhne mein tree ke kuch levels chalne padte hain — lakhon rows mein bhi bas kuch reads.',
    ],
    ['A dictionary: you open near the right letter, then the right page, then the right word — you never read every page.', 'Dictionary: sahi letter ke paas kholte ho, phir sahi page, phir sahi shabd — har page nahi padhte.'],
    { related: ['full-table-scan', 'composite-index', 'query-plan'], more: PREP.index },
  ),
  g(
    'full-table-scan',
    'Full table scan',
    ['full table scan', 'full table scans', 'sequential scan', 'Seq Scan'],
    [
      'Reading every row of a table to find the ones you want. Fine for small tables, very slow for big ones — usually a sign of a missing index.',
      'Chahiye wali rows dhoondhne ke liye table ki har row padhna. Chhoti tables pe theek, badi pe bahut slow — aksar missing index ka nishaan.',
    ],
    ['Finding a contact by scrolling through every name instead of jumping to the letter.', 'Letter pe seedha jaane ki jagah har naam scroll karke contact dhoondhna.'],
    { related: ['b-tree', 'query-plan'] },
  ),
  g(
    'composite-index',
    'Composite index',
    ['composite index', 'composite indexes', 'leftmost prefix', 'leftmost-prefix', 'leftmost-prefix rule'],
    [
      'An index on several columns, like `(user_id, status)`. It helps queries that filter by the first column (or the first and second), but not by the second column alone — the “leftmost prefix” rule.',
      'Kai columns pe ek index, jaise `(user_id, status)`. Yeh un queries mein madad karta hai jo pehle column (ya pehle aur doosre) se filter karti hain, par sirf doosre column se nahi — yahi “leftmost prefix” rule hai.',
    ],
    ['A phone book sorted by surname, then first name: easy to find all the Sharmas, useless for finding everyone called Priya.', 'Surname phir first name se sorted phone book: saare Sharma dhoondhna aasaan, par har Priya dhoondhne mein bekaar.'],
    { related: ['b-tree', 'covering-index'] },
  ),
  g(
    'covering-index',
    'Covering index',
    ['covering index', 'covering indexes', 'index-only scan'],
    [
      'An index that already contains every column a query needs, so the database answers from the index alone without visiting the table.',
      'Aisa index jisme query ke saare columns pehle se hon, to database table pe gaye bina sirf index se jawab de deta hai.',
    ],
  ),
  g(
    'write-amplification',
    'Write amplification',
    ['write amplification'],
    [
      'When one logical write causes many physical writes — for example every new row also updating eight indexes. More indexes mean slower writes.',
      'Jab ek logical write kai physical writes karwa de — jaise har nayi row ke saath aath indexes update hon. Zyaada indexes matlab slow writes.',
    ],
    ['Every time you add a contact, updating three separate address books.', 'Har naya contact jodne pe teen alag address books update karna.'],
  ),
  g(
    'cardinality',
    'Cardinality / selectivity',
    ['cardinality', 'high-cardinality', 'low-cardinality', 'selectivity', 'low-selectivity'],
    [
      'How many different values something has. In databases, a column with many distinct values (email) is **selective** and benefits from an index; one with few (true/false) is not. In metrics, high-cardinality labels (user IDs) create millions of separate time series and explode costs.',
      'Kisi cheez ki kitni alag values hain. Database mein bahut alag values wala column (email) **selective** hai aur index se faayda leta hai; kam values wala (true/false) nahi. Metrics mein high-cardinality labels (user IDs) lakhon alag time series bana ke kharcha phaad dete hain.',
    ],
    ['Sorting a class by roll number splits it finely; sorting by “wears glasses: yes/no” barely helps you find anyone.', 'Class ko roll number se sort karna baarik baant-ta hai; “chashma: haan/nahi” se sort karke kisi ko dhoondhne mein madad nahi milti.'],
  ),
  g(
    'query-plan',
    'Query plan / EXPLAIN',
    ['query plan', 'query plans', 'execution plan', 'execution plans', 'EXPLAIN ANALYZE', 'EXPLAIN'],
    [
      'The step-by-step recipe the database chooses to run a query — which index to use, which table to read first. `EXPLAIN ANALYZE` shows the plan with real timings and row counts.',
      'Query chalane ke liye database ki chuni hui step-by-step recipe — kaunsa index, kaunsi table pehle. `EXPLAIN ANALYZE` asli timings aur row counts ke saath plan dikhata hai.',
    ],
    ['A maps app showing the route it chose and how long each stretch took.', 'Maps app jo chuna hua raasta aur har hisse ka time dikhata hai.'],
    { related: ['optimizer', 'table-statistics', 'full-table-scan'], more: PREP.slow },
  ),
  g(
    'optimizer',
    'Query optimizer',
    ['query optimizer', 'optimizer', 'query planner', 'planner'],
    [
      'The part of the database that decides how to run each query, by estimating the cost of different plans from table statistics.',
      'Database ka woh hissa jo tay karta hai har query kaise chalegi, table statistics se alag plans ka kharcha andaaza lagaa ke.',
    ],
    ['A maps app choosing a route based on the traffic data it has — old data, bad route.', 'Maps app jo apne traffic data ke hisaab se raasta chunta hai — purana data, bura raasta.'],
    { related: ['query-plan', 'table-statistics'] },
  ),
  g(
    'table-statistics',
    'Table statistics',
    ['table statistics', 'stale statistics'],
    [
      'Summaries the database keeps about each table — row counts and how values are spread. The optimizer uses them to pick plans; when they are stale it can choose a terrible plan. `ANALYZE` refreshes them.',
      'Har table ke baare mein database ki summaries — row count aur values kaise faili hain. Optimizer inse plan chunta hai; purani hon to bahut bura plan chun sakta hai. `ANALYZE` inhe refresh karta hai.',
    ],
    ['Planning lunch for 10 guests when 200 have actually arrived.', '10 mehmaanon ke hisaab se khaana banana jab asal mein 200 aa gaye.'],
    { related: ['optimizer', 'query-plan'] },
  ),
  g(
    'vacuum',
    'VACUUM / table bloat',
    ['VACUUM', 'autovacuum', 'dead rows', 'dead tuples', 'table bloat', 'index bloat', 'bloat', 'bloated'],
    [
      'In PostgreSQL, updated and deleted rows leave “dead” copies behind. `VACUUM` (run automatically by autovacuum) cleans them up; if it falls behind, tables and indexes swell (“bloat”) and queries read far more pages than needed.',
      'PostgreSQL mein update aur delete hui rows “mari hui” copies chhod jaati hain. `VACUUM` (autovacuum apne aap chalata hai) unhe saaf karta hai; peeche reh jaaye to tables aur indexes phool jaate hain (“bloat”) aur queries zaroorat se kahin zyaada pages padhti hain.',
    ],
    ['A cupboard where you keep adding new clothes without throwing out old ones — finding anything takes longer and longer.', 'Almari jisme purane kapde nikaale bina naye daalte jao — kuch bhi dhoondhna mushkil hota jaata hai.'],
  ),
  g(
    'lock-contention',
    'Lock contention',
    ['lock contention', 'contention'],
    [
      'Many operations waiting for the same lock, so work queues up behind it. A query “stuck” on a lock looks exactly like a slow query.',
      'Bahut saare operations same lock ka wait kar rahe hain, to kaam uske peeche line mein lag jaata hai. Lock pe “atki” query bilkul slow query jaisi dikhti hai.',
    ],
    ['A single washroom in a busy office — the queue outside is the problem, not the washroom.', 'Busy office mein ek hi washroom — problem bahar ki line hai, washroom nahi.'],
  ),
  g(
    'connection-pool',
    'Connection pool',
    ['connection pool', 'connection pools', 'pool sizing', 'database connection pool'],
    [
      'A small set of database connections kept open and lent to requests, because opening a connection for every request is slow and the database allows only a limited number.',
      'Database connections ka chhota set jo khula rakha jaata hai aur requests ko udhaar diya jaata hai, kyunki har request pe naya connection kholna slow hai aur database limited connections hi allow karta hai.',
    ],
    ['A taxi stand with 20 waiting cabs: passengers take one and it comes back — nobody buys a new car per trip.', '20 taxis wala stand: passenger ek lete hain aur woh wapas aa jaati hai — har trip ke liye nayi gaadi koi nahi khareedta.'],
    { related: ['connection-leak', 'max-connections', 'pgbouncer'], more: PREP.pool },
  ),
  g(
    'connection-leak',
    'Connection leak',
    ['connection leak', 'connection leaks'],
    [
      'Code that borrows a connection and never gives it back — usually when an error skips the release. The pool slowly empties until requests start timing out.',
      'Aisa code jo connection udhaar leta hai aur kabhi wapas nahi karta — aksar jab error release ko skip kar de. Pool dheere-dheere khaali hota hai aur requests time out hone lagti hain.',
    ],
    ['Library members who borrow books and never return them — eventually the shelves are empty.', 'Library ke members jo kitaabein le ke kabhi lautate nahi — aakhir mein shelves khaali.'],
    { related: ['connection-pool'] },
  ),
  g(
    'max-connections',
    'max_connections',
    ['max_connections'],
    [
      'The database setting for how many connections it accepts at once. Every app instance’s pool counts against it: 10 instances × 20 connections = 200.',
      'Database ki setting ki woh ek saath kitne connections lega. Har app instance ka pool isme gina jaata hai: 10 instances × 20 connections = 200.',
    ],
    undefined,
    { related: ['connection-pool', 'pgbouncer'] },
  ),
  g(
    'pgbouncer',
    'PgBouncer / connection proxy',
    ['PgBouncer', 'RDS Proxy', 'connection proxy'],
    [
      'A lightweight proxy that sits between many app instances and the database and shares a small number of real connections between them.',
      'Halka proxy jo kai app instances aur database ke beech baithta hai aur kuch hi asli connections ko sabke beech share karta hai.',
    ],
    ['A receptionist who takes calls from hundreds of people but uses only five phone lines to the doctors.', 'Receptionist jo saikdon logon ke call leti hai par doctors tak sirf paanch phone lines use karti hai.'],
    { related: ['connection-pool', 'max-connections'] },
  ),
  g(
    'n-plus-one',
    'N+1 queries',
    ['N+1', 'N+1 queries', 'N+1 query'],
    [
      'Loading a list with one query and then running one extra query per item — fine for 5 items, terrible for 500. Fix it with a join, a batched `WHERE id IN (…)` or eager loading.',
      'Ek query se list laana aur phir har item ke liye ek extra query — 5 items pe theek, 500 pe bahut bura. Join, batched `WHERE id IN (…)` ya eager loading se theek karo.',
    ],
    ['Going to the shop once per item on your grocery list instead of buying everything in one trip.', 'Grocery list ke har item ke liye alag se dukaan jaana, ek hi baar mein sab khareedne ki jagah.'],
  ),
  g(
    'partitioning',
    'Partitioning',
    ['partitioning', 'partition by time', 'partitioned table', 'partitioned tables'],
    [
      'Splitting one huge table into smaller pieces (for example one per month) so queries only read the pieces they need and old pieces can be archived easily.',
      'Ek bahut badi table ko chhote tukdon mein baantna (jaise har mahine ka ek) taaki queries sirf zaroori tukde padhein aur purane tukde aasaani se archive ho sakein.',
    ],
    ['Keeping each year’s bills in a separate folder instead of one giant pile.', 'Har saal ke bills alag folder mein rakhna, ek bade dher ki jagah.'],
    { related: ['sharding'] },
  ),
  g(
    'sharding',
    'Sharding',
    ['sharding', 'shard', 'shards', 'sharded'],
    [
      'Splitting data across several database servers, each holding part of it (for example users A–M and N–Z), so no single machine has to store or serve everything.',
      'Data ko kai database servers mein baantna, har ek ke paas ek hissa (jaise users A–M aur N–Z), taaki kisi ek machine ko sab kuch store ya serve na karna pade.',
    ],
    ['An exam hall split into rooms by roll number, so no single room is overcrowded.', 'Exam hall ko roll number se kamron mein baantna, taaki koi ek kamra bheed se na bhare.'],
    { component: 'sharded-db', more: '/learn/sharded-db' },
  ),
  g(
    'replication',
    'Replication / read replica',
    ['replication', 'read replica', 'read replicas', 'replica', 'replicas', 'replication lag'],
    [
      'Keeping copies of a database on other machines. Read **replicas** answer read queries to share the load, and can take over if the main one fails. They are slightly behind the main copy — that delay is **replication lag**.',
      'Database ki copies doosri machines pe rakhna. Read **replicas** load baantne ke liye read queries ka jawab deti hain, aur main fail ho to sambhaal sakti hain. Yeh main copy se thoda peeche hoti hain — us der ko **replication lag** kehte hain.',
    ],
    ['Photocopies of a popular book in reading rooms: many people can read at once, but a correction reaches the copies a little later.', 'Popular kitaab ki photocopies reading rooms mein: bahut log ek saath padh sakte hain, par sudhaar copies tak thodi der se pahunchta hai.'],
    { component: 'read-replica', more: '/learn/read-replica' },
  ),
  g(
    'working-set',
    'Working set / buffer cache',
    ['working set', 'buffer cache hit ratio', 'buffer cache'],
    [
      'The part of the data that is used often. When it fits in the database’s memory (the buffer cache), reads are fast; when it outgrows memory, reads go to disk and everything slows down.',
      'Data ka woh hissa jo baar-baar use hota hai. Jab yeh database ki memory (buffer cache) mein fit ho, reads fast hote hain; memory se bada ho jaaye to reads disk pe jaate hain aur sab slow.',
    ],
    ['The books on your desk versus the ones in the storeroom downstairs.', 'Aapki desk pe rakhi kitaabein aur neeche storeroom wali kitaabein.'],
  ),
  g(
    'pg-stat',
    'pg_stat views',
    ['pg_stat_activity', 'pg_stat_statements', 'pg_stat_user_indexes', 'pg_stat_user_tables'],
    [
      'Built-in PostgreSQL views for troubleshooting: `pg_stat_activity` shows what is running or waiting right now, `pg_stat_statements` tracks how slow each query is over time, and the `pg_stat_user_*` views show table and index usage.',
      'Troubleshooting ke liye PostgreSQL ke built-in views: `pg_stat_activity` dikhata hai abhi kya chal raha ya wait kar raha hai, `pg_stat_statements` har query ki slowness samay ke saath track karta hai, aur `pg_stat_user_*` views table aur index ka use dikhate hain.',
    ],
  ),
  g(
    'orm',
    'ORM',
    ['ORM', 'ORMs'],
    [
      'Object-Relational Mapper: a library (Prisma, TypeORM, Hibernate) that lets you work with database rows as objects in your code and writes the SQL for you.',
      'Object-Relational Mapper: library (Prisma, TypeORM, Hibernate) jo database rows ko code mein objects ki tarah use karne deti hai aur aapke liye SQL likhti hai.',
    ],
  ),
  g(
    'schema-migration',
    'Database migration',
    ['database migration', 'database migrations', 'schema migration', 'schema migrations', 'schema change', 'schema changes'],
    [
      'A versioned script that changes the database structure — add a column, create an index — applied in order on every environment.',
      'Versioned script jo database ka structure badalti hai — column jodna, index banana — har environment pe order se lagti hai.',
    ],
    undefined,
    { related: ['expand-contract'] },
  ),
  g(
    'cdc',
    'Change data capture (CDC)',
    ['CDC', 'change data capture'],
    [
      'Reading every change from a database’s log and streaming it to other systems — to update a search index, a cache or a warehouse without changing app code.',
      'Database ke log se har change padh ke doosre systems tak stream karna — search index, cache ya warehouse update karne ke liye, app code badle bina.',
    ],
    ['A newspaper’s “corrections” feed that other papers subscribe to.', 'Akhbaar ki “sudhaar” feed jise doosre akhbaar subscribe karte hain.'],
  ),
  g(
    'strong-consistency',
    'Strong consistency',
    ['strong consistency', 'strongly consistent'],
    [
      'Every read sees the latest write, everywhere, immediately. Simple to reason about, but slower and less available during network problems.',
      'Har read ko har jagah turant latest write dikhta hai. Samajhna simple, par network problem ke time slow aur kam available.',
    ],
    undefined,
    { related: ['eventual-consistency'] },
  ),

  // ───────── Architecture ─────────
  g(
    'monolith',
    'Monolith',
    ['monolith', 'monoliths', 'modular monolith'],
    [
      'One application, deployed as one unit, that contains all the features. A **modular monolith** keeps strict internal modules so parts can be split out later.',
      'Ek application, ek unit ki tarah deploy, jisme saare features hain. **Modular monolith** andar sakht modules rakhta hai taaki hisse baad mein alag kiye ja sakein.',
    ],
    ['One kitchen cooking every dish in a restaurant.', 'Restaurant ki har dish pakaane wali ek kitchen.'],
    { related: ['microservices', 'distributed-monolith'], more: PREP.monolith },
  ),
  g(
    'microservices',
    'Microservices',
    ['microservice', 'microservices', 'microservices architecture'],
    [
      'Splitting a system into small services that each own one business capability and its data, deployed independently and talking over the network.',
      'System ko chhoti services mein baantna, har ek ek business capability aur apne data ki maalik, alag-alag deploy aur network pe baat karti hui.',
    ],
    ['A food court with separate stalls, each with its own staff, menu and stock.', 'Food court jisme alag stalls, har ek ka apna staff, menu aur stock.'],
    { component: 'microservice', related: ['monolith', 'saga', 'distributed-monolith'], more: PREP.monolith },
  ),
  g(
    'bounded-context',
    'Bounded context',
    ['bounded context', 'bounded contexts'],
    [
      'A clear boundary around one part of the business (orders, payments, catalogue) with its own model and language. Good service or module boundaries follow bounded contexts.',
      'Business ke ek hisse (orders, payments, catalogue) ke chaaron taraf saaf boundary, apne model aur bhasha ke saath. Acchi service ya module boundaries bounded contexts ke hisaab se banti hain.',
    ],
    ['In a hospital, “admission” means one thing to billing and another to the ward — each department has its own meaning.', 'Hospital mein “admission” ka matlab billing ke liye ek aur ward ke liye doosra — har department ka apna matlab.'],
  ),
  g(
    'distributed-monolith',
    'Distributed monolith',
    ['distributed monolith'],
    [
      'Services split apart but still tightly tied together — sharing a database, calling each other in long chains, releasing together. You get every cost of microservices and none of the benefits.',
      'Services alag to hain par abhi bhi kas ke judi — database share karti, lambi chains mein ek doosre ko call karti, saath release hoti. Microservices ka har kharcha, faayda ek bhi nahi.',
    ],
  ),
  g(
    'strangler-fig',
    'Strangler fig pattern',
    ['strangler fig', 'strangler fig pattern'],
    [
      'Replacing an old system piece by piece: route one feature at a time to new code behind a gateway, until the old system can be switched off — no big-bang rewrite.',
      'Purane system ko tukda-tukda badalna: gateway ke peeche ek-ek feature naye code pe bhejo, jab tak purana band na ho sake — ek jhatke mein sab dobara nahi likhna.',
    ],
    ['Renovating a house one room at a time while still living in it.', 'Ghar mein rehte hue ek-ek kamra renovate karna.'],
  ),
  g(
    'saga',
    'Saga',
    ['saga', 'sagas', 'saga pattern', 'compensating action', 'compensating actions'],
    [
      'A way to do a “transaction” across several services: a sequence of local steps where each step has a compensating action to undo it if a later step fails.',
      'Kai services mein “transaction” karne ka tareeka: local steps ki series jisme har step ka compensating action hota hai jo aage ka step fail hone pe use ulta kar de.',
    ],
    ['Booking a trip: book the flight, then the hotel; if the hotel fails, cancel the flight.', 'Trip book karna: pehle flight, phir hotel; hotel fail ho to flight cancel.'],
    { related: ['outbox', 'eventual-consistency'] },
  ),
  g(
    'outbox',
    'Transactional outbox',
    ['transactional outbox', 'outbox pattern', 'outbox'],
    [
      'Saving a business change and the event to publish in the same database transaction (in an “outbox” table), then publishing from that table — so you never save without publishing, or publish without saving.',
      'Business change aur publish karne wala event same database transaction mein save karna (“outbox” table mein), phir us table se publish karna — taaki na bina publish ke save ho, na bina save ke publish.',
    ],
    ['Writing a letter and its “send” entry in the same register; the post boy later sends everything in the register.', 'Chitthi aur uski “bhejo” entry ek hi register mein likhna; daakiya baad mein register ki har cheez bhej deta hai.'],
    { related: ['saga', 'message-queue'], more: PREP.queue },
  ),
  g(
    'eventual-consistency',
    'Eventual consistency',
    ['eventual consistency', 'eventually consistent'],
    [
      'Copies of data may disagree for a short time but become the same soon (milliseconds to seconds). Faster and more available than strong consistency.',
      'Data ki copies thodi der alag ho sakti hain par jaldi hi same ho jaati hain (milliseconds se seconds). Strong consistency se fast aur zyaada available.',
    ],
    ['A like count that shows 99 on one phone and 100 on another for a second.', 'Like count jo ek second ke liye ek phone pe 99 aur doosre pe 100 dikhaye.'],
    { related: ['strong-consistency', 'replication'] },
  ),
  g(
    'service-discovery',
    'Service discovery',
    ['service discovery'],
    [
      'How services find each other’s current addresses automatically as instances start, stop and move — for example Kubernetes DNS or Consul.',
      'Services ek doosre ke current address apne aap kaise dhoondhti hain jab instances start, band aur shift hote hain — jaise Kubernetes DNS ya Consul.',
    ],
    ['A company phone directory that updates itself whenever someone changes desks.', 'Company ki phone directory jo kisi ke desk badalne pe khud update ho jaaye.'],
  ),
  g(
    'conways-law',
    'Conway’s law',
    ['Conway’s law', "Conway's law"],
    [
      'Systems end up shaped like the teams that build them. Splitting services along team boundaries lets each team move independently.',
      'Systems aakhir mein unhe banane wali teams jaise shape le lete hain. Team boundaries ke hisaab se services baantne se har team azaadi se kaam kar paati hai.',
    ],
  ),
  g(
    'partial-failure',
    'Partial failure',
    ['partial failure', 'partial failures'],
    [
      'In a distributed system some parts work while others fail, and a caller often cannot tell whether a remote action happened — a timeout does not mean it failed.',
      'Distributed system mein kuch hisse chalte hain aur kuch fail hote hain, aur caller aksar nahi jaanta ki remote action hua ya nahi — timeout ka matlab fail hona nahi.',
    ],
    ['You send money and the app freezes: did it go through or not? You have to check before trying again.', 'Paise bheje aur app atak gaya: gaye ya nahi? Dobara try karne se pehle check karna padta hai.'],
    { related: ['idempotency', 'timeout'], more: PREP.distributed },
  ),
  g(
    'clock-skew',
    'Clock skew',
    ['clock skew'],
    [
      'Clocks on different machines drift slightly apart, so timestamps from different servers cannot be trusted to show the true order of events.',
      'Alag machines ki ghadiyaan thodi khisak jaati hain, isliye alag servers ke timestamps se events ka sahi order pakka nahi kar sakte.',
    ],
    ['Two friends’ watches differ by a minute, so “who arrived first” depends on whose watch you trust.', 'Do doston ki ghadiyon mein ek minute ka fark, to “pehle kaun aaya” is pe depend karta hai kiski ghadi maano.'],
  ),
  g(
    'distributed-tracing',
    'Distributed tracing',
    ['distributed tracing', 'trace', 'traces', 'span', 'spans', 'tracing'],
    [
      'Recording the path of one request through every service as a tree of timed steps (**spans**). It shows exactly where the time or the error is.',
      'Ek request ka har service se guzarne ka raasta timed steps (**spans**) ke tree ki tarah record karna. Yeh dikhata hai ki time ya error bilkul kahan hai.',
    ],
    ['A patient’s hospital journey: reception 5 min → X-ray 40 min → doctor 10 min — the delay is obvious.', 'Hospital mein patient ka safar: reception 5 min → X-ray 40 min → doctor 10 min — der kahan hai saaf dikhta hai.'],
    { component: 'distributed-tracing', related: ['correlation-id', 'opentelemetry'], more: '/prep/devops/logs-vs-metrics-vs-traces' },
  ),
  g(
    'opentelemetry',
    'OpenTelemetry',
    ['OpenTelemetry', 'OTel'],
    [
      'An open standard and set of libraries for collecting traces, metrics and logs from your code in one consistent way, and sending them to any monitoring tool.',
      'Open standard aur libraries ka set jo aapke code se traces, metrics aur logs ek consistent tareeke se ikattha karke kisi bhi monitoring tool ko bhejta hai.',
    ],
    undefined,
    { related: ['distributed-tracing', 'observability'] },
  ),
  g(
    'context-propagation',
    'Context propagation',
    ['context propagation', 'traceparent'],
    [
      'Passing the trace ID from one service to the next in request headers (the standard `traceparent` header), so all the steps of one request are linked together.',
      'Trace ID ko request headers mein ek service se agli tak bhejna (standard `traceparent` header), taaki ek request ke saare steps aapas mein jude rahein.',
    ],
    undefined,
    { related: ['correlation-id', 'distributed-tracing'] },
  ),
  g(
    'structured-logging',
    'Structured logging',
    ['structured logs', 'structured logging', 'structured log'],
    [
      'Writing logs as data (usually JSON with fields like level, service and traceId) instead of free text, so they can be searched and filtered reliably.',
      'Logs ko free text ki jagah data ki tarah likhna (aam taur pe level, service aur traceId jaise fields wala JSON), taaki unhe bharose se search aur filter kiya ja sake.',
    ],
    ['A form with labelled boxes versus a handwritten note — the form is far easier to sort and search.', 'Label wale khaanon wala form vs haath se likha note — form sort aur search karna kahin aasaan.'],
    { component: 'logging-service' },
  ),
];
