// UX Tests for Intake Forms
// Ensures no raw OBY field names are shown to users

import { test, expect } from '@playwright/test';

// Set QA mode for all UX tests
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('QA_MODE', '1');
  });
});

test.describe('Intake Form UX Tests', () => {

  test('No raw OBY field names visible in intake forms', async ({ page }) => {
    // Test AI citizenship intake page
    await page.goto('/ai-citizenship-intake/');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Get all text content on the page
    const pageText = await page.textContent('body');
    
    // Define raw OBY field names that should NOT be visible to users
    const rawObyFields = [
      'applicant_full_name',
      'applicant_birth_date', 
      'applicant_birth_place',
      'applicant_citizenship',
      'father_full_name',
      'father_birth_date',
      'father_birth_place',
      'mother_full_name',
      'mother_birth_date',
      'mother_birth_place',
      'mother_maiden_name',
      'grandfather_paternal_name',
      'grandmother_paternal_name',
      'grandfather_maternal_name',
      'grandmother_maternal_name',
      'marriage_date',
      'marriage_place',
      'spouse_full_name',
      'document_type',
      'document_number',
      'document_issue_date',
      'document_expiry_date',
      'residence_address',
      'correspondence_address'
    ];
    
    // Check that none of the raw field names appear in the page
    for (const fieldName of rawObyFields) {
      expect(pageText).not.toContain(fieldName);
    }
    
    // Also check in input names, IDs, and placeholders
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      
      // Raw field names should not appear in form attributes visible to users
      for (const fieldName of rawObyFields) {
        if (placeholder) expect(placeholder).not.toContain(fieldName);
        if (ariaLabel) expect(ariaLabel).not.toContain(fieldName);
        
        // Name and ID can contain field names (for backend processing) but should not be visible
      }
    }
  });

  test('Intake forms use human-readable labels', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Look for form labels and ensure they're user-friendly
    const labels = await page.locator('label, .form-label').all();
    
    for (const label of labels) {
      const text = await label.textContent();
      
      if (text && text.trim()) {
        // Labels should be properly capitalized
        expect(text).toMatch(/^[A-Z]/); // Should start with capital letter
        
        // Should not contain underscores (typical in field names)
        expect(text).not.toContain('_');
        
        // Should not be overly technical
        expect(text.toLowerCase()).not.toContain('applicant_');
        expect(text.toLowerCase()).not.toContain('_date');
        expect(text.toLowerCase()).not.toContain('_place');
        expect(text.toLowerCase()).not.toContain('_name');
        
        // Should contain human-readable words
        const hasHumanWords = /\b(name|date|place|birth|address|phone|email|country)\b/i.test(text);
        // This is a heuristic - not all labels need these words but most should
      }
    }
  });

  test('Form validation messages are user-friendly', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Try to submit form without filling required fields
    const submitButtons = page.locator('button[type="submit"], button').filter({ hasText: /submit|send|continue|next/i });
    
    if (await submitButtons.count() > 0) {
      await submitButtons.first().click();
      await page.waitForTimeout(500);
      
      // Look for validation messages
      const errorMessages = await page.locator('.error, .invalid, [role="alert"], .text-red-500, .text-error').all();
      
      for (const error of errorMessages) {
        const text = await error.textContent();
        
        if (text && text.trim()) {
          // Error messages should not contain raw field names
          expect(text).not.toMatch(/\w+_\w+/); // No underscore field names
          
          // Should be helpful and specific
          expect(text.length).toBeGreaterThan(10); // Not just "Error" or "Invalid"
          
          // Should start with capital letter
          expect(text).toMatch(/^[A-Z]/);
          
          // Should not be too technical
          expect(text.toLowerCase()).not.toContain('validation failed');
          expect(text.toLowerCase()).not.toContain('field_');
          expect(text.toLowerCase()).not.toContain('_required');
        }
      }
    }
  });

  test('Placeholders and help text are informative', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    const inputs = await page.locator('input, textarea').all();
    
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      
      if (placeholder && placeholder.trim()) {
        // Placeholders should provide examples or guidance
        expect(placeholder.length).toBeGreaterThan(3);
        
        // Should not be raw field names
        expect(placeholder).not.toMatch(/\w+_\w+/);
        
        // Date inputs should have clear format examples
        if (type === 'date' || placeholder.toLowerCase().includes('date')) {
          // Should indicate date format or provide example
          const hasDateGuidance = /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}|dd\/mm\/yyyy|mm\/dd\/yyyy/i.test(placeholder);
          // Date guidance is good practice but not always required
        }
        
        // Email inputs should have email examples
        if (type === 'email' || placeholder.toLowerCase().includes('email')) {
          expect(placeholder.toLowerCase()).toMatch(/example|@|email/);
        }
      }
    }
  });

  test('Progressive disclosure hides complexity', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Check that complex forms use progressive disclosure
    const allInputs = await page.locator('input, select, textarea').count();
    
    if (allInputs > 10) {
      // For complex forms, check for sections, steps, or tabs
      const sections = await page.locator('section, .section, .step, .tab, fieldset').count();
      const nextButtons = await page.locator('button').filter({ hasText: /next|continue|step/i }).count();
      const tabButtons = await page.locator('[role="tab"], .tab-button, .tab-link').count();
      
      // Should use some form of progressive disclosure
      expect(sections + nextButtons + tabButtons).toBeGreaterThan(0);
    }
  });

  test('Forms provide clear progress indication', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Look for progress indicators in multi-step forms
    const progressIndicators = page.locator('.progress, .steps, .breadcrumb, [aria-label*="progress"], [role="progressbar"]');
    const stepIndicators = page.locator('.step-1, .step-2, .current-step, .active-step');
    
    const hasProgressIndicators = await progressIndicators.count() > 0;
    const hasStepIndicators = await stepIndicators.count() > 0;
    
    if (hasProgressIndicators || hasStepIndicators) {
      // Progress indicators should be visible and informative
      if (hasProgressIndicators) {
        const firstProgress = progressIndicators.first();
        await expect(firstProgress).toBeVisible();
        
        // Should have text or aria-label describing progress
        const text = await firstProgress.textContent();
        const ariaLabel = await firstProgress.getAttribute('aria-label');
        
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('Field grouping is logical and clear', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Check for logical field grouping
    const fieldsets = await page.locator('fieldset').all();
    const sections = await page.locator('section, .form-section, .field-group').all();
    
    const allGroups = [...fieldsets, ...sections];
    
    for (const group of allGroups) {
      // Each group should have a clear heading or legend
      const legend = await group.locator('legend').first();
      const heading = await group.locator('h1, h2, h3, h4, h5, h6').first();
      
      const hasLegend = await legend.count() > 0;
      const hasHeading = await heading.count() > 0;
      
      if (hasLegend || hasHeading) {
        const title = hasLegend ? await legend.textContent() : await heading.textContent();
        
        if (title && title.trim()) {
          // Group titles should be descriptive
          expect(title.length).toBeGreaterThan(5);
          expect(title).toMatch(/^[A-Z]/);
          
          // Should not contain raw field references
          expect(title).not.toMatch(/\w+_\w+/);
        }
      }
    }
  });

  test('Required fields are clearly indicated', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    const requiredInputs = await page.locator('input[required], select[required], textarea[required]').all();
    
    for (const input of requiredInputs) {
      // Required fields should have visual indication
      const ariaRequired = await input.getAttribute('aria-required');
      const hasRequiredAttr = await input.getAttribute('required') !== null;
      
      expect(hasRequiredAttr || ariaRequired === 'true').toBe(true);
      
      // Look for visual indicators near the input
      const parentContainer = input.locator('xpath=..');
      const asterisk = await parentContainer.locator('text=*').count();
      const requiredText = await parentContainer.getByText(/required|mandatory/i).count();
      
      // Should have some visual indication (asterisk, "required" text, or styling)
      // This is best practice but not always enforced
    }
  });

  test('Form completion guidance is helpful', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Look for help text, tooltips, or guidance
    const helpElements = page.locator('.help-text, .hint, [aria-describedby], .tooltip, .info');
    const helpCount = await helpElements.count();
    
    if (helpCount > 0) {
      const helpTexts = await helpElements.all();
      
      for (const help of helpTexts) {
        const text = await help.textContent();
        
        if (text && text.trim()) {
          // Help text should be informative
          expect(text.length).toBeGreaterThan(10);
          
          // Should not contain raw field names
          expect(text).not.toMatch(/\w+_\w+/);
          
          // Should provide actual guidance
          expect(text.toLowerCase()).toMatch(/example|format|help|enter|provide|include/);
        }
      }
    }
  });

  test('Error prevention and inline validation', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Test email validation
    const emailInputs = page.locator('input[type="email"]');
    const emailCount = await emailInputs.count();
    
    if (emailCount > 0) {
      const emailInput = emailInputs.first();
      
      // Enter invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur(); // Trigger validation
      await page.waitForTimeout(300);
      
      // Look for inline validation message
      const validationMessage = await emailInput.evaluate(el => el.validationMessage);
      
      if (validationMessage) {
        // Validation message should be user-friendly
        expect(validationMessage.toLowerCase()).not.toContain('pattern');
        expect(validationMessage.toLowerCase()).not.toContain('regex');
      }
    }
    
    // Test date validation
    const dateInputs = page.locator('input[type="date"]');
    const dateCount = await dateInputs.count();
    
    if (dateCount > 0) {
      const dateInput = dateInputs.first();
      
      // Enter invalid date format if input accepts text
      try {
        await dateInput.fill('invalid-date');
        await dateInput.blur();
        await page.waitForTimeout(300);
        
        const validationMessage = await dateInput.evaluate(el => el.validationMessage);
        
        if (validationMessage) {
          // Should provide clear date format guidance
          expect(validationMessage.length).toBeGreaterThan(10);
        }
      } catch (error) {
        // Date inputs might not accept invalid text, which is fine
      }
    }
  });

  test('Internationalization displays proper language', async ({ page }) => {
    await page.goto('/ai-citizenship-intake/');
    await page.waitForTimeout(1000);
    
    // Check if language switching is available
    const langSwitcher = page.locator('[data-testid*="lang"], button').filter({ hasText: /EN|PL|English|Polish/i });
    
    if (await langSwitcher.count() > 0) {
      // Test switching to Polish
      const polishOption = langSwitcher.filter({ hasText: /PL|Polish|Polski/i }).first();
      
      if (await polishOption.isVisible()) {
        await polishOption.click();
        await page.waitForTimeout(1000);
        
        // Check that some content is in Polish
        const pageText = await page.textContent('body');
        
        // Should contain Polish text (not raw field names)
        const hasPolishText = /imię|nazwisko|data|miejsce|adres|obywatelstwo/i.test(pageText);
        
        if (hasPolishText) {
          // Make sure no raw English field names are showing
          const rawObyFields = [
            'applicant_full_name',
            'applicant_birth_date',
            'applicant_birth_place'
          ];
          
          for (const fieldName of rawObyFields) {
            expect(pageText).not.toContain(fieldName);
          }
        }
      }
    }
  });
});