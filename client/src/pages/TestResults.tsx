import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestResult {
  name: string;
  path: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  code?: number;
  error?: string;
}

interface TestReport {
  timestamp: string;
  summary: {
    passed: number;
    failed: number;
    errors: number;
    total: number;
  };
  details: TestResult[];
}

export default function TestResults() {
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadTestResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('/test-results/latest-report.json');
      if (response.ok) {
        const data = await response.json();
        setTestReport(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to load test results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestResults();
    // DISABLED AUTO-REFRESH - prevents constant page refreshing
    // const interval = setInterval(loadTestResults, 30000);
    // return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PASS: "bg-green-100 text-green-800 border-green-200",
      FAIL: "bg-red-100 text-red-800 border-red-200", 
      ERROR: "bg-orange-100 text-orange-800 border-orange-200"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Loading test results...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Test Results</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Latest automated testing results for your platform
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <Button onClick={loadTestResults} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Results
          </Button>
        </div>

        {testReport ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-900">{testReport.summary.passed}</div>
                  <div className="text-sm text-green-700">Passed</div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-red-900">{testReport.summary.failed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-orange-900">{testReport.summary.errors}</div>
                  <div className="text-sm text-orange-700">Errors</div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {Math.round((testReport.summary.passed / testReport.summary.total) * 100)}%
                  </div>
                  <div className="text-sm text-blue-700">Success Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Test Results Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Results</CardTitle>
                <CardDescription>
                  Test run from {testReport.timestamp}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testReport.details.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {result.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.path}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {result.code && (
                          <Badge variant="outline" className="font-mono">
                            {result.code}
                          </Badge>
                        )}
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Raw Data */}
            <Card>
              <CardHeader>
                <CardTitle>Raw Test Data</CardTitle>
                <CardDescription>
                  Complete JSON report for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(testReport, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Test Results Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Run the test suite to see results here
              </p>
              <Button onClick={loadTestResults} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Check for Results
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}