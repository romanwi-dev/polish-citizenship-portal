import React from 'react';
import AuthorityPanel from '@/components/AuthorityPanel';

interface CAPPanelProps {
  caseId: string;
}

export default function CAPPanel({ caseId }: CAPPanelProps) {
  return (
    <div className="space-y-6">
      <AuthorityPanel caseId={caseId} />
    </div>
  );
}