import { useEffect, useState } from 'react';

export function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.pageYOffset / totalHeight) * 100;
      setProgress(Math.min(scrollProgress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}