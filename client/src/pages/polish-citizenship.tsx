import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Users, FileSearch, Gavel, Calendar, AlertCircle, ArrowRight, Info } from "lucide-react";
import { TrustBadges } from "@/components/trust-badges";

import { Helmet } from "react-helmet-async";

const PolishCitizenshipPage = () => {
  return (
    <>
      <Helmet>
        <title>Polish Citizenship by Descent 2025 | Expert Legal Services | Get Polish Citizenship</title>
        <meta name="description" content="Polish citizenship through ancestry - complete guide for 2025. Polish citizenship 1920 law, Jewish ancestry paths, documents needed, processing times. Professional legal assistance from experienced attorneys." />
        <meta name="keywords" content="polish citizenship, polish citizenship by descent, polish citizenship 1920, polish citizenship jewish ancestry, polish citizenship requirements, polish citizenship processing time 2025, how to get polish citizenship, polish citizenship documents" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Polish Citizenship by Descent - Complete Guide 2025" />
        <meta property="og:description" content="Discover if you qualify for Polish citizenship through ancestry. Expert legal guidance for citizenship applications based on the 1920 law." />
        <meta property="og:type" content="website" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Polish Citizenship by Descent Legal Services",
            "description": "Professional legal assistance for obtaining Polish citizenship through ancestry",
            "provider": {
              "@type": "LegalService",
              "name": "Polish Citizenship Legal Services",
              "priceRange": "$2999-$7999"
            },
            "areaServed": "Worldwide",
            "serviceType": "Polish Citizenship Application"
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        
        {/* Hero Section - Polish Citizenship Focus */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-white via-red-50 to-red-100">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Polish Citizenship
                  <span className="block text-2xl md:text-3xl mt-2 text-red-600">
                    by Descent & Ancestry
                  </span>
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Reclaim your Polish heritage and gain EU citizenship through your ancestors. 
                  Expert legal guidance for applications based on the 1920 citizenship law.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/citizenship-test">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                      Free Eligibility Check
                    </Button>
                  </Link>
                  <Link href="#citizenship-paths">
                    <Button size="lg" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                      View Citizenship Paths
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-2xl border-2 border-red-100">
                <h2 className="text-2xl font-semibold mb-4">Key Requirements</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Polish Ancestor:</strong> Born before 1920</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Unbroken Line:</strong> Citizenship passed down</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>Documents:</strong> Birth & marriage certificates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <span><strong>No Residency:</strong> Apply from anywhere</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Polish Citizenship Paths */}
        <section id="citizenship-paths" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Citizenship Paths in 2025
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <Users className="h-10 w-10 text-blue-600 mb-3" />
                  <CardTitle>Direct Descent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Parent or grandparent was a Polish citizen
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Fastest processing (3-6 months)</li>
                    <li>✓ Straightforward documentation</li>
                    <li>✓ Highest approval rate (95%+)</li>
                    <li>✓ No language requirements</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-green-200 transition-colors">
                <CardHeader>
                  <FileSearch className="h-10 w-10 text-green-600 mb-3" />
                  <CardTitle>Jewish Ancestry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Ancestors left Poland before 1968
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Special provisions apply</li>
                    <li>✓ Holocaust survivor paths</li>
                    <li>✓ 1968 emigration clause</li>
                    <li>✓ Restored citizenship option</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardHeader>
                  <Gavel className="h-10 w-10 text-purple-600 mb-3" />
                  <CardTitle>Legal Recognition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Great-grandparent or earlier ancestor
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Complex cases accepted</li>
                    <li>✓ Archive research included</li>
                    <li>✓ Expert legal arguments</li>
                    <li>✓ Appeals if needed</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 1920 Law Explanation */}
        <section className="py-16 px-4 bg-blue-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Understanding the Polish Citizenship 1920 Law
            </h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      The 1920 Citizenship Act
                    </h3>
                    <p className="text-gray-700 mb-4">
                      On January 31, 1920, Poland enacted its first citizenship law, automatically granting 
                      Polish citizenship to anyone residing in Polish territory. This is the foundation for 
                      most citizenship by descent claims today.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Key Provisions:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">1.</span>
                        <div>
                          <strong>Automatic Citizenship:</strong> Anyone living in Poland on January 31, 1920 
                          became a Polish citizen, regardless of ethnicity or religion.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">2.</span>
                        <div>
                          <strong>Hereditary Principle:</strong> Polish citizenship passes automatically to 
                          children, even if born abroad.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">3.</span>
                        <div>
                          <strong>No Expiration:</strong> Polish citizenship doesn't expire and cannot be lost 
                          involuntarily (with limited exceptions).
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-blue-600">4.</span>
                        <div>
                          <strong>Gender Equality (post-1951):</strong> After 1951, women could pass citizenship 
                          to their children equally with men.
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <strong className="text-yellow-800">Important Note:</strong>
                        <p className="text-sm text-yellow-700 mt-1">
                          If your ancestor left Poland before 1920, special provisions may apply. 
                          Our legal team specializes in these complex cases.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Documents Required */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Citizenship Documents Required
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">From Poland</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Birth Certificates</strong>
                        <p className="text-sm text-gray-600">Polish ancestor's birth record from archives</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Marriage Certificates</strong>
                        <p className="text-sm text-gray-600">If applicable, from Polish archives</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Military Records</strong>
                        <p className="text-sm text-gray-600">Service in Polish army (if applicable)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <strong>Passport/ID Records</strong>
                        <p className="text-sm text-gray-600">Historical Polish documents</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">From Your Country</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Your Birth Certificate</strong>
                        <p className="text-sm text-gray-600">With apostille and translation</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Parents' Documents</strong>
                        <p className="text-sm text-gray-600">Birth and marriage certificates</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Name Change Records</strong>
                        <p className="text-sm text-gray-600">If names were changed</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileSearch className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <strong>Immigration Records</strong>
                        <p className="text-sm text-gray-600">Ship manifests, naturalization</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Don't Have All Documents?</h3>
                  <p className="text-gray-700">
                    Our team specializes in archival research across Poland, Ukraine, Belarus, and Lithuania. 
                    We can locate missing documents and work with incomplete records. Many successful cases 
                    started with just a family name and approximate birth year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Processing Timeline */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Citizenship Processing Time 2025
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Document Collection</h3>
                    <p className="text-gray-600">1-3 months for gathering and translating documents</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Application Submission</h3>
                    <p className="text-gray-600">2-4 weeks for preparation and filing</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Government Review</h3>
                    <p className="text-gray-600">6-12 months for standard processing</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Citizenship Confirmation</h3>
                    <p className="text-gray-600">Official certificate issued</p>
                  </div>
                </div>
              </div>
              
              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Total Timeline:</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">9-18</p>
                      <p className="text-sm text-gray-600">Standard (months)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">6-12</p>
                      <p className="text-sm text-gray-600">Express (months)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">3-6</p>
                      <p className="text-sm text-gray-600">Simple cases (months)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Polish Citizenship Success Rate
            </h2>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-blue-600">2,847</p>
                  <p className="text-gray-600">Successful Cases</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-green-600">94%</p>
                  <p className="text-gray-600">Success Rate</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-purple-600">47</p>
                  <p className="text-gray-600">Countries Served</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-red-600">20+</p>
                  <p className="text-gray-600">Years Experience</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-red-600 to-red-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Your Polish Citizenship Journey Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands who have successfully reclaimed their Polish heritage. 
              Our expert legal team will guide you through every step of the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/citizenship-test">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                  Check Your Eligibility
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Book Free Consultation
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

export default PolishCitizenshipPage;