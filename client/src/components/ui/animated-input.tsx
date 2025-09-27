import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "floating" | "outlined";
}

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, success, icon, variant = "default", className, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const input = inputRef.current;
      if (input) {
        setHasValue(input.value.length > 0);
      }
    }, []);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    if (variant === "floating") {
      return (
        <div className="relative group">
          <input
            ref={inputRef}
            type={inputType}
            className={cn(
              "peer w-full h-14 px-4 pt-6 pb-2 bg-white border-2 rounded-lg transition-all duration-300",
              "focus:outline-none focus:ring-0",
              error
                ? "border-red-300 focus:border-red-500"
                : success
                ? "border-green-300 focus:border-green-500"
                : "border-gray-200 focus:border-blue-500",
              "hover:border-gray-300 focus:hover:border-blue-500",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder=" "
            {...props}
          />
          
          {label && (
            <label className={cn(
              "absolute left-4 transition-all duration-300 pointer-events-none",
              "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
              hasValue || isFocused ? "top-2 text-xs text-blue-600" : "top-4 text-base text-gray-400",
              error ? "peer-focus:text-red-600" : success ? "peer-focus:text-green-600" : ""
            )}>
              {label}
            </label>
          )}

          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}

          {success && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}
        </div>
      );
    }

    if (variant === "outlined") {
      return (
        <div className="relative">
          <input
            ref={inputRef}
            type={inputType}
            className={cn(
              "w-full h-14 px-4 bg-transparent border-2 rounded-lg transition-all duration-300",
              "focus:outline-none focus:ring-0",
              error
                ? "border-red-300 focus:border-red-500"
                : success
                ? "border-green-300 focus:border-green-500"
                : "border-gray-300 focus:border-blue-500",
              "hover:border-gray-400 focus:hover:border-blue-500",
              "transform hover:scale-[1.02] focus:scale-[1.02] transition-transform duration-200",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={label}
            {...props}
          />

          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}

          {success && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
              {error}
            </p>
          )}
        </div>
      );
    }

    // Default variant
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 transition-colors duration-200">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={inputRef}
            type={inputType}
            className={cn(
              "w-full h-12 px-4 bg-white border-2 rounded-lg transition-all duration-300",
              "focus:outline-none focus:ring-0",
              error
                ? "border-red-300 focus:border-red-500 focus:shadow-red-100"
                : success
                ? "border-green-300 focus:border-green-500 focus:shadow-green-100"
                : "border-gray-200 focus:border-blue-500 focus:shadow-blue-100",
              "hover:border-gray-300 focus:hover:border-blue-500",
              "focus:shadow-lg transition-shadow duration-300",
              "transform hover:translate-y-[-1px] focus:translate-y-[-1px] transition-transform duration-200",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200">
              {icon}
            </div>
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}

          {success && !error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";