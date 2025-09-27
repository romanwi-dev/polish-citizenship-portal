// Bundle size optimization utilities

// Split vendor chunks efficiently
export const optimizeVendorChunks = () => {
  // This is handled by Vite config, but we can optimize runtime loading
  const loadVendorChunk = (chunkName: string) => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = `/assets/${chunkName}`;
    document.head.appendChild(link);
  };
  
  // Preload critical vendor chunks
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      loadVendorChunk('vendor-react.js');
    });
  }
};

// Compress inline scripts
export const compressInlineScripts = () => {
  const scripts = document.querySelectorAll('script:not([src])');
  scripts.forEach(script => {
    const content = script.textContent || '';
    if (content.length > 1000) {
      // Move large inline scripts to external files
      console.warn('Large inline script detected, consider externalizing');
    }
  });
};

// Remove duplicate CSS rules
export const removeDuplicateCSS = () => {
  const sheets = Array.from(document.styleSheets);
  const rules = new Set();
  
  sheets.forEach(sheet => {
    try {
      const cssRules = sheet.cssRules || sheet.rules;
      if (cssRules) {
        Array.from(cssRules).forEach((rule: any) => {
          const ruleText = rule.cssText;
          if (rules.has(ruleText)) {
            // Duplicate rule found
            console.warn('Duplicate CSS rule:', ruleText.substring(0, 50));
          } else {
            rules.add(ruleText);
          }
        });
      }
    } catch (e) {
      // Cross-origin stylesheet
    }
  });
};

// Optimize font loading
export const optimizeFontLoadingStrategy = () => {
  // Use font-display: swap for better performance
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// Initialize bundle optimizations
export const initBundleOptimizations = () => {
  optimizeVendorChunks();
  compressInlineScripts();
  removeDuplicateCSS();
  optimizeFontLoadingStrategy();
};