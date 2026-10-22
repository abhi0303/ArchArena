import { expect, test } from '@playwright/test';
import { addComponent, autoArrange, connect, nodeIdByType } from './helpers';

/** The GitHub Pages build: everything runs in the browser under /ArchArena/. */
const B = '/ArchArena';

test('deep links load through the 404 fallback and no account is needed', async ({ page }) => {
  const res = await page.goto(`${B}/learn/cdn`);
  expect(res?.status()).toBe(404); // GitHub Pages answers 404.html — the app still renders the page
  await expect(page.getByRole('heading', { level: 1, name: 'CDN' })).toBeVisible();
  await expect(page.getByTestId('static-notice')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in' })).toHaveCount(0);

  await page.goto(`${B}/login`);
  await expect(page).toHaveURL(new RegExp(`${B}/dashboard$`));
  await expect(page.getByTestId('stat-completed')).toHaveText('0');
});

test('the full challenge loop runs in the browser and survives a reload', async ({ page }) => {
  await page.goto(`${B}/challenges/url-shortener-basic/play`);
  const tour = page.getByRole('dialog', { name: 'Getting started tour' });
  if (await tour.isVisible().catch(() => false)) await tour.getByRole('button', { name: 'Skip tour' }).first().click();

  const web = await nodeIdByType(page, 'web-client');
  const lb = await addComponent(page, 'load-balancer');
  const app = await addComponent(page, 'app-server');
  const db = await addComponent(page, 'sql-db');
  await autoArrange(page);
  await connect(page, web, lb);
  await connect(page, lb, app);
  await connect(page, app, db);
  await expect(page.getByTestId('save-status')).toHaveAttribute('title', /Saved in this browser/, { timeout: 15_000 });

  await page.getByTestId('evaluate-button').click();
  await expect(page).toHaveURL(/\/ArchArena\/challenges\/url-shortener-basic\/attempts\//);
  const score = Number(await page.getByTestId('report-score').innerText());
  expect(score).toBeGreaterThan(0);

  await page.getByRole('link', { name: 'Back to playground' }).click();
  await page.getByTestId('final-submit-button').click();
  await expect(page.getByTestId('final-score')).toHaveText(`${score}/100`, { timeout: 20_000 });
  await page.getByTestId('confirm-final-submit').click();
  await expect(page).toHaveURL(/\/submissions\//);
  const xp = Number((await page.getByTestId('xp-gained').innerText()).replace(/[^0-9]/g, ''));
  expect(xp).toBeGreaterThan(0);

  // Everything is stored on this device: reload and it is all still there.
  await page.goto(`${B}/dashboard`);
  await page.reload();
  await expect(page.getByTestId('stat-xp')).not.toHaveText('0 XP');
  await page.goto(`${B}/challenges/url-shortener-basic/reference`);
  await expect(page.getByRole('heading', { name: 'Reference architecture' })).toBeVisible();
  await page.goto(`${B}/challenges/url-shortener-basic/play`);
  await expect(page.locator('.react-flow__node')).toHaveCount(4);
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
});

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto(`${B}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  // Let the service worker finish precaching every chunk.
  await page.waitForTimeout(2_000);

  await context.setOffline(true);
  await page.goto(`${B}/challenges`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto(`${B}/learn/compare/sql-vs-nosql`);
  await expect(page.getByRole('heading', { level: 1, name: 'SQL Database vs NoSQL Database' })).toBeVisible();
  await page.goto(`${B}/challenges/url-shortener-basic`);
  await expect(page.getByTestId('start-challenge').first()).toBeVisible();
  await context.setOffline(false);
});

test('phone layout works on the Pages build @mobile', async ({ page }) => {
  await page.goto(`${B}/`);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Learn' }).click();
  await expect(page).toHaveURL(new RegExp(`${B}/learn$`));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
