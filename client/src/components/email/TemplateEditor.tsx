import React, { useState, useEffect, forwardRef } from 'react';
import type { EmailTemplate } from '@/types/emailTemplates';
// Button import removed - using ActionButton component for unified styling
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { updateTemplate } from '@/lib/emailTemplatesStore';
import { 
  Save, 
  X, 
  AlertCircle, 
  Eye 
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

interface TemplateEditorProps {
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
  onClose: () => void;
}

export function TemplateEditor({ template, onSave, onCancel, onClose }: TemplateEditorProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    tags: '',
    html: '',
    text: '',
    versionNote: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load template data when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        tags: template.tags.join(', '),
        html: template.html,
        text: template.text,
        versionNote: template.versionNote || ''
      });
      setHasChanges(false);
    } else {
      // New template
      setFormData({
        name: 'Untitled Template',
        tags: '',
        html: '<!-- Add your HTML content here -->',
        text: 'Add your plain text content here',
        versionNote: 'Initial version'
      });
      setHasChanges(false);
    }
  }, [template]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const normalizeTags = (tagsString: string): string[] => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Template name is required');
    }
    
    if (!formData.html.trim()) {
      errors.push('HTML content is required');
    }
    
    if (!formData.text.trim()) {
      errors.push('Plain text content is required');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const normalizedTags = normalizeTags(formData.tags);
      
      if (template) {
        // Update existing template
        const updatedTemplates = await updateTemplate(template.id, {
          name: formData.name.trim(),
          tags: normalizedTags,
          html: formData.html,
          text: formData.text,
          versionNote: formData.versionNote || undefined
        });
        
        const updatedTemplate = updatedTemplates.find(t => t.id === template.id);
        if (updatedTemplate) {
          onSave(updatedTemplate);
        }
      } else {
        // Create new template - this will be handled by the parent component
        // For now, we'll pass the form data back
        const newTemplate: EmailTemplate = {
          id: formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
          name: formData.name.trim(),
          tags: normalizedTags,
          html: formData.html,
          text: formData.text,
          lastUpdated: new Date().toISOString(),
          versionNote: formData.versionNote || undefined
        };
        onSave(newTemplate);
      }

      toast({
        title: 'Template Saved',
        description: `"${formData.name}" has been saved successfully.`
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  if (!template && formData.name === '') {
    return null; // Not ready to render
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {template ? 'Edit Template' : 'New Template'}
          </h3>
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
        </div>
        <ActionButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          data-testid="close-editor"
        >
          <X className="h-4 w-4" />
        </ActionButton>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Template Name */}
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter template name"
            data-testid="input-template-name"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="template-tags">Tags (comma-separated)</Label>
          <Input
            id="template-tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="e.g., VIP, Welcome, Process"
            data-testid="input-template-tags"
          />
          {formData.tags && (
            <div className="flex flex-wrap gap-1">
              {normalizeTags(formData.tags).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* HTML Content */}
        <div className="space-y-2">
          <Label htmlFor="template-html">HTML Content</Label>
          <Textarea
            id="template-html"
            value={formData.html}
            onChange={(e) => handleInputChange('html', e.target.value)}
            placeholder="Enter HTML content"
            rows={8}
            className="font-mono text-sm"
            data-testid="textarea-template-html"
          />
        </div>

        {/* Plain Text Content */}
        <div className="space-y-2">
          <Label htmlFor="template-text">Plain Text Content</Label>
          <Textarea
            id="template-text"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Enter plain text content"
            rows={6}
            data-testid="textarea-template-text"
          />
        </div>

        {/* Version Note */}
        <div className="space-y-2">
          <Label htmlFor="version-note">Version Note (optional)</Label>
          <Input
            id="version-note"
            value={formData.versionNote}
            onChange={(e) => handleInputChange('versionNote', e.target.value)}
            placeholder="e.g., Updated styling, Fixed typos"
            data-testid="input-version-note"
          />
        </div>

        {/* Preview Note */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <Eye className="h-4 w-4" />
          <span>Render preview on the middle pane after saving.</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <ActionButton
          variant="secondary"
          onClick={handleCancel}
          disabled={saving}
          data-testid="button-cancel-edit"
        >
          Cancel
        </ActionButton>
        <ActionButton
          onClick={handleSave}
          disabled={saving}
          data-testid="button-save-template"
        >
          {saving ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </ActionButton>
      </div>
    </div>
  );
}