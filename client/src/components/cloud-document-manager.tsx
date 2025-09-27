import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Note: Tabs component not available in current UI library, using manual tab implementation
import { Upload, File, Download, Trash2, Search, FolderOpen, Cloud, FileText, Plus } from "lucide-react";

interface CloudDocument {
  name: string;
  path: string;
  size: number;
  modified: string;
  id: string;
  folder?: string;
  mimeType?: string;
}

interface CloudManagerProps {
  clientId: string;
  clientName: string;
}

type CloudProvider = 'dropbox' | 'microsoft' | 'google';

export function CloudDocumentManager({ clientId, clientName }: CloudManagerProps) {
  const [activeProvider, setActiveProvider] = useState<CloudProvider>('dropbox');
  const [documents, setDocuments] = useState<Record<CloudProvider, CloudDocument[]>>({
    dropbox: [],
    microsoft: [],
    google: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'passport' | 'birth_certificate' | 'marriage_certificate' | 'other'>('other');
  const [accountInfo, setAccountInfo] = useState<Record<CloudProvider, any>>({
    dropbox: null,
    microsoft: null,
    google: null
  });

  // Load documents and account info for all providers
  useEffect(() => {
    loadAllDocuments();
    loadAllAccountInfo();
  }, [clientId]);

  const loadAllDocuments = async () => {
    setLoading(true);
    const providers: CloudProvider[] = ['dropbox', 'microsoft', 'google'];
    
    for (const provider of providers) {
      try {
        const response = await fetch(`/api/${provider}/documents/${clientId}`);
        const result = await response.json();
        
        if (result.success) {
          setDocuments(prev => ({
            ...prev,
            [provider]: result.documents || []
          }));
        }
      } catch (error) {
        console.error(`Error loading ${provider} documents:`, error);
      }
    }
    setLoading(false);
  };

  const loadAllAccountInfo = async () => {
    const providers: CloudProvider[] = ['dropbox', 'microsoft', 'google'];
    
    for (const provider of providers) {
      try {
        const response = await fetch(`/api/${provider}/account`);
        const result = await response.json();
        
        if (result.success) {
          setAccountInfo(prev => ({
            ...prev,
            [provider]: result
          }));
        }
      } catch (error) {
        console.error(`Error loading ${provider} account info:`, error);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('clientId', clientId);
      formData.append('clientName', clientName);
      formData.append('documentType', documentType);

      const response = await fetch(`/api/${activeProvider}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setSelectedFile(null);
        loadAllDocuments(); // Refresh document list
        
        // Reset file input
        const fileInput = document.getElementById('cloud-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        console.error('Upload failed:', result.error);
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error occurred');
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (doc: CloudDocument) => {
    try {
      const response = await fetch(`/api/${activeProvider}/download?${activeProvider === 'dropbox' ? 'filePath=' + encodeURIComponent(doc.path) : 'fileId=' + doc.id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = doc.name;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      } else {
        alert('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download error occurred');
    }
  };

  const deleteDocument = async (doc: CloudDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

    try {
      const response = await fetch(`/api/${activeProvider}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          [activeProvider === 'dropbox' ? 'filePath' : 'fileId']: activeProvider === 'dropbox' ? doc.path : doc.id 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        loadAllDocuments(); // Refresh document list
      } else {
        alert('Delete failed: ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete error occurred');
    }
  };

  const createDocument = async () => {
    try {
      const templateData = {
        applicantName: clientName,
        birthDate: '',
        birthPlace: '',
        passportNumber: '',
        // Add other template data as needed
      };

      let endpoint = '';
      if (activeProvider === 'microsoft') {
        endpoint = '/api/microsoft/create-word';
      } else if (activeProvider === 'google') {
        endpoint = '/api/google/create-doc';
      } else {
        alert('Document creation only available for Microsoft Word and Google Docs');
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientId, templateData })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Document created successfully! ${result.message}`);
        loadAllDocuments();
      } else {
        alert('Document creation failed: ' + result.error);
      }
    } catch (error) {
      console.error('Document creation error:', error);
      alert('Document creation error occurred');
    }
  };

  const searchDocuments = async () => {
    if (!searchQuery.trim()) {
      loadAllDocuments();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/${activeProvider}/search?query=${encodeURIComponent(searchQuery)}&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(prev => ({
          ...prev,
          [activeProvider]: result.results || []
        }));
      } else {
        console.error('Search failed:', result.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProviderIcon = (provider: CloudProvider) => {
    switch (provider) {
      case 'dropbox': return '📦';
      case 'microsoft': return '📄';
      case 'google': return '🗂️';
      default: return '☁️';
    }
  };

  const getProviderName = (provider: CloudProvider) => {
    switch (provider) {
      case 'dropbox': return 'Dropbox';
      case 'microsoft': return 'Microsoft OneDrive';
      case 'google': return 'Google Drive';
      default: return 'Cloud Storage';
    }
  };

  const currentDocuments = documents[activeProvider] || [];
  const currentAccountInfo = accountInfo[activeProvider];

  return (
    <div className="space-y-6">
      {/* Cloud Provider Tabs */}
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
          {(['dropbox', 'microsoft', 'google'] as CloudProvider[]).map((provider) => (
            <Button
              key={provider}
              onClick={() => setActiveProvider(provider)}
              variant={activeProvider === provider ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                activeProvider === provider 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{getProviderIcon(provider)}</span>
              <span className="hidden sm:inline">
                {provider === 'dropbox' ? 'Dropbox' : provider === 'microsoft' ? 'OneDrive' : 'Google Drive'}
              </span>
              <span className="sm:hidden">
                {provider === 'dropbox' ? 'DB' : provider === 'microsoft' ? 'OD' : 'GD'}
              </span>
            </Button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Account Info Header */}
          {currentAccountInfo && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Cloud className="w-5 h-5" />
                  {getProviderName(activeProvider)} Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Account:</span> {currentAccountInfo.account?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Storage Used:</span> {currentAccountInfo.storage?.usedPercentage || 0}%
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {currentAccountInfo.account?.accountType || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Document to {getProviderName(activeProvider)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <select
                  id="document-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full p-2 border rounded"
                >
                  <option value="passport">Passport</option>
                  <option value="birth_certificate">Birth Certificate</option>
                  <option value="marriage_certificate">Marriage Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="cloud-file-input">Select File</Label>
                <Input
                  id="cloud-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.tif"
                  className="cursor-pointer"
                />
              </div>

              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    <strong>Selected:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={uploadDocument} 
                  disabled={!selectedFile || uploading}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : `Upload to ${getProviderName(activeProvider)}`}
                </Button>

                {(activeProvider === 'microsoft' || activeProvider === 'google') && (
                  <Button 
                    onClick={createDocument} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create {activeProvider === 'microsoft' ? 'Word' : 'Google'} Doc
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchDocuments()}
                />
                <Button onClick={searchDocuments} variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
                <Button onClick={loadAllDocuments} variant="outline" title="Show all documents">
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Documents in {getProviderName(activeProvider)} ({currentDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading documents...</p>
              ) : currentDocuments.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No documents found</p>
              ) : (
                <div className="space-y-2">
                  {currentDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(doc.size)} • {formatDate(doc.modified)}
                          {doc.folder && <span> • {doc.folder}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadDocument(doc)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteDocument(doc)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features List for current provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                {getProviderIcon(activeProvider)} {getProviderName(activeProvider)} Features
              </h4>
              <p className="text-gray-600 text-sm">
                Professional cloud storage with automatic organization and secure access
              </p>
            </div>
            <div className="bg-white p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">📱 Mobile Access</h4>
              <p className="text-gray-600 text-sm">
                Access your documents from any device, anywhere
              </p>
            </div>
            {(activeProvider === 'microsoft' || activeProvider === 'google') && (
              <div className="bg-white p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Document Creation
                </h4>
                <p className="text-gray-600 text-sm">
                  Create {activeProvider === 'microsoft' ? 'Word documents' : 'Google Docs'} directly from your data
                </p>
              </div>
            )}
            <div className="bg-white p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">🔍 Smart Search</h4>
              <p className="text-gray-600 text-sm">
                Find documents quickly with powerful search capabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}