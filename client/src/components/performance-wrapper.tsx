import React, { memo, useEffect, useState, useCallback, useMemo, useRef } from 'react';

// Custom intersection observer hook
function useInView(options: { threshold?: number; rootMargin?: string; triggerOnce?: boolean } = {}) {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setInView(isIntersecting);
        
        if (isIntersecting && triggerOnce) {
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, inView };
}

// Performance wrapper for lazy loading heavy components
export const PerformanceWrapper = memo(function PerformanceWrapper({ 
  children, 
  threshold = 0.1,
  rootMargin = '100px',
  fallback = null
}: {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
}) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (inView && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [inView, hasLoaded]);

  return (
    <div ref={ref}>
      {hasLoaded ? children : fallback}
    </div>
  );
});

// Resource prefetcher for critical resources
export const ResourcePrefetcher = memo(function ResourcePrefetcher() {
  useEffect(() => {
    // Prefetch critical resources
    const prefetchResources = () => {
      // Prefetch fonts
      const link1 = document.createElement('link');
      link1.rel = 'preload';
      link1.as = 'font';
      link1.type = 'font/woff2';
      link1.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
      link1.crossOrigin = 'anonymous';
      document.head.appendChild(link1);

      // Prefetch critical images
      const criticalImages = [
        '/hero-bg.jpg',
        '/logo.svg',
        '/polish-flag.svg'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });

      // DNS prefetch for external domains
      const dnsPreconnect = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://polishcitizenship.typeform.com'
      ];

      dnsPreconnect.forEach(origin => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = origin;
        document.head.appendChild(link);

        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = origin;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      });
    };

    // Run prefetching after initial render
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchResources);
    } else {
      setTimeout(prefetchResources, 0);
    }
  }, []);

  return null;
});

// Image optimization wrapper
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMGUwZTAiLz48L3N2Zz4='
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    if (priority) {
      setImageSrc(src);
      setIsLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
          };
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, priority]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
});

// Performance monitoring hook
export function usePerformanceOptimization() {
  useEffect(() => {
    // Enable smooth scrolling with performance
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Reduce motion for accessibility
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    // Optimize animations during scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);
}

// Memory optimization hook
export function useMemoryOptimization() {
  useEffect(() => {
    // Clear unused memory periodically
    const clearMemory = () => {
      if ('gc' in window) {
        (window as any).gc();
      }
    };

    const interval = setInterval(clearMemory, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);
}

// Batch update hook for reducing re-renders
export function useBatchedUpdates<T>(initialValue: T, delay = 100) {
  const [value, setValue] = useState(initialValue);
  const [pendingValue, setPendingValue] = useState(initialValue);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setValue(pendingValue);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [pendingValue, delay]);
  
  return [value, setPendingValue] as const;
}

// Virtual list component for long lists
export const VirtualList = memo(function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = useMemo(() => 
    items.slice(visibleRange.startIndex, visibleRange.endIndex),
    [items, visibleRange]
  );
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={visibleRange.startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});