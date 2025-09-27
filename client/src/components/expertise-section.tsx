import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Shield, Users } from "lucide-react";

export default function ExpertiseSection() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "95% Success Rate",
      description: "Proven track record with thousands of successful applications"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "12-18 Months",
      description: "Average processing time with our expert guidance"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Expert Team",
      description: "Specialized lawyers with deep knowledge of Polish law"
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-blue-600" />,
      title: "Full Support",
      description: "From document gathering to final passport delivery"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose Our Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}