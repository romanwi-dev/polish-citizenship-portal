import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

// Debounce function for optimizing frequent function calls
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle function for limiting function execution rate
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Intersection Observer for lazy loading and infinite scroll
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

// Virtual scrolling hook for long lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

// Performance monitoring
export function measurePerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;

    return {
      start: () => performance.mark(startMark),
      end: () => {
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);
        const measure = performance.getEntriesByName(measureName)[0];
        console.log(`${name} took ${measure.duration.toFixed(2)}ms`);
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(measureName);
        return measure.duration;
      },
    };
  }
  return {
    start: () => {},
    end: () => 0,
  };
}

// Optimize images with lazy loading and responsive sizing
export function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  priority = false 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  priority?: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const isVisible = useIntersectionObserver(imgRef, {
    rootMargin: '50px',
  });

  return (
    <img
      ref={imgRef}
      src={priority || isVisible ? src : undefined}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

// Preload critical resources
export function preloadResource(url: string, type: 'script' | 'style' | 'image') {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (type === 'script') {
      link.as = 'script';
    } else if (type === 'style') {
      link.as = 'style';
    } else if (type === 'image') {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  }
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof window !== 'undefined') {
    // Preconnect to external domains
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for third-party services
    const prefetchDomains = [
      'https://polishcitizenship.typeform.com',
    ];

    prefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

// Cache management utilities
export const cache = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.expiry && parsed.expiry < Date.now()) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.value;
      }
      return null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any, ttl?: number) => {
    try {
      const item = {
        value,
        expiry: ttl ? Date.now() + ttl : null,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch {
      // Handle storage quota exceeded
      console.warn('LocalStorage quota exceeded');
    }
  },
  
  clear: (pattern?: string) => {
    if (pattern) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      localStorage.clear();
    }
  },
};

// Request batching for API calls
export class RequestBatcher<T> {
  private queue: Array<{ key: string; resolve: (value: T) => void }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchSize: number;
  private delay: number;
  private batchFn: (keys: string[]) => Promise<Record<string, T>>;

  constructor(
    batchFn: (keys: string[]) => Promise<Record<string, T>>,
    batchSize = 10,
    delay = 50
  ) {
    this.batchFn = batchFn;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  async get(key: string): Promise<T> {
    return new Promise((resolve) => {
      this.queue.push({ key, resolve });
      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.timeout) clearTimeout(this.timeout);

    if (this.queue.length >= this.batchSize) {
      this.executeBatch();
    } else {
      this.timeout = setTimeout(() => this.executeBatch(), this.delay);
    }
  }

  private async executeBatch() {
    const batch = this.queue.splice(0, this.batchSize);
    if (batch.length === 0) return;

    const keys = batch.map(item => item.key);
    try {
      const results = await this.batchFn(keys);
      batch.forEach(({ key, resolve }) => {
        resolve(results[key]);
      });
    } catch (error) {
      batch.forEach(({ resolve }) => {
        resolve(null as T);
      });
    }
  }
}