// Import from OUR fixtures file (not '@playwright/test'), so that
// tests can use the custom `loggedInPage` fixture
import { test, expect } from './fixtures';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

test.describe('Inventory', () => {

  // The `loggedInPage` fixture logs in; here we only wrap that page
  // in the InventoryPage page object before each test
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ loggedInPage }) => {
    inventoryPage = new InventoryPage(loggedInPage);
  });

  test('shows 6 products', async () => {
    // toHaveCount retries until there are exactly 6 items (or it times out)
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test.describe('Sorting', () => {

    test('sorts products by name Z to A', async () => {
      const names = inventoryPage.itemNames;

      // IMPORTANT: allTextContents() does NOT auto-wait - it returns whatever
      // is on the page at that exact moment (possibly an empty list, if the
      // products are not rendered yet). So first wait until all 6 are there.
      await expect(names).toHaveCount(6);

      // Read the current product names and build the expected order ourselves:
      // copy the array, sort A-Z, then reverse to get Z-A
      const namesBefore = await names.allTextContents();
      const expected = [...namesBefore].sort().reverse();

      // 'za' = Name Z to A (only the four SortOption values are allowed)
      await inventoryPage.sortBy('za');

      // toHaveText with an ARRAY checks every element, in order.
      // It is web-first: it retries until the list matches.
      await expect(names).toHaveText(expected);
    });

    test('sorts products by price low to high', async () => {
      const prices = inventoryPage.itemPrices;

      // Wait for all prices before reading them (allTextContents doesn't wait)
      await expect(prices).toHaveCount(6);

      // Prices are text like "$29.99" - to sort them as NUMBERS we strip the "$".
      // Sorting the strings directly would be wrong: "$9.99" > "$15.99" as text.
      const pricesBefore = await prices.allTextContents();
      const toNumber = (price: string) => parseFloat(price.replace('$', ''));
      const expected = [...pricesBefore].sort((a, b) => toNumber(a) - toNumber(b));

      // 'lohi' = Price (low to high)
      await inventoryPage.sortBy('lohi');

      await expect(prices).toHaveText(expected);
    });
  });

  test.describe('Cart', () => {

    test('adding a product updates the cart badge', async () => {
      await inventoryPage.addToCart('Sauce Labs Backpack');

      // The badge on the cart icon shows the number of items
      await expect(inventoryPage.cartBadge).toHaveText('1');

      // The same button now says "Remove".
      // product() returns a Locator, so we can keep chaining from it.
      await expect(
        inventoryPage.product('Sauce Labs Backpack').getByRole('button', { name: 'Remove' })
      ).toBeVisible();
    });

    test('removing a product clears the cart badge', async () => {
      // Arrange: add the product first (this test must not rely on the previous one)
      await inventoryPage.addToCart('Sauce Labs Backpack');

      // Act: remove it again
      await inventoryPage.removeFromCart('Sauce Labs Backpack');

      // Assert: with an empty cart, the badge is not rendered at all
      await expect(inventoryPage.cartBadge).toHaveCount(0);
    });

    test('added products are listed in the cart', async ({ loggedInPage: page }) => {
      // Add two different products
      for (const name of ['Sauce Labs Backpack', 'Sauce Labs Bike Light']) {
        await inventoryPage.addToCart(name);
      }

      await inventoryPage.openCart();
      await expect(page).toHaveURL(/cart/);

      // The cart lists exactly those two products (cart page -> CartPage)
      const cart = new CartPage(page);
      await expect(cart.itemNames).toHaveText(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    });
  });
});
