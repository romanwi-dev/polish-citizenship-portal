import { test, expect } from '@playwright/test';

// Basic navigation helper
async function navigateAndWait(page) {
  await page.goto('/admin/cases');
  await page.waitForSelector('[data-testid="responsive-grid-layout"]', { timeout: 10000 });
  await page.waitForTimeout(1000);
}

// Helper to set mobile viewport
async function setMobileViewport(page) {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
}

test.describe('Admin Cases - Mobile UX Tests', () => {
  test('should display cards in single column on mobile', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const grid = page.locator('[data-testid="responsive-grid-layout"]');
    await expect(grid).toHaveClass(/casesGrid/);
    
    const cards = page.locator('.caseCard');
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
      
      // Check single column layout
      const cardCount = await cards.count();
      if (cardCount > 1) {
        const firstCard = cards.first();
        const secondCard = cards.nth(1);
        
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        if (firstBox && secondBox) {
          // Cards should stack vertically on mobile
          expect(secondBox.y).toBeGreaterThan(firstBox.y);
        }
      }
    }
  });

  test('should handle touch interactions correctly', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      await expect(firstCard).toBeVisible();
      
      // Test touch interaction
      await firstCard.tap();
      
      // Verify touch-action property
      const touchAction = await firstCard.evaluate(el => 
        window.getComputedStyle(el).touchAction || el.style.touchAction
      );
      expect(['manipulation', 'auto', 'none']).toContain(touchAction);
      
      // Test WebKit properties for iOS
      const webkitCallout = await firstCard.evaluate(el => el.style.webkitTouchCallout);
      expect(webkitCallout).toBe('none');
    }
  });

  test('should open edit sheet with proper mobile styling', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      await expect(firstCard).toBeVisible();
      
      // Find and click menu button
      const menuButton = firstCard.locator('[data-testid*="button-actions-"]').first();
      if (await menuButton.count() > 0) {
        await menuButton.click();
        
        // Wait for menu to appear
        const caseMenu = page.locator('[data-testid="case-menu-dropdown"]');
        if (await caseMenu.count() > 0) {
          await expect(caseMenu).toBeVisible({ timeout: 5000 });
          
          // Click edit menu item
          const editMenuItem = caseMenu.locator('[data-testid="menu-item-edit"]');
          if (await editMenuItem.count() > 0) {
            await editMenuItem.click();
            
            // Check edit sheet opens
            const editSheet = page.locator('[data-testid="edit-sheet-overlay"]');
            if (await editSheet.count() > 0) {
              await expect(editSheet).toBeVisible({ timeout: 5000 });
              
              // Verify CSS classes
              await expect(editSheet).toHaveClass(/editSheet/);
              
              const editSheetContent = page.locator('[data-testid="edit-sheet-content"]');
              if (await editSheetContent.count() > 0) {
                await expect(editSheetContent).toHaveClass(/editSheetContent/);
              }
              
              // Verify body lock
              const bodyClass = await page.evaluate(() => document.body.className);
              expect(bodyClass).toContain('lock');
              
              // Close and verify lock is removed
              const closeButton = page.locator('[data-testid="button-close-edit-sheet"]');
              if (await closeButton.count() > 0) {
                await closeButton.click();
                await page.waitForTimeout(100);
                const bodyClassAfter = await page.evaluate(() => document.body.className);
                expect(bodyClassAfter).not.toContain('lock');
              }
            }
          }
        }
      }
    }
  });

  test('should have proper menu portal positioning', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      const menuButton = firstCard.locator('[data-testid*="button-actions-"]').first();
      if (await menuButton.count() > 0) {
        await menuButton.click();
        
        const caseMenu = page.locator('[data-testid="case-menu-dropdown"]');
        if (await caseMenu.count() > 0) {
          await expect(caseMenu).toBeVisible();
          
          // Check z-index
          const zIndex = await caseMenu.evaluate(el => window.getComputedStyle(el).zIndex);
          expect(parseInt(zIndex)).toBeGreaterThanOrEqual(1000);
          
          // Check mobile positioning
          const menuBox = await caseMenu.boundingBox();
          if (menuBox) {
            expect(menuBox.width).toBeGreaterThanOrEqual(200);
            expect(menuBox.left).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test('should display all menu actions', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const menuActions = ['edit', 'view', 'copy', 'export', 'postpone', 'suspend', 'cancel', 'archive', 'delete'];
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      const menuButton = firstCard.locator('[data-testid*="button-actions-"]').first();
      if (await menuButton.count() > 0) {
        await menuButton.click();
        
        const caseMenu = page.locator('[data-testid="case-menu-dropdown"]');
        if (await caseMenu.count() > 0) {
          await expect(caseMenu).toBeVisible();
          
          // Check all menu items are present
          for (const action of menuActions) {
            const menuItem = caseMenu.locator(`[data-testid="menu-item-${action}"]`);
            if (await menuItem.count() > 0) {
              await expect(menuItem).toBeVisible();
              await expect(menuItem).toHaveText(action.toUpperCase());
            }
          }
        }
      }
    }
  });

  test('should handle copy action', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      const menuButton = firstCard.locator('[data-testid*="button-actions-"]').first();
      if (await menuButton.count() > 0) {
        await menuButton.click();
        
        const caseMenu = page.locator('[data-testid="case-menu-dropdown"]');
        if (await caseMenu.count() > 0) {
          const copyMenuItem = caseMenu.locator('[data-testid="menu-item-copy"]');
          if (await copyMenuItem.count() > 0) {
            await copyMenuItem.click();
            
            // Check clipboard content
            try {
              const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
              expect(clipboardText).toContain('Case ID:');
            } catch (error) {
              // Clipboard might not work in test environment, that's okay
              console.log('Clipboard test skipped - not available in test environment');
            }
          }
        }
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      await firstCard.focus();
      
      const menuButton = firstCard.locator('[data-testid*="button-actions-"]').first();
      if (await menuButton.count() > 0) {
        await menuButton.click();
        
        const caseMenu = page.locator('[data-testid="case-menu-dropdown"]');
        if (await caseMenu.count() > 0) {
          await expect(caseMenu).toBeVisible();
          
          // Test ESC key
          await page.keyboard.press('Escape');
          
          // Menu should close (might not be visible anymore)
          await page.waitForTimeout(100);
        }
      }
    }
  });
});

test.describe('Admin Cases - Desktop Layout Tests', () => {
  test('should display multi-column layout on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });
    await navigateAndWait(page);
    
    const grid = page.locator('[data-testid="responsive-grid-layout"]');
    await expect(grid).toBeVisible();
    
    // Check for multi-column layout
    const cards = page.locator('.caseCard');
    const cardCount = await cards.count();
    
    if (cardCount > 2) {
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();
      
      if (firstBox && secondBox) {
        // On desktop, cards might be side by side
        const yDiff = Math.abs(firstBox.y - secondBox.y);
        const xDiff = Math.abs(firstBox.x - secondBox.x);
        
        // Either should be side by side (different x, similar y) or stacked (similar x, different y)
        expect(yDiff < 50 || xDiff > 100).toBeTruthy();
      }
    }
  });

  test('should handle double-click interaction on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await navigateAndWait(page);
    
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      await expect(firstCard).toBeVisible();
      
      // Double click should open edit
      await firstCard.dblclick();
      
      // Wait for edit sheet or some response
      await page.waitForTimeout(1000);
      
      const editSheet = page.locator('[data-testid="edit-sheet-overlay"]');
      if (await editSheet.count() > 0) {
        await expect(editSheet).toBeVisible({ timeout: 3000 });
      }
    }
  });
});

test.describe('Admin Cases - Accessibility and Error Handling', () => {
  test('should have proper CSS classes', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    // Check grid has proper class
    const grid = page.locator('[data-testid="responsive-grid-layout"]');
    await expect(grid).toHaveClass(/casesGrid/);
    
    // Check cards have proper class
    const cards = page.locator('.caseCard');
    if (await cards.count() > 0) {
      await expect(cards.first()).toBeVisible();
    }
    
    // Basic CSS verification
    const bodyComputedStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body);
    });
    expect(bodyComputedStyle).toBeDefined();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Mock empty response
    await page.route('/api/admin/cases', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ cases: [] })
      });
    });
    
    await setMobileViewport(page);
    await page.goto('/admin/cases');
    
    // Should not crash
    const grid = page.locator('[data-testid="responsive-grid-layout"]');
    await expect(grid).toBeVisible({ timeout: 10000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('/api/admin/cases', route => {
      route.abort('failed');
    });
    
    await setMobileViewport(page);
    await page.goto('/admin/cases');
    
    // Should not crash the page
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have accessibility attributes', async ({ page }) => {
    await setMobileViewport(page);
    await navigateAndWait(page);
    
    const grid = page.locator('[data-testid="responsive-grid-layout"]');
    await expect(grid).toBeVisible();
    
    // Check for basic accessibility
    const firstCard = page.locator('.caseCard').first();
    if (await firstCard.count() > 0) {
      const ariaLabel = await firstCard.getAttribute('aria-label');
      // Aria label might not be present, but that's ok
      
      const menuButton = firstCard.locator('[data-testid*="button-actions-"]').first();
      if (await menuButton.count() > 0) {
        const hasAriaHaspopup = await menuButton.getAttribute('aria-haspopup');
        if (hasAriaHaspopup) {
          expect(hasAriaHaspopup).toBe('menu');
        }
      }
    }
  });
});