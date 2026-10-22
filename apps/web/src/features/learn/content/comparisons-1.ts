import { bi } from '../dsl';
import type { Comparison } from '../types';

export const comparisons1: Comparison[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'load-balancer-vs-api-gateway-vs-reverse-proxy',
    types: ['load-balancer', 'api-gateway', 'reverse-proxy'],
    confusion: bi(
      'All three sit in front of your servers, receive client requests and forward them somewhere else. Many products can do all three jobs (NGINX can be a proxy, a load balancer and a basic gateway), so the names get used interchangeably.',
      'Teeno aapke servers ke aage baithte hain, client requests lete hain aur kahin aur forward karte hain. Kai products teeno kaam kar sakte hain (NGINX proxy, load balancer aur basic gateway ban sakta hai), isliye naam ek doosre ki jagah use ho jaate hain.',
    ),
    common: bi(
      'Each one is an “entry point”: clients talk to it instead of talking to your servers directly, which hides your servers and gives you one place to add rules.',
      'Har ek “entry point” hai: clients aapke servers ke bajaye isse baat karte hain, jisse servers chhupe rehte hain aur rules jodne ki ek jagah milti hai.',
    ),
    story: {
      setting: bi(
        'Imagine a large hotel. Guests arrive, and three different people help them in three different ways.',
        'Ek bada hotel socho. Guests aate hain, aur teen alag log unki teen alag tarah madad karte hain.',
      ),
      roles: [
        { type: 'reverse-proxy', icon: 'DoorOpen', role: bi('The doorman. Every visitor talks to him first; he keeps the staff areas private and passes requests inside. He does not care who you are or how busy each room is.', 'Doorman. Har visitor pehle usse baat karta hai; woh staff areas private rakhta hai aur requests andar pahunchata hai. Use farak nahi padta aap kaun ho ya har kamra kitna busy hai.') },
        { type: 'api-gateway', icon: 'IdCard', role: bi('The receptionist. She checks your booking and ID, limits how many requests one guest can make, and sends you to the right department: rooms, spa or restaurant.', 'Receptionist. Woh aapki booking aur ID check karti hai, ek guest kitni requests kar sakta hai yeh limit karti hai, aur sahi department bhejti hai: rooms, spa ya restaurant.') },
        { type: 'load-balancer', icon: 'TrafficCone', role: bi('The restaurant host. Inside the restaurant, he seats each guest at whichever of the identical tables is free, and skips tables being cleaned.', 'Restaurant host. Restaurant ke andar woh har guest ko jo ek jaisi table khaali ho wahan bithata hai, aur saaf ho rahi tables chhod deta hai.') },
      ],
    },
    rows: [
      { feature: bi('Main job', 'Main kaam'), values: [bi('Spread load across identical copies of one service', 'Ek service ki ek jaisi copies mein load baantna'), bi('One front door for many services: auth, limits, routing', 'Kai services ka ek darwaza: auth, limits, routing'), bi('Stand in front and forward; hide backend servers', 'Aage khade hokar forward karna; backend servers chhupana')] },
      { feature: bi('Knows who the caller is?', 'Caller kaun hai jaanta hai?'), values: [bi('No', 'Nahi'), bi('Yes — tokens, API keys, plans', 'Haan — tokens, API keys, plans'), bi('Usually no', 'Aam taur par nahi')] },
      { feature: bi('Routes by path to different services', 'Path se alag services par route'), values: [bi('Only layer-7 balancers, basic', 'Sirf layer-7 balancers, basic'), bi('Yes — its core feature', 'Haan — iska main feature'), bi('Yes, simple rules', 'Haan, simple rules')] },
      { feature: bi('Health checks and failover between copies', 'Copies ke beech health checks aur failover'), values: [bi('Yes — its core feature', 'Haan — iska main feature'), bi('Usually delegates to a load balancer', 'Aam taur par load balancer ko saunpta hai'), bi('Sometimes', 'Kabhi-kabhi')] },
      { feature: bi('Per-user rate limits and quotas', 'Per-user rate limits aur quotas'), values: [bi('No', 'Nahi'), bi('Yes', 'Haan'), bi('Basic per-IP limits at most', 'Zyada se zyada basic per-IP limits')] },
      { feature: bi('Typical place in a design', 'Design mein aam jagah'), values: [bi('In front of a group of identical servers', 'Ek jaise servers ke group ke aage'), bi('At the edge of a microservice system', 'Microservice system ke kinare par'), bi('In front of one or a few servers, TLS termination', 'Ek ya kuch servers ke aage, TLS termination')] },
    ],
    pickWhen: [
      { type: 'load-balancer', points: [bi('You run several copies of the same service and want them all used.', 'Same service ki kai copies chalate ho aur sab use karni hain.'), bi('Servers come and go (autoscaling, failures).', 'Servers aate-jaate hain (autoscaling, failures).')] },
      { type: 'api-gateway', points: [bi('Many services sit behind one public API.', 'Ek public API ke peeche kai services hain.'), bi('Callers need authentication, API keys and quotas.', 'Callers ko authentication, API keys aur quotas chahiye.')] },
      { type: 'reverse-proxy', points: [bi('You want one public face with HTTPS for a few servers.', 'Kuch servers ke liye HTTPS wala ek public chehra chahiye.'), bi('You need simple path forwarding or static file serving.', 'Simple path forwarding ya static file serving chahiye.')] },
    ],
    rule: bi(
      'Many copies of one thing → load balancer. Many different services and many callers → API gateway. Just hide and front a server → reverse proxy. Big systems often chain them: gateway → load balancer → servers.',
      'Ek cheez ki kai copies → load balancer. Kai alag services aur kai callers → API gateway. Bas server ko chhupana aur aage rehna → reverse proxy. Bade systems aksar inhe jodte hain: gateway → load balancer → servers.',
    ),
    quiz: [
      { scenario: bi('Your public API is used by 3,000 partner apps, each with its own API key and monthly quota.', 'Aapki public API 3,000 partner apps use karte hain, har ek ki apni API key aur monthly quota.'), answer: 'api-gateway', why: bi('Per-caller identity and quotas are exactly what a gateway adds.', 'Per-caller identity aur quotas bilkul wahi hai jo gateway jodta hai.') },
      { scenario: bi('Your checkout service runs as 12 identical instances that scale up at lunchtime.', 'Aapki checkout service 12 ek jaise instances mein chalti hai jo lunch time par badhte hain.'), answer: 'load-balancer', why: bi('Spreading traffic across identical, changing instances is the load balancer’s job.', 'Ek jaise, badalte instances mein traffic baantna load balancer ka kaam hai.') },
      { scenario: bi('A small company runs one app server and wants HTTPS, gzip and /static served from disk, with the app port hidden.', 'Ek chhoti company ek app server chalati hai aur HTTPS, gzip aur disk se /static chahti hai, app port chhupa ke.'), answer: 'reverse-proxy', why: bi('A simple front that terminates TLS and forwards is a reverse proxy.', 'TLS terminate karke forward karne wala simple aage ka hissa reverse proxy hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'dns-vs-load-balancer',
    types: ['dns', 'load-balancer'],
    confusion: bi(
      'Both “send users to a server”, and DNS can even return several addresses in turn, which looks like load balancing.',
      'Dono “users ko server par bhejte hain”, aur DNS baari-baari kai addresses bhi lauta sakta hai, jo load balancing jaisa dikhta hai.',
    ),
    common: bi('Both decide where traffic goes, and both can avoid unhealthy destinations.', 'Dono decide karte hain traffic kahan jaaye, aur dono unhealthy jagahon se bach sakte hain.'),
    story: {
      setting: bi('A pizza chain with branches in several cities.', 'Kai shehron mein branches wali pizza chain.'),
      roles: [
        { type: 'dns', icon: 'Phone', role: bi('The national helpline that tells you which branch to call — the nearest open one. You remember the answer for a while and do not call the helpline for every order.', 'National helpline jo batati hai kaunsi branch call karni hai — sabse paas wali khuli. Aap jawab kuch der yaad rakhte ho aur har order ke liye helpline call nahi karte.') },
        { type: 'load-balancer', icon: 'Users', role: bi('The manager inside that branch who hands each incoming order to whichever cook is free, for every single order.', 'Us branch ke andar ka manager jo har aane wala order jo cook khaali ho use deta hai, har ek order ke liye.') },
      ],
    },
    rows: [
      { feature: bi('Decides', 'Kya decide karta hai'), values: [bi('Which region / address', 'Kaunsa region / address'), bi('Which server inside a region', 'Region ke andar kaunsa server')] },
      { feature: bi('How often', 'Kitni baar'), values: [bi('Once, then cached for the TTL (seconds to hours)', 'Ek baar, phir TTL tak cache (seconds se ghante)'), bi('For every request or connection', 'Har request ya connection ke liye')] },
      { feature: bi('Reacts to a server failing', 'Server fail hone par react'), values: [bi('Slowly — clients keep cached answers', 'Dheere — clients cached jawab rakhte hain'), bi('Within seconds via health checks', 'Health checks se seconds mein')] },
      { feature: bi('Typical use', 'Aam use'), values: ['Global routing, region failover', bi('Spreading load, autoscaling', 'Load baantna, autoscaling')] },
    ],
    pickWhen: [
      { type: 'dns', points: [bi('Users are in several regions and should reach the nearest.', 'Users kai regions mein hain aur sabse paas wale tak pahunchne chahiye.'), bi('You need region-level failover.', 'Region-level failover chahiye.')] },
      { type: 'load-balancer', points: [bi('Several servers in one place share the work.', 'Ek jagah kai servers kaam baantte hain.'), bi('Failures must be routed around in seconds.', 'Failures se seconds mein bachna hai.')] },
    ],
    rule: bi('DNS picks the city, the load balancer picks the counter. Most global systems use both: DNS → regional load balancer → servers.', 'DNS shehar chunta hai, load balancer counter. Zyada tar global systems dono use karte hain: DNS → regional load balancer → servers.'),
    quiz: [
      { scenario: bi('Users in Europe should hit Frankfurt and users in India should hit Mumbai.', 'Europe ke users Frankfurt aur India ke users Mumbai pahunchne chahiye.'), answer: 'dns', why: bi('Choosing a region per user is DNS routing (latency or geo policy).', 'Har user ke liye region chunna DNS routing hai (latency ya geo policy).') },
      { scenario: bi('One of 8 servers in Mumbai crashes; traffic must avoid it within seconds.', 'Mumbai ke 8 mein se ek server crash hota hai; traffic ko seconds mein usse bachna hai.'), answer: 'load-balancer', why: bi('Health checks and per-request routing react in seconds; DNS caching is too slow.', 'Health checks aur per-request routing seconds mein react karte hain; DNS caching bahut dheema hai.') },
      { scenario: bi('The whole Mumbai region goes down and everyone must move to Frankfurt.', 'Poora Mumbai region down ho jaata hai aur sabko Frankfurt jaana hai.'), answer: 'dns', why: bi('Region-level failover is done by DNS returning the healthy region.', 'Region-level failover DNS healthy region lautakar karta hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'cdn-vs-cdn-cache',
    types: ['cdn', 'cdn-cache'],
    confusion: bi(
      'Both run on the same worldwide edge network and both keep copies near users. In real life one product often does both jobs, so the names blur.',
      'Dono same worldwide edge network par chalte hain aur dono users ke paas copies rakhte hain. Asli zindagi mein ek product aksar dono kaam karta hai, isliye naam dhundhla jaate hain.',
    ),
    common: bi('Both serve content from edge locations close to users and reduce load on your origin.', 'Dono users ke paas wali edge locations se content serve karte hain aur origin par load kam karte hain.'),
    story: {
      setting: bi('A newspaper company that prints papers and also answers readers’ questions.', 'Ek akhbaar company jo papers chhaapti hai aur readers ke sawaalon ka jawab bhi deti hai.'),
      roles: [
        { type: 'cdn', icon: 'Truck', role: bi('The distribution trucks that stock every news-stand with printed papers and magazines (static files) from the printing press (object storage).', 'Distribution trucks jo printing press (object storage) se har news-stand ko chhape papers aur magazines (static files) se bharte hain.') },
        { type: 'cdn-cache', icon: 'Newspaper', role: bi('The stand that keeps copies of today’s answers to common questions (API responses) so it does not phone the newsroom for each reader.', 'Woh stand jo common sawaalon ke aaj ke jawabon (API responses) ki copies rakhta hai taaki har reader ke liye newsroom phone na kare.') },
      ],
    },
    rows: [
      { feature: bi('What it delivers (in this playground)', 'Kya deliver karta hai (is playground mein)'), values: [bi('Static files and media from an origin like object storage', 'Object storage jaise origin se static files aur media'), bi('Cacheable responses from your API / app servers', 'Aapki API / app servers ke cacheable responses')] },
      { feature: bi('Origin behind it', 'Peeche ka origin'), values: ['Object storage (files)', 'Load balancer / application'] },
      { feature: bi('Freshness', 'Taazgi'), values: [bi('Files rarely change; versioned URLs', 'Files kam badalti hain; versioned URLs'), bi('Short TTLs (seconds to minutes) or purge on update', 'Chhote TTLs (seconds se minutes) ya update par purge')] },
      { feature: bi('Danger', 'Khatra'), values: [bi('Stale assets after a deploy', 'Deploy ke baad purane assets'), bi('Accidentally caching personal responses', 'Galti se personal responses cache karna')] },
    ],
    pickWhen: [
      { type: 'cdn', points: [bi('Images, videos, JavaScript and CSS go to users worldwide.', 'Images, videos, JavaScript aur CSS duniya bhar ke users tak jaate hain.'), bi('Files live in object storage.', 'Files object storage mein hain.')] },
      { type: 'cdn-cache', points: [bi('The same public API response is requested by many users.', 'Same public API response bahut users maangte hain.'), bi('A few seconds of staleness is fine.', 'Kuch seconds purana hona theek hai.')] },
    ],
    rule: bi('Files from storage → CDN. Repeated public API answers → CDN cache. Never cache personal responses at the edge.', 'Storage se files → CDN. Baar-baar ke public API jawab → CDN cache. Personal responses edge par kabhi cache mat karo.'),
    quiz: [
      { scenario: bi('Product photos stored in S3 must load fast worldwide.', 'S3 mein rakhi product photos duniya bhar mein tez load honi chahiye.'), answer: 'cdn', why: bi('Static files from object storage are the classic CDN job.', 'Object storage se static files classic CDN kaam hai.') },
      { scenario: bi('GET /api/scores/live is identical for everyone and may be 5 seconds old.', 'GET /api/scores/live sabke liye same hai aur 5 second purana ho sakta hai.'), answer: 'cdn-cache', why: bi('A shared, slightly stale API response is perfect for an edge cache.', 'Shared, thoda purana API response edge cache ke liye perfect hai.') },
      { scenario: bi('The app’s JavaScript bundle changes with every deploy and uses hashed file names.', 'App ka JavaScript bundle har deploy par badalta hai aur hashed file names use karta hai.'), answer: 'cdn', why: bi('Versioned static assets are delivered by the CDN; new names bypass old copies.', 'Versioned static assets CDN deliver karta hai; naye naam purani copies ko bypass karte hain.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'in-memory-vs-distributed-vs-cdn-cache',
    types: ['in-memory-cache', 'distributed-cache', 'cdn-cache'],
    confusion: bi(
      'They are all called “cache”, they all keep copies of answers to avoid repeating work, and they all use TTLs and eviction. The difference is where the copy lives — and that changes speed, sharing and what is safe to store.',
      'Sabko “cache” kehte hain, sab kaam dohraane se bachne ke liye jawabon ki copies rakhte hain, aur sab TTLs aur eviction use karte hain. Farak yeh hai ki copy kahan rehti hai — aur isse speed, sharing aur kya store karna safe hai, sab badalta hai.',
    ),
    common: bi('All three trade a bit of freshness for a lot of speed and lower load on the source of truth.', 'Teeno thodi taazgi ke badle bahut speed aur source of truth par kam load dete hain.'),
    story: {
      setting: bi('A company where people constantly need the same phone numbers and documents.', 'Ek company jahan logon ko lagatar wahi phone numbers aur documents chahiye.'),
      roles: [
        { type: 'in-memory-cache', icon: 'NotebookPen', role: bi('Sticky notes on your own desk: instant to read, but only you can see them, and they vanish when your desk is cleared.', 'Apni desk ke sticky notes: padhne mein turant, lekin sirf aap dekh sakte ho, aur desk saaf hone par gayab.') },
        { type: 'distributed-cache', icon: 'ClipboardList', role: bi('The shared whiteboard in the corridor: a few steps away, but everyone reads the same board and one update reaches all.', 'Corridor ka shared whiteboard: kuch kadam door, lekin sab same board padhte hain aur ek update sab tak pahunchta hai.') },
        { type: 'cdn-cache', icon: 'Store', role: bi('Copies of the public brochure kept at every branch office worldwide, so visitors never call head office for it.', 'Public brochure ki copies duniya bhar ki har branch mein, taaki visitors uske liye kabhi head office call na karein.') },
      ],
    },
    rows: [
      { feature: bi('Where it lives', 'Kahan rehta hai'), values: [bi('Inside one server’s memory', 'Ek server ki memory ke andar'), bi('Separate cache cluster in your data centre', 'Data centre mein alag cache cluster'), bi('Edge locations near users', 'Users ke paas edge locations')] },
      { feature: 'Speed', values: ['~microseconds', '~1 ms', bi('Fastest for distant users (no trip to origin)', 'Door ke users ke liye sabse tez (origin tak nahi jaana)')] },
      { feature: bi('Shared between servers?', 'Servers ke beech shared?'), values: [bi('No — each server has its own', 'Nahi — har server ka apna'), bi('Yes', 'Haan'), bi('Shared by all users of that edge', 'Us edge ke saare users ke beech shared')] },
      { feature: bi('Good for', 'Kiske liye achha'), values: [bi('Small, rarely changing reference data', 'Chhota, kam badalne wala reference data'), bi('Hot records, sessions, counters, leaderboards', 'Garam records, sessions, counters, leaderboards'), bi('Public responses identical for many users', 'Bahut users ke liye same public responses')] },
      { feature: bi('Never use it for', 'Iske liye kabhi nahi'), values: [bi('Values all servers must agree on', 'Woh values jin par saare servers sahmat hon'), bi('Your only copy of important data', 'Important data ki akeli copy'), bi('Personal or private responses', 'Personal ya private responses')] },
    ],
    pickWhen: [
      { type: 'in-memory-cache', points: [bi('Read on every request, tiny, changes rarely.', 'Har request par padha jaata, chhota, kam badalta.'), bi('A minute of staleness per server is fine.', 'Har server par ek minute purana hona theek.')] },
      { type: 'distributed-cache', points: [bi('Many servers must share the same cached values.', 'Kai servers ko same cached values share karni hain.'), bi('The database is overloaded by repeated reads.', 'Baar-baar ke reads se database overload hai.')] },
      { type: 'cdn-cache', points: [bi('Users worldwide request the same public data.', 'Duniya bhar ke users same public data maangte hain.'), bi('You want requests to stop before reaching your servers.', 'Aap chahte ho requests servers tak pahunchne se pehle ruk jaayein.')] },
    ],
    rule: bi('Private to one server → in-memory. Shared by your servers → distributed cache. Shared by the whole world and public → CDN cache. Big systems layer all three.', 'Ek server ka private → in-memory. Aapke servers mein shared → distributed cache. Poori duniya ke saath shared aur public → CDN cache. Bade systems teeno ki layers lagate hain.'),
    quiz: [
      { scenario: bi('User sessions must be readable by whichever of 20 app servers gets the next request.', 'User sessions ko 20 app servers mein se jo bhi agli request le use padhna hai.'), answer: 'distributed-cache', why: bi('Session data must be shared by all servers.', 'Session data saare servers mein shared hona chahiye.') },
      { scenario: bi('The list of 200 country codes is read on every request and changes once a year.', '200 country codes ki list har request par padhi jaati hai aur saal mein ek baar badalti hai.'), answer: 'in-memory-cache', why: bi('Tiny, stable data is cheapest in each server’s own memory.', 'Chhota, stable data har server ki apni memory mein sabse sasta hai.') },
      { scenario: bi('A public “top headlines” endpoint is hit by millions of readers in many countries.', 'Public “top headlines” endpoint ko kai deshon ke lakhon readers hit karte hain.'), answer: 'cdn-cache', why: bi('Identical public responses for a worldwide audience belong at the edge.', 'Duniya bhar ke liye same public responses edge par hone chahiye.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'message-queue-vs-event-stream-vs-task-queue',
    types: ['message-queue', 'event-stream', 'task-queue'],
    confusion: bi(
      'All three let a producer hand something over and move on, all three buffer bursts, and products blur the lines (Kafka can act like a queue; SQS can feed workers).',
      'Teeno producer ko kuch saunp kar aage badhne dete hain, teeno jhatkon ko buffer karte hain, aur products lines dhundhli kar dete hain (Kafka queue jaisa kaam kar sakta hai; SQS workers ko feed kar sakta hai).',
    ),
    common: bi('Each decouples a producer from a consumer in time, so the producer does not wait and nothing is lost if the consumer is slow.', 'Har ek producer ko consumer se time mein alag karta hai, taaki producer wait na kare aur consumer slow ho toh kuch na khoye.'),
    story: {
      setting: bi('A busy restaurant on a Saturday night.', 'Shanivaar raat ka busy restaurant.'),
      roles: [
        { type: 'message-queue', icon: 'Ticket', role: bi('The order-ticket rail between waiters and the kitchen: each ticket is taken by one cook and thrown away once the dish is out.', 'Waiters aur kitchen ke beech order-ticket rail: har ticket ek cook leta hai aur dish nikalne par phenk diya jaata hai.') },
        { type: 'event-stream', icon: 'Newspaper', role: bi('The restaurant’s logbook of everything that happened: orders, payments, complaints. The accountant, the manager and the marketing team each read it separately — and it is kept for months.', 'Restaurant ki logbook jo kuch hua sab: orders, payments, complaints. Accountant, manager aur marketing team har ek alag padhte hain — aur yeh mahino rakhi jaati hai.') },
        { type: 'task-queue', icon: 'ClipboardList', role: bi('The cleaning crew’s job board: “clean table 7”, “restock napkins”. Whoever is free takes the next card; a card that cannot be finished goes to the manager.', 'Safai crew ka job board: “table 7 saaf karo”, “napkins bharo”. Jo khaali ho agla card leta hai; jo card poora na ho sake woh manager ke paas jaata hai.') },
      ],
    },
    rows: [
      { feature: bi('After a message is processed', 'Message process hone ke baad'), values: [bi('Deleted', 'Delete'), bi('Kept for the retention period', 'Retention period tak rakha'), bi('Deleted (job done)', 'Delete (job done)')] },
      { feature: bi('Who receives each item', 'Har item kise milta hai'), values: [bi('One consumer', 'Ek consumer'), bi('Every consumer group gets every event', 'Har consumer group ko har event'), bi('One worker', 'Ek worker')] },
      { feature: bi('Replay history?', 'History replay?'), values: [bi('No', 'Nahi'), bi('Yes — rewind the offset', 'Haan — offset peeche karo'), bi('No', 'Nahi')] },
      { feature: 'Ordering', values: ['Optional (FIFO queues)', 'Per partition / key', bi('Usually not important', 'Aam taur par zaroori nahi')] },
      { feature: bi('Typical content', 'Aam content'), values: [bi('Commands between services (“send this email”)', 'Services ke beech commands (“yeh email bhejo”)'), bi('Facts (“order placed”) for many readers', 'Facts (“order placed”) kai readers ke liye'), bi('Jobs for a worker pool (“resize image 42”)', 'Worker pool ke liye jobs (“image 42 resize karo”)')] },
    ],
    pickWhen: [
      { type: 'message-queue', points: [bi('One service asks another to do something, later.', 'Ek service doosri ko baad mein kuch karne ko kehti hai.'), bi('Each message must be handled once.', 'Har message ek baar handle hona chahiye.')] },
      { type: 'event-stream', points: [bi('Several teams react to the same events independently.', 'Kai teams same events par independently react karti hain.'), bi('You need ordering per key and the ability to replay.', 'Per key ordering aur replay ki kshamata chahiye.')] },
      { type: 'task-queue', points: [bi('Background workers process discrete jobs.', 'Background workers alag-alag jobs process karte hain.'), bi('Jobs need retries and a dead-letter queue.', 'Jobs ko retries aur dead-letter queue chahiye.')] },
    ],
    rule: bi('“Please do this” for one worker → queue (task queue for worker jobs). “This happened” for anyone who cares, with history → event stream.', '“Kripya yeh karo” ek worker ke liye → queue (worker jobs ke liye task queue). “Yeh hua” har interested ke liye, history ke saath → event stream.'),
    quiz: [
      { scenario: bi('Analytics, search and recommendations all need every “product updated” event, and a new team wants last month’s events.', 'Analytics, search aur recommendations sabko har “product updated” event chahiye, aur nayi team ko pichhle mahine ke events chahiye.'), answer: 'event-stream', why: bi('Many independent readers plus replay is what a stream offers.', 'Kai independent readers aur replay — yahi stream deta hai.') },
      { scenario: bi('Each uploaded video needs one “generate thumbnails” job done by a pool of workers.', 'Har upload hue video ko workers ke pool dwara ek “thumbnails banao” job chahiye.'), answer: 'task-queue', why: bi('Discrete jobs for workers, each done once with retries.', 'Workers ke liye alag-alag jobs, har ek ek baar retries ke saath.') },
      { scenario: bi('The order service asks the invoice service to create one invoice per order, without waiting.', 'Order service invoice service ko har order ka ek invoice banane ko kehti hai, bina wait kiye.'), answer: 'message-queue', why: bi('A one-to-one command between services, consumed once, is a message queue.', 'Services ke beech ek-se-ek command, ek baar consumed — message queue.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'scheduler-vs-task-queue-vs-dead-letter-queue',
    types: ['scheduler', 'task-queue', 'dead-letter-queue'],
    confusion: bi(
      'All three appear around background jobs, all three “hold” work in some sense, and they are usually drawn next to each other.',
      'Teeno background jobs ke aas-paas dikhte hain, teeno kisi tarah kaam “rakhte” hain, aur aam taur par ek doosre ke bagal mein bane hote hain.',
    ),
    common: bi('Together they make background work reliable: start it at the right time, run it once, and never lose failures.', 'Saath milkar yeh background kaam bharosemand banate hain: sahi waqt par shuru karo, ek baar chalao, aur failures kabhi mat khoo.'),
    story: {
      setting: bi('A car service centre.', 'Ek car service centre.'),
      roles: [
        { type: 'scheduler', icon: 'CalendarDays', role: bi('The appointment calendar: “Mr. Rao’s car service at 10 am every six months”. It decides WHEN work should start.', 'Appointment calendar: “Mr. Rao ki car service har chhe mahine subah 10 baje”. Yeh decide karta hai KAB kaam shuru ho.') },
        { type: 'task-queue', icon: 'ClipboardList', role: bi('The job board in the workshop holding WHAT is ready to be done right now; free mechanics take the next card.', 'Workshop ka job board jo rakhta hai KAUNSA kaam abhi ready hai; khaali mechanics agla card lete hain.') },
        { type: 'dead-letter-queue', icon: 'Inbox', role: bi('The supervisor’s tray for jobs that failed three times (“part not available”) — kept safely for a human to sort out.', 'Supervisor ki tray un jobs ke liye jo teen baar fail hue (“part available nahi”) — insaan ke sambhalne ke liye surakshit rakhe.') },
      ],
    },
    rows: [
      { feature: bi('Answers the question', 'Kis sawaal ka jawab'), values: [bi('When should work start?', 'Kaam kab shuru ho?'), bi('What work is waiting now?', 'Abhi kaunsa kaam wait kar raha hai?'), bi('What kept failing?', 'Kya baar-baar fail hua?')] },
      { feature: 'Input', values: [bi('Schedules and delayed tasks', 'Schedules aur delayed tasks'), bi('Jobs from services or the scheduler', 'Services ya scheduler se jobs'), bi('Jobs that exhausted their retries', 'Woh jobs jinke retries khatam ho gaye')] },
      { feature: bi('Who reads from it', 'Isse kaun padhta hai'), values: [bi('Nobody — it pushes jobs out', 'Koi nahi — yeh jobs bahar bhejta hai'), 'Background workers', bi('Humans and replay tools', 'Insaan aur replay tools')] },
      { feature: bi('If it is missing', 'Agar yeh na ho'), values: [bi('Timed jobs never start (or start twice)', 'Timed jobs kabhi shuru nahi (ya do baar)'), bi('Work runs inline or gets lost', 'Kaam inline chalta ya kho jaata'), bi('Poison jobs block or vanish silently', 'Poison jobs rokte ya chupchaap gayab')] },
    ],
    pickWhen: [
      { type: 'scheduler', points: [bi('Work happens at a time, not on a user action.', 'Kaam ek waqt par hota hai, user action par nahi.'), bi('Delays like “cancel in 15 minutes”.', '“15 minute mein cancel” jaise delays.')] },
      { type: 'task-queue', points: [bi('Jobs must be spread over workers and retried.', 'Jobs workers mein baante aur retry hone chahiye.')] },
      { type: 'dead-letter-queue', points: [bi('Some jobs will fail permanently and must not be lost.', 'Kuch jobs hamesha fail honge aur khone nahi chahiye.')] },
    ],
    rule: bi('Scheduler = WHEN, task queue = WHAT is ready, dead-letter queue = WHAT went wrong. A healthy job system usually has all three.', 'Scheduler = KAB, task queue = KAUNSA ready hai, dead-letter queue = KYA galat hua. Healthy job system mein aam taur par teeno hote hain.'),
    quiz: [
      { scenario: bi('Generate the monthly statement on the 1st of every month at 6 am.', 'Har mahine ki 1 tareekh subah 6 baje monthly statement banao.'), answer: 'scheduler', why: bi('A calendar-based trigger is the scheduler’s job.', 'Calendar-based trigger scheduler ka kaam hai.') },
      { scenario: bi('An import job crashed five times on a malformed file; the team must inspect it tomorrow.', 'Ek import job kharab file par paanch baar crash hua; team ko kal use dekhna hai.'), answer: 'dead-letter-queue', why: bi('Jobs that exhausted retries are parked in the DLQ for humans.', 'Retries khatam hone wale jobs insaanon ke liye DLQ mein rakhe jaate hain.') },
      { scenario: bi('5,000 “send receipt” jobs arrived in a minute and 10 workers should share them.', 'Ek minute mein 5,000 “receipt bhejo” jobs aaye aur 10 workers ko unhe baantna hai.'), answer: 'task-queue', why: bi('A backlog shared by workers is a task queue.', 'Workers mein bata backlog task queue hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'worker-vs-consumer-vs-stream-vs-batch',
    types: ['background-worker', 'event-consumer', 'stream-processor', 'batch-processor'],
    confusion: bi(
      'All four are “code that runs in the background, not in the user’s request”. They all read from somewhere and write results somewhere else, so they are easy to mix up.',
      'Charon “background mein chalne wala code hai, user ki request mein nahi”. Sab kahin se padhte aur kahin aur results likhte hain, isliye aasani se mix ho jaate hain.',
    ),
    common: bi('Each moves work off the request path so users stay fast, and each must handle failures and retries safely.', 'Har ek kaam ko request path se hatata hai taaki users ke liye sab tez rahe, aur har ek ko failures aur retries safely sambhalne hote hain.'),
    story: {
      setting: bi('A city post office that handles all kinds of paperwork.', 'Ek shehar ka post office jo har tarah ka paperwork sambhalta hai.'),
      roles: [
        { type: 'background-worker', icon: 'Wrench', role: bi('A clerk who takes job cards from a tray — “frank this parcel” — and does each one.', 'Clerk jo tray se job cards leta hai — “is parcel par stamp lagao” — aur har ek karta hai.') },
        { type: 'event-consumer', icon: 'Radio', role: bi('A clerk who listens to announcements — “a parcel arrived for Asha” — and reacts to each by sending her a note.', 'Clerk jo announcements sunta hai — “Asha ke liye parcel aaya” — aur har ek par use note bhejkar react karta hai.') },
        { type: 'stream-processor', icon: 'Calculator', role: bi('The counter at the door showing “parcels in the last hour” live, always up to date.', 'Darwaze ka counter jo live “pichhle ghante ke parcels” dikhata hai, hamesha up to date.') },
        { type: 'batch-processor', icon: 'Factory', role: bi('The night team that processes the whole day’s paperwork at once and prints the daily report.', 'Raat ki team jo poore din ka paperwork ek saath process karke daily report chhaapti hai.') },
      ],
    },
    rows: [
      { feature: bi('Triggered by', 'Kis se trigger'), values: [bi('A job in a task queue', 'Task queue ka job'), bi('An event or message', 'Event ya message'), bi('A continuous stream of events', 'Events ki lagatar stream'), bi('A schedule (hourly, nightly)', 'Schedule (hourly, nightly)')] },
      { feature: bi('Handles', 'Kya sambhalta hai'), values: [bi('One job at a time', 'Ek waqt mein ek job'), bi('One event at a time', 'Ek waqt mein ek event'), bi('Many events with memory (windows)', 'Memory ke saath kai events (windows)'), bi('A huge stored dataset', 'Bahut bada stored dataset')] },
      { feature: bi('Result freshness', 'Result kitna fresh'), values: [bi('Seconds to minutes', 'Seconds se minutes'), 'Seconds', bi('Seconds, continuously', 'Seconds, lagatar'), bi('Hours', 'Ghante')] },
      { feature: bi('Typical example', 'Aam example'), values: [bi('Resize an uploaded image', 'Upload hui image resize'), bi('Update the search index on “product changed”', '“Product changed” par search index update'), bi('Clicks per minute, fraud velocity', 'Har minute clicks, fraud velocity'), bi('Nightly recommendations rebuild', 'Raat ka recommendations rebuild')] },
    ],
    pickWhen: [
      { type: 'background-worker', points: [bi('Someone asked for a slow task to be done.', 'Kisi ne slow kaam karne ko kaha.')] },
      { type: 'event-consumer', points: [bi('Something happened and you must react to it.', 'Kuch hua aur us par react karna hai.')] },
      { type: 'stream-processor', points: [bi('You need live aggregates over time windows.', 'Time windows par live aggregates chahiye.')] },
      { type: 'batch-processor', points: [bi('You must crunch huge history and can wait hours.', 'Bahut badi history process karni hai aur ghante ruk sakte ho.')] },
    ],
    rule: bi('A job to do → worker. An event to react to → consumer. A live number over time → stream processor. A mountain of stored data overnight → batch processor.', 'Karne ko job → worker. React karne ko event → consumer. Time par live number → stream processor. Raat bhar stored data ka pahaad → batch processor.'),
    quiz: [
      { scenario: bi('Show “orders in the last 5 minutes” on a live operations screen.', 'Live operations screen par “pichhle 5 minute ke orders” dikhao.'), answer: 'stream-processor', why: bi('A continuously updated windowed count is stream processing.', 'Lagatar update hoti windowed ginti stream processing hai.') },
      { scenario: bi('Recompute “customers also bought” for 5 million products every night.', 'Har raat 50 lakh products ke liye “customers ne yeh bhi khareeda” dobara nikaalo.'), answer: 'batch-processor', why: bi('Huge stored data, results needed by morning: batch.', 'Bahut bada stored data, subah tak results chahiye: batch.') },
      { scenario: bi('When a “user signed up” event arrives, send a welcome email.', '“User signed up” event aaye toh welcome email bhejo.'), answer: 'event-consumer', why: bi('Reacting to each event independently is a consumer’s job.', 'Har event par independently react karna consumer ka kaam hai.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'sql-vs-nosql',
    types: ['sql-db', 'nosql-db'],
    confusion: bi(
      'Both store your application’s data durably, both can replicate, and modern versions borrow each other’s features (SQL databases store JSON; some NoSQL stores support transactions).',
      'Dono aapke application ka data majbooti se rakhte hain, dono replicate kar sakte hain, aur modern versions ek doosre ke features udhaar lete hain (SQL databases JSON rakhte hain; kuch NoSQL stores transactions support karte hain).',
    ),
    common: bi('Both are a source of truth: the place where data is permanently and safely recorded.', 'Dono source of truth hain: woh jagah jahan data hamesha aur surakshit roop se darj hota hai.'),
    story: {
      setting: bi('Two very different ways to run a library.', 'Library chalane ke do bahut alag tareeke.'),
      roles: [
        { type: 'sql-db', icon: 'NotebookPen', role: bi('A strict librarian with a catalogue where every book has the same fields, every loan is recorded with a matching return, and nothing inconsistent is ever allowed.', 'Sakht librarian jiske catalogue mein har book ke same fields hain, har loan ka matching return darj hai, aur kuch bhi inconsistent kabhi allowed nahi.') },
        { type: 'nosql-db', icon: 'Library', role: bi('A giant library spread over many buildings by the author’s first letter: any book is found instantly if you know the author, and adding a building is easy — but cross-building questions are hard.', 'Author ke pehle akshar se kai buildings mein faili badi library: author pata ho toh koi bhi book turant milti hai, aur building jodna aasan hai — lekin buildings ke aar-paar ke sawaal mushkil.') },
      ],
    },
    rows: [
      { feature: bi('Data shape', 'Data ki shape'), values: [bi('Tables with a fixed schema', 'Fixed schema wali tables'), bi('Documents, key-values or wide rows; flexible', 'Documents, key-values ya wide rows; flexible')] },
      { feature: bi('Transactions across many rows', 'Kai rows par transactions'), values: [bi('Yes, strong', 'Haan, majboot'), bi('Limited (often per key)', 'Seemit (aksar per key)')] },
      { feature: 'Queries', values: ['Flexible: joins, filters, aggregates', bi('Fast by key; plan queries in advance', 'Key se tez; queries pehle se plan karo')] },
      { feature: bi('Scaling writes', 'Writes scale karna'), values: [bi('Vertical first; sharding is extra work', 'Pehle vertical; sharding extra kaam'), 'Horizontal, built in'] },
      { feature: bi('Best for', 'Kiske liye best'), values: [bi('Money, orders, bookings, relationships', 'Paisa, orders, bookings, relationships'), bi('Massive volumes accessed by key: messages, events, profiles', 'Key se access hone wala bahut volume: messages, events, profiles')] },
    ],
    pickWhen: [
      { type: 'sql-db', points: [bi('Several records must change together correctly.', 'Kai records ek saath sahi badalne chahiye.'), bi('Questions change and need joins.', 'Sawaal badalte hain aur joins chahiye.')] },
      { type: 'nosql-db', points: [bi('Huge write volume, accessed by a key.', 'Bahut write volume, key se access.'), bi('You know your access patterns well.', 'Aap apne access patterns achhe se jaante ho.')] },
    ],
    rule: bi('Need correctness across records and flexible questions → SQL. Need massive scale for simple key-based access → NoSQL. Many systems use both, each for what it is best at.', 'Records ke aar-paar sahi-pan aur flexible sawaal chahiye → SQL. Simple key-based access ke liye bahut scale → NoSQL. Kai systems dono use karte hain, har ek apne best kaam ke liye.'),
    quiz: [
      { scenario: bi('Transfer money between two wallets so it is never lost or duplicated.', 'Do wallets ke beech paise aise bhejo ki kabhi na khoye na dohraye.'), answer: 'sql-db', why: bi('A multi-row transaction is SQL’s strength.', 'Multi-row transaction SQL ki taakat hai.') },
      { scenario: bi('Store billions of chat messages, always read as “latest messages of chat X”.', 'Arabon chat messages rakho, hamesha “chat X ke latest messages” ki tarah padhe jaate.'), answer: 'nosql-db', why: bi('Huge volume with one access pattern by key suits NoSQL.', 'Ek key access pattern ke saath bahut volume NoSQL ko suit karta hai.') },
      { scenario: bi('An admin panel needs ad-hoc filters like “orders over ₹2,000 from new customers in Pune last week”.', 'Admin panel ko ad-hoc filters chahiye jaise “pichhle hafte Pune ke naye customers ke ₹2,000 se upar ke orders”.'), answer: 'sql-db', why: bi('Flexible ad-hoc queries with joins are much easier in SQL.', 'Joins ke saath flexible ad-hoc queries SQL mein bahut aasan hain.') },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'read-replica-vs-sharded-db',
    types: ['read-replica', 'sharded-db'],
    confusion: bi(
      'Both involve “more database machines”, both are described as scaling the database, and big systems often use them together.',
      'Dono mein “zyada database machines” hain, dono ko database scale karna kaha jaata hai, aur bade systems aksar dono saath use karte hain.',
    ),
    common: bi('Both spread database work over several machines so one machine is no longer the limit.', 'Dono database ka kaam kai machines par baantte hain taaki ek machine hadd na rahe.'),
    story: {
      setting: bi('A school that has outgrown its single office.', 'Ek school jo apne akele office se bada ho gaya hai.'),
      roles: [
        { type: 'read-replica', icon: 'Printer', role: bi('Photocopies of the full notice board placed in every corridor. Many more students can read at once, but only the principal writes on the original.', 'Poore notice board ki photocopies har corridor mein. Bahut zyada students ek saath padh sakte hain, lekin original par sirf principal likhte hain.') },
        { type: 'sharded-db', icon: 'FolderOpen', role: bi('Splitting student files by roll number across three offices. Each office handles its own students, so three times as many updates can happen.', 'Student files ko roll number se teen offices mein baantna. Har office apne students sambhalta hai, isliye teen guna updates ho sakte hain.') },
      ],
    },
    rows: [
      { feature: bi('What each machine holds', 'Har machine kya rakhti hai'), values: [bi('A full copy of all data', 'Saare data ki poori copy'), bi('Only its share of the data', 'Sirf data ka apna hissa')] },
      { feature: bi('Scales', 'Kya scale karta hai'), values: ['Reads', bi('Writes and storage (and reads)', 'Writes aur storage (aur reads)')] },
      { feature: bi('Writes go to', 'Writes kahan jaate hain'), values: [bi('One primary only', 'Sirf ek primary'), bi('The shard that owns the key', 'Woh shard jiske paas key hai')] },
      { feature: bi('Main catch', 'Main dikkat'), values: [bi('Replication lag (slightly stale reads)', 'Replication lag (thode purane reads)'), bi('Cross-shard queries and choosing a good key', 'Cross-shard queries aur achhi key chunna')] },
      { feature: 'Complexity', values: [bi('Low', 'Kam'), bi('High', 'Zyada')] },
    ],
    pickWhen: [
      { type: 'read-replica', points: [bi('Reads overwhelm the database but writes fit on one machine.', 'Reads database par bhaari hain lekin writes ek machine par aa jaate hain.'), bi('Slightly stale reads are acceptable.', 'Thode purane reads chal jaate hain.')] },
      { type: 'sharded-db', points: [bi('Writes or total data exceed one machine.', 'Writes ya kul data ek machine se zyada hai.'), bi('Most queries include a natural key (user, account).', 'Zyada tar queries mein natural key hai (user, account).')] },
    ],
    rule: bi('Too many reads → add replicas. Too many writes or too much data → shard. Try replicas first; shard only when you must.', 'Bahut reads → replicas jodo. Bahut writes ya bahut data → shard karo. Pehle replicas try karo; shard tabhi karo jab majboori ho.'),
    quiz: [
      { scenario: bi('A blog gets 50,000 page views per second but only 20 new posts a day.', 'Ek blog ko har second 50,000 page views milte hain lekin din mein sirf 20 naye posts.'), answer: 'read-replica', why: bi('Read-heavy with tiny writes — replicas are enough.', 'Bahut reads aur bahut kam writes — replicas kaafi hain.') },
      { scenario: bi('A payments ledger takes 80,000 writes per second and holds 30 TB.', 'Payments ledger har second 80,000 writes leta hai aur 30 TB rakhta hai.'), answer: 'sharded-db', why: bi('Writes and storage beyond one machine require sharding.', 'Ek machine se zyada writes aur storage ke liye sharding chahiye.') },
      { scenario: bi('Reporting queries slow down the primary, but the data size is fine.', 'Reporting queries primary ko slow karti hain, lekin data size theek hai.'), answer: 'read-replica', why: bi('Move the read-only reporting load to a replica.', 'Read-only reporting load ko replica par le jaao.') },
    ],
  },
];
