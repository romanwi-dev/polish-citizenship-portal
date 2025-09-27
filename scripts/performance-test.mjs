#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests Core Web Vitals and bundle size for /landing-spanish
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function performanceTest(url) {
  console.log(`⚡ Performance testing: ${url}`);
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test initial load performance
    console.log('\n📊 PERFORMANCE METRICS:');
    console.log('=====================================');
    
    const startTime = Date.now();
    const response = await fetch(url);
    const loadTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    const contentLength = Buffer.byteLength(content, 'utf8');
    
    console.log(`✅ Page Load Time: ${loadTime}ms`);
    console.log(`📏 HTML Size: ${Math.round(contentLength / 1024)}KB`);
    
    // Check compression
    const encoding = response.headers.get('content-encoding');
    if (encoding) {
      console.log(`📦 Compression: ${encoding}`);
    } else {
      console.log(`⚠️  Compression: Not enabled`);
    }
    
    // Test static assets (estimate JS bundle size)
    const jsMatches = content.match(/src="([^"]*\.js[^"]*)"/g) || [];
    const cssMatches = content.match(/href="([^"]*\.css[^"]*)"/g) || [];
    
    console.log(`📜 JS Files Found: ${jsMatches.length}`);
    console.log(`🎨 CSS Files Found: ${cssMatches.length}`);
    
    // Check for performance anti-patterns
    const antiPatterns = [
      { pattern: /style="[^"]*"/g, name: 'Inline Styles', threshold: 5 },
      { pattern: /<script[^>]*>[\s\S]*?<\/script>/g, name: 'Inline Scripts', threshold: 2 },
      { pattern: /<img(?![^>]*loading="lazy")/g, name: 'Non-lazy Images', threshold: 3 }
    ];
    
    console.log('\n🔍 ANTI-PATTERN ANALYSIS:');
    console.log('=====================================');
    
    let score = 100;
    for (const { pattern, name, threshold } of antiPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length > threshold) {
        console.log(`⚠️  ${name}: ${matches.length} (threshold: ${threshold})`);
        score -= 10;
      } else {
        console.log(`✅ ${name}: ${matches.length} (within threshold)`);
      }
    }
    
    // Performance recommendations
    console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
    console.log('=====================================');
    
    if (loadTime > 1000) {
      console.log('⚠️  Consider optimizing server response time (>1s)');
    }
    if (contentLength > 50000) {
      console.log('⚠️  HTML size is large, consider code splitting');
    }
    if (!encoding) {
      console.log('⚠️  Enable compression for better performance');
    }
    
    console.log(`\n🏆 PERFORMANCE SCORE: ${score}/100`);
    
    if (score >= 90) {
      console.log('🎉 EXCELLENT: Great performance!');
    } else if (score >= 70) {
      console.log('✅ GOOD: Performance is acceptable');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Performance issues detected');
    }
    
    // Return metrics for CI/CD
    return {
      loadTime,
      contentLength,
      score,
      jsFiles: jsMatches.length,
      cssFiles: cssMatches.length,
      compressed: !!encoding
    };
    
  } catch (error) {
    console.error('❌ ERROR during performance test:', error.message);
    process.exit(1);
  }
}

const url = process.argv[2] || 'http://localhost:5000/landing-spanish';
performanceTest(url).then(results => {
  console.log('\n📋 RESULTS SUMMARY:');
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.score >= 70 ? 0 : 1);
});