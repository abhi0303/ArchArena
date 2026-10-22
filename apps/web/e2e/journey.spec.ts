import { expect, test, type Page } from '@playwright/test';
import { addComponent, autoArrange, connect, nodeIdByType, register } from './helpers';

/** Set SHOTS=<dir> to capture screenshots of each step for visual review. */
const shot = async (page: Page, name: string) => {
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${name}.png`, fullPage: false });
};

/**
 * Register → open a challenge → read the problem → build → validate → evaluate → improve →
 * final submit → receive stars & XP → resume from the dashboard.
 */
test('complete learning journey', async ({ page }) => {
  await register(page);

  // Open a challenge and read the problem (with the explanation-only language toggle).
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Challenges' }).click();
  await page.getByRole('link', { name: 'URL Shortener (Basic)' }).click();
  const statement = page.getByTestId('problem-statement');
  await expect(statement).toContainText('long URLs');
  await shot(page, '02-question');
  await page.getByRole('button', { name: 'Hinglish' }).first().click();
  await expect(statement).toContainText('lambe URLs');
  await expect(page.getByRole('heading', { name: 'Requirements' })).toBeVisible(); // UI stays English
  await page.getByRole('button', { name: 'English' }).first().click();

  await page.getByTestId('start-challenge').first().click();
  await expect(page).toHaveURL(/\/play$/);

  // First-use walkthrough appears and can be skipped.
  await expect(page.getByRole('dialog', { name: 'Getting started tour' })).toBeVisible();
  await shot(page, '03-playground-tour');
  await page.getByRole('button', { name: 'Skip tour' }).first().click();

  // Build a minimal architecture: Web Client (starter) → App Server → SQL DB.
  const web = await nodeIdByType(page, 'web-client');
  const app = await addComponent(page, 'app-server');
  const db = await addComponent(page, 'sql-db');
  await autoArrange(page);
  await connect(page, web, app);
  await connect(page, app, db);

  // Validate (local, no attempt used).
  await page.getByTestId('validate-button').click();
  await expect(page.getByTestId('validation-panel')).toBeVisible();
  await shot(page, '04-validation');
  await page.getByRole('button', { name: 'Close validation results' }).click();

  // Autosave reaches the server.
  await expect(page.getByTestId('save-status')).toHaveAttribute('title', /Saved to your account/, { timeout: 15_000 });

  // Evaluate → results page.
  await page.getByTestId('evaluate-button').click();
  await expect(page).toHaveURL(/\/attempts\//);
  const firstScore = Number(await page.getByTestId('report-score').innerText());
  expect(firstScore).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'Suggested improvements' })).toBeVisible();
  await shot(page, '05-results');

  // Improve: add a load balancer and a cache, then evaluate again.
  await page.getByRole('link', { name: 'Back to playground' }).click();
  await expect(page).toHaveURL(/\/play$/);
  const lb = await addComponent(page, 'load-balancer');
  const cache = await addComponent(page, 'distributed-cache');
  await autoArrange(page);
  await connect(page, web, lb);
  await connect(page, lb, app);
  await connect(page, app, cache);

  // Configure a property through the properties panel.
  await page.locator(`.react-flow__node[data-id="${app}"]`).click();
  await page.getByTestId('properties-panel').getByLabel('Instances').selectOption('autoscaled');
  await shot(page, '06-playground-props');

  await page.getByTestId('evaluate-button').click();
  await expect(page).toHaveURL(/\/attempts\//);
  const secondScore = Number(await page.getByTestId('report-score').innerText());
  expect(secondScore).toBeGreaterThan(firstScore);
  await expect(page.getByRole('heading', { name: 'Compared with your previous attempt' })).toBeVisible();

  // Final submit from the playground.
  await page.getByRole('link', { name: 'Back to playground' }).click();
  await page.getByTestId('final-submit-button').click();
  await expect(page.getByTestId('final-score')).toHaveText(`${secondScore}/100`, { timeout: 20_000 });
  await shot(page, '07-final-dialog');
  await page.getByTestId('confirm-final-submit').click();
  await expect(page).toHaveURL(/\/submissions\//);
  await expect(page.getByRole('heading', { name: /completed!/ })).toBeVisible();
  const xp = await page.getByTestId('xp-gained').innerText();
  expect(Number(xp.replace(/[^0-9]/g, ''))).toBeGreaterThan(0);
  await shot(page, '08-submission');

  // Dashboard reflects stored progress and lets the user resume.
  await page.getByRole('link', { name: 'Go to dashboard' }).click();
  await expect(page.getByTestId('stat-completed')).toHaveText('1');
  await expect(page.getByTestId('stat-xp')).not.toHaveText('0 XP');
  await expect(page.getByTestId('continue-practicing')).toBeVisible();

  // Reference architecture is unlocked after an attempt.
  await page.goto('/challenges/url-shortener-basic/reference');
  await expect(page.getByRole('heading', { name: 'Reference architecture' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trade-offs' })).toBeVisible();
  await shot(page, '09-reference');

  // The draft is restored when reopening the playground.
  await page.goto('/challenges/url-shortener-basic/play');
  await expect(page.locator('.react-flow__node')).toHaveCount(5);
  await expect(page.locator('.react-flow__edge')).toHaveCount(5);
});
