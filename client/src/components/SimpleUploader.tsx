import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SimpleUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload JPG, PNG, HEIC, or PDF files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      // Get upload URL
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL');
      }

      setUploadProgress(25);

      // Upload to cloud storage
      const uploadResponse = await fetch(data.uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadProgress(75);

      // Start document processing
      const processResponse = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl: data.uploadURL }),
      });

      if (processResponse.ok) {
        setUploadProgress(100);
        setUploadSuccess(true);
        toast({
          title: "Upload Successful!",
          description: "Your document is being processed by AI. This may take a few moments.",
        });
      } else {
        throw new Error('Processing failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.heic,.pdf"
          style={{ display: 'none' }}
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-14 text-lg upload-document-btn"
        >
          <div className="flex items-center gap-3">
            {uploadSuccess ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : isUploading ? (
              <Upload className="h-6 w-6 animate-pulse" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {uploadSuccess ? "Upload Complete!" : isUploading ? "Uploading..." : "Upload Birth Certificate"}
              </div>
              <div className="text-sm text-gray-500">
                {isUploading ? "AI processing will start automatically" : "JPG, PNG, HEIC, PDF files supported"}
              </div>
            </div>
          </div>
        </Button>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <div className="text-sm text-center text-gray-600">
              {uploadProgress < 25 && "Getting upload URL..."}
              {uploadProgress >= 25 && uploadProgress < 75 && "Uploading to cloud storage..."}
              {uploadProgress >= 75 && uploadProgress < 100 && "Starting AI processing..."}
              {uploadProgress >= 100 && "Processing complete!"}
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Document uploaded successfully!</div>
                <div className="text-sm text-green-700">
                  AI processing has started. Check back in a few minutes to see extracted data.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <div className="font-medium mb-1">Supported Documents:</div>
          <ul className="space-y-1">
            <li>• Birth certificates (yours and parents')</li>
            <li>• Marriage certificates</li>
            <li>• Passport pages</li>
            <li>• Polish documents or certificates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}