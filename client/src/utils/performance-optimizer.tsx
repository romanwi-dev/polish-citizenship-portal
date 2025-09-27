// CitizenX-level performance optimizations (96/100 target)

// 1. Critical CSS inlining for instant rendering
export const inlineCriticalCSS = () => {
  const criticalStyles = `
    /* Critical above-the-fold styles */
    *, ::before, ::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    .hero-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  
  const style = document.createElement('style');
  style.innerHTML = criticalStyles;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};

// 2. Image optimization with native lazy loading
export const optimizeImages = () => {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img) => {
    const htmlImg = img as HTMLImageElement;
    htmlImg.loading = 'lazy';
    htmlImg.decoding = 'async';
    
    // Add srcset for responsive images
    if (htmlImg.dataset.srcset) {
      htmlImg.srcset = htmlImg.dataset.srcset;
    }
  });
};

// 3. Resource hints for faster connections
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// 4. Font optimization with font-display swap
export const optimizeFonts = () => {
  const fontFace = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local('Inter'), local('Inter-Regular');
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: local('Inter SemiBold'), local('Inter-SemiBold');
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: local('Inter Bold'), local('Inter-Bold');
    }
  `;
  
  const style = document.createElement('style');
  style.innerHTML = fontFace;
  document.head.appendChild(style);
};

// 5. Intersection Observer for component lazy loading
export const setupIntersectionObserver = () => {
  if (!('IntersectionObserver' in window)) return;
  
  const lazyElements = document.querySelectorAll('[data-lazy]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        element.classList.add('loaded');
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  lazyElements.forEach(el => observer.observe(el));
};

// 6. Web Vitals monitoring
export const monitorWebVitals = () => {
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (import.meta.env.DEV) {
        console.log('LCP:', (lastEntry as any).renderTime || (lastEntry as any).loadTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (import.meta.env.DEV) {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          if (import.meta.env.DEV) {
            console.log('CLS:', clsValue);
          }
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// 7. Prefetch likely next pages
export const prefetchPages = () => {
  const prefetchUrls = [
    '/citizenship-test',
    '/register',
    '/citizenship-guide'
  ];
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchUrls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    });
  }
};

// 8. Optimize animations for 60fps
export const optimizeAnimations = () => {
  // Force hardware acceleration for animations
  const style = document.createElement('style');
  style.innerHTML = `
    .animated {
      will-change: transform, opacity;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `;
  document.head.appendChild(style);
  
  // Reduce animations for users who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduce-motion');
  }
};

// 9. Service Worker for caching (production only)
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently fail if service worker registration fails
      });
    });
  }
};

// 10. Main initialization function
export const initializePerformanceOptimizations = () => {
  // Critical optimizations run immediately
  inlineCriticalCSS();
  addResourceHints();
  optimizeFonts();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      setupIntersectionObserver();
      optimizeAnimations();
    });
  } else {
    optimizeImages();
    setupIntersectionObserver();
    optimizeAnimations();
  }
  
  // Defer non-critical optimizations
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchPages();
      monitorWebVitals();
      registerServiceWorker();
    });
  } else {
    setTimeout(() => {
      prefetchPages();
      monitorWebVitals();
      registerServiceWorker();
    }, 1);
  }
};

// Export for use in main.tsx
export default initializePerformanceOptimizations;