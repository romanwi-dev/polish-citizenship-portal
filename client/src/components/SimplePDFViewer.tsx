import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimplePDFViewerProps {
  pdfUrl: string;
  pdfName: string;
  onClose: () => void;
  clientData?: any;
  familyTreeData?: any;
}

export function SimplePDFViewer({ pdfUrl, pdfName, onClose, clientData, familyTreeData }: SimplePDFViewerProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showFillableForm, setShowFillableForm] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobile = /android|blackberry|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
  }, [pdfUrl, pdfName]);

  // Mobile-optimized PDF viewing
  const openPDFInNewTab = () => {
    window.open(pdfUrl, '_blank');
    toast({
      title: "PDF Opened",
      description: `${pdfName} opened in new tab`,
      variant: "default"
    });
  };

  // Generate filled PDF with user data
  const generateFilledPDF = async () => {
    
    // Show loading toast
    toast({
      title: "Processing",
      description: "Creating your filled PDF...",
      variant: "default"
    });
    
    try {
      const payload = {
        templateName: pdfName,
        templateUrl: pdfUrl,
        applicantData: clientData || {},
        familyTreeData: familyTreeData || {}
      };
      
      console.log('Sending payload:', payload);
      
      const response = await fetch('/api/pdf/fill-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob size:', blob.size);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pdfName.replace(/\s+/g, '_')}_filled.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success!",
          description: `${pdfName} filled with your data and downloaded`,
          variant: "default"
        });
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('=== PDF FILL ERROR ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to generate filled PDF: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfName;
    link.click();
    
    toast({
      title: "PDF Downloaded",
      description: `Downloaded ${pdfName}`,
      variant: "default"
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">{pdfName}</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={downloadPDF}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-auto">
          <div className="flex-1 flex items-center justify-center p-4">
            {/* Debug info */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
              Mobile: {isMobile ? 'Yes' : 'No'} | URL: {pdfUrl ? 'Set' : 'None'}
            </div>
            
            {/* Mobile-optimized PDF viewer */}
            <div className="flex flex-col items-center justify-center p-8 max-w-md">
              <div className="text-2xl text-blue-600 mb-6 text-center font-bold">
                📄 {pdfName}
              </div>
              
              <div className="text-gray-600 text-center mb-8">
                {isMobile ? (
                  <>Mobile devices work best with native PDF viewing. Choose your preferred option below:</>
                ) : (
                  <>Choose how you'd like to view this PDF document:</>
                )}
              </div>
              
              <div className="space-y-4 w-full">
                {/* Fill PDF with Your Data - MAIN FEATURE */}
                <Button
                  onClick={generateFilledPDF}
                  className="w-full h-20 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-xl shadow-lg flex items-center justify-center gap-3 border-4 border-purple-300"
                >
                  <Save className="w-8 h-8" />
                  FILL WITH YOUR DATA & SAVE
                </Button>
                
                {/* Open in New Tab - View Template */}
                <Button
                  onClick={openPDFInNewTab}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-6 h-6" />
                  {isMobile ? 'VIEW BLANK TEMPLATE' : 'VIEW BLANK TEMPLATE'}
                </Button>
                
                {/* Download Blank Template */}
                <Button
                  onClick={downloadPDF}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3"
                >
                  <Download className="w-6 h-6" />
                  DOWNLOAD BLANK TEMPLATE
                </Button>
                
                {/* Mobile-specific embedded viewer */}
                {isMobile && (
                  <div className="mt-6 p-4 border-2 border-gray-300 rounded-xl bg-gray-50">
                    <div className="text-sm text-gray-600 mb-3 text-center">
                      Or view embedded (may be slower):
                    </div>
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="400"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title={pdfName}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}