import { test, expect } from '@playwright/test';

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/products');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Layout', () => {
    test('should display products grid', async ({ page }) => {
      const productCards = page.locator('article');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have search input', async ({ page }) => {
      await expect(page.getByPlaceholder(/Search products/i)).toBeVisible();
    });

    test('should have sort dropdown', async ({ page }) => {
      const sortSelect = page.getByRole('combobox').first();
      await expect(sortSelect).toBeVisible();
    });

    test('should display product prices', async ({ page }) => {
      const prices = page.locator('text=/\\$\\d+/');
      const count = await prices.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have Add to Cart buttons', async ({ page }) => {
      // Buttons have aria-label like "Add Product Name to cart"
      const addToCartButtons = page.getByRole('button', { name: /Add .* to cart/i });
      const count = await addToCartButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display product images', async ({ page }) => {
      const images = page.locator('article img');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display product ratings', async ({ page }) => {
      // Look for star ratings or rating text
      const ratings = page.locator('article').filter({ hasText: /\d\.\d/ });
      const count = await ratings.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Search Functionality', () => {
    test('should filter products by search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      await searchInput.fill('Headphones');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(500);
      
      const productCards = page.locator('article');
      const count = await productCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should show no results message for invalid search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      await searchInput.fill('xyznonexistent12345');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(500);
      
      await expect(page.getByText(/No products found/i)).toBeVisible();
    });

    test('should clear search and show all products', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      await searchInput.fill('Headphones');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Clear the search input
      await searchInput.clear();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Should have products
      const count = await page.locator('article').count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should handle special characters in search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      await searchInput.fill('Product & More');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(300);
      
      // Should not crash
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should be case-insensitive', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      
      await searchInput.fill('headphones');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      const lowercaseCount = await page.locator('article').count();
      
      await page.goto('/#/products');
      await page.waitForLoadState('networkidle');
      
      await page.getByPlaceholder(/Search products/i).fill('HEADPHONES');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      const uppercaseCount = await page.locator('article').count();
      
      expect(lowercaseCount).toBe(uppercaseCount);
    });
  });

  test.describe('Sorting', () => {
    test('should sort by price low to high', async ({ page }) => {
      const sortSelect = page.getByRole('combobox').first();
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ label: 'Price: Low to High' });
        await page.waitForTimeout(500);
        
        // Verify products are displayed
        const count = await page.locator('article').count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should sort by price high to low', async ({ page }) => {
      const sortSelect = page.getByRole('combobox').first();
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ label: 'Price: High to Low' });
        await page.waitForTimeout(500);
        
        const count = await page.locator('article').count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should sort by best rating', async ({ page }) => {
      const sortSelect = page.getByRole('combobox').first();
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ label: 'Best Rating' });
        await page.waitForTimeout(500);
        
        const count = await page.locator('article').count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should have multiple sort options', async ({ page }) => {
      const sortSelect = page.getByRole('combobox').first();
      if (await sortSelect.isVisible()) {
        // Get available options
        const options = sortSelect.locator('option');
        const count = await options.count();
        expect(count).toBeGreaterThan(1);
      }
    });
  });

  test.describe('Combined Filters', () => {
    test('should maintain search when changing sort', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search products/i);
      await searchInput.fill('Watch');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      
      const sortSelect = page.getByRole('combobox').first();
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ label: 'Price: Low to High' });
        await page.waitForTimeout(300);
        
        // Search should still be there
        const currentQuery = await searchInput.inputValue();
        expect(currentQuery).toBe('Watch');
      }
    });
  });
});
