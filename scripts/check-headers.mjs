#!/usr/bin/env node

/**
 * Security Headers Verification Script
 * Checks for presence of critical security headers
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function checkSecurityHeaders(url) {
  console.log(`🔍 Checking security headers for: ${url}`);
  
  try {
    // Use dynamic import for fetch in Node.js
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(url, { method: 'HEAD' });
    const headers = response.headers;
    
    console.log('\n📊 SECURITY HEADERS REPORT:');
    console.log('=====================================');
    
    const requiredHeaders = {
      'content-security-policy': 'Content Security Policy',
      'strict-transport-security': 'HSTS', 
      'x-content-type-options': 'Content Type Options',
      'x-frame-options': 'Frame Options',
      'referrer-policy': 'Referrer Policy',
      'cross-origin-opener-policy': 'Cross-Origin-Opener-Policy',
      'cross-origin-resource-policy': 'Cross-Origin-Resource-Policy',
      'permissions-policy': 'Permissions Policy',
      'x-xss-protection': 'XSS Protection'
    };
    
    let score = 0;
    let total = Object.keys(requiredHeaders).length;
    
    for (const [headerName, displayName] of Object.entries(requiredHeaders)) {
      const value = headers.get(headerName);
      if (value) {
        console.log(`✅ ${displayName}: ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`);
        score++;
      } else {
        console.log(`❌ ${displayName}: MISSING`);
      }
    }
    
    console.log('\n🏆 PERFORMANCE HEADERS:');
    console.log('=====================================');
    
    const performanceHeaders = {
      'cache-control': 'Cache Control',
      'content-encoding': 'Compression',
      'etag': 'ETag',
      'vary': 'Vary Header'
    };
    
    for (const [headerName, displayName] of Object.entries(performanceHeaders)) {
      const value = headers.get(headerName);
      if (value) {
        console.log(`✅ ${displayName}: ${value}`);
      } else {
        console.log(`⚠️  ${displayName}: Not set`);
      }
    }
    
    console.log(`\n📈 SECURITY SCORE: ${score}/${total} (${Math.round((score/total)*100)}%)`);
    
    if (score === total) {
      console.log('🎉 EXCELLENT: All security headers present!');
      process.exit(0);
    } else if (score >= total * 0.8) {
      console.log('✅ GOOD: Most security headers present');
      process.exit(0);
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Missing critical security headers');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ ERROR checking headers:', error.message);
    process.exit(1);
  }
}

// Get URL from command line or use default
const url = process.argv[2] || 'http://localhost:5000/landing-spanish';
checkSecurityHeaders(url);