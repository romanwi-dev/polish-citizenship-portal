import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  FileText, 
  Heart, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Home,
  Globe,
  Users,
  BookOpen,
  Save,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface ApplicantDetails {
  // Basic Personal Information (Dane osobowe)
  firstName: string;
  lastName: string;
  maidenName?: string;
  fatherName: string;
  motherName: string;
  motherMaidenName: string;
  birthDate: string;
  birthPlace: string;
  birthCountry: string;
  nationality: string;
  citizenship: string;
  gender: 'mężczyzna' | 'kobieta';
  married: 'YES' | 'NO';
  
  // Identity Documents (Dokumenty tożsamości)
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssuer: string;
  idCardNumber?: string;
  peselNumber?: string;
  
  // Contact Information (Dane kontaktowe)
  currentAddress: string;
  currentCity: string;
  currentPostalCode: string;
  currentCountry: string;
  phoneNumber: string;
  emailAddress: string;
  
  // Marital Status (Stan cywilny)
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  spouseFirstName?: string;
  spouseLastName?: string;
  spouseMaidenName?: string;
  marriageDate?: string;
  marriagePlace?: string;
  marriageCountry?: string;
  
  // Children Information (Informacje o dzieciach)
  hasChildren: boolean;
  children: Array<{
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    citizenship: string;
  }>;
  
  // Education and Employment (Wykształcenie i zatrudnienie)
  education: string;
  profession: string;
  employer?: string;
  employerAddress?: string;
  
  // Polish Ancestry (Pochodzenie polskie)
  polishAncestor: string;
  ancestorRelationship: string;
  ancestorBirthDate: string;
  ancestorBirthPlace: string;
  ancestorEmigrationDate?: string;
  ancestorNaturalizationDate?: string;
  ancestorNaturalizationPlace?: string;
  
  // Legal Declarations (Oświadczenia prawne)
  declaresPolishCitizenship: boolean;
  renouncesPreviousCitizenship: boolean;
  acknowledgesObligations: boolean;
  
  // Power of Attorney Specific (Pełnomocnictwo)
  powrOfAttorneyType: 'minor' | 'married' | 'single';
  representativeName?: string;
  representativeAddress?: string;
  representativePhone?: string;
  grantedPowers: string[];
}

export default function ApplicantDetailsForm() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ApplicantDetails>({
    // Basic Personal Information
    firstName: "",
    lastName: "",
    maidenName: "",
    fatherName: "",
    motherName: "",
    motherMaidenName: "",
    birthDate: "",
    birthPlace: "",
    birthCountry: "",
    nationality: "",
    citizenship: "",
    gender: "kobieta",
    married: "NO",
    
    // Identity Documents
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    passportIssuer: "",
    peselNumber: "",
    
    // Contact Information
    currentAddress: "123 Main Street, Apt 4B",
    currentCity: "Chicago",
    currentPostalCode: "60601",
    currentCountry: "United States",
    phoneNumber: "+1-555-123-4567",
    emailAddress: "maria.johnson@email.com",
    
    // Marital Status
    maritalStatus: "single",
    spouseFirstName: "",
    spouseLastName: "",
    marriageDate: "",
    marriagePlace: "",
    marriageCountry: "",
    
    // Children
    hasChildren: false,
    children: [],
    
    // Education and Employment
    education: "Bachelor's Degree",
    profession: "Software Engineer",
    employer: "Tech Solutions Inc.",
    employerAddress: "456 Business Ave, Chicago, IL",
    
    // Polish Ancestry
    polishAncestor: "Jan Kowalski",
    ancestorRelationship: "Grandfather",
    ancestorBirthDate: "1925-04-08",
    ancestorBirthPlace: "Kraków, Poland",
    ancestorEmigrationDate: "1950-06-15",
    
    // Legal Declarations
    declaresPolishCitizenship: true,
    renouncesPreviousCitizenship: false,
    acknowledgesObligations: true,
    
    // Power of Attorney
    powrOfAttorneyType: "married",
    grantedPowers: ["Document submission", "Archive research", "Legal representation"]
  });

  const updateField = (field: keyof ApplicantDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addChild = () => {
    const newChild = {
      firstName: "",
      lastName: "",
      birthDate: "",
      birthPlace: "",
      citizenship: ""
    };
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, newChild]
    }));
  };

  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChild = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.birthDate) errors.birthDate = "Birth date is required";
    if (!formData.passportNumber) errors.passportNumber = "Passport number is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Would integrate with backend API
    }
  };

  const tabCompletionStatus = {
    personal: formData.firstName && formData.lastName && formData.birthDate,
    documents: formData.passportNumber && formData.passportIssueDate,
    contact: formData.currentAddress && formData.phoneNumber && formData.emailAddress,
    family: formData.maritalStatus && (!formData.hasChildren || formData.children.length > 0),
    ancestry: formData.polishAncestor && formData.ancestorBirthDate,
    legal: formData.declaresPolishCitizenship && formData.acknowledgesObligations
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <FileText className="w-7 h-7" />
              Applicant Details Form
              <Badge className="bg-green-600 text-white">
                Polish Citizenship Application
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Form
              </Button>
            </div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border border-green-200 mt-4">
            <p className="text-green-800 font-medium">📝 Please fill out your personal information below</p>
            <p className="text-green-700 text-sm mt-1">
              This form collects essential details for your Polish citizenship application and Power of Attorney documents.
              <br />
              <strong>Why this matters:</strong> Accurate information helps us prepare all legal documents correctly and speeds up your case processing.
            </p>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center gap-1 py-3">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Personal</span>
            {tabCompletionStatus.personal && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="parents" className="flex items-center gap-1 py-3">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Parents</span>
            {tabCompletionStatus.family && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1 py-3">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
            {tabCompletionStatus.contact && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-1 py-3 hidden md:flex">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Family</span>
            {tabCompletionStatus.family && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="ancestry" className="flex items-center gap-1 py-3 hidden md:flex">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Ancestry</span>
            {tabCompletionStatus.ancestry && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                FULL NAME
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">Exactly as written in your valid passport or another valid ID or driving licence</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-base font-semibold text-gray-700">
                    First Name (Imię) *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value.toUpperCase())}
                    className={`h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl ${validationErrors.firstName ? 'border-red-300' : ''}`}
                    placeholder="ENTER YOUR FIRST NAME"
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block text-base font-semibold text-gray-700">
                    Last Name (Nazwisko) *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value.toUpperCase())}
                    className={`h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl ${validationErrors.lastName ? 'border-red-300' : ''}`}
                    placeholder="ENTER YOUR LAST NAME"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name (Imię i nazwisko ojca)
                  </label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => updateField('fatherName', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother's Name (Imię i nazwisko matki)
                  </label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => updateField('motherName', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Certificate *
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    placeholder="DD.MM.YYYY"
                    className={`h-14 text-lg ${validationErrors.birthDate ? 'border-red-300' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Place (Miejsce urodzenia)
                  </label>
                  <Input
                    value={formData.birthPlace}
                    onChange={(e) => updateField('birthPlace', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Country (Kraj urodzenia)
                  </label>
                  <Input
                    value={formData.birthCountry}
                    onChange={(e) => updateField('birthCountry', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GENDER (Płeć) *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => {
                      const newGender = e.target.value as 'mężczyzna' | 'kobieta';
                      updateField('gender', newGender);
                      // Clear maiden name if switching to male
                      if (newGender === 'mężczyzna') {
                        updateField('maidenName', '');
                      }
                    }}
                    className="w-full h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  >
                    <option value="mężczyzna">MALE</option>
                    <option value="kobieta">FEMALE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MARRIED *
                  </label>
                  <select
                    value={formData.married}
                    onChange={(e) => {
                      const newMarried = e.target.value as 'YES' | 'NO';
                      updateField('married', newMarried);
                      // Clear marriage fields if selecting NO
                      if (newMarried === 'NO') {
                        updateField('spouseFirstName', '');
                        updateField('spouseLastName', '');
                        updateField('spouseMaidenName', '');
                        updateField('marriageDate', '');
                        updateField('marriagePlace', '');
                        updateField('marriageCountry', '');
                      }
                    }}
                    className="w-full h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  >
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-700">
                  Maiden Name (Nazwisko panieńskie)
                </label>
                <Input
                  value={formData.maidenName || ''}
                  onChange={(e) => updateField('maidenName', e.target.value.toUpperCase())}
                  className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  placeholder="ENTER MAIDEN NAME (IF APPLICABLE)"
                  disabled={formData.gender === 'mężczyzna'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Nationality (Obecne obywatelstwo)
                  </label>
                  <Input
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Citizenship (Obecne obywatelstwo)
                  </label>
                  <Input
                    value={formData.citizenship}
                    onChange={(e) => updateField('citizenship', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* PASSPORT NUMBER Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                PASSPORT NUMBER
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Number (Numer paszportu) *
                  </label>
                  <Input
                    value={formData.passportNumber}
                    onChange={(e) => updateField('passportNumber', e.target.value.toUpperCase())}
                    className={`h-14 text-lg ${validationErrors.passportNumber ? 'border-red-300' : ''}`}
                    placeholder="A12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Issuer (Organ wydający)
                  </label>
                  <Input
                    value={formData.passportIssuer}
                    onChange={(e) => updateField('passportIssuer', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date (Data wydania)
                  </label>
                  <Input
                    type="date"
                    value={formData.passportIssueDate}
                    onChange={(e) => updateField('passportIssueDate', e.target.value)}
                    placeholder="DD.MM.YYYY"
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Data ważności)
                  </label>
                  <Input
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={(e) => updateField('passportExpiryDate', e.target.value)}
                    placeholder="DD.MM.YYYY"
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Card Number (Numer dowodu osobistego)
                  </label>
                  <Input
                    value={formData.idCardNumber || ''}
                    onChange={(e) => updateField('idCardNumber', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PESEL Number (if applicable)
                  </label>
                  <Input
                    value={formData.peselNumber || ''}
                    onChange={(e) => updateField('peselNumber', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <Input
                  value={formData.currentAddress}
                  onChange={(e) => updateField('currentAddress', e.target.value)}
                  className={`h-14 text-lg ${validationErrors.currentAddress ? 'border-red-300' : ''}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City (Miasto)
                  </label>
                  <Input
                    value={formData.currentCity}
                    onChange={(e) => updateField('currentCity', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code (Kod pocztowy)
                  </label>
                  <Input
                    value={formData.currentPostalCode}
                    onChange={(e) => updateField('currentPostalCode', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country (Kraj)
                  </label>
                  <Input
                    value={formData.currentCountry}
                    onChange={(e) => updateField('currentCountry', e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PHONE *
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    className={`h-14 text-lg ${validationErrors.phoneNumber ? 'border-red-300' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address (Adres e-mail) *
                  </label>
                  <Input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => updateField('emailAddress', e.target.value)}
                    className={`h-14 text-lg ${validationErrors.emailAddress ? 'border-red-300' : ''}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Parents Information (Informacje o rodzicach)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Mother's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's First Name *
                    </label>
                    <Input
                      value={formData.motherName || ''}
                      onChange={(e) => updateField('motherName', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Mother's first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Last Name *
                    </label>
                    <Input
                      value={formData.motherMaidenName || ''}
                      onChange={(e) => updateField('motherMaidenName', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Mother's maiden name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Birth Date
                    </label>
                    <Input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => updateField('birthDate', e.target.value)}
                      placeholder="DD.MM.YYYY"
                      className="h-14 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Birth Place
                    </label>
                    <Input
                      value={formData.birthPlace || ''}
                      onChange={(e) => updateField('birthPlace', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Mother's birth place"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-md font-medium text-gray-900 border-b pb-2">Father's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's First Name *
                    </label>
                    <Input
                      value={formData.fatherName || ''}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Father's first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Last Name *
                    </label>
                    <Input
                      value={formData.nationality || ''}
                      onChange={(e) => updateField('nationality', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Father's last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Birth Date
                    </label>
                    <Input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => updateField('birthDate', e.target.value)}
                      placeholder="DD.MM.YYYY"
                      className="h-14 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Birth Place
                    </label>
                    <Input
                      value={formData.birthPlace || ''}
                      onChange={(e) => updateField('birthPlace', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Father's birth place"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600" />
                Family Information (Informacje o rodzinie)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital Status (Stan cywilny)
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="single">Single (Kawaler/Panna)</option>
                  <option value="married">Married (Żonaty/Mężatka)</option>
                  <option value="divorced">Divorced (Rozwiedziony/a)</option>
                  <option value="widowed">Widowed (Wdowiec/Wdowa)</option>
                </select>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="font-medium text-pink-800 mb-1">MARRIAGE</h4>
                <p className="text-sm text-pink-600 mb-3">Marriage information section</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spouse First Name
                    </label>
                    <Input
                      value={formData.spouseFirstName || ''}
                      onChange={(e) => updateField('spouseFirstName', e.target.value.toUpperCase())}
                      placeholder="SPOUSE FIRST NAME"
                      disabled={formData.married === 'NO'}
                      className={`h-14 text-lg ${formData.married === 'NO' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spouse Last Name
                    </label>
                    <Input
                      value={formData.spouseLastName || ''}
                      onChange={(e) => updateField('spouseLastName', e.target.value.toUpperCase())}
                      placeholder="SPOUSE LAST NAME"
                      disabled={formData.married === 'NO'}
                      className={`h-14 text-lg ${formData.married === 'NO' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spouse Maiden Name
                    </label>
                    <Input
                      value={formData.spouseMaidenName || ''}
                      onChange={(e) => updateField('spouseMaidenName', e.target.value.toUpperCase())}
                      placeholder="SPOUSE MAIDEN NAME"
                      disabled={formData.married === 'NO'}
                      className={`h-14 text-lg ${formData.married === 'NO' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marriage Date
                    </label>
                    <Input
                      type="date"
                      value={formData.marriageDate || ''}
                      onChange={(e) => updateField('marriageDate', e.target.value)}
                      placeholder="DD.MM.YYYY"
                      disabled={formData.married === 'NO'}
                      className={`h-14 text-lg ${formData.married === 'NO' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marriage Place
                    </label>
                    <Input
                      value={formData.marriagePlace || ''}
                      onChange={(e) => updateField('marriagePlace', e.target.value)}
                      placeholder="MARRIAGE PLACE"
                      disabled={formData.married === 'NO'}
                      className={`h-14 text-lg ${formData.married === 'NO' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasChildren"
                  checked={formData.hasChildren}
                  onChange={(e) => updateField('hasChildren', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="hasChildren" className="text-sm font-medium text-gray-700">
                  I have children (Mam dzieci)
                </label>
              </div>

              {formData.hasChildren && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">Children Information</h4>
                    <Button onClick={addChild} variant="outline" size="sm">
                      Add Child
                    </Button>
                  </div>
                  {formData.children.map((child, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-blue-800">Child {index + 1}</h5>
                        <Button 
                          onClick={() => removeChild(index)} 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="First Name"
                          value={child.firstName}
                          onChange={(e) => updateChild(index, 'firstName', e.target.value)}
                        />
                        <Input
                          placeholder="Last Name"
                          value={child.lastName}
                          onChange={(e) => updateChild(index, 'lastName', e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="Birth Date"
                          value={child.birthDate}
                          onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                        />
                        <Input
                          placeholder="Birth Place"
                          value={child.birthPlace}
                          onChange={(e) => updateChild(index, 'birthPlace', e.target.value)}
                        />
                        <Input
                          placeholder="Citizenship"
                          value={child.citizenship}
                          onChange={(e) => updateChild(index, 'citizenship', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ancestry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Polish Ancestry Information (Pochodzenie polskie)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Polish Ancestor Name (Imię i nazwisko polskiego przodka)
                  </label>
                  <Input
                    value={formData.polishAncestor}
                    onChange={(e) => updateField('polishAncestor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship (Stopień pokrewieństwa)
                  </label>
                  <select
                    value={formData.ancestorRelationship}
                    onChange={(e) => updateField('ancestorRelationship', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select relationship</option>
                    <option value="Father">Father (Ojciec)</option>
                    <option value="Mother">Mother (Matka)</option>
                    <option value="Grandfather">Grandfather (Dziadek)</option>
                    <option value="Grandmother">Grandmother (Babcia)</option>
                    <option value="Great-Grandfather">Great-Grandfather (Pradziadek)</option>
                    <option value="Great-Grandmother">Great-Grandmother (Prababcia)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ancestor Birth Date (Data urodzenia przodka)
                  </label>
                  <Input
                    type="date"
                    value={formData.ancestorBirthDate}
                    onChange={(e) => updateField('ancestorBirthDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ancestor Birth Place (Miejsce urodzenia przodka)
                  </label>
                  <Input
                    value={formData.ancestorBirthPlace}
                    onChange={(e) => updateField('ancestorBirthPlace', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emigration Date (Data emigracji)
                  </label>
                  <Input
                    type="date"
                    value={formData.ancestorEmigrationDate || ''}
                    onChange={(e) => updateField('ancestorEmigrationDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naturalization Date (Data naturalizacji)
                  </label>
                  <Input
                    type="date"
                    value={formData.ancestorNaturalizationDate || ''}
                    onChange={(e) => updateField('ancestorNaturalizationDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Legal Declarations (Oświadczenia prawne)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="declaresPolishCitizenship"
                    checked={formData.declaresPolishCitizenship}
                    onChange={(e) => updateField('declaresPolishCitizenship', e.target.checked)}
                    className="mt-1 rounded"
                  />
                  <label htmlFor="declaresPolishCitizenship" className="text-sm text-gray-700">
                    I declare my intention to obtain Polish citizenship and acknowledge that I meet the legal requirements for citizenship by descent.
                    (Oświadczam o zamiarze uzyskania obywatelstwa polskiego i potwierdzam, że spełniam wymagania prawne dotyczące obywatelstwa przez pochodzenie.)
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="renouncesPreviousCitizenship"
                    checked={formData.renouncesPreviousCitizenship}
                    onChange={(e) => updateField('renouncesPreviousCitizenship', e.target.checked)}
                    className="mt-1 rounded"
                  />
                  <label htmlFor="renouncesPreviousCitizenship" className="text-sm text-gray-700">
                    I declare that I will renounce my previous citizenship if required by Polish law.
                    (Oświadczam, że zrzekę się dotychczasowego obywatelstwa, jeśli będzie to wymagane przez prawo polskie.)
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acknowledgesObligations"
                    checked={formData.acknowledgesObligations}
                    onChange={(e) => updateField('acknowledgesObligations', e.target.checked)}
                    className="mt-1 rounded"
                  />
                  <label htmlFor="acknowledgesObligations" className="text-sm text-gray-700">
                    I acknowledge and accept all rights and obligations associated with Polish citizenship.
                    (Przyjmuję do wiadomości i akceptuję wszystkie prawa i obowiązki związane z obywatelstwem polskim.)
                  </label>
                </div>
              </div>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-5 h-5" />
                    Power of Attorney (Pełnomocnictwo)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Power of Attorney Type (Typ pełnomocnictwa)
                    </label>
                    <select
                      value={formData.powrOfAttorneyType}
                      onChange={(e) => updateField('powrOfAttorneyType', e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="single">Single Person (Osoba niezamężna)</option>
                      <option value="married">Married Person (Osoba zamężna)</option>
                      <option value="minor">Minor (Małoletni)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Granted Powers (Przyznane uprawnienia)
                    </label>
                    <div className="space-y-2">
                      {[
                        "Document submission (Składanie dokumentów)",
                        "Archive research (Badania archiwalne)", 
                        "Legal representation (Reprezentacja prawna)",
                        "Government office visits (Wizyty w urzędach)",
                        "Document collection (Odbieranie dokumentów)"
                      ].map((power) => (
                        <div key={power} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={power}
                            checked={formData.grantedPowers.includes(power)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField('grantedPowers', [...formData.grantedPowers, power]);
                              } else {
                                updateField('grantedPowers', formData.grantedPowers.filter(p => p !== power));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={power} className="text-sm text-gray-700">
                            {power}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Form Completion Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(tabCompletionStatus).map(([tab, isComplete]) => (
                <div key={tab} className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={isComplete ? 'text-green-700' : 'text-red-600'}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-blue-700 text-sm mt-3">
              Complete all sections before submitting your Polish citizenship application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}