import { test, expect } from '@playwright/test';
import { TEST_CONFIG, createTestUser, waitForNavigation, login } from './config/test-config.js';

// Helper to simulate email code sending and capture the code
async function mockEmailVerification(page, user) {
    let capturedCode = null;
    
    // Mock the email sending endpoint to capture the verification code
    await page.route('**/email-verification/send', async route => {
        // Simulate generating a 6-digit code
        capturedCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Log the code for debugging (in real tests, you'd get this from logs or test email service)
        console.log(`📧 Verification code for ${user.email}: ${capturedCode}`);
        
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ 
                success: true, 
                message: 'Verification code sent to your email address.' 
            })
        });
    });
    
    // Mock the verification endpoint
    await page.route('**/email-verification/verify', async route => {
        const request = route.request();
        const postData = await request.postDataJSON();
        
        if (postData.code === capturedCode) {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Email verified successfully!' 
                })
            });
        } else {
            route.fulfill({
                status: 422,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    errors: { 
                        code: ['The verification code is invalid.'] 
                    } 
                })
            });
        }
    });
    
    return () => capturedCode;
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

test.describe('Complete Email Verification System', () => {
    let testUser;

    test.beforeEach(async ({ page }) => {
        testUser = createTestUser('email-verify');
        await registerTestUser(page, testUser);
    });

    test('Email verification flow - complete journey', async ({ page }) => {
        const getCode = await mockEmailVerification(page, testUser);
        
        // Navigate to email verification page
        await page.goto('/email-verification');
        
        // Should see the verification form
        await expect(page.locator('h1:has-text("Email Verification")')).toBeVisible();
        await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
        
        // Request verification code
        await page.click('button:has-text("Send Verification Code")');
        
        // Should see success message
        await expect(page.locator('text=Verification code sent')).toBeVisible({ timeout: 10000 });
        
        // Enter the verification code
        const code = getCode();
        await page.fill('input[name="verification_code"]', code);
        
        // Submit verification
        await page.click('button:has-text("Verify Email")');
        
        // Should redirect to dashboard with success message
        await waitForNavigation(page, /.*dashboard/);
        await expect(page.locator('text=Email verified successfully')).toBeVisible();
    });

    test('Email verification with wrong code shows error', async ({ page }) => {
        const getCode = await mockEmailVerification(page, testUser);
        
        await page.goto('/email-verification');
        
        // Request verification code
        await page.click('button:has-text("Send Verification Code")');
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Enter wrong code
        await page.fill('input[name="verification_code"]', '000000');
        await page.click('button:has-text("Verify Email")');
        
        // Should show error
        await expect(page.locator('text=The verification code is invalid')).toBeVisible();
        
        // Form should still be visible for retry
        await expect(page.locator('input[name="verification_code"]')).toBeVisible();
    });

    test('Can resend verification code', async ({ page }) => {
        const getCode = await mockEmailVerification(page, testUser);
        
        await page.goto('/email-verification');
        
        // Request first code
        await page.click('button:has-text("Send Verification Code")');
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Wait a moment then resend
        await page.waitForTimeout(2000);
        
        // Mock resend endpoint
        await page.route('**/email-verification/resend', async route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    success: true, 
                    message: 'A new verification code has been sent to your email.' 
                })
            });
        });
        
        await page.click('button:has-text("Resend Code")');
        await expect(page.locator('text=A new verification code has been sent')).toBeVisible();
    });

    test('Code input validation works correctly', async ({ page }) => {
        await page.goto('/email-verification');
        
        // Try to verify without requesting code
        await page.click('button:has-text("Verify Email")');
        await expect(page.locator('text=Please request a verification code first')).toBeVisible();
        
        // Request code
        await page.click('button:has-text("Send Verification Code")');
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Test empty code
        await page.click('button:has-text("Verify Email")');
        await expect(page.locator('text=The verification code field is required')).toBeVisible();
        
        // Test invalid format (less than 6 digits)
        await page.fill('input[name="verification_code"]', '123');
        await page.click('button:has-text("Verify Email")');
        await expect(page.locator('text=The verification code must be 6 digits')).toBeVisible();
        
        // Test non-numeric code
        await page.fill('input[name="verification_code"]', 'abcdef');
        await page.click('button:has-text("Verify Email")');
        await expect(page.locator('text=The verification code must contain only numbers')).toBeVisible();
    });

    test('Verification status API works correctly', async ({ page }) => {
        // Mock status endpoint
        await page.route('**/email-verification/status', async route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: {
                        has_pending: false,
                        is_verified: false,
                        expires_at: null,
                        attempts: 0,
                        can_request_new: true
                    },
                    email: testUser.email
                })
            });
        });
        
        await page.goto('/email-verification');
        
        // Check status via JavaScript
        const statusResponse = await page.evaluate(async () => {
            const response = await fetch('/email-verification/status');
            return response.json();
        });
        
        expect(statusResponse.email).toBe(testUser.email);
        expect(statusResponse.status.can_request_new).toBe(true);
    });
});

test.describe('Action-Specific Email Verification', () => {
    let testUser;

    test.beforeEach(async ({ page }) => {
        testUser = createTestUser('action-verify');
        await registerTestUser(page, testUser);
    });

    test('Password reset verification flow', async ({ page }) => {
        // Mock action verification endpoints
        await page.route('**/email-verification/action/send', async route => {
            const request = route.request();
            const postData = await request.postDataJSON();
            
            if (postData.action === 'password_reset') {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Password reset verification code sent.' 
                    })
                });
            }
        });
        
        await page.route('**/email-verification/action/verify', async route => {
            const request = route.request();
            const postData = await request.postDataJSON();
            
            if (postData.action === 'password_reset' && postData.code === '123456') {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Identity verified. You can now reset your password.' 
                    })
                });
            } else {
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: false,
                        message: 'Invalid or expired verification code.' 
                    })
                });
            }
        });
        
        // Navigate to password reset page (assuming it exists)
        await page.goto('/password/reset');
        
        // Request verification for password reset
        await page.click('button:has-text("Send Security Code")');
        await expect(page.locator('text=Password reset verification code sent')).toBeVisible();
        
        // Enter verification code
        await page.fill('input[name="security_code"]', '123456');
        await page.click('button:has-text("Verify Identity")');
        
        // Should show success and allow password reset
        await expect(page.locator('text=Identity verified')).toBeVisible();
        await expect(page.locator('input[name="new_password"]')).toBeVisible();
    });

    test('Email change verification flow', async ({ page }) => {
        // Similar to password reset but for email change
        await page.route('**/email-verification/action/send', async route => {
            const request = route.request();
            const postData = await request.postDataJSON();
            
            if (postData.action === 'email_change') {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Email change verification code sent.' 
                    })
                });
            }
        });
        
        await page.goto('/profile');
        
        // Try to change email
        await page.click('button:has-text("Change Email")');
        
        // Should trigger verification
        await expect(page.locator('text=Email change verification code sent')).toBeVisible();
        await expect(page.locator('input[name="verification_code"]')).toBeVisible();
    });

    test('Account deletion verification flow', async ({ page }) => {
        await page.route('**/email-verification/action/send', async route => {
            const request = route.request();
            const postData = await request.postDataJSON();
            
            if (postData.action === 'account_deletion') {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Account deletion verification code sent.' 
                    })
                });
            }
        });
        
        await page.goto('/profile');
        
        // Try to delete account
        await page.click('button:has-text("Delete Account")');
        
        // Should show verification form with warning
        await expect(page.locator('text=Account deletion verification code sent')).toBeVisible();
        await expect(page.locator('text=This action cannot be undone')).toBeVisible();
    });
});

test.describe('Email Verification Performance & Security', () => {
    test('Rate limiting prevents spam', async ({ page }) => {
        const testUser = createTestUser('rate-limit');
        await registerTestUser(page, testUser);
        
        let requestCount = 0;
        
        await page.route('**/email-verification/send', async route => {
            requestCount++;
            
            if (requestCount > 1) {
                // Simulate rate limiting after first request
                route.fulfill({
                    status: 429,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        errors: { 
                            code: ['Please wait at least 1 minute before requesting a new code.'] 
                        } 
                    })
                });
            } else {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Verification code sent.' 
                    })
                });
            }
        });
        
        await page.goto('/email-verification');
        
        // First request should succeed
        await page.click('button:has-text("Send Verification Code")');
        await expect(page.locator('text=Verification code sent')).toBeVisible();
        
        // Second request should be rate limited
        await page.click('button:has-text("Send Verification Code")');
        await expect(page.locator('text=Please wait at least 1 minute')).toBeVisible();
    });

    test('Expired codes are rejected', async ({ page }) => {
        const testUser = createTestUser('expired-code');
        await registerTestUser(page, testUser);
        
        await page.route('**/email-verification/verify', async route => {
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
        
        await page.goto('/email-verification');
        
        // Try to verify with expired code
        await page.fill('input[name="verification_code"]', '123456');
        await page.click('button:has-text("Verify Email")');
        
        await expect(page.locator('text=The verification code has expired')).toBeVisible();
    });

    test('Multiple failed attempts trigger lockout', async ({ page }) => {
        const testUser = createTestUser('failed-attempts');
        await registerTestUser(page, testUser);
        
        let attemptCount = 0;
        
        await page.route('**/email-verification/verify', async route => {
            attemptCount++;
            
            if (attemptCount >= 3) {
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        errors: { 
                            code: ['Too many failed attempts. Please request a new code.'] 
                        } 
                    })
                });
            } else {
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        errors: { 
                            code: ['The verification code is invalid.'] 
                        } 
                    })
                });
            }
        });
        
        await page.goto('/email-verification');
        
        // Make 3 failed attempts
        for (let i = 1; i <= 3; i++) {
            await page.fill('input[name="verification_code"]', `wrong${i}`);
            await page.click('button:has-text("Verify Email")');
            
            if (i < 3) {
                await expect(page.locator('text=The verification code is invalid')).toBeVisible();
            } else {
                await expect(page.locator('text=Too many failed attempts')).toBeVisible();
            }
        }
    });
});

test.describe('Email Verification UI/UX', () => {
    test('Form provides good user experience', async ({ page }) => {
        const testUser = createTestUser('ux-test');
        await registerTestUser(page, testUser);
        
        await page.goto('/email-verification');
        
        // Check form structure and labels
        await expect(page.locator('h1:has-text("Email Verification")')).toBeVisible();
        await expect(page.locator('label:has-text("Verification Code")')).toBeVisible();
        await expect(page.locator('input[name="verification_code"]')).toHaveAttribute('placeholder', '000000');
        await expect(page.locator('input[name="verification_code"]')).toHaveAttribute('maxlength', '6');
        
        // Check that buttons are properly labeled
        await expect(page.locator('button:has-text("Send Verification Code")')).toBeVisible();
        await expect(page.locator('button:has-text("Verify Email")')).toBeVisible();
        
        // Check accessibility
        await expect(page.locator('input[name="verification_code"]')).toHaveAttribute('aria-label');
        await expect(page.locator('form')).toHaveAttribute('novalidate', 'false');
    });

    test('Loading states work correctly', async ({ page }) => {
        const testUser = createTestUser('loading-test');
        await registerTestUser(page, testUser);
        
        // Delay the response to test loading state
        await page.route('**/email-verification/send', async route => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, message: 'Code sent!' })
            });
        });
        
        await page.goto('/email-verification');
        
        // Click send button and check loading state
        await page.click('button:has-text("Send Verification Code")');
        
        // Button should show loading state
        await expect(page.locator('button:has-text("Sending...")')).toBeVisible();
        await expect(page.locator('button[disabled]')).toBeVisible();
        
        // Eventually should show success
        await expect(page.locator('text=Code sent')).toBeVisible({ timeout: 5000 });
    });
});
