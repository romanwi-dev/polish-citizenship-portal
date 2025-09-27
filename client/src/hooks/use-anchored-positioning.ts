import { useState, useEffect, useCallback, RefObject } from 'react';

export interface Position {
  x: number;
  y: number;
  placement: 'bottom-end' | 'top-end' | 'bottom-start' | 'top-start';
}

interface UseAnchoredPositioningOptions {
  offset?: { x: number; y: number };
  preferredPlacement?: 'bottom-end' | 'top-end' | 'bottom-start' | 'top-start';
  padding?: number;
}

export function useAnchoredPositioning(
  triggerRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  isOpen: boolean,
  options: UseAnchoredPositioningOptions = {}
) {
  const {
    offset = { x: 0, y: 8 },
    preferredPlacement = 'bottom-end',
    padding = 16
  } = options;

  const [position, setPosition] = useState<Position | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !isOpen) {
      setPosition(null);
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };

    // Calculate positions for different placements
    const placements = {
      'bottom-end': {
        x: triggerRect.right - contentRect.width + offset.x,
        y: triggerRect.bottom + offset.y
      },
      'bottom-start': {
        x: triggerRect.left + offset.x,
        y: triggerRect.bottom + offset.y
      },
      'top-end': {
        x: triggerRect.right - contentRect.width + offset.x,
        y: triggerRect.top - contentRect.height - offset.y
      },
      'top-start': {
        x: triggerRect.left + offset.x,
        y: triggerRect.top - contentRect.height - offset.y
      }
    };

    // Check which placements fit in viewport
    const fitsInViewport = (pos: { x: number; y: number }) => {
      return (
        pos.x >= padding &&
        pos.x + contentRect.width <= viewport.width - padding &&
        pos.y >= padding &&
        pos.y + contentRect.height <= viewport.height - padding
      );
    };

    // Try preferred placement first
    let finalPlacement = preferredPlacement;
    let finalPos = placements[preferredPlacement];

    // If preferred doesn't fit, try other placements
    if (!fitsInViewport(finalPos)) {
      const fallbackOrder: Array<keyof typeof placements> = [
        'bottom-start',
        'top-end',
        'top-start'
      ].filter(p => p !== preferredPlacement);

      for (const placement of fallbackOrder) {
        const pos = placements[placement];
        if (fitsInViewport(pos)) {
          finalPlacement = placement;
          finalPos = pos;
          break;
        }
      }

      // If nothing fits, constrain to viewport
      if (!fitsInViewport(finalPos)) {
        finalPos = {
          x: Math.max(padding, Math.min(finalPos.x, viewport.width - contentRect.width - padding)),
          y: Math.max(padding, Math.min(finalPos.y, viewport.height - contentRect.height - padding))
        };
      }
    }

    // Add scroll offset for fixed positioning
    setPosition({
      x: finalPos.x + viewport.scrollX,
      y: finalPos.y + viewport.scrollY,
      placement: finalPlacement
    });

    // Debug logging as required
    console.debug('[Agent Menu] Position calculated:', {
      caseId: triggerRef.current.dataset.caseId,
      triggerRect: {
        x: triggerRect.x,
        y: triggerRect.y,
        width: triggerRect.width,
        height: triggerRect.height
      },
      contentRect: {
        width: contentRect.width,
        height: contentRect.height
      },
      viewport: {
        width: viewport.width,
        height: viewport.height
      },
      finalPosition: finalPos,
      placement: finalPlacement
    });

  }, [triggerRef, contentRef, isOpen, offset, preferredPlacement, padding]);

  useEffect(() => {
    if (isOpen) {
      // Calculate position immediately
      calculatePosition();

      // Recalculate on resize/scroll
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    } else {
      setPosition(null);
    }
  }, [isOpen, calculatePosition]);

  return position;
}

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  triggerRef: RefObject<HTMLElement>,
  callback: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideContent = ref.current && !ref.current.contains(target);
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(target);

      if (isOutsideContent && isOutsideTrigger) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [ref, triggerRef, callback, enabled]);
}

export function useEscapeKey(callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [callback, enabled]);
}