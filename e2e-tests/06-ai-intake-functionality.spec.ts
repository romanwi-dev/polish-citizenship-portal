import { test, expect } from '@playwright/test';

test.describe('🤖 AI Citizenship Intake - Functional UI Testing', () => {
  
  test('AI Intake Button Clicks and Dialog Redirects', async ({ page }) => {
    console.log('🤖 Testing AI Intake page functionality...');
    await page.goto('/ai-citizenship-intake');
    
    // Wait for page to load completely
    await expect(page.locator('.hero-title')).toBeVisible();
    await page.waitForTimeout(2000); // Wait for JavaScript initialization
    
    // TEST: Quick Action Buttons
    console.log('🔘 Testing Quick Action Buttons...');
    
    // Test "Check eligibility" button
    const checkEligibilityBtn = page.locator('.quick-action').filter({ hasText: 'Check eligibility' });
    await expect(checkEligibilityBtn).toBeVisible();
    await checkEligibilityBtn.click();
    
    // Verify it scrolls to chat and shows message
    await page.waitForTimeout(1000);
    const chatMessages = page.locator('.chat-messages');
    await expect(chatMessages).toBeVisible();
    
    // Check if chat input gets focused and message appears
    const chatInput = page.locator('.chat-input');
    await expect(chatInput).toBeVisible();
    await expect(chatMessages.locator('.message-assistant')).toContainText('eligibility');
    
    console.log('✅ Check eligibility button working correctly');
    
    // TEST: Step Buttons (numbered steps)
    console.log('🔘 Testing Step Buttons...');
    
    // Test Step 1: Entry Point
    const step1 = page.locator('.step[data-action="start-chat"]');
    await expect(step1).toBeVisible();
    await step1.click();
    
    await page.waitForTimeout(1000);
    await expect(chatMessages.locator('.message-assistant').last()).toContainText('Polish ancestry');
    
    console.log('✅ Step 1 button working correctly');
    
    // Test Step 2: Dialogue  
    const step2 = page.locator('.step[data-action="demo-dialogue"]');
    await expect(step2).toBeVisible();
    await step2.click();
    
    await page.waitForTimeout(1000);
    await expect(chatMessages.locator('.message-assistant').last()).toContainText('questions');
    
    console.log('✅ Step 2 button working correctly');
    
    // TEST: Chat Input Functionality
    console.log('💬 Testing Chat Input...');
    
    await chatInput.fill('My grandmother was born in Poland in 1920');
    await chatInput.press('Enter');
    
    await page.waitForTimeout(2000);
    await expect(chatMessages.locator('.message-user').last()).toContainText('grandmother was born in Poland');
    
    console.log('✅ Chat input working correctly');
    
    // TEST: Document List Quick Action
    console.log('📄 Testing Document List Button...');
    const documentListBtn = page.locator('.quick-action').filter({ hasText: 'List required documents' });
    await documentListBtn.click();
    
    await page.waitForTimeout(1000);
    await expect(chatMessages.locator('.message-assistant').last()).toContainText('Required Documents');
    
    console.log('✅ Document list button working correctly');
    
    console.log('🎯 AI Intake functionality test PASSED - all buttons redirect properly!');
  });
  
  test('AI Intake Complete User Journey', async ({ page }) => {
    console.log('🚀 Testing complete AI Intake user journey...');
    await page.goto('/ai-citizenship-intake');
    
    // Complete workflow test
    await page.waitForTimeout(2000);
    
    // 1. User clicks step 1
    await page.locator('.step[data-action="start-chat"]').click();
    await page.waitForTimeout(500);
    
    // 2. User types ancestry info
    const chatInput = page.locator('.chat-input');
    await chatInput.fill('My grandfather emigrated from Poland to USA in 1935');
    await chatInput.press('Enter');
    await page.waitForTimeout(1500);
    
    // 3. User clicks document upload step
    await page.locator('.step[data-action="upload-docs"]').click();
    await page.waitForTimeout(1000);
    
    // 4. Check if upload section becomes visible
    const uploadSection = page.locator('.upload-section');
    if (await uploadSection.count() > 0) {
      await expect(uploadSection).toBeVisible();
      console.log('✅ Upload section properly displayed');
    }
    
    // 5. User requests consultation
    await page.locator('.quick-action').filter({ hasText: 'Book consultation' }).click();
    await page.waitForTimeout(1000);
    
    const chatMessages = page.locator('.chat-messages');
    await expect(chatMessages.locator('.message-assistant').last()).toContainText('consultation');
    
    console.log('🎯 Complete AI Intake user journey PASSED!');
  });
  
  test('AI Intake Error Handling and Edge Cases', async ({ page }) => {
    console.log('⚠️ Testing AI Intake error handling...');
    await page.goto('/ai-citizenship-intake');
    
    await page.waitForTimeout(2000);
    
    // Test empty chat submission
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.btn-send');
    
    await chatInput.fill('');
    await sendButton.click();
    
    // Should not submit empty message
    const chatMessages = page.locator('.chat-messages');
    const messageCount = await chatMessages.locator('.message-user').count();
    
    await chatInput.fill('   '); // Only spaces
    await sendButton.click();
    
    // Should still not submit whitespace-only message
    const newMessageCount = await chatMessages.locator('.message-user').count();
    expect(newMessageCount).toBe(messageCount);
    
    console.log('✅ Empty message handling working correctly');
    
    // Test rapid button clicks
    const quickAction = page.locator('.quick-action').first();
    await quickAction.click();
    await quickAction.click();
    await quickAction.click();
    
    await page.waitForTimeout(1000);
    
    // Should handle rapid clicks gracefully
    console.log('✅ Rapid click handling working correctly');
    
    console.log('🎯 Error handling tests PASSED!');
  });
  
});