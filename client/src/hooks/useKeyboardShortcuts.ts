import { useEffect, useCallback, useState } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, metaKey, altKey } = event;
    
    // Create a shortcut key combination
    let shortcutKey = '';
    if (ctrlKey || metaKey) shortcutKey += 'ctrl+';
    if (altKey) shortcutKey += 'alt+';
    shortcutKey += key.toLowerCase();
    
    // Execute the shortcut if it exists
    if (shortcuts[shortcutKey]) {
      event.preventDefault();
      shortcuts[shortcutKey]();
    }
    
    // Handle escape key separately
    if (key === 'Escape' && shortcuts['escape']) {
      event.preventDefault();
      shortcuts['escape']();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for arrow key navigation in dropdowns/menus
export function useArrowNavigation(
  isOpen: boolean,
  itemCount: number,
  onSelect: (index: number) => void,
  onClose: () => void
) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((prev: number) => (prev + 1) % itemCount);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((prev: number) => (prev - 1 + itemCount) % itemCount);
          break;
        case 'Enter':
          event.preventDefault();
          if (activeIndex >= 0) {
            onSelect(activeIndex);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, itemCount, onSelect, onClose]);

  return activeIndex;
}