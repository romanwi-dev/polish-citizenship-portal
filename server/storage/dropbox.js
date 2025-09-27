// Dropbox storage service implementation
// Provides document management for Polish citizenship portal
// Implements the IStorage interface for consistent storage access

import { getUncachableDropboxClient } from '../integrations/dropbox-client.js';

export class DropboxStorageService {
  constructor() {
    console.log('DropboxStorageService initialized');
  }

  async getDropboxClient() {
    return await getUncachableDropboxClient();
  }

  // Implement required storage interface methods
  
  async uploadClientDocument(clientId, file, metadata = {}) {
    try {
      const dbx = await this.getDropboxClient();
      const path = `/CASES/${clientId}/${file.name}`;
      
      const response = await dbx.filesUpload({
        path: path,
        contents: file,
        mode: 'overwrite',
        autorename: true
      });
      
      return {
        success: true,
        path: response.result.path_display,
        id: response.result.id,
        size: response.result.size
      };
    } catch (error) {
      console.error(`Failed to upload document for client ${clientId}:`, error);
      throw error;
    }
  }

  async listClientDocuments(clientId) {
    try {
      const dbx = await this.getDropboxClient();
      const path = `/CASES/${clientId}`;
      
      const response = await dbx.filesListFolder({ path });
      return response.result.entries.map(entry => ({
        name: entry.name,
        path: entry.path_display,
        size: entry.size,
        modified: entry.server_modified,
        type: entry['.tag']
      }));
    } catch (error) {
      console.error(`Failed to list documents for client ${clientId}:`, error);
      throw error;
    }
  }

  async downloadDocument(documentPath) {
    try {
      const dbx = await this.getDropboxClient();
      const response = await dbx.filesDownload({ path: documentPath });
      return response.result.fileBinary;
    } catch (error) {
      console.error(`Failed to download document at ${documentPath}:`, error);
      throw error;
    }
  }

  async createShareableLink(documentPath) {
    try {
      const dbx = await this.getDropboxClient();
      const response = await dbx.sharingCreateSharedLinkWithSettings({
        path: documentPath,
        settings: {
          requested_visibility: 'public'
        }
      });
      return {
        url: response.result.url,
        expires: response.result.expires
      };
    } catch (error) {
      console.error(`Failed to create shareable link for ${documentPath}:`, error);
      throw error;
    }
  }

  // User management methods (needed for auth module)
  async getUser(userId) {
    // For now, use file-based storage in Dropbox
    // In a real implementation, you might want to use a proper database
    try {
      const dbx = await this.getDropboxClient();
      const userPath = `/USERS/${userId}/profile.json`;
      const response = await dbx.filesDownload({ path: userPath });
      return JSON.parse(response.result.fileBinary.toString());
    } catch (error) {
      if (error.status === 409) { // File not found
        return null;
      }
      throw error;
    }
  }

  async getUserByEmail(email) {
    // Simple implementation - in production you'd want a proper database
    // This scans user files to find by email
    try {
      const dbx = await this.getDropboxClient();
      const response = await dbx.filesListFolder({ path: '/USERS' });
      
      for (const userFolder of response.result.entries) {
        if (userFolder['.tag'] === 'folder') {
          try {
            const userId = userFolder.name;
            const user = await this.getUser(userId);
            if (user && user.email === email) {
              return { ...user, id: userId };
            }
          } catch (err) {
            // Skip users without valid profile data
            continue;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error searching for user by email:', error);
      return null;
    }
  }

  async createUser(userData) {
    try {
      const dbx = await this.getDropboxClient();
      const userId = userData.id || `user_${Date.now()}`;
      const userPath = `/USERS/${userId}/profile.json`;
      
      const userDataToStore = {
        ...userData,
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dbx.filesUpload({
        path: userPath,
        contents: Buffer.from(JSON.stringify(userDataToStore, null, 2)),
        mode: 'overwrite'
      });
      
      return userDataToStore;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      const dbx = await this.getDropboxClient();
      const existingUser = await this.getUser(userId);
      if (!existingUser) {
        throw new Error(`User ${userId} not found`);
      }
      
      const updatedUser = {
        ...existingUser,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const userPath = `/USERS/${userId}/profile.json`;
      await dbx.filesUpload({
        path: userPath,
        contents: Buffer.from(JSON.stringify(updatedUser, null, 2)),
        mode: 'overwrite'
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }
}