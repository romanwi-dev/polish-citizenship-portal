import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "start" | "end"
  className?: string
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "danger"
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = "end", className }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[200px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow)] py-1",
            align === "end" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ 
  children, 
  variant = "default", 
  className, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        "w-full text-left px-3 py-2 text-sm transition-colors",
        variant === "default" 
          ? "text-[var(--text)] hover:bg-[var(--bg)]" 
          : "text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}