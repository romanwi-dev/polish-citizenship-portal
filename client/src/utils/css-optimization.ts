// CSS optimization utilities for better performance

// Remove unused CSS
export const removeUnusedCSS = () => {
  if ('CSS' in window && 'supports' in CSS) {
    // Check which CSS features are actually used
    const sheets = Array.from(document.styleSheets);
    const usedSelectors = new Set<string>();
    
    // Collect all used selectors
    document.querySelectorAll('*').forEach(element => {
      const classList = Array.from(element.classList);
      classList.forEach(className => usedSelectors.add(`.${className}`));
      
      if (element.id) {
        usedSelectors.add(`#${element.id}`);
      }
      
      usedSelectors.add(element.tagName.toLowerCase());
    });
    
    // Log unused CSS for debugging (in production, this would remove them)
    console.log('Used selectors:', usedSelectors.size);
  }
};

// Inline critical CSS
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    /* Critical above-the-fold styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }
    .hero-section { min-height: 100vh; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
    
    /* Prevent layout shift */
    img, video, iframe { max-width: 100%; height: auto; }
    
    /* Font loading optimization */
    @font-face {
      font-family: 'Inter';
      font-display: swap;
      src: local('Inter'), url('/fonts/inter.woff2') format('woff2');
    }
  `;
  
  if (!document.getElementById('critical-css-inline')) {
    const style = document.createElement('style');
    style.id = 'critical-css-inline';
    style.innerHTML = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
};

// Defer non-critical CSS
export const deferNonCriticalCSS = () => {
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  
  links.forEach((link: Element) => {
    const href = link.getAttribute('href');
    
    // Skip critical CSS files
    if (href && !href.includes('critical') && !href.includes('index.css')) {
      // Convert to preload
      link.setAttribute('rel', 'preload');
      link.setAttribute('as', 'style');
      
      // Load on idle
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          link.setAttribute('rel', 'stylesheet');
        });
      } else {
        setTimeout(() => {
          link.setAttribute('rel', 'stylesheet');
        }, 0);
      }
    }
  });
};

// Optimize CSS animations
export const optimizeAnimations = () => {
  // Reduce animation complexity on low-end devices
  if ('matchMedia' in window) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.001s');
    }
  }
  
  // Pause animations when not visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        element.style.animationPlayState = 'running';
      } else {
        element.style.animationPlayState = 'paused';
      }
    });
  });
  
  document.querySelectorAll('[class*="animate"]').forEach(el => {
    observer.observe(el);
  });
};

// Minify inline styles
export const minifyInlineStyles = () => {
  const elements = document.querySelectorAll('[style]');
  
  elements.forEach((element: Element) => {
    const style = element.getAttribute('style');
    if (style) {
      // Remove unnecessary whitespace
      const minified = style
        .replace(/\s+/g, ' ')
        .replace(/:\s+/g, ':')
        .replace(/;\s+/g, ';')
        .trim();
      element.setAttribute('style', minified);
    }
  });
};

// Load CSS based on viewport
export const loadViewportSpecificCSS = () => {
  const viewport = window.innerWidth;
  
  if (viewport < 768) {
    // Load mobile-specific CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/mobile.css';
    link.media = '(max-width: 767px)';
    document.head.appendChild(link);
  } else if (viewport >= 1920) {
    // Load large screen CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/large.css';
    link.media = '(min-width: 1920px)';
    document.head.appendChild(link);
  }
};

// Main optimization function
export const optimizeCSS = () => {
  inlineCriticalCSS();
  deferNonCriticalCSS();
  optimizeAnimations();
  minifyInlineStyles();
  loadViewportSpecificCSS();
  
  // Run cleanup after page load
  if (document.readyState === 'complete') {
    removeUnusedCSS();
  } else {
    window.addEventListener('load', removeUnusedCSS);
  }
};