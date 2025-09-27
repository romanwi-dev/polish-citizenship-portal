import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DocumentUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ userId, onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get document categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["/api/document-categories"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = (categoriesResponse as any)?.data || [];

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Uploaded",
        description: `${documentName || selectedFile?.name} has been successfully uploaded.`,
      });
      
      // Reset form
      setSelectedFile(null);
      setDocumentName("");
      setDescription("");
      setPriority("medium");
      setSelectedCategoryId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${userId}`] });
      
      onUploadComplete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategoryId) {
      toast({
        title: "Category Required",
        description: "Please select a document category.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("userId", userId);
    formData.append("categoryId", selectedCategoryId);
    formData.append("name", documentName || selectedFile.name);
    formData.append("description", description);
    formData.append("priority", priority);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.tif"
              onChange={handleFileSelect}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                <p className="text-xs text-blue-600">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name</Label>
            <Input
              id="document-name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full`}
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  High Priority
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Medium Priority
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  Low Priority
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this document"
            rows={3}
          />
        </div>

        {/* Upload Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedCategoryId || uploadMutation.isPending}
            className="min-w-32"
          >
            {uploadMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}