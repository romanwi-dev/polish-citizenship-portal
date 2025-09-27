import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MoreHorizontal, Eye, Settings, FileText, Users, Copy, Download, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, flip, shift, size } from '@floating-ui/react';
import { CaseData, deleteCase as apiDeleteCase } from '@/lib/api';
import { plDate } from '@/lib/dateFormat';
import { displayCaseId, normalizeCaseId } from '@/lib/caseId';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCaseStore } from '@/stores/caseStore';
import { CaseEditPanel } from './CaseEditPanel';

interface CaseCardCanonicalProps {
  case: CaseData;
  onAction?: (action: string, caseId: string) => void;
  className?: string;
}

function getTierVariant(tier: string): string {
  switch (tier.toUpperCase()) {
    case 'VIP': return 'bg-gradient-to-r from-green-500 to-green-600';
    case 'GLOBAL': return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'STANDARD': return 'bg-gradient-to-r from-gray-500 to-gray-600';
    case 'BASIC': return 'bg-gradient-to-r from-orange-500 to-orange-600';
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
}

function getStageBadgeVariant(stage: string): string {
  switch (stage.toLowerCase()) {
    case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
    case 'in_progress': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
    case 'stalled': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
}

const DropdownPortal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  caseId: string;
  onAction?: (action: string, caseId: string) => void;
  onEditClick: () => void;
  onViewClick: () => void;
  onDeleteClick: () => void;
}> = ({ isOpen, onClose, triggerRef, caseId, onAction, onEditClick, onViewClick, onDeleteClick }) => {
  const { toast } = useToast();
  
  const { refs, floatingStyles, update } = useFloating({
    placement: 'bottom-end',
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${Math.max(200, rects.reference.width)}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      refs.setReference(triggerRef.current);
      update();
    }
  }, [isOpen, refs, triggerRef, update]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refs.floating.current && !refs.floating.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, refs.floating, triggerRef]);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(caseId);
    toast({
      title: "Case ID Copied",
      description: `Case ID ${caseId} copied to clipboard`,
    });
    onClose();
  }, [caseId, toast, onClose]);

  const handleExport = useCallback(() => {
    onAction?.('export', caseId);
    onClose();
  }, [onAction, caseId, onClose]);

  const handleEdit = useCallback(() => {
    onEditClick();
    onClose();
  }, [onEditClick, onClose, caseId]);

  const handleView = useCallback(() => {
    onViewClick();
    onClose();
  }, [onViewClick, onClose]);

  const handleDelete = useCallback(() => {
    onDeleteClick();
    onClose();
  }, [onDeleteClick, onClose]);

  if (!isOpen) return null;

  const dropdownActions = [
    { label: 'Edit', action: 'edit', icon: Settings, onClick: handleEdit },
    { label: 'View', action: 'view', icon: Eye, onClick: handleView },
    { label: 'Copy ID', action: 'copy-id', icon: Copy, onClick: handleCopyId },
    { label: 'Export', action: 'export', icon: Download, onClick: handleExport },
    { label: 'Postpone', action: 'postpone', icon: FileText },
    { label: 'Suspend', action: 'suspend', icon: FileText },
    { label: 'Cancel', action: 'cancel', icon: FileText },
    { label: 'Archive', action: 'archive', icon: FileText },
    { label: 'Delete', action: 'delete', icon: Trash2, onClick: handleDelete, variant: 'danger' }
  ];

  return createPortal(
    <div
      ref={refs.setFloating}
      style={{ ...floatingStyles, zIndex: 9999, willChange: 'transform' }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl py-1 min-w-[160px]"
    >
      {dropdownActions.map((action) => {
        const Icon = action.icon;
        return (
          <div
            key={action.action}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer min-h-[44px] touch-manipulation',
              action.variant === 'danger' && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            )}
            onClick={action.onClick || (() => {
              onAction?.(action.action, caseId);
              onClose();
            })}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </div>
        );
      })}
    </div>,
    document.body
  );
};

export const CaseCardCanonical: React.FC<CaseCardCanonicalProps> = memo(({ case: caseData, onAction, className }) => {
  const [, navigate] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const { deleteCase } = useCaseStore();
  const { toast } = useToast();

  // Detect mobile vs desktop for edit panel
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fixed navigation behaviors per requirements - use raw ID for routes
  const rawId = normalizeCaseId(caseData.id);
  const prettyId = displayCaseId(rawId);

  const handleView = useCallback(() => {
    requestAnimationFrame(() => {
      // Use the original caseId format without normalization
      const caseId = caseData.caseId || caseData.id;
      navigate(`/agent/${caseId}?tab=overview`);
    });
  }, [navigate, caseData.id, caseData.caseId]);

  const handleControlRoom = useCallback(() => {
    requestAnimationFrame(() => {
      // Use the original caseId format without normalization
      const caseId = caseData.caseId || caseData.id;
      navigate(`/agent/${caseId}?tab=documents`);
    });
  }, [navigate, caseData.id, caseData.caseId]);

  const handleOBY = useCallback(() => {
    requestAnimationFrame(() => {
      // Use the original caseId format without normalization
      const caseId = caseData.caseId || caseData.id;
      navigate(`/agent/${caseId}?tab=documents`);
    });
  }, [navigate, caseData.id, caseData.caseId]);

  const handleUSC = useCallback(() => {
    requestAnimationFrame(() => {
      // Use the original caseId format without normalization
      const caseId = caseData.caseId || caseData.id;
      navigate(`/agent/${caseId}?tab=tasks`);
    });
  }, [navigate, caseData.id, caseData.caseId]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handleEditClick = useCallback(() => {
    setEditPanelOpen(true);
    setDropdownOpen(false);
  }, [caseData.id]);

  const handleEditClose = useCallback(() => {
    setEditPanelOpen(false);
  }, []);

  const handleEditSave = useCallback((updatedCase: CaseData) => {
    // The edit panel handles the optimistic update
    onAction?.(
      'updated', 
      updatedCase.id
    );
  }, [onAction]);

  const handleDropdownView = useCallback(() => {
    handleView();
  }, [handleView]);

  const handleDropdownDelete = useCallback(() => {
    if (isDeleting) return; // Prevent race conditions
    setDeleteConfirmOpen(true);
  }, [isDeleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    
    try {
      await apiDeleteCase(caseData.id);
      deleteCase(caseData.id);
      toast({
        title: "Case Deleted",
        description: `Case ${caseData.id} has been deleted permanently.`,
      });
      onAction?.('deleted', caseData.id);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }, [caseData.id, deleteCase, toast, onAction, isDeleting]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmOpen(false);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    return () => setDropdownOpen(false);
  }, [navigate]);

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl w-full min-w-0 md:min-h-[400px] flex flex-col transition-all duration-150 hover:scale-[1.01] hover:shadow-xl dark:hover:shadow-2xl", 
        className
      )}
      style={{ transformOrigin: 'center' }}
    >
      <div className="p-4 md:p-8 space-y-4 md:space-y-6 flex-1 flex flex-col">
        {/* Timeline - Polish date format guaranteed */}
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Updated: {plDate(caseData.updatedAt)} - ID: {prettyId}
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-bold text-gray-900 dark:text-white text-3xl md:text-4xl uppercase truncate" 
              title={caseData.name}
            >
              {caseData.name.split(' ').pop()}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">{caseData.email}</p>
          </div>
          <button
            ref={dropdownTriggerRef}
            onClick={toggleDropdown}
            className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            data-testid="button-kebab"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={cn('px-2 py-1 rounded text-xs font-medium border', getStageBadgeVariant(caseData.stage))}>
            {caseData.stage.replace('_', ' ')}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
            {caseData.score}%
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            {caseData.ageMonths}mo
          </span>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center">
          <span className={cn(
            'px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg',
            getTierVariant(caseData.tier)
          )}>
            {caseData.tier}
          </span>
        </div>

        {/* Action Buttons - Exact layout: View (left) • Control Room (right) • Draft OBY (full-width green) • USC Task (right) */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            type="button"
            data-case-id={rawId}
            onClick={handleView}
            aria-label={`View case details for ${caseData.name}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
            data-testid="button-view"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
          <button
            type="button"
            data-case-id={rawId}
            onClick={handleControlRoom}
            aria-label={`Open control room for ${caseData.name}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
            data-testid="button-control-room"
          >
            <Settings className="h-4 w-4" />
            Control Room
          </button>
          <button
            type="button"
            data-case-id={rawId}
            onClick={handleOBY}
            aria-label={`Draft OBY documents for ${caseData.name}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation col-span-2"
            data-testid="button-draft-oby"
          >
            <FileText className="h-4 w-4" />
            Draft OBY
          </button>
          <button
            type="button"
            data-case-id={rawId}
            onClick={handleUSC}
            aria-label={`View USC tasks for ${caseData.name}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation col-span-2"
            data-testid="button-usc-task"
          >
            <Users className="h-4 w-4" />
            USC Task
          </button>
        </div>
      </div>

      <DropdownPortal
        isOpen={dropdownOpen}
        onClose={closeDropdown}
        triggerRef={dropdownTriggerRef}
        caseId={caseData.id}
        onAction={onAction}
        onEditClick={handleEditClick}
        onViewClick={handleDropdownView}
        onDeleteClick={handleDropdownDelete}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Usunąć sprawę {caseData.name}?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Tej operacji nie można cofnąć.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition-colors min-h-[44px] touch-manipulation"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors min-h-[44px] touch-manipulation flex items-center gap-2"
                >
                  {isDeleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <CaseEditPanel
        isOpen={editPanelOpen}
        caseData={caseData}
        mode={isMobile ? 'mobile' : 'desktop'}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </div>
  );
});

CaseCardCanonical.displayName = 'CaseCardCanonical';