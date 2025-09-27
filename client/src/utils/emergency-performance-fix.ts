// Emergency performance fix for CitizenX-level performance
// Prevents render-blocking resources

// Remove duplicate styles immediately
const removeDuplicateStyles = () => {
  const styles = document.querySelectorAll('style');
  const seen = new Set<string>();
  
  styles.forEach(style => {
    const content = style.innerHTML;
    if (seen.has(content)) {
      style.remove();
    } else {
      seen.add(content);
    }
  });
};

// Defer non-critical scripts
const deferNonCriticalScripts = () => {
  const scripts = document.querySelectorAll('script:not([defer]):not([async])');
  scripts.forEach(scriptElement => {
    const script = scriptElement as HTMLScriptElement;
    if (script.src && !script.src.includes('main') && !script.src.includes('vendor')) {
      script.setAttribute('defer', 'true');
    }
  });
};

// Optimize render path
const optimizeRenderPath = () => {
  // Force GPU acceleration for animations
  document.documentElement.style.transform = 'translateZ(0)';
  
  // Reduce reflows
  document.documentElement.style.willChange = 'scroll-position';
};

// Execute immediately
if (typeof window !== 'undefined') {
  removeDuplicateStyles();
  deferNonCriticalScripts();
  optimizeRenderPath();
}

export {};