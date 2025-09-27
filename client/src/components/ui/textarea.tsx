import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] md:min-h-[100px] w-full rounded-lg bg-gray-50 dark:bg-gray-800 px-5 py-4 text-lg md:text-base shadow-inner transition-all duration-200 placeholder:text-gray-400 placeholder:text-base md:placeholder:text-sm focus:bg-white dark:focus:bg-gray-700 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white dark:hover:bg-gray-700 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
