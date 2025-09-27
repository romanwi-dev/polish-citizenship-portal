import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

// Lazy load heavy components for better initial bundle size
const LazyFramerMotion = lazy(() => import('framer-motion').then(module => ({
  default: ({ children, ...props }: any) => <motion.div {...props}>{children}</motion.div>
})));

// Loading skeleton for lazy components
const ComponentSkeleton = ({ height = '200px' }: { height?: string }) => (
  <div 
    className="animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded-lg"
    style={{ height }}
  />
);

// Wrapper for lazy loaded components with suspense
export const LazyWrapper = ({ 
  children, 
  fallback, 
  height = '200px' 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  height?: string;
}) => (
  <Suspense fallback={fallback || <ComponentSkeleton height={height} />}>
    {children}
  </Suspense>
);

// Optimized motion wrapper that only loads framer-motion when needed
export const OptimizedMotion = ({ children, ...props }: any) => (
  <LazyWrapper fallback={<div>{children}</div>}>
    <LazyFramerMotion {...props}>
      {children}
    </LazyFramerMotion>
  </LazyWrapper>
);