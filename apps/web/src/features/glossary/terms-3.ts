import { g } from './terms-1';
import type { GlossaryTerm } from './types';

const OUTBOX = '/prep/system-design/transactional-outbox-pattern';
const CONSUMER = '/prep/system-design/idempotent-consumer-pattern';

/** Reliable events between services: dual writes, relays, logs, brokers and deduplication. */
export const TERMS_3: GlossaryTerm[] = [
  g(
    'dual-write',
    'Dual-write problem',
    ['dual-write problem', 'dual-write', 'dual write', 'dual writes', 'ghost event', 'ghost events', 'lost event', 'lost events'],
    [
      'One action has to write to two different systems — say, your database and a message queue — one after the other. If something fails in between, one write happens and the other does not: the event is **lost** (saved but never announced), or a **ghost event** goes out (announced but never saved).',
      'Ek kaam ko do alag systems mein likhna ho — jaise database aur message queue — ek ke baad ek. Beech mein kuch fail ho to ek write hota hai aur doosra nahi: event **kho jaata hai** (save hua par bataya nahi), ya **ghost event** chala jaata hai (bataya par save hi nahi hua).',
    ],
    [
      'You pay a bill at a counter. The cashier stamps “PAID” on your receipt and then has to update the computer — but the power goes out in between. Your receipt says paid; the system still says you owe money.',
      'Counter pe bill bhara. Cashier ne receipt pe “PAID” ki mohar lagayi aur phir computer update karna tha — beech mein light chali gayi. Receipt kehti hai paid; system abhi bhi kehta hai paise baaki hain.',
    ],
    { related: ['outbox', 'atomic', 'two-phase-commit'], more: OUTBOX },
  ),
  g(
    'message-relay',
    'Message relay (outbox relay)',
    ['message relay', 'outbox relay', 'relay worker', 'relay process', 'relay', 'polling publisher'],
    [
      'The background process in the outbox pattern. It reads unsent rows from the outbox table, publishes them to the message broker, and marks them sent **only after** the broker confirms. If publishing fails, it leaves the row and tries again later. A **polling publisher** does this with a query every second; CDC does it by reading the database log.',
      'Outbox pattern ka background process. Ye outbox table se na-bheji rows padhta hai, unhe message broker pe publish karta hai, aur broker ke confirm karne ke **baad hi** unhe sent mark karta hai. Publish fail ho to row chhod ke baad mein phir try karta hai. **Polling publisher** ye kaam har second ek query se karta hai; CDC database ka log padh ke.',
    ],
    [
      'The office dispatch clerk who empties the “outgoing mail” tray every hour and takes the letters to the post office. If the post office is closed, the letters stay in the tray until the next round.',
      'Office ka dispatch clerk jo har ghante “outgoing mail” tray khaali karke chitthiyan post office le jaata hai. Post office band ho to chitthiyan agle round tak tray mein hi rehti hain.',
    ],
    { related: ['outbox', 'polling', 'cdc'], more: OUTBOX },
  ),
  g(
    'polling',
    'Polling',
    ['polling', 'poll', 'polled'],
    [
      'Asking again and again at a fixed interval — “anything new?” — instead of being told the moment something happens (push). Simple and reliable, but most answers are “no”, which wastes a little work, and there is a delay of up to one interval.',
      'Fixed interval pe baar-baar poochna — “kuch naya?” — bajaye iske ki kuch hote hi aapko bataya jaaye (push). Simple aur reliable, par zyaadatar jawab “nahi” hota hai, jisse thoda kaam bekaar jaata hai, aur ek interval tak ka delay hota hai.',
    ],
    [
      'Checking your letterbox every morning, instead of the postman ringing the bell when a letter comes.',
      'Har subah letterbox check karna, bajaye iske ki chitthi aate hi postman bell bajaye.',
    ],
    { related: ['message-relay', 'webhook', 'websocket'] },
  ),
  g(
    'transaction-log',
    'Transaction log (WAL, binlog)',
    ['transaction log', 'transaction logs', 'write-ahead log', 'WAL', 'binlog', 'binary log', 'oplog'],
    [
      'An append-only file where the database writes every change, in order, before applying it. PostgreSQL calls it the **WAL** (write-ahead log), MySQL the **binlog**, MongoDB the **oplog**. It is used for crash recovery and replication — and CDC tools read it to stream changes to other systems.',
      'Ek append-only file jisme database har change, order mein, apply karne se pehle likhta hai. PostgreSQL ise **WAL** (write-ahead log) kehta hai, MySQL **binlog**, MongoDB **oplog**. Ye crash recovery aur replication ke kaam aata hai — aur CDC tools ise padh ke changes doosre systems tak stream karte hain.',
    ],
    [
      'A shop’s day book: every sale is written down first, in order. If the till breaks, the whole day can be rebuilt from the book.',
      'Dukaan ki rokad bahi: har bikri pehle, order mein, likhi jaati hai. Galla kharab ho jaaye to poora din bahi se dobara banaya ja sakta hai.',
    ],
    { related: ['cdc', 'debezium', 'replication'] },
  ),
  g(
    'debezium',
    'Debezium',
    ['Debezium', 'Kafka Connect'],
    [
      'An open-source CDC tool that runs on **Kafka Connect**. It reads a database’s transaction log (PostgreSQL WAL, MySQL binlog, MongoDB oplog) and turns every insert, update and delete into a Kafka event. Its Outbox Event Router turns outbox rows into clean events — no polling code needed.',
      'Ek open-source CDC tool jo **Kafka Connect** pe chalta hai. Ye database ka transaction log (PostgreSQL WAL, MySQL binlog, MongoDB oplog) padhta hai aur har insert, update aur delete ko Kafka event bana deta hai. Iska Outbox Event Router outbox rows ko saaf events mein badal deta hai — polling code ki zaroorat nahi.',
    ],
    [
      'A court stenographer who writes down everything said, in order, and hands copies to whoever needs them — nobody has to repeat themselves.',
      'Court ka stenographer jo kahi gayi har baat order mein likhta hai aur jise chahiye use copy deta hai — kisi ko baat dohrani nahi padti.',
    ],
    { related: ['cdc', 'transaction-log', 'event-stream'], more: OUTBOX },
  ),
  g(
    'deduplication',
    'Deduplication (inbox pattern)',
    ['deduplication', 'deduplicate', 'deduplicated', 'dedupe', 'dedup', 'inbox pattern', 'inbox table'],
    [
      'Recognising a message or request you have already handled, and skipping it. The usual way is the **inbox pattern**: save each processed message id in a table with a unique key, in the same transaction as the work. If the same id comes again, the insert does nothing and the duplicate is ignored.',
      'Pehle se handle kiya gaya message ya request pehchaan ke skip karna. Aam tareeka **inbox pattern** hai: har processed message ki id ek unique key wali table mein, kaam ke saath same transaction mein save karo. Same id dobara aaye to insert kuch nahi karta aur duplicate ignore ho jaata hai.',
    ],
    [
      'A teacher ticking names on the attendance sheet: if a student answers “present” twice, the second tick changes nothing.',
      'Teacher attendance sheet pe naam tick karti hai: student do baar “present” bole to doosra tick kuch nahi badalta.',
    ],
    { related: ['idempotent-consumer', 'idempotency', 'unique-constraint'], more: CONSUMER },
  ),
  g(
    'two-phase-commit',
    'Two-phase commit (2PC)',
    ['two-phase commit', '2PC', 'XA', 'XA transaction', 'XA transactions', 'distributed transaction', 'distributed transactions'],
    [
      'A way to make several systems commit together. A coordinator first asks everyone “can you commit?” (prepare), and only if all say yes tells them “commit”. It is slow, holds locks while it waits, and gets stuck if the coordinator dies — and most message brokers do not support it. That is why the outbox and saga patterns exist.',
      'Kai systems ko ek saath commit karwane ka tareeka. Coordinator pehle sabse poochta hai “commit kar sakte ho?” (prepare), aur sab haan bolein tabhi kehta hai “commit karo”. Ye slow hai, wait karte hue locks pakde rehta hai, aur coordinator mar jaaye to atak jaata hai — aur zyaadatar message brokers ise support nahi karte. Isiliye outbox aur saga patterns bane.',
    ],
    [
      'A wedding: the priest asks both people “do you?” and declares them married only if both say yes. If one is stuck in traffic, everyone waits.',
      'Shaadi: pandit ji dono se poochte hain “manzoor hai?” aur dono haan bolein tabhi shaadi poori. Ek traffic mein phansa ho to sab wait karte hain.',
    ],
    { related: ['saga', 'outbox', 'acid'], more: OUTBOX },
  ),
  g(
    'message-broker',
    'Message broker',
    ['message broker', 'message brokers', 'broker', 'brokers', 'RabbitMQ', 'SQS', 'Amazon SQS', 'SNS', 'Amazon SNS'],
    [
      'The server (or cluster) that receives, stores and delivers messages between services — RabbitMQ, Amazon SQS and SNS, Kafka. Producers send to it and consumers read from it, so they never have to call each other directly or be up at the same time. In Kafka, each server in the cluster is called a broker.',
      'Wo server (ya cluster) jo services ke beech messages leta, rakhta aur pahunchata hai — RabbitMQ, Amazon SQS aur SNS, Kafka. Producers ise bhejte hain aur consumers isse padhte hain, isliye unhe ek doosre ko seedha call karne ya ek saath up rehne ki zaroorat nahi. Kafka mein cluster ke har server ko broker kehte hain.',
    ],
    [
      'A post office: you drop the letter there and leave; the receiver collects it when they are ready. You never need to meet.',
      'Post office: aap chitthi wahan chhod ke chale jaate ho; paane wala ready ho tab le leta hai. Milne ki zaroorat hi nahi.',
    ],
    { component: ['message-queue', 'event-stream'], related: ['message-queue', 'pub-sub', 'event-stream'] },
  ),
  g(
    'partition-key',
    'Partition key',
    ['partition key', 'partition keys', 'message key', 'ordering key', 'per-key ordering', 'ordering per key'],
    [
      'The value that decides which partition a record or message goes to — for example `user_id` or `order_id`. The same key always goes to the same partition, so in Kafka all events of one order stay in order, and in a database one user’s data sits together. A bad key (one value much bigger than the rest) creates a hot spot.',
      'Wo value jo tay karti hai ki record ya message kis partition mein jaayega — jaise `user_id` ya `order_id`. Same key hamesha same partition mein jaati hai, isliye Kafka mein ek order ke saare events order mein rehte hain, aur database mein ek user ka data saath rehta hai. Kharab key (ek value baaki sab se bahut badi) hot spot bana deti hai.',
    ],
    [
      'Bank counters by surname: every “S” customer goes to counter 3, so one family’s papers are always handled at the same desk, in the order they arrive.',
      'Surname ke hisaab se bank counters: har “S” wala customer counter 3 pe jaata hai, to ek parivaar ke kaagaz hamesha usi desk pe, aane ke order mein, handle hote hain.',
    ],
    { related: ['sharding', 'event-stream', 'hot-key'] },
  ),
  g(
    'skip-locked',
    'SKIP LOCKED',
    ['SKIP LOCKED', 'FOR UPDATE SKIP LOCKED'],
    [
      'A SQL option (`SELECT … FOR UPDATE SKIP LOCKED`, in PostgreSQL and MySQL 8) that locks the rows one worker picks and lets other workers skip those rows instead of waiting. Several workers can take jobs from the same table without ever grabbing the same job twice.',
      'Ek SQL option (`SELECT … FOR UPDATE SKIP LOCKED`, PostgreSQL aur MySQL 8 mein) jo ek worker ki chuni rows lock karta hai aur baaki workers ko wait karne ki jagah un rows ko chhod ke aage badhne deta hai. Kai workers same table se jobs le sakte hain, bina kabhi same job do baar uthaaye.',
    ],
    [
      'Several cashiers serving one token queue: if a token is already being served, the next free cashier simply calls the next number.',
      'Ek token line pe kai cashiers: koi token pehle se serve ho raha ho to agla khaali cashier bas agla number bula leta hai.',
    ],
    { related: ['pessimistic-locking', 'message-relay'] },
  ),
  g(
    'poison-message',
    'Poison message',
    ['poison message', 'poison messages', 'poison event', 'poison events', 'poison pill'],
    [
      'A message that fails every single time it is processed — bad data or a bug — no matter how often you retry. Without a limit it blocks the queue or loops forever. After a few attempts it should go to a dead-letter queue (or be marked FAILED) and raise an alert.',
      'Aisa message jo har baar process karne pe fail hota hai — kharab data ya bug — chahe kitni baar retry karo. Limit na ho to ye queue rok deta hai ya hamesha loop karta hai. Kuch koshishon ke baad ise dead-letter queue mein jaana chahiye (ya FAILED mark hona chahiye) aur alert bhejna chahiye.',
    ],
    [
      'A letter with an unreadable address: the postman keeps bringing it back. After a few tries it goes to the dead-letter office instead of blocking his bag.',
      'Na padhe jaane wale address ki chitthi: postman use baar-baar wapas laata hai. Kuch koshishon ke baad wo dead-letter office jaati hai, uska thaila nahi rokti.',
    ],
    { related: ['dlq', 'exponential-backoff'] },
  ),
  g(
    'payload',
    'Payload',
    ['payload', 'payloads'],
    [
      'The actual data carried by a message, request or token — the part the receiver cares about — as opposed to the headers and metadata around it.',
      'Message, request ya token ke andar ka asli data — wo hissa jisse receiver ko matlab hai — uske aas-paas ke headers aur metadata nahi.',
    ],
    ['In a courier parcel, the payload is what is inside the box — not the address label or the packaging.', 'Courier parcel mein payload dabbe ke andar ka saamaan hai — address label ya packing nahi.'],
  ),
  g(
    'fire-and-forget',
    'Fire-and-forget',
    ['fire-and-forget', 'fire and forget'],
    [
      'Sending a message or call without waiting for a confirmation and without retrying. Fast and simple, but if it fails nobody knows — fine for nice-to-have things like analytics, wrong for anything that must happen.',
      'Message ya call bhej dena, bina confirmation ka wait kiye aur bina retry ke. Fast aur simple, par fail ho to kisi ko pata nahi chalta — analytics jaisi “ho jaaye to accha” cheezon ke liye theek, zaroori kaam ke liye galat.',
    ],
    ['Dropping a postcard in a letterbox: you hope it arrives, but you get no receipt.', 'Letterbox mein postcard daalna: ummeed hai pahunch jaayega, par koi receipt nahi milti.'],
    { related: ['at-least-once', 'outbox'] },
  ),
  g(
    'cron',
    'Cron job (scheduled job)',
    ['cron job', 'cron jobs', 'cron', 'cron expression', 'scheduled job', 'scheduled jobs', 'CronJob', 'CronJobs'],
    [
      'A task that runs automatically on a schedule — every night at 2 AM, every 5 minutes — written as a **cron expression** such as `0 2 * * *`. Kubernetes has a CronJob object for the same idea. Run it in one place only, or the job runs twice.',
      'Ek kaam jo schedule pe apne aap chalta hai — har raat 2 baje, har 5 minute — **cron expression** jaise `0 2 * * *` se likha jaata hai. Kubernetes mein isi ke liye CronJob object hai. Ise ek hi jagah chalao, warna job do baar chalega.',
    ],
    ['An alarm that rings every morning at 6 — nobody has to remember to set it.', 'Alarm jo har subah 6 baje bajta hai — kisi ko set karna yaad nahi rakhna padta.'],
    { component: 'scheduler' },
  ),
  g(
    'search-index',
    'Search index (Elasticsearch)',
    ['search index', 'search indexes', 'search indexing', 'Elasticsearch', 'OpenSearch', 'Algolia'],
    [
      'A separate store built for fast text search, filters and ranking — Elasticsearch, OpenSearch, Algolia. It keeps an inverted index (word → documents that contain it) and is filled from the main database, usually by events or CDC, so it can lag a little behind.',
      'Fast text search, filters aur ranking ke liye bana alag store — Elasticsearch, OpenSearch, Algolia. Ye inverted index rakhta hai (word → wo documents jinme ye hai) aur main database se bhara jaata hai, aam taur pe events ya CDC se, isliye thoda peeche reh sakta hai.',
    ],
    [
      'The index at the back of a book: look up “outbox” and jump straight to pages 42 and 97, instead of reading every page.',
      'Kitaab ke peeche ka index: “outbox” dhoondo aur seedha page 42 aur 97 pe jao, har page padhne ki jagah.',
    ],
    { component: ['search-index', 'search-service'], related: ['cqrs', 'cdc'] },
  ),
  g(
    'cqrs',
    'CQRS',
    ['CQRS', 'command query responsibility segregation', 'read model', 'read models', 'write model'],
    [
      'Command Query Responsibility Segregation: one model (often one database) for writes, and a separate copy shaped for fast reads — for example PostgreSQL for writes, Elasticsearch or Redis for search and dashboards. The read side is updated by events, so it is eventually consistent.',
      'Command Query Responsibility Segregation: writes ke liye ek model (aksar ek database), aur fast reads ke liye alag copy — jaise writes ke liye PostgreSQL, search aur dashboards ke liye Elasticsearch ya Redis. Read side events se update hoti hai, isliye eventually consistent hai.',
    ],
    [
      'A library: the librarian updates the main register (the write model), and the catalogue that visitors search (the read model) is updated from it a little later.',
      'Library: librarian main register update karta hai (write model), aur visitors jo catalogue search karte hain (read model) wo usse thodi der baad update hota hai.',
    ],
    { related: ['eventual-consistency', 'search-index', 'event-sourcing'] },
  ),
  g(
    'event-sourcing',
    'Event sourcing',
    ['event sourcing', 'event-sourced', 'event store'],
    [
      'Storing every change as an event (“₹450 added”, “₹50 refunded”) instead of only the latest state. The current state is rebuilt by replaying the events. You get a full history and audit trail, but it is harder to build and to query.',
      'Sirf latest state ki jagah har change ko event ke roop mein save karna (“₹450 add hua”, “₹50 refund hua”). Current state events ko dobara chala ke banti hai. Poori history aur audit trail milti hai, par banana aur query karna mushkil hai.',
    ],
    ['A bank passbook: it lists every deposit and withdrawal, and your balance is just the sum of the lines.', 'Bank passbook: har jama aur nikasi likhi hoti hai, aur balance bas un lines ka jod hai.'],
    { related: ['cqrs', 'audit-log', 'event-stream'] },
  ),
  g(
    'audit-log',
    'Audit log',
    ['audit log', 'audit logs', 'audit trail', 'audit trails'],
    [
      'An append-only record of who did what, and when (“Asha changed the limit from ₹10k to ₹50k at 10:42”). It is never edited, so it can be trusted for security investigations and compliance checks.',
      'Kisne kya kiya aur kab, iska append-only record (“Asha ne 10:42 pe limit ₹10k se ₹50k ki”). Ise kabhi edit nahi kiya jaata, isliye security jaanch aur compliance checks mein ispe bharosa kiya ja sakta hai.',
    ],
    ['A building’s visitor register: every entry is signed and timed, and pages are never torn out.', 'Building ka visitor register: har entry pe sign aur time, aur page kabhi phaade nahi jaate.'],
    { related: ['event-sourcing'] },
  ),

  // ───────── Consuming messages safely ─────────
  g(
    'idempotent-consumer',
    'Idempotent consumer',
    ['idempotent consumer', 'idempotent consumers', 'Idempotent Consumer pattern', 'idempotent handler', 'idempotent handlers'],
    [
      'A message consumer that gives the same result whether a message arrives once or several times. Since brokers deliver **at least once**, duplicates will come; the consumer records each message id together with its work (or makes the work naturally safe to repeat), so a second copy changes nothing.',
      'Aisa message consumer jo same result de, chahe message ek baar aaye ya kai baar. Brokers **at least once** deliver karte hain, isliye duplicates aayenge hi; consumer har message ki id apne kaam ke saath record karta hai (ya kaam ko hi repeat karne ke liye safe banata hai), taaki doosri copy kuch na badle.',
    ],
    [
      'A bank cashing a cheque: it notes the cheque number as paid, so the same cheque presented again is refused — the money moves only once.',
      'Bank cheque cash karta hai: cheque number ko paid likh leta hai, isliye same cheque dobara aaye to mana — paisa ek hi baar jaata hai.',
    ],
    { component: 'event-consumer', related: ['deduplication', 'at-least-once', 'idempotency', 'outbox'], more: CONSUMER },
  ),
  g(
    'ack',
    'Acknowledgement (ack)',
    ['ack', 'acks', 'acked', 'nack', 'acknowledgement', 'acknowledgements', 'acknowledgment', 'acknowledge', 'acknowledges', 'acknowledged'],
    [
      'The “done, you can delete it” signal a consumer sends to the broker after handling a message. Until the broker gets the ack, it keeps the message and will deliver it again — so ack only **after** the work is saved. A **nack** says “failed, give it back”.',
      'Wo “ho gaya, ab hata do” signal jo consumer message handle karne ke baad broker ko bhejta hai. Ack milne tak broker message rakhta hai aur phir se deliver karega — isliye ack kaam save hone ke **baad hi** karo. **Nack** ka matlab “fail hua, wapas lo”.',
    ],
    ['Signing for a courier parcel: until you sign, the courier keeps trying to deliver it.', 'Courier parcel pe sign karna: jab tak sign nahi karte, courier deliver karne aata rehta hai.'],
    { related: ['at-least-once', 'visibility-timeout', 'idempotent-consumer'], more: CONSUMER },
  ),
  g(
    'visibility-timeout',
    'Visibility timeout (SQS)',
    ['visibility timeout', 'visibility timeouts'],
    [
      'In Amazon SQS, a received message is hidden from other consumers for a while (the visibility timeout, 30 seconds by default). If the consumer does not delete it in time — a crash, or just slow work — it becomes visible again and another consumer gets it. Set it longer than your slowest processing time.',
      'Amazon SQS mein receive hua message kuch der ke liye doosre consumers se chhupa rehta hai (visibility timeout, default 30 seconds). Consumer time pe delete na kare — crash ho ya kaam slow ho — to wo phir dikhne lagta hai aur doosre consumer ko mil jaata hai. Ise apne sabse slow processing time se lamba rakho.',
    ],
    [
      'A library book reserved for you for one hour: if you do not collect it in time, it goes back on the shelf for someone else.',
      'Library ki kitaab aapke liye ek ghante reserved: time pe nahi uthaayi to wapas shelf pe kisi aur ke liye chali jaati hai.',
    ],
    { related: ['ack', 'at-least-once', 'idempotent-consumer'], more: CONSUMER },
  ),
  g(
    'consumer-group',
    'Consumer group (and rebalancing)',
    ['consumer group', 'consumer groups', 'consumer group rebalance', 'consumer group rebalances', 'consumer rebalance', 'consumer rebalances', 'consumer-group rebalance'],
    [
      'In Kafka, consumers with the same group id share a topic’s partitions — each partition is read by one member. When a member joins, leaves or is too slow, the group **rebalances**: partitions move to other members, which start from the last committed offset, so recent messages can be read twice.',
      'Kafka mein same group id wale consumers ek topic ke partitions baant lete hain — har partition ek member padhta hai. Koi member jude, nikle ya bahut slow ho to group **rebalance** hota hai: partitions doosre members ke paas jaate hain, jo last committed offset se shuru karte hain, isliye haal ke messages do baar padhe ja sakte hain.',
    ],
    [
      'Cashiers sharing the billing counters: when one goes on a break, their counter is handed to another cashier, who may re-check the last few bills.',
      'Billing counters baantne wale cashiers: ek break pe jaaye to uska counter doosre ko milta hai, jo aakhri kuch bills dobara check kar sakta hai.',
    ],
    { component: 'event-stream', related: ['kafka-offset', 'partition-key', 'consumer-lag'] },
  ),
  g(
    'kafka-offset',
    'Offset (Kafka)',
    ['committed offset', 'committed offsets', 'last committed offset', 'offset commit', 'offset commits', 'consumer offset', 'consumer offsets', 'Kafka offset', 'Kafka offsets', 'commit the offset'],
    [
      'A message’s position number inside a Kafka partition (0, 1, 2…). Each consumer group saves — **commits** — the offset it has finished, so after a restart it continues from there. Messages handled after the last commit are read again.',
      'Kafka partition ke andar message ka position number (0, 1, 2…). Har consumer group jis offset tak kaam kar chuka hai use save — **commit** — karta hai, taaki restart ke baad wahin se aage badhe. Last commit ke baad handle hue messages dobara padhe jaate hain.',
    ],
    ['A bookmark in a novel: if you forget to move it, you re-read a few pages next time.', 'Novel mein bookmark: aage khiskaana bhool gaye to agli baar kuch page dobara padhoge.'],
    { component: 'event-stream', related: ['consumer-group', 'event-stream', 'at-least-once'] },
  ),
  g(
    'idempotent-producer',
    'Idempotent producer (Kafka)',
    ['idempotent producer', 'idempotent producers', 'enable.idempotence'],
    [
      'A Kafka producer setting (`enable.idempotence`, on by default since Kafka 3.0). The broker drops duplicate writes caused by the producer’s own network retries, using a producer id and sequence numbers per partition. It does not stop your app from publishing the same event twice, or consumers from reading twice.',
      'Kafka producer ki setting (`enable.idempotence`, Kafka 3.0 se default on). Broker producer ke apne network retries se bane duplicate writes ko producer id aur har partition ke sequence numbers se drop kar deta hai. Ye aapki app ko same event do baar publish karne se, ya consumers ko do baar padhne se nahi rokta.',
    ],
    ['A cashier who notices you handed over the same numbered token twice and only counts it once.', 'Cashier jo dekh leta hai ki aapne same number ka token do baar diya aur use ek hi baar ginta hai.'],
    { related: ['idempotent-consumer', 'event-stream', 'at-least-once'] },
  ),
  g(
    'fifo-queue',
    'FIFO queue',
    ['FIFO queue', 'FIFO queues', 'SQS FIFO', 'FIFO'],
    [
      'First in, first out: messages are delivered in the order they were sent (in SQS FIFO, per message group). SQS FIFO also drops copies with the same deduplication ID sent within 5 minutes. The price is lower throughput than a standard queue.',
      'First in, first out: messages bheje gaye order mein deliver hote hain (SQS FIFO mein har message group ke andar). SQS FIFO 5 minute ke andar same deduplication ID wali copies bhi drop karta hai. Kimat: standard queue se kam throughput.',
    ],
    ['A ticket counter line: whoever came first is served first, and nobody can be served twice for the same token.', 'Ticket counter ki line: jo pehle aaya use pehle, aur same token pe koi do baar serve nahi hota.'],
    { related: ['message-queue', 'deduplication', 'partition-key'] },
  ),
  g(
    'state-machine',
    'State machine',
    ['state machine', 'state machines', 'state transition', 'state transitions'],
    [
      'A fixed list of states and the allowed moves between them — an order goes PLACED → PAID → SHIPPED → DELIVERED, never backwards. Updating “only from the expected state” (`WHERE status = PAID`) makes a repeated message harmless: the second time, nothing matches.',
      'States ki fixed list aur unke beech allowed moves — order PLACED → PAID → SHIPPED → DELIVERED jaata hai, kabhi peeche nahi. “Sirf expected state se” update karna (`WHERE status = PAID`) repeat message ko bekaar bana deta hai: doosri baar kuch match hi nahi hota.',
    ],
    ['Parcel tracking: once it says “Delivered”, a late “Out for delivery” scan cannot move it back.', 'Parcel tracking: ek baar “Delivered” likh gaya to late aaya “Out for delivery” scan use peeche nahi le ja sakta.'],
    { related: ['idempotency', 'optimistic-locking', 'idempotent-consumer'] },
  ),
  g(
    'upsert',
    'Upsert',
    ['upsert', 'upserts', 'upserted', 'ON CONFLICT'],
    [
      'Insert a row, or — if one with the same key already exists — update it (or do nothing). In PostgreSQL: `INSERT … ON CONFLICT (key) DO UPDATE / DO NOTHING`. Because the same input always ends in the same row, upserts are a simple way to make a write idempotent.',
      'Row insert karo, ya — agar same key wali pehle se hai — use update karo (ya kuch mat karo). PostgreSQL mein: `INSERT … ON CONFLICT (key) DO UPDATE / DO NOTHING`. Same input hamesha same row pe khatam hota hai, isliye upsert kisi write ko idempotent banane ka aasaan tareeka hai.',
    ],
    ['Saving a contact on your phone: if the number is already there, it updates the name instead of creating a second contact.', 'Phone mein contact save karna: number pehle se ho to doosra contact banane ki jagah naam update ho jaata hai.'],
    { related: ['unique-constraint', 'idempotency', 'idempotent-consumer'] },
  ),
  g(
    'ledger',
    'Ledger',
    ['ledger', 'ledgers', 'ledger entry', 'ledger entries', 'ledger row', 'ledger rows'],
    [
      'An append-only record of money (or stock) movements: each entry is a row that is never edited, and a balance is the sum of the entries. Giving every entry a unique business id (like the expense id) means the same movement can never be recorded twice.',
      'Paise (ya stock) ki aavajahi ka append-only record: har entry ek row hai jise kabhi edit nahi karte, aur balance entries ka jod hai. Har entry ko unique business id (jaise expense id) dene se same aavajahi kabhi do baar record nahi ho sakti.',
    ],
    ['A shopkeeper’s khata (credit book): every purchase and payment is a new line, and what you owe is the total of the lines.', 'Dukaandaar ka khata: har khareed aur payment ek nayi line, aur aapka udhaar un lines ka total.'],
    { related: ['event-sourcing', 'audit-log', 'upsert'] },
  ),
];
