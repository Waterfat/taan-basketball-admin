import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Announcements', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows announcement list', async ({ page }) => {
    await page.goto('/#/announcements');
    await expect(page.getByRole('heading', { name: '公告管理' })).toBeVisible();
    // Wait for loading to complete: either items or empty message appear
    await expect(
      page.getByText('編輯').first().or(page.getByText('尚無公告'))
    ).toBeVisible({ timeout: 10000 });
  });
});
