import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Upload, 
  Plus, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Loader2,
  Printer,
  Lightbulb,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { hacSubmit, HAC_TYPES } from '@/lib/hac';
import { apiRequest, apiRequestForm, queryClient } from '@/lib/queryClient';
import '@/styles/print-docRadar.css';

export default function DocRadar({ caseId }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [selectedPersonDoc, setSelectedPersonDoc] = useState(null);

  // Fetch document matrix data
  const { data: matrixData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/cases', caseId, 'tree', 'doc-matrix'],
    enabled: !!caseId
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ personId, docType, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('personId', personId);
      formData.append('docType', docType);
      
      // Use the JWT Bearer-aware FormData upload helper
      const response = await apiRequestForm(
        'POST',
        `/api/cases/${caseId}/tree/doc-upload`,
        formData
      );

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('docRadar.documentUploaded')
      });
      // Invalidate and refetch the document matrix
      queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'tree', 'doc-matrix'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Suggest next steps mutation
  const suggestNextStepsMutation = useMutation({
    mutationFn: async () => {
      const tasks = generateNextStepTasks(matrixData);
      return await hacSubmit(caseId, HAC_TYPES.TASK_SUGGEST, { tasks });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('docRadar.suggestionsSubmitted')
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Group persons by generation
  const groupedPersons = useMemo(() => {
    if (!matrixData?.success || !matrixData.persons) {
      return { applicant: [], parents: [], grandparents: [] };
    }

    const groups = { applicant: [], parents: [], grandparents: [] };
    
    matrixData.persons.forEach(person => {
      switch (person.generation) {
        case 0:
          groups.applicant.push(person);
          break;
        case 1:
          groups.parents.push(person);
          break;
        case 2:
          groups.grandparents.push(person);
          break;
        default:
          // Handle other generations as relatives
          groups.grandparents.push(person);
      }
    });

    return groups;
  }, [matrixData]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && selectedPersonDoc) {
      const { personId, docType } = selectedPersonDoc;
      uploadMutation.mutate({ personId, docType, file });
      setSelectedPersonDoc(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file picker
  const triggerFilePicker = (personId, docType) => {
    setSelectedPersonDoc({ personId, docType });
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // Get chip style based on document status
  const getChipStyle = (status) => {
    const baseStyle = "chip inline-flex items-center justify-center text-xs font-medium rounded-md px-2 py-1 mr-1 mb-1 min-w-[80px]";
    
    switch (status) {
      case 'have':
        return `${baseStyle} have bg-green-100 text-green-800 border border-green-200`;
      case 'in_progress':
        return `${baseStyle} progress bg-yellow-100 text-yellow-800 border border-yellow-200 bg-gradient-to-r from-yellow-100 to-yellow-50 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(251,191,36,0.1)_4px,rgba(251,191,36,0.1)_8px)]`;
      case 'needed':
        return `${baseStyle} needed bg-gray-50 text-gray-600 border border-gray-300 border-dashed`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-500`;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'have':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'needed':
        return <AlertTriangle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  // Generate next step tasks
  const generateNextStepTasks = (matrixData) => {
    if (!matrixData?.persons) return [];

    const tasks = [];
    
    matrixData.persons.forEach(person => {
      const neededDocs = Object.entries(person.documents)
        .filter(([_, doc]) => doc.status === 'needed' && doc.required)
        .map(([type, doc]) => ({ type, label: doc.label }));

      if (neededDocs.length > 0) {
        tasks.push({
          type: 'document_collection',
          priority: 'high',
          person: person.name,
          personId: person.personId,
          documents: neededDocs,
          description: `Collect required documents for ${person.name}: ${neededDocs.map(d => d.label).join(', ')}`
        });
      }
    });

    return tasks;
  };

  // Handle print/PDF export
  const handlePrintPDF = () => {
    window.print();
  };

  // Render person card
  const renderPersonCard = (person) => (
    <Card key={person.personId} className="doc-person mb-4" data-testid={`card-person-${person.personId}`}>
      <CardHeader className="person-header pb-3">
        <CardTitle className="person-name flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span data-testid={`text-person-name-${person.personId}`}>{person.name}</span>
          {person.generation === 0 && (
            <Badge variant="outline" className="text-xs">
              {t('docRadar.applicant')}
            </Badge>
          )}
        </CardTitle>
        <div className="person-role text-xs text-muted-foreground">
          <span data-testid={`text-relation-${person.personId}`}>{person.relation}</span>
          {person.completionStats && (
            <span className="ml-2">
              {person.completionStats.have}/{person.completionStats.total} {t('docRadar.complete')}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="doc-chiprow flex flex-wrap gap-1">
          {Object.entries(person.documents || {}).map(([docType, docData]) => (
            <TooltipProvider key={docType}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative group">
                    <button
                      className={getChipStyle(docData.status)}
                      onClick={() => triggerFilePicker(person.personId, docType)}
                      disabled={uploadMutation.isPending}
                      data-testid={`chip-${docType}-${person.personId}`}
                    >
                      {getStatusIcon(docData.status)}
                      <span className="truncate max-w-[60px]">
                        {docData.label.split(' ')[0]}
                      </span>
                      <Plus className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="font-medium">{docData.label}</div>
                    <div className="text-xs mt-1">
                      Status: <span className="capitalize">{docData.status}</span>
                    </div>
                    {docData.notes && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        {docData.notes}
                      </div>
                    )}
                    {docData.files?.length > 0 && (
                      <div className="text-xs mt-1">
                        Files: {docData.files.length}
                      </div>
                    )}
                    <div className="text-xs mt-1 text-blue-600">
                      Click to upload document
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Render legend
  const renderLegend = () => (
    <Card className="mb-6 doc-radar-legend doc-legend">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="w-4 h-4" />
          {t('docRadar.legend')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className={`legend-chip ${getChipStyle('have')}`}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Have
            </div>
            <span className="legend-text text-xs text-muted-foreground">{t('docRadar.documentAvailable')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`legend-chip ${getChipStyle('in_progress')}`}>
              <Clock className="w-3 h-3 mr-1" />
              In Progress
            </div>
            <span className="legend-text text-xs text-muted-foreground">{t('docRadar.documentOrdered')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`legend-chip ${getChipStyle('needed')}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              Needed
            </div>
            <span className="legend-text text-xs text-muted-foreground">{t('docRadar.documentRequired')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>{t('docRadar.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <span>{t('docRadar.loadError')}</span>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-retry">
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="doc-radar-container doc-radar-print p-4">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
        data-testid="input-file-upload"
      />

      {/* Header with controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="doc-radar-title text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('docRadar.title')}
          </h2>
          <p className="doc-radar-sub text-sm text-muted-foreground mt-1">
            {t('docRadar.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => suggestNextStepsMutation.mutate()}
            disabled={suggestNextStepsMutation.isPending}
            variant="outline"
            size="sm"
            data-testid="button-suggest-next-steps"
          >
            {suggestNextStepsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2" />
            )}
            {t('docRadar.suggestNextSteps')}
          </Button>
          <button 
            className="btn btn-ghost non-print" 
            onClick={() => window.print()}
            data-testid="button-export-pdf"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {matrixData?.summary && (
        <Card className="doc-summary mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-summary-have">
                  {matrixData.summary.have}
                </div>
                <div className="text-xs text-muted-foreground">{t('docRadar.documentsHave')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600" data-testid="text-summary-in-progress">
                  {matrixData.summary.inProgress}
                </div>
                <div className="text-xs text-muted-foreground">{t('docRadar.documentsInProgress')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600" data-testid="text-summary-needed">
                  {matrixData.summary.needed}
                </div>
                <div className="text-xs text-muted-foreground">{t('docRadar.documentsNeeded')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-summary-completion">
                  {matrixData.summary.completionPercentage}%
                </div>
                <div className="text-xs text-muted-foreground">{t('docRadar.completed')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      {renderLegend()}

      {/* Document matrix grid */}
      <div className="doc-radar-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Applicant column */}
        <div>
          <h3 className="text-md font-medium mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('docRadar.applicant')}
            {groupedPersons.applicant.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {groupedPersons.applicant.length}
              </Badge>
            )}
          </h3>
          {groupedPersons.applicant.map(renderPersonCard)}
        </div>

        {/* Parents column */}
        <div>
          <h3 className="text-md font-medium mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('docRadar.parents')}
            {groupedPersons.parents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {groupedPersons.parents.length}
              </Badge>
            )}
          </h3>
          {groupedPersons.parents.map(renderPersonCard)}
        </div>

        {/* Grandparents column */}
        <div>
          <h3 className="text-md font-medium mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('docRadar.grandparents')}
            {groupedPersons.grandparents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {groupedPersons.grandparents.length}
              </Badge>
            )}
          </h3>
          {groupedPersons.grandparents.map(renderPersonCard)}
        </div>
      </div>

      {/* No data state */}
      {(!matrixData?.persons || matrixData.persons.length === 0) && (
        <Card className="p-8">
          <div className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('docRadar.noData')}</h3>
            <p className="text-muted-foreground">
              {t('docRadar.noDataDescription')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}