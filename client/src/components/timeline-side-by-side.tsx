import { memo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  FileText, 
  Send, 
  ShieldCheck, 
  Clock3, 
  CheckCircle2, 
  Globe2, 
  MapPin, 
  UserCheck, 
  Heart, 
  Award,
  Scale,
  Building2,
  FileCheck,
  Timer,
  Crown,
  Users
} from "lucide-react";

const PolishCrownTimeline = memo(function PolishCrownTimeline() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  const steps = [
    {
      number: 1,
      title: "INITIAL CONSULTATION",
      description: "Comprehensive assessment of your family heritage and Polish ancestry eligibility",
      icon: Search,
      color: "bg-red-600",
      lightColor: "bg-red-50",
      timing: "Day 1"
    },
    {
      number: 2,
      title: "LEGAL CASE ANALYSIS", 
      description: "Expert legal review of your lineage under Polish citizenship law with success probability",
      icon: Scale,
      color: "bg-red-700",
      lightColor: "bg-red-50",
      timing: "Week 1"
    },
    {
      number: 3,
      title: "POLISH ARCHIVES RESEARCH",
      description: "Systematic search through Civil Registry offices and municipal archives in Poland",
      icon: Building2,
      color: "bg-red-800",
      lightColor: "bg-red-50",
      timing: "Weeks 1-4"
    },
    {
      number: 4,
      title: "INTERNATIONAL ARCHIVES SEARCH",
      description: "Research across Ukrainian, Lithuanian and international archives for historical documents",
      icon: Globe2,
      color: "bg-red-900",
      lightColor: "bg-red-50",
      timing: "Weeks 2-6"
    },
    {
      number: 5,
      title: "DOCUMENT AUTHENTICATION",
      description: "Professional apostille certification and certified Polish translation services",
      icon: FileCheck,
      color: "bg-green-600",
      lightColor: "bg-green-50",
      timing: "Weeks 4-8"
    },
    {
      number: 6,
      title: "APPLICATION PREPARATION",
      description: "Meticulous preparation and comprehensive legal review of your citizenship application",
      icon: FileText,
      color: "bg-green-700",
      lightColor: "bg-green-50",
      timing: "Weeks 6-10"
    },
    {
      number: 7,
      title: "GOVERNMENT SUBMISSION",
      description: "Official submission to the Masovian Voivoda's Office in Warsaw with tracking setup",
      icon: Send,
      color: "bg-green-800",
      lightColor: "bg-green-50",
      timing: "Week 10"
    },
    {
      number: 8,
      title: "GOVERNMENT REVIEW PROCESS",
      description: "Polish authorities review your case while we monitor progress and handle requests",
      icon: Timer,
      color: "bg-green-900",
      lightColor: "bg-green-50",
      timing: "Months 3-18"
    },
    {
      number: 9,
      title: "POLISH CITIZENSHIP CONFIRMATION",
      description: "Receive official citizenship confirmation recognizing you as a Polish and EU citizen",
      icon: Crown,
      color: "bg-red-600",
      lightColor: "bg-red-100",
      timing: "Month 18",
      isImportant: true
    },
    {
      number: 10,
      title: "POLISH CIVIL DOCUMENTS",
      description: "Obtain official Polish birth certificate and civil acts for passport application",
      icon: UserCheck,
      color: "bg-blue-700",
      lightColor: "bg-blue-50",
      timing: "Weeks 1-2"
    },
    {
      number: 11,
      title: "EU PASSPORT APPLICATION",
      description: "Complete Polish passport application with consulate appointment and biometric processing",
      icon: Award,
      color: "bg-blue-800",
      lightColor: "bg-blue-50",
      timing: "Weeks 2-6"
    },
    {
      number: 12,
      title: "FAMILY EXTENSION SERVICES", 
      description: "Assistance extending citizenship to spouse and children with ongoing EU rights support",
      icon: Users,
      color: "bg-blue-900",
      lightColor: "bg-blue-50",
      timing: "Ongoing"
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const stepNumber = parseInt(entry.target.getAttribute('data-step') || '0');
          if (entry.isIntersecting) {
            setVisibleSteps(prev => new Set(prev).add(stepNumber));
          }
        });
      },
      { threshold: 0.3, rootMargin: '-50px 0px' }
    );

    const stepElements = document.querySelectorAll('[data-step]');
    stepElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      id="process" 
      className="py-16 relative"
      data-testid="polish-timeline-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="block text-neutral-warm">Complete Legal Process</span>
            <span className="block text-primary-blue">Timeline</span>
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#374151', 
            maxWidth: '768px', 
            margin: '0 auto'
          }}>
            Your journey to Polish citizenship through our comprehensive 12-step process. Many steps are processed SIMULTANEOUSLY to save time.
          </p>
        </div>

        <div className="relative">
          {/* Vertical timeline line for desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-red-600 via-red-700 to-red-800"></div>

          <div className="space-y-16 mt-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              const isVisible = visibleSteps.has(step.number);
              
              return (
                <div 
                  key={index} 
                  data-step={step.number}
                  className={`relative flex flex-col lg:flex-row lg:items-center ${isEven ? '' : 'lg:flex-row-reverse'} transition-all ease-out transform ${
                    isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-85'
                  }`}
                  style={{
                    transitionDuration: '4000ms'
                  }}
                  data-testid={`timeline-step-${step.number}`}
                >
                  {/* Content - Flat on Background */}
                  <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-8' : 'lg:pl-8'}`}>
                    <div className="relative py-4">
                      {/* Step Number - Above title */}
                      <div className="text-center mb-8">
                        <span className={`text-6xl font-bold ${step.color.replace('bg-', 'text-')} opacity-30`}>
                          {step.number}
                        </span>
                      </div>
                      
                      {/* Title - Flat on background */}
                      <div className="text-center mb-6">
                        <h3 className={`text-2xl font-bold text-gray-900 ${
                          step.isImportant ? 'text-red-800 text-3xl' : ''
                        }`}>
                          {step.title}
                        </h3>
                      </div>
                      
                      {/* Description - Flat on background */}
                      <p className="text-lg text-gray-600 leading-relaxed text-center max-w-md mx-auto">{step.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center">
                    <div className={`w-6 h-6 ${step.color} rounded-full ring-4 ring-white shadow-lg`}></div>
                  </div>

                  {/* Infographic Board - Below content on mobile, pushed to screen edges on desktop */}
                  <div className={`w-full lg:w-5/12 mt-4 lg:mt-0 ${isEven ? 'lg:pl-32 lg:pr-0' : 'lg:pr-32 lg:pl-0'}`}>
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      {/* Infographic Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Step {step.number} Info
                          </span>
                        </div>
                        <div className={`w-8 h-8 ${step.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      
                      {/* Key Facts */}
                      <div className="space-y-3">
                        <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock3 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">Duration</span>
                          </div>
                          <p className="text-sm text-gray-700">{step.timing}</p>
                        </div>
                        
                        <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-blue-800">Key Action</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {step.number <= 3 ? "Assessment & Research Phase" :
                             step.number <= 6 ? "Documentation & Preparation" :
                             step.number <= 8 ? "Government Processing" :
                             step.number <= 9 ? "Citizenship Confirmation" :
                             "Document & Passport Phase"}
                          </p>
                        </div>
                        
                        <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-semibold text-blue-800">Priority</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {step.isImportant ? "Critical Milestone" :
                             step.number <= 4 ? "Foundation Building" :
                             step.number <= 8 ? "Process Execution" :
                             "Final Achievement"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

export default PolishCrownTimeline;