import { useState, useEffect } from 'react';
import { 
  Shield, 
  Star, 
  Users, 
  Award, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Calendar,
  Phone,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  text: string;
  date: Date;
  caseType: string;
  verified: boolean;
}

interface Statistic {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'Chicago, IL',
    rating: 5,
    text: 'Exceptional service! The team guided me through every step of the Polish citizenship process. Got my citizenship in 8 months.',
    date: new Date('2024-01-15'),
    caseType: 'Citizenship by Descent',
    verified: true
  },
  {
    id: '2',
    name: 'Michael Kowalski',
    location: 'New York, NY',
    rating: 5,
    text: 'Professional and thorough. They found documents I didn\'t even know existed. Highly recommend!',
    date: new Date('2024-01-10'),
    caseType: 'Document Recovery',
    verified: true
  },
  {
    id: '3',
    name: 'Anna Nowak',
    location: 'Los Angeles, CA',
    rating: 5,
    text: 'Amazing support throughout the entire process. The AI document processing saved me so much time.',
    date: new Date('2024-01-05'),
    caseType: 'Family Reunification',
    verified: true
  }
];

const statistics: Statistic[] = [
  {
    label: 'Success Rate',
    value: '98.5%',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    label: 'Cases Completed',
    value: '15,000+',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    label: 'Years Experience',
    value: '20+',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    label: 'Average Processing',
    value: '6 months',
    icon: CheckCircle,
    color: 'text-orange-600'
  }
];

const certifications = [
  {
    name: 'Polish Bar Association',
    icon: '⚖️',
    description: 'Licensed legal practitioners'
  },
  {
    name: 'ISO 27001 Certified',
    icon: '🔒',
    description: 'Information security management'
  },
  {
    name: 'Better Business Bureau A+',
    icon: '🏆',
    description: 'Highest customer satisfaction rating'
  },
  {
    name: 'AML Compliant',
    icon: '🛡️',
    description: 'Anti-money laundering certified'
  }
];

export function TrustIndicators() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Our Track Record</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Testimonials Carousel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Client Success Stories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {testimonial.name}
                            </h4>
                            {testimonial.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span>{testimonial.location}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.caseType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1 mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {testimonial.date.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Testimonial Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Certifications & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="text-2xl">{cert.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {cert.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Trust Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span>Talk to Our Experts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold">Free Consultation</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Speak with a licensed attorney
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">Live Chat Available</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Monday - Friday, 9 AM - 6 PM EST
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Schedule Free Consultation
              </Button>
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Live Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">John D. from Texas received his citizenship certificate</span>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Maria K. from California started her application</span>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Robert S. from Florida had his documents approved</span>
              </div>
              <span className="text-xs text-gray-500">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}