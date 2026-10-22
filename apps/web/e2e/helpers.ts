import { expect, type Page } from '@playwright/test';

export const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

export async function register(page: Page, name = 'E2E Tester') {
  const email = uniqueEmail();
  await page.goto('/register');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('secret-pass-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  return email;
}

/** Adds a component from the library (click-to-add) and returns its React Flow node id. */
export async function addComponent(page: Page, type: string): Promise<string> {
  const before = await page.locator('.react-flow__node').evaluateAll((els) => els.map((e) => e.getAttribute('data-id')));
  await page.getByTestId(`library-${type}`).click();
  const handle = page.locator('.react-flow__node').filter({ has: page.getByTestId(`node-${type}`) });
  await expect(handle.last()).toBeVisible();
  const after = await page.locator('.react-flow__node').evaluateAll((els) => els.map((e) => e.getAttribute('data-id')));
  const id = after.find((x) => !before.includes(x));
  if (!id) throw new Error(`No new node for ${type}`);
  return id;
}

export async function nodeIdByType(page: Page, type: string): Promise<string> {
  const el = page.locator('.react-flow__node').filter({ has: page.getByTestId(`node-${type}`) }).first();
  const id = await el.getAttribute('data-id');
  if (!id) throw new Error(`Node ${type} not found`);
  return id;
}

/** Drags a connection from the right handle of one node to the left handle of another. */
export async function connect(page: Page, sourceId: string, targetId: string) {
  const source = page.locator(`.react-flow__node[data-id="${sourceId}"]`);
  const target = page.locator(`.react-flow__node[data-id="${targetId}"]`);
  await source.hover();
  const from = await source.locator('.react-flow__handle[data-handleid="r"]').boundingBox();
  await target.hover();
  const to = await target.locator('.react-flow__handle[data-handleid="l"]').boundingBox();
  if (!from || !to) throw new Error('Handle not found');
  const edgesBefore = await page.locator('.react-flow__edge').count();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(edgesBefore + 1);
}

export async function autoArrange(page: Page) {
  await page.getByRole('button', { name: 'Reset layout (auto-arrange)' }).click();
  await page.waitForTimeout(400);
}
