/**
 * Centralized test configuration
 * Can be overridden by environment variables
 */
export const TEST_CONFIG = {
    // User credentials for testing
    email: process.env.TEST_USER_EMAIL || 'user@example.com',
    password: process.env.TEST_USER_PASSWORD || 'password',
    
    // Application URLs
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:8000',
    
    // Test timeouts
    defaultTimeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
    navigationTimeout: parseInt(process.env.TEST_NAVIGATION_TIMEOUT) || 10000,
    
    // Test data
    sampleTodo: {
        title: 'Test Todo from Playwright',
        description: 'This is a test todo created by Playwright automation'
    },
    
    // Selectors (in case they change)
    selectors: {
        emailInput: 'input[name="email"]',
        passwordInput: 'input[name="password"]',
        submitButton: 'button:has-text("Log in")',
        loginButton: 'button:has-text("Log in")',
        registerButton: 'button:has-text("Register")',
        todoTitle: 'input[name="title"]',
        todoDescription: 'textarea[name="description"]',
        createButton: 'button:has-text("Create")',
        updateButton: 'button:has-text("Update")',
        deleteButton: 'text=Delete',
        editButton: 'text=Edit',
        viewButton: 'text=View',
        pendingStatus: 'button:has-text("Pending")',
        completedStatus: 'button:has-text("Completed")',
        
        // MFA specific selectors
        mfaTab: 'text=Two-Factor Authentication',
        setupMfaButton: 'text=Setup Authenticator App',
        mfaCodeInput: 'input[name="code"]',
        verifyEnableButton: 'button:has-text("Verify and Enable")',
        showRecoveryCodesButton: 'text=Show Recovery Codes',
        hideRecoveryCodesButton: 'text=Hide Recovery Codes',
        qrCode: 'svg[width="300"]', // More specific for the QR code SVG
        secretKey: 'code',
        
        // Email MFA specific selectors
        setupEmailMfaButton: 'text=Setup Email MFA',
        sendEmailCodeButton: 'button:has-text("Send Verification Code")',
        emailCodeInput: 'input[name="email_code"]',
        verifyEmailButton: 'button:has-text("Verify and Enable Email MFA")',
        resendEmailCodeButton: 'button:has-text("Resend Code")',
        requestEmailCodeButton: 'button:has-text("Send Code to Email")',
        verifyMfaButton: 'button:has-text("Verify")',
        
        // Navigation
        profileLink: 'text=Profile',
        todosLink: 'text=Todos',
        logoutButton: 'text=Log Out'
    }
};

/**
 * Helper function to create test user data
 */
export const createTestUser = (prefix = 'test') => ({
    name: `${prefix} User`,
    email: `${prefix}.${Date.now()}@example.com`,
    password: TEST_CONFIG.password
});

/**
 * Helper function to wait for navigation
 */
export const waitForNavigation = async (page, urlPattern, timeout = TEST_CONFIG.navigationTimeout) => {
    await page.waitForURL(urlPattern, { timeout });
};

/**
 * Helper function for login
 */
export const login = async (page, email = TEST_CONFIG.email, password = TEST_CONFIG.password) => {
    await page.goto('/login');
    
    // Wait for login form to be visible
    await page.waitForSelector(TEST_CONFIG.selectors.emailInput, { timeout: 10000 });
    await page.waitForSelector(TEST_CONFIG.selectors.passwordInput, { timeout: 10000 });
    await page.waitForSelector(TEST_CONFIG.selectors.loginButton, { timeout: 10000 });
    
    // Fill the form
    await page.fill(TEST_CONFIG.selectors.emailInput, email);
    await page.fill(TEST_CONFIG.selectors.passwordInput, password);
    
    // Submit the form
    await page.click(TEST_CONFIG.selectors.loginButton);
    
    // Wait for navigation to dashboard
    await waitForNavigation(page, /.*dashboard/);
};

/**
 * Helper function for logout
 */
export const logout = async (page) => {
    // Click on user dropdown and logout
    await page.click('[data-dropdown-toggle]');
    await page.click('text=Log Out');
    await waitForNavigation(page, /.*login/);
};
