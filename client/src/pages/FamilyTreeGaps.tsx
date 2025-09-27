import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Archive,
  Globe,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface DocumentStatus {
  birth: 'present' | 'uploaded' | 'missing';
  marriage: 'present' | 'uploaded' | 'missing';
  death: 'present' | 'uploaded' | 'missing';
  passport: 'present' | 'uploaded' | 'missing';
}

interface PersonNode {
  id: string;
  name: string;
  given?: string;
  surname?: string;
  dob?: string;
  pob?: string;
  relationship: 'applicant' | 'parent1' | 'parent2' | 'grandparent1' | 'grandparent2';
  generation: number; // 0=applicant, 1=parents, 2=grandparents
  docs: DocumentStatus;
  x: number;
  y: number;
}

interface DocumentGap {
  personId: string;
  personName: string;
  documentType: 'birth' | 'marriage' | 'death' | 'passport';
  priority: 'high' | 'medium' | 'low';
  suggestedAction: 'translation' | 'usc_filing' | 'archive_search' | 'obtain_copy';
}

export default function FamilyTreeGaps() {
  const { caseId } = useParams<{ caseId: string }>();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch family tree data
  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ['family-tree-gaps', caseId],
    queryFn: async () => {
      const response = await apiRequest(`/api/cases/${caseId}/tree`);
      return response;
    },
    enabled: !!caseId
  });

  // Transform tree data into positioned nodes
  const familyNodes: PersonNode[] = React.useMemo(() => {
    const canvasWidth = 800;
    const canvasHeight = 600;

    // If no tree data or insufficient data, create demo family tree
    if (!treeData?.tree?.persons || treeData.tree.persons.length <= 1) {
      return getDemoFamilyTree(canvasWidth, canvasHeight);
    }

    const nodes: PersonNode[] = [];

    // Handle real tree data structure
    const persons = treeData.tree.persons;
    const relationships = treeData.tree.relationships || [];

    // Find applicant (first person or person with relation 'self')
    const applicant = persons.find((p: any) => 
      p.relation === 'self' || p.id === 'applicant' || p.generation === 0
    ) || persons[0];

    if (applicant) {
      nodes.push({
        id: applicant.id,
        name: `${applicant.given || applicant.name || ''} ${applicant.surname || ''}`.trim() || 'Applicant',
        given: applicant.given || applicant.name,
        surname: applicant.surname,
        dob: applicant.born?.date || applicant.birthDate || applicant.bornDate,
        pob: applicant.born?.place || applicant.birthPlace || applicant.bornPlace,
        relationship: 'applicant',
        generation: 0,
        docs: getDummyDocStatus(),
        x: canvasWidth / 2,
        y: canvasHeight - 100
      });

      // Find parents through relationships
      const parentRelationships = relationships.filter((rel: any) => rel.child === applicant.id);
      const parentIds = parentRelationships.map((rel: any) => rel.parent);
      const parents = persons.filter((p: any) => parentIds.includes(p.id));
      
      parents.forEach((parent: any, index: number) => {
        nodes.push({
          id: parent.id,
          name: `${parent.given || parent.name || ''} ${parent.surname || ''}`.trim() || `Parent ${index + 1}`,
          given: parent.given || parent.name,
          surname: parent.surname,
          dob: parent.born?.date || parent.birthDate || parent.bornDate,
          pob: parent.born?.place || parent.birthPlace || parent.bornPlace,
          relationship: index === 0 ? 'parent1' : 'parent2',
          generation: 1,
          docs: getDummyDocStatus(),
          x: canvasWidth / 2 + (index === 0 ? -150 : 150),
          y: canvasHeight - 250
        });
      });

      // Find grandparents
      const grandparentIds: string[] = [];
      parents.forEach((parent: any) => {
        const grandparentRels = relationships.filter((rel: any) => rel.child === parent.id);
        grandparentIds.push(...grandparentRels.map((rel: any) => rel.parent));
      });
      
      const grandparents = persons.filter((p: any) => grandparentIds.includes(p.id));
      
      grandparents.forEach((grandparent: any, index: number) => {
        nodes.push({
          id: grandparent.id,
          name: `${grandparent.given || grandparent.name || ''} ${grandparent.surname || ''}`.trim() || `Grandparent ${index + 1}`,
          given: grandparent.given || grandparent.name,
          surname: grandparent.surname,
          dob: grandparent.born?.date || grandparent.birthDate || grandparent.bornDate,
          pob: grandparent.born?.place || grandparent.birthPlace || grandparent.bornPlace,
          relationship: index === 0 ? 'grandparent1' : 'grandparent2',
          generation: 2,
          docs: getDummyDocStatus(),
          x: canvasWidth / 4 + (index * canvasWidth / 2),
          y: canvasHeight - 400
        });
      });
    }

    return nodes.length > 0 ? nodes : getDemoFamilyTree(canvasWidth, canvasHeight);
  }, [treeData]);

  // Generate document gaps
  const documentGaps: DocumentGap[] = React.useMemo(() => {
    const gaps: DocumentGap[] = [];
    
    familyNodes.forEach(node => {
      Object.entries(node.docs).forEach(([docType, status]) => {
        if (status === 'missing') {
          gaps.push({
            personId: node.id,
            personName: node.name,
            documentType: docType as any,
            priority: getPriorityForDocument(node.generation, docType),
            suggestedAction: getSuggestedAction(docType, node.generation)
          });
        }
      });
    });

    return gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [familyNodes]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (gap: DocumentGap) => {
      const taskData = {
        title: `Obtain ${gap.documentType} certificate for ${gap.personName}`,
        description: `${getTaskDescription(gap.suggestedAction)} for ${gap.personName}`,
        type: gap.suggestedAction,
        priority: gap.priority,
        assignedTo: null,
        dueDate: getDefaultDueDate(gap.suggestedAction),
        personId: gap.personId,
        documentType: gap.documentType
      };

      return await apiRequest(`/api/cases/${caseId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    },
    onSuccess: (data, gap) => {
      toast({
        title: "Task Created",
        description: `Created task for ${gap.personName}'s ${gap.documentType} certificate`,
      });
      queryClient.invalidateQueries({ queryKey: ['case-timeline', caseId] });
    },
    onError: (error: any) => {
      toast({
        title: "Task Creation Failed",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  });

  // Canvas interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCanvasOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  if (treeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Family Tree - Document Gaps</h1>
              <p className="text-muted-foreground">Case #{caseId}</p>
            </div>
          </div>
          
          {/* Canvas Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden bg-muted/20">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="relative"
              style={{
                transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                width: '800px',
                height: '600px',
                margin: '50px auto'
              }}
            >
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {familyNodes.map(node => {
                  if (node.generation === 0) return null; // Applicant has no children to connect to
                  
                  const children = familyNodes.filter(child => 
                    child.generation === node.generation - 1
                  );
                  
                  return children.map(child => (
                    <line
                      key={`${node.id}-${child.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={child.x}
                      y2={child.y}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  ));
                })}
              </svg>

              {/* Person Nodes */}
              {familyNodes.map(node => (
                <div
                  key={node.id}
                  className={cn(
                    "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-105",
                    selectedNode === node.id && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                >
                  <Card className="w-48 shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{node.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {node.relationship.replace(/\d+/, ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {node.dob && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Born: {node.dob}
                        </p>
                      )}
                      {node.pob && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Place: {node.pob}
                        </p>
                      )}
                      
                      {/* Document Status Dots */}
                      <div className="flex gap-2">
                        {Object.entries(node.docs).map(([docType, status]) => (
                          <div
                            key={docType}
                            className={cn(
                              "w-3 h-3 rounded-full border-2",
                              status === 'present' && "bg-green-500 border-green-600",
                              status === 'uploaded' && "bg-amber-500 border-amber-600", 
                              status === 'missing' && "bg-red-500 border-red-600"
                            )}
                            title={`${docType}: ${status}`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-lg border">
            <h4 className="text-sm font-medium mb-2">Document Status</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"></div>
                <span className="text-xs">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-600"></div>
                <span className="text-xs">Uploaded/Unverified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600"></div>
                <span className="text-xs">Missing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gaps Panel */}
        <div className="w-80 border-l bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Document Gaps</h2>
            <p className="text-sm text-muted-foreground">
              {documentGaps.length} missing documents found
            </p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-4">
              {documentGaps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-600 mb-2">All Documents Present!</h3>
                  <p className="text-sm text-muted-foreground">
                    No missing documents found in the family tree.
                  </p>
                </div>
              ) : (
                documentGaps.map((gap, index) => (
                  <Card key={`${gap.personId}-${gap.documentType}`} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm">{gap.personName}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">
                            {gap.documentType} certificate
                          </p>
                        </div>
                        <Badge 
                          variant={gap.priority === 'high' ? 'destructive' : 
                                  gap.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {gap.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        {getActionIcon(gap.suggestedAction)}
                        <span className="capitalize">{gap.suggestedAction.replace('_', ' ')}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => createTaskMutation.mutate(gap)}
                        disabled={createTaskMutation.isPending}
                        data-testid={`button-create-task-${gap.personId}-${gap.documentType}`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Task
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getDemoFamilyTree(canvasWidth: number, canvasHeight: number): PersonNode[] {
  return [
    // Applicant
    {
      id: 'applicant',
      name: 'ANNA KOWALSKI',
      given: 'ANNA',
      surname: 'KOWALSKI',
      dob: '1985-03-15',
      pob: 'Warsaw, Poland',
      relationship: 'applicant',
      generation: 0,
      docs: { birth: 'present', marriage: 'uploaded', death: 'present', passport: 'present' },
      x: canvasWidth / 2,
      y: canvasHeight - 100
    },
    // Parents
    {
      id: 'parent1',
      name: 'JAN KOWALSKI',
      given: 'JAN',
      surname: 'KOWALSKI',
      dob: '1955-07-22',
      pob: 'Krakow, Poland',
      relationship: 'parent1',
      generation: 1,
      docs: { birth: 'present', marriage: 'present', death: 'missing', passport: 'uploaded' },
      x: canvasWidth / 2 - 150,
      y: canvasHeight - 250
    },
    {
      id: 'parent2',
      name: 'MARIA NOWAK',
      given: 'MARIA',
      surname: 'NOWAK',
      dob: '1958-11-08',
      pob: 'Gdansk, Poland',
      relationship: 'parent2',
      generation: 1,
      docs: { birth: 'uploaded', marriage: 'present', death: 'missing', passport: 'missing' },
      x: canvasWidth / 2 + 150,
      y: canvasHeight - 250
    },
    // Grandparents
    {
      id: 'grandparent1',
      name: 'STEFAN KOWALSKI',
      given: 'STEFAN',
      surname: 'KOWALSKI',
      dob: '1925-04-10',
      pob: 'Lublin, Poland',
      relationship: 'grandparent1',
      generation: 2,
      docs: { birth: 'missing', marriage: 'missing', death: 'uploaded', passport: 'missing' },
      x: canvasWidth / 4,
      y: canvasHeight - 400
    },
    {
      id: 'grandparent2',
      name: 'KATARZYNA WIŚNIEWSKA',
      given: 'KATARZYNA',
      surname: 'WIŚNIEWSKA',
      dob: '1930-12-03',
      pob: 'Poznan, Poland',
      relationship: 'grandparent2',
      generation: 2,
      docs: { birth: 'missing', marriage: 'missing', death: 'missing', passport: 'missing' },
      x: canvasWidth * 3 / 4,
      y: canvasHeight - 400
    }
  ];
}

function getDummyDocStatus(): DocumentStatus {
  // Simulate random document status for demonstration
  const statuses: ('present' | 'uploaded' | 'missing')[] = ['present', 'uploaded', 'missing'];
  return {
    birth: statuses[Math.floor(Math.random() * 3)],
    marriage: statuses[Math.floor(Math.random() * 3)],
    death: statuses[Math.floor(Math.random() * 3)],
    passport: statuses[Math.floor(Math.random() * 3)]
  };
}

function getPriorityForDocument(generation: number, docType: string): 'high' | 'medium' | 'low' {
  if (generation === 0) return 'high'; // Applicant documents
  if (generation === 1 && docType === 'birth') return 'high'; // Parent birth certificates
  if (generation === 1) return 'medium'; // Other parent documents
  return 'low'; // Grandparent documents
}

function getSuggestedAction(docType: string, generation: number): 'translation' | 'usc_filing' | 'archive_search' | 'obtain_copy' {
  if (generation >= 2) return 'archive_search'; // Grandparents likely need archives
  if (docType === 'birth') return 'usc_filing'; // Birth certificates from USC
  if (docType === 'marriage') return 'usc_filing'; // Marriage certificates from USC
  return 'obtain_copy'; // Default action
}

function getTaskDescription(action: string): string {
  switch (action) {
    case 'translation': return 'Translate existing document to required language';
    case 'usc_filing': return 'Request certificate from USC (Civil Registry Office)';
    case 'archive_search': return 'Search historical archives for document';
    case 'obtain_copy': return 'Obtain certified copy of document';
    default: return 'Complete document acquisition process';
  }
}

function getDefaultDueDate(action: string): string {
  const days = {
    translation: 14,
    usc_filing: 30,
    archive_search: 45,
    obtain_copy: 21
  };
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (days[action as keyof typeof days] || 30));
  return dueDate.toISOString().split('T')[0];
}

function getActionIcon(action: string) {
  switch (action) {
    case 'translation': return <Globe className="h-3 w-3" />;
    case 'usc_filing': return <FileText className="h-3 w-3" />;
    case 'archive_search': return <Archive className="h-3 w-3" />;
    case 'obtain_copy': return <Search className="h-3 w-3" />;
    default: return <AlertTriangle className="h-3 w-3" />;
  }
}