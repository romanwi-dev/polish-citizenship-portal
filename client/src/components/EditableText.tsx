import { useState, useRef, useEffect } from 'react';
// EditModeContext removed - disabled edit mode
import { useEditableContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Edit3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  pageId?: string;
  multiline?: boolean;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';
  placeholder?: string;
  children?: never; // Prevent children prop conflicts
}

export function EditableText({
  contentKey,
  fallback = '',
  pageId = 'default',
  multiline = false,
  className = '',
  as: Component = 'span',
  placeholder
}: EditableTextProps) {
  const isEditMode = false; // Edit mode disabled
  const { getContent, updateContent, isUpdating, updateError, isUpdateError } = useEditableContent({ pageId });
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [lastSaveAttempt, setLastSaveAttempt] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const currentValue = getContent(contentKey, fallback);
  const displayPlaceholder = placeholder || `Click to edit ${contentKey}`;

  // Update local value when current value changes
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(currentValue);
    }
  }, [currentValue, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [isEditing]);

  // Close editor only when save succeeds
  useEffect(() => {
    if (lastSaveAttempt && !isUpdating && !isUpdateError) {
      // Save succeeded - close editor
      setIsEditing(false);
      setLastSaveAttempt(null);
    }
  }, [lastSaveAttempt, isUpdating, isUpdateError]);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    // CRITICAL: Prevent navigation/propagation when starting edit mode
    e.preventDefault();
    e.stopPropagation();
    
    setLocalValue(currentValue);
    setIsEditing(true);
    setLastSaveAttempt(null); // Clear any previous save errors
  };

  const handleSave = () => {
    const saveId = Date.now().toString();
    setLastSaveAttempt(saveId);
    updateContent(contentKey, localValue);
    // DO NOT close editor here - wait for success/error
  };

  const handleCancel = () => {
    setLocalValue(currentValue);
    setIsEditing(false);
    setLastSaveAttempt(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  // Don't show editing UI if not in edit mode
  if (!isEditMode) {
    return (
      <Component 
        className={className}
        data-testid={`text-content-${contentKey}`}
      >
        {currentValue ?? fallback}
      </Component>
    );
  }

  // Show editing interface when in edit mode and editing
  if (isEditing) {
    return (
      <div 
        className="relative inline-block min-w-[400px] w-full max-w-2xl"
        onMouseDownCapture={(e) => { e.stopPropagation(); }}
        onClickCapture={(e) => { e.stopPropagation(); }}
        onPointerDownCapture={(e) => { e.stopPropagation(); }}
        onKeyDownCapture={(e) => { e.stopPropagation(); }}
      >
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] w-full text-base p-4 resize-both"
            placeholder={displayPlaceholder}
            data-testid={`textarea-edit-${contentKey}`}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-[400px] w-full text-base p-4 h-12"
            placeholder={displayPlaceholder}
            data-testid={`input-edit-${contentKey}`}
          />
        )}
        
        <div className="flex items-center gap-1 mt-1">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isUpdating}
            className="h-7 px-2"
            data-testid={`button-save-${contentKey}`}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="h-7 px-2"
            data-testid={`button-cancel-${contentKey}`}
          >
            <X className="h-3 w-3" />
          </Button>
          
          <div className="text-xs text-muted-foreground ml-2">
            {multiline ? 'Ctrl+Enter to save' : 'Enter to save'} • Esc to cancel
          </div>
        </div>
        
        {/* Show error state if save failed */}
        {lastSaveAttempt && isUpdateError && updateError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700" data-testid={`error-save-${contentKey}`}>
            <div className="font-medium">Save failed:</div>
            <div>{updateError.message || 'Please try again.'}</div>
          </div>
        )}
      </div>
    );
  }

  // Show editable text with hover effect when in edit mode but not editing
  return (
    <Component
      className={cn(
        className,
        'relative cursor-pointer rounded px-1 py-0.5 transition-colors',
        'hover:bg-orange-50 hover:outline hover:outline-1 hover:outline-orange-300',
        'group'
      )}
      onClick={handleStartEdit}
      data-testid={`editable-text-${contentKey}`}
      title={`Click to edit: ${contentKey}`}
    >
      {currentValue ?? (
        <span className="text-muted-foreground italic">
          {displayPlaceholder}
        </span>
      )}
      
      <Edit3 className="h-3 w-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" />
    </Component>
  );
}