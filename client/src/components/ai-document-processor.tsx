import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Languages,
  FileCheck,
  User,
  Users,
  Heart,
  Baby,
  X,
  Check,
  Trash2
} from "lucide-react";

interface ProcessedDocument {
  id: string;
  filename: string;
  type: DocumentType;
  status: 'uploading' | 'processing' | 'translating' | 'completed' | 'error' | 'pending-review';
  progress: number;
  file?: File; // Store the actual file for upload
  currentStage?: string; // Current processing stage description
  extractedData?: ExtractedData;
  polishTranslation?: string;
  originalText?: string;
  error?: string;
  accepted?: boolean;
}

type DocumentType = 
  | 'applicant-passport' 
  | 'applicant-birth' 
  | 'applicant-marriage'
  | 'child-mother-birth'
  | 'parents-marriage'
  | 'child-passport'
  | 'spouse-passport';

interface ExtractedData {
  name?: string;
  birthDate?: string;
  birthPlace?: string;
  marriageDate?: string;
  marriagePlace?: string;
  passportNumber?: string;
  fatherName?: string;
  motherName?: string;
  motherMaidenName?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
}

interface AIDocumentProcessorProps {
  onDocumentsProcessed: (documents: ProcessedDocument[]) => void;
  existingDocuments?: ProcessedDocument[];
}

export function AIDocumentProcessor({ onDocumentsProcessed, existingDocuments = [] }: AIDocumentProcessorProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ProcessedDocument[]>(existingDocuments);
  const [isProcessing, setIsProcessing] = useState(false);

  const documentTypeLabels: Record<DocumentType, { label: string; icon: React.ReactNode; color: string }> = {
    'applicant-passport': { label: 'Your Passport', icon: <User className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    'applicant-birth': { label: 'Your Birth Certificate', icon: <User className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    'applicant-marriage': { label: 'Your Marriage Certificate', icon: <Heart className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800' },
    'child-mother-birth': { label: "Your Children's Mother's Birth Certificate", icon: <Baby className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    'parents-marriage': { label: 'Parents Marriage Certificate', icon: <Users className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    'child-passport': { label: "Child's Passport", icon: <Baby className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    'spouse-passport': { label: "Spouse's Passport", icon: <Heart className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800' },
  };

  const handleFileUpload = useCallback(async (files: FileList, documentType: DocumentType) => {
    setIsProcessing(true);
    
    const newDocuments = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      filename: file.name,
      type: documentType,
      status: 'uploading' as const,
      progress: 0,
      file: file, // Store the actual file for upload
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    for (const document of newDocuments) {
      try {
        // Stage 1: Uploading (25% progress)
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'uploading', progress: 25, currentStage: '📤 Uploading file to server...' }
            : doc
        ));

        console.log('Uploading:', document.type, document.filename);
        await new Promise(resolve => setTimeout(resolve, 800)); // Show upload stage

        // Real server upload with FormData
        const formData = new FormData();
        formData.append('file', document.file);
        formData.append('type', document.type);

        // Stage 2: Data Extraction (50% progress)
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'processing', progress: 50, currentStage: '🔍 Extracting data from document...' }
            : doc
        ));

        const response = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        console.log('Server response:', result);
        await new Promise(resolve => setTimeout(resolve, 1200)); // Show processing stage

        // Stage 3: Polish Translation (75% progress)
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'translating', progress: 75, currentStage: '🇵🇱 Translating to Polish...' }
            : doc
        ));

        await new Promise(resolve => setTimeout(resolve, 1000)); // Show translation stage

        // Stage 4: Ready for Review (100% progress)
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { 
                ...doc, 
                status: 'pending-review', 
                progress: 100, 
                currentStage: '✅ Processing complete - Ready for review',
                extractedData: result.extractedData,
                polishTranslation: result.translatedText,
                originalText: result.extractedText
              }
            : doc
        ));

        toast({
          title: "Document processed successfully",
          description: `${document.filename} has been processed. Review and accept to populate forms.`,
        });

      } catch (error) {
        console.error('Document processing error:', error);
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'error', error: 'Processing failed' }
            : doc
        ));

        toast({
          title: "Error processing document",
          description: `Failed to process ${document.filename}. Please try again.`,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  }, [toast]);

  // Accept document function
  const acceptDocument = (docId: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'completed', accepted: true } 
          : doc
      )
    );
    
    toast({
      title: "Document Accepted",
      description: "Document data has been accepted and will be used to populate your forms.",
    });
  };

  // Delete document function  
  const deleteDocument = (docId: string) => {
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
    
    toast({
      title: "Document Deleted",
      description: "Document has been removed. You can upload a new one if needed.",
    });
  };

  // Simulate data extraction based on document type
  const simulateDataExtraction = async (type: DocumentType): Promise<ExtractedData> => {
    const baseData: ExtractedData = {};

    switch (type) {
      case 'applicant-passport':
      case 'child-passport':
      case 'spouse-passport':
        return {
          ...baseData,
          name: 'Andrew John MALINSKI',
          birthDate: '15.01.1990',
          birthPlace: 'New York, USA',
          passportNumber: 'US123456789',
          issueDate: '01.06.2020',
          expiryDate: '01.06.2030',
        };
      
      case 'applicant-birth':
      case 'father-birth' as any:
      case 'mother-birth' as any:
        return {
          ...baseData,
          name: 'Andrew John MALINSKI',
          birthDate: '15.01.1990',
          birthPlace: 'New York, USA',
          fatherName: 'Michael John MALINSKI',
          motherName: 'Anna Maria KOWALSKI',
          motherMaidenName: 'NOWAK',
          documentNumber: 'BC123456',
        };
      
      case 'applicant-marriage':
      case 'father-marriage' as any:
      case 'mother-marriage' as any:
        return {
          ...baseData,
          marriageDate: '15.06.2015',
          marriagePlace: 'Chicago, USA',
          name: 'Andrew John MALINSKI',
          documentNumber: 'MC789012',
        };
      
      default:
        return baseData;
    }
  };

  // Simulate Polish translation
  const simulatePolishTranslation = async (data: ExtractedData): Promise<string> => {
    const polishFields: string[] = [];
    
    if (data.name) polishFields.push(`Imię i nazwisko: ${data.name}`);
    if (data.birthDate) polishFields.push(`Data urodzenia: ${data.birthDate}`);
    if (data.birthPlace) polishFields.push(`Miejsce urodzenia: ${data.birthPlace}`);
    if (data.marriageDate) polishFields.push(`Data ślubu: ${data.marriageDate}`);
    if (data.marriagePlace) polishFields.push(`Miejsce ślubu: ${data.marriagePlace}`);
    if (data.passportNumber) polishFields.push(`Numer paszportu: ${data.passportNumber}`);
    if (data.fatherName) polishFields.push(`Imię i nazwisko ojca: ${data.fatherName}`);
    if (data.motherName) polishFields.push(`Imię i nazwisko matki: ${data.motherName}`);
    if (data.motherMaidenName) polishFields.push(`Nazwisko panieńskie matki: ${data.motherMaidenName}`);
    if (data.documentNumber) polishFields.push(`Numer dokumentu: ${data.documentNumber}`);
    if (data.issueDate) polishFields.push(`Data wydania: ${data.issueDate}`);
    if (data.expiryDate) polishFields.push(`Data ważności: ${data.expiryDate}`);
    
    return polishFields.join('\n');
  };

  // Generate original text from extracted data
  const generateOriginalText = (data: ExtractedData): string => {
    const fields: string[] = [];
    
    if (data.name) fields.push(`Name: ${data.name}`);
    if (data.birthDate) fields.push(`Birth Date: ${data.birthDate}`);
    if (data.birthPlace) fields.push(`Birth Place: ${data.birthPlace}`);
    if (data.marriageDate) fields.push(`Marriage Date: ${data.marriageDate}`);
    if (data.marriagePlace) fields.push(`Marriage Place: ${data.marriagePlace}`);
    if (data.passportNumber) fields.push(`Passport Number: ${data.passportNumber}`);
    if (data.fatherName) fields.push(`Father's Name: ${data.fatherName}`);
    if (data.motherName) fields.push(`Mother's Name: ${data.motherName}`);
    if (data.motherMaidenName) fields.push(`Mother's Maiden Name: ${data.motherMaidenName}`);
    if (data.documentNumber) fields.push(`Document Number: ${data.documentNumber}`);
    if (data.issueDate) fields.push(`Issue Date: ${data.issueDate}`);
    if (data.expiryDate) fields.push(`Expiry Date: ${data.expiryDate}`);
    
    return fields.join('\n');
  };

  const getStatusIcon = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'translating':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending-review':
        return <Eye className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: ProcessedDocument['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Extracting data...';
      case 'translating':
        return 'Translating to Polish...';
      case 'completed':
        return 'Completed';
      case 'pending-review':
        return 'Review Required';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  // Update parent component when documents change
  useEffect(() => {
    onDocumentsProcessed(documents);
  }, [documents, onDocumentsProcessed]);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
          <FileCheck className="h-8 w-8" />
          AI Document Processing & Translation
        </CardTitle>
        <div className="mt-2">
          {/* Blank space where subtitle was removed per user request */}
        </div>

      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* Document Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['applicant-passport', 'applicant-birth', 'applicant-marriage', 'child-mother-birth', 'parents-marriage', 'child-passport', 'spouse-passport']
            .map(type => [type, documentTypeLabels[type as DocumentType]] as const)
            .filter(([type, labelInfo]) => labelInfo)
            .map(([type, { label, icon, color }]) => {
            const hasDocument = documents.some(doc => doc.type === type && doc.status !== 'error');
            
            return (
              <Card key={type} className={`border-2 ${hasDocument ? 'border-green-200 bg-green-50' : 'border-dashed border-gray-300 hover:border-blue-400'} transition-colors`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <span className={`text-sm ${['applicant-passport', 'applicant-birth', 'applicant-marriage'].includes(type) ? 'font-bold' : 'font-medium'}`}>{label}</span>
                    {hasDocument && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
                  </div>
                  
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    id={`upload-${type}`}
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleFileUpload(e.target.files, type as DocumentType);
                      }
                    }}
                  />
                  
                  <label
                    htmlFor={`upload-${type}`}
                    className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${hasDocument ? 'border-green-300 bg-green-100' : 'border-gray-300'}`}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {hasDocument ? 'Update' : 'Upload'}
                    </span>
                  </label>
                  
                  <Badge className={`mt-2 text-xs ${color}`}>
                    {hasDocument ? 'Uploaded' : 'Upload'}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Processed Documents List */}
        {documents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2 border-b pb-2">
              <Languages className="h-5 w-5" />
              Processing Status
            </h3>
            
            <div className="space-y-3">
              {documents.map((document) => (
                <Card key={document.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(document.status)}
                      </div>
                      
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{document.filename}</p>
                            <p className="text-sm text-gray-600">
                              {documentTypeLabels[document.type]?.label}
                            </p>
                          </div>
                          <Badge className={documentTypeLabels[document.type]?.color}>
                            {getStatusText(document.status)}
                          </Badge>
                        </div>
                        
                        {(document.status === 'uploading' || document.status === 'processing' || document.status === 'translating') && (
                          <Progress value={document.progress} className="w-full" />
                        )}
                        
                        {document.status === 'error' && document.error && (
                          <p className="text-sm text-red-600">{document.error}</p>
                        )}
                        
                        {/* Pending Review - Show accept/delete options */}
                        {document.status === 'pending-review' && document.polishTranslation && (
                          <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm font-medium text-amber-800 mb-3">
                                Document processed successfully! Please review the extracted data and choose an action:
                              </p>
                              
                              {/* Show extracted data */}
                              <details className="group mb-3">
                                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  View extracted data (Polish)
                                </summary>
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-line">
                                  {document.polishTranslation}
                                </div>
                              </details>
                              
                              {document.originalText && (
                                <details className="group mb-3">
                                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    View original data (English)
                                  </summary>
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-line">
                                    {document.originalText}
                                  </div>
                                </details>
                              )}
                              
                              {/* Accept/Delete buttons */}
                              <div className="flex gap-3 pt-2">
                                <Button
                                  onClick={() => acceptDocument(document.id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  size="sm"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept & Use Data
                                </Button>
                                <Button
                                  onClick={() => deleteDocument(document.id)}
                                  variant="destructive"
                                  className="flex-1"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete & Retry
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Completed documents */}
                        {document.status === 'completed' && document.polishTranslation && (
                          <div className="space-y-2">
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                              ✓ Document accepted and data extracted successfully
                            </div>
                            <details className="group">
                              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                View extracted data (Polish)
                              </summary>
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-line">
                                {document.polishTranslation}
                              </div>
                            </details>
                            
                            {document.originalText && (
                              <details className="group">
                                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  View original data (English)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-line">
                                  {document.originalText}
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Processing Summary */}
        {documents.length > 0 && (
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Processing Summary</h4>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{documents.filter(d => d.status === 'completed').length} Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-amber-600" />
                <span>{documents.filter(d => d.status === 'pending-review').length} Pending Review</span>
              </div>
              <div className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 text-blue-600" />
                <span>{documents.filter(d => ['uploading', 'processing', 'translating'].includes(d.status)).length} Processing</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>{documents.filter(d => d.status === 'error').length} Errors</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type { ProcessedDocument, DocumentType, ExtractedData };