import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Google Drive/Docs service for document management
export class GoogleService {
  private auth: GoogleAuth;
  private drive: any;
  private docs: any;
  
  constructor() {
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentials) {
      console.warn('GOOGLE_SERVICE_ACCOUNT_KEY not set - Google services will be disabled');
      return;
    }
    
    try {
      this.auth = new GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/documents'
        ]
      });
      
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.docs = google.docs({ version: 'v1', auth: this.auth });
    } catch (error) {
      console.error('Google Auth initialization error:', error);
    }
  }
  
  private isConfigured(): boolean {
    return !!this.auth && !!this.drive && !!this.docs;
  }

  // Create client folder in Google Drive
  async initializeClientFolder(clientId: string, clientName: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      const folderName = `${clientName} - ${clientId}`;
      
      // Create main client folder
      const folderResponse = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        }
      });

      const folderId = folderResponse.data.id;

      // Create subfolders for document organization
      const subfolders = [
        'Passports',
        'Birth Certificates', 
        'Marriage Certificates',
        'Generated Documents',
        'Google Docs',
        'Other Documents'
      ];

      const subfolderIds: any = {};
      for (const subfolder of subfolders) {
        const subfolderResponse = await this.drive.files.create({
          requestBody: {
            name: subfolder,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [folderId]
          }
        });
        subfolderIds[subfolder] = subfolderResponse.data.id;
      }

      return { 
        success: true, 
        folderId,
        subfolderIds,
        folderName,
        message: `Client folder created in Google Drive: ${folderName}`
      };
    } catch (error) {
      console.error('Google Drive folder creation error:', error);
      return { 
        success: false, 
        error: 'Failed to create client folder in Google Drive' 
      };
    }
  }

  // Upload document to Google Drive
  async uploadClientDocument(
    clientId: string,
    fileName: string,
    fileBuffer: Buffer,
    documentType: 'passport' | 'birth_certificate' | 'marriage_certificate' | 'other' = 'other'
  ) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
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
      const searchResult = await this.drive.files.list({
        q: `name contains '${clientId}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (!searchResult.data.files || searchResult.data.files.length === 0) {
        return { success: false, error: 'Client folder not found. Please initialize first.' };
      }

      const clientFolder = searchResult.data.files[0];
      
      // Find the appropriate subfolder
      const subfolderResult = await this.drive.files.list({
        q: `'${clientFolder.id}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (!subfolderResult.data.files || subfolderResult.data.files.length === 0) {
        return { success: false, error: `${folderName} folder not found` };
      }

      const targetFolder = subfolderResult.data.files[0];

      // Determine MIME type
      const mimeType = this.getMimeType(fileName);

      // Upload file to Google Drive
      const uploadResponse = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [targetFolder.id]
        },
        media: {
          mimeType,
          body: Buffer.from(fileBuffer)
        },
        fields: 'id, name, size, webViewLink, webContentLink'
      });

      return {
        success: true,
        fileId: uploadResponse.data.id,
        fileName: uploadResponse.data.name,
        viewLink: uploadResponse.data.webViewLink,
        downloadLink: uploadResponse.data.webContentLink,
        size: uploadResponse.data.size,
        message: `Document uploaded to Google Drive: ${fileName}`
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      return { 
        success: false, 
        error: `Failed to upload document: ${error}` 
      };
    }
  }

  // List client documents from Google Drive
  async listClientDocuments(clientId: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      // Search for client folder
      const searchResult = await this.drive.files.list({
        q: `name contains '${clientId}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (!searchResult.data.files || searchResult.data.files.length === 0) {
        return { success: false, error: 'Client folder not found' };
      }

      const clientFolder = searchResult.data.files[0];
      
      // Get all files in client folder and subfolders
      const allFiles = await this.drive.files.list({
        q: `'${clientFolder.id}' in parents`,
        fields: 'files(id, name, size, modifiedTime, mimeType, webViewLink, parents)'
      });

      const documents: any[] = [];
      
      // Get files from subfolders
      for (const item of allFiles.data.files) {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Get files from subfolder
          const subfolderFiles = await this.drive.files.list({
            q: `'${item.id}' in parents and mimeType != 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name, size, modifiedTime, mimeType, webViewLink)'
          });
          
          subfolderFiles.data.files.forEach((file: any) => {
            documents.push({
              name: file.name,
              path: file.webViewLink,
              size: file.size,
              modified: file.modifiedTime,
              id: file.id,
              mimeType: file.mimeType,
              folder: item.name
            });
          });
        }
      }

      return {
        success: true,
        documents,
        count: documents.length
      };
    } catch (error) {
      console.error('Google Drive list error:', error);
      return { 
        success: false, 
        error: 'Failed to list documents from Google Drive' 
      };
    }
  }

  // Download document from Google Drive
  async downloadDocument(fileId: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      // Get file metadata
      const fileMetadata = await this.drive.files.get({
        fileId,
        fields: 'name, size, mimeType'
      });

      // Download file content
      const fileContent = await this.drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      return {
        success: true,
        fileBuffer: fileContent.data,
        metadata: {
          name: fileMetadata.data.name,
          size: fileMetadata.data.size,
          mimeType: fileMetadata.data.mimeType
        }
      };
    } catch (error) {
      console.error('Google Drive download error:', error);
      return { 
        success: false, 
        error: 'Failed to download document from Google Drive' 
      };
    }
  }

  // Delete document from Google Drive
  async deleteDocument(fileId: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      await this.drive.files.delete({ fileId });

      return {
        success: true,
        message: 'Document deleted from Google Drive'
      };
    } catch (error) {
      console.error('Google Drive delete error:', error);
      return { 
        success: false, 
        error: 'Failed to delete document from Google Drive' 
      };
    }
  }

  // Create Google Doc from template
  async createGoogleDoc(clientId: string, templateData: any) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Docs not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      // Search for client folder
      const searchResult = await this.drive.files.list({
        q: `name contains '${clientId}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (!searchResult.data.files || searchResult.data.files.length === 0) {
        return { success: false, error: 'Client folder not found' };
      }

      const clientFolder = searchResult.data.files[0];
      
      // Find Google Docs subfolder
      const docsFolder = await this.drive.files.list({
        q: `'${clientFolder.id}' in parents and name='Google Docs' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      const targetFolderId = docsFolder.data.files?.[0]?.id || clientFolder.id;

      // Create Google Doc
      const docTitle = `Polish Citizenship Application - ${templateData.applicantName || 'Unnamed'} - ${Date.now()}`;
      
      const docResponse = await this.docs.documents.create({
        requestBody: {
          title: docTitle
        }
      });

      const documentId = docResponse.data.documentId;

      // Move document to client folder
      await this.drive.files.update({
        fileId: documentId,
        addParents: targetFolderId,
        fields: 'id, parents'
      });

      // Add content to the document
      await this.docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: this.generateDocContent(templateData)
              }
            }
          ]
        }
      });

      // Get document URL
      const docMetadata = await this.drive.files.get({
        fileId: documentId,
        fields: 'webViewLink'
      });

      return {
        success: true,
        documentId,
        title: docTitle,
        webViewLink: docMetadata.data.webViewLink,
        message: 'Google Doc created successfully'
      };
    } catch (error) {
      console.error('Google Docs creation error:', error);
      return { 
        success: false, 
        error: 'Failed to create Google Doc' 
      };
    }
  }

  // Get account information
  async getAccountInfo() {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      const about = await this.drive.about.get({
        fields: 'user, storageQuota'
      });

      return {
        success: true,
        account: {
          name: about.data.user?.displayName || 'Service Account',
          email: about.data.user?.emailAddress || 'N/A',
          accountType: 'Google'
        },
        storage: {
          used: about.data.storageQuota?.usage || 0,
          total: about.data.storageQuota?.limit || 0,
          usedPercentage: about.data.storageQuota?.limit ? 
            Math.round((about.data.storageQuota.usage / about.data.storageQuota.limit) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Google account info error:', error);
      return { 
        success: false, 
        error: 'Failed to get account information' 
      };
    }
  }

  // Search documents
  async searchDocuments(query: string, clientId?: string) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Google Drive not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY.' };
    }

    try {
      let searchQuery = `name contains '${query}'`;
      if (clientId) {
        searchQuery += ` and name contains '${clientId}'`;
      }

      const searchResult = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id, name, size, modifiedTime, webViewLink, mimeType)'
      });

      const documents = searchResult.data.files
        .filter((file: any) => file.mimeType !== 'application/vnd.google-apps.folder')
        .map((file: any) => ({
          name: file.name,
          path: file.webViewLink,
          size: file.size,
          modified: file.modifiedTime,
          id: file.id,
          mimeType: file.mimeType
        }));

      return {
        success: true,
        results: documents,
        count: documents.length
      };
    } catch (error) {
      console.error('Google Drive search error:', error);
      return { 
        success: false, 
        error: 'Failed to search documents' 
      };
    }
  }

  // Helper method to determine MIME type
  private getMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    const mimeTypes: any = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'tiff': 'image/tiff',
      'tif': 'image/tiff'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // Generate document content
  private generateDocContent(data: any): string {
    return `Polish Citizenship Application - ${data.applicantName || 'Unnamed'}

APPLICANT INFORMATION
=====================
Name: ${data.applicantName || 'N/A'}
Birth Date: ${data.birthDate || 'N/A'}
Birth Place: ${data.birthPlace || 'N/A'}
Passport Number: ${data.passportNumber || 'N/A'}
Gender: ${data.gender || 'N/A'}
Marital Status: ${data.maritalStatus || 'N/A'}

CONTACT INFORMATION
==================
Email: ${data.email || 'N/A'}
Phone: ${data.phone || 'N/A'}
Address: ${data.address || 'N/A'}

FAMILY INFORMATION
==================
Polish Parent: ${data.polishParentName || 'N/A'}
Polish Parent Birth Date: ${data.polishParentBirthDate || 'N/A'}
Polish Parent Birth Place: ${data.polishParentBirthPlace || 'N/A'}

Polish Grandparent: ${data.polishGrandparentName || 'N/A'}
Polish Grandparent Birth Date: ${data.polishGrandparentBirthDate || 'N/A'}
Polish Grandparent Birth Place: ${data.polishGrandparentBirthPlace || 'N/A'}

MARRIAGE INFORMATION (if applicable)
===================================
Spouse Name: ${data.spouseName || 'N/A'}
Marriage Date: ${data.marriageDate || 'N/A'}
Marriage Place: ${data.marriagePlace || 'N/A'}

Generated on: ${new Date().toLocaleDateString('en-US')}
Generated by: Polish Citizenship Portal (polishcitizenship.pl)

This document was automatically generated based on the information provided in the Polish Citizenship Application form.
`;
  }
}

// Export singleton instance
export const googleService = new GoogleService();