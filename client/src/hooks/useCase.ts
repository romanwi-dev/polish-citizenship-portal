import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCaseById, CaseData } from '@/lib/api';

interface UseCaseResult {
  caseData: CaseData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  updateLocal: (patch: Partial<CaseData>) => void;
}

// Cache for cases to avoid flicker when returning from list
const caseCache = new Map<string, CaseData>();

export function useCase(id: string): UseCaseResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    data: caseData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        const result = await getCaseById(id);
        
        // Cache the result
        caseCache.set(id, result);
        
        return result;
      } catch (error: any) {
        // Distinguish between 404 and other errors
        if (error.message.includes('404')) {
          const notFoundError = new Error('Case not found');
          (notFoundError as any).status = 404;
          throw notFoundError;
        }
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    initialData: () => caseCache.get(id),
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const updateLocal = useCallback((patch: Partial<CaseData>) => {
    if (!caseData) return;
    
    const updated = { ...caseData, ...patch };
    
    // Update cache
    caseCache.set(id, updated);
    
    // Update query cache
    queryClient.setQueryData(['case', id], updated);
    
    // Also update cases list cache if it exists
    queryClient.setQueryData(['cases'], (oldCases: CaseData[] | undefined) => {
      if (!oldCases) return oldCases;
      return oldCases.map(c => c.id === id ? updated : c);
    });
  }, [caseData, id, queryClient]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    caseData: caseData || null,
    isLoading,
    error: error as Error | null,
    refresh,
    updateLocal,
  };
}