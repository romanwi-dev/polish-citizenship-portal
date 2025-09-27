import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, PDFTextField, PDFForm } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Download, Edit, Save } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from '@/hooks/use-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  pdfName: string;
  onClose: () => void;
}

interface FormField {
  name: string;
  value: string;
  type: 'text' | 'date' | 'checkbox';
}

export function PDFViewer({ pdfUrl, pdfName, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const { toast } = useToast();

  const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    
    // Load PDF document to extract form fields
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      setPdfBytes(arrayBuffer);
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const extractedFields: FormField[] = fields.map(field => ({
        name: field.getName(),
        value: '',
        type: field.constructor.name.includes('TextField') ? 'text' : 
              field.constructor.name.includes('CheckBox') ? 'checkbox' : 'text'
      }));
      
      setFormFields(extractedFields);
      
      if (extractedFields.length > 0) {
        toast({
          title: "PDF Form Detected",
          description: `Found ${extractedFields.length} fillable fields in this document`,
          variant: "default"
        });
      } else {
        toast({
          title: "PDF Loaded Successfully",
          description: "Document is ready for viewing",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading PDF form:', error);
      toast({
        title: "PDF Loaded",
        description: "PDF opened in viewer mode",
        variant: "default"
      });
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormFields(prev => 
      prev.map(field => 
        field.name === fieldName ? { ...field, value } : field
      )
    );
  };

  const downloadFilledPDF = async () => {
    if (!pdfBytes) {
      toast({
        title: "Error",
        description: "PDF data not available for download",
        variant: "destructive"
      });
      return;
    }

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // Fill form fields with user input
      formFields.forEach(field => {
        if (field.value.trim()) {
          try {
            const pdfField = form.getField(field.name);
            if (field.type === 'text' || field.type === 'date') {
              (pdfField as PDFTextField).setText(field.value);
            }
          } catch (error) {
            console.error(`Error filling field ${field.name}:`, error);
          }
        }
      });

      // Generate filled PDF
      const filledPdfBytes = await pdfDoc.save();
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      
      // Download with descriptive filename
      const fileName = `${pdfName.replace('.pdf', '')}_filled_${new Date().toISOString().split('T')[0]}.pdf`;
      saveAs(blob, fileName);
      
      toast({
        title: "PDF Downloaded",
        description: `Filled PDF saved as ${fileName}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error filling PDF:', error);
      toast({
        title: "Download Error",
        description: "Failed to fill and download PDF. Downloading original instead.",
        variant: "destructive"
      });
      
      // Fallback: download original PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfName;
      link.click();
    }
  };

  const downloadOriginal = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfName;
    link.click();
    
    toast({
      title: "Original PDF Downloaded",
      description: `Downloaded ${pdfName}`,
      variant: "default"
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full h-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{pdfName}</h2>
            {formFields.length > 0 && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Fillable Form
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {formFields.length > 0 && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'View PDF' : 'Fill Form'}
              </Button>
            )}
            <Button
              onClick={downloadOriginal}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Original
            </Button>
            {formFields.length > 0 && (
              <Button
                onClick={downloadFilledPDF}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Download Filled
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 flex flex-col bg-gray-100 overflow-auto">
            <div className="flex items-center justify-center gap-4 p-4 bg-white border-b">
              <Button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-lg font-semibold">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error('PDF Load Error:', error);
                  toast({
                    title: "PDF Load Error",
                    description: "Failed to load the PDF document. Please try again.",
                    variant: "destructive"
                  });
                }}
                options={{
                  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                }}
                loading={
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <div className="text-xl text-gray-600">Loading PDF...</div>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-xl text-red-600 mb-4">Failed to load PDF</div>
                    <div className="text-sm text-gray-500">
                      PDF: {pdfName}<br/>
                      URL: {pdfUrl}
                    </div>
                    <Button
                      onClick={downloadOriginal}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Download Instead
                    </Button>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={1.0}
                  loading={
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-pulse text-gray-600">Loading page {pageNumber}...</div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center p-4">
                      <div className="text-red-600">Failed to load page {pageNumber}</div>
                    </div>
                  }
                />
              </Document>
            </div>
          </div>

          {/* Form Editor (when editing) */}
          {isEditing && formFields.length > 0 && (
            <div className="w-96 bg-white border-l border-gray-200 overflow-auto">
              <Card className="rounded-none border-0 h-full">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardTitle className="text-xl">Fill Form Fields</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formFields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        {field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      {field.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={field.value === 'true'}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked.toString())}
                          className="w-4 h-4 text-blue-600"
                        />
                      ) : (
                        <Input
                          type={field.type === 'date' ? 'date' : 'text'}
                          value={field.value}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          className="w-full"
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={downloadFilledPDF}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Filled PDF
                    </Button>
                    <p className="text-xs text-gray-600 text-center">
                      Fill the fields above and click to download your completed document
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}