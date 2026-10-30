import { g } from './terms-1';
import type { GlossaryTerm } from './types';

const PREP = {
  cache: '/prep/system-design/when-to-use-a-cache',
  queue: '/prep/system-design/queue-vs-synchronous-api-call',
  consumer: '/prep/system-design/idempotent-consumer-pattern',
  lb: '/prep/servers/why-use-a-load-balancer',
  sso: '/prep/security/sso-authentication-and-jwt',
  pod: '/prep/devops/kubernetes-pod-keeps-restarting',
  probes: '/prep/devops/readiness-vs-liveness-probe',
  cicd: '/prep/devops/from-laptop-to-production',
  pillars: '/prep/devops/logs-vs-metrics-vs-traces',
  metrics: '/prep/devops/metrics-to-monitor-for-a-production-api',
  latency: '/prep/devops/find-where-extra-latency-comes-from',
  release: '/prep/devops/how-do-you-know-your-release-has-a-problem',
  spike: '/prep/devops/error-rate-spikes-after-deploy',
  incident: '/prep/devops/tell-me-about-a-production-incident',
  quality: '/prep/practices/how-do-you-ensure-quality',
};

/** Caching, messaging, servers, security, DevOps, observability and quality. */
export const TERMS_2: GlossaryTerm[] = [
  // ───────── Caching ─────────
  g(
    'cache',
    'Cache',
    ['cache', 'caches', 'caching', 'cached', 'cache hit', 'cache miss', 'cache hits', 'cache misses'],
    [
      'A fast copy of data kept close by (usually in memory) so it does not have to be fetched or computed again. A **cache hit** finds the copy; a **cache miss** has to go to the slower source.',
      'Data ki fast copy jo paas rakhi jaati hai (aam taur pe memory mein) taaki use dobara laana ya compute na karna pade. **Cache hit** mein copy mil jaati hai; **cache miss** mein slow source tak jaana padta hai.',
    ],
    ['A water bottle on your desk instead of walking to the kitchen each time.', 'Har baar kitchen jaane ki jagah desk pe paani ki bottle.'],
    { component: ['distributed-cache', 'in-memory-cache', 'cdn-cache'], related: ['ttl', 'cache-aside', 'cache-invalidation', 'hit-ratio'], more: PREP.cache },
  ),
  g(
    'redis',
    'Redis',
    ['Redis'],
    [
      'A very fast in-memory data store, commonly used as a shared cache and for sessions, counters and rate limits.',
      'Bahut fast in-memory data store, aam taur pe shared cache, sessions, counters aur rate limits ke liye.',
    ],
    undefined,
    { related: ['cache'], more: '/learn/distributed-cache' },
  ),
  g(
    'cache-aside',
    'Cache-aside',
    ['cache-aside', 'lazy loading'],
    [
      'The most common caching pattern: the app checks the cache first; on a miss it reads the database and stores the result in the cache. On a write it updates the database and deletes the cached copy.',
      'Sabse common caching pattern: app pehle cache dekhta hai; miss pe database padh ke result cache mein rakhta hai. Write pe database update karke cached copy delete karta hai.',
    ],
    ['Checking your notebook for a phone number first, and only if it is missing calling directory enquiry — then writing it down.', 'Pehle notebook mein phone number dekhna, na mile to hi enquiry ko call karna — phir likh lena.'],
    { related: ['write-through', 'write-behind', 'cache-invalidation'], more: PREP.cache },
  ),
  g(
    'write-through',
    'Write-through',
    ['write-through', 'read-through'],
    [
      '**Write-through:** every write goes to the cache and the database together, so the cache is always fresh. **Read-through:** the cache itself loads missing data from the database.',
      '**Write-through:** har write cache aur database dono mein ek saath jaata hai, to cache hamesha fresh. **Read-through:** cache khud database se missing data laata hai.',
    ],
    undefined,
    { related: ['cache-aside', 'write-behind'] },
  ),
  g(
    'write-behind',
    'Write-behind (write-back)',
    ['write-behind', 'write-back'],
    [
      'Writes go to the cache only and are saved to the database later in batches. The fastest writes — but data is lost if the cache dies first.',
      'Writes sirf cache mein jaate hain aur baad mein batches mein database mein save hote hain. Sabse fast writes — par cache pehle mar jaaye to data gaya.',
    ],
    ['A waiter jotting orders and passing them to the kitchen every ten minutes — lose the notepad, lose the orders.', 'Waiter orders likh ke har das minute mein kitchen ko deta hai — notepad kho gaya to orders bhi gaye.'],
  ),
  g(
    'ttl',
    'TTL (time to live)',
    ['TTL', 'TTLs', 'time to live', 'time-to-live'],
    [
      'How long a cached item stays valid before it expires automatically — it puts an upper limit on how stale cached data can be.',
      'Cached item kitni der valid rehta hai, phir apne aap expire — yeh tay karta hai ki cached data zyaada se zyaada kitna purana ho sakta hai.',
    ],
    ['The expiry date on a milk packet.', 'Doodh ke packet pe expiry date.'],
    { related: ['cache', 'cache-invalidation'] },
  ),
  g(
    'cache-invalidation',
    'Cache invalidation',
    ['cache invalidation', 'invalidation', 'invalidate', 'invalidates', 'invalidated'],
    [
      'Removing or updating cached copies when the original data changes, so users do not keep seeing old data.',
      'Original data badalne pe cached copies hatana ya update karna, taaki users purana data na dekhte rahein.',
    ],
    ['Taking down an old price tag the moment the price changes.', 'Price badalte hi purana price tag hata dena.'],
    { related: ['ttl', 'cache-aside'] },
  ),
  g(
    'cache-stampede',
    'Cache stampede',
    ['cache stampede', 'cache stampedes', 'stampede', 'stampedes', 'request coalescing', 'stale-while-revalidate'],
    [
      'A popular cached item expires and thousands of requests miss at the same moment and all hit the database. Fixes: **request coalescing** (one request rebuilds the value, the rest wait), **stale-while-revalidate** (serve the old copy while refreshing), and random jitter on TTLs.',
      'Popular cached item expire hota hai aur hazaaron requests ek saath miss karke database pe toot padti hain. Fix: **request coalescing** (ek request value banaye, baaki wait karein), **stale-while-revalidate** (refresh karte waqt purani copy do), aur TTLs pe random jitter.',
    ],
    ['Everyone’s water bottle runs out at the same time and the whole office queues at one tap.', 'Sabki bottle ek saath khatam aur poora office ek nal pe line lagata hai.'],
    { related: ['cache', 'ttl', 'jitter'] },
  ),
  g(
    'cache-penetration',
    'Cache penetration / avalanche',
    ['cache penetration', 'cache avalanche', 'avalanche', 'avalanches', 'Bloom filter'],
    [
      '**Penetration:** requests for keys that do not exist always miss and hit the database (fix: cache “not found” briefly, or use a Bloom filter). **Avalanche:** many keys expire together or the cache goes down, and the database is flooded (fix: spread expiries, replicate the cache).',
      '**Penetration:** jo keys exist nahi karti unki requests hamesha miss hoke database pe jaati hain (fix: “not found” ko thodi der cache karo, ya Bloom filter). **Avalanche:** bahut keys ek saath expire ya cache down, aur database mein baadh (fix: expiry failao, cache replicate karo).',
    ],
    undefined,
    { related: ['cache-stampede', 'cache'] },
  ),
  g(
    'hot-key',
    'Hot key',
    ['hot key', 'hot keys'],
    [
      'A single key that gets a huge share of traffic (a celebrity’s profile, a trending product) and can overload the one server that holds it.',
      'Ek key jise traffic ka bahut bada hissa milta hai (celebrity ki profile, trending product) aur jo use rakhne wale ek server ko overload kar sakti hai.',
    ],
    ['One shop counter selling the only product everyone wants — the queue is only at that counter.', 'Ek counter jo wahi product bechta hai jo sabko chahiye — line sirf usi counter pe.'],
  ),
  g(
    'cold-start',
    'Cold start',
    ['cold start', 'cold starts', 'cold cache'],
    [
      'The slow period after a restart or deploy when caches are empty (or a new instance is still warming up), so every request does the slow work.',
      'Restart ya deploy ke baad ka slow samay jab caches khaali hote hain (ya naya instance abhi garam ho raha hai), to har request slow kaam karti hai.',
    ],
    ['A restaurant’s first hour when nothing is prepped yet — every order is cooked from scratch.', 'Restaurant ka pehla ghanta jab kuch bhi pehle se taiyaar nahi — har order shuru se banta hai.'],
  ),
  g(
    'eviction',
    'Eviction (LRU / LFU)',
    ['eviction', 'evictions', 'eviction policy', 'LRU', 'LFU'],
    [
      'What a full cache throws out to make room. **LRU** removes what was used least recently; **LFU** removes what is used least often.',
      'Bhara hua cache jagah banane ke liye kya phenkta hai. **LRU** woh hatata hai jo sabse lambe samay se use nahi hua; **LFU** woh jo sabse kam use hota hai.',
    ],
    ['A small fridge: LRU throws out what nobody has touched for longest; LFU throws out what is eaten least often.', 'Chhota fridge: LRU woh phenkta hai jise sabse lambe samay se kisi ne nahi chhua; LFU woh jo sabse kam khaaya jaata hai.'],
  ),
  g(
    'hit-ratio',
    'Hit ratio',
    ['hit ratio', 'cache hit ratio'],
    [
      'The share of requests answered from the cache. A sudden drop means much more load on the database.',
      'Kitne percent requests ka jawab cache se mila. Achanak giravat matlab database pe kahin zyaada load.',
    ],
    undefined,
    { related: ['cache'] },
  ),
  g(
    'cdn',
    'CDN',
    ['CDN', 'CDNs', 'content delivery network'],
    [
      'A network of servers around the world that keep copies of your files (images, videos, scripts) close to users, so they load fast and your servers do less work.',
      'Duniya bhar mein servers ka network jo aapki files (images, videos, scripts) ki copies users ke paas rakhta hai, taaki woh fast load hon aur aapke servers kam kaam karein.',
    ],
    ['Local kiosks stocking the newspapers everyone buys, so nobody travels to the printing press.', 'Mohalle ki dukaanein jo woh akhbaar rakhti hain jo sab khareedte hain, taaki koi printing press tak na jaaye.'],
    { component: 'cdn', more: '/learn/cdn' },
  ),

  // ───────── Messaging ─────────
  g(
    'message-queue',
    'Message queue',
    ['message queue', 'message queues', 'work queue', 'queue depth'],
    [
      'A buffer where one part of a system drops messages (work to do) and workers pick them up later at their own pace. **Queue depth** is how many are waiting.',
      'Ek buffer jahan system ka ek hissa messages (karne wala kaam) daalta hai aur workers unhe baad mein apni speed se uthaate hain. **Queue depth** batata hai kitne wait kar rahe hain.',
    ],
    ['Order tickets pinned on a kitchen rail: the waiter adds them, the cooks take them in order, even during a rush.', 'Kitchen ki rail pe lage order tickets: waiter lagata hai, cooks order se uthaate hain, bheed mein bhi.'],
    { component: 'message-queue', related: ['at-least-once', 'dlq', 'pub-sub'], more: PREP.queue },
  ),
  g(
    'event-stream',
    'Event stream (Kafka)',
    ['event stream', 'event streams', 'Kafka'],
    [
      'An append-only log of events that is kept for days, so many consumer groups can each read every event — and replay old ones. Kafka is the best-known example.',
      'Events ka append-only log jo dinon tak rakha jaata hai, taaki kai consumer groups har event padh sakein — aur purane dobara chala sakein. Kafka sabse mashhoor example hai.',
    ],
    ['A TV channel’s recording: anyone can watch from the start at any time, without taking the show away from others.', 'TV channel ki recording: koi bhi kabhi bhi shuru se dekh sakta hai, doosron se show chheene bina.'],
    { component: 'event-stream', more: '/learn/event-stream' },
  ),
  g(
    'at-least-once',
    'Delivery guarantees',
    ['at-least-once', 'at least once', 'at-most-once', 'at most once', 'exactly once', 'exactly-once', 'at-least-once delivery'],
    [
      '**At-most-once:** a message arrives once or never (may be lost). **At-least-once:** it is never lost but may arrive twice — so consumers must handle duplicates. **Exactly-once:** its effect happens exactly once. Across a network this really means at-least-once delivery plus an **idempotent consumer** that safely ignores the duplicates.',
      '**At-most-once:** message ek baar aata hai ya kabhi nahi (kho sakta hai). **At-least-once:** kabhi nahi khota par do baar aa sakta hai — isliye consumers ko duplicates sambhaalne padte hain. **Exactly-once:** asar bilkul ek baar. Network pe iska asli matlab hai at-least-once delivery plus ek **idempotent consumer** jo duplicates ko safely ignore kare.',
    ],
    ['A courier who keeps coming until you sign is at-least-once — if your signature is lost, you might get the parcel twice.', 'Courier jo sign hone tak aata rehta hai woh at-least-once hai — sign kho jaaye to parcel do baar bhi aa sakta hai.'],
    { related: ['idempotent-consumer', 'idempotency', 'message-queue'], more: PREP.consumer },
  ),
  g(
    'consumer-lag',
    'Consumer lag',
    ['consumer lag'],
    [
      'How far behind the consumers are — the number (or age) of messages waiting to be processed. Growing lag means workers cannot keep up.',
      'Consumers kitne peeche hain — kitne (ya kitne purane) messages process hone ka wait kar rahe hain. Badhta lag matlab workers saath nahi de pa rahe.',
    ],
    undefined,
    { related: ['message-queue'] },
  ),
  g(
    'pub-sub',
    'Pub/sub and fan-out',
    ['pub/sub', 'publish/subscribe', 'fan-out', 'fan out'],
    [
      'Publish/subscribe: a publisher sends an event once and every subscriber receives its own copy (**fan-out**), without the publisher knowing who they are.',
      'Publish/subscribe: publisher event ek baar bhejta hai aur har subscriber ko apni copy milti hai (**fan-out**), publisher ko jaane bina ki woh kaun hain.',
    ],
    ['A WhatsApp group announcement: post once, everyone gets it.', 'WhatsApp group announcement: ek baar post karo, sabko mil jaata hai.'],
  ),
  g(
    'load-levelling',
    'Load levelling',
    ['load levelling', 'load leveling'],
    [
      'Using a queue to absorb bursts of work so the workers behind it process at a steady pace instead of being overwhelmed.',
      'Kaam ke jhatkon ko sokhne ke liye queue use karna, taaki peeche ke workers dabne ki jagah ek steady speed se process karein.',
    ],
    ['A dam storing a sudden flood and releasing water steadily.', 'Bandh jo achanak aayi baadh ko rok ke paani dheere-dheere chhodta hai.'],
  ),
  g(
    'coupling',
    'Coupling',
    ['temporal coupling', 'decoupling', 'decouple', 'decouples', 'decoupled', 'tightly coupled', 'loosely coupled'],
    [
      'How much one part depends on another. **Tightly coupled** parts break together; **loosely coupled** (decoupled) parts can change or fail independently. **Temporal coupling** means both sides must be up at the same time — like a synchronous call.',
      'Ek hissa doosre pe kitna depend karta hai. **Tightly coupled** hisse saath toot-te hain; **loosely coupled** (decoupled) hisse alag-alag badal ya fail ho sakte hain. **Temporal coupling** matlab dono taraf ek saath up honi chahiye — jaise synchronous call.',
    ],
    ['A phone call needs both people free at the same time (coupled); a voice note does not (decoupled).', 'Phone call ke liye dono ka ek saath free hona zaroori (coupled); voice note ke liye nahi (decoupled).'],
  ),
  g(
    'http-202',
    '202 Accepted',
    ['202 Accepted'],
    [
      'An HTTP response meaning “request received, the work will be done later” — the usual reply when the slow part continues in the background.',
      'HTTP response jiska matlab hai “request mil gayi, kaam baad mein hoga” — jab slow hissa background mein chalta hai tab ka aam jawab.',
    ],
    ['A dry cleaner giving you a token: “Received — collect it tomorrow.”', 'Dry cleaner token deta hai: “Mil gaya — kal le jaana.”'],
  ),

  // ───────── Servers & traffic ─────────
  g(
    'load-balancer',
    'Load balancer',
    ['load balancer', 'load balancers', 'load balancing'],
    [
      'A component in front of several servers that spreads incoming requests across them and stops sending traffic to servers that fail their health checks.',
      'Kai servers ke aage ka component jo aane wali requests unme baant-ta hai aur health check fail karne wale servers ko traffic bhejna band kar deta hai.',
    ],
    ['A bank guard sending each customer to a free counter.', 'Bank ka guard jo har customer ko khaali counter pe bhejta hai.'],
    { component: 'load-balancer', related: ['health-check', 'horizontal-scaling', 'l4-l7'], more: PREP.lb },
  ),
  g(
    'horizontal-scaling',
    'Horizontal vs vertical scaling',
    ['horizontal scaling', 'scale horizontally', 'horizontally', 'scale out', 'scaling out', 'vertical scaling', 'scale vertically', 'vertically'],
    [
      '**Horizontal** scaling adds more machines; **vertical** scaling makes one machine bigger. Horizontal scales further and survives failures, but needs stateless servers and a load balancer.',
      '**Horizontal** scaling mein aur machines jodte hain; **vertical** mein ek machine badi karte hain. Horizontal zyaada door tak scale hota hai aur failures jhel leta hai, par stateless servers aur load balancer chahiye.',
    ],
    ['Opening more billing counters (horizontal) versus hiring one super-fast cashier (vertical).', 'Aur billing counters kholna (horizontal) vs ek bahut tez cashier rakhna (vertical).'],
    { related: ['load-balancer', 'stateless'] },
  ),
  g(
    'autoscaling',
    'Autoscaling',
    ['autoscaling', 'autoscaled', 'autoscale'],
    [
      'Automatically adding or removing server instances based on load (CPU, requests per second).',
      'Load (CPU, requests per second) ke hisaab se server instances apne aap jodna ya hatana.',
    ],
    ['A supermarket that opens extra counters when queues get long and closes them at night.', 'Supermarket jo line lambi hone pe extra counters kholta hai aur raat ko band karta hai.'],
  ),
  g(
    'health-check',
    'Health check',
    ['health check', 'health checks', 'health endpoint'],
    [
      'A regular “are you OK?” request (for example `GET /health`) that a load balancer or Kubernetes sends to each instance, removing the ones that do not answer correctly.',
      'Regular “theek ho?” request (jaise `GET /health`) jo load balancer ya Kubernetes har instance ko bhejta hai, aur sahi jawab na dene walon ko hata deta hai.',
    ],
    ['A head waiter checking which waiters are on duty before seating guests.', 'Head waiter guests ko bithane se pehle dekhta hai kaun se waiters duty pe hain.'],
    { related: ['load-balancer', 'probes'] },
  ),
  g(
    'l4-l7',
    'Layer 4 vs Layer 7',
    ['Layer 4', 'Layer 7', 'L4', 'L7'],
    [
      'Layer 4 load balancing forwards connections using only addresses and ports (fast, any protocol). Layer 7 reads the HTTP request itself, so it can route by URL path, host or header.',
      'Layer 4 load balancing sirf addresses aur ports se connections aage bhejta hai (fast, koi bhi protocol). Layer 7 HTTP request khud padhta hai, isliye URL path, host ya header se route kar sakta hai.',
    ],
    ['A post office sorting by PIN code on the envelope (L4) versus a receptionist who reads the letter and sends it to the right department (L7).', 'Post office jo lifafe ke PIN code se chhaanta hai (L4) vs receptionist jo chitthi padh ke sahi department bhejti hai (L7).'],
  ),
  g(
    'tls',
    'TLS / HTTPS',
    ['TLS', 'TLS termination', 'terminate TLS', 'HTTPS'],
    [
      'The encryption that protects traffic between browser and server (the “S” in HTTPS). **TLS termination** means decrypting it at the load balancer so the servers behind do not have to.',
      'Browser aur server ke beech traffic ko bachane wala encryption (HTTPS ka “S”). **TLS termination** matlab use load balancer pe decrypt karna taaki peeche ke servers ko na karna pade.',
    ],
    ['A sealed envelope only the receiver can open; the building’s mailroom opens it and passes the letter inside.', 'Seal lifafa jo sirf receiver khol sakta hai; building ka mailroom khol ke andar chitthi pahuncha deta hai.'],
  ),
  g(
    'sticky-sessions',
    'Sticky sessions',
    ['sticky sessions', 'sticky session', 'session affinity'],
    [
      'Sending a user to the same server every time, because that server keeps their session in memory. It works, but unbalances load and loses sessions when that server dies.',
      'User ko har baar same server pe bhejna, kyunki woh server unka session memory mein rakhta hai. Chalta hai, par load bigaadta hai aur server marne pe sessions kho jaate hain.',
    ],
    undefined,
    { related: ['stateless'] },
  ),
  g(
    'connection-draining',
    'Connection draining',
    ['connection draining'],
    [
      'Before removing a server, the load balancer stops sending it new requests but lets in-flight ones finish — so deploys do not cut users off mid-request.',
      'Server hatane se pehle load balancer use nayi requests bhejna band karta hai par chal rahi requests poori hone deta hai — taaki deploy mein users beech mein na kate.',
    ],
    ['A shop that stops letting new customers in at closing time but serves everyone already inside.', 'Dukaan jo band hone ke time naye customers ko andar nahi aane deti par andar walon ko serve karti hai.'],
  ),
  g(
    'balancing-algorithms',
    'Load-balancing algorithms',
    ['round robin', 'least connections', 'consistent hashing', 'IP hash'],
    [
      '**Round robin** sends requests to each server in turn. **Least connections** picks the least busy server. **IP hash / consistent hashing** always sends the same client or key to the same server.',
      '**Round robin** har server ko baari-baari request bhejta hai. **Least connections** sabse kam busy server chunta hai. **IP hash / consistent hashing** same client ya key ko hamesha same server pe bhejta hai.',
    ],
    ['Round robin: counters 1, 2, 3, 1, 2, 3. Least connections: the shortest queue. Hashing: your account number decides your counter.', 'Round robin: counter 1, 2, 3, 1, 2, 3. Least connections: sabse chhoti line. Hashing: account number counter tay karta hai.'],
    { related: ['load-balancer'] },
  ),
  g(
    'reverse-proxy',
    'Reverse proxy',
    ['reverse proxy', 'reverse proxies', 'Nginx'],
    [
      'A server that sits in front of your app servers and handles incoming traffic for them — TLS, compression, caching, routing — often the same software as a load balancer (Nginx, Envoy).',
      'Server jo app servers ke aage baith ke unke liye aane wala traffic sambhaalta hai — TLS, compression, caching, routing — aksar load balancer wala hi software (Nginx, Envoy).',
    ],
    undefined,
    { component: 'reverse-proxy', more: '/learn/reverse-proxy' },
  ),
  g(
    'api-gateway',
    'API gateway',
    ['API gateway', 'API gateways'],
    [
      'A single front door for all API calls that handles authentication, rate limits per client and routing to the right internal service.',
      'Saari API calls ka ek darwaza jo authentication, har client ki rate limits aur sahi internal service tak routing sambhaalta hai.',
    ],
    ['A hotel reception that checks guests in and sends each request to the right department.', 'Hotel reception jo guests ko check-in karti hai aur har request sahi department ko bhejti hai.'],
    { component: 'api-gateway', more: '/learn/api-gateway' },
  ),

  // ───────── Security ─────────
  g(
    'sso',
    'Single sign-on (SSO)',
    ['SSO', 'single sign-on'],
    [
      'Logging in once at a central login service and then using many apps without entering your password again.',
      'Ek central login service pe ek baar login karke bina dobara password daale kai apps use karna.',
    ],
    ['Showing your ID once at the campus gate and getting into every building with the badge you received.', 'Campus gate pe ek baar ID dikhana aur mile hue badge se har building mein jaana.'],
    { related: ['idp', 'oidc', 'jwt'], more: PREP.sso },
  ),
  g(
    'idp',
    'Identity provider (IdP)',
    ['identity provider', 'identity providers', 'IdP', 'IdPs'],
    [
      'The trusted login service in SSO (Okta, Azure AD, Keycloak, Google) that checks who the user is and issues signed tokens to apps.',
      'SSO ki bharosemand login service (Okta, Azure AD, Keycloak, Google) jo user ki pehchaan check karke apps ko signed tokens deti hai.',
    ],
    ['The main security office of a campus that issues visitor badges.', 'Campus ka main security office jo visitor badges deta hai.'],
    { component: 'identity-provider', related: ['sso', 'oidc'], more: '/learn/identity-provider' },
  ),
  g(
    'oidc',
    'OpenID Connect (OIDC)',
    ['OpenID Connect', 'OIDC'],
    [
      'The modern standard for logging in with an identity provider, built on OAuth 2.0. It returns an **ID token** (a JWT) that says who the user is — it powers “Sign in with Google”.',
      'Identity provider se login ka modern standard, OAuth 2.0 pe bana. Yeh **ID token** (JWT) lautata hai jo batata hai user kaun hai — “Sign in with Google” isi se chalta hai.',
    ],
    undefined,
    { related: ['oauth', 'saml', 'tokens'], more: PREP.sso },
  ),
  g(
    'oauth',
    'OAuth 2.0',
    ['OAuth 2.0', 'OAuth'],
    [
      'A standard for **authorization**: letting an app access an API on a user’s behalf (for example “allow this app to read your calendar”) without sharing the user’s password.',
      '**Authorization** ka standard: kisi app ko user ki taraf se API access karne dena (jaise “is app ko aapka calendar padhne do”) bina user ka password share kiye.',
    ],
    ['Giving a valet a car key that starts the car but cannot open the boot.', 'Valet ko aisi chaabi dena jo gaadi start kare par dikki na khole.'],
    { related: ['oidc', 'tokens'] },
  ),
  g(
    'saml',
    'SAML',
    ['SAML', 'SAML 2.0'],
    [
      'An older, XML-based single sign-on standard still common in corporate applications.',
      'Purana, XML-based single sign-on standard jo corporate applications mein abhi bhi common hai.',
    ],
    undefined,
    { related: ['oidc', 'sso'] },
  ),
  g(
    'jwt',
    'JWT (JSON Web Token)',
    ['JWT', 'JWTs', 'JSON Web Token', 'JSON Web Tokens'],
    [
      'A compact token with three parts — `header.payload.signature`. The payload carries facts (claims) such as the user ID and expiry; the signature proves who issued it, so any service can verify it without a database lookup. It is signed, **not encrypted**: anyone can read it.',
      'Teen hisson wala compact token — `header.payload.signature`. Payload mein facts (claims) hote hain jaise user ID aur expiry; signature saabit karta hai kisne diya, to koi bhi service bina database lookup ke verify kar sakti hai. Yeh signed hai, **encrypted nahi**: koi bhi padh sakta hai.',
    ],
    ['A stamped visitor badge with your name and expiry time — any guard can check the stamp without phoning the main office.', 'Naam aur expiry time wala stamp laga visitor badge — koi bhi guard main office ko phone kiye bina stamp check kar leta hai.'],
    { related: ['tokens', 'jwks', 'claims'], more: PREP.sso },
  ),
  g(
    'pkce',
    'PKCE',
    ['PKCE'],
    [
      'Proof Key for Code Exchange: a one-time secret that ties the login code to the app that started the login, so a stolen code is useless to an attacker. Required for browser and mobile apps.',
      'Proof Key for Code Exchange: ek one-time secret jo login code ko us app se baandh deta hai jisne login shuru kiya, to chori hua code attacker ke kisi kaam ka nahi. Browser aur mobile apps ke liye zaroori.',
    ],
    ['A cloakroom token that only works together with the matching half you kept in your pocket.', 'Cloakroom token jo sirf aapki jeb mein rakhe matching aadhe hisse ke saath hi chalta hai.'],
  ),
  g(
    'auth-code-flow',
    'Authorization code flow',
    ['authorization code', 'authorization code flow', 'authorization-code flow'],
    [
      'The standard login flow: the app sends the user to the identity provider, gets back a short-lived code, and its backend exchanges that code for tokens.',
      'Standard login flow: app user ko identity provider pe bhejta hai, ek thodi der wala code wapas paata hai, aur uska backend us code ke badle tokens leta hai.',
    ],
    undefined,
    { related: ['pkce', 'oidc', 'tokens'] },
  ),
  g(
    'tokens',
    'ID, access and refresh tokens',
    ['ID token', 'ID tokens', 'access token', 'access tokens', 'refresh token', 'refresh tokens', 'refresh token rotation', 'rotating refresh tokens'],
    [
      'The **ID token** tells the app who the user is. The **access token** is sent with API calls to prove what the caller may do — keep it short-lived. The **refresh token** quietly gets a new access token when it expires; rotate it on every use.',
      '**ID token** app ko batata hai user kaun hai. **Access token** API calls ke saath jaata hai yeh saabit karne ki caller kya kar sakta hai — ise chhota rakho. **Refresh token** expire hone pe chupchaap naya access token laata hai; har use pe ise rotate karo.',
    ],
    ['A day pass (access token) that expires each evening, and a membership card (refresh token) that gets you a new day pass tomorrow.', 'Day pass (access token) jo har shaam expire hota hai, aur membership card (refresh token) jisse kal naya day pass milta hai.'],
    { related: ['jwt', 'oidc'] },
  ),
  g(
    'jwks',
    'JWKS',
    ['JWKS'],
    [
      'JSON Web Key Set: the public keys an identity provider publishes so apps can verify the signature of its tokens.',
      'JSON Web Key Set: woh public keys jo identity provider publish karta hai taaki apps uske tokens ka signature verify kar sakein.',
    ],
    undefined,
    { related: ['jwt'] },
  ),
  g(
    'claims',
    'JWT claims',
    ['claims', 'JWT claims'],
    [
      'The facts inside a token: `iss` (who issued it), `sub` (the user), `aud` (who it is meant for), `exp` (when it expires), plus roles or scopes.',
      'Token ke andar ke facts: `iss` (kisne diya), `sub` (user), `aud` (kiske liye hai), `exp` (kab expire hoga), plus roles ya scopes.',
    ],
    undefined,
    { related: ['jwt'] },
  ),
  g(
    'cookie-flags',
    'HttpOnly / SameSite cookies',
    ['HttpOnly', 'SameSite', 'HttpOnly cookie', 'HttpOnly cookies'],
    [
      'Cookie settings for safety: **HttpOnly** hides the cookie from JavaScript (so XSS cannot steal it), **Secure** sends it only over HTTPS, and **SameSite** stops other sites from sending it along with their requests.',
      'Safety ke liye cookie settings: **HttpOnly** cookie ko JavaScript se chhupata hai (taaki XSS chura na sake), **Secure** sirf HTTPS pe bhejta hai, aur **SameSite** doosri sites ko apni requests ke saath ise bhejne se rokta hai.',
    ],
    undefined,
    { related: ['xss'] },
  ),
  g(
    'xss',
    'XSS',
    ['XSS', 'cross-site scripting'],
    [
      'Cross-site scripting: an attacker gets their JavaScript to run on your page (for example through an unescaped comment), where it can steal tokens or act as the user.',
      'Cross-site scripting: attacker apna JavaScript aapke page pe chalwa deta hai (jaise bina escape kiye comment se), jahan woh tokens chura sakta hai ya user ban ke kaam kar sakta hai.',
    ],
  ),
  g(
    'bff',
    'Backend for frontend (BFF)',
    ['BFF', 'backend for frontend'],
    [
      'A small backend dedicated to one frontend. For security it can keep tokens on the server and give the browser only a secure session cookie.',
      'Ek frontend ke liye khaas chhota backend. Security ke liye yeh tokens server pe rakh ke browser ko sirf secure session cookie de sakta hai.',
    ],
    undefined,
    { component: 'bff' },
  ),
  g(
    'mfa',
    'Multi-factor authentication (MFA)',
    ['MFA', 'multi-factor authentication', 'two-factor authentication', '2FA'],
    [
      'Proving your identity in two different ways — a password plus an OTP, an app prompt or a passkey — so a stolen password alone is not enough.',
      'Do alag tareekon se pehchaan saabit karna — password plus OTP, app prompt ya passkey — taaki sirf chori ka password kaafi na ho.',
    ],
    ['An ATM needs both your card and your PIN.', 'ATM ko card aur PIN dono chahiye.'],
  ),
  g(
    'relying-party',
    'Relying party',
    ['relying party', 'relying parties'],
    [
      'The app that relies on an identity provider to log users in — it trusts the provider’s tokens and never sees the password.',
      'Woh app jo users ko login karwane ke liye identity provider pe bharosa karti hai — provider ke tokens maanti hai aur password kabhi nahi dekhti.',
    ],
  ),
  g(
    'single-logout',
    'Single logout',
    ['single logout'],
    [
      'Logging out once and being logged out of every connected app — the identity provider ends its session and tells the other apps.',
      'Ek baar logout karna aur har judi app se logout ho jaana — identity provider apna session khatam karke baaki apps ko batata hai.',
    ],
  ),
  g(
    'denylist',
    'Denylist',
    ['denylist', 'blocklist'],
    [
      'A list of tokens or users that must be rejected even though they still look valid — used to cut off a stolen token before it expires.',
      'Tokens ya users ki list jinhe mana karna hai chahe woh abhi valid dikhein — chori hua token expire hone se pehle band karne ke liye.',
    ],
  ),

  // ───────── DevOps & Kubernetes ─────────
  g(
    'kubernetes',
    'Kubernetes',
    ['Kubernetes', 'K8s'],
    [
      'A system that runs your containers across many machines: it starts them, restarts them when they crash, scales them and routes traffic to them.',
      'Ek system jo aapke containers ko kai machines pe chalata hai: start karta hai, crash hone pe restart, scale karta hai aur unpe traffic bhejta hai.',
    ],
    ['A restaurant manager who assigns cooks to stations, replaces anyone who falls ill, and adds cooks on busy nights.', 'Restaurant manager jo cooks ko stations deta hai, beemaar ko badalta hai, aur bheed wali raaton mein cooks badhata hai.'],
    { related: ['pod', 'container', 'probes'] },
  ),
  g(
    'pod',
    'Pod',
    ['pod', 'pods'],
    [
      'The smallest unit Kubernetes runs: one (or a few tightly linked) containers sharing a network address. Pods are disposable — Kubernetes replaces them freely.',
      'Kubernetes ki sabse chhoti unit: ek (ya kuch kas ke jude) containers jo ek network address share karte hain. Pods disposable hain — Kubernetes inhe aaram se badal deta hai.',
    ],
    undefined,
    { related: ['kubernetes', 'container'], more: PREP.pod },
  ),
  g(
    'container',
    'Container',
    ['container', 'containers', 'container image', 'Docker image', 'Docker'],
    [
      'A packaged app together with everything it needs to run (runtime, libraries, config defaults), so it runs the same way on any machine. An image is the package; a container is a running copy of it.',
      'Ek packaged app, chalne ke liye zaroori sab kuch ke saath (runtime, libraries, config defaults), taaki har machine pe ek jaisa chale. Image package hai; container uski chalti hui copy.',
    ],
    ['A shipping container: the same box fits any ship, train or truck.', 'Shipping container: wahi dabba kisi bhi jahaz, train ya truck pe fit.'],
  ),
  g(
    'kubelet',
    'Kubelet',
    ['kubelet'],
    [
      'The Kubernetes agent on every machine that starts containers, runs their health probes and restarts them when they fail.',
      'Har machine pe Kubernetes ka agent jo containers start karta hai, unke health probes chalata hai aur fail hone pe restart karta hai.',
    ],
  ),
  g(
    'crashloop',
    'CrashLoopBackOff',
    ['CrashLoopBackOff'],
    [
      'Not an error by itself: Kubernetes is restarting a container that keeps crashing and waits longer before each try (10 s, 20 s, 40 s… up to 5 minutes). The real error is in the exit reason and `kubectl logs --previous`.',
      'Apne aap mein error nahi: Kubernetes baar-baar crash hote container ko restart kar raha hai aur har koshish se pehle zyaada wait karta hai (10 s, 20 s, 40 s… 5 minute tak). Asli error exit reason aur `kubectl logs --previous` mein hai.',
    ],
    undefined,
    { related: ['oomkilled', 'probes'], more: PREP.pod },
  ),
  g(
    'oomkilled',
    'OOMKilled',
    ['OOMKilled', 'OOMKill', 'OOMKills', 'out of memory'],
    [
      'The container used more memory than its limit, so the system killed it (exit code 137). Either the limit is too low or the app has a memory leak.',
      'Container ne apni limit se zyaada memory use ki, to system ne use maar diya (exit code 137). Ya to limit bahut kam hai ya app mein memory leak hai.',
    ],
    ['Packing more into a suitcase than the airline allows — it is simply not allowed on board.', 'Suitcase mein airline ki limit se zyaada saamaan — use plane pe chadhne hi nahi diya jaata.'],
    { related: ['requests-limits', 'memory-leak'], more: PREP.pod },
  ),
  g(
    'memory-leak',
    'Memory leak',
    ['memory leak', 'memory leaks'],
    [
      'A bug where a program keeps memory it no longer needs, so its memory use grows until it slows down or is killed.',
      'Ek bug jisme program aisi memory pakde rehta hai jo ab zaroori nahi, to memory use badhta jaata hai jab tak woh slow na ho ya maara na jaaye.',
    ],
    ['A tap that drips all night — a little at a time, until the tank is empty.', 'Raat bhar tapakta nal — thoda-thoda, jab tak tanki khaali na ho.'],
  ),
  g(
    'probes',
    'Liveness, readiness and startup probes',
    ['liveness probe', 'liveness probes', 'readiness probe', 'readiness probes', 'startup probe', 'startup probes', 'startupProbe', 'livenessProbe', 'readinessProbe'],
    [
      'Health checks Kubernetes runs on a container. **Readiness** decides whether it gets traffic (failing removes it from the Service, no restart). **Liveness** decides whether it is stuck (failing restarts it). **Startup** gives slow apps time to boot before the others begin.',
      'Kubernetes container pe chalne wale health checks. **Readiness** tay karta hai traffic milega ya nahi (fail hone pe Service se hataya, restart nahi). **Liveness** tay karta hai atka hai ya nahi (fail hone pe restart). **Startup** slow apps ko boot hone ka time deta hai, baaki shuru hone se pehle.',
    ],
    ['Readiness: “are you free to take a table?” Liveness: “are you conscious?”', 'Readiness: “kya tum table le sakte ho?” Liveness: “kya tum hosh mein ho?”'],
    { related: ['health-check', 'kubelet'], more: PREP.probes },
  ),
  g(
    'configmap',
    'ConfigMap / Secret',
    ['ConfigMap', 'ConfigMaps', 'Kubernetes Secret', 'Kubernetes Secrets'],
    [
      'Kubernetes objects that hold configuration (ConfigMap) and passwords or keys (Secret) separately from the container image, and inject them as environment variables or files.',
      'Kubernetes objects jo configuration (ConfigMap) aur passwords ya keys (Secret) container image se alag rakhte hain, aur unhe environment variables ya files ki tarah dete hain.',
    ],
  ),
  g(
    'requests-limits',
    'Resource requests and limits',
    ['requests and limits', 'resource limits', 'memory limit', 'memory limits', 'CPU limit'],
    [
      '**Requests** are what a container is guaranteed (used to place it on a machine); **limits** are the most it may use. Going over the memory limit gets it OOMKilled; going over the CPU limit slows it down.',
      '**Requests** woh hai jo container ko guaranteed milta hai (machine chunne ke liye); **limits** zyaada se zyaada kitna use kar sakta hai. Memory limit paar kare to OOMKilled; CPU limit paar kare to slow.',
    ],
    undefined,
    { related: ['oomkilled', 'cpu-throttling'] },
  ),
  g(
    'signals',
    'SIGTERM / SIGKILL',
    ['SIGTERM', 'SIGKILL'],
    [
      '**SIGTERM** politely asks a process to stop — it can finish its work and exit cleanly. **SIGKILL** stops it immediately with no chance to clean up (exit code 137).',
      '**SIGTERM** process ko aaram se rukne ko kehta hai — woh kaam poora karke saaf exit kar sakta hai. **SIGKILL** use turant rok deta hai, saaf karne ka mauka nahi (exit code 137).',
    ],
    ['“Please finish your meal, we are closing” versus switching off the lights immediately.', '“Khaana khatam kar lijiye, hum band kar rahe hain” vs turant batti bujha dena.'],
  ),
  g(
    'rollback',
    'Rollback',
    ['rollback', 'roll back', 'rolled back', 'rolling back', 'rollbacks'],
    [
      'Undoing a change to get back to the last good state. **After a bad release:** going back to the previous working version — the fastest way to stop user-facing damage. **In a database transaction:** `ROLLBACK` cancels every write in the transaction, as if none of them happened.',
      'Change ko undo karke pichhli sahi state pe wapas jaana. **Kharab release ke baad:** app ke pichhle chalte version pe wapas jaana — users ka nuksaan rokne ka sabse fast tareeka. **Database transaction mein:** `ROLLBACK` transaction ke saare writes cancel kar deta hai, jaise kuch hua hi nahi.',
    ],
    ['Switching back to the old recipe the moment customers start sending plates back.', 'Customers plates lautane lagein to turant purani recipe pe wapas jaana.'],
    { related: ['canary', 'feature-flag'], more: PREP.spike },
  ),
  g(
    'rolling-update',
    'Rolling update',
    ['rolling update', 'rolling updates', 'rolling deploy', 'rolling deployment', 'rolling rollout'],
    [
      'Deploying a new version by replacing a few instances at a time, so the service never goes fully down.',
      'Naya version kuch-kuch instances badal ke deploy karna, taaki service kabhi poori band na ho.',
    ],
    ['Repainting a road one lane at a time so traffic keeps moving.', 'Sadak ko ek-ek lane karke paint karna taaki traffic chalta rahe.'],
  ),
  g(
    'canary',
    'Canary release',
    ['canary', 'canary release', 'canary releases', 'canary analysis', 'canaries'],
    [
      'Releasing a new version to a small slice of traffic first (1%, then 10%…) and watching metrics before rolling it out to everyone. **Canary analysis** compares the canary with the old version automatically.',
      'Naya version pehle traffic ke chhote hisse ko dena (1%, phir 10%…) aur sabko dene se pehle metrics dekhna. **Canary analysis** canary ko purane version se apne aap compare karta hai.',
    ],
    ['A chef serving a new dish to a few tables before putting it on the menu.', 'Chef nayi dish menu pe daalne se pehle kuch tables ko serve karta hai.'],
    { related: ['feature-flag', 'blue-green', 'rollback'] },
  ),
  g(
    'blue-green',
    'Blue-green deployment',
    ['blue-green', 'blue-green deployment', 'blue-green deployments'],
    [
      'Running the new version (green) next to the old one (blue) and switching all traffic at once — with an instant switch back if something is wrong.',
      'Naya version (green) purane (blue) ke saath chalana aur saara traffic ek saath switch karna — kuch galat ho to turant wapas switch.',
    ],
    ['Preparing a second stage behind the curtain and swapping it in between acts.', 'Parde ke peeche doosra stage taiyaar karke acts ke beech badal dena.'],
  ),
  g(
    'feature-flag',
    'Feature flag',
    ['feature flag', 'feature flags', 'kill switch', 'flag'],
    [
      'A switch in the code that turns a feature on or off — for everyone or for some users — without deploying again. It separates deploying code from releasing a feature.',
      'Code mein ek switch jo feature ko on ya off karta hai — sabke liye ya kuch users ke liye — bina dobara deploy kiye. Yeh code deploy karne ko feature release karne se alag karta hai.',
    ],
    ['A light switch installed with the wiring but left off until the room is ready.', 'Wiring ke saath laga light switch jo kamra taiyaar hone tak off rehta hai.'],
    { related: ['canary', 'rollback'] },
  ),
  g(
    'ci',
    'Continuous Integration (CI)',
    ['CI', 'continuous integration', 'CI/CD', 'CI pipeline'],
    [
      'Automatically building and testing every change (lint, type checks, tests, security scans) as soon as it is pushed, so problems are caught in minutes.',
      'Har change push hote hi use apne aap build aur test karna (lint, type checks, tests, security scans), taaki problems minutes mein pakdi jaayein.',
    ],
    ['A spell-checker that runs on every page as you write, instead of an editor reading the whole book at the end.', 'Spell-checker jo likhte waqt har page pe chalta hai, aakhir mein editor ke poori kitaab padhne ki jagah.'],
    { related: ['cd', 'pull-request', 'branch-protection'], more: PREP.cicd },
  ),
  g(
    'cd',
    'Continuous Delivery / Deployment (CD)',
    ['CD', 'continuous delivery', 'continuous deployment'],
    [
      'Automatically taking tested code to staging and production. In **continuous delivery** a person approves the production step; in **continuous deployment** it goes out automatically.',
      'Tested code ko apne aap staging aur production tak le jaana. **Continuous delivery** mein production step ko koi insaan approve karta hai; **continuous deployment** mein apne aap jaata hai.',
    ],
    undefined,
    { related: ['ci', 'artifact', 'staging'], more: PREP.cicd },
  ),
  g(
    'pull-request',
    'Pull request (PR)',
    ['pull request', 'pull requests', 'PR', 'PRs'],
    [
      'A request to merge your branch into the main code. Teammates review it and CI checks it before it is merged.',
      'Apni branch ko main code mein merge karne ki request. Merge se pehle saathi review karte hain aur CI check karta hai.',
    ],
    undefined,
    { related: ['ci', 'branch-protection'] },
  ),
  g(
    'branch-protection',
    'Branch protection',
    ['branch protection'],
    [
      'Repository rules that block merging into the main branch until required checks pass and a reviewer approves.',
      'Repository ke rules jo main branch mein merge tab tak rokte hain jab tak zaroori checks pass na hon aur reviewer approve na kare.',
    ],
  ),
  g(
    'artifact',
    'Build artifact',
    ['artifact', 'artifacts', 'immutable artifact', 'build once, deploy many'],
    [
      'The packaged output of a build (for example a versioned Docker image). Build it **once** and deploy the same artifact to staging and production, so what you tested is exactly what you ship.',
      'Build ka packaged output (jaise versioned Docker image). Ise **ek baar** build karo aur wahi artifact staging aur production mein deploy karo, taaki jo test kiya bilkul wahi ship ho.',
    ],
  ),
  g(
    'staging',
    'Staging environment',
    ['staging', 'staging environment'],
    [
      'A copy of production used for the final checks before release — same setup, test data, no real users.',
      'Production ki copy jo release se pehle aakhri checks ke liye use hoti hai — same setup, test data, asli users nahi.',
    ],
    ['A dress rehearsal before opening night.', 'Pehle show se pehle ki dress rehearsal.'],
  ),
  g(
    'smoke-test',
    'Smoke test',
    ['smoke test', 'smoke tests', 'smoke-test'],
    [
      'A quick check of the most important paths right after a deploy (can users log in, can they check out?) to catch obvious breakage.',
      'Deploy ke turant baad sabse zaroori raaston ka chhota check (kya users login kar pa rahe hain, checkout ho raha hai?) taaki saaf dikhne wali tootan pakdi jaaye.',
    ],
    ['Switching on a new appliance to see that it powers up before testing every feature.', 'Naya appliance on karke dekhna ki chalu hota hai, har feature test karne se pehle.'],
  ),
  g(
    'expand-contract',
    'Expand and contract',
    ['expand and contract', 'expand-and-contract'],
    [
      'Changing a database schema in safe steps so old and new code both work during a deploy: add the new thing → write to both → backfill → switch reads → remove the old thing later.',
      'Database schema ko safe steps mein badalna taaki deploy ke dauraan purana aur naya code dono chalein: nayi cheez jodo → dono mein likho → backfill → reads switch → purani cheez baad mein hatao.',
    ],
    ['Building a new bridge next to the old one and only demolishing the old one once all traffic uses the new.', 'Purane pul ke bagal mein naya pul banana aur purana tabhi todna jab saara traffic naye pe ho.'],
    { related: ['schema-migration', 'rollback'] },
  ),
  g(
    'iac',
    'Infrastructure as code',
    ['infrastructure as code', 'Terraform'],
    [
      'Defining servers, networks and databases in code files (Terraform, CloudFormation) so environments are reproducible, reviewed and versioned like any other code.',
      'Servers, networks aur databases ko code files mein define karna (Terraform, CloudFormation) taaki environments doosre code ki tarah reproducible, reviewed aur versioned hon.',
    ],
  ),
  g(
    'on-call',
    'On-call',
    ['on-call', 'on call'],
    ['The engineer responsible for responding to alerts and incidents during a shift.', 'Shift ke dauraan alerts aur incidents pe response dene ka zimmedar engineer.'],
    ['The duty doctor at night in a hospital.', 'Hospital mein raat ka duty doctor.'],
  ),
  g(
    'incident-commander',
    'Incident commander',
    ['incident commander'],
    [
      'The one person who coordinates an incident — assigns tasks, decides, and keeps everyone updated — while others focus on fixing.',
      'Woh ek insaan jo incident coordinate karta hai — kaam baant-ta hai, faisle leta hai, aur sabko update rakhta hai — jabki baaki theek karne pe dhyaan dete hain.',
    ],
    ['The fire chief who directs the crew rather than holding a hose.', 'Fire chief jo khud pipe pakadne ki jagah team ko direct karta hai.'],
  ),
  g(
    'post-mortem',
    'Blameless post-mortem',
    ['post-mortem', 'post-mortems', 'postmortem', 'blameless post-mortem'],
    [
      'A written review after an incident: what happened, the impact, the root cause and the actions that prevent a repeat — focusing on systems and process, not on blaming people.',
      'Incident ke baad likha review: kya hua, asar, root cause aur dobara na hone ke actions — logon ko dosh dene ki jagah systems aur process pe dhyaan.',
    ],
    ['A pilot’s debrief after an emergency landing.', 'Emergency landing ke baad pilot ka debrief.'],
    { related: ['runbook'], more: PREP.incident },
  ),
  g(
    'runbook',
    'Runbook',
    ['runbook', 'runbooks'],
    [
      'Step-by-step instructions for handling a known alert or task, so whoever is on call can act quickly without guessing.',
      'Kisi jaane-pehchaane alert ya kaam ko sambhaalne ke step-by-step instructions, taaki jo bhi on-call ho bina andaaze ke jaldi action le sake.',
    ],
    ['The emergency card in an aircraft seat pocket.', 'Aircraft ki seat pocket mein emergency card.'],
  ),
  g(
    'blast-radius',
    'Blast radius',
    ['blast radius'],
    [
      'How many users or systems are affected when something goes wrong. Canaries, feature flags and isolated cells keep it small.',
      'Kuch galat hone pe kitne users ya systems pe asar padta hai. Canaries, feature flags aur alag cells ise chhota rakhte hain.',
    ],
  ),
  g(
    'star-method',
    'STAR method',
    ['STAR method', 'STAR format'],
    [
      'A way to answer behavioural questions: **S**ituation, **T**ask (your role), **A**ction (what you did), **R**esult (the outcome, with numbers) — ideally followed by what you learned.',
      'Behavioral sawaalon ka jawab dene ka tareeka: **S**ituation, **T**ask (aapka role), **A**ction (aapne kya kiya), **R**esult (numbers ke saath nateeja) — aur behtar ho to kya seekha.',
    ],
    undefined,
    { more: PREP.incident },
  ),

  // ───────── Observability ─────────
  g(
    'observability',
    'Observability',
    ['observability', 'observable', 'three pillars'],
    [
      'How well you can understand what a system is doing from the outside, using its **metrics**, **logs** and **traces** (the “three pillars”).',
      'System bahar se kya kar raha hai yeh kitna achha samajh sakte ho, uske **metrics**, **logs** aur **traces** (“three pillars”) se.',
    ],
    ['A car dashboard (metrics), a trip log (logs) and a GPS route history (traces).', 'Car ka dashboard (metrics), trip log (logs) aur GPS route history (traces).'],
    { related: ['distributed-tracing', 'golden-signals'], more: PREP.pillars },
  ),
  g(
    'golden-signals',
    'Golden signals (RED / USE)',
    ['golden signals', 'four golden signals', 'golden-signal', 'RED method', 'USE method'],
    [
      'The core metrics for any service: **traffic**, **errors**, **latency** and **saturation**. The **RED** method (rate, errors, duration) applies them to services; **USE** (utilisation, saturation, errors) to resources such as CPU and disks.',
      'Har service ke mukhya metrics: **traffic**, **errors**, **latency** aur **saturation**. **RED** method (rate, errors, duration) inhe services pe lagata hai; **USE** (utilisation, saturation, errors) CPU aur disk jaise resources pe.',
    ],
    ['A restaurant tracking customers per hour, dishes sent back, waiting time and how full the kitchen is.', 'Restaurant jo har ghante ke customers, wapas aayi dishes, wait time aur kitchen kitni bhari hai track karta hai.'],
    { related: ['percentile', 'slo'], more: PREP.metrics },
  ),
  g(
    'percentile',
    'Percentiles (p50 / p95 / p99)',
    ['percentile', 'percentiles', 'p50', 'p95', 'p99', 'p95/p99', 'p50/p95/p99'],
    [
      '**p99 = 800 ms** means 99% of requests were faster than 800 ms and 1% slower. Percentiles show the slow tail that averages hide.',
      '**p99 = 800 ms** matlab 99% requests 800 ms se fast thi aur 1% slow. Percentiles woh slow tail dikhate hain jo averages chhupa dete hain.',
    ],
    [
      'If 95 deliveries take 20 minutes and 5 take 2 hours, the average (about 25 minutes) looks fine — but the p99 (2 hours) shows the customers who are furious.',
      'Agar 95 deliveries 20 minute leti hain aur 5 do ghante, to average (lagbhag 25 minute) theek lagta hai — par p99 (do ghante) un customers ko dikhata hai jo gusse mein hain.',
    ],
    { related: ['latency', 'golden-signals'] },
  ),
  g(
    'slo',
    'SLI / SLO / SLA and error budget',
    ['SLO', 'SLOs', 'SLI', 'SLIs', 'SLA', 'SLAs', 'error budget', 'burn rate', 'burn-rate', 'SLO burn'],
    [
      'The **SLI** is what you measure (success rate). The **SLO** is your target (99.9% of requests succeed). The **SLA** is the promise to customers, with penalties. The **error budget** is the 0.1% you are allowed to fail; the **burn rate** is how fast you are using it up.',
      '**SLI** jo aap naapte ho (success rate). **SLO** aapka target (99.9% requests succeed hon). **SLA** customers se vaada, penalty ke saath. **Error budget** woh 0.1% hai jitna fail hone ki ijaazat hai; **burn rate** batata hai woh kitni tezi se khatam ho raha hai.',
    ],
    ['A pizza chain promising delivery in 30 minutes (SLA), aiming internally for 25 (SLO), and measuring actual delivery times (SLI).', 'Pizza chain 30 minute mein delivery ka vaada (SLA), andar 25 ka target (SLO), aur asli delivery time naapna (SLI).'],
    { related: ['golden-signals'] },
  ),
  g(
    'metric-types',
    'Counters, gauges and histograms',
    ['histogram', 'histograms', 'gauge', 'gauges'],
    [
      'The basic metric types: a **counter** only goes up (requests served), a **gauge** goes up and down (memory in use), and a **histogram** records a distribution of values so you can compute percentiles.',
      'Basic metric types: **counter** sirf badhta hai (serve hui requests), **gauge** badhta-ghatta hai (use ho rahi memory), aur **histogram** values ka distribution record karta hai taaki percentiles nikaal sako.',
    ],
    ['A car’s odometer (counter), its speedometer (gauge), and a chart of how often you drove at each speed (histogram).', 'Car ka odometer (counter), speedometer (gauge), aur chart ki kis speed pe kitni baar chalaye (histogram).'],
  ),
  g(
    'alert-fatigue',
    'Alert fatigue',
    ['alert fatigue'],
    [
      'When there are so many noisy alerts that people start ignoring them — and miss the real one.',
      'Jab itne shor wale alerts hon ki log unhe ignore karne lagein — aur asli wala chhoot jaaye.',
    ],
    ['A car alarm that goes off every night — soon nobody looks up when it rings.', 'Car alarm jo har raat bajta hai — jaldi hi koi bajne pe dekhta bhi nahi.'],
  ),
  g(
    'synthetic',
    'Synthetic monitoring',
    ['synthetic monitoring', 'synthetic check', 'synthetic checks'],
    [
      'Scripts that act like users (log in, search, check out) every minute from outside, so you notice a broken journey even when no real user has complained yet.',
      'Scripts jo bahar se har minute users ki tarah kaam karti hain (login, search, checkout), taaki koi asli user shikayat kare usse pehle toota raasta pata chal jaaye.',
    ],
    ['A mystery shopper visiting the store every hour.', 'Mystery shopper jo har ghante store aata hai.'],
  ),
  g(
    'deploy-marker',
    'Deploy marker',
    ['deploy marker', 'deploy markers', 'deployment marker', 'deployment markers'],
    [
      'A line drawn on dashboards at the moment of each release, so a sudden change in errors or latency can be matched to the deploy that caused it.',
      'Har release ke pal pe dashboards pe kheenchi line, taaki errors ya latency ka achanak badlaav us deploy se milaaya ja sake jisne use paida kiya.',
    ],
  ),
  g(
    'mttd-mttr',
    'MTTD / MTTR',
    ['MTTD', 'MTTR', 'mean time to detect', 'mean time to recover'],
    [
      '**MTTD**: how long, on average, it takes to notice a problem. **MTTR**: how long it takes to recover. Good alerts shrink MTTD; rollbacks and feature flags shrink MTTR.',
      '**MTTD**: problem pata chalne mein average kitna time. **MTTR**: theek hone mein kitna time. Acche alerts MTTD ghataate hain; rollbacks aur feature flags MTTR ghataate hain.',
    ],
  ),
  g(
    'error-tracking',
    'Error tracking',
    ['error tracking', 'Sentry'],
    [
      'A tool (such as Sentry) that collects exceptions from your app, groups identical ones and alerts on new types — especially useful right after a release.',
      'Tool (jaise Sentry) jo app ki exceptions ikattha karta hai, ek jaisi ko group karta hai aur naye types pe alert karta hai — release ke turant baad khaas kaam ka.',
    ],
  ),
  g(
    'ttfb',
    'TTFB (time to first byte)',
    ['TTFB', 'time to first byte'],
    [
      'How long the browser waits after sending a request until the first byte of the response arrives — mostly server time plus network.',
      'Request bhejne ke baad response ka pehla byte aane tak browser kitna wait karta hai — zyaadatar server ka time plus network.',
    ],
  ),
  g(
    'profiling',
    'Profiling / flame graph',
    ['profiling', 'flame graph', 'flame graphs', 'CPU profile', 'CPU profiling'],
    [
      'Measuring where a program spends its CPU time. A **flame graph** draws it so the widest bars are the functions taking the most time.',
      'Naapna ki program ka CPU time kahan ja raha hai. **Flame graph** ise aise dikhata hai ki sabse chaudi bars woh functions hain jo sabse zyaada time le rahe hain.',
    ],
  ),
  g(
    'gc-pause',
    'Garbage-collection pause',
    ['GC pause', 'GC pauses', 'garbage collection', 'garbage-collection'],
    [
      'Moments when the runtime (JVM, Node.js) stops to clean up unused memory — requests wait during the pause, causing latency spikes.',
      'Woh pal jab runtime (JVM, Node.js) bina use ki memory saaf karne ke liye rukta hai — pause ke dauraan requests wait karti hain, latency spike aati hai.',
    ],
    ['A shop closing its doors for five minutes to sweep the floor.', 'Dukaan ka farsh saaf karne ke liye paanch minute darwaze band karna.'],
  ),
  g(
    'event-loop',
    'Event loop',
    ['event loop', 'event-loop', 'event-loop lag'],
    [
      'Node.js runs your JavaScript on one thread that picks up tasks one after another. If one task blocks it (heavy CPU work), every other request waits — that delay is event-loop lag.',
      'Node.js aapka JavaScript ek thread pe chalata hai jo kaam ek ke baad ek uthata hai. Agar ek kaam use rok de (bhaari CPU kaam), har doosri request wait karti hai — wahi der event-loop lag hai.',
    ],
    ['A single cashier: one customer who pays in coins slows down the whole queue.', 'Ek cashier: sikkon mein payment karne wala ek customer poori line slow kar deta hai.'],
  ),
  g(
    'cpu-throttling',
    'CPU throttling',
    ['CPU throttling'],
    [
      'When a container hits its CPU limit, it is slowed down instead of killed — requests get slower and health probes may time out.',
      'Jab container apni CPU limit pe pahunchta hai, use maara nahi jaata balki slow kar diya jaata hai — requests slow hoti hain aur health probes time out ho sakte hain.',
    ],
  ),
  g(
    'noisy-neighbour',
    'Noisy neighbour',
    ['noisy neighbour', 'noisy neighbor'],
    [
      'Another workload on the same machine using a lot of CPU, disk or network, slowing your service down even though nothing changed in your code.',
      'Same machine pe koi aur workload jo bahut CPU, disk ya network khaa raha hai, aapke code mein kuch badle bina aapki service ko slow kar deta hai.',
    ],
    ['A neighbour’s loud party making it impossible to work from home.', 'Padosi ki shor wali party jisse ghar se kaam karna namumkin.'],
  ),

  // ───────── Quality ─────────
  g(
    'shift-left',
    'Shift left',
    ['shift left', 'shift-left'],
    [
      'Finding problems earlier in the process — while writing and reviewing code — instead of at the end in QA or in production, where they cost much more to fix.',
      'Problems ko process mein pehle dhoondhna — code likhte aur review karte waqt — aakhir mein QA ya production mein nahi, jahan theek karna kahin mehnga padta hai.',
    ],
    ['Tasting the dish while cooking rather than waiting for a customer’s complaint.', 'Customer ki shikayat ka wait karne ki jagah pakaate waqt dish chakhna.'],
    { related: ['test-pyramid', 'ci'], more: PREP.quality },
  ),
  g(
    'test-pyramid',
    'Test pyramid',
    ['test pyramid', 'testing pyramid', 'unit test', 'unit tests', 'integration test', 'integration tests', 'end-to-end test', 'end-to-end tests', 'E2E test', 'E2E tests'],
    [
      'A guide for balancing tests: many fast **unit tests** (one function), fewer **integration tests** (code with a real database or API), and a few slow **end-to-end tests** (a full user journey).',
      'Tests ka santulan: bahut saare fast **unit tests** (ek function), kam **integration tests** (asli database ya API ke saath code), aur kuch slow **end-to-end tests** (poori user journey).',
    ],
    ['Checking each ingredient (unit), then each dish (integration), then one full meal served to a guest (end-to-end).', 'Har ingredient check karna (unit), phir har dish (integration), phir mehmaan ko ek poora khaana (end-to-end).'],
    { related: ['contract-test', 'regression-test'], more: PREP.quality },
  ),
  g(
    'tdd',
    'Test-driven development (TDD)',
    ['TDD', 'test-driven development'],
    [
      'Writing a failing test first, then the code that makes it pass, then tidying up — in small cycles.',
      'Pehle fail hone wala test likhna, phir use pass karwane wala code, phir saaf-safai — chhote cycles mein.',
    ],
  ),
  g(
    'regression-test',
    'Regression test',
    ['regression test', 'regression tests'],
    [
      'A test added when you fix a bug, so the same bug can never come back unnoticed.',
      'Bug theek karte waqt joda gaya test, taaki wahi bug chupke se kabhi wapas na aaye.',
    ],
  ),
  g(
    'flaky-test',
    'Flaky test',
    ['flaky test', 'flaky tests'],
    [
      'A test that sometimes passes and sometimes fails without any code change — usually because of timing, shared state or external services. It destroys trust in CI.',
      'Aisa test jo bina code badle kabhi pass aur kabhi fail hota hai — aam taur pe timing, shared state ya external services ki wajah se. Yeh CI pe bharosa khatam kar deta hai.',
    ],
    ['A smoke alarm that goes off randomly — eventually people ignore it.', 'Smoke alarm jo kabhi bhi baj jaata hai — aakhir mein log ignore karne lagte hain.'],
  ),
  g(
    'test-coverage',
    'Test coverage',
    ['test coverage', 'code coverage'],
    [
      'The share of code that runs during tests. Useful as a guide to find untested areas — but 100% coverage does not mean the tests check the right things.',
      'Code ka kitna hissa tests ke dauraan chalta hai. Bina test wale hisse dhoondhne ke liye kaam ka guide — par 100% coverage ka matlab yeh nahi ki tests sahi cheezein check karte hain.',
    ],
  ),
  g(
    'static-analysis',
    'Static analysis / lint',
    ['static analysis', 'lint', 'linter', 'linters', 'linting'],
    [
      'Tools that read your code without running it to catch bugs, risky patterns and style problems — linters, type checkers and security scanners.',
      'Tools jo code ko chalaye bina padh ke bugs, risky patterns aur style problems pakadte hain — linters, type checkers aur security scanners.',
    ],
  ),
  g(
    'dora',
    'DORA metrics',
    ['DORA', 'DORA metrics', 'change failure rate'],
    [
      'Four measures of delivery performance: deployment frequency, lead time for changes, **change failure rate** (how many releases cause problems) and time to restore service.',
      'Delivery performance ke chaar naap: deployment frequency, changes ka lead time, **change failure rate** (kitne releases problem laate hain) aur service wapas laane ka time.',
    ],
  ),
];
