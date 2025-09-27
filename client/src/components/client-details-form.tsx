import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { User, Users, Calendar, MapPin, Phone, Mail, FileText, Heart, Baby, Upload } from "lucide-react";

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

// Schema for client details form matching exact field names used in the form
const ClientDetailsSchema = z.object({
  // Names (RENAMED TO MATCH PDF TEMPLATES EXACTLY)
  firstNames: z.string().optional(),          // Was: names (PDF field alignment)
  lastName: z.string().optional(),            // Was: familyName (PDF field alignment)
  maidenName: z.string().optional(),          // New: required for PDF templates
  
  // Passport Information (MAPS TO PDF FIELDS)
  passportNumber: z.string().optional(),      // Maps to: nr_dok_tozsamosci
  
  // Spouse Information (if married)
  spouseFullName: z.string().optional(),
  spouseFirstNames: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseMaidenName: z.string().optional(),
  spousePassportNumber: z.string().optional(),
  
  // Birth Information (RENAMED FOR PDF ALIGNMENT)
  birthDate: z.string().optional(),           // Was: dateOfBirth (DD.MM.YYYY format)
  birthPlace: z.string().optional(),          // Was: placeOfBirth
  
  // Marriage Information
  dateOfMarriage: z.string().optional(),
  placeOfMarriage: z.string().optional(),
  marriageDate: z.string().optional(),
  marriagePlace: z.string().optional(),
  married: z.string().optional(),
  
  // Contact Information (RENAMED FOR PDF ALIGNMENT)
  mobilePhone: z.string().optional(),         // Was: phoneNumber
  email: z.string().optional(),
  
  // Address Information (EXPANDED FOR PDF REQUIREMENTS)
  currentAddress: z.string().optional(),      // Was: exactPostalAddress
  street: z.string().optional(),              // New: street component
  houseNumber: z.string().optional(),         // New: house number
  apartmentNumber: z.string().optional(),     // New: apartment (optional)
  city: z.string().optional(),                // New: city component
  state: z.string().optional(),               // New: state/province
  postalCode: z.string().optional(),          // New: postal code
  
  // NEW FIELDS REQUIRED FOR PDF TEMPLATES
  gender: z.enum(['mężczyzna', 'kobieta', '']).optional(), // Required in Polish
  maritalStatus: z.string().optional(),       // Required in Polish terms
  foreignCitizenshipsWithDates: z.string().optional(), // Citizenship details
  
  // Legacy fields for compatibility
  applicantName: z.string().optional(),
  applicantLastName: z.string().optional(),
  applicantFirstNames: z.string().optional(),
  spouseName: z.string().optional(),
  
  // Parent information for family tree sync
  fatherFullName: z.string().optional(),
  motherFullName: z.string().optional(),
  motherMaidenName: z.string().optional(),
  
  // Children information
  hasChildren: z.string().optional(),
  numberOfChildren: z.string().optional(),
  child1FirstNames: z.string().optional(),
  child1LastName: z.string().optional(),
  child1DateOfBirth: z.string().optional(),
  child2FirstNames: z.string().optional(),
  child2LastName: z.string().optional(),
  child2DateOfBirth: z.string().optional(),
  child3FirstNames: z.string().optional(),
  child3LastName: z.string().optional(),
  child3DateOfBirth: z.string().optional(),
  child4FirstNames: z.string().optional(),
  child4LastName: z.string().optional(),
  child4DateOfBirth: z.string().optional(),
  child5FirstNames: z.string().optional(),
  child5LastName: z.string().optional(),
  child5DateOfBirth: z.string().optional(),
  child6FirstNames: z.string().optional(),
  child6LastName: z.string().optional(),
  child6DateOfBirth: z.string().optional(),
});

export type ClientDetailsData = z.infer<typeof ClientDetailsSchema>;

interface ClientDetailsFormProps {
  onSubmit: (data: ClientDetailsData) => void;
  initialData?: Partial<ClientDetailsData>;
  syncedData?: Partial<ClientDetailsData>;
  onNavigateToSection?: (sectionId: number) => void;
}

export function ClientDetailsForm({ onSubmit, initialData, syncedData, onNavigateToSection }: ClientDetailsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge initial data with synced data, prioritizing synced data
  const mergedData = { ...initialData, ...syncedData };

  const form = useForm<ClientDetailsData>({
    resolver: zodResolver(ClientDetailsSchema),
    defaultValues: {
      // CORRECTED FIELD NAMES TO MATCH PDF TEMPLATES
      firstNames: mergedData?.firstNames || "",
      lastName: mergedData?.lastName || "",
      maidenName: mergedData?.maidenName || "",
      passportNumber: mergedData?.passportNumber || "",
      spouseFullName: mergedData?.spouseFullName || "",
      spousePassportNumber: mergedData?.spousePassportNumber || "",
      birthDate: mergedData?.birthDate || "",
      birthPlace: mergedData?.birthPlace || "",
      dateOfMarriage: mergedData?.dateOfMarriage || "",
      placeOfMarriage: mergedData?.placeOfMarriage || "",
      mobilePhone: mergedData?.mobilePhone || "",
      email: mergedData?.email || "",
      currentAddress: mergedData?.currentAddress || "",
      // Legacy field names for compatibility
      applicantName: mergedData?.applicantName || "",
      applicantLastName: mergedData?.applicantLastName || "",
      applicantFirstNames: mergedData?.applicantFirstNames || "",
      fatherFullName: mergedData?.fatherFullName || "",
      motherFullName: mergedData?.motherFullName || "",
    },
  });

  // Auto-populate form when synced data changes
  useEffect(() => {
    if (syncedData && Object.keys(syncedData).length > 0) {
      Object.entries(syncedData).forEach(([key, value]) => {
        if (value && value !== form.getValues(key as keyof ClientDetailsData)) {
          form.setValue(key as keyof ClientDetailsData, value as any);
        }
      });
      
      toast({
        title: "✓ Data synchronized",
        description: "Form fields have been automatically populated from other sections.",
      });
    }
  }, [syncedData, form, toast]);

  const handleSubmit = async (data: ClientDetailsData) => {
    setIsSubmitting(true);
    try {
      // Format names according to requirements:
      // First and middle names: Andrew John
      // Surnames: MALINSKI
      const formattedData = {
        ...data,
        applicantName: formatName(data.applicantFirstNames || "", data.applicantLastName || ""),
        fatherFullName: formatFullName(data.fatherFullName || ""),
        motherFullName: formatFullName(data.motherFullName || ""),
        spouseFullName: data.spouseFullName ? formatFullName(data.spouseFullName) : data.spouseFullName,
      };

      onSubmit(formattedData);
      
      toast({
        title: "✓ Client details saved successfully",
        description: "Your information has been saved and is ready for document processing.",
      });
    } catch (error) {
      toast({
        title: "Error saving client details",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format name according to requirements: Andrew John MALINSKI
  const formatName = (firstNames: string, lastName: string) => {
    const formattedFirstNames = firstNames
      .split(' ')
      .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(' ');
    const formattedLastName = lastName.toUpperCase();
    return `${formattedFirstNames} ${formattedLastName}`;
  };

  // Format full name for parents/spouse
  const formatFullName = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length < 2) return fullName.toUpperCase();
    
    const firstNames = parts.slice(0, -1)
      .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(' ');
    const lastName = parts[parts.length - 1].toUpperCase();
    return `${firstNames} ${lastName}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white shadow-xl border-0 border-l-2 border-l-green-500">
        {/* INPUT Section Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-b-4 border-green-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
              INPUT 1
            </div>
            <div className="h-px w-16 bg-green-400 rounded"></div>
            <User className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-800 text-center mb-2">
            Client Details Form
          </h2>
          <p className="text-green-700 text-lg max-w-2xl mx-auto text-center">
            Fill out your personal information - this data will automatically sync to Document Processing and Family Tree sections
          </p>
        </div>
        
        <CardHeader className="text-center pb-8">
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your personal information - this data will automatically sync to Document Processing and Family Tree sections.
          </p>
        </CardHeader>
        
        <CardContent className="p-6 lg:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12">
              
              {/* Personal Information Section */}
              <div className="space-y-10">
                <div className="text-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-blue-800 flex items-center justify-center gap-3 mb-2">
                    <User className="h-7 w-7" />
                    Personal Information
                  </h3>
                  <div className="w-24 h-0.5 bg-blue-600 mx-auto rounded"></div>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="applicantFirstNames"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            FIRST NAME
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Enter your first and middle names exactly as they appear on your passport
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Example: Andrew John"
                              className="w-full h-24 text-3xl px-8 py-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="applicantLastName"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            FAMILY NAME
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Enter your family name exactly as it appears on your passport
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Example: MALINSKI"
                              className="w-full h-24 text-3xl px-8 py-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg uppercase font-bold"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maidenName"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            MAIDEN NAME
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="for female SURNAME AT BIRTH"
                              className="w-full h-24 text-3xl px-8 py-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg uppercase font-bold"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Calendar className="h-6 w-6" />
                            Date of Birth <span className="text-gray-400 font-normal">(DD.MM.YYYY)</span>
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Enter the date you were born
                          </div>
                          <FormControl>
                            <Input 
                              value={field.value || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                field.onChange(formatted);
                              }}
                              placeholder="DD.MM.YYYY"
                              type="tel"
                              inputMode="numeric"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthPlace"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <MapPin className="h-6 w-6" />
                            Place of Birth
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            City and country where you were born
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Example: Warsaw, Poland"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <FormField
                      control={form.control}
                      name="passportNumber"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <FileText className="h-6 w-6" />
                            Passport/ID Number
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Your current passport or national ID number
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Example: 123456789"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Passport Upload Button */}
                  <div className="flex justify-center pt-4 pb-6">
                    <Button
                      type="button"
                      onClick={() => onNavigateToSection?.(11)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xl lg:text-2xl px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-bold h-16 lg:h-20"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="h-6 w-6" />
                        UPLOAD YOUR VALID PASSPORT COPY
                      </div>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <User className="h-6 w-6" />
                            GENDER
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Select your gender
                          </div>
                          <FormControl>
                            <select 
                              {...field}
                              value={field.value || 'kobieta'}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                // Clear maiden name if switching to male
                                if (e.target.value === 'mężczyzna') {
                                  form.setValue('maidenName', '');
                                }
                              }}
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            >
                              <option value="kobieta">FEMALE</option>
                              <option value="mężczyzna">MALE</option>
                            </select>
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="married"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Heart className="h-6 w-6" />
                            MARRIED
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Are you currently married?
                          </div>
                          <FormControl>
                            <select 
                              {...field}
                              value={field.value || 'NO'}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                // Clear marriage fields if selecting NO
                                if (e.target.value === 'NO') {
                                  form.setValue('marriageDate', '');
                                  form.setValue('marriagePlace', '');
                                  form.setValue('spouseFullName', '');
                                }
                              }}
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            >
                              <option value="YES">YES</option>
                              <option value="NO">NO</option>
                            </select>
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Parents Information Section */}
              <div className="space-y-10">
                <div className="text-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-blue-800 flex items-center justify-center gap-3 mb-2">
                    <Users className="h-7 w-7" />
                    Parents Information
                  </h3>
                  <div className="w-24 h-0.5 bg-blue-600 mx-auto rounded"></div>
                </div>
                
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="fatherFullName"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                          Father's Full Name
                        </FormLabel>
                        <div className="text-base text-gray-600 mb-3">
                          Enter your father's complete name (first, middle, and last name)
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Example: Michael John MALINSKI"
                            className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherFullName"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                          Mother's Full Name
                        </FormLabel>
                        <div className="text-base text-gray-600 mb-3">
                          Enter your mother's complete name (first, middle, and last name)
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Example: Anna Maria KOWALSKI"
                            className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherMaidenName"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                          Mother's Maiden Name
                        </FormLabel>
                        <div className="text-base text-gray-600 mb-3">
                          Enter your mother's family name at birth (before marriage) in CAPITAL LETTERS
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Example: KOWALSKI"
                            className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg uppercase font-bold"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Marriage Information Section - Only show if married */}
              {form.watch("married") === "YES" && (
              <div className="space-y-10">
                <div className="text-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-blue-800 flex items-center justify-center gap-3 mb-2">
                    <Heart className="h-7 w-7" />
                    Marriage Information
                  </h3>
                  <div className="w-24 h-0.5 bg-blue-600 mx-auto rounded"></div>
                  <p className="text-base text-gray-600 mt-4">
                    (Optional - Fill only if you are married)
                  </p>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="dateOfMarriage"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Calendar className="h-6 w-6" />
                            Marriage Date <span className="text-gray-400 font-normal">(DD.MM.YYYY)</span>
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Date when you got married (if applicable)
                          </div>
                          <FormControl>
                            <Input 
                              value={field.value || ''}
                              onChange={(e) => {
                                const formatted = formatDateInput(e.target.value);
                                field.onChange(formatted);
                              }}
                              placeholder="DD.MM.YYYY"
                              type="tel"
                              inputMode="numeric"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="placeOfMarriage"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <MapPin className="h-6 w-6" />
                            Marriage Place
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            City and country where you got married
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Example: Krakow, Poland"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="spouseFullName"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                          Spouse's Full Name
                        </FormLabel>
                        <div className="text-base text-gray-600 mb-3">
                          Enter your spouse's complete name (if married)
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Example: Maria Anna NOWAK"
                            className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="spouseFullName"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            Spouse's Additional Info
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Additional information about your spouse
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Optional additional info"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    {form.watch("spouseFullName") && (
                      <FormField
                        control={form.control}
                        name="spousePassportNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                              Spouse's Passport Number
                            </FormLabel>
                            <div className="text-base text-gray-600 mb-3">
                              Enter your spouse's passport number
                            </div>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Example: AB123456"
                                className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                              />
                            </FormControl>
                            <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="currentAddress"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                          <Baby className="h-6 w-6" />
                          Current Address
                        </FormLabel>
                        <div className="text-base text-gray-600 mb-3">
                          List all your children's names (if applicable), separated by commas
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Example: Jan MALINSKI, Anna MALINSKI"
                            className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              )}

              {/* Contact Information Section */}
              <div className="space-y-10">
                <div className="text-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-blue-800 flex items-center justify-center gap-3 mb-2">
                    <Mail className="h-7 w-7" />
                    Contact Information
                  </h3>
                  <div className="w-24 h-0.5 bg-blue-600 mx-auto rounded"></div>
                </div>
                
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="currentAddress"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                          <MapPin className="h-6 w-6" />
                          Current Address
                        </FormLabel>
                        <div className="text-base text-gray-600 mb-3">
                          Your full current home address (street, number, apartment)
                        </div>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Example: 123 Main Street, Apartment 4B"
                            className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                          />
                        </FormControl>
                        <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="birthPlace"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            Postal Code
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            ZIP or postal code
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="12345"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            City
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Your current city
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="New York"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 block">
                            Country
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Your current country
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="United States"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="mobilePhone"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Phone className="h-6 w-6" />
                            Phone Number
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Your phone number with country code
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="+1 555 123 4567"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <Mail className="h-6 w-6" />
                            Email Address
                          </FormLabel>
                          <div className="text-base text-gray-600 mb-3">
                            Your email address for contact
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="your.email@example.com"
                              className="w-full h-16 lg:h-20 text-xl lg:text-2xl px-6 border-3 border-gray-300 focus:border-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm focus:shadow-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-lg text-red-600 mt-3 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <div className="text-center space-y-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-16 py-8 text-xl lg:text-2xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 min-w-[320px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Saving Information...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6" />
                        Save Client Details
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-base text-gray-600 max-w-2xl mx-auto">
                    After saving, you'll proceed to the next step where our AI will process your documents for Polish citizenship application.
                  </p>
                </div>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}