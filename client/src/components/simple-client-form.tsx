import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const ClientDetailsSchema = z.object({
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantLastName: z.string().min(1, "Last name is required"),
  applicantFirstNames: z.string().min(1, "First names are required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthPlace: z.string().min(1, "Birth place is required"),
  gender: z.enum(['kobieta', 'mężczyzna']),
  fatherFullName: z.string().min(1, "Father's full name is required"),
  motherFullName: z.string().min(1, "Mother's full name is required"),
  motherMaidenName: z.string().min(1, "Mother's maiden name is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  passportNumber: z.string().min(1, "Passport or ID number is required"),
  spouseFullName: z.string().optional(),
  spouseBirthDate: z.string().optional(),
  spouseBirthPlace: z.string().optional(),
  childrenNames: z.string().optional(),
});

export type ClientDetailsData = z.infer<typeof ClientDetailsSchema>;

interface SimpleClientFormProps {
  onSubmit: (data: ClientDetailsData) => void;
  initialData?: Partial<ClientDetailsData>;
}

export function SimpleClientForm({ onSubmit, initialData }: SimpleClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientDetailsData>({
    resolver: zodResolver(ClientDetailsSchema),
    defaultValues: {
      applicantName: initialData?.applicantName || "",
      applicantLastName: initialData?.applicantLastName || "",
      applicantFirstNames: initialData?.applicantFirstNames || "",
      birthDate: initialData?.birthDate || "",
      birthPlace: initialData?.birthPlace || "",
      gender: initialData?.gender || "kobieta",
      fatherFullName: initialData?.fatherFullName || "",
      motherFullName: initialData?.motherFullName || "",
      motherMaidenName: initialData?.motherMaidenName || "",
      currentAddress: initialData?.currentAddress || "",
      passportNumber: initialData?.passportNumber || "",
      spouseFullName: initialData?.spouseFullName || "",
      spouseBirthDate: initialData?.spouseBirthDate || "",
      spouseBirthPlace: initialData?.spouseBirthPlace || "",
      childrenNames: initialData?.childrenNames || "",
    },
  });

  const handleSubmit = async (data: ClientDetailsData) => {
    setIsSubmitting(true);
    try {
      // Format names according to Polish requirements
      const formattedData = {
        ...data,
        applicantLastName: data.applicantLastName.toUpperCase(),
        motherMaidenName: data.motherMaidenName.toUpperCase(),
      };

      onSubmit(formattedData);
      
      toast({
        title: "Client details saved successfully",
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white shadow-xl border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <User className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Client Details</h3>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="applicantFirstNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Names</FormLabel>
                      <FormControl>
                        <Input placeholder="Andrew John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="applicantLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="MALINSKI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthPlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Place</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Parents Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fatherFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan MALINSKI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motherFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria KOWALSKI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motherMaidenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Maiden Name</FormLabel>
                    <FormControl>
                      <Input placeholder="NOWAK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passport/ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="A12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : "Save Client Details"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}