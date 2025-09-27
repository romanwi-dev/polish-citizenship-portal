import React, { forwardRef } from 'react';
import type { EmailTemplate } from '@/types/emailTemplates';
// Button import removed - using ActionButton component for unified styling
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast'
import { formatDate as formatPolishDate } from '@/lib/dateFormat';
import { 
  Eye, 
  Copy, 
  FileText, 
  ExternalLink,
  Calendar,
  Edit,
  Archive,
  RotateCcw,
  Download,
  Copy as CopyIcon
} from 'lucide-react';

// Original ActionButton component for unified styling
const ActionButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
  const baseClasses = 'btn touch-target transition-all duration-200 hover:scale-105';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    ghost: 'btn-ghost'
  };
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

interface TemplateCardProps {
  template: EmailTemplate;
  isSelected: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onExport: () => void;
}

export function TemplateCard({ 
  template, 
  isSelected, 
  onPreview, 
  onEdit, 
  onDuplicate, 
  onArchive, 
  onExport 
}: TemplateCardProps) {
  const { toast } = useToast();

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: `${type} copied!`,
        description: `${type} content has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExportSingle = () => {
    const exportData = JSON.stringify([template], null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${template.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template exported",
      description: `Template "${template.name}" has been downloaded.`,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return formatPolishDate(dateString);
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-zinc-900 rounded-lg border p-3 transition-all duration-200 cursor-pointer hover:shadow-sm ${
        isSelected 
          ? 'border-blue-500 dark:border-blue-400' 
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
      onClick={onPreview}
      data-testid={`template-card-${template.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {template.name}
            </h3>
            {template.archived && (
              <Badge variant="destructive" className="text-xs">
                ARCHIVED
              </Badge>
            )}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
            Last updated: {formatDate(template.lastUpdated)}
          </p>
          {template.versionNote && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 italic">
              {template.versionNote}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {template.tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="text-xs"
          >
            {tag}
          </Badge>
        ))}
      </div>


      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          data-testid={`preview-${template.id}`}
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview
        </ActionButton>
        
        <ActionButton
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          data-testid={`edit-${template.id}`}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </ActionButton>
        
        <ActionButton
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          data-testid={`duplicate-${template.id}`}
        >
          <CopyIcon className="h-3 w-3 mr-1" />
          Duplicate
        </ActionButton>
        
        <ActionButton
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
          data-testid={`archive-${template.id}`}
        >
          {template.archived ? (
            <>
              <RotateCcw className="h-3 w-3 mr-1" />
              Restore
            </>
          ) : (
            <>
              <Archive className="h-3 w-3 mr-1" />
              Archive
            </>
          )}
        </ActionButton>
        
        <ActionButton
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handleExportSingle();
          }}
          data-testid={`export-${template.id}`}
          className="col-span-2"
        >
          <Download className="h-3 w-3 mr-1" />
          Export JSON
        </ActionButton>
      </div>
    </div>
  );
}