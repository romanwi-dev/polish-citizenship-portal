// Image optimization utilities for better performance

// Lazy load images that are below the fold
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    images.forEach((img) => imageObserver.observe(img));
  }
};

// Convert images to WebP format for better compression
export const getOptimizedImageUrl = (url: string): string => {
  // For now, return the original URL
  // In production, this would convert to WebP or use a CDN
  return url;
};

// Preload critical images
export const preloadImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

// Add responsive image sizes
export const getResponsiveImageSrcSet = (baseUrl: string): string => {
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

// Image placeholder for lazy loading
export const getImagePlaceholder = (width: number, height: number): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6'/%3E%3C/svg%3E`;
};