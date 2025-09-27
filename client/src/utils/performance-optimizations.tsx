import { lazy } from 'react';

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
};

// Optimize images with lazy loading
export const optimizeImages = () => {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img: any) => {
      img.src = img.dataset.src;
      img.loading = 'lazy';
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const lazyloadImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          imageObserver.unobserve(img);
        }
      });
    });
    lazyloadImages.forEach((img) => imageObserver.observe(img));
  }
};

// Reduce bundle size by using dynamic imports
export const loadNonCriticalResources = async () => {
  // Load analytics after page is interactive
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      // Load analytics scripts here
      console.log('Loading non-critical resources');
    });
  }
};

// Optimize CSS delivery
export const optimizeCSSDelivery = () => {
  // Remove unused CSS classes
  const removeUnusedCSS = () => {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach((stylesheet) => {
      const href = (stylesheet as HTMLLinkElement).href;
      if (href && href.includes('unused')) {
        stylesheet.remove();
      }
    });
  };
  
  if (document.readyState === 'complete') {
    removeUnusedCSS();
  } else {
    window.addEventListener('load', removeUnusedCSS);
  }
};

// Enable resource hints
export const enableResourceHints = () => {
  // DNS prefetch for external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Initialize all optimizations
export const initializeOptimizations = () => {
  preloadCriticalResources();
  optimizeImages();
  loadNonCriticalResources();
  optimizeCSSDelivery();
  enableResourceHints();
};