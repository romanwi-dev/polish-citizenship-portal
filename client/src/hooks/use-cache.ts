// Custom React hooks for caching
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { cacheManager } from '@/utils/cache-manager';

// Hook for cached API calls
export function useCachedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Check cache first
      const cached = await cacheManager.api.get(queryKey.join('/'));
      if (cached) {
        return cached as T;
      }
      
      // Fetch fresh data
      const data = await queryFn();
      
      // Cache the result
      await cacheManager.api.set(queryKey.join('/'), data);
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options
  });
}

// Hook for session-cached data
export function useSessionCache<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const cached = cacheManager.session.get<T>(key) ?? defaultValue;
  
  const setValue = (value: T) => {
    cacheManager.session.set(key, value);
  };
  
  return [cached, setValue];
}

// Hook for local storage cache
export function useLocalCache<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const cached = cacheManager.local.get<T>(key) ?? defaultValue;
  
  const setValue = (value: T) => {
    cacheManager.local.set(key, value);
  };
  
  return [cached, setValue];
}