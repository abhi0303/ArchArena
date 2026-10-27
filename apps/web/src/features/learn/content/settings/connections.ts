import { bi } from '../../dsl';
import type { SettingGuide } from '../../types';

/** Settings of a connection (the arrow between two components). */
export const connectionSettings: SettingGuide[] = [
  {
    key: 'label',
    what: bi(
      'Short text shown on the arrow, such as “write order” or “publish OrderPlaced”.',
      'Arrow pe dikhne wala chhota text, jaise “write order” ya “publish OrderPlaced”.',
    ),
    why: bi(
      'Arrows without words make readers guess what flows between two boxes. A two-word label removes the guesswork.',
      'Bina shabdon ke arrows dekh ke padhne wale ko andaaza lagana padta hai ki do boxes ke beech kya ja raha hai. Do shabd ka label yeh andaaza khatam kar deta hai.',
    ),
    example: bi(
      'Labels on pipes in a building — “hot water”, “gas”, “drain” — so a plumber knows which pipe is which without opening it.',
      'Building ki pipes pe label — “garam paani”, “gas”, “drain” — taaki plumber bina khole jaan le kaunsi pipe kya hai.',
    ),
    goodValues: bi(
      '“login”, “read profile”, “publish PaymentDone”, “replicate”, “push new message”.',
      'Jaise: “login”, “read profile”, “publish PaymentDone”, “replicate”, “push new message” — chhota aur kaam batane wala.',
    ),
    inChallenges: bi('Not scored, but it makes your design much easier to review.', 'Score nahi hota, par design review karna bahut aasaan ho jaata hai.'),
  },
  {
    key: 'connectionType',
    what: bi('What kind of interaction this arrow represents.', 'Yeh arrow kis tarah ki baat-cheet dikhata hai.'),
    why: bi(
      'A request that waits for an answer, an event dropped into a queue and a database copying itself are very different things — the type tells readers which one they are looking at.',
      'Jawab ka wait karne wali request, queue mein daala gaya event aur khud ko copy karta database — teeno bilkul alag cheezein hain. Type batata hai ki aap kaunsi dekh rahe ho.',
    ),
    example: bi(
      'Phoning a friend and waiting for an answer (request), posting a letter (event), a photocopier making copies (replication), and a news anchor speaking to viewers (push).',
      'Dost ko phone karke jawab ka wait karna (request), chitthi daak mein daalna (event), photocopier se copies banana (replication), aur news anchor ka viewers se bolna (push).',
    ),
    options: {
      request: bi(
        'Request / response: the caller asks and waits for an answer. Most arrows are this (browser → API, service → database).',
        'Request / response: caller poochta hai aur jawab ka wait karta hai. Zyaadatar arrows yahi hote hain (browser → API, service → database).',
      ),
      event: bi(
        'Publish / consume: a producer drops a message into a queue or stream, and consumers pick it up later.',
        'Publish / consume: producer queue ya stream mein message daalta hai, aur consumers baad mein uthaate hain.',
      ),
      replication: bi('Data replication: a database copies its changes to a replica or another database.', 'Data replication: database apne changes replica ya doosre database ko copy karta hai.'),
      'data-sync': bi(
        'Data sync / CDC / ETL: data moves from one store to another (database → search index, database → warehouse).',
        'Data sync / CDC / ETL: data ek store se doosre mein jaata hai (database → search index, database → warehouse).',
      ),
      push: bi(
        'Server push: the server sends something to a client without being asked (notifications, live updates).',
        'Server push: server bina poochhe client ko kuch bhejta hai (notifications, live updates).',
      ),
      media: bi('Media stream: continuous audio or video (calls, live streaming).', 'Media stream: lagaataar audio ya video (calls, live streaming).'),
    },
    inChallenges: bi(
      'Filled in automatically when you connect two components, and not scored. Change it only when the guess is wrong, so the arrow style reads correctly.',
      'Do components jodne pe apne aap bhar jaata hai, aur score nahi hota. Sirf tab badlo jab andaaza galat ho, taaki arrow ka style sahi dikhe.',
    ),
  },
  {
    key: 'mode',
    what: bi(
      'Synchronous: the caller waits for the answer before carrying on. Asynchronous: the caller hands the work off and carries on immediately.',
      'Synchronous: caller jawab aane tak rukta hai, phir aage badhta hai. Asynchronous: caller kaam saunp ke turant aage badh jaata hai.',
    ),
    why: bi(
      'Every synchronous hop adds its delay to what the user feels, and if it fails the whole request fails. Asynchronous hand-offs keep the user fast and survive a slow worker.',
      'Har synchronous hop ka delay user ko mehsoos hota hai, aur woh fail hua to poori request fail. Asynchronous hand-off user ke liye fast rehta hai aur slow worker ko bhi jhel leta hai.',
    ),
    example: bi(
      'Waiting at the counter while your coffee is made (synchronous) versus taking a token and sitting down until your number is called (asynchronous).',
      'Coffee banne tak counter pe khade rehna (synchronous) aur token leke baith jaana jab tak number na bulaya jaaye (asynchronous).',
    ),
    options: {
      sync: bi('Synchronous: drawn as a solid line. The caller blocks until it gets a reply.', 'Synchronous: solid line. Caller reply aane tak ruka rehta hai.'),
      async: bi('Asynchronous: drawn as a dashed orange line. The caller does not wait.', 'Asynchronous: dashed orange line. Caller wait nahi karta.'),
    },
    inChallenges: bi(
      'The evaluator recognises asynchronous work when a queue or stream sits between producer and consumer — marking a direct arrow “asynchronous” does not count on its own. Put a Message Queue or Event Stream in between.',
      'Evaluator asynchronous kaam tab maanta hai jab producer aur consumer ke beech queue ya stream ho — seedhe arrow ko “asynchronous” mark karna akele kaafi nahi. Beech mein Message Queue ya Event Stream lagao.',
    ),
  },
  {
    key: 'operation',
    what: bi('Whether this connection reads data, writes data, or both.', 'Yeh connection data padhta hai, likhta hai, ya dono.'),
    why: bi(
      'Seeing reads and writes separately shows where load goes, where caches help and where replicas can take over reads.',
      'Reads aur writes alag dikhne se pata chalta hai load kahan jaa raha hai, cache kahan madad karega aur replicas kahan reads le sakte hain.',
    ),
    example: bi(
      'In a library, readers only borrow books (read), the cataloguer only adds them (write), and the librarian does both.',
      'Library mein readers sirf kitaab lete hain (read), cataloguer sirf jodta hai (write), aur librarian dono karta hai.',
    ),
    options: {
      read: bi('Only reads data (for example app → read replica).', 'Sirf data padhta hai (jaise app → read replica).'),
      write: bi('Only writes data (for example producer → queue, primary → replica).', 'Sirf data likhta hai (jaise producer → queue, primary → replica).'),
      'read-write': bi('Reads and writes (the default for app → database).', 'Padhta aur likhta dono (app → database ka default).'),
    },
    inChallenges: bi('Not scored. It helps readers follow your read and write paths.', 'Score nahi hota. Padhne walon ko aapke read aur write paths samajhne mein madad karta hai.'),
  },
  {
    key: 'protocol',
    what: bi('The “language” the two components speak over this connection.', 'Is connection pe dono components kis “bhasha” mein baat karte hain.'),
    why: bi(
      'Protocols differ in speed, browser support and whether both sides can talk at any time. Picking the closest one shows you know how the pieces really talk.',
      'Protocols speed, browser support aur dono taraf se kabhi bhi baat kar paane mein alag hain. Sabse paas wala chunne se dikhta hai ki aap jaante ho pieces asal mein kaise baat karte hain.',
    ),
    example: bi(
      'Letters, phone calls, walkie-talkies and video calls are all ways to talk — each suits a different situation.',
      'Chitthi, phone call, walkie-talkie aur video call — sab baat karne ke tareeke hain, har ek alag situation ke liye sahi.',
    ),
    options: {
      https: bi('HTTPS / REST: the web’s standard request–response. Browsers, public APIs, third-party services.', 'HTTPS / REST: web ka standard request–response. Browsers, public APIs, third-party services.'),
      grpc: bi('gRPC: fast, typed calls between internal services. Smaller messages than JSON.', 'gRPC: internal services ke beech fast, typed calls. JSON se chhote messages.'),
      websocket: bi(
        'WebSocket: a long-lived two-way connection, so the server can send at any time. Chat, live scores, collaboration.',
        'WebSocket: lamba chalne wala two-way connection, server kabhi bhi bhej sakta hai. Chat, live score, collaboration.',
      ),
      tcp: bi('TCP: a raw connection with your own message format. Game servers, custom protocols.', 'TCP: apne message format wala raw connection. Game servers, custom protocols.'),
      'db-driver': bi('Database protocol: the database’s own wire protocol (PostgreSQL, Redis, MongoDB drivers).', 'Database protocol: database ka apna wire protocol (PostgreSQL, Redis, MongoDB drivers).'),
      queue: bi('Queue / broker protocol: how producers and consumers talk to Kafka, RabbitMQ, SQS.', 'Queue / broker protocol: producers aur consumers Kafka, RabbitMQ, SQS se aise baat karte hain.'),
      webrtc: bi('WebRTC: real-time audio and video between browsers and media servers.', 'WebRTC: browsers aur media servers ke beech real-time audio aur video.'),
      other: bi('Anything else. The exact protocol does not need to be perfect.', 'Kuch aur. Protocol bilkul exact hona zaroori nahi.'),
    },
    inChallenges: bi('Filled in automatically and not scored. Pick the closest match; it does not need to be exact.', 'Apne aap bharta hai aur score nahi hota. Sabse paas wala chuno; exact hona zaroori nahi.'),
  },
  {
    key: 'direction',
    what: bi(
      'One-way: messages start only from the caller. Bidirectional: either side can send at any time over an open connection.',
      'One-way: messages sirf caller se shuru hote hain. Bidirectional: khule connection pe koi bhi taraf kabhi bhi bhej sakti hai.',
    ),
    why: bi(
      'Real-time features (chat, live location, multiplayer) need the server to talk first. That only works on a bidirectional connection.',
      'Real-time features (chat, live location, multiplayer) mein server ko pehle bolna padta hai. Yeh sirf bidirectional connection pe hota hai.',
    ),
    example: bi('A doorbell only rings one way. A phone call lets both people speak whenever they like.', 'Doorbell sirf ek taraf bajti hai. Phone call mein dono log jab chahein bol sakte hain.'),
    options: {
      'one-way': bi('The caller always starts; the other side only answers.', 'Hamesha caller shuru karta hai; doosri taraf sirf jawab deti hai.'),
      bidirectional: bi('Both sides send whenever they want (WebSocket, WebRTC).', 'Dono taraf jab chahe bhejti hain (WebSocket, WebRTC).'),
    },
    inChallenges: bi('Not scored. Use Bidirectional for WebSocket and media connections.', 'Score nahi hota. WebSocket aur media connections ke liye Bidirectional.'),
  },
  {
    key: 'critical',
    what: bi(
      'Marks this arrow as part of the core user flow — the path that must work for the product to work. It is drawn thicker.',
      'Is arrow ko core user flow ka hissa mark karta hai — woh raasta jo chalna hi chahiye tabhi product chalega. Ise mota dikhaya jaata hai.',
    ),
    why: bi(
      'Highlighting the critical path shows reviewers where you must avoid single points of failure and slow synchronous hops.',
      'Critical path highlight karne se reviewers ko dikhta hai ki kahan single points of failure aur slow synchronous hops se bachna zaroori hai.',
    ),
    example: bi(
      'In a hospital, the corridor to the emergency room is kept clear at all times; other corridors can be blocked for cleaning.',
      'Hospital mein emergency room tak ka corridor hamesha khaali rakha jaata hai; baaki corridors safai ke liye band ho sakte hain.',
    ),
    options: {
      true: bi('On: part of the core flow. Everything on it should be redundant.', 'On: core flow ka hissa. Is pe sab kuch redundant hona chahiye.'),
      false: bi(
        'Off: supporting traffic (analytics, logs, nice-to-have features) that can pause without breaking the product.',
        'Off: sahayak traffic (analytics, logs, nice-to-have features) — yeh thodi der ruk bhi jaaye to product chalta rehta hai.',
      ),
    },
    inChallenges: bi(
      'Not scored directly, but every component on a critical path should have redundancy — which is scored.',
      'Seedha score nahi hota, par critical path ke har component mein redundancy honi chahiye — jo score hoti hai.',
    ),
  },
  {
    key: 'description',
    what: bi(
      'An optional sentence describing what flows over this connection and why.',
      'Ek optional sentence jo batata hai is connection pe kya jaata hai aur kyun.',
    ),
    why: bi(
      'Some details do not fit in a two-word label — the data sent, how often, or a special rule.',
      'Kuch baatein do shabd ke label mein nahi aatin — kaunsa data, kitni baar, ya koi khaas rule.',
    ),
    example: bi('A note stuck on a parcel: “fragile — keep upright”.', 'Parcel pe chipka note: “fragile — seedha rakhein”.'),
    goodValues: bi(
      '“Sends order ID and amount; retried with an idempotency key”, “CDC stream of product changes”.',
      '“Order ID aur amount bhejta hai; idempotency key ke saath retry”, “Product changes ki CDC stream”.',
    ),
    inChallenges: bi('Not scored. Use it to explain anything unusual about the connection.', 'Score nahi hota. Connection ki koi khaas baat samjhane ke liye use karo.'),
  },
];
