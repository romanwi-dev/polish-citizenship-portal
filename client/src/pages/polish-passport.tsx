import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, FileText, Shield, Plane, Award, ArrowRight, Info } from "lucide-react";
import { TrustBadges } from "@/components/trust-badges";

import { Helmet } from "react-helmet-async";

const PolishPassportPage = () => {
  return (
    <>
      <Helmet>
        <title>Polish Passport Application 2025 | EU Travel Freedom | Get Your Polish Passport</title>
        <meta name="description" content="Apply for your Polish passport in 2025. Complete guide to Polish passport requirements, costs, processing times. EU passport benefits: visa-free travel to 180+ countries. Expert legal assistance available." />
        <meta name="keywords" content="polish passport, polish passport application, polish passport cost, polish passport requirements, EU passport, polish passport processing time 2025, how to get polish passport, polish passport renewal" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Polish Passport Application Guide 2025 | Get EU Passport" />
        <meta property="og:description" content="Expert guide to obtaining your Polish passport. Requirements, costs, timeline, and professional legal assistance for Polish passport applications." />
        <meta property="og:type" content="website" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Polish Passport Application Services",
            "description": "Professional legal assistance for Polish passport applications and renewals",
            "provider": {
              "@type": "LegalService",
              "name": "Polish Citizenship Legal Services"
            },
            "areaServed": "Worldwide",
            "serviceType": "Polish Passport Application",
            "offers": {
              "@type": "Offer",
              "price": "2999",
              "priceCurrency": "USD",
              "name": "Complete Polish Passport Application Package"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        
        {/* Hero Section - Polish Passport Focus */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-red-600 via-red-500 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Polish Passport
                  <span className="block text-2xl md:text-3xl mt-2 font-normal">
                    Your Gateway to European Union
                  </span>
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  Unlock visa-free travel to 180+ countries with your Polish passport. 
                  Professional legal assistance for applications and renewals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/citizenship-test">
                    <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                      Check Eligibility Now
                    </Button>
                  </Link>
                  <Link href="#passport-benefits">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      View Benefits
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4">Quick Facts</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Processing Time:</strong> 3-6 months average</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Validity:</strong> 10 years (5 for children)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Visa-Free Countries:</strong> 180+</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>EU Rights:</strong> Work, study, live anywhere in EU</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Polish Passport Benefits */}
        <section id="passport-benefits" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Passport Benefits in 2025
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Plane className="h-10 w-10 text-blue-600 mb-3" />
                  <CardTitle>Global Mobility</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Visa-free travel to USA (ESTA)</li>
                    <li>• Access to Canada (eTA)</li>
                    <li>• Freedom across all EU/Schengen</li>
                    <li>• Travel to UK, Australia, Japan</li>
                    <li>• 180+ destinations worldwide</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-green-600 mb-3" />
                  <CardTitle>EU Citizenship Rights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Live in any EU country</li>
                    <li>• Work without permits</li>
                    <li>• Study at EU rates</li>
                    <li>• Access to healthcare</li>
                    <li>• Consular protection worldwide</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Award className="h-10 w-10 text-purple-600 mb-3" />
                  <CardTitle>Lifetime Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Pass to your children</li>
                    <li>• No residency requirements</li>
                    <li>• Dual citizenship allowed</li>
                    <li>• Business opportunities in EU</li>
                    <li>• Retirement in Europe</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Polish Passport Requirements */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Passport Requirements
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">First-Time Polish Passport</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Polish Citizenship Certificate</strong>
                        <p className="text-sm text-gray-600">Official confirmation from Polish authorities</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Birth Certificate</strong>
                        <p className="text-sm text-gray-600">With apostille and translation</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Biometric Photos</strong>
                        <p className="text-sm text-gray-600">2 photos meeting Polish standards</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Application Form</strong>
                        <p className="text-sm text-gray-600">Completed in Polish language</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Polish Passport Renewal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Current/Expired Polish Passport</strong>
                        <p className="text-sm text-gray-600">Original document required</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>New Biometric Photos</strong>
                        <p className="text-sm text-gray-600">Recent photos (within 6 months)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Renewal Application</strong>
                        <p className="text-sm text-gray-600">Simplified process for renewals</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Proof of Identity</strong>
                        <p className="text-sm text-gray-600">Current ID or driver's license</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Polish Passport Cost */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Passport Cost 2025
            </h2>
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Government Fees</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Standard Passport (10 years)</span>
                        <strong>$140</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>Child Passport (5 years)</span>
                        <strong>$70</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>Express Processing</span>
                        <strong>+$60</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>Temporary Passport</span>
                        <strong>$30</strong>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Our Service Packages</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Document Preparation</span>
                        <strong>$499</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>Full Application Support</span>
                        <strong>$999</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>Citizenship + Passport</span>
                        <strong>$2,999</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>Express Service</span>
                        <strong>$4,999</strong>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm">
                      <strong>Note:</strong> Total costs may vary based on document requirements, 
                      translations, apostilles, and shipping. Contact us for a personalized quote.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Polish Passport Timeline */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Passport Processing Time
            </h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Standard Processing</h3>
                      <p className="text-gray-600">3-6 months from application submission</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Express Processing</h3>
                      <p className="text-gray-600">4-8 weeks with priority handling</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Renewal Processing</h3>
                      <p className="text-gray-600">2-4 months for passport renewals</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Your Polish Passport?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands who have successfully obtained their Polish passports with our expert assistance.
              Professional legal support throughout the entire process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/citizenship-test">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <TrustBadges />
          </div>
        </section>

  
      </div>
    </>
  );
};

export default PolishPassportPage;