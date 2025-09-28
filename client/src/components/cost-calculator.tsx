import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function CostCalculator() {
  const [answers, setAnswers] = useState({
    complexity: '',
    documents: '',
    timeline: '',
    expedited: false
  });

  interface CalculationResult {
    minCost: number;
    maxCost: number;
    timeline: number;
    serviceLevel: string;
    installments: number;
  }

  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateCost = () => {
    let baseCost = 3000;
    let timeline = 30;
    let serviceLevel = 'Standard';

    // Complexity factor
    if (answers.complexity === 'high') {
      baseCost += 2000;
      timeline += 12;
    } else if (answers.complexity === 'medium') {
      baseCost += 1000;
      timeline += 6;
    }

    // Documents factor
    if (answers.documents === 'missing') {
      baseCost += 1500;
      timeline += 8;
    } else if (answers.documents === 'partial') {
      baseCost += 800;
      timeline += 4;
    }

    // Expedited service
    if (answers.expedited) {
      baseCost *= 1.8;
      timeline *= 0.7;
      serviceLevel = 'Expedited';
    }

    const maxCost = baseCost * 1.3;
    
    setResult({
      minCost: baseCost,
      maxCost: maxCost,
      timeline: Math.round(timeline),
      serviceLevel,
      installments: Math.round(baseCost / 6)
    });
  };

  return (
    <section id="calculator" className="py-24 bg-surface-light">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-primary-blue text-white px-6 py-3 rounded-full font-semibold mb-6">
            Interactive Cost Calculator
          </Badge>
          <h2 className="text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight tracking-tight">
            <span className="block text-black dark:text-white">Calculate Your</span>
            <span className="block text-blue-600 dark:text-blue-400">Investment</span>
          </h2>
          <p className="text-lg text-neutral-cool max-w-3xl mx-auto leading-relaxed">
            Get an instant estimate based on your specific case complexity and requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calculator className="mr-3 h-6 w-6 text-primary-blue" />
                Case Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-warm mb-3">
                  Case Complexity
                </label>
                <div className="space-y-2">
                  {[{ value: 'low', label: 'Simple - Recent emigration, documents available' },
                    { value: 'medium', label: 'Moderate - Some missing documents, research needed' },
                    { value: 'high', label: 'Complex - Extensive research, multiple territories' }].map((option) => (
                    <label key={option.value} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="complexity"
                        value={option.value}
                        onChange={(e) => setAnswers({...answers, complexity: e.target.value})}
                        className="mr-3 mt-1"
                      />
                      <span className="text-sm text-neutral-cool">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-warm mb-3">
                  Document Availability
                </label>
                <div className="space-y-2">
                  {[{ value: 'complete', label: 'All documents available' },
                    { value: 'partial', label: 'Some documents missing' },
                    { value: 'missing', label: 'Extensive archive research needed' }].map((option) => (
                    <label key={option.value} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="documents"
                        value={option.value}
                        onChange={(e) => setAnswers({...answers, documents: e.target.value})}
                        className="mr-3 mt-1"
                      />
                      <span className="text-sm text-neutral-cool">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-warm mb-3">
                  Service Package
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'standard', label: 'STANDARD', desc: 'Complete service with standard timeline' },
                    { value: 'expedited', label: 'EXPEDITED', desc: 'Faster processing with priority attention' },
                    { value: 'vip', label: 'VIP', desc: 'Premium service with dedicated team & fastest timeline' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="serviceLevel"
                        value={option.value}
                        onChange={(e) => setAnswers({...answers, expedited: e.target.value === 'expedited' || e.target.value === 'vip'})}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <span className="text-sm font-semibold text-neutral-warm">{option.label}</span>
                        <p className="text-xs text-neutral-cool">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                onClick={calculateCost}
                className="w-full bg-primary-blue hover:bg-primary-blue-light"
                disabled={!answers.complexity || !answers.documents}
              >
                Get Detailed Calculations
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Your Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-primary-blue mb-2">
                      €{result.minCost.toLocaleString()} - €{result.maxCost.toLocaleString()}
                    </div>
                    <div className="text-neutral-cool">Total Investment Range</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-warm">{result.timeline}</div>
                      <div className="text-sm text-neutral-cool">Months</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-warm">€{result.installments}</div>
                      <div className="text-sm text-neutral-cool">Per installment</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">Service Level: {result.serviceLevel}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm">Payment in 6-8 installments</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      <span className="text-sm">Excludes translation and government fees</span>
                    </div>
                  </div>

                  <Link href="/dashboard">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Get Detailed Quote
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-neutral-cool">Complete the assessment to see your personalized cost estimate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}