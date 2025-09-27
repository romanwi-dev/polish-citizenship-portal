import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, User, FileText, Users, FileCheck } from 'lucide-react';
import { ClientDetailsForm } from '@/components/client-details-form';
import PDFGenerator from '@/components/pdf-generator';



interface ClientData {
  applicantName: string;
  applicantLastName: string;
  applicantFirstNames: string;
  birthDate: string;
  birthPlace: string;
  gender: "kobieta" | "mężczyzna";
  fatherFullName: string;
  motherFullName: string;
  motherMaidenName: string;
  currentAddress: string;
  passportNumber: string;
  spouseFullName?: string;
  spouseBirthDate?: string;
  spouseBirthPlace?: string;
  childrenNames?: string;
}

export default function SimpleDashboard() {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [familyTreeData, setFamilyTreeData] = useState<Record<string, any> | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);

  const sections = [
    {
      id: 1,
      title: "Client Details",
      subtitle: "Basic data of the main applicant in the family",
      icon: User,
      completed: !!clientData,
      color: "green"
    },
    {
      id: 2,
      title: "Document Processing",
      subtitle: "Upload and process citizenship documents",
      icon: FileText,
      completed: uploadedDocs.length > 0,
      color: "green"
    },
    {
      id: 3,
      title: "Family Tree",
      subtitle: "Build your genealogical connections",
      icon: Users,
      completed: !!familyTreeData,
      color: "green"
    },
    {
      id: 4,
      title: "Generate Documents",
      subtitle: "Create official citizenship documents",
      icon: FileCheck,
      completed: false,
      color: "blue"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return <ClientDetailsForm onSubmit={(data) => setClientData(data as ClientData)} initialData={clientData || undefined} />;
      case 2:
        return (
          <div className="p-8 text-center border-2 border-dashed border-green-300 rounded-lg">
            <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-green-700 mb-4">Document Upload</h3>
            <p className="text-green-600 mb-6">Upload citizenship documents for processing</p>
            <Button 
              onClick={() => setUploadedDocs(['demo-document.pdf'])} 
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              Upload Documents (Demo)
            </Button>
            {uploadedDocs.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700">✓ Documents uploaded: {uploadedDocs.join(', ')}</p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="p-8 text-center border-2 border-dashed border-green-300 rounded-lg">
            <Users className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-green-700 mb-4">Family Tree Builder</h3>
            <p className="text-green-600 mb-6">Interactive family tree visualization</p>
            <Button 
              onClick={() => setFamilyTreeData({ completed: true })} 
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              Build Family Tree (Demo)
            </Button>
            {familyTreeData && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700">✓ Family tree data collected</p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <PDFGenerator applicationData={{
            clientData: clientData || {},
            documents: uploadedDocs,
            familyTree: familyTreeData
          }} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-black">Complete Polish </span>
            <span className="text-blue-600">Citizenship Paper Work</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {sections.slice(0, 3).map((section) => {
              const IconComponent = section.icon;
              const isActive = activeTab === section.id;
              
              return (
                <Button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`
                    flex items-center gap-3 px-6 py-4 h-auto text-left min-w-[250px]
                    ${isActive 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                      : 'border-green-500 text-green-700 hover:bg-green-50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${isActive ? 'bg-white text-green-600' : 'bg-green-600 text-white'}
                  `}>
                    {section.id}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{section.title}</div>
                    <div className={`text-sm ${isActive ? 'text-green-100' : 'text-green-600'}`}>
                      {section.subtitle}
                    </div>
                  </div>
                  {section.completed && (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </Button>
              );
            })}
          </div>

          <div className="text-center mb-6">
            <div className="inline-block">
              <h2 className="text-2xl font-bold text-green-700 mb-2">INPUT SECTIONS</h2>
              <div className="w-16 h-px bg-green-500 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Content Area for INPUT sections */}
        {activeTab <= 3 && (
          <Card className="mb-12 border-l-4 border-l-green-500 shadow-lg">
            <CardContent className="p-8">
              {renderContent()}
            </CardContent>
          </Card>
        )}

        {/* OUTPUT Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">OUTPUT SECTION</h2>
            <div className="w-16 h-px bg-blue-500 mx-auto mb-4"></div>
          </div>
          
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => setActiveTab(4)}
              variant={activeTab === 4 ? "default" : "outline"}
              className={`
                flex items-center gap-3 px-6 py-4 h-auto text-left min-w-[300px]
                ${activeTab === 4
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                  : 'border-blue-500 text-blue-700 hover:bg-blue-50'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${activeTab === 4 ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
              `}>
                4
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg">Generate Documents</div>
                <div className={`text-sm ${activeTab === 4 ? 'text-blue-100' : 'text-blue-600'}`}>
                  Create official citizenship documents
                </div>
              </div>
            </Button>
          </div>

          {activeTab === 4 && (
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardContent className="p-8">
                {renderContent()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Summary */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Application Progress</h3>
              <div className="grid grid-cols-4 gap-4">
                {sections.map((section) => (
                  <div key={section.id} className="text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                      section.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {section.completed ? '✓' : section.id}
                    </div>
                    <p className="text-sm text-gray-600">{section.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
      

    </div>
  );
}