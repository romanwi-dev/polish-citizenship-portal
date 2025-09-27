/**
 * Deduplication utilities for ingest system
 */

import type { IngestSuggestion } from './ingestStore';

export function isDuplicate(
  newSuggestion: Partial<IngestSuggestion>,
  existingSuggestions: IngestSuggestion[]
): boolean {
  if (!newSuggestion.sha256) return false;
  
  // Check for exact hash match
  const hashMatch = existingSuggestions.find(s => s.sha256 === newSuggestion.sha256);
  if (hashMatch) return true;
  
  // Check for similar filename + size within time window
  if (newSuggestion.displayName && newSuggestion.size) {
    const similarMatch = existingSuggestions.find(s => 
      s.displayName === newSuggestion.displayName &&
      s.size === newSuggestion.size &&
      Math.abs(new Date(s.revisedAt).getTime() - new Date(newSuggestion.revisedAt || 0).getTime()) < 2 * 60 * 1000 // 2 minutes
    );
    if (similarMatch) return true;
  }
  
  return false;
}

export function dedupeKeepLatest(suggestions: IngestSuggestion[]): IngestSuggestion[] {
  const seen = new Set<string>();
  const dedupedByHash = new Map<string, IngestSuggestion>();
  
  // Group by hash, keep latest
  for (const suggestion of suggestions) {
    const existing = dedupedByHash.get(suggestion.sha256);
    if (!existing || new Date(suggestion.revisedAt) > new Date(existing.revisedAt)) {
      dedupedByHash.set(suggestion.sha256, suggestion);
    }
  }
  
  return Array.from(dedupedByHash.values());
}

export function isAlreadyLinked(
  sha256: string,
  caseId: string,
  slotKey: string,
  linkedDocuments: Array<{sha256: string, caseId: string, slotKey: string}>
): boolean {
  return linkedDocuments.some(doc => 
    doc.sha256 === sha256 && 
    doc.caseId === caseId && 
    doc.slotKey === slotKey
  );
}