import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Seasons', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows season list', async ({ page }) => {
    await page.goto('/#/seasons');
    await expect(page.getByRole('heading', { name: '賽季管理' })).toBeVisible();
    // Table headers
    await expect(page.getByText('屆數')).toBeVisible();
    await expect(page.getByText('名稱')).toBeVisible();
    await expect(page.getByText('狀態')).toBeVisible();
  });

  test('current season is marked', async ({ page }) => {
    await page.goto('/#/seasons');
    await expect(page.getByText('進行中')).toBeVisible();
  });
});
