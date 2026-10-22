import { a, bi, c, scene } from '../dsl';
import type { ComponentGuide } from '../types';

export const clientGuides: ComponentGuide[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'web-client',
    tagline: bi('Your product inside a browser tab — open a link and it simply works.', 'Browser tab ke andar aapka product — link kholo aur bas chal jaata hai.'),
    intro: bi(
      'A web client is your website or web app running inside the user’s browser (Chrome, Safari, Firefox). It draws the screens, reacts to clicks and typing, and sends requests to your servers over HTTPS.\n\nIn a design diagram, the web client is where the story starts: a person does something and a request begins its journey. It does not own important data — the truth always lives on your servers, because anything inside a browser can be read or changed by the user.',
      'Web client aapki website ya web app hai jo user ke browser (Chrome, Safari, Firefox) ke andar chalta hai. Yeh screens dikhata hai, clicks aur typing pe react karta hai, aur HTTPS par aapke servers ko requests bhejta hai.\n\nDesign diagram mein kahani yahin se shuru hoti hai: koi insaan kuch karta hai aur ek request apna safar shuru karti hai. Important data iske paas nahi hota — asli data hamesha servers par rehta hai, kyunki browser ke andar ki har cheez user padh ya badal sakta hai.',
    ),
    problem: bi(
      'Before web apps, software had to be installed on every computer. A bug fix meant shipping a new installer to thousands of people, and many never updated. People on a different operating system could not use the product at all.',
      'Web apps se pehle software har computer par install karna padta tha. Ek bug fix ke liye hazaaron logon ko naya installer bhejna padta, aur bahut log update hi nahi karte the. Doosre operating system wale log product use hi nahi kar paate the.',
    ),
    before: scene(
      [[a('cd', 'Package', 'Installer', { note: 'v2.0' })], [a('pc1', 'Laptop', 'PC (Windows)', { note: 'v2.0' }), a('pc2', 'Laptop', 'PC (old)', { note: 'still v1.3', state: 'bad' }), a('mac', 'Monitor', 'Mac', { note: 'not supported', state: 'bad' })]],
      ['cd>pc1', 'cd!>pc2', 'cd!>mac'],
      bi('Every machine needs its own install. Some stay on old versions, some cannot install at all.', 'Har machine par alag install chahiye. Kuch purane version par atak jaate hain, kuch par install hi nahi hota.'),
    ),
    solution: bi(
      'With a web client, the user just opens a URL. The browser downloads the latest code every time, so a deploy reaches everyone instantly, on any device that has a browser. The client then talks to your backend through an entry point such as an API gateway.',
      'Web client ke saath user bas ek URL kholta hai. Browser har baar latest code download karta hai, isliye ek deploy turant sab tak pahunch jaata hai — har us device par jismein browser hai. Phir client aapke backend se ek entry point (jaise API gateway) ke through baat karta hai.',
    ),
    after: scene(
      [[a('user', 'User', 'User')], [c('web-client', { state: 'focus' })], [c('api-gateway')], [c('app-server')]],
      ['user>web-client', ['web-client>api-gateway', 'HTTPS'], 'api-gateway>app-server'],
      bi('Open a link, get the latest version; the browser talks to your backend over HTTPS.', 'Link kholo, latest version pao; browser HTTPS par backend se baat karta hai.'),
    ),
    steps: [
      bi('The user types a URL or taps a link.', 'User URL type karta hai ya link par tap karta hai.'),
      bi('The browser downloads HTML, JavaScript and CSS — usually from a CDN close to the user.', 'Browser HTML, JavaScript aur CSS download karta hai — aksar user ke paas wale CDN se.'),
      bi('Your app runs inside the browser and draws the screen.', 'Aapka app browser ke andar chalta hai aur screen banata hai.'),
      bi('Each action (search, buy, post) becomes an HTTPS request to your backend’s entry point.', 'Har action (search, buy, post) aapke backend ke entry point par ek HTTPS request ban jaata hai.'),
      bi('The response updates the screen. When you deploy a new version, the next page load picks it up.', 'Response screen ko update karta hai. Naya version deploy karte hi agle page load par woh mil jaata hai.'),
    ],
    analogy: {
      icons: ['Utensils', 'ClipboardList', 'ChefHat'],
      title: bi('The table and menu in a restaurant', 'Restaurant ki table aur menu'),
      text: bi(
        'The web client is the table where you sit with a menu. You see the options and place your order, but the cooking happens in the kitchen (your servers).\n\nIf the restaurant changes its menu, every table gets the new menu immediately — nobody has to reprint menus at their home. That is exactly how a deploy reaches every browser.',
        'Web client woh table hai jahan aap menu ke saath baithte ho. Aap options dekhte ho aur order dete ho, lekin khana kitchen (aapke servers) mein banta hai.\n\nAgar restaurant menu badalta hai, toh har table ko turant naya menu mil jaata hai — kisi ko ghar par menu reprint nahi karna padta. Deploy bhi har browser tak bilkul aise hi pahunchta hai.',
      ),
    },
    perfectFit: {
      title: bi('A company dashboard used from any laptop', 'Ek company dashboard jo kisi bhi laptop se use ho'),
      text: bi(
        'Imagine an internal sales dashboard used by 2,000 employees on Windows, Mac and Linux. A web client is perfect: staff open a bookmark, IT never installs anything, and a fix shipped at noon is live for everyone by 12:01.',
        'Socho 2,000 employees ek internal sales dashboard Windows, Mac aur Linux par use karte hain. Yahan web client perfect hai: staff bas bookmark kholte hain, IT ko kuch install nahi karna padta, aur dopahar 12 baje ka fix 12:01 tak sabke paas live hota hai.',
      ),
      why: [
        bi('No installation — a link is enough.', 'Install ki zaroorat nahi — ek link kaafi hai.'),
        bi('One deploy updates every user instantly.', 'Ek deploy se har user turant update ho jaata hai.'),
        bi('Works on every operating system with a modern browser.', 'Modern browser wale har operating system par chalta hai.'),
      ],
    },
    avoidWhen: [
      bi('You need deep device features such as background location, Bluetooth or always-on notifications — a mobile app does this better.', 'Agar aapko background location, Bluetooth ya hamesha-on notifications jaise deep device features chahiye — mobile app yeh behtar karta hai.'),
      bi('You trust the browser for prices, permissions or validation. Users can edit anything in their browser; always re-check on the server.', 'Agar aap prices, permissions ya validation ke liye browser par bharosa karte ho. User browser mein kuch bhi badal sakta hai; server par hamesha dobara check karo.'),
      bi('The browser connects straight to a database or queue. Clients must always go through an entry point and your services.', 'Browser seedha database ya queue se connect ho. Client ko hamesha entry point aur aapki services ke through hi jaana chahiye.'),
    ],
    decisions: [
      bi('Which entry point it calls: a load balancer, an API gateway or a BFF.', 'Yeh kaunse entry point ko call karega: load balancer, API gateway ya BFF.'),
      bi('Which files are served from a CDN (JavaScript, images) versus the API.', 'Kaunsi files CDN se aayengi (JavaScript, images) aur kya API se.'),
      bi('How the user stays signed in: an httpOnly cookie or a token.', 'User signed-in kaise rahega: httpOnly cookie ya token.'),
    ],
    confusedWith: [
      { type: 'mobile-client', difference: bi('A mobile app is installed from an app store and can run in the background and receive push notifications; a web client needs no install but mostly works only while the tab is open.', 'Mobile app app store se install hota hai, background mein chal sakta hai aur push notifications le sakta hai; web client ko install nahi chahiye lekin zyada tar tab khula hone par hi kaam karta hai.'), compare: 'web-vs-mobile-vs-desktop-client' },
      { type: 'bff', difference: bi('The web client runs on the user’s device; a BFF is a server you run that prepares data specially for that client.', 'Web client user ke device par chalta hai; BFF aapka chalaya hua server hai jo khaas usi client ke liye data taiyaar karta hai.') },
    ],
    examples: ['Google Chrome', 'Safari', 'Mozilla Firefox', 'Microsoft Edge'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'mobile-client',
    tagline: bi('An app in the user’s pocket — always with them, even when offline.', 'User ki jeb mein ek app — hamesha saath, offline hone par bhi.'),
    intro: bi(
      'A mobile client is an iOS or Android app installed on a phone. Like a web client it shows screens and sends requests to your backend, but it also lives on the device: it can store data locally, use the camera and GPS, run briefly in the background and receive push notifications.\n\nThe catch is that you do not control when users update. Several versions of your app will call your API at the same time, sometimes over weak 3G networks.',
      'Mobile client ek iOS ya Android app hai jo phone par install hota hai. Web client ki tarah yeh bhi screens dikhata hai aur backend ko requests bhejta hai, lekin yeh device par rehta bhi hai: local data store kar sakta hai, camera aur GPS use kar sakta hai, thodi der background mein chal sakta hai aur push notifications le sakta hai.\n\nDikkat yeh hai ki users kab update karenge, yeh aapke haath mein nahi. Aapke app ke kai versions ek saath aapki API call karenge, kabhi-kabhi kamzor 3G network par.',
    ),
    problem: bi(
      'A mobile website alone cannot reach users when the site is closed, struggles without network, and cannot use many phone features. For a food delivery or ride app, “open the website and keep refreshing” is not good enough.',
      'Sirf mobile website, site band hone par users tak nahi pahunch sakti, network ke bina mushkil mein aa jaati hai, aur phone ke kai features use nahi kar paati. Food delivery ya ride app ke liye “website kholo aur refresh karte raho” kaafi nahi hai.',
    ),
    before: scene(
      [[a('user', 'User', 'User')], [a('site', 'Globe', 'Mobile website', { note: 'tab closed', state: 'bad' })], [c('app-server', { label: 'Order service' })]],
      [['app-server!>site', 'order ready'], 'user.>site'],
      bi('The order is ready, but the website is closed — the user never hears about it.', 'Order ready hai, lekin website band hai — user ko pata hi nahi chalta.'),
    ),
    solution: bi(
      'A native app stays installed, keeps a local copy of important data so it opens instantly, and can be woken up by a push notification. It talks to your backend through an entry point, and the backend keeps old app versions working.',
      'Native app install rehta hai, important data ki local copy rakhta hai taaki turant khule, aur push notification se jagaya ja sakta hai. Yeh entry point ke through backend se baat karta hai, aur backend purane app versions ko bhi chalta rakhta hai.',
    ),
    after: scene(
      [[c('mobile-client', { state: 'focus' })], [c('api-gateway')], [c('app-server', { label: 'Order service' })], [c('push-provider')]],
      ['mobile-client>api-gateway', 'api-gateway>app-server', 'app-server~>push-provider', ['push-provider~>mobile-client', 'push']],
      bi('The app calls the API normally, and the backend can still reach it with a push notification when it is closed.', 'App normal tarah API call karta hai, aur band hone par bhi backend push notification se use pahunch sakta hai.'),
    ),
    steps: [
      bi('The user installs the app once from the App Store or Play Store.', 'User ek baar App Store ya Play Store se app install karta hai.'),
      bi('On launch it shows cached data immediately, then refreshes from the API.', 'Kholte hi yeh cached data turant dikhata hai, phir API se refresh karta hai.'),
      bi('Actions become API calls through your gateway or load balancer; failed calls are retried when the network returns.', 'Actions gateway ya load balancer ke through API calls bante hain; fail hui calls network wapas aane par retry hoti hain.'),
      bi('When something happens while the app is closed, the backend sends a push via APNs or FCM.', 'App band hone par kuch hota hai, toh backend APNs ya FCM se push bhejta hai.'),
      bi('Old app versions keep working because the API stays backward compatible.', 'Purane app versions chalte rehte hain kyunki API backward compatible rehti hai.'),
    ],
    analogy: {
      icons: ['Wallet', 'Bell'],
      title: bi('Your own wallet versus a bank branch', 'Apna wallet vs bank branch'),
      text: bi(
        'A website is like visiting a bank branch: you must go there to see anything. A mobile app is like a wallet in your pocket: some cash (cached data) is always with you, and the bank can send you an SMS (a push notification) even when you are not thinking about it.',
        'Website bank branch jaane jaisi hai: kuch bhi dekhne ke liye wahan jaana padta hai. Mobile app jeb mein rakhe wallet jaisa hai: thoda cash (cached data) hamesha saath rehta hai, aur bank aapko SMS (push notification) bhej sakta hai jab aap uske baare mein soch bhi nahi rahe.',
      ),
    },
    perfectFit: {
      title: bi('A ride-hailing app for drivers', 'Drivers ke liye ride-hailing app'),
      text: bi(
        'Drivers keep the app open all day on patchy networks. It needs GPS in the background, a loud alert for every new trip request, and must survive tunnels without losing the current trip. Only an installed mobile app can do all three.',
        'Drivers poore din patchy network par app khula rakhte hain. Ise background mein GPS chahiye, har nayi trip request par tez alert chahiye, aur tunnel mein bhi current trip lose nahi honi chahiye. Yeh teeno kaam sirf installed mobile app kar sakta hai.',
      ),
      why: [
        bi('Background location and device sensors.', 'Background location aur device sensors.'),
        bi('Push alerts even when the app is closed.', 'App band ho tab bhi push alerts.'),
        bi('Local storage keeps working through bad networks.', 'Kharab network mein bhi local storage kaam karta rehta hai.'),
      ],
    },
    avoidWhen: [
      bi('A one-time task (paying a parking fine) — nobody wants to install an app for that; a web page is better.', 'Ek baar ka kaam (parking fine bharna) — iske liye koi app install nahi karna chahta; web page behtar hai.'),
      bi('You change the API in a breaking way. Users on old versions will crash; version your API instead.', 'API ko breaking tarike se badalna. Purane version wale users crash honge; API ko version karo.'),
      bi('The app talks straight to a database or storage with admin keys hidden inside — keys in an app are never secret.', 'App admin keys chhupa ke seedha database ya storage se baat kare — app ke andar ki keys kabhi secret nahi hoti.'),
    ],
    decisions: [
      bi('Which entry point the app calls (gateway or BFF made for mobile).', 'App kaunse entry point ko call karega (gateway ya mobile ke liye bana BFF).'),
      bi('What to cache on the phone and how to sync when back online.', 'Phone par kya cache karna hai aur online aane par sync kaise karna hai.'),
      bi('Whether you need push notifications (and therefore a push provider).', 'Push notifications chahiye ya nahi (aur isliye push provider).'),
    ],
    confusedWith: [
      { type: 'web-client', difference: bi('Same job of showing screens, but the mobile app is installed, can run in the background and receive pushes; the web client needs no install.', 'Screens dikhane ka kaam same hai, lekin mobile app install hota hai, background mein chal sakta hai aur push le sakta hai; web client ko install nahi chahiye.'), compare: 'web-vs-mobile-vs-desktop-client' },
      { type: 'push-provider', difference: bi('The push provider (APNs/FCM) is the delivery service that wakes the phone; the mobile client is the app that receives the message.', 'Push provider (APNs/FCM) woh delivery service hai jo phone ko jagati hai; mobile client woh app hai jo message receive karta hai.') },
    ],
    examples: ['iOS apps (Swift)', 'Android apps (Kotlin)', 'React Native', 'Flutter'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'desktop-client',
    tagline: bi('A full program on the computer — maximum power, maximum local control.', 'Computer par poora program — sabse zyada power, sabse zyada local control.'),
    intro: bi(
      'A desktop client is an application installed on Windows, macOS or Linux — think of a video editor, a trading terminal, or a chat app that lives in the taskbar. It can use the full CPU and GPU, read and write local files, and keep running in the background.\n\nLike any client, it should never be trusted with secrets or final decisions. It sends requests to your backend, and your servers decide what is allowed.',
      'Desktop client Windows, macOS ya Linux par install hone wala application hai — jaise video editor, trading terminal, ya taskbar mein rehne wala chat app. Yeh poora CPU aur GPU use kar sakta hai, local files padh-likh sakta hai, aur background mein chalta reh sakta hai.\n\nKisi bhi client ki tarah, ise secrets ya final decisions nahi saunpne chahiye. Yeh backend ko requests bhejta hai, aur kya allowed hai yeh aapke servers decide karte hain.',
    ),
    problem: bi(
      'Some work is too heavy or too local for a browser tab: editing 4K video, syncing a folder of 50,000 files, or showing hundreds of live price updates per second. Browsers limit file access, memory and background work, so these products felt slow or impossible on the web.',
      'Kuch kaam browser tab ke liye bahut bhaari ya bahut local hote hain: 4K video edit karna, 50,000 files ka folder sync karna, ya har second sainkadon live price updates dikhana. Browser file access, memory aur background kaam ko limit karta hai, isliye yeh products web par slow ya namumkin lagte the.',
    ),
    before: scene(
      [[a('files', 'FolderOpen', 'Local folder', { note: '50,000 files' })], [a('tab', 'Globe', 'Browser tab', { note: 'no folder access', state: 'bad' })], [c('object-storage', { label: 'Cloud storage' })]],
      ['files!>tab', 'tab.>object-storage'],
      bi('A browser tab cannot quietly watch and sync a whole local folder.', 'Browser tab chupchaap poore local folder ko watch aur sync nahi kar sakta.'),
    ),
    solution: bi(
      'An installed desktop client can watch local folders, use the full machine and run in the background. It still syncs through your backend: it uploads changes, asks the server what changed elsewhere, and lets the server resolve conflicts.',
      'Installed desktop client local folders ko watch kar sakta hai, poori machine use kar sakta hai aur background mein chal sakta hai. Phir bhi sync backend ke through hi hota hai: yeh changes upload karta hai, server se poochta hai ki aur kahan kya badla, aur conflicts server resolve karta hai.',
    ),
    after: scene(
      [[a('files', 'FolderOpen', 'Local folder')], [c('desktop-client', { state: 'focus', label: 'Sync app' })], [c('load-balancer')], [c('app-server', { label: 'Sync service' })]],
      ['files<>desktop-client', 'desktop-client>load-balancer', 'load-balancer>app-server'],
      bi('The desktop app watches the folder and syncs changes through your backend.', 'Desktop app folder ko watch karta hai aur changes backend ke through sync karta hai.'),
    ),
    steps: [
      bi('The user installs the app once; it starts with the computer if needed.', 'User ek baar app install karta hai; zaroorat ho toh computer ke saath start hota hai.'),
      bi('It works with local files, hardware and the full screen.', 'Yeh local files, hardware aur poori screen ke saath kaam karta hai.'),
      bi('It talks to your backend through an entry point, like any other client.', 'Kisi bhi client ki tarah yeh entry point ke through backend se baat karta hai.'),
      bi('It checks for updates and installs them itself (auto-update).', 'Yeh updates check karke khud install karta hai (auto-update).'),
    ],
    analogy: {
      icons: ['House', 'Hammer'],
      title: bi('Your own workshop at home', 'Ghar par apni workshop'),
      text: bi(
        'A web app is like renting a desk in a shared office — convenient, but you cannot install heavy machines. A desktop app is your own workshop at home: you can bring big tools and work any time, but you have to maintain and upgrade the tools yourself.',
        'Web app shared office mein desk kiraye par lene jaisa hai — convenient, lekin bhaari machines install nahi kar sakte. Desktop app ghar par apni workshop hai: bade tools la sakte ho aur kabhi bhi kaam kar sakte ho, lekin tools ko maintain aur upgrade khud karna padta hai.',
      ),
    },
    perfectFit: {
      title: bi('A file-sync app like the ones that keep a folder backed up', 'File-sync app jo ek folder ko backup rakhta hai'),
      text: bi(
        'A sync client must watch a local folder all day, upload only changed parts of big files, and keep working after a reboot. That is native, background, file-system work — exactly what a desktop client is for.',
        'Sync client ko poore din local folder watch karna hai, bade files ke sirf badle hue hisse upload karne hain, aur reboot ke baad bhi chalte rehna hai. Yeh native, background, file-system ka kaam hai — desktop client isi ke liye bana hai.',
      ),
      why: [
        bi('Full access to local files and folders.', 'Local files aur folders ka poora access.'),
        bi('Runs in the background after reboots.', 'Reboot ke baad bhi background mein chalta hai.'),
        bi('Can use the whole CPU, memory and disk.', 'Poora CPU, memory aur disk use kar sakta hai.'),
      ],
    },
    avoidWhen: [
      bi('A simple form or content site — installing software is a big ask for a small job.', 'Simple form ya content site — chhote kaam ke liye software install karwana zyada hai.'),
      bi('You ship secrets inside the app expecting nobody to read them.', 'App ke andar secrets daal ke sochna ki koi nahi padhega.'),
      bi('You cannot support many versions at once; desktop users update late.', 'Ek saath kai versions support nahi kar sakte; desktop users der se update karte hain.'),
    ],
    decisions: [
      bi('Which backend entry point it uses and how it authenticates.', 'Kaunsa backend entry point use karega aur kaise authenticate karega.'),
      bi('How auto-update works and how long old versions stay supported.', 'Auto-update kaise chalega aur purane versions kitne time support honge.'),
      bi('What happens offline and how conflicts are resolved later.', 'Offline mein kya hoga aur baad mein conflicts kaise resolve honge.'),
    ],
    confusedWith: [
      { type: 'web-client', difference: bi('A web client runs in a tab with no install but limited access; a desktop client is installed and can use the whole machine.', 'Web client bina install tab mein chalta hai lekin limited access ke saath; desktop client install hota hai aur poori machine use kar sakta hai.'), compare: 'web-vs-mobile-vs-desktop-client' },
    ],
    examples: ['Electron apps', 'Native Windows apps', 'macOS apps', 'Trading terminals'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'dns',
    tagline: bi('The internet’s phone book — turns a name into the right address.', 'Internet ki phone book — naam ko sahi address mein badalti hai.'),
    intro: bi(
      'Computers find each other with IP addresses like 203.0.113.42, but people remember names like shop.example.com. DNS (Domain Name System) translates the name into an address.\n\nIn system design DNS does more than translate: it can give different answers to different users — the closest region, or a backup region when one is down. That makes it the very first step of global traffic routing.',
      'Computers ek doosre ko 203.0.113.42 jaise IP addresses se dhundte hain, lekin log shop.example.com jaise naam yaad rakhte hain. DNS (Domain Name System) naam ko address mein translate karta hai.\n\nSystem design mein DNS sirf translate nahi karta: yeh alag users ko alag jawab de sakta hai — sabse paas wala region, ya ek region down ho toh backup region. Isliye yeh global traffic routing ka sabse pehla step hai.',
    ),
    problem: bi(
      'Without DNS, every app would hard-code server IP addresses. Move to a new server or add a second region and every client would break. And users in Mumbai would be sent to a server in Virginia because nothing chooses the closest one.',
      'DNS ke bina har app mein server ke IP addresses hard-code hote. Naye server par shift karo ya doosra region jodo, toh har client toot jaata. Aur Mumbai ke users ko Virginia ke server par bheja jaata kyunki sabse paas wala chunne wala koi nahi.',
    ),
    before: scene(
      [[a('user', 'User', 'User in Mumbai')], [a('ip', 'Hash', '54.12.8.1', { note: 'hard-coded' })], [c('load-balancer', { id: 'us', label: 'US region', note: '250 ms away', state: 'bad' })]],
      ['user>ip', 'ip!>us'],
      bi('A hard-coded address sends everyone to one far-away region — and breaks when it changes.', 'Hard-coded address sabko ek door ke region bhejta hai — aur badalte hi toot jaata hai.'),
    ),
    solution: bi(
      'With DNS, clients only know a name. DNS answers with the best address for that user — the nearest healthy region — and you can change servers by updating a record instead of updating every app.',
      'DNS ke saath clients sirf naam jaante hain. DNS us user ke liye sabse achha address deta hai — sabse paas ka healthy region — aur servers badalne ke liye har app nahi, bas ek record update karna hota hai.',
    ),
    after: scene(
      [[a('user', 'User', 'User in Mumbai')], [c('dns', { state: 'focus' })], [c('load-balancer', { id: 'in', label: 'India region', state: 'good' }), c('load-balancer', { id: 'us', label: 'US region', state: 'muted' })]],
      ['user>dns', ['dns>in', 'nearest'], 'dns.>us'],
      bi('DNS points each user to the nearest healthy region.', 'DNS har user ko sabse paas ke healthy region ki taraf bhejta hai.'),
    ),
    steps: [
      bi('The user’s device asks a DNS resolver: “What is the address of shop.example.com?”', 'User ka device DNS resolver se poochta hai: “shop.example.com ka address kya hai?”'),
      bi('The resolver asks the authoritative DNS for your domain (or uses a cached answer).', 'Resolver aapke domain ke authoritative DNS se poochta hai (ya cached jawab use karta hai).'),
      bi('Your DNS policy picks an answer: nearest region (latency), by country (geo), or a backup (failover).', 'Aapki DNS policy jawab chunti hai: sabse paas ka region (latency), desh ke hisaab se (geo), ya backup (failover).'),
      bi('The answer is cached for its TTL (for example 60 seconds), so DNS is not asked on every request.', 'Jawab TTL tak cache hota hai (jaise 60 seconds), isliye har request par DNS se nahi poocha jaata.'),
      bi('The client connects to that address — usually a load balancer or CDN.', 'Client us address se connect karta hai — aam taur par load balancer ya CDN.'),
    ],
    analogy: {
      icons: ['BookOpen', 'Phone'],
      title: bi('A phone book that knows where you are', 'Ek phone book jo jaanti hai aap kahan ho'),
      text: bi(
        'You want to call “Pizza Palace”. You do not remember the number, so you look it up. A smart phone book gives you the number of the branch nearest to you — and if that branch is closed today, it gives you the next nearest.\n\nYou only remember the name; the book handles which branch you reach.',
        'Aapko “Pizza Palace” call karna hai. Number yaad nahi, toh aap dhundte ho. Ek smart phone book aapko sabse paas wali branch ka number deti hai — aur agar woh branch aaj band hai, toh agli sabse paas wali.\n\nAap sirf naam yaad rakhte ho; kaunsi branch se baat hogi, yeh book sambhalti hai.',
      ),
    },
    perfectFit: {
      title: bi('An app running in two regions', 'Do regions mein chalta app'),
      text: bi(
        'Your app runs in Mumbai and Frankfurt. Users in India should land in Mumbai, users in Europe in Frankfurt, and if Mumbai goes down everyone should move to Frankfurt within a minute. DNS with latency routing and health checks does exactly this before a single byte reaches your servers.',
        'Aapka app Mumbai aur Frankfurt mein chalta hai. India ke users Mumbai pahunchein, Europe ke Frankfurt, aur agar Mumbai down ho jaaye toh ek minute ke andar sab Frankfurt chale jaayein. Latency routing aur health checks wala DNS yeh kaam aapke servers tak ek byte pahunchne se pehle hi kar deta hai.',
      ),
      why: [
        bi('Sends each user to the closest region.', 'Har user ko sabse paas ke region bhejta hai.'),
        bi('Moves traffic away from a failed region.', 'Fail hue region se traffic hata deta hai.'),
        bi('Lets you change servers without touching clients.', 'Clients ko chhue bina servers badalne deta hai.'),
      ],
    },
    avoidWhen: [
      bi('You expect instant, per-request balancing. DNS answers are cached for seconds to minutes; use a load balancer for fine-grained spreading.', 'Agar aap har request par turant balancing chahte ho. DNS ke jawab seconds se minutes tak cache hote hain; barik spreading ke liye load balancer use karo.'),
      bi('You set a very long TTL and then need an emergency failover — clients will keep the old address.', 'Bahut lamba TTL rakhna aur phir emergency failover chahna — clients purana address hi rakhenge.'),
      bi('You point DNS directly at single servers. Point it at load balancers or a CDN instead.', 'DNS ko seedha single servers par point karna. Iske bajaye load balancers ya CDN par point karo.'),
    ],
    decisions: [
      bi('Routing policy: simple, latency, geo, weighted or failover.', 'Routing policy: simple, latency, geo, weighted ya failover.'),
      bi('TTL: short for fast failover, longer for fewer lookups.', 'TTL: jaldi failover ke liye chhota, kam lookups ke liye lamba.'),
      bi('What each record points to: regional load balancers or a CDN.', 'Har record kis par point karega: regional load balancers ya CDN.'),
    ],
    confusedWith: [
      { type: 'load-balancer', difference: bi('DNS chooses which region or address you go to, once and then cached; a load balancer chooses which server handles each request inside that region.', 'DNS chunta hai ki aap kis region ya address par jaoge, ek baar aur phir cache; load balancer chunta hai ki us region ke andar har request kaunsa server handle karega.'), compare: 'dns-vs-load-balancer' },
      { type: 'cdn', difference: bi('DNS only gives directions; a CDN actually stores and serves your files from nearby.', 'DNS sirf raasta batata hai; CDN sach mein aapki files paas se store aur serve karta hai.') },
    ],
    examples: ['Amazon Route 53', 'Cloudflare DNS', 'Google Cloud DNS', 'Azure DNS'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'cdn',
    tagline: bi('Copies of your files in hundreds of cities, so downloads start next door.', 'Aapki files ki copies sainkadon shehron mein, taaki download pados se shuru ho.'),
    intro: bi(
      'A CDN (Content Delivery Network) is a network of servers spread across the world, called edge locations. It keeps copies of your static files — images, videos, JavaScript, CSS — close to users.\n\nWhen someone in Chennai opens your site, the logo and video come from an edge in Chennai instead of your server in Virginia. Pages load faster and your own servers handle far less traffic.',
      'CDN (Content Delivery Network) duniya bhar mein faile servers ka network hai, jinhe edge locations kehte hain. Yeh aapki static files — images, videos, JavaScript, CSS — ki copies users ke paas rakhta hai.\n\nJab Chennai mein koi aapki site kholta hai, toh logo aur video Virginia ke server ke bajaye Chennai ke edge se aate hain. Pages tez load hote hain aur aapke servers par traffic bahut kam ho jaata hai.',
    ),
    problem: bi(
      'Every image and video travelled from one origin server to every user in the world. Far-away users waited seconds for each file, and a viral post could melt the origin because millions of people downloaded the same 5 MB video from it at once.',
      'Har image aur video ek hi origin server se duniya ke har user tak jaata tha. Door ke users har file ke liye seconds wait karte the, aur ek viral post origin ko pighla sakta tha kyunki lakhon log ek saath usi se wahi 5 MB video download karte.',
    ),
    before: scene(
      [[a('u1', 'User', 'User (India)'), a('u2', 'User', 'User (Brazil)'), a('u3', 'User', 'User (Japan)')], [c('object-storage', { label: 'Origin (US)', note: 'overloaded', state: 'bad' })]],
      [['u1>object-storage', '3 s'], ['u2>object-storage', '2 s'], ['u3>object-storage', '3 s']],
      bi('Everyone downloads from one far-away origin: slow for them, crushing for it.', 'Sab ek door ke origin se download karte hain: unke liye slow, origin ke liye bhaari.'),
    ),
    solution: bi(
      'With a CDN, users download from the nearest edge. The edge fetches a file from your origin only once, keeps it, and serves the next million requests itself. Your origin (often object storage) sees a tiny fraction of the traffic.',
      'CDN ke saath users sabse paas ke edge se download karte hain. Edge origin se file sirf ek baar laata hai, rakh leta hai, aur agli lakhon requests khud serve karta hai. Aapke origin (aksar object storage) par traffic ka chhota sa hissa hi aata hai.',
    ),
    after: scene(
      [[a('u1', 'User', 'User (India)'), a('u2', 'User', 'User (Brazil)')], [c('cdn', { id: 'e1', label: 'Edge Mumbai', state: 'focus' }), c('cdn', { id: 'e2', label: 'Edge São Paulo', state: 'focus' })], [c('object-storage', { label: 'Origin', state: 'good' })]],
      [['u1>e1', '20 ms'], ['u2>e2', '25 ms'], ['e1~>object-storage', 'once'], 'e2~>object-storage'],
      bi('Users hit a nearby edge; the origin is asked only on a cache miss.', 'Users paas ke edge tak jaate hain; origin se sirf cache miss par poocha jaata hai.'),
    ),
    steps: [
      bi('You put your files in an origin (usually object storage) and connect it to the CDN.', 'Aap files ek origin (aam taur par object storage) mein rakhte ho aur use CDN se jodte ho.'),
      bi('DNS sends each user to the nearest CDN edge.', 'DNS har user ko sabse paas ke CDN edge par bhejta hai.'),
      bi('If the edge already has the file (a cache hit), it returns it immediately.', 'Agar edge ke paas file pehle se hai (cache hit), toh turant de deta hai.'),
      bi('If not (a cache miss), the edge fetches it from the origin once and keeps a copy.', 'Agar nahi (cache miss), toh edge ek baar origin se laata hai aur copy rakh leta hai.'),
      bi('Files expire after a time-to-live, or you publish new versions under new file names.', 'Files time-to-live ke baad expire hoti hain, ya aap naye versions naye file names se publish karte ho.'),
    ],
    analogy: {
      icons: ['Factory', 'Store', 'User'],
      title: bi('Local shops instead of one factory', 'Ek factory ke bajaye local dukaanein'),
      text: bi(
        'A biscuit factory does not sell directly to every family in the country. It ships cartons to local shops, and you buy from the shop down the street. The shop restocks from the factory only when it runs out.\n\nThe CDN edges are the local shops, your origin is the factory, and nobody has to drive to the factory for a packet of biscuits.',
        'Biscuit factory desh ke har parivaar ko seedha nahi bechti. Woh local dukaanon ko cartons bhejti hai, aur aap gali ki dukaan se khareedte ho. Dukaan stock khatam hone par hi factory se mangwati hai.\n\nCDN edges local dukaanein hain, aapka origin factory hai, aur ek packet biscuit ke liye kisi ko factory tak nahi jaana padta.',
      ),
    },
    perfectFit: {
      title: bi('Product images for a big online sale', 'Badi online sale ke product images'),
      text: bi(
        'During a festival sale, 10 million shoppers view the same 2,000 product photos. A CDN serves those photos from edges in every city, so the pages stay fast and your storage barely notices the crowd.',
        'Festival sale mein 1 crore shoppers wahi 2,000 product photos dekhte hain. CDN yeh photos har shehar ke edges se serve karta hai, isliye pages tez rehte hain aur aapke storage ko bheed ka pata bhi nahi chalta.',
      ),
      why: [
        bi('The same files are read by huge numbers of people.', 'Wahi files bahut saare log padhte hain.'),
        bi('Files rarely change once published.', 'Publish hone ke baad files kam hi badalti hain.'),
        bi('Users are spread across many cities and countries.', 'Users kai shehron aur deshon mein faile hain.'),
      ],
    },
    avoidWhen: [
      bi('Data is private to one user and changes every second (a bank balance). Caching it at the edge is useless or risky.', 'Data ek user ka private hai aur har second badalta hai (bank balance). Ise edge par cache karna bekaar ya khatarnaak hai.'),
      bi('You forget invalidation: users keep seeing the old logo. Use versioned file names.', 'Invalidation bhoolna: users purana logo dekhte rehte hain. Versioned file names use karo.'),
      bi('Your users are all in one city next to your server — the gain is small.', 'Aapke saare users aapke server ke paas ek hi shehar mein hain — fayda chhota hai.'),
    ],
    decisions: [
      bi('What to cache: static assets, media, or also some API responses.', 'Kya cache karna hai: static assets, media, ya kuch API responses bhi.'),
      bi('How updates reach users: time-to-live expiry, purging, or versioned URLs.', 'Updates users tak kaise pahunchenge: TTL expiry, purge, ya versioned URLs.'),
      bi('The origin it pulls from — typically object storage.', 'Kis origin se file layega — aam taur par object storage.'),
    ],
    confusedWith: [
      { type: 'cdn-cache', difference: bi('In this playground, CDN means the whole edge network delivering files from an origin; CDN cache is the caching layer in front of your API for cacheable responses.', 'Is playground mein CDN matlab poora edge network jo origin se files deliver karta hai; CDN cache aapki API ke aage wali caching layer hai jo cacheable responses ke liye hai.'), compare: 'cdn-vs-cdn-cache' },
      { type: 'object-storage', difference: bi('Object storage is where the original files live safely; the CDN keeps temporary copies near users.', 'Object storage woh jagah hai jahan original files safely rehti hain; CDN users ke paas temporary copies rakhta hai.') },
    ],
    examples: ['Cloudflare', 'Amazon CloudFront', 'Akamai', 'Fastly'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'load-balancer',
    tagline: bi('A traffic controller that spreads requests over many servers.', 'Ek traffic controller jo requests ko kai servers mein baantta hai.'),
    intro: bi(
      'A load balancer sits in front of a group of identical servers and hands each incoming request to one of them. If one server is busy or broken, it sends the request to another.\n\nIt is the reason you can run 3, 10 or 100 copies of your app and have users see a single, always-available service. Clients only know the load balancer’s address; the servers behind it can come and go.',
      'Load balancer ek jaise servers ke group ke aage baithta hai aur har aane wali request unme se kisi ek ko de deta hai. Agar ek server busy ya kharab hai, toh request doosre ko bhej deta hai.\n\nIsi ki wajah se aap apne app ki 3, 10 ya 100 copies chala sakte ho aur users ko ek hi, hamesha available service dikhti hai. Clients sirf load balancer ka address jaante hain; peeche ke servers aate-jaate reh sakte hain.',
    ),
    problem: bi(
      'With one server, all traffic hits one machine. When the morning rush comes it slows to a crawl, and when it crashes the whole product is down. Adding a second server does not help either — clients would not know it exists or how to split traffic.',
      'Ek server ke saath saara traffic ek hi machine par aata hai. Subah ki rush mein woh bahut slow ho jaata hai, aur crash ho jaaye toh poora product down. Doosra server jodne se bhi fayda nahi — clients ko pata hi nahi ki woh hai, ya traffic kaise baantein.',
    ),
    before: scene(
      [[a('u1', 'User', 'User'), a('u2', 'User', 'User'), a('u3', 'User', 'User')], [c('app-server', { label: 'Only server', note: '100% CPU', state: 'bad' })]],
      ['u1>app-server', 'u2>app-server', 'u3>app-server'],
      bi('One server takes every request — slow at peak and a single point of failure.', 'Ek server har request leta hai — peak par slow aur single point of failure.'),
    ),
    solution: bi(
      'The load balancer receives all traffic and spreads it across healthy servers. It checks each server every few seconds and stops sending traffic to any that fail. Need more capacity? Add servers behind it — clients notice nothing.',
      'Load balancer saara traffic leta hai aur healthy servers mein baant deta hai. Yeh har kuch seconds mein har server check karta hai aur fail hone wale ko traffic bhejna band kar deta hai. Zyada capacity chahiye? Peeche servers jodo — clients ko kuch pata nahi chalta.',
    ),
    after: scene(
      [[a('users', 'Users', 'Users')], [c('load-balancer', { state: 'focus' })], [c('app-server', { id: 's1', label: 'Server 1', state: 'good' }), c('app-server', { id: 's2', label: 'Server 2', state: 'good' }), c('app-server', { id: 's3', label: 'Server 3', note: 'failed', state: 'bad' })]],
      ['users>load-balancer', 'load-balancer>s1', 'load-balancer>s2', ['load-balancer.>s3', 'skipped']],
      bi('Traffic is shared by healthy servers; a failed one is skipped automatically.', 'Traffic healthy servers mein baantta hai; fail hua server apne aap skip ho jaata hai.'),
    ),
    steps: [
      bi('Clients send requests to one address — the load balancer.', 'Clients ek hi address par requests bhejte hain — load balancer.'),
      bi('It keeps a list of servers and health-checks them (for example, every 5 seconds).', 'Yeh servers ki list rakhta hai aur unka health-check karta hai (jaise har 5 seconds).'),
      bi('For each request it picks a healthy server using an algorithm: round robin, least connections, or a hash of the user.', 'Har request ke liye algorithm se ek healthy server chunta hai: round robin, least connections, ya user ka hash.'),
      bi('The server does the work and the response flows back through the load balancer.', 'Server kaam karta hai aur response load balancer se wapas jaata hai.'),
      bi('Autoscaling adds or removes servers behind it as traffic changes.', 'Traffic badalne par autoscaling peeche servers jodta ya hatata hai.'),
    ],
    analogy: {
      icons: ['Users', 'TrafficCone', 'Store'],
      title: bi('The person who sends you to the free billing counter', 'Woh insaan jo aapko khaali billing counter par bhejta hai'),
      text: bi(
        'In a busy supermarket, a staff member stands at the front of the queue and points each customer to whichever counter is free: “Counter 3, please.” If counter 5 closes, nobody is sent there any more.\n\nShoppers never choose a counter themselves — and the store can open more counters on a busy Saturday without changing anything for shoppers.',
        'Bheed wale supermarket mein ek staff member queue ke aage khada hota hai aur har customer ko jo counter khaali ho wahan bhejta hai: “Counter 3, please.” Agar counter 5 band ho jaaye, toh wahan koi nahi bheja jaata.\n\nShoppers khud counter nahi chunte — aur store busy Saturday ko shoppers ke liye kuch badle bina zyada counters khol sakta hai.',
      ),
    },
    perfectFit: {
      title: bi('A web app with a busy lunch-hour peak', 'Lunch-hour peak wala web app'),
      text: bi(
        'A food ordering app gets 10× more traffic between 12 and 2 pm. Behind a load balancer, autoscaling grows from 4 to 20 app servers at noon and back down at 3 pm, and if one server crashes mid-order the next request simply goes elsewhere.',
        'Food ordering app par 12 se 2 baje ke beech 10 guna traffic aata hai. Load balancer ke peeche autoscaling dopahar mein 4 se 20 app servers tak badhti hai aur 3 baje wapas ghatti hai, aur agar order ke beech ek server crash ho, toh agli request bas kahin aur chali jaati hai.',
      ),
      why: [
        bi('Many identical, stateless servers do the same job.', 'Kai ek jaise, stateless servers wahi kaam karte hain.'),
        bi('Traffic rises and falls during the day.', 'Din mein traffic badhta aur ghatta hai.'),
        bi('A single server failure must not take the product down.', 'Ek server fail hone se product down nahi hona chahiye.'),
      ],
    },
    avoidWhen: [
      bi('There is only one server behind it — it adds a hop without spreading anything (fine only as a step towards scaling).', 'Peeche sirf ek server ho — yeh bina kuch baante ek hop jod deta hai (sirf scaling ki taraf ek step ke roop mein theek).'),
      bi('Your servers keep user sessions in memory. Requests from one user land on different servers; keep servers stateless or session data in a shared cache.', 'Servers user sessions memory mein rakhte hain. Ek user ki requests alag servers par jaati hain; servers ko stateless rakho ya session data shared cache mein.'),
      bi('You need API keys, per-user quotas or request transformation — that is an API gateway’s job.', 'Aapko API keys, per-user quotas ya request transformation chahiye — yeh API gateway ka kaam hai.'),
    ],
    decisions: [
      bi('Algorithm: round robin, least connections, IP hash or consistent hash.', 'Algorithm: round robin, least connections, IP hash ya consistent hash.'),
      bi('Health checks: how often, and what counts as healthy.', 'Health checks: kitni baar, aur healthy kise maanein.'),
      bi('Layer 4 (fast, connection level) or layer 7 (understands HTTP paths and headers).', 'Layer 4 (tez, connection level) ya layer 7 (HTTP paths aur headers samajhta hai).'),
    ],
    confusedWith: [
      { type: 'api-gateway', difference: bi('A load balancer only spreads traffic over copies of one service; an API gateway also knows who the caller is, applies per-user limits and routes different paths to different services.', 'Load balancer sirf ek service ki copies mein traffic baantta hai; API gateway yeh bhi jaanta hai ki caller kaun hai, per-user limits lagata hai aur alag paths ko alag services par bhejta hai.'), compare: 'load-balancer-vs-api-gateway-vs-reverse-proxy' },
      { type: 'dns', difference: bi('DNS chooses a region once and the answer is cached; the load balancer decides for every single request inside the region.', 'DNS ek baar region chunta hai aur jawab cache hota hai; load balancer region ke andar har ek request ka faisla karta hai.'), compare: 'dns-vs-load-balancer' },
    ],
    examples: ['AWS Elastic Load Balancing', 'NGINX', 'HAProxy', 'Google Cloud Load Balancing'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'api-gateway',
    tagline: bi('One front door for all your APIs — checks who you are, then sends you to the right room.', 'Saari APIs ka ek main darwaza — pehle check karta hai aap kaun ho, phir sahi kamre mein bhejta hai.'),
    intro: bi(
      'An API gateway is the single entry point for client requests to many backend services. Before a request reaches your code, the gateway can check the caller’s token or API key, enforce rate limits, log the call, and route it by path: /orders to the order service, /users to the user service.\n\nIt takes the boring, repeated work out of every service so each team only writes business logic.',
      'API gateway client requests ke liye kai backend services ka single entry point hai. Request aapke code tak pahunchne se pehle gateway caller ka token ya API key check kar sakta hai, rate limits laga sakta hai, call log kar sakta hai, aur path ke hisaab se route kar sakta hai: /orders order service ko, /users user service ko.\n\nYeh har service se boring, baar-baar ka kaam hata deta hai taaki har team sirf business logic likhe.',
    ),
    problem: bi(
      'With many microservices, clients had to know every service’s address. Each service re-implemented login checks, rate limiting and logging — slightly differently — and one forgotten check left an endpoint wide open.',
      'Kai microservices ke saath clients ko har service ka address jaanna padta tha. Har service login checks, rate limiting aur logging khud banati thi — thoda alag-alag — aur ek bhoola hua check kisi endpoint ko poora khula chhod deta tha.',
    ),
    before: scene(
      [[c('mobile-client')], [c('microservice', { id: 'orders', label: 'Orders', note: 'own auth' }), c('microservice', { id: 'users', label: 'Users', note: 'own auth' }), c('microservice', { id: 'pay', label: 'Payments', note: 'auth forgotten!', state: 'bad' })]],
      ['mobile-client>orders', 'mobile-client>users', 'mobile-client!>pay'],
      bi('The app calls every service directly, and each one guards itself — one forgets.', 'App har service ko seedha call karta hai, aur har ek apni hifazat khud karti hai — ek bhool jaati hai.'),
    ),
    solution: bi(
      'All calls enter through the gateway. It authenticates once, rejects abusive callers, and forwards each request to the right service. Services trust the gateway’s checks and focus on their own job.',
      'Saari calls gateway se andar aati hain. Yeh ek baar authenticate karta hai, abusive callers ko reject karta hai, aur har request ko sahi service par bhej deta hai. Services gateway ke checks par bharosa karti hain aur apne kaam par dhyaan deti hain.',
    ),
    after: scene(
      [[c('mobile-client')], [c('api-gateway', { state: 'focus', note: 'auth · limits' })], [c('microservice', { id: 'orders', label: 'Orders' }), c('microservice', { id: 'users', label: 'Users' }), c('microservice', { id: 'pay', label: 'Payments' })]],
      ['mobile-client>api-gateway', ['api-gateway>orders', '/orders'], ['api-gateway>users', '/users'], ['api-gateway>pay', '/pay']],
      bi('One door: checks identity and limits once, then routes by path.', 'Ek darwaza: identity aur limits ek baar check, phir path ke hisaab se route.'),
    ),
    steps: [
      bi('The client sends every API call to the gateway’s address.', 'Client har API call gateway ke address par bhejta hai.'),
      bi('The gateway validates the token or API key and rejects bad ones immediately.', 'Gateway token ya API key validate karta hai aur galat ko turant reject karta hai.'),
      bi('It applies rate limits and quotas per user or API key.', 'Yeh per user ya API key rate limits aur quotas lagata hai.'),
      bi('It routes the request by path or version to the right service (often via that service’s load balancer).', 'Yeh request ko path ya version ke hisaab se sahi service par bhejta hai (aksar us service ke load balancer ke through).'),
      bi('It records metrics and logs for every call and returns the response.', 'Yeh har call ke metrics aur logs record karta hai aur response lautaata hai.'),
    ],
    analogy: {
      icons: ['Hotel', 'IdCard', 'DoorOpen'],
      title: bi('A hotel reception desk', 'Hotel ka reception desk'),
      text: bi(
        'Guests do not wander the corridors knocking on doors. They go to reception, show their ID, and reception tells them where to go — room 204, the spa, or the restaurant. Reception also refuses people without a booking.\n\nThe rooms (services) never check IDs themselves; reception already did.',
        'Guests galiyaron mein ghoom-ghoom ke darwaze nahi khatkhatate. Woh reception jaate hain, ID dikhate hain, aur reception batata hai kahan jaana hai — room 204, spa, ya restaurant. Reception bina booking walon ko mana bhi karta hai.\n\nRooms (services) khud ID check nahi karte; reception pehle hi kar chuka hai.',
      ),
    },
    perfectFit: {
      title: bi('A public API used by thousands of partner apps', 'Hazaaron partner apps dwara use hone wali public API'),
      text: bi(
        'A payments company exposes /charges, /refunds and /customers to 5,000 merchant apps, each with its own API key and plan limits. The gateway checks keys, enforces each merchant’s quota and routes to the right service — no service has to know about plans or keys.',
        'Ek payments company 5,000 merchant apps ko /charges, /refunds aur /customers deti hai, har ek ki apni API key aur plan limits ke saath. Gateway keys check karta hai, har merchant ka quota lagata hai aur sahi service par route karta hai — kisi service ko plans ya keys ke baare mein jaanna nahi padta.',
      ),
      why: [
        bi('Many callers, each identified by a key or token.', 'Kai callers, har ek key ya token se pehchana jaata hai.'),
        bi('Per-caller quotas protect shared capacity.', 'Per-caller quotas shared capacity ko bachate hain.'),
        bi('Many services hidden behind one public address.', 'Kai services ek public address ke peeche chhupi.'),
      ],
    },
    avoidWhen: [
      bi('You put business logic in it (“if the order is above ₹5,000 then…”). Keep it a thin layer; logic belongs in services.', 'Isme business logic daalna (“agar order ₹5,000 se upar hai toh…”). Ise patli layer rakho; logic services mein hona chahiye.'),
      bi('Only one simple service exists — a load balancer is enough.', 'Sirf ek simple service hai — load balancer kaafi hai.'),
      bi('Services can still be reached without going through it — then its checks are easy to bypass.', 'Services ab bhi iske bina reach ho sakti hain — tab iske checks aasani se bypass ho jaate hain.'),
    ],
    decisions: [
      bi('Authentication method: JWT, OAuth2 or API keys.', 'Authentication method: JWT, OAuth2 ya API keys.'),
      bi('Rate limiting: per user, per IP or per API key.', 'Rate limiting: per user, per IP ya per API key.'),
      bi('Timeouts and how routes map to services.', 'Timeouts aur routes services se kaise map hote hain.'),
    ],
    confusedWith: [
      { type: 'load-balancer', difference: bi('The gateway understands callers and routes; the load balancer only spreads load across copies of one service. Big systems often use both: gateway → load balancer → service.', 'Gateway callers aur routes samajhta hai; load balancer sirf ek service ki copies mein load baantta hai. Bade systems aksar dono use karte hain: gateway → load balancer → service.'), compare: 'load-balancer-vs-api-gateway-vs-reverse-proxy' },
      { type: 'auth-service', difference: bi('The auth service signs users in and issues tokens; the gateway only checks those tokens on every request.', 'Auth service users ko sign in karati hai aur tokens deti hai; gateway har request par bas un tokens ko check karta hai.'), compare: 'auth-service-vs-identity-provider-vs-api-gateway' },
      { type: 'bff', difference: bi('A gateway is shared by all clients and stays generic; a BFF is built for one client and shapes data for its screens.', 'Gateway saare clients ka shared hota hai aur generic rehta hai; BFF ek client ke liye bana hota hai aur uski screens ke hisaab se data shape karta hai.') },
    ],
    examples: ['Amazon API Gateway', 'Kong', 'Apigee', 'Azure API Management'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    type: 'reverse-proxy',
    tagline: bi('A front desk that speaks to the outside world on behalf of your servers.', 'Ek front desk jo aapke servers ki taraf se bahar ki duniya se baat karta hai.'),
    intro: bi(
      'A reverse proxy is a server that sits in front of your backend servers and forwards client requests to them. Clients talk only to the proxy; your real servers stay hidden on a private network.\n\nOn the way, it can terminate HTTPS, compress responses, cache simple files and send /static to one server and /api to another. Many load balancers and gateways are built on top of a reverse proxy.',
      'Reverse proxy ek server hai jo backend servers ke aage baithta hai aur client requests unhe forward karta hai. Clients sirf proxy se baat karte hain; asli servers private network par chhupe rehte hain.\n\nRaaste mein yeh HTTPS terminate kar sakta hai, responses compress kar sakta hai, simple files cache kar sakta hai, aur /static ek server ko aur /api doosre ko bhej sakta hai. Kai load balancers aur gateways reverse proxy ke upar hi bane hote hain.',
    ),
    problem: bi(
      'Each application server was exposed directly to the internet. Every one of them needed its own TLS certificate, its own security hardening and its own public IP — and attackers could probe each server directly.',
      'Har application server seedha internet par khula tha. Har ek ko apna TLS certificate, apni security hardening aur apna public IP chahiye tha — aur attackers har server ko seedha probe kar sakte the.',
    ),
    before: scene(
      [[a('internet', 'Globe', 'Internet')], [c('app-server', { id: 'a', label: 'Server A', note: 'public IP', state: 'bad' }), c('app-server', { id: 'b', label: 'Server B', note: 'public IP', state: 'bad' })]],
      ['internet!>a', 'internet!>b'],
      bi('Every server faces the internet on its own — more certificates, more attack surface.', 'Har server akela internet ka saamna karta hai — zyada certificates, zyada attack surface.'),
    ),
    solution: bi(
      'The reverse proxy is the only public face. It handles HTTPS once, filters and rewrites requests, and forwards them over the private network. Your servers can be replaced or moved without the outside world noticing.',
      'Reverse proxy hi akela public chehra hai. Yeh HTTPS ek baar handle karta hai, requests ko filter aur rewrite karta hai, aur private network par forward karta hai. Aapke servers bahar ki duniya ko pata chale bina badle ya shift kiye ja sakte hain.',
    ),
    after: scene(
      [[a('internet', 'Globe', 'Internet')], [c('reverse-proxy', { state: 'focus', note: 'HTTPS ends here' })], [c('app-server', { id: 'a', label: 'Server A (private)' }), c('object-storage', { label: 'Static files' })]],
      ['internet>reverse-proxy', ['reverse-proxy>a', '/api'], ['reverse-proxy>object-storage', '/static']],
      bi('One public face terminates HTTPS and forwards requests to hidden servers by path.', 'Ek public chehra HTTPS khatam karta hai aur path ke hisaab se chhupe servers ko requests bhejta hai.'),
    ),
    steps: [
      bi('The client connects to the proxy over HTTPS.', 'Client HTTPS par proxy se connect karta hai.'),
      bi('The proxy decrypts the request (TLS termination) and applies rules: allowed paths, headers, size limits.', 'Proxy request decrypt karta hai (TLS termination) aur rules lagata hai: allowed paths, headers, size limits.'),
      bi('It forwards the request over the private network to the right backend.', 'Yeh request private network par sahi backend ko forward karta hai.'),
      bi('It can cache or compress the response before returning it.', 'Response lautane se pehle use cache ya compress kar sakta hai.'),
    ],
    analogy: {
      icons: ['Building2', 'User', 'DoorClosed'],
      title: bi('The receptionist at a company office', 'Company office ka receptionist'),
      text: bi(
        'Visitors never walk straight to an employee’s desk. They speak to the receptionist, who checks the visit, signs them in and calls the right person down. Employees stay private behind the security door.\n\nThat is a reverse proxy: one public counter that talks to outsiders on behalf of the people inside.',
        'Visitors seedha kisi employee ki desk tak nahi jaate. Woh receptionist se baat karte hain, jo visit check karta hai, sign-in karata hai aur sahi insaan ko neeche bulaata hai. Employees security door ke peeche private rehte hain.\n\nYahi reverse proxy hai: ek public counter jo andar ke logon ki taraf se bahar walon se baat karta hai.',
      ),
    },
    perfectFit: {
      title: bi('A self-hosted web app on a couple of servers', 'Kuch servers par self-hosted web app'),
      text: bi(
        'A small company runs its site on two virtual machines. NGINX in front handles the HTTPS certificate, serves /static files directly, forwards /api to the app processes, and keeps the app ports closed to the internet. Simple, cheap and secure.',
        'Ek chhoti company apni site do virtual machines par chalati hai. Aage NGINX HTTPS certificate handle karta hai, /static files seedha serve karta hai, /api ko app processes tak bhejta hai, aur app ports ko internet ke liye band rakhta hai. Simple, sasta aur secure.',
      ),
      why: [
        bi('One place to manage HTTPS certificates.', 'HTTPS certificates manage karne ki ek jagah.'),
        bi('Backend servers stay off the public internet.', 'Backend servers public internet se door rehte hain.'),
        bi('Simple path-based forwarding without a full gateway.', 'Full gateway ke bina simple path-based forwarding.'),
      ],
    },
    avoidWhen: [
      bi('You need per-user API keys, quotas and developer plans — use an API gateway.', 'Per-user API keys, quotas aur developer plans chahiye — API gateway use karo.'),
      bi('You run a single proxy instance with no standby — it becomes a single point of failure.', 'Bina standby ek hi proxy instance chalana — yeh single point of failure ban jaata hai.'),
      bi('You expect it to replace a load balancer across many regions; it works within one setup.', 'Ise kai regions mein load balancer ki jagah lene ki ummeed; yeh ek setup ke andar kaam karta hai.'),
    ],
    decisions: [
      bi('Availability: single instance, or active-passive with a standby.', 'Availability: single instance, ya standby ke saath active-passive.'),
      bi('Which paths go to which backend.', 'Kaunsa path kis backend par jaayega.'),
      bi('Whether it also balances load and runs health checks.', 'Kya yeh load bhi balance karega aur health checks bhi chalayega.'),
    ],
    confusedWith: [
      { type: 'load-balancer', difference: bi('A reverse proxy’s main job is to stand in front and forward; a load balancer’s main job is to spread load over many identical servers. Many products do both.', 'Reverse proxy ka main kaam aage khade hokar forward karna hai; load balancer ka main kaam kai ek jaise servers mein load baantna hai. Kai products dono karte hain.'), compare: 'load-balancer-vs-api-gateway-vs-reverse-proxy' },
      { type: 'waf', difference: bi('A reverse proxy forwards traffic; a WAF inspects it for attacks like SQL injection and blocks them.', 'Reverse proxy traffic forward karta hai; WAF use SQL injection jaise attacks ke liye jaanchta hai aur block karta hai.') },
    ],
    examples: ['NGINX', 'Envoy', 'HAProxy', 'Caddy'],
  },
];
