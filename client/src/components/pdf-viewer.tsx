import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Printer, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PDFViewerProps {
  title: string;
  endpoint: string;
  description?: string;
}

export function PDFViewer({ title, endpoint, description }: PDFViewerProps) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantData: {
            name: "John Smith",
            email: "john.smith@example.com",
            birthDate: "01.01.1990",
            birthPlace: "New York, USA",
            documentId: "US123456789",
            childName: "Emma Smith",
            spouseName: "Jane Smith"
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.replace(/\s+/g, '_')}.pdf`;
      link.click();
    }
  };

  const printPDF = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={generatePDF}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'View PDF'}
          </Button>
          
          {pdfUrl && (
            <div className="flex gap-2">
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={printPDF}
                variant="outline"
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>{title}</span>
              <div className="flex gap-2">
                <Button
                  onClick={downloadPDF}
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={printPDF}
                  size="sm"
                  variant="outline"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
                <Button
                  onClick={() => setShowPreview(false)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-full min-h-[600px]"
                title={title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}