import { useState, useEffect, createContext, useContext } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface Translation {
  [key: string]: string | Translation;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  languages: Language[];
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
];

// Translation dictionaries
const translations: Record<string, Translation> = {
  en: {
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      documents: 'Documents',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      search: 'Search'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close'
    },
    dashboard: {
      welcome: 'Welcome to PolishCitizenship.pl',
      progress: 'Application Progress',
      documents: 'Required Documents',
      status: 'Application Status'
    },
    forms: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      birthDate: 'Date of Birth',
      birthPlace: 'Place of Birth'
    }
  },
  pl: {
    nav: {
      home: 'Strona główna',
      dashboard: 'Panel',
      documents: 'Dokumenty',
      about: 'O nas',
      contact: 'Kontakt',
      login: 'Logowanie',
      search: 'Szukaj'
    },
    common: {
      save: 'Zapisz',
      cancel: 'Anuluj',
      submit: 'Wyślij',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      back: 'Wstecz',
      next: 'Dalej',
      previous: 'Poprzedni',
      close: 'Zamknij'
    },
    dashboard: {
      welcome: 'Witamy w PolishCitizenship.pl',
      progress: 'Postęp wniosku',
      documents: 'Wymagane dokumenty',
      status: 'Status wniosku'
    },
    forms: {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      email: 'Adres email',
      phone: 'Numer telefonu',
      birthDate: 'Data urodzenia',
      birthPlace: 'Miejsce urodzenia'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('language');
    if (saved && languages.find(lang => lang.code === saved)) {
      setCurrentLanguage(saved);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (languages.find(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('language', code);
    
    // Update document direction for RTL languages
    document.documentElement.dir = ['ar', 'he', 'fa'].includes(code) ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage] || translations.en;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      value = key; // Fallback to key if translation not found
    }
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, replacement]) => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), replacement);
      });
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageSelector() {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang?.flag}</span>
          <span className="hidden md:inline">{currentLang?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{language.flag}</span>
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-sm text-gray-500">{language.name}</div>
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for date/time formatting based on locale
export function useLocaleFormat() {
  const { currentLanguage } = useLanguage();
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(currentLanguage, {
      dateStyle: 'medium',
      ...options
    }).format(date);
  };
  
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat(currentLanguage).format(number);
  };
  
  return { formatDate, formatCurrency, formatNumber };
}