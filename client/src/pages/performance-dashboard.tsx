import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertCircle, CheckCircle2, Gauge, Zap, Cpu, HardDrive, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  resourceCount: number;
  totalResourceSize: number;
  memoryUsage?: number;
  connectionSpeed?: string;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    resourceCount: 0,
    totalResourceSize: 0
  });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const calculateMetrics = () => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintTiming = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');
        
        const totalSize = resources.reduce((acc, resource: any) => {
          return acc + (resource.transferSize || 0);
        }, 0);

        const newMetrics: PerformanceMetrics = {
          pageLoadTime: navTiming?.loadEventEnd - navTiming?.fetchStart || 0,
          domContentLoaded: navTiming?.domContentLoadedEventEnd - navTiming?.fetchStart || 0,
          firstPaint: paintTiming[0]?.startTime || 0,
          firstContentfulPaint: paintTiming[1]?.startTime || 0,
          resourceCount: resources.length,
          totalResourceSize: totalSize,
          memoryUsage: (performance as any).memory?.usedJSHeapSize,
          connectionSpeed: (navigator as any).connection?.effectiveType
        };

        setMetrics(newMetrics);
        
        // Calculate performance score
        let calculatedScore = 100;
        if (newMetrics.pageLoadTime > 3000) calculatedScore -= 20;
        if (newMetrics.pageLoadTime > 5000) calculatedScore -= 20;
        if (newMetrics.firstContentfulPaint > 2000) calculatedScore -= 15;
        if (newMetrics.firstContentfulPaint > 3000) calculatedScore -= 15;
        if (newMetrics.resourceCount > 100) calculatedScore -= 10;
        if (newMetrics.totalResourceSize > 5000000) calculatedScore -= 10;
        
        setScore(Math.max(0, calculatedScore));
      };

      // Wait for page to fully load
      if (document.readyState === 'complete') {
        calculateMetrics();
      } else {
        window.addEventListener('load', calculateMetrics);
        return () => window.removeEventListener('load', calculateMetrics);
      }
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
            <p className="text-gray-600">Real-time website performance metrics and optimization insights</p>
          </div>
          <a href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" target="_blank" rel="noopener noreferrer">
            <button className="bg-red-800 hover:bg-red-900 text-white font-bold px-10 py-6 text-2xl md:text-3xl rounded-lg animated-button min-h-[70px]">
              TAKE POLISH CITIZENSHIP TEST
            </button>
          </a>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Overall Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <Badge className={score >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {getScoreLabel(score)}
                  </Badge>
                </div>
                <Progress value={score} className="h-3" />
              </div>
              <div className="ml-8">
                {score >= 90 && <CheckCircle2 className="w-16 h-16 text-green-500" />}
                {score >= 70 && score < 90 && <Activity className="w-16 h-16 text-yellow-500" />}
                {score < 70 && <AlertCircle className="w-16 h-16 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Page Load Time</span>
                <Zap className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{formatTime(metrics.pageLoadTime)}</p>
              <Badge variant={metrics.pageLoadTime < 3000 ? 'default' : 'destructive'} className="mt-2">
                {metrics.pageLoadTime < 3000 ? 'Good' : 'Slow'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">First Paint</span>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{formatTime(metrics.firstPaint)}</p>
              <Badge variant={metrics.firstPaint < 1000 ? 'default' : 'secondary'} className="mt-2">
                {metrics.firstPaint < 1000 ? 'Fast' : 'Moderate'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Resources</span>
                <HardDrive className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.resourceCount}</p>
              <p className="text-xs text-gray-500 mt-1">{formatBytes(metrics.totalResourceSize)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Connection</span>
                <Wifi className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{metrics.connectionSpeed || 'Unknown'}</p>
              {metrics.memoryUsage && (
                <p className="text-xs text-gray-500 mt-1">
                  Memory: {formatBytes(metrics.memoryUsage)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Detailed Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium">DOM Content Loaded</span>
                <span className="text-sm font-mono">{formatTime(metrics.domContentLoaded)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium">First Contentful Paint</span>
                <span className="text-sm font-mono">{formatTime(metrics.firstContentfulPaint)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium">Total Resources</span>
                <span className="text-sm font-mono">{metrics.resourceCount} files</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-medium">Total Size</span>
                <span className="text-sm font-mono">{formatBytes(metrics.totalResourceSize)}</span>
              </div>
              {metrics.memoryUsage && (
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm font-mono">{formatBytes(metrics.memoryUsage)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.pageLoadTime > 3000 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Reduce page load time</p>
                    <p className="text-sm text-gray-600">Consider optimizing images, minimizing JavaScript, and enabling compression</p>
                  </div>
                </div>
              )}
              {metrics.firstContentfulPaint > 2000 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Improve First Contentful Paint</p>
                    <p className="text-sm text-gray-600">Reduce server response time and eliminate render-blocking resources</p>
                  </div>
                </div>
              )}
              {metrics.resourceCount > 100 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Reduce number of requests</p>
                    <p className="text-sm text-gray-600">Combine files, use CSS sprites, and implement lazy loading</p>
                  </div>
                </div>
              )}
              {metrics.totalResourceSize > 5000000 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Reduce total page size</p>
                    <p className="text-sm text-gray-600">Compress images, minify code, and remove unused dependencies</p>
                  </div>
                </div>
              )}
              {score >= 90 && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Excellent performance!</p>
                    <p className="text-sm text-gray-600">Your website is well-optimized and loading quickly</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}