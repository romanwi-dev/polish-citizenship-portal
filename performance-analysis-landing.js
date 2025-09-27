const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeLandingPagePerformance() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set mobile viewport for mobile-first analysis
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  
  // Enable performance monitoring
  await page.setCacheEnabled(false);
  
  const performanceMetrics = {};
  
  try {
    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to landing page
    await page.goto('http://localhost:5000/landing', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    performanceMetrics.totalLoadTime = loadTime;
    
    // Get Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        vitals.fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            vitals.lcp = entries[entries.length - 1].startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // First Input Delay would be measured on real user interaction
        vitals.fid = 0; // Simulated
        
        setTimeout(() => resolve(vitals), 2000);
      });
    });
    
    performanceMetrics.webVitals = webVitals;
    
    // Resource loading analysis
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const analysis = {
        totalResources: resources.length,
        scripts: resources.filter(r => r.name.includes('.js')).length,
        stylesheets: resources.filter(r => r.name.includes('.css')).length,
        images: resources.filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)).length,
        fonts: resources.filter(r => /\.(woff|woff2|ttf|otf)/.test(r.name)).length,
        totalTransferSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        slowestResources: resources
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
          .map(r => ({ name: r.name, duration: r.duration, size: r.transferSize }))
      };
      return analysis;
    });
    
    performanceMetrics.resources = resourceMetrics;
    
    // DOM metrics
    const domMetrics = await page.evaluate(() => {
      return {
        domElements: document.querySelectorAll('*').length,
        scriptTags: document.querySelectorAll('script').length,
        stylesheetLinks: document.querySelectorAll('link[rel="stylesheet"]').length,
        images: document.querySelectorAll('img').length,
        performanceOptimizedElements: document.querySelectorAll('.performance-optimized').length,
        heroOptimizedElements: document.querySelectorAll('.hero-optimized').length,
        lazySections: document.querySelectorAll('.lazy-section').length
      };
    });
    
    performanceMetrics.dom = domMetrics;
    
    // Memory usage
    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    performanceMetrics.memory = memoryInfo;
    
    // Network timing
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0];
      return {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    performanceMetrics.timing = navigationTiming;
    
    // Lighthouse-like scoring
    const performanceScore = calculatePerformanceScore(performanceMetrics);
    performanceMetrics.score = performanceScore;
    
  } catch (error) {
    console.error('Performance analysis error:', error);
    performanceMetrics.error = error.message;
  } finally {
    await browser.close();
  }
  
  return performanceMetrics;
}

function calculatePerformanceScore(metrics) {
  const scoring = {
    fcp: metrics.webVitals?.fcp || 0,
    lcp: metrics.webVitals?.lcp || 0,
    cls: metrics.webVitals?.cls || 0,
    loadTime: metrics.totalLoadTime || 0,
    resourceCount: metrics.resources?.totalResources || 0,
    transferSize: metrics.resources?.totalTransferSize || 0
  };
  
  // Scoring algorithm (0-100)
  let score = 100;
  
  // FCP scoring (good < 1800ms, poor > 3000ms)
  if (scoring.fcp > 3000) score -= 25;
  else if (scoring.fcp > 1800) score -= 15;
  
  // LCP scoring (good < 2500ms, poor > 4000ms)
  if (scoring.lcp > 4000) score -= 25;
  else if (scoring.lcp > 2500) score -= 15;
  
  // CLS scoring (good < 0.1, poor > 0.25)
  if (scoring.cls > 0.25) score -= 25;
  else if (scoring.cls > 0.1) score -= 15;
  
  // Load time scoring
  if (scoring.loadTime > 5000) score -= 15;
  else if (scoring.loadTime > 3000) score -= 10;
  
  // Resource efficiency
  if (scoring.resourceCount > 50) score -= 10;
  if (scoring.transferSize > 2000000) score -= 10; // 2MB
  
  return Math.max(0, Math.round(score));
}

function generateReport(metrics) {
  const report = `
# Landing Page Performance Analysis Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Overall Performance Score**: ${metrics.score}/100
- **Total Load Time**: ${metrics.totalLoadTime}ms
- **Mobile-First Analysis**: ✅ Optimized for mobile devices

## Core Web Vitals Analysis

### First Contentful Paint (FCP)
- **Value**: ${metrics.webVitals?.fcp?.toFixed(2) || 'N/A'}ms
- **Assessment**: ${getFCPAssessment(metrics.webVitals?.fcp)}
- **Target**: < 1800ms (Good), < 3000ms (Needs Improvement)

### Largest Contentful Paint (LCP)
- **Value**: ${metrics.webVitals?.lcp?.toFixed(2) || 'N/A'}ms
- **Assessment**: ${getLCPAssessment(metrics.webVitals?.lcp)}
- **Target**: < 2500ms (Good), < 4000ms (Needs Improvement)

### Cumulative Layout Shift (CLS)
- **Value**: ${metrics.webVitals?.cls?.toFixed(3) || 'N/A'}
- **Assessment**: ${getCLSAssessment(metrics.webVitals?.cls)}
- **Target**: < 0.1 (Good), < 0.25 (Needs Improvement)

## Resource Analysis

### Resource Breakdown
- **Total Resources**: ${metrics.resources?.totalResources || 'N/A'}
- **JavaScript Files**: ${metrics.resources?.scripts || 'N/A'}
- **CSS Files**: ${metrics.resources?.stylesheets || 'N/A'}
- **Images**: ${metrics.resources?.images || 'N/A'}
- **Fonts**: ${metrics.resources?.fonts || 'N/A'}
- **Total Transfer Size**: ${formatBytes(metrics.resources?.totalTransferSize || 0)}

### Slowest Resources
${metrics.resources?.slowestResources?.map(r => 
  `- ${r.name.split('/').pop()}: ${r.duration?.toFixed(2)}ms (${formatBytes(r.size || 0)})`
).join('\n') || 'N/A'}

## DOM Structure Analysis
- **Total DOM Elements**: ${metrics.dom?.domElements || 'N/A'}
- **Performance Optimized Elements**: ${metrics.dom?.performanceOptimizedElements || 'N/A'}
- **Hero Optimized Elements**: ${metrics.dom?.heroOptimizedElements || 'N/A'}
- **Lazy Loading Sections**: ${metrics.dom?.lazySections || 'N/A'}
- **Images**: ${metrics.dom?.images || 'N/A'}

## Performance Optimizations Detected
${getOptimizationStatus(metrics)}

## Memory Usage
${metrics.memory ? `
- **Used JS Heap**: ${formatBytes(metrics.memory.usedJSHeapSize)}
- **Total JS Heap**: ${formatBytes(metrics.memory.totalJSHeapSize)}
- **Heap Usage**: ${((metrics.memory.usedJSHeapSize / metrics.memory.totalJSHeapSize) * 100).toFixed(1)}%
` : '- Memory analysis not available'}

## Network Timing Breakdown
- **DNS Lookup**: ${metrics.timing?.dnsLookup?.toFixed(2) || 'N/A'}ms
- **TCP Connection**: ${metrics.timing?.tcpConnection?.toFixed(2) || 'N/A'}ms
- **Server Response**: ${metrics.timing?.serverResponse?.toFixed(2) || 'N/A'}ms
- **DOM Content Loaded**: ${metrics.timing?.domContentLoaded?.toFixed(2) || 'N/A'}ms
- **Page Load Complete**: ${metrics.timing?.pageLoad?.toFixed(2) || 'N/A'}ms

## Recommendations

### High Priority 🔴
${getHighPriorityRecommendations(metrics)}

### Medium Priority 🟡
${getMediumPriorityRecommendations(metrics)}

### Low Priority 🟢
${getLowPriorityRecommendations(metrics)}

## Performance Grade: ${getPerformanceGrade(metrics.score)}

---
*Analysis completed with mobile-first viewport (375x667)*
`;

  return report;
}

function getFCPAssessment(fcp) {
  if (!fcp) return 'Unable to measure';
  if (fcp < 1800) return '🟢 Excellent';
  if (fcp < 3000) return '🟡 Needs Improvement';
  return '🔴 Poor';
}

function getLCPAssessment(lcp) {
  if (!lcp) return 'Unable to measure';
  if (lcp < 2500) return '🟢 Excellent';
  if (lcp < 4000) return '🟡 Needs Improvement';
  return '🔴 Poor';
}

function getCLSAssessment(cls) {
  if (!cls) return 'Unable to measure';
  if (cls < 0.1) return '🟢 Excellent';
  if (cls < 0.25) return '🟡 Needs Improvement';
  return '🔴 Poor';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getOptimizationStatus(metrics) {
  const optimizations = [];
  
  if (metrics.dom?.performanceOptimizedElements > 0) {
    optimizations.push('✅ Performance-optimized CSS classes applied');
  }
  
  if (metrics.dom?.heroOptimizedElements > 0) {
    optimizations.push('✅ Hero section optimization enabled');
  }
  
  if (metrics.dom?.lazySections > 0) {
    optimizations.push('✅ Lazy loading sections implemented');
  }
  
  if (metrics.resources?.totalTransferSize < 1000000) {
    optimizations.push('✅ Resource size optimized (< 1MB)');
  }
  
  if (metrics.resources?.totalResources < 20) {
    optimizations.push('✅ Resource count optimized (< 20 resources)');
  }
  
  return optimizations.length > 0 ? optimizations.join('\n') : '⚠️ No specific optimizations detected';
}

function getHighPriorityRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.webVitals?.lcp > 4000) {
    recommendations.push('- Optimize Largest Contentful Paint (currently > 4s)');
  }
  
  if (metrics.webVitals?.fcp > 3000) {
    recommendations.push('- Improve First Contentful Paint (currently > 3s)');
  }
  
  if (metrics.totalLoadTime > 5000) {
    recommendations.push('- Reduce total page load time (currently > 5s)');
  }
  
  if (metrics.resources?.totalTransferSize > 2000000) {
    recommendations.push('- Reduce resource transfer size (currently > 2MB)');
  }
  
  return recommendations.length > 0 ? recommendations.join('\n') : '✅ No critical issues detected';
}

function getMediumPriorityRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.webVitals?.cls > 0.1) {
    recommendations.push('- Minimize Cumulative Layout Shift');
  }
  
  if (metrics.resources?.totalResources > 30) {
    recommendations.push('- Consider reducing number of resources');
  }
  
  if (metrics.dom?.domElements > 1500) {
    recommendations.push('- Optimize DOM complexity');
  }
  
  return recommendations.length > 0 ? recommendations.join('\n') : '✅ Performance within acceptable ranges';
}

function getLowPriorityRecommendations(metrics) {
  const recommendations = [
    '- Consider implementing service worker for caching',
    '- Add resource hints for external domains',
    '- Optimize font loading with font-display: swap',
    '- Consider implementing code splitting for larger applications'
  ];
  
  return recommendations.join('\n');
}

function getPerformanceGrade(score) {
  if (score >= 90) return 'A+ (Excellent)';
  if (score >= 80) return 'A (Very Good)';
  if (score >= 70) return 'B (Good)';
  if (score >= 60) return 'C (Fair)';
  return 'D (Needs Improvement)';
}

// Run analysis
(async () => {
  console.log('🔍 Starting Landing Page Performance Analysis...');
  
  try {
    const metrics = await analyzeLandingPagePerformance();
    const report = generateReport(metrics);
    
    // Save report to file
    fs.writeFileSync('landing-page-performance-report.md', report);
    
    console.log('📊 Performance Analysis Complete!');
    console.log(`📈 Overall Score: ${metrics.score}/100`);
    console.log('📋 Detailed report saved to: landing-page-performance-report.md');
    
    // Output key metrics to console
    console.log('\n=== KEY METRICS ===');
    console.log(`Load Time: ${metrics.totalLoadTime}ms`);
    console.log(`FCP: ${metrics.webVitals?.fcp?.toFixed(2) || 'N/A'}ms`);
    console.log(`LCP: ${metrics.webVitals?.lcp?.toFixed(2) || 'N/A'}ms`);
    console.log(`CLS: ${metrics.webVitals?.cls?.toFixed(3) || 'N/A'}`);
    console.log(`Resources: ${metrics.resources?.totalResources || 'N/A'}`);
    console.log(`Transfer Size: ${formatBytes(metrics.resources?.totalTransferSize || 0)}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
})();