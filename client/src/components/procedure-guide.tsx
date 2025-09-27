import { memo, useMemo } from "react";
import { Search, FileText, Send, ShieldCheck, Clock3, Users2, CheckCircle2, Globe2, MapPin, UserCheck, Heart, Award, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ProcedureGuide = memo(function ProcedureGuide() {
  const steps = [
    {
      number: 1,
      title: "Initial Free Consultation",
      description: "Free 30-minute assessment to evaluate your family history and determine eligibility. No cost, no obligations.",
      duration: "1-2 weeks",
      cost: "Free",
      icon: Search,
    },
    {
      number: 2,
      title: "Legal Case Analysis",
      description: "Comprehensive legal review of your lineage under Polish citizenship law with success probability assessment.",
      duration: "2-4 weeks", 
      cost: "€750",
      icon: FileText,
    },
    {
      number: 3,
      title: "Polish Archives Research",
      description: "Systematic search through Polish Civil Registry offices and municipal archives for ancestor documents.",
      duration: "3-8 months",
      cost: "€1,200-2,500",
      icon: MapPin,
    },
    {
      number: 4,
      title: "International Archives Search",
      description: "Research in Ukrainian, Lithuanian, and other international archives for hard-to-find historical documents.",
      duration: "4-12 months",
      cost: "€300 per document",
      icon: Globe2,
    },
    {
      number: 5,
      title: "Document Authentication",
      description: "Professional apostille certification and certified Polish translation of all required documents.",
      duration: "2-6 months",
      cost: "€800-1,500",
      icon: CheckCircle2,
    },
    {
      number: 6,
      title: "Application Preparation",
      description: "Meticulous preparation and legal review of your complete citizenship application package.",
      duration: "3-6 weeks",
      cost: "€650",
      icon: Send,
    },
    {
      number: 7,
      title: "Official Government Submission",
      description: "Formal submission to the Masovian Voivoda's Office in Warsaw with case tracking setup.",
      duration: "2-4 weeks",
      cost: "Included",
      icon: Send,
    },
    {
      number: 8,
      title: "Government Review Process",
      description: "Polish authorities review your case. We monitor progress and respond to any additional requests.",
      duration: "12-36 months",
      cost: "Monitoring included",
      icon: Clock3,
    },
    {
      number: 9,
      title: "Citizenship Confirmation",
      description: "Receive official citizenship confirmation certificate recognizing you as a Polish and EU citizen.",
      duration: "2-4 weeks",
      cost: "€500 success fee",
      icon: ShieldCheck,
    },
    {
      number: 10,
      title: "Polish Civil Documents",
      description: "Obtain official Polish birth certificate and civil acts required for passport application.",
      duration: "1-3 months",
      cost: "€300",
      icon: UserCheck,
    },
    {
      number: 11,
      title: "EU Passport Application",
      description: "Complete Polish passport application with consulate appointment assistance and biometric processing.",
      duration: "2-4 months",
      cost: "€200 + govt fees",
      icon: Award,
    },
    {
      number: 12,
      title: "Family Extension Services",
      description: "Assistance extending citizenship to your spouse and children, plus ongoing support for EU rights.",
      duration: "3-6 months",
      cost: "€400 per person",
      icon: Heart,
    },
  ];

  return (
    <section id="process" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-warm mb-6 tracking-tight">
            <span className="block text-neutral-warm">Complete Legal</span>
            <span className="block text-primary-blue">Process Timeline</span>
          </h2>
          <p className="text-lg text-neutral-cool max-w-3xl mx-auto leading-relaxed">
            Our comprehensive 12-step process guides you through every stage of obtaining Polish citizenship by descent.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            // Calculate proportional spacing based on duration
            const getDurationInMonths = (duration: string) => {
              if (duration.includes('36')) return 36;
              if (duration.includes('12')) return 12;
              if (duration.includes('8')) return 8;
              if (duration.includes('6')) return 6;
              if (duration.includes('4')) return 4;
              if (duration.includes('3')) return 3;
              if (duration.includes('2')) return 2;
              return 1;
            };
            
            const monthsDuration = getDurationInMonths(step.duration);
            const spacingClass = monthsDuration >= 12 ? 'mb-32' : 
                               monthsDuration >= 6 ? 'mb-24' : 
                               monthsDuration >= 3 ? 'mb-16' : 'mb-12';
            
            return (
              <div key={step.number} className={`relative ${index < steps.length - 1 ? spacingClass : ''}`}>
                {/* Connection Line - Longer and proportional to time */}
                {index < steps.length - 1 && (
                  <>
                    {/* Main vertical line */}
                    <div 
                      className="absolute left-8 top-20 w-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full"
                      style={{ 
                        height: monthsDuration >= 12 ? '28rem' : 
                               monthsDuration >= 6 ? '20rem' : 
                               monthsDuration >= 3 ? '12rem' : '8rem' 
                      }}
                    ></div>
                    {/* Animated progress line */}
                    <div 
                      className="absolute left-[30px] top-20 w-0.5 bg-gradient-to-b from-primary-blue to-primary-blue-light"
                      style={{ 
                        height: monthsDuration >= 12 ? '28rem' : 
                               monthsDuration >= 6 ? '20rem' : 
                               monthsDuration >= 3 ? '12rem' : '8rem',
                        animation: `flow ${monthsDuration}s linear infinite`
                      }}
                    ></div>
                  </>
                )}
                
                <div className="flex items-start space-x-8">
                  {/* Step Number Only - Bigger and Better */}
                  <div className="flex-shrink-0 flex flex-col items-center relative">
                    <div 
                      className={`${index === 0 || index === 8 ? 'w-20 h-24' : 'w-16 h-16'} rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl transform hover:scale-110 transition-all duration-300 border-2 border-white`}
                      style={{
                        backgroundColor: index === 0 ? '#f7fdf9' : 
                                      index === 1 ? '#f3fcf5' : 
                                      index === 2 ? '#effbf1' : 
                                      index === 3 ? '#ebfaed' : 
                                      index === 4 ? '#e7f9e9' : 
                                      index === 5 ? '#e3f8e5' : 
                                      index === 6 ? '#dff7e1' : 
                                      index === 7 ? '#dbf6dd' : 
                                      index === 8 ? '#fce8ea' : 
                                      index === 9 ? '#d3f4d5' : 
                                      index === 10 ? '#cff3d1' : '#cbf2cd',
                        color: index === 8 ? '#dc2626' : '#16a34a'
                      }}
                    >
                      {step.number}
                    </div>

                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <Card 
                      className="border-2 border-gray-200 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                      style={{
                        backgroundColor: index === 0 ? '#f7fdf9' : 
                                      index === 1 ? '#f3fcf5' : 
                                      index === 2 ? '#effbf1' : 
                                      index === 3 ? '#ebfaed' : 
                                      index === 4 ? '#e7f9e9' : 
                                      index === 5 ? '#e3f8e5' : 
                                      index === 6 ? '#dff7e1' : 
                                      index === 7 ? '#dbf6dd' : 
                                      index === 8 ? '#fce8ea' : 
                                      index === 9 ? '#d3f4d5' : 
                                      index === 10 ? '#cff3d1' : '#cbf2cd'
                      }}
                    >
                      {/* Progress indicator stripe */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50"></div>
                      <CardContent className="p-8">
                        <div className="lg:flex lg:justify-between lg:items-start">
                          <div className="flex-1 lg:mr-8">
                            <h3 className="text-xl font-bold text-neutral-warm mb-3 group-hover:text-primary-blue transition-colors">
                              {step.title}
                            </h3>
                            <p className="text-neutral-cool leading-relaxed mb-4">
                              {step.description}
                            </p>

                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
});

export default ProcedureGuide;
