import { expect, test } from '@playwright/test';
import { addComponent, autoArrange, connect, nodeIdByType } from './helpers';

test('replace a component without redoing its connections', async ({ page }) => {
  await page.goto('/challenges/url-shortener-basic/play');
  const tour = page.getByRole('dialog', { name: 'Getting started tour' });
  if (await tour.isVisible().catch(() => false)) await tour.getByRole('button', { name: 'Skip tour' }).first().click();

  const web = await nodeIdByType(page, 'web-client');
  const app = await addComponent(page, 'app-server');
  const cache = await addComponent(page, 'in-memory-cache');
  const db = await addComponent(page, 'sql-db');
  await autoArrange(page);
  await connect(page, web, app);
  await connect(page, app, cache);
  await connect(page, app, db);
  const edges = page.locator('.react-flow__edge');
  await expect(edges).toHaveCount(3);

  // Select the cache and swap it for a distributed cache.
  await page.locator(`.react-flow__node[data-id="${cache}"]`).click();
  await page.getByTestId('replace-component').click();
  const dialog = page.getByRole('dialog', { name: 'Replace In-Memory Cache' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('replace-similar').getByTestId('replace-with-distributed-cache')).toBeVisible();
  await dialog.getByTestId('replace-with-distributed-cache').click();
  await expect(dialog).toBeHidden();

  const replaced = page.locator(`.react-flow__node[data-id="${cache}"]`);
  await expect(replaced.getByTestId('node-distributed-cache')).toBeVisible();
  await expect(replaced).toContainText('Distributed Cache');
  await expect(edges).toHaveCount(3);
  await expect(page.locator('.react-flow__node')).toHaveCount(4);
  await expect(page.getByText(/Replaced In-Memory Cache with Distributed Cache/)).toBeVisible();

  // Searching works, and one undo brings the original back.
  await page.getByTestId('replace-component').click();
  await page.getByRole('dialog', { name: 'Replace Distributed Cache' }).getByPlaceholder('Search: cache, queue, gateway…').fill('redis');
  await expect(page.getByTestId('replace-with-distributed-cache')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(replaced.getByTestId('node-in-memory-cache')).toBeVisible();
  await expect(edges).toHaveCount(3);
});
