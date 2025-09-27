import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Target
} from 'lucide-react';

interface TypeFormAnalytics {
  totalResponses: number;
  highEligibility: number;
  mediumEligibility: number;
  lowEligibility: number;
  veryLowEligibility: number;
  conversionRate: number;
  avgScore: number;
  recentSubmissions: Array<{
    id: string;
    submitted_at: string;
    eligibility: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
  }>;
}

interface EligibilityAnalysis {
  eligibilityScore: number;
  eligibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
  recommendations: string[];
  documentRequirements: string[];
  estimatedTimeframe: string;
}

interface TypeFormResponse {
  response_id: string;
  submitted_at: string;
  eligibilityAnalysis: EligibilityAnalysis;
}

interface TypeFormData {
  form: {
    id: string;
    title: string;
    _links?: {
      display: string;
    };
  } | null;
  responses: TypeFormResponse[];
  analytics: TypeFormAnalytics;
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

export const TypeFormAnalytics: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch TypeForm analytics
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery<TypeFormAnalytics>({
    queryKey: ['/api/typeform/analytics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch Polish Citizenship Test responses
  const { data: testData, isLoading: testLoading, refetch: refetchTest } = useQuery<TypeFormData>({
    queryKey: ['/api/typeform/polish-citizenship-test/responses'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAnalytics(), refetchTest()]);
    } finally {
      setRefreshing(false);
    }
  };

  const isLoading = analyticsLoading || testLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-blue-900">Polish Citizenship Test Analytics</h2>
          <Button disabled variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
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
          <h2 className="text-3xl font-bold text-blue-900">Polish Citizenship Test Analytics</h2>
          <p className="text-gray-600 mt-1">Real-time insights from your flagship eligibility assessment</p>
        </div>
        <div className="flex gap-2">
          {testData?.form?._links?.display && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(testData.form?._links?.display, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Form
            </Button>
          )}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Responses</span>
            </div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {analytics?.totalResponses || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Conversion Rate</span>
            </div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {analytics?.conversionRate || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">High + Medium eligibility</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Average Score</span>
            </div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {analytics?.avgScore || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">High Eligibility</span>
            </div>
            <div className="text-3xl font-bold text-orange-900 mt-2">
              {analytics?.highEligibility || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Strong candidates</p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Eligibility Distribution</CardTitle>
          <CardDescription>Breakdown of applicant eligibility levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>High Eligibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{analytics?.highEligibility || 0}</span>
                <Progress 
                  value={analytics?.totalResponses ? (analytics.highEligibility / analytics.totalResponses) * 100 : 0} 
                  className="w-24 h-2" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium Eligibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{analytics?.mediumEligibility || 0}</span>
                <Progress 
                  value={analytics?.totalResponses ? (analytics.mediumEligibility / analytics.totalResponses) * 100 : 0} 
                  className="w-24 h-2" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Low Eligibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{analytics?.lowEligibility || 0}</span>
                <Progress 
                  value={analytics?.totalResponses ? (analytics.lowEligibility / analytics.totalResponses) * 100 : 0} 
                  className="w-24 h-2" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Very Low Eligibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{analytics?.veryLowEligibility || 0}</span>
                <Progress 
                  value={analytics?.totalResponses ? (analytics.veryLowEligibility / analytics.totalResponses) * 100 : 0} 
                  className="w-24 h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Recent Test Submissions</CardTitle>
          <CardDescription>Latest eligibility assessments from your TypeForm</CardDescription>
        </CardHeader>
        <CardContent>
          {testData?.responses && testData.responses.length > 0 ? (
            <div className="space-y-4">
              {testData.responses.slice(0, 5).map((response) => (
                <div key={response.response_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Response #{response.response_id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(response.submitted_at).toLocaleDateString()} at{' '}
                        {new Date(response.submitted_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {response.eligibilityAnalysis.eligibilityScore}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {response.eligibilityAnalysis.estimatedTimeframe}
                      </p>
                    </div>
                    <EligibilityBadge level={response.eligibilityAnalysis.eligibilityLevel} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No test submissions yet</p>
              <p className="text-sm">Responses will appear here once users complete your Polish Citizenship Test</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Form Information */}
      {testData?.form && testData.form !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Test Form Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{testData.form.title}</p>
                <p className="text-sm text-gray-500">Form ID: {testData.form.id}</p>
              </div>
              {testData.form._links?.display && (
                <Button 
                  onClick={() => window.open(testData.form?._links?.display, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Test Form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};