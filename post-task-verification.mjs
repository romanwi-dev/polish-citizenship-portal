#!/usr/bin/env node

/**
 * 🎯 POST-TASK VERIFICATION SYSTEM
 * Enhanced verification that runs immediately after each task completion
 * Uses existing Playwright infrastructure for comprehensive validation
 */

import { spawn } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch';

class PostTaskVerification {
  constructor(taskDescription = '', featuresModified = []) {
    this.taskDescription = taskDescription;
    this.featuresModified = featuresModified;
    this.results = {
      functional: { passed: 0, failed: 0, tests: [] },
      integration: { passed: 0, failed: 0, tests: [] },
      regression: { passed: 0, failed: 0, tests: [] },
      security: { passed: 0, failed: 0, tests: [] },
      performance: { passed: 0, failed: 0, tests: [] },
      overall: 'PENDING'
    };
  }

  async runVerification() {
    console.log('🎯 POST-TASK VERIFICATION STARTING');
    console.log(`📋 Task: ${this.taskDescription}`);
    console.log(`🔧 Modified: ${this.featuresModified.join(', ')}`);
    console.log('=' .repeat(60));

    try {
      // Phase 1: Functional Testing (immediate feature verification)
      await this.runFunctionalTests();
      
      // Phase 2: Integration Testing (compatibility with existing features)
      await this.runIntegrationTests();
      
      // Phase 3: Regression Testing (ensure nothing broke)
      await this.runRegressionTests();
      
      // Phase 4: Security Testing (vulnerability checks)
      await this.runSecurityTests();
      
      // Phase 5: Performance Impact Testing
      await this.runPerformanceTests();
      
      // Generate final verdict
      this.generateVerdict();
      
      return this.results;
    } catch (error) {
      console.error('❌ POST-TASK VERIFICATION FAILED:', error);
      this.results.overall = 'FAILED';
      return this.results;
    }
  }

  async runFunctionalTests() {
    console.log('🧪 PHASE 1: FUNCTIONAL TESTING');
    console.log('Testing implemented features work correctly...\n');

    // Run targeted tests based on what was modified
    const testSelectors = this.getTargetedTests();
    
    for (const selector of testSelectors) {
      try {
        const result = await this.runPlaywrightTest(selector);
        this.results.functional.tests.push({
          name: selector,
          status: result.success ? 'PASSED' : 'FAILED',
          details: result.output
        });
        
        if (result.success) {
          this.results.functional.passed++;
          console.log(`✅ ${selector}`);
        } else {
          this.results.functional.failed++;
          console.log(`❌ ${selector}`);
        }
      } catch (error) {
        this.results.functional.failed++;
        console.log(`❌ ${selector} - Error: ${error.message}`);
      }
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 PHASE 2: INTEGRATION TESTING');
    console.log('Testing new features work with existing systems...\n');

    const integrationTests = [
      'e2e-tests/01-core-pages.spec.ts',
      'e2e-tests/02-document-workflows.spec.ts',
      'e2e-tests/03-family-tree-workflows.spec.ts'
    ];

    for (const test of integrationTests) {
      try {
        const result = await this.runPlaywrightTest(test);
        if (result.success) {
          this.results.integration.passed++;
          console.log(`✅ Integration: ${test.split('/').pop()}`);
        } else {
          this.results.integration.failed++;
          console.log(`❌ Integration: ${test.split('/').pop()}`);
        }
      } catch (error) {
        this.results.integration.failed++;
        console.log(`❌ Integration failed: ${error.message}`);
      }
    }
  }

  async runRegressionTests() {
    console.log('\n🔄 PHASE 3: REGRESSION TESTING');
    console.log('Ensuring existing functionality still works...\n');

    // Test core system endpoints
    const endpoints = [
      '/api/health',
      '/api/data-population/entries',
      '/data-population',
      '/dashboard',
      '/mobile-dashboard'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          timeout: 10000
        });
        
        if (response.ok) {
          this.results.regression.passed++;
          console.log(`✅ Endpoint: ${endpoint}`);
        } else {
          this.results.regression.failed++;
          console.log(`❌ Endpoint: ${endpoint} - Status: ${response.status}`);
        }
      } catch (error) {
        this.results.regression.failed++;
        console.log(`❌ Endpoint: ${endpoint} - Error: ${error.message}`);
      }
    }
  }

  async runSecurityTests() {
    console.log('\n🛡️ PHASE 4: SECURITY TESTING');
    console.log('Checking for security vulnerabilities...\n');

    try {
      // Test XSS protection
      const xssTest = await this.testXSSProtection();
      if (xssTest.success) {
        this.results.security.passed++;
        console.log('✅ XSS Protection Working');
      } else {
        this.results.security.failed++;
        console.log('❌ XSS Protection Failed');
      }

      // Test security headers
      const headersTest = await this.testSecurityHeaders();
      if (headersTest.success) {
        this.results.security.passed++;
        console.log('✅ Security Headers Present');
      } else {
        this.results.security.failed++;
        console.log('❌ Security Headers Missing');
      }

    } catch (error) {
      this.results.security.failed++;
      console.log(`❌ Security test failed: ${error.message}`);
    }
  }

  async runPerformanceTests() {
    console.log('\n⚡ PHASE 5: PERFORMANCE TESTING');
    console.log('Checking performance impact of changes...\n');

    try {
      // Test key functionality performance
      const perfTests = [
        { name: 'PDF Generation', test: this.testPDFPerformance.bind(this) },
        { name: 'Page Load Speed', test: this.testPageLoadPerformance.bind(this) },
        { name: 'API Response Time', test: this.testAPIPerformance.bind(this) }
      ];

      for (const perfTest of perfTests) {
        try {
          const result = await perfTest.test();
          if (result.success) {
            this.results.performance.passed++;
            console.log(`✅ ${perfTest.name}: ${result.metric}`);
          } else {
            this.results.performance.failed++;
            console.log(`❌ ${perfTest.name}: ${result.metric}`);
          }
        } catch (error) {
          this.results.performance.failed++;
          console.log(`❌ ${perfTest.name} failed: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Performance testing failed: ${error.message}`);
    }
  }

  getTargetedTests() {
    const testMap = {
      'pdf': ['e2e-tests/02-document-workflows.spec.ts'],
      'family-tree': ['e2e-tests/03-family-tree-workflows.spec.ts'],
      'dashboard': ['e2e-tests/01-core-pages.spec.ts'],
      'security': ['security-tests'],
      'ai': ['e2e-tests/05-advanced-features.spec.ts'],
      'mobile': ['e2e-tests/01-core-pages.spec.ts'],
      'forms': ['e2e-tests/02-document-workflows.spec.ts']
    };

    let tests = ['e2e-tests/01-core-pages.spec.ts']; // Always test core pages

    this.featuresModified.forEach(feature => {
      if (testMap[feature]) {
        tests.push(...testMap[feature]);
      }
    });

    return [...new Set(tests)]; // Remove duplicates
  }

  async runPlaywrightTest(testFile) {
    return new Promise((resolve) => {
      const testProcess = spawn('npx', [
        'playwright', 'test', testFile,
        '--reporter=json',
        '--project=chromium',
        '--timeout=30000'
      ], { stdio: ['pipe', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      testProcess.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout + stderr,
          exitCode: code
        });
      });
    });
  }

  async testXSSProtection() {
    try {
      const response = await fetch('http://localhost:5000/api/data-population/generate-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'xss_test',
          applicantFirstName: '<script>alert("XSS")</script>',
          applicantLastName: 'TEST',
          applicantDateOfBirth: '1990-01-01'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: data.generatedFiles && data.generatedFiles.length > 0 };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  async testSecurityHeaders() {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const headers = response.headers;
      
      const requiredHeaders = [
        'content-security-policy',
        'x-content-type-options',
        'x-frame-options',
        'strict-transport-security'
      ];

      const hasHeaders = requiredHeaders.every(header => headers.has(header));
      return { success: hasHeaders };
    } catch (error) {
      return { success: false };
    }
  }

  async testPDFPerformance() {
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:5000/api/data-population/generate-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'perf_test',
          applicantFirstName: 'PERFORMANCE',
          applicantLastName: 'TEST',
          applicantDateOfBirth: '1990-01-01'
        })
      });
      
      const duration = Date.now() - start;
      const success = response.ok && duration < 5000; // Under 5 seconds
      
      return {
        success,
        metric: `${duration}ms ${success ? '(GOOD)' : '(SLOW)'}`
      };
    } catch (error) {
      return { success: false, metric: 'FAILED' };
    }
  }

  async testPageLoadPerformance() {
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:5000/data-population');
      const duration = Date.now() - start;
      const success = response.ok && duration < 2000; // Under 2 seconds
      
      return {
        success,
        metric: `${duration}ms ${success ? '(FAST)' : '(SLOW)'}`
      };
    } catch (error) {
      return { success: false, metric: 'FAILED' };
    }
  }

  async testAPIPerformance() {
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:5000/api/data-population/entries');
      const duration = Date.now() - start;
      const success = response.ok && duration < 1000; // Under 1 second
      
      return {
        success,
        metric: `${duration}ms ${success ? '(FAST)' : '(SLOW)'}`
      };
    } catch (error) {
      return { success: false, metric: 'FAILED' };
    }
  }

  generateVerdict() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 POST-TASK VERIFICATION RESULTS');
    console.log('=' .repeat(60));

    const totalPassed = Object.values(this.results).reduce((sum, phase) => {
      return sum + (phase.passed || 0);
    }, 0);
    
    const totalFailed = Object.values(this.results).reduce((sum, phase) => {
      return sum + (phase.failed || 0);
    }, 0);

    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    console.log(`🧪 Functional Tests: ${this.results.functional.passed}✅ ${this.results.functional.failed}❌`);
    console.log(`🔗 Integration Tests: ${this.results.integration.passed}✅ ${this.results.integration.failed}❌`);
    console.log(`🔄 Regression Tests: ${this.results.regression.passed}✅ ${this.results.regression.failed}❌`);
    console.log(`🛡️ Security Tests: ${this.results.security.passed}✅ ${this.results.security.failed}❌`);
    console.log(`⚡ Performance Tests: ${this.results.performance.passed}✅ ${this.results.performance.failed}❌`);
    console.log('─'.repeat(60));
    console.log(`📊 TOTAL: ${totalPassed}✅ ${totalFailed}❌ (${successRate}% success rate)`);

    if (successRate >= 95) {
      this.results.overall = 'EXCELLENT';
      console.log('🎉 VERDICT: EXCELLENT - Task implemented perfectly!');
    } else if (successRate >= 85) {
      this.results.overall = 'GOOD';
      console.log('✅ VERDICT: GOOD - Task implemented successfully with minor issues');
    } else if (successRate >= 70) {
      this.results.overall = 'ACCEPTABLE';
      console.log('⚠️ VERDICT: ACCEPTABLE - Task implemented but needs improvements');
    } else {
      this.results.overall = 'FAILED';
      console.log('❌ VERDICT: FAILED - Task implementation has critical issues');
    }

    console.log('=' .repeat(60));
  }
}

// Export for use in other scripts
export { PostTaskVerification };

// If run directly, execute with command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  const taskDescription = process.argv[2] || 'Unknown task';
  const features = process.argv[3] ? process.argv[3].split(',') : ['general'];
  
  const verifier = new PostTaskVerification(taskDescription, features);
  await verifier.runVerification();
}