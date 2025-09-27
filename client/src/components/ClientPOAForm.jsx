import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ArrowRight, ArrowLeft, FileText, Check, User, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientPOAForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    'POA-A-GN': '', // Given names
    'POA-A-SN': '', // Surname
    'POA-A-ID': '', // Passport/ID number
    'POA-A-DATE': '', // Date
    email: '',
    phone: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Helper functions as specified
  function UPPER(s) { 
    return (s || "").toUpperCase().trim(); 
  }
  
  function toPL(iso) { 
    const [y, m, d] = iso.split("-"); 
    return `${d}-${m}-${y}`; 
  }

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Enforce CAPS for name fields using UPPER helper
    if (field === 'POA-A-GN' || field === 'POA-A-SN') {
      processedValue = UPPER(value);
    }
    
    // Clean ID number
    if (field === 'POA-A-ID') {
      processedValue = value.trim();
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\//)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create payload as specified - convert date to Polish format
      const dateISO = formData['POA-A-DATE'];
      const payload = {
        "POA-A-GN": UPPER(formData['POA-A-GN']),
        "POA-A-SN": UPPER(formData['POA-A-SN']), 
        "POA-A-ID": (formData['POA-A-ID'] || "").trim(),
        "POA-A-DATE": dateISO ? toPL(dateISO) : ""
      };
      
      // Create FormData as specified
      const fd = new FormData();
      fd.append("json", JSON.stringify(payload));
      
      if (uploadedFile) {
        fd.append("idScan", uploadedFile);
      }

      const response = await fetch('/api/poa-adult', {
        method: 'POST',
        body: fd
      });

      const result = await response.json();

      if (response.ok && result.ok && result.pdfUrl) {
        toast({
          title: "POA Generated Successfully!",
          description: "Your Power of Attorney document has been generated.",
        });
        
        // Redirect to PDF URL as specified
        window.location.href = result.pdfUrl;
      } else {
        throw new Error(result.error || 'Failed to generate POA');
      }
    } catch (error) {
      console.error('Error submitting POA:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // BYPASS ALL VALIDATION - Always allow submission regardless of field completion
  const canProceedToStep2 = true; // All form validation bypassed
  const canSubmit = true; // Always allow submission regardless of conditions

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            Adult Power of Attorney
          </h1>
          <p className="text-xl text-gray-700">
            Generate your Polish citizenship Power of Attorney document
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Step 1: Identity Information'}
              {currentStep === 2 && 'Step 2: Document Upload (Optional)'}
              {currentStep === 3 && 'Step 3: Confirmation'}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {currentStep === 1 && 'Please provide your personal information'}
              {currentStep === 2 && 'Upload a photo of your passport or ID (optional)'}
              {currentStep === 3 && 'Review your information and submit'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Step 1: Identity Fields */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="givenNames" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Given Names *
                    </Label>
                    <Input
                      id="givenNames"
                      placeholder="Enter your given names"
                      value={formData['POA-A-GN']}
                      onChange={(e) => handleInputChange('POA-A-GN', e.target.value)}
                      data-testid="input-given-names"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="surname" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Surname *
                    </Label>
                    <Input
                      id="surname"
                      placeholder="Enter your surname"
                      value={formData['POA-A-SN']}
                      onChange={(e) => handleInputChange('POA-A-SN', e.target.value)}
                      data-testid="input-surname"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passportId" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Passport/ID Number *
                    </Label>
                    <Input
                      id="passportId"
                      placeholder="Enter passport or ID number"
                      value={formData['POA-A-ID']}
                      onChange={(e) => handleInputChange('POA-A-ID', e.target.value)}
                      data-testid="input-passport-id"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date * (YYYY-MM-DD)
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      value={formData['POA-A-DATE']}
                      onChange={(e) => handleInputChange('POA-A-DATE', e.target.value)}
                      data-testid="input-date"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      data-testid="input-email"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      data-testid="input-phone"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)} 
                    disabled={false}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-next-step-1"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: File Upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Upload Passport/ID Photo
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Optional: Upload a clear photo of your passport or ID document
                  </p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    data-testid="input-file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>

                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-semibold">File uploaded:</p>
                      <p className="text-green-600">{uploadedFile.name}</p>
                      <p className="text-sm text-green-500">
                        Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    data-testid="button-back-step-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-next-step-2"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Your Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Given Names:</Label>
                      <p className="text-gray-700">{formData['POA-A-GN']}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Surname:</Label>
                      <p className="text-gray-700">{formData['POA-A-SN']}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Passport/ID Number:</Label>
                      <p className="text-gray-700">{formData['POA-A-ID']}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Date:</Label>
                      <p className="text-gray-700">{formData['POA-A-DATE']}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Email:</Label>
                      <p className="text-gray-700">{formData.email}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Phone:</Label>
                      <p className="text-gray-700">{formData.phone}</p>
                    </div>
                  </div>

                  {uploadedFile && (
                    <div className="mt-4">
                      <Label className="font-semibold">Uploaded Document:</Label>
                      <p className="text-gray-700">{uploadedFile.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    data-testid="button-back-step-3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={false}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit & Generate POA
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}