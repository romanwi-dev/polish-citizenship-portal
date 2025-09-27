

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitizenshipTestButton } from "@/components/citizenship-test-button";
import { Link } from "wouter";

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Maria Johnson",
      location: "Chicago, USA",
      content: "After 3 years of complex legal work, we finally received Polish citizenship. The process was challenging but their professional guidance through the archives research and government procedures was essential. Worth every effort for EU passport access.",
      rating: 5,
      timeline: "3 years",
      caseType: "Grandparent lineage"
    },
    {
      name: "David Thompson", 
      location: "Toronto, Canada",
      content: "The realistic timeline they provided - 2.5 years - proved accurate. Unlike other services promising 'fast results,' they delivered what they promised. The AI case analysis was remarkably precise about our family's documentation challenges.",
      rating: 5,
      timeline: "2.5 years",
      caseType: "Parent lineage with documents"
    },
    {
      name: "Anna Kowalski",
      location: "Sydney, Australia", 
      content: "22 years of expertise made the difference. They obtained our ancestor's 1923 Polish birth certificate from Ukrainian archives that three other companies couldn't find. Professional, honest about timelines, expensive but successful.",
      rating: 5,
      timeline: "4 years",
      caseType: "Great-grandparent lineage"
    },
    {
      name: "Robert Chen",
      location: "San Francisco, USA",
      content: "Thorough initial assessment saved us from pursuing an impossible case. They were honest that our family line wouldn't qualify under current law. This integrity impressed us - they could have taken our money but chose honesty.",
      rating: 5,
      timeline: "Assessment only",
      caseType: "Pre-1920 emigration"
    },
    {
      name: "Sarah Williams",
      location: "London, UK",
      content: "Complex case with missing documents. The team spent 18 months researching Polish and German archives. Found the critical 1925 birth certificate that proved our case. My children now have EU citizenship through Poland.",
      rating: 5,
      timeline: "3.5 years",
      caseType: "Missing documentation"
    },
    {
      name: "Michael O'Brien",
      location: "Dublin, Ireland",
      content: "Professional service from start to finish. Clear communication about realistic timelines (they said 30 months, it took 32). No false promises about 'fast and easy' - they deliver what they promise through proper legal work.",
      rating: 5,
      timeline: "32 months",
      caseType: "Standard case"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <CitizenshipTestButton 
              variant="default" 
              text="Start Your Eligibility Assessment" 
            />
          </div>

          <div className="text-center mb-16">
            <Badge className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Client Success Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real Client Testimonials
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Honest feedback from families who completed the Polish citizenship journey. These are real cases with realistic timelines - no false promises about "fast and easy" solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.timeline} • {testimonial.caseType}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="bg-blue-50 border-blue-200 inline-block">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <Users className="mr-3 h-8 w-8 text-blue-600" />
                  <div className="text-3xl font-bold text-blue-900">5,000+</div>
                </div>
                <p className="text-blue-800 font-semibold">
                  Successful Cases Since 2003
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Real families who achieved Polish citizenship through professional legal guidance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      

    </div>
  );
}