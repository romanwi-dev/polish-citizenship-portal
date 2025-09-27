import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate, formatDateTime } from '@/i18n/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  User,
  FileText,
  TreePine,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  ClipboardCheck,
  Lock,
  Printer,
  Send,
  FormInput,
  Globe,
  Settings
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { hacSubmit, HAC_TYPES } from '@/lib/hac';
import { queryClient, apiRequest } from '@/lib/queryClient';
import CaseTree from './CaseTree';
import DocRadar from './DocRadar';
import DocTools from './DocTools';
import CaseSettings from './CaseSettings';

// OBY Draft Card Component
function OBYDraftCard({ caseId }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Fetch OBY draft data
  const { data: draftData, isLoading, error } = useQuery({
    queryKey: ['/api/forms/oby/draft', caseId],
    enabled: !!caseId
  });
  
  // HAC submission mutation
  const hacSubmission = useMutation({
    mutationFn: async (draft) => {
      await hacSubmit(caseId, HAC_TYPES.FORM_OBY_DRAFT, draft);
      return draft;
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('messages.sentToHac')
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/forms/oby/draft', caseId] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: `${t('messages.errorGeneric')}: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Calculate missing required fields
  const getMissingRequiredCount = () => {
    if (!draftData?.data?.metadata?.requiredFields || !draftData?.data?.mappedFields) {
      return 0;
    }
    
    const requiredFields = draftData.data.metadata.requiredFields;
    const mappedFields = draftData.data.mappedFields;
    
    return requiredFields.filter(fieldCode => 
      !mappedFields[fieldCode] || mappedFields[fieldCode].toString().trim() === ''
    ).length;
  };
  
  const handleSendToHAC = () => {
    if (draftData?.data) {
      hacSubmission.mutate(draftData.data);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FormInput className="h-5 w-5" />
            {t('caseDetail.obyFormDraft')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">{t('caseDetail.loadingDraft')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FormInput className="h-5 w-5" />
            {t('caseDetail.obyFormDraft')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{t('caseDetail.failedToLoadDraft')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const draft = draftData?.data;
  const missingRequired = getMissingRequiredCount();
  const totalFields = draft?.fieldCount || 0;
  const completedFields = draft?.completedFields || 0;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FormInput className="h-5 w-5" />
          OBY Form Draft
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{completedFields}</div>
            <div className="text-sm text-muted-foreground">{t('caseDetail.completedFields')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{totalFields}</div>
            <div className="text-sm text-muted-foreground">{t('caseDetail.totalFields')}</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${missingRequired > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {missingRequired}
            </div>
            <div className="text-sm text-muted-foreground">{t('caseDetail.missingRequired')}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('caseDetail.completionProgress')}</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        
        {draft?.status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('caseDetail.status')}:</span>
            <Badge variant="outline">{draft.status}</Badge>
          </div>
        )}
        
        {draft?.lastUpdated && (
          <div className="text-xs text-muted-foreground">
            {t('caseDetail.lastUpdatedLabel')}: {formatDate(draft.lastUpdated)}
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSendToHAC}
            disabled={hacSubmission.isPending || !draft}
            className="flex items-center gap-2"
            data-testid="button-send-to-hac"
          >
            <Send className="h-4 w-4" />
            {hacSubmission.isPending ? t('caseDetail.sending') : t('caseDetail.sendToHAC')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CaseDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const caseId = params.id;
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch actual case data including language preference
  const { data: caseData, isLoading: caseLoading, error: caseError } = useQuery({
    queryKey: ['/api/admin/case', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/case/${caseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case data');
      }
      const result = await response.json();
      return result.case;
    },
    enabled: !!caseId
  });
  
  // Language preference update mutation
  const languageUpdateMutation = useMutation({
    mutationFn: async (preferredLanguage: string) => {
      const response = await apiRequest('PATCH', `/api/cases/${caseId}`, { preferredLanguage });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Language preference updated successfully'
      });
      // Invalidate and refetch case data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/case', caseId] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: `Failed to update language preference: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  const handleLanguageChange = (newLanguage: string) => {
    if (newLanguage !== caseData?.preferredLanguage) {
      languageUpdateMutation.mutate(newLanguage);
    }
  };
  
  // Loading and error states
  if (caseLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading case details...</div>
          <div className="text-muted-foreground">Please wait while we fetch the case information.</div>
        </div>
      </div>
    );
  }
  
  if (caseError || !caseData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium mb-2 text-destructive">Error Loading Case</div>
          <div className="text-muted-foreground mb-4">
            {caseError?.message || 'Case not found or failed to load case details.'}
          </div>
          <Link href="/admin/cases">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'INTAKE': { color: 'bg-blue-500', label: 'Intake' },
      'USC_IN_FLIGHT': { color: 'bg-yellow-500', label: 'USC In Flight' },
      'OBY_DRAFTING': { color: 'bg-purple-500', label: 'OBY Drafting' },
      'USC_READY': { color: 'bg-green-500', label: 'USC Ready' },
      'OBY_SUBMITTABLE': { color: 'bg-indigo-500', label: 'OBY Submittable' },
      'OBY_SUBMITTED': { color: 'bg-orange-500', label: 'OBY Submitted' },
      'DECISION_RECEIVED': { color: 'bg-emerald-500', label: 'Decision Received' }
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-gray-500', label: 'Unknown' };
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    if (difficulty >= 7) return <Badge variant="destructive">{difficulty}/10</Badge>;
    if (difficulty >= 4) return <Badge className="bg-yellow-500 text-white">{difficulty}/10</Badge>;
    return <Badge className="bg-green-500 text-white">{difficulty}/10</Badge>;
  };

  const handlePrintCaseSummary = () => {
    // Add print-specific classes to hide non-essential elements
    document.body.classList.add('printing-case-summary');
    
    // Open print dialog
    window.print();
    
    // Remove print classes after printing
    setTimeout(() => {
      document.body.classList.remove('printing-case-summary');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-6 print-case-summary" data-testid="case-detail">
      {/* Print Header - Only visible when printing */}
      <div className="print-only print-header mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Case Summary Report</h1>
          <p className="text-lg text-black">Case #{caseId} - {caseData.client.name}</p>
          <p className="text-sm text-gray-600">Generated on {formatDate(new Date())}</p>
        </div>
        <hr className="border-black mt-4" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 no-print">
        <Link href="/admin/cases">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Case #{caseId}</h1>
          <p className="text-muted-foreground">{caseData.client.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrintCaseSummary}
            data-testid="button-export-pdf"
            className="no-print"
          >
            <Printer className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            asChild
            data-testid="button-hac-board"
            className="no-print"
          >
            <Link href="/admin/hac">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              HAC Board
            </Link>
          </Button>
          {caseData.lockedBy && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs" data-testid="badge-locked">
              <Lock className="h-3 w-3" />
              Locked by {caseData.lockedBy}
            </Badge>
          )}
          {getStatusBadge(caseData.status)}
          {getDifficultyBadge(caseData.difficulty)}
        </div>
      </div>

      {/* Case Settings */}
      <div className="mb-6">
        <CaseSettings caseId={caseId} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Client</span>
            </div>
            <p className="font-medium">{caseData.client.name}</p>
            <p className="text-sm text-muted-foreground">{caseData.client.email}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Documents</span>
            </div>
            <p className="font-medium">
              {caseData.documents.received}/{caseData.documents.expected}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(caseData.documents.received / caseData.documents.expected) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Progress</span>
            </div>
            <p className="font-medium">{caseData.progress}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${caseData.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Created</span>
            </div>
            <p className="font-medium">{formatDate(caseData.createdAt)}</p>
            <p className="text-sm text-muted-foreground">
              Updated {formatDate(caseData.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Print-Only Case Overview */}
      <div className="print-only mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black mb-4">Client Information</h2>
            <div className="space-y-2">
              <div><strong>Name:</strong> {caseData.client.name}</div>
              <div><strong>Email:</strong> {caseData.client.email}</div>
              <div><strong>Phone:</strong> {caseData.client.phone}</div>
              <div><strong>Case ID:</strong> {caseId}</div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black mb-4">Case Status</h2>
            <div className="space-y-2">
              <div><strong>Status:</strong> {caseData.status.replace('_', ' ')}</div>
              <div><strong>Difficulty:</strong> {caseData.difficulty}/10</div>
              <div><strong>Progress:</strong> {caseData.progress}%</div>
              <div><strong>Created:</strong> {formatDate(caseData.createdAt)}</div>
              <div><strong>Updated:</strong> {formatDate(caseData.updatedAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-4">Document Status</h2>
          <div className="space-y-2">
            <div><strong>Documents Received:</strong> {caseData.documents.received}</div>
            <div><strong>Documents Expected:</strong> {caseData.documents.expected}</div>
            <div><strong>Completion:</strong> {Math.round((caseData.documents.received / caseData.documents.expected) * 100)}%</div>
          </div>
        </div>
        
        {caseData.lineage && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black mb-4">Lineage Information</h2>
            <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
              {caseData.lineage}
            </div>
          </div>
        )}
        
        <div className="page-break"></div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 no-print">
        <TabsList className="grid w-full grid-cols-5 no-print">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2"
            data-testid="tab-overview"
          >
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="flex items-center gap-2"
            data-testid="tab-documents"
          >
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger 
            value="tree" 
            className="flex items-center gap-2"
            data-testid="tab-tree"
          >
            <TreePine className="h-4 w-4" />
            Tree
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="flex items-center gap-2"
            data-testid="tab-messages"
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="timeline" 
            className="flex items-center gap-2"
            data-testid="tab-timeline"
          >
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Client Information</h3>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {caseData.client.name}</div>
                    <div><strong>Email:</strong> {caseData.client.email}</div>
                    <div><strong>Phone:</strong> {caseData.client.phone}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Case Details</h3>
                  <div className="space-y-2">
                    <div><strong>Status:</strong> {getStatusBadge(caseData.status)}</div>
                    <div><strong>Difficulty:</strong> {getDifficultyBadge(caseData.difficulty)}</div>
                    <div><strong>Progress:</strong> {caseData.progress}%</div>
                  </div>
                </div>
              </div>
              
              {caseData.lineage && (
                <div>
                  <h3 className="font-medium mb-2">Current Lineage</h3>
                  <div className="p-3 bg-muted rounded-md">
                    {caseData.lineage}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Language Preference Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="preferred-language" className="text-sm font-medium">
                    Preferred Language
                  </Label>
                  <Select 
                    value={caseData.preferredLanguage || 'en'} 
                    onValueChange={handleLanguageChange}
                    disabled={languageUpdateMutation.isPending}
                  >
                    <SelectTrigger className="mt-2" data-testid="select-preferred-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pl">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇵🇱</span>
                          <span>Polish</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    This affects all client communications and portal interface for this case.
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Current Settings</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{caseData.preferredLanguage === 'pl' ? '🇵🇱' : '🇺🇸'}</span>
                      <span className="text-sm">
                        {caseData.preferredLanguage === 'pl' ? 'Polish' : 'English'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {caseData.preferredLanguage || 'en'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      All client emails and portal content will be in {caseData.preferredLanguage === 'pl' ? 'Polish' : 'English'}
                    </div>
                  </div>
                </div>
              </div>
              
              {languageUpdateMutation.isPending && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Settings className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Updating language preference...</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* OBY Draft Card */}
          <OBYDraftCard caseId={caseId} />
          
          {/* Document Tools */}
          <DocTools caseId={caseId} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Document management functionality would be implemented here.
              </p>
              <div className="mt-4">
                <p><strong>Received:</strong> {caseData.documents.received} documents</p>
                <p><strong>Expected:</strong> {caseData.documents.expected} documents</p>
                <p><strong>Completion:</strong> {Math.round((caseData.documents.received / caseData.documents.expected) * 100)}%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tree Tab - This is where we mount the CaseTree component */}
        <TabsContent value="tree" className="space-y-6">
          <CaseTree caseId={caseId} />
          <DocRadar caseId={caseId} />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages & Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Message history and communication logs would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">Case Created</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(caseData.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">Status Updated to USC In Flight</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(caseData.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}