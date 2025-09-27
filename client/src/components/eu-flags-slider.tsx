import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";

const euCountries = [
  { name: "Austria", code: "AT", capital: "Vienna", joined: "1995", flag: "🇦🇹" },
  { name: "Belgium", code: "BE", capital: "Brussels", joined: "1957", flag: "🇧🇪" },
  { name: "Bulgaria", code: "BG", capital: "Sofia", joined: "2007", flag: "🇧🇬" },
  { name: "Croatia", code: "HR", capital: "Zagreb", joined: "2013", flag: "🇭🇷" },
  { name: "Cyprus", code: "CY", capital: "Nicosia", joined: "2004", flag: "🇨🇾" },
  { name: "Czech Republic", code: "CZ", capital: "Prague", joined: "2004", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", capital: "Copenhagen", joined: "1973", flag: "🇩🇰" },
  { name: "Estonia", code: "EE", capital: "Tallinn", joined: "2004", flag: "🇪🇪" },
  { name: "Finland", code: "FI", capital: "Helsinki", joined: "1995", flag: "🇫🇮" },
  { name: "France", code: "FR", capital: "Paris", joined: "1957", flag: "🇫🇷" },
  { name: "Germany", code: "DE", capital: "Berlin", joined: "1957", flag: "🇩🇪" },
  { name: "Greece", code: "GR", capital: "Athens", joined: "1981", flag: "🇬🇷" },
  { name: "Hungary", code: "HU", capital: "Budapest", joined: "2004", flag: "🇭🇺" },
  { name: "Ireland", code: "IE", capital: "Dublin", joined: "1973", flag: "🇮🇪" },
  { name: "Italy", code: "IT", capital: "Rome", joined: "1957", flag: "🇮🇹" },
  { name: "Latvia", code: "LV", capital: "Riga", joined: "2004", flag: "🇱🇻" },
  { name: "Lithuania", code: "LT", capital: "Vilnius", joined: "2004", flag: "🇱🇹" },
  { name: "Luxembourg", code: "LU", capital: "Luxembourg", joined: "1957", flag: "🇱🇺" },
  { name: "Malta", code: "MT", capital: "Valletta", joined: "2004", flag: "🇲🇹" },
  { name: "Netherlands", code: "NL", capital: "Amsterdam", joined: "1957", flag: "🇳🇱" },
  { name: "Poland", code: "PL", capital: "Warsaw", joined: "2004", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", capital: "Lisbon", joined: "1986", flag: "🇵🇹" },
  { name: "Romania", code: "RO", capital: "Bucharest", joined: "2007", flag: "🇷🇴" },
  { name: "Slovakia", code: "SK", capital: "Bratislava", joined: "2004", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", capital: "Ljubljana", joined: "2004", flag: "🇸🇮" },
  { name: "Spain", code: "ES", capital: "Madrid", joined: "1986", flag: "🇪🇸" },
  { name: "Sweden", code: "SE", capital: "Stockholm", joined: "1995", flag: "🇸🇪" }
];

const EUFlagsSlider = memo(function EUFlagsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality with slower transitions
  useEffect(() => {
    if (isAutoPlaying && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(euCountries.length / 4));
      }, 8000); // Slower transition - 8 seconds between slides
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, isPaused]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(euCountries.length / 4));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.ceil(euCountries.length / 4) - 1 : prevIndex - 1
    );
  }, []);

  // Get current set of 4 countries - memoized for performance
  const displayCountries = useMemo(() => {
    const startIdx = currentIndex * 4;
    return euCountries.slice(startIdx, startIdx + 4);
  }, [currentIndex]);

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-4xl font-light text-blue-300 tracking-wide antialiased">European Union Member States</h2>
          </div>
        </div>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Flags Grid with Slow Staggered Animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayCountries.map((country, index) => (
              <Card 
                key={`${country.code}-${currentIndex}`}
                className="bg-blue-100 backdrop-blur-sm p-6 text-center transform transition-all duration-1000 hover:scale-105 hover:shadow-2xl opacity-0 animate-slow-fade-in"
                style={{ 
                  animationDelay: `${index * 0.5}s`, // Slower stagger - 0.5s between each flag
                  animationFillMode: 'forwards'
                }}
              >
                {/* Waving Flag Effect Container */}
                <div className="relative h-24 mb-4 flex items-center justify-center">
                  <div className="flag-wave text-7xl">
                    {country.flag}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-2">{country.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Capital: {country.capital}</p>
                <p className="text-xs text-blue-600 font-semibold">EU Member Since {country.joined}</p>
              </Card>
            ))}
          </div>


        </div>


      </div>
    </div>
  );
});

export default EUFlagsSlider;