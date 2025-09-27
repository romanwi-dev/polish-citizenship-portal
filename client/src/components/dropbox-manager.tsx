import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, Download, Trash2, Search, FolderOpen, Cloud } from "lucide-react";

interface DropboxDocument {
  name: string;
  path: string;
  size: number;
  modified: string;
  id: string;
}

interface DropboxManagerProps {
  clientId: string;
  clientName: string;
}

export function DropboxManager({ clientId, clientName }: DropboxManagerProps) {
  const [documents, setDocuments] = useState<DropboxDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'passport' | 'birth_certificate' | 'marriage_certificate' | 'other'>('other');
  const [accountInfo, setAccountInfo] = useState<any>(null);

  // Load client documents on component mount
  useEffect(() => {
    loadDocuments();
    loadAccountInfo();
  }, [clientId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dropbox/documents/${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.documents);
      } else {
        console.error('Failed to load documents:', result.error);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountInfo = async () => {
    try {
      const response = await fetch('/api/dropbox/account');
      const result = await response.json();
      
      if (result.success) {
        setAccountInfo(result);
      }
    } catch (error) {
      console.error('Error loading account info:', error);
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

      const response = await fetch('/api/dropbox/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setSelectedFile(null);
        loadDocuments(); // Refresh document list
        
        // Reset file input
        const fileInput = document.getElementById('dropbox-file-input') as HTMLInputElement;
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

  const downloadDocument = async (doc: DropboxDocument) => {
    try {
      const response = await fetch(`/api/dropbox/download?filePath=${encodeURIComponent(doc.path)}`);
      
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

  const deleteDocument = async (doc: DropboxDocument) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

    try {
      const response = await fetch('/api/dropbox/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath: doc.path })
      });

      const result = await response.json();
      
      if (result.success) {
        loadDocuments(); // Refresh document list
      } else {
        alert('Delete failed: ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete error occurred');
    }
  };

  const searchDocuments = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/dropbox/search?query=${encodeURIComponent(searchQuery)}&clientId=${clientId}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.results);
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

  return (
    <div className="space-y-6">
      {/* Account Info Header */}
      {accountInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Cloud className="w-5 h-5" />
              Dropbox Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Account:</span> {accountInfo.account?.name}
              </div>
              <div>
                <span className="font-medium">Storage Used:</span> {accountInfo.storage?.usedPercentage}%
              </div>
              <div>
                <span className="font-medium">Type:</span> {accountInfo.account?.accountType}
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
            Upload Document
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
            <Label htmlFor="dropbox-file-input">Select File</Label>
            <Input
              id="dropbox-file-input"
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

          <Button 
            onClick={uploadDocument} 
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload to Dropbox'}
          </Button>
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
            <Button onClick={loadDocuments} variant="outline" title="Show all documents">
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
            Client Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No documents found</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(doc.size)} • {formatDate(doc.modified)}
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
    </div>
  );
}