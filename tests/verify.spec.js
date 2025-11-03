import { test, expect } from '@playwright/test';

test('login and check customer management page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('#email').fill('kilicorhaan+1@gmail.com');
  await page.locator('#password').fill('Ocak2025.');
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await page.click('text=Müşteri Yönetimi');
  await expect(page).toHaveURL('http://localhost:3000/customers');
  await page.screenshot({ path: 'screenshot.png' });
});
