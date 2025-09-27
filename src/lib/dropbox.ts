/**
 * Dropbox client helpers for ingest system
 */

export interface DropboxFileEntry {
  path_lower: string;
  name: string;
  size: number;
  client_modified: string;
  content_hash?: string;
  rev?: string;
}

export interface DropboxListResult {
  entries: DropboxFileEntry[];
  has_more: boolean;
  cursor?: string;
}

class DropboxClient {
  private baseUrl = '/api/dropbox';
  
  async listFolder(path: string = '', cursor?: string): Promise<DropboxListResult> {
    const url = cursor 
      ? `${this.baseUrl}/list_folder/continue`
      : `${this.baseUrl}/list_folder`;
      
    const body = cursor 
      ? { cursor }
      : { path, recursive: true };
      
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Dropbox API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async downloadFile(path: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    return response.blob();
  }
  
  async getFileMetadata(path: string): Promise<DropboxFileEntry> {
    const response = await fetch(`${this.baseUrl}/get_metadata`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get metadata: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const dropboxClient = new DropboxClient();

export function sanitizePath(path: string): string {
  // Remove traversal attempts and normalize
  return path.replace(/\.\./g, '').replace(/\/+/g, '/');
}

export function extractCaseCodeFromPath(path: string): string | null {
  // Match patterns like /CASES/CASE-123/ or /CASES/KOWALSKI_JAN/
  const match = path.match(/\/CASES\/([^\/]+)\//i);
  return match ? match[1] : null;
}