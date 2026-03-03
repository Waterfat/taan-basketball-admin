import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/#/login');
  await page.getByRole('textbox').first().fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.getByRole('button', { name: '登入' }).click();
  await page.waitForURL('**/');
}
