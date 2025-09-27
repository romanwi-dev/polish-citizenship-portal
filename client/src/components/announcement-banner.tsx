import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('announcementDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('announcementDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-300 animate-pulse" />
            <p className="font-medium text-sm sm:text-base">
              <span className="font-bold">Limited Time Offer:</span> Get 15% off all Premium and Express packages this month! 
              <a href="/consultation" className="underline ml-2 hover:text-yellow-300 transition-colors">
                Book Your Consultation →
              </a>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}