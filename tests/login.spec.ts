// Import the test runner and assertion library from Playwright
import { test, expect } from '@playwright/test';
// Page Object: knows HOW to use the login page (locators + actions)
import { LoginPage } from '../pages/LoginPage';

// Group related tests under one name (shown in reports and in VS Code)
test.describe('Login', () => {

  // Declared here so every test in this group can use it;
  // assigned in beforeEach, because `page` exists only inside a test/hook
  let loginPage: LoginPage;

  // Runs before EACH test in this group - every test starts on the login page
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to the products page', async ({ page }) => {
    // One line instead of fill + fill + click - the details live in LoginPage
    await loginPage.login('standard_user', 'secret_sauce');

    // Assert: URL contains "inventory" (regex, so the full URL doesn't matter)
    await expect(page).toHaveURL(/inventory/);

    // Assert: the page title "Products" is visible
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('wrong password shows an error message', async () => {
    // Valid username, invalid password
    await loginPage.login('standard_user', 'wrong_password');

    // The error locator also comes from the page object
    await expect(loginPage.error).toContainText('do not match');
  });

  test('locked out user sees an error message', async () => {
    // New test - thanks to the page object it is only two lines
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(loginPage.error).toContainText('this user has been locked out');
  });
});
