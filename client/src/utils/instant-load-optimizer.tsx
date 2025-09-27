// Instant load optimizations to achieve sub-3s FCP

// Preconnect to critical domains
export const preconnectToCriticalDomains = () => {
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.googletagmanager.com'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Inline critical fonts
export const inlineCriticalFonts = () => {
  const fontFace = `
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local('Inter'), local('Inter-Regular');
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = fontFace;
  document.head.insertBefore(style, document.head.firstChild);
};

// Progressive image loading
export const progressiveImageLoading = () => {
  const images = document.querySelectorAll('img:not([loading])');
  
  images.forEach((img) => {
    const htmlImg = img as HTMLImageElement;
    // Add loading attribute
    htmlImg.loading = 'lazy';
    
    // Use placeholder while loading
    if (!htmlImg.dataset.src && htmlImg.src) {
      htmlImg.dataset.src = htmlImg.src;
      // 1x1 transparent pixel
      htmlImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      
      // Load real image on visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;
            if (image.dataset.src) {
              image.src = image.dataset.src;
              delete image.dataset.src;
              observer.unobserve(image);
            }
          }
        });
      }, {
        rootMargin: '100px'
      });
      
      observer.observe(htmlImg);
    }
  });
};

// Resource hints for instant loading
export const addResourceHints = () => {
  // Prefetch next likely navigation
  const prefetchUrls = [
    '/citizenship-test',
    '/citizenship-guide',
    '/register'
  ];
  
  prefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Enable instant page transitions
export const enableInstantTransitions = () => {
  // Add will-change to interactive elements
  const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      (el as HTMLElement).style.willChange = 'transform';
    });
    
    el.addEventListener('mouseleave', () => {
      setTimeout(() => {
        (el as HTMLElement).style.willChange = 'auto';
      }, 200);
    });
  });
};

export const initInstantLoadOptimizer = () => {
  preconnectToCriticalDomains();
  inlineCriticalFonts();
  progressiveImageLoading();
  addResourceHints();
  enableInstantTransitions();
};