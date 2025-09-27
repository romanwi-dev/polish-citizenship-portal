import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  User, 
  MapPin, 
  Users, 
  UserCheck, 
  Crown, 
  Shield, 
  FileText, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface SmartTabData {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending' | 'error';
  completionPercentage: number;
  errorCount?: number;
  description: string;
}

interface SmartTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: SmartTabData[];
  children: React.ReactNode;
  className?: string;
}

const tabIcons = {
  applicant: <User className="w-4 h-4" />,
  address: <MapPin className="w-4 h-4" />,
  family: <Users className="w-4 h-4" />,
  parents: <UserCheck className="w-4 h-4" />,
  grandparents: <Crown className="w-4 h-4" />,
  greatgrandparents: <Shield className="w-4 h-4" />,
  documents: <FileText className="w-4 h-4" />,
  generate: <Download className="w-4 h-4" />
};

export function SmartTabs({ activeTab, onTabChange, tabs, children, className = '' }: SmartTabsProps) {
  const getStatusIcon = (status: string, errorCount?: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-polish-emerald" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-polish-red" />;
      case 'current':
        return <Clock className="w-3 h-3 text-polish-gold animate-pulse" />;
      default:
        return null;
    }
  };

  const getTabClassName = (tab: SmartTabData) => {
    const baseClasses = "heritage-tab relative transition-all duration-300 flex flex-col items-center gap-1 p-3 min-w-[120px]";
    
    if (tab.id === activeTab) {
      return `${baseClasses} active`;
    }
    
    if (tab.status === 'completed') {
      return `${baseClasses} completed bg-gradient-to-br from-polish-emerald/10 to-polish-emerald/5 border border-polish-emerald/20`;
    }
    
    if (tab.status === 'error') {
      return `${baseClasses} bg-gradient-to-br from-polish-red/10 to-polish-red/5 border border-polish-red/20`;
    }
    
    return `${baseClasses} hover:bg-gradient-to-br hover:from-polish-gold/10 hover:to-polish-gold/5`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Progress Overview */}
      <div className="heritage-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-polish-navy">Form Completion Progress</h3>
          <div className="text-sm text-polish-gold font-semibold">
            {tabs.filter(t => t.status === 'completed').length} of {tabs.length} sections complete
          </div>
        </div>
        
        {/* Mini Progress Indicators */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`relative h-2 rounded-full transition-all duration-300 ${
                tab.status === 'completed' 
                  ? 'bg-polish-emerald' 
                  : tab.status === 'error'
                    ? 'bg-polish-red'
                    : tab.status === 'current'
                      ? 'bg-polish-gold'
                      : 'bg-gray-200'
              }`}
              title={tab.title}
            >
              {tab.status === 'current' && (
                <div className="absolute inset-0 rounded-full bg-polish-gold animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {/* Enhanced Tab Navigation */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="heritage-tabs grid grid-cols-8 lg:grid-cols-8 gap-1 h-auto p-2 w-max lg:w-full min-w-full">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={getTabClassName(tab)}
                onClick={() => onTabChange(tab.id)}
              >
                <div className="flex items-center gap-2">
                  {tabIcons[tab.id as keyof typeof tabIcons]}
                  {getStatusIcon(tab.status, tab.errorCount)}
                </div>
                <span className="text-xs font-medium truncate max-w-[100px]">
                  {tab.title}
                </span>
                
                {/* Completion percentage indicator */}
                {tab.completionPercentage > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        tab.status === 'completed' 
                          ? 'bg-polish-emerald' 
                          : tab.status === 'error'
                            ? 'bg-polish-red'
                            : 'bg-polish-gold'
                      }`}
                      style={{ width: `${tab.completionPercentage}%` }}
                    />
                  </div>
                )}
                
                {/* Error count badge */}
                {tab.errorCount && tab.errorCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-polish-red text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {tab.errorCount}
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        {children}
      </Tabs>

      {/* Smart Navigation Hints */}
      <div className="heritage-card p-4 bg-gradient-to-r from-polish-navy/5 to-polish-gold/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-polish-gold rounded-full flex items-center justify-center">
            💡
          </div>
          <div>
            <h4 className="font-semibold text-polish-navy">Smart Navigation Tip</h4>
            <p className="text-sm text-gray-600">
              Complete sections in order for the best experience. Click on any completed section to review or edit your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartTabs;