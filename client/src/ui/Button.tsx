import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Sizes
          {
            "h-8 px-3 text-[var(--fs-sm)]": size === "sm",
            "h-10 px-4 text-[var(--fs-md)]": size === "md", 
            "h-12 px-6 text-[var(--fs-lg)]": size === "lg"
          },
          
          // Variants
          {
            "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90": variant === "primary",
            "bg-[var(--bg-elev)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)]": variant === "secondary",
            "bg-transparent text-[var(--text)] hover:bg-[var(--bg)]": variant === "ghost",
            "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90": variant === "danger"
          },
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"