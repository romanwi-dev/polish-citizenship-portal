import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default: "border-[var(--accent)] bg-[var(--accent)] text-white",
        secondary: "border-[var(--border)] bg-[var(--accent-muted)] text-[var(--text)]",
        destructive: "border-[var(--danger)] bg-[var(--danger)] text-white",
        warning: "border-[var(--warning)] bg-[var(--warning)] text-white",
        success: "border-[var(--success)] bg-[var(--success)] text-white",
        outline: "border-[var(--border)] bg-transparent text-[var(--text)]",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  size?: "sm" | "md" | "lg"
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
