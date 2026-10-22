import { execSync } from 'node:child_process';
import path from 'node:path';

/** Prepares the e2e database: applies migrations and seeds the question bank. */
export default function globalSetup() {
  const db = process.env.E2E_DATABASE_URL ?? 'postgresql://archarena:archarena@localhost:5432/archarena_e2e?schema=public';
  const server = path.resolve(import.meta.dirname, '../../server');
  const env = { ...process.env, DATABASE_URL: db };
  execSync('npx prisma migrate deploy', { cwd: server, env, stdio: 'inherit' });
  execSync('npx tsx prisma/seed.ts', { cwd: server, env, stdio: 'inherit' });
}
