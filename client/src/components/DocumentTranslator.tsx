import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, ArrowRightLeft, Copy, Download, Loader2, Upload, Camera, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SimpleImageUpload } from '@/components/SimpleImageUpload';

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  documentType?: string;
  legalTerms?: Array<{
    original: string;
    translation: string;
    explanation: string;
  }>;
  suggestions?: string[];
}

interface DocumentTranslatorProps {
  initialText?: string;
  onTranslationComplete?: (result: TranslationResult) => void;
}

export function DocumentTranslator({ initialText = '', onTranslationComplete }: DocumentTranslatorProps) {
  const [sourceText, setSourceText] = useState(initialText);
  const [targetLanguage, setTargetLanguage] = useState<'polish' | 'english'>('english');
  const [documentType, setDocumentType] = useState('general');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No text to translate",
        description: "Please enter some text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const response = await fetch('/api/translation/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: 'auto',
          targetLanguage,
          documentType,
          preserveFormatting: true
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      setTranslation(result.translation);
      
      if (onTranslationComplete) {
        onTranslationComplete(result.translation);
      }

      toast({
        title: "Translation completed",
        description: `Translated from ${result.translation.sourceLanguage} to ${targetLanguage}`,
      });

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (translation) {
      setSourceText(translation.translatedText);
      setTargetLanguage(translation.sourceLanguage as 'polish' | 'english');
      setTranslation(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadTranslation = () => {
    if (!translation) return;

    const content = `Original Text (${translation.sourceLanguage}):\n${translation.originalText}\n\nTranslation (${translation.targetLanguage}):\n${translation.translatedText}\n\nConfidence: ${(translation.confidence * 100).toFixed(1)}%\n\nDocument Type: ${translation.documentType}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = async () => {
    return {
      method: 'PUT' as const,
      url: await getUploadUrl()
    };
  };

  const getUploadUrl = async (): Promise<string> => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.uploadURL;
  };

  const handleImageUploadComplete = async (result: any) => {
    if (!result.successful || result.successful.length === 0) {
      toast({
        title: "Upload failed",
        description: "Image upload was not successful",
        variant: "destructive"
      });
      return;
    }

    const uploadedFile = result.successful[0];
    const imageUrl = uploadedFile.uploadURL;
    setUploadedImageUrl(imageUrl);
    setIsProcessingOCR(true);

    try {
      // Process the uploaded image with OCR
      const response = await fetch('/api/documents/process-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl,
          fileName: uploadedFile.name || 'uploaded-document.jpg'
        })
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const ocrResult = await response.json();
      
      // Poll for OCR completion with timeout
      let pollCount = 0;
      const maxPolls = 15; // 30 seconds max
      
      const pollForOCR = async () => {
        pollCount++;
        
        if (pollCount > maxPolls) {
          setIsProcessingOCR(false);
          toast({
            title: "OCR timeout",
            description: "Processing is taking longer than expected. Please try again.",
            variant: "destructive"
          });
          return;
        }

        const autoFillResponse = await fetch('/api/documents/auto-fill-data');
        const autoFillData = await autoFillResponse.json();
        
        if (autoFillData.success && autoFillData.data.length > 0) {
          const latestData = autoFillData.data[autoFillData.data.length - 1];
          
          // Extract text from the OCR data
          let extractedText = '';
          if (latestData.personalInfo) {
            const info = latestData.personalInfo;
            extractedText += `Name: ${info.firstName || ''} ${info.lastName || ''}\n`;
            extractedText += `Birth Date: ${info.birthDate || ''}\n`;
            extractedText += `Birth Place: ${info.birthPlace || ''}\n`;
            extractedText += `Nationality: ${info.nationality || ''}\n`;
          }
          if (latestData.parentInfo) {
            const parents = latestData.parentInfo;
            extractedText += `Father: ${parents.fatherName || ''} (${parents.fatherBirthPlace || ''})\n`;
            extractedText += `Mother: ${parents.motherName || ''} (${parents.motherBirthPlace || ''})\n`;
          }

          setSourceText(extractedText);
          setIsProcessingOCR(false);
          toast({
            title: "OCR completed",
            description: "Text extracted from image successfully",
          });
        } else {
          // Wait and try again
          setTimeout(pollForOCR, 2000);
        }
      };

      setTimeout(pollForOCR, 3000); // Start polling after 3 seconds
      
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "OCR failed",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive"
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            AI Legal Document Translator with OCR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Image OCR
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              {/* Controls for Text Input */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Language</label>
                  <Select value={targetLanguage} onValueChange={(value: 'polish' | 'english') => setTargetLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="polish">Polish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Text</SelectItem>
                      <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                      <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="legal_document">Legal Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSwapLanguages} 
                    variant="outline" 
                    size="sm"
                    disabled={!translation}
                    className="w-full"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Swap
                  </Button>
                </div>
              </div>

              {/* Source Text */}
              <div>
                <label className="text-sm font-medium mb-2 block">Text to Translate</label>
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter or paste your text here..."
                  className="min-h-32"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {sourceText.length} characters
                </div>
              </div>

              {/* Translate Button */}
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !sourceText.trim()}
                className="w-full"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    Translate to {targetLanguage === 'polish' ? 'Polish' : 'English'}
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              {/* Controls for Image Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Language</label>
                  <Select value={targetLanguage} onValueChange={(value: 'polish' | 'english') => setTargetLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="polish">Polish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Text</SelectItem>
                      <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                      <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="legal_document">Legal Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Upload Document Image</label>
                <SimpleImageUpload
                  onTextExtracted={setSourceText}
                  isProcessing={isProcessingOCR}
                  setIsProcessing={setIsProcessingOCR}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Supports JPG, PNG, TIFF. AI will extract text and translate automatically.
                </div>
              </div>

              {/* Processing Status */}
              {isProcessingOCR && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">Processing image with OCR...</span>
                  </div>
                </div>
              )}

              {/* OCR Result Text */}
              {sourceText && !isProcessingOCR && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Extracted Text (OCR Result)</label>
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Extracted text will appear here..."
                    className="min-h-32"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {sourceText.length} characters - You can edit the extracted text before translating
                  </div>
                </div>
              )}

              {/* Translate Button for OCR */}
              {sourceText && !isProcessingOCR && (
                <Button 
                  onClick={handleTranslate} 
                  disabled={isTranslating || !sourceText.trim()}
                  className="w-full"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="h-4 w-4 mr-2" />
                      Translate Extracted Text to {targetLanguage === 'polish' ? 'Polish' : 'English'}
                    </>
                  )}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Translation Results */}
      {translation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Translation Result</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {(translation.confidence * 100).toFixed(1)}% confidence
                </Badge>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(translation.translatedText)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTranslation}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Translated Text */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Translation ({translation.targetLanguage})
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="whitespace-pre-wrap">{translation.translatedText}</div>
              </div>
            </div>

            {/* Legal Terms */}
            {translation.legalTerms && translation.legalTerms.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Legal Terms Explained</h4>
                  <div className="space-y-2">
                    {translation.legalTerms.map((term, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-sm">
                          <span className="text-gray-600">{term.original}</span>
                          <span className="mx-2">→</span>
                          <span className="text-blue-700">{term.translation}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {term.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Suggestions */}
            {translation.suggestions && translation.suggestions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Translation Notes</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {translation.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}