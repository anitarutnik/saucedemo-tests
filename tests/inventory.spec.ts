// Import from OUR fixtures file (not '@playwright/test'), so that
// tests can use the custom `loggedInPage` fixture
import { test, expect } from './fixtures';

test.describe('Inventory', () => {

  // No beforeEach with login needed - the `loggedInPage` fixture does it.
  // Each test gets its own fresh, already logged-in page.

  test('shows 6 products', async ({ loggedInPage: page }) => {
    // `loggedInPage: page` renames the fixture to `page` inside this test,
    // so the code reads the same as in login.spec.ts

    // toHaveCount retries until there are exactly 6 items (or it times out)
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  });

  test.describe('Sorting', () => {

    test('sorts products by name Z to A', async ({ loggedInPage: page }) => {
      const names = page.locator('[data-test="inventory-item-name"]');

      // IMPORTANT: allTextContents() does NOT auto-wait - it returns whatever
      // is on the page at that exact moment (possibly an empty list, if the
      // products are not rendered yet). So first wait until all 6 are there.
      await expect(names).toHaveCount(6);

      // Read the current product names and build the expected order ourselves:
      // copy the array, sort A-Z, then reverse to get Z-A
      const namesBefore = await names.allTextContents();
      const expected = [...namesBefore].sort().reverse();

      // The sort dropdown is a native <select>, so we use selectOption
      // with the option's value ('za' = Name Z to A)
      await page.locator('[data-test="product-sort-container"]').selectOption('za');

      // toHaveText with an ARRAY checks every element, in order.
      // It is web-first: it retries until the list matches.
      await expect(names).toHaveText(expected);
    });

    test('sorts products by price low to high', async ({ loggedInPage: page }) => {
      const prices = page.locator('[data-test="inventory-item-price"]');

      // Wait for all prices before reading them (allTextContents doesn't wait)
      await expect(prices).toHaveCount(6);

      // Prices are text like "$29.99" - to sort them as NUMBERS we strip the "$".
      // Sorting the strings directly would be wrong: "$9.99" > "$15.99" as text.
      const pricesBefore = await prices.allTextContents();
      const toNumber = (price: string) => parseFloat(price.replace('$', ''));
      const expected = [...pricesBefore].sort((a, b) => toNumber(a) - toNumber(b));

      // 'lohi' = Price (low to high)
      await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

      await expect(prices).toHaveText(expected);
    });
  });

  test.describe('Cart', () => {

    test('adding a product updates the cart badge', async ({ loggedInPage: page }) => {
      // Narrow down to ONE product card: of all inventory items,
      // keep only the one whose text contains "Sauce Labs Backpack"
      const backpack = page
        .locator('[data-test="inventory-item"]')
        .filter({ hasText: 'Sauce Labs Backpack' });

      // Search for the button INSIDE that card only (chained locator),
      // otherwise "Add to cart" would match all 6 buttons
      await backpack.getByRole('button', { name: 'Add to cart' }).click();

      // The badge on the cart icon shows the number of items
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

      // The same button now says "Remove"
      await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
    });

    test('removing a product clears the cart badge', async ({ loggedInPage: page }) => {
      const backpack = page
        .locator('[data-test="inventory-item"]')
        .filter({ hasText: 'Sauce Labs Backpack' });

      // Arrange: add the product first (this test must not rely on the previous one)
      await backpack.getByRole('button', { name: 'Add to cart' }).click();

      // Act: remove it again
      await backpack.getByRole('button', { name: 'Remove' }).click();

      // Assert: with an empty cart, the badge is not rendered at all
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
    });

    test('added products are listed in the cart', async ({ loggedInPage: page }) => {
      // Add two different products
      for (const name of ['Sauce Labs Backpack', 'Sauce Labs Bike Light']) {
        await page
          .locator('[data-test="inventory-item"]')
          .filter({ hasText: name })
          .getByRole('button', { name: 'Add to cart' })
          .click();
      }

      // Open the cart by clicking the cart icon
      await page.locator('[data-test="shopping-cart-link"]').click();
      await expect(page).toHaveURL(/cart/);

      // The cart lists exactly those two products
      await expect(page.locator('[data-test="inventory-item-name"]'))
        .toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    });
  });
});
