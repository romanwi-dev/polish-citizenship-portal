const http = require('http');
const https = require('https');
const fs = require('fs');

async function testPageSpeed() {
  console.log('🚀 Testing Landing Page Speed...');
  console.log('📊 Measuring server response times and resource analysis');
  
  const results = {
    serverResponse: 0,
    contentSize: 0,
    totalTime: 0,
    headers: {},
    optimizations: []
  };
  
  try {
    // Test server response time
    const startTime = Date.now();
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/landing', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: Date.now() - startTime
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
    });
    
    results.serverResponse = response.responseTime;
    results.contentSize = Buffer.byteLength(response.data, 'utf8');
    results.headers = response.headers;
    
    // Analyze HTML content for optimizations
    const html = response.data;
    
    // Check for performance optimizations
    const optimizationChecks = {
      'Critical CSS Inlined': html.includes('<style type="text/css">'),
      'DNS Prefetch': html.includes('dns-prefetch'),
      'Preconnect Links': html.includes('preconnect'),
      'Font Display Swap': html.includes('font-display:swap'),
      'GPU Acceleration': html.includes('translate3d') || html.includes('translateZ'),
      'Content Visibility': html.includes('content-visibility'),
      'Performance Classes': html.includes('performance-optimized'),
      'Hero Optimization': html.includes('hero-optimized'),
      'Lazy Loading': html.includes('lazy-section'),
      'Hardware Acceleration': html.includes('will-change:transform'),
      'Layout Containment': html.includes('contain:layout'),
      'Resource Hints': html.includes('preload') || html.includes('prefetch')
    };
    
    results.optimizations = optimizationChecks;
    
    // Count resources
    const scriptTags = (html.match(/<script/g) || []).length;
    const styleTags = (html.match(/<link[^>]*stylesheet/g) || []).length;
    const imageTags = (html.match(/<img/g) || []).length;
    
    results.resources = {
      scripts: scriptTags,
      stylesheets: styleTags,
      images: imageTags,
      total: scriptTags + styleTags + imageTags
    };
    
    // Calculate performance score
    const score = calculatePerformanceScore(results);
    results.score = score;
    
    // Test multiple requests for consistency
    console.log('📈 Testing response consistency...');
    const multipleTests = [];
    for (let i = 0; i < 5; i++) {
      const testStart = Date.now();
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:5000/landing', (res) => {
          res.on('data', () => {});
          res.on('end', () => resolve());
        });
        req.on('error', reject);
      });
      multipleTests.push(Date.now() - testStart);
    }
    
    results.averageResponse = Math.round(multipleTests.reduce((a, b) => a + b) / multipleTests.length);
    results.consistency = {
      min: Math.min(...multipleTests),
      max: Math.max(...multipleTests),
      variance: Math.round(Math.max(...multipleTests) - Math.min(...multipleTests))
    };
    
    const report = generateSpeedReport(results);
    fs.writeFileSync('speed-test-report.md', report);
    
    console.log('\n🎯 SPEED TEST RESULTS:');
    console.log(`⚡ Server Response: ${results.serverResponse}ms`);
    console.log(`📊 Average Response: ${results.averageResponse}ms`);
    console.log(`📦 Content Size: ${formatBytes(results.contentSize)}`);
    console.log(`🏆 Performance Score: ${results.score}/100`);
    console.log(`✅ Optimizations: ${Object.values(results.optimizations).filter(Boolean).length}/12`);
    console.log('📋 Detailed report saved to: speed-test-report.md');
    
    return results;
    
  } catch (error) {
    console.error('❌ Speed test failed:', error.message);
    return { error: error.message };
  }
}

function calculatePerformanceScore(results) {
  let score = 100;
  
  // Server response time scoring
  if (results.serverResponse > 1000) score -= 20;
  else if (results.serverResponse > 500) score -= 10;
  else if (results.serverResponse > 200) score -= 5;
  
  // Content size scoring
  if (results.contentSize > 100000) score -= 15; // 100KB
  else if (results.contentSize > 50000) score -= 10; // 50KB
  else if (results.contentSize > 30000) score -= 5; // 30KB
  
  // Resource count scoring
  if (results.resources?.total > 20) score -= 10;
  else if (results.resources?.total > 10) score -= 5;
  
  // Optimization bonuses
  const optimizationCount = Object.values(results.optimizations || {}).filter(Boolean).length;
  score += Math.min(20, optimizationCount * 2); // Up to 20 bonus points
  
  // Headers optimization
  if (results.headers['content-encoding'] === 'gzip') score += 5;
  if (results.headers['cache-control']) score += 5;
  
  // Consistency bonus
  if (results.consistency && results.consistency.variance < 100) score += 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function generateSpeedReport(results) {
  const timestamp = new Date().toISOString();
  const optimizationCount = Object.values(results.optimizations).filter(Boolean).length;
  
  return `# Landing Page Speed Test Report
Generated: ${timestamp}
URL: http://localhost:5000/landing

## 🏆 Performance Score: ${results.score}/100

## ⚡ Response Time Analysis

### Server Performance
- **Initial Response**: ${results.serverResponse}ms
- **Average Response** (5 tests): ${results.averageResponse}ms
- **Best Response**: ${results.consistency?.min}ms
- **Worst Response**: ${results.consistency?.max}ms
- **Variance**: ${results.consistency?.variance}ms
- **Consistency**: ${results.consistency?.variance < 100 ? '🟢 Excellent' : results.consistency?.variance < 200 ? '🟡 Good' : '🔴 Poor'}

### Content Analysis
- **HTML Size**: ${formatBytes(results.contentSize)}
- **Size Assessment**: ${getSizeGrade(results.contentSize)}

## 📦 Resource Analysis

### Resource Count
- **Script Tags**: ${results.resources?.scripts || 0}
- **Stylesheet Links**: ${results.resources?.stylesheets || 0}
- **Image Tags**: ${results.resources?.images || 0}
- **Total Resources**: ${results.resources?.total || 0}
- **Resource Efficiency**: ${results.resources?.total < 10 ? '🟢 Excellent' : results.resources?.total < 20 ? '🟡 Good' : '🔴 High'}

## 🚀 Performance Optimizations Detected

### Optimization Status: ${optimizationCount}/12 (${Math.round(optimizationCount/12*100)}%)

${Object.entries(results.optimizations).map(([key, value]) => 
  `- **${key}**: ${value ? '✅ Implemented' : '❌ Missing'}`
).join('\n')}

## 🌐 HTTP Headers Analysis

### Server Headers
${Object.entries(results.headers).map(([key, value]) => 
  `- **${key}**: ${value}`
).join('\n')}

### Header Optimization
- **Compression**: ${results.headers['content-encoding'] ? '✅ ' + results.headers['content-encoding'] : '❌ None'}
- **Caching**: ${results.headers['cache-control'] ? '✅ ' + results.headers['cache-control'] : '❌ None'}
- **Content Type**: ${results.headers['content-type'] || 'Not specified'}

## 📊 Performance Grades

### Response Time: ${getResponseGrade(results.serverResponse)}
- Excellent: < 200ms
- Good: 200-500ms  
- Fair: 500-1000ms
- Poor: > 1000ms

### Content Size: ${getSizeGrade(results.contentSize)}
- Excellent: < 30KB
- Good: 30-50KB
- Fair: 50-100KB
- Poor: > 100KB

### Optimization Level: ${getOptimizationGrade(optimizationCount)}
- Excellent: 10-12 optimizations
- Good: 7-9 optimizations
- Fair: 4-6 optimizations  
- Poor: < 4 optimizations

## 🎯 Google PageSpeed Factors

### Positive Factors
${getPositiveFactors(results)}

### Areas for Improvement
${getImprovementAreas(results)}

## 📈 Performance Recommendations

### High Priority
${getHighPriorityRecommendations(results)}

### Medium Priority  
${getMediumPriorityRecommendations(results)}

## 🏅 Overall Assessment

**Grade**: ${getOverallGrade(results.score)}
**Status**: ${results.score >= 90 ? 'Google PageSpeed Ready (90+)' : results.score >= 80 ? 'Excellent Performance' : results.score >= 70 ? 'Good Performance' : 'Needs Optimization'}

---
*Speed test completed with Node.js HTTP client*
*Timestamp: ${new Date().toLocaleString()}*
`;
}

function getResponseGrade(time) {
  if (time < 200) return '🟢 Excellent';
  if (time < 500) return '🟡 Good';
  if (time < 1000) return '🟠 Fair';
  return '🔴 Poor';
}

function getSizeGrade(size) {
  if (size < 30000) return '🟢 Excellent';
  if (size < 50000) return '🟡 Good';
  if (size < 100000) return '🟠 Fair';
  return '🔴 Poor';
}

function getOptimizationGrade(count) {
  if (count >= 10) return '🟢 Excellent';
  if (count >= 7) return '🟡 Good';
  if (count >= 4) return '🟠 Fair';
  return '🔴 Poor';
}

function getOverallGrade(score) {
  if (score >= 95) return 'A+ Outstanding';
  if (score >= 90) return 'A Excellent';
  if (score >= 80) return 'B+ Very Good';
  if (score >= 70) return 'B Good';
  return 'C Needs Improvement';
}

function getPositiveFactors(results) {
  const factors = [];
  
  if (results.serverResponse < 200) factors.push('- Lightning-fast server response');
  if (results.contentSize < 30000) factors.push('- Optimal content size');
  if (Object.values(results.optimizations).filter(Boolean).length >= 8) factors.push('- Comprehensive optimizations');
  if (results.headers['content-encoding']) factors.push('- Content compression enabled');
  if (results.consistency?.variance < 100) factors.push('- Consistent response times');
  
  return factors.length > 0 ? factors.join('\n') : '- Basic performance factors in place';
}

function getImprovementAreas(results) {
  const areas = [];
  
  if (results.serverResponse > 500) areas.push('- Optimize server response time');
  if (results.contentSize > 50000) areas.push('- Reduce HTML content size');
  if (!results.headers['content-encoding']) areas.push('- Enable content compression');
  if (!results.optimizations['Critical CSS Inlined']) areas.push('- Implement critical CSS inlining');
  
  return areas.length > 0 ? areas.join('\n') : '✅ No major improvement areas identified';
}

function getHighPriorityRecommendations(results) {
  const recommendations = [];
  
  if (results.serverResponse > 1000) recommendations.push('- URGENT: Optimize server response time');
  if (results.contentSize > 100000) recommendations.push('- URGENT: Reduce page size');
  if (!results.optimizations['GPU Acceleration']) recommendations.push('- Add hardware acceleration');
  
  return recommendations.length > 0 ? recommendations.join('\n') : '✅ No urgent optimizations needed';
}

function getMediumPriorityRecommendations(results) {
  const recommendations = [
    '- Consider implementing service worker caching',
    '- Add more resource hints for external assets',
    '- Optimize images with modern formats (WebP)',
    '- Implement progressive loading for below-fold content'
  ];
  
  return recommendations.join('\n');
}

// Run the speed test
testPageSpeed();