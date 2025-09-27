// Email Templates Store - File system with localStorage fallback

import type { EmailTemplate, ImportResult } from '@/types/emailTemplates';

const STORAGE_KEY = 'emailTemplatesOverride';
const DATA_FILE_PATH = './src/data/emailTemplates.ts';

let templatesCache: EmailTemplate[] | null = null;
let usingLocalStorage = false;
let draftsActive = false;

// Initialize and check storage mode
function initializeStore(): void {
  // Check if we have localStorage override
  const override = localStorage.getItem(STORAGE_KEY);
  if (override) {
    try {
      templatesCache = JSON.parse(override);
      usingLocalStorage = true;
      draftsActive = true;
      return;
    } catch (error) {
      console.warn('Failed to parse localStorage override, falling back to default');
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Try to load from file system (this will work in development)
  try {
    // In a real implementation, this would read the actual file
    // For now, we'll import the default data
    import('@/data/emailTemplates').then((module) => {
      if (!templatesCache) {
        templatesCache = module.default || [];
        usingLocalStorage = false;
        draftsActive = false;
      }
    });
  } catch (error) {
    console.warn('Failed to load from file system, using localStorage');
    usingLocalStorage = true;
  }
}

// Load templates
export async function loadTemplates(): Promise<EmailTemplate[]> {
  if (!templatesCache) {
    initializeStore();
    
    // If still no cache, load default templates
    if (!templatesCache) {
      const module = await import('@/data/emailTemplates');
      templatesCache = module.default || [];
    }
  }

  return [...(templatesCache || [])];
}

// Save templates
export async function saveTemplates(templates: EmailTemplate[]): Promise<void> {
  templatesCache = [...templates];
  
  try {
    // Always save to localStorage as backup/draft
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    usingLocalStorage = true;
    draftsActive = true;
    
    // In a production environment, you might try to write to file system here
    // For now, we use localStorage as the persistent store
  } catch (error) {
    console.error('Failed to save templates:', error);
    throw new Error('Failed to save templates');
  }
}

// Store status
export function getStoreStatus(): { mode: string; draftsActive: boolean } {
  return {
    mode: usingLocalStorage ? 'LocalStorage' : 'File',
    draftsActive
  };
}

// Helper: Add new template
export async function addTemplate(template: Omit<EmailTemplate, 'lastUpdated'>): Promise<EmailTemplate[]> {
  const templates = await loadTemplates();
  const newTemplate: EmailTemplate = {
    ...template,
    lastUpdated: new Date().toISOString()
  };
  
  // Ensure unique ID
  let uniqueId = template.id;
  let counter = 1;
  while (templates.some(t => t.id === uniqueId)) {
    uniqueId = `${template.id}-${counter}`;
    counter++;
  }
  newTemplate.id = uniqueId;
  
  const updatedTemplates = [...templates, newTemplate];
  await saveTemplates(updatedTemplates);
  return updatedTemplates;
}

// Helper: Update template
export async function updateTemplate(id: string, patch: Partial<EmailTemplate>): Promise<EmailTemplate[]> {
  const templates = await loadTemplates();
  const index = templates.findIndex(t => t.id === id);
  
  if (index === -1) {
    throw new Error(`Template with id "${id}" not found`);
  }
  
  const updatedTemplate: EmailTemplate = {
    ...templates[index],
    ...patch,
    id, // ID is immutable
    lastUpdated: new Date().toISOString()
  };
  
  const updatedTemplates = [...templates];
  updatedTemplates[index] = updatedTemplate;
  
  await saveTemplates(updatedTemplates);
  return updatedTemplates;
}

// Helper: Archive/restore template
export async function archiveTemplate(id: string, archived = true): Promise<EmailTemplate[]> {
  return updateTemplate(id, { archived });
}

// Helper: Duplicate template
export async function duplicateTemplate(id: string): Promise<EmailTemplate[]> {
  const templates = await loadTemplates();
  const template = templates.find(t => t.id === id);
  
  if (!template) {
    throw new Error(`Template with id "${id}" not found`);
  }
  
  const duplicatedTemplate = {
    ...template,
    id: `${id}-copy`,
    name: `${template.name} (Copy)`,
    lastUpdated: new Date().toISOString(),
    versionNote: 'Duplicated template'
  };
  
  return addTemplate(duplicatedTemplate);
}

// Helper: Export JSON
export function exportJSON(templates?: EmailTemplate[]): string {
  if (!templates) {
    // If no templates provided, export current non-archived
    loadTemplates().then(allTemplates => {
      return JSON.stringify(allTemplates.filter(t => !t.archived), null, 2);
    });
  }
  
  return JSON.stringify(templates?.filter(t => !t.archived) || [], null, 2);
}

// Helper: Import JSON
export async function importJSON(jsonString: string): Promise<ImportResult> {
  try {
    const importedTemplates = JSON.parse(jsonString) as EmailTemplate[];
    
    // Validate structure
    if (!Array.isArray(importedTemplates)) {
      return { success: false, count: 0, error: 'Invalid JSON: expected array' };
    }
    
    // Validate each template
    for (const template of importedTemplates) {
      if (!template.id || !template.name || !template.html || !template.text) {
        return { 
          success: false, 
          count: 0, 
          error: 'Invalid template structure: missing required fields' 
        };
      }
    }
    
    // Merge with existing templates (preserve existing, add new ones)
    const existingTemplates = await loadTemplates();
    const mergedTemplates = [...existingTemplates];
    
    let addedCount = 0;
    for (const importedTemplate of importedTemplates) {
      const exists = mergedTemplates.find(t => t.id === importedTemplate.id);
      if (!exists) {
        mergedTemplates.push({
          ...importedTemplate,
          lastUpdated: new Date().toISOString(),
          versionNote: 'Imported template'
        });
        addedCount++;
      }
    }
    
    await saveTemplates(mergedTemplates);
    
    return { success: true, count: addedCount };
  } catch (error) {
    return { 
      success: false, 
      count: 0, 
      error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Clear drafts and revert to file system
export async function clearDrafts(): Promise<EmailTemplate[]> {
  localStorage.removeItem(STORAGE_KEY);
  templatesCache = null;
  usingLocalStorage = false;
  draftsActive = false;
  
  // Reload from file system
  return loadTemplates();
}