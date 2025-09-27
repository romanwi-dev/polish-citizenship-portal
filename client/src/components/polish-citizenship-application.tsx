import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PDFGenerator from "@/components/pdf-generator";
import { 
  FileText, 
  User, 
  Users, 
  MapPin, 
  Calendar,
  Save,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Flag,
  Home,
  Globe
} from "lucide-react";

interface PolishCitizenshipApplication {
  // Wnioskodawca (Applicant)
  applicantName: string;
  applicantAddress: string;
  applicantState: string;
  applicantStreet: string;
  applicantHouseNumber: string;
  applicantApartmentNumber: string;
  applicantPostalCode: string;
  applicantCity: string;
  applicantMobilePhone: string;

  // Typ wniosku (Application Type)
  applicationType: 'confirmation' | 'loss_confirmation';
  subjectName: string; // Imię i nazwisko osoby której dotyczy wniosek

  // Dodatkowe informacje (Additional Information)
  additionalFactualInfo: string;
  thirdPartyPurpose: string;

  // CZĘŚĆ I - Dane osoby, której dotyczy wniosek
  // Personal Data of the Subject
  lastName: string;
  maidenName: string;
  firstNames: string;
  fatherFullName: string;
  motherMaidenName: string;
  usedSurnamesWithDates: string;
  birthDate: string;
  gender: 'kobieta' | 'mężczyzna';
  birthPlace: string;
  foreignCitizenshipsWithDates: string;
  maritalStatus: 'kawaler/panna' | 'żonaty/mężatka' | 'rozwiedziony/rozwiedziona' | 'wdowiec/wdowa';
  peselNumber: string;

  // Decyzje dotyczące obywatelstwa (Citizenship Decisions)
  previousCitizenshipDecision: boolean;
  previousDecisionDetails: string;
  citizenshipChangeRequest: boolean;
  citizenshipChangeDetails: string;
  residenceHistory: string;

  // CZĘŚĆ I - Dane rodziców (Parents Data)
  // Matka (Mother)
  motherLastName: string;
  motherMaidenNameFull: string;
  motherFirstNames: string;
  motherFatherName: string;
  motherMotherMaidenName: string;
  motherUsedSurnamesWithDates: string;
  motherBirthDate: string;
  motherBirthPlace: string;
  motherMaritalStatus: string;
  motherMarriageDate: string;
  motherMarriagePlace: string;
  motherCitizenshipsAtBirth: string;
  motherPesel: string;

  // Ojciec (Father)
  fatherLastName: string;
  fatherMaidenNameFull: string;
  fatherFirstNames: string;
  fatherFatherName: string;
  fatherMotherMaidenName: string;
  fatherUsedSurnamesWithDates: string;
  fatherBirthDate: string;
  fatherBirthPlace: string;
  fatherMaritalStatus: string;
  fatherMarriageDate: string;
  fatherMarriagePlace: string;
  fatherCitizenshipsAtBirth: string;
  fatherPesel: string;

  // CZĘŚĆ I - Dane dziadków (Grandparents Data)
  // Dziadek ze strony matki (Maternal Grandfather)
  maternalGrandfatherLastName: string;
  maternalGrandfatherMaidenName: string;
  maternalGrandfatherFirstNames: string;
  maternalGrandfatherFatherName: string;
  maternalGrandfatherMotherName: string;
  maternalGrandfatherBirthDate: string;
  maternalGrandfatherBirthPlace: string;
  maternalGrandfatherPesel: string;

  // Babka ze strony matki (Maternal Grandmother)
  maternalGrandmotherLastName: string;
  maternalGrandmotherMaidenName: string;
  maternalGrandmotherFirstNames: string;
  maternalGrandmotherFatherName: string;
  maternalGrandmotherMotherName: string;
  maternalGrandmotherBirthDate: string;
  maternalGrandmotherBirthPlace: string;
  maternalGrandmotherPesel: string;

  // Dziadek ze strony ojca (Paternal Grandfather)
  paternalGrandfatherLastName: string;
  paternalGrandfatherMaidenName: string;
  paternalGrandfatherFirstNames: string;
  paternalGrandfatherFatherName: string;
  paternalGrandfatherMotherName: string;
  paternalGrandfatherBirthDate: string;
  paternalGrandfatherBirthPlace: string;
  paternalGrandfatherPesel: string;

  // Babka ze strony ojca (Paternal Grandmother)
  paternalGrandmotherLastName: string;
  paternalGrandmotherMaidenName: string;
  paternalGrandmotherFirstNames: string;
  paternalGrandmotherFatherName: string;
  paternalGrandmotherMotherName: string;
  paternalGrandmotherBirthDate: string;
  paternalGrandmotherBirthPlace: string;
  paternalGrandmotherPesel: string;

  // CZĘŚĆ II - Życiorys (Biography)
  subjectBiography: string;
  parentsChoiceForChild: 'tak' | 'nie' | 'nie_wiem' | 'nie_dotyczy';
  parentsChoiceOrgan: string;

  // CZĘŚĆ III - Dodatkowe informacje o rodzicach
  motherBiography: string;
  fatherBiography: string;
  
  // Życiorysy dziadków (Grandparents Biographies)
  maternalGrandfatherBiography: string;
  maternalGrandmotherBiography: string;
  paternalGrandfatherBiography: string;
  paternalGrandmotherBiography: string;

  // Informacje o dalszych wstępnych (Great-grandparents info)
  greatGrandparentsInfo: string;

  // Inne istotne okoliczności (Other important circumstances)
  otherCircumstances: string;
  siblingDecisions: string;
}

export default function PolishCitizenshipApplication() {
  const [activeTab, setActiveTab] = useState("applicant");
  const [isEditing, setIsEditing] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PolishCitizenshipApplication>({
    // Wnioskodawca (Applicant)
    applicantName: "Maria Johnson",
    applicantAddress: "",
    applicantState: "Illinois",
    applicantStreet: "123 Main Street",
    applicantHouseNumber: "123",
    applicantApartmentNumber: "4B",
    applicantPostalCode: "60601",
    applicantCity: "Chicago",
    applicantMobilePhone: "+1-555-123-4567",

    // Typ wniosku
    applicationType: 'confirmation',
    subjectName: "Maria Johnson",

    // Dodatkowe informacje
    additionalFactualInfo: "NIE DOTYCZY",
    thirdPartyPurpose: "NIE DOTYCZY",

    // CZĘŚĆ I - Dane osoby
    lastName: "Johnson",
    maidenName: "Kowalski",
    firstNames: "Maria Anna",
    fatherFullName: "Stefan Kowalski",
    motherMaidenName: "Anna Nowak",
    usedSurnamesWithDates: "Kowalski (do 2010), Johnson (od 2010)",
    birthDate: "1985-06-15",
    gender: 'kobieta',
    birthPlace: "Chicago, Illinois, USA",
    foreignCitizenshipsWithDates: "Amerykańskie (od urodzenia)",
    maritalStatus: 'żonaty/mężatka',
    peselNumber: "",

    // Decyzje
    previousCitizenshipDecision: false,
    previousDecisionDetails: "NIE DOTYCZY",
    citizenshipChangeRequest: false,
    citizenshipChangeDetails: "NIE DOTYCZY",
    residenceHistory: "Chicago, Illinois, USA (od urodzenia do dziś)",

    // Matka
    motherLastName: "Kowalski",
    motherMaidenNameFull: "Nowak",
    motherFirstNames: "Anna Maria",
    motherFatherName: "Stanisław Nowak",
    motherMotherMaidenName: "Zofia Kowalczyk",
    motherUsedSurnamesWithDates: "Nowak (do 1980), Kowalski (od 1980)",
    motherBirthDate: "1958-12-03",
    motherBirthPlace: "Warszawa, Polska",
    motherMaritalStatus: "mężatka",
    motherMarriageDate: "1980-05-25",
    motherMarriagePlace: "Chicago, Illinois, USA",
    motherCitizenshipsAtBirth: "Polskie",
    motherPesel: "",

    // Ojciec
    fatherLastName: "Kowalski",
    fatherMaidenNameFull: "",
    fatherFirstNames: "Stefan Jan",
    fatherFatherName: "Jan Kowalski",
    fatherMotherMaidenName: "Katarzyna Wiśniewska",
    fatherUsedSurnamesWithDates: "Kowalski",
    fatherBirthDate: "1955-09-10",
    fatherBirthPlace: "Kraków, Polska",
    fatherMaritalStatus: "żonaty",
    fatherMarriageDate: "1980-05-25",
    fatherMarriagePlace: "Chicago, Illinois, USA",
    fatherCitizenshipsAtBirth: "Polskie",
    fatherPesel: "",

    // Dziadkowie
    maternalGrandfatherLastName: "Nowak",
    maternalGrandfatherMaidenName: "",
    maternalGrandfatherFirstNames: "Stanisław Józef",
    maternalGrandfatherFatherName: "",
    maternalGrandfatherMotherName: "",
    maternalGrandfatherBirthDate: "1930-08-22",
    maternalGrandfatherBirthPlace: "Warszawa, Polska",
    maternalGrandfatherPesel: "",

    maternalGrandmotherLastName: "Nowak",
    maternalGrandmotherMaidenName: "Kowalczyk",
    maternalGrandmotherFirstNames: "Zofia Anna",
    maternalGrandmotherFatherName: "",
    maternalGrandmotherMotherName: "",
    maternalGrandmotherBirthDate: "1935-02-28",
    maternalGrandmotherBirthPlace: "Warszawa, Polska",
    maternalGrandmotherPesel: "",

    paternalGrandfatherLastName: "Kowalski",
    paternalGrandfatherMaidenName: "",
    paternalGrandfatherFirstNames: "Jan Władysław",
    paternalGrandfatherFatherName: "",
    paternalGrandfatherMotherName: "",
    paternalGrandfatherBirthDate: "1925-04-08",
    paternalGrandfatherBirthPlace: "Kraków, Polska",
    paternalGrandfatherPesel: "",

    paternalGrandmotherLastName: "Kowalski",
    paternalGrandmotherMaidenName: "Wiśniewska",
    paternalGrandmotherFirstNames: "Katarzyna Maria",
    paternalGrandmotherFatherName: "",
    paternalGrandmotherMotherName: "",
    paternalGrandmotherBirthDate: "1928-11-15",
    paternalGrandmotherBirthPlace: "Kraków, Polska",
    paternalGrandmotherPesel: "",

    // Życiorysy
    subjectBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",
    parentsChoiceForChild: 'nie_dotyczy',
    parentsChoiceOrgan: "NIE DOTYCZY",

    motherBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",
    fatherBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",

    maternalGrandfatherBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",
    maternalGrandmotherBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",
    paternalGrandfatherBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",
    paternalGrandmotherBiography: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",

    greatGrandparentsInfo: "DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY",
    otherCircumstances: "",
    siblingDecisions: ""
  });

  const updateField = (field: keyof PolishCitizenshipApplication, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.applicantName) errors.applicantName = "Nazwa wnioskodawcy jest wymagana";
    if (!formData.subjectName) errors.subjectName = "Imię i nazwisko osoby jest wymagane";
    if (!formData.lastName) errors.lastName = "Nazwisko jest wymagane";
    if (!formData.firstNames) errors.firstNames = "Imię/imiona są wymagane";
    if (!formData.birthDate) errors.birthDate = "Data urodzenia jest wymagana";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Would integrate with backend API
    }
  };

  const tabCompletionStatus = {
    applicant: formData.applicantName && formData.subjectName,
    subject: formData.lastName && formData.firstNames && formData.birthDate,
    parents: formData.motherLastName && formData.fatherLastName,
    grandparents: formData.maternalGrandfatherLastName && formData.paternalGrandfatherLastName,
    biographies: formData.subjectBiography && formData.motherBiography,
    additional: true // Always considered complete as it's mostly optional
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-red-900 flex items-center gap-2 flex-wrap">
              <Flag className="w-7 h-7" />
              <span>Wniosek o Potwierdzenie Obywatelstwa Polskiego</span>
            </CardTitle>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <Badge className="bg-red-600 text-white px-3 py-1">
                Dokument Urzędowy
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => {
                  // Import functionality would go here
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Danych
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => {
                  // Export functionality would go here
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Eksport PDF
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmit}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Zapisz Wniosek
              </Button>
            </div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg border border-red-200 mt-4">
            <div className="text-red-800 font-semibold mb-2">PRZED WYPEŁNIENIEM WNIOSKU PROSZĘ ZAPOZNAĆ SIĘ Z POUCZENIEM</div>
            <div className="text-red-700 text-sm">
              <div>WNIOSEK WYPEŁNIA SIĘ W JĘZYKU POLSKIM</div>
              <div className="mt-2">Miejscowość i data złożenia wniosku: <strong>Warszawa, {new Date().toLocaleDateString('pl-PL')}</strong></div>
              <div className="mt-1">Organ przyjmujący wniosek: <strong>WOJEWODA MAZOWIECKI</strong></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full gap-1 p-1">
            <TabsTrigger value="applicant" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Wnioskodawca</span>
              {tabCompletionStatus.applicant && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="subject" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Dane Osoby</span>
              {tabCompletionStatus.subject && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Rodzice</span>
              {tabCompletionStatus.parents && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="grandparents" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Dziadkowie</span>
              {tabCompletionStatus.grandparents && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="biographies" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Życiorysy</span>
              {tabCompletionStatus.biographies && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="additional" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Dodatkowo</span>
              {tabCompletionStatus.additional && <CheckCircle2 className="w-3 h-3 text-green-600 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="generate-pdf" className="flex items-center gap-2 px-4 py-3 whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Generuj PDF</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Wnioskodawca Tab */}
        <TabsContent value="applicant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-red-600" />
                Wnioskodawca (Applicant Information)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Imię i nazwisko/nazwa podmiotu *
                </label>
                <Input
                  value={formData.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  className={`h-14 text-lg ${validationErrors.applicantName ? 'border-red-300' : ''}`}
                  placeholder="Wprowadź pełne imię i nazwisko"
                />
                {validationErrors.applicantName && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.applicantName}</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">Adres zamieszkania/siedziby</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Państwo/województwo
                    </label>
                    <Input
                      value={formData.applicantState}
                      onChange={(e) => updateField('applicantState', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="np. Illinois"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Ulica
                    </label>
                    <Input
                      value={formData.applicantStreet}
                      onChange={(e) => updateField('applicantStreet', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Nazwa ulicy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Numer domu
                    </label>
                    <Input
                      value={formData.applicantHouseNumber}
                      onChange={(e) => updateField('applicantHouseNumber', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Numer lokalu
                    </label>
                    <Input
                      value={formData.applicantApartmentNumber}
                      onChange={(e) => updateField('applicantApartmentNumber', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="4B"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Kod pocztowy
                    </label>
                    <Input
                      value={formData.applicantPostalCode}
                      onChange={(e) => updateField('applicantPostalCode', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="60601"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Miejscowość
                    </label>
                    <Input
                      value={formData.applicantCity}
                      onChange={(e) => updateField('applicantCity', e.target.value)}
                      className="h-14 text-lg"
                      placeholder="Chicago"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Telefon komórkowy
                  </label>
                  <Input
                    value={formData.applicantMobilePhone}
                    onChange={(e) => updateField('applicantMobilePhone', e.target.value)}
                    className="h-14 text-lg"
                    placeholder="+1-555-123-4567"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Wniosek o potwierdzenie posiadania lub utraty obywatelstwa polskiego</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wnoszę o wydanie decyzji:
                    </label>
                    <RadioGroup
                      value={formData.applicationType}
                      onValueChange={(value) => updateField('applicationType', value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="confirmation" id="confirmation" />
                        <Label htmlFor="confirmation" className="text-sm">
                          potwierdzającej posiadanie obywatelstwa polskiego przez:
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="loss_confirmation" id="loss_confirmation" />
                        <Label htmlFor="loss_confirmation" className="text-sm">
                          potwierdzającej utratę obywatelstwa polskiego przez:
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imię i nazwisko osoby *
                    </label>
                    <Input
                      value={formData.subjectName}
                      onChange={(e) => updateField('subjectName', e.target.value)}
                      className={validationErrors.subjectName ? 'border-red-300' : ''}
                      placeholder="Imię i nazwisko osoby której dotyczy wniosek"
                    />
                    {validationErrors.subjectName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.subjectName}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other tabs... */}
        <TabsContent value="subject" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-red-600" />
                CZĘŚĆ I - Dane osoby, której dotyczy wniosek
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwisko *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={validationErrors.lastName ? 'border-red-300' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwisko rodowe
                  </label>
                  <Input
                    value={formData.maidenName}
                    onChange={(e) => updateField('maidenName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imię / imiona *
                </label>
                <Input
                  value={formData.firstNames}
                  onChange={(e) => updateField('firstNames', e.target.value)}
                  className={validationErrors.firstNames ? 'border-red-300' : ''}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imię i nazwisko ojca
                  </label>
                  <Input
                    value={formData.fatherFullName}
                    onChange={(e) => updateField('fatherFullName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imię i nazwisko rodowe matki
                  </label>
                  <Input
                    value={formData.motherMaidenName}
                    onChange={(e) => updateField('motherMaidenName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Używane nazwiska wraz z datą zmiany
                </label>
                <Input
                  value={formData.usedSurnamesWithDates}
                  onChange={(e) => updateField('usedSurnamesWithDates', e.target.value)}
                  placeholder="np. Kowalski (do 2010), Johnson (od 2010)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data urodzenia *
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    className={validationErrors.birthDate ? 'border-red-300' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Płeć
                  </label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateField('gender', value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kobieta" id="kobieta" />
                      <Label htmlFor="kobieta">kobieta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mężczyzna" id="mężczyzna" />
                      <Label htmlFor="mężczyzna">mężczyzna</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nr PESEL
                  </label>
                  <Input
                    value={formData.peselNumber}
                    onChange={(e) => updateField('peselNumber', e.target.value)}
                    placeholder="11 cyfr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miejsce urodzenia
                </label>
                <Input
                  value={formData.birthPlace}
                  onChange={(e) => updateField('birthPlace', e.target.value)}
                  placeholder="Miasto, Kraj"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posiadane obce obywatelstwa wraz z datą nabycia
                </label>
                <Textarea
                  value={formData.foreignCitizenshipsWithDates}
                  onChange={(e) => updateField('foreignCitizenshipsWithDates', e.target.value)}
                  rows={2}
                  placeholder="np. Amerykańskie (od urodzenia), Kanadyjskie (2015)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stan cywilny
                </label>
                <RadioGroup
                  value={formData.maritalStatus}
                  onValueChange={(value) => updateField('maritalStatus', value)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="kawaler/panna" id="single" />
                    <Label htmlFor="single" className="text-sm">kawaler/panna</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="żonaty/mężatka" id="married" />
                    <Label htmlFor="married" className="text-sm">żonaty/mężatka</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rozwiedziony/rozwiedziona" id="divorced" />
                    <Label htmlFor="divorced" className="text-sm">rozwiedziony/rozwiedziona</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wdowiec/wdowa" id="widowed" />
                    <Label htmlFor="widowed" className="text-sm">wdowiec/wdowa</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add the remaining tabs for parents, grandparents, biographies, and additional info */}
        <TabsContent value="parents">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sekcja Rodziców</h3>
            <p className="mt-1 text-sm text-gray-500">
              Dane rodziców będą dodane w następnej iteracji
            </p>
          </div>
        </TabsContent>

        <TabsContent value="grandparents">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sekcja Dziadków</h3>
            <p className="mt-1 text-sm text-gray-500">
              Dane dziadków będą dodane w następnej iteracji
            </p>
          </div>
        </TabsContent>

        <TabsContent value="biographies">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sekcja Życiorysów</h3>
            <p className="mt-1 text-sm text-gray-500">
              Życiorysy będą dodane w następnej iteracji
            </p>
          </div>
        </TabsContent>

        <TabsContent value="additional">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Dodatkowe Informacje</h3>
            <p className="mt-1 text-sm text-gray-500">
              Dodatkowe sekcje będą dodane w następnej iteracji
            </p>
          </div>
        </TabsContent>

        <TabsContent value="generate-pdf">
          <PDFGenerator applicationData={formData} />
        </TabsContent>
      </Tabs>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-red-800 mb-2">Ważne Informacje</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Wszystkie dane muszą być wypełnione w języku polskim</li>
              <li>• Daty należy podawać w formacie DD-MM-RRRR</li>
              <li>• Miejsca należy podawać z dokładnością do miasta/gminy i kraju</li>
              <li>• Wymagane są tłumaczenia przysięgłe wszystkich dokumentów obcojęzycznych</li>
              <li>• Wniosek składa się wraz z kompletem wymaganych dokumentów</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}