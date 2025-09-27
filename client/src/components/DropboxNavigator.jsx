import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function DropboxNavigator({ onFileSelect, onFolderSelect, initialPath = '/CASES' }) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [entries, setEntries] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Status query to check access level
  const { data: status } = useQuery({
    queryKey: ['/api/dropbox/status'],
    queryFn: async () => {
      const response = await fetch('/api/dropbox/status', {
        headers: { 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' }
      });
      if (!response.ok) throw new Error('Failed to get status');
      return response.json();
    },
    staleTime: 30000
  });

  // Folder listing query
  const { data: folderData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/dropbox/list', currentPath],
    queryFn: async () => {
      const response = await fetch(`/api/dropbox/list?path=${encodeURIComponent(currentPath)}`, {
        headers: { 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' }
      });
      if (!response.ok) throw new Error('Failed to list folder');
      return response.json();
    },
    enabled: status?.connected && status?.access === 'full',
    staleTime: 30000
  });

  // Update local state when new data arrives
  useEffect(() => {
    if (folderData && !folderData.error) {
      setEntries(folderData.entries || []);
      setCursor(folderData.cursor);
      setHasMore(folderData.has_more || false);
    }
  }, [folderData]);

  // Load more entries using continuation
  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/dropbox/list/continue?cursor=${encodeURIComponent(cursor)}`, {
        headers: { 'x-admin-token': import.meta.env.VITE_ADMIN_TOKEN || '' }
      });
      
      if (!response.ok) throw new Error('Failed to load more');
      
      const data = await response.json();
      setEntries(prev => [...prev, ...(data.entries || [])]);
      setCursor(data.cursor);
      setHasMore(data.has_more || false);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
    if (onFolderSelect) onFolderSelect(folderPath);
  };

  // Go up one level
  const goUp = () => {
    const parts = currentPath.split('/').filter(p => p);
    if (parts.length > 1) {
      const parentPath = '/' + parts.slice(0, -1).join('/');
      navigateToFolder(parentPath);
    } else if (parts.length === 1) {
      navigateToFolder('/');
    }
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(p => p);
    
    return (
      <div className="flex items-center space-x-2 text-sm text-zinc-600 mb-4" data-testid="breadcrumbs">
        <button 
          onClick={() => navigateToFolder('/CASES')}
          className="hover:text-zinc-900 underline font-medium"
          data-testid="button-root-nav"
        >
          CASES
        </button>
        {parts.slice(1).map((part, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-2">/</span>
            <button 
              onClick={() => navigateToFolder('/' + parts.slice(0, i + 2).join('/'))}
              className="hover:text-zinc-900 underline"
              data-testid={`button-breadcrumb-${part}`}
            >
              {part}
            </button>
          </span>
        ))}
      </div>
    );
  };

  // Show connection/access warnings
  if (!status?.connected) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl" data-testid="error-not-connected">
        <p className="text-red-800">⚠️ Dropbox not connected. Please connect your Dropbox account first.</p>
      </div>
    );
  }

  if (status?.access !== 'full') {
    return (
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl" data-testid="warning-limited-access">
        <p className="text-orange-800">
          ⚠️ App has limited Dropbox access. /CASES folder is not accessible. 
          Change access type to "Full Dropbox" and reconnect.
        </p>
      </div>
    );
  }

  if (folderData?.error === 'path_not_found_or_no_scope') {
    return (
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl" data-testid="error-path-not-found">
        <p className="text-orange-800">
          ⚠️ /CASES folder not found or not accessible. Please ensure the folder exists and you have access.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl" data-testid="error-loading">
        <p className="text-red-800">❌ Error loading folder: {error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm"
          data-testid="button-retry"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center" data-testid="loading-folder">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-zinc-600">Loading folder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderBreadcrumbs()}
      
      {/* Up button */}
      {currentPath !== '/CASES' && (
        <button 
          onClick={goUp}
          className="w-full text-left px-3 py-2 rounded-xl border hover:bg-zinc-50 text-zinc-600 flex items-center space-x-2"
          data-testid="button-up-level"
        >
          <span>📁</span>
          <span>.. (Up one level)</span>
        </button>
      )}

      {/* Entries list */}
      <div className="space-y-2" data-testid="entries-list">
        {entries.map((entry, index) => {
          const isFolder = entry['.tag'] === 'folder';
          const entryId = `${entry.path_lower}-${index}`;
          
          return (
            <div 
              key={entryId}
              className="w-full p-3 rounded-xl border hover:bg-zinc-50 flex items-center space-x-3 cursor-pointer"
              onClick={() => {
                if (isFolder) {
                  navigateToFolder(entry.path_lower);
                } else if (onFileSelect) {
                  onFileSelect(entry);
                }
              }}
              data-testid={`item-${entry.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
            >
              <span className="text-lg">{isFolder ? '📁' : '📄'}</span>
              <span className="flex-1 font-medium text-zinc-900">{entry.name}</span>
              {entry.size && (
                <span className="text-xs text-zinc-400">
                  ({Math.round(entry.size / 1024)}KB)
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {hasMore && (
        <button 
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full p-3 border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-600 hover:text-zinc-800 disabled:opacity-50"
          data-testid="button-load-more"
        >
          {loadingMore ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full"></div>
              <span>Loading more...</span>
            </div>
          ) : (
            `Load more (${cursor ? 'continue' : 'more entries available'})`
          )}
        </button>
      )}

      {/* Empty state */}
      {entries.length === 0 && !isLoading && (
        <div className="p-6 text-center text-zinc-500" data-testid="empty-folder">
          <span className="text-4xl mb-2 block">📁</span>
          <p>This folder is empty</p>
        </div>
      )}
    </div>
  );
}