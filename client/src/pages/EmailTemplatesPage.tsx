import React, { useState, useEffect, useMemo } from 'react';
import type { EmailTemplate } from '@/types/emailTemplates';
import { TemplateCard } from '@/components/email/TemplateCard';
import { HtmlPreview } from '@/components/email/HtmlPreview';
import { TemplateEditor } from '@/components/email/TemplateEditor';
import { Input } from '@/components/ui/input';
// Button import removed - using ActionButton component for unified styling
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  loadTemplates, 
  saveTemplates, 
  addTemplate, 
  duplicateTemplate, 
  archiveTemplate, 
  exportJSON, 
  importJSON,
  getStoreStatus
} from '@/lib/emailTemplatesStore';
import { 
  Search, 
  Mail, 
  Plus, 
  Upload, 
  Download, 
  HelpCircle,
  AlertCircle,
  Edit
} from 'lucide-react';
import '@/styles/email-templates.css';

// ActionButton component for unified styling across AI Agent sections
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}>(({ children, variant = "primary", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "btn btn-primary",
    secondary: "btn",
    ghost: "btn btn-ghost",
  };
  
  return (
    <button
      ref={ref}
      className={`${btnVariants[variant]} touch-target ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState({ mode: 'File', draftsActive: false });

  // Load templates on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadTemplates();
        setTemplates(data);
        setSelectedTemplate(data[0] || null);
        setStoreStatus(getStoreStatus());
      } catch (error) {
        toast({
          title: 'Load Error',
          description: 'Failed to load templates',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    
    // Filter archived
    if (!showArchived) {
      filtered = filtered.filter(t => !t.archived);
    }
    
    // Filter search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [templates, searchQuery, showArchived]);

  const archivedCount = templates.filter(t => t.archived).length;

  // Template actions
  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate(null);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const updatedTemplates = await duplicateTemplate(template.id);
      setTemplates(updatedTemplates);
      toast({
        title: 'Template Duplicated',
        description: `Created copy of "${template.name}"`
      });
    } catch (error) {
      toast({
        title: 'Duplicate Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleArchive = async (template: EmailTemplate) => {
    try {
      const newArchivedState = !template.archived;
      const updatedTemplates = await archiveTemplate(template.id, newArchivedState);
      setTemplates(updatedTemplates);
      
      // If we archived the currently selected template, clear selection
      if (newArchivedState && selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
      
      toast({
        title: newArchivedState ? 'Template Archived' : 'Template Restored',
        description: `"${template.name}" has been ${newArchivedState ? 'archived' : 'restored'}`
      });
    } catch (error) {
      toast({
        title: 'Archive Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleExport = (template: EmailTemplate) => {
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
      title: 'Template Exported',
      description: `"${template.name}" downloaded as JSON`
    });
  };

  // Global actions
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setSelectedTemplate(null);
    // The editor will handle new template creation
  };

  const handleExportAll = () => {
    const nonArchivedTemplates = templates.filter(t => !t.archived);
    const exportData = JSON.stringify(nonArchivedTemplates, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-templates-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Templates Exported',
      description: `${nonArchivedTemplates.length} templates downloaded`
    });
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: 'Import Error',
        description: 'Please paste JSON data',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await importJSON(importData);
      if (result.success) {
        const updatedTemplates = await loadTemplates();
        setTemplates(updatedTemplates);
        setImportData('');
        setShowImportModal(false);
        
        toast({
          title: 'Import Successful',
          description: `Imported ${result.count} new templates`
        });
      } else {
        toast({
          title: 'Import Failed',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Error',
        description: 'Failed to import templates',
        variant: 'destructive'
      });
    }
  };

  // Editor callbacks
  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      let updatedTemplates: EmailTemplate[];
      
      if (editingTemplate) {
        // Update existing
        updatedTemplates = await saveTemplates(
          templates.map(t => t.id === editingTemplate.id ? template : t)
        );
      } else {
        // Create new
        updatedTemplates = await addTemplate(template);
      }
      
      setTemplates(updatedTemplates);
      setSelectedTemplate(template);
      setEditingTemplate(null);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" data-testid="email-templates-page">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Email Templates</h1>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>
                    {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                    {archivedCount > 0 && ` • ${archivedCount} archived`}
                  </span>
                  <Badge variant={storeStatus.mode === 'LocalStorage' ? 'secondary' : 'outline'}>
                    Store: {storeStatus.mode}
                  </Badge>
                  {storeStatus.draftsActive && (
                    <Badge variant="warning" className="text-amber-700 bg-amber-100">
                      Drafts active (not committed)
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Unified Action Buttons */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <ActionButton
                variant="ghost"
                onClick={handleNewTemplate}
                data-testid="button-new-template"
                className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                New Template
              </ActionButton>
              
              <ActionButton
                variant="ghost"
                onClick={() => setShowImportModal(true)}
                data-testid="button-import"
                className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              >
                <Upload className="h-4 w-4" />
                Import
              </ActionButton>
              
              <ActionButton
                variant="ghost"
                onClick={handleExportAll}
                data-testid="button-export-all"
                className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              >
                <Download className="h-4 w-4" />
                Export All
              </ActionButton>
              
              <ActionButton
                variant="ghost"
                title="Copy HTML from Safari render and paste into Apple Mail"
                className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="et-grid">
          {/* Left Column - Template List */}
          <div className="template-list p-4 space-y-4">
            {/* Search & Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-templates"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-archived" 
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                />
                <Label htmlFor="show-archived" className="text-sm">
                  Show Archived ({archivedCount})
                </Label>
              </div>
            </div>

            {/* Template Cards */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  {searchQuery ? 'No templates found matching your search.' : 'No templates available.'}
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onPreview={() => handlePreview(template)}
                    onEdit={() => handleEdit(template)}
                    onDuplicate={() => handleDuplicate(template)}
                    onArchive={() => handleArchive(template)}
                    onExport={() => handleExport(template)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Middle Column - Preview */}
          <div className="template-preview">
            {selectedTemplate ? (
              <HtmlPreview template={selectedTemplate} />
            ) : (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  No template selected
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Choose a template from the list to preview it here.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Editor */}
          <div className="template-editor">
            {editingTemplate !== null ? (
              <TemplateEditor
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => setEditingTemplate(null)}
                onClose={() => setEditingTemplate(null)}
              />
            ) : (
              <div className="p-8 text-center">
                <Edit className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  Ready to edit
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Click "Edit" on any template or create a new one to start editing.
                </p>
                <ActionButton 
                  variant="ghost"
                  onClick={handleNewTemplate} 
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  New Template
                </ActionButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Import Templates
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-data">JSON Data</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste exported JSON data here..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    Templates with existing IDs will be skipped. Only new templates will be imported.
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <ActionButton
                  variant="ghost"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                  }}
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </ActionButton>
                <ActionButton 
                  variant="ghost"
                  onClick={handleImport}
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                >
                  Import
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}