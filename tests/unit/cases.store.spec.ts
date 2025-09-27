import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock case data and operations
interface CaseData {
  id: string;
  caseId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  clientEmail: string;
  serviceLevel: string;
  flags: Record<string, boolean>;
  timestamps: Record<string, Date>;
}

// Mock storage interface
const mockCases = new Map<string, CaseData>();

const caseStore = {
  // Idempotent import from Dropbox mapping
  importFromDropbox: (folderId: string, folderName: string): string => {
    // Same folder should always return same caseId
    const existingCase = Array.from(mockCases.values()).find(
      c => c.id === `dropbox-${folderId}`
    );
    
    if (existingCase) {
      return existingCase.caseId;
    }
    
    // Create new case with predictable ID  
    const folderSuffix = folderId.slice(-4).replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(4, '0');
    const caseId = `C-${Date.now()}-${folderSuffix}`;
    const newCase: CaseData = {
      id: `dropbox-${folderId}`,
      caseId,
      status: 'INITIAL_ASSESSMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      clientEmail: 'client@example.com',
      serviceLevel: 'standard',
      flags: {},
      timestamps: {}
    };
    
    mockCases.set(newCase.id, newCase);
    return caseId;
  },

  // State transitions
  updateCaseStatus: (caseId: string, newStatus: string, action?: string): boolean => {
    const caseData = Array.from(mockCases.values()).find(c => c.caseId === caseId);
    if (!caseData) return false;
    
    const now = new Date();
    caseData.status = newStatus;
    caseData.updatedAt = now;
    
    // Update flags and timestamps based on action
    if (action) {
      caseData.flags[action] = true;
      caseData.timestamps[action] = now;
    }
    
    return true;
  },

  // Persistence helper with retry logic
  persistCase: async (caseData: CaseData, retries = 1): Promise<boolean> => {
    const attemptSave = async (): Promise<boolean> => {
      // Mock network failure randomly for testing
      if (Math.random() < 0.3) {
        throw new Error('Network timeout');
      }
      return true;
    };
    
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await attemptSave();
        return true;
      } catch (error) {
        lastError = error;
        if (attempt === retries) {
          break; // Last attempt failed
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Surface error after all retries failed
    throw lastError;
  },

  // Get case by ID
  getCase: (caseId: string): CaseData | undefined => {
    return Array.from(mockCases.values()).find(c => c.caseId === caseId);
  },

  // Clear for testing
  clear: () => {
    mockCases.clear();
  }
};

describe('Cases Store', () => {
  beforeEach(() => {
    caseStore.clear();
    vi.clearAllMocks();
  });

  describe('Dropbox Import Mapping', () => {
    it('should return same caseId for same folder', () => {
      const folderId = 'dropbox-folder-123';
      const folderName = 'Test Case Folder';
      
      // First import
      const caseId1 = caseStore.importFromDropbox(folderId, folderName);
      
      // Second import of same folder
      const caseId2 = caseStore.importFromDropbox(folderId, folderName);
      
      // Should be idempotent
      expect(caseId1).toBe(caseId2);
      expect(caseId1).toMatch(/^C-\d+-[A-Z0-9]{4}$/);
    });

    it('should return different caseIds for different folders', () => {
      const caseId1 = caseStore.importFromDropbox('folder-123', 'Folder 1');
      const caseId2 = caseStore.importFromDropbox('folder-456', 'Folder 2');
      
      expect(caseId1).not.toBe(caseId2);
      expect(caseId1).toMatch(/^C-\d+-[A-Z0-9]{4}$/);
      expect(caseId2).toMatch(/^C-\d+-[A-Z0-9]{4}$/);
    });

    it('should create case with proper initial state', () => {
      const caseId = caseStore.importFromDropbox('folder-789', 'New Case');
      const caseData = caseStore.getCase(caseId);
      
      expect(caseData).toBeDefined();
      expect(caseData!.status).toBe('INITIAL_ASSESSMENT');
      expect(caseData!.serviceLevel).toBe('standard');
      expect(caseData!.flags).toEqual({});
      expect(caseData!.timestamps).toEqual({});
    });
  });

  describe('State Transitions', () => {
    let testCaseId: string;

    beforeEach(() => {
      testCaseId = caseStore.importFromDropbox('test-folder', 'Test Case');
    });

    it('should update status for POSTPONE action', () => {
      const success = caseStore.updateCaseStatus(testCaseId, 'POSTPONED', 'POSTPONE');
      const caseData = caseStore.getCase(testCaseId);
      
      expect(success).toBe(true);
      expect(caseData!.status).toBe('POSTPONED');
      expect(caseData!.flags.POSTPONE).toBe(true);
      expect(caseData!.timestamps.POSTPONE).toBeInstanceOf(Date);
    });

    it('should update status for SUSPEND action', () => {
      const success = caseStore.updateCaseStatus(testCaseId, 'SUSPENDED', 'SUSPEND');
      const caseData = caseStore.getCase(testCaseId);
      
      expect(success).toBe(true);
      expect(caseData!.status).toBe('SUSPENDED');
      expect(caseData!.flags.SUSPEND).toBe(true);
      expect(caseData!.timestamps.SUSPEND).toBeInstanceOf(Date);
    });

    it('should update status for CANCEL action', () => {
      const success = caseStore.updateCaseStatus(testCaseId, 'CANCELLED', 'CANCEL');
      const caseData = caseStore.getCase(testCaseId);
      
      expect(success).toBe(true);
      expect(caseData!.status).toBe('CANCELLED');
      expect(caseData!.flags.CANCEL).toBe(true);
      expect(caseData!.timestamps.CANCEL).toBeInstanceOf(Date);
    });

    it('should update status for ARCHIVE action', () => {
      const success = caseStore.updateCaseStatus(testCaseId, 'ARCHIVED', 'ARCHIVE');
      const caseData = caseStore.getCase(testCaseId);
      
      expect(success).toBe(true);
      expect(caseData!.status).toBe('ARCHIVED');
      expect(caseData!.flags.ARCHIVE).toBe(true);
      expect(caseData!.timestamps.ARCHIVE).toBeInstanceOf(Date);
    });

    it('should update timestamps on each action', () => {
      const beforeTime = new Date();
      
      caseStore.updateCaseStatus(testCaseId, 'POSTPONED', 'POSTPONE');
      const caseData = caseStore.getCase(testCaseId);
      
      expect(caseData!.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(caseData!.timestamps.POSTPONE.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });

    it('should return false for non-existent case', () => {
      const success = caseStore.updateCaseStatus('NON-EXISTENT', 'POSTPONED', 'POSTPONE');
      expect(success).toBe(false);
    });
  });

  describe('Persistence Helper', () => {
    let testCaseData: CaseData;

    beforeEach(() => {
      const caseId = caseStore.importFromDropbox('persist-test', 'Persistence Test');
      testCaseData = caseStore.getCase(caseId)!;
      // Reset all mocks before each test
      vi.restoreAllMocks();
    });

    it('should succeed on first attempt when no errors', async () => {
      // Mock Math.random to always succeed (>= 0.3)
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      
      const success = await caseStore.persistCase(testCaseData);
      expect(success).toBe(true);
    });

    it('should retry once on failure then succeed', async () => {
      // Mock to fail first, succeed second
      const randomSpy = vi.spyOn(Math, 'random');
      randomSpy.mockReturnValueOnce(0.1); // Fail (< 0.3)
      randomSpy.mockReturnValueOnce(0.99); // Succeed (>= 0.3)
      
      const success = await caseStore.persistCase(testCaseData, 1);
      expect(success).toBe(true);
    });

    it('should surface error after retries exhausted', async () => {
      // Mock to always fail (< 0.3)
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      
      await expect(caseStore.persistCase(testCaseData, 1)).rejects.toThrow('Network timeout');
    });

    it('should respect retry count parameter', async () => {
      // Mock to always fail (< 0.3) 
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      
      const startTime = Date.now();
      
      try {
        await caseStore.persistCase(testCaseData, 2); // 2 retries = 3 total attempts
        fail('Expected error to be thrown');
      } catch (error) {
        const endTime = Date.now();
        // Should have waited for retries (at least 200ms for 2 retries)
        expect(endTime - startTime).toBeGreaterThanOrEqual(200);
        expect(error.message).toBe('Network timeout');
      }
    });
  });
});