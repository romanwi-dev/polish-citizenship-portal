import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock3, AlertTriangle, CheckCircle2, FileText, ArrowRight } from "lucide-react";

interface AIAnalysisResultProps {
  analysis: {
    successProbability: number;
    timelineMonths: number;
    complexity: string;
    estimatedCost: number;
    riskFactors: string[];
    recommendations: string[];
    documentRequirements: string[];
    nextSteps: string[];
  };
  onClose: () => void;
}

export default function AIAnalysisResult({ analysis, onClose }: AIAnalysisResultProps) {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-primary-blue";
    if (probability >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-primary-blue text-white";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-warm">AI Case Analysis</h2>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Success Probability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getProbabilityColor(analysis.successProbability)}`}>
                  {analysis.successProbability}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock3 className="h-4 w-4 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-blue">
                  {analysis.timelineMonths} months
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Case Complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getComplexityColor(analysis.complexity)}>
                  {analysis.complexity}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-blue">
                  €{analysis.estimatedCost.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-neutral-cool">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-neutral-cool">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Document Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-primary-blue">
                  <FileText className="h-5 w-5 mr-2" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.documentRequirements.map((doc, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-neutral-cool">{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-neutral-cool">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button 
              className="bg-primary-blue hover:bg-primary-blue-light text-white px-8 py-3"
              onClick={() => {
                // Scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
                onClose();
              }}
            >
              Schedule Consultation
            </Button>
            <Button variant="outline" onClick={onClose}>
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}