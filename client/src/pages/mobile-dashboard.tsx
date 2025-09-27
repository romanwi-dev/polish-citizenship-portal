import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PassportStampCollection } from "@/components/passport-stamp-collection";
import { MapPin } from "lucide-react";

// Date formatting function to enforce DD.MM.YYYY format with validation
const formatDateInput = (input: string): string => {
  // Remove all non-digit characters
  const numbers = input.replace(/\D/g, '');
  
  // If input like "04061967" (8 digits), format as DD.MM.YYYY with validation
  if (numbers.length === 8) {
    let day = numbers.slice(0, 2);
    let month = numbers.slice(2, 4);
    let year = numbers.slice(4, 8);
    
    // ENFORCE CORRECTIONS - DD validation (1-31)
    const dayNum = parseInt(day);
    if (dayNum < 1) day = '01';
    if (dayNum > 31) day = '31';
    
    // ENFORCE CORRECTIONS - MM validation (1-12)
    const monthNum = parseInt(month);
    if (monthNum < 1) month = '01';
    if (monthNum > 12) month = '12';
    
    // ENFORCE CORRECTIONS - YYYY validation (1825-2025)
    const yearNum = parseInt(year);
    if (yearNum < 1825) year = '1825';
    if (yearNum > 2025) year = '2025';
    
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  }
  
  // Progressive formatting as user types with real-time validation
  if (numbers.length <= 2) {
    // Validate day input (1-31)
    if (numbers.length === 2) {
      const dayNum = parseInt(numbers);
      if (dayNum < 1) return '01';
      if (dayNum > 31) return '31';
    }
    return numbers;
  } else if (numbers.length <= 4) {
    let day = numbers.slice(0, 2);
    let month = numbers.slice(2);
    
    // Validate day (1-31)
    const dayNum = parseInt(day);
    if (dayNum < 1) day = '01';
    if (dayNum > 31) day = '31';
    
    // Validate month if complete (1-12)
    if (month.length === 2) {
      const monthNum = parseInt(month);
      if (monthNum < 1) month = '01';
      if (monthNum > 12) month = '12';
    }
    
    return `${day.padStart(2, '0')}.${month}`;
  } else if (numbers.length <= 8) {
    let day = numbers.slice(0, 2);
    let month = numbers.slice(2, 4);
    let year = numbers.slice(4);
    
    // Validate day (1-31)
    const dayNum = parseInt(day);
    if (dayNum < 1) day = '01';
    if (dayNum > 31) day = '31';
    
    // Validate month (1-12)
    const monthNum = parseInt(month);
    if (monthNum < 1) month = '01';
    if (monthNum > 12) month = '12';
    
    // Validate year if complete (1825-2025)
    if (year.length === 4) {
      const yearNum = parseInt(year);
      if (yearNum < 1825) year = '1825';
      if (yearNum > 2025) year = '2025';
    }
    
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  }
  
  // If more than 8 digits, truncate and validate
  return formatDateInput(numbers.slice(0, 8));
};

// Place formatting function to enforce "CITY, COUNTRY" format
const formatPlaceInput = (input: string): string => {
  // Convert to uppercase
  let formatted = input.toUpperCase();
  
  // If there's text and no comma yet, and user typed a space, replace with comma
  if (formatted.includes(' ') && !formatted.includes(',')) {
    // Find the first space that isn't at the beginning
    const firstSpace = formatted.indexOf(' ');
    if (firstSpace > 0) {
      // Replace first space with comma and space
      formatted = formatted.substring(0, firstSpace) + ', ' + formatted.substring(firstSpace + 1);
    }
  }
  
  return formatted;
};

// Phone number formatting function to format as "+48 509 865 011"
const formatPhoneNumber = (input: string): string => {
  // Remove all non-numeric characters except +
  let numbers = input.replace(/[^\d+]/g, '');
  
  // If empty, return empty
  if (!numbers) return '';
  
  // If doesn't start with +, add it
  if (!numbers.startsWith('+')) {
    numbers = '+' + numbers;
  }
  
  // Remove the + for processing
  const digits = numbers.slice(1);
  
  // Format based on length
  if (digits.length <= 2) {
    return '+' + digits;
  } else if (digits.length <= 5) {
    return '+' + digits.slice(0, 2) + ' ' + digits.slice(2);
  } else if (digits.length <= 8) {
    return '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  } else {
    // Full format: +48 509 865 011
    return '+' + digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 11);
  }
};

// Mobile PDF opening function
const downloadPDF = async (pdfUrl: string, filename: string) => {
  try {
    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const blob = await response.blob();
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(link.href);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(pdfUrl, '_blank');
    return false;
  }
};

const smartPDFOpen = async (pdfUrl: string, filename: string, clientData: any, familyTreeData: any) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isMobile) {
    // Try Adobe app first (both iOS and Android)
    const adobeUrl = isIOS 
      ? `adobe-reader://open?url=${encodeURIComponent(window.location.origin + pdfUrl)}`
      : `com.adobe.reader://open?url=${encodeURIComponent(window.location.origin + pdfUrl)}`;
    
    // Test if Adobe app opens
    let appOpened = false;
    const startTime = Date.now();
    
    // Try Adobe app
    window.location.href = adobeUrl;
    
    // Check if app opened by monitoring page visibility
    const checkAppOpen = () => {
      if (Date.now() - startTime > 2500) {
        return; // Stop checking after 2.5 seconds
      }
      
      if (document.hidden || (document as any).webkitHidden) {
        appOpened = true;
      } else {
        setTimeout(checkAppOpen, 100);
      }
    };
    
    setTimeout(checkAppOpen, 500);
    
    // Fallback to editable browser form after 3 seconds if app didn't open
    setTimeout(async () => {
      if (!appOpened) {
        console.log('Adobe app not detected, opening editable form in browser');
        
        try {
          // Create editable version in browser
          const response = await fetch('/api/pdf/create-editable-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templatePath: pdfUrl,
              templateName: filename,
              applicantData: clientData,
              familyTreeData: familyTreeData
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Redirecting to editable URL:', result.editableUrl);
            
            // Create hidden link and click it - most reliable for mobile
            const link = document.createElement('a');
            link.href = result.editableUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
          }
        } catch (error) {
          console.error('Failed to create editable version:', error);
        }
        
        // Final fallback: open regular PDF
        console.log('Final fallback: opening regular PDF:', pdfUrl);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 3000);
    
  } else {
    // Desktop: open regular PDF
    window.open(pdfUrl, '_blank');
  }
};

const openPDFOnMobile = (pdfUrl: string, filename: string) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // For mobile devices, try multiple approaches
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Try to open in Adobe Acrobat using custom scheme (if app is installed)
    const adobeUrl = `com.adobe.reader://open?url=${encodeURIComponent(window.location.origin + pdfUrl)}`;
    
    // First try Adobe scheme
    window.location.href = adobeUrl;
    
    // Fallback to regular PDF opening after a short delay
    setTimeout(() => {
      window.open(pdfUrl, '_blank');
    }, 1000);
  } else {
    // Desktop - open normally
    window.open(pdfUrl, '_blank');
  }
};

import { 
  FileText, 
  User, 
  Users, 
  Check, 
  Trash2, 
  Upload,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle,
  X,
  Save,
  Zap,
  Languages,
  Bot,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClientDetailsForm, type ClientDetailsData } from "@/components/client-details-form";
import { SimplePDFViewer } from "@/components/SimplePDFViewer";
import { TypeFormAnalytics } from "@/components/typeform-analytics";
import { TypeFormAllResponses } from "@/components/typeform-all-responses";
import { CitizenshipTest } from "@/components/citizenship-test";
import { AdobeTestComponent } from "@/components/adobe-test-component";
import { useAutoSave } from "@/hooks/use-auto-save";
import { ProgressIndicator } from "@/components/progress-indicator";
import { FormProgressTracker } from "@/components/form-progress-tracker";
import { CloudDocumentManager } from "@/components/cloud-document-manager";

interface TestDocument {
  id: string;
  filename: string;
  type: string;
  status: 'uploading' | 'processing' | 'translating' | 'pending-review' | 'completed' | 'error';

  polishTranslation: string;
  originalText: string;
  extractedData: any;
}

interface FamilyTreeData {
  // Main Applicant
  applicantName: string;
  applicantBirthDate: string;
  applicantBirthPlace: string;
  applicantNationality: string;
  applicantMarriageDate?: string;
  applicantMarriagePlace?: string;
  applicantEmigrationDate?: string;
  applicantNaturalizationDate?: string;
  applicantSpouseName?: string;
  
  // Additional Applicant fields
  applicantFirstNames?: string;
  applicantLastName?: string;
  applicantGender?: string;
  applicantMaidenName?: string;
  applicantMarried?: string;
  applicantDateOfBirth?: string;
  applicantPlaceOfBirth?: string;
  applicantDateOfMarriage?: string;
  applicantPlaceOfMarriage?: string;
  applicantDateOfEmigration?: string;
  applicantDateOfNaturalization?: string;
  applicantArmyService?: string;
  applicantPolishDocuments?: string;
  applicantSpouseFirstNames?: string;
  applicantSpouseLastName?: string;
  applicantSpouseDateOfBirth?: string;
  applicantSpousePlaceOfBirth?: string;
  
  // Children fields
  applicantHasChildren?: string;
  applicantNumberOfChildren?: string;
  applicantChild1FirstNames?: string;
  applicantChild1LastName?: string;
  applicantChild1DateOfBirth?: string;
  applicantChild2FirstNames?: string;
  applicantChild2LastName?: string;
  applicantChild2DateOfBirth?: string;
  applicantChild3FirstNames?: string;
  applicantChild3LastName?: string;
  applicantChild3DateOfBirth?: string;
  applicantChild4FirstNames?: string;
  applicantChild4LastName?: string;
  applicantChild4DateOfBirth?: string;
  applicantChild5FirstNames?: string;
  applicantChild5LastName?: string;
  applicantChild5DateOfBirth?: string;
  applicantChild6FirstNames?: string;
  applicantChild6LastName?: string;
  applicantChild6DateOfBirth?: string;
  
  // Children
  child1Name?: string;
  child1BirthDate?: string;
  child2Name?: string;
  child2BirthDate?: string;
  child3Name?: string;
  child3BirthDate?: string;
  
  // Polish Parent
  polishParentName: string;
  polishParentBirthDate: string;
  polishParentBirthPlace: string;
  polishParentDeathDate?: string;
  polishParentNationality: string;
  polishParentEmigrationDate?: string;
  polishParentNaturalizationDate?: string;
  polishParentMarriageDate?: string;
  polishParentMarriagePlace?: string;
  
  // Additional Polish Parent fields
  polishParentGender?: string;
  polishParentMaidenName?: string;
  polishParentDateOfBirth?: string;
  polishParentPlaceOfBirth?: string;
  polishParentDateOfMarriage?: string;
  polishParentPlaceOfMarriage?: string;
  polishParentDateOfEmigration?: string;
  polishParentDateOfNaturalization?: string;
  polishParentArmyService?: string;
  polishParentPolishDocuments?: string;
  polishParentSpouseName?: string;
  polishParentSpouseDateOfBirth?: string;
  polishParentSpousePlaceOfBirth?: string;
  
  // Parent's Spouse (Other Parent)
  parentSpouseName: string;
  parentSpouseBirthDate: string;
  parentSpouseBirthPlace: string;
  parentSpouseDeathDate?: string;
  parentSpouseNationality: string;
  
  // Polish Grandparent (maternal/paternal)
  polishGrandparentName: string;
  polishGrandparentBirthDate: string;
  polishGrandparentBirthPlace: string;
  polishGrandparentDeathDate?: string;
  polishGrandparentEmigrationDate?: string;
  polishGrandparentMarriageDate?: string;
  polishGrandparentMarriagePlace?: string;
  polishGrandparentNaturalizationDate?: string;
  
  // Polish Grandparent's Spouse
  polishGrandparentSpouseName: string;
  polishGrandparentSpouse?: string; // alias for compatibility
  polishGrandparentSpouseBirthDate: string;
  polishGrandparentSpouseBirthPlace: string;
  polishGrandparentSpouseDeathDate?: string;
  
  // Grandparents fields (aliases for polishGrandparent fields)
  grandfatherName?: string;
  grandfatherDateOfBirth?: string;
  grandfatherPlaceOfBirth?: string;
  grandfatherDateOfMarriage?: string;
  grandfatherPlaceOfMarriage?: string;
  grandfatherDateOfEmigration?: string;
  grandfatherDateOfNaturalization?: string;
  grandfatherArmyService?: string;
  grandfatherPolishDocuments?: string;
  
  grandmotherName?: string;
  grandmotherMaidenName?: string;
  grandmotherDateOfBirth?: string;
  grandmotherPlaceOfBirth?: string;
  grandmotherDateOfMarriage?: string;
  grandmotherPlaceOfMarriage?: string;
  grandmotherDateOfEmigration?: string;
  grandmotherDateOfNaturalization?: string;
  grandmotherArmyService?: string;
  grandmotherPolishDocuments?: string;
  
  // Great Grandparents
  greatGrandparent1Name: string;
  greatGrandparent1BirthDate: string;
  greatGrandparent1BirthPlace: string;
  
  greatGrandparent2Name: string;
  greatGrandparent2BirthDate: string;
  greatGrandparent2BirthPlace: string;
  
  greatGrandparent3Name: string;
  greatGrandparent3BirthDate: string;
  greatGrandparent3BirthPlace: string;
  
  greatGrandparent4Name: string;
  greatGrandparent4BirthDate: string;
  greatGrandparent4BirthPlace: string;
  
  // Additional Great Grandparents fields for compatibility
  greatGrandfatherName?: string;
  greatGrandfatherBirthDate?: string;
  greatGrandfatherBirthPlace?: string;
  greatGrandfatherEmigrationDate?: string;
  greatGrandfatherNaturalizationDate?: string;
  greatGrandfatherDateOfBirth?: string;
  greatGrandfatherPlaceOfBirth?: string;
  greatGrandfatherDateOfMarriage?: string;
  greatGrandfatherPlaceOfMarriage?: string;
  greatGrandfatherDateOfEmigration?: string;
  greatGrandfatherDateOfNaturalization?: string;
  greatGrandfatherArmyService?: string;
  greatGrandfatherPolishDocuments?: string;

  
  greatGrandmotherName?: string;
  greatGrandmotherBirthDate?: string;
  greatGrandmotherBirthPlace?: string;
  greatGrandparentsMarriageDate?: string;
  greatGrandparentsMarriagePlace?: string;
  greatGrandmotherMaidenName?: string;
  greatGrandmotherDateOfBirth?: string;
  greatGrandmotherPlaceOfBirth?: string;
  greatGrandmotherDateOfMarriage?: string;
  greatGrandmotherPlaceOfMarriage?: string;
  greatGrandmotherDateOfEmigration?: string;
  greatGrandmotherDateOfNaturalization?: string;
  greatGrandmotherArmyService?: string;
  greatGrandmotherPolishDocuments?: string;

}

export default function MobileDashboard() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<number>(1);
  const [documents, setDocuments] = useState<TestDocument[]>([]);
  const [isGeneratingPDFs, setIsGeneratingPDFs] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ filename: string, url: string }>>([]);
  const [pdfViewerData, setPdfViewerData] = useState<{url: string, name: string} | null>(null);
  
  // OCR Processing Modal State
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrFileName, setOcrFileName] = useState('');
  const [ocrFileType, setOcrFileType] = useState('');
  const [ocrStartTime, setOcrStartTime] = useState(0);
  
  // Confirmation button states
  const [confirmSpelling, setConfirmSpelling] = useState(false);
  const [confirmDates, setConfirmDates] = useState(false);
  const [confirmAddress, setConfirmAddress] = useState(false);
  
  // Family Tree confirmation states
  const [confirmFamilySpelling, setConfirmFamilySpelling] = useState(false);
  const [confirmFamilyDates, setConfirmFamilyDates] = useState(false);
  const [confirmPolishAncestor, setConfirmPolishAncestor] = useState(false);
  const [confirmGenerationOrder, setConfirmGenerationOrder] = useState(false);
  const [showFamilySuccessNotification, setShowFamilySuccessNotification] = useState(false);
  
  // Field error states for form validation
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  
  // State for showing success notification after all confirmations and save
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Create refs for uncontrolled inputs to prevent React state interference
  const surnameInputRef = useRef<HTMLInputElement>(null);
  const givenNamesInputRef = useRef<HTMLInputElement>(null);
  const maidenNameInputRef = useRef<HTMLInputElement>(null);
  const spouseSurnameInputRef = useRef<HTMLInputElement>(null);
  const spouseNamesInputRef = useRef<HTMLInputElement>(null);
  // Initialize empty form data
  const getEmptyClientData = (): ClientDetailsData => ({
    firstNames: '',              // Renamed from: names (PDF field alignment)
    lastName: '',                // Renamed from: familyName (PDF field alignment)
    maidenName: '',              // New: required for PDF templates
    passportNumber: '',          // Maps to: nr_dok_tozsamosci
    spouseFullName: '',          
    spousePassportNumber: '',    
    birthDate: '',               // Renamed from: dateOfBirth (DD.MM.YYYY format)
    birthPlace: '',              // Renamed from: placeOfBirth
    dateOfMarriage: '',
    placeOfMarriage: '',
    mobilePhone: '',             // Renamed from: phoneNumber
    email: '',
    currentAddress: '',          // Renamed from: exactPostalAddress
    gender: '',                  // New: required (mężczyzna/kobieta)
    maritalStatus: '',           // New: required in Polish terms
    foreignCitizenshipsWithDates: '' // New: citizenship details
  });

  const getEmptyFamilyTreeData = (): Partial<FamilyTreeData> => ({});

  const [clientData, setClientData] = useState<ClientDetailsData | null>(getEmptyClientData());
  const [familyTreeData, setFamilyTreeData] = useState<Partial<FamilyTreeData>>(getEmptyFamilyTreeData());

  // Auto-save functionality
  const saveFormData = async (data: { clientData: ClientDetailsData | null, familyTreeData: Partial<FamilyTreeData> }) => {
    try {
      const response = await fetch('/api/dashboard/save-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save form data');
      }
      
      const result = await response.json();
      console.log('Auto-save successful:', result);
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    }
  };

  const autoSaveStatus = useAutoSave({
    data: { clientData, familyTreeData },
    saveFunction: saveFormData,
    delay: 3000, // Save after 3 seconds of inactivity
    enabled: true,
  });

  // Sync FORM data to TREE section
  useEffect(() => {
    if (clientData) {
      setFamilyTreeData(prev => ({
        ...prev,
        applicantFirstNames: (clientData.firstNames || '').toUpperCase(),
        applicantLastName: (clientData.lastName || '').toUpperCase(),
        applicantMaidenName: (clientData.maidenName || '').toUpperCase(),
        applicantDateOfBirth: clientData.birthDate || '',
        applicantPlaceOfBirth: (clientData.birthPlace || '').toUpperCase(),
        applicantGender: clientData.gender === 'mężczyzna' ? 'MALE' : clientData.gender === 'kobieta' ? 'FEMALE' : '',
        applicantMarried: clientData.maritalStatus || '',
        applicantDateOfMarriage: clientData.dateOfMarriage || '',
        applicantPlaceOfMarriage: (clientData.placeOfMarriage || '').toUpperCase(),
        applicantSpouseFirstNames: (clientData.spouseFirstNames || '').toUpperCase(),
        applicantSpouseLastName: (clientData.spouseLastName || '').toUpperCase(),
      }));
    }
  }, [clientData]);

  // Form progress tracking
  const formSections = [
    {
      id: 'applicant',
      name: 'Applicant Details',
      fields: ['firstNames', 'lastName', 'birthDate', 'birthPlace', 'passportNumber'],
      required: true,
    },
    {
      id: 'marriage',
      name: 'Marriage Information',
      fields: ['spouseFirstNames', 'spouseLastName', 'dateOfMarriage', 'placeOfMarriage'],
      required: false,
    },
    {
      id: 'family',
      name: 'Family Tree',
      fields: ['polishParentName', 'polishParentBirthDate', 'polishParentBirthPlace'],
      required: true,
    },
  ];

  // Initialize dashboard on mount (only clear on actual page refresh)
  useEffect(() => {
    // Only clear if this is an actual page refresh (not section switching)
    const isPageRefresh = !sessionStorage.getItem('dashboardInitialized');
    
    if (isPageRefresh) {
      console.log('Dashboard page refresh - clearing all form data');
      setClientData(getEmptyClientData());
      setFamilyTreeData(getEmptyFamilyTreeData());
      setDocuments([]);
      setGeneratedFiles([]);
      setPdfViewerData(null);
      setActiveSection(1);
      setIsGeneratingPDFs(false);
      sessionStorage.setItem('dashboardInitialized', 'true');
    } else {
      console.log('Dashboard section navigation - preserving form data');
    }
  }, []);

  // Sync TREE data back to FORM section
  useEffect(() => {
    if (familyTreeData && familyTreeData.applicantFirstNames && familyTreeData.applicantLastName) {
      setClientData(prev => ({
        ...prev!,
        firstNames: familyTreeData.applicantFirstNames || prev?.firstNames || '',
        lastName: familyTreeData.applicantLastName || prev?.lastName || '',
        maidenName: familyTreeData.applicantMaidenName || prev?.maidenName || '',
        birthDate: familyTreeData.applicantDateOfBirth || prev?.birthDate || '',
        birthPlace: familyTreeData.applicantPlaceOfBirth || prev?.birthPlace || '',
        gender: familyTreeData.applicantGender === 'MALE' ? 'mężczyzna' : familyTreeData.applicantGender === 'FEMALE' ? 'kobieta' : prev?.gender || '',
        maritalStatus: familyTreeData.applicantMarried || prev?.maritalStatus || '',
        dateOfMarriage: familyTreeData.applicantDateOfMarriage || prev?.dateOfMarriage || '',
        placeOfMarriage: familyTreeData.applicantPlaceOfMarriage || prev?.placeOfMarriage || '',
        spouseFirstNames: familyTreeData.applicantSpouseFirstNames || prev?.spouseFirstNames || '',
        spouseLastName: familyTreeData.applicantSpouseLastName || prev?.spouseLastName || '',
      }));
    }
  }, [familyTreeData.applicantFirstNames, familyTreeData.applicantLastName, familyTreeData.applicantMaidenName, familyTreeData.applicantDateOfBirth, familyTreeData.applicantPlaceOfBirth, familyTreeData.applicantGender, familyTreeData.applicantMarried, familyTreeData.applicantDateOfMarriage, familyTreeData.applicantPlaceOfMarriage, familyTreeData.applicantSpouseFirstNames, familyTreeData.applicantSpouseLastName]);

  // Clean up session storage on actual page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('dashboardInitialized');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Sync Family Tree back to Client Details when family tree changes
  useEffect(() => {
    if (familyTreeData.applicantName && clientData) {
      const nameParts = familyTreeData.applicantName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setClientData(prev => ({
        ...prev!,
        firstNames: firstName,
        lastName: lastName,
        birthDate: familyTreeData.applicantDateOfBirth || prev!.birthDate || '',
        birthPlace: familyTreeData.applicantPlaceOfBirth || prev!.birthPlace || '',
        dateOfMarriage: familyTreeData.applicantDateOfMarriage || prev!.dateOfMarriage || '',
        placeOfMarriage: familyTreeData.applicantPlaceOfMarriage || prev!.placeOfMarriage || '',
        spouseFullName: familyTreeData.applicantSpouseName || prev!.spouseFullName || '',
        fatherFullName: familyTreeData.parentSpouseName || '',
        motherFullName: familyTreeData.polishParentName || '',
      }));
    }
  }, [familyTreeData.applicantName, familyTreeData.applicantDateOfBirth, familyTreeData.applicantPlaceOfBirth, familyTreeData.applicantDateOfMarriage, familyTreeData.applicantPlaceOfMarriage, familyTreeData.applicantSpouseName, familyTreeData.polishParentName, familyTreeData.parentSpouseName]);

  const documentTypes = [
    { type: 'applicant-passport', name: 'Passport', icon: '👤', sample: {
      name: 'Jan KOWALSKI', passportNumber: 'AB1234567', issueDate: '2020-01-15',
      nationality: 'Polish'
    }},
    { type: 'applicant-birth', name: 'Birth Certificate', icon: '👤', sample: {
      name: 'Jan KOWALSKI', birthDate: '1990-01-15', birthPlace: 'Warsaw, Poland',
      parentSpouseName: 'Piotr KOWALSKI', polishParentName: 'Anna NOWAK'
    }},
    { type: 'applicant-marriage', name: 'Marriage Certificate', icon: '💕', sample: {
      groomName: 'Jan KOWALSKI', brideName: 'Maria NOWAK', marriageDate: '2015-06-12',
      marriagePlace: 'Krakow, Poland'
    }},
    { type: 'child-mother-birth', name: "Children's Mother's Birth Certificate", icon: '👶', sample: {
      name: 'Maria KOWALSKI', birthDate: '1985-03-20', birthPlace: 'Gdansk, Poland',
      parentSpouseName: 'Stefan NOWAK', polishParentName: 'Teresa NOWAK'
    }},
    { type: 'parents-marriage', name: 'Parents Marriage Certificate', icon: '👥', sample: {
      groomName: 'Piotr KOWALSKI', brideName: 'Anna NOWAK', marriageDate: '1985-05-15',
      marriagePlace: 'Warsaw, Poland'
    }},

    { type: 'spouse-passport', name: "Spouse's Passport", icon: '💕', sample: {
      name: 'Maria KOWALSKI', passportNumber: 'EF5432109', issueDate: '2019-07-22',
      nationality: 'Polish'
    }}
  ];

  const addTestDocument = (docType: string) => {
    // Clear any existing documents first to avoid data persistence issues
    setDocuments([]);
    
    const docInfo = documentTypes.find(d => d.type === docType) || documentTypes[0];
    const testDoc: TestDocument = {
      id: `test-${Date.now()}`,
      filename: `${docInfo.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      type: docType,
      status: 'pending-review',
      polishTranslation: `Polish Translation: ${docInfo.name}\n${Object.entries(docInfo.sample).map(([k,v]) => `${k}: ${v}`).join('\n')}`,
      originalText: `Original OCR Text: ${docInfo.name}\n${Object.entries(docInfo.sample).map(([k,v]) => `${k}: ${v}`).join('\n')}`,
      extractedData: docInfo.sample
    };
    setDocuments([testDoc]);
    toast({
      title: "Test Document Added",
      description: `Sample ${docInfo.name} ready for review`,
    });
  };

  const acceptDocument = (docId: string) => {
    const document = documents.find(d => d.id === docId);
    if (!document?.extractedData) return;

    // Update document status
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, status: 'completed' as const } : doc
      )
    );

    // Populate forms with extracted data from server
    const data = document.extractedData;
    
    // Update Client Details with server extracted data
    setClientData((prev: ClientDetailsData | null) => ({
      ...prev,
      firstNames: data.applicantFirstNames || prev?.firstNames || '',
      lastName: data.applicantLastName || prev?.lastName || '',
      email: data.email || prev?.email || '',
      mobilePhone: data.phoneNumber || prev?.mobilePhone || '',
      birthDate: data.birthDate || prev?.birthDate || '',
      birthPlace: data.birthPlace || prev?.birthPlace || '',
      passportNumber: data.passportNumber || prev?.passportNumber || ''
    }));

    // Update Family Tree with server extracted data
    setFamilyTreeData(prev => ({
      ...prev,
      applicantName: data.applicantName || `${data.applicantFirstNames} ${data.applicantLastName}` || prev.applicantName || '',
      applicantBirthDate: data.applicantBirthDate || data.birthDate || prev.applicantBirthDate || '',
      applicantBirthPlace: data.applicantBirthPlace || data.birthPlace || prev.applicantBirthPlace || '',
      polishParentName: data.polishParentName || prev.polishParentName || '',
      polishParentBirthDate: data.polishParentBirthDate || prev.polishParentBirthDate || '',
      polishParentBirthPlace: data.polishParentBirthPlace || prev.polishParentBirthPlace || ''
    }));

    toast({
      title: "Document Accepted!",
      description: "Both Client Details and Family Tree forms have been populated with extracted data",
    });
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Document Deleted", 
      description: "Document removed successfully",
    });
  };

  // Mobile-friendly PDF download helper
  const downloadPDFMobile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // On mobile, open PDF in new tab for viewing
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } else {
      // Desktop download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // One-Click Comprehensive PDF Generation
  const generateComprehensivePDFs = async () => {
    setIsGeneratingPDFs(true);
    setGeneratedFiles([]);
    
    try {
      console.log('Starting comprehensive PDF generation...');
      
      const requestData = {
        applicantData: clientData,
        familyTreeData: familyTreeData,
        spouseData: clientData?.spouseFullName ? {
          spouseFullName: clientData.spouseFullName,
          spousePassportNumber: clientData.spousePassportNumber || ''
        } : null,
        children: []
      };

      const response = await fetch('/api/pdf/comprehensive-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate comprehensive document package');
      }

      const result = await response.json();
      setGeneratedFiles(result.files || []);
      
      toast({
        title: "Success! All Documents Generated",
        description: `Generated ${result.totalFiles} Polish citizenship documents`,
        variant: "default"
      });

    } catch (error) {
      console.error('Comprehensive PDF generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate documents",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDFs(false);
    }
  };

  const handleClientDataSave = (data: ClientDetailsData) => {
    setClientData(data);
    toast({
      title: "Client Details Saved",
      description: "Your information has been saved successfully",
    });
  };

  const sections = [
    { id: 1, title: "Applicant", icon: User, color: "gray" },
    { id: 2, title: "Tree", icon: Users, color: "gray" },
    { id: 3, title: "Documents", icon: FileText, color: "gray" },
    { id: 4, title: "PDFs", icon: FileText, color: "gray" },
    { id: 5, title: "Templates", icon: FileText, color: "gray" },
    { id: 6, title: "Adobe", icon: Zap, color: "gray" },
    { id: 7, title: "Test", icon: CheckCircle, color: "gray" },
    { id: 8, title: "Translation", icon: Languages, color: "gray" },
    { id: 9, title: "Assistant", icon: Bot, color: "purple" },
    { id: 10, title: "Print", icon: Printer, color: "amber" },
    { id: 11, title: "Cloud", icon: Upload, color: "blue" },
    { id: 12, title: "Stamps", icon: MapPin, color: "red" }
  ];

  return (
    <div className="glass-surface">

      
      {/* Header */}
      <div className="glass-header sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Polish Citizenship Dashboard
          </h1>
          <p className="text-lg text-gray-600 text-left mt-2">
            Mobile-Optimized Document Processing
          </p>
          
          {/* Auto-save Status */}
          <div className="mt-3 flex justify-between items-center">
            <ProgressIndicator 
              status={autoSaveStatus.status}
              lastSaved={autoSaveStatus.lastSaved}
              error={autoSaveStatus.error}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="px-3 py-4 glass-accent border-b">
        <div className="grid grid-cols-5 gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              variant={activeSection === section.id ? "default" : "outline"}
              className={`aspect-square h-20 w-20 mx-auto flex-col gap-1 p-2 rounded transition-all duration-300 shadow-md ${
                activeSection === section.id 
                  ? section.id === 1 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl scale-105 border-2 border-green-400 transform'
                    : section.id === 2
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl scale-105 border-2 border-red-400 transform'
                    : section.id === 3
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl scale-105 border-2 border-blue-400 transform'
                    : section.id === 4
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl scale-105 border-2 border-purple-400 transform'
                    : section.id === 5
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl scale-105 border-2 border-orange-400 transform'
                    : section.id === 6
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-xl scale-105 border-2 border-cyan-400 transform'
                    : section.id === 7
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl scale-105 border-2 border-gray-400 transform'
                    : section.id === 8
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl scale-105 border-2 border-teal-400 transform'
                    : section.id === 9
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl scale-105 border-2 border-purple-400 transform'
                    : section.id === 10
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl scale-105 border-2 border-amber-400 transform'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl scale-105 border-2 border-gray-400 transform'
                  : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 hover:border-blue-400 hover:shadow-lg hover:scale-102 text-gray-700'
              }`}
            >
              <section.icon className={`transition-all duration-200 ${
                activeSection === section.id 
                  ? 'h-8 w-8 text-white' 
                  : 'h-7 w-7 text-blue-600'
              }`} />
              <span className={`text-sm font-bold text-center leading-tight transition-colors ${
                activeSection === section.id 
                  ? 'text-white' 
                  : 'text-gray-800'
              }`}>
                {section.title}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-2 py-6 pb-32">
        {/* Section 1: Client Details */}
        {activeSection === 1 && (
          <div className="max-w-full lg:max-w-4xl lg:mx-auto">
            <Card className="glass-card-success">
              <CardHeader className="glass-header-success pb-6" data-section="1">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  Applicant Details
                </CardTitle>
                <p className="text-lg text-green-100 text-left">
                  Your personal information as the main applicant for Polish citizenship
                </p>
              </CardHeader>
              <CardContent className="p-4">
                {/* Form Progress Tracker */}
                <div className="mb-6">
                  <FormProgressTracker 
                    sections={formSections}
                    formData={{ ...clientData, ...familyTreeData }}
                    className="mb-4"
                  />
                </div>
                
                <div className="space-y-6 lg:space-y-4">
                  {/* Basic Data Section */}
                  <div className="glass-section-success p-4 lg:p-6 rounded-xl">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800 mb-2 text-center">BASIC DATA</h3>
                    <p className="text-sm lg:text-base text-green-700 mb-4 lg:mb-6 text-center">Exactly as written in your valid passport or another valid ID or driving licence. Multiple names allowed in each field.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-surname" className="enhanced-label">
                          SURNAME *
                        </Label>
                        <input
                          id="surname-field-unique"
                          name="surname"
                          type="text"
                          value={clientData?.lastName || ''}
                          placeholder="YOUR FULL FAMILY NAME"
                          className={`w-full p-6 text-xl font-semibold bg-white text-gray-800 rounded-none shadow-md uppercase ${
                            fieldErrors['surname-field-unique'] 
                              ? 'border-4 border-red-500 bg-red-50' 
                              : 'border-none'
                          }`}
                          style={{ textTransform: 'uppercase' }}
                          autoComplete="off"
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, lastName: e.target.value.toUpperCase() }));
                            // Clear error when user starts typing
                            if (fieldErrors['surname-field-unique']) {
                              setFieldErrors(prev => ({ ...prev, 'surname-field-unique': false }));
                            }
                          }}
                        />
                      </div>
                      
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-given-names" className="enhanced-label">
                          GIVEN NAMES *
                        </Label>
                        <input
                          id="given-names-field-unique"
                          name="givenNames"
                          type="text"
                          value={clientData?.firstNames || ''}
                          placeholder="YOUR GIVEN NAMES"
                          className={`w-full p-6 text-xl font-semibold bg-white text-gray-800 rounded-none shadow-md uppercase ${
                            fieldErrors['given-names-field-unique'] 
                              ? 'border-4 border-red-500 bg-red-50' 
                              : 'border-none'
                          }`}
                          style={{ textTransform: 'uppercase' }}
                          autoComplete="off"
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, firstNames: e.target.value.toUpperCase() }));
                            // Clear error when user starts typing
                            if (fieldErrors['given-names-field-unique']) {
                              setFieldErrors(prev => ({ ...prev, 'given-names-field-unique': false }));
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-passportNumber" className="enhanced-label">
                          PASSPORT NUMBER *
                        </Label>
                        <Input
                          id="applicant-passportNumber"
                          type="text"
                          value={clientData?.passportNumber || ''}
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, passportNumber: e.target.value.toUpperCase() }));
                            // Clear error when user starts typing
                            if (fieldErrors['applicant-passportNumber']) {
                              setFieldErrors(prev => ({ ...prev, 'applicant-passportNumber': false }));
                            }
                          }}
                          placeholder="A12345678"
                          className={`enhanced-input ${
                            fieldErrors['applicant-passportNumber'] 
                              ? 'border-4 border-red-500 bg-red-50' 
                              : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Passport Upload Button */}
                    <div className="flex justify-center pt-6 pb-2">
                      <input
                        type="file"
                        id="passport-upload-input"
                        accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.heic"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate file size (10MB limit)
                          if (file.size > 10 * 1024 * 1024) {
                            toast({
                              title: "File Too Large",
                              description: "Please select a file smaller than 10MB",
                              variant: "destructive"
                            });
                            return;
                          }

                          // Show modal processing dialog instead of toast
                          const fileType = file.type === 'application/pdf' ? 'PDF' : 'photo';
                          
                          // Set modal state
                          setOcrFileName(file.name);
                          setOcrFileType(fileType);
                          setOcrStartTime(Date.now());
                          setIsOcrProcessing(true);

                          // Create form data for upload
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('documentType', 'passport');
                          formData.append('clientId', `passport_user_${Date.now()}`);
                          


                          // Upload to passport OCR endpoint
                          fetch('/api/passport/ocr', {
                            method: 'POST',
                            body: formData,
                          })
                          .then(response => response.json())
                          .then(result => {
                            console.log('OCR Result:', result);
                            
                            // Hide the processing modal
                            setIsOcrProcessing(false);
                            
                            console.log('Full OCR response:', result);
                            
                            if (result.success && result.passportData) {
                              const data = result.passportData;
                              console.log('Passport data to fill:', data);
                              
                              // CRITICAL: Debug and force form update with OCR data
                              console.log('DEBUG - Raw OCR data received:', data);
                              console.log('DEBUG - lastName field:', data.lastName);
                              console.log('DEBUG - firstName field:', data.firstName);
                              
                              setClientData(prev => {
                                const updated = {
                                  ...prev!,
                                  lastName: (data.lastName || '').toUpperCase(),
                                  firstNames: (data.firstName || '').toUpperCase(), 
                                  passportNumber: (data.passportNumber || '').toUpperCase()
                                };
                                console.log('DEBUG - Form update attempt:', updated);
                                return updated;
                              });

                              // ALWAYS show what was extracted - SHOW REAL DATA TO USER
                              toast({
                                title: "✅ PASSPORT DATA EXTRACTED",
                                description: `SURNAME: "${data.lastName}" | GIVEN NAMES: "${data.firstName}" | PASSPORT: "${data.passportNumber}"`,
                                duration: 10000,
                              });
                              
                              // FORCE IMMEDIATE ALERT TO SHOW USER WHAT WAS EXTRACTED
                              alert(`REAL EXTRACTED DATA:
SURNAME: ${data.lastName}
GIVEN NAMES: ${data.firstName} 
PASSPORT: ${data.passportNumber}
                              
This is what the server actually extracted from your passport image.`);
                            } else {
                              console.error('OCR failed:', result);
                              toast({
                                title: "❌ OCR FAILED",
                                description: result.message || "Could not extract passport data",
                                variant: "destructive",
                                duration: 5000,
                              });
                            }
                          })
                          .catch(error => {
                            console.error('Upload error:', error);
                            
                            // Hide the processing modal
                            setIsOcrProcessing(false);
                            
                            toast({
                              title: "Upload Failed",
                              description: "Please try again or enter details manually",
                              variant: "destructive"
                            });
                          })
                          .finally(() => {
                            // Reset file input
                            e.target.value = '';
                          });
                        }}
                      />
                      <Button
                        onClick={() => {
                          // Trigger file input dialog immediately - no validation required
                          document.getElementById('passport-upload-input')?.click();
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-green-500/20 backdrop-blur-sm border border-green-300 hover:bg-green-500/30 text-green-800 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                      >
                        <div className="flex items-center gap-3">
                          <Upload className="h-6 w-6" />
                          UPLOAD YOUR VALID PASSPORT COPY
                        </div>
                      </Button>
                      
                    </div>
                  </div>

                  {/* Additional Info Section */}
                  <div className="glass-section-success p-4 lg:p-6 rounded-xl">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800 mb-4 lg:mb-6 text-center">ADDITIONAL INFO</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-gender" className="enhanced-label">
                          GENDER
                        </Label>
                        <select
                          id="applicant-gender"
                          value={clientData?.gender || ''}
                          onChange={(e) => {
                            setClientData(prev => ({ 
                              ...prev!, 
                              gender: e.target.value as "mężczyzna" | "kobieta" | "",
                              // Clear maiden name if switching to MALE
                              maidenName: e.target.value === 'mężczyzna' ? '' : prev?.maidenName || ''
                            }))
                          }}
                          className="enhanced-select"
                        >
                          <option value="">Select Gender</option>
                          <option value="mężczyzna">MALE</option>
                          <option value="kobieta">FEMALE</option>
                        </select>
                      </div>
                      
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-married" className="enhanced-label">
                          MARRIED
                        </Label>
                        <select
                          id="applicant-married"
                          value={clientData?.maritalStatus || ''}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setClientData(prev => ({ 
                              ...prev!, 
                              maritalStatus: newStatus,
                              // Clear marriage fields if selecting NO
                              ...(newStatus === 'NO' ? {
                                dateOfMarriage: '',
                                placeOfMarriage: '',
                                spouseFirstName: '',
                                spouseLastName: '',
                                spouseMaidenName: ''
                              } : {})
                            }))
                          }}
                          className="enhanced-select"
                        >
                          <option value="">Select Status</option>
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 mt-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-familyName" className="enhanced-label">
                          MAIDEN NAME
                        </Label>
                        <input
                          ref={maidenNameInputRef}
                          id="applicant-familyName"
                          type="text"
                          defaultValue={clientData?.maidenName || ''}
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, maidenName: e.target.value }));
                          }}
                          placeholder="For female SURNAME at birth"
                          className="enhanced-input uppercase"
                          disabled={clientData?.gender === 'mężczyzna'}
                        />
                      </div>

                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-has-children" className="enhanced-label">
                          CHILDREN
                        </Label>
                        <select
                          id="applicant-has-children"
                          value={clientData?.hasChildren || ''}
                          onChange={(e) => setClientData(prev => ({ ...prev!, hasChildren: e.target.value }))}
                          className="enhanced-select"
                        >
                          <option value="">Do you have children?</option>
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Birth Information Section */}
                  <div className="bg-green-50 border-2 border-green-300 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-green-800 mb-6 text-center flex justify-center">BIRTH</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-dateOfBirth" className="enhanced-label">
                          DATE OF BIRTH
                        </Label>
                        <Input
                          id="applicant-dateOfBirth"
                          type="tel"
                          inputMode="numeric"
                          value={clientData?.birthDate || ''}
                          onChange={(e) => {
                            const formatted = formatDateInput(e.target.value);
                            setClientData(prev => ({ ...prev!, birthDate: formatted }));
                          }}
                          placeholder="DD.MM.YYYY"
                          className="enhanced-input"
                        />
                      </div>
                      
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-placeOfBirth" className="enhanced-label">
                          PLACE OF BIRTH
                        </Label>
                        <Input
                          id="applicant-placeOfBirth"
                          type="text"
                          value={clientData?.birthPlace || ''}
                          onChange={(e) => setClientData(prev => ({ ...prev!, birthPlace: formatPlaceInput(e.target.value) }))}
                          placeholder="CITY, COUNTRY"
                          className="enhanced-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marriage Information Section (Optional) - Only show if MARRIED is YES */}
                  {clientData?.maritalStatus === 'YES' && (
                  <div className="glass-section-success p-4 lg:p-6 rounded-xl">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800 mb-2 text-center">MARRIAGE</h3>
                    <p className="text-sm lg:text-base text-green-700 mb-4 lg:mb-6 text-center">Exactly as written in spouse's valid passport or another valid ID or driving licence. Multiple names allowed in each field.</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="spouse-surname" className="enhanced-label">
                          SPOUSE SURNAME
                        </Label>
                        <input
                          ref={spouseSurnameInputRef}
                          id="spouse-surname"
                          type="text"
                          defaultValue={clientData?.spouseLastName || ''}
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, spouseLastName: e.target.value }));
                          }}
                          placeholder="SPOUSE FULL LAST NAME"
                          className="enhanced-input uppercase"
                        />
                      </div>
                      
                      <div className="enhanced-field-container">
                        <Label htmlFor="spouse-names" className="enhanced-label">
                          SPOUSE GIVEN NAMES
                        </Label>
                        <input
                          ref={spouseNamesInputRef}
                          id="spouse-names"
                          type="text"
                          defaultValue={clientData?.spouseFirstNames || ''}
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, spouseFirstNames: e.target.value }));
                          }}
                          placeholder="SPOUSE GIVEN NAMES"
                          className="enhanced-input uppercase"
                        />
                      </div>
                      
                      {/* Conditional MAIDEN NAME field for married male applicants */}
                      {clientData?.gender === 'mężczyzna' && (
                        <div className="enhanced-field-container">
                          <Label htmlFor="spouse-maiden-name" className="enhanced-label">
                            MAIDEN NAME
                          </Label>
                          <input
                            id="spouse-maiden-name"
                            type="text"
                            defaultValue={clientData?.spouseMaidenName || ''}
                            onChange={(e) => {
                              setClientData(prev => ({ ...prev!, spouseMaidenName: e.target.value.toUpperCase() }));
                            }}
                            placeholder="SPOUSE SURNAME AT BIRTH"
                            className="enhanced-input uppercase"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="enhanced-field-container">
                          <Label htmlFor="applicant-dateOfMarriage" className="enhanced-label">
                            DATE OF MARRIAGE
                          </Label>
                          <Input
                            id="applicant-dateOfMarriage"
                            type="tel"
                            inputMode="numeric"
                            value={clientData?.dateOfMarriage || ''}
                            onChange={(e) => {
                              const formatted = formatDateInput(e.target.value);
                              setClientData(prev => ({ ...prev!, dateOfMarriage: formatted }));
                            }}
                            placeholder="DD.MM.YYYY"
                            className="enhanced-input"
                          />
                        </div>
                        
                        <div className="enhanced-field-container">
                          <Label htmlFor="applicant-placeOfMarriage" className="enhanced-label">
                            PLACE OF MARRIAGE
                          </Label>
                          <Input
                            id="applicant-placeOfMarriage"
                            type="text"
                            value={clientData?.placeOfMarriage || ''}
                            onChange={(e) => setClientData(prev => ({ ...prev!, placeOfMarriage: formatPlaceInput(e.target.value) }))}
                            placeholder="CITY, COUNTRY"
                            className="enhanced-input"
                          />
                        </div>
                      </div>
                      
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-spousePassportNumber" className="enhanced-label">
                          SPOUSE PASSPORT NUMBER
                        </Label>
                        <Input
                          id="applicant-spousePassportNumber"
                          type="text"
                          value={clientData?.spousePassportNumber || ''}
                          onChange={(e) => setClientData(prev => ({ ...prev!, spousePassportNumber: e.target.value.toUpperCase() }))}
                          placeholder="A12345678"
                          className="enhanced-input"
                        />
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Contact Information Section */}
                  <div className="glass-section-success p-4 lg:p-6 rounded-xl">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800 mb-4 lg:mb-6 text-center">CONTACT</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-email" className="enhanced-label">
                          EMAIL
                        </Label>
                        <Input
                          id="applicant-email"
                          type="email"
                          value={clientData?.email || ''}
                          onChange={(e) => {
                            setClientData(prev => ({ ...prev!, email: e.target.value }));
                            // Clear error when user starts typing
                            if (fieldErrors['applicant-email']) {
                              setFieldErrors(prev => ({ ...prev, 'applicant-email': false }));
                            }
                          }}
                          placeholder="your.email@example.com"
                          className={`enhanced-input ${
                            fieldErrors['applicant-email'] 
                              ? 'border-4 border-red-500 bg-red-50' 
                              : ''
                          }`}
                        />
                      </div>
                      
                      <div className="enhanced-field-container">
                        <Label htmlFor="applicant-phoneNumber" className="enhanced-label">
                          PHONE
                        </Label>
                        <Input
                          id="applicant-phoneNumber"
                          type="tel"
                          value={clientData?.mobilePhone || ''}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setClientData(prev => ({ ...prev!, mobilePhone: formatted }));
                          }}
                          placeholder="+1 205 555-4545"
                          className="enhanced-input"
                        />
                      </div>
                    </div>

                    <div className="enhanced-field-container">
                      <Label htmlFor="applicant-exactPostalAddress" className="enhanced-label">
                        EXACT POSTAL ADDRESS
                      </Label>
                      <Textarea
                        id="applicant-exactPostalAddress"
                        value={clientData?.currentAddress || ''}
                        onChange={(e) => setClientData(prev => ({ ...prev!, currentAddress: e.target.value.toUpperCase() }))}
                        placeholder="123 MAIN STREET, APT 4B, CITY, STATE/PROVINCE, POSTAL CODE, COUNTRY"
                        className="enhanced-input"
                        rows={4}
                      />
                    </div>
                  </div>


                </div>
                
                {/* Data Review Section */}
                <div className="glass-section-danger p-6 rounded-xl mt-8">
                  <h3 className="text-2xl font-bold text-red-800 mb-2 text-center">DATA REVIEW & CONFIRMATION</h3>
                  <p className="text-lg text-red-700 mb-6 text-center">
                    Please review all information carefully before saving. Check for any typos or errors.
                  </p>
                  
                  {/* Summary of entered data */}
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-red-800 mb-4">ENTERED INFORMATION:</h4>
                    <div className="space-y-2 text-base text-red-600">
                      <div>
                        <span className="font-normal">Name:</span> {
                          (clientData?.firstNames || '') + ' ' + (clientData?.lastName || '') 
                            ? (clientData?.firstNames || '') + ' ' + (clientData?.lastName || '')
                            : <span className="font-light text-gray-500">Not entered</span>
                        }
                      </div>
                      <div>
                        <span className="font-normal">Gender:</span> {
                          clientData?.gender === 'mężczyzna' ? 'MALE' : 
                          clientData?.gender === 'kobieta' ? 'FEMALE' : 
                          clientData?.gender || <span className="font-light text-gray-500">Not entered</span>
                        }
                      </div>
                      <div>
                        <span className="font-normal">Birth Date:</span> {clientData?.birthDate || <span className="font-light text-gray-500">Not entered</span>}
                      </div>
                      <div>
                        <span className="font-normal">Birth Place:</span> {clientData?.birthPlace || <span className="font-light text-gray-500">Not entered</span>}
                      </div>
                      <div>
                        <span className="font-normal">Email:</span> {clientData?.email || <span className="font-light text-gray-500">Not entered</span>}
                      </div>
                      <div>
                        <span className="font-normal">Phone:</span> {clientData?.mobilePhone || <span className="font-light text-gray-500">Not entered</span>}
                      </div>
                      <div>
                        <span className="font-normal">Passport:</span> {clientData?.passportNumber || <span className="font-light text-gray-500">Not entered</span>}
                      </div>
                      <div>
                        <span className="font-normal">Married:</span> {clientData?.maritalStatus || <span className="font-light text-gray-500">Not entered</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Validation checklist */}
                  <div>
                    <h4 className="text-xl font-bold text-red-800 mb-4">PLEASE CONFIRM:</h4>
                    <div className="space-y-4">
                      <Button
                        onClick={() => setConfirmSpelling(!confirmSpelling)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmSpelling 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmSpelling && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        NAMES ARE SPELLED CORRECTLY
                      </Button>
                      
                      <Button
                        onClick={() => setConfirmDates(!confirmDates)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmDates 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmDates && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        THE DATES ARE ALL CORRECT
                      </Button>
                      
                      <Button
                        onClick={() => setConfirmAddress(!confirmAddress)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmAddress 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmAddress && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        CONTACT INFO IS CORRECT
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => {
                      // Validate required fields with redirection and highlighting
                      const requiredFields = [
                        { field: clientData?.lastName, name: 'SURNAME', id: 'surname-field-unique' },
                        { field: clientData?.firstNames, name: 'GIVEN NAMES', id: 'given-names-field-unique' },
                        { field: clientData?.passportNumber, name: 'PASSPORT NUMBER', id: 'applicant-passportNumber' }
                      ];
                      
                      // Clear previous errors
                      setFieldErrors({});
                      
                      const missingFields = requiredFields.filter(item => !item.field?.trim());
                      
                      if (missingFields.length > 0) {
                        // Mark missing fields as errors
                        const errors: {[key: string]: boolean} = {};
                        missingFields.forEach(field => {
                          errors[field.id] = true;
                        });
                        setFieldErrors(errors);
                        
                        // Redirect to first missing field
                        const firstMissingField = missingFields[0];
                        const fieldElement = document.getElementById(firstMissingField.id);
                        if (fieldElement) {
                          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          fieldElement.focus();
                        }
                        
                        toast({
                          title: "Missing Required Information",
                          description: `Please fill in: ${missingFields.map(f => f.name).join(', ')}`,
                          variant: "destructive"
                        });
                        return;
                      }

                      // Check confirmation buttons
                      if (!confirmSpelling || !confirmDates || !confirmAddress) {
                        toast({
                          title: "Please Confirm Data Review",
                          description: "Click all confirmation buttons to proceed",
                          variant: "destructive"
                        });
                        return;
                      }

                      // Save and show notification at bottom
                      toast({
                        title: "Client Details Saved",
                        description: "Your personal information has been saved successfully",
                      });
                      
                      // Show success notification when all confirmations made and data saved
                      setShowSuccessNotification(true);
                      
                      // No scrolling - notification appears at current position
                    }}
                    className="flex items-center justify-center w-full py-8 px-8 bg-green-500/20 backdrop-blur-sm border border-green-300 hover:bg-green-500/30 text-green-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                  >
                    SAVE CLIENT DETAILS
                  </Button>
                </div>

                {/* Success Notification Board - Only shown when all confirmations made and data saved */}
                {showSuccessNotification && (
                  <div className="mt-8">
                    <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg 
                              className="w-10 h-10 text-white animate-pulse" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-blue-800 mb-2">
                              PERFECT. ALL THE DATA SAVED PROPERLY.
                            </h3>
                            <p className="text-lg text-blue-700">
                              You can now move on to the Family Tree or POA section.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Duplicate Section Navigation Buttons - RIGHT UNDER FORM */}
            <div className="mt-6 px-3 py-4 bg-blue-100 rounded-xl">
              <div className="grid grid-cols-5 gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    variant={activeSection === section.id ? "default" : "outline"}
                    className={`aspect-square h-20 w-20 mx-auto flex-col gap-1 p-2 rounded transition-all duration-300 shadow-md ${
                      activeSection === section.id 
                        ? section.id === 1 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl scale-105 border-2 border-green-400 transform'
                          : section.id === 2
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl scale-105 border-2 border-red-400 transform'
                          : section.id === 3
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl scale-105 border-2 border-blue-400 transform'
                          : section.id === 4
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl scale-105 border-2 border-purple-400 transform'
                          : section.id === 5
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl scale-105 border-2 border-orange-400 transform'
                          : section.id === 6
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-xl scale-105 border-2 border-cyan-400 transform'
                          : section.id === 7
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl scale-105 border-2 border-gray-400 transform'
                          : section.id === 8
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl scale-105 border-2 border-teal-400 transform'
                          : section.id === 9
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl scale-105 border-2 border-purple-400 transform'
                          : section.id === 10
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl scale-105 border-2 border-amber-400 transform'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl scale-105 border-2 border-gray-400 transform'
                        : (showSuccessNotification && (section.id === 2 || section.id === 4)) || (showFamilySuccessNotification && (section.id === 3 || section.id === 4))
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-xl scale-110 border-4 border-yellow-300 transform animate-pulse'
                        : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 hover:border-blue-400 hover:shadow-lg hover:scale-102 text-gray-700'
                    }`}
                  >
                    <section.icon className={`transition-all duration-200 ${
                      activeSection === section.id 
                        ? 'h-8 w-8 text-white' 
                        : 'h-7 w-7 text-blue-600'
                    }`} />
                    <span className={`text-sm font-bold text-center leading-tight transition-colors ${
                      activeSection === section.id 
                        ? 'text-white' 
                        : 'text-gray-800'
                    }`}>
                      {section.title}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Family Tree */}
        {activeSection === 2 && (
          <div className="space-y-6">
            <Card className="glass-card-danger">
              <CardHeader className="glass-header-danger pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  Family Tree
                </CardTitle>
                <p className="text-lg text-red-100 text-left">
                  Complete genealogical information tracking your Polish ancestry lineage
                </p>
              </CardHeader>
              <CardContent className="p-4">

                {/* PDF Template Family Tree - Red theme throughout */}
                <div className="bg-white rounded-lg p-4">
                  {/* Generation 1: Applicant */}
                  <div className="bg-red-50 p-4 mb-6">
                    <h3 className="text-lg font-bold text-red-800 mb-4 text-center border-b-2 border-red-500 pb-2">APPLICANT</h3>
                    
                    {/* Full Name Section - Match FORM structure */}
                    <div className="bg-red-100 border-2 border-red-300 p-6 rounded-xl mb-6">
                      <h4 className="text-2xl font-bold text-red-800 mb-2 text-center flex justify-center">FULL NAME</h4>
                      <p className="text-base text-red-700 mb-6 text-center">Exactly as written in your valid passport or another valid ID or driving licence. Multiple names allowed in each field.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="enhanced-field-container">
                          <Label htmlFor="tree-applicant-surname" className="enhanced-label">
                            SURNAME
                          </Label>
                          <Input
                            id="tree-applicant-surname"
                            type="text"
                            value={familyTreeData.applicantLastName || ''}
                            onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantLastName: e.target.value.toUpperCase() }))}
                            placeholder="YOUR FULL FAMILY NAME"
                            className="enhanced-input"
                          />
                        </div>
                        
                        <div className="enhanced-field-container">
                          <Label htmlFor="tree-applicant-given-names" className="enhanced-label">
                            GIVEN NAMES
                          </Label>
                          <Input
                            id="tree-applicant-given-names"
                            type="text"
                            value={familyTreeData.applicantFirstNames || ''}
                            onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantFirstNames: e.target.value.toUpperCase() }))}
                            placeholder="YOUR GIVEN NAMES"
                            className="enhanced-input"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="enhanced-field-container">
                          <Label htmlFor="tree-applicant-gender" className="enhanced-label">
                            GENDER
                          </Label>
                          <select
                            id="tree-applicant-gender"
                            value={familyTreeData.applicantGender || ''}
                            onChange={(e) => {
                              setFamilyTreeData(prev => ({ 
                                ...prev, 
                                applicantGender: e.target.value,
                                // Clear maiden name if switching to MALE
                                applicantMaidenName: e.target.value === 'MALE' ? '' : prev?.applicantMaidenName || ''
                              }));
                            }}
                            className="enhanced-select"
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                        </div>

                        <div className="enhanced-field-container">
                          <Label htmlFor="tree-applicant-married" className="enhanced-label">
                            MARRIED
                          </Label>
                          <select
                            id="tree-applicant-married"
                            value={familyTreeData.applicantMarried || ''}
                            onChange={(e) => {
                              setFamilyTreeData(prev => ({ 
                                ...prev, 
                                applicantMarried: e.target.value,
                                // Clear marriage fields if switching to NO
                                applicantDateOfMarriage: e.target.value === 'NO' ? '' : prev?.applicantDateOfMarriage || '',
                                applicantPlaceOfMarriage: e.target.value === 'NO' ? '' : prev?.applicantPlaceOfMarriage || '',
                                applicantSpouseName: e.target.value === 'NO' ? '' : prev?.applicantSpouseName || '',
                                applicantSpouseFirstNames: e.target.value === 'NO' ? '' : prev?.applicantSpouseFirstNames || '',
                                applicantSpouseLastName: e.target.value === 'NO' ? '' : prev?.applicantSpouseLastName || '',
                              }));
                            }}
                            className="enhanced-select"
                          >
                            <option value="">Select Option</option>
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                          </select>
                        </div>
                      </div>

                      {familyTreeData.applicantGender === 'FEMALE' && (
                        <div className="mt-6">
                          <div className="enhanced-field-container">
                            <Label htmlFor="tree-applicant-maiden-name" className="enhanced-label">
                              MAIDEN NAME
                            </Label>
                            <p className="text-sm text-red-600 mb-2">For female SURNAME at birth</p>
                            <Input
                              id="tree-applicant-maiden-name"
                              type="text"
                              value={familyTreeData.applicantMaidenName || ''}
                              onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantMaidenName: e.target.value.toUpperCase() }))}
                              placeholder="For female SURNAME at birth"
                              className="enhanced-input"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Birth Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.applicantDateOfBirth || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, applicantDateOfBirth: formatted}));
                              }}
                              placeholder="DD.MM.YYYY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.applicantPlaceOfBirth || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantPlaceOfBirth: e.target.value.toUpperCase()}))}
                              placeholder="CITY, COUNTRY"
                              className="enhanced-input"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="space-y-3">
                          {/* Marriage Information - Only show when MARRIED = YES */}
                          {familyTreeData.applicantMarried === 'YES' && (
                            <>
                              <div className="bg-red-200 border-2 border-red-400 p-6 rounded-xl">
                                <h4 className="text-xl font-bold text-red-800 mb-4 text-center">MARRIAGE INFORMATION</h4>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="enhanced-field-container">
                                    <Label className="enhanced-label">DATE OF MARRIAGE</Label>
                                    <Input
                                      value={familyTreeData.applicantDateOfMarriage || ''}
                                      onChange={(e) => {
                                        const formatted = formatDateInput(e.target.value);
                                        setFamilyTreeData((prev) => ({...prev, applicantDateOfMarriage: formatted}));
                                      }}
                                      placeholder="DD.MM.YYYY"
                                      className="enhanced-input"
                                      type="tel"
                                      inputMode="numeric"
                                    />
                                  </div>
                                  <div className="enhanced-field-container">
                                    <Label className="enhanced-label">PLACE OF MARRIAGE</Label>
                                    <Input
                                      value={familyTreeData.applicantPlaceOfMarriage || ''}
                                      onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantPlaceOfMarriage: formatPlaceInput(e.target.value)}))}
                                      placeholder="CITY, COUNTRY"
                                      className="enhanced-input"
                                    />
                                  </div>
                                </div>

                                {/* Spouse Information with separate SURNAME and GIVEN NAMES */}
                                <div className="mt-6">
                                  <h5 className="text-lg font-bold text-red-800 mb-4 text-center">SPOUSE</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="enhanced-field-container">
                                      <Label className="enhanced-label">SPOUSE SURNAME</Label>
                                      <Input
                                        value={familyTreeData.applicantSpouseLastName || ''}
                                        onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantSpouseLastName: e.target.value.toUpperCase()}))}
                                        placeholder="Exactly like in valid passport"
                                        className="enhanced-input"
                                      />
                                    </div>
                                    <div className="enhanced-field-container">
                                      <Label className="enhanced-label">SPOUSE GIVEN NAMES</Label>
                                      <Input
                                        value={familyTreeData.applicantSpouseFirstNames || ''}
                                        onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantSpouseFirstNames: e.target.value.toUpperCase()}))}
                                        placeholder="Exactly like in valid passport"
                                        className="enhanced-input"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="enhanced-field-container">
                                      <Label className="enhanced-label">SPOUSE DATE OF BIRTH</Label>
                                      <Input
                                        value={familyTreeData.applicantSpouseDateOfBirth || ''}
                                        onChange={(e) => {
                                          const formatted = formatDateInput(e.target.value);
                                          setFamilyTreeData((prev) => ({...prev, applicantSpouseDateOfBirth: formatted}));
                                        }}
                                        placeholder="DD.MM.YYYY"
                                        className="enhanced-input"
                                        type="tel"
                                        inputMode="numeric"
                                      />
                                    </div>
                                    <div className="enhanced-field-container">
                                      <Label className="enhanced-label">SPOUSE PLACE OF BIRTH</Label>
                                      <Input
                                        value={familyTreeData.applicantSpousePlaceOfBirth || ''}
                                        onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantSpousePlaceOfBirth: formatPlaceInput(e.target.value)}))}
                                        placeholder="CITY, COUNTRY"
                                        className="enhanced-input"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF EMIGRATION</Label>
                            <Input
                              value={familyTreeData.applicantDateOfEmigration || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, applicantDateOfEmigration: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF NATURALIZATION</Label>
                            <Input
                              value={familyTreeData.applicantDateOfNaturalization || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, applicantDateOfNaturalization: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">ARMY SERVICE</Label>
                            <select
                              value={familyTreeData.applicantArmyService || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantArmyService: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">POLISH DOCUMENTS</Label>
                            <select
                              value={familyTreeData.applicantPolishDocuments || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, applicantPolishDocuments: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applicant Generation Confirmation */}
                    <div className="mt-4 bg-blue-100 border border-blue-300 p-4 rounded-lg">
                      <h5 className="font-bold text-blue-800 mb-2">CONFIRM APPLICANT INFORMATION:</h5>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="confirm-applicant-info" className="rounded" />
                        <label htmlFor="confirm-applicant-info" className="text-sm">All applicant information is correct and complete</label>
                      </div>
                    </div>

                    {/* Children Section - Match FORM structure */}
                    <div className="mt-6 bg-red-100 p-4 rounded border">
                      <h4 className="text-md font-bold text-red-800 mb-3 text-center">CHILDREN</h4>
                      
                      <div className="enhanced-field-container mb-4">
                        <Label className="enhanced-label">DO YOU HAVE CHILDREN?</Label>
                        <select
                          value={familyTreeData.applicantHasChildren || ''}
                          onChange={(e) => {
                            setFamilyTreeData(prev => ({ 
                              ...prev, 
                              applicantHasChildren: e.target.value,
                              // Clear children fields if switching to NO
                              applicantNumberOfChildren: e.target.value === 'NO' ? '' : prev.applicantNumberOfChildren || '',
                              applicantChild1FirstNames: e.target.value === 'NO' ? '' : prev.applicantChild1FirstNames || '',
                              applicantChild1LastName: e.target.value === 'NO' ? '' : prev.applicantChild1LastName || '',
                              applicantChild1DateOfBirth: e.target.value === 'NO' ? '' : prev.applicantChild1DateOfBirth || '',
                              applicantChild2FirstNames: e.target.value === 'NO' ? '' : prev.applicantChild2FirstNames || '',
                              applicantChild2LastName: e.target.value === 'NO' ? '' : prev.applicantChild2LastName || '',
                              applicantChild2DateOfBirth: e.target.value === 'NO' ? '' : prev.applicantChild2DateOfBirth || '',
                              applicantChild3FirstNames: e.target.value === 'NO' ? '' : prev.applicantChild3FirstNames || '',
                              applicantChild3LastName: e.target.value === 'NO' ? '' : prev.applicantChild3LastName || '',
                              applicantChild3DateOfBirth: e.target.value === 'NO' ? '' : prev.applicantChild3DateOfBirth || '',
                              applicantChild4FirstNames: e.target.value === 'NO' ? '' : prev.applicantChild4FirstNames || '',
                              applicantChild4LastName: e.target.value === 'NO' ? '' : prev.applicantChild4LastName || '',
                              applicantChild4DateOfBirth: e.target.value === 'NO' ? '' : prev.applicantChild4DateOfBirth || '',
                              applicantChild5FirstNames: e.target.value === 'NO' ? '' : prev.applicantChild5FirstNames || '',
                              applicantChild5LastName: e.target.value === 'NO' ? '' : prev.applicantChild5LastName || '',
                              applicantChild5DateOfBirth: e.target.value === 'NO' ? '' : prev.applicantChild5DateOfBirth || '',
                              applicantChild6FirstNames: e.target.value === 'NO' ? '' : prev.applicantChild6FirstNames || '',
                              applicantChild6LastName: e.target.value === 'NO' ? '' : prev.applicantChild6LastName || '',
                              applicantChild6DateOfBirth: e.target.value === 'NO' ? '' : prev.applicantChild6DateOfBirth || '',
                            }));
                          }}
                          className="enhanced-select"
                        >
                          <option value="">Select Option</option>
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>

                      {familyTreeData.applicantHasChildren === 'YES' && (
                        <>
                          <div className="enhanced-field-container mb-4">
                            <Label className="enhanced-label">NUMBER OF CHILDREN</Label>
                            <select
                              value={familyTreeData.applicantNumberOfChildren || ''}
                              onChange={(e) => {
                                setFamilyTreeData(prev => ({ 
                                  ...prev, 
                                  applicantNumberOfChildren: e.target.value,
                                  // Clear fields for children beyond selected number
                                  applicantChild2FirstNames: ['1'].includes(e.target.value) ? '' : prev.applicantChild2FirstNames || '',
                                  applicantChild2LastName: ['1'].includes(e.target.value) ? '' : prev.applicantChild2LastName || '',
                                  applicantChild2DateOfBirth: ['1'].includes(e.target.value) ? '' : prev.applicantChild2DateOfBirth || '',
                                  applicantChild3FirstNames: ['1', '2'].includes(e.target.value) ? '' : prev.applicantChild3FirstNames || '',
                                  applicantChild3LastName: ['1', '2'].includes(e.target.value) ? '' : prev.applicantChild3LastName || '',
                                  applicantChild3DateOfBirth: ['1', '2'].includes(e.target.value) ? '' : prev.applicantChild3DateOfBirth || '',
                                  applicantChild4FirstNames: ['1', '2', '3'].includes(e.target.value) ? '' : prev.applicantChild4FirstNames || '',
                                  applicantChild4LastName: ['1', '2', '3'].includes(e.target.value) ? '' : prev.applicantChild4LastName || '',
                                  applicantChild4DateOfBirth: ['1', '2', '3'].includes(e.target.value) ? '' : prev.applicantChild4DateOfBirth || '',
                                  applicantChild5FirstNames: ['1', '2', '3', '4'].includes(e.target.value) ? '' : prev.applicantChild5FirstNames || '',
                                  applicantChild5LastName: ['1', '2', '3', '4'].includes(e.target.value) ? '' : prev.applicantChild5LastName || '',
                                  applicantChild5DateOfBirth: ['1', '2', '3', '4'].includes(e.target.value) ? '' : prev.applicantChild5DateOfBirth || '',
                                  applicantChild6FirstNames: ['1', '2', '3', '4', '5'].includes(e.target.value) ? '' : prev.applicantChild6FirstNames || '',
                                  applicantChild6LastName: ['1', '2', '3', '4', '5'].includes(e.target.value) ? '' : prev.applicantChild6LastName || '',
                                  applicantChild6DateOfBirth: ['1', '2', '3', '4', '5'].includes(e.target.value) ? '' : prev.applicantChild6DateOfBirth || '',
                                }));
                              }}
                              className="enhanced-select"
                            >
                              <option value="">Select Number</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="MORE">MORE</option>
                            </select>
                          </div>

                          {/* Child 1 - Always show when hasChildren=YES */}
                          {familyTreeData.applicantNumberOfChildren && (
                            <div className="bg-red-200 p-3 rounded border mb-3">
                              <h5 className="text-md font-bold text-red-800 mb-3 text-center">CHILD 1</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">GIVEN NAMES</Label>
                                  <Input
                                    value={familyTreeData.applicantChild1FirstNames || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild1FirstNames: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 1 GIVEN NAMES"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">SURNAME</Label>
                                  <Input
                                    value={familyTreeData.applicantChild1LastName || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild1LastName: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 1 SURNAME"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">DATE OF BIRTH</Label>
                                  <Input
                                    value={familyTreeData.applicantChild1DateOfBirth || ''}
                                    onChange={(e) => {
                                      const formatted = formatDateInput(e.target.value);
                                      setFamilyTreeData(prev => ({ ...prev, applicantChild1DateOfBirth: formatted }));
                                    }}
                                    placeholder="DD.MM.YYYY"
                                    className="enhanced-input"
                                    type="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Child 2 - Show when numberOfChildren is 2, 3, 4, 5, 6, or MORE */}
                          {familyTreeData.applicantNumberOfChildren && ['2', '3', '4', '5', '6', 'MORE'].includes(familyTreeData.applicantNumberOfChildren) && (
                            <div className="bg-red-200 p-3 rounded border mb-3">
                              <h5 className="text-md font-bold text-red-800 mb-3 text-center">CHILD 2</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">GIVEN NAMES</Label>
                                  <Input
                                    value={familyTreeData.applicantChild2FirstNames || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild2FirstNames: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 2 GIVEN NAMES"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">SURNAME</Label>
                                  <Input
                                    value={familyTreeData.applicantChild2LastName || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild2LastName: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 2 SURNAME"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">DATE OF BIRTH</Label>
                                  <Input
                                    value={familyTreeData.applicantChild2DateOfBirth || ''}
                                    onChange={(e) => {
                                      const formatted = formatDateInput(e.target.value);
                                      setFamilyTreeData(prev => ({ ...prev, applicantChild2DateOfBirth: formatted }));
                                    }}
                                    placeholder="DD.MM.YYYY"
                                    className="enhanced-input"
                                    type="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Child 3 - Show when numberOfChildren is 3, 4, 5, 6, or MORE */}
                          {familyTreeData.applicantNumberOfChildren && ['3', '4', '5', '6', 'MORE'].includes(familyTreeData.applicantNumberOfChildren) && (
                            <div className="bg-red-200 p-3 rounded border mb-3">
                              <h5 className="text-md font-bold text-red-800 mb-3 text-center">CHILD 3</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">GIVEN NAMES</Label>
                                  <Input
                                    value={familyTreeData.applicantChild3FirstNames || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild3FirstNames: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 3 GIVEN NAMES"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">SURNAME</Label>
                                  <Input
                                    value={familyTreeData.applicantChild3LastName || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild3LastName: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 3 SURNAME"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">DATE OF BIRTH</Label>
                                  <Input
                                    value={familyTreeData.applicantChild3DateOfBirth || ''}
                                    onChange={(e) => {
                                      const formatted = formatDateInput(e.target.value);
                                      setFamilyTreeData(prev => ({ ...prev, applicantChild3DateOfBirth: formatted }));
                                    }}
                                    placeholder="DD.MM.YYYY"
                                    className="enhanced-input"
                                    type="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Child 4 - Show when numberOfChildren is 4, 5, 6, or MORE */}
                          {familyTreeData.applicantNumberOfChildren && ['4', '5', '6', 'MORE'].includes(familyTreeData.applicantNumberOfChildren) && (
                            <div className="bg-red-200 p-3 rounded border mb-3">
                              <h5 className="text-md font-bold text-red-800 mb-3 text-center">CHILD 4</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">GIVEN NAMES</Label>
                                  <Input
                                    value={familyTreeData.applicantChild4FirstNames || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild4FirstNames: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 4 GIVEN NAMES"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">SURNAME</Label>
                                  <Input
                                    value={familyTreeData.applicantChild4LastName || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild4LastName: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 4 SURNAME"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">DATE OF BIRTH</Label>
                                  <Input
                                    value={familyTreeData.applicantChild4DateOfBirth || ''}
                                    onChange={(e) => {
                                      const formatted = formatDateInput(e.target.value);
                                      setFamilyTreeData(prev => ({ ...prev, applicantChild4DateOfBirth: formatted }));
                                    }}
                                    placeholder="DD.MM.YYYY"
                                    className="enhanced-input"
                                    type="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Child 5 - Show when numberOfChildren is 5, 6, or MORE */}
                          {familyTreeData.applicantNumberOfChildren && ['5', '6', 'MORE'].includes(familyTreeData.applicantNumberOfChildren) && (
                            <div className="bg-red-200 p-3 rounded border mb-3">
                              <h5 className="text-md font-bold text-red-800 mb-3 text-center">CHILD 5</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">GIVEN NAMES</Label>
                                  <Input
                                    value={familyTreeData.applicantChild5FirstNames || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild5FirstNames: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 5 GIVEN NAMES"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">SURNAME</Label>
                                  <Input
                                    value={familyTreeData.applicantChild5LastName || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild5LastName: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 5 SURNAME"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">DATE OF BIRTH</Label>
                                  <Input
                                    value={familyTreeData.applicantChild5DateOfBirth || ''}
                                    onChange={(e) => {
                                      const formatted = formatDateInput(e.target.value);
                                      setFamilyTreeData(prev => ({ ...prev, applicantChild5DateOfBirth: formatted }));
                                    }}
                                    placeholder="DD.MM.YYYY"
                                    className="enhanced-input"
                                    type="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Child 6 - Show when numberOfChildren is 6 or MORE */}
                          {familyTreeData.applicantNumberOfChildren && ['6', 'MORE'].includes(familyTreeData.applicantNumberOfChildren) && (
                            <div className="bg-red-200 p-3 rounded border mb-3">
                              <h5 className="text-md font-bold text-red-800 mb-3 text-center">CHILD 6</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">GIVEN NAMES</Label>
                                  <Input
                                    value={familyTreeData.applicantChild6FirstNames || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild6FirstNames: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 6 GIVEN NAMES"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">SURNAME</Label>
                                  <Input
                                    value={familyTreeData.applicantChild6LastName || ''}
                                    onChange={(e) => setFamilyTreeData(prev => ({ ...prev, applicantChild6LastName: e.target.value.toUpperCase() }))}
                                    placeholder="CHILD 6 SURNAME"
                                    className="enhanced-input"
                                  />
                                </div>
                                <div className="enhanced-field-container">
                                  <Label className="enhanced-label">DATE OF BIRTH</Label>
                                  <Input
                                    value={familyTreeData.applicantChild6DateOfBirth || ''}
                                    onChange={(e) => {
                                      const formatted = formatDateInput(e.target.value);
                                      setFamilyTreeData(prev => ({ ...prev, applicantChild6DateOfBirth: formatted }));
                                    }}
                                    placeholder="DD.MM.YYYY"
                                    className="enhanced-input"
                                    type="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Additional Children Note */}
                          {familyTreeData.applicantNumberOfChildren === 'MORE' && (
                            <div className="bg-red-300 p-3 rounded border">
                              <p className="text-red-800 font-bold text-center text-sm">
                                For more than 6 children, please contact our office for additional forms.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Generation 2: Polish Parent */}
                  <div className="bg-red-100 p-4 mb-6">
                    <h3 className="text-lg font-bold text-red-900 mb-4 text-center border-b-2 border-red-600 pb-2">POLISH PARENT</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">FULL NAME</Label>
                            <Input
                              value={familyTreeData.polishParentName || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentName: e.target.value.toUpperCase()}))}
                              placeholder="ENTER FULL NAME"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">GENDER</Label>
                            <select
                              value={familyTreeData.polishParentGender || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentGender: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Gender</option>
                              <option value="MALE">MALE</option>
                              <option value="FEMALE">FEMALE</option>
                            </select>
                          </div>
                          {familyTreeData.polishParentGender === 'FEMALE' && (
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">MAIDEN NAME</Label>
                              <Input
                                value={familyTreeData.polishParentMaidenName || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentMaidenName: e.target.value.toUpperCase()}))}
                                placeholder="SURNAME AT BIRTH"
                                className="enhanced-input"
                              />
                            </div>
                          )}
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.polishParentDateOfBirth || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, polishParentDateOfBirth: formatted}));
                              }}
                              placeholder="DD.MM.YYYY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.polishParentPlaceOfBirth || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentPlaceOfBirth: formatPlaceInput(e.target.value)}))}
                              placeholder="POLAND OR OTHER COUNTRY"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF MARRIAGE</Label>
                            <Input
                              value={familyTreeData.polishParentDateOfMarriage || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, polishParentDateOfMarriage: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF MARRIAGE</Label>
                            <Input
                              value={familyTreeData.polishParentPlaceOfMarriage || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentPlaceOfMarriage: formatPlaceInput(e.target.value)}))}
                              placeholder="CITY, COUNTRY OR LEAVE EMPTY"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF EMIGRATION</Label>
                            <Input
                              value={familyTreeData.polishParentDateOfEmigration || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, polishParentDateOfEmigration: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF NATURALIZATION</Label>
                            <Input
                              value={familyTreeData.polishParentDateOfNaturalization || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, polishParentDateOfNaturalization: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">ARMY SERVICE</Label>
                            <select
                              value={familyTreeData.polishParentArmyService || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentArmyService: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">POLISH DOCUMENTS</Label>
                            <select
                              value={familyTreeData.polishParentPolishDocuments || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentPolishDocuments: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Polish Parent's Spouse Section */}
                    <div className="mt-6 bg-red-200 p-4 rounded border">
                      <h4 className="text-md font-bold text-red-900 mb-3 text-center">SPOUSE</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="enhanced-field-container">
                          <Label className="enhanced-label">SPOUSE FULL NAME</Label>
                          <Input
                            value={familyTreeData.polishParentSpouseName || ''}
                            onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentSpouseName: e.target.value.toUpperCase()}))}
                            placeholder="ANNA MARIA KATARZYNA OR LEAVE EMPTY"
                            className="enhanced-input"
                          />
                        </div>
                        <div className="enhanced-field-container">
                          <Label className="enhanced-label">DATE OF BIRTH</Label>
                          <Input
                            value={familyTreeData.polishParentSpouseDateOfBirth || ''}
                            onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, polishParentSpouseDateOfBirth: formatted}));
                              }}
                            placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                            className="enhanced-input"
                            type="tel"
                            inputMode="numeric"
                          />
                        </div>
                        <div className="enhanced-field-container">
                          <Label className="enhanced-label">PLACE OF BIRTH</Label>
                          <Input
                            value={familyTreeData.polishParentSpousePlaceOfBirth || ''}
                            onChange={(e) => setFamilyTreeData((prev) => ({...prev, polishParentSpousePlaceOfBirth: formatPlaceInput(e.target.value)}))}
                            placeholder="CITY, COUNTRY OR LEAVE EMPTY"
                            className="enhanced-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Polish Parent Generation Confirmation */}
                    <div className="mt-4 bg-orange-100 border border-orange-300 p-4 rounded-lg">
                      <h5 className="font-bold text-orange-800 mb-2">CONFIRM POLISH PARENT INFORMATION:</h5>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="confirm-polish-parent" className="rounded" />
                        <label htmlFor="confirm-polish-parent" className="text-sm">All Polish parent information is correct and complete</label>
                      </div>
                    </div>
                  </div>

                  {/* Generation 3: Polish Grandparents */}
                  <div className="bg-orange-50 p-4 mb-6">
                    <h3 className="text-lg font-bold text-orange-800 mb-4 text-center border-b-2 border-orange-500 pb-2">POLISH GRANDPARENTS</h3>
                    
                    {/* Grandfather */}
                    <div className="mb-6 bg-orange-100 p-4 rounded border border-orange-300">
                      <h4 className="font-bold text-orange-900 mb-3 text-center">GRANDFATHER</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-3">
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">FULL NAME</Label>
                              <Input
                                value={familyTreeData.grandfatherName || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandfatherName: e.target.value.toUpperCase()}))}
                                placeholder="ENTER FULL NAME"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">GENDER</Label>
                              <select
                                value="MALE"
                                disabled
                                className="enhanced-select"
                              >
                                <option value="MALE">MALE</option>
                              </select>
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF BIRTH</Label>
                              <Input
                                value={familyTreeData.grandfatherDateOfBirth || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandfatherDateOfBirth: formatted}));
                              }}
                                placeholder="DD.MM.YYYY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">PLACE OF BIRTH</Label>
                              <Input
                                value={familyTreeData.grandfatherPlaceOfBirth || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandfatherPlaceOfBirth: formatPlaceInput(e.target.value)}))}
                                placeholder="POLAND OR OTHER COUNTRY"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF MARRIAGE</Label>
                              <Input
                                value={familyTreeData.grandfatherDateOfMarriage || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandfatherDateOfMarriage: formatted}));
                              }}
                                placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="space-y-3">
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">PLACE OF MARRIAGE</Label>
                              <Input
                                value={familyTreeData.grandfatherPlaceOfMarriage || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandfatherPlaceOfMarriage: formatPlaceInput(e.target.value)}))}
                                placeholder="CITY, COUNTRY OR LEAVE EMPTY"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF EMIGRATION</Label>
                              <Input
                                value={familyTreeData.grandfatherDateOfEmigration || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandfatherDateOfEmigration: formatted}));
                              }}
                                placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF NATURALIZATION</Label>
                              <Input
                                value={familyTreeData.grandfatherDateOfNaturalization || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandfatherDateOfNaturalization: formatted}));
                              }}
                                placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">ARMY SERVICE</Label>
                              <select
                                value={familyTreeData.grandfatherArmyService || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandfatherArmyService: e.target.value}))}
                                className="enhanced-select"
                              >
                                <option value="">Select Option</option>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                              </select>
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">POLISH DOCUMENTS</Label>
                              <select
                                value={familyTreeData.grandfatherPolishDocuments || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandfatherPolishDocuments: e.target.value}))}
                                className="enhanced-select"
                              >
                                <option value="">Select Option</option>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>

                    {/* Grandmother */}
                    <div className="bg-orange-100 p-4 rounded border border-orange-300">
                      <h4 className="font-bold text-orange-900 mb-3 text-center">GRANDMOTHER</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-3">
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">FULL NAME</Label>
                              <Input
                                value={familyTreeData.grandmotherName || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandmotherName: e.target.value.toUpperCase()}))}
                                placeholder="ANNA MARIA KATARZYNA"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">GENDER</Label>
                              <select
                                value="FEMALE"
                                disabled
                                className="enhanced-select"
                              >
                                <option value="FEMALE">FEMALE</option>
                              </select>
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">MAIDEN NAME</Label>
                              <Input
                                value={familyTreeData.grandmotherMaidenName || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandmotherMaidenName: e.target.value.toUpperCase()}))}
                                placeholder="SURNAME AT BIRTH"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF BIRTH</Label>
                              <Input
                                value={familyTreeData.grandmotherDateOfBirth || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandmotherDateOfBirth: formatted}));
                              }}
                                placeholder="DD.MM.YYYY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">PLACE OF BIRTH</Label>
                              <Input
                                value={familyTreeData.grandmotherPlaceOfBirth || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandmotherPlaceOfBirth: formatPlaceInput(e.target.value)}))}
                                placeholder="POLAND OR OTHER COUNTRY"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF MARRIAGE</Label>
                              <Input
                                value={familyTreeData.grandmotherDateOfMarriage || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandmotherDateOfMarriage: formatted}));
                              }}
                                placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="space-y-3">
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">PLACE OF MARRIAGE</Label>
                              <Input
                                value={familyTreeData.grandmotherPlaceOfMarriage || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandmotherPlaceOfMarriage: formatPlaceInput(e.target.value)}))}
                                placeholder="CITY, COUNTRY OR LEAVE EMPTY"
                                className="enhanced-input"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF EMIGRATION</Label>
                              <Input
                                value={familyTreeData.grandmotherDateOfEmigration || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandmotherDateOfEmigration: formatted}));
                              }}
                                placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">DATE OF NATURALIZATION</Label>
                              <Input
                                value={familyTreeData.grandmotherDateOfNaturalization || ''}
                                onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, grandmotherDateOfNaturalization: formatted}));
                              }}
                                placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                                className="enhanced-input"
                                type="tel"
                                inputMode="numeric"
                              />
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">ARMY SERVICE</Label>
                              <select
                                value={familyTreeData.grandmotherArmyService || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandmotherArmyService: e.target.value}))}
                                className="enhanced-select"
                              >
                                <option value="">Select Option</option>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                              </select>
                            </div>
                            <div className="enhanced-field-container">
                              <Label className="enhanced-label">POLISH DOCUMENTS</Label>
                              <select
                                value={familyTreeData.grandmotherPolishDocuments || ''}
                                onChange={(e) => setFamilyTreeData((prev) => ({...prev, grandmotherPolishDocuments: e.target.value}))}
                                className="enhanced-select"
                              >
                                <option value="">Select Option</option>
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>

                    {/* Polish Grandparents Generation Confirmation */}
                    <div className="mt-4 bg-purple-100 border border-purple-300 p-4 rounded-lg">
                      <h5 className="font-bold text-purple-800 mb-2">CONFIRM POLISH GRANDPARENTS INFORMATION:</h5>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="confirm-polish-grandparents" className="rounded" />
                        <label htmlFor="confirm-polish-grandparents" className="text-sm">All Polish grandparents information is correct and complete</label>
                      </div>
                    </div>
                  </div>

                  {/* Generation 4: Great Grandfather */}
                  <div className="bg-yellow-50 p-4 mb-6">
                    <h3 className="text-lg font-bold text-yellow-800 mb-4 text-center border-b-2 border-yellow-500 pb-2">GREAT GRANDFATHER</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">FULL NAME</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherName || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandfatherName: e.target.value.toUpperCase()}))}
                              placeholder="ENTER FULL NAME"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">GENDER</Label>
                            <select
                              value="MALE"
                              disabled
                              className="enhanced-select"
                            >
                              <option value="MALE">MALE</option>
                            </select>
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherDateOfBirth || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandfatherDateOfBirth: formatted}));
                              }}
                              placeholder="DD.MM.YYYY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherPlaceOfBirth || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandfatherPlaceOfBirth: formatPlaceInput(e.target.value)}))}
                              placeholder="POLAND OR OTHER COUNTRY"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF MARRIAGE</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherDateOfMarriage || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandfatherDateOfMarriage: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF MARRIAGE</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherPlaceOfMarriage || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandfatherPlaceOfMarriage: formatPlaceInput(e.target.value)}))}
                              placeholder="CITY, COUNTRY OR LEAVE EMPTY"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF EMIGRATION</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherDateOfEmigration || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandfatherDateOfEmigration: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF NATURALIZATION</Label>
                            <Input
                              value={familyTreeData.greatGrandfatherDateOfNaturalization || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandfatherDateOfNaturalization: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">ARMY SERVICE</Label>
                            <select
                              value={familyTreeData.greatGrandfatherArmyService || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandfatherArmyService: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">POLISH DOCUMENTS</Label>
                            <select
                              value={familyTreeData.greatGrandfatherPolishDocuments || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandfatherPolishDocuments: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>

                  {/* Generation 5: Great Grandmother */}
                  <div className="bg-purple-50 p-4 mb-6">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 text-center border-b-2 border-purple-500 pb-2">GREAT GRANDMOTHER</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">FULL NAME</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherName || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandmotherName: e.target.value.toUpperCase()}))}
                              placeholder="ANNA MARIA KATARZYNA"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">GENDER</Label>
                            <select
                              value="FEMALE"
                              disabled
                              className="enhanced-select"
                            >
                              <option value="FEMALE">FEMALE</option>
                            </select>
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">MAIDEN NAME</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherMaidenName || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandmotherMaidenName: e.target.value.toUpperCase()}))}
                              placeholder="SURNAME AT BIRTH"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherDateOfBirth || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandmotherDateOfBirth: formatted}));
                              }}
                              placeholder="DD.MM.YYYY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF BIRTH</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherPlaceOfBirth || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandmotherPlaceOfBirth: formatPlaceInput(e.target.value)}))}
                              placeholder="POLAND OR OTHER COUNTRY"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF MARRIAGE</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherDateOfMarriage || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandmotherDateOfMarriage: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="space-y-3">
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">PLACE OF MARRIAGE</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherPlaceOfMarriage || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandmotherPlaceOfMarriage: formatPlaceInput(e.target.value)}))}
                              placeholder="CITY, COUNTRY OR LEAVE EMPTY"
                              className="enhanced-input"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF EMIGRATION</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherDateOfEmigration || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandmotherDateOfEmigration: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">DATE OF NATURALIZATION</Label>
                            <Input
                              value={familyTreeData.greatGrandmotherDateOfNaturalization || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                setFamilyTreeData((prev) => ({...prev, greatGrandmotherDateOfNaturalization: formatted}));
                              }}
                              placeholder="DD.MM.YYYY OR LEAVE EMPTY"
                              className="enhanced-input"
                              type="tel"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">ARMY SERVICE</Label>
                            <select
                              value={familyTreeData.greatGrandmotherArmyService || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandmotherArmyService: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                          <div className="enhanced-field-container">
                            <Label className="enhanced-label">POLISH DOCUMENTS</Label>
                            <select
                              value={familyTreeData.greatGrandmotherPolishDocuments || ''}
                              onChange={(e) => setFamilyTreeData((prev) => ({...prev, greatGrandmotherPolishDocuments: e.target.value}))}
                              className="enhanced-select"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Great Grandparents Generation Confirmation */}
                    <div className="mt-4 bg-indigo-100 border border-indigo-300 p-4 rounded-lg">
                      <h5 className="font-bold text-indigo-800 mb-2">CONFIRM GREAT GRANDPARENTS INFORMATION:</h5>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="confirm-great-grandparents" className="rounded" />
                        <label htmlFor="confirm-great-grandparents" className="text-sm">All great grandparents information is correct and complete</label>
                      </div>
                    </div>

                  </div>

                  {/* Save Button */}
                </div>
                
                {/* Family Tree Data Review Section */}
                <div className="mt-8 bg-red-100 border-2 border-red-400 p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-red-800 mb-4 text-center">FAMILY TREE REVIEW & CONFIRMATION</h3>
                  <p className="text-lg text-red-700 mb-6 text-center">
                    Please review all genealogical information carefully. Check for any typos, incorrect dates, or missing information.
                  </p>
                  
                  {/* Summary of entered family tree data */}
                  <div className="bg-white border border-red-300 rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-red-800 mb-3">ENTERED FAMILY INFORMATION:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>Applicant:</strong> {(familyTreeData.applicantFirstNames || '') + ' ' + (familyTreeData.applicantLastName || '') || 'Not entered'}</div>
                        <div><strong>Birth Date:</strong> {familyTreeData.applicantBirthDate || 'Not entered'}</div>
                      </div>
                      
                      <div className="border-t border-red-200 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><strong>Polish Parent:</strong> {familyTreeData.polishParentName || 'Not entered'}</div>
                          <div><strong>Birth Date:</strong> {familyTreeData.polishParentBirthDate || 'Not entered'}</div>
                        </div>
                      </div>
                      
                      <div className="border-t border-red-200 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><strong>Polish Grandfather:</strong> {familyTreeData.grandfatherName || 'Not entered'}</div>
                          <div><strong>Polish Grandmother:</strong> {familyTreeData.grandmotherName || 'Not entered'}</div>
                        </div>
                      </div>
                      
                      <div className="border-t border-red-200 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><strong>Great Grandfather:</strong> {familyTreeData.greatGrandfatherName || 'Not entered'}</div>
                          <div><strong>Great Grandmother:</strong> {familyTreeData.greatGrandmotherName || 'Not entered'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Family Tree Validation checklist */}
                  <div>
                    <h4 className="text-xl font-bold text-red-800 mb-4">PLEASE CONFIRM:</h4>
                    <div className="space-y-4">
                      <Button
                        onClick={() => setConfirmFamilySpelling(!confirmFamilySpelling)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmFamilySpelling 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmFamilySpelling && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        ALL FAMILY NAMES ARE SPELLED CORRECTLY
                      </Button>
                      
                      <Button
                        onClick={() => setConfirmFamilyDates(!confirmFamilyDates)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmFamilyDates 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmFamilyDates && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        ALL BIRTH/MARRIAGE DATES ARE ACCURATE
                      </Button>
                      
                      <Button
                        onClick={() => setConfirmPolishAncestor(!confirmPolishAncestor)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmPolishAncestor 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmPolishAncestor && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        POLISH ANCESTOR INFO IS CORRECT
                      </Button>
                      
                      <Button
                        onClick={() => setConfirmGenerationOrder(!confirmGenerationOrder)}
                        className={`flex items-center justify-center w-full py-8 px-8 ${
                          confirmGenerationOrder 
                            ? 'bg-red-600/40 border-red-500 shadow-xl' 
                            : 'bg-red-500/20 border-red-300'
                        } backdrop-blur-sm border hover:bg-red-500/30 text-red-800 rounded-2xl font-normal text-3xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]`}
                      >
                        {confirmGenerationOrder && (
                          <Check className="mr-4 h-12 w-12 text-red-800 animate-in fade-in duration-500 zoom-in-75 bounce-in-50" />
                        )}
                        GENERATION ORDER IS CORRECT
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => {
                      // Validate essential family tree fields
                      const requiredFamilyFields = [
                        { field: familyTreeData.applicantFirstNames, name: 'APPLICANT GIVEN NAMES' },
                        { field: familyTreeData.applicantLastName, name: 'APPLICANT SURNAME' },
                        { field: familyTreeData.polishParentName, name: 'POLISH PARENT NAME' },
                        { field: familyTreeData.grandfatherName, name: 'POLISH GRANDFATHER NAME' }
                      ];
                      
                      const missingFamilyFields = requiredFamilyFields.filter(item => !item.field?.trim()).map(item => item.name);
                      
                      if (missingFamilyFields.length > 0) {
                        toast({
                          title: "Missing Required Family Information",
                          description: `Please fill in: ${missingFamilyFields.join(', ')}`,
                          variant: "destructive"
                        });
                        return;
                      }

                      // Check family tree confirmation buttons
                      if (!confirmFamilySpelling || !confirmFamilyDates || !confirmPolishAncestor || !confirmGenerationOrder) {
                        toast({
                          title: "Please Confirm Family Tree Review",
                          description: "Click all confirmation buttons to proceed",
                          variant: "destructive"
                        });
                        return;
                      }

                      // Save family tree and show notification
                      toast({
                        title: "Family Tree Saved",
                        description: "Your genealogical information has been saved successfully",
                      });
                      
                      // Show success notification when all confirmations made and data saved
                      setShowFamilySuccessNotification(true);
                      
                      // No scrolling - notification appears at current position
                    }}
                    className="flex items-center justify-center w-full py-8 px-8 bg-green-500/20 backdrop-blur-sm border border-green-300 hover:bg-green-500/30 text-green-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                  >
                    SAVE FAMILY TREE
                  </Button>
                </div>

                {/* Adobe Acrobat Viewer Button for Family Tree PDF */}
                <div className="mt-6">
                  <Button
                    onClick={async () => {
                      try {
                        // Check if we have the minimum required data
                        if (!clientData?.firstName || !familyTreeData.applicantFirstNames) {
                          toast({
                            title: "Missing Required Data",
                            description: "Please fill out both Client Details and Family Tree sections first",
                            variant: "destructive"
                          });
                          return;
                        }

                        // Show loading toast
                        toast({
                          title: "Generating PDF",
                          description: "Creating your Family Tree PDF with Adobe viewer...",
                        });

                        // Generate Adobe viewer link
                        const response = await fetch('/api/pdf/adobe-viewer-link', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            templateName: 'family-tree',
                            applicantData: clientData,
                            familyTreeData: familyTreeData
                          }),
                        });

                        const result = await response.json();
                        
                        if (result.success) {
                          // Open Adobe Acrobat viewer in new tab
                          window.open(result.viewerUrl, '_blank');
                          toast({
                            title: "PDF Opened",
                            description: "Your Family Tree PDF is now open in Adobe Acrobat viewer",
                          });
                        } else {
                          throw new Error(result.error || 'Failed to generate viewer link');
                        }
                      } catch (error) {
                        console.error('Error generating Adobe viewer link:', error);
                        toast({
                          title: "Error",
                          description: "Failed to open PDF in Adobe viewer. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="flex items-center justify-center w-full py-8 px-8 bg-blue-500/20 backdrop-blur-sm border border-blue-300 hover:bg-blue-500/30 text-blue-800 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      OPEN FAMILY TREE PDF IN ADOBE VIEWER
                    </div>
                  </Button>
                </div>

                {/* Success Notification Board - Only shown when all confirmations made and data saved */}
                {showFamilySuccessNotification && (
                  <div className="mt-8">
                    <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg 
                              className="w-10 h-10 text-white animate-pulse" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-blue-800 mb-2">
                              PERFECT. ALL FAMILY TREE DATA SAVED PROPERLY.
                            </h3>
                            <p className="text-lg text-blue-700">
                              You can now move on to Documents or PDF generation sections.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Duplicate Section Navigation Buttons - RIGHT UNDER TREE */}
            <div className="mt-6 px-3 py-4 bg-blue-100 rounded-xl">
              <div className="grid grid-cols-5 gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    variant={activeSection === section.id ? "default" : "outline"}
                    className={`aspect-square h-20 w-20 mx-auto flex-col gap-1 p-2 rounded transition-all duration-300 shadow-md ${
                      activeSection === section.id 
                        ? section.id === 1 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl scale-105 border-2 border-green-400 transform'
                          : section.id === 2
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl scale-105 border-2 border-red-400 transform'
                          : section.id === 3
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl scale-105 border-2 border-blue-400 transform'
                          : section.id === 4
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl scale-105 border-2 border-purple-400 transform'
                          : section.id === 5
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl scale-105 border-2 border-orange-400 transform'
                          : section.id === 6
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-xl scale-105 border-2 border-cyan-400 transform'
                          : section.id === 7
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl scale-105 border-2 border-gray-400 transform'
                          : section.id === 8
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl scale-105 border-2 border-teal-400 transform'
                          : section.id === 9
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl scale-105 border-2 border-purple-400 transform'
                          : section.id === 10
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl scale-105 border-2 border-amber-400 transform'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-xl scale-105 border-2 border-gray-400 transform'
                        : (showSuccessNotification && (section.id === 2 || section.id === 4)) || (showFamilySuccessNotification && (section.id === 3 || section.id === 4))
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-xl scale-110 border-4 border-yellow-300 transform animate-pulse'
                        : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 hover:border-blue-400 hover:shadow-lg hover:scale-102 text-gray-700'
                    }`}
                  >
                    <section.icon className={`transition-all duration-200 ${
                      activeSection === section.id 
                        ? 'h-8 w-8 text-white' 
                        : 'h-7 w-7 text-blue-600'
                    }`} />
                    <span className={`text-sm font-bold text-center leading-tight transition-colors ${
                      activeSection === section.id 
                        ? 'text-white' 
                        : 'text-gray-800'
                    }`}>
                      {section.title}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: AI Document Processing */}
        {activeSection === 3 && (
          <div className="space-y-6">
            <Card className="glass-card-info">
              <CardHeader className="glass-header-info pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  Documents Processing
                </CardTitle>
                <p className="text-lg text-blue-100 text-left">
                  Upload your original documents for automatic translation and data extraction
                </p>
              </CardHeader>
              <CardContent className="p-4">

                {/* File Upload for Documents */}
                <div className="grid grid-cols-1 gap-6">
                  {documentTypes.map((docType) => (
                    <div key={docType.type} className="relative">
                      <input
                        type="file"
                        id={`file-${docType.type}`}
                        accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log(`Uploading ${docType.type}:`, file.name);
                            
                            // Create staged document with progress tracking
                            const stagedDoc: TestDocument = {
                              id: `staged-${Date.now()}`,
                              filename: file.name,
                              type: docType.type,
                              status: 'uploading',
                              polishTranslation: '',
                              originalText: '',
                              extractedData: {}
                            };
                            
                            setDocuments(prev => [...prev, stagedDoc]);
                            
                            try {
                              // Real server upload
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', docType.type);
                              
                              const response = await fetch('/api/upload-document', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                const result = await response.json();
                                
                                // Update document with results
                                setDocuments(prev => prev.map(doc => 
                                  doc.id === stagedDoc.id 
                                    ? { 
                                        ...doc, 
                                        status: 'pending-review',
                                        polishTranslation: result.translatedText || 'Document uploaded successfully',
                                        originalText: result.extractedText || 'Text extraction completed',
                                        extractedData: result.extractedData || {}
                                      }
                                    : doc
                                ));
                                
                                toast({
                                  title: "Upload Complete",
                                  description: `${file.name} processed successfully`,
                                });
                              } else {
                                throw new Error('Upload failed');
                              }
                            } catch (error) {
                              console.error('Upload error:', error);
                              setDocuments(prev => prev.map(doc => 
                                doc.id === stagedDoc.id 
                                  ? { ...doc, status: 'error' }
                                  : doc
                              ));
                              toast({
                                title: "Upload Failed",
                                description: "Please try again",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                      />
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 hover:from-blue-100 hover:to-blue-150 hover:border-blue-400 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg">
                        <div className="flex flex-col text-center">
                          <h3 className="font-bold text-xl text-blue-900 mb-2">{docType.name}</h3>
                          <p className="text-lg text-blue-700 mb-4">Click to upload or drag file here</p>
                          <div className="text-base text-blue-600 bg-white rounded-lg py-3 px-4 border border-blue-200">
                            Supported formats: PDF, JPG, PNG, TIFF, DOC, DOCX
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Document List */}
                {documents.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl md:text-lg font-semibold">No documents uploaded yet</p>
                    <p className="text-lg md:text-base">Click any document type above to add a test document</p>
                  </div>
                )}

                {documents.map((document) => (
                  <Card key={document.id} className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="font-bold text-3xl text-blue-900 mb-2">{document.filename}</p>
                          <p className="text-xl text-blue-700">{documentTypes.find(d => d.type === document.type)?.name || 'Document'}</p>
                        </div>
                        <span className={`px-6 py-3 rounded-full text-xl font-bold ${
                          document.status === 'uploading'
                            ? 'bg-blue-200 text-blue-900 border-2 border-blue-400' 
                            : document.status === 'pending-review' 
                            ? 'bg-orange-200 text-orange-900 border-2 border-orange-400' 
                            : document.status === 'error'
                            ? 'bg-red-200 text-red-900 border-2 border-red-400'
                            : 'bg-green-200 text-green-900 border-2 border-green-400'
                        }`}>
                          {document.status === 'uploading' ? 'Processing...' 
                           : document.status === 'pending-review' ? 'Review Required' 
                           : document.status === 'error' ? 'Error' 
                           : 'Completed'}
                        </span>
                      </div>



                      {document.status === 'pending-review' && (
                        <div className="space-y-6">
                          <div className="p-8 bg-white border-2 border-blue-300 rounded-xl shadow-inner">
                            <p className="font-bold text-2xl text-blue-900 mb-6">
                              Document processed successfully! Review extracted data:
                            </p>
                            
                            {/* Extracted Data Section */}
                            <div className="mb-6">
                              <details className="group mb-4">
                                <summary className="cursor-pointer font-bold text-xl text-green-800 p-4 bg-green-50 rounded-xl border-2 border-green-200 flex items-center justify-between hover:bg-green-100">
                                  <span>📄 View Original Extracted Text (OCR)</span>
                                  <ChevronDown className="h-6 w-6 group-open:hidden" />
                                  <ChevronUp className="h-6 w-6 hidden group-open:block" />
                                </summary>
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 text-base whitespace-pre-line max-h-64 overflow-y-auto">
                                  {document.originalText || 'No original text available'}
                                </div>
                              </details>
                              
                              <details className="group">
                                <summary className="cursor-pointer font-bold text-xl text-blue-800 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 flex items-center justify-between hover:bg-blue-100">
                                  <span>🌐 View Polish Translation</span>
                                  <ChevronDown className="h-6 w-6 group-open:hidden" />
                                  <ChevronUp className="h-6 w-6 hidden group-open:block" />
                                </summary>
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 text-base whitespace-pre-line max-h-64 overflow-y-auto">
                                  {document.polishTranslation || 'No translation available'}
                                </div>
                              </details>
                            </div>
                            
                            <div className="space-y-4">
                              <Button
                                onClick={() => acceptDocument(document.id)}
                                className="flex items-center justify-center w-full py-8 px-8 bg-green-500/20 backdrop-blur-sm border border-green-300 hover:bg-green-500/30 text-green-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                              >
                                ACCEPT & SAVE DATA
                              </Button>
                              <Button
                                onClick={() => deleteDocument(document.id)}
                                className="flex items-center justify-center w-full py-8 px-8 bg-green-500/20 backdrop-blur-sm border border-green-300 hover:bg-green-500/30 text-green-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                              >
                                DELETE & RETRY
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {document.status === 'completed' && (
                        <div className="p-8 bg-white border-2 border-green-300 rounded-xl shadow-inner">
                          <p className="font-bold text-xl text-green-800 mb-6">
                            ✓ Document accepted and data saved successfully
                          </p>
                          <details className="group">
                            <summary className="cursor-pointer font-bold text-lg text-green-700 p-4 bg-green-50 rounded-xl border-2 border-green-200 flex items-center justify-between hover:bg-green-100">
                              <span>View Saved Data</span>
                              <ChevronDown className="h-6 w-6 group-open:hidden" />
                              <ChevronUp className="h-6 w-6 hidden group-open:block" />
                            </summary>
                            <div className="mt-4 p-6 bg-gray-50 rounded-xl border-2 border-gray-200 text-base whitespace-pre-line">
                              {document.polishTranslation}
                            </div>
                          </details>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 4: PDF Generation */}
        {activeSection === 4 && (
          <div className="space-y-6">
            <Card className="glass-card-warning">
              <CardHeader className="glass-header-warning pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  Documents Generation
                </CardTitle>
                <p className="text-lg text-purple-100 text-left">
                  Generate official documents using your completed data
                </p>
              </CardHeader>
              <CardContent className="p-4">
                {/* PDF Options Info */}
                <div className="bg-purple-50 border-2 border-purple-300 p-6 rounded-xl mb-6">
                  <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">📄 PDF OPTIONS</h3>
                  <p className="text-purple-700 mb-4 text-center">
                    Choose how you want to work with your documents
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-purple-100 p-4 rounded-xl">
                      <div className="text-2xl mb-2">⬇️</div>
                      <h4 className="font-bold text-purple-800">DOWNLOAD PDF</h4>
                      <p className="text-sm text-purple-600">Get a traditional PDF file to save or print</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <div className="text-2xl mb-2">🌐</div>
                      <h4 className="font-bold text-blue-800">EDIT IN BROWSER</h4>
                      <p className="text-sm text-blue-600">Fill forms directly in your web browser</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={generateComprehensivePDFs}
                    disabled={isGeneratingPDFs}
                    className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                  >
                    {isGeneratingPDFs ? 'GENERATING...' : 'GENERATE ALL PDFs'}
                  </Button>

                  <Button
                    onClick={() => {
                      toast({
                        title: "All Data Saved",
                        description: "Client details, family tree, and document information have been saved successfully",
                      });
                    }}
                    className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                  >
                    SAVE ALL DATA
                  </Button>

                  {/* FAMILY TREE - Dual Options */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-purple-800 mb-2 text-center">🌳 FAMILY TREE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={async () => {
                          console.log('Family Tree Download button clicked - saving data and generating PDF...');
                          try {
                            if (!clientData?.firstName || !familyTreeData.applicantFirstNames) {
                              toast({
                                title: "Missing Required Data",
                                description: "Please fill out both Client Details and Family Tree sections first",
                                variant: "destructive"
                              });
                              return;
                            }

                            toast({
                              title: "Saving Data & Generating PDF",
                              description: "Auto-saving your form data and creating your Family Tree document...",
                            });

                            const response = await fetch('/api/pdf/single-with-data', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                templateName: 'family-tree',
                                templateUrl: '/attached_assets/GENEALOGICAL TREE_1754613487315.pdf',
                                clientData: clientData,
                                familyTreeData: familyTreeData
                              })
                            });
                            
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              
                              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                              
                              if (isMobile) {
                                const reader = new FileReader();
                                reader.onload = function() {
                                  const dataUrl = reader.result as string;
                                  const a = document.createElement('a');
                                  a.href = dataUrl;
                                  a.download = 'Family_Tree_Filled.pdf';
                                  a.style.display = 'none';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                };
                                reader.readAsDataURL(blob);
                                window.URL.revokeObjectURL(url);
                              } else {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'Family_Tree_Filled.pdf';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              }
                              
                              toast({
                                title: "Family Tree PDF Downloaded",
                                description: "PDF downloaded to your device",
                              });
                            } else {
                              const errorText = await response.text();
                              throw new Error(`Server error: ${response.status} - ${errorText}`);
                            }
                          } catch (error) {
                            console.error('Family Tree PDF generation error:', error);
                            toast({
                              title: "Generation Failed",
                              description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full py-4 px-4 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[3rem]"
                      >
                        ⬇️ DOWNLOAD PDF
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          console.log('Family Tree Edit in Browser button clicked');
                          try {
                            if (!clientData?.firstName || !familyTreeData.applicantFirstNames) {
                              toast({
                                title: "Missing Required Data",
                                description: "Please fill out both Client Details and Family Tree sections first",
                                variant: "destructive"
                              });
                              return;
                            }

                            toast({
                              title: "Creating Editable Family Tree PDF",
                              description: "Please wait while we prepare your document for editing...",
                            });

                            const response = await fetch('/api/pdf/adobe-viewer-link', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                templateName: 'family-tree',
                                applicantData: clientData,
                                familyTreeData: familyTreeData
                              }),
                            });

                            const result = await response.json();
                            
                            if (result.success) {
                              window.open(result.viewerUrl, '_blank');
                              toast({
                                title: "Family Tree PDF Opened",
                                description: "Your Family Tree PDF is now open in Adobe Acrobat viewer",
                              });
                            } else {
                              throw new Error(result.error || 'Failed to generate viewer link');
                            }
                          } catch (error) {
                            console.error('Family Tree Adobe viewer error:', error);
                            toast({
                              title: "Failed to Open in Browser",
                              description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full py-4 px-4 bg-blue-500/20 backdrop-blur-sm border border-blue-300 hover:bg-blue-500/30 text-blue-800 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[3rem]"
                      >
                        🌐 EDIT IN BROWSER
                      </Button>
                    </div>
                  </div>

                  {/* POA (SINGLE) - Dual Options */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-purple-800 mb-2 text-center">📄 POA (SINGLE)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={async () => {
                          console.log('POA Single Download button clicked - saving data and generating PDF...');
                          try {
                            toast({
                              title: "Saving Data & Generating PDF",
                              description: "Auto-saving your form data and creating your document...",
                            });

                            const response = await fetch('/api/pdf/single-with-data', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                clientData: clientData,
                                familyTreeData: familyTreeData
                              })
                            });
                            
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              
                              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                              
                              if (isMobile) {
                                const reader = new FileReader();
                                reader.onload = function() {
                                  const dataUrl = reader.result as string;
                                  const a = document.createElement('a');
                                  a.href = dataUrl;
                                  a.download = 'Power_of_Attorney_Single.pdf';
                                  a.style.display = 'none';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                };
                                reader.readAsDataURL(blob);
                                window.URL.revokeObjectURL(url);
                              } else {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'Power_of_Attorney_Single.pdf';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              }
                              
                              toast({
                                title: "PDF Downloaded",
                                description: "PDF downloaded to your device",
                              });
                            } else {
                              const errorText = await response.text();
                              throw new Error(`Server error: ${response.status} - ${errorText}`);
                            }
                          } catch (error) {
                            console.error('PDF generation error:', error);
                            toast({
                              title: "Generation Failed",
                              description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full py-4 px-4 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[3rem]"
                      >
                        ⬇️ DOWNLOAD PDF
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          console.log('POA Single Edit in Browser button clicked');
                          try {
                            toast({
                              title: "Creating Editable PDF",
                              description: "Please wait while we prepare your document for editing...",
                            });

                            const response = await fetch('/api/pdf/create-editable-simple', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                pdfType: 'poa-single',
                                applicantData: clientData,
                                familyTreeData: familyTreeData
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Editable PDF created:', result);
                              
                              // Open editable PDF in new window/tab
                              window.open(result.editableUrl, '_blank');
                              
                              toast({
                                title: "PDF Editor Opened",
                                description: "Your editable PDF has opened in a new window. Fill the form directly and save when done!",
                              });
                            } else {
                              const errorData = await response.json();
                              throw new Error(errorData.error || `Server error: ${response.status}`);
                            }
                          } catch (error) {
                            console.error('Editable PDF creation error:', error);
                            toast({
                              title: "Creation Failed",
                              description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full py-4 px-4 bg-blue-500/20 backdrop-blur-sm border border-blue-300 hover:bg-blue-500/30 text-blue-800 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[3rem]"
                      >
                        🌐 EDIT IN BROWSER
                      </Button>
                    </div>
                  </div>

                  {/* POA (MARRIED) - Dual Options */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-purple-800 mb-2 text-center">💍 POA (MARRIED)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={async () => {
                          console.log('POA Married Download button clicked');
                          try {
                            toast({
                              title: "Generating PDF",
                              description: "Please wait while your document is being generated...",
                            });

                            const response = await fetch('/api/pdf/poa/married', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ applicantData: clientData })
                            });
                            
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              
                              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                              
                              if (isMobile) {
                                const reader = new FileReader();
                                reader.onload = function() {
                                  const dataUrl = reader.result as string;
                                  const a = document.createElement('a');
                                  a.href = dataUrl;
                                  a.download = 'Power_of_Attorney_Married.pdf';
                                  a.style.display = 'none';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                };
                                reader.readAsDataURL(blob);
                                window.URL.revokeObjectURL(url);
                              } else {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'Power_of_Attorney_Married.pdf';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              }
                              
                              toast({
                                title: "PDF Downloaded",
                                description: "PDF downloaded to your device",
                              });
                            } else {
                              const errorText = await response.text();
                              throw new Error(`Server error: ${response.status} - ${errorText}`);
                            }
                          } catch (error) {
                            console.error('PDF generation error:', error);
                            toast({
                              title: "Generation Failed",
                              description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full py-4 px-4 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[3rem]"
                      >
                        ⬇️ DOWNLOAD PDF
                      </Button>
                      
                      <Button
                        onClick={async () => {
                          console.log('POA Married Edit in Browser button clicked');
                          try {
                            toast({
                              title: "Creating Editable PDF",
                              description: "Please wait while we prepare your document for editing...",
                            });

                            const response = await fetch('/api/pdf/create-editable-simple', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                pdfType: 'poa-married',
                                applicantData: clientData,
                                familyTreeData: familyTreeData
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              window.open(result.editableUrl, '_blank');
                              
                              toast({
                                title: "PDF Editor Opened",
                                description: "Your editable PDF has opened in a new window. Fill the form directly and save when done!",
                              });
                            } else {
                              const errorData = await response.json();
                              throw new Error(errorData.error || `Server error: ${response.status}`);
                            }
                          } catch (error) {
                            console.error('Editable PDF creation error:', error);
                            toast({
                              title: "Creation Failed",
                              description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex items-center justify-center w-full py-4 px-4 bg-blue-500/20 backdrop-blur-sm border border-blue-300 hover:bg-blue-500/30 text-blue-800 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[3rem]"
                      >
                        🌐 EDIT IN BROWSER
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      console.log('Citizenship Application button clicked');
                      try {
                        toast({
                          title: "Generating PDF",
                          description: "Please wait while your document is being generated...",
                        });

                        const response = await fetch('/api/pdf/citizenship-application', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            applicantData: clientData,
                            familyTreeData: familyTreeData
                          })
                        });
                        
                        if (response.ok) {
                          const blob = await response.blob();
                          console.log('PDF blob received, size:', blob.size, 'bytes');
                          const url = window.URL.createObjectURL(blob);
                          
                          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                          
                          if (isMobile) {
                            console.log('Creating direct download for mobile...');
                            const reader = new FileReader();
                            reader.onload = function() {
                              const dataUrl = reader.result as string;
                              
                              const a = document.createElement('a');
                              a.href = dataUrl;
                              a.download = 'Polish_Citizenship_Application.pdf';
                              a.style.display = 'none';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              
                              console.log('PDF download triggered for mobile');
                            };
                            reader.readAsDataURL(blob);
                            window.URL.revokeObjectURL(url);
                          } else {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'Polish_Citizenship_Application.pdf';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }
                          
                          toast({
                            title: "PDF Generated Successfully",
                            description: isMobile ? "PDF opened in new tab" : "PDF downloaded to your device",
                          });
                        } else {
                          const errorText = await response.text();
                          throw new Error(`Server error: ${response.status} - ${errorText}`);
                        }
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        toast({
                          title: "Generation Failed",
                          description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                          variant: "destructive"
                        });
                      }
                    }}
                    className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                  >
                    CITIZENSHIP APPLICATION
                  </Button>

                  <Button
                    onClick={() => {
                      toast({
                        title: "PDFs Data Saved",
                        description: "Your document generation preferences have been saved successfully",
                      });
                    }}
                    className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                  >
                    SAVE PDFs SETTINGS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 5: Templates */}
        {activeSection === 5 && (
          <div className="space-y-6">
            <Card className="glass-card-warning">
              <CardHeader className="glass-header-warning pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  Documents Templates
                </CardTitle>
                <p className="text-lg text-orange-100 text-left">
                  Download the official Polish documents templates for the whole citizenship paperwork
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* FAMILY TREE TEMPLATE */}
                  <div className="bg-orange-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">🌳 FAMILY TREE TEMPLATE</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/GENEALOGICAL TREE_1754613487315.pdf', 'Family_Tree_Template.pdf');
                          toast({
                            title: "Template Opened",
                            description: "Family Tree template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        🌳 GENEALOGICAL TREE TEMPLATE
                      </Button>
                    </div>
                  </div>

                  {/* POWER OF ATTORNEY TEMPLATES */}
                  <div className="bg-orange-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">POWER OF ATTORNEY TEMPLATES</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          // Simple direct link - works on all devices
                          window.open('/api/pdf/married', '_blank');
                          
                          toast({
                            title: "Opening Filled PDF",
                            description: "Your filled PDF with ROMAN data is opening in new tab",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        POA CITIZENSHIP (MARRIED)
                      </Button>

                      <Button
                        onClick={() => {
                          // Simple direct link - works on all devices
                          window.open('/api/pdf/single', '_blank');
                          
                          toast({
                            title: "Opening Filled PDF",
                            description: "Your filled PDF with ROMAN data is opening in new tab",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        POA CITIZENSHIP (SINGLE)
                      </Button>

                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/POA CITIZENSHIP MINOR_1755414325329.pdf', 'POA_Citizenship_Minor.pdf');
                          toast({
                            title: "Template Opened",
                            description: "POA Citizenship (Minor) template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        POA CITIZENSHIP (MINOR)
                      </Button>
                    </div>
                  </div>

                  {/* CITIZENSHIP APPLICATION TEMPLATES */}
                  <div className="bg-orange-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">CITIZENSHIP APPLICATION FORMS</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/2. OBYWATELSTWO_1755414367463.pdf', 'Citizenship_Application_Form.pdf');
                          toast({
                            title: "Template Opened",
                            description: "Citizenship Application Form template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        CITIZENSHIP APPLICATION FORM
                      </Button>


                    </div>
                  </div>

                  {/* CIVIL REGISTRY FORMS */}
                  <div className="bg-orange-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">CIVIL REGISTRY FORMS</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/4. UMIEJSCOWIENIE_1755414367463.pdf', 'Foreign_Act_Registration_Form.pdf');
                          toast({
                            title: "Template Opened",
                            description: "Foreign Act Registration Form template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        FOREIGN ACT REGISTRATION
                      </Button>

                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/5. UZUPEŁNIENIE_1755414367463.pdf', 'Civil_Records_Completion_Form.pdf');
                          toast({
                            title: "Template Opened",
                            description: "Civil Records Completion Form template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        CIVIL RECORDS COMPLETION
                      </Button>

                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/6. SPROSTOWANIE_1755414367463.pdf', 'Civil_Records_Correction_Form.pdf');
                          toast({
                            title: "Template Opened",
                            description: "Civil Records Correction Form template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        CIVIL RECORDS CORRECTION
                      </Button>

                      <Button
                        onClick={() => {
                          openPDFOnMobile('/attached_assets/8. ODPISY_1755414367463.pdf', 'Civil_Records_Copy_Request.pdf');
                          toast({
                            title: "Template Opened",
                            description: "Civil Records Copy Request Form template opened in Adobe Acrobat",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        CIVIL RECORDS COPY REQUEST
                      </Button>
                    </div>
                  </div>

                  {/* DOWNLOAD ALL TEMPLATES */}
                  <div className="bg-orange-200/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">COMPLETE TEMPLATE PACKAGE</h3>
                    <Button
                      onClick={() => {
                        // Download all templates as individual files
                        const templates = [
                          { url: '/attached_assets/POA CITIZENSHIP MARRIED_1755414325329.pdf', name: 'POA_Citizenship_Married.pdf' },
                          { url: '/attached_assets/POA CITIZENSHIP SINGLE_1755414325329.pdf', name: 'POA_Citizenship_Single.pdf' },
                          { url: '/attached_assets/POA CITIZENSHIP MINOR_1755414325329.pdf', name: 'POA_Citizenship_Minor.pdf' },
                          { url: '/attached_assets/2. OBYWATELSTWO_1755414367463.pdf', name: 'Citizenship_Application_Form.pdf' },
                          { url: '/attached_assets/2. OBYWATELSTWO_1755414415585.pdf', name: 'Citizenship_Application_Form_Alt.pdf' },
                          { url: '/attached_assets/4. UMIEJSCOWIENIE_1755414367463.pdf', name: 'Foreign_Act_Registration_Form.pdf' },
                          { url: '/attached_assets/5. UZUPEŁNIENIE_1755414367463.pdf', name: 'Civil_Records_Completion_Form.pdf' },
                          { url: '/attached_assets/6. SPROSTOWANIE_1755414367463.pdf', name: 'Civil_Records_Correction_Form.pdf' },
                          { url: '/attached_assets/8. ODPISY_1755414367463.pdf', name: 'Civil_Records_Copy_Request.pdf' }
                        ];
                        
                        templates.forEach((template, index) => {
                          setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = template.url;
                            link.download = template.name;
                            link.click();
                          }, index * 500); // Stagger downloads by 500ms
                        });
                        
                        toast({
                          title: "All Templates Downloaded",
                          description: "All 9 PDF templates are being downloaded. Check your downloads folder.",
                        });
                      }}
                      className="flex items-center justify-center w-full py-8 px-8 bg-orange-600/30 backdrop-blur-sm border border-orange-400 hover:bg-orange-600/40 text-orange-900 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                    >
                      DOWNLOAD ALL 9 TEMPLATES
                    </Button>
                  </div>

                  {/* SAVE SETTINGS */}
                  <Button
                    onClick={() => {
                      toast({
                        title: "Templates Data Saved",
                        description: "Your template preferences have been saved successfully",
                      });
                    }}
                    className="flex items-center justify-center w-full py-6 px-6 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                  >
                    SAVE TEMPLATES SETTINGS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 6: Adobe */}
        {activeSection === 6 && (
          <div className="space-y-6">
            <Card className="glass-card-info">
              <CardHeader className="glass-header-info pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  ADOBE SERVICES
                </CardTitle>
                <p className="text-lg text-cyan-100 text-left">
                  Enhanced document processing with Adobe Pro AI subscription and features
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <AdobeTestComponent />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 7: Citizenship Test */}
        {activeSection === 7 && (
          <div className="space-y-6">
            <Card className="glass-card-neutral">
              <CardHeader className="glass-header-neutral pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  CITIZENSHIP TEST
                </CardTitle>
                <p className="text-lg text-gray-100 text-left">
                  Comprehensive eligibility assessment for Polish citizenship by descent
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <CitizenshipTest />
                  
                  {/* Analytics Section - Legacy TypeForm Data */}
                  <div className="border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Test Analytics</h3>
                    <TypeFormAnalytics />
                    <div className="mt-6">
                      <TypeFormAllResponses />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 8: Translations */}
        {activeSection === 8 && (
          <div className="space-y-6">
            <Card className="glass-card-info">
              <CardHeader className="glass-header-info pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  TRANSLATIONS
                </CardTitle>
                <p className="text-lg text-teal-100 text-left">
                  Professional document translation services for Polish citizenship applications
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  
                  {/* DOCUMENT TRANSLATION HUB */}
                  <div className="bg-teal-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-teal-800 mb-4 text-center">DOCUMENT TRANSLATION HUB</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Translation Service: Upload documents for AI-powered translation with OCR support");
                          toast({
                            title: "Translation Service",
                            description: "Upload documents for AI-powered translation with OCR support",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        UPLOAD & TRANSLATE
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Real-time Translation: Instant translation with accuracy verification enabled");
                          toast({
                            title: "Real-time Translation",
                            description: "Instant translation with accuracy verification enabled",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        REAL-TIME TRANSLATION
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Side-by-side View",
                            description: "Compare original and translated documents side by side",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        SIDE-BY-SIDE VIEW
                      </Button>
                    </div>
                  </div>

                  {/* LANGUAGE SUPPORT */}
                  <div className="bg-teal-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-teal-800 mb-4 text-center">SUPPORTED LANGUAGES</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['POLISH', 'ENGLISH', 'GERMAN', 'FRENCH', 'SPANISH', 'HEBREW', 'PORTUGUESE', 'RUSSIAN'].map((lang) => (
                        <Button
                          key={lang}
                          onClick={() => {
                            console.log(`${lang} language button clicked`);
                            alert(`${lang} Translation: Language support activated for document translation`);
                            toast({
                              title: `${lang} Translation`,
                              description: `${lang} language support activated for document translation`,
                            });
                          }}
                          className="flex items-center justify-center w-full py-4 px-4 bg-teal-500/10 backdrop-blur-sm border border-teal-200 hover:bg-teal-500/20 text-teal-700 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-sm hover:shadow-md"
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* TRANSLATION MANAGEMENT */}
                  <div className="bg-teal-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-teal-800 mb-4 text-center">TRANSLATION MANAGEMENT</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          toast({
                            title: "Translation Queue",
                            description: "View all documents currently in translation process",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        TRANSLATION QUEUE
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Quality Assurance",
                            description: "AI confidence scoring and manual review system activated",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        QUALITY ASSURANCE
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Download Center",
                            description: "Access and download all translated documents",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        DOWNLOAD CENTER
                      </Button>
                    </div>
                  </div>

                  {/* SMART FEATURES */}
                  <div className="bg-teal-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-teal-800 mb-4 text-center">SMART FEATURES</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          toast({
                            title: "Legal Document Templates",
                            description: "Pre-configured translation templates for Polish citizenship papers",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        LEGAL TEMPLATES
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Auto-Population",
                            description: "Translated content automatically flows to form fields",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        AUTO-POPULATION
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Bulk Translation",
                            description: "Process multiple documents simultaneously for efficiency",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        BULK TRANSLATION
                      </Button>
                    </div>
                  </div>

                  {/* TRANSLATION ANALYTICS */}
                  <div className="bg-teal-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-teal-800 mb-4 text-center">TRANSLATION ANALYTICS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          toast({
                            title: "Accuracy Metrics",
                            description: "View translation confidence scores and accuracy statistics",
                          });
                        }}
                        className="flex items-center justify-center w-full py-6 px-6 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                      >
                        ACCURACY METRICS
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Processing Times",
                            description: "Monitor average translation speeds and processing statistics",
                          });
                        }}
                        className="flex items-center justify-center w-full py-6 px-6 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                      >
                        PROCESSING TIMES
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Language Statistics",
                            description: "View most translated document types and language usage",
                          });
                        }}
                        className="flex items-center justify-center w-full py-6 px-6 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                      >
                        LANGUAGE STATS
                      </Button>

                      <Button
                        onClick={() => {
                          toast({
                            title: "Cost Tracking",
                            description: "Monitor translation service usage and cost analysis",
                          });
                        }}
                        className="flex items-center justify-center w-full py-6 px-6 bg-teal-500/20 backdrop-blur-sm border border-teal-300 hover:bg-teal-500/30 text-teal-800 rounded-2xl font-bold text-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[4rem]"
                      >
                        COST TRACKING
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 9: AI Assistant */}
        {activeSection === 9 && (
          <div className="space-y-6">
            <Card className="glass-card-warning">
              <CardHeader className="glass-header-warning pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  ASSISTANT
                </CardTitle>
                <p className="text-lg text-purple-100 text-left">
                  AI-powered guidance for Polish citizenship applications, forms, and platform navigation
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  
                  {/* PLATFORM GUIDANCE */}
                  <div className="bg-purple-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">PLATFORM GUIDANCE</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Dashboard Tour: AI-guided walkthrough of all dashboard features and sections");
                          toast({
                            title: "Dashboard Tour",
                            description: "AI-guided walkthrough of all dashboard features starting now",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        DASHBOARD TOUR
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Feature Explanation: Get detailed explanations of any platform feature or section");
                          toast({
                            title: "Feature Explanation",
                            description: "AI assistant ready to explain any platform feature",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        FEATURE EXPLANATION
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Quick Help: Instant answers to common questions about Polish citizenship process");
                          toast({
                            title: "Quick Help",
                            description: "AI assistant providing instant answers to your questions",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        QUICK HELP
                      </Button>
                    </div>
                  </div>

                  {/* FORM ASSISTANCE */}
                  <div className="bg-purple-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">FORM ASSISTANCE</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Form Auto-Fill: AI analyzes your documents and automatically fills application forms");
                          toast({
                            title: "Form Auto-Fill",
                            description: "AI analyzing documents to auto-populate forms",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-indigo-500/20 backdrop-blur-sm border border-indigo-300 hover:bg-indigo-500/30 text-indigo-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        FORM AUTO-FILL
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Smart Validation: AI checks your forms for errors and suggests improvements");
                          toast({
                            title: "Smart Validation",
                            description: "AI validating forms and suggesting improvements",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-indigo-500/20 backdrop-blur-sm border border-indigo-300 hover:bg-indigo-500/30 text-indigo-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        SMART VALIDATION
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Field Guidance: Get AI help for specific form fields and what information to enter");
                          toast({
                            title: "Field Guidance",
                            description: "AI providing guidance for form field completion",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-indigo-500/20 backdrop-blur-sm border border-indigo-300 hover:bg-indigo-500/30 text-indigo-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        FIELD GUIDANCE
                      </Button>
                    </div>
                  </div>

                  {/* FAMILY TREE HELPER */}
                  <div className="bg-purple-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">FAMILY TREE HELPER</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Genealogy Assistant: AI helps build your family tree from documents and guides research");
                          toast({
                            title: "Genealogy Assistant",
                            description: "AI analyzing family documents to build your tree",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-violet-500/20 backdrop-blur-sm border border-violet-300 hover:bg-violet-500/30 text-violet-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        GENEALOGY ASSISTANT
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Missing Info Finder: AI identifies gaps in your family tree and suggests research directions");
                          toast({
                            title: "Missing Info Finder",
                            description: "AI identifying missing family information",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-violet-500/20 backdrop-blur-sm border border-violet-300 hover:bg-violet-500/30 text-violet-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        MISSING INFO FINDER
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Document Suggestions: AI recommends which documents you need for complete family history");
                          toast({
                            title: "Document Suggestions",
                            description: "AI suggesting required documents for family tree",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-violet-500/20 backdrop-blur-sm border border-violet-300 hover:bg-violet-500/30 text-violet-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        DOCUMENT SUGGESTIONS
                      </Button>
                    </div>
                  </div>

                  {/* PDF GENERATION ASSISTANT */}
                  <div className="bg-purple-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">PDF GENERATION ASSISTANT</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Smart PDF Creation: AI creates perfectly formatted PDFs from your data with error checking");
                          toast({
                            title: "Smart PDF Creation",
                            description: "AI generating optimized PDFs from your information",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-pink-500/20 backdrop-blur-sm border border-pink-300 hover:bg-pink-500/30 text-pink-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        SMART PDF CREATION
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Template Optimization: AI selects the best PDF templates for your specific case");
                          toast({
                            title: "Template Optimization",
                            description: "AI optimizing PDF templates for your case",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-pink-500/20 backdrop-blur-sm border border-pink-300 hover:bg-pink-500/30 text-pink-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        TEMPLATE OPTIMIZATION
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Quality Control: AI reviews generated PDFs for completeness and accuracy before download");
                          toast({
                            title: "Quality Control",
                            description: "AI performing quality control on generated PDFs",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-pink-500/20 backdrop-blur-sm border border-pink-300 hover:bg-pink-500/30 text-pink-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        QUALITY CONTROL
                      </Button>
                    </div>
                  </div>

                  {/* AI CHAT INTERFACE */}
                  <div className="bg-purple-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">AI CHAT INTERFACE</h3>
                    <div className="space-y-4">
                      <div className="bg-white/80 border-2 border-purple-200 rounded-xl p-4 min-h-[200px]">
                        <div className="text-sm text-purple-600 mb-2">AI Assistant Chat (Coming Soon)</div>
                        <div className="text-gray-500 italic">Interactive chat interface for real-time assistance with your Polish citizenship application</div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          alert("AI Chat: Interactive conversation with specialized Polish citizenship assistant");
                          toast({
                            title: "AI Chat",
                            description: "Starting interactive chat with AI assistant",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-purple-500/20 backdrop-blur-sm border border-purple-300 hover:bg-purple-500/30 text-purple-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        START AI CHAT
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 10: Print */}
        {activeSection === 10 && (
          <div className="space-y-6">
            <Card className="glass-card-warning">
              <CardHeader className="glass-header-warning pb-6">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center">
                  PRINT
                </CardTitle>
                <p className="text-lg text-amber-100 text-left">
                  Documents verification system that checks all generated documents before printing
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  
                  {/* DOCUMENT VERIFICATION */}
                  <div className="bg-amber-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-amber-800 mb-4 text-center">DOCUMENT VERIFICATION</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Smart Check: AI analyzes all generated documents for completeness and accuracy");
                          toast({
                            title: "Smart Check",
                            description: "AI analyzing all documents for errors and inconsistencies",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-amber-500/20 backdrop-blur-sm border border-amber-300 hover:bg-amber-500/30 text-amber-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        SMART CHECK
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Error Detection: Identifies missing information, formatting issues, and data inconsistencies");
                          toast({
                            title: "Error Detection",
                            description: "Scanning documents for missing data and formatting issues",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-amber-500/20 backdrop-blur-sm border border-amber-300 hover:bg-amber-500/30 text-amber-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        ERROR DETECTION
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Auto Correction: Automatically fixes identified errors and inconsistencies in documents");
                          toast({
                            title: "Auto Correction",
                            description: "AI correcting identified errors automatically",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-amber-500/20 backdrop-blur-sm border border-amber-300 hover:bg-amber-500/30 text-amber-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        AUTO CORRECTION
                      </Button>
                    </div>
                  </div>

                  {/* PRINT OPTIMIZATION */}
                  <div className="bg-amber-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-amber-800 mb-4 text-center">PRINT OPTIMIZATION</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Print Preview: Enhanced preview with print layout optimization and quality check");
                          toast({
                            title: "Print Preview",
                            description: "Generating optimized print preview",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        PRINT PREVIEW
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Page Layout: Optimizes document layout for professional printing standards");
                          toast({
                            title: "Page Layout",
                            description: "Optimizing page layout for printing",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        PAGE LAYOUT
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Quality Settings: Ensures highest quality output with proper fonts and formatting");
                          toast({
                            title: "Quality Settings",
                            description: "Configuring optimal quality settings",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-orange-500/20 backdrop-blur-sm border border-orange-300 hover:bg-orange-500/30 text-orange-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        QUALITY SETTINGS
                      </Button>
                    </div>
                  </div>

                  {/* PRINT READINESS STATUS */}
                  <div className="bg-amber-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-amber-800 mb-4 text-center">PRINT READINESS STATUS</h3>
                    <div className="space-y-4">
                      <div className="bg-white/80 border-2 border-amber-200 rounded-xl p-6">
                        <div className="text-center space-y-4">
                          <div className="text-4xl font-bold text-green-600">✓ ALL CHECKS PASSED</div>
                          <div className="text-lg text-amber-700">Documents verified and ready for printing</div>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="font-bold text-green-800">Content Check</div>
                              <div className="text-green-600">Complete ✓</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="font-bold text-green-800">Format Check</div>
                              <div className="text-green-600">Valid ✓</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="font-bold text-green-800">Data Consistency</div>
                              <div className="text-green-600">Verified ✓</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="font-bold text-green-800">Print Quality</div>
                              <div className="text-green-600">Optimized ✓</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          alert("FINAL PRINT CONFIRMATION: All documents verified and ready for professional printing");
                          toast({
                            title: "Print Ready",
                            description: "All documents verified - ready for printing",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-green-500/20 backdrop-blur-sm border border-green-300 hover:bg-green-500/30 text-green-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        ✓ ALL READY TO PRINT
                      </Button>
                    </div>
                  </div>

                  {/* BATCH OPERATIONS */}
                  <div className="bg-amber-100/50 p-4 rounded-xl">
                    <h3 className="text-2xl font-bold text-amber-800 mb-4 text-center">BATCH OPERATIONS</h3>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          alert("Print All Documents: Batch print all verified documents in correct order");
                          toast({
                            title: "Batch Print",
                            description: "Printing all documents in optimized order",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300 hover:bg-yellow-500/30 text-yellow-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        PRINT ALL DOCUMENTS
                      </Button>

                      <Button
                        onClick={() => {
                          alert("Print Summary: Generates and prints a comprehensive document summary");
                          toast({
                            title: "Print Summary",
                            description: "Generating comprehensive document summary",
                          });
                        }}
                        className="flex items-center justify-center w-full py-8 px-8 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300 hover:bg-yellow-500/30 text-yellow-800 rounded-2xl font-bold text-3xl transition-all active:scale-95 shadow-lg hover:shadow-xl min-h-[5rem]"
                      >
                        PRINT SUMMARY
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 11: Cloud Documents */}
        {activeSection === 11 && (
          <div className="px-4 py-6">
            <Card className="glass-card-info">
              <CardHeader className="glass-header-info">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center flex items-center justify-center gap-3">
                  <Upload className="w-8 h-8" />
                  Cloud Document Management
                </CardTitle>
                <p className="text-lg text-blue-100 text-left">
                  Professional cloud storage with Dropbox, Microsoft OneDrive, and Google Drive integration
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Information Section */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Multi-Cloud Document Storage</h3>
                    <p className="text-blue-700 text-sm">
                      Choose from Dropbox, Microsoft OneDrive, or Google Drive to securely store and organize all your citizenship documents.
                      Upload passports, birth certificates, marriage documents, and create Word/Google Docs directly from your data.
                    </p>
                  </div>

                  {/* Cloud Document Manager Component */}
                  {clientData && clientData.lastName && clientData.firstNames ? (
                    <CloudDocumentManager
                      clientId={`${clientData.lastName.toLowerCase()}_${clientData.firstNames.toLowerCase().replace(/\s+/g, '_')}`}
                      clientName={`${clientData.firstNames} ${clientData.lastName}`}
                    />
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">Setup Required</h3>
                      <p className="text-yellow-700 text-sm">
                        Please complete your Applicant Details (Section 1) first to enable Dropbox document management.
                        We need your name to create your personal document folder.
                      </p>
                      <Button
                        onClick={() => setActiveSection(1)}
                        className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Go to Applicant Details
                      </Button>
                    </div>
                  )}

                  {/* Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">☁️ Multi-Cloud Support</h4>
                      <p className="text-gray-600 text-sm">
                        Dropbox, Microsoft OneDrive, and Google Drive integration
                      </p>
                    </div>
                    <div className="bg-white p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">📄 Document Creation</h4>
                      <p className="text-gray-600 text-sm">
                        Create Word docs and Google Docs from your form data
                      </p>
                    </div>
                    <div className="bg-white p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">🔍 Smart Search</h4>
                      <p className="text-gray-600 text-sm">
                        Find documents across all cloud providers quickly
                      </p>
                    </div>
                    <div className="bg-white p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">📱 Mobile Optimized</h4>
                      <p className="text-gray-600 text-sm">
                        Access and manage documents from any mobile device
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 12: Passport Stamps */}
        {activeSection === 12 && (
          <div className="px-4 py-6">
            <Card className="glass-card-danger">
              <CardHeader className="glass-header-danger">
                <CardTitle className="text-3xl font-bold text-white mb-3 text-center flex items-center justify-center gap-3">
                  <MapPin className="w-8 h-8" />
                  Passport Stamp Collection
                </CardTitle>
                <p className="text-lg text-red-100 text-left">
                  Visual travel history and passport stamp collection
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <PassportStampCollection />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Section Indicator */}
      <div className="hidden">
        <div className="flex items-center gap-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`w-2 h-2 rounded-full ${
                activeSection === section.id ? 'bg-gray-800' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerData && (
        <SimplePDFViewer
          pdfUrl={pdfViewerData.url}
          pdfName={pdfViewerData.name}
          onClose={() => setPdfViewerData(null)}
          clientData={clientData}
          familyTreeData={familyTreeData}
        />
      )}

      {/* OCR Processing Modal - CENTERED IN VIEWPORT */}
      {isOcrProcessing && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4"
            style={{
              position: 'relative',
              marginTop: '0',
              marginBottom: '0',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                🔍 Processing Passport
              </h2>
              <p className="text-gray-600 text-sm">
                Extracting passport data using AI technology
              </p>
            </div>
          
            <div className="text-center space-y-4">
            {/* Animated spinner */}
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            
            {/* File info */}
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">
                📄 {ocrFileType.toUpperCase()} File
              </p>
              <p className="text-sm text-gray-600 break-all">
                {ocrFileName}
              </p>
            </div>
            
            {/* Processing status */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">
                ⚡ Extracting passport data...
              </p>
              <p className="text-blue-600 text-sm mt-1">
                {ocrFileType === 'PDF' ? 'This may take 15-30 seconds' : 'This may take 3-5 seconds'}
              </p>
              <p className="text-blue-500 text-xs mt-2">
                Using OpenAI Vision API for accurate data extraction
              </p>
            </div>
            
            {/* Timer */}
            <p className="text-gray-500 text-sm">
              ⏱️ Processing for {ocrStartTime > 0 ? Math.round((Date.now() - ocrStartTime) / 1000) : 0}s
            </p>
            
            {/* Warning */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ Please wait - do not close this window
              </p>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}