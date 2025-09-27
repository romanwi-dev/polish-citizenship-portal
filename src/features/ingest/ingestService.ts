/**
 * Dropbox polling and ingest service
 */

import { dropboxClient, extractCaseCodeFromPath } from '@/lib/dropbox';
import { getMimeFromExtension, isAllowedMimeType } from '@/lib/mime';
import { hashBuffer } from '@/lib/hash';
import { guessSlots, guessCaseId } from './matchers';
import { isDuplicate, dedupeKeepLatest } from './dedupe';
import { useIngestStore, type IngestSuggestion } from './ingestStore';
import { useCaseStore } from '@/stores/caseStore';

class IngestService {
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
  
  constructor() {
    this.startPolling();
  }
  
  startPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    
    this.pollInterval = setInterval(() => {
      this.syncNow().catch(console.error);
    }, this.POLL_INTERVAL_MS);
    
    // Initial sync
    this.syncNow().catch(console.error);
  }
  
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  
  async syncNow(): Promise<void> {
    const { setSyncing, setLastSync, upsertSuggestions, queue } = useIngestStore.getState();
    const { cases } = useCaseStore.getState();
    
    setSyncing(true);
    
    try {
      const suggestions: IngestSuggestion[] = [];
      let cursor: string | undefined;
      
      do {
        const result = await dropboxClient.listFolder('/CASES', cursor);
        
        for (const entry of result.entries) {
          // Only process files, not folders
          if (entry.name.includes('.')) {
            const mimeType = getMimeFromExtension(entry.name);
            
            if (isAllowedMimeType(mimeType)) {
              try {
                // Download file to get hash
                const blob = await dropboxClient.downloadFile(entry.path_lower);
                const arrayBuffer = await blob.arrayBuffer();
                const sha256 = await hashBuffer(arrayBuffer);
                
                const suggestion: IngestSuggestion = {
                  id: `${entry.path_lower}_${entry.rev || entry.client_modified}`,
                  dropboxPath: entry.path_lower,
                  displayName: entry.name,
                  size: entry.size,
                  mime: mimeType,
                  sha256,
                  revisedAt: entry.client_modified,
                  guessedCaseId: guessCaseId(entry.path_lower, cases),
                  guessedSlots: guessSlots(entry.name, mimeType),
                  status: 'pending'
                };
                
                // Check if not duplicate
                if (!isDuplicate(suggestion, queue)) {
                  suggestions.push(suggestion);
                }
              } catch (error) {
                console.error(`Failed to process file ${entry.path_lower}:`, error);
              }
            }
          }
        }
        
        cursor = result.has_more ? result.cursor : undefined;
      } while (cursor);
      
      // Dedupe and upsert
      const dedupedSuggestions = dedupeKeepLatest(suggestions);
      upsertSuggestions(dedupedSuggestions);
      
      setLastSync(new Date().toISOString());
    } catch (error) {
      console.error('Ingest sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }
  
  async linkSuggestion(
    suggestionId: string,
    caseId: string,
    slotKey: string
  ): Promise<void> {
    const { markLinked, queue } = useIngestStore.getState();
    const { updateCase } = useCaseStore.getState();
    
    const suggestion = queue.find(s => s.id === suggestionId);
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }
    
    // Update case documents
    const caseData = useCaseStore.getState().caseById[caseId];
    if (caseData) {
      const updatedDocuments = {
        ...caseData.documents,
        [slotKey]: {
          ...caseData.documents?.[slotKey],
          attachment: {
            dropboxPath: suggestion.dropboxPath,
            sha256: suggestion.sha256,
            name: suggestion.displayName,
            size: suggestion.size,
            mime: suggestion.mime,
            linkedAt: new Date().toISOString()
          }
        }
      };
      
      updateCase(caseId, { documents: updatedDocuments });
    }
    
    // Mark as linked in ingest store
    markLinked(suggestionId, caseId, slotKey, 'system'); // TODO: Get actual user
    
    // API call to persist
    try {
      await fetch('/api/ingest/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, caseId, slotKey })
      });
    } catch (error) {
      console.error('Failed to persist link:', error);
      // TODO: Add rollback logic
    }
  }
  
  async ignoreSuggestion(suggestionId: string, reason: string): Promise<void> {
    const { markIgnored } = useIngestStore.getState();
    
    markIgnored(suggestionId, reason, 'system'); // TODO: Get actual user
    
    // API call to persist
    try {
      await fetch('/api/ingest/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, reason })
      });
    } catch (error) {
      console.error('Failed to persist ignore:', error);
    }
  }
}

export const ingestService = new IngestService();