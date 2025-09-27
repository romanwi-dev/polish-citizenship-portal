import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ObjectUploader } from "./ObjectUploader";
import { Upload, FileText, Brain, CheckCircle, AlertCircle, Camera } from "lucide-react";
import type { UploadResult } from "@uppy/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OCRResult {
  id: string;
  fileName: string;
  extractedText: string;
  documentType: 'passport' | 'birth_certificate' | 'marriage_certificate' | 'other';
  structuredData: {
    personalInfo: {
      firstName?: string;
      lastName?: string;
      birthDate?: string;
      birthPlace?: string;
      nationality?: string;
      passportNumber?: string;
      issueDate?: string;
      expiryDate?: string;
    };
    parentInfo?: {
      fatherName?: string;
      motherName?: string;
      fatherBirthPlace?: string;
      motherBirthPlace?: string;
    };
    marriageInfo?: {
      spouseName?: string;
      marriageDate?: string;
      marriagePlace?: string;
    };
  };
  polishTranslation?: string;
  confidence: number;
  status: 'processing' | 'completed' | 'error';
  processedAt: string;
}

interface DocumentSummary {
  totalDocuments: number;
  completeness: number;
  missingDocuments: string[];
  recommendations: string[];
  applicationStrength: 'weak' | 'moderate' | 'strong';
}

export function DocumentProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const queryClient = useQueryClient();

  // Query to get processed documents
  const { data: processedDocuments = [], isLoading: documentsLoading } = useQuery<OCRResult[]>({
    queryKey: ['/api/documents/processed'],
    enabled: uploadedFiles.length > 0,
  });

  // Query to get document summary
  const { data: documentSummary } = useQuery<DocumentSummary>({
    queryKey: ['/api/documents/summary'],
    enabled: processedDocuments && processedDocuments.length > 0,
  });

  // Mutation for processing uploaded documents
  const processDocumentMutation = useMutation({
    mutationFn: async (documentUrl: string) => {
      return apiRequest('POST', `/api/documents/process`, { documentUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/processed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents/summary'] });
    }
  });

  // Mutation for auto-filling forms
  const autoFillFormsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/documents/auto-fill-forms`);
    },
    onSuccess: () => {
      // Refresh form data
      queryClient.invalidateQueries({ queryKey: ['/api/family-tree'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applicant-details'] });
    }
  });

  const handleGetUploadParameters = async (file: any) => {
    const data = await apiRequest('POST', '/api/objects/upload');
    return {
      method: 'PUT' as const,
      url: (data as any).uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      for (const file of result.successful) {
        if (file.uploadURL) {
          const newFiles = [...uploadedFiles, file.uploadURL];
          setUploadedFiles(newFiles);
          
          // Start processing the document
          processDocumentMutation.mutate(file.uploadURL);
          
          // Simulate processing progress
          setProcessingProgress(0);
          const progressInterval = setInterval(() => {
            setProcessingProgress(prev => {
              if (prev >= 100) {
                clearInterval(progressInterval);
                return 100;
              }
              return prev + 10;
            });
          }, 200);
        }
      }
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'passport': return '🛂';
      case 'birth_certificate': return '👶';
      case 'marriage_certificate': return '💑';
      default: return '📄';
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'birth_certificate': return 'Birth Certificate';
      case 'marriage_certificate': return 'Marriage Certificate';
      default: return 'Other Document';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Document Upload & Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Camera className="h-4 w-4" />
            <AlertDescription>
              Take clear photos of your documents with your phone. The AI will automatically extract and translate all information.
            </AlertDescription>
          </Alert>

          <ObjectUploader
            maxNumberOfFiles={10}
            maxFileSize={10485760} // 10MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full h-16 text-lg animated-button"
          >
            <div className="flex items-center gap-3">
              <Upload className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Upload Documents</div>
                <div className="text-sm text-gray-500">Passport, birth & marriage certificates</div>
              </div>
            </div>
          </ObjectUploader>

          {processDocumentMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing document with AI...</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Documents */}
      {processedDocuments && processedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Processed Documents ({processedDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {processedDocuments.map((doc: OCRResult) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getDocumentTypeIcon(doc.documentType)}</span>
                    <div>
                      <div className="font-medium">{getDocumentTypeName(doc.documentType)}</div>
                      <div className="text-sm text-gray-500">{doc.fileName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getConfidenceColor(doc.confidence)}>
                      {Math.round(doc.confidence * 100)}% confidence
                    </Badge>
                    {doc.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {doc.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </div>

                {/* Extracted Information */}
                {doc.structuredData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {/* Personal Info */}
                    {doc.structuredData.personalInfo && Object.keys(doc.structuredData.personalInfo).length > 0 && (
                      <div className="space-y-1">
                        <div className="font-medium text-blue-800">Personal Information</div>
                        {Object.entries(doc.structuredData.personalInfo).map(([key, value]) => 
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Parent Info */}
                    {doc.structuredData.parentInfo && Object.keys(doc.structuredData.parentInfo).length > 0 && (
                      <div className="space-y-1">
                        <div className="font-medium text-green-800">Parent Information</div>
                        {Object.entries(doc.structuredData.parentInfo).map(([key, value]) => 
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Marriage Info */}
                    {doc.structuredData.marriageInfo && Object.keys(doc.structuredData.marriageInfo).length > 0 && (
                      <div className="space-y-1">
                        <div className="font-medium text-purple-800">Marriage Information</div>
                        {Object.entries(doc.structuredData.marriageInfo).map(([key, value]) => 
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Polish Translation */}
                {doc.polishTranslation && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600">
                      View Polish Translation
                    </summary>
                    <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                      {doc.polishTranslation}
                    </div>
                  </details>
                )}
              </div>
            ))}

            {/* Auto-fill Forms Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={() => autoFillFormsMutation.mutate()}
                disabled={autoFillFormsMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white animated-button"
              >
                <Brain className="mr-2 h-5 w-5" />
                {autoFillFormsMutation.isPending ? 'Auto-filling Forms...' : 'Auto-fill Forms with Extracted Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Summary */}
      {documentSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Application Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{documentSummary.totalDocuments}</div>
                <div className="text-sm text-gray-600">Documents Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{documentSummary.completeness}%</div>
                <div className="text-sm text-gray-600">Completeness</div>
              </div>
              <div className="text-center">
                <Badge 
                  className={
                    documentSummary.applicationStrength === 'strong' ? 'bg-green-100 text-green-800' :
                    documentSummary.applicationStrength === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {documentSummary.applicationStrength.toUpperCase()} CASE
                </Badge>
              </div>
            </div>

            {documentSummary.missingDocuments && documentSummary.missingDocuments.length > 0 && (
              <div>
                <div className="font-medium text-orange-800 mb-2">Missing Documents:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {documentSummary.missingDocuments.map((doc, index) => (
                    <li key={index} className="text-orange-700">{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {documentSummary.recommendations && documentSummary.recommendations.length > 0 && (
              <div>
                <div className="font-medium text-blue-800 mb-2">Recommendations:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {documentSummary.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}