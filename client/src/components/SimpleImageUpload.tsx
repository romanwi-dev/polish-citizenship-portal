import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleImageUploadProps {
  onTextExtracted: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function SimpleImageUpload({ onTextExtracted, isProcessing, setIsProcessing }: SimpleImageUploadProps) {
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/translator/ocr', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OCR failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.extractedText) {
        onTextExtracted(result.extractedText);
        toast({
          title: "OCR completed",
          description: `Text extracted successfully (${Math.round(result.confidence)}% confidence)`,
        });
      } else {
        throw new Error("No text found in the image");
      }

    } catch (error) {
      console.error("OCR processing failed:", error);
      toast({
        title: "OCR failed",
        description: error instanceof Error ? error.message : "Failed to process the image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="hidden"
        />
        <Button
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={isProcessing}
          className="w-full upload-document-btn"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing image...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Select Image for OCR
            </>
          )}
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        <ImageIcon className="w-4 h-4 inline mr-1" />
        Supports JPG, PNG, TIFF files up to 10MB
      </div>
    </div>
  );
}