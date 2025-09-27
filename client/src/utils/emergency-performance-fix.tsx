// EMERGENCY: Fix 20.5s FCP issue immediately

// Remove ALL blocking resources
export const emergencyPerformanceFix = () => {
  // 1. Defer ALL external scripts
  document.querySelectorAll('script[src]').forEach((script: any) => {
    if (!script.async && !script.defer) {
      script.defer = true;
    }
  });

  // 2. Remove all non-critical stylesheets from initial load
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link: any) => {
    if (!link.href.includes('critical') && !link.media) {
      const newLink = link.cloneNode(true);
      newLink.media = 'print';
      newLink.onload = () => { newLink.media = 'all'; };
      link.parentNode.replaceChild(newLink, link);
    }
  });

  // 3. Lazy load ALL images
  document.querySelectorAll('img').forEach((img: any) => {
    if (!img.loading) {
      img.loading = 'lazy';
    }
    if (img.src && !img.dataset.src) {
      img.dataset.src = img.src;
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
      
      // Load on intersection
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;
            image.src = image.dataset.src || '';
            observer.unobserve(image);
          }
        });
      }, { rootMargin: '50px' });
      
      observer.observe(img);
    }
  });

  // 4. Stop all animations until page is interactive
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `;
  style.id = 'emergency-perf-styles';
  document.head.appendChild(style);
  
  // Re-enable animations after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const emergencyStyles = document.getElementById('emergency-perf-styles');
      if (emergencyStyles) {
        emergencyStyles.remove();
      }
    }, 100);
  });

  // 5. Delay all non-critical work
  const originalSetTimeout = window.setTimeout;
  (window as any).setTimeout = function(fn: any, delay?: number, ...args: any[]) {
    const actualDelay = delay || 0;
    if (document.readyState !== 'complete' && actualDelay < 1000) {
      return originalSetTimeout.call(window, fn, Math.max(actualDelay, 1000), ...args);
    }
    return originalSetTimeout.call(window, fn, actualDelay, ...args);
  };
};

// Run immediately
if (typeof window !== 'undefined') {
  emergencyPerformanceFix();
}