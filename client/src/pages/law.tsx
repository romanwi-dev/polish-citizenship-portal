

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CitizenshipTestButtonCalm } from "@/components/citizenship-test-button";
import { Scale, BookOpen, Calendar, Users, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import TipPlaceholder from "@/components/tip-placeholder";

export default function PolishCitizenshipLaw() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold mb-6">
            Polish Citizenship Law
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            Understanding Polish
            <span className="block text-blue-200">Citizenship Law</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Comprehensive guide to Polish citizenship by descent laws, requirements, and procedures
          </p>
        </div>
      </section>

      {/* Legal Framework */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-6">
              Legal Framework
            </h2>
            <p className="text-lg text-neutral-cool max-w-3xl mx-auto">
              Polish citizenship law is governed by specific statutes and historical considerations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Scale className="mr-3 h-6 w-6 text-blue-500" />
                  Current Law
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Act of April 2, 2009 on Polish Citizenship governs current procedures
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Birth to Polish citizen
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Recognition procedures
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Naturalization paths
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-3 h-6 w-6 text-amber-500" />
                  Historical Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Understanding Poland's complex 20th century history is crucial
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Border changes
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    War impacts
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    Legal transitions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-3 h-6 w-6 text-green-500" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Key requirements for citizenship by descent
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Polish ancestor
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Continuous transmission
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Documentary proof
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Legal Principles */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-12 text-center">
            Key Legal Principles
          </h2>
          
          <div className="space-y-8">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-neutral-warm mb-4">
                  Jus Sanguinis (Right of Blood)
                </h3>
                <p className="text-neutral-cool leading-relaxed">
                  Polish citizenship is primarily transmitted by descent. If you have a Polish ancestor who maintained 
                  their citizenship, you may be entitled to Polish citizenship regardless of where you were born.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-neutral-warm mb-4">
                  Continuous Citizenship Transmission
                </h3>
                <p className="text-neutral-cool leading-relaxed">
                  Citizenship must have been continuously transmitted from your Polish ancestor to you. 
                  Any break in this chain (such as naturalization elsewhere before 1951) may affect eligibility.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-neutral-warm mb-4">
                  Historical Legal Changes
                </h3>
                <p className="text-neutral-cool leading-relaxed">
                  Different laws applied in different time periods. The year your ancestor emigrated, 
                  when they naturalized elsewhere, and when children were born all affect the legal analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-24 bg-primary-blue text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Need Legal Analysis of Your Case?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our experts can analyze your specific situation under Polish citizenship law
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-white text-primary-blue hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Start Your Legal Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <CitizenshipTestButtonCalm 
              size="lg" 
              text="Take the Free Eligibility Test" 
            />
          </div>
        </div>
      </section>


    </div>
  );
}