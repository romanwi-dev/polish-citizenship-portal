import React, { memo, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from './lazy-image';

// Optimized Button with memoization
export const OptimizedButton = memo(function OptimizedButton({
  children,
  onClick,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  }, [onClick]);

  return (
    <Button
      onClick={handleClick}
      className={`hardware-accelerated ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
});

// Optimized Card with contain property
export const OptimizedCard = memo(function OptimizedCard({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={`contain-layout ${className || ''}`}
      {...props}
    >
      {children}
    </Card>
  );
});

// Optimized List with virtualization support
export const OptimizedList = memo(function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = '',
  virtualized = false,
  itemHeight = 80,
  containerHeight = 400
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  virtualized?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}) {
  if (!virtualized) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // Virtual scrolling implementation
  const [scrollTop, setScrollTop] = React.useState(0);
  
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
            <div 
              key={keyExtractor(item, visibleRange.startIndex + index)} 
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Optimized Section with lazy loading
export const OptimizedSection = memo(function OptimizedSection({
  children,
  className = '',
  id,
  lazyLoad = true,
  threshold = 0.1
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  lazyLoad?: boolean;
  threshold?: number;
}) {
  const [isVisible, setIsVisible] = React.useState(!lazyLoad);
  const sectionRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!lazyLoad || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, isVisible, threshold]);

  return (
    <section 
      ref={sectionRef} 
      id={id} 
      className={`contain-paint ${className}`}
    >
      {isVisible ? children : (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}
    </section>
  );
});

// Optimized Grid with lazy loading items
export const OptimizedGrid = memo(function OptimizedGrid({
  children,
  columns = 3,
  gap = 4,
  className = ''
}: {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}) {
  const gridClass = `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} gap-${gap} ${className}`;
  
  return (
    <div className={`contain-layout ${gridClass}`}>
      {children}
    </div>
  );
});

// Optimized Badge with memoization
export const OptimizedBadge = memo(function OptimizedBadge({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      className={`hardware-accelerated ${className || ''}`}
      {...props}
    >
      {children}
    </Badge>
  );
});

// Optimized Link with prefetching
export const OptimizedLink = memo(function OptimizedLink({
  href,
  children,
  prefetch = true,
  className = '',
  onClick
}: {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const handleMouseEnter = useCallback(() => {
    if (prefetch && href.startsWith('/')) {
      // Prefetch the route
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  }, [href, prefetch]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </a>
  );
});

