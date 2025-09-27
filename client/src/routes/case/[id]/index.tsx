import React from 'react';
import { useRoute } from 'wouter';
import { normalizeCaseId } from '@/lib/caseId';
import { CaseDetailsUnified } from './CaseDetailsUnified';

/**
 * Dynamic case detail route handler
 * Matches /case/:id or /agent/:caseId and extracts the case ID
 * SPRINT A: Updated to handle both routes with tab support
 */
export const CaseDetailPage: React.FC = () => {
  // Try both route patterns for compatibility
  const [agentMatch, agentParams] = useRoute('/agent/:caseId');
  const [caseMatch, caseParams] = useRoute('/case/:id');
  
  const match = agentMatch || caseMatch;
  const params = agentParams || caseParams;
  const rawCaseId = params?.caseId || params?.id;
  
  // Use the case ID exactly as provided - no normalization for API calls
  const cleanCaseId = rawCaseId;
  
  if (!match || !cleanCaseId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="pc-card p-8 text-center max-w-md">
          <div className="text-[var(--pc-danger)] text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-2">
            Invalid Case ID
          </h3>
          <p className="text-[var(--pc-text-dim)]">
            The case ID in the URL is invalid or missing.
          </p>
        </div>
      </div>
    );
  }

  return <CaseDetailsUnified caseId={cleanCaseId} />;
};

export default CaseDetailPage;