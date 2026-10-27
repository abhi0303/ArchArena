import { expect, test } from '@playwright/test';

test('interview prep: categories, search, a full answer, practice mode and progress', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Interview Prep' }).click();
  await expect(page).toHaveURL(/\/prep$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Prepare for interviews, one question at a time' })).toBeVisible();
  await expect(page.getByTestId('prep-categories').locator(':scope > li')).toHaveCount(8);

  // Frontend has its sub-sections, ready for questions.
  await page.goto('/prep/frontend');
  for (const name of ['General frontend', 'React', 'Angular']) await expect(page.getByRole('heading', { name: new RegExp(`^${name}`) })).toBeVisible();
  await page.getByTestId('prep-topic-react').click();
  await expect(page).toHaveURL(/topic=react/);
  await expect(page.getByText('No React questions yet')).toBeVisible();

  // Search finds questions by topic words.
  await page.goto('/prep');
  await page.getByTestId('prep-search').fill('jwt');
  await expect(page.getByTestId('prep-question-card')).toHaveCount(1);
  await page.getByTestId('prep-question-card').click();
  await expect(page).toHaveURL(/\/prep\/security\/sso-authentication-and-jwt$/);

  // Short answer, numbered parts with concrete examples, then the interview answer.
  await expect(page.getByTestId('prep-short-answer')).toContainText('central identity provider');
  await expect(page.getByTestId('prep-section')).toHaveCount(4);
  for (const section of ['The players', 'Where JWT fits', 'Interview-ready answer', 'What the interviewer listens for', 'Follow-up questions to prepare']) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible();
  }
  await expect(page.getByTestId('prep-code').first()).toBeVisible();
  await expect(page.getByTestId('prep-keywords').getByRole('listitem').first()).toBeVisible();
  await page.getByTestId('prep-follow-up').first().locator('summary').click();
  await expect(page.getByTestId('prep-follow-up').first()).toHaveAttribute('open', '');

  // Hinglish explanations; the question is also shown as asked in the interview.
  await page.getByRole('button', { name: 'Hinglish' }).first().click();
  await expect(page.getByTestId('prep-question-title')).toContainText('SSO system mein authentication');
  await expect(page.getByText(/In the interview: “In an SSO system/)).toBeVisible();
  await page.getByRole('button', { name: 'Hinglish mein samjho' }).click();
  await expect(page.getByTestId('prep-interview-answer')).toContainText('SSO mein authentication ek central identity provider');
  await page.getByRole('button', { name: 'English' }).first().click();

  // Progress is remembered and shows up on the home page.
  await page.getByTestId('prep-mark-revise').click();
  await expect(page.getByTestId('prep-mark-revise')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/prep');
  await expect(page.getByTestId('prep-revise-list').getByTestId('prep-question-card')).toHaveCount(1);

  // Practice mode hides the answer until the learner asks for it.
  await page.goto('/prep/devops/readiness-vs-liveness-probe');
  await page.getByTestId('prep-practice-mode').check();
  await expect(page.getByTestId('prep-practice-card')).toBeVisible();
  await expect(page.getByTestId('prep-interview-answer')).toHaveCount(0);
  await page.getByTestId('prep-reveal').click();
  await expect(page.getByTestId('prep-interview-answer')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Side by side' })).toBeVisible();

  // The next question starts hidden again.
  await page.getByTestId('prep-next').click();
  await expect(page.getByTestId('prep-practice-card')).toBeVisible();
  await page.getByTestId('prep-practice-mode').uncheck();
  await expect(page.getByTestId('prep-interview-answer')).toBeVisible();
});
