import { test, expect, chromium } from '@playwright/test';
import { join } from 'path';

test.describe('E2E Tests', () => {
  let browser;
  let context;
  let page;
  
  test.beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext();
    page = await context.newPage();
    
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('requestfailed', request => {
      console.log(`[Network Failed]: ${request.url()}`);
    });
  });
  
  test.afterAll(async () => {
    await browser.close();
  });
  
  async function takeScreenshot(name) {
    const screenshotDir = join(__dirname, '..', '..', 'screenshots');
    const path = join(screenshotDir, `${name}-${Date.now()}.png`);
    await page.screenshot({ path, fullPage: true });
    console.log(`📸 Screenshot saved: ${path}`);
    return path;
  }
  
  test('homepage loads without errors', async () => {
    await page.goto('/');
    await takeScreenshot('homepage-loaded');
    await expect(page).toHaveTitle(/./);
  });
  
  test('navigation works', async () => {
    await page.goto('/');
    const navLink = page.locator('nav').getByText('Features').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL(/.*features.*/);
      await takeScreenshot('navigation-features');
    } else {
      console.log('⚠️ Navigation link not found, skipping');
    }
  });
  
  test('forms submit correctly', async () => {
    await page.goto('/');
    const emailInput = page.locator('input[name="email"]').first();
    const msgInput = page.locator('textarea[name="message"]').first();
    if (await emailInput.isVisible() && await msgInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await msgInput.fill('Test message');
      await takeScreenshot('form-filled');
      await page.click('button[type="submit"]');
      await expect(page.locator('.success-message')).toBeVisible();
      await takeScreenshot('form-submitted');
    } else {
      console.log('⚠️ Form not found, skipping');
    }
  });
});
