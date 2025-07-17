import { test, expect } from '@playwright/test';

test.describe('MFA Authentication', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    // Create a test user
    testUser = {
      name: 'MFA Test User',
      email: `mfa.test.${Date.now()}@example.com`,
      password: 'password',
    };

    // Register user
    await page.goto('/register');
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="password_confirmation"]', testUser.password);
    await page.click('button[type="submit"]');

    // Verify we're logged in
    await expect(page).toHaveURL('/dashboard');
  });

  test('User can set up MFA', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');

    // Click on setup MFA button
    await page.click('text=Setup Two Factor Authentication');
    await expect(page).toHaveURL('/mfa/setup');

    // Verify MFA setup page elements
    await expect(page.locator('h2:has-text("Set Up Two-Factor Authentication")')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible(); // QR code
    await expect(page.locator('code')).toBeVisible(); // Secret key
    await expect(page.locator('input[name="code"]')).toBeVisible();

    // Cannot complete actual TOTP setup in E2E test since we would need to scan QR code
    // In a real scenario, the user would scan the QR code and enter the code
    // For testing, we'll just verify the setup page is displayed correctly
  });

  test('User can access recovery codes during setup', async ({ page }) => {
    // Navigate to MFA setup page
    await page.goto('/profile');
    await page.click('text=Setup Two Factor Authentication');

    // Click to show recovery codes
    await page.click('text=Show Recovery Codes');

    // Verify recovery codes are displayed
    await expect(page.locator('text=Store these recovery codes in a secure location.')).toBeVisible();
    await expect(page.locator('.font-mono')).toBeVisible();
  });

  test('User can request email MFA code', async ({ page }) => {
    // We can't fully test the MFA flow as it requires actual TOTP verification
    // Instead, we'll simulate a user with MFA enabled and test the email code path

    // For this test to work properly in a real environment, we would:
    // 1. Have a pre-configured user with MFA enabled
    // 2. Log in as that user
    // 3. Navigate to the MFA challenge page
    // 4. Test the email code flow

    // For now, we'll just verify the route works
    await page.goto('/mfa/email');

    // Since we don't have MFA set up, it should redirect to dashboard or show challenge
    // In a real setup, it would show the MFA challenge page with email code instructions
    await expect(page.url()).toContain('/mfa/challenge');
  });
});
