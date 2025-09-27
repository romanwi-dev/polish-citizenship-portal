

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Clock, CheckCircle, AlertTriangle, ArrowRight, Archive, Globe } from "lucide-react";
import { CitizenshipTestButton } from "@/components/citizenship-test-button";
import { Link } from "wouter";
import TipPlaceholder from "@/components/tip-placeholder";

export default function RequiredDocuments() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold mb-6">
            Document Requirements
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            Required Documents for
            <span className="block text-green-200">Polish Citizenship</span>
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            Complete guide to all documents needed for your Polish citizenship application
          </p>
        </div>
      </section>

      {/* Document Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-6">
              Document Categories
            </h2>
            <p className="text-lg text-neutral-cool max-w-3xl mx-auto">
              Documents are organized by category and importance level
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-3 h-6 w-6 text-red-500" />
                  Essential Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Absolutely required for every application
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Birth certificates (yours & ancestor's)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Marriage certificates
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Death certificates
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Current passport/ID
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Archive className="mr-3 h-6 w-6 text-amber-500" />
                  Historical Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Documents proving Polish origin and citizenship
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Polish birth/baptism records
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Immigration records
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Military service records
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Naturalization documents
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Globe className="mr-3 h-6 w-6 text-blue-500" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Additional evidence to strengthen your case
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    Census records
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    Church records
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    School records
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    Property records
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Document Checklist */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-12 text-center">
            Complete Document Checklist
          </h2>
          
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-warm">
                  Personal Documents (Applicant)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-neutral-cool">Long-form birth certificate</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-neutral-cool">Current passport copy</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-neutral-cool">Marriage certificate (if applicable)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-neutral-cool">Divorce decree (if applicable)</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-neutral-cool">Name change documents</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-neutral-cool">Educational certificates</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-warm">
                  Ancestral Line Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-neutral-cool">Polish ancestor's birth certificate</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-neutral-cool">Each generation's birth certificates</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-neutral-cool">Marriage certificates (all generations)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-neutral-cool">Death certificates (when applicable)</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-neutral-cool">Immigration/emigration records</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-neutral-cool">Naturalization documents</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Document Processing Requirements */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-12 text-center">
            Document Processing Requirements
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Globe className="mr-3 h-6 w-6 text-blue-500" />
                  Apostille/Legalization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Foreign documents must be properly authenticated
                </p>
                <div className="space-y-2 text-sm text-neutral-cool">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Apostille for Hague Convention countries
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Consular legalization for others
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-3 h-6 w-6 text-green-500" />
                  Translation Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  All documents must be translated to Polish
                </p>
                <div className="space-y-2 text-sm text-neutral-cool">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Sworn translator certification
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Official stamps and signatures
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="mr-3 h-6 w-6 text-amber-500" />
                  Timing Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Document validity and processing times
                </p>
                <div className="space-y-2 text-sm text-neutral-cool">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    6-month validity for some documents
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Processing can take 2-4 weeks
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-24 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Need Help Gathering Your Documents?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Our document procurement service can help you obtain all required documents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Start Document Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <CitizenshipTestButton 
              variant="hero" 
              text="Find Out If You Qualify" 
            />
          </div>
        </div>
      </section>


    </div>
  );
}