import { useState, useEffect } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Volume2, 
  Zap, 
  Palette,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export function AccessibilityControls() {
  const { preferences, updatePreference } = useUserPreferences();
  const [isOpen, setIsOpen] = useState(false);

  const fontSizeOptions = [
    { value: 'small', label: 'Small', scale: 0.875 },
    { value: 'medium', label: 'Medium', scale: 1 },
    { value: 'large', label: 'Large', scale: 1.125 },
    { value: 'extra-large', label: 'Extra Large', scale: 1.25 }
  ];

  const applyFontSize = (size: string) => {
    const option = fontSizeOptions.find(opt => opt.value === size);
    if (option) {
      document.documentElement.style.fontSize = `${option.scale * 16}px`;
    }
  };

  const toggleHighContrast = () => {
    const newValue = !preferences.highContrast;
    updatePreference('highContrast', newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const toggleReducedMotion = () => {
    const newValue = !preferences.reducedMotion;
    updatePreference('reducedMotion', newValue);
    
    if (newValue) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  // Apply accessibility settings on mount
  useEffect(() => {
    applyFontSize(preferences.fontSize);
    
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    }
  }, [preferences.fontSize, preferences.highContrast, preferences.reducedMotion]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          aria-label="Accessibility options"
        >
          <Accessibility className="h-4 w-4" />
          <span className="sr-only">Accessibility Controls</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-4" align="end">
        <DropdownMenuLabel className="flex items-center space-x-2">
          <Accessibility className="h-4 w-4" />
          <span>Accessibility Options</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="space-y-4 mt-4">
          {/* Font Size Control */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Type className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Font Size</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {fontSizeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={preferences.fontSize === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    updatePreference('fontSize', option.value as any);
                    applyFontSize(option.value);
                  }}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">High Contrast</label>
            </div>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Reduce Motion</label>
            </div>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={toggleReducedMotion}
            />
          </div>

          {/* Color Theme Selection */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Theme</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['light', 'dark', 'auto'].map((theme) => (
                <Button
                  key={theme}
                  variant={preferences.theme === theme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreference('theme', theme as any)}
                  className="text-xs capitalize"
                >
                  {theme}
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Focus on main content
                  const main = document.querySelector('main');
                  if (main) {
                    main.focus();
                    main.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs"
              >
                Skip to Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset all accessibility settings
                  updatePreference('fontSize', 'medium');
                  updatePreference('highContrast', false);
                  updatePreference('reducedMotion', false);
                  updatePreference('theme', 'light');
                  
                  // Apply resets
                  document.documentElement.style.fontSize = '16px';
                  document.documentElement.classList.remove('high-contrast', 'reduce-motion');
                }}
                className="text-xs"
              >
                Reset Settings
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t">
            <p className="font-medium mb-1">Keyboard Shortcuts:</p>
            <p>Ctrl+K: Open search</p>
            <p>Esc: Close dialogs</p>
            <p>Tab: Navigate elements</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// CSS styles to be added to index.css
export const accessibilityStyles = `
/* High Contrast Mode */
.high-contrast {
  --background: 255 255 255;
  --foreground: 0 0 0;
  --primary: 0 0 0;
  --primary-foreground: 255 255 255;
  --secondary: 240 240 240;
  --secondary-foreground: 0 0 0;
  --border: 0 0 0;
  --ring: 0 0 0;
}

.dark.high-contrast {
  --background: 0 0 0;
  --foreground: 255 255 255;
  --primary: 255 255 255;
  --primary-foreground: 0 0 0;
  --secondary: 30 30 30;
  --secondary-foreground: 255 255 255;
  --border: 255 255 255;
  --ring: 255 255 255;
}

/* Reduced Motion */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

/* Focus indicators */
.focus-visible:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
`;