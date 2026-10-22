import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const supportingGuides: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'rate-limiter',
    tagline: bi('A fair-use bouncer: “you have made enough requests for this minute”.', 'Fair-use bouncer: “is minute ke liye aapki requests kaafi ho gayi”.'),
    intro: bi(
      'A rate limiter counts how many requests each caller (user, IP address or API key) has made in a time window and rejects the extra ones with “429 Too Many Requests”.\n\nIt protects your system from abuse (password guessing, scraping), from buggy clients stuck in a loop, and from one heavy customer using up capacity meant for everyone. With several servers, the counters must live in a shared store so limits are enforced globally.',
      'Rate limiter ginta hai ki har caller (user, IP address ya API key) ne ek time window mein kitni requests ki, aur extra ko “429 Too Many Requests” se reject karta hai.\n\nYeh aapke system ko abuse (password guess karna, scraping) se, loop mein phase buggy clients se, aur sabke liye bani capacity ko ek bhaari customer dwara khatam hone se bachata hai. Kai servers ho toh counters shared store mein hone chahiye taaki limits globally lagein.',
    ),
    problem: bi(
      'One misbehaving script sent 50,000 login attempts a minute. The auth service slowed to a crawl for every real user, and an attacker had unlimited guesses at passwords.',
      'Ek bigdi script ne ek minute mein 50,000 login attempts bheje. Har asli user ke liye auth service bahut slow ho gayi, aur attacker ko passwords guess karne ki unlimited koshishein mil gayi.',
    ),
    before: scene(
      [[a('bot', 'Bot', 'Script', { note: '50k req/min', state: 'bad' }), a('user', 'User', 'Real user')], [c('auth-service', { note: 'overloaded', state: 'bad' })]],
      ['bot!>auth-service', 'user>auth-service'],
      bi('Nothing limits one caller, so it starves everyone else.', 'Ek caller ko kuch nahi rokta, isliye woh baaki sabko bhookha maar deta hai.'),
    ),
    solution: bi(
      'Every request first passes the rate limiter. It checks the caller’s counter in a shared cache, lets normal traffic through and rejects the excess immediately — before it costs your services anything.',
      'Har request pehle rate limiter se guzarti hai. Yeh shared cache mein caller ka counter check karta hai, normal traffic jaane deta hai aur extra ko turant reject karta hai — services par koi kharch hone se pehle.',
    ),
    after: scene(
      [[a('bot', 'Bot', 'Script'), a('user', 'User', 'Real user')], [c('rate-limiter', { state: 'focus', note: '10/min per IP' })], [c('auth-service', { state: 'good' }), c('distributed-cache', { label: 'Counters' })]],
      [['bot!>rate-limiter', '429'], 'user>rate-limiter', 'rate-limiter>auth-service', 'rate-limiter>distributed-cache'],
      bi('Excess requests are rejected at the door; real users get through.', 'Extra requests darwaze par reject; asli users andar.'),
    ),
    steps: [
      bi('Identify the caller: user id, IP address or API key.', 'Caller pehchano: user id, IP address ya API key.'),
      bi('Look up and increment their counter (token bucket or sliding window) in a shared store.', 'Shared store mein unka counter dekho aur badhao (token bucket ya sliding window).'),
      bi('Under the limit: pass the request on.', 'Limit ke andar: request aage bhejo.'),
      bi('Over the limit: return 429 with a “retry after” hint.', 'Limit ke bahar: “retry after” hint ke saath 429 lautaao.'),
      bi('Decide what happens if the counter store is down: fail open (allow) or fail closed (block).', 'Counter store down ho toh kya karna hai: fail open (allow) ya fail closed (block).'),
    ],
    analogy: {
      icons: ['Ticket', 'User', 'Ban'],
      title: bi('The “one coupon per customer” rule', '“Ek customer ek coupon” ka niyam'),
      text: bi(
        'A shop running a free-sample offer stamps each customer’s card: five samples per day. When someone comes back a sixth time, the staff politely say “come back tomorrow”. One greedy visitor cannot empty the whole tray, so everyone gets a fair share.',
        'Free-sample offer chalane wali dukaan har customer ka card stamp karti hai: din mein paanch samples. Koi chhathi baar aaye toh staff vinamrata se kehta hai “kal aana”. Ek laalchi visitor poori tray khaali nahi kar sakta, isliye sabko barabar hissa milta hai.',
      ),
    },
    perfectFit: {
      title: bi('Protecting a login endpoint', 'Login endpoint ki hifazat'),
      text: bi(
        'Allowing 10 login attempts per minute per IP and 5 per account stops password-guessing scripts cold while real users never notice. Counters in a shared Redis make the limit hold across all auth servers.',
        'Har IP par ek minute mein 10 aur har account par 5 login attempts allow karna password-guessing scripts ko rok deta hai, jabki asli users ko pata bhi nahi chalta. Shared Redis mein counters limit ko saare auth servers par laagu rakhte hain.',
      ),
      why: [
        bi('Abuse is cheap for attackers and expensive for you.', 'Abuse attackers ke liye sasta aur aapke liye mehenga hai.'),
        bi('Real users stay far below the limit.', 'Asli users limit se bahut neeche rehte hain.'),
        bi('Limits must hold across many servers.', 'Limits kai servers par laagu rehni chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You need to block known attack patterns like SQL injection — that is a WAF’s job.', 'SQL injection jaise jaane-pehchaane attack patterns block karne hain — yeh WAF ka kaam hai.'),
      bi('Each server keeps its own counter — a caller gets N× the limit by spreading requests.', 'Har server apna counter rakhe — caller requests baantkar N guna limit pa leta hai.'),
      bi('Limits are so tight that normal usage hits them.', 'Limits itni tight ki normal use bhi takra jaaye.'),
    ],
    decisions: [
      bi('Algorithm: token bucket, leaky bucket, fixed or sliding window.', 'Algorithm: token bucket, leaky bucket, fixed ya sliding window.'),
      bi('Scope: per user, per IP, per API key or global.', 'Scope: per user, per IP, per API key ya global.'),
      bi('Counter store (shared cache) and fail-open versus fail-closed.', 'Counter store (shared cache) aur fail-open vs fail-closed.'),
    ],
    confusedWith: [
      { type: 'waf', difference: bi('A rate limiter cares how many requests you send; a WAF cares what is inside them (attacks).', 'Rate limiter ko farak padta hai kitni requests bhejte ho; WAF ko ki unke andar kya hai (attacks).'), compare: 'rate-limiter-vs-waf' },
      { type: 'api-gateway', difference: bi('Gateways often include basic rate limiting; a dedicated rate limiter adds smarter algorithms and global, shared counters.', 'Gateways mein aksar basic rate limiting hoti hai; dedicated rate limiter smart algorithms aur global, shared counters jodta hai.') },
    ],
    examples: ['Redis-based limiters', 'Envoy rate limit service', 'NGINX limit_req', 'Cloudflare Rate Limiting'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'notification-service',
    tagline: bi('Decides who should be told what, and through which channel.', 'Decide karta hai kisko kya batana hai, aur kis channel se.'),
    intro: bi(
      'A notification service receives events like “order shipped” and turns them into messages people actually receive. It decides who to notify, picks the channel (push, email, SMS, in-app) based on preferences, applies templates and languages, avoids spamming (quiet hours, de-duplication), and hands the message to the right delivery provider.\n\nIt does not deliver anything itself — Apple, Google, email and SMS providers do the last mile.',
      'Notification service “order shipped” jaise events leti hai aur unhe aise messages mein badalti hai jo log sach mein paate hain. Yeh decide karti hai kisko batana hai, preferences ke hisaab se channel chunti hai (push, email, SMS, in-app), templates aur bhasha lagati hai, spam se bachti hai (quiet hours, de-duplication), aur message sahi delivery provider ko deti hai.\n\nYeh khud kuch deliver nahi karti — aakhri kadam Apple, Google, email aur SMS providers karte hain.',
    ),
    problem: bi(
      'Every service sent its own emails and SMS: different templates, no respect for user preferences, the same user getting three messages for one event, and every team integrating with providers separately.',
      'Har service apne emails aur SMS bhejti thi: alag templates, user preferences ki parwah nahi, ek event ke liye ek user ko teen messages, aur har team providers se alag-alag judti.',
    ),
    before: scene(
      [[c('microservice', { id: 'o', label: 'Orders' }), c('microservice', { id: 'p', label: 'Payments' })], [c('email-sms-provider', { note: 'duplicates, no preferences', state: 'bad' })], [a('user', 'User', 'Annoyed user', { state: 'bad' })]],
      ['o>email-sms-provider', 'p>email-sms-provider', 'email-sms-provider!>user'],
      bi('Every service messages users directly — duplicates and spam.', 'Har service users ko seedha message karti hai — duplicates aur spam.'),
    ),
    solution: bi(
      'Services publish events; the notification service consumes them, checks preferences, picks the channel, renders the template and sends through the right provider — once.',
      'Services events publish karti hain; notification service unhe consume karti hai, preferences check karti hai, channel chunti hai, template banati hai aur sahi provider se bhejti hai — ek baar.',
    ),
    after: scene(
      [[c('microservice', { label: 'Orders' })], [c('message-queue')], [c('notification-service', { state: 'focus', note: 'prefs · templates' })], [c('push-provider'), c('email-sms-provider')]],
      [['microservice~>message-queue', 'order shipped'], 'message-queue~>notification-service', 'notification-service>push-provider', 'notification-service.>email-sms-provider'],
      bi('One service owns “who, what, which channel”; providers only deliver.', '“Kaun, kya, kaunsa channel” ek service ka; providers sirf deliver karte hain.'),
    ),
    steps: [
      bi('An event arrives: “order 881 shipped”.', 'Event aata hai: “order 881 shipped”.'),
      bi('Look up the user’s preferences (push yes, SMS only for OTPs) and quiet hours.', 'User ki preferences (push haan, SMS sirf OTP ke liye) aur quiet hours dekho.'),
      bi('Render the template in the user’s language.', 'User ki bhasha mein template banao.'),
      bi('Send to the provider with an idempotency key so retries never double-send.', 'Idempotency key ke saath provider ko bhejo taaki retries kabhi do baar na bhejein.'),
      bi('Record delivery status; retry or fall back to another channel on failure.', 'Delivery status record karo; fail hone par retry ya doosre channel par jaao.'),
    ],
    analogy: {
      icons: ['Megaphone', 'ClipboardList', 'Send'],
      title: bi('A school office sending messages to parents', 'Parents ko messages bhejta school office'),
      text: bi(
        'Teachers do not each call every parent. They tell the office: “class 5 trip tomorrow”. The office knows which parents prefer WhatsApp, which want a letter, and not to call anyone after 9 pm. Then it uses the phone company and the post office to deliver.',
        'Teachers har parent ko alag se call nahi karte. Woh office ko batate hain: “class 5 ki trip kal”. Office jaanta hai kaunse parents WhatsApp pasand karte hain, kaunse letter, aur raat 9 ke baad kisi ko call nahi karna. Phir deliver karne ke liye phone company aur post office use karta hai.',
      ),
    },
    perfectFit: {
      title: bi('Order updates in a shopping app', 'Shopping app mein order updates'),
      text: bi(
        'Placed, packed, shipped, out for delivery, delivered — five events per order, sent as push when the app is installed, email for receipts and SMS only for delivery OTPs, never between 10 pm and 7 am except urgent ones. That decision-making is the notification service’s job.',
        'Placed, packed, shipped, out for delivery, delivered — har order ke paanch events, app installed ho toh push, receipts ke liye email aur sirf delivery OTP ke liye SMS, raat 10 se subah 7 ke beech kabhi nahi siwaye urgent ke. Yeh faisle lena notification service ka kaam hai.',
      ),
      why: [
        bi('Many events, several channels, user preferences.', 'Kai events, kai channels, user preferences.'),
        bi('Duplicate messages must be avoided.', 'Duplicate messages se bachna hai.'),
        bi('One team owns templates and provider integrations.', 'Ek team templates aur provider integrations ki maalik hai.'),
      ],
    },
    avoidWhen: [
      bi('You need live, two-way, in-app updates (chat) — that is a WebSocket job.', 'Live, do-taraf, in-app updates (chat) chahiye — yeh WebSocket ka kaam hai.'),
      bi('You expect it to deliver to phones itself — it needs a push provider and email/SMS providers.', 'Ise khud phones tak deliver karne ki ummeed — ise push provider aur email/SMS providers chahiye.'),
    ],
    decisions: [
      bi('Channels: push, email, SMS or multi-channel.', 'Channels: push, email, SMS ya multi-channel.'),
      bi('Idempotency and retry strategy.', 'Idempotency aur retry strategy.'),
      bi('Instances for bursts (a flash sale sends millions).', 'Bursts ke liye instances (flash sale lakhon bhejti hai).'),
    ],
    confusedWith: [
      { type: 'push-provider', difference: bi('The notification service decides what to send to whom; the push provider (APNs/FCM) is the postal service that physically reaches the phone.', 'Notification service decide karti hai kisko kya bhejna hai; push provider (APNs/FCM) woh dak seva hai jo sach mein phone tak pahunchti hai.'), compare: 'websocket-vs-notifications-vs-providers' },
      { type: 'websocket-server', difference: bi('WebSockets carry live updates while the app is open; notifications reach people when it is closed or for important events.', 'WebSockets app khula hone par live updates le jaate hain; notifications band hone par ya important events par logon tak pahunchti hain.'), compare: 'websocket-vs-notifications-vs-providers' },
    ],
    examples: ['Amazon SNS', 'Firebase Cloud Messaging topics', 'OneSignal', 'Novu'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'email-sms-provider',
    tagline: bi('The post office for emails and text messages — you hand over, they deliver.', 'Emails aur text messages ka post office — aap dete ho, woh deliver karte hain.'),
    intro: bi(
      'An email/SMS provider is a third-party service that delivers your emails and text messages. You call its API with the recipient and the content; it handles telecom networks, spam filters, sender reputation, bounces and delivery receipts.\n\nBecause it is outside your system, it can be slow or down, has rate limits and costs money per message. Treat it like any external dependency: call it asynchronously, with retries and idempotency.',
      'Email/SMS provider ek third-party service hai jo aapke emails aur text messages deliver karti hai. Aap uski API ko recipient aur content ke saath call karte ho; woh telecom networks, spam filters, sender reputation, bounces aur delivery receipts sambhalti hai.\n\nKyunki yeh aapke system ke bahar hai, slow ya down ho sakti hai, iski rate limits hain aur har message ka paisa lagta hai. Ise kisi bhi external dependency ki tarah treat karo: asynchronously, retries aur idempotency ke saath call karo.',
    ),
    problem: bi(
      'Running your own mail servers means fighting spam filters, keeping IP reputation clean and handling bounces; sending SMS means contracts with telecom operators in every country. Messages land in spam or never arrive.',
      'Apne mail servers chalane ka matlab spam filters se ladna, IP reputation saaf rakhna aur bounces sambhalna; SMS bhejne ka matlab har desh ke telecom operators se contracts. Messages spam mein jaate hain ya pahunchte hi nahi.',
    ),
    before: scene(
      [[c('app-server')], [a('smtp', 'Server', 'Own mail server', { note: 'marked as spam', state: 'bad' })], [a('user', 'Mail', 'Inbox')]],
      ['app-server>smtp', 'smtp!>user'],
      bi('Self-run delivery: poor reputation, spam folders, no SMS reach.', 'Khud ki delivery: kharab reputation, spam folders, SMS reach nahi.'),
    ),
    solution: bi(
      'A provider with established reputation and operator connections delivers for you. Your notification service or worker calls its API from a queue, retries on temporary errors and records delivery status from webhooks.',
      'Bani hui reputation aur operator connections wala provider aapke liye deliver karta hai. Aapki notification service ya worker queue se uski API call karta hai, temporary errors par retry karta hai aur webhooks se delivery status record karta hai.',
    ),
    after: scene(
      [[c('notification-service')], [c('email-sms-provider', { state: 'focus' })], [a('mail', 'Mail', 'Email inbox', { state: 'good' }), a('sms', 'Smartphone', 'SMS', { state: 'good' })]],
      [['notification-service~>email-sms-provider', 'API call'], 'email-sms-provider>mail', 'email-sms-provider>sms'],
      bi('A specialist provider handles the last mile to inboxes and phones.', 'Specialist provider inboxes aur phones tak aakhri kadam sambhalta hai.'),
    ),
    steps: [
      bi('Your service calls the provider’s API with recipient, template and data.', 'Aapki service recipient, template aur data ke saath provider ki API call karti hai.'),
      bi('The provider queues and delivers via email servers or telecom networks.', 'Provider email servers ya telecom networks se queue karke deliver karta hai.'),
      bi('It reports delivered, bounced or failed — often via a webhook back to you.', 'Woh delivered, bounced ya failed batata hai — aksar aapko webhook se.'),
      bi('You retry temporary failures and stop sending to addresses that bounce.', 'Aap temporary failures retry karte ho aur bounce hone wale addresses par bhejna band karte ho.'),
    ],
    analogy: {
      icons: ['Mailbox', 'Truck', 'House'],
      title: bi('A courier company', 'Ek courier company'),
      text: bi(
        'You do not buy trucks to send parcels across the country. You hand the parcel to a courier, pay per delivery, and get a tracking update. Sometimes the courier is delayed — so you plan for that instead of waiting at the counter.',
        'Desh bhar mein parcels bhejne ke liye aap trucks nahi khareedte. Parcel courier ko dete ho, har delivery ka paisa dete ho, aur tracking update milta hai. Kabhi courier late hota hai — isliye counter par wait karne ke bajaye uski planning karte ho.',
      ),
    },
    perfectFit: {
      title: bi('Login OTPs and receipts', 'Login OTPs aur receipts'),
      text: bi(
        'A bank app sends SMS one-time passwords and emailed statements to millions of customers in many countries. A provider gives instant reach to every operator and inbox, delivery receipts, and compliance handling.',
        'Ek bank app kai deshon ke lakhon customers ko SMS one-time passwords aur emailed statements bhejta hai. Provider har operator aur inbox tak turant pahunch, delivery receipts aur compliance handling deta hai.',
      ),
      why: [
        bi('Delivery to real inboxes and phones is a specialist job.', 'Asli inboxes aur phones tak delivery specialist ka kaam hai.'),
        bi('Global reach without operator contracts.', 'Operator contracts ke bina global pahunch.'),
        bi('Delivery receipts for auditing.', 'Auditing ke liye delivery receipts.'),
      ],
    },
    avoidWhen: [
      bi('You call it synchronously inside a user request — its slowness becomes your slowness.', 'User request ke andar ise synchronously call karna — iski dheemapan aapki ban jaati hai.'),
      bi('You retry without idempotency — users get the same SMS three times (and you pay three times).', 'Bina idempotency retry — users ko same SMS teen baar milta hai (aur aap teen baar paise dete ho).'),
    ],
    decisions: [
      bi('Channels used: email, SMS or both.', 'Channels: email, SMS ya dono.'),
      bi('Who calls it (a worker or notification service, never the client).', 'Ise kaun call karega (worker ya notification service, client kabhi nahi).'),
    ],
    confusedWith: [
      { type: 'notification-service', difference: bi('Your notification service decides; the provider delivers.', 'Aapki notification service decide karti hai; provider deliver karta hai.'), compare: 'websocket-vs-notifications-vs-providers' },
      { type: 'push-provider', difference: bi('Email/SMS reach any address or number; push reaches only devices where your app is installed and allowed.', 'Email/SMS kisi bhi address ya number tak pahunchte hain; push sirf un devices tak jahan aapka app installed aur allowed hai.'), compare: 'websocket-vs-notifications-vs-providers' },
    ],
    examples: ['Twilio', 'Amazon SES / SNS', 'SendGrid', 'MSG91'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'payment-provider',
    tagline: bi('A licensed money mover that charges cards, UPI and wallets for you.', 'Ek licensed paisa le-jaane wala jo aapke liye cards, UPI aur wallets charge karta hai.'),
    intro: bi(
      'A payment provider (payment gateway) connects your app to card networks, banks, UPI and wallets. You send it “charge ₹499 for order 881”; it talks to the banks, handles 3-D Secure / OTP steps, and tells you whether money moved — often later, through a webhook.\n\nIt also keeps sensitive card data out of your systems, which massively reduces your security and compliance burden.',
      'Payment provider (payment gateway) aapke app ko card networks, banks, UPI aur wallets se jodta hai. Aap use bhejte ho “order 881 ke liye ₹499 charge karo”; woh banks se baat karta hai, 3-D Secure / OTP steps sambhalta hai, aur batata hai ki paisa gaya ya nahi — aksar baad mein, webhook se.\n\nYeh sensitive card data ko aapke systems se door rakhta hai, jisse aapka security aur compliance bojh bahut kam ho jaata hai.',
    ),
    problem: bi(
      'Handling card numbers yourself means strict PCI compliance audits, bank integrations per country and fraud handling. Worse, a network timeout while charging leaves you unsure whether the customer paid — and a naive retry can charge them twice.',
      'Card numbers khud sambhalne ka matlab sakht PCI compliance audits, har desh ke liye bank integrations aur fraud handling. Usse bhi bura, charge karte waqt network timeout se pata nahi chalta customer ne pay kiya ya nahi — aur seedha retry do baar charge kar sakta hai.',
    ),
    before: scene(
      [[c('app-server', { note: 'stores card numbers', state: 'bad' })], [a('bank', 'Landmark', 'Bank', { note: 'timeout…' })], [a('user', 'User', 'Customer', { note: 'charged twice', state: 'bad' })]],
      ['app-server!>bank', 'bank!>user'],
      bi('Card data in your systems and blind retries: compliance risk and double charges.', 'Aapke systems mein card data aur andhe retries: compliance risk aur dohra charge.'),
    ),
    solution: bi(
      'Your payment service calls the provider with an idempotency key per order. The provider runs the payment and confirms by webhook; retries with the same key can never charge twice. Card details never touch your servers.',
      'Aapki payment service har order ki idempotency key ke saath provider ko call karti hai. Provider payment chalata hai aur webhook se confirm karta hai; same key ke retries kabhi do baar charge nahi kar sakte. Card details aapke servers ko chhoote bhi nahi.',
    ),
    after: scene(
      [[c('microservice', { label: 'Payment service' })], [c('payment-provider', { state: 'focus', note: 'idempotency key' })], [a('bank', 'Landmark', 'Banks / UPI')]],
      [['microservice>payment-provider', 'charge (key: order-881)'], 'payment-provider>bank', ['payment-provider~>microservice', 'webhook: paid']],
      bi('The provider moves the money; idempotency keys and webhooks keep it exactly-once.', 'Provider paisa le jaata hai; idempotency keys aur webhooks ise bilkul ek baar rakhte hain.'),
    ),
    steps: [
      bi('Create a payment intent for the order with an idempotency key.', 'Order ke liye idempotency key ke saath payment intent banao.'),
      bi('The customer completes card/UPI steps on the provider’s secure page or SDK.', 'Customer provider ke secure page ya SDK par card/UPI steps poore karta hai.'),
      bi('The provider talks to banks and returns success, failure or “pending”.', 'Provider banks se baat karke success, failure ya “pending” lautaata hai.'),
      bi('A webhook confirms the final result; your service updates the order idempotently.', 'Webhook aakhri result confirm karta hai; aapki service order ko idempotently update karti hai.'),
      bi('A nightly reconciliation compares your records with the provider’s settlement report.', 'Raat ki reconciliation aapke records ko provider ki settlement report se milati hai.'),
    ],
    analogy: {
      icons: ['CreditCard', 'Landmark', 'Receipt'],
      title: bi('The card machine at a shop', 'Dukaan ki card machine'),
      text: bi(
        'A shopkeeper does not phone your bank to check your balance. They use a card machine provided by a payment company, which talks to the banks and prints a receipt. If the machine says “processing”, a good shopkeeper waits for the receipt instead of swiping again.',
        'Dukaandaar aapka balance check karne ke liye aapke bank ko phone nahi karta. Woh payment company ki di hui card machine use karta hai, jo banks se baat karke receipt chhapti hai. Machine “processing” kahe toh achha dukaandaar dobara swipe karne ke bajaye receipt ka wait karta hai.',
      ),
    },
    perfectFit: {
      title: bi('Checkout in an online store', 'Online store ka checkout'),
      text: bi(
        'Customers pay by card, UPI or wallet. The provider handles every method, 3-D Secure and bank failures, while your order service only stores a payment id and reacts to the webhook.',
        'Customers card, UPI ya wallet se pay karte hain. Provider har method, 3-D Secure aur bank failures sambhalta hai, jabki aapki order service sirf payment id rakhti hai aur webhook par react karti hai.',
      ),
      why: [
        bi('Many payment methods behind one integration.', 'Ek integration ke peeche kai payment methods.'),
        bi('Card data stays out of your systems.', 'Card data aapke systems se door rehta hai.'),
        bi('Idempotency and webhooks prevent double charges.', 'Idempotency aur webhooks dohre charge rokte hain.'),
      ],
    },
    avoidWhen: [
      bi('You treat a timeout as “failed” and charge again without an idempotency key.', 'Timeout ko “failed” maan kar bina idempotency key dobara charge karna.'),
      bi('You trust the browser’s redirect as proof of payment — always confirm server-side or by webhook.', 'Browser ke redirect ko payment ka saboot maanna — hamesha server-side ya webhook se confirm karo.'),
    ],
    decisions: [
      bi('Idempotency keys for every charge.', 'Har charge ke liye idempotency keys.'),
      bi('Webhooks for final status, plus reconciliation.', 'Final status ke liye webhooks, aur reconciliation.'),
    ],
    confusedWith: [
      { type: 'external-api', difference: bi('Every payment provider is an external API, but a payment provider has special rules: money, idempotency, webhooks and reconciliation.', 'Har payment provider external API hai, lekin payment provider ke khaas rules hain: paisa, idempotency, webhooks aur reconciliation.') },
    ],
    examples: ['Stripe', 'Razorpay', 'Adyen', 'PayPal'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'search-service',
    tagline: bi('The API that understands what users are looking for and asks the index.', 'Woh API jo samajhti hai user kya dhund raha hai aur index se poochti hai.'),
    intro: bi(
      'A search service is the application that sits between users and the search index. It takes the raw query (“iphne 15 case red”), fixes typos, applies filters, permissions and business rules (hide out-of-stock items, boost sponsored ones), queries the index, and formats the results.\n\nThe index stores and matches; the search service decides what “a good result” means for your product.',
      'Search service woh application hai jo users aur search index ke beech baithti hai. Yeh raw query (“iphne 15 case red”) leti hai, typos theek karti hai, filters, permissions aur business rules lagati hai (out-of-stock chhupao, sponsored boost karo), index ko query karti hai, aur results format karti hai.\n\nIndex store aur match karta hai; search service decide karti hai ki aapke product ke liye “achha result” kya hai.',
    ),
    problem: bi(
      'Clients queried the search engine directly. Every app built its own query syntax, private documents leaked into results because nothing checked permissions, and changing ranking rules meant updating every client.',
      'Clients seedha search engine ko query karte the. Har app ne apna query syntax banaya, permissions koi check nahi karta tha isliye private documents results mein leak hote, aur ranking rules badalne ka matlab har client update karna.',
    ),
    before: scene(
      [[c('web-client'), c('mobile-client')], [c('search-index', { note: 'exposed, no permissions', state: 'bad' })]],
      ['web-client!>search-index', 'mobile-client!>search-index'],
      bi('Clients hitting the index directly: no rules, no permission checks.', 'Clients seedha index par: na rules, na permission checks.'),
    ),
    solution: bi(
      'A search service exposes one simple API. It interprets queries, enforces permissions and ranking rules in one place, caches popular queries, and is the only thing that talks to the index.',
      'Search service ek simple API deti hai. Yeh queries samajhti hai, permissions aur ranking rules ek jagah laagu karti hai, popular queries cache karti hai, aur index se sirf yahi baat karti hai.',
    ),
    after: scene(
      [[c('web-client')], [c('api-gateway')], [c('search-service', { state: 'focus', note: 'typos · rules' })], [c('search-index'), c('distributed-cache', { label: 'Popular queries' })]],
      ['web-client>api-gateway', 'api-gateway>search-service', 'search-service>search-index', 'search-service>distributed-cache'],
      bi('One service owns query understanding and ranking; the index just matches.', 'Query samajhna aur ranking ek service ka; index bas match karta hai.'),
    ),
    steps: [
      bi('Receive the query and the user’s context (location, permissions).', 'Query aur user ka context (location, permissions) lo.'),
      bi('Normalise it: spelling correction, synonyms, detecting filters (“under 500”).', 'Normalise karo: spelling correction, synonyms, filters pehchanna (“500 ke neeche”).'),
      bi('Check a cache for popular queries.', 'Popular queries ke liye cache check karo.'),
      bi('Query the index, then apply business rules and permissions to the results.', 'Index ko query karo, phir results par business rules aur permissions lagao.'),
      bi('Return a page of results and log the query for analytics.', 'Results ka ek page lautaao aur analytics ke liye query log karo.'),
    ],
    analogy: {
      icons: ['Library', 'User', 'Search'],
      title: bi('A librarian at the help desk', 'Help desk par librarian'),
      text: bi(
        'You tell the librarian “that book about space by the astronaut, I think it was blue”. The librarian understands what you mean, checks the catalogue (the index), skips books you are not allowed to borrow, and hands you the three best matches.',
        'Aap librarian ko kehte ho “woh astronaut wali space ki book, shayad neeli thi”. Librarian samajhta hai aapka matlab, catalogue (index) dekhta hai, woh books chhodta hai jo aap le nahi sakte, aur teen best matches deta hai.',
      ),
    },
    perfectFit: {
      title: bi('Search inside a company’s documents', 'Company ke documents mein search'),
      text: bi(
        'Employees search across millions of documents but may only see the ones their team can access. The search service adds permission filters to every query and boosts recent documents, while the index does the matching.',
        'Employees lakhon documents mein search karte hain lekin sirf wahi dekh sakte hain jinka access unki team ko hai. Search service har query mein permission filters jodti hai aur recent documents boost karti hai, jabki matching index karta hai.',
      ),
      why: [
        bi('Permissions must be enforced on every query.', 'Har query par permissions laagu honi chahiye.'),
        bi('Ranking rules change often.', 'Ranking rules aksar badalte hain.'),
        bi('Many clients share the same search behaviour.', 'Kai clients same search behaviour share karte hain.'),
      ],
    },
    avoidWhen: [
      bi('There is no index behind it — it would have to scan the database (slow).', 'Iske peeche index nahi — ise database scan karna padega (slow).'),
      bi('You only need lookups by id — a normal service and database are enough.', 'Sirf id se lookups chahiye — normal service aur database kaafi hain.'),
    ],
    decisions: [
      bi('Instances and timeouts (search is latency-sensitive).', 'Instances aur timeouts (search latency-sensitive hai).'),
      bi('Whether to cache popular queries.', 'Popular queries cache karni hain ya nahi.'),
    ],
    confusedWith: [
      { type: 'search-index', difference: bi('The index is the data structure that finds matches; the search service is the brain that interprets and ranks.', 'Index woh data structure hai jo matches dhundta hai; search service woh dimaag hai jo samajhta aur rank karta hai.'), compare: 'search-index-vs-search-service-vs-sql' },
    ],
    examples: ['Custom search APIs on Elasticsearch', 'Algolia (hosted)', 'Vespa', 'Typesense'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'logging-service',
    tagline: bi('A searchable diary of what every service did — and why it failed.', 'Har service ne kya kiya — aur kyun fail hui — uski searchable diary.'),
    intro: bi(
      'A logging service collects log lines from all your services (“payment 551 failed: card declined”), stores them centrally and lets you search them: “show all errors for order 881 in the last hour”.\n\nWithout it, logs live on individual servers that may be gone by the time you look. With it, you can investigate any incident from one place.',
      'Logging service aapki saari services se log lines ikattha karti hai (“payment 551 failed: card declined”), unhe ek jagah store karti hai aur search karne deti hai: “pichhle ghante mein order 881 ke saare errors dikhao”.\n\nIske bina logs alag-alag servers par rehte hain jo dekhne tak shayad gayab ho chuke hon. Iske saath aap kisi bhi incident ki jaanch ek jagah se kar sakte ho.',
    ),
    problem: bi(
      'A customer reported a failed payment. Engineers had to SSH into twenty servers and grep files one by one — and the server that handled the request had already been replaced by autoscaling, taking its logs with it.',
      'Ek customer ne failed payment report kiya. Engineers ko bees servers mein SSH karke ek-ek file grep karni padi — aur jis server ne request handle ki thi use autoscaling pehle hi badal chuki thi, uske logs ke saath.',
    ),
    before: scene(
      [[a('eng', 'User', 'Engineer')], [c('app-server', { id: 's1', label: 'Server 1' }), c('app-server', { id: 's2', label: 'Server 2 (gone)', state: 'bad' })]],
      ['eng>s1', ['eng!>s2', 'logs lost']],
      bi('Logs scattered on servers — and lost when a server disappears.', 'Logs servers par bikhre — aur server gayab hone par kho gaye.'),
    ),
    solution: bi(
      'Each service ships its logs (structured, with request ids) to the logging service. Everything is indexed in one place with a retention period, so you can search across all services long after servers are gone.',
      'Har service apne logs (structured, request ids ke saath) logging service ko bhejti hai. Sab kuch retention period ke saath ek jagah index hota hai, taaki servers jaane ke kaafi baad bhi saari services mein search kar sako.',
    ),
    after: scene(
      [[c('app-server', { id: 's1', label: 'Server 1' }), c('app-server', { id: 's2', label: 'Server 2' })], [c('logging-service', { state: 'focus', note: 'kept 30 days' })], [a('eng', 'User', 'Engineer')]],
      ['s1~>logging-service', 's2~>logging-service', ['eng>logging-service', 'search “order 881”']],
      bi('All logs in one searchable place, kept even after servers are gone.', 'Saare logs ek searchable jagah, servers jaane ke baad bhi.'),
    ),
    steps: [
      bi('Services write structured logs (JSON) with a request id and user id.', 'Services request id aur user id ke saath structured logs (JSON) likhti hain.'),
      bi('An agent on each machine ships them to the logging service.', 'Har machine par ek agent unhe logging service ko bhejta hai.'),
      bi('Logs are indexed so you can search by any field and time range.', 'Logs index hote hain taaki kisi bhi field aur time range se search kar sako.'),
      bi('Old logs move to cheap storage or expire after the retention period.', 'Purane logs saste storage mein jaate hain ya retention period ke baad expire.'),
    ],
    analogy: {
      icons: ['Notebook', 'Search'],
      title: bi('A ship’s logbook', 'Jahaaz ki logbook'),
      text: bi(
        'The captain writes everything that happens into the logbook: time, position, weather, problems. When something goes wrong, investigators read the logbook to reconstruct exactly what happened, minute by minute.',
        'Captain jo kuch hota hai sab logbook mein likhta hai: time, position, mausam, problems. Kuch galat ho toh investigators logbook padhkar minute-by-minute bilkul kya hua yeh dobara bana lete hain.',
      ),
    },
    perfectFit: {
      title: bi('Investigating a customer complaint', 'Customer complaint ki jaanch'),
      text: bi(
        '“My order failed at 3:12 pm.” Search the logging service for that user and time window, follow the request id across services, and find the exact error line — in a minute instead of an afternoon.',
        '“Mera order 3:12 baje fail hua.” Logging service mein us user aur time window ko search karo, request id ko services mein follow karo, aur bilkul error line dhundho — ek dopahar ke bajaye ek minute mein.',
      ),
      why: [
        bi('You need the detailed story of specific events.', 'Khaas events ki detailed kahani chahiye.'),
        bi('Servers are short-lived.', 'Servers kam umr ke hain.'),
        bi('Many services are involved in one request.', 'Ek request mein kai services shaamil hain.'),
      ],
    },
    avoidWhen: [
      bi('You want trends and alerts (“error rate above 1%”) — metrics are cheaper and faster for that.', 'Trends aur alerts chahiye (“error rate 1% se upar”) — iske liye metrics saste aur tez hain.'),
      bi('You log passwords, card numbers or tokens — logs are read by many people.', 'Passwords, card numbers ya tokens log karna — logs bahut log padhte hain.'),
    ],
    decisions: [
      bi('Retention: hours, days, weeks or forever (cost!).', 'Retention: hours, days, weeks ya forever (kharcha!).'),
      bi('What to log and in which structure.', 'Kya log karna hai aur kis structure mein.'),
    ],
    confusedWith: [
      { type: 'metrics-monitoring', difference: bi('Logs are detailed stories of individual events; metrics are numbers over time (counts, latencies) for dashboards and alerts.', 'Logs individual events ki detailed kahaniyan hain; metrics time ke saath numbers (counts, latencies) hain dashboards aur alerts ke liye.'), compare: 'logs-vs-metrics-vs-traces' },
      { type: 'distributed-tracing', difference: bi('Logs say what happened inside a service; a trace shows the path and timing of one request across services.', 'Logs batate hain ek service ke andar kya hua; trace ek request ka services mein raasta aur timing dikhata hai.'), compare: 'logs-vs-metrics-vs-traces' },
    ],
    examples: ['Elastic Stack (ELK)', 'Grafana Loki', 'Splunk', 'Datadog Logs'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'metrics-monitoring',
    tagline: bi('The dashboard and alarm system for your system’s health.', 'Aapke system ki sehat ka dashboard aur alarm system.'),
    intro: bi(
      'Metrics & monitoring collects numbers over time from every component — requests per second, error rate, latency, CPU, queue length — draws them on dashboards and fires alerts when something crosses a threshold (“p99 latency above 800 ms for 5 minutes”).\n\nMetrics are small and cheap, so you can keep them for everything. They tell you that something is wrong, and roughly where; logs and traces then tell you why.',
      'Metrics & monitoring har component se time ke saath numbers ikattha karta hai — requests per second, error rate, latency, CPU, queue length — unhe dashboards par dikhata hai aur koi threshold paar hone par alerts bajata hai (“5 minute tak p99 latency 800 ms se upar”).\n\nMetrics chhote aur saste hain, isliye har cheez ke liye rakh sakte ho. Yeh batate hain ki kuch gadbad hai, aur lagbhag kahan; phir logs aur traces batate hain kyun.',
    ),
    problem: bi(
      'The team learned about outages from angry customers on social media. Nobody could tell whether the site was getting slower, which service was failing, or whether last night’s deploy changed anything.',
      'Team ko outages ka pata social media par naraz customers se chalta tha. Koi nahi bata sakta tha ki site slow ho rahi hai, kaunsi service fail ho rahi hai, ya kal raat ke deploy se kuch badla.',
    ),
    before: scene(
      [[c('app-server', { note: 'errors rising…', state: 'bad' })], [a('team', 'Users', 'Team', { note: 'no idea', state: 'muted' })], [a('tweet', 'MessageCircle', 'Angry tweets', { state: 'bad' })]],
      ['app-server.>team', 'tweet!>team'],
      bi('No visibility: customers notice problems before the team does.', 'Kuch dikhta nahi: customers team se pehle problems dekh lete hain.'),
    ),
    solution: bi(
      'Every component reports metrics; dashboards show health at a glance, and alerts page the on-call engineer the moment error rates or latency rise — usually before customers notice.',
      'Har component metrics report karta hai; dashboards ek nazar mein sehat dikhate hain, aur error rate ya latency badhte hi alerts on-call engineer ko page karte hain — aam taur par customers ke notice karne se pehle.',
    ),
    after: scene(
      [[c('app-server'), c('sql-db'), c('message-queue')], [c('metrics-monitoring', { state: 'focus', note: 'dashboards · alerts' })], [a('oncall', 'Siren', 'On-call alert')]],
      ['app-server~>metrics-monitoring', 'sql-db~>metrics-monitoring', 'message-queue~>metrics-monitoring', ['metrics-monitoring>oncall', 'p99 > 800 ms']],
      bi('Numbers from every component become dashboards and early alarms.', 'Har component ke numbers dashboards aur jaldi ke alarms bante hain.'),
    ),
    steps: [
      bi('Each service exposes counters and timers (requests, errors, latency).', 'Har service counters aur timers deti hai (requests, errors, latency).'),
      bi('The monitoring system collects them every few seconds into a time-series store.', 'Monitoring system har kuch seconds mein unhe time-series store mein ikattha karta hai.'),
      bi('Dashboards plot them; you compare before and after a deploy.', 'Dashboards unhe plot karte hain; aap deploy se pehle aur baad ki tulna karte ho.'),
      bi('Alert rules watch thresholds and notify the on-call engineer.', 'Alert rules thresholds dekhte hain aur on-call engineer ko notify karte hain.'),
    ],
    analogy: {
      icons: ['Gauge', 'HeartPulse', 'Siren'],
      title: bi('A car’s dashboard and warning lights', 'Gaadi ka dashboard aur warning lights'),
      text: bi(
        'You do not open the bonnet every few kilometres. The dashboard shows speed, fuel and temperature, and a warning light comes on when the engine overheats. It tells you something is wrong; the mechanic (logs and traces) finds out exactly what.',
        'Aap har kuch kilometre par bonnet nahi kholte. Dashboard speed, fuel aur temperature dikhata hai, aur engine garam ho toh warning light jalti hai. Yeh batata hai kuch gadbad hai; mechanic (logs aur traces) pata lagata hai bilkul kya.',
      ),
    },
    perfectFit: {
      title: bi('Catching a bad deploy early', 'Kharab deploy ko jaldi pakadna'),
      text: bi(
        'Right after a deploy, the error rate on the checkout service jumps from 0.1% to 4%. An alert fires within two minutes, the dashboard shows the spike lines up with the deploy, and the team rolls back before most customers notice.',
        'Deploy ke turant baad checkout service ka error rate 0.1% se 4% ho jaata hai. Do minute mein alert bajta hai, dashboard dikhata hai ki spike deploy ke saath mel khaata hai, aur zyada tar customers ke notice karne se pehle team rollback kar deti hai.',
      ),
      why: [
        bi('You need to know “is it healthy?” at all times.', 'Hamesha jaanna hai “kya yeh healthy hai?”'),
        bi('Trends over time matter.', 'Time ke saath trends zaroori hain.'),
        bi('Alerts must fire before customers complain.', 'Customers ke shikayat karne se pehle alerts bajne chahiye.'),
      ],
    },
    avoidWhen: [
      bi('You want the full details of one failed request — use logs and traces.', 'Ek fail request ki poori details chahiye — logs aur traces use karo.'),
      bi('You add a label with millions of values (user id) to every metric — costs explode.', 'Har metric par lakhon values wala label (user id) lagana — kharcha phat jaata hai.'),
    ],
    decisions: [
      bi('Retention and resolution of stored metrics.', 'Stored metrics ki retention aur resolution.'),
      bi('Which alerts wake someone up, and which are only dashboards.', 'Kaunse alerts kisi ko jagayenge, aur kaunse sirf dashboards.'),
    ],
    confusedWith: [
      { type: 'logging-service', difference: bi('Metrics are cheap numbers for trends and alerts; logs are detailed text for investigating specific events.', 'Metrics trends aur alerts ke liye saste numbers hain; logs khaas events ki jaanch ke liye detailed text.'), compare: 'logs-vs-metrics-vs-traces' },
      { type: 'time-series-db', difference: bi('Monitoring is the whole system (collection, dashboards, alerts); a time-series DB is the storage engine underneath.', 'Monitoring poora system hai (collection, dashboards, alerts); time-series DB neeche ka storage engine hai.') },
    ],
    examples: ['Prometheus + Grafana', 'Datadog', 'Amazon CloudWatch', 'New Relic'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'distributed-tracing',
    tagline: bi('Follows one request through every service and shows where the time went.', 'Ek request ko har service mein follow karke dikhata hai time kahan gaya.'),
    intro: bi(
      'In a microservice system one click can touch ten services. Distributed tracing gives each request a trace id that travels with it. Every service records a “span” — when it started, how long it took, what it called — and the tracing system stitches spans into a timeline.\n\nYou can then see that a slow checkout spent 1.8 seconds waiting on the tax service, not in your code.',
      'Microservice system mein ek click das services ko chhoo sakta hai. Distributed tracing har request ko ek trace id deta hai jo uske saath chalti hai. Har service ek “span” record karti hai — kab shuru hua, kitna time laga, kise call kiya — aur tracing system spans ko timeline mein jodta hai.\n\nPhir aap dekh sakte ho ki slow checkout ne 1.8 seconds tax service ka wait kiya, aapke code mein nahi.',
    ),
    problem: bi(
      'Checkout took four seconds, but every team’s dashboard looked fine. Each service only saw its own part, so nobody could tell which of the ten calls in the chain was the slow one.',
      'Checkout mein chaar seconds lagte the, lekin har team ka dashboard theek dikhta. Har service sirf apna hissa dekhti thi, isliye koi nahi bata sakta tha chain ki das calls mein se kaunsi slow thi.',
    ),
    before: scene(
      [[c('api-gateway', { note: '4 s total' })], [c('microservice', { id: 'cart', label: 'Cart', note: 'looks fine' }), c('microservice', { id: 'tax', label: 'Tax', note: 'looks fine' })], [c('microservice', { id: 'inv', label: 'Inventory', note: 'looks fine' })]],
      ['api-gateway>cart', 'api-gateway>tax', 'cart>inv'],
      bi('Each service looks healthy alone; the slow hop is invisible.', 'Har service akele healthy dikhti hai; slow hop dikhta nahi.'),
    ),
    solution: bi(
      'With tracing, every hop records a span tagged with the same trace id. The tracing system shows the whole request as a waterfall, and the 1.8-second tax call stands out immediately.',
      'Tracing ke saath har hop same trace id wala span record karta hai. Tracing system poori request ko waterfall ki tarah dikhata hai, aur 1.8 second ki tax call turant dikh jaati hai.',
    ),
    after: scene(
      [[c('api-gateway')], [c('microservice', { id: 'cart', label: 'Cart', note: '120 ms' }), c('microservice', { id: 'tax', label: 'Tax', note: '1,800 ms', state: 'bad' })], [c('distributed-tracing', { state: 'focus', note: 'one timeline' })]],
      [['api-gateway>cart', 'trace 7f3'], ['api-gateway>tax', 'trace 7f3'], 'cart~>distributed-tracing', 'tax~>distributed-tracing'],
      bi('Spans with one trace id form a timeline that reveals the slow hop.', 'Ek trace id wale spans timeline banate hain jo slow hop dikhati hai.'),
    ),
    steps: [
      bi('The first service creates a trace id for the request.', 'Pehli service request ke liye trace id banati hai.'),
      bi('Every outgoing call carries the trace id in a header.', 'Har outgoing call header mein trace id le jaati hai.'),
      bi('Each service records a span: start time, duration, errors, called services.', 'Har service span record karti hai: start time, duration, errors, call ki gayi services.'),
      bi('Spans are sent (usually sampled) to the tracing backend.', 'Spans (aam taur par sampled) tracing backend ko bheje jaate hain.'),
      bi('The UI shows the request as a waterfall you can inspect.', 'UI request ko waterfall ki tarah dikhata hai jise jaanch sakte ho.'),
    ],
    analogy: {
      icons: ['Package', 'MapPin', 'Truck'],
      title: bi('Parcel tracking', 'Parcel ki tracking'),
      text: bi(
        'A parcel gets one tracking number. Every hub scans it: “arrived Delhi 10:02, left 10:40, arrived Jaipur 18:15”. When the parcel is late, you look at the scans and see it sat in one hub for six hours.\n\nThe tracking number is the trace id; each scan is a span.',
        'Parcel ko ek tracking number milta hai. Har hub use scan karta hai: “Delhi 10:02 pahuncha, 10:40 nikla, Jaipur 18:15 pahuncha”. Parcel late ho toh scans dekhkar pata chalta hai ki woh ek hub mein chhe ghante pada raha.\n\nTracking number trace id hai; har scan ek span hai.',
      ),
    },
    perfectFit: {
      title: bi('Finding a slow dependency in microservices', 'Microservices mein slow dependency dhundna'),
      text: bi(
        'A checkout touches the gateway, cart, pricing, tax, inventory and payments. Tracing shows the exact hop where latency appears and whether calls run in sequence that could run in parallel.',
        'Checkout gateway, cart, pricing, tax, inventory aur payments ko chhoota hai. Tracing bilkul woh hop dikhata hai jahan latency aati hai, aur kya woh calls ek ke baad ek chal rahi hain jo parallel chal sakti thi.',
      ),
      why: [
        bi('Requests cross many services.', 'Requests kai services paar karti hain.'),
        bi('Latency problems hide between services.', 'Latency problems services ke beech chhupti hain.'),
        bi('Per-service dashboards cannot show the whole path.', 'Per-service dashboards poora raasta nahi dikha sakte.'),
      ],
    },
    avoidWhen: [
      bi('You have one monolith and one database — logs and metrics already tell the story.', 'Ek monolith aur ek database hai — logs aur metrics pehle hi kahani bata dete hain.'),
      bi('You store every span of every request at huge volume without sampling — costs explode.', 'Bina sampling bahut volume mein har request ka har span store karna — kharcha phat jaata hai.'),
    ],
    decisions: [
      bi('Sampling rate (and keeping all error traces).', 'Sampling rate (aur saare error traces rakhna).'),
      bi('Retention of traces.', 'Traces ki retention.'),
    ],
    confusedWith: [
      { type: 'logging-service', difference: bi('Logs describe what one service did; traces connect one request across all services with timings.', 'Logs ek service ka kaam batate hain; traces ek request ko timings ke saath saari services mein jodte hain.'), compare: 'logs-vs-metrics-vs-traces' },
      { type: 'metrics-monitoring', difference: bi('Metrics tell you latency went up overall; a trace shows exactly which hop of which request was slow.', 'Metrics batate hain overall latency badhi; trace bilkul dikhata hai kis request ka kaunsa hop slow tha.'), compare: 'logs-vs-metrics-vs-traces' },
    ],
    examples: ['OpenTelemetry', 'Jaeger', 'Zipkin', 'AWS X-Ray'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'secrets-manager',
    tagline: bi('A locked vault for passwords and keys, handed out only to the services that need them.', 'Passwords aur keys ki band tijori, sirf zaroorat wali services ko di jaati hai.'),
    intro: bi(
      'A secrets manager stores sensitive values — database passwords, API keys, signing keys — encrypted, with strict access control and an audit log of who read what. Services fetch secrets at start-up (or on demand) instead of having them written in code or config files.\n\nIt can also rotate secrets automatically: create a new password, update the database, and let services pick up the new one — without a human ever seeing it.',
      'Secrets manager sensitive values — database passwords, API keys, signing keys — encrypted rakhta hai, sakht access control aur kisne kya padha uske audit log ke saath. Services secrets ko code ya config files mein likhne ke bajaye start-up par (ya zaroorat par) laati hain.\n\nYeh secrets apne aap rotate bhi kar sakta hai: naya password banao, database update karo, aur services naya utha lein — bina kisi insaan ke dekhe.',
    ),
    problem: bi(
      'The database password was written in a config file in the code repository. Every developer could read it, it was copied to laptops, and when it leaked nobody knew who had it — changing it meant a risky manual update of every service.',
      'Database password code repository ki config file mein likha tha. Har developer padh sakta tha, laptops par copy hota tha, aur leak hua toh pata nahi kiske paas tha — badalne ka matlab har service ka risky manual update.',
    ),
    before: scene(
      [[a('repo', 'Code', 'Code repo', { note: 'DB_PASS=hunter2', state: 'bad' })], [a('dev', 'Laptop', 'Every laptop', { state: 'bad' }), c('app-server')], [c('sql-db')]],
      ['repo!>dev', 'repo>app-server', 'app-server>sql-db'],
      bi('Secrets in code spread everywhere and can never be truly revoked.', 'Code mein secrets har jagah phail jaate hain aur kabhi sach mein revoke nahi hote.'),
    ),
    solution: bi(
      'The password lives only in the secrets manager. The app server, using its own identity, is allowed to read exactly that secret; every read is logged, and the secret is rotated every 30 days automatically.',
      'Password sirf secrets manager mein rehta hai. App server apni identity se bilkul wahi secret padh sakta hai; har read log hota hai, aur secret har 30 din apne aap rotate hota hai.',
    ),
    after: scene(
      [[c('app-server')], [c('secrets-manager', { state: 'focus', note: 'rotates every 30 days' })], [c('sql-db')]],
      [['app-server>secrets-manager', 'read DB password'], 'app-server>sql-db', ['secrets-manager.>sql-db', 'rotate']],
      bi('Services fetch secrets at runtime; rotation happens without humans.', 'Services runtime par secrets laati hain; rotation bina insaanon ke hota hai.'),
    ),
    steps: [
      bi('An admin stores a secret; it is encrypted at rest.', 'Admin secret store karta hai; woh encrypted rehta hai.'),
      bi('Access policies say which service identity may read which secret.', 'Access policies batati hain kaunsi service identity kaunsa secret padh sakti hai.'),
      bi('At start-up the service authenticates and fetches the secret into memory.', 'Start-up par service authenticate karke secret memory mein laati hai.'),
      bi('Every access is logged for audits.', 'Har access audit ke liye log hota hai.'),
      bi('Rotation creates a new value and updates the target system on a schedule.', 'Rotation schedule par nayi value banata hai aur target system update karta hai.'),
    ],
    analogy: {
      icons: ['Hotel', 'KeyRound', 'Lock'],
      title: bi('The hotel’s key cabinet', 'Hotel ki chaabi wali almari'),
      text: bi(
        'Room keys are not left under doormats. They sit in a locked cabinet; staff sign them out with their badge, the system records who took which key, and the locks are re-keyed regularly so old copies stop working.',
        'Room ki chaabiyan doormat ke neeche nahi chhodi jaati. Woh band almari mein rehti hain; staff badge se nikalta hai, system record karta hai kisne kaunsi chaabi li, aur taale niyamit roop se badle jaate hain taaki purani copies kaam karna band kar dein.',
      ),
    },
    perfectFit: {
      title: bi('Database passwords and payment API keys', 'Database passwords aur payment API keys'),
      text: bi(
        'A payments service needs its database password and the provider’s secret key. Both live in the secrets manager; only that service can read them, reads are audited, and the database password rotates monthly with zero downtime.',
        'Payments service ko apna database password aur provider ki secret key chahiye. Dono secrets manager mein; sirf wahi service padh sakti hai, reads audit hote hain, aur database password har mahine bina downtime rotate hota hai.',
      ),
      why: [
        bi('Leaking the value would be very costly.', 'Value leak hona bahut mehenga padega.'),
        bi('Only specific services should read it.', 'Sirf khaas services ko padhna chahiye.'),
        bi('It must change regularly.', 'Ise niyamit badalna chahiye.'),
      ],
    },
    avoidWhen: [
      bi('The value is not secret (feature flags, timeouts) — use a configuration service.', 'Value secret nahi hai (feature flags, timeouts) — configuration service use karo.'),
      bi('You fetch the secret on every single request — cache it in memory with a refresh.', 'Har ek request par secret laana — refresh ke saath memory mein cache karo.'),
    ],
    decisions: [
      bi('Whether automatic rotation is enabled.', 'Automatic rotation enable hai ya nahi.'),
      bi('Which services may read which secrets.', 'Kaunsi services kaunse secrets padh sakti hain.'),
    ],
    confusedWith: [
      { type: 'config-service', difference: bi('Config holds non-secret settings everyone may read; the secrets manager holds sensitive values with strict access and audits.', 'Config non-secret settings rakhta hai jo sab padh sakte hain; secrets manager sensitive values sakht access aur audits ke saath.'), compare: 'config-vs-secrets-vs-coordination' },
    ],
    examples: ['AWS Secrets Manager', 'HashiCorp Vault', 'Google Secret Manager', 'Azure Key Vault'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'config-service',
    tagline: bi('A central control panel for settings you can change without redeploying.', 'Settings ka central control panel jinhe bina redeploy badal sakte ho.'),
    intro: bi(
      'A configuration service stores runtime settings — feature flags, timeouts, limits, experiment switches, ranking weights — and delivers them to services, often pushing changes within seconds.\n\nInstead of editing code and redeploying 40 services to change a timeout, you change one value centrally, roll it out gradually, and roll it back instantly if something breaks.',
      'Configuration service runtime settings rakhti hai — feature flags, timeouts, limits, experiment switches, ranking weights — aur unhe services tak pahunchati hai, aksar seconds mein changes push karke.\n\n40 services ka timeout badalne ke liye code edit karke redeploy karne ke bajaye, aap ek value centrally badalte ho, dheere-dheere roll out karte ho, aur kuch toote toh turant rollback.',
    ),
    problem: bi(
      'Turning off a broken feature during an incident required a code change, review, build and deploy across many services — 45 minutes while customers saw errors.',
      'Incident ke dauran tooti feature band karne ke liye code change, review, build aur kai services par deploy chahiye tha — 45 minute jab tak customers errors dekhte rahe.',
    ),
    before: scene(
      [[a('eng', 'User', 'Engineer')], [a('deploy', 'Rocket', 'Build + deploy', { note: '45 minutes', state: 'bad' })], [c('microservice', { id: 's1', label: 'Service A' }), c('microservice', { id: 's2', label: 'Service B' })]],
      ['eng>deploy', 'deploy>s1', 'deploy>s2'],
      bi('Changing a setting means redeploying everything.', 'Ek setting badalne ka matlab sab redeploy karna.'),
    ),
    solution: bi(
      'Services read settings from the config service and subscribe to changes. Flip “new_checkout = off” once and every service applies it within seconds, with an audit trail and the option to roll out to 1% first.',
      'Services config service se settings padhti hain aur changes subscribe karti hain. “new_checkout = off” ek baar flip karo aur har service seconds mein laagu karti hai, audit trail aur pehle 1% ko roll out karne ke option ke saath.',
    ),
    after: scene(
      [[a('eng', 'User', 'Engineer')], [c('config-service', { state: 'focus', note: 'new_checkout = off' })], [c('microservice', { id: 's1', label: 'Service A', state: 'good' }), c('microservice', { id: 's2', label: 'Service B', state: 'good' })]],
      ['eng>config-service', ['config-service~>s1', 'push'], ['config-service~>s2', 'push']],
      bi('Change once, applied everywhere in seconds — no deploy.', 'Ek baar badlo, seconds mein har jagah laagu — bina deploy.'),
    ),
    steps: [
      bi('Settings are stored centrally with versions and an audit log.', 'Settings versions aur audit log ke saath central store hoti hain.'),
      bi('Services load them at start-up and cache them locally.', 'Services start-up par unhe load karke local cache karti hain.'),
      bi('Changes are pushed (or polled) and applied without a restart.', 'Changes push (ya poll) hote hain aur bina restart laagu hote hain.'),
      bi('Risky changes roll out gradually and can be rolled back instantly.', 'Risky changes dheere-dheere roll out hote hain aur turant rollback ho sakte hain.'),
      bi('If the config service is down, services keep using their last good copy.', 'Config service down ho toh services apni aakhri sahi copy use karti rehti hain.'),
    ],
    analogy: {
      icons: ['Lamp', 'Lightbulb', 'House'],
      title: bi('The light switches in a building', 'Building ke light switches'),
      text: bi(
        'You do not rewire the building to turn the corridor lights off at night. There is a switch panel at reception, and flipping a switch changes every floor at once. Rewiring (redeploying) is for real changes; switches (config) are for settings.',
        'Raat ko corridor lights band karne ke liye building ki wiring nahi badalte. Reception par switch panel hai, aur switch dabane se har floor ek saath badal jaata hai. Rewiring (redeploy) asli changes ke liye hai; switches (config) settings ke liye.',
      ),
    },
    perfectFit: {
      title: bi('A kill switch for a new feature', 'Nayi feature ka kill switch'),
      text: bi(
        'A new recommendation widget launches to 5% of users. Error rates rise, so the team sets its flag to 0% — every server stops showing it within seconds, no deploy needed.',
        'Naya recommendation widget 5% users ke liye launch hota hai. Error rates badhte hain, toh team uska flag 0% kar deti hai — har server seconds mein dikhana band kar deta hai, bina deploy.',
      ),
      why: [
        bi('The setting must change quickly and safely.', 'Setting jaldi aur safely badalni chahiye.'),
        bi('Many services read the same value.', 'Kai services same value padhti hain.'),
        bi('Gradual rollout and instant rollback are needed.', 'Dheere rollout aur turant rollback chahiye.'),
      ],
    },
    avoidWhen: [
      bi('The value is a password or key — use a secrets manager.', 'Value password ya key hai — secrets manager use karo.'),
      bi('You need distributed locks or leader election — that is a coordination service.', 'Distributed locks ya leader election chahiye — yeh coordination service hai.'),
      bi('Services fail to start when it is unreachable — always keep a last-known-good copy.', 'Yeh unreachable ho toh services start na hon — hamesha last-known-good copy rakho.'),
    ],
    decisions: [
      bi('Propagation: polling, push or streaming.', 'Propagation: polling, push ya streaming.'),
      bi('Availability: managed HA or active-passive.', 'Availability: managed HA ya active-passive.'),
    ],
    confusedWith: [
      { type: 'secrets-manager', difference: bi('Config is for ordinary settings; secrets need encryption, strict access and rotation.', 'Config aam settings ke liye hai; secrets ko encryption, sakht access aur rotation chahiye.'), compare: 'config-vs-secrets-vs-coordination' },
      { type: 'coordination-service', difference: bi('A config service distributes values; a coordination service provides consensus primitives like locks and leader election.', 'Config service values baantti hai; coordination service locks aur leader election jaise consensus primitives deti hai.'), compare: 'config-vs-secrets-vs-coordination' },
    ],
    examples: ['LaunchDarkly', 'AWS AppConfig', 'Consul KV', 'Unleash'],
  },
];
