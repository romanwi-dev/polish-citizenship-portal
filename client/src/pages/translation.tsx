import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleImageUpload } from "../components/simple-image-upload";
import { ArrowLeft, Languages, Bot, Download, Copy, Eye, Star } from "lucide-react";
import { Link } from "wouter";
import TranslationQualityPreview, { TranslationQualityPreview as QualityPreviewType } from "@/components/TranslationQualityPreview";

export default function TranslationPage() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("auto");
  const [targetLanguage, setTargetLanguage] = useState<string>("english");
  const [qualityPreview, setQualityPreview] = useState<QualityPreviewType | null>(null);
  const [showQualityPreview, setShowQualityPreview] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setUploadedFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Process with OCR first, then translate
      await processImageWithOCR(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setInputText("");
    setTranslatedText("");
    setError(null);
    setQualityPreview(null);
    setShowQualityPreview(false);
  };

  const processImageWithOCR = async (file: File) => {
    setIsTranslating(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Call OCR API first
      const ocrResponse = await fetch('/api/documents/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          documentType: 'auto-detect'
        }),
      });

      if (!ocrResponse.ok) {
        throw new Error(`OCR processing failed: ${ocrResponse.statusText}`);
      }

      const ocrResult = await ocrResponse.json();
      const extractedText = ocrResult.extractedText || '';
      
      setInputText(extractedText);
      
      // Now translate the extracted text
      if (extractedText.trim()) {
        await translateText(extractedText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR processing failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const translateText = async (text?: string) => {
    const textToTranslate = text || inputText;
    if (!textToTranslate.trim()) return;

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translation/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          documentType: 'legal',
          preserveFormatting: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setTranslatedText(result.translation.translatedText || '');
      
      // Set quality preview if available
      if (result.translation.qualityPreview) {
        setQualityPreview(result.translation.qualityPreview);
        setShowQualityPreview(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Text copied to clipboard!');
  };

  const downloadTranslation = () => {
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <h1 className="text-xl font-semibold text-gray-900">Document Translation</h1>
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
                <Languages className="h-6 w-6 text-red-600" />
                AI-Powered Multi-Language Document Translation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Professional document translation powered by Claude AI with OCR support. Translate between 
                Polish, English, Portuguese, Spanish, French, German, Russian, and Hebrew. Upload document 
                images or paste text for instant, accurate translations with legal terminology expertise.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-6 bg-blue-50 rounded-xl mobile-card">
                  <Bot className="h-10 w-10 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-lg">OCR + Translation</h3>
                    <p className="text-blue-700">Extract text from images and translate</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-6 bg-green-50 rounded-xl mobile-card">
                  <Languages className="h-10 w-10 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">Legal Expertise</h3>
                    <p className="text-green-700">Specialized in citizenship documents</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Translation Interface */}
        <div className="max-w-6xl mx-auto">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-xl">Document Translation Interface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Document Image (Optional)</h3>
                <SimpleImageUpload
                  onFileSelect={handleFileSelect}
                  onClear={handleClear}
                  isProcessing={isTranslating}
                  previewUrl={previewUrl || undefined}
                  maxSizeMB={10}
                />
              </div>

              {/* Language Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Language
                  </label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="polish">Polish (Polski)</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="portuguese">Portuguese (Português)</SelectItem>
                      <SelectItem value="spanish">Spanish (Español)</SelectItem>
                      <SelectItem value="french">French (Français)</SelectItem>
                      <SelectItem value="german">German (Deutsch)</SelectItem>
                      <SelectItem value="russian">Russian (Русский)</SelectItem>
                      <SelectItem value="hebrew">Hebrew (עברית)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Language
                  </label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="polish">Polish (Polski)</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="portuguese">Portuguese (Português)</SelectItem>
                      <SelectItem value="spanish">Spanish (Español)</SelectItem>
                      <SelectItem value="french">French (Français)</SelectItem>
                      <SelectItem value="german">German (Deutsch)</SelectItem>
                      <SelectItem value="russian">Russian (Русский)</SelectItem>
                      <SelectItem value="hebrew">Hebrew (עברית)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Text Input/Output Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Text
                  </label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your text here or upload an image above..."
                    className="mobile-input min-h-[200px] resize-none"
                  />
                  <Button
                    onClick={() => translateText()}
                    disabled={!inputText.trim() || isTranslating || sourceLanguage === targetLanguage}
                    className="mt-4 mobile-button bg-red-600 hover:bg-red-700 text-white w-full"
                  >
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation
                  </label>
                  <Textarea
                    value={translatedText}
                    readOnly
                    placeholder="Translation will appear here..."
                    className="mobile-input min-h-[200px] resize-none bg-gray-50"
                  />
                  {translatedText && (
                    <div className="mt-4 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(translatedText)}
                          variant="outline"
                          className="mobile-button flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={downloadTranslation}
                          variant="outline"
                          className="mobile-button flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      {qualityPreview && (
                        <Button
                          onClick={() => setShowQualityPreview(!showQualityPreview)}
                          variant="secondary"
                          className="w-full mobile-button flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          {showQualityPreview ? 'Hide' : 'Show'} Quality Analysis
                          <div className="ml-2 flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">{qualityPreview.overallScore}/100</span>
                          </div>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-red-800">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Translation Quality Preview */}
              {showQualityPreview && qualityPreview && (
                <div className="mt-6">
                  <TranslationQualityPreview
                    qualityData={qualityPreview}
                    onGenerateReport={() => {
                      // Generate quality report PDF
                      const reportData = {
                        originalText: inputText,
                        translatedText: translatedText,
                        sourceLanguage: sourceLanguage,
                        targetLanguage: targetLanguage,
                        qualityAnalysis: qualityPreview,
                        timestamp: new Date().toISOString()
                      };
                      
                      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `translation-quality-report-${Date.now()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                    onRequestRevision={() => {
                      // Request improved translation
                      setIsTranslating(true);
                      setError(null);
                      
                      // Add feedback for improvement
                      const improvementPrompt = qualityPreview.recommendedActions.join('. ');
                      
                      fetch('/api/translation/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          text: inputText,
                          sourceLanguage: sourceLanguage,
                          targetLanguage: targetLanguage,
                          documentType: 'legal',
                          preserveFormatting: true,
                          improvementFeedback: improvementPrompt
                        })
                      })
                      .then(response => response.json())
                      .then(result => {
                        setTranslatedText(result.translation.translatedText || '');
                        if (result.translation.qualityPreview) {
                          setQualityPreview(result.translation.qualityPreview);
                        }
                      })
                      .catch(err => {
                        setError('Revision failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
                      })
                      .finally(() => {
                        setIsTranslating(false);
                      });
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}