import puppeteer from 'puppeteer';
import fs from 'fs';

async function analyzeLandingPagePerformance() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set mobile viewport for mobile-first analysis
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    
    const performanceMetrics = {};
    
    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to landing page
    await page.goto('http://localhost:5000/landing', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    performanceMetrics.totalLoadTime = loadTime;
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const data = {};
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        data.timing = {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          pageLoad: navigation.loadEventEnd - navigation.navigationStart
        };
      }
      
      // Paint timing
      const paintEntries = performance.getEntriesByType('paint');
      data.paint = {};
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          data.paint.fcp = entry.startTime;
        }
      });
      
      // Resource analysis
      const resources = performance.getEntriesByType('resource');
      data.resources = {
        totalResources: resources.length,
        scripts: resources.filter(r => r.name.includes('.js')).length,
        stylesheets: resources.filter(r => r.name.includes('.css')).length,
        images: resources.filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)).length,
        fonts: resources.filter(r => /\.(woff|woff2|ttf|otf)/.test(r.name)).length,
        totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowestResources: resources
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
          .map(r => ({ 
            name: r.name.split('/').pop(), 
            duration: r.duration, 
            size: r.transferSize 
          }))
      };
      
      // DOM analysis
      data.dom = {
        domElements: document.querySelectorAll('*').length,
        performanceOptimizedElements: document.querySelectorAll('.performance-optimized').length,
        heroOptimizedElements: document.querySelectorAll('.hero-optimized').length,
        lazySections: document.querySelectorAll('.lazy-section').length,
        images: document.querySelectorAll('img').length,
        buttons: document.querySelectorAll('button').length
      };
      
      // Memory info (if available)
      data.memory = null;
      if (performance.memory) {
        data.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      
      return data;
    });
    
    performanceMetrics = { ...performanceMetrics, ...metrics };
    
    // Calculate performance score
    performanceMetrics.score = calculatePerformanceScore(performanceMetrics);
    
    return performanceMetrics;
    
  } catch (error) {
    console.error('Performance analysis error:', error);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function calculatePerformanceScore(metrics) {
  let score = 100;
  
  // FCP scoring (good < 1800ms, poor > 3000ms)
  const fcp = metrics.paint?.fcp || 0;
  if (fcp > 3000) score -= 25;
  else if (fcp > 1800) score -= 15;
  
  // Load time scoring
  if (metrics.totalLoadTime > 5000) score -= 20;
  else if (metrics.totalLoadTime > 3000) score -= 10;
  
  // Resource efficiency
  if (metrics.resources?.totalResources > 50) score -= 10;
  if (metrics.resources?.totalTransferSize > 2000000) score -= 15; // 2MB
  
  // DOM complexity
  if (metrics.dom?.domElements > 1500) score -= 10;
  
  return Math.max(0, Math.round(score));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateReport(metrics) {
  const fcp = metrics.paint?.fcp || 0;
  const totalSize = metrics.resources?.totalTransferSize || 0;
  
  return `# Landing Page Performance Analysis Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Overall Performance Score**: ${metrics.score}/100 ${getGradeEmoji(metrics.score)}
- **Total Load Time**: ${metrics.totalLoadTime}ms
- **Analysis Type**: Mobile-First (375x667 viewport)

## Performance Metrics

### Load Performance
- **Page Load Time**: ${metrics.totalLoadTime}ms
- **First Contentful Paint**: ${fcp.toFixed(2)}ms ${getFCPAssessment(fcp)}
- **DOM Content Loaded**: ${metrics.timing?.domContentLoaded?.toFixed(2) || 'N/A'}ms
- **Full Page Load**: ${metrics.timing?.pageLoad?.toFixed(2) || 'N/A'}ms

### Resource Analysis
- **Total Resources**: ${metrics.resources?.totalResources || 0}
- **JavaScript Files**: ${metrics.resources?.scripts || 0}
- **CSS Files**: ${metrics.resources?.stylesheets || 0} 
- **Images**: ${metrics.resources?.images || 0}
- **Fonts**: ${metrics.resources?.fonts || 0}
- **Total Transfer Size**: ${formatBytes(totalSize)}

### DOM Structure
- **Total DOM Elements**: ${metrics.dom?.domElements || 0}
- **Performance Optimized Elements**: ${metrics.dom?.performanceOptimizedElements || 0}
- **Hero Optimized Elements**: ${metrics.dom?.heroOptimizedElements || 0}
- **Lazy Loading Sections**: ${metrics.dom?.lazySections || 0}
- **Interactive Buttons**: ${metrics.dom?.buttons || 0}

### Network Timing
- **DNS Lookup**: ${metrics.timing?.dnsLookup?.toFixed(2) || 'N/A'}ms
- **TCP Connection**: ${metrics.timing?.tcpConnection?.toFixed(2) || 'N/A'}ms
- **Server Response**: ${metrics.timing?.serverResponse?.toFixed(2) || 'N/A'}ms

### Memory Usage ${metrics.memory ? '' : '(Not Available)'}
${metrics.memory ? `
- **Used JS Heap**: ${formatBytes(metrics.memory.usedJSHeapSize)}
- **Total JS Heap**: ${formatBytes(metrics.memory.totalJSHeapSize)}
- **Heap Utilization**: ${((metrics.memory.usedJSHeapSize / metrics.memory.totalJSHeapSize) * 100).toFixed(1)}%
` : '- Memory metrics not available in this environment'}

### Slowest Resources
${metrics.resources?.slowestResources?.map((r, i) => 
  `${i + 1}. **${r.name}**: ${r.duration?.toFixed(2)}ms (${formatBytes(r.size || 0)})`
).join('\n') || 'No resource timing data available'}

## Performance Optimizations Status

### ✅ Detected Optimizations
${getOptimizationsList(metrics)}

### Assessment by Category

#### **Load Time Performance**
${getLoadTimeAssessment(metrics.totalLoadTime)}

#### **First Contentful Paint**
${getFCPDetailedAssessment(fcp)}

#### **Resource Efficiency**
${getResourceAssessment(metrics.resources)}

#### **DOM Optimization**
${getDOMAssessment(metrics.dom)}

## Recommendations

### 🔴 Critical Priority
${getCriticalRecommendations(metrics)}

### 🟡 High Priority  
${getHighPriorityRecommendations(metrics)}

### 🟢 Optimization Opportunities
${getOptimizationRecommendations()}

## Performance Grade: ${getPerformanceGrade(metrics.score)}

### Benchmark Comparison
- **Industry Average (Landing Pages)**: 60-70/100
- **Top 10% Performance**: 85+/100  
- **Your Score**: ${metrics.score}/100

---
*Analysis completed using Puppeteer on mobile viewport*
*Metrics collected: ${new Date().toLocaleString()}*
`;
}

function getGradeEmoji(score) {
  if (score >= 90) return '🏆';
  if (score >= 80) return '🥇';
  if (score >= 70) return '🥈';
  if (score >= 60) return '🥉';
  return '⚠️';
}

function getFCPAssessment(fcp) {
  if (fcp < 1800) return '🟢 Excellent';
  if (fcp < 3000) return '🟡 Good';
  return '🔴 Needs Improvement';
}

function getFCPDetailedAssessment(fcp) {
  if (fcp < 1800) return `**Excellent** (${fcp.toFixed(2)}ms) - Under the 1.8s threshold for good FCP`;
  if (fcp < 3000) return `**Good** (${fcp.toFixed(2)}ms) - Within acceptable range but could be optimized`;
  return `**Poor** (${fcp.toFixed(2)}ms) - Exceeds 3s threshold, immediate optimization needed`;
}

function getLoadTimeAssessment(loadTime) {
  if (loadTime < 2000) return '**Excellent** - Sub-2 second load time';
  if (loadTime < 3000) return '**Good** - Under 3 second load time';
  if (loadTime < 5000) return '**Fair** - Under 5 second load time';
  return '**Poor** - Exceeds 5 second load time';
}

function getResourceAssessment(resources) {
  const size = resources?.totalTransferSize || 0;
  const count = resources?.totalResources || 0;
  
  let assessment = '';
  if (size < 500000) assessment += '**Size: Excellent** (< 500KB) ';
  else if (size < 1000000) assessment += '**Size: Good** (< 1MB) ';
  else assessment += '**Size: Heavy** (> 1MB) ';
  
  if (count < 20) assessment += '**Count: Optimal** (< 20 resources)';
  else if (count < 50) assessment += '**Count: Moderate** (< 50 resources)';
  else assessment += '**Count: High** (> 50 resources)';
  
  return assessment;
}

function getDOMAssessment(dom) {
  const elements = dom?.domElements || 0;
  const optimized = dom?.performanceOptimizedElements || 0;
  
  let assessment = '';
  if (elements < 800) assessment += '**Complexity: Low** (< 800 elements) ';
  else if (elements < 1500) assessment += '**Complexity: Moderate** (< 1500 elements) ';
  else assessment += '**Complexity: High** (> 1500 elements) ';
  
  assessment += `**Optimized Elements: ${optimized}**`;
  
  return assessment;
}

function getOptimizationsList(metrics) {
  const optimizations = [];
  
  if (metrics.dom?.performanceOptimizedElements > 0) {
    optimizations.push(`- Performance CSS classes: ${metrics.dom.performanceOptimizedElements} elements`);
  }
  
  if (metrics.dom?.heroOptimizedElements > 0) {
    optimizations.push(`- Hero optimization: ${metrics.dom.heroOptimizedElements} elements`);
  }
  
  if (metrics.dom?.lazySections > 0) {
    optimizations.push(`- Lazy loading sections: ${metrics.dom.lazySections} sections`);
  }
  
  if (metrics.resources?.totalTransferSize < 1000000) {
    optimizations.push('- Resource size optimization (< 1MB total)');
  }
  
  return optimizations.length > 0 ? optimizations.join('\n') : '- No specific optimizations detected';
}

function getCriticalRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.totalLoadTime > 5000) {
    recommendations.push('- **URGENT**: Reduce page load time (currently > 5s)');
  }
  
  if (metrics.paint?.fcp > 3000) {
    recommendations.push('- **URGENT**: Optimize First Contentful Paint (currently > 3s)');
  }
  
  if (metrics.resources?.totalTransferSize > 2000000) {
    recommendations.push('- **URGENT**: Reduce resource size (currently > 2MB)');
  }
  
  return recommendations.length > 0 ? recommendations.join('\n') : '✅ No critical performance issues detected';
}

function getHighPriorityRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.totalLoadTime > 3000) {
    recommendations.push('- Optimize overall page load time');
  }
  
  if (metrics.resources?.totalResources > 30) {
    recommendations.push('- Reduce number of HTTP requests');
  }
  
  if (metrics.dom?.domElements > 1000) {
    recommendations.push('- Simplify DOM structure');
  }
  
  if (metrics.resources?.images > 10) {
    recommendations.push('- Implement image optimization and lazy loading');
  }
  
  return recommendations.length > 0 ? recommendations.join('\n') : '✅ Performance within recommended thresholds';
}

function getOptimizationRecommendations() {
  return `- Implement service worker for caching
- Add resource hints (preload, prefetch) for critical resources  
- Consider WebP image format for better compression
- Minimize and compress CSS/JS assets
- Enable browser caching with proper headers
- Consider implementing a CDN for static assets`;
}

function getPerformanceGrade(score) {
  if (score >= 90) return 'A+ (Outstanding)';
  if (score >= 80) return 'A (Excellent)';
  if (score >= 70) return 'B (Good)';
  if (score >= 60) return 'C (Average)';
  return 'D (Needs Improvement)';
}

// Run analysis
console.log('🔍 Starting Landing Page Performance Analysis...');
console.log('📱 Mobile-first analysis (375x667 viewport)');

try {
  const metrics = await analyzeLandingPagePerformance();
  
  if (metrics.error) {
    console.error('❌ Analysis failed:', metrics.error);
    process.exit(1);
  }
  
  const report = generateReport(metrics);
  
  // Save report to file
  fs.writeFileSync('landing-page-performance-report.md', report);
  
  console.log('\n📊 Performance Analysis Complete!');
  console.log(`📈 Overall Score: ${metrics.score}/100 ${getGradeEmoji(metrics.score)}`);
  console.log('📋 Detailed report saved to: landing-page-performance-report.md');
  
  // Output key metrics to console  
  console.log('\n=== KEY PERFORMANCE METRICS ===');
  console.log(`🕒 Total Load Time: ${metrics.totalLoadTime}ms`);
  console.log(`🎨 First Contentful Paint: ${metrics.paint?.fcp?.toFixed(2) || 'N/A'}ms`);
  console.log(`📦 Total Resources: ${metrics.resources?.totalResources || 'N/A'}`);
  console.log(`💾 Transfer Size: ${formatBytes(metrics.resources?.totalTransferSize || 0)}`);
  console.log(`🏗️ DOM Elements: ${metrics.dom?.domElements || 'N/A'}`);
  console.log(`⚡ Performance Optimized Elements: ${metrics.dom?.performanceOptimizedElements || 0}`);
  
} catch (error) {
  console.error('❌ Analysis failed:', error.message);
}