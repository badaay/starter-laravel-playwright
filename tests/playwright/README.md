# Playwright Test Configuration

This project uses a centralized test configuration system to make tests maintainable and environment-agnostic.

## Configuration Files

### `tests/playwright/config/test-config.js`
Central configuration file containing:
- User credentials
- Application URLs  
- Timeouts
- CSS selectors
- Helper functions

### `.env.testing`
Environment variables for testing (can be overridden)

## Usage

### Running Tests with Default Config
```bash
npm run test:e2e
```

### Running Tests with Custom Environment Variables
```bash
TEST_USER_EMAIL=admin@test.com TEST_USER_PASSWORD=secret123 npm run test:e2e
```

### Running Tests with Different Base URL
```bash
TEST_BASE_URL=http://staging.example.com npm run test:e2e
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_USER_EMAIL` | `user@example.com` | Email for test user login |
| `TEST_USER_PASSWORD` | `password` | Password for test user login |
| `TEST_BASE_URL` | `http://localhost:8000` | Base URL of the application |
| `TEST_TIMEOUT` | `30000` | Default test timeout in ms |
| `TEST_NAVIGATION_TIMEOUT` | `10000` | Navigation timeout in ms |

## Helper Functions

### `login(page, email?, password?)`
Logs in a user with optional custom credentials.

### `logout(page)`
Logs out the current user.

### `createTestUser(prefix?)`
Creates test user data with unique email.

### `waitForNavigation(page, urlPattern, timeout?)`
Waits for page navigation with timeout.

## Best Practices: Step-by-Step Guide

### 1. 📋 Test Planning & Structure

#### Step 1.1: Define Test Scope
```javascript
// ✅ Good: Clear test description
test('User can create a new todo with valid data', async ({ page }) => {
    // Test implementation
});

// ❌ Bad: Vague description
test('todo test', async ({ page }) => {
    // Test implementation
});
```

#### Step 1.2: Use Descriptive Test Groups
```javascript
test.describe('Todo CRUD Operations', () => {
    test.describe('Create Todo', () => {
        test('can create todo with title only', async ({ page }) => {});
        test('can create todo with title and description', async ({ page }) => {});
        test('validates required fields', async ({ page }) => {});
    });
});
```

### 2. 🔧 Configuration & Setup

#### Step 2.1: Use Centralized Configuration
```javascript
// ✅ Good: Use centralized selectors
await page.click(TEST_CONFIG.selectors.createButton);

// ❌ Bad: Hardcoded selectors
await page.click('button:has-text("Create")');
```

#### Step 2.2: Environment-Specific Testing
```javascript
// Use environment variables for different environments
const testConfig = {
    email: process.env.TEST_USER_EMAIL || TEST_CONFIG.email,
    baseURL: process.env.TEST_BASE_URL || TEST_CONFIG.baseURL
};
```

#### Step 2.3: Proper Test Data Management
```javascript
// ✅ Good: Dynamic test data
const uniqueTitle = `${TEST_CONFIG.sampleTodo.title} ${Date.now()}`;

// ❌ Bad: Static test data (can cause conflicts)
const title = "Test Todo";
```

### 3. 🏗️ Test Implementation

#### Step 3.1: Use Helper Functions
```javascript
// ✅ Good: Use helper functions
test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click(TEST_CONFIG.selectors.todosLink);
    await waitForNavigation(page, /.*todos/);
});

// ❌ Bad: Repeat code in every test
test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    // ... repeated login code
});
```

#### Step 3.2: Handle Strict Mode Violations
```javascript
// ✅ Good: Specific selectors to avoid strict mode
await expect(page.locator('h3:has-text("Scan the QR Code")')).toBeVisible();

// ❌ Bad: Generic selectors that match multiple elements
await expect(page.locator('text=Scan the QR Code')).toBeVisible();
```

#### Step 3.3: Proper Error Handling
```javascript
// ✅ Good: Handle dialogs properly
page.on('dialog', dialog => dialog.accept());
await page.click(TEST_CONFIG.selectors.deleteButton);

// ✅ Good: Use first() for multiple matches when appropriate
await expect(page.locator('td').filter({ hasText: uniqueTitle }).first()).toBeVisible();
```

### 4. 🎯 Selector Best Practices

#### Step 4.1: Selector Priority Order
1. **Data attributes** (highest priority): `[data-testid="submit-button"]`
2. **Semantic roles**: `page.getByRole('button', { name: 'Submit' })`
3. **Form labels**: `page.getByLabel('Email')`
4. **Placeholder text**: `page.getByPlaceholder('Enter email')`
5. **CSS selectors** (lowest priority): `button.submit-btn`

```javascript
// ✅ Best: Data attributes
await page.click('[data-testid="create-todo-button"]');

// ✅ Good: Semantic approach
await page.click('button:has-text("Create Todo")');

// ⚠️ Acceptable: CSS selectors with context
await page.click(TEST_CONFIG.selectors.createButton);
```

#### Step 4.2: Avoid Fragile Selectors
```javascript
// ✅ Good: Stable selectors
await page.fill('input[name="title"]', title);

// ❌ Bad: Position-dependent selectors
await page.fill('form input:nth-child(2)', title);
```

### 5. ⏱️ Timing & Waits

#### Step 5.1: Use Proper Waits
```javascript
// ✅ Good: Wait for navigation
await waitForNavigation(page, /.*todos$/);

// ✅ Good: Wait for element states
await page.waitForSelector(TEST_CONFIG.selectors.todoTitle, { state: 'visible' });

// ❌ Bad: Fixed delays
await page.waitForTimeout(3000);
```

#### Step 5.2: Set Appropriate Timeouts
```javascript
// ✅ Good: Specific timeouts for slow operations
await expect(todoRow.locator('button:has-text("Completed")')).toBeVisible({ 
    timeout: 10000 
});

// ✅ Good: Use configuration timeouts
await page.waitForURL(urlPattern, { timeout: TEST_CONFIG.navigationTimeout });
```

### 6. 🧪 Test Data & State Management

#### Step 6.1: Ensure Test Isolation
```javascript
// ✅ Good: Create fresh data for each test
test('can edit todo', async ({ page }) => {
    const testTodoTitle = `Todo for Edit Test ${Date.now()}`;
    // Create todo specifically for this test
    await createTodo(page, testTodoTitle);
    // Now test editing
});
```

#### Step 6.2: Clean State Between Tests
```javascript
// ✅ Good: Reset to known state
test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click(TEST_CONFIG.selectors.todosLink);
    await waitForNavigation(page, /.*todos/);
});
```

### 7. 🔍 Assertions & Verifications

#### Step 7.1: Use Meaningful Assertions
```javascript
// ✅ Good: Specific assertions
await expect(page.locator('h2')).toContainText('Todos');
await expect(page.locator(`td:has-text("${uniqueTitle}")`)).toBeVisible();

// ❌ Bad: Generic assertions
await expect(page.locator('div')).toBeVisible();
```

#### Step 7.2: Test Both Success and Error Cases
```javascript
test.describe('Todo Creation', () => {
    test('can create valid todo', async ({ page }) => {
        // Test successful creation
    });

    test('shows validation for empty title', async ({ page }) => {
        // Test error handling
        await page.click(TEST_CONFIG.selectors.createButton);
        await expect(page.locator('input[name="title"]')).toBeVisible();
    });
});
```

### 8. 📊 Cross-Browser & Responsive Testing

#### Step 8.1: Test Across Browsers
```javascript
// Configuration in playwright.config.js
projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
]
```

#### Step 8.2: Test Responsive Behavior
```javascript
test('todo list is responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.desktop-nav')).toBeVisible();
});
```

### 9. 🐛 Debugging & Maintenance

#### Step 9.1: Use Debugging Tools
```bash
# Run tests in headed mode for debugging
npx playwright test --headed --debug

# Run specific test with traces
npx playwright test --trace on "test name"

# Generate and view reports
npx playwright show-report
```

#### Step 9.2: Add Helpful Comments
```javascript
test('can mark todo as completed', async ({ page }) => {
    // Arrange: Create a test todo
    const testTodoTitle = `Todo for Status Test ${Date.now()}`;
    await createTodo(page, testTodoTitle);
    
    // Act: Toggle the status
    const todoRow = page.locator('table tbody tr').filter({ hasText: testTodoTitle });
    await todoRow.locator('button:has-text("Pending")').click();
    
    // Assert: Verify status changed
    await expect(todoRow.locator('button:has-text("Completed")')).toBeVisible();
});
```

### 10. 📈 Performance & Optimization

#### Step 10.1: Optimize Test Execution
```javascript
// ✅ Good: Use beforeEach for common setup
test.beforeEach(async ({ page }) => {
    await login(page);
});

// ✅ Good: Group related tests to minimize setup
test.describe.serial('Todo workflow', () => {
    test('create todo', async ({ page }) => {});
    test('edit todo', async ({ page }) => {});
    test('delete todo', async ({ page }) => {});
});
```

#### Step 10.2: Minimize Network Requests
```javascript
// Mock external APIs when possible
await page.route('**/api/external-service', route => {
    route.fulfill({ json: { status: 'success' } });
});
```

## Advanced Topics

### Page Object Model (POM)
For larger applications, consider implementing Page Object Model:

```javascript
// pages/TodoPage.js
export class TodoPage {
    constructor(page) {
        this.page = page;
        this.createButton = page.locator(TEST_CONFIG.selectors.createButton);
        this.titleInput = page.locator(TEST_CONFIG.selectors.todoTitle);
    }

    async createTodo(title, description = '') {
        await this.page.click(TEST_CONFIG.selectors.createTodoLink);
        await this.titleInput.fill(title);
        if (description) {
            await this.page.fill(TEST_CONFIG.selectors.todoDescription, description);
        }
        await this.createButton.click();
    }
}

// In test file
import { TodoPage } from '../pages/TodoPage.js';

test('create todo using POM', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.createTodo('Test Todo');
});
```

### Custom Fixtures
Create reusable test fixtures:

```javascript
// fixtures/todoFixture.js
export const todoTest = test.extend({
    todoPage: async ({ page }, use) => {
        const todoPage = new TodoPage(page);
        await use(todoPage);
    },
    
    authenticatedPage: async ({ page }, use) => {
        await login(page);
        await use(page);
    }
});

// Usage in tests
todoTest('create todo with fixture', async ({ todoPage }) => {
    await todoPage.createTodo('Test Todo');
});
```

### API Testing Integration
Combine UI and API testing:

```javascript
test('todo creation via UI updates API', async ({ page, request }) => {
    // Create todo via UI
    await page.click(TEST_CONFIG.selectors.createTodoLink);
    await page.fill(TEST_CONFIG.selectors.todoTitle, 'API Test Todo');
    await page.click(TEST_CONFIG.selectors.createButton);
    
    // Verify via API
    const response = await request.get('/api/todos');
    const todos = await response.json();
    expect(todos.data.some(todo => todo.title === 'API Test Todo')).toBeTruthy();
});
```

## Team Guidelines

### Code Review Checklist

#### ✅ Test Quality
- [ ] Tests have descriptive names
- [ ] Tests are focused on single functionality
- [ ] Proper use of beforeEach/afterEach
- [ ] No hardcoded values (use TEST_CONFIG)
- [ ] Proper error handling and assertions

#### ✅ Maintainability
- [ ] Uses centralized selectors
- [ ] Helper functions are utilized
- [ ] No code duplication
- [ ] Comments explain complex logic
- [ ] Test data is properly isolated

#### ✅ Reliability
- [ ] No fixed timeouts (use proper waits)
- [ ] Handles async operations correctly
- [ ] Avoids flaky selectors
- [ ] Cross-browser compatibility considered

### Naming Conventions

#### Test Files
```
feature-name.spec.js    // ✅ Good
featureName.spec.js     // ❌ Bad
test-feature.js         // ❌ Bad
```

#### Test Names
```javascript
// ✅ Good: Action + Expected Result
test('can create todo with valid data');
test('shows validation error for empty title');
test('redirects to login when not authenticated');

// ❌ Bad: Vague or unclear
test('todo test');
test('it works');
test('test login');
```

#### Helper Functions
```javascript
// ✅ Good: Verb-based naming
async function createTodo(page, title) {}
async function navigateToProfile(page) {}
async function waitForNavigation(page, pattern) {}

// ❌ Bad: Noun-based naming
async function todo(page, title) {}
async function profile(page) {}
```

### Git Workflow for Tests

#### Branching Strategy
```bash
# Create feature branch
git checkout -b feature/add-todo-tests

# Create test files
# Implement tests
# Ensure all tests pass

git add tests/playwright/
git commit -m "Add comprehensive todo CRUD tests"
git push origin feature/add-todo-tests
```

#### Commit Messages
```bash
# ✅ Good commit messages
git commit -m "Add todo creation and editing tests"
git commit -m "Fix flaky test in MFA authentication flow"
git commit -m "Refactor test helpers for better reusability"

# ❌ Bad commit messages
git commit -m "update tests"
git commit -m "fix"
git commit -m "changes"
```

### CI/CD Integration

#### GitHub Actions Example
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm run test:e2e
      env:
        TEST_BASE_URL: http://localhost:8000
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Resources & Further Reading

### Official Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

### Testing Patterns
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Parameterized Tests](https://playwright.dev/docs/test-parameterize)

### Community Resources
- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Playwright Discord](https://discord.gg/playwright-807756831384403968)
- [Awesome Playwright](https://github.com/mxschmitt/awesome-playwright)

---

**Remember**: Good tests are an investment in your application's reliability and your team's productivity. Follow these practices consistently, and your test suite will serve as both documentation and a safety net for your application.
