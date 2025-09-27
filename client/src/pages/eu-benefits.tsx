

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Briefcase, GraduationCap, Heart, Home, Shield, ArrowRight, MapPin, Users, Euro } from "lucide-react";
import { CitizenshipTestButtonCalm } from "@/components/citizenship-test-button";
import { Link } from "wouter";
import TipPlaceholder from "@/components/tip-placeholder";

export default function EUBenefits() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold mb-6">
            European Union Benefits
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            Unlock European
            <span className="block text-purple-200">Union Benefits</span>
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Discover the comprehensive benefits and opportunities that come with Polish citizenship and EU membership
          </p>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-6">
              Core EU Benefits
            </h2>
            <p className="text-lg text-neutral-cool max-w-3xl mx-auto">
              Polish citizenship grants you full European Union membership rights and privileges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Plane className="mr-3 h-8 w-8 text-blue-500" />
                  Freedom of Movement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Live, work, and travel freely across all 27 EU member states
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    No visa requirements within EU
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    Right to permanent residence
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    Access to Schengen Area
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="mr-3 h-8 w-8 text-green-500" />
                  Work & Business Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Full employment and business establishment rights across Europe
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <Briefcase className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Work without permits
                  </li>
                  <li className="flex items-start">
                    <Briefcase className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Start businesses freely
                  </li>
                  <li className="flex items-start">
                    <Briefcase className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Equal employment rights
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <GraduationCap className="mr-3 h-8 w-8 text-purple-500" />
                  Education Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Access to world-class European education systems
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <GraduationCap className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    EU citizen tuition rates
                  </li>
                  <li className="flex items-start">
                    <GraduationCap className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    Erasmus+ programs
                  </li>
                  <li className="flex items-start">
                    <GraduationCap className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    Student financial aid
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Heart className="mr-3 h-8 w-8 text-red-500" />
                  Healthcare Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Comprehensive healthcare coverage across Europe
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <Heart className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    European Health Insurance Card
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Emergency medical treatment
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    Prescription medication access
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="mr-3 h-8 w-8 text-orange-500" />
                  Legal Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Full legal rights and consular protection
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    EU legal framework protection
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    Consular assistance worldwide
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    Equal treatment rights
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-3 h-8 w-8 text-indigo-500" />
                  Social Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-cool mb-4">
                  Access to comprehensive social security systems
                </p>
                <ul className="space-y-2 text-sm text-neutral-cool">
                  <li className="flex items-start">
                    <Users className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                    Social security coordination
                  </li>
                  <li className="flex items-start">
                    <Users className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                    Unemployment benefits
                  </li>
                  <li className="flex items-start">
                    <Users className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                    Family reunification rights
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Economic Benefits */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-12 text-center">
            Economic Advantages
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Euro className="mr-3 h-6 w-6 text-blue-500" />
                  Financial Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-neutral-cool">
                  <li className="flex items-start">
                    <Euro className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    Access to EU funding programs
                  </li>
                  <li className="flex items-start">
                    <Euro className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    Banking and financial services access
                  </li>
                  <li className="flex items-start">
                    <Euro className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    Property ownership rights
                  </li>
                  <li className="flex items-start">
                    <Euro className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    Tax coordination benefits
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Home className="mr-3 h-6 w-6 text-purple-500" />
                  Lifestyle Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-neutral-cool">
                  <li className="flex items-start">
                    <Home className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    Quality of life improvements
                  </li>
                  <li className="flex items-start">
                    <Home className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    Cultural heritage access
                  </li>
                  <li className="flex items-start">
                    <Home className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    Retirement planning options
                  </li>
                  <li className="flex items-start">
                    <Home className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                    Cultural and language programs
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Country Highlights */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-warm mb-12 text-center">
            Popular EU Destinations
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600"></div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-neutral-warm mb-3">Germany</h3>
                <p className="text-neutral-cool text-sm mb-4">
                  Europe's economic powerhouse with excellent job opportunities and social benefits
                </p>
                <ul className="space-y-1 text-xs text-neutral-cool">
                  <li>• Strong economy and job market</li>
                  <li>• Excellent healthcare system</li>
                  <li>• High quality of life</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-red-500 to-red-600"></div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-neutral-warm mb-3">Netherlands</h3>
                <p className="text-neutral-cool text-sm mb-4">
                  Known for innovation, tolerance, and excellent work-life balance
                </p>
                <ul className="space-y-1 text-xs text-neutral-cool">
                  <li>• Innovation and technology hub</li>
                  <li>• English-friendly environment</li>
                  <li>• Sustainable living focus</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600"></div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-neutral-warm mb-3">Ireland</h3>
                <p className="text-neutral-cool text-sm mb-4">
                  English-speaking EU member with strong tech industry and cultural ties
                </p>
                <ul className="space-y-1 text-xs text-neutral-cool">
                  <li>• Tech industry hub</li>
                  <li>• English-speaking country</li>
                  <li>• Rich cultural heritage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-24 bg-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Unlock These Benefits?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Start your journey to Polish citizenship and EU membership today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Begin Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <CitizenshipTestButtonCalm 
              size="lg" 
              text="Begin Your EU Journey Today" 
            />
          </div>
        </div>
      </section>


    </div>
  );
}