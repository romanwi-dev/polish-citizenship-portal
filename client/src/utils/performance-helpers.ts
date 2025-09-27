import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import * as React from 'react';

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Request idle callback polyfill
export const requestIdleCallbackPolyfill = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
};

// Optimize images for different screen sizes
export function getOptimizedImageSrc(
  src: string,
  width?: number,
  quality = 80
): string {
  // If it's already an optimized URL or data URL, return as is
  if (src.startsWith('data:') || src.includes('?')) {
    return src;
  }
  
  // Add optimization parameters for CDN-hosted images
  if (src.includes('cloudinary') || src.includes('unsplash')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=${width || 'auto'}&q=${quality}`;
  }
  
  return src;
}

// Cache management utilities
class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxAge: number;

  constructor(maxAge = 5 * 60 * 1000) { // Default 5 minutes
    this.maxAge = maxAge;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const globalCache = new SimpleCache();

// Performance metrics collector
export class PerformanceCollector {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  getAllMetrics(): Map<string, number> {
    const result = new Map<string, number>();
    this.metrics.forEach((values, name) => {
      result.set(name, this.getAverageMetric(name));
    });
    return result;
  }
}

export const performanceCollector = new PerformanceCollector();

// Hook for debounced values
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

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

// Hook for throttled callback
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledFn = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledFn as T;
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceCollector.recordMetric(`${componentName}_render`, renderTime);
    
    if (renderTime > 16) { // Longer than one frame (60fps)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });
}

// Browser-specific optimizations
export function enableBrowserOptimizations() {
  // Enable GPU acceleration
  if (CSS.supports('will-change', 'transform')) {
    document.documentElement.style.willChange = 'transform';
  }

  // Enable passive event listeners for better scroll performance
  const supportsPassive = (() => {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      window.addEventListener('test', null as any, options);
      window.removeEventListener('test', null as any);
    } catch (err) {
      passiveSupported = false;
    }
    return passiveSupported;
  })();

  // Override addEventListener to use passive by default for touch and wheel events
  if (supportsPassive) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
        if (typeof options !== 'object') {
          options = { passive: true, capture: Boolean(options) };
        } else if (!('passive' in options)) {
          options.passive = true;
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}

// Load priority management
export enum LoadPriority {
  Critical = 0,
  High = 1,
  Normal = 2,
  Low = 3
}

class ResourceLoader {
  private queue: Map<LoadPriority, (() => Promise<any>)[]> = new Map();

  constructor() {
    Object.values(LoadPriority).forEach(priority => {
      if (typeof priority === 'number') {
        this.queue.set(priority, []);
      }
    });
  }

  async load<T>(
    loader: () => Promise<T>,
    priority: LoadPriority = LoadPriority.Normal
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedLoader = async () => {
        try {
          const result = await loader();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };

      const queue = this.queue.get(priority)!;
      queue.push(wrappedLoader);
      
      this.processQueue();
    });
  }

  private async processQueue() {
    for (const [priority, loaders] of Array.from(this.queue.entries()).sort((a, b) => a[0] - b[0])) {
      while (loaders.length > 0) {
        const loader = loaders.shift()!;
        await loader();
      }
    }
  }
}

export const resourceLoader = new ResourceLoader();

