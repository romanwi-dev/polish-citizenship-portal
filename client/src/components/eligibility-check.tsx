import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertEligibilityAssessmentSchema, type InsertEligibilityAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, User, Users, UserPlus, UsersRound } from "lucide-react";

export default function EligibilityCheck() {
  const { toast } = useToast();

  const form = useForm<InsertEligibilityAssessment>({
    resolver: zodResolver(insertEligibilityAssessmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      birthYear: "",
      polishAncestor: "",
      ancestorBirthYear: "",
      ancestorBirthPlace: "",
      hasPolishDocuments: "",
      emigrationYear: "",
      currentCitizenship: "",
      familyMembers: "",
      urgency: "",
      caseComplexity: "",
      budgetRange: "",
      timelineExpectation: "",
      additionalInfo: "",
    },
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: InsertEligibilityAssessment) => {
      const response = await apiRequest("POST", "/api/eligibility-assessment", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Submitted Successfully",
        description: "Our legal experts will provide you with a comprehensive case evaluation within 48 hours during business days. Check your email for confirmation.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEligibilityAssessment) => {
    submitAssessmentMutation.mutate(data);
  };

  return (
    <section id="assessment" className="py-24 bg-surface-light">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-primary-blue text-white px-6 py-3 rounded-full font-semibold mb-6">
            Professional Assessment
          </Badge>
          <h2 className="text-5xl font-black mb-6 text-center leading-tight"
              style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
            <span className="block text-black dark:text-white">Comprehensive Eligibility</span>
            <span className="block text-blue-800 dark:text-blue-400">Assessment</span>
          </h2>
          <p className="text-lg text-neutral-cool max-w-3xl mx-auto leading-relaxed">
            Get a detailed professional evaluation of your case. Our experts analyze eligibility, assess complexity, 
            and provide realistic timelines. <strong>This is thorough legal assessment</strong> - not a simple checker.
          </p>
        </div>

        <Card className="bg-surface-elevated border border-gray-100">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="block text-base font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Enter your first name"
                    className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="block text-base font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Enter your last name"
                    className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="block text-base font-semibold text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="your.email@example.com"
                  className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="block text-base font-semibold text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="+1 (555) 123-4567"
                    className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="birthYear" className="block text-base font-semibold text-gray-700">
                    Your Birth Year
                  </Label>
                  <Input
                    id="birthYear"
                    {...form.register("birthYear")}
                    placeholder="1985"
                    className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  />
                  {form.formState.errors.birthYear && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.birthYear.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="block text-base font-semibold text-gray-700">
                  Current Country of Residence *
                </Label>
                <Controller
                  name="country"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="US" className="text-base py-3">United States</SelectItem>
                        <SelectItem value="CA" className="text-base py-3">Canada</SelectItem>
                        <SelectItem value="UK" className="text-base py-3">United Kingdom</SelectItem>
                        <SelectItem value="AU" className="text-base py-3">Australia</SelectItem>
                        <SelectItem value="DE" className="text-base py-3">Germany</SelectItem>
                        <SelectItem value="other" className="text-base py-3">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                  Which family member was born in Poland? *
                </Label>
                <Controller
                  name="polishAncestor"
                  control={form.control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="parent" id="parent" />
                        <Label htmlFor="parent" className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span>Parent</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="grandparent" id="grandparent" />
                        <Label htmlFor="grandparent" className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>Grandparent</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="great-grandparent" id="great-grandparent" />
                        <Label htmlFor="great-grandparent" className="flex items-center space-x-2">
                          <UsersRound className="w-4 h-4 text-blue-500" />
                          <span>Great-grandparent</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="flex items-center space-x-2">
                          <UserPlus className="w-4 h-4 text-blue-500" />
                          <span>Other/Not sure</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {form.formState.errors.polishAncestor && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.polishAncestor.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ancestorBirthYear" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ancestor's Birth Year
                  </Label>
                  <Input
                    id="ancestorBirthYear"
                    {...form.register("ancestorBirthYear")}
                    placeholder="1920"
                    className="w-full h-14 text-lg animated-input"
                  />
                  {form.formState.errors.ancestorBirthYear && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.ancestorBirthYear.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ancestorBirthPlace" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ancestor's Birth Place in Poland
                  </Label>
                  <Input
                    id="ancestorBirthPlace"
                    {...form.register("ancestorBirthPlace")}
                    placeholder="Warsaw, Kraków, etc."
                    className="w-full h-14 text-lg animated-input"
                  />
                  {form.formState.errors.ancestorBirthPlace && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.ancestorBirthPlace.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                  Do you have any Polish documents? *
                </Label>
                <Controller
                  name="hasPolishDocuments"
                  control={form.control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes">Yes, I have Polish documents</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No, I don't have Polish documents</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unsure" id="unsure" />
                        <Label htmlFor="unsure">I'm not sure</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {form.formState.errors.hasPolishDocuments && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.hasPolishDocuments.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emigrationYear" className="block text-sm font-semibold text-gray-700 mb-2">
                    Year Ancestor Left Poland
                  </Label>
                  <Input
                    id="emigrationYear"
                    {...form.register("emigrationYear")}
                    placeholder="1940"
                    className="w-full h-14 text-lg animated-input"
                  />
                  {form.formState.errors.emigrationYear && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.emigrationYear.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentCitizenship" className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Citizenship
                  </Label>
                  <Input
                    id="currentCitizenship"
                    {...form.register("currentCitizenship")}
                    placeholder="US, Canadian, etc."
                    className="w-full h-14 text-lg animated-input"
                  />
                  {form.formState.errors.currentCitizenship && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.currentCitizenship.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                  How many family members need citizenship?
                </Label>
                <Controller
                  name="familyMembers"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full h-14 text-lg animated-select">
                        <SelectValue placeholder="Select number of family members" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="just-me">Just me</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="3-4">3-4 people</SelectItem>
                        <SelectItem value="5+">5+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.familyMembers && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.familyMembers.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    How urgent is your case?
                  </Label>
                  <Controller
                    name="urgency"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="w-full h-14 text-lg animated-select">
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-urgent">Not urgent (3+ years)</SelectItem>
                          <SelectItem value="moderate">Moderate (2-3 years)</SelectItem>
                          <SelectItem value="urgent">Urgent (1-2 years)</SelectItem>
                          <SelectItem value="very-urgent">Very urgent (under 1 year)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.urgency && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.urgency.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Case Complexity
                  </Label>
                  <Controller
                    name="caseComplexity"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="w-full h-14 text-lg animated-select">
                          <SelectValue placeholder="Select complexity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple (all documents available)</SelectItem>
                          <SelectItem value="moderate">Moderate (some research needed)</SelectItem>
                          <SelectItem value="complex">Complex (extensive research required)</SelectItem>
                          <SelectItem value="very-complex">Very complex (major documentation gaps)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.caseComplexity && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.caseComplexity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="block text-base font-semibold text-gray-700">
                    Budget Range (EUR)
                  </Label>
                  <Controller
                    name="budgetRange"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="3000-5000" className="text-base py-3">€3,000 - €5,000</SelectItem>
                          <SelectItem value="5000-7000" className="text-base py-3">€5,000 - €7,000</SelectItem>
                          <SelectItem value="7000-10000" className="text-base py-3">€7,000 - €10,000</SelectItem>
                          <SelectItem value="10000+" className="text-base py-3">€10,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.budgetRange && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.budgetRange.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label className="block text-base font-semibold text-gray-700">
                    Timeline Expectation
                  </Label>
                  <Controller
                    name="timelineExpectation"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="w-full h-14 text-lg px-5 animated-select bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl">
                          <SelectValue placeholder="Select expected timeline" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="2-3-years" className="text-base py-3">2-3 years (realistic)</SelectItem>
                          <SelectItem value="3-4-years" className="text-base py-3">3-4 years (comfortable)</SelectItem>
                          <SelectItem value="4+-years" className="text-base py-3">4+ years (no rush)</SelectItem>
                          <SelectItem value="unrealistic" className="text-base py-3">Under 2 years (unrealistic expectations)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.timelineExpectation && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.timelineExpectation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="additionalInfo" className="block text-base font-semibold text-gray-700">
                  Additional Information
                </Label>
                <Textarea
                  id="additionalInfo"
                  {...form.register("additionalInfo")}
                  placeholder="Please provide any additional information about your case, family history, documents you have, or specific questions..."
                  className="w-full min-h-[140px] text-lg p-5 animated-textarea bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                  rows={5}
                />
                {form.formState.errors.additionalInfo && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.additionalInfo.message}
                  </p>
                )}
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={submitAssessmentMutation.isPending}
                  className="w-full h-14 bg-primary-blue hover:bg-primary-blue-light text-white text-lg font-semibold rounded-xl shadow-sm animated-button"
                >
                  <CheckCircle className="mr-3 h-6 w-6" />
                  {submitAssessmentMutation.isPending 
                    ? "Submitting..." 
                    : "Start Free Assessment"
                  }
                </Button>
                <div className="text-center mt-4 space-y-2">
                  <p className="text-sm text-neutral-cool">
                    Professional legal assessment within 48 hours
                  </p>
                  <p className="text-xs text-neutral-cool opacity-80">
                    Comprehensive review by our legal experts
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
