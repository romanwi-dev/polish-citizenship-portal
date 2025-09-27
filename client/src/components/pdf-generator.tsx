import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer,
  FileDown,
  ArrowRight,
  Info
} from "lucide-react";

interface PDFGenerationStatus {
  step: number;
  totalSteps: number;
  currentAction: string;
  progress: number;
}

interface PDFPreviewData {
  applicantSection: string;
  subjectSection: string;
  personalData: string;
  parentsData: string;
  grandparentsData: string;
}

export default function PDFGenerator({ applicationData }: { applicationData?: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<PDFGenerationStatus | null>(null);
  const [previewData, setPreviewData] = useState<PDFPreviewData | null>(null);
  const { toast } = useToast();

  // Fetch preview data
  const previewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/preview-citizenship-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (response: any) => {
      setPreviewData(response.preview);
    },
    onError: (error: any) => {
      console.error("Preview error:", error);
      toast({
        title: "Preview Failed",
        description: "Unable to generate form preview. Please check your data.",
        variant: "destructive",
      });
    }
  });

  // Generate filled PDF
  const generatePDFMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/generate-citizenship-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wniosek-obywatelstwo-polskie.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsGenerating(false);
      setGenerationStatus(null);
      
      toast({
        title: "PDF Generated Successfully!",
        description: "Your Polish citizenship application form has been downloaded and is ready for printing.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("PDF Generation error:", error);
      setIsGenerating(false);
      setGenerationStatus(null);
      
      toast({
        title: "PDF Generation Failed",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Download blank PDF template
  const downloadBlankPDF = async () => {
    try {
      const response = await fetch("/api/blank-citizenship-pdf");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blank-wniosek-obywatelstwo-polskie.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Blank Form Downloaded",
        description: "Blank Polish citizenship application form downloaded successfully.",
      });
    } catch (error) {
      console.error("Blank PDF download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download blank form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!applicationData) {
      toast({
        title: "No Data Available",
        description: "Please fill out the Polish citizenship application form first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus({
      step: 1,
      totalSteps: 4,
      currentAction: "Validating application data...",
      progress: 25
    });

    // Simulate progress steps
    setTimeout(() => {
      setGenerationStatus({
        step: 2,
        totalSteps: 4,
        currentAction: "Mapping data to official PDF form...",
        progress: 50
      });
    }, 1000);

    setTimeout(() => {
      setGenerationStatus({
        step: 3,
        totalSteps: 4,
        currentAction: "Generating PDF document...",
        progress: 75
      });
    }, 2000);

    setTimeout(() => {
      setGenerationStatus({
        step: 4,
        totalSteps: 4,
        currentAction: "Preparing download...",
        progress: 100
      });

      // Start actual PDF generation
      generatePDFMutation.mutate(applicationData);
    }, 3000);
  };

  const handlePreview = () => {
    if (!applicationData) {
      toast({
        title: "No Data Available",
        description: "Please fill out the Polish citizenship application form first.",
        variant: "destructive",
      });
      return;
    }
    
    previewMutation.mutate(applicationData);
  };

  const hasApplicationData = applicationData && Object.keys(applicationData).length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-blue" />
            PDF Form Generation
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate official Polish citizenship application forms ready for government submission
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Data Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            {hasApplicationData ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">Application Data Ready</div>
                  <div className="text-sm text-green-700">
                    Form data is available and ready for PDF generation
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Ready</Badge>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <div className="font-medium text-amber-800">No Application Data</div>
                  <div className="text-sm text-amber-700">
                    Please complete the Polish citizenship application form first
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
              </>
            )}
          </div>

          {/* Generation Progress */}
          {isGenerating && generationStatus && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="font-medium text-blue-900">Generating PDF...</div>
                </div>
                <Progress value={generationStatus.progress} className="h-2 mb-2" />
                <div className="text-sm text-blue-700">
                  Step {generationStatus.step} of {generationStatus.totalSteps}: {generationStatus.currentAction}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Data */}
          {previewData && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Form Data Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-green-800">Applicant: </span>
                    <span className="text-green-700">{previewData.applicantSection}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Subject: </span>
                    <span className="text-green-700">{previewData.subjectSection}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Personal Data: </span>
                    <span className="text-green-700">{previewData.personalData}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Parents: </span>
                    <span className="text-green-700">{previewData.parentsData}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Grandparents: </span>
                    <span className="text-green-700">{previewData.grandparentsData}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Button
                onClick={handlePreview}
                disabled={!hasApplicationData || previewMutation.isPending}
                variant="outline"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMutation.isPending ? "Loading Preview..." : "Preview Form Data"}
              </Button>
              
              <Button
                onClick={handleGeneratePDF}
                disabled={!hasApplicationData || isGenerating || generatePDFMutation.isPending}
                className="w-full bg-primary-blue hover:bg-primary-blue/90"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Filled PDF
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                onClick={downloadBlankPDF}
                variant="outline"
                className="w-full"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download Blank Form
              </Button>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 mb-1">Ready for Government Filing</div>
                    <div className="text-blue-700">
                      Generated PDFs are formatted for official Polish government submission
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="w-5 h-5 text-gray-600" />
                Filing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                <strong>After downloading your PDF:</strong>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Print the PDF on standard A4 paper (white, single-sided)</li>
                <li>Sign the form in the designated signature areas</li>
                <li>Include date of signing in DD.MM.YYYY format</li>
                <li>Attach all required supporting documents</li>
                <li>Submit to the appropriate Polish consulate or government office</li>
              </ol>
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>Ensure all information is accurate before printing - handwritten corrections may not be accepted</span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}