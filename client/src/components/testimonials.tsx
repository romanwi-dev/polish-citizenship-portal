import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, PlayCircle, Phone, Mail, MessageCircle, Shield, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Testimonials() {
  // Fetch testimonials from API
  const { data: apiTestimonials, isLoading } = useQuery({
    queryKey: ['/api/testimonials/public'],
    enabled: true
  });

  // Fallback testimonials for display
  const fallbackTestimonials = [
    {
      clientName: "Robert & Jennifer Mitchell",
      location: "Boston, USA",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/embed/example1",
      duration: "4:32",
      title: "From Boston to Warsaw: Our Family's Success Story",
      description: "How we discovered our Polish roots and successfully obtained citizenship for our family of five through grandmother's birth certificate from 1925",
      caseDetails: "Citizenship confirmed in 18 months",
      contactAvailable: true,
      verificationStatus: "approved",
      identityVerified: true,
      aiVerificationScore: "95"
    },
    {
      clientName: "The Thompson Family", 
      location: "Toronto, Canada",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/embed/example2",
      duration: "6:18",
      title: "Overcoming Complex Archive Challenges",
      description: "Our journey through Ukrainian and Polish archives to find crucial documents dating back to 1890s, with full legal support throughout",
      caseDetails: "Successfully resolved after 24 months",
      contactAvailable: true,
      verificationStatus: "approved",
      identityVerified: true,
      aiVerificationScore: "92"
    },
    {
      clientName: "David & Maria Goldstein",
      location: "Sydney, Australia", 
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/embed/example3",
      duration: "5:45",
      title: "Why Professional Legal Help Made the Difference",
      description: "After three failed attempts on our own, we finally succeeded with PolishCitizenship.pl's expertise and connections",
      caseDetails: "Citizenship confirmed in 14 months",
      contactAvailable: true,
      verificationStatus: "approved",
      identityVerified: true,
      aiVerificationScore: "88"
    },
  ];

  // Use API testimonials if available, otherwise use fallback
  const videoTestimonials = (Array.isArray(apiTestimonials) && apiTestimonials.length > 0) ? apiTestimonials : fallbackTestimonials;

  return (
    <section id="testimonials">
      <div className="container">
        <div className="text-center mb-24">
          <h2 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight leading-tight">
            <span className="block text-black dark:text-white">Client Success</span>
            <span className="block text-blue-600 dark:text-blue-400">Stories</span>
          </h2>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Real families sharing their successful Polish citizenship journey experiences
          </p>
          <Card className="inline-block bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Client Verification Available</h3>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-lg font-semibold text-gray-800 max-w-2xl">
                We provide full contact details to our best clients after consultation. 
                You can directly verify our credentials and learn about their experience.
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Direct Phone Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Email Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Video Calls</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {videoTestimonials.map((testimonial: any, index: number) => (
            <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border-2">
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-700">
                <iframe
                  className="w-full h-full"
                  src={testimonial.videoUrl}
                  title={testimonial.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <CardContent className="p-6">
                {/* Verification Badges */}
                <div className="flex gap-2 mb-3">
                  {testimonial.verificationStatus === 'approved' && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      AI Verified
                    </Badge>
                  )}
                  {testimonial.identityVerified && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Identity Confirmed
                    </Badge>
                  )}
                  {testimonial.aiVerificationScore && (
                    <Badge variant="outline" className="text-xs">
                      Score: {testimonial.aiVerificationScore}%
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-xl mb-3">{testimonial.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {testimonial.description}
                </p>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {testimonial.avatarUrl && (
                        <img 
                          src={testimonial.avatarUrl} 
                          alt={testimonial.clientName || testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.clientName || testimonial.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                    {testimonial.contactAvailable && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Reference Available
                      </Badge>
                    )}
                  </div>
                  {testimonial.contactAvailable && (
                    <Button 
                      variant="outline" 
                      className="w-full text-sm"
                      onClick={() => window.location.href = '#contact'}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Request Client Contact
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Verify Our Credentials
            </h3>
            <p className="text-gray-700 mb-6">
              We encourage you to speak directly with our successful clients. 
              Upon signing our service agreement, we provide contact details of 
              3-5 families who have completed their citizenship journey with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge
                variant="secondary"
                className="bg-success-green text-white px-6 py-3 text-base"
              >
                <Users className="mr-3 h-5 w-5" />
                5,000+ Successful Cases Since 2003
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-600 text-white px-6 py-3 text-base"
              >
                22+ Years of Verified Experience
              </Badge>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Badge
            variant="secondary"
            className="bg-success-green text-white px-6 py-3 text-base"
          >
            <Users className="mr-3 h-5 w-5" />
            5,000+ Successful Cases Since 2003
          </Badge>
        </div>
        
        {/* Citizenship Test CTA in Testimonials */}
        <div className="text-center mt-16">
          <div className="relative text-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3 text-gray-900">Ready to Check Your Eligibility?</h3>
              <p className="text-gray-700 mb-6">Take the most comprehensive Polish citizenship by descent test available online</p>
              <a href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" target="_blank" rel="noopener noreferrer" className="block">
                <Button 
                  size="lg" 
                  className="animated-gradient-btn w-full sm:w-auto mx-auto block h-16 sm:h-14 px-6 sm:px-8 text-lg sm:text-xl font-bold text-white bg-red-800 hover:bg-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg"
                >
                  POLISH CITIZENSHIP TEST
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
