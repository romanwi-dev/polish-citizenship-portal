import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

// Custom authentication provider for Microsoft Graph
class SimpleAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

// Microsoft OneDrive/Word service for document management
export class MicrosoftService {
  private graphClient: Client;
  
  constructor() {
    const accessToken = process.env.MICROSOFT_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('MICROSOFT_ACCESS_TOKEN not set - Microsoft services will be disabled');
      // Initialize with placeholder to prevent errors
      this.graphClient = Client.init({
        authProvider: new SimpleAuthProvider('placeholder')
      });
      return;
    }
    
    this.graphClient = Client.init({
      authProvider: new SimpleAuthProvider(accessToken)
    });
  }
  
  private isConfigured(): boolean {
    return !!process.env.MICROSOFT_ACCESS_TOKEN && process.env.MICROSOFT_ACCESS_TOKEN !== 'placeholder';
  }

  // Create client folder in OneDrive
  async initializeClientFolder(clientId: string, clientName: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      const folderName = `${clientName} - ${clientId}`;
      
      // Create main client folder
      const folder = await this.graphClient
        .api('/me/drive/root/children')
        .post({
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        });

      // Create subfolders for document organization
      const subfolders = [
        'Passports',
        'Birth Certificates', 
        'Marriage Certificates',
        'Generated Documents',
        'Other Documents'
      ];

      for (const subfolder of subfolders) {
        await this.graphClient
          .api(`/me/drive/items/${folder.id}/children`)
          .post({
            name: subfolder,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'rename'
          });
      }

      return { 
        success: true, 
        folderId: folder.id,
        folderPath: `/me/drive/items/${folder.id}`,
        message: `Client folder created: ${folderName}`
      };
    } catch (error) {
      console.error('Microsoft folder creation error:', error);
      return { 
        success: false, 
        error: 'Failed to create client folder in OneDrive' 
      };
    }
  }

  // Upload document to OneDrive
  async uploadClientDocument(
    clientId: string,
    fileName: string,
    fileBuffer: Buffer,
    documentType: 'passport' | 'birth_certificate' | 'marriage_certificate' | 'other' = 'other'
  ) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      // Map document types to folder names
      const folderMap = {
        passport: 'Passports',
        birth_certificate: 'Birth Certificates',
        marriage_certificate: 'Marriage Certificates',
        other: 'Other Documents'
      };

      const folderName = folderMap[documentType];
      
      // Search for client folder
      const searchResult = await this.graphClient
        .api('/me/drive/root/search')
        .query({ q: clientId })
        .get();

      if (!searchResult.value || searchResult.value.length === 0) {
        return { success: false, error: 'Client folder not found. Please initialize first.' };
      }

      const clientFolder = searchResult.value[0];
      
      // Find the appropriate subfolder
      const subfolders = await this.graphClient
        .api(`/me/drive/items/${clientFolder.id}/children`)
        .get();

      const targetFolder = subfolders.value.find((folder: any) => 
        folder.name === folderName && folder.folder
      );

      if (!targetFolder) {
        return { success: false, error: `${folderName} folder not found` };
      }

      // Upload file to OneDrive
      const uploadedFile = await this.graphClient
        .api(`/me/drive/items/${targetFolder.id}:/${fileName}:/content`)
        .put(fileBuffer);

      return {
        success: true,
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        filePath: uploadedFile.webUrl,
        size: uploadedFile.size,
        message: `Document uploaded to OneDrive: ${fileName}`
      };
    } catch (error) {
      console.error('Microsoft upload error:', error);
      return { 
        success: false, 
        error: `Failed to upload document: ${error}` 
      };
    }
  }

  // List client documents from OneDrive
  async listClientDocuments(clientId: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      // Search for client folder
      const searchResult = await this.graphClient
        .api('/me/drive/root/search')
        .query({ q: clientId })
        .get();

      if (!searchResult.value || searchResult.value.length === 0) {
        return { success: false, error: 'Client folder not found' };
      }

      const clientFolder = searchResult.value[0];
      
      // Get all files in client folder recursively
      const allItems = await this.graphClient
        .api(`/me/drive/items/${clientFolder.id}/children`)
        .expand('children')
        .get();

      const documents: any[] = [];
      
      // Process folders and files
      for (const item of allItems.value) {
        if (item.folder) {
          // Get files from subfolder
          const subfolderItems = await this.graphClient
            .api(`/me/drive/items/${item.id}/children`)
            .get();
          
          subfolderItems.value.forEach((file: any) => {
            if (file.file) {
              documents.push({
                name: file.name,
                path: file.webUrl,
                size: file.size,
                modified: file.lastModifiedDateTime,
                id: file.id,
                folder: item.name
              });
            }
          });
        }
      }

      return {
        success: true,
        documents,
        count: documents.length
      };
    } catch (error) {
      console.error('Microsoft list error:', error);
      return { 
        success: false, 
        error: 'Failed to list documents from OneDrive' 
      };
    }
  }

  // Download document from OneDrive
  async downloadDocument(fileId: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      // Get file metadata
      const fileMetadata = await this.graphClient
        .api(`/me/drive/items/${fileId}`)
        .get();

      // Download file content
      const fileContent = await this.graphClient
        .api(`/me/drive/items/${fileId}/content`)
        .getStream();

      return {
        success: true,
        fileBuffer: fileContent,
        metadata: {
          name: fileMetadata.name,
          size: fileMetadata.size,
          mimeType: fileMetadata.file?.mimeType || 'application/octet-stream'
        }
      };
    } catch (error) {
      console.error('Microsoft download error:', error);
      return { 
        success: false, 
        error: 'Failed to download document from OneDrive' 
      };
    }
  }

  // Delete document from OneDrive
  async deleteDocument(fileId: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      await this.graphClient
        .api(`/me/drive/items/${fileId}`)
        .delete();

      return {
        success: true,
        message: 'Document deleted from OneDrive'
      };
    } catch (error) {
      console.error('Microsoft delete error:', error);
      return { 
        success: false, 
        error: 'Failed to delete document from OneDrive' 
      };
    }
  }

  // Create Word document from template
  async createWordDocument(clientId: string, templateData: any) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      const documentContent = this.generateWordContent(templateData);
      
      // Search for client folder
      const searchResult = await this.graphClient
        .api('/me/drive/root/search')
        .query({ q: clientId })
        .get();

      if (!searchResult.value || searchResult.value.length === 0) {
        return { success: false, error: 'Client folder not found' };
      }

      const clientFolder = searchResult.value[0];
      
      // Create Word document
      const fileName = `Polish_Citizenship_Application_${Date.now()}.docx`;
      const wordDoc = await this.graphClient
        .api(`/me/drive/items/${clientFolder.id}:/${fileName}:/content`)
        .put(Buffer.from(documentContent));

      return {
        success: true,
        fileId: wordDoc.id,
        fileName: wordDoc.name,
        webUrl: wordDoc.webUrl,
        message: 'Word document created successfully'
      };
    } catch (error) {
      console.error('Word creation error:', error);
      return { 
        success: false, 
        error: 'Failed to create Word document' 
      };
    }
  }

  // Get account information
  async getAccountInfo() {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      const user = await this.graphClient.api('/me').get();
      const drive = await this.graphClient.api('/me/drive').get();

      return {
        success: true,
        account: {
          name: user.displayName,
          email: user.mail || user.userPrincipalName,
          accountType: 'Microsoft'
        },
        storage: {
          used: drive.quota.used,
          total: drive.quota.total,
          usedPercentage: Math.round((drive.quota.used / drive.quota.total) * 100)
        }
      };
    } catch (error) {
      console.error('Microsoft account info error:', error);
      return { 
        success: false, 
        error: 'Failed to get account information' 
      };
    }
  }

  // Search documents
  async searchDocuments(query: string, clientId?: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Microsoft Graph not configured. Please set MICROSOFT_ACCESS_TOKEN.' };
    }

    try {
      let searchQuery = query;
      if (clientId) {
        searchQuery = `${query} ${clientId}`;
      }

      const searchResult = await this.graphClient
        .api('/me/drive/root/search')
        .query({ q: searchQuery })
        .get();

      const documents = searchResult.value
        .filter((item: any) => item.file)
        .map((file: any) => ({
          name: file.name,
          path: file.webUrl,
          size: file.size,
          modified: file.lastModifiedDateTime,
          id: file.id
        }));

      return {
        success: true,
        results: documents,
        count: documents.length
      };
    } catch (error) {
      console.error('Microsoft search error:', error);
      return { 
        success: false, 
        error: 'Failed to search documents' 
      };
    }
  }

  // Generate basic Word document content (simplified)
  private generateWordContent(data: any): string {
    return `
Polish Citizenship Application - ${data.applicantName || 'Unnamed'}

Applicant Information:
- Name: ${data.applicantName || 'N/A'}
- Birth Date: ${data.birthDate || 'N/A'}
- Birth Place: ${data.birthPlace || 'N/A'}
- Passport Number: ${data.passportNumber || 'N/A'}

Family Information:
- Polish Parent: ${data.polishParentName || 'N/A'}
- Polish Grandparent: ${data.polishGrandparentName || 'N/A'}

Generated on: ${new Date().toLocaleDateString()}

This document was automatically generated by the Polish Citizenship Portal.
    `;
  }
}

// Export singleton instance
export const microsoftService = new MicrosoftService();