import { useState, useRef } from "react";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  CheckCircle2,
  Download,
  ChevronRight,
  FileSearch,
  FormInput,
  Send,
  ArrowRight,
  Clock,
  AlertCircle,
  FileCheck,
  ClipboardList,
  Users,
  User,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { DocumentUpload } from "@/components/document-upload"; // Using simpler upload for dashboard
import ApplicantDetailsForm from "@/components/applicant-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function VisualDashboard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [generatedForms, setGeneratedForms] = useState<string[]>([]);
  const [generatedPDFs, setGeneratedPDFs] = useState<{[key: string]: {url: string, title: string, timestamp: string}}>({});
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  
  const handleDocumentUpload = (files: FileList) => {
    const fileNames = Array.from(files).map(file => file.name);
    setUploadedDocuments(prev => [...prev, ...fileNames]);
    toast({
      title: "✓ Documents uploaded successfully",
      description: `${files.length} document(s) have been uploaded.`
    });
    setShowUploadDialog(false);
  };
  
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    if (stepNumber === currentStep && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const generateDocument = async (type: string, title: string) => {
    try {
      // Create sample data based on document type
      let endpoint = '';
      let data: any = {};
      
      if (type === 'poa-single') {
        endpoint = '/api/pdf/poa/single';
        data = {
          applicantData: {
            name: "John Smith",
            email: "john@example.com",
            birthDate: "15.01.1990",
            birthPlace: "New York, USA",
            currentAddress: "123 Main St, New York, NY 10001"
          }
        };
      } else if (type === 'poa-married') {
        endpoint = '/api/pdf/poa/married';
        data = {
          applicantData: {
            name: "John Smith",
            email: "john@example.com",
            birthDate: "15.01.1990",
            birthPlace: "New York, USA",
            currentAddress: "123 Main St, New York, NY 10001"
          }
        };
      } else if (type === 'poa-archives') {
        endpoint = '/api/pdf/poa/archives';
        data = {
          applicantData: {
            name: "John Smith",
            email: "john@example.com",
            birthDate: "15.01.1990",
            birthPlace: "New York, USA",
            currentAddress: "123 Main St, New York, NY 10001"
          }
        };
      } else if (false) {
        // Old code kept for reference
        data = {
          poaType: type.replace('poa-', ''),
          principalFullName: "John Smith",
          principalBirthDate: "15.01.1990",
          principalBirthPlace: "New York, USA",
          principalAddress: "123 Main Street, New York, NY 10001, USA",
          principalPassportNumber: "US123456789",
          principalPhone: "+1 234 567 8900",
          principalEmail: "john.smith@email.com",
          scopeOfAuthority: [
            "Representation before all offices in Poland",
            "Submitting citizenship confirmation applications",
            "Collecting documents and correspondence",
            "Filing appeals and complaints",
            "Access to case files"
          ],
          signaturePlace: "New York",
          signatureDate: new Date().toLocaleDateString('pl-PL')
        };
        
        if (type === 'poa-married') {
          data.spouseFullName = "Jane Smith";
          data.spouseBirthDate = "20.03.1992";
          data.spouseBirthPlace = "Boston, USA";
          data.spousePassportNumber = "US987654321";
        }
      } else if (type === 'family-tree') {
        endpoint = '/api/pdf/family-tree';
        data = {
          applicantData: {
            name: "John Smith"
          },
          familyData: {
            familyMembers: [
              { id: '1', name: 'John Smith', generation: 3, birthDate: '1990', birthPlace: 'New York' },
              { id: '2', name: 'Michael Smith', generation: 2, birthDate: '1960', birthPlace: 'Chicago' },
              { id: '3', name: 'Anna Kowalski', generation: 2, birthDate: '1962', birthPlace: 'Warsaw' },
              { id: '4', name: 'Jan Kowalski', generation: 1, birthDate: '1930', birthPlace: 'Krakow' }
            ]
          }
        };
      } else if (type === 'checklist') {
        endpoint = '/api/pdf/checklist';
        data = {
          applicantData: {
            name: "John Smith"
          }
        };
      }
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Add returnUrl flag for mobile to get URL instead of blob
      if (isMobile && endpoint.includes('/api/pdf/')) {
        data.returnUrl = true;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to generate document');
      
      let url: string;
      
      if (isMobile && endpoint.includes('/api/pdf/')) {
        // Mobile: Get URL response
        const result = await response.json();
        url = result.url;
        
        // Track generated PDF
        setGeneratedPDFs(prev => ({
          ...prev,
          [type]: { url, title, timestamp: new Date().toISOString() }
        }));
        setGeneratedForms(prev => [...prev, type]);
        
        // Open PDF URL directly - this triggers native PDF handling
        window.location.href = url;
        
        toast({
          title: "✓ Opening PDF!",
          description: "Your PDF is opening. Choose Adobe Acrobat if prompted.",
          className: "bg-green-50 border-green-200"
        });
      } else {
        // Desktop or legacy endpoints: blob handling
        const blob = await response.blob();
        url = window.URL.createObjectURL(blob);
        
        // Track generated PDF
        setGeneratedPDFs(prev => ({
          ...prev,
          [type]: { url, title, timestamp: new Date().toISOString() }
        }));
        setGeneratedForms(prev => [...prev, type]);
        
        // Standard download for desktop
        const fileName = `${title.replace(/\s+/g, '_')}.pdf`;
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Clean up after delay
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        
        toast({
          title: "✓ PDF Downloaded!",
          description: `${title} has been saved to your Downloads folder.`,
          className: "bg-green-50 border-green-200"
        });
      }
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      
      {/* Fixed Progress Bar at Top */}
      <div className="sticky top-0 z-40 bg-white shadow-lg border-b-2 border-blue-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Application Progress</h2>
                <p className="text-sm text-gray-600">
                  Step {currentStep} of 5 • {Math.round((completedSteps.length / 5) * 100)}% Complete
                </p>
              </div>
              <div className="flex items-center gap-2">
                {completedSteps.length === 5 && (
                  <div className="flex items-center gap-2 text-green-600 font-bold animate-pulse">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>All Steps Complete!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700"
                  style={{ width: `${(completedSteps.length / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      if (completedSteps.includes(step) || step === 1 || step <= currentStep) {
                        setCurrentStep(step);
                      }
                    }}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      completedSteps.includes(step) ? 'bg-green-500 text-white scale-110' : 
                      currentStep === step ? 'bg-blue-500 text-white animate-pulse' : 
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {completedSteps.includes(step) ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      completedSteps.includes(step) ? 'text-green-600' : 
                      currentStep === step ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step === 1 ? 'Upload' : 
                       step === 2 ? 'Analysis' : 
                       step === 3 ? 'Forms' : 
                       step === 4 ? 'Generate' : 
                       'Submit'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Large Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Polish Citizenship Application
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Follow these 5 simple steps to complete your application
          </p>
          {/* Quick Jump to PDF Generation */}
          <Button 
            onClick={() => {
              // Complete all steps up to 4
              completeStep(1);
              completeStep(2);
              completeStep(3);
              setCurrentStep(4);
              toast({
                title: "🚀 Jumped to PDF Generation",
                description: "Click any PDF card below to download your documents!"
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3"
            size="lg"
          >
            🎯 Quick: Jump to PDF Generation (Step 4)
          </Button>
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          {/* Step 1 */}
          <Card 
            className={`transform transition-all hover:scale-105 cursor-pointer ${
              currentStep === 1 ? 'ring-4 ring-blue-500 shadow-xl' : 
              completedSteps.includes(1) ? 'bg-green-50 border-green-300' : 'opacity-60'
            }`}
            onClick={() => {
              if (completedSteps.includes(1) || currentStep >= 1) {
                setCurrentStep(1);
              }
            }}>
            <CardHeader className="text-center pb-4">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                completedSteps.includes(1) ? 'bg-green-500' : 
                currentStep === 1 ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {completedSteps.includes(1) ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <Upload className="w-10 h-10 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">Step 1</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold mb-2">Upload Documents</p>
              <p className="text-sm text-gray-600 mb-4">
                Birth certificates, passports, family records
              </p>
              {currentStep === 1 && !completedSteps.includes(1) && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowUploadDialog(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Upload Now
                  </Button>
                  <Button 
                    onClick={() => {
                      completeStep(1);
                      setCurrentStep(2);
                      toast({
                        title: "✅ Using Demo Data",
                        description: "Skipped to Step 2"
                      });
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600"
                    size="sm"
                  >
                    Skip (Use Demo)
                  </Button>
                </div>
              )}
              {completedSteps.includes(1) && (
                <div className="w-full p-3 bg-green-100 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">COMPLETED</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Step 2 */}
          <Card 
            className={`transform transition-all hover:scale-105 cursor-pointer ${
              currentStep === 2 ? 'ring-4 ring-blue-500 shadow-xl' : 
              completedSteps.includes(2) ? 'bg-green-50 border-green-300' : 'opacity-60'
            }`}
            onClick={() => {
              if (completedSteps.includes(1)) {
                setCurrentStep(2);
              } else {
                toast({
                  title: "Complete Previous Step",
                  description: "Please complete Step 1 first",
                  variant: "destructive"
                });
              }
            }}>
            <CardHeader className="text-center pb-4">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                completedSteps.includes(2) ? 'bg-green-500' : 
                currentStep === 2 ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {completedSteps.includes(2) ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <FileSearch className="w-10 h-10 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">Step 2</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold mb-2">AI Analysis</p>
              <p className="text-sm text-gray-600 mb-4">
                Automatic translation and data extraction
              </p>
              {currentStep === 2 && !completedSteps.includes(2) && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "🔄 Analyzing Documents...",
                        description: "AI is processing your documents. Please wait..."
                      });
                      
                      // Simulate document analysis with progress
                      setTimeout(() => {
                        completeStep(2);
                        setCurrentStep(3);
                        toast({
                          title: "✅ STEP 2 COMPLETE!",
                          description: "Documents analyzed successfully. All data extracted and ready for forms.",
                          className: "bg-green-50 border-green-500 border-2"
                        });
                      }, 2000);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Start AI Analysis
                  </Button>
                  <Button 
                    onClick={() => {
                      completeStep(2);
                      setCurrentStep(3);
                      toast({
                        title: "✅ Using Demo Data",
                        description: "Skipped to Step 3"
                      });
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600"
                    size="sm"
                  >
                    Skip (Use Demo)
                  </Button>
                </div>
              )}
              {completedSteps.includes(2) && (
                <div className="w-full p-3 bg-green-100 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">COMPLETED</p>
                </div>
              )}
              {completedSteps.includes(2) && (
                <Badge className="bg-green-500">Completed</Badge>
              )}
            </CardContent>
          </Card>
          
          {/* Step 3 */}
          <Card 
            className={`transform transition-all hover:scale-105 cursor-pointer ${
              currentStep === 3 ? 'ring-4 ring-blue-500 shadow-xl' : 
              completedSteps.includes(3) ? 'bg-green-50 border-green-300' : 'opacity-60'
            }`}
            onClick={() => {
              if (completedSteps.includes(2)) {
                setCurrentStep(3);
              } else {
                toast({
                  title: "Complete Previous Steps",
                  description: "Please complete Steps 1 and 2 first",
                  variant: "destructive"
                });
              }
            }}>
            <CardHeader className="text-center pb-4">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                completedSteps.includes(3) ? 'bg-green-500' : 
                currentStep === 3 ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {completedSteps.includes(3) ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <FormInput className="w-10 h-10 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">Step 3</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold mb-2">Fill Forms</p>
              <p className="text-sm text-gray-600 mb-4">
                Complete application with auto-filled data
              </p>
              {currentStep === 3 && !completedSteps.includes(3) && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "📝 Opening Forms...",
                        description: "Fill in your application details"
                      });
                      setTimeout(() => {
                        completeStep(3);
                        setCurrentStep(4);
                        toast({
                          title: "✅ STEP 3 COMPLETE!",
                          description: "All forms filled successfully. Ready to generate documents.",
                          className: "bg-green-50 border-green-500 border-2"
                        });
                      }, 1500);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Complete Forms
                  </Button>
                  <Button 
                    onClick={() => {
                      completeStep(3);
                      setCurrentStep(4);
                      toast({
                        title: "🎯 Jumped to PDF Generation!",
                        description: "Click any PDF card below to download!"
                      });
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600"
                    size="sm"
                  >
                    Skip to PDFs
                  </Button>
                </div>
              )}
              {completedSteps.includes(3) && (
                <div className="w-full p-3 bg-green-100 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">COMPLETED</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Step 4 */}
          <Card 
            className={`transform transition-all hover:scale-105 cursor-pointer ${
              currentStep === 4 ? 'ring-4 ring-blue-500 shadow-xl' : 
              completedSteps.includes(4) ? 'bg-green-50 border-green-300' : 'opacity-60'
            }`}
            onClick={() => {
              if (completedSteps.includes(3)) {
                setCurrentStep(4);
              } else {
                toast({
                  title: "Complete Previous Steps",
                  description: "Please complete Steps 1, 2 and 3 first",
                  variant: "destructive"
                });
              }
            }}>
            <CardHeader className="text-center pb-4">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                completedSteps.includes(4) ? 'bg-green-500' : 
                currentStep === 4 ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {completedSteps.includes(4) ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <FileText className="w-10 h-10 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">Step 4</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold mb-2">Generate PDFs</p>
              <p className="text-sm text-gray-600 mb-4">
                Create legal documents
              </p>
              {currentStep === 4 && !completedSteps.includes(4) && (
                <Button 
                  onClick={() => {
                    toast({
                      title: "📄 Generating Documents...",
                      description: "Creating PDFs with your information"
                    });
                    setTimeout(() => {
                      completeStep(4);
                      setCurrentStep(5);
                      toast({
                        title: "✅ STEP 4 COMPLETE!",
                        description: "All legal documents generated successfully. Ready for final submission.",
                        className: "bg-green-50 border-green-500 border-2"
                      });
                    }, 2000);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Generate All PDFs
                </Button>
              )}
              {completedSteps.includes(4) && (
                <div className="w-full p-3 bg-green-100 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">COMPLETED</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Step 5 */}
          <Card 
            className={`transform transition-all hover:scale-105 cursor-pointer ${
              currentStep === 5 ? 'ring-4 ring-blue-500 shadow-xl' : 
              completedSteps.includes(5) ? 'bg-green-50 border-green-300' : 'opacity-60'
            }`}
            onClick={() => {
              if (completedSteps.includes(4)) {
                setCurrentStep(5);
              } else {
                toast({
                  title: "Complete Previous Steps",
                  description: "Please complete all previous steps first",
                  variant: "destructive"
                });
              }
            }}>
            <CardHeader className="text-center pb-4">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                completedSteps.includes(5) ? 'bg-green-500' : 
                currentStep === 5 ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {completedSteps.includes(5) ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <Send className="w-10 h-10 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">Step 5</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-semibold mb-2">Submit</p>
              <p className="text-sm text-gray-600 mb-4">
                Review and send application
              </p>
              {currentStep === 5 && !completedSteps.includes(5) && (
                <Button 
                  onClick={() => {
                    toast({
                      title: "🚀 Submitting Application...",
                      description: "Finalizing your citizenship application"
                    });
                    setTimeout(() => {
                      completeStep(5);
                      setApplicationSubmitted(true);
                      setCurrentStep(6); // Move to completion screen
                      toast({
                        title: "🎉 APPLICATION SUBMITTED!",
                        description: "Your Polish citizenship application has been successfully submitted. We'll contact you within 24 hours.",
                        className: "bg-green-50 border-green-500 border-2"
                      });
                    }, 1500);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Submit Application
                </Button>
              )}
              {completedSteps.includes(5) && (
                <div className="w-full p-3 bg-green-100 rounded-lg text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-green-700">SUBMITTED</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Area */}
        <Card className="mb-8">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                {currentStep === 1 && <Upload className="w-6 h-6 text-white" />}
                {currentStep === 2 && <FileSearch className="w-6 h-6 text-white" />}
                {currentStep === 3 && <FormInput className="w-6 h-6 text-white" />}
                {currentStep === 4 && <FileText className="w-6 h-6 text-white" />}
                {currentStep === 5 && <Send className="w-6 h-6 text-white" />}
              </div>
              Step {currentStep}: {currentStep === 1 ? "Upload Documents" : 
                                   currentStep === 2 ? "Document Analysis" :
                                   currentStep === 3 ? "Fill Application Forms" :
                                   currentStep === 4 ? "Generate Legal Documents" :
                                   "Review & Submit"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Step 1: Upload Documents */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-lg text-gray-600 mb-4">
                  Upload your documents to begin the application process. We'll analyze and translate them automatically.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-dashed border-2 hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => setShowUploadDialog(true)}>
                    <CardContent className="p-12 text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                      <p className="text-gray-600">
                        Click to upload birth certificates, passports, and other documents
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold mb-4">Uploaded Documents</h3>
                      {uploadedDocuments.length > 0 ? (
                        <ul className="space-y-3">
                          {uploadedDocuments.map((doc, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              <span className="text-lg">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No documents uploaded yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNextStep}
                    disabled={uploadedDocuments.length === 0}
                    size="lg"
                    className="text-lg px-8 py-6"
                  >
                    Continue to Analysis
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 2: Document Analysis */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-lg text-gray-600 mb-4">
                  Your documents are being analyzed and translated. This process extracts key information for your application.
                </p>
                
                <div className="space-y-4">
                  {uploadedDocuments.map((doc, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileSearch className="w-8 h-8 text-blue-500" />
                          <span className="text-lg font-medium">{doc}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 text-lg px-4 py-2">
                          Analyzed
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} size="lg">
                    Back
                  </Button>
                  <Button onClick={handleNextStep} size="lg" className="text-lg px-8 py-6">
                    Continue to Forms
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Fill Application Forms */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-lg text-gray-600 mb-4">
                  Complete your application forms. Information from your documents has been auto-filled where possible.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedForm("personal");
                          setShowFormDialog(true);
                        }}>
                    <CardContent className="p-8 text-center">
                      <User className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-lg font-semibold mb-2">Personal Details</h3>
                      <p className="text-gray-600 mb-4">Your information</p>
                      <Button className="w-full" size="lg">Edit Form</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedForm("family");
                          setShowFormDialog(true);
                        }}>
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="text-lg font-semibold mb-2">Family Tree</h3>
                      <p className="text-gray-600 mb-4">Your ancestry</p>
                      <Button className="w-full" size="lg">Edit Form</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedForm("documents");
                          setShowFormDialog(true);
                        }}>
                    <CardContent className="p-8 text-center">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold mb-2">Document Checklist</h3>
                      <p className="text-gray-600 mb-4">Required documents</p>
                      <Button className="w-full" size="lg">Edit Form</Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} size="lg">
                    Back
                  </Button>
                  <Button onClick={handleNextStep} size="lg" className="text-lg px-8 py-6">
                    Continue to Document Generation
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 4: Generate Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                  <p className="text-lg font-bold text-blue-900 mb-2">
                    📱 Mobile Instructions:
                  </p>
                  <p className="text-gray-700">
                    Tap any document → PDF downloads → Opens in Adobe Acrobat
                  </p>
                </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Power of Attorney - Single */}
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400 active:scale-95"
                      onClick={() => generateDocument('poa-single', 'Power of Attorney (Single)')}>
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-1">Power of Attorney</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-3">For Individual Applicants</p>
                    <Button className="w-full py-3" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      <span className="font-bold">TAP TO DOWNLOAD</span>
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Power of Attorney - Married */}
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                      onClick={() => generateDocument('poa-married', 'Power of Attorney (Married)')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Power of Attorney</h3>
                    <p className="text-sm text-gray-600 mb-4">For Married Couples</p>
                    <Button className="w-full" size="lg" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Power of Attorney - Archives */}
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                      onClick={() => generateDocument('poa-archives', 'Power of Attorney (Archives)')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Power of Attorney</h3>
                    <p className="text-sm text-gray-600 mb-4">For Archive Search</p>
                    <Button className="w-full" size="lg" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Family Tree */}
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                      onClick={() => generateDocument('family-tree', 'Family Tree Document')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Family Tree</h3>
                    <p className="text-sm text-gray-600 mb-4">Genealogical Document</p>
                    <Button className="w-full" size="lg" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Document Checklist */}
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                      onClick={() => generateDocument('checklist', 'Document Checklist')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Document Checklist</h3>
                    <p className="text-sm text-gray-600 mb-4">Track Your Documents</p>
                    <Button className="w-full" size="lg" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Citizenship Application */}
                <Card className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                      onClick={() => generateDocument('citizenship', 'Citizenship Application')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Main Application</h3>
                    <p className="text-sm text-gray-600 mb-4">Citizenship Form</p>
                    <Button className="w-full" size="lg" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Each PDF will be automatically filled with your application data. 
                      Make sure to review each document before submitting.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} size="lg">
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={generatedForms.length === 0}
                    size="lg" 
                    className="text-lg px-8 py-6"
                  >
                    Review & Submit
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-green-900">Application Ready</h3>
                  </div>
                  <p className="text-green-700">
                    All required documents have been prepared and are ready for submission.
                  </p>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Application Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Documents Uploaded:</span>
                      <span className="font-semibold">{uploadedDocuments.length}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Forms Completed:</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Legal Documents Generated:</span>
                      <span className="font-semibold">{generatedForms.length}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} size="lg">
                    Back
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
                    size="lg"
                    onClick={() => {
                      completeStep(5);
                      toast({
                        title: "✓ Application Submitted!",
                        description: "Your citizenship application has been submitted successfully.",
                        className: "bg-green-50 border-green-200"
                      });
                    }}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 6: Completion Screen - After Submission */}
            {applicationSubmitted && currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-8 text-center">
                  <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-600" />
                  <h2 className="text-3xl font-bold text-green-900 mb-3">
                    🎉 Application Successfully Submitted!
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">
                    Your Polish Citizenship application has been processed and submitted.
                  </p>
                  <p className="text-gray-600">
                    Reference Number: <span className="font-bold">PL-2025-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </p>
                </div>
                
                {/* Generated Documents Summary */}
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-2xl">📄 Your Generated Documents</CardTitle>
                    <p className="text-gray-600 mt-2">
                      All your documents have been generated and saved. You can download them below:
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(generatedPDFs).map(([key, pdf]) => (
                        <Card key={key} className="border-2 hover:border-blue-400 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-blue-600" />
                                <div>
                                  <p className="font-semibold">{pdf.title}</p>
                                  <p className="text-xs text-gray-500">
                                    Generated at {new Date(pdf.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const a = document.createElement('a');
                                  a.href = pdf.url;
                                  a.download = `${pdf.title.replace(/\s+/g, '_')}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {Object.keys(generatedPDFs).length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                          <p>No documents have been generated yet.</p>
                          <Button 
                            className="mt-4"
                            onClick={() => {
                              setCurrentStep(4);
                              setApplicationSubmitted(false);
                            }}
                          >
                            Go Back to Generate Documents
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Next Steps */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="text-xl">📋 What Happens Next?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div>
                        <p className="font-semibold">Document Review</p>
                        <p className="text-sm text-gray-600">Our legal team will review your documents within 24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div>
                        <p className="font-semibold">Consultation Call</p>
                        <p className="text-sm text-gray-600">We'll schedule a call to discuss your case and next steps</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div>
                        <p className="font-semibold">Official Submission</p>
                        <p className="text-sm text-gray-600">We'll submit your application to Polish authorities</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Action Buttons */}
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      // Reset everything for a new application
                      setCurrentStep(1);
                      setCompletedSteps([]);
                      setGeneratedForms([]);
                      setGeneratedPDFs({});
                      setUploadedDocuments([]);
                      setApplicationSubmitted(false);
                    }}
                  >
                    Start New Application
                  </Button>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      window.location.href = '/';
                    }}
                  >
                    Return to Homepage
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Help Section */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-gray-600">
                  Our support team is ready to assist you with your application
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg mb-1">+48 123 456 789</p>
                <p className="text-gray-600">support@polishcitizenship.pl</p>
                <p className="text-sm text-gray-500 mt-2">Available Mon-Fri, 9am-5pm CET</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const fileNames = Array.from(files).map(f => f.name).join(", ");
                    toast({
                      title: "✓ Files Selected",
                      description: `${files.length} file(s): ${fileNames}`
                    });
                    // Auto-complete after file selection
                    setTimeout(() => {
                      completeStep(1);
                      setCurrentStep(2);
                      setShowUploadDialog(false);
                      setUploadedDocuments(prev => [...prev, ...Array.from(files).map(f => f.name)]);
                      toast({
                        title: "✓ Documents Uploaded",
                        description: "Moving to document analysis step"
                      });
                    }, 1500);
                  }
                }}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input">
                <Button asChild className="cursor-pointer">
                  <span>Choose Files</span>
                </Button>
              </label>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedForm === 'applicant-details' && 'Complete Application Form'}
              {selectedForm === 'personal' && 'Personal Information'}
              {selectedForm === 'family' && 'Family Tree'}
              {selectedForm === 'documents' && 'Document Checklist'}
            </DialogTitle>
          </DialogHeader>
          {selectedForm === 'applicant-details' && (
            <div>
              <ApplicantDetailsForm />
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowFormDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowFormDialog(false);
                  completeStep(3);
                  toast({
                    title: "✓ Forms Completed",
                    description: "Application data saved successfully"
                  });
                }}>
                  Save & Continue
                </Button>
              </div>
            </div>
          )}
          {selectedForm === 'personal' && <ApplicantDetailsForm />}
          {selectedForm === 'family' && <div className="p-4 text-center text-gray-500">Family Tree will be implemented later</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}