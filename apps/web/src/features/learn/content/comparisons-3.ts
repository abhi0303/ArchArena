import { bi } from '../dsl';
import type { Comparison } from '../types';

export const comparisons3: Comparison[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'media-server-vs-transcoder-vs-cdn',
    types: ['media-server', 'transcoder', 'cdn'],
    confusion: bi(
      'All three deal with video, so any video feature (“we need a video server”) gets drawn as one of them — often the wrong one.',
      'Teeno video se jude hain, isliye koi bhi video feature (“video server chahiye”) inme se ek bana diya jaata hai — aksar galat wala.',
    ),
    common: bi('Each moves or prepares audio/video so people can watch or talk smoothly.', 'Har ek audio/video ko move ya taiyaar karta hai taaki log smoothly dekh ya baat kar sakein.'),
    story: {
      setting: bi('A school that runs live online classes and also publishes recorded lectures.', 'Ek school jo live online classes chalata hai aur recorded lectures bhi publish karta hai.'),
      roles: [
        { type: 'media-server', icon: 'Mic', role: bi('The live classroom switchboard: forwards each student’s and the teacher’s camera to everyone else, instantly, both ways.', 'Live classroom switchboard: har student aur teacher ka camera turant, dono taraf, sabko forward karta hai.') },
        { type: 'transcoder', icon: 'Factory', role: bi('The editing room that converts each recorded lecture into small, medium and HD versions after class.', 'Editing room jo class ke baad har recorded lecture ko small, medium aur HD versions mein badalta hai.') },
        { type: 'cdn', icon: 'Truck', role: bi('The delivery network that takes those prepared videos to students in every city so they stream without buffering.', 'Delivery network jo un taiyaar videos ko har shehar ke students tak le jaata hai taaki bina buffering stream hon.') },
      ],
    },
    rows: [
      { feature: 'Timing', values: ['Live, milliseconds', bi('Offline, after upload (minutes)', 'Offline, upload ke baad (minutes)'), 'On demand, cached'] },
      { feature: bi('Direction', 'Disha'), values: [bi('Two-way (everyone sends and receives)', 'Do-taraf (sab bhejte aur paate hain)'), bi('One file in, many files out', 'Ek file andar, kai files bahar'), bi('One-way to viewers', 'Viewers tak ek-taraf')] },
      { feature: 'Scale pattern', values: [bi('Tens to hundreds per room', 'Har room mein das se sau'), bi('Many parallel jobs', 'Kai parallel jobs'), bi('Millions of viewers', 'Lakhon viewers')] },
      { feature: bi('Typical product', 'Aam product'), values: ['Video calls, classes, game voice chat', 'Video uploads (YouTube-style)', 'Streaming playback, images, downloads'] },
    ],
    pickWhen: [
      { type: 'media-server', points: [bi('People talk to each other live with audio/video.', 'Log ek doosre se live audio/video mein baat karte hain.')] },
      { type: 'transcoder', points: [bi('Uploaded media must play on every device and network.', 'Upload hua media har device aur network par chalna chahiye.')] },
      { type: 'cdn', points: [bi('Many viewers watch prepared media.', 'Kai viewers taiyaar media dekhte hain.')] },
    ],
    rule: bi('Talking live → media server. Preparing uploads → transcoder. Delivering to many viewers → CDN. A video platform with live calls and uploads uses all three.', 'Live baat → media server. Uploads taiyaar karna → transcoder. Kai viewers tak pahunchana → CDN. Live calls aur uploads wala video platform teeno use karta hai.'),
    quiz: [
      { scenario: bi('A 12-person team video meeting.', '12 logon ki team video meeting.'), answer: 'media-server', why: bi('Live two-way audio/video between participants.', 'Participants ke beech live do-taraf audio/video.') },
      { scenario: bi('A creator uploads a 4K video that must also play on 3G phones.', 'Ek creator 4K video upload karta hai jo 3G phones par bhi chalna chahiye.'), answer: 'transcoder', why: bi('Converting into lower renditions is transcoding.', 'Kam renditions mein badalna transcoding hai.') },
      { scenario: bi('A movie trailer is watched 20 million times in a day worldwide.', 'Ek movie trailer duniya bhar mein din mein 2 crore baar dekha jaata hai.'), answer: 'cdn', why: bi('Massive one-way delivery is the CDN’s job.', 'Bahut badi ek-taraf delivery CDN ka kaam hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'geo-index-vs-search-index',
    types: ['geo-index', 'search-index'],
    confusion: bi(
      'Both are “indexes for searching”, and searches like “pizza near me” need both words and location, so people expect one index to do everything.',
      'Dono “search ke liye indexes” hain, aur “pizza near me” jaisi searches ko shabd aur location dono chahiye, isliye log ek index se sab kuch ki ummeed karte hain.',
    ),
    common: bi('Both are pre-built shortcuts that avoid scanning all data, rebuilt from a source of truth.', 'Dono pehle se bane shortcuts hain jo saara data scan karne se bachate hain, source of truth se dobara bante hain.'),
    story: {
      setting: bi('Finding a place to eat in a new city.', 'Naye shehar mein khaane ki jagah dhundhna.'),
      roles: [
        { type: 'geo-index', icon: 'Map', role: bi('The city map divided into neighbourhoods: “show me everything within 1 km”.', 'Mohallon mein bata shehar ka map: “1 km ke andar sab dikhao”.') },
        { type: 'search-index', icon: 'BookOpen', role: bi('The food guidebook’s index: “every place that mentions ‘dosa’”.', 'Food guidebook ka index: “har woh jagah jo ‘dosa’ ka zikr karti hai”.') },
      ],
    },
    rows: [
      { feature: bi('Organised by', 'Kis se organised'), values: ['Location cells (geohash, S2, H3)', bi('Words (inverted index)', 'Shabd (inverted index)')] },
      { feature: bi('Typical query', 'Aam query'), values: [bi('Nearest / within radius / in polygon', 'Sabse paas / radius ke andar / polygon mein'), bi('Contains these words, ranked', 'In shabdon wale, ranked')] },
      { feature: 'Update pattern', values: [bi('Very frequent (moving drivers)', 'Bahut baar (chalte drivers)'), bi('When content changes', 'Content badalne par')] },
    ],
    pickWhen: [
      { type: 'geo-index', points: [bi('The question is about distance or area.', 'Sawaal doori ya area ka hai.')] },
      { type: 'search-index', points: [bi('The question is about words and relevance.', 'Sawaal shabdon aur relevance ka hai.')] },
    ],
    rule: bi('“Near” → geo index. “Matching words” → search index. “Pizza near me” → filter by geo, then rank by text (many search engines support both).', '“Paas” → geo index. “Milte shabd” → search index. “Pizza near me” → geo se filter, phir text se rank (kai search engines dono support karte hain).'),
    quiz: [
      { scenario: bi('Find available drivers within 2 km of a rider, updated every 4 seconds.', 'Rider ke 2 km ke andar available drivers dhundho, har 4 second update.'), answer: 'geo-index', why: bi('Proximity over constantly moving points.', 'Lagatar chalte points par nazdeeki.') },
      { scenario: bi('Search restaurant menus for “paneer tikka”.', 'Restaurant menus mein “paneer tikka” search karo.'), answer: 'search-index', why: bi('Matching words in text is a search index.', 'Text mein shabd milana search index hai.') },
      { scenario: bi('Show all warehouses inside a delivery zone polygon.', 'Delivery zone polygon ke andar saare warehouses dikhao.'), answer: 'geo-index', why: bi('Spatial containment is a geo query.', 'Spatial containment geo query hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'ml-service-vs-feature-store-vs-batch-processor',
    types: ['ml-service', 'feature-store', 'batch-processor'],
    confusion: bi(
      'They all appear in “the ML box” of a diagram and all touch models and data, so beginners draw one “AI” component for everything.',
      'Sab diagram ke “ML box” mein dikhte hain aur sab models aur data ko chhoote hain, isliye beginners har cheez ke liye ek “AI” component bana dete hain.',
    ),
    common: bi('Together they turn data into predictions: prepare inputs, train models, serve answers.', 'Saath milkar yeh data ko predictions mein badalte hain: inputs taiyaar karo, models train karo, jawab serve karo.'),
    story: {
      setting: bi('A cooking school that also runs a restaurant.', 'Ek cooking school jo restaurant bhi chalata hai.'),
      roles: [
        { type: 'batch-processor', icon: 'GraduationCap', role: bi('The training sessions where chefs learn from thousands of past dishes (model training, overnight).', 'Training sessions jahan chefs hazaaron purani dishes se seekhte hain (model training, raat bhar).') },
        { type: 'feature-store', icon: 'Package', role: bi('The prep kitchen with labelled, ready ingredients — the same ones used in class and on busy nights.', 'Prep kitchen jismein label lage, taiyaar ingredients — wahi jo class aur busy raaton mein use hote hain.') },
        { type: 'ml-service', icon: 'ChefHat', role: bi('The trained chef at the pass, turning each order into a dish in seconds (live predictions).', 'Pass par trained chef, har order ko seconds mein dish banata hai (live predictions).') },
      ],
    },
    rows: [
      { feature: bi('Job', 'Kaam'), values: [bi('Answer live prediction requests', 'Live prediction requests ka jawab'), bi('Store features for training and serving', 'Training aur serving ke liye features store'), bi('Train models / compute features in bulk', 'Models train / features bulk mein compute')] },
      { feature: bi('Speed that matters', 'Kaunsi speed zaroori'), values: [bi('Milliseconds per request', 'Har request milliseconds'), 'Milliseconds lookups (online)', bi('Throughput over hours', 'Ghanton ka throughput')] },
      { feature: bi('Runs', 'Kab chalta hai'), values: [bi('Always, behind an API', 'Hamesha, API ke peeche'), bi('Always (online) + history (offline)', 'Hamesha (online) + history (offline)'), bi('On a schedule', 'Schedule par')] },
    ],
    pickWhen: [
      { type: 'ml-service', points: [bi('A live request needs a model’s answer now.', 'Live request ko abhi model ka jawab chahiye.')] },
      { type: 'feature-store', points: [bi('Several models share features; training and serving must match.', 'Kai models features share karte hain; training aur serving mel khaane chahiye.')] },
      { type: 'batch-processor', points: [bi('You retrain models or recompute features over lots of history.', 'Bahut history par models retrain ya features dobara compute karte ho.')] },
    ],
    rule: bi('Batch processor learns (offline), feature store remembers the ingredients, ML service answers (online).', 'Batch processor seekhta hai (offline), feature store ingredients yaad rakhta hai, ML service jawab deti hai (online).'),
    quiz: [
      { scenario: bi('Score each payment for fraud within 30 ms at checkout.', 'Checkout par har payment ko 30 ms mein fraud ke liye score karo.'), answer: 'ml-service', why: bi('Live inference behind an API.', 'API ke peeche live inference.') },
      { scenario: bi('Retrain the recommendation model every night on yesterday’s data.', 'Har raat kal ke data par recommendation model retrain karo.'), answer: 'batch-processor', why: bi('Heavy periodic training is a batch job.', 'Bhaari periodic training batch job hai.') },
      { scenario: bi('Both fraud and recommendations need “orders in the last 7 days” per user, consistent everywhere.', 'Fraud aur recommendations dono ko har user ke “pichhle 7 din ke orders” chahiye, har jagah consistent.'), answer: 'feature-store', why: bi('Shared, consistent features for training and serving.', 'Training aur serving ke liye shared, consistent features.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'graph-db-vs-sql',
    types: ['graph-db', 'sql-db'],
    confusion: bi(
      'SQL databases also store relationships (foreign keys), so it is not obvious why a separate graph database would ever be needed.',
      'SQL databases bhi relationships rakhte hain (foreign keys), isliye yeh saaf nahi ki alag graph database ki kabhi zaroorat kyun padegi.',
    ),
    common: bi('Both can model entities and relationships and both are durable sources of truth.', 'Dono entities aur relationships model kar sakte hain aur dono majboot sources of truth hain.'),
    story: {
      setting: bi('Planning a trip across a city.', 'Shehar mein ek safar ki planning.'),
      roles: [
        { type: 'sql-db', icon: 'ClipboardList', role: bi('A timetable book listing every station and train in tables — perfect for “when does train 12 leave?”', 'Timetable book jo har station aur train ko tables mein list karti hai — “train 12 kab chhootti hai?” ke liye perfect.') },
        { type: 'graph-db', icon: 'Map', role: bi('The metro map — perfect for “how do I get from A to F with the fewest changes?”', 'Metro map — “A se F tak sabse kam badlaav mein kaise jaaun?” ke liye perfect.') },
      ],
    },
    rows: [
      { feature: bi('Relationships stored as', 'Relationships kaise store'), values: [bi('Direct pointers between nodes', 'Nodes ke beech seedhe pointers'), bi('Foreign keys resolved by joins', 'Joins se resolve hone wali foreign keys')] },
      { feature: 'Multi-hop queries (3+ hops)', values: [bi('Fast — cost grows with the neighbourhood', 'Tez — kharch padosi ke saath badhta hai'), bi('Slow — each hop is another join', 'Slow — har hop ek aur join')] },
      { feature: bi('Aggregates and reports', 'Aggregates aur reports'), values: [bi('Weaker', 'Kamzor'), bi('Strong', 'Majboot')] },
      { feature: bi('Ecosystem and familiarity', 'Ecosystem aur jaan-pehchaan'), values: ['Specialised', bi('Everywhere', 'Har jagah')] },
    ],
    pickWhen: [
      { type: 'graph-db', points: [bi('Questions follow relationships several hops deep.', 'Sawaal kai hop gehre relationships follow karte hain.')] },
      { type: 'sql-db', points: [bi('Records with a few relationships, transactions and reports.', 'Kuch relationships wale records, transactions aur reports.')] },
    ],
    rule: bi('If your important questions sound like “friends of friends” or “paths between”, use a graph DB. Otherwise SQL.', 'Agar aapke important sawaal “doston ke dost” ya “beech ke raaste” jaise lagte hain, graph DB use karo. Warna SQL.'),
    quiz: [
      { scenario: bi('Suggest “people you may know” from friends of friends.', 'Doston ke doston se “people you may know” suggest karo.'), answer: 'graph-db', why: bi('Multi-hop traversal is a graph’s strength.', 'Multi-hop traversal graph ki taakat hai.') },
      { scenario: bi('Monthly revenue per product category.', 'Har product category ka monthly revenue.'), answer: 'sql-db', why: bi('Aggregation over records is SQL territory.', 'Records par aggregation SQL ka ilaaka hai.') },
      { scenario: bi('Find all accounts linked within three hops to a known fraudster via shared devices.', 'Shared devices ke through ek jaane-pehchaane fraudster se teen hop ke andar jude saare accounts dhundho.'), answer: 'graph-db', why: bi('Following links across hops is a graph traversal.', 'Hops ke aar-paar links follow karna graph traversal hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'id-generator-vs-auto-increment',
    types: ['id-generator', 'sql-db'],
    confusion: bi(
      'Every database already gives you ids with auto-increment, so a separate ID generator seems unnecessary — until data is spread over many machines.',
      'Har database auto-increment se pehle hi ids deta hai, isliye alag ID generator bekaar lagta hai — jab tak data kai machines par na phaile.',
    ),
    common: bi('Both produce unique identifiers for new records.', 'Dono naye records ke liye unique identifiers banate hain.'),
    story: {
      setting: bi('Issuing token numbers to customers.', 'Customers ko token numbers dena.'),
      roles: [
        { type: 'sql-db', icon: 'Ticket', role: bi('One token machine at one counter: perfect numbering, but everyone must queue at that single machine.', 'Ek counter par ek token machine: perfect numbering, lekin sabko us ek machine par line lagani padti hai.') },
        { type: 'id-generator', icon: 'Hash', role: bi('Every branch prints tokens like “date-branch-number”: no queue, never a clash, roughly in time order.', 'Har branch “date-branch-number” jaise tokens chhaapti hai: na line, na takraav, lagbhag time order mein.') },
      ],
    },
    rows: [
      { feature: bi('Works across shards/regions', 'Shards/regions mein kaam'), values: [bi('Yes', 'Haan'), bi('No (one database only)', 'Nahi (sirf ek database)')] },
      { feature: 'Bottleneck', values: [bi('None — generated locally', 'Koi nahi — locally banta hai'), bi('The single database', 'Akela database')] },
      { feature: 'Ordering', values: [bi('Roughly by time', 'Lagbhag time se'), bi('Strictly increasing', 'Sakhti se badhta hua')] },
      { feature: bi('Simplicity', 'Saadgi'), values: ['Extra component', 'Built in'] },
    ],
    pickWhen: [
      { type: 'id-generator', points: [bi('Data is sharded or written in several regions.', 'Data sharded hai ya kai regions mein likha jaata hai.'), bi('Very high insert rates.', 'Bahut tez insert rates.')] },
      { type: 'sql-db', points: [bi('One database handles all inserts comfortably.', 'Ek database saare inserts aaram se sambhalta hai.')] },
    ],
    rule: bi('One database → auto-increment is fine. Many shards or regions → use an ID generator (Snowflake-style).', 'Ek database → auto-increment theek. Kai shards ya regions → ID generator (Snowflake-style) use karo.'),
    quiz: [
      { scenario: bi('Orders are written to 16 shards in two regions.', 'Orders do regions ke 16 shards mein likhe jaate hain.'), answer: 'id-generator', why: bi('Separate auto-increments would collide.', 'Alag auto-increments takrayenge.') },
      { scenario: bi('A small internal app with one PostgreSQL database.', 'Ek PostgreSQL database wala chhota internal app.'), answer: 'sql-db', why: bi('Built-in sequences are simplest.', 'Built-in sequences sabse simple hain.') },
      { scenario: bi('Chat messages need unique, time-sortable ids at millions per second.', 'Chat messages ko har second lakhon ki rate par unique, time-sortable ids chahiye.'), answer: 'id-generator', why: bi('Time-ordered ids generated without coordination.', 'Bina coordination bani time-ordered ids.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'code-sandbox-vs-background-worker',
    types: ['code-sandbox', 'background-worker'],
    confusion: bi(
      'Both pick jobs from a queue and run code in the background, so a code-execution platform might seem to need only “workers”.',
      'Dono queue se jobs uthate aur background mein code chalate hain, isliye code-execution platform ko sirf “workers” chahiye lag sakte hain.',
    ),
    common: bi('Both execute queued jobs asynchronously with retries and scaling.', 'Dono queued jobs ko retries aur scaling ke saath asynchronously chalate hain.'),
    story: {
      setting: bi('A science lab at a university.', 'University ki science lab.'),
      roles: [
        { type: 'background-worker', icon: 'Wrench', role: bi('Lab staff running the university’s own standard tests — trusted procedures in the normal lab.', 'Lab staff jo university ke apne standard tests chalata hai — normal lab mein bharosemand procedures.') },
        { type: 'code-sandbox', icon: 'Lock', role: bi('The sealed safety chamber used when visitors bring unknown substances: nothing gets in or out, and it is cleaned after each use.', 'Seal safety chamber jab visitors anjaan padarth laate hain: na kuch andar na bahar, aur har use ke baad saaf.') },
      ],
    },
    rows: [
      { feature: bi('Whose code', 'Kiska code'), values: ['Untrusted (users, customers)', bi('Yours, trusted', 'Aapka, trusted')] },
      { feature: 'Isolation', values: [bi('Strong: container / micro-VM, no network', 'Majboot: container / micro-VM, bina network'), 'Normal process'] },
      { feature: 'Limits', values: [bi('Strict CPU, memory, time per run', 'Har run par sakht CPU, memory, time'), bi('Usual service limits', 'Aam service limits')] },
      { feature: bi('Access to your systems', 'Aapke systems tak access'), values: [bi('None', 'Koi nahi'), 'Databases, APIs, secrets'] },
    ],
    pickWhen: [
      { type: 'code-sandbox', points: [bi('Running code you did not write.', 'Woh code chalana jo aapne nahi likha.')] },
      { type: 'background-worker', points: [bi('Running your own jobs that need your databases and APIs.', 'Apne jobs chalana jinhe aapke databases aur APIs chahiye.')] },
    ],
    rule: bi('Your code → worker. Strangers’ code → sandbox. Never the other way round.', 'Aapka code → worker. Anjaanon ka code → sandbox. Kabhi ulta nahi.'),
    quiz: [
      { scenario: bi('Run contestants’ C++ submissions against hidden test cases.', 'Contestants ke C++ submissions ko hidden test cases par chalao.'), answer: 'code-sandbox', why: bi('Untrusted code needs isolation and limits.', 'Untrusted code ko isolation aur limits chahiye.') },
      { scenario: bi('Generate PDF invoices for completed orders.', 'Poore hue orders ke PDF invoices banao.'), answer: 'background-worker', why: bi('Your trusted job using your data.', 'Aapke data use karne wala aapka trusted job.') },
      { scenario: bi('Customers upload custom scripts to transform their own data.', 'Customers apna data badalne ke liye custom scripts upload karte hain.'), answer: 'code-sandbox', why: bi('Customer-written code must be isolated from everything else.', 'Customer ka likha code baaki sab se alag hona chahiye.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'web-vs-mobile-vs-desktop-client',
    types: ['web-client', 'mobile-client', 'desktop-client'],
    confusion: bi(
      'All three show your product’s screens and call the same backend, so they look like the same box with different icons.',
      'Teeno aapke product ki screens dikhate hain aur same backend call karte hain, isliye alag icons wala ek hi box lagte hain.',
    ),
    common: bi('All are untrusted clients: they start requests, show results, and must go through your entry points.', 'Sab untrusted clients hain: requests shuru karte, results dikhate, aur aapke entry points se guzarna padta hai.'),
    story: {
      setting: bi('Three ways to visit the same bank.', 'Ek hi bank tak pahunchne ke teen tareeke.'),
      roles: [
        { type: 'web-client', icon: 'Globe', role: bi('Walking into any branch: no preparation needed, always the latest forms, but you only get help while you are there.', 'Kisi bhi branch mein jaana: koi taiyaari nahi, hamesha latest forms, lekin madad sirf wahan rehne tak.') },
        { type: 'mobile-client', icon: 'Smartphone', role: bi('The bank’s app in your pocket: it can buzz you with alerts and work in poor network, but you have to install and update it.', 'Jeb mein bank ka app: alerts se aapko buzz kar sakta hai aur kamzor network mein chal sakta hai, lekin install aur update karna padta hai.') },
        { type: 'desktop-client', icon: 'Laptop', role: bi('A trading terminal installed on your office computer: maximum power and screens, but tied to that machine.', 'Office computer par installed trading terminal: sabse zyada power aur screens, lekin us machine se bandha.') },
      ],
    },
    rows: [
      { feature: bi('Install needed', 'Install chahiye'), values: [bi('No', 'Nahi'), bi('Yes (app store)', 'Haan (app store)'), bi('Yes', 'Haan')] },
      { feature: bi('Updates reach users', 'Updates users tak'), values: [bi('Instantly on reload', 'Reload par turant'), bi('When users update', 'Jab users update karein'), bi('Auto-update, sometimes late', 'Auto-update, kabhi late')] },
      { feature: bi('Notifications when closed', 'Band hone par notifications'), values: [bi('Limited (web push)', 'Seemit (web push)'), bi('Yes (APNs/FCM)', 'Haan (APNs/FCM)'), bi('Yes (OS notifications)', 'Haan (OS notifications)')] },
      { feature: 'Device access', values: [bi('Restricted', 'Seemit'), 'Camera, GPS, sensors', bi('Full file system, GPU', 'Poora file system, GPU')] },
    ],
    pickWhen: [
      { type: 'web-client', points: [bi('Reach anyone instantly with a link.', 'Link se kisi tak bhi turant pahunchna.')] },
      { type: 'mobile-client', points: [bi('People use it on the go, need alerts or sensors.', 'Log chalte-firte use karte hain, alerts ya sensors chahiye.')] },
      { type: 'desktop-client', points: [bi('Heavy work, local files, long sessions.', 'Bhaari kaam, local files, lambe sessions.')] },
    ],
    rule: bi('Reach → web. Always with you → mobile. Maximum power → desktop. Your backend must serve all of them safely, including old app versions.', 'Pahunch → web. Hamesha saath → mobile. Sabse zyada power → desktop. Aapke backend ko sabko safely serve karna hai, purane app versions samet.'),
    quiz: [
      { scenario: bi('Drivers need background GPS and loud alerts for new trips.', 'Drivers ko background GPS aur nayi trips ke liye tez alerts chahiye.'), answer: 'mobile-client', why: bi('Background sensors and push need a mobile app.', 'Background sensors aur push ko mobile app chahiye.') },
      { scenario: bi('An internal report tool used occasionally by staff on any laptop.', 'Kisi bhi laptop par staff dwara kabhi-kabhi use hone wala internal report tool.'), answer: 'web-client', why: bi('No install and instant updates.', 'Bina install aur turant updates.') },
      { scenario: bi('A video editor that renders 4K timelines from local files.', 'Video editor jo local files se 4K timelines render karta hai.'), answer: 'desktop-client', why: bi('Heavy local processing needs a desktop app.', 'Bhaari local processing ko desktop app chahiye.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'nosql-vs-distributed-cache',
    types: ['nosql-db', 'distributed-cache'],
    confusion: bi(
      'Both store values by key, both spread over many nodes, and Redis can even persist data — so “just use Redis as the database” sounds reasonable.',
      'Dono key se values rakhte hain, dono kai nodes par phailte hain, aur Redis data persist bhi kar sakta hai — isliye “Redis ko hi database bana do” theek lagta hai.',
    ),
    common: bi('Both give fast key-based reads and writes at scale.', 'Dono scale par tez key-based reads aur writes dete hain.'),
    story: {
      setting: bi('A shop’s records.', 'Ek dukaan ke records.'),
      roles: [
        { type: 'nosql-db', icon: 'Archive', role: bi('The official ledger kept in a fire-proof safe, copied to three places: nothing written there is ever lost.', 'Fire-proof safe mein rakha official ledger, teen jagah copy: wahan likha kuch kabhi nahi khota.') },
        { type: 'distributed-cache', icon: 'ClipboardList', role: bi('The whiteboard at the counter with today’s popular prices: super quick to read, wiped every night, rewritten from the ledger.', 'Counter par aaj ke popular prices wala whiteboard: padhne mein bahut tez, har raat saaf, ledger se dobara likha.') },
      ],
    },
    rows: [
      { feature: bi('Purpose', 'Maqsad'), values: ['Source of truth', bi('Fast temporary copy', 'Tez temporary copy')] },
      { feature: bi('Data loss on failure', 'Failure par data loss'), values: [bi('Not acceptable — replicated to disk', 'Manzoor nahi — disk par replicated'), bi('Acceptable — rebuild from the source', 'Manzoor — source se dobara banao')] },
      { feature: 'Size', values: ['Terabytes+', bi('Limited by memory', 'Memory se seemit')] },
      { feature: 'Eviction', values: [bi('Never evicts your data', 'Aapka data kabhi nahi nikaalta'), bi('Evicts old keys when full', 'Bharne par purani keys nikaalta hai')] },
    ],
    pickWhen: [
      { type: 'nosql-db', points: [bi('The data must survive anything.', 'Data har haal mein bachna chahiye.')] },
      { type: 'distributed-cache', points: [bi('You want to absorb repeated reads or keep short-lived state.', 'Baar-baar ke reads sokhne ya kam umr ki state rakhni hai.')] },
    ],
    rule: bi('If losing it would be a disaster, it belongs in a database. If you could rebuild it, a cache is fine.', 'Agar khona aafat hogi, toh database mein rakho. Agar dobara bana sakte ho, cache theek hai.'),
    quiz: [
      { scenario: bi('Store user wallet balances.', 'User wallet balances store karo.'), answer: 'nosql-db', why: bi('Money must never be lost: durable database.', 'Paisa kabhi nahi khona chahiye: majboot database.') },
      { scenario: bi('Keep a “top 100 trending products” list that is recomputed every minute.', '“Top 100 trending products” list rakho jo har minute dobara banti hai.'), answer: 'distributed-cache', why: bi('Rebuildable, fast-changing, read-heavy data.', 'Dobara banne wala, tez badalne wala, bahut padha jaane wala data.') },
      { scenario: bi('Save every user’s order history for years.', 'Har user ki order history saalon tak rakho.'), answer: 'nosql-db', why: bi('Long-term records belong in a database.', 'Lambe records database mein.') },
    ],
  },
];
