import { test, expect } from '@playwright/test';
import { login } from './helpers';

const sidebarLinks = [
  { label: '總覽', urlPattern: /\/#\/$/ },
  { label: '賽程', urlPattern: /#\/schedule/ },
  { label: '數據輸入', urlPattern: /#\/boxscore/ },
  { label: '出席管理', urlPattern: /#\/attendance/ },
  { label: '輪值排班', urlPattern: /#\/rotation/ },
  { label: '球員', urlPattern: /#\/players/ },
  { label: '隊伍', urlPattern: /#\/teams/ },
  { label: '賽季', urlPattern: /#\/seasons/ },
  { label: '龍虎榜', urlPattern: /#\/dragon/ },
  { label: '公告', urlPattern: /#\/announcements/ },
  { label: '使用者', urlPattern: /#\/users/ },
];

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const link of sidebarLinks) {
    test(`sidebar link "${link.label}" navigates correctly`, async ({ page }) => {
      // Click the sidebar link (inside aside nav)
      await page.locator('aside').getByText(link.label, { exact: true }).click();
      await expect(page).toHaveURL(link.urlPattern);
    });
  }

  test('active sidebar link is highlighted', async ({ page }) => {
    // On dashboard, "總覽" should have the active class
    const dashboardLink = page.locator('aside').getByText('總覽', { exact: true });
    await expect(dashboardLink).toHaveClass(/orange/);

    // Navigate to players
    await page.locator('aside').getByText('球員', { exact: true }).click();
    const playerLink = page.locator('aside').getByText('球員', { exact: true });
    await expect(playerLink).toHaveClass(/orange/);
  });
});
