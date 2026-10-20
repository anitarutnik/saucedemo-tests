// Page Object for the checkout flow. Saucedemo splits checkout into three
// small pages (step one: your information, step two: overview, complete).
// They are short, so here they share one class; in a bigger app each page
// would get its own class.
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Step one: "Your Information" form
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly zip: Locator;
  readonly continueButton: Locator;
  readonly error: Locator;

  // Step two: overview
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.zip = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.error = page.locator('[data-test="error"]');

    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.getByRole('button', { name: 'Finish' });

    this.completeHeader = page.locator('[data-test="complete-header"]');
  }

  async fillInformation(firstName: string, lastName: string, zip: string) {
    await this.fillAndVerify(this.firstName, firstName);
    await this.fillAndVerify(this.lastName, lastName);
    await this.fillAndVerify(this.zip, zip);
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  // FIX FOR A FLAKY TEST (seen in WebKit, about 1 run in 6):
  // right after the form appears, the page sometimes re-renders and clears
  // what was just typed - so the form complained "First Name is required"
  // although we had filled it in.
  //
  // toPass() retries the whole block until it passes (or the timeout):
  // fill the field, then check the value really stayed there.
  //
  // `private` = only this class can call it; tests use fillInformation().
  //
  // Note: this expect() does NOT check the test's result - it makes sure
  // the ACTION worked, so it belongs in the page object.
  private async fillAndVerify(field: Locator, value: string) {
    await expect(async () => {
      await field.fill(value);
      await expect(field).toHaveValue(value, { timeout: 500 });
    }).toPass({ timeout: 5000 });
  }
}
