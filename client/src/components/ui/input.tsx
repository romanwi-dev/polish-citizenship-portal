import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2",
          "text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-[320px]:text-base", // 16px on mobile to prevent iOS zoom
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
