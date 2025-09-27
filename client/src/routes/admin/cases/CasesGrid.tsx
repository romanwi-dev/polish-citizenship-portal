import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { RefreshCw, Plus, Search } from 'lucide-react';
import { CaseCard } from './CaseCard';
import { getCases, CaseData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCaseStore } from '@/stores/caseStore';
import { cn } from '@/lib/utils';
import '@/styles/tokens.css';

interface CasesGridProps {
  className?: string;
}

export const CasesGrid: React.FC<CasesGridProps> = ({ className }) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { hydrateList } = useCaseStore();

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/cases'],
    queryFn: getCases,
    staleTime: 30000, // 30 seconds
  });

  // Hydrate the case store when data changes
  React.useEffect(() => {
    if (cases && cases.length > 0) {
      hydrateList(cases);
    }
  }, [cases, hydrateList]);

  const filteredCases = useMemo(() => {
    if (!searchTerm) return cases;
    
    const term = searchTerm.toLowerCase();
    return cases.filter(caseData => 
      caseData.name.toLowerCase().includes(term) ||
      caseData.email.toLowerCase().includes(term) ||
      caseData.id.toLowerCase().includes(term) ||
      caseData.stage.toLowerCase().includes(term)
    );
  }, [cases, searchTerm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Cases Updated",
        description: "Cases list has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed", 
        description: "Failed to refresh cases list.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCaseAction = (action: string, caseId: string) => {
    switch (action) {
      case 'view':
        navigate(`/agent/${caseId}?tab=overview`);
        break;
      case 'edit':
        // Edit is handled by the card component itself
        break;
      case 'deleted':
        // Case was deleted, refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/cases'] });
        break;
      case 'updated':
        // Case was updated, refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/cases'] });
        break;
      default:
        toast({
          title: `${action.charAt(0).toUpperCase() + action.slice(1)} Action`,
          description: `${action} action for case ${caseId} - Feature coming soon`,
        });
        break;
    }
  };

  if (error) {
    return (
      <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center max-w-md">
          <div className="text-[var(--pc-danger)] text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Cases
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Unable to fetch cases from the server. Please try again.
          </p>
          <button
            onClick={handleRefresh}
            className="pc-btn pc-btn--primary pc-btn--icon"
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-0 md:px-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SPRAWY</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isLoading ? 'Loading...' : `${filteredCases.length} cases`}
            {searchTerm && ` (filtered from ${cases.length})`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="pc-btn pc-btn--ghost pc-btn--icon"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", (refreshing || isLoading) && "animate-spin")} />
            Refresh
          </button>
          
          <button className="pc-btn pc-btn--primary pc-btn--icon">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md px-0 md:px-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
          style={{ fontSize: '16px' }} // Prevent iOS zoom
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-0 md:px-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="text-center space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cases Grid */}
      {!isLoading && (
        <>
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-12 text-center">
              {searchTerm ? (
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Cases Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No cases match your search criteria. Try adjusting your search.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="pc-btn pc-btn--ghost"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Cases Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Get started by creating your first case.
                  </p>
                  <button className="pc-btn pc-btn--primary pc-btn--icon">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Case
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-0 md:px-0">
              {filteredCases.map((caseData) => (
                <CaseCard
                  key={caseData.id}
                  case={caseData}
                  onAction={handleCaseAction}
                  className="w-full max-w-none mx-0"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};