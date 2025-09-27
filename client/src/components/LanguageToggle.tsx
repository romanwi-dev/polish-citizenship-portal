import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

interface LanguageToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  className?: string;
}

export function LanguageToggle({ 
  variant = 'outline', 
  size = 'sm',
  showText = true,
  className 
}: LanguageToggleProps) {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      // The i18n setup will automatically persist to localStorage
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className || ''}`}
          data-testid="button-language-toggle"
          aria-label={t('accessibility.toggleLanguage')}
        >
          <span className="text-sm">{currentLanguage.flag}</span>
          <Languages className="h-4 w-4" />
          {showText && (
            <>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="min-w-[120px]"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
            data-testid={`button-language-${language.code}`}
          >
            <div className="flex items-center gap-2 w-full">
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {i18n.language === language.code && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for headers/navbars
export function LanguageToggleCompact() {
  return (
    <LanguageToggle 
      variant="ghost" 
      size="sm"
      showText={false}
      className="h-8 w-8 p-0"
    />
  );
}

// Full version with text for settings pages
export function LanguageToggleFull() {
  return (
    <LanguageToggle 
      variant="outline" 
      size="default"
      showText={true}
      className="w-full justify-start"
    />
  );
}