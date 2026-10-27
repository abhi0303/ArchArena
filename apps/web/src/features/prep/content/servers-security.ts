import { a, c, scene } from '@/features/learn/dsl';
import { bi, code, figure, note, p, section, steps, table, ul } from '../dsl';
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
    answer: bi(
      'A load balancer distributes incoming requests across several servers. It lets us scale horizontally by adding servers, keeps the system available when one server fails (it stops sending traffic to unhealthy servers), and gives clients one stable address. It also enables zero-downtime deployments and can terminate TLS in one place.',
      'Load balancer aane wali requests ko kai servers mein baant-ta hai. Isse hum servers jod ke horizontally scale kar sakte hain, ek server fail hone pe bhi system available rehta hai (yeh unhealthy servers ko traffic bhejna band kar deta hai), aur clients ko ek stable address milta hai. Isse zero-downtime deployments bhi hote hain aur TLS ek jagah terminate ho sakta hai.',
    ),
    sections: [
      section(
        'The problem it solves',
        'Yeh kaunsi problem solve karta hai',
        p(
          'One server has limits — CPU, memory, connections — and if it crashes or is redeployed, the whole site is down. With a load balancer in front, we run several identical servers and clients never need to know which one answers:',
          'Ek server ki seemayein hain — CPU, memory, connections — aur woh crash ya redeploy ho to poori site band. Aage load balancer ho to hum kai ek jaise servers chalate hain aur clients ko kabhi jaanna nahi padta ki kaunsa jawab de raha hai:',
        ),
        figure(
          scene(
            [
              [a('users', 'Users', 'Users')],
              [c('load-balancer', { state: 'focus' })],
              [c('app-server', { id: 's1' }), c('app-server', { id: 's2' }), c('app-server', { id: 's3', state: 'bad', note: bi('health check failed', 'health check fail') })],
            ],
            ['users>load-balancer', 'load-balancer>s1', 'load-balancer>s2', 'load-balancer.>s3'],
            bi('Traffic is spread across healthy servers; the failed one gets no requests until it recovers.', 'Traffic healthy servers mein baanta jaata hai; fail hua server theek hone tak requests nahi paata.'),
          ),
        ),
      ),
      section(
        'What it gives us',
        'Isse kya milta hai',
        ul(
          ['**Horizontal scaling** — add servers (or let autoscaling add them) instead of buying one bigger machine.', '**Horizontal scaling** — ek bada machine khareedne ki jagah servers jodo (ya autoscaling ko jodne do).'],
          ['**High availability** — health checks remove unhealthy servers automatically.', '**High availability** — health checks unhealthy servers ko apne aap hata dete hain.'],
          ['**Zero-downtime deploys** — update servers one at a time; connection draining lets in-flight requests finish.', '**Zero-downtime deploys** — servers ek-ek karke update karo; connection draining chal rahi requests ko poora hone deta hai.'],
          ['**One entry point** — TLS termination, compression and basic rate limiting in one place.', '**Ek entry point** — TLS termination, compression aur basic rate limiting ek jagah.'],
        ),
      ),
      section(
        'Balancing algorithms',
        'Balancing algorithms',
        table(
          ['Algorithm', bi('How it picks a server', 'Server kaise chunta hai'), bi('Good for', 'Kiske liye accha')],
          [
            ['Round robin', bi('Each server in turn', 'Baari-baari'), bi('Requests of similar cost', 'Ek jaisi requests')],
            ['Least connections', bi('The server with the fewest active requests', 'Sabse kam active requests wala server'), bi('Uneven or long requests, WebSockets', 'Alag-alag ya lambi requests, WebSockets')],
            ['Weighted', bi('Bigger servers get a bigger share', 'Bade servers ko zyaada hissa'), bi('Mixed server sizes, canary releases', 'Alag size ke servers, canary releases')],
            ['IP hash / consistent hashing', bi('Same client or key → same server', 'Same client ya key → same server'), 'Caches, chat rooms, sticky sessions'],
          ],
        ),
      ),
      section(
        'Layer 4 vs Layer 7',
        'Layer 4 vs Layer 7',
        table(
          ['', 'Layer 4 (transport)', 'Layer 7 (application)'],
          [
            [bi('Sees', 'Kya dekhta hai'), bi('IP addresses and ports', 'IP addresses aur ports'), bi('The full HTTP request', 'Poori HTTP request')],
            [bi('Can route by', 'Kis basis pe route'), bi('Connection only', 'Sirf connection'), 'Path, host, headers, cookies'],
            [bi('Typical use', 'Aam use'), bi('Any TCP/UDP protocol, extreme throughput', 'Koi bhi TCP/UDP protocol, bahut zyaada throughput'), bi('Web apps and APIs', 'Web apps aur APIs')],
            ['Examples', 'AWS NLB, HAProxy (TCP)', 'AWS ALB, Nginx, Envoy'],
          ],
        ),
      ),
      section(
        'What it looks like in practice',
        'Practically yeh kaisa dikhta hai',
        code(
          'nginx',
          `
upstream api {
    least_conn;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=10s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=10s;
    server 10.0.1.13:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;                      # TLS terminates here
    location / { proxy_pass http://api; }
}`,
        ),
        p('Each server exposes a cheap health endpoint that the load balancer probes:', 'Har server ek sasta health endpoint deta hai jise load balancer check karta hai:'),
        code('ts', "app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));"),
      ),
      section(
        'Things I keep in mind',
        'Main kin baaton ka dhyaan rakhta hoon',
        ul(
          ['The load balancer must not become the new single point of failure — use a managed one (ALB, Cloud Load Balancing) or an active-passive pair.', 'Load balancer khud naya single point of failure na bane — managed (ALB, Cloud Load Balancing) ya active-passive pair use karo.'],
          ['Keep servers **stateless** (sessions in Redis or a JWT) so any server can handle any request; sticky sessions are a fallback, not a goal.', 'Servers **stateless** rakho (sessions Redis ya JWT mein) taaki koi bhi server koi bhi request sambhaal sake; sticky sessions majboori hain, lakshya nahi.'],
          ['For several regions, add DNS or global load balancing in front.', 'Kai regions ke liye aage DNS ya global load balancing jodo.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'A load balancer distributes incoming traffic across multiple server instances. It gives us horizontal scalability — we add instances instead of growing one machine — and high availability, because health checks automatically remove unhealthy instances. Clients see one stable endpoint.',
          'Load balancer aane wale traffic ko kai server instances mein baant-ta hai. Isse horizontal scalability milti hai — ek machine badhane ki jagah instances jodte hain — aur high availability, kyunki health checks unhealthy instances ko apne aap hata dete hain. Clients ko ek stable endpoint dikhta hai.',
        ),
        bi(
          'It also enables zero-downtime rolling, blue-green and canary deployments with connection draining, and centralizes TLS termination. I choose the algorithm by workload — round robin, least connections, or consistent hashing for affinity — use L7 for HTTP routing and L4 for raw TCP, keep servers stateless, and make sure the load balancer itself is redundant.',
          'Isse connection draining ke saath zero-downtime rolling, blue-green aur canary deployments bhi hote hain, aur TLS termination ek jagah hota hai. Main workload ke hisaab se algorithm chunta hoon — round robin, least connections, ya affinity ke liye consistent hashing — HTTP routing ke liye L7 aur raw TCP ke liye L4 use karta hoon, servers stateless rakhta hoon, aur pakka karta hoon ki load balancer khud redundant ho.',
        ),
      ],
      keywords: ['Horizontal scaling', 'High availability', 'Single point of failure', 'Health checks', 'Round robin', 'Least connections', 'Consistent hashing', 'Layer 4 vs Layer 7', 'TLS termination', 'Connection draining', 'Stateless servers'],
    },
    listenFor: [
      bi('Both reasons: scalability and availability, plus health checks.', 'Dono kaaran: scalability aur availability, saath mein health checks.'),
      bi('Knowing the load balancer itself must be redundant and that servers should be stateless.', 'Yeh jaanna ki load balancer khud redundant ho aur servers stateless hon.'),
    ],
    mistakes: [bi('Only saying “to distribute load”.', 'Sirf yeh kehna ki “load baantne ke liye”.'), bi('Making the load balancer a new single point of failure.', 'Load balancer ko naya single point of failure bana dena.')],
    followUps: [
      {
        q: bi('Load balancer vs reverse proxy vs API gateway?', 'Load balancer, reverse proxy aur API gateway mein kya fark hai?'),
        a: bi(
          'A load balancer spreads traffic over identical instances. A reverse proxy sits in front of servers for TLS, caching and compression — often the same software (Nginx). An API gateway adds API concerns: authentication, per-client rate limits, routing to different services and request transformation.',
          'Load balancer ek jaise instances pe traffic baant-ta hai. Reverse proxy servers ke aage TLS, caching aur compression ke liye hota hai — aksar same software (Nginx). API gateway API wali cheezein jodta hai: authentication, har client ki rate limits, alag services tak routing aur request transformation.',
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
    question: bi('In an SSO system, how can authentication be implemented, and where does JWT fit into it?', 'SSO system mein authentication kaise implement kar sakte hain, aur JWT isme kahan fit hota hai?'),
    kind: 'concept',
    level: 'advanced',
    tags: ['sso', 'jwt', 'oidc', 'oauth2', 'saml', 'identity provider', 'pkce', 'tokens'],
    answer: bi(
      'In SSO, applications do not handle passwords themselves. They redirect the user to a central identity provider (IdP) — Okta, Azure AD, Keycloak, Google — which authenticates the user once and issues signed tokens, usually through OpenID Connect. JWT is the format of those tokens: the ID token tells the app who the user is, and the access token (often also a JWT) is what APIs verify on every request.',
      'SSO mein applications khud passwords handle nahi karti. Woh user ko ek central identity provider (IdP) — Okta, Azure AD, Keycloak, Google — pe redirect karti hain, jo user ko ek baar authenticate karke signed tokens deta hai, aam taur pe OpenID Connect se. JWT un tokens ka format hai: ID token app ko batata hai user kaun hai, aur access token (aksar yeh bhi JWT) woh hai jise APIs har request pe verify karti hain.',
    ),
    sections: [
      section(
        'The players',
        'Kaun-kaun shaamil hai',
        table(
          ['Role', 'Example', bi('Job', 'Kaam')],
          [
            ['User / browser', '—', bi('Wants to use the app', 'App use karna chahta hai')],
            [bi('Relying party (your app)', 'Relying party (aapka app)'), 'Expense app, HR portal', bi('Trusts the IdP, never sees the password', 'IdP pe bharosa karta hai, password kabhi nahi dekhta')],
            ['Identity provider', 'Okta, Azure AD, Keycloak, Google', bi('Logs the user in (with MFA) and issues tokens', 'User ko login (MFA ke saath) karta hai aur tokens deta hai')],
            ['Protocol', 'OpenID Connect · SAML 2.0', bi('The standard way they talk', 'Inke baat karne ka standard tareeka')],
          ],
        ),
      ),
      section(
        'The login flow (OIDC authorization code + PKCE)',
        'Login flow (OIDC authorization code + PKCE)',
        steps(
          ['The app redirects to the IdP', 'App IdP pe redirect karta hai', 'The user has no session, so the app sends the browser to the IdP’s authorize endpoint.', 'User ka session nahi hai, to app browser ko IdP ke authorize endpoint pe bhejta hai.'],
          ['The user logs in once', 'User ek baar login karta hai', 'Password plus MFA at the IdP. If they already have an IdP session from another app, this step is skipped — that is the “single” in SSO.', 'IdP pe password plus MFA. Agar kisi doosri app se IdP session pehle se hai, to yeh step skip — yahi SSO ka “single” hai.'],
          ['The IdP returns a code', 'IdP code lautata hai', 'The browser comes back to the app’s callback URL with a short-lived authorization code.', 'Browser ek thodi der wale authorization code ke saath app ke callback URL pe wapas aata hai.'],
          ['The backend exchanges the code for tokens', 'Backend code ke badle tokens leta hai', 'Server-to-server, with the PKCE verifier: it receives an ID token, an access token and a refresh token.', 'Server-to-server, PKCE verifier ke saath: ID token, access token aur refresh token milte hain.'],
          ['The app verifies and creates a session', 'App verify karke session banata hai', 'It checks the ID token, then sets its own secure HttpOnly cookie or calls APIs with the access token.', 'Woh ID token check karta hai, phir apni secure HttpOnly cookie set karta hai ya access token se APIs call karta hai.'],
        ),
        code(
          'http',
          `
GET https://idp.example.com/authorize
    ?response_type=code
    &client_id=expense-web
    &redirect_uri=https://app.example.com/callback
    &scope=openid%20profile%20email
    &state=af0ifjsldkj
    &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    &code_challenge_method=S256`,
          'Step 1 — the redirect',
        ),
      ),
      section(
        'Where JWT fits',
        'JWT kahan fit hota hai',
        p(
          'A JWT has three base64url parts — `header.payload.signature`. The payload carries claims about the user, and the signature proves the IdP issued it:',
          'JWT ke teen base64url hisse hote hain — `header.payload.signature`. Payload mein user ke baare mein claims hote hain, aur signature saabit karta hai ki IdP ne ise diya:',
        ),
        code(
          'json',
          `
{
  "iss": "https://idp.example.com",
  "sub": "user_8f3a",
  "aud": "expense-api",
  "exp": 1767225600,
  "iat": 1767224700,
  "email": "abhi@example.com",
  "roles": ["employee"]
}`,
          'Decoded access token payload',
        ),
        note(
          'important',
          'A JWT is **signed, not encrypted** — anyone can read the payload. Never put secrets in it.',
          'JWT **signed hai, encrypted nahi** — payload koi bhi padh sakta hai. Isme kabhi secrets mat daalo.',
        ),
        p(
          'Every API verifies the token locally with the IdP’s public keys — no database lookup per request, which scales well across microservices:',
          'Har API token ko IdP ki public keys se local verify karti hai — har request pe database lookup nahi, jo microservices mein accha scale karta hai:',
        ),
        code(
          'ts',
          `
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL('https://idp.example.com/.well-known/jwks.json'));

export async function authenticate(token: string) {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: 'https://idp.example.com',   // who issued it
    audience: 'expense-api',             // it was meant for this API
    algorithms: ['RS256'],               // never accept "none"
  });
  return payload;                        // sub, roles… (expiry is checked too)
}`,
        ),
      ),
      section(
        'Trade-offs and security',
        'Trade-offs aur security',
        table(
          ['Concern', bi('What I do', 'Main kya karta hoon')],
          [
            [bi('A JWT cannot be revoked before it expires', 'JWT ko expiry se pehle revoke nahi kar sakte'), bi('Short-lived access tokens (5–15 min), rotating refresh tokens, a denylist for emergencies', 'Chhote access tokens (5–15 min), rotate hone wale refresh tokens, emergency ke liye denylist')],
            [bi('Token theft through XSS', 'XSS se token chori'), bi('HttpOnly, Secure, SameSite cookies — or keep tokens on the server (BFF pattern) — not localStorage', 'HttpOnly, Secure, SameSite cookies — ya tokens server pe (BFF pattern) — localStorage nahi')],
            [bi('Forged or misused tokens', 'Nakli ya galat use hue tokens'), bi('Verify signature, `iss`, `aud`, `exp`; fixed algorithm list', 'Signature, `iss`, `aud`, `exp` verify karo; algorithm ki fixed list')],
            [bi('Logging out everywhere', 'Har jagah se logout'), bi('Single logout at the IdP plus refresh-token revocation', 'IdP pe single logout plus refresh-token revocation')],
          ],
        ),
        table(
          ['', 'OpenID Connect', 'SAML 2.0', 'OAuth 2.0'],
          [
            [bi('Purpose', 'Maqsad'), bi('Authentication — who you are', 'Authentication — aap kaun ho'), bi('Authentication for enterprise SSO', 'Enterprise SSO ke liye authentication'), bi('Authorization — what an app may access', 'Authorization — app kya access kar sakti hai')],
            ['Token', 'ID token (JWT)', 'XML assertion', bi('Access token (opaque or JWT)', 'Access token (opaque ya JWT)')],
            [bi('Typical use', 'Aam use'), bi('Modern web and mobile apps', 'Modern web aur mobile apps'), bi('Older corporate applications', 'Purani corporate applications'), bi('Letting an app call an API for the user', 'App ko user ki taraf se API call karne dena')],
          ],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'In SSO, authentication is delegated to a central identity provider using a federation protocol — typically OpenID Connect on top of OAuth 2.0 with the authorization code flow and PKCE, or SAML in older enterprise setups. The app redirects to the IdP, the user authenticates once with MFA, the app exchanges an authorization code for tokens, and other apps reuse the IdP session without asking for the password again.',
          'SSO mein authentication ek central identity provider ko federation protocol se saunpa jaata hai — aam taur pe authorization code flow aur PKCE ke saath OAuth 2.0 pe OpenID Connect, ya purane enterprise setups mein SAML. App IdP pe redirect karta hai, user MFA ke saath ek baar authenticate karta hai, app authorization code ke badle tokens leta hai, aur doosre apps bina dobara password maange IdP session use karte hain.',
        ),
        bi(
          'JWT is the signed token format: the ID token identifies the user, and access-token JWTs are validated statelessly by APIs using the IdP’s public keys — checking signature, issuer, audience and expiry. Because JWTs are hard to revoke, I keep access tokens short-lived with rotating refresh tokens, store them in HttpOnly cookies or server-side, and support single logout.',
          'JWT signed token format hai: ID token user ki pehchaan batata hai, aur access-token JWTs ko APIs IdP ki public keys se statelessly validate karti hain — signature, issuer, audience aur expiry check karke. Kyunki JWTs revoke karna mushkil hai, main access tokens chhote rakhta hoon, refresh tokens rotate karta hoon, unhe HttpOnly cookies ya server-side rakhta hoon, aur single logout support karta hoon.',
        ),
      ],
      keywords: ['Identity provider (IdP)', 'Relying party', 'OpenID Connect', 'OAuth 2.0', 'SAML 2.0', 'Authorization code + PKCE', 'ID token vs access token', 'Refresh token rotation', 'JWT claims (iss, sub, aud, exp)', 'JWKS', 'Stateless authentication', 'Single logout'],
    },
    listenFor: [
      bi('Knowing authentication vs authorization, and ID token vs access token.', 'Authentication vs authorization, aur ID token vs access token ki samajh.'),
      bi('Describing the redirect and code flow, how a JWT is validated, and the revocation trade-off.', 'Redirect aur code flow samjhana, JWT kaise validate hota hai, aur revocation ka trade-off.'),
    ],
    mistakes: [bi('Saying “a JWT is encrypted”.', '“JWT encrypted hai” kehna.'), bi('Long-lived JWTs with no way to revoke them.', 'Lambe chalne wale JWTs jinhe revoke karne ka koi tareeka nahi.')],
    followUps: [
      {
        q: bi('Why use PKCE?', 'PKCE kyun use karte hain?'),
        a: bi(
          'It ties the authorization code to the client that started the login, so a stolen code cannot be exchanged by an attacker. It is required for browser and mobile apps, which cannot keep a client secret.',
          'Yeh authorization code ko us client se baandh deta hai jisne login shuru kiya, to chori hua code attacker badal nahi sakta. Browser aur mobile apps ke liye zaroori hai, jo client secret nahi rakh sakti.',
        ),
      },
      {
        q: bi('Session cookie or JWT?', 'Session cookie ya JWT?'),
        a: bi(
          'A session cookie points to server-side state: easy to revoke, but needs a lookup. A JWT carries the state: no lookup, but hard to revoke. Many apps use the IdP’s tokens only at login, then their own session cookie.',
          'Session cookie server-side state ki taraf point karti hai: revoke karna aasaan, par lookup chahiye. JWT state khud rakhta hai: lookup nahi, par revoke mushkil. Kai apps IdP ke tokens sirf login pe use karti hain, phir apni session cookie.',
        ),
      },
    ],
    related: { components: ['identity-provider', 'auth-service', 'api-gateway'], challenges: ['global-identity-and-authentication-platform'] },
  },
];
