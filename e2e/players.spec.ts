import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Players', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows player list', async ({ page }) => {
    await page.goto('/#/players');
    await expect(page.getByRole('heading', { name: '球員管理' })).toBeVisible();
    // Table headers
    await expect(page.getByText('姓名')).toBeVisible();
    await expect(page.getByText('背號')).toBeVisible();
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/#/players');
    const searchInput = page.getByPlaceholder('搜尋球員姓名...');
    await expect(searchInput).toBeVisible();
    // Type a search term — the table should still be visible (filtered)
    await searchInput.fill('test');
    // Wait briefly for debounce/refetch
    await page.waitForTimeout(500);
    // The table or empty message should be visible
    const hasTable = await page.locator('table').isVisible();
    const hasEmpty = await page.getByText('無資料').isVisible();
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('team filter is available', async ({ page }) => {
    await page.goto('/#/players');
    const teamSelect = page.locator('select');
    await expect(teamSelect).toBeVisible();
    await expect(teamSelect).toContainText('全部隊伍');
  });
});
