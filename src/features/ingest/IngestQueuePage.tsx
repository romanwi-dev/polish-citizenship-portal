/**
 * Ingest Queue admin page - /admin/ingest
 */

import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Filter, Eye, Link2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useIngestStore } from './ingestStore';
import { ingestService } from './ingestService';
import { ReviewDrawer } from './ReviewDrawer';
import { getFileTypeIcon } from '@/lib/mime';
import { plDate } from '@/lib/dateFormat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const IngestQueuePage: React.FC = () => {
  const { toast } = useToast();
  const { 
    queue, 
    lastSyncAt, 
    isSyncing, 
    getPendingSuggestions 
  } = useIngestStore();
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'linked' | 'ignored'>('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Filtered suggestions
  const filteredSuggestions = useMemo(() => {
    let filtered = queue;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.displayName.toLowerCase().includes(term) ||
        s.dropboxPath.toLowerCase().includes(term) ||
        s.guessedCaseId?.toLowerCase().includes(term)
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.revisedAt).getTime() - new Date(a.revisedAt).getTime()
    );
  }, [queue, statusFilter, searchTerm]);
  
  const handleSyncNow = async () => {
    try {
      await ingestService.syncNow();
      toast({
        title: "Sync Complete",
        description: "Dropbox folders scanned successfully"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to scan Dropbox folders",
        variant: "destructive"
      });
    }
  };
  
  const handleQuickLink = async (suggestion: typeof queue[0]) => {
    if (!suggestion.guessedCaseId || !suggestion.guessedSlots[0]) return;
    
    try {
      await ingestService.linkSuggestion(
        suggestion.id,
        suggestion.guessedCaseId,
        suggestion.guessedSlots[0].key
      );
      
      toast({
        title: "File Linked",
        description: `${suggestion.displayName} linked successfully`
      });
    } catch (error) {
      toast({
        title: "Link Failed",
        description: "Failed to link file",
        variant: "destructive"
      });
    }
  };
  
  const handleQuickIgnore = async (suggestion: typeof queue[0]) => {
    try {
      await ingestService.ignoreSuggestion(suggestion.id, 'Quick ignore');
      
      toast({
        title: "File Ignored",
        description: `${suggestion.displayName} ignored`
      });
    } catch (error) {
      toast({
        title: "Ignore Failed", 
        description: "Failed to ignore file",
        variant: "destructive"
      });
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'linked': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'ignored': return <X className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-blue-500" />;
    }
  };
  
  return (
    <section id="ingest-queue" className="portal-scope">
      <div className="min-h-screen bg-[var(--pc-surface)] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--pc-text-primary)]">
                Dropbox Ingest Queue
              </h1>
              <p className="text-[var(--pc-text-dim)]">
                Review and link files from Dropbox /CASES/**
              </p>
            </div>
            
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className={cn(
                'pc-btn pc-btn--primary pc-btn--icon',
                isSyncing && 'opacity-50 cursor-not-allowed'
              )}
              data-testid="button-sync-now"
            >
              <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
              Sync Now
            </button>
          </div>
          
          {/* Controls */}
          <div className="pc-card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--pc-text-dim)]" />
                <input
                  type="text"
                  placeholder="Search files, paths, or cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[var(--pc-border)] rounded-lg 
                           bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                           focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
                  data-testid="input-search"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--pc-text-dim)]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                           bg-[var(--pc-card)] text-[var(--pc-text-primary)]"
                  data-testid="select-status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="linked">Linked</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--pc-text-dim)]">
              <div>
                {filteredSuggestions.length} of {queue.length} files
                {statusFilter !== 'all' && ` (${statusFilter})`}
              </div>
              <div>
                Last sync: {lastSyncAt ? plDate(lastSyncAt) : 'Never'}
              </div>
            </div>
          </div>
          
          {/* Queue Table */}
          <div className="pc-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--pc-border)]">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">File</th>
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">Path</th>
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">Size</th>
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">Modified</th>
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">Guess</th>
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">Status</th>
                    <th className="p-4 font-medium text-[var(--pc-text-primary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuggestions.map((suggestion) => (
                    <tr 
                      key={suggestion.id}
                      className="border-b border-[var(--pc-border)] hover:bg-[var(--pc-surface)]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getFileTypeIcon(suggestion.mime)}</span>
                          <div>
                            <div className="font-medium text-[var(--pc-text-primary)]">
                              {suggestion.displayName}
                            </div>
                            <div className="text-sm text-[var(--pc-text-dim)]">
                              {suggestion.mime}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[var(--pc-text-dim)] font-mono max-w-xs truncate">
                          {suggestion.dropboxPath}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--pc-text-dim)]">
                        {(suggestion.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="p-4 text-sm text-[var(--pc-text-dim)]">
                        {plDate(suggestion.revisedAt)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {suggestion.guessedCaseId && (
                            <div className="text-[var(--pc-text-primary)] font-medium">
                              Case: {suggestion.guessedCaseId}
                            </div>
                          )}
                          {suggestion.guessedSlots[0] && (
                            <div className="text-[var(--pc-text-dim)]">
                              {suggestion.guessedSlots[0].key} ({Math.round(suggestion.guessedSlots[0].confidence * 100)}%)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(suggestion.status)}
                          <span className="text-sm capitalize text-[var(--pc-text-dim)]">
                            {suggestion.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSuggestion(suggestion.id)}
                            className="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                            data-testid={`button-review-${suggestion.id}`}
                          >
                            <Eye className="h-3 w-3" />
                            Review
                          </button>
                          
                          {suggestion.status === 'pending' && suggestion.guessedCaseId && suggestion.guessedSlots[0] && (
                            <button
                              onClick={() => handleQuickLink(suggestion)}
                              className="pc-btn pc-btn--primary pc-btn--sm pc-btn--icon"
                              data-testid={`button-quick-link-${suggestion.id}`}
                            >
                              <Link2 className="h-3 w-3" />
                              Link
                            </button>
                          )}
                          
                          {suggestion.status === 'pending' && (
                            <button
                              onClick={() => handleQuickIgnore(suggestion)}
                              className="pc-btn pc-btn--danger pc-btn--sm pc-btn--icon"
                              data-testid={`button-quick-ignore-${suggestion.id}`}
                            >
                              <X className="h-3 w-3" />
                              Ignore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredSuggestions.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-[var(--pc-text-dim)] text-lg mb-2">📂</div>
                  <div className="text-[var(--pc-text-primary)] font-medium">No files found</div>
                  <div className="text-[var(--pc-text-dim)] text-sm">
                    {queue.length === 0 
                      ? 'No files in Dropbox queue' 
                      : 'Try adjusting your search or filters'
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Drawer */}
      {selectedSuggestion && (
        <ReviewDrawer
          suggestionId={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
        />
      )}
    </section>
  );
};