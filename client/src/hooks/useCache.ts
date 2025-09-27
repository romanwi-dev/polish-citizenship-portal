// Hooks for using the caching system

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Temporarily disable cache imports due to export issues
// import { SessionCache, LocalCache, ApiCache } from '@/utils/cache-manager';
import { useCallback } from 'react';

// Hook for cached API requests
export function useCachedQuery<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options?: {
    cacheTime?: number;
    staleTime?: number;
    useLocalCache?: boolean;
  }
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Cache temporarily disabled
      // if (options?.useLocalCache) {
      //   const cached = LocalCache.get<T>(queryKey.join(':'));
      //   if (cached) {
      //     return cached;
      //   }
      // }
      
      // Fetch fresh data
      const data = await fetcher();
      
      // Cache storage temporarily disabled
      // if (options?.useLocalCache) {
      //   LocalCache.set(queryKey.join(':'), data, options.cacheTime);
      // }
      
      return data;
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes default
  });
}

// Hook for session-cached data - temporarily disabled
export function useSessionCache<T>(key: string, defaultValue?: T) {
  const get = useCallback(() => {
    return defaultValue;
    // return SessionCache.get<T>(key) || defaultValue;
  }, [key, defaultValue]);
  
  const set = useCallback((value: T, ttl?: number) => {
    // SessionCache.set(key, value, ttl);
  }, [key]);
  
  const remove = useCallback(() => {
    // SessionCache.remove(key);
  }, [key]);
  
  return { get, set, remove };
}

// Hook for local storage with persistence - temporarily disabled
export function useLocalCache<T>(key: string, defaultValue?: T) {
  const get = useCallback(() => {
    return defaultValue;
    // return LocalCache.get<T>(key) || defaultValue;
  }, [key, defaultValue]);
  
  const set = useCallback((value: T, ttl?: number) => {
    // LocalCache.set(key, value, ttl);
  }, [key]);
  
  const remove = useCallback(() => {
    // LocalCache.remove(key);
  }, [key]);
  
  return { get, set, remove };
}

// Hook for cache invalidation
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  const invalidateQuery = useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);
  
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
    // SessionCache.clear();
    // ApiCache.invalidate();
  }, [queryClient]);
  
  const invalidatePattern = useCallback((pattern: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey.join(':');
        return key.includes(pattern);
      },
    });
    // ApiCache.invalidate(pattern);
  }, [queryClient]);
  
  return { invalidateQuery, invalidateAll, invalidatePattern };
}

// Hook for optimistic updates with caching
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onMutate?: (variables: TVariables) => void | Promise<unknown>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateKeys?: string[][];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing queries
      if (options?.invalidateKeys) {
        await Promise.all(
          options.invalidateKeys.map(key => 
            queryClient.cancelQueries({ queryKey: key })
          )
        );
      }
      
      if (options?.onMutate) {
        await options.onMutate(variables);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: options?.onError,
  });
}