import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertConsultationRequestSchema, type InsertConsultationRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, Phone, MapPin, Clock3 } from "lucide-react";

type FormData = InsertConsultationRequest;

export default function ContactForm() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertConsultationRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      privacyConsent: false,
    },
  });

  const submitConsultationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/consultation-request", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Consultation Request Sent",
        description: "We'll respond to your consultation request within 24 hours during business days.",
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

  const onSubmit = (data: FormData) => {
    submitConsultationMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-24 bg-very-light-blue text-neutral-warm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            <span className="text-neutral-warm">Get Professional</span>
            <span className="block text-primary-blue">Consultation</span>
          </h2>
          <p className="text-lg text-sky-400 max-w-2xl mx-auto">
            Contact our experts for personalized guidance on your Polish citizenship case.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Card className="bg-surface-elevated text-neutral-warm border-0">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold mb-10 text-neutral-warm text-center">Request Consultation</h3>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="block text-base font-semibold text-gray-700">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        placeholder="First name"
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
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        placeholder="Enter your last name (optional)"
                        className="w-full h-14 text-lg px-5 animated-input bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
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
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="block text-base font-semibold text-gray-700">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      {...form.register("message")}
                      placeholder="Tell us about your Polish ancestry and citizenship goals..."
                      rows={5}
                      className="w-full min-h-[140px] text-lg p-5 animated-textarea bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                    />
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-white transition-all duration-200 border">
                    <Controller
                      name="privacyConsent"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 w-6 h-6"
                        />
                      )}
                    />
                    <Label className="text-base text-gray-600 cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        privacy policy
                      </a>{" "}
                      and consent to being contacted about my Polish citizenship
                      case.
                    </Label>
                  </div>
                  {form.formState.errors.privacyConsent && (
                    <p className="text-sm text-red-600 -mt-4">
                      {form.formState.errors.privacyConsent.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitConsultationMutation.isPending}
                    className="w-full bg-primary-blue hover:bg-primary-blue-light text-white h-14 text-lg font-semibold rounded-xl shadow-sm animated-button"
                  >
                    <Send className="mr-3 h-6 w-6" />
                    {submitConsultationMutation.isPending
                      ? "Sending..."
                      : "Send Consultation Request"
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
