/**
 * CAP (Checks Authority Panel) Tab Component
 * Implements the complete CAP interface as specified
 */

import React, { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Settings, FileText, TreePine, DollarSign, CheckSquare, X } from 'lucide-react';
import { runCAP, CAPSnapshot, CAPItem, CaseWithCAP } from './capRules';
import { useCaseStore } from '@/stores/caseStore';
import { formatPL } from '@/lib/date';
import { cn } from '@/lib/utils';

interface CAPTabProps {
  caseData: CaseWithCAP;
}

export const CAPTab: React.FC<CAPTabProps> = ({ caseData }) => {
  const [, navigate] = useLocation();
  const { updateCase } = useCaseStore();
  const [expandedOverride, setExpandedOverride] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Get current CAP snapshot or run new evaluation
  const currentSnapshot = caseData.cap || runCAP(caseData);

  const handleRerunChecks = useCallback(() => {
    const newSnapshot = runCAP(caseData);
    updateCase(caseData.id, { cap: newSnapshot });
  }, [caseData, updateCase]);

  const handleFixAction = useCallback((item: CAPItem) => {
    switch (item.action) {
      case 'open-documents':
        navigate(`/agent/${caseData.id}?tab=documents`);
        break;
      case 'open-payments':
        navigate(`/agent/${caseData.id}?tab=payments`);
        break;
      case 'open-family-tree':
        navigate(`/agent/${caseData.id}?tab=family-tree`);
        break;
      case 'open-tasks':
        navigate(`/agent/${caseData.id}?tab=tasks`);
        break;
      case 'create-task':
        // This will be handled by opening the Tasks tab with task editor
        navigate(`/agent/${caseData.id}?tab=tasks&action=create&prefill=${encodeURIComponent(JSON.stringify({
          title: `Fix: ${item.message}`,
          type: inferTaskType(item.key),
          status: 'open'
        }))}`);
        break;
    }
  }, [navigate, caseData.id]);

  const inferTaskType = (ruleKey: string): 'USC' | 'OBY' | 'Translation' | 'Archive' | 'General' => {
    switch (ruleKey) {
      case 'docs_missing':
      case 'translations_needed':
        return 'Translation';
      default:
        return 'General';
    }
  };

  const handleOverride = useCallback((item: CAPItem) => {
    if (expandedOverride === item.id) {
      if (overrideReason.trim()) {
        // Apply override
        const updatedSnapshot: CAPSnapshot = {
          ...currentSnapshot,
          items: currentSnapshot.items.map(capItem => 
            capItem.id === item.id 
              ? { ...capItem, overridden: true, overrideReason: overrideReason.trim() }
              : capItem
          )
        };
        
        // Recalculate canProceed based on non-overridden blockers
        const activeBlockers = updatedSnapshot.items.filter(
          capItem => capItem.level === 'blocker' && !capItem.overridden
        );
        updatedSnapshot.canProceed = activeBlockers.length === 0;
        
        updateCase(caseData.id, { cap: updatedSnapshot });
        setExpandedOverride(null);
        setOverrideReason('');
      }
    } else {
      setExpandedOverride(item.id);
      setOverrideReason('');
    }
  }, [expandedOverride, overrideReason, currentSnapshot, updateCase, caseData.id]);

  const getChipVariant = (level: 'warning' | 'blocker') => {
    return level === 'blocker' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 
           'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'open-documents': return FileText;
      case 'open-payments': return DollarSign;
      case 'open-family-tree': return TreePine;
      case 'open-tasks': return CheckSquare;
      case 'create-task': return CheckSquare;
      default: return Settings;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Checks Authority Panel (CAP)</h3>
          </div>
          <button
            onClick={handleRerunChecks}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
          >
            <RefreshCw className="h-4 w-4" />
            Re-run Checks
          </button>
        </div>

        {/* Summary Stats */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rules: {currentSnapshot.rules} · Warnings: {currentSnapshot.warnings} · Blockers: {currentSnapshot.blockers} · Can proceed: {currentSnapshot.canProceed ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Last Run Timestamp */}
        {currentSnapshot.lastRunAt && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last evaluated: {formatPL(currentSnapshot.lastRunAt)} at {new Date(currentSnapshot.lastRunAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* CAP Items List */}
      <div className="space-y-4">
        {currentSnapshot.items.map((item) => {
          const ActionIcon = getActionIcon(item.action);
          const isOverrideExpanded = expandedOverride === item.id;
          
          return (
            <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-4">
              <div className="flex items-start gap-3">
                {/* Level Indicator */}
                <div className="flex-shrink-0 mt-1">
                  {item.level === 'blocker' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', getChipVariant(item.level))}>
                          {item.level.toUpperCase()}
                        </span>
                        {item.overridden && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            OVERRIDDEN
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{item.message}</h4>
                      {item.hint && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.hint}</p>
                      )}
                      {item.overridden && item.overrideReason && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <strong>Override reason:</strong> {item.overrideReason}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {item.action && !item.overridden && (
                        <button
                          onClick={() => handleFixAction(item)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
                        >
                          <ActionIcon className="h-4 w-4" />
                          Fix
                        </button>
                      )}
                      {item.level === 'blocker' && !item.overridden && (
                        <button
                          onClick={() => handleOverride(item)}
                          className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
                        >
                          <Settings className="h-4 w-4" />
                          Override
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Override Form */}
                  {isOverrideExpanded && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-medium text-amber-800 dark:text-amber-200">Override Reason</h5>
                        <button
                          onClick={() => setExpandedOverride(null)}
                          className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-amber-600" />
                        </button>
                      </div>
                      <textarea
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Enter justification for overriding this blocker..."
                        className="w-full p-3 border border-amber-300 dark:border-amber-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => setExpandedOverride(null)}
                          className="px-3 py-2 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-md transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleOverride(item)}
                          disabled={!overrideReason.trim()}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm font-medium disabled:cursor-not-allowed"
                        >
                          Confirm Override
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {currentSnapshot.items.length === 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All Checks Passed</h3>
            <p className="text-gray-500 dark:text-gray-400">No issues found. Case is ready for processing.</p>
          </div>
        )}
      </div>
    </div>
  );
};