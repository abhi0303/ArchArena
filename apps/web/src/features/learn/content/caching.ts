import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const cachingGuides: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'in-memory-cache',
    tagline: bi('A tiny, lightning-fast memory inside one server.', 'Ek server ke andar chhoti, bijli jaisi tez memory.'),
    intro: bi(
      'An in-memory cache keeps recently used answers in the RAM of the same process or machine that needs them — for example, the list of countries, or the result of “top 10 products” for the last 30 seconds. Reading from local memory takes microseconds, with no network at all.\n\nThe catch: each server has its own private copy. If you run ten servers, there are ten separate caches, and when one restarts its cache is empty.',
      'In-memory cache haal hi mein use hue jawab usi process ya machine ki RAM mein rakhta hai jise unki zaroorat hai — jaise countries ki list, ya pichhle 30 seconds ka “top 10 products” result. Local memory se padhna microseconds leta hai, bina kisi network ke.\n\nDikkat: har server ki apni private copy hoti hai. Das servers chalao toh das alag caches, aur ek restart ho toh uska cache khaali.',
    ),
    problem: bi(
      'Every request for the same unchanging data — the list of 200 countries, today’s exchange rates — went all the way to the database. Thousands of identical queries per second wasted database capacity and added milliseconds to every page.',
      'Har request same na badalne wale data ke liye — 200 countries ki list, aaj ke exchange rates — poora database tak jaati thi. Har second hazaaron ek jaisi queries database capacity barbaad karti aur har page mein milliseconds jodti.',
    ),
    before: scene(
      [[c('app-server', { note: 'asks every time' })], [c('sql-db', { note: 'same query ×5,000/s', state: 'bad' })]],
      [['app-server!>sql-db', 'list of countries?']],
      bi('The same question goes to the database thousands of times a second.', 'Wahi sawaal har second hazaaron baar database jaata hai.'),
    ),
    solution: bi(
      'Keep the answer in the server’s own memory for a short time (a TTL). The first request loads it from the database; the next thousands read it from RAM in microseconds. When the TTL ends, it is refreshed.',
      'Jawab ko thodi der (TTL) server ki apni memory mein rakho. Pehli request use database se laati hai; agli hazaaron RAM se microseconds mein padhti hain. TTL khatam hone par refresh hota hai.',
    ),
    after: scene(
      [[c('app-server')], [c('in-memory-cache', { state: 'focus', note: 'TTL 60 s' })], [c('sql-db', { state: 'good' })]],
      [['app-server>in-memory-cache', 'hit (µs)'], ['in-memory-cache.>sql-db', 'only on miss']],
      bi('Most reads are served from local RAM; the database is asked only when the copy expires.', 'Zyada tar reads local RAM se; database se tabhi poocha jaata hai jab copy expire ho.'),
    ),
    steps: [
      bi('The code checks its local cache for the key.', 'Code apne local cache mein key check karta hai.'),
      bi('Hit: return the value immediately.', 'Hit: value turant lautaao.'),
      bi('Miss: load from the database, store it with a TTL, then return it.', 'Miss: database se laao, TTL ke saath store karo, phir lautaao.'),
      bi('When memory is full, the least recently used items are evicted (LRU).', 'Memory bhar jaaye toh sabse kam haal mein use hue items nikaale jaate hain (LRU).'),
    ],
    analogy: {
      icons: ['NotebookPen', 'User'],
      title: bi('Sticky notes on your own desk', 'Apni desk par sticky notes'),
      text: bi(
        'You keep the phone numbers you dial most on sticky notes on your own desk. Looking at them takes a second, much faster than opening the company directory. But your colleague at the next desk has their own sticky notes — and if the cleaner throws yours away, you start over.',
        'Jo phone numbers aap sabse zyada dial karte ho, unhe apni desk par sticky notes par rakhte ho. Dekhne mein ek second lagta hai, company directory kholne se bahut tez. Lekin bagal wali desk ke colleague ke apne sticky notes hain — aur agar safai wala aapke phenk de, toh shuru se.',
      ),
    },
    perfectFit: {
      title: bi('Reference data that rarely changes', 'Reference data jo kam hi badalta hai'),
      text: bi(
        'Country lists, feature-flag values and tax rates change a few times a year but are read on almost every request. Each server keeps them in local memory for a minute — no network hop, no shared infrastructure, and slightly stale values are harmless.',
        'Country lists, feature-flag values aur tax rates saal mein kuch baar badalte hain lekin lagbhag har request par padhe jaate hain. Har server unhe ek minute local memory mein rakhta hai — na network hop, na shared infrastructure, aur thode purane values se koi nuksaan nahi.',
      ),
      why: [
        bi('Read on almost every request.', 'Lagbhag har request par padha jaata hai.'),
        bi('Small enough to fit in each server’s memory.', 'Har server ki memory mein aa jaane jitna chhota.'),
        bi('A minute of staleness is acceptable.', 'Ek minute purana hona chalta hai.'),
      ],
    },
    avoidWhen: [
      bi('All servers must see the same value immediately (a user’s session, a rate-limit counter) — use a distributed cache.', 'Saare servers ko turant same value dikhni chahiye (user ka session, rate-limit counter) — distributed cache use karo.'),
      bi('The data is large — copying it into every server wastes memory.', 'Data bada hai — har server mein copy karna memory barbaad karta hai.'),
      bi('Stale data is dangerous (stock levels during a flash sale).', 'Purana data khatarnaak hai (flash sale mein stock levels).'),
    ],
    decisions: [
      bi('TTL: how long a value may be reused.', 'TTL: value kitni der dobara use ho sakti hai.'),
      bi('Eviction policy: LRU, LFU or TTL-only.', 'Eviction policy: LRU, LFU ya sirf TTL.'),
    ],
    confusedWith: [
      { type: 'distributed-cache', difference: bi('An in-memory cache is private to one server; a distributed cache is one shared cache all servers read and write over the network.', 'In-memory cache ek server ka private hai; distributed cache ek shared cache hai jise saare servers network par padhte-likhte hain.'), compare: 'in-memory-vs-distributed-vs-cdn-cache' },
    ],
    examples: ['Caffeine (Java)', 'Guava cache', 'node-cache', 'Python functools.lru_cache'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'distributed-cache',
    tagline: bi('One shared, super-fast memory that all your servers use together.', 'Ek shared, bahut tez memory jo aapke saare servers saath mein use karte hain.'),
    intro: bi(
      'A distributed cache is a separate cluster of memory servers, such as Redis or Memcached, that every app server talks to over the network. A read takes about a millisecond — slower than local memory, but far faster than a database — and every server sees the same value.\n\nIt is used to absorb heavy read traffic (popular products, user profiles), store sessions, count things (rate limits, likes) and hold leaderboards.',
      'Distributed cache memory servers ka ek alag cluster hai, jaise Redis ya Memcached, jisse har app server network par baat karta hai. Ek read mein lagbhag ek millisecond lagta hai — local memory se slow, lekin database se bahut tez — aur har server ko same value dikhti hai.\n\nIska use bhaari read traffic sokhne (popular products, user profiles), sessions rakhne, cheezein ginne (rate limits, likes) aur leaderboards ke liye hota hai.',
    ),
    problem: bi(
      'A shopping site’s product pages read the same popular products from the database millions of times an hour. During a sale the database CPU hit 100% and pages took seconds. Local caches did not help: ten servers each had their own misses and their own stale copies.',
      'Shopping site ke product pages wahi popular products ghante mein lakhon baar database se padhte the. Sale mein database CPU 100% ho gaya aur pages ko seconds lage. Local caches ne madad nahi ki: das servers ke apne misses aur apni purani copies thi.',
    ),
    before: scene(
      [[c('app-server', { id: 'a1' }), c('app-server', { id: 'a2' }), c('app-server', { id: 'a3' })], [c('sql-db', { note: 'CPU 100%', state: 'bad' })]],
      ['a1>sql-db', 'a2>sql-db', 'a3>sql-db'],
      bi('Every server hammers the database for the same hot items.', 'Har server wahi garam items ke liye database par bhaari padta hai.'),
    ),
    solution: bi(
      'Put a shared cache cluster beside the database. Servers check the cache first (cache-aside); on a miss they read the database and store the result with a TTL. Because the cache is shared, one miss warms it for every server.',
      'Database ke bagal mein shared cache cluster rakho. Servers pehle cache check karte hain (cache-aside); miss par database padhkar result TTL ke saath store karte hain. Cache shared hai, isliye ek miss sabke liye cache garam kar deta hai.',
    ),
    after: scene(
      [[c('app-server', { id: 'a1' }), c('app-server', { id: 'a2' })], [c('distributed-cache', { state: 'focus', note: '95% hits' })], [c('sql-db', { state: 'good' })]],
      [['a1>distributed-cache', '~1 ms'], 'a2>distributed-cache', ['distributed-cache.>sql-db', 'miss only']],
      bi('All servers share one cache; the database only sees the occasional miss.', 'Saare servers ek cache share karte hain; database ko kabhi-kabhi ka miss hi dikhta hai.'),
    ),
    steps: [
      bi('The server asks the cache for a key, e.g. product:42.', 'Server cache se ek key maangta hai, jaise product:42.'),
      bi('Hit: use it. Miss: read the database and write the value into the cache with a TTL.', 'Hit: use karo. Miss: database padho aur value TTL ke saath cache mein likho.'),
      bi('When the product changes, delete or update the cached key so readers do not see old data.', 'Product badle toh cached key delete ya update karo taaki readers purana data na dekhein.'),
      bi('The cluster splits keys across nodes and keeps replicas so a node failure does not empty it.', 'Cluster keys ko nodes mein baantta hai aur replicas rakhta hai taaki ek node fail hone par khaali na ho.'),
      bi('Memory is limited, so old keys are evicted (LRU) or expire.', 'Memory limited hai, isliye purani keys nikaali (LRU) ya expire hoti hain.'),
    ],
    analogy: {
      icons: ['Users', 'ClipboardList', 'Archive'],
      title: bi('The shared whiteboard in an office', 'Office ka shared whiteboard'),
      text: bi(
        'Instead of every employee calling the records department for today’s meeting room bookings, someone writes them on a whiteboard in the corridor. Everyone reads the same board in a second; if something changes, the board is updated once.\n\nThe records department (database) still holds the official copy. If the whiteboard is wiped, you can rewrite it from the records.',
        'Har employee aaj ki meeting room bookings ke liye records department ko call kare, iske bajaye koi corridor ke whiteboard par likh deta hai. Sab ek second mein wahi board padhte hain; kuch badle toh board ek baar update hota hai.\n\nRecords department (database) ab bhi official copy rakhta hai. Whiteboard mit jaaye toh records se dobara likh sakte ho.',
      ),
    },
    perfectFit: {
      title: bi('Product details during a big sale', 'Badi sale mein product details'),
      text: bi(
        'A hundred thousand people view the same 500 deal products per minute. A shared Redis cluster serves those product details in a millisecond to every app server, cutting database reads by 95% and keeping pages fast.',
        'Ek lakh log har minute wahi 500 deal products dekhte hain. Shared Redis cluster har app server ko woh product details ek millisecond mein deta hai, database reads 95% kam karta hai aur pages tez rakhta hai.',
      ),
      why: [
        bi('Huge, repeated reads of the same keys.', 'Wahi keys ke bahut saare, baar-baar reads.'),
        bi('Many app servers must share the same values.', 'Kai app servers ko same values share karni hain.'),
        bi('The database is the bottleneck.', 'Database bottleneck hai.'),
      ],
    },
    avoidWhen: [
      bi('It is your only copy of important data — caches can lose data on restart; keep the truth in a database.', 'Yeh important data ki akeli copy hai — caches restart par data kho sakte hain; sach database mein rakho.'),
      bi('Every read is unique (no repeats) — the hit rate will be near zero.', 'Har read unique hai (dohraav nahi) — hit rate lagbhag zero hoga.'),
      bi('You forget invalidation — users see an old price after it changed.', 'Invalidation bhoolna — badalne ke baad bhi users purani price dekhte hain.'),
    ],
    decisions: [
      bi('Write policy: cache-aside, read-through, write-through or write-back.', 'Write policy: cache-aside, read-through, write-through ya write-back.'),
      bi('TTL and eviction policy.', 'TTL aur eviction policy.'),
      bi('Replication: single node, replicas or a cluster.', 'Replication: single node, replicas ya cluster.'),
    ],
    confusedWith: [
      { type: 'in-memory-cache', difference: bi('Local cache: one server, microseconds, private. Distributed cache: all servers, about a millisecond, shared.', 'Local cache: ek server, microseconds, private. Distributed cache: saare servers, lagbhag ek millisecond, shared.'), compare: 'in-memory-vs-distributed-vs-cdn-cache' },
      { type: 'nosql-db', difference: bi('They look similar (keys and values), but a database must never lose data; a cache is allowed to forget.', 'Dono ek jaise dikhte hain (keys aur values), lekin database ko data kabhi nahi khona chahiye; cache bhool sakta hai.'), compare: 'nosql-vs-distributed-cache' },
      { type: 'read-replica', difference: bi('A replica is a full copy of the database you can query any way; a cache keeps only hot answers, looked up by key.', 'Replica database ki poori copy hai jise kisi bhi tarah query kar sakte ho; cache sirf garam jawab key se rakhta hai.') },
    ],
    examples: ['Redis', 'Memcached', 'Amazon ElastiCache', 'Valkey'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'cdn-cache',
    tagline: bi('Caches whole API responses at the edge, before requests even reach your servers.', 'Poore API responses edge par cache karta hai, requests aapke servers tak pahunchne se pehle.'),
    intro: bi(
      'A CDN cache stores complete HTTP responses at edge locations close to users. When many people request the same public URL — a product page’s data, a news article, a public profile — the edge returns a saved copy without contacting your servers at all.\n\nIt works only for responses that are the same for many users and allowed to be a little old, controlled with HTTP cache headers.',
      'CDN cache poore HTTP responses ko users ke paas wali edge locations par store karta hai. Jab bahut log wahi public URL maangte hain — product page ka data, news article, public profile — edge saved copy lauta deta hai, aapke servers se baat kiye bina.\n\nYeh sirf un responses ke liye kaam karta hai jo bahut users ke liye same hon aur thode purane ho sakte hon, HTTP cache headers se control kiya jaata hai.',
    ),
    problem: bi(
      'A viral news article got two million reads in an hour. Every read travelled to the origin, which rebuilt the same JSON two million times. Even with a fast cache inside the data centre, the network and servers were saturated.',
      'Ek viral news article ko ek ghante mein bees lakh reads mile. Har read origin tak gaya, jisne wahi JSON bees lakh baar banaya. Data centre ke andar tez cache hone par bhi network aur servers bhar gaye.',
    ),
    before: scene(
      [[a('crowd', 'Users', 'Readers worldwide', { note: '2M requests' })], [c('load-balancer')], [c('app-server', { note: 'same JSON ×2M', state: 'bad' })]],
      ['crowd>load-balancer', 'load-balancer!>app-server'],
      bi('Every reader’s request travels to your servers, which repeat the same work.', 'Har reader ki request aapke servers tak jaati hai, jo wahi kaam dohraate hain.'),
    ),
    solution: bi(
      'Mark public responses as cacheable for, say, 60 seconds. The edge closest to each reader serves the saved response, and only one request per edge per minute reaches your origin.',
      'Public responses ko maan lo 60 seconds ke liye cacheable mark karo. Har reader ke sabse paas ka edge saved response deta hai, aur har edge se ek minute mein sirf ek request aapke origin tak pahunchti hai.',
    ),
    after: scene(
      [[a('crowd', 'Users', 'Readers')], [c('cdn-cache', { state: 'focus', note: 'Cache-Control: 60 s' })], [c('load-balancer')], [c('app-server', { state: 'good' })]],
      ['crowd>cdn-cache', ['cdn-cache.>load-balancer', '1 per minute'], 'load-balancer>app-server'],
      bi('The edge answers repeat requests; the origin is asked about once a minute.', 'Edge baar-baar ki requests ka jawab deta hai; origin se lagbhag minute mein ek baar poocha jaata hai.'),
    ),
    steps: [
      bi('Your API marks a response with Cache-Control: public, max-age=60.', 'Aapki API response par Cache-Control: public, max-age=60 lagati hai.'),
      bi('The first request at an edge goes to your origin; the edge saves the response.', 'Edge par pehli request origin jaati hai; edge response save kar leta hai.'),
      bi('Following requests for the same URL get the saved copy from the edge.', 'Same URL ki agli requests ko edge se saved copy milti hai.'),
      bi('After 60 seconds (or a purge), the edge fetches a fresh copy.', '60 seconds (ya purge) ke baad edge fresh copy laata hai.'),
    ],
    analogy: {
      icons: ['Newspaper', 'Store', 'Users'],
      title: bi('The newspaper stand at the station', 'Station par akhbaar ka stall'),
      text: bi(
        'Thousands of commuters want today’s paper. Instead of each one going to the printing press, the stall at every station keeps a stack and hands them out. The press delivers a new stack each morning.\n\nIt only works because everyone wants the same paper. Nobody expects the stall to print a personal letter for them.',
        'Hazaaron commuters ko aaj ka akhbaar chahiye. Har koi printing press jaaye, iske bajaye har station ka stall ek dher rakhta hai aur baantta hai. Press har subah naya dher deta hai.\n\nYeh tabhi chalta hai jab sabko same akhbaar chahiye. Koi stall se apne liye personal letter chhapne ki ummeed nahi karta.',
      ),
    },
    perfectFit: {
      title: bi('Public, read-heavy API responses', 'Public, bahut padhe jaane wale API responses'),
      text: bi(
        'A sports site’s “live score” endpoint is identical for every visitor and can be five seconds old. Caching it at the edge for five seconds turns millions of origin requests into a handful per edge.',
        'Sports site ka “live score” endpoint har visitor ke liye same hai aur paanch second purana ho sakta hai. Ise edge par paanch second cache karne se lakhon origin requests har edge par kuch hi reh jaati hain.',
      ),
      why: [
        bi('The same response for every user.', 'Har user ke liye same response.'),
        bi('A few seconds of staleness is fine.', 'Kuch seconds purana hona theek hai.'),
        bi('Readers are spread around the world.', 'Readers duniya bhar mein faile hain.'),
      ],
    },
    avoidWhen: [
      bi('The response is personal (“my cart”, “my balance”) — caching it publicly could show one user’s data to another.', 'Response personal hai (“meri cart”, “mera balance”) — public cache karne se ek user ka data doosre ko dikh sakta hai.'),
      bi('Every request must see the absolute latest data.', 'Har request ko bilkul latest data dikhna chahiye.'),
      bi('You only need to deliver static files — a plain CDN in front of object storage is simpler.', 'Sirf static files deliver karni hain — object storage ke aage simple CDN aasan hai.'),
    ],
    decisions: [
      bi('What it caches: static assets, media, API responses or all.', 'Kya cache karega: static assets, media, API responses ya sab.'),
      bi('Invalidation: TTL expiry, purge on update or versioned URLs.', 'Invalidation: TTL expiry, update par purge ya versioned URLs.'),
      bi('TTL per type of response.', 'Har tarah ke response ka TTL.'),
    ],
    confusedWith: [
      { type: 'cdn', difference: bi('In this playground the CDN delivers files from an origin like object storage; the CDN cache sits in front of your API and caches cacheable responses.', 'Is playground mein CDN object storage jaise origin se files deliver karta hai; CDN cache aapki API ke aage baithkar cacheable responses cache karta hai.'), compare: 'cdn-vs-cdn-cache' },
      { type: 'distributed-cache', difference: bi('A distributed cache lives inside your data centre and your code decides what to store; a CDN cache lives at the edge near users and follows HTTP headers.', 'Distributed cache aapke data centre ke andar rehta hai aur kya store karna hai yeh aapka code decide karta hai; CDN cache users ke paas edge par rehta hai aur HTTP headers follow karta hai.'), compare: 'in-memory-vs-distributed-vs-cdn-cache' },
    ],
    examples: ['Cloudflare cache', 'Amazon CloudFront', 'Fastly', 'Varnish'],
  },
];
