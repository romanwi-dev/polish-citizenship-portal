import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, FileCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import CaseMenuV2 from './CaseMenuV2';

export interface Case {
  id: string;
  client: {
    name: string;
    email: string;
  };
  processing: 'standard' | 'expedited' | 'vip' | 'vip+';
  difficulty: number | null;
  clientScore: number | null;
  state: string;
  docs: {
    received: number;
    expected: number;
  };
  ageMonths: number;
  lineage: string;
  flags: string[];
}

interface CaseCardV2Props {
  case: Case;
  onEdit: (id: string) => void;
  onMenuAction: (action: string, caseId: string) => void;
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: { duration: 0.2 }
  },
  hover: { 
    y: -6, 
    scale: 1.03, 
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 25,
      duration: 0.15 
    } 
  },
};

function getProcessingColor(processing: string) {
  switch (processing) {
    case 'vip+': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200';
    case 'vip': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200';
    case 'expedited': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
  }
}

function getStateColor(state: string) {
  switch (state.toLowerCase()) {
    case 'intake': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
    case 'usc_in_flight': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    case 'usc_ready': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
    case 'oby_submitted': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
    default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100';
  }
}

function getDifficultyColor(difficulty: number | null) {
  if (difficulty === null) return 'text-zinc-400';
  if (difficulty >= 8) return 'text-red-600 dark:text-red-400';
  if (difficulty >= 6) return 'text-amber-600 dark:text-amber-400';
  if (difficulty >= 4) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

const CaseCardV2 = memo(function CaseCardV2({ case: caseData, onEdit, onMenuAction }: CaseCardV2Props) {
  const handleCardClick = useCallback(() => {
    onEdit(caseData.id);
  }, [onEdit, caseData.id]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEdit(caseData.id);
    }
  }, [onEdit, caseData.id]);

  const handleMenuAction = useCallback((action: string, caseId: string) => {
    try {
      onMenuAction(action, caseId);
    } catch (error) {
      console.error('Menu action error:', error);
    }
  }, [onMenuAction]);

  const progressPercent = caseData.docs.expected > 0 
    ? Math.round((caseData.docs.received / caseData.docs.expected) * 100)
    : 0;

  return (
    <motion.div
      key={caseData.id}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      className={cn(
        "relative group cursor-pointer",
        "token-card-strong",
        "text-[var(--text)]",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/10",
        "focus-visible:outline-none focus:outline-none focus:ring-2 focus:ring-primary/20",
        "w-full max-w-none min-h-[280px] md:h-[400px]",
        "transform-gpu",
        "touch-manipulation"
      )}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit case for ${caseData.client.name}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      data-testid={`case-card-${caseData.id}`}
    >
      {/* Header with menu button */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            {caseData.client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate" data-testid={`case-name-${caseData.id}`}>
              {caseData.client.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {caseData.client.email}
            </p>
          </div>
        </div>
        
        <CaseMenuV2 
          caseId={caseData.id} 
          onAction={handleMenuAction}
        />
      </div>

      {/* Processing tier and state badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className={cn(
          "px-3 py-1 text-xs font-medium rounded-full",
          getProcessingColor(caseData.processing)
        )}>
          {caseData.processing.toUpperCase()}
        </span>
        <span className={cn(
          "px-3 py-1 text-xs font-medium rounded-full",
          getStateColor(caseData.state)
        )}>
          {caseData.state.replace('_', ' ')}
        </span>
        {/* HAC Authority Status */}
        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
          HAC: RED
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Difficulty</span>
          </div>
          <div className={cn("text-lg font-bold", getDifficultyColor(caseData.difficulty))}>
            {caseData.difficulty ? `${caseData.difficulty}/10` : 'N/A'}
          </div>
        </div>
        
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {caseData.clientScore ? `${caseData.clientScore}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Document progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Documents</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {caseData.docs.received}/{caseData.docs.expected}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {progressPercent}% complete
        </div>
      </div>

      {/* Age and lineage */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{caseData.ageMonths} months</span>
        </div>
        <div className="text-right truncate max-w-[50%]">
          {caseData.lineage}
        </div>
      </div>

      {/* Flags */}
      {caseData.flags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {caseData.flags.map((flag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 rounded-md"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
});

export default CaseCardV2;