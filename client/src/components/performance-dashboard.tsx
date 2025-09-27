import { useState, useEffect } from 'react';

// Performance metrics tracking
interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });

  useEffect(() => {
    // Track Core Web Vitals using the Web Vitals API
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
          const firstEntry = entryList.getEntries()[0];
          if (firstEntry) {
            setMetrics(prev => ({ 
              ...prev, 
              fid: (firstEntry as any).processingStart - firstEntry.startTime 
            }));
          }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Navigation timing for FCP and TTFB
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          setMetrics(prev => ({
            ...prev,
            ttfb: navigation.responseStart - navigation.requestStart,
          }));
        }

        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
          }
        }).observe({ entryTypes: ['paint'] });

      } catch (error) {
        console.warn('Performance monitoring not fully supported', error);
      }
    }
  }, []);

  return metrics;
};

// Performance monitoring component (for development)
export const PerformanceDashboard = ({ showDashboard = false }: { showDashboard?: boolean }) => {
  const metrics = useWebVitals();

  if (!showDashboard || import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 font-mono">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      <div className="space-y-1">
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}</div>
        <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Waiting...'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'Calculating...'}</div>
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'Loading...'}</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'Loading...'}</div>
      </div>
    </div>
  );
};

// Image optimization hook
export const useImagePreloading = (imageSrcs: string[]) => {
  useEffect(() => {
    const preloadImages = imageSrcs.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    return () => {
      preloadImages.forEach(img => {
        img.src = '';
      });
    };
  }, [imageSrcs]);
};