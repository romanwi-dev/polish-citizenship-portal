import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedProgressRingProps {
  progress: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  showPercentage?: boolean;
  duration?: number; // animation duration in ms
  delay?: number; // animation delay in ms
}

const colorMap = {
  blue: {
    stroke: 'stroke-blue-500',
    background: 'stroke-blue-100',
    text: 'text-blue-600'
  },
  green: {
    stroke: 'stroke-green-500',
    background: 'stroke-green-100',
    text: 'text-green-600'
  },
  yellow: {
    stroke: 'stroke-yellow-500',
    background: 'stroke-yellow-100',
    text: 'text-yellow-600'
  },
  red: {
    stroke: 'stroke-red-500',
    background: 'stroke-red-100',
    text: 'text-red-600'
  },
  gray: {
    stroke: 'stroke-gray-400',
    background: 'stroke-gray-200',
    text: 'text-gray-500'
  }
};

export const AnimatedProgressRing = memo(function AnimatedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  color = 'blue',
  showPercentage = true,
  duration = 1500,
  delay = 0
}: AnimatedProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  const colors = colorMap[color];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Animate progress
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3);
        const currentProgress = progress * easeOutCubic;
        
        setAnimatedProgress(currentProgress);
        
        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [progress, duration, delay]);

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        className={cn(
          "transform -rotate-90 transition-opacity duration-500",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className={colors.background}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className={cn(colors.stroke, "transition-all duration-300")}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'yellow' ? '#f59e0b' : color === 'red' ? '#ef4444' : '#6b7280'}40)`
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {showPercentage && (
          <span className={cn("text-2xl font-bold tabular-nums", colors.text)}>
            {Math.round(animatedProgress)}%
          </span>
        )}
        {children && (
          <div className="mt-1 text-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
});