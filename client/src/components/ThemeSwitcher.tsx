import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
// ThemeContext removed - themes disabled
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Simple disabled theme switcher
const ThemeSwitcher = () => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-2 hover:bg-gray-50 transition-colors opacity-50"
      disabled
      data-testid="theme-switcher-button"
    >
      <Palette className="h-5 w-5 text-gray-600" />
    </Button>
  );
};

export default ThemeSwitcher;