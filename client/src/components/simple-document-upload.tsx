import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleDocumentUploadProps {
  onDocumentsChange: (documents: string[]) => void;
  uploadedDocuments: string[];
}

export function SimpleDocumentUpload({ onDocumentsChange, uploadedDocuments }: SimpleDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const requiredDocuments = [
    "Passport Copy",
    "Birth Certificate", 
    "Marriage Certificate"
  ];

  const handleFileUpload = async (docType: string) => {
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      if (!uploadedDocuments.includes(docType)) {
        const newDocs = [...uploadedDocuments, docType];
        onDocumentsChange(newDocs);
        
        toast({
          title: "Document uploaded successfully",
          description: `${docType} has been processed and verified.`,
        });
      }
      setIsUploading(false);
    }, 1000);
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

  const isDocumentUploaded = (docType: string) => uploadedDocuments.includes(docType);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white shadow-xl border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Document Upload</h3>
          </div>

          <div className="space-y-4">
            {requiredDocuments.map((docType) => {
              const isUploaded = isDocumentUploaded(docType);
              
              return (
                <Card key={docType} className={`border ${isUploaded ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isUploaded ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-gray-400" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{docType}</h4>
                          <p className="text-sm text-gray-500">
                            {isUploaded ? "Document uploaded and verified" : "Required document - PDF, JPG, or PNG"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isUploaded ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(docType)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleFileUpload(docType)}
                            disabled={isUploading}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? "Uploading..." : "Upload"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {uploadedDocuments.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  {uploadedDocuments.length} of {requiredDocuments.length} documents uploaded
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                // Quick demo option
                const allDocs = requiredDocuments.filter(doc => !uploadedDocuments.includes(doc));
                if (allDocs.length > 0) {
                  onDocumentsChange([...uploadedDocuments, ...allDocs]);
                  toast({
                    title: "Demo documents added",
                    description: "All required documents have been added for demonstration.",
                  });
                }
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Quick Demo (Add All Documents)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}