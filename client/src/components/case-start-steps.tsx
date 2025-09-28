import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { UserPlus, FileText, Bot, Users, Send } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "LOGIN TO YOUR ACCOUNT",
    description: "Sign in to our digital legal online platform to get started with your citizenship journey.",
    icon: UserPlus,
    color: "bg-blue-600",
    lightColor: "bg-blue-50",
    action: { type: "link", href: "/api/login", label: "Login" }
  },
  {
    number: "2",
    title: "FILL CLIENT DETAILS",
    description: "Complete a simple form with data from your passport, birth and marriage certificates, plus contact information.",
    icon: FileText,
    color: "bg-green-600",
    lightColor: "bg-green-50",
    action: { type: "link", href: "/onboarding", label: "Client Details Form" }
  },
  {
    number: "3",
    title: "AI DOCUMENT PROCESSING",
    description: "Process your basic documents: passport, birth and marriage certificates through our AI Document Processing System.",
    icon: Bot,
    color: "bg-purple-600",
    lightColor: "bg-purple-50",
    action: { type: "link", href: "/dashboard", label: "Dashboard" }
  },
  {
    number: "4",
    title: "BUILD FAMILY TREE",
    description: "Fill your family tree with our online Family Tree Builder to document your Polish ancestry.",
    icon: Users,
    color: "bg-orange-600",
    lightColor: "bg-orange-50",
    action: { type: "link", href: "/family-tree", label: "Family Tree Builder" }
  },
  {
    number: "5",
    title: "GENERATE & SEND DOCUMENTS",
    description: "Generate Power of Attorney, Polish citizenship application and family tree in PDF format and email them to info@polishcitizenship.pl",
    icon: Send,
    color: "bg-red-600",
    lightColor: "bg-red-50",
    action: { type: "email", email: "info@polishcitizenship.pl", label: "Email Documents" }
  }
];

interface CaseStartStepsProps {
  compact?: boolean;
}

export default function CaseStartSteps({ compact = false }: CaseStartStepsProps) {
  const handleAction = (action: any) => {
    if (action.type === 'scroll') {
      const element = document.getElementById(action.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action.type === 'external') {
      window.open(action.url, '_blank');
    } else if (action.type === 'email') {
      window.location.href = `mailto:${action.email}`;
    }
  };

  if (compact) {
    // Compact version for home page
    return (
      <section id="case-start" className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              How to Start Your Case
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              5 Simple Steps to Begin Your Citizenship Application
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                      step.action.href === '/api/login' ? (
                        <a
                          href={step.action.href}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold cursor-pointer"
                        >
                          {step.action.label} →
                        </a>
                      ) : (
                        <Link href={step.action.href!}>
                          <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold cursor-pointer">
                            {step.action.label} →
                          </span>
                        </Link>
                      )
                    ) : step.action.type === 'email' ? (
                      <a
                        href={`mailto:${step.action.email}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                      >
                        {step.action.label} →
                      </a>
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
          <h1 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            How to Start Your Case
          </h1>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
            Follow these 5 simple steps to begin your Polish citizenship application
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
                            step.action.href === '/api/login' ? (
                              <a
                                href={step.action.href}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-all cursor-pointer"
                              >
                                {step.action.label} →
                              </a>
                            ) : (
                              <Link href={step.action.href!}>
                                <span className="inline-flex items-center px-4 py-2 bg-blue-600 bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-all cursor-pointer">
                                  {step.action.label} →
                                </span>
                              </Link>
                            )
                          ) : step.action.type === 'email' ? (
                            <a
                              href={`mailto:${step.action.email}`}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 bg-opacity-60 text-white rounded-lg hover:bg-opacity-80 transition-all"
                            >
                              {step.action.label} →
                            </a>
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
        <div className="text-center mt-16">
          <a href="/api/login">
            <button className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
              Login to Start Your Application →
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}