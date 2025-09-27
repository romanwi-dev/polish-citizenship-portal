import { Card, CardContent } from "@/components/ui/card";

export default function ClientProcessSection() {
  const steps = [
    {
      number: "1",
      title: "Free Assessment",
      description: "Submit your family history for eligibility evaluation"
    },
    {
      number: "2",
      title: "Document Collection",
      description: "We guide you through gathering required documents"
    },
    {
      number: "3",
      title: "Application Preparation",
      description: "Our experts prepare and review your application"
    },
    {
      number: "4",
      title: "Submission & Tracking",
      description: "We submit and monitor your application progress"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Simple 4-Step Process
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}