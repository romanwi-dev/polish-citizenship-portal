import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  FileText, 
  Users, 
  User, 
  ClipboardList, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface AutoFillData {
  familyTreeData: any;
  clientDetailsData: any;
}

interface AutoFillManagerProps {
  ocrResult: any;
  onClose?: () => void;
}

export function AutoFillManager({ ocrResult, onClose }: AutoFillManagerProps) {
  const [autoFillData, setAutoFillData] = useState<AutoFillData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filledForms, setFilledForms] = useState<string[]>([]);
  const { toast } = useToast();

  const processAutoFill = async () => {
    setIsProcessing(true);
    try {
      // Process OCR data for auto-fill
      const response = await fetch('/api/documents/auto-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ocrResult }),
      });

      if (!response.ok) {
        throw new Error('Failed to process auto-fill data');
      }

      const data = await response.json();
      setAutoFillData(data);
      
      // Store in localStorage for forms to access
      localStorage.setItem('autoFillData', JSON.stringify(data));
      localStorage.setItem('autoFillTimestamp', Date.now().toString());
      
      toast({
        title: "Data Processed Successfully",
        description: "Your document information is ready to auto-fill forms",
      });
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process document for auto-fill",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyToForm = (formType: string) => {
    if (!autoFillData) return;
    
    // Mark form as filled
    setFilledForms([...filledForms, formType]);
    
    // Store specific form data
    localStorage.setItem(`autoFill_${formType}`, 'ready');
    
    toast({
      title: "Form Ready",
      description: `Navigate to ${formType} to see auto-filled data`,
    });
  };

  const getExtractedInfo = () => {
    if (!ocrResult?.structuredData) return null;
    
    const { personalInfo, parentInfo, marriageInfo } = ocrResult.structuredData;
    const extractedItems = [];
    
    if (personalInfo?.firstName || personalInfo?.lastName) {
      extractedItems.push({
        icon: User,
        label: "Personal Info",
        value: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`,
        details: [
          personalInfo.birthDate && `Born: ${personalInfo.birthDate}`,
          personalInfo.birthPlace && `Place: ${personalInfo.birthPlace}`,
          personalInfo.nationality && `Nationality: ${personalInfo.nationality}`,
        ].filter(Boolean),
      });
    }
    
    if (parentInfo?.fatherName || parentInfo?.motherName) {
      extractedItems.push({
        icon: Users,
        label: "Parents",
        value: "Information extracted",
        details: [
          parentInfo.fatherName && `Father: ${parentInfo.fatherName}`,
          parentInfo.motherName && `Mother: ${parentInfo.motherName}`,
        ].filter(Boolean),
      });
    }
    
    if (marriageInfo?.spouseName) {
      extractedItems.push({
        icon: FileText,
        label: "Marriage Info",
        value: marriageInfo.spouseName,
        details: [
          marriageInfo.marriageDate && `Date: ${marriageInfo.marriageDate}`,
          marriageInfo.marriagePlace && `Place: ${marriageInfo.marriagePlace}`,
        ].filter(Boolean),
      });
    }
    
    return extractedItems;
  };

  const extractedInfo = getExtractedInfo();

  return (
    <Card className="w-full max-w-4xl mx-auto mobile-card shadow-xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
          <Sparkles className="h-6 w-6" />
          Smart Form Auto-Fill
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Extracted Information Display */}
        {extractedInfo && extractedInfo.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Extracted Information
            </h3>
            <div className="space-y-3">
              {extractedInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-700 mt-1">{item.value}</div>
                        {item.details.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.details.map((detail, idx) => (
                              <div key={idx} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-300">
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Processing Button */}
        {!autoFillData && (
          <div className="text-center py-6">
            <Button
              onClick={processAutoFill}
              disabled={isProcessing}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white animated-button"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Process for Auto-Fill
                </>
              )}
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              Click to prepare this document's data for automatic form filling
            </p>
          </div>
        )}

        {/* Auto-Fill Options */}
        {autoFillData && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Document processed successfully! Choose which forms to auto-fill:
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Family Tree */}
              <div className="border rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Family Tree</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Auto-fill ancestor information and relationships
                    </p>
                    {filledForms.includes('family-tree') ? (
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Ready to Fill
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => applyToForm('family-tree')}
                      >
                        Prepare Auto-Fill
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="border rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Client Details</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Auto-fill personal information
                    </p>
                    {filledForms.includes('client-details') ? (
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Ready to Fill
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => applyToForm('client-details')}
                      >
                        Prepare Auto-Fill
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Polish Application */}
              <div className="border rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Polish Application</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Auto-fill citizenship application
                    </p>
                    {filledForms.includes('polish-application') ? (
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Ready to Fill
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => applyToForm('polish-application')}
                      >
                        Prepare Auto-Fill
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Power of Attorney */}
              <div className="border rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Power of Attorney</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Auto-fill legal representation forms
                    </p>
                    {filledForms.includes('power-of-attorney') ? (
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Ready to Fill
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => applyToForm('power-of-attorney')}
                      >
                        Prepare Auto-Fill
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {filledForms.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  Your forms are ready! Navigate to any prepared form to see auto-filled data:
                </p>
                <div className="flex flex-wrap gap-2">
                  {filledForms.includes('family-tree') && (
                    <Link to="/family-tree">
                      <Button size="sm" variant="outline" className="bg-white">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Go to Family Tree
                      </Button>
                    </Link>
                  )}
                  {filledForms.includes('client-details') && (
                    <Link to="/client-details">
                      <Button size="sm" variant="outline" className="bg-white">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Go to Client Details
                      </Button>
                    </Link>
                  )}
                  {filledForms.includes('polish-application') && (
                    <Link to="/polish-citizenship-application">
                      <Button size="sm" variant="outline" className="bg-white">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Go to Application
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Alert */}
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Auto-filled data will be highlighted in forms. You can review and edit any field before submission.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}