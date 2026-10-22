import { googleLoginSchema, loginSchema, registerSchema } from '@arch-arena/shared';
import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { verifyGoogleCredential } from '../auth/google';
import { getDummyHash, hashPassword, verifyPassword } from '../auth/password';
import { clearSessionCookie, createSession, destroySession, setSessionCookie } from '../auth/sessions';
import type { Db } from '../db';
import { getEnv } from '../env';
import { HttpError, badRequest, conflict, parseBody, unauthorized } from '../http/errors';
import { authLimiter } from '../http/security';
import { toUserDTO } from '../services/mappers';

const userSelect = { id: true, email: true, displayName: true, preferredLanguage: true, xp: true, level: true, createdAt: true } as const;

export function authRouter(db: Db): Router {
  const router = Router();

  router.get('/config', (_req, res) => {
    res.json({ googleClientId: getEnv().GOOGLE_CLIENT_ID ?? null });
  });

  router.get('/me', (req, res) => {
    res.json({ user: req.user ? toUserDTO(req.user) : null });
  });

  router.post('/register', authLimiter, async (req, res) => {
    const input = parseBody(registerSchema, req);
    const passwordHash = await hashPassword(input.password);
    try {
      const user = await db.user.create({
        data: { email: input.email, passwordHash, displayName: input.displayName, lastLoginAt: new Date() },
        select: userSelect,
      });
      const token = await createSession(db, user.id, req.get('user-agent'));
      setSessionCookie(res, token);
      res.status(201).json({ user: toUserDTO(user) });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw conflict('EMAIL_TAKEN', 'An account with this email already exists. Try signing in instead.');
      }
      throw err;
    }
  });

  router.post('/login', authLimiter, async (req, res) => {
    const input = parseBody(loginSchema, req);
    const found = await db.user.findUnique({ where: { email: input.email }, select: { ...userSelect, passwordHash: true } });
    // Always run a hash comparison so response time does not reveal whether the email exists.
    const ok = await verifyPassword(input.password, found?.passwordHash ?? (await getDummyHash()));
    if (!found || !found.passwordHash || !ok) throw unauthorized('Email or password is incorrect.');
    const { passwordHash: _ph, ...user } = found;
    void _ph;
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = await createSession(db, user.id, req.get('user-agent'));
    setSessionCookie(res, token);
    res.json({ user: toUserDTO(user) });
  });

  router.post('/google', authLimiter, async (req, res) => {
    const clientId = getEnv().GOOGLE_CLIENT_ID;
    if (!clientId) throw new HttpError(404, 'NOT_CONFIGURED', 'Google sign-in is not enabled on this server.');
    const { credential } = parseBody(googleLoginSchema, req);
    let identity;
    try {
      identity = await verifyGoogleCredential(credential, clientId);
    } catch {
      throw badRequest('Google sign-in could not be verified. Please try again.');
    }
    let user = await db.user.findUnique({ where: { googleSub: identity.sub }, select: userSelect });
    if (!user) {
      const byEmail = await db.user.findUnique({ where: { email: identity.email }, select: userSelect });
      user = byEmail
        ? await db.user.update({ where: { id: byEmail.id }, data: { googleSub: identity.sub }, select: userSelect })
        : await db.user.create({
            data: { email: identity.email, googleSub: identity.sub, displayName: identity.name },
            select: userSelect,
          });
    }
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = await createSession(db, user.id, req.get('user-agent'));
    setSessionCookie(res, token);
    res.json({ user: toUserDTO(user) });
  });

  router.post('/logout', async (req, res) => {
    if (req.sessionTokenHash) await destroySession(db, req.sessionTokenHash);
    clearSessionCookie(res);
    res.status(204).end();
  });

  return router;
}
