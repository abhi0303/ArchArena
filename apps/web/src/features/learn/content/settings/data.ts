import { bi } from '../../dsl';
import type { SettingGuide } from '../../types';

/** Database, file storage / retention and caching settings. */
export const dataSettings: SettingGuide[] = [
  // ───────────────────────── Databases ─────────────────────────
  {
    key: 'replication',
    what: bi(
      'Keeping extra copies of the database on other machines. Every change made on the main machine (the leader) is copied to the others (followers).',
      'Database ki extra copies doosri machines pe rakhna. Main machine (leader) pe hua har change baaki machines (followers) pe copy hota hai.',
    ),
    why: bi(
      'A single machine can die and take your data and your app with it. With copies, a follower takes over, and followers can also answer read queries.',
      'Ek machine mar sakti hai aur apne saath aapka data aur app dono le ja sakti hai. Copies hon to follower kaam sambhal leta hai, aur followers read queries ka jawab bhi de sakte hain.',
    ),
    example: bi(
      'A teacher (leader) writes on the board and students (followers) copy the notes. Async: students copy at their own pace and may be a line behind. Sync: the teacher waits until one student confirms before moving on. Multi-leader: two classrooms each have a teacher writing, and they swap notes later — sometimes their notes disagree.',
      'Teacher (leader) board pe likhti hai aur students (followers) notes copy karte hain. Async: students apni speed se copy karte hain, ek line peeche ho sakte hain. Sync: teacher tab tak rukti hai jab tak ek student confirm na kare. Multi-leader: do classrooms mein do teachers likh rahi hain aur baad mein notes milati hain — kabhi-kabhi notes match nahi karte.',
    ),
    options: {
      none: bi(
        'One copy only. If the machine dies the database is down until it is restored, and without backups the data is gone.',
        'Sirf ek copy. Machine mari to restore hone tak database band, aur backup na ho to data bhi gaya.',
      ),
      'leader-follower-async': bi(
        'Writes go to the leader, which says “OK” immediately and ships the change to followers a moment later. Fast writes; followers lag slightly behind; if the leader dies, the last few writes can be lost.',
        'Writes leader pe jaate hain, jo turant “OK” bolta hai aur thodi der baad change followers ko bhejta hai. Fast writes; followers thoda peeche rehte hain; leader mara to aakhri kuch writes kho sakte hain.',
      ),
      'leader-follower-sync': bi(
        'The leader waits until a standby copy has the write before saying “OK”. No data loss on failover; writes are a little slower. Use it for money, bookings and stock.',
        'Leader tab tak “OK” nahi bolta jab tak standby copy ke paas write na pahunch jaaye. Failover pe data loss nahi; writes thode slow. Paise, bookings aur stock ke liye isi ko use karo.',
      ),
      'multi-leader': bi(
        'Several leaders (often one per region) accept writes and sync with each other. Good for writing in many regions or offline apps, but conflicting writes must be resolved.',
        'Kai leaders (aksar har region mein ek) writes lete hain aur aapas mein sync karte hain. Kai regions mein likhne ya offline apps ke liye accha, par conflicting writes ko resolve karna padta hai.',
      ),
    },
    inChallenges: bi(
      'Any replication marks the database as redundant. Challenges that promise “no data loss” (payments, bookings, wallets) look for Sync standby.',
      'Koi bhi replication database ko redundant banata hai. Jo challenges “no data loss” maangte hain (payments, bookings, wallets) woh Sync standby dhoondte hain.',
    ),
  },
  {
    key: 'consistency',
    what: bi(
      'After someone writes a value, how sure a reader is to see that newest value.',
      'Kisi ke value likhne ke baad, padhne wale ko woh nayi value dikhne ki kitni guarantee hai.',
    ),
    why: bi(
      'Stronger guarantees are simpler to reason about but slower and less available during network problems. Weaker ones are fast but can briefly show old data. The right choice depends on what a stale value would cost.',
      'Strong guarantee samajhne mein simple hai par network problem ke time slow aur kam available. Weak guarantee fast hai par thodi der purana data dikha sakti hai. Sahi choice is pe depend karti hai ki purani value dikhne ka nuksaan kitna hai.',
    ),
    example: bi(
      'You change your profile photo. Strong: every friend sees the new photo instantly. Eventual: some friends see the old one for a few seconds. Read-your-writes: you always see your new photo straight away, even if friends lag a little.',
      'Aapne profile photo badli. Strong: har dost ko nayi photo turant dikhti hai. Eventual: kuch doston ko kuch seconds purani dikhti hai. Read-your-writes: aapko apni nayi photo turant dikhti hai, chahe dost thoda peeche hon.',
    ),
    options: {
      strong: bi(
        'Every read returns the latest committed write. For balances, stock and seat bookings, where a stale read means a real mistake.',
        'Har read latest committed write deta hai. Balance, stock aur seat booking ke liye, jahan purana read matlab asli galti.',
      ),
      quorum: bi(
        'Write to W copies and read from R copies so that R + W is more than the total (for example 2 of 3 each). Reads see the newest write while one node can be down. The Cassandra / DynamoDB style of tunable consistency.',
        'W copies pe likho aur R copies se padho taaki R + W total se zyaada ho (jaise dono 3 mein se 2). Ek node down ho tab bhi read ko nayi write dikhti hai. Cassandra / DynamoDB wali tunable consistency.',
      ),
      'read-your-writes': bi(
        'A user always sees their own changes; other people may briefly see older data. Usually done by reading that user’s data from the leader for a short time after they write.',
        'User ko hamesha apne changes dikhte hain; doosron ko thodi der purana data dikh sakta hai. Aam taur pe likhne ke thodi der baad tak us user ka data leader se padha jaata hai.',
      ),
      eventual: bi(
        'Copies agree “soon” (milliseconds to seconds). The fastest and most available. Fine for like counts, feeds and view counters.',
        'Copies “jaldi hi” ek jaisi ho jaati hain (milliseconds se seconds). Sabse fast aur sabse available. Likes count, feeds aur view counters ke liye theek.',
      ),
    },
    inChallenges: bi(
      'Money, bookings and stock usually check for Strong (sometimes Quorum is accepted). Feeds and counters accept Eventual or Quorum.',
      'Paise, bookings aur stock mein aam taur pe Strong check hota hai (kabhi Quorum bhi chalta hai). Feeds aur counters Eventual ya Quorum maan lete hain.',
    ),
  },
  {
    key: 'concurrencyControl',
    what: bi(
      'How the database stops two people who change the same thing at the same moment from overwriting each other.',
      'Database kaise rokta hai ki ek hi cheez ko ek hi pal mein badalne wale do log ek doosre ka kaam overwrite na kar dein.',
    ),
    why: bi(
      'Two users try to book the last seat at the same instant. Both read “1 seat left”, both write “booked” — the seat is sold twice.',
      'Do users ek hi pal mein aakhri seat book karte hain. Dono padhte hain “1 seat bachi”, dono likhte hain “booked” — seat do baar bik gayi.',
    ),
    example: bi(
      'A library book. Pessimistic: you take the only copy off the shelf and nobody else can touch it until you return it. Optimistic: everyone works on photocopies, and when you hand yours back the librarian checks whether the original changed since you copied it; if it did, you redo your part.',
      'Library ki kitaab. Pessimistic: aapne shelf se ikloti copy utha li, wapas karne tak koi aur use chhoo nahi sakta. Optimistic: sab photocopy pe kaam karte hain, aur jab aap apni wapas dete ho to librarian check karta hai ki aapke copy karne ke baad original badla ya nahi; badla to aapko apna hissa dobara karna padega.',
    ),
    options: {
      none: bi('The last write wins. Fine only for data that one person edits.', 'Jo aakhri mein likhe wahi jeete. Sirf us data ke liye theek jise ek hi insaan edit karta hai.'),
      optimistic: bi(
        'Each row has a version number. An update says “change it only if the version is still 7”; if someone already made it 8, your update fails and you retry. Great when conflicts are rare.',
        'Har row ka ek version number hota hai. Update kehta hai “tabhi badlo jab version abhi bhi 7 ho”; kisi ne 8 kar diya to aapka update fail aur aap retry karte ho. Jab conflicts kam hon tab badhiya.',
      ),
      'pessimistic-locks': bi(
        'Lock the row first (SELECT … FOR UPDATE), change it, then release. Nobody else can change it meanwhile. Safe when conflicts are frequent, but others have to wait.',
        'Pehle row lock karo (SELECT … FOR UPDATE), badlo, phir chhodo. Beech mein koi aur use badal nahi sakta. Jab conflicts zyaada hon tab safe, par baakiyon ko wait karna padta hai.',
      ),
      serializable: bi(
        'The database makes transactions that run together behave as if they ran one after another. The strongest guarantee and the lowest throughput; some transactions are aborted and must be retried.',
        'Database ek saath chal rahe transactions ko aise chalata hai jaise woh ek ke baad ek chale hon. Sabse strong guarantee aur sabse kam throughput; kuch transactions abort hote hain jinhe retry karna padta hai.',
      ),
      'conditional-writes': bi(
        'A single atomic statement with a condition, such as “reduce stock by 1 only if stock > 0”. Fast and simple for counters, claims and inventory.',
        'Condition ke saath ek atomic statement, jaise “stock ko 1 kam karo sirf agar stock > 0 ho”. Counters, claims aur inventory ke liye fast aur simple.',
      ),
    },
    inChallenges: bi(
      'Booking, inventory, wallet and auction challenges check that this is set to anything other than None — all four techniques are accepted, so pick the one you can explain.',
      'Booking, inventory, wallet aur auction challenges check karte hain ki yeh None ke alawa kuch ho — chaaron techniques maani jaati hain, to woh chuno jo aap samjha sako.',
    ),
  },
  {
    key: 'backups',
    what: bi(
      'Saved copies of the database that you can restore from later.',
      'Database ki saved copies jinse baad mein restore kar sakte ho.',
    ),
    why: bi(
      'Replication copies mistakes too: a buggy DELETE or a dropped table disappears from every replica within seconds. Only a backup lets you go back in time.',
      'Replication galtiyan bhi copy karta hai: galat DELETE ya drop hua table seconds mein har replica se gayab. Sirf backup se hi aap time mein peeche ja sakte ho.',
    ),
    example: bi(
      'Replication is a twin who copies everything you write — including your mistakes. A backup is a photo of your notebook taken every night.',
      'Replication ek judwa hai jo aapka likha sab copy karta hai — galtiyan bhi. Backup aapki notebook ki photo hai jo har raat li jaati hai.',
    ),
    options: {
      none: bi('Nothing to restore from: one bad command can lose everything for good.', 'Restore karne ko kuch nahi: ek galat command sab kuch hamesha ke liye mita sakti hai.'),
      daily: bi('A full snapshot once a day. A restore can lose up to a day of changes.', 'Din mein ek baar poora snapshot. Restore pe ek din tak ke changes kho sakte hain.'),
      'point-in-time': bi(
        'Snapshots plus a continuous log of changes, so you can restore to any second — for example 10:41:59, just before the bad query. Best for important data; most managed databases offer it.',
        'Snapshots plus changes ka lagaataar log, to aap kisi bhi second pe restore kar sakte ho — jaise 10:41:59, galat query se theek pehle. Important data ke liye best; zyaadatar managed databases yeh dete hain.',
      ),
    },
    inChallenges: bi(
      'Rarely scored on its own, but reviewers expect Point-in-time recovery for any data that matters.',
      'Akele kam hi score hota hai, par jo data important hai uske liye reviewers Point-in-time recovery expect karte hain.',
    ),
  },
  {
    key: 'access',
    what: bi(
      'What this particular database box does in your design: takes all traffic, only serves reads, or only receives writes.',
      'Aapke design mein yeh database box kya karta hai: saara traffic leta hai, sirf reads serve karta hai, ya sirf writes leta hai.',
    ),
    why: bi(
      'Read-heavy systems often send writes to one place and reads to copies (read/write separation). Labelling each store makes that split obvious.',
      'Read-heavy systems aksar writes ek jagah aur reads copies pe bhejte hain (read/write separation). Har store pe label lagane se yeh split saaf dikhta hai.',
    ),
    example: bi(
      'In a library, the cataloguing desk adds new books (writes) while several reading rooms let people read them (reads).',
      'Library mein cataloguing desk nayi kitaabein jodta hai (writes) aur kai reading rooms mein log unhe padhte hain (reads).',
    ),
    options: {
      'read-write': bi('The main database: takes both reads and writes. The default.', 'Main database: reads aur writes dono leta hai. Default.'),
      reads: bi(
        'This copy answers read queries, for example a copy for search pages or reports.',
        'Yeh copy read queries ka jawab deti hai, jaise search pages ya reports ke liye ek copy.',
      ),
      writes: bi(
        'This store receives the writes — for example the primary in a primary-plus-replicas setup where reads go elsewhere.',
        'Yeh store writes leta hai — jaise primary-plus-replicas setup ka primary, jahan reads kahin aur jaate hain.',
      ),
    },
    inChallenges: bi(
      'Not scored directly. To scale reads, add a Read Replica component and connect primary → replica.',
      'Seedha score nahi hota. Reads scale karne ke liye Read Replica component jodo aur primary → replica connect karo.',
    ),
  },
  {
    key: 'dataModel',
    what: bi('The shape in which the NoSQL database stores your data.', 'NoSQL database aapka data kis shape mein store karta hai.'),
    why: bi(
      'Each model is fast at some questions and slow (or unable) at others. Matching the model to how you read the data is most of NoSQL design.',
      'Har model kuch sawaalon mein fast aur kuch mein slow (ya bilkul nahi) hota hai. Data jaise padhna hai waise model chunna hi NoSQL design ka zyaadatar hissa hai.',
    ),
    example: bi(
      'Storage at home. Key-value: lockers with numbered keys. Document: a folder per person holding their complete file. Wide-column: a ledger where each page is one customer and the lines are in date order. Graph: a family tree.',
      'Ghar ka storage. Key-value: number wale lockers. Document: har insaan ka ek folder jisme uski poori file. Wide-column: bahi-khaata jisme har page ek customer ka aur lines date ke order mein. Graph: family tree.',
    ),
    options: {
      'key-value': bi(
        'A giant dictionary: give a key, get a value. The fastest lookups by ID (sessions, carts, user settings), but hard to search by other fields. DynamoDB, Redis.',
        'Ek bahut bada dictionary: key do, value lo. ID se sabse fast lookup (sessions, carts, user settings), par doosre fields se dhoondhna mushkil. DynamoDB, Redis.',
      ),
      document: bi(
        'Each record is a JSON-like document with nested fields, and records can have different fields. Great for product catalogues, profiles and content. MongoDB.',
        'Har record ek JSON jaisa document hai jisme nested fields hote hain, aur records ke fields alag-alag ho sakte hain. Product catalogue, profiles aur content ke liye badhiya. MongoDB.',
      ),
      'wide-column': bi(
        'Rows grouped by a partition key with many sorted columns, built for huge write volumes and time-ordered data (messages, events, sensor readings). Cassandra, Bigtable, HBase.',
        'Partition key se grouped rows jinme bahut saare sorted columns, bahut zyaada writes aur time-ordered data ke liye bane (messages, events, sensor readings). Cassandra, Bigtable, HBase.',
      ),
      graph: bi(
        'Nodes and relationships, built for “friends of friends” style questions. For heavy graph work there is also a separate Graph DB component.',
        'Nodes aur relationships, “dosto ke dost” jaise sawaalon ke liye bane. Bhaari graph kaam ke liye alag Graph DB component bhi hai.',
      ),
    },
    inChallenges: bi(
      'Chat messages, timelines and sensor data fit Wide-column; carts and sessions fit Key-value; catalogues fit Document. Always set a Partition key too.',
      'Chat messages, timelines aur sensor data ke liye Wide-column; carts aur sessions ke liye Key-value; catalogue ke liye Document. Saath mein Partition key bhi zaroor set karo.',
    ),
  },
  {
    key: 'partitionKey',
    what: bi(
      'The field that decides which machine (partition or shard) each record lives on. The database hashes this value to choose a home for the record.',
      'Woh field jo decide karta hai ki har record kis machine (partition ya shard) pe rahega. Database is value ka hash nikaal ke record ka ghar chunta hai.',
    ),
    why: bi(
      'A good key spreads traffic evenly and keeps data that is read together in one place. A bad key creates a “hot partition”: one machine does all the work while the rest sit idle.',
      'Accha key traffic barabar failata hai aur saath padha jaane wala data ek jagah rakhta hai. Kharab key “hot partition” banata hai: ek machine saara kaam karti hai aur baaki khaali baithi rehti hain.',
    ),
    example: bi(
      'A school splits students into sections by roll number, so sections are even. Splitting by surname would make the “S” section overflow. And if a teacher needs all of one family’s children together, grouping by family ID keeps them in one room.',
      'School students ko roll number se sections mein baant-ta hai, to sections barabar rehte hain. Surname se baanto to “S” wala section bhar jaayega. Aur agar teacher ko ek family ke saare bachche saath chahiye, to family ID se grouping unhe ek kamre mein rakhti hai.',
    ),
    goodValues: bi(
      'user_id (per-user data), conversation_id (keeps a whole chat together), tenant_id (B2B apps), order_id, device_id (IoT). Avoid fields with few values (country, status, true/false) and ever-increasing values such as a timestamp on its own — every new write would hit the same partition.',
      'user_id (har user ka data), conversation_id (poori chat ek saath), tenant_id (B2B apps), order_id, device_id (IoT). Kam values wale fields se bacho (country, status, true/false) aur hamesha badhti values jaise akela timestamp — har naya write ek hi partition pe girega.',
    ),
    inChallenges: bi(
      'The most-checked setting in the challenges (18 of them). Any value passes, but choose the field you actually look data up by — reviewers read it.',
      'Challenges mein sabse zyaada check hone wali setting (18 challenges). Koi bhi value pass ho jaati hai, par woh field chuno jisse aap sach mein data dhoondhte ho — reviewers ise padhte hain.',
    ),
  },
  {
    key: 'replicationFactor',
    what: bi(
      'How many copies of every piece of data the cluster keeps, each on a different machine.',
      'Cluster har data ki kitni copies rakhta hai, har copy alag machine pe.',
    ),
    why: bi(
      'Machines fail all the time in big clusters. With enough copies, losing one never loses data and reads keep working.',
      'Bade clusters mein machines baar-baar fail hoti hain. Kaafi copies hon to ek machine jaane se data nahi khota aur reads chalte rehte hain.',
    ),
    example: bi(
      'House keys. One key: lose it and you are locked out. Three keys — one with you, one at home, one with a neighbour — and losing one is no drama.',
      'Ghar ki chaabi. Ek chaabi: kho gayi to aap bahar. Teen chaabiyaan — ek aapke paas, ek ghar pe, ek padosi ke paas — to ek khone se koi drama nahi.',
    ),
    options: {
      '1': bi('A single copy. Losing a machine loses that data. Only for throwaway or rebuildable data.', 'Sirf ek copy. Machine gayi to woh data gaya. Sirf phenk dene layak ya dobara ban sakne wale data ke liye.'),
      '2': bi(
        'Survives one machine failure, but during that failure there is no spare, and a majority (quorum) of 2 is impossible.',
        'Ek machine ka failure jhel leta hai, par us dauraan koi spare nahi rehta, aur 2 mein majority (quorum) ho hi nahi sakti.',
      ),
      '3': bi(
        'The common default: survives one failure and still allows quorum reads and writes (2 of 3).',
        'Common default: ek failure jhel leta hai aur phir bhi quorum reads/writes ho sakte hain (3 mein se 2).',
      ),
      '5': bi(
        'Survives two failures. For very critical data or many zones; costs more storage and slows writes.',
        'Do failures jhel leta hai. Bahut critical data ya kai zones ke liye; storage zyaada lagta hai aur writes slow.',
      ),
    },
    inChallenges: bi(
      'Most challenges check for 3 or 5 (a few also accept 2). Anything of 2 or more counts as redundant.',
      'Zyaadatar challenges 3 ya 5 check karte hain (kuch 2 bhi maante hain). 2 ya zyaada sab redundant gina jaata hai.',
    ),
  },
  {
    key: 'shardingStrategy',
    what: bi(
      'The rule that decides which shard (piece of the database) each row goes to.',
      'Woh rule jo decide karta hai ki har row kis shard (database ke tukde) mein jaayegi.',
    ),
    why: bi(
      'It decides whether load spreads evenly, whether range queries stay fast and how painful it is to add shards later.',
      'Isse decide hota hai ki load barabar failega ya nahi, range queries fast rahengi ya nahi, aur baad mein shards jodna kitna dard bhara hoga.',
    ),
    example: bi(
      'Handing exam papers to checkers. Hash: shuffle them randomly. Range: roll numbers 1–100 to checker A. Geographic: each city’s papers to that city’s centre. Directory: a register that says which checker has which school.',
      'Exam papers checkers ko baantna. Hash: random shuffle. Range: roll number 1–100 checker A ko. Geographic: har shehar ke papers usi shehar ke centre ko. Directory: ek register jisme likha hai kis checker ke paas kaunsa school.',
    ),
    options: {
      hash: bi(
        'hash(key) mod N picks the shard. A very even spread, but changing N moves almost every key, and range queries must ask every shard.',
        'hash(key) mod N se shard chuna jaata hai. Bahut barabar spread, par N badla to lagbhag har key hilti hai, aur range queries ko har shard se poochna padta hai.',
      ),
      'consistent-hash': bi(
        'Keys and shards sit on a ring; adding a shard only moves keys from its neighbour. An even spread and easy growth. Cassandra, DynamoDB.',
        'Keys aur shards ek ring pe hote hain; naya shard jodne pe sirf uske padosi ki keys hilti hain. Barabar spread aur aasaan growth. Cassandra, DynamoDB.',
      ),
      range: bi(
        'Shard by ranges of the key (A–F, G–M…, or dates). Range scans are fast, but popular ranges become hot spots — for example, all of today’s orders on one shard.',
        'Key ki ranges se shard (A–F, G–M…, ya dates). Range scans fast, par popular range hot spot ban jaati hai — jaise aaj ke saare orders ek hi shard pe.',
      ),
      geo: bi(
        'Shard by location (Indian users on the Mumbai shard). Low latency and data residency; uneven if one region is much bigger.',
        'Location se shard (Indian users Mumbai shard pe). Kam latency aur data residency; ek region bahut bada ho to uneven.',
      ),
      directory: bi(
        'A lookup table says which shard holds each key or tenant. The most flexible — you can move one big customer — but the directory itself must be fast and highly available.',
        'Ek lookup table batata hai kaunsi key ya tenant kis shard pe hai. Sabse flexible — ek bade customer ko move kar sakte ho — par directory khud fast aur highly available honi chahiye.',
      ),
    },
    inChallenges: bi(
      'A few challenges check that a strategy is chosen; one accepts Range or Hash. Always pair it with a sensible Partition key.',
      'Kuch challenges check karte hain ki strategy chuni gayi ho; ek Range ya Hash maanta hai. Hamesha samajhdaar Partition key ke saath use karo.',
    ),
  },
  {
    key: 'shardCount',
    what: bi(
      'How many pieces (shards) the database is split into. Each shard holds part of the rows and usually runs on its own machine.',
      'Database kitne tukdon (shards) mein baanta gaya hai. Har shard kuch rows rakhta hai aur aam taur pe apni alag machine pe chalta hai.',
    ),
    why: bi(
      'Too few shards and each one is overloaded, with a painful re-split later. Too many and you operate lots of machines and queries that touch many shards get slower.',
      'Bahut kam shards to har ek overload, aur baad mein dobara baantna dard bhara. Bahut zyaada to bahut saari machines sambhalni padti hain aur kai shards chhoone wali queries slow hoti hain.',
    ),
    example: bi(
      'Cutting a cake: four slices are right for four people; sixty guests need more slices; cutting a thousand slices for four people just makes a mess.',
      'Cake kaatna: chaar logon ke liye chaar slice sahi; saath mehmaanon ke liye zyaada slice chahiye; chaar logon ke liye hazaar slice kaatna bas gadbad hai.',
    ),
    options: {
      '4': bi('A small start. Easy to run; you will need to grow later.', 'Chhoti shuruaat. Chalana aasaan; baad mein badhana padega.'),
      '16': bi('A moderate size for a growing product.', 'Badhte product ke liye theek-thaak size.'),
      '64': bi('Large scale with room to grow.', 'Bada scale, aage badhne ki jagah ke saath.'),
      '256+': bi(
        'Massive scale. Often many small “logical” shards are placed on fewer machines, so you can grow by moving shards rather than re-splitting data.',
        'Bahut bada scale. Aksar bahut saare chhote “logical” shards kam machines pe rakhe jaate hain, taaki data dobara baantne ki jagah shards move karke badh sako.',
      ),
    },
    inChallenges: bi(
      'Rarely scored. A good habit: start with many logical shards (64–256) on fewer servers so growth means moving shards, not re-splitting data.',
      'Kam hi score hota hai. Acchi aadat: kam servers pe bahut saare logical shards (64–256) se shuru karo, taaki badhne ka matlab shards move karna ho, data dobara baantna nahi.',
    ),
  },
  {
    key: 'replicaCount',
    what: bi(
      'How many read-only copies of the main database answer read queries.',
      'Main database ki kitni read-only copies read queries ka jawab deti hain.',
    ),
    why: bi(
      'Most apps read far more than they write. Replicas take the read load off the primary and are ready to be promoted if it fails.',
      'Zyaadatar apps likhne se kahin zyaada padhte hain. Replicas primary ka read load utha lete hain aur primary fail ho to promote hone ko tayyar rehte hain.',
    ),
    example: bi(
      'A popular book in a library: the original stays at the desk and photocopies sit in the reading rooms so many people can read at once. When the original is corrected, the copies are updated a little later.',
      'Library ki popular kitaab: original desk pe rehti hai aur photocopies reading rooms mein, taaki bahut log ek saath padh sakein. Original mein sudhaar hua to copies thodi der baad update hoti hain.',
    ),
    options: {
      '1': bi('Offloads reads and gives one failover candidate.', 'Reads ka bojh hatata hai aur ek failover candidate deta hai.'),
      '2': bi('More read capacity; one replica can be down for maintenance without trouble.', 'Zyaada read capacity; ek replica maintenance pe ho to bhi dikkat nahi.'),
      '3+': bi('For read-heavy apps (feeds, catalogues) at large scale, spread across zones.', 'Bade scale ke read-heavy apps (feeds, catalogue) ke liye, zones mein faile hue.'),
    },
    inChallenges: bi(
      'Connecting primary → replica marks the primary as redundant. Remember replication lag: a user who just wrote something may need to read it from the primary.',
      'Primary → replica connect karne se primary redundant gina jaata hai. Replication lag yaad rakho: jisne abhi likha hai use shayad primary se padhna padega.',
    ),
  },

  // ───────────────────────── Files, retention & analytics ─────────────────────────
  {
    key: 'uploadMethod',
    what: bi(
      'The path a file takes when a user uploads it: through your app servers, or straight from the user’s device to object storage.',
      'User jab file upload karta hai to woh kis raaste jaati hai: aapke app servers se hoke, ya seedha user ke device se object storage mein.',
    ),
    why: bi(
      'A 2 GB video passing through an app server ties up its memory, bandwidth and a connection for minutes. A few uploads like that can block normal requests.',
      '2 GB ka video app server se guzre to uski memory, bandwidth aur ek connection minutes tak atke rehte hain. Aise kuch uploads normal requests ko rok sakte hain.',
    ),
    example: bi(
      'Delivering a sofa to a flat. Through the service: the society office carries every sofa upstairs itself — slow, and the office does nothing else. Pre-signed URL: the office hands the delivery person a one-time gate pass to go straight to the flat.',
      'Flat mein sofa deliver karna. Through the service: society office khud har sofa upar le jaata hai — slow, aur office aur kuch nahi kar paata. Pre-signed URL: office delivery wale ko ek one-time gate pass deta hai aur woh seedha flat tak jaata hai.',
    ),
    options: {
      'through-service': bi(
        'Client → app server → storage. Simple, and the server can inspect the file, but large uploads tie up app servers.',
        'Client → app server → storage. Simple, aur server file check kar sakta hai, par badi uploads app servers ko atka deti hain.',
      ),
      'presigned-url': bi(
        'The app server issues a short-lived signed URL and the client uploads directly to object storage. App servers stay free and it scales to huge files. Used by S3, GCS and most video and photo apps.',
        'App server ek kam samay wala signed URL deta hai aur client seedha object storage mein upload karta hai. App servers free rehte hain aur badi files tak scale hota hai. S3, GCS aur zyaadatar video/photo apps yahi karte hain.',
      ),
    },
    inChallenges: bi('Photo, video and file-sharing challenges check for Pre-signed URL.', 'Photo, video aur file-sharing challenges Pre-signed URL check karte hain.'),
  },
  {
    key: 'durability',
    what: bi('Where the copies of each stored object live.', 'Har stored object ki copies kahan rehti hain.'),
    why: bi(
      'Disks fail, buildings lose power, and occasionally a whole region goes down. The further apart the copies, the bigger the disaster they survive.',
      'Disks fail hoti hain, buildings ki bijli jaati hai, aur kabhi-kabhi poora region down ho jaata hai. Copies jitni door hon, utni badi aafat jhel sakti hain.',
    ),
    example: bi(
      'Important papers: one copy in your drawer; copies in two different rooms of the house; or an extra copy in a bank locker in another city.',
      'Zaroori kaagaz: ek copy aapki drawer mein; ghar ke do alag kamron mein copies; ya doosre shehar ke bank locker mein ek extra copy.',
    ),
    options: {
      standard: bi('Copies inside one data centre. Survives disk failures, not a building-level outage.', 'Ek data centre ke andar copies. Disk failure jhel leta hai, building level outage nahi.'),
      'multi-az': bi(
        'Copies in several availability zones (separate buildings) in one region. Survives losing a whole building. The default for S3 Standard.',
        'Ek region ke kai availability zones (alag buildings) mein copies. Poori building jaane pe bhi bacha rehta hai. S3 Standard ka default.',
      ),
      'cross-region': bi(
        'Copies also in another, distant region. Survives a regional disaster; costs more and adds replication delay.',
        'Ek door ke doosre region mein bhi copies. Regional disaster jhel leta hai; kharcha zyaada aur replication delay.',
      ),
    },
    inChallenges: bi(
      'Media and backup-heavy challenges check for Replicated across zones or Cross-region; disaster-recovery challenges want Cross-region.',
      'Media aur backup-heavy challenges Replicated across zones ya Cross-region check karte hain; disaster-recovery wale Cross-region maangte hain.',
    ),
  },
  {
    key: 'lifecycle',
    what: bi(
      'Automatic rules that move old files to cheaper storage or delete them after a while.',
      'Automatic rules jo purani files ko saste storage mein shift karte hain ya kuch samay baad delete kar dete hain.',
    ),
    why: bi(
      'Storage bills grow every month if nothing is ever cleaned up, and most old files are rarely opened again.',
      'Agar kabhi kuch saaf na ho to storage ka bill har mahine badhta hai, aur zyaadatar purani files dobara kam hi khulti hain.',
    ),
    example: bi(
      'Your wardrobe: this season’s clothes in the cupboard, last winter’s jackets in the loft (tiering), worn-out ones given away (expiry).',
      'Aapki almari: is season ke kapde almari mein, pichhli sardi ki jackets taand pe (tiering), phate hue de diye (expiry).',
    ),
    options: {
      none: bi('Everything stays in the expensive, fast tier forever.', 'Sab kuch hamesha mehnge, fast tier mein.'),
      tiering: bi(
        'Old, rarely-read objects move to cheaper storage classes (Infrequent Access, Glacier). Still there, just slower and cheaper to keep.',
        'Purane, kam padhe jaane wale objects saste storage classes mein (Infrequent Access, Glacier). Data rehta hai, bas slow aur sasta.',
      ),
      expiry: bi(
        'Objects are deleted automatically after an age — temporary uploads, old logs, expired stories.',
        'Ek umar ke baad objects apne aap delete — temporary uploads, purane logs, expire hui stories.',
      ),
    },
    inChallenges: bi(
      'Challenges with temporary content (stories, expiring links, pastes) check for Expire; large archives accept Tiering or Expire.',
      'Temporary content wale challenges (stories, expire hone wale links, pastes) Expire check karte hain; bade archives Tiering ya Expire maante hain.',
    ),
  },
  {
    key: 'retention',
    what: bi(
      'How long messages, events, logs or metrics are kept before they are deleted.',
      'Messages, events, logs ya metrics delete hone se pehle kitne samay tak rakhe jaate hain.',
    ),
    why: bi(
      'Longer retention lets you replay events after a bug, rebuild a broken consumer and investigate old incidents — but it costs storage.',
      'Lambi retention se bug ke baad events replay kar sakte ho, toota consumer dobara bana sakte ho aur purane incidents ki jaanch kar sakte ho — par storage lagta hai.',
    ),
    example: bi(
      'CCTV footage: a corner shop keeps 7 days — enough to check yesterday’s theft. A bank keeps footage for years for audits.',
      'CCTV footage: mohalle ki dukaan 7 din rakhti hai — kal ki chori check karne ko kaafi. Bank audit ke liye saalon tak rakhta hai.',
    ),
    options: {
      hours: bi('A short buffer — enough for consumers to catch up after a brief outage.', 'Chhota buffer — chhote outage ke baad consumers ke catch-up ke liye kaafi.'),
      days: bi('Typical for queues and streams (Kafka’s default is 7 days). Allows replay after a bug.', 'Queues aur streams ke liye typical (Kafka ka default 7 din). Bug ke baad replay ho sakta hai.'),
      weeks: bi('A longer replay window; common for metrics and investigations.', 'Lamba replay window; metrics aur jaanch ke liye common.'),
      forever: bi(
        'Never delete. For event sourcing (the log is the source of truth), audit trails and compliance. Costs keep growing unless old data is tiered.',
        'Kabhi delete nahi. Event sourcing (log hi source of truth), audit trails aur compliance ke liye. Purana data tier na karo to kharcha badhta hi rehta hai.',
      ),
    },
    inChallenges: bi(
      'Event-sourcing and audit challenges check for Weeks or Indefinitely (sometimes only Indefinitely); others just need a value chosen.',
      'Event-sourcing aur audit challenges Weeks ya Indefinitely check karte hain (kabhi sirf Indefinitely); baaki ko bas koi value chahiye.',
    ),
  },
  {
    key: 'downsampling',
    what: bi(
      'Older time-series data is summarised into coarser points: per-second data becomes per-minute after a week and per-hour after a month.',
      'Purana time-series data mote points mein summarise hota hai: per-second data ek hafte baad per-minute aur ek mahine baad per-hour ban jaata hai.',
    ),
    why: bi(
      'Raw metrics grow without limit. Nobody needs per-second detail from last year, but everyone wants the long-term trend.',
      'Raw metrics bina limit badhte hain. Pichhle saal ki per-second detail kisi ko nahi chahiye, par long-term trend sabko chahiye.',
    ),
    example: bi(
      'Your phone’s step counter shows every minute for today, but only a daily total for last year.',
      'Phone ka step counter aaj ke liye har minute dikhata hai, par pichhle saal ke liye sirf rozana total.',
    ),
    options: {
      true: bi('On: storage stays manageable while long-term trends stay visible.', 'On: storage control mein rehta hai aur long-term trends dikhte rehte hain.'),
      false: bi('Off: every raw point is kept; storage and query cost grow quickly.', 'Off: har raw point rakha jaata hai; storage aur query ka kharcha tezi se badhta hai.'),
    },
    inChallenges: bi('Monitoring and metrics challenges check that it is on.', 'Monitoring aur metrics challenges check karte hain ki yeh on ho.'),
  },
  {
    key: 'ingestion',
    what: bi(
      'How data from your apps and databases reaches the data warehouse for analytics: in periodic batches, or as a continuous stream.',
      'Aapke apps aur databases ka data analytics ke liye data warehouse tak kaise pahunchta hai: samay-samay pe batches mein, ya lagaataar stream ki tarah.',
    ),
    why: bi(
      'It decides how fresh your dashboards are and how much machinery you run.',
      'Isse decide hota hai ki aapke dashboards kitne fresh hain aur kitni machinery chalani padti hai.',
    ),
    example: bi(
      'A shop’s accountant updating the books every night from the day’s receipts (batch), versus a live sales screen that changes with every bill (streaming).',
      'Dukaan ka accountant har raat din ki receipts se khaata update karta hai (batch), aur ek live sales screen jo har bill pe badalti hai (streaming).',
    ),
    options: {
      batch: bi(
        'Load data periodically with ETL jobs (for example nightly). Cheap and simple; data is hours old. Fine for daily business reports.',
        'ETL jobs se samay-samay pe data load (jaise har raat). Sasta aur simple; data kuch ghante purana. Daily business reports ke liye theek.',
      ),
      streaming: bi(
        'Events flow in continuously (from a stream or change-data-capture). Dashboards are fresh within seconds or minutes; more moving parts.',
        'Events lagaataar aate hain (stream ya change-data-capture se). Dashboards seconds/minutes mein fresh; zyaada moving parts.',
      ),
    },
    inChallenges: bi(
      'Not scored directly. Choose Streaming when the brief asks for near-real-time analytics; otherwise Batch is fine.',
      'Seedha score nahi hota. Brief mein near-real-time analytics ho to Streaming; warna Batch theek hai.',
    ),
  },

  // ───────────────────────── Caching ─────────────────────────
  {
    key: 'evictionPolicy',
    what: bi('What the cache throws out when it is full and something new must go in.', 'Cache full hone pe kuch naya daalne ke liye kya bahar phenka jaaye.'),
    why: bi(
      'Cache memory is small and expensive. Evicting the wrong things lowers the hit rate and sends more traffic to the database.',
      'Cache memory chhoti aur mehngi hoti hai. Galat cheez bahar phenkne se hit rate girta hai aur database pe zyaada traffic jaata hai.',
    ),
    example: bi(
      'A small fridge. LRU: throw out what nobody has touched for longest. LFU: throw out what is eaten least often. TTL: throw out by expiry date. No eviction: stop buying until you eat something.',
      'Chhota fridge. LRU: jise sabse lambe samay se kisi ne nahi chhua, bahar. LFU: jo sabse kam khaaya jaata hai, bahar. TTL: expiry date ke hisaab se bahar. No eviction: kuch khaane tak kuch naya mat kharido.',
    ),
    options: {
      lru: bi(
        'Least Recently Used: remove the item unused for the longest time. A solid default for most read-heavy workloads.',
        'Least Recently Used: jo item sabse lambe samay se use nahi hua, use hatao. Zyaadatar read-heavy workloads ke liye solid default.',
      ),
      lfu: bi(
        'Least Frequently Used: remove the item used the fewest times. Better when some items stay popular for a long time, because a one-off burst cannot push them out.',
        'Least Frequently Used: jo item sabse kam baar use hua, use hatao. Behtar jab kuch items lambe samay tak popular rehte hain, kyunki ek baar ka burst unhe bahar nahi dhakel sakta.',
      ),
      ttl: bi(
        'Items leave only when their time-to-live runs out. The cache can fill up if TTLs are long.',
        'Items sirf tab nikalte hain jab unka time-to-live khatam ho. TTL lambe hon to cache bhar sakta hai.',
      ),
      none: bi(
        'Never evict: when memory is full, new writes fail. Only when the cache is used as a carefully sized primary store.',
        'Kabhi mat hatao: memory full to naye writes fail. Sirf tab jab cache ko dhyaan se size kiya primary store ki tarah use kiya jaa raha ho.',
      ),
    },
    inChallenges: bi('Challenges accept LRU, LFU or TTL — anything except No eviction.', 'Challenges LRU, LFU ya TTL maante hain — No eviction ke alawa kuch bhi.'),
  },
  {
    key: 'writePolicy',
    what: bi(
      'The pattern for keeping the cache and the database in step: who loads the cache, and what happens on a write.',
      'Cache aur database ko saath rakhne ka pattern: cache kaun bharta hai, aur write pe kya hota hai.',
    ),
    why: bi(
      'It decides how fresh cached data is, how fast writes are and whether a cache crash can lose data.',
      'Isse decide hota hai ki cached data kitna fresh hai, writes kitne fast hain aur cache crash hone pe data kho sakta hai ya nahi.',
    ),
    example: bi(
      'A waiter’s notepad of dish prices. Cache-aside: the waiter checks the notepad and, if a price is missing, asks the kitchen and writes it down. Write-through: every price change is told to the kitchen and written in the notepad at the same time. Write-back: the waiter jots orders down and passes them to the kitchen every ten minutes — lose the notepad and you lose those orders.',
      'Waiter ka dish prices wala notepad. Cache-aside: waiter notepad dekhta hai, price na mile to kitchen se poochke likh leta hai. Write-through: har price change kitchen ko bataya aur notepad mein ek saath likha jaata hai. Write-back: waiter orders notepad mein likhta hai aur har das minute mein kitchen ko deta hai — notepad kho gaya to woh orders bhi gaye.',
    ),
    options: {
      'cache-aside': bi(
        'The app checks the cache; on a miss it reads the database and stores the result. On a write it updates the database and deletes the cached copy. The most common pattern; a cache failure does not break writes.',
        'App cache check karta hai; miss pe database se padh ke result cache mein rakhta hai. Write pe database update karta hai aur cached copy delete karta hai. Sabse common pattern; cache fail ho to bhi writes nahi tootte.',
      ),
      'read-through': bi(
        'The cache itself loads from the database on a miss; the app only talks to the cache. Cleaner code, but needs a cache that supports loaders.',
        'Miss pe cache khud database se load karta hai; app sirf cache se baat karta hai. Code saaf, par aisa cache chahiye jo loaders support kare.',
      ),
      'write-through': bi(
        'Every write goes to the cache and the database together before returning. The cache is always fresh; writes are slower.',
        'Har write return hone se pehle cache aur database dono mein jaata hai. Cache hamesha fresh; writes slow.',
      ),
      'write-back': bi(
        'Writes go to the cache only; the cache saves them to the database later in batches. The fastest writes, but data is lost if the cache dies first. Only for counters and metrics where a small loss is acceptable.',
        'Writes sirf cache mein; cache baad mein batches mein database mein save karta hai. Sabse fast writes, par cache pehle mar gaya to data gaya. Sirf counters aur metrics ke liye jahan thoda nuksaan chal jaaye.',
      ),
    },
    inChallenges: bi('One challenge checks that a pattern is set; Cache-aside is a safe default.', 'Ek challenge check karta hai ki pattern set ho; Cache-aside safe default hai.'),
  },
  {
    key: 'ttl',
    what: bi(
      'Time-to-live: how long a cached item stays valid before it expires automatically.',
      'Time-to-live: cached item kitni der valid rehta hai, phir apne aap expire.',
    ),
    why: bi(
      'If an update forgets to clear the cache, a stale value could live forever. A TTL puts an upper limit on how old cached data can be.',
      'Agar koi update cache saaf karna bhool jaaye, to purani value hamesha reh sakti hai. TTL yeh limit lagata hai ki cached data zyaada se zyaada kitna purana ho sakta hai.',
    ),
    example: bi(
      'Milk has an expiry date. Once it passes you buy fresh milk instead of drinking the old one.',
      'Doodh pe expiry date hoti hai. Woh nikal jaaye to purana peene ki jagah naya kharidte ho.',
    ),
    goodValues: bi(
      '“30s” for fast-changing scores or prices, “5m” for feeds, “1h” for profiles, “24h” for rarely changing reference data, “365d” for versioned static files.',
      'Tezi se badalte score ya price ke liye “30s”, feeds ke liye “5m”, profiles ke liye “1h”, kam badalne wale reference data ke liye “24h”, versioned static files ke liye “365d”.',
    ),
    inChallenges: bi(
      'Five challenges check that a TTL is written. Any value passes; choose one that matches how stale the data is allowed to be.',
      'Paanch challenges check karte hain ki TTL likha ho. Koi bhi value pass hoti hai; woh chuno jo batati ho ki data kitna purana chal sakta hai.',
    ),
  },
  {
    key: 'cacheReplication',
    what: bi(
      'How the distributed cache is laid out across machines: one node, a primary with copies, or a sharded cluster.',
      'Distributed cache machines pe kaise faila hai: ek node, copies ke saath primary, ya sharded cluster.',
    ),
    why: bi(
      'If a single cache node restarts, the cache is empty and all traffic suddenly hits the database (a cache stampede). Copies and clustering prevent that and add capacity.',
      'Akela cache node restart hua to cache khaali aur saara traffic achanak database pe (cache stampede). Copies aur clustering yeh rokte hain aur capacity bhi badhate hain.',
    ),
    example: bi(
      'One notebook; a notebook with a photocopy; or a set of notebooks split by alphabet (A–F, G–M…), each with its own photocopy.',
      'Ek notebook; photocopy ke saath ek notebook; ya alphabet se baanti notebooks ka set (A–F, G–M…), har ek ki apni photocopy.',
    ),
    options: {
      'single-node': bi('One cache server. Simple, but a restart empties it and the database takes the full load.', 'Ek cache server. Simple, par restart pe khaali aur poora load database pe.'),
      replicas: bi(
        'One primary with replicas; a replica is promoted if the primary fails. Survives a node loss, but memory is limited to one machine.',
        'Ek primary aur replicas; primary fail ho to replica promote. Ek node jaana jhel leta hai, par memory ek machine tak limited.',
      ),
      cluster: bi(
        'Keys are sharded across many nodes, each with replicas (Redis Cluster). Scales memory and throughput and survives node loss.',
        'Keys kai nodes mein shard hoti hain, har node ke replicas (Redis Cluster). Memory aur throughput scale aur node jaana bhi jhel leta hai.',
      ),
    },
    inChallenges: bi(
      'Primary + replicas and Sharded cluster both count as redundant. Large-scale challenges check for Sharded cluster.',
      'Primary + replicas aur Sharded cluster dono redundant gine jaate hain. Bade scale wale challenges Sharded cluster check karte hain.',
    ),
  },
];
