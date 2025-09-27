// QA Status Badges Component
// Displays current QA harness status and provides self-check functionality

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  PlayCircle,
  Loader2,
  Activity,
  TestTube,
  Shield,
  Eye,
  Languages,
  Printer,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function QAStatusBadges() {
  const { toast } = useToast();
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  // Fetch QA status from secure admin proxy endpoint with proper authentication
  const { data: qaStatus, isLoading, refetch } = useQuery({
    queryKey: ['/api/qa/summary'],
    queryFn: async () => {
      // Use fetch directly to handle authentication properly
      const response = await fetch('/api/qa/summary', {
        method: 'GET',
        headers: {
          'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || ''
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    // DISABLED AUTO-REFRESH - prevents constant refreshing
    // refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000
  });

  // Self-check mutation using secure admin proxy with proper authentication
  const selfCheckMutation = useMutation({
    mutationFn: async () => {
      setIsRunningCheck(true);
      // Use fetch directly to handle authentication properly
      const response = await fetch('/api/qa/run', {
        method: 'POST',
        headers: {
          'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || ''
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      const overallStatus = data.errors > 0 ? 'error' : data.warnings > 0 ? 'warning' : 'ok';
      toast({
        title: 'Self-Check Complete',
        description: `Status: ${overallStatus}. ${data.passed + data.warnings + data.errors} checks completed.`,
        variant: overallStatus === 'ok' ? 'default' : 'destructive'
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Self-Check Failed',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSettled: () => {
      setIsRunningCheck(false);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const qaChecks = [
    { key: 'health', label: 'Health', icon: Activity },
    { key: 'storage', label: 'Storage', icon: Shield },
    { key: 'apis', label: 'APIs', icon: Zap },
    { key: 'i18n', label: 'i18n', icon: Languages },
    { key: 'print', label: 'Print', icon: Printer },
    { key: 'qamode', label: 'QA Mode', icon: TestTube }
  ];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <IOS26Card strong={true} className="h-full">
          <IOS26CardHeader
            title="QA Harness Status"
            right={
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/20 text-orange-400">
                <TestTube className="h-4 w-4" />
              </div>
            }
          />
          <IOS26CardBody>
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-[var(--text-subtle)]">Loading QA status...</span>
            </div>
          </IOS26CardBody>
        </IOS26Card>
      </motion.div>
    );
  }

  // Map backend data structure to frontend expectations
  const getCheckStatus = (group: any) => {
    if (!group) return 'unknown';
    if (group.e > 0) return 'error';
    if (group.w > 0) return 'warning';
    if (group.p > 0) return 'ok';
    return 'unknown';
  };

  const overallStatus = qaStatus ? (
    qaStatus.errors > 0 ? 'error' : 
    qaStatus.warnings > 0 ? 'warning' : 
    qaStatus.passed > 0 ? 'ok' : 'unknown'
  ) : 'unknown';
  
  const checks = qaStatus?.groups || {};
  const summary = qaStatus?.summary || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <IOS26Card strong={true} className="h-full">
        <IOS26CardHeader
          title="QA Harness Status"
          right={
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
                overallStatus === 'ok' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                overallStatus === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                overallStatus === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                'bg-gray-500/20 text-gray-400 border-gray-500/30'
              )}>
                {getStatusIcon(overallStatus)}
                <span className="ml-1 capitalize">{overallStatus}</span>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/20 text-orange-400">
                <TestTube className="h-4 w-4" />
              </div>
            </div>
          }
        />
        <IOS26CardBody className="space-y-4">
        {/* Quick Stats */}
        {qaStatus && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="text-sm">
              <div className="font-semibold text-green-400">{qaStatus.passed || 0}</div>
              <div className="text-xs text-[var(--text-subtle)]">Passed</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-amber-400">{qaStatus.warnings || 0}</div>
              <div className="text-xs text-[var(--text-subtle)]">Warnings</div>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-red-400">{qaStatus.errors || 0}</div>
              <div className="text-xs text-[var(--text-subtle)]">Errors</div>
            </div>
          </div>
        )}

        {/* Individual Check Status */}
        <div className="grid grid-cols-2 gap-2">
          {qaChecks.map(({ key, label, icon: Icon }) => {
            const checkStatus = getCheckStatus(checks[key]);
            return (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-2 p-2 rounded text-xs ${getStatusColor(checkStatus)}`}>
                      <Icon className="w-3 h-3" />
                      <span className="truncate">{label}</span>
                      {getStatusIcon(checkStatus)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {label}: {checkStatus}
                      {checks[key] && (
                        <>
                          <br />Pass: {checks[key].p || 0}
                          <br />Warn: {checks[key].w || 0}
                          <br />Error: {checks[key].e || 0}
                        </>
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* QA Mode Indicator */}
        {getCheckStatus(checks.qamode) === 'ok' && (
          <div className="flex items-center gap-2 p-2 bg-blue-500/20 border border-blue-500/30 rounded text-sm">
            <TestTube className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">QA Mode Active</span>
          </div>
        )}

        {/* Timestamp */}
        {qaStatus?.ts && qaStatus.ts > 0 && (
          <div className="text-xs text-[var(--text-subtle)] text-center">
            Last updated: {new Date(qaStatus.ts).toLocaleString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => selfCheckMutation.mutate()} 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={isRunningCheck || selfCheckMutation.isPending}
          >
            {isRunningCheck || selfCheckMutation.isPending ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <PlayCircle className="w-3 h-3 mr-1" />
            )}
            Self-Check
          </Button>
        </div>

        {/* Last Update Time */}
        {qaStatus?.timestamp && (
          <div className="text-xs text-[var(--text-subtle)] text-center">
            Last checked: {new Date(qaStatus.timestamp).toLocaleTimeString()}
          </div>
        )}
        </IOS26CardBody>
      </IOS26Card>
    </motion.div>
  );
}

export default QAStatusBadges;