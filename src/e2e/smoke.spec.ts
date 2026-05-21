import { test, expect } from '@playwright/test';

test.describe('Customer Self Service Portal Smoke Tests', () => {
  test('renders the login page, performs redirect on unauthorized access', async ({ page }) => {
    // Navigating to workspace page should redirect to login page
    await page.goto('/workspace');
    await expect(page).toHaveURL(/\/login/);

    // Verify login form is present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /continue to verification/i })).toBeVisible();
  });

  test('loads component showcase page successfully', async ({ page }) => {
    // Go directly to the native Storybook Showcase Workspace page
    await page.goto('/qa-showcase');

    // Confirm that the page loads correctly and displays elements from Component Showcase
    await expect(page.getByRole('heading', { name: 'Component Showcase' })).toBeVisible();
    await expect(page.getByText('Storybook Workspace')).toBeVisible();

    // Verify some group navigation buttons exist
    await expect(page.getByRole('button', { name: 'Operational Cards' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Modals & Overlays' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Slide Drawers' })).toBeVisible();
  });

  test('loads access denied page for unauthorized routing', async ({ page }) => {
    // Attempt to access access-denied page
    await page.goto('/access-denied');
    await expect(page.getByText(/Access restricted/i)).toBeVisible();
  });
});
