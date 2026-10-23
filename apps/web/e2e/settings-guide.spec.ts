import { expect, test } from '@playwright/test';
import { addComponent, autoArrange, connect, nodeIdByType } from './helpers';

test('configuration guide: every setting explained, filters and deep links', async ({ page }) => {
  await page.goto('/learn');
  await page.getByTestId('configuration-guide-link').click();
  await expect(page).toHaveURL(/\/learn\/settings$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Every setting, explained simply' })).toBeVisible();
  await expect(page.getByTestId('settings-group')).toHaveCount(11);

  // One setting: meaning, real-life example, every option and challenge tips.
  const availability = page.getByTestId('setting-card-setting-availability');
  await expect(availability.getByRole('heading', { name: 'Availability' })).toBeVisible();
  await expect(availability.getByText('Real-life example')).toBeVisible();
  await expect(availability.getByTestId(/^setting-option-/)).toHaveCount(3);
  await expect(availability.getByText('In challenges')).toBeVisible();

  // Explanations follow the language toggle.
  await page.getByRole('button', { name: 'Hinglish' }).first().click();
  await expect(availability.getByText(/Ek hi darwaze wali building/)).toBeVisible();
  await page.getByRole('button', { name: 'English' }).first().click();

  // Search looks inside the explanations too.
  await page.getByTestId('settings-search').fill('circuit breaker');
  await expect(page.getByTestId('setting-card-setting-circuitBreaker')).toBeVisible();
  await expect(page.getByTestId('setting-card-setting-availability')).toHaveCount(0);
  await page.getByTestId('settings-search').fill('');

  // Filter by component: same order as the Properties panel.
  await page.getByTestId('settings-component-filter').selectOption('load-balancer');
  await expect(page).toHaveURL(/component=load-balancer/);
  await expect(page.getByTestId('settings-component-banner')).toContainText('Settings of Load Balancer');
  await expect(page.getByRole('heading', { name: /Main settings/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Advanced settings/ })).toBeVisible();
  await expect(page.locator('[data-testid^="setting-card-"]')).toHaveCount(5);

  // Deep link to one setting scrolls it into view.
  await page.goto('/learn/settings#setting-consistency');
  await expect(page.getByTestId('setting-card-setting-consistency')).toBeInViewport();

  // Component guides link to their settings.
  await page.goto('/learn/distributed-cache');
  await page.getByTestId('guide-settings-link').click();
  await expect(page).toHaveURL(/\/learn\/settings\?component=distributed-cache/);
  await expect(page.getByTestId('setting-card-setting-cacheReplication')).toBeVisible();
});

test('playground: explain the settings of the selected component and connection', async ({ page }) => {
  await page.goto('/challenges/url-shortener-basic/play');
  const tour = page.getByRole('dialog', { name: 'Getting started tour' });
  if (await tour.isVisible().catch(() => false)) await tour.getByRole('button', { name: 'Skip tour' }).first().click();

  const web = await nodeIdByType(page, 'web-client');
  const lb = await addComponent(page, 'load-balancer');
  await autoArrange(page);
  await connect(page, web, lb);

  await page.locator(`.react-flow__node[data-id="${lb}"]`).click();
  const panel = page.getByTestId('properties-panel');
  await panel.getByLabel('Availability').selectOption('active-passive');
  await panel.getByTestId('explain-settings').click();

  const dialog = page.getByRole('dialog', { name: 'Settings explained: Load Balancer' });
  await expect(dialog).toBeVisible();
  const card = dialog.getByTestId('setting-card-setting-availability');
  await expect(card.getByTestId('setting-current')).toHaveText('Your choice: Active-passive pair');
  await expect(card.getByTestId('setting-option-active-passive')).toContainText('Selected');
  await expect(dialog.getByTestId('setting-card-setting-lbLayer')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();

  // Connection settings are explained too.
  await page.locator('.react-flow__edge').first().click({ force: true });
  await page.getByTestId('explain-connection-settings').click();
  const edgeDialog = page.getByRole('dialog', { name: 'Connection settings explained' });
  await expect(edgeDialog.getByTestId('setting-card-connection-mode')).toBeVisible();
  await expect(edgeDialog.getByTestId('setting-card-connection-mode').getByTestId('setting-current')).toHaveText('Your choice: Synchronous');
});
