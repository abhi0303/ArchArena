import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const specializedGuides2: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'coordination-service',
    tagline: bi('A tiny, ultra-reliable referee that decides “who is the leader” and “who holds the lock”.', 'Chhota, bahut bharosemand referee jo decide karta hai “leader kaun hai” aur “lock kiske paas hai”.'),
    intro: bi(
      'A coordination service is a small cluster (usually 3 or 5 nodes) that uses a consensus algorithm such as Raft to agree on tiny pieces of critical data, even when some nodes fail. Systems use it to elect a single leader, hold distributed locks, track which servers are alive, and store small but critical metadata.\n\nIt is not a general database: it stores kilobytes, not gigabytes, and trades speed for being correct under failures.',
      'Coordination service ek chhota cluster hai (aam taur par 3 ya 5 nodes) jo Raft jaise consensus algorithm se critical data ke chhote tukdon par sahmati banata hai, kuch nodes fail hone par bhi. Systems ise ek leader chunne, distributed locks rakhne, kaun se servers zinda hain track karne, aur chhota par critical metadata store karne ke liye use karte hain.\n\nYeh general database nahi hai: yeh kilobytes rakhta hai, gigabytes nahi, aur failures mein sahi rehne ke liye speed chhodta hai.',
    ),
    problem: bi(
      'Two copies of a scheduler both believed they were in charge after a network glitch (“split brain”). Both ran the nightly billing job, and customers were charged twice.',
      'Network glitch ke baad scheduler ki do copies dono ne maana ki woh in-charge hain (“split brain”). Dono ne raat ka billing job chalaya, aur customers se do baar paise kate.',
    ),
    before: scene(
      [[c('scheduler', { id: 's1', label: 'Scheduler A', note: '“I am leader”' }), c('scheduler', { id: 's2', label: 'Scheduler B', note: '“I am leader”', state: 'bad' })], [c('background-worker', { label: 'Billing', note: 'ran twice', state: 'bad' })]],
      ['s1>background-worker', 's2!>background-worker'],
      bi('Split brain: two instances both act as leader.', 'Split brain: do instances dono leader ban jaate hain.'),
    ),
    solution: bi(
      'Both schedulers ask the coordination service for a leader lease. The 5-node quorum grants it to exactly one; if that one dies, the lease expires and the other takes over. Only the lease holder runs jobs.',
      'Dono schedulers coordination service se leader lease maangte hain. 5-node quorum use bilkul ek ko deta hai; woh mar jaaye toh lease expire hoti hai aur doosra sambhal leta hai. Sirf lease holder jobs chalata hai.',
    ),
    after: scene(
      [[c('scheduler', { id: 's1', label: 'Scheduler A', state: 'good', note: 'leader' }), c('scheduler', { id: 's2', label: 'Scheduler B', state: 'muted', note: 'standby' })], [c('coordination-service', { state: 'focus', note: '5-node quorum' })]],
      [['s1>coordination-service', 'holds lease'], ['s2.>coordination-service', 'waiting']],
      bi('Consensus grants the leader role to exactly one instance at a time.', 'Consensus leader role ek waqt mein bilkul ek instance ko deta hai.'),
    ),
    steps: [
      bi('Run 3 or 5 nodes; a majority (quorum) must agree on every change.', '3 ya 5 nodes chalao; har change par majority (quorum) ki sahmati chahiye.'),
      bi('Clients create a lease or lock entry; only one can succeed.', 'Clients lease ya lock entry banate hain; sirf ek safal ho sakta hai.'),
      bi('The holder keeps renewing it with heartbeats.', 'Holder heartbeats se use renew karta rehta hai.'),
      bi('If the holder stops, the lease expires and others are notified (watches).', 'Holder ruk jaaye toh lease expire hoti hai aur doosron ko pata chalta hai (watches).'),
      bi('The cluster survives the loss of a minority of nodes (1 of 3, 2 of 5).', 'Cluster nodes ke minority ke khone par bhi chalta hai (3 mein 1, 5 mein 2).'),
    ],
    analogy: {
      icons: ['Gavel', 'Users', 'Flag'],
      title: bi('A committee vote for the team captain', 'Team captain ke liye committee ka vote'),
      text: bi(
        'A five-member committee votes on who is captain. A decision needs three votes, so even if two members are absent, the committee still works — and there can never be two captains, because two different people cannot both get three of the five votes.',
        'Paanch logon ki committee vote karti hai ki captain kaun hai. Faisle ke liye teen vote chahiye, isliye do members gair-haazir hon tab bhi committee chalti hai — aur do captain kabhi nahi ho sakte, kyunki do alag log dono paanch mein se teen vote nahi le sakte.',
      ),
    },
    perfectFit: {
      title: bi('Leader election for a job scheduler', 'Job scheduler ke liye leader election'),
      text: bi(
        'You run two scheduler instances for availability, but only one may dispatch jobs at a time. A coordination service gives exactly-one leadership with automatic failover in seconds.',
        'Availability ke liye do scheduler instances chalate ho, lekin ek waqt mein sirf ek jobs bhej sakta hai. Coordination service seconds mein automatic failover ke saath bilkul-ek leadership deti hai.',
      ),
      why: [
        bi('Exactly one actor must be in charge.', 'Bilkul ek actor in-charge hona chahiye.'),
        bi('Mistakes (two leaders) are very costly.', 'Galti (do leaders) bahut mehengi hai.'),
        bi('The data involved is tiny.', 'Shaamil data bahut chhota hai.'),
      ],
    },
    avoidWhen: [
      bi('You want to store application data or large values — use a database.', 'Application data ya badi values rakhni hain — database use karo.'),
      bi('You run it with 2 or 4 nodes — even numbers add no fault tolerance; use 3 or 5.', 'Ise 2 ya 4 nodes ke saath chalana — even numbers fault tolerance nahi badhate; 3 ya 5 use karo.'),
    ],
    decisions: [
      bi('Ensemble size: 3 or 5 nodes.', 'Ensemble size: 3 ya 5 nodes.'),
      bi('Use: leader election, locks, membership or metadata.', 'Use: leader election, locks, membership ya metadata.'),
    ],
    confusedWith: [
      { type: 'config-service', difference: bi('A config service hands out settings; a coordination service guarantees agreement (one leader, one lock holder) under failures.', 'Config service settings baantti hai; coordination service failures mein sahmati guarantee karti hai (ek leader, ek lock holder).'), compare: 'config-vs-secrets-vs-coordination' },
    ],
    examples: ['etcd', 'Apache ZooKeeper', 'Consul', 'Google Chubby (paper)'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'code-sandbox',
    tagline: bi('A locked room where strangers’ code can run without touching anything else.', 'Ek band kamra jahan anjaanon ka code bina kuch aur chhue chal sake.'),
    intro: bi(
      'A sandboxed runner executes untrusted code — user submissions on a coding site, customer scripts, plug-ins — in isolation: its own process, container or micro-VM, with strict CPU, memory and time limits and no (or tightly restricted) network access.\n\nThe goal is that even malicious code cannot read other users’ data, attack your network, or take down the machine.',
      'Sandboxed runner untrusted code — coding site par user submissions, customer scripts, plug-ins — ko isolation mein chalata hai: apna process, container ya micro-VM, sakht CPU, memory aur time limits ke saath aur bina (ya bahut seemit) network access.\n\nMaqsad yeh hai ki malicious code bhi doosre users ka data na padh sake, aapke network par attack na kare, ya machine na gira sake.',
    ),
    problem: bi(
      'A coding practice site ran submitted programs directly on its app servers. One user submitted an infinite loop that froze a server; another read environment variables and found the database password.',
      'Ek coding practice site submitted programs seedha apne app servers par chalati thi. Ek user ne infinite loop bheja jisne server jama diya; doosre ne environment variables padhkar database password dhund liya.',
    ),
    before: scene(
      [[a('user', 'User', 'Unknown user')], [c('app-server', { note: 'runs user code directly', state: 'bad' })], [c('sql-db', { note: 'password exposed', state: 'bad' })]],
      [['user>app-server', 'while(true)…'], 'app-server!>sql-db'],
      bi('Untrusted code on your own servers can freeze them or steal secrets.', 'Aapke servers par untrusted code unhe jama sakta ya secrets chura sakta hai.'),
    ),
    solution: bi(
      'Submissions go into a queue. Each run starts in a fresh, isolated sandbox with a 2-second CPU limit, 256 MB memory and no network. Results come back; the sandbox is destroyed.',
      'Submissions queue mein jaate hain. Har run naye, isolated sandbox mein 2-second CPU limit, 256 MB memory aur bina network ke shuru hota hai. Results wapas aate hain; sandbox nasht kar diya jaata hai.',
    ),
    after: scene(
      [[c('app-server')], [c('task-queue')], [c('code-sandbox', { state: 'focus', note: 'no network · 2 s · 256 MB' })], [c('sql-db', { label: 'Results', state: 'good' })]],
      [['app-server~>task-queue', 'submission'], 'task-queue~>code-sandbox', ['code-sandbox.>sql-db', 'verdict']],
      bi('Each run is isolated, limited and thrown away afterwards.', 'Har run isolated, seemit aur baad mein phenk diya jaata hai.'),
    ),
    steps: [
      bi('A submission is queued, never run in the web request.', 'Submission queue hota hai, web request mein kabhi nahi chalta.'),
      bi('A runner starts a fresh sandbox (container or micro-VM) from a clean image.', 'Runner clean image se naya sandbox (container ya micro-VM) shuru karta hai.'),
      bi('It applies limits: CPU time, memory, process count, file size, no network.', 'Limits lagata hai: CPU time, memory, process count, file size, bina network.'),
      bi('It runs the code against test inputs and captures output.', 'Code ko test inputs par chalakar output pakadta hai.'),
      bi('The sandbox is destroyed; only the verdict is stored.', 'Sandbox nasht; sirf verdict store hota hai.'),
    ],
    analogy: {
      icons: ['Hospital', 'Lock', 'Eye'],
      title: bi('A quarantine room in a hospital', 'Hospital ka quarantine room'),
      text: bi(
        'A patient with an unknown infection is treated in a sealed room with its own air supply. Doctors can observe and help, but nothing from the room can spread to the rest of the hospital. After the patient leaves, the room is fully cleaned.',
        'Anjaan infection wale patient ka ilaaj apni hawa wale seal kamre mein hota hai. Doctors dekh aur madad kar sakte hain, lekin kamre ki koi cheez baaki hospital mein nahi phail sakti. Patient ke jaane ke baad kamra poori tarah saaf hota hai.',
      ),
    },
    perfectFit: {
      title: bi('An online coding judge', 'Online coding judge'),
      text: bi(
        'Thousands of anonymous users submit programs during a contest. Each runs in a fresh micro-VM with no network and hard limits, so infinite loops, fork bombs and data theft attempts simply fail — and the platform stays up.',
        'Contest mein hazaaron anonymous users programs bhejte hain. Har ek bina network aur hard limits wale naye micro-VM mein chalta hai, isliye infinite loops, fork bombs aur data chori ki koshishein bas fail hoti hain — aur platform chalta rehta hai.',
      ),
      why: [
        bi('The code is written by strangers.', 'Code anjaan logon ne likha hai.'),
        bi('Some of it will be malicious or broken.', 'Iska kuch hissa malicious ya toota hoga.'),
        bi('Other users and the platform must stay safe.', 'Doosre users aur platform surakshit rehne chahiye.'),
      ],
    },
    avoidWhen: [
      bi('The code is your own trusted business logic — a normal worker is simpler and faster.', 'Code aapka apna trusted business logic hai — normal worker simple aur tez hai.'),
      bi('You share one sandbox between users — isolation must be per run.', 'Ek sandbox users ke beech share karna — isolation har run ka hona chahiye.'),
    ],
    decisions: [
      bi('Isolation level: process, container or micro-VM.', 'Isolation level: process, container ya micro-VM.'),
      bi('Resource limits and network access (none or restricted).', 'Resource limits aur network access (none ya restricted).'),
    ],
    confusedWith: [
      { type: 'background-worker', difference: bi('A worker runs your trusted code; a sandbox runs untrusted code under strict isolation.', 'Worker aapka trusted code chalata hai; sandbox untrusted code sakht isolation mein.'), compare: 'code-sandbox-vs-background-worker' },
    ],
    examples: ['Firecracker micro-VMs', 'gVisor', 'Docker with seccomp', 'nsjail'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'time-series-db',
    tagline: bi('A database built for “value over time” — millions of timestamped readings.', '“Time ke saath value” ke liye bana database — lakhon timestamped readings.'),
    intro: bi(
      'A time-series database stores measurements with timestamps: CPU every 10 seconds, temperature per sensor per minute, stock prices per tick. It writes huge volumes very efficiently, compresses similar values heavily, and answers questions like “average per 5 minutes over the last day” quickly.\n\nIt can also downsample (keep per-hour averages for old data) and expire old data automatically.',
      'Time-series database timestamps ke saath measurements store karta hai: har 10 second CPU, har sensor ka har minute temperature, har tick stock prices. Yeh bahut zyada volume bahut efficiently likhta hai, milte-julte values ko bahut compress karta hai, aur “pichhle din ka har 5 minute ka average” jaise sawaalon ka jaldi jawab deta hai.\n\nYeh downsample bhi kar sakta hai (purane data ke liye hourly averages rakhna) aur purana data apne aap expire.',
    ),
    problem: bi(
      'Storing 2 million sensor readings per second in a normal SQL table made inserts slow, indexes huge and queries over a week of data painfully slow. Old data was never deleted, so storage costs kept climbing.',
      'Normal SQL table mein har second 20 lakh sensor readings store karne se inserts slow, indexes bahut bade aur ek hafte ke data par queries bahut slow ho gayi. Purana data kabhi delete nahi hota, isliye storage kharcha badhta raha.',
    ),
    before: scene(
      [[a('sensors', 'Thermometer', 'Sensors', { note: '2M readings/s' })], [c('sql-db', { note: 'slow inserts, huge indexes', state: 'bad' })]],
      ['sensors!>sql-db'],
      bi('A general-purpose table struggles with endless timestamped writes.', 'General-purpose table anant timestamped writes se jhoojhti hai.'),
    ),
    solution: bi(
      'A time-series database appends readings in time order, compresses them by series, rolls old data up to coarser averages and drops raw data after its retention period. Range queries over time are its specialty.',
      'Time-series database readings ko time order mein jodta hai, series ke hisaab se compress karta hai, purane data ko mote averages mein badalta hai aur retention period ke baad raw data hata deta hai. Time par range queries iski khaasiyat hai.',
    ),
    after: scene(
      [[a('sensors', 'Thermometer', 'Sensors')], [c('time-series-db', { state: 'focus', note: 'compressed · downsampled' })], [a('dash', 'ChartLine', 'Dashboards')]],
      ['sensors~>time-series-db', ['dash>time-series-db', 'last 24 h, per 5 min']],
      bi('Built for append-heavy, time-range workloads with automatic retention.', 'Append-heavy, time-range workloads ke liye bana, apne aap retention ke saath.'),
    ),
    steps: [
      bi('Each series has a name and labels (metric=temp, sensor=42).', 'Har series ka naam aur labels hote hain (metric=temp, sensor=42).'),
      bi('New points are appended in time order and compressed in blocks.', 'Naye points time order mein jude aur blocks mein compress hote hain.'),
      bi('Queries select a time range and aggregate (avg, max, rate).', 'Queries time range chunkar aggregate karti hain (avg, max, rate).'),
      bi('Old raw data is downsampled and finally deleted after retention.', 'Purana raw data downsample aur retention ke baad delete hota hai.'),
    ],
    analogy: {
      icons: ['HeartPulse', 'Watch', 'ChartLine'],
      title: bi('A fitness watch’s heart-rate history', 'Fitness watch ki heart-rate history'),
      text: bi(
        'Your watch records your heart rate every few seconds. It shows today minute by minute, last month as daily averages, and quietly forgets old minute-level detail. It is designed for “how did this change over time?” — not for storing your address book.',
        'Aapki watch har kuch seconds heart rate record karti hai. Aaj minute-by-minute dikhati hai, pichhla mahina daily averages mein, aur purani minute-level detail chupchaap bhool jaati hai. Yeh “time ke saath yeh kaise badla?” ke liye bani hai — address book rakhne ke liye nahi.',
      ),
    },
    perfectFit: {
      title: bi('Infrastructure metrics for monitoring', 'Monitoring ke liye infrastructure metrics'),
      text: bi(
        'Thousands of servers report CPU, memory and request latency every 10 seconds. A time-series DB ingests it cheaply, powers dashboards for the last day in milliseconds and keeps a year of hourly averages for capacity planning.',
        'Hazaaron servers har 10 second CPU, memory aur request latency report karte hain. Time-series DB use saste mein leta hai, pichhle din ke dashboards milliseconds mein chalata hai aur capacity planning ke liye saal bhar ke hourly averages rakhta hai.',
      ),
      why: [
        bi('Data arrives continuously with timestamps.', 'Data lagatar timestamps ke saath aata hai.'),
        bi('Queries are about ranges of time.', 'Queries time ki ranges ke baare mein hain.'),
        bi('Old detail can be summarised or dropped.', 'Purani detail summarise ya hata sakte hain.'),
      ],
    },
    avoidWhen: [
      bi('You store business records (orders, users) that get updated — use a SQL or NoSQL database.', 'Business records (orders, users) rakhne hain jo update hote hain — SQL ya NoSQL database use karo.'),
      bi('You need cross-domain business analysis (revenue by city by product) — use a warehouse.', 'Cross-domain business analysis chahiye (city aur product ke hisaab se revenue) — warehouse use karo.'),
    ],
    decisions: [
      bi('Retention and downsampling.', 'Retention aur downsampling.'),
      bi('Replication factor.', 'Replication factor (kitni copies rakhni hain).'),
    ],
    confusedWith: [
      { type: 'data-warehouse', difference: bi('TSDB: recent metrics, fast time-range queries, alerts. Warehouse: broad business history, complex joins.', 'TSDB: haal ke metrics, tez time-range queries, alerts. Warehouse: vyapak business history, complex joins.'), compare: 'sql-vs-data-warehouse-vs-time-series' },
      { type: 'metrics-monitoring', difference: bi('Monitoring is the whole product (collect, dashboard, alert); the TSDB is its storage engine.', 'Monitoring poora product hai (collect, dashboard, alert); TSDB uska storage engine hai.') },
    ],
    examples: ['Prometheus TSDB', 'InfluxDB', 'TimescaleDB', 'VictoriaMetrics'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'graph-db',
    tagline: bi('Stores connections first — perfect for “friends of friends” questions.', 'Pehle connections store karta hai — “doston ke dost” wale sawaalon ke liye perfect.'),
    intro: bi(
      'A graph database stores entities (nodes) and the relationships between them (edges) as first-class data: Asha —follows→ Ravi, Ravi —works at→ Acme. Walking from a node to its neighbours, and their neighbours, is extremely fast because each node points directly to its connections.\n\nQuestions such as “people you may know”, “which accounts share a device with this fraudster?” or “shortest path between two services” become natural and quick.',
      'Graph database entities (nodes) aur unke beech ke relationships (edges) ko first-class data ki tarah rakhta hai: Asha —follows→ Ravi, Ravi —works at→ Acme. Ek node se uske padosiyon, aur unke padosiyon tak jaana bahut tez hai kyunki har node seedha apne connections ki taraf point karta hai.\n\n“People you may know”, “kaunse accounts is fraudster ke saath device share karte hain?” ya “do services ke beech sabse chhota raasta” jaise sawaal natural aur jaldi ban jaate hain.',
    ),
    problem: bi(
      '“Friends of friends of friends who like hiking” in SQL needed three self-joins on a billion-row table. Each extra hop multiplied the work, and the query took minutes.',
      'SQL mein “hiking pasand karne wale doston ke doston ke dost” ke liye arab-row table par teen self-joins chahiye the. Har extra hop kaam ko guna karta, aur query minutes leti.',
    ),
    before: scene(
      [[c('app-server')], [c('sql-db', { label: 'friendships table', note: '3 self-joins → minutes', state: 'bad' })]],
      [['app-server!>sql-db', 'friends of friends of friends?']],
      bi('Multi-hop relationship queries explode in a relational database.', 'Multi-hop relationship queries relational database mein phat jaati hain.'),
    ),
    solution: bi(
      'In a graph database you start at Asha and follow “friend” edges three hops out, filtering by “likes hiking” on the way. Each hop follows direct pointers, so the query touches only the relevant neighbourhood and returns in milliseconds.',
      'Graph database mein Asha se shuru karke “friend” edges teen hop tak follow karte ho, raaste mein “likes hiking” se filter karke. Har hop seedhe pointers follow karta hai, isliye query sirf relevant padosi ko chhooti hai aur milliseconds mein lautti hai.',
    ),
    after: scene(
      [[a('asha', 'User', 'Asha')], [a('f1', 'User', 'Ravi'), a('f2', 'User', 'Meera')], [a('ff', 'User', 'Kabir', { note: 'likes hiking', state: 'good' })], [c('graph-db', { state: 'focus' })]],
      ['asha>f1', 'asha>f2', 'f1>ff', 'f2>ff', ['ff.>graph-db', 'stored as edges']],
      bi('Relationships are stored directly, so hopping across them is fast.', 'Relationships seedhe store hote hain, isliye unpar hop karna tez hai.'),
    ),
    steps: [
      bi('Model entities as nodes and relationships as typed edges with properties.', 'Entities ko nodes aur relationships ko properties wale typed edges ki tarah model karo.'),
      bi('Each node keeps direct references to its edges.', 'Har node apne edges ke seedhe references rakhta hai.'),
      bi('A traversal query starts at a node and follows edges hop by hop, filtering as it goes.', 'Traversal query ek node se shuru hokar edges hop-by-hop follow karti hai, filter karte hue.'),
      bi('The cost depends on the neighbourhood visited, not the total size of the data.', 'Kharch ghoome hue padosi par depend karta hai, data ke kul size par nahi.'),
    ],
    analogy: {
      icons: ['Map', 'Signpost', 'Footprints'],
      title: bi('A metro map', 'Metro map'),
      text: bi(
        'To find how to get from Station A to Station D, you trace the coloured lines from station to station. You never read a list of every station in the city. A graph database stores the lines themselves, so following them is the cheapest thing it does.',
        'Station A se Station D jaane ka raasta dhundhne ke liye aap station se station rangin lines trace karte ho. Shehar ke har station ki list nahi padhte. Graph database lines ko hi store karta hai, isliye unhe follow karna uska sabse sasta kaam hai.',
      ),
    },
    perfectFit: {
      title: bi('Fraud rings sharing devices and cards', 'Devices aur cards share karte fraud rings'),
      text: bi(
        'Accounts, devices, cards and addresses form a network. Starting from one known fraudster, a graph query finds every account within three hops that shares a device or card — revealing the whole ring in milliseconds.',
        'Accounts, devices, cards aur addresses ek network banate hain. Ek jaane-pehchaane fraudster se shuru karke graph query teen hop ke andar har woh account dhundti hai jo device ya card share karta hai — poora ring milliseconds mein dikhata hai.',
      ),
      why: [
        bi('The questions are about connections and paths.', 'Sawaal connections aur raaston ke baare mein hain.'),
        bi('Queries need several hops.', 'Queries ko kai hops chahiye.'),
        bi('The shape of relationships changes often.', 'Relationships ki shape aksar badalti hai.'),
      ],
    },
    avoidWhen: [
      bi('Your data is mostly simple records with few relationships — SQL is simpler and more widely known.', 'Aapka data zyada tar kam relationships wale simple records hain — SQL simple aur zyada jaana-pehchana hai.'),
      bi('You need big aggregate analytics over everything — use a warehouse.', 'Sab par bada aggregate analytics chahiye — warehouse use karo.'),
    ],
    decisions: [
      bi('Replication and partitioning (graphs are hard to split cleanly).', 'Replication aur partitioning (graphs ko saaf todna mushkil hai).'),
    ],
    confusedWith: [
      { type: 'sql-db', difference: bi('SQL can store relationships in tables, but every hop is a join; a graph DB stores edges directly, so multi-hop queries stay fast.', 'SQL relationships tables mein rakh sakta hai, lekin har hop ek join hai; graph DB edges seedhe rakhta hai, isliye multi-hop queries tez rehti hain.'), compare: 'graph-db-vs-sql' },
    ],
    examples: ['Neo4j', 'Amazon Neptune', 'JanusGraph', 'TigerGraph'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'waf',
    tagline: bi('A security guard that inspects each request for known attacks and turns them away.', 'Ek security guard jo har request ko jaane-pehchaane attacks ke liye jaanchta aur lauta deta hai.'),
    intro: bi(
      'A Web Application Firewall (WAF) sits at the edge and inspects HTTP requests for malicious patterns: SQL injection, cross-site scripting, known exploit paths, bad bots and requests from abusive IP ranges. It blocks them before they reach your application.\n\nIt uses managed rule sets maintained by security experts plus your own custom rules, and it is usually part of your CDN or load balancer.',
      'Web Application Firewall (WAF) edge par baithkar HTTP requests mein malicious patterns jaanchta hai: SQL injection, cross-site scripting, jaane-pehchaane exploit paths, bure bots aur abusive IP ranges se requests. Yeh unhe aapke application tak pahunchne se pehle block karta hai.\n\nYeh security experts ke maintain kiye managed rule sets aur aapke custom rules use karta hai, aur aam taur par aapke CDN ya load balancer ka hissa hota hai.',
    ),
    problem: bi(
      'Attackers sent requests like ?id=1 OR 1=1 to every endpoint. A single forgotten input check in one old service exposed the whole customer table.',
      'Attackers har endpoint par ?id=1 OR 1=1 jaisi requests bhejte. Ek purani service mein ek bhoola hua input check poori customer table expose kar gaya.',
    ),
    before: scene(
      [[a('attacker', 'Bot', 'Attacker', { state: 'bad' })], [c('load-balancer')], [c('app-server', { label: 'Old service', note: 'unchecked input', state: 'bad' })], [c('sql-db', { note: 'data leaked', state: 'bad' })]],
      [['attacker!>load-balancer', "' OR 1=1 --"], 'load-balancer!>app-server', 'app-server!>sql-db'],
      bi('Attack payloads reach your code; one weak spot is enough.', 'Attack payloads aapke code tak pahunchte hain; ek kamzor jagah kaafi hai.'),
    ),
    solution: bi(
      'Every request passes the WAF first. Requests matching attack signatures or coming from known-bad sources are blocked at the edge; normal traffic continues. Your code still validates input — the WAF is an extra layer, not a replacement.',
      'Har request pehle WAF se guzarti hai. Attack signatures se milne wali ya jaane-pehchaane bure sources se aane wali requests edge par block; normal traffic aage. Aapka code ab bhi input validate karta hai — WAF extra layer hai, replacement nahi.',
    ),
    after: scene(
      [[a('attacker', 'Bot', 'Attacker'), a('user', 'User', 'User')], [c('waf', { state: 'focus', note: 'managed rules' })], [c('load-balancer')], [c('app-server', { state: 'good' })]],
      [['attacker!>waf', 'blocked'], 'user>waf', 'waf>load-balancer', 'load-balancer>app-server'],
      bi('Malicious requests are stopped at the edge; real users pass.', 'Malicious requests edge par ruk jaati hain; asli users guzar jaate hain.'),
    ),
    steps: [
      bi('The WAF sees each request before your load balancer or app.', 'WAF har request ko load balancer ya app se pehle dekhta hai.'),
      bi('It checks headers, URL and body against rule sets (SQL injection, XSS, bad bots).', 'Yeh headers, URL aur body ko rule sets se milata hai (SQL injection, XSS, bure bots).'),
      bi('Matching requests are blocked, challenged or logged.', 'Milne wali requests block, challenge ya log hoti hain.'),
      bi('Rules are updated as new attacks appear.', 'Naye attacks aane par rules update hote hain.'),
    ],
    analogy: {
      icons: ['Shield', 'Building2', 'Ban'],
      title: bi('The airport security scanner', 'Airport ka security scanner'),
      text: bi(
        'Every bag goes through the scanner. It does not care how many trips you take; it cares whether your bag contains something dangerous. Banned items are stopped before boarding, and the airline still checks your ticket at the gate.',
        'Har bag scanner se guzarta hai. Use farak nahi padta aap kitni trips karte ho; use farak padta hai ki bag mein kuch khatarnaak hai ya nahi. Mana ki gayi cheezein boarding se pehle ruk jaati hain, aur airline gate par ticket phir bhi check karti hai.',
      ),
    },
    perfectFit: {
      title: bi('A public login and checkout site', 'Public login aur checkout site'),
      text: bi(
        'A shopping site is constantly probed by bots for SQL injection and credential stuffing. A WAF with managed rules blocks known attack patterns and bad bot signatures at the edge, cutting attack traffic before it costs anything.',
        'Shopping site ko bots lagatar SQL injection aur credential stuffing ke liye probe karte hain. Managed rules wala WAF jaane-pehchaane attack patterns aur bure bot signatures ko edge par block karta hai, attack traffic ko kuch kharch hone se pehle kaat deta hai.',
      ),
      why: [
        bi('The site is public and attractive to attackers.', 'Site public hai aur attackers ko lubhati hai.'),
        bi('Attack patterns are well known.', 'Attack patterns jaane-pehchaane hain.'),
        bi('Blocking at the edge saves capacity.', 'Edge par block karne se capacity bachti hai.'),
      ],
    },
    avoidWhen: [
      bi('You hope it replaces input validation and parameterised queries — it does not.', 'Ummeed ki yeh input validation aur parameterised queries ki jagah le lega — nahi leta.'),
      bi('Your problem is volume from legitimate-looking clients — that is rate limiting.', 'Aapki problem jaayaz dikhne wale clients ka volume hai — yeh rate limiting hai.'),
    ],
    decisions: [
      bi('Rules: managed, custom or both.', 'Rules: managed, custom ya dono.'),
      bi('Where it sits: at the CDN or in front of the load balancer.', 'Kahan baithega: CDN par ya load balancer ke aage.'),
    ],
    confusedWith: [
      { type: 'rate-limiter', difference: bi('A WAF judges what is inside a request; a rate limiter judges how many requests come.', 'WAF request ke andar kya hai yeh judge karta hai; rate limiter kitni requests aati hain.'), compare: 'rate-limiter-vs-waf' },
      { type: 'reverse-proxy', difference: bi('A reverse proxy forwards traffic; a WAF inspects and blocks attacks (often running inside a proxy or CDN).', 'Reverse proxy traffic forward karta hai; WAF attacks jaanchkar block karta hai (aksar proxy ya CDN ke andar chalta hai).') },
    ],
    examples: ['AWS WAF', 'Cloudflare WAF', 'ModSecurity', 'Azure Web Application Firewall'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'identity-provider',
    tagline: bi('Someone else vouches for who the user is — “Sign in with Google” or your company login.', 'Koi aur gawahi deta hai user kaun hai — “Sign in with Google” ya company login.'),
    intro: bi(
      'An identity provider (IdP) is an external system that authenticates users and tells your app who they are, using standards like OpenID Connect, OAuth 2.0 or SAML. Examples are Google and Apple sign-in for consumers, and Okta or Microsoft Entra ID for companies.\n\nYour app never sees the user’s password. It redirects the user to the IdP, receives a signed statement (“this is asha@acme.com, verified”), checks the signature and creates its own session.',
      'Identity provider (IdP) ek external system hai jo users ko authenticate karke aapke app ko batata hai woh kaun hain, OpenID Connect, OAuth 2.0 ya SAML jaise standards se. Examples: consumers ke liye Google aur Apple sign-in, aur companies ke liye Okta ya Microsoft Entra ID.\n\nAapka app user ka password kabhi nahi dekhta. Yeh user ko IdP par redirect karta hai, signed statement paata hai (“yeh asha@acme.com hai, verified”), signature check karta hai aur apna session banata hai.',
    ),
    problem: bi(
      'A company used 30 internal tools, each with its own username and password. Employees reused weak passwords, and when someone left the company, IT had to remember to disable 30 separate accounts.',
      'Ek company 30 internal tools use karti thi, har ek ka apna username aur password. Employees kamzor passwords dohraate, aur koi company chhode toh IT ko 30 alag accounts disable karna yaad rakhna padta.',
    ),
    before: scene(
      [[a('emp', 'User', 'Employee')], [c('app-server', { id: 't1', label: 'Tool 1', note: 'password #1' }), c('app-server', { id: 't2', label: 'Tool 2', note: 'password #2' }), c('app-server', { id: 't3', label: 'Tool 30', note: 'still active after exit', state: 'bad' })]],
      ['emp>t1', 'emp>t2', 'emp!>t3'],
      bi('Separate logins everywhere: weak passwords and forgotten accounts.', 'Har jagah alag logins: kamzor passwords aur bhoole hue accounts.'),
    ),
    solution: bi(
      'Every tool trusts the company IdP. Employees sign in once (with MFA) and are let into each tool via single sign-on. Disabling the person in the IdP removes access everywhere at once.',
      'Har tool company IdP par bharosa karta hai. Employees ek baar sign in karte hain (MFA ke saath) aur single sign-on se har tool mein jaate hain. IdP mein insaan ko disable karne se har jagah se access ek saath hat jaata hai.',
    ),
    after: scene(
      [[a('emp', 'User', 'Employee')], [c('auth-service', { label: 'App sign-in' })], [c('identity-provider', { state: 'focus', note: 'one login + MFA' })]],
      ['emp>auth-service', ['auth-service>identity-provider', 'OIDC / SAML'], ['identity-provider~>auth-service', 'signed assertion']],
      bi('Apps delegate “who is this?” to one trusted provider.', 'Apps “yeh kaun hai?” ek bharosemand provider ko saunp dete hain.'),
    ),
    steps: [
      bi('The user clicks “Sign in with Google/Okta”.', 'User “Sign in with Google/Okta” click karta hai.'),
      bi('Your app redirects them to the IdP, which authenticates them (password, MFA).', 'App unhe IdP par redirect karta hai, jo unhe authenticate karta hai (password, MFA).'),
      bi('The IdP redirects back with a signed token or assertion.', 'IdP signed token ya assertion ke saath wapas redirect karta hai.'),
      bi('Your auth service verifies the signature and creates its own session.', 'Aapki auth service signature verify karke apna session banati hai.'),
    ],
    analogy: {
      icons: ['IdCard', 'Landmark', 'Hotel'],
      title: bi('A passport issued by the government', 'Sarkar ka diya passport'),
      text: bi(
        'A hotel abroad does not investigate who you are. It looks at your passport, trusts the government that issued it, and checks the photo. The government (IdP) did the hard identity work once; many hotels (apps) rely on it.',
        'Videsh ka hotel aapki jaanch nahi karta ki aap kaun ho. Woh aapka passport dekhta hai, use jaari karne wali sarkar par bharosa karta hai, aur photo milata hai. Sarkar (IdP) ne mushkil identity ka kaam ek baar kiya; kai hotels (apps) us par bharosa karte hain.',
      ),
    },
    perfectFit: {
      title: bi('Enterprise single sign-on for a SaaS product', 'SaaS product ke liye enterprise single sign-on'),
      text: bi(
        'Large customers require that their employees log in to your SaaS with the company’s own Okta or Entra ID. Federating with their IdP gives them central control (MFA, offboarding) and saves you from storing their passwords.',
        'Bade customers chahte hain ki unke employees aapke SaaS mein company ke apne Okta ya Entra ID se login karein. Unke IdP se federate karne se unhe central control (MFA, offboarding) milta hai aur aapko unke passwords store nahi karne padte.',
      ),
      why: [
        bi('The organisation already manages identities centrally.', 'Organisation pehle se identities centrally manage karti hai.'),
        bi('Leavers must lose access everywhere immediately.', 'Chhodne walon ka access har jagah turant hatna chahiye.'),
        bi('You do not want to store passwords at all.', 'Aap passwords bilkul store nahi karna chahte.'),
      ],
    },
    avoidWhen: [
      bi('You skip signature, audience and expiry checks on the returned token — anyone could forge a login.', 'Lautaaye token par signature, audience aur expiry checks chhodna — koi bhi login forge kar sakta hai.'),
      bi('You expect it to manage your app’s own roles and permissions — that stays in your system.', 'Ummeed ki yeh aapke app ke apne roles aur permissions sambhalega — woh aapke system mein rehta hai.'),
    ],
    decisions: [
      bi('Protocol: OIDC, SAML or OAuth 2.0.', 'Protocol: OIDC, SAML ya OAuth 2.0.'),
    ],
    confusedWith: [
      { type: 'auth-service', difference: bi('The IdP proves identity (outside your system); your auth service consumes that proof and manages your app’s sessions and tokens.', 'IdP identity saabit karta hai (aapke system ke bahar); aapki auth service us saboot ko leti hai aur app ke sessions aur tokens sambhalti hai.'), compare: 'auth-service-vs-identity-provider-vs-api-gateway' },
    ],
    examples: ['Google Identity', 'Okta', 'Microsoft Entra ID', 'Auth0 (as IdP)'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'media-server',
    tagline: bi('A live switchboard for audio and video calls — forwards each person’s stream to the others.', 'Audio aur video calls ka live switchboard — har insaan ki stream doosron tak forward karta hai.'),
    intro: bi(
      'A media server handles real-time audio and video between participants. The most common type is an SFU (Selective Forwarding Unit): each participant uploads their stream once, and the SFU forwards it to everyone else, choosing quality per receiver — without decoding or mixing the video.\n\nIt works with WebRTC over UDP for very low latency. Signalling (who joins, which media to send) happens separately, usually over WebSockets.',
      'Media server participants ke beech real-time audio aur video sambhalta hai. Sabse common type SFU (Selective Forwarding Unit) hai: har participant apni stream ek baar upload karta hai, aur SFU use baaki sabko forward karta hai, har receiver ke liye quality chunte hue — bina video decode ya mix kiye.\n\nYeh bahut kam latency ke liye UDP par WebRTC ke saath kaam karta hai. Signalling (kaun judta hai, kaunsa media bhejna) alag hoti hai, aam taur par WebSockets par.',
    ),
    problem: bi(
      'In a peer-to-peer (mesh) call, every participant sends their video to every other participant. With 8 people, each phone uploads 7 video streams — the upload link chokes, the phone heats up and the call freezes.',
      'Peer-to-peer (mesh) call mein har participant apna video har doosre participant ko bhejta hai. 8 logon ke saath har phone 7 video streams upload karta hai — upload link ghut jaata hai, phone garam hota hai aur call jam jaati hai.',
    ),
    before: scene(
      [[a('p1', 'Video', 'Person 1', { note: 'uploads ×7', state: 'bad' }), a('p2', 'Video', 'Person 2')], [a('p3', 'Video', 'Person 3'), a('p4', 'Video', 'Person 4')]],
      ['p1<>p2', 'p1<>p3', 'p1<>p4', 'p2<>p3', 'p2<>p4', 'p3<>p4'],
      bi('Mesh: everyone sends to everyone — uploads explode as the call grows.', 'Mesh: har koi har kisi ko bhejta hai — call badhne par uploads phat jaate hain.'),
    ),
    solution: bi(
      'Each participant sends one stream to the SFU, which forwards it to the others, picking a lower-quality layer for people on weak networks. Uploads stay constant as the meeting grows.',
      'Har participant SFU ko ek stream bhejta hai, jo use doosron ko forward karta hai, kamzor network walon ke liye kam-quality layer chunte hue. Meeting badhne par bhi uploads same rehte hain.',
    ),
    after: scene(
      [[a('p1', 'Video', 'Person 1'), a('p2', 'Video', 'Person 2')], [c('media-server', { state: 'focus', note: 'one upload each' })], [a('p3', 'Video', 'Person 3'), a('p4', 'Video', 'Person 4')]],
      ['p1<>media-server', 'p2<>media-server', 'media-server<>p3', 'media-server<>p4'],
      bi('Each person uploads once; the SFU forwards streams to everyone.', 'Har insaan ek baar upload karta hai; SFU streams sabko forward karta hai.'),
    ),
    steps: [
      bi('Participants join through a signalling server and are assigned to an SFU.', 'Participants signalling server se judte hain aur ek SFU assign hota hai.'),
      bi('Each sends its audio/video once (often in several quality layers — simulcast).', 'Har ek apna audio/video ek baar bhejta hai (aksar kai quality layers mein — simulcast).'),
      bi('The SFU forwards packets to each receiver, choosing the layer that fits their bandwidth.', 'SFU har receiver ko packets forward karta hai, unki bandwidth ke layak layer chunte hue.'),
      bi('Large or global meetings cascade between SFUs in different regions.', 'Badi ya global meetings alag regions ke SFUs ke beech cascade hoti hain.'),
    ],
    analogy: {
      icons: ['Mic', 'Radio', 'Users'],
      title: bi('A conference room’s sound system', 'Conference room ka sound system'),
      text: bi(
        'Instead of every speaker shouting to every listener, each speaker talks into one microphone and the sound system sends their voice to all the speakers in the room — louder for those at the back. One input per person, delivered to everyone.',
        'Har bolne wala har sunne wale ko chillaaye, iske bajaye har bolne wala ek microphone mein bolta hai aur sound system unki awaaz kamre ke saare speakers tak bhejta hai — peeche walon ke liye tez. Har insaan ka ek input, sabko delivered.',
      ),
    },
    perfectFit: {
      title: bi('Group video calls and online classes', 'Group video calls aur online classes'),
      text: bi(
        'A tutoring platform runs classes with 30 students. SFUs keep each student’s upload to one stream, adapt quality for weak networks and add regional servers so students far away still get low latency.',
        'Ek tutoring platform 30 students ki classes chalata hai. SFUs har student ka upload ek stream tak rakhte hain, kamzor networks ke liye quality adapt karte hain aur regional servers jodte hain taaki door ke students ko bhi kam latency mile.',
      ),
      why: [
        bi('Real-time two-way audio/video.', 'Real-time do-taraf audio/video.'),
        bi('More than a handful of participants.', 'Mutthi bhar se zyada participants.'),
        bi('Mixed network quality.', 'Alag-alag network quality.'),
      ],
    },
    avoidWhen: [
      bi('You stream one-to-many to thousands of viewers who do not talk back — use transcoding and a CDN (live streaming).', 'Hazaaron viewers ko ek-se-kai stream karna jo jawab nahi dete — transcoding aur CDN use karo (live streaming).'),
      bi('You process uploaded videos — that is a transcoder.', 'Upload hue videos process karne — yeh transcoder hai.'),
    ],
    decisions: [
      bi('Topology: mesh (tiny calls), SFU (most) or MCU (mixes into one stream).', 'Topology: mesh (chhoti calls), SFU (zyada tar) ya MCU (ek stream mein mix).'),
      bi('Instances and regions (cascading).', 'Instances aur regions (cascading).'),
    ],
    confusedWith: [
      { type: 'transcoder', difference: bi('Media server: live, two-way, milliseconds. Transcoder: offline conversion of stored files.', 'Media server: live, do-taraf, milliseconds. Transcoder: stored files ka offline conversion.'), compare: 'media-server-vs-transcoder-vs-cdn' },
      { type: 'websocket-server', difference: bi('WebSockets carry signalling and chat messages; the media server carries the audio and video.', 'WebSockets signalling aur chat messages le jaate hain; media server audio aur video.') },
    ],
    examples: ['mediasoup', 'Janus', 'LiveKit', 'Jitsi Videobridge'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'matching-engine',
    tagline: bi('The heart of an exchange: pairs buyers with sellers in strict, fair order.', 'Exchange ka dil: kharidaron ko bechne walon se sakht, nyaypoorn order mein milata hai.'),
    intro: bi(
      'A matching engine keeps an order book for each market — buy orders sorted by highest price, sell orders by lowest — and matches incoming orders against it by price-time priority. It must be deterministic: the same sequence of orders always produces the same trades.\n\nTo be fast and fair, each market’s book is usually processed by a single thread in memory, with every input written to a log so the state can be rebuilt exactly after a crash.',
      'Matching engine har market ke liye order book rakhta hai — buy orders sabse oonchi price se sorted, sell orders sabse neechi se — aur aane wale orders ko price-time priority se match karta hai. Ise deterministic hona chahiye: orders ka same kram hamesha same trades banata hai.\n\nTez aur nyaypoorn rehne ke liye har market ki book aam taur par memory mein ek single thread process karti hai, har input log mein likha jaata hai taaki crash ke baad state bilkul dobara ban sake.',
    ),
    problem: bi(
      'An early exchange matched orders using database transactions from many app servers. Under load, two servers matched the same sell order to different buyers, timing differences broke price-time priority, and the database could not keep up.',
      'Ek shuruaati exchange kai app servers se database transactions use karke orders match karta tha. Load mein do servers ne same sell order ko alag buyers se match kar diya, timing ke farak ne price-time priority tod di, aur database saath nahi de paaya.',
    ),
    before: scene(
      [[c('app-server', { id: 'a1', label: 'Server A' }), c('app-server', { id: 'a2', label: 'Server B' })], [c('sql-db', { label: 'Orders table', note: 'same order matched twice', state: 'bad' })]],
      ['a1!>sql-db', 'a2!>sql-db'],
      bi('Concurrent matching in a shared database breaks fairness and correctness.', 'Shared database mein ek saath matching nyay aur sahi-pan tod deti hai.'),
    ),
    solution: bi(
      'Orders are sequenced into a log, and one matching engine per market applies them one at a time in memory. Trades are published as events; a hot standby replays the same log to take over instantly.',
      'Orders ek log mein kram se lagte hain, aur har market ka ek matching engine unhe memory mein ek-ek karke laagu karta hai. Trades events ki tarah publish hote hain; hot standby wahi log replay karke turant sambhal leta hai.',
    ),
    after: scene(
      [[c('api-gateway')], [c('message-queue', { label: 'Sequenced orders' })], [c('matching-engine', { state: 'focus', note: 'one book, one thread' })], [c('event-stream', { label: 'Trades' })]],
      ['api-gateway~>message-queue', 'message-queue~>matching-engine', 'matching-engine~>event-stream'],
      bi('A single sequenced, in-memory engine per market matches fairly and fast.', 'Har market ka ek sequenced, in-memory engine nyaypoorn aur tez match karta hai.'),
    ),
    steps: [
      bi('Validated orders are appended to a sequenced log (the single source of order).', 'Validated orders ek sequenced log mein jodte hain (kram ka akela source).'),
      bi('The engine reads them one by one and matches against the opposite side of the book.', 'Engine unhe ek-ek padhkar book ki ulti side se match karta hai.'),
      bi('Best price first; at the same price, earliest order first.', 'Pehle best price; same price par pehla order pehle.'),
      bi('Each fill is emitted as a trade event for settlement, balances and market data.', 'Har fill settlement, balances aur market data ke liye trade event bankar nikalta hai.'),
      bi('A standby replays the same log, ready to take over with identical state.', 'Standby wahi log replay karta hai, same state ke saath sambhalne ko ready.'),
    ],
    analogy: {
      icons: ['Gavel', 'Users', 'ListOrdered'],
      title: bi('An auctioneer with a single queue', 'Ek line wala neelaam karne wala'),
      text: bi(
        'At a fish market auction, one auctioneer takes bids in the order they are called and always gives the fish to the best offer — and if two offers are equal, to whoever called first. Two auctioneers selling the same fish at once would cause chaos.',
        'Machhli bazaar ki neelaami mein ek neelaam karne wala boliyan us kram mein leta hai jismein woh lagti hain aur hamesha machhli best offer ko deta hai — aur do offers barabar hon toh pehle bolne wale ko. Ek hi machhli do log ek saath bechein toh hungama ho jaaye.',
      ),
    },
    perfectFit: {
      title: bi('A stock or crypto exchange', 'Stock ya crypto exchange'),
      text: bi(
        'Millions of orders per second must be matched fairly with microsecond latency, and regulators require an exact audit trail. A deterministic, sequenced matching engine per instrument is the standard design.',
        'Har second lakhon orders microsecond latency mein nyaypoorn tarah match hone chahiye, aur regulators ko bilkul sahi audit trail chahiye. Har instrument ka deterministic, sequenced matching engine standard design hai.',
      ),
      why: [
        bi('Strict ordering and fairness are legally required.', 'Sakht kram aur nyay kanooni roop se zaroori hai.'),
        bi('Latency must be tiny.', 'Latency bahut kam honi chahiye.'),
        bi('State must be rebuildable exactly.', 'State bilkul dobara banne layak honi chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You match riders with drivers or users with each other by distance and preference — that is a matching service, not an order-book engine.', 'Riders ko drivers se ya users ko doori aur pasand se milana — yeh matching service hai, order-book engine nahi.'),
      bi('You run several active engines on the same book — fairness breaks.', 'Same book par kai active engines chalana — nyay toot jaata hai.'),
    ],
    decisions: [
      bi('Standby: none or hot standby replaying the log.', 'Standby: none ya log replay karta hot standby.'),
      bi('Persistence: event log, or snapshots plus log.', 'Persistence: event log, ya snapshots plus log.'),
    ],
    confusedWith: [
      { type: 'sql-db', difference: bi('A database stores orders; the matching engine decides trades in strict sequence in memory and publishes them.', 'Database orders store karta hai; matching engine memory mein sakht kram mein trades decide karke publish karta hai.') },
    ],
    examples: ['LMAX Disruptor-style engines', 'Nasdaq-style exchange engines', 'Custom C++/Java engines', 'Crypto exchange cores'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'external-api',
    tagline: bi('Someone else’s service you depend on — useful, but outside your control.', 'Kisi aur ki service jis par aap nirbhar ho — kaam ki, lekin aapke control ke bahar.'),
    intro: bi(
      'A third-party API is a service run by another company: airline inventory, a maps and routing provider, a shipping partner, a government verification system. You call it over the internet and use its answers in your product.\n\nYou cannot fix it, scale it or change its limits. It can be slow, rate-limited, down for maintenance or return odd data. Good designs isolate it behind your own connector with timeouts, retries, circuit breakers and caching.',
      'Third-party API kisi doosri company ki chalayi service hai: airline inventory, maps aur routing provider, shipping partner, government verification system. Aap ise internet par call karte ho aur iske jawab apne product mein use karte ho.\n\nAap ise theek, scale ya iski limits badal nahi sakte. Yeh slow, rate-limited, maintenance ke liye down ho sakti hai ya ajeeb data lauta sakti hai. Achhe designs ise apne connector ke peeche timeouts, retries, circuit breakers aur caching ke saath alag rakhte hain.',
    ),
    problem: bi(
      'A travel site called five airline APIs directly from every search request. When one airline’s API slowed to 20 seconds, every search waited 20 seconds — and the site’s own servers ran out of threads.',
      'Ek travel site har search request se seedha paanch airline APIs call karti thi. Jab ek airline ki API 20 seconds tak slow hui, har search ne 20 seconds wait kiya — aur site ke apne servers ke threads khatam ho gaye.',
    ),
    before: scene(
      [[c('web-client')], [c('app-server', { note: 'threads exhausted', state: 'bad' })], [c('external-api', { id: 'x1', label: 'Airline A' }), c('external-api', { id: 'x2', label: 'Airline B', note: '20 s responses', state: 'bad' })]],
      ['web-client>app-server', 'app-server>x1', 'app-server!>x2'],
      bi('One slow partner drags down your whole product.', 'Ek slow partner aapka poora product neeche kheench leta hai.'),
    ),
    solution: bi(
      'Calls go through a connector service with short timeouts, retries with back-off and a circuit breaker that stops calling a failing partner for a while. Results are cached, and the product shows partial results rather than waiting.',
      'Calls ek connector service se guzarti hain jismein chhote timeouts, back-off ke saath retries aur circuit breaker hai jo fail hote partner ko kuch der call karna band karta hai. Results cache hote hain, aur product wait karne ke bajaye adhoore results dikhata hai.',
    ),
    after: scene(
      [[c('app-server')], [c('microservice', { label: 'Connector', state: 'focus', note: 'timeout · breaker · cache' })], [c('external-api', { id: 'x1', label: 'Airline A' }), c('external-api', { id: 'x2', label: 'Airline B', state: 'muted' })]],
      ['app-server>microservice', 'microservice>x1', ['microservice.>x2', 'breaker open']],
      bi('A protective connector keeps a misbehaving partner from hurting you.', 'Ek bachane wala connector bigde partner ko aapko nuksaan pahunchane se rokta hai.'),
    ),
    steps: [
      bi('Wrap each partner in a connector you own.', 'Har partner ko apne maalikana connector mein lapeto.'),
      bi('Set short timeouts and limited retries with back-off.', 'Chhote timeouts aur back-off ke saath seemit retries rakho.'),
      bi('Use a circuit breaker so repeated failures stop calls temporarily.', 'Circuit breaker use karo taaki baar-baar ki failures calls ko kuch der rok dein.'),
      bi('Respect their rate limits and cache answers where allowed.', 'Unki rate limits maano aur jahan allowed ho jawab cache karo.'),
      bi('Make writes idempotent and queue them if they can happen later.', 'Writes ko idempotent banao aur baad mein ho sakte hon toh queue karo.'),
    ],
    analogy: {
      icons: ['Handshake', 'Truck', 'Clock'],
      title: bi('A supplier for your restaurant', 'Aapke restaurant ka supplier'),
      text: bi(
        'Your restaurant relies on a vegetable supplier. You cannot control their trucks, so you keep some stock, have a backup supplier, and stop waiting if a delivery is an hour late. You plan for them to fail sometimes.',
        'Aapka restaurant ek sabzi supplier par nirbhar hai. Aap unke trucks control nahi kar sakte, isliye kuch stock rakhte ho, backup supplier rakhte ho, aur delivery ek ghanta late ho toh wait karna band karte ho. Aap unke kabhi-kabhi fail hone ki planning karte ho.',
      ),
    },
    perfectFit: {
      title: bi('Flight search across many airlines', 'Kai airlines mein flight search'),
      text: bi(
        'A travel aggregator must ask dozens of airline and hotel APIs for prices. Connectors with timeouts and circuit breakers return whatever arrives within two seconds, cache recent results and never let one slow supplier stall the page.',
        'Travel aggregator ko darjanon airline aur hotel APIs se prices poochne hain. Timeouts aur circuit breakers wale connectors do second mein jo aaye woh lautaate hain, haal ke results cache karte hain aur ek slow supplier ko page rokne nahi dete.',
      ),
      why: [
        bi('The data only exists in the partner’s system.', 'Data sirf partner ke system mein hai.'),
        bi('Partners are slow or unreliable at times.', 'Partners kabhi slow ya bharose-layak nahi hote.'),
        bi('Your product must stay responsive anyway.', 'Aapka product phir bhi responsive rehna chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You call it directly from browsers with your API key inside — keys leak.', 'Ise browsers se apni API key andar rakh ke seedha call karna — keys leak hoti hain.'),
      bi('You assume it is always up and fast.', 'Maan lena ki yeh hamesha up aur tez hai.'),
    ],
    decisions: [
      bi('Timeouts, retries and circuit breakers on the calling service.', 'Calling service par timeouts, retries aur circuit breakers.'),
      bi('What to cache and for how long.', 'Kya cache karna hai aur kitni der.'),
    ],
    confusedWith: [
      { type: 'payment-provider', difference: bi('A payment provider is a special external API for money, with webhooks, idempotency and reconciliation.', 'Payment provider paise ke liye khaas external API hai, webhooks, idempotency aur reconciliation ke saath.') },
    ],
    examples: ['Google Maps Platform', 'Amadeus / Sabre (travel)', 'Shipping carrier APIs', 'Government KYC APIs'],
  },
];
