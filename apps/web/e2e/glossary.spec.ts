import { expect, test } from '@playwright/test';
import { addComponent, autoArrange, connect, nodeIdByType } from './helpers';

test('tap an underlined term to see its meaning, in English or Hinglish', async ({ page }) => {
  await page.goto('/prep/backend/should-every-failed-request-be-retried');
  const term = page.getByTestId('prep-short-answer').getByRole('button', { name: 'non-idempotent request' });
  await expect(term).toBeVisible();
  await term.click();

  const dialog = page.getByRole('dialog', { name: 'Idempotency' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('glossary-meaning')).toContainText('same effect as doing it once');
  await expect(dialog.getByText('Real-life example')).toBeVisible();

  // The popup has its own language switch.
  await dialog.getByRole('button', { name: 'Hinglish' }).click();
  await expect(dialog.getByTestId('glossary-meaning')).toContainText('ek baar karne jitna hi ho');
  await dialog.getByRole('button', { name: 'English' }).click();

  // Related terms open in place.
  await dialog.getByTestId('glossary-related').filter({ hasText: 'Exponential backoff' }).click();
  await expect(page.getByRole('dialog', { name: 'Exponential backoff' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // “exponential backoff” is underlined in the section heading’s paragraph too.
  await expect(page.getByTestId('glossary-term').filter({ hasText: /^jitter$/ }).first()).toBeVisible();
});

test('the language switch floats while scrolling, and term underlines can be turned off', async ({ page }) => {
  await page.goto('/prep/backend/rest-api-design-and-versioning');
  const floating = page.getByTestId('floating-language');
  await expect(floating).toHaveCSS('opacity', '0');
  await page.locator('#part-4').scrollIntoViewIfNeeded();
  await expect(floating).toHaveCSS('opacity', '1');

  await floating.getByRole('button', { name: 'Hinglish' }).click();
  await expect(page.getByTestId('prep-question-title')).toContainText('REST API design karte waqt');
  await floating.getByRole('button', { name: 'English' }).click();

  const terms = page.getByTestId('glossary-term');
  expect(await terms.count()).toBeGreaterThan(5);
  await floating.getByTestId('toggle-term-hints').click();
  await expect(terms).toHaveCount(0);
  await floating.getByTestId('toggle-term-hints').click();
  await expect(terms.first()).toBeVisible();
});

test('a term popup opened inside another dialog closes on its own', async ({ page }) => {
  await page.goto('/challenges/url-shortener-basic/play');
  const tour = page.getByRole('dialog', { name: 'Getting started tour' });
  if (await tour.isVisible().catch(() => false)) await tour.getByRole('button', { name: 'Skip tour' }).first().click();
  const web = await nodeIdByType(page, 'web-client');
  const lb = await addComponent(page, 'load-balancer');
  await autoArrange(page);
  await connect(page, web, lb);
  await page.locator(`.react-flow__node[data-id="${lb}"]`).click();
  await page.getByTestId('explain-settings').click();

  const settings = page.getByRole('dialog', { name: 'Settings explained: Load Balancer' });
  await expect(settings).toBeVisible();
  await settings.getByTestId('glossary-term').first().click();
  await expect(page.getByTestId('glossary-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('glossary-dialog')).toHaveCount(0);
  await expect(settings).toBeVisible();
});

test('the glossary page lists and searches every term', async ({ page }) => {
  await page.goto('/learn');
  await page.getByTestId('glossary-link').click();
  await expect(page).toHaveURL(/\/learn\/glossary$/);
  await expect(page.getByTestId('glossary-card').first()).toBeVisible();
  expect(await page.getByTestId('glossary-card').count()).toBeGreaterThan(120);
  await page.getByTestId('glossary-search').fill('backoff');
  await expect(page.getByTestId('glossary-card').first()).toContainText('Exponential backoff');
  await page.goto('/learn/glossary#term-jwt');
  await expect(page.locator('#term-jwt')).toBeInViewport();
});
