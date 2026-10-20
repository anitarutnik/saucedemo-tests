// Page Object for the products page (/inventory.html)
import { Page, Locator } from '@playwright/test';

// The values of the options in the sort dropdown.
// A union type: TypeScript only allows these four strings, so a typo like
// sortBy('lowhi') is caught in VS Code before the test even runs.
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  // One product card, found by its name.
  // A method (not a field) because it needs a parameter.
  product(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async addToCart(name: string) {
    await this.product(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name: string) {
    await this.product(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(option);
  }

  async openCart() {
    await this.cartLink.click();
  }
}
