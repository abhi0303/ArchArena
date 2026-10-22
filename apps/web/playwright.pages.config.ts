import { defineConfig, devices } from '@playwright/test';

/**
 * Tests the GitHub Pages build (browser-only, served from /ArchArena/ with a 404.html fallback).
 * Builds the site, then serves it with a GitHub Pages emulator. No API server or database is used.
 */
const PORT = 4175;

export default defineConfig({
  testDir: './e2e',
  testMatch: /pages\.spec\.ts/,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'pages-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, grepInvert: /@mobile/ },
    { name: 'pages-mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    command: 'npm run build:pages && node scripts/serve-pages.mjs',
    url: `http://localhost:${PORT}/ArchArena/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { PORT: String(PORT), BASE_PATH: '/ArchArena/' },
  },
});
