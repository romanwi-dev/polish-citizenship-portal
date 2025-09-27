import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { Portal } from './portal';
import { useAnchoredPositioning, useClickOutside, useEscapeKey } from '@/hooks/use-anchored-positioning';
import { cn } from '@/lib/utils';

interface AnchoredMenuProps {
  children: ReactNode;
  trigger: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: 'bottom-end' | 'top-end' | 'bottom-start' | 'top-start';
  offset?: { x: number; y: number };
  className?: string;
  menuClassName?: string;
  caseId?: string;
  onLongPress?: () => void;
}

export function AnchoredMenu({
  children,
  trigger,
  isOpen,
  onOpenChange,
  placement = 'bottom-end',
  offset = { x: 0, y: 8 },
  className = '',
  menuClassName = '',
  caseId,
  onLongPress
}: AnchoredMenuProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Mobile touch handlers
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);

  const position = useAnchoredPositioning(triggerRef, contentRef, isOpen, {
    preferredPlacement: placement,
    offset,
    padding: 16
  });

  useClickOutside(contentRef, triggerRef, () => {
    if (isOpen) {
      onOpenChange(false);
    }
  }, isOpen);

  useEscapeKey(() => {
    if (isOpen) {
      onOpenChange(false);
    }
  }, isOpen);

  // Mobile touch handlers for long press
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const startTime = Date.now();
    setTouchStartTime(startTime);
    
    // Start long-press timer for mobile
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        onOpenChange(true);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const endTime = Date.now();
    const touchDuration = endTime - (touchStartTime || endTime);
    
    // Clear long-press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // If it was a quick tap, handle normally
    if (touchDuration < 300) {
      e.preventDefault();
    }
  };

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      console.debug('[Agent Menu] Opening menu for case:', caseId);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 120);
      console.debug('[Agent Menu] Closing menu for case:', caseId);
      return () => clearTimeout(timer);
    }
  }, [isOpen, caseId]);

  // Error handling for positioning - only run when menu opens
  useEffect(() => {
    if (isOpen && position && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Log potential positioning issues only once when menu opens
      if (position.x < 0 || position.y < 0 || 
          position.x > viewport.width - 280 || 
          position.y > viewport.height - 320) {
        console.error('[Agent Menu] Position calculation may have failed:', {
          caseId,
          position: { x: position.x, y: position.y, placement: position.placement },
          triggerRect: {
            x: triggerRect.x,
            y: triggerRect.y,
            width: triggerRect.width,
            height: triggerRect.height
          },
          viewport
        });
      }
    }
  }, [isOpen, caseId]); // Removed position dependency to prevent infinite loop

  // Set case ID on trigger for debugging
  useEffect(() => {
    if (triggerRef.current && caseId) {
      triggerRef.current.dataset.caseId = caseId;
    }
  }, [caseId]);

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-block', className)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {trigger}
      </div>
      
      {(isOpen || isAnimating) && (
        <Portal>
          <div
            className="agent-menu-portal"
            style={{
              position: 'fixed',
              left: Math.max(16, Math.min((position?.x ?? 0), window.innerWidth - 256)),
              top: Math.max(16, Math.min((position?.y ?? 0), window.innerHeight - 200)),
              zIndex: 1000,
              pointerEvents: isOpen ? 'auto' : 'none'
            }}
          >
            <div
              ref={contentRef}
              className={cn(
                'agent-menu',
                isOpen ? 'agent-fade-in agent-scale-in' : 'agent-fade-out agent-scale-out',
                menuClassName
              )}
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(4px)',
                transition: 'all 0.12s ease'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: ReactNode;
  disabled?: boolean;
}

export function MenuItem({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default',
  icon,
  disabled = false
}: MenuItemProps) {
  const variantClasses = {
    default: '',
    destructive: 'agent-menu-item destructive',
    warning: 'agent-menu-item warning'
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        'agent-menu-item',
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </div>
  );
}

export function MenuSeparator() {
  return (
    <div 
      className="my-1 h-px bg-current opacity-10" 
      role="separator"
      aria-orientation="horizontal"
    />
  );
}