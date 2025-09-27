import { useState } from "react";

import { DocumentUploadPreview } from "@/components/document-upload-preview";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";


import { 
  Shield, 
  Sparkles, 
  FileCheck, 
  Clock, 
  Award,
  CheckCircle,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentValidationPage() {
  const [uploadedCount, setUploadedCount] = useState(0);

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-blue-500" />,
      title: "AI-Powered Analysis",
      description: "Advanced document validation using GPT-4 Vision technology"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: "Secure Processing",
      description: "Bank-level encryption for all your sensitive documents"
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      title: "Instant Results",
      description: "Get validation feedback in seconds, not days"
    },
    {
      icon: <FileCheck className="h-6 w-6 text-orange-500" />,
      title: "Comprehensive Checks",
      description: "Authenticity, completeness, and compliance verification"
    }
  ];

  const documentTypes = [
    "Birth Certificates",
    "Marriage Certificates",
    "Passports",
    "Identity Documents",
    "Citizenship Proofs",
    "Military Records",
    "Census Records",
    "Naturalization Papers"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Document Validation
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Document Validation Center
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upload your citizenship documents for instant AI-powered validation. 
            Our advanced system checks authenticity, completeness, and compliance 
            with Polish citizenship requirements.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="text-3xl font-bold text-green-600">10s</div>
              <div className="text-sm text-gray-600">Avg. Processing</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="text-3xl font-bold text-purple-600">256-bit</div>
              <div className="text-sm text-gray-600">Encryption</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Supported Documents */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Supported Document Types
            </CardTitle>
            <CardDescription>
              Our AI system is trained to validate all essential Polish citizenship documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map((type, index) => (
                <Badge key={index} variant="outline" className="py-1 px-3">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Documents</CardTitle>
            <CardDescription>
              Select or drag and drop your documents for validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Notice:</strong> Your documents are processed securely and never stored permanently. 
                All data is encrypted during transmission and analysis.
              </AlertDescription>
            </Alert>
            
            <DocumentUploadPreview />
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: "Upload", description: "Select or drag your documents" },
                { step: 2, title: "Process", description: "AI analyzes document content" },
                { step: 3, title: "Validate", description: "Check authenticity and completeness" },
                { step: 4, title: "Results", description: "Get detailed validation report" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}