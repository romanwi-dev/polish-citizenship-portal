import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  TrendingUp, 
  FileText, 
  BookOpen, 
  Zap,
  AlertCircle,
  Eye,
  Download
} from "lucide-react";

export interface TranslationQualityPreview {
  overallScore: number;
  accuracy: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  fluency: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  terminology: {
    score: number;
    legalTermsHandled: number;
    totalLegalTerms: number;
    inconsistencies: Array<{
      term: string;
      translations: string[];
      suggestion: string;
    }>;
  };
  formatting: {
    score: number;
    preservedElements: string[];
    issues: string[];
  };
  risks: Array<{
    type: 'critical' | 'warning' | 'info';
    description: string;
    recommendation: string;
  }>;
  readabilityScore: number;
  recommendedActions: string[];
}

interface TranslationQualityPreviewProps {
  qualityData: TranslationQualityPreview;
  onGenerateReport?: () => void;
  onRequestRevision?: () => void;
}

export default function TranslationQualityPreview({
  qualityData,
  onGenerateReport,
  onRequestRevision
}: TranslationQualityPreviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="w-5 h-5" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskBadgeColor = (type: string) => {
    switch (type) {
      case 'critical': return "bg-red-100 text-red-800 border-red-200";
      case 'warning': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'info': return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <Card className={`border-2 ${getScoreColor(qualityData.overallScore)}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Translation Quality Assessment
            </div>
            <div className="flex items-center gap-2">
              {getScoreIcon(qualityData.overallScore)}
              <span className="text-2xl font-bold">{qualityData.overallScore}/100</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress 
            value={qualityData.overallScore} 
            className="h-3 mb-4"
          />
          <div className="flex gap-3">
            <Button 
              onClick={onGenerateReport}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </Button>
            {qualityData.overallScore < 80 && (
              <Button 
                onClick={onRequestRevision}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <Eye className="w-4 h-4" />
                Request Revision
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-2">{qualityData.accuracy.score}/100</div>
            <Progress value={qualityData.accuracy.score} className="h-2 mb-3" />
            
            {qualityData.accuracy.strengths.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                {qualityData.accuracy.strengths.slice(0, 2).map((strength, i) => (
                  <p key={i} className="text-xs text-green-600">• {strength}</p>
                ))}
              </div>
            )}
            
            {qualityData.accuracy.issues.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-1">Issues:</p>
                {qualityData.accuracy.issues.slice(0, 2).map((issue, i) => (
                  <p key={i} className="text-xs text-red-600">• {issue}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fluency */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Fluency
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-2">{qualityData.fluency.score}/100</div>
            <Progress value={qualityData.fluency.score} className="h-2 mb-3" />
            
            {qualityData.fluency.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-blue-700 mb-1">Suggestions:</p>
                {qualityData.fluency.suggestions.slice(0, 2).map((suggestion, i) => (
                  <p key={i} className="text-xs text-blue-600">• {suggestion}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terminology */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Legal Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-2">{qualityData.terminology.score}/100</div>
            <Progress value={qualityData.terminology.score} className="h-2 mb-3" />
            
            <div className="text-xs text-gray-600 mb-2">
              {qualityData.terminology.legalTermsHandled} of {qualityData.terminology.totalLegalTerms} terms handled
            </div>
            
            {qualityData.terminology.inconsistencies.length > 0 && (
              <div>
                <p className="text-xs font-medium text-orange-700 mb-1">Inconsistencies:</p>
                {qualityData.terminology.inconsistencies.slice(0, 1).map((inc, i) => (
                  <div key={i} className="text-xs text-orange-600">
                    <p>• {inc.term}: {inc.translations.join(', ')}</p>
                    <p className="text-orange-500 ml-2">{inc.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Readability */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              Readability
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold mb-2">{qualityData.readabilityScore}/100</div>
            <Progress value={qualityData.readabilityScore} className="h-2 mb-3" />
            
            <div className="text-xs text-gray-600">
              {qualityData.readabilityScore >= 80 ? "Excellent readability" :
               qualityData.readabilityScore >= 60 ? "Good readability" :
               "Needs improvement"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risks and Warnings */}
      {qualityData.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Quality Risks & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityData.risks.map((risk, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRiskBadgeColor(risk.type)}`}>
                  <div className="flex items-start gap-2">
                    {getRiskIcon(risk.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className={`text-xs ${getRiskBadgeColor(risk.type)}`}>
                          {risk.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{risk.description}</p>
                      <p className="text-xs opacity-80">{risk.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formatting Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Formatting Analysis
            <Badge variant="outline" className="ml-auto">
              {qualityData.formatting.score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualityData.formatting.preservedElements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">Preserved Elements:</h4>
                <div className="space-y-1">
                  {qualityData.formatting.preservedElements.map((element, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      {element}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {qualityData.formatting.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Formatting Issues:</h4>
                <div className="space-y-1">
                  {qualityData.formatting.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="w-3 h-3" />
                      {issue}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      {qualityData.recommendedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {qualityData.recommendedActions.map((action, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}