// Performance utilities for optimization

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load components with retry logic
export async function lazyLoadWithRetry(
  componentLoader: () => Promise<any>,
  retries = 3,
  delay = 1000
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await componentLoader();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Preload critical resources
export function preloadResources(resources: string[]) {
  if (typeof document === 'undefined') return;
  
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
}

// Optimize font loading
export function optimizeFontLoading() {
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.remove('font-loading');
      document.documentElement.classList.add('font-loaded');
    });
  }
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private items: any[];
  private visibleItems: number;
  private scrollTop: number = 0;
  
  constructor(container: HTMLElement, itemHeight: number, items: any[]) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight);
    
    this.setupScrollListener();
  }
  
  private setupScrollListener() {
    this.container.addEventListener('scroll', throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    }, 16)); // 60fps
  }
  
  private render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleItems + 1,
      this.items.length
    );
    
    // Return visible items for rendering
    return this.items.slice(startIndex, endIndex);
  }
}

// Resource hints for next navigation
export function addResourceHints(url: string) {
  // DNS prefetch
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = new URL(url).origin;
  document.head.appendChild(dnsPrefetch);
  
  // Preconnect
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = new URL(url).origin;
  document.head.appendChild(preconnect);
  
  // Prefetch the page
  const prefetch = document.createElement('link');
  prefetch.rel = 'prefetch';
  prefetch.href = url;
  document.head.appendChild(prefetch);
}

// Measure Web Vitals
export function measureWebVitals() {
  if ('PerformanceObserver' in window) {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });
    
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as any;
        const delay = fidEntry.processingStart - fidEntry.startTime;
        console.log('FID:', delay);
      }
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          console.log('CLS:', clsValue);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Optimize images on the fly
export function optimizeImageSrc(src: string, width?: number): string {
  // If using a CDN or image service, add optimization parameters
  if (src.includes('cloudinary') || src.includes('imagekit')) {
    const params = [];
    if (width) params.push(`w_${width}`);
    params.push('f_auto', 'q_auto');
    
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}${params.join(',')}`;
  }
  
  return src;
}

// Request idle callback polyfill
export const requestIdleCallback = 
  window.requestIdleCallback ||
  function(cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      } as IdleDeadline);
    }, 1);
  };

// Cancel idle callback polyfill  
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function(id: number) {
    clearTimeout(id);
  };