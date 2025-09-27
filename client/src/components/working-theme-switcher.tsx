import { useState, useEffect } from 'react';

export function WorkingThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDarkMode = savedTheme === 'dark';
    setIsDark(isDarkMode);
    
    // Apply theme immediately
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '2px solid #ccc',
        backgroundColor: isDark ? '#333' : '#fff',
        color: isDark ? '#fff' : '#333',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}