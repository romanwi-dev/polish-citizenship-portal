import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Upload, 
  Download, 
  Eye,
  GripVertical,
  Plus,
  Trash2,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Document {
  id: string;
  name: string;
  category: string;
  status: 'required' | 'uploaded' | 'verified' | 'missing' | 'in-review';
  priority: 'high' | 'medium' | 'low';
  description: string;
  uploadDate?: string;
  size?: string;
  notes?: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  documents: Document[];
  color: string;
}

export default function DocumentChecklist() {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedItem, setDraggedItem] = useState<Document | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<DocumentCategory[]>([
    {
      id: 'personal',
      name: 'Personal Documents',
      color: 'blue',
      documents: [
        {
          id: '1',
          name: 'Birth Certificate',
          category: 'personal',
          status: 'verified',
          priority: 'high',
          description: 'Official birth certificate with apostille',
          uploadDate: '2024-12-15',
          size: '2.4 MB'
        },
        {
          id: '2',
          name: 'Marriage Certificate',
          category: 'personal',
          status: 'uploaded',
          priority: 'high',
          description: 'Marriage certificate (if applicable)',
          uploadDate: '2024-12-10',
          size: '1.8 MB'
        },
        {
          id: '3',
          name: 'Passport Copy',
          category: 'personal',
          status: 'required',
          priority: 'high',
          description: 'Current passport main page copy'
        }
      ]
    },
    {
      id: 'ancestral',
      name: 'Ancestral Documents',
      color: 'green',
      documents: [
        {
          id: '4',
          name: 'Grandfather Birth Certificate',
          category: 'ancestral',
          status: 'in-review',
          priority: 'high',
          description: 'Polish birth certificate from archives',
          uploadDate: '2024-12-08',
          size: '3.1 MB',
          notes: 'Awaiting translation verification'
        },
        {
          id: '5',
          name: 'Grandmother Birth Certificate',
          category: 'ancestral',
          status: 'missing',
          priority: 'high',
          description: 'Polish birth certificate - archive search needed'
        },
        {
          id: '6',
          name: 'Parents Marriage Certificate',
          category: 'ancestral',
          status: 'verified',
          priority: 'medium',
          description: 'Parents marriage certificate',
          uploadDate: '2024-11-28',
          size: '1.9 MB'
        }
      ]
    },
    {
      id: 'legal',
      name: 'Legal Documents',
      color: 'purple',
      documents: [
        {
          id: '7',
          name: 'Power of Attorney',
          category: 'legal',
          status: 'required',
          priority: 'high',
          description: 'Notarized power of attorney document'
        },
        {
          id: '8',
          name: 'Citizenship Application',
          category: 'legal',
          status: 'required',
          priority: 'high',
          description: 'Completed Polish citizenship application form'
        }
      ]
    },
    {
      id: 'translations',
      name: 'Translations',
      color: 'orange',
      documents: [
        {
          id: '9',
          name: 'Birth Certificate Translation',
          category: 'translations',
          status: 'verified',
          priority: 'medium',
          description: 'Sworn translation of birth certificate',
          uploadDate: '2024-12-12',
          size: '1.2 MB'
        },
        {
          id: '10',
          name: 'Ancestral Documents Translation',
          category: 'translations',
          status: 'in-review',
          priority: 'medium',
          description: 'Sworn translations of Polish documents',
          uploadDate: '2024-12-09',
          size: '2.8 MB'
        }
      ]
    }
  ]);

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'uploaded':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in-review':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'required':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'uploaded':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'in-review':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'required':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'missing':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Document['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-50';
      case 'green':
        return 'border-green-200 bg-green-50';
      case 'purple':
        return 'border-purple-200 bg-purple-50';
      case 'orange':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleDragStart = (e: React.DragEvent, document: Document) => {
    setDraggedItem(document);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryId);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (!draggedItem) return;

    // Update categories by moving the document
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.id === draggedItem.category) {
          // Remove from old category
          return {
            ...category,
            documents: category.documents.filter(doc => doc.id !== draggedItem.id)
          };
        } else if (category.id === targetCategoryId) {
          // Add to new category
          const updatedDocument = { ...draggedItem, category: targetCategoryId };
          return {
            ...category,
            documents: [...category.documents, updatedDocument]
          };
        }
        return category;
      });
    });

    setDraggedItem(null);
  };

  const getTotalProgress = () => {
    const allDocuments = categories.flatMap(cat => cat.documents);
    const completedDocuments = allDocuments.filter(doc => doc.status === 'verified').length;
    return Math.round((completedDocuments / allDocuments.length) * 100);
  };

  const getStatusCounts = () => {
    const allDocuments = categories.flatMap(cat => cat.documents);
    return {
      verified: allDocuments.filter(doc => doc.status === 'verified').length,
      uploaded: allDocuments.filter(doc => doc.status === 'uploaded').length,
      inReview: allDocuments.filter(doc => doc.status === 'in-review').length,
      required: allDocuments.filter(doc => doc.status === 'required').length,
      missing: allDocuments.filter(doc => doc.status === 'missing').length,
      total: allDocuments.length
    };
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    documents: category.documents.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.documents.length > 0);

  const statusCounts = getStatusCounts();
  const totalProgress = getTotalProgress();

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <FileText className="w-7 h-7" />
                Interactive Document Checklist
              </CardTitle>
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-200 mt-4">
                <p className="text-blue-800 font-medium">📋 Organize your citizenship documents with drag-and-drop</p>
                <p className="text-blue-700 text-sm mt-1">
                  Drag documents between categories to organize them. Track progress and manage all required documentation for your Polish citizenship application.
                </p>
              </div>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white ml-4"
              onClick={async () => {
                try {
                  const response = await fetch('/api/generate-document-checklist-pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      applicantName: 'John Doe',
                      caseNumber: `CASE-${Date.now()}`,
                      categories: categories.map(cat => ({
                        name: cat.name,
                        documents: cat.documents.map(doc => ({
                          name: doc.name,
                          status: doc.status,
                          priority: doc.priority,
                          uploadDate: doc.uploadDate,
                          notes: doc.notes
                        }))
                      })),
                      overallProgress: totalProgress
                    })
                  });
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'lista-dokumentow-document-checklist.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  } else {
                    alert('Error generating PDF. Please try again.');
                  }
                } catch (error) {
                  console.error('Error generating Document Checklist PDF:', error);
                  alert('Failed to generate PDF. Please try again.');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Document Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{totalProgress}% Complete</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.verified}</div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.uploaded}</div>
                <div className="text-sm text-gray-600">Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.inReview}</div>
                <div className="text-sm text-gray-600">In Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.missing}</div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{statusCounts.required}</div>
                <div className="text-sm text-gray-600">Required</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className={`${getCategoryColor(category.color)} ${
              dragOverCategory === category.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            } transition-all duration-200`}
            onDragOver={(e) => handleDragOver(e, category.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.documents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.documents.map((document) => (
                <div
                  key={document.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, document)}
                  className={`p-4 rounded-lg border ${getStatusColor(document.status)} cursor-move hover:shadow-md transition-all duration-200 ${
                    draggedItem?.id === document.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(document.status)}
                        <span className="font-medium text-sm">{document.name}</span>
                        <Badge className={`text-xs ${getPriorityColor(document.priority)}`}>
                          {document.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{document.description}</p>
                      
                      {document.uploadDate && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span>Uploaded: {document.uploadDate}</span>
                          {document.size && <span>Size: {document.size}</span>}
                        </div>
                      )}

                      {document.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                          <p className="text-xs text-yellow-800">{document.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {document.status === 'uploaded' || document.status === 'verified' || document.status === 'in-review' ? (
                          <>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-600 hover:text-red-800">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {category.documents.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents in this category</p>
                  <p className="text-xs">Drag documents here to organize them</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-2">
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                <FileText className="w-4 h-4 mr-2" />
                Generate Document Report
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" />
                Export Checklist
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}