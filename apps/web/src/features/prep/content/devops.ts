import { bi, code, note, p, section, steps, table, ul } from '../dsl';
import type { PrepQuestion } from '../types';

export const devopsQuestions: PrepQuestion[] = [
  // ───────────────────────── Kubernetes ─────────────────────────
  {
    id: 'kubernetes-pod-keeps-restarting',
    category: 'devops',
    topic: 'kubernetes',
    question: bi('A pod keeps restarting. What would you check first?', 'Ek pod baar-baar restart ho raha hai. Sabse pehle kya check karoge?'),
    kind: 'scenario',
    level: 'intermediate',
    tags: ['kubernetes', 'pod', 'crashloopbackoff', 'oomkilled', 'liveness probe', 'kubectl', 'exit code'],
    answer: bi(
      'First I find out why the container stops: `kubectl describe pod` for the last termination reason, exit code and events, then `kubectl logs --previous` for the logs of the crashed container. It is usually one of three things — the app crashes at startup (bad config, missing secret, unreachable dependency), it is OOMKilled, or a liveness probe is killing an app that is slow but healthy.',
      'Pehle main pata karta hoon ki container ruk kyun raha hai: last termination reason, exit code aur events ke liye `kubectl describe pod`, phir crash hue container ke logs ke liye `kubectl logs --previous`. Aam taur pe teen mein se ek hota hai — app startup pe crash (galat config, missing secret, dependency tak nahi pahunch pa raha), OOMKilled, ya liveness probe ek slow par healthy app ko maar raha hai.',
    ),
    sections: [
      section(
        'Step 1 — look at the status',
        'Step 1 — status dekho',
        code(
          'bash',
          `
$ kubectl get pod expense-api-7d9f
NAME               READY   STATUS             RESTARTS      AGE
expense-api-7d9f   0/1     CrashLoopBackOff   6 (40s ago)   9m`,
        ),
        p(
          '`CrashLoopBackOff` is not the error itself — it means Kubernetes keeps restarting a failing container and waits longer each time (10 s, 20 s, 40 s… up to 5 minutes).',
          '`CrashLoopBackOff` khud error nahi hai — iska matlab Kubernetes ek fail hote container ko baar-baar restart kar raha hai aur har baar zyaada wait karta hai (10 s, 20 s, 40 s… 5 minute tak).',
        ),
      ),
      section(
        'Step 2 — describe the pod',
        'Step 2 — pod ko describe karo',
        code(
          'bash',
          `
$ kubectl describe pod expense-api-7d9f
    Last State:  Terminated
      Reason:    OOMKilled
      Exit Code: 137
Events:
  Warning  Unhealthy  Liveness probe failed: Get "http://10.1.2.3:3000/health": context deadline exceeded
  Warning  BackOff    Back-off restarting failed container`,
        ),
        p(
          'The **reason**, the **exit code** and the **events** usually point straight at the cause.',
          '**Reason**, **exit code** aur **events** aksar seedha kaaran ki taraf ishaara karte hain.',
        ),
      ),
      section(
        'Step 3 — read the logs of the crashed container',
        'Step 3 — crash hue container ke logs padho',
        code(
          'bash',
          `
$ kubectl logs expense-api-7d9f --previous
Error: Missing required environment variable DATABASE_URL
    at loadConfig (/app/dist/config.js:12:11)`,
        ),
        note(
          'tip',
          'Without `--previous` you see the logs of the container that just started — usually empty. The stack trace is in the previous one.',
          '`--previous` ke bina aapko abhi start hue container ke logs dikhte hain — aksar khaali. Stack trace pichhle wale mein hota hai.',
        ),
      ),
      section(
        'Step 4 — read the exit code',
        'Step 4 — exit code samjho',
        table(
          ['Exit code', bi('Meaning', 'Matlab')],
          [
            ['1', bi('The application failed (exception, bad config)', 'Application fail hui (exception, galat config)')],
            ['137', bi('Killed with SIGKILL — usually OOMKilled, or killed after failed liveness probes', 'SIGKILL se maara gaya — aksar OOMKilled, ya liveness probe fail hone ke baad')],
            ['143', bi('SIGTERM — a normal, graceful stop', 'SIGTERM — normal, aaram se band')],
            ['0', bi('The process finished normally — but it was meant to keep running (wrong command, or should be a Job)', 'Process normally khatam hua — par use chalte rehna tha (galat command, ya ise Job hona chahiye)')],
          ],
        ),
      ),
      section(
        'Common causes and fixes',
        'Aam kaaran aur fixes',
        table(
          [bi('What you see', 'Kya dikhta hai'), bi('Likely cause', 'Sambhavit kaaran'), 'Fix'],
          [
            [bi('Exit code 1, error in logs', 'Exit code 1, logs mein error'), bi('Missing ConfigMap/Secret, wrong env var, database unreachable', 'Missing ConfigMap/Secret, galat env var, database tak nahi pahunch'), bi('Fix config; retry dependencies at startup', 'Config theek karo; startup pe dependencies retry karo')],
            ['OOMKilled, 137', bi('Memory limit too low, or a memory leak', 'Memory limit bahut kam, ya memory leak'), bi('Compare real usage with the limit; raise it or fix the leak', 'Asli use ko limit se milao; badhao ya leak theek karo')],
            ['“Liveness probe failed”', bi('Probe too strict, or slow startup', 'Probe bahut sakht, ya slow startup'), bi('Add a startupProbe; relax timeouts', 'startupProbe jodo; timeouts dheele karo')],
            ['ImagePullBackOff', bi('Wrong image tag or registry credentials', 'Galat image tag ya registry credentials'), bi('Fix the image reference or imagePullSecret', 'Image reference ya imagePullSecret theek karo')],
            ['Evicted', bi('The node ran out of memory or disk', 'Node ki memory ya disk khatam'), bi('Set requests properly; check node pressure', 'Requests sahi set karo; node pressure dekho')],
          ],
        ),
      ),
      section(
        'Step 5 — what changed? Roll back if users are hurt',
        'Step 5 — kya badla? Users pe asar ho to roll back',
        code(
          'bash',
          `
$ kubectl rollout history deployment/expense-api
$ kubectl rollout undo deployment/expense-api     # back to the last good version`,
        ),
      ),
      section(
        'How I prevent it',
        'Main ise kaise rokta hoon',
        code(
          'yaml',
          `
resources:
  requests: { memory: "256Mi", cpu: "250m" }
  limits:   { memory: "512Mi" }
startupProbe:                      # gives slow starts up to 60 s
  httpGet: { path: /livez, port: 3000 }
  periodSeconds: 2
  failureThreshold: 30
livenessProbe:                     # cheap check, no database calls
  httpGet: { path: /livez, port: 3000 }
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3`,
        ),
        ul(
          ['Requests and limits based on real usage.', 'Asli use pe aadharit requests aur limits.'],
          ['Alerts on restart counts and OOMKills.', 'Restart count aur OOMKills pe alerts.'],
          ['Logs shipped to a central system — they disappear with the pod.', 'Logs central system mein bhejo — pod ke saath gayab ho jaate hain.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I would first find out why the container is terminating. kubectl get pods shows the status and restart count; kubectl describe pod shows the last state, the reason — for example OOMKilled — the exit code and events such as failed liveness probes; and kubectl logs --previous shows the output of the crashed container, where the stack trace usually is.',
          'Main pehle pata karunga ki container band kyun ho raha hai. kubectl get pods status aur restart count dikhata hai; kubectl describe pod last state, reason — jaise OOMKilled — exit code aur failed liveness probes jaise events dikhata hai; aur kubectl logs --previous crash hue container ka output dikhata hai, jahan aksar stack trace hota hai.',
        ),
        bi(
          'Exit code 137 usually means OOMKilled or a liveness kill, 1 means an application error, and 0 means the process exited when it should not have. The common causes are a missing ConfigMap or Secret, an unreachable dependency, a memory limit that is too low, or an aggressive liveness probe. I check what changed in the rollout history, roll back if users are affected, and prevent it with startup probes, right-sized requests and limits, alerts on restarts and central logging.',
          'Exit code 137 aksar OOMKilled ya liveness kill hota hai, 1 application error, aur 0 matlab process tab khatam hua jab nahi hona chahiye tha. Aam kaaran hain missing ConfigMap ya Secret, na pahunchne wali dependency, bahut kam memory limit, ya aggressive liveness probe. Main rollout history mein dekhta hoon kya badla, users pe asar ho to roll back karta hoon, aur startup probes, sahi requests aur limits, restarts pe alerts aur central logging se ise rokta hoon.',
        ),
      ],
      keywords: ['CrashLoopBackOff', 'kubectl describe', 'kubectl logs --previous', 'Exit code 137', 'OOMKilled', 'Liveness probe', 'Startup probe', 'Requests and limits', 'ConfigMap / Secret', 'kubectl rollout undo'],
    },
    listenFor: [
      bi('A systematic order: describe → logs --previous → events.', 'Ek systematic order: describe → logs --previous → events.'),
      bi('Knowing exit codes, OOMKilled and probe misconfiguration, and checking what changed.', 'Exit codes, OOMKilled aur probe ki galat configuration ki jaankari, aur kya badla yeh dekhna.'),
    ],
    mistakes: [
      bi('Deleting the pod and hoping it goes away.', 'Pod delete karke ummeed karna ki problem chali jaayegi.'),
      bi('A liveness probe that checks the database — a database outage then restarts every pod.', 'Liveness probe jo database check kare — phir database outage pe har pod restart.'),
    ],
    followUps: [
      {
        q: bi('Why should a liveness probe not check the database?', 'Liveness probe database kyun check na kare?'),
        a: bi(
          'If the database goes down, every pod fails liveness and restarts at once. Restarting does not fix the database and makes recovery slower. Dependency checks belong in readiness.',
          'Database down hua to har pod liveness fail karke ek saath restart hoga. Restart se database theek nahi hota aur recovery aur slow hoti hai. Dependency checks readiness mein hone chahiye.',
        ),
      },
    ],
    related: { components: ['app-server'] },
  },

  {
    id: 'readiness-vs-liveness-probe',
    category: 'devops',
    topic: 'kubernetes',
    question: bi("What's the difference between a readiness probe and a liveness probe?", 'Readiness probe aur liveness probe mein kya fark hai?'),
    kind: 'comparison',
    level: 'intermediate',
    tags: ['kubernetes', 'readiness probe', 'liveness probe', 'startup probe', 'health check', 'rolling update'],
    answer: bi(
      'Both are health checks Kubernetes runs against a container, but they trigger different actions. A **readiness** probe asks “can this pod receive traffic right now?” — if it fails, the pod is removed from the Service endpoints but not restarted. A **liveness** probe asks “is this container stuck beyond recovery?” — if it fails, the kubelet restarts the container.',
      'Dono health checks hain jo Kubernetes container pe chalata hai, par alag action lete hain. **Readiness** probe poochta hai “kya yeh pod abhi traffic le sakta hai?” — fail hone pe pod Service endpoints se hat jaata hai par restart nahi hota. **Liveness** probe poochta hai “kya yeh container aisa atka hai ki theek nahi hoga?” — fail hone pe kubelet container restart karta hai.',
    ),
    sections: [
      section(
        'Side by side',
        'Aamne-saamne',
        table(
          ['', 'Readiness', 'Liveness', 'Startup'],
          [
            [bi('Question', 'Sawaal'), bi('Can it serve traffic now?', 'Kya abhi traffic serve kar sakta hai?'), bi('Is it stuck?', 'Kya atka hua hai?'), bi('Has it finished starting?', 'Kya start ho chuka?')],
            [bi('On failure', 'Fail hone pe'), bi('Removed from Service endpoints — no restart', 'Service endpoints se hataya — restart nahi'), bi('Container is restarted', 'Container restart hota hai'), bi('Restarted after the threshold', 'Threshold ke baad restart')],
            [bi('Runs', 'Kab chalta hai'), bi('Whole lifetime', 'Poori zindagi'), bi('Whole lifetime', 'Poori zindagi'), bi('Only at startup', 'Sirf startup pe')],
            ['Typical check', bi('Config loaded, cache warm, not overloaded', 'Config load, cache garam, overload nahi'), bi('The process responds — nothing external', 'Process jawab deta hai — bahar ka kuch nahi'), bi('Same as liveness, longer budget', 'Liveness jaisa, lamba budget')],
          ],
        ),
      ),
      section(
        'A real example',
        'Ek asli example',
        p(
          'An API that loads config and warms a cache for about 20 seconds at startup:',
          'Ek API jo startup pe lagbhag 20 second config load aur cache garam karta hai:',
        ),
        code(
          'ts',
          `
let ready = false;

app.get('/livez', (_req, res) => res.sendStatus(200));                  // the process is alive
app.get('/readyz', (_req, res) => res.sendStatus(ready ? 200 : 503));   // it can take traffic

await loadConfig();
await warmCache();
ready = true;

process.on('SIGTERM', () => {
  ready = false;              // stop receiving new traffic first
  server.close(() => process.exit(0));
});`,
        ),
        code(
          'yaml',
          `
startupProbe:
  httpGet: { path: /livez, port: 3000 }
  periodSeconds: 2
  failureThreshold: 30        # up to 60 s to start
readinessProbe:
  httpGet: { path: /readyz, port: 3000 }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /livez, port: 3000 }
  periodSeconds: 10
  failureThreshold: 3`,
        ),
      ),
      section(
        'Rules I follow',
        'Main kin rules ko follow karta hoon',
        ul(
          ['**Liveness is cheap and local.** It only checks that the process responds — never the database or other services.', '**Liveness sasta aur local.** Sirf yeh check karta hai ki process jawab de raha hai — kabhi database ya doosri services nahi.'],
          ['**Readiness covers warm-up, overload and shutdown.** It decides who gets traffic.', '**Readiness warm-up, overload aur shutdown sambhaalta hai.** Yeh decide karta hai traffic kise mile.'],
          ['**Slow starters get a startupProbe** instead of a huge `initialDelaySeconds`.', '**Slow start walon ko startupProbe** milta hai, bahut bade `initialDelaySeconds` ki jagah.'],
          ['**Careful with shared dependencies in readiness:** if every pod depends on the same database and all turn “not ready”, the Service has no endpoints at all.', '**Readiness mein shared dependencies se savdhaan:** agar har pod same database pe depend kare aur sab “not ready” ho jaayein, to Service ke paas ek bhi endpoint nahi bachta.'],
        ),
        note(
          'warning',
          'If liveness checks the database and the database goes down, every pod restarts at once — the outage gets worse, not better.',
          'Agar liveness database check kare aur database down ho, to har pod ek saath restart hota hai — outage behtar nahi, aur bura hota hai.',
        ),
      ),
      section(
        'Readiness and zero-downtime deploys',
        'Readiness aur zero-downtime deploys',
        steps(
          ['A new pod starts', 'Naya pod start hota hai', 'It is not ready yet, so it receives no traffic.', 'Abhi ready nahi, to traffic nahi milta.'],
          ['It becomes ready', 'Ready ho jaata hai', 'Once `/readyz` returns 200, the Service starts routing to it.', '`/readyz` 200 lautate hi Service use traffic bhejne lagti hai.'],
          ['The old pod gets SIGTERM', 'Purane pod ko SIGTERM milta hai', 'It fails readiness, finishes in-flight requests, then exits.', 'Woh readiness fail karta hai, chal rahi requests poori karta hai, phir exit.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'A readiness probe decides whether a pod should receive traffic: when it fails, Kubernetes removes the pod from the Service endpoints but does not restart it. I use it for startup warm-up, temporary overload and graceful shutdown, and it is what makes rolling updates zero-downtime.',
          'Readiness probe decide karta hai ki pod ko traffic milna chahiye ya nahi: fail hone pe Kubernetes pod ko Service endpoints se hata deta hai par restart nahi karta. Main ise startup warm-up, thodi der ke overload aur graceful shutdown ke liye use karta hoon, aur isi se rolling updates zero-downtime hote hain.',
        ),
        bi(
          'A liveness probe decides whether the container is stuck: when it fails, the kubelet restarts it, which recovers from deadlocks or hung processes. Liveness must be cheap and must not depend on external services, otherwise a database outage restarts every pod. For slow-starting apps I add a startup probe so liveness does not kill them while they boot.',
          'Liveness probe decide karta hai ki container atka hai ya nahi: fail hone pe kubelet use restart karta hai, jo deadlocks ya atke processes se ubaarta hai. Liveness sasta hona chahiye aur external services pe depend nahi karna chahiye, warna database outage har pod ko restart kar dega. Slow start hone wale apps ke liye main startup probe jodta hoon taaki boot hote waqt liveness unhe na maare.',
        ),
      ],
      keywords: ['Readiness probe', 'Liveness probe', 'Startup probe', 'Service endpoints', 'kubelet', 'failureThreshold', 'Rolling update', 'Graceful shutdown', 'SIGTERM', 'Cascading restarts'],
    },
    listenFor: [
      bi('The correct action on failure for each probe.', 'Har probe ke fail hone pe sahi action.'),
      bi('Knowing the startup probe, and not checking dependencies in liveness.', 'Startup probe ki jaankari, aur liveness mein dependencies check na karna.'),
    ],
    mistakes: [bi('Using the same endpoint, which checks the database, for both probes.', 'Dono probes ke liye same endpoint jo database check kare.'), bi('No readiness probe, so errors appear during every deploy.', 'Readiness probe nahi, to har deploy mein errors.')],
    followUps: [
      {
        q: bi('Can a pod be live but not ready?', 'Kya pod live ho par ready nahi?'),
        a: bi(
          'Yes — while warming its cache or when temporarily overloaded. It is running, but it is not receiving traffic.',
          'Haan — cache garam karte waqt ya thodi der overload hone pe. Chal raha hai, par traffic nahi le raha.',
        ),
      },
    ],
    related: { components: ['load-balancer'] },
  },

  // ───────────────────────── CI/CD ─────────────────────────
  {
    id: 'from-laptop-to-production',
    category: 'devops',
    topic: 'cicd',
    question: bi("You've just completed a task on your machine. How does that work go about getting into production?", 'Aapne apni machine pe ek task poora kiya. Woh kaam production tak kaise pahunchta hai?'),
    kind: 'behavioral',
    level: 'beginner',
    tags: ['ci/cd', 'pull request', 'code review', 'pipeline', 'github actions', 'deployment', 'feature flags'],
    answer: bi(
      'My change goes through an automated pipeline, not a manual hand-off. I push a branch and open a pull request; CI builds it and runs tests, lint and security checks; a teammate reviews it; after merging, CD builds one versioned artifact and promotes it through staging to production with a gradual rollout. After the release I watch metrics and logs, ready to roll back.',
      'Mera change ek automated pipeline se jaata hai, manual hand-off se nahi. Main branch push karke pull request kholta hoon; CI use build karke tests, lint aur security checks chalata hai; ek saathi review karta hai; merge ke baad CD ek versioned artifact banata hai aur use staging se production tak dheere-dheere rollout ke saath le jaata hai. Release ke baad main metrics aur logs dekhta hoon, roll back ko taiyaar.',
    ),
    sections: [
      section(
        'The path, step by step',
        'Raasta, step by step',
        steps(
          ['Before pushing', 'Push se pehle', 'Small, focused change; tests written; lint and tests run locally; I review my own diff.', 'Chhota, focused change; tests likhe; local mein lint aur tests chalaye; apna diff khud review kiya.'],
          ['Pull request', 'Pull request', 'Clear description, linked ticket, screenshots and how to test it.', 'Saaf description, linked ticket, screenshots aur test karne ka tareeka.'],
          ['Continuous Integration', 'Continuous Integration', 'On every push: build, lint, type-check, tests, security scans, container image.', 'Har push pe: build, lint, type-check, tests, security scans, container image.'],
          ['Code review', 'Code review', 'A teammate checks correctness, design, tests and security; branch protection blocks merging until checks are green.', 'Saathi correctness, design, tests aur security check karta hai; branch protection checks green hone tak merge rokti hai.'],
          ['Merge → staging', 'Merge → staging', 'CD builds one immutable, versioned image and deploys it to staging; smoke and end-to-end tests run.', 'CD ek immutable, versioned image banata hai aur staging pe deploy karta hai; smoke aur end-to-end tests chalte hain.'],
          ['Production', 'Production', 'The same image goes out gradually (canary or rolling), often behind a feature flag.', 'Wahi image dheere-dheere jaati hai (canary ya rolling), aksar feature flag ke peeche.'],
          ['After the release', 'Release ke baad', 'I watch dashboards, error rates and logs, and roll back if anything regresses.', 'Main dashboards, error rates aur logs dekhta hoon, aur kuch bigde to roll back.'],
        ),
      ),
      section(
        'What CI checks on every pull request',
        'CI har pull request pe kya check karta hai',
        code(
          'yaml',
          `
# .github/workflows/ci.yml
name: ci
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit --audit-level=high
      - run: docker build -t expense-api:\${{ github.sha }} .`,
        ),
        p(
          'Branch protection makes these checks — plus at least one approval — mandatory before merging.',
          'Branch protection in checks ko — aur kam se kam ek approval ko — merge se pehle zaroori banati hai.',
        ),
      ),
      section(
        'How we deploy safely',
        'Hum safely kaise deploy karte hain',
        table(
          ['Strategy', bi('How it works', 'Kaise kaam karti hai'), bi('When I use it', 'Kab use karta hoon')],
          [
            ['Rolling', bi('Replace pods a few at a time', 'Kuch-kuch pods badlo'), bi('Default for stateless services', 'Stateless services ka default')],
            ['Blue-green', bi('Start the new version beside the old, then switch traffic', 'Purane ke saath naya version chalao, phir traffic switch'), bi('Instant switch and instant rollback', 'Turant switch aur turant rollback')],
            ['Canary', bi('Send 1% → 10% → 100% of traffic while watching metrics', 'Metrics dekhte hue 1% → 10% → 100% traffic bhejo'), 'Risky changes'],
            ['Feature flag', bi('Deploy the code switched off; turn it on for some users', 'Code band karke deploy; kuch users ke liye on karo'), bi('Separating deploy from release', 'Deploy ko release se alag karna')],
          ],
        ),
        note(
          'important',
          '**Build once, deploy many:** the exact image tested in staging is the one that goes to production — never rebuild per environment.',
          '**Build once, deploy many:** jo image staging mein test hui, wahi production mein jaati hai — har environment ke liye dobara build nahi.',
        ),
      ),
      section(
        'Database changes',
        'Database changes',
        p(
          'Schema changes must work with both the old and the new code, because during a rollout both run at once. I use **expand and contract**: add the new column → deploy code that writes both → backfill → switch reads → remove the old column in a later release.',
          'Schema changes purane aur naye dono code ke saath chalne chahiye, kyunki rollout ke dauraan dono ek saath chalte hain. Main **expand and contract** use karta hoon: naya column jodo → dono mein likhne wala code deploy karo → backfill → reads switch karo → purana column agle release mein hatao.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I push a small branch and open a pull request with a clear description. CI runs automatically on every push — build, lint, type-check, unit and integration tests, dependency and secret scanning, and the container image build — and branch protection requires those checks plus a code review before merging.',
          'Main ek chhoti branch push karke saaf description ke saath pull request kholta hoon. CI har push pe apne aap chalta hai — build, lint, type-check, unit aur integration tests, dependency aur secret scanning, aur container image build — aur branch protection merge se pehle in checks aur code review ko zaroori banati hai.',
        ),
        bi(
          'After merging, CD builds one immutable, versioned artifact, deploys it to staging with smoke tests, and promotes the same artifact to production with a canary or rolling rollout, often behind a feature flag, with backward-compatible database migrations. I do not merge and forget: I watch the dashboards and alerts after the release and roll back if anything regresses.',
          'Merge ke baad CD ek immutable, versioned artifact banata hai, smoke tests ke saath staging pe deploy karta hai, aur wahi artifact canary ya rolling rollout se production mein le jaata hai, aksar feature flag ke peeche, backward-compatible database migrations ke saath. Main merge karke bhoolta nahi: release ke baad dashboards aur alerts dekhta hoon aur kuch bigde to roll back karta hoon.',
        ),
      ],
      keywords: ['Pull request', 'Code review', 'Continuous Integration', 'Continuous Delivery', 'Branch protection', 'Build once, deploy many', 'Immutable artifact', 'Staging', 'Canary / blue-green / rolling', 'Feature flags', 'Expand and contract', 'Rollback'],
    },
    listenFor: [
      bi('Do they understand the full flow of getting their work into production?', 'Kya woh apne kaam ko production tak le jaane ka poora flow samajhte hain?'),
      bi('Do they talk about which automated checks run, and how that was set up?', 'Kya woh batate hain kaunse automated checks chalte hain, aur woh kaise set hue?'),
      bi('Do they merge the PR and forget about it until there is a bug weeks later?', 'Kya woh PR merge karke bhool jaate hain jab tak hafton baad bug na aaye?'),
    ],
    mistakes: [bi('“I push to main and someone else deploys it.”', '“Main main pe push karta hoon aur koi aur deploy karta hai.”'), bi('No mention of tests, review, monitoring or rollback.', 'Tests, review, monitoring ya rollback ka koi zikr nahi.')],
    followUps: [
      {
        q: bi('Continuous delivery vs continuous deployment?', 'Continuous delivery aur continuous deployment mein kya fark hai?'),
        a: bi(
          'Continuous delivery: every change is always releasable, but a person approves the production deploy. Continuous deployment: every change that passes the pipeline goes to production automatically.',
          'Continuous delivery: har change hamesha release karne layak hai, par production deploy ko koi insaan approve karta hai. Continuous deployment: pipeline pass karne wala har change apne aap production mein jaata hai.',
        ),
      },
    ],
    related: { challenges: ['feature-flag-service'] },
  },

  // ───────────────────────── Observability ─────────────────────────
  {
    id: 'logs-vs-metrics-vs-traces',
    category: 'devops',
    topic: 'observability',
    question: bi("What's the difference between logs, metrics, and traces?", 'Logs, metrics aur traces mein kya fark hai?'),
    kind: 'comparison',
    level: 'beginner',
    tags: ['observability', 'logs', 'metrics', 'traces', 'opentelemetry', 'prometheus'],
    answer: bi(
      'They are the three pillars of observability. **Metrics** are numbers over time that tell me something is wrong — error rate, latency, throughput. **Logs** are detailed records of individual events that tell me why. **Traces** follow one request across services and tell me where the time or the error is.',
      'Yeh observability ke teen pillars hain. **Metrics** samay ke saath numbers hain jo batate hain ki kuch gadbad hai — error rate, latency, throughput. **Logs** alag-alag events ke detailed record hain jo batate hain kyun. **Traces** ek request ko services mein follow karte hain aur batate hain ki time ya error kahan hai.',
    ),
    sections: [
      section(
        'Side by side',
        'Aamne-saamne',
        table(
          ['', 'Metrics', 'Logs', 'Traces'],
          [
            [bi('What it is', 'Kya hai'), bi('Numbers aggregated over time', 'Samay ke saath jode gaye numbers'), bi('Timestamped records of single events', 'Alag events ke timestamp wale record'), bi('One request’s path and timing across services', 'Services mein ek request ka raasta aur timing')],
            [bi('Answers', 'Jawab deta hai'), bi('Is something wrong? How much?', 'Kya gadbad hai? Kitni?'), bi('What exactly happened, and why?', 'Bilkul kya hua, aur kyun?'), bi('Where is the time or the error?', 'Time ya error kahan hai?')],
            [bi('Cost', 'Kharcha'), bi('Cheap, fixed size', 'Sasta, fixed size'), bi('Large; grows with traffic', 'Bada; traffic ke saath badhta hai'), bi('Medium; usually sampled', 'Beech ka; aksar sampled')],
            [bi('Best for', 'Kiske liye best'), 'Dashboards, alerts, SLOs', 'Debugging details, audits', bi('Latency across microservices', 'Microservices mein latency')],
            ['Tools', 'Prometheus, Datadog, CloudWatch', 'ELK / OpenSearch, Loki', 'Jaeger, Tempo, OpenTelemetry'],
          ],
        ),
      ),
      section(
        'One incident, seen through all three',
        'Ek incident, teeno ki nazar se',
        p('**Metric** — the alert fires:', '**Metric** — alert bajta hai:'),
        code('text', 'checkout p99 latency = 3.2 s (normally 300 ms) · 5xx rate = 4%'),
        p('**Trace** — shows where the time goes:', '**Trace** — dikhata hai time kahan ja raha hai:'),
        code(
          'text',
          `
POST /checkout                 3.21 s
├─ order-service                 40 ms
└─ payment-service             3.15 s   ← here
   └─ bank-gateway call        3.10 s`,
        ),
        p('**Log** — explains why:', '**Log** — batata hai kyun:'),
        code(
          'json',
          `
{ "level": "error", "service": "payment-service", "traceId": "4bf92f35", "msg": "bank gateway timeout after 3000 ms", "orderId": "ord_481" }`,
        ),
        p(
          'Metrics told me something was wrong, the trace showed where, and the log explained why. The shared **trace ID** is what connects them.',
          'Metrics ne bataya kuch gadbad hai, trace ne dikhaya kahan, aur log ne samjhaya kyun. Shared **trace ID** hi inhe jodta hai.',
        ),
      ),
      section(
        'Good practices',
        'Acchi practices',
        ul(
          ['**Metrics:** counters, gauges and histograms; RED (rate, errors, duration) per service; keep labels low-cardinality — never user IDs.', '**Metrics:** counters, gauges aur histograms; har service ke liye RED (rate, errors, duration); labels low-cardinality rakho — kabhi user IDs nahi.'],
          ['**Logs:** structured JSON with level, service and trace ID; no passwords or personal data; shipped to one central place.', '**Logs:** level, service aur trace ID ke saath structured JSON; passwords ya personal data nahi; ek central jagah bhejo.'],
          ['**Traces:** propagate context between services (W3C `traceparent`) and sample to control cost.', '**Traces:** services ke beech context propagate karo (W3C `traceparent`) aur kharcha control karne ke liye sample karo.'],
          ['**OpenTelemetry** to instrument all three in one consistent way.', 'Teeno ko ek consistent tareeke se instrument karne ke liye **OpenTelemetry**.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'Metrics are aggregated numeric time series — request rate, error rate, latency percentiles — that are cheap to store and power dashboards, alerts and SLOs; they tell me something is wrong. Logs are detailed, ideally structured records of individual events that tell me why it happened. Traces follow a single request across services as a tree of timed spans and tell me where the time or the failure is.',
          'Metrics aggregated numeric time series hain — request rate, error rate, latency percentiles — jo store karna sasta hai aur dashboards, alerts aur SLOs chalate hain; yeh batate hain ki kuch gadbad hai. Logs alag events ke detailed, behtar ho to structured record hain jo batate hain kyun hua. Traces ek request ko services mein timed spans ke tree ki tarah follow karte hain aur batate hain ki time ya failure kahan hai.',
        ),
        bi(
          'In an incident I go from a metric alert to a slow or failing trace, and then to the logs for that trace ID. The key is correlation: I put the trace ID in every log line, keep metric labels low-cardinality, sample traces, and instrument everything with OpenTelemetry.',
          'Incident mein main metric alert se slow ya fail hote trace tak, aur phir us trace ID ke logs tak jaata hoon. Asli baat correlation hai: main har log line mein trace ID daalta hoon, metric labels low-cardinality rakhta hoon, traces sample karta hoon, aur sab kuch OpenTelemetry se instrument karta hoon.',
        ),
      ],
      keywords: ['Observability', 'Three pillars', 'Time series', 'Counter / gauge / histogram', 'Cardinality', 'Structured logging', 'Trace ID / correlation', 'Span', 'Context propagation', 'Sampling', 'RED method', 'OpenTelemetry'],
    },
    listenFor: [
      bi('Correct definitions and when to use each.', 'Sahi definitions aur har ek kab use karna.'),
      bi('How they connect (trace IDs in logs) and a practical incident flow.', 'Yeh kaise judte hain (logs mein trace IDs) aur ek practical incident flow.'),
    ],
    mistakes: [bi('Counting errors by searching logs instead of using metrics.', 'Metrics ki jagah logs search karke errors ginna.'), bi('Putting user IDs in metric labels.', 'Metric labels mein user IDs daalna.')],
    followUps: [
      {
        q: bi('Why not just log everything?', 'Sab kuch log hi kyun na kar dein?'),
        a: bi(
          'Cost and noise: huge volume, slow searches and privacy risk. Metrics are far better for trends and alerting; logs are for detail.',
          'Kharcha aur shor: bahut bada volume, slow search aur privacy ka risk. Trends aur alerting ke liye metrics kahin behtar hain; logs detail ke liye hain.',
        ),
      },
    ],
    related: { components: ['logging-service', 'metrics-monitoring', 'distributed-tracing'], challenges: ['observability-platform', 'centralized-logging-platform', 'distributed-tracing-system'] },
  },

  {
    id: 'metrics-to-monitor-for-a-production-api',
    category: 'devops',
    topic: 'observability',
    question: bi('What metrics would you monitor for a production API?', 'Production API ke liye kaun se metrics monitor karoge?'),
    kind: 'concept',
    level: 'intermediate',
    tags: ['metrics', 'monitoring', 'golden signals', 'latency', 'error rate', 'slo', 'prometheus'],
    answer: bi(
      'I start with the four golden signals for every endpoint — traffic, errors, latency as percentiles, and saturation — then add the health of dependencies (database, cache, queues, third-party APIs) and a few business metrics such as successful checkouts. I alert on what users feel, not on every CPU blip.',
      'Main har endpoint ke chaar golden signals se shuru karta hoon — traffic, errors, percentiles mein latency, aur saturation — phir dependencies (database, cache, queues, third-party APIs) ki health aur kuch business metrics jaise successful checkouts jodta hoon. Main users jo mehsoos karte hain uspe alert karta hoon, har CPU blip pe nahi.',
    ),
    sections: [
      section(
        'The four golden signals',
        'Chaar golden signals',
        table(
          ['Signal', bi('What I measure', 'Main kya naapta hoon'), 'Example alert'],
          [
            ['Traffic', bi('Requests per second per endpoint', 'Har endpoint ki requests per second'), bi('Traffic 50% below the same time last week', 'Pichhle hafte isi time se traffic 50% kam')],
            ['Errors', bi('5xx rate, plus notable 4xx (401, 429)', '5xx rate, plus khaas 4xx (401, 429)'), bi('5xx above 1% for 5 minutes', '5 minute tak 5xx 1% se zyaada')],
            ['Latency', bi('p50, p95, p99 per endpoint', 'Har endpoint ka p50, p95, p99'), bi('p99 above 800 ms for 10 minutes', '10 minute tak p99 800 ms se zyaada')],
            ['Saturation', bi('CPU, memory, event-loop lag, DB pool usage, queue depth', 'CPU, memory, event-loop lag, DB pool use, queue depth'), bi('DB connection pool above 90%', 'DB connection pool 90% se zyaada')],
          ],
        ),
      ),
      section(
        'Why percentiles, not averages',
        'Averages nahi, percentiles kyun',
        p(
          'Out of 100 requests, 95 take 100 ms and 5 take 5 seconds. The **average is 345 ms** — it looks fine. The **p99 is 5 seconds** — the truth. At a million requests a day, that 1% is ten thousand unhappy users.',
          '100 requests mein se 95 ko 100 ms aur 5 ko 5 second lagte hain. **Average 345 ms** hai — theek lagta hai. **p99 5 second** hai — yahi sach hai. Din ki das lakh requests pe woh 1% das hazaar naraaz users hain.',
        ),
      ),
      section(
        'Beyond the golden signals',
        'Golden signals ke aage',
        ul(
          ['**Dependencies:** database latency and errors, cache hit ratio, queue consumer lag, third-party API latency, circuit-breaker state.', '**Dependencies:** database latency aur errors, cache hit ratio, queue consumer lag, third-party API latency, circuit-breaker state.'],
          ['**Runtime:** event-loop lag and GC pauses (Node.js), container restarts and OOMKills.', '**Runtime:** event-loop lag aur GC pauses (Node.js), container restarts aur OOMKills.'],
          ['**Business:** signups, logins, checkout success — they catch “200 OK but wrong”.', '**Business:** signups, logins, checkout success — yeh “200 OK par galat” pakadte hain.'],
          ['**Deploy markers** on every dashboard, so a regression lines up with the release that caused it.', 'Har dashboard pe **deploy markers**, taaki regression us release se mil jaaye jisne use paida kiya.'],
        ),
      ),
      section(
        'Instrumenting it in Node.js',
        'Node.js mein instrument karna',
        code(
          'ts',
          `
import client from 'prom-client';

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => end({ method: req.method, route: req.route?.path ?? 'unknown', status: res.statusCode }));
  next();
});`,
        ),
        note(
          'warning',
          'Use the **route** (`/orders/:id`) as a label, never the raw URL or a user ID — every unique value creates a new time series and blows up cost.',
          'Label mein **route** (`/orders/:id`) use karo, kabhi raw URL ya user ID nahi — har unique value ek nayi time series banati hai aur kharcha phat jaata hai.',
        ),
        code(
          'promql',
          `
# alert: more than 1% of requests failing over 5 minutes
sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_request_duration_seconds_count[5m])) > 0.01`,
        ),
      ),
      section(
        'Alerting',
        'Alerting',
        ul(
          ['Alert on symptoms users feel — error rate, latency, SLO burn rate.', 'Users jo mehsoos karte hain un lakshano pe alert karo — error rate, latency, SLO burn rate.'],
          ['Page people only for problems that need action now; link every alert to a runbook.', 'Logon ko sirf un problems pe jagao jinpe abhi action chahiye; har alert ko runbook se jodo.'],
          ['Remove noisy alerts — alert fatigue makes people ignore the real ones.', 'Shor wale alerts hatao — alert fatigue se log asli alerts bhi ignore karne lagte hain.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I monitor the four golden signals per endpoint: traffic in requests per second, errors as the 5xx rate plus notable 4xx such as 401 and 429, latency as p50, p95 and p99 from histograms rather than averages, and saturation — CPU, memory, event-loop lag, connection-pool usage and queue depth.',
          'Main har endpoint ke chaar golden signals monitor karta hoon: requests per second mein traffic, 5xx rate plus 401 aur 429 jaise khaas 4xx ke roop mein errors, averages ki jagah histograms se p50, p95 aur p99 latency, aur saturation — CPU, memory, event-loop lag, connection-pool use aur queue depth.',
        ),
        bi(
          'On top of that I track dependency health — database latency, cache hit ratio, consumer lag, third-party latency — and business KPIs like checkout success to catch silent failures. I define SLOs, alert on burn rate and user-facing symptoms with runbooks, add deploy markers to dashboards, and keep metric labels low-cardinality.',
          'Uske upar main dependency health track karta hoon — database latency, cache hit ratio, consumer lag, third-party latency — aur chupi failures pakadne ke liye checkout success jaise business KPIs. Main SLOs tay karta hoon, runbooks ke saath burn rate aur user-facing lakshano pe alert karta hoon, dashboards pe deploy markers lagata hoon, aur metric labels low-cardinality rakhta hoon.',
        ),
      ],
      keywords: ['Four golden signals', 'RED method', 'USE method', 'Latency percentiles', 'Error rate', 'Saturation', 'SLI / SLO / SLA', 'Error budget', 'Burn-rate alert', 'Cardinality', 'Alert fatigue'],
    },
    listenFor: [
      bi('Percentiles rather than averages.', 'Averages ki jagah percentiles.'),
      bi('Golden signals plus dependencies and business metrics, and a sensible alerting approach.', 'Golden signals plus dependencies aur business metrics, aur alerting ki samajhdaar soch.'),
    ],
    mistakes: [bi('Watching only CPU and memory.', 'Sirf CPU aur memory dekhna.'), bi('Alerting on everything.', 'Har cheez pe alert.')],
    followUps: [
      {
        q: bi('SLI vs SLO vs SLA?', 'SLI, SLO aur SLA mein kya fark hai?'),
        a: bi(
          'The SLI is the measurement (the success rate). The SLO is the internal target (99.9%). The SLA is the contractual promise to customers, with penalties — usually looser than the SLO.',
          'SLI naap hai (success rate). SLO andar ka target hai (99.9%). SLA customers se contract wala vaada hai, penalty ke saath — aam taur pe SLO se dheela.',
        ),
      },
    ],
    related: { components: ['metrics-monitoring'], challenges: ['metrics-monitoring-platform', 'observability-platform'] },
  },

  {
    id: 'find-where-extra-latency-comes-from',
    category: 'devops',
    topic: 'observability',
    question: bi(
      'You observe that two similar user actions have dramatically different latencies. How would you systematically determine where the additional latency is being introduced?',
      'Aap dekhte ho ki do milte-julte user actions ki latency mein bahut bada fark hai. Systematically kaise pata karoge ki extra latency kahan se aa rahi hai?',
    ),
    kind: 'scenario',
    level: 'advanced',
    tags: ['latency', 'troubleshooting', 'tracing', 'profiling', 'performance', 'n+1'],
    answer: bi(
      'I do not guess — I break the request into stages and measure each one for both the fast and the slow case. Comparing a fast and a slow distributed trace side by side usually shows which stage grows; then I dig into that stage — query plan, cache hit or miss, external call, code path or the specific server — and confirm the cause by changing one variable at a time.',
      'Main andaaza nahi lagata — request ko stages mein todta hoon aur fast aur slow dono case ke liye har stage naapta hoon. Ek fast aur ek slow distributed trace ko saath-saath compare karne se aksar dikh jaata hai kaunsa stage bada hai; phir main us stage mein khodta hoon — query plan, cache hit ya miss, external call, code path ya khaas server — aur ek baar mein ek cheez badal ke kaaran confirm karta hoon.',
    ),
    sections: [
      section(
        'The scenario',
        'Scenario',
        p(
          '`GET /orders/101` takes 120 ms, but `GET /orders/205` takes 4 seconds — same endpoint, same code, similar users. The interviewer is checking your method: measure and narrow down, or guess?',
          '`GET /orders/101` 120 ms leta hai, par `GET /orders/205` 4 second — same endpoint, same code, milte-julte users. Interviewer aapka tareeka dekh raha hai: naap ke seemit karna, ya andaaza?',
        ),
      ),
      section(
        'Step by step',
        'Step by step',
        steps(
          ['Define and reproduce', 'Define aur reproduce karo', 'Exact inputs, users and times; consistent or intermittent; p50 vs p99. Does it follow certain data, regions or servers?', 'Bilkul kaunse inputs, users aur time; hamesha ya kabhi-kabhi; p50 vs p99. Kya yeh kisi khaas data, region ya server ke saath hota hai?'],
          ['Check the client', 'Client check karo', 'The browser’s network waterfall: DNS, TLS, waiting for the server (TTFB), download size, rendering.', 'Browser ka network waterfall: DNS, TLS, server ka wait (TTFB), download size, rendering.'],
          ['Check the edge', 'Edge check karo', 'Load balancer logs show the upstream time — it separates network and queueing from processing.', 'Load balancer logs upstream time dikhate hain — yeh network aur queueing ko processing se alag karta hai.'],
          ['Compare traces', 'Traces compare karo', 'Put a fast and a slow trace side by side; find the span that grows.', 'Ek fast aur ek slow trace saath rakho; jo span bada hai woh dhoondho.'],
          ['Drill into that span', 'Us span mein khodo', 'Query plan, cache hit/miss, external API latency and retries, N+1 queries, payload size, CPU profile.', 'Query plan, cache hit/miss, external API latency aur retries, N+1 queries, payload size, CPU profile.'],
          ['Test one hypothesis at a time', 'Ek baar mein ek hypothesis test karo', 'Replay the slow request with the fast user’s data, warm the cache, or route to another instance.', 'Slow request ko fast user ke data ke saath dobara chalao, cache garam karo, ya doosre instance pe bhejo.'],
          ['Fix and prevent', 'Theek karo aur roko', 'Fix the root cause, compare before/after, and add latency percentiles and alerts for that path.', 'Root cause theek karo, pehle/baad compare karo, aur us path pe latency percentiles aur alerts jodo.'],
        ),
      ),
      section(
        'Comparing two traces',
        'Do traces compare karna',
        code(
          'text',
          `
GET /orders/101    total   120 ms        GET /orders/205    total 4,020 ms
├─ auth                     8 ms         ├─ auth                     9 ms
├─ db: load order          12 ms         ├─ db: load order          11 ms
├─ db: load items          15 ms         ├─ db: load items       3,850 ms   ← here
└─ serialize JSON          20 ms         └─ serialize JSON          95 ms`,
        ),
        p(
          'Only **load items** grew. Order 205 has 40,000 items, and that query does a sequential scan because `order_items.order_id` has no index. Adding the index — and paginating items — fixes it.',
          'Sirf **load items** bada hua. Order 205 mein 40,000 items hain, aur woh query sequential scan karti hai kyunki `order_items.order_id` pe index nahi. Index jodna — aur items paginate karna — ise theek kar deta hai.',
        ),
      ),
      section(
        'Common culprits',
        'Aam dosh',
        table(
          [bi('Culprit', 'Dosh'), bi('How it shows up', 'Kaise dikhta hai'), bi('How I confirm it', 'Kaise confirm karta hoon')],
          [
            [bi('Data-dependent query', 'Data pe depend query'), bi('Slow only for big accounts', 'Sirf bade accounts ke liye slow'), '`EXPLAIN ANALYZE` with that input'],
            ['Cache miss', bi('First request slow, later fast', 'Pehli request slow, baad wali fast'), bi('Cache hit/miss in logs or spans', 'Logs ya spans mein cache hit/miss')],
            ['N+1 queries', bi('Hundreds of tiny DB spans', 'Saikdon chhote DB spans'), bi('Span count grows with item count', 'Items ke saath span count badhta hai')],
            ['Slow dependency', bi('One external span is long, or retried', 'Ek external span lamba, ya retry hua'), bi('Their latency metrics, retries', 'Unki latency metrics, retries')],
            [bi('One bad instance', 'Ek kharab instance'), bi('Slow only on one pod', 'Sirf ek pod pe slow'), bi('Group latency by host; GC pauses, CPU throttling', 'Host ke hisaab se latency; GC pauses, CPU throttling')],
          ],
        ),
        note(
          'tip',
          'No tracing yet? Log the duration of each stage with a correlation ID, use load balancer access logs and the database slow-query log — and add tracing as part of the fix.',
          'Abhi tracing nahi? Har stage ki duration correlation ID ke saath log karo, load balancer access logs aur database slow-query log use karo — aur fix ke saath tracing jodo.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I would measure both requests end to end and break the latency down hop by hop — client, network, edge, each service and each dependency. First I make sure I can reproduce it and see whether it follows particular inputs, users or servers. Then I check the client waterfall and the load balancer’s upstream timings to separate network and queueing from processing.',
          'Main dono requests ko shuru se aakhir tak naapunga aur latency ko hop dar hop todunga — client, network, edge, har service aur har dependency. Pehle pakka karta hoon ki reproduce kar sakun aur dekhta hoon ki yeh khaas inputs, users ya servers ke saath hota hai ya nahi. Phir client waterfall aur load balancer ki upstream timings dekh ke network aur queueing ko processing se alag karta hoon.',
        ),
        bi(
          'The most effective step is comparing a fast and a slow distributed trace side by side to find the span that grows, then drilling into it: EXPLAIN for data-dependent queries, cache hit versus miss, external API latency and retries, N+1 queries, payload size, or a specific instance with GC pauses or CPU throttling. I confirm by changing one variable at a time, fix the root cause, and add latency percentiles and alerts so it is caught early next time.',
          'Sabse asardaar step hai ek fast aur ek slow distributed trace ko saath-saath compare karke bada hota span dhoondhna, phir usme khodna: data pe depend queries ke liye EXPLAIN, cache hit vs miss, external API latency aur retries, N+1 queries, payload size, ya GC pauses ya CPU throttling wala khaas instance. Main ek baar mein ek cheez badal ke confirm karta hoon, root cause theek karta hoon, aur latency percentiles aur alerts jodta hoon taaki agli baar jaldi pakda jaaye.',
        ),
      ],
      keywords: ['End-to-end latency', 'Latency breakdown', 'Distributed tracing', 'Span', 'Critical path', 'TTFB', 'p50 / p99', 'Cache hit vs miss', 'N+1 queries', 'EXPLAIN ANALYZE', 'GC pause', 'Hypothesis-driven debugging'],
    },
    listenFor: [
      bi('A systematic, data-driven method rather than guessing.', 'Andaaze ki jagah systematic, data pe chalne wala tareeka.'),
      bi('Comparing the fast and slow cases with tracing, and considering data-dependent causes.', 'Tracing se fast aur slow cases compare karna, aur data pe depend kaaranon pe sochna.'),
    ],
    mistakes: [bi('Guessing — “it’s probably the database”.', 'Andaaza lagana — “shayad database hai”.'), bi('Looking only at averages.', 'Sirf averages dekhna.')],
    followUps: [
      {
        q: bi('What is an N+1 query problem?', 'N+1 query problem kya hai?'),
        a: bi(
          'Loading a list with one query, then running one extra query per item — fine for 5 items, terrible for 500. Fix it with a join, a batched `WHERE id IN (…)`, or eager loading in the ORM.',
          'Ek query se list laana, phir har item ke liye ek extra query — 5 items pe theek, 500 pe bahut bura. Join, batched `WHERE id IN (…)`, ya ORM mein eager loading se theek karo.',
        ),
      },
    ],
    related: { components: ['distributed-tracing', 'metrics-monitoring'], challenges: ['distributed-tracing-system'] },
  },

  {
    id: 'how-do-you-know-your-release-has-a-problem',
    category: 'devops',
    topic: 'observability',
    question: bi("You've just released some code to production. When and how do you find out if there's an issue with that code?", 'Aapne abhi production mein code release kiya. Kab aur kaise pata chalega ki us code mein koi problem hai?'),
    kind: 'behavioral',
    level: 'intermediate',
    tags: ['ownership', 'monitoring', 'alerting', 'release', 'canary', 'feature flags', 'error tracking'],
    answer: bi(
      'I find out within minutes, not from a bug ticket. I release gradually, watch the service’s dashboards, error tracking and logs right after the deploy, and rely on automated alerts — error rate, latency and business metrics — that page us if anything regresses. If something looks wrong, I roll back or switch off the feature flag first and investigate after.',
      'Mujhe minutes mein pata chalta hai, bug ticket se nahi. Main dheere-dheere release karta hoon, deploy ke turant baad service ke dashboards, error tracking aur logs dekhta hoon, aur automated alerts pe bharosa karta hoon — error rate, latency aur business metrics — jo kuch bigadne pe humein page karte hain. Kuch galat dikhe to pehle roll back ya feature flag off karta hoon aur jaanch baad mein.',
    ),
    sections: [
      section(
        'Before the release',
        'Release se pehle',
        ul(
          ['I know what “healthy” looks like: which metric, log or event proves the change works — and I add it as part of the task.', 'Main jaanta hoon “healthy” kaisa dikhta hai: kaunsa metric, log ya event saabit karta hai ki change kaam kar raha hai — aur use task ke hisse ke roop mein jodta hoon.'],
          ['Risky changes go behind a feature flag.', 'Risky changes feature flag ke peeche jaate hain.'],
          ['I deploy during working hours — never just before leaving.', 'Main kaam ke ghanton mein deploy karta hoon — nikalne se theek pehle kabhi nahi.'],
        ),
      ),
      section(
        'Right after deploying',
        'Deploy ke turant baad',
        ul(
          ['Compare error rate, p95/p99 latency and saturation before and after the **deploy marker**.', '**Deploy marker** se pehle aur baad error rate, p95/p99 latency aur saturation compare karo.'],
          ['Check error tracking (such as Sentry) for **new** exception types.', 'Error tracking (jaise Sentry) mein **naye** exception types dekho.'],
          ['Run a quick smoke test of the feature in production.', 'Production mein feature ka chhota smoke test karo.'],
        ),
      ),
      section(
        'Automated detection',
        'Automated detection',
        table(
          ['Signal', 'Example'],
          [
            ['Error-rate / SLO burn alert', bi('5xx above 1% for 5 minutes pages on-call', '5 minute tak 5xx 1% se zyaada pe on-call ko page')],
            ['Error tracking', bi('A new exception type after the release', 'Release ke baad naya exception type')],
            ['Synthetic checks', bi('A script logs in and checks out every minute', 'Ek script har minute login aur checkout karti hai')],
            ['Canary analysis', bi('Rollout halts automatically if the canary’s errors rise', 'Canary ke errors badhein to rollout apne aap ruk jaata hai')],
            ['Business metrics', bi('Checkout success drops below 95%', 'Checkout success 95% se neeche')],
          ],
        ),
      ),
      section(
        'Releasing gradually',
        'Dheere-dheere release',
        code(
          'ts',
          `
if (await flags.isEnabled('new-checkout', { userId })) {
  return newCheckout(cart);     // 5% of users first, then more
}
return legacyCheckout(cart);`,
        ),
        p(
          'If the new path misbehaves, switching the flag off takes seconds — no redeploy.',
          'Naya path gadbad kare to flag off karne mein seconds lagte hain — dobara deploy nahi.',
        ),
      ),
      section(
        'If something is wrong',
        'Agar kuch galat ho',
        steps(
          ['Mitigate', 'Mitigate karo', 'Roll back or switch the flag off.', 'Roll back ya flag off.'],
          ['Communicate', 'Batao', 'Tell the team and support what is happening.', 'Team aur support ko batao kya ho raha hai.'],
          ['Investigate', 'Jaanch karo', 'Logs, traces and the diff — then fix forward.', 'Logs, traces aur diff — phir fix forward.'],
          ['Close the gap', 'Kami bharo', 'Add the alert or test that would have caught it sooner.', 'Woh alert ya test jodo jo ise jaldi pakad leta.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'I do not wait for a bug ticket — I own the change through the release. Before releasing I know which metrics or events prove it works, and risky changes go behind a feature flag or out as a canary, during working hours.',
          'Main bug ticket ka wait nahi karta — release tak change ki zimmedari leta hoon. Release se pehle jaanta hoon kaunse metrics ya events saabit karte hain ki yeh kaam kar raha hai, aur risky changes feature flag ke peeche ya canary ki tarah, kaam ke ghanton mein jaate hain.',
        ),
        bi(
          'Right after the deploy I compare error rate, latency percentiles and saturation against the deploy marker, check error tracking for new exceptions, and smoke-test the feature. Automated alerts on error rate, SLO burn, synthetic checks and business metrics tell us within minutes if something regresses. If it does, I roll back or turn the flag off first, then investigate and add the alert or test that would have caught it earlier.',
          'Deploy ke turant baad main error rate, latency percentiles aur saturation ko deploy marker se compare karta hoon, naye exceptions ke liye error tracking dekhta hoon, aur feature ka smoke test karta hoon. Error rate, SLO burn, synthetic checks aur business metrics pe automated alerts minutes mein bata dete hain agar kuch bigde. Aisa ho to main pehle roll back ya flag off karta hoon, phir jaanch karta hoon aur woh alert ya test jodta hoon jo ise pehle pakad leta.',
        ),
      ],
      keywords: ['Ownership', 'Deploy marker', 'Canary release', 'Feature flags', 'Progressive delivery', 'Error tracking', 'SLO burn-rate alert', 'Synthetic monitoring', 'Smoke test', 'Rollback', 'MTTD'],
    },
    listenFor: [
      bi('How involved are they in “owning” their code?', 'Woh apne code ki “ownership” mein kitne shaamil hain?'),
      bi('Do they wait for a bug ticket, or are they alerted via automated alerts?', 'Kya woh bug ticket ka wait karte hain, ya automated alerts se pata chalta hai?'),
    ],
    mistakes: [bi('“QA will catch it” or “users will report it”.', '“QA pakad lega” ya “users bata denge”.'), bi('Deploying and leaving for the day.', 'Deploy karke ghar chale jaana.')],
    followUps: [
      {
        q: bi('What are MTTD and MTTR?', 'MTTD aur MTTR kya hain?'),
        a: bi(
          'Mean time to detect and mean time to recover. Good monitoring lowers MTTD; rollbacks and feature flags lower MTTR.',
          'Mean time to detect aur mean time to recover. Acchi monitoring MTTD ghatati hai; rollbacks aur feature flags MTTR ghataate hain.',
        ),
      },
    ],
    related: { challenges: ['feature-flag-service', 'observability-platform'] },
  },

  // ───────────────────────── Incidents ─────────────────────────
  {
    id: 'error-rate-spikes-after-deploy',
    category: 'devops',
    topic: 'incidents',
    question: bi("You deploy a new version and error rates spike. What's your first action?", 'Aap naya version deploy karte ho aur error rate achanak badh jaata hai. Aapka pehla action kya hoga?'),
    kind: 'scenario',
    level: 'intermediate',
    tags: ['incident', 'rollback', 'deployment', 'mitigation', 'on-call', 'post-mortem'],
    answer: bi(
      'My first action is to stop the damage, not to debug. If the spike lines up with the deploy, I roll back to the last known good version (or turn the feature flag off) immediately, tell the team, and confirm the error rate recovers. Root-cause analysis comes after users are safe.',
      'Mera pehla action nuksaan rokna hai, debug karna nahi. Agar spike deploy se milta hai, to main turant aakhri sahi version pe roll back karta hoon (ya feature flag off), team ko batata hoon, aur confirm karta hoon ki error rate wapas aa gaya. Root-cause analysis users safe hone ke baad.',
    ),
    sections: [
      section(
        'The first ten minutes',
        'Pehle das minute',
        steps(
          ['Confirm (1–2 minutes)', 'Confirm karo (1–2 minute)', 'Does the spike line up with the deploy marker? Which endpoints? Only the new pods?', 'Kya spike deploy marker se milta hai? Kaunse endpoints? Sirf naye pods?'],
          ['Mitigate', 'Mitigate karo', 'Roll back, switch the flag off, or halt the canary.', 'Roll back, flag off, ya canary roko.'],
          ['Communicate', 'Batao', 'Declare an incident, name an incident commander, update the status page if customers are affected.', 'Incident declare karo, incident commander tay karo, customers pe asar ho to status page update karo.'],
          ['Verify', 'Verify karo', 'Error rate and latency back to normal? Any failed jobs or bad data to clean up?', 'Error rate aur latency normal pe? Koi fail jobs ya galat data saaf karna hai?'],
        ),
        code(
          'bash',
          `
$ kubectl rollout undo deployment/expense-api
$ kubectl rollout status deployment/expense-api
deployment "expense-api" successfully rolled out`,
        ),
      ),
      section(
        'Why roll back first',
        'Pehle roll back kyun',
        p(
          'The deploy is the most likely cause, and a rollback is fast and well tested. Debugging in production while users keep failing makes the incident longer. **Restore service first, find the bug second.**',
          'Deploy hi sabse sambhavit kaaran hai, aur roll back fast aur achhe se tested hai. Users fail hote rahein aur hum production mein debug karein, to incident lamba hota hai. **Pehle service wapas laao, bug baad mein dhoondho.**',
        ),
      ),
      section(
        'When a rollback is not simple',
        'Jab roll back aasaan na ho',
        p(
          'If the new version ran a database migration that the old code cannot handle, rolling back the code can break things further. That is why I write migrations as **expand and contract**, so the previous version always works. If a rollback is unsafe, I fix forward carefully — or disable the feature with a flag.',
          'Agar naye version ne aisi database migration chalayi jo purana code sambhaal nahi sakta, to code roll back karne se cheezein aur toot sakti hain. Isliye main migrations **expand and contract** ki tarah likhta hoon, taaki pichhla version hamesha chale. Roll back unsafe ho to dhyaan se fix forward karta hoon — ya flag se feature band karta hoon.',
        ),
      ),
      section(
        'Learn from it',
        'Isse seekho',
        p('A short, blameless post-mortem:', 'Ek chhota, blameless post-mortem:'),
        code(
          'text',
          `
Impact        8% of checkout requests failed for 14 minutes
Detection     error-rate alert, 3 minutes after the deploy
Mitigation    rollback at 10:42, recovered by 10:46
Root cause    new coupon client had no timeout; coupon service was overloaded
Actions       timeout + circuit breaker · canary analysis with auto-rollback · load test for sale traffic`,
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'My first action is to mitigate, not debug. I spend a minute or two confirming that the spike lines up with the deploy marker and which endpoints are affected, then roll back to the last known good version, switch the feature flag off, or halt the canary.',
          'Mera pehla action mitigate karna hai, debug nahi. Ek-do minute mein confirm karta hoon ki spike deploy marker se milta hai aur kaunse endpoints affected hain, phir aakhri sahi version pe roll back karta hoon, feature flag off karta hoon, ya canary rokta hoon.',
        ),
        bi(
          'At the same time I declare an incident and keep stakeholders updated, then verify that errors and latency recover and clean up side effects like failed jobs. Because rollbacks must be safe, I keep migrations backward compatible with expand and contract. Only then do I do root-cause analysis with logs, traces and the diff, followed by a blameless post-mortem with action items such as better tests, automated canary analysis and new alerts.',
          'Saath hi incident declare karta hoon aur stakeholders ko update deta rehta hoon, phir verify karta hoon ki errors aur latency wapas aayi aur fail jobs jaise side effects saaf karta hoon. Kyunki roll back safe hona chahiye, main expand and contract se migrations backward compatible rakhta hoon. Iske baad hi logs, traces aur diff se root-cause analysis karta hoon, phir behtar tests, automated canary analysis aur naye alerts jaise action items ke saath blameless post-mortem.',
        ),
      ],
      keywords: ['Mitigate before root cause', 'Rollback', 'Last known good version', 'Feature flag kill switch', 'Deploy marker', 'Incident commander', 'Blast radius', 'Expand and contract', 'Fix forward', 'Blameless post-mortem', 'MTTR'],
    },
    listenFor: [
      bi('Restoring service first and communicating clearly.', 'Pehle service wapas laana aur saaf communication.'),
      bi('Knowing when a rollback is unsafe, and following up with a post-mortem.', 'Yeh jaanna ki roll back kab unsafe hai, aur post-mortem se follow up.'),
    ],
    mistakes: [bi('Debugging in production while users suffer.', 'Users pareshaan hon tab production mein debug karna.'), bi('Rushing out a hotfix without understanding the problem.', 'Problem samjhe bina jaldi mein hotfix bhejna.')],
    followUps: [
      {
        q: bi('When would you fix forward instead of rolling back?', 'Roll back ki jagah fix forward kab karoge?'),
        a: bi(
          'When rolling back is unsafe (an irreversible migration or data-format change) or the fix is tiny, well understood and faster than a rollback.',
          'Jab roll back unsafe ho (ulti na hone wali migration ya data-format change) ya fix bahut chhota, achhe se samjha hua aur roll back se fast ho.',
        ),
      },
    ],
    related: { challenges: ['feature-flag-service'] },
  },

  {
    id: 'tell-me-about-a-production-incident',
    category: 'devops',
    topic: 'incidents',
    question: bi('Talk to me about a production incident you have been involved in.', 'Kisi production incident ke baare mein batao jisme aap shaamil the.'),
    kind: 'behavioral',
    level: 'intermediate',
    tags: ['incident', 'behavioral', 'post-mortem', 'star', 'ownership', 'on-call'],
    answer: bi(
      'I answer with one real incident in the STAR format — the situation and its impact, my role, what I did to detect, mitigate and fix it, and the result — and I spend real time on what we changed afterwards so it could not happen again. Interviewers care most about ownership, calm handling and prevention.',
      'Main ek asli incident STAR format mein sunata hoon — situation aur uska asar, mera role, detect, mitigate aur fix karne ke liye maine kya kiya, aur result — aur baad mein kya badla taaki dobara na ho, uspe achha time deta hoon. Interviewers ko sabse zyaada ownership, shaant handling aur roktham ki parwaah hoti hai.',
    ),
    sections: [
      section(
        'How I structure it',
        'Main ise kaise structure karta hoon',
        table(
          [bi('Part', 'Hissa'), bi('What to say', 'Kya bolna hai'), 'Time'],
          [
            ['Situation', bi('The system and the impact in numbers', 'System aur numbers mein asar'), '15 s'],
            ['Task', bi('Your role: on-call, incident commander, the author of the change', 'Aapka role: on-call, incident commander, change ka author'), '10 s'],
            ['Action', 'Detect → mitigate → diagnose → communicate', '60 s'],
            ['Result', bi('Recovery time and contained impact', 'Recovery time aur seemit asar'), '15 s'],
            [bi('Learnings', 'Seekh'), bi('Root cause and the actions **you** drove to prevent it', 'Root cause aur roktham ke liye **aapke** chalaye actions'), '45 s'],
          ],
        ),
      ),
      section(
        'What makes it strong',
        'Ise mazboot kya banata hai',
        ul(
          ['**Numbers:** “12% of checkouts failed for 14 minutes”, not “some errors”.', '**Numbers:** “14 minute tak 12% checkouts fail”, “kuch errors” nahi.'],
          ['**“I”, not only “we”** — make your own actions clear.', '**“Main”, sirf “hum” nahi** — apne actions saaf batao.'],
          ['**Mitigation before root cause** — you rolled back first.', '**Root cause se pehle mitigation** — aapne pehle roll back kiya.'],
          ['**Prevention** — the alerts, tests and design changes that followed, and how they paid off.', '**Roktham** — baad mein aaye alerts, tests aur design changes, aur unka faayda kaise hua.'],
          ['**No blame** — talk about systems and process, not people.', '**Dosh nahi** — systems aur process ki baat, logon ki nahi.'],
        ),
      ),
      section(
        'Prepare your own story',
        'Apni kahani taiyaar karo',
        p(
          'Fill in this template once for one or two real incidents, then practise saying it in about two and a half minutes:',
          'Ek-do asli incidents ke liye yeh template ek baar bhar lo, phir ise lagbhag dhaai minute mein bolne ki practice karo:',
        ),
        code(
          'text',
          `
Situation   Which system? When? Impact in numbers (users, minutes, revenue)?
Task        What was my role — on-call, incident commander, author of the change?
Action      How was it detected? What did I do first to stop the damage?
            How did I find the cause (dashboards, traces, logs)? Who did I keep updated?
Result      How long until recovery? How was the impact contained?
Learnings   Root cause? What did I change so it cannot happen again — and did it work later?`,
          'STAR notes',
        ),
        note(
          'tip',
          'No production experience yet? Use an incident from a project, an internship or an open-source issue — or say honestly how you would handle one, step by step. Honesty beats an invented story.',
          'Abhi production experience nahi? Kisi project, internship ya open-source issue ka incident use karo — ya imaandaari se batao ki aap step by step kaise sambhaalte. Banaayi kahani se imaandaari behtar hai.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'During a festive sale, our checkout error rate jumped to 12% shortly after a release. I was on call, and our error-rate alert paged me within three minutes. The deploy marker lined up with the spike, so I rolled back first, which brought errors down within eight minutes, and I posted updates in the incident channel every few minutes.',
          'Ek festive sale ke dauraan release ke kuch der baad hamara checkout error rate 12% ho gaya. Main on-call tha, aur error-rate alert ne teen minute mein mujhe page kiya. Deploy marker spike se mil raha tha, isliye maine pehle roll back kiya, jisse aath minute mein errors kam ho gaye, aur main har kuch minute incident channel mein updates deta raha.',
        ),
        bi(
          'The traces then showed the new version called the coupon service without a timeout; that service was overloaded by sale traffic, so checkout requests piled up. In the post-mortem I drove three changes: timeouts and a circuit breaker with a fallback that skips coupons, a load test that simulates sale traffic, and automated canary analysis that rolls back when errors rise. A month later the coupon service slowed down again, and checkout degraded gracefully instead of failing.',
          'Phir traces se pata chala ki naya version coupon service ko bina timeout ke call kar raha tha; sale ke traffic se woh service overload thi, to checkout requests jamaa ho gayi. Post-mortem mein maine teen changes chalaye: timeouts aur ek circuit breaker jiska fallback coupons skip kar deta hai, sale traffic simulate karne wala load test, aur automated canary analysis jo errors badhne pe roll back kare. Ek mahine baad coupon service phir slow hui, aur checkout fail hone ki jagah aaram se degrade hua.',
        ),
      ],
      keywords: ['STAR method', 'Impact', 'On-call', 'Detection (MTTD)', 'Mitigation (MTTR)', 'Rollback', 'Root cause analysis', 'Blameless post-mortem', 'Action items', 'Circuit breaker', 'Prevention'],
    },
    listenFor: [
      bi('Detail about how they responded to the incident and what their own involvement was.', 'Incident pe unhone kaise response diya aur unka apna kya hissa tha, iski detail.'),
      bi('Post-incident actions, not just the initial fix — did they take steps to prevent it happening again?', 'Sirf shuruaati fix nahi, incident ke baad ke actions — kya unhone dobara na ho iske kadam uthaye?'),
    ],
    mistakes: [bi('A vague story with no numbers.', 'Bina numbers ki dhundhli kahani.'), bi('Ending at the fix, with no prevention.', 'Fix pe kahani khatam, roktham ka zikr nahi.')],
    followUps: [
      {
        q: bi('What would you do differently?', 'Aap kya alag karte?'),
        a: bi(
          'Have a thoughtful answer ready — for example adding the load test before the sale rather than after, or setting timeouts on every outbound call by default.',
          'Ek soch-samajh ke jawab taiyaar rakho — jaise sale ke baad nahi, pehle load test karna, ya har outbound call pe default se timeouts lagana.',
        ),
      },
    ],
  },
];
