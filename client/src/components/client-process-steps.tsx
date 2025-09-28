import { Check, MessageCircle, FileSearch, ChartBar, UserPlus, FileText, Send, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import SectionTitle from "@/components/SectionTitle";

const steps = [
  {
    number: "1",
    title: "FIRST CONTACT",
    description: "Reach out through our website, email, WhatsApp, or by recommendation to start your journey.",
    icon: MessageCircle,
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    action: { type: "scroll", target: "contact", label: "Contact Form" }
  },
  {
    number: "2",
    title: "ELIGIBILITY CHECK",
    description: "Take our Polish citizenship test and fill the family tree so we can determine your eligibility. If eligible, we move to the next stage.",
    icon: Check,
    color: "bg-green-600",
    lightColor: "bg-green-50",
    action: { type: "external", url: "https://polishcitizenship.typeform.com/to/PS5ecU", label: "Take Test" }
  },
  {
    number: "3",
    title: "DOCUMENT EXAMINATION",
    description: "We carefully examine your documents, especially Polish documents of ancestors and naturalization/military service documents.",
    icon: FileSearch,
    color: "bg-purple-600",
    lightColor: "bg-purple-50",
    action: { type: "link", href: "/dashboard", label: "Dashboard" }
  },
  {
    number: "4",
    title: "CASE ASSESSMENT",
    description: "We analyze your case and provide comprehensive assessment of chances, timeline, and costs involved.",
    icon: ChartBar,
    color: "bg-orange-600",
    lightColor: "bg-orange-50",
    action: { type: "scroll", target: "contact", label: "Schedule Consultation" }
  },
  {
    number: "5",
    title: "SEND DOCUMENTS",
    description: "Send by Fedex to our Warsaw's office",
    icon: Send,
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50",
    action: { type: "link", href: "/dashboard", label: "Dashboard" }
  },
  {
    number: "6",
    title: "AI DOCUMENT PROCESSING",
    description: "All documents are processed by our AI Documents System to generate Powers of Attorney and the Polish citizenship application.",
    icon: FileText,
    color: "bg-pink-600",
    lightColor: "bg-pink-50",
    action: { type: "link", href: "/dashboard", label: "Dashboard" }
  },
  {
    number: "7",
    title: "APPLICATION FILING",
    description: "Send Powers of Attorney by FedEx to our Warsaw office. We file your citizenship application with Polish authorities.",
    icon: Send,
    color: "bg-red-600",
    lightColor: "bg-red-50",
    action: { type: "link", href: "/document-processing", label: "Application Generation" }
  },
  {
    number: "8",
    title: "COMPREHENSIVE PROCESSING",
    description: "We handle all procedures simultaneously: sworn translations, archives search, Polish civil acts, and passport preparation. After about 12 months, we receive initial response from authorities.",
    icon: Globe,
    color: "bg-teal-600",
    lightColor: "bg-teal-50",
    action: { type: "scroll", target: "contact", label: "Schedule Consultation" }
  }
];

interface ClientProcessStepsProps {
  compact?: boolean;
}

export default function ClientProcessSteps({ compact = false }: ClientProcessStepsProps) {
  const handleAction = (action: any) => {
    if (action.type === 'scroll') {
      const element = document.getElementById(action.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action.type === 'external') {
      window.open(action.url, '_blank');
    }
  };

  if (compact) {
    // Compact version for home page
    return (
      <section id="client-process" className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionTitle 
              first="How to Become Our"
              second="Client"
            />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              8 Clear Steps to Polish Citizenship
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                  {/* Large number at top right inside card */}
                  <span className={`absolute top-2 right-3 text-5xl font-bold ${step.color.replace('bg-', 'text-')} opacity-90`}>
                    {step.number}
                  </span>
                  <div className={`w-12 h-12 ${step.lightColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  {step.action && (
                    step.action.type === 'link' ? (
                      <Link href={step.action.href!}>
                        <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold cursor-pointer">
                          {step.action.label} →
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAction(step.action)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                      >
                        {step.action.label} →
                      </button>
                    )
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Full version for dedicated page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <SectionTitle 
            first="How to Become Our"
            second="Client"
          />
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
            Follow these 8 clear steps to become our registered client and start your citizenship case
          </p>
        </div>

        <div className="relative">
          {/* Vertical timeline line for desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-red-600"></div>

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={index} className={`relative flex items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Content card */}
                  <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <Card className="p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative">
                      {/* Large number at top right inside card */}
                      <span className={`absolute top-4 right-4 text-7xl font-bold ${step.color.replace('bg-', 'text-')} opacity-90`}>
                        {step.number}
                      </span>
                      
                      <div className={`flex items-center gap-4 ${isEven ? 'lg:flex-row-reverse' : ''} mb-4`}>
                        <div className={`w-16 h-16 ${step.lightColor} rounded-full flex items-center justify-center`}>
                          <Icon className="h-8 w-8 text-gray-700" />
                        </div>
                        <div className={`flex-1 ${isEven ? 'lg:text-right' : ''}`}>
                          <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-lg text-gray-600 leading-relaxed mb-16">{step.description}</p>
                      
                      {/* Action button placed at bottom center of card */}
                      {step.action && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                          {step.action.type === 'link' ? (
                            <Link href={step.action.href!}>
                              <span className="inline-flex items-center px-4 py-2 bg-blue-600 bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-all cursor-pointer">
                                {step.action.label} →
                              </span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleAction(step.action)}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-all"
                            >
                              {step.action.label} →
                            </button>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center">
                    <div className={`w-6 h-6 ${step.color} rounded-full ring-4 ring-white shadow-lg`}></div>
                  </div>

                  {/* Empty space for opposite side */}
                  <div className="hidden lg:block w-5/12"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight tracking-tight">
              <span className="block text-white">Ready to Start Your</span>
              <span className="block text-white">Journey?</span>
            </h3>
            <p className="text-xl mb-6">Take the first step towards your Polish citizenship today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://polishcitizenship.typeform.com/to/PS5ecU"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Take Full Polish Citizenship Test
              </a>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-blue-800 text-white rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors"
              >
                Contact Us Now
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}