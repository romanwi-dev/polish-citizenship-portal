// Storage abstraction layer for Polish Citizenship Portal
// Pure JavaScript implementation with NO TypeScript dependencies
// Switches between real Dropbox and mock storage based on QA_MODE and configuration

import { MockStorageService } from './mock.js';

// Determine which storage service to use
const isQAMode = process.env.QA_MODE === '1' || process.env.NODE_ENV === 'test';
const hasDropboxToken = process.env.DROPBOX_ACCESS_TOKEN && process.env.DROPBOX_ACCESS_TOKEN.length > 0;

let storageInstance;

if (isQAMode || !hasDropboxToken) {
  // Use mock storage for QA mode OR when Dropbox isn't configured
  const reason = isQAMode ? 'QA Mode enabled' : 'DROPBOX_ACCESS_TOKEN not configured';
  console.log(`🧪 Using mock storage service: ${reason}`);
  storageInstance = new MockStorageService();
} else {
  // Use real Dropbox service when token is available and not in QA mode
  try {
    console.log('🔗 Initializing real Dropbox storage service...');
    // Import the real Dropbox service dynamically
    const { DropboxStorageService } = await import('./dropbox.js');
    storageInstance = new DropboxStorageService();
    console.log('✅ Connected to Dropbox storage service');
  } catch (error) {
    console.error('❌ Failed to initialize Dropbox storage service:', error.message);
    console.log('📦 Falling back to mock storage service');
    storageInstance = new MockStorageService();
  }
}

// Export the storage service instance
export const storage = storageInstance;

// Export types and utilities
export { MockStorageService } from './mock.js';

// Storage interface validation - ensures both services implement required methods
const requiredMethods = [
  'uploadClientDocument',
  'listClientDocuments', 
  'downloadDocument',
  'createShareableLink'
];

// Additional methods for user management (needed for auth module)
const userMethods = [
  'getUser',
  'getUserByEmail',
  'createUser',
  'updateUser'
];

// Validate that the storage service implements all required methods
function validateStorageInterface(service) {
  const missing = requiredMethods.filter(method => typeof service[method] !== 'function');
  
  if (missing.length > 0) {
    throw new Error(`Storage service missing required methods: ${missing.join(', ')}`);
  }
  
  return true;
}

// Validate the current storage service
try {
  validateStorageInterface(storageInstance);
  console.log('✅ Storage service interface validated');
} catch (error) {
  console.error('❌ Storage service validation failed:', error.message);
  throw error;
}

// Utility functions for QA testing
export function isUsingMockStorage() {
  return storageInstance instanceof MockStorageService;
}

export function getStorageType() {
  return isUsingMockStorage() ? 'mock' : 'dropbox';
}

export async function getStorageHealth() {
  if (typeof storageInstance.healthCheck === 'function') {
    return await storageInstance.healthCheck();
  }
  
  return {
    status: 'ok',
    type: getStorageType(),
    timestamp: new Date().toISOString()
  };
}

// Reset function for testing (only works with mock storage)
export function resetMockStorage() {
  if (isUsingMockStorage() && typeof storageInstance.reset === 'function') {
    storageInstance.reset();
    return true;
  }
  return false;
}