import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, Camera, Brain, Zap, ArrowRight } from "lucide-react";

export function DocumentProcessingCard() {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Document Processing
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            NEW
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Revolutionary AI-powered workflow that processes your documents automatically:
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Camera className="h-5 w-5 text-blue-600" />
            <div className="text-sm">
              <div className="font-medium">Photo Upload</div>
              <div className="text-gray-500">Take photos with your phone</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <FileText className="h-5 w-5 text-green-600" />
            <div className="text-sm">
              <div className="font-medium">OCR & Translation</div>
              <div className="text-gray-500">AI extracts and translates text</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Zap className="h-5 w-5 text-purple-600" />
            <div className="text-sm">
              <div className="font-medium">Auto-Fill Forms</div>
              <div className="text-gray-500">Forms filled automatically</div>
            </div>
          </div>
        </div>
        
        <Link to="/document-processing">
          <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg animated-button">
            <Brain className="mr-2 h-5 w-5" />
            Start AI Processing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        
        <div className="text-xs text-gray-500 text-center">
          Upload passport, birth & marriage certificates
        </div>
      </CardContent>
    </Card>
  );
}