import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MoreHorizontal, Eye, Settings, FileText, Users } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, offset, flip, shift, size } from '@floating-ui/react';
import { cn } from '@/lib/utils';
import '@/styles/tokens.css';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string;
    stage: string;
    tier: string;
    score: number;
    ageMonths: number;
    updatedAt: string;
    processing: string;
    state: string;
  };
  onAction?: (action: string, clientId: string) => void;
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
    case 'completed': return 'pc-badge--stage-completed';
    case 'in_progress': return 'pc-badge--stage-in_progress';
    case 'pending': return 'pc-badge--stage-pending';
    case 'stalled': return 'pc-badge--stage-stalled';
    default: return 'pc-badge--stage-default';
  }
}

const ClientCardDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  clientId: string;
  onAction?: (action: string, clientId: string) => void;
}> = ({ isOpen, onClose, triggerRef, clientId, onAction }) => {
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

  if (!isOpen) return null;

  const dropdownActions = [
    { label: 'Edit', action: 'edit', icon: Settings },
    { label: 'Postpone', action: 'postpone', icon: FileText },
    { label: 'Suspend', action: 'suspend', icon: FileText },
    { label: 'Cancel', action: 'cancel', icon: FileText },
    { label: 'Archive', action: 'archive', icon: FileText },
    { label: 'Delete', action: 'delete', icon: FileText, variant: 'danger' }
  ];

  return createPortal(
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="pc-dropdown"
    >
      {dropdownActions.map((action) => {
        const Icon = action.icon;
        return (
          <div
            key={action.action}
            className={cn('pc-dropdown-item', action.variant === 'danger' && 'danger')}
            onClick={() => {
              onAction?.(action.action, clientId);
              onClose();
            }}
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

export const ClientCard: React.FC<ClientCardProps> = memo(({ client, onAction, className }) => {
  const [, navigate] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  const go = useCallback((tab: string) => {
    navigate(`/case/${client.id}?tab=${tab}`);
  }, [navigate, client.id]);

  const handleView = useCallback(() => go('overview'), [go]);
  const handleControlRoom = useCallback(() => go('tasks'), [go]);
  const handleOBY = useCallback(() => go('oby'), [go]);
  const handleUSC = useCallback(() => go('usc'), [go]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  return (
    <section id="portal-clientcard" className="portal-scope">
      <div className={cn("pc-card w-full min-w-0 md:min-h-[400px] flex flex-col", className)}>
        <div className="p-4 md:p-8 space-y-4 md:space-y-6 flex-1 flex flex-col">
          {/* Timeline */}
          <div className="text-xs text-[var(--pc-text-dim)] font-medium">
            Updated: {new Date(client.updatedAt).toLocaleDateString('pl-PL')} - ID: {client.id}
          </div>
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-bold text-[var(--pc-text-primary)] text-3xl md:text-4xl uppercase truncate" 
                title={client.name}
              >
                {client.name.split(' ').pop()}
              </h3>
              <p className="text-[var(--pc-text-dim)] text-sm mt-1 truncate">{client.email}</p>
            </div>
            <button
              ref={dropdownTriggerRef}
              onClick={toggleDropdown}
              className="pc-btn pc-btn--ghost pc-btn--icon flex-shrink-0"
              data-testid="button-kebab"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Badges */}
          <div className="pc-badge-group">
            <span className={cn('pc-badge', getStageBadgeVariant(client.stage))}>
              {client.stage.replace('_', ' ')}
            </span>
            <span className="pc-badge pc-badge--score">
              {client.score}%
            </span>
            <span className="pc-badge pc-badge--age">
              {client.ageMonths}mo
            </span>
          </div>

          {/* Tier Badge */}
          <div className="flex justify-center">
            <span className={cn(
              'px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg',
              getTierVariant(client.tier)
            )}>
              {client.tier}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button
              onClick={handleView}
              className="pc-btn pc-btn--secondary pc-btn--icon"
              data-testid="button-view"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            <button
              onClick={handleControlRoom}
              className="pc-btn pc-btn--primary pc-btn--icon"
              data-testid="button-control-room"
            >
              <Settings className="h-4 w-4" />
              Control Room
            </button>
            <button
              onClick={handleOBY}
              className="pc-btn pc-btn--primary pc-btn--icon"
              data-testid="button-draft-oby"
            >
              <FileText className="h-4 w-4" />
              Draft OBY
            </button>
            <button
              onClick={handleUSC}
              className="pc-btn pc-btn--secondary pc-btn--icon"
              data-testid="button-usc-task"
            >
              <Users className="h-4 w-4" />
              USC Task
            </button>
          </div>
        </div>

        <ClientCardDropdown
          isOpen={dropdownOpen}
          onClose={closeDropdown}
          triggerRef={dropdownTriggerRef}
          clientId={client.id}
          onAction={onAction}
        />
      </div>
    </section>
  );
});

ClientCard.displayName = 'ClientCard';