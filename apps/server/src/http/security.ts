import type { Request, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { allowedOrigins } from '../env';
import { forbidden } from './errors';

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF defence in depth (cookies are already SameSite=Lax): state-changing requests
 * that carry an Origin header must come from the app's own origin.
 */
export const originCheck: RequestHandler = (req, _res, next) => {
  if (!UNSAFE.has(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // non-browser clients (curl, tests) — cookies still require SameSite
  const self = `${req.protocol}://${req.get('host')}`;
  if (origin === self || allowedOrigins().includes(origin)) return next();
  next(forbidden('Cross-origin request blocked.'));
};

const json429 = (message: string) => ({ error: { code: 'RATE_LIMITED', message } });

const userOrIpKey = (req: Request) => req.user?.id ?? `ip:${req.ip ?? 'unknown'}`;

/** Brute-force protection for sign-in and registration. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json429('Too many sign-in attempts. Please wait a few minutes and try again.'),
});

/** Evaluations are CPU-bound; keep them fair. */
export const evaluationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: json429('You are evaluating very quickly. Take a breath and try again in a minute.'),
});

/** General write limiter for drafts and other mutations. */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 5000 : 240,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  message: json429('Too many requests. Please slow down.'),
});
