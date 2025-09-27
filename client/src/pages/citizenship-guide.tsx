import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Euro, 
  Clock, 
  FileText, 
  Shield, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Calculator,
  Globe,
  BookOpen,
  Award,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  FileSearch,
  Languages,
  Building,
  CreditCard,
  Scale,
  Heart,
  Star,
  ChevronRight,
  Info,
  DollarSign,
  Timer,
  UserCheck,
  FileSignature,
  Archive,
  Send,
  ClipboardCheck,
  Home,
  Zap,
  Crown
} from "lucide-react";


import { Link } from "wouter";


const CitizenshipGuide = () => {
  const [selectedPackage, setSelectedPackage] = useState("expedited");

  const packages = {
    standard: {
      name: "STANDARD",
      price: "€330-660",
      installments: "6-7",
      timeline: "24+ months",
      description: "Slow and cheapest option",
      color: "bg-blue-500",
      features: [
        "Lower installment payments",
        "Basic legal assistance",
        "Standard document processing",
        "Email support"
      ]
    },
    expedited: {
      name: "EXPEDITED",
      price: "€660-880",
      installments: "8-9",
      timeline: "Up to 24 months",
      description: "Most popular choice",
      color: "bg-green-500",
      features: [
        "Medium installment payments",
        "Priority legal assistance",
        "Faster document processing",
        "WhatsApp & email support",
        "Recommended by most clients"
      ]
    },
    vip: {
      name: "VIP",
      price: "€880-990",
      installments: "10-12",
      timeline: "Fastest available",
      description: "Premium service with best results",
      color: "bg-purple-500",
      features: [
        "Highest priority processing",
        "Dedicated case manager",
        "Express document handling",
        "24/7 support via all channels",
        "Limited availability"
      ]
    }
  };

  const milestones = [
    {
      number: 1,
      title: "Case Evaluation",
      description: "Free eligibility check and document examination",
      icon: <FileSearch className="h-6 w-6" />,
      payment: "FREE"
    },
    {
      number: 2,
      title: "Powers of Attorney",
      description: "Legal representation agreement signed",
      icon: <FileSignature className="h-6 w-6" />,
      payment: "1st installment"
    },
    {
      number: 3,
      title: "Application Filed",
      description: "Official submission to Masovian Voivoda",
      icon: <Send className="h-6 w-6" />,
      payment: "2nd installment"
    },
    {
      number: 4,
      title: "Archives Search",
      description: "Historical document research in Poland/Ukraine",
      icon: <Archive className="h-6 w-6" />,
      payment: "Variable fee"
    },
    {
      number: 5,
      title: "Document Collection",
      description: "Gathering all required certificates",
      icon: <FileText className="h-6 w-6" />,
      payment: "As needed"
    },
    {
      number: 6,
      title: "Polish Civil Acts",
      description: "Birth and marriage certificates processing",
      icon: <ClipboardCheck className="h-6 w-6" />,
      payment: "1.5x installment"
    },
    {
      number: 7,
      title: "Translations",
      description: "Sworn translator certification",
      icon: <Languages className="h-6 w-6" />,
      payment: "Per document"
    },
    {
      number: 8,
      title: "Initial Response",
      description: "Voivoda's office begins case review (~10 months)",
      icon: <Mail className="h-6 w-6" />,
      payment: "3rd installment"
    },
    {
      number: 9,
      title: "Decision",
      description: "Citizenship confirmation received",
      icon: <Award className="h-6 w-6" />,
      payment: "Final installment"
    },
    {
      number: 10,
      title: "Passport Application",
      description: "Document preparation for Polish passport",
      icon: <CreditCard className="h-6 w-6" />,
      payment: "1.5x installment"
    },
    {
      number: 11,
      title: "Document Delivery",
      description: "FedEx shipping of all papers",
      icon: <Send className="h-6 w-6" />,
      payment: "All fees cleared"
    },
    {
      number: 12,
      title: "Passport Issued",
      description: "Visit consulate and receive EU passport",
      icon: <CheckCircle2 className="h-6 w-6" />,
      payment: "Consulate fee"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-white hover:text-blue-200">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur">
              <BookOpen className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Complete Polish Citizenship Guide</h1>
              <p className="text-xl opacity-90">Everything You Need to Know About Your Journey to EU Citizenship</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-2xl font-bold">5,000+</p>
                <p className="text-sm opacity-90">Successful Cases</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Award className="h-8 w-8 mb-2" />
                <p className="text-2xl font-bold">20+ Years</p>
                <p className="text-sm opacity-90">Experience</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Globe className="h-8 w-8 mb-2" />
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm opacity-90">Success Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Shield className="h-8 w-8 mb-2" />
                <p className="text-2xl font-bold">Legal</p>
                <p className="text-sm opacity-90">Representation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 px-4 bg-yellow-50 border-y-4 border-yellow-400">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Important to Understand</h2>
            <p className="text-gray-700">
              You apply directly to the Masovian Voivoda (General Governor) in Warsaw, not through us. 
              We provide expert legal guidance throughout the entire process based on our 20+ years of experience 
              and over 5,000 successful cases. The process typically takes 2-4 years and costs €5,500 on average 
              per person, plus translation fees.
            </p>
          </div>
        </div>
      </section>

      {/* Service Packages */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Processing Package</h2>
            <p className="text-gray-600">All prices are per person. Multiple installments for each legal service.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(packages).map(([key, pkg]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all hover:shadow-xl ${
                  selectedPackage === key ? 'ring-4 ring-blue-500 transform scale-105' : ''
                }`}
                onClick={() => setSelectedPackage(key)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex p-3 rounded-full ${pkg.color} text-white mb-3`}>
                    {key === 'standard' && <Clock className="h-8 w-8" />}
                    {key === 'expedited' && <Zap className="h-8 w-8" />}
                    {key === 'vip' && <Crown className="h-8 w-8" />}
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  {key === 'expedited' && (
                    <Badge className="bg-green-500 text-white">Most Popular</Badge>
                  )}
                  {key === 'vip' && (
                    <Badge className="bg-purple-500 text-white">Limited Availability</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-gray-900">{pkg.price}</p>
                    <p className="text-sm text-gray-600">per installment</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm"><strong>{pkg.installments}</strong> installments</p>
                      <p className="text-sm"><strong>{pkg.timeline}</strong> processing</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-center">{pkg.description}</p>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Journey to Polish Citizenship</h2>
            <p className="text-gray-600">12 clear milestones from evaluation to passport</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone) => (
              <Card key={milestone.number} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        {milestone.icon}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Step {milestone.number}</p>
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {milestone.payment === "FREE" ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <span>{milestone.payment}</span>
                    )}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Information Tabs */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Essential Information</h2>
          
          <Tabs defaultValue="money" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="money">Money & Time</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
              <TabsTrigger value="rules">Important Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="money" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-blue-600" />
                    Investment & Timeline Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Average Total Cost
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">€5,500 per person</p>
                    <p className="text-sm text-gray-600 mt-1">Plus translation fees (paid separately)</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Processing Timeline
                    </h3>
                    <p className="text-2xl font-bold text-green-600">2-4 years</p>
                    <p className="text-sm text-gray-600 mt-1">Depending on case complexity</p>
                  </div>
                  
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm">
                      <strong>Note:</strong> Cases involving emigration before 1920 are the most complex 
                      and may require additional time and documentation.
                    </p>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Required Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Birth Certificates</p>
                        <p className="text-sm text-gray-600">For you and Polish ancestors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Marriage Certificates</p>
                        <p className="text-sm text-gray-600">Establishing family connections</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Polish Documents</p>
                        <p className="text-sm text-gray-600">Any historical Polish papers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-semibold">Archive Research</p>
                        <p className="text-sm text-gray-600">We conduct searches in Poland & Ukraine if needed</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-sm">
                      Don't have all documents? Our archive search service covers Poland, Ukraine, 
                      and other territories with experienced research partners.
                    </p>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="translations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-6 w-6 text-blue-600" />
                    Professional Translation Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    Our comprehensive translation service includes:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-700">1</Badge>
                      <div>
                        <p className="font-semibold">Expert Translation</p>
                        <p className="text-sm text-gray-600">By specialized legal translators with years of experience</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-700">2</Badge>
                      <div>
                        <p className="font-semibold">Sworn Certification</p>
                        <p className="text-sm text-gray-600">Official Polish Sworn Translator certification required by authorities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-700">3</Badge>
                      <div>
                        <p className="font-semibold">Document Verification</p>
                        <p className="text-sm text-gray-600">Original documents personally reviewed by translators</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-blue-100 text-blue-700">4</Badge>
                      <div>
                        <p className="font-semibold">Quality Control</p>
                        <p className="text-sm text-gray-600">Double-checked for accuracy before submission</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm">
                      <strong>Critical:</strong> Translation errors can cause serious delays. 
                      We only use our trusted translators to avoid costly mistakes.
                    </p>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rules" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-6 w-6 text-blue-600" />
                    Our Working Principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Timer className="h-5 w-5 text-gray-600" />
                      Realistic Timelines
                    </h3>
                    <p className="text-sm text-gray-700">
                      Processing depends on: Us (5%), You (20%), Polish authorities (75%). 
                      We cannot control government processing times but optimize everything we can.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-gray-600" />
                      Mutual Respect
                    </h3>
                    <p className="text-sm text-gray-700">
                      We treat each case individually with full dedication. We accept only 1 in 10 inquiries 
                      to maintain our 100% success rate. We expect clients to respect our expertise and follow guidance.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-gray-600" />
                      Required Patience
                    </h3>
                    <p className="text-sm text-gray-700">
                      This is a complex legal process with multiple procedures. Success requires determination, 
                      patience, and following our step-by-step guidance throughout the journey.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      Success Guarantee
                    </h3>
                    <p className="text-sm text-gray-700">
                      While we cannot guarantee government decisions, our acceptance of a case means 100% eligibility 
                      certainty. Our track record: 100% success rate with 5,000+ cases since 2003.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <div className="bg-white/10 backdrop-blur rounded-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4">First Step is Simple:</h3>
            <p className="mb-6">
              Send signed Powers of Attorney (hard copies) via FedEx to our Warsaw office. 
              This enters your application into the official inPOL system and starts the countdown. 
              During the 10-month waiting period, you'll prepare and send all required documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                <Phone className="h-5 w-5 mr-2" />
                WhatsApp: +48 509 865 011
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Star className="h-8 w-8 mb-2" />
                <p className="font-semibold">Client References</p>
                <p className="text-sm opacity-90">Connect with successful clients</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Building className="h-8 w-8 mb-2" />
                <p className="font-semibold">Warsaw Office</p>
                <p className="text-sm opacity-90">Direct government liaison</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <Briefcase className="h-8 w-8 mb-2" />
                <p className="font-semibold">Full Service</p>
                <p className="text-sm opacity-90">From evaluation to passport</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      
      {/* AI Chatbot Assistant */}

    </div>
  );
};

// Simple Alert component
const Alert = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex gap-3 p-4 rounded-lg border ${className}`}>
    {children}
  </div>
);

export default CitizenshipGuide;