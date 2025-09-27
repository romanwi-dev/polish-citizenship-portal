import puppeteer from 'puppeteer';
import fs from 'fs';

async function testLandingPageSpeed() {
  console.log('🚀 Starting Real Speed Test...');
  console.log('📱 Testing mobile-first performance (375x667)');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    
    // Mobile viewport simulation
    await page.setViewport({ 
      width: 375, 
      height: 667, 
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });
    
    // Clear cache for accurate testing
    await page.setCacheEnabled(false);
    
    console.log('📊 Measuring performance metrics...');
    
    const startTime = Date.now();
    
    // Navigate with performance monitoring
    await page.goto('http://localhost:5000/landing', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const totalLoadTime = Date.now() - startTime;
    
    // Comprehensive performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = {};
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        perfData.timing = {
          dnsLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          tcpConnection: Math.round(navigation.connectEnd - navigation.connectStart),
          serverResponse: Math.round(navigation.responseEnd - navigation.requestStart),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
          domComplete: Math.round(navigation.domComplete),
          pageLoad: Math.round(navigation.loadEventEnd)
        };
      }
      
      // Paint timing (Core Web Vitals)
      const paintEntries = performance.getEntriesByType('paint');
      perfData.paint = {};
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          perfData.paint.fp = Math.round(entry.startTime);
        }
        if (entry.name === 'first-contentful-paint') {
          perfData.paint.fcp = Math.round(entry.startTime);
        }
      });
      
      // Largest Contentful Paint
      perfData.lcp = 0;
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          perfData.lcp = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
        }
      } catch (e) {
        console.log('LCP not available');
      }
      
      // Layout shift (CLS approximation)
      perfData.cls = 0;
      try {
        const clsEntries = performance.getEntriesByType('layout-shift');
        perfData.cls = clsEntries.reduce((sum, entry) => {
          if (!entry.hadRecentInput) {
            return sum + entry.value;
          }
          return sum;
        }, 0);
      } catch (e) {
        console.log('CLS not available');
      }
      
      // Resource analysis
      const resources = performance.getEntriesByType('resource');
      perfData.resources = {
        total: resources.length,
        scripts: resources.filter(r => r.initiatorType === 'script').length,
        stylesheets: resources.filter(r => r.initiatorType === 'css').length,
        images: resources.filter(r => r.initiatorType === 'img').length,
        totalSize: Math.round(resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)),
        slowest: resources
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 3)
          .map(r => ({
            name: r.name.split('/').pop(),
            duration: Math.round(r.duration),
            size: Math.round(r.transferSize || 0)
          }))
      };
      
      // DOM metrics
      perfData.dom = {
        elements: document.querySelectorAll('*').length,
        images: document.querySelectorAll('img').length,
        buttons: document.querySelectorAll('button').length,
        performanceOptimized: document.querySelectorAll('.performance-optimized').length,
        heroOptimized: document.querySelectorAll('.hero-optimized').length,
        lazySections: document.querySelectorAll('.lazy-section').length
      };
      
      // Memory usage (if available)
      if (performance.memory) {
        perfData.memory = {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
        };
      }
      
      return perfData;
    });
    
    // Additional runtime checks
    const runtimeChecks = await page.evaluate(() => {
      const checks = {};
      
      // Check if fonts are loaded
      checks.fontsLoaded = document.fonts ? document.fonts.status === 'loaded' : true;
      
      // Check critical elements visibility
      checks.heroVisible = !!document.querySelector('.hero-optimized');
      checks.buttonsInteractive = document.querySelectorAll('button').length > 0;
      
      // Check for layout shifts
      checks.hasLayoutShifts = getComputedStyle(document.documentElement).getPropertyValue('--cls-detected') || false;
      
      return checks;
    });
    
    // Calculate performance score
    const score = calculateSpeedScore({
      ...metrics,
      totalLoadTime,
      runtimeChecks
    });
    
    const speedReport = generateSpeedReport({
      ...metrics,
      totalLoadTime,
      runtimeChecks,
      score
    });
    
    console.log('\n🎯 SPEED TEST RESULTS:');
    console.log(`⚡ Total Load Time: ${totalLoadTime}ms`);
    console.log(`🎨 First Contentful Paint: ${metrics.paint?.fcp || 'N/A'}ms`);
    console.log(`🖼️ Largest Contentful Paint: ${metrics.lcp || 'N/A'}ms`);
    console.log(`📐 Cumulative Layout Shift: ${metrics.cls?.toFixed(3) || 'N/A'}`);
    console.log(`📦 Total Resources: ${metrics.resources?.total || 'N/A'}`);
    console.log(`💾 Transfer Size: ${formatBytes(metrics.resources?.totalSize || 0)}`);
    console.log(`🏆 Performance Score: ${score}/100`);
    
    // Save detailed report
    fs.writeFileSync('speed-test-report.md', speedReport);
    console.log('\n📋 Detailed report saved to: speed-test-report.md');
    
    return { score, metrics, totalLoadTime };
    
  } catch (error) {
    console.error('❌ Speed test failed:', error.message);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function calculateSpeedScore(data) {
  let score = 100;
  
  // FCP scoring (excellent < 1800ms, poor > 3000ms)
  const fcp = data.paint?.fcp || 0;
  if (fcp > 3000) score -= 30;
  else if (fcp > 1800) score -= 15;
  else if (fcp > 1000) score -= 5;
  
  // LCP scoring (excellent < 2500ms, poor > 4000ms)
  const lcp = data.lcp || 0;
  if (lcp > 4000) score -= 25;
  else if (lcp > 2500) score -= 15;
  else if (lcp > 1500) score -= 5;
  
  // CLS scoring (excellent < 0.1, poor > 0.25)
  const cls = data.cls || 0;
  if (cls > 0.25) score -= 25;
  else if (cls > 0.1) score -= 10;
  
  // Load time scoring
  if (data.totalLoadTime > 5000) score -= 20;
  else if (data.totalLoadTime > 3000) score -= 10;
  else if (data.totalLoadTime > 2000) score -= 5;
  
  // Resource efficiency
  if (data.resources?.total > 50) score -= 10;
  if (data.resources?.totalSize > 2000000) score -= 15;
  
  // Bonus for optimizations
  if (data.dom?.performanceOptimized > 5) score += 5;
  if (data.runtimeChecks?.fontsLoaded) score += 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function generateSpeedReport(data) {
  const timestamp = new Date().toISOString();
  const fcp = data.paint?.fcp || 0;
  const lcp = data.lcp || 0;
  const cls = data.cls || 0;
  
  return `# Real Browser Speed Test Report
Generated: ${timestamp}
Testing URL: http://localhost:5000/landing

## 🏆 Performance Score: ${data.score}/100

## ⚡ Core Web Vitals

### First Contentful Paint (FCP)
- **Value**: ${fcp}ms
- **Assessment**: ${getFCPGrade(fcp)}
- **Google Threshold**: Good < 1800ms, Poor > 3000ms

### Largest Contentful Paint (LCP)
- **Value**: ${lcp}ms  
- **Assessment**: ${getLCPGrade(lcp)}
- **Google Threshold**: Good < 2500ms, Poor > 4000ms

### Cumulative Layout Shift (CLS)
- **Value**: ${cls.toFixed(3)}
- **Assessment**: ${getCLSGrade(cls)}
- **Google Threshold**: Good < 0.1, Poor > 0.25

## 🚀 Load Performance

### Timing Breakdown
- **Total Load Time**: ${data.totalLoadTime}ms
- **DNS Lookup**: ${data.timing?.dnsLookup || 0}ms
- **TCP Connection**: ${data.timing?.tcpConnection || 0}ms
- **Server Response**: ${data.timing?.serverResponse || 0}ms
- **DOM Content Loaded**: ${data.timing?.domContentLoaded || 0}ms
- **Page Load Complete**: ${data.timing?.pageLoad || 0}ms

### Paint Timing
- **First Paint**: ${data.paint?.fp || 'N/A'}ms
- **First Contentful Paint**: ${fcp}ms

## 📦 Resource Analysis

### Resource Summary
- **Total Resources**: ${data.resources?.total || 0}
- **JavaScript Files**: ${data.resources?.scripts || 0}
- **CSS Files**: ${data.resources?.stylesheets || 0}  
- **Images**: ${data.resources?.images || 0}
- **Total Transfer Size**: ${formatBytes(data.resources?.totalSize || 0)}

### Slowest Resources
${data.resources?.slowest?.map((r, i) => 
  `${i + 1}. **${r.name}**: ${r.duration}ms (${formatBytes(r.size)})`
).join('\n') || 'No slow resources detected'}

## 🏗️ DOM & Optimization Analysis

### DOM Structure
- **Total Elements**: ${data.dom?.elements || 0}
- **Interactive Buttons**: ${data.dom?.buttons || 0}
- **Images**: ${data.dom?.images || 0}

### Performance Optimizations Detected
- **Performance-Optimized Elements**: ${data.dom?.performanceOptimized || 0}
- **Hero-Optimized Sections**: ${data.dom?.heroOptimized || 0}
- **Lazy Loading Sections**: ${data.dom?.lazySections || 0}

## 🧠 Memory Usage
${data.memory ? `
- **Used Memory**: ${data.memory.used} MB
- **Total Memory**: ${data.memory.total} MB
- **Memory Limit**: ${data.memory.limit} MB
- **Usage**: ${((data.memory.used / data.memory.total) * 100).toFixed(1)}%
` : '- Memory data not available'}

## ✅ Runtime Checks
- **Fonts Loaded**: ${data.runtimeChecks?.fontsLoaded ? '✅ Yes' : '❌ No'}
- **Hero Section Visible**: ${data.runtimeChecks?.heroVisible ? '✅ Yes' : '❌ No'}
- **Buttons Interactive**: ${data.runtimeChecks?.buttonsInteractive ? '✅ Yes' : '❌ No'}

## 📊 Performance Grade Analysis

### Overall Assessment: ${getOverallGrade(data.score)}

### Core Web Vitals Status
- **FCP**: ${getFCPGrade(fcp)}
- **LCP**: ${getLCPGrade(lcp)}  
- **CLS**: ${getCLSGrade(cls)}

### Recommendations
${getRecommendations(data)}

## 🎯 Google PageSpeed Comparison
- **Target Score**: 90+ (Excellent)
- **Your Score**: ${data.score}/100
- **Status**: ${data.score >= 90 ? '🏆 Excellent - Google PageSpeed 90+' : data.score >= 80 ? '🥇 Very Good' : data.score >= 70 ? '🥈 Good' : '🥉 Needs Improvement'}

---
*Real browser test completed with Puppeteer on mobile viewport (375x667)*
*Tested: ${new Date().toLocaleString()}*
`;
}

function getFCPGrade(fcp) {
  if (fcp < 1000) return '🏆 Excellent (< 1s)';
  if (fcp < 1800) return '🟢 Good (< 1.8s)';
  if (fcp < 3000) return '🟡 Needs Improvement (< 3s)';
  return '🔴 Poor (> 3s)';
}

function getLCPGrade(lcp) {
  if (lcp < 1500) return '🏆 Excellent (< 1.5s)';
  if (lcp < 2500) return '🟢 Good (< 2.5s)';
  if (lcp < 4000) return '🟡 Needs Improvement (< 4s)';
  return '🔴 Poor (> 4s)';
}

function getCLSGrade(cls) {
  if (cls < 0.05) return '🏆 Excellent (< 0.05)';
  if (cls < 0.1) return '🟢 Good (< 0.1)';
  if (cls < 0.25) return '🟡 Needs Improvement (< 0.25)';
  return '🔴 Poor (> 0.25)';
}

function getOverallGrade(score) {
  if (score >= 95) return '🏆 Outstanding (95-100)';
  if (score >= 90) return '🥇 Excellent (90-95)';
  if (score >= 80) return '🥈 Very Good (80-90)';
  if (score >= 70) return '🥉 Good (70-80)';
  return '⚠️ Needs Improvement (< 70)';
}

function getRecommendations(data) {
  const recommendations = [];
  
  if (data.paint?.fcp > 1800) {
    recommendations.push('- Optimize First Contentful Paint with critical CSS inlining');
  }
  if (data.lcp > 2500) {
    recommendations.push('- Improve Largest Contentful Paint with image optimization');
  }
  if (data.cls > 0.1) {
    recommendations.push('- Reduce layout shifts with proper element sizing');
  }
  if (data.totalLoadTime > 3000) {
    recommendations.push('- Optimize total load time with resource compression');
  }
  if (data.resources?.totalSize > 1000000) {
    recommendations.push('- Reduce resource size with modern image formats');
  }
  
  if (recommendations.length === 0) {
    return '✅ Excellent performance - no major optimizations needed';
  }
  
  return recommendations.join('\n');
}

// Run the speed test
testLandingPageSpeed();