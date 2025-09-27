import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect width="1" height="1" fill="%23f3f4f6"/%3E%3C/svg%3E',
  srcSet,
  sizes,
  loading = 'lazy',
  fetchPriority = 'auto',
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the image
            const img = new Image();
            img.src = src;
            if (srcSet) img.srcset = srcSet;
            
            img.onload = () => {
              setImageSrc(src);
              setImageLoaded(true);
            };
            
            // Stop observing this image
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, srcSet]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        imageLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      width={width}
      height={height}
      srcSet={imageLoaded ? srcSet : undefined}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      onLoad={() => setImageLoaded(true)}
    />
  );
}