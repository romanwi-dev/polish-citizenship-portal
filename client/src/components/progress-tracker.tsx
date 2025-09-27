import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock3, ArrowRight } from "lucide-react";

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  estimatedTime: string;
}

export default function ProgressTracker() {
  const steps: ProgressStep[] = [
    {
      id: "assessment",
      title: "Initial Assessment",
      description: "Free eligibility evaluation and case analysis",
      status: "current",
      estimatedTime: "2-4 weeks"
    },
    {
      id: "research",
      title: "Document Research",
      description: "Archive searches and document procurement",
      status: "pending",
      estimatedTime: "6-18 months"
    },
    {
      id: "preparation",
      title: "Application Preparation",
      description: "Legal documentation and submission prep",
      status: "pending",
      estimatedTime: "2-4 weeks"
    },
    {
      id: "submission",
      title: "Government Submission",
      description: "Official application to Polish authorities",
      status: "pending",
      estimatedTime: "12-48 months"
    },
    {
      id: "passport",
      title: "Passport Application",
      description: "EU passport acquisition process",
      status: "pending",
      estimatedTime: "2-4 months"
    }
  ];

  return (
    <section id="progress-tracker" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="bg-primary-blue text-white px-6 py-3 rounded-full font-semibold mb-6">
            Process Tracking
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-6">
            Your Citizenship Journey
          </h2>
          <p className="text-lg text-neutral-cool max-w-2xl mx-auto">
            Track your progress through each stage of the Polish citizenship process with real-time updates.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Current Progress</CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-blue h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : step.status === 'current' ? (
                      <Clock3 className="h-6 w-6 text-primary-blue animate-pulse" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        step.status === 'current' ? 'text-primary-blue' : 
                        step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <Badge 
                        variant="secondary"
                        className="bg-gray-500 bg-opacity-60 text-white border-gray-400"
                      >
                        {step.estimatedTime}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                    
                    {step.status === 'current' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-sm text-primary-blue">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          <span className="font-medium">Currently in progress - estimated completion in 2-3 weeks</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">Important Notice</h4>
              <p className="text-amber-700 text-sm">
                Processing times are estimates based on current government workloads. We provide regular updates 
                and will notify you immediately of any changes to your timeline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}