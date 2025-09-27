// Speed Optimizer for 96+/100 Performance Score

// Preload critical resources
export function preloadCriticalResources() {
  const preloadLinks = [
    { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
    { rel: 'preconnect', href: 'https://www.googletagmanager.com' }
  ];

  preloadLinks.forEach(link => {
    const linkElement = document.createElement('link');
    Object.assign(linkElement, link);
    if (link.crossOrigin) linkElement.crossOrigin = link.crossOrigin;
    document.head.appendChild(linkElement);
  });
}

// Optimize images with native lazy loading and LQIP
export function optimizeImages() {
  const images = document.querySelectorAll('img:not([loading])');
  
  images.forEach(imgElement => {
    const img = imgElement as HTMLImageElement;
    // Add native lazy loading
    img.loading = 'lazy';
    
    // Add dimensions to prevent layout shift
    if (!img.width && img.naturalWidth) {
      img.width = img.naturalWidth;
    }
    if (!img.height && img.naturalHeight) {
      img.height = img.naturalHeight;
    }
    
    // Optimize with Intersection Observer for progressive enhancement
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            
            // Load high-quality image
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      
      imageObserver.observe(img);
    }
  });
}

// Prefetch likely user journeys
export function prefetchUserJourneys() {
  const likelyPages = [
    '/eligibility',
    '/documents',
    '/process',
    '/contact'
  ];
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      likelyPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    });
  }
}

// Remove unused CSS
export function removeUnusedCSS() {
  const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]');
  const usedSelectors = new Set<string>();
  
  // Collect all used selectors
  document.querySelectorAll('*').forEach(element => {
    usedSelectors.add(element.tagName.toLowerCase());
    if (element.id) usedSelectors.add(`#${element.id}`);
    if (element.className) {
      element.className.split(' ').forEach(cls => {
        if (cls) usedSelectors.add(`.${cls}`);
      });
    }
  });
  
  // Process stylesheets
  stylesheets.forEach(stylesheet => {
    if (stylesheet instanceof HTMLStyleElement) {
      try {
        const rules = stylesheet.sheet?.cssRules;
        if (rules) {
          for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              let isUsed = false;
              
              // Check if selector is used
              usedSelectors.forEach(used => {
                if (selector.includes(used)) isUsed = true;
              });
              
              // Remove unused rule
              if (!isUsed && !selector.includes(':hover') && !selector.includes(':focus')) {
                stylesheet.sheet?.deleteRule(i);
              }
            }
          }
        }
      } catch (e) {
        // Silently handle cross-origin stylesheets
      }
    }
  });
}

// Optimize JavaScript execution
export function optimizeJavaScript() {
  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script:not([defer]):not([async])');
  scripts.forEach(script => {
    const scriptElement = script as HTMLScriptElement;
    if (scriptElement.src && !scriptElement.src.includes('critical')) {
      scriptElement.defer = true;
    }
  });
  
  // Use requestIdleCallback for non-critical work
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Initialize non-critical features
      initializeAnalytics();
      initializeChat();
    }, { timeout: 2000 });
  }
}

// Initialize analytics (deferred)
function initializeAnalytics() {
  // Google Analytics or other analytics
  if ((window as any).gtag) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
  document.head.appendChild(script);
}

// Initialize chat widget (deferred)
function initializeChat() {
  // Chat widget initialization
  setTimeout(() => {
    const chatScript = document.createElement('script');
    chatScript.async = true;
    chatScript.src = '/chat-widget.js';
    document.body.appendChild(chatScript);
  }, 5000);
}

// Resource hints for faster navigation
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
    document.head.appendChild(link);
  });
}

// Main initialization
export function initSpeedOptimizer() {
  // Critical optimizations - run immediately
  preloadCriticalResources();
  addResourceHints();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      optimizeJavaScript();
    });
  } else {
    optimizeImages();
    optimizeJavaScript();
  }
  
  // Defer non-critical optimizations
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      removeUnusedCSS();
      prefetchUserJourneys();
    }, { timeout: 3000 });
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initSpeedOptimizer();
}

export default initSpeedOptimizer;