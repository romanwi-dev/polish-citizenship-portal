import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Users, 
  ArrowRight,
  Info,
  RefreshCw,
  Loader2,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import i18n from '@/i18n';

export default function PassportTracker() {
  const [caseId, setCaseId] = useState('');
  const [searchedCaseId, setSearchedCaseId] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  // Query to fetch client tracker data
  const { 
    data: clientData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['client-tracker', searchedCaseId],
    queryFn: async () => {
      if (!searchedCaseId) return null;
      
      const response = await fetch(`/api/client/${searchedCaseId}/tracker`);
      if (!response.ok) {
        throw new Error('Failed to fetch case information');
      }
      return response.json();
    },
    enabled: !!searchedCaseId
  });
  
  // Effect to change language when case data is loaded
  useEffect(() => {
    if (clientData?.success && clientData.client?.preferredLanguage) {
      const caseLanguage = clientData.client.preferredLanguage;
      if (caseLanguage !== i18n.language) {
        i18n.changeLanguage(caseLanguage);
        console.log(`🌐 Language switched to ${caseLanguage} for case ${clientData.client.caseId}`);
      }
    }
  }, [clientData]);

  const handleSearch = () => {
    if (!caseId.trim()) {
      toast({
        title: "Case ID Required",
        description: "Please enter a valid case ID to track your application.",
        variant: "destructive"
      });
      return;
    }

    // Validate case ID format (alphanumeric, hyphens, underscores only)
    const caseIdRegex = /^[A-Za-z0-9_-]+$/;
    if (!caseIdRegex.test(caseId)) {
      toast({
        title: "Invalid Case ID",
        description: "Case ID can only contain letters, numbers, hyphens, and underscores.",
        variant: "destructive"
      });
      return;
    }

    setSearchedCaseId(caseId);
  };

  const handleRefresh = () => {
    if (searchedCaseId) {
      refetch();
      toast({
        title: "Refreshing",
        description: "Getting the latest case information..."
      });
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'INTAKE': 'bg-blue-500',
      'USC_IN_FLIGHT': 'bg-yellow-500',
      'OBY_DRAFTING': 'bg-purple-500',
      'USC_READY': 'bg-orange-500',
      'OBY_SUBMITTABLE': 'bg-indigo-500',
      'OBY_SUBMITTED': 'bg-amber-500',
      'DECISION_RECEIVED': 'bg-green-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    if (status === 'DECISION_RECEIVED') return <CheckCircle className="h-4 w-4" />;
    if (status.includes('SUBMITTED')) return <FileText className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background p-6" data-testid="passport-tracker">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Polish Citizenship Case Tracker</h1>
          <p className="text-muted-foreground">
            Track your Polish citizenship application progress and get realistic timeline estimates
          </p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Case
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="case-id">Case ID</Label>
                <Input
                  id="case-id"
                  placeholder="Enter your case ID (e.g., C-1758095891552-ORKY)"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-case-id"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  data-testid="button-search-case"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {error.message || 'Failed to fetch case information'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Information */}
        {clientData?.success && clientData.client && (
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Status
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(clientData.client.status)} text-white`}>
                      {getStatusIcon(clientData.client.status)}
                      <span className="ml-1">{clientData.client.status.replace('_', ' ')}</span>
                    </Badge>
                    <div>
                      <p className="font-medium">Case #{clientData.client.caseId}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(clientData.client.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lineage Badge */}
                {clientData.client.lineage && (
                  <div className="p-3 bg-muted rounded-md" data-testid="lineage-display">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Lineage: {clientData.client.lineage.replace(/\s\([^)]*\)/g, '').replace(' → ', ' → ')}</span>
                    </div>
                  </div>
                )}

                {/* Current Stage Information */}
                <div className="p-4 border rounded-md space-y-3" data-testid="stage-info">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Current Stage</span>
                  </div>
                  <p className="text-sm">{clientData.client.stage.stageMsg}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Current ETA:</span>
                      <p className="font-semibold">{clientData.client.stage.eta}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Overall Timeline:</span>
                      <p className="font-semibold">{clientData.client.stage.overallRange}</p>
                    </div>
                  </div>
                  
                  {clientData.client.stage.note && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-blue-700">{clientData.client.stage.note}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm font-bold">{clientData.client.progress.percentage}%</span>
                  </div>
                  <Progress value={clientData.client.progress.percentage} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {clientData.client.progress.completedSteps} of {clientData.client.progress.totalSteps} steps completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Document Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Documents</span>
                    <span className="text-sm font-bold">{clientData.client.documents.percentage}%</span>
                  </div>
                  <Progress value={clientData.client.documents.percentage} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {clientData.client.documents.received} of {clientData.client.documents.expected} documents received
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Next Actions */}
            {clientData.client.nextActions && clientData.client.nextActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Next Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {clientData.client.nextActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Important Notice */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-amber-800">Important Timing Information</h3>
                    <p className="text-sm text-amber-700">
                      All timing estimates are based on historical averages and current government processing times. 
                      Actual timelines may vary significantly based on case complexity, archive availability, and 
                      government workload. We provide honest estimates rather than overly optimistic promises.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo Cases */}
        {!searchedCaseId && (
          <Card>
            <CardHeader>
              <CardTitle>Try Demo Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['TEST-123', 'C-1758095891552-ORKY', 'USC-DEMO'].map((demoId) => (
                  <Button
                    key={demoId}
                    variant="outline"
                    onClick={() => {
                      setCaseId(demoId);
                      setSearchedCaseId(demoId);
                    }}
                    data-testid={`button-demo-${demoId}`}
                  >
                    Try {demoId}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}