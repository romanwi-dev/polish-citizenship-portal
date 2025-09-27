import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
// Button import removed - using ActionButton component for unified styling
import {
  Activity,
  CheckCircle,
  Shield,
  Smartphone,
  Zap,
  Terminal,
  Play,
  Clock,
  AlertCircle,
  RefreshCw,
  TestTube,
  Cloud,
  Eye,
  EyeOff,
  Image,
  Monitor,
  Tablet,
  Bot,
  Brain,
  FileText,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { PredeployStatusBadge } from '../components/PredeployStatusBadge';
import { QAStatusBadges } from '../components/QAStatusBadges';
import { getPerformanceMetrics } from '../utils/performance-metrics';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ActionButton component for unified styling across AI Agent sections
const ActionButton = React.forwardRef(({ children, variant = "primary", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "btn btn-primary",
    secondary: "btn",
    ghost: "btn btn-ghost",
  };
  
  return (
    <button
      ref={ref}
      className={`${btnVariants[variant]} touch-target ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// Full Project Auditor Component with UI/UX
function FullProjectAuditor() {
  const { toast } = useToast();
  const [auditorResults, setAuditorResults] = useState(null);
  const [showScreenshots, setShowScreenshots] = useState(false);

  // Mutation for running Full Project Auditor
  const runAuditorMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/auditor/run');
    },
    onSuccess: (data) => {
      setAuditorResults(data.report);
      toast({
        title: 'Full Project Audit Completed',
        description: `Audit finished in ${formatDuration(data.duration)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Audit Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

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
          title="Full Project Auditor (MAX)"
          right={
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20 text-blue-400">
              <TestTube className="h-4 w-4" />
            </div>
          }
        />
        <IOS26CardBody>
          <p className="text-sm text-[var(--text-subtle)] mt-2 mb-4">
            Comprehensive end-to-end system validation with UI/UX analysis, accessibility testing, and screenshot capture across all viewports.
          </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ActionButton
          onClick={() => runAuditorMutation.mutate()}
          disabled={runAuditorMutation.isPending}
          variant="ghost"
          className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
          data-testid="button-run-full-auditor"
        >
          {runAuditorMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Running Audit...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4" />
              Run Full Audit
            </>
          )}
        </ActionButton>

        {auditorResults?.extras?.uiux && (
          <ActionButton
            onClick={() => setShowScreenshots(!showScreenshots)}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-toggle-screenshots"
          >
            {showScreenshots ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showScreenshots ? 'Hide' : 'Show'} Screenshots
          </ActionButton>
        )}
      </div>

      {/* Audit Results Summary */}
      {auditorResults && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-700 dark:text-green-300">{auditorResults.counts.ok}</div>
              <div className="text-xs text-green-600 dark:text-green-400">PASSED</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{auditorResults.counts.warn}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">WARNINGS</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{auditorResults.counts.info}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">INFO</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-700 dark:text-red-300">{auditorResults.counts.error}</div>
              <div className="text-xs text-red-600 dark:text-red-400">ERRORS</div>
            </div>
          </div>

          {/* UI/UX Results */}
          {auditorResults.extras?.uiux && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                UI/UX Analysis Results
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-bold text-orange-600 dark:text-orange-400">{auditorResults.extras.uiux.totals.a11yViolations}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">A11y Issues</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-pink-600 dark:text-pink-400">{auditorResults.extras.uiux.totals.tapTargetIssues}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Small Tap Targets</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{auditorResults.extras.uiux.totals.altMissing}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Missing Alt Text</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600 dark:text-green-400">{auditorResults.extras.uiux.totals.clsRiskRoutes}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">CLS Risk Routes</div>
                </div>
              </div>
            </div>
          )}

          {/* Screenshots Gallery */}
          {showScreenshots && auditorResults.extras?.uiux && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Screenshots Gallery
              </h4>
              <div className="space-y-4">
                {Object.entries(
                  auditorResults.extras.uiux.pages.reduce((acc, page) => {
                    if (!acc[page.route]) acc[page.route] = [];
                    acc[page.route].push(page);
                    return acc;
                  }, {})
                ).map(([route, pages]) => (
                  <div key={route} className="border dark:border-gray-600 rounded-lg p-3">
                    <h5 className="font-medium mb-2 text-sm">Route: {route}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {pages.map((page, idx) => (
                        <div key={idx} className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {page.viewport === 'mobile' && <Smartphone className="h-3 w-3" />}
                            {page.viewport === 'tablet' && <Tablet className="h-3 w-3" />}
                            {page.viewport === 'desktop' && <Monitor className="h-3 w-3" />}
                            <span className="text-xs font-medium capitalize">{page.viewport}</span>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-2 rounded border">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              A11y: {page.axe.violations} | CLS: {page.heuristics.clsRiskPct}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
        </IOS26CardBody>
      </IOS26Card>
    </motion.div>
  );
}

// GROK Testing Component
function GrokTestingControls() {
  const { toast } = useToast();
  const [grokResults, setGrokResults] = useState(null);

  // Mutation for GROK connection test
  const grokTestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/grok/test');
    },
    onSuccess: (data) => {
      setGrokResults(data);
      toast({
        title: 'GROK Test Completed',
        description: data.success ? 'Connection successful' : 'Connection failed',
        variant: data.success ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'GROK Test Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full"
    >
      <IOS26Card strong={true} className="h-full">
        <IOS26CardHeader
          title="GROK AI Testing"
          right={
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 text-purple-400">
              <Bot className="h-4 w-4" />
            </div>
          }
        />
        <IOS26CardBody>
          <p className="text-sm text-[var(--text-subtle)] mt-2 mb-4">
            Test GROK AI connectivity and run X.AI model verification checks.
          </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ActionButton
          onClick={() => grokTestMutation.mutate()}
          disabled={grokTestMutation.isPending}
          variant="ghost"
          className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
          data-testid="button-grok-test"
        >
          {grokTestMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Test GROK Connection
            </>
          )}
        </ActionButton>

        <ActionButton
          onClick={() => window.open('/grok-testing', '_blank')}
          variant="ghost"
          className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
          data-testid="button-grok-full-page"
        >
          <ExternalLink className="h-4 w-4" />
          Open GROK Testing Page
        </ActionButton>
      </div>

      {grokResults && (
        <div className={`mt-4 p-3 rounded-lg border ${grokResults.success ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            {grokResults.success ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="font-medium text-sm text-[var(--text)]">
              {grokResults.success ? 'GROK Connected Successfully' : 'GROK Connection Failed'}
            </span>
          </div>
          {grokResults.message && (
            <p className="text-sm text-[var(--text-subtle)]">{grokResults.message}</p>
          )}
          {grokResults.models && (
            <div className="mt-2">
              <span className="text-xs text-[var(--text-subtle)]">Available models: {grokResults.models.join(', ')}</span>
            </div>
          )}
        </div>
      )}
        </IOS26CardBody>
      </IOS26Card>
    </motion.div>
  );
}

// OpenAI Double Check Component
function OpenAIDoubleCheckControls() {
  const { toast } = useToast();
  const [doubleCheckResults, setDoubleCheckResults] = useState(null);

  // Mutation for OpenAI Double Check
  const doubleCheckMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/openai-double-check', { action: 'double-check' });
    },
    onSuccess: (data) => {
      setDoubleCheckResults(data);
      toast({
        title: 'OpenAI Double Check Completed',
        description: 'Cross-AI validation finished successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Double Check Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="w-full"
    >
      <IOS26Card strong={true} className="h-full">
        <IOS26CardHeader
          title="OpenAI Cross-Validation"
          right={
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/20 text-green-400">
              <Brain className="h-4 w-4" />
            </div>
          }
        />
        <IOS26CardBody>
          <p className="text-sm text-[var(--text-subtle)] mt-2 mb-4">
            Run OpenAI double-check for cross-AI validation. Uses OpenAI to verify Claude's work.
          </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <ActionButton
          onClick={() => doubleCheckMutation.mutate()}
          disabled={doubleCheckMutation.isPending}
          variant="ghost"
          className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
          data-testid="button-openai-double-check"
        >
          {doubleCheckMutation.isPending ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Running Double Check...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Run Cross-AI Validation
            </>
          )}
        </ActionButton>

        <ActionButton
          onClick={() => window.open('/openai-double-check', '_blank')}
          variant="ghost"
          className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
          data-testid="button-openai-full-page"
        >
          <ExternalLink className="h-4 w-4" />
          Open Double Check Page
        </ActionButton>
      </div>

      {doubleCheckResults && (
        <div className="mt-4 space-y-3">
          <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg border border-blue-500/30">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Cross-AI Validation Results
            </h4>
            {doubleCheckResults.analysis && (
              <p className="text-sm text-[var(--text-subtle)] mb-2">{doubleCheckResults.analysis}</p>
            )}
            {doubleCheckResults.confidence && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-subtle)]">Confidence Score:</span>
                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                  {doubleCheckResults.confidence}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </IOS26CardBody>
      </IOS26Card>
    </motion.div>
  );
}


// Utility functions
const getStatusColor = (status) => {
  switch (status) {
    case 'ok': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'error': return 'bg-red-500';
    case 'running': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'ok': return 'default';
    case 'warning': return 'secondary';
    case 'error': return 'destructive';
    case 'running': return 'outline';
    default: return 'outline';
  }
};

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

// Status badges component for the top of the page
function SystemStatusBadges({ healthData }) {
  const { i18n } = useTranslation();
  
  return (
    <div className="glass-toolbar mb-4 p-2 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span 
          className={`badge ${healthData?.environment?.qaMode ? 'ok' : ''}`}
          data-testid="status-badge-qa-mode"
        >
          QA_MODE: {healthData?.environment?.qaMode ? 'ON' : 'OFF'}
        </span>
        {healthData?.devOpen && (
          <span 
            className="badge ok"
            data-testid="status-badge-dev-open"
          >
            Dev Open
          </span>
        )}
        <span className="badge" data-testid="status-badge-storage">
          Storage: {healthData?.storageType === 'mock' ? 'MOCK' : 'DROPBOX'}
        </span>
        <span className="badge" data-testid="status-badge-lang">
          Lang: {i18n.language?.toUpperCase() || 'EN'}
        </span>
        <span className="badge" data-testid="status-badge-version">
          Version: {healthData?.version || '1.0.3'}
        </span>
      </div>
      <PredeployStatusBadge qaMode={healthData?.environment?.qaMode || false} />
    </div>
  );
}

// Individual check card component
function CheckCard({ 
  title, 
  description, 
  icon: Icon, 
  status, 
  onRun, 
  data, 
  isLoading, 
  lastRun 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleRun = async () => {
    try {
      await onRun();
      toast({
        title: `${title} check completed`,
        description: `Check completed with status: ${status}`,
      });
    } catch (error) {
      toast({
        title: `${title} check failed`,
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ok': return 'ok';
      case 'warning': return 'warn';
      case 'error': return 'err';
      default: return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="w-full"
    >
      <IOS26Card strong={true} className="h-full">
        <IOS26CardHeader
          title={title}
          right={
            Icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/20 text-cyan-400">
                <Icon className="h-4 w-4" />
              </div>
            )
          }
        />
        <IOS26CardBody>
          {description && (
            <p className="text-sm text-[var(--text-subtle)] mt-1 mb-3">{description}</p>
          )}
      
      {data && (
        <div className="list mt-3">
          {data.uptime && (
            <div className="kpi">
              <b>Uptime</b>
              <span data-testid={`text-uptime-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {data.uptime}
              </span>
            </div>
          )}
          {data.duration && (
            <div className="kpi">
              <b>Duration</b>
              <span data-testid={`text-duration-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {formatDuration(data.duration)}
              </span>
            </div>
          )}
          {(data.status || status) && (
            <div className="kpi">
              <b>Status</b>
              <span 
                className={`badge ${getStatusClass(data.status || status)}`}
                data-testid={`status-check-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {data.status || status || 'Ready'}
              </span>
            </div>
          )}
          {data.storageConnected !== undefined && (
            <div className="kpi">
              <b>Storage</b>
              <span 
                className={`badge ${data.storageConnected ? 'ok' : 'err'}`}
                data-testid={`status-storage-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {data.storageConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
          {data.checks && (
            <>
              {data.checks.jwt && (
                <div className="kpi">
                  <b>JWT Secret</b>
                  <span 
                    className={`badge ${data.checks.jwt.ok ? 'ok' : 'err'}`}
                    data-testid={`status-jwt-${title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {data.checks.jwt.ok ? 'VALID' : 'INVALID'}
                  </span>
                </div>
              )}
              {data.checks.dropbox && (
                <div className="kpi">
                  <b>Dropbox API</b>
                  <span 
                    className={`badge ${data.checks.dropbox.ok ? 'ok' : 'err'}`}
                    data-testid={`status-dropbox-${title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {data.checks.dropbox.ok ? 'CONNECTED' : 'FAILED'}
                  </span>
                </div>
              )}
            </>
          )}
          {lastRun && (
            <div className="kpi">
              <b>Last Run</b>
              <span data-testid={`text-last-run-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {new Date(lastRun).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 flex flex-wrap gap-3">
        <ActionButton 
          variant="ghost"
          className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105" 
          onClick={handleRun}
          disabled={isLoading}
          data-testid={`button-run-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isLoading ? 'Running...' : `Run ${title}`}
        </ActionButton>
        
        {data && (
          <ActionButton 
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105" 
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`button-details-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Details
          </ActionButton>
        )}
      </div>

      {/* JSON Details Accordion */}
      {data && isExpanded && (
        <div className="mt-4 p-3 bg-[var(--surface-muted)] rounded-lg border border-[var(--surface-alt)]">
          <pre 
            className="text-xs overflow-auto max-h-64 whitespace-pre-wrap text-[var(--text)]"
            data-testid={`details-json-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
        </IOS26CardBody>
      </IOS26Card>
    </motion.div>
  );
}


// Main SystemChecks component
export default function SystemChecks() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State for each check type
  const [results, setResults] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  // Command executor state
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandResults, setCommandResults] = useState(null);
  const [commandLoading, setCommandLoading] = useState(false);
  const [liveSteps, setLiveSteps] = useState([]);

  // QA Status query with conditional polling when QA_MODE is ON
  const { data: qaData, isLoading: qaLoading, refetch: refetchQA } = useQuery({
    queryKey: ['/api/qa/summary'],
    queryFn: async () => {
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
    staleTime: 10000,
    retry: false,
    // Poll every 30 seconds when QA_MODE is ON (check results.health after it's available)
    refetchInterval: results.health?.environment?.qaMode ? 30000 : false
  });

  // Dropbox Status Query
  const { data: dropboxStatus, refetch: refetchDropboxStatus, isLoading: dropboxLoading } = useQuery({
    queryKey: ['/api/dropbox/status'],
    queryFn: async () => {
      const response = await fetch('/api/dropbox/status', {
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
    staleTime: 30000,
    retry: false
  });

  // QA Run mutation
  const qaRunMutation = useMutation({
    mutationFn: async () => {
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
      const status = data.errors > 0 ? 'error' : data.warnings > 0 ? 'warning' : 'ok';
      toast({
        title: 'QA Suite Complete',
        description: `Status: ${status}. ${data.passed + data.warnings + data.errors} checks completed.`,
        variant: status === 'ok' ? 'default' : 'destructive'
      });
      refetchQA();
    },
    onError: (error) => {
      toast({
        title: 'QA Suite Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handle URL token params and localStorage/cookie sync
  useEffect(() => {
    // Check for admin token in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const adminToken = urlParams.get('admin');
    
    if (adminToken) {
      // Store to localStorage and remove from URL
      localStorage.setItem('admin_token', adminToken);
      urlParams.delete('admin');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
    
    // Sync from cookie to localStorage if localStorage is empty
    const localToken = localStorage.getItem('admin_token');
    if (!localToken) {
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];
      
      if (cookieToken) {
        localStorage.setItem('admin_token', cookieToken);
      }
    }
  }, []);

  // Load results from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('systemChecks:results');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (error) {
        console.warn('Failed to load saved results:', error);
      }
    }

    // Load last command result
    const savedCommand = localStorage.getItem('systemChecks:lastCommand');
    if (savedCommand) {
      try {
        const { command, result } = JSON.parse(savedCommand);
        setCurrentCommand(command);
        setCommandResults(result);
      } catch (error) {
        console.warn('Failed to load saved command:', error);
      }
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem('systemChecks:results', JSON.stringify(results));
    }
  }, [results]);

  // Mutation for running checks
  const runCheckMutation = useMutation({
    mutationFn: async ({ type, endpoint }) => {
      // Special handling for the new system health check
      if (endpoint === '/api/system/health') {
        const response = await fetch("/api/system/health", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "system-checks-ui" })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }
      
      // For other endpoints, use the existing logic
      const method = endpoint.includes('/health') ? 'GET' : 'POST';
      return apiRequest(method, endpoint);
    },
    onSuccess: (data, variables) => {
      setResults(prev => ({
        ...prev,
        [variables.type]: {
          ...data,
          lastRun: new Date().toISOString()
        }
      }));
      setLoadingStates(prev => ({ ...prev, [variables.type]: false }));
    },
    onError: (error, variables) => {
      setLoadingStates(prev => ({ ...prev, [variables.type]: false }));
      toast({
        title: 'Check failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for saving reports
  const saveReportMutation = useMutation({
    mutationFn: async (reportData) => {
      return apiRequest('POST', '/api/admin/checks/report/save', { report: reportData });
    },
  });

  // Mutation for loading reports
  const loadReportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('GET', '/api/admin/checks/report/latest');
    },
    onSuccess: (data) => {
      if (data.status === 'ok' && data.report) {
        setResults(data.report);
      }
    },
  });

  // Function to run a specific check
  const runCheck = (type, endpoint) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    runCheckMutation.mutate({ type, endpoint });
  };

  // Command executor mutation
  const executeCommandMutation = useMutation({
    mutationFn: async (command) => {
      const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
      if (!adminToken) {
        throw new Error('VITE_ADMIN_TOKEN not configured. Add VITE_ADMIN_TOKEN to environment variables.');
      }

      const response = await fetch('/api/admin/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setCommandResults(data);
      setCommandLoading(false);
      setLiveSteps(data.steps || []);
      
      // Save to localStorage
      localStorage.setItem('systemChecks:lastCommand', JSON.stringify({
        command: currentCommand,
        result: data
      }));

      toast({
        title: 'Command completed',
        description: `${currentCommand} executed successfully`,
      });
    },
    onError: (error) => {
      setCommandLoading(false);
      setLiveSteps([]);
      toast({
        title: 'Command failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Execute command function
  const executeCommand = (command) => {
    if (!command || !command.trim()) {
      toast({
        title: 'No command',
        description: 'Please enter a command',
        variant: 'destructive',
      });
      return;
    }

    setCommandLoading(true);
    setLiveSteps([]);
    setCommandResults(null);
    executeCommandMutation.mutate(command.trim().toUpperCase());
  };

  // Available commands
  const availableCommands = ['CLEAN', 'FIX', 'UI/UX', 'PERFORM', 'SECURITY', 'VISUAL', 'ANALYZE', 'DEPLOY', 'PREDEPLOY'];

  // Health data for status badges
  const healthData = results.health;

  // Check definitions
  const checks = [
    {
      id: 'health',
      title: 'Health Check',
      description: 'JWT secret validation and Dropbox API connectivity',
      icon: Activity,
      endpoint: '/api/system/health',
      status: results.health?.ok ? 'ok' : 'error',
      data: results.health,
      lastRun: results.health?.lastRun,
      isLoading: loadingStates.health
    },
    {
      id: 'qa',
      title: 'QA Suite',
      description: 'Health, Storage, APIs, i18n, Print, QA Mode validation',
      icon: TestTube,
      endpoint: '/api/qa/run',
      status: qaData ? (qaData.errors > 0 ? 'error' : qaData.warnings > 0 ? 'warning' : qaData.passed > 0 ? 'ok' : 'unknown') : 'unknown',
      data: qaData,
      lastRun: qaData?.ts ? new Date(qaData.ts).toISOString() : null,
      isLoading: qaRunMutation.isPending
    },
    {
      id: 'security',
      title: 'Security Audit',
      description: 'Environment secrets, npm audit, and security headers',
      icon: Shield,
      endpoint: '/api/admin/checks/security',
      status: results.security?.status,
      data: results.security,
      lastRun: results.security?.lastRun,
      isLoading: loadingStates.security
    },
    {
      id: 'performance',
      title: 'Performance Metrics',
      description: 'First render time, core web vitals, API timing, and I/O benchmarks',
      icon: Zap,
      endpoint: '/api/admin/checks/performance',
      status: results.performance?.status || 'ok',
      data: { 
        ...results.performance, 
        clientMetrics: getPerformanceMetrics() || { bootMs: 'N/A', note: 'Client metrics not available' }
      },
      lastRun: results.performance?.lastRun || new Date().toISOString(),
      isLoading: loadingStates.performance
    },
    {
      id: 'ux',
      title: 'UX Tests',
      description: 'Playwright smoke tests and page accessibility',
      icon: Smartphone,
      endpoint: '/api/admin/checks/ux',
      status: results.ux?.status,
      data: results.ux,
      lastRun: results.ux?.lastRun,
      isLoading: loadingStates.ux
    },
    {
      id: 'dropbox',
      title: 'Dropbox Connection',
      description: 'OAuth2 authentication and cloud storage connectivity',
      icon: Cloud,
      endpoint: '/api/dropbox/status',
      status: dropboxStatus?.connected ? 'ok' : 'error',
      data: dropboxStatus,
      lastRun: new Date().toISOString(),
      isLoading: dropboxLoading
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="page-title">
          System Checks Console
        </h1>
        <p className="text-gray-600">
          Comprehensive system monitoring and quality assurance dashboard
        </p>
      </div>

      {/* Status Badges */}
      <SystemStatusBadges healthData={healthData} />

      {/* QA Harness Status Board - moved from Case Management Dashboard */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <QAStatusBadges />
        
        {/* QA Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="w-full"
        >
          <IOS26Card strong={true} className="h-full">
            <IOS26CardHeader
              title="QA Control Panel"
              right={
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20 text-amber-400">
                  <TestTube className="h-4 w-4" />
                </div>
              }
            />
            <IOS26CardBody>
              <div className="space-y-3">
                <div className="text-sm text-[var(--text-subtle)] mb-3">
                  Run comprehensive system checks and view status tiles
                </div>
            
            <div className="flex flex-wrap gap-2">
              <ActionButton 
                variant="ghost"
                className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105" 
                onClick={() => refetchQA()}
                disabled={qaLoading}
                data-testid="button-qa-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${qaLoading ? 'animate-spin' : ''}`} />
                {qaLoading ? 'Refreshing...' : 'Refresh'}
              </ActionButton>
              
              <ActionButton 
                variant="ghost"
                className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105" 
                onClick={() => qaRunMutation.mutate()}
                disabled={qaRunMutation.isPending}
                data-testid="button-qa-self-check"
              >
                <Play className={`w-4 h-4 ${qaRunMutation.isPending ? 'animate-spin' : ''}`} />
                {qaRunMutation.isPending ? 'Running...' : 'Self-Check'}
              </ActionButton>
            </div>
            
            {qaData && (
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-semibold ${qaData.errors > 0 ? 'text-red-600' : qaData.warnings > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {qaData.errors > 0 ? 'ERROR' : qaData.warnings > 0 ? 'WARNING' : 'PASS'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Checks:</span>
                  <span>{qaData.passed + qaData.warnings + qaData.errors} total</span>
                </div>
                {qaData.ts > 0 && (
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>{new Date(qaData.ts).toLocaleTimeString()}</span>
                  </div>
                )}
                {results.health?.environment?.qaMode && (
                  <div className="flex justify-between">
                    <span>Auto-polling:</span>
                    <span className="text-blue-600">ON (30s)</span>
                  </div>
                )}
              </div>
            )}
              </div>
            </IOS26CardBody>
          </IOS26Card>
        </motion.div>
      </div>

      {/* Check Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {checks.map((check) => (
          <CheckCard
            key={check.id}
            title={check.title}
            description={check.description}
            icon={check.icon}
            status={check.status}
            onRun={() => {
              if (check.id === 'qa') {
                qaRunMutation.mutate();
              } else if (check.id === 'dropbox') {
                if (!dropboxStatus?.connected) {
                  // Redirect to OAuth start if not connected
                  const token = localStorage.getItem('admin_token') || import.meta.env.VITE_ADMIN_TOKEN || '';
                  window.location.href = `/api/dropbox/oauth/start?x-admin-token=${encodeURIComponent(token)}`;
                } else {
                  // Just refresh status if already connected
                  refetchDropboxStatus();
                }
              } else {
                runCheck(check.id, check.endpoint);
              }
            }}
            data={check.data}
            isLoading={check.isLoading}
            lastRun={check.lastRun}
          />
        ))}
        
        {/* Command Executor Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="w-full md:col-span-2"
        >
          <IOS26Card strong={true} className="h-full">
            <IOS26CardHeader
              title="Admin Command Executor"
              right={
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20 text-red-400">
                  <Terminal className="h-4 w-4" />
                </div>
              }
            />
            <IOS26CardBody>
              <p className="text-sm text-[var(--text-subtle)] mt-1 mb-4">
                Execute administrative commands with secure token validation
              </p>
          
          {/* Command Input */}
          <div className="mb-4">
            <input
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              placeholder="Type a command: CLEAN | FIX | UI/UX | PERFORM | SECURITY | VISUAL | ANALYZE | DEPLOY | PREDEPLOY"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={commandLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !commandLoading) {
                  executeCommand(currentCommand);
                }
              }}
              data-testid="input-command"
            />
          </div>

          {/* Command Buttons - Horizontally Scrollable */}
          <div className="button-scroll-container mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {availableCommands.map((cmd) => (
                <ActionButton
                  key={cmd}
                  onClick={() => {
                    setCurrentCommand(cmd);
                    executeCommand(cmd);
                  }}
                  disabled={commandLoading}
                  variant="ghost"
                  className="w-[120px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                  data-testid={`button-command-${cmd.toLowerCase().replace('/', '-')}`}
                >
                  {cmd}
                </ActionButton>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          <div className="mb-4">
            <ActionButton
              onClick={() => executeCommand(currentCommand)}
              disabled={commandLoading || !currentCommand.trim()}
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-execute-command"
            >
              {commandLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Execute Command
                </>
              )}
            </ActionButton>
          </div>

          {/* Live Log Area */}
          {(commandLoading || commandResults || liveSteps.length > 0) && (
            <div className="mt-4 p-3 bg-black bg-opacity-5 rounded-lg border border-black border-opacity-10">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Command Execution Log
              </div>
              
              {/* Live Steps */}
              {liveSteps.length > 0 && (
                <div className="space-y-2 mb-3">
                  {liveSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${step.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium">{step.name}</span>
                      <span className="text-gray-500">({step.ms}ms)</span>
                      {!step.ok && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Command Results Summary */}
              {commandResults && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <span className={`badge ${commandResults.ok ? 'ok' : 'err'}`}>
                        {commandResults.ok ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>
                    <div><span className="font-medium">Command:</span> {commandResults.command}</div>
                    <div><span className="font-medium">Notes:</span> {commandResults.summary?.notes}</div>
                    <div><span className="font-medium">Steps:</span> {commandResults.summary?.successfulSteps}/{commandResults.summary?.totalSteps}</div>
                    {commandResults.startedAt && (
                      <div><span className="font-medium">Executed:</span> {new Date(commandResults.startedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {commandLoading && !liveSteps.length && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="h-4 w-4 animate-spin" />
                  Executing command, please wait...
                </div>
              )}
            </div>
          )}
            </IOS26CardBody>
          </IOS26Card>
        </motion.div>
        
        {/* Full Project Auditor (MAX) with UI/UX */}
        <FullProjectAuditor />
        
        {/* GROK AI Testing */}
        <GrokTestingControls />
        
        {/* OpenAI Double Check */}
        <OpenAIDoubleCheckControls />
        
        
      </div>
    </div>
  );
}