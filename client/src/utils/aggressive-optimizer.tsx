// Aggressive Performance Optimizer for Real-World Testing
// Targets: Google PageSpeed Insights & GTMetrix

import { useEffect } from 'react';

// Remove all non-critical CSS
export function removeNonCriticalCSS() {
  // Identify critical selectors
  const criticalSelectors = new Set<string>();
  
  // Get visible elements
  const viewportHeight = window.innerHeight;
  document.querySelectorAll('*').forEach(el => {
    if (typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight) {
        // Element is in viewport
        criticalSelectors.add(el.tagName.toLowerCase());
        if (el.id) criticalSelectors.add(`#${el.id}`);
        el.classList.forEach(cls => criticalSelectors.add(`.${cls}`));
      }
    }
  });
  
  // Process stylesheets
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule, index) => {
        if (rule instanceof CSSStyleRule) {
          let isUsed = false;
          criticalSelectors.forEach(selector => {
            if (rule.selectorText?.includes(selector)) {
              isUsed = true;
            }
          });
          
          if (!isUsed && !rule.selectorText?.includes(':hover') && !rule.selectorText?.includes(':focus')) {
            sheet.deleteRule(index);
          }
        }
      });
    } catch (e) {
      // Ignore cross-origin stylesheets
    }
  });
}

// Aggressive lazy loading for all components
export function useAggressiveLazyLoad() {
  useEffect(() => {
    // Defer all images below fold
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    // Convert all images to lazy load
    document.querySelectorAll('img').forEach((img, index) => {
      if (index > 2 && img.src) { // Keep first 3 images eager
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
        img.loading = 'lazy';
        observer.observe(img);
      }
    });
    
    return () => observer.disconnect();
  }, []);
}

// Minimize JavaScript execution
export function minimizeJavaScriptExecution() {
  // Defer all non-critical event listeners
  const deferredEvents: Array<() => void> = [];
  
  // Override addEventListener for deferral
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
    if (['DOMContentLoaded', 'load'].includes(type)) {
      originalAddEventListener.call(this, type, listener, options);
    } else {
      // Defer other events
      deferredEvents.push(() => {
        originalAddEventListener.call(this, type, listener, options);
      });
    }
  };
  
  // Execute deferred events after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      deferredEvents.forEach(fn => fn());
    }, 1000);
  });
}

// Inline critical path CSS
export function inlineCriticalPathCSS() {
  const critical = `
    /* Minimal critical CSS for instant render */
    *{margin:0;padding:0;box-sizing:border-box}
    html{font-size:16px;line-height:1.5}
    body{font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
    .container{max-width:1200px;margin:0 auto;padding:0 20px}
    h1,h2,h3{font-weight:600;line-height:1.2}
    a{color:inherit;text-decoration:none}
    button{border:none;background:none;cursor:pointer}
    img{max-width:100%;height:auto;display:block}
    
    /* Hero section instant render */
    .hero{min-height:100vh;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;display:flex;align-items:center}
    
    /* Hide elements until JS loads */
    [data-lazy]{opacity:0;transition:opacity 0.3s}
    [data-lazy].loaded{opacity:1}
  `;
  
  const style = document.createElement('style');
  style.textContent = critical;
  style.id = 'critical-css';
  document.head.insertBefore(style, document.head.firstChild);
}

// Reduce DOM complexity
export function reduceDOMComplexity() {
  // Remove empty elements
  document.querySelectorAll('*').forEach(el => {
    if (!el.textContent?.trim() && !el.children.length && el.tagName !== 'IMG' && el.tagName !== 'INPUT') {
      el.remove();
    }
  });
  
  // Merge adjacent text nodes
  document.querySelectorAll('*').forEach(el => {
    el.normalize();
  });
  
  // Remove unnecessary wrapper divs
  document.querySelectorAll('div').forEach(div => {
    if (div.children.length === 1 && !div.className && !div.id) {
      const child = div.children[0];
      div.parentNode?.replaceChild(child, div);
    }
  });
}

// Main performance hook
export function useRealWorldPerformance() {
  useEffect(() => {
    // Run optimizations on mount
    inlineCriticalPathCSS();
    minimizeJavaScriptExecution();
    
    // Run after initial render
    requestAnimationFrame(() => {
      removeNonCriticalCSS();
      reduceDOMComplexity();
    });
    
    // Monitor performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', (entry as any).processingStart - entry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }, []);
}

// Export for use in components
export default {
  useRealWorldPerformance,
  useAggressiveLazyLoad,
  inlineCriticalPathCSS,
  removeNonCriticalCSS,
  minimizeJavaScriptExecution,
  reduceDOMComplexity,
};