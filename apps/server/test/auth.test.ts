import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { PASSWORD, app, db, newUser } from './helpers';

afterAll(async () => {
  await db.$disconnect();
});

const SESSION_COOKIE = 'aa_session';

describe('registration', () => {
  it('creates an account and starts an httpOnly session', async () => {
    const email = `Reg-${randomUUID()}@Example.com`;
    const res = await request(app).post('/api/auth/register').send({ email, password: PASSWORD, displayName: 'Asha' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email.toLowerCase());
    expect(res.body.user).not.toHaveProperty('passwordHash');
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('stores a password hash, never the password', async () => {
    const { email } = await newUser();
    const row = await db.user.findUniqueOrThrow({ where: { email } });
    expect(row.passwordHash).toBeTruthy();
    expect(row.passwordHash).not.toContain(PASSWORD);
  });

  it('rejects duplicate emails', async () => {
    const { email } = await newUser();
    const res = await request(app).post('/api/auth/register').send({ email, password: PASSWORD, displayName: 'Again' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('validates input with field-level errors', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email', password: 'short', displayName: '' });
    expect(res.status).toBe(400);
    const fields = (res.body.error.details as { path: string }[]).map((d) => d.path);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password', 'displayName']));
  });
});

describe('sign-in and sessions', () => {
  it('signs in with the right password and exposes the user', async () => {
    const { email } = await newUser();
    const agent = request.agent(app);
    const login = await agent.post('/api/auth/login').send({ email, password: PASSWORD });
    expect(login.status).toBe(200);
    const me = await agent.get('/api/auth/me');
    expect(me.body.user.email).toBe(email);
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const { email } = await newUser();
    const wrong = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password-1' });
    const unknown = await request(app).post('/api/auth/login').send({ email: `nobody-${randomUUID()}@example.com`, password: 'whatever-1' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it('logout destroys the server-side session', async () => {
    const user = await newUser();
    const cookie = (await user.agent.get('/api/auth/me')).request.cookies;
    expect(cookie).toContain(SESSION_COOKIE);
    const out = await user.agent.post('/api/auth/logout');
    expect(out.status).toBe(204);
    // Replaying the old cookie must not work any more.
    const replay = await request(app).get('/api/me/dashboard').set('Cookie', cookie);
    expect(replay.status).toBe(401);
  });

  it('ignores forged session cookies', async () => {
    const res = await request(app).get('/api/me/dashboard').set('Cookie', `${SESSION_COOKIE}=forged-token-value`);
    expect(res.status).toBe(401);
  });

  it('reports Google sign-in as not configured when no client id is set', async () => {
    const config = await request(app).get('/api/auth/config');
    expect(config.body.googleClientId).toBeNull();
    const res = await request(app).post('/api/auth/google').send({ credential: 'x'.repeat(40) });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_CONFIGURED');
  });
});

describe('request protection', () => {
  it('requires a session for private routes', async () => {
    for (const path of ['/api/me/dashboard', '/api/me/progress', '/api/drafts', '/api/attempts']) {
      const res = await request(app).get(path);
      expect(res.status, path).toBe(401);
    }
  });

  it('blocks state-changing requests from other origins', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ email: 'a@example.com', password: 'whatever-1' });
    expect(res.status).toBe(403);
  });

  it('allows requests from the app origin', async () => {
    const { email } = await newUser();
    const res = await request(app).post('/api/auth/login').set('Origin', 'http://localhost:5173').send({ email, password: PASSWORD });
    expect(res.status).toBe(200);
  });

  it('returns JSON 404s for unknown API routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
