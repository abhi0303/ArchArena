import { bi } from '@/features/learn/dsl';
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
    scenario: bi(
      'In Kubernetes a pod runs your container. If the container exits or fails its liveness probe, the kubelet restarts it. When that keeps happening, kubectl get pods shows a rising RESTARTS count and the status CrashLoopBackOff — Kubernetes waits longer and longer between restarts (10 s, 20 s, 40 s… up to 5 minutes). The question tests your debugging order: where do you look first, and what are the usual causes?',
      'Kubernetes mein pod aapka container chalata hai. Agar container exit ho jaaye ya liveness probe fail kare, to kubelet use restart karta hai. Jab yeh baar-baar ho, to kubectl get pods mein RESTARTS count badhta dikhta hai aur status CrashLoopBackOff — Kubernetes har restart ke beech zyaada wait karta hai (10 s, 20 s, 40 s… 5 minute tak). Sawaal aapke debugging order ko parakhta hai: pehle kahan dekhoge, aur aam kaaran kya hote hain?',
    ),
    simple: bi(
      'First find out why the container stopped: read the pod’s events and the last exit reason (kubectl describe), then read the logs of the crashed container (kubectl logs --previous). It is almost always one of three things: the app crashes on start (bad config, missing secret, cannot reach the database), it runs out of memory (OOMKilled), or a liveness probe is too strict and Kubernetes kills an app that is healthy but slow.',
      'Pehle pata karo container ruka kyun: pod ke events aur aakhri exit reason padho (kubectl describe), phir crash hue container ke logs padho (kubectl logs --previous). Lagbhag hamesha teen mein se ek hota hai: app start hote hi crash (galat config, missing secret, database tak nahi pahunch pa raha), memory khatam (OOMKilled), ya liveness probe bahut sakht hai aur Kubernetes ek healthy par slow app ko maar deta hai.',
    ),
    example: bi(
      'A shop assistant keeps fainting at work. Before replacing them you check: did they skip breakfast (missing config at startup)? Is the uniform too tight (memory limit too small)? Or is the supervisor too impatient, marking them “unresponsive” while they are just busy with a customer (a liveness probe that is too aggressive)?',
      'Dukaan ka ek assistant baar-baar behosh ho jaata hai. Badalne se pehle check karte ho: kya usne naashta nahi kiya (startup pe missing config)? Kya uniform bahut tight hai (memory limit bahut chhoti)? Ya supervisor bahut be-sabr hai, aur jab woh customer mein busy hai tab use “jawab nahi de raha” maan leta hai (bahut aggressive liveness probe)?',
    ),
    partsTitle: bi('Debugging order', 'Debugging ka order'),
    parts: [
      {
        title: bi('1. Look at the status', '1. Status dekho'),
        text: bi(
          'kubectl get pod <name> -o wide: the status (CrashLoopBackOff, Error, OOMKilled, ImagePullBackOff), the restart count and which node it runs on.',
          'kubectl get pod <name> -o wide: status (CrashLoopBackOff, Error, OOMKilled, ImagePullBackOff), restart count aur kis node pe chal raha hai.',
        ),
      },
      {
        title: bi('2. Describe the pod', '2. Pod ko describe karo'),
        text: bi(
          'kubectl describe pod <name>: “Last State: Terminated” with the Reason (Error, OOMKilled, Completed) and Exit Code; and the Events at the bottom — “Liveness probe failed”, image pull errors, volume or secret mount failures, scheduling problems.',
          'kubectl describe pod <name>: “Last State: Terminated” ke saath Reason (Error, OOMKilled, Completed) aur Exit Code; aur neeche Events — “Liveness probe failed”, image pull errors, volume ya secret mount failures, scheduling problems.',
        ),
      },
      {
        title: bi('3. Read the logs of the crashed container', '3. Crash hue container ke logs padho'),
        text: bi(
          'kubectl logs <pod> --previous (add -c <container> for multi-container pods). The current container has just restarted, so its logs are almost empty — the stack trace is in the previous one: “cannot connect to database”, “missing environment variable”.',
          'kubectl logs <pod> --previous (multi-container pods ke liye -c <container> jodo). Abhi wala container abhi restart hua hai, to uske logs lagbhag khaali hain — stack trace pichhle wale mein hai: “database se connect nahi ho paya”, “environment variable missing”.',
        ),
      },
      {
        title: bi('4. Read the exit code', '4. Exit code samjho'),
        text: bi(
          '1 = the application failed; 137 = killed with SIGKILL (usually OOMKilled, or killed after failed liveness probes); 143 = SIGTERM (a graceful stop); 139 = segmentation fault; 0 with restartPolicy Always = the process finished normally but was meant to keep running (wrong command, or it should be a Job).',
          '1 = application fail hui; 137 = SIGKILL se maara gaya (aksar OOMKilled, ya liveness probe fail hone ke baad); 143 = SIGTERM (aaram se band); 139 = segmentation fault; restartPolicy Always ke saath 0 = process normally khatam hua par use chalte rehna tha (galat command, ya ise Job hona chahiye).',
        ),
      },
      {
        title: bi('5. Match the cause to the fix', '5. Kaaran ke hisaab se fix'),
        text: bi(
          'Config or dependency errors → fix the ConfigMap/Secret or connection string, and make startup retry dependencies. OOMKilled → compare real usage with the memory limit, raise it or fix the leak, and align runtime heap settings (JVM, Node) with the limit. Liveness failures → add a startupProbe for slow starts, relax timeouts and thresholds, and make liveness check only the process itself. Also check: a wrong entrypoint, file permissions, CPU throttling that makes probes time out, and node pressure evictions.',
          'Config ya dependency errors → ConfigMap/Secret ya connection string theek karo, aur startup pe dependencies ko retry karwao. OOMKilled → asli use ko memory limit se milao, limit badhao ya leak theek karo, aur runtime heap settings (JVM, Node) ko limit ke hisaab se rakho. Liveness failures → slow start ke liye startupProbe jodo, timeouts aur thresholds dheele karo, aur liveness sirf process khud ko check kare. Yeh bhi dekho: galat entrypoint, file permissions, CPU throttling jisse probes time out hote hain, aur node pressure se evictions.',
        ),
      },
      {
        title: bi('6. Check what changed — and roll back if users are hurt', '6. Kya badla yeh dekho — aur users pe asar ho to roll back'),
        text: bi(
          'kubectl rollout history shows recent changes: a new image tag, new configuration, new resource limits. If production is affected, kubectl rollout undo first, investigate after.',
          'kubectl rollout history haal ke changes dikhata hai: naya image tag, nayi configuration, nayi resource limits. Production pe asar ho to pehle kubectl rollout undo, jaanch baad mein.',
        ),
      },
      {
        title: bi('7. Prevent it next time', '7. Agli baar ke liye roko'),
        text: bi(
          'Startup probes, resource requests and limits based on real usage, alerts on restart counts and OOMKills, separate readiness and liveness endpoints, and logs shipped to a central system (they disappear with the pod).',
          'Startup probes, asli use pe aadharit resource requests aur limits, restart count aur OOMKills pe alerts, alag readiness aur liveness endpoints, aur logs ko central system mein bhejna (pod ke saath gayab ho jaate hain).',
        ),
      },
    ],
    table: {
      columns: ['What you see', 'Likely cause', 'First fix to try'],
      rows: [
        ['CrashLoopBackOff, exit code 1', bi('App error at startup (config, secret, dependency)', 'Startup pe app error (config, secret, dependency)'), bi('Read logs --previous and fix the config', 'logs --previous padho aur config theek karo')],
        ['OOMKilled, exit code 137', bi('Memory limit too low or a memory leak', 'Memory limit bahut kam ya memory leak'), bi('Compare usage with the limit; raise it or fix the leak', 'Use ko limit se milao; badhao ya leak theek karo')],
        [bi('“Liveness probe failed” in events', 'Events mein “Liveness probe failed”'), bi('Probe too strict, or slow startup', 'Probe bahut sakht, ya slow startup'), bi('Add a startupProbe, relax thresholds', 'startupProbe jodo, thresholds dheele karo')],
        ['ImagePullBackOff', bi('Wrong image name/tag or registry credentials', 'Galat image name/tag ya registry credentials'), bi('Fix the image reference or imagePullSecret', 'Image reference ya imagePullSecret theek karo')],
        [bi('Exit code 0, still restarting', 'Exit code 0, phir bhi restart'), bi('The process ends by design (wrong command)', 'Process design se khatam hota hai (galat command)'), bi('Run a long-lived process, or use a Job', 'Lamba chalne wala process chalao, ya Job use karo')],
        ['Evicted', bi('The node ran out of memory or disk', 'Node ki memory ya disk khatam'), bi('Set requests properly; check node pressure', 'Requests sahi set karo; node pressure dekho')],
      ],
    },
    interview: {
      opening: bi(
        'I would first find out why the container is terminating — kubectl describe pod for the last state, exit code and events, then kubectl logs --previous for the crashed container’s output — because the cause is usually a startup error, an OOMKill or a failing liveness probe.',
        'Main pehle pata karunga ki container band kyun ho raha hai — last state, exit code aur events ke liye kubectl describe pod, phir crash hue container ka output dekhne ke liye kubectl logs --previous — kyunki kaaran aam taur pe startup error, OOMKill ya fail hota liveness probe hota hai.',
      ),
      points: [
        bi('kubectl get pods: status (CrashLoopBackOff, OOMKilled, ImagePullBackOff) and restart count.', 'kubectl get pods: status (CrashLoopBackOff, OOMKilled, ImagePullBackOff) aur restart count.'),
        bi('kubectl describe pod: last state reason, exit code, and events (probe failures, image pulls, mounts).', 'kubectl describe pod: last state ka reason, exit code, aur events (probe failures, image pulls, mounts).'),
        bi('kubectl logs --previous: logs of the crashed container instance.', 'kubectl logs --previous: crash hue container instance ke logs.'),
        bi('Exit 137 → SIGKILL (OOMKilled or liveness kill); 1 → application error; 0 → the process exited, wrong command.', 'Exit 137 → SIGKILL (OOMKilled ya liveness kill); 1 → application error; 0 → process khatam, galat command.'),
        bi('Common causes: missing ConfigMap/Secret, unreachable dependency, low memory limit, aggressive liveness probe, wrong entrypoint.', 'Aam kaaran: missing ConfigMap/Secret, na pahunchne wali dependency, kam memory limit, aggressive liveness probe, galat entrypoint.'),
        bi('Correlate with recent changes via rollout history; roll back if users are affected.', 'Rollout history se haal ke changes milao; users pe asar ho to roll back.'),
        bi('Prevent with startup probes, right-sized requests and limits, alerts on restarts and OOMKills, central logging.', 'Startup probes, sahi size ki requests aur limits, restarts aur OOMKills pe alerts, central logging se roko.'),
      ],
      keywords: [
        'CrashLoopBackOff',
        'kubectl describe',
        'kubectl logs --previous',
        'Exit code 137',
        'OOMKilled',
        'Liveness probe',
        'Startup probe',
        'Resource requests and limits',
        'ConfigMap / Secret',
        'ImagePullBackOff',
        'kubectl rollout undo',
        'Eviction',
      ],
    },
    listenFor: [
      bi('A systematic order: describe → logs --previous → events.', 'Ek systematic order: describe → logs --previous → events.'),
      bi('Knowing exit codes and OOMKilled.', 'Exit codes aur OOMKilled ki jaankari.'),
      bi('Spotting probe misconfiguration, and checking what changed recently.', 'Probe ki galat configuration pehchaanna, aur haal mein kya badla yeh dekhna.'),
    ],
    mistakes: [
      bi('Deleting the pod and hoping it goes away.', 'Pod delete karke ummeed karna ki problem chali jaayegi.'),
      bi('Reading only the current logs, which are empty after a restart.', 'Sirf abhi ke logs padhna, jo restart ke baad khaali hote hain.'),
      bi('Raising resources blindly.', 'Aankh band karke resources badhana.'),
      bi('A liveness probe that checks the database — a database outage then restarts every pod.', 'Liveness probe jo database check kare — phir database outage pe har pod restart.'),
    ],
    followUps: [
      {
        q: bi('Is CrashLoopBackOff an error?', 'Kya CrashLoopBackOff ek error hai?'),
        a: bi(
          'Not by itself — it means Kubernetes is restarting a container that keeps failing, waiting longer each time (up to five minutes). The real error is in the exit reason and the previous logs.',
          'Apne aap mein nahi — iska matlab hai Kubernetes ek baar-baar fail hote container ko restart kar raha hai, har baar zyaada wait karke (paanch minute tak). Asli error exit reason aur pichhle logs mein hai.',
        ),
      },
      {
        q: bi('Why should a liveness probe not check the database?', 'Liveness probe database kyun check na kare?'),
        a: bi(
          'If the database goes down, every pod fails liveness and restarts at once. Restarting does not fix the database and makes recovery slower. Put dependency checks in readiness instead.',
          'Database down hua to har pod liveness fail karke ek saath restart hoga. Restart se database theek nahi hota aur recovery aur slow ho jaati hai. Dependency checks readiness mein daalo.',
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
    simple: bi(
      'Both are health checks Kubernetes runs against your container, but they answer different questions and trigger different actions. Liveness asks: “Is this process stuck or broken beyond repair?” — if it fails, Kubernetes restarts the container. Readiness asks: “Can this container handle traffic right now?” — if it fails, Kubernetes stops sending it traffic (removes it from the Service) but does not restart it.',
      'Dono health checks hain jo Kubernetes aapke container pe chalata hai, par alag sawaal poochte hain aur alag action lete hain. Liveness poochta hai: “Kya yeh process atak gaya ya theek hone layak nahi?” — fail hua to Kubernetes container restart karta hai. Readiness poochta hai: “Kya yeh container abhi traffic sambhaal sakta hai?” — fail hua to Kubernetes use traffic bhejna band kar deta hai (Service se hata deta hai) par restart nahi karta.',
    ),
    example: bi(
      'A restaurant waiter. Readiness: “Are you free to take a new table?” — if they are busy or on a short break, the manager just does not seat new guests with them for a while. Liveness: “Are you conscious?” — if the waiter has fainted, waiting will not help; you call for help and bring someone else (restart).',
      'Restaurant ka waiter. Readiness: “Kya tum naya table le sakte ho?” — busy ya chhote break pe ho to manager kuch der unhe naye guests nahi deta. Liveness: “Kya tum hosh mein ho?” — waiter behosh ho gaya to wait karne se kuch nahi hoga; madad bulao aur kisi aur ko laao (restart).',
    ),
    why: bi(
      'Readiness lets pods warm up (load caches, open connections) and step out during overload or shutdown without users seeing errors. Liveness recovers automatically from deadlocks and hung processes.',
      'Readiness pods ko garam hone deta hai (caches load, connections kholna) aur overload ya shutdown ke waqt bina users ko errors dikhaye side mein hatne deta hai. Liveness deadlocks aur atke processes se apne aap ubaarta hai.',
    ),
    without: bi(
      'No readiness probe: traffic hits pods that are still starting, so every deploy or scale-up causes errors. No liveness probe: a deadlocked process stays “Running” forever while failing silently. A badly designed liveness probe: restart storms.',
      'Readiness probe nahi: traffic abhi start ho rahe pods pe jaata hai, to har deploy ya scale-up pe errors. Liveness probe nahi: deadlock hua process hamesha “Running” dikhta hai aur chupchaap fail karta rehta hai. Galat bana liveness probe: restart storms.',
    ),
    table: {
      columns: ['', 'Readiness probe', 'Liveness probe', 'Startup probe'],
      rows: [
        [bi('Question', 'Sawaal'), bi('Can it serve traffic now?', 'Kya abhi traffic serve kar sakta hai?'), bi('Is it alive, not stuck?', 'Kya zinda hai, atka nahi?'), bi('Has it finished starting?', 'Kya start ho chuka?')],
        [bi('On failure', 'Fail hone pe'), bi('Removed from Service endpoints; no restart', 'Service endpoints se hataya; restart nahi'), bi('Container is killed and restarted', 'Container maara aur restart kiya jaata hai'), bi('Restarted after the threshold; other probes wait for it', 'Threshold ke baad restart; baaki probes iska wait karte hain')],
        [bi('Runs', 'Kab chalta hai'), bi('Whole lifetime', 'Poori zindagi'), bi('Whole lifetime', 'Poori zindagi'), bi('Only during startup', 'Sirf startup ke dauraan')],
        ['Typical check', bi('Ready to serve: config loaded, warmed up, not overloaded', 'Serve karne ko taiyaar: config load, garam, overload nahi'), bi('Cheap local check that the process responds', 'Sasta local check ki process jawab de raha hai'), bi('Same as liveness, with a long time budget', 'Liveness jaisa, lambe time budget ke saath')],
        [bi('If configured badly', 'Galat configure ho to'), bi('Pods never get traffic, or all drop out together', 'Pods ko kabhi traffic nahi, ya sab ek saath bahar'), bi('Restart loops and cascading restarts', 'Restart loops aur cascading restarts'), bi('Without it, slow apps get killed early', 'Iske bina slow apps jaldi maare jaate hain')],
      ],
    },
    partsTitle: bi('Using them well', 'Inhe sahi use karna'),
    parts: [
      {
        title: bi('Probe types and settings', 'Probe types aur settings'),
        text: bi(
          'An HTTP GET (any 2xx–3xx is success), a TCP socket, an exec command, or gRPC. Tune initialDelaySeconds, periodSeconds, timeoutSeconds, failureThreshold and successThreshold to real start-up and response times.',
          'HTTP GET (2xx–3xx success), TCP socket, exec command, ya gRPC. initialDelaySeconds, periodSeconds, timeoutSeconds, failureThreshold aur successThreshold ko asli startup aur response times ke hisaab se set karo.',
        ),
      },
      {
        title: bi('Keep liveness cheap and local', 'Liveness ko sasta aur local rakho'),
        text: bi(
          'Liveness should only check that the process can respond (for example /livez) — not the database or other services. Otherwise a database outage makes every pod restart, which fixes nothing.',
          'Liveness sirf yeh check kare ki process jawab de sakta hai (jaise /livez) — database ya doosri services nahi. Warna database outage pe har pod restart hoga, jisse kuch theek nahi hota.',
        ),
      },
      {
        title: bi('Readiness can consider dependencies — carefully', 'Readiness dependencies dekh sakta hai — dhyaan se'),
        text: bi(
          'It is fine for readiness to wait until config is loaded and caches are warm. But if every pod depends on the same database and they all turn “not ready” together, the Service has no endpoints at all; sometimes it is better to stay ready and return a clear error or a degraded response.',
          'Readiness ka config load aur caches garam hone tak wait karna theek hai. Par agar har pod same database pe depend kare aur sab ek saath “not ready” ho jaayein, to Service ke paas ek bhi endpoint nahi bachta; kabhi-kabhi ready rehna aur saaf error ya degraded response dena behtar hai.',
        ),
      },
      {
        title: bi('Slow starters need a startup probe', 'Slow start walon ko startup probe chahiye'),
        text: bi(
          'For JVM apps or apps that load large caches, use a startupProbe with a generous budget instead of a huge initialDelaySeconds on liveness.',
          'JVM apps ya bade caches load karne wale apps ke liye, liveness pe bahut bada initialDelaySeconds lagane ki jagah lambe budget wala startupProbe use karo.',
        ),
      },
      {
        title: bi('Readiness makes deploys smooth', 'Readiness se deploys smooth hote hain'),
        text: bi(
          'During a rolling update, new pods receive traffic only once they are ready. On shutdown (SIGTERM), the app should start failing readiness, finish in-flight requests, then exit (preStop hook, terminationGracePeriodSeconds) — that gives zero-downtime deploys.',
          'Rolling update ke dauraan naye pods ko traffic tabhi milta hai jab woh ready hon. Shutdown (SIGTERM) pe app ko readiness fail karna shuru karna chahiye, chal rahi requests poori karni chahiye, phir exit (preStop hook, terminationGracePeriodSeconds) — isse zero-downtime deploys milte hain.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'A readiness probe decides whether a pod should receive traffic — failing it removes the pod from the Service endpoints without restarting it — while a liveness probe decides whether the container is healthy enough to keep running — failing it makes the kubelet restart the container.',
        'Readiness probe decide karta hai ki pod ko traffic milna chahiye ya nahi — fail hone pe pod bina restart ke Service endpoints se hat jaata hai — jabki liveness probe decide karta hai ki container chalte rehne layak healthy hai ya nahi — fail hone pe kubelet container restart karta hai.',
      ),
      points: [
        bi('Readiness: “can I serve now?” → controls membership in Service / load-balancer endpoints; used during startup, overload and shutdown.', 'Readiness: “kya abhi serve kar sakta hoon?” → Service / load-balancer endpoints mein shaamil hona tay karta hai; startup, overload aur shutdown mein kaam aata hai.'),
        bi('Liveness: “am I stuck?” → restarts the container to recover from deadlocks or hung processes.', 'Liveness: “kya main atka hoon?” → deadlocks ya atke processes se ubaarne ke liye container restart karta hai.'),
        bi('Startup probe protects slow-starting containers; liveness and readiness begin only after it succeeds.', 'Startup probe slow start hone wale containers ko bachata hai; liveness aur readiness iske succeed hone ke baad hi shuru hote hain.'),
        bi('Liveness checks must be lightweight and must not depend on external services, to avoid cascading restarts.', 'Liveness checks halke hone chahiye aur external services pe depend nahi karne chahiye, taaki cascading restarts na hon.'),
        bi('Readiness enables zero-downtime rolling updates and graceful shutdown.', 'Readiness zero-downtime rolling updates aur graceful shutdown deta hai.'),
        bi('Tune delays, periods, timeouts and failure thresholds to real behaviour.', 'Delays, periods, timeouts aur failure thresholds asli behaviour ke hisaab se set karo.'),
      ],
      keywords: [
        'Readiness probe',
        'Liveness probe',
        'Startup probe',
        'Service endpoints',
        'kubelet',
        'failureThreshold',
        'initialDelaySeconds',
        'httpGet / tcpSocket / exec / grpc',
        'Rolling update',
        'Graceful shutdown',
        'Cascading restarts',
      ],
    },
    listenFor: [
      bi('The correct action on failure for each probe.', 'Har probe ke fail hone pe sahi action.'),
      bi('Awareness of the startup probe.', 'Startup probe ki jaankari.'),
      bi('Not checking dependencies in liveness, and the link to rolling deployments.', 'Liveness mein dependencies check na karna, aur rolling deployments se rishta.'),
    ],
    mistakes: [
      bi('Using the same endpoint, which checks the database, for both probes.', 'Dono probes ke liye same endpoint jo database check karta ho.'),
      bi('No readiness probe, so errors appear during every deploy.', 'Readiness probe nahi, to har deploy mein errors.'),
      bi('An aggressive liveness probe that causes restart loops.', 'Aggressive liveness probe jo restart loops laaye.'),
    ],
    followUps: [
      {
        q: bi('Can a pod be live but not ready?', 'Kya pod live ho par ready nahi?'),
        a: bi(
          'Yes — for example while warming its cache or when temporarily overloaded: it is running, but it is not receiving traffic.',
          'Haan — jaise cache garam karte waqt ya thodi der overload hone pe: chal raha hai, par traffic nahi le raha.',
        ),
      },
      {
        q: bi('What happens if readiness fails on every pod?', 'Agar har pod pe readiness fail ho jaaye to?'),
        a: bi(
          'The Service has no endpoints, so every request fails. That is why readiness should not depend blindly on a dependency that all pods share.',
          'Service ke paas koi endpoint nahi bachta, to har request fail. Isliye readiness ko us dependency pe aankh band karke depend nahi karna chahiye jo saare pods share karte hain.',
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
    question: bi(
      "You've just completed a task on your machine. How does that work go about getting into production?",
      'Aapne apni machine pe ek task poora kiya. Woh kaam production tak kaise pahunchta hai?',
    ),
    kind: 'behavioral',
    level: 'beginner',
    tags: ['ci/cd', 'pull request', 'code review', 'pipeline', 'deployment', 'feature flags', 'canary'],
    scenario: bi(
      'This is a process question. The interviewer wants you to walk through the full path your change takes from your laptop to real users, and to show that you understand — and care about — every step: version control, review, the automated checks (and how they were set up), how deployments are made safe, and what you do after the release. Describe your team’s flow, or a typical good one.',
      'Yeh process ka sawaal hai. Interviewer chahta hai ki aap batao aapka change laptop se asli users tak kaunsa poora raasta leta hai, aur dikhao ki aap har step samajhte ho — aur parwaah karte ho: version control, review, automated checks (aur woh kaise set hue), deployments ko safe kaise banate hain, aur release ke baad kya karte ho. Apni team ka flow batao, ya ek typical accha flow.',
    ),
    simple: bi(
      'Commit the change on a branch, open a pull request, let automated checks run (tests, lint, security scans, build), get it reviewed, merge to the main branch, and let the pipeline build one artifact and deploy it through environments — staging, then production — usually gradually, with monitoring and a quick rollback ready. Your job is not done at merge: you watch it in production.',
      'Branch pe change commit karo, pull request kholo, automated checks chalne do (tests, lint, security scans, build), review karwao, main branch mein merge karo, aur pipeline ko ek artifact banane do aur use environments se deploy karne do — pehle staging, phir production — aam taur pe dheere-dheere, monitoring aur jaldi rollback ki tayyari ke saath. Merge pe kaam khatam nahi hota: production mein use dekhte raho.',
    ),
    example: bi(
      'Publishing a newspaper article: the reporter writes a draft (a branch), an editor reviews it (code review), spell-check and fact-check run automatically (CI), a print proof is checked (staging), it is printed for one city first (a canary) before going national, and the next morning the reporter reads readers’ reactions (monitoring) — ready to publish a correction (rollback).',
      'Akhbaar ka article chhapna: reporter draft likhta hai (branch), editor review karta hai (code review), spell-check aur fact-check apne aap chalte hain (CI), print proof check hota hai (staging), poore desh se pehle ek shehar ke liye chhapta hai (canary), aur agli subah reporter readers ki pratikriya padhta hai (monitoring) — sudhaar chhaapne ko taiyaar (rollback).',
    ),
    why: bi(
      'Automation makes releases frequent, small and safe; people cannot reliably remember every check; and small changes are easier to debug and roll back.',
      'Automation releases ko baar-baar, chhote aur safe banata hai; insaan har check yaad nahi rakh sakte; aur chhote changes debug aur roll back karna aasaan hai.',
    ),
    without: bi(
      '“Works on my machine” bugs, manual deploys done differently each time, big risky Friday-night releases, no record of who changed what, and slow rollbacks.',
      '“Meri machine pe to chalta hai” wale bugs, har baar alag tareeke se manual deploys, bade risky Friday-night releases, kisne kya badla iska koi record nahi, aur slow rollbacks.',
    ),
    partsTitle: bi('The path, step by step', 'Raasta, step by step'),
    parts: [
      {
        title: bi('1. Before pushing', '1. Push karne se pehle'),
        text: bi(
          'A small, focused change; tests written or updated; lint and tests run locally; your own review of the diff; documentation updated.',
          'Chhota, focused change; tests likhe ya update kiye; local mein lint aur tests chalaye; diff ka khud review; documentation update.',
        ),
      },
      {
        title: bi('2. Branch and pull request', '2. Branch aur pull request'),
        text: bi(
          'Push the branch and open a PR with a clear description, the linked ticket, screenshots and how to test it. Keep PRs small so they get reviewed properly.',
          'Branch push karo aur saaf description, linked ticket, screenshots aur test karne ke tareeke ke saath PR kholo. PRs chhote rakho taaki dhang se review hon.',
        ),
      },
      {
        title: bi('3. Continuous Integration on every push', '3. Har push pe Continuous Integration'),
        text: bi(
          'Install, build, lint and format checks, type-check, unit and integration tests with coverage, dependency and secret scanning, static analysis, and building the container image — sometimes a preview environment too. Branch protection requires all of it to pass, plus approvals, before merging.',
          'Install, build, lint aur format checks, type-check, coverage ke saath unit aur integration tests, dependency aur secret scanning, static analysis, aur container image build — kabhi preview environment bhi. Branch protection merge se pehle yeh sab pass hona aur approvals zaroori karti hai.',
        ),
      },
      {
        title: '4. Code review',
        text: bi(
          'Peers check correctness, design, readability, tests and security; you address the comments.',
          'Saathi correctness, design, readability, tests aur security check karte hain; aap comments pe kaam karte ho.',
        ),
      },
      {
        title: '5. Merge → Continuous Delivery',
        text: bi(
          'The pipeline builds an immutable, versioned artifact once (for example a Docker image), deploys it automatically to staging, runs smoke and end-to-end tests, and applies backward-compatible database migrations.',
          'Pipeline ek baar immutable, versioned artifact banati hai (jaise Docker image), use apne aap staging pe deploy karti hai, smoke aur end-to-end tests chalati hai, aur backward-compatible database migrations lagati hai.',
        ),
      },
      {
        title: '6. Production release',
        text: bi(
          'Automatic or approval-gated, using a safe strategy: rolling, blue-green or canary (1% → 10% → 100%). Feature flags separate deploying code from releasing a feature to users.',
          'Apne aap ya approval ke baad, ek safe strategy se: rolling, blue-green ya canary (1% → 10% → 100%). Feature flags code deploy karne ko users ke liye feature release karne se alag karte hain.',
        ),
      },
      {
        title: bi('7. After the deploy', '7. Deploy ke baad'),
        text: bi(
          'Watch dashboards, error rates, latency and logs for the release; verify the feature in production; be ready to roll back (redeploy the previous artifact or switch the flag off); update the ticket and changelog.',
          'Release ke liye dashboards, error rates, latency aur logs dekho; production mein feature verify karo; roll back ko taiyaar raho (pichhla artifact dobara deploy ya flag off); ticket aur changelog update karo.',
        ),
      },
      {
        title: bi('8. Everything as code', '8. Sab kuch code ki tarah'),
        text: bi(
          'Pipeline configuration, infrastructure (Terraform), environment config and secrets managed in a vault — all reproducible and audited.',
          'Pipeline configuration, infrastructure (Terraform), environment config aur vault mein managed secrets — sab reproducible aur audited.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I push a small branch and open a pull request; CI automatically builds, lints and runs tests and security scans; after peer review and green checks it is merged to main, where CD builds an immutable artifact and promotes it through staging to production with a progressive rollout — and I monitor it after release, ready to roll back.',
        'Main chhoti branch push karke pull request kholta hoon; CI apne aap build, lint, tests aur security scans chalata hai; peer review aur green checks ke baad main mein merge hota hai, jahan CD ek immutable artifact banata hai aur use staging se production tak progressive rollout ke saath le jaata hai — aur release ke baad main use monitor karta hoon, roll back ko taiyaar.',
      ),
      points: [
        bi('Trunk-based development or short-lived feature branches; small, reviewable PRs.', 'Trunk-based development ya kam samay ki feature branches; chhote, review karne layak PRs.'),
        bi('CI on every push: build, lint, type-check, unit and integration tests, coverage, dependency and secret scanning, image build.', 'Har push pe CI: build, lint, type-check, unit aur integration tests, coverage, dependency aur secret scanning, image build.'),
        bi('Branch protection: required checks and review approval before merge.', 'Branch protection: merge se pehle zaroori checks aur review approval.'),
        bi('CD: build once, deploy the same artifact everywhere; automatic staging deploy with smoke and end-to-end tests.', 'CD: ek baar build, wahi artifact har jagah deploy; smoke aur end-to-end tests ke saath apne aap staging deploy.'),
        bi('Safe production rollout: canary, blue-green or rolling; backward-compatible migrations; feature flags.', 'Safe production rollout: canary, blue-green ya rolling; backward-compatible migrations; feature flags.'),
        bi('Post-release ownership: dashboards and alerts, verifying behaviour, fast rollback.', 'Release ke baad ownership: dashboards aur alerts, behaviour verify karna, jaldi rollback.'),
        bi('Pipelines and infrastructure as code; secrets in a vault.', 'Pipelines aur infrastructure as code; secrets vault mein.'),
      ],
      keywords: [
        'Pull request',
        'Code review',
        'Continuous Integration',
        'Continuous Delivery / Deployment',
        'Branch protection',
        'Build once, deploy many',
        'Immutable artifact',
        'Staging environment',
        'Canary / blue-green / rolling',
        'Feature flags',
        'Rollback',
        'Infrastructure as Code',
        'Shift left',
      ],
    },
    listenFor: [
      bi('Do they understand the full flow of getting their work to production?', 'Kya woh apne kaam ko production tak le jaane ka poora flow samajhte hain?'),
      bi('Do they talk about which automated checks run, and how that was set up?', 'Kya woh batate hain kaunse automated checks chalte hain, aur woh kaise set hue?'),
      bi('Do they merge the PR and forget about it until there is a bug weeks later — or do they own it after release?', 'Kya woh PR merge karke bhool jaate hain jab tak hafton baad bug na aaye — ya release ke baad bhi zimmedari lete hain?'),
    ],
    mistakes: [
      bi('“I push to main and someone else deploys it.”', '“Main main pe push karta hoon aur koi aur deploy karta hai.”'),
      bi('No mention of tests, review or automated checks.', 'Tests, review ya automated checks ka koi zikr nahi.'),
      bi('No monitoring or rollback plan.', 'Koi monitoring ya rollback plan nahi.'),
    ],
    followUps: [
      {
        q: bi('Continuous delivery vs continuous deployment?', 'Continuous delivery aur continuous deployment mein kya fark hai?'),
        a: bi(
          'Continuous delivery: every change is always releasable, but production deploys need a manual approval. Continuous deployment: every change that passes the pipeline goes to production automatically.',
          'Continuous delivery: har change hamesha release karne layak hai, par production deploy ke liye manual approval chahiye. Continuous deployment: pipeline pass karne wala har change apne aap production mein jaata hai.',
        ),
      },
      {
        q: bi('How do you deploy a database schema change safely?', 'Database schema change safely kaise deploy karte ho?'),
        a: bi(
          'Expand and contract: add new columns or tables first (backward compatible), deploy code that writes to both, backfill, switch reads, and only remove the old columns in a later release.',
          'Expand and contract: pehle naye columns ya tables jodo (backward compatible), dono mein likhne wala code deploy karo, backfill karo, reads switch karo, aur purane columns sirf agle release mein hatao.',
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
    simple: bi(
      'They are the three main ways a system tells you what it is doing. Metrics are numbers over time (“500 requests per second, 2% errors”) — great for noticing that something is wrong. Logs are detailed records of individual events (“order 42 failed: card declined”) — great for understanding why. Traces follow one request through all the services it touches, with the time spent at each step — great for finding where the time or the error is.',
      'Yeh teen mukhya tareeke hain jinse system batata hai ki woh kya kar raha hai. Metrics samay ke saath numbers hain (“500 requests per second, 2% errors”) — kuch gadbad hai yeh pakadne ke liye badhiya. Logs alag-alag events ke detailed record hain (“order 42 fail: card declined”) — kyun hua yeh samajhne ke liye badhiya. Traces ek request ko un sab services mein follow karte hain jinse woh guzarti hai, har step ka time ke saath — time ya error kahan hai yeh dhoondhne ke liye badhiya.',
    ),
    example: bi(
      'A hospital patient. Metrics are the vital-signs monitor — heart rate, blood pressure and temperature over time — with an alarm when something drifts. Logs are the nurse’s notes: “10:42 — patient reported pain, medicine given”. A trace is the patient’s journey across departments: reception 5 min → X-ray 40 min (waiting!) → doctor 10 min — showing exactly where the delay was.',
      'Hospital ka patient. Metrics vital-signs monitor hain — samay ke saath dhadkan, BP aur temperature — kuch bigde to alarm. Logs nurse ke notes hain: “10:42 — patient ne dard bataya, dawa di”. Trace departments mein patient ka safar hai: reception 5 min → X-ray 40 min (wait!) → doctor 10 min — dikhata hai ki der bilkul kahan hui.',
    ),
    why: bi(
      'Each answers a different question during an incident: is something wrong, and how badly? (metrics) where? (traces) why? (logs). Together they make a system observable.',
      'Incident ke dauraan har ek alag sawaal ka jawab deta hai: kya gadbad hai, aur kitni? (metrics) kahan? (traces) kyun? (logs). Teeno milke system ko observable banate hain.',
    ),
    table: {
      columns: ['', 'Metrics', 'Logs', 'Traces'],
      rows: [
        [bi('What it is', 'Kya hai'), bi('Numbers aggregated over time', 'Samay ke saath jode gaye numbers'), bi('Timestamped records of single events', 'Alag events ke timestamp wale record'), bi('The path and timing of one request across services', 'Services mein ek request ka raasta aur timing')],
        [bi('Answers', 'Jawab deta hai'), bi('Is something wrong? How much?', 'Kya gadbad hai? Kitni?'), bi('What exactly happened, and why?', 'Bilkul kya hua, aur kyun?'), bi('Where is the time or the error?', 'Time ya error kahan hai?')],
        ['Example', 'p99 latency 1.2 s, errors 3%', '{"level":"error","orderId":42,"msg":"card declined"}', 'gateway 5 ms → orders 20 ms → payments 900 ms'],
        [bi('Cost and volume', 'Kharcha aur volume'), bi('Cheap and small', 'Sasta aur chhota'), bi('Large; grows with traffic', 'Bada; traffic ke saath badhta hai'), bi('Medium; usually sampled', 'Beech ka; aksar sampled')],
        [bi('Best for', 'Kiske liye best'), 'Dashboards, alerts, trends, SLOs', 'Debugging details, audits', bi('Latency and dependencies in microservices', 'Microservices mein latency aur dependencies')],
        ['Tools', 'Prometheus, Datadog, CloudWatch', 'ELK / OpenSearch, Loki, Splunk', 'Jaeger, Zipkin, Tempo, OpenTelemetry'],
      ],
    },
    partsTitle: bi('Using them together', 'Inhe saath mein use karna'),
    parts: [
      {
        title: 'Metrics',
        text: bi(
          'Counters (only go up), gauges (go up and down) and histograms (distributions, for percentiles). Use RED for services — Rate, Errors, Duration — and USE for resources — Utilisation, Saturation, Errors. Keep labels low-cardinality: never put user IDs in metric labels.',
          'Counters (sirf badhte hain), gauges (badhte-ghatte hain) aur histograms (distribution, percentiles ke liye). Services ke liye RED — Rate, Errors, Duration — aur resources ke liye USE — Utilisation, Saturation, Errors. Labels low-cardinality rakho: metric labels mein kabhi user IDs mat daalo.',
        ),
      },
      {
        title: 'Logs',
        text: bi(
          'Structured (JSON) with level, timestamp, service and request/trace ID. Never log passwords, tokens or personal data. Send them to a central system — container logs vanish with the container — and control cost with retention and sampling.',
          'Structured (JSON), level, timestamp, service aur request/trace ID ke saath. Passwords, tokens ya personal data kabhi log mat karo. Inhe central system mein bhejo — container ke logs container ke saath gayab ho jaate hain — aur retention aur sampling se kharcha control karo.',
        ),
      },
      {
        title: 'Traces',
        text: bi(
          'A trace is a tree of spans; each span is one operation with a start time, a duration and attributes. Context propagation passes the trace ID between services in headers (W3C traceparent). Traces are sampled (head-based or tail-based) to control volume.',
          'Trace spans ka ek tree hai; har span ek operation hai jiske paas start time, duration aur attributes hote hain. Context propagation trace ID ko headers mein services ke beech pahunchata hai (W3C traceparent). Volume control karne ke liye traces sample kiye jaate hain (head-based ya tail-based).',
        ),
      },
      {
        title: bi('Correlate them', 'Inhe aapas mein jodo'),
        text: bi(
          'Put the trace ID in every log line and attach example trace IDs (exemplars) to metrics. Then you can jump from a latency spike on a dashboard to a slow trace, and from that trace to the exact logs of that request.',
          'Har log line mein trace ID daalo aur metrics ke saath example trace IDs (exemplars) jodo. Phir dashboard ke latency spike se slow trace tak, aur us trace se us request ke bilkul sahi logs tak kood sakte ho.',
        ),
      },
      {
        title: bi('A typical incident', 'Ek typical incident'),
        text: bi(
          'An alert fires from metrics (error rate up) → the dashboard narrows it to one service and endpoint → a trace shows the slow or failing span → the logs show the exact error.',
          'Metrics se alert aata hai (error rate badha) → dashboard ise ek service aur endpoint tak seemit karta hai → trace slow ya fail hota span dikhata hai → logs bilkul sahi error dikhate hain.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'Metrics are aggregated numeric time series that tell you whether something is wrong, logs are detailed event records that tell you why, and traces follow a single request across services to tell you where — together they make a system observable.',
        'Metrics aggregated numeric time series hain jo batate hain ki kuch gadbad hai ya nahi, logs detailed event records hain jo batate hain kyun, aur traces ek request ko services mein follow karke batate hain kahan — teeno milke system ko observable banate hain.',
      ),
      points: [
        bi('Metrics: counters, gauges and histograms; cheap to store and query; drive dashboards, alerts and SLOs (RED/USE).', 'Metrics: counters, gauges aur histograms; store aur query karna sasta; dashboards, alerts aur SLOs chalate hain (RED/USE).'),
        bi('Logs: timestamped, ideally structured events with context; high detail and volume; for root cause and audit.', 'Logs: timestamp wale, behtar ho to structured events context ke saath; zyaada detail aur volume; root cause aur audit ke liye.'),
        bi('Traces: spans with timing and parent-child links across services via context propagation; reveal bottlenecks and failing dependencies.', 'Traces: context propagation se services ke beech timing aur parent-child link wale spans; bottlenecks aur fail hoti dependencies dikhate hain.'),
        bi('Correlation is key: trace IDs in logs, exemplars linking metrics to traces.', 'Jodna sabse zaroori: logs mein trace IDs, metrics ko traces se jodne wale exemplars.'),
        bi('Cost trade-offs: low-cardinality metrics, log retention and sampling, sampled traces.', 'Kharche ke trade-offs: low-cardinality metrics, log retention aur sampling, sampled traces.'),
        bi('Standardise instrumentation with OpenTelemetry.', 'OpenTelemetry se instrumentation standard karo.'),
      ],
      keywords: [
        'Observability',
        'Three pillars',
        'Time series',
        'Counter / gauge / histogram',
        'Cardinality',
        'Structured logging',
        'Correlation ID',
        'Span',
        'Context propagation',
        'Sampling',
        'RED / USE method',
        'OpenTelemetry',
        'SLI / SLO',
      ],
    },
    listenFor: [
      bi('Correct definitions and when to use each one.', 'Sahi definitions aur har ek kab use karna.'),
      bi('How they connect to each other (trace IDs in logs).', 'Yeh aapas mein kaise judte hain (logs mein trace IDs).'),
      bi('A practical incident flow.', 'Ek practical incident flow.'),
    ],
    mistakes: [
      bi('Using logs as metrics (counting errors by searching logs).', 'Logs ko metrics ki tarah use karna (logs search karke errors ginna).'),
      bi('High-cardinality metric labels such as user IDs.', 'User IDs jaise high-cardinality metric labels.'),
      bi('Unstructured logs with no trace ID.', 'Bina trace ID ke unstructured logs.'),
    ],
    followUps: [
      {
        q: bi('Why not just log everything?', 'Sab kuch log hi kyun na kar dein?'),
        a: bi(
          'Cost and noise: enormous volume, slow searches and privacy risk. Metrics are far better for trends and alerting.',
          'Kharcha aur shor: bahut bada volume, slow search aur privacy ka risk. Trends aur alerting ke liye metrics kahin behtar hain.',
        ),
      },
      {
        q: bi('What is cardinality, and why does it matter for metrics?', 'Cardinality kya hai, aur metrics ke liye kyun zaroori hai?'),
        a: bi(
          'The number of unique label combinations. A label like user_id creates millions of separate time series and explodes storage and cost.',
          'Unique label combinations ki ginti. user_id jaisa label lakhon alag time series bana deta hai aur storage aur kharcha phat jaata hai.',
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
    tags: ['metrics', 'monitoring', 'golden signals', 'latency', 'error rate', 'slo', 'alerting'],
    simple: bi(
      'Start with the four “golden signals”: how much traffic you get, how many requests fail, how long requests take (especially the slowest ones), and how full your resources are. Then add metrics for what the API depends on (database, cache, queues, third-party APIs) and for the business itself (orders per minute, successful logins).',
      'Chaar “golden signals” se shuru karo: kitna traffic aa raha hai, kitni requests fail ho rahi hain, requests kitna time le rahi hain (khaas kar sabse slow wali), aur resources kitne bhare hain. Phir un cheezon ke metrics jodo jin pe API depend karta hai (database, cache, queues, third-party APIs) aur business ke bhi (har minute ke orders, successful logins).',
    ),
    example: bi(
      'Running a restaurant: customers per hour (traffic), dishes sent back (errors), how long guests wait for food — especially the unluckiest 1% (p99 latency), how busy the kitchen is and how many tables are free (saturation), plus today’s revenue (a business metric). If any of these drift you act before the bad reviews arrive.',
      'Restaurant chalana: har ghante ke customers (traffic), wapas aayi dishes (errors), guests khaane ka kitna wait karte hain — khaas kar sabse badkismat 1% (p99 latency), kitchen kitni busy hai aur kitni tables khaali hain (saturation), plus aaj ki kamaai (business metric). Inme se kuch bhi bigde to bure reviews aane se pehle action lete ho.',
    ),
    why: bi(
      'You cannot fix what you cannot see. Good metrics catch problems before users report them, prove you meet your SLAs, and guide capacity planning.',
      'Jo dikhta nahi use theek nahi kar sakte. Acche metrics users ke batane se pehle problem pakadte hain, saabit karte hain ki SLAs poore ho rahe hain, aur capacity planning mein madad karte hain.',
    ),
    without: bi(
      'You learn about outages from customers or social media, slow degradation goes unnoticed for weeks, and you have no data to debug with or to plan scaling.',
      'Outages ka pata customers ya social media se chalta hai, dheere-dheere bigadna hafton tak pata nahi chalta, aur debug karne ya scaling plan karne ko koi data nahi hota.',
    ),
    table: {
      columns: ['Metric', 'Why it matters', 'Example alert'],
      rows: [
        ['Request rate', bi('A sudden drop or spike reveals outages, attacks or broken clients', 'Achanak giravat ya uchhaal outages, attacks ya toote clients dikhata hai'), bi('Traffic 50% below the same time last week', 'Pichhle hafte isi time se traffic 50% kam')],
        ['Error rate (5xx)', bi('Users are failing', 'Users fail ho rahe hain'), bi('5xx above 1% for 5 minutes', '5 minute tak 5xx 1% se zyaada')],
        ['Latency p95 / p99', bi('The slow tail hurts real users; averages hide it', 'Slow tail asli users ko chot pahunchata hai; averages ise chhupa dete hain'), bi('p99 above 800 ms for 10 minutes', '10 minute tak p99 800 ms se zyaada')],
        ['Saturation', bi('Headroom left before things fail', 'Fail hone se pehle kitni gunjaish bachi'), bi('DB connection pool above 90%', 'DB connection pool 90% se zyaada')],
        ['Dependency health', bi('Most incidents start downstream', 'Zyaadatar incidents neeche ki services se shuru hote hain'), bi('DB p99 above 200 ms, queue lag growing', 'DB p99 200 ms se zyaada, queue lag badh raha')],
        ['Business KPIs', bi('Catches “200 OK but wrong”', '“200 OK par galat” ko pakadta hai'), bi('Checkout success below 95%', 'Checkout success 95% se kam')],
      ],
    },
    partsTitle: bi('What to monitor, layer by layer', 'Kya monitor karein, layer dar layer'),
    parts: [
      {
        title: bi('1. The golden signals per endpoint', '1. Har endpoint ke golden signals'),
        text: bi(
          'Rate (requests per second); errors (5xx rate — and notable 4xx separately, since a spike in 401s or 429s also means trouble); duration as percentiles (p50, p95, p99), never just the average. Track the latency of successful and failed requests separately.',
          'Rate (requests per second); errors (5xx rate — aur khaas 4xx alag se, kyunki 401 ya 429 ka uchhaal bhi gadbad hai); duration percentiles mein (p50, p95, p99), kabhi sirf average nahi. Successful aur failed requests ki latency alag track karo.',
        ),
      },
      {
        title: bi('2. Saturation and resources', '2. Saturation aur resources'),
        text: bi(
          'CPU, memory, garbage-collection pauses, event-loop lag (Node.js), thread-pool and database connection-pool usage, open connections, disk and network — plus container restarts and OOMKills.',
          'CPU, memory, garbage-collection pauses, event-loop lag (Node.js), thread-pool aur database connection-pool ka use, open connections, disk aur network — plus container restarts aur OOMKills.',
        ),
      },
      {
        title: '3. Dependencies',
        text: bi(
          'Database query latency, errors, slow queries and replication lag; cache hit ratio and latency; queue depth and consumer lag; third-party API latency and errors; circuit-breaker state.',
          'Database query latency, errors, slow queries aur replication lag; cache hit ratio aur latency; queue depth aur consumer lag; third-party API latency aur errors; circuit-breaker ki state.',
        ),
      },
      {
        title: bi('4. Business and user metrics', '4. Business aur user metrics'),
        text: bi(
          'Sign-ups, logins, checkout and payment success rates. These catch bugs where the API happily returns 200 but does the wrong thing.',
          'Sign-ups, logins, checkout aur payment success rates. Yeh woh bugs pakadte hain jahan API khushi se 200 lautata hai par galat kaam karta hai.',
        ),
      },
      {
        title: bi('5. Availability and SLOs', '5. Availability aur SLOs'),
        text: bi(
          'Synthetic checks from outside, service-level indicators (for example “99.9% of requests succeed in under 300 ms”), and how fast the error budget is being burned.',
          'Bahar se synthetic checks, service-level indicators (jaise “99.9% requests 300 ms se kam mein succeed hon”), aur error budget kitni tezi se khatam ho raha hai.',
        ),
      },
      {
        title: bi('6. Deploy and security signals', '6. Deploy aur security signals'),
        text: bi(
          'Deployment markers on every dashboard, authentication failures, rate-limit rejections and unusual traffic patterns.',
          'Har dashboard pe deployment markers, authentication failures, rate-limit rejections aur ajeeb traffic patterns.',
        ),
      },
      {
        title: bi('7. Alert well', '7. Sahi tareeke se alert karo'),
        text: bi(
          'Alert on symptoms users feel (error rate, latency, SLO burn rate), not on every CPU blip. Page people only for problems that need action now, link every alert to a runbook, and prune noisy alerts to avoid alert fatigue.',
          'Users jo mehsoos karte hain un lakshano pe alert karo (error rate, latency, SLO burn rate), har CPU blip pe nahi. Logon ko sirf un problems pe jagao jinpe abhi action chahiye, har alert ko runbook se jodo, aur shor machane wale alerts hatao taaki alert fatigue na ho.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I would monitor the four golden signals — traffic, errors, latency percentiles and saturation — per endpoint, plus dependency health and key business metrics, and alert on user-facing SLO violations rather than on every resource blip.',
        'Main har endpoint ke chaar golden signals monitor karunga — traffic, errors, latency percentiles aur saturation — plus dependency health aur zaroori business metrics, aur har resource blip ki jagah user-facing SLO violations pe alert karunga.',
      ),
      points: [
        bi('Traffic: requests per second per endpoint and status code.', 'Traffic: har endpoint aur status code ke requests per second.'),
        bi('Errors: 5xx rate plus notable 4xx (401, 429); error-budget burn.', 'Errors: 5xx rate plus khaas 4xx (401, 429); error-budget burn.'),
        bi('Latency: p50/p95/p99 from histograms, not averages.', 'Latency: histograms se p50/p95/p99, averages nahi.'),
        bi('Saturation: CPU, memory, GC or event-loop lag, thread and connection-pool usage, queue depth.', 'Saturation: CPU, memory, GC ya event-loop lag, thread aur connection-pool use, queue depth.'),
        bi('Dependencies: database latency and errors, cache hit ratio, external API latency, circuit-breaker state.', 'Dependencies: database latency aur errors, cache hit ratio, external API latency, circuit-breaker state.'),
        bi('Business KPIs such as checkout or login success to catch silent failures.', 'Chupi failures pakadne ke liye checkout ya login success jaise business KPIs.'),
        bi('SLIs/SLOs with burn-rate alerts, deployment markers and synthetic checks; actionable alerts with runbooks.', 'Burn-rate alerts ke saath SLIs/SLOs, deployment markers aur synthetic checks; runbooks ke saath action layak alerts.'),
      ],
      keywords: [
        'Four golden signals',
        'RED method',
        'USE method',
        'Latency percentiles (p95 / p99)',
        'Throughput',
        'Error rate',
        'Saturation',
        'SLI / SLO / SLA',
        'Error budget',
        'Burn-rate alerting',
        'Synthetic monitoring',
        'Alert fatigue',
      ],
    },
    listenFor: [
      bi('Percentiles rather than averages.', 'Averages ki jagah percentiles.'),
      bi('The golden signals, plus dependencies and business metrics.', 'Golden signals, plus dependencies aur business metrics.'),
      bi('A sensible alerting philosophy.', 'Alerting ki samajhdaar soch.'),
    ],
    mistakes: [
      bi('Watching only CPU and memory.', 'Sirf CPU aur memory dekhna.'),
      bi('Using only average latency.', 'Sirf average latency use karna.'),
      bi('Alerting on everything, so real alerts get ignored.', 'Har cheez pe alert, to asli alerts ignore ho jaate hain.'),
    ],
    followUps: [
      {
        q: bi('Why p99 instead of the average?', 'Average ki jagah p99 kyun?'),
        a: bi(
          'The average hides the slow tail. At scale, 1% of requests is thousands of users — and a page that makes many calls almost always hits the tail somewhere.',
          'Average slow tail chhupa deta hai. Bade scale pe 1% requests matlab hazaaron users — aur kai calls karne wala page lagbhag hamesha kahin na kahin tail se takraata hai.',
        ),
      },
      {
        q: bi('SLI vs SLO vs SLA?', 'SLI, SLO aur SLA mein kya fark hai?'),
        a: bi(
          'The SLI is the measurement (for example the success rate). The SLO is the internal target (99.9%). The SLA is the contractual promise to customers, with penalties — usually looser than the SLO.',
          'SLI naap hai (jaise success rate). SLO andar ka target hai (99.9%). SLA customers se kiya contract wala vaada hai, penalty ke saath — aam taur pe SLO se dheela.',
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
    scenario: bi(
      'For example: “open order #101” takes 120 ms, but “open order #205” takes 4 seconds — same endpoint, same code, similar users. Or saving a profile is quick, but saving a profile with a photo is slow. The interviewer is testing your method: do you measure and narrow it down step by step, from the user’s device to the database and back, or do you guess? They want to hear about tracing, comparing the fast and slow cases, and forming and testing hypotheses.',
      'Jaise: “order #101 kholo” 120 ms leta hai, par “order #205 kholo” 4 second — same endpoint, same code, milte-julte users. Ya profile save karna fast hai, par photo ke saath profile save karna slow. Interviewer aapka tareeka parakh raha hai: kya aap user ke device se database tak aur wapas, step by step naap ke dhoondhte ho, ya andaaza lagate ho? Woh tracing, fast aur slow case ki tulna, aur hypotheses banane aur test karne ki baat sunna chahta hai.',
    ),
    simple: bi(
      'Work like a detective. First confirm and measure the difference. Then break the request into stages — network, load balancer, service code, database, cache, external calls — and time each stage for both the fast and the slow case. The stage where the times differ is where the extra latency lives. Then dig into why: different data, a cache miss, a different code branch, a slow dependency or a different server.',
      'Detective ki tarah kaam karo. Pehle fark ko confirm karo aur naapo. Phir request ko stages mein todo — network, load balancer, service code, database, cache, external calls — aur fast aur slow dono cases ke liye har stage ka time naapo. Jis stage pe time alag hai, extra latency wahin hai. Phir kyun, yeh khodo: alag data, cache miss, alag code branch, slow dependency ya alag server.',
    ),
    example: bi(
      'Two friends order the same pizza from the same shop; one gets it in 20 minutes, the other in 70. To find out why, you check the timestamp of every step: order received, cooking started, out for delivery, delivered. If cooking times match but delivery differs, the problem is the route (a far address, traffic) — not the kitchen.',
      'Do dost same dukaan se same pizza order karte hain; ek ko 20 minute mein milta hai, doosre ko 70 mein. Kyun, yeh jaanne ke liye har step ka timestamp dekhte ho: order mila, banna shuru, delivery ke liye nikla, pahuncha. Banane ka time same par delivery alag, to problem raasta hai (door ka address, traffic) — kitchen nahi.',
    ),
    partsTitle: bi('A systematic approach', 'Ek systematic tareeka'),
    parts: [
      {
        title: bi('1. Define and reproduce', '1. Define karo aur reproduce karo'),
        text: bi(
          'Exact actions, inputs, users and times. Is it consistent or intermittent? Measure with real numbers (p50 vs p99), not “it feels slow”. Does it correlate with particular data (large accounts), regions, devices, servers or times of day?',
          'Bilkul kaunse actions, inputs, users aur time. Hamesha hota hai ya kabhi-kabhi? Asli numbers se naapo (p50 vs p99), “slow lag raha hai” se nahi. Kya iska rishta kisi khaas data (bade accounts), regions, devices, servers ya din ke samay se hai?',
        ),
      },
      {
        title: bi('2. Start at the client', '2. Client se shuru karo'),
        text: bi(
          'The browser’s Network waterfall (or mobile tracing) shows whether the time is spent in DNS, TLS and connecting, waiting for the server (time to first byte), downloading a large payload, or rendering on the client.',
          'Browser ka Network waterfall (ya mobile tracing) dikhata hai ki time DNS, TLS aur connect hone mein, server ka wait karne (time to first byte), bada payload download karne, ya client pe render karne mein ja raha hai.',
        ),
      },
      {
        title: bi('3. Timing at the edge', '3. Edge pe timing'),
        text: bi(
          'Load balancer or gateway access logs record the upstream response time. Comparing total time with time spent inside the service separates network and queueing from processing.',
          'Load balancer ya gateway ke access logs upstream response time record karte hain. Total time ko service ke andar ke time se compare karne se network aur queueing ko processing se alag kar sakte ho.',
        ),
      },
      {
        title: bi('4. Compare traces side by side', '4. Traces ko saath-saath compare karo'),
        text: bi(
          'With distributed tracing, open a fast trace and a slow trace and compare them span by span — handlers, database queries, cache calls, external APIs, queues. The span that grows is the culprit. Add custom spans where the picture is unclear.',
          'Distributed tracing se ek fast aur ek slow trace kholo aur span dar span compare karo — handlers, database queries, cache calls, external APIs, queues. Jo span bada hai wahi dosh hai. Jahan tasveer saaf na ho wahan custom spans jodo.',
        ),
      },
      {
        title: bi('5. Drill into the slow span', '5. Slow span mein gehraai se jao'),
        text: bi(
          'Database: run EXPLAIN with the slow input — more rows, a missing index, lock waits? Cache: hit or miss? External API: their latency, retries, timeouts. Code: a different branch, N+1 queries, serializing a huge object. For CPU-heavy paths, profile with flame graphs.',
          'Database: slow input ke saath EXPLAIN chalao — zyaada rows, missing index, lock waits? Cache: hit ya miss? External API: unki latency, retries, timeouts. Code: alag branch, N+1 queries, bahut bada object serialize karna. CPU-heavy paths ke liye flame graphs se profile karo.',
        ),
      },
      {
        title: bi('6. Check the environment', '6. Environment check karo'),
        text: bi(
          'One particular instance or pod (a noisy neighbour, garbage-collection pauses, CPU throttling), waiting for a connection from the pool, a blocked event loop, cold starts, or region and availability-zone differences.',
          'Koi ek khaas instance ya pod (shor machata padosi, garbage-collection pauses, CPU throttling), pool se connection ka wait, block hua event loop, cold starts, ya region aur availability-zone ke fark.',
        ),
      },
      {
        title: bi('7. Change one variable at a time', '7. Ek baar mein ek hi cheez badlo'),
        text: bi(
          'Form a hypothesis and test it: replay the slow request with the fast user’s data, warm the cache, or route it to another instance. If the latency moves, you have found the cause.',
          'Ek hypothesis banao aur test karo: slow request ko fast user ke data ke saath dobara chalao, cache garam karo, ya kisi doosre instance pe bhejo. Latency badli, to kaaran mil gaya.',
        ),
      },
      {
        title: bi('8. Fix, verify, prevent', '8. Theek karo, verify karo, roko'),
        text: bi(
          'Fix the root cause, compare before and after with metrics, and add per-endpoint latency percentiles, alerts and tracing on that path so it is caught early next time.',
          'Root cause theek karo, metrics se pehle aur baad compare karo, aur us raaste pe har endpoint ke latency percentiles, alerts aur tracing jodo taaki agli baar jaldi pakda jaaye.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I would measure both requests end to end and break the latency down hop by hop — client, network, edge, each service and each dependency — ideally by comparing distributed traces of a fast and a slow request side by side, then drill into the span that differs and test hypotheses one variable at a time.',
        'Main dono requests ko shuru se aakhir tak naapunga aur latency ko hop dar hop todunga — client, network, edge, har service aur har dependency — behtar ho to ek fast aur ek slow request ke distributed traces saath-saath compare karke, phir jo span alag hai usme gehraai se jaunga aur ek baar mein ek cheez badal ke hypotheses test karunga.',
      ),
      points: [
        bi('Quantify and reproduce: percentiles; which inputs, users, regions or instances are slow; consistent or intermittent.', 'Naapo aur reproduce karo: percentiles; kaunse inputs, users, regions ya instances slow; hamesha ya kabhi-kabhi.'),
        bi('Client side: the network waterfall — DNS, TLS, TTFB, payload size, rendering.', 'Client side: network waterfall — DNS, TLS, TTFB, payload size, rendering.'),
        bi('Edge: load balancer and gateway logs with upstream timings separate network/queueing from processing.', 'Edge: upstream timings wale load balancer aur gateway logs network/queueing ko processing se alag karte hain.'),
        bi('Distributed tracing: diff the span breakdown of a fast and a slow trace.', 'Distributed tracing: fast aur slow trace ke span breakdown ka fark nikaalo.'),
        bi('Drill down: EXPLAIN for queries, cache hit vs miss, external API latency and retries, N+1 queries, payload serialization, CPU profiling.', 'Gehraai mein: queries ke liye EXPLAIN, cache hit vs miss, external API latency aur retries, N+1 queries, payload serialization, CPU profiling.'),
        bi('Environment: specific hosts, GC pauses, CPU throttling, connection-pool waits, event-loop blocking, cold starts.', 'Environment: khaas hosts, GC pauses, CPU throttling, connection-pool waits, event-loop blocking, cold starts.'),
        bi('Confirm by changing one variable at a time; fix, verify with metrics, add alerts.', 'Ek baar mein ek cheez badal ke confirm karo; theek karo, metrics se verify karo, alerts jodo.'),
      ],
      keywords: [
        'End-to-end latency',
        'Latency breakdown',
        'Distributed tracing',
        'Span',
        'Critical path',
        'TTFB',
        'p50 / p99',
        'Cache hit vs miss',
        'N+1 queries',
        'Lock contention',
        'Connection-pool wait',
        'GC pause',
        'Flame graph / profiling',
        'Hypothesis-driven debugging',
      ],
    },
    listenFor: [
      bi('A systematic, data-driven method rather than guessing.', 'Andaaze ki jagah systematic, data pe chalne wala tareeka.'),
      bi('Using tracing and comparing the fast and slow cases.', 'Tracing use karna aur fast aur slow cases compare karna.'),
      bi('Considering data-dependent causes and the environment.', 'Data pe depend kaaranon aur environment pe sochna.'),
    ],
    mistakes: [
      bi('Guessing — “it’s probably the database”.', 'Andaaza lagana — “shayad database hai”.'),
      bi('Optimising code without measuring first.', 'Pehle naape bina code optimise karna.'),
      bi('Ignoring the client and network, or looking only at averages.', 'Client aur network ko ignore karna, ya sirf averages dekhna.'),
    ],
    followUps: [
      {
        q: bi('There is no tracing. What then?', 'Tracing hai hi nahi. Tab kya?'),
        a: bi(
          'Add timing logs with a correlation ID at every boundary, use load balancer access logs, database slow-query logs and an APM agent — and add tracing as part of the fix.',
          'Har boundary pe correlation ID ke saath timing logs jodo, load balancer access logs, database slow-query logs aur APM agent use karo — aur fix ke hisse ke roop mein tracing jodo.',
        ),
      },
      {
        q: bi('What is an N+1 query problem?', 'N+1 query problem kya hai?'),
        a: bi(
          'Loading a list with one query and then running one extra query per item — fine for 5 items, terrible for 500. Fix it with a join, a batched “WHERE id IN (…)” query, or eager loading.',
          'Ek query se list laana aur phir har item ke liye ek extra query — 5 items pe theek, 500 pe bahut bura. Join, batched “WHERE id IN (…)” query, ya eager loading se theek karo.',
        ),
      },
    ],
    related: { components: ['distributed-tracing', 'metrics-monitoring'], challenges: ['distributed-tracing-system'] },
  },

  {
    id: 'how-do-you-know-your-release-has-a-problem',
    category: 'devops',
    topic: 'observability',
    question: bi(
      "You've just released some code to production. When and how do you find out if there's an issue with that code?",
      'Aapne abhi production mein code release kiya. Kab aur kaise pata chalega ki us code mein koi problem hai?',
    ),
    kind: 'behavioral',
    level: 'intermediate',
    tags: ['ownership', 'monitoring', 'alerting', 'release', 'canary', 'feature flags', 'error tracking'],
    scenario: bi(
      'This question is about ownership. Do you wait for a bug ticket or a customer complaint, or do you actively watch your change in production and have automated alerts that tell you within minutes? Describe what you do right after the release, what tells you about problems, and how you limit the damage when something is wrong.',
      'Yeh sawaal ownership ke baare mein hai. Kya aap bug ticket ya customer ki shikayat ka wait karte ho, ya production mein apne change ko khud dekhte ho aur aise automated alerts rakhte ho jo minutes mein bata dein? Batao release ke turant baad kya karte ho, problems ke baare mein aapko kya batata hai, aur kuch galat ho to nuksaan kaise seemit karte ho.',
    ),
    simple: bi(
      'Ideally I find out within minutes, before users do. I watch dashboards and logs for my change right after deploying, automated alerts fire if error rates or latency cross their thresholds, and risky changes go out gradually (canary or feature flag) so problems show up on a small slice of traffic first.',
      'Behtar hai ki mujhe minutes mein, users se pehle pata chale. Deploy ke turant baad main apne change ke dashboards aur logs dekhta hoon, error rate ya latency threshold paar kare to automated alerts aate hain, aur risky changes dheere-dheere jaate hain (canary ya feature flag) taaki problems pehle traffic ke chhote hisse pe dikhein.',
    ),
    example: bi(
      'A chef adds a new dish. A careless chef waits for angry reviews next week. A good chef tastes it before serving, serves it to a few tables first, watches how many plates come back unfinished, asks the waiters to report complaints immediately — and keeps the old dish ready to switch back.',
      'Chef menu mein nayi dish jodta hai. Laparwah chef agle hafte gusse wale reviews ka wait karta hai. Accha chef serve karne se pehle chakhta hai, pehle kuch tables ko deta hai, dekhta hai kitni plates adhoori wapas aati hain, waiters se kehta hai shikayat turant batao — aur purani dish wapas laane ko taiyaar rakhta hai.',
    ),
    partsTitle: bi('What a strong answer covers', 'Ek mazboot jawab mein kya ho'),
    parts: [
      {
        title: bi('Before the release', 'Release se pehle'),
        text: bi(
          'Know what “healthy” looks like: the metrics, logs or events that prove the change works, added as part of the work. Plan the rollback.',
          'Jaano ki “healthy” kaisa dikhta hai: woh metrics, logs ya events jo saabit karein ki change kaam kar raha hai, kaam ke hisse ke roop mein jode hue. Rollback ka plan rakho.',
        ),
      },
      {
        title: bi('Release safely', 'Safely release karo'),
        text: bi(
          'Canary or percentage rollout behind a feature flag, deployed during working hours — not just before leaving for the weekend.',
          'Feature flag ke peeche canary ya percentage rollout, kaam ke ghanton mein deploy — weekend ke liye nikalne se theek pehle nahi.',
        ),
      },
      {
        title: bi('Immediately after', 'Turant baad'),
        text: bi(
          'Compare error rate, p95/p99 latency and saturation before and after the deployment marker; check error tracking (such as Sentry) for new exception types; run a quick smoke test of the feature in production.',
          'Deployment marker se pehle aur baad error rate, p95/p99 latency aur saturation compare karo; naye exception types ke liye error tracking (jaise Sentry) dekho; production mein feature ka chhota smoke test karo.',
        ),
      },
      {
        title: 'Automated detection',
        text: bi(
          'SLO burn-rate alerts, error-spike alerts, synthetic checks, automated canary analysis that halts the rollout, and alerts on business metrics such as checkout success.',
          'SLO burn-rate alerts, error-spike alerts, synthetic checks, automated canary analysis jo rollout rok de, aur checkout success jaise business metrics pe alerts.',
        ),
      },
      {
        title: bi('Over the next hours and days', 'Agle ghanton aur dinon mein'),
        text: bi(
          'Watch for slow-burn problems — memory leaks, growing queue backlogs, data issues — and keep an eye on support channels and user feedback.',
          'Dheere sulagne wali problems pe nazar rakho — memory leaks, badhte queue backlogs, data issues — aur support channels aur user feedback pe bhi.',
        ),
      },
      {
        title: bi('If something is wrong', 'Agar kuch galat ho'),
        text: bi(
          'Roll back or switch the flag off first, communicate, then investigate — and add the monitoring that would have caught it sooner.',
          'Pehle roll back ya flag off karo, sabko batao, phir jaanch karo — aur woh monitoring jodo jo ise jaldi pakad leti.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'I do not wait for a bug ticket: I own the change through release — I roll it out progressively, watch the service’s dashboards, error tracking and logs right after deploying, and rely on automated alerts on error rate, latency and business metrics to tell me within minutes if something regressed.',
        'Main bug ticket ka wait nahi karta: release tak change ki zimmedari leta hoon — use dheere-dheere roll out karta hoon, deploy ke turant baad service ke dashboards, error tracking aur logs dekhta hoon, aur error rate, latency aur business metrics pe automated alerts pe bharosa karta hoon jo minutes mein bata dein ki kuch bigda hai.',
      ),
      points: [
        bi('Define success signals before release: metrics, logs or events that prove the feature works.', 'Release se pehle success signals tay karo: metrics, logs ya events jo saabit karein ki feature kaam kar raha hai.'),
        bi('Progressive delivery: canary or percentage rollout behind a feature flag, during working hours.', 'Progressive delivery: kaam ke ghanton mein, feature flag ke peeche canary ya percentage rollout.'),
        bi('Post-deploy verification against the deployment marker; error tracking for new exception types; a production smoke test.', 'Deployment marker ke against post-deploy verification; naye exception types ke liye error tracking; production smoke test.'),
        bi('Automated alerting: SLO burn rate, error spikes, synthetic checks, automated canary analysis.', 'Automated alerting: SLO burn rate, error spikes, synthetic checks aur automated canary analysis se.'),
        bi('Business metrics catch silent failures where requests succeed but outcomes are wrong.', 'Business metrics woh chupi failures pakadte hain jahan requests succeed hoti hain par nateeja galat.'),
        bi('If it degrades: roll back or disable the flag first, communicate, then investigate and add the missing alert.', 'Bigde to: pehle roll back ya flag off, batao, phir jaanch karo aur missing alert jodo.'),
      ],
      keywords: [
        'Ownership — you build it, you run it',
        'Deployment markers',
        'Canary release',
        'Feature flags',
        'Progressive delivery',
        'Error tracking',
        'SLO burn-rate alert',
        'Synthetic monitoring',
        'Smoke test',
        'Rollback',
        'Mean time to detect (MTTD)',
      ],
    },
    listenFor: [
      bi('How involved are they in “owning” their code?', 'Woh apne code ki “ownership” mein kitne shaamil hain?'),
      bi('Do they wait for a bug ticket, or are they alerted by automated alerts?', 'Kya woh bug ticket ka wait karte hain, ya automated alerts se pata chalta hai?'),
    ],
    mistakes: [
      bi('“QA will catch it” or “users will report it”.', '“QA pakad lega” ya “users bata denge”.'),
      bi('Deploying and leaving for the day.', 'Deploy karke ghar chale jaana.'),
      bi('No rollback plan and no metrics for the new feature.', 'Na rollback plan, na naye feature ke metrics.'),
    ],
    followUps: [
      {
        q: bi('How do you know an alert threshold is right?', 'Kaise pata ki alert threshold sahi hai?'),
        a: bi(
          'Base it on SLOs and historical baselines, review alerts after every incident, and remove alerts that fire without needing action.',
          'Ise SLOs aur purane baselines pe rakho, har incident ke baad alerts review karo, aur jo alerts bina action ki zaroorat ke bajte hain unhe hatao.',
        ),
      },
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
    scenario: bi(
      'Minutes after a deploy, the dashboard shows 5xx errors jumping from 0.1% to 8%. Users are affected right now. The interviewer wants to see your priorities under pressure: do you start reading code to find the bug, or do you stop the bleeding first? The expected answer is: mitigate first (roll back), investigate afterwards.',
      'Deploy ke kuch minute baad dashboard dikhata hai ki 5xx errors 0.1% se 8% ho gaye. Users pe abhi asar ho raha hai. Interviewer dabaav mein aapki priorities dekhna chahta hai: kya aap bug dhoondhne ke liye code padhna shuru karte ho, ya pehle khoon behna rokte ho? Ummeed wala jawab: pehle mitigate (roll back), jaanch baad mein.',
    ),
    simple: bi(
      'Stop the damage first: roll back to the previous version (or switch off the feature flag) immediately — the deploy is the most likely cause, and rolling back is fast and safe. Tell the team what is happening. Only once users are fine do you calmly investigate why the new version failed.',
      'Pehle nuksaan roko: turant pichhle version pe roll back karo (ya feature flag off karo) — deploy hi sabse sambhavit kaaran hai, aur roll back fast aur safe hai. Team ko batao kya ho raha hai. Users theek ho jaayein, tabhi aaram se jaancho ki naya version fail kyun hua.',
    ),
    example: bi(
      'You change a recipe in your restaurant and customers immediately start sending plates back. You do not experiment in the kitchen while the dining room fills with angry people — you switch back to the old recipe straight away, and work out what went wrong after service.',
      'Aap restaurant mein recipe badalte ho aur customers turant plates wapas bhejne lagte hain. Dining hall gusse wale logon se bhar raha ho tab kitchen mein experiment nahi karte — turant purani recipe pe wapas jaate ho, aur kya galat hua yeh service ke baad sochte ho.',
    ),
    partsTitle: bi('What to do, in order', 'Kya karein, order mein'),
    parts: [
      {
        title: bi('1. Confirm quickly (a minute or two)', '1. Jaldi confirm karo (ek-do minute)'),
        text: bi(
          'Is the spike real, and does it line up with the deploy (the deployment marker)? Which service and endpoints? Only pods running the new version (canary)? Do not spend long here.',
          'Kya spike asli hai, aur deploy (deployment marker) se milta hai? Kaunsi service aur endpoints? Sirf naye version wale pods (canary)? Yahan zyaada time mat lagao.',
        ),
      },
      {
        title: bi('2. Mitigate', '2. Mitigate karo'),
        text: bi(
          'Roll back to the last known good version (kubectl rollout undo, or redeploy the previous artifact), switch the feature flag off, or halt the canary. When the cause is not obvious, rolling back beats fixing forward.',
          'Aakhri sahi version pe roll back karo (kubectl rollout undo, ya pichhla artifact dobara deploy), feature flag off karo, ya canary rok do. Jab kaaran saaf na ho, roll back fix forward se behtar hai.',
        ),
      },
      {
        title: bi('3. Communicate', '3. Batao'),
        text: bi(
          'Declare an incident in the team channel, assign roles (an incident commander, someone handling communication), and update the status page if customers can see the problem.',
          'Team channel mein incident declare karo, roles do (incident commander, communication sambhalne wala), aur customers ko problem dikh rahi ho to status page update karo.',
        ),
      },
      {
        title: bi('4. Verify recovery', '4. Recovery verify karo'),
        text: bi(
          'Error rate and latency back to normal? Then check for side effects: failed jobs, bad data written by the faulty version, messages that need replaying.',
          'Error rate aur latency normal pe wapas? Phir side effects dekho: fail hue jobs, kharab version ka likha galat data, replay karne wale messages.',
        ),
      },
      {
        title: bi('5. Beware rollbacks that are not simple', '5. Mushkil rollbacks se savdhaan'),
        text: bi(
          'If the new version ran a database migration that is not backward compatible, rolling back the code can break things. That is why migrations follow expand-and-contract. In that case fix forward carefully, or reverse the migration.',
          'Agar naye version ne aisi database migration chalayi jo backward compatible nahi, to code roll back karne se cheezein toot sakti hain. Isliye migrations expand-and-contract follow karti hain. Aise case mein dhyaan se fix forward karo, ya migration ulti karo.',
        ),
      },
      {
        title: bi('6. Investigate', '6. Jaanch karo'),
        text: bi(
          'Logs and traces from the bad version, the code diff, configuration and dependency changes; reproduce it in staging.',
          'Kharab version ke logs aur traces, code diff, configuration aur dependency changes; staging mein reproduce karo.',
        ),
      },
      {
        title: bi('7. Learn from it', '7. Isse seekho'),
        text: bi(
          'A blameless post-mortem: the root cause, why tests and the canary did not catch it, and action items — better tests, automated canary analysis and rollback, new alerts.',
          'Blameless post-mortem: root cause, tests aur canary ne kyun nahi pakda, aur action items — behtar tests, automated canary analysis aur rollback, naye alerts.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'My first action is to mitigate, not debug: confirm that the spike lines up with the deploy and roll back to the last known good version (or disable the feature flag), then communicate and verify recovery before doing root-cause analysis.',
        'Mera pehla action mitigate karna hai, debug nahi: confirm karna ki spike deploy se milta hai aur aakhri sahi version pe roll back karna (ya feature flag off karna), phir sabko batana aur root-cause analysis se pehle recovery verify karna.',
      ),
      points: [
        bi('Correlate quickly: deployment marker vs error spike, affected services and endpoints, only new-version pods?', 'Jaldi milao: deployment marker vs error spike, kaunsi services aur endpoints, sirf naye version wale pods?'),
        bi('Mitigate fast: roll back, switch the flag off or halt the rollout — restoring service beats finding the bug.', 'Jaldi mitigate karo: roll back, flag off ya rollout roko — service wapas laana bug dhoondhne se zyaada zaroori.'),
        bi('Communicate: declare an incident, an incident commander, stakeholder and status-page updates.', 'Batao: incident declare, incident commander, stakeholders aur status page updates.'),
        bi('Verify recovery and clean up side effects (failed jobs, bad writes, messages to replay).', 'Recovery verify karo aur side effects saaf karo (fail jobs, galat writes, replay wale messages).'),
        bi('Use expand-and-contract migrations so rollback is always safe.', 'Expand-and-contract migrations use karo taaki roll back hamesha safe ho.'),
        bi('Then root-cause analysis with logs, traces and the diff; reproduce in staging.', 'Phir logs, traces aur diff se root-cause analysis; staging mein reproduce.'),
        bi('A blameless post-mortem with action items: tests, canary analysis, automatic rollback, alerts.', 'Action items ke saath blameless post-mortem: tests, canary analysis, automatic rollback, alerts.'),
      ],
      keywords: [
        'Mitigate before root cause',
        'Rollback',
        'Last known good version',
        'Feature flag kill switch',
        'Deployment marker',
        'Incident commander',
        'MTTR',
        'Blast radius',
        'Canary analysis',
        'Expand-and-contract migration',
        'Blameless post-mortem',
        'Fix forward vs roll back',
      ],
    },
    listenFor: [
      bi('Restoring service first.', 'Pehle service wapas laana.'),
      bi('Communicating clearly during the incident.', 'Incident ke dauraan saaf communication.'),
      bi('Knowing when a rollback is not safe, and following up with a post-mortem.', 'Yeh jaanna ki roll back kab safe nahi, aur post-mortem se follow up.'),
    ],
    mistakes: [
      bi('Debugging in production while users suffer.', 'Users pareshaan hon tab production mein debug karna.'),
      bi('Rushing out a hotfix without understanding the problem.', 'Problem samjhe bina jaldi mein hotfix bhejna.'),
      bi('Not telling anyone, or blaming individuals.', 'Kisi ko na batana, ya logon ko dosh dena.'),
    ],
    followUps: [
      {
        q: bi('When would you fix forward instead of rolling back?', 'Roll back ki jagah fix forward kab karoge?'),
        a: bi(
          'When rolling back is unsafe (an irreversible migration, a changed data format) or when the fix is trivial, well understood and faster than a rollback.',
          'Jab roll back safe na ho (ulti na hone wali migration, badla hua data format) ya jab fix bahut chhota, achhe se samjha hua aur roll back se fast ho.',
        ),
      },
      {
        q: bi('How do you reduce the blast radius next time?', 'Agli baar blast radius kaise kam karoge?'),
        a: bi(
          'Canary releases with automated analysis and rollback, feature flags, smaller deployments, and isolating customers into cells so one bad deploy affects only a few.',
          'Automated analysis aur rollback ke saath canary releases, feature flags, chhote deployments, aur customers ko cells mein alag rakhna taaki ek kharab deploy kuch hi logon pe asar kare.',
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
    scenario: bi(
      'This is a behavioral question — there is no single correct technical answer. The interviewer wants a real story and is judging how you behave under pressure: what you did personally, how you found and fixed the problem, how you communicated and — most importantly — what you changed afterwards so it does not happen again. Prepare one or two stories in advance.',
      'Yeh behavioral sawaal hai — iska ek sahi technical jawab nahi hota. Interviewer ek asli kahani chahta hai aur dekhta hai ki dabaav mein aap kaise behave karte ho: aapne khud kya kiya, problem kaise dhoondhi aur theek ki, kaise communicate kiya aur — sabse zaroori — baad mein kya badla taaki dobara na ho. Ek-do kahaniyaan pehle se taiyaar rakho.',
    ),
    simple: bi(
      'Tell a short, structured story: what happened and how big the impact was, what your role was, how you found and fixed the problem step by step, and what you did afterwards to prevent it from happening again. Be honest and specific — numbers, tools, decisions — and focus on your actions and what you learned, not on blame.',
      'Ek chhoti, structured kahani sunao: kya hua aur asar kitna bada tha, aapka role kya tha, aapne step by step problem kaise dhoondhi aur theek ki, aur baad mein use dobara hone se rokne ke liye kya kiya. Imaandaar aur specific raho — numbers, tools, decisions — aur dosh ki jagah apne actions aur seekh pe dhyaan do.',
    ),
    example: bi(
      'Like a pilot’s debrief after an emergency landing: what the situation was, what each person did, which checklist they followed, and what changed in training or in the aircraft afterwards.',
      'Emergency landing ke baad pilot ke debrief jaisa: situation kya thi, har insaan ne kya kiya, kaunsi checklist follow ki, aur baad mein training ya aircraft mein kya badla.',
    ),
    partsTitle: bi('How to structure your story (STAR + learnings)', 'Apni kahani kaise structure karein (STAR + seekh)'),
    parts: [
      {
        title: 'Situation',
        text: bi(
          'The system, the time and the impact in numbers — for example “checkout errors for 20% of users for 35 minutes during a sale”.',
          'System, samay aur numbers mein asar — jaise “sale ke dauraan 35 minute tak 20% users ko checkout errors”.',
        ),
      },
      {
        title: 'Task',
        text: bi(
          'Your role: the on-call engineer, the incident commander, the person who shipped the change, or someone helping.',
          'Aapka role: on-call engineer, incident commander, jisne change bheja, ya madad karne wala.',
        ),
      },
      {
        title: 'Action',
        text: bi(
          'How it was detected (an alert, or a customer?), how you narrowed it down (dashboards, logs, traces), how you mitigated it (rollback, scaling, a feature flag), how you communicated (updates every 15 minutes) and who you worked with.',
          'Kaise pata chala (alert, ya customer?), kaise seemit kiya (dashboards, logs, traces), kaise mitigate kiya (roll back, scaling, feature flag), kaise communicate kiya (har 15 minute updates) aur kiske saath kaam kiya.',
        ),
      },
      {
        title: 'Result',
        text: bi('How quickly service was restored, how the impact was contained, and how users were informed.', 'Service kitni jaldi wapas aayi, asar kaise seemit hua, aur users ko kaise bataya gaya.'),
      },
      {
        title: bi('Learnings and prevention — the most important part', 'Seekh aur roktham — sabse zaroori hissa'),
        text: bi(
          'The blameless post-mortem, the root cause (ask “why?” five times), the concrete action items you drove — tests, alerts, runbooks, canary releases, rate limits, design changes — and how you checked that they worked.',
          'Blameless post-mortem, root cause (paanch baar “kyun?” poochho), aapke chalaye thos action items — tests, alerts, runbooks, canary releases, rate limits, design changes — aur aapne kaise check kiya ki woh kaam kar rahe hain.',
        ),
      },
      {
        title: bi('A sample answer (adapt it to your own experience)', 'Ek sample jawab (apne experience ke hisaab se badlo)'),
        text: bi(
          '“During a festive sale our checkout error rate jumped to 12% shortly after a release. I was on call, and our error-rate alert paged me within three minutes. The deploy marker lined up with the spike, so I rolled back first, which brought errors down within eight minutes, and I posted updates in the incident channel. The traces then showed the new version called the coupon service without a timeout; that service was overloaded by sale traffic, so checkout threads piled up. In the post-mortem we added timeouts and a circuit breaker with a fallback that skips coupons, a load test for sale traffic, and automated canary analysis that rolls back when errors rise. A month later the coupon service slowed down again, and checkout degraded gracefully instead of failing.”',
          '“Ek festive sale ke dauraan release ke kuch der baad hamara checkout error rate 12% ho gaya. Main on-call tha, aur error-rate alert ne teen minute mein mujhe page kiya. Deploy marker spike se mil raha tha, isliye maine pehle roll back kiya, jisse aath minute mein errors kam ho gaye, aur main incident channel mein updates deta raha. Phir traces se pata chala ki naya version coupon service ko bina timeout ke call kar raha tha; sale ke traffic se woh service overload thi, to checkout threads jamaa ho gaye. Post-mortem mein humne timeouts aur ek circuit breaker jodha jiska fallback coupons skip kar deta hai, sale traffic ka load test, aur automated canary analysis jo errors badhne pe roll back kar de. Ek mahine baad coupon service phir slow hui, aur checkout fail hone ki jagah aaram se degrade hua.”',
        ),
      },
      {
        title: bi('No production experience yet?', 'Abhi production experience nahi?'),
        text: bi(
          'Use an incident from a project, an internship, a college system or an open-source issue — or explain honestly how you would act, step by step. Honesty beats an invented story.',
          'Kisi project, internship, college system ya open-source issue ka incident use karo — ya imaandaari se batao ki aap step by step kya karte. Banaayi hui kahani se imaandaari behtar hai.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'Use STAR: a sentence or two of situation and impact, your specific role, the actions you took to detect, mitigate and diagnose, the result with numbers, and — most importantly — the preventive actions you drove afterwards.',
        'STAR use karo: situation aur asar ke ek-do sentence, aapka khaas role, detect, mitigate aur diagnose karne ke liye aapke actions, numbers ke saath result, aur — sabse zaroori — baad mein aapke chalaye roktham ke actions.',
      ),
      points: [
        bi('Situation: quantify the impact — users affected, duration, revenue or SLO impact.', 'Situation: asar naapo — kitne users, kitni der, revenue ya SLO pe asar.'),
        bi('Task: be clear about your personal role and responsibility.', 'Task: apna personal role aur zimmedari saaf batao.'),
        bi('Action: detection, mitigation first (rollback, flag, scaling), diagnosis with metrics, logs and traces, regular communication.', 'Action: detection, pehle mitigation (roll back, flag, scaling), metrics, logs aur traces se diagnosis, regular communication.'),
        bi('Result: time to recover and how the impact was contained.', 'Result: recover hone ka time aur asar kaise seemit hua.'),
        bi('Learnings: blameless post-mortem, root cause, action items you owned, and how they paid off later.', 'Seekh: blameless post-mortem, root cause, aapke action items, aur baad mein unka faayda kaise hua.'),
        bi('Tone: honest, specific, ownership without blame.', 'Lehja: imaandaar, specific, bina dosh ke ownership.'),
      ],
      keywords: [
        'STAR method',
        'Impact / blast radius',
        'On-call',
        'Detection (MTTD)',
        'Mitigation (MTTR)',
        'Root cause analysis / 5 whys',
        'Blameless post-mortem',
        'Action items',
        'Runbook',
        'Prevention',
      ],
    },
    listenFor: [
      bi('Detail about how they responded to the incident and what their own involvement was.', 'Incident pe unhone kaise response diya aur unka apna kya hissa tha, iski detail.'),
      bi('Do they talk about post-incident actions, rather than just the initial fix?', 'Kya woh sirf shuruaati fix nahi, balki incident ke baad ke actions ki baat karte hain?'),
      bi('Did they take actions to prevent it from happening again?', 'Kya unhone dobara na ho, iske liye kadam uthaye?'),
    ],
    mistakes: [
      bi('A vague story with no numbers.', 'Bina numbers ki dhundhli kahani.'),
      bi('Saying “we” all the time, so your own role is unclear.', 'Har baar “hum” kehna, to aapka apna role saaf nahi hota.'),
      bi('Blaming others.', 'Doosron ko dosh dena.'),
      bi('Ending at the fix, with no prevention.', 'Fix pe kahani khatam, roktham ka zikr nahi.'),
    ],
    followUps: [
      {
        q: bi('What would you do differently?', 'Aap kya alag karte?'),
        a: bi(
          'Have a thoughtful answer ready — for example escalating earlier, having had a better alert, or rolling back sooner instead of trying a quick fix.',
          'Ek soch-samajh ke jawab taiyaar rakho — jaise jaldi escalate karna, behtar alert hona, ya quick fix ki koshish ki jagah jaldi roll back karna.',
        ),
      },
      {
        q: bi('How did you communicate with non-technical stakeholders?', 'Non-technical stakeholders se kaise baat ki?'),
        a: bi(
          'In plain words: what users are experiencing, what we are doing, when the next update will come — without jargon or guesses about the cause.',
          'Seedhe shabdon mein: users ko kya ho raha hai, hum kya kar rahe hain, agla update kab aayega — bina jargon ya kaaran ke andaazon ke.',
        ),
      },
    ],
  },
];
