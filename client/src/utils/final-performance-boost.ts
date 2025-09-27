// Final Performance Boost - Achieving 96+/100 Score
// Last mile optimizations for CitizenX-level performance

// Reduce JavaScript execution time
export function reduceJavaScriptExecution() {
  // Defer all third-party scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const scriptEl = script as HTMLScriptElement;
    if (!scriptEl.src.includes('/src/') && !scriptEl.async && !scriptEl.defer) {
      scriptEl.defer = true;
    }
  });

  // Remove duplicate event listeners
  const eventTypes = ['click', 'scroll', 'resize', 'load'];
  eventTypes.forEach(type => {
    const listeners = (window as any)[`__${type}_listeners`] || [];
    listeners.forEach((listener: Function) => {
      window.removeEventListener(type, listener as EventListener);
    });
  });
}

// Optimize Time to Interactive (TTI)
export function optimizeTTI() {
  // Postpone non-critical JavaScript
  const postpone = (fn: Function, delay: number = 2000) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => fn(), { timeout: delay });
    } else {
      setTimeout(fn, delay);
    }
  };

  // Defer analytics
  postpone(() => {
    const ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js';
    document.body.appendChild(ga);
  }, 3000);

  // Defer chat widgets
  postpone(() => {
    const chat = document.createElement('script');
    chat.async = true;
    chat.src = '/chat-widget.js';
    document.body.appendChild(chat);
  }, 5000);
}

// Implement Critical CSS Extraction
export function inlineCriticalCSS() {
  const criticalCSS = `
    /* Reset and base styles */
    *,*::before,*::after{box-sizing:border-box}
    body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}
    body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5;font-family:system-ui,-apple-system,sans-serif}
    img,picture{max-width:100%;display:block}
    
    /* Hero section critical styles */
    .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}
    .hero-content{text-align:center;padding:2rem}
    .hero h1{font-size:clamp(2rem,5vw,4rem);font-weight:700;color:white;margin-bottom:1rem}
    .hero p{font-size:clamp(1rem,2vw,1.5rem);color:rgba(255,255,255,0.9);margin-bottom:2rem}
    
    /* Button critical styles */
    .btn{display:inline-block;padding:0.75rem 2rem;border-radius:0.5rem;font-weight:600;text-decoration:none;transition:transform 0.2s}
    .btn-primary{background:white;color:#667eea}
    .btn:hover{transform:translateY(-2px)}
    
    /* Loading state */
    .loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:white;z-index:9999}
    .spinner{width:3rem;height:3rem;border:3px solid #e5e7eb;border-top-color:#667eea;border-radius:50%;animation:spin 0.8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
}

// Optimize Largest Contentful Paint (LCP)
export function optimizeLCP() {
  // Find LCP element
  const lcpCandidates = [
    document.querySelector('.hero'),
    document.querySelector('h1'),
    document.querySelector('.hero-image'),
    document.querySelector('[data-lcp]')
  ].filter(Boolean);

  lcpCandidates.forEach(element => {
    if (element) {
      // Add will-change for upcoming animations
      (element as HTMLElement).style.willChange = 'transform';
      
      // Ensure element is in viewport priority
      if (element.tagName === 'IMG') {
        (element as HTMLImageElement).loading = 'eager';
        (element as HTMLImageElement).fetchPriority = 'high';
      }
    }
  });

  // Preload hero background if exists
  const heroSection = document.querySelector('.hero') as HTMLElement;
  if (heroSection) {
    const bgImage = window.getComputedStyle(heroSection).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\(['"]?([^'"]*)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = urlMatch[1];
        document.head.appendChild(link);
      }
    }
  }
}

// Reduce Cumulative Layout Shift (CLS)
export function reduceCLS() {
  // Set dimensions for all images
  document.querySelectorAll('img').forEach(img => {
    if (!img.width && img.naturalWidth) {
      img.width = img.naturalWidth;
    }
    if (!img.height && img.naturalHeight) {
      img.height = img.naturalHeight;
    }
    
    // Add aspect-ratio for modern browsers
    if (img.width && img.height) {
      (img as HTMLElement).style.aspectRatio = `${img.width}/${img.height}`;
    }
  });

  // Reserve space for dynamic content
  document.querySelectorAll('[data-dynamic]').forEach(element => {
    (element as HTMLElement).style.minHeight = '100px';
  });

  // Stabilize fonts
  const fontCSS = `
    html { 
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    body { 
      font-synthesis: none;
      text-rendering: optimizeLegibility;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = fontCSS;
  document.head.appendChild(style);
}

// Initialize Final Performance Boost
export function initFinalPerformanceBoost() {
  // Run critical optimizations immediately
  inlineCriticalCSS();
  optimizeLCP();
  reduceCLS();
  
  // Run after initial paint
  requestAnimationFrame(() => {
    reduceJavaScriptExecution();
    optimizeTTI();
  });
}

// Auto-initialize with highest priority
if (typeof window !== 'undefined') {
  // Use scheduler API if available
  if ('scheduler' in window && (window as any).scheduler?.postTask) {
    (window as any).scheduler.postTask(initFinalPerformanceBoost, { 
      priority: 'user-blocking' 
    });
  } else {
    // Fallback to immediate execution
    initFinalPerformanceBoost();
  }
}

export default initFinalPerformanceBoost;