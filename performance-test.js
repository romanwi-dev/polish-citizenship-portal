#!/usr/bin/env node

/**
 * Performance Testing Script for Polish Citizenship Website
 * Measures load times, resource sizes, and runtime performance
 */

import { performance } from 'perf_hooks';
import https from 'https';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
const PERFORMANCE_RESULTS = {
  timestamp: new Date().toISOString(),
  tests: []
};

// Test configuration
const TESTS = [
  { name: 'Homepage Load', path: '/' },
  { name: 'Dashboard Load', path: '/dashboard' },
  { name: 'API Health Check', path: '/api/auth/user' },
  { name: 'Static Asset Load', path: '/assets/logo.png' }
];

/**
 * Measure HTTP request performance
 */
async function measureRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const options = new URL(url);
    
    const req = (options.protocol === 'https:' ? https : require('http')).get(url, (res) => {
      let data = '';
      let firstByteTime = null;
      
      res.on('data', (chunk) => {
        if (!firstByteTime) {
          firstByteTime = performance.now();
        }
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          contentLength: parseInt(res.headers['content-length'] || data.length),
          totalTime: endTime - startTime,
          timeToFirstByte: firstByteTime ? firstByteTime - startTime : null,
          transferTime: firstByteTime ? endTime - firstByteTime : endTime - startTime,
          responseSize: data.length,
          compressionRatio: res.headers['content-encoding'] ? 
            (parseInt(res.headers['content-length']) / data.length) : 1
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Run performance test suite
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Performance Analysis...\n');
  
  for (const test of TESTS) {
    try {
      console.log(`Testing: ${test.name}...`);
      const url = `${BASE_URL}${test.path}`;
      
      // Run test multiple times for accuracy
      const runs = [];
      for (let i = 0; i < 3; i++) {
        const result = await measureRequest(url);
        runs.push(result);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between runs
      }
      
      // Calculate averages
      const avgResult = {
        testName: test.name,
        url: test.path,
        averageTime: runs.reduce((sum, r) => sum + r.totalTime, 0) / runs.length,
        averageTTFB: runs.reduce((sum, r) => sum + (r.timeToFirstByte || 0), 0) / runs.length,
        averageSize: runs.reduce((sum, r) => sum + r.responseSize, 0) / runs.length,
        statusCode: runs[0].statusCode,
        runs: runs.length,
        rawResults: runs
      };
      
      PERFORMANCE_RESULTS.tests.push(avgResult);
      
      console.log(`  ✅ ${test.name}: ${avgResult.averageTime.toFixed(2)}ms avg`);
      console.log(`     TTFB: ${avgResult.averageTTFB.toFixed(2)}ms | Size: ${(avgResult.averageSize/1024).toFixed(2)}KB\n`);
      
    } catch (error) {
      console.log(`  ❌ ${test.name}: ${error.message}\n`);
      PERFORMANCE_RESULTS.tests.push({
        testName: test.name,
        url: test.path,
        error: error.message
      });
    }
  }
  
  // Generate summary
  generateSummary();
  
  // Save results
  fs.writeFileSync('performance-results.json', JSON.stringify(PERFORMANCE_RESULTS, null, 2));
  console.log('📊 Results saved to performance-results.json');
}

/**
 * Generate performance summary
 */
function generateSummary() {
  console.log('\n📊 PERFORMANCE SUMMARY');
  console.log('=======================');
  
  const successfulTests = PERFORMANCE_RESULTS.tests.filter(t => !t.error);
  
  if (successfulTests.length === 0) {
    console.log('❌ No successful tests to analyze');
    return;
  }
  
  const totalAvgTime = successfulTests.reduce((sum, t) => sum + t.averageTime, 0) / successfulTests.length;
  const totalAvgTTFB = successfulTests.reduce((sum, t) => sum + t.averageTTFB, 0) / successfulTests.length;
  const totalAvgSize = successfulTests.reduce((sum, t) => sum + t.averageSize, 0) / successfulTests.length;
  
  console.log(`Average Load Time: ${totalAvgTime.toFixed(2)}ms`);
  console.log(`Average TTFB: ${totalAvgTTFB.toFixed(2)}ms`);
  console.log(`Average Response Size: ${(totalAvgSize/1024).toFixed(2)}KB`);
  
  // Performance scoring
  let score = 10;
  if (totalAvgTime > 1000) score -= 3;
  else if (totalAvgTime > 500) score -= 1;
  
  if (totalAvgTTFB > 200) score -= 2;
  else if (totalAvgTTFB > 100) score -= 1;
  
  if (totalAvgSize > 1024 * 1024) score -= 2; // >1MB
  else if (totalAvgSize > 512 * 1024) score -= 1; // >512KB
  
  console.log(`\n🎯 Performance Score: ${score}/10`);
  
  if (score >= 8) console.log('✅ Excellent performance!');
  else if (score >= 6) console.log('👍 Good performance with room for improvement');
  else if (score >= 4) console.log('⚠️  Average performance, optimization recommended');
  else console.log('❌ Poor performance, immediate optimization required');
}

// Check if server is running
async function checkServerHealth() {
  try {
    await measureRequest(`${BASE_URL}/`);
    return true;
  } catch (error) {
    console.log('❌ Server not responding. Please ensure the application is running on port 5000.');
    return false;
  }
}

// Main execution
async function main() {
  const serverOnline = await checkServerHealth();
  if (!serverOnline) {
    process.exit(1);
  }
  
  await runPerformanceTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runPerformanceTests, PERFORMANCE_RESULTS };