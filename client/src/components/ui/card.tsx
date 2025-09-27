import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pc-card",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-3 p-6", className)}
    style={{
      letterSpacing: 'var(--ios26-letter-spacing)',
      lineHeight: 'var(--ios26-line-height)'
    }}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none",
      className
    )}
    style={{
      letterSpacing: 'var(--ios26-letter-spacing)',
      lineHeight: 'var(--ios26-line-height)'
    }}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-base text-muted-foreground font-medium", className)}
    style={{
      letterSpacing: 'var(--ios26-letter-spacing)',
      lineHeight: 'var(--ios26-line-height)',
      opacity: 0.8
    }}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// iOS-26 Card Components with Token Utilities
interface IOS26CardProps extends React.HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

const IOS26Card = React.forwardRef<HTMLDivElement, IOS26CardProps>(
  ({ className, strong = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        strong ? "token-card-strong" : "token-card",
        "text-[var(--text)]",
        className
      )}
      {...props}
    />
  )
)
IOS26Card.displayName = "IOS26Card"

interface IOS26CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}

const IOS26CardHeader = React.forwardRef<HTMLDivElement, IOS26CardHeaderProps>(
  ({ className, title, subtitle, right, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between p-4", className)}
      {...props}
    >
      <div className="flex flex-col space-y-1">
        {title && (
          <h3 className="text-lg font-semibold leading-none tracking-tight text-[var(--text)]">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-[var(--text-subtle)]">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {right && (
        <div className="flex-shrink-0 ml-4">
          {right}
        </div>
      )}
    </div>
  )
)
IOS26CardHeader.displayName = "IOS26CardHeader"

const IOS26CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-4 pt-0", className)} 
    {...props} 
  />
))
IOS26CardBody.displayName = "IOS26CardBody"


export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  IOS26Card,
  IOS26CardHeader, 
  IOS26CardBody
}
