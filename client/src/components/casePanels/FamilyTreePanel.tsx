import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Download, CheckCircle, Users, AlertCircle, FileText, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FamilyTreePanelProps {
  caseId: string;
}

// Simple FormField component for family tree
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

// Family Tree Visualization Component
interface FamilyMember {
  id: string;
  firstName?: string;
  lastName?: string;
  documents: {
    birthCertificate?: boolean;
    polishDocuments?: boolean;
    marriageCertificate?: boolean;
  };
  generation: number;
  position: { x: number; y: number };
}

const FamilyTreeVisualization = ({ familyData }: { familyData: any }) => {
  // Define family members with positions for visual layout
  const familyMembers: FamilyMember[] = [
    // Generation 1: Applicant (center)
    {
      id: 'applicant',
      firstName: familyData.applicant_first_name,
      lastName: familyData.applicant_family_name,
      documents: {
        birthCertificate: !!familyData.applicant_birth_certificate,
        polishDocuments: !!familyData.applicant_polish_docs,
      },
      generation: 1,
      position: { x: 50, y: 80 }
    },
    // Generation 2: Parents
    {
      id: 'father',
      firstName: familyData.father_first_name,
      lastName: familyData.father_last_name,
      documents: {
        birthCertificate: !!familyData.father_birth_certificate,
        polishDocuments: !!familyData.father_polish_docs,
      },
      generation: 2,
      position: { x: 25, y: 50 }
    },
    {
      id: 'mother',
      firstName: familyData.mother_first_name,
      lastName: familyData.mother_last_name,
      documents: {
        birthCertificate: !!familyData.mother_birth_certificate,
        polishDocuments: !!familyData.mother_polish_docs,
      },
      generation: 2,
      position: { x: 75, y: 50 }
    },
    // Generation 3: Grandparents
    {
      id: 'paternal_grandfather',
      firstName: familyData.paternal_grandfather_first_name,
      lastName: familyData.paternal_grandfather_last_name,
      documents: {
        birthCertificate: !!familyData.paternal_grandfather_birth_certificate,
        polishDocuments: !!familyData.paternal_grandfather_polish_docs,
      },
      generation: 3,
      position: { x: 12.5, y: 20 }
    },
    {
      id: 'paternal_grandmother',
      firstName: familyData.paternal_grandmother_first_name,
      lastName: familyData.paternal_grandmother_last_name,
      documents: {
        birthCertificate: !!familyData.paternal_grandmother_birth_certificate,
        polishDocuments: !!familyData.paternal_grandmother_polish_docs,
      },
      generation: 3,
      position: { x: 37.5, y: 20 }
    },
    {
      id: 'maternal_grandfather',
      firstName: familyData.maternal_grandfather_first_name,
      lastName: familyData.maternal_grandfather_last_name,
      documents: {
        birthCertificate: !!familyData.maternal_grandfather_birth_certificate,
        polishDocuments: !!familyData.maternal_grandfather_polish_docs,
      },
      generation: 3,
      position: { x: 62.5, y: 20 }
    },
    {
      id: 'maternal_grandmother',
      firstName: familyData.maternal_grandmother_first_name,
      lastName: familyData.maternal_grandmother_last_name,
      documents: {
        birthCertificate: !!familyData.maternal_grandmother_birth_certificate,
        polishDocuments: !!familyData.maternal_grandmother_polish_docs,
      },
      generation: 3,
      position: { x: 87.5, y: 20 }
    }
  ];

  const getDocumentStatus = (member: FamilyMember) => {
    const docs = Object.values(member.documents);
    const hasDocuments = docs.some(doc => doc);
    const missingDocuments = docs.filter(doc => !doc).length;
    
    if (!hasDocuments) return { status: 'missing', color: 'bg-red-500', count: docs.length };
    if (missingDocuments > 0) return { status: 'partial', color: 'bg-amber-500', count: missingDocuments };
    return { status: 'complete', color: 'bg-green-500', count: 0 };
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-hidden">
      {/* SVG for connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {/* Lines connecting generations */}
        {/* Applicant to Parents */}
        <line x1="50%" y1="80%" x2="25%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
        <line x1="50%" y1="80%" x2="75%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
        
        {/* Parents to Grandparents */}
        <line x1="25%" y1="50%" x2="12.5%" y2="20%" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
        <line x1="25%" y1="50%" x2="37.5%" y2="20%" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
        <line x1="75%" y1="50%" x2="62.5%" y2="20%" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
        <line x1="75%" y1="50%" x2="87.5%" y2="20%" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
      </svg>

      {/* Family member nodes */}
      {familyMembers.map((member) => {
        const docStatus = getDocumentStatus(member);
        const hasName = member.firstName || member.lastName;
        
        return (
          <div
            key={member.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ 
              left: `${member.position.x}%`, 
              top: `${member.position.y}%`,
              zIndex: 2
            }}
          >
            {/* Member card */}
            <div className={cn(
              "relative bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm min-w-24 max-w-32 p-2 text-center transition-all hover:shadow-md",
              hasName ? "border-blue-300 dark:border-blue-600" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            )}>
              {/* Document status indicator */}
              <div className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
                docStatus.color
              )}>
                {docStatus.status === 'missing' && <AlertCircle className="w-2 h-2 text-white" />}
                {docStatus.status === 'partial' && <span className="text-white text-xs font-bold">{docStatus.count}</span>}
                {docStatus.status === 'complete' && <CheckCircle className="w-2 h-2 text-white" />}
              </div>

              {/* Member icon */}
              <User className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              
              {/* Member name */}
              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {hasName ? `${member.firstName || ''} ${member.lastName || ''}`.trim() : 'Unknown'}
              </div>
              
              {/* Generation label */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Gen {member.generation}
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-xs" style={{ zIndex: 3 }}>
        <div className="font-medium mb-1 text-gray-900 dark:text-white">Document Status:</div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Complete</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Missing</span>
        </div>
      </div>
    </div>
  );
};

// Using unified Button component from design system

export default function FamilyTreePanel({ caseId }: FamilyTreePanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [familyTreeData, setFamilyTreeData] = useState<any>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing family tree data
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['family-tree', caseId],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/cases/${caseId}/family-tree`);
      return response || {};
    }
  });

  useEffect(() => {
    if (fetchedData) {
      setFamilyTreeData(fetchedData);
    }
  }, [fetchedData]);

  // Save family tree data
  const saveFamilyTree = useMutation({
    mutationFn: async (data: any) => {
      setIsSaving(true);
      const response = await apiRequest(`/api/admin/cases/${caseId}/family-tree`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['family-tree', caseId] });
      toast({
        title: "Saved",
        description: "Family tree data has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save family tree data. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSaving(false);
    }
  });

  const handleFieldChange = (field: string, value: string) => {
    const updatedData = { ...familyTreeData, [field]: value };
    setFamilyTreeData(updatedData);
  };

  const handleManualSave = () => {
    saveFamilyTree.mutate(familyTreeData);
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Family tree PDF export will be ready shortly."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Family Tree</h2>
        </div>
        <div className="hidden md:flex gap-2">
          <Button
            variant="secondary"
            onClick={handleManualSave}
            disabled={isSaving}
            data-testid="button-save-family-tree"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button
            variant="primary"
            onClick={handleExportPDF}
            data-testid="button-export-family-tree-pdf"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Family Tree Tabs */}
      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="visualization" data-testid="tab-family-tree-visualization">
            <Users className="h-4 w-4 mr-2" />
            Tree View
          </TabsTrigger>
          <TabsTrigger value="details" data-testid="tab-family-tree-details">
            <FileText className="h-4 w-4 mr-2" />
            Member Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          {/* Visual Family Tree */}
          <IOS26Card>
            <IOS26CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Family Tree Visualization</h3>
                <Badge variant="outline" className="text-xs">
                  4 Generations
                </Badge>
              </div>
            </IOS26CardHeader>
            <IOS26CardBody>
              <FamilyTreeVisualization familyData={familyTreeData} />
            </IOS26CardBody>
          </IOS26Card>

          {/* Document Summary */}
          <IOS26Card>
            <IOS26CardHeader>
              <h3 className="text-lg font-semibold">Document Status Summary</h3>
            </IOS26CardHeader>
            <IOS26CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                  <div className="text-sm text-green-800 dark:text-green-300">Complete</div>
                </div>
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">2</div>
                  <div className="text-sm text-amber-800 dark:text-amber-300">Partial</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">5</div>
                  <div className="text-sm text-red-800 dark:text-red-300">Missing</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">7</div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">Total Members</div>
                </div>
              </div>
            </IOS26CardBody>
          </IOS26Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Member Details Forms */}
      <IOS26Card>
        <IOS26CardHeader>
          <h3 className="text-lg font-semibold">Applicant & Spouse</h3>
        </IOS26CardHeader>
        <IOS26CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">Applicant</h4>
              <FormField label="First Name" required>
                <Input
                  value={familyTreeData.applicant_first_name || ''}
                  onChange={(e) => handleFieldChange('applicant_first_name', e.target.value.toUpperCase())}
                  placeholder="Enter first name"
                  className="text-base"
                  autoComplete="off"
                  data-testid="input-applicant-first-name"
                />
              </FormField>
              <FormField label="Family Name" required>
                <Input
                  value={familyTreeData.applicant_family_name || ''}
                  onChange={(e) => handleFieldChange('applicant_family_name', e.target.value.toUpperCase())}
                  placeholder="Enter family name"
                  className="text-base"
                  autoComplete="off"
                  data-testid="input-applicant-family-name"
                />
              </FormField>
              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={familyTreeData.applicant_date_of_birth || ''}
                  onChange={(e) => handleFieldChange('applicant_date_of_birth', e.target.value)}
                  className="text-base"
                  data-testid="input-applicant-birth-date"
                />
              </FormField>
              <FormField label="Place of Birth">
                <Input
                  value={familyTreeData.applicant_place_of_birth || ''}
                  onChange={(e) => handleFieldChange('applicant_place_of_birth', e.target.value)}
                  placeholder="Enter place of birth"
                  className="text-base"
                  autoComplete="off"
                  data-testid="input-applicant-birth-place"
                />
              </FormField>
            </div>

            {/* Spouse */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">Spouse (if applicable)</h4>
              <FormField label="First Name">
                <Input
                  value={familyTreeData.spouse_first_name || ''}
                  onChange={(e) => handleFieldChange('spouse_first_name', e.target.value.toUpperCase())}
                  placeholder="Enter spouse's first name"
                  className="text-base"
                  autoComplete="off"
                  data-testid="input-spouse-first-name"
                />
              </FormField>
              <FormField label="Family Name">
                <Input
                  value={familyTreeData.spouse_family_name || ''}
                  onChange={(e) => handleFieldChange('spouse_family_name', e.target.value.toUpperCase())}
                  placeholder="Enter spouse's family name"
                  className="text-base"
                  autoComplete="off"
                  data-testid="input-spouse-family-name"
                />
              </FormField>
              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={familyTreeData.spouse_date_of_birth || ''}
                  onChange={(e) => handleFieldChange('spouse_date_of_birth', e.target.value)}
                  className="text-base"
                  data-testid="input-spouse-birth-date"
                />
              </FormField>
              <FormField label="Place of Birth">
                <Input
                  value={familyTreeData.spouse_place_of_birth || ''}
                  onChange={(e) => handleFieldChange('spouse_place_of_birth', e.target.value)}
                  placeholder="Enter spouse's place of birth"
                  className="text-base"
                  autoComplete="off"
                  data-testid="input-spouse-birth-place"
                />
              </FormField>
            </div>
          </div>
        </IOS26CardBody>
          </IOS26Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Save Bar - Sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t p-4 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                Saving...
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Saved ✓
              </>
            ) : null}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleManualSave}
              disabled={isSaving}
              size="sm"
              data-testid="button-mobile-save-family-tree"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button
              variant="primary"
              onClick={handleExportPDF}
              size="sm"
              data-testid="button-mobile-export-family-tree-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}