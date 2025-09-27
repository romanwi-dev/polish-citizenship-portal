import { useState, useEffect } from "react";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  FileText, 
  Users, 
  Download,
  CheckCircle2,
  FileCheck,
  Check,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientDetailsForm, type ClientDetailsData } from "@/components/client-details-form";
import { AIDocumentProcessor, type ProcessedDocument } from "@/components/ai-document-processor";


// Helper function to format Polish surnames to CAPITAL letters
const formatPolishSurname = (name: string): string => {
  if (!name) return '';
  return name.toUpperCase();
};

// Helper function to format Polish names (first letter capital, rest lowercase)
const formatPolishName = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export default function UnifiedDashboardFinal() {
  const { toast } = useToast();
  const [clientData, setClientData] = useState<ClientDetailsData | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  interface FamilyTreeData {
    // Main Applicant
    applicantName?: string;
    applicantFirstName?: string;
    applicantLastName?: string;
    applicantMaidenName?: string;
    applicantBirthDate?: string;
    applicantBirthPlace?: string;
    applicantSpouse?: string;
    applicantSpouseMaidenName?: string;
    
    // Polish Parent
    polishParentName?: string;
    polishParentMaidenName?: string;
    
    // Parent's Spouse (Other Parent)
    parentSpouseName?: string;
    parentSpouseMaidenName?: string;
    
    // Polish Grandparents
    polishGrandfatherName?: string;
    polishGrandfatherMaidenName?: string;
    polishGrandmotherName?: string;
    polishGrandmotherMaidenName?: string;
    
    // Polish Great Grandparents
    polishGreatGrandfatherName?: string;
    polishGreatGrandfatherMaidenName?: string;
    polishGreatGrandmotherName?: string;
    polishGreatGrandmotherMaidenName?: string;
    
    // Legacy fields
    fatherName?: string;
    motherName?: string;
    [key: string]: any;
  }

  const [familyTreeData, setFamilyTreeData] = useState<FamilyTreeData>({});
  const [generatedPDFs, setGeneratedPDFs] = useState<{id: string; title: string}[]>([]);

  // Auto-sync data between Client Details and Family Tree after save
  const handleClientDataSave = (data: ClientDetailsData) => {
    setClientData(data);
    // Real-time sync to Family Tree
    setFamilyTreeData((prev: FamilyTreeData) => ({
      ...prev,
      // Applicant (main person)
      applicantName: data.applicantName || data.applicantFirstNames,
      applicantLastName: data.applicantLastName,
      applicantBirthDate: data.birthDate,
      applicantBirthPlace: data.birthPlace,
      
      // Polish Parent (father or mother)
      polishParentName: data.fatherFullName || data.motherFullName,
      
      // Parent's Spouse
      parentSpouseName: data.motherFullName || data.fatherFullName,
      
      // Auto-populate from client data
      fatherName: data.fatherFullName,
      motherName: data.motherFullName,
    }));
    
    toast({
      title: "Data Saved & Synchronized",
      description: "Client details saved and synchronized with Family Tree",
    });
  };

  // Handle Family Tree data save and sync back to Client Details
  const handleFamilyTreeSave = () => {
    if (familyTreeData.applicantName || familyTreeData.polishParentName) {
      setClientData((prev: ClientDetailsData | null) => ({
        ...prev,
        applicantName: familyTreeData.applicantName || prev?.applicantName,
        applicantLastName: familyTreeData.applicantLastName || prev?.applicantLastName,
        birthDate: familyTreeData.applicantBirthDate || prev?.birthDate,
        birthPlace: familyTreeData.applicantBirthPlace || prev?.birthPlace,
        fatherFullName: familyTreeData.polishParentName || prev?.fatherFullName,
        motherFullName: familyTreeData.parentSpouseName || prev?.motherFullName,
      } as ClientDetailsData));
      
      toast({
        title: "Family Tree Saved",
        description: "Data synchronized back to Client Details",
      });
    }
  };

  const inputSections = [
    { 
      id: 1, 
      title: "Document Processing", 
      icon: FileText, 
      completed: processedDocuments.length > 0,
      component: (
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">IMPORTANT: Main Applicant Documents Only</h4>
            <p className="text-sm text-amber-700">
              Upload documents belonging to the MAIN APPLICANT (the person filling this application). 
              Do not upload documents of parents, grandparents, or other family members here.
            </p>
          </div>
          
{/* Mobile-First Document Processing */}
          <div className="space-y-4">
            {/* Add Test Document Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  const testDoc = {
                    id: `test-${Date.now()}`,
                    filename: 'birth-certificate.pdf',
                    status: 'pending-review' as const,
                    type: 'applicant-birth' as const,
                    progress: 100,
                    polishTranslation: 'Imię: Jan KOWALSKI\nData urodzenia: 15.01.1990\nMiejsce urodzenia: Warszawa, Polska\nImię ojca: Piotr KOWALSKI\nImię matki: Anna NOWAK',
                    originalText: 'Name: Jan KOWALSKI\nBirth Date: 15.01.1990\nBirth Place: Warsaw, Poland\nFather Name: Piotr KOWALSKI\nMother Name: Anna NOWAK',
                    extractedData: {
                      name: 'Jan KOWALSKI',
                      birthDate: '15.01.1990',
                      birthPlace: 'Warsaw, Poland',
                      fatherName: 'Piotr KOWALSKI',
                      motherName: 'Anna NOWAK'
                    }
                  };
                  setProcessedDocuments(prev => [...prev, testDoc]);
                  toast({
                    title: "Test Document Added",
                    description: "A sample document with pending-review status has been added. Now you can test the accept/delete buttons!",
                  });
                }}
                className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Test Document (Demo)
              </Button>
            </div>

            {/* Display Processed Documents with Accept/Delete */}
            {processedDocuments.map((document) => (
              <div key={document.id} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-lg">{document.filename}</p>
                        <p className="text-sm text-gray-600">Birth Certificate</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        document.status === 'pending-review' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {document.status === 'pending-review' ? 'Review Required' : 'Completed'}
                      </span>
                    </div>
                    
                    {/* Pending Review - Show accept/delete options */}
                    {document.status === 'pending-review' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                          <p className="text-sm font-semibold text-amber-800 mb-3">
                            Document processed successfully! Please review the extracted data and choose an action:
                          </p>
                          
                          {/* Show extracted data */}
                          <details className="group mb-3">
                            <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2 p-2 bg-blue-50 rounded">
                              <FileText className="h-4 w-4" />
                              View extracted data (Polish)
                            </summary>
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-line border">
                              {document.polishTranslation}
                            </div>
                          </details>
                          
                          {/* Accept/Delete buttons - Mobile First */}
                          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 pt-2">
                            <Button
                              onClick={async () => {
                                // Update document status
                                setProcessedDocuments(prev => 
                                  prev.map(doc => 
                                    doc.id === document.id 
                                      ? { ...doc, status: 'completed' as const } 
                                      : doc
                                  )
                                );

                                // CRITICAL: Populate forms with document data
                                if (document.extractedData) {
                                  try {
                                    // Map OCR data to form structures
                                    const response = await fetch('/api/documents/map-data', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        ocrResults: [{
                                          result: document.extractedData,
                                          type: document.type
                                        }]
                                      })
                                    });
                                    
                                    if (response.ok) {
                                      const mappedData = await response.json();
                                      
                                      // OVERRIDE existing data with document data
                                      if (mappedData.clientDetails) {
                                        setClientData((prev: ClientDetailsData | null) => ({
                                          ...prev,
                                          ...mappedData.clientDetails
                                        }));
                                        console.log('Client data populated:', mappedData.clientDetails);
                                      }
                                      
                                      if (mappedData.familyTree) {
                                        setFamilyTreeData((prev: any) => ({
                                          ...prev,
                                          ...mappedData.familyTree
                                        }));
                                        console.log('Family tree populated:', mappedData.familyTree);
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error mapping document data:', error);
                                    // Fallback: Direct population from extracted data
                                    const extractedData = document.extractedData as any;
                                    
                                    // Populate Client Details directly
                                    setClientData((prev: ClientDetailsData | null) => ({
                                      ...prev,
                                      applicantFirstNames: extractedData.name?.split(' ')[0] || '',
                                      applicantLastName: extractedData.name?.split(' ').slice(1).join(' ') || '',
                                      birthDate: extractedData.birthDate || '',
                                      birthPlace: extractedData.birthPlace || '',
                                      fatherFullName: extractedData.fatherName || '',
                                      motherFullName: extractedData.motherName || ''
                                    }));
                                    
                                    // Populate Family Tree directly
                                    setFamilyTreeData((prev: any) => ({
                                      ...prev,
                                      applicantName: extractedData.name || '',
                                      applicantBirthDate: extractedData.birthDate || '',
                                      applicantBirthPlace: extractedData.birthPlace || '',
                                      polishParentName: extractedData.fatherName || '',
                                      parentSpouseName: extractedData.motherName || ''
                                    }));
                                    
                                    console.log('Direct data population complete');
                                  }
                                }

                                toast({
                                  title: "Document Accepted!",
                                  description: "Document data has been accepted and forms are now populated with extracted information.",
                                });
                              }}
                              className="w-full sm:flex-1 h-12 bg-green-600 hover:bg-green-700 text-white text-base font-semibold"
                            >
                              <Check className="h-5 w-5 mr-2" />
                              Accept & Use Data
                            </Button>
                            <Button
                              onClick={() => {
                                setProcessedDocuments(prev => prev.filter(doc => doc.id !== document.id));
                                toast({
                                  title: "Document Deleted",
                                  description: "Document has been removed. You can upload a new one if needed.",
                                });
                              }}
                              variant="destructive"
                              className="w-full sm:flex-1 h-12 text-base font-semibold"
                            >
                              <Trash2 className="h-5 w-5 mr-2" />
                              Delete & Retry
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Completed documents */}
                    {document.status === 'completed' && (
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 border-2 border-green-200 rounded text-sm text-green-800 font-semibold">
                          ✓ Document accepted and data extracted successfully
                        </div>
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <FileText className="h-4 w-4" />
                            View extracted data (Polish)
                          </summary>
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-line border">
                            {document.polishTranslation}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">Main Applicant Documents:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Birth Certificate</li>
                <li>• Parents' Marriage Certificate</li>
                <li>• Passport/ID</li>
                <li>• Marriage Certificate (if married)</li>
                <li>• Children's Birth Certificates</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 2, 
      title: "Client Details", 
      icon: User, 
      completed: !!clientData,
      component: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">About This Section</h4>
            <p className="text-sm text-blue-700">
              Fill in YOUR personal details as the MAIN APPLICANT. Data will automatically sync with the Family Tree.
            </p>
          </div>
          
          <ClientDetailsForm 
            onSubmit={handleClientDataSave}
            initialData={clientData || undefined}
            syncedData={clientData || undefined}
          />
        </div>
      )
    },
    { 
      id: 3, 
      title: "Family Tree", 
      icon: Users, 
      completed: !!familyTreeData?.applicantName,
      component: (
        <div className="space-y-12">
          {/* Main Applicant Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-300 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                YOU
              </div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-blue-800 mb-8 text-center">MAIN APPLICANT</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">FIRST NAME</label>
                <input
                  type="text"
                  value={familyTreeData.applicantFirstName || ''}
                  placeholder="Your first and middle names"
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantFirstName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">FAMILY NAME</label>
                <input
                  type="text"
                  value={familyTreeData.applicantLastName || ''}
                  placeholder="Your family name"
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantLastName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">MAIDEN NAME</label>
                <input
                  type="text"
                  value={familyTreeData.applicantMaidenName || ''}
                  placeholder="for female SURNAME AT BIRTH"
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantMaidenName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Date of Birth</label>
                <input
                  type="date"
                  value={familyTreeData.applicantBirthDate || ''}
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantBirthDate: e.target.value}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Place of Birth</label>
                <input
                  type="text"
                  value={familyTreeData.applicantBirthPlace || ''}
                  placeholder="City, Country where you were born"
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantBirthPlace: e.target.value}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Current Spouse (if married)</label>
                <input
                  type="text"
                  value={familyTreeData.applicantSpouse || ''}
                  placeholder="Your spouse's full name (optional)"
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantSpouse: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">
                  SPOUSE'S MAIDEN NAME
                  <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                </label>
                <input
                  type="text"
                  value={familyTreeData.applicantSpouseMaidenName || ''}
                  placeholder="Your spouse's surname at birth (if different)"
                  className="w-full h-20 p-8 text-2xl border-3 border-blue-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, applicantSpouseMaidenName: e.target.value.toUpperCase()}))}
                />
              </div>
            </div>
          </div>

          {/* Polish Parent Section */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-400 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                PARENT
              </div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-red-800 mb-4 text-center">POLISH PARENT</h3>
            <p className="text-lg text-red-700 text-center mb-8">🩸 The parent through whom you claim Polish citizenship BY BLOODLINE</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Polish Parent's Full Name</label>
                <input
                  type="text"
                  value={familyTreeData.polishParentName || ''}
                  placeholder="Father or Mother with Polish citizenship"
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishParentName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">
                  MAIDEN NAME
                  <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                </label>
                <input
                  type="text"
                  value={familyTreeData.polishParentMaidenName || ''}
                  placeholder="Polish parent's surname at birth (if different)"
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishParentMaidenName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Date of Birth</label>
                <input
                  type="date"
                  value={familyTreeData.polishParentBirthDate || ''}
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishParentBirthDate: e.target.value}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Place of Birth</label>
                <input
                  type="text"
                  value={familyTreeData.polishParentBirthPlace || ''}
                  placeholder="City, Poland (or other location)"
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishParentBirthPlace: e.target.value}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Date of Emigration</label>
                <input
                  type="date"
                  value={familyTreeData.polishParentEmigrationDate || ''}
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishParentEmigrationDate: e.target.value}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Other Parent (Spouse)</label>
                <input
                  type="text"
                  value={familyTreeData.parentSpouseName || ''}
                  placeholder="Your other parent's full name"
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, parentSpouseName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">
                  MAIDEN NAME
                  <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                </label>
                <input
                  type="text"
                  value={familyTreeData.parentSpouseMaidenName || ''}
                  placeholder="Other parent's surname at birth (if different)"
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, parentSpouseMaidenName: e.target.value.toUpperCase()}))}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-bold text-gray-800 block">Parents' Marriage Date</label>
                <input
                  type="date"
                  value={familyTreeData.parentsMarriageDate || ''}
                  className="w-full h-20 p-8 text-2xl border-3 border-red-400 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm hover:shadow-md transition-all"
                  onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, parentsMarriageDate: e.target.value}))}
                />
              </div>
            </div>
          </div>

          {/* Polish Grandparents Section */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-400 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                GRANDPARENTS
              </div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-purple-800 mb-4 text-center">POLISH GRANDPARENTS</h3>
            <p className="text-lg text-purple-700 text-center mb-8">Your Polish parent's parents (your grandparents)</p>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Grandfather Section */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-purple-700 mb-6 text-center flex items-center justify-center gap-3">
                  👴 Polish Grandfather
                </h4>
                <div className="space-y-4">
                  <label className="text-xl font-bold text-gray-800 block">Full Name</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGrandfatherName || ''}
                    placeholder="Grandfather's complete name"
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandfatherName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">
                    MAIDEN NAME
                    <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                  </label>
                  <input
                    type="text"
                    value={familyTreeData.polishGrandfatherMaidenName || ''}
                    placeholder="Grandfather's surname at birth (if different)"
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandfatherMaidenName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Date of Birth</label>
                  <input
                    type="date"
                    value={familyTreeData.polishGrandfatherBirthDate || ''}
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandfatherBirthDate: e.target.value}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Place of Birth</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGrandfatherBirthPlace || ''}
                    placeholder="City, Poland"
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandfatherBirthPlace: e.target.value}))}
                  />
                </div>
              </div>
              
              {/* Grandmother Section */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-purple-700 mb-6 text-center flex items-center justify-center gap-3">
                  👵 Polish Grandmother
                </h4>
                <div className="space-y-4">
                  <label className="text-xl font-bold text-gray-800 block">Full Name</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGrandmotherName || ''}
                    placeholder="Grandmother's complete name"
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandmotherName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">
                    MAIDEN NAME
                    <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                  </label>
                  <input
                    type="text"
                    value={familyTreeData.polishGrandmotherMaidenName || ''}
                    placeholder="Grandmother's surname at birth (if different)"
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandmotherMaidenName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Date of Birth</label>
                  <input
                    type="date"
                    value={familyTreeData.polishGrandmotherBirthDate || ''}
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandmotherBirthDate: e.target.value}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Place of Birth</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGrandmotherBirthPlace || ''}
                    placeholder="City, Poland"
                    className="w-full h-20 p-8 text-2xl border-3 border-purple-300 rounded-xl focus:ring-3 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGrandmotherBirthPlace: e.target.value}))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Great Grandparents Section */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-4 border-orange-400 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                GREAT GRANDPARENTS
              </div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-orange-800 mb-4 text-center">POLISH GREAT GRANDPARENTS</h3>
            <p className="text-lg text-orange-700 text-center mb-8">🩸 Polish bloodline ancestry - your grandparents' parents</p>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Great Grandfather Section */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-orange-700 mb-6 text-center flex items-center justify-center gap-3">
                  👴 Great Grandfather
                </h4>
                <div className="space-y-4">
                  <label className="text-xl font-bold text-gray-800 block">Full Name</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGreatGrandfatherName || ''}
                    placeholder="Great grandfather's complete name"
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandfatherName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">
                    MAIDEN NAME
                    <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                  </label>
                  <input
                    type="text"
                    value={familyTreeData.polishGreatGrandfatherMaidenName || ''}
                    placeholder="Great grandfather's surname at birth (if different)"
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandfatherMaidenName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Date of Birth</label>
                  <input
                    type="date"
                    value={familyTreeData.polishGreatGrandfatherBirthDate || ''}
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandfatherBirthDate: e.target.value}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Place of Birth</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGreatGrandfatherBirthPlace || ''}
                    placeholder="City, Poland"
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandfatherBirthPlace: e.target.value}))}
                  />
                </div>
              </div>
              
              {/* Great Grandmother Section */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-orange-700 mb-6 text-center flex items-center justify-center gap-3">
                  👵 Great Grandmother
                </h4>
                <div className="space-y-4">
                  <label className="text-xl font-bold text-gray-800 block">Full Name</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGreatGrandmotherName || ''}
                    placeholder="Great grandmother's complete name"
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandmotherName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">
                    MAIDEN NAME
                    <span className="block text-sm font-normal text-gray-600">SURNAME AT BIRTH</span>
                  </label>
                  <input
                    type="text"
                    value={familyTreeData.polishGreatGrandmotherMaidenName || ''}
                    placeholder="Great grandmother's surname at birth (if different)"
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandmotherMaidenName: e.target.value.toUpperCase()}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Date of Birth</label>
                  <input
                    type="date"
                    value={familyTreeData.polishGreatGrandmotherBirthDate || ''}
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandmotherBirthDate: e.target.value}))}
                  />
                  
                  <label className="text-xl font-bold text-gray-800 block">Place of Birth</label>
                  <input
                    type="text"
                    value={familyTreeData.polishGreatGrandmotherBirthPlace || ''}
                    placeholder="City, Poland"
                    className="w-full h-20 p-8 text-2xl border-3 border-orange-300 rounded-xl focus:ring-3 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all"
                    onChange={(e) => setFamilyTreeData((prev: any) => ({...prev, polishGreatGrandmotherBirthPlace: e.target.value}))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex justify-center">
              <Button 
                onClick={handleFamilyTreeSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                Save Family Tree
              </Button>
            </div>
          </div>
        </div>
      )
    },
  ];

  const outputSections = [
    { 
      id: 4, 
      title: "Generate Documents", 
      subtitle: "Create Polish citizenship paperwork documents in PDF", 
      icon: Download, 
      completed: generatedPDFs.length > 0,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button 
              onClick={() => window.open('/api/pdf/poa/single', '_blank')}
              className="h-20 text-left flex items-center justify-between bg-blue-600 hover:bg-blue-700 p-6"
            >
              <div>
                <div className="font-semibold text-white text-lg">Power of Attorney (Single)</div>
                <div className="text-sm text-blue-100">Legal representation document</div>
              </div>
              <Download className="h-6 w-6 text-white" />
            </Button>
            
            <Button 
              onClick={() => window.open('/api/pdf/citizenship-application', '_blank')}
              className="h-20 text-left flex items-center justify-between bg-green-600 hover:bg-green-700 p-6"
            >
              <div>
                <div className="font-semibold text-white text-lg">Polish Citizenship Application</div>
                <div className="text-sm text-green-100">Complete citizenship form</div>
              </div>
              <Download className="h-6 w-6 text-white" />
            </Button>
            
            <Button 
              onClick={() => window.open('/api/pdf/poa/married', '_blank')}
              className="h-20 text-left flex items-center justify-between bg-blue-600 hover:bg-blue-700 p-6"
            >
              <div>
                <div className="font-semibold text-white text-lg">Power of Attorney (Married)</div>
                <div className="text-sm text-blue-100">For married applicants</div>
              </div>
              <Download className="h-6 w-6 text-white" />
            </Button>
            
            <Button 
              onClick={() => window.open('/api/pdf/poa/archives', '_blank')}
              className="h-20 text-left flex items-center justify-between bg-blue-600 hover:bg-blue-700 p-6"
            >
              <div>
                <div className="font-semibold text-white text-lg">Archives Search Request</div>
                <div className="text-sm text-blue-100">Document research authorization</div>
              </div>
              <Download className="h-6 w-6 text-white" />
            </Button>
            
            <Button 
              onClick={() => window.open('/api/pdf/family-tree', '_blank')}
              className="h-20 text-left flex items-center justify-between bg-blue-600 hover:bg-blue-700 p-6"
            >
              <div>
                <div className="font-semibold text-white text-lg">Family Tree Document</div>
                <div className="text-sm text-blue-100">Genealogical tree with documentation</div>
              </div>
              <Download className="h-6 w-6 text-white" />
            </Button>
            
            <Button 
              onClick={() => window.open('/api/pdf/citizenship-application', '_blank')}
              className="h-20 text-left flex items-center justify-between bg-green-600 hover:bg-green-700 p-6"
            >
              <div>
                <div className="font-semibold text-white text-lg">Polish Citizenship Application</div>
                <div className="text-sm text-green-100">Complete citizenship form</div>
              </div>
              <FileCheck className="h-6 w-6 text-white" />
            </Button>
          </div>
          
          <div className="text-center text-base text-gray-600 mt-6 p-4 bg-gray-50 rounded-lg">
            All PDFs are generated with your actual data from the INPUT sections above.
            Complete all three INPUT sections for best results.
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      
      <main className="container mx-auto px-4 py-8 max-w-6xl overflow-x-hidden">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-warm mb-6 tracking-tight">
            <div className="text-gray-900">Polish Citizenship</div>
            <div className="text-blue-600">Complete Paperwork</div>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Complete your Polish citizenship application with our step-by-step process
          </p>
        </div>

        {/* INPUT Sections */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-green-700 mb-4">INPUT</h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Fill these sections independently - data syncs automatically between all forms
            </p>
          </div>
          
          <div className="space-y-8">
            {inputSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card 
                  key={section.id} 
                  className="relative border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-white min-h-[500px]"
                >
                  {/* Big number in top right corner */}
                  <div className="absolute top-2 right-2 text-9xl md:text-[12rem] font-bold text-blue-800 opacity-30">
                    {section.id}
                  </div>
                  
                  <CardHeader className="pb-6 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-blue-100 rounded-lg mt-2">
                        <IconComponent className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                          {section.title}
                          {section.completed && <CheckCircle2 className="h-8 w-8 text-green-500 ml-3 inline" />}
                        </CardTitle>
                        {section.subtitle && (
                          <p className="text-lg md:text-xl text-gray-600">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-8 pb-8">
                    <div className="w-full overflow-x-hidden">
                      {section.component}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* OUTPUT Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-700 mb-4">OUTPUT SECTION</h2>
            <p className="text-lg lg:text-xl text-gray-600">
              Generated documents and review process
            </p>
          </div>
          
          <div className="w-full">
            {outputSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card 
                  key={section.id} 
                  className="relative border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-white min-h-[500px]"
                >
                  {/* Big number in top right corner */}
                  <div className="absolute top-2 right-2 text-9xl md:text-[12rem] font-bold text-blue-800 opacity-30">
                    {section.id}
                  </div>
                  
                  <CardHeader className="pb-6 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-blue-100 rounded-lg mt-2">
                        <IconComponent className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                          {section.title}
                          {section.completed && <CheckCircle2 className="h-8 w-8 text-blue-500 ml-3 inline" />}
                        </CardTitle>
                        {section.subtitle && (
                          <p className="text-lg md:text-xl text-gray-600">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-8 pb-8">
                    <div className="w-full">
                      {section.component}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}