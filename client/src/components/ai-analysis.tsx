import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingUp, Calculator, BarChart3, Clock3, AlertTriangle, ArrowRight } from "lucide-react";

export default function AiAnalysis() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="ai-analysis"
      className="py-24 bg-surface-very-light relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(248,250,252,0.95), rgba(248,250,252,0.98)), url('https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1920&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <Badge className="bg-primary-blue text-white px-6 py-3 rounded-full font-semibold mb-6">
            <Brain className="mr-2 h-4 w-4" />
            AI-Powered Analysis
          </Badge>
          <h2 className="text-5xl font-black mb-6 text-center leading-tight"
              style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
            <span className="block text-black dark:text-white">How Our AI Analysis</span>
            <span className="block text-blue-800 dark:text-blue-400">System Works</span>
          </h2>
          <p className="text-lg text-neutral-cool mb-12 max-w-3xl mx-auto leading-relaxed">
            Our proprietary AI analyzes <strong>180+ data points</strong> from 20 years of case history 
            to predict success probability and timeline with <strong>exceptional accuracy</strong>.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="space-y-6 mb-8">
              <Card className="bg-surface-elevated border border-gray-100 hover:shadow-md transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-warm mb-3">Success Prediction</h4>
                      <p className="text-neutral-cool leading-relaxed">Analyze case strength based on family history, documents, and legal precedents for accurate probability assessment.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-surface-elevated border border-gray-100 hover:shadow-md transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-light-blue rounded-xl flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-warm mb-3">Timeline & Cost Estimation</h4>
                      <p className="text-neutral-cool leading-relaxed">Predict processing time and total costs based on complexity, document availability, and current processing speeds.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-surface-elevated border border-gray-100 hover:shadow-md transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary-blue rounded-xl flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-warm mb-3">Risk Assessment</h4>
                      <p className="text-neutral-cool leading-relaxed">Identify potential obstacles, document gaps, and legal challenges before starting the process.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-primary-blue hover:bg-primary-blue-light text-white px-8 py-4 font-semibold w-full rounded-xl shadow-sm group animated-button"
            >
              <Brain className="mr-2 h-5 w-5" />
              Request AI Analysis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="relative">
            <Card className="bg-light-blue text-neutral-warm shadow-xl border-2 border-primary-blue">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="text-white w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    AI Analysis Preview
                  </h3>
                  <p className="text-gray-300 text-sm">Sample prediction based on historical data</p>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300">Success Probability</span>
                      <span className="text-primary-blue font-bold text-lg">87%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-primary-blue h-2 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300">Estimated Timeline</span>
                      <span className="text-primary-blue font-bold text-lg">28 months</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-primary-blue h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300">Case Complexity</span>
                      <span className="text-secondary-blue font-bold text-lg">Medium</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-secondary-blue h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-300">Document Availability</span>
                      <span className="text-red-400 font-bold text-lg">Limited</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full" style={{width: '40%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Technical Details */}
        <Card className="bg-surface-elevated border border-gray-100">
          <CardContent className="p-12">
            <h3 className="text-2xl font-bold text-center text-neutral-warm mb-10">How Our AI Analysis Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-primary-blue rounded-xl p-6 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 flex flex-col justify-center items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">180+</div>
                  <div className="text-blue-200 font-medium text-base leading-tight">Data Points</div>
                </div>
                <p className="text-blue-100 text-sm mt-3 text-center leading-relaxed">Family history, emigration dates, document types, legal changes, processing times, and more.</p>
              </div>
              <div className="bg-light-blue rounded-xl p-6 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 flex flex-col justify-center items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">5K+</div>
                  <div className="text-blue-200 font-medium text-base leading-tight">Historical Cases</div>
                </div>
                <p className="text-blue-100 text-sm mt-3 text-center leading-relaxed">20 years of successfully processed cases provide the training data for accurate predictions.</p>
              </div>
              <div className="bg-secondary-blue rounded-xl p-6 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 flex flex-col justify-center items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">2-3</div>
                  <div className="text-blue-200 font-medium text-base leading-tight">Minutes to Complete</div>
                </div>
                <p className="text-blue-100 text-sm mt-3 text-center leading-relaxed">Comprehensive analysis takes time to ensure accuracy and provide actionable insights.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
