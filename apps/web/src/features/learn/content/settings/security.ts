import { bi } from '../../dsl';
import type { SettingGuide } from '../../types';

/** Security, rate limiting and special-purpose engine settings. */
export const securitySettings: SettingGuide[] = [
  // ───────────────────────── Security & limits ─────────────────────────
  {
    key: 'authentication',
    what: bi(
      'How the API gateway checks who is calling before letting a request reach your services.',
      'API gateway kaise check karta hai ki call kaun kar raha hai, request ko services tak jaane dene se pehle.',
    ),
    why: bi(
      'Checking identity once at the front door keeps anonymous and forged traffic away from every internal service, so each service does not need its own login logic.',
      'Front door pe ek baar pehchaan check karne se anonymous aur nakli traffic har internal service se door rehta hai, aur har service ko apna login logic nahi likhna padta.',
    ),
    example: bi(
      'Entering an office. None: the door is open. API key: a company ID card for a whole team. JWT: a stamped day pass with an expiry time that any guard can verify just by looking at the stamp. OAuth 2.0: the visitor desk calls your host to approve you and then issues a pass.',
      'Office mein entry. None: darwaza khula. API key: poori team ke liye company ID card. JWT: expiry time wala stamp laga day pass, jise koi bhi guard stamp dekh ke verify kar le. OAuth 2.0: visitor desk aapke host ko call karke approve karwata hai, phir pass deta hai.',
    ),
    options: {
      none: bi(
        'The gateway lets everyone in; each service must check identity itself (or the API is meant to be public).',
        'Gateway sabko andar aane deta hai; har service ko khud pehchaan check karni padegi (ya API public hi hai).',
      ),
      'api-key': bi(
        'The caller sends a secret key that identifies the app (not the person). Good for server-to-server calls and public developer APIs. Keys must be kept secret and rotated.',
        'Caller ek secret key bhejta hai jo app ko pehchaanti hai (insaan ko nahi). Server-to-server calls aur public developer APIs ke liye accha. Keys secret rakhni aur badalni padti hain.',
      ),
      jwt: bi(
        'Clients send a signed token; the gateway checks the signature and expiry without calling the auth service. Fast and stateless, but hard to revoke before it expires.',
        'Client ek signed token bhejta hai; gateway auth service ko call kiye bina signature aur expiry check karta hai. Fast aur stateless, par expiry se pehle cancel karna mushkil.',
      ),
      oauth2: bi(
        'A standard login and consent flow through an identity provider that issues tokens, which the gateway validates. For “Sign in with Google” and third-party apps acting for users.',
        'Identity provider ke through standard login aur consent flow jo tokens deta hai, aur gateway unhe validate karta hai. “Sign in with Google” aur users ki taraf se kaam karne wale third-party apps ke liye.',
      ),
    },
    inChallenges: bi(
      'Not scored directly, but reviewers expect a public API to check identity at the gateway. Pair it with rate limiting.',
      'Seedha score nahi hota, par reviewers expect karte hain ki public API gateway pe pehchaan check kare. Saath mein rate limiting lagao.',
    ),
  },
  {
    key: 'authMethod',
    what: bi('How the auth service remembers that a user has logged in.', 'Auth service kaise yaad rakhti hai ki user login kar chuka hai.'),
    why: bi(
      'It decides how fast every request can be verified and how quickly you can log someone out (for example after a stolen phone).',
      'Isse decide hota hai ki har request kitni jaldi verify hoti hai aur kisi ko kitni jaldi logout kar sakte ho (jaise phone chori hone ke baad).',
    ),
    example: bi(
      'A gym. Sessions: reception keeps a register of who is inside and your wristband number points to your entry. JWT: a stamped wristband with an expiry time that any trainer can check without asking reception. OAuth 2.0 / OIDC: the gym accepts your company ID card because it trusts your company.',
      'Gym. Sessions: reception ek register rakhta hai ki andar kaun hai, aur aapke wristband ka number us entry ki taraf ishaara karta hai. JWT: expiry time wala stamp laga wristband jise koi bhi trainer reception se pooche bina check kar le. OAuth 2.0 / OIDC: gym aapka company ID card maan leta hai kyunki use aapki company pe bharosa hai.',
    ),
    options: {
      sessions: bi(
        'After login the server stores a session (in a database or cache) and gives the browser a random session-ID cookie. Easy to revoke — delete the session — but every request needs a lookup.',
        'Login ke baad server ek session store karta hai (database ya cache mein) aur browser ko random session-ID cookie deta hai. Revoke karna aasaan — session delete karo — par har request pe lookup lagta hai.',
      ),
      jwt: bi(
        'After login the server issues a signed token containing the user ID and an expiry. Any service verifies it locally with no lookup. Hard to revoke early, so keep tokens short-lived and use refresh tokens.',
        'Login ke baad server ek signed token deta hai jisme user ID aur expiry hoti hai. Koi bhi service bina lookup ke local verify kar leti hai. Jaldi revoke karna mushkil, isliye tokens short-lived rakho aur refresh tokens use karo.',
      ),
      'oauth2-oidc': bi(
        'Hand login to an identity provider (Google, Okta, Auth0) using standard protocols and receive ID and access tokens. For social login and company single sign-on.',
        'Standard protocols se login ek identity provider (Google, Okta, Auth0) ko de do aur ID aur access tokens lo. Social login aur company single sign-on ke liye.',
      ),
    },
    inChallenges: bi(
      'Not scored directly. Be ready to explain how a user is logged out: delete the session, or short JWT expiry plus a revocation list.',
      'Seedha score nahi hota. Yeh samjhane ko tayyar raho ki user logout kaise hota hai: session delete karo, ya chhoti JWT expiry plus revocation list.',
    ),
  },
  {
    key: 'mfa',
    what: bi(
      'After the password, the user must prove identity a second way: an OTP, an authenticator app or a passkey.',
      'Password ke baad user ko doosre tareeke se bhi pehchaan saabit karni padti hai: OTP, authenticator app ya passkey.',
    ),
    why: bi(
      'Passwords leak and get reused across sites. A second factor stops most account takeovers even when the password is known.',
      'Passwords leak hote hain aur kai sites pe same use hote hain. Doosra factor password pata hone pe bhi zyaadatar account takeovers rok deta hai.',
    ),
    example: bi(
      'An ATM needs your card and your PIN. Someone who steals only one of them still cannot take your money.',
      'ATM ko card aur PIN dono chahiye. Jisne sirf ek churaya woh phir bhi aapke paise nahi nikaal sakta.',
    ),
    options: {
      true: bi('On: a stolen password alone is not enough to log in.', 'On: sirf chori ka password login ke liye kaafi nahi.'),
      false: bi('Off: anyone with the password gets in.', 'Off: jiske paas password hai woh andar.'),
    },
    inChallenges: bi('Authentication and banking-style challenges check that it is on.', 'Authentication aur banking jaise challenges check karte hain ki yeh on ho.'),
  },
  {
    key: 'idpProtocol',
    what: bi(
      'The standard language your app and the identity provider use to talk about who a user is and what they may do.',
      'Woh standard bhasha jisme aapka app aur identity provider baat karte hain ki user kaun hai aur kya kar sakta hai.',
    ),
    why: bi(
      'Using a standard protocol means “Sign in with Google” or company single sign-on works without building your own password system.',
      'Standard protocol use karne se “Sign in with Google” ya company single sign-on apna password system banaye bina chal jaata hai.',
    ),
    example: bi(
      'OIDC is showing your passport — it proves who you are. OAuth 2.0 is giving a valet a key that starts the car but cannot open the boot — it grants limited permission. SAML is a formal letter from your employer vouching for you — older and more paperwork, but every big company accepts it.',
      'OIDC passport dikhana hai — saabit karta hai aap kaun ho. OAuth 2.0 valet ko aisi chaabi dena hai jo gaadi start kare par dikki na khole — limited permission. SAML employer ki taraf se formal letter hai jo aapki guarantee leta hai — purana aur zyaada kaagazi, par har badi company maanti hai.',
    ),
    options: {
      oidc: bi(
        'OpenID Connect: the modern login protocol built on OAuth 2.0. It returns an ID token describing the user. “Sign in with Google / Apple”.',
        'OpenID Connect: OAuth 2.0 pe bana modern login protocol. User ke baare mein ID token deta hai. “Sign in with Google / Apple”.',
      ),
      saml: bi(
        'An older XML-based single sign-on standard, common in companies (Okta → Salesforce).',
        'Purana XML-based single sign-on standard, companies mein common (Okta → Salesforce).',
      ),
      oauth2: bi(
        'Authorisation: lets an app call an API on the user’s behalf (“allow this app to read your calendar”). It is about permission, not identity.',
        'Authorisation: app ko user ki taraf se API call karne deta hai (“is app ko aapka calendar padhne do”). Yeh permission ke baare mein hai, pehchaan ke baare mein nahi.',
      ),
    },
    inChallenges: bi('Not scored directly. OIDC is the usual answer for consumer login, SAML for enterprise SSO.', 'Seedha score nahi hota. Consumer login ke liye aam jawab OIDC, enterprise SSO ke liye SAML.'),
  },
  {
    key: 'rateLimiting',
    what: bi(
      'A cap on how many requests a caller may send in a period, enforced at the API gateway.',
      'Ek caller ek samay mein kitni requests bhej sakta hai uski limit, API gateway pe lagayi hui.',
    ),
    why: bi(
      'One buggy client, scraper or attacker can otherwise flood the system and slow it down for everyone.',
      'Warna ek buggy client, scraper ya attacker system mein baadh la sakta hai aur sabke liye slow kar sakta hai.',
    ),
    example: bi(
      'An ATM card has a daily withdrawal limit: even if someone steals it, the damage is capped.',
      'ATM card pe daily withdrawal limit hoti hai: koi chura bhi le to nuksaan ki ek had hai.',
    ),
    options: {
      off: bi('No limit: a single client can overload everything.', 'Koi limit nahi: ek client sab kuch overload kar sakta hai.'),
      'per-user': bi('Each logged-in user gets N requests per minute.', 'Har logged-in user ko har minute N requests.'),
      'per-ip': bi(
        'Each IP address is limited. Works for anonymous traffic such as login pages, but many people behind one office or mobile-network IP share a limit.',
        'Har IP address ki limit. Anonymous traffic (jaise login page) ke liye chalta hai, par ek office ya mobile network IP ke peeche bahut log ek limit share karte hain.',
      ),
      'per-api-key': bi(
        'Each developer app or key gets its own quota. Standard for public APIs and paid tiers.',
        'Har developer app ya key ka apna quota. Public APIs aur paid tiers ke liye standard.',
      ),
    },
    inChallenges: bi(
      'Challenges check that it is set on the gateway. Public developer APIs want Per API key; user-facing apps accept Per user or Per IP.',
      'Challenges check karte hain ki gateway pe yeh set ho. Public developer APIs ke liye Per API key; user-facing apps Per user ya Per IP maante hain.',
    ),
  },
  {
    key: 'rlAlgorithm',
    what: bi('The method the rate limiter uses to count requests and decide “allow” or “reject”.', 'Rate limiter requests ginne aur “allow” ya “reject” decide karne ke liye kaunsa tareeka use karta hai.'),
    why: bi(
      'Methods differ in whether short bursts are allowed, how smooth the limit is, how exact it is and how much memory it needs.',
      'Tareeke is mein alag hain ki chhote bursts allowed hain ya nahi, limit kitni smooth hai, kitni exact hai aur kitni memory chahiye.',
    ),
    example: bi(
      'Token bucket: a metro card topped up with 10 rides every hour — use several at once if you have them. Leaky bucket: a funnel — pour fast, but it drips out at a steady speed. Fixed window: a canteen allowing two plates per clock hour. Sliding window: “at most two plates in any 60 minutes”.',
      'Token bucket: metro card jisme har ghante 10 rides top-up hoti hain — hon to ek saath kai use karo. Leaky bucket: keep (funnel) — tezi se daalo, par neeche se ek speed se tapakta hai. Fixed window: canteen jo har clock hour mein do plate deti hai. Sliding window: “kisi bhi 60 minute mein zyaada se zyaada do plate”.',
    ),
    options: {
      'token-bucket': bi(
        'A bucket refills with tokens at a steady rate and each request spends one. Short bursts up to the bucket size are allowed. The most common choice (AWS, Stripe).',
        'Bucket ek steady rate se tokens se bharti hai aur har request ek token kharch karti hai. Bucket size tak chhote bursts allowed. Sabse common choice (AWS, Stripe).',
      ),
      'leaky-bucket': bi(
        'Requests join a queue that drains at a fixed rate, smoothing traffic into a constant flow. Bursts wait or are dropped.',
        'Requests ek queue mein lagti hain jo fixed rate se khaali hoti hai, traffic ko ek constant flow bana deti hai. Bursts wait karte hain ya drop.',
      ),
      'fixed-window': bi(
        'Count requests per calendar window (per minute). The simplest, but a client can send twice the limit around the boundary — the end of one minute plus the start of the next.',
        'Har calendar window (har minute) mein requests gino. Sabse simple, par client boundary ke aas-paas double limit bhej sakta hai — ek minute ka aakhir plus agle ka shuru.',
      ),
      'sliding-window-log': bi(
        'Store the timestamp of every request and count those in the last 60 seconds. Exact, but memory-hungry.',
        'Har request ka timestamp store karo aur pichhle 60 second wale gino. Exact, par memory bahut khaata hai.',
      ),
      'sliding-window-counter': bi(
        'Blends the current and previous window counts weighted by time. Nearly exact with tiny memory — a great default at scale.',
        'Current aur pichhli window ke counts ko time ke hisaab se mila deta hai. Lagbhag exact aur bahut kam memory — bade scale pe badhiya default.',
      ),
    },
    inChallenges: bi('The rate-limiter challenges check that an algorithm is chosen. Any is accepted — be ready to say why you picked it.', 'Rate-limiter challenges check karte hain ki algorithm chuna gaya ho. Koi bhi chalta hai — bas bata pao ki kyun chuna.'),
  },
  {
    key: 'rlScope',
    what: bi('Whose requests each limit counts: one user, one IP, one API key, or everyone together.', 'Har limit kiski requests ginti hai: ek user, ek IP, ek API key, ya sab milaake.'),
    why: bi(
      'Limit the wrong identity and you either block innocent people sharing an IP or let an attacker dodge the limit by rotating keys.',
      'Galat pehchaan pe limit lagao to ya to ek IP share karne wale masoom log block honge, ya attacker keys badal-badal ke limit se bach jaayega.',
    ),
    example: bi(
      'A buffet with “three plates per guest” (per user), “one bottle per table” (per IP), “one voucher per company” (per API key) or “the kitchen makes 500 meals tonight, total” (global).',
      'Buffet jisme “har guest ko teen plate” (per user), “har table ko ek bottle” (per IP), “har company ko ek voucher” (per API key), ya “kitchen aaj raat kul 500 meals banayegi” (global).',
    ),
    options: {
      'per-user': bi('Each account has its own limit. Fair for logged-in apps.', 'Har account ki apni limit. Logged-in apps ke liye fair.'),
      'per-ip': bi('Each IP address has its own limit. For anonymous endpoints like login and sign-up.', 'Har IP address ki apni limit. Login aur sign-up jaise anonymous endpoints ke liye.'),
      'per-api-key': bi('Each API key has its own quota. For developer platforms and paid plans.', 'Har API key ka apna quota. Developer platforms aur paid plans ke liye.'),
      global: bi(
        'One total limit for everyone together — protects a fragile backend or a costly third-party quota.',
        'Sabke liye milaake ek total limit — kamzor backend ya mehenge third-party quota ko bachane ke liye.',
      ),
    },
    inChallenges: bi('Rate-limiter challenges check for Per API key or Per user.', 'Rate-limiter challenges Per API key ya Per user check karte hain.'),
  },
  {
    key: 'rlStore',
    what: bi('Where the rate limiter keeps its counters.', 'Rate limiter apne counters kahan rakhta hai.'),
    why: bi(
      'With ten servers each counting on their own, a user effectively gets ten times the limit. A shared store gives one true limit.',
      'Das servers apne-apne gine to user ko asal mein das guna limit mil jaati hai. Shared store se ek sachchi limit milti hai.',
    ),
    example: bi(
      'A stadium with several gates: each gate counting entries on its own clicker, versus every gate updating one central scoreboard.',
      'Kai gates wala stadium: har gate apne clicker pe entries ginta hai, ya har gate ek central scoreboard update karta hai.',
    ),
    options: {
      'in-memory': bi(
        'Each server counts in its own memory. Very fast, but limits are per server, not per user.',
        'Har server apni memory mein ginta hai. Bahut fast, par limit per server hai, per user nahi.',
      ),
      'shared-cache': bi(
        'All servers update the same counter in a shared cache such as Redis. One accurate global limit, at the cost of a ~1 ms cache hop.',
        'Saare servers Redis jaise shared cache mein ek hi counter update karte hain. Ek accurate global limit, ~1 ms cache hop ki keemat pe.',
      ),
    },
    inChallenges: bi('The distributed rate-limiter challenge checks for Shared cache.', 'Distributed rate-limiter challenge Shared cache check karta hai.'),
  },
  {
    key: 'failMode',
    what: bi(
      'What happens when the rate limiter itself (or its counter store) is unavailable: let requests through, or block them.',
      'Jab rate limiter khud (ya uska counter store) available na ho tab kya ho: requests jaane do, ya rok do.',
    ),
    why: bi(
      'The limiter sits on every request. If it breaks, you must decide between staying available and staying protected.',
      'Limiter har request ke raaste mein hai. Woh toota to decide karna padega: available rehna hai ya protected.',
    ),
    example: bi(
      'A power cut at an automatic door: a shop’s door unlocks so people can still come and go (fail open); a bank vault stays locked (fail closed).',
      'Automatic darwaze pe bijli gayi: dukaan ka darwaza khul jaata hai taaki log aa-ja sakein (fail open); bank ka vault band rehta hai (fail closed).',
    ),
    options: {
      'fail-open': bi(
        'If the limiter is down, allow requests. Users are unaffected; the system is briefly unprotected. The usual choice for normal APIs.',
        'Limiter down ho to requests allow karo. Users pe asar nahi; system thodi der unprotected. Normal APIs ke liye aam choice.',
      ),
      'fail-closed': bi(
        'If the limiter is down, block requests. Protected, but users see errors. For security-critical limits such as login attempts or OTP sends.',
        'Limiter down ho to requests block karo. Protected, par users ko errors. Login attempts ya OTP bhejne jaise security-critical limits ke liye.',
      ),
    },
    inChallenges: bi(
      'The rate-limiter challenges check this is chosen, and one expects Fail open so an outage of the limiter does not take the API down.',
      'Rate-limiter challenges check karte hain ki yeh chuna gaya ho, aur ek Fail open expect karta hai taaki limiter ka outage API ko na gira de.',
    ),
  },
  {
    key: 'wafRules',
    what: bi(
      'The set of rules the web application firewall uses to block bad requests — SQL injection, cross-site scripting, bad bots.',
      'Woh rules jinse web application firewall kharab requests rokta hai — SQL injection, cross-site scripting, bad bots.',
    ),
    why: bi(
      'Attack patterns change constantly. Good rules stop most automated attacks before they reach your code.',
      'Attack ke tareeke lagaataar badalte hain. Acche rules zyaadatar automated attacks ko aapke code tak pahunchne se pehle rok dete hain.',
    ),
    example: bi(
      'Mall security follows the security agency’s standard checklist (managed) plus the mall’s own rules such as “no pets” (custom).',
      'Mall ki security agency ki standard checklist follow karti hai (managed) plus mall ke apne rules jaise “pets allowed nahi” (custom).',
    ),
    options: {
      managed: bi(
        'Rule sets maintained and updated by the provider (OWASP Top 10, known bad bots). Little effort, good coverage.',
        'Provider ke maintain aur update kiye rule sets (OWASP Top 10, jaane-maane bad bots). Kam mehnat, acchi coverage.',
      ),
      custom: bi(
        'Your own rules: block a country, a path or a pattern specific to your app.',
        'Aapke apne rules: kisi desh, path ya aapke app ke khaas pattern ko block karna.',
      ),
      both: bi('Managed rules for common attacks plus your own for app-specific threats. The usual production setup.', 'Common attacks ke liye managed rules plus app-specific khatron ke liye apne. Aam production setup.'),
    },
    inChallenges: bi('Not scored directly. What matters is that all public traffic passes through the WAF.', 'Seedha score nahi hota. Zaroori yeh hai ki saara public traffic WAF se guzre.'),
  },
  {
    key: 'rotation',
    what: bi(
      'The secrets manager automatically replaces passwords, keys and tokens on a schedule, and apps fetch the new value.',
      'Secrets manager ek schedule pe passwords, keys aur tokens apne aap badal deta hai, aur apps nayi value le leti hain.',
    ),
    why: bi(
      'A leaked secret that never changes works for an attacker forever. Rotation limits how long a leak is useful.',
      'Leak hua secret agar kabhi na badle to attacker ke liye hamesha kaam karta hai. Rotation se leak ka faayda thodi der ka reh jaata hai.',
    ),
    example: bi(
      'Changing your house locks every few months, with the new keys delivered automatically to everyone in the family.',
      'Har kuch mahine mein ghar ke taale badalna, aur nayi chaabiyaan family ke har member tak apne aap pahunchna.',
    ),
    options: {
      true: bi('On: credentials change regularly, so a leaked one soon stops working.', 'On: credentials regular badalte hain, to leak hua jaldi bekaar ho jaata hai.'),
      false: bi('Off: the same password is used for years.', 'Off: saalon tak wahi password.'),
    },
    inChallenges: bi('The secrets-management challenge checks that it is on.', 'Secrets-management challenge check karta hai ki yeh on ho.'),
  },

  // ───────────────────────── Special-purpose engines ─────────────────────────
  {
    key: 'ensembleSize',
    what: bi(
      'How many nodes run the coordination service (ZooKeeper, etcd). Decisions need agreement from a majority of them.',
      'Coordination service (ZooKeeper, etcd) kitne nodes pe chalti hai. Faislon ke liye unme se majority ki sahmati chahiye.',
    ),
    why: bi(
      'A majority must stay alive for the service to work. With 3 nodes, 2 is a majority, so one can fail. Even numbers do not help: 4 nodes still tolerate only one failure.',
      'Service chalne ke liye majority zinda rehni chahiye. 3 nodes mein 2 majority hai, to ek fail ho sakta hai. Even numbers se faayda nahi: 4 nodes bhi sirf ek failure jhelte hain.',
    ),
    example: bi(
      'A committee where decisions need a majority vote. With three members the meeting goes on if one is absent; with five, two can be absent.',
      'Ek committee jahan faislon ke liye majority vote chahiye. Teen members mein ek gair-haazir ho to bhi meeting chalti hai; paanch mein do gair-haazir ho sakte hain.',
    ),
    options: {
      '1': bi('No fault tolerance. Development only.', 'Koi fault tolerance nahi. Sirf development ke liye.'),
      '3': bi('Tolerates one failure (majority 2 of 3). The usual production size.', 'Ek failure jhelta hai (3 mein se 2 majority). Aam production size.'),
      '5': bi('Tolerates two failures (majority 3 of 5). For critical clusters spread over zones.', 'Do failures jhelta hai (5 mein se 3 majority). Zones mein faile critical clusters ke liye.'),
    },
    inChallenges: bi('Seven challenges check for 3 or 5; either counts as redundant.', 'Saat challenges 3 ya 5 check karte hain; dono redundant gine jaate hain.'),
  },
  {
    key: 'coordinationUse',
    what: bi('What the coordination service does for the rest of the system.', 'Coordination service baaki system ke liye kya kaam karti hai.'),
    why: bi(
      'Some jobs must be done by exactly one node, or need all nodes to agree on a fact. These are hard to get right yourself.',
      'Kuch kaam bilkul ek hi node ko karne chahiye, ya saare nodes ko ek baat pe sehmat hona chahiye. Yeh khud sahi banana mushkil hai.',
    ),
    example: bi(
      'A classroom: electing a monitor (leader election), the single hall pass (lock), the attendance register (membership) and the timetable on the wall (metadata).',
      'Classroom: monitor chunna (leader election), ek hi hall pass (lock), attendance register (membership) aur deewar pe timetable (metadata).',
    ),
    options: {
      'leader-election': bi(
        'Picks exactly one node to do a job (for example the one scheduler that fires jobs) and picks a new one automatically if it dies.',
        'Ek kaam ke liye bilkul ek node chunta hai (jaise jobs chalane wala ek scheduler) aur woh mare to apne aap naya chunta hai.',
      ),
      locks: bi('Makes sure only one worker at a time touches a shared resource.', 'Ensure karta hai ki ek time pe ek hi worker shared resource ko chhoye.'),
      membership: bi('Tracks which nodes are alive and where services are (service discovery).', 'Track karta hai kaun se nodes zinda hain aur services kahan hain (service discovery).'),
      metadata: bi('Stores small, critical facts every node must agree on, such as which shard lives where.', 'Chhote, critical facts store karta hai jin pe har node sehmat ho, jaise kaunsa shard kahan hai.'),
    },
    inChallenges: bi('Not scored directly. Choose the use that matches why you added the component.', 'Seedha score nahi hota. Woh use chuno jiske liye aapne component joda.'),
  },
  {
    key: 'idStrategy',
    what: bi('How the ID generator creates unique IDs for new records.', 'ID generator naye records ke liye unique IDs kaise banata hai.'),
    why: bi(
      'IDs must never collide across many servers. Their length, order and speed affect URLs, database indexes and sorting.',
      'Kai servers mein IDs kabhi takraani nahi chahiye. Unki length, order aur speed URLs, database indexes aur sorting pe asar daalte hain.',
    ),
    example: bi(
      'Token numbers at a big hospital. Ticket server: one central token machine. Snowflake: each department prints its own tokens as “time + department code + counter”. Range allocation: each counter gets a bundle of 100 tokens at a time. UUID: random lottery-style numbers so long they never repeat.',
      'Bade hospital ke token number. Ticket server: ek central token machine. Snowflake: har department apne tokens “time + department code + counter” se chhaapta hai. Range allocation: har counter ko ek baar mein 100 tokens ka bundle. UUID: lottery jaise random number itne lambe ki kabhi repeat na hon.',
    ),
    options: {
      uuid: bi(
        '128-bit random IDs created anywhere with no coordination. Not ordered by time and long — bad for short URLs and database index locality.',
        '128-bit random IDs, kahin bhi bina coordination ke. Time ke order mein nahi aur lambe — short URLs aur database index ke liye theek nahi.',
      ),
      snowflake: bi(
        '64-bit IDs made of timestamp + machine ID + a per-machine counter. Unique without coordination, roughly time-ordered and compact. Used by Twitter/X and Discord.',
        '64-bit IDs jo timestamp + machine ID + per-machine counter se bante hain. Bina coordination unique, lagbhag time-ordered aur compact. Twitter/X aur Discord use karte hain.',
      ),
      'ticket-server': bi(
        'A central database hands out increasing numbers. Simple and sequential, but a bottleneck and single point of failure unless doubled.',
        'Ek central database badhte hue number deta hai. Simple aur sequential, par double na karo to bottleneck aur single point of failure.',
      ),
      'db-sequence': bi('The database’s auto-increment. Fine for one database; breaks down across many shards.', 'Database ka auto-increment. Ek database ke liye theek; kai shards mein toot jaata hai.'),
      'range-allocation': bi(
        'Each server reserves a block (say 1,000,001–1,001,000) from a coordinator and hands out IDs locally until it runs out. Fast and short; great for short URLs.',
        'Har server coordinator se ek block (jaise 1,000,001–1,001,000) reserve karta hai aur khatam hone tak local IDs deta hai. Fast aur chhote; short URLs ke liye badhiya.',
      ),
    },
    inChallenges: bi('The ID-generation challenge checks for Snowflake or Pre-allocated ranges.', 'ID-generation challenge Snowflake ya Pre-allocated ranges check karta hai.'),
  },
  {
    key: 'servingMode',
    what: bi('When the ML model makes its predictions: as each request arrives, ahead of time, or a mix.', 'ML model predictions kab karta hai: har request aane pe, pehle se, ya dono mila ke.'),
    why: bi(
      'Real-time predictions use the freshest data but must be fast. Precomputed ones are instant to serve but can be stale.',
      'Real-time predictions sabse fresh data use karti hain par fast honi chahiye. Precomputed turant serve hoti hain par purani ho sakti hain.',
    ),
    example: bi(
      'A restaurant cooking each dish to order (online), a ready buffet (batch), or a pre-cooked base finished when you order (hybrid).',
      'Restaurant jo har dish order pe banata hai (online), tayyar buffet (batch), ya pehle se bana base jo order pe finish hota hai (hybrid).',
    ),
    options: {
      online: bi(
        'The model runs for each request, such as a fraud check at payment time. Needs low latency and fresh features.',
        'Har request pe model chalta hai, jaise payment ke time fraud check. Kam latency aur fresh features chahiye.',
      ),
      batch: bi(
        'Predictions are computed in advance (for example nightly “recommended for you” lists) and stored; serving is just a lookup.',
        'Predictions pehle se compute hoti hain (jaise raat ko “aapke liye recommended” lists) aur store; serve karna bas lookup hai.',
      ),
      hybrid: bi('Precompute candidates in batch, then re-rank them online with fresh context.', 'Batch mein candidates pehle se nikaalo, phir fresh context ke saath online re-rank karo.'),
    },
    inChallenges: bi('Not scored directly. Recommendation challenges usually suit Hybrid; fraud checks need Online.', 'Seedha score nahi hota. Recommendation challenges ke liye aksar Hybrid; fraud check ke liye Online.'),
  },
  {
    key: 'storeMode',
    what: bi(
      'Whether the feature store serves the latest feature values for live predictions, keeps history for training, or both.',
      'Feature store live predictions ke liye latest feature values deta hai, training ke liye history rakhta hai, ya dono.',
    ),
    why: bi(
      'If training and serving compute features differently, the model behaves worse in production than in tests (training/serving skew). One shared store prevents that.',
      'Training aur serving features alag tareeke se nikaalein to model production mein test se bura chalta hai (training/serving skew). Ek shared store yeh rokta hai.',
    ),
    example: bi(
      'A cricket coach uses the live scoreboard to make decisions during a match (online) and the archive of past matches to train players (offline).',
      'Cricket coach match ke dauraan faislon ke liye live scoreboard (online) aur players ki training ke liye purane matches ka archive (offline) use karta hai.',
    ),
    options: {
      online: bi('A low-latency key-value store of the latest values, for live predictions.', 'Latest values ka low-latency key-value store, live predictions ke liye.'),
      offline: bi('Historical values in a warehouse or data lake, for training models.', 'Warehouse ya data lake mein purani values, models train karne ke liye.'),
      both: bi('The same feature definitions feed both, keeping training and serving consistent.', 'Same feature definitions dono ko milti hain, training aur serving ek jaise rehte hain.'),
    },
    inChallenges: bi('Not scored directly. Online + offline is the textbook answer.', 'Seedha score nahi hota. Online + offline textbook jawab hai.'),
  },
  {
    key: 'indexType',
    what: bi(
      'The kind of spatial index used to answer “what is near me?” quickly, without scanning every location.',
      'Spatial index ka type jo “mere paas kya hai?” ka jawab har location scan kiye bina jaldi deta hai.',
    ),
    why: bi(
      'Checking the distance to millions of drivers or restaurants for every request is far too slow. A spatial index narrows it to a few nearby cells.',
      'Har request pe lakhon drivers ya restaurants ki doori check karna bahut slow hai. Spatial index ise kuch paas ke cells tak seemit kar deta hai.',
    ),
    example: bi(
      'Finding a friend in a stadium by stand, row and seat code (geohash); splitting a city map into smaller pieces only where it is crowded (quadtree); covering the map in honeycomb tiles (H3).',
      'Stadium mein dost ko stand, row aur seat code se dhoondhna (geohash); shehar ka naksha sirf bheed wali jagah pe chhote tukdon mein baantna (quadtree); naksha shahad ke chhatte jaise tiles se dhakna (H3).',
    ),
    options: {
      geohash: bi(
        'Turns latitude/longitude into a string; nearby places share a prefix. Easy to store in any database or Redis. Points near a cell edge need neighbouring cells checked too.',
        'Latitude/longitude ko string mein badalta hai; paas ki jagahon ka prefix same. Kisi bhi database ya Redis mein store karna aasaan. Cell ke kinare wale points ke liye padosi cells bhi dekhne padte hain.',
      ),
      quadtree: bi(
        'Splits the map into four squares, again and again, until each square holds only a few points. Adapts to density (city versus desert). Usually kept in memory.',
        'Naksha baar-baar chaar squares mein baant-ta hai jab tak har square mein kuch hi points na bachein. Density ke hisaab se badalta hai (shehar vs registaan). Aam taur pe memory mein.',
      ),
      s2: bi(
        'Google’s hierarchical cells on a sphere. Covers any region shape well. Used by Google Maps.',
        'Google ke sphere pe hierarchical cells. Kisi bhi shape ke region ko accha cover karta hai. Google Maps use karta hai.',
      ),
      h3: bi(
        'Uber’s hexagon grid: every neighbour is the same distance away. Great for demand heatmaps and surge pricing areas.',
        'Uber ka hexagon grid: har padosi barabar doori pe. Demand heatmaps aur surge pricing areas ke liye badhiya.',
      ),
      'r-tree': bi(
        'A tree of bounding rectangles, great for shapes (delivery zones, polygons) and range queries. Used by PostGIS.',
        'Bounding rectangles ka tree, shapes (delivery zones, polygons) aur range queries ke liye badhiya. PostGIS use karta hai.',
      ),
    },
    inChallenges: bi('Location challenges check that an index type is chosen — any of them passes.', 'Location challenges check karte hain ki index type chuna gaya ho — koi bhi pass hai.'),
  },
  {
    key: 'isolation',
    what: bi(
      'The wall between untrusted user code and everything else on the machine.',
      'Untrusted user code aur machine ki baaki sab cheezon ke beech ki deewar.',
    ),
    why: bi(
      'Users can submit malicious code. A weak wall lets it read other users’ data or take over the server.',
      'Users kharab code bhej sakte hain. Kamzor deewar ho to woh doosre users ka data padh sakta hai ya server pe kabza kar sakta hai.',
    ),
    example: bi(
      'Strangers sleeping in the same room behind curtains (process), in separate cabins sharing walls (container), or in separate houses (micro-VM).',
      'Ajnabi ek hi kamre mein parde ke peeche (process), deewar share karne wale alag cabins mein (container), ya alag gharon mein (micro-VM) sote hain.',
    ),
    options: {
      process: bi('A separate operating-system process. The weakest wall — one exploit can reach the host.', 'Alag operating-system process. Sabse kamzor deewar — ek exploit host tak pahunch sakta hai.'),
      container: bi(
        'Container namespaces and cgroups (Docker-style). Common, but containers share the host kernel.',
        'Container namespaces aur cgroups (Docker jaisa). Common, par containers host ka kernel share karte hain.',
      ),
      'micro-vm': bi(
        'A lightweight virtual machine with its own kernel (Firecracker, as used by AWS Lambda). The strongest wall with fast startup.',
        'Apne kernel wali halki virtual machine (Firecracker, jo AWS Lambda use karta hai). Sabse mazboot deewar, fast startup ke saath.',
      ),
    },
    inChallenges: bi('Code-execution challenges check for Micro-VM (one also accepts Container).', 'Code-execution challenges Micro-VM check karte hain (ek Container bhi maanta hai).'),
  },
  {
    key: 'resourceLimits',
    what: bi(
      'Hard caps on CPU time, memory, number of processes and run time for each piece of user code.',
      'User ke har code ke liye CPU time, memory, processes ki ginti aur run time pe sakht limit.',
    ),
    why: bi(
      'An infinite loop or a memory bomb would otherwise eat the machine and slow down everyone else.',
      'Warna ek infinite loop ya memory bomb poori machine kha jaayega aur baaki sabko slow kar dega.',
    ),
    example: bi('A gym limits each person to 30 minutes on a treadmill when others are waiting.', 'Gym mein log wait kar rahe hon to treadmill pe har insaan ko 30 minute ki limit.'),
    options: {
      true: bi('On: runaway code is stopped and other users are unaffected.', 'On: bekaabu code rok diya jaata hai aur baaki users pe asar nahi.'),
      false: bi('Off: one bad submission can starve the whole machine.', 'Off: ek kharab submission poori machine ko bhookha maar sakta hai.'),
    },
    inChallenges: bi('Code-execution challenges check that it is on.', 'Code-execution challenges check karte hain ki yeh on ho.'),
  },
  {
    key: 'networkAccess',
    what: bi('Whether untrusted user code can make network calls, and to where.', 'Untrusted user code network calls kar sakta hai ya nahi, aur kahan.'),
    why: bi(
      'With open internet access, submitted code can attack other sites, mine cryptocurrency or leak data.',
      'Khula internet mile to submitted code doosri sites pe attack, crypto mining ya data leak kar sakta hai.',
    ),
    example: bi(
      'An exam hall: no phones at all (none), only the calculator the invigilator hands out (restricted), or phones allowed (full).',
      'Exam hall: phone bilkul nahi (none), sirf invigilator ka diya calculator (restricted), ya phone allowed (full).',
    ),
    options: {
      none: bi('No network at all. The safest choice for code judges.', 'Bilkul network nahi. Code judges ke liye sabse safe.'),
      restricted: bi('Only allowed destinations, such as a package mirror.', 'Sirf allowed jagahen, jaise package mirror.'),
      full: bi('Can reach the whole internet. Risky for untrusted code.', 'Poore internet tak pahunch. Untrusted code ke liye risky.'),
    },
    inChallenges: bi('Code-execution challenges check for None or Restricted.', 'Code-execution challenges None ya Restricted check karte hain.'),
  },
  {
    key: 'standby',
    what: bi(
      'Whether a second matching engine runs alongside the main one, ready to take over.',
      'Main matching engine ke saath doosra engine chal raha hai ya nahi, kaam sambhalne ko tayyar.',
    ),
    why: bi(
      'The matching engine holds the live order book in memory. If it crashes with no standby, trading stops until it restarts and rebuilds its state.',
      'Matching engine live order book memory mein rakhta hai. Bina standby ke crash hua to restart aur state dobara banne tak trading ruk jaati hai.',
    ),
    example: bi(
      'A co-pilot follows every step of the flight and can take the controls at any moment.',
      'Co-pilot flight ka har step follow karta hai aur kisi bhi pal controls sambhal sakta hai.',
    ),
    options: {
      none: bi('One engine. A crash halts trading until it is restarted and rebuilt.', 'Ek engine. Crash hua to restart aur rebuild tak trading band.'),
      'hot-standby': bi(
        'A second engine reads the same ordered input log and keeps identical state, ready to take over within seconds.',
        'Doosra engine same ordered input log padhta hai aur bilkul same state rakhta hai, seconds mein kaam sambhalne ko tayyar.',
      ),
    },
    inChallenges: bi('The exchange challenge checks for Hot standby; it also counts as redundant.', 'Exchange challenge Hot standby check karta hai; yeh redundant bhi gina jaata hai.'),
  },
  {
    key: 'persistence',
    what: bi(
      'How the in-memory matching engine makes sure its state can be rebuilt after a crash.',
      'In-memory matching engine kaise ensure karta hai ki crash ke baad uski state dobara ban sake.',
    ),
    why: bi(
      'Memory is wiped on a crash. Without a record of the inputs, every open order would be lost.',
      'Crash pe memory mit jaati hai. Inputs ka record na ho to har khula order kho jaayega.',
    ),
    example: bi(
      'A chess game: playing from memory only; writing every move on a scoresheet (event log); or photographing the board every ten moves and writing the moves since (snapshots + log).',
      'Chess game: sirf yaad ke bharose khelna; har chaal scoresheet pe likhna (event log); ya har das chaal pe board ki photo aur uske baad ki chaalein likhna (snapshots + log).',
    ),
    options: {
      none: bi('In memory only: a crash loses the order book.', 'Sirf memory mein: crash pe order book gaya.'),
      'event-log': bi(
        'Every incoming order is written to a log before it is processed; replaying the log rebuilds the state.',
        'Har aane wala order process hone se pehle log mein likha jaata hai; log replay karke state dobara banti hai.',
      ),
      'snapshot-log': bi(
        'Periodic snapshots plus the log since the last snapshot, so recovery is faster than replaying everything.',
        'Samay-samay pe snapshots plus aakhri snapshot ke baad ka log, to recovery sab replay karne se fast.',
      ),
    },
    inChallenges: bi('The exchange challenge checks for Event log or Snapshots + event log.', 'Exchange challenge Event log ya Snapshots + event log check karta hai.'),
  },
];
