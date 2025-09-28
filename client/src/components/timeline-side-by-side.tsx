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
      title: "PART 1 - FIRST STEPS",
      description: "First contact, citizenship test, family tree, eligibility examination, and eligibility call",
      icon: Search,
      color: "bg-red-600",
      lightColor: "bg-red-50",
      timing: "Week 1",
      isMilestone: true
    },
    {
      number: 2,
      title: "PART 2 - TERMS & PRICING",
      description: "Initial assessment, full process info with pricing, client confirmation, and document list",
      icon: Scale,
      color: "bg-red-700",
      lightColor: "bg-red-50",
      timing: "Week 1-2"
    },
    {
      number: 3,
      title: "PART 3 - ADVANCE & ACCOUNT",
      description: "Advance payment processing and opening client portal account",
      icon: UserCheck,
      color: "bg-red-800",
      lightColor: "bg-red-50",
      timing: "Week 2",
      isMilestone: true
    },
    {
      number: 4,
      title: "PART 4 - DETAILS & POAs",
      description: "Client provides basic details, POA preparation, and signed documents via FedEx",
      icon: FileText,
      color: "bg-orange-600",
      lightColor: "bg-orange-50",
      timing: "Week 2-3"
    },
    {
      number: 5,
      title: "PART 5 - DATA & APPLICATION",
      description: "Master form completion, AI paperwork generation, and official citizenship application submission",
      icon: Send,
      color: "bg-orange-700",
      lightColor: "bg-orange-50",
      timing: "Week 3-4",
      isMilestone: true
    },
    {
      number: 6,
      title: "PART 6 - LOCAL DOCUMENTS",
      description: "Document clarification, gathering local documents, and partner collaboration for collection",
      icon: FileCheck,
      color: "bg-yellow-600",
      lightColor: "bg-yellow-50",
      timing: "Week 4-8",
      isMilestone: true
    },
    {
      number: 7,
      title: "PART 7 - POLISH DOCUMENTS",
      description: "Polish archives search, international search, and partner processing for archival documents",
      icon: Building2,
      color: "bg-yellow-700",
      lightColor: "bg-yellow-50",
      timing: "Week 4-12",
      isMilestone: true
    },
    {
      number: 8,
      title: "PART 8 - TRANSLATIONS",
      description: "AI translation service, certified sworn translator certification, and translation agent supervision",
      icon: Globe2,
      color: "bg-green-600",
      lightColor: "bg-green-50",
      timing: "Week 8-16",
      isMilestone: true
    },
    {
      number: 9,
      title: "PART 9 - FILING DOCUMENTS",
      description: "Submitting local documents and detailed family information before initial response",
      icon: Timer,
      color: "bg-green-700",
      lightColor: "bg-green-50",
      timing: "Week 12-18"
    },
    {
      number: 10,
      title: "PART 10 - CIVIL ACTS",
      description: "Polish civil acts applications, payment processing, and dedicated civil acts agent supervision",
      icon: ShieldCheck,
      color: "bg-green-800",
      lightColor: "bg-green-50",
      timing: "Week 16-20",
      isMilestone: true
    },
    {
      number: 11,
      title: "PART 11 - INITIAL RESPONSE",
      description: "Receiving initial response from Masovian Voivoda's office and extending procedure term",
      icon: Clock3,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      timing: "Month 10-18",
      isMilestone: true
    },
    {
      number: 12,
      title: "PART 12 - PUSH SCHEMES",
      description: "Offering push schemes (PUSH, NUDGE, SIT-DOWN) and implementing strategies in practice",
      icon: MapPin,
      color: "bg-blue-700",
      lightColor: "bg-blue-50",
      timing: "Month 12-20",
      isMilestone: true
    },
    {
      number: 13,
      title: "PART 13 - CITIZENSHIP DECISION",
      description: "Polish citizenship confirmation decision received and added to client portal account",
      icon: Crown,
      color: "bg-purple-600",
      lightColor: "bg-purple-50",
      timing: "Month 18-24",
      isImportant: true,
      isMilestone: true
    },
    {
      number: 14,
      title: "PART 14 - POLISH PASSPORT",
      description: "Document preparation, final payment, FedEx delivery, consulate visit, and passport application",
      icon: Award,
      color: "bg-purple-700",
      lightColor: "bg-purple-50",
      timing: "Month 20-26",
      isMilestone: true
    },
    {
      number: 15,
      title: "PART 15 - EXTENDED SERVICES",
      description: "Extended family legal services for comprehensive ongoing support",
      icon: Users,
      color: "bg-purple-800",
      lightColor: "bg-purple-50",
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
      className="py-16 relative bg-white dark:bg-gray-900"
      data-testid="polish-timeline-section"
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-9xl lg:text-[12rem] xl:text-[14rem] font-bold mb-6 tracking-tight leading-[0.8] antialiased" style={{textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased'}}>
            <span className="block text-black dark:text-white">Complete Legal Process</span>
            <span className="block text-blue-600 dark:text-blue-400">Timeline</span>
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#374151', 
            maxWidth: '768px', 
            margin: '0 auto'
          }}>
            Your journey to Polish citizenship through our comprehensive 15-part process. Many parts are processed SIMULTANEOUSLY to save time.
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
                        <span className={`text-7xl lg:text-8xl font-bold text-blue-900 dark:text-blue-400 transform transition-all duration-1000 hover:scale-110 z-10 relative`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                          {step.number}
                        </span>
                      </div>
                      
                      {/* Title - Flat on background */}
                      <div className="text-center mb-6">
                        <h3 className={`text-2xl font-bold text-gray-900 ${
                          step.isImportant ? 'text-red-800 text-3xl' : 
                          step.isMilestone ? 'text-blue-800 text-2xl' : ''
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
                  <div className={`w-full lg:w-8/12 xl:w-7/12 mt-4 lg:mt-0 ${isEven ? 'lg:pl-32 lg:pr-0' : 'lg:pr-32 lg:pl-0'}`}>
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
                            {step.number <= 3 ? "Initial Setup & Payment" :
                             step.number <= 5 ? "Details & Application" :
                             step.number <= 8 ? "Documentation & Translation" :
                             step.number <= 10 ? "Filing & Civil Acts" :
                             step.number <= 12 ? "Government Processing" :
                             step.number <= 13 ? "Citizenship Confirmation" :
                             "Passport & Extended Services"}
                          </p>
                        </div>
                        
                        <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-semibold text-blue-800">Priority</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {step.isImportant ? "Critical Milestone" :
                             step.isMilestone ? "Major Milestone" :
                             step.number <= 5 ? "Foundation Building" :
                             step.number <= 10 ? "Active Processing" :
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