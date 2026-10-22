import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions, NextFunction, Request, RequestHandler, Response } from 'express';
import type { User } from '@prisma/client';
import type { Db } from '../db';
import { getEnv } from '../env';
import { unauthorized } from '../http/errors';

export const SESSION_COOKIE = 'aa_session';
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

export type AuthUser = Pick<User, 'id' | 'email' | 'displayName' | 'preferredLanguage' | 'xp' | 'level' | 'createdAt'>;

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    sessionTokenHash?: string;
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function cookieOptions(): CookieOptions {
  const env = getEnv();
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.BEHIND_PROXY || env.NODE_ENV === 'production',
    path: '/',
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

/** Creates a session and returns the opaque token. Only its SHA-256 hash is stored. */
export async function createSession(db: Db, userId: string, userAgent?: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const env = getEnv();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      userAgent: userAgent?.slice(0, 300),
      expiresAt: new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

export function clearSessionCookie(res: Response): void {
  const { maxAge: _maxAge, ...opts } = cookieOptions();
  void _maxAge;
  res.clearCookie(SESSION_COOKIE, opts);
}

const userSelect = {
  id: true,
  email: true,
  displayName: true,
  preferredLanguage: true,
  xp: true,
  level: true,
  createdAt: true,
} as const;

/** Resolves the session cookie (if any) into `req.user`. Never throws for missing sessions. */
export function attachUser(db: Db): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token || token.length > 200) return next();
    const tokenHash = hashToken(token);
    const session = await db.session.findUnique({ where: { tokenHash }, include: { user: { select: userSelect } } });
    if (!session) return next();
    if (session.expiresAt.getTime() < Date.now()) {
      await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
      return next();
    }
    req.user = session.user;
    req.sessionTokenHash = tokenHash;
    // Sliding expiration, at most once a day per session.
    if (Date.now() - session.lastSeenAt.getTime() > REFRESH_AFTER_MS) {
      const env = getEnv();
      await db.session
        .update({
          where: { id: session.id },
          data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000) },
        })
        .catch(() => undefined);
    }
    next();
  };
}

export const requireUser: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  next();
};

/** Narrowing helper for handlers mounted behind `requireUser`. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}

export async function destroySession(db: Db, tokenHash: string): Promise<void> {
  await db.session.deleteMany({ where: { tokenHash } });
}
