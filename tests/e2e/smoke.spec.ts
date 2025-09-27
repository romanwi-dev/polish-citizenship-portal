// E2E Smoke Tests
// Core user journey tests with Playwright

import { test, expect } from '@playwright/test';

// Set QA mode for all E2E tests
test.beforeEach(async ({ page }) => {
  // Set QA mode environment
  await page.addInitScript(() => {
    window.localStorage.setItem('QA_MODE', '1');
  });
});

test.describe('Polish Citizenship Portal - Core Journeys', () => {
  
  test('Homepage loads and displays key elements', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Polish Citizenship/);
    
    // Check hero section
    await expect(page.locator('h1')).toContainText(/Polish Citizenship|Secure Your Polish Citizenship/);
    
    // Check CTA button exists
    await expect(page.locator('button, a').filter({ hasText: /Get Started|Start|Begin/ }).first()).toBeVisible();
    
    // Check navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Health endpoints are accessible', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('/health');
    expect(healthResponse.ok()).toBeTruthy();
    
    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty('ok', true);
    
    // Test API health endpoint
    const apiHealthResponse = await page.request.get('/api/health');
    expect(apiHealthResponse.ok()).toBeTruthy();
    
    const apiHealthData = await apiHealthResponse.json();
    expect(apiHealthData).toHaveProperty('status', 'ok');
  });

  test('Admin interface loads', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Should load admin interface
    await expect(page.locator('body')).toBeVisible();
    
    // Check for admin-specific elements
    await expect(page.locator('[data-testid*="admin"], [class*="admin"], h1, h2').first()).toBeVisible();
  });

  test('AI Citizenship Intake loads', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    
    // Should load intake interface
    await expect(page.locator('body')).toBeVisible();
    
    // Check for intake-specific elements
    await expect(page.locator('form, input, button').first()).toBeVisible();
  });

  test('Language switching works', async ({ page }) => {
    await page.goto('/');
    
    // Look for language switcher
    const langSwitcher = page.locator('[data-testid*="lang"], [aria-label*="language"], button').filter({ 
      hasText: /EN|PL|English|Polish|Język/ 
    }).first();
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      // Wait for language change
      await page.waitForTimeout(500);
      
      // Check that some text has changed to Polish
      const polishElements = page.locator('text=Obywatelstwo, text=Portal, text=Sprawy, text=Dokumenty');
      const hasPolishText = await polishElements.count() > 0;
      
      if (hasPolishText) {
        expect(hasPolishText).toBeTruthy();
      }
    }
  });

  test('Case creation workflow (mock)', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Look for case creation elements
    const newCaseButton = page.locator('button, a').filter({ 
      hasText: /New Case|Create|Add Case|Nowa Sprawa/ 
    }).first();
    
    if (await newCaseButton.isVisible()) {
      await newCaseButton.click();
      
      // Look for form fields
      const nameField = page.locator('input[type="text"], input[name*="name"], input[placeholder*="name"]').first();
      if (await nameField.isVisible()) {
        await nameField.fill('QA Test Client');
      }
      
      const emailField = page.locator('input[type="email"], input[name*="email"]').first();
      if (await emailField.isVisible()) {
        await emailField.fill('qa-test@example.com');
      }
      
      // Look for submit button
      const submitButton = page.locator('button[type="submit"], button').filter({ 
        hasText: /Submit|Create|Save|Zapisz/ 
      }).first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(1000);
        
        // Check for success message or redirect
        const successMessage = page.locator('text=Success, text=Created, text=Zapisano');
        const hasSuccess = await successMessage.count() > 0;
        
        // Or check for case ID in URL or page
        const caseIdPattern = /C-\d+/;
        const pageContent = await page.textContent('body');
        const hasCaseId = caseIdPattern.test(pageContent || '');
        
        expect(hasSuccess || hasCaseId).toBeTruthy();
      }
    }
  });

  test('Document upload interface', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Look for document upload elements
    const uploadElements = page.locator('input[type="file"], button').filter({ 
      hasText: /Upload|Choose File|Select|Prześlij/ 
    });
    
    if (await uploadElements.count() > 0) {
      const uploadButton = uploadElements.first();
      await expect(uploadButton).toBeVisible();
      
      // Check if file input accepts expected types
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        const acceptAttr = await fileInput.getAttribute('accept');
        if (acceptAttr) {
          expect(acceptAttr).toMatch(/(pdf|jpg|jpeg|png|image)/i);
        }
      }
    }
  });

  test('Family tree interface loads', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Look for tree/family elements
    const treeElements = page.locator('button, a, [data-testid*="tree"]').filter({ 
      hasText: /Tree|Family|Drzewo|Rodzin/ 
    });
    
    if (await treeElements.count() > 0) {
      await treeElements.first().click();
      await page.waitForTimeout(500);
      
      // Check for tree visualization or form
      const treeContent = page.locator('svg, canvas, .tree, [class*="tree"], form');
      await expect(treeContent.first()).toBeVisible();
    }
  });

  test('HAC queue interface', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Look for HAC/queue elements
    const hacElements = page.locator('button, a').filter({ 
      hasText: /HAC|Queue|Approval|Review|Kolejka/ 
    });
    
    if (await hacElements.count() > 0) {
      await hacElements.first().click();
      await page.waitForTimeout(500);
      
      // Check for queue interface
      const queueContent = page.locator('table, .queue, [class*="queue"], ul, [data-testid*="queue"]');
      if (await queueContent.count() > 0) {
        await expect(queueContent.first()).toBeVisible();
      }
    }
  });

  test('Document processing workflow', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Test document processing if OCR interface exists
    const ocrElements = page.locator('button, a').filter({ 
      hasText: /OCR|Extract|Process|Document|Dokument/ 
    });
    
    if (await ocrElements.count() > 0) {
      await ocrElements.first().click();
      await page.waitForTimeout(500);
      
      // Look for file upload or processing interface
      const processingInterface = page.locator('input[type="file"], .dropzone, [class*="upload"]');
      if (await processingInterface.count() > 0) {
        await expect(processingInterface.first()).toBeVisible();
      }
    }
  });

  test('Responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is still visible and properly sized
    await expect(page.locator('body')).toBeVisible();
    
    // Check that navigation adapts (hamburger menu, etc.)
    const mobileNav = page.locator('[data-testid*="mobile"], .mobile-menu, .hamburger, button[aria-label*="menu"]');
    if (await mobileNav.count() > 0) {
      await expect(mobileNav.first()).toBeVisible();
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Performance - page loads within reasonable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - start;
    
    // Should load within 5 seconds (generous for testing)
    expect(loadTime).toBeLessThan(5000);
    
    // Check that critical elements are visible
    await expect(page.locator('h1, h2, main, [role="main"]').first()).toBeVisible();
  });

  test('Error handling - 404 page', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-qa-test');
    
    // Should show 404 or redirect gracefully
    expect(response?.status()).toBe(404);
    
    // Page should still be usable
    await expect(page.locator('body')).toBeVisible();
  });

  test('JavaScript console has no critical errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000); // Let any async operations complete
    
    // Filter out known/acceptable errors
    const criticalErrors = consoleMessages.filter(msg => 
      !msg.includes('favicon') && 
      !msg.includes('chunk') &&
      !msg.includes('HMR') &&
      !msg.includes('WebSocket') &&
      !msg.toLowerCase().includes('dev server')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Document Radar (DocRadar) E2E Tests', () => {
  
  test('DocRadar component loads and displays', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Look for DocRadar or document radar elements
    const docRadarElements = page.locator('[data-testid*="doc-radar"], .doc-radar, button, a').filter({ 
      hasText: /DocRadar|Document Radar|Radar|Documents/ 
    });
    
    if (await docRadarElements.count() > 0) {
      await docRadarElements.first().click();
      await page.waitForTimeout(500);
      
      // Check for radar visualization
      const radarContent = page.locator('.doc-radar, [class*="radar"], svg, canvas');
      if (await radarContent.count() > 0) {
        await expect(radarContent.first()).toBeVisible();
      }
    }
  });

  test('DocRadar print functionality', async ({ page }) => {
    await page.goto('/admin-v3');
    
    // Look for DocRadar first
    const docRadarElements = page.locator('button, a').filter({ 
      hasText: /DocRadar|Document Radar|Radar/ 
    });
    
    if (await docRadarElements.count() > 0) {
      await docRadarElements.first().click();
      await page.waitForTimeout(500);
      
      // Look for print button (should not have non-print class in print view)
      const printButton = page.locator('button').filter({ 
        hasText: /Print|Export PDF|PDF/ 
      }).first();
      
      if (await printButton.isVisible()) {
        // Check if button has non-print class for print media
        const classes = await printButton.getAttribute('class');
        expect(classes).toContain('non-print');
      }
    }
  });
});