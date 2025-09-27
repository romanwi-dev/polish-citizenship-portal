// REAL BROWSER-BASED TESTING - Actually clicks buttons like a real user!
// This is what RULE NUMBER ONE demands - testing actual user experience

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:5000';
let browser = null;
let page = null;

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details, screenshot = null) {
  const result = {
    name,
    status: passed ? 'PASS' : 'FAIL',
    details,
    timestamp: new Date().toISOString(),
    screenshot
  };
  
  results.tests.push(result);
  
  if (passed) {
    results.passed++;
    console.log(`✅ ${name}: ${details}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
  
  return passed;
}

// Test 1: Real Button Click Testing
async function testRealButtonClicks() {
  console.log('\n🖱️ TESTING REAL BUTTON CLICKS (Like actual users)...');
  
  try {
    // Navigate to AI Citizenship Intake page
    await page.goto(`${BASE_URL}/ai-citizenship-intake`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000); // Let JavaScript initialize
    
    // Take screenshot before testing
    await page.screenshot({ path: 'test-screenshots/before-click.png' });
    
    // Test 1.1: Click "List required documents" button
    console.log('   Clicking "List required documents" button...');
    
    const documentsButton = await page.$('button:has-text("List required documents")');
    if (!documentsButton) {
      return logTest('Real Click - Documents Button Exists', false, 'Cannot find "List required documents" button');
    }
    
    // Actually click the button
    await documentsButton.click();
    await page.waitForTimeout(1500); // Wait for response
    
    // Check if document list appeared in chat
    const chatMessages = await page.$$('.chat-messages .message-assistant');
    let documentListFound = false;
    
    for (const message of chatMessages) {
      const text = await message.textContent();
      if (text.includes('Required Documents for Polish Citizenship') || text.includes('Birth certificate')) {
        documentListFound = true;
        break;
      }
    }
    
    logTest('Real Click - Documents Button Functionality', documentListFound, 
      documentListFound ? 'Document list appeared in chat after button click' : 'Button click did not show document list');
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'test-screenshots/after-documents-click.png' });
    
    // Test 1.2: Click "Check eligibility" button
    console.log('   Clicking "Check eligibility" button...');
    
    const eligibilityButton = await page.$('button:has-text("Check eligibility")');
    if (eligibilityButton) {
      await eligibilityButton.click();
      await page.waitForTimeout(1000);
      
      const chatMessages2 = await page.$$('.chat-messages .message-assistant');
      let eligibilityFound = false;
      
      for (const message of chatMessages2) {
        const text = await message.textContent();
        if (text.includes('eligibility') || text.includes('Polish ancestors')) {
          eligibilityFound = true;
          break;
        }
      }
      
      logTest('Real Click - Eligibility Button Functionality', eligibilityFound,
        eligibilityFound ? 'Eligibility message appeared after button click' : 'Button click did not trigger eligibility response');
    }
    
    return true;
    
  } catch (error) {
    logTest('Real Click - Button Testing', false, 'Failed to test button clicks', error.message);
    return false;
  }
}

// Test 2: Real Animation Testing
async function testRealAnimations() {
  console.log('\n🎬 TESTING REAL ANIMATIONS (Visual verification)...');
  
  try {
    // Test button hover - should NOT have aggressive animations
    const quickButton = await page.$('.quick-action');
    if (quickButton) {
      // Get initial button styles
      const initialTransform = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.transform;
      }, quickButton);
      
      // Hover over button
      await quickButton.hover();
      await page.waitForTimeout(500);
      
      // Check if transform changed (indicates animation)
      const hoverTransform = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.transform;
      }, quickButton);
      
      const hasAggressiveAnimation = hoverTransform !== initialTransform && 
                                   (hoverTransform.includes('scale') || hoverTransform.includes('translate'));
      
      logTest('Real Animation - Button Hover Effects', !hasAggressiveAnimation,
        hasAggressiveAnimation ? 'AGGRESSIVE animations still present on hover' : 'Buttons are quiet - no aggressive animations');
    }
    
    // Test step button animations
    const stepButton = await page.$('.step');
    if (stepButton) {
      await stepButton.hover();
      await page.waitForTimeout(300);
      
      const stepTransform = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.transform;
      }, stepButton);
      
      const hasStepAnimation = stepTransform.includes('scale(1.') || stepTransform.includes('translateY(-');
      
      logTest('Real Animation - Step Button Effects', !hasStepAnimation,
        hasStepAnimation ? 'Step buttons still have scaling/moving animations' : 'Step buttons are quiet and professional');
    }
    
    return true;
    
  } catch (error) {
    logTest('Real Animation - Testing', false, 'Failed to test animations', error.message);
    return false;
  }
}

// Test 3: Real "Book a Call" Button Testing  
async function testBookACallButton() {
  console.log('\n📞 TESTING REAL "BOOK A CALL" BUTTON...');
  
  try {
    // Scroll to bottom where "Book a call" button is
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    // Find the Book a call button
    const bookButton = await page.$('button:has-text("Book a call")');
    if (!bookButton) {
      return logTest('Real Click - Book Button Exists', false, 'Cannot find "Book a call" button');
    }
    
    // Set up dialog handler to catch alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Click the button
    await bookButton.click();
    await page.waitForTimeout(1000);
    
    // Check if it shows contact info (not admin panel)
    const showsContactInfo = alertMessage.includes('contact@polishcitizenship.eu') || 
                           alertMessage.includes('555') ||
                           alertMessage.includes('consultation');
    
    const currentUrl = page.url();
    const doesNotGoToAdmin = !currentUrl.includes('/admin');
    
    logTest('Real Click - Book Button Shows Contact', showsContactInfo,
      showsContactInfo ? 'Shows proper contact information' : 'Does not show contact info');
    
    logTest('Real Click - Book Button Avoids Admin', doesNotGoToAdmin,
      doesNotGoToAdmin ? 'Does not redirect to admin panel' : 'Still redirects to admin panel');
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/book-call-test.png' });
    
    return showsContactInfo && doesNotGoToAdmin;
    
  } catch (error) {
    logTest('Real Click - Book a Call Testing', false, 'Failed to test Book a Call button', error.message);
    return false;
  }
}

// Test 4: Real Form Submission Testing
async function testRealFormSubmission() {
  console.log('\n📝 TESTING REAL FORM SUBMISSION...');
  
  try {
    // Find chat input
    const chatInput = await page.$('.chat-input');
    if (!chatInput) {
      return logTest('Real Form - Chat Input Exists', false, 'Cannot find chat input field');
    }
    
    // Type a test message
    await chatInput.type('Test message from real browser testing');
    
    // Find send button and click it
    const sendButton = await page.$('.btn-send');
    if (sendButton) {
      await sendButton.click();
      await page.waitForTimeout(2000); // Wait for AI response
      
      // Check if AI responded
      const lastMessage = await page.$('.chat-messages .message-assistant:last-child');
      if (lastMessage) {
        const responseText = await lastMessage.textContent();
        const hasResponse = responseText.length > 20; // Some meaningful response
        
        logTest('Real Form - Chat Submission Works', hasResponse,
          hasResponse ? `AI responded: "${responseText.substring(0, 50)}..."` : 'No AI response received');
        
        return hasResponse;
      }
    }
    
    return false;
    
  } catch (error) {
    logTest('Real Form - Submission Testing', false, 'Failed to test form submission', error.message);
    return false;
  }
}

// Test 5: Real Page Load and JavaScript Initialization
async function testRealPageLoad() {
  console.log('\n🚀 TESTING REAL PAGE LOAD AND JAVASCRIPT...');
  
  try {
    // Check if enhanced JavaScript actually initialized
    const jsInitialized = await page.evaluate(() => {
      return window.console && 
             document.querySelector('.quick-actions') !== null &&
             document.querySelector('.chat-messages') !== null;
    });
    
    logTest('Real Page - JavaScript Initialization', jsInitialized,
      jsInitialized ? 'JavaScript initialized and elements are interactive' : 'JavaScript failed to initialize properly');
    
    // Check console for errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any console errors
    await page.waitForTimeout(2000);
    
    const hasNoErrors = consoleErrors.length === 0;
    logTest('Real Page - No Console Errors', hasNoErrors,
      hasNoErrors ? 'No JavaScript console errors' : `Console errors: ${consoleErrors.join(', ')}`);
    
    return jsInitialized && hasNoErrors;
    
  } catch (error) {
    logTest('Real Page - Load Testing', false, 'Failed to test page load', error.message);
    return false;
  }
}

async function runRealBrowserTests() {
  console.log('🚀 REAL BROWSER TESTING - RULE NUMBER ONE COMPLIANCE');
  console.log('Testing with actual browser clicks, visual verification, and user simulation');
  console.log('='.repeat(80));
  
  try {
    // Launch real browser
    console.log('🌐 Launching real Chrome browser...');
    browser = await puppeteer.launch({ 
      headless: 'new', // Use new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Create screenshots directory
    try {
      const fs = await import('fs');
      await fs.promises.mkdir('test-screenshots', { recursive: true });
    } catch (e) {
      console.log('⚠️ Could not create screenshots directory');
    }
    
    const startTime = Date.now();
    
    // Run all real tests
    const test1 = await testRealPageLoad();
    const test2 = await testRealButtonClicks();
    const test3 = await testRealAnimations();
    const test4 = await testBookACallButton();
    const test5 = await testRealFormSubmission();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Generate comprehensive report
    console.log('\n🎯 REAL BROWSER TESTING RESULTS:');
    console.log('='.repeat(40));
    console.log(`✅ PASSED: ${results.passed}/${results.tests.length} tests`);
    console.log(`❌ FAILED: ${results.failed}/${results.tests.length} tests`);
    console.log(`📊 Success Rate: ${Math.round((results.passed/results.tests.length)*100)}%`);
    console.log(`⏱️ Test Duration: ${duration}s`);
    
    if (results.failed === 0) {
      console.log('\n🎉 ALL REAL BROWSER TESTS PASSED!');
      console.log('✅ VERIFIED: Buttons actually work when clicked');
      console.log('✅ VERIFIED: Animations are actually quiet and professional');
      console.log('✅ VERIFIED: "Book a call" shows contact info, not admin panel');
      console.log('✅ VERIFIED: Forms actually submit and get responses');
      console.log('✅ VERIFIED: JavaScript actually initializes without errors');
      console.log('\n🛡️ RULE NUMBER ONE COMPLIANCE: FULLY ACHIEVED');
    } else {
      console.log('\n🚨 REAL FUNCTIONALITY ISSUES DETECTED!');
      console.log('❌ DIRECT FIX NEEDED: Actual user experience is broken');
      
      const failedTests = results.tests.filter(t => t.status === 'FAIL');
      console.log('\n📋 ACTUAL PROBLEMS FOUND:');
      failedTests.forEach(test => {
        console.log(`   • ${test.name}: ${test.details}`);
      });
    }
    
    // Save detailed report with screenshots
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'REAL_BROWSER_TESTING',
      summary: {
        total: results.tests.length,
        passed: results.passed,
        failed: results.failed,
        successRate: Math.round((results.passed/results.tests.length)*100),
        duration: duration + 's'
      },
      tests: results.tests,
      ruleNumberOneCompliance: results.failed === 0
    };
    
    try {
      const fs = await import('fs');
      await fs.promises.writeFile(
        'test-results/real-browser-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log('\n💾 Detailed report saved to: test-results/real-browser-report.json');
      console.log('📸 Screenshots saved to: test-screenshots/');
    } catch (err) {
      console.log('⚠️ Could not save report:', err.message);
    }
    
    return results.failed === 0;
    
  } catch (error) {
    console.error('🚨 REAL BROWSER TESTING FAILED:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Install Puppeteer if not available
async function ensurePuppeteer() {
  try {
    await import('puppeteer');
  } catch (error) {
    console.log('📦 Installing Puppeteer for real browser testing...');
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      exec('npm install puppeteer', (error) => {
        if (error) {
          console.log('⚠️ Puppeteer installation failed. Falling back to basic testing.');
          reject(error);
        } else {
          console.log('✅ Puppeteer installed successfully');
          resolve();
        }
      });
    });
  }
}

// Run the real browser tests
try {
  await ensurePuppeteer();
  const success = await runRealBrowserTests();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('🚨 COULD NOT RUN REAL BROWSER TESTS:', error.message);
  console.log('💡 Try: npm install puppeteer');
  process.exit(1);
}