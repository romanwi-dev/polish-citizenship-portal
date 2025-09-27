import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedProgressRing } from './animated-progress-ring';
import { 
  FileText, 
  Shield, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Sparkles,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentMetrics {
  clarity: number;
  completeness: number;
  authenticity: number;
  compliance: number;
  overall: number;
}

interface DocumentVerificationData {
  id: string;
  name: string;
  type: string;
  status: 'analyzing' | 'completed' | 'failed' | 'pending';
  metrics: DocumentMetrics;
  issues: string[];
  uploadTime: string;
  verificationTime?: string;
}

const mockDocuments: DocumentVerificationData[] = [
  {
    id: '1',
    name: 'Birth Certificate - Jan Kowalski.pdf',
    type: 'Birth Certificate',
    status: 'completed',
    metrics: {
      clarity: 95,
      completeness: 88,
      authenticity: 92,
      compliance: 96,
      overall: 93
    },
    issues: ['Minor quality issue in bottom right corner'],
    uploadTime: '2025-01-13 12:30:15',
    verificationTime: '2025-01-13 12:32:18'
  },
  {
    id: '2',
    name: 'Marriage Certificate - Anna Kowalska.pdf',
    type: 'Marriage Certificate',
    status: 'analyzing',
    metrics: {
      clarity: 78,
      completeness: 65,
      authenticity: 0,
      compliance: 0,
      overall: 0
    },
    issues: [],
    uploadTime: '2025-01-13 12:35:22'
  },
  {
    id: '3',
    name: 'Passport - Current.pdf',
    type: 'Passport',
    status: 'completed',
    metrics: {
      clarity: 100,
      completeness: 100,
      authenticity: 98,
      compliance: 100,
      overall: 99
    },
    issues: [],
    uploadTime: '2025-01-13 12:28:45',
    verificationTime: '2025-01-13 12:30:12'
  }
];

const getStatusColor = (status: DocumentVerificationData['status']) => {
  switch (status) {
    case 'completed': return 'green';
    case 'analyzing': return 'blue';
    case 'failed': return 'red';
    case 'pending': return 'gray';
    default: return 'gray';
  }
};

const getStatusIcon = (status: DocumentVerificationData['status']) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case 'analyzing': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    case 'failed': return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'pending': return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

const getOverallScoreColor = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 90) return 'green';
  if (score >= 70) return 'yellow';
  return 'red';
};

const MetricRing = memo(function MetricRing({ 
  label, 
  value, 
  delay = 0,
  isAnalyzing = false 
}: { 
  label: string; 
  value: number; 
  delay?: number;
  isAnalyzing?: boolean;
}) {
  const getColor = () => {
    if (isAnalyzing) return 'blue';
    if (value >= 90) return 'green';
    if (value >= 70) return 'yellow';
    return 'red';
  };

  return (
    <div className="text-center">
      <AnimatedProgressRing
        progress={value}
        size={80}
        strokeWidth={6}
        color={getColor()}
        showPercentage={!isAnalyzing || value > 0}
        delay={delay}
        duration={isAnalyzing ? 2000 : 1200}
      >
        {isAnalyzing && value === 0 && (
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        )}
      </AnimatedProgressRing>
      <p className="text-sm font-medium mt-2 text-gray-700">{label}</p>
    </div>
  );
});

const DocumentVerificationRings = memo(function DocumentVerificationRings() {
  const [documents, setDocuments] = useState<DocumentVerificationData[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<string>(mockDocuments[0].id);

  // Simulate ongoing analysis for analyzing documents
  useEffect(() => {
    const interval = setInterval(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.status === 'analyzing') {
          const newMetrics = { ...doc.metrics };
          
          // Gradually increase metrics during analysis
          if (newMetrics.clarity < 85 && newMetrics.clarity > 0) {
            newMetrics.clarity = Math.min(85, newMetrics.clarity + Math.random() * 5);
          }
          if (newMetrics.completeness < 75 && newMetrics.completeness > 0) {
            newMetrics.completeness = Math.min(75, newMetrics.completeness + Math.random() * 3);
          }
          if (newMetrics.clarity > 80 && newMetrics.completeness > 70) {
            if (newMetrics.authenticity === 0) {
              newMetrics.authenticity = 15;
            } else if (newMetrics.authenticity < 85) {
              newMetrics.authenticity = Math.min(85, newMetrics.authenticity + Math.random() * 4);
            }
          }
          if (newMetrics.authenticity > 80) {
            if (newMetrics.compliance === 0) {
              newMetrics.compliance = 20;
            } else if (newMetrics.compliance < 88) {
              newMetrics.compliance = Math.min(88, newMetrics.compliance + Math.random() * 3);
            }
          }
          
          // Calculate overall score
          const scores = [newMetrics.clarity, newMetrics.completeness, newMetrics.authenticity, newMetrics.compliance];
          const completedScores = scores.filter(s => s > 0);
          newMetrics.overall = completedScores.length > 0 ? 
            Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length) : 0;

          return { ...doc, metrics: newMetrics };
        }
        return doc;
      }));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const selectedDocument = documents.find(doc => doc.id === selectedDoc);

  return (
    <section id="document-verification" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-medium mb-6">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Document Verification
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Animated Document Verification Progress
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch real-time AI analysis with beautiful animated progress rings showing document quality metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                    selectedDoc === doc.id 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedDoc(doc.id)}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={doc.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {doc.status}
                        </Badge>
                        {doc.status === 'completed' && (
                          <span className="text-xs text-gray-500">
                            Score: {doc.metrics.overall}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Verification Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Progress
                </div>
                {selectedDocument?.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDocument && (
                <div className="space-y-8">
                  {/* Document Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{selectedDocument.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Document Type:</span>
                        <span className="ml-2 font-medium">{selectedDocument.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Upload Time:</span>
                        <span className="ml-2 font-medium">{selectedDocument.uploadTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2">
                          <Badge variant={selectedDocument.status === 'completed' ? 'default' : 'secondary'}>
                            {selectedDocument.status}
                          </Badge>
                        </span>
                      </div>
                      {selectedDocument.verificationTime && (
                        <div>
                          <span className="text-gray-500">Verified:</span>
                          <span className="ml-2 font-medium">{selectedDocument.verificationTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Overall Score Ring */}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-4">Overall Verification Score</h4>
                    <AnimatedProgressRing
                      progress={selectedDocument.metrics.overall}
                      size={160}
                      strokeWidth={12}
                      color={getOverallScoreColor(selectedDocument.metrics.overall)}
                      showPercentage={selectedDocument.status !== 'analyzing' || selectedDocument.metrics.overall > 0}
                      duration={2000}
                    >
                      {selectedDocument.status === 'analyzing' && selectedDocument.metrics.overall === 0 && (
                        <div className="text-center">
                          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-1" />
                          <p className="text-sm text-gray-500">Analyzing...</p>
                        </div>
                      )}
                    </AnimatedProgressRing>
                  </div>

                  {/* Individual Metrics */}
                  <div>
                    <h4 className="text-lg font-semibold mb-6 text-center">Detailed Analysis Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <MetricRing 
                        label="Clarity" 
                        value={selectedDocument.metrics.clarity} 
                        delay={0}
                        isAnalyzing={selectedDocument.status === 'analyzing'}
                      />
                      <MetricRing 
                        label="Completeness" 
                        value={selectedDocument.metrics.completeness} 
                        delay={200}
                        isAnalyzing={selectedDocument.status === 'analyzing'}
                      />
                      <MetricRing 
                        label="Authenticity" 
                        value={selectedDocument.metrics.authenticity} 
                        delay={400}
                        isAnalyzing={selectedDocument.status === 'analyzing'}
                      />
                      <MetricRing 
                        label="Compliance" 
                        value={selectedDocument.metrics.compliance} 
                        delay={600}
                        isAnalyzing={selectedDocument.status === 'analyzing'}
                      />
                    </div>
                  </div>

                  {/* Issues and Recommendations */}
                  {selectedDocument.issues.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Issues Found
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {selectedDocument.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.status === 'completed' && selectedDocument.issues.length === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Verification Complete
                      </h4>
                      <p className="text-sm text-green-700">
                        Document has passed all verification checks and is ready for submission.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
});

export default DocumentVerificationRings;