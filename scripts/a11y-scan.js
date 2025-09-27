#!/usr/bin/env node

import { chromium } from 'playwright';
import { injectAxe, checkA11y, configureAxe } from '@axe-core/playwright';
import { readFileSync } from 'fs';

// Get the dev port from package.json or default to 5000
const getDevPort = () => {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return 5000; // Our dev server runs on port 5000
  } catch {
    return 5000;
  }
};

const DEV_PORT = getDevPort();
const BASE_URL = `http://localhost:${DEV_PORT}`;

// Admin routes to scan
const ADMIN_ROUTES = [
  '/admin/cases',
  '/agent',
  '/admin/checks'
];

/**
 * Check if dev server is running
 */
async function checkDevServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.status < 500;
  } catch {
    return false;
  }
}

/**
 * Scan a single page for accessibility violations
 */
async function scanPage(page, url) {
  console.log(`🔍 Scanning ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the admin shell to load if present
    try {
      await page.waitForSelector('.ai-shell, [data-testid="admin-shell"], main', { timeout: 5000 });
    } catch {
      // If admin shell not found, continue anyway
    }
    
    // Inject axe-core
    await injectAxe(page);
    
    // Configure axe for WCAG 2.1 AA compliance
    await configureAxe(page, {
      rules: {
        // Focus on WCAG 2.1 AA standards
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-visible': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-unique': { enabled: true },
        'region': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    });
    
    // Run accessibility check
    const violations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: false }
    });
    
    return { url, violations: [] }; // checkA11y throws if violations found
    
  } catch (error) {
    if (error.name === 'AxeError' && error.violations) {
      return { url, violations: error.violations };
    }
    throw error;
  }
}

/**
 * Format and display violations
 */
function reportViolations(results) {
  let hasViolations = false;
  
  for (const result of results) {
    if (result.violations && result.violations.length > 0) {
      hasViolations = true;
      console.error(`\n❌ Accessibility violations found on ${result.url}:\n`);
      
      for (const violation of result.violations) {
        console.error(`🚫 ${violation.id} (${violation.impact})`);
        console.error(`   Description: ${violation.description}`);
        console.error(`   Help: ${violation.helpUrl}`);
        
        if (violation.nodes && violation.nodes.length > 0) {
          console.error(`   Affected elements:`);
          for (const node of violation.nodes.slice(0, 3)) { // Show first 3 elements
            if (node.target) {
              console.error(`     - ${node.target.join(', ')}`);
            }
          }
          if (violation.nodes.length > 3) {
            console.error(`     ... and ${violation.nodes.length - 3} more`);
          }
        }
        console.error('');
      }
    }
  }
  
  return hasViolations;
}

/**
 * Main accessibility scan runner
 */
async function runA11yScan() {
  console.log('♿ Starting Accessibility Scan...\n');
  
  // Check if dev server is running
  const isDevRunning = await checkDevServer();
  if (!isDevRunning) {
    console.error(`❌ Development server is not running on ${BASE_URL}`);
    console.error('Please start the dev server with: npm run dev');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'] 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    const results = [];
    
    // Scan each admin route
    for (const route of ADMIN_ROUTES) {
      const url = `${BASE_URL}${route}`;
      try {
        const result = await scanPage(page, url);
        results.push(result);
        console.log(`✅ ${url} - No violations found`);
      } catch (error) {
        if (error.name === 'AxeError' && error.violations) {
          results.push({ url, violations: error.violations });
        } else {
          console.error(`❌ Error scanning ${url}:`, error.message);
          results.push({ url, error: error.message });
        }
      }
    }
    
    // Report results
    console.log('\n📊 Accessibility Scan Results:');
    const hasViolations = reportViolations(results);
    
    if (hasViolations) {
      console.error('\n❌ Accessibility scan failed - violations found');
      process.exit(1);
    } else {
      console.log('\n✅ All accessibility scans passed - no violations found');
      process.exit(0);
    }
    
  } finally {
    await browser.close();
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n❌ Accessibility scan interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n❌ Accessibility scan terminated');
  process.exit(1);
});

// Run the accessibility scan
runA11yScan().catch((error) => {
  console.error('❌ Accessibility Scan Error:', error);
  process.exit(1);
});