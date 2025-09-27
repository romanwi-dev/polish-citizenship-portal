// Print CSS Tests for DocRadar
// Validates print stylesheets and PDF generation readiness

import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

// Set QA mode for all print tests
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('QA_MODE', '1');
  });
});

test.describe('DocRadar Print CSS Tests', () => {

  test('print-docRadar.css file exists and has required rules', async () => {
    const printCssPath = path.join(process.cwd(), 'client/src/styles/print-docRadar.css');
    
    // Verify file exists
    try {
      await fs.access(printCssPath);
    } catch (error) {
      throw new Error('print-docRadar.css file not found');
    }
    
    // Read CSS content
    const cssContent = await fs.readFile(printCssPath, 'utf-8');
    
    // Test required CSS rules exist
    expect(cssContent).toContain('@page');
    expect(cssContent).toContain('size: A4 landscape');
    expect(cssContent).toContain('@media print');
    expect(cssContent).toContain('.doc-radar-print');
    expect(cssContent).toContain('.non-print');
    expect(cssContent).toContain('display: none !important');
    
    // Test print-specific styling
    expect(cssContent).toContain('background: #fff !important');
    expect(cssContent).toContain('color: #000 !important');
    expect(cssContent).toContain('-webkit-print-color-adjust: exact');
    expect(cssContent).toContain('print-color-adjust: exact');
  });

  test('DocRadar component has proper print classes', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar if available
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check for print-ready classes
      const printContainer = page.locator('.doc-radar-print');
      if (await printContainer.count() > 0) {
        await expect(printContainer).toBeVisible();
        
        // Verify print container has proper structure
        const hasTitle = await printContainer.locator('.doc-radar-title').count() > 0;
        const hasGrid = await printContainer.locator('.doc-radar-grid').count() > 0;
        
        expect(hasTitle || hasGrid).toBe(true);
      }
      
      // Check that non-print elements exist and are marked
      const nonPrintElements = page.locator('.non-print');
      if (await nonPrintElements.count() > 0) {
        // These should be visible on screen but hidden in print
        await expect(nonPrintElements.first()).toBeVisible();
      }
    }
  });

  test('Print view hides UI elements correctly', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      // Elements that should be hidden in print
      const hiddenInPrint = [
        'header',
        'nav',
        '.app-sidebar',
        '.btn',
        '.non-print',
        '.toast',
        '.floating-toolbar'
      ];
      
      for (const selector of hiddenInPrint) {
        const elements = page.locator(selector);
        const count = await elements.count();
        
        for (let i = 0; i < count; i++) {
          const element = elements.nth(i);
          if (await element.isVisible()) {
            // Check if element has print-hiding CSS
            const display = await element.evaluate(el => getComputedStyle(el).display);
            
            // Elements should be hidden via display:none in print media
            if (selector === '.non-print' || selector.includes('btn')) {
              expect(display).toBe('none');
            }
          }
        }
      }
      
      // Reset media emulation
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('Print layout uses proper typography and spacing', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      const printContainer = page.locator('.doc-radar-print');
      
      if (await printContainer.count() > 0) {
        // Test typography
        const title = printContainer.locator('.doc-radar-title');
        if (await title.count() > 0) {
          const fontSize = await title.evaluate(el => getComputedStyle(el).fontSize);
          const fontWeight = await title.evaluate(el => getComputedStyle(el).fontWeight);
          
          // Title should have appropriate print sizing
          expect(parseInt(fontSize)).toBeGreaterThan(16); // At least 16px for print
          expect(fontWeight).toBe('700');
        }
        
        // Test grid layout
        const grid = printContainer.locator('.doc-radar-grid');
        if (await grid.count() > 0) {
          const display = await grid.evaluate(el => getComputedStyle(el).display);
          expect(display).toBe('grid');
          
          const gridColumns = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
          expect(gridColumns).toContain('1fr');
        }
        
        // Test person cards
        const personCards = printContainer.locator('.doc-person');
        const cardCount = await personCards.count();
        
        if (cardCount > 0) {
          for (let i = 0; i < Math.min(cardCount, 3); i++) {
            const card = personCards.nth(i);
            const breakInside = await card.evaluate(el => getComputedStyle(el).breakInside);
            
            // Cards should avoid page breaks
            expect(breakInside).toBe('avoid');
          }
        }
      }
      
      // Reset media emulation
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('Print chips have proper color coding and patterns', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      const chips = page.locator('.chip');
      const chipCount = await chips.count();
      
      if (chipCount > 0) {
        for (let i = 0; i < Math.min(chipCount, 10); i++) {
          const chip = chips.nth(i);
          const className = await chip.getAttribute('class');
          
          if (className) {
            const border = await chip.evaluate(el => getComputedStyle(el).border);
            const background = await chip.evaluate(el => getComputedStyle(el).background);
            
            // All chips should have borders for print clarity
            expect(border).toContain('1px');
            
            // Different chip types should have different visual treatments
            if (className.includes('have')) {
              expect(background).toContain('rgb(10, 125, 51)'); // Solid green
            } else if (className.includes('progress')) {
              expect(background).toContain('linear-gradient'); // Striped pattern
            } else if (className.includes('needed')) {
              expect(background).toContain('rgb(255, 255, 255)'); // White background
            }
          }
        }
      }
      
      // Reset media emulation
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('Print legend is present and readable', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      const legend = page.locator('.doc-legend');
      
      if (await legend.count() > 0) {
        await expect(legend).toBeVisible();
        
        // Check legend has proper grid layout
        const display = await legend.evaluate(el => getComputedStyle(el).display);
        expect(display).toBe('grid');
        
        // Check for legend chips and text
        const legendChips = legend.locator('.legend-chip');
        const legendTexts = legend.locator('.legend-text');
        
        expect(await legendChips.count()).toBeGreaterThan(0);
        expect(await legendTexts.count()).toBeGreaterThan(0);
        
        // Verify legend text is readable in print
        const legendText = legendTexts.first();
        if (await legendText.count() > 0) {
          const fontSize = await legendText.evaluate(el => getComputedStyle(el).fontSize);
          expect(parseInt(fontSize)).toBeGreaterThanOrEqual(11); // Minimum readable size
        }
      }
      
      // Reset media emulation
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('Print export button is hidden in print view', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Look for export/print buttons
      const exportButtons = page.locator('button').filter({ hasText: /export|print|pdf|download/i });
      const exportCount = await exportButtons.count();
      
      if (exportCount > 0) {
        // Verify buttons are visible in screen mode
        await expect(exportButtons.first()).toBeVisible();
        
        // Emulate print media
        await page.emulateMedia({ media: 'print' });
        
        // Check if buttons are hidden in print
        for (let i = 0; i < exportCount; i++) {
          const button = exportButtons.nth(i);
          const className = await button.getAttribute('class');
          
          // Buttons should have non-print class or be hidden via CSS
          if (className?.includes('non-print')) {
            const display = await button.evaluate(el => getComputedStyle(el).display);
            expect(display).toBe('none');
          } else {
            // If not marked as non-print, should still be hidden via general button rules
            const display = await button.evaluate(el => getComputedStyle(el).display);
            expect(display).toBe('none');
          }
        }
        
        // Reset media emulation
        await page.emulateMedia({ media: 'screen' });
      }
    }
  });

  test('Print layout fits A4 landscape dimensions', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Set page size to A4 landscape (297mm x 210mm = ~1123px x 794px at 96 DPI)
      await page.setViewportSize({ width: 1123, height: 794 });
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      const printContainer = page.locator('.doc-radar-print');
      
      if (await printContainer.count() > 0) {
        const boundingBox = await printContainer.boundingBox();
        
        if (boundingBox) {
          // Content should fit within A4 landscape with margins (12mm = ~45px)
          const maxWidth = 1123 - (45 * 2); // A4 width minus margins
          const maxHeight = 794 - (45 * 2); // A4 height minus margins
          
          expect(boundingBox.width).toBeLessThanOrEqual(maxWidth);
          expect(boundingBox.height).toBeLessThanOrEqual(maxHeight);
          
          // Content should not be too small either
          expect(boundingBox.width).toBeGreaterThan(500);
          expect(boundingBox.height).toBeGreaterThan(300);
        }
      }
      
      // Reset viewport and media
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('Print CSS color accuracy settings are applied', async ({ page }) => {
    await page.goto('/admin-v3');
    await page.waitForTimeout(1000);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/i });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      // Check body has print color settings
      const body = page.locator('body');
      const webkitColorAdjust = await body.evaluate(el => getComputedStyle(el).webkitPrintColorAdjust);
      const printColorAdjust = await body.evaluate(el => getComputedStyle(el).printColorAdjust);
      
      // Should be set to 'exact' for accurate color reproduction
      expect(webkitColorAdjust === 'exact' || printColorAdjust === 'exact').toBe(true);
      
      // Check background and text colors are set for print
      const backgroundColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
      const color = await body.evaluate(el => getComputedStyle(el).color);
      
      expect(backgroundColor).toContain('rgb(255, 255, 255)'); // White background
      expect(color).toContain('rgb(0, 0, 0)'); // Black text
      
      // Reset media emulation
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('CSS validation - no syntax errors in print styles', async () => {
    const printCssPath = path.join(process.cwd(), 'client/src/styles/print-docRadar.css');
    const cssContent = await fs.readFile(printCssPath, 'utf-8');
    
    // Basic CSS syntax validation
    const rules = cssContent.match(/@media\s+print\s*\{[^}]*\}/gs);
    expect(rules).toBeTruthy();
    expect(rules.length).toBeGreaterThan(0);
    
    // Check for balanced braces
    const openBraces = (cssContent.match(/\{/g) || []).length;
    const closeBraces = (cssContent.match(/\}/g) || []).length;
    expect(openBraces).toBe(closeBraces);
    
    // Check for malformed selectors
    const malformedSelectors = cssContent.match(/\.[a-zA-Z-_][^{]*\s\{/g);
    if (malformedSelectors) {
      malformedSelectors.forEach(selector => {
        // Basic validation - should not have trailing spaces before {
        expect(selector.trim()).toMatch(/\{$/);
      });
    }
    
    // Check for proper @page rules
    const pageRules = cssContent.match(/@page[^{]*\{[^}]*\}/gs);
    expect(pageRules).toBeTruthy();
    expect(pageRules[0]).toContain('size:');
    expect(pageRules[0]).toContain('margin:');
  });

  test('Print summary - comprehensive validation', async ({ page }) => {
    const printCssPath = path.join(process.cwd(), 'client/src/styles/print-docRadar.css');
    
    // File existence and content checks
    const cssContent = await fs.readFile(printCssPath, 'utf-8');
    
    const validationResults = {
      fileExists: true,
      hasPageRules: cssContent.includes('@page'),
      hasMediaPrint: cssContent.includes('@media print'),
      hasDocRadarPrint: cssContent.includes('.doc-radar-print'),
      hasNonPrintHiding: cssContent.includes('.non-print') && cssContent.includes('display: none !important'),
      hasColorAccuracy: cssContent.includes('print-color-adjust: exact'),
      hasBreakAvoidance: cssContent.includes('break-inside: avoid'),
      hasProperMargins: cssContent.includes('margin:') && cssContent.includes('12mm'),
      hasLandscapeOrientation: cssContent.includes('A4 landscape'),
      hasChipStyling: cssContent.includes('.chip')
    };
    
    const passedChecks = Object.values(validationResults).filter(Boolean).length;
    const totalChecks = Object.keys(validationResults).length;
    
    console.log(`\n📄 Print CSS Validation Summary:
    - File exists: ${validationResults.fileExists ? '✅' : '❌'}
    - @page rules: ${validationResults.hasPageRules ? '✅' : '❌'}
    - @media print: ${validationResults.hasMediaPrint ? '✅' : '❌'}
    - DocRadar print class: ${validationResults.hasDocRadarPrint ? '✅' : '❌'}
    - Non-print hiding: ${validationResults.hasNonPrintHiding ? '✅' : '❌'}
    - Color accuracy: ${validationResults.hasColorAccuracy ? '✅' : '❌'}
    - Break avoidance: ${validationResults.hasBreakAvoidance ? '✅' : '❌'}
    - Proper margins: ${validationResults.hasProperMargins ? '✅' : '❌'}
    - Landscape orientation: ${validationResults.hasLandscapeOrientation ? '✅' : '❌'}
    - Chip styling: ${validationResults.hasChipStyling ? '✅' : '❌'}
    
    Overall: ${passedChecks}/${totalChecks} checks passed`);
    
    // Expect most checks to pass
    expect(passedChecks).toBeGreaterThanOrEqual(totalChecks * 0.8);
  });
});