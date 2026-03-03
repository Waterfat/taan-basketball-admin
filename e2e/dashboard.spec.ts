import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows stats cards', async ({ page }) => {
    await expect(page.getByText('目前賽季')).toBeVisible();
    await expect(page.getByText('本週賽程')).toBeVisible();
    await expect(page.getByText('隊伍數')).toBeVisible();
    await expect(page.getByText('比賽進度')).toBeVisible();
  });

  test('shows recent schedule section', async ({ page }) => {
    await expect(page.getByText('最近賽程')).toBeVisible();
  });

  test('shows quick action section', async ({ page }) => {
    await expect(page.getByText('快速操作')).toBeVisible();
    await expect(page.getByText('輸入數據')).toBeVisible();
    await expect(page.getByText('管理出席')).toBeVisible();
    await expect(page.getByText('編輯賽程')).toBeVisible();
    await expect(page.getByRole('link', { name: '管理球員' })).toBeVisible();
  });

  test('quick action links navigate correctly', async ({ page }) => {
    await page.getByText('輸入數據').click();
    await expect(page).toHaveURL(/.*#\/boxscore/);
  });
});
