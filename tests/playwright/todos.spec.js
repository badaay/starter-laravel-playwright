import { test, expect } from '@playwright/test';
import { TEST_CONFIG, login, waitForNavigation } from './config/test-config.js';

test.describe('Todo Application', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test using helper function
        await login(page);
        
        // Navigate to todos page to ensure we start from a clean state
        await page.click('text=Todos');
        await waitForNavigation(page, /.*todos/);
    });

    test('can navigate to todos page', async ({ page }) => {
        // We're already on the todos page from beforeEach
        await expect(page.locator('h2')).toContainText('Todos');
    });

    test('can create a new todo', async ({ page }) => {
        // Generate unique title for this test run
        const uniqueTitle = `${TEST_CONFIG.sampleTodo.title} ${Date.now()}`;
        
        // Click create button
        await page.click('text=Create Todo');
        await expect(page).toHaveURL(/.*todos\/create/);

        // Fill form using centralized data and selectors
        await page.fill(TEST_CONFIG.selectors.todoTitle, uniqueTitle);
        await page.fill(TEST_CONFIG.selectors.todoDescription, TEST_CONFIG.sampleTodo.description);

        // Submit form
        await page.click(TEST_CONFIG.selectors.createButton);

        // Verify we're back on the index page
        await waitForNavigation(page, /.*todos$/);

        // Check if the new todo appears in the list - use first() to avoid strict mode
        await expect(page.locator('td').filter({ hasText: uniqueTitle }).first()).toBeVisible();
    });

    test('can mark a todo as completed', async ({ page }) => {
        // First, ensure we have at least one todo by creating one
        const testTodoTitle = `Todo for Status Test ${Date.now()}`;
        await page.click('text=Create Todo');
        await page.fill(TEST_CONFIG.selectors.todoTitle, testTodoTitle);
        await page.fill(TEST_CONFIG.selectors.todoDescription, 'This todo will be marked as completed');
        await page.click(TEST_CONFIG.selectors.createButton);
        await waitForNavigation(page, /.*todos$/);

        // Find the specific todo row we just created
        const todoRow = page.locator('table tbody tr').filter({ hasText: testTodoTitle });
        
        // Check if there's a Pending button and click it
        const pendingButton = todoRow.locator('button:has-text("Pending")');
        if (await pendingButton.isVisible()) {
            await pendingButton.click();
            
            // Wait for the status to change to "Completed" in the same row
            await expect(todoRow.locator('button:has-text("Completed")')).toBeVisible({ timeout: 10000 });
        } else {
            // If no pending button, check if there's already a completed button
            await expect(todoRow.locator('button:has-text("Completed")')).toBeVisible();
        }
    });

    test('can edit a todo', async ({ page }) => {
        // First, ensure we have at least one todo by creating one
        const testTodoTitle = `Todo for Edit Test ${Date.now()}`;
        await page.click('text=Create Todo');
        await page.fill(TEST_CONFIG.selectors.todoTitle, testTodoTitle);
        await page.fill(TEST_CONFIG.selectors.todoDescription, 'This todo will be edited');
        await page.click(TEST_CONFIG.selectors.createButton);
        await waitForNavigation(page, /.*todos$/);

        // Find the specific todo row we just created and click Edit
        const todoRow = page.locator('table tbody tr').filter({ hasText: testTodoTitle });
        await todoRow.locator('a:has-text("Edit")').click();
        
        // Wait for the edit page to load
        await expect(page).toHaveURL(/.*todos\/\d+\/edit/);
        
        // Wait for the form to be visible
        await page.waitForSelector(TEST_CONFIG.selectors.todoTitle);

        // Clear and update the title
        const updatedTitle = `Updated Todo Title ${Date.now()}`;
        await page.fill(TEST_CONFIG.selectors.todoTitle, updatedTitle);

        // Submit the form
        await page.click(TEST_CONFIG.selectors.updateButton);

        // Verify we're back on the index page
        await waitForNavigation(page, /.*todos$/);

        // Check if the updated todo appears in the list
        await expect(page.locator('td').filter({ hasText: updatedTitle }).first()).toBeVisible();
    });

    test('can delete a todo', async ({ page }) => {
        // First, ensure we have at least one todo by creating one
        const testTodoTitle = `Todo for Delete Test ${Date.now()}`;
        await page.click('text=Create Todo');
        await page.fill(TEST_CONFIG.selectors.todoTitle, testTodoTitle);
        await page.fill(TEST_CONFIG.selectors.todoDescription, 'This todo will be deleted');
        await page.click(TEST_CONFIG.selectors.createButton);
        await waitForNavigation(page, /.*todos$/);

        // Find the specific todo row we just created
        const todoRow = page.locator('table tbody tr').filter({ hasText: testTodoTitle });
        
        // Verify the todo exists before deletion
        await expect(todoRow).toBeVisible();

        // Set up dialog handler before clicking delete
        page.once('dialog', dialog => {
            expect(dialog.message()).toContain('Are you sure');
            dialog.accept();
        });

        // Click Delete on the specific todo
        await todoRow.locator('button:has-text("Delete")').click();

        // Wait for the todo to be removed
        await expect(todoRow).not.toBeVisible({ timeout: 10000 });
    });
});
