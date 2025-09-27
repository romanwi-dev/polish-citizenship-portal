import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getCaseById, CaseData } from '@/lib/api';
import { normalizeCaseId, displayCaseId } from '@/lib/caseId';
import { cn } from '@/lib/utils';
import { plDate } from '@/lib/dateFormat';
import '@/styles/tokens.css';

// Import shared helpers (no panels)
import { CAPTab } from '@/features/cap/CAPTab';
import { TasksTab } from '@/features/tasks/TasksTab';
import { CaseWithCAP } from '@/features/cap/capRules';


type TabId = 'overview' | 'timeline' | 'documents' | 'payments' | 'tasks' | 'cap' | 'family-tree';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: ({ className }) => <div className={className}>📋</div> },
  { id: 'timeline', label: 'Timeline', icon: ({ className }) => <div className={className}>⏱️</div> },
  { id: 'documents', label: 'Documents', icon: ({ className }) => <div className={className}>📄</div> },
  { id: 'payments', label: 'Payments', icon: ({ className }) => <div className={className}>💰</div> },
  { id: 'tasks', label: 'Tasks', icon: ({ className }) => <div className={className}>✅</div> },
  { id: 'cap', label: 'CAP', icon: ({ className }) => <div className={className}>🛡️</div> },
  { id: 'family-tree', label: 'Family Tree', icon: ({ className }) => <div className={className}>🌳</div> },
];

// Read-only versions of components
const ReadOnlyOverviewPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
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
          <p className="text-gray-900 dark:text-white">{plDate(caseData.createdAt)}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Last Updated</label>
          <p className="text-gray-900 dark:text-white">{plDate(caseData.updatedAt)}</p>
        </div>
      </div>
    </div>
  </div>
);

const ReadOnlyTimelinePanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
      {caseData.timeline && caseData.timeline.length > 0 ? (
        <div className="space-y-3">
          {caseData.timeline.map((event, index) => (
            <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">{plDate(event.date)}</div>
              <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
              {event.description && <div className="text-gray-600 dark:text-gray-300">{event.description}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⏱️</div>
          <p className="text-gray-500 dark:text-gray-400">No timeline events yet</p>
        </div>
      )}
    </div>
  </div>
);

const ReadOnlyDocumentsPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
      {caseData.documents && caseData.documents.length > 0 ? (
        <div className="space-y-3">
          {caseData.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{doc.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {plDate(doc.uploadedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
        </div>
      )}
    </div>
  </div>
);

const ReadOnlyPaymentsPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payments</h3>
      {caseData.payments && caseData.payments.length > 0 ? (
        <div className="space-y-3">
          {caseData.payments.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💰</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{payment.description}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{payment.status}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{payment.amount}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{plDate(payment.date)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-gray-500 dark:text-gray-400">No payments recorded yet</p>
        </div>
      )}
    </div>
  </div>
);

const ReadOnlyFamilyPanel: React.FC<{ case: CaseData }> = ({ case: caseData }) => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
      <div className="text-4xl mb-4">🌳</div>
      <p className="text-gray-500 dark:text-gray-400">Family tree information will be displayed here</p>
    </div>
  </div>
);

/**
 * Case Summary Page - Read-only view with navigation to Control Room
 */
export const CaseSummaryPage: React.FC = () => {
  const [agentMatch, agentParams] = useRoute('/case/:id/summary');
  const [location, navigate] = useLocation();
  
  const rawCaseId = agentParams?.id;
  const cleanId = normalizeCaseId(rawCaseId);
  const prettyId = displayCaseId(cleanId);
  
  // Get active tab from URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const activeTabId = (urlParams.get('tab') as TabId) || 'overview';
  
  // Load case data
  const { data: caseData, isLoading, error, refetch } = useQuery({
    queryKey: ['case', cleanId],
    queryFn: () => {
      if (!cleanId) throw new Error("Invalid case id");
      return getCaseById(cleanId);
    },
    enabled: !!cleanId,
    retry: 3,
    staleTime: 30000,
  });

  const setActiveTab = (tabId: TabId) => {
    navigate(`/case/${cleanId}/summary?tab=${tabId}`);
  };

  const renderTabContent = () => {
    if (!caseData) return null;

    switch (activeTabId) {
      case 'overview': return <ReadOnlyOverviewPanel case={caseData} />;
      case 'timeline': return <ReadOnlyTimelinePanel case={caseData} />;
      case 'documents': return <ReadOnlyDocumentsPanel case={caseData} />;
      case 'payments': return <ReadOnlyPaymentsPanel case={caseData} />;
      case 'tasks': return <TasksTab caseData={caseData as CaseWithCAP} />;
      case 'cap': return <CAPTab caseData={caseData as CaseWithCAP} />;
      case 'family-tree': return <ReadOnlyFamilyPanel case={caseData} />;
      default: return <ReadOnlyOverviewPanel case={caseData} />;
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
          <p className="text-[var(--pc-text-dim)] mb-6">
            The case ID in the URL is invalid or missing.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/admin/cases')}
              className="pc-btn pc-btn--primary"
            >
              Back to Cases
            </button>
          </div>
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
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/cases')}
              className="pc-btn pc-btn--ghost"
            >
              Back to Cases
            </button>
            <button
              onClick={() => navigate(`/agent/${cleanId}`)}
              className="pc-btn pc-btn--info"
            >
              Open Control Room
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
            Loading Case Summary…
          </h3>
          <p className="text-[var(--pc-text-dim)]">
            {prettyId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section id="portal-case-summary" className="portal-scope">
      <div className="min-h-screen bg-[var(--pc-surface)] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/cases')}
                className="pc-btn pc-btn--ghost pc-btn--icon"
                data-testid="button-back-to-cases"
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

            {/* Action Button */}
            {caseData && (
              <button
                onClick={() => navigate(`/agent/${cleanId}`)}
                className="pc-btn pc-btn--info pc-btn--icon"
                data-testid="button-open-control-room"
              >
                <ExternalLink className="h-4 w-4" />
                Open Control Room
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="pc-card p-2">
            <div className="pc-case-tabs flex overflow-x-auto gap-1 justify-between w-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--pc-border)] pb-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTabId === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'pc-btn pc-btn--icon whitespace-nowrap flex-1 min-w-0 flex-shrink-0',
                      isActive ? 'pc-btn--primary' : 'pc-btn--ghost'
                    )}
                    style={{ minWidth: '120px' }}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="pc-card p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--pc-info)] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[var(--pc-text-dim)]">Loading case details...</p>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseSummaryPage;