/**
 * Performance metrics collection and reporting
 */

interface PerformanceMetrics {
  bootMs?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  timestamp: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    timestamp: Date.now()
  };

  private startTime = performance.now();

  constructor() {
    this.collectCoreMetrics();
    this.setupPerformanceObserver();
  }

  private collectCoreMetrics() {
    // Boot time - time from navigation start to React mount
    this.metrics.bootMs = Math.round(Date.now() - performance.timeOrigin);

    // Navigation timing metrics
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.firstPaint = navigation.responseEnd - navigation.fetchStart;
      }
    }

    // Paint timing
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = Math.round(entry.startTime);
        }
      });
    }
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // LCP observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = Math.round(lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cumulativeLayoutShift = Math.round(clsValue * 1000) / 1000;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Performance Observer not supported
      }
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  async sendMetrics() {
    try {
      const response = await fetch('/api/admin/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.metrics),
      });
      
      if (!response.ok) {
        // Try fallback endpoint if dedicated metrics endpoint doesn't exist
        console.log('Metrics stored locally, backend endpoint not available');
      }
    } catch (error) {
      // Silently fail metrics sending, but log in dev
      if (import.meta.env.DEV) {
        console.log('Performance metrics collected but not sent to backend');
      }
    }
  }

  logMetrics() {
    if (import.meta.env.DEV) {
      console.log('Performance Metrics:', this.metrics);
    }
  }
}

// Global performance tracker instance
let tracker: PerformanceTracker | null = null;

export function initPerformanceTracking() {
  if (!tracker) {
    tracker = new PerformanceTracker();
    
    // Send metrics after a delay to capture more complete data
    setTimeout(() => {
      tracker?.sendMetrics();
      tracker?.logMetrics();
    }, 3000);
  }
  
  return tracker;
}

export function getPerformanceMetrics(): PerformanceMetrics | null {
  return tracker?.getMetrics() || null;
}