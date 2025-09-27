import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataPopulationForm } from '@/components/DataPopulationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye,
  Archive,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { SimplePDFViewer } from '@/components/SimplePDFViewer';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { DataEntry, GeneratedDocument } from '@shared/schema';

interface DataPopulationFormValues {
  applicantFirstName: string;
  applicantLastName: string;
  applicantBirthName?: string;
  applicantDateOfBirth: string;
  applicantPlaceOfBirth: string;
  applicantGender: 'male' | 'female';
  applicantDocumentType: string;
  applicantDocumentNumber: string;
  applicantNationality: string;
  applicantPesel?: string;
  applicantMaritalStatus?: string;
  applicantCountry: string;
  applicantStreet: string;
  applicantHouseNumber: string;
  applicantApartmentNumber?: string;
  applicantPostalCode: string;
  applicantCity: string;
  applicantPhone: string;
  applicantEmail: string;
  
  // Minor Child Data
  childFirstName?: string;
  childLastName?: string;
  childDateOfBirth?: string;
  childPlaceOfBirth?: string;
  
  // Polish Parent Data (for minor POA)
  polishParentFirstName?: string;
  polishParentLastName?: string;
  
  // Spouse Data
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseDocumentNumber?: string;
  marriageDate?: string;
  marriagePlace?: string;
  husbandSurname?: string;
  wifeSurname?: string;
  childrenSurnames?: string;
  
  // Parent Data with emigration/naturalization dates
  fatherFirstName?: string;
  fatherLastName?: string;
  fatherBirthName?: string;
  fatherDateOfBirth?: string;
  fatherPlaceOfBirth?: string;
  fatherNationality?: string;
  fatherPesel?: string;
  fatherEmigrationDate?: string;
  fatherNaturalizationDate?: string;
  
  motherFirstName?: string;
  motherLastName?: string;
  motherBirthName?: string;
  motherDateOfBirth?: string;
  motherPlaceOfBirth?: string;
  motherNationality?: string;
  motherPesel?: string;
  motherEmigrationDate?: string;
  motherNaturalizationDate?: string;
  
  // Grandparent Data with emigration/naturalization dates
  fatherGrandpaFirstName?: string;
  fatherGrandpaLastName?: string;
  fatherGrandpaDateOfBirth?: string;
  fatherGrandpaPlaceOfBirth?: string;
  fatherGrandpaEmigrationDate?: string;
  fatherGrandpaNaturalizationDate?: string;
  
  fatherGrandmaFirstName?: string;
  fatherGrandmaLastName?: string;
  fatherGrandmaBirthName?: string;
  fatherGrandmaDateOfBirth?: string;
  fatherGrandmaPlaceOfBirth?: string;
  fatherGrandmaEmigrationDate?: string;
  fatherGrandmaNaturalizationDate?: string;
  
  motherGrandpaFirstName?: string;
  motherGrandpaLastName?: string;
  motherGrandpaDateOfBirth?: string;
  motherGrandpaPlaceOfBirth?: string;
  motherGrandpaEmigrationDate?: string;
  motherGrandpaNaturalizationDate?: string;
  
  motherGrandmaFirstName?: string;
  motherGrandmaLastName?: string;
  motherGrandmaBirthName?: string;
  motherGrandmaDateOfBirth?: string;
  motherGrandmaPlaceOfBirth?: string;
  motherGrandmaEmigrationDate?: string;
  motherGrandmaNaturalizationDate?: string;
  
  // Great Grandparent Data - Father's side
  fatherGreatGrandpaFirstName?: string;
  fatherGreatGrandpaLastName?: string;
  fatherGreatGrandpaDateOfBirth?: string;
  fatherGreatGrandpaPlaceOfBirth?: string;
  fatherGreatGrandpaEmigrationDate?: string;
  fatherGreatGrandpaNaturalizationDate?: string;
  
  fatherGreatGrandmaFirstName?: string;
  fatherGreatGrandmaLastName?: string;
  fatherGreatGrandmaBirthName?: string;
  fatherGreatGrandmaDateOfBirth?: string;
  fatherGreatGrandmaPlaceOfBirth?: string;
  fatherGreatGrandmaEmigrationDate?: string;
  fatherGreatGrandmaNaturalizationDate?: string;
  
  // Great Grandparent Data - Mother's side
  motherGreatGrandpaFirstName?: string;
  motherGreatGrandpaLastName?: string;
  motherGreatGrandpaDateOfBirth?: string;
  motherGreatGrandpaPlaceOfBirth?: string;
  motherGreatGrandpaEmigrationDate?: string;
  motherGreatGrandpaNaturalizationDate?: string;
  
  motherGreatGrandmaFirstName?: string;
  motherGreatGrandmaLastName?: string;
  motherGreatGrandmaBirthName?: string;
  motherGreatGrandmaDateOfBirth?: string;
  motherGreatGrandmaPlaceOfBirth?: string;
  motherGreatGrandmaEmigrationDate?: string;
  motherGreatGrandmaNaturalizationDate?: string;
  
  // Document specific fields
  eventType?: string;
  eventDate?: string;
  eventPlace?: string;
  eventCountry?: string;
  registryOffice?: string;
  actNumber?: string;
  actYear?: string;
  oldName?: string;
  newName?: string;
  incorrectData?: string;
  correctData?: string;
  notes?: string;
}

interface PDFGenerationResult {
  fileName: string;
  filePath: string;
  status: 'success' | 'error';
  error?: string;
}

interface BulkPDFResult {
  generatedFiles: PDFGenerationResult[];
  totalGenerated: number;
  errors: string[];
  zipFilePath?: string;
}

export default function DataPopulation() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [lastGenerationResult, setLastGenerationResult] = useState<BulkPDFResult | null>(null);
  const [previewPDF, setPreviewPDF] = useState<{url: string, name: string} | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for saved data entries
  const { data: savedEntries, isLoading: entriesLoading } = useQuery<DataEntry[]>({
    queryKey: ['/api/data-population/entries'],
    enabled: true,
  });

  // Query for generated documents
  const { data: generatedDocs, isLoading: docsLoading } = useQuery<GeneratedDocument[]>({
    queryKey: ['/api/data-population/documents', savedEntryId],
    enabled: !!savedEntryId,
  });

  // Mutation for saving data
  const saveDataMutation = useMutation({
    mutationFn: async (data: DataPopulationFormValues) => {
      const response = await apiRequest('POST', '/api/data-population/save', {
        sessionId,
        ...data
      });
      return response.json();
    },
    onSuccess: (response: any) => {
      setSavedEntryId(response.id);
      toast({
        title: "Data Saved Successfully",
        description: "Your form data has been saved. You can now generate PDF documents.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data-population/entries'] });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for generating PDFs (bulk)
  const generatePDFsMutation = useMutation<BulkPDFResult, Error, DataPopulationFormValues>({
    mutationFn: async (data: DataPopulationFormValues) => {
      setGenerationProgress(0);
      setGenerationStatus('Initializing PDF generation...');
      
      // Start generation process
      const response = await apiRequest('POST', '/api/data-population/generate-pdfs', {
        sessionId,
        ...data
      });
      
      const result = await response.json();

      // Simulate progress updates (in real implementation, this would be done via WebSocket or polling)
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 95) progress = 95;
          setGenerationProgress(progress);
          
          if (progress < 30) {
            setGenerationStatus('Processing document templates...');
          } else if (progress < 60) {
            setGenerationStatus('Generating Polish documents...');
          } else if (progress < 90) {
            setGenerationStatus('Creating PDF files...');
          } else {
            setGenerationStatus('Finalizing documents...');
          }
        }, 500);

        // Complete after response
        setTimeout(() => {
          clearInterval(interval);
          setGenerationProgress(100);
          setGenerationStatus('Generation complete!');
        }, 3000);
      };

      simulateProgress();
      return result;
    },
    onSuccess: (result: BulkPDFResult) => {
      setLastGenerationResult(result);
      toast({
        title: "PDFs Generated Successfully",
        description: `Generated ${result.totalGenerated} documents. ${result.errors.length > 0 ? `${result.errors.length} errors occurred.` : 'All documents created successfully.'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data-population/documents'] });
    },
    onError: (error) => {
      console.error('PDF generation error:', error);
      setGenerationProgress(0);
      setGenerationStatus('');
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDFs. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for generating specific PDF
  const generateSpecificPDFMutation = useMutation<PDFGenerationResult, Error, { data: DataPopulationFormValues; pdfType: string }>({
    mutationFn: async ({ data, pdfType }: { data: DataPopulationFormValues; pdfType: string }) => {
      setGenerationProgress(0);
      setGenerationStatus(`Generating ${pdfType} document...`);
      
      const response = await apiRequest('POST', '/api/data-population/generate-specific-pdf', {
        sessionId,
        pdfType,
        ...data
      });

      // Simulate progress for specific document
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress > 95) progress = 95;
          setGenerationProgress(progress);
          
          if (progress < 40) {
            setGenerationStatus(`Processing ${pdfType} template...`);
          } else if (progress < 80) {
            setGenerationStatus(`Populating ${pdfType} data...`);
          } else {
            setGenerationStatus(`Creating ${pdfType} PDF...`);
          }
        }, 300);

        setTimeout(() => {
          clearInterval(interval);
          setGenerationProgress(100);
          setGenerationStatus('Document ready for download!');
        }, 2000);
      };

      simulateProgress();
      return response.json();
    },
    onSuccess: (result: PDFGenerationResult, variables) => {
      toast({
        title: "PDF Generated Successfully",
        description: `${variables.pdfType} document created and ready for download.`,
      });
      // Auto-download the generated PDF
      if (result.fileName && result.filePath) {
        downloadDocument(result.fileName, result.filePath);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/data-population/documents'] });
    },
    onError: (error, variables) => {
      console.error('Specific PDF generation error:', error);
      setGenerationProgress(0);
      setGenerationStatus('');
      toast({
        title: "PDF Generation Failed",
        description: `Failed to generate ${variables.pdfType}. ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: "destructive",
      });
    }
  });

  const handleFormSubmit = (data: DataPopulationFormValues) => {
    saveDataMutation.mutate(data);
  };

  const handleGeneratePDFs = (data: DataPopulationFormValues) => {
    generatePDFsMutation.mutate(data);
  };

  const handleGenerateSpecificPDF = (data: DataPopulationFormValues, pdfType: string) => {
    generateSpecificPDFMutation.mutate({ data, pdfType });
  };

  const downloadDocument = async (fileName: string, filePath: string) => {
    try {
      const response = await fetch(`/api/data-population/download/${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const downloadAllAsZip = async () => {
    if (!lastGenerationResult?.zipFilePath) {
      toast({
        title: "No ZIP Available",
        description: "Generate documents first to download as ZIP",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/data-population/download-zip');
      if (!response.ok) {
        throw new Error('ZIP download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Polish_Documents_${sessionId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "ZIP Download Started",
        description: "Downloading all documents as ZIP file",
      });
    } catch (error) {
      toast({
        title: "ZIP Download Failed",
        description: error instanceof Error ? error.message : "Failed to download ZIP file",
        variant: "destructive",
      });
    }
  };

  const clearGeneration = () => {
    setLastGenerationResult(null);
    setGenerationProgress(0);
    setGenerationStatus('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Polish Document Population System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete data entry system with AI-powered OCR for generating all Polish citizenship documents. 
            Upload documents for automatic extraction or enter data manually to create print-ready PDFs.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session ID:</span>
                  <Badge variant="outline">{sessionId.slice(-8)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Data Saved:</span>
                  <Badge variant={savedEntryId ? "default" : "secondary"}>
                    {savedEntryId ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Generation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Generation:</span>
                  <Badge variant={lastGenerationResult ? "default" : "secondary"}>
                    {lastGenerationResult ? `${lastGenerationResult.totalGenerated} files` : "None"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Errors:</span>
                  <Badge variant={lastGenerationResult?.errors.length ? "destructive" : "default"}>
                    {lastGenerationResult?.errors.length || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Archive className="h-5 w-5 text-purple-600" />
                Available Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Individual PDFs:</span>
                  <span className="text-sm font-semibold">
                    {lastGenerationResult?.generatedFiles.filter(f => f.status === 'success').length || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const firstSuccessFile = lastGenerationResult?.generatedFiles.find(f => f.status === 'success');
                      if (firstSuccessFile) {
                        setPreviewPDF({ url: firstSuccessFile.filePath, name: 'Generated Documents' });
                      }
                    }}
                    disabled={!lastGenerationResult?.generatedFiles.some(f => f.status === 'success')}
                    className="w-full bg-blue-50 hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview PDFs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadAllAsZip}
                    disabled={!lastGenerationResult?.zipFilePath}
                    className="w-full"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Download ZIP
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Progress */}
        {(generatePDFsMutation.isPending || generateSpecificPDFMutation.isPending) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating PDF Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={generationProgress} className="w-full" />
                <div className="flex justify-between text-sm">
                  <span>{generationStatus}</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                {generateSpecificPDFMutation.isPending && (
                  <div className="text-xs text-gray-500 text-center">
                    Individual document generation - will auto-download when complete
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generation Results */}
        {lastGenerationResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Generation Results
                </div>
                <Button variant="outline" size="sm" onClick={clearGeneration} data-testid="button-clear-generation">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {lastGenerationResult.totalGenerated} Generated
                  </Badge>
                  {lastGenerationResult.errors.length > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {lastGenerationResult.errors.length} Errors
                    </Badge>
                  )}
                </div>

                {/* Generated Files */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Generated Documents:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lastGenerationResult.generatedFiles
                      .filter(file => file.status === 'success')
                      .map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm truncate" title={file.fileName}>
                              {file.fileName}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewPDF({ url: file.filePath, name: file.fileName })}
                              className="bg-blue-50 hover:bg-blue-100"
                              title="Preview PDF"
                              data-testid="button-preview-pdf"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadDocument(file.fileName, file.filePath)}
                              title="Download PDF"
                              data-testid="button-download-pdf"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Errors */}
                {lastGenerationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">Errors:</h4>
                    <div className="space-y-2">
                      {lastGenerationResult.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Main Form */}
        <DataPopulationForm
          onSubmit={handleFormSubmit}
          onGeneratePDFs={handleGeneratePDFs}
          onGenerateSpecificPDF={handleGenerateSpecificPDF}
          isLoading={saveDataMutation.isPending || generatePDFsMutation.isPending || generateSpecificPDFMutation.isPending}
        />
      </div>
      
      {/* PDF Preview Modal */}
      {previewPDF && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <SimplePDFViewer
            pdfUrl={previewPDF.url}
            pdfName={previewPDF.name}
            onClose={() => setPreviewPDF(null)}
          />
        </div>
      )}
    </div>
  );
}