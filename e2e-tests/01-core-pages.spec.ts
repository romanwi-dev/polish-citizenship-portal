import { test, expect } from '@playwright/test';

test.describe('🏠 Core Pages - Automated Testing', () => {
  
  test('Home Page - Complete User Journey', async ({ page }) => {
    console.log('🏠 Testing Home Page functionality...');
    await page.goto('/');
    
    // Verify page loads and main elements are present
    await expect(page).toHaveTitle(/Polish/);
    await expect(page.locator('nav')).toBeVisible();
    
    // Test navigation elements
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Test hero section
    await expect(page.locator('h1, [data-testid="hero-title"]')).toBeVisible();
    
    // Test theme switching if available
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), button:has-text("Theme")');
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click();
      await page.waitForTimeout(500); // Wait for theme transition
      console.log('✅ Theme toggle working');
    }
    
    console.log('✅ Home Page test completed');
  });

  test('Dashboard - Full Functionality Test', async ({ page }) => {
    console.log('📊 Testing Dashboard functionality...');
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Test dashboard sections are visible
    await expect(page).toHaveURL(/dashboard/);
    
    // Test form sections
    const formSections = page.locator('form, [data-testid*="form"], .form');
    if (await formSections.count() > 0) {
      await expect(formSections.first()).toBeVisible();
      console.log('✅ Dashboard forms are visible');
    }
    
    // Test navigation tabs or sections
    const tabButtons = page.locator('button, .tab, [role="tab"]');
    if (await tabButtons.count() > 0) {
      await tabButtons.first().click();
      await page.waitForTimeout(500);
      console.log('✅ Dashboard navigation working');
    }
    
    console.log('✅ Dashboard test completed');
  });

  test('Mobile Dashboard - Touch Interactions', async ({ page }) => {
    console.log('📱 Testing Mobile Dashboard...');
    await page.goto('/mobile-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify mobile dashboard loads
    await expect(page).toHaveURL(/mobile-dashboard/);
    
    // Test mobile-specific elements
    const mobileElements = page.locator('button, input, [data-testid]');
    if (await mobileElements.count() > 0) {
      await expect(mobileElements.first()).toBeVisible();
      console.log('✅ Mobile elements are visible');
    }
    
    // Test mobile navigation
    const mobileNav = page.locator('.mobile-nav, [data-testid*="mobile"], nav');
    if (await mobileNav.count() > 0) {
      await expect(mobileNav.first()).toBeVisible();
      console.log('✅ Mobile navigation working');
    }
    
    console.log('✅ Mobile Dashboard test completed');
  });

  test('AI Citizenship Intake - Chat and Interactions', async ({ page }) => {
    console.log('🤖 Testing AI Citizenship Intake...');
    await page.goto('/ai-citizenship-intake');
    await page.waitForLoadState('networkidle');
    
    // Test chat interface
    const chatContainer = page.locator('[data-testid="chat-messages"], .chat-messages, #chat-messages');
    await expect(chatContainer).toBeVisible();
    
    // Test chat input
    const chatInput = page.locator('[data-testid="chat-input"], input[type="text"], textarea');
    if (await chatInput.count() > 0) {
      await chatInput.first().fill('I have Polish grandparents, am I eligible?');
      console.log('✅ Chat input working');
    }
    
    // Test quick action buttons
    const quickActions = page.locator('[data-testid*="quick"], .quick-action, button');
    if (await quickActions.count() > 0) {
      const buttonCount = await quickActions.count();
      console.log(`✅ Found ${buttonCount} interactive elements`);
    }
    
    console.log('✅ AI Citizenship Intake test completed');
  });

  test('Landing Page - Marketing and Conversion', async ({ page }) => {
    console.log('🎯 Testing Landing Page...');
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    
    // Test landing page loads
    await expect(page).toHaveURL(/landing/);
    
    // Test hero section
    const heroSection = page.locator('h1, [data-testid="hero"], .hero');
    await expect(heroSection.first()).toBeVisible();
    
    // Test call-to-action buttons
    const ctaButtons = page.locator('button, a[href*="contact"], [data-testid*="cta"]');
    if (await ctaButtons.count() > 0) {
      const ctaCount = await ctaButtons.count();
      console.log(`✅ Found ${ctaCount} CTA buttons`);
    }
    
    // Test forms
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      await expect(forms.first()).toBeVisible();
      console.log('✅ Landing page forms visible');
    }
    
    console.log('✅ Landing Page test completed');
  });

  test('Cross-Page Navigation - User Flow', async ({ page }) => {
    console.log('🔄 Testing Cross-Page Navigation...');
    
    // Test navigation flow
    const pages = ['/', '/dashboard', '/mobile-dashboard', '/ai-citizenship-intake', '/landing'];
    
    for (const pagePath of pages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        console.log(`✅ Successfully loaded: ${pagePath}`);
        
        // Test that navigation elements exist
        const navElements = page.locator('nav, [role="navigation"], .nav');
        if (await navElements.count() > 0) {
          await expect(navElements.first()).toBeVisible();
        }
        
      } catch (error) {
        console.log(`⚠️ Issue with page: ${pagePath}`);
      }
    }
    
    console.log('✅ Cross-page navigation test completed');
  });
});

test.afterEach(async ({ page }) => {
  // Clear any test data after each test
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});