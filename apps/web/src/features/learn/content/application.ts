import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const applicationGuides: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'app-server',
    tagline: bi('Where your business rules actually run.', 'Jahan aapke business rules sach mein chalte hain.'),
    intro: bi(
      'An application server runs your code: it receives a request (“place this order”), applies your rules (is the item in stock? is the coupon valid?), reads and writes the database, and sends back a response.\n\nIn most designs you run several identical copies of it behind a load balancer. To make that possible, the server should be stateless — it keeps nothing important in its own memory between requests, so any copy can answer any request.',
      'Application server aapka code chalata hai: yeh request leta hai (“yeh order place karo”), aapke rules lagata hai (item stock mein hai? coupon valid hai?), database padhta-likhta hai, aur response wapas bhejta hai.\n\nZyada tar designs mein aap iski kai ek jaisi copies load balancer ke peeche chalate ho. Iske liye server stateless hona chahiye — do requests ke beech apni memory mein kuch important nahi rakhta, taaki koi bhi copy koi bhi request ka jawab de sake.',
    ),
    problem: bi(
      'Without a server-side layer, clients would have to talk to the database directly. Every phone would hold database passwords, business rules would be copied into every app version, and anyone could change prices by editing the app.',
      'Server-side layer ke bina clients ko seedha database se baat karni padti. Har phone mein database password hota, business rules har app version mein copy hote, aur koi bhi app edit karke prices badal sakta tha.',
    ),
    before: scene(
      [[c('web-client'), c('mobile-client')], [c('sql-db', { note: 'password inside apps', state: 'bad' })]],
      ['web-client!>sql-db', 'mobile-client!>sql-db'],
      bi('Clients talking straight to the database: no rules, no protection, secrets everywhere.', 'Clients seedha database se baat karte hain: na rules, na suraksha, har jagah secrets.'),
    ),
    solution: bi(
      'The application server becomes the only thing allowed to touch the database. Clients ask it to do things; it decides whether the request is valid and performs it safely. Because it is stateless, you can add copies when traffic grows.',
      'Application server hi akela database ko chhoo sakta hai. Clients isse kaam karne ko kehte hain; yeh decide karta hai ki request valid hai ya nahi aur use safely karta hai. Stateless hone ki wajah se traffic badhne par copies jodi ja sakti hain.',
    ),
    after: scene(
      [[c('web-client')], [c('load-balancer')], [c('app-server', { id: 's1', state: 'focus' }), c('app-server', { id: 's2', state: 'focus' })], [c('sql-db')]],
      ['web-client>load-balancer', 'load-balancer>s1', 'load-balancer>s2', 's1>sql-db', 's2>sql-db'],
      bi('Identical, stateless app servers apply the rules and are the only path to the data.', 'Ek jaise, stateless app servers rules lagate hain aur data tak pahunchne ka akela raasta hain.'),
    ),
    steps: [
      bi('A request arrives from the load balancer or gateway.', 'Load balancer ya gateway se request aati hai.'),
      bi('The server checks who the user is and whether they may do this.', 'Server check karta hai ki user kaun hai aur kya woh yeh kar sakta hai.'),
      bi('It runs the business logic and reads or writes the database (and cache).', 'Yeh business logic chalata hai aur database (aur cache) padhta-likhta hai.'),
      bi('Slow side-tasks (emails, reports) are pushed to a queue instead of done inline.', 'Slow side-tasks (emails, reports) inline karne ke bajaye queue mein daale jaate hain.'),
      bi('It returns the response and forgets the request — nothing is kept in memory.', 'Yeh response lautaata hai aur request bhool jaata hai — memory mein kuch nahi rakhta.'),
    ],
    analogy: {
      icons: ['User', 'ChefHat', 'Refrigerator'],
      title: bi('The chefs in a restaurant kitchen', 'Restaurant kitchen ke chefs'),
      text: bi(
        'Customers never walk into the store room and cook for themselves. They order, and the chefs follow the recipes (business rules) using ingredients from the store room (database).\n\nA big restaurant has several chefs cooking the same menu. Any chef can cook any order because the recipe is written down — nobody keeps a secret recipe in their head. That is what “stateless” means.',
        'Customers kabhi store room mein jaake khud khana nahi banate. Woh order karte hain, aur chefs store room (database) ke ingredients se recipes (business rules) follow karte hain.\n\nBade restaurant mein kai chefs wahi menu banate hain. Koi bhi chef koi bhi order bana sakta hai kyunki recipe likhi hui hai — kisi ke dimaag mein secret recipe nahi hai. “Stateless” ka yahi matlab hai.',
      ),
    },
    perfectFit: {
      title: bi('The core API of a startup product', 'Ek startup product ki core API'),
      text: bi(
        'A team of five is building an appointment-booking app. One application server (run as several copies) holds all endpoints: sign-up, list slots, book, cancel. It is simple to build, test and deploy, and it scales by adding copies behind the load balancer.',
        'Paanch logon ki team appointment-booking app bana rahi hai. Ek application server (kai copies mein) saare endpoints rakhta hai: sign-up, slots list, book, cancel. Ise banana, test aur deploy karna simple hai, aur load balancer ke peeche copies jodkar scale hota hai.',
      ),
      why: [
        bi('One codebase is easy for a small team.', 'Chhoti team ke liye ek codebase aasan hai.'),
        bi('Stateless copies scale horizontally.', 'Stateless copies horizontally scale hoti hain.'),
        bi('All rules live in one trusted place.', 'Saare rules ek bharosemand jagah rehte hain.'),
      ],
    },
    avoidWhen: [
      bi('It stores sessions or uploads on its local disk — the next request may hit another copy.', 'Yeh sessions ya uploads apni local disk par rakhe — agli request doosri copy par ja sakti hai.'),
      bi('It does slow work (video processing, sending 10,000 emails) inside the request — use a queue and workers.', 'Yeh request ke andar slow kaam kare (video processing, 10,000 emails) — queue aur workers use karo.'),
      bi('Dozens of teams step on each other in one giant codebase — consider splitting into microservices.', 'Ek bade codebase mein darjanon teams ek doosre ke raaste mein aayein — microservices mein todne ka socho.'),
    ],
    decisions: [
      bi('Instances: single, multiple or autoscaled.', 'Instances: single, multiple ya autoscaled.'),
      bi('Stateless or not (stateless is what lets it scale).', 'Stateless ya nahi (stateless hi scale karne deta hai).'),
      bi('Timeouts, retries and circuit breakers for calls it makes.', 'Iske dwara ki gayi calls ke liye timeouts, retries aur circuit breakers.'),
    ],
    confusedWith: [
      { type: 'microservice', difference: bi('An app server usually holds many features in one deployable unit; a microservice owns one capability and is deployed on its own.', 'App server aam taur par kai features ek deployable unit mein rakhta hai; microservice ek capability ki maalik hoti hai aur alag deploy hoti hai.'), compare: 'app-server-vs-microservice-vs-bff' },
      { type: 'background-worker', difference: bi('The app server answers users right now; a worker does slow jobs later, from a queue, with nobody waiting.', 'App server users ko abhi jawab deta hai; worker slow kaam baad mein queue se karta hai, jab koi wait nahi kar raha.') },
    ],
    examples: ['Node.js (Express)', 'Spring Boot', 'Django', 'Ruby on Rails'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'microservice',
    tagline: bi('A small service that owns one job — and its own data — end to end.', 'Ek chhoti service jo ek kaam — aur apna data — shuru se ant tak sambhalti hai.'),
    intro: bi(
      'A microservice is a small application that owns one business capability, such as payments, inventory or notifications. It has its own code, its own database and its own deployments, and other services talk to it through an API or events.\n\nThe point is independence: the payments team can ship ten times a day without waiting for the catalogue team, and a bug in recommendations cannot crash checkout.',
      'Microservice ek chhota application hai jo ek business capability ki maalik hoti hai, jaise payments, inventory ya notifications. Iska apna code, apna database aur apne deployments hote hain, aur doosri services isse API ya events ke through baat karti hain.\n\nMaqsad independence hai: payments team din mein das baar ship kar sakti hai bina catalogue team ka wait kiye, aur recommendations ka bug checkout ko crash nahi kar sakta.',
    ),
    problem: bi(
      'In one huge application (a monolith) owned by 200 engineers, every change waits for a shared release, one memory leak brings down everything, and you cannot scale the busy part (search) without scaling the quiet part (admin pages) too.',
      '200 engineers ke ek bade application (monolith) mein har change shared release ka wait karta hai, ek memory leak sab kuch gira deta hai, aur busy hissa (search) scale karne ke liye shant hissa (admin pages) bhi scale karna padta hai.',
    ),
    before: scene(
      [[c('load-balancer')], [c('app-server', { label: 'Giant monolith', note: 'one bug → all down', state: 'bad' })], [c('sql-db', { label: 'One shared DB' })]],
      ['load-balancer>app-server', 'app-server>sql-db'],
      bi('Everything in one deployable: one release train, one failure domain, one database.', 'Sab kuch ek deployable mein: ek release train, ek failure domain, ek database.'),
    ),
    solution: bi(
      'Split by business capability. Each microservice owns its data and scales on its own. They cooperate through small APIs and events, so teams move independently and failures stay contained.',
      'Business capability ke hisaab se todo. Har microservice apne data ki maalik hai aur khud scale hoti hai. Woh chhoti APIs aur events se milkar kaam karti hain, isliye teams independently chalti hain aur failures seemit rehte hain.',
    ),
    after: scene(
      [[c('api-gateway')], [c('microservice', { id: 'orders', label: 'Orders', state: 'focus' }), c('microservice', { id: 'pay', label: 'Payments', state: 'focus' })], [c('sql-db', { id: 'odb', label: 'Orders DB' }), c('sql-db', { id: 'pdb', label: 'Payments DB' })]],
      ['api-gateway>orders', 'api-gateway>pay', 'orders>odb', 'pay>pdb', ['orders~>pay', 'event']],
      bi('Each service owns its data and deploys alone; they talk through APIs and events.', 'Har service apne data ki maalik hai aur akeli deploy hoti hai; woh APIs aur events se baat karti hain.'),
    ),
    steps: [
      bi('Draw boundaries around business capabilities, not technical layers.', 'Boundaries business capabilities ke around banao, technical layers ke nahi.'),
      bi('Give each service its own database — no other service reads it directly.', 'Har service ko apna database do — koi doosri service use seedha nahi padhti.'),
      bi('Expose an API for questions and publish events for things that happened.', 'Sawaalon ke liye API do aur jo hua uske liye events publish karo.'),
      bi('Deploy, scale and monitor each service separately.', 'Har service ko alag deploy, scale aur monitor karo.'),
      bi('Protect calls between services with timeouts, retries and circuit breakers.', 'Services ke beech ki calls ko timeouts, retries aur circuit breakers se bachao.'),
    ],
    analogy: {
      icons: ['Store', 'Pizza', 'Coffee'],
      title: bi('A food court instead of one giant kitchen', 'Ek bade kitchen ke bajaye food court'),
      text: bi(
        'In a food court, the pizza counter, the coffee counter and the biryani counter each have their own staff, ingredients and opening hours. If the coffee machine breaks, you can still get pizza. If biryani is popular, that counter hires more people.\n\nOne giant kitchen cooking everything would stop entirely when the gas line fails.',
        'Food court mein pizza counter, coffee counter aur biryani counter ka apna staff, ingredients aur timing hota hai. Coffee machine kharab ho jaaye toh bhi pizza mil jaata hai. Biryani popular ho toh woh counter zyada log rakh leta hai.\n\nSab kuch banane wala ek bada kitchen gas line fail hote hi poora ruk jaata.',
      ),
    },
    perfectFit: {
      title: bi('A large e-commerce company with many teams', 'Kai teams wali badi e-commerce company'),
      text: bi(
        'Search, cart, payments and delivery tracking each have their own team, traffic pattern and release pace. Search must scale 20× during a sale; payments must change very carefully. Separate microservices let each part move at its own speed.',
        'Search, cart, payments aur delivery tracking ki apni team, traffic pattern aur release speed hai. Sale mein search ko 20 guna scale hona hai; payments ko bahut dhyaan se badalna hai. Alag microservices har hisse ko apni speed se chalne deti hain.',
      ),
      why: [
        bi('Teams deploy independently.', 'Teams independently deploy karti hain.'),
        bi('Busy parts scale without scaling everything.', 'Busy hisse sab kuch scale kiye bina scale hote hain.'),
        bi('A failure in one area stays in that area.', 'Ek area ki failure usi area mein rehti hai.'),
      ],
    },
    avoidWhen: [
      bi('A team of three building a first version — the network calls, deployments and monitoring cost more than they save.', 'Teen logon ki team pehla version bana rahi hai — network calls, deployments aur monitoring jitna bachate hain usse zyada kharch karte hain.'),
      bi('Two services share one database table — that is a monolith with extra network hops.', 'Do services ek hi database table share karein — yeh extra network hops wala monolith hai.'),
      bi('Every user request needs ten services to answer in a chain — latency and failures multiply.', 'Har user request ke liye das services chain mein jawab dein — latency aur failures multiply ho jaate hain.'),
    ],
    decisions: [
      bi('Its boundary: which business capability it owns.', 'Iski boundary: kaunsi business capability iski hai.'),
      bi('Instances and deployment (single region or multi-region).', 'Instances aur deployment (single region ya multi-region).'),
      bi('How it protects itself: timeouts, retries, circuit breakers, idempotency.', 'Yeh khud ko kaise bachati hai: timeouts, retries, circuit breakers, idempotency.'),
    ],
    confusedWith: [
      { type: 'app-server', difference: bi('Same kind of code, different scope: an app server often holds the whole product; a microservice holds one capability with its own data.', 'Code ki kism same, scope alag: app server aksar poora product rakhta hai; microservice apne data ke saath ek capability rakhti hai.'), compare: 'app-server-vs-microservice-vs-bff' },
      { type: 'bff', difference: bi('A microservice owns business data; a BFF owns nothing — it combines microservice data for one client’s screens.', 'Microservice business data ki maalik hai; BFF kisi cheez ka maalik nahi — yeh ek client ki screens ke liye microservices ka data jodta hai.'), compare: 'app-server-vs-microservice-vs-bff' },
    ],
    examples: ['Kubernetes deployments', 'Spring Boot services', 'Go services', 'AWS ECS services'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'auth-service',
    tagline: bi('Proves who you are once, then hands you a pass for everything else.', 'Ek baar saabit karta hai ki aap kaun ho, phir baaki sab ke liye pass deta hai.'),
    intro: bi(
      'An authentication service handles sign-up, login, passwords, multi-factor codes and sessions. After you prove who you are, it gives you a pass — a session cookie or a signed token — that other services can check quickly on every request.\n\nKeeping this in one dedicated service means passwords are handled in one carefully protected place, instead of every service writing its own login code.',
      'Authentication service sign-up, login, passwords, multi-factor codes aur sessions sambhalti hai. Aap kaun ho, yeh saabit karne ke baad yeh aapko ek pass deti hai — session cookie ya signed token — jise doosri services har request par jaldi check kar sakti hain.\n\nIse ek alag service mein rakhne ka matlab hai passwords ek dhyaan se surakshit jagah handle hote hain, har service apna login code nahi likhti.',
    ),
    problem: bi(
      'When every service checks passwords on its own, each one stores or sees passwords, each implements hashing differently, and one weak implementation leaks credentials for everyone. Users also have to log in again for every part of the product.',
      'Jab har service khud passwords check karti hai, toh har ek passwords store karti ya dekhti hai, har ek hashing alag tarah karti hai, aur ek kamzor implementation sabke credentials leak kar deti hai. Users ko product ke har hisse ke liye dobara login bhi karna padta hai.',
    ),
    before: scene(
      [[c('web-client')], [c('microservice', { id: 'a', label: 'Orders', note: 'own login' }), c('microservice', { id: 'b', label: 'Profile', note: 'weak hashing', state: 'bad' })], [c('sql-db', { label: 'Passwords ×2' })]],
      ['web-client>a', 'web-client>b', 'a>sql-db', 'b!>sql-db'],
      bi('Every service handles passwords itself — one weak spot exposes everyone.', 'Har service khud passwords sambhalti hai — ek kamzor jagah sabko expose kar deti hai.'),
    ),
    solution: bi(
      'The auth service is the only place that sees passwords. It verifies them, adds MFA when needed, and issues a short-lived signed token. The gateway and services only check the token — they never touch passwords.',
      'Auth service hi akeli jagah hai jo passwords dekhti hai. Yeh unhe verify karti hai, zaroorat ho toh MFA jodti hai, aur ek short-lived signed token deti hai. Gateway aur services sirf token check karte hain — passwords ko kabhi nahi chhoote.',
    ),
    after: scene(
      [[c('web-client')], [c('api-gateway', { note: 'checks token' })], [c('auth-service', { state: 'focus' }), c('microservice', { label: 'Orders' })], [c('sql-db', { label: 'Users (hashed)' })]],
      [['web-client>api-gateway', 'login / token'], 'api-gateway>auth-service', 'api-gateway>microservice', 'auth-service>sql-db'],
      bi('One service verifies passwords and issues tokens; everyone else just checks the token.', 'Ek service passwords verify karke tokens deti hai; baaki sab bas token check karte hain.'),
    ),
    steps: [
      bi('The user submits email and password (or uses a social / company login).', 'User email aur password deta hai (ya social / company login use karta hai).'),
      bi('The auth service compares a slow, salted hash of the password — never the plain password.', 'Auth service password ke slow, salted hash ko compare karti hai — kabhi plain password nahi.'),
      bi('If risk is high (new device), it asks for a second factor such as an OTP.', 'Risk zyada ho (naya device), toh second factor jaise OTP maangti hai.'),
      bi('It issues a session cookie or a signed token with an expiry time.', 'Yeh expiry time ke saath session cookie ya signed token deti hai.'),
      bi('On each request the gateway or service checks the token’s signature and expiry — fast, with no password involved.', 'Har request par gateway ya service token ka signature aur expiry check karte hain — tez, bina password ke.'),
    ],
    analogy: {
      icons: ['IdCard', 'BadgeCheck', 'Ticket'],
      title: bi('The ID check at a music festival', 'Music festival ka ID check'),
      text: bi(
        'At the entrance, staff check your ID and ticket carefully, once. Then they put a wristband on you. For the rest of the day, every stage and food stall just glances at the wristband — nobody asks for your ID again.\n\nThe entrance desk is the auth service, and the wristband is the token.',
        'Entrance par staff ek baar dhyaan se aapka ID aur ticket check karta hai. Phir aapko wristband pehna deta hai. Baaki din har stage aur food stall bas wristband dekhta hai — koi dobara ID nahi maangta.\n\nEntrance desk auth service hai, aur wristband token hai.',
      ),
    },
    perfectFit: {
      title: bi('One login for a suite of apps', 'Kai apps ke liye ek login'),
      text: bi(
        'A company has a web store, a seller dashboard and a mobile app. A single auth service lets users sign in once, supports OTP for risky logins, and issues tokens that all three products and all backend services accept.',
        'Ek company ke paas web store, seller dashboard aur mobile app hai. Ek auth service users ko ek baar sign in karne deti hai, risky logins ke liye OTP support karti hai, aur aise tokens deti hai jinhe teeno products aur saari backend services maanti hain.',
      ),
      why: [
        bi('Passwords are handled in exactly one hardened place.', 'Passwords bilkul ek majboot jagah handle hote hain.'),
        bi('Every service trusts the same token format.', 'Har service same token format par bharosa karti hai.'),
        bi('MFA and lockouts are added once for everyone.', 'MFA aur lockouts sabke liye ek baar jode jaate hain.'),
      ],
    },
    avoidWhen: [
      bi('You store passwords in plain text or with a fast hash like MD5 — always use a slow, salted algorithm.', 'Passwords plain text ya MD5 jaise fast hash mein store karna — hamesha slow, salted algorithm use karo.'),
      bi('Tokens never expire — a stolen token works forever.', 'Tokens kabhi expire na hon — chura hua token hamesha chalta hai.'),
      bi('Your users only sign in with their company account — then federate with an identity provider instead of storing passwords.', 'Aapke users sirf company account se sign in karte hain — tab passwords store karne ke bajaye identity provider se federate karo.'),
    ],
    decisions: [
      bi('Method: server sessions, JWT tokens, or OAuth2/OIDC.', 'Method: server sessions, JWT tokens, ya OAuth2/OIDC.'),
      bi('Whether multi-factor authentication is required.', 'Multi-factor authentication zaroori hai ya nahi.'),
      bi('Instances (it must not be a single point of failure — nobody can log in).', 'Instances (yeh single point of failure nahi hona chahiye — warna koi login nahi kar payega).'),
    ],
    confusedWith: [
      { type: 'identity-provider', difference: bi('Your auth service is yours to run; an identity provider is an outside system (Google, Okta, a company’s directory) that vouches for users.', 'Aapki auth service aap chalate ho; identity provider ek bahar ka system hai (Google, Okta, company directory) jo users ki gawahi deta hai.'), compare: 'auth-service-vs-identity-provider-vs-api-gateway' },
      { type: 'api-gateway', difference: bi('The gateway checks tokens on every request; the auth service is where tokens are created after login.', 'Gateway har request par tokens check karta hai; auth service woh jagah hai jahan login ke baad tokens bante hain.'), compare: 'auth-service-vs-identity-provider-vs-api-gateway' },
    ],
    examples: ['Keycloak', 'Auth0', 'AWS Cognito', 'Firebase Authentication'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'background-worker',
    tagline: bi('Does the slow work later, so users never wait for it.', 'Slow kaam baad mein karta hai, taaki users ko uska wait na karna pade.'),
    intro: bi(
      'A background worker is a process that picks jobs from a queue and does them outside the user’s request: resizing photos, sending emails, generating invoices, importing a big CSV.\n\nThe user’s request only drops a job in the queue and returns immediately (“We are processing your file”). Workers then chew through jobs at their own pace, and you add more workers when the queue grows.',
      'Background worker ek process hai jo queue se jobs uthata hai aur unhe user ki request ke bahar karta hai: photos resize karna, emails bhejna, invoices banana, bada CSV import karna.\n\nUser ki request bas queue mein job daalti hai aur turant lautti hai (“Aapki file process ho rahi hai”). Phir workers apni speed se jobs nipatte hain, aur queue badhne par aap zyada workers jodte ho.',
    ),
    problem: bi(
      'When slow work runs inside the request, the user stares at a spinner for 30 seconds, the request times out, and if the server restarts halfway the work is simply lost. Under load, slow requests pile up and block fast ones.',
      'Jab slow kaam request ke andar chalta hai, toh user 30 seconds spinner dekhta hai, request time out ho jaati hai, aur beech mein server restart ho toh kaam kho jaata hai. Load mein slow requests jama hokar tez requests ko bhi rok deti hain.',
    ),
    before: scene(
      [[c('web-client')], [c('app-server', { note: 'resizing… 30 s', state: 'bad' })], [a('img', 'Camera', 'Image resize')]],
      [['web-client>app-server', 'upload'], 'app-server>img'],
      bi('The user waits while the server does slow work inside the request.', 'User wait karta hai jab tak server request ke andar slow kaam karta hai.'),
    ),
    solution: bi(
      'The request puts a job in a task queue and answers right away. Workers take jobs one by one, retry failures with back-off, and park jobs that keep failing in a dead-letter queue. Users stay fast even when there is a lot of work.',
      'Request task queue mein job daalti hai aur turant jawab deti hai. Workers ek-ek karke jobs lete hain, failures ko back-off ke saath retry karte hain, aur baar-baar fail hone wale jobs dead-letter queue mein rakh dete hain. Bahut kaam hone par bhi users ke liye sab tez rehta hai.',
    ),
    after: scene(
      [[c('app-server')], [c('task-queue')], [c('background-worker', { id: 'w1', state: 'focus' }), c('background-worker', { id: 'w2', state: 'focus' })], [c('object-storage')]],
      [['app-server~>task-queue', 'job'], 'task-queue~>w1', 'task-queue~>w2', 'w1>object-storage', 'w2>object-storage'],
      bi('The request just enqueues a job; workers do it in the background.', 'Request bas job queue mein daalti hai; workers use background mein karte hain.'),
    ),
    steps: [
      bi('The app server adds a job to a task queue (for example “resize photo 123”).', 'App server task queue mein job daalta hai (jaise “photo 123 resize karo”).'),
      bi('It immediately tells the user the work has started.', 'Yeh turant user ko batata hai ki kaam shuru ho gaya.'),
      bi('A free worker takes the job, does it and marks it done.', 'Ek khaali worker job leta hai, karta hai aur done mark karta hai.'),
      bi('If it fails, the job is retried later; after several failures it moves to a dead-letter queue.', 'Fail ho toh job baad mein retry hota hai; kai baar fail hone par dead-letter queue mein chala jaata hai.'),
      bi('More workers are added automatically when the queue gets long.', 'Queue lambi hone par apne aap zyada workers jud jaate hain.'),
    ],
    analogy: {
      icons: ['Shirt', 'Receipt', 'Clock'],
      title: bi('Dropping clothes at the dry cleaner', 'Dry cleaner par kapde dena'),
      text: bi(
        'You do not stand in the shop while your suit is cleaned. You hand it over, get a receipt, and leave. The staff clean it in the back room in their own order, and you get a message when it is ready.\n\nThe receipt is the job id, the back room is the worker pool, and you never had to wait at the counter.',
        'Suit saaf hone tak aap dukaan mein khade nahi rehte. Aap use de dete ho, receipt lete ho, aur chale jaate ho. Staff peeche ke kamre mein apne order mein saaf karta hai, aur ready hone par aapko message aata hai.\n\nReceipt job id hai, peeche ka kamra worker pool hai, aur aapko counter par wait nahi karna pada.',
      ),
    },
    perfectFit: {
      title: bi('Thumbnails for uploaded photos', 'Upload hui photos ke thumbnails'),
      text: bi(
        'Every uploaded photo needs five sizes. The upload request stores the original and enqueues a “make thumbnails” job. Workers create the five sizes in the background; if one crashes, the job is retried. The user sees their photo instantly with a short “processing” badge.',
        'Har upload hui photo ke paanch sizes chahiye. Upload request original store karti hai aur “thumbnails banao” job queue mein daalti hai. Workers background mein paanch sizes banate hain; ek crash ho toh job retry hota hai. User ko apni photo turant dikhti hai, chhote “processing” badge ke saath.',
      ),
      why: [
        bi('The work is slow but nobody needs it within milliseconds.', 'Kaam slow hai lekin kisi ko milliseconds mein nahi chahiye.'),
        bi('Each job is independent and can be retried.', 'Har job independent hai aur retry ho sakta hai.'),
        bi('Load comes in bursts; the queue smooths it out.', 'Load jhatkon mein aata hai; queue use smooth kar deti hai.'),
      ],
    },
    avoidWhen: [
      bi('The user needs the result before the page can continue (checking a password) — do it in the request.', 'Page aage badhne se pehle user ko result chahiye (password check) — request mein hi karo.'),
      bi('The job is not idempotent: a retry could charge a card twice. Use idempotency keys first.', 'Job idempotent nahi hai: retry card ko do baar charge kar sakta hai. Pehle idempotency keys use karo.'),
      bi('A worker has no queue or scheduler feeding it — then nothing ever tells it what to do.', 'Worker ko koi queue ya scheduler feed nahi karta — tab use kabhi pata nahi chalta kya karna hai.'),
    ],
    decisions: [
      bi('Instances: how many workers, and whether they autoscale with queue length.', 'Instances: kitne workers, aur kya woh queue length ke saath autoscale honge.'),
      bi('Retry strategy: fixed or exponential back-off.', 'Retry strategy: fixed ya exponential back-off.'),
      bi('Idempotency, so retries and duplicates are safe.', 'Idempotency, taaki retries aur duplicates safe rahein.'),
    ],
    confusedWith: [
      { type: 'event-consumer', difference: bi('A worker does assigned jobs (“do this task”); an event consumer reacts to facts (“an order was placed”) from a stream, and many consumers can react to the same event.', 'Worker diye gaye jobs karta hai (“yeh task karo”); event consumer stream ke facts par react karta hai (“order place hua”), aur ek hi event par kai consumers react kar sakte hain.'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
      { type: 'batch-processor', difference: bi('Workers handle small jobs one by one as they arrive; a batch processor crunches a huge dataset in one big scheduled run.', 'Workers chhote jobs aate hi ek-ek karke handle karte hain; batch processor ek bade scheduled run mein bahut bada dataset process karta hai.'), compare: 'worker-vs-consumer-vs-stream-vs-batch' },
      { type: 'code-sandbox', difference: bi('A worker runs your own trusted code; a sandbox runs untrusted code written by users, locked down.', 'Worker aapka apna bharosemand code chalata hai; sandbox users ka likha untrusted code band kamre mein chalata hai.'), compare: 'code-sandbox-vs-background-worker' },
    ],
    examples: ['Celery', 'Sidekiq', 'BullMQ', 'AWS Lambda (queue-triggered)'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'websocket-server',
    tagline: bi('Keeps a line open to each user so the server can talk first.', 'Har user ke saath line khuli rakhta hai taaki server pehle bol sake.'),
    intro: bi(
      'Normal HTTP is “ask and answer”: the client asks, the server replies, and the conversation ends. A WebSocket server keeps a connection open with each online user, so the server can push messages the moment something happens — a new chat message, a live score, a driver moving on the map.\n\nIt is built for many long-lived connections: a single server can hold tens of thousands of idle sockets, sending small messages when needed.',
      'Normal HTTP “poocho aur jawab do” hai: client poochta hai, server jawab deta hai, aur baat khatam. WebSocket server har online user ke saath connection khula rakhta hai, taaki kuch hote hi server message push kar sake — naya chat message, live score, map par chalta driver.\n\nYeh bahut saare lambe connections ke liye bana hai: ek server hazaaron idle sockets rakh sakta hai, zaroorat par chhote messages bhejte hue.',
    ),
    problem: bi(
      'Without a live connection, clients have to keep asking “anything new?” every few seconds (polling). Most answers are “no”, which wastes battery and server capacity, and messages still arrive seconds late.',
      'Live connection ke bina clients ko har kuch seconds mein poochte rehna padta hai “kuch naya?” (polling). Zyada tar jawab “nahi” hota hai, jisse battery aur server capacity barbaad hoti hai, aur messages phir bhi seconds late aate hain.',
    ),
    before: scene(
      [[c('mobile-client', { label: 'Chat app' })], [c('app-server', { note: '10,000 “anything new?”/s', state: 'bad' })]],
      [['mobile-client!>app-server', 'poll every 2 s']],
      bi('Polling: constant “anything new?” requests, mostly answered “no”.', 'Polling: lagatar “kuch naya?” requests, zyada tar jawab “nahi”.'),
    ),
    solution: bi(
      'Each client opens one WebSocket connection. When a message arrives for a user, the backend finds which WebSocket server holds that user’s connection (using a shared registry or pub/sub) and pushes it instantly.',
      'Har client ek WebSocket connection kholta hai. Jab kisi user ke liye message aata hai, backend dhundta hai ki us user ka connection kaunse WebSocket server ke paas hai (shared registry ya pub/sub se) aur turant push kar deta hai.',
    ),
    after: scene(
      [[c('mobile-client', { id: 'alice', label: 'Alice' }), c('mobile-client', { id: 'bob', label: 'Bob' })], [c('load-balancer')], [c('websocket-server', { state: 'focus' })], [c('distributed-cache', { label: 'Who is where' })]],
      ['alice<>load-balancer', 'bob<>load-balancer', ['load-balancer<>websocket-server', 'open connection'], 'websocket-server>distributed-cache'],
      bi('Connections stay open; the server pushes new messages the instant they arrive.', 'Connections khule rehte hain; naya message aate hi server turant push karta hai.'),
    ),
    steps: [
      bi('The client opens a WebSocket connection through a load balancer and stays connected.', 'Client load balancer ke through WebSocket connection kholta hai aur juda rehta hai.'),
      bi('The server records “user 42 is on server B” in a shared registry.', 'Server shared registry mein record karta hai “user 42 server B par hai”.'),
      bi('When something happens for user 42, the backend looks up the server and sends the message there (often via pub/sub).', 'User 42 ke liye kuch hota hai, toh backend server dhundta hai aur message wahan bhejta hai (aksar pub/sub se).'),
      bi('Server B pushes it down the open connection in milliseconds.', 'Server B use khule connection se milliseconds mein push karta hai.'),
      bi('Heartbeats detect dead connections; clients reconnect automatically.', 'Heartbeats mare hue connections pakadte hain; clients apne aap reconnect hote hain.'),
    ],
    analogy: {
      icons: ['PhoneCall', 'Mail'],
      title: bi('An open phone call versus checking the mailbox', 'Khuli phone call vs baar-baar mailbox dekhna'),
      text: bi(
        'Polling is walking to your mailbox every five minutes to see if a letter came. A WebSocket is staying on an open phone call: the moment the other person has news, they just say it.\n\nThe trade-off: the phone line stays occupied, so the exchange needs enough lines (servers) for everyone who is online.',
        'Polling har paanch minute mailbox tak chalke dekhna hai ki letter aaya ya nahi. WebSocket khuli phone call par rehna hai: jaise hi saamne wale ke paas khabar ho, woh bas bol deta hai.\n\nTrade-off: phone line busy rehti hai, isliye exchange ke paas har online insaan ke liye kaafi lines (servers) honi chahiye.',
      ),
    },
    perfectFit: {
      title: bi('A live chat app', 'Ek live chat app'),
      text: bi(
        'In a chat app, both people are online and expect each message within a fraction of a second, typing indicators and “seen” ticks included. A WebSocket connection per online user makes this instant and cheap — no polling at all.',
        'Chat app mein dono log online hain aur har message second ke chhote hisse mein chahte hain, typing indicators aur “seen” ticks ke saath. Har online user ka ek WebSocket connection ise turant aur sasta banata hai — polling bilkul nahi.',
      ),
      why: [
        bi('Messages must arrive in well under a second.', 'Messages ek second se bahut kam mein pahunchne chahiye.'),
        bi('Traffic flows both ways, all the time.', 'Traffic dono taraf, hamesha chalta hai.'),
        bi('Users are online while the app is open.', 'App khula ho tab users online hote hain.'),
      ],
    },
    avoidWhen: [
      bi('The user is offline or the app is closed — use push notifications instead.', 'User offline hai ya app band hai — push notifications use karo.'),
      bi('Data changes once a day — a normal request when the page opens is enough.', 'Data din mein ek baar badalta hai — page khulne par normal request kaafi hai.'),
      bi('You keep connection info only in one server’s memory — other servers cannot find the user.', 'Connection info sirf ek server ki memory mein rakhna — doosre servers user ko dhundh nahi paate.'),
    ],
    decisions: [
      bi('Instances: many servers, because each holds a limited number of connections.', 'Instances: kai servers, kyunki har ek limited connections rakhta hai.'),
      bi('Connection registry: a shared cache or pub/sub so any server can reach any user.', 'Connection registry: shared cache ya pub/sub taaki koi bhi server kisi bhi user tak pahunche.'),
      bi('Heartbeats to detect dropped connections.', 'Gire hue connections pakadne ke liye heartbeats.'),
    ],
    confusedWith: [
      { type: 'push-provider', difference: bi('WebSockets reach users while the app is open; push notifications (APNs/FCM) reach them when it is closed.', 'WebSockets app khula hone par users tak pahunchte hain; push notifications (APNs/FCM) band hone par.'), compare: 'websocket-vs-notifications-vs-providers' },
      { type: 'media-server', difference: bi('A WebSocket server carries small messages (text, events); a media server carries live audio and video streams.', 'WebSocket server chhote messages (text, events) le jaata hai; media server live audio aur video streams.') },
    ],
    examples: ['Socket.IO', 'Phoenix Channels', 'AWS API Gateway WebSockets', 'Centrifugo'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'bff',
    tagline: bi('A backend made for one front-end, serving exactly what its screens need.', 'Ek front-end ke liye bana backend, jo uski screens ko bilkul wahi deta hai jo chahiye.'),
    intro: bi(
      'A BFF (Backend for Frontend) is a thin server built for one specific client — say, the mobile app. It calls several services, combines their answers and returns one response shaped exactly like the app’s screen.\n\nThe web app may have its own BFF with different shapes. Each front-end team owns its BFF, so it can change what it needs without asking the core service teams.',
      'BFF (Backend for Frontend) ek patla server hai jo ek khaas client ke liye bana hai — jaise mobile app. Yeh kai services ko call karta hai, unke jawab jodta hai aur ek response lautaata hai jo bilkul app ki screen jaisa shaped hota hai.\n\nWeb app ka apna BFF ho sakta hai alag shapes ke saath. Har front-end team apne BFF ki maalik hai, isliye woh core service teams se pooche bina apni zaroorat badal sakti hai.',
    ),
    problem: bi(
      'The mobile home screen needed data from five services. The app made five calls over a slow mobile network, downloaded fields it never showed, and stitched everything together on the phone — slow and battery-hungry.',
      'Mobile home screen ko paanch services se data chahiye tha. App slow mobile network par paanch calls karta, woh fields download karta jo kabhi dikhaata nahi, aur phone par sab jodta — slow aur battery khaane wala.',
    ),
    before: scene(
      [[c('mobile-client', { note: '5 slow calls', state: 'bad' })], [c('microservice', { id: 'p', label: 'Profile' }), c('microservice', { id: 'o', label: 'Orders' }), c('microservice', { id: 'r', label: 'Offers' })]],
      ['mobile-client>p', 'mobile-client>o', 'mobile-client>r'],
      bi('The phone makes many calls and assembles the screen itself.', 'Phone kai calls karta hai aur screen khud jodta hai.'),
    ),
    solution: bi(
      'The app makes one call to its BFF. The BFF fans out to the services over the fast internal network, trims and merges the data, and returns exactly the home screen’s shape.',
      'App apne BFF ko ek call karta hai. BFF tez internal network par services ko call karta hai, data ko kaat-chhaant ke jodta hai, aur bilkul home screen ki shape lautaata hai.',
    ),
    after: scene(
      [[c('mobile-client')], [c('bff', { label: 'Mobile BFF', state: 'focus' })], [c('microservice', { id: 'p', label: 'Profile' }), c('microservice', { id: 'o', label: 'Orders' }), c('microservice', { id: 'r', label: 'Offers' })]],
      [['mobile-client>bff', '1 call'], 'bff>p', 'bff>o', 'bff>r'],
      bi('One call from the phone; the BFF gathers and shapes everything server-side.', 'Phone se ek call; BFF server par sab ikattha karke shape karta hai.'),
    ),
    steps: [
      bi('The app asks its BFF for “home screen data”.', 'App apne BFF se “home screen data” maangta hai.'),
      bi('The BFF calls the needed services in parallel inside the data centre.', 'BFF data centre ke andar zaroori services ko parallel mein call karta hai.'),
      bi('It keeps only the fields the screen shows and merges them.', 'Yeh sirf woh fields rakhta hai jo screen dikhati hai aur unhe jodta hai.'),
      bi('It returns one small response; if one service is slow it can return a partial screen.', 'Yeh ek chhota response lautaata hai; ek service slow ho toh adhoori screen bhi de sakta hai.'),
    ],
    analogy: {
      icons: ['ShoppingBag', 'User'],
      title: bi('A personal shopper', 'Ek personal shopper'),
      text: bi(
        'Instead of you visiting the bakery, the vegetable stall and the pharmacy one by one, a personal shopper does the rounds and hands you one bag with exactly what is on your list.\n\nA different customer (the web app) can have a different personal shopper who packs things in a different way.',
        'Bakery, sabzi wale aur pharmacy par ek-ek karke jaane ke bajaye, ek personal shopper chakkar lagata hai aur aapko ek bag deta hai jismein bilkul aapki list ka saamaan ho.\n\nDoosre customer (web app) ka alag personal shopper ho sakta hai jo cheezein alag tarah pack kare.',
      ),
    },
    perfectFit: {
      title: bi('A mobile app on slow networks', 'Slow networks par mobile app'),
      text: bi(
        'A shopping app’s home screen shows your name, active orders, recommended items and offers. A mobile BFF turns five round trips over 3G into one, cuts the payload by 80%, and lets the mobile team change the screen without waiting for four other teams.',
        'Shopping app ki home screen aapka naam, active orders, recommended items aur offers dikhati hai. Mobile BFF 3G par paanch round trips ko ek bana deta hai, payload 80% kam karta hai, aur mobile team ko chaar doosri teams ka wait kiye bina screen badalne deta hai.',
      ),
      why: [
        bi('One screen needs data from several services.', 'Ek screen ko kai services ka data chahiye.'),
        bi('The client’s network is slow or expensive.', 'Client ka network slow ya mehenga hai.'),
        bi('The front-end team wants to own its API shape.', 'Front-end team apni API shape ki maalik banna chahti hai.'),
      ],
    },
    avoidWhen: [
      bi('You put business rules (pricing, permissions) in it — those belong in the services that own the data.', 'Isme business rules (pricing, permissions) daalna — woh data ki maalik services mein hone chahiye.'),
      bi('There is only one client and one service — it is just an extra hop.', 'Sirf ek client aur ek service hai — yeh bas ek extra hop hai.'),
      bi('One shared BFF tries to serve web, mobile and TV — that is just a gateway with extra steps.', 'Ek shared BFF web, mobile aur TV sabko serve kare — yeh bas extra steps wala gateway hai.'),
    ],
    decisions: [
      bi('Which client it serves (one BFF per client type).', 'Kaunse client ko serve karega (har client type ka ek BFF).'),
      bi('Instances and timeouts for the calls it fans out.', 'Instances aur uski bheji calls ke timeouts.'),
      bi('What to do when one downstream service is slow (partial response).', 'Ek downstream service slow ho toh kya karna hai (partial response).'),
    ],
    confusedWith: [
      { type: 'api-gateway', difference: bi('A gateway is generic and shared (auth, limits, routing); a BFF is client-specific and reshapes data.', 'Gateway generic aur shared hai (auth, limits, routing); BFF client-specific hai aur data ko naya shape deta hai.') },
      { type: 'microservice', difference: bi('Microservices own business data and rules; the BFF owns none — it only composes for a screen.', 'Microservices business data aur rules ki maalik hain; BFF kisi ka maalik nahi — sirf screen ke liye jodta hai.'), compare: 'app-server-vs-microservice-vs-bff' },
    ],
    examples: ['GraphQL servers', 'Node.js aggregation layers', 'Apollo Server', 'Next.js API routes'],
  },
];
