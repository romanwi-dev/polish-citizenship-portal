import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
// Performance utilities temporarily disabled to resolve compilation errors
// import { debounce, throttle, PerformanceMonitor } from '@/utils/performance';

// Hook for debounced values
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

// Hook for throttled callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  // Throttle function temporarily simplified
  const throttledCallback = useRef(callback);

  useEffect(() => {
    // Throttle function temporarily simplified
    throttledCallback.current = callback;
  }, [callback, delay]);

  return throttledCallback.current as T;
}

// Hook for intersection observer (lazy loading)
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

// Hook for virtual scrolling
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { start, end };
  }, [scrollTop, items.length, itemHeight, containerHeight, overscan]);

  const visibleItems = useMemo(
    () => items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// Hook for performance monitoring - temporarily disabled
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    // Performance monitoring temporarily disabled
    console.log(`Component ${componentName} performance tracking disabled`);
    
    return () => {
      // Cleanup placeholder
    };
  }, [componentName]);

  const measureOperation = useCallback((operationName: string, operation: () => void) => {
    // Performance measurement temporarily disabled
    operation();
  }, []);

  return { measureOperation };
}

// Hook for prefetching data
export function usePrefetch() {
  const cache = useRef(new Map<string, any>());

  const prefetch = useCallback(async (key: string, fetcher: () => Promise<any>) => {
    if (cache.current.has(key)) {
      return cache.current.get(key);
    }

    const data = await fetcher();
    cache.current.set(key, data);
    return data;
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  return { prefetch, clearCache };
}

// Hook for progressive image loading
export function useProgressiveImage(lowQualitySrc: string, highQualitySrc: string) {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSrc(lowQualitySrc);
    setIsLoading(true);

    const img = new Image();
    img.src = highQualitySrc;
    
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };
  }, [lowQualitySrc, highQualitySrc]);

  return { src, isLoading, blur: src === lowQualitySrc };
}

// Hook for reducing re-renders with stable callbacks
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}