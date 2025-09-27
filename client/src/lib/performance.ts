// Performance optimization utilities

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function to ensure a function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy load images using Intersection Observer
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  placeholder?: string
) {
  if (placeholder) {
    imgElement.src = placeholder;
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgElement.src = src;
          observer.unobserve(imgElement);
        }
      });
    },
    { rootMargin: '50px' }
  );
  
  observer.observe(imgElement);
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources: string[]) {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2|ttf|otf)$/i)) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback = 
  window.requestIdleCallback ||
  function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      } as IdleDeadline);
    }, 1);
  };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id: number) {
    clearTimeout(id);
  };

/**
 * Measure performance of a function
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  func: T,
  label: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    // Performance logging removed for production
    return result;
  }) as T;
}

/**
 * Create a memoized version of a function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Preconnect to external domains
 */
export function preconnectDomains(domains: string[]) {
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
    
    // Also add dns-prefetch as a fallback
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = domain;
    document.head.appendChild(dnsPrefetch);
  });
}

/**
 * Load script dynamically
 */
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}