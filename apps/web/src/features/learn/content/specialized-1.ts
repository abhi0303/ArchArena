import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const specializedGuides1: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'push-provider',
    tagline: bi('Apple’s and Google’s delivery service that wakes up a phone with your message.', 'Apple aur Google ki delivery service jo aapke message se phone jagati hai.'),
    intro: bi(
      'Phones do not let every app keep its own connection open — that would drain the battery. Instead, iOS keeps one connection to Apple Push Notification service (APNs) and Android to Firebase Cloud Messaging (FCM). Your backend sends a notification to APNs/FCM with a device token, and they deliver it to the phone, even if your app is closed.\n\nYou cannot replace them for mobile push; you integrate with them, usually through your notification service.',
      'Phones har app ko apna connection khula rakhne nahi dete — battery khatam ho jaayegi. Iske bajaye iOS Apple Push Notification service (APNs) se aur Android Firebase Cloud Messaging (FCM) se ek connection rakhta hai. Aapka backend device token ke saath APNs/FCM ko notification bhejta hai, aur woh phone tak deliver karte hain, chahe aapka app band ho.\n\nMobile push ke liye inhe replace nahi kar sakte; aap inse judte ho, aam taur par apni notification service ke through.',
    ),
    problem: bi(
      'An app that is closed cannot hear anything from your server. Without push, users only learned their food was delivered when they opened the app again — or your app tried to keep a background connection and the phone killed it to save battery.',
      'Band app aapke server se kuch nahi sun sakta. Push ke bina users ko khana deliver hone ka pata app dobara kholne par hi chalta — ya app background connection rakhne ki koshish karta aur phone battery bachane ke liye use maar deta.',
    ),
    before: scene(
      [[c('app-server', { label: 'Delivery service' })], [c('websocket-server', { note: 'app closed — no connection', state: 'bad' })], [c('mobile-client', { state: 'muted' })]],
      ['app-server>websocket-server', 'websocket-server!>mobile-client'],
      bi('Your own connection dies when the app is closed.', 'App band hote hi aapka apna connection mar jaata hai.'),
    ),
    solution: bi(
      'Your notification service sends the message to APNs or FCM with the user’s device token. The operating system’s always-on connection delivers it and shows it on the lock screen.',
      'Aapki notification service user ke device token ke saath message APNs ya FCM ko bhejti hai. Operating system ka hamesha-on connection use deliver karke lock screen par dikhata hai.',
    ),
    after: scene(
      [[c('notification-service')], [c('push-provider', { state: 'focus', note: 'APNs / FCM' })], [c('mobile-client', { label: 'Phone (app closed)', state: 'good' })]],
      [['notification-service>push-provider', 'device token + message'], ['push-provider>mobile-client', 'delivered']],
      bi('APNs/FCM use the phone’s system connection to deliver even when the app is closed.', 'APNs/FCM phone ke system connection se deliver karte hain, app band ho tab bhi.'),
    ),
    steps: [
      bi('When the app first runs, it asks permission and receives a device token.', 'App pehli baar chalne par permission maangta hai aur device token paata hai.'),
      bi('The app sends the token to your backend, which stores it with the user.', 'App token backend ko bhejta hai, jo use user ke saath store karta hai.'),
      bi('To notify, your backend calls APNs/FCM with the token and payload.', 'Notify karne ke liye backend token aur payload ke saath APNs/FCM call karta hai.'),
      bi('The provider delivers it; invalid tokens are reported back so you can delete them.', 'Provider deliver karta hai; invalid tokens wapas bataye jaate hain taaki aap delete kar sako.'),
    ],
    analogy: {
      icons: ['Mailbox', 'House', 'Bell'],
      title: bi('The postman who rings the doorbell', 'Doorbell bajane wala postman'),
      text: bi(
        'You cannot stand outside every friend’s house waiting for them to come out. The postal service already visits every house, so you post your note and the postman rings the bell. Phones work the same way: the platform’s postal service reaches the device for you.',
        'Aap har dost ke ghar ke bahar khade hokar unke bahar aane ka wait nahi kar sakte. Dak seva pehle se har ghar jaati hai, toh aap note post karte ho aur postman ghanti bajata hai. Phones bhi aise hi kaam karte hain: platform ki dak seva aapke liye device tak pahunchti hai.',
      ),
    },
    perfectFit: {
      title: bi('“Your order has arrived”', '“Aapka order aa gaya”'),
      text: bi(
        'A delivery app must tell users the moment the rider reaches their door, even if the app has been closed for an hour. A push through APNs/FCM is the only reliable way.',
        'Delivery app ko users ko turant batana hai jab rider darwaze par pahunche, chahe app ek ghante se band ho. APNs/FCM se push hi akela bharosemand tareeka hai.',
      ),
      why: [
        bi('The app is likely closed.', 'App shayad band hai.'),
        bi('The message is short and timely.', 'Message chhota aur samay par hai.'),
        bi('It must appear on the lock screen.', 'Yeh lock screen par dikhna chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You need a continuous stream of updates while the app is open (live tracking every second) — use WebSockets.', 'App khula hone par lagatar updates chahiye (har second live tracking) — WebSockets use karo.'),
      bi('You rely on it for guaranteed delivery — pushes can be delayed or dropped; store the data so the app can fetch it.', 'Guaranteed delivery ke liye is par bharosa — pushes late ya drop ho sakte hain; data store karo taaki app la sake.'),
    ],
    decisions: [
      bi('Who calls it (a notification service, never clients).', 'Ise kaun call karega (notification service, clients kabhi nahi).'),
      bi('How to handle expired device tokens.', 'Expired device tokens kaise handle karne hain.'),
    ],
    confusedWith: [
      { type: 'notification-service', difference: bi('Your notification service decides what and when; the push provider is the platform pipe that physically delivers.', 'Aapki notification service decide karti hai kya aur kab; push provider platform ki pipe hai jo sach mein deliver karti hai.'), compare: 'websocket-vs-notifications-vs-providers' },
      { type: 'websocket-server', difference: bi('WebSockets need the app open; push works when it is closed.', 'WebSockets ko app khula chahiye; push band hone par kaam karta hai.'), compare: 'websocket-vs-notifications-vs-providers' },
    ],
    examples: ['Apple Push Notification service (APNs)', 'Firebase Cloud Messaging (FCM)', 'Web Push', 'Huawei Push Kit'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'transcoder',
    tagline: bi('Turns one uploaded video into many sizes and formats that play everywhere.', 'Ek upload hue video ko kai sizes aur formats mein badalta hai jo har jagah chalein.'),
    intro: bi(
      'A media transcoder converts an uploaded video (or audio) into several versions: 240p, 480p, 720p, 1080p, different codecs, cut into small segments for streaming. Players then pick the best version for the viewer’s screen and network, switching on the fly (adaptive bitrate).\n\nTranscoding is CPU/GPU-heavy, so it runs asynchronously in a scalable pool of workers fed by a queue.',
      'Media transcoder upload hue video (ya audio) ko kai versions mein badalta hai: 240p, 480p, 720p, 1080p, alag codecs, streaming ke liye chhote segments mein kata hua. Phir player viewer ki screen aur network ke liye best version chunte hain, chalte-chalte badalte hue (adaptive bitrate).\n\nTranscoding CPU/GPU-heavy hai, isliye yeh queue se feed hone wale scalable workers ke pool mein asynchronously chalta hai.',
    ),
    problem: bi(
      'Users uploaded 4K videos straight from their phones, and the app served that same huge file to everyone. Viewers on slow mobile networks waited forever or saw endless buffering, and some devices could not play the format at all.',
      'Users phones se seedha 4K videos upload karte, aur app wahi bhaari file sabko serve karta. Slow mobile networks wale viewers hamesha wait karte ya bas buffering dekhte, aur kuch devices format chala hi nahi paate.',
    ),
    before: scene(
      [[c('object-storage', { label: 'Original 4K file' })], [c('cdn')], [a('phone', 'Smartphone', 'Viewer on 3G', { note: 'buffering…', state: 'bad' })]],
      ['object-storage>cdn', ['cdn!>phone', '4K only']],
      bi('One giant file for every viewer: endless buffering on slow networks.', 'Har viewer ke liye ek bhaari file: slow networks par buffering hi buffering.'),
    ),
    solution: bi(
      'After upload, a job is queued. Transcoders produce a ladder of renditions and short segments, write them to storage, and the player switches between qualities as the network changes.',
      'Upload ke baad job queue hota hai. Transcoders renditions ki seedhi aur chhote segments banate hain, storage mein likhte hain, aur network badalne par player qualities badalta hai.',
    ),
    after: scene(
      [[c('object-storage', { id: 'raw', label: 'Original' })], [c('task-queue')], [c('transcoder', { state: 'focus', note: '240p…1080p' })], [c('object-storage', { id: 'out', label: 'Renditions' })]],
      [['raw~>task-queue', 'new upload'], 'task-queue~>transcoder', 'transcoder>out'],
      bi('Uploads are queued and converted into many qualities for adaptive playback.', 'Uploads queue hote hain aur adaptive playback ke liye kai qualities mein badalte hain.'),
    ),
    steps: [
      bi('The original upload lands in object storage.', 'Original upload object storage mein aata hai.'),
      bi('A job is queued with the video id.', 'Video id ke saath job queue hota hai.'),
      bi('A transcoder downloads it and encodes each quality level, cutting segments of a few seconds.', 'Transcoder use download karke har quality level encode karta hai, kuch seconds ke segments kaatte hue.'),
      bi('Outputs and a playlist (manifest) are written to storage, then served via a CDN.', 'Outputs aur ek playlist (manifest) storage mein likhe jaate hain, phir CDN se serve.'),
      bi('Failures are retried; the video is marked ready when all qualities exist.', 'Failures retry hote hain; saari qualities banne par video ready mark hota hai.'),
    ],
    analogy: {
      icons: ['Factory', 'Package', 'Truck'],
      title: bi('A tailor making one design in every size', 'Ek design ko har size mein banata darzi'),
      text: bi(
        'A designer creates one dress. The workshop then cuts it in S, M, L and XL so every customer finds one that fits. Customers never receive the designer’s giant master pattern — they get the size that suits them.',
        'Designer ek dress banata hai. Phir workshop use S, M, L aur XL mein kaatta hai taaki har customer ko fit mile. Customers ko designer ka bada master pattern nahi milta — unhe unke layak size milta hai.',
      ),
    },
    perfectFit: {
      title: bi('A video-sharing platform', 'Video-sharing platform'),
      text: bi(
        'Creators upload in any format; viewers watch on phones, laptops and TVs over networks from 2G to fibre. Transcoding every upload into an adaptive ladder makes each video start fast and play smoothly everywhere.',
        'Creators kisi bhi format mein upload karte hain; viewers 2G se fibre tak ke networks par phones, laptops aur TVs par dekhte hain. Har upload ko adaptive seedhi mein transcode karne se har video jaldi shuru hoti aur har jagah smooth chalti hai.',
      ),
      why: [
        bi('Viewers have very different devices and networks.', 'Viewers ke devices aur networks bahut alag hain.'),
        bi('Encoding is heavy but can happen after upload.', 'Encoding bhaari hai lekin upload ke baad ho sakti hai.'),
        bi('The work parallelises across many machines.', 'Kaam kai machines par parallel hota hai.'),
      ],
    },
    avoidWhen: [
      bi('You run it inside the upload request — users wait minutes and timeouts kill the job.', 'Ise upload request ke andar chalana — users minutes wait karte hain aur timeouts job maar dete hain.'),
      bi('You need live video calls between people — that is a media server, not offline transcoding.', 'Logon ke beech live video calls chahiye — yeh media server hai, offline transcoding nahi.'),
    ],
    decisions: [
      bi('Instances (autoscale with the queue).', 'Instances (queue ke saath autoscale).'),
      bi('Idempotency and retries so a crashed job can restart safely.', 'Idempotency aur retries taaki crash hua job safely dobara chale.'),
    ],
    confusedWith: [
      { type: 'media-server', difference: bi('A transcoder converts stored files offline; a media server routes live audio/video between participants in real time.', 'Transcoder stored files offline badalta hai; media server participants ke beech live audio/video real time mein route karta hai.'), compare: 'media-server-vs-transcoder-vs-cdn' },
      { type: 'cdn', difference: bi('The transcoder prepares the versions; the CDN delivers them to viewers.', 'Transcoder versions taiyaar karta hai; CDN unhe viewers tak pahunchata hai.'), compare: 'media-server-vs-transcoder-vs-cdn' },
    ],
    examples: ['FFmpeg', 'AWS Elemental MediaConvert', 'Google Transcoder API', 'Mux'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'stream-processor',
    tagline: bi('Calculates answers continuously as events flow by — “clicks in the last minute”, live.', 'Events guzarte-guzarte lagatar jawab nikaalta hai — “pichhle minute ke clicks”, live.'),
    intro: bi(
      'A stream processor runs long-lived jobs over an event stream: counting, summing, joining and detecting patterns over windows of time. It remembers state between events — “this card was used 7 times in the last 10 minutes” — and checkpoints that state so it survives crashes.\n\nResults are produced seconds after events happen, which is what makes live dashboards, fraud checks and trending lists possible.',
      'Stream processor event stream par lambe chalne wale jobs chalata hai: time ke windows par ginti, jod, join aur patterns pakadna. Yeh events ke beech state yaad rakhta hai — “yeh card pichhle 10 minute mein 7 baar use hua” — aur us state ko checkpoint karta hai taaki crash ke baad bhi bachi rahe.\n\nResults events hone ke seconds baad aate hain, isi se live dashboards, fraud checks aur trending lists mumkin hote hain.',
    ),
    problem: bi(
      'A nightly batch job computed trending products. By the time results were ready, the trend was over. Fraud checks based on yesterday’s data missed attacks happening right now.',
      'Raat ka batch job trending products nikaalta tha. Results ready hone tak trend khatam ho chuka hota. Kal ke data par fraud checks abhi ho rahe attacks chook jaate.',
    ),
    before: scene(
      [[c('event-stream', { label: 'Clicks' })], [c('batch-processor', { note: 'runs at 2 am', state: 'bad' })], [a('dash', 'ChartLine', 'Trending list', { note: '14 hours old', state: 'bad' })]],
      ['event-stream~>batch-processor', 'batch-processor>dash'],
      bi('Nightly batches give answers long after they mattered.', 'Raat ke batches jawab tab dete hain jab zaroorat khatam ho chuki hoti.'),
    ),
    solution: bi(
      'A stream processor reads clicks as they arrive, keeps a sliding one-hour count per product in checkpointed state, and updates the trending list in a cache every few seconds.',
      'Stream processor clicks aate hi padhta hai, har product ki sliding ek ghante ki ginti checkpointed state mein rakhta hai, aur har kuch seconds mein cache mein trending list update karta hai.',
    ),
    after: scene(
      [[c('event-stream', { label: 'Clicks' })], [c('stream-processor', { state: 'focus', note: 'sliding 1-hour window' })], [c('distributed-cache', { label: 'Trending now', state: 'good' })]],
      ['event-stream~>stream-processor', ['stream-processor>distributed-cache', 'every 5 s']],
      bi('Results update continuously, seconds after the events.', 'Results lagatar update hote hain, events ke seconds baad.'),
    ),
    steps: [
      bi('Read events continuously from a stream (partitioned by key).', 'Stream se lagatar events padho (key se partitioned).'),
      bi('Group them into windows: tumbling (every minute), sliding (last 10 minutes) or session-based.', 'Unhe windows mein baanto: tumbling (har minute), sliding (pichhle 10 minute) ya session-based.'),
      bi('Update state per key (counts, sums, last seen).', 'Har key ki state update karo (counts, sums, last seen).'),
      bi('Checkpoint state regularly so a restart resumes exactly.', 'State niyamit checkpoint karo taaki restart bilkul wahin se shuru ho.'),
      bi('Emit results to a cache, database, alert or another stream.', 'Results cache, database, alert ya doosre stream mein bhejo.'),
    ],
    analogy: {
      icons: ['TrainFront', 'Users', 'Calculator'],
      title: bi('A turnstile counter at a metro station', 'Metro station ka turnstile counter'),
      text: bi(
        'The turnstile counts people as they pass and the screen shows “passengers in the last 15 minutes” live. Nobody waits until midnight to count the day’s tickets to know the station is getting crowded.',
        'Turnstile log guzarte hi ginta hai aur screen live dikhati hai “pichhle 15 minute mein yatri”. Station bheed wala ho raha hai yeh jaanne ke liye koi aadhi raat tak din ke tickets ginne ka wait nahi karta.',
      ),
    },
    perfectFit: {
      title: bi('Real-time fraud signals', 'Real-time fraud ke signals'),
      text: bi(
        'Every card transaction flows through a stream. A stream processor keeps per-card counts over sliding windows (“5 countries in 10 minutes”) and writes them to a feature store that the fraud model reads in milliseconds.',
        'Har card transaction stream se guzarta hai. Stream processor sliding windows par har card ki ginti rakhta hai (“10 minute mein 5 desh”) aur feature store mein likhta hai jise fraud model milliseconds mein padhta hai.',
      ),
      why: [
        bi('The answer is only useful within seconds.', 'Jawab sirf seconds ke andar kaam ka hai.'),
        bi('It depends on many events over a time window.', 'Yeh time window ke kai events par depend karta hai.'),
        bi('State must survive crashes exactly.', 'State crash ke baad bilkul bachi rehni chahiye.'),
      ],
    },
    avoidWhen: [
      bi('Each event needs a simple independent action (send an email) — a plain consumer is simpler.', 'Har event ko simple independent action chahiye (email bhejna) — simple consumer aasan hai.'),
      bi('Answers can wait until tomorrow — a batch job is cheaper and simpler.', 'Jawab kal tak ruk sakte hain — batch job sasta aur simple hai.'),
    ],
    decisions: [
      bi('Processing state: stateless or stateful with checkpoints.', 'Processing state: stateless ya checkpoints ke saath stateful.'),
      bi('Windowing: tumbling, sliding or session.', 'Windowing: tumbling, sliding ya session.'),
      bi('Delivery guarantee (exactly-once for money).', 'Delivery guarantee (paise ke liye exactly-once).'),
    ],
    confusedWith: [
      { type: 'batch-processor', difference: bi('Stream: continuous, seconds-old answers. Batch: big periodic runs over stored data, hours-old answers.', 'Stream: lagatar, seconds purane jawab. Batch: stored data par bade periodic runs, ghanton purane jawab.'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
      { type: 'event-consumer', difference: bi('A consumer reacts to each event alone; a stream processor remembers across events (windows, joins).', 'Consumer har event par akele react karta hai; stream processor events ke beech yaad rakhta hai (windows, joins).'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
    ],
    examples: ['Apache Flink', 'Kafka Streams', 'Spark Structured Streaming', 'Google Dataflow'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'batch-processor',
    tagline: bi('A heavy-duty engine that crunches huge piles of stored data on a schedule.', 'Bhaari engine jo schedule par stored data ke bade dher process karta hai.'),
    intro: bi(
      'A batch processor runs large jobs over data that is already stored: “recompute every user’s recommendations”, “build yesterday’s sales report”, “train the model on last month’s data”. It splits the work across many machines, processes terabytes in parallel and writes the results somewhere useful.\n\nJobs usually run on a schedule (hourly, nightly) and can take minutes to hours. Speed of a single answer does not matter; throughput does.',
      'Batch processor pehle se stored data par bade jobs chalata hai: “har user ke recommendations dobara nikaalo”, “kal ki sales report banao”, “pichhle mahine ke data par model train karo”. Yeh kaam kai machines mein baantta hai, terabytes parallel mein process karta hai aur results kaam ki jagah likhta hai.\n\nJobs aam taur par schedule par chalte hain (hourly, nightly) aur minutes se ghante le sakte hain. Ek jawab ki speed nahi, throughput zaroori hai.',
    ),
    problem: bi(
      'A single script processed 2 billion rows one at a time on one server. It took 30 hours — longer than a day — so the daily report was never on time, and a crash at hour 20 meant starting over.',
      'Ek script ek server par 2 arab rows ek-ek karke process karti thi. 30 ghante lagte — ek din se zyada — isliye daily report kabhi samay par nahi aati, aur 20ve ghante crash ka matlab shuru se.',
    ),
    before: scene(
      [[c('object-storage', { label: '2 TB of logs' })], [c('app-server', { label: 'One script', note: '30 hours', state: 'bad' })], [a('report', 'FileText', 'Daily report', { note: 'late', state: 'bad' })]],
      ['object-storage>app-server', 'app-server>report'],
      bi('One machine, one row at a time: the daily job takes more than a day.', 'Ek machine, ek row ek baar: daily job ek din se zyada leta hai.'),
    ),
    solution: bi(
      'A scheduler starts a batch job every night. The batch engine splits the data into chunks, processes them on dozens of machines in parallel, retries failed chunks only, and writes results in under an hour.',
      'Scheduler har raat batch job shuru karta hai. Batch engine data ko tukdon mein baantta hai, darjanon machines par parallel process karta hai, sirf fail tukde retry karta hai, aur ek ghante se kam mein results likhta hai.',
    ),
    after: scene(
      [[c('scheduler', { note: 'nightly' })], [c('batch-processor', { state: 'focus', note: '50 machines in parallel' })], [c('object-storage', { label: 'Raw data' }), c('data-warehouse', { label: 'Results', state: 'good' })]],
      ['scheduler>batch-processor', 'batch-processor>object-storage', 'batch-processor>data-warehouse'],
      bi('Work is split across many machines and finishes in time.', 'Kaam kai machines mein bata aur samay par khatam.'),
    ),
    steps: [
      bi('A scheduler triggers the job (for example nightly at 1 am).', 'Scheduler job trigger karta hai (jaise raat 1 baje).'),
      bi('The engine splits input files into many chunks.', 'Engine input files ko kai tukdon mein baantta hai.'),
      bi('Workers process chunks in parallel (map), then combine results (reduce).', 'Workers tukde parallel mein process karte hain (map), phir results jodte hain (reduce).'),
      bi('Failed chunks are retried without restarting everything.', 'Fail tukde sab kuch dobara shuru kiye bina retry hote hain.'),
      bi('Results are written to a warehouse, storage, feature store or index.', 'Results warehouse, storage, feature store ya index mein likhe jaate hain.'),
    ],
    analogy: {
      icons: ['Factory', 'Users', 'Package'],
      title: bi('Grading all exam papers after the exam', 'Exam ke baad saare papers check karna'),
      text: bi(
        'After a national exam, a million answer sheets are split among thousands of examiners who grade in parallel over a few days. Nobody grades each paper the moment it is written — it is done in one big organised batch, and results come out together.',
        'National exam ke baad das lakh answer sheets hazaaron examiners mein baant di jaati hain jo kuch dinon mein parallel check karte hain. Koi har paper likhte hi check nahi karta — ek bade organised batch mein hota hai, aur results saath mein aate hain.',
      ),
    },
    perfectFit: {
      title: bi('Nightly recommendation rebuild', 'Raat ka recommendation rebuild'),
      text: bi(
        'Once a night, a batch job reads all of yesterday’s views and purchases, recomputes “people who bought this also bought” for every product, and loads the results into a cache for tomorrow.',
        'Raat mein ek baar batch job kal ke saare views aur purchases padhta hai, har product ke liye “ise khareedne walon ne yeh bhi khareeda” dobara nikaalta hai, aur kal ke liye results cache mein load karta hai.',
      ),
      why: [
        bi('Huge amounts of stored data.', 'Bahut saara stored data.'),
        bi('Results can be hours old.', 'Results ghanton purane ho sakte hain.'),
        bi('Throughput matters more than latency.', 'Latency se zyada throughput zaroori hai.'),
      ],
    },
    avoidWhen: [
      bi('Answers are needed within seconds — use a stream processor.', 'Jawab seconds mein chahiye — stream processor use karo.'),
      bi('Work arrives as small independent jobs throughout the day — use a task queue and workers.', 'Kaam poore din chhote independent jobs ke roop mein aata hai — task queue aur workers use karo.'),
    ],
    decisions: [
      bi('Schedule: hourly, daily or on demand.', 'Schedule: hourly, daily ya on demand.'),
      bi('Where results go (warehouse, cache, feature store, index).', 'Results kahan jaayenge (warehouse, cache, feature store, index).'),
    ],
    confusedWith: [
      { type: 'stream-processor', difference: bi('Batch processes stored data periodically; stream processes events continuously as they arrive.', 'Batch stored data ko periodically process karta hai; stream events ko aate hi lagatar.'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
      { type: 'scheduler', difference: bi('The scheduler only says “start now”; the batch processor does the heavy work.', 'Scheduler sirf kehta hai “ab shuru karo”; bhaari kaam batch processor karta hai.') },
      { type: 'ml-service', difference: bi('Batch jobs often train models; the ML service serves those trained models to live requests.', 'Batch jobs aksar models train karte hain; ML service un trained models ko live requests ke liye serve karti hai.'), compare: 'ml-service-vs-feature-store-vs-batch-processor' },
    ],
    examples: ['Apache Spark', 'Hadoop MapReduce', 'AWS Glue', 'Google Dataproc'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'ml-service',
    tagline: bi('Serves a trained model’s predictions — “will this user like this?” — in milliseconds.', 'Trained model ki predictions serve karta hai — “kya yeh user ise pasand karega?” — milliseconds mein.'),
    intro: bi(
      'An ML inference service hosts a trained machine-learning model behind an API. Your services send it inputs (user, item, context features) and get predictions back: a fraud probability, a ranking score, an estimated delivery time.\n\nTraining happens elsewhere, usually offline in batch. The inference service is about fast, reliable answers at high volume — often on GPUs, with strict timeouts and a fallback when the model is slow.',
      'ML inference service ek trained machine-learning model ko API ke peeche host karti hai. Aapki services use inputs bhejti hain (user, item, context features) aur predictions paati hain: fraud probability, ranking score, estimated delivery time.\n\nTraining kahin aur hoti hai, aam taur par offline batch mein. Inference service tez, bharosemand jawabon ke baare mein hai bahut volume par — aksar GPUs par, sakht timeouts aur model slow ho toh fallback ke saath.',
    ),
    problem: bi(
      'Hand-written rules (“if the order is above ₹10,000 from a new device, flag it”) caught little fraud and blocked many good customers. The rules could not weigh hundreds of signals at once.',
      'Haath se likhe rules (“naye device se ₹10,000 se upar ka order ho toh flag karo”) kam fraud pakadte aur kai achhe customers ko rok dete. Rules ek saath sainkadon signals ko tol nahi paate.',
    ),
    before: scene(
      [[c('microservice', { label: 'Checkout' })], [a('rules', 'ListChecks', 'If-else rules', { note: 'misses fraud, blocks good users', state: 'bad' })]],
      ['microservice>rules'],
      bi('Simple rules cannot weigh hundreds of signals.', 'Simple rules sainkadon signals ko tol nahi paate.'),
    ),
    solution: bi(
      'A model trained on past transactions learns the patterns. Checkout calls the inference service with features and gets a risk score in 20 ms; if the model is slow, a timeout falls back to simple rules.',
      'Purane transactions par trained model patterns seekhta hai. Checkout features ke saath inference service call karta hai aur 20 ms mein risk score paata hai; model slow ho toh timeout simple rules par fallback karta hai.',
    ),
    after: scene(
      [[c('microservice', { label: 'Checkout' })], [c('ml-service', { state: 'focus', note: 'risk score in 20 ms' })], [c('feature-store')]],
      [['microservice>ml-service', 'score this payment'], 'ml-service>feature-store'],
      bi('Live requests get model predictions in milliseconds, with features from a feature store.', 'Live requests ko milliseconds mein model predictions, feature store ke features ke saath.'),
    ),
    steps: [
      bi('A model is trained offline and published to a model registry.', 'Model offline train hota hai aur model registry mein publish.'),
      bi('The inference service loads it (often on GPUs) and exposes an API.', 'Inference service use load karti hai (aksar GPUs par) aur API deti hai.'),
      bi('A caller sends ids; the service fetches features and runs the model.', 'Caller ids bhejta hai; service features laakar model chalati hai.'),
      bi('It returns a prediction within a strict time budget; on timeout the caller uses a fallback.', 'Sakht time budget mein prediction lautaati hai; timeout par caller fallback use karta hai.'),
      bi('Predictions and outcomes are logged to train the next version.', 'Agla version train karne ke liye predictions aur outcomes log hote hain.'),
    ],
    analogy: {
      icons: ['Stethoscope', 'ClipboardList', 'Brain'],
      title: bi('An experienced doctor giving a quick diagnosis', 'Tajurbekar doctor ka jaldi diagnosis'),
      text: bi(
        'A doctor spent years learning from thousands of patients (training). In the clinic, they look at your test results (features) and give a diagnosis in minutes (inference). They do not re-study medicine for every patient.',
        'Doctor ne saalon hazaaron patients se seekha (training). Clinic mein woh aapke test results (features) dekhkar minutes mein diagnosis dete hain (inference). Har patient ke liye dobara medicine nahi padhte.',
      ),
    },
    perfectFit: {
      title: bi('Ranking a home feed', 'Home feed ki ranking'),
      text: bi(
        'For every feed request, 500 candidate posts are scored by a ranking model using the user’s and posts’ features, and the top 20 are shown — all within 100 ms. An autoscaled inference service handles millions of such requests per minute.',
        'Har feed request par 500 candidate posts ranking model se score hote hain user aur posts ke features use karke, aur top 20 dikhte hain — sab 100 ms mein. Autoscaled inference service har minute lakhon aisi requests sambhalti hai.',
      ),
      why: [
        bi('Decisions depend on many signals.', 'Faisle kai signals par depend karte hain.'),
        bi('Answers are needed in milliseconds at huge volume.', 'Bahut volume par milliseconds mein jawab chahiye.'),
        bi('The model improves as it retrains.', 'Retrain hone par model behtar hota hai.'),
      ],
    },
    avoidWhen: [
      bi('A simple, explainable rule is good enough — ML adds cost and opacity.', 'Simple, samajh aane wala rule kaafi hai — ML kharcha aur dhundhlapan jodta hai.'),
      bi('You call it without a timeout or fallback — a slow model then blocks payments or pages.', 'Bina timeout ya fallback call karna — slow model payments ya pages rok deta hai.'),
    ],
    decisions: [
      bi('Serving mode: online (per request), batch, or hybrid.', 'Serving mode: online (har request), batch, ya hybrid.'),
      bi('Instances/autoscaling and timeouts.', 'Instances/autoscaling aur timeouts.'),
    ],
    confusedWith: [
      { type: 'feature-store', difference: bi('The feature store keeps the inputs (features); the ML service runs the model on them.', 'Feature store inputs (features) rakhta hai; ML service unpar model chalati hai.'), compare: 'ml-service-vs-feature-store-vs-batch-processor' },
      { type: 'batch-processor', difference: bi('Batch jobs usually train models offline; the ML service answers live requests.', 'Batch jobs aam taur par models offline train karte hain; ML service live requests ka jawab deti hai.'), compare: 'ml-service-vs-feature-store-vs-batch-processor' },
    ],
    examples: ['TensorFlow Serving', 'NVIDIA Triton', 'Amazon SageMaker endpoints', 'TorchServe'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'feature-store',
    tagline: bi('One shared shelf of ready-made model inputs, the same for training and for live use.', 'Model inputs ki ek shared shelf, training aur live use dono ke liye same.'),
    intro: bi(
      'Models need features: numbers that describe a user or item, like “orders in the last 30 days” or “average rating”. A feature store computes and stores them once, keeps an offline copy with history for training and an online copy for millisecond lookups at prediction time.\n\nBecause training and serving read the same definitions, the model sees in production exactly the kind of data it learned from.',
      'Models ko features chahiye: numbers jo user ya item ko describe karte hain, jaise “pichhle 30 din ke orders” ya “average rating”. Feature store unhe ek baar compute karke store karta hai, training ke liye history wali offline copy aur prediction ke waqt milliseconds lookups ke liye online copy rakhta hai.\n\nKyunki training aur serving same definitions padhte hain, model production mein bilkul waisa data dekhta hai jisse usne seekha.',
    ),
    problem: bi(
      'The data science team computed “orders in 30 days” one way in their training notebook, and engineers re-implemented it slightly differently in the live service. The model performed great in tests and badly in production, and every team recomputed the same features separately.',
      'Data science team ne training notebook mein “30 din ke orders” ek tarah nikaala, aur engineers ne live service mein thoda alag dobara banaya. Model tests mein shandaar aur production mein bura chala, aur har team same features alag-alag nikaalti rahi.',
    ),
    before: scene(
      [[a('nb', 'Notebook', 'Training notebook', { note: 'feature v1' })], [c('ml-service', { note: 'feature v2 (different!)', state: 'bad' })]],
      [['nb!>ml-service', 'model']],
      bi('Training and serving compute features differently — results drift.', 'Training aur serving features alag tarah nikaalte hain — results bhatak jaate hain.'),
    ),
    solution: bi(
      'Pipelines compute each feature once and write it to the feature store. Training reads historical values from the offline store; the live model reads current values from the online store in milliseconds.',
      'Pipelines har feature ek baar compute karke feature store mein likhti hain. Training offline store se historical values padhti hai; live model online store se milliseconds mein current values.',
    ),
    after: scene(
      [[c('stream-processor', { label: 'Feature pipeline' })], [c('feature-store', { state: 'focus', note: 'online + offline' })], [c('ml-service', { label: 'Live model' }), c('batch-processor', { label: 'Training' })]],
      ['stream-processor>feature-store', ['ml-service>feature-store', 'ms lookup'], ['batch-processor>feature-store', 'history']],
      bi('One definition, two uses: history for training, fresh values for serving.', 'Ek definition, do use: training ke liye history, serving ke liye fresh values.'),
    ),
    steps: [
      bi('Define a feature once (name, entity, how it is computed).', 'Feature ek baar define karo (naam, entity, kaise compute hota hai).'),
      bi('Batch and streaming pipelines compute values and write them.', 'Batch aur streaming pipelines values compute karke likhti hain.'),
      bi('The offline store keeps history with timestamps for training.', 'Offline store training ke liye timestamps ke saath history rakhta hai.'),
      bi('The online store keeps the latest value per entity for fast lookups.', 'Online store tez lookups ke liye har entity ki latest value rakhta hai.'),
    ],
    analogy: {
      icons: ['ChefHat', 'Package', 'Utensils'],
      title: bi('A restaurant’s prep kitchen', 'Restaurant ka prep kitchen'),
      text: bi(
        'Before service, the prep kitchen chops vegetables and makes sauces in labelled containers. During the dinner rush, chefs grab the prepared ingredients and cook in minutes. The same sauce recipe is used in cooking classes (training) and on busy nights (serving).',
        'Service se pehle prep kitchen sabziyan kaatta aur label lage containers mein sauces banata hai. Dinner rush mein chefs taiyaar ingredients uthakar minutes mein banate hain. Wahi sauce recipe cooking classes (training) aur busy raaton (serving) dono mein use hoti hai.',
      ),
    },
    perfectFit: {
      title: bi('Fraud and recommendation models sharing user features', 'User features share karte fraud aur recommendation models'),
      text: bi(
        'Both the fraud model and the recommendation model need “user’s orders in 7 days”. The feature store computes it once from the order stream, serves it in milliseconds to both live models, and provides consistent history for retraining.',
        'Fraud model aur recommendation model dono ko “user ke 7 din ke orders” chahiye. Feature store use order stream se ek baar compute karta hai, dono live models ko milliseconds mein deta hai, aur retraining ke liye consistent history deta hai.',
      ),
      why: [
        bi('Several models need the same features.', 'Kai models ko same features chahiye.'),
        bi('Training and serving must match exactly.', 'Training aur serving bilkul mel khaane chahiye.'),
        bi('Live lookups must be very fast.', 'Live lookups bahut tez hone chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You have one small model with a couple of simple inputs — a table and a cache are enough.', 'Ek chhota model do-teen simple inputs ke saath — table aur cache kaafi hain.'),
      bi('You use it as a general cache for application data.', 'Ise application data ke general cache ki tarah use karna.'),
    ],
    decisions: [
      bi('Store mode: online, offline or both.', 'Store mode: online, offline ya dono.'),
      bi('How fresh features must be (streaming versus batch pipelines).', 'Features kitne fresh hone chahiye (streaming vs batch pipelines).'),
    ],
    confusedWith: [
      { type: 'ml-service', difference: bi('Features are the inputs; the ML service is the model that turns them into predictions.', 'Features inputs hain; ML service woh model hai jo unhe predictions mein badalta hai.'), compare: 'ml-service-vs-feature-store-vs-batch-processor' },
      { type: 'distributed-cache', difference: bi('A cache stores any hot data temporarily; a feature store manages versioned ML features with history for training.', 'Cache koi bhi garam data temporarily rakhta hai; feature store training ke liye history ke saath versioned ML features manage karta hai.') },
    ],
    examples: ['Feast', 'Tecton', 'Amazon SageMaker Feature Store', 'Vertex AI Feature Store'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'geo-index',
    tagline: bi('Answers “what is near me?” instantly by organising the map into cells.', 'Map ko cells mein baantkar turant jawab deta hai “mere paas kya hai?”.'),
    intro: bi(
      'A geospatial index stores locations (latitude, longitude) in a structure that makes “find drivers within 2 km” or “restaurants in this area” fast. It divides the map into cells — geohash squares, S2 or H3 hexagons, or a quadtree — so a nearby search only checks a few neighbouring cells instead of every point on Earth.\n\nIt is often updated constantly, as drivers or riders move every few seconds.',
      'Geospatial index locations (latitude, longitude) ko aise structure mein rakhta hai jo “2 km ke andar drivers dhundho” ya “is area ke restaurants” ko tez banata hai. Yeh map ko cells mein baantta hai — geohash squares, S2 ya H3 hexagons, ya quadtree — taaki paas ki search sirf kuch padosi cells check kare, dharti ka har point nahi.\n\nIse aksar lagatar update kiya jaata hai, kyunki drivers ya riders har kuch seconds mein chalte hain.',
    ),
    problem: bi(
      'Finding the nearest drivers meant computing the distance from the rider to every one of 500,000 drivers on every request. It was slow, and it got slower as the company grew.',
      'Sabse paas ke drivers dhundhne ka matlab har request par rider se 5 lakh drivers mein se har ek ki doori nikaalna tha. Yeh slow tha, aur company badhne ke saath aur slow hota gaya.',
    ),
    before: scene(
      [[a('rider', 'User', 'Rider')], [c('app-server', { label: 'Matching' })], [c('sql-db', { label: 'All drivers', note: 'distance to 500k rows', state: 'bad' })]],
      ['rider>app-server', ['app-server!>sql-db', 'scan all']],
      bi('Checking the distance to every driver on every request.', 'Har request par har driver ki doori check karna.'),
    ),
    solution: bi(
      'Drivers’ locations stream into a geo index keyed by cell. A nearby search looks up the rider’s cell and its neighbours — a few hundred candidates instead of half a million — in milliseconds.',
      'Drivers ki locations cell key wale geo index mein stream hoti hain. Paas ki search rider ka cell aur uske padosi dekhti hai — aadhe million ke bajaye kuch sau candidates — milliseconds mein.',
    ),
    after: scene(
      [[c('mobile-client', { label: 'Driver app' })], [c('event-stream', { label: 'Locations' })], [c('geo-index', { state: 'focus', note: 'H3 cells' })], [c('microservice', { label: 'Matching' })]],
      [['mobile-client~>event-stream', 'every 4 s'], 'event-stream~>geo-index', ['microservice>geo-index', 'nearby?']],
      bi('Only nearby cells are searched, so “who is close?” is answered in milliseconds.', 'Sirf paas ke cells search hote hain, isliye “kaun paas hai?” milliseconds mein.'),
    ),
    steps: [
      bi('Convert each location to a cell id (geohash, S2, H3).', 'Har location ko cell id mein badlo (geohash, S2, H3).'),
      bi('Store items by cell; update the cell when they move.', 'Items cell ke hisaab se store karo; chalne par cell update karo.'),
      bi('For a search, find the searcher’s cell and the neighbouring cells within the radius.', 'Search ke liye searcher ka cell aur radius ke andar padosi cells dhundho.'),
      bi('Compute exact distances only for those candidates and sort.', 'Sirf un candidates ki exact doori nikaalo aur sort karo.'),
    ],
    analogy: {
      icons: ['Map', 'MapPin', 'Search'],
      title: bi('Postal codes on a map', 'Map par PIN codes'),
      text: bi(
        'To find a plumber near you, you do not check every plumber in the country — you look in your PIN code and the PIN codes next to it. The map is already divided into areas, so a local search is quick.',
        'Paas ka plumber dhundhne ke liye aap desh ke har plumber ko check nahi karte — apne PIN code aur uske bagal wale PIN codes mein dekhte ho. Map pehle se areas mein bata hai, isliye local search jaldi hoti hai.',
      ),
    },
    perfectFit: {
      title: bi('Matching riders with nearby drivers', 'Riders ko paas ke drivers se milaana'),
      text: bi(
        'Hundreds of thousands of drivers report their position every four seconds; every ride request asks for the closest available ones. A geo index sharded by city keeps both the constant updates and the nearby queries fast.',
        'Lakhon drivers har chaar second apni position batate hain; har ride request sabse paas ke available drivers maangti hai. City se sharded geo index lagatar updates aur paas ki queries dono ko tez rakhta hai.',
      ),
      why: [
        bi('Questions are about distance.', 'Sawaal doori ke baare mein hain.'),
        bi('Positions change constantly.', 'Positions lagatar badalti hain.'),
        bi('Results are needed in milliseconds.', 'Results milliseconds mein chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You search by text (“pizza”) and not by distance — use a search index (or combine both).', 'Aap text (“pizza”) se search karte ho, doori se nahi — search index use karo (ya dono milao).'),
      bi('You have a few hundred fixed locations — a simple distance calculation is fine.', 'Kuch sau fixed locations hain — simple doori ki calculation theek hai.'),
    ],
    decisions: [
      bi('Index type: geohash, quadtree, S2, H3 or R-tree.', 'Index type: geohash, quadtree, S2, H3 ya R-tree.'),
      bi('Replication and sharding (often by city or region).', 'Replication aur sharding (aksar city ya region se).'),
    ],
    confusedWith: [
      { type: 'search-index', difference: bi('A search index matches words; a geo index matches distance on a map.', 'Search index shabd milata hai; geo index map par doori.'), compare: 'geo-index-vs-search-index' },
    ],
    examples: ['Redis GEO', 'PostGIS', 'Uber H3', 'Google S2 Geometry'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'id-generator',
    tagline: bi('Hands out unique ids at huge speed, without everyone queuing at one database.', 'Bahut tezi se unique ids deta hai, bina sabko ek database par line lagwaye.'),
    intro: bi(
      'Every order, message and post needs a unique id. An ID generator issues them at scale — for example Snowflake-style 64-bit ids that combine a timestamp, a machine number and a counter, so many generators produce unique, roughly time-ordered ids without talking to each other.\n\nThis matters once data is sharded or spread across regions, where a single auto-increment counter becomes a bottleneck or simply cannot exist.',
      'Har order, message aur post ko unique id chahiye. ID generator unhe scale par deta hai — jaise Snowflake-style 64-bit ids jo timestamp, machine number aur counter ko jodti hain, taaki kai generators ek doosre se baat kiye bina unique, lagbhag time-ordered ids banayein.\n\nYeh tab zaroori hai jab data sharded ya regions mein faila ho, jahan ek auto-increment counter bottleneck ban jaata hai ya ho hi nahi sakta.',
    ),
    problem: bi(
      'Ids came from one database’s auto-increment column. After sharding, two shards both created order #1001. Routing every insert through one central counter fixed that but made it the slowest, most fragile part of the system.',
      'Ids ek database ke auto-increment column se aati thi. Sharding ke baad do shards dono ne order #1001 bana diya. Har insert ko ek central counter se guzarne se yeh theek hua lekin woh system ka sabse slow, sabse kamzor hissa ban gaya.',
    ),
    before: scene(
      [[c('sql-db', { id: 's1', label: 'Shard A', note: 'order #1001' }), c('sql-db', { id: 's2', label: 'Shard B', note: 'order #1001', state: 'bad' })]],
      [],
      bi('Separate auto-increment counters produce duplicate ids.', 'Alag auto-increment counters duplicate ids banate hain.'),
    ),
    solution: bi(
      'Each service asks its local ID generator (or uses a library) for a Snowflake-style id: time + machine id + sequence. Ids are unique across all machines and sort by creation time, with no central bottleneck.',
      'Har service apne local ID generator (ya library) se Snowflake-style id maangti hai: time + machine id + sequence. Ids saari machines par unique hain aur banne ke time se sort hoti hain, bina central bottleneck.',
    ),
    after: scene(
      [[c('microservice', { id: 'o1', label: 'Orders (A)' }), c('microservice', { id: 'o2', label: 'Orders (B)' })], [c('id-generator', { state: 'focus', note: 'time + machine + seq' })], [c('sharded-db')]],
      ['o1>id-generator', 'o2>id-generator', 'o1>sharded-db', 'o2>sharded-db'],
      bi('Unique, time-ordered ids from many machines, no shared counter.', 'Kai machines se unique, time-ordered ids, bina shared counter.'),
    ),
    steps: [
      bi('Each generator instance gets a unique machine number at start-up.', 'Har generator instance ko start-up par unique machine number milta hai.'),
      bi('An id = milliseconds since an epoch + machine number + a per-millisecond counter.', 'Ek id = epoch se milliseconds + machine number + per-millisecond counter.'),
      bi('Ids are unique without coordination and roughly sorted by time.', 'Ids bina coordination unique hain aur lagbhag time se sorted.'),
      bi('Clock problems are handled by refusing to go backwards.', 'Clock problems ko peeche jaane se mana karke handle kiya jaata hai.'),
    ],
    analogy: {
      icons: ['Ticket', 'Store', 'Hash'],
      title: bi('Bill numbers in a chain of shops', 'Dukaanon ki chain ke bill numbers'),
      text: bi(
        'Each shop in a chain prints bills like “2026-10-22 / Shop 17 / 0042”: date, shop number, then a running counter. Two shops can never print the same bill number, and nobody needs to call head office before printing a bill.',
        'Chain ki har dukaan aise bill chhaapti hai “2026-10-22 / Shop 17 / 0042”: date, shop number, phir chalta counter. Do dukaanein kabhi same bill number nahi chhaap sakti, aur bill chhaapne se pehle kisi ko head office call nahi karna padta.',
      ),
    },
    perfectFit: {
      title: bi('Message ids in a global chat system', 'Global chat system mein message ids'),
      text: bi(
        'Millions of messages per second are created in many regions. Snowflake-style ids are unique everywhere and sort by time, which also gives each chat a natural message order — no central counter involved.',
        'Kai regions mein har second lakhon messages bante hain. Snowflake-style ids har jagah unique hain aur time se sort hoti hain, jisse har chat ko natural message order bhi milta hai — bina central counter.',
      ),
      why: [
        bi('Huge write rates across many machines and regions.', 'Kai machines aur regions par bahut tez write rates.'),
        bi('Ids must be unique without coordination.', 'Ids bina coordination unique honi chahiye.'),
        bi('Time-ordering is useful.', 'Time-ordering kaam ki hai.'),
      ],
    },
    avoidWhen: [
      bi('One database handles everything — its auto-increment is simpler.', 'Ek database sab sambhalta hai — uska auto-increment simple hai.'),
      bi('Ids must be unguessable (password-reset links) — use random UUIDs or tokens.', 'Ids guess na ho sakein (password-reset links) — random UUIDs ya tokens use karo.'),
    ],
    decisions: [
      bi('Strategy: UUID, Snowflake, ticket server, DB sequence or range allocation.', 'Strategy: UUID, Snowflake, ticket server, DB sequence ya range allocation.'),
      bi('Instances (it must not become a single point of failure).', 'Instances (yeh single point of failure nahi banna chahiye).'),
    ],
    confusedWith: [
      { type: 'sql-db', difference: bi('A database auto-increment is simple but tied to one database; an ID generator works across shards and regions.', 'Database auto-increment simple hai lekin ek database se bandha hai; ID generator shards aur regions par kaam karta hai.'), compare: 'id-generator-vs-auto-increment' },
    ],
    examples: ['Twitter Snowflake (open-sourced design)', 'Sonyflake', 'ULID libraries', 'UUID v7'],
  },
];
