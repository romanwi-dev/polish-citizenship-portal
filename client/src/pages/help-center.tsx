import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  FileText, 
  Users, 
  Globe,
  Award,
  BookOpen,
  Search,
  Clock,
  Shield,
  Languages,
  Family,
  FileSignature,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

export default function HelpCenter() {
  return (
    <>
      <Helmet>
        <title>What Can We Help With? | Polish Citizenship Portal</title>
        <meta name="description" content="Comprehensive guide to all services and features available on the Polish Citizenship Portal - from eligibility checks to document generation." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        
        {/* Header Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 px-4 py-2">
              Complete Service Guide
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              What Can We Help With?
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Your comprehensive guide to all features, services, and capabilities 
              of the Polish Citizenship Portal
            </p>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Platform Overview
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      The Polish Citizenship Portal is a comprehensive platform designed to streamline 
                      the entire Polish citizenship by descent application process. From initial 
                      eligibility assessment to final document generation, we provide AI-powered tools, 
                      expert guidance, and automated workflows to help you successfully obtain Polish 
                      citizenship and your EU passport.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Services */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Core Services & Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need for your Polish citizenship journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Eligibility Assessment */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Eligibility Assessment</CardTitle>
                  <CardDescription>AI-powered qualification check</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Quick 15-minute online assessment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">AI analysis of your ancestry claim</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Detailed eligibility report</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Pre-1920 emigration expertise</span>
                    </li>
                  </ul>
                  <Link href="/citizenship-test">
                    <Button className="w-full mt-4" variant="outline">
                      Take Eligibility Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Document Processing */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Document Processing</CardTitle>
                  <CardDescription>Advanced OCR & extraction</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">AI-powered OCR for Polish documents</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Automatic data extraction & validation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Support for birth, marriage, death certificates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Passport and ID card processing</span>
                    </li>
                  </ul>
                  <Link href="/document-processing">
                    <Button className="w-full mt-4" variant="outline">
                      Upload Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Family History Writer */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Family History Writer</CardTitle>
                  <CardDescription>Guided narrative creation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Step-by-step family story builder</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Pre-written templates & suggestions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Document emigration & cultural heritage</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Export to PDF for application</span>
                    </li>
                  </ul>
                  <Link href="/family-history-writer">
                    <Button className="w-full mt-4" variant="outline">
                      Start Writing <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Translation Services */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-3">
                    <Languages className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>Translation Services</CardTitle>
                  <CardDescription>AI-powered Polish translation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Automated document translation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Polish naming conventions applied</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Legal terminology accuracy</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Format preservation</span>
                    </li>
                  </ul>
                  <Link href="/translator">
                    <Button className="w-full mt-4" variant="outline">
                      Translate Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Family Tree Builder */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-3">
                    <Family className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle>Family Tree Builder</CardTitle>
                  <CardDescription>4-generation genealogy tracker</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Visual family tree creation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Bloodline tracking for eligibility</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Automatic sync with client details</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Gap detection & recommendations</span>
                    </li>
                  </ul>
                  <Link href="/dashboard">
                    <Button className="w-full mt-4" variant="outline">
                      Build Family Tree <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Legal Document Generation */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-3">
                    <FileSignature className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle>Document Generation</CardTitle>
                  <CardDescription>Professional legal PDFs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Power of Attorney forms</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Official family tree documents</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Citizenship application forms</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Templates approved by Polish authorities</span>
                    </li>
                  </ul>
                  <Link href="/dashboard">
                    <Button className="w-full mt-4" variant="outline">
                      Generate Documents <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Additional Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Advanced tools and support services
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <CardTitle>AI Assistant</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Get instant answers about Polish citizenship law, required documents, 
                    timeline expectations, and common obstacles. Available 24/7 to guide you 
                    through each step of the process.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Contextual help based on current progress</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Expert knowledge of Polish citizenship law</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    <CardTitle>Automation & Workflows</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Automated workflows handle document processing, data extraction, form 
                    auto-filling, and quality checks. Reduce manual work and minimize errors.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>N8N and Lindy.ai integration</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Smart document routing and validation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Search className="h-6 w-6 text-purple-600" />
                    <CardTitle>Archive Research</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    We can search Polish civil registries, church books, and archives on your 
                    behalf to locate missing documents from pre-1920 territories.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Access to Polish government archives</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Expert genealogical research</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <CardTitle>Case Management Dashboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Track your application progress in real-time with our comprehensive dashboard. 
                    View document status, completed steps, and what's remaining.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>4-step progress tracking</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time sync across all sections</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Key Principles */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Award className="h-7 w-7 text-blue-600" />
                  Key Principles of Our Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Documents are the Source of Truth
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      All information extracted from official documents overrides manual input, 
                      ensuring legal compliance and accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Polish Naming Conventions Matter
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      We automatically apply correct Polish naming rules: First names capitalized, 
                      surnames in ALL CAPS - critical for legal compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Bloodline Tracking Determines Eligibility
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our family tree system precisely tracks your Polish lineage through 4 
                      generations to establish citizenship qualification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      97% Success Rate
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our systematic approach and expert guidance have resulted in a 97% success 
                      rate across thousands of citizenship applications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Common Use Cases */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Common Use Cases
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                How different clients use our platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Straightforward Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    You have a Polish grandparent, possess all necessary documents, and need 
                    help with form completion and submission.
                  </p>
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span className="font-semibold">3-6 months timeline</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Missing Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    You know you have Polish ancestry but lack some vital records. We conduct 
                    archive research to locate missing documents.
                  </p>
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-semibold">6-12 months timeline</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pre-1920 Emigration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Your ancestors emigrated before Poland regained independence. We specialize 
                    in these complex historical cases.
                  </p>
                  <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <Award className="h-4 w-4 mr-2" />
                    <span className="font-semibold">Expert specialty</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Choose the best starting point for your situation
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Not Sure If You Qualify?</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start with our free eligibility assessment to determine if you can 
                    obtain Polish citizenship by descent.
                  </p>
                  <Link href="/citizenship-test">
                    <Button className="w-full" size="lg">
                      Take Eligibility Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Ready to Start Your Application?</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Access your personalized dashboard to begin uploading documents and 
                    building your case.
                  </p>
                  <Link href="/dashboard">
                    <Button className="w-full" size="lg" variant="default">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="py-12 px-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Visit our comprehensive FAQ for detailed answers about the Polish citizenship process
            </p>
            <Link href="/faq">
              <Button size="lg" variant="outline">
                View FAQ <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
