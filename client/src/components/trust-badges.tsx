import { Shield, Award, Clock, Users, CheckCircle, Star } from 'lucide-react';
import { memo } from 'react';

export const TrustBadges = memo(function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "256-bit SSL encryption"
    },
    {
      icon: Award,
      title: "Certified Experts",
      description: "Licensed legal professionals"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Always here to help"
    },
    {
      icon: Users,
      title: "5000+ Clients",
      description: "Trusted worldwide"
    },
    {
      icon: CheckCircle,
      title: "100% True Success Rate",
      description: "Proven track record"
    },
    {
      icon: Star,
      title: "5-Star Reviews",
      description: "Client satisfaction"
    }
  ];

  return (
    <div className="bg-gray-50 py-8 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <badge.icon className="h-8 w-8 text-blue-600 mb-2 group-hover:text-blue-700" />
              <h3 className="font-semibold text-sm text-gray-900">{badge.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});