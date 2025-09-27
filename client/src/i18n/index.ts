import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import plTranslations from './locales/pl.json';

// Language detection function
const detectLanguage = (): string => {
  // Check localStorage first
  const storedLanguage = localStorage.getItem('preferred-language');
  if (storedLanguage && ['en', 'pl'].includes(storedLanguage)) {
    return storedLanguage;
  }

  // Auto-detect from navigator.language
  const browserLanguage = navigator.language || navigator.languages?.[0] || 'en';
  
  // Polish language detection (pl-PL, pl, etc.)
  if (browserLanguage.toLowerCase().startsWith('pl')) {
    return 'pl';
  }
  
  // Default fallback
  return 'en';
};

const resources = {
  en: {
    translation: enTranslations,
  },
  pl: {
    translation: plTranslations,
  },
};

// PERFORMANCE: Add initialization guard to prevent re-initialization on HMR
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // PERFORMANCE: Disable debug to reduce console noise
    debug: false,
    
    // Persist language changes
    saveMissing: false,
    
    // Load translations synchronously
    load: 'languageOnly',
    
    // Configure pluralization for Polish (complex rules)
    pluralSeparator: '_',
    contextSeparator: '_',
  });
}

// Listen for language changes and persist to localStorage
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('preferred-language', lng);
  // Also update the document lang attribute for accessibility
  document.documentElement.lang = lng;
});

export default i18n;