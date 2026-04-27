import { expect, test } from '@playwright/test';

test('home page renders without framework overlay', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');

  await expect(page.locator('h1')).toContainText('الأَكَادِيمِيَّةُ المَالِكِيَّةُ');
  await expect(page.getByText('0 / 12')).toBeVisible();
  await expect(page.locator('.vite-error-overlay')).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});
