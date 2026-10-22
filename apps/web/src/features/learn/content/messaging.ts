import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const messagingGuides: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'message-queue',
    tagline: bi('A waiting line between two services, so neither has to wait for the other.', 'Do services ke beech ek line, taaki koi kisi ka wait na kare.'),
    intro: bi(
      'A message queue holds messages from producers until a consumer is ready to process them. The producer drops a message (“send order confirmation for #881”) and moves on; a consumer picks it up when it can, processes it and acknowledges it, and only then is it removed.\n\nThis decouples services in time: a burst of 10,000 orders becomes a queue that consumers work through steadily, and if the consumer is down for five minutes nothing is lost — messages simply wait.',
      'Message queue producers ke messages ko tab tak rakhti hai jab tak consumer process karne ko ready na ho. Producer message daalta hai (“#881 ka order confirmation bhejo”) aur aage badh jaata hai; consumer jab ho sake use uthata hai, process karta hai aur acknowledge karta hai, tabhi woh hatta hai.\n\nYeh services ko time mein alag karti hai: 10,000 orders ka jhatka ek line ban jaata hai jise consumers aaram se nipatte hain, aur consumer paanch minute down rahe toh bhi kuch nahi khota — messages bas wait karte hain.',
    ),
    problem: bi(
      'The order service called the email service directly. When the email service was slow, checkouts waited; when it was down, checkouts failed — even though the email could have been sent a minute later.',
      'Order service seedha email service ko call karti thi. Email service slow hoti toh checkouts wait karte; down hoti toh checkouts fail ho jaate — jabki email ek minute baad bhi bheja ja sakta tha.',
    ),
    before: scene(
      [[c('microservice', { id: 'orders', label: 'Orders', note: 'waiting…', state: 'bad' })], [c('notification-service', { label: 'Email service', note: 'down', state: 'bad' })]],
      [['orders!>notification-service', 'direct call']],
      bi('A direct call ties checkout to the email service’s health.', 'Direct call checkout ko email service ki sehat se baandh deta hai.'),
    ),
    solution: bi(
      'The order service publishes a message to a queue and finishes the checkout. The email service consumes messages at its own pace. If it is down, messages wait safely and are delivered when it returns.',
      'Order service queue mein message publish karke checkout poora kar deti hai. Email service apni speed se messages consume karti hai. Down ho toh messages surakshit wait karte hain aur wapas aane par deliver hote hain.',
    ),
    after: scene(
      [[c('microservice', { id: 'orders', label: 'Orders', state: 'good' })], [c('message-queue', { state: 'focus' })], [c('notification-service', { label: 'Email service' })]],
      [['orders~>message-queue', 'publish'], ['message-queue~>notification-service', 'consume + ack']],
      bi('Checkout publishes and moves on; the consumer catches up whenever it is ready.', 'Checkout publish karke aage badhta hai; consumer jab ready ho tab nipat leta hai.'),
    ),
    steps: [
      bi('The producer sends a message to the queue and gets a quick “stored” reply.', 'Producer queue mein message bhejta hai aur jaldi “stored” jawab paata hai.'),
      bi('A consumer receives the message; it becomes invisible to other consumers for a while.', 'Consumer message leta hai; kuch der ke liye woh doosre consumers ko nahi dikhta.'),
      bi('The consumer processes it and sends an acknowledgement — the queue deletes it.', 'Consumer process karke acknowledgement bhejta hai — queue use delete kar deti hai.'),
      bi('No acknowledgement (crash)? The message becomes visible again and is retried.', 'Acknowledgement nahi (crash)? Message phir dikhne lagta hai aur retry hota hai.'),
      bi('After too many failures, it moves to a dead-letter queue for inspection.', 'Bahut baar fail hone par woh jaanch ke liye dead-letter queue mein chala jaata hai.'),
    ],
    analogy: {
      icons: ['Ticket', 'ListOrdered', 'Utensils'],
      title: bi('The order tickets at a busy café', 'Busy café ke order tickets'),
      text: bi(
        'The cashier takes your order, puts a ticket on the rail and immediately serves the next customer. The baristas take tickets from the rail one by one. If one barista goes on a break, tickets wait on the rail — no order is forgotten.\n\nOnce a coffee is made, its ticket is removed. Each ticket is handled by exactly one barista.',
        'Cashier aapka order leta hai, rail par ticket lagata hai aur turant agle customer ko serve karta hai. Baristas rail se ek-ek ticket uthate hain. Ek barista break par jaaye toh tickets rail par wait karte hain — koi order bhoola nahi jaata.\n\nCoffee banne ke baad uska ticket hata diya jaata hai. Har ticket bilkul ek barista sambhalta hai.',
      ),
    },
    perfectFit: {
      title: bi('Sending confirmation emails after checkout', 'Checkout ke baad confirmation emails bhejna'),
      text: bi(
        'Each order needs one confirmation email, ideally within a minute, and checkout must never fail because the email provider is slow. A queue between the order service and the email sender is exactly that contract: each message processed once, retried if needed, never blocking checkout.',
        'Har order ko ek confirmation email chahiye, behtar hai ek minute ke andar, aur email provider slow hone se checkout kabhi fail nahi hona chahiye. Order service aur email sender ke beech queue bilkul yahi contract hai: har message ek baar process, zaroorat par retry, checkout kabhi block nahi.',
      ),
      why: [
        bi('Each message is a task for exactly one consumer.', 'Har message bilkul ek consumer ke liye task hai.'),
        bi('The work can happen a little later.', 'Kaam thoda baad mein ho sakta hai.'),
        bi('The producer must not depend on the consumer being up.', 'Producer consumer ke up hone par depend nahi hona chahiye.'),
      ],
    },
    avoidWhen: [
      bi('Several independent services must all react to the same event, and you want to replay history — use an event stream.', 'Kai independent services ko same event par react karna hai, aur history replay karni hai — event stream use karo.'),
      bi('The caller needs the answer right now to continue (checking stock before showing “Buy”).', 'Caller ko aage badhne ke liye jawab abhi chahiye (“Buy” dikhane se pehle stock check).'),
      bi('Nobody consumes from it — messages pile up forever.', 'Isse koi consume nahi karta — messages hamesha jama hote rehte hain.'),
    ],
    decisions: [
      bi('Delivery guarantee: at-most-once, at-least-once (most common) or exactly-once.', 'Delivery guarantee: at-most-once, at-least-once (sabse common) ya exactly-once.'),
      bi('Ordering: none, FIFO or per key.', 'Ordering: none, FIFO ya per key.'),
      bi('Dead-lettering for messages that keep failing, and retention.', 'Baar-baar fail hone wale messages ke liye dead-lettering, aur retention.'),
    ],
    confusedWith: [
      { type: 'event-stream', difference: bi('A queue hands each message to one consumer and deletes it; a stream keeps events in order for days so many consumers can each read them and replay.', 'Queue har message ek consumer ko deti hai aur delete kar deti hai; stream events ko order mein dino tak rakhta hai taaki kai consumers padh sakein aur replay kar sakein.'), compare: 'message-queue-vs-event-stream-vs-task-queue' },
      { type: 'task-queue', difference: bi('A message queue carries any messages between services; a task queue specifically carries jobs for a pool of background workers.', 'Message queue services ke beech koi bhi messages le jaati hai; task queue khaas taur par background workers ke pool ke liye jobs le jaati hai.'), compare: 'message-queue-vs-event-stream-vs-task-queue' },
    ],
    examples: ['Amazon SQS', 'RabbitMQ', 'Google Cloud Pub/Sub', 'Azure Service Bus'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'event-stream',
    tagline: bi('A durable, ordered diary of everything that happened — readable by many, replayable any time.', 'Jo kuch hua uski majboot, order wali diary — kai log padh sakte hain, kabhi bhi replay.'),
    intro: bi(
      'An event stream is an append-only log of events: “order 881 placed”, “payment 551 captured”, “driver 12 moved”. Events are kept in order (per key) for days or forever, and are not deleted when someone reads them.\n\nMany independent consumers — analytics, notifications, search indexing, fraud checks — each read the same stream at their own position. A new consumer can even start from the beginning and replay history. Apache Kafka is the classic example.',
      'Event stream events ka sirf-jodne-wala log hai: “order 881 placed”, “payment 551 captured”, “driver 12 moved”. Events order mein (per key) dino ya hamesha ke liye rakhe jaate hain, aur padhne par delete nahi hote.\n\nKai independent consumers — analytics, notifications, search indexing, fraud checks — har ek apni position se wahi stream padhta hai. Naya consumer shuru se history replay bhi kar sakta hai. Apache Kafka classic example hai.',
    ),
    problem: bi(
      'When an order was placed, the order service had to call analytics, notifications, search and fraud services one by one. Adding a new team’s service meant changing the order service again, and if analytics was down that day, its data was lost forever.',
      'Order place hone par order service ko analytics, notifications, search aur fraud services ko ek-ek karke call karna padta tha. Nayi team ki service jodne ka matlab order service phir se badalna, aur us din analytics down ho toh uska data hamesha ke liye kho jaata.',
    ),
    before: scene(
      [[c('microservice', { label: 'Orders', note: 'calls 4 services', state: 'bad' })], [c('data-warehouse', { label: 'Analytics', note: 'down → data lost', state: 'bad' }), c('notification-service'), c('search-service')]],
      ['microservice!>data-warehouse', 'microservice>notification-service', 'microservice>search-service'],
      bi('The producer must know and call every interested service; missed calls are lost.', 'Producer ko har interested service jaanni aur call karni padti hai; chhooti calls kho jaati hain.'),
    ),
    solution: bi(
      'The order service writes one event to the stream and is done. Each interested service reads the stream independently, keeps its own position and catches up after downtime. New consumers join without changing the producer.',
      'Order service stream mein ek event likhti hai aur kaam khatam. Har interested service stream ko independently padhti hai, apni position rakhti hai aur downtime ke baad catch up karti hai. Naye consumers producer badle bina jud jaate hain.',
    ),
    after: scene(
      [[c('microservice', { label: 'Orders', state: 'good' })], [c('event-stream', { state: 'focus', note: 'kept 7 days' })], [c('event-consumer', { id: 'an', label: 'Analytics' }), c('event-consumer', { id: 'no', label: 'Notifications' }), c('event-consumer', { id: 'se', label: 'Search indexer' })]],
      [['microservice~>event-stream', 'append'], 'event-stream~>an', 'event-stream~>no', 'event-stream~>se'],
      bi('One write, many independent readers — each at its own pace, able to replay.', 'Ek write, kai independent readers — har ek apni speed par, replay kar sakte hain.'),
    ),
    steps: [
      bi('Producers append events to a topic; events with the same key go to the same partition, in order.', 'Producers topic mein events jodte hain; same key wale events same partition mein, order mein jaate hain.'),
      bi('Events are stored durably and replicated across brokers.', 'Events majbooti se store aur brokers mein replicate hote hain.'),
      bi('Each consumer group tracks its own offset (how far it has read).', 'Har consumer group apna offset track karta hai (kitna padh chuka).'),
      bi('Partitions let many consumers in a group read in parallel.', 'Partitions group ke kai consumers ko parallel padhne dete hain.'),
      bi('Events stay for the retention period, so anyone can rewind and reprocess.', 'Events retention period tak rehte hain, isliye koi bhi peeche jaakar dobara process kar sakta hai.'),
    ],
    analogy: {
      icons: ['Newspaper', 'Library', 'Users'],
      title: bi('A newspaper archive anyone can read', 'Akhbaar ka archive jise koi bhi padh sake'),
      text: bi(
        'A town publishes every day’s news in order and keeps all the past issues in the library. The school, the police and the historian each read the same issues — the school reads today’s, the historian starts from 1990. Reading an issue does not remove it from the shelf.\n\nThat is the difference from a queue, where the café ticket is thrown away after the coffee is made.',
        'Ek shehar har din ki khabar order mein chhaapta hai aur saare purane issues library mein rakhta hai. School, police aur itihaaskaar wahi issues padhte hain — school aaj ka padhta hai, itihaaskaar 1990 se shuru karta hai. Issue padhne se woh shelf se hatta nahi.\n\nQueue se yahi farak hai, jahan coffee banne ke baad café ka ticket phenk diya jaata hai.',
      ),
    },
    perfectFit: {
      title: bi('Order events feeding many teams', 'Kai teams ko jaane wale order events'),
      text: bi(
        'Analytics, search, recommendations, fraud and notifications all care about “order placed”. With an event stream the order service publishes once; each team consumes independently, and the new recommendations team can replay the last 30 days to train its model.',
        'Analytics, search, recommendations, fraud aur notifications sabko “order placed” se matlab hai. Event stream ke saath order service ek baar publish karti hai; har team independently consume karti hai, aur nayi recommendations team model train karne ke liye pichhle 30 din replay kar sakti hai.',
      ),
      why: [
        bi('Many independent readers of the same events.', 'Wahi events ke kai independent readers.'),
        bi('Order per order/user matters.', 'Per order/user order (kram) zaroori hai.'),
        bi('History must be replayable.', 'History replay ho sake.'),
      ],
    },
    avoidWhen: [
      bi('You just need a list of jobs for workers, each done once — a task or message queue is simpler.', 'Bas workers ke liye jobs ki list chahiye, har ek ek baar — task ya message queue simple hai.'),
      bi('You need request-response (“what is the price?”) — use an API call.', 'Request-response chahiye (“price kya hai?”) — API call use karo.'),
      bi('You choose a partition key that sends most events to one partition (a hot key).', 'Aisi partition key chunna jo zyada tar events ek partition mein bheje (hot key).'),
    ],
    decisions: [
      bi('Partitions and partition key (ordering and parallelism).', 'Partitions aur partition key (ordering aur parallelism).'),
      bi('Replication factor (usually 3) and retention.', 'Replication factor (aam taur par 3) aur retention.'),
      bi('Delivery guarantee for consumers.', 'Consumers ke liye delivery guarantee.'),
    ],
    confusedWith: [
      { type: 'message-queue', difference: bi('Queue: each message to one consumer, deleted after. Stream: every consumer group sees every event, kept for replay.', 'Queue: har message ek consumer ko, baad mein delete. Stream: har consumer group har event dekhta hai, replay ke liye rakha jaata hai.'), compare: 'message-queue-vs-event-stream-vs-task-queue' },
      { type: 'stream-processor', difference: bi('The stream stores events; a stream processor is a program that continuously computes over them (counts, windows, joins).', 'Stream events store karta hai; stream processor ek program hai jo lagatar unpar compute karta hai (counts, windows, joins).') },
    ],
    examples: ['Apache Kafka', 'Amazon Kinesis', 'Apache Pulsar', 'Redpanda'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'event-consumer',
    tagline: bi('A service that listens for events and reacts to each one.', 'Ek service jo events sunti hai aur har ek par react karti hai.'),
    intro: bi(
      'An event consumer reads messages from a queue or events from a stream and does something with each: update a search index, send a notification, write a row to an audit store.\n\nIt runs continuously, usually as several instances sharing the work (a consumer group). Because messages can be delivered more than once, a good consumer is idempotent: processing the same event twice has the same effect as once.',
      'Event consumer queue se messages ya stream se events padhta hai aur har ek ke saath kuch karta hai: search index update, notification bhejna, audit store mein row likhna.\n\nYeh lagatar chalta hai, aam taur par kai instances kaam baantte hue (consumer group). Kyunki messages ek se zyada baar deliver ho sakte hain, achha consumer idempotent hota hai: same event do baar process karna ek baar jaisa hi asar karta hai.',
    ),
    problem: bi(
      'Events were published, but nothing reacted to them — or the reaction was coded inside the producer, making it slow and tangled. Teams needed a clean, separate place to say “when X happens, do Y”.',
      'Events publish hote the, lekin koi react nahi karta tha — ya reaction producer ke andar code hota tha, jisse woh slow aur uljha hua ho jaata. Teams ko “jab X ho, Y karo” kehne ki saaf, alag jagah chahiye thi.',
    ),
    before: scene(
      [[c('microservice', { label: 'Orders' })], [c('event-stream', { note: 'nobody reads', state: 'bad' })], [c('search-index', { note: 'out of date', state: 'bad' })]],
      ['microservice~>event-stream', 'event-stream.>search-index'],
      bi('Events are published but nothing turns them into action.', 'Events publish hote hain lekin unhe action mein koi nahi badalta.'),
    ),
    solution: bi(
      'A consumer subscribes to the stream, processes each event (here, updating the search index) and records its progress. Several instances share partitions, so it scales; idempotent writes make retries safe.',
      'Consumer stream ko subscribe karta hai, har event process karta hai (yahan, search index update) aur apni progress record karta hai. Kai instances partitions baantte hain, isliye scale hota hai; idempotent writes retries ko safe banate hain.',
    ),
    after: scene(
      [[c('microservice', { label: 'Orders' })], [c('event-stream')], [c('event-consumer', { state: 'focus', label: 'Index updater' })], [c('search-index', { state: 'good' })]],
      ['microservice~>event-stream', 'event-stream~>event-consumer', ['event-consumer>search-index', 'upsert']],
      bi('The consumer turns each event into an action, at its own pace.', 'Consumer har event ko apni speed par action mein badalta hai.'),
    ),
    steps: [
      bi('Subscribe to a queue or a stream topic (as part of a consumer group).', 'Queue ya stream topic subscribe karo (consumer group ke hisse ke roop mein).'),
      bi('Receive a batch of events.', 'Events ka ek batch receive karo.'),
      bi('Process each one — ideally with an idempotent write (upsert, dedupe key).', 'Har ek process karo — behtar hai idempotent write (upsert, dedupe key) ke saath.'),
      bi('Commit the offset or acknowledge, so the event is not delivered again.', 'Offset commit ya acknowledge karo, taaki event dobara deliver na ho.'),
      bi('On errors, retry with back-off; poison events go to a dead-letter queue.', 'Errors par back-off ke saath retry; poison events dead-letter queue mein jaate hain.'),
    ],
    analogy: {
      icons: ['Radio', 'User', 'ClipboardList'],
      title: bi('A dispatcher listening to the radio', 'Radio sunta hua dispatcher'),
      text: bi(
        'A taxi dispatcher listens to the radio all day. Every time a call comes in — “pickup at the station” — they write it on the board and assign a car. They do not decide what calls come in; they react to each one, in order, and never handle the same call twice.',
        'Taxi dispatcher poore din radio sunta hai. Har baar call aati hai — “station par pickup” — woh board par likhta hai aur gaadi assign karta hai. Kaunsi calls aayengi, yeh woh decide nahi karta; har ek par order mein react karta hai, aur same call do baar handle nahi karta.',
      ),
    },
    perfectFit: {
      title: bi('Keeping a search index in sync', 'Search index ko sync rakhna'),
      text: bi(
        'Every product change is published as an event. An indexer consumer reads them and updates the search index within seconds. If the indexer is down for ten minutes, it resumes from its last offset and catches up — nothing is missed.',
        'Har product change event ki tarah publish hota hai. Indexer consumer unhe padhkar seconds mein search index update karta hai. Indexer das minute down rahe toh apne last offset se shuru karke catch up karta hai — kuch nahi chhootta.',
      ),
      why: [
        bi('Reacts to facts that already happened.', 'Pehle ho chuke facts par react karta hai.'),
        bi('Can lag briefly and catch up.', 'Thodi der peeche reh kar catch up kar sakta hai.'),
        bi('Retries are safe because the update is idempotent.', 'Update idempotent hai isliye retries safe hain.'),
      ],
    },
    avoidWhen: [
      bi('There is no queue or stream feeding it — it would never receive anything.', 'Ise koi queue ya stream feed nahi karta — ise kabhi kuch nahi milega.'),
      bi('It must compute aggregates over time windows (“clicks per minute”) — a stream processor is built for that.', 'Ise time windows par aggregates nikaalne hain (“clicks per minute”) — stream processor isi ke liye bana hai.'),
      bi('Its writes are not idempotent and delivery is at-least-once — duplicates will slip through.', 'Iske writes idempotent nahi aur delivery at-least-once hai — duplicates nikal jaayenge.'),
    ],
    decisions: [
      bi('Instances and consumer group.', 'Instances aur consumer group.'),
      bi('Idempotency: idempotency keys or a dedupe store.', 'Idempotency: idempotency keys ya dedupe store.'),
      bi('Retry strategy.', 'Retry strategy (kitni baar, kitne gap par).'),
    ],
    confusedWith: [
      { type: 'background-worker', difference: bi('A worker executes tasks someone asked for; a consumer reacts to events that happened. Many systems use both.', 'Worker kisi ke kahe tasks karta hai; consumer hue events par react karta hai. Kai systems dono use karte hain.'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
      { type: 'stream-processor', difference: bi('A consumer handles events one at a time; a stream processor keeps state across events (counts, windows, joins).', 'Consumer events ek-ek karke handle karta hai; stream processor events ke beech state rakhta hai (counts, windows, joins).'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
    ],
    examples: ['Kafka consumer groups', 'AWS Lambda (event-triggered)', 'Spring Kafka listeners', 'Google Pub/Sub subscribers'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'scheduler',
    tagline: bi('An alarm clock for your system: “do this at 2 am” or “do this in 15 minutes”.', 'System ki alarm ghadi: “raat 2 baje yeh karo” ya “15 minute baad yeh karo”.'),
    intro: bi(
      'A scheduler triggers work at a time: on a repeating schedule (every night at 2 am, every hour) or after a delay (cancel this unpaid booking in 15 minutes). It does not do the heavy work itself — it puts a job in a queue or starts a worker at the right moment.\n\nA reliable scheduler makes sure each run happens exactly once, even when several copies of it are running for availability.',
      'Scheduler ek time par kaam shuru karta hai: repeating schedule par (har raat 2 baje, har ghante) ya delay ke baad (15 minute mein yeh unpaid booking cancel karo). Bhaari kaam yeh khud nahi karta — sahi waqt par queue mein job daalta ya worker shuru karta hai.\n\nBharosemand scheduler yeh pakka karta hai ki har run bilkul ek baar ho, chahe availability ke liye uski kai copies chal rahi hon.',
    ),
    problem: bi(
      'Nightly reports were run by a cron job on one specific server. When that server was replaced, the reports silently stopped. When two servers were given the cron for safety, invoices were sent twice.',
      'Raat ki reports ek khaas server ke cron job se chalti thi. Woh server badla gaya toh reports chupchaap ruk gayi. Safety ke liye do servers ko cron diya gaya toh invoices do baar chale gaye.',
    ),
    before: scene(
      [[a('cron1', 'Clock', 'Cron on server A', { note: 'server replaced', state: 'bad' }), a('cron2', 'Clock', 'Cron on server B')], [c('background-worker', { label: 'Send invoices', note: 'ran twice!', state: 'bad' })]],
      ['cron1!>background-worker', 'cron2>background-worker'],
      bi('Cron tied to machines: runs vanish with a server, or run twice on two.', 'Machines se bandha cron: server ke saath runs gayab, ya do par do baar.'),
    ),
    solution: bi(
      'A dedicated scheduler service (with a standby) owns the timetable. At the right moment it enqueues one job; workers do the work. Leader election or locks guarantee only one scheduler fires each run.',
      'Ek alag scheduler service (standby ke saath) timetable ki maalik hai. Sahi waqt par woh ek job queue mein daalti hai; workers kaam karte hain. Leader election ya locks guarantee karte hain ki har run sirf ek scheduler chalaye.',
    ),
    after: scene(
      [[c('scheduler', { state: 'focus', note: 'every night 02:00' })], [c('task-queue')], [c('background-worker', { label: 'Send invoices', state: 'good' })]],
      [['scheduler~>task-queue', '1 job'], 'task-queue~>background-worker'],
      bi('One scheduler fires each run exactly once and hands the work to a queue.', 'Ek scheduler har run bilkul ek baar chalata hai aur kaam queue ko deta hai.'),
    ),
    steps: [
      bi('You register a schedule (cron expression) or a delayed task with a due time.', 'Aap ek schedule (cron expression) ya due time ke saath delayed task register karte ho.'),
      bi('The scheduler stores it durably, so restarts do not lose it.', 'Scheduler use majbooti se store karta hai, taaki restart par na khoye.'),
      bi('When the time comes, the active scheduler (the leader) enqueues a job.', 'Waqt aane par active scheduler (leader) ek job queue mein daalta hai.'),
      bi('Workers pick up the job and do the actual work.', 'Workers job uthakar asli kaam karte hain.'),
      bi('If the leader dies, the standby takes over without double-firing.', 'Leader mar jaaye toh standby bina dobara chalaye sambhal leta hai.'),
    ],
    analogy: {
      icons: ['AlarmClock', 'CalendarDays', 'User'],
      title: bi('The school bell', 'School ki ghanti'),
      text: bi(
        'The school bell does not teach anything. It just rings at 9:00, 9:45 and 10:30 so that the right teacher starts the right class. There is one bell, so classes do not start twice, and if the bell breaks there is a backup.',
        'School ki ghanti kuch nahi padhati. Bas 9:00, 9:45 aur 10:30 par bajti hai taaki sahi teacher sahi class shuru kare. Ghanti ek hai, isliye classes do baar shuru nahi hoti, aur ghanti tooti toh backup hai.',
      ),
    },
    perfectFit: {
      title: bi('Releasing unpaid seat holds', 'Unpaid seat holds chhodna'),
      text: bi(
        'A ticketing site holds seats for 10 minutes while the user pays. The booking service registers a delayed task “release hold 991 at 10:42”. At 10:42 the scheduler enqueues it; a worker frees the seats if still unpaid.',
        'Ticketing site user ke pay karte waqt 10 minute seats hold karti hai. Booking service delayed task register karti hai “hold 991 ko 10:42 par release karo”. 10:42 par scheduler use queue mein daalta hai; abhi bhi unpaid ho toh worker seats chhod deta hai.',
      ),
      why: [
        bi('Work must happen at a specific time, not on a request.', 'Kaam ek khaas waqt par hona hai, request par nahi.'),
        bi('It must happen exactly once.', 'Yeh bilkul ek baar hona chahiye.'),
        bi('The heavy lifting is done by workers.', 'Bhaari kaam workers karte hain.'),
      ],
    },
    avoidWhen: [
      bi('Work should start as soon as something happens — use a queue or event, not a timer.', 'Kuch hote hi kaam shuru hona chahiye — timer nahi, queue ya event use karo.'),
      bi('You run the heavy job inside the scheduler — it should only trigger.', 'Bhaari job scheduler ke andar chalana — ise sirf trigger karna chahiye.'),
      bi('One scheduler instance with no standby for critical jobs.', 'Critical jobs ke liye bina standby ek scheduler instance.'),
    ],
    decisions: [
      bi('Trigger type: cron, delayed or both.', 'Trigger type: cron, delayed ya dono.'),
      bi('Availability: active-passive standby or managed service.', 'Availability: active-passive standby ya managed service.'),
    ],
    confusedWith: [
      { type: 'task-queue', difference: bi('The scheduler decides WHEN work starts; the task queue holds WHAT work is waiting.', 'Scheduler decide karta hai KAB kaam shuru ho; task queue rakhti hai KAUNSA kaam wait kar raha hai.'), compare: 'scheduler-vs-task-queue-vs-dead-letter-queue' },
      { type: 'batch-processor', difference: bi('A scheduler only triggers; a batch processor actually crunches large data when triggered.', 'Scheduler sirf trigger karta hai; batch processor trigger hone par sach mein bada data process karta hai.') },
    ],
    examples: ['Kubernetes CronJobs', 'Amazon EventBridge Scheduler', 'Quartz', 'Temporal schedules'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'task-queue',
    tagline: bi('A to-do list of jobs that background workers tick off one by one.', 'Jobs ki to-do list jise background workers ek-ek karke poora karte hain.'),
    intro: bi(
      'A task queue holds jobs — “resize image 42”, “generate invoice 77”, “import file 9” — for a pool of background workers. Each job is given to one worker; if the worker crashes, the job goes back to the queue and is retried.\n\nIt lets your app accept work instantly and do it reliably later, and lets you scale throughput by adding workers.',
      'Task queue background workers ke pool ke liye jobs rakhti hai — “image 42 resize karo”, “invoice 77 banao”, “file 9 import karo”. Har job ek worker ko milta hai; worker crash ho toh job queue mein wapas jaakar retry hota hai.\n\nYeh aapke app ko kaam turant accept karne aur baad mein bharose se karne deti hai, aur workers jodkar throughput badhane deti hai.',
    ),
    problem: bi(
      'Jobs were kept in a database table that workers polled. Two workers grabbed the same job, crashed jobs stayed “in progress” forever, and the table became a hot spot.',
      'Jobs ek database table mein rakhe jaate the jise workers poll karte the. Do workers same job utha lete, crash hue jobs hamesha “in progress” reh jaate, aur table hot spot ban jaati.',
    ),
    before: scene(
      [[c('background-worker', { id: 'w1', label: 'Worker 1' }), c('background-worker', { id: 'w2', label: 'Worker 2' })], [c('sql-db', { label: 'jobs table', note: 'same job grabbed twice', state: 'bad' })]],
      ['w1!>sql-db', 'w2!>sql-db'],
      bi('Workers polling a table: duplicate work and stuck jobs.', 'Table poll karte workers: dohra kaam aur atke jobs.'),
    ),
    solution: bi(
      'A task queue hands each job to exactly one worker at a time, with a visibility timeout: if the worker does not finish, the job reappears for another worker. Failed jobs retry with back-off and eventually land in a dead-letter queue.',
      'Task queue har job ek waqt mein bilkul ek worker ko deti hai, visibility timeout ke saath: worker poora na kare toh job doosre worker ke liye phir dikhta hai. Fail jobs back-off ke saath retry hote hain aur aakhir mein dead-letter queue mein jaate hain.',
    ),
    after: scene(
      [[c('app-server')], [c('task-queue', { state: 'focus' })], [c('background-worker', { id: 'w1', label: 'Worker 1' }), c('background-worker', { id: 'w2', label: 'Worker 2' })], [c('dead-letter-queue')]],
      [['app-server~>task-queue', 'enqueue'], 'task-queue~>w1', 'task-queue~>w2', ['w2~>dead-letter-queue', 'gave up']],
      bi('Each job goes to one worker; crashed jobs return; hopeless ones are parked.', 'Har job ek worker ko; crash hue jobs wapas; na-umeed jobs alag rakh diye.'),
    ),
    steps: [
      bi('Your app enqueues a job with the data the worker needs.', 'App worker ki zaroorat ke data ke saath job queue mein daalta hai.'),
      bi('A free worker takes it; the job is hidden from others while it runs.', 'Khaali worker use leta hai; chalte waqt job doosron se chhupa rehta hai.'),
      bi('Success: the worker marks it done and it is deleted.', 'Safal: worker done mark karta hai aur woh delete hota hai.'),
      bi('Crash or timeout: the job becomes visible again and is retried.', 'Crash ya timeout: job phir dikhta hai aur retry hota hai.'),
      bi('Too many failures: it moves to the dead-letter queue.', 'Bahut failures: woh dead-letter queue mein jaata hai.'),
    ],
    analogy: {
      icons: ['ClipboardList', 'Wrench', 'Users'],
      title: bi('A mechanic workshop’s job board', 'Mechanic workshop ka job board'),
      text: bi(
        'Cars arrive and the front desk pins a job card on the board. Whichever mechanic is free takes the next card. If a mechanic gets sick halfway, the card goes back on the board for someone else. Cards that keep failing go to the manager’s tray.',
        'Gaadiyan aati hain aur front desk board par job card laga deta hai. Jo mechanic khaali ho woh agla card leta hai. Beech mein mechanic bimaar pad jaaye toh card wapas board par kisi aur ke liye jaata hai. Baar-baar fail hone wale cards manager ki tray mein jaate hain.',
      ),
    },
    perfectFit: {
      title: bi('Processing uploaded CSV imports', 'Upload hue CSV imports process karna'),
      text: bi(
        'Users upload spreadsheets that take a minute each to validate and import. Each upload becomes one job; ten workers process them in parallel; a crashed import is retried; a broken file ends up in the dead-letter queue for support to look at.',
        'Users spreadsheets upload karte hain jinhe validate aur import karne mein ek-ek minute lagta hai. Har upload ek job banta hai; das workers parallel mein process karte hain; crash hua import retry hota hai; tooti file support ke dekhne ke liye dead-letter queue mein pahunchti hai.',
      ),
      why: [
        bi('Discrete jobs that each need one worker.', 'Alag-alag jobs, har ek ko ek worker chahiye.'),
        bi('Jobs may fail and must be retried safely.', 'Jobs fail ho sakte hain aur safely retry hone chahiye.'),
        bi('Throughput scales by adding workers.', 'Workers jodkar throughput badhta hai.'),
      ],
    },
    avoidWhen: [
      bi('Many different services must react to the same event — use an event stream.', 'Kai alag services ko same event par react karna hai — event stream use karo.'),
      bi('Jobs must run at a time of day — pair it with a scheduler.', 'Jobs din ke ek waqt par chalne chahiye — ise scheduler ke saath jodo.'),
      bi('High-priority work waits behind a huge backlog — use separate queues per priority.', 'High-priority kaam bade backlog ke peeche wait kare — har priority ki alag queue use karo.'),
    ],
    decisions: [
      bi('Delivery guarantee and ordering.', 'Delivery guarantee aur ordering.'),
      bi('Dead-lettering and retention.', 'Dead-lettering aur retention.'),
      bi('Separate queues for different priorities.', 'Alag priorities ke liye alag queues.'),
    ],
    confusedWith: [
      { type: 'message-queue', difference: bi('Very similar machinery; a task queue is specifically a backlog of jobs for workers, while a message queue carries messages between any services.', 'Machinery bahut milti-julti; task queue khaas taur par workers ke jobs ka backlog hai, jabki message queue kisi bhi services ke beech messages le jaati hai.'), compare: 'message-queue-vs-event-stream-vs-task-queue' },
      { type: 'scheduler', difference: bi('The queue holds work that is ready now; the scheduler decides when work becomes ready.', 'Queue abhi ready kaam rakhti hai; scheduler decide karta hai kaam kab ready ho.'), compare: 'scheduler-vs-task-queue-vs-dead-letter-queue' },
    ],
    examples: ['Celery (with RabbitMQ/Redis)', 'Sidekiq', 'BullMQ', 'Amazon SQS'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'dead-letter-queue',
    tagline: bi('The “problem tray” for messages that keep failing — so they stop blocking everything else.', 'Baar-baar fail hone wale messages ki “problem tray” — taaki woh baaki sab ko na rokein.'),
    intro: bi(
      'A dead-letter queue (DLQ) is where a message goes after it has failed processing too many times — for example, an order event with a corrupted address that crashes the consumer every time.\n\nMoving it aside keeps the main queue flowing, and keeps the bad message safe so engineers can inspect it, fix the bug and replay it later. Nothing is silently lost.',
      'Dead-letter queue (DLQ) woh jagah hai jahan message bahut baar process fail hone ke baad jaata hai — jaise kharab address wala order event jo har baar consumer ko crash kar deta hai.\n\nUse side mein karne se main queue chalti rehti hai, aur kharab message surakshit rehta hai taaki engineers use dekh sakein, bug fix karein aur baad mein replay karein. Kuch bhi chupchaap nahi khota.',
    ),
    problem: bi(
      'One malformed message (a “poison message”) crashed the consumer, went back to the queue, crashed it again — forever. Thousands of good messages behind it waited, or the message was eventually dropped and nobody knew an order was lost.',
      'Ek bigda message (“poison message”) consumer ko crash karta, queue mein wapas jaata, phir crash karta — hamesha. Uske peeche hazaaron achhe messages wait karte, ya aakhir mein message drop ho jaata aur kisi ko pata nahi chalta ki ek order kho gaya.',
    ),
    before: scene(
      [[c('message-queue', { note: 'poison at the front' })], [c('event-consumer', { note: 'crash → retry → crash', state: 'bad' })]],
      [['message-queue!>event-consumer', 'same message ×∞']],
      bi('One poison message blocks the queue or disappears unnoticed.', 'Ek poison message queue rok deta hai ya bina pata chale gayab ho jaata hai.'),
    ),
    solution: bi(
      'After N failed attempts (say 5), the queue moves the message to a DLQ. The consumer continues with the rest. An alert fires, someone inspects the message, fixes the cause and replays it.',
      'N fail attempts (jaise 5) ke baad queue message ko DLQ mein bhej deti hai. Consumer baaki ke saath chalta rehta hai. Alert bajta hai, koi message dekhta hai, wajah theek karta hai aur replay karta hai.',
    ),
    after: scene(
      [[c('message-queue')], [c('event-consumer', { state: 'good' })], [c('dead-letter-queue', { state: 'focus', note: '1 parked message' }), c('metrics-monitoring', { label: 'Alert' })]],
      ['message-queue~>event-consumer', ['event-consumer~>dead-letter-queue', 'after 5 tries'], 'dead-letter-queue.>metrics-monitoring'],
      bi('Failing messages are parked safely; everything else keeps flowing.', 'Fail hone wale messages surakshit side mein; baaki sab chalta rehta hai.'),
    ),
    steps: [
      bi('The queue counts delivery attempts for each message.', 'Queue har message ki delivery attempts ginti hai.'),
      bi('Once the limit is reached, the message moves to the DLQ with its error details.', 'Limit pahunchne par message error details ke saath DLQ mein jaata hai.'),
      bi('Monitoring alerts when the DLQ is not empty.', 'DLQ khaali na ho toh monitoring alert karta hai.'),
      bi('An engineer inspects, fixes the bug or the data, and replays the message.', 'Engineer dekhta hai, bug ya data theek karta hai, aur message replay karta hai.'),
    ],
    analogy: {
      icons: ['Mail', 'Inbox', 'User'],
      title: bi('The post office’s undeliverable-mail desk', 'Post office ki undeliverable-mail desk'),
      text: bi(
        'When a letter has a smudged address, the postman tries a few times and then hands it to the “undeliverable” desk instead of carrying it around forever. The rest of the mail goes out on time, and a clerk later works out where the letter should go.',
        'Jab letter ka address dhundla ho, postman kuch baar koshish karta hai aur phir use hamesha ghumane ke bajaye “undeliverable” desk ko de deta hai. Baaki dak samay par jaati hai, aur baad mein clerk pata lagata hai letter kahan jaana chahiye.',
      ),
    },
    perfectFit: {
      title: bi('Payment webhooks that occasionally fail', 'Kabhi-kabhi fail hone wale payment webhooks'),
      text: bi(
        'A payment provider’s webhook sometimes arrives with an unexpected field and crashes the handler. With a DLQ, those few events are parked after five tries, an alert fires, and after a quick fix they are replayed — no payment is ever lost or double-counted.',
        'Payment provider ka webhook kabhi-kabhi unexpected field ke saath aata hai aur handler crash kar deta hai. DLQ ke saath woh kuch events paanch koshishon ke baad side mein, alert bajta hai, aur jaldi fix ke baad replay hote hain — koi payment kabhi khota ya do baar gina nahi jaata.',
      ),
      why: [
        bi('Losing a message is unacceptable.', 'Message khona manzoor nahi.'),
        bi('Rare bad messages must not block good ones.', 'Kabhi-kabhi ke kharab messages achhon ko na rokein.'),
        bi('Humans need to inspect and replay.', 'Insaanon ko dekhkar replay karna hai.'),
      ],
    },
    avoidWhen: [
      bi('Nobody watches it — a DLQ without alerts is just a slower way to lose messages.', 'Koi ise dekhta nahi — bina alerts ki DLQ messages khone ka bas dheema tareeka hai.'),
      bi('You send messages there on the first transient error — retry with back-off first.', 'Pehli temporary error par hi wahan bhejna — pehle back-off ke saath retry karo.'),
    ],
    decisions: [
      bi('How many attempts before dead-lettering.', 'Dead-lettering se pehle kitni attempts.'),
      bi('Retention long enough to investigate.', 'Jaanch ke liye kaafi lambi retention.'),
    ],
    confusedWith: [
      { type: 'task-queue', difference: bi('The task queue carries normal jobs; the DLQ only holds jobs that failed again and again, waiting for a human.', 'Task queue normal jobs le jaati hai; DLQ sirf baar-baar fail hue jobs rakhti hai, insaan ke intezaar mein.'), compare: 'scheduler-vs-task-queue-vs-dead-letter-queue' },
    ],
    examples: ['Amazon SQS dead-letter queues', 'RabbitMQ dead-letter exchanges', 'Kafka DLQ topics', 'Azure Service Bus DLQ'],
  },
];
