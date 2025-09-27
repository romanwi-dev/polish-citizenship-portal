import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  ripple?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    loading = false,
    loadingText,
    icon,
    ripple = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || props.disabled) return;

      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRipplePosition({ x, y });
        
        setTimeout(() => setRipplePosition(null), 600);
      }

      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);

      onClick?.(e);
    };

    const getVariantClasses = () => {
      switch (variant) {
        case "destructive":
          return "bg-red-500 text-red-50 hover:bg-red-500/90 focus:bg-red-500/90";
        case "outline":
          return "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900";
        case "secondary":
          return "bg-gray-100 text-gray-900 hover:bg-gray-100/80 focus:bg-gray-100/80";
        case "ghost":
          return "hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900";
        case "link":
          return "text-blue-600 underline-offset-4 hover:underline focus:underline";
        default:
          return "bg-blue-600 text-blue-50 hover:bg-blue-500 focus:bg-blue-500";
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-9 rounded-md px-3 text-xs";
        case "lg":
          return "h-11 rounded-md px-8";
        case "icon":
          return "h-10 w-10";
        default:
          return "h-10 px-4 py-2";
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
          getVariantClasses(),
          getSizeClasses(),
          "/* No transforms */",
          "shadow-sm",
          isPressed && "/* No scale */",
          className
        )}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {/* Ripple effect */}
        {ripple && ripplePosition && (
          <span
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
            style={{
              left: ripplePosition.x - 10,
              top: ripplePosition.y - 10,
              width: 20,
              height: 20,
            }}
          />
        )}

        {/* Loading state */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}

        {/* Icon */}
        {!loading && icon && (
          <span className="mr-2 flex items-center">
            {icon}
          </span>
        )}

        {/* Button text */}
        <span className={cn(
          "transition-all duration-200",
          loading && "opacity-70"
        )}>
          {loading && loadingText ? loadingText : children}
        </span>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 pointer-events-none" />
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";