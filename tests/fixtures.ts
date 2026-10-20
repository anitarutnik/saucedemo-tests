// Custom fixtures: reusable setup that Playwright injects into tests by name.
// Instead of repeating the login steps in every test, a test simply asks for
// `loggedInPage` and receives a page that is already logged in.
import { test as base, expect, Page } from '@playwright/test';

// Describe the TYPE of each custom fixture, so TypeScript knows that
// `loggedInPage` is a Page (and gives autocomplete inside tests).
type MyFixtures = {
  loggedInPage: Page;
  cartPage: Page;
};

// Products that the `cartPage` fixture puts into the cart.
// Exported, so tests can check against the same list.
export const CART_PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

// `base.extend` creates a NEW `test` function that has all the built-in
// fixtures (page, browser, context...) PLUS our own.
export const test = base.extend<MyFixtures>({

  // A fixture is an async function with two parameters:
  //  1. other fixtures it depends on (here the built-in `page`)
  //  2. `use` - a function that hands the fixture value to the test
  loggedInPage: async ({ page }, use) => {
    // --- SETUP: runs before the test ---
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    // Make sure login really worked; otherwise every test would fail
    // later with a confusing error far from the real cause
    await expect(page).toHaveURL(/inventory/);

    // --- The test runs HERE, while `use` is awaited ---
    await use(page);

    // --- TEARDOWN: code after `use` runs after the test ---
    // Nothing to clean up: Playwright closes the page automatically.
  },

  // Fixtures can depend on OTHER custom fixtures. `cartPage` asks for
  // `loggedInPage`, so Playwright first runs the login fixture, then this one.
  // Login code is not repeated here - it is reused.
  cartPage: async ({ loggedInPage: page }, use) => {
    // Add every product from CART_PRODUCTS to the cart
    for (const name of CART_PRODUCTS) {
      await page
        .locator('[data-test="inventory-item"]')
        .filter({ hasText: name })
        .getByRole('button', { name: 'Add to cart' })
        .click();
    }

    // Open the cart page
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart/);

    await use(page);
  },
});

// Re-export expect, so spec files import everything from one place:
// import { test, expect } from './fixtures';
export { expect };
