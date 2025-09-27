import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, File, CheckCircle, Clock, AlertCircle, 
  FileText, Calendar, ArrowRight, LogOut 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientData {
  caseId: string;
  clientName: string;
  email: string;
  status: string;
  lastUpdated: string;
  lineage: string;
  stage: {
    stageMsg: string;
    eta: string;
    note: string;
  };
  progress: {
    completedSteps: number;
    totalSteps: number;
    percentage: number;
  };
  documents: {
    received: number;
    expected: number;
    percentage: number;
  };
  nextActions: string[];
}

function FileUploadSection({ token, onAuthError }: { token: string; onAuthError: () => void }) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        headers: {
          // Add token to identify the client
          'X-Client-Token': token
        }
      });

      const result = await response.json();

      if (!response.ok) {
        // Check for authentication errors and redirect to login
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          onAuthError();
          return;
        }
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedFiles(prev => [...prev, result.file.fileName]);
      toast({
        title: "File Uploaded Successfully!",
        description: `${file.name} has been securely uploaded to your case file.`,
      });

    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-blue-500" />
          <span>File Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          data-testid="drop-zone-file"
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading your file...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your files here</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  or click to browse your computer
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Supports: PDF, DOC, DOCX, JPG, PNG, TIFF (max 10MB)
                </p>
              </div>
              <Button className="mt-4" data-testid="button-browse-files">
                <FileText className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.tif"
                onChange={handleFileSelect}
                data-testid="input-file"
              />
            </>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Uploaded Files:</p>
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{fileName}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProgressSection({ clientData }: { clientData: ClientData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <span>Case Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {clientData.progress.percentage}%
            </span>
          </div>
          <Progress value={clientData.progress.percentage} className="h-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {clientData.progress.completedSteps} of {clientData.progress.totalSteps} steps completed
          </p>
        </div>

        {/* Document Collection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Documents Collected</span>
            <span className="text-sm font-bold text-green-600">
              {clientData.documents.percentage}%
            </span>
          </div>
          <Progress value={clientData.documents.percentage} className="h-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {clientData.documents.received} of {clientData.documents.expected} documents received
          </p>
        </div>

        {/* Current Status */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="secondary" data-testid="badge-status">
              {clientData.status.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-gray-500">
              Updated {new Date(clientData.lastUpdated).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {clientData.stage.stageMsg}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NextStepsSection({ clientData }: { clientData: ClientData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-green-500" />
          <span>What Happens Next</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stage Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Current Stage:</strong> {clientData.stage.stageMsg}</p>
              <p><strong>Estimated Timeline:</strong> {clientData.stage.eta}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {clientData.stage.note}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Next Actions */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Upcoming Actions:</p>
          {clientData.nextActions.map((action, index) => (
            <div key={index} className="flex items-start space-x-3" data-testid={`action-item-${index}`}>
              <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
            </div>
          ))}
        </div>

        {/* Family Lineage Information */}
        {clientData.lineage && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Family Lineage:
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {clientData.lineage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ClientHomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string>("");

  // Handle authentication errors by redirecting to login
  const handleAuthError = () => {
    setLocation('/client/login');
  };

  // Custom fetcher that handles 401 errors for useQuery
  const authenticatedFetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        'X-Client-Token': token
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Check for authentication errors and redirect to login
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        handleAuthError();
        throw new Error('Authentication required');
      }
      throw new Error(data.error || 'Failed to fetch data');
    }
    
    return data;
  };

  // Get token from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (!urlToken) {
      toast({
        title: "Authentication Required",
        description: "Please request a magic link to access your client portal.",
        variant: "destructive"
      });
      setLocation('/client/login');
      return;
    }
    
    setToken(urlToken);
  }, [setLocation, toast]);

  // Fetch client data - using TEST case ID for demo with authentication
  const { data: clientData, isLoading, error } = useQuery<ClientData>({
    queryKey: ['/api/client/TEST-123/tracker'],
    queryFn: () => authenticatedFetcher('/api/client/TEST-123/tracker'),
    enabled: !!token,
  });

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been securely logged out of your client portal.",
    });
    setLocation('/client/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your client portal...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load client data. Please try requesting a new magic link.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => setLocation('/client/login')}
              data-testid="button-back-login"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Client Portal
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Case ID: {clientData.caseId}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProgressSection clientData={clientData} />
            <FileUploadSection token={token} onAuthError={handleAuthError} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <NextStepsSection clientData={clientData} />
          </div>
        </div>
      </div>
    </div>
  );
}