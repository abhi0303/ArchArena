import { a, c, scene } from '@/features/learn/dsl';
import { bi, code, figure, h, note, p, section, steps, table, ul } from '../dsl';
import type { PrepQuestion } from '../types';

export const databaseQuestions: PrepQuestion[] = [
  {
    id: 'database-index-and-when-it-hurts',
    category: 'database',
    topic: 'general',
    question: bi('What is a database index and when can it hurt performance?', 'Database index kya hota hai aur yeh performance ko kab nuksaan pahunchata hai?'),
    kind: 'concept',
    level: 'beginner',
    tags: ['index', 'b-tree', 'query performance', 'write amplification', 'sql', 'explain', 'postgresql'],
    answer: bi(
      'An index is a separate, sorted data structure — usually a B-tree — that lets the database find rows without scanning the whole table, like the index at the back of a book. It makes reads much faster, but every insert, update and delete must also update the index, so the wrong indexes, or too many of them, slow down writes and use extra storage and memory.',
      'Index ek alag, sorted data structure hai — aam taur pe B-tree — jisse database poori table scan kiye bina rows dhoondh leta hai, bilkul kitaab ke peeche wale index ki tarah. Isse reads bahut fast hote hain, par har insert, update aur delete ko index bhi update karna padta hai, isliye galat ya bahut zyaada indexes writes ko slow karte hain aur extra storage aur memory lete hain.',
    ),
    sections: [
      section(
        'How an index helps',
        'Index kaise madad karta hai',
        p(
          'Login looks up a user by email. Without an index, the database reads every row (a full table scan) — fine at 1,000 users, painfully slow at 50 million:',
          'Login email se user dhoondhta hai. Index ke bina database har row padhta hai (full table scan) — 1,000 users pe theek, 5 crore pe bahut slow:',
        ),
        code(
          'sql',
          `
SELECT id, password_hash FROM users WHERE email = 'abhi@example.com';

CREATE INDEX idx_users_email ON users (email);`,
        ),
        p('`EXPLAIN ANALYZE` shows the difference:', '`EXPLAIN ANALYZE` fark dikhata hai:'),
        code(
          'text',
          `
-- before
Seq Scan on users  (actual time=0.031..4210.512 rows=1)
-- after
Index Scan using idx_users_email on users  (actual time=0.021..0.048 rows=1)`,
        ),
        p(
          'The B-tree keeps emails sorted, so the database walks a few levels of the tree — a handful of page reads even for millions of rows. The same sorted order also speeds up ranges (`created_at BETWEEN …`) and `ORDER BY`.',
          'B-tree emails ko sorted rakhta hai, to database tree ke kuch levels hi chalta hai — lakhon rows mein bhi kuch hi page reads. Yahi sorted order ranges (`created_at BETWEEN …`) aur `ORDER BY` ko bhi fast karta hai.',
        ),
      ),
      section(
        'Where I add indexes',
        'Main index kahan lagata hoon',
        ul(
          ['Columns used in `WHERE` filters that are selective (many distinct values).', '`WHERE` filters ke woh columns jo selective hon (bahut alag values).'],
          ['Foreign keys and `JOIN` columns.', 'Foreign keys aur `JOIN` columns.'],
          ['Columns used for `ORDER BY` / `GROUP BY` on large tables.', 'Badi tables pe `ORDER BY` / `GROUP BY` wale columns.'],
          ['Unique business rules (`UNIQUE (email)`), which are enforced through an index anyway.', 'Unique business rules (`UNIQUE (email)`), jo waise bhi index se hi enforce hote hain.'],
        ),
        h('Composite indexes: column order matters', 'Composite indexes: column ka order maayne rakhta hai'),
        code('sql', 'CREATE INDEX idx_orders_user_status ON orders (user_id, status);'),
        table(
          ['Query', bi('Uses the index?', 'Index use hoga?')],
          [
            ["WHERE user_id = 7 AND status = 'PAID'", bi('Yes', 'Haan')],
            ['WHERE user_id = 7', bi('Yes (leftmost column)', 'Haan (sabse left wala column)')],
            ["WHERE status = 'PAID'", bi('No — it skips the first column', 'Nahi — pehla column chhoot gaya')],
          ],
        ),
        p(
          'If an index contains every column a query needs, the database answers from the index alone (a covering index / index-only scan).',
          'Agar index mein query ke saare columns hon, to database sirf index se jawab de deta hai (covering index / index-only scan).',
        ),
      ),
      section(
        'When an index hurts performance',
        'Index kab performance ko nuksaan karta hai',
        ul(
          [
            '**Write-heavy tables:** every `INSERT`, `UPDATE` and `DELETE` updates every index (write amplification). An events table with eight indexes can write several times slower.',
            '**Write-heavy tables:** har `INSERT`, `UPDATE` aur `DELETE` har index update karta hai (write amplification). Aath indexes wali events table kai guna slow likh sakti hai.',
          ],
          ['**Too many, duplicate or unused indexes:** they cost disk, memory and write time and help nobody.', '**Bahut zyaada, duplicate ya bina use ke indexes:** disk, memory aur write time khaate hain aur kisi ki madad nahi karte.'],
          [
            '**Low-selectivity columns** such as a boolean or a status with three values: the index points at half the table, so a sequential scan is often cheaper and the planner ignores it.',
            '**Low-selectivity columns** jaise boolean ya teen values wala status: index aadhi table ki taraf ishaara karta hai, to sequential scan aksar sasta padta hai aur planner use ignore kar deta hai.',
          ],
          ['**Reading a large share of the table** through an index means many random reads — slower than one sequential scan.', '**Table ka bada hissa** index se padhna matlab bahut random reads — ek sequential scan se slow.'],
          ['**Memory pressure:** when indexes no longer fit in RAM, lookups go to disk and everything slows down.', '**Memory ka dabaav:** jab indexes RAM mein fit nahi hote, lookups disk pe jaate hain aur sab slow ho jaata hai.'],
          ['**Building one on a big production table** can block writes for minutes.', '**Badi production table pe index banana** writes ko minutes tak rok sakta hai.'],
        ),
        code('sql', '-- PostgreSQL: build without blocking writes\nCREATE INDEX CONCURRENTLY idx_orders_created_at ON orders (created_at);'),
      ),
      section(
        'Queries that cannot use the index',
        'Queries jo index use nahi kar sakti',
        table(
          ['Query', bi('Why the index is skipped', 'Index kyun skip hota hai'), 'Fix'],
          [
            ['WHERE LOWER(email) = ?', bi('A function wraps the column', 'Column pe function laga hai'), bi('Expression index on `LOWER(email)`', '`LOWER(email)` pe expression index')],
            ["WHERE name LIKE '%abhi'", bi('Leading wildcard', 'Shuru mein wildcard'), bi('Full-text or trigram index', 'Full-text ya trigram index')],
            ['WHERE phone = 9876543210', bi('Type mismatch (the column is text)', 'Type mismatch (column text hai)'), bi('Compare with the right type', 'Sahi type se compare karo')],
            ['WHERE a = 1 OR b = 2', bi('OR across different columns', 'Alag columns pe OR'), bi('Separate indexes or UNION', 'Alag indexes ya UNION')],
          ],
        ),
        p(
          'I decide with evidence: the slow-query log and `EXPLAIN ANALYZE` for real query patterns, and `pg_stat_user_indexes` to find indexes nobody uses.',
          'Main saboot se decide karta hoon: asli query patterns ke liye slow-query log aur `EXPLAIN ANALYZE`, aur jo indexes koi use nahi karta unhe dhoondhne ke liye `pg_stat_user_indexes`.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'An index is an auxiliary data structure, usually a B-tree, that maps column values to rows, so the database can find data in logarithmic time instead of scanning the whole table. I add indexes on selective columns used in WHERE, JOIN and ORDER BY, and for composite indexes I keep the leftmost-prefix rule in mind.',
          'Index ek auxiliary data structure hai, aam taur pe B-tree, jo column values ko rows se map karta hai, taaki database poori table scan karne ki jagah logarithmic time mein data dhoondh sake. Main WHERE, JOIN aur ORDER BY mein use hone wale selective columns pe index lagata hoon, aur composite indexes mein leftmost-prefix rule ka dhyaan rakhta hoon.',
        ),
        bi(
          'Indexes hurt when a table is write-heavy, because every write updates every index; when there are too many or unused indexes; on low-selectivity columns; and when they no longer fit in memory. Functions on columns, leading wildcards and type mismatches also stop an index from being used. I validate with EXPLAIN ANALYZE and the slow-query log, and build indexes concurrently in production.',
          'Index tab nuksaan karta hai jab table write-heavy ho, kyunki har write har index update karta hai; jab bahut zyaada ya bina use ke indexes hon; low-selectivity columns pe; aur jab woh memory mein fit na hon. Column pe functions, shuru ka wildcard aur type mismatch bhi index ko use hone se rokte hain. Main EXPLAIN ANALYZE aur slow-query log se check karta hoon, aur production mein indexes concurrently banata hoon.',
        ),
      ],
      keywords: ['B-tree', 'Full table scan', 'Selectivity / cardinality', 'Composite index', 'Leftmost prefix', 'Covering index', 'Write amplification', 'Query planner', 'EXPLAIN ANALYZE', 'CREATE INDEX CONCURRENTLY'],
    },
    listenFor: [
      bi('The trade-off: faster reads, slower writes.', 'Trade-off ki samajh: fast reads, slow writes.'),
      bi('Concrete cases where an index does not help, and using EXPLAIN instead of guessing.', 'Thos cases jahan index madad nahi karta, aur andaaze ki jagah EXPLAIN use karna.'),
    ],
    mistakes: [bi('“Just index every column.”', '“Har column pe index laga do.”'), bi('Believing indexes are free.', 'Yeh maanna ki indexes free hain.')],
    followUps: [
      {
        q: bi('What is the difference between a clustered and a non-clustered index?', 'Clustered aur non-clustered index mein kya fark hai?'),
        a: bi(
          'In a clustered index the table rows themselves are stored in index order — only one per table, such as the InnoDB primary key. A non-clustered index is a separate structure that points to the rows.',
          'Clustered index mein table ki rows khud index ke order mein store hoti hain — har table mein sirf ek, jaise InnoDB ki primary key. Non-clustered index ek alag structure hai jo rows ki taraf point karta hai.',
        ),
      },
      {
        q: bi('Would you index a boolean column?', 'Kya aap boolean column pe index lagaoge?'),
        a: bi(
          'Usually not. If one value is rare — say `is_flagged = true` — a partial index on just those rows works well: `CREATE INDEX … WHERE is_flagged`.',
          'Aam taur pe nahi. Agar ek value kam hoti ho — jaise `is_flagged = true` — to sirf un rows pe partial index accha kaam karta hai: `CREATE INDEX … WHERE is_flagged`.',
        ),
      },
    ],
    related: { components: ['sql-db', 'search-index'], challenges: ['url-shortener-basic', 'ecommerce-product-catalog'] },
  },

  {
    id: 'query-fast-last-month-slow-now',
    category: 'database',
    topic: 'performance',
    question: bi('A query that was fast last month is now slow. What might have changed?', 'Jo query pichhle mahine fast thi, ab slow hai. Kya badla ho sakta hai?'),
    kind: 'scenario',
    level: 'intermediate',
    tags: ['slow query', 'query plan', 'statistics', 'data growth', 'locks', 'explain', 'vacuum'],
    answer: bi(
      'If the SQL has not changed, something around it has: the data grew or became skewed, the optimizer chose a different plan (often because of stale statistics), an index was dropped or became bloated, the query now waits on locks, or the server is under more pressure. I confirm which one with evidence — when it started, the query plan and database metrics — instead of guessing.',
      'Agar SQL nahi badla, to uske aas-paas kuch badla hai: data badh gaya ya skewed ho gaya, optimizer ne alag plan chuna (aksar purane statistics ki wajah se), koi index drop ho gaya ya phool gaya, query ab locks pe wait karti hai, ya server pe dabaav badh gaya. Kaunsa kaaran hai, yeh main andaaze ki jagah saboot se confirm karta hoon — kab shuru hua, query plan aur database metrics.',
    ),
    sections: [
      section(
        'First: when did it start?',
        'Pehle: kab shuru hua?',
        p('I line the slowdown up with everything that changed around that time:', 'Main slowness ko us waqt badli har cheez se milata hoon:'),
        ul(
          ['Deploys and database migrations.', 'Deploys aur database migrations.'],
          ['Big data loads, imports or a new batch job.', 'Bade data loads, imports ya naya batch job.'],
          ['Traffic growth or a new heavy customer.', 'Traffic badhna ya koi naya bhaari customer.'],
          ['Is it slow for every input, or only for some parameters (one large account)?', 'Har input ke liye slow hai, ya sirf kuch parameters ke liye (ek bada account)?'],
        ),
      ),
      section(
        'Compare the query plan',
        'Query plan compare karo',
        code('sql', "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders WHERE customer_id = 42 AND status = 'PAID';"),
        code(
          'text',
          `
Nested Loop  (rows=120) (actual rows=2,400,000 time=3120 ms)   ← estimate is 20,000× off
  -> Seq Scan on orders (actual rows=2,400,000)`,
        ),
        p(
          'When the **estimated** rows are far from the **actual** rows, the optimizer is working from stale statistics and picked a bad plan. Refreshing them often fixes it immediately:',
          'Jab **estimated** rows **actual** rows se bahut door hon, to optimizer purane statistics pe kaam kar raha hai aur usne bura plan chuna. Unhe refresh karna aksar turant theek kar deta hai:',
        ),
        code('sql', 'ANALYZE orders;'),
      ),
      section(
        'Common causes and how I check each',
        'Aam kaaran aur har ek ko kaise check karta hoon',
        table(
          [bi('Cause', 'Kaaran'), bi('How I check', 'Kaise check karta hoon'), 'Fix'],
          [
            [bi('Data growth or skew', 'Data growth ya skew'), bi('Table size and row counts over time', 'Samay ke saath table size aur row count'), bi('Better index, partition, archive old rows', 'Behtar index, partition, purani rows archive')],
            [bi('Stale statistics / plan change', 'Purane statistics / plan change'), bi('Estimated vs actual rows in EXPLAIN', 'EXPLAIN mein estimated vs actual rows'), bi('`ANALYZE`, tune autovacuum', '`ANALYZE`, autovacuum tune karo')],
            [bi('Missing, invalid or bloated index', 'Missing, invalid ya bloated index'), bi('Plan shows Seq Scan; check indexes after migrations', 'Plan mein Seq Scan; migrations ke baad indexes dekho'), bi('Recreate or reindex (concurrently)', 'Dobara banao ya reindex (concurrently)')],
            [bi('Table bloat (dead rows)', 'Table bloat (mari hui rows)'), bi('Dead tuples in `pg_stat_user_tables`', '`pg_stat_user_tables` mein dead tuples'), bi('VACUUM; fix autovacuum settings', 'VACUUM; autovacuum settings theek karo')],
            ['Lock contention', bi('`pg_stat_activity` wait events', '`pg_stat_activity` ke wait events'), bi('Shorten transactions, reschedule batch jobs', 'Transactions chhote karo, batch jobs ka time badlo')],
            [bi('Resource pressure', 'Resources pe dabaav'), bi('CPU, IO, cache hit ratio, pool waits', 'CPU, IO, cache hit ratio aur pool waits'), bi('Scale, add replicas, cache, fix heavy queries', 'Scale, replicas, cache, bhaari queries theek karo')],
            [bi('Environment change', 'Environment ka badalna'), bi('DB upgrade, config change, ORM upgrade', 'DB upgrade, config change, ORM upgrade dekho'), bi('Compare settings and generated SQL', 'Settings aur bana hua SQL compare karo')],
          ],
        ),
      ),
      section(
        'Is it running, or waiting?',
        'Query chal rahi hai, ya wait kar rahi hai?',
        p('A query blocked by a lock looks exactly like a slow query. While it is slow, I check what is running:', 'Lock se ruki query bilkul slow query jaisi dikhti hai. Jab slow ho, main dekhta hoon kya chal raha hai:'),
        code(
          'sql',
          `
SELECT pid, state, wait_event_type, wait_event,
       now() - query_start AS running_for, left(query, 60) AS query
FROM   pg_stat_activity
WHERE  state <> 'idle'
ORDER  BY running_for DESC;`,
        ),
      ),
      section(
        'Fix and prevent',
        'Theek karo aur roko',
        ul(
          ['Fix the root cause, then confirm with before/after latency.', 'Root cause theek karo, phir pehle/baad ki latency se confirm karo.'],
          ['For ever-growing tables: partition by time and archive old rows.', 'Hamesha badhti tables ke liye: time se partition karo aur purani rows archive karo.'],
          ['Track per-query p95/p99 with `pg_stat_statements` and alert on regressions.', '`pg_stat_statements` se har query ka p95/p99 track karo aur regressions pe alert karo.'],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'If the query text has not changed, I look at what changed around it. First I pin down when it started and correlate it with deploys, migrations, data loads and traffic. Then I run EXPLAIN ANALYZE and compare it with the old plan — a big gap between estimated and actual rows usually means stale statistics and a plan regression, which ANALYZE can fix.',
          'Agar query text nahi badla, to main dekhta hoon uske aas-paas kya badla. Pehle pata karta hoon kab shuru hua aur use deploys, migrations, data loads aur traffic se milata hoon. Phir EXPLAIN ANALYZE chala ke purane plan se compare karta hoon — estimated aur actual rows mein bada fark aksar purane statistics aur plan regression ka matlab hai, jise ANALYZE theek kar sakta hai.',
        ),
        bi(
          'Other usual causes are data growth or skew, a dropped or bloated index, table bloat from dead rows, lock contention from long transactions or new batch jobs, and resource pressure such as the working set no longer fitting in memory. I confirm the cause with pg_stat_activity and metrics, fix it, and add alerting on query latency so the next regression is caught early.',
          'Doosre aam kaaran hain data growth ya skew, drop hua ya bloated index, mari hui rows se table bloat, lambe transactions ya naye batch jobs se lock contention, aur resource pressure jaise working set ka memory mein fit na hona. Main pg_stat_activity aur metrics se kaaran confirm karta hoon, use theek karta hoon, aur query latency pe alert lagata hoon taaki agli regression jaldi pakdi jaaye.',
        ),
      ],
      keywords: ['Execution plan', 'Query optimizer', 'Table statistics', 'EXPLAIN ANALYZE', 'Plan regression', 'Cardinality estimate', 'Index bloat', 'VACUUM', 'Lock contention', 'pg_stat_statements'],
    },
    listenFor: [
      bi('A structured, evidence-based investigation rather than guesses.', 'Andaazon ki jagah structured, saboot pe aadharit jaanch.'),
      bi('Understanding the query planner and statistics, and considering locks and resources.', 'Query planner aur statistics ki samajh, aur locks aur resources pe bhi sochna.'),
    ],
    mistakes: [bi('Jumping straight to “add an index” or “buy a bigger server”.', 'Seedha “index laga do” ya “bada server le lo” pe kood jaana.'), bi('Not asking when it started.', 'Yeh na poochhna ki kab shuru hua.')],
    followUps: [
      {
        q: bi('What are table statistics?', 'Table statistics kya hote hain?'),
        a: bi(
          'Summaries such as row counts and histograms of value distribution. The optimizer uses them to estimate how many rows each step returns and to choose the cheapest plan.',
          'Row counts aur values ke distribution ke histograms jaisi summaries. Optimizer inse andaaza lagata hai ki har step kitni rows dega, aur sabse sasta plan chunta hai.',
        ),
      },
    ],
    related: { components: ['sql-db', 'read-replica'], challenges: ['distributed-sql-database', 'banking-transaction-platform'] },
  },

  {
    id: 'database-connection-pool-exhausted',
    category: 'database',
    topic: 'performance',
    question: bi('What happens if your database connection pool becomes exhausted?', 'Agar aapka database connection pool exhaust ho jaaye to kya hota hai?'),
    kind: 'scenario',
    level: 'intermediate',
    tags: ['connection pool', 'database', 'timeouts', 'latency', 'backpressure', 'pgbouncer', 'node.js'],
    answer: bi(
      'New requests have to wait for a free connection, and if none frees up before the pool’s acquire timeout, they fail. Users see slow responses, then errors, and the slowdown can cascade to every service that calls this one. Exhaustion is usually a symptom — of slow queries, connection leaks or long transactions — so I fix the cause instead of just making the pool bigger.',
      'Nayi requests ko free connection ka wait karna padta hai, aur pool ke acquire timeout tak koi free na ho to woh fail ho jaati hain. Users ko pehle slow responses dikhte hain, phir errors, aur yeh slowness is service ko call karne wali har service tak fail sakti hai. Exhaustion aam taur pe ek lakshan hai — slow queries, connection leaks ya lambe transactions ka — isliye main pool bada karne ki jagah kaaran theek karta hoon.',
    ),
    sections: [
      section(
        'What a connection pool is',
        'Connection pool kya hai',
        p(
          'Opening a database connection is expensive (network, TLS, authentication), and the database allows only a limited number (`max_connections`). So the app keeps a few connections open and lends one to each request:',
          'Database connection kholna mehnga hai (network, TLS, authentication), aur database sirf limited connections allow karta hai (`max_connections`). Isliye app kuch connections khule rakhta hai aur har request ko ek udhaar deta hai:',
        ),
        code(
          'ts',
          `
import { Pool } from 'pg';

export const pool = new Pool({
  max: 20,                         // connections in this instance's pool
  connectionTimeoutMillis: 2000,   // wait at most 2 s for a free connection
  idleTimeoutMillis: 30000,
  statement_timeout: 5000,         // cancel queries running longer than 5 s
});`,
        ),
      ),
      section(
        'What happens when it is exhausted',
        'Exhaust hone pe kya hota hai',
        figure(
          scene(
            [
              [a('users', 'Users', bi('Many requests', 'Bahut requests'))],
              [c('app-server', { state: 'bad', note: bi('pool 20/20 busy', 'pool 20/20 full') })],
              [c('sql-db', { note: bi('slow queries', 'queries slow hain') })],
            ],
            [['users!>app-server', bi('queued', 'line mein')], 'app-server>sql-db'],
            bi(
              'Every connection is busy, so new requests queue inside the app and eventually time out — even though the app server has spare CPU.',
              'Har connection busy hai, to nayi requests app ke andar line mein lagti hain aur aakhir mein time out — jabki app server ke paas CPU bacha hai.',
            ),
          ),
        ),
        steps(
          ['All 20 connections are busy', 'Saare 20 connections busy', 'Usually because queries became slow or connections are not returned.', 'Aam taur pe isliye ki queries slow ho gayi ya connections wapas nahi aa rahe.'],
          ['New requests wait in the pool’s queue', 'Nayi requests pool ki line mein', 'Response time climbs for everyone, including requests that need a 2 ms query.', 'Sabka response time badhta hai, un requests ka bhi jinhe 2 ms ki query chahiye.'],
          ['Waits hit the acquire timeout', 'Wait acquire timeout tak', 'Requests fail with “timeout exceeded when trying to connect” → 500/503 errors.', 'Requests “timeout exceeded when trying to connect” se fail → 500/503 errors.'],
          ['It cascades', 'Yeh failta hai', 'Health checks fail, callers retry and add more load, and upstream services slow down too.', 'Health checks fail, callers retry karke aur load badhate hain, aur upar ki services bhi slow ho jaati hain.'],
        ),
      ),
      section(
        'Why it happens',
        'Yeh kyun hota hai',
        table(
          [bi('Cause', 'Kaaran'), 'Example'],
          [
            ['Slow queries', bi('A missing index makes each query hold its connection for seconds', 'Missing index ki wajah se har query seconds tak connection pakadti hai')],
            ['Connection leaks', bi('A code path that never releases the connection, usually on an error', 'Aisa code path jo connection kabhi release nahi karta, aksar error pe')],
            [bi('Long transactions', 'Lambe transactions'), bi('Calling a payment API while a transaction is open', 'Transaction khula rakh ke payment API call karna')],
            ['Traffic spike', bi('A sale doubles concurrent requests', 'Sale se concurrent requests double')],
            [bi('Pool too small / database overloaded', 'Pool bahut chhota / database overloaded'), bi('More app instances, same database capacity', 'Zyaada app instances, database ki capacity wahi')],
          ],
        ),
        p('The most common bug is a leak:', 'Sabse common bug leak hai:'),
        code(
          'ts',
          `
// ❌ leaks the connection when the query throws
const client = await pool.connect();
const result = await client.query(sql);
client.release();

// ✅ always released
const client = await pool.connect();
try {
  return await client.query(sql);
} finally {
  client.release();
}`,
        ),
      ),
      section(
        'What I do during the incident',
        'Incident ke dauraan main kya karta hoon',
        ul(
          ['Check pool metrics (active, idle, pending) and `pg_stat_activity` to see what holds the connections.', 'Pool metrics (active, idle, pending) aur `pg_stat_activity` dekho ki connections kisne pakde hain.'],
          ['Cancel runaway queries; roll back a bad deploy.', 'Bekaabu queries cancel karo; kharab deploy roll back karo.'],
          [
            'Shed load with rate limiting rather than adding instances blindly — more instances mean more connections on the same database.',
            'Aankh band karke instances jodne ki jagah rate limiting se load kam karo — zyaada instances matlab same database pe zyaada connections.',
          ],
        ),
      ),
      section(
        'How I prevent it',
        'Main ise kaise rokta hoon',
        ul(
          ['Fix slow queries and indexes; set statement timeouts.', 'Slow queries aur indexes theek karo; statement timeouts set karo.'],
          ['Always release connections (`try/finally`, or let the ORM manage them).', 'Connections hamesha release karo (`try/finally`, ya ORM ko sambhalne do).'],
          ['Keep transactions short — never make network calls inside them.', 'Transactions chhote rakho — unke andar kabhi network calls mat karo.'],
          [
            'Fail fast with a short acquire timeout (1–2 s) and use separate pools (bulkheads) for critical and reporting queries.',
            'Chhote acquire timeout (1–2 s) se jaldi fail karo aur critical aur reporting queries ke liye alag pools (bulkheads) rakho.',
          ],
          ['Alert on pool utilisation and wait time before the pool is full.', 'Pool bharne se pehle pool utilisation aur wait time pe alert karo.'],
        ),
        note(
          'important',
          'Size pools against the database: 10 instances × 20 connections = 200 connections. Keep the total below `max_connections`, or put a proxy such as PgBouncer or RDS Proxy in front.',
          'Pools ko database ke hisaab se size karo: 10 instances × 20 connections = 200 connections. Total `max_connections` se kam rakho, ya aage PgBouncer ya RDS Proxy jaisa proxy lagao.',
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'When the pool is exhausted, requests block waiting for a connection until the acquire timeout and then fail, so latency spikes, 5xx errors appear, and it can cascade as health checks fail and callers retry.',
          'Pool exhaust hone pe requests acquire timeout tak connection ke wait mein rukti hain aur phir fail hoti hain, to latency spike hoti hai, 5xx errors aate hain, aur health checks fail hone aur callers ke retry se yeh cascade kar sakta hai.',
        ),
        bi(
          'Exhaustion is usually a symptom: slow queries, connection leaks, long transactions that make network calls, or a traffic spike. During an incident I check pool metrics and pg_stat_activity, kill runaway queries and shed load. To prevent it, I release connections in finally blocks, keep transactions short, set statement and acquire timeouts, use bulkhead pools, and size pools so that instances times pool size stays below max_connections — with PgBouncer at scale.',
          'Exhaustion aam taur pe lakshan hai: slow queries, connection leaks, network calls karne wale lambe transactions, ya traffic spike. Incident mein main pool metrics aur pg_stat_activity dekhta hoon, bekaabu queries kill karta hoon aur load kam karta hoon. Rokne ke liye finally blocks mein connections release karta hoon, transactions chhote rakhta hoon, statement aur acquire timeouts lagata hoon, bulkhead pools use karta hoon, aur pools aise size karta hoon ki instances × pool size max_connections se kam rahe — scale pe PgBouncer ke saath.',
        ),
      ],
      keywords: ['Connection pool', 'Acquire timeout', 'Connection leak', 'max_connections', 'Pool sizing', 'Long-running transaction', 'Statement timeout', 'Fail fast', 'Bulkhead', 'PgBouncer'],
    },
    listenFor: [
      bi('Treating exhaustion as a symptom and finding the cause.', 'Exhaustion ko lakshan maan ke kaaran dhoondhna.'),
      bi('Knowing that a bigger pool is not the fix; mentioning leaks, timeouts and monitoring.', 'Yeh jaanna ki bada pool fix nahi; leaks, timeouts aur monitoring ka zikr.'),
    ],
    mistakes: [bi('“Just raise the pool to 500.”', '“Pool 500 kar do.”'), bi('Leaving default 30-second timeouts so requests hang.', 'Default 30 second timeouts chhod dena jisse requests latki rehti hain.')],
    followUps: [
      {
        q: bi('Why not just make the pool huge?', 'Pool ko bahut bada hi kyun na kar dein?'),
        a: bi(
          'Each connection costs database memory and CPU. Past a point, more concurrent queries make every query slower through contention, and many instances × a big pool exceed the database’s connection limit.',
          'Har connection database ki memory aur CPU khaata hai. Ek had ke baad zyaada concurrent queries contention se har query ko slow karti hain, aur kai instances × bada pool database ki connection limit paar kar dete hain.',
        ),
      },
    ],
    related: { components: ['sql-db', 'app-server'], challenges: ['ecommerce-checkout', 'banking-transaction-platform'] },
  },
];
