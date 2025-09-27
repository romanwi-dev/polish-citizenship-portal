import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Plus, FileCheck } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { CardsProvider, useCardsContext } from '@/components/cases/CardsProvider';
import { CaseCardCanonical } from '@/components/cards/CaseCardCanonical';
import { CaseData } from '@/lib/api';
import EditCasePanelV2 from '@/components/cases/EditCasePanelV2';
import { cn } from '@/lib/utils';

// ActionButton component for unified styling (same as Case Processing section)
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
      duration: 0.6,
      ease: "easeOut"
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
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
  },
};

// Optimized data transformation function (unified with canonical structure)
function transformApiData(apiData: any[]): CaseData[] {
  const currentTime = Date.now();
  return apiData.map(dbCase => {
    const createdAt = dbCase.created_at ? new Date(dbCase.created_at).getTime() : currentTime;
    const ageMonths = Math.max(1, Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24 * 30)));
    const confidence = dbCase.confidence ? parseInt(dbCase.confidence) : 0;
    
    return {
      id: dbCase.caseId || dbCase.id.toString(),
      name: dbCase.caseManager || `Client ${dbCase.caseId}`,
      email: dbCase.client_email || 'No email',
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
    case 'vip': return 'VIP';
    case 'expedited': return 'GLOBAL';
    case 'standard': return 'STANDARD';
    default: return 'BASIC';
  }
}

function CasesGridContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const {
    openId,
    mode,
    editorOpen,
    openEditor,
    closeEditor
  } = useCardsContext();

  // Fetch cases data with optimized caching
  const { data: apiData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/cases'],
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const cases = useMemo(() => {
    if (!apiData?.cases) return [];
    return transformApiData(apiData.cases);
  }, [apiData?.cases]);

  const currentCase = useMemo(() => {
    return cases.find(c => c.id === openId) || null;
  }, [cases, openId]);

  // Virtualization for large lists (>30 items for better performance)
  const parentRef = React.useRef<HTMLDivElement>(null);
  const shouldVirtualize = cases.length > 30;

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? Math.ceil(cases.length / getColumnsCount()) : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Estimated row height
    overscan: 2,
    enabled: shouldVirtualize,
  });

  function getColumnsCount() {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1; // Mobile
    if (window.innerWidth < 1200) return 2; // Tablet
    return 3; // Desktop
  }

  const handleCaseEdit = useCallback((caseId: string) => {
    openEditor(caseId);
  }, [openEditor]);

  const handleMenuAction = useCallback((action: string, caseId: string) => {
    switch (action) {
      case 'edit':
        openEditor(caseId);
        break;
      case 'view':
        setLocation(`/admin/cases/${caseId}`);
        break;
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
        toast({
          title: 'Cancelled',
          description: `Case ${caseId} has been cancelled`,
          variant: 'destructive',
        });
        break;
      case 'archive':
        toast({
          title: 'Archived',
          description: `Case ${caseId} has been archived`,
        });
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete case ${caseId}? This action cannot be undone.`)) {
          toast({
            title: 'Deleted',
            description: `Case ${caseId} has been deleted`,
            variant: 'destructive',
          });
        }
        break;
    }
  }, [openEditor, setLocation, toast, queryClient]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshed',
      description: 'Case data has been refreshed',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Exporting all cases...',
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-destructive mb-4">Failed to load cases</p>
          <ActionButton onClick={() => refetch()} variant="primary" className="transition-all duration-200 hover:scale-105">
            Try Again
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-8">
      {/* Top Button Row - Horizontal Scroll (Match Case Processing exactly) */}
      <div className="w-full overflow-x-auto overflow-y-hidden mb-8">
        <div 
          className="flex items-center gap-3 min-w-max px-4" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <ActionButton
            onClick={handleRefresh}
            disabled={isLoading}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-refresh-cases"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </ActionButton>
          
          <ActionButton
            onClick={handleExport}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-export-cases"
          >
            <Download className="h-4 w-4" />
            Export
          </ActionButton>

          <ActionButton
            onClick={() => toast({ title: 'Add Case', description: 'Add new case functionality coming soon' })}
            variant="primary"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-add-case"
          >
            <Plus className="h-4 w-4" />
            Add Case
          </ActionButton>
        </div>
      </div>

      {/* Header - Center Title (Match Case Processing exactly) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Case Management
        </h1>
        <div className="text-base text-muted-foreground mt-2 font-medium">
          {cases.length > 0 && `${cases.length} cases`}
          {isLoading && (
            <span className="ml-2">
              <div className="inline-block w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </span>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 overflow-x-hidden mt-8">
        {/* Cases Grid */}
        <div className="w-full">
          {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-fit-cards">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[280px] glass-card border border-border/30 rounded-xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted/70 rounded w-2/3" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted/70 rounded" />
                <div className="h-4 bg-muted/70 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No cases found</p>
          <ActionButton onClick={handleRefresh} variant="primary" className="transition-all duration-200 hover:scale-105">
            Refresh
          </ActionButton>
        </div>
      ) : (
        <div
          ref={parentRef}
          className={cn(
            shouldVirtualize ? "h-[600px] overflow-auto" : "",
            "w-full"
          )}
          style={{
            touchAction: 'manipulation',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {shouldVirtualize ? (
            // Virtualized grid for large lists
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * getColumnsCount();
                const rowCases = cases.slice(startIndex, startIndex + getColumnsCount());
                
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-1 auto-fit-cards">
                      {rowCases.map((caseItem) => (
                        <CaseCardCanonical
                          key={caseItem.id}
                          case={caseItem}
                          onAction={handleMenuAction}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Regular grid for smaller lists
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-fit-cards"
            >
              {cases.map((caseItem) => (
                <motion.div key={caseItem.id} variants={itemVariants}>
                  <CaseCardCanonical
                    case={caseItem}
                    onAction={handleMenuAction}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
        </div>

        {/* Desktop Edit Modal (rendered via portal) */}
        {mode === 'desktop' && (
          <EditCasePanelV2
            isOpen={editorOpen}
            caseData={currentCase}
            mode="desktop"
            onClose={closeEditor}
          />
        )}
      </div>

      {/* Mobile Edit Panel */}
      {mode === 'mobile' && (
        <EditCasePanelV2
          isOpen={editorOpen}
          caseData={currentCase}
          mode={mode}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}

export default function CasesGridV2() {
  return (
    <CardsProvider>
      <CasesGridContent />
    </CardsProvider>
  );
}