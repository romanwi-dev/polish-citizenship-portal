import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  Mail, 
  MoreHorizontal,
  Settings,
  FileText,
  Plus,
  Eye,
  Edit3,
  Copy,
  Download,
  Pause,
  X,
  Archive,
  Trash2,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  IOS26Card,
  IOS26CardHeader,
  IOS26CardBody
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Case {
  id: string;
  client: {
    name: string;
    email: string;
  };
  state: string;
  processing: string;
  difficulty: number | null;
  clientScore: number | null;
  ageMonths: number;
  lineage: string;
  confidence: number | null;
  docs: {
    received: number;
    expected: number;
  };
  flags: string[];
}

interface CaseCardV3Props {
  case: Case;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onAction: (action: string, id: string) => void;
}

function getProcessingColor(processing: string): string {
  switch (processing.toLowerCase()) {
    case 'tier1': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'tier2': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'tier3': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'rush': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function getStateColor(state: string): string {
  switch (state.toLowerCase()) {
    case 'intake': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'usc_in_flight': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'oby_drafting': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'usc_ready': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'oby_submittable': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
    case 'oby_submitted': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
    case 'decision_received': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function getDifficultyColor(difficulty: number | null): string {
  if (difficulty === null) return 'text-muted-foreground';
  if (difficulty >= 8) return 'text-red-400';
  if (difficulty >= 6) return 'text-amber-400';
  if (difficulty >= 4) return 'text-yellow-400';
  return 'text-green-400';
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

// ActionButton component matching AgentControlRoom styling
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }>(({ children, variant = "primary", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "btn btn-primary",
    secondary: "btn",
    ghost: "btn btn-ghost",
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        btnVariants[variant],
        "touch-target transition-all duration-200 hover:scale-105",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// EnhancedStatusCard wrapper matching AgentControlRoom styling
const EnhancedStatusCard = ({ title, subtitle, icon: Icon, status, children, className = "", ...props }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    className={cn("w-full", className)}
    {...props}
  >
    <IOS26Card strong={true} className="h-full">
      <div className="flex items-start justify-between p-4">
        <div className="flex flex-col space-y-1">
          {title && (
            <h3 className="text-2xl font-bold leading-none tracking-tight text-[var(--text)]">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--text-subtle)]">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            status === 'green' ? 'bg-green-500/20 text-green-400' :
            status === 'amber' ? 'bg-amber-500/20 text-amber-400' :
            status === 'red' ? 'bg-red-500/20 text-red-400' :
            'bg-muted/20 text-muted-foreground'
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <IOS26CardBody>
        {children}
      </IOS26CardBody>
    </IOS26Card>
  </motion.div>
);

const CaseCardV3 = memo(function CaseCardV3({ case: caseData, onEdit, onView, onAction }: CaseCardV3Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  // Fix the undefined handleOpenEdit error
  const handleOpenEdit = useCallback(() => {
    setDropdownOpen(false);
    onEdit(caseData.id);
  }, [onEdit, caseData.id]);

  // Action handlers - all properly defined
  const handleView = useCallback(() => {
    setDropdownOpen(false);
    onView(caseData.id);
  }, [onView, caseData.id]);

  const handleCopy = useCallback(() => {
    setDropdownOpen(false);
    navigator.clipboard.writeText(caseData.id);
    onAction('copy', caseData.id);
  }, [onAction, caseData.id]);

  const handleExport = useCallback(() => {
    setDropdownOpen(false);
    onAction('export', caseData.id);
  }, [onAction, caseData.id]);

  const handlePostpone = useCallback(() => {
    setDropdownOpen(false);
    onAction('postpone', caseData.id);
  }, [onAction, caseData.id]);

  const handleSuspend = useCallback(() => {
    setDropdownOpen(false);
    onAction('suspend', caseData.id);
  }, [onAction, caseData.id]);

  const handleCancel = useCallback(() => {
    setDropdownOpen(false);
    onAction('cancel', caseData.id);
  }, [onAction, caseData.id]);

  const handleArchive = useCallback(() => {
    setDropdownOpen(false);
    onAction('archive', caseData.id);
  }, [onAction, caseData.id]);

  const handleDelete = useCallback(() => {
    setDropdownOpen(false);
    onAction('delete', caseData.id);
  }, [onAction, caseData.id]);

  const handleOpenControlRoom = useCallback(() => {
    onAction('control_room', caseData.id);
  }, [onAction, caseData.id]);

  const handleDraftOBY = useCallback(() => {
    onAction('draft_oby', caseData.id);
  }, [onAction, caseData.id]);

  const handleCreateUSCTask = useCallback(() => {
    onAction('create_usc_task', caseData.id);
  }, [onAction, caseData.id]);

  const progressPercent = caseData.docs.expected > 0 
    ? Math.round((caseData.docs.received / caseData.docs.expected) * 100)
    : 0;

  const caseIdShort = caseData.id.length > 10 ? `C-${caseData.id.slice(-8)}` : `C-${caseData.id}`;
  
  // Determine card status based on case state and confidence
  const cardStatus = caseData.confidence && caseData.confidence > 80 ? 'green' : 
                    caseData.confidence && caseData.confidence > 60 ? 'amber' : 'red';

  return (
    <div 
      className="w-full" 
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
      data-testid={`case-card-${caseData.id}`}
    >
      <EnhancedStatusCard
        title={caseData.client.name}
        subtitle={`${caseIdShort} • ${caseData.client.email}`}
        icon={User}
        status={cardStatus}
        className="h-full min-h-0"
      >
        {/* Header Actions Menu */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {/* Processing Tier Badge */}
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              getProcessingColor(caseData.processing)
            )}>
              {caseData.processing.toUpperCase()}
            </div>
            
            {/* Stage Badge */}
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              getStateColor(caseData.state)
            )}>
              {caseData.state.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            
            {/* HAC Status Badge - Dynamic Color */}
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border",
              caseData.confidence && caseData.confidence > 80
                ? "bg-green-500/20 text-green-400 border-green-500/30" // GREEN status
                : "bg-red-500/20 text-red-400 border-red-500/30"       // RED status
            )}>
              HAC: {caseData.confidence && caseData.confidence > 80 ? 'GREEN' : 'RED'}
            </div>
          </div>
          
          {/* Simple Menu Button - NO DROPDOWN COMPLEXITY */}
          <div className="relative" ref={dropdownRef}>
            <button
              className={cn(
                "h-8 w-8 p-0 rounded-full flex items-center justify-center",
                "hover:bg-accent/50 transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
              data-testid={`case-menu-trigger-${caseData.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleOpenEdit();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleView();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleCopy();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy ID
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleExport();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handlePostpone();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-amber-400"
                  >
                    <Clock className="h-4 w-4" />
                    Postpone
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSuspend();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-amber-400"
                  >
                    <Pause className="h-4 w-4" />
                    Suspend
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleCancel();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-400"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleArchive();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      handleDelete();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Difficulty</div>
            <div className={cn("text-lg font-bold", getDifficultyColor(caseData.difficulty))}>
              {caseData.difficulty ? `${caseData.difficulty}/10` : 'N/A'}
            </div>
          </div>
          
          <div className="text-center p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Score</div>
            <div className="text-lg font-bold text-[var(--text)]">
              {caseData.clientScore ? `${caseData.clientScore}%` : 'N/A'}
            </div>
          </div>
          
          <div className="text-center p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Age</div>
            <div className="text-lg font-bold text-[var(--text)]">
              {caseData.ageMonths}mo
            </div>
          </div>
        </div>

        {/* Document Progress */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-[var(--text-subtle)] font-medium">Documents</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">
              {caseData.docs.received}/{caseData.docs.expected}
            </span>
          </div>
          <div className="w-full bg-[var(--surface)] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-subtle)] font-medium">
            {progressPercent}% complete • {caseData.lineage}
          </div>
        </div>

        {/* Flags */}
        {caseData.flags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {caseData.flags.slice(0, 3).map((flag, index) => (
              <div
                key={index}
                className="px-3 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full font-medium border border-amber-500/30"
              >
                {flag}
              </div>
            ))}
            {caseData.flags.length > 3 && (
              <div className="px-3 py-1 text-xs bg-[var(--surface)] text-[var(--text-subtle)] rounded-full font-medium">
                +{caseData.flags.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30">
          <ActionButton
            onClick={handleOpenControlRoom}
            variant="ghost"
            className="flex-1 min-w-0 gap-2 text-xs font-medium justify-center touch-target"
            data-testid={`btn-control-room-${caseData.id}`}
          >
            <Settings className="h-3 w-3" />
            <span className="hidden sm:inline">Control Room</span>
            <span className="sm:hidden">Control</span>
          </ActionButton>
          
          <ActionButton
            onClick={handleDraftOBY}
            variant="ghost"
            className="flex-1 min-w-0 gap-2 text-xs font-medium justify-center touch-target"
            data-testid={`btn-draft-oby-${caseData.id}`}
          >
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Draft OBY</span>
            <span className="sm:hidden">OBY</span>
          </ActionButton>
          
          <ActionButton
            onClick={handleCreateUSCTask}
            variant="ghost"
            className="flex-1 min-w-0 gap-2 text-xs font-medium justify-center touch-target"
            data-testid={`btn-usc-task-${caseData.id}`}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">USC Task</span>
            <span className="sm:hidden">USC</span>
          </ActionButton>
        </div>
      </EnhancedStatusCard>
    </div>
  );
});

CaseCardV3.displayName = 'CaseCardV3';

export default CaseCardV3;