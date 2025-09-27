import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Star, Crown, Phone, Mail, Clock3, Shield, Users2, Zap } from "lucide-react";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white mobile-stable">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3 mb-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-blue-800 font-semibold text-lg tracking-wide">TRANSPARENT REAL PRICING</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-warm mb-6 tracking-tight">
            Polish Citizenship Services
            <span className="block text-primary-blue">Choose Your Path</span>
          </h2>
          <p className="text-lg text-neutral-cool max-w-3xl mx-auto leading-relaxed">
            Professional Polish citizenship by descent application services. The process involves complex legal requirements and requires expert guidance.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="responsive-grid mb-16">
          {/* Standard */}
          <Card className="responsive-card bg-surface-elevated border border-gray-200 hover:shadow-lg transition-all duration-200 interactive-card">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-neutral-warm">STANDARD</h3>
                <Clock3 className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-neutral-cool italic mb-6">Like traveling by train with lots of stops</p>
              <div className="mb-6">
                <div className="text-4xl font-bold text-neutral-warm mb-2">€1,500 - €3,500</div>
                <div className="text-neutral-cool">375-583 EUR per installment</div>
                <div className="text-sm text-neutral-cool mt-1">4-6 installments</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <div className="text-amber-800 font-semibold">36-48 months average</div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Lower installment values</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Basic legal guidance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Standard document processing</span>
                </li>
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Email support</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Regular case updates</span>
                </li>
              </ul>
              <Button className="w-full bg-gray-100 hover:bg-gray-200 text-black font-semibold button-shine">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Expedited - Most Popular */}
          <Card className="bg-primary-blue text-white border-2 border-primary-blue relative hover:shadow-xl transition-all duration-200 scale-105 interactive-card">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-secondary-blue text-white px-4 py-2 rounded-full font-semibold">
                MOST POPULAR
              </Badge>
            </div>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">EXPEDITED</h3>
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-blue-100 italic mb-6">Like a business class flight</p>
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2">€3,500 - €8,000</div>
                <div className="text-blue-100">500-889 EUR per installment</div>
                <div className="text-sm text-blue-200 mt-1">7-9 installments</div>
              </div>
              <div className="bg-green-500 rounded-lg p-3 text-center">
                <div className="text-white font-semibold">18-36 months</div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-100">50% higher installment value</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-100">Priority case handling</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-100">Expedited document processing</span>
                </li>
                <li className="flex items-start">
                  <Phone className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-100">Phone & email support</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-100">Weekly progress updates</span>
                </li>
                <li className="flex items-start">
                  <Users2 className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-blue-100">Dedicated case manager</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-primary-blue hover:bg-blue-50 font-semibold button-shine">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* VIP */}
          <Card className="bg-amber-50 border border-amber-200 hover:shadow-lg transition-all duration-200 relative interactive-card">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-amber-500 text-white px-4 py-2 rounded-full font-semibold">
                WAITLIST - OCTOBER 2025
              </Badge>
            </div>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-neutral-warm">VIP</h3>
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-neutral-cool italic mb-6">Like flying a private jet using dedicated airports</p>
              <div className="mb-6">
                <div className="text-4xl font-bold text-neutral-warm mb-2">€12,500+</div>
                <div className="text-neutral-cool">Flat fee per person</div>
              </div>
              <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                <div className="text-green-800 font-semibold">14-18 months</div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Fastest processing possible</span>
                </li>
                <li className="flex items-start">
                  <Crown className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">White glove service</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Direct government liaison</span>
                </li>
                <li className="flex items-start">
                  <Phone className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">24/7 support access</span>
                </li>
                <li className="flex items-start">
                  <Clock3 className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Daily updates if needed</span>
                </li>
                <li className="flex items-start">
                  <Users2 className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">Personal legal team</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-cool">All schemes included</span>
                </li>
              </ul>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white button-shine" disabled>
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Citizenship Test CTA in Pricing Section */}
        <div className="text-center mb-16">
          <div className="bg-slate-50 rounded-2xl p-8 border border-gray-200 interactive-card mobile-stable">
            <h3 className="text-xl font-bold mb-3 text-gray-900">Ready to Check Your Eligibility?</h3>
            <p className="text-gray-700 mb-6">Take the most comprehensive Polish citizenship by descent test available online</p>
            <a href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" target="_blank" rel="noopener noreferrer" className="block">
              <Button size="lg" className="animated-gradient-btn w-full sm:w-auto mx-auto block h-16 sm:h-14 px-6 sm:px-8 text-lg sm:text-xl font-bold text-white bg-red-800 hover:bg-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg">
                Take Full Polish Citizenship Test
              </Button>
            </a>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-surface-light rounded-3xl p-12 border border-gray-100">
          <h3 className="text-2xl lg:text-3xl font-bold text-center text-neutral-warm mb-12">
            Additional Services - All Outsourced
          </h3>
          <p className="text-center text-neutral-cool mb-12 max-w-3xl mx-auto">
            We focus EXCLUSIVELY on the citizenship confirmation procedure. Additional services are handled by our network of specialists.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border border-gray-200 text-center p-6 interactive-card">
              <h4 className="font-bold text-neutral-warm mb-2">Polish Civil Acts</h4>
              <p className="text-sm text-neutral-cool mb-4">Birth/marriage certificate transcription</p>
              <Badge className="bg-amber-100 text-amber-800 mb-3">OUTSOURCED SERVICE</Badge>
              <div className="text-sm text-neutral-cool">
                <div>1.5x installment per document</div>
                <div>10-12 months (5-8 weeks expedited)</div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 text-center p-6 interactive-card">
              <h4 className="font-bold text-neutral-warm mb-2">Translation Service</h4>
              <p className="text-sm text-neutral-cool mb-4">Sworn translation and certification</p>
              <Badge className="bg-amber-100 text-amber-800 mb-3">OUTSOURCED SERVICE</Badge>
              <div className="text-sm text-neutral-cool">
                <div>€60-120 per document</div>
                <div>5-6 weeks</div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 text-center p-6 interactive-card">
              <h4 className="font-bold text-neutral-warm mb-2">Archive Search</h4>
              <p className="text-sm text-neutral-cool mb-4">Polish/Ukrainian document research</p>
              <Badge className="bg-amber-100 text-amber-800 mb-3">OUTSOURCED SERVICE</Badge>
              <div className="text-sm text-neutral-cool">
                <div>Quoted individually</div>
                <div>3-9 months</div>
              </div>
            </Card>

            <Card className="bg-white border border-gray-200 text-center p-6 interactive-card">
              <h4 className="font-bold text-neutral-warm mb-2">Passport Application</h4>
              <p className="text-sm text-neutral-cool mb-4">Complete passport file preparation</p>
              <Badge className="bg-amber-100 text-amber-800 mb-3">OUTSOURCED SERVICE</Badge>
              <div className="text-sm text-neutral-cool">
                <div>1.5x installment per person</div>
                <div>1-2 weeks</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Acceleration Schemes */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-neutral-warm mb-8">Acceleration Schemes</h3>
          <p className="text-neutral-cool mb-8">Combined efforts of multiple agents to speed up government processing</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-2">PUSH-SCHEME</h4>
              <p className="text-blue-700 text-sm">Accelerated government processing</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-bold text-green-900 mb-2">NUDGE-SCHEME</h4>
              <p className="text-green-700 text-sm">Strategic case advancement</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h4 className="font-bold text-purple-900 mb-2">SITDOWN-SCHEME</h4>
              <p className="text-purple-700 text-sm">Direct government meetings</p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <p className="text-amber-800 mb-4">
            <strong>Note:</strong> Prices exclude translation costs. All services require advance payment.
          </p>
          <p className="text-amber-700 text-sm">
            Due to high demand from USA, UK, Canada, Australia, and South Africa, prices are increasing. 
            We advise not to delay starting your Polish citizenship procedure as capacity is limited.
          </p>
        </div>
      </div>
    </section>
  );
}