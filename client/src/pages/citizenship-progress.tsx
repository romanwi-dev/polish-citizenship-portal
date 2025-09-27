import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { CitizenshipProgressBar } from "@/components/citizenship-progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";


import { 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  FileText,
  Users,
  Award
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Demo user ID for testing
const DEMO_USER_ID = "demo-user-123";

interface ProgressData {
  userId: string;
  stages: Array<{
    id: string;
    stageId: string;
    stageName: string;
    status: 'completed' | 'in-progress' | 'pending' | 'delayed';
    startDate?: string;
    completedDate?: string;
    estimatedDuration: string;
    actualDuration?: string;
    requirements: string[];
    notes?: string;
    orderIndex: number;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description?: string;
    completedDate?: string;
    isMajor: boolean;
  }>;
  summary: {
    totalStages: number;
    completedStages: number;
    progressPercentage: number;
    currentStage?: {
      id: string;
      name: string;
      status: string;
    };
  };
}

export default function CitizenshipProgressPage() {
  const [selectedView, setSelectedView] = useState<'detailed' | 'compact'>('detailed');
  const [isInitializing, setIsInitializing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch citizenship progress data
  const { data: progressData, isLoading, error, refetch } = useQuery<ProgressData>({
    queryKey: [`/api/citizenship-progress/${DEMO_USER_ID}`],
    retry: 1,
  });

  // Initialize progress for demo user
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/citizenship-progress/initialize/${DEMO_USER_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress Initialized",
        description: "Demo citizenship progress has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/citizenship-progress/${DEMO_USER_ID}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize progress data.",
        variant: "destructive",
      });
    }
  });

  // Update stage status
  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, status, notes }: { 
      stageId: string; 
      status: 'completed' | 'in-progress' | 'pending' | 'delayed';
      notes?: string;
    }) => {
      const response = await fetch(`/api/citizenship-progress/${DEMO_USER_ID}/${stageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Stage Updated",
        description: `Stage status changed to ${variables.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/citizenship-progress/${DEMO_USER_ID}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update stage status.",
        variant: "destructive",
      });
    }
  });

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeMutation.mutateAsync();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStageUpdate = (stageId: string, status: 'completed' | 'in-progress' | 'pending' | 'delayed') => {
    updateStageMutation.mutate({ 
      stageId, 
      status,
      notes: `Status updated to ${status} via demo interface`
    });
  };

  // Show initialization screen if no data
  if (!isLoading && !progressData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Initialize Demo Progress</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                This demo showcases the interactive citizenship progress tracking system. 
                Click below to initialize sample progress data.
              </p>
              <Button 
                onClick={handleInitialize}
                disabled={isInitializing}
                size="lg"
                className="min-w-[200px]"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Initialize Progress Demo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        
        <div className="container mx-auto px-4 py-12">
          <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load progress data. This might be because the demo hasn't been initialized yet.
              <Button 
                onClick={handleInitialize}
                variant="outline"
                size="sm"
                className="ml-4"
                disabled={isInitializing}
              >
                {isInitializing ? "Initializing..." : "Initialize Demo"}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Citizenship Application Progress
              </h1>
              <p className="text-gray-600">
                Track your journey to Polish citizenship with our interactive progress system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress Summary Cards */}
          {progressData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {progressData.summary.completedStages}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {progressData.stages.filter(s => s.status === 'in-progress').length}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-700">
                        {progressData.stages.filter(s => s.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700">
                        {progressData.summary.progressPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
          <TabsList className="mb-6">
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
            <TabsTrigger value="compact">Compact View</TabsTrigger>
          </TabsList>

          <TabsContent value="detailed">
            {progressData ? (
              <CitizenshipProgressBar 
                className="mb-8"
                showDetails={true}
                compact={false}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compact">
            {progressData ? (
              <CitizenshipProgressBar 
                className="mb-8"
                showDetails={false}
                compact={true}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Demo Controls */}
        {progressData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demo Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.stages.slice(0, 6).map((stage) => (
                  <div key={stage.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{stage.stageName}</h4>
                      <Badge variant={
                        stage.status === 'completed' ? 'default' :
                        stage.status === 'in-progress' ? 'secondary' :
                        'outline'
                      }>
                        {stage.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStageUpdate(stage.stageId, 'pending')}
                        disabled={updateStageMutation.isPending}
                      >
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStageUpdate(stage.stageId, 'in-progress')}
                        disabled={updateStageMutation.isPending}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStageUpdate(stage.stageId, 'completed')}
                        disabled={updateStageMutation.isPending}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}