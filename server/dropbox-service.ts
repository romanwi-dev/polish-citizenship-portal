import { Dropbox } from 'dropbox';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Dropbox service for document management in Polish citizenship portal
export class DropboxService {
  private dbx: Dropbox;
  
  constructor() {
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('DROPBOX_ACCESS_TOKEN not set - Dropbox features will be disabled');
      // Initialize with placeholder to prevent errors
      this.dbx = new Dropbox({ 
        accessToken: 'placeholder',
        fetch: fetch
      });
      return;
    }
    
    this.dbx = new Dropbox({ 
      accessToken,
      fetch: fetch // Use native fetch
    });
  }
  
  private isConfigured(): boolean {
    return !!process.env.DROPBOX_ACCESS_TOKEN && process.env.DROPBOX_ACCESS_TOKEN !== 'placeholder';
  }

  // Upload client document to organized folder structure
  async uploadClientDocument(
    clientId: string, 
    fileName: string, 
    fileBuffer: Buffer, 
    documentType: 'passport' | 'birth_certificate' | 'marriage_certificate' | 'other' = 'other'
  ) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Dropbox not configured. Please set DROPBOX_ACCESS_TOKEN.' };
    }
    
    try {
      // Create organized folder structure: /Clients/{clientId}/{documentType}/
      const folderPath = `/Clients/${clientId}/${documentType}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Ensure folder exists
      await this.createFolderStructure(folderPath);
      
      // Upload file
      const response = await this.dbx.filesUpload({
        path: filePath,
        contents: fileBuffer,
        mode: 'overwrite',
        autorename: true
      });
      
      // Get shareable link
      const shareLink = await this.createShareableLink(filePath);
      
      return {
        success: true,
        dropboxPath: response.result.path_display,
        shareLink: shareLink.url,
        fileId: response.result.id,
        size: response.result.size
      };
    } catch (error) {
      console.error('Dropbox upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Create folder structure for client organization
  private async createFolderStructure(folderPath: string) {
    try {
      await this.dbx.filesCreateFolderV2({
        path: folderPath,
        autorename: false
      });
    } catch (error: any) {
      // Ignore error if folder already exists
      if (error?.error?.error_summary?.includes('path/conflict/folder')) {
        return;
      }
      throw error;
    }
  }

  // Create shareable link for client access
  async createShareableLink(filePath: string) {
    try {
      const response = await this.dbx.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public',
          audience: 'public',
          access: 'viewer'
        }
      });
      
      return {
        url: response.result.url,
        expires: response.result.expires
      };
    } catch (error: any) {
      // If link already exists, get existing link
      if (error?.error?.error_summary?.includes('shared_link_already_exists')) {
        const links = await this.dbx.sharingListSharedLinks({
          path: filePath
        });
        
        if (links.result.links.length > 0) {
          return {
            url: links.result.links[0].url,
            expires: links.result.links[0].expires
          };
        }
      }
      throw error;
    }
  }

  // List all documents for a specific client
  async listClientDocuments(clientId: string) {
    try {
      const folderPath = `/Clients/${clientId}`;
      
      const response = await this.dbx.filesListFolder({
        path: folderPath,
        recursive: true
      });
      
      const documents = response.result.entries
        .filter((entry: any) => entry['.tag'] === 'file')
        .map((file: any) => ({
          name: file.name,
          path: file.path_display,
          size: file.size,
          modified: file.server_modified,
          id: file.id
        }));
      
      return {
        success: true,
        documents
      };
    } catch (error) {
      console.error('Error listing client documents:', error);
      return {
        success: false,
        documents: [],
        error: error instanceof Error ? error.message : 'Failed to list documents'
      };
    }
  }

  // Download document from Dropbox
  async downloadDocument(filePath: string) {
    try {
      const response = await this.dbx.filesDownload({ path: filePath });
      
      return {
        success: true,
        fileBuffer: response.result.fileBinary,
        metadata: {
          name: response.result.name,
          size: response.result.size,
          modified: response.result.server_modified
        }
      };
    } catch (error) {
      console.error('Error downloading document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  // Delete document from Dropbox
  async deleteDocument(filePath: string) {
    try {
      await this.dbx.filesDeleteV2({ path: filePath });
      
      return {
        success: true,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  // Get Dropbox account info and storage usage
  async getAccountInfo() {
    try {
      const accountInfo = await this.dbx.usersGetCurrentAccount();
      const spaceUsage = await this.dbx.usersGetSpaceUsage();
      
      return {
        success: true,
        account: {
          name: accountInfo.result.name.display_name,
          email: accountInfo.result.email,
          accountType: accountInfo.result.account_type['.tag']
        },
        storage: {
          used: spaceUsage.result.used,
          allocated: spaceUsage.result.allocation?.allocated || 0,
          usedPercentage: Math.round((spaceUsage.result.used / (spaceUsage.result.allocation?.allocated || 1)) * 100)
        }
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account info'
      };
    }
  }

  // Search documents across all clients
  async searchDocuments(query: string, clientId?: string) {
    try {
      const searchPath = clientId ? `/Clients/${clientId}` : '/Clients';
      
      const response = await this.dbx.filesSearchV2({
        query,
        options: {
          path: searchPath,
          max_results: 100,
          file_status: 'active'
        }
      });
      
      const results = response.result.matches.map(match => {
        const metadata = match.metadata.metadata;
        return {
          name: metadata.name,
          path: metadata.path_display,
          size: metadata.size,
          modified: metadata.server_modified,
          highlightSpans: match.highlight_spans || []
        };
      });
      
      return {
        success: true,
        results,
        totalCount: results.length
      };
    } catch (error) {
      console.error('Error searching documents:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  // Create client folder on first document upload
  async initializeClientFolder(clientId: string, clientName: string) {
    try {
      const clientFolder = `/Clients/${clientId}`;
      
      // Create main client folder
      await this.createFolderStructure(clientFolder);
      
      // Create subfolders for different document types
      const documentTypes = ['passport', 'birth_certificate', 'marriage_certificate', 'genealogy', 'other'];
      
      for (const docType of documentTypes) {
        await this.createFolderStructure(`${clientFolder}/${docType}`);
      }
      
      // Create a client info file
      const infoContent = `Client: ${clientName}\nFolder created: ${new Date().toISOString()}\nClient ID: ${clientId}`;
      
      await this.dbx.filesUpload({
        path: `${clientFolder}/client_info.txt`,
        contents: Buffer.from(infoContent),
        mode: 'overwrite'
      });
      
      return {
        success: true,
        message: `Client folder structure created for ${clientName}`,
        folderPath: clientFolder
      };
    } catch (error) {
      console.error('Error initializing client folder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize client folder'
      };
    }
  }
}

// Export singleton instance
export const dropboxService = new DropboxService();