import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Citizenship application stages with colors and timelines
export interface CitizenshipStage {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "delayed";
  estimatedDuration: string;
  actualDuration?: string;
  completedDate?: string;
  startDate?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  requirements?: string[];
  notes?: string;
}

const CITIZENSHIP_STAGES: CitizenshipStage[] = [
  {
    id: "initial-consultation",
    title: "Initial Consultation",
    description: "Case assessment and eligibility evaluation",
    status: "completed",
    estimatedDuration: "1-2 weeks",
    actualDuration: "1 week",
    completedDate: "2024-01-15",
    startDate: "2024-01-08",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    requirements: ["Completed eligibility test", "Initial documentation review", "Service agreement signed"],
    notes: "Completed ahead of schedule"
  },
  {
    id: "document-collection",
    title: "Document Collection",
    description: "Gathering all required Polish ancestry documents",
    status: "completed",
    estimatedDuration: "2-4 months",
    actualDuration: "3 months",
    completedDate: "2024-04-15",
    startDate: "2024-01-16",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
    requirements: ["Birth certificates", "Marriage certificates", "Immigration records", "Polish civil acts"],
    notes: "All documents successfully obtained"
  },
  {
    id: "document-verification",
    title: "Document Verification",
    description: "Official verification and translation of documents",
    status: "in-progress",
    estimatedDuration: "3-6 weeks",
    startDate: "2024-04-16",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Clock,
    requirements: ["Apostille certification", "Sworn translations", "Document authentication"],
    notes: "Currently processing apostille certification"
  },
  {
    id: "application-preparation",
    title: "Application Preparation",
    description: "Preparing official citizenship application",
    status: "pending",
    estimatedDuration: "2-3 weeks",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Circle,
    requirements: ["Complete application forms", "Prepare supporting documentation", "Legal review"],
    notes: "Waiting for document verification completion"
  },
  {
    id: "government-submission",
    title: "Government Submission",
    description: "Submitting application to Polish authorities",
    status: "pending",
    estimatedDuration: "1-2 weeks",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Circle,
    requirements: ["Submit to Provincial Office", "Pay government fees", "Receive confirmation"],
    notes: "Pending previous stage completion"
  },
  {
    id: "government-review",
    title: "Government Review",
    description: "Polish government processing and review",
    status: "pending",
    estimatedDuration: "12-36 months",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Circle,
    requirements: ["Government case review", "Possible additional requests", "Final decision"],
    notes: "Longest stage - government processing time varies"
  },
  {
    id: "decision-notification",
    title: "Decision & Documentation",
    description: "Citizenship decision and passport application",
    status: "pending",
    estimatedDuration: "2-4 weeks",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Circle,
    requirements: ["Citizenship confirmation", "Polish passport application", "ID card processing"],
    notes: "Final stage after positive decision"
  }
];

interface CitizenshipProgressBarProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function CitizenshipProgressBar({ 
  className, 
  showDetails = true, 
  compact = false 
}: CitizenshipProgressBarProps) {
  const [stages, setStages] = useState<CitizenshipStage[]>(CITIZENSHIP_STAGES);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Calculate overall progress
  const completedStages = stages.filter(stage => stage.status === "completed").length;
  const totalStages = stages.length;
  const progressPercentage = (completedStages / totalStages) * 100;

  // Get current stage
  const currentStage = stages.find(stage => stage.status === "in-progress") || 
                      stages.find(stage => stage.status === "pending");

  const getStatusIcon = (stage: CitizenshipStage) => {
    const IconComponent = stage.icon;
    switch (stage.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "delayed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "delayed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Delayed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Application Progress</h3>
            <span className="text-sm font-medium text-gray-600">
              {completedStages} of {totalStages} stages completed
            </span>
          </div>
          
          {/* Compact Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="absolute -top-1 left-0 w-full flex justify-between">
              {stages.map((stage, index) => (
                <div 
                  key={stage.id}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center",
                    stage.status === "completed" ? "border-green-500" :
                    stage.status === "in-progress" ? "border-blue-500" :
                    "border-gray-300"
                  )}
                  style={{ left: `${(index / (totalStages - 1)) * 100}%` }}
                >
                  {stage.status === "completed" && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {currentStage && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Current Stage:</span>
                <span className="text-sm text-blue-700">{currentStage.title}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Citizenship Application Progress</h3>
            <p className="text-gray-600">Track your journey to Polish citizenship</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Started</span>
            <span>{completedStages} of {totalStages} stages</span>
            <span>Citizenship Granted</span>
          </div>
        </div>

        {/* Detailed Stage List */}
        {showDetails && (
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div 
                key={stage.id}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200",
                  stage.borderColor,
                  stage.bgColor,
                  selectedStage === stage.id ? "ring-2 ring-blue-500" : "",
                  "cursor-pointer hover:shadow-md"
                )}
                onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Stage Number and Icon */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
                      stage.status === "completed" ? "bg-green-100 border-green-500" :
                      stage.status === "in-progress" ? "bg-blue-100 border-blue-500" :
                      stage.status === "delayed" ? "bg-red-100 border-red-500" :
                      "bg-gray-100 border-gray-300"
                    )}>
                      {getStatusIcon(stage)}
                    </div>
                    {index < stages.length - 1 && (
                      <div className={cn(
                        "w-0.5 h-8",
                        stage.status === "completed" ? "bg-green-300" : "bg-gray-200"
                      )} />
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={cn("font-semibold", stage.color)}>{stage.title}</h4>
                      {getStatusBadge(stage.status)}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{stage.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {stage.actualDuration || stage.estimatedDuration}
                        </span>
                      </div>
                      
                      {stage.completedDate && (
                        <div className="text-green-600">
                          Completed: {new Date(stage.completedDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {stage.startDate && !stage.completedDate && (
                        <div className="text-blue-600">
                          Started: {new Date(stage.startDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedStage === stage.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {stage.requirements && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Requirements:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {stage.requirements.map((req, idx) => (
                                <li key={idx} className="text-sm text-gray-700">{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {stage.notes && (
                          <div className="bg-white bg-opacity-50 rounded p-3">
                            <h5 className="font-medium text-gray-900 mb-1">Notes:</h5>
                            <p className="text-sm text-gray-700">{stage.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-gray-400 mt-8" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">
              {stages.filter(s => s.status === "completed").length}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">
              {stages.filter(s => s.status === "in-progress").length}
            </div>
            <div className="text-sm text-blue-600">In Progress</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-700">
              {stages.filter(s => s.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}