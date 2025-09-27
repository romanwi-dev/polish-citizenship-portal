import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Plus, FileCheck } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { CaseCardCanonical } from '@/components/cards/CaseCardCanonical';
import { CaseData } from '@/lib/api';
import EditPanelV3 from '@/components/cases/EditPanelV3';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Use unified Button component instead of local Button

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Transform API data to CaseData format (unified with canonical structure)
function transformApiData(apiData: any[]): CaseData[] {
  const currentTime = Date.now();
  return apiData.map(dbCase => {
    const createdAt = dbCase.created_at ? new Date(dbCase.created_at).getTime() : currentTime;
    const ageMonths = Math.max(1, Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24 * 30)));
    
    // Parse confidence percentage
    const confidenceStr = dbCase.confidence || "0%";
    const confidence = parseInt(confidenceStr.replace('%', ''));
    
    // Use caseManager as the display name
    const displayName = dbCase.caseManager || `Case ${dbCase.caseId || dbCase.id}`;
    
    return {
      id: dbCase.caseId || dbCase.id.toString(),
      name: displayName,
      email: dbCase.client_email || dbCase.client?.email || 'No email',
      stage: dbCase.status || 'intake',
      tier: mapTier(dbCase.serviceLevel || 'standard'),
      score: dbCase.progress || confidence || 0,
      ageMonths,
      updatedAt: dbCase.updated_at || dbCase.created_at || new Date().toISOString(),
      createdAt: dbCase.created_at || new Date().toISOString(),
      processing: dbCase.serviceLevel || 'standard',
      state: dbCase.status || 'intake'
    };
  });
}

function mapTier(processing: string): 'VIP' | 'GLOBAL' | 'STANDARD' | 'BASIC' {
  switch (processing.toLowerCase()) {
    case 'vip+':
    case 'vip': return 'VIP';
    case 'expedited': return 'GLOBAL';
    case 'standard': return 'STANDARD';
    default: return 'BASIC';
  }
}

export default function CasesGridV3() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State management
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [mode, setMode] = useState<'mobile' | 'desktop'>('desktop');
  const [deletingCases, setDeletingCases] = useState<Set<string>>(new Set());

  // Detect screen size for responsive behavior
  useEffect(() => {
    const updateMode = () => {
      setMode(window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop');
    };

    updateMode();
    window.addEventListener('resize', updateMode);
    return () => window.removeEventListener('resize', updateMode);
  }, []);

  // Fetch cases data
  const { data: apiData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/cases'],
    staleTime: 0, // Allow immediate refetching
    gcTime: 5 * 60 * 1000, // 5 minutes (v5 syntax)
  });

  const cases = useMemo(() => {
    if (!apiData?.cases) return [];
    const allCases = transformApiData(apiData.cases);
    // Filter out cases that are being deleted for instant UI feedback
    return allCases.filter(caseItem => !deletingCases.has(caseItem.id));
  }, [apiData?.cases, deletingCases]);

  const currentCase = useMemo(() => {
    return cases.find(c => c.id === editingCaseId) || null;
  }, [cases, editingCaseId]);

  // Event handlers
  const handleEdit = useCallback((caseId: string) => {
    console.log('Grid edit triggered for case:', caseId, 'Mode:', mode);
    setEditingCaseId(caseId);
  }, [mode]);

  const handleView = useCallback((caseId: string) => {
    setLocation(`/agent/${caseId}?tab=overview`);
  }, [setLocation]);

  const handleCloseEdit = useCallback(() => {
    setEditingCaseId(null);
  }, []);

  const handleCaseAction = useCallback((action: string, caseId: string) => {
    console.log('handleCaseAction called with:', action, caseId);
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(caseId);
        toast({
          title: 'Copied',
          description: 'Case ID copied to clipboard',
        });
        break;
        
      case 'export':
        toast({
          title: 'Export',
          description: `Exporting case ${caseId}`,
        });
        break;
        
      case 'view':
        console.log('View action triggered for case:', caseId);
        setLocation(`/agent/${caseId}?tab=overview`);
        break;
        
      case 'edit':
        console.log('Edit action triggered for case:', caseId);
        handleEdit(caseId);
        break;
        
      case 'postpone':
        toast({
          title: 'Postponed',
          description: `Case ${caseId} has been postponed`,
        });
        break;
        
      case 'suspend':
        toast({
          title: 'Suspended',
          description: `Case ${caseId} has been suspended`,
          variant: 'destructive',
        });
        break;
        
      case 'cancel':
        if (confirm(`Are you sure you want to cancel case ${caseId}?`)) {
          toast({
            title: 'Cancelled',
            description: `Case ${caseId} has been cancelled`,
            variant: 'destructive',
          });
        }
        break;
        
      case 'archive':
        toast({
          title: 'Archived',
          description: `Case ${caseId} has been archived`,
        });
        break;
        
      case 'delete':
        console.log('Delete action triggered for case:', caseId);
        const confirmDelete = confirm(`Are you sure you want to delete case ${caseId}? This action cannot be undone.`);
        console.log('Delete confirmation result:', confirmDelete);
        
        if (confirmDelete) {
          // 1. INSTANT UI UPDATE - Remove from display immediately
          setDeletingCases(prev => new Set([...prev, caseId]));
          console.log('Case removed from UI immediately:', caseId);
          
          // 2. Show optimistic success message
          toast({
            title: 'Deleting...',
            description: `Removing case ${caseId}`,
          });
          
          // 3. Make API call in background
          console.log('Making DELETE API call to:', `/api/admin/case/${caseId}`);
          fetch(`/api/admin/case/${caseId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then(response => {
            console.log('Delete API response status:', response.status);
            if (response.ok) {
              console.log('Delete confirmed on server');
              // Refresh data in background
              refetch();
              toast({
                title: 'Deleted',
                description: `Case ${caseId} has been deleted successfully`,
                variant: 'destructive',
              });
            } else {
              // Restore case on failure
              setDeletingCases(prev => {
                const newSet = new Set(prev);
                newSet.delete(caseId);
                return newSet;
              });
              throw new Error(`Failed to delete case - HTTP ${response.status}`);
            }
          })
          .catch(error => {
            console.error('Delete case failed:', error);
            // Restore case on failure
            setDeletingCases(prev => {
              const newSet = new Set(prev);
              newSet.delete(caseId);
              return newSet;
            });
            toast({
              title: 'Delete Failed',
              description: `Failed to delete case ${caseId}`,
              variant: 'destructive',
            });
          });
        }
        break;
        
      case 'control_room':
        // Navigate to canonical agent route
        console.log('Navigating to case view for case:', caseId);
        setLocation(`/agent/${caseId}?tab=overview`);
        toast({
          title: 'Redirecting',
          description: `Opening case view for case ${caseId}`,
        });
        break;
        
      case 'draft_oby':
        // Navigate to case view with CAP tab
        console.log('Navigating to CAP tab for case:', caseId);
        setLocation(`/agent/${caseId}?tab=cap`);
        toast({
          title: 'Draft OBY',
          description: `Opening CAP for case ${caseId}`,
        });
        break;
        
      case 'create_usc_task':
        // Navigate to case view with Tasks tab
        console.log('Navigating to Tasks tab for case:', caseId);
        setLocation(`/agent/${caseId}?tab=tasks`);
        toast({
          title: 'USC Task',
          description: `Opening tasks for case ${caseId}`,
        });
        break;
        
      default:
        console.warn(`Unhandled action: ${action} for case: ${caseId}`);
    }
  }, [toast, setLocation, refetch]);

  const handleRefresh = useCallback(async () => {
    try {
      console.log('Manual refresh triggered');
      
      // Force aggressive cache invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cases'] });
      queryClient.refetchQueries({ queryKey: ['/api/admin/cases'] });
      await refetch();
      
      console.log('Manual refresh completed');
      
      toast({
        title: 'Cases Refreshed',
        description: 'Successfully updated case data',
      });
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh case data',
        variant: 'destructive',
      });
    }
  }, [refetch, queryClient, toast]);

  const handleExport = useCallback(() => {
    try {
      
      // Create CSV content
      const headers = ['Case ID', 'Client Name', 'Email', 'Stage', 'Processing Tier', 'Difficulty', 'Score', 'Age (Months)', 'Lineage', 'HAC Status'];
      const csvContent = [
        headers.join(','),
        ...cases.map(caseItem => [
          caseItem.id,
          `"${caseItem.client.name}"`,
          caseItem.client.email,
          caseItem.state,
          caseItem.processing,
          caseItem.difficulty || 'N/A',
          caseItem.clientScore || 'N/A',
          caseItem.ageMonths,
          `"${caseItem.lineage}"`,
          caseItem.confidence && caseItem.confidence > 80 ? 'GREEN' : 'RED'
        ].join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cases_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Complete',
        description: `Successfully exported ${cases.length} cases to CSV`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export cases data',
        variant: 'destructive',
      });
    }
  }, [cases, toast]);

  const handleAddCase = useCallback(() => {
    // Navigate to cases page since /agent now requires case ID
    setLocation('/admin/cases');
    
    toast({
      title: 'Info',
      description: 'To open Control Room, select a specific case',
    });
  }, [setLocation, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">Failed to load cases</p>
          <Button onClick={handleRefresh} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8 pt-8">
        {/* Top Action Buttons */}
        <div className="w-full overflow-x-auto overflow-y-hidden mb-6">
          <div 
            className="flex items-center gap-3 min-w-max px-4" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-refresh-cases"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
            
            <Button
              onClick={handleExport}
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-export-cases"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              onClick={handleAddCase}
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-add-case"
            >
              <Plus className="h-4 w-4" />
              Add Case
            </Button>
          </div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Case Management
          </h1>
          <div className="text-lg text-muted-foreground mt-2 font-medium">
            {cases.length > 0 && `${cases.length} active cases`}
            {isLoading && (
              <span className="ml-2 inline-flex items-center">
                <div className="w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
              </span>
            )}
          </div>
        </motion.div>

        {/* Cases Grid */}
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6">
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : cases.length === 0 ? (
            // Empty state
            <div className="text-center py-16">
              <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-4">No cases found</p>
              <Button onClick={handleRefresh} variant="primary">
                Refresh Cases
              </Button>
            </div>
          ) : (
            // Cases grid with mobile-first responsive layout
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "grid gap-4 md:gap-6",
                // Mobile: single column with tighter spacing
                "grid-cols-1",
                // Desktop: two columns max for better readability
                "lg:grid-cols-2",
                // Remove auto-rows-fr to allow natural height
                "place-items-stretch"
              )}
              style={{
                touchAction: 'manipulation',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {cases.map((caseItem) => (
                <motion.div key={caseItem.id} variants={itemVariants}>
                  <CaseCardCanonical
                    case={caseItem}
                    onAction={handleCaseAction}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Panel */}
      <EditPanelV3
        isOpen={!!editingCaseId}
        caseData={currentCase}
        mode={mode}
        onClose={handleCloseEdit}
        onSave={(updatedCase) => {
          // Optional callback when case is saved
          console.log('Case saved:', updatedCase);
        }}
      />
    </div>
  );
}