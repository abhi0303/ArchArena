import type { ApiErrorBody } from '@arch-arena/shared';
import { STATIC_MODE } from './env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when the request could not reach the server (offline, DNS, CORS, server down). */
export class NetworkError extends Error {
  constructor(message = 'You appear to be offline. Changes are kept on this device and will sync when you reconnect.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export const isNetworkError = (e: unknown): e is NetworkError => e instanceof NetworkError;
export const isApiError = (e: unknown, code?: string): e is ApiError => e instanceof ApiError && (!code || e.code === code);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  // Browser-only build (GitHub Pages): answer from the in-browser implementation of the API.
  if (STATIC_MODE) {
    const { localApi } = await import('./local/server');
    return localApi<T>(method, path, body);
  }
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new NetworkError();
  }
  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    if (!err && (res.status === 502 || res.status === 503 || res.status === 504)) throw new NetworkError('The server is not reachable right now.');
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? `Request failed (${res.status}).`, err?.details);
  }
  return data as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError || err instanceof NetworkError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}

/** Field-level messages from a 400 validation error, keyed by field path. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !Array.isArray(err.details)) return {};
  const out: Record<string, string> = {};
  for (const d of err.details as { path?: string; message?: string }[]) {
    if (d.path && d.message && !out[d.path]) out[d.path] = d.message;
  }
  return out;
}
