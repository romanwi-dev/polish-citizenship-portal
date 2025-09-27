import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🤖 Starting AI Testing Agent for Polish Citizenship Platform');
  
  // Start browser and verify server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test server availability
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Server is running and accessible');
    
    // Clear all caches and storage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('✅ Caches cleared');
    
    // Verify main pages are accessible
    const pages = [
      '/',
      '/dashboard',
      '/mobile-dashboard', 
      '/landing',
      '/ai-citizenship-intake',
      '/client-process',
      '/documents'
    ];
    
    for (const pagePath of pages) {
      try {
        await page.goto(`http://localhost:5000${pagePath}`, { timeout: 10000 });
        console.log(`✅ ${pagePath} - accessible`);
      } catch (error) {
        console.log(`⚠️ ${pagePath} - may have issues`);
      }
    }
    
  } catch (error) {
    console.error('❌ Server setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🚀 Global setup complete - AI testing ready!');
}

export default globalSetup;