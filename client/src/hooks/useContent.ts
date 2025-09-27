import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export interface ContentItem {
  id: string;
  section: string;
  key: string;
  type: 'text' | 'textarea' | 'url' | 'icon';
  value: string;
  label: string;
  description?: string;
}

export function useContent(key?: string) {
  return useQuery({
    queryKey: key ? ['/api/content', key] : ['/api/admin/content'],
    queryFn: async () => {
      if (key) {
        const response = await fetch(`/api/content/${key}`);
        if (!response.ok) {
          throw new Error('Content not found');
        }
        return response.json();
      } else {
        const response = await fetch('/api/admin/content');
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        return response.json();
      }
    },
    retry: 1,
    staleTime: 30000 // Cache for 30 seconds
  });
}

export function useContentBySection(section: string) {
  return useQuery({
    queryKey: ['/api/admin/content/section', section],
    queryFn: async () => {
      const response = await fetch(`/api/admin/content/section/${section}`);
      if (!response.ok) {
        throw new Error('Failed to fetch section content');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 30000
  });
}

// Public version for fetching content by section (no auth required)
export function usePublicContentBySection(section: string) {
  return useQuery({
    queryKey: ['/api/content/section', section],
    queryFn: async () => {
      const response = await fetch(`/api/content/section/${section}`);
      if (!response.ok) {
        throw new Error('Failed to fetch section content');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 30000
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: ContentItem) => {
      const response = await apiRequest("PUT", `/api/admin/content/${item.id}`, item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<ContentItem, 'id'>) => {
      const response = await apiRequest("POST", "/api/admin/content", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    },
  });
}

export function useCreateDefaultContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/content/bulk", {
        operation: 'create_defaults'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    },
  });
}

// Utility hook to get content value by key with fallback
export function useContentValue(key: string, fallback: string = '') {
  const { data } = useContent(key);
  return data?.value || fallback;
}

// ===== JSON-BASED EDITING SYSTEM =====

interface EditableContentData {
  [key: string]: string;
}

interface UseEditableContentOptions {
  pageId?: string;
}

export function useEditableContent(options: UseEditableContentOptions = {}) {
  const { pageId = 'default' } = options;
  const queryClient = useQueryClient();

  // Query to fetch JSON-based content for editing
  const {
    data: content = {},
    isLoading,
    error
  } = useQuery<EditableContentData>({
    queryKey: ['editable-content', pageId],
    queryFn: async () => {
      // For homepage, use the section endpoint
      const url = pageId === 'homepage' 
        ? `/api/content/section/${pageId}`
        : `/api/content/${pageId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          // Return empty object if page content doesn't exist yet
          return {};
        }
        throw new Error('Failed to fetch content');
      }
      return response.json();
    }
  });

  // Mutation to update JSON-based content
  const updateContentMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await apiRequest('PUT', `/api/content/${pageId}`, {
        key,
        value
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch content
      queryClient.invalidateQueries({ queryKey: ['editable-content', pageId] });
      toast({
        title: "Content updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving content",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Helper function to get content by key with fallback
  // Use ?? to preserve empty strings (|| would treat empty string as falsy)
  const getContent = (key: string, fallback: string = ''): string => {
    return content[key] ?? fallback;
  };

  // Helper function to update content
  const updateContent = (key: string, value: string) => {
    updateContentMutation.mutate({ key, value });
  };

  return {
    content,
    isLoading,
    error,
    getContent,
    updateContent,
    isUpdating: updateContentMutation.isPending,
    updateError: updateContentMutation.error,
    isUpdateError: updateContentMutation.isError
  };
}