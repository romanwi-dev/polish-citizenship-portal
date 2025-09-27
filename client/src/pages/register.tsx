import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, Mail, Lock, Phone, Globe, MapPin, Calendar, Users, 
  Shield, Check, AlertCircle, Eye, EyeOff, ChevronRight,
  FileText, UserPlus, CreditCard, Award, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";



const registerSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Account Security
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  
  // Location
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(2, "City is required"),
  timezone: z.string().min(1, "Please select your timezone"),
  
  // Polish Ancestry
  hasPolishAncestry: z.boolean(),
  ancestorGeneration: z.string().optional(),
  ancestorName: z.string().optional(),
  
  // Service Selection
  serviceType: z.enum(["standard", "premium", "express"]),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  }),
  agreeToPrivacy: z.boolean().refine(val => val === true, {
    message: "You must agree to the privacy policy"
  }),
  subscribeToNewsletter: z.boolean().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

const packages = [
  {
    id: "standard",
    name: "Standard Package",
    price: "$2,999",
    features: [
      "Full eligibility assessment",
      "Document preparation",
      "Application filing",
      "12-18 months processing",
      "Email support"
    ],
    icon: FileText,
    color: "bg-blue-600"
  },
  {
    id: "premium",
    name: "Premium Service",
    price: "$4,999",
    features: [
      "Everything in Standard",
      "Priority processing",
      "Dedicated case manager",
      "Phone & video support",
      "Success guarantee"
    ],
    icon: Award,
    badge: "MOST POPULAR",
    color: "bg-purple-600"
  },
  {
    id: "express",
    name: "Express Processing",
    price: "$7,999",
    features: [
      "Everything in Premium",
      "Fastest possible processing",
      "White-glove service",
      "24/7 support",
      "Money-back guarantee"
    ],
    icon: Star,
    color: "bg-orange-600"
  }
];

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState("premium");
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      country: "",
      city: "",
      timezone: "",
      hasPolishAncestry: false,
      ancestorGeneration: "",
      ancestorName: "",
      serviceType: "premium",
      agreeToTerms: false,
      agreeToPrivacy: false,
      subscribeToNewsletter: true
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Form submitted!", data);
    
    try {
      // Make sure package is selected
      data.serviceType = selectedPackage as any;
      
      // Log validation errors if any
      const errors = form.formState.errors;
      if (Object.keys(errors).length > 0) {
        console.error("Validation errors:", errors);
        
        // Find the first error message to display
        let errorMessage = "Please complete all required fields";
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
          errorMessage = firstError.message as string;
        }
        
        toast({
          title: "Please fix the following errors",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      // Check if terms are agreed
      if (!data.agreeToTerms || !data.agreeToPrivacy) {
        toast({
          title: "Terms Required",
          description: "Please agree to the Terms of Service and Privacy Policy",
          variant: "destructive"
        });
        return;
      }
      
      // Make API call to register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          country: data.country,
          city: data.city,
          timezone: data.timezone,
          hasPolishAncestry: data.hasPolishAncestry,
          ancestorGeneration: data.ancestorGeneration,
          ancestorName: data.ancestorName,
          serviceType: data.serviceType,
          subscribeToNewsletter: data.subscribeToNewsletter
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Store user ID for dashboard
      if (result.userId) {
        localStorage.setItem('userId', result.userId);
      }
      
      toast({
        title: "Account Created Successfully!",
        description: result.message || "Welcome to Polish Citizenship Services. Please check your email to verify your account.",
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const nextStep = async () => {
    // Validate current step fields before moving to next step
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'country', 'city', 'timezone'];
    } else if (currentStep === 2) {
      if (form.watch('hasPolishAncestry')) {
        fieldsToValidate = ['ancestorGeneration'];
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ['serviceType'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) {
      const errors = form.formState.errors;
      const errorMessages = fieldsToValidate
        .filter(field => errors[field])
        .map(field => errors[field]?.message)
        .join(", ");
      
      if (errorMessages) {
        toast({
          title: "Please complete all required fields",
          description: errorMessages,
          variant: "destructive"
        });
      }
      return;
    }
    
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
          <p className="text-xl text-gray-600">Join thousands of families reclaiming their Polish heritage</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <Progress value={(currentStep / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              Personal Info
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              Polish Ancestry
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              Service Package
            </span>
            <span className={`text-sm ${currentStep >= 4 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              Confirmation
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Personal Information</h2>
                          <p className="text-lg text-gray-600">Let's start with your basic details</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                />
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Smith"
                                  className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                />
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="john.smith@example.com"
                                  className="h-14 text-lg pl-12 pr-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold">Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                                <Input
                                  {...field}
                                  placeholder="+1 234 567 8900"
                                  className="h-14 text-lg pl-12 pr-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-sm" />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-14 text-lg pl-12 pr-12 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-5 p-1"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-14 text-lg pl-12 pr-12 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-5 p-1"
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-8">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-60">
                                  <SelectItem value="us" className="text-base py-3">United States</SelectItem>
                                  <SelectItem value="ca" className="text-base py-3">Canada</SelectItem>
                                  <SelectItem value="uk" className="text-base py-3">United Kingdom</SelectItem>
                                  <SelectItem value="au" className="text-base py-3">Australia</SelectItem>
                                  <SelectItem value="de" className="text-base py-3">Germany</SelectItem>
                                  <SelectItem value="fr" className="text-base py-3">France</SelectItem>
                                  <SelectItem value="pl" className="text-base py-3">Poland</SelectItem>
                                  <SelectItem value="other" className="text-base py-3">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="New York"
                                  className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                />
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold">Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl">
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-60">
                                  <SelectItem value="est" className="text-base py-3">EST (Eastern)</SelectItem>
                                  <SelectItem value="cst" className="text-base py-3">CST (Central)</SelectItem>
                                  <SelectItem value="mst" className="text-base py-3">MST (Mountain)</SelectItem>
                                  <SelectItem value="pst" className="text-base py-3">PST (Pacific)</SelectItem>
                                  <SelectItem value="gmt" className="text-base py-3">GMT (London)</SelectItem>
                                  <SelectItem value="cet" className="text-base py-3">CET (Warsaw)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Polish Ancestry */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg">
                          <Users className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Polish Ancestry Information</h2>
                          <p className="text-lg text-gray-600">Tell us about your Polish heritage</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="hasPolishAncestry"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-xl border-2 p-6 bg-gray-50 hover:bg-white transition-all duration-200">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="w-6 h-6 mt-1"
                              />
                            </FormControl>
                            <div className="space-y-2 leading-none">
                              <FormLabel className="text-lg font-semibold cursor-pointer">
                                I have Polish ancestry
                              </FormLabel>
                              <p className="text-base text-gray-600">
                                Check this if you have Polish ancestors (parents, grandparents, etc.)
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch("hasPolishAncestry") && (
                        <>
                          <FormField
                            control={form.control}
                            name="ancestorGeneration"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-base font-semibold">Which generation had Polish citizenship?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl">
                                      <SelectValue placeholder="Select generation" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-60">
                                    <SelectItem value="parent" className="text-base py-3">Parent</SelectItem>
                                    <SelectItem value="grandparent" className="text-base py-3">Grandparent</SelectItem>
                                    <SelectItem value="great-grandparent" className="text-base py-3">Great-Grandparent</SelectItem>
                                    <SelectItem value="great-great-grandparent" className="text-base py-3">Great-Great-Grandparent</SelectItem>
                                    <SelectItem value="unsure" className="text-base py-3">Not Sure</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-sm" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="ancestorName"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel className="text-base font-semibold">Polish Ancestor's Name (if known)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Jan Kowalski"
                                    className="h-14 text-lg px-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                                  />
                                </FormControl>
                                <FormMessage className="text-sm" />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Card className="bg-blue-50 border-blue-200 border-2">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-base font-semibold text-blue-900">Don't know your ancestry details?</p>
                              <p className="text-base text-blue-700 mt-2">
                                No worries! Our team will help you research and verify your Polish heritage during the consultation process.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 3: Service Package Selection */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg">
                          <CreditCard className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Choose Your Service Package</h2>
                          <p className="text-lg text-gray-600">Select the package that best fits your needs</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg) => {
                          const Icon = pkg.icon;
                          return (
                            <Card
                              key={pkg.id}
                              className={`relative cursor-pointer transition-all ${
                                selectedPackage === pkg.id
                                  ? 'ring-2 ring-blue-600 shadow-lg'
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => {
                                console.log("Package selected:", pkg.id);
                                setSelectedPackage(pkg.id);
                                form.setValue("serviceType", pkg.id as any);
                              }}
                            >
                              {pkg.badge && (
                                <Badge className="absolute -top-2 -right-2 bg-orange-500">
                                  {pkg.badge}
                                </Badge>
                              )}
                              <CardHeader>
                                <div className={`w-12 h-12 ${pkg.color} text-white rounded-lg flex items-center justify-center mb-3`}>
                                  <Icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                                <p className="text-2xl font-bold text-blue-600">{pkg.price}</p>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Terms & Confirmation */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg">
                          <Shield className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Review & Confirm</h2>
                          <p className="text-lg text-gray-600">Almost done! Review your information and accept our terms</p>
                        </div>
                      </div>

                      {/* Summary */}
                      <Card className="bg-gray-50 border-2">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl">Account Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-base text-gray-600">Name:</span>
                            <span className="text-base font-semibold">
                              {form.watch("firstName")} {form.watch("lastName")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-base text-gray-600">Email:</span>
                            <span className="text-base font-semibold">{form.watch("email")}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-base text-gray-600">Package:</span>
                            <span className="text-base font-semibold">
                              {packages.find(p => p.id === selectedPackage)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-base text-gray-600">Price:</span>
                            <span className="text-lg font-bold text-blue-600">
                              {packages.find(p => p.id === selectedPackage)?.price}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Terms */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="agreeToTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 border">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="w-6 h-6 mt-1"
                                />
                              </FormControl>
                              <div className="space-y-2 leading-none">
                                <FormLabel className="text-base font-medium cursor-pointer">
                                  I agree to the{" "}
                                  <Link href="/terms-of-service">
                                    <span className="text-blue-600 hover:underline cursor-pointer">
                                      Terms of Service
                                    </span>
                                  </Link>
                                </FormLabel>
                                <FormMessage className="text-sm" />
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="agreeToPrivacy"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 border">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="w-6 h-6 mt-1"
                                />
                              </FormControl>
                              <div className="space-y-2 leading-none">
                                <FormLabel className="text-base font-medium cursor-pointer">
                                  I agree to the{" "}
                                  <Link href="/privacy-policy">
                                    <span className="text-blue-600 hover:underline cursor-pointer">
                                      Privacy Policy
                                    </span>
                                  </Link>
                                </FormLabel>
                                <FormMessage className="text-sm" />
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subscribeToNewsletter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-4 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 border">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="w-6 h-6 mt-1"
                                />
                              </FormControl>
                              <div className="space-y-2 leading-none">
                                <FormLabel className="text-base font-medium cursor-pointer">
                                  Send me updates about Polish citizenship law changes and tips
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Security Badge */}
                      <Card className="bg-green-50 border-green-200 border-2">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Shield className="h-10 w-10 text-green-600" />
                            <div>
                              <p className="text-lg font-semibold text-green-900">Bank-Level Security</p>
                              <p className="text-base text-green-700 mt-1">
                                Your data is encrypted and protected with industry-standard security
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-10 gap-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-3 h-14 px-8 text-lg font-semibold"
                      >
                        Previous
                      </Button>
                    )}
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto flex items-center gap-3 bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-semibold"
                      >
                        Next Step
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        onClick={() => {
                          console.log("Create Account button clicked");
                          console.log("Form values:", form.getValues());
                          console.log("Form errors:", form.formState.errors);
                        }}
                        className="ml-auto flex items-center gap-3 bg-green-600 hover:bg-green-700 h-14 px-8 text-lg font-semibold"
                      >
                        <UserPlus className="h-5 w-5" />
                        Create Account
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Already have an account? */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login">
                    <span className="text-blue-600 hover:underline cursor-pointer font-semibold">
                      Log in here
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </Form>
      </div>
      

    </div>
  );
}