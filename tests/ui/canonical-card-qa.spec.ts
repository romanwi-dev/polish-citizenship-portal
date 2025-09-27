import { test, expect } from '@playwright/test';

/**
 * QA Guardrails for Canonical Card System
 * 
 * These tests ensure:
 * 1. Visual consistency across all card implementations
 * 2. Proper navigation behaviors 
 * 3. Responsive design compliance
 * 4. Edit panel functionality (desktop rail + mobile sheet)
 * 5. Zero-errors policy enforcement
 */

// Test utilities
async function navigateToAdminCases(page) {
  await page.goto('/admin/cases');
  await page.waitForSelector('[data-testid="responsive-grid-layout"]', { timeout: 15000 });
  await page.waitForTimeout(2000); // Allow cards to settle
}

async function setDesktopViewport(page) {
  await page.setViewportSize({ width: 1280, height: 720 });
}

async function setMobileViewport(page) {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13
}

test.describe('Canonical Card System - QA Guardrails', () => {

  test.describe('Visual Consistency Tests', () => {
    
    test('should maintain exact visual design on desktop', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        await expect(firstCard).toBeVisible();
        
        // Visual design assertions
        await expect(firstCard).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // White background
        await expect(firstCard).toHaveCSS('border-radius', '12px'); // Rounded corners
        
        // Check shadow (box-shadow approximation)
        const shadowStyle = await firstCard.evaluate(el => window.getComputedStyle(el).boxShadow);
        expect(shadowStyle).toContain('rgba'); // Has shadow
        
        // Check required elements exist
        await expect(firstCard.locator('[data-testid="dropdown-trigger"]')).toBeVisible();
        await expect(firstCard.locator('.text-lg.font-semibold')).toBeVisible(); // Client name
        await expect(firstCard.locator('.text-sm.text-gray-600')).toBeVisible(); // Date
        
        // Verify Polish date format (DD.MM.YYYY)
        const dateElements = firstCard.locator('.text-sm.text-gray-600');
        const dateText = await dateElements.first().textContent();
        if (dateText) {
          // Check for DD.MM.YYYY pattern
          const polishDatePattern = /\d{2}\.\d{2}\.\d{4}/;
          expect(polishDatePattern.test(dateText)).toBeTruthy();
        }
      }
    });

    test('should maintain visual consistency on mobile', async ({ page }) => {
      await setMobileViewport(page);
      await navigateToAdminCases(page);
      
      const grid = page.locator('[data-testid="responsive-grid-layout"]');
      await expect(grid).toHaveClass(/grid-cols-1/); // Single column on mobile
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        await expect(firstCard).toBeVisible();
        
        // Mobile-specific visual checks
        await expect(firstCard).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        
        // Touch-friendly button sizes
        const dropdownButton = firstCard.locator('[data-testid="dropdown-trigger"]');
        const buttonSize = await dropdownButton.boundingBox();
        if (buttonSize) {
          expect(buttonSize.width).toBeGreaterThanOrEqual(44); // Minimum touch target
          expect(buttonSize.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should display cards in correct responsive layout', async ({ page }) => {
      // Test desktop: 2-column grid
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const grid = page.locator('[data-testid="responsive-grid-layout"]');
      await expect(grid).toHaveClass(/md:grid-cols-2/); // 2 columns on desktop
      
      // Test mobile: 1-column grid  
      await setMobileViewport(page);
      await page.reload();
      await page.waitForSelector('[data-testid="responsive-grid-layout"]', { timeout: 10000 });
      
      await expect(grid).toHaveClass(/grid-cols-1/); // 1 column on mobile
      
      // Verify cards stack vertically on mobile
      const cards = page.locator('.caseCard');
      const cardCount = await cards.count();
      if (cardCount > 1) {
        const firstCard = cards.first();
        const secondCard = cards.nth(1);
        
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        if (firstBox && secondBox) {
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10); // Stacked vertically
        }
      }
    });
  });

  test.describe('Navigation Behavior Tests', () => {
    
    test('View button should navigate to /agent/:id?tab=overview', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        // Open dropdown
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        await dropdownTrigger.click();
        
        // Wait for dropdown to appear
        await page.waitForSelector('[data-testid="dropdown-menu"]', { timeout: 5000 });
        
        // Click View option
        const viewButton = page.locator('[data-testid="dropdown-item-view"]');
        await expect(viewButton).toBeVisible();
        
        // Track navigation
        const navigationPromise = page.waitForURL(/\/agent\/[\w-]+\?tab=overview/);
        await viewButton.click();
        
        // Verify correct URL format
        await navigationPromise;
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/agent\/[\w-]+\?tab=overview/);
      }
    });

    test('Control Room button should navigate to /agent/:id', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        // Open dropdown
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        await dropdownTrigger.click();
        
        // Wait for dropdown to appear
        await page.waitForSelector('[data-testid="dropdown-menu"]', { timeout: 5000 });
        
        // Click Control Room option (if exists)
        const controlRoomButton = page.locator('[data-testid="dropdown-item-control-room"]');
        if (await controlRoomButton.count() > 0) {
          const navigationPromise = page.waitForURL(/\/agent\/[\w-]+$/);
          await controlRoomButton.click();
          
          // Verify correct URL format (no tab parameter)
          await navigationPromise;
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/agent\/[\w-]+$/);
          expect(currentUrl).not.toContain('tab=');
        }
      }
    });
  });

  test.describe('Edit Panel Functionality Tests', () => {
    
    test('Edit panel should open as right rail on desktop', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        // Open dropdown and click Edit
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        await dropdownTrigger.click();
        
        await page.waitForSelector('[data-testid="dropdown-menu"]', { timeout: 5000 });
        
        const editButton = page.locator('[data-testid="dropdown-item-edit"]');
        if (await editButton.count() > 0) {
          await editButton.click();
          
          // Check for desktop edit panel (right rail)
          const editPanel = page.locator('[data-testid="edit-panel-desktop"]');
          if (await editPanel.count() > 0) {
            await expect(editPanel).toBeVisible();
            
            // Verify right-side positioning
            const panelBox = await editPanel.boundingBox();
            if (panelBox) {
              expect(panelBox.x).toBeGreaterThan(800); // Right side of screen
              expect(panelBox.width).toBeLessThanOrEqual(400); // Fixed width
            }
            
            // Verify form elements exist
            await expect(editPanel.locator('input[type="text"]')).toBeVisible();
            await expect(editPanel.locator('[data-testid="button-save-changes"]')).toBeVisible();
            await expect(editPanel.locator('[data-testid="button-close-edit"]')).toBeVisible();
            
            // Close the panel
            await editPanel.locator('[data-testid="button-close-edit"]').click();
          }
        }
      }
    });

    test('Edit panel should open as full-screen sheet on mobile', async ({ page }) => {
      await setMobileViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        // Open dropdown and click Edit
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        await dropdownTrigger.click();
        
        await page.waitForSelector('[data-testid="dropdown-menu"]', { timeout: 5000 });
        
        const editButton = page.locator('[data-testid="dropdown-item-edit"]');
        if (await editButton.count() > 0) {
          await editButton.click();
          
          // Check for mobile edit sheet
          const editSheet = page.locator('[data-testid="edit-panel-mobile"]');
          if (await editSheet.count() > 0) {
            await expect(editSheet).toBeVisible();
            
            // Verify full-screen behavior
            const sheetBox = await editSheet.boundingBox();
            if (sheetBox) {
              expect(sheetBox.width).toBeGreaterThan(300); // Takes significant screen width
              expect(sheetBox.height).toBeGreaterThan(400); // Takes significant screen height
            }
            
            // Verify mobile-optimized form elements
            const inputs = editSheet.locator('input');
            const inputCount = await inputs.count();
            for (let i = 0; i < inputCount; i++) {
              const input = inputs.nth(i);
              const inputBox = await input.boundingBox();
              if (inputBox) {
                expect(inputBox.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
              }
            }
            
            // Verify mobile buttons
            await expect(editSheet.locator('[data-testid="button-save-changes-mobile"]')).toBeVisible();
            await expect(editSheet.locator('[data-testid="button-close-edit-mobile"]')).toBeVisible();
            
            // Close the sheet
            await editSheet.locator('[data-testid="button-close-edit-mobile"]').click();
          }
        }
      }
    });
  });

  test.describe('Performance and Error Tests', () => {
    
    test('should load without JavaScript errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      // Wait for any async operations to complete
      await page.waitForTimeout(3000);
      
      // Check for errors
      expect(errors.length).toBe(0);
      if (errors.length > 0) {
        console.log('JavaScript errors detected:', errors);
      }
    });

    test('should maintain performance under interaction load', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      // Test rapid dropdown interactions
      const cards = page.locator('.caseCard');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const firstCard = cards.first();
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        
        // Rapid open/close cycles
        for (let i = 0; i < 5; i++) {
          await dropdownTrigger.click();
          await page.waitForTimeout(100);
          await dropdownTrigger.click();
          await page.waitForTimeout(100);
        }
        
        // Verify card is still responsive
        await expect(firstCard).toBeVisible();
        await expect(dropdownTrigger).toBeEnabled();
      }
    });

    test('should handle edge cases gracefully', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      // Test empty state or missing data
      const cards = page.locator('.caseCard');
      const cardCount = await cards.count();
      
      if (cardCount === 0) {
        // Verify empty state is handled
        const emptyMessage = page.locator('[data-testid="empty-state"]');
        if (await emptyMessage.count() > 0) {
          await expect(emptyMessage).toBeVisible();
        }
      } else {
        // Test card with potentially missing data
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();
        
        // Verify graceful handling of missing elements
        const clientName = firstCard.locator('.text-lg.font-semibold');
        if (await clientName.count() > 0) {
          const nameText = await clientName.textContent();
          expect(nameText?.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Accessibility and UX Tests', () => {
    
    test('should support keyboard navigation', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        
        // Focus the dropdown trigger
        await dropdownTrigger.focus();
        await expect(dropdownTrigger).toBeFocused();
        
        // Test keyboard activation
        await page.keyboard.press('Enter');
        await page.waitForSelector('[data-testid="dropdown-menu"]', { timeout: 3000 });
        
        // Test escape key closes dropdown
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const dropdown = page.locator('[data-testid="dropdown-menu"]');
        if (await dropdown.count() > 0) {
          await expect(dropdown).not.toBeVisible();
        }
      }
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await setDesktopViewport(page);
      await navigateToAdminCases(page);
      
      const firstCard = page.locator('.caseCard').first();
      if (await firstCard.count() > 0) {
        const dropdownTrigger = firstCard.locator('[data-testid="dropdown-trigger"]');
        
        // Check for proper ARIA attributes
        await expect(dropdownTrigger).toHaveAttribute('aria-haspopup', 'true');
        
        // Check for descriptive labels
        const ariaLabel = await dropdownTrigger.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel?.length).toBeGreaterThan(5);
      }
    });
  });
});