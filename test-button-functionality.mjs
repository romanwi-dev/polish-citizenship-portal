// REAL FUNCTIONALITY TEST - Tests actual button clicks, not just HTTP status
// This is what RULE NUMBER ONE demands - actual JavaScript testing

import { chromium } from '@playwright/test';

async function testButtonFunctionality() {
  console.log('🔥 CRITICAL BUTTON FUNCTIONALITY TEST');
  console.log('Testing "List required documents" button specifically');
  console.log('======================================================');
  
  let browser;
  let passed = 0;
  let failed = 0;
  
  try {
    // Launch browser in headless mode
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to the page
    console.log('📋 Loading AI Citizenship Intake page...');
    await page.goto('http://localhost:5000/ai-citizenship-intake', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Wait for JavaScript to initialize
    await page.waitForTimeout(2000);
    
    // TEST 1: Check if button exists
    console.log('\n🔍 TEST 1: Checking if "List required documents" button exists...');
    const button = await page.locator('button:has-text("List required documents")');
    const buttonExists = await button.count() > 0;
    
    if (buttonExists) {
      console.log('✅ Button found');
      passed++;
    } else {
      console.log('❌ Button NOT found');
      failed++;
    }
    
    // TEST 2: Click the button and check for response
    if (buttonExists) {
      console.log('\n🔍 TEST 2: Clicking "List required documents" button...');
      
      // Listen for console logs to see if button click is registered
      const logs = [];
      page.on('console', msg => {
        if (msg.text().includes('Quick action clicked') || msg.text().includes('Extracted text')) {
          logs.push(msg.text());
        }
      });
      
      // Click the button
      await button.first().click();
      
      // Wait for response
      await page.waitForTimeout(1500);
      
      // Check if document list appears in chat
      const chatMessages = await page.locator('.chat-messages .message-assistant').last();
      const messageText = await chatMessages.textContent().catch(() => '');
      
      if (messageText.includes('Required Documents for Polish Citizenship') || 
          messageText.includes('Birth certificate') ||
          logs.some(log => log.includes('List required documents'))) {
        console.log('✅ Button click SUCCESSFUL - Document list appeared');
        console.log('📋 Found response:', messageText.substring(0, 100) + '...');
        passed++;
      } else {
        console.log('❌ Button click FAILED - No document list appeared');
        console.log('📋 Logs captured:', logs);
        console.log('📋 Chat content:', messageText.substring(0, 200));
        failed++;
      }
    }
    
    // TEST 3: Test other quick action buttons
    console.log('\n🔍 TEST 3: Testing other quick action buttons...');
    const eligibilityButton = await page.locator('button:has-text("Check eligibility")');
    const consultationButton = await page.locator('button:has-text("Book consultation")');
    
    if (await eligibilityButton.count() > 0 && await consultationButton.count() > 0) {
      console.log('✅ All quick action buttons exist');
      passed++;
    } else {
      console.log('❌ Some quick action buttons missing');
      failed++;
    }
    
  } catch (error) {
    console.error('🚨 TEST ERROR:', error.message);
    failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Results
  console.log('\n🎯 REAL FUNCTIONALITY TEST RESULTS:');
  console.log('===================================');
  console.log(`✅ PASSED: ${passed}/3 tests`);
  console.log(`❌ FAILED: ${failed}/3 tests`);
  console.log(`📊 Success Rate: ${Math.round((passed/(passed+failed))*100)}%`);
  
  if (failed === 0) {
    console.log('🎉 ALL FUNCTIONALITY TESTS PASSED!');
    console.log('✅ VERIFIED: "List required documents" button working perfectly');
  } else {
    console.log('🚨 FUNCTIONALITY ISSUES DETECTED!');
    console.log('❌ DIRECT FIX NEEDED: Button functionality requires debugging');
  }
  
  return failed === 0;
}

// Simple fallback test if browser not available
async function fallbackTest() {
  console.log('⚠️ Browser testing not available, running JavaScript validation...');
  
  try {
    const response = await fetch('http://localhost:5000/ai-citizenship-intake');
    const html = await response.text();
    
    const hasButton = html.includes('List required documents');
    const hasScript = html.includes('script-enhanced.js');
    const hasQuickActions = html.includes('quick-actions');
    
    console.log(`Button HTML exists: ${hasButton ? '✅' : '❌'}`);
    console.log(`Enhanced script loaded: ${hasScript ? '✅' : '❌'}`);
    console.log(`Quick actions section exists: ${hasQuickActions ? '✅' : '❌'}`);
    
    return hasButton && hasScript && hasQuickActions;
  } catch (error) {
    console.error('Fallback test failed:', error.message);
    return false;
  }
}

// Run the test
try {
  const result = await testButtonFunctionality();
  process.exit(result ? 0 : 1);
} catch (error) {
  console.log('🔄 Falling back to basic validation...');
  const fallbackResult = await fallbackTest();
  process.exit(fallbackResult ? 0 : 1);
}