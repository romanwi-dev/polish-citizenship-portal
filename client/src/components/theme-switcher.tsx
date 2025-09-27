import { useState, useEffect } from 'react';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
    
    // Force style recalculation
    html.offsetHeight;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center text-xl"
      style={{ zIndex: 9999 }}
      aria-label="Toggle theme"
      title="Toggle between light and dark theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}