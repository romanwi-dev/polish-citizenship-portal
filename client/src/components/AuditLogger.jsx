import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  FileText, 
  Clock, 
  User, 
  Activity, 
  Eye, 
  Download, 
  Filter,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

// Audit Logger Service for case actions
export class AuditLogService {
  static async logAction(caseId, action, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      actor: details.actor || 'system',
      action,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    try {
      await apiRequest('POST', `/api/cases/${caseId}/audit`, logEntry);
      console.log('[AUDIT]', caseId, action, logEntry);
    } catch (error) {
      console.error('[AUDIT] Failed to log action:', error);
    }
  }

  static async getAuditLog(caseId) {
    try {
      return await apiRequest('GET', `/api/cases/${caseId}/audit`);
    } catch (error) {
      console.error('[AUDIT] Failed to get audit log:', error);
      return [];
    }
  }

  static async exportAuditLog(caseId, format = 'json') {
    try {
      const response = await fetch(`/api/cases/${caseId}/audit/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${caseId}-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[AUDIT] Failed to export audit log:', error);
    }
  }
}

// Hook for audit logging
export function useAuditLogger(caseId) {
  const logAction = async (action, details = {}) => {
    await AuditLogService.logAction(caseId, action, details);
  };

  const { data: auditLog, isLoading, refetch } = useQuery({
    queryKey: ['audit-log', caseId],
    queryFn: () => AuditLogService.getAuditLog(caseId),
    enabled: !!caseId,
  });

  const exportLog = async (format = 'json') => {
    await AuditLogService.exportAuditLog(caseId, format);
  };

  return {
    logAction,
    auditLog: auditLog || [],
    isLoading,
    refetch,
    exportLog,
  };
}

// Audit Log Viewer Component
export function AuditLogViewer({ caseId, className = "" }) {
  const { auditLog, isLoading, exportLog } = useAuditLogger(caseId);
  const [filter, setFilter] = useState('all');
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  const filteredLog = auditLog.filter(entry => {
    if (filter === 'all') return true;
    return entry.action.toLowerCase().includes(filter.toLowerCase());
  });

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEntries(newExpanded);
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'update':
      case 'updated':
      case 'edit':
      case 'edited':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'delete':
      case 'deleted':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'view':
      case 'viewed':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'update':
      case 'updated':
      case 'edit':
      case 'edited':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delete':
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'view':
      case 'viewed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`audit-log-viewer ${className}`} data-testid="audit-log-viewer">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Audit Log
          </h3>
          <Badge variant="secondary" className="text-xs">
            {filteredLog.length} entries
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            data-testid="audit-filter-select"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportLog('json')}
            data-testid="button-export-audit-log"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLog.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No audit log entries found</p>
          </div>
        ) : (
          filteredLog.map((entry, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800"
              data-testid={`audit-entry-${index}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getActionIcon(entry.action)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionBadgeColor(entry.action)}>
                        {entry.action}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        by {entry.actor}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                    
                    {entry.details?.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {entry.details.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {Object.keys(entry.details || {}).length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(index)}
                    className="ml-2"
                    data-testid={`button-expand-audit-${index}`}
                  >
                    {expandedEntries.has(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              {expandedEntries.has(index) && entry.details && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(entry.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditLogViewer;