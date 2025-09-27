// Performance budget monitoring for Core Web Vitals

export interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint  
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

// Target metrics for good performance
export const PERFORMANCE_BUDGET = {
  FCP: 1800, // ms
  LCP: 2500, // ms
  FID: 100, // ms
  CLS: 0.1, // score
  TTFB: 800, // ms
  totalJSSize: 200, // KB
  totalCSSSize: 50, // KB
  totalImageSize: 500, // KB
};

// Monitor Core Web Vitals
export const monitorWebVitals = () => {
  if ('PerformanceObserver' in window) {
    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
      
      if (lastEntry.startTime > PERFORMANCE_BUDGET.LCP) {
        console.warn(`LCP exceeds budget: ${lastEntry.startTime}ms > ${PERFORMANCE_BUDGET.LCP}ms`);
      }
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
    
    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        console.log('FID:', fid);
        
        if (fid > PERFORMANCE_BUDGET.FID) {
          console.warn(`FID exceeds budget: ${fid}ms > ${PERFORMANCE_BUDGET.FID}ms`);
        }
      });
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }
    
    // Monitor Cumulative Layout Shift
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          console.log('CLS:', clsScore);
          
          if (clsScore > PERFORMANCE_BUDGET.CLS) {
            console.warn(`CLS exceeds budget: ${clsScore} > ${PERFORMANCE_BUDGET.CLS}`);
          }
        }
      });
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }
  }
};

// Check bundle sizes
export const checkBundleSizes = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    
    let totalJS = 0;
    let totalCSS = 0;
    let totalImages = 0;
    
    resources.forEach((resource: any) => {
      const size = resource.transferSize / 1024; // Convert to KB
      
      if (resource.name.includes('.js')) {
        totalJS += size;
      } else if (resource.name.includes('.css')) {
        totalCSS += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) {
        totalImages += size;
      }
    });
    
    console.log(`Bundle sizes - JS: ${totalJS.toFixed(2)}KB, CSS: ${totalCSS.toFixed(2)}KB, Images: ${totalImages.toFixed(2)}KB`);
    
    if (totalJS > PERFORMANCE_BUDGET.totalJSSize) {
      console.warn(`JS bundle exceeds budget: ${totalJS.toFixed(2)}KB > ${PERFORMANCE_BUDGET.totalJSSize}KB`);
    }
    if (totalCSS > PERFORMANCE_BUDGET.totalCSSSize) {
      console.warn(`CSS bundle exceeds budget: ${totalCSS.toFixed(2)}KB > ${PERFORMANCE_BUDGET.totalCSSSize}KB`);
    }
    if (totalImages > PERFORMANCE_BUDGET.totalImageSize) {
      console.warn(`Image size exceeds budget: ${totalImages.toFixed(2)}KB > ${PERFORMANCE_BUDGET.totalImageSize}KB`);
    }
  }
};

// Reduce JavaScript execution time
export const optimizeJavaScriptExecution = () => {
  // Use requestIdleCallback for non-critical tasks
  const deferredTasks: Array<() => void> = [];
  
  const runDeferredTasks = () => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback((deadline: any) => {
        while (deadline.timeRemaining() > 0 && deferredTasks.length > 0) {
          const task = deferredTasks.shift();
          if (task) task();
        }
        
        if (deferredTasks.length > 0) {
          runDeferredTasks();
        }
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        const task = deferredTasks.shift();
        if (task) task();
        
        if (deferredTasks.length > 0) {
          runDeferredTasks();
        }
      }, 0);
    }
  };
  
  return {
    defer: (task: () => void) => {
      deferredTasks.push(task);
      runDeferredTasks();
    }
  };
};