import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

/**
 * Optimized image component with lazy loading and performance optimizations
 */
export function LazyImage({ 
  src, 
  alt, 
  fallback,
  className = '',
  ...props 
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
  };

  return (
    <img
      src={imageError && fallback ? fallback : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '1px 1000px'
      }}
      {...props}
    />
  );
}