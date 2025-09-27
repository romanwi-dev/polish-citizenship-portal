import { useState, useEffect } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'pl';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  timezone: string;
  dashboardLayout: 'default' | 'compact' | 'expanded';
  bookmarks: string[];
  recentPages: string[];
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dashboardLayout: 'default',
  bookmarks: [],
  recentPages: []
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, [preferences]);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const addBookmark = (path: string) => {
    setPreferences(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks.filter(b => b !== path), path].slice(-20)
    }));
  };

  const removeBookmark = (path: string) => {
    setPreferences(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b !== path)
    }));
  };

  const addRecentPage = (path: string) => {
    setPreferences(prev => ({
      ...prev,
      recentPages: [path, ...prev.recentPages.filter(p => p !== path)].slice(0, 10)
    }));
  };

  return {
    preferences,
    updatePreference,
    addBookmark,
    removeBookmark,
    addRecentPage
  };
}