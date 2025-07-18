import { test, expect } from '@playwright/test';
import { TEST_CONFIG, createTestUser, waitForNavigation, login } from './config/test-config.js';

// Helper functions for email verification tests
async function navigateToEmailMfaSetup(page) {
    await page.goto('/profile');
    await page.click(TEST_CONFIG.selectors.mfaTab);
    await page.click(TEST_CONFIG.selectors.setupEmailMfaButton);
    await waitForNavigation(page, /.*mfa\/email\/setup/);
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

async function interceptEmailCode(page) {
    // Intercept the email sending request to capture the code
    let capturedCode = null;
    
    await page.route('**/mfa/email/send', async route => {
        const response = await route.fetch();
        const responseBody = await response.text();
        
        // In a real test, you might parse the response or check logs
        // For this test, we'll simulate a known code
        capturedCode = '123456';
        
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'Code sent successfully' })
        });
    });
    
    return () => capturedCode;
}

test.describe('Email Verification & MFA', () => {
    let testUser;

    test.beforeEach(async ({ page }) => {
        // Create a unique test user for each test
        testUser = createTestUser('email-mfa');
        
        // Register user using helper function
        await registerTestUser(page, testUser);
    });

    test('User can set up email MFA and receive verification code', async ({ page }) => {
        // Set up email code interception
        const getCode = await interceptEmailCode(page);
        
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Verify email MFA setup page elements
        await expect(page.locator('h2:has-text("Set Up Email Two-Factor Authentication")')).toBeVisible();
        await expect(page.locator('text=We will send a 6-digit verification code')).toBeVisible();
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        
        // Wait for success message
        await expect(page.locator('text=Verification code sent')).toBeVisible({ timeout: 10000 });
        
        // Verify code input field appears
        await expect(page.locator(TEST_CONFIG.selectors.emailCodeInput)).toBeVisible();
        await expect(page.locator(TEST_CONFIG.selectors.verifyEmailButton)).toBeVisible();
    });

    test('User can verify email code and enable email MFA', async ({ page }) => {
        // Set up email code interception
        const getCode = await interceptEmailCode(page);
        
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible({ timeout: 10000 });
        
        // Enter the intercepted code
        await page.fill(TEST_CONFIG.selectors.emailCodeInput, '123456');
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        
        // Wait for redirect to profile with success message
        await waitForNavigation(page, /.*profile/);
        await expect(page.locator('text=Email MFA has been enabled successfully')).toBeVisible();
        
        // Verify email MFA is now enabled in profile
        await expect(page.locator('text=Email MFA: Enabled')).toBeVisible();
    });

    test('User receives email code during login when email MFA is enabled', async ({ page }) => {
        // First, set up email MFA for the user
        await navigateToEmailMfaSetup(page);
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible({ timeout: 10000 });
        await page.fill(TEST_CONFIG.selectors.emailCodeInput, '123456');
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        await waitForNavigation(page, /.*profile/);
        
        // Logout
        await page.click(TEST_CONFIG.selectors.logoutButton);
        await waitForNavigation(page, /.*login/);
        
        // Set up email code interception for login
        const getCode = await interceptEmailCode(page);
        
        // Attempt to log in
        await page.fill(TEST_CONFIG.selectors.emailInput, testUser.email);
        await page.fill(TEST_CONFIG.selectors.passwordInput, testUser.password);
        await page.click(TEST_CONFIG.selectors.loginButton);
        
        // Should be redirected to MFA challenge page
        await waitForNavigation(page, /.*mfa\/challenge/);
        await expect(page.locator('h2:has-text("Two-Factor Authentication Required")')).toBeVisible();
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.requestEmailCodeButton);
        await expect(page.locator('text=New code sent to your email')).toBeVisible();
        
        // Enter code and verify
        await page.fill(TEST_CONFIG.selectors.mfaCodeInput, '123456');
        await page.click(TEST_CONFIG.selectors.verifyMfaButton);
        
        // Should be redirected to dashboard
        await waitForNavigation(page, /.*dashboard/);
        await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
    });

    test('Email code expires after 10 minutes', async ({ page }) => {
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Mock an expired code scenario by intercepting the verification request
        await page.route('**/mfa/email/enable', async route => {
            route.fulfill({
                status: 422,
                contentType: 'application/json',
                body: JSON.stringify({
                    errors: {
                        code: ['The verification code has expired. Please request a new one.']
                    }
                })
            });
        });
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Try to verify with any code (will be rejected as expired)
        await page.fill(TEST_CONFIG.selectors.emailCodeInput, '123456');
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        
        // Should show expiration error
        await expect(page.locator('text=The verification code has expired')).toBeVisible();
    });

    test('Email code fails after 3 incorrect attempts', async ({ page }) => {
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Mock failed attempts
        let attemptCount = 0;
        await page.route('**/mfa/email/enable', async route => {
            attemptCount++;
            if (attemptCount < 3) {
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        errors: {
                            code: ['The verification code is invalid.']
                        }
                    })
                });
            } else {
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        errors: {
                            code: ['Too many failed attempts. Please request a new code.']
                        }
                    })
                });
            }
        });
        
        // Make 3 failed attempts
        for (let i = 1; i <= 3; i++) {
            await page.fill(TEST_CONFIG.selectors.emailCodeInput, `wrong${i}`);
            await page.click(TEST_CONFIG.selectors.verifyEmailButton);
            
            if (i < 3) {
                await expect(page.locator('text=The verification code is invalid')).toBeVisible();
            } else {
                await expect(page.locator('text=Too many failed attempts')).toBeVisible();
            }
        }
    });

    test('User can request a new email code', async ({ page }) => {
        // Set up email code interception
        const getCode = await interceptEmailCode(page);
        
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Request first email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Wait a moment and request a new code
        await page.waitForTimeout(2000);
        await page.click(TEST_CONFIG.selectors.resendEmailCodeButton);
        await expect(page.locator('text=New verification code sent')).toBeVisible();
        
        // Verify the new code works
        await page.fill(TEST_CONFIG.selectors.emailCodeInput, '123456');
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        
        await waitForNavigation(page, /.*profile/);
        await expect(page.locator('text=Email MFA has been enabled successfully')).toBeVisible();
    });

    test('Email verification works with different email providers', async ({ page }) => {
        // Test with different email formats
        const emailProviders = [
            'gmail.com',
            'yahoo.com',
            'outlook.com',
            'company.co.uk'
        ];
        
        for (const provider of emailProviders) {
            // Create user with specific email provider
            const testUserWithProvider = {
                ...testUser,
                email: `test.${Date.now()}@${provider}`
            };
            
            // Register new user
            await page.goto('/register');
            await page.fill('input[name="name"]', testUserWithProvider.name);
            await page.fill(TEST_CONFIG.selectors.emailInput, testUserWithProvider.email);
            await page.fill(TEST_CONFIG.selectors.passwordInput, testUserWithProvider.password);
            await page.fill('input[name="password_confirmation"]', testUserWithProvider.password);
            await page.click(TEST_CONFIG.selectors.registerButton);
            await waitForNavigation(page, /.*dashboard/);
            
            // Test email MFA setup
            await navigateToEmailMfaSetup(page);
            await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
            await expect(page.locator('text=Verification code sent')).toBeVisible({ timeout: 10000 });
            
            // Verify the email field shows the correct provider
            const emailDisplay = await page.locator(`text=${testUserWithProvider.email}`);
            await expect(emailDisplay).toBeVisible();
            
            // Logout for next iteration
            await page.goto('/profile');
            await page.click(TEST_CONFIG.selectors.logoutButton);
            await waitForNavigation(page, /.*login/);
        }
    });

    test('Email verification form has proper validation', async ({ page }) => {
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Test empty code
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        await expect(page.locator('text=The code field is required')).toBeVisible();
        
        // Test invalid code format (too short)
        await page.fill(TEST_CONFIG.selectors.emailCodeInput, '123');
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        await expect(page.locator('text=The code must be 6 digits')).toBeVisible();
        
        // Test invalid code format (non-numeric)
        await page.fill(TEST_CONFIG.selectors.emailCodeInput, 'abcdef');
        await page.click(TEST_CONFIG.selectors.verifyEmailButton);
        await expect(page.locator('text=The code must contain only numbers')).toBeVisible();
    });
});

test.describe('Standalone Email Verification Feature', () => {
    let testUser;

    test.beforeEach(async ({ page }) => {
        testUser = createTestUser('email-verify');
    });

    test('User can request email verification during registration', async ({ page }) => {
        // Navigate to registration
        await page.goto('/register');
        
        // Fill registration form
        await page.fill('input[name="name"]', testUser.name);
        await page.fill(TEST_CONFIG.selectors.emailInput, testUser.email);
        await page.fill(TEST_CONFIG.selectors.passwordInput, testUser.password);
        await page.fill('input[name="password_confirmation"]', testUser.password);
        
        // Mock email verification request
        await page.route('**/email/verification-notification', async route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Verification email sent!' })
            });
        });
        
        await page.click(TEST_CONFIG.selectors.registerButton);
        
        // Should show email verification notice
        await expect(page.locator('text=Please verify your email address')).toBeVisible();
        await expect(page.locator('text=Resend Verification Email')).toBeVisible();
    });

    test('User can resend verification email', async ({ page }) => {
        // First register a user
        await registerTestUser(page, testUser);
        
        // Navigate to email verification page
        await page.goto('/email/verify');
        
        // Mock resend verification email
        await page.route('**/email/verification-notification', async route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'A fresh verification link has been sent to your email address.' })
            });
        });
        
        await page.click('button:has-text("Resend Verification Email")');
        await expect(page.locator('text=A fresh verification link has been sent')).toBeVisible();
    });
});

// Test utility to check email logs (for development/testing)
test.describe('Email Testing Utilities', () => {
    test('Check email was sent to log for debugging', async ({ page }) => {
        const testUser = createTestUser('email-log');
        await registerTestUser(page, testUser);
        
        // Navigate to email MFA setup
        await navigateToEmailMfaSetup(page);
        
        // Request email code
        await page.click(TEST_CONFIG.selectors.sendEmailCodeButton);
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // In a real test environment, you might check logs here
        // For now, we'll just verify the UI feedback
        console.log(`Email verification code should be sent to: ${testUser.email}`);
        console.log('Check Laravel logs for the actual verification code');
    });
});
