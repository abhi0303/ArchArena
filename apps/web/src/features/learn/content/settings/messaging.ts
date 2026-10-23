import { bi } from '../../dsl';
import type { SettingGuide } from '../../types';

/** Queue, stream, job and real-time settings. */
export const messagingSettings: SettingGuide[] = [
  // ───────────────────────── Queues, events & jobs ─────────────────────────
  {
    key: 'delivery',
    what: bi(
      'The promise the queue or stream makes about how many times each message reaches a consumer.',
      'Queue ya stream yeh vaada karta hai ki har message consumer tak kitni baar pahunchega.',
    ),
    why: bi(
      'Networks and consumers fail halfway. The system must choose between possibly losing a message and possibly delivering it twice — and your consumer must be built for that choice.',
      'Network aur consumers beech mein fail hote hain. System ko chunna padta hai: message khone ka risk ya do baar pahunchne ka risk — aur consumer ko usi choice ke hisaab se banana padta hai.',
    ),
    example: bi(
      'Sending a parcel. At most once: ordinary post — if it is lost, it is gone. At least once: the courier keeps coming until you sign, and if your signature gets lost you may get the parcel twice. Exactly once: the courier checks a register, so you never receive the same parcel twice.',
      'Parcel bhejna. At most once: normal daak — kho gaya to gaya. At least once: courier tab tak aata rahega jab tak aap sign na karo, aur sign kho gaya to parcel do baar bhi aa sakta hai. Exactly once: courier register check karta hai, to same parcel kabhi do baar nahi aata.',
    ),
    options: {
      'at-most-once': bi(
        'Each message arrives once or never; if anything fails it is lost. Fine for metrics, typing indicators and other data where a gap does not matter.',
        'Har message ek baar aata hai ya kabhi nahi; kuch fail hua to kho gaya. Metrics, typing indicators jaise data ke liye theek jahan gap se fark nahi padta.',
      ),
      'at-least-once': bi(
        'Redelivered until the consumer acknowledges it, so nothing is lost — but duplicates can arrive. The standard choice; consumers must be idempotent.',
        'Consumer ke acknowledge karne tak dobara bheja jaata hai, to kuch nahi khota — par duplicates aa sakte hain. Standard choice; consumers idempotent hone chahiye.',
      ),
      'exactly-once': bi(
        'Effectively once: the broker and consumer use transactions or de-duplication so each message’s effect happens once. More complex and slower (Kafka transactions, Flink checkpoints).',
        'Asar mein ek baar: broker aur consumer transactions ya de-duplication se ensure karte hain ki har message ka asar ek hi baar ho. Zyaada complex aur slow (Kafka transactions, Flink checkpoints).',
      ),
    },
    inChallenges: bi(
      'One financial streaming challenge checks for Exactly once. With At least once, set Idempotency on the consumer to stay safe.',
      'Ek financial streaming challenge Exactly once check karta hai. At least once ho to safe rehne ke liye consumer pe Idempotency set karo.',
    ),
  },
  {
    key: 'ordering',
    what: bi('Whether messages are processed in the order they were sent.', 'Messages usi order mein process hote hain ya nahi jisme bheje gaye the.'),
    why: bi(
      '“Order placed” must not be processed after “order cancelled”. But forcing one global order means only one consumer can work at a time.',
      '“Order placed” kabhi “order cancelled” ke baad process nahi hona chahiye. Par poore system ka ek hi order force karo to ek time pe ek hi consumer kaam kar sakta hai.',
    ),
    example: bi(
      'A bank. No ordering: any free counter takes anyone. Strict FIFO: one line and one counter. Per key: each family stays in its own line, in order, while several families are served at different counters at once.',
      'Bank. No ordering: koi bhi khaali counter kisi ko bhi le leta hai. Strict FIFO: ek line, ek counter. Per key: har family apni line mein order se rehti hai, aur kai families alag counters pe ek saath serve hoti hain.',
    ),
    options: {
      none: bi('Messages may be processed in any order. Maximum parallelism.', 'Messages kisi bhi order mein process ho sakte hain. Sabse zyaada parallelism.'),
      fifo: bi(
        'Strictly first-in, first-out for the whole queue. In practice only one consumer can process at a time, so throughput is low.',
        'Poori queue ke liye strict first-in, first-out. Asal mein ek time pe ek hi consumer process kar sakta hai, to throughput kam.',
      ),
      'per-key': bi(
        'Order is guaranteed among messages with the same key (same order ID, same chat), while different keys run in parallel. The best of both.',
        'Same key wale messages (same order ID, same chat) mein order guaranteed, aur alag keys parallel chalti hain. Dono duniya ka best.',
      ),
    },
    inChallenges: bi(
      'Checked where events for the same thing must stay in order (order status updates, chat messages) — choose Ordered per key.',
      'Jahan ek hi cheez ke events order mein rehne chahiye (order status updates, chat messages) wahan check hota hai — Ordered per key chuno.',
    ),
  },
  {
    key: 'deadLetter',
    what: bi(
      'A side queue for “poison” messages. After a message fails a set number of times, it is moved aside instead of being retried forever.',
      '“Zehreeli” messages ke liye ek side queue. Jab koi message kuch baar fail ho jaaye, to use hamesha retry karne ki jagah side mein rakh diya jaata hai.',
    ),
    why: bi(
      'One broken message (bad data, a bug) can be retried endlessly, block the messages behind it and burn resources. Moving it aside keeps the queue flowing and keeps the message for investigation.',
      'Ek toota message (galat data, bug) baar-baar retry ho ke apne peeche ke messages rok sakta hai aur resources jala sakta hai. Use side mein rakhne se queue chalti rehti hai aur message jaanch ke liye bacha rehta hai.',
    ),
    example: bi(
      'The post office’s “undeliverable” shelf: a letter with a wrong address goes there, rather than the postman returning to the same house every day.',
      'Post office ki “undeliverable” shelf: galat address wali chitthi wahan rakh di jaati hai, postman roz usi ghar ke chakkar nahi lagata.',
    ),
    options: {
      true: bi(
        'On: after N failed attempts the message moves to a dead-letter queue, to be inspected and replayed later.',
        'On: N failed attempts ke baad message dead-letter queue mein chala jaata hai, baad mein dekhne aur replay karne ke liye.',
      ),
      false: bi('Off: a poison message is retried forever or silently dropped.', 'Off: zehreela message hamesha retry hota hai ya chupchaap gir jaata hai.'),
    },
    inChallenges: bi(
      'There is also a separate Dead-letter Queue component. Turning this on (and/or adding that component) shows you have handled messages that keep failing.',
      'Ek alag Dead-letter Queue component bhi hai. Ise on karna (aur/ya woh component jodna) dikhata hai ki aapne baar-baar fail hone wale messages ko handle kiya hai.',
    ),
  },
  {
    key: 'partitions',
    what: bi(
      'An event stream topic is split into partitions. Each partition is an ordered log, and within one consumer group each partition is read by one consumer at a time.',
      'Event stream ka topic partitions mein baanta jaata hai. Har partition ek ordered log hai, aur ek consumer group mein har partition ek time pe ek hi consumer padhta hai.',
    ),
    why: bi(
      'Partitions are the unit of parallelism: you cannot have more busy consumers in a group than partitions. Too few partitions caps your throughput.',
      'Partitions hi parallelism ki unit hain: ek group mein partitions se zyaada consumers busy nahi ho sakte. Kam partitions throughput pe limit laga dete hain.',
    ),
    example: bi(
      'Lanes on a highway. One lane keeps cars in strict order but jams; eight lanes let eight cars move side by side. Cars in the same lane still keep their order.',
      'Highway ki lanes. Ek lane mein gaadiyan strict order mein par jam; aath lanes mein aath gaadiyan saath-saath chalti hain. Ek hi lane ki gaadiyan phir bhi order mein rehti hain.',
    ),
    options: {
      '1': bi('Total order, but only one consumer can work at a time.', 'Poora order, par ek time pe ek hi consumer kaam kar sakta hai.'),
      '8': bi('Modest parallelism; enough for many apps.', 'Theek-thaak parallelism; bahut apps ke liye kaafi.'),
      '32': bi('High throughput with many consumers.', 'Kai consumers ke saath high throughput.'),
      '128+': bi('Very large scale (hundreds of consumers, huge event rates).', 'Bahut bada scale (saikdon consumers, bahut zyaada event rate).'),
    },
    inChallenges: bi('High-throughput challenges check for 8 or more.', 'High-throughput challenges 8 ya zyaada check karte hain.'),
  },
  {
    key: 'consumerGroup',
    what: bi(
      'The name of the team of consumers sharing the work. Consumers in the same group split the events between them; a different group gets its own full copy of every event.',
      'Kaam baantne wali consumers ki team ka naam. Same group ke consumers events aapas mein baant lete hain; alag group ko har event ki apni poori copy milti hai.',
    ),
    why: bi(
      'It is how one stream feeds several independent jobs (send notifications, update search, load analytics) while each job scales on its own.',
      'Isi se ek stream kai alag-alag kaam chala paati hai (notifications bhejna, search update karna, analytics load karna) aur har kaam apne aap scale hota hai.',
    ),
    example: bi(
      'A newspaper agency: the delivery boys of the “Sector 5 team” split the houses between them, while the “Archive team” separately gets one copy of every paper.',
      'Akhbaar agency: “Sector 5 team” ke delivery boys ghar aapas mein baant lete hain, aur “Archive team” ko alag se har akhbaar ki ek copy milti hai.',
    ),
    goodValues: bi(
      'Name the group after its job: notification-senders, search-indexers, analytics-loaders, fraud-checkers.',
      'Group ka naam uske kaam pe rakho: notification-senders, search-indexers, analytics-loaders, fraud-checkers.',
    ),
    inChallenges: bi(
      'Not scored directly. It helps show that two services each process every event (fan-out) while scaling inside their own group.',
      'Seedha score nahi hota. Isse dikhta hai ki do services har event process karti hain (fan-out) aur apne group ke andar scale hoti hain.',
    ),
  },
  {
    key: 'processingState',
    what: bi(
      'Whether the stream processor looks at each event on its own, or keeps running state (counts, windows, joins) across events.',
      'Stream processor har event ko akele dekhta hai, ya events ke beech chalti state (counts, windows, joins) rakhta hai.',
    ),
    why: bi(
      'If a stateful job crashes without checkpoints, its counts restart from zero or events are counted twice.',
      'Agar stateful job bina checkpoints ke crash ho, to counts zero se shuru ho jaate hain ya events do baar gine jaate hain.',
    ),
    example: bi(
      'A ticket checker at a gate just checks and lets people in (stateless). A cricket scorer keeps the running total and writes it on the board after every over, so a replacement scorer can carry on (stateful with checkpoints).',
      'Gate pe ticket checker bas check karke andar jaane deta hai (stateless). Cricket scorer chalta hua total rakhta hai aur har over ke baad board pe likhta hai, taaki doosra scorer wahin se aage badh sake (stateful with checkpoints).',
    ),
    options: {
      stateless: bi('Each event is handled on its own (filter, transform, enrich). Easy to scale and restart.', 'Har event akele handle hota hai (filter, transform, enrich). Scale aur restart aasaan.'),
      'stateful-checkpointed': bi(
        'Keeps running state and saves checkpoints regularly, so after a crash it resumes from the last checkpoint without losing or double-counting events.',
        'Chalti state rakhta hai aur regular checkpoints save karta hai, to crash ke baad aakhri checkpoint se shuru karta hai — na events khote hain na do baar gine jaate hain.',
      ),
    },
    inChallenges: bi('Aggregation challenges (counts, top-K, fraud scores) check for Stateful with checkpoints.', 'Aggregation challenges (counts, top-K, fraud scores) Stateful with checkpoints check karte hain.'),
  },
  {
    key: 'windowing',
    what: bi(
      'How a stream processor groups events by time, for answers like “orders per minute” or “views in the last hour”.',
      'Stream processor events ko time ke hisaab se kaise group karta hai, “har minute ke orders” ya “pichhle ghante ke views” jaise jawabon ke liye.',
    ),
    why: bi(
      'A stream never ends, so you need a rule for which events belong to each count or total.',
      'Stream kabhi khatam nahi hoti, isliye ek rule chahiye ki kaunse events kis count ya total mein aayenge.',
    ),
    example: bi(
      'Cricket. Tumbling: each over is six balls, then a new over starts. Sliding: “runs in the last 5 overs”, updated after every ball. Session: a batting partnership lasts until a wicket falls.',
      'Cricket. Tumbling: har over chhe balls ka, phir naya over. Sliding: “pichhle 5 overs ke runs”, har ball ke baad update. Session: partnership tab tak chalti hai jab tak wicket na gire.',
    ),
    options: {
      none: bi('No time grouping.', 'Koi time grouping nahi.'),
      tumbling: bi(
        'Fixed windows that do not overlap: 10:00–10:01, 10:01–10:02. For “orders per minute”.',
        'Fixed windows jo overlap nahi hoti: 10:00–10:01, 10:01–10:02. “Har minute ke orders” ke liye.',
      ),
      sliding: bi(
        'Overlapping windows that move: “the last 5 minutes, updated every 10 seconds”. For trending lists, rate limits and fraud.',
        'Overlap karti, chalti windows: “pichhle 5 minute, har 10 second pe update”. Trending lists, rate limits aur fraud ke liye.',
      ),
      session: bi(
        'A window closes after a gap of inactivity (say 30 minutes without clicks). For user sessions.',
        'Kuch der koi activity na ho (jaise 30 minute bina click) to window band. User sessions ke liye.',
      ),
    },
    inChallenges: bi('Trending, top-K and analytics challenges check for Sliding or Tumbling.', 'Trending, top-K aur analytics challenges Sliding ya Tumbling check karte hain.'),
  },
  {
    key: 'trigger',
    what: bi('When the scheduler runs jobs: on a repeating schedule, once at a chosen time, or both.', 'Scheduler jobs kab chalata hai: repeat hone wale schedule pe, ek chuni hui time pe ek baar, ya dono.'),
    why: bi(
      'Reminders, expiries and cleanups all need work to happen later, at the right moment, without a user request.',
      'Reminders, expiry aur cleanup — sabko baad mein, sahi pal pe, bina user request ke kaam hona chahiye.',
    ),
    example: bi(
      'An alarm that rings every weekday at 7 am (cron) versus a one-time reminder “call Mum at 6 pm today” (delayed).',
      'Har weekday subah 7 baje bajne wala alarm (cron) aur ek baar ka reminder “aaj shaam 6 baje Mummy ko call karna” (delayed).',
    ),
    options: {
      cron: bi('Runs on a repeating schedule: every night at 02:00, every 5 minutes.', 'Repeat schedule pe chalta hai: har raat 02:00 baje, har 5 minute.'),
      delayed: bi(
        'Runs a job once at a specific future time: “send a reminder an hour before the meeting”, “cancel the unpaid booking after 10 minutes”.',
        'Ek job aage ki ek khaas time pe ek baar: “meeting se ek ghanta pehle reminder bhejo”, “10 minute mein payment na ho to booking cancel karo”.',
      ),
      both: bi('Supports both kinds of job.', 'Dono tarah ki jobs support karta hai.'),
    },
    inChallenges: bi('Reminder and expiry challenges check for Delayed jobs or Cron + delayed.', 'Reminder aur expiry challenges Delayed jobs ya Cron + delayed check karte hain.'),
  },
  {
    key: 'schedule',
    what: bi(
      'How often the batch processor runs its job — for example rebuilding recommendations or producing reports from the day’s data.',
      'Batch processor apna job kitni baar chalata hai — jaise recommendations dobara banana ya din ke data se reports nikaalna.',
    ),
    why: bi(
      'It trades freshness against cost: running more often gives fresher results but uses more compute.',
      'Yeh freshness aur kharche ka sauda hai: zyaada baar chalao to fresh results, par compute zyaada lagta hai.',
    ),
    example: bi(
      'A bakery bakes bread every morning (daily), refills the counter every hour (hourly), or bakes a cake when someone orders one (on demand).',
      'Bakery har subah bread banati hai (daily), har ghante counter bharti hai (hourly), ya koi order kare tab cake banati hai (on demand).',
    ),
    options: {
      hourly: bi('Results are at most about an hour old.', 'Results zyaada se zyaada lagbhag ek ghanta purane.'),
      daily: bi('The classic overnight job — reports, recommendations, billing.', 'Classic raat wala job — reports, recommendations, billing.'),
      'on-demand': bi('Runs when someone or something triggers it, such as a backfill or a manual report.', 'Jab koi ya kuch trigger kare tab chalta hai, jaise backfill ya manual report.'),
    },
    inChallenges: bi('Not scored directly. Pick what matches how fresh the results must be.', 'Seedha score nahi hota. Results kitne fresh chahiye, uske hisaab se chuno.'),
  },

  // ───────────────────────── Real-time & notifications ─────────────────────────
  {
    key: 'connectionRegistry',
    what: bi(
      'With many WebSocket servers, each user is connected to just one of them. The registry is how the system finds the right server for a user — or reaches every server.',
      'Kai WebSocket servers hon to har user sirf ek server se juda hota hai. Registry se system us user ka sahi server dhoondhta hai — ya har server tak pahunchta hai.',
    ),
    why: bi(
      'If Asha is on server 1 and Ravi on server 7, a message from Asha to Ravi must hop to server 7. Without a registry it never arrives.',
      'Agar Asha server 1 pe hai aur Ravi server 7 pe, to Asha ka message Ravi ke liye server 7 tak jaana chahiye. Registry na ho to message pahunchta hi nahi.',
    ),
    example: bi(
      'A hotel with many floors. The reception register says which room each guest is in, so a parcel goes straight there (shared cache). Or the hotel announces on every floor’s speaker and the right guest answers (pub/sub).',
      'Kai manzil wala hotel. Reception ka register batata hai kaunsa guest kis kamre mein hai, to parcel seedha wahan jaata hai (shared cache). Ya hotel har floor ke speaker pe announce karta hai aur sahi guest jawab deta hai (pub/sub).',
    ),
    options: {
      none: bi(
        'Each server knows only its own users. Messages for users on other servers are lost — works only with a single server.',
        'Har server sirf apne users ko jaanta hai. Doosre servers ke users ke messages kho jaate hain — sirf ek server ke saath chalta hai.',
      ),
      'shared-cache': bi(
        'A shared map in a cache (user ID → server ID). The sender looks up the right server and forwards the message directly. Efficient for one-to-one messages.',
        'Cache mein ek shared map (user ID → server ID). Bhejne wala sahi server dhoondh ke message seedha forward karta hai. One-to-one messages ke liye efficient.',
      ),
      pubsub: bi(
        'Every server subscribes to channels (per user or per room). A published message reaches whichever servers have subscribers. Simple for group chats and broadcasts.',
        'Har server channels (har user ya har room ka) subscribe karta hai. Publish hua message un servers tak pahunchta hai jinke subscribers hain. Group chats aur broadcasts ke liye simple.',
      ),
    },
    inChallenges: bi('Chat and real-time challenges check for Shared cache or Pub/sub.', 'Chat aur real-time challenges Shared cache ya Pub/sub check karte hain.'),
  },
  {
    key: 'heartbeat',
    what: bi(
      'The client and server exchange tiny “are you there?” pings every few seconds over the live connection.',
      'Client aur server live connection pe har kuch second mein chhote “tum ho na?” pings bhejte hain.',
    ),
    why: bi(
      'A phone that enters a tunnel does not say goodbye. Without heartbeats, the dead connection lingers, the user still looks “online” and server resources leak.',
      'Tunnel mein ghusa phone bye nahi bolta. Heartbeats ke bina mara hua connection pada rehta hai, user “online” dikhta rehta hai aur server resources barbaad hote hain.',
    ),
    example: bi(
      'Night guards radio the control room every hour to say “all OK”. If one guard stays silent, the control room sends someone to check.',
      'Raat ke guards har ghante control room ko radio pe “sab theek” bolte hain. Koi guard chup rahe to control room kisi ko check karne bhejta hai.',
    ),
    options: {
      true: bi(
        'On: a connection that stops answering is closed and the user is marked offline within seconds.',
        'On: jawab dena band karne wala connection band kar diya jaata hai aur user kuch seconds mein offline dikhta hai.',
      ),
      false: bi('Off: dead connections linger and presence (“online now”) becomes wrong.', 'Off: mare hue connections pade rehte hain aur presence (“abhi online”) galat ho jaati hai.'),
    },
    inChallenges: bi('Challenges with presence (“online / last seen”) check that it is on.', 'Presence (“online / last seen”) wale challenges check karte hain ki yeh on ho.'),
  },
  {
    key: 'mediaTopology',
    what: bi(
      'How audio and video travel between participants in a call: directly to each other, through a forwarding server, or through a mixing server.',
      'Call mein audio aur video participants ke beech kaise jaata hai: seedha ek doosre ko, forwarding server se, ya mixing server se.',
    ),
    why: bi(
      'Video is heavy. In a ten-person call where everyone sends to everyone, each phone uploads nine streams and melts. The topology decides who carries that load.',
      'Video bhaari hota hai. Das logon ki call mein sab sabko bhejein to har phone nau streams upload karta hai aur garam ho jaata hai. Topology decide karti hai ki yeh load kaun uthayega.',
    ),
    example: bi(
      'A group conversation. Mesh: everybody phones everybody. SFU: everyone speaks into a conference bridge that forwards each voice to the others. MCU: a TV studio mixes all the cameras into one broadcast.',
      'Group baat-cheet. Mesh: har koi har kisi ko phone karta hai. SFU: sab ek conference bridge mein bolte hain jo har awaaz baakiyon tak forward karta hai. MCU: TV studio saare cameras ko mix karke ek broadcast banata hai.',
    ),
    options: {
      mesh: bi(
        'Every participant sends their stream directly to every other participant. No server cost, but each person uploads N−1 streams; breaks down beyond about four people.',
        'Har participant apni stream seedha har doosre ko bhejta hai. Server ka kharcha nahi, par har insaan N−1 streams upload karta hai; lagbhag chaar logon ke baad toot jaata hai.',
      ),
      sfu: bi(
        'Selective Forwarding Unit: each participant uploads one stream to the server, which forwards it to the others (choosing a quality per receiver). Scales to large meetings — the Zoom / Google Meet approach.',
        'Selective Forwarding Unit: har participant server ko ek stream upload karta hai, server use baakiyon ko forward karta hai (har receiver ke liye quality chun ke). Badi meetings tak scale — Zoom / Google Meet wala tareeka.',
      ),
      mcu: bi(
        'Multipoint Control Unit: the server decodes every stream, mixes them into one combined video and sends one stream to each person. Easy on weak devices but very CPU-heavy for the server.',
        'Multipoint Control Unit: server har stream decode karta hai, sabko mix karke ek combined video banata hai aur har insaan ko ek stream bhejta hai. Kamzor devices ke liye aasaan par server ke liye bahut CPU-heavy.',
      ),
    },
    inChallenges: bi('The video-calling challenge checks for SFU.', 'Video-calling challenge SFU check karta hai.'),
  },
  {
    key: 'channels',
    what: bi('Which delivery channels the notification service sends through.', 'Notification service kin channels se bhejti hai.'),
    why: bi(
      'Each channel differs in speed, cost and reach. An OTP must arrive in seconds; a monthly statement can wait.',
      'Har channel speed, kharche aur pahunch mein alag hai. OTP seconds mein pahunchna chahiye; monthly statement ruk sakta hai.',
    ),
    example: bi(
      'A school reaching parents: an app notification for daily updates, an email for the monthly report card, an SMS for “school closed due to rain”.',
      'School parents tak pahunchta hai: roz ke updates ke liye app notification, monthly report card ke liye email, “baarish ki wajah se school band” ke liye SMS.',
    ),
    options: {
      push: bi(
        'Mobile or browser push notifications (through APNs / FCM). Instant and free, but users can switch them off.',
        'Mobile ya browser push notifications (APNs / FCM se). Turant aur free, par users band kar sakte hain.',
      ),
      email: bi('Rich content, cheap, not instant. Receipts, digests, statements.', 'Rich content, sasta, turant nahi. Receipts, digests, statements.'),
      sms: bi(
        'Reaches any phone, even without internet, but costs money per message. OTPs and critical alerts.',
        'Har phone tak pahunchta hai, bina internet ke bhi, par har message ke paise lagte hain. OTPs aur critical alerts.',
      ),
      'multi-channel': bi(
        'Chooses the channel per message and per user preference, with fallback (push first, SMS if it is not delivered).',
        'Har message aur user ki pasand ke hisaab se channel chunta hai, fallback ke saath (pehle push, deliver na ho to SMS).',
      ),
    },
    inChallenges: bi('Not scored directly. Notification challenges usually expect Multiple channels with user preferences.', 'Seedha score nahi hota. Notification challenges aam taur pe user preferences ke saath Multiple channels expect karte hain.'),
  },
  {
    key: 'webhooks',
    what: bi(
      'The payment provider calls your server back to confirm the final result of a payment.',
      'Payment provider aapke server ko wapas call karke payment ka final result confirm karta hai.',
    ),
    why: bi(
      'The redirect after paying can fail (tab closed, network gone), and some payments settle minutes later (pending UPI, bank transfers). Without a webhook you might never learn that a payment succeeded: money taken, no order.',
      'Payment ke baad ka redirect fail ho sakta hai (tab band, network gaya), aur kuch payments minutes baad settle hoti hain (pending UPI, bank transfer). Webhook na ho to shayad kabhi pata hi na chale ki payment ho gayi: paise kat gaye, order nahi bana.',
    ),
    example: bi(
      'A courier sends you an SMS saying “Delivered” instead of you phoning them every hour to ask.',
      'Courier aapko “Delivered” ka SMS bhejta hai, aapko har ghante phone karke poochna nahi padta.',
    ),
    options: {
      true: bi('On: the provider notifies you of every final status, even for late or interrupted payments.', 'On: provider har final status batata hai, late ya beech mein ruki payments ka bhi.'),
      false: bi('Off: you rely only on the user’s browser coming back, and payments can get stuck.', 'Off: aap sirf user ke browser ke wapas aane pe nirbhar ho, aur payments atak sakti hain.'),
    },
    inChallenges: bi(
      'The payment challenge checks that it is on. Make the webhook handler idempotent — providers retry webhooks.',
      'Payment challenge check karta hai ki yeh on ho. Webhook handler ko idempotent banao — providers webhooks retry karte hain.',
    ),
  },
  {
    key: 'propagation',
    what: bi(
      'How changes in the config service (feature flags, settings) reach all the running services.',
      'Config service ke changes (feature flags, settings) saari chalti services tak kaise pahunchte hain.',
    ),
    why: bi(
      'When you switch off a broken feature, you want every server to stop using it in seconds, not in ten minutes.',
      'Jab aap ek toota feature band karte ho, to chahte ho ki har server seconds mein use chhod de, das minute mein nahi.',
    ),
    example: bi(
      'Checking the school notice board every hour (polling) versus getting the update on the class WhatsApp group the moment it is posted (push / streaming).',
      'Har ghante school ka notice board dekhna (polling) aur class WhatsApp group pe post hote hi update milna (push / streaming).',
    ),
    options: {
      polling: bi(
        'Each service asks “anything new?” every N seconds. Simple, but changes take up to N seconds and most requests are wasted.',
        'Har service har N second mein poochti hai “kuch naya?”. Simple, par changes mein N second tak lagte hain aur zyaadatar requests bekaar.',
      ),
      push: bi('The config service notifies services when something changes. Changes arrive in seconds.', 'Kuch badalne pe config service services ko batati hai. Changes seconds mein pahunchte hain.'),
      streaming: bi(
        'Services keep a long-lived watch connection and receive each change instantly (etcd / ZooKeeper watches, gRPC streams).',
        'Services ek lamba watch connection rakhti hain aur har change turant milta hai (etcd / ZooKeeper watches, gRPC streams).',
      ),
    },
    inChallenges: bi('Feature-flag and config challenges check for Push or Streaming.', 'Feature-flag aur config challenges Push ya Streaming check karte hain.'),
  },
];
