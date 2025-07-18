import { test, expect } from '@playwright/test';
import { TEST_CONFIG, createTestUser, waitForNavigation, login } from './config/test-config.js';

// Helper functions for MFA tests
async function navigateToMfaSetup(page) {
    await page.goto('/profile');
    await page.click(TEST_CONFIG.selectors.mfaTab);
    await page.click(TEST_CONFIG.selectors.setupMfaButton);
    await waitForNavigation(page, /.*mfa\/setup/);
}

async function registerTestUser(page, user) {
    await page.goto('/register');
    await page.fill('input[name="name"]', user.name);
    await page.fill(TEST_CONFIG.selectors.emailInput, user.email);
    await page.fill(TEST_CONFIG.selectors.passwordInput, user.password);
    await page.fill('input[name="password_confirmation"]', user.password);
    await page.click(TEST_CONFIG.selectors.registerButton);
    await waitForNavigation(page, /.*dashboard/);
}

test.describe('MFA Authentication', () => {
  let testUser;

  test.beforeEach(async ({ page }) => {
    // Create a unique test user for each test
    testUser = createTestUser('mfa');

    // Register user using helper function
    await registerTestUser(page, testUser);
  });

  test('User can navigate to MFA setup page', async ({ page }) => {
    // Navigate to profile page and access MFA setup
    await navigateToMfaSetup(page);

    // Verify MFA setup page elements are present
    await expect(page.locator('h2:has-text("Set Up Two-Factor Authentication")')).toBeVisible();
    await expect(page.locator('h3:has-text("Scan the QR Code")')).toBeVisible();
    
    // Verify QR code and secret key are displayed
    await expect(page.locator(TEST_CONFIG.selectors.qrCode)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.selectors.secretKey)).toBeVisible();
    
    // Verify verification code input field
    await expect(page.locator(TEST_CONFIG.selectors.mfaCodeInput)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.selectors.verifyEnableButton)).toBeVisible();
  });

  test('User can view recovery codes during MFA setup', async ({ page }) => {
    // Navigate to MFA setup page
    await navigateToMfaSetup(page);

    // Initially recovery codes should not be visible
    await expect(page.locator('h3:has-text("Recovery Codes")')).not.toBeVisible();
    
    // Click to show recovery codes
    await page.click(TEST_CONFIG.selectors.showRecoveryCodesButton);
    
    // Verify recovery codes section is now visible
    await expect(page.locator('h3:has-text("Recovery Codes")')).toBeVisible();
    await expect(page.locator('text=Store these recovery codes in a secure password manager').first()).toBeVisible();
    
    // Verify recovery codes are displayed in a grid
    await expect(page.locator('.font-mono').first()).toBeVisible();
    
    // Click to hide recovery codes
    await page.click(TEST_CONFIG.selectors.hideRecoveryCodesButton);
    
    // Verify recovery codes are hidden again
    await expect(page.locator('h3:has-text("Recovery Codes")')).not.toBeVisible();
  });

  test('User can access MFA settings in profile', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');
    
    // Click on Two-Factor Authentication tab
    await page.click(TEST_CONFIG.selectors.mfaTab);
    
    // Verify MFA form elements are present
    await expect(page.locator('h2:has-text("Two Factor Authentication")')).toBeVisible();
    await expect(page.locator('text=Add additional security to your account')).toBeVisible();
    
    // Verify TOTP section
    await expect(page.locator('text=Authenticator App (TOTP)')).toBeVisible();
    await expect(page.locator(TEST_CONFIG.selectors.setupMfaButton)).toBeVisible();
  });

  test('MFA setup form validation works', async ({ page }) => {
    // Navigate to MFA setup page
    await navigateToMfaSetup(page);
    
    // Try to submit empty form
    await page.click(TEST_CONFIG.selectors.verifyEnableButton);
    
    // The form should not proceed without a code
    // We can't fully test TOTP codes without a real authenticator,
    // but we can verify the form requires input
    await expect(page.locator(TEST_CONFIG.selectors.mfaCodeInput)).toBeVisible();
    await expect(page).toHaveURL(/.*mfa\/setup/);
  });

  test('User can access MFA challenge page flow', async ({ page }) => {
    // Since we can't complete MFA setup without a real TOTP code,
    // we'll test accessing the challenge page directly
    
    // First logout to test the challenge flow - need to open user dropdown first
    await page.click('button:has-text("mfa User")'); // Click on user dropdown
    await page.click(TEST_CONFIG.selectors.logoutButton);
    await waitForNavigation(page, /.*$/);
    
    // Try to access a protected MFA route (this would normally show after MFA is enabled)
    await page.goto('/mfa/challenge');
    
    // Should redirect to login if not authenticated
    await expect(page.url()).toMatch(/.*login/);
  });
});
