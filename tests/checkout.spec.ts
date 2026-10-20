// `cartPage` fixture: logged in, 2 products in the cart, cart page open.
// CART_PRODUCTS: the names of those products (shared with the fixture).
import { test, expect, CART_PRODUCTS } from './fixtures';

test.describe('Checkout', () => {

  test('cart page lists the products added by the fixture', async ({ cartPage: page }) => {
    // Sanity check of our own fixture: if this fails, the other tests
    // in this file would fail too, and this one tells us why
    await expect(page.locator('[data-test="inventory-item-name"]'))
      .toHaveText(CART_PRODUCTS);
  });

  test.describe('Your information form', () => {

    // DATA-DRIVEN TESTS: one list of cases, one test per case.
    // Each case leaves exactly one field empty and expects its error message.
    const cases = [
      { missing: 'first name',  firstName: '',    lastName: 'Horvat', zip: '10000', error: 'First Name is required' },
      { missing: 'last name',   firstName: 'Ana', lastName: '',       zip: '10000', error: 'Last Name is required' },
      { missing: 'postal code', firstName: 'Ana', lastName: 'Horvat', zip: '',      error: 'Postal Code is required' },
    ];

    for (const c of cases) {
      // The test name must be unique, so it includes the case
      test(`shows an error when ${c.missing} is missing`, async ({ cartPage: page }) => {
        await page.getByRole('button', { name: 'Checkout' }).click();

        // fill('') on an empty field is fine - it simply leaves it empty
        await page.getByPlaceholder('First Name').fill(c.firstName);
        await page.getByPlaceholder('Last Name').fill(c.lastName);
        await page.getByPlaceholder('Zip/Postal Code').fill(c.zip);
        await page.getByRole('button', { name: 'Continue' }).click();

        await expect(page.locator('[data-test="error"]')).toContainText(c.error);

        // The form must NOT let us through to the next step
        await expect(page).toHaveURL(/checkout-step-one/);
      });
    }
  });

  test('overview shows correct item total and total', async ({ cartPage: page }) => {
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByPlaceholder('First Name').fill('Ana');
    await page.getByPlaceholder('Last Name').fill('Horvat');
    await page.getByPlaceholder('Zip/Postal Code').fill('10000');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-two/);

    // Instead of hardcoding "$39.98", calculate the expected item total
    // from the prices shown on the page - the test keeps working if prices change
    const prices = page.locator('[data-test="inventory-item-price"]');
    await expect(prices).toHaveCount(CART_PRODUCTS.length); // wait before reading!
    const priceTexts = await prices.allTextContents();
    const toNumber = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ''));
    const itemTotal = priceTexts.map(toNumber).reduce((sum, p) => sum + p, 0);

    // toFixed(2) rounds to 2 decimals and returns a string.
    // Needed because of floating point: 29.99 + 9.99 = 39.980000000000004
    await expect(page.locator('[data-test="subtotal-label"]'))
      .toHaveText(`Item total: $${itemTotal.toFixed(2)}`);

    // Total = item total + tax (tax is read from the page)
    const tax = toNumber(await page.locator('[data-test="tax-label"]').innerText());
    await expect(page.locator('[data-test="total-label"]'))
      .toHaveText(`Total: $${(itemTotal + tax).toFixed(2)}`);
  });

  test('user can complete an order', async ({ cartPage: page }) => {
    // test.step groups actions into named steps. In the HTML report and
    // UI mode the test shows as these steps - easier to see WHERE it failed.
    await test.step('start checkout', async () => {
      await page.getByRole('button', { name: 'Checkout' }).click();
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    await test.step('fill in personal information', async () => {
      await page.getByPlaceholder('First Name').fill('Ana');
      await page.getByPlaceholder('Last Name').fill('Horvat');
      await page.getByPlaceholder('Zip/Postal Code').fill('10000');
      await page.getByRole('button', { name: 'Continue' }).click();
    });

    await test.step('review the order', async () => {
      await expect(page).toHaveURL(/checkout-step-two/);
      await expect(page.locator('[data-test="inventory-item-name"]'))
        .toHaveText(CART_PRODUCTS);
      await page.getByRole('button', { name: 'Finish' }).click();
    });

    await test.step('see the confirmation', async () => {
      await expect(page).toHaveURL(/checkout-complete/);
      await expect(page.locator('[data-test="complete-header"]'))
        .toHaveText('Thank you for your order!');

      // After ordering, the cart is empty, so the badge is gone
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
    });
  });
});
