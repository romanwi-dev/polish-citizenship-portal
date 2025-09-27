import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PassportStampCollection } from "@/components/passport-stamp-collection";
import { PerformanceWrapper } from "@/components/performance-wrapper";
import { MapPin } from "lucide-react";

interface OCRProcessingSectionProps {
  isOcrProcessing: boolean;
  ocrFileName: string;
  ocrFileType: string;
  ocrStartTime: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearForm: () => void;
}

const ProcessingModal: React.FC<{
  fileName: string;
  fileType: string;
  startTime: number;
}> = React.memo(({ fileName, fileType, startTime }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    style={{ 
      zIndex: 999999,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}
  >
    <div 
      className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4"
      style={{
        position: 'relative',
        marginTop: '0',
        marginBottom: '0',
        maxHeight: '90vh',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-blue-600 mb-2">
          🔍 Processing Passport
        </h2>
        <p className="text-gray-600 text-sm">
          Extracting passport data using AI technology
        </p>
      </div>
    
      <div className="text-center space-y-4">
        {/* Animated spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        
        {/* File info */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-800">
            📄 {fileType.toUpperCase()} File
          </p>
          <p className="text-sm text-gray-600 break-all">
            {fileName}
          </p>
        </div>
        
        {/* Processing status */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">
            ⚡ Extracting passport data...
          </p>
          <p className="text-blue-600 text-sm mt-1">
            {fileType === 'PDF' ? 'This may take 15-30 seconds' : 'This may take 3-5 seconds'}
          </p>
          <p className="text-blue-500 text-xs mt-2">
            Using OpenAI Vision API for accurate data extraction
          </p>
        </div>
        
        {/* Timer */}
        <p className="text-gray-500 text-sm">
          ⏱️ Processing for {startTime > 0 ? Math.round((Date.now() - startTime) / 1000) : 0}s
        </p>
        
        {/* Warning */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Please wait - do not close this window
          </p>
        </div>
      </div>
    </div>
  </div>
));

export const OCRProcessingSection: React.FC<OCRProcessingSectionProps> = React.memo(({
  isOcrProcessing,
  ocrFileName,
  ocrFileType,
  ocrStartTime,
  onFileUpload,
  onClearForm
}) => {
  return (
    <>
      <Card className="glass-card-warning border-orange-200 shadow-lg">
        <CardHeader className="glass-header-warning pb-6">
          <CardTitle className="text-2xl font-bold text-orange-700 text-center flex items-center justify-center gap-3">
            <span className="text-3xl">📱</span>
            <span>OCR Document Processing</span>
          </CardTitle>
          <p className="text-orange-600 text-center mt-2 text-lg">
            Upload your passport for automatic data extraction
          </p>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="glass-section-warning p-4 lg:p-6 rounded-xl">
            <PerformanceWrapper fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-xl"></div>}>
              <div className="space-y-6">
                {/* Upload Section */}
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      📄 Upload Your Valid Passport Copy
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Supported formats: PDF, JPG, PNG, HEIC (max 10MB)
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.heic"
                      onChange={onFileUpload}
                      className="hidden"
                      id="passport-upload"
                      style={{ fontSize: '16px' }}
                    />
                    <label
                      htmlFor="passport-upload"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-colors duration-200 text-lg"
                    >
                      📤 Choose Passport File
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={onClearForm}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 text-lg"
                    >
                      🗑️ Clear All Forms
                    </Button>
                  </div>
                </div>

                {/* Passport Stamp Collection */}
                <div className="mt-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-700">Travel History</h3>
                  </div>
                  <PassportStampCollection />
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Upload Instructions:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Take a clear photo of your passport ID page</li>
                    <li>• Ensure all text is readable and well-lit</li>
                    <li>• PDF scans work best for accuracy</li>
                    <li>• Processing takes 5-30 seconds depending on file type</li>
                  </ul>
                </div>
              </div>
            </PerformanceWrapper>
          </div>
        </CardContent>
      </Card>

      {/* Processing Modal */}
      {isOcrProcessing && (
        <PerformanceWrapper>
          <ProcessingModal
            fileName={ocrFileName}
            fileType={ocrFileType}
            startTime={ocrStartTime}
          />
        </PerformanceWrapper>
      )}
    </>
  );
});