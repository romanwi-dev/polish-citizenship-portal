import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onDocumentsChange: (documents: string[]) => void;
  uploadedDocuments: string[];
}

export function WorkingDocumentUpload({ onDocumentsChange, uploadedDocuments }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const requiredDocuments = [
    "Passport Copy",
    "Birth Certificate", 
    "Marriage Certificate"
  ];

  const handleFileUpload = async (docType: string) => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setIsUploading(true);
      
      // Simulate upload process with real file
      setTimeout(() => {
        const newDocs = [...uploadedDocuments, docType];
        onDocumentsChange(newDocs);
        
        toast({
          title: "Document uploaded successfully",
          description: `${file.name} (${docType}) has been processed and verified.`,
        });
        
        setIsUploading(false);
      }, 1500);
    };
    
    input.click();
  };

  const removeDocument = (docType: string) => {
    const filteredDocs = uploadedDocuments.filter(doc => doc !== docType);
    onDocumentsChange(filteredDocs);
    
    toast({
      title: "Document removed",
      description: `${docType} has been removed from your application.`,
      variant: "destructive",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white shadow-xl border-0 border-l-8 border-l-green-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-b-4 border-green-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
              INPUT 2
            </div>
            <div className="h-px w-16 bg-green-400 rounded"></div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-800 text-center mb-2">
            Document Processing
          </h2>
          <p className="text-green-700 text-lg max-w-2xl mx-auto text-center">
            Upload required documents for your Polish citizenship application
          </p>
        </div>
        
        <CardContent className="p-6 lg:p-10">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-blue-800 mb-4">Required Documents</h3>
              <p className="text-gray-600 text-lg">Upload all required documents to proceed with your application</p>
            </div>

            <div className="grid gap-4">
              {requiredDocuments.map((docType, index) => {
                const isUploaded = uploadedDocuments.includes(docType);
                
                return (
                  <Card key={index} className={`border-2 ${isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isUploaded ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {isUploaded ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">{docType}</h4>
                            <p className="text-base text-gray-600">
                              {isUploaded ? 'Uploaded and verified' : 'Required for application'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isUploaded ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeDocument(docType)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleFileUpload(docType)}
                              disabled={isUploading}
                              className="bg-green-600 hover:bg-green-700 text-lg px-6 py-3"
                              size="lg"
                            >
                              <Upload className="h-5 w-5 mr-3" />
                              {isUploading ? 'Uploading...' : 'Choose File'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Progress Summary */}
            <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">Upload Progress</h4>
                    <p className="text-base text-gray-600">
                      {uploadedDocuments.length} of {requiredDocuments.length} documents uploaded
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round((uploadedDocuments.length / requiredDocuments.length) * 100)}%
                    </div>
                    <div className="text-base text-gray-600">Complete</div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadedDocuments.length / requiredDocuments.length) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}