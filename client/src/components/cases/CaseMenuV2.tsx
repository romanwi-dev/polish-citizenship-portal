import React from 'react';
import { 
  Edit3, 
  Eye, 
  Copy, 
  Download, 
  Clock, 
  Pause, 
  X, 
  Archive, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CaseMenuV2Props {
  caseId: string;
  onAction: (action: string, caseId: string) => void;
  trigger?: React.ReactNode;
}

const menuItems = [
  { action: 'edit', label: 'Edit', icon: Edit3, variant: 'default' },
  { action: 'view', label: 'View', icon: Eye, variant: 'default' },
  { action: 'copy', label: 'Copy', icon: Copy, variant: 'default' },
  { action: 'export', label: 'Export', icon: Download, variant: 'default' },
  { action: 'postpone', label: 'Postpone', icon: Clock, variant: 'warning' },
  { action: 'suspend', label: 'Suspend', icon: Pause, variant: 'warning' },
  { action: 'cancel', label: 'Cancel', icon: X, variant: 'destructive' },
  { action: 'archive', label: 'Archive', icon: Archive, variant: 'default' },
  { action: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive' },
];

export default function CaseMenuV2({ caseId, onAction, trigger }: CaseMenuV2Props) {
  const handleMenuItemClick = (action: string) => {
    try {
      onAction(action, caseId);
    } catch (error) {
      console.error('Menu action error:', error);
    }
  };

  const defaultTrigger = (
    <button
      className={cn(
        "p-3 rounded-lg transition-opacity duration-200 min-w-[44px] min-h-[44px]",
        "opacity-100 md:opacity-70 md:group-hover:opacity-100",
        "hover:bg-gray-100 dark:hover:bg-gray-800 focus:opacity-100 focus:bg-gray-100 dark:focus:bg-gray-800",
        "focus:outline-none",
        "data-[state=open]:opacity-100"
      )}
      data-testid={`case-menu-${caseId}`}
      aria-label="Open case menu"
      onClick={(e) => {
        e.stopPropagation();
        // Don't preventDefault - let dropdown trigger work
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => {
        e.stopPropagation();
        // Don't preventDefault - let dropdown trigger work
      }}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    </button>
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom" 
        sideOffset={4}
        collisionPadding={8}
        avoidCollisions={true}
        sticky="always"
        className={cn(
          "min-w-[200px] z-[9999]",
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl",
          "text-gray-900 dark:text-gray-100"
        )}
        data-testid="case-menu-dropdown"
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isDestructive = item.variant === 'destructive';
          const isWarning = item.variant === 'warning';
          
          return (
            <div key={item.action}>
              {(index === 4 || index === 6) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleMenuItemClick(item.action);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium",
                  "cursor-pointer min-h-[48px]",
                  "hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800",
                  isDestructive && "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
                  isWarning && "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                )}
                data-testid={`menu-item-${item.action}`}
                style={{
                  fontSize: '16px',
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}