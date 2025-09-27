import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, Shield, TrendingUp, Home, Gift, Crown,
  CheckCircle, Users, Clock, Star, MapPin, Plane,
  CreditCard, FileCheck, MessageSquare, Lock
} from "lucide-react";
import { Link } from "wouter";

const CitizenXHome = memo(function CitizenXHome() {
  const programOptions = [
    {
      title: "Polish Citizenship by Descent",
      region: "European Union",
      price: "from €3,500",
      benefits: [
        "Full EU citizenship rights",
        "190 visa-free destinations",
        "NO RESIDENCY REQUIRED",
        "2-4 years to passport"
      ],
      flag: "🇵🇱",
      popular: true
    },
    {
      title: "Express Track Service",
      region: "Premium Service",
      price: "from €7,500",
      benefits: [
        "Priority processing",
        "190 visa-free destinations", 
        "DEDICATED CASE MANAGER",
        "12-24 months to passport"
      ],
      flag: "⚡",
      premium: true
    },
    {
      title: "Family Package",
      region: "Multi-Generation",
      price: "from €12,500",
      benefits: [
        "Entire family included",
        "190 visa-free destinations",
        "GENERATIONAL ASSET",
        "2-4 years to passport"
      ],
      flag: "👨‍👩‍👧‍👦",
      family: true
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: "Improve your Mobility Freedom",
      description: "Get an EU passport that lets you travel freely to 190 countries and live anywhere in Europe."
    },
    {
      icon: Shield,
      title: "Protect your Wealth",
      description: "Access EU banking, investment opportunities, and tax optimization strategies across 27 member states."
    },
    {
      icon: Home,
      title: "Create a Plan B",
      description: "Secure permanent residence and work rights in any EU country as your insurance policy."
    },
    {
      icon: TrendingUp,
      title: "Secure EU Benefits",
      description: "Access world-class healthcare, education, and social benefits across the European Union."
    },
    {
      icon: Gift,
      title: "Multi-Generational Asset",
      description: "Pass EU citizenship to your children and grandchildren, creating lasting family legacy."
    },
    {
      icon: Crown,
      title: "Join European Heritage",
      description: "Connect with your Polish roots and become part of Europe's rich cultural heritage."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="font-bold text-2xl text-white">
                Polish<span className="text-red-500">Passport</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#programs" className="text-slate-300 hover:text-white transition">Programs</a>
                <a href="#benefits" className="text-slate-300 hover:text-white transition">Benefits</a>
                <a href="#process" className="text-slate-300 hover:text-white transition">Process</a>
                <a href="#faq" className="text-slate-300 hover:text-white transition">FAQ</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <Star className="h-3 w-3 mr-1" />
            100% Success Rate • 5,000+ Happy Citizens
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Cash is King.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
              Citizenship is Queen.
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Polish citizenship by descent offers you the fastest, safest, and most straightforward way 
            to secure EU citizenship through your ancestry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              Check Eligibility
              <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              <CreditCard className="mr-2 h-5 w-5" />
              View Pricing
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-emerald-400" />
              <span>5,000+ Clients</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-emerald-400" />
              <span>22+ Years Experience</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-emerald-400" />
              <span>Licensed Law Firm</span>
            </div>
            <div className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-emerald-400" />
              <span>Bank-Level Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Program Cards Section */}
      <section id="programs" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Path to EU Citizenship
            </h2>
            <p className="text-slate-400">
              Professional legal services tailored to your ancestry and timeline
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {programOptions.map((program, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800 hover:border-red-500/50 transition-all">
                <div className="p-6">
                  {program.popular && (
                    <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      MOST POPULAR
                    </Badge>
                  )}
                  {program.premium && (
                    <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/20">
                      PREMIUM SERVICE
                    </Badge>
                  )}
                  {program.family && (
                    <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
                      BEST VALUE
                    </Badge>
                  )}
                  
                  <div className="text-4xl mb-4">{program.flag}</div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{program.region}</p>
                  
                  <div className="text-2xl font-bold text-white mb-6">{program.price}</div>
                  
                  <ul className="space-y-3 mb-6">
                    {program.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Learn More
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section id="benefits" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Polish EU Citizenship?
            </h2>
            <p className="text-slate-400">
              Unlock opportunities that transform your life and legacy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-red-500/30 transition">
                <benefit.icon className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">190</div>
              <div className="text-slate-400">Visa-Free Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">27</div>
              <div className="text-slate-400">EU Member States</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-slate-400">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2-4</div>
              <div className="text-slate-400">Years to Passport</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-900/20 to-slate-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Claim Your European Heritage?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands who've successfully obtained Polish citizenship through ancestry
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              Start Free Assessment
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 mb-4 md:mb-0">
              © 2025 Polish Citizenship Legal Services. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default CitizenXHome;