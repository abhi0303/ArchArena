import { expect, test } from '@playwright/test';
import { nodeIdByType } from './helpers';

test('learn tab: guides, language toggle, comparisons and quiz', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Learn' }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole('heading', { name: 'Understand every building block' })).toBeVisible();
  await expect(page.getByTestId('learning-path').getByRole('link')).toHaveCount(10);
  await expect(page.getByTestId('comparison-list').getByRole('link')).toHaveCount(26);

  // Search narrows the list.
  await page.getByPlaceholder('Search: cache, queue, login…').fill('queue');
  await expect(page.getByRole('link', { name: /Dead-Letter Queue/ })).toBeVisible();
  await page.getByPlaceholder('Search: cache, queue, login…').fill('');

  // A guide shows before/after illustrations and every section.
  await page.goto('/learn/load-balancer');
  await expect(page.getByRole('heading', { level: 1, name: 'Load Balancer' })).toBeVisible();
  await expect(page.locator('figure')).toHaveCount(2);
  for (const section of ['In simple words', 'How it works, step by step', 'Real-life analogy', 'Where it fits perfectly', 'Don’t confuse it with']) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible();
  }

  // Explanations switch to Hinglish; headings stay English.
  await page.getByRole('button', { name: 'Hinglish' }).first().click();
  await expect(page.getByText('Ek traffic controller jo requests ko kai servers mein baantta hai.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'In simple words' })).toBeVisible();
  await page.getByRole('button', { name: 'English' }).first().click();

  // Comparison page with a working quiz.
  await page.getByRole('link', { name: 'Compare side by side' }).first().click();
  await expect(page).toHaveURL(/\/learn\/compare\//);
  const questions = page.getByTestId('quiz-question');
  await expect(questions.first()).toBeVisible();
  const count = await questions.count();
  expect(count).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < count; i++) await questions.nth(i).getByRole('button').first().click();
  await expect(page.getByTestId('quiz-score')).toBeVisible();
});

test('learn from inside the playground', async ({ page }) => {
  await page.goto('/challenges/url-shortener-basic/play');
  const tour = page.getByRole('dialog', { name: 'Getting started tour' });
  if (await tour.isVisible().catch(() => false)) await tour.getByRole('button', { name: 'Skip tour' }).first().click();

  const web = await nodeIdByType(page, 'web-client');
  await page.locator(`.react-flow__node[data-id="${web}"]`).click();
  await page.getByTestId('learn-component').click();
  const dialog = page.getByRole('dialog', { name: 'Learn: Web Client' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'In simple words' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/play$/);
});
