import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const storageGuides: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'sql-db',
    tagline: bi('Tables with strict rules — the safest home for money, orders and anything that must add up.', 'Sakht rules wali tables — paise, orders aur har us cheez ka sabse surakshit ghar jiska hisaab milna chahiye.'),
    intro: bi(
      'A SQL (relational) database stores data in tables with rows and columns — users, orders, payments — and links them with keys. You ask questions in SQL, such as “all orders by this user in March, with their items”.\n\nIts superpower is transactions: several changes either all happen or none do. When you move ₹500 from Asha to Ravi, the database guarantees money is never deducted without being added. Examples are PostgreSQL and MySQL.',
      'SQL (relational) database data ko rows aur columns wali tables mein rakhta hai — users, orders, payments — aur unhe keys se jodta hai. Aap SQL mein sawaal poochte ho, jaise “is user ke March ke saare orders, unke items ke saath”.\n\nIski superpower transactions hai: kai changes ya toh saare hote hain ya ek bhi nahi. Jab aap Asha se Ravi ko ₹500 bhejte ho, database guarantee karta hai ki paise kabhi kate bina jude nahi rahenge. Examples: PostgreSQL aur MySQL.',
    ),
    problem: bi(
      'Before databases, apps wrote data into plain files. Two people booking the last seat at the same time could both succeed, a crash halfway through a payment left money missing, and answering a new question meant writing a new program to scan every file.',
      'Databases se pehle apps data plain files mein likhte the. Aakhri seat ek saath book karne wale do log dono successful ho sakte the, payment ke beech crash hone par paise gayab ho jaate, aur naya sawaal poochne ke liye har file scan karne wala naya program likhna padta.',
    ),
    before: scene(
      [[a('u1', 'User', 'Asha'), a('u2', 'User', 'Ravi')], [c('app-server')], [a('file', 'FileText', 'seats.txt', { note: 'seat 12A sold twice', state: 'bad' })]],
      ['u1>app-server', 'u2>app-server', ['app-server!>file', 'both write']],
      bi('Two writes at once, no rules: the last seat is sold twice.', 'Ek saath do writes, koi rule nahi: aakhri seat do baar bik gayi.'),
    ),
    solution: bi(
      'A SQL database checks rules on every write (unique seat, positive balance), runs related changes in one transaction, and locks or versions rows so concurrent updates cannot both win. Replication keeps a standby copy ready if the main machine fails.',
      'SQL database har write par rules check karta hai (unique seat, positive balance), jude hue changes ek transaction mein chalata hai, aur rows ko lock ya version karta hai taaki ek saath ke updates dono na jeet sakein. Replication standby copy ready rakhta hai agar main machine fail ho.',
    ),
    after: scene(
      [[a('u1', 'User', 'Asha'), a('u2', 'User', 'Ravi')], [c('app-server')], [c('sql-db', { state: 'focus', note: 'one transaction wins' })]],
      [['u1>app-server', 'book 12A'], ['u2>app-server', 'book 12A'], ['app-server>sql-db', 'transaction']],
      bi('Transactions and constraints: exactly one booking succeeds, the other gets “seat taken”.', 'Transactions aur constraints: bilkul ek booking safal, doosre ko “seat taken” milta hai.'),
    ),
    steps: [
      bi('You design tables (users, orders, order_items) and the links between them.', 'Aap tables (users, orders, order_items) aur unke beech ke links design karte ho.'),
      bi('Constraints protect the data: unique emails, valid foreign keys, non-negative balances.', 'Constraints data ko bachate hain: unique emails, valid foreign keys, non-negative balances.'),
      bi('Changes that belong together run in a transaction — all or nothing.', 'Saath chalne wale changes transaction mein chalte hain — sab ya kuch nahi.'),
      bi('Indexes make common lookups fast (orders by user_id).', 'Indexes common lookups ko tez banate hain (user_id se orders).'),
      bi('A replica follows the leader so the database survives a machine failure.', 'Ek replica leader ko follow karta hai taaki machine fail hone par bhi database bacha rahe.'),
    ],
    analogy: {
      icons: ['Landmark', 'NotebookPen', 'Stamp'],
      title: bi('A bank’s ledger book', 'Bank ki ledger book'),
      text: bi(
        'A bank clerk records every transfer in a ledger with fixed columns: date, from, to, amount. A transfer is only written if both the debit and the credit lines are written together, and the books must always balance at the end of the day.\n\nThe rules are strict, which is exactly why you trust the bank with your money.',
        'Bank clerk har transfer ko fixed columns wali ledger mein likhta hai: date, from, to, amount. Transfer tabhi likha jaata hai jab debit aur credit dono lines ek saath likhi jaayein, aur din ke ant mein hisaab hamesha milna chahiye.\n\nRules sakht hain, aur isi wajah se aap bank par apne paison ke liye bharosa karte ho.',
      ),
    },
    perfectFit: {
      title: bi('Orders and payments in an online store', 'Online store ke orders aur payments'),
      text: bi(
        'Placing an order must reduce stock, create the order and record the payment together. If any step fails, nothing should change. A SQL database with transactions makes that a few lines of code instead of a nightmare of half-finished orders.',
        'Order place karne par stock ghatna, order banna aur payment record hona — teeno saath hone chahiye. Koi bhi step fail ho toh kuch nahi badalna chahiye. Transactions wala SQL database ise kuch lines ka code bana deta hai, adhoore orders ka bura sapna nahi.',
      ),
      why: [
        bi('Several related rows must change together.', 'Kai jude hue rows ek saath badalne chahiye.'),
        bi('Correctness matters more than extreme write speed.', 'Correctness extreme write speed se zyada zaroori hai.'),
        bi('You need flexible questions (joins, filters, reports).', 'Aapko flexible sawaal chahiye (joins, filters, reports).'),
      ],
    },
    avoidWhen: [
      bi('You must store billions of simple key-value records with huge write rates — a NoSQL store scales out more easily.', 'Bahut tez write rate ke saath arabon simple key-value records rakhne hain — NoSQL store aasani se scale out hota hai.'),
      bi('You store big files (videos, PDFs) inside it — keep files in object storage and only the link in the database.', 'Isme bade files (videos, PDFs) rakhna — files object storage mein rakho aur database mein sirf link.'),
      bi('Full-text search across millions of documents — use a search index.', 'Lakhon documents mein full-text search — search index use karo.'),
    ],
    decisions: [
      bi('Replication: none, async leader-follower (fast) or sync (no data loss on failover).', 'Replication: none, async leader-follower (tez) ya sync (failover par data loss nahi).'),
      bi('Concurrency control: optimistic versions, locks or serializable transactions.', 'Concurrency control: optimistic versions, locks ya serializable transactions.'),
      bi('Backups: daily snapshots or point-in-time recovery.', 'Backups: daily snapshots ya point-in-time recovery.'),
    ],
    confusedWith: [
      { type: 'nosql-db', difference: bi('SQL gives strict tables, joins and multi-row transactions; NoSQL gives flexible records that spread across many machines easily, usually accessed by a key.', 'SQL sakht tables, joins aur multi-row transactions deta hai; NoSQL flexible records deta hai jo aasani se kai machines mein phail jaate hain, aam taur par key se access.'), compare: 'sql-vs-nosql' },
      { type: 'data-warehouse', difference: bi('SQL databases run the live app (many small reads/writes); a warehouse answers big analytical questions over history.', 'SQL databases live app chalate hain (kai chhote reads/writes); warehouse history par bade analytical sawaalon ka jawab deta hai.'), compare: 'sql-vs-data-warehouse-vs-time-series' },
      { type: 'object-storage', difference: bi('Databases hold structured records you query; object storage holds whole files you fetch by name.', 'Databases structured records rakhte hain jinhe query karte ho; object storage poori files rakhta hai jinhe naam se laate ho.'), compare: 'database-vs-object-storage' },
    ],
    examples: ['PostgreSQL', 'MySQL', 'Amazon Aurora', 'Microsoft SQL Server'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'nosql-db',
    tagline: bi('Flexible records spread over many machines — built for huge scale and simple lookups.', 'Kai machines par faile flexible records — bahut bade scale aur simple lookups ke liye bana.'),
    intro: bi(
      'A NoSQL database stores data without fixed tables: as key-value pairs, JSON documents or wide rows. Each record is usually found by a key (user id, chat id), and the data is automatically split across many machines.\n\nThat makes it great at enormous read and write volumes — millions per second — as long as you design around the questions you will ask. Joins and multi-record transactions are limited or absent. Examples are DynamoDB, Cassandra and MongoDB.',
      'NoSQL database fixed tables ke bina data rakhta hai: key-value pairs, JSON documents ya wide rows ke roop mein. Har record aam taur par ek key (user id, chat id) se milta hai, aur data apne aap kai machines mein baant jaata hai.\n\nIsliye yeh bahut zyada reads aur writes — lakhon per second — mein bahut achha hai, bas design un sawaalon ke hisaab se karna hota hai jo aap poochoge. Joins aur multi-record transactions limited ya gayab hote hain. Examples: DynamoDB, Cassandra aur MongoDB.',
    ),
    problem: bi(
      'A chat app storing every message in one SQL server hit a wall: billions of rows, tens of thousands of writes per second, and one machine can only grow so big. Splitting it by hand was painful and every schema change locked huge tables.',
      'Har message ek SQL server mein rakhne wala chat app deewar se takraya: arabon rows, har second hazaaron writes, aur ek machine ek hadd tak hi badi ho sakti hai. Haath se todna mushkil tha aur har schema change bade tables ko lock kar deta tha.',
    ),
    before: scene(
      [[c('app-server', { id: 'a1' }), c('app-server', { id: 'a2' }), c('app-server', { id: 'a3' })], [c('sql-db', { label: 'One SQL server', note: 'disk & CPU maxed', state: 'bad' })]],
      ['a1>sql-db', 'a2>sql-db', 'a3>sql-db'],
      bi('Every write funnels into one machine that cannot grow any further.', 'Har write ek hi machine mein jaata hai jo aur bada nahi ho sakta.'),
    ),
    solution: bi(
      'A NoSQL database spreads records across many nodes by a partition key (for example chat_id), keeps several copies of each, and lets you add nodes as data grows. Reads and writes by key stay fast no matter how big the data gets.',
      'NoSQL database partition key (jaise chat_id) ke hisaab se records kai nodes mein baantta hai, har ek ki kai copies rakhta hai, aur data badhne par nodes jodne deta hai. Key se reads aur writes tez rehte hain, data kitna bhi bada ho.',
    ),
    after: scene(
      [[c('app-server')], [c('nosql-db', { state: 'focus', note: 'partition key: chat_id' })], [a('n1', 'Server', 'Node A', { note: 'chats A–H' }), a('n2', 'Server', 'Node B', { note: 'chats I–P' }), a('n3', 'Server', 'Node C', { note: 'chats Q–Z' })]],
      ['app-server>nosql-db', 'nosql-db>n1', 'nosql-db>n2', 'nosql-db>n3'],
      bi('Data is split by key across nodes; add nodes as you grow.', 'Data key ke hisaab se nodes mein baantta hai; badhne par nodes jodo.'),
    ),
    steps: [
      bi('List the questions you will ask (“latest 50 messages of chat X”).', 'Woh sawaal likho jo poochoge (“chat X ke latest 50 messages”).'),
      bi('Pick a partition key that spreads load evenly (chat_id, user_id).', 'Aisi partition key chuno jo load barabar baante (chat_id, user_id).'),
      bi('The database hashes the key to decide which node stores the record.', 'Database key ko hash karke decide karta hai ki record kaunsa node rakhega.'),
      bi('Each record is copied to several nodes (replication factor 3) so a node can die safely.', 'Har record kai nodes par copy hota hai (replication factor 3) taaki ek node mar bhi jaaye toh safe rahe.'),
      bi('You choose consistency per request: fast eventual reads or slower strongly consistent ones.', 'Har request ke liye consistency chuno: tez eventual reads ya dheemi strongly consistent.'),
    ],
    analogy: {
      icons: ['Library', 'Book', 'MapPin'],
      title: bi('A library split by the first letter of the author', 'Author ke pehle akshar se bati library'),
      text: bi(
        'A gigantic library cannot fit in one room, so books are split into rooms by the author’s first letter: room A–H, I–P, Q–Z. To find a book you only need the author’s name — you walk straight to the right room. Need more space? Add a room and move some letters over.\n\nBut a question like “all books published in 1995” means visiting every room. NoSQL is fast for the questions you planned for.',
        'Ek bahut badi library ek kamre mein nahi aa sakti, isliye books author ke pehle akshar se kamron mein baant di jaati hain: room A–H, I–P, Q–Z. Book dhundhne ke liye bas author ka naam chahiye — seedha sahi kamre mein jaao. Aur jagah chahiye? Ek kamra jodo aur kuch akshar wahan shift karo.\n\nLekin “1995 mein chhapi saari books” jaisa sawaal har kamre mein jaana hai. NoSQL un sawaalon ke liye tez hai jinki planning aapne ki.',
      ),
    },
    perfectFit: {
      title: bi('Chat messages for a messaging app', 'Messaging app ke chat messages'),
      text: bi(
        'Messages are always read as “the latest messages of this chat”, written at enormous rates and never updated together with other chats. A wide-column NoSQL store partitioned by chat_id and sorted by time answers that in milliseconds at any scale.',
        'Messages hamesha “is chat ke latest messages” ki tarah padhe jaate hain, bahut tez rate par likhe jaate hain aur kabhi doosri chats ke saath milkar update nahi hote. chat_id se partitioned aur time se sorted wide-column NoSQL store kisi bhi scale par milliseconds mein jawab deta hai.',
      ),
      why: [
        bi('Access is always by one key.', 'Access hamesha ek key se hota hai.'),
        bi('Write volume is far beyond one machine.', 'Write volume ek machine se bahut zyada hai.'),
        bi('No transactions across different chats are needed.', 'Alag chats ke beech transactions ki zaroorat nahi.'),
      ],
    },
    avoidWhen: [
      bi('You need to update several records together atomically (moving money between accounts).', 'Kai records ko atomically ek saath update karna hai (accounts ke beech paise bhejna).'),
      bi('Your questions change all the time and need joins — SQL is far more flexible.', 'Aapke sawaal hamesha badalte hain aur joins chahiye — SQL kahin zyada flexible hai.'),
      bi('You pick a partition key where one value is huge (a celebrity) — that node becomes a hot spot.', 'Aisi partition key chunna jahan ek value bahut badi ho (celebrity) — woh node hot spot ban jaata hai.'),
    ],
    decisions: [
      bi('Data model: key-value, document or wide-column.', 'Data model: key-value, document ya wide-column.'),
      bi('Partition key — the single most important choice.', 'Partition key — sabse zaroori faisla.'),
      bi('Replication factor and consistency (strong, quorum or eventual).', 'Replication factor aur consistency (strong, quorum ya eventual).'),
    ],
    confusedWith: [
      { type: 'sql-db', difference: bi('NoSQL trades joins and multi-record transactions for easy horizontal scale; SQL keeps strong rules and flexible queries.', 'NoSQL joins aur multi-record transactions chhod ke aasan horizontal scale deta hai; SQL sakht rules aur flexible queries rakhta hai.'), compare: 'sql-vs-nosql' },
      { type: 'distributed-cache', difference: bi('Both look like key-value stores, but a NoSQL database is the durable source of truth; a cache is a fast, temporary copy that may disappear.', 'Dono key-value stores jaise dikhte hain, lekin NoSQL database durable source of truth hai; cache tez, temporary copy hai jo gayab ho sakti hai.'), compare: 'nosql-vs-distributed-cache' },
      { type: 'sharded-db', difference: bi('A NoSQL store shards automatically; a sharded database is usually SQL split across machines by your chosen shard key.', 'NoSQL store apne aap shard hota hai; sharded database aam taur par SQL hai jo aapki chuni shard key se machines mein bata hai.') },
    ],
    examples: ['Amazon DynamoDB', 'Apache Cassandra', 'MongoDB', 'Google Bigtable'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'read-replica',
    tagline: bi('A read-only twin of your database that takes the reading load off it.', 'Aapke database ka read-only judwa jo padhne ka bojh uthata hai.'),
    intro: bi(
      'A read replica is a copy of your main (primary) database that receives every change shortly after it happens. Your app sends writes to the primary and many reads to replicas.\n\nMost apps read far more than they write — a product page is viewed thousands of times for every edit. Replicas let you multiply read capacity, and a replica can also be promoted if the primary dies.',
      'Read replica aapke main (primary) database ki copy hai jo har change thodi der baad receive karti hai. Aapka app writes primary ko aur kai reads replicas ko bhejta hai.\n\nZyada tar apps likhne se kahin zyada padhte hain — ek product page har edit ke mukable hazaaron baar dekha jaata hai. Replicas read capacity ko kai guna kar dete hain, aur primary mar jaaye toh replica ko promote bhi kiya ja sakta hai.',
    ),
    problem: bi(
      'One database handled every write and every read. A traffic spike of people browsing products made the database so busy that checkouts — the writes that actually make money — started timing out.',
      'Ek database har write aur har read sambhalta tha. Products browse karne walon ke traffic spike ne database ko itna busy kar diya ki checkouts — woh writes jo sach mein paisa kamaate hain — time out hone lage.',
    ),
    before: scene(
      [[c('app-server', { id: 'r', label: 'Browsing', note: '95% reads' }), c('app-server', { id: 'w', label: 'Checkout', note: 'timing out', state: 'bad' })], [c('sql-db', { label: 'Primary', note: 'overloaded', state: 'bad' })]],
      ['r>sql-db', 'w>sql-db'],
      bi('Reads and writes fight over one database; checkouts suffer.', 'Reads aur writes ek database ke liye ladte hain; checkouts ko nuksaan.'),
    ),
    solution: bi(
      'Add replicas that copy the primary. Send writes (and reads that must be perfectly fresh) to the primary, and the bulk of browsing reads to replicas. Need more read capacity? Add another replica.',
      'Replicas jodo jo primary ko copy karein. Writes (aur woh reads jo bilkul fresh chahiye) primary ko bhejo, aur browsing ke zyada tar reads replicas ko. Aur read capacity chahiye? Ek aur replica jodo.',
    ),
    after: scene(
      [[c('app-server', { id: 'w', label: 'Checkout' }), c('app-server', { id: 'r', label: 'Browsing' })], [c('sql-db', { label: 'Primary', state: 'good' }), c('read-replica', { state: 'focus' })]],
      [['w>sql-db', 'writes'], ['r>read-replica', 'reads'], ['sql-db~>read-replica', 'copy changes']],
      bi('Writes go to the primary; most reads go to replicas that copy it.', 'Writes primary ko jaate hain; zyada tar reads usse copy karne wale replicas ko.'),
    ),
    steps: [
      bi('Every write is applied on the primary.', 'Har write primary par lagta hai.'),
      bi('The primary streams its change log to each replica.', 'Primary apna change log har replica ko stream karta hai.'),
      bi('Replicas apply the changes, usually within milliseconds (replication lag).', 'Replicas changes lagate hain, aam taur par milliseconds mein (replication lag).'),
      bi('The app routes reads that can tolerate a tiny delay to replicas.', 'App woh reads replicas ko bhejta hai jo thodi si der seh sakte hain.'),
      bi('If the primary fails, a replica can be promoted to become the new primary.', 'Primary fail ho toh ek replica ko naya primary banaya ja sakta hai.'),
    ],
    analogy: {
      icons: ['Newspaper', 'Printer', 'Users'],
      title: bi('Photocopies of the notice board', 'Notice board ki photocopies'),
      text: bi(
        'A school has one official notice board where only the principal writes. So many students crowd around it that nobody can read. The office puts photocopies in every corridor — students read the copies, and only the principal touches the original.\n\nA copy may be a few minutes behind the original. That is replication lag.',
        'School mein ek official notice board hai jahan sirf principal likhte hain. Itne students bheed lagaate hain ki koi padh nahi paata. Office har corridor mein photocopies laga deta hai — students copies padhte hain, aur original ko sirf principal chhoote hain.\n\nCopy original se kuch minute peeche ho sakti hai. Yahi replication lag hai.',
      ),
    },
    perfectFit: {
      title: bi('A news site with heavy reading', 'Bahut padhi jaane wali news site'),
      text: bi(
        'Editors publish a few hundred articles a day, but readers load pages millions of times. One primary handles the editors’ writes; four replicas serve readers. If a replica is a second behind, nobody notices.',
        'Editors din mein kuch sau articles publish karte hain, lekin readers pages lakhon baar load karte hain. Ek primary editors ke writes sambhalta hai; chaar replicas readers ko serve karte hain. Replica ek second peeche ho toh kisi ko pata nahi chalta.',
      ),
      why: [
        bi('Reads vastly outnumber writes.', 'Reads writes se bahut zyada hain.'),
        bi('A tiny delay before readers see an edit is fine.', 'Readers ko edit dikhne mein thodi der chalti hai.'),
        bi('Writes fit comfortably on one primary.', 'Writes aaram se ek primary par aa jaate hain.'),
      ],
    },
    avoidWhen: [
      bi('Writes are the bottleneck — replicas do not add any write capacity; shard instead.', 'Bottleneck writes hain — replicas write capacity nahi badhate; sharding karo.'),
      bi('A user must immediately see their own change (“read your writes”) — read from the primary for that.', 'User ko apna change turant dikhna chahiye (“read your writes”) — uske liye primary se padho.'),
      bi('You write to a replica — replicas are read-only.', 'Replica par write karna — replicas read-only hote hain.'),
    ],
    decisions: [
      bi('How many replicas (read capacity and failover options).', 'Kitne replicas (read capacity aur failover options).'),
      bi('Consistency: which reads may be slightly stale and which must go to the primary.', 'Consistency: kaunse reads thode purane chal sakte hain aur kaunse primary ko jaane chahiye.'),
    ],
    confusedWith: [
      { type: 'sharded-db', difference: bi('Replicas copy all the data to scale reads; sharding splits the data into parts to scale writes and storage.', 'Replicas saara data copy karke reads scale karte hain; sharding data ko hisson mein todkar writes aur storage scale karti hai.'), compare: 'read-replica-vs-sharded-db' },
      { type: 'distributed-cache', difference: bi('A replica is a full database copy you can query any way; a cache holds a few hot answers for very fast key lookups.', 'Replica poori database copy hai jise kisi bhi tarah query kar sakte ho; cache bahut tez key lookups ke liye kuch garam jawab rakhta hai.') },
    ],
    examples: ['PostgreSQL streaming replicas', 'MySQL replicas', 'Amazon RDS read replicas', 'Aurora replicas'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'sharded-db',
    tagline: bi('One database cut into pieces, each piece on its own machine.', 'Ek database ko tukdon mein kaata gaya, har tukda apni machine par.'),
    intro: bi(
      'Sharding splits one big dataset into smaller parts called shards, each stored on a different database server. A shard key decides where each row lives — for example, users 1–1 million on shard 1, the next million on shard 2, or a hash of user_id.\n\nBecause each shard holds only part of the data and takes only part of the writes, you can keep growing by adding shards.',
      'Sharding ek bade dataset ko shards naam ke chhote hisson mein todti hai, har ek alag database server par. Shard key decide karti hai ki har row kahan rahegi — jaise users 1–10 lakh shard 1 par, agle 10 lakh shard 2 par, ya user_id ka hash.\n\nKyunki har shard data ka sirf ek hissa rakhta hai aur writes ka sirf ek hissa leta hai, shards jodkar aap badhte reh sakte ho.',
    ),
    problem: bi(
      'A payments database grew to 20 TB and 50,000 writes per second. Even the biggest machine money can buy could not hold it, and read replicas did not help because the problem was writes, not reads.',
      'Ek payments database 20 TB aur 50,000 writes per second tak pahunch gaya. Paise se milne wali sabse badi machine bhi ise nahi rakh payi, aur read replicas ne madad nahi ki kyunki problem writes thi, reads nahi.',
    ),
    before: scene(
      [[c('app-server')], [c('sql-db', { label: 'One huge DB', note: '20 TB · writes maxed', state: 'bad' }), c('read-replica', { note: 'does not help writes', state: 'muted' })]],
      ['app-server!>sql-db', 'sql-db~>read-replica'],
      bi('Writes and storage outgrow one machine; replicas only help reads.', 'Writes aur storage ek machine se bade ho gaye; replicas sirf reads mein madad karte hain.'),
    ),
    solution: bi(
      'Choose a shard key such as account_id and split the data across several databases. A router (or the database itself) sends each query to the shard that owns that key. Each shard is a normal database with its own replicas.',
      'account_id jaisi shard key chuno aur data ko kai databases mein baanto. Ek router (ya khud database) har query ko us shard par bhejta hai jiske paas woh key hai. Har shard apne replicas ke saath ek normal database hai.',
    ),
    after: scene(
      [[c('app-server')], [c('sharded-db', { state: 'focus', note: 'key: account_id' })], [c('sql-db', { id: 's1', label: 'Shard 1' }), c('sql-db', { id: 's2', label: 'Shard 2' }), c('sql-db', { id: 's3', label: 'Shard 3' })]],
      ['app-server>sharded-db', ['sharded-db>s1', 'A–H'], ['sharded-db>s2', 'I–P'], ['sharded-db>s3', 'Q–Z']],
      bi('Each shard owns part of the keys, so writes and storage spread out.', 'Har shard keys ka ek hissa rakhta hai, isliye writes aur storage phail jaate hain.'),
    ),
    steps: [
      bi('Pick a shard key that matches how you query and spreads load evenly.', 'Aisi shard key chuno jo aapke query ke tareeke se mile aur load barabar baante.'),
      bi('Choose a strategy: hash (even spread), range (good for time ranges) or geo (data stays in a region).', 'Strategy chuno: hash (barabar spread), range (time ranges ke liye achha) ya geo (data region mein rehta hai).'),
      bi('Route every query using the key; queries that include the key touch one shard only.', 'Har query key se route karo; key wali queries sirf ek shard ko chhooti hain.'),
      bi('Replicate each shard so one machine failing does not lose data.', 'Har shard ko replicate karo taaki ek machine fail hone par data na khoye.'),
      bi('Re-balance by moving key ranges when a shard gets too big.', 'Koi shard bahut bada ho toh key ranges shift karke rebalance karo.'),
    ],
    analogy: {
      icons: ['FolderOpen', 'Folder', 'Folder'],
      title: bi('Exam papers split by roll number', 'Roll number se baate gaye exam papers'),
      text: bi(
        'One teacher cannot check 3,000 exam papers in a day. So the papers are split by roll number — 1–1000 to teacher A, 1001–2000 to teacher B, 2001–3000 to teacher C. To find your paper you only need your roll number.\n\nBut “find the highest score in the whole school” means asking all three teachers. Choose the split to match the questions you ask most.',
        'Ek teacher ek din mein 3,000 exam papers check nahi kar sakta. Isliye papers roll number se baante jaate hain — 1–1000 teacher A ko, 1001–2000 teacher B ko, 2001–3000 teacher C ko. Apna paper dhundhne ke liye bas roll number chahiye.\n\nLekin “poore school ka highest score” ke liye teeno teachers se poochna padega. Split un sawaalon ke hisaab se chuno jo sabse zyada poochte ho.',
      ),
    },
    perfectFit: {
      title: bi('A wallet ledger for 100 million users', '10 crore users ka wallet ledger'),
      text: bi(
        'Every wallet operation touches one account, writes are huge, and each account’s history must stay strictly consistent. Sharding a SQL ledger by account_id keeps transactions inside one shard while spreading the total load over many machines.',
        'Har wallet operation ek account ko chhoota hai, writes bahut zyada hain, aur har account ki history sakhti se consistent rehni chahiye. SQL ledger ko account_id se shard karne se transactions ek shard ke andar rehte hain aur kul load kai machines par phail jaata hai.',
      ),
      why: [
        bi('Write volume is far beyond one machine.', 'Write volume ek machine se kahin zyada hai.'),
        bi('Almost every query includes the shard key.', 'Lagbhag har query mein shard key hoti hai.'),
        bi('Strong consistency per account is still needed.', 'Har account par strong consistency ab bhi chahiye.'),
      ],
    },
    avoidWhen: [
      bi('Your data fits on one machine — sharding adds a lot of complexity; start with replicas and a bigger server.', 'Data ek machine par aa jaata hai — sharding bahut complexity jodti hai; replicas aur bade server se shuru karo.'),
      bi('Most queries need data from all shards (global reports) — use a warehouse for those.', 'Zyada tar queries ko saare shards ka data chahiye (global reports) — unke liye warehouse use karo.'),
      bi('The shard key is skewed (one celebrity, one huge customer) — one shard melts.', 'Shard key tirchi hai (ek celebrity, ek bahut bada customer) — ek shard pighal jaata hai.'),
    ],
    decisions: [
      bi('Shard key and strategy: hash, consistent hash, range, geo or directory.', 'Shard key aur strategy: hash, consistent hash, range, geo ya directory.'),
      bi('Number of shards to start with.', 'Shuruaat mein kitne shards.'),
      bi('Replication for each shard and how to rebalance.', 'Har shard ka replication aur rebalance kaise karna hai.'),
    ],
    confusedWith: [
      { type: 'read-replica', difference: bi('Replicas copy everything and only scale reads; shards split the data and scale writes and storage.', 'Replicas sab copy karte hain aur sirf reads scale karte hain; shards data todte hain aur writes aur storage scale karte hain.'), compare: 'read-replica-vs-sharded-db' },
      { type: 'nosql-db', difference: bi('Many NoSQL stores shard for you automatically; a sharded database usually means splitting a SQL database yourself.', 'Kai NoSQL stores aapke liye apne aap shard karte hain; sharded database ka matlab aam taur par SQL database ko khud todna hai.') },
    ],
    examples: ['Vitess (MySQL)', 'Citus (PostgreSQL)', 'MongoDB sharding', 'CockroachDB'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'object-storage',
    tagline: bi('An endless, durable cupboard for files — photos, videos, backups.', 'Files ke liye ek kabhi na bharne wali, majboot almari — photos, videos, backups.'),
    intro: bi(
      'Object storage keeps whole files (“objects”) under a name, like photos/42/profile.jpg. You put a file in and get it back by name; it is stored across several machines and data centres so it practically never gets lost.\n\nIt is cheap per gigabyte, scales to petabytes without planning, and pairs naturally with a CDN that delivers the files to users. Amazon S3 is the best-known example.',
      'Object storage poori files (“objects”) ko ek naam ke neeche rakhta hai, jaise photos/42/profile.jpg. Aap file daalte ho aur naam se wapas lete ho; yeh kai machines aur data centres mein store hoti hai, isliye lagbhag kabhi khoti nahi.\n\nPer gigabyte sasta hai, bina planning petabytes tak scale hota hai, aur CDN ke saath natural jodi banata hai jo files users tak pahunchata hai. Amazon S3 sabse mashhoor example hai.',
    ),
    problem: bi(
      'Apps used to save uploads on the app server’s own disk or inside the database. Disks filled up, a server crash lost photos, other servers could not see files saved on one machine, and the database grew huge and slow because of blobs.',
      'Apps pehle uploads app server ki apni disk ya database ke andar save karte the. Disks bhar jaati, server crash hone par photos kho jaati, doosre servers ek machine par saved files dekh nahi paate, aur blobs ki wajah se database bahut bada aur slow ho jaata.',
    ),
    before: scene(
      [[c('web-client')], [c('app-server', { id: 's1', label: 'Server 1', note: 'disk full', state: 'bad' }), c('app-server', { id: 's2', label: 'Server 2', note: 'cannot see file', state: 'bad' })]],
      [['web-client>s1', 'upload'], ['web-client!>s2', 'download']],
      bi('Files saved on one server’s disk: lost on crash, invisible to other servers.', 'Ek server ki disk par saved files: crash par gayab, doosre servers ko dikhti nahi.'),
    ),
    solution: bi(
      'Uploads go to object storage — often directly from the client using a short-lived pre-signed URL. Every server can read any file, durability is handled for you, and the database stores only the file’s name and metadata.',
      'Uploads object storage mein jaate hain — aksar client se seedha, short-lived pre-signed URL se. Har server koi bhi file padh sakta hai, durability aapke liye handle hoti hai, aur database sirf file ka naam aur metadata rakhta hai.',
    ),
    after: scene(
      [[c('web-client')], [c('app-server'), c('cdn')], [c('object-storage', { state: 'focus', note: '11 nines durable' })]],
      [['web-client>app-server', 'get upload URL'], ['web-client>object-storage', 'upload'], ['web-client>cdn', 'download'], 'cdn>object-storage'],
      bi('Files live in durable object storage; the CDN serves them to users.', 'Files majboot object storage mein rehti hain; CDN unhe users tak pahunchata hai.'),
    ),
    steps: [
      bi('The client asks your app for permission to upload; the app returns a pre-signed URL valid for a few minutes.', 'Client app se upload ki permission maangta hai; app kuch minutes ke liye valid pre-signed URL deta hai.'),
      bi('The client uploads the file straight to object storage — your servers never carry the bytes.', 'Client file seedha object storage mein upload karta hai — aapke servers bytes nahi dhote.'),
      bi('Storage keeps copies across machines and zones.', 'Storage machines aur zones mein copies rakhta hai.'),
      bi('Your database stores only the object key and metadata.', 'Aapka database sirf object key aur metadata rakhta hai.'),
      bi('A CDN delivers popular files; lifecycle rules move old files to cheaper tiers or delete them.', 'CDN popular files deliver karta hai; lifecycle rules purani files ko saste tiers mein bhejte ya delete karte hain.'),
    ],
    analogy: {
      icons: ['Warehouse', 'Package', 'Tag'],
      title: bi('A storage warehouse with labelled boxes', 'Label lage boxes wala godown'),
      text: bi(
        'You hand a box to a warehouse and get a label: “Shelf 42, box 7”. You do not care which forklift moves it or which building it sits in — you only need the label to get it back, and the warehouse keeps duplicates in two buildings in case one floods.\n\nYou cannot ask the warehouse “which boxes contain red shirts?” — it only knows labels. That question belongs to a database.',
        'Aap godown ko ek box dete ho aur label milta hai: “Shelf 42, box 7”. Kaunsa forklift ise uthata hai ya kis building mein rakha hai, aapko farak nahi padta — wapas lene ke liye bas label chahiye, aur godown do buildings mein duplicates rakhta hai agar ek mein baadh aa jaaye.\n\nAap godown se nahi pooch sakte “kin boxes mein laal shirts hain?” — use sirf labels pata hain. Woh sawaal database ka hai.',
      ),
    },
    perfectFit: {
      title: bi('Profile photos and videos in a social app', 'Social app mein profile photos aur videos'),
      text: bi(
        'Millions of users upload photos and short videos. Object storage holds every file durably and cheaply, a CDN serves them worldwide, and the posts table just stores the object key — the database stays small and fast.',
        'Lakhon users photos aur chhote videos upload karte hain. Object storage har file ko majbooti aur saste mein rakhta hai, CDN duniya bhar mein serve karta hai, aur posts table bas object key rakhti hai — database chhota aur tez rehta hai.',
      ),
      why: [
        bi('Files are large and written once, read many times.', 'Files badi hain, ek baar likhi aur kai baar padhi jaati hain.'),
        bi('Storage must grow without limits or planning.', 'Storage bina hadd ya planning ke badhna chahiye.'),
        bi('Losing a user’s photo is unacceptable.', 'User ki photo khona manzoor nahi.'),
      ],
    },
    avoidWhen: [
      bi('You need to search inside data or change a few bytes of a record often — use a database.', 'Data ke andar search karna ho ya record ke kuch bytes baar-baar badalne hon — database use karo.'),
      bi('Every file is pushed through your app servers — use pre-signed URLs so clients upload directly.', 'Har file app servers se dhoyi jaaye — pre-signed URLs use karo taaki clients seedha upload karein.'),
      bi('You keep every old file forever in the most expensive tier — add lifecycle rules.', 'Har purani file ko sabse mehenge tier mein hamesha rakhna — lifecycle rules jodo.'),
    ],
    decisions: [
      bi('Upload method: through your service or direct with pre-signed URLs.', 'Upload method: service ke through ya pre-signed URLs se direct.'),
      bi('Durability: standard, multi-zone or cross-region copies.', 'Durability: standard, multi-zone ya cross-region copies.'),
      bi('Lifecycle: move old files to cheaper tiers or expire them.', 'Lifecycle: purani files ko saste tiers mein bhejna ya expire karna.'),
    ],
    confusedWith: [
      { type: 'sql-db', difference: bi('A database answers questions about structured records; object storage stores whole files you fetch by name.', 'Database structured records ke sawaalon ka jawab deta hai; object storage poori files rakhta hai jinhe naam se laate ho.'), compare: 'database-vs-object-storage' },
      { type: 'cdn', difference: bi('Object storage is the permanent home of the file; a CDN keeps temporary copies near users.', 'Object storage file ka permanent ghar hai; CDN users ke paas temporary copies rakhta hai.') },
    ],
    examples: ['Amazon S3', 'Google Cloud Storage', 'Azure Blob Storage', 'MinIO'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'search-index',
    tagline: bi('The index at the back of a book — find every page with a word, instantly.', 'Kitaab ke peeche wala index — ek shabd wale saare pages turant dhundho.'),
    intro: bi(
      'A search index is a special data structure (an inverted index) that maps each word to the documents containing it: “red” → products 4, 19, 233. It also scores results by relevance, handles typos and plurals, and computes filters (“brand: Nike (120)”).\n\nIt is not your source of truth. Your database keeps the real data, and an indexer copies it into the search index, shaped for fast searching.',
      'Search index ek khaas data structure (inverted index) hai jo har shabd ko un documents se jodta hai jismein woh hai: “red” → products 4, 19, 233. Yeh results ko relevance se score bhi karta hai, typos aur plurals sambhalta hai, aur filters ginta hai (“brand: Nike (120)”).\n\nYeh aapka source of truth nahi hai. Aapka database asli data rakhta hai, aur ek indexer use search index mein copy karta hai, tez search ke liye shape karke.',
    ),
    problem: bi(
      'Searching products with SQL’s LIKE \'%red shoes%\' scanned every row on every keystroke. It was slow on millions of products, could not rank the best matches first, and returned nothing for “red shoe” or “rd shoes”.',
      'SQL ke LIKE \'%red shoes%\' se products search karna har keystroke par har row scan karta tha. Lakhon products par slow tha, best matches ko upar rank nahi kar paata tha, aur “red shoe” ya “rd shoes” par kuch nahi lautaata tha.',
    ),
    before: scene(
      [[c('web-client')], [c('app-server')], [c('sql-db', { note: 'full scan per search', state: 'bad' })]],
      ['web-client>app-server', ["app-server!>sql-db", "LIKE '%red%'"]],
      bi('LIKE queries scan everything, cannot rank, and miss typos.', 'LIKE queries sab scan karti hain, rank nahi kar paati, aur typos chhod deti hain.'),
    ),
    solution: bi(
      'Keep the database as the source of truth and feed changes to a search index. Search requests go to the index, which jumps straight to matching documents via the inverted index, ranks them and returns the top results in milliseconds.',
      'Database ko source of truth rakho aur changes search index ko bhejo. Search requests index par jaati hain, jo inverted index se seedha matching documents tak pahunchta hai, unhe rank karta hai aur milliseconds mein top results deta hai.',
    ),
    after: scene(
      [[c('web-client')], [c('search-service', { label: 'Search API' })], [c('search-index', { state: 'focus' })], [c('event-consumer', { label: 'Indexer' })]],
      ['web-client>search-service', ['search-service>search-index', 'query'], ['event-consumer~>search-index', 'updates']],
      bi('Searches hit the inverted index; an indexer keeps it in sync with the database.', 'Searches inverted index par jaati hain; indexer use database ke saath sync rakhta hai.'),
    ),
    steps: [
      bi('When a product changes, an event or job sends it to the indexer.', 'Product badalne par event ya job use indexer ko bhejta hai.'),
      bi('The indexer splits text into words (tokens), normalises them (“Shoes” → “shoe”) and updates the inverted index.', 'Indexer text ko shabdon (tokens) mein todta hai, unhe normalise karta hai (“Shoes” → “shoe”) aur inverted index update karta hai.'),
      bi('A query looks up each word’s list of documents and intersects them.', 'Query har shabd ki documents list dekhti hai aur unka intersection nikaalti hai.'),
      bi('Results are scored by relevance and filtered by facets (price, brand).', 'Results relevance se score hote hain aur facets (price, brand) se filter.'),
      bi('The index is split into shards and replicated for speed and safety.', 'Index speed aur safety ke liye shards mein toota aur replicate hota hai.'),
    ],
    analogy: {
      icons: ['BookOpen', 'Search', 'ListOrdered'],
      title: bi('The index at the back of a textbook', 'Textbook ke peeche ka index'),
      text: bi(
        'To find “photosynthesis” you do not read the whole book page by page — you open the index at the back: “photosynthesis … 34, 89, 112”. Someone prepared that list in advance so you can jump straight to the right pages.\n\nThe book (database) is still the real content; the index is a clever shortcut built from it.',
        '“Photosynthesis” dhundhne ke liye aap poori kitaab page-by-page nahi padhte — peeche ka index kholte ho: “photosynthesis … 34, 89, 112”. Kisi ne yeh list pehle se taiyaar ki taaki aap seedha sahi pages par pahunch sako.\n\nKitaab (database) ab bhi asli content hai; index usi se bana ek chalaak shortcut hai.',
      ),
    },
    perfectFit: {
      title: bi('Product search in an online shop', 'Online shop mein product search'),
      text: bi(
        '“Red running shoes size 9 under ₹3,000”, typed with a typo, should return the best matches first, with filters for brand and size showing counts. A search index does all of that in milliseconds over millions of products.',
        '“Red running shoes size 9 under ₹3,000”, typo ke saath type kiya hua, best matches pehle laana chahiye, brand aur size filters counts ke saath. Search index lakhon products par yeh sab milliseconds mein karta hai.',
      ),
      why: [
        bi('Free-text queries with typos and synonyms.', 'Typos aur synonyms wali free-text queries.'),
        bi('Results must be ranked by relevance.', 'Results relevance se rank hone chahiye.'),
        bi('Facet counts for filters.', 'Filters ke liye facet counts.'),
      ],
    },
    avoidWhen: [
      bi('You treat it as the source of truth — rebuild it from the database whenever needed.', 'Ise source of truth maanna — zaroorat par database se dobara banao.'),
      bi('You only look up records by id — a database or cache is simpler.', 'Sirf id se records dekhte ho — database ya cache simple hai.'),
      bi('You need “nearest restaurants to me” — use a geospatial index.', '“Mere sabse paas ke restaurants” chahiye — geospatial index use karo.'),
    ],
    decisions: [
      bi('Partition key and replication factor for the index shards.', 'Index shards ki partition key aur replication factor.'),
      bi('How fresh it must be: near real time (stream) or periodic re-index.', 'Kitna fresh hona chahiye: near real time (stream) ya periodic re-index.'),
    ],
    confusedWith: [
      { type: 'search-service', difference: bi('The index is the data structure that stores and finds matches; the search service is the API that takes a user’s query, applies rules and asks the index.', 'Index woh data structure hai jo matches store karke dhundta hai; search service woh API hai jo user ki query leti hai, rules lagati hai aur index se poochti hai.'), compare: 'search-index-vs-search-service-vs-sql' },
      { type: 'geo-index', difference: bi('A search index finds documents by words; a geo index finds things by distance on a map.', 'Search index shabdon se documents dhundta hai; geo index map par doori se cheezein dhundta hai.'), compare: 'geo-index-vs-search-index' },
    ],
    examples: ['Elasticsearch', 'OpenSearch', 'Apache Solr', 'Algolia'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'data-warehouse',
    tagline: bi('A giant, read-optimised archive for asking big questions about the past.', 'Ateet ke bare mein bade sawaal poochne ke liye ek bahut bada, padhne ke liye optimised archive.'),
    intro: bi(
      'A data warehouse collects data from all your systems — orders, clicks, payments — and stores it in a columnar format built for analysis. Questions like “revenue by city by week for the last two years” scan billions of rows in seconds.\n\nIt is not used by your live app. Data is loaded into it continuously or in batches, and analysts, dashboards and ML training read from it.',
      'Data warehouse aapke saare systems — orders, clicks, payments — se data ikattha karta hai aur analysis ke liye bane columnar format mein rakhta hai. “Pichhle do saal mein har hafte har shehar ka revenue” jaise sawaal arabon rows ko seconds mein scan karte hain.\n\nIse aapka live app use nahi karta. Data isme lagatar ya batches mein load hota hai, aur analysts, dashboards aur ML training isse padhte hain.',
    ),
    problem: bi(
      'The finance team ran a “sales by region for the year” report on the production database. The huge query scanned everything, locked tables and slowed checkouts for every customer while it ran.',
      'Finance team ne production database par “saal bhar ki region-wise sales” report chalayi. Badi query ne sab scan kiya, tables lock kiye aur chalne tak har customer ke checkouts slow kar diye.',
    ),
    before: scene(
      [[a('analyst', 'ChartBar', 'Analyst'), c('web-client', { label: 'Shoppers' })], [c('sql-db', { label: 'Production DB', note: 'report → checkout slow', state: 'bad' })]],
      [['analyst!>sql-db', 'huge report'], 'web-client>sql-db'],
      bi('Big reports on the live database slow down real customers.', 'Live database par badi reports asli customers ko slow kar deti hain.'),
    ),
    solution: bi(
      'Copy data into a warehouse through a pipeline. Analysts and dashboards query the warehouse, whose columnar storage reads only the columns a question needs. The production database stays dedicated to customers.',
      'Ek pipeline se data warehouse mein copy karo. Analysts aur dashboards warehouse ko query karte hain, jiska columnar storage sirf woh columns padhta hai jo sawaal ko chahiye. Production database customers ke liye hi rehta hai.',
    ),
    after: scene(
      [[c('sql-db', { label: 'Production DB' })], [c('event-stream', { label: 'Change events' })], [c('data-warehouse', { state: 'focus' })], [a('analyst', 'ChartBar', 'Dashboards')]],
      ['sql-db~>event-stream', 'event-stream~>data-warehouse', 'analyst>data-warehouse'],
      bi('A pipeline copies data to the warehouse; heavy analysis never touches production.', 'Pipeline data warehouse mein copy karti hai; bhaari analysis production ko nahi chhoota.'),
    ),
    steps: [
      bi('Changes and events flow from your systems through a stream or nightly batch job.', 'Changes aur events aapke systems se stream ya raat ke batch job ke through aate hain.'),
      bi('They are cleaned and loaded into wide tables (facts and dimensions).', 'Unhe saaf karke wide tables (facts aur dimensions) mein load kiya jaata hai.'),
      bi('Data is stored by column, compressed heavily.', 'Data column ke hisaab se store aur bahut compress hota hai.'),
      bi('Queries scan only needed columns, in parallel across many machines.', 'Queries sirf zaroori columns, kai machines par parallel mein scan karti hain.'),
      bi('Dashboards, reports and ML training read from it.', 'Dashboards, reports aur ML training isse padhte hain.'),
    ],
    analogy: {
      icons: ['Archive', 'ChartBar', 'Calculator'],
      title: bi('A company’s records room for the auditors', 'Auditors ke liye company ka records room'),
      text: bi(
        'The shop counter (production database) is for serving customers quickly. Once a day, all receipts are copied to a records room where auditors sit with calculators and answer questions like “which product sold best in March?”\n\nThe auditors never block the counter, and the counter never has to answer auditors’ questions.',
        'Dukaan ka counter (production database) customers ko jaldi serve karne ke liye hai. Din mein ek baar saari receipts records room mein copy hoti hain jahan auditors calculators ke saath baithkar sawaalon ka jawab dete hain jaise “March mein sabse zyada kya bika?”\n\nAuditors kabhi counter ko nahi rokte, aur counter ko auditors ke sawaalon ka jawab nahi dena padta.',
      ),
    },
    perfectFit: {
      title: bi('Business dashboards for a delivery company', 'Delivery company ke business dashboards'),
      text: bi(
        'Managers want delivery times by city, weekly revenue trends and driver utilisation over two years. A warehouse fed by the order stream answers these across billions of rows while the ordering system runs untouched.',
        'Managers ko do saal ke city-wise delivery times, weekly revenue trends aur driver utilisation chahiye. Order stream se bhara warehouse arabon rows par yeh jawab deta hai jabki ordering system bina chhue chalta hai.',
      ),
      why: [
        bi('Questions scan huge amounts of history.', 'Sawaal bahut saari history scan karte hain.'),
        bi('Answers can be minutes old.', 'Jawab kuch minute purane ho sakte hain.'),
        bi('Production must not be slowed down.', 'Production slow nahi hona chahiye.'),
      ],
    },
    avoidWhen: [
      bi('Your app needs to read or update a single record in milliseconds — use an operational database.', 'App ko milliseconds mein ek record padhna ya update karna hai — operational database use karo.'),
      bi('You expect it to be perfectly real time — there is usually a delay of seconds to hours.', 'Ise bilkul real time ummeed karna — aam taur par seconds se ghanton ki der hoti hai.'),
      bi('You store per-second machine metrics for alerting — a time-series database fits better.', 'Alerting ke liye per-second machine metrics store karna — time-series database behtar hai.'),
    ],
    decisions: [
      bi('Ingestion: nightly batch or continuous streaming.', 'Ingestion: raat ka batch ya lagatar streaming.'),
      bi('Retention: how much history to keep.', 'Retention: kitni history rakhni hai.'),
    ],
    confusedWith: [
      { type: 'sql-db', difference: bi('The SQL database runs the app with many tiny reads and writes; the warehouse runs big read-only analysis on copies.', 'SQL database kai chhote reads aur writes se app chalata hai; warehouse copies par bada read-only analysis chalata hai.'), compare: 'sql-vs-data-warehouse-vs-time-series' },
      { type: 'time-series-db', difference: bi('A time-series DB is tuned for recent metrics and alerts; a warehouse for broad business questions over all kinds of data.', 'Time-series DB haal ke metrics aur alerts ke liye tuned hai; warehouse har tarah ke data par bade business sawaalon ke liye.'), compare: 'sql-vs-data-warehouse-vs-time-series' },
    ],
    examples: ['Snowflake', 'Google BigQuery', 'Amazon Redshift', 'ClickHouse'],
  },
];
