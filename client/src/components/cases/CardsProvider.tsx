import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CardsUIState {
  openId: string | null;
  mode: 'mobile' | 'desktop';
  editorOpen: boolean;
  menuForId: string | null;
  menuAnchor: HTMLElement | null;
}

interface CardsContextValue extends CardsUIState {
  setOpenId: (id: string | null) => void;
  setEditorOpen: (open: boolean) => void;
  setMenuForId: (id: string | null) => void;
  setMenuAnchor: (anchor: HTMLElement | null) => void;
  openEditor: (id: string) => void;
  closeEditor: () => void;
  openMenu: (id: string, anchor: HTMLElement) => void;
  closeMenu: () => void;
}

const CardsContext = createContext<CardsContextValue | null>(null);

export function useCardsContext() {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCardsContext must be used within CardsProvider');
  }
  return context;
}

interface CardsProviderProps {
  children: ReactNode;
}

export function CardsProvider({ children }: CardsProviderProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<'mobile' | 'desktop'>('desktop');

  // Detect mode with debounced resize handler
  useEffect(() => {
    const updateMode = () => {
      setMode(window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop');
    };

    // Initial check
    updateMode();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateMode, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close editor on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditor();
        closeMenu();
      }
    };

    if (editorOpen || menuForId) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [editorOpen, menuForId]);

  const openEditor = (id: string) => {
    setOpenId(id);
    setEditorOpen(true);
    // Close menu if open
    setMenuForId(null);
    setMenuAnchor(null);
  };

  const closeEditor = () => {
    setOpenId(null);
    setEditorOpen(false);
  };

  const openMenu = (id: string, anchor: HTMLElement) => {
    setMenuForId(id);
    setMenuAnchor(anchor);
    // Close editor if open
    setEditorOpen(false);
  };

  const closeMenu = () => {
    setMenuForId(null);
    setMenuAnchor(null);
  };

  const value: CardsContextValue = {
    openId,
    mode,
    editorOpen,
    menuForId,
    menuAnchor,
    setOpenId,
    setEditorOpen,
    setMenuForId,
    setMenuAnchor,
    openEditor,
    closeEditor,
    openMenu,
    closeMenu,
  };

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  );
}