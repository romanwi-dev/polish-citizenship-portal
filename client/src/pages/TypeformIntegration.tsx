import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Search,
  Download,
  Eye,
  Calendar,
  Mail,
  User,
  Plus,
  BarChart3,
  Filter,
  Settings,
  ExternalLink,
  UserPlus,
  FileText,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ClientDetails {
  fullName: string;
  email: string;
  submissionDate: string;
  responseId: string;
}

interface EligibilityAnalysis {
  eligibilityScore: number;
  eligibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
  recommendations: string[];
  documentRequirements: string[];
  estimatedTimeframe: string;
}

interface EnhancedResponse {
  response_id: string;
  submitted_at: string;
  clientDetails: ClientDetails;
  eligibilityAnalysis: EligibilityAnalysis;
  answers?: Array<{
    field: { id: string; type: string; ref?: string };
    type: string;
    text?: string;
    email?: string;
    choice?: { label?: string };
  }>;
}

interface AllResponsesData {
  form: {
    id: string;
    title: string;
  } | null;
  responses: EnhancedResponse[];
  analytics: {
    totalResponses: number;
    highEligibility: number;
    mediumEligibility: number;
    lowEligibility: number;
    veryLowEligibility: number;
  };
}

const EligibilityBadge: React.FC<{ level: string }> = ({ level }) => {
  const config = {
    HIGH: { color: 'bg-green-500/20 text-green-800 border-green-300', icon: CheckCircle },
    MEDIUM: { color: 'bg-yellow-500/20 text-yellow-800 border-yellow-300', icon: AlertCircle },
    LOW: { color: 'bg-orange-500/20 text-orange-800 border-orange-300', icon: AlertCircle },
    VERY_LOW: { color: 'bg-red-500/20 text-red-800 border-red-300', icon: XCircle },
  };

  const { color, icon: Icon } = config[level as keyof typeof config] || config.VERY_LOW;

  return (
    <Badge className={`${color} font-bold`}>
      <Icon className="w-3 h-3 mr-1" />
      {level.replace('_', ' ')}
    </Badge>
  );
};

export default function TypeformIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<EnhancedResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');
  const [processingLeads, setProcessingLeads] = useState(false);
  const [minEligibilityLevel, setMinEligibilityLevel] = useState<string>('MEDIUM');

  // Fetch all TypeForm responses with client details
  const { data, isLoading, refetch } = useQuery<{success: boolean; data: AllResponsesData}>({
    queryKey: ['/api/typeform/all-responses'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create prospect case mutation
  const createProspectCaseMutation = useMutation({
    mutationFn: async (data: { responseId: string; leadId?: string }) => {
      return apiRequest('POST', '/api/typeform/create-prospect-case', data);
    },
    onSuccess: (result) => {
      toast({
        title: "Prospect Case Created",
        description: `Case ${result.data.caseId} created for ${result.data.clientName}`,
      });
      // Optionally refresh data
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create prospect case",
        variant: "destructive"
      });
    }
  });

  // Auto-process leads mutation
  const autoProcessLeadsMutation = useMutation({
    mutationFn: async (data: { minEligibilityLevel: string; limit: number }) => {
      return apiRequest('POST', '/api/typeform/auto-process-leads', data);
    },
    onSuccess: (result) => {
      toast({
        title: "Leads Processed",
        description: `Created ${result.created} prospect cases from ${result.processed} qualified leads`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process leads",
        variant: "destructive"
      });
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateProspectCase = (responseId: string) => {
    createProspectCaseMutation.mutate({ responseId });
  };

  const handleAutoProcessLeads = () => {
    setProcessingLeads(true);
    autoProcessLeadsMutation.mutate({ 
      minEligibilityLevel, 
      limit: 100 
    });
    setProcessingLeads(false);
  };

  const handleExportCSV = () => {
    if (!data?.data?.responses) return;

    const csvHeader = 'Full Name,Email,Submission Date,Eligibility Level,Score,Timeframe,Recommendations\n';
    const csvData = data.data.responses.map(response => {
      const { clientDetails, eligibilityAnalysis } = response;
      return [
        `"${clientDetails.fullName}"`,
        `"${clientDetails.email}"`,
        `"${clientDetails.submissionDate}"`,
        `"${eligibilityAnalysis.eligibilityLevel}"`,
        eligibilityAnalysis.eligibilityScore,
        `"${eligibilityAnalysis.estimatedTimeframe}"`,
        `"${eligibilityAnalysis.recommendations.join('; ')}"`,
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typeform-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter responses
  const filteredResponses = data?.data?.responses?.filter(response => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      response.clientDetails.fullName.toLowerCase().includes(searchLower) ||
      response.clientDetails.email.toLowerCase().includes(searchLower) ||
      response.eligibilityAnalysis.eligibilityLevel.toLowerCase().includes(searchLower)
    );
    
    const matchesFilter = eligibilityFilter === 'all' || 
      response.eligibilityAnalysis.eligibilityLevel === eligibilityFilter;
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Calculate qualified leads for processing
  const qualifiedLeads = data?.data?.responses?.filter(response => {
    const level = response.eligibilityAnalysis.eligibilityLevel;
    if (minEligibilityLevel === 'HIGH') {
      return level === 'HIGH';
    } else if (minEligibilityLevel === 'MEDIUM') {
      return level === 'HIGH' || level === 'MEDIUM';
    }
    return true; // LOW includes all levels
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-blue-900">Typeform Integration</h2>
          <Button disabled variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 min-h-screen" data-testid="typeform-integration">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 dark:text-white" data-testid="title-typeform">
            Typeform Integration
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Pull leads and auto-create prospect cases from Typeform responses
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            size="sm"
            disabled={!data?.data?.responses?.length}
            className="glass-button"
            data-testid="button-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline" 
            size="sm"
            className="glass-button"
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-white">
                  {data?.data?.analytics.totalResponses || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Responses</div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-400">
                  {data?.data?.analytics.highEligibility || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">High Eligibility</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-400">
                  {data?.data?.analytics.mediumEligibility || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Medium Eligibility</div>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-400">
                  {(data?.data?.analytics.lowEligibility || 0) + (data?.data?.analytics.veryLowEligibility || 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Low/Very Low</div>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Processing Controls */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white">
            <Zap className="w-5 h-5" />
            Auto-Process Leads
          </CardTitle>
          <CardDescription>
            Automatically create prospect cases for qualified leads based on eligibility criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Minimum Eligibility:</label>
              <Select value={minEligibilityLevel} onValueChange={setMinEligibilityLevel}>
                <SelectTrigger className="w-32" data-testid="select-min-eligibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High Only</SelectItem>
                  <SelectItem value="MEDIUM">Medium & High</SelectItem>
                  <SelectItem value="LOW">All Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Will process {qualifiedLeads.length} qualified leads
            </div>
            
            <Button 
              onClick={handleAutoProcessLeads}
              disabled={processingLeads || autoProcessLeadsMutation.isPending || qualifiedLeads.length === 0}
              className="glass-button bg-green-600 hover:bg-green-700"
              data-testid="button-auto-process"
            >
              {autoProcessLeadsMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Auto-Process ({qualifiedLeads.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, or eligibility level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-input"
            data-testid="input-search"
          />
        </div>
        
        <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
          <SelectTrigger className="w-48 glass-input" data-testid="select-filter">
            <SelectValue placeholder="Filter by eligibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="HIGH">High Eligibility</SelectItem>
            <SelectItem value="MEDIUM">Medium Eligibility</SelectItem>
            <SelectItem value="LOW">Low Eligibility</SelectItem>
            <SelectItem value="VERY_LOW">Very Low Eligibility</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Responses List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900 dark:text-white">
            Lead Responses ({filteredResponses.length})
          </CardTitle>
          <CardDescription>
            Typeform submissions with eligibility analysis and prospect case actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResponses.length > 0 ? (
            <div className="space-y-4">
              {filteredResponses.map((response) => (
                <div 
                  key={response.response_id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`response-${response.response_id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {response.clientDetails.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {response.clientDetails.email}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {response.clientDetails.submissionDate}
                        </div>
                        <div>
                          Score: {response.eligibilityAnalysis.eligibilityScore}%
                        </div>
                        <div>
                          Timeframe: {response.eligibilityAnalysis.estimatedTimeframe}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <EligibilityBadge level={response.eligibilityAnalysis.eligibilityLevel} />
                      
                      {/* Only show prospect case button for HIGH and MEDIUM eligibility */}
                      {(response.eligibilityAnalysis.eligibilityLevel === 'HIGH' || 
                        response.eligibilityAnalysis.eligibilityLevel === 'MEDIUM') && (
                        <Button
                          size="sm"
                          onClick={() => handleCreateProspectCase(response.response_id)}
                          disabled={createProspectCaseMutation.isPending}
                          className="glass-button bg-blue-600 hover:bg-blue-700"
                          data-testid={`button-create-case-${response.response_id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Case
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResponse(response)}
                        className="glass-button"
                        data-testid={`button-details-${response.response_id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No responses found</p>
              <p className="text-sm">
                {searchTerm || eligibilityFilter !== 'all' 
                  ? 'Try adjusting your search criteria' 
                  : 'Responses will appear here once users complete your test'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-blue-900 dark:text-white">
                Response Details
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedResponse(null)}
                  data-testid="button-close-modal"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-sm text-gray-500">Full Name:</span>
                      <p className="font-medium">{selectedResponse.clientDetails.fullName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{selectedResponse.clientDetails.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Submission Date:</span>
                      <p className="font-medium">{selectedResponse.clientDetails.submissionDate}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Response ID:</span>
                      <p className="font-medium text-xs">{selectedResponse.clientDetails.responseId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Eligibility Analysis</h3>
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <EligibilityBadge level={selectedResponse.eligibilityAnalysis.eligibilityLevel} />
                      <span className="font-medium">{selectedResponse.eligibilityAnalysis.eligibilityScore}% Score</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Estimated timeframe: {selectedResponse.eligibilityAnalysis.estimatedTimeframe}
                    </p>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Recommendations:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {selectedResponse.eligibilityAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Document Requirements:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {selectedResponse.eligibilityAnalysis.documentRequirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}