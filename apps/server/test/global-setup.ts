import { execSync } from 'node:child_process';
import path from 'node:path';

/** Applies migrations and seeds the question bank into the test database once per run. */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://archarena:archarena@localhost:5432/archarena_test?schema=public';
  if (/\/archarena(\?|$)/.test(url)) throw new Error('Refusing to run tests against the development database.');
  const cwd = path.resolve(import.meta.dirname, '..');
  const env = { ...process.env, DATABASE_URL: url, NODE_ENV: 'test' };
  execSync('npx prisma migrate deploy', { cwd, env, stdio: 'pipe' });
  execSync('npx tsx prisma/seed.ts', { cwd, env, stdio: 'pipe' });
}
