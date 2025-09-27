import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Users, Upload, CheckCircle, ArrowRight, ArrowLeft, 
  Calendar, MapPin, Phone, Mail, FileText, Plus, Trash2,
  UserPlus, Home, Globe, Save, Send
} from 'lucide-react';



export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    currentAddress: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    maritalStatus: '',
    occupation: '',
    hasPolishDocuments: '',
    additionalInfo: ''
  });

  // Family Tree State
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, relation: 'parent', name: '', birthYear: '', birthPlace: '', hasDocuments: false },
    { id: 2, relation: 'grandparent', name: '', birthYear: '', birthPlace: '', hasDocuments: false }
  ]);

  // Documents State
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const steps = [
    { number: 1, title: "Client Details", icon: User },
    { number: 2, title: "Family Tree", icon: Users },
    { number: 3, title: "Document Upload", icon: Upload },
    { number: 4, title: "Review & Submit", icon: CheckCircle }
  ];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveProgress = () => {
    toast({
      title: "Progress Saved",
      description: "Your information has been saved. You can continue later."
    });
  };

  const handleSubmitApplication = () => {
    toast({
      title: "Application Submitted Successfully!",
      description: "Our team will review your information and contact you within 24-48 hours."
    });
    setTimeout(() => setLocation('/dashboard'), 2000);
  };

  const addFamilyMember = () => {
    const newMember = {
      id: familyMembers.length + 1,
      relation: '',
      name: '',
      birthYear: '',
      birthPlace: '',
      hasDocuments: false
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const removeFamilyMember = (id: number) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedDocuments([...uploadedDocuments, ...fileNames]);
      toast({
        title: "Documents Uploaded",
        description: `${fileNames.length} document(s) uploaded successfully.`
      });
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Complete Your Application Setup
            </h1>
            <p className="text-gray-600">
              Follow these steps to begin your Polish citizenship journey
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progressPercentage} className="h-2 mb-4" />
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center cursor-pointer ${
                    currentStep === step.number ? 'text-blue-600' : 
                    completedSteps.includes(step.number) ? 'text-green-600' : 'text-gray-400'
                  }`}
                  onClick={() => setCurrentStep(step.number)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep === step.number ? 'bg-blue-600 text-white' : 
                    completedSteps.includes(step.number) ? 'bg-green-600 text-white' : 'bg-gray-200'
                  }`}>
                    {completedSteps.includes(step.number) ? 
                      <CheckCircle className="w-5 h-5" /> : 
                      <step.icon className="w-5 h-5" />
                    }
                  </div>
                  <span className="text-xs md:text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[currentStep - 1].icon;
                  return <StepIcon className="w-6 h-6" />;
                })()}
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-blue-100">
                {currentStep === 1 && "Tell us about yourself"}
                {currentStep === 2 && "Add your Polish family connections"}
                {currentStep === 3 && "Upload your initial documents"}
                {currentStep === 4 && "Review and submit your application"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Step 1: Client Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={clientDetails.firstName}
                        onChange={(e) => setClientDetails({...clientDetails, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={clientDetails.lastName}
                        onChange={(e) => setClientDetails({...clientDetails, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={clientDetails.dateOfBirth}
                        onChange={(e) => setClientDetails({...clientDetails, dateOfBirth: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                      <Input
                        id="placeOfBirth"
                        placeholder="City, Country"
                        value={clientDetails.placeOfBirth}
                        onChange={(e) => setClientDetails({...clientDetails, placeOfBirth: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAddress">Current Address *</Label>
                    <Input
                      id="currentAddress"
                      placeholder="Street address"
                      value={clientDetails.currentAddress}
                      onChange={(e) => setClientDetails({...clientDetails, currentAddress: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={clientDetails.city}
                        onChange={(e) => setClientDetails({...clientDetails, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="Country"
                        value={clientDetails.country}
                        onChange={(e) => setClientDetails({...clientDetails, country: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="Postal code"
                        value={clientDetails.postalCode}
                        onChange={(e) => setClientDetails({...clientDetails, postalCode: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={clientDetails.phone}
                        onChange={(e) => setClientDetails({...clientDetails, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={clientDetails.email}
                        onChange={(e) => setClientDetails({...clientDetails, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select value={clientDetails.maritalStatus} onValueChange={(value) => setClientDetails({...clientDetails, maritalStatus: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        placeholder="Your profession"
                        value={clientDetails.occupation}
                        onChange={(e) => setClientDetails({...clientDetails, occupation: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you have any Polish documents?</Label>
                    <RadioGroup value={clientDetails.hasPolishDocuments} onValueChange={(value) => setClientDetails({...clientDetails, hasPolishDocuments: value})}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="docs-yes" />
                        <Label htmlFor="docs-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="docs-no" />
                        <Label htmlFor="docs-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unsure" id="docs-unsure" />
                        <Label htmlFor="docs-unsure">Not sure</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any additional information you'd like to share..."
                      rows={4}
                      value={clientDetails.additionalInfo}
                      onChange={(e) => setClientDetails({...clientDetails, additionalInfo: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Family Tree */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">
                      Add information about your Polish ancestors. Start with your parents and grandparents, then add other relatives if relevant.
                    </p>
                  </div>

                  {familyMembers.map((member, index) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-900">Family Member {index + 1}</h3>
                        {familyMembers.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFamilyMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Relationship *</Label>
                          <Select 
                            value={member.relation}
                            onValueChange={(value) => {
                              const updated = [...familyMembers];
                              updated[index].relation = value;
                              setFamilyMembers(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="grandparent">Grandparent</SelectItem>
                              <SelectItem value="great-grandparent">Great-Grandparent</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                              <SelectItem value="cousin">Cousin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            placeholder="Enter full name"
                            value={member.name}
                            onChange={(e) => {
                              const updated = [...familyMembers];
                              updated[index].name = e.target.value;
                              setFamilyMembers(updated);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Birth Year</Label>
                          <Input
                            placeholder="e.g., 1945"
                            value={member.birthYear}
                            onChange={(e) => {
                              const updated = [...familyMembers];
                              updated[index].birthYear = e.target.value;
                              setFamilyMembers(updated);
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Birth Place</Label>
                          <Input
                            placeholder="City, Poland"
                            value={member.birthPlace}
                            onChange={(e) => {
                              const updated = [...familyMembers];
                              updated[index].birthPlace = e.target.value;
                              setFamilyMembers(updated);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={member.hasDocuments}
                            onChange={(e) => {
                              const updated = [...familyMembers];
                              updated[index].hasDocuments = e.target.checked;
                              setFamilyMembers(updated);
                            }}
                          />
                          <span className="text-sm text-gray-600">I have documents for this family member</span>
                        </label>
                      </div>
                    </Card>
                  ))}

                  <Button
                    onClick={addFamilyMember}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Family Member
                  </Button>
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">
                      Upload any documents you currently have. Don't worry if you don't have everything - we'll help you obtain missing documents.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Recommended Documents:</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Your birth certificate
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Parents' birth certificates
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Grandparents' birth certificates
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Any Polish passports or ID cards
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Marriage certificates
                        </li>
                        <li className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Any other relevant family documents
                        </li>
                      </ul>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Drag and drop files here, or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleDocumentUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild>
                          <span>Choose Files</span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                      </p>
                    </div>

                    {uploadedDocuments.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Uploaded Documents:</h3>
                        <ul className="space-y-2">
                          {uploadedDocuments.map((doc, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-green-800">
                      Please review your information before submitting. You can go back to any step to make changes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span> {clientDetails.firstName} {clientDetails.lastName}
                        </div>
                        <div>
                          <span className="text-gray-600">Birth Date:</span> {clientDetails.dateOfBirth}
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span> {clientDetails.email}
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span> {clientDetails.phone}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Family Members
                      </h3>
                      <ul className="space-y-1 text-sm">
                        {familyMembers.filter(m => m.name).map((member, index) => (
                          <li key={index} className="text-gray-600">
                            • {member.name} ({member.relation})
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Uploaded Documents
                      </h3>
                      <p className="text-sm text-gray-600">
                        {uploadedDocuments.length} document(s) uploaded
                      </p>
                    </Card>

                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" required />
                      <label className="text-sm text-gray-600">
                        I confirm that all information provided is accurate to the best of my knowledge. I understand that providing false information may affect my application.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveProgress}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={handleNextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmitApplication}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      

    </div>
  );
}