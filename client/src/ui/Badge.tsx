import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral"
  children: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          {
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": variant === "success",
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200": variant === "warning",
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": variant === "danger",
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200": variant === "neutral"
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"