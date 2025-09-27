/**
 * Review drawer for ingest suggestions
 */

import React, { useState, useEffect } from 'react';
import { X, Link2, EyeOff, Save, AlertCircle } from 'lucide-react';
import { useIngestStore } from './ingestStore';
import { useCaseStore } from '@/stores/caseStore';
import { ingestService } from './ingestService';
import { getFileTypeIcon } from '@/lib/mime';
import { plDate } from '@/lib/dateFormat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReviewDrawerProps {
  suggestionId: string;
  onClose: () => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({ suggestionId, onClose }) => {
  const { toast } = useToast();
  const { queue, updateSuggestion } = useIngestStore();
  const { cases } = useCaseStore();
  
  const suggestion = queue.find(s => s.id === suggestionId);
  
  // Form state
  const [selectedCaseId, setSelectedCaseId] = useState(suggestion?.guessedCaseId || '');
  const [selectedSlotKey, setSelectedSlotKey] = useState(suggestion?.guessedSlots[0]?.key || '');
  const [notes, setNotes] = useState(suggestion?.notes || '');
  const [ignoreReason, setIgnoreReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (suggestion) {
      setSelectedCaseId(suggestion.guessedCaseId || '');
      setSelectedSlotKey(suggestion.guessedSlots[0]?.key || '');
      setNotes(suggestion.notes || '');
    }
  }, [suggestion]);
  
  if (!suggestion) return null;
  
  // Document slot options
  const slotOptions = [
    { key: 'doc_birth', label: 'Birth Certificate' },
    { key: 'doc_marriage', label: 'Marriage Certificate' },
    { key: 'doc_naturalization', label: 'Naturalization' },
    { key: 'doc_passport', label: 'Passport' },
    { key: 'doc_death', label: 'Death Certificate' },
    { key: 'doc_residence', label: 'Residence Proof' },
    { key: 'doc_military', label: 'Military Records' },
    { key: 'doc_education', label: 'Education Records' },
    { key: 'doc_employment', label: 'Employment Records' },
    { key: 'doc_criminal', label: 'Criminal Records' },
    { key: 'doc_other', label: 'Other Documents' },
    { key: 'doc_misc', label: 'Miscellaneous' }
  ];
  
  const handleLink = async () => {
    if (!selectedCaseId || !selectedSlotKey) {
      toast({
        title: "Missing Information",
        description: "Please select both case and document slot",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await ingestService.linkSuggestion(suggestionId, selectedCaseId, selectedSlotKey);
      
      toast({
        title: "File Linked",
        description: `${suggestion.displayName} linked successfully`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Link Failed",
        description: "Failed to link file",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleIgnore = async () => {
    if (!ignoreReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for ignoring",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await ingestService.ignoreSuggestion(suggestionId, ignoreReason);
      
      toast({
        title: "File Ignored",
        description: `${suggestion.displayName} ignored`
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Ignore Failed",
        description: "Failed to ignore file",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="pc-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--pc-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--pc-text-primary)]">
              Review File
            </h2>
            <p className="text-sm text-[var(--pc-text-dim)]">
              Link to case or ignore this file
            </p>
          </div>
          <button
            onClick={onClose}
            className="pc-btn pc-btn--ghost pc-btn--icon"
            data-testid="button-close-drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* File Preview */}
        <div className="p-6 border-b border-[var(--pc-border)]">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{getFileTypeIcon(suggestion.mime)}</div>
            <div className="flex-1">
              <h3 className="font-medium text-[var(--pc-text-primary)] mb-1">
                {suggestion.displayName}
              </h3>
              <div className="space-y-1 text-sm text-[var(--pc-text-dim)]">
                <div>Path: {suggestion.dropboxPath}</div>
                <div>Size: {(suggestion.size / 1024).toFixed(1)} KB</div>
                <div>Modified: {plDate(suggestion.revisedAt)}</div>
                <div>Type: {suggestion.mime}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Select Case
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                       bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                       focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              data-testid="select-case"
            >
              <option value="">Select a case...</option>
              {cases.map((case_) => (
                <option key={case_.id} value={case_.id}>
                  {case_.name} ({case_.email})
                </option>
              ))}
            </select>
          </div>
          
          {/* Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Document Slot
            </label>
            <select
              value={selectedSlotKey}
              onChange={(e) => setSelectedSlotKey(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                       bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                       focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              data-testid="select-slot"
            >
              <option value="">Select document type...</option>
              {slotOptions.map((slot) => (
                <option key={slot.key} value={slot.key}>
                  {slot.label}
                </option>
              ))}
            </select>
            
            {/* Show guessed slots */}
            {suggestion.guessedSlots.length > 0 && (
              <div className="mt-2 text-sm text-[var(--pc-text-dim)]">
                <div className="font-medium">AI Suggestions:</div>
                {suggestion.guessedSlots.map((slot, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{slotOptions.find(s => s.key === slot.key)?.label || slot.key}</span>
                    <span>{Math.round(slot.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                       bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                       focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                       resize-none"
              placeholder="Add any notes about this file..."
              data-testid="textarea-notes"
            />
          </div>
          
          {/* Ignore Reason */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Ignore Reason (if ignoring)
            </label>
            <input
              type="text"
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                       bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                       focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              placeholder="e.g., Duplicate file, Wrong case, Poor quality..."
              data-testid="input-ignore-reason"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t border-[var(--pc-border)] flex gap-3">
          <button
            onClick={handleLink}
            disabled={!selectedCaseId || !selectedSlotKey || isSubmitting}
            className={cn(
              'pc-btn pc-btn--primary pc-btn--icon flex-1',
              (!selectedCaseId || !selectedSlotKey || isSubmitting) && 'opacity-50 cursor-not-allowed'
            )}
            data-testid="button-link-file"
          >
            <Link2 className="h-4 w-4" />
            Link to Case
          </button>
          
          <button
            onClick={handleIgnore}
            disabled={!ignoreReason.trim() || isSubmitting}
            className={cn(
              'pc-btn pc-btn--danger pc-btn--icon flex-1',
              (!ignoreReason.trim() || isSubmitting) && 'opacity-50 cursor-not-allowed'
            )}
            data-testid="button-ignore-file"
          >
            <EyeOff className="h-4 w-4" />
            Ignore File
          </button>
          
          <button
            onClick={onClose}
            className="pc-btn pc-btn--ghost"
            data-testid="button-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};