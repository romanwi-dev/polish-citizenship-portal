
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, CheckCircle2, Clock3, Users2 } from "lucide-react";
import { Link } from "wouter";

export default function CitizenshipTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-16">
            <Badge className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Most Comprehensive Online Test
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              CITIZENSHIP TEST
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              Take the most comprehensive and accurate eligibility test that exists to check your Polish citizenship eligibility online.
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Based on 20+ years of experience and 5,000+ successful cases, this is the definitive assessment tool for Polish citizenship by descent.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="text-center p-6 bg-blue-50 border-blue-200">
              <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Most Accurate Online</h3>
              <p className="text-blue-700 text-sm">The most comprehensive test available - more accurate than any other online assessment</p>
            </Card>
            
            <Card className="text-center p-6 bg-green-50 border-green-200">
              <Clock3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">10-15 Minutes</h3>
              <p className="text-green-700 text-sm">Quick assessment with immediate preliminary results</p>
            </Card>
            
            <Card className="text-center p-6 bg-purple-50 border-purple-200">
              <Users2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Expert Review</h3>
              <p className="text-purple-700 text-sm">Professional analysis of your case within 48 hours</p>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-12">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Take the Most Comprehensive Citizenship Test</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                This is the most accurate and comprehensive Polish citizenship eligibility test available online. Developed from analyzing 5,000+ successful cases over 20+ years of specialized legal practice.
              </p>
              
              <a
                href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  size="lg" 
                  className="bg-red-800 hover:bg-red-900 text-white font-medium px-8 py-4 text-xl"
                >
                  TAKE CITIZENSHIP TEST
                  <ExternalLink className="ml-2 h-6 w-6" />
                </Button>
              </a>
              
              <p className="text-sm text-blue-200 mt-4">
                Most comprehensive online test • Completely confidential • No obligations
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">What We'll Assess</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Your Polish ancestor's birth year and emigration timeline</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Available Polish documents and civil registry records</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Family lineage and citizenship transmission requirements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Case complexity and potential challenges</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Realistic timeline and cost estimates</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">After the Assessment</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Immediate preliminary eligibility indication</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Professional review within 48 hours</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Detailed case assessment report via email</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Realistic timeline and cost breakdown</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Next steps and documentation requirements</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
      

    </div>
  );
}