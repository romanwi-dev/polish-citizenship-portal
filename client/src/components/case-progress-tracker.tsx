import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
  Phone,
  Video
} from "lucide-react";

interface CasePhase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'blocked';
  progress: number;
  estimatedDays: number;
  actualDays?: number;
  tasks: Task[];
  documents: Document[];
  nextAction?: string;
  risks?: Risk[];
}

interface Task {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  assignedTo: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface Document {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'missing' | 'rejected';
  uploadDate?: string;
  verificationDate?: string;
}

interface Risk {
  id: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
}

const mockCaseData: CasePhase[] = [
  {
    id: "assessment",
    name: "Initial Assessment",
    description: "Comprehensive eligibility evaluation and case strategy development",
    status: "completed",
    progress: 100,
    estimatedDays: 14,
    actualDays: 12,
    tasks: [
      {
        id: "t1",
        name: "Eligibility questionnaire completed",
        status: "completed",
        assignedTo: "Anna Kowalska",
        dueDate: "2024-03-15",
        priority: "high"
      },
      {
        id: "t2",
        name: "AI case analysis completed",
        status: "completed",
        assignedTo: "System",
        dueDate: "2024-03-16",
        priority: "high"
      }
    ],
    documents: [
      {
        id: "d1",
        name: "Initial Assessment Report",
        status: "verified",
        uploadDate: "2024-03-15",
        verificationDate: "2024-03-16"
      }
    ]
  },
  {
    id: "collection",
    name: "Document Collection",
    description: "Gathering and verification of required legal documents",
    status: "current",
    progress: 75,
    estimatedDays: 45,
    actualDays: 35,
    nextAction: "Upload grandfather's marriage certificate with certified translation",
    tasks: [
      {
        id: "t3",
        name: "Client birth certificate verified",
        status: "completed",
        assignedTo: "Maria Rodriguez",
        dueDate: "2024-12-15",
        priority: "high"
      },
      {
        id: "t4",
        name: "Parents' marriage certificate verified",
        status: "completed",
        assignedTo: "Maria Rodriguez",
        dueDate: "2024-12-20",
        priority: "high"
      },
      {
        id: "t5",
        name: "Grandfather's birth certificate translation",
        status: "in-progress",
        assignedTo: "Certified Translator",
        dueDate: "2025-01-15",
        priority: "medium"
      },
      {
        id: "t6",
        name: "Archive research for missing documents",
        status: "pending",
        assignedTo: "Research Team",
        dueDate: "2025-02-01",
        priority: "high"
      }
    ],
    documents: [
      {
        id: "d2",
        name: "Client Birth Certificate",
        status: "verified",
        uploadDate: "2024-12-10",
        verificationDate: "2024-12-12"
      },
      {
        id: "d3",
        name: "Parents Marriage Certificate",
        status: "verified",
        uploadDate: "2024-12-15",
        verificationDate: "2024-12-16"
      },
      {
        id: "d4",
        name: "Grandfather Birth Certificate (Polish)",
        status: "pending",
        uploadDate: "2024-12-08"
      }
    ],
    risks: [
      {
        id: "r1",
        description: "Archive documents from 1920s may have limited availability",
        severity: "medium",
        mitigation: "Multiple archive sources being researched simultaneously"
      }
    ]
  },
  {
    id: "research",
    name: "Archive Research",
    description: "Professional research in Polish and international archives",
    status: "pending",
    progress: 0,
    estimatedDays: 30,
    tasks: [
      {
        id: "t7",
        name: "Polish State Archive research",
        status: "pending",
        assignedTo: "Archive Specialist",
        dueDate: "2025-02-15",
        priority: "high"
      },
      {
        id: "t8",
        name: "Church records research",
        status: "pending",
        assignedTo: "Archive Specialist",
        dueDate: "2025-02-20",
        priority: "medium"
      }
    ],
    documents: []
  },
  {
    id: "legal",
    name: "Legal Review & Preparation",
    description: "Legal documentation preparation and government submission forms",
    status: "pending",
    progress: 0,
    estimatedDays: 21,
    tasks: [],
    documents: []
  },
  {
    id: "submission",
    name: "Government Submission",
    description: "Official application submission to Polish authorities",
    status: "pending",
    progress: 0,
    estimatedDays: 7,
    tasks: [],
    documents: []
  },
  {
    id: "processing",
    name: "Processing & Approval",
    description: "Government processing and final decision",
    status: "pending",
    progress: 0,
    estimatedDays: 365,
    tasks: [],
    documents: []
  }
];

export default function CaseProgressTracker() {
  const [selectedPhase, setSelectedPhase] = useState<CasePhase | null>(null);
  const [showRisks, setShowRisks] = useState(true);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'current': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'blocked': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalProgress = Math.round(
    mockCaseData.reduce((acc, phase) => acc + phase.progress, 0) / mockCaseData.length
  );

  const currentPhase = mockCaseData.find(phase => phase.status === 'current');
  const completedPhases = mockCaseData.filter(phase => phase.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-blue" />
              Case Progress Overview
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-blue">{totalProgress}%</div>
              <div className="text-sm text-gray-500">Overall Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={totalProgress} className="h-3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{completedPhases}</div>
              <div className="text-sm text-green-700">Phases Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Phase Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockCaseData.map((phase, index) => (
              <div key={phase.id} className="relative">
                {/* Timeline line */}
                {index < mockCaseData.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300" />
                )}
                
                <div 
                  className="flex gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                  onClick={() => setSelectedPhase(selectedPhase?.id === phase.id ? null : phase)}
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(phase.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(phase.status)}>
                          {phase.status === 'current' ? `${phase.progress}%` : phase.status}
                        </Badge>
                        {phase.nextAction && (
                          <Badge variant="outline" className="text-blue-600">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                    
                    {phase.status === 'current' && phase.progress > 0 && (
                      <Progress value={phase.progress} className="h-2 mb-2" />
                    )}
                    
                    {phase.nextAction && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="text-sm font-medium text-blue-900">Next Action:</div>
                        <div className="text-sm text-blue-700">{phase.nextAction}</div>
                      </div>
                    )}
                    
                    <div className="flex gap-4 text-xs text-gray-500">
                      {phase.tasks.length > 0 && (
                        <span>{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length} tasks</span>
                      )}
                      {phase.documents.length > 0 && (
                        <span>{phase.documents.filter(d => d.status === 'verified').length}/{phase.documents.length} docs</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Phase Details */}
                {selectedPhase?.id === phase.id && (
                  <div className="ml-10 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Tasks */}
                      {phase.tasks.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Active Tasks
                          </h4>
                          <div className="space-y-2">
                            {phase.tasks.map(task => (
                              <div key={task.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                <div>
                                  <div className="text-sm font-medium">{task.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {task.assignedTo}
                                  </div>
                                </div>
                                <Badge className={getStatusColor(task.status)}>
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Documents */}
                      {phase.documents.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Documents
                          </h4>
                          <div className="space-y-2">
                            {phase.documents.map(doc => (
                              <div key={doc.id} className="flex justify-between items-center p-2 bg-white rounded border">
                                <div>
                                  <div className="text-sm font-medium">{doc.name}</div>
                                </div>
                                <Badge className={getStatusColor(doc.status)}>
                                  {doc.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Risks */}
                    {phase.risks && phase.risks.length > 0 && showRisks && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Risk Assessment
                        </h4>
                        {phase.risks.map(risk => (
                          <div key={risk.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-amber-900">{risk.description}</span>
                              <Badge className={getStatusColor(risk.severity)}>
                                {risk.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-amber-700">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Discuss Phase
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule Update
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4 mr-1" />
                        Video Call
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}