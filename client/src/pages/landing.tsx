import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  Award, 
  ArrowRight,
  Shield,
  Globe,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { ThemeSwitcher } from "@/components/theme-switcher";

function LandingPage() {
  return (
    <>
      <ThemeSwitcher />
      <Helmet>
        <title>Polish Citizenship by Descent | Fast EU Passport Eligibility Check 2025</title>
        <meta name="description" content="Check your Polish citizenship by descent eligibility in minutes. Get your European Union passport through Polish ancestry. Free eligibility test, expert legal guidance, 95% success rate." />
        <meta name="keywords" content="Polish citizenship by descent, EU passport, Polish ancestry, European citizenship, Polish citizenship test, Polish genealogy, EU citizenship by descent" />
        <link rel="canonical" href="https://polishcitizenship.pl/landing" />
        
        {/* Critical Google PageSpeed 100 optimizations like latitudeworld.com */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//polishcitizenship.pl" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Geo-targeting for USA */}
        <meta name="geo.region" content="US" />
        <meta name="geo.country" content="United States" />
        <meta name="geo.placename" content="United States" />
        <meta name="ICBM" content="39.8283, -98.5795" />
        

        
        {/* Open Graph */}
        <meta property="og:title" content="Polish Citizenship by Descent | Fast EU Passport Eligibility Check" />
        <meta property="og:description" content="Check your Polish citizenship by descent eligibility in minutes. Get your European Union passport through Polish ancestry." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://polishcitizenship.pl/landing" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Polish Citizenship by Descent Services",
            "description": "Legal assistance for Polish citizenship by descent and EU passport acquisition",
            "provider": {
              "@type": "Organization",
              "name": "Polish Citizenship Services",
              "url": "https://polishcitizenship.pl"
            },
            "areaServed": "Worldwide",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Polish Citizenship Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Polish Citizenship Eligibility Assessment"
                  }
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen glass-surface">
        {/* Hero Section - Above the Fold */}
        <section className="glass-surface pt-4 pb-8 sm:py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            
            {/* Centered Title Section */}
            <div className="text-center mb-12">
              <Badge className="glass-card-danger mb-6 sm:mb-8 px-4 py-2">
                🇵🇱 EU Passport Through Polish Ancestry 🇪🇺
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8" style={{
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                letterSpacing: '-0.02em',
                lineHeight: '1.1'
              }}>
                <span className="text-gray-900 dark:text-white">Get Your</span>
                <br />
                <span className="text-blue-800 dark:text-blue-400">Polish Citizenship</span>
                <br />
                <span className="text-gray-900 dark:text-white">by Descent</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-4xl mx-auto" style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                letterSpacing: '-0.01em',
                lineHeight: '1.5'
              }}>
                Check your eligibility for Polish citizenship and European Union passport in under 3 minutes AI analysis. 
                Professional legal guidance with 100% success rate.
              </p>
            </div>

            {/* CTA Buttons - Centered */}
            <div className="flex flex-col lg:flex-row justify-center gap-6 mb-12">
              <Button 
                size="lg" 
                className="btn btn-primary px-8 py-8 text-xl font-semibold max-w-md"
                onClick={() => {
                  window.location.href = '/#top';
                }}
              >
                Visit Our Polish Citizenship Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="btn btn-primary px-8 py-8 text-xl font-semibold max-w-md"
                onClick={() => {
                  window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                }}
              >
                Take Full Polish Citizenship Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators - Centered */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Free Eligibility check
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                15-minute assessment
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-purple-500 mr-2" />
                5,000+ successful cases
              </div>
            </div>
              
            {/* Benefits Card - Below CTAs */}
            <div className="flex justify-center">
              <Card className="bg-white dark:bg-gray-800 shadow-2xl border-0 max-w-2xl w-full">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      EU Passport Benefits
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">Unlock European opportunities</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Live and work in 27 EU countries</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Free healthcare and education access</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Visa-free travel to 180+ countries</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Business opportunities across Europe</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Pass citizenship to your children</span>
                    </div>
                  </div>
                    
                    <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="flex items-center text-green-800">
                        <Award className="h-5 w-5 mr-2" />
                        <span className="font-semibold">100% Success Rate</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Based on 5,000+ completed applications
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        </section>

        {/* Quick Eligibility Check */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              <span className="text-gray-700 dark:text-gray-300">Am I Eligible for</span>
              <br />
              <span className="text-blue-800 dark:text-blue-400">Polish Citizenship?</span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12" style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
            }}>
              You may qualify if you have Polish ancestors. Check these common scenarios:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white dark:bg-gray-700 border-2 border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Eligibility Confirmation</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Check if You Qualify First
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-700 border-2 border-green-100 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Polish Grandparent</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Grandparent was Polish citizen
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-700 border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Polish Documents</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Have Polish birth certificates
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer"
                onClick={() => {
                  window.location.href = '/#top';
                }}
              >
                Visit Our Polish Citizenship Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                }}
              >
                Take Full Polish Citizenship Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                <span className="text-gray-700 dark:text-gray-300">Simple 3-Step</span>
                <br />
                <span className="text-blue-800 dark:text-blue-400">Application Process</span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600" style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
              }}>
                We handle the complex legal work while you focus on your future
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Eligibility Check
                </h3>
                <p className="text-gray-600 mb-4">
                  Take our 15-minute assessment to determine your qualification status
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  15 minutes
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Document Preparation
                </h3>
                <p className="text-gray-600 mb-4">
                  We gather and translate all required documents from Polish archives
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  3-9 months
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Citizenship Procedure
                </h3>
                <p className="text-gray-600 mb-4">
                  Submit application and receive your Polish citizenship certificate
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  18-36 months
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-blue-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8" style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              letterSpacing: '-0.02em'
            }}>
              Trusted by Thousands Worldwide
            </h2>
            
            <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-6 mx-auto max-w-5xl text-left mb-12">
              <p className="text-lg text-blue-800 font-semibold">
                We provide VIDEO TESTIMONIALS of our top real Clients with their contact details who are available to share their experience - with AI technology that checks and confirms their authenticity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-gray-600">Successful Applications</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Case Monitoring</div>
              </div>
            </div>
            
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 italic mb-4">
                  "Thanks to their expert guidance, I successfully obtained my Polish citizenship 
                  and EU passport. The process was smooth and well-organized."
                </blockquote>
                <div className="text-gray-600">
                  <strong>Sarah Johnson</strong> - USA → Poland → EU
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA - Performance Optimized */}
        <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-900 min-h-[400px] flex items-center performance-optimized lazy-section">
          <div className="container mx-auto px-4 max-w-4xl text-center text-white w-full">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Start Your Journey to EU Citizenship Today
            </h2>
            <p className="text-xl sm:text-2xl mb-8 opacity-90" style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)'
            }}>
              Join thousands who have already secured their European future through Polish ancestry
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer"
                onClick={() => {
                  window.location.href = '/#top';
                }}
              >
                Visit Our Polish Citizenship Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-8 sm:py-10 text-xl sm:text-2xl font-semibold w-full border border-white rounded-sm shadow-none cursor-pointer transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                }}
              >
                Take Full Polish Citizenship Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center text-sm opacity-75">
              <Shield className="h-4 w-4 mr-2" />
              <span>100% Confidential • No Obligation • Free Assessment</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default LandingPage;