// Accessibility Tests for DocRadar
// Uses axe-core to validate WCAG compliance

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from '@axe-core/playwright';

// Set QA mode for all accessibility tests
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('QA_MODE', '1');
  });
});

test.describe('DocRadar Accessibility Tests', () => {
  
  test('DocRadar main interface meets WCAG AA standards', async ({ page }) => {
    // Navigate to admin interface where DocRadar should be accessible
    await page.goto('/admin-v3');
    
    // Inject axe-core for accessibility testing
    await injectAxe(page);
    
    // Look for DocRadar component or navigate to it
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000); // Allow component to load
      
      // Run accessibility scan on DocRadar interface
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
    } else {
      // If DocRadar not found, test the admin page for accessibility
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
    }
  });

  test('DocRadar has proper heading structure', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar if available
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 0) {
        // Verify first heading is h1 or h2 (main page title might be h1)
        const firstHeading = headings[0];
        const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
        expect(['h1', 'h2']).toContain(tagName);
        
        // Check that headings don't skip levels
        for (let i = 1; i < headings.length; i++) {
          const currentLevel = parseInt((await headings[i].evaluate(el => el.tagName)).slice(1));
          const previousLevel = parseInt((await headings[i-1].evaluate(el => el.tagName)).slice(1));
          
          // Heading level should not increase by more than 1
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    }
    
    // Run specific heading structure check
    await checkA11y(page, null, {
      rules: {
        'heading-order': { enabled: true },
        'empty-heading': { enabled: true },
        'page-has-heading-one': { enabled: true }
      }
    });
  });

  test('DocRadar interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      // Test keyboard navigation to DocRadar
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Try to reach DocRadar button via keyboard
      let attempts = 0;
      while (attempts < 20) { // Limit attempts to prevent infinite loop
        const focused = await page.evaluate(() => document.activeElement?.textContent?.includes('DocRadar') || 
                                                  document.activeElement?.textContent?.includes('Radar'));
        
        if (focused) {
          await page.keyboard.press('Enter');
          break;
        }
        
        await page.keyboard.press('Tab');
        attempts++;
      }
      
      await page.waitForTimeout(1000);
      
      // Test keyboard navigation within DocRadar interface
      const interactiveElements = page.locator('button, a, input, select, [tabindex]:not([tabindex="-1"])');
      const count = await interactiveElements.count();
      
      if (count > 0) {
        // Test that all interactive elements are reachable via Tab
        for (let i = 0; i < Math.min(count, 10); i++) { // Test first 10 elements
          await page.keyboard.press('Tab');
          
          const focused = await page.evaluate(() => document.activeElement);
          expect(focused).toBeTruthy();
          
          // Check that focused element is visible
          const isVisible = await page.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }, focused);
          
          expect(isVisible).toBe(true);
        }
      }
    }
    
    // Run keyboard accessibility check
    await checkA11y(page, null, {
      rules: {
        'keyboard': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'tabindex': { enabled: true }
      }
    });
  });

  test('DocRadar has sufficient color contrast', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Check color contrast compliance
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true }
      }
    });
  });

  test('DocRadar form elements have proper labels', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check that all form elements have labels
      const formElements = page.locator('input, select, textarea');
      const count = await formElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = formElements.nth(i);
        const id = await element.getAttribute('id');
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        
        if (id) {
          // Check if there's a label with for attribute
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          // Element should have either a label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    }
    
    // Run label accessibility check
    await checkA11y(page, null, {
      rules: {
        'label': { enabled: true },
        'aria-input-field-name': { enabled: true },
        'button-name': { enabled: true }
      }
    });
  });

  test('DocRadar images have alt text', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check all images have alt text
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');
        
        // Decorative images should have empty alt or role="presentation"
        // Content images should have descriptive alt text
        if (role === 'presentation' || alt === '') {
          // Decorative image - this is acceptable
          continue;
        }
        
        // Content image should have alt text or aria-label
        expect(alt || ariaLabel).toBeTruthy();
        
        if (alt && alt.length > 0) {
          // Alt text should be descriptive (not just filename)
          expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|svg)$/i);
          expect(alt.length).toBeGreaterThan(2);
        }
      }
    }
    
    // Run image accessibility check
    await checkA11y(page, null, {
      rules: {
        'image-alt': { enabled: true },
        'image-redundant-alt': { enabled: true }
      }
    });
  });

  test('DocRadar print version is accessible', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      // Check that print styles don't break accessibility
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'heading-order': { enabled: true }
        }
      });
      
      // Verify that non-print elements are properly hidden
      const nonPrintElements = page.locator('.non-print');
      const count = await nonPrintElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = nonPrintElements.nth(i);
        const isVisible = await element.isVisible();
        
        // In print mode, non-print elements should be hidden
        expect(isVisible).toBe(false);
      }
      
      // Reset media emulation
      await page.emulateMedia({ media: 'screen' });
    }
  });

  test('DocRadar supports screen readers', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check for ARIA landmarks
      const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="complementary"], [role="contentinfo"], main, nav, header, aside, footer').count();
      
      // Should have at least one landmark
      expect(landmarks).toBeGreaterThan(0);
      
      // Check for skip links (good practice)
      const skipLinks = page.locator('a').filter({ hasText: /skip|jump/i });
      // Skip links are optional but good practice
      
      // Check for live regions if there's dynamic content
      const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
      // Live regions are context-dependent
    }
    
    // Run screen reader accessibility check
    await checkA11y(page, null, {
      rules: {
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'landmark-one-main': { enabled: true },
        'region': { enabled: true }
      }
    });
  });

  test('DocRadar handles focus management', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
      
      // Test that focus is managed properly after navigation
      const focusedElement = await page.evaluate(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
      
      // Look for modal dialogs or dynamic content
      const modals = page.locator('[role="dialog"], .modal, [aria-modal="true"]');
      const modalCount = await modals.count();
      
      if (modalCount > 0) {
        // If there are modals, test focus trapping
        const modal = modals.first();
        const focusableElements = modal.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const count = await focusableElements.count();
        
        if (count > 0) {
          // Focus should be trapped within modal
          await page.keyboard.press('Tab');
          const focused = await page.evaluate(() => document.activeElement);
          
          // Check that focused element is within the modal
          const isWithinModal = await modal.evaluate((modalEl, focusedEl) => {
            return modalEl.contains(focusedEl);
          }, focused);
          
          expect(isWithinModal).toBe(true);
        }
      }
    }
    
    // Run focus management check
    await checkA11y(page, null, {
      rules: {
        'focus-order-semantics': { enabled: true },
        'focusable-content': { enabled: true }
      }
    });
  });

  test('DocRadar accessibility summary report', async ({ page }) => {
    await page.goto('/admin-v3');
    await injectAxe(page);
    
    // Navigate to DocRadar if available
    const docRadarButton = page.locator('button, a').filter({ hasText: /DocRadar|Document Radar|Radar/ });
    
    if (await docRadarButton.count() > 0) {
      await docRadarButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Run comprehensive accessibility scan
    const violations = await getViolations(page, null, {
      rules: {
        // WCAG 2.1 AA compliance
        'wcag2a': { enabled: true },
        'wcag2aa': { enabled: true },
        'wcag21aa': { enabled: true }
      }
    });
    
    // Log violations for debugging
    if (violations.length > 0) {
      console.log('\n🔍 Accessibility Violations Found:');
      violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.helpUrl}`);
        
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   Node ${nodeIndex + 1}: ${node.target.join(', ')}`);
          if (node.failureSummary) {
            console.log(`   Issue: ${node.failureSummary}`);
          }
        });
      });
    }
    
    // Categorize violations by impact
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    const seriousViolations = violations.filter(v => v.impact === 'serious');
    const moderateViolations = violations.filter(v => v.impact === 'moderate');
    const minorViolations = violations.filter(v => v.impact === 'minor');
    
    // Assert that there are no critical or serious violations
    expect(criticalViolations).toHaveLength(0);
    expect(seriousViolations).toHaveLength(0);
    
    // Moderate violations should be minimized
    expect(moderateViolations.length).toBeLessThan(5);
    
    console.log(`\n✅ Accessibility Summary:
    - Critical violations: ${criticalViolations.length}
    - Serious violations: ${seriousViolations.length}
    - Moderate violations: ${moderateViolations.length}
    - Minor violations: ${minorViolations.length}
    - Total violations: ${violations.length}`);
  });
});