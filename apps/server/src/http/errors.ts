import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, type ZodType, type output } from 'zod';
import type { Request } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = 'Please sign in to continue.') => new HttpError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'You do not have access to this resource.') => new HttpError(403, 'FORBIDDEN', message);
export const notFound = (message = 'Not found.') => new HttpError(404, 'NOT_FOUND', message);
export const conflict = (code: string, message: string, details?: unknown) => new HttpError(409, code, message, details);
export const tooManyRequests = (message: string) => new HttpError(429, 'RATE_LIMITED', message);

/** Parses `req.body` with a Zod schema, turning validation failures into a 400. */
export function parseBody<T extends ZodType>(schema: T, req: Request) {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw badRequest(
      'Some fields are invalid.',
      result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }
  return result.data as output<T>;
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(notFound('This API route does not exist.'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  void _next;
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid request.', details: err.issues } });
    return;
  }
  // body-parser errors (malformed JSON, payload too large)
  const status = (err as { status?: number; statusCode?: number }).status ?? (err as { statusCode?: number }).statusCode;
  if (status === 400 || status === 413 || status === 415) {
    res.status(status).json({
      error: { code: status === 413 ? 'PAYLOAD_TOO_LARGE' : 'BAD_REQUEST', message: status === 413 ? 'Request is too large.' : 'Malformed request body.' },
    });
    return;
  }
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong on our side. Please try again.' } });
};

/** Reads a single route parameter as a string (Express 5 types allow arrays for wildcards). */
export function param(req: Request, name: string): string {
  const v = (req.params as Record<string, string | string[] | undefined>)[name];
  return Array.isArray(v) ? v.join('/') : (v ?? '');
}
