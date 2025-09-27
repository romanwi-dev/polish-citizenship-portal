import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StampData {
  id: string;
  cityName: string;
  region: string;
  isUnlocked: boolean;
  collectedAt?: Date;
  unlockCondition: string;
  historicalFact: string;
}

const polishCityStamps: StampData[] = [
  {
    id: "warsaw",
    cityName: "WARSZAWA",
    region: "Mazowieckie",
    isUnlocked: true, // Always unlocked as capital
    unlockCondition: "Starting your citizenship journey",
    historicalFact: "Capital of Poland since 1596"
  },
  {
    id: "krakow",
    cityName: "KRAKÓW",
    region: "Małopolskie", 
    isUnlocked: false,
    unlockCondition: "Complete family tree section",
    historicalFact: "Former royal capital and UNESCO site"
  },
  {
    id: "gdansk",
    cityName: "GDAŃSK",
    region: "Pomorskie",
    isUnlocked: false,
    unlockCondition: "Upload first document",
    historicalFact: "Historic port city and Solidarity birthplace"
  },
  {
    id: "wroclaw",
    cityName: "WROCŁAW",
    region: "Dolnośląskie",
    isUnlocked: false,
    unlockCondition: "Submit citizenship application",
    historicalFact: "City of 100 bridges"
  },
  {
    id: "poznan",
    cityName: "POZNAŃ",
    region: "Wielkopolskie",
    isUnlocked: false,
    unlockCondition: "Verify ancestor documents",
    historicalFact: "Birthplace of Polish state"
  },
  {
    id: "lodz",
    cityName: "ŁÓDŹ",
    region: "Łódzkie",
    isUnlocked: false,
    unlockCondition: "Complete case review",
    historicalFact: "Former textile industry center"
  }
];

interface PassportStampProps {
  stamp: StampData;
  onClick: (stamp: StampData) => void;
  isAnimating: boolean;
}

const PassportStamp = ({ stamp, onClick, isAnimating }: PassportStampProps) => {
  const [isCollecting, setIsCollecting] = useState(false);

  const handleClick = () => {
    if (stamp.isUnlocked && !isCollecting) {
      setIsCollecting(true);
      setTimeout(() => {
        setIsCollecting(false);
        onClick(stamp);
      }, 1200);
    }
  };

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        stamp.isUnlocked ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
      }`}
      onClick={handleClick}
      data-testid={`stamp-${stamp.id}`}
    >
      {/* Stamp SVG */}
      <div className={`relative ${isCollecting ? 'animate-bounce' : ''}`}>
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 120 120" 
          className={`drop-shadow-lg transition-all duration-500 ${
            stamp.isUnlocked ? 'filter-none' : 'grayscale'
          }`}
        >
          {/* Stamp Background */}
          <circle 
            cx="60" 
            cy="60" 
            r="55" 
            fill={stamp.isUnlocked ? "#8B1538" : "#666666"}
            stroke="#2D1810" 
            strokeWidth="2"
          />
          
          {/* Inner Circle */}
          <circle 
            cx="60" 
            cy="60" 
            r="45" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
          
          {/* City Name */}
          <text 
            x="60" 
            y="45" 
            textAnchor="middle" 
            fill="#FFFFFF" 
            fontSize="11" 
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            {stamp.cityName}
          </text>
          
          {/* Region */}
          <text 
            x="60" 
            y="58" 
            textAnchor="middle" 
            fill="#FFFFFF" 
            fontSize="8" 
            fontFamily="Arial, sans-serif"
          >
            {stamp.region}
          </text>
          
          {/* Date Line */}
          <line 
            x1="25" 
            y1="70" 
            x2="95" 
            y2="70" 
            stroke="#FFFFFF" 
            strokeWidth="1"
          />
          
          {/* Poland Text */}
          <text 
            x="60" 
            y="85" 
            textAnchor="middle" 
            fill="#FFFFFF" 
            fontSize="9" 
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            POLSKA
          </text>
          
          {/* Date */}
          {stamp.collectedAt && (
            <text 
              x="60" 
              y="95" 
              textAnchor="middle" 
              fill="#FFFFFF" 
              fontSize="7" 
              fontFamily="Arial, sans-serif"
            >
              {stamp.collectedAt.toLocaleDateString('pl-PL')}
            </text>
          )}
        </svg>
        
        {/* Ink Splatter Animation */}
        {isCollecting && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-red-800 rounded-full opacity-60 animate-ping"></div>
              <div className="absolute w-4 h-4 bg-red-600 rounded-full top-2 left-2 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Lock Overlay */}
      {!stamp.isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-60 rounded-full p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
            </svg>
          </div>
        </div>
      )}
      
      {/* New Badge */}
      {stamp.isUnlocked && !stamp.collectedAt && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="destructive" className="animate-pulse text-xs">NEW</Badge>
        </div>
      )}
    </div>
  );
};

export const PassportStampCollection = () => {
  const [stamps, setStamps] = useState<StampData[]>(polishCityStamps);
  const [selectedStamp, setSelectedStamp] = useState<StampData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [animatingStamp, setAnimatingStamp] = useState<string | null>(null);

  // Simulate progress-based unlocking
  useEffect(() => {
    // Simulate unlocking stamps based on user progress
    const unlockTimer = setTimeout(() => {
      setStamps(prev => 
        prev.map(stamp => 
          stamp.id === 'gdansk' ? { ...stamp, isUnlocked: true } : stamp
        )
      );
    }, 3000);

    return () => clearTimeout(unlockTimer);
  }, []);

  const handleStampClick = (stamp: StampData) => {
    if (!stamp.collectedAt) {
      // Mark as collected
      setStamps(prev => 
        prev.map(s => 
          s.id === stamp.id 
            ? { ...s, collectedAt: new Date() }
            : s
        )
      );
      
      setAnimatingStamp(stamp.id);
      setTimeout(() => setAnimatingStamp(null), 1500);
    }
    
    setSelectedStamp(stamp);
    setShowDetails(true);
  };

  const collectedCount = stamps.filter(s => s.collectedAt).length;
  const unlockedCount = stamps.filter(s => s.isUnlocked).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            🏛️ Polish Cities Collection
          </CardTitle>
          <div className="text-sm text-gray-600">
            {collectedCount}/{stamps.length} collected
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Unlock stamps by completing citizenship milestones
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Collection Progress</span>
            <span>{Math.round((collectedCount / stamps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-800 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(collectedCount / stamps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {stamps.map((stamp) => (
            <div key={stamp.id} className="flex flex-col items-center">
              <PassportStamp 
                stamp={stamp}
                onClick={handleStampClick}
                isAnimating={animatingStamp === stamp.id}
              />
              <div className="text-center mt-2">
                <div className="text-xs font-medium text-gray-700">
                  {stamp.cityName}
                </div>
                {!stamp.isUnlocked && (
                  <div className="text-xs text-gray-500 mt-1">
                    🔒 {stamp.unlockCondition}
                  </div>
                )}
                {stamp.collectedAt && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Collected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Achievements</div>
          <div className="flex flex-wrap gap-2">
            {collectedCount >= 1 && (
              <Badge variant="secondary" className="text-xs">
                🎯 First Stamp
              </Badge>
            )}
            {collectedCount >= 3 && (
              <Badge variant="secondary" className="text-xs">
                🌟 Explorer
              </Badge>
            )}
            {collectedCount === stamps.length && (
              <Badge variant="secondary" className="text-xs">
                👑 Grand Tour Master
              </Badge>
            )}
            {unlockedCount >= 4 && (
              <Badge variant="secondary" className="text-xs">
                🔓 Pathfinder
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      {/* Stamp Details Modal */}
      {showDetails && selectedStamp && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <PassportStamp 
                  stamp={selectedStamp}
                  onClick={() => {}}
                  isAnimating={false}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedStamp.cityName}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedStamp.historicalFact}
              </p>
              {selectedStamp.collectedAt && (
                <p className="text-sm text-green-600 mb-4">
                  ✅ Collected on {selectedStamp.collectedAt.toLocaleDateString('pl-PL')}
                </p>
              )}
              <Button 
                onClick={() => setShowDetails(false)}
                className="w-full"
                data-testid="close-stamp-details"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};