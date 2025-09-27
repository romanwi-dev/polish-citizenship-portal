import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  sticky?: boolean
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow)] overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, sticky = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4 border-b border-[var(--border)]",
          sticky && "sticky top-0 bg-[var(--bg-elev)] z-10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-6 py-4 border-t border-[var(--border)] bg-[var(--bg)]", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardBody.displayName = "CardBody"
CardFooter.displayName = "CardFooter"