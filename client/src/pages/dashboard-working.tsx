import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, CheckCircle2, User, FileText, Users, FileCheck } from 'lucide-react';



export default function DashboardWorking() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: "Client Details", icon: User },
    { id: 2, title: "Document Upload", icon: FileText },
    { id: 3, title: "Family Tree", icon: Users },
    { id: 4, title: "Generate Documents", icon: FileCheck }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const canGoNext = currentStep < steps.length;
  const canGoPrev = currentStep > 1;

  const nextStep = () => {
    if (canGoNext) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (canGoPrev) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-black">Polish Citizenship </span>
            <span className="text-blue-600">Application Workflow</span>
          </h1>
          <p className="text-gray-600 text-lg">Complete each step to prepare your citizenship documents</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = step.id === currentStep;
            const isPast = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                        isPast ? 'bg-green-600 border-green-600 text-white' : 
                        'bg-gray-100 border-gray-300 text-gray-400'}
                    `}
                  >
                    {isPast ? 
                      <CheckCircle2 className="w-6 h-6" /> : 
                      <IconComponent className="w-6 h-6" />
                    }
                  </div>
                  <span className={`text-sm mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    Step {step.id}
                  </span>
                </div>
                
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <ArrowRight className={`w-6 h-6 mx-4 ${isPast ? 'text-green-600' : 'text-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Content */}
        {currentStepData && (
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardContent className="p-8">
              {/* Step Header */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <currentStepData.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                  <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
                </div>
              </div>

              {/* Step Content */}
              <div className="mb-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <currentStepData.icon className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{currentStepData.title}</h3>
                  <p className="text-gray-600">Content for this step will be loaded here.</p>
                  <p className="text-sm text-gray-500 mt-4">Use the arrow buttons below to navigate between steps.</p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={prevStep}
                  disabled={!canGoPrev}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Step {currentStep} of {steps.length}</span>
                </div>

                <Button
                  onClick={nextStep}
                  disabled={!canGoNext}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={step.id} 
                className={`cursor-pointer transition-all ${step.id === currentStep ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id < currentStep ? 'bg-green-100 text-green-600' : 
                      step.id === currentStep ? 'bg-blue-100 text-blue-600' : 
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{step.title}</h3>
                      <p className="text-xs text-gray-500">
                        {step.id < currentStep ? 'Completed' : step.id === currentStep ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      

    </div>
  );
}