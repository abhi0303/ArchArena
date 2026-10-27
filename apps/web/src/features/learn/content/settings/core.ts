import { bi } from '../../dsl';
import type { SettingGuide } from '../../types';

/** Scaling & availability, reliability, and traffic routing settings. */
export const coreSettings: SettingGuide[] = [
  // ───────────────────────── Scaling & availability ─────────────────────────
  {
    key: 'role',
    what: bi(
      'One short sentence, in your own words, saying what this box is responsible for. For example: “Booking service: creates and cancels bookings”.',
      'Ek chhota sa sentence, aapke apne shabdon mein, jo batata hai ki yeh box kis kaam ka zimmedar hai. Jaise: “Booking service: bookings banata aur cancel karta hai”.',
    ),
    why: bi(
      'A diagram where five boxes are all called “App Server” is hard to follow. Writing each box’s job makes the design easy to read, and it forces you to decide which service owns which data.',
      'Agar diagram mein paanch boxes ka naam “App Server” hai to kuch samajh nahi aata. Har box ka kaam likhne se design padhna aasaan ho jaata hai, aur yeh bhi decide ho jaata hai ki kaunsa data kis service ka hai.',
    ),
    example: bi(
      'In a hospital every doctor wears a white coat, but the badge says “Cardiologist” or “Radiologist”. That badge is the role: you know at once whom to ask about what.',
      'Hospital mein har doctor white coat pehenta hai, par badge pe likha hota hai “Cardiologist” ya “Radiologist”. Woh badge hi role hai: turant pata chal jaata hai ki kis baat ke liye kisse poochna hai.',
    ),
    goodValues: bi(
      '“Order service: owns orders and their status”, “Feed builder”, “Primary DB for user accounts”.',
      '“Order service: orders aur unka status iske paas”, “Feed builder”, “User accounts ka primary DB”.',
    ),
    inChallenges: bi(
      'It earns no points on its own, but it makes your diagram and your results page much easier to read. Put a short title in Name and the job in Responsibility.',
      'Iske alag se points nahi milte, par isse aapka diagram aur results page padhna bahut aasaan ho jaata hai. Chhota title Name mein likho aur kaam Responsibility mein.',
    ),
  },
  {
    key: 'instances',
    what: bi(
      'How many copies of this service run at the same time. Every copy runs the same code and can handle requests.',
      'Is service ki kitni copies ek saath chal rahi hain. Har copy same code chalati hai aur requests handle kar sakti hai.',
    ),
    why: bi(
      'With one copy, a crash, a bad deploy or a busy moment takes the whole feature down — a “single point of failure”. More copies share the load and cover for each other.',
      'Ek hi copy ho to crash, galat deploy ya bheed wala time — poora feature band. Isse “single point of failure” kehte hain. Zyada copies load baant leti hain aur ek doosre ko cover karti hain.',
    ),
    example: bi(
      'A supermarket with one billing counter stops completely when that cashier goes on a break. With four counters, one break does not matter. A smart manager opens extra counters when the queue gets long and closes them at night — that is autoscaling.',
      'Supermarket mein ek hi billing counter ho aur cashier break pe chala jaaye to sab ruk jaata hai. Chaar counter hon to ek ke break se fark nahi padta. Smart manager line lambi hone pe extra counter khol deta hai aur raat ko band kar deta hai — yahi autoscaling hai.',
    ),
    options: {
      single: bi(
        'Exactly one copy. Simple and cheap, but if it crashes or restarts, this part of the system is down. Fine for a prototype or an internal tool nobody depends on.',
        'Sirf ek copy. Simple aur sasta, par crash ya restart hua to system ka yeh hissa band. Prototype ya aise internal tool ke liye theek hai jis pe koi depend nahi karta.',
      ),
      multiple: bi(
        'A fixed number of copies (2 or more), usually behind a load balancer. If one dies, the others keep serving. A good default for anything users rely on.',
        'Fixed number of copies (2 ya zyada), aam taur pe load balancer ke peeche. Ek mar jaaye to baaki serve karte rehte hain. Jis cheez pe users depend karte hain, uske liye accha default.',
      ),
      autoscaled: bi(
        'The number of copies grows and shrinks automatically with load (CPU, requests per second). Best when traffic changes during the day or has spikes, like a sale or a big match. The service should be stateless so new copies can help immediately.',
        'Load (CPU, requests per second) ke hisaab se copies apne aap badhti-ghatti hain. Jab traffic din bhar badalta ho ya sale/bade match jaise spikes aate hon, tab best. Service stateless honi chahiye taaki nayi copy turant kaam pe lag sake.',
      ),
    },
    inChallenges: bi(
      'Multiple or Autoscaled marks the component as redundant (not a single point of failure), which every “high availability” check looks for. Put a load balancer in front so traffic reaches every copy.',
      'Multiple ya Autoscaled chunne se component redundant maana jaata hai (single point of failure nahi), aur har “high availability” check yahi dekhta hai. Aage load balancer lagao taaki traffic har copy tak pahunche.',
    ),
  },
  {
    key: 'stateless',
    what: bi(
      'The service keeps nothing about a user in its own memory between requests. Sessions, carts and uploads live in a shared place such as a cache or a database.',
      'Service do requests ke beech user ke baare mein apni memory mein kuch nahi rakhti. Session, cart, uploads — sab ek shared jagah (cache ya database) mein rehte hain.',
    ),
    why: bi(
      'If server A remembers your login in memory and your next request lands on server B, B does not know you and you are logged out. Stateful servers make scaling, restarts and deployments painful.',
      'Agar server A aapka login apni memory mein rakhe aur agli request server B pe jaaye, to B aapko pehchanta hi nahi — aap logout. Stateful servers ke saath scaling, restart aur deploy sab mushkil ho jaata hai.',
    ),
    example: bi(
      'At a bank, a teller who looks up your account in the central system can serve you at any counter. A teller who keeps your details only in their head is useless once they go on lunch — you start again from zero.',
      'Bank mein jo teller har baar central system mein aapka account dekhta hai, woh kisi bhi counter pe aapko serve kar sakta hai. Jo teller aapki details sirf apne dimaag mein rakhe, uske lunch pe jaate hi aapko zero se shuru karna padega.',
    ),
    options: {
      true: bi(
        'On: any copy can serve any request, so adding or removing copies is easy and a crash loses nothing.',
        'On: koi bhi copy koi bhi request serve kar sakti hai, isliye copies add/remove karna aasaan hai aur crash mein kuch nahi khota.',
      ),
      false: bi(
        'Off: the service keeps per-user data in memory. You then need “sticky” routing (IP hash), and losing a server loses that data.',
        'Off: service user ka data memory mein rakhti hai. Phir “sticky” routing (IP hash) chahiye, aur server gaya to woh data bhi gaya.',
      ),
    },
    inChallenges: bi(
      'Turn it on for app servers you scale out, and show where the state really lives (for example a connection to a distributed cache for sessions).',
      'Jin app servers ko aap scale out kar rahe ho unke liye ise on karo, aur dikhao ki state asal mein kahan hai (jaise sessions ke liye distributed cache se connection).',
    ),
  },
  {
    key: 'availability',
    what: bi(
      'How an entry-point component (load balancer, API gateway, reverse proxy, scheduler, config service) is protected from failing on its own.',
      'Entry-point component (load balancer, API gateway, reverse proxy, scheduler, config service) ko akele fail hone se kaise bachaya gaya hai.',
    ),
    why: bi(
      'Every request passes through these components. If your only load balancer dies, the site is down even though fifty healthy servers sit behind it.',
      'Har request in components se guzarti hai. Agar aapka akela load balancer mar gaya, to peeche pachaas healthy servers hone ke baawajood site band.',
    ),
    example: bi(
      'A building with a single entrance is closed the moment that door jams. A building with two doors and a guard at each keeps working. A mall whose management company guarantees the doors are always open is the “managed” option.',
      'Ek hi darwaze wali building us darwaze ke atakte hi band. Do darwaze aur har darwaze pe guard ho to kaam chalta rehta hai. Mall jiski management company guarantee deti hai ki darwaze hamesha khule rahenge — woh “managed” option hai.',
    ),
    options: {
      'managed-ha': bi(
        'A cloud-managed service (such as AWS ALB or Google Cloud Load Balancing) that runs on many machines behind the scenes and replaces broken ones for you. The best default.',
        'Cloud-managed service (jaise AWS ALB ya Google Cloud Load Balancing) jo peeche kai machines pe chalti hai aur kharab machine khud badal deti hai. Sabse accha default.',
      ),
      'active-passive': bi(
        'Two copies: one does the work, the other waits and takes over (through a floating IP or DNS) if the first fails. Classic for self-hosted Nginx or HAProxy, and for schedulers that must run each job only once.',
        'Do copies: ek kaam karti hai, doosri wait karti hai aur pehli fail ho to (floating IP ya DNS se) kaam sambhal leti hai. Self-hosted Nginx/HAProxy aur un schedulers ke liye classic jinhe har job sirf ek baar chalani hai.',
      ),
      'single-instance': bi(
        'One copy only. If it fails, everything behind it is unreachable — a single point of failure. Use only for demos.',
        'Sirf ek copy. Yeh fail hui to iske peeche sab kuch unreachable — single point of failure. Sirf demo ke liye.',
      ),
    },
    inChallenges: bi(
      'Load balancers and gateways count as highly available unless you choose Single instance. Managed/HA and Active-passive both count as redundant; several challenges check for one of them.',
      'Load balancer aur gateway tab tak highly available maane jaate hain jab tak aap Single instance na chuno. Managed/HA aur Active-passive dono redundant gine jaate hain; kai challenges inme se ek check karte hain.',
    ),
  },
  {
    key: 'deployment',
    what: bi(
      'Where in the world this component runs: in one cloud region, or in several regions (for example Mumbai and Singapore).',
      'Yeh component duniya mein kahan chalta hai: ek cloud region mein, ya kai regions mein (jaise Mumbai aur Singapore).',
    ),
    why: bi(
      'A whole region can go down (power, network or cloud outage), and users far from your region feel extra delay. Running in more regions fixes both, but costs more and makes data harder to keep in sync.',
      'Poora region down ho sakta hai (power, network ya cloud outage), aur region se door users ko extra delay mehsoos hota hai. Zyada regions mein chalane se dono theek hote hain, par kharcha badhta hai aur data sync rakhna mushkil hota hai.',
    ),
    example: bi(
      'A restaurant chain with one kitchen in Mumbai closes if Mumbai floods. A second kitchen in Pune that opens only during a flood is active-passive. Kitchens in both cities serving local customers every day is active-active.',
      'Restaurant chain ki ek hi kitchen Mumbai mein ho to Mumbai mein baadh aate hi sab band. Pune mein doosri kitchen jo sirf baadh mein khulti hai — active-passive. Dono shehron ki kitchens roz apne-apne customers ko serve karein — active-active.',
    ),
    options: {
      'single-region': bi(
        'Everything in one region (it can still use several zones inside that region). Simplest, cheapest and the most common. A full regional outage takes you down.',
        'Sab kuch ek region mein (us region ke andar kai zones use ho sakte hain). Sabse simple, sasta aur common. Poora region down hua to aap bhi down.',
      ),
      'multi-region-active-passive': bi(
        'One region serves all traffic; a second region keeps a copy of the data and takes over if the first fails. Failover takes minutes, and with asynchronous replication the last few writes can be lost.',
        'Ek region saara traffic serve karta hai; doosra region data ki copy rakhta hai aur pehla fail hone pe kaam sambhalta hai. Failover mein kuch minute lagte hain, aur async replication ho to aakhri kuch writes kho sakte hain.',
      ),
      'multi-region-active-active': bi(
        'Every region serves users at the same time. The lowest latency worldwide and a region loss is barely noticed, but the same record written in two regions at once can conflict. The hardest option to build.',
        'Har region ek saath users ko serve karta hai. Duniya bhar mein sabse kam latency aur ek region jaane pe pata bhi nahi chalta, par ek hi record do regions mein ek saath likha jaaye to conflict ho sakta hai. Banana sabse mushkil.',
      ),
    },
    inChallenges: bi(
      'Either multi-region option marks the component as redundant. Use it when the brief mentions global users, disaster recovery or surviving a region outage; most challenges do not need it.',
      'Dono multi-region options component ko redundant banate hain. Jab brief mein global users, disaster recovery ya region outage jhelne ki baat ho tab use karo; zyaadatar challenges ko iski zaroorat nahi.',
    ),
  },

  // ───────────────────────── Reliability ─────────────────────────
  {
    key: 'timeout',
    what: bi(
      'The longest a caller waits for this component to answer before giving up and moving on (with an error or a fallback).',
      'Caller is component ke jawab ka zyaada se zyaada kitna wait karega, phir haar maan ke aage badh jaayega (error ya fallback ke saath).',
    ),
    why: bi(
      'Without a timeout, one slow dependency keeps callers waiting forever. Their threads and connections pile up until the callers crash too — slowness spreads like a traffic jam. This is called a cascading failure.',
      'Timeout na ho to ek slow dependency callers ko hamesha wait karwati hai. Unke threads aur connections jamaa hote jaate hain jab tak caller bhi crash na ho jaaye — slowness traffic jam ki tarah failti hai. Ise cascading failure kehte hain.',
    ),
    example: bi(
      'When you call customer care and nobody answers in 30 seconds, you hang up and try later — you do not hold the phone all day.',
      'Customer care ko call kiya aur 30 second tak koi nahi utha raha, to aap phone rakh ke baad mein try karte ho — din bhar phone pakad ke nahi baithte.',
    ),
    options: {
      none: bi(
        'Wait forever. Dangerous: a single stuck dependency can freeze everything upstream.',
        'Hamesha wait karo. Khatarnak: ek atki hui dependency upar ka sab kuch freeze kar sakti hai.',
      ),
      short: bi(
        'Under one second. For fast calls on the user’s path (cache lookups, internal APIs). The user quickly gets an error or a fallback instead of a spinner.',
        'Ek second se kam. User ke raaste wali fast calls ke liye (cache lookup, internal APIs). User ko spinner ki jagah jaldi error ya fallback mil jaata hai.',
      ),
      standard: bi(
        'One to five seconds. Typical for ordinary API calls and database queries.',
        'Ek se paanch second. Normal API calls aur database queries ke liye typical.',
      ),
      long: bi(
        'More than five seconds. Only for calls that are truly slow (reports, big ML jobs, file processing) — and those are usually better done asynchronously through a queue.',
        'Paanch second se zyaada. Sirf sach mein slow calls ke liye (reports, bade ML jobs, file processing) — aur aisi calls aksar queue se async karna behtar hota hai.',
      ),
    },
    inChallenges: bi(
      'Challenges with strict latency targets check for a Short timeout (a few also accept Standard). Pair it with retries and a circuit breaker.',
      'Strict latency wale challenges Short timeout check karte hain (kuch Standard bhi maan lete hain). Ise retries aur circuit breaker ke saath use karo.',
    ),
  },
  {
    key: 'retryStrategy',
    what: bi(
      'What this component does when a call to another component fails: give up, try again after the same wait, or try again after waits that keep growing.',
      'Jab is component ki kisi doosre component ko call fail ho jaaye to yeh kya karta hai: chhod deta hai, same wait ke baad dobara try karta hai, ya har baar badhte wait ke baad.',
    ),
    why: bi(
      'Many failures are temporary — a network blip, a restart. A retry fixes them. But if every client retries instantly and together, they hammer a service that is already struggling. That is a retry storm.',
      'Bahut si failures temporary hoti hain — network blip, restart. Retry se theek ho jaati hain. Par agar har client turant aur ek saath retry kare, to pehle se pareshaan service pe hathoda pad jaata hai. Ise retry storm kehte hain.',
    ),
    example: bi(
      'If a shop is shut, you do not bang on the door every second. You come back after 1 minute, then 2, then 4 — and each customer picks a slightly random time (jitter) so they do not all arrive together when it opens.',
      'Dukaan band ho to aap har second darwaza nahi peet-te. 1 minute baad aate ho, phir 2, phir 4 — aur har customer thoda random time chunta hai (jitter) taaki khulte hi sab ek saath na toot padein.',
    ),
    options: {
      none: bi(
        'Fail on the first error. Fine when the user can simply try again, or for actions that are not safe to repeat.',
        'Pehli error pe hi fail. Tab theek jab user khud dobara try kar sake, ya action dobara karna safe na ho.',
      ),
      fixed: bi(
        'Retry after the same delay every time (say every second). Simple, but many clients retry in step and can flatten the dependency.',
        'Har baar same delay ke baad retry (jaise har second). Simple hai, par bahut saare clients ek hi taal pe retry karke dependency ko gira sakte hain.',
      ),
      'exponential-backoff': bi(
        'Each wait doubles (1 s, 2 s, 4 s…) plus a little random jitter, with a maximum number of attempts. The industry standard.',
        'Har wait double hota hai (1 s, 2 s, 4 s…) plus thoda random jitter, aur attempts ki ek limit. Industry standard.',
      ),
    },
    inChallenges: bi(
      'Choose Exponential backoff + jitter, and make the operation safe to repeat with Idempotency — otherwise a retry can charge a customer twice.',
      'Exponential backoff + jitter chuno, aur Idempotency se operation ko dobara karne layak safe banao — warna retry customer se do baar paise kaat sakta hai.',
    ),
  },
  {
    key: 'circuitBreaker',
    what: bi(
      'A safety switch in front of calls to a dependency. When too many calls fail, it “trips” and fails fast for a while; then it lets a few test calls through to see whether the dependency has recovered.',
      'Dependency ki calls ke aage ek safety switch. Jab bahut saari calls fail hoti hain, yeh “trip” ho jaata hai aur kuch der turant fail karta hai; phir kuch test calls bhej ke dekhta hai ki dependency theek hui ya nahi.',
    ),
    why: bi(
      'Without it, every request keeps waiting on a dead service, wasting threads and time — and the constant traffic stops the dead service from recovering.',
      'Iske bina har request ek mari hui service pe wait karti rehti hai, threads aur time barbaad — aur lagaataar traffic us service ko theek bhi nahi hone deta.',
    ),
    example: bi(
      'The circuit breaker in your home: on a short circuit it cuts power at once instead of letting the wires burn. Once the fault is fixed, you switch it back on.',
      'Ghar ka circuit breaker (MCB): short circuit hote hi bijli kaat deta hai, wires jalne nahi deta. Fault theek hone ke baad aap use wapas on kar dete ho.',
    ),
    options: {
      true: bi(
        'On: a failing dependency is cut off quickly, and users get a fast fallback (for example “recommendations unavailable”) instead of a hanging page.',
        'On: fail hoti dependency jaldi kaat di jaati hai, aur users ko latakta page nahi balki fast fallback milta hai (jaise “recommendations abhi available nahi”).',
      ),
      false: bi(
        'Off: the service keeps calling a failing dependency and waits on every call.',
        'Off: service fail hoti dependency ko call karti rehti hai aur har call pe wait karti hai.',
      ),
    },
    inChallenges: bi(
      'Several challenges check for it when a service calls something slow or flaky (a payment provider, an ML service, a third-party API). Turn it on for the service that makes the call.',
      'Jab koi service kisi slow ya unreliable cheez ko call karti hai (payment provider, ML service, third-party API) to kai challenges ise check karte hain. Call karne wali service mein ise on karo.',
    ),
  },
  {
    key: 'idempotency',
    what: bi(
      'A guarantee that doing the same request twice has the same effect as doing it once.',
      'Guarantee ki same request do baar karne ka asar utna hi ho jitna ek baar karne ka.',
    ),
    why: bi(
      'Networks lose responses, and clients and queues retry. Without idempotency a retried “pay ₹500” charges twice and a retried “send notification” sends two.',
      'Network responses kho deta hai, aur clients aur queues retry karte hain. Idempotency na ho to retry hua “₹500 pay karo” do baar paise kaatega aur retry hua “notification bhejo” do notification bhejega.',
    ),
    example: bi(
      'A lift button: pressing it five times still calls the lift once. A vending machine without that protection would drop five drinks and charge you five times.',
      'Lift ka button: paanch baar dabao, lift ek hi baar aati hai. Bina is protection ki vending machine paanch drinks girayegi aur paanch baar paise kaategi.',
    ),
    options: {
      none: bi(
        'No protection: a repeat does the action again. Only OK for naturally safe actions such as reads or “set value to X”.',
        'Koi protection nahi: repeat hone pe action dobara hota hai. Sirf naturally safe actions ke liye theek, jaise reads ya “value ko X set karo”.',
      ),
      'idempotency-keys': bi(
        'The client sends a unique key with the request. The server saves the result per key; a repeat with the same key gets the saved result instead of a second action. This is how Stripe and most payment APIs work.',
        'Client request ke saath ek unique key bhejta hai. Server har key ka result save karta hai; same key se repeat aaye to dobara action nahi, saved result wapas milta hai. Stripe aur zyaadatar payment APIs aise hi kaam karte hain.',
      ),
      'dedupe-store': bi(
        'The consumer records the IDs of messages it has already processed (in a cache or a table) and skips repeats. Typical for queue consumers with at-least-once delivery.',
        'Consumer jo messages process kar chuka hai unki IDs (cache ya table mein) note karta hai aur repeat ko skip karta hai. At-least-once delivery wale queue consumers ke liye typical.',
      ),
    },
    inChallenges: bi(
      'Set it wherever retries or at-least-once queues are involved — especially payments, orders and notifications. Reviewers look for it next to any retry strategy.',
      'Jahan bhi retries ya at-least-once queues hon wahan ise set karo — khaas kar payments, orders aur notifications. Reviewers har retry strategy ke saath ise dhoondte hain.',
    ),
  },
  {
    key: 'healthChecks',
    what: bi(
      'The load balancer regularly “pings” each server (for example GET /health every few seconds) and stops sending traffic to servers that do not answer correctly, until they recover.',
      'Load balancer har server ko regular “ping” karta hai (jaise har kuch second mein GET /health) aur jo sahi jawab na de use traffic bhejna band kar deta hai, jab tak woh theek na ho.',
    ),
    why: bi(
      'Without health checks, the load balancer keeps sending a share of users to a crashed server, and those users see errors.',
      'Health checks ke bina load balancer users ka ek hissa crash hue server pe bhejta rehta hai, aur un users ko errors dikhte hain.',
    ),
    example: bi(
      'Before seating guests, a head waiter checks which waiters are on duty. A waiter who went home is not given new tables.',
      'Guests ko bithane se pehle head waiter dekhta hai kaun se waiters duty pe hain. Jo waiter ghar chala gaya use naye tables nahi diye jaate.',
    ),
    options: {
      true: bi('On: traffic goes only to healthy instances.', 'On: traffic sirf healthy instances pe jaata hai.'),
      false: bi('Off: dead instances keep receiving traffic.', 'Off: mare hue instances ko bhi traffic milta rehta hai.'),
    },
    inChallenges: bi(
      'Always switch it on. It is what turns “several instances” into “survives a crash”.',
      'Ise hamesha on rakho. Isi se “kai instances” sach mein “crash jhel lene wala system” banta hai.',
    ),
  },

  // ───────────────────────── Traffic & routing ─────────────────────────
  {
    key: 'lbAlgorithm',
    what: bi(
      'The rule the load balancer (or reverse proxy) uses to pick which server gets the next request.',
      'Woh rule jisse load balancer (ya reverse proxy) decide karta hai ki agli request kis server ko milegi.',
    ),
    why: bi(
      'A poor choice overloads one server while others sit idle, or breaks features that need the same user (or key) to keep reaching the same server.',
      'Galat choice se ek server overload aur baaki khaali baithe rehte hain, ya woh features toot jaate hain jinme same user (ya key) ko hamesha same server tak pahunchna zaroori hai.',
    ),
    example: bi(
      'Think of a bank with several counters. Round robin: the guard sends people to counter 1, 2, 3, 1, 2, 3. Least connections: to whichever counter has the shortest queue. Hashing: your account number decides your counter, so you always meet the same clerk who has your file.',
      'Bank mein kai counters socho. Round robin: guard log ko counter 1, 2, 3, 1, 2, 3 bhejta hai. Least connections: jis counter ki line sabse chhoti ho wahan. Hashing: aapka account number counter decide karta hai, to aap hamesha usi clerk se milte ho jiske paas aapki file hai.',
    ),
    options: {
      'round-robin': bi(
        'Each server in turn: 1, 2, 3, 1, 2, 3. Simple and fair when every request costs about the same.',
        'Har server baari-baari: 1, 2, 3, 1, 2, 3. Simple aur fair jab har request lagbhag ek jitni bhaari ho.',
      ),
      'least-connections': bi(
        'Send to the server with the fewest requests in progress. Better when some requests are long (uploads, reports, WebSockets).',
        'Us server ko bhejo jiske paas abhi sabse kam requests chal rahi hain. Behtar jab kuch requests lambi hon (uploads, reports, WebSockets).',
      ),
      'ip-hash': bi(
        'The client’s IP decides the server, so the same user keeps reaching the same server (“sticky”). Needed only when servers keep session state. It reshuffles when servers change, and a whole office behind one IP lands on one server.',
        'Client ka IP server decide karta hai, to same user hamesha same server pe jaata hai (“sticky”). Sirf tab chahiye jab servers session state rakhte hon. Servers badalne pe sab reshuffle ho jaata hai, aur ek IP ke peeche poora office ek hi server pe gir jaata hai.',
      ),
      weighted: bi(
        'Bigger servers get a bigger share (for example 3 : 1). Also used for canary releases: send 5% of traffic to a new version first.',
        'Bade servers ko bada hissa (jaise 3 : 1). Canary release ke liye bhi use hota hai: pehle sirf 5% traffic naye version pe bhejo.',
      ),
      'consistent-hash': bi(
        'A key (user ID, cache key, chat-room ID) is placed on a hash ring and always maps to the same server. Adding or removing a server moves only a small share of keys. Perfect when each server holds data for particular keys: cache nodes, chat rooms, game sessions.',
        'Ek key (user ID, cache key, chat-room ID) hash ring pe rakhi jaati hai aur hamesha same server pe jaati hai. Server add/remove karne pe sirf thodi si keys hilti hain. Perfect jab har server kuch khaas keys ka data rakhta ho: cache nodes, chat rooms, game sessions.',
      ),
    },
    inChallenges: bi(
      'Where each server owns certain keys (sharded caches, WebSocket rooms, game shards), challenges check for Consistent hashing (one also accepts IP hash). Otherwise Round robin or Least connections are fine.',
      'Jahan har server kuch khaas keys ka owner ho (sharded cache, WebSocket rooms, game shards), challenges Consistent hashing check karte hain (ek IP hash bhi maan leta hai). Baaki jagah Round robin ya Least connections theek hain.',
    ),
  },
  {
    key: 'lbLayer',
    what: bi(
      'How deeply the load balancer looks at traffic. Layer 4 sees only addresses and ports — the envelope. Layer 7 reads the HTTP request itself — the letter inside: URL, headers, cookies.',
      'Load balancer traffic ko kitna gehraai se dekhta hai. Layer 4 sirf address aur port dekhta hai — lifafa. Layer 7 HTTP request khud padhta hai — andar ki chitthi: URL, headers, cookies.',
    ),
    why: bi(
      'It decides what kind of routing is possible and how much work the load balancer does per request.',
      'Isse decide hota hai ki kis tarah ki routing ho sakti hai aur load balancer har request pe kitna kaam karta hai.',
    ),
    example: bi(
      'A post office sorting letters by PIN code on the envelope (L4), versus an office receptionist who opens each letter and sends it to Accounts or HR depending on what it says (L7).',
      'Post office jo lifafe pe PIN code dekh ke chitthi chhaanta hai (L4), aur office ki receptionist jo har chitthi khol ke padhti hai aur uske hisaab se Accounts ya HR bhejti hai (L7).',
    ),
    options: {
      L4: bi(
        'Forwards TCP/UDP connections without reading them. Very fast and works for any protocol (databases, game servers, raw TCP), but cannot route by URL or header.',
        'TCP/UDP connections bina padhe aage bhejta hai. Bahut fast aur har protocol ke liye chalta hai (databases, game servers, raw TCP), par URL ya header se route nahi kar sakta.',
      ),
      L7: bi(
        'Understands HTTP: can send /api to one group and /images to another, terminate TLS, add headers and use cookie-based stickiness. The standard for websites and APIs.',
        'HTTP samajhta hai: /api ek group ko aur /images doosre ko bhej sakta hai, TLS terminate kar sakta hai, headers jod sakta hai, cookie se sticky bana sakta hai. Websites aur APIs ke liye standard.',
      ),
    },
    inChallenges: bi(
      'Not scored directly. Use L7 for normal web and API traffic; L4 for non-HTTP protocols or extreme throughput.',
      'Seedha score nahi hota. Normal web aur API traffic ke liye L7; non-HTTP protocols ya bahut zyaada throughput ke liye L4.',
    ),
  },
  {
    key: 'routingPolicy',
    what: bi(
      'How DNS chooses which address to give back when someone looks up your domain name.',
      'Jab koi aapka domain dhoondta hai to DNS kaunsa address wapas de, yeh kaise chunta hai.',
    ),
    why: bi(
      'When you run in several regions, DNS is the very first place you can send each user to the nearest — or the healthy — region.',
      'Jab aap kai regions mein chalte ho, to DNS hi sabse pehli jagah hai jahan se har user ko sabse paas wale — ya healthy — region bheja ja sakta hai.',
    ),
    example: bi(
      'A national helpline number connects you to the nearest call centre, or to a backup centre when the main one is closed.',
      'National helpline number aapko sabse paas wale call centre se jodta hai, ya main centre band ho to backup centre se.',
    ),
    options: {
      simple: bi('Always returns the same address(es). Right for an app in a single region.', 'Hamesha same address(es) deta hai. Single region app ke liye sahi.'),
      latency: bi(
        'Returns the region with the lowest network delay for that user. Best for global apps that want speed.',
        'Us user ke liye jis region ka network delay sabse kam ho, woh deta hai. Speed chahne wale global apps ke liye best.',
      ),
      geo: bi(
        'Chooses by the user’s country or continent. For data-residency laws (EU data stays in the EU) or region-specific content.',
        'User ke desh ya continent ke hisaab se chunta hai. Data-residency laws (EU ka data EU mein hi) ya region-specific content ke liye.',
      ),
      weighted: bi(
        'Splits users by percentage across endpoints. For gradual migrations and A/B tests.',
        'Users ko percentage ke hisaab se endpoints mein baant-ta hai. Dheere-dheere migration aur A/B tests ke liye.',
      ),
      failover: bi(
        'Sends everyone to the primary; if its health check fails, answers with the backup. The DNS half of an active-passive setup.',
        'Sabko primary pe bhejta hai; uska health check fail ho to backup ka address deta hai. Active-passive setup ka DNS wala hissa.',
      ),
    },
    inChallenges: bi(
      'Multi-region challenges accept Latency, Geo, Weighted or Failover — anything except Simple. DNS answers are cached, so a switch takes seconds to minutes.',
      'Multi-region challenges Latency, Geo, Weighted ya Failover maan lete hain — Simple ke alawa kuch bhi. DNS jawab cache hote hain, isliye switch hone mein seconds se minutes lagte hain.',
    ),
  },
  {
    key: 'cachedContent',
    what: bi(
      'Which kinds of responses the CDN keeps copies of on its edge servers near users.',
      'CDN apne edge servers pe (users ke paas) kis tarah ke responses ki copies rakhta hai.',
    ),
    why: bi(
      'Everything served from the edge is faster for the user and never reaches your servers. Picking the right content gives the biggest saving.',
      'Jo bhi edge se serve hota hai woh user ke liye fast hai aur aapke servers tak pahunchta hi nahi. Sahi content chunne se sabse badi bachat hoti hai.',
    ),
    example: bi(
      'A chain of local kiosks stocking the newspapers and magazines everybody buys, so nobody travels to the printing press.',
      'Mohalle ki dukaanein jo woh akhbaar aur magazines rakhti hain jo sab khareedte hain, taaki kisi ko printing press tak na jaana pade.',
    ),
    options: {
      'static-assets': bi(
        'JavaScript, CSS, fonts and icons — the same for everyone and changed only on deploy. Every website should cache these.',
        'JavaScript, CSS, fonts aur icons — sabke liye same, sirf deploy pe badalte hain. Har website ko yeh cache karne chahiye.',
      ),
      media: bi(
        'Images, video and audio. Large files, so edge caching saves the most bandwidth and time.',
        'Images, video aur audio. Badi files, isliye edge caching se sabse zyaada bandwidth aur time bachta hai.',
      ),
      'api-responses': bi(
        'Public, cacheable API answers (product catalogue, live score, trending list). Needs careful cache keys and short TTLs; never cache personal data publicly.',
        'Public, cache karne layak API jawab (product catalogue, live score, trending list). Cache keys dhyaan se aur TTL chhota rakhna padta hai; personal data kabhi public cache mat karo.',
      ),
      all: bi('All of the above.', 'Upar wale sab.'),
    },
    inChallenges: bi('Media-heavy challenges (video, photos) check for Media files or All.', 'Media-heavy challenges (video, photos) Media files ya All check karte hain.'),
  },
  {
    key: 'invalidation',
    what: bi(
      'How an out-of-date copy leaves the CDN after the original file changes.',
      'Original file badalne ke baad CDN se purani copy kaise hatti hai.',
    ),
    why: bi(
      'Without a plan, users keep seeing the old logo, the old price or a deleted photo until the copy happens to expire.',
      'Plan na ho to users ko purana logo, purani price ya delete ki hui photo tab tak dikhti rahegi jab tak copy khud expire na ho.',
    ),
    example: bi(
      'A newspaper stand: papers simply expire each day (TTL); the publisher can recall a misprinted edition (purge); or each edition carries a new date so nobody confuses old with new (versioned URL).',
      'Akhbaar ki dukaan: akhbaar har din apne aap purana ho jaata hai (TTL); galat chhapa edition publisher wapas mangwa sakta hai (purge); ya har edition pe nayi date hoti hai taaki koi purana-naya confuse na kare (versioned URL).',
    ),
    options: {
      'ttl-expiry': bi(
        'Each copy expires after a set time and the next request fetches a fresh one. Simple, but users may see old content until it expires.',
        'Har copy ek fixed time ke baad expire hoti hai aur agli request fresh copy laati hai. Simple, par expire hone tak users purana content dekh sakte hain.',
      ),
      'purge-on-update': bi(
        'When content changes, your system tells the CDN to delete that file now. Fresh within seconds; costs an API call per change.',
        'Content badalte hi aapka system CDN ko bolta hai ki yeh file abhi hatao. Kuch seconds mein fresh; har change pe ek API call lagti hai.',
      ),
      'versioned-urls': bi(
        'Changing a file changes its name (app.3f9a.js, photo.jpg?v=2). The old copy is never wrong — it is simply no longer asked for — so files can be cached forever. Best for build assets and uploaded media.',
        'File badalne pe uska naam badal jaata hai (app.3f9a.js, photo.jpg?v=2). Purani copy kabhi galat nahi hoti — bas koi use maangta nahi — isliye files hamesha ke liye cache ho sakti hain. Build assets aur uploaded media ke liye best.',
      ),
    },
    inChallenges: bi(
      'When content must update quickly (an edited profile photo, a corrected article), challenges accept Purge on update or Versioned URLs.',
      'Jab content jaldi update hona zaroori ho (edit ki hui profile photo, theek kiya hua article), challenges Purge on update ya Versioned URLs maante hain.',
    ),
  },
];
