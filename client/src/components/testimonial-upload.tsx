import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Upload, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock,
  Shield,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface VideoTestimonialFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  location: string;
  title: string;
  description: string;
  caseDetails?: string;
  contactAvailable: boolean;
  contactAvailableAfterConsultation: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
}

export function TestimonialUpload() {
  const [formData, setFormData] = useState<VideoTestimonialFormData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    location: "",
    title: "",
    description: "",
    caseDetails: "",
    contactAvailable: false,
    contactAvailableAfterConsultation: true,
    videoUrl: "",
    thumbnailUrl: "",
    duration: ""
  });

  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Get upload URL
  const getUploadUrl = async () => {
    const response = await fetch("/api/testimonials/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    return data.uploadURL;
  };

  // Submit testimonial
  const submitTestimonial = useMutation({
    mutationFn: async (data: VideoTestimonialFormData) => {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your testimonial has been submitted for review."
      });
      // Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        location: "",
        title: "",
        description: "",
        caseDetails: "",
        contactAvailable: false,
        contactAvailableAfterConsultation: true,
        videoUrl: "",
        thumbnailUrl: "",
        duration: ""
      });
      setUploadedVideoUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit testimonial. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedVideoUrl) {
      toast({
        title: "Video Required",
        description: "Please upload a video testimonial before submitting.",
        variant: "destructive"
      });
      return;
    }
    submitTestimonial.mutate({
      ...formData,
      videoUrl: uploadedVideoUrl
    });
  };

  const handleGetUploadParameters = async () => {
    setIsUploading(true);
    const url = await getUploadUrl();
    return {
      method: 'PUT' as const,
      url
    };
  };

  const handleUploadComplete = (result: any) => {
    setIsUploading(false);
    if (result.successful && result.successful.length > 0) {
      const uploadUrl = result.successful[0].uploadURL;
      setUploadedVideoUrl(uploadUrl);
      toast({
        title: "Video Uploaded",
        description: "Your video has been uploaded successfully."
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-6 w-6 text-blue-600" />
          Submit Your Video Testimonial
        </CardTitle>
        <CardDescription>
          Share your Polish citizenship journey to help others. All testimonials are verified for authenticity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Full Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  required
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="clientPhone">Phone (Optional)</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder="New York, USA"
                />
              </div>
            </div>
          </div>

          {/* Testimonial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Testimonial Details</h3>
            
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="My Journey to Polish Citizenship"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={4}
                placeholder="Share your experience with our services..."
              />
            </div>
            
            <div>
              <Label htmlFor="caseDetails">Case Details (Optional)</Label>
              <Textarea
                id="caseDetails"
                value={formData.caseDetails}
                onChange={(e) => setFormData({...formData, caseDetails: e.target.value})}
                rows={3}
                placeholder="Any specific details about your case..."
              />
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Video Upload
            </h3>
            
            <div className="p-6 border-2 border-dashed rounded-lg text-center">
              {uploadedVideoUrl ? (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <p className="text-green-600 font-medium">Video uploaded successfully!</p>
                  <p className="text-sm text-gray-600">URL: {uploadedVideoUrl.substring(0, 50)}...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Video className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-2">Upload your video testimonial</p>
                    <p className="text-sm text-gray-500">Max size: 100MB | Formats: MP4, MOV, AVI</p>
                  </div>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={104857600} // 100MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="mx-auto"
                  >
                    {isUploading ? "Uploading..." : "Choose Video File"}
                  </ObjectUploader>
                </div>
              )}
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contactAvailable"
                  checked={formData.contactAvailable}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, contactAvailable: checked as boolean})
                  }
                />
                <Label htmlFor="contactAvailable" className="cursor-pointer">
                  I'm available for potential clients to contact me about my experience
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contactAvailableAfterConsultation"
                  checked={formData.contactAvailableAfterConsultation}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, contactAvailableAfterConsultation: checked as boolean})
                  }
                />
                <Label htmlFor="contactAvailableAfterConsultation" className="cursor-pointer">
                  Only allow contact after consultation with your office
                </Label>
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>AI Verification Process:</strong> Your testimonial will be automatically verified for authenticity using our AI system. 
              This includes checking video quality, content relevance, and identity verification. 
              The process typically takes 24-48 hours.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitTestimonial.isPending || !uploadedVideoUrl}
            size="lg"
          >
            {submitTestimonial.isPending ? "Submitting..." : "Submit Testimonial for Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}