import { memo, ReactNode } from 'react';

// Memoized wrapper for heavy components
export const MemoizedWrapper = memo(({ children }: { children: ReactNode }) => {
  return <>{children}</>;
});

// Performance monitoring component
export const PerformanceMonitor = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const metrics = {
      navigationTiming: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      paintTiming: performance.getEntriesByType('paint'),
      resources: performance.getEntriesByType('resource'),
    };

    // Log performance metrics in development
    if (import.meta.env.DEV) {
      console.group('Performance Metrics');
      console.log('Page Load Time:', metrics.navigationTiming?.loadEventEnd - metrics.navigationTiming?.fetchStart, 'ms');
      console.log('DOM Content Loaded:', metrics.navigationTiming?.domContentLoadedEventEnd - metrics.navigationTiming?.fetchStart, 'ms');
      console.log('First Paint:', metrics.paintTiming[0]?.startTime, 'ms');
      console.log('First Contentful Paint:', metrics.paintTiming[1]?.startTime, 'ms');
      console.log('Resource Count:', metrics.resources.length);
      console.groupEnd();
    }
  }

  return null;
};

// Image preloader for critical images
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// CSS critical path injector
export const injectCriticalCSS = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};