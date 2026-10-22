import { defineConfig } from 'vitest/config';

/** Integration tests run against a real PostgreSQL database (never the dev database). */
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgresql://archarena:archarena@localhost:5432/archarena_test?schema=public';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globalSetup: ['./test/global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      APP_ORIGIN: 'http://localhost:5173',
      GOOGLE_CLIENT_ID: '',
    },
    // Test files share one database; run them one after another.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
});
