import { a, bi, c, scene } from '@/features/learn/dsl';
import type { PrepQuestion } from '../types';

export const serverQuestions: PrepQuestion[] = [
  {
    id: 'why-use-a-load-balancer',
    category: 'servers',
    topic: 'load-balancing',
    question: bi('Why do we use a load balancer?', 'Hum load balancer kyun use karte hain?'),
    kind: 'concept',
    level: 'beginner',
    tags: ['load balancer', 'scalability', 'availability', 'health checks', 'l4', 'l7', 'nginx', 'alb'],
    simple: bi(
      'A load balancer sits in front of several copies of your server and spreads incoming requests across them. Thanks to it you can add more servers when traffic grows (scalability), and if one server dies, users are quietly sent to the healthy ones (availability). Clients only ever need to know one address.',
      'Load balancer aapke server ki kai copies ke aage baithta hai aur aane wali requests unme baant-ta hai. Iski wajah se traffic badhne pe aur servers jod sakte ho (scalability), aur ek server mar jaaye to users chupchaap healthy servers pe bhej diye jaate hain (availability). Clients ko hamesha ek hi address jaanna padta hai.',
    ),
    example: bi(
      'A bank with many counters and a guard at the entrance who sends each customer to a free counter. If a counter closes, the guard stops sending people there. Customers do not need to know which clerk is free — they just walk in through one door.',
      'Kai counters wala bank aur entrance pe guard jo har customer ko khaali counter pe bhejta hai. Koi counter band ho jaaye to guard wahan bhejna band kar deta hai. Customers ko yeh jaanne ki zaroorat nahi ki kaunsa clerk free hai — bas ek darwaze se andar aate hain.',
    ),
    why: bi(
      'One server has limits (CPU, memory, connections) and is a single point of failure. A load balancer enables horizontal scaling, high availability, zero-downtime deployments (update one server at a time) and a central place to terminate TLS.',
      'Ek server ki seemayein hain (CPU, memory, connections) aur woh single point of failure hai. Load balancer se horizontal scaling, high availability, zero-downtime deployments (ek-ek server update karo) aur TLS terminate karne ki ek central jagah milti hai.',
    ),
    without: bi(
      'Every user hits one server: it overloads at peak time and crashes, every deploy or crash means downtime, and clients would need to know every server’s address and pick one themselves.',
      'Har user ek hi server pe aata hai: peak time pe overload hoke crash, har deploy ya crash matlab downtime, aur clients ko har server ka address jaan ke khud chunna padta.',
    ),
    scene: scene(
      [
        [a('users', 'Users', 'Users')],
        [c('load-balancer', { state: 'focus' })],
        [c('app-server', { id: 's1' }), c('app-server', { id: 's2' }), c('app-server', { id: 's3', state: 'bad', note: bi('failed health check', 'health check fail') })],
      ],
      ['users>load-balancer', 'load-balancer>s1', 'load-balancer>s2', 'load-balancer.>s3'],
      bi(
        'Users only know the load balancer. It spreads requests across healthy servers and stops sending traffic to one that fails its health check.',
        'Users sirf load balancer ko jaante hain. Woh requests healthy servers mein baant-ta hai aur health check fail karne wale server ko traffic bhejna band kar deta hai.',
      ),
    ),
    partsTitle: bi('What a load balancer does for you', 'Load balancer aapke liye kya karta hai'),
    parts: [
      {
        title: bi('Distributes traffic', 'Traffic baant-ta hai'),
        text: bi(
          'Using an algorithm: round robin (each server in turn), least connections (the least busy server), weighted (bigger servers get more), or IP hash / consistent hashing (the same client or key goes to the same server).',
          'Ek algorithm se: round robin (baari-baari), least connections (sabse kam busy server), weighted (bade servers ko zyaada), ya IP hash / consistent hashing (same client ya key same server pe).',
        ),
      },
      {
        title: 'Health checks',
        text: bi(
          'It probes every server regularly (for example GET /health), removes unhealthy ones from rotation, and adds them back when they recover.',
          'Yeh har server ko regular check karta hai (jaise GET /health), unhealthy ko rotation se hatata hai, aur theek hone pe wapas jodta hai.',
        ),
      },
      {
        title: bi('Horizontal scaling and autoscaling', 'Horizontal scaling aur autoscaling'),
        text: bi(
          'New instances register behind the load balancer, so capacity grows by adding machines instead of buying one ever-bigger machine.',
          'Naye instances load balancer ke peeche register hote hain, to capacity ek aur bada machine khareedne ki jagah machines jodne se badhti hai.',
        ),
      },
      {
        title: 'Zero-downtime deployments',
        text: bi(
          'Rolling, blue-green and canary releases work by shifting traffic between servers; connection draining lets in-flight requests finish before a server is removed.',
          'Rolling, blue-green aur canary releases servers ke beech traffic shift karke kaam karte hain; connection draining server hatane se pehle chal rahi requests ko poora hone deta hai.',
        ),
      },
      {
        title: 'Layer 4 vs Layer 7',
        text: bi(
          'An L4 load balancer forwards TCP/UDP connections without reading them — very fast and works for any protocol. An L7 load balancer understands HTTP, so it can route by path, host or header, terminate TLS, and use cookies for sticky sessions.',
          'L4 load balancer TCP/UDP connections ko bina padhe aage bhejta hai — bahut fast aur har protocol ke liye. L7 load balancer HTTP samajhta hai, isliye path, host ya header se route kar sakta hai, TLS terminate kar sakta hai, aur sticky sessions ke liye cookies use kar sakta hai.',
        ),
      },
      {
        title: 'Extras',
        text: bi(
          'TLS termination, basic rate limiting and DDoS protection, compression, and hiding the internal servers’ addresses.',
          'TLS termination, basic rate limiting aur DDoS protection, compression, aur andar ke servers ke address chhupana.',
        ),
      },
      {
        title: bi('It must not become the new single point of failure', 'Yeh khud naya single point of failure na bane'),
        text: bi(
          'Managed cloud load balancers (AWS ALB/NLB, Google Cloud Load Balancing) are redundant by design. Self-hosted ones run as an active-passive pair with a floating IP. Across regions, DNS or global load balancing picks the region.',
          'Managed cloud load balancers (AWS ALB/NLB, Google Cloud Load Balancing) design se hi redundant hote hain. Self-hosted ko floating IP ke saath active-passive pair mein chalaate hain. Regions ke beech DNS ya global load balancing region chunta hai.',
        ),
      },
    ],
    table: {
      columns: ['', 'Layer 4 (transport)', 'Layer 7 (application)'],
      rows: [
        [bi('Sees', 'Kya dekhta hai'), bi('IP addresses and ports', 'IP addresses aur ports'), bi('The full HTTP request', 'Poori HTTP request')],
        [bi('Routes by', 'Kis basis pe route'), 'Connection', 'Path, host, headers, cookies'],
        ['Speed', bi('Very fast', 'Bahut fast'), bi('A little more work per request', 'Har request pe thoda zyaada kaam')],
        ['Examples', 'AWS NLB, HAProxy (TCP mode)', 'AWS ALB, Nginx, Envoy'],
      ],
    },
    interview: {
      opening: bi(
        'A load balancer distributes incoming traffic across multiple server instances so the system can scale horizontally and stay available when an instance fails, while giving clients a single stable endpoint.',
        'Load balancer aane wale traffic ko kai server instances mein baant-ta hai taaki system horizontally scale ho sake aur ek instance fail hone pe bhi available rahe, aur clients ko ek stable endpoint mile.',
      ),
      points: [
        bi('Horizontal scalability: add instances instead of scaling one machine vertically.', 'Horizontal scalability: ek machine ko vertically badhane ki jagah instances jodo.'),
        bi('High availability: health checks remove unhealthy instances automatically, so no single server is a SPOF.', 'High availability: health checks unhealthy instances ko apne aap hatate hain, to koi ek server SPOF nahi.'),
        bi('Algorithms: round robin, least connections, weighted, IP hash or consistent hashing for affinity.', 'Algorithms: round robin, least connections, weighted, affinity ke liye IP hash ya consistent hashing.'),
        bi('Zero-downtime deployments: rolling, blue-green and canary releases with connection draining.', 'Zero-downtime deployments: connection draining ke saath rolling, blue-green aur canary releases.'),
        bi('L4 balances TCP connections; L7 understands HTTP and can route by path or host, terminate TLS and do sticky sessions.', 'L4 TCP connections balance karta hai; L7 HTTP samajhta hai aur path ya host se route, TLS terminate aur sticky sessions kar sakta hai.'),
        bi('Offloads TLS and can add rate limiting and basic DDoS protection.', 'TLS ka bojh uthata hai aur rate limiting aur basic DDoS protection jod sakta hai.'),
        bi('The load balancer itself must be redundant — managed, or an active-passive pair; DNS/global LB for multi-region.', 'Load balancer khud redundant hona chahiye — managed, ya active-passive pair; multi-region ke liye DNS/global LB.'),
      ],
      keywords: [
        'Horizontal scaling',
        'High availability',
        'Single point of failure',
        'Health checks',
        'Round robin',
        'Least connections',
        'Consistent hashing',
        'Sticky sessions',
        'Layer 4 vs Layer 7',
        'TLS termination',
        'Connection draining',
        'Blue-green / canary',
      ],
    },
    listenFor: [
      bi('Both reasons: scalability and availability.', 'Dono kaaran: scalability aur availability.'),
      bi('Health checks, and L4 vs L7.', 'Health checks, aur L4 vs L7.'),
      bi('Knowing the load balancer itself must be redundant, and that servers should be stateless.', 'Yeh jaanna ki load balancer khud redundant hona chahiye, aur servers stateless hone chahiye.'),
    ],
    mistakes: [
      bi('Only saying “to distribute load”.', 'Sirf yeh kehna ki “load baantne ke liye”.'),
      bi('Forgetting health checks.', 'Health checks bhool jaana.'),
      bi('Making the load balancer a new single point of failure.', 'Load balancer ko naya single point of failure bana dena.'),
      bi('Relying on sticky sessions instead of stateless servers.', 'Stateless servers ki jagah sticky sessions pe nirbhar rehna.'),
    ],
    followUps: [
      {
        q: bi('Load balancer vs reverse proxy vs API gateway?', 'Load balancer, reverse proxy aur API gateway mein kya fark hai?'),
        a: bi(
          'A load balancer spreads traffic over identical instances. A reverse proxy sits in front of servers to handle TLS, caching and compression — often the same software. An API gateway adds API concerns: authentication, per-client rate limits, routing to different services and request transformation.',
          'Load balancer ek jaise instances pe traffic baant-ta hai. Reverse proxy servers ke aage TLS, caching aur compression sambhalta hai — aksar same software. API gateway API wali cheezein jodta hai: authentication, har client ki rate limits, alag services tak routing aur request transformation.',
        ),
      },
      {
        q: bi('What happens to user sessions behind a load balancer?', 'Load balancer ke peeche user sessions ka kya hota hai?'),
        a: bi(
          'Prefer stateless servers with sessions in a shared store (Redis) or in tokens (JWT). Sticky sessions work, but they unbalance the load and lose sessions when a server dies.',
          'Stateless servers behtar hain jinke sessions shared store (Redis) ya tokens (JWT) mein hon. Sticky sessions chalte hain, par load bigaadte hain aur server marne pe sessions kho jaate hain.',
        ),
      },
    ],
    related: { components: ['load-balancer', 'reverse-proxy', 'api-gateway'], challenges: ['url-shortener-at-scale', 'api-gateway-basic'] },
  },
];

export const securityQuestions: PrepQuestion[] = [
  {
    id: 'sso-authentication-and-jwt',
    category: 'security',
    topic: 'auth',
    question: bi(
      'In an SSO system, how can authentication be implemented, and where does JWT fit into it?',
      'SSO system mein authentication kaise implement kar sakte hain, aur JWT isme kahan fit hota hai?',
    ),
    kind: 'concept',
    level: 'advanced',
    tags: ['sso', 'jwt', 'oidc', 'oauth2', 'saml', 'identity provider', 'tokens', 'pkce'],
    simple: bi(
      'Single sign-on means you log in once at one trusted login service — the identity provider (IdP), such as Google, Okta or Azure AD — and every connected app then accepts you without asking for your password again. The apps never see your password; the identity provider hands them a signed “proof of who you are”. A JWT is the most common format for that proof: a small signed token that an app can check on its own.',
      'Single sign-on ka matlab hai aap ek bharosemand login service — identity provider (IdP), jaise Google, Okta ya Azure AD — pe ek baar login karte ho, aur phir har judi hui app bina password maange aapko maan leti hai. Apps aapka password kabhi nahi dekhtin; identity provider unhe ek signed “aap kaun ho iska saboot” deta hai. JWT us saboot ka sabse common format hai: ek chhota signed token jise app khud check kar sakti hai.',
    ),
    example: bi(
      'An office campus with many buildings. You show your ID once at the main security office (the identity provider); they give you a stamped badge with your name, photo and expiry time (the JWT). Each building’s guard (an app) just checks the stamp and the expiry — they do not phone the main office every time. A fake or expired badge is refused.',
      'Kai buildings wala office campus. Aap main security office (identity provider) pe ek baar ID dikhate ho; woh aapko naam, photo aur expiry time wala stamp laga badge dete hain (JWT). Har building ka guard (app) bas stamp aur expiry check karta hai — har baar main office ko phone nahi karta. Nakli ya expire hua badge mana kar diya jaata hai.',
    ),
    why: bi(
      'Users remember one password; companies manage access in one place (onboarding, offboarding and MFA once); and individual apps do not store passwords, which means less risk.',
      'Users ko ek hi password yaad rakhna padta hai; companies access ek jagah se sambhaalti hain (onboarding, offboarding aur MFA ek baar); aur alag-alag apps passwords store nahi karti, to risk kam.',
    ),
    without: bi(
      'Every app has its own login and password database; users reuse weak passwords; removing a leaving employee means disabling twenty accounts; and every app that stores passwords is another place to be breached.',
      'Har app ka apna login aur password database; users kamzor passwords dohraate hain; company chhodne wale employee ko hatane ke liye bees accounts band karne padte hain; aur passwords store karne wali har app hack hone ki ek aur jagah hai.',
    ),
    scene: scene(
      [
        [a('user', 'User', 'User')],
        [c('app-server', { label: bi('Your app', 'Aapka app') })],
        [c('identity-provider', { state: 'focus' })],
      ],
      [
        ['user>app-server', bi('1. open', '1. kholo')],
        ['app-server<>identity-provider', '2. login → JWT'],
      ],
      bi(
        '1. The user opens the app. 2. The app sends them to the identity provider to log in and gets back signed tokens (a JWT). Other apps reuse the same login without asking for the password again.',
        '1. User app kholta hai. 2. App use login ke liye identity provider pe bhejta hai aur signed tokens (JWT) wapas paata hai. Doosre apps bina dobara password maange wahi login use karte hain.',
      ),
    ),
    partsTitle: bi('How SSO works, step by step (OpenID Connect)', 'SSO kaise kaam karta hai, step by step (OpenID Connect)'),
    parts: [
      {
        title: bi('The players and the protocols', 'Khiladi aur protocols'),
        text: bi(
          'The user’s browser; the app (called the relying party or service provider); and the identity provider (Okta, Auth0, Keycloak, Azure AD, Google). The standard protocols are OpenID Connect (OIDC, built on OAuth 2.0, uses JWTs) and SAML 2.0 (XML assertions, common in older enterprise setups).',
          'User ka browser; app (jise relying party ya service provider kehte hain); aur identity provider (Okta, Auth0, Keycloak, Azure AD, Google). Standard protocols hain OpenID Connect (OIDC, OAuth 2.0 pe bana, JWTs use karta hai) aur SAML 2.0 (XML assertions, purane enterprise setups mein common).',
        ),
      },
      {
        title: bi('Step 1 — redirect to the identity provider', 'Step 1 — identity provider pe redirect'),
        text: bi(
          'The user opens the app, which has no session for them, so it redirects the browser to the IdP’s authorize endpoint with its client ID, redirect URI, scope=openid, a random state value and a PKCE code challenge.',
          'User app kholta hai, uske paas user ka session nahi, to woh browser ko IdP ke authorize endpoint pe bhejta hai — apne client ID, redirect URI, scope=openid, random state value aur PKCE code challenge ke saath.',
        ),
      },
      {
        title: bi('Step 2 — the user logs in (once)', 'Step 2 — user login karta hai (ek baar)'),
        text: bi(
          'The user signs in at the IdP with password and MFA. If they already have an IdP session from another app, this step is skipped — that is what makes it single sign-on.',
          'User IdP pe password aur MFA se sign in karta hai. Agar kisi doosri app se IdP session pehle se hai, to yeh step skip ho jaata hai — yahi isse single sign-on banata hai.',
        ),
      },
      {
        title: bi('Step 3 — code exchanged for tokens', 'Step 3 — code ke badle tokens'),
        text: bi(
          'The IdP redirects back to the app with a short-lived authorization code. The app’s backend exchanges it (with the PKCE verifier or client secret) at the token endpoint for an ID token (a JWT that says who the user is), an access token (often a JWT that says what may be called) and a refresh token.',
          'IdP thodi der wala authorization code ke saath app pe wapas redirect karta hai. App ka backend use (PKCE verifier ya client secret ke saath) token endpoint pe badalta hai: ID token (JWT jo batata hai user kaun hai), access token (aksar JWT jo batata hai kya call kar sakte ho) aur refresh token.',
        ),
      },
      {
        title: bi('Step 4 — verify, then create a session', 'Step 4 — verify karo, phir session banao'),
        text: bi(
          'The app verifies the ID token: the signature against the IdP’s public keys (JWKS), the issuer (iss), the audience (aud), the expiry (exp) and the nonce. Then it creates its own session (a secure HttpOnly cookie) or uses the access token to call APIs.',
          'App ID token verify karta hai: IdP ki public keys (JWKS) se signature, issuer (iss), audience (aud), expiry (exp) aur nonce. Phir apna session banata hai (secure HttpOnly cookie) ya access token se APIs call karta hai.',
        ),
      },
      {
        title: bi('Where JWT fits', 'JWT kahan fit hota hai'),
        text: bi(
          'A JWT is header.payload.signature, base64url-encoded and signed (RS256 or ES256) — signed, not encrypted, so anyone can read the payload. It carries claims such as sub, iss, aud, exp, iat, email, roles or scopes. APIs validate access-token JWTs locally with the public key — no database lookup per request — which scales well across microservices.',
          'JWT header.payload.signature hota hai, base64url-encoded aur signed (RS256 ya ES256) — signed hai, encrypted nahi, isliye payload koi bhi padh sakta hai. Isme sub, iss, aud, exp, iat, email, roles ya scopes jaise claims hote hain. APIs access-token JWTs ko public key se local validate karti hain — har request pe database lookup nahi — jo microservices mein accha scale karta hai.',
        ),
      },
      {
        title: bi('JWT trade-offs and safety', 'JWT ke trade-offs aur safety'),
        text: bi(
          'A JWT cannot easily be revoked before it expires, so keep access tokens short-lived (5–15 minutes), rotate refresh tokens, and keep a denylist for emergencies. Never put secrets in the payload. Prefer HttpOnly, Secure, SameSite cookies (or keep tokens on the server — the “backend for frontend” pattern) over localStorage, which is exposed to XSS. Always verify the algorithm and signature; reject “alg: none”.',
          'JWT ko expiry se pehle aasaani se revoke nahi kar sakte, isliye access tokens chhote rakho (5–15 minute), refresh tokens rotate karo, aur emergency ke liye denylist rakho. Payload mein kabhi secrets mat daalo. localStorage (jo XSS ke saamne khula hai) ki jagah HttpOnly, Secure, SameSite cookies (ya tokens server pe — “backend for frontend” pattern) behtar hain. Algorithm aur signature hamesha verify karo; “alg: none” mana karo.',
        ),
      },
      {
        title: bi('Logging out', 'Logout karna'),
        text: bi(
          'Local logout clears the app’s session. Single logout also ends the IdP session and notifies the other apps (back-channel logout). Refresh tokens are revoked at the IdP’s revocation endpoint.',
          'Local logout app ka session saaf karta hai. Single logout IdP session bhi khatam karta hai aur doosre apps ko batata hai (back-channel logout). Refresh tokens IdP ke revocation endpoint pe revoke hote hain.',
        ),
      },
    ],
    table: {
      columns: ['', 'OpenID Connect', 'SAML 2.0', 'OAuth 2.0'],
      rows: [
        [bi('Purpose', 'Maqsad'), bi('Authentication: who you are', 'Authentication: aap kaun ho'), bi('Authentication for enterprise SSO', 'Enterprise SSO ke liye authentication'), bi('Authorization: what an app may access', 'Authorization: app kya access kar sakti hai')],
        ['Token', 'ID token (JWT)', 'XML assertion', bi('Access token (opaque or JWT)', 'Access token (opaque ya JWT)')],
        [bi('Typical use', 'Aam use'), bi('Modern web and mobile, “Sign in with Google”', 'Modern web aur mobile, “Sign in with Google”'), bi('Corporate apps, older enterprise systems', 'Corporate apps, purane enterprise systems'), bi('Letting an app call an API for the user', 'App ko user ki taraf se API call karne dena')],
      ],
    },
    interview: {
      opening: bi(
        'SSO delegates authentication to a central identity provider through a federation protocol — typically OpenID Connect over OAuth 2.0 with the authorization code flow and PKCE, or SAML in older enterprise setups — and JWT is the signed token format the IdP issues (the ID token, and often the access token) so apps and APIs can verify identity and claims statelessly.',
        'SSO authentication ko ek central identity provider ko federation protocol se saunpta hai — aam taur pe authorization code flow aur PKCE ke saath OAuth 2.0 pe OpenID Connect, ya purane enterprise setups mein SAML — aur JWT woh signed token format hai jo IdP deta hai (ID token, aur aksar access token bhi) taaki apps aur APIs pehchaan aur claims ko statelessly verify kar sakein.',
      ),
      points: [
        bi('Roles: user agent, relying party (the app) and identity provider; trust comes from client registration and the IdP’s signing keys.', 'Roles: user agent, relying party (app) aur identity provider; bharosa client registration aur IdP ki signing keys se aata hai.'),
        bi('Flow: redirect to IdP → authenticate (with MFA) → authorization code → back-channel token exchange → ID, access and refresh tokens.', 'Flow: IdP pe redirect → authenticate (MFA ke saath) → authorization code → back-channel token exchange → ID, access aur refresh tokens.'),
        bi('“Single” sign-on comes from the IdP session: the next app gets tokens without a new login.', '“Single” sign-on IdP session se aata hai: agli app ko bina naye login ke tokens mil jaate hain.'),
        bi('JWT = header.payload.signature, signed with RS256/ES256, with claims such as iss, sub, aud, exp, scope and roles.', 'JWT = header.payload.signature, RS256/ES256 se signed, iss, sub, aud, exp, scope aur roles jaise claims ke saath.'),
        bi('Validate the signature via JWKS plus iss, aud, exp and nonce; never accept alg none.', 'JWKS se signature plus iss, aud, exp aur nonce validate karo; alg none kabhi mat maano.'),
        bi('Stateless verification scales across services, but revocation is hard → short-lived access tokens, rotating refresh tokens, a denylist.', 'Stateless verification services mein scale hota hai, par revocation mushkil → chhote access tokens, rotate hone wale refresh tokens, denylist.'),
        bi('Store tokens in HttpOnly, Secure, SameSite cookies or server-side (BFF) to limit XSS exposure; support single logout.', 'XSS se bachne ke liye tokens HttpOnly, Secure, SameSite cookies mein ya server-side (BFF) rakho; single logout support karo.'),
      ],
      keywords: [
        'Identity Provider (IdP)',
        'Relying party / Service provider',
        'OpenID Connect',
        'OAuth 2.0',
        'SAML 2.0',
        'Authorization code flow + PKCE',
        'ID token vs access token',
        'Refresh token rotation',
        'JWT claims (iss, sub, aud, exp)',
        'JWKS / signature verification',
        'Stateless authentication',
        'Single logout',
        'Backend for frontend (BFF)',
      ],
    },
    listenFor: [
      bi('Knowing authentication vs authorization, and ID token vs access token.', 'Authentication vs authorization, aur ID token vs access token ki samajh.'),
      bi('Describing the redirect and authorization-code flow.', 'Redirect aur authorization-code flow samjhana.'),
      bi('How a JWT is validated, the revocation trade-off, and where tokens are stored safely.', 'JWT kaise validate hota hai, revocation ka trade-off, aur tokens safely kahan rakhein.'),
    ],
    mistakes: [
      bi('Saying “a JWT is encrypted” — it is signed, and anyone can read it.', '“JWT encrypted hai” kehna — woh signed hai, aur use koi bhi padh sakta hai.'),
      bi('Using plain OAuth 2.0 access tokens as proof of login.', 'Login ke saboot ke roop mein sirf OAuth 2.0 access tokens use karna.'),
      bi('Long-lived JWTs with no way to revoke them.', 'Lambe chalne wale JWTs jinhe revoke karne ka koi tareeka nahi.'),
      bi('Not checking the audience and issuer.', 'Audience aur issuer check na karna.'),
    ],
    followUps: [
      {
        q: bi('Authentication vs authorization?', 'Authentication aur authorization mein kya fark hai?'),
        a: bi(
          'Authentication proves who you are (logging in). Authorization decides what you are allowed to do (roles, scopes, permissions).',
          'Authentication saabit karta hai ki aap kaun ho (login). Authorization tay karta hai ki aap kya kar sakte ho (roles, scopes, permissions).',
        ),
      },
      {
        q: bi('Why use PKCE?', 'PKCE kyun use karte hain?'),
        a: bi(
          'It ties the authorization code to the client that started the login, so a stolen code cannot be exchanged by an attacker. It is required for browser apps and mobile apps that cannot keep a secret.',
          'Yeh authorization code ko us client se baandh deta hai jisne login shuru kiya, to chori hua code attacker badal nahi sakta. Browser apps aur mobile apps jo secret nahi rakh sakti, unke liye zaroori hai.',
        ),
      },
      {
        q: bi('How do you revoke a JWT?', 'JWT ko revoke kaise karte ho?'),
        a: bi(
          'You cannot change an issued token, so keep it short-lived, revoke the refresh token, and for emergencies check a denylist of token IDs (jti) or bump a per-user token version.',
          'Diye hue token ko badal nahi sakte, isliye use chhota rakho, refresh token revoke karo, aur emergency ke liye token IDs (jti) ki denylist check karo ya har user ka token version badha do.',
        ),
      },
    ],
    related: { components: ['identity-provider', 'auth-service', 'api-gateway'], challenges: ['global-identity-and-authentication-platform'] },
  },
];
