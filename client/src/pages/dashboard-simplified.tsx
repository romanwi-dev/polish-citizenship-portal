import { useState } from "react";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronRight,
  FileSearch,
  FormInput,
  FileCheck,
  Send,
  ClipboardList,
  Users,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload } from "@/components/document-upload";
import ApplicantDetailsForm from "@/components/applicant-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Step status type
type StepStatus = 'pending' | 'active' | 'completed';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  status: StepStatus;
}

export default function SimplifiedDashboard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [generatedForms, setGeneratedForms] = useState<string[]>([]);
  
  // Workflow steps
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: "Upload Documents",
      description: "Upload your identity documents, birth certificates, and family records",
      icon: Upload,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: "Document Analysis",
      description: "AI analyzes and translates your documents automatically",
      icon: FileSearch,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: "Fill Application Forms",
      description: "Complete the citizenship application with auto-filled data",
      icon: FormInput,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: "Generate Legal Documents",
      description: "Create Power of Attorney and other required legal forms",
      icon: FileText,
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    },
    {
      id: 5,
      title: "Review & Submit",
      description: "Review all documents and submit your application",
      icon: Send,
      status: currentStep === 5 ? 'active' : currentStep > 5 ? 'completed' : 'pending'
    }
  ];
  
  const handleDocumentUpload = (files: FileList) => {
    const fileNames = Array.from(files).map(file => file.name);
    setUploadedDocuments(prev => [...prev, ...fileNames]);
    toast({
      title: "Documents uploaded successfully",
      description: `${files.length} document(s) have been uploaded.`
    });
  };
  
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      toast({
        title: "Moving to next step",
        description: steps[currentStep].title
      });
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const generatePDF = async (type: string) => {
    try {
      // Sample data for testing
      const sampleData = {
        poaType: type,
        principalFullName: "John Doe",
        principalBirthDate: "1990-01-15",
        principalBirthPlace: "New York, USA",
        principalAddress: "123 Main St, New York, NY 10001",
        principalPassportNumber: "US123456789",
        principalPhone: "+1 234 567 8900",
        principalEmail: "john.doe@example.com",
        scopeOfAuthority: [
          "Representation in citizenship proceedings",
          "Obtaining civil status documents",
          "Archive searches",
          "Document submission to authorities"
        ],
        signaturePlace: "New York",
        signatureDate: new Date().toISOString().split('T')[0]
      };
      
      const response = await fetch('/api/generate-poa-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData)
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `power-of-attorney-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setGeneratedForms(prev => [...prev, `Power of Attorney (${type})`]);
      
      toast({
        title: "PDF Generated Successfully",
        description: `Your Power of Attorney (${type}) has been downloaded.`
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Application Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Complete your Polish citizenship application in 5 simple steps
          </p>
        </div>
        
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-blue-600">
                {(currentStep - 1) * 20}% Complete
              </span>
            </div>
            <Progress value={(currentStep - 1) * 20} className="h-3" />
          </CardContent>
        </Card>
        
        {/* Workflow Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'active' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}
                  onClick={() => step.status !== 'pending' && setCurrentStep(step.id)}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                    ${step.status === 'completed' ? 'bg-green-100 border-2 border-green-600' :
                      step.status === 'active' ? 'bg-blue-100 border-2 border-blue-600 ring-4 ring-blue-200' :
                      'bg-gray-100 border-2 border-gray-300'}
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-center max-w-[120px]">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    absolute top-6 left-[60%] w-full h-0.5 
                    ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return StepIcon ? <StepIcon className="w-6 h-6" /> : null;
              })()}
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Step 1: Upload Documents */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-gray-600 mb-4">
                  Upload your documents to begin the application process. We'll analyze and translate them automatically.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-dashed border-2 hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => setShowUploadDialog(true)}>
                    <CardContent className="p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="font-semibold mb-2">Upload Documents</h3>
                      <p className="text-sm text-gray-600">
                        Click to upload birth certificates, passports, and other documents
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Uploaded Documents</h3>
                      {uploadedDocuments.length > 0 ? (
                        <ul className="space-y-2">
                          {uploadedDocuments.map((doc, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No documents uploaded yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Button 
                  onClick={handleNextStep}
                  disabled={uploadedDocuments.length === 0}
                  className="ml-auto"
                >
                  Continue to Analysis
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            
            {/* Step 2: Document Analysis */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-gray-600 mb-4">
                  Your documents are being analyzed and translated. This process extracts key information for your application.
                </p>
                
                <div className="space-y-4">
                  {uploadedDocuments.map((doc, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileSearch className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{doc}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                          Analyzed
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue to Forms
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Fill Application Forms */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-gray-600 mb-4">
                  Complete your application forms. Information from your documents has been auto-filled where possible.
                </p>
                
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">Personal Details</TabsTrigger>
                    <TabsTrigger value="family">Family Tree</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="mt-4">
                    <Card>
                      <CardContent className="p-6">
                        <Button 
                          onClick={() => {
                            setSelectedForm("personal");
                            setShowFormDialog(true);
                          }}
                          className="w-full"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Edit Personal Information
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="family" className="mt-4">
                    <Card>
                      <CardContent className="p-6">
                        <Button 
                          onClick={() => {
                            setSelectedForm("family");
                            setShowFormDialog(true);
                          }}
                          className="w-full"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Edit Family Tree
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="mt-4">
                    <Card>
                      <CardContent className="p-6">
                        <Button 
                          onClick={() => {
                            setSelectedForm("documents");
                            setShowFormDialog(true);
                          }}
                          className="w-full"
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Review Document Checklist
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>
                    Generate Legal Documents
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 4: Generate Legal Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <p className="text-gray-600 mb-4">
                  Generate your legal documents based on the information you've provided.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Power of Attorney - Single</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        For individual applicants
                      </p>
                      <Button 
                        onClick={() => generatePDF('single')}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Power of Attorney - Married</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        For married couples applying together
                      </p>
                      <Button 
                        onClick={() => generatePDF('married')}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Power of Attorney - Archives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        For archive document searches
                      </p>
                      <Button 
                        onClick={() => generatePDF('archives')}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Family Tree Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Genealogical tree visualization
                      </p>
                      <Button 
                        onClick={() => generatePDF('family-tree')}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {generatedForms.length > 0 && (
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Generated Documents:</h3>
                      <ul className="space-y-1">
                        {generatedForms.map((form, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {form}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={generatedForms.length === 0}
                  >
                    Review & Submit
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Application Ready</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    All required documents have been prepared and are ready for submission.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Application Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Documents Uploaded:</span>
                        <span className="font-medium">{uploadedDocuments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Forms Completed:</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Legal Documents Generated:</span>
                        <span className="font-medium">{generatedForms.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Back
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: "Application Submitted!",
                        description: "Your citizenship application has been submitted successfully."
                      });
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Help */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600">
                  Contact our support team at support@polishcitizenship.pl or call +48 123 456 789
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>
          <DocumentUpload userId="default-user" />
        </DialogContent>
      </Dialog>
      
      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedForm === 'personal' && 'Personal Information'}
              {selectedForm === 'family' && 'Family Tree'}
              {selectedForm === 'documents' && 'Document Checklist'}
            </DialogTitle>
          </DialogHeader>
          {selectedForm === 'personal' && <ApplicantDetailsForm />}
          {selectedForm === 'family' && <div className="p-4 text-center text-gray-500">Family Tree will be implemented later</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}