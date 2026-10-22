// Page Object for the login page (https://www.saucedemo.com/).
// All locators and actions for this page live HERE, in one place.
// Tests call methods like login() instead of repeating fill/click steps.
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  // `readonly` = set once in the constructor, never reassigned
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  // The constructor runs on `new LoginPage(page)`.
  // Creating a locator does NOT search the page yet - it only describes
  // how to find the element. The search happens when we act on it (fill, click).
  constructor(page: Page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  // Open the login page ('/' works thanks to baseURL in playwright.config.ts)
  async goto() {
    await this.page.goto('/');
  }

  // Fill in the credentials and submit.
  // No expect() here: checking the RESULT is the test's job, because
  // different tests expect different results (success vs. error).
  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
