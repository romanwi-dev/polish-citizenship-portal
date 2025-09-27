import { useState, useEffect } from 'react';

// ---------- Unified Theme System ----------
export const THEME_VARIANTS = {
  light: { 
    name: "Light", 
    class: "", 
    preview: "#ffffff",
    accent: "#3b82f6",
    description: "Clean and bright"
  },
  dawn: { 
    name: "Dawn", 
    class: "theme-dawn", 
    preview: "#fce7f3",
    accent: "#f472b6",
    description: "Soft pinks and warm whites"
  },
  sky: { 
    name: "Sky", 
    class: "theme-sky", 
    preview: "#eff6ff",
    accent: "#60a5fa",
    description: "Light blues and crisp whites"
  },
  garden: { 
    name: "Garden", 
    class: "theme-garden", 
    preview: "#f0fdf4",
    accent: "#22c55e",
    description: "Light greens and fresh whites"
  },
  coral: { 
    name: "Coral", 
    class: "theme-coral", 
    preview: "#fff7ed",
    accent: "#f97316",
    description: "Warm oranges and soft whites"
  },
  blush: { 
    name: "Blush", 
    class: "theme-blush", 
    preview: "#fce7f3",
    accent: "#ec4899",
    description: "Soft pinks and delicate hues"
  },
  mint: { 
    name: "Mint", 
    class: "theme-mint", 
    preview: "#ecfdf5",
    accent: "#10b981",
    description: "Cool greens and fresh tones"
  },
  lavender: { 
    name: "Lavender", 
    class: "theme-lavender", 
    preview: "#f3e8ff",
    accent: "#8b5cf6",
    description: "Gentle purples and soothing violets"
  },
  peach: { 
    name: "Peach", 
    class: "theme-peach", 
    preview: "#fff7ed",
    accent: "#fb923c",
    description: "Warm oranges and peachy tones"
  },
  azure: { 
    name: "Azure", 
    class: "theme-azure", 
    preview: "#f0f9ff",
    accent: "#0ea5e9",
    description: "Sky blues and cloud whites"
  },
  rose: { 
    name: "Rose", 
    class: "theme-rose", 
    preview: "#fdf2f8",
    accent: "#f43f5e",
    description: "Elegant pinks and rose petals"
  },
  sage: { 
    name: "Sage", 
    class: "theme-sage", 
    preview: "#f6f7f6",
    accent: "#6b7280",
    description: "Muted greens and earthy neutrals"
  },
  cream: { 
    name: "Cream", 
    class: "theme-cream", 
    preview: "#fffbeb",
    accent: "#d97706",
    description: "Warm neutrals and creamy whites"
  },
  pearl: { 
    name: "Pearl", 
    class: "theme-pearl", 
    preview: "#fefefe",
    accent: "#9ca3af",
    description: "Soft whites and pearl shimmer"
  },
  honey: { 
    name: "Honey", 
    class: "theme-honey", 
    preview: "#fefce8",
    accent: "#eab308",
    description: "Golden yellows and warm amber"
  },
  midnight: { 
    name: "Midnight", 
    class: "theme-midnight", 
    preview: "#0a0612",
    accent: "#a855f7",
    description: "Deep blacks with purple accents"
  },
  space: { 
    name: "Space", 
    class: "theme-space", 
    preview: "#0c1117",
    accent: "#06b6d4",
    description: "Dark blue-grays with cyan accents"
  },
  forest: { 
    name: "Forest", 
    class: "theme-forest", 
    preview: "#0a120b",
    accent: "#10b981",
    description: "Dark greens with emerald accents"
  },
  ocean: { 
    name: "Ocean", 
    class: "theme-ocean", 
    preview: "#0b1419",
    accent: "#3b82f6",
    description: "Dark teals with blue accents"
  },
  sunset: { 
    name: "Sunset", 
    class: "theme-sunset", 
    preview: "#1a0f0c",
    accent: "#f97316",
    description: "Dark oranges/reds with warm accents"
  }
} as const;

export type ThemeVariant = keyof typeof THEME_VARIANTS;

// Dark themes list
const DARK_THEMES: ThemeVariant[] = ['midnight', 'space', 'forest', 'ocean', 'sunset'];

// Global theme state management
class ThemeManager {
  private static instance: ThemeManager;
  private theme: ThemeVariant = 'light';
  private listeners: Set<(theme: ThemeVariant) => void> = new Set();

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize from localStorage or system preference
      const stored = localStorage.getItem('unified-theme') as ThemeVariant;
      if (stored && THEME_VARIANTS[stored]) {
        this.theme = stored;
      } else {
        // Fallback to system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme = prefersDark ? 'midnight' : 'light';
      }
      
      // Apply initial theme
      this.applyTheme(this.theme);
    }
  }

  private applyTheme(newTheme: ThemeVariant) {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remove all existing theme classes
    Object.values(THEME_VARIANTS).forEach(variant => {
      if (variant.class) {
        root.classList.remove(variant.class);
      }
    });
    root.classList.remove('dark');
    
    // Apply new theme
    const themeVariant = THEME_VARIANTS[newTheme];
    if (themeVariant.class) {
      root.classList.add(themeVariant.class);
    }
    
    // Add dark class for dark themes
    if (DARK_THEMES.includes(newTheme)) {
      root.classList.add('dark');
    }
    
    // Persist to localStorage
    localStorage.setItem('unified-theme', newTheme);
    
    this.theme = newTheme;
  }

  setTheme(newTheme: ThemeVariant) {
    if (this.theme !== newTheme) {
      this.applyTheme(newTheme);
      // Notify all listeners
      this.listeners.forEach(callback => callback(newTheme));
    }
  }

  getTheme(): ThemeVariant {
    return this.theme;
  }

  isDark(): boolean {
    return DARK_THEMES.includes(this.theme);
  }

  subscribe(callback: (theme: ThemeVariant) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

// Unified useTheme hook
export function useTheme(): [ThemeVariant, (theme: ThemeVariant) => void, boolean] {
  const manager = ThemeManager.getInstance();
  const [theme, setThemeState] = useState<ThemeVariant>(manager.getTheme());

  useEffect(() => {
    const unsubscribe = manager.subscribe((newTheme) => {
      setThemeState(newTheme);
    });
    return unsubscribe;
  }, []);

  const setTheme = (newTheme: ThemeVariant) => {
    manager.setTheme(newTheme);
  };

  const isDark = manager.isDark();

  return [theme, setTheme, isDark];
}