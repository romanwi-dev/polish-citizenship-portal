import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Calendar,
  FileText,
  Users,
  Gavel,
  Home,
  ChevronRight,
  Info,
  BookOpen,
  Globe,
  Shield,
  Award,
  TrendingUp,
  BarChart3,
  Target,
  MapPin,
  Star,
  Zap,
  Archive,
  Bookmark
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface TimelineEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  status: "completed" | "in-progress" | "upcoming" | "delayed";
  category: "document" | "legal" | "administrative" | "payment";
  estimatedDuration?: string;
  dependencies?: string[];
  notes?: string;
  order: number;
  tier?: number;
  successRate?: number;
  complexity?: "low" | "medium" | "high";
  keyInsights?: string[];
}

interface ProcessPhase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tier: number;
  color: string;
  bgColor: string;
  icon: any;
  events: TimelineEvent[];
  statistics: {
    averageDuration: string;
    successRate: number;
    complexity: string;
    keyRequirements: string[];
  };
}

export default function InteractiveTimeline({ userId = "demo-user" }: { userId?: string }) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch timeline events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/timeline-events', userId],
    queryFn: async () => {
      const response = await fetch(`/api/timeline-events/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch timeline events');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Update event status
  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: Partial<TimelineEvent> }) => {
      const response = await fetch(`/api/timeline-events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events', userId] });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "delayed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "legal":
        return <Gavel className="h-4 w-4" />;
      case "administrative":
        return <Users className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const completedCount = events.filter((e: TimelineEvent) => e.status === "completed").length;
  const progressPercentage = events.length > 0 ? (completedCount / events.length) * 100 : 0;

  // Process phases inspired by GlobalPassport.ai research brief structure
  const processPhases: ProcessPhase[] = [
    {
      id: "phase-1",
      title: "Discovery & Assessment",
      subtitle: "Tier 1: Foundation Analysis",
      description: "Comprehensive eligibility evaluation and pathway identification",
      tier: 1,
      color: "text-blue-700",
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
      icon: BookOpen,
      events: [
        {
          id: "1",
          userId,
          title: "Initial Consultation",
          description: "Strategic planning session with heritage verification",
          date: new Date("2024-01-15"),
          status: "completed" as const,
          category: "administrative" as const,
          estimatedDuration: "1-2 hours",
          order: 1,
          tier: 1,
          successRate: 95,
          complexity: "low" as const,
          keyInsights: ["Family tree analysis", "Document roadmap", "Timeline planning"]
        },
        {
          id: "2",
          userId,
          title: "Eligibility Assessment",
          description: "AI-powered heritage analysis and qualification review",
          date: new Date("2024-01-20"),
          status: "completed" as const,
          category: "administrative" as const,
          estimatedDuration: "3-5 days",
          order: 2,
          tier: 1,
          successRate: 89,
          complexity: "medium" as const,
          keyInsights: ["Ancestry verification", "Legal pathway confirmation", "Risk assessment"]
        }
      ],
      statistics: {
        averageDuration: "1-2 weeks",
        successRate: 92,
        complexity: "Low-Medium",
        keyRequirements: ["Birth certificates", "Marriage records", "Family documentation"]
      }
    },
    {
      id: "phase-2",
      title: "Document Acquisition",
      subtitle: "Tier 2: Evidence Collection",
      description: "Systematic gathering and verification of ancestral records",
      tier: 2,
      color: "text-orange-700",
      bgColor: "bg-gradient-to-r from-orange-50 to-amber-50",
      icon: Archive,
      events: [
        {
          id: "3",
          userId,
          title: "Document Collection",
          description: "Obtain civil registry records from Polish archives",
          date: new Date("2024-02-01"),
          status: "completed" as const,
          category: "document" as const,
          estimatedDuration: "4-8 weeks",
          order: 3,
          tier: 2,
          successRate: 78,
          complexity: "high" as const,
          keyInsights: ["Archive research", "Record reconstruction", "Chain of custody"]
        },
        {
          id: "4",
          userId,
          title: "Translation & Apostille",
          description: "Professional translation and international certification",
          date: new Date("2024-02-20"),
          status: "in-progress" as const,
          category: "document" as const,
          estimatedDuration: "2-4 weeks",
          order: 4,
          tier: 2,
          successRate: 94,
          complexity: "medium" as const,
          keyInsights: ["Certified translation", "Apostille process", "Format compliance"]
        }
      ],
      statistics: {
        averageDuration: "6-12 weeks",
        successRate: 86,
        complexity: "Medium-High",
        keyRequirements: ["Polish civil records", "Certified translations", "Apostille certificates"]
      }
    },
    {
      id: "phase-3",
      title: "Application Processing",
      subtitle: "Tier 3: Official Submission",
      description: "Formal application submission and government review process",
      tier: 3,
      color: "text-emerald-700",
      bgColor: "bg-gradient-to-r from-emerald-50 to-green-50",
      icon: Shield,
      events: [
        {
          id: "5",
          userId,
          title: "Application Submission",
          description: "Submit to Polish Voivodeship Office for review",
          date: new Date("2024-05-01"),
          status: "upcoming" as const,
          category: "legal" as const,
          estimatedDuration: "12-18 months",
          order: 5,
          tier: 3,
          successRate: 73,
          complexity: "high" as const,
          keyInsights: ["Government review", "Legal verification", "Administrative processing"]
        },
        {
          id: "6",
          userId,
          title: "Decision & Confirmation",
          description: "Receive citizenship confirmation and Polish passport eligibility",
          date: new Date("2024-11-01"),
          status: "upcoming" as const,
          category: "legal" as const,
          estimatedDuration: "2-4 weeks",
          order: 6,
          tier: 3,
          successRate: 96,
          complexity: "low" as const,
          keyInsights: ["Citizenship certificate", "Passport application", "EU rights activation"]
        }
      ],
      statistics: {
        averageDuration: "14-20 months",
        successRate: 84,
        complexity: "High",
        keyRequirements: ["Complete application", "Government fees", "Legal representation"]
      }
    }
  ];

  // Flatten all events for progress calculation
  const allEvents = processPhases.flatMap(phase => phase.events);
  const displayEvents = events.length > 0 ? events : allEvents;

  return (
    <>
      <Card className="h-[800px] flex flex-col">
        <CardHeader className="pb-2">
          {/* Research Brief Style Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium uppercase tracking-wide">
                <BookOpen className="h-4 w-4" />
                Polish Citizenship Timeline
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Pathway to EU Citizenship</h2>
              <p className="text-sm text-gray-600 mt-1">A structured framework for citizenship by descent success</p>
            </div>
          </div>
          
          {/* Executive Summary Statistics */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-600">{Math.round(progressPercentage)}%</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Overall Progress</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{completedCount}/{displayEvents.length}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Steps Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">87%</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">18m</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">Avg Duration</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[700px]">
            {/* Process Phases - Infographic Style */}
            <div className="space-y-8 p-6">
              {processPhases.map((phase, phaseIndex) => {
                const phaseEvents = events.length > 0 ? events.filter((e: TimelineEvent) => e.tier === phase.tier) : phase.events;
                const phaseCompleted = phaseEvents.filter((e: TimelineEvent) => e.status === 'completed').length;
                const phaseProgress = phaseEvents.length > 0 ? (phaseCompleted / phaseEvents.length) * 100 : 0;
                
                return (
                  <div key={phase.id} className={`rounded-xl border-2 overflow-hidden ${phase.bgColor} border-gray-200`}>
                    {/* Phase Header - Research Brief Style */}
                    <div className="p-6 border-b border-gray-200 bg-white/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg bg-white shadow-sm border-2 ${phase.color.replace('text-', 'border-')}`}>
                            <phase.icon className={`h-6 w-6 ${phase.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Bookmark className={`h-4 w-4 ${phase.color}`} />
                              <span className={`text-sm font-bold uppercase tracking-wide ${phase.color}`}>
                                {phase.subtitle}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{phase.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{phase.description}</p>
                            
                            {/* Phase Statistics */}
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-gray-900">{phase.statistics.averageDuration}</div>
                                <div className="text-xs text-gray-500">Duration</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-emerald-600">{phase.statistics.successRate}%</div>
                                <div className="text-xs text-gray-500">Success Rate</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-orange-600">{phase.statistics.complexity}</div>
                                <div className="text-xs text-gray-500">Complexity</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-blue-600">{Math.round(phaseProgress)}%</div>
                                <div className="text-xs text-gray-500">Complete</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Phase Progress Circle */}
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-sm font-bold ${phase.color.replace('text-', 'border-')} bg-white`}>
                            {phaseCompleted}/{phaseEvents.length}
                          </div>
                          <Progress value={phaseProgress} className="w-16 h-1 mt-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Phase Events */}
                    <div className="p-6 space-y-4">
                      {phaseEvents.map((event: TimelineEvent, eventIndex: number) => (
                        <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                             onClick={() => { setSelectedEvent(event); setShowDetails(true); }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 ${getStatusIcon(event.status) ? 'text-current' : 'text-gray-400'}`}>
                                {getStatusIcon(event.status)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                
                                {/* Event Insights */}
                                {event.keyInsights && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {event.keyInsights.slice(0, 3).map((insight: string, i: number) => (
                                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                        {insight}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Event Metrics */}
                            <div className="text-right text-xs text-gray-500 space-y-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                <span>{event.successRate}% success</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.estimatedDuration}</span>
                              </div>
                              <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                                {event.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {event.status === "in-progress" && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>65% complete</span>
                              </div>
                              <Progress value={65} className="h-2" />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Phase Requirements */}
                      <div className="mt-6 p-4 bg-white/70 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Key Requirements
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          {phase.statistics.keyRequirements.map((req: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                              {req}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Enhanced Event Details Dialog - Research Brief Style */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getStatusIcon(selectedEvent.status)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                    <DialogDescription className="mt-1">{selectedEvent.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              {/* Event Analytics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{selectedEvent.successRate || 85}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{selectedEvent.complexity || 'Medium'}</div>
                  <div className="text-xs text-gray-600">Complexity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">Tier {selectedEvent.tier || 1}</div>
                  <div className="text-xs text-gray-600">Process Tier</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <Badge className={`mt-1 block w-fit ${getStatusColor(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Category</span>
                    <Badge variant="outline" className="mt-1 block w-fit">
                      {getCategoryIcon(selectedEvent.category)}
                      <span className="ml-1">{selectedEvent.category}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Target Date:</span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(selectedEvent.date), 'MMMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <span className="text-sm text-gray-600">{selectedEvent.estimatedDuration}</span>
                </div>
                
                {/* Key Insights */}
                {selectedEvent.keyInsights && selectedEvent.keyInsights.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Key Insights</span>
                    <div className="space-y-2">
                      {selectedEvent.keyInsights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.dependencies && selectedEvent.dependencies.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Dependencies</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.dependencies.map((dep: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Additional Notes</span>
                    </div>
                    <p className="text-sm text-blue-800">{selectedEvent.notes}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {selectedEvent.status === "upcoming" && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        updateEventMutation.mutate({
                          eventId: selectedEvent.id,
                          updates: { status: "in-progress" }
                        });
                        setShowDetails(false);
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Start This Step
                    </Button>
                  )}
                  
                  {selectedEvent.status === "in-progress" && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        updateEventMutation.mutate({
                          eventId: selectedEvent.id,
                          updates: { status: "completed" }
                        });
                        setShowDetails(false);
                      }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}