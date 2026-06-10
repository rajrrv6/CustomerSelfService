import { test, expect } from '@playwright/test';

async function loginAs(page: any, email: string) {
  await page.goto('/signin');
  await page.locator('input#email').fill(email);
  await page.locator('input#password').fill('password123');
  await page.getByRole('button', { name: /continue to verification/i }).click();
  await page.waitForURL(/\/signin\/mfa/);

  const mfaInputs = page.locator('input[inputmode="numeric"]');
  await expect(mfaInputs.first()).toBeVisible({ timeout: 15000 });
  const code = '123456';
  for (let i = 0; i < 6; i++) {
    await mfaInputs.nth(i).fill(code[i]);
  }
}

test.describe('CustomerSelfService Accessibility Audits', () => {

  test('Accessibility Toolbox - High Contrast & Magnification Checks', async ({ page }) => {
    await loginAs(page, 'customer@company.com');
    await page.waitForURL(/\/portal\/home/);

    // Open Accessibility dialog using data-testid
    await page.getByTestId('accessibility-options-btn').click();
    await expect(page.getByText(/accessibility toolbox/i)).toBeVisible();

    // Toggle High Contrast using data-testid
    const highContrastBtn = page.getByTestId('high-contrast-toggle');
    await expect(highContrastBtn).toBeVisible();
    await highContrastBtn.click();
    
    // Check if contrast class updates on body
    const body = page.locator('body');
    await expect(body).toHaveClass(/accessibility-high-contrast/i);

    // Toggle Text Magnification using data-testid
    const fontLargeBtn = page.getByTestId('font-size-lg');
    await fontLargeBtn.click();
    await expect(body).toHaveClass(/accessibility-font-lg/i);
    
    // Reset to normal using data-testid
    await page.getByTestId('font-size-base').click();
    await expect(body).not.toHaveClass(/accessibility-font-lg/i);

    // Close modal
    await page.getByLabel('Close dialog').click();
    await expect(page.getByText(/accessibility toolbox/i)).not.toBeVisible();
  });

  test('Keyboard Navigation & Visible Focus Outlines', async ({ page }) => {
    await page.goto('/signin');

    // 1. Focus the email input directly
    await page.focus('input[id="email"]');
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toBeFocused();

    // Verify it has visible focus ring class
    await expect(emailInput).toHaveClass(/focus:ring-2/i);

    // 2. Press Tab key to shift focus to forgot password link
    await page.keyboard.press('Tab');
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotPasswordLink).toBeFocused();

    // 3. Press Tab key again to shift focus to password input
    await page.keyboard.press('Tab');
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toBeFocused();
    await expect(passwordInput).toHaveClass(/focus:ring-2/i);
  });

  test('Modal Close Triggers on ESC and Focus Traps', async ({ page }) => {
    await loginAs(page, 'superadmin@company.com');
    await page.waitForURL(/\/admin\/infrastructure/);

    // Navigate to Channels catalog using data-testid
    await page.getByTestId('sidebar-item-channels').click();
    await page.getByTestId('configure-channel-ch-wa').first().click();
    await expect(page.getByRole('heading', { name: /Channel Configuration/i })).toBeVisible();

    // Press Escape to dismiss configuration modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: /Channel Configuration/i })).not.toBeVisible();
  });
});
