import { a, c, group, scene } from '@/features/learn/dsl';
import { actor, actorC, bi, code, explain, figure, h, inTxn, mark, msg, note, options, p, section, steps, table, timeline, ul } from '../dsl';
import type { PrepQuestion } from '../types';

/** System design → Messaging & async: reliable events between services. */
export const messagingQuestions: PrepQuestion[] = [
  {
    id: 'transactional-outbox-pattern',
    category: 'system-design',
    topic: 'messaging',
    question: bi(
      'What is the Transactional Outbox pattern? What problem does it solve, and how does it work?',
      'Transactional Outbox pattern kya hai? Ye kaunsi problem solve karta hai, aur kaise kaam karta hai?',
    ),
    kind: 'concept',
    level: 'advanced',
    tags: ['outbox', 'transactional outbox', 'dual write', 'message relay', 'polling publisher', 'cdc', 'debezium', 'at-least-once', 'idempotent consumer', 'inbox pattern', 'kafka', 'rabbitmq', 'sqs', 'event-driven', 'microservices'],
    answer: bi(
      'It solves the **dual-write problem**: a service must save data in its database and also publish an event, and if it crashes or the broker fails between those two writes, they go out of sync. So I never publish directly. I save the business row and an event row in an `outbox` table in the **same database transaction** — both or neither — and a separate **relay** publishes pending rows to the broker, retrying until it succeeds. Delivery is at-least-once, so consumers must be idempotent.',
      'Ye **dual-write problem** solve karta hai: service ko database mein data save karna hai aur event bhi publish karna hai, aur agar in do writes ke beech crash ho ya broker fail ho, to dono out of sync ho jaate hain. Isliye main seedha publish nahi karta. Business row aur ek event row (`outbox` table mein) **same database transaction** mein save karta hoon — dono ya koi nahi — aur ek alag **relay** pending rows ko broker pe publish karta hai, success tak retry karte hue. Delivery at-least-once hoti hai, isliye consumers idempotent hone chahiye.',
    ),
    sections: [
      section(
        'The problem: one action, two writes',
        'Problem: ek kaam, do jagah likhna',
        p(
          'Take an expense app. When a user saves an expense, two things must happen: the expense is saved in PostgreSQL, and an `expense.created` event goes to a queue so the Notification service can send “₹450 added to Goa trip”. The obvious code writes to two systems, one after the other:',
          'Ek expense app lo. User expense save kare to do kaam hone chahiye: expense PostgreSQL mein save ho, aur ek `expense.created` event queue mein jaaye taaki Notification service “₹450 Goa trip mein add hua” bhej sake. Seedha code do systems mein ek ke baad ek likhta hai:',
        ),
        code(
          'ts',
          `
// POST /expenses — looks fine, but has a hidden bug
async function createExpense(input: CreateExpenseDto) {
  const expense = await db.expenses.insert(input);   // write #1: the database

  await queue.publish('expense.created', {             // write #2: the queue
    expenseId: expense.id,
    userId: expense.userId,
    amount: expense.amount,
  });

  return expense;
}`,
          'expense.service.ts — the naive version',
        ),
        figure(
          scene(
            [
              [a('user', 'User', 'User')],
              [c('app-server', { id: 'api', label: 'Expense API' })],
              [
                c('sql-db', { id: 'db', label: 'Database', state: 'good', note: bi('expense saved', 'expense save hua') }),
                c('message-queue', { id: 'queue', label: 'Queue', state: 'bad', note: bi('full or down', 'full ya down') }),
              ],
              [c('notification-service', { id: 'notif', state: 'muted', note: bi('never hears', 'kabhi pata nahi') })],
            ],
            ['user>api', 'api>db', 'api!>queue', 'queue.>notif'],
            bi(
              'Write #1 worked, write #2 failed: the expense is saved but its notification is lost — and nobody even knows.',
              'Write #1 chala, write #2 fail: expense save ho gaya par uski notification kho gayi — aur kisi ko pata bhi nahi chala.',
            ),
          ),
          'before',
        ),
        table(
          [bi('Order of the writes', 'Writes ka order'), bi('Failure in between', 'Beech mein failure'), bi('Result', 'Nateeja')],
          [
            [
              bi('Save, then publish', 'Pehle save, phir publish'),
              bi('The app crashes, or the queue is full or down', 'App crash ho, ya queue full ya down ho'),
              bi('Expense saved, **event lost** — no notification, ever', 'Expense save, **event lost** — notification kabhi nahi'),
            ],
            [
              bi('Publish, then save', 'Pehle publish, phir save'),
              bi('The database insert fails (validation, deadlock)', 'Database insert fail ho (validation, deadlock)'),
              bi('**Ghost event** — “₹450 added” for an expense that does not exist', '**Ghost event** — aise expense ka “₹450 add hua” jo exist hi nahi karta'),
            ],
            [
              bi('Publish inside the transaction, before COMMIT', 'Transaction ke andar, COMMIT se pehle publish'),
              bi('COMMIT fails, so the transaction is rolled back', 'COMMIT fail, to transaction rollback'),
              bi('Ghost event again', 'Phir se ghost event'),
            ],
          ],
        ),
        note(
          'important',
          'A database transaction protects only that database. The queue is a different system, so no `BEGIN … COMMIT` can make “save + publish” all-or-nothing. This gap is called the **dual-write problem**, and retrying in code does not fix it — the process itself can crash.',
          'Database transaction sirf usi database ko protect karta hai. Queue alag system hai, isliye koi `BEGIN … COMMIT` “save + publish” ko all-or-nothing nahi bana sakta. Is gap ko **dual-write problem** kehte hain, aur code mein retry lagane se ye theek nahi hota — process khud crash ho sakta hai.',
        ),
      ),

      section(
        'The idea in two pictures',
        'Idea do tasveeron mein',
        note(
          'example',
          'Your email app’s **Outbox**. You press Send inside a metro tunnel with no network. The mail is not lost and you do not wait — it sits in the Outbox. When the network comes back, the phone sends it by itself. The transactional outbox works the same way: save the message safely on your side first, deliver it when the other side is ready.',
          'Aapke email app ka **Outbox**. Metro tunnel mein network nahi hai aur aapne Send dabaya. Mail na khoya, na aapko wait karna pada — woh Outbox mein baith gaya. Network aate hi phone khud bhej deta hai. Transactional outbox bilkul aise hi kaam karta hai: message pehle apni taraf safe save karo, doosri side ready ho tab deliver karo.',
        ),
        p(
          'Instead of calling the queue, the API writes **two rows in one transaction**: the expense, and a message describing it in an `outbox` table. That is a normal local transaction, so it is truly all-or-nothing.',
          'Queue ko call karne ki jagah API **ek transaction mein do rows** likhti hai: expense, aur `outbox` table mein uske baare mein ek message. Ye normal local transaction hai, isliye sach mein all-or-nothing hai.',
        ),
        figure(
          scene(
            [
              [a('user', 'User', 'User')],
              [c('app-server', { id: 'api', label: 'Expense API' })],
              [a('expenses', 'Table', 'expenses table', { accent: 'sky' }), a('outbox', 'Inbox', 'outbox table', { accent: 'amber', state: 'focus', note: 'status: PENDING' })],
            ],
            ['user>api', ['api>expenses', 'INSERT'], ['api>outbox', 'INSERT']],
            bi(
              'Step 1 — the API writes both rows in ONE database transaction: both are saved, or neither is. It never talks to the queue.',
              'Step 1 — API dono rows EK database transaction mein likhti hai: dono save hongi, ya koi nahi. Ye queue se baat hi nahi karti.',
            ),
            [group(['expenses', 'outbox'], bi('one transaction', 'ek transaction'), 'good')],
          ),
          'after',
        ),
        p(
          'Then a small background process — the **message relay** — moves messages from the outbox to the queue, at its own pace:',
          'Phir ek chhota background process — **message relay** — outbox se messages queue tak le jaata hai, apni speed se:',
        ),
        figure(
          scene(
            [
              [a('outbox', 'Inbox', 'outbox table', { accent: 'amber', note: 'PENDING → SENT' })],
              [c('background-worker', { id: 'relay', label: 'Relay', state: 'focus', note: bi('every second', 'har second') })],
              [c('message-queue', { id: 'queue', label: 'Queue' })],
              [c('notification-service', { id: 'notif', note: bi('sends the push', 'push bhejti hai') })],
            ],
            ['outbox<>relay', ['relay~>queue', 'publish'], 'queue~>notif'],
            bi(
              'Step 2 — the relay picks up PENDING rows, publishes them and marks them SENT. If publishing fails, the row simply stays PENDING and is tried again later.',
              'Step 2 — relay PENDING rows uthaata hai, publish karta hai aur SENT mark karta hai. Publish fail ho to row bas PENDING rehti hai aur baad mein phir try hoti hai.',
            ),
          ),
          'after',
        ),
      ),

      section(
        'How it works, step by step',
        'Kaise kaam karta hai, step by step',
        steps(
          [
            'Write both rows in one transaction',
            'Dono rows ek transaction mein likho',
            'Inside one `BEGIN … COMMIT`, insert the expense and an outbox row: event type, payload and `status = PENDING`.',
            'Ek `BEGIN … COMMIT` ke andar expense aur ek outbox row insert karo: event type, payload aur `status = PENDING`.',
          ],
          [
            'Commit and reply',
            'Commit karo aur jawab do',
            'If the commit succeeds, both rows exist; if anything fails, both are rolled back. The user gets “Expense saved” straight away — the queue was never involved.',
            'Commit successful ho to dono rows exist karti hain; kuch bhi fail ho to dono rollback. User ko turant “Expense saved” milta hai — queue beech mein thi hi nahi.',
          ],
          [
            'The relay picks up pending rows',
            'Relay pending rows uthaata hai',
            'A background worker (or a CDC connector) reads rows with `status = PENDING`, oldest first, and publishes each one to the broker.',
            'Ek background worker (ya CDC connector) `status = PENDING` wali rows padhta hai, sabse purani pehle, aur har ek ko broker pe publish karta hai.',
          ],
          [
            'Mark as sent — only after the broker confirms',
            'Broker confirm kare, tabhi SENT mark karo',
            'When the broker acknowledges the message, the relay sets `status = SENT`. If publishing fails, the row stays PENDING and is retried later with backoff.',
            'Broker message acknowledge kare tab relay `status = SENT` karta hai. Publish fail ho to row PENDING rehti hai aur baad mein backoff ke saath retry hoti hai.',
          ],
        ),
        h('The outbox table', 'Outbox table'),
        code(
          'sql',
          `
CREATE TABLE outbox (
  id            UUID PRIMARY KEY,                  -- also the event id consumers dedupe on
  aggregate_id  UUID        NOT NULL,              -- which expense / order it is about
  event_type    TEXT        NOT NULL,              -- 'expense.created'
  payload       JSONB       NOT NULL,              -- what consumers need
  status        TEXT        NOT NULL DEFAULT 'PENDING',   -- PENDING | SENT | FAILED
  attempts      INT         NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at       TIMESTAMPTZ
);

-- the relay only ever looks for pending rows that are due
CREATE INDEX outbox_pending ON outbox (next_retry_at) WHERE status = 'PENDING';`,
        ),
        h('Write side: one transaction', 'Write side: ek transaction'),
        code(
          'ts',
          `
// POST /expenses — both rows, one transaction
async function createExpense(input: CreateExpenseDto) {
  return db.transaction(async (tx) => {
    const expense = await tx.expenses.insert(input);

    await tx.outbox.insert({
      id: randomUUID(),
      aggregateId: expense.id,
      eventType: 'expense.created',
      payload: { expenseId: expense.id, userId: expense.userId, amount: expense.amount },
    });

    return expense; // COMMIT happens here: both rows are saved, or neither
  });
}`,
          'expense.service.ts — with an outbox',
        ),
        h('Relay side: publish, then mark', 'Relay side: pehle publish, phir mark'),
        code(
          'ts',
          `
// outbox-relay.ts — runs every second
async function relayOnce() {
  await db.transaction(async (tx) => {
    const rows = await tx.query(\`
      SELECT * FROM outbox
      WHERE status = 'PENDING' AND next_retry_at <= now()
      ORDER BY created_at
      LIMIT 100
      FOR UPDATE SKIP LOCKED\`);              // two relays never grab the same row

    for (const row of rows) {
      try {
        await broker.publish(row.event_type, row.payload, { messageId: row.id });
        await tx.query(\`UPDATE outbox SET status = 'SENT', sent_at = now() WHERE id = $1\`, [row.id]);
      } catch {
        const attempts = row.attempts + 1;
        const waitSeconds = Math.min(2 ** attempts, 300);    // 2 s, 4 s, 8 s … max 5 min
        await tx.query(
          \`UPDATE outbox
           SET attempts = $2,
               next_retry_at = now() + $3 * interval '1 second',
               status = CASE WHEN $2 >= 10 THEN 'FAILED' ELSE 'PENDING' END
           WHERE id = $1\`,
          [row.id, attempts, waitSeconds],
        );
      }
    }
  });
}`,
        ),
        table(
          ['id', 'event_type', 'status', 'attempts', bi('What happened', 'Kya hua')],
          [
            ['a1', 'expense.created', 'SENT', '0', bi('Published on the first try', 'Pehli koshish mein publish')],
            ['b7', 'expense.created', 'PENDING', '3', bi('Queue full — next try in 8 s', 'Queue full — agli koshish 8 s mein')],
            ['c2', 'expense.deleted', 'FAILED', '10', bi('Gave up after 10 tries; an alert fired and someone investigates', '10 koshishon ke baad chhoda; alert gaya aur koi jaanch karega')],
          ],
        ),
      ),

      section(
        'Your scenario: “the queue is full — what happens?”',
        'Aapka scenario: “queue full hai — ab kya hoga?”',
        p(
          'This is the question that confuses most people: the expense is saved, but the queue is full. Does the save fail? Is the notification lost? Neither. Walk through it:',
          'Yahi sawaal sabse zyaada confuse karta hai: expense save ho gaya, par queue full hai. Kya save fail hoga? Kya notification kho jaayegi? Dono nahi. Step by step dekho:',
        ),
        figure(
          scene(
            [
              [a('outbox', 'Inbox', 'outbox table', { accent: 'amber', note: 'row safe · PENDING' })],
              [c('background-worker', { id: 'relay', label: 'Relay', state: 'focus', note: bi('retry in 8 s', '8 s mein retry') })],
              [c('message-queue', { id: 'queue', label: 'Queue', state: 'bad', note: bi('full', 'full hai') })],
              [c('notification-service', { id: 'notif', state: 'muted', note: bi('gets it later', 'baad mein milega') })],
            ],
            ['outbox>relay', ['relay!>queue', bi('rejected', 'mana kiya')], 'queue.>notif'],
            bi(
              'A full queue stops only the relay. The expense is already saved, and the message waits safely in the outbox until the queue has room.',
              'Full queue sirf relay ko rokti hai. Expense pehle hi save hai, aur message outbox mein safe wait karta hai jab tak queue mein jagah na ho.',
            ),
          ),
        ),
        timeline(
          [
            actor('user', 'User', 'User'),
            actorC('app-server', { id: 'api', label: 'Expense API' }),
            actorC('sql-db', { id: 'db', label: 'Database' }),
            actorC('background-worker', { id: 'relay', label: 'Relay' }),
            actorC('message-queue', { id: 'queue', label: 'Queue' }),
            actorC('notification-service', { id: 'notif' }),
          ],
          [
            msg('user>api', 'POST /expenses (₹450)', explain('The user taps **Save** on a ₹450 expense.', 'User ne ₹450 ke expense pe **Save** dabaya.')),
            inTxn(
              bi('one transaction', 'ek transaction'),
              'good',
              msg('api>db', 'INSERT expense', explain('Row #1: the expense itself.', 'Row #1: khud expense.')),
              msg('api>db', 'INSERT outbox · PENDING', explain('Row #2: the message to send later — `expense.created`, with status **PENDING**.', 'Row #2: baad mein bhejne wala message — `expense.created`, status **PENDING** ke saath.')),
              msg('api>db', 'COMMIT ✓', explain('Both rows are saved together. Had anything failed, neither row would exist.', 'Dono rows ek saath save. Kuch bhi fail hota to koi bhi row exist nahi karti.')),
            ),
            msg(
              'api.>user',
              '201 · Expense saved',
              explain(
                'The user is done in milliseconds. The API never touched the queue, so a full queue **cannot** fail this request.',
                'User ka kaam milliseconds mein ho gaya. API ne queue ko chhua hi nahi, isliye full queue is request ko fail **nahi** kar sakti.',
              ),
            ),
            msg('relay>db', 'fetch PENDING rows', explain('Every second the relay asks the database for pending rows — and finds ours.', 'Har second relay database se pending rows maangta hai — aur hamari row mil jaati hai.')),
            msg(
              'relay!>queue',
              'publish ✗ queue full',
              explain(
                'The broker refuses the message because the queue is full. Nothing is lost: the row is still safe in the database.',
                'Queue full hai isliye broker message mana kar deta hai. Kuch nahi khoya: row database mein safe hai.',
              ),
            ),
            mark(
              ['db', 'relay'],
              bi('row stays PENDING · retry in 2 s, 4 s, 8 s…', 'row PENDING hi rehti hai · retry 2 s, 4 s, 8 s… mein'),
              'wait',
              explain(
                'The relay saves `attempts = 1` and the next retry time, then moves on. Waiting longer after each failure (**exponential backoff**) avoids hammering a queue that is already struggling.',
                'Relay `attempts = 1` aur agla retry time save karke aage badhta hai. Har failure ke baad zyaada wait karna (**exponential backoff**) pehle se pareshaan queue pe load nahi badhata.',
              ),
            ),
            mark(
              ['queue', 'notif'],
              bi('consumers catch up · space frees up', 'consumers kaam nipta-te hain · jagah khaali'),
              'good',
              explain('The Notification service works through the backlog, so the queue has room again.', 'Notification service backlog nipta-ti hai, to queue mein phir jagah ho jaati hai.'),
            ),
            msg('relay>queue', 'publish ✓', explain('The next retry goes through and the broker confirms it.', 'Agla retry chal jaata hai aur broker confirm karta hai.')),
            msg('relay>db', 'mark SENT', explain('Only **after** the broker confirms is the row marked SENT — so it will not be sent again.', 'Broker ke confirm karne ke **baad** hi row SENT mark hoti hai — taaki dobara na jaaye.')),
            msg('queue~>notif', 'expense.created', explain('The Notification service receives the event…', 'Notification service ko event milta hai…')),
            msg(
              'notif~>user',
              'push: ₹450 added',
              explain('…and the user gets the push notification. A bit late, but never lost — and the save never failed.', '…aur user ko push notification milti hai. Thodi der se, par kabhi khoti nahi — aur save kabhi fail nahi hua.'),
            ),
          ],
          bi(
            'Your scenario, step by step: a full queue only delays the notification. It cannot lose it, and it cannot fail the save.',
            'Aapka scenario, step by step: full queue sirf notification ko late karti hai. Na use kho sakti hai, na save ko fail kar sakti hai.',
          ),
        ),
        table(
          [bi('Who', 'Kaun'), bi('What they notice', 'Unhe kya dikhta hai')],
          [
            ['User', bi('“Expense saved” instantly; the notification arrives a little late (seconds or minutes).', 'Turant “Expense saved”; notification thodi der se aati hai (seconds ya minutes).')],
            ['Expense API', bi('Nothing — it only talks to its own database.', 'Kuch nahi — ye sirf apne database se baat karti hai.')],
            ['Relay', bi('Publish errors; it retries with backoff.', 'Publish errors; backoff ke saath retry karta hai.')],
            ['Notification service', bi('Nothing unusual — it simply receives the event later.', 'Kuch alag nahi — use event bas baad mein milta hai.')],
            [bi('On-call engineer', 'On-call engineer (duty wala)'), bi('An alert if the oldest PENDING row is older than, say, 5 minutes.', 'Alert, agar sabse purani PENDING row maan lo 5 minute se purani ho.')],
          ],
        ),
        h('And if the queue never recovers?', 'Aur agar queue theek hi na ho?'),
        ul(
          [
            'Rows keep piling up as PENDING — the database is now your safe buffer. The table grows, so watch disk space.',
            'Rows PENDING ke roop mein jama hoti rehti hain — ab database hi aapka safe buffer hai. Table badhti hai, isliye disk space pe nazar rakho.',
          ],
          [
            'After N attempts (say 10) mark the row FAILED and alert, so one bad message cannot block the rest — the outbox’s own dead-letter queue.',
            'N koshishon (maan lo 10) ke baad row FAILED mark karo aur alert bhejo, taaki ek kharab message baaki sabko na roke — outbox ki apni dead-letter queue.',
          ],
          [
            'Alert on **outbox lag** — the age of the oldest PENDING row. It is the single best health signal for this pattern.',
            '**Outbox lag** pe alert lagao — sabse purani PENDING row ki umar. Is pattern ki health ka sabse accha signal yahi hai.',
          ],
          [
            'Once the queue is fixed, the relay drains the backlog on its own. FAILED rows can be reset to PENDING after the cause is fixed.',
            'Queue theek hote hi relay khud backlog nipta deta hai. Wajah theek hone ke baad FAILED rows ko wapas PENDING kiya ja sakta hai.',
          ],
        ),
        h('Is this understanding right?', 'Kya ye samajh sahi hai?'),
        table(
          [bi('What people often think', 'Log aksar kya sochte hain'), bi('Right?', 'Sahi?'), bi('What really happens', 'Asal mein kya hota hai')],
          [
            [
              bi('The expense and the notification event are saved together in the database.', 'Expense aur notification event database mein ek saath save hote hain.'),
              bi('✓\u00a0Right', '✓\u00a0Sahi'),
              bi('Same transaction: both rows or neither.', 'Same transaction: dono rows ya koi nahi.'),
            ],
            [
              bi('If the queue is full, saving the expense fails.', 'Queue full ho to expense save fail ho jaata hai.'),
              bi('✗\u00a0Wrong', '✗\u00a0Galat'),
              bi('The API never talks to the queue. Only the relay sees the failure, and it retries.', 'API queue se baat hi nahi karti. Failure sirf relay ko dikhta hai, aur woh retry karta hai.'),
            ],
            [
              bi('The Notification service fails.', 'Notification service fail ho jaati hai.'),
              bi('✗\u00a0Wrong', '✗\u00a0Galat'),
              bi('It has not received anything yet. It simply gets the event later.', 'Use abhi tak kuch mila hi nahi. Event bas baad mein milta hai.'),
            ],
            [
              bi('The outbox gives exactly-once delivery.', 'Outbox exactly-once delivery deta hai.'),
              bi('✗\u00a0Wrong', '✗\u00a0Galat'),
              bi('At-least-once: a message can arrive twice, so consumers must skip duplicates (part 5).', 'At-least-once: message do baar aa sakta hai, isliye consumers ko duplicates skip karne padte hain (part 5).'),
            ],
            [
              bi('The relay can delete the row as soon as it reads it.', 'Relay row padhte hi delete kar sakta hai.'),
              bi('✗\u00a0Wrong', '✗\u00a0Galat'),
              bi('Only after the broker confirms. Deleting first would lose the message if publishing fails.', 'Sirf broker ke confirm karne ke baad. Pehle delete kiya aur publish fail hua to message kho jaayega.'),
            ],
          ],
        ),
      ),

      section(
        'At-least-once: why duplicates happen, and how consumers handle them',
        'At-least-once: duplicates kyun aate hain, aur consumers unhe kaise sambhaalte hain',
        p(
          'There is one gap the outbox cannot close: the relay publishes a message and crashes **before** it marks the row SENT. When it restarts, the row is still PENDING, so it publishes it again. Losing a message is now impossible — but receiving one twice is possible.',
          'Ek gap outbox band nahi kar sakta: relay message publish karta hai aur row SENT mark karne se **pehle** crash ho jaata hai. Restart pe row abhi bhi PENDING hai, to woh use dobara publish karta hai. Message khona ab namumkin hai — par do baar milna mumkin hai.',
        ),
        timeline(
          [actorC('background-worker', { id: 'relay', label: 'Relay' }), actorC('sql-db', { id: 'db', label: 'Database' }), actorC('message-queue', { id: 'queue', label: 'Queue' }), actorC('notification-service', { id: 'notif' })],
          [
            msg('relay>db', 'fetch row b7 (PENDING)', explain('The relay picks up message b7.', 'Relay message b7 uthaata hai.')),
            msg('relay>queue', 'publish b7 ✓', explain('The broker accepts it.', 'Broker use accept kar leta hai.')),
            msg('queue~>notif', 'b7 → push sent', explain('The Notification service handles b7 and sends the push.', 'Notification service b7 handle karke push bhej deti hai.')),
            mark(
              ['relay'],
              bi('crash before “mark SENT”', '“mark SENT” se pehle crash'),
              'bad',
              explain('The relay dies (a deploy, out of memory) before it can run the UPDATE.', 'UPDATE chalane se pehle relay mar jaata hai (deploy, memory khatam).'),
            ),
            msg('relay>db', 'restart: b7 still PENDING', explain('After the restart, the database still says b7 is PENDING.', 'Restart ke baad database abhi bhi kehta hai b7 PENDING hai.')),
            msg('relay>queue', 'publish b7 again', explain('So the relay publishes it a second time.', 'To relay use doosri baar publish karta hai.')),
            msg('queue~>notif', 'b7 again', explain('The same message arrives twice.', 'Same message do baar pahunchta hai.')),
            mark(
              ['notif'],
              bi('seen b7 → skip', 'b7 dekh liya → skip'),
              'good',
              explain('An idempotent consumer remembers the ids it has handled and ignores the duplicate — the user gets one push, not two.', 'Idempotent consumer handle kiye gaye ids yaad rakhta hai aur duplicate ignore karta hai — user ko ek push milti hai, do nahi.'),
            ),
          ],
          bi(
            'A crash between “publish” and “mark SENT” sends the same message twice. The consumer must recognise it and skip it.',
            '“Publish” aur “mark SENT” ke beech crash = same message do baar. Consumer ko use pehchaan ke skip karna hoga.',
          ),
        ),
        h('Make the consumer idempotent (the inbox pattern)', 'Consumer ko idempotent banao (inbox pattern)'),
        code(
          'ts',
          `
// Notification service — handle each message id only once
broker.subscribe('expense.created', async (msg) => {
  await db.transaction(async (tx) => {
    // processed_messages has PRIMARY KEY (message_id)
    const res = await tx.query(
      'INSERT INTO processed_messages (message_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [msg.id],
    );
    if (res.rowCount === 0) return;                     // seen before → skip the duplicate

    await tx.notifications.insert({                      // the real work, same transaction
      userId: msg.payload.userId,
      text: \`₹\${msg.payload.amount} added to your expenses\`,
    });
  }); // if anything throws, both are rolled back and the message is retried
});`,
        ),
        ul(
          [
            'Record the message id **in the same transaction** as the work. Recording it first and working after could mark a message “done” that never was.',
            'Message id ko kaam ke saath **same transaction** mein record karo. Pehle record aur baad mein kaam kiya to aisa message “done” ho sakta hai jo hua hi nahi.',
          ],
          [
            'Calling an outside API (push provider, payment gateway)? Pass the message id as its **idempotency key**.',
            'Bahar ki API call kar rahe ho (push provider, payment gateway)? Message id ko uski **idempotency key** banake bhejo.',
          ],
          [
            'Some work is naturally safe to repeat: `UPDATE … SET status = PAID` or an upsert gives the same result twice.',
            'Kuch kaam khud hi repeat karne pe safe hote hain: `UPDATE … SET status = PAID` ya upsert do baar bhi same result deta hai.',
          ],
        ),
      ),

      section(
        'Two ways to build the relay',
        'Relay banane ke do tareeke',
        options(
          {
            title: 'Polling publisher',
            badge: bi('Start here', 'Yahin se shuru'),
            text: bi(
              'A worker runs a query every second or so for PENDING rows. Simple, works with any SQL database, easy to debug. Costs: a little polling load and up to about a second of delay.',
              'Ek worker har second ke aas-paas PENDING rows ki query chalata hai. Simple, kisi bhi SQL database ke saath chalta hai, debug karna aasaan. Kharcha: thoda polling load aur lagbhag ek second tak ka delay.',
            ),
            code: `
SELECT * FROM outbox
WHERE status = 'PENDING'
ORDER BY created_at
LIMIT 100
FOR UPDATE SKIP LOCKED;`,
            lang: 'sql',
          },
          {
            title: 'Transaction log tailing (CDC)',
            text: bi(
              'A connector such as **Debezium** reads the database’s own change log (PostgreSQL **WAL**, MySQL **binlog**) and streams new outbox rows to Kafka within milliseconds — no polling queries. Costs: Kafka Connect and Debezium to run and operate.',
              '**Debezium** jaisa connector database ka apna change log (PostgreSQL **WAL**, MySQL **binlog**) padhta hai aur naye outbox rows milliseconds mein Kafka tak stream karta hai — koi polling query nahi. Kharcha: Kafka Connect aur Debezium chalane aur sambhaalne padte hain.',
            ),
            code: `
{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "table.include.list": "public.outbox",
  "transforms": "outbox",
  "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter"
}`,
            lang: 'json',
          },
        ),
        table(
          ['', 'Polling publisher', 'CDC (log tailing)'],
          [
            [bi('Delay', 'Delay (deri)'), bi('Up to the poll interval (about 0.5–2 s)', 'Poll interval tak (lagbhag 0.5–2 s)'), bi('Milliseconds', 'Kuch milliseconds')],
            [bi('Extra database load', 'Database pe extra load'), bi('A small query every second', 'Har second ek chhoti query'), bi('Reads the log — almost none', 'Log padhta hai — lagbhag zero')],
            [bi('What you run', 'Kya chalana padta hai'), bi('One worker in your app', 'App mein ek worker'), 'Debezium + Kafka Connect'],
            ['Ordering', bi('By `created_at` / id', '`created_at` / id ke order se'), bi('Commit order, from the log', 'Log se commit order')],
            [bi('Best for', 'Kiske liye best'), bi('Most apps — start here', 'Zyaadatar apps — yahin se shuru'), bi('High volume, low latency, teams already on Kafka', 'High volume, low latency, jo teams pehle se Kafka pe hain')],
          ],
        ),
        note(
          'tip',
          'Not on SQL? **MongoDB:** write the document and the outbox entry in one multi-document transaction (needs a replica set), then publish with a poller or **change streams**. **DynamoDB:** write both items with `TransactWriteItems`, and use **DynamoDB Streams** as the relay.',
          'SQL nahi hai? **MongoDB:** document aur outbox entry ek multi-document transaction mein likho (replica set chahiye), phir poller ya **change streams** se publish karo. **DynamoDB:** dono items `TransactWriteItems` se likho, aur **DynamoDB Streams** ko relay banao.',
        ),
      ),

      section(
        'Where it is used',
        'Kahan use hota hai',
        table(
          ['Domain', bi('Action A — saved in the database', 'Action A — database mein save'), bi('Event B — must follow', 'Event B — hona hi chahiye'), bi('Who listens', 'Kaun sunta hai')],
          [
            [bi('Expense app (our example)', 'Expense app (hamara example)'), bi('Expense saved', 'Expense save hua'), 'expense.created', bi('Notifications, budget alerts, monthly report', 'Notifications, budget alerts, mahine ki report')],
            ['E-commerce', bi('Order placed', 'Order place hua'), 'order.placed', bi('Inventory, payment, “Order confirmed” SMS / email, shipping', 'Inventory (stock kam karo), payment, “Order confirmed” SMS / email, shipping')],
            ['Banking, fintech', bi('Money transferred', 'Paise transfer hue'), 'transfer.completed', bi('Audit log, fraud checks, cashback and reward points', 'Audit log, fraud ki jaanch, cashback aur reward points')],
            [bi('Sign-up', 'Sign-up (registration)'), bi('User registered', 'User register hua'), 'user.registered', bi('Welcome email, analytics, search index', 'Welcome email, analytics, search index mein daalna')],
            ['CQRS', bi('Write database updated (PostgreSQL)', 'Write database update hua (PostgreSQL)'), 'product.updated', bi('Read model kept in sync (Elasticsearch, Redis)', 'Read model sync rehta hai (Elasticsearch, Redis)')],
            [bi('Social media, CMS', 'Social media, CMS (blog)'), bi('Post published', 'Post publish hui'), 'post.published', bi('Followers’ feeds, push notifications, CDN cache invalidation', 'Followers ki feeds, push notifications, CDN cache saaf karna')],
            [bi('Microservices saga', 'Microservices saga (lambi process)'), bi('One saga step done', 'Saga ka ek step pura'), 'payment.succeeded', bi('The next service in the saga', 'Saga ki agli service')],
          ],
        ),
        note(
          'important',
          '**Rule of thumb:** if “B must happen whenever A is saved”, and A and B live in different systems (database + queue, database + email, database + another service), use an outbox. If losing B now and then is fine — a click-tracking event — fire-and-forget is enough.',
          '**Rule of thumb:** agar “jab bhi A save ho, B hona hi chahiye”, aur A aur B alag systems mein hain (database + queue, database + email, database + doosri service), to outbox use karo. Agar kabhi-kabhi B kho jaaye to chalta hai — jaise click-tracking event — to fire-and-forget kaafi hai.',
        ),
      ),

      section(
        'Production checklist and trade-offs',
        'Production checklist aur trade-offs',
        ul(
          [
            '**Index the pending rows** (a partial index `WHERE status = PENDING`) so the relay query stays fast as the table grows.',
            '**Pending rows pe index** lagao (partial index `WHERE status = PENDING`) taaki table badhne pe bhi relay ki query fast rahe.',
          ],
          [
            '**Several relay instances?** Use `FOR UPDATE SKIP LOCKED`, or a single elected leader, so two relays never publish the same row.',
            '**Kai relay instances?** `FOR UPDATE SKIP LOCKED` ya ek elected leader use karo, taaki do relays same row publish na karein.',
          ],
          [
            '**Order per entity:** publish oldest first, use the expense or order id as the Kafka **partition key**, and if one row of an entity fails, hold back that entity’s later rows.',
            '**Har entity ka order:** sabse purana pehle publish karo, expense ya order id ko Kafka ki **partition key** banao, aur kisi entity ki ek row fail ho to us entity ki baad wali rows roko.',
          ],
          [
            '**Retries with backoff and a limit:** after N attempts mark the row FAILED and alert, so a poison message does not loop forever.',
            '**Backoff aur limit ke saath retries:** N koshishon ke baad row FAILED mark karo aur alert bhejo, taaki poison message hamesha loop na kare.',
          ],
          [
            '**Monitor:** outbox lag (age of the oldest PENDING row), the number of PENDING rows, and the FAILED count.',
            '**Monitor karo:** outbox lag (sabse purani PENDING row ki umar), PENDING rows ki ginti, aur FAILED count.',
          ],
          [
            '**Clean up:** delete or archive SENT rows after a few days — a nightly cron job, or partition the table by day and drop old partitions. Otherwise the table bloats.',
            '**Safai:** SENT rows ko kuch din baad delete ya archive karo — raat ka cron job, ya table ko din ke hisaab se partition karke purane partitions drop karo. Warna table phool jaati hai.',
          ],
          [
            '**Events are a contract:** include an event id, type, version and timestamp; keep the payload small and backward compatible.',
            '**Events ek contract hain:** event id, type, version aur timestamp rakho; payload chhota aur backward compatible rakho.',
          ],
          [
            '**Keep the transaction short:** only insert the outbox row inside it — never call the broker or an outside API from inside the transaction.',
            '**Transaction chhota rakho:** uske andar sirf outbox row insert karo — transaction ke andar se broker ya bahar ki API kabhi call mat karo.',
          ],
        ),
        table(
          [bi('What you get', 'Kya milta hai'), bi('What it costs', 'Kya kharcha hai')],
          [
            [bi('No lost events and no ghost events', 'Na events khote hain, na ghost events'), bi('An extra table, a relay and monitoring to run', 'Ek extra table, relay aur monitoring chalani padti hai')],
            [bi('The API keeps working while the broker is down', 'Broker down ho tab bhi API chalti rehti hai'), bi('A small delay before others see the event (eventual consistency)', 'Doosron tak event pahunchne mein thoda delay (eventual consistency)')],
            [bi('No distributed transaction (2PC) needed', 'Distributed transaction (2PC) ki zaroorat nahi'), bi('Duplicates are possible, so consumers must be idempotent', 'Duplicates ho sakte hain, isliye consumers idempotent hone chahiye')],
            [bi('Works with any broker (Kafka, RabbitMQ, SQS)', 'Kisi bhi broker ke saath chalta hai (Kafka, RabbitMQ, SQS)'), bi('More writes and some polling load on the database', 'Database pe zyaada writes aur thoda polling load')],
          ],
        ),
        h('When you do not need it', 'Kab zaroorat nahi'),
        ul(
          [
            'Losing an event now and then is fine (analytics clicks, view counters) — fire-and-forget is enough.',
            'Kabhi-kabhi event kho jaaye to chalta hai (analytics clicks, view counters) — fire-and-forget kaafi hai.',
          ],
          ['Everything happens in the same database — just do it in one transaction.', 'Sab kuch same database mein hota hai — bas ek transaction mein kar do.'],
          [
            'The caller needs the other system’s answer right now (charge the card before confirming the order) — that is a synchronous call, not an event.',
            'Caller ko doosre system ka jawab abhi chahiye (order confirm karne se pehle card charge karna) — wo synchronous call hai, event nahi.',
          ],
          [
            'You already use **event sourcing** — the event store is the source of truth, so saving the event is the write.',
            'Aap pehle se **event sourcing** use karte ho — event store hi source of truth hai, to event save karna hi write hai.',
          ],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'The transactional outbox solves the dual-write problem. When a service has to update its database and also publish an event — say, save an expense and notify the user — two separate writes are unsafe: if the process crashes or the broker is down between them, we either lose the event or publish a ghost event for data that was rolled back. A database transaction cannot span the database and the broker, and two-phase commit is slow and not supported by most brokers.',
          'Transactional outbox dual-write problem solve karta hai. Jab service ko apna database update karna ho aur event bhi publish karna ho — jaise expense save karna aur user ko notify karna — to do alag writes unsafe hain: beech mein process crash ho ya broker down ho, to ya event kho jaata hai ya rollback hue data ka ghost event chala jaata hai. Database transaction database aur broker dono ko cover nahi kar sakta, aur two-phase commit slow hai aur zyaadatar brokers support nahi karte.',
        ),
        bi(
          'So in the same local transaction I insert the business row and an event row into an outbox table — atomically, both or neither. A separate message relay then publishes pending rows to Kafka, RabbitMQ or SQS and marks them sent only after the broker acknowledges. The relay is either a polling publisher using SELECT … FOR UPDATE SKIP LOCKED, or transaction log tailing with CDC, like Debezium reading the PostgreSQL WAL or the MySQL binlog.',
          'Isliye same local transaction mein main business row aur ek event row outbox table mein insert karta hoon — atomically, dono ya koi nahi. Phir ek alag message relay pending rows ko Kafka, RabbitMQ ya SQS pe publish karta hai aur broker ke acknowledge karne ke baad hi unhe sent mark karta hai. Relay ya to polling publisher hota hai jo SELECT … FOR UPDATE SKIP LOCKED use karta hai, ya CDC se transaction log tailing, jaise Debezium jo PostgreSQL WAL ya MySQL binlog padhta hai.',
        ),
        bi(
          'If the broker is full or down, the API is not affected; rows just stay pending and the relay retries with exponential backoff, eventually marking them failed and alerting. Delivery is at-least-once — a crash between publishing and marking sent produces a duplicate — so consumers are idempotent, usually with an inbox table keyed by the event id. In production I monitor outbox lag, keep per-entity ordering with a partition key, and clean up sent rows.',
          'Broker full ya down ho to API pe asar nahi padta; rows bas pending rehti hain aur relay exponential backoff ke saath retry karta hai, aakhir mein unhe failed mark karke alert karta hai. Delivery at-least-once hai — publish aur sent mark karne ke beech crash se duplicate banta hai — isliye consumers idempotent hote hain, aam taur pe event id wali inbox table se. Production mein main outbox lag monitor karta hoon, partition key se har entity ka order bachata hoon, aur sent rows saaf karta hoon.',
        ),
      ],
      keywords: [
        'Dual-write problem',
        'Atomicity',
        'Outbox table',
        'Message relay',
        'Polling publisher',
        'Transaction log tailing',
        'Change data capture (CDC)',
        'Debezium',
        'At-least-once delivery',
        'Idempotent consumer',
        'Inbox pattern',
        'FOR UPDATE SKIP LOCKED',
        'Eventual consistency',
        'Outbox lag',
        'Two-phase commit (2PC)',
      ],
    },
    listenFor: [
      bi('Naming the dual-write problem and the exact failure window: a crash between the two writes.', 'Dual-write problem ka naam aur exact failure window: do writes ke beech crash.'),
      bi('The business row and the event in the same local transaction — no distributed transaction.', 'Business row aur event same local transaction mein — koi distributed transaction nahi.'),
      bi('A relay that marks rows sent only after the broker confirms, and retries with backoff.', 'Relay jo broker ke confirm karne ke baad hi rows sent mark kare, aur backoff ke saath retry kare.'),
      bi('At-least-once delivery and idempotent consumers.', 'At-least-once delivery aur idempotent consumers.'),
      bi('Running it in production: outbox lag, cleanup, ordering, several relays.', 'Production mein chalana: outbox lag, safai, ordering, kai relays.'),
    ],
    mistakes: [
      bi('Publishing to the broker inside the transaction, before COMMIT — a rollback then leaves a ghost event.', 'Transaction ke andar, COMMIT se pehle broker pe publish karna — rollback hua to ghost event reh jaata hai.'),
      bi('Claiming the outbox gives exactly-once delivery.', 'Ye kehna ki outbox exactly-once delivery deta hai.'),
      bi('Deleting or marking the row before the broker confirms — a failed publish then loses the message.', 'Broker ke confirm karne se pehle row delete ya mark karna — publish fail hua to message kho gaya.'),
      bi('Running several relays without SKIP LOCKED or a leader — every message goes out several times.', 'SKIP LOCKED ya leader ke bina kai relays chalana — har message kai baar jaata hai.'),
      bi('Never cleaning up the outbox until it holds millions of rows and the relay query slows down.', 'Outbox kabhi saaf na karna, jab tak usme lakhon rows na ho jaayein aur relay ki query slow na ho jaaye.'),
    ],
    followUps: [
      {
        q: bi('Why not use a distributed transaction (2PC) across the database and the broker?', 'Database aur broker ke beech distributed transaction (2PC) kyun nahi?'),
        a: bi(
          'Most brokers (Kafka, SQS) do not support XA transactions. Two-phase commit is slow, holds locks across systems while it waits, and if the coordinator or the broker is down, your database writes block too. The outbox needs only a local transaction and still guarantees the event is published eventually.',
          'Zyaadatar brokers (Kafka, SQS) XA transactions support nahi karte. Two-phase commit slow hai, wait karte hue systems ke beech locks pakde rehta hai, aur coordinator ya broker down ho to aapke database writes bhi ruk jaate hain. Outbox ko sirf local transaction chahiye aur phir bhi guarantee hai ki event aakhir mein publish hoga.',
        ),
      },
      {
        q: bi('What if the broker is down for hours?', 'Agar broker ghanton tak down rahe to?'),
        a: bi(
          'The API keeps working: rows pile up as PENDING and the database acts as the buffer. The relay retries with capped backoff, rows over the attempt limit become FAILED and alert. I alert on outbox lag and watch disk; once the broker is back, the relay drains the backlog in batches, oldest first.',
          'API chalti rehti hai: rows PENDING ke roop mein jama hoti hain aur database buffer ka kaam karta hai. Relay capped backoff ke saath retry karta hai, attempt limit paar karne wali rows FAILED hokar alert karti hain. Main outbox lag pe alert rakhta hoon aur disk dekhta hoon; broker wapas aate hi relay batches mein, sabse purana pehle, backlog nipta deta hai.',
        ),
      },
      {
        q: bi('How do you keep events in order?', 'Events ka order kaise bachaoge?'),
        a: bi(
          'Publish in `created_at` order and use the entity id (expense id, order id) as the partition key, so all events of one entity land in the same Kafka partition and stay in order. With several relays, split the work by entity, or use CDC, which follows commit order. Consumers can also carry a version number and ignore older events.',
          '`created_at` ke order mein publish karo aur entity id (expense id, order id) ko partition key banao, taaki ek entity ke saare events same Kafka partition mein jaayein aur order mein rahein. Kai relays hon to kaam entity ke hisaab se baanto, ya CDC use karo jo commit order follow karta hai. Consumers version number rakh ke purane events ignore bhi kar sakte hain.',
        ),
      },
      {
        q: bi('How is the outbox different from the saga pattern?', 'Outbox aur saga pattern mein kya farq hai?'),
        a: bi(
          'They solve different problems and work together. A saga coordinates a business process across services, with compensating actions when a step fails (cancel the order if payment fails). The outbox is how each step of the saga reliably publishes its event after its own local transaction.',
          'Dono alag problems solve karte hain aur saath kaam karte hain. Saga services ke beech ek business process coordinate karta hai, step fail hone pe compensating actions ke saath (payment fail ho to order cancel). Outbox wo tareeka hai jisse saga ka har step apne local transaction ke baad apna event reliably publish karta hai.',
        ),
      },
    ],
    related: {
      components: ['message-queue', 'event-stream', 'background-worker', 'sql-db', 'notification-service', 'dead-letter-queue'],
      challenges: ['basic-notification-service', 'ecommerce-checkout', 'payment-processing-platform', 'distributed-message-queue'],
    },
  },

  {
    id: 'idempotent-consumer-pattern',
    category: 'system-design',
    topic: 'messaging',
    question: bi(
      'What is the Idempotent Consumer pattern? Why do consumers get duplicate messages, and how do you handle them safely?',
      'Idempotent Consumer pattern kya hai? Consumers ko duplicate messages kyun milte hain, aur unhe safely kaise handle karte hain?',
    ),
    kind: 'concept',
    level: 'intermediate',
    tags: ['idempotent consumer', 'idempotency', 'duplicate messages', 'deduplication', 'inbox pattern', 'processed messages', 'at-least-once', 'exactly-once', 'message id', 'idempotency key', 'upsert', 'kafka', 'rabbitmq', 'sqs', 'outbox'],
    answer: bi(
      'Brokers like Kafka, RabbitMQ and SQS deliver **at least once**, so a consumer will sometimes get the same message twice — after a crash before the ack, a timeout, a rebalance or a producer retry. An idempotent consumer makes the second copy harmless. Every message carries a unique id from the producer; in the **same transaction** as the work, the consumer inserts that id into a `processed_messages` table with a unique key, and skips the message if the id is already there. Where I can, I also make the work itself idempotent: upserts, conditional updates, idempotency keys.',
      'Kafka, RabbitMQ aur SQS jaise brokers **at least once** deliver karte hain, isliye consumer ko kabhi-kabhi same message do baar milta hai — ack se pehle crash, timeout, rebalance ya producer retry ke baad. Idempotent consumer doosri copy ko bekaar (harmless) bana deta hai. Har message mein producer ki di hui unique id hoti hai; kaam ke **same transaction** mein consumer woh id ek unique key wali `processed_messages` table mein daalta hai, aur id pehle se ho to message skip kar deta hai. Jahan ho sake, main kaam ko bhi khud idempotent banata hoon: upserts, conditional updates, idempotency keys.',
    ),
    sections: [
      section(
        'Why the same message arrives twice',
        'Same message do baar kyun aata hai',
        p(
          'In the outbox answer, the Notification service listened to `expense.created`. Now add a **Budget service** that adds every expense to the user’s monthly total. Kafka, RabbitMQ and SQS promise **at-least-once** delivery: a message is never lost, but sometimes it arrives twice. If the Budget service simply adds the amount, one duplicate counts ₹450 twice:',
          'Outbox wale answer mein Notification service `expense.created` sun rahi thi. Ab ek **Budget service** jodo jo har expense ko user ke mahine ke total mein jodti hai. Kafka, RabbitMQ aur SQS **at-least-once** delivery ka vaada karte hain: message kabhi khota nahi, par kabhi-kabhi do baar aata hai. Agar Budget service bas amount jod de, to ek duplicate ₹450 ko do baar gin leta hai:',
        ),
        figure(
          scene(
            [
              [c('message-queue', { id: 'queue', label: 'Queue', note: 'msg 42 · ₹450' })],
              [c('event-consumer', { id: 'budget', label: 'Budget service' })],
              [c('sql-db', { id: 'db', label: 'Database', state: 'bad', note: bi('spent: ₹900 ✗', 'spent: ₹900 (galat)') })],
            ],
            [['queue~>budget', bi('twice', 'do baar')], ['budget>db', '+450, +450']],
            bi(
              'The same message is delivered twice and the consumer adds ₹450 twice. The user’s budget now says ₹900 for a ₹450 expense.',
              'Same message do baar deliver hua aur consumer ne ₹450 do baar joda. Ab ₹450 ke expense ke liye user ka budget ₹900 dikha raha hai.',
            ),
          ),
          'before',
        ),
        table(
          [bi('What happens', 'Kya hota hai'), bi('Why the message comes again', 'Message dobara kyun aata hai')],
          [
            [
              bi('The consumer crashes after doing the work, before it acks', 'Consumer kaam karke, ack se pehle crash ho jaata hai'),
              bi('The broker never got the ack, so it delivers the message again', 'Broker ko ack mila hi nahi, to woh message phir deliver karta hai'),
            ],
            [
              bi('Processing takes longer than the SQS visibility timeout', 'Processing SQS visibility timeout se zyaada time leti hai'),
              bi('The message becomes visible again and a second consumer picks it up while the first is still working', 'Message phir dikhne lagta hai aur pehla abhi kaam kar hi raha hota hai ki doosra consumer use utha leta hai'),
            ],
            [
              bi('A Kafka consumer group rebalances (a deploy, scaling, a slow consumer)', 'Kafka consumer group rebalance hota hai (deploy, scaling, slow consumer)'),
              bi('Everything after the last committed offset is read again by the partition’s new owner', 'Last committed offset ke baad ka sab partition ka naya owner phir padhta hai'),
            ],
            [
              bi('The producer’s publish times out, but it had actually worked', 'Producer ka publish timeout hua, par asal mein ho gaya tha'),
              bi('The producer retries, and the broker now holds two copies', 'Producer retry karta hai, aur ab broker ke paas do copies hain'),
            ],
            [
              bi('The outbox relay crashes between “publish” and “mark SENT”', 'Outbox relay “publish” aur “mark SENT” ke beech crash hota hai'),
              bi('After the restart it publishes the same row again', 'Restart ke baad woh same row phir publish karta hai'),
            ],
            [
              bi('Someone replays old events or redrives a dead-letter queue', 'Koi purane events replay karta hai ya dead-letter queue redrive karta hai'),
              bi('Messages that were already handled come through again', 'Pehle se handle hue messages phir aate hain'),
            ],
          ],
        ),
        note(
          'important',
          'You cannot fully prevent duplicates across a network — even the ack can get lost. So stop chasing **exactly-once delivery** and build an **exactly-once effect** instead: at-least-once delivery plus a consumer that is safe to run twice. That consumer is the **Idempotent Consumer**.',
          'Network pe duplicates poori tarah rokna mumkin nahi — ack bhi kho sakta hai. Isliye **exactly-once delivery** ke peeche mat bhaago, balki **exactly-once effect** banao: at-least-once delivery plus aisa consumer jise do baar chalana safe ho. Wahi consumer **Idempotent Consumer** hai.',
        ),
      ),

      section(
        'The idea: remember what you have already done',
        'Idea: yaad rakho kya pehle ho chuka hai',
        note(
          'example',
          'A bank cheque. Every cheque has a unique number. When the bank cashes cheque #104523, it records that number as PAID. If someone presents the same cheque again, the clerk checks the number, sees it was already paid and refuses. The money moves only once, however many times the cheque comes back. The **message id** is the cheque number; the **processed-messages table** is the bank’s register.',
          'Bank ka cheque. Har cheque ka ek unique number hota hai. Bank cheque #104523 cash karta hai to woh number PAID ke roop mein likh leta hai. Koi same cheque dobara laaye to clerk number check karta hai, dekhta hai ki pehle hi pay ho chuka hai aur mana kar deta hai. Cheque kitni bhi baar aaye, paisa ek hi baar jaata hai. **Message id** cheque number hai; **processed-messages table** bank ka register hai.',
        ),
        p(
          'So every message carries a unique id given by the producer (the outbox row id is perfect). The consumer records that id **in the same transaction** as the work. A second copy finds the id already there and is skipped.',
          'Isliye har message mein producer ki di hui ek unique id hoti hai (outbox row ki id best hai). Consumer woh id kaam ke **same transaction** mein record karta hai. Doosri copy ko id pehle se mil jaati hai aur woh skip ho jaati hai.',
        ),
        figure(
          scene(
            [
              [c('message-queue', { id: 'queue', label: 'Queue', note: 'msg 42 · ₹450' })],
              [c('event-consumer', { id: 'budget', label: 'Budget service', state: 'focus' })],
              [
                a('inbox', 'ListChecks', 'processed ids', { accent: 'violet', note: bi('2nd copy → skip', 'doosri copy → skip') }),
                a('budgets', 'Table', 'budgets table', { accent: 'sky', state: 'good', note: 'spent: ₹450' }),
              ],
            ],
            [['queue~>budget', bi('twice', 'do baar')], ['budget>inbox', 'INSERT 42'], ['budget>budgets', '+450']],
            bi(
              'The consumer records message 42 and adds ₹450 in ONE transaction. When the second copy arrives, id 42 is already recorded, so nothing is added again.',
              'Consumer message 42 record karta hai aur ₹450 EK transaction mein jodta hai. Doosri copy aane pe id 42 pehle se record hai, isliye kuch dobara nahi judta.',
            ),
            [group(['inbox', 'budgets'], bi('one transaction', 'ek transaction'), 'good')],
          ),
          'after',
        ),
        steps(
          [
            'Every message has a stable id',
            'Har message ki ek pakki id',
            'The producer assigns an event id once (for example the outbox row id), and every copy carries the same id. Do not use the broker’s delivery id — a producer retry gets a new one.',
            'Producer ek baar event id deta hai (jaise outbox row ki id), aur har copy mein wahi id hoti hai. Broker ki delivery id use mat karo — producer retry pe nayi mil jaati hai.',
          ],
          [
            'Start a transaction and claim the id',
            'Transaction shuru karo aur id claim karo',
            'Insert the id into `processed_messages`. Its primary key makes a second insert of the same id do nothing.',
            'Id ko `processed_messages` mein insert karo. Iski primary key ki wajah se same id ka doosra insert kuch nahi karta.',
          ],
          [
            'Already there? Skip it',
            'Pehle se hai? Skip karo',
            'If the insert did nothing, this copy is a duplicate: do no work, just ack it so the broker stops sending it.',
            'Insert ne kuch nahi kiya to ye copy duplicate hai: koi kaam mat karo, bas ack karo taaki broker use bhejna band kare.',
          ],
          [
            'New? Do the work, commit, then ack',
            'Naya hai? Kaam karo, commit, phir ack',
            'Make the business change in the same transaction, commit, and only then ack the message.',
            'Business change same transaction mein karo, commit karo, aur uske baad hi message ack karo.',
          ],
        ),
      ),

      section(
        'Build it: the processed-messages (inbox) table',
        'Banao: processed-messages (inbox) table',
        code(
          'sql',
          `
CREATE TABLE processed_messages (
  consumer      TEXT        NOT NULL,         -- 'budget', 'notifications' …
  message_id    UUID        NOT NULL,         -- the producer's event id
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer, message_id)          -- the database is the referee
);`,
        ),
        code(
          'ts',
          `
// budget.consumer.ts — adds each expense to the monthly budget exactly once
broker.subscribe('expense.created', async (msg) => {
  await db.transaction(async (tx) => {
    const claimed = await tx.query(
      \`INSERT INTO processed_messages (consumer, message_id)
       VALUES ('budget', $1)
       ON CONFLICT DO NOTHING\`,
      [msg.id],
    );
    if (claimed.rowCount === 0) return;          // seen before → duplicate, do nothing

    await tx.query(
      'UPDATE budgets SET spent = spent + $1 WHERE user_id = $2 AND month = $3',
      [msg.payload.amount, msg.payload.userId, msg.payload.month],
    );
  });                                            // COMMIT: the id and the work, together

  await msg.ack();                               // ack only after the commit
});`,
          'budget.consumer.ts',
        ),
        timeline(
          [actorC('message-queue', { id: 'queue', label: 'Queue' }), actorC('event-consumer', { id: 'budget', label: 'Budget service' }), actorC('sql-db', { id: 'db', label: 'Database' })],
          [
            msg('queue~>budget', 'msg 42 (₹450)', explain('The Budget service receives message 42 for a ₹450 expense.', 'Budget service ko ₹450 ke expense ka message 42 milta hai.')),
            inTxn(
              bi('one transaction', 'ek transaction'),
              'good',
              msg('budget>db', 'INSERT 42 ✓ new', explain('Id 42 is not in the table yet, so the insert works: this is the first copy.', 'Id 42 abhi table mein nahi hai, to insert chal jaata hai: ye pehli copy hai.')),
              msg('budget>db', 'spent += 450', explain('The real work, in the same transaction.', 'Asli kaam, usi transaction mein.')),
              msg('budget>db', 'COMMIT ✓', explain('The id and the new total are saved together.', 'Id aur naya total ek saath save hote hain.')),
            ),
            mark(
              ['budget'],
              bi('crash before ack', 'ack se pehle crash'),
              'bad',
              explain('The service dies just before it can ack. The broker thinks the message was never handled.', 'Ack karne se theek pehle service mar jaati hai. Broker sochta hai message kabhi handle hi nahi hua.'),
            ),
            msg('queue~>budget', 'msg 42 again', explain('So the broker redelivers message 42.', 'Isliye broker message 42 phir deliver karta hai.')),
            msg('budget>db', 'INSERT 42 → exists', explain('This time the insert finds id 42 already there and does nothing.', 'Is baar insert ko id 42 pehle se milti hai aur woh kuch nahi karta.')),
            mark(['budget'], bi('duplicate → skip', 'duplicate → skip karo'), 'good', explain('The consumer skips the work. The budget stays ₹450, not ₹900.', 'Consumer kaam skip karta hai. Budget ₹450 hi rehta hai, ₹900 nahi.')),
            msg('budget>queue', 'ack ✓', explain('It acks, and the broker finally removes the message.', 'Ye ack karta hai, aur broker aakhirkaar message hata deta hai.')),
          ],
          bi(
            'A crash after the commit but before the ack causes a redelivery. Because the id was saved with the work, the second copy changes nothing.',
            'Commit ke baad par ack se pehle crash hone pe redelivery hoti hai. Id kaam ke saath save hui thi, isliye doosri copy kuch nahi badalti.',
          ),
        ),
        h('The order matters', 'Order bahut zaroori hai'),
        table(
          [bi('What the consumer does', 'Consumer kya karta hai'), bi('If it crashes in between', 'Beech mein crash ho to'), bi('Result', 'Nateeja')],
          [
            [bi('Ack first, then do the work', 'Pehle ack, phir kaam'), bi('The message is gone, the work never happened', 'Message gaya, kaam kabhi hua hi nahi'), bi('✗ Lost (at-most-once)', '✗ Kho gaya (at-most-once)')],
            [bi('Work, then save the id in a separate transaction', 'Kaam, phir id alag transaction mein save'), bi('Work saved, id not saved', 'Kaam save, id save nahi'), bi('✗ Done twice on redelivery', '✗ Redelivery pe do baar')],
            [bi('Save the id, then work in a separate transaction', 'Id save, phir kaam alag transaction mein'), bi('Id saved, work never done', 'Id save, kaam kabhi nahi hua'), bi('✗ Lost — the retry is skipped', '✗ Kho gaya — retry skip ho jaata hai')],
            [
              bi('Id and work in ONE transaction, then ack', 'Id aur kaam EK transaction mein, phir ack'),
              bi('Either nothing was saved, or both were', 'Ya kuch save nahi hua, ya dono hue'),
              bi('✓ The retry redoes it or skips it — the effect happens once', '✓ Retry ya to dobara karta hai ya skip — asar ek hi baar'),
            ],
          ],
        ),
        h('Two copies at the same moment', 'Do copies ek hi pal mein'),
        p(
          'After a visibility timeout or a rebalance, two instances can process the same message at the same time. “Check first, then insert” is a race (check-then-act): both see “not processed yet” and both do the work. The primary key makes the database the referee:',
          'Visibility timeout ya rebalance ke baad do instances same message ek saath process kar sakte hain. “Pehle check, phir insert” ek race hai (check-then-act): dono ko dikhta hai “abhi process nahi hua” aur dono kaam kar dete hain. Primary key database ko referee bana deti hai:',
        ),
        timeline(
          [actorC('event-consumer', { id: 'a', label: 'Budget A' }), actorC('sql-db', { id: 'db', label: 'Database' }), actorC('event-consumer', { id: 'b', label: 'Budget B' })],
          [
            mark(
              ['a', 'b'],
              bi('both receive msg 42', 'dono ko msg 42 mila'),
              'wait',
              explain('A was slow, the visibility timeout expired, and the queue handed the same message to B.', 'A slow tha, visibility timeout khatam hua, aur queue ne same message B ko de diya.'),
            ),
            msg('a>db', 'INSERT 42 ✓', explain('A claims id 42 first.', 'A pehle id 42 claim karta hai.')),
            msg('b>db', 'INSERT 42 … waits', explain('B tries the same id. PostgreSQL makes B wait until A’s transaction finishes.', 'B same id try karta hai. PostgreSQL B ko tab tak rokta hai jab tak A ka transaction khatam na ho.')),
            msg('a>db', '+450 · COMMIT', explain('A does the work and commits.', 'A kaam karke commit karta hai.')),
            msg('db.>b', 'conflict → 0 rows', explain('Now the database tells B the id already exists: its insert did nothing.', 'Ab database B ko batata hai ki id pehle se hai: uske insert ne kuch nahi kiya.')),
            mark(['b'], bi('duplicate → skip, ack', 'duplicate → skip karo, ack'), 'good', explain('B skips the work. ₹450 is counted once, even with two consumers running at the same time.', 'B kaam skip karta hai. Do consumers ek saath chalne pe bhi ₹450 ek hi baar gina gaya.')),
          ],
          bi(
            'Two consumers, one message: the unique key lets exactly one of them win. A “SELECT, then INSERT” check would let both through.',
            'Do consumers, ek message: unique key sirf ek ko jeetne deti hai. “Pehle SELECT, phir INSERT” wala check dono ko aage jaane deta.',
          ),
        ),
      ),

      section(
        'Often simpler: make the work itself idempotent',
        'Aksar aasaan: kaam ko hi idempotent banao',
        p(
          'A processed-ids table works for anything, but many operations can be written so that running them twice is harmless — no extra table needed. Ask of every operation: “what happens if this runs twice?”',
          'Processed-ids table har cheez ke liye chalti hai, par kai operations aise likhe ja sakte hain ki do baar chalna nuksaan na kare — extra table ki zaroorat nahi. Har operation se poocho: “ye do baar chale to kya hoga?”',
        ),
        table(
          ['Operation', bi('Safe to repeat?', 'Repeat karna safe?'), bi('How to make it safe', 'Safe kaise banaayein')],
          [
            ['`SET status = PAID`', bi('✓ Yes', '✓ Haan'), bi('Already safe: setting the same value twice changes nothing', 'Pehle se safe: same value do baar set karne se kuch nahi badalta')],
            ['`spent = spent + 450`', bi('✗ No', '✗ Nahi'), bi('Dedupe by message id, or store one ledger row per expense id and SUM them', 'Message id se dedupe karo, ya har expense id ki ek ledger row rakho aur SUM karo')],
            ['`INSERT INTO notifications …`', bi('✗ No — two rows', '✗ Nahi — do rows'), bi('A unique key on (expense_id, type) plus `ON CONFLICT DO NOTHING`', '(expense_id, type) pe unique key plus `ON CONFLICT DO NOTHING`')],
            ['`DELETE FROM carts WHERE user_id = 7`', bi('✓ Yes', '✓ Haan'), bi('Already safe: the second delete finds nothing', 'Pehle se safe: doosra delete kuch nahi paata')],
            [bi('Move an order from PAID to SHIPPED', 'Order ko PAID se SHIPPED karna'), bi('Depends', 'Depend karta hai'), bi('Conditional update `… WHERE status = PAID`: the repeat updates 0 rows', 'Conditional update `… WHERE status = PAID`: repeat 0 rows update karta hai')],
            [bi('Send a push or an email', 'Push ya email bhejna'), bi('✗ No', '✗ Nahi'), bi('Record it first, or use the provider’s idempotency key (part 5)', 'Pehle record karo, ya provider ki idempotency key (part 5)')],
            [bi('Charge a card', 'Card charge karna'), bi('✗ No — charged twice', '✗ Nahi — do baar charge'), bi('Always send an idempotency key (part 5)', 'Hamesha idempotency key bhejo (part 5)')],
          ],
        ),
        options(
          {
            title: 'Unique business key',
            badge: bi('My default', 'Mera default'),
            text: bi(
              'One row per business fact, keyed by its id. A second insert of the same fact does nothing, and totals are a SUM — a duplicate can never count twice.',
              'Har business fact ki ek row, uski id se keyed. Same fact ka doosra insert kuch nahi karta, aur total ek SUM hai — duplicate kabhi do baar nahi gin sakta.',
            ),
            code: `
INSERT INTO budget_entries (expense_id, user_id, amount)
VALUES ($1, $2, $3)
ON CONFLICT (expense_id) DO NOTHING;`,
            lang: 'sql',
          },
          {
            title: 'Conditional update (state machine)',
            text: bi(
              'Only move forward from the state you expect. The first copy moves the order; the repeat matches 0 rows and changes nothing.',
              'Sirf expected state se hi aage badho. Pehli copy order ko aage badhati hai; repeat 0 rows match karta hai aur kuch nahi badalta.',
            ),
            code: `
UPDATE orders
SET status = 'SHIPPED'
WHERE id = $1 AND status = 'PAID';`,
            lang: 'sql',
          },
          {
            title: 'Version check',
            text: bi(
              'Each event carries the entity’s version. Apply it only if it is newer — this also ignores late, out-of-order events.',
              'Har event mein entity ka version hota hai. Sirf naya ho to apply karo — isse late, out-of-order events bhi ignore ho jaate hain.',
            ),
            code: `
UPDATE profiles
SET name = $2, version = $3
WHERE user_id = $1 AND version < $3;`,
            lang: 'sql',
          },
        ),
      ),

      section(
        'Side effects outside your database',
        'Database ke bahar ke side effects',
        p(
          'A push, an email or a card charge cannot join your database transaction — you cannot roll back an email. Three tools handle this:',
          'Push, email ya card charge aapke database transaction mein shaamil nahi ho sakte — email ko rollback nahi kar sakte. Teen tareeke kaam aate hain:',
        ),
        ul(
          [
            '**An idempotency key at the provider.** Payment APIs such as Stripe accept an idempotency key. Send the message id: a repeat returns the first result instead of charging again.',
            '**Provider pe idempotency key.** Stripe jaisi payment APIs idempotency key leti hain. Message id bhejo: repeat pe dobara charge nahi hota, pehla result wapas milta hai.',
          ],
          [
            '**Record the intent, then act.** In the transaction, insert `notifications (message_id, status = PENDING)`; a sender sends it and marks it SENT. That is the outbox pattern again — the consumer becomes a producer.',
            '**Pehle intent record karo, phir action.** Transaction mein `notifications (message_id, status = PENDING)` insert karo; ek sender use bhej ke SENT mark karta hai. Ye phir se outbox pattern hai — consumer khud producer ban jaata hai.',
          ],
          [
            '**Decide by cost.** A duplicate “₹450 added” push is a small annoyance; a duplicate charge means an angry customer and a refund. Spend the effort where a duplicate hurts.',
            '**Nuksaan dekh ke faisla.** Duplicate “₹450 add hua” push chhoti si pareshaani hai; duplicate charge matlab naraz customer aur refund. Mehnat wahan karo jahan duplicate chot pahunchaaye.',
          ],
        ),
        timeline(
          [actorC('message-queue', { id: 'queue', label: 'Queue' }), actorC('event-consumer', { id: 'settle', label: 'Settle-up service' }), actorC('payment-provider', { id: 'pay', label: 'Payment provider' })],
          [
            msg('queue~>settle', 'msg 77 · ₹450', explain('A friend settles a shared expense; the Settle-up service gets message 77.', 'Ek dost shared expense settle karta hai; Settle-up service ko message 77 milta hai.')),
            msg('settle>pay', 'charge · key 77', explain('It charges the card and sends the message id as the **idempotency key**.', 'Ye card charge karti hai aur message id ko **idempotency key** banake bhejti hai.')),
            msg('pay.>settle', 'OK · payment p_1', explain('The provider charges once and remembers key 77 with its result.', 'Provider ek baar charge karta hai aur key 77 ko uske result ke saath yaad rakhta hai.')),
            mark(['settle'], bi('crash before ack', 'ack se pehle crash'), 'bad', explain('The service dies before it can save the result and ack.', 'Result save karke ack karne se pehle service mar jaati hai.')),
            msg('queue~>settle', 'msg 77 again', explain('The message is redelivered.', 'Message phir deliver hota hai.')),
            msg('settle>pay', 'charge · key 77', explain('Same request, same key.', 'Wahi request, wahi key.')),
            msg('pay.>settle', 'OK · same p_1', explain('The provider recognises key 77, does not charge again, and returns the first result.', 'Provider key 77 pehchaan leta hai, dobara charge nahi karta, aur pehla result lauta deta hai.')),
            mark(['settle'], bi('save p_1 · ack', 'p_1 save · ack'), 'good', explain('The service saves the payment and acks. The card was charged exactly once.', 'Service payment save karke ack karti hai. Card bilkul ek baar charge hua.')),
          ],
          bi(
            'For work outside your database, let the other side deduplicate: the same idempotency key always gets the same result.',
            'Database ke bahar ke kaam mein doosri side ko dedupe karne do: same idempotency key ko hamesha same result milta hai.',
          ),
        ),
        code(
          'ts',
          `
// settle-up.consumer.ts — the payment provider dedupes the charge
broker.subscribe('settlement.requested', async (msg) => {
  const payment = await stripe.paymentIntents.create(
    { amount: msg.payload.amountInPaise, currency: 'inr', customer: msg.payload.customerId },
    { idempotencyKey: msg.id },                  // same message → same payment, never a second charge
  );

  await db.query(
    \`INSERT INTO settlements (id, payment_id, status) VALUES ($1, $2, 'PAID')
     ON CONFLICT (id) DO NOTHING\`,
    [msg.payload.settlementId, payment.id],
  );
  await msg.ack();
});`,
        ),
        note(
          'warning',
          'Providers keep idempotency keys only for a while (Stripe: at least 24 hours). If you might replay messages that are days old, keep your own record too.',
          'Providers idempotency keys sirf kuch time ke liye rakhte hain (Stripe: kam se kam 24 ghante). Agar aap dinon purane messages replay kar sakte ho, to apna record bhi rakho.',
        ),
      ),

      section(
        'What brokers do for you — and what they do not',
        'Brokers aapke liye kya karte hain — aur kya nahi',
        table(
          ['Broker', bi('What it gives you', 'Kya deta hai'), bi('What it does not cover', 'Kya cover nahi karta')],
          [
            [
              'Kafka',
              bi(
                '**Idempotent producer** (`enable.idempotence`, on by default since Kafka 3.0): no duplicates from the producer’s own retries. **Transactions** (exactly-once semantics) for read → process → write inside Kafka.',
                '**Idempotent producer** (`enable.idempotence`, Kafka 3.0 se default on): producer ke apne retries se duplicates nahi. Kafka ke andar read → process → write ke liye **transactions** (exactly-once semantics).',
              ),
              bi(
                'Writes to your database, emails and API calls; messages read again after a rebalance before the offset commit.',
                'Aapke database ke writes, emails aur API calls; offset commit se pehle rebalance hone pe dobara padhe gaye messages.',
              ),
            ],
            [
              'Amazon SQS FIFO',
              bi('A deduplication ID: copies with the same ID sent within 5 minutes are dropped.', 'Deduplication ID: 5 minute ke andar same ID wali copies drop ho jaati hain.'),
              bi('Redelivery after the visibility timeout; duplicates more than 5 minutes apart.', 'Visibility timeout ke baad redelivery; 5 minute se zyaada door ke duplicates.'),
            ],
            [
              'Amazon SQS standard',
              bi('At-least-once delivery; an occasional duplicate is expected.', 'At-least-once delivery; kabhi-kabhi duplicate aana normal hai.'),
              bi('Any deduplication at all.', 'Koi bhi deduplication nahi.'),
            ],
            [
              'RabbitMQ',
              bi('Acks, publisher confirms and a `redelivered` flag.', 'Acks, publisher confirms aur ek `redelivered` flag.'),
              bi('Real deduplication — `redelivered` only means “maybe seen before”.', 'Asli deduplication — `redelivered` ka matlab bas “shayad pehle dekha hai” hai.'),
            ],
          ],
        ),
        note(
          'tip',
          'Another valid trick for Kafka → database: save the consumer offset in the **same database transaction** as the work, and on start-up continue from the saved offset instead of Kafka’s committed offset. The offset and the work can then never disagree.',
          'Kafka → database ke liye ek aur sahi tareeka: consumer offset ko kaam ke **same database transaction** mein save karo, aur start-up pe Kafka ke committed offset ki jagah saved offset se aage badho. Tab offset aur kaam kabhi alag-alag nahi ho sakte.',
        ),
      ),

      section(
        'Production checklist',
        'Production checklist',
        ul(
          [
            '**Dedupe on the producer’s event id** (the outbox row id) — not the broker’s delivery id, and never a hash of the payload: two genuine ₹450 expenses have identical payloads.',
            '**Producer ki event id pe dedupe karo** (outbox row ki id) — broker ki delivery id pe nahi, aur payload ke hash pe kabhi nahi: do asli ₹450 ke expenses ka payload bilkul same hota hai.',
          ],
          ['**Same transaction** for the id and the work; **ack only after the commit**.', 'Id aur kaam ke liye **same transaction**; **commit ke baad hi ack**.'],
          [
            '**Key by (consumer, message_id)** so several consumers sharing one database each keep their own record.',
            '**(consumer, message_id) se key karo** taaki ek database share karne wale kai consumers apna-apna record rakhein.',
          ],
          [
            '**Clean up:** keep ids a little longer than your longest redelivery or replay window (say 7–30 days), then delete them with a nightly cron job or by dropping old partitions.',
            '**Safai:** ids ko sabse lambi redelivery ya replay window se thoda zyaada rakho (maan lo 7–30 din), phir raat ke cron job se ya purane partitions drop karke hatao.',
          ],
          [
            '**Dedupe is not ordering:** for events that can arrive out of order, use a per-entity partition key and version checks.',
            '**Dedupe ordering nahi hai:** out-of-order aa sakne wale events ke liye per-entity partition key aur version checks use karo.',
          ],
          [
            '**Poison messages are a different problem:** a message that always fails needs a retry limit and a dead-letter queue, not deduplication.',
            '**Poison messages alag problem hain:** hamesha fail hone wale message ko retry limit aur dead-letter queue chahiye, deduplication nahi.',
          ],
          [
            '**Test it:** in integration tests, deliver every message twice and check that the result is the same.',
            '**Test karo:** integration tests mein har message do baar deliver karo aur check karo ki result same rahe.',
          ],
          [
            '**Monitor** a `duplicates_skipped` counter — a sudden jump means crash loops, slow consumers or frequent rebalances.',
            '`duplicates_skipped` counter **monitor karo** — achanak jump matlab crash loops, slow consumers ya baar-baar rebalances.',
          ],
        ),
        h('When you need less', 'Kab kam se kaam chal jaata hai'),
        ul(
          [
            'The work is naturally idempotent — setting a status, invalidating a cache, overwriting a document. No table needed.',
            'Kaam khud hi idempotent hai — status set karna, cache invalidate karna, document overwrite karna. Table ki zaroorat nahi.',
          ],
          [
            'A rare duplicate is harmless — a “typing…” indicator, a cache warm-up, a rough view counter.',
            'Kabhi-kabhi duplicate se koi nuksaan nahi — “typing…” indicator, cache warm-up, mota-mota view counter.',
          ],
        ),
      ),
    ],
    interview: {
      text: [
        bi(
          'Most brokers — Kafka, SQS, RabbitMQ — guarantee at-least-once delivery, so a consumer will eventually see the same message twice: after a crash before the ack or offset commit, a visibility timeout, a consumer-group rebalance, a producer retry, or an outbox relay republishing. Exactly-once delivery is not realistic across a network; what we build is an exactly-once effect — at-least-once delivery plus an idempotent consumer.',
          'Zyaadatar brokers — Kafka, SQS, RabbitMQ — at-least-once delivery guarantee karte hain, isliye consumer ko kabhi na kabhi same message do baar milega: ack ya offset commit se pehle crash, visibility timeout, consumer-group rebalance, producer retry, ya outbox relay ke dobara publish karne ke baad. Network pe exactly-once delivery realistic nahi hai; hum exactly-once effect banate hain — at-least-once delivery plus idempotent consumer.',
        ),
        bi(
          'The core of the pattern: every message carries a unique, producer-assigned event id. In the same local transaction as the business change, the consumer inserts that id into a processed-messages, or inbox, table with a unique key on consumer and message id. If the insert conflicts, it is a duplicate — skip it and ack. Otherwise do the work, commit, and only then ack. Because the id and the work commit atomically, a crash at any point leaves either nothing done or both done, and the unique key also settles two consumers racing on the same message.',
          'Pattern ka core: har message mein producer ki di hui unique event id hoti hai. Business change ke same local transaction mein consumer woh id processed-messages ya inbox table mein insert karta hai, jisme consumer aur message id pe unique key hai. Insert conflict kare to duplicate hai — skip karke ack. Warna kaam karo, commit karo, aur tabhi ack. Id aur kaam atomically commit hote hain, isliye kisi bhi point pe crash ho to ya kuch nahi hua ya dono hue, aur unique key same message pe race kar rahe do consumers ka faisla bhi kar deti hai.',
        ),
        bi(
          'Where I can, I make the operation naturally idempotent instead — set values rather than increment, upsert on a business key, conditional state transitions, version checks that also drop out-of-order events. For side effects outside the database, like payments, I pass the message id as the provider’s idempotency key. In production I clean up old ids after the replay window, key them per consumer, and monitor the duplicate rate.',
          'Jahan ho sake, main operation ko hi naturally idempotent banata hoon — increment ki jagah value set karna, business key pe upsert, conditional state transitions, version checks jo out-of-order events bhi drop kar dein. Database ke bahar ke side effects, jaise payments, ke liye main message id ko provider ki idempotency key banake bhejta hoon. Production mein replay window ke baad purani ids saaf karta hoon, unhe per consumer key karta hoon, aur duplicate rate monitor karta hoon.',
        ),
      ],
      keywords: [
        'At-least-once delivery',
        'Exactly-once effect',
        'Idempotency',
        'Event ID',
        'Inbox pattern',
        'Processed-messages table',
        'Unique constraint',
        'Ack after commit',
        'Natural idempotency',
        'Upsert',
        'Conditional update',
        'Idempotency key',
        'Consumer-group rebalance',
        'Visibility timeout',
        'Deduplication window',
      ],
    },
    listenFor: [
      bi('Why duplicates cannot be avoided with at-least-once delivery, with concrete causes.', 'At-least-once delivery mein duplicates kyun nahi ruk sakte, asli wajahon ke saath.'),
      bi('Deduplicating on a stable, producer-assigned id, recorded in the same transaction as the work.', 'Producer ki di hui pakki id pe dedupe, kaam ke same transaction mein record ki hui.'),
      bi('Ack only after the commit, and a unique key instead of check-then-insert.', 'Commit ke baad hi ack, aur check-then-insert ki jagah unique key.'),
      bi('Natural idempotency and idempotency keys for side effects outside the database.', 'Natural idempotency, aur database ke bahar ke side effects ke liye idempotency keys.'),
      bi('Running it: cleaning up old ids, one key per consumer, ordering as a separate concern.', 'Chalana: purani ids ki safai, har consumer ki alag key, ordering ek alag mudda.'),
    ],
    mistakes: [
      bi('“SELECT to check, then INSERT” without a unique constraint — two consumers both pass the check.', 'Unique constraint ke bina “pehle SELECT se check, phir INSERT” — dono consumers check paar kar jaate hain.'),
      bi('Saving the id and doing the work in two separate transactions.', 'Id save karna aur kaam karna do alag transactions mein.'),
      bi('Acking before the work is committed.', 'Kaam commit hone se pehle ack kar dena.'),
      bi('Deduplicating on the payload content instead of an id.', 'Id ki jagah payload content pe dedupe karna.'),
      bi('Trusting the broker’s “exactly-once” feature to cover database writes and API calls.', 'Broker ke “exactly-once” feature pe bharosa karna ki woh database writes aur API calls ko bhi cover karega.'),
    ],
    followUps: [
      {
        q: bi('Why not check whether the id exists first, then insert it?', 'Pehle check kyun nahi karte ki id hai ya nahi, phir insert?'),
        a: bi(
          'Because two consumers can run the check at the same moment, both see “not there” and both do the work — a check-then-act race. A unique constraint with `INSERT … ON CONFLICT DO NOTHING` is a single atomic step: the database lets exactly one of them win.',
          'Kyunki do consumers ek hi pal mein check chala sakte hain, dono ko “nahi hai” dikhta hai aur dono kaam kar dete hain — check-then-act race. Unique constraint ke saath `INSERT … ON CONFLICT DO NOTHING` ek hi atomic step hai: database sirf ek ko jeetne deta hai.',
        ),
      },
      {
        q: bi('How long do you keep the processed ids?', 'Processed ids kitne time tak rakhte ho?'),
        a: bi(
          'A bit longer than the longest time a duplicate can still arrive: broker retention, how far back we might replay, how long a dead-letter queue can wait before a redrive — typically 7 to 30 days. Then a nightly job deletes them, or the table is partitioned by day and old partitions are dropped. If we replay from the very beginning, the work itself must be naturally idempotent.',
          'Utne se thoda zyaada jitne time tak duplicate aa sakta hai: broker retention, kitna peeche tak replay kar sakte hain, dead-letter queue redrive se pehle kitna wait kar sakti hai — aam taur pe 7 se 30 din. Phir raat ka job unhe delete karta hai, ya table din ke hisaab se partitioned hoti hai aur purane partitions drop hote hain. Bilkul shuru se replay karna ho to kaam khud naturally idempotent hona chahiye.',
        ),
      },
      {
        q: bi('Does Kafka’s exactly-once feature make this unnecessary?', 'Kya Kafka ka exactly-once feature ise bekaar bana deta hai?'),
        a: bi(
          'Only inside Kafka. Kafka transactions make “consume, produce, commit offsets” atomic when both input and output are Kafka topics. The moment you write to PostgreSQL or call an API, that work is outside the Kafka transaction, so you still need an idempotent consumer — or you store the offset in the same database transaction as the work.',
          'Sirf Kafka ke andar. Kafka transactions “consume, produce, offsets commit” ko atomic banate hain jab input aur output dono Kafka topics hon. Jaise hi aap PostgreSQL mein likhte ho ya API call karte ho, woh kaam Kafka transaction ke bahar hai, isliye idempotent consumer phir bhi chahiye — ya offset ko kaam ke same database transaction mein store karo.',
        ),
      },
      {
        q: bi('What about events that arrive out of order?', 'Out of order aane wale events ka kya?'),
        a: bi(
          'Deduplication does not fix order. Send all events of one entity with the same partition key so they stay in order, and put a version number in each event; the consumer applies an event only if its version is newer than the stored one, which drops late or stale events.',
          'Deduplication order theek nahi karta. Ek entity ke saare events same partition key ke saath bhejo taaki order mein rahein, aur har event mein version number rakho; consumer event tabhi apply kare jab uska version stored version se naya ho, isse late ya purane events drop ho jaate hain.',
        ),
      },
    ],
    related: {
      components: ['message-queue', 'event-stream', 'event-consumer', 'sql-db', 'payment-provider', 'dead-letter-queue'],
      challenges: ['payment-processing-platform', 'distributed-wallet-and-ledger', 'basic-notification-service', 'distributed-message-queue'],
    },
  },
];
