import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';

interface SimpleImageUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isProcessing?: boolean;
  previewUrl?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export const SimpleImageUpload = ({
  onFileSelect,
  onClear,
  isProcessing = false,
  previewUrl,
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: SimpleImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const handleFileSelection = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleClear = () => {
    setError(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Document preview"
              className="w-full h-64 object-contain bg-gray-50"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Processing document...</p>
                </div>
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClear}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer mobile-card ${
            isDragging
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-red-600" />
              </div>
              <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Document Photo
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your document image here, or click to browse
            </p>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: JPEG, PNG, WebP</p>
              <p>Maximum size: {maxSizeMB}MB</p>
            </div>
            
            <Button 
              className="mt-6 mobile-button bg-red-600 hover:bg-red-700 text-white"
              type="button"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};