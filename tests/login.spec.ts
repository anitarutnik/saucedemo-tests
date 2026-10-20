// Import the test runner and assertion library from Playwright
import { test, expect } from '@playwright/test';

// Group related tests under one name (shown in reports and in VS Code)
test.describe('Login', () => {

  // Runs before EACH test in this group - every test starts on the login page
  // '/' works because baseURL is set in playwright.config.ts
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('successful login redirects to the products page', async ({ page }) => {
    // Fill in the credentials - locate inputs by their placeholder text
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    // Locate the button by its accessible role and visible name
    await page.getByRole('button', { name: 'Login' }).click();

    // Assert: URL contains "inventory" (regex, so the full URL doesn't matter)
    await expect(page).toHaveURL(/inventory/);

    // Assert: the page title "Products" is visible
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('wrong password shows an error message', async ({ page }) => {
    // Valid username, invalid password
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();

    // Locate the error box by its data-test attribute (stable, added for testing)
    // and assert that it contains part of the expected message
    await expect(page.locator('[data-test="error"]'))
      .toContainText('do not match');
  });
});