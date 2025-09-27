import { useEffect, useState } from 'react';

// Touch gesture hook for enhanced mobile interaction
export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      // Trigger swipe events
      const swipeEvent = new CustomEvent('swipe', {
        detail: { direction: isLeftSwipe ? 'left' : 'right' }
      });
      document.dispatchEvent(swipeEvent);
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd]);

  return { touchStart, touchEnd };
};

// Progressive image loading component
export const ProgressiveImage = ({ 
  src, 
  alt, 
  className, 
  lowQualitySrc 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  lowQualitySrc?: string; 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(lowQualitySrc || src);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-70'} ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
};

// Mobile-optimized button component
export const MobileButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  size = 'default'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'default' | 'large';
}) => {
  const sizeClasses = {
    small: 'min-h-[44px] px-4 py-2 text-sm',
    default: 'min-h-[48px] px-6 py-3 text-base',
    large: 'min-h-[52px] px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        touch-target
        transition-all duration-200 ease-out
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Viewport height fix for mobile browsers
export const useViewportHeight = () => {
  useEffect(() => {
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateVH();
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);

    return () => {
      window.removeEventListener('resize', updateVH);
      window.removeEventListener('orientationchange', updateVH);
    };
  }, []);
};