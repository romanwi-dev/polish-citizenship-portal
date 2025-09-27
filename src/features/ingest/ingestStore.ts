/**
 * Zustand store for ingest queue state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface IngestSuggestion {
  id: string;
  dropboxPath: string;
  displayName: string;
  size: number;
  mime: string;
  sha256: string;
  revisedAt: string;
  guessedCaseId?: string;
  guessedSlots: Array<{key: string; confidence: number}>;
  status: 'pending' | 'linked' | 'ignored' | 'error';
  notes?: string;
}

export interface IngestAudit {
  id: string;
  action: 'linked' | 'ignored' | 'new-case';
  caseId?: string;
  slotKey?: string;
  dropboxPath: string;
  sha256: string;
  at: string;
  by: string;
  reason?: string;
}

interface IngestState {
  queue: IngestSuggestion[];
  audit: IngestAudit[];
  lastSyncAt: string | null;
  isSyncing: boolean;
  
  // Actions
  upsertSuggestions: (suggestions: IngestSuggestion[]) => void;
  markLinked: (id: string, caseId: string, slotKey: string, by: string) => void;
  markIgnored: (id: string, reason: string, by: string) => void;
  updateSuggestion: (id: string, updates: Partial<IngestSuggestion>) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (timestamp: string) => void;
  clearQueue: () => void;
  
  // Getters
  getPendingSuggestions: () => IngestSuggestion[];
  getSuggestionsByCase: (caseId: string) => IngestSuggestion[];
  getAuditForCase: (caseId: string) => IngestAudit[];
}

export const useIngestStore = create<IngestState>()(
  devtools(
    (set, get) => ({
      queue: [],
      audit: [],
      lastSyncAt: null,
      isSyncing: false,
      
      upsertSuggestions: (suggestions) => set((state) => {
        const existingIds = new Set(state.queue.map(s => s.id));
        const newSuggestions = suggestions.filter(s => !existingIds.has(s.id));
        const updatedQueue = [...state.queue];
        
        // Update existing suggestions
        suggestions.forEach(suggestion => {
          const index = updatedQueue.findIndex(s => s.id === suggestion.id);
          if (index >= 0) {
            updatedQueue[index] = { ...updatedQueue[index], ...suggestion };
          }
        });
        
        return {
          queue: [...updatedQueue, ...newSuggestions]
        };
      }),
      
      markLinked: (id, caseId, slotKey, by) => set((state) => {
        const suggestion = state.queue.find(s => s.id === id);
        if (!suggestion) return state;
        
        const auditEntry: IngestAudit = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action: 'linked',
          caseId,
          slotKey,
          dropboxPath: suggestion.dropboxPath,
          sha256: suggestion.sha256,
          at: new Date().toISOString(),
          by
        };
        
        return {
          queue: state.queue.map(s => 
            s.id === id ? { ...s, status: 'linked' as const } : s
          ),
          audit: [...state.audit, auditEntry]
        };
      }),
      
      markIgnored: (id, reason, by) => set((state) => {
        const suggestion = state.queue.find(s => s.id === id);
        if (!suggestion) return state;
        
        const auditEntry: IngestAudit = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action: 'ignored',
          dropboxPath: suggestion.dropboxPath,
          sha256: suggestion.sha256,
          at: new Date().toISOString(),
          by,
          reason
        };
        
        return {
          queue: state.queue.map(s => 
            s.id === id ? { ...s, status: 'ignored' as const, notes: reason } : s
          ),
          audit: [...state.audit, auditEntry]
        };
      }),
      
      updateSuggestion: (id, updates) => set((state) => ({
        queue: state.queue.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      
      setLastSync: (timestamp) => set({ lastSyncAt: timestamp }),
      
      clearQueue: () => set({ queue: [], audit: [] }),
      
      // Getters
      getPendingSuggestions: () => get().queue.filter(s => s.status === 'pending'),
      
      getSuggestionsByCase: (caseId) => 
        get().queue.filter(s => s.guessedCaseId === caseId && s.status === 'pending'),
        
      getAuditForCase: (caseId) => 
        get().audit.filter(a => a.caseId === caseId)
    }),
    { name: 'ingest-store' }
  )
);