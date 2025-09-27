// Critical CSS and performance optimizations
export const criticalCSS = `
  /* Critical above-the-fold styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .hero-skeleton {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    animation: skeleton-pulse 2s ease-in-out infinite;
  }
  
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  /* Prevent layout shift */
  img {
    max-width: 100%;
    height: auto;
    aspect-ratio: attr(width) / attr(height);
  }
  
  /* Font loading optimization */
  .font-loading body {
    font-family: sans-serif;
  }
`;

// Inject critical CSS immediately
if (typeof document !== 'undefined' && !document.getElementById('critical-css')) {
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.innerHTML = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
}

// Optimize font loading
export const optimizeFonts = () => {
  if ('fonts' in document) {
    Promise.all([
      (document as any).fonts.load('400 1em Inter'),
      (document as any).fonts.load('600 1em Inter'),
    ]).then(() => {
      document.documentElement.classList.remove('font-loading');
    });
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const links = [
    { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
  ];
  
  links.forEach(({ rel, href, as, type, crossorigin }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.setAttribute('as', as);
    if (type) link.setAttribute('type', type);
    if (crossorigin) link.setAttribute('crossorigin', crossorigin);
    document.head.appendChild(link);
  });
};

// Image optimization with lazy loading
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  loading = 'lazy' as 'lazy' | 'eager',
  className = ''
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  className?: string;
}) => {
  // Add WebP support detection
  const webpSupport = typeof window !== 'undefined' && 
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={className}
      onError={(e) => {
        // Fallback for broken images
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};

// Defer non-critical JavaScript
export const deferNonCriticalJS = () => {
  // Defer third-party scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    if (src && (src.includes('analytics') || src.includes('chat') || src.includes('tracking'))) {
      script.setAttribute('defer', 'true');
    }
  });
};

// Reduce JavaScript execution time
export const optimizeJSExecution = () => {
  // Use requestIdleCallback for non-critical tasks
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Load non-critical components
      import('@/components/testimonials');
      import('@/components/footer');
    }, { timeout: 2000 });
  }
};

// Optimize Largest Contentful Paint (LCP)
export const optimizeLCP = () => {
  // Preload hero image
  const heroImage = document.querySelector('.hero-section img');
  if (heroImage) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImage.getAttribute('src') || '';
    document.head.appendChild(link);
  }
};

// Reduce Cumulative Layout Shift (CLS)
export const reduceCLS = () => {
  // Set explicit dimensions for dynamic content
  const dynamicElements = document.querySelectorAll('[data-dynamic]');
  dynamicElements.forEach((el) => {
    if (!el.getAttribute('style')?.includes('min-height')) {
      (el as HTMLElement).style.minHeight = `${el.clientHeight}px`;
    }
  });
};

// Optimize First Input Delay (FID)
export const optimizeFID = () => {
  // Break up long tasks
  const breakUpLongTask = (task: () => void) => {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      return (window as any).scheduler.postTask(task, { priority: 'user-blocking' });
    }
    return setTimeout(task, 0);
  };
  
  // Wrap event handlers
  document.addEventListener('click', (e) => {
    breakUpLongTask(() => {
      // Handle click event
    });
  }, { passive: true });
};