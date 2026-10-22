import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().max(365).default(30),
  BEHIND_PROXY: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  GOOGLE_CLIENT_ID: z.string().optional().transform((v) => (v ? v : undefined)),
  WEB_DIST_DIR: z.string().optional().transform((v) => (v ? v : undefined)),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}\nSee apps/server/.env.example.`);
  }
  cached = parsed.data;
  return cached;
}

export function allowedOrigins(env: Env = getEnv()): string[] {
  return env.APP_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/** For tests: forget the cached env so changes to process.env take effect. */
export function resetEnvCache(): void {
  cached = null;
}
