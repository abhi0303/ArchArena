import { a, bi, c, scene } from '@/features/learn/dsl';
import type { PrepQuestion } from '../types';

export const databaseQuestions: PrepQuestion[] = [
  {
    id: 'database-index-and-when-it-hurts',
    category: 'database',
    topic: 'general',
    question: bi('What is a database index and when can it hurt performance?', 'Database index kya hota hai aur yeh performance ko kab nuksaan pahunchata hai?'),
    kind: 'concept',
    level: 'beginner',
    tags: ['index', 'b-tree', 'query performance', 'write amplification', 'sql', 'explain'],
    simple: bi(
      'An index is a separate, sorted list that helps the database find rows quickly without reading the whole table — like the index at the back of a book. It makes reads much faster, but every time a row is added, changed or deleted, the database must also update every index on that table. So too many indexes, or the wrong ones, slow down writes and use extra space.',
      'Index ek alag, sorted list hai jo database ko poori table padhe bina rows jaldi dhoondhne mein madad karti hai — bilkul kitaab ke peeche wale index ki tarah. Isse reads bahut fast ho jaate hain, par har baar row add, change ya delete hone pe database ko us table ke har index ko bhi update karna padta hai. Isliye bahut zyaada ya galat indexes writes ko slow karte hain aur extra jagah lete hain.',
    ),
    example: bi(
      'Your phone contacts are sorted by name, so you jump straight to “R” for Rahul. If they were stored in the order you saved them, you would scroll through all 2,000. But every new contact must be slotted into the right place — and if the phone kept three sorted lists (by name, by company, by city), every new contact would mean updating all three.',
      'Aapke phone ke contacts naam se sorted hain, to aap seedha “R” pe Rahul tak pahunch jaate ho. Agar woh save karne ke order mein hote, to saare 2,000 scroll karne padte. Par har naya contact sahi jagah pe ghusana padta hai — aur agar phone teen sorted lists rakhe (naam, company, shehar se), to har naye contact pe teeno update karni padengi.',
    ),
    why: bi(
      'Without an index, a query like WHERE email = ? reads every row (a full table scan) — fine at 1,000 rows, painfully slow at 50 million. An index turns that scan into a lookup that touches only a handful of pages.',
      'Index ke bina WHERE email = ? jaisi query har row padhti hai (full table scan) — 1,000 rows pe theek, 5 crore pe bahut slow. Index us scan ko lookup bana deta hai jo sirf kuch pages chhoota hai.',
    ),
    without: bi(
      'As users grow, logins and searches take seconds, CPU and disk usage spike, and queries start timing out under load.',
      'Users badhte hi login aur search mein seconds lagne lagte hain, CPU aur disk ka use achanak badhta hai, aur load mein queries time out hone lagti hain.',
    ),
    partsTitle: bi('How it works, and when it hurts', 'Yeh kaise kaam karta hai, aur kab nuksaan karta hai'),
    parts: [
      {
        title: bi('How it works', 'Yeh kaise kaam karta hai'),
        text: bi(
          'Most indexes are B-trees: balanced, sorted trees that map a column value to the location of the row. Finding a value walks a few levels of the tree — a handful of reads even for millions of rows. Ranges (“between two dates”) and ORDER BY can use the same sorted order. Other types exist for special needs: hash (equality only), full-text, geospatial.',
          'Zyaadatar indexes B-trees hote hain: balanced, sorted trees jo column ki value ko row ki location se jodte hain. Value dhoondhne mein tree ke kuch levels hi chalne padte hain — lakhon rows mein bhi kuch hi reads. Ranges (“do dates ke beech”) aur ORDER BY bhi isi sorted order ka use kar sakte hain. Khaas zarooraton ke liye doosre types bhi hain: hash (sirf equality), full-text, geospatial.',
        ),
      },
      {
        title: bi('Where indexes help', 'Indexes kahan madad karte hain'),
        text: bi(
          'Columns in WHERE filters that are selective (many different values), JOIN keys and foreign keys, ORDER BY and GROUP BY columns, and unique constraints (which are enforced through an index).',
          'WHERE filters ke woh columns jo selective hon (bahut alag-alag values), JOIN keys aur foreign keys, ORDER BY aur GROUP BY columns, aur unique constraints (jo index se hi enforce hote hain).',
        ),
      },
      {
        title: bi('Composite indexes: column order matters', 'Composite indexes: column ka order maayne rakhta hai'),
        text: bi(
          'An index on (country, city) helps WHERE country = ? AND city = ? and WHERE country = ?, but not WHERE city = ? alone — the “leftmost prefix” rule. If an index contains every column a query needs, the database can answer from the index alone (a covering index / index-only scan).',
          '(country, city) pe index WHERE country = ? AND city = ? aur WHERE country = ? mein madad karta hai, par akele WHERE city = ? mein nahi — yeh “leftmost prefix” rule hai. Agar index mein query ke saare columns hon, to database sirf index se jawab de sakta hai (covering index / index-only scan).',
        ),
      },
      {
        title: bi('It hurts writes', 'Yeh writes ko nuksaan karta hai'),
        text: bi(
          'Every INSERT, UPDATE and DELETE must update every index on the table (write amplification). A write-heavy table — logs, events, clicks — with eight indexes can be several times slower to write, take longer locks and increase replication lag.',
          'Har INSERT, UPDATE aur DELETE ko table ke har index ko update karna padta hai (write amplification). Write-heavy table — logs, events, clicks — pe aath indexes hon to likhna kai guna slow ho sakta hai, locks lambe chalte hain aur replication lag badhta hai.',
        ),
      },
      {
        title: bi('It costs storage and memory', 'Yeh storage aur memory khaata hai'),
        text: bi(
          'Indexes take disk space and compete for RAM. When the indexes no longer fit in memory, more reads go to disk and everything slows down. Unused or duplicate indexes are pure cost.',
          'Indexes disk ki jagah lete hain aur RAM ke liye muqabla karte hain. Jab indexes memory mein fit nahi hote, zyaada reads disk pe jaate hain aur sab slow ho jaata hai. Bina use ke ya duplicate indexes sirf kharcha hain.',
        ),
      },
      {
        title: bi('It may not be used at all', 'Ho sakta hai use hi na ho'),
        text: bi(
          'Low-variety columns (true/false, status with three values) point to huge parts of the table, so a full scan is often cheaper and the planner ignores the index. Reading many rows through an index means many random reads — sometimes slower than one sequential scan. Functions on the column (WHERE LOWER(email) = ?), a leading wildcard (LIKE ‘%abc’), or a type mismatch also stop the index from being used.',
          'Kam variety wale columns (true/false, teen values wala status) table ke bade hisse ki taraf ishaara karte hain, isliye full scan aksar sasta padta hai aur planner index ignore kar deta hai. Index se bahut saari rows padhna matlab bahut saare random reads — kabhi-kabhi ek sequential scan se bhi slow. Column pe function (WHERE LOWER(email) = ?), shuru mein wildcard (LIKE ‘%abc’), ya type mismatch bhi index ko use hone se rokte hain.',
        ),
      },
      {
        title: bi('How to decide', 'Kaise decide karein'),
        text: bi(
          'Index for real query patterns, not “just in case”. Check the slow-query log and EXPLAIN (ANALYZE) to see whether a query uses the index. Remove indexes nobody uses. On large production tables, build indexes online (CREATE INDEX CONCURRENTLY in PostgreSQL) so writes are not blocked.',
          'Asli query patterns ke liye index banao, “shayad kaam aaye” ke liye nahi. Slow-query log aur EXPLAIN (ANALYZE) se dekho ki query index use kar rahi hai ya nahi. Jo indexes koi use nahi karta unhe hatao. Badi production tables pe index online banao (PostgreSQL mein CREATE INDEX CONCURRENTLY) taaki writes block na hon.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'An index is an auxiliary data structure, usually a B-tree, that maps column values to rows so the database can find data in logarithmic time instead of scanning the table; it speeds up reads at the cost of slower writes, extra storage and maintenance.',
        'Index ek auxiliary data structure hai, aam taur pe B-tree, jo column values ko rows se map karta hai taaki database table scan kiye bina logarithmic time mein data dhoondh sake; yeh reads ko fast karta hai par writes slow, extra storage aur maintenance ki keemat pe.',
      ),
      points: [
        bi('B-tree indexes support equality, ranges and ordering; hash indexes only equality.', 'B-tree indexes equality, ranges aur ordering support karte hain; hash indexes sirf equality.'),
        bi('Index selective columns used in WHERE, JOIN and ORDER BY.', 'WHERE, JOIN aur ORDER BY mein use hone wale selective columns pe index lagao.'),
        bi('Composite indexes follow the leftmost-prefix rule; covering indexes allow index-only scans.', 'Composite indexes leftmost-prefix rule follow karte hain; covering indexes index-only scan dete hain.'),
        bi('Every write updates every index — write amplification on write-heavy tables.', 'Har write har index update karta hai — write-heavy tables pe write amplification.'),
        bi('Indexes use disk and memory; unused or duplicate indexes are pure overhead.', 'Indexes disk aur memory lete hain; bina use ke ya duplicate indexes sirf bojh hain.'),
        bi('Low cardinality, functions on columns, leading wildcards and type casts prevent index use.', 'Low cardinality, column pe functions, shuru ka wildcard aur type casts index use hone se rokte hain.'),
        bi('I validate with EXPLAIN ANALYZE and the slow-query log, and build indexes concurrently in production.', 'Main EXPLAIN ANALYZE aur slow-query log se check karta hoon, aur production mein indexes concurrently banata hoon.'),
      ],
      keywords: [
        'B-tree',
        'Full table scan',
        'Selectivity / cardinality',
        'Composite index',
        'Leftmost prefix',
        'Covering index',
        'Index-only scan',
        'Write amplification',
        'Query planner',
        'EXPLAIN ANALYZE',
        'Clustered vs non-clustered index',
      ],
    },
    listenFor: [
      bi('The trade-off: faster reads, slower writes.', 'Trade-off ki samajh: fast reads, slow writes.'),
      bi('Concrete cases where an index does not help.', 'Thos cases jahan index madad nahi karta.'),
      bi('Using EXPLAIN to check instead of guessing; knowing that composite column order matters.', 'Andaaze ki jagah EXPLAIN se check karna; yeh jaanna ki composite column order maayne rakhta hai.'),
    ],
    mistakes: [
      bi('“Just index every column.”', '“Har column pe index laga do.”'),
      bi('Believing indexes are free.', 'Yeh maanna ki indexes free hain.'),
      bi('Building an index on a huge production table in a way that locks writes for minutes.', 'Badi production table pe aise index banana ki writes minutes tak lock ho jaayein.'),
    ],
    followUps: [
      {
        q: bi('What is the difference between a clustered and a non-clustered index?', 'Clustered aur non-clustered index mein kya fark hai?'),
        a: bi(
          'In a clustered index the table rows themselves are stored in index order (only one per table, e.g. the InnoDB primary key). A non-clustered index is a separate structure that points to the rows.',
          'Clustered index mein table ki rows khud index ke order mein store hoti hain (har table mein sirf ek, jaise InnoDB ki primary key). Non-clustered index ek alag structure hai jo rows ki taraf point karta hai.',
        ),
      },
      {
        q: bi('Would you index a boolean column?', 'Kya aap boolean column pe index lagaoge?'),
        a: bi(
          'Usually not — it splits the table in two, so a scan is often cheaper. If one value is rare (say is_flagged = true), a partial index on just those rows works well.',
          'Aam taur pe nahi — yeh table ko do hisson mein baant-ta hai, to scan aksar sasta padta hai. Agar ek value kam hoti ho (jaise is_flagged = true), to sirf un rows pe partial index accha kaam karta hai.',
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
    scenario: bi(
      'Nothing in the code changed — the same SQL that took 20 ms last month now takes 3 seconds. Because the query is identical, something around it must have changed: the amount or shape of the data, the plan the database chooses to run it, the indexes, the load on the server, or the environment. The interviewer wants a list of likely causes and, more importantly, how you would check each one instead of guessing.',
      'Code mein kuch nahi badla — jo SQL pichhle mahine 20 ms leti thi, ab 3 second le rahi hai. Query same hai, to uske aas-paas kuch badla hoga: data ki maatra ya shape, query chalane ke liye database ka chuna hua plan, indexes, server pe load, ya environment. Interviewer chahta hai ki aap sambhavit kaaran batao aur, usse bhi zyaada zaroori, har ek ko andaaze ki jagah kaise check karoge.',
    ),
    simple: bi(
      'If the query did not change, its surroundings did. The table grew, the database picked a different (worse) way to run the query, an index disappeared or got bloated, other work is competing for the same machine, or the query now waits on locks. You compare “before” and “after” with evidence — query plans and metrics — to find out which.',
      'Query nahi badli, to uske aas-paas kuch badla. Table badi ho gayi, database ne query chalane ka alag (bura) tareeka chun liya, koi index gayab ya phool gaya, doosra kaam same machine ke liye muqabla kar raha hai, ya query ab locks pe wait karti hai. Kaunsa kaaran hai, yeh “pehle” aur “ab” ko sabooton — query plans aur metrics — se compare karke pata karte ho.',
    ),
    example: bi(
      'Your commute took 20 minutes last month and now takes 50. The road is the same (the same query). Maybe traffic grew (more data), a flyover closed so the maps app chose a longer route (a different query plan), there is construction (maintenance), or a broken-down truck blocks a lane (locks). You check traffic reports before blaming your car.',
      'Aapka office ka safar pichhle mahine 20 minute ka tha, ab 50 ka. Sadak wahi hai (same query). Shayad traffic badh gaya (zyaada data), flyover band hua to maps app ne lamba raasta chuna (alag query plan), construction chal raha hai (maintenance), ya kharab truck ek lane rok raha hai (locks). Gaadi ko dosh dene se pehle traffic report dekhte ho.',
    ),
    partsTitle: bi('What might have changed — and how to check', 'Kya badla ho sakta hai — aur kaise check karein'),
    parts: [
      {
        title: bi('1. More data, or differently shaped data', '1. Zyaada data, ya alag shape ka data'),
        text: bi(
          'The table grew ten times, or one customer now has millions of rows (skew). A plan that was fine for 100,000 rows can be terrible for 10 million. Check table sizes and row counts over time, and whether the slow cases involve “big” customers.',
          'Table das guna badi ho gayi, ya ek customer ki ab lakhon rows hain (skew). Jo plan 1 lakh rows ke liye theek tha woh 1 crore pe bahut bura ho sakta hai. Samay ke saath table size aur row count dekho, aur kya slow cases “bade” customers ke hain.',
        ),
      },
      {
        title: bi('2. The query plan changed', '2. Query plan badal gaya'),
        text: bi(
          'The optimizer chooses a plan from table statistics. Stale statistics make it guess wrong — a sequential scan instead of the index, a bad join order, a nested loop over millions of rows. A cached plan built for one parameter value can also be bad for another. Run EXPLAIN (ANALYZE, BUFFERS) and compare estimated vs actual rows; run ANALYZE to refresh statistics; compare with history in tools like pg_stat_statements.',
          'Optimizer table statistics se plan chunta hai. Purane statistics usse galat andaaza lagwate hain — index ki jagah sequential scan, galat join order, lakhon rows pe nested loop. Ek parameter value ke liye bana cached plan doosri value ke liye bura ho sakta hai. EXPLAIN (ANALYZE, BUFFERS) chalao aur estimated vs actual rows compare karo; statistics refresh karne ke liye ANALYZE chalao; pg_stat_statements jaise tools mein history se compare karo.',
        ),
      },
      {
        title: bi('3. Index problems', '3. Index ki problems'),
        text: bi(
          'A migration dropped or renamed an index, an index build failed and left it invalid, the index is bloated, or a schema change introduced a type cast that stops the index being used.',
          'Kisi migration ne index drop ya rename kar diya, index build fail hoke invalid reh gaya, index phool gaya, ya schema change se type cast aa gaya jo index use hone se rokta hai.',
        ),
      },
      {
        title: bi('4. Bloat and maintenance', '4. Bloat aur maintenance'),
        text: bi(
          'Lots of updates and deletes leave dead rows behind (PostgreSQL needs VACUUM to clean them). If autovacuum falls behind, the table and its indexes grow and scans read far more pages than necessary.',
          'Bahut saare updates aur deletes mari hui rows chhod dete hain (PostgreSQL ko inhe saaf karne ke liye VACUUM chahiye). Autovacuum peeche reh jaaye to table aur indexes phool jaate hain aur scans zaroorat se kahin zyaada pages padhte hain.',
        ),
      },
      {
        title: bi('5. Locks and contention', '5. Locks aur contention'),
        text: bi(
          'A new batch job, a long-running transaction or a migration holds locks, so the query is waiting rather than working. Check pg_stat_activity and the lock and wait-event views while it is slow.',
          'Naya batch job, lamba chalta transaction ya migration locks pakde hue hai, to query kaam nahi, wait kar rahi hai. Slow hote waqt pg_stat_activity aur lock aur wait-event views dekho.',
        ),
      },
      {
        title: bi('6. Resource pressure', '6. Resources pe dabaav'),
        text: bi(
          'More traffic, a noisy neighbour, or a working set that no longer fits in memory (the buffer cache hit ratio drops, so reads go to disk). CPU or disk saturation, or the app waiting for a free connection from the pool, all look like a “slow query”.',
          'Zyaada traffic, shor machane wala padosi, ya working set jo ab memory mein fit nahi hota (buffer cache hit ratio girta hai, reads disk pe jaate hain). CPU ya disk saturation, ya app ka pool se free connection ka wait — sab “slow query” jaisa hi dikhta hai.',
        ),
      },
      {
        title: bi('7. The environment changed', '7. Environment badal gaya'),
        text: bi(
          'A database version upgrade, a configuration change (memory settings), a smaller instance type, reads now going to a lagging replica, or an ORM upgrade that generates different SQL.',
          'Database version upgrade, configuration change (memory settings), chhota instance type, reads ab peeche chal rahe replica pe jaana, ya ORM upgrade jo alag SQL banata hai.',
        ),
      },
      {
        title: bi('8. A systematic approach', '8. Ek systematic tareeka'),
        text: bi(
          'Find exactly when it started and line it up with deploys, migrations, data jobs and traffic. Reproduce with EXPLAIN ANALYZE and compare with an old plan. Fix the cause (statistics, index, query rewrite, partitioning or archiving old data), then add an alert on that query’s p95/p99 latency so the next regression is caught early.',
          'Bilkul kab shuru hua yeh pata karo aur use deploys, migrations, data jobs aur traffic se milao. EXPLAIN ANALYZE se reproduce karo aur purane plan se compare karo. Kaaran theek karo (statistics, index, query rewrite, partitioning ya purana data archive), phir us query ki p95/p99 latency pe alert lagao taaki agli regression jaldi pakdi jaaye.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'If the query text is unchanged, the cause is usually data growth or skew, a plan change from stale statistics, a missing or bloated index, lock contention or resource pressure — and I would confirm which one with metrics and EXPLAIN ANALYZE rather than guess.',
        'Agar query text nahi badla, to kaaran aam taur pe data growth ya skew, purane statistics se plan change, missing ya bloated index, lock contention ya resource pressure hota hai — aur kaunsa hai, yeh main andaaze ki jagah metrics aur EXPLAIN ANALYZE se confirm karunga.',
      ),
      points: [
        bi('Pinpoint when it started; correlate with deploys, migrations, batch jobs and traffic.', 'Pata karo kab shuru hua; deploys, migrations, batch jobs aur traffic se milao.'),
        bi('Data growth or skew: the same plan now touches far more rows.', 'Data growth ya skew: same plan ab kahin zyaada rows chhoota hai.'),
        bi('Plan regression from stale statistics or parameter-sensitive plans — compare estimated vs actual rows.', 'Purane statistics ya parameter-sensitive plans se plan regression — estimated vs actual rows compare karo.'),
        bi('Index issues: dropped, invalid, bloated, or unusable because of a cast or function.', 'Index issues: drop hua, invalid, bloated, ya cast/function ki wajah se use nahi ho pa raha.'),
        bi('Table bloat when vacuum and maintenance fall behind.', 'Vacuum aur maintenance peeche reh jaayein to table bloat.'),
        bi('Lock contention or long transactions — check pg_stat_activity and wait events.', 'Lock contention ya lambe transactions — pg_stat_activity aur wait events dekho.'),
        bi('Resource pressure: working set no longer fits in memory, CPU/IO saturation, connection-pool waits.', 'Resource pressure: working set memory mein fit nahi, CPU/IO saturation, connection-pool waits.'),
        bi('Fix the root cause and add alerting on query latency percentiles.', 'Root cause theek karo aur query latency percentiles pe alert lagao.'),
      ],
      keywords: [
        'Execution plan',
        'Query optimizer',
        'Table statistics',
        'EXPLAIN ANALYZE',
        'Cardinality estimate',
        'Plan regression',
        'Parameter sniffing',
        'Index bloat',
        'VACUUM / autovacuum',
        'Lock contention',
        'Buffer cache hit ratio',
        'Working set',
        'Partitioning',
      ],
    },
    listenFor: [
      bi('A structured, evidence-based investigation rather than guesses.', 'Andaazon ki jagah structured, saboot pe aadharit jaanch.'),
      bi('Understanding the query planner and table statistics.', 'Query planner aur table statistics ki samajh.'),
      bi('Considering causes outside the query itself — locks, resources, environment — and proposing prevention.', 'Query ke bahar ke kaaranon pe bhi sochna — locks, resources, environment — aur roktham ka sujhaav.'),
    ],
    mistakes: [
      bi('Jumping straight to “add an index” or “buy a bigger server”.', 'Seedha “index laga do” ya “bada server le lo” pe kood jaana.'),
      bi('Not asking when it started.', 'Yeh na poochhna ki kab shuru hua.'),
      bi('Not comparing the current plan with the old one.', 'Abhi ke plan ko purane se compare na karna.'),
    ],
    followUps: [
      {
        q: bi('What are table statistics?', 'Table statistics kya hote hain?'),
        a: bi(
          'Summaries such as row counts and histograms of value distribution. The optimizer uses them to estimate how many rows each step returns and to pick the cheapest plan.',
          'Row counts aur values ke distribution ke histograms jaisi summaries. Optimizer inse andaaza lagata hai ki har step kitni rows dega, aur sabse sasta plan chunta hai.',
        ),
      },
      {
        q: bi('The data will keep growing. What is the long-term fix?', 'Data badhta hi rahega. Long-term fix kya hai?'),
        a: bi(
          'Partition by time, archive old rows, move reporting to read replicas or a warehouse, cache hot results, and keep queries index-friendly.',
          'Time se partition karo, purani rows archive karo, reporting ko read replicas ya warehouse pe le jao, hot results cache karo, aur queries ko index-friendly rakho.',
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
    tags: ['connection pool', 'database', 'timeouts', 'latency', 'backpressure', 'pgbouncer'],
    scenario: bi(
      'Your app keeps a fixed number of open database connections — a pool, say 20 — and lends one to each request that needs the database. “Exhausted” means all 20 are busy and more requests want one. The interviewer wants to know what users would experience, why it happens (it is usually a symptom, not the root cause), and how you would fix and prevent it.',
      'Aapka app database ke kuch fixed open connections rakhta hai — ek pool, maan lo 20 — aur database chahne wali har request ko ek udhaar deta hai. “Exhausted” ka matlab hai saare 20 busy hain aur aur requests ko connection chahiye. Interviewer jaanna chahta hai ki users ko kya dikhega, yeh kyun hota hai (aam taur pe yeh lakshan hai, asli kaaran nahi), aur aap ise kaise theek karoge aur rokoge.',
    ),
    simple: bi(
      'New requests have to wait in line for a free connection. If none frees up within the pool’s wait timeout, the request fails. Users first see slow pages, then errors — and the slowdown can spread to every service that calls this one.',
      'Nayi requests ko free connection ke liye line mein wait karna padta hai. Pool ke wait timeout tak koi free na ho, to request fail. Users ko pehle slow pages dikhte hain, phir errors — aur yeh slowness un sab services tak fail sakti hai jo is service ko call karti hain.',
    ),
    example: bi(
      'A restaurant with 20 tables. Normally guests eat and leave, so tables free up. If some guests sit for hours (slow queries) or leave without telling anyone so the table stays “occupied” (connection leaks), new guests queue at the door, get tired and leave (timeouts). Adding more tables does not help if the kitchen (the database) is the slow part — it only makes the kitchen busier.',
      '20 tables wala restaurant. Normally guests khaate hain aur chale jaate hain, tables free hoti rehti hain. Agar kuch guests ghanton baithe rahein (slow queries) ya bina bataye chale jaayein aur table “occupied” hi rahe (connection leaks), to naye guests darwaze pe line lagate hain, thak ke chale jaate hain (timeouts). Agar kitchen (database) hi slow hai to zyaada tables lagane se kuch nahi hoga — kitchen aur busy ho jaayegi.',
    ),
    why: bi(
      'Pools exist because opening a database connection is expensive (network, TLS, authentication, often a whole process on the database side) and databases can only handle a limited number of connections. A pool reuses a few connections and caps the load on the database.',
      'Pool isliye hote hain kyunki database connection kholna mehnga hai (network, TLS, authentication, database side pe aksar poora process) aur database limited connections hi sambhaal sakta hai. Pool kuch connections ko baar-baar use karta hai aur database pe load ki seema tay karta hai.',
    ),
    without: bi(
      'When it is exhausted: requests block → latency climbs → threads or the event loop back up → timeouts and 500/503 errors → health checks may fail and instances restart → callers retry and add even more load. That is a cascading failure.',
      'Exhaust hone pe: requests ruk jaati hain → latency badhti hai → threads ya event loop jaam → timeouts aur 500/503 errors → health checks fail ho sakte hain aur instances restart → callers retry karke aur load badha dete hain. Yahi cascading failure hai.',
    ),
    scene: scene(
      [
        [a('users', 'Users', bi('Many requests', 'Bahut requests'))],
        [c('app-server', { state: 'bad', note: bi('pool 20/20 busy', 'pool 20/20 full') })],
        [c('sql-db', { note: bi('slow queries', 'queries slow hain') })],
      ],
      [['users!>app-server', bi('queued', 'line mein')], 'app-server>sql-db'],
      bi(
        'Every connection is busy, so new requests queue inside the app and eventually time out — even though the app server itself has spare CPU.',
        'Har connection busy hai, to nayi requests app ke andar line mein lagti hain aur aakhir mein time out — jabki app server ke paas CPU bacha hua hai.',
      ),
    ),
    partsTitle: bi('What happens, why, and how to fix it', 'Kya hota hai, kyun, aur kaise theek karein'),
    parts: [
      {
        title: bi('What happens inside', 'Andar kya hota hai'),
        text: bi(
          'A request asks the pool for a connection; none is free; it waits up to the acquire timeout (often 30 seconds by default — far too long); then it throws “timeout acquiring connection”. Meanwhile more requests pile up behind it.',
          'Request pool se connection maangti hai; koi free nahi; acquire timeout tak wait karti hai (default aksar 30 second — bahut zyaada); phir “timeout acquiring connection” error. Is beech peeche aur requests jamaa hoti jaati hain.',
        ),
      },
      {
        title: bi('Common root causes', 'Aam asli kaaran'),
        text: bi(
          'Slow queries holding connections longer (missing index, lock waits); connection leaks (a code path that never returns the connection, usually on errors); long transactions (calling an external API while a transaction is open); traffic spikes; a pool that is too small; an overloaded database; N+1 query patterns.',
          'Slow queries jo connections zyaada der pakadti hain (missing index, lock waits); connection leaks (code path jo connection kabhi wapas nahi karta, aksar error pe); lambe transactions (transaction khula rakh ke external API call karna); traffic spikes; bahut chhota pool; overloaded database; N+1 query patterns.',
        ),
      },
      {
        title: bi('Immediate mitigation', 'Turant raahat'),
        text: bi(
          'Find out what holds the connections (pool metrics: active, idle, pending; on the database: pg_stat_activity), kill runaway queries, roll back a bad deploy, shed load with rate limiting, and scale carefully — more app instances means more connections hitting the same database.',
          'Pata karo connections kisne pakde hain (pool metrics: active, idle, pending; database pe: pg_stat_activity), bekaabu queries kill karo, kharab deploy roll back karo, rate limiting se load kam karo, aur dhyaan se scale karo — zyaada app instances matlab same database pe zyaada connections.',
        ),
      },
      {
        title: bi('Lasting fixes', 'Pakke fixes'),
        text: bi(
          'Fix slow queries and indexes; always release connections (try/finally, or let the ORM manage them); keep transactions short and never make network calls inside them; set statement timeouts; size the pool from measurements — often small (a common starting point is about twice the database’s CPU cores, shared across all instances) — so the total across instances stays below the database’s max_connections; put a connection proxy such as PgBouncer or RDS Proxy in front when you have many instances or serverless functions.',
          'Slow queries aur indexes theek karo; connections hamesha release karo (try/finally, ya ORM ko sambhalne do); transactions chhote rakho aur unke andar network calls kabhi mat karo; statement timeouts set karo; pool ka size naap ke rakho — aksar chhota (shuruaat ke liye aam taur pe database ke CPU cores ka lagbhag do guna, saare instances mein baant ke) — taaki saare instances ka total database ke max_connections se kam rahe; bahut instances ya serverless functions hon to aage PgBouncer ya RDS Proxy jaisa connection proxy lagao.',
        ),
      },
      {
        title: bi('Fail fast and isolate', 'Jaldi fail karo aur alag rakho'),
        text: bi(
          'A short acquire timeout (1–2 seconds) makes requests fail quickly instead of hanging. Circuit breakers and backpressure protect callers. Separate pools (bulkheads) stop slow reporting queries from starving the checkout path.',
          'Chhota acquire timeout (1–2 second) requests ko latakne ki jagah jaldi fail karwata hai. Circuit breakers aur backpressure callers ko bachate hain. Alag pools (bulkheads) slow reporting queries ko checkout path ke connections khaane se rokte hain.',
        ),
      },
      {
        title: bi('Monitor it', 'Ise monitor karo'),
        text: bi(
          'Track pool utilisation, wait time and pending requests, turn on leak detection, and alert before the pool is full — together with database connections and query latency.',
          'Pool utilisation, wait time aur pending requests track karo, leak detection on karo, aur pool bharne se pehle alert karo — database connections aur query latency ke saath.',
        ),
      },
    ],
    interview: {
      opening: bi(
        'When the pool is exhausted, new requests block waiting for a connection and then time out, so latency spikes and errors cascade; exhaustion is usually a symptom of slow queries, leaks or long transactions, so I fix the cause, fail fast, and size the pool against the database’s limits.',
        'Pool exhaust hone pe nayi requests connection ke wait mein ruk jaati hain aur phir time out hoti hain, to latency spike aur errors cascade karte hain; exhaustion aam taur pe slow queries, leaks ya lambe transactions ka lakshan hai, isliye main kaaran theek karta hoon, fail fast karta hoon, aur pool ko database ki limits ke hisaab se size karta hoon.',
      ),
      points: [
        bi('Requests queue until the acquire timeout, then fail: p99 latency spike, 5xx errors, thread/event-loop backlog.', 'Requests acquire timeout tak line mein, phir fail: p99 latency spike, 5xx errors, thread/event-loop backlog.'),
        bi('It cascades: health checks fail, callers retry, load increases.', 'Yeh cascade karta hai: health checks fail, callers retry, load badhta hai.'),
        bi('Root causes: slow queries, connection leaks, long transactions, traffic spikes, an under-sized pool, an overloaded database.', 'Asli kaaran: slow queries, connection leaks, lambe transactions, traffic spikes, chhota pool, overloaded database.'),
        bi('Mitigate: find holders with pool metrics and pg_stat_activity, kill runaway queries, roll back, shed load.', 'Raahat: pool metrics aur pg_stat_activity se holders dhoondho, bekaabu queries kill karo, roll back, load kam karo.'),
        bi('Prevent: release in finally blocks, short transactions, statement timeouts, short acquire timeout, bulkhead pools.', 'Roktham: finally blocks mein release, chhote transactions, statement timeouts, chhota acquire timeout, bulkhead pools.'),
        bi('Size pools so instances × pool size stays below max_connections; use PgBouncer or RDS Proxy at scale.', 'Pools aise size karo ki instances × pool size max_connections se kam rahe; scale pe PgBouncer ya RDS Proxy.'),
        bi('Monitor active, idle and pending connections and wait time; enable leak detection.', 'Active, idle aur pending connections aur wait time monitor karo; leak detection on karo.'),
      ],
      keywords: [
        'Connection pool',
        'Acquire timeout',
        'Connection leak',
        'max_connections',
        'Pool sizing',
        'Long-running transaction',
        'Backpressure',
        'Fail fast',
        'Bulkhead',
        'PgBouncer / RDS Proxy',
        'Cascading failure',
        'Statement timeout',
      ],
    },
    listenFor: [
      bi('Treating exhaustion as a symptom and looking for the cause.', 'Exhaustion ko lakshan maan ke kaaran dhoondhna.'),
      bi('Mentioning connection leaks and long transactions.', 'Connection leaks aur lambe transactions ka zikr.'),
      bi('Knowing that a bigger pool is not the fix, and talking about timeouts and monitoring.', 'Yeh jaanna ki bada pool fix nahi hai, aur timeouts aur monitoring ki baat.'),
    ],
    mistakes: [
      bi('“Just raise the pool to 500” — it overloads the database and can exceed max_connections.', '“Pool 500 kar do” — isse database overload hota hai aur max_connections paar ho sakta hai.'),
      bi('Ignoring leaks.', 'Leaks ko ignore karna.'),
      bi('Leaving default 30-second timeouts so requests hang.', 'Default 30 second timeouts chhod dena jisse requests latki rehti hain.'),
    ],
    followUps: [
      {
        q: bi('Why not just make the pool huge?', 'Pool ko bahut bada hi kyun na kar dein?'),
        a: bi(
          'Each connection costs database memory and CPU. Past a point, more concurrent queries make every query slower through contention — and N instances × pool size can exceed the database’s connection limit.',
          'Har connection database ki memory aur CPU khaata hai. Ek had ke baad zyaada concurrent queries contention se har query ko slow kar deti hain — aur N instances × pool size database ki connection limit paar kar sakta hai.',
        ),
      },
      {
        q: bi('What is a connection leak?', 'Connection leak kya hai?'),
        a: bi(
          'Code that borrows a connection and never gives it back — typically when an exception skips the release. The pool slowly shrinks until it is empty.',
          'Aisa code jo connection udhaar leta hai aur kabhi wapas nahi karta — aam taur pe jab exception release ko skip kar de. Pool dheere-dheere sikudta hai jab tak khaali na ho jaaye.',
        ),
      },
    ],
    related: { components: ['sql-db', 'app-server'], challenges: ['ecommerce-checkout', 'banking-transaction-platform'] },
  },
];
