import React, { memo } from 'react';
import { CaseCardCanonical } from '@/components/cards/CaseCardCanonical';
import { CaseData } from '@/lib/api';

interface CaseCardProps {
  case: CaseData;
  onAction?: (action: string, caseId: string) => void;
  className?: string;
}

export const CaseCard: React.FC<CaseCardProps> = memo(({ case: caseData, onAction, className }) => {
  return (
    <CaseCardCanonical 
      case={caseData}
      onAction={onAction}
      className={className}
    />
  );
});

CaseCard.displayName = 'CaseCard';