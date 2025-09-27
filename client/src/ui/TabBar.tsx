import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/ui/Button"

interface TabBarProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

interface TabTriggerProps {
  id: string
  label: string
  icon?: React.ReactNode
  isActive: boolean
  onClick: (id: string) => void
}

const TabTrigger: React.FC<TabTriggerProps> = ({ id, label, icon, isActive, onClick }) => {
  return (
    <Button
      variant={isActive ? "primary" : "ghost"}
      size="sm"
      onClick={() => onClick(id)}
      className={cn(
        "text-xs whitespace-nowrap flex-shrink-0 lg:flex-1 lg:min-w-0",
        isActive && "shadow-md"
      )}
      data-testid={`tab-${id}`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </Button>
  )
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div className={cn("border-b border-[var(--border)] bg-[var(--bg-elev)]", className)}>
      <div className="flex gap-2 p-3 justify-start lg:justify-between overflow-x-auto scrollbar-hide button-scroll-container min-w-max lg:min-w-0 lg:w-full">
        {tabs.map((tab) => (
          <TabTrigger
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={onTabChange}
          />
        ))}
      </div>
    </div>
  )
}