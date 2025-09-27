import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoFillManager } from "../components/AutoFillManager";
import { SimpleImageUpload } from "../components/simple-image-upload";
import { AIDocumentProcessor } from "@/components/ai-document-processor";
import { ArrowLeft, Smartphone, FileText, Zap, Bot, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function DocumentProcessingPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  interface OCRResult {
    extractedText?: string;
    documentType?: string;
    confidence?: number;
    structuredData?: Record<string, any>;
  }

  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = async (file: File) => {
    try {
      setUploadedFile(file);
      setError(null);
      
      // Clean up previous preview URL if it exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Process with OCR
      await processDocument(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setOcrResult(null);
    setError(null);
  };

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Call OCR API
      const response = await fetch('/api/documents/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          documentType: 'auto-detect'
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      setOcrResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2 mobile-button">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">AI Document Processing</h1>
              <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                NEW
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-mobile py-mobile">
        {/* Introduction */}
        <div className="mb-8">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Bot className="h-6 w-6 text-red-600" />
                AI-Powered Document Processing Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Revolutionary AI technology that transforms document processing for Polish citizenship applications.
                Upload photos of your documents and watch our AI extract, translate, and organize all the information automatically.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-xl mobile-card">
                  <Smartphone className="h-10 w-10 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-lg">Photo Upload</h3>
                    <p className="text-blue-700">Take clear photos with your phone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-6 bg-green-50 rounded-xl mobile-card">
                  <Bot className="h-10 w-10 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">AI Recognition</h3>
                    <p className="text-green-700">Extract text & translate instantly</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-6 bg-purple-50 rounded-xl mobile-card">
                  <Zap className="h-10 w-10 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-purple-900 text-lg">Auto-Fill Forms</h3>
                    <p className="text-purple-700">Forms completed automatically</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Upload Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl">Document Upload & AI Processing</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mobile-button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/documents/create-test-data', { method: 'POST' });
                      if (response.ok) {
                        alert('✅ Test document created! Check the forms to see demo data.');
                      }
                    } catch (error) {
                      console.error('Error creating test data:', error);
                    }
                  }}
                >
                  Create Test Data
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* NEW: AIDocumentProcessor with Accept/Delete Functionality */}
              <AIDocumentProcessor 
                onDocumentsProcessed={(docs) => {
                  console.log('Documents processed:', docs);
                  // Handle processed documents here if needed
                }}
              />
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}