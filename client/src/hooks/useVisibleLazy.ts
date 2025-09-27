import { useState, useEffect, useRef, lazy, ComponentType } from 'react';

/**
 * Hook for lazy loading components only when they become visible
 * Uses Intersection Observer API for performance
 */
export function useVisibleLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  threshold = 0.1
): [T | null, boolean, React.RefObject<HTMLDivElement>] {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !Component && !isLoading) {
          setIsLoading(true);
          importFn()
            .then((module) => {
              setComponent(() => module.default);
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
            });
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [importFn, threshold, Component, isLoading]);

  return [Component, isLoading, ref];
}

/**
 * Higher-order component for lazy loading below-the-fold components
 */
export function withVisibleLazy<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ComponentType
) {
  return function VisibleLazyComponent(props: P) {
    const [Component, isLoading, ref] = useVisibleLazy(importFn);
    
    const FallbackComponent = fallback || (() => (
      <div style={{ height: 1 }} aria-hidden="true" />
    ));

    if (!Component) {
      return (
        <div ref={ref}>
          {isLoading ? <FallbackComponent /> : <div style={{ height: 1 }} />}
        </div>
      );
    }

    return <Component {...props} />;
  };
}