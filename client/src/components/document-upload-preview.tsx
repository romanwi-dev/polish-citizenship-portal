import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileImage,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  File,
  Eye,
  Download,
  Trash2,
  Shield,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentValidation {
  isValid: boolean;
  documentType: string;
  confidence: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    field?: string;
  }>;
  extractedData?: Record<string, any>;
  suggestions?: string[];
  language?: string;
  quality?: {
    clarity: number;
    completeness: number;
    authenticity: number;
  };
}

interface UploadedDocument {
  id: string;
  file: File;
  preview?: string;
  validation?: DocumentValidation;
  status: 'uploading' | 'validating' | 'valid' | 'invalid' | 'error';
  progress: number;
}

export function DocumentUploadPreview() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const newDocuments: UploadedDocument[] = [];

    for (const file of files) {
      // Quick validation
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        continue;
      }

      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      const newDoc: UploadedDocument = {
        id: docId,
        file,
        preview,
        status: 'uploading',
        progress: 0
      };

      newDocuments.push(newDoc);
    }

    setDocuments(prev => [...prev, ...newDocuments]);

    // Start validation for each document
    for (const doc of newDocuments) {
      validateDocument(doc);
    }
  };

  const validateDocument = async (doc: UploadedDocument) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, progress: i } : d
      ));
    }

    // Update status to validating
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, status: 'validating' } : d
    ));

    try {
      // Convert file to base64 for AI validation
      const base64 = await fileToBase64(doc.file);
      
      // Call validation API
      const response = await fetch('/api/documents/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64,
          documentType: detectDocumentType(doc.file.name),
          metadata: {
            fileName: doc.file.name,
            fileSize: doc.file.size
          }
        })
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const validation: DocumentValidation = await response.json();

      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? {
          ...d,
          validation,
          status: validation.isValid ? 'valid' : 'invalid'
        } : d
      ));

      // Show notification
      toast({
        title: validation.isValid ? "Document validated" : "Validation issues found",
        description: validation.isValid 
          ? `${doc.file.name} passed all checks`
          : `${validation.issues.filter(i => i.type === 'error').length} issues found`,
        variant: validation.isValid ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Validation error:', error);
      
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? {
          ...d,
          status: 'error',
          validation: {
            isValid: false,
            documentType: 'unknown',
            confidence: 0,
            issues: [{
              type: 'error',
              message: 'Failed to validate document. Please try again.'
            }]
          }
        } : d
      ));

      toast({
        title: "Validation error",
        description: "Failed to validate document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const detectDocumentType = (fileName: string): string => {
    const name = fileName.toLowerCase();
    if (name.includes('birth') || name.includes('urodzenia')) return 'birth-certificate';
    if (name.includes('passport') || name.includes('paszport')) return 'passport';
    if (name.includes('marriage') || name.includes('ślubu')) return 'marriage-certificate';
    if (name.includes('citizenship') || name.includes('obywatelstwo')) return 'citizenship-proof';
    if (name.includes('id') || name.includes('dowod')) return 'identity-document';
    return 'general';
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDoc === docId) {
      setSelectedDoc(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'validating':
        return <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const selectedDocument = documents.find(d => d.id === selectedDoc);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        ref={dropZoneRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`border-2 border-dashed transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}>
          <CardContent
            className="p-12 text-center cursor-pointer"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <motion.div
              animate={{
                scale: isDragging ? 1.1 : 1,
                rotate: isDragging ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            </motion.div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? 'Drop your documents here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your documents or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, PDF (Max 10MB)
            </p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">
                AI-powered validation ensures document authenticity
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Document Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedDoc === doc.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDoc(doc.id)}
                >
                  <CardContent className="p-4">
                    {/* Preview or Icon */}
                    <div className="relative h-40 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      {doc.preview ? (
                        <img 
                          src={doc.preview} 
                          alt={doc.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileImage className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Overlay */}
                      {doc.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Uploading...</p>
                            <Progress value={doc.progress} className="w-32 mt-2" />
                          </div>
                        </div>
                      )}
                      
                      {doc.status === 'validating' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Sparkles className="h-8 w-8 animate-pulse mx-auto mb-2" />
                            <p className="text-sm">AI Validation...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate flex-1">
                          {doc.file.name}
                        </p>
                        {getStatusIcon(doc.status)}
                      </div>
                      
                      {doc.validation && (
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.validation.isValid ? "default" : "destructive"}>
                            {doc.validation.documentType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {doc.validation.confidence}% confidence
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download logic
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDocument(doc.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Selected Document Details */}
      {selectedDocument && selectedDocument.validation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Document Analysis</span>
                <Badge variant={selectedDocument.validation.isValid ? "default" : "destructive"}>
                  {selectedDocument.validation.isValid ? 'Valid' : 'Issues Found'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="validation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                  <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                  <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="validation" className="space-y-4">
                  {/* Issues */}
                  {selectedDocument.validation.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium mb-2">Issues & Warnings</h4>
                      {selectedDocument.validation.issues.map((issue, idx) => (
                        <Alert key={idx} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                          <div className="flex items-start gap-2">
                            {getIssueIcon(issue.type)}
                            <AlertDescription>
                              {issue.message}
                              {issue.field && (
                                <span className="block text-sm mt-1 text-gray-500">
                                  Field: {issue.field}
                                </span>
                              )}
                            </AlertDescription>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {selectedDocument.validation.suggestions && selectedDocument.validation.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium mb-2">Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedDocument.validation.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="extracted" className="space-y-4">
                  {selectedDocument.validation.extractedData && (
                    <div className="space-y-2">
                      {Object.entries(selectedDocument.validation.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="quality" className="space-y-4">
                  {selectedDocument.validation.quality && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Clarity</span>
                          <span className="text-sm text-gray-600">
                            {selectedDocument.validation.quality.clarity}%
                          </span>
                        </div>
                        <Progress value={selectedDocument.validation.quality.clarity} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Completeness</span>
                          <span className="text-sm text-gray-600">
                            {selectedDocument.validation.quality.completeness}%
                          </span>
                        </div>
                        <Progress value={selectedDocument.validation.quality.completeness} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Authenticity</span>
                          <span className="text-sm text-gray-600">
                            {selectedDocument.validation.quality.authenticity}%
                          </span>
                        </div>
                        <Progress value={selectedDocument.validation.quality.authenticity} />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}