import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  FileImage, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  RotateCcw,
  Zap,
  Star,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OCRProvider {
  id: string;
  name: string;
  description: string;
  confidence: number;
  recommended: boolean;
  icon: React.ReactNode;
}

interface OCRResult {
  provider: string;
  confidence: number;
  extractedData: any;
  recommendations: string[];
  processingTime: number;
}

interface PremiumOCRProps {
  onDocumentProcessed: (result: OCRResult) => void;
  isProcessing: boolean;
  ocrResult: OCRResult | null;
  className?: string;
}

const OCR_PROVIDERS: OCRProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI Vision',
    description: 'Best for passport and ID documents',
    confidence: 95,
    recommended: true,
    icon: <Star className="w-4 h-4" />
  },
  {
    id: 'claude',
    name: 'Claude Vision',
    description: 'Excellent for complex documents',
    confidence: 92,
    recommended: false,
    icon: <Eye className="w-4 h-4" />
  },
  {
    id: 'grok',
    name: 'Grok Vision',
    description: 'Latest AI technology',
    confidence: 88,
    recommended: false,
    icon: <Zap className="w-4 h-4" />
  }
];

export function PremiumOCR({ onDocumentProcessed, isProcessing, ocrResult, className = '' }: PremiumOCRProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processDocument = () => {
    if (!uploadedFile) return;
    
    // Simulate processing (in real implementation, this would call the API)
    const simulatedResult: OCRResult = {
      provider: selectedProvider,
      confidence: OCR_PROVIDERS.find(p => p.id === selectedProvider)?.confidence || 0,
      extractedData: {
        // This would be real extracted data
        applicantFirstName: 'SAMPLE',
        applicantLastName: 'DATA',
        applicantDateOfBirth: '01-01-1990'
      },
      recommendations: [
        'Document quality is excellent',
        'All required fields detected',
        'Ready for form population'
      ],
      processingTime: 2.3
    };
    
    onDocumentProcessed(simulatedResult);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-polish-emerald';
    if (confidence >= 80) return 'text-polish-gold';
    return 'text-polish-red';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Provider Selection */}
      <Card className="heritage-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-polish-gold" />
            AI-Powered Document Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose your preferred AI provider for optimal document processing results
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OCR_PROVIDERS.map(provider => (
              <div
                key={provider.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedProvider === provider.id
                    ? 'border-polish-gold bg-gradient-to-br from-polish-gold/10 to-polish-gold/5'
                    : 'border-gray-200 hover:border-polish-navy/30'
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                {provider.recommended && (
                  <Badge className="absolute -top-2 -right-2 bg-polish-emerald text-white">
                    Recommended
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${
                    selectedProvider === provider.id
                      ? 'bg-polish-gold text-polish-navy'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-xs text-gray-500">{provider.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className={`font-bold ${getConfidenceColor(provider.confidence)}`}>
                    {provider.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Upload Zone */}
      <Card className="heritage-card">
        <CardContent className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-polish-gold bg-gradient-to-br from-polish-gold/10 to-polish-gold/5'
                : 'border-gray-300 hover:border-polish-navy'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
            />

            {!uploadedFile ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-polish-gold to-polish-gold/70 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-polish-navy" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-polish-navy mb-2">
                    Upload Your Document
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your passport, ID, or document here, or click to browse
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={triggerFileInput}
                      className="royal-button"
                      disabled={isProcessing}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    
                    <Button
                      onClick={triggerFileInput}
                      variant="outline"
                      className="border-polish-navy text-polish-navy hover:bg-polish-navy hover:text-white"
                      disabled={isProcessing}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Supports: JPG, PNG, PDF • Max size: 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-polish-gold"
                    />
                  )}
                  
                  <div className="text-left">
                    <h4 className="font-semibold text-polish-navy">
                      {uploadedFile.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {uploadProgress < 100 ? (
                      <div className="mt-2">
                        <Progress value={uploadProgress} className="w-32" />
                        <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                      </div>
                    ) : (
                      <Badge className="mt-2 bg-polish-emerald text-white">
                        Upload Complete
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={processDocument}
                    disabled={isProcessing || uploadProgress < 100}
                    className="royal-button"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Analyze Document
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={clearUpload}
                    variant="outline"
                    disabled={isProcessing}
                    className="border-polish-red text-polish-red hover:bg-polish-red hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Results */}
      {ocrResult && (
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-polish-emerald" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={getConfidenceBadgeVariant(ocrResult.confidence)}>
                {ocrResult.provider} - {Math.round(ocrResult.confidence)}% confidence
              </Badge>
              
              <span className="text-sm text-gray-600">
                Processed in {ocrResult.processingTime}s
              </span>
            </div>

            {ocrResult.recommendations && ocrResult.recommendations.length > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <strong>AI Recommendations:</strong>
                    <ul className="list-disc list-inside text-sm">
                      {ocrResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              className="w-full royal-button"
              onClick={() => {
                // Auto-populate form with extracted data
                console.log('Auto-populating form with:', ocrResult.extractedData);
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Auto-Fill Form with Extracted Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PremiumOCR;