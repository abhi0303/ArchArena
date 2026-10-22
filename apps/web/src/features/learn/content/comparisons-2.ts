import { bi } from '../dsl';
import type { Comparison } from '../types';

export const comparisons2: Comparison[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'database-vs-object-storage',
    types: ['sql-db', 'object-storage'],
    confusion: bi(
      'Both “store data permanently”, and databases can technically hold files as blobs, so beginners often put images and PDFs into the database.',
      'Dono “data hamesha ke liye store karte hain”, aur databases technically files ko blobs ki tarah rakh sakte hain, isliye beginners aksar images aur PDFs database mein daal dete hain.',
    ),
    common: bi('Both are durable storage you rely on not to lose data.', 'Dono majboot storage hain jinpar data na khone ka bharosa karte ho.'),
    story: {
      setting: bi('A doctor’s clinic keeping patient information.', 'Ek doctor ka clinic jo patient ki jaankari rakhta hai.'),
      roles: [
        { type: 'sql-db', icon: 'ClipboardList', role: bi('The patient register: name, age, visit dates, prescriptions — short structured facts you can search and update (“all visits by Asha in 2025”).', 'Patient register: naam, umr, visit dates, prescriptions — chhote structured facts jinhe search aur update kar sakte ho (“2025 mein Asha ki saari visits”).') },
        { type: 'object-storage', icon: 'Archive', role: bi('The X-ray cabinet: big films stored whole, each with a label. The register just notes “X-ray in drawer 42”.', 'X-ray almari: bade films poore store, har ek par label. Register bas likhta hai “X-ray drawer 42 mein”.') },
      ],
    },
    rows: [
      { feature: bi('Stores', 'Kya store karta hai'), values: ['Structured records (rows, fields)', bi('Whole files of any size', 'Kisi bhi size ki poori files')] },
      { feature: 'Access', values: [bi('Queries, filters, joins, updates of single fields', 'Queries, filters, joins, single fields ke updates'), bi('Get / put a whole object by its key', 'Key se poora object get / put')] },
      { feature: bi('Cost per GB', 'Per GB kharcha'), values: [bi('High', 'Zyada'), bi('Very low', 'Bahut kam')] },
      { feature: bi('Pairs with', 'Kiske saath jodi'), values: [bi('Caches and replicas', 'Caches aur replicas'), bi('CDNs for delivery', 'Delivery ke liye CDNs')] },
    ],
    pickWhen: [
      { type: 'sql-db', points: [bi('You need to search, filter or update parts of the data.', 'Data ke hisson ko search, filter ya update karna hai.')] },
      { type: 'object-storage', points: [bi('You store images, videos, documents or backups.', 'Images, videos, documents ya backups rakhte ho.'), bi('Files are written once and read many times.', 'Files ek baar likhi aur kai baar padhi jaati hain.')] },
    ],
    rule: bi('Facts about things → database. The things themselves (files) → object storage, with the database keeping only the file’s key.', 'Cheezon ke baare mein facts → database. Khud cheezein (files) → object storage, database mein sirf file ki key.'),
    quiz: [
      { scenario: bi('Users upload 10 MB profile videos.', 'Users 10 MB ke profile videos upload karte hain.'), answer: 'object-storage', why: bi('Large files belong in object storage, served by a CDN.', 'Badi files object storage mein, CDN se serve.') },
      { scenario: bi('Find all users who signed up last week from Pune.', 'Pichhle hafte Pune se sign up karne wale saare users dhundho.'), answer: 'sql-db', why: bi('Filtering structured records is a database query.', 'Structured records filter karna database query hai.') },
      { scenario: bi('Keep nightly database backups for 90 days cheaply.', 'Raat ke database backups 90 din saste mein rakho.'), answer: 'object-storage', why: bi('Big files kept long-term with lifecycle rules: object storage.', 'Lifecycle rules ke saath lambe samay tak bade files: object storage.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'search-index-vs-search-service-vs-sql',
    types: ['search-index', 'search-service', 'sql-db'],
    confusion: bi(
      '“Search” can mean the API users call, the engine that matches words, or a SQL query with LIKE. All three return “results”, so they get treated as one thing.',
      '“Search” ka matlab user ki call ki gayi API, shabd milane wala engine, ya LIKE wali SQL query ho sakta hai. Teeno “results” lautaate hain, isliye ek hi cheez maan liye jaate hain.',
    ),
    common: bi('All three help users find data; in a good design they work together.', 'Teeno users ko data dhundhne mein madad karte hain; achhe design mein saath kaam karte hain.'),
    story: {
      setting: bi('A big bookshop.', 'Ek badi kitaabon ki dukaan.'),
      roles: [
        { type: 'sql-db', icon: 'Warehouse', role: bi('The stock room ledger: the official record of every book, price and quantity.', 'Stock room ledger: har book, price aur quantity ka official record.') },
        { type: 'search-index', icon: 'BookOpen', role: bi('The giant index of words → books, prepared in advance from the ledger so any word leads straight to the right shelves.', 'Shabd → books ka bada index, ledger se pehle se taiyaar, taaki koi bhi shabd seedha sahi shelves tak le jaaye.') },
        { type: 'search-service', icon: 'User', role: bi('The helpful assistant who understands “that blue space book”, uses the index, hides books that are not for sale and suggests the best ones.', 'Madadgaar assistant jo “woh neeli space wali book” samajhta hai, index use karta hai, na bikne wali books chhupata hai aur best suggest karta hai.') },
      ],
    },
    rows: [
      { feature: 'Role', values: [bi('Data structure that matches words fast', 'Shabd tezi se milane wala data structure'), bi('API that interprets queries and applies rules', 'Queries samajhne aur rules lagane wali API'), 'Source of truth'] },
      { feature: 'Typos, synonyms, relevance', values: [bi('Yes (analysers, scoring)', 'Haan (analysers, scoring)'), bi('Adds business rules on top', 'Upar business rules jodta hai'), bi('No (LIKE is literal)', 'Nahi (LIKE literal hai)')] },
      { feature: bi('Speed over millions of documents', 'Lakhon documents par speed'), values: ['Milliseconds', bi('Depends on the index', 'Index par depend'), bi('Slow full scans for text search', 'Text search ke liye slow full scans')] },
      { feature: bi('Truth or copy?', 'Sach ya copy?'), values: [bi('Copy (rebuildable)', 'Copy (dobara ban sakti)'), 'Stateless logic', bi('Truth', 'Sach')] },
    ],
    pickWhen: [
      { type: 'search-index', points: [bi('Free-text, ranked search over many documents.', 'Kai documents par free-text, ranked search.')] },
      { type: 'search-service', points: [bi('Permissions, boosts and query understanding must be applied consistently.', 'Permissions, boosts aur query samajhna lagatar laagu hona chahiye.')] },
      { type: 'sql-db', points: [bi('Exact lookups and filters on structured fields.', 'Structured fields par exact lookups aur filters.')] },
    ],
    rule: bi('Database = truth, index = fast word lookup built from the truth, search service = the brain users talk to.', 'Database = sach, index = sach se bana tez shabd lookup, search service = woh dimaag jisse users baat karte hain.'),
    quiz: [
      { scenario: bi('“runing shoes red” must still find “Red Running Shoes”, best matches first.', '“runing shoes red” se bhi “Red Running Shoes” milna chahiye, best pehle.'), answer: 'search-index', why: bi('Typo-tolerant, ranked matching is the index’s job.', 'Typo-tolerant, ranked matching index ka kaam hai.') },
      { scenario: bi('Hide documents a user is not allowed to see and boost recent ones.', 'User jo documents nahi dekh sakta unhe chhupao aur recent wale boost karo.'), answer: 'search-service', why: bi('Business rules and permissions live in the search service.', 'Business rules aur permissions search service mein rehte hain.') },
      { scenario: bi('Fetch order #881 with its items to show the receipt.', 'Receipt dikhane ke liye order #881 uske items ke saath laao.'), answer: 'sql-db', why: bi('Exact lookup of structured data from the source of truth.', 'Source of truth se structured data ka exact lookup.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'sql-vs-data-warehouse-vs-time-series',
    types: ['sql-db', 'data-warehouse', 'time-series-db'],
    confusion: bi(
      'All three store data in tables of some kind and answer SQL-like queries, and all three are called “databases”.',
      'Teeno kisi tarah ki tables mein data rakhte hain aur SQL jaisi queries ka jawab dete hain, aur teeno ko “databases” kaha jaata hai.',
    ),
    common: bi('Each stores data durably and answers questions about it; they differ in which questions they are fast at.', 'Har ek data majbooti se rakhta hai aur uspar sawaalon ka jawab deta hai; farak yeh hai ki kaunse sawaalon mein tez hain.'),
    story: {
      setting: bi('A chain of grocery stores.', 'Grocery stores ki ek chain.'),
      roles: [
        { type: 'sql-db', icon: 'Receipt', role: bi('The cash register system: every sale recorded correctly, instantly, one at a time.', 'Cash register system: har sale sahi, turant, ek-ek karke darj.') },
        { type: 'data-warehouse', icon: 'ChartBar', role: bi('Head office analysts with years of sales from all stores, answering “which products sell best in winter in the north?”.', 'Head office analysts jinke paas saari stores ki saalon ki sales hai, jawab dete hain “uttar mein sardi mein kya sabse zyada bikta hai?”.') },
        { type: 'time-series-db', icon: 'Thermometer', role: bi('The fridge temperature recorders: a reading every minute from every fridge, with alarms if one warms up.', 'Fridge temperature recorders: har fridge se har minute reading, garam hone par alarm.') },
      ],
    },
    rows: [
      { feature: 'Workload', values: [bi('Many small reads and writes (transactions)', 'Kai chhote reads aur writes (transactions)'), bi('Few huge analytical queries', 'Kuch bahut bade analytical queries'), bi('Endless timestamped writes, time-range reads', 'Anant timestamped writes, time-range reads')] },
      { feature: 'Storage layout', values: ['Row-oriented', 'Column-oriented, compressed', bi('By series and time, compressed', 'Series aur time se, compressed')] },
      { feature: bi('Data freshness', 'Data kitna fresh'), values: ['Live', bi('Minutes to hours behind', 'Minutes se ghante peeche'), 'Live (seconds)'] },
      { feature: bi('Typical question', 'Aam sawaal'), values: [bi('Place this order; show order #881', 'Yeh order place karo; order #881 dikhao'), bi('Revenue by region by month for 3 years', '3 saal ka region aur mahine ke hisaab se revenue'), bi('CPU per minute for the last 6 hours', 'Pichhle 6 ghante ka har minute CPU')] },
    ],
    pickWhen: [
      { type: 'sql-db', points: [bi('Running the live product.', 'Live product chalana.')] },
      { type: 'data-warehouse', points: [bi('Business analytics across all data and long history.', 'Saare data aur lambi history par business analytics.')] },
      { type: 'time-series-db', points: [bi('Metrics and sensor readings over time, with retention.', 'Retention ke saath time par metrics aur sensor readings.')] },
    ],
    rule: bi('Run the business → SQL. Understand the business → warehouse. Watch the machines → time-series DB.', 'Business chalao → SQL. Business samjho → warehouse. Machines par nazar → time-series DB.'),
    quiz: [
      { scenario: bi('Store the temperature of 50,000 sensors every 10 seconds and alert on spikes.', '50,000 sensors ka temperature har 10 second store karo aur spikes par alert karo.'), answer: 'time-series-db', why: bi('Timestamped readings with retention are its specialty.', 'Retention ke saath timestamped readings iski khaasiyat hai.') },
      { scenario: bi('Analysts ask for customer lifetime value by acquisition channel over 3 years.', 'Analysts 3 saal ka acquisition channel ke hisaab se customer lifetime value maangte hain.'), answer: 'data-warehouse', why: bi('Big analytical queries over long history belong in a warehouse.', 'Lambi history par bade analytical queries warehouse mein.') },
      { scenario: bi('Book a seat and take payment in one consistent step.', 'Ek consistent step mein seat book karo aur payment lo.'), answer: 'sql-db', why: bi('Transactional work for the live app.', 'Live app ke liye transactional kaam.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'websocket-vs-notifications-vs-providers',
    types: ['websocket-server', 'notification-service', 'push-provider', 'email-sms-provider'],
    confusion: bi(
      'All four are about “telling the user something”. Diagrams often draw a single “notifications” box, but four very different jobs hide inside it.',
      'Charon “user ko kuch batane” ke baare mein hain. Diagrams aksar ek “notifications” box bana dete hain, lekin uske andar chaar bahut alag kaam chhupe hain.',
    ),
    common: bi('Together they get information from your backend to a person — instantly in the app, or later on their lock screen, inbox or phone.', 'Saath milkar woh jaankari backend se insaan tak le jaate hain — app mein turant, ya baad mein lock screen, inbox ya phone par.'),
    story: {
      setting: bi('A family staying in touch while one member travels.', 'Ek parivaar jo ek sadasya ke safar ke dauran sampark mein rehta hai.'),
      roles: [
        { type: 'websocket-server', icon: 'PhoneCall', role: bi('A live phone call: while both are on the line, news is shared instantly both ways.', 'Live phone call: jab tak dono line par hain, khabar dono taraf turant.') },
        { type: 'notification-service', icon: 'User', role: bi('Mum, who decides what is worth telling, to whom, and how: a call for urgent news, a letter for photos, nothing after 10 pm.', 'Maa, jo decide karti hain kya batane layak hai, kisko, aur kaise: urgent khabar ke liye call, photos ke liye letter, raat 10 ke baad kuch nahi.') },
        { type: 'push-provider', icon: 'Bell', role: bi('The doorbell service that can ring your phone even when you are not on a call.', 'Doorbell service jo aapka phone baja sakti hai jab aap call par nahi ho.') },
        { type: 'email-sms-provider', icon: 'Mailbox', role: bi('The postal and SMS network that delivers letters and texts to any address or number.', 'Dak aur SMS network jo kisi bhi address ya number par letters aur texts deliver karta hai.') },
      ],
    },
    rows: [
      { feature: bi('Works when the app is closed?', 'App band ho tab kaam karta hai?'), values: [bi('No', 'Nahi'), bi('It decides; delivery via providers', 'Yeh decide karta hai; delivery providers se'), bi('Yes (installed app)', 'Haan (installed app)'), bi('Yes (any inbox/number)', 'Haan (koi bhi inbox/number)')] },
      { feature: bi('Who runs it', 'Kaun chalata hai'), values: [bi('You', 'Aap'), bi('You', 'Aap'), 'Apple / Google', bi('A third-party company', 'Third-party company')] },
      { feature: 'Speed', values: ['Milliseconds', 'Seconds (queue-based)', 'Seconds, best effort', bi('Seconds to minutes', 'Seconds se minutes')] },
      { feature: bi('Typical content', 'Aam content'), values: ['Chat messages, live location, typing', 'Order updates, reminders, alerts (logic)', bi('Short lock-screen alerts', 'Chhote lock-screen alerts'), 'Receipts, OTPs, statements'] },
    ],
    pickWhen: [
      { type: 'websocket-server', points: [bi('The user is in the app and needs live updates.', 'User app mein hai aur live updates chahiye.')] },
      { type: 'notification-service', points: [bi('Many events must become well-chosen messages across channels.', 'Kai events ko channels mein soche-samjhe messages banana hai.')] },
      { type: 'push-provider', points: [bi('You must reach a mobile app that is closed.', 'Band mobile app tak pahunchna hai.')] },
      { type: 'email-sms-provider', points: [bi('You need receipts, OTPs or reach without an installed app.', 'Receipts, OTPs ya bina installed app ke pahunch chahiye.')] },
    ],
    rule: bi('App open → WebSocket. Deciding who/what/which channel → notification service. Delivering to a closed app → push provider. Delivering to inbox/phone number → email/SMS provider.', 'App khula → WebSocket. Kaun/kya/kaunsa channel decide karna → notification service. Band app tak deliver → push provider. Inbox/phone number tak deliver → email/SMS provider.'),
    quiz: [
      { scenario: bi('Show “Ravi is typing…” in an open chat.', 'Khuli chat mein “Ravi is typing…” dikhao.'), answer: 'websocket-server', why: bi('Live, in-app, two-way updates need an open connection.', 'Live, in-app, do-taraf updates ko khula connection chahiye.') },
      { scenario: bi('Send a one-time password to a phone number during sign-up (no app installed).', 'Sign-up mein phone number par one-time password bhejo (app installed nahi).'), answer: 'email-sms-provider', why: bi('SMS reaches any number without an app.', 'SMS bina app ke kisi bhi number tak pahunchta hai.') },
      { scenario: bi('Decide that “order shipped” goes by push, but “invoice ready” by email, and nothing at night.', 'Decide karo ki “order shipped” push se jaaye, lekin “invoice ready” email se, aur raat ko kuch nahi.'), answer: 'notification-service', why: bi('Channel choice, preferences and quiet hours are its job.', 'Channel chunna, preferences aur quiet hours iska kaam hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'logs-vs-metrics-vs-traces',
    types: ['logging-service', 'metrics-monitoring', 'distributed-tracing'],
    confusion: bi(
      'All three are “observability” and all three help you debug production. Many vendors sell them in one product, so they feel like one thing.',
      'Teeno “observability” hain aur teeno production debug karne mein madad karte hain. Kai vendors inhe ek product mein bechte hain, isliye ek hi cheez lagte hain.',
    ),
    common: bi('Each lets you see what your system is doing without attaching a debugger to production.', 'Har ek aapko production par debugger lagaye bina dikhata hai ki system kya kar raha hai.'),
    story: {
      setting: bi('A hospital looking after its patients.', 'Ek hospital jo apne patients ka khayal rakhta hai.'),
      roles: [
        { type: 'metrics-monitoring', icon: 'HeartPulse', role: bi('The heart monitor beside each bed: numbers over time and an alarm when they go out of range.', 'Har bed ke bagal ka heart monitor: time ke saath numbers aur range se bahar jaane par alarm.') },
        { type: 'logging-service', icon: 'Notebook', role: bi('The nurses’ notes: detailed written entries — “10:42 gave medicine, patient felt dizzy”.', 'Nurses ke notes: detailed likhi entries — “10:42 dawa di, patient ko chakkar aaya”.') },
        { type: 'distributed-tracing', icon: 'Footprints', role: bi('The patient’s journey sheet: reception 5 min → X-ray 40 min → doctor 10 min — showing where the time went.', 'Patient ki journey sheet: reception 5 min → X-ray 40 min → doctor 10 min — dikhati hai time kahan gaya.') },
      ],
    },
    rows: [
      { feature: 'Data', values: [bi('Text events with details', 'Details ke saath text events'), bi('Numbers over time', 'Time ke saath numbers'), bi('Timed spans of one request across services', 'Ek request ke services mein timed spans')] },
      { feature: bi('Answers', 'Jawab deta hai'), values: [bi('What exactly happened?', 'Bilkul kya hua?'), bi('Is something wrong, and how much?', 'Kuch gadbad hai, aur kitni?'), bi('Where did this request spend its time?', 'Is request ne time kahan bitaya?')] },
      { feature: bi('Cost per request', 'Per request kharcha'), values: [bi('Medium–high', 'Medium–zyada'), bi('Very low', 'Bahut kam'), bi('Medium (usually sampled)', 'Medium (aam taur par sampled)')] },
      { feature: 'Alerts?', values: [bi('Sometimes', 'Kabhi-kabhi'), bi('Yes — main use', 'Haan — main use'), bi('Rarely', 'Kam hi')] },
    ],
    pickWhen: [
      { type: 'metrics-monitoring', points: [bi('Dashboards and alerts on health and trends.', 'Health aur trends par dashboards aur alerts.')] },
      { type: 'logging-service', points: [bi('Investigating a specific error or user complaint.', 'Khaas error ya user complaint ki jaanch.')] },
      { type: 'distributed-tracing', points: [bi('Finding the slow hop in a chain of services.', 'Services ki chain mein slow hop dhundhna.')] },
    ],
    rule: bi('Metrics tell you THAT something is wrong, traces tell you WHERE, logs tell you WHY. Use all three together.', 'Metrics batate hain KI kuch gadbad hai, traces batate hain KAHAN, logs batate hain KYUN. Teeno saath use karo.'),
    quiz: [
      { scenario: bi('Wake the on-call engineer if the error rate exceeds 2% for five minutes.', 'Paanch minute tak error rate 2% se upar ho toh on-call engineer ko jagao.'), answer: 'metrics-monitoring', why: bi('Threshold alerts on numbers over time are metrics.', 'Time ke numbers par threshold alerts metrics hain.') },
      { scenario: bi('Checkout is slow and you need to know which of 9 services is responsible.', 'Checkout slow hai aur jaanna hai 9 mein se kaunsi service zimmedar hai.'), answer: 'distributed-tracing', why: bi('A trace shows the time spent at each hop.', 'Trace har hop par bita time dikhata hai.') },
      { scenario: bi('A user says their payment failed at 3:12 pm; find the exact error message.', 'User kehta hai 3:12 baje payment fail hua; bilkul error message dhundho.'), answer: 'logging-service', why: bi('Detailed per-event text lives in logs.', 'Har event ka detailed text logs mein hota hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'auth-service-vs-identity-provider-vs-api-gateway',
    types: ['auth-service', 'identity-provider', 'api-gateway'],
    confusion: bi(
      'All three “handle login” in some sense: the gateway checks tokens, the auth service issues them, and the identity provider vouches for the user. In diagrams they often merge into one “Auth” box.',
      'Teeno kisi tarah “login sambhalte hain”: gateway tokens check karta hai, auth service unhe jaari karti hai, aur identity provider user ki gawahi deta hai. Diagrams mein yeh aksar ek “Auth” box ban jaate hain.',
    ),
    common: bi('Together they make sure only the right people get in, without every service handling passwords.', 'Saath milkar yeh pakka karte hain ki sirf sahi log andar aayein, bina har service ke passwords sambhale.'),
    story: {
      setting: bi('Entering a big conference.', 'Ek badi conference mein ghusna.'),
      roles: [
        { type: 'identity-provider', icon: 'Landmark', role: bi('The government that issued your ID card — it vouches for who you are (Google, Okta, your company directory).', 'Woh sarkar jisne aapka ID card jaari kiya — woh gawahi deti hai ki aap kaun ho (Google, Okta, company directory).') },
        { type: 'auth-service', icon: 'BadgeCheck', role: bi('The registration desk that checks your ID once (or trusts the government’s card) and prints your conference badge.', 'Registration desk jo ek baar aapka ID check karta hai (ya sarkar ke card par bharosa) aur conference badge chhaapta hai.') },
        { type: 'api-gateway', icon: 'DoorOpen', role: bi('The guard at every hall door who just scans the badge — fast, every time, without asking for your ID again.', 'Har hall ke darwaze ka guard jo bas badge scan karta hai — tez, har baar, bina dobara ID maange.') },
      ],
    },
    rows: [
      { feature: bi('Job', 'Kaam'), values: [bi('Sign users in, issue sessions/tokens, MFA', 'Users ko sign in, sessions/tokens jaari, MFA'), bi('Prove identity (external)', 'Identity saabit karna (bahar se)'), bi('Check tokens on every request; route', 'Har request par tokens check; route')] },
      { feature: bi('Sees passwords?', 'Passwords dekhta hai?'), values: [bi('Yes, if you have your own accounts', 'Haan, agar apne accounts hain'), bi('Yes — yours never does', 'Haan — aapka system kabhi nahi'), bi('Never', 'Kabhi nahi')] },
      { feature: bi('Owned by', 'Maalik'), values: [bi('You', 'Aap'), bi('Google, Okta, a company…', 'Google, Okta, company…'), bi('You', 'Aap')] },
      { feature: bi('Called', 'Kab call hota hai'), values: [bi('At login and token refresh', 'Login aur token refresh par'), bi('At login (redirect)', 'Login par (redirect)'), bi('On every API call', 'Har API call par')] },
    ],
    pickWhen: [
      { type: 'auth-service', points: [bi('You manage your own users, sessions and MFA.', 'Aap apne users, sessions aur MFA manage karte ho.')] },
      { type: 'identity-provider', points: [bi('Users already have Google or company accounts (SSO).', 'Users ke paas pehle se Google ya company accounts hain (SSO).')] },
      { type: 'api-gateway', points: [bi('Many services must reject bad tokens consistently.', 'Kai services ko kharab tokens lagatar reject karne hain.')] },
    ],
    rule: bi('The IdP says who you are, the auth service gives you a pass, the gateway checks the pass at every door.', 'IdP batata hai aap kaun ho, auth service pass deti hai, gateway har darwaze par pass check karta hai.'),
    quiz: [
      { scenario: bi('Enterprise customers want employees to log in with their company Okta.', 'Enterprise customers chahte hain employees company Okta se login karein.'), answer: 'identity-provider', why: bi('Federating with the customer’s IdP gives SSO.', 'Customer ke IdP se federate karne se SSO milta hai.') },
      { scenario: bi('Reject requests with expired tokens before they reach 30 microservices.', '30 microservices tak pahunchne se pehle expired tokens wali requests reject karo.'), answer: 'api-gateway', why: bi('Checking tokens on every request at one entry is the gateway’s job.', 'Ek entry par har request ke tokens check karna gateway ka kaam hai.') },
      { scenario: bi('Add one-time-code MFA after password login for your own user accounts.', 'Apne user accounts ke liye password login ke baad one-time-code MFA jodo.'), answer: 'auth-service', why: bi('Login flows, MFA and token issuing live in the auth service.', 'Login flows, MFA aur token jaari karna auth service mein hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'rate-limiter-vs-waf',
    types: ['rate-limiter', 'waf'],
    confusion: bi(
      'Both protect your system at the edge, both reject requests before they reach your code, and many CDNs offer both on the same settings page.',
      'Dono edge par system ki hifazat karte hain, dono requests ko code tak pahunchne se pehle reject karte hain, aur kai CDNs dono ek hi settings page par dete hain.',
    ),
    common: bi('Both are security and reliability guards that say “no” early, saving capacity and preventing harm.', 'Dono security aur reliability guards hain jo jaldi “nahi” kehte hain, capacity bachate aur nuksaan rokte hain.'),
    story: {
      setting: bi('Security at a popular museum.', 'Ek popular museum ki security.'),
      roles: [
        { type: 'rate-limiter', icon: 'Ticket', role: bi('The turnstile that lets each visitor through a limited number of times per hour, so one group cannot flood the halls.', 'Turnstile jo har visitor ko ghante mein seemit baar andar jaane deta hai, taaki ek group halls na bhar de.') },
        { type: 'waf', icon: 'Shield', role: bi('The bag scanner that looks inside every bag for dangerous items, no matter how rarely the visitor comes.', 'Bag scanner jo har bag ke andar khatarnaak cheezein dekhta hai, visitor kitni bhi kam baar aaye.') },
      ],
    },
    rows: [
      { feature: bi('Looks at', 'Kya dekhta hai'), values: [bi('How many requests a caller sends', 'Caller kitni requests bhejta hai'), bi('What is inside each request', 'Har request ke andar kya hai')] },
      { feature: bi('Stops', 'Kya rokta hai'), values: [bi('Floods, brute force, scraping, runaway clients', 'Floods, brute force, scraping, bigde clients'), bi('SQL injection, XSS, exploit paths, bad bots', 'SQL injection, XSS, exploit paths, bure bots')] },
      { feature: bi('Needs shared state?', 'Shared state chahiye?'), values: [bi('Yes — counters per caller', 'Haan — har caller ke counters'), bi('No — rules per request', 'Nahi — har request ke rules')] },
      { feature: 'Response', values: ['429 Too Many Requests', '403 Forbidden'] },
    ],
    pickWhen: [
      { type: 'rate-limiter', points: [bi('One caller can overwhelm or abuse an endpoint by volume.', 'Ek caller volume se endpoint ko overwhelm ya abuse kar sakta hai.')] },
      { type: 'waf', points: [bi('Public endpoints are probed with attack payloads.', 'Public endpoints attack payloads se probe hote hain.')] },
    ],
    rule: bi('Too many requests → rate limiter. Dangerous requests → WAF. Public sites usually need both.', 'Bahut requests → rate limiter. Khatarnaak requests → WAF. Public sites ko aam taur par dono chahiye.'),
    quiz: [
      { scenario: bi('A bot tries 20,000 passwords per minute against /login.', 'Ek bot /login par har minute 20,000 passwords try karta hai.'), answer: 'rate-limiter', why: bi('The problem is volume per caller.', 'Problem har caller ka volume hai.') },
      { scenario: bi('Requests arrive with ?q=1\' OR \'1\'=\'1 in the query string.', 'Query string mein ?q=1\' OR \'1\'=\'1 wali requests aati hain.'), answer: 'waf', why: bi('That is a SQL-injection payload — content inspection.', 'Yeh SQL-injection payload hai — content ki jaanch.') },
      { scenario: bi('A partner’s buggy script calls your API 500 times a second in a loop.', 'Partner ki buggy script loop mein aapki API second mein 500 baar call karti hai.'), answer: 'rate-limiter', why: bi('Harmless content, harmful volume.', 'Content nuksaandeh nahi, volume nuksaandeh.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'config-vs-secrets-vs-coordination',
    types: ['config-service', 'secrets-manager', 'coordination-service'],
    confusion: bi(
      'All three are small, central key-value stores that many services read at runtime. etcd and Consul can technically be used for all three jobs, which adds to the confusion.',
      'Teeno chhote, central key-value stores hain jinhe kai services runtime par padhti hain. etcd aur Consul technically teeno kaam ke liye use ho sakte hain, jisse confusion badhta hai.',
    ),
    common: bi('Each holds small but important values that many services depend on, so each must be highly available.', 'Har ek chhoti par important values rakhta hai jin par kai services depend karti hain, isliye har ek highly available hona chahiye.'),
    story: {
      setting: bi('Running a big office building.', 'Ek badi office building chalana.'),
      roles: [
        { type: 'config-service', icon: 'Lightbulb', role: bi('The switch panel at reception: lights on/off, AC temperature — anyone may see it, and changes apply everywhere at once.', 'Reception ka switch panel: lights on/off, AC temperature — koi bhi dekh sakta hai, aur changes har jagah ek saath laagu.') },
        { type: 'secrets-manager', icon: 'KeyRound', role: bi('The locked key cabinet: only authorised staff may take specific keys, every access is logged, and locks are changed regularly.', 'Band chaabi almari: sirf adhikrit staff khaas chaabiyan le sakta hai, har access log hota hai, aur taale niyamit badle jaate hain.') },
        { type: 'coordination-service', icon: 'Gavel', role: bi('The committee that votes on who is the building manager this week — there can never be two.', 'Committee jo vote karti hai ki is hafte building manager kaun hai — do kabhi nahi ho sakte.') },
      ],
    },
    rows: [
      { feature: bi('Holds', 'Kya rakhta hai'), values: ['Feature flags, timeouts, limits', 'Passwords, API keys, certificates', 'Leader leases, locks, membership'] },
      { feature: 'Main guarantee', values: [bi('Fast, safe propagation of changes', 'Changes ka tez, safe propagation'), bi('Confidentiality, access control, audit, rotation', 'Gopniyata, access control, audit, rotation'), bi('Agreement under failures (consensus)', 'Failures mein sahmati (consensus)')] },
      { feature: bi('Who may read', 'Kaun padh sakta hai'), values: [bi('Most services', 'Zyada tar services'), bi('Only specific identities', 'Sirf khaas identities'), bi('Participating services', 'Bhaag lene wali services')] },
      { feature: bi('If misused', 'Galat use par'), values: [bi('Secrets leak (do not store them here)', 'Secrets leak (yahan mat rakho)'), bi('Slow if read on every request', 'Har request par padha toh slow'), bi('Overloaded if used as a database', 'Database ki tarah use kiya toh overload')] },
    ],
    pickWhen: [
      { type: 'config-service', points: [bi('Change behaviour without redeploying.', 'Bina redeploy behaviour badalna.')] },
      { type: 'secrets-manager', points: [bi('Store anything that would hurt if leaked.', 'Kuch bhi rakhna jo leak hone par nuksaan kare.')] },
      { type: 'coordination-service', points: [bi('Exactly one instance must lead or hold a lock.', 'Bilkul ek instance ko lead karna ya lock rakhna hai.')] },
    ],
    rule: bi('Settings → config service. Secrets → secrets manager. “Who is in charge?” → coordination service.', 'Settings → config service. Secrets → secrets manager. “In-charge kaun hai?” → coordination service.'),
    quiz: [
      { scenario: bi('Turn off a new feature for everyone within seconds.', 'Nayi feature ko seconds mein sabke liye band karo.'), answer: 'config-service', why: bi('A feature flag is a runtime setting.', 'Feature flag runtime setting hai.') },
      { scenario: bi('Store the payment provider’s secret key and rotate it monthly.', 'Payment provider ki secret key store karo aur har mahine rotate karo.'), answer: 'secrets-manager', why: bi('Sensitive, access-controlled and rotated.', 'Sensitive, access-controlled aur rotated.') },
      { scenario: bi('Only one of three scheduler replicas may dispatch jobs at a time.', 'Teen scheduler replicas mein se ek waqt mein sirf ek jobs bhej sakta hai.'), answer: 'coordination-service', why: bi('Leader election needs consensus.', 'Leader election ko consensus chahiye.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'app-server-vs-microservice-vs-bff',
    types: ['app-server', 'microservice', 'bff'],
    confusion: bi(
      'All three are “a server running your code behind an API”. They can even use the same framework. The difference is scope and ownership, not technology.',
      'Teeno “API ke peeche aapka code chalane wala server” hain. Same framework bhi use kar sakte hain. Farak scope aur maalikana ka hai, technology ka nahi.',
    ),
    common: bi('Each runs business-facing code, usually stateless and scaled out behind an entry point.', 'Har ek business-facing code chalata hai, aam taur par stateless aur entry point ke peeche scaled out.'),
    story: {
      setting: bi('Different ways to run a restaurant business.', 'Restaurant business chalane ke alag tareeke.'),
      roles: [
        { type: 'app-server', icon: 'ChefHat', role: bi('One big kitchen that cooks the whole menu. Simple to run with a small team.', 'Ek bada kitchen jo poora menu banata hai. Chhoti team ke saath chalana simple.') },
        { type: 'microservice', icon: 'Store', role: bi('A food court where each counter (pizza, coffee, desserts) has its own staff, stock and hours.', 'Food court jahan har counter (pizza, coffee, desserts) ka apna staff, stock aur timing hai.') },
        { type: 'bff', icon: 'ShoppingBag', role: bi('A personal shopper for one kind of customer (say, delivery app users) who collects from several counters and packs exactly what that customer needs.', 'Ek tarah ke customer (jaise delivery app users) ke liye personal shopper jo kai counters se ikattha karke bilkul wahi pack karta hai jo us customer ko chahiye.') },
      ],
    },
    rows: [
      { feature: 'Scope', values: [bi('Many features in one deployable', 'Ek deployable mein kai features'), bi('One business capability', 'Ek business capability'), bi('One client type’s needs', 'Ek client type ki zarooratein')] },
      { feature: bi('Owns data?', 'Data ka maalik?'), values: [bi('Yes, shared database', 'Haan, shared database'), bi('Yes, its own database', 'Haan, apna database'), bi('No — composes others', 'Nahi — doosron ko jodta hai')] },
      { feature: bi('Deployed', 'Deploy'), values: [bi('As one unit', 'Ek unit ki tarah'), 'Independently', bi('With its front-end', 'Apne front-end ke saath')] },
      { feature: bi('Best for', 'Kiske liye best'), values: [bi('Small teams, early products', 'Chhoti teams, shuruaati products'), bi('Many teams, different scaling needs', 'Kai teams, alag scaling zarooratein'), bi('Screens needing data from many services', 'Kai services ka data chahne wali screens')] },
    ],
    pickWhen: [
      { type: 'app-server', points: [bi('One team, one product, keep it simple.', 'Ek team, ek product, simple rakho.')] },
      { type: 'microservice', points: [bi('Teams must deploy and scale independently.', 'Teams ko independently deploy aur scale karna hai.')] },
      { type: 'bff', points: [bi('A client needs a tailored, aggregated API.', 'Client ko tailored, aggregated API chahiye.')] },
    ],
    rule: bi('Start with an app server; split into microservices when teams and scaling demand it; add a BFF when a client needs data shaped just for it.', 'App server se shuru karo; teams aur scaling maange tab microservices mein todo; client ko khaas shaped data chahiye tab BFF jodo.'),
    quiz: [
      { scenario: bi('A three-person startup building its first version.', 'Teen logon ka startup apna pehla version bana raha hai.'), answer: 'app-server', why: bi('One deployable is simplest for a small team.', 'Chhoti team ke liye ek deployable sabse simple hai.') },
      { scenario: bi('The TV app needs one call that returns the home screen rows from five services.', 'TV app ko ek call chahiye jo paanch services se home screen rows lautaye.'), answer: 'bff', why: bi('Client-specific aggregation is a BFF’s job.', 'Client-specific aggregation BFF ka kaam hai.') },
      { scenario: bi('The payments team must release on its own schedule with its own database.', 'Payments team ko apne schedule par apne database ke saath release karna hai.'), answer: 'microservice', why: bi('Independent ownership and deployment is the point of a microservice.', 'Independent maalikana aur deployment hi microservice ka maqsad hai.') },
    ],
  },
];
