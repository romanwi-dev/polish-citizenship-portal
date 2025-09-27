import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  User
} from 'lucide-react';

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

export const TypeFormAllResponses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<EnhancedResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all TypeForm responses with client details
  const { data, isLoading, refetch } = useQuery<{success: boolean; data: AllResponsesData}>({
    queryKey: ['/api/typeform/all-responses'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
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
    a.download = `polish-citizenship-test-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredResponses = data?.data?.responses?.filter(response => {
    const searchLower = searchTerm.toLowerCase();
    return (
      response.clientDetails.fullName.toLowerCase().includes(searchLower) ||
      response.clientDetails.email.toLowerCase().includes(searchLower) ||
      response.eligibilityAnalysis.eligibilityLevel.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-blue-900">All Test Responses</h2>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-blue-900">All Test Responses</h2>
          <p className="text-gray-600 mt-1">Complete list of all client submissions with contact details</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            size="sm"
            disabled={!data?.data?.responses?.length}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">{data?.data?.analytics.totalResponses || 0}</div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">{data?.data?.analytics.highEligibility || 0}</div>
            <div className="text-sm text-gray-600">High Eligibility</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-900">{data?.data?.analytics.mediumEligibility || 0}</div>
            <div className="text-sm text-gray-600">Medium Eligibility</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-900">{(data?.data?.analytics.lowEligibility || 0) + (data?.data?.analytics.veryLowEligibility || 0)}</div>
            <div className="text-sm text-gray-600">Low Eligibility</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name, email, or eligibility level..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Responses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Client Responses ({filteredResponses.length})</CardTitle>
          <CardDescription>All test submissions with client contact information</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredResponses.length > 0 ? (
            <div className="space-y-4">
              {filteredResponses.map((response) => (
                <div key={response.response_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            {response.clientDetails.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {response.clientDetails.email}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResponse(response)}
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
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No responses found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search criteria' : 'Responses will appear here once users complete your test'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Response Details
                <Button size="sm" variant="outline" onClick={() => setSelectedResponse(null)}>
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
};