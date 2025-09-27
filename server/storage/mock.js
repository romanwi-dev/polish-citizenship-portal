// Mock storage adapter for QA testing
// Implements the same interface as dropbox-service.ts for QA_MODE=1 testing

import path from 'path';
import fs from 'fs/promises';

export class MockStorageService {
  constructor() {
    this.mockData = new Map();
    this.files = new Map(); // Store file buffers in memory
    this.nextId = 1;
    
    // Initialize with some mock data for testing
    this.initializeMockData();
  }

  initializeMockData() {
    // Mock client documents for testing
    const mockClients = ['TEST-123', 'C-1758095891552-ORKY', 'C-1758096771485-664909CD'];
    
    mockClients.forEach(clientId => {
      this.mockData.set(`/Clients/${clientId}/passport/passport_${clientId}.pdf`, {
        id: `file_${this.nextId++}`,
        name: `passport_${clientId}.pdf`,
        path: `/Clients/${clientId}/passport/passport_${clientId}.pdf`,
        size: 256000,
        modified: new Date().toISOString(),
        shareLink: `https://mock-storage.example.com/share/${clientId}_passport`
      });
      
      this.mockData.set(`/Clients/${clientId}/birth_certificate/birth_${clientId}.pdf`, {
        id: `file_${this.nextId++}`,
        name: `birth_${clientId}.pdf`,
        path: `/Clients/${clientId}/birth_certificate/birth_${clientId}.pdf`,
        size: 128000,
        modified: new Date().toISOString(),
        shareLink: `https://mock-storage.example.com/share/${clientId}_birth`
      });
    });
  }

  isConfigured() {
    return true; // Always configured in mock mode
  }

  // Upload client document to organized folder structure
  async uploadClientDocument(
    clientId, 
    fileName, 
    fileBuffer, 
    documentType = 'other'
  ) {
    try {
      const folderPath = `/Clients/${clientId}/${documentType}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Store file buffer in memory
      this.files.set(filePath, fileBuffer);
      
      // Create mock metadata
      const fileData = {
        id: `file_${this.nextId++}`,
        name: fileName,
        path: filePath,
        size: fileBuffer.length,
        modified: new Date().toISOString(),
        shareLink: `https://mock-storage.example.com/share/${clientId}_${documentType}`
      };
      
      this.mockData.set(filePath, fileData);
      
      return {
        success: true,
        dropboxPath: filePath,
        shareLink: fileData.shareLink,
        fileId: fileData.id,
        size: fileData.size
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Mock upload failed'
      };
    }
  }

  // Create shareable link for client access
  async createShareableLink(filePath) {
    const fileData = this.mockData.get(filePath);
    if (!fileData) {
      throw new Error('File not found in mock storage');
    }
    
    return {
      url: fileData.shareLink,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
  }

  // List all documents for a specific client
  async listClientDocuments(clientId) {
    try {
      const folderPath = `/Clients/${clientId}`;
      const documents = [];
      
      for (const [path, data] of this.mockData.entries()) {
        if (path.startsWith(folderPath)) {
          documents.push({
            name: data.name,
            path: data.path,
            size: data.size,
            modified: data.modified,
            id: data.id
          });
        }
      }
      
      return {
        success: true,
        documents
      };
    } catch (error) {
      return {
        success: false,
        documents: [],
        error: error.message || 'Failed to list documents'
      };
    }
  }

  // Download document from mock storage
  async downloadDocument(filePath) {
    try {
      const fileBuffer = this.files.get(filePath);
      const metadata = this.mockData.get(filePath);
      
      if (!fileBuffer || !metadata) {
        throw new Error('File not found in mock storage');
      }
      
      return {
        success: true,
        fileBuffer,
        metadata: {
          name: metadata.name,
          size: metadata.size,
          modified: metadata.modified
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to download document'
      };
    }
  }

  // Delete document from mock storage
  async deleteDocument(filePath) {
    try {
      const exists = this.mockData.has(filePath);
      
      if (!exists) {
        return {
          success: false,
          error: 'File not found'
        };
      }
      
      this.mockData.delete(filePath);
      this.files.delete(filePath);
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete document'
      };
    }
  }

  // List folder contents (for folder structure operations)
  async listFolder(folderPath) {
    try {
      const entries = [];
      
      for (const [path, data] of this.mockData.entries()) {
        if (path.startsWith(folderPath) && path !== folderPath) {
          entries.push({
            name: data.name,
            path_display: data.path,
            size: data.size,
            server_modified: data.modified,
            id: data.id,
            '.tag': 'file'
          });
        }
      }
      
      return {
        success: true,
        entries
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to list folder'
      };
    }
  }

  // Health check for mock storage
  async healthCheck() {
    return {
      status: 'ok',
      type: 'mock',
      timestamp: new Date().toISOString(),
      filesStored: this.mockData.size,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  // Reset mock data (useful for testing)
  reset() {
    this.mockData.clear();
    this.files.clear();
    this.nextId = 1;
    this.initializeMockData();
  }

  // Get all stored data (for debugging)
  getAllData() {
    return {
      metadata: Array.from(this.mockData.entries()),
      fileCount: this.files.size
    };
  }

  // Get account info (mock implementation)
  async getAccountInfo() {
    try {
      return {
        success: true,
        account: {
          name: 'Mock Storage Account',
          email: 'mock@qa-harness.local',
          accountType: 'basic'
        },
        storage: {
          used: this.files.size * 256000, // Estimate based on file count
          allocated: 2000000000, // 2GB mock allocation
          usedPercentage: Math.round((this.files.size * 256000 / 2000000000) * 100)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get account info'
      };
    }
  }

  // Search documents across all clients
  async searchDocuments(query, clientId) {
    try {
      const searchPath = clientId ? `/Clients/${clientId}` : '/Clients';
      const results = [];
      
      for (const [path, data] of this.mockData.entries()) {
        if (path.startsWith(searchPath)) {
          // Simple text search in filename and path
          const searchText = `${data.name} ${data.path}`.toLowerCase();
          if (searchText.includes(query.toLowerCase())) {
            results.push({
              name: data.name,
              path: data.path,
              size: data.size,
              modified: data.modified,
              highlightSpans: [{ start: 0, length: query.length }] // Mock highlight
            });
          }
        }
      }
      
      return {
        success: true,
        results: results.slice(0, 100), // Limit to 100 results like real API
        totalCount: results.length
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        error: error.message || 'Search failed'
      };
    }
  }

  // Create client folder on first document upload
  async initializeClientFolder(clientId, clientName) {
    try {
      const clientFolder = `/Clients/${clientId}`;
      
      // Create subfolders for different document types
      const documentTypes = ['passport', 'birth_certificate', 'marriage_certificate', 'genealogy', 'other'];
      
      // Mock folder creation by storing metadata
      for (const docType of documentTypes) {
        const folderPath = `${clientFolder}/${docType}`;
        // Store folder marker in mockData
        this.mockData.set(`${folderPath}/.folder`, {
          id: `folder_${this.nextId++}`,
          name: '.folder',
          path: folderPath,
          size: 0,
          modified: new Date().toISOString(),
          type: 'folder'
        });
      }
      
      // Create a client info file
      const infoContent = `Client: ${clientName}\nFolder created: ${new Date().toISOString()}\nClient ID: ${clientId}`;
      const infoBuffer = Buffer.from(infoContent);
      const infoPath = `${clientFolder}/client_info.txt`;
      
      this.files.set(infoPath, infoBuffer);
      this.mockData.set(infoPath, {
        id: `file_${this.nextId++}`,
        name: 'client_info.txt',
        path: infoPath,
        size: infoBuffer.length,
        modified: new Date().toISOString(),
        shareLink: `https://mock-storage.example.com/share/${clientId}_info`
      });
      
      return {
        success: true,
        message: `Client folder structure created for ${clientName}`,
        folderPath: clientFolder
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to initialize client folder'
      };
    }
  }
}