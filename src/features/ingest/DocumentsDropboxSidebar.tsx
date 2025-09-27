/**
 * Dropbox ingest sidebar for Documents tab
 */

import React from 'react';
import { Eye, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useIngestStore } from './ingestStore';
import { getFileTypeIcon } from '@/lib/mime';
import { plDate } from '@/lib/dateFormat';
import { cn } from '@/lib/utils';

interface DocumentsDropboxSidebarProps {
  caseId: string;
  onReviewSuggestion: (suggestionId: string) => void;
}

export const DocumentsDropboxSidebar: React.FC<DocumentsDropboxSidebarProps> = ({ 
  caseId, 
  onReviewSuggestion 
}) => {
  const { getSuggestionsByCase } = useIngestStore();
  const suggestions = getSuggestionsByCase(caseId);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className="border-l border-[var(--pc-border)] pl-6 w-80">
      <div className="pc-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-[var(--pc-info)] animate-pulse" />
          <h3 className="font-semibold text-[var(--pc-text-primary)]">
            To Review (Dropbox)
          </h3>
          <span className="text-sm text-[var(--pc-text-dim)]">
            {suggestions.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {suggestions.slice(0, 5).map((suggestion) => (
            <div 
              key={suggestion.id}
              className="border border-[var(--pc-border)] rounded-lg p-3 hover:bg-[var(--pc-surface)]"
            >
              <div className="flex items-start gap-3">
                <div className="text-lg">{getFileTypeIcon(suggestion.mime)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[var(--pc-text-primary)] truncate">
                    {suggestion.displayName}
                  </div>
                  
                  <div className="text-xs text-[var(--pc-text-dim)] mt-1">
                    {(suggestion.size / 1024).toFixed(1)} KB • {plDate(suggestion.revisedAt)}
                  </div>
                  
                  {suggestion.guessedSlots[0] && (
                    <div className="text-xs text-[var(--pc-info)] mt-1">
                      Suggested: {suggestion.guessedSlots[0].key.replace('doc_', '')} 
                      ({Math.round(suggestion.guessedSlots[0].confidence * 100)}%)
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {suggestion.status === 'pending' && (
                    <Clock className="h-3 w-3 text-[var(--pc-warning)]" />
                  )}
                  {suggestion.status === 'linked' && (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  )}
                  {suggestion.status === 'error' && (
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  )}
                  
                  <button
                    onClick={() => onReviewSuggestion(suggestion.id)}
                    className="pc-btn pc-btn--ghost pc-btn--xs pc-btn--icon"
                    data-testid={`button-review-suggestion-${suggestion.id}`}
                  >
                    <Eye className="h-3 w-3" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {suggestions.length > 5 && (
            <div className="text-center pt-2">
              <div className="text-xs text-[var(--pc-text-dim)]">
                +{suggestions.length - 5} more suggestions
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--pc-border)]">
          <div className="text-xs text-[var(--pc-text-dim)]">
            Files auto-detected from Dropbox /CASES/** matching this case
          </div>
        </div>
      </div>
    </div>
  );
};