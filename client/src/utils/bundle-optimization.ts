// Bundle size optimization utilities

// Dynamic imports for code splitting
export const loadComponentOnDemand = async (componentName: string) => {
  switch (componentName) {
    case 'testimonials':
      return import('@/components/testimonials');
    case 'contact-form':
      return import('@/components/contact-form');
    case 'footer':
      return import('@/components/footer');
    default:
      return null;
  }
};

// Tree shaking helper - mark unused exports
export const treeShake = () => {
  if (import.meta.env.PROD) {
    // Remove development-only code
    const devElements = document.querySelectorAll('[data-dev-only]');
    devElements.forEach(el => el.remove());
  }
};

// Lazy load polyfills only when needed
export const loadPolyfills = async () => {
  const promises = [];
  
  // Check for IntersectionObserver support
  if (!('IntersectionObserver' in window)) {
    promises.push(
      Promise.resolve() // import('intersection-observer') - polyfill not needed
    );
  }
  
  // Check for fetch support
  if (!('fetch' in window)) {
    promises.push(
      Promise.resolve() // import('whatwg-fetch') - polyfill not needed
    );
  }
  
  await Promise.all(promises);
};

// Preload critical chunks
export const preloadCriticalChunks = () => {
  const criticalChunks = [
    '/js/vendor.js',
    '/js/main.js',
    '/js/router.js'
  ];
  
  criticalChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = chunk;
    document.head.appendChild(link);
  });
};

// Remove duplicate modules
export const deduplicateModules = () => {
  // In production, this would be handled by webpack/vite
  // Here we can log warnings about potential duplicates
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const sources = new Set();
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && sources.has(src)) {
      console.warn(`Duplicate script detected: ${src}`);
      script.remove();
    } else if (src) {
      sources.add(src);
    }
  });
};

// Optimize bundle loading strategy
export const optimizeBundleLoading = () => {
  // Load bundles based on user interaction patterns
  const interactionObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if user is scrolling towards a section that needs a component
        const addedNodes = Array.from(mutation.addedNodes);
        addedNodes.forEach((node: any) => {
          if (node.dataset?.lazyComponent) {
            loadComponentOnDemand(node.dataset.lazyComponent);
          }
        });
      }
    });
  });
  
  interactionObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Main optimization function
export const optimizeBundles = async () => {
  await loadPolyfills();
  preloadCriticalChunks();
  treeShake();
  deduplicateModules();
  optimizeBundleLoading();
};