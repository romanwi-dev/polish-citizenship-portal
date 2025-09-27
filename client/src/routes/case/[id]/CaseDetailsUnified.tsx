import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Settings, FileText, Users, Clock, DollarSign, CheckSquare, TreePine, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { getCaseById, CaseData, ServicePayment } from '@/lib/api';
import { plDate, formatPL, parsePL } from '@/lib/dateFormat';
import { formatPL as formatPolish } from '@/utils/date';
import { TabNav, TabKey, TABS } from '@/components/TabNav';
import { normalizeCaseId, displayCaseId } from '@/lib/caseId';
import { useCaseStore } from '@/stores/caseStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CAPTab } from '@/features/cap/CAPTab';
import { TasksTab } from '@/features/tasks/TasksTab';
import { FamilyTreeTab } from '@/features/familyTree/FamilyTreeTab';
import { CaseWithCAP } from '@/features/cap/capRules';
import { StagePanel } from '@/components/case/StagePanel';
import '@/styles/tokens.css';

type TabId = TabKey;


interface CaseDetailsUnifiedProps {
  caseId: string;
}

export const OverviewPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Case Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Client Name</label>
          <p className="text-gray-900 dark:text-white font-medium">{caseData.name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
          <p className="text-gray-900 dark:text-white">{caseData.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Stage</label>
          <p className="text-gray-900 dark:text-white capitalize">{caseData.stage.replace('_', ' ')}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Processing Tier</label>
          <p className="text-gray-900 dark:text-white">{caseData.tier}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Score</label>
          <p className="text-gray-900 dark:text-white">{caseData.score}%</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Age</label>
          <p className="text-gray-900 dark:text-white">{caseData.ageMonths} months</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Created</label>
          <p className="text-gray-900 dark:text-white">{formatPolish(caseData.createdAt)}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
          <p className="text-gray-900 dark:text-white">{formatPolish(caseData.updatedAt)}</p>
        </div>
      </div>
    </div>
  </div>
);

export const TimelinePanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-4">
    {caseData.timeline && caseData.timeline.length > 0 ? (
      caseData.timeline.map((event, index) => (
        <div key={event.id || index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <h4 className="text-gray-900 dark:text-white font-medium">{event.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{event.description}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">{formatPolish(event.date)}</p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
        <Clock className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No timeline events yet</p>
      </div>
    )}
  </div>
);

export const DocumentsPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-4">
    {caseData.documents && caseData.documents.length > 0 ? (
      caseData.documents.map((doc, index) => (
        <div key={doc.id || index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">{doc.name}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{doc.type}</p>
            </div>
            <div className="text-right">
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                doc.status === 'verified' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                doc.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              )}>
                {doc.status}
              </span>
              {doc.uploadedAt && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {plDate(doc.uploadedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
        <FileText className="h-12 w-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
      </div>
    )}
  </div>
);

// Service Payment placeholders (12 hardcoded)
const SERVICE_PAYMENT_LABELS = [
  "Advance Payment",
  "POAs Signed Payment", 
  "Application Filed Payment",
  "PUSH Scheme Payment",
  "NUDGE Scheme Payment",
  "SIT-DOWN Scheme Payment",
  "Translation Payment",
  "Archive Research Payment",
  "USC Acts Payment",
  "OBY Filing Payment",
  "VIP Upgrade Payment",
  "Finalization Payment"
] as const;

export const PaymentsPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => {
  const { updateCase } = useCaseStore();
  const { toast } = useToast();
  
  // Initialize service payments if not present
  const servicePayments = useMemo(() => {
    if (caseData.servicePayments && caseData.servicePayments.length === 12) {
      return caseData.servicePayments;
    }
    
    // Create default 12 placeholders
    return SERVICE_PAYMENT_LABELS.map((label, index) => ({
      id: `pay${index + 1}`,
      label,
      status: 'N/A' as const,
      amount: undefined,
      notes: '',
      currency: 'EUR' as const
    }));
  }, [caseData.servicePayments]);

  const handleStatusChange = async (paymentId: string, newStatus: ServicePayment['status']) => {
    const updatedPayments = servicePayments.map(payment => 
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    );
    
    try {
      updateCase(caseData.id, { servicePayments: updatedPayments });
      toast({ description: "Payment status updated" });
    } catch (error) {
      toast({ 
        variant: "destructive",
        description: "Failed to update payment status" 
      });
    }
  };

  const handleAmountChange = async (paymentId: string, newAmount: string) => {
    const amount = newAmount === '' ? undefined : parseFloat(newAmount);
    if (newAmount !== '' && (isNaN(amount!) || amount! < 0)) return;
    
    const updatedPayments = servicePayments.map(payment => 
      payment.id === paymentId ? { ...payment, amount } : payment
    );
    
    try {
      updateCase(caseData.id, { servicePayments: updatedPayments });
    } catch (error) {
      toast({ 
        variant: "destructive",
        description: "Failed to update payment amount" 
      });
    }
  };

  const handleNotesChange = async (paymentId: string, newNotes: string) => {
    const updatedPayments = servicePayments.map(payment => 
      payment.id === paymentId ? { ...payment, notes: newNotes } : payment
    );
    
    try {
      updateCase(caseData.id, { servicePayments: updatedPayments });
    } catch (error) {
      toast({ 
        variant: "destructive",
        description: "Failed to update payment notes" 
      });
    }
  };

  const getStatusPillStyle = (status: ServicePayment['status']) => {
    switch (status) {
      case 'Received': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'N/A': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div 
      className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--pc-border)]"
      data-testid="payments-panel"
    >
      {servicePayments.map((payment, index) => (
        <div key={payment.id} className="pc-card p-4" data-testid={`payment-card-${payment.id}`}>
          <div className="space-y-3">
            {/* Header with Label and Status */}
            <div className="flex items-start justify-between">
              <h4 className="text-[var(--pc-text-primary)] font-medium text-sm leading-tight">
                {payment.label}
              </h4>
              <select
                value={payment.status}
                onChange={(e) => handleStatusChange(payment.id, e.target.value as ServicePayment['status'])}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer',
                  getStatusPillStyle(payment.status)
                )}
                data-testid={`status-select-${payment.id}`}
              >
                <option value="N/A">N/A</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>

            {/* Amount Field */}
            <div className="flex items-center gap-2">
              <label className="text-[var(--pc-text-dim)] text-xs min-w-0 flex-shrink-0">
                Amount:
              </label>
              <div className="flex items-center flex-1">
                <input
                  type="number"
                  value={payment.amount || ''}
                  onChange={(e) => handleAmountChange(payment.id, e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="flex-1 px-2 py-1 text-xs bg-[var(--pc-surface)] border border-[var(--pc-border)] rounded text-[var(--pc-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--pc-info)] focus:border-[var(--pc-info)]"
                  data-testid={`amount-input-${payment.id}`}
                />
                {payment.amount !== undefined && (
                  <span className="ml-1 text-[var(--pc-text-dim)] text-xs">€</span>
                )}
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-1">
              <label className="text-[var(--pc-text-dim)] text-xs">
                Notes:
              </label>
              <input
                type="text"
                value={payment.notes || ''}
                onChange={(e) => handleNotesChange(payment.id, e.target.value)}
                placeholder="Add notes..."
                className="w-full px-2 py-1 text-xs bg-[var(--pc-surface)] border border-[var(--pc-border)] rounded text-[var(--pc-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--pc-info)] focus:border-[var(--pc-info)]"
                data-testid={`notes-input-${payment.id}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// TasksPanel removed - using TasksTab component

const FamilyPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => {
  return <FamilyTreeTab caseId={caseData.id} />;
};

// CAPPanel removed - using CAPTab component

const OBYPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="pc-card p-8 text-center">
    <FileText className="h-12 w-12 text-[var(--pc-text-dim)] mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">OBY Draft</h3>
    <p className="text-[var(--pc-text-dim)]">OBY document drafting tools coming soon</p>
  </div>
);

const USCPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="pc-card p-8 text-center">
    <Users className="h-12 w-12 text-[var(--pc-text-dim)] mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">USC Tasks</h3>
    <p className="text-[var(--pc-text-dim)]">USC task management coming soon</p>
  </div>
);

interface CaseEditPanelProps {
  caseData: CaseData;
  editData: Partial<CaseData>;
  onFieldChange: (field: keyof CaseData, value: any) => void;
  isDirty: boolean;
}

const CaseEditPanel: React.FC<CaseEditPanelProps> = ({ 
  caseData, 
  editData, 
  onFieldChange, 
  isDirty 
}) => {
  return (
    <div className="lg:sticky lg:top-6">
      <div className="pc-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Edit3 className="h-5 w-5 text-[var(--pc-info)]" />
          <h3 className="text-lg font-semibold text-[var(--pc-text-primary)]">
            Edit Case Details
          </h3>
          {isDirty && (
            <span className="ml-auto text-xs text-[var(--pc-warning)] font-medium">
              • Unsaved changes
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                         placeholder:text-[var(--pc-text-dim)]"
              placeholder="Enter client name"
              data-testid="input-name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={editData.email || ''}
              onChange={(e) => onFieldChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                         placeholder:text-[var(--pc-text-dim)]"
              placeholder="Enter email address"
              data-testid="input-email"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Processing Stage
            </label>
            <select
              value={editData.stage || ''}
              onChange={(e) => onFieldChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              data-testid="select-stage"
            >
              <option value="intake">Intake</option>
              <option value="usc_in_flight">USC In Flight</option>
              <option value="oby_drafting">OBY Drafting</option>
              <option value="usc_ready">USC Ready</option>
              <option value="oby_submittable">OBY Submittable</option>
              <option value="oby_submitted">OBY Submitted</option>
              <option value="decision_received">Decision Received</option>
            </select>
          </div>

          {/* Tier */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Processing Tier
            </label>
            <select
              value={editData.tier || ''}
              onChange={(e) => onFieldChange('tier', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent"
              data-testid="select-tier"
            >
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="VIP">VIP</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Success Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={editData.score || ''}
              onChange={(e) => onFieldChange('score', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                         placeholder:text-[var(--pc-text-dim)]"
              placeholder="Enter score (0-100)"
              data-testid="input-score"
            />
          </div>

          {/* Age in Months */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Age (Months)
            </label>
            <input
              type="number"
              min="0"
              value={editData.ageMonths || ''}
              onChange={(e) => onFieldChange('ageMonths', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                         placeholder:text-[var(--pc-text-dim)]"
              placeholder="Enter age in months"
              data-testid="input-age"
            />
          </div>

          {/* Processing Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Processing Status
            </label>
            <input
              type="text"
              value={editData.processing || ''}
              onChange={(e) => onFieldChange('processing', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                         placeholder:text-[var(--pc-text-dim)]"
              placeholder="Enter processing status"
              data-testid="input-processing"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-[var(--pc-text-primary)] mb-2">
              Case State
            </label>
            <input
              type="text"
              value={editData.state || ''}
              onChange={(e) => onFieldChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--pc-border)] rounded-lg 
                         bg-[var(--pc-card)] text-[var(--pc-text-primary)]
                         focus:ring-2 focus:ring-[var(--pc-info)] focus:border-transparent
                         placeholder:text-[var(--pc-text-dim)]"
              placeholder="Enter case state"
              data-testid="input-state"
            />
          </div>
        </div>

        {/* Mobile Save Button */}
        <div className="mt-6 lg:hidden">
          <button
            onClick={() => {
              // This will be handled by the parent component's save handler
              const saveEvent = new CustomEvent('case-save');
              window.dispatchEvent(saveEvent);
            }}
            disabled={!isDirty}
            className={cn(
              'w-full pc-btn pc-btn--icon',
              isDirty ? 'pc-btn--primary' : 'pc-btn--ghost'
            )}
            data-testid="button-save-mobile"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export const CaseDetailsUnified: React.FC<CaseDetailsUnifiedProps> = ({ caseId }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Use the case ID exactly as provided - no normalization
  const cleanId = caseId;
  const prettyId = caseId;
  
  // Get tab from URL params with backward compatibility
  const [activeTabId, setActiveTabId] = useState<TabId>(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const raw = (urlParams.get('tab') || 'overview').toLowerCase();
    const legacyToNew: Record<string, TabId> = {
      "cap": "authority",
      "family-tree": "tree",
      "timeline": "stage",
    };
    return (legacyToNew[raw] ?? raw) as TabId;
  });
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<CaseData>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Use Zustand store for case management
  const { caseById, updateCase, hydrateCase, rollbackCase } = useCaseStore();
  const caseData = caseById[cleanId] || null;
  
  // Load case data if not in store using TanStack Query with proper error handling
  const { data: apiCaseData, isLoading, error, refetch } = useQuery({
    queryKey: ['case', cleanId],
    queryFn: () => {
      if (!cleanId) throw new Error("Invalid case id");
      return getCaseById(cleanId);
    },
    enabled: !!cleanId, // Always try to fetch if we have a valid case ID
    retry: 3,
    staleTime: 30000, // 30 seconds
  });

  // Hydrate store when API data loads
  useEffect(() => {
    if (apiCaseData && cleanId) {
      hydrateCase(cleanId, apiCaseData);
    }
  }, [apiCaseData, cleanId, hydrateCase]);

  // Update tab state when location changes with backward compatibility
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const raw = (urlParams.get('tab') || 'overview').toLowerCase();
    const legacyToNew: Record<string, TabId> = {
      "cap": "authority",
      "family-tree": "tree", 
      "timeline": "stage",
    };
    const tab = (legacyToNew[raw] ?? raw) as TabId;
    setActiveTabId(tab);
  }, [location]);

  // Initialize edit data when entering edit mode
  useEffect(() => {
    if (isEditMode && caseData) {
      setEditData({
        name: caseData.name,
        email: caseData.email,
        stage: caseData.stage,
        tier: caseData.tier,
        score: caseData.score,
        ageMonths: caseData.ageMonths,
        processing: caseData.processing,
        state: caseData.state
      });
      setIsDirty(false);
    }
  }, [isEditMode, caseData]);

  const setActiveTab = (tabId: TabId) => {
    setActiveTabId(tabId);
    navigate(`/agent/${cleanId}?tab=${tabId}`, { replace: true });
  };

  const handleEditToggle = () => {
    if (isEditMode && isDirty) {
      // Show confirmation dialog for unsaved changes
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setIsEditMode(false);
        setEditData({});
        setIsDirty(false);
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleSave = async () => {
    if (!caseData || !isDirty) return;
    
    // Capture current state for rollback
    const previousState = { ...caseData };
    
    // Apply optimistic update immediately
    updateCase(cleanId, editData);
    setIsEditMode(false);
    setIsDirty(false);
    
    try {
      // Save to server using proper case ID format
      const apiId = cleanId.startsWith('C-') ? cleanId : `C-${cleanId}`;
      const response = await fetch(`/api/admin/cases/${apiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) throw new Error('Save failed');
      
      toast({
        title: "Success",
        description: "Case updated successfully",
      });
    } catch (error) {
      // Rollback optimistic update on error
      rollbackCase(cleanId, previousState);
      setIsEditMode(true);
      setIsDirty(true);
      toast({
        title: "Error", 
        description: "Failed to save changes - reverted to previous state",
        variant: "destructive",
      });
    }
  };

  const handleEditChange = (field: keyof CaseData, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const renderTabContent = () => {
    // Use either store data or API data - whichever is available
    const currentCaseData = caseData || apiCaseData;
    
    if (!currentCaseData) {
      return (
        <div className="pc-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--pc-info)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--pc-text-dim)]">Loading case content...</p>
        </div>
      );
    }

    switch (activeTabId) {
      case 'overview': return <OverviewPanel case={currentCaseData} />;
      case 'stage': return <StagePanel case={currentCaseData} />;
      case 'documents': return <DocumentsPanel case={currentCaseData} />;
      case 'payments': return <PaymentsPanel case={currentCaseData} />;
      case 'tasks': return <TasksTab caseData={currentCaseData as CaseWithCAP} />;
      case 'authority': return <CAPTab caseData={currentCaseData as CaseWithCAP} />;
      case 'tree': return <FamilyPanel case={currentCaseData} />;
      default: return <OverviewPanel case={currentCaseData} />;
    }
  };

  // Handle invalid case ID
  if (!cleanId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="pc-card p-8 text-center max-w-md">
          <div className="text-[var(--pc-danger)] text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">
            Invalid Case ID
          </h3>
          <p className="text-[var(--pc-text-dim)] mb-4">
            The case ID in the URL is invalid or missing.
          </p>
          <button
            onClick={() => navigate('/admin/cases')}
            className="pc-btn pc-btn--primary"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="pc-card p-8 text-center max-w-md">
          <div className="text-[var(--pc-danger)] text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">
            Failed to Load Case
          </h3>
          <p className="text-[var(--pc-text-dim)] mb-6">
            {error?.message || `Case ${prettyId} could not be loaded. Please try again or check the case ID.`}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="pc-btn pc-btn--primary pc-btn--icon"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/cases')}
              className="pc-btn pc-btn--ghost"
            >
              Back to Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="pc-card p-8 text-center max-w-md">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--pc-info)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">
            Loading…
          </h3>
          <p className="text-[var(--pc-text-dim)]">
            {prettyId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section id="portal-caseview" className="portal-scope">
      <div className="min-h-screen bg-[var(--pc-surface)] p-4 md:p-6">
        <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/cases')}
              className="pc-btn pc-btn--ghost pc-btn--icon"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-[var(--pc-text-primary)]">
                {caseData?.name || `Case ${prettyId}`}
              </h1>
              {caseData && (
                <div className="text-[var(--pc-text-dim)]">
                  <p>Email: {caseData.email}</p>
                  <p>Updated: {plDate(caseData.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Controls */}
          {caseData && (
            <div className="flex items-center gap-2">
              {isEditMode && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={cn(
                      'pc-btn pc-btn--icon',
                      isDirty ? 'pc-btn--primary' : 'pc-btn--ghost'
                    )}
                    data-testid="button-save"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="pc-btn pc-btn--ghost pc-btn--icon"
                    data-testid="button-cancel"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </>
              )}
              {!isEditMode && (
                <button
                  onClick={handleEditToggle}
                  className="pc-btn pc-btn--ghost pc-btn--icon"
                  data-testid="button-edit"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pc-card p-2">
          <TabNav active={activeTabId} onChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className={cn(
          "min-h-[400px]",
          isEditMode && "grid grid-cols-1 lg:grid-cols-2 gap-6"
        )}>
          {/* Main Content */}
          <div className={cn(isEditMode && "lg:pr-3")}>
            {isLoading ? (
              <div className="pc-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--pc-info)] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[var(--pc-text-dim)]">Loading case details...</p>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>

          {/* Edit Panel */}
          {isEditMode && caseData && (
            <div className="lg:pl-3">
              <CaseEditPanel 
                caseData={caseData}
                editData={editData}
                onFieldChange={handleEditChange}
                isDirty={isDirty}
              />
            </div>
          )}
        </div>
        </div>
      </div>
    </section>
  );
};