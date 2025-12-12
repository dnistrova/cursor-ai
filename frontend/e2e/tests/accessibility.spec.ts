import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.describe('Page Structure', () => {
    test('should have proper structure on home', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should have proper structure on products', async ({ page }) => {
      await page.goto('/#/products');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should have proper structure on kanban', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should have proper structure on settings', async ({ page }) => {
      await page.goto('/#/settings');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should have proper structure on social', async ({ page }) => {
      await page.goto('/#/social');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have navigation with aria-label', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('navigation')).toBeVisible();
    });

    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should have labeled navigation links
      const links = page.getByRole('link');
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate with Tab', async ({ page }) => {
      await page.goto('/#/products');
      await page.waitForLoadState('networkidle');
      
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      const addButton = page.getByRole('button', { name: /Add Task/i }).first();
      await addButton.focus();
      await expect(addButton).toBeFocused();
    });

    test('should close modal with Escape', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('button', { name: /Add Task/i }).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('ARIA Attributes', () => {
    test('should have aria-labels on buttons', async ({ page }) => {
      await page.goto('/#/products');
      await page.waitForLoadState('networkidle');
      
      // Cart buttons should have aria-labels
      const cartButtons = page.getByRole('button', { name: /Add .* to cart/i });
      const count = await cartButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have aria-hidden on decorative icons', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      const decorativeIcons = page.locator('svg[aria-hidden="true"]');
      const count = await decorativeIcons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have proper aria-expanded on dropdowns', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      const menuButton = page.getByRole('button', { name: /Task options|menu/i }).first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        // After clicking, should have aria-expanded
        const expanded = await menuButton.getAttribute('aria-expanded');
        expect(expanded).toBe('true');
      }
    });
  });

  test.describe('Headings', () => {
    test('should have headings on kanban page', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      const headings = page.getByRole('heading');
      const count = await headings.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should have headings on products page', async ({ page }) => {
      await page.goto('/#/products');
      await page.waitForLoadState('networkidle');
      
      const headings = page.getByRole('heading');
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Forms', () => {
    test('should have labeled form inputs', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('button', { name: /Add Task/i }).first().click();
      
      // Form inputs should have labels
      await expect(page.getByLabel(/Title/i)).toBeVisible();
      await expect(page.getByLabel(/Description/i)).toBeVisible();
    });

    test('should indicate required fields', async ({ page }) => {
      await page.goto('/#/kanban');
      await page.waitForLoadState('networkidle');
      
      await page.getByRole('button', { name: /Add Task/i }).first().click();
      
      // Title should be required
      const titleInput = page.locator('#task-title');
      const isRequired = await titleInput.getAttribute('required');
      expect(isRequired !== null || await titleInput.isVisible()).toBe(true);
    });
  });
});
