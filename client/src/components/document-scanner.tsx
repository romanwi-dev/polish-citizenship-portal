import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scan, 
  Upload, 
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Download,
  Eye,
  Trash2,
  RotateCw,
  Maximize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ScannedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "processing" | "completed" | "error";
  quality: "high" | "medium" | "low";
  pages: number;
  scannedAt: Date;
  extractedText?: string;
  thumbnail?: string;
}

export default function DocumentScanner({ userId = "demo-user" }: { userId?: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scan");
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ScannedDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Sample scanned documents
  const [scannedDocuments] = useState<ScannedDocument[]>([
    {
      id: "1",
      name: "Birth Certificate",
      type: "PDF",
      size: 2.4,
      status: "completed",
      quality: "high",
      pages: 1,
      scannedAt: new Date("2024-02-10"),
      extractedText: "BIRTH CERTIFICATE\nName: Jan Kowalski\nDate of Birth: 15 March 1985",
      thumbnail: "/api/placeholder/150/200"
    },
    {
      id: "2",
      name: "Marriage Certificate",
      type: "PDF",
      size: 1.8,
      status: "completed",
      quality: "high",
      pages: 2,
      scannedAt: new Date("2024-02-09"),
      extractedText: "MARRIAGE CERTIFICATE\nParties: Jan Kowalski & Maria Nowak",
      thumbnail: "/api/placeholder/150/200"
    },
    {
      id: "3",
      name: "Polish Army Records",
      type: "PDF",
      size: 5.2,
      status: "processing",
      quality: "medium",
      pages: 8,
      scannedAt: new Date("2024-02-11"),
      thumbnail: "/api/placeholder/150/200"
    }
  ]);

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          toast({
            title: "Scan Complete",
            description: "Document has been successfully scanned and processed."
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleMobileScan = () => {
    toast({
      title: "Mobile Scanner",
      description: "Opening camera for document scanning..."
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload Document",
      description: "Select files to upload and scan..."
    });
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "high":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Document Scanner
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {scannedDocuments.length} Documents
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan">Scan</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="ocr">OCR Results</TabsTrigger>
            </TabsList>
            
            {/* Scan Tab */}
            <TabsContent value="scan" className="flex-1">
              <div className="space-y-6">
                {/* Scan Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2"
                    onClick={handleScan}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Scan className="h-8 w-8" />
                    )}
                    <span className="font-medium">Desktop Scanner</span>
                    <span className="text-xs text-muted-foreground">Use connected scanner</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2"
                    onClick={handleMobileScan}
                  >
                    <Camera className="h-8 w-8" />
                    <span className="font-medium">Mobile Camera</span>
                    <span className="text-xs text-muted-foreground">Scan with phone</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col gap-2"
                    onClick={handleUpload}
                  >
                    <Upload className="h-8 w-8" />
                    <span className="font-medium">Upload Files</span>
                    <span className="text-xs text-muted-foreground">Import existing scans</span>
                  </Button>
                </div>
                
                {/* Scanning Progress */}
                {isScanning && (
                  <div className="p-6 rounded-lg border bg-blue-50 dark:bg-blue-950">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Scanning in progress...</span>
                        <span className="text-sm text-muted-foreground">{scanProgress}%</span>
                      </div>
                      <Progress value={scanProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        Processing document and extracting text...
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Scan Tips */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Scanning Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Ensure documents are flat and well-lit</li>
                    <li>• Use high resolution (300 DPI minimum) for best OCR results</li>
                    <li>• Clean scanner glass before scanning</li>
                    <li>• Save originals in PDF format for legal documents</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="flex-1">
              <ScrollArea className="h-[450px]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {scannedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative p-4 rounded-lg border bg-white dark:bg-gray-950 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowPreview(true);
                      }}
                    >
                      {/* Document Thumbnail */}
                      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      
                      {/* Document Info */}
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          <Badge className={`text-xs ${getQualityColor(doc.quality)}`}>
                            {doc.quality} quality
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.pages} page{doc.pages > 1 ? 's' : ''} • {doc.size}MB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(doc.scannedAt, 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* OCR Results Tab */}
            <TabsContent value="ocr" className="flex-1">
              <ScrollArea className="h-[450px]">
                <div className="space-y-4">
                  {scannedDocuments
                    .filter(doc => doc.status === "completed" && doc.extractedText)
                    .map((doc) => (
                      <div key={doc.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{doc.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getQualityColor(doc.quality)}>
                              {doc.quality} quality
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <RotateCw className="h-4 w-4 mr-1" />
                              Re-scan
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm">
                          <pre className="whitespace-pre-wrap">{doc.extractedText}</pre>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm" className="copy-text-btn">
                            <FileText className="h-4 w-4 mr-1" />
                            Copy Text
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                <FileText className="h-24 w-24 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedDocument.pages} page{selectedDocument.pages > 1 ? 's' : ''} • {selectedDocument.size}MB • {selectedDocument.type}
                  </p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDocument.status)}
                    <Badge className={getQualityColor(selectedDocument.quality)}>
                      {selectedDocument.quality} quality
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Maximize2 className="h-4 w-4 mr-1" />
                    Full Screen
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}