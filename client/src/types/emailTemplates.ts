// Email Templates Type Definitions

export interface EmailTemplate {
  id: string;                // slug
  name: string;
  tags: string[];
  html: string;              // full HTML block
  text: string;              // plain-text fallback
  lastUpdated: string;       // ISO
  archived?: boolean;
  versionNote?: string;
}

export interface EmailTemplatesState {
  templates: EmailTemplate[];
  usingLocalStorage: boolean;
  draftsActive: boolean;
}

export interface ImportResult {
  success: boolean;
  count: number;
  error?: string;
}