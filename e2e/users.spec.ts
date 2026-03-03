import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Users', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows user list', async ({ page }) => {
    await page.goto('/#/users');
    await expect(page.getByRole('heading', { name: '使用者管理' })).toBeVisible();
    // Table headers
    await expect(page.getByText('帳號')).toBeVisible();
    await expect(page.getByText('顯示名稱')).toBeVisible();
    await expect(page.getByText('角色')).toBeVisible();
  });

  test('admin user is listed', async ({ page }) => {
    await page.goto('/#/users');
    // The logged-in admin user should appear in the user list
    await expect(page.getByText('admin').first()).toBeVisible({ timeout: 10000 });
  });
});
