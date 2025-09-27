import { DocumentTranslator } from '@/components/DocumentTranslator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Languages, Shield, Zap, BookOpen, Globe, FileText } from 'lucide-react';

export default function Translator() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Legal Document Translator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional-grade translation for Polish citizenship documents with legal accuracy and cultural context
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Legal Accuracy</h3>
              <p className="text-gray-600 text-sm">
                Specialized in Polish citizenship and immigration terminology with official government language
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Advanced Claude 4.0 AI with deep understanding of legal context and cultural nuances
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Cultural Context</h3>
              <p className="text-gray-600 text-sm">
                Adapts cultural references while preserving proper names, places, and legal meanings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Supported Documents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supported Document Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Badge variant="outline" className="p-3 justify-center">
                Birth Certificates
              </Badge>
              <Badge variant="outline" className="p-3 justify-center">
                Marriage Certificates
              </Badge>
              <Badge variant="outline" className="p-3 justify-center">
                Passports
              </Badge>
              <Badge variant="outline" className="p-3 justify-center">
                Legal Documents
              </Badge>
              <Badge variant="outline" className="p-3 justify-center">
                General Text
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Translation Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Translation Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Legal Term Explanations</h4>
                    <p className="text-sm text-gray-600">
                      Get detailed explanations of legal terms and their proper translations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Format Preservation</h4>
                    <p className="text-sm text-gray-600">
                      Maintains original document structure and formatting
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Confidence Scoring</h4>
                    <p className="text-sm text-gray-600">
                      Each translation includes accuracy confidence metrics
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Auto Language Detection</h4>
                    <p className="text-sm text-gray-600">
                      Automatically detects source language for seamless translation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Translation Notes</h4>
                    <p className="text-sm text-gray-600">
                      Helpful suggestions and context about translation choices
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Export & Copy</h4>
                    <p className="text-sm text-gray-600">
                      Easy copy to clipboard or download translations as text files
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Translator Component */}
        <DocumentTranslator />

        {/* Usage Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Translation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">For Best Results:</h4>
                <ul className="space-y-1">
                  <li>• Use clear, well-scanned document images</li>
                  <li>• Select the correct document type</li>
                  <li>• Review legal term explanations carefully</li>
                  <li>• Check confidence scores for accuracy</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Important Notes:</h4>
                <ul className="space-y-1">
                  <li>• Proper names and places are preserved exactly</li>
                  <li>• Official certifications maintain legal terminology</li>
                  <li>• Dates and numbers keep original formatting</li>
                  <li>• Cultural context is adapted appropriately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}