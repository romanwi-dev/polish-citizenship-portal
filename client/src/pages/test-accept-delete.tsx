import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Trash2, Eye, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestDocument {
  id: string;
  filename: string;
  status: 'pending-review' | 'completed';
  polishTranslation: string;
  originalText: string;
}

export default function TestAcceptDeletePage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<TestDocument[]>([
    {
      id: 'test-1',
      filename: 'birth-certificate.pdf',
      status: 'pending-review',
      polishTranslation: 'Imię: Jan KOWALSKI\nData urodzenia: 15.01.1990\nMiejsce urodzenia: Warszawa, Polska',
      originalText: 'Name: Jan KOWALSKI\nBirth Date: 15.01.1990\nBirth Place: Warsaw, Poland'
    }
  ]);

  const acceptDocument = (docId: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'completed' as const } 
          : doc
      )
    );
    
    toast({
      title: "Document Accepted!",
      description: "Document data has been accepted and will be used to populate your forms.",
    });
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
    
    toast({
      title: "Document Deleted",
      description: "Document has been removed. You can upload a new one if needed.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
            <FileCheck className="h-8 w-8" />
            TEST: Accept/Delete Functionality
          </CardTitle>
          <p className="text-gray-600 mt-2">
            This page demonstrates the accept/delete functionality working properly.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {documents.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              <p>All documents have been processed. Refresh page to see test document again.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Reload Test
              </Button>
            </div>
          )}

          {documents.map((document) => (
            <div key={document.id} className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Eye className="h-4 w-4 text-amber-600" />
                </div>
                
                <div className="flex-grow space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{document.filename}</p>
                      <p className="text-sm text-gray-600">Birth Certificate</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      {document.status === 'pending-review' ? 'Review Required' : 'Completed'}
                    </span>
                  </div>
                  
                  {/* Pending Review - Show accept/delete options */}
                  {document.status === 'pending-review' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-800 mb-3">
                          Document processed successfully! Please review the extracted data and choose an action:
                        </p>
                        
                        {/* Show extracted data */}
                        <details className="group mb-3">
                          <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View extracted data (Polish)
                          </summary>
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-line">
                            {document.polishTranslation}
                          </div>
                        </details>
                        
                        <details className="group mb-3">
                          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View original data (English)
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-line">
                            {document.originalText}
                          </div>
                        </details>
                        
                        {/* Accept/Delete buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => acceptDocument(document.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept & Use Data
                          </Button>
                          <Button
                            onClick={() => deleteDocument(document.id)}
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete & Retry
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed documents */}
                  {document.status === 'completed' && (
                    <div className="space-y-2">
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                        ✓ Document accepted and data extracted successfully
                      </div>
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View extracted data (Polish)
                        </summary>
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-line">
                          {document.polishTranslation}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}