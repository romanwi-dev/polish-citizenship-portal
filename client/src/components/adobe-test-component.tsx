import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Upload, FileText, Zap } from "lucide-react";

export function AdobeTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [testResult, setTestResult] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/adobe/test');
      const result = await response.json();
      
      setTestResult(result);
      setConnectionStatus(result.success ? 'success' : 'error');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setTestResult({ success: false, message: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      const response = await fetch('/api/adobe/process-polish-document', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ success: false, message: 'Upload failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      
      <CardContent className="p-6 space-y-6">
        {/* Connection Test Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Connection Test
          </h3>
          
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Test Adobe Connection
              </>
            )}
          </Button>

          {connectionStatus !== 'unknown' && (
            <Alert className={connectionStatus === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <div className="flex items-center gap-2">
                {connectionStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={connectionStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {testResult?.message || 'Unknown status'}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Document Upload Test Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Processing Test
          </h3>
          
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            
            <Button
              onClick={handleFileUpload}
              disabled={!uploadFile || isLoading}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>Process Document</>
              )}
            </Button>
          </div>

          {uploadResult && (
            <Alert className={uploadResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                {uploadResult.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-green-700">Document processed successfully!</p>
                    <div className="text-sm text-green-600">
                      <p><strong>Language:</strong> {uploadResult.data?.detectedLanguage}</p>
                      <p><strong>Document Type:</strong> {uploadResult.data?.documentType}</p>
                      <p><strong>Confidence:</strong> {Math.round((uploadResult.data?.confidence || 0) * 100)}%</p>
                      <p><strong>Form Fields Found:</strong> {uploadResult.data?.formFields?.length || 0}</p>
                    </div>
                    {uploadResult.data?.translatedText && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">View Translated Text</summary>
                        <p className="mt-2 p-2 bg-white rounded border text-sm">
                          {uploadResult.data.translatedText.substring(0, 200)}...
                        </p>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700">{uploadResult.message}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* PDF Templates Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Templates
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => window.open('/api/pdf/poa-married', '_blank')}
              className="flex items-center justify-center w-full py-8 px-8 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300 hover:bg-cyan-500/30 text-cyan-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
            >
              POA MARRIED
            </Button>
            
            <Button
              onClick={() => window.open('/api/pdf/poa-single', '_blank')}
              className="flex items-center justify-center w-full py-8 px-8 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300 hover:bg-cyan-500/30 text-cyan-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
            >
              POA SINGLE
            </Button>
            
            <Button
              onClick={() => window.open('/api/pdf/poa-minor', '_blank')}
              className="flex items-center justify-center w-full py-8 px-8 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300 hover:bg-cyan-500/30 text-cyan-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
            >
              POA MINOR
            </Button>
            
            <Button
              onClick={() => window.open('/api/pdf/citizenship-application', '_blank')}
              className="flex items-center justify-center w-full py-8 px-8 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300 hover:bg-cyan-500/30 text-cyan-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
            >
              CITIZENSHIP APP
            </Button>
            
            <Button
              onClick={() => window.open('/api/pdf/family-tree', '_blank')}
              className="flex items-center justify-center w-full py-8 px-8 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300 hover:bg-cyan-500/30 text-cyan-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
            >
              FAMILY TREE
            </Button>
            
            <Button
              onClick={() => window.open('/api/pdf/test-document', '_blank')}
              className="flex items-center justify-center w-full py-8 px-8 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300 hover:bg-cyan-500/30 text-cyan-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
            >
              TEST DOCUMENT
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available AI Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-cyan-600">AI-Powered OCR</h4>
              <p className="text-sm text-gray-600">Enhanced text extraction with AI analysis</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-cyan-600">Document Recognition</h4>
              <p className="text-sm text-gray-600">Automatic Polish document type detection</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-cyan-600">Form Field Extraction</h4>
              <p className="text-sm text-gray-600">Smart extraction of names, dates, and places</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-cyan-600">PDF Generation</h4>
              <p className="text-sm text-gray-600">Professional PDF creation with templates</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}