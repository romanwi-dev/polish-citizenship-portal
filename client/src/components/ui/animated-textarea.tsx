import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";

interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  maxLength?: number;
  variant?: "default" | "floating" | "outlined";
}

export const AnimatedTextarea = React.forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({ label, error, success, maxLength, variant = "default", className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        setHasValue(textarea.value.length > 0);
        setCharCount(textarea.value.length);
      }
    }, []);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    if (variant === "floating") {
      return (
        <div className="relative group">
          <textarea
            ref={textareaRef}
            className={cn(
              "peer w-full min-h-[120px] px-4 pt-6 pb-2 bg-white border-2 rounded-lg transition-all duration-300 resize-y",
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
            onChange={handleChange}
            placeholder=" "
            maxLength={maxLength}
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

          {success && !error && (
            <div className="absolute right-3 top-3">
              <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 transition-colors duration-200">
              <span className={charCount > maxLength * 0.9 ? "text-orange-500" : ""}>
                {charCount}/{maxLength}
              </span>
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
          <textarea
            ref={textareaRef}
            className={cn(
              "w-full min-h-[120px] px-4 py-3 bg-transparent border-2 rounded-lg transition-all duration-300 resize-y",
              "focus:outline-none focus:ring-0",
              error
                ? "border-red-300 focus:border-red-500"
                : success
                ? "border-green-300 focus:border-green-500"
                : "border-gray-300 focus:border-blue-500",
              "hover:border-gray-400 focus:hover:border-blue-500",
              "transform hover:scale-[1.01] focus:scale-[1.01] transition-transform duration-200",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={label}
            maxLength={maxLength}
            {...props}
          />

          {success && !error && (
            <div className="absolute right-3 top-3">
              <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 transition-colors duration-200">
              <span className={charCount > maxLength * 0.9 ? "text-orange-500" : ""}>
                {charCount}/{maxLength}
              </span>
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
          <textarea
            ref={textareaRef}
            className={cn(
              "w-full min-h-[120px] px-4 py-3 bg-white border-2 rounded-lg transition-all duration-300 resize-y",
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
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {success && !error && (
            <div className="absolute right-3 top-3">
              <CheckCircle className="h-5 w-5 text-green-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="h-5 w-5 text-red-500 animate-in zoom-in-50 duration-200" />
            </div>
          )}

          {maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 transition-colors duration-200">
              <span className={charCount > maxLength * 0.9 ? "text-orange-500" : ""}>
                {charCount}/{maxLength}
              </span>
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

AnimatedTextarea.displayName = "AnimatedTextarea";