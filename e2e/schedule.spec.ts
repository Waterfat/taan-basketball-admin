import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows week list', async ({ page }) => {
    await page.goto('/#/schedule');
    await expect(page.getByRole('heading', { name: '賽程管理' })).toBeVisible();
    // Table headers
    await expect(page.getByRole('columnheader', { name: '週次' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '日期' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '賽制' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '場地' })).toBeVisible();
  });

  test('week entries show data', async ({ page }) => {
    await page.goto('/#/schedule');
    // Wait for content to load — look for a W-prefixed week number or 停賽
    await expect(page.locator('text=/W\\d+|停賽/').first()).toBeVisible({ timeout: 10000 });
  });
});
