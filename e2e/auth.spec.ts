import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Auth', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*#\/login/);
    await expect(page.getByText('大安聯盟後台')).toBeVisible();
    await expect(page.getByText('管理員登入')).toBeVisible();
  });

  test('login with valid credentials shows dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: '總覽' })).toBeVisible();
  });

  test('displays user info after login', async ({ page }) => {
    await login(page);
    await expect(page.getByText('管理員')).toBeVisible();
    await expect(page.getByText('SUPER_ADMIN')).toBeVisible();
  });

  test('logout returns to login page', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: '總覽' })).toBeVisible();
    await page.getByText('登出').click();
    await expect(page).toHaveURL(/.*#\/login/);
    await expect(page.getByText('管理員登入')).toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('textbox').first().fill('admin');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: '登入' }).click();
    // Should show error message on page or toast
    await expect(page.getByText(/登入失敗|密碼錯誤|帳號或密碼|Invalid|Unauthorized/i)).toBeVisible({ timeout: 5000 });
  });
});
