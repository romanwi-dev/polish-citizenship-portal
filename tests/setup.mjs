// Test setup for QA harness
// Sets up mock environment and common test utilities

import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { resetMockStorage } from '../server/storage/index.js';

// Set QA mode environment variables
process.env.QA_MODE = '1';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// Mock tesseract.js to prevent OCR errors in tests
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(() => ({
    loadLanguage: vi.fn().mockResolvedValue(undefined),
    initialize: vi.fn().mockResolvedValue(undefined),
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: 'Mock OCR text extracted from test document',
        confidence: 95
      }
    }),
    terminate: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock database operations for tests
vi.mock('../server/db.js', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue([])
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({ id: 'test-id' })
    }))
  }
}));

// Mock external services for testing
beforeAll(() => {
  console.log('🧪 QA Test Setup: Initializing mock environment');
  
  // Suppress console.log in tests unless DEBUG=1
  if (!process.env.DEBUG) {
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('🧪')) {
        originalLog(...args);
      }
    };
  }
});

// Reset mock storage after each test
afterEach(() => {
  if (typeof resetMockStorage === 'function') {
    resetMockStorage();
  }
});

afterAll(() => {
  console.log('🧪 QA Test Teardown: Cleaning up test environment');
});

// Common test utilities
export const testUtils = {
  mockClientId: 'TEST-123',
  mockCaseData: {
    id: 'TEST-123',
    clientName: 'John Test',
    status: 'active',
    stage: 'documentation',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  },
  
  createMockFile: (name = 'test.pdf', size = 1024) => {
    return Buffer.from('Mock PDF content for testing');
  },
  
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};