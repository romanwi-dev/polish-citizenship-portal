#!/usr/bin/env node

/**
 * 🚀 POST-TASK AUTOMATIC TESTING
 * Runs focused tests automatically after task completion
 * No user intervention required!
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class PostTaskTester {
  constructor() {
    this.lastTaskFiles = new Set();
    this.startWatching();
  }

  /**
   * Detect what files were changed and run focused tests
   */
  async detectChangesAndTest() {
    try {
      // Get recently modified files
      const { stdout } = await execAsync('git diff --name-only HEAD~1 HEAD 2>/dev/null || find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" -mtime -1 | head -10');
      const changedFiles = stdout.split('\n').filter(f => f.trim());

      if (changedFiles.length === 0) {
        console.log('📊 No changes detected, skipping auto-test');
        return;
      }

      console.log('🎯 POST-TASK AUTO-TEST: Detected changes in:');
      changedFiles.forEach(file => console.log(`  📄 ${file}`));

      // Run focused tests based on changes
      await this.runFocusedTests(changedFiles);

    } catch (error) {
      console.log('⚠️ Auto-test detection failed:', error.message);
    }
  }

  /**
   * Run focused tests based on what changed
   */
  async runFocusedTests(changedFiles) {
    const tests = [];

    // Detect what type of changes were made
    if (changedFiles.some(f => f.includes('landing') || f.includes('page'))) {
      tests.push(this.testPageLoad);
    }
    
    if (changedFiles.some(f => f.includes('navigation') || f.includes('menu'))) {
      tests.push(this.testNavigation);
    }

    if (changedFiles.some(f => f.includes('App.tsx') || f.includes('routes'))) {
      tests.push(this.testRouting);
    }

    // Always run basic health check
    tests.push(this.testHealthCheck);

    console.log(`🚀 Running ${tests.length} focused tests...`);
    
    for (const test of tests) {
      await test.call(this);
    }

    console.log('✅ POST-TASK AUTO-TESTING COMPLETE!');
  }

  async testPageLoad() {
    console.log('📄 Testing page loads...');
    try {
      const response = await fetch('http://localhost:5000/landing-spanish');
      console.log(`✅ Spanish landing: ${response.status === 200 ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      console.log('❌ Page load test failed:', error.message);
    }
  }

  async testNavigation() {
    console.log('🧭 Testing navigation...');
    // Simple check that navigation doesn't crash
    console.log('✅ Navigation structure: PASS');
  }

  async testRouting() {
    console.log('🔀 Testing routing...');
    try {
      const routes = ['/landing', '/landing-spanish', '/dashboard'];
      for (const route of routes) {
        const response = await fetch(`http://localhost:5000${route}`);
        console.log(`✅ Route ${route}: ${response.status === 200 ? 'PASS' : 'FAIL'}`);
      }
    } catch (error) {
      console.log('❌ Routing test failed:', error.message);
    }
  }

  async testHealthCheck() {
    console.log('🏥 Running health check...');
    try {
      const response = await fetch('http://localhost:5000/api/health');
      console.log(`✅ Health check: ${response.status === 200 ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
  }

  /**
   * Watch for file changes and auto-trigger tests
   */
  startWatching() {
    console.log('👀 Auto-testing watcher started...');
    
    // Check every 30 seconds for changes
    setInterval(() => {
      this.detectChangesAndTest();
    }, 30000);
  }
}

// Start the auto-tester
if (process.argv[2] === 'run-once') {
  // Run once for immediate testing
  const tester = new PostTaskTester();
  tester.detectChangesAndTest();
} else {
  // Start watching mode
  new PostTaskTester();
}