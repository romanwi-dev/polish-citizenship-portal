import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "pc-btn",
  {
    variants: {
      variant: {
        default: "pc-btn--primary",
        primary: "pc-btn--primary", 
        secondary: "pc-btn--secondary",
        ghost: "pc-btn--ghost",
        destructive: "pc-btn--ghost",
        outline: "pc-btn--secondary",
        link: "pc-btn--ghost",
      },
      size: {
        default: "",
        sm: "pc-btn--sm",
        lg: "pc-btn--lg", 
        xl: "pc-btn--xl",
        icon: "pc-btn--icon",
      },
      pill: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: true,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  pill?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, pill = true, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, pill }),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
