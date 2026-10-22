import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run the real API (against a dedicated e2e database) and the Vite dev server.
 * Override the database with E2E_DATABASE_URL.
 */
const E2E_DB = process.env.E2E_DATABASE_URL ?? 'postgresql://archarena:archarena@localhost:5432/archarena_e2e?schema=public';
const API_PORT = 4099;
const WEB_PORT = 5199;

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /responsive\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../server',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { DATABASE_URL: E2E_DB, PORT: String(API_PORT), APP_ORIGIN: `http://localhost:${WEB_PORT}`, NODE_ENV: 'development' },
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { VITE_API_PROXY: `http://localhost:${API_PORT}` },
    },
  ],
});
