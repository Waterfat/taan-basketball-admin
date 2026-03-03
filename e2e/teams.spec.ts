import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Teams', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows team list', async ({ page }) => {
    await page.goto('/#/teams');
    await expect(page.getByRole('heading', { name: '隊伍管理' })).toBeVisible();
    // Table headers
    await expect(page.getByRole('columnheader', { name: '隊伍' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '代碼' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '顏色' })).toBeVisible();
  });

  test('teams display name and color column', async ({ page }) => {
    await page.goto('/#/teams');
    // Wait for table to load — should have at least one row with edit link
    await expect(page.getByText('編輯').first()).toBeVisible();
    // Color swatches are rendered as inline-block spans with background
    const colorSwatches = page.locator('span.rounded.border');
    await expect(colorSwatches.first()).toBeVisible();
  });
});
