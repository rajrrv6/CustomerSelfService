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

test.describe('CustomerSelfService Enterprise Journeys', () => {

  test('Authentication & MFA Step-Up Journey', async ({ page }) => {
    await loginAs(page, 'superadmin@company.com');
    await page.waitForURL(/\/admin\/infrastructure/);
    await expect(page.getByRole('heading', { name: /LLM Model Registry/i })).toBeVisible();
  });

  test('Super Admin Channels Tab & Drawer Interaction', async ({ page }) => {
    await loginAs(page, 'superadmin@company.com');
    await page.waitForURL(/\/admin\/infrastructure/);

    // Click on "Channels" menu option using data-testid
    await page.getByTestId('sidebar-item-channels').click();
    await expect(page.getByRole('heading', { name: /channel catalog/i })).toBeVisible();
    await expect(page.getByText(/whatsapp business/i).first()).toBeVisible();

    // Click configure WhatsApp Business using data-testid
    await page.getByTestId('configure-channel-ch-wa').first().click();
    await expect(page.getByRole('heading', { name: /Channel Configuration/i })).toBeVisible();

    // Close configuration modal using data-testid
    await page.getByTestId('channel-modal-cancel').click();
    await expect(page.getByRole('heading', { name: /Channel Configuration/i })).not.toBeVisible();
  });

  test('Client Admin Widget Customizer & Template Preview', async ({ page }) => {
    await loginAs(page, 'clientadmin@company.com');
    await page.waitForURL(/\/tenant\/dashboard/);

    // Select Channels Tab using data-testid
    await page.getByTestId('sidebar-item-channels').click();
    await expect(page.getByRole('heading', { name: /Omnichannel Operations Hub/i })).toBeVisible();

    // Customize widget theme color using color preset button
    const colorPresetBtn = page.locator('button[aria-label="Select #ea580c"]');
    await expect(colorPresetBtn).toBeVisible();
    await colorPresetBtn.click();
    
    const customizerWidget = page.locator('div[style*="background-color: rgb(234, 88, 12)"]').first();
    await expect(customizerWidget).toBeVisible();

    // Preview WhatsApp Template modal using data-testid
    await page.getByTestId('preview-template-order_delivery_update').click();
    await expect(page.getByText(/WhatsApp Notification Preview/i)).toBeVisible();
    
    // Close using Close Preview button with data-testid
    await page.getByTestId('close-template-preview-btn').click();
    await expect(page.getByText(/WhatsApp Notification Preview/i)).not.toBeVisible();
  });

  test('Agent Workspace Unified Inbox & Telephony Journey', async ({ page }) => {
    await loginAs(page, 'agent@company.com');
    await page.waitForURL(/\/workspace\/inbox/);

    await expect(page.getByTestId('capacity-meter')).toBeVisible();
    await expect(page.getByText(/amina al-fayed/i)).toBeVisible();

    // Select Web channel filter using data-testid
    await page.getByTestId('inbox-tab-web').click();
    await expect(page.getByText(/marcus aurelius/i).first()).toBeVisible();

    // Switch to Voice Sub-tab using data-testid
    await page.getByTestId('inbox-tab-voice').click();
    await expect(page.getByText(/sip voice terminal/i)).toBeVisible();

    // Open Dialer pad dialog using data-testid
    await page.getByTestId('open-dialer-btn').click();
    await expect(page.getByText(/SIP Telephony/i)).toBeVisible();
    await page.click('button[aria-label="Close dialer"]');
  });

  test('Customer Self-Service Portal Search & Refund OTP Journey', async ({ page }) => {
    await loginAs(page, 'customer@company.com');
    await page.waitForURL(/\/portal\/home/);

    // Search query using data-testid
    const searchBar = page.getByTestId('portal-search-input');
    await expect(searchBar).toBeVisible();
    await searchBar.fill('refund policy');
    await page.keyboard.press('Enter');

    // Go back to portal home to click the refund wizard button
    await page.goto('/portal/home');

    // Launch refund wizard using data-testid
    await page.getByTestId('order-refunds-btn').click();

    // Fill corporate email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('david.miller@yahoo.com');

    // Submit email
    await page.getByRole('button', { name: /Send/i }).click();

    // Complete return verification (OTP 1234)
    const otpInput = page.locator('input[placeholder="e.g. 1234"]');
    await expect(otpInput).toBeVisible();
    await otpInput.fill('1234');
    await page.getByRole('button', { name: /Verify/i }).click();
    await expect(page.getByText(/ORD-99881/i)).toBeVisible();
  });

  test('Localization bilingual translations & RTL switches', async ({ page }) => {
    await page.goto('/signin');
    
    // Switch translation to Arabic (AR)
    await page.click('button:has-text("ع")');
    await expect(page.getByText(/البريد الإلكتروني للعمل/i)).toBeVisible();

    // Check if dir="rtl" is applied on HTML tag
    const body = page.locator('html');
    await expect(body).toHaveAttribute('dir', 'rtl');

    // Switch back to English (EN)
    await page.click('button:has-text("EN")');
    await expect(page.getByText(/work email/i)).toBeVisible();
    await expect(body).toHaveAttribute('dir', 'ltr');
  });
});
