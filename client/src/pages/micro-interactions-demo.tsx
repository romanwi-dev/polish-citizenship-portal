import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedInput } from "@/components/ui/animated-input";
import { AnimatedTextarea } from "@/components/ui/animated-textarea";
import { AnimatedSelect } from "@/components/ui/animated-select";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Mail, Lock, User, Phone, MapPin, Save, Send, Heart } from "lucide-react";

const countryOptions = [
  { value: "poland", label: "Poland" },
  { value: "germany", label: "Germany" },
  { value: "france", label: "France" },
  { value: "spain", label: "Spain" },
  { value: "italy", label: "Italy" },
  { value: "uk", label: "United Kingdom" },
  { value: "usa", label: "United States" },
  { value: "canada", label: "Canada" },
];

export default function MicroInteractionsDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let error = "";
    
    switch (field) {
      case "email":
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (value && !/^\+?[\d\s-()]+$/.test(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      case "password":
        if (value && value.length < 8) {
          error = "Password must be at least 8 characters";
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    setSuccess(prev => ({ ...prev, [field]: !error && value.length > 0 }));
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    alert("Form submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Micro-Interactions Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience smooth, interactive form elements with beautiful animations
          </p>
        </div>

        {/* Form Variants Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Default Variant */}
          <Card className="transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-center">Default Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatedInput
                label="Full Name"
                placeholder="Enter your name"
                icon={<User className="h-5 w-5" />}
                value={formData.name}
                onChange={handleInputChange("name")}
                success={success.name}
              />
              
              <AnimatedInput
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                icon={<Mail className="h-5 w-5" />}
                value={formData.email}
                onChange={handleInputChange("email")}
                error={errors.email}
                success={success.email}
              />
              
              <AnimatedSelect
                label="Country"
                options={countryOptions}
                value={formData.country}
                onChange={handleInputChange("country")}
                success={success.country}
              />
              
              <AnimatedButton className="w-full" icon={<Save className="h-4 w-4" />}>
                Save Changes
              </AnimatedButton>
            </CardContent>
          </Card>

          {/* Floating Variant */}
          <Card className="transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-center">Floating Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatedInput
                variant="floating"
                label="Phone Number"
                icon={<Phone className="h-5 w-5" />}
                value={formData.phone}
                onChange={handleInputChange("phone")}
                error={errors.phone}
                success={success.phone}
              />
              
              <AnimatedInput
                variant="floating"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange("password")}
                error={errors.password}
                success={success.password}
              />
              
              <AnimatedSelect
                variant="floating"
                label="Select Country"
                options={countryOptions}
                value={formData.country}
                onChange={handleInputChange("country")}
                success={success.country}
              />
              
              <AnimatedButton 
                variant="outline" 
                className="w-full"
                icon={<Heart className="h-4 w-4" />}
              >
                Add to Favorites
              </AnimatedButton>
            </CardContent>
          </Card>

          {/* Outlined Variant */}
          <Card className="transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle className="text-center">Outlined Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatedInput
                variant="outlined"
                placeholder="Location"
                icon={<MapPin className="h-5 w-5" />}
              />
              
              <AnimatedInput
                variant="outlined"
                type="password"
                placeholder="Confirm Password"
              />
              
              <AnimatedSelect
                variant="outlined"
                placeholder="Choose an option"
                options={countryOptions}
              />
              
              <AnimatedButton 
                variant="secondary" 
                className="w-full"
                icon={<Send className="h-4 w-4" />}
              >
                Send Message
              </AnimatedButton>
            </CardContent>
          </Card>
        </div>

        {/* Large Contact Form */}
        <Card className="transform hover:scale-[1.02] transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Contact Form with Micro-Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatedInput
                  variant="floating"
                  label="Full Name"
                  icon={<User className="h-5 w-5" />}
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  success={success.name}
                  required
                />
                
                <AnimatedInput
                  variant="floating"
                  type="email"
                  label="Email Address"
                  icon={<Mail className="h-5 w-5" />}
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  error={errors.email}
                  success={success.email}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatedInput
                  variant="floating"
                  label="Phone Number"
                  icon={<Phone className="h-5 w-5" />}
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  error={errors.phone}
                  success={success.phone}
                />
                
                <AnimatedSelect
                  variant="floating"
                  label="Country"
                  options={countryOptions}
                  value={formData.country}
                  onChange={handleInputChange("country")}
                  success={success.country}
                />
              </div>
              
              <AnimatedTextarea
                variant="floating"
                label="Message"
                value={formData.message}
                onChange={handleInputChange("message")}
                maxLength={500}
                success={success.message}
                rows={4}
              />
              
              <div className="flex gap-4 justify-center">
                <AnimatedButton
                  type="submit"
                  size="lg"
                  loading={loading}
                  loadingText="Sending..."
                  icon={<Send className="h-5 w-5" />}
                  className="px-8"
                >
                  Send Message
                </AnimatedButton>
                
                <AnimatedButton
                  type="button"
                  variant="outline"
                  size="lg"
                  icon={<Save className="h-5 w-5" />}
                  className="px-8"
                >
                  Save Draft
                </AnimatedButton>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Button Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Interactive Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatedButton>Default</AnimatedButton>
              <AnimatedButton variant="destructive">Delete</AnimatedButton>
              <AnimatedButton variant="outline">Outline</AnimatedButton>
              <AnimatedButton variant="secondary">Secondary</AnimatedButton>
              <AnimatedButton variant="ghost">Ghost</AnimatedButton>
              <AnimatedButton variant="link">Link</AnimatedButton>
              <AnimatedButton size="sm">Small</AnimatedButton>
              <AnimatedButton size="lg">Large</AnimatedButton>
              <AnimatedButton loading={true} loadingText="Loading...">
                Loading State
              </AnimatedButton>
              <AnimatedButton disabled>Disabled</AnimatedButton>
              <AnimatedButton ripple={false}>No Ripple</AnimatedButton>
              <AnimatedButton icon={<Heart className="h-4 w-4" />}>
                With Icon
              </AnimatedButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}