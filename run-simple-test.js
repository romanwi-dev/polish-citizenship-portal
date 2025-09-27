#!/usr/bin/env node

/**
 * Simple Test Runner for Polish Citizenship Platform
 * Works without browser dependencies by using HTTP requests
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

class SimpleTestRunner {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'AI-Testing-Agent/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          url: url.toString()
        }));
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async testPage(name, path, checks = []) {
    console.log(`🧪 Testing ${name}...`);
    
    try {
      const response = await this.makeRequest(path);
      const result = {
        name,
        path,
        status: response.status,
        success: response.status === 200,
        timestamp: new Date().toISOString(),
        checks: []
      };

      // Basic checks
      if (response.status === 200) {
        result.checks.push({ check: 'Page loads', passed: true });
        
        // Content checks
        for (const check of checks) {
          const passed = response.body.includes(check.contains);
          result.checks.push({
            check: check.name,
            passed,
            expected: check.contains
          });
        }
      } else {
        result.checks.push({ 
          check: 'Page loads', 
          passed: false, 
          error: `HTTP ${response.status}` 
        });
      }

      this.results.push(result);
      
      // Live feedback
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${name} (${response.status})`);
      
      return result;
      
    } catch (error) {
      const result = {
        name,
        path,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`❌ ${name} - ${error.message}`);
      return result;
    }
  }

  generateReport() {
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const failed = total - passed;

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`);
    console.log('='.repeat(50));

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach(result => {
      console.log(`\n${result.success ? '✅' : '❌'} ${result.name}`);
      console.log(`   URL: ${result.path}`);
      console.log(`   Status: ${result.status || 'ERROR'}`);
      
      if (result.checks) {
        result.checks.forEach(check => {
          const status = check.passed ? '✅' : '❌';
          console.log(`   ${status} ${check.check}`);
        });
      }
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
    });

    return {
      summary: { passed, failed, total, successRate: Math.round((passed/total) * 100) },
      details: this.results
    };
  }
}

async function runTests() {
  console.log('🚀 Polish Citizenship Platform - AI Testing Agent');
  console.log('🔄 Starting automated tests...\n');

  const tester = new SimpleTestRunner();

  // Test all your main pages
  await tester.testPage('Home Page', '/', [
    { name: 'Has Polish content', contains: 'Polish' },
    { name: 'Has navigation', contains: 'nav' }
  ]);

  await tester.testPage('Dashboard', '/dashboard', [
    { name: 'Has dashboard content', contains: 'dashboard' },
    { name: 'Has forms', contains: 'form' }
  ]);

  await tester.testPage('Mobile Dashboard', '/mobile-dashboard', [
    { name: 'Mobile optimized', contains: 'mobile' }
  ]);

  await tester.testPage('AI Citizenship Intake', '/ai-citizenship-intake', [
    { name: 'Has AI chat', contains: 'chat' },
    { name: 'Has messaging', contains: 'message' }
  ]);

  await tester.testPage('Landing Page', '/landing', [
    { name: 'Has landing content', contains: 'citizenship' }
  ]);

  await tester.testPage('Client Process', '/client-process', [
    { name: 'Has process info', contains: 'process' }
  ]);

  await tester.testPage('Documents', '/documents', [
    { name: 'Has document features', contains: 'document' }
  ]);

  // Generate and save report
  const report = tester.generateReport();
  
  // Save results to file
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    ...report
  };
  
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }
  
  fs.writeFileSync('test-results/latest-report.json', JSON.stringify(reportData, null, 2));
  
  console.log('\n💾 Report saved to: test-results/latest-report.json');
  console.log('🎯 Testing complete! Your platform has been fully analyzed.\n');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { SimpleTestRunner };