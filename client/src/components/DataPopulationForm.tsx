import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Import removed - using local formatDateInput function like Dashboard
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, FileText, Download, Eye, Trash2, Users, FileCheck } from 'lucide-react';
import type { DataEntry } from '@shared/schema';

// Date formatting function to enforce DD.MM.YYYY format with validation - EXACTLY LIKE DASHBOARD
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

// Enhanced comprehensive form schema with all new fields
const DataPopulationSchema = z.object({
  // Applicant Personal Data
  applicantFirstName: z.string().optional(), // BYPASSED - No longer required
  applicantLastName: z.string().optional(), // BYPASSED - No longer required
  applicantBirthName: z.string().optional(),
  applicantDateOfBirth: z.string().optional(), // BYPASSED - No longer required
  applicantPlaceOfBirth: z.string().optional(), // BYPASSED - No longer required
  applicantGender: z.enum(['male', 'female']),
  applicantDocumentType: z.string().optional(), // BYPASSED - No longer required  
  applicantDocumentNumber: z.string().optional(), // BYPASSED - No longer required
  applicantNationality: z.string().optional(), // BYPASSED - No longer required
  applicantMaritalStatus: z.string().optional(),
  
  // Applicant Address
  applicantCountry: z.string().optional(), // BYPASSED - No longer required
  applicantStreet: z.string().optional(), // BYPASSED - No longer required  
  applicantHouseNumber: z.string().optional(), // BYPASSED - No longer required
  applicantApartmentNumber: z.string().optional(),
  applicantPostalCode: z.string().optional(), // BYPASSED - No longer required
  applicantCity: z.string().optional(), // BYPASSED - No longer required
  applicantPhone: z.string().optional(), // BYPASSED - No longer required
  applicantEmail: z.string().optional(), // BYPASSED - No email validation required
  
  // Minor Child Data (optional)
  childFirstName: z.string().optional(),
  childLastName: z.string().optional(),
  childDateOfBirth: z.string().optional(),
  childPlaceOfBirth: z.string().optional(),
  
  // Polish Parent Data (for minor POA - usually same as main applicant)
  polishParentFirstName: z.string().optional(),
  polishParentLastName: z.string().optional(),
  
  // Spouse Data (optional)
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseDocumentNumber: z.string().optional(),
  marriageDate: z.string().optional(),
  marriagePlace: z.string().optional(),
  husbandSurname: z.string().optional(),
  wifeSurname: z.string().optional(),
  childrenSurname: z.string().optional(),
  
  // Parent Data
  fatherFirstName: z.string().optional(),
  fatherLastName: z.string().optional(),
  fatherBirthName: z.string().optional(),
  fatherDateOfBirth: z.string().optional(),
  fatherPlaceOfBirth: z.string().optional(),
  fatherNationality: z.string().optional(),
  fatherEmigrationDate: z.string().optional(),
  fatherNaturalizationDate: z.string().optional(),
  
  motherFirstName: z.string().optional(),
  motherLastName: z.string().optional(),
  motherBirthName: z.string().optional(),
  motherDateOfBirth: z.string().optional(),
  motherPlaceOfBirth: z.string().optional(),
  motherNationality: z.string().optional(),
  motherEmigrationDate: z.string().optional(),
  motherNaturalizationDate: z.string().optional(),
  
  // Grandparent Data
  fatherGrandpaFirstName: z.string().optional(),
  fatherGrandpaLastName: z.string().optional(),
  fatherGrandpaDateOfBirth: z.string().optional(),
  fatherGrandpaPlaceOfBirth: z.string().optional(),
  fatherGrandpaEmigrationDate: z.string().optional(),
  fatherGrandpaNaturalizationDate: z.string().optional(),
  
  fatherGrandmaFirstName: z.string().optional(),
  fatherGrandmaLastName: z.string().optional(),
  fatherGrandmaBirthName: z.string().optional(),
  fatherGrandmaDateOfBirth: z.string().optional(),
  fatherGrandmaPlaceOfBirth: z.string().optional(),
  fatherGrandmaEmigrationDate: z.string().optional(),
  fatherGrandmaNaturalizationDate: z.string().optional(),
  
  motherGrandpaFirstName: z.string().optional(),
  motherGrandpaLastName: z.string().optional(),
  motherGrandpaDateOfBirth: z.string().optional(),
  motherGrandpaPlaceOfBirth: z.string().optional(),
  motherGrandpaEmigrationDate: z.string().optional(),
  motherGrandpaNaturalizationDate: z.string().optional(),
  
  motherGrandmaFirstName: z.string().optional(),
  motherGrandmaLastName: z.string().optional(),
  motherGrandmaBirthName: z.string().optional(),
  motherGrandmaDateOfBirth: z.string().optional(),
  motherGrandmaPlaceOfBirth: z.string().optional(),
  motherGrandmaEmigrationDate: z.string().optional(),
  motherGrandmaNaturalizationDate: z.string().optional(),
  
  // Great Grandparent Data - Father's side
  fatherGreatGrandpaFirstName: z.string().optional(),
  fatherGreatGrandpaLastName: z.string().optional(),
  fatherGreatGrandpaDateOfBirth: z.string().optional(),
  fatherGreatGrandpaPlaceOfBirth: z.string().optional(),
  fatherGreatGrandpaEmigrationDate: z.string().optional(),
  fatherGreatGrandpaNaturalizationDate: z.string().optional(),
  
  fatherGreatGrandmaFirstName: z.string().optional(),
  fatherGreatGrandmaLastName: z.string().optional(),
  fatherGreatGrandmaBirthName: z.string().optional(),
  fatherGreatGrandmaDateOfBirth: z.string().optional(),
  fatherGreatGrandmaPlaceOfBirth: z.string().optional(),
  fatherGreatGrandmaEmigrationDate: z.string().optional(),
  fatherGreatGrandmaNaturalizationDate: z.string().optional(),
  
  // Great Grandparent Data - Mother's side
  motherGreatGrandpaFirstName: z.string().optional(),
  motherGreatGrandpaLastName: z.string().optional(),
  motherGreatGrandpaDateOfBirth: z.string().optional(),
  motherGreatGrandpaPlaceOfBirth: z.string().optional(),
  motherGreatGrandpaEmigrationDate: z.string().optional(),
  motherGreatGrandpaNaturalizationDate: z.string().optional(),
  
  motherGreatGrandmaFirstName: z.string().optional(),
  motherGreatGrandmaLastName: z.string().optional(),
  motherGreatGrandmaBirthName: z.string().optional(),
  motherGreatGrandmaDateOfBirth: z.string().optional(),
  motherGreatGrandmaPlaceOfBirth: z.string().optional(),
  motherGreatGrandmaEmigrationDate: z.string().optional(),
  motherGreatGrandmaNaturalizationDate: z.string().optional(),
  
  // Document specific fields
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  eventPlace: z.string().optional(),
  eventCountry: z.string().optional(),
  registryOffice: z.string().optional(),
  actNumber: z.string().optional(),
  actYear: z.string().optional(),
  
  // Name change fields
  oldName: z.string().optional(),
  newName: z.string().optional(),
  
  // Correction fields
  incorrectData: z.string().optional(),
  correctData: z.string().optional(),
  
  notes: z.string().optional(),
});

type FormData = z.infer<typeof DataPopulationSchema>;

interface OCRResult {
  provider: string;
  confidence: number;
  extractedData: Partial<FormData>;
  recommendations?: string[];
}

interface DataPopulationFormProps {
  onSubmit: (data: FormData) => void;
  onGeneratePDFs: (data: FormData) => void;
  onGenerateSpecificPDF: (data: FormData, pdfType: string) => void;
  isLoading?: boolean;
}

export const DataPopulationForm: React.FC<DataPopulationFormProps> = ({
  onSubmit,
  onGeneratePDFs,
  onGenerateSpecificPDF,
  isLoading = false
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'grok'>('openai');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applicant");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(DataPopulationSchema),
    defaultValues: {
      applicantGender: 'male',
      applicantCountry: '',
      applicantNationality: '',
    }
  });

  // Auto-populate Polish parent from main applicant
  const applicantFirstName = form.watch('applicantFirstName');
  const applicantLastName = form.watch('applicantLastName');

  useEffect(() => {
    if (applicantFirstName && applicantLastName) {
      if (!form.getValues('polishParentFirstName')) {
        form.setValue('polishParentFirstName', applicantFirstName);
      }
      if (!form.getValues('polishParentLastName')) {
        form.setValue('polishParentLastName', applicantLastName);
      }
    }
  }, [applicantFirstName, applicantLastName, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);
        setUploadProgress(30);

        // Process with AI
        try {
          const response = await fetch('/api/data-population/process-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64.split(',')[1], // Remove data:image/... prefix
              provider: selectedProvider,
              documentType: 'auto-detect'
            })
          });

          setUploadProgress(70);
          
          if (!response.ok) {
            throw new Error(`OCR processing failed: ${response.statusText}`);
          }

          const result = await response.json();
          setOcrResult(result);
          setUploadProgress(90);

          // Auto-fill form with extracted data
          if (result.extractedFields) {
            Object.entries(result.extractedFields).forEach(([key, value]) => {
              if (value && typeof value === 'string') {
                form.setValue(key as keyof FormData, value);
              }
            });
          }

          setUploadProgress(100);
        } catch (error) {
          console.error('OCR processing error:', error);
          setOcrResult({
            provider: selectedProvider,
            confidence: 0,
            extractedData: {},
            recommendations: [`Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`]
          });
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setOcrResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (data: FormData) => {
    // Convert names to uppercase as per user preference
    const processedData = {
      ...data,
      applicantFirstName: data.applicantFirstName?.toUpperCase(),
      applicantLastName: data.applicantLastName?.toUpperCase(),
      applicantBirthName: data.applicantBirthName?.toUpperCase(),
      polishParentFirstName: data.polishParentFirstName?.toUpperCase(),
      polishParentLastName: data.polishParentLastName?.toUpperCase(),
      fatherFirstName: data.fatherFirstName?.toUpperCase(),
      fatherLastName: data.fatherLastName?.toUpperCase(),
      motherFirstName: data.motherFirstName?.toUpperCase(),
      motherLastName: data.motherLastName?.toUpperCase(),
      motherBirthName: data.motherBirthName?.toUpperCase(),
      spouseFirstName: data.spouseFirstName?.toUpperCase(),
      spouseLastName: data.spouseLastName?.toUpperCase(),
      childFirstName: data.childFirstName?.toUpperCase(),
      childLastName: data.childLastName?.toUpperCase(),
      // All grandparent names to uppercase
      fatherGrandpaFirstName: data.fatherGrandpaFirstName?.toUpperCase(),
      fatherGrandpaLastName: data.fatherGrandpaLastName?.toUpperCase(),
      fatherGrandmaFirstName: data.fatherGrandmaFirstName?.toUpperCase(),
      fatherGrandmaLastName: data.fatherGrandmaLastName?.toUpperCase(),
      fatherGrandmaBirthName: data.fatherGrandmaBirthName?.toUpperCase(),
      motherGrandpaFirstName: data.motherGrandpaFirstName?.toUpperCase(),
      motherGrandpaLastName: data.motherGrandpaLastName?.toUpperCase(),
      motherGrandmaFirstName: data.motherGrandmaFirstName?.toUpperCase(),
      motherGrandmaLastName: data.motherGrandmaLastName?.toUpperCase(),
      motherGrandmaBirthName: data.motherGrandmaBirthName?.toUpperCase(),
      // All great grandparent names to uppercase
      fatherGreatGrandpaFirstName: data.fatherGreatGrandpaFirstName?.toUpperCase(),
      fatherGreatGrandpaLastName: data.fatherGreatGrandpaLastName?.toUpperCase(),
      fatherGreatGrandmaFirstName: data.fatherGreatGrandmaFirstName?.toUpperCase(),
      fatherGreatGrandmaLastName: data.fatherGreatGrandmaLastName?.toUpperCase(),
      fatherGreatGrandmaBirthName: data.fatherGreatGrandmaBirthName?.toUpperCase(),
      motherGreatGrandpaFirstName: data.motherGreatGrandpaFirstName?.toUpperCase(),
      motherGreatGrandpaLastName: data.motherGreatGrandpaLastName?.toUpperCase(),
      motherGreatGrandmaFirstName: data.motherGreatGrandmaFirstName?.toUpperCase(),
      motherGreatGrandmaLastName: data.motherGreatGrandmaLastName?.toUpperCase(),
      motherGreatGrandmaBirthName: data.motherGreatGrandmaBirthName?.toUpperCase(),
    };
    
    onSubmit(processedData);
  };

  const handleSpecificPDFGeneration = (pdfType: string) => {
    const data = form.getValues();
    const processedData = {
      ...data,
      applicantFirstName: data.applicantFirstName?.toUpperCase(),
      applicantLastName: data.applicantLastName?.toUpperCase(),
      // ... same processing as above
    };
    onGenerateSpecificPDF(processedData, pdfType);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Enhanced Polish Document Population System
          </CardTitle>
          <p className="text-blue-100">
            Upload documents for AI extraction or enter data manually. Generate individual or bulk Polish citizenship documents.
          </p>
        </CardHeader>
      </Card>

      {/* OCR Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Document Upload & AI Extraction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>AI Provider</Label>
              <Select 
                value={selectedProvider} 
                onValueChange={(value: any) => setSelectedProvider(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" sideOffset={4}>
                  <SelectItem value="openai">OpenAI (Recommended for OCR)</SelectItem>
                  <SelectItem value="claude">Claude (Best for Analysis)</SelectItem>
                  <SelectItem value="grok">Grok (Latest Technology)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Upload Document</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadedImage && (
                  <Button variant="outline" size="sm" onClick={clearUpload}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Progress and Results */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing with {selectedProvider}...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {ocrResult && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={ocrResult.confidence > 0.8 ? "default" : "secondary"}>
                      {ocrResult.provider} - {Math.round(ocrResult.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  {ocrResult.recommendations && ocrResult.recommendations.length > 0 && (
                    <div className="text-sm">
                      <strong>Recommendations:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {ocrResult.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile-optimized Tab List - Horizontal Scrollable */}
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-8 lg:grid-cols-8 gap-1 h-auto p-1 w-max lg:w-full">
              <TabsTrigger value="applicant" className="text-xs px-2 py-1 whitespace-nowrap">Applicant</TabsTrigger>
              <TabsTrigger value="address" className="text-xs px-2 py-1 whitespace-nowrap">Address</TabsTrigger>
              <TabsTrigger value="family" className="text-xs px-2 py-1 whitespace-nowrap">Family</TabsTrigger>
              <TabsTrigger value="parents" className="text-xs px-2 py-1 whitespace-nowrap">Parents</TabsTrigger>
              <TabsTrigger value="grandparents" className="text-xs px-2 py-1 whitespace-nowrap">Grandparents</TabsTrigger>
              <TabsTrigger value="greatgrandparents" className="text-xs px-2 py-1 whitespace-nowrap">Great Grandparents</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs px-2 py-1 whitespace-nowrap">Documents</TabsTrigger>
              <TabsTrigger value="generate" className="text-xs px-2 py-1 whitespace-nowrap">Generate PDFs</TabsTrigger>
            </TabsList>
          </div>

          {/* Applicant Tab */}
          <TabsContent value="applicant">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantFirstName">First Name / Given Names *</Label>
                  <Input
                    id="applicantFirstName"
                    {...form.register('applicantFirstName')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    onChange={(e) => form.setValue('applicantFirstName', e.target.value.toUpperCase())}
                  />
                  {form.formState.errors.applicantFirstName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantFirstName.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantLastName">Last Name / Surname *</Label>
                  <Input
                    id="applicantLastName"
                    {...form.register('applicantLastName')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    onChange={(e) => form.setValue('applicantLastName', e.target.value.toUpperCase())}
                  />
                  {form.formState.errors.applicantLastName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantLastName.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantBirthName">Birth Name / Maiden Name</Label>
                  <Input
                    id="applicantBirthName"
                    {...form.register('applicantBirthName')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    onChange={(e) => form.setValue('applicantBirthName', e.target.value.toUpperCase())}
                  />
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantDateOfBirth">Date of Birth (DD.MM.YYYY) *</Label>
                  <Input
                    id="applicantDateOfBirth"
                    type="tel"
                    inputMode="numeric"
                    placeholder="DD.MM.YYYY"
                    {...form.register('applicantDateOfBirth')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    onChange={(e) => {
                      const formatted = formatDateInput(e.target.value);
                      form.setValue('applicantDateOfBirth', formatted);
                    }}
                  />
                  {form.formState.errors.applicantDateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantDateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantPlaceOfBirth">Place of Birth *</Label>
                  <Input
                    id="applicantPlaceOfBirth"
                    {...form.register('applicantPlaceOfBirth')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantPlaceOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantPlaceOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantGender">Gender *</Label>
                  <RadioGroup
                    value={form.watch('applicantGender')}
                    onValueChange={(value) => form.setValue('applicantGender', value as 'male' | 'female')}
                    className="mt-3 space-y-3"
                  >
                    <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="male" id="male" className="w-4 h-4" />
                      <Label htmlFor="male" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Male / Mężczyzna</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="female" id="female" className="w-4 h-4" />
                      <Label htmlFor="female" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Female / Kobieta</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.applicantGender && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantGender.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantDocumentType">Document Type *</Label>
                  <Input
                    id="applicantDocumentType"
                    placeholder="Passport, ID Card, etc."
                    {...form.register('applicantDocumentType')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantDocumentType && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantDocumentType.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantDocumentNumber">Document Number *</Label>
                  <Input
                    id="applicantDocumentNumber"
                    {...form.register('applicantDocumentNumber')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantDocumentNumber && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantDocumentNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantNationality">Nationality *</Label>
                  <Input
                    id="applicantNationality"
                    {...form.register('applicantNationality')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantNationality && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantNationality.message}</p>
                  )}
                </div>


                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantMaritalStatus">Marital Status</Label>
                  <RadioGroup
                    value={form.watch('applicantMaritalStatus') || ''}
                    onValueChange={(value) => form.setValue('applicantMaritalStatus', value)}
                    className="mt-3 space-y-3"
                  >
                    <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="single" id="single" className="w-4 h-4" />
                      <Label htmlFor="single" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Single / Kawaler/Panna</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="married" id="married" className="w-4 h-4" />
                      <Label htmlFor="married" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Married / Żonaty/Zamężna</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="divorced" id="divorced" className="w-4 h-4" />
                      <Label htmlFor="divorced" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Divorced / Rozwiedziony/a</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="widowed" id="widowed" className="w-4 h-4" />
                      <Label htmlFor="widowed" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Widowed / Wdowiec/Wdowa</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantCountry">Country *</Label>
                  <Input
                    id="applicantCountry"
                    {...form.register('applicantCountry')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantCountry && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantCountry.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantStreet">Street *</Label>
                  <Input
                    id="applicantStreet"
                    {...form.register('applicantStreet')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantStreet && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantStreet.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantHouseNumber">House Number *</Label>
                  <Input
                    id="applicantHouseNumber"
                    {...form.register('applicantHouseNumber')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantHouseNumber && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantHouseNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantApartmentNumber">Apartment Number</Label>
                  <Input
                    id="applicantApartmentNumber"
                    {...form.register('applicantApartmentNumber')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantPostalCode">Postal Code *</Label>
                  <Input
                    id="applicantPostalCode"
                    {...form.register('applicantPostalCode')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantPostalCode && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantPostalCode.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantCity">City *</Label>
                  <Input
                    id="applicantCity"
                    {...form.register('applicantCity')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantCity && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantCity.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantPhone">Phone Number *</Label>
                  <Input
                    id="applicantPhone"
                    {...form.register('applicantPhone')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantPhone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="applicantEmail">Email Address *</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    {...form.register('applicantEmail')}
                    className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                  />
                  {form.formState.errors.applicantEmail && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.applicantEmail.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family">
            <div className="space-y-6">
              {/* Minor Child Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Minor Child Information (for Minor POA)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="childFirstName">Child's First Name</Label>
                    <Input
                      id="childFirstName"
                      {...form.register('childFirstName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('childFirstName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="childLastName">Child's Last Name</Label>
                    <Input
                      id="childLastName"
                      {...form.register('childLastName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('childLastName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="childDateOfBirth">Child's Date of Birth</Label>
                    <Input
                      id="childDateOfBirth"
                      type="tel"
                      inputMode="numeric"
                      placeholder="DD.MM.YYYY"
                      {...form.register('childDateOfBirth')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        form.setValue('childDateOfBirth', formatted);
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="childPlaceOfBirth">Child's Place of Birth</Label>
                    <Input
                      id="childPlaceOfBirth"
                      {...form.register('childPlaceOfBirth')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="polishParentFirstName">Polish Parent First Name</Label>
                    <Input
                      id="polishParentFirstName"
                      {...form.register('polishParentFirstName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('polishParentFirstName', e.target.value.toUpperCase())}
                      placeholder="Usually same as main applicant"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from main applicant data</p>
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="polishParentLastName">Polish Parent Last Name</Label>
                    <Input
                      id="polishParentLastName"
                      {...form.register('polishParentLastName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('polishParentLastName', e.target.value.toUpperCase())}
                      placeholder="Usually same as main applicant"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from main applicant data</p>
                  </div>
                </CardContent>
              </Card>

              {/* Spouse Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Spouse Information (for Spouse POA)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="spouseFirstName">Spouse First Name</Label>
                    <Input
                      id="spouseFirstName"
                      {...form.register('spouseFirstName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('spouseFirstName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="spouseLastName">Spouse Last Name</Label>
                    <Input
                      id="spouseLastName"
                      {...form.register('spouseLastName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('spouseLastName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="spouseDocumentNumber">Spouse Document Number</Label>
                    <Input
                      id="spouseDocumentNumber"
                      {...form.register('spouseDocumentNumber')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="marriageDate">Marriage Date</Label>
                    <Input
                      id="marriageDate"
                      type="tel"
                      inputMode="numeric"
                      placeholder="DD.MM.YYYY"
                      {...form.register('marriageDate')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        form.setValue('marriageDate', formatted);
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="marriagePlace">Marriage Place</Label>
                    <Input
                      id="marriagePlace"
                      {...form.register('marriagePlace')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="husbandSurname">Husband Surname after marriage</Label>
                    <Input
                      id="husbandSurname"
                      {...form.register('husbandSurname')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('husbandSurname', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="wifeSurname">Wife Surname after marriage</Label>
                    <Input
                      id="wifeSurname"
                      {...form.register('wifeSurname')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('wifeSurname', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="childrenSurname">Children Surname</Label>
                    <Textarea
                      id="childrenSurname"
                      {...form.register('childrenSurname')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      placeholder="List all children's surnames"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Parents Tab - Enhanced with emigration and naturalization dates */}
          <TabsContent value="parents">
            <div className="space-y-6">
              {/* Father */}
              <Card>
                <CardHeader>
                  <CardTitle>Father Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherFirstName">First Name</Label>
                    <Input
                      id="fatherFirstName"
                      {...form.register('fatherFirstName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('fatherFirstName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherLastName">Last Name</Label>
                    <Input
                      id="fatherLastName"
                      {...form.register('fatherLastName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('fatherLastName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherBirthName">Birth Name</Label>
                    <Input
                      id="fatherBirthName"
                      {...form.register('fatherBirthName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('fatherBirthName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherDateOfBirth">Date of Birth</Label>
                    <Input
                      id="fatherDateOfBirth"
                      type="tel"
                      inputMode="numeric"
                      placeholder="DD.MM.YYYY"
                      {...form.register('fatherDateOfBirth')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        form.setValue('fatherDateOfBirth', formatted);
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherPlaceOfBirth">Place of Birth</Label>
                    <Input
                      id="fatherPlaceOfBirth"
                      {...form.register('fatherPlaceOfBirth')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherNationality">Nationality</Label>
                    <Input
                      id="fatherNationality"
                      {...form.register('fatherNationality')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherPesel">PESEL Number</Label>
                    <Input
                      id="fatherPesel"
                      {...form.register('fatherPesel')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherEmigrationDate">Emigration Date</Label>
                    <Input
                      id="fatherEmigrationDate"
                      type="tel"
                      inputMode="numeric"
                      placeholder="DD.MM.YYYY"
                      {...form.register('fatherEmigrationDate')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        form.setValue('fatherEmigrationDate', formatted);
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherNaturalizationDate">Naturalization Date</Label>
                    <Input
                      id="fatherNaturalizationDate"
                      type="tel"
                      inputMode="numeric"
                      placeholder="DD.MM.YYYY"
                      {...form.register('fatherNaturalizationDate')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        form.setValue('fatherNaturalizationDate', formatted);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mother */}
              <Card>
                <CardHeader>
                  <CardTitle>Mother Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherFirstName">First Name</Label>
                    <Input
                      id="motherFirstName"
                      {...form.register('motherFirstName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('motherFirstName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherLastName">Last Name</Label>
                    <Input
                      id="motherLastName"
                      {...form.register('motherLastName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('motherLastName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherBirthName">Birth Name</Label>
                    <Input
                      id="motherBirthName"
                      {...form.register('motherBirthName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('motherBirthName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherDateOfBirth">Date of Birth</Label>
                    <Input
                      id="motherDateOfBirth"
                      type="tel"
                      inputMode="numeric"
                      placeholder="DD.MM.YYYY"
                      {...form.register('motherDateOfBirth')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => {
                        const formatted = formatDateInput(e.target.value);
                        form.setValue('motherDateOfBirth', formatted);
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherPlaceOfBirth">Place of Birth</Label>
                    <Input
                      id="motherPlaceOfBirth"
                      {...form.register('motherPlaceOfBirth')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherNationality">Nationality</Label>
                    <Input
                      id="motherNationality"
                      {...form.register('motherNationality')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>


                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherEmigrationDate">Emigration Date</Label>
                    <Input
                      id="motherEmigrationDate"
                      type="tel"
                      inputMode="numeric"
                      
                      placeholder="DD.MM.YYYY"
                      {...form.register('motherEmigrationDate')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherNaturalizationDate">Naturalization Date</Label>
                    <Input
                      id="motherNaturalizationDate"
                      type="tel"
                      inputMode="numeric"
                      
                      placeholder="DD.MM.YYYY"
                      {...form.register('motherNaturalizationDate')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grandparents Tab - Enhanced with emigration and naturalization dates */}
          <TabsContent value="grandparents">
            <div className="space-y-6">
              {/* Paternal Grandparents */}
              <Card>
                <CardHeader>
                  <CardTitle>Paternal Grandparents (Father's Parents)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h4 className="font-semibold text-lg">Grandfather (Father's Father)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandpaFirstName">First Name</Label>
                      <Input
                        id="fatherGrandpaFirstName"
                        {...form.register('fatherGrandpaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGrandpaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandpaLastName">Last Name</Label>
                      <Input
                        id="fatherGrandpaLastName"
                        {...form.register('fatherGrandpaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGrandpaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandpaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="fatherGrandpaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGrandpaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('fatherGrandpaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandpaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="fatherGrandpaPlaceOfBirth"
                        {...form.register('fatherGrandpaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandpaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="fatherGrandpaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGrandpaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandpaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="fatherGrandpaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGrandpaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>

                  <h4 className="font-semibold text-lg mt-6">Grandmother (Father's Mother)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaFirstName">First Name</Label>
                      <Input
                        id="fatherGrandmaFirstName"
                        {...form.register('fatherGrandmaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGrandmaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaLastName">Last Name</Label>
                      <Input
                        id="fatherGrandmaLastName"
                        {...form.register('fatherGrandmaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGrandmaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaBirthName">Birth Name</Label>
                      <Input
                        id="fatherGrandmaBirthName"
                        {...form.register('fatherGrandmaBirthName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGrandmaBirthName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="fatherGrandmaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGrandmaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('fatherGrandmaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="fatherGrandmaPlaceOfBirth"
                        {...form.register('fatherGrandmaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="fatherGrandmaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGrandmaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGrandmaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="fatherGrandmaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGrandmaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maternal Grandparents */}
              <Card>
                <CardHeader>
                  <CardTitle>Maternal Grandparents (Mother's Parents)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h4 className="font-semibold text-lg">Grandfather (Mother's Father)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandpaFirstName">First Name</Label>
                      <Input
                        id="motherGrandpaFirstName"
                        {...form.register('motherGrandpaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGrandpaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandpaLastName">Last Name</Label>
                      <Input
                        id="motherGrandpaLastName"
                        {...form.register('motherGrandpaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGrandpaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandpaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="motherGrandpaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGrandpaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('motherGrandpaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandpaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="motherGrandpaPlaceOfBirth"
                        {...form.register('motherGrandpaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandpaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="motherGrandpaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGrandpaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandpaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="motherGrandpaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGrandpaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>

                  <h4 className="font-semibold text-lg mt-6">Grandmother (Mother's Mother)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaFirstName">First Name</Label>
                      <Input
                        id="motherGrandmaFirstName"
                        {...form.register('motherGrandmaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGrandmaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaLastName">Last Name</Label>
                      <Input
                        id="motherGrandmaLastName"
                        {...form.register('motherGrandmaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGrandmaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaBirthName">Birth Name</Label>
                      <Input
                        id="motherGrandmaBirthName"
                        {...form.register('motherGrandmaBirthName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGrandmaBirthName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="motherGrandmaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGrandmaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('motherGrandmaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="motherGrandmaPlaceOfBirth"
                        {...form.register('motherGrandmaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="motherGrandmaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGrandmaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGrandmaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="motherGrandmaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGrandmaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NEW Great Grandparents Tab */}
          <TabsContent value="greatgrandparents">
            <div className="space-y-6">
              {/* Paternal Great Grandparents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Paternal Great Grandparents (Father's Grandparents)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h4 className="font-semibold text-lg">Great Grandfather (Father's Father's Father)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandpaFirstName">First Name</Label>
                      <Input
                        id="fatherGreatGrandpaFirstName"
                        {...form.register('fatherGreatGrandpaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGreatGrandpaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandpaLastName">Last Name</Label>
                      <Input
                        id="fatherGreatGrandpaLastName"
                        {...form.register('fatherGreatGrandpaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGreatGrandpaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandpaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="fatherGreatGrandpaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGreatGrandpaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('fatherGreatGrandpaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandpaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="fatherGreatGrandpaPlaceOfBirth"
                        {...form.register('fatherGreatGrandpaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandpaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="fatherGreatGrandpaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGreatGrandpaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandpaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="fatherGreatGrandpaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGreatGrandpaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>

                  <h4 className="font-semibold text-lg mt-6">Great Grandmother (Father's Father's Mother)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaFirstName">First Name</Label>
                      <Input
                        id="fatherGreatGrandmaFirstName"
                        {...form.register('fatherGreatGrandmaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGreatGrandmaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaLastName">Last Name</Label>
                      <Input
                        id="fatherGreatGrandmaLastName"
                        {...form.register('fatherGreatGrandmaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGreatGrandmaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaBirthName">Birth Name</Label>
                      <Input
                        id="fatherGreatGrandmaBirthName"
                        {...form.register('fatherGreatGrandmaBirthName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('fatherGreatGrandmaBirthName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="fatherGreatGrandmaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGreatGrandmaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('fatherGreatGrandmaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="fatherGreatGrandmaPlaceOfBirth"
                        {...form.register('fatherGreatGrandmaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="fatherGreatGrandmaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGreatGrandmaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="fatherGreatGrandmaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="fatherGreatGrandmaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('fatherGreatGrandmaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maternal Great Grandparents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Maternal Great Grandparents (Mother's Grandparents)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h4 className="font-semibold text-lg">Great Grandfather (Mother's Father's Father)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandpaFirstName">First Name</Label>
                      <Input
                        id="motherGreatGrandpaFirstName"
                        {...form.register('motherGreatGrandpaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGreatGrandpaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandpaLastName">Last Name</Label>
                      <Input
                        id="motherGreatGrandpaLastName"
                        {...form.register('motherGreatGrandpaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGreatGrandpaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandpaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="motherGreatGrandpaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGreatGrandpaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('motherGreatGrandpaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandpaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="motherGreatGrandpaPlaceOfBirth"
                        {...form.register('motherGreatGrandpaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandpaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="motherGreatGrandpaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGreatGrandpaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandpaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="motherGreatGrandpaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGreatGrandpaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>

                  <h4 className="font-semibold text-lg mt-6">Great Grandmother (Mother's Father's Mother)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaFirstName">First Name</Label>
                      <Input
                        id="motherGreatGrandmaFirstName"
                        {...form.register('motherGreatGrandmaFirstName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGreatGrandmaFirstName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaLastName">Last Name</Label>
                      <Input
                        id="motherGreatGrandmaLastName"
                        {...form.register('motherGreatGrandmaLastName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGreatGrandmaLastName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaBirthName">Birth Name</Label>
                      <Input
                        id="motherGreatGrandmaBirthName"
                        {...form.register('motherGreatGrandmaBirthName')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => form.setValue('motherGreatGrandmaBirthName', e.target.value.toUpperCase())}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaDateOfBirth">Date of Birth</Label>
                      <Input
                        id="motherGreatGrandmaDateOfBirth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGreatGrandmaDateOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          form.setValue('motherGreatGrandmaDateOfBirth', formatted);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaPlaceOfBirth">Place of Birth</Label>
                      <Input
                        id="motherGreatGrandmaPlaceOfBirth"
                        {...form.register('motherGreatGrandmaPlaceOfBirth')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaEmigrationDate">Emigration Date</Label>
                      <Input
                        id="motherGreatGrandmaEmigrationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGreatGrandmaEmigrationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="motherGreatGrandmaNaturalizationDate">Naturalization Date</Label>
                      <Input
                        id="motherGreatGrandmaNaturalizationDate"
                        type="tel"
                        inputMode="numeric"
                        
                        placeholder="DD.MM.YYYY"
                        {...form.register('motherGreatGrandmaNaturalizationDate')}
                        className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Specific Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="eventType">Event Type</Label>
                    <RadioGroup
                      onValueChange={(value) => form.setValue('eventType', value)}
                      className="mt-3 space-y-3"
                    >
                      <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                        <RadioGroupItem value="birth" id="birth" className="w-4 h-4" />
                        <Label htmlFor="birth" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Birth / Urodzenie</Label>
                      </div>
                      <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                        <RadioGroupItem value="marriage" id="marriage" className="w-4 h-4" />
                        <Label htmlFor="marriage" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Marriage / Małżeństwo</Label>
                      </div>
                      <div className="flex items-center space-x-4 p-6 rounded-xl border-3 border-gray-200 hover:border-blue-300 transition-colors">
                        <RadioGroupItem value="death" id="death" className="w-4 h-4" />
                        <Label htmlFor="death" className="text-2xl lg:text-3xl font-medium cursor-pointer flex-1">Death / Zgon</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="tel"
                      inputMode="numeric"
                      
                      placeholder="DD.MM.YYYY"
                      {...form.register('eventDate')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="eventPlace">Event Place</Label>
                    <Input
                      id="eventPlace"
                      {...form.register('eventPlace')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="eventCountry">Event Country</Label>
                    <Input
                      id="eventCountry"
                      {...form.register('eventCountry')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="registryOffice">Registry Office</Label>
                    <Input
                      id="registryOffice"
                      {...form.register('registryOffice')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="actNumber">Act Number</Label>
                    <Input
                      id="actNumber"
                      {...form.register('actNumber')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="actYear">Act Year</Label>
                    <Input
                      id="actYear"
                      {...form.register('actYear')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="oldName">Old Name (for name changes)</Label>
                    <Input
                      id="oldName"
                      {...form.register('oldName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('oldName', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="newName">New Name (for name changes)</Label>
                    <Input
                      id="newName"
                      {...form.register('newName')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                      onChange={(e) => form.setValue('newName', e.target.value.toUpperCase())}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Corrections & Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="incorrectData">Incorrect Data (for corrections)</Label>
                    <Textarea
                      id="incorrectData"
                      placeholder="Describe the incorrect data that needs to be corrected"
                      {...form.register('incorrectData')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="correctData">Correct Data (for corrections)</Label>
                    <Textarea
                      id="correctData"
                      placeholder="Provide the correct data"
                      {...form.register('correctData')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-lg lg:text-xl font-semibold mb-2 block" htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information or special circumstances"
                      {...form.register('notes')}
                      className="w-full h-20 lg:h-24 text-2xl lg:text-3xl px-8 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NEW Generate PDFs Tab */}
          <TabsContent value="generate">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-6 w-6" />
                    Individual PDF Generation
                  </CardTitle>
                  <p className="text-sm text-gray-600">Generate specific documents based on your needs</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      type="button"
                      onClick={() => handleSpecificPDFGeneration('POA_GENERAL')}
                      disabled={isLoading}
                      className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      General Power of Attorney
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSpecificPDFGeneration('POA_MINOR')}
                      disabled={isLoading}
                      className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Minor Power of Attorney
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSpecificPDFGeneration('POA_SPOUSES')}
                      disabled={isLoading}
                      className="h-20 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Spouse Power of Attorney
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSpecificPDFGeneration('CITIZENSHIP_APPLICATION')}
                      disabled={isLoading}
                      className="h-20 flex flex-col items-center justify-center bg-red-600 hover:bg-red-700 text-white"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Citizenship Application
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSpecificPDFGeneration('FAMILY_TREE')}
                      disabled={isLoading}
                      className="h-20 flex flex-col items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Users className="h-6 w-6 mb-2" />
                      Family Tree
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleSpecificPDFGeneration('CIVIL_REGISTRY')}
                      disabled={isLoading}
                      className="h-20 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Civil Registry Forms
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bulk Generation Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={() => onGeneratePDFs(form.getValues())}
                      disabled={isLoading}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white h-16"
                    >
                      <Download className="mr-3 h-6 w-6" />
                      Generate All PDFs (Complete Package)
                    </Button>

                    <p className="text-sm text-gray-600 text-center">
                      This will generate all applicable documents based on the data you've entered and create a ZIP archive for download.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons - Always visible */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Clear Form
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Save Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

    </div>
  );
};