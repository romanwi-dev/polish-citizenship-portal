import React, { useState, useEffect } from 'react';

// QA Mode detection
const QA_MODE = import.meta.env.VITE_QA_MODE === 'ON' || window.location.hostname.includes('replit.dev');
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Shield, RefreshCcw, Gavel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface HACRule {
  rule_id: string;
  rule_name: string;
  severity: 'warning' | 'blocker';
  status: 'PASS' | 'WARN' | 'FAIL' | 'ERROR';
  ok: boolean;
  message: string | null;
  remedy: string | null;
}

interface HACEvaluation {
  case_id: string;
  timestamp: string;
  status: 'GREEN' | 'AMBER' | 'RED';
  canProceed: boolean;
  results: HACRule[];
  actions: {
    submit_allowed: boolean;
    override_required: boolean;
  };
  summary: {
    total_rules: number;
    passed: number;
    warnings: number;
    blockers: number;
    errors: number;
  };
}

interface AuthorityPanelProps {
  caseId?: string;
  onStatusChange?: (status: 'GREEN' | 'AMBER' | 'RED', canProceed: boolean) => void;
  currentCaseState?: string;
  className?: string;
  hideTitle?: boolean;
}

export default function AuthorityPanel({ caseId, onStatusChange, currentCaseState, className, hideTitle = false }: AuthorityPanelProps) {
  const [evaluation, setEvaluation] = useState<HACEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedRule, setSelectedRule] = useState<HACRule | null>(null);
  const [hasOverride, setHasOverride] = useState(false);
  const { toast } = useToast();

  const runHACEvaluation = async () => {
    setIsLoading(true);
    try {
      const adminToken = QA_MODE ? (localStorage.getItem('admin_token') || 'dev-token') : localStorage.getItem('admin_token');
      
      const response = await fetch('/api/hac/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify({
          caseId: caseId
        })
      });

      if (!response.ok) {
        throw new Error(`HAC evaluation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'HAC evaluation failed');
      }

      const evaluation = result.evaluation;
      setEvaluation(evaluation);
      
      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(evaluation.status, evaluation.canProceed);
      }

      const statusMessages = {
        'GREEN': "Status: GREEN - All rules passed, submission authorized",
        'AMBER': `Status: AMBER - ${evaluation.summary.warnings} warnings detected, manual override required`,
        'RED': `Status: RED - ${evaluation.summary.blockers} blocking issues detected, cannot proceed`
      };

      toast({
        title: "HAC Evaluation Complete",
        description: statusMessages[evaluation.status] || "HAC evaluation completed",
        variant: evaluation.status === 'RED' ? 'destructive' : 'default'
      });

    } catch (error) {
      console.error('HAC evaluation error:', error);
      
      // In case of error, use fallback evaluation
      const fallbackEvaluation: HACEvaluation = {
        case_id: caseId,
        timestamp: new Date().toISOString(),
        status: 'RED',
        canProceed: false,
        results: [{
          rule_id: 'SYSTEM.ERROR',
          rule_name: 'System Error',
          severity: 'blocker',
          status: 'ERROR',
          ok: false,
          message: error.message,
          remedy: 'Contact system administrator'
        }],
        actions: {
          submit_allowed: false,
          override_required: true
        },
        summary: {
          total_rules: 1,
          passed: 0,
          warnings: 0,
          blockers: 1,
          errors: 1
        }
      };
      
      setEvaluation(fallbackEvaluation);
      
      if (onStatusChange) {
        onStatusChange('RED', false);
      }
      
      toast({
        title: "HAC Evaluation Error",
        description: "Could not complete evaluation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!selectedRule || !overrideReason.trim()) {
      toast({
        title: "Override Failed",
        description: "Please provide a reason for the override.",
        variant: "destructive",
      });
      return;
    }

    try {
      const adminToken = QA_MODE ? (localStorage.getItem('admin_token') || 'dev-token') : localStorage.getItem('admin_token');
      
      const response = await fetch('/api/hac/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || ''
        },
        body: JSON.stringify({
          caseId: caseId,
          ruleId: selectedRule.rule_id,
          reason: overrideReason
        })
      });

      if (!response.ok) {
        throw new Error(`Override failed: ${response.status}`);
      }

      const result = await response.json();
      
      setHasOverride(true);
      setOverrideOpen(false);
      setOverrideReason('');
      setSelectedRule(null);

      // Don't signal parent here - wait for re-evaluation to determine actual status

      toast({
        title: "Override Saved",
        description: `Rule ${selectedRule.rule_id} has been overridden. Re-evaluating case...`,
      });
      
      // Re-run evaluation to apply the override
      setTimeout(() => {
        runHACEvaluation();
      }, 500);

    } catch (error) {
      console.error('Override error:', error);
      toast({
        title: "Override Failed",
        description: "Unable to save override. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    if (!evaluation) return null;

    const statusColors = {
      GREEN: 'text-green-400',
      AMBER: 'text-amber-400', 
      RED: 'text-red-400'
    };

    const colorClass = statusColors[evaluation.status] || 'text-gray-400';

    return (
      <Shield className={`h-12 w-12 ${colorClass} transition-all duration-200`} />
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'PASS_WITH_OVERRIDE':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'WARN':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'FAIL':
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  // Run initial evaluation
  useEffect(() => {
    runHACEvaluation();
  }, []);

  // Get background color based on HAC status
  const getStatusBackground = () => {
    if (!evaluation) return 'rgba(55, 65, 81, 0.8)'; // default gray
    
    switch (evaluation.status) {
      case 'GREEN':
        return 'rgba(34, 197, 94, 0.15)'; // green background
      case 'AMBER':
        return 'rgba(245, 158, 11, 0.15)'; // amber background
      case 'RED':
        return 'rgba(239, 68, 68, 0.15)'; // red background
      default:
        return 'rgba(55, 65, 81, 0.8)'; // gray
    }
  };

  // Extract shared content to avoid duplication
  const Content = (
    <div className={`w-full min-h-[450px] flex flex-col ${className || ''}`} style={{ backgroundColor: getStatusBackground() }}>
        {/* Refresh Button at Top */}
        <div className="flex justify-end p-4 border-b border-white/10 flex-shrink-0">
          <ActionButton
            variant="ghost"
            onClick={runHACEvaluation}
            disabled={isLoading}
            className="gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-hac-refresh"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </ActionButton>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 flex-shrink-0">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white/80">Running HAC evaluation...</span>
          </div>
        )}

        {/* Evaluation Results */}
        {evaluation && !isLoading && (
          <div className="flex-1 overflow-hidden flex flex-col">
          {/* Summary */}
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex flex-row flex-wrap gap-4 text-sm">
              <div className="flex flex-row flex-wrap items-center gap-2 leading-tight">
                <span className="text-white/70 shrink-0 whitespace-nowrap">Case ID:</span>
                <span className="font-mono text-white font-medium min-w-0 truncate">{evaluation.case_id}</span>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 leading-tight">
                <span className="text-white/70 shrink-0 whitespace-nowrap">Total Rules:</span>
                <span className="text-white font-medium min-w-0 truncate">{evaluation.summary.total_rules}</span>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 leading-tight">
                <span className="text-white/70 shrink-0 whitespace-nowrap">Warnings:</span>
                <span className="text-amber-400 font-medium min-w-0 truncate">{evaluation.summary.warnings}</span>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 leading-tight">
                <span className="text-white/70 shrink-0 whitespace-nowrap">Blockers:</span>
                <span className="text-red-400 font-medium min-w-0 truncate">{evaluation.summary.blockers}</span>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 leading-tight">
                <span className="text-white/70 shrink-0 whitespace-nowrap">Can Proceed:</span>
                <span className={`font-medium min-w-0 truncate ${evaluation.canProceed ? 'text-green-400' : 'text-red-400'}`}>
                  {evaluation.canProceed ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>

          {/* Rules Table - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 flex-shrink-0">
              <h4 className="font-medium text-white mb-0">Rule Evaluation Results</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <div className="space-y-3">
              {evaluation.results.map((rule) => (
                <div key={rule.rule_id} className="p-3 hover:bg-white/5 transition-all duration-200 border border-white/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(rule.status)}
                        <span className="font-medium text-white">{rule.rule_name}</span>
                        <span className="text-xs text-white/60 font-mono">{rule.rule_id}</span>
                      </div>
                      
                      {rule.message && (
                        <div className="text-sm text-white/70 mb-2">{rule.message}</div>
                      )}
                      
                      {rule.remedy && (
                        <div className="text-sm text-blue-300 rounded-lg px-3 py-2 mb-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {rule.remedy}
                        </div>
                      )}
                      
                      {rule.override && (
                        <div className="text-sm text-green-300 rounded-lg px-3 py-2 mb-2" style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
                          <strong>Override:</strong> {rule.override.reason}
                          <br />
                          <span className="text-xs">By: {rule.override.overriddenBy} at {new Date(rule.override.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {(rule.status === 'WARN' || rule.status === 'FAIL') && !rule.override && (
                      <Dialog open={overrideOpen && selectedRule?.rule_id === rule.rule_id} onOpenChange={setOverrideOpen}>
                        <DialogTrigger asChild>
                          <ActionButton
                            variant="ghost"
                            onClick={() => {
                              setSelectedRule(rule);
                              setOverrideOpen(true);
                            }}
                            className="gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                            data-testid={`button-override-${rule.rule_id}`}
                          >
                            <Gavel className="h-4 w-4" />
                            {rule.status === 'FAIL' ? 'Block Override' : 'Override'}
                          </ActionButton>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Override HAC Rule</DialogTitle>
                            <DialogDescription>
                              You are about to override rule "{rule.rule_name}". Please provide a justification for this override.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="override-reason">Reason for Override</Label>
                              <Textarea
                                id="override-reason"
                                placeholder="Explain why this rule should be overridden..."
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                data-testid="textarea-override-reason"
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <ActionButton 
                              variant="ghost" 
                              onClick={() => setOverrideOpen(false)}
                              className="gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                            >
                              Cancel
                            </ActionButton>
                            <ActionButton 
                              onClick={handleOverride} 
                              data-testid="button-confirm-override" 
                              variant="ghost"
                              className="gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                            >
                              Confirm Override
                            </ActionButton>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>

        </div>
        )}
    </div>
  );

  // Return content directly without nested cards
  return Content;
}