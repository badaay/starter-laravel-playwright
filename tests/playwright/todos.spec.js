import { test, expect } from '@playwright/test';

test.describe('Todo Application', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        // Ensure we're logged in
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('can navigate to todos page', async ({ page }) => {
        // Navigate to todos page
        await page.click('text=Todos');
        await expect(page).toHaveURL(/.*todos/);
        await expect(page.locator('h2')).toContainText('Todos');
    });

    test('can create a new todo', async ({ page }) => {
        // Navigate to todos page
        await page.click('text=Todos');

        // Click create button
        await page.click('text=Create Todo');
        await expect(page).toHaveURL(/.*todos\/create/);

        // Fill form
        await page.fill('input[name="title"]', 'Test Todo from Playwright');
        await page.fill('textarea[name="description"]', 'This is a test todo created by Playwright');

        // Submit form
        await page.click('button:has-text("Create")');

        // Verify we're back on the index page
        await expect(page).toHaveURL(/.*todos$/);

        // Check if the new todo appears in the list
        await expect(page.locator('td').filter({ hasText: 'Test Todo from Playwright' })).toBeVisible();
    });

    test('can mark a todo as completed', async ({ page }) => {
        // Navigate to todos page
        await page.click('text=Todos');

        // Assuming we have at least one todo
        // Click on the "Pending" button of the first todo to toggle status
        await page.click('button:has-text("Pending")');

        // Wait for the status to change to "Completed"
        await expect(page.locator('button:has-text("Completed")')).toBeVisible({ timeout: 5000 });
    });

    test('can edit a todo', async ({ page }) => {
        // Navigate to todos page
        await page.click('text=Todos');

        // Click Edit on the first todo
        await page.click('text=Edit >> nth=0');

        // Update the title
        await page.fill('input[name="title"]', 'Updated Todo Title');

        // Submit the form
        await page.click('button:has-text("Update")');

        // Verify we're back on the index page
        await expect(page).toHaveURL(/.*todos$/);

        // Check if the updated todo appears in the list
        await expect(page.locator('td').filter({ hasText: 'Updated Todo Title' })).toBeVisible();
    });

    test('can delete a todo', async ({ page }) => {
        // Navigate to todos page
        await page.click('text=Todos');

        // Get the first todo title to verify deletion
        const firstTodoTitle = await page.locator('table tbody tr >> nth=0 >> td >> nth=1').textContent();

        // Click Delete on the first todo
        await page.click('text=Delete >> nth=0');

        // Handle confirmation dialog
        await page.once('dialog', dialog => dialog.accept());

        // Wait for the todo to be removed
        await expect(page.locator(`td:has-text("${firstTodoTitle}")`)).not.toBeVisible({ timeout: 5000 });
    });
});
