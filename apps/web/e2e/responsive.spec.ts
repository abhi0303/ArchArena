import { expect, test, type Page } from '@playwright/test';
import { register } from './helpers';

/** Runs in the "mobile" Playwright project (Pixel 7 viewport, touch). */

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('mobile navigation and pages fit the screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
  await expectNoHorizontalScroll(page);

  await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = page.getByRole('navigation', { name: 'Mobile' });
  await expect(nav).toBeVisible();
  await nav.getByRole('link', { name: 'Challenges' }).click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto('/challenges/url-shortener-basic');
  await expect(page.getByTestId('start-challenge').first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('learn pages fit a phone screen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Learn' }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expectNoHorizontalScroll(page);
  for (const path of ['/learn/media-server', '/learn/compare/worker-vs-consumer-vs-stream-vs-batch', '/learn/compare/websocket-vs-notifications-vs-providers']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
});

test('the page does not rubber-band when dragged past its edges', async ({ page }) => {
  await page.goto('/learn');
  const overscroll = await page.evaluate(() => [getComputedStyle(document.documentElement).overscrollBehaviorY, getComputedStyle(document.body).overscrollBehaviorY]);
  expect(overscroll).toEqual(['none', 'none']);
});

test('the playground works on a phone', async ({ page }) => {
  await register(page, 'Mobile Tester');
  await expectNoHorizontalScroll(page);

  await page.goto('/challenges/url-shortener-basic/play');
  const tour = page.getByRole('dialog', { name: 'Getting started tour' });
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Skip tour' }).first().click();

  // The component library is a drawer on small screens; adding a component closes it.
  const nodes = page.locator('.react-flow__node');
  const before = await nodes.count();
  await page.getByRole('button', { name: 'Toggle component library' }).click();
  const drawer = page.getByRole('dialog', { name: 'Component library' });
  await expect(drawer).toBeVisible();
  await drawer.getByTestId('library-app-server').click();
  await expect(drawer).toBeHidden();
  await expect(nodes).toHaveCount(before + 1);

  // Secondary actions live in the overflow menu.
  await page.getByRole('button', { name: 'More actions' }).click();
  await expect(page.getByRole('menuitem', { name: 'Final submit' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Fit to screen' }).click();

  // Validation runs locally and shows results.
  await page.getByTestId('validate-button').click();
  await expect(page.getByTestId('validation-panel')).toBeVisible();
  await expectNoHorizontalScroll(page);
});
