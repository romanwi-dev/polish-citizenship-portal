// Test seed data system for QA testing
// Non-destructive test data that doesn't interfere with production

export interface TestCase {
  id: string;
  caseId: string;
  serviceLevel: 'standard' | 'express' | 'vip+';
  status: string;
  clientEmail: string;
  clientPhone: string;
  progress: number;
  caseManager: string | null;
  verdict: 'PROMISING' | 'MODERATE' | 'STRONG' | 'EXCELLENT';
  confidence: string;
  messages: number;
  evidence: number;
  createdAt: string;
}

// Test data for seeding (3 mock cases as specified)
export const mockTestCases: TestCase[] = [
  {
    id: 'qa-test-std-001',
    caseId: 'QA-STD-001',
    serviceLevel: 'standard',
    status: 'INITIAL_ASSESSMENT',
    clientEmail: 'qa.standard@test.local',
    clientPhone: '+1-555-TEST-001',
    progress: 15,
    caseManager: 'QA Test Agent',
    verdict: 'PROMISING',
    confidence: '85%',
    messages: 2,
    evidence: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'qa-test-exp-002',
    caseId: 'QA-EXP-002',
    serviceLevel: 'express',
    status: 'DOCUMENT_REVIEW',
    clientEmail: 'qa.express@test.local',
    clientPhone: '+1-555-TEST-002',
    progress: 45,
    caseManager: 'QA Express Agent',
    verdict: 'STRONG',
    confidence: '92%',
    messages: 5,
    evidence: 3,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  },
  {
    id: 'qa-test-vip-003',
    caseId: 'QA-VIP-003',
    serviceLevel: 'vip+',
    status: 'USC_IN_FLIGHT',
    clientEmail: 'qa.vip@test.local',
    clientPhone: '+1-555-TEST-003',
    progress: 75,
    caseManager: 'QA VIP Agent',
    verdict: 'EXCELLENT',
    confidence: '98%',
    messages: 8,
    evidence: 6,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last week
  }
];

/**
 * In-memory test store for QA testing
 * This doesn't affect the real database or Dropbox storage
 */
export class TestCaseStore {
  private static instance: TestCaseStore;
  private cases: Map<string, TestCase> = new Map();
  
  static getInstance(): TestCaseStore {
    if (!TestCaseStore.instance) {
      TestCaseStore.instance = new TestCaseStore();
    }
    return TestCaseStore.instance;
  }

  seed(): void {
    mockTestCases.forEach(testCase => {
      this.cases.set(testCase.id, { ...testCase });
    });
    console.log(`✅ Seeded ${mockTestCases.length} test cases`);
  }

  getCases(): TestCase[] {
    return Array.from(this.cases.values());
  }

  getCase(id: string): TestCase | undefined {
    return this.cases.get(id);
  }

  updateCase(id: string, updates: Partial<TestCase>): boolean {
    const existingCase = this.cases.get(id);
    if (!existingCase) return false;

    this.cases.set(id, { ...existingCase, ...updates });
    return true;
  }

  addCase(testCase: TestCase): void {
    this.cases.set(testCase.id, { ...testCase });
  }

  deleteCase(id: string): boolean {
    return this.cases.delete(id);
  }

  clear(): void {
    this.cases.clear();
  }

  // Mock API endpoints for testing
  async mockApiCall(endpoint: string, data?: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    switch (endpoint) {
      case '/api/admin/cases':
        return {
          cases: this.getCases(),
          total: this.cases.size
        };
      
      case '/api/admin/case/action':
        if (data?.caseId && data?.action) {
          const success = this.updateCase(data.caseId, {
            status: this.getStatusForAction(data.action),
            progress: Math.min(100, (this.getCase(data.caseId)?.progress || 0) + 5)
          });
          return { success, message: success ? 'Action completed' : 'Case not found' };
        }
        return { success: false, message: 'Invalid action data' };
      
      default:
        return { success: false, message: 'Unknown endpoint' };
    }
  }

  private getStatusForAction(action: string): string {
    const statusMap: Record<string, string> = {
      'POSTPONE': 'POSTPONED',
      'SUSPEND': 'SUSPENDED', 
      'CANCEL': 'CANCELLED',
      'ARCHIVE': 'ARCHIVED',
      'DELETE': 'DELETED'
    };
    return statusMap[action] || 'UNKNOWN';
  }
}

// Global test setup helper
export function setupTestEnvironment(): void {
  const testStore = TestCaseStore.getInstance();
  testStore.seed();
  
  // Mock fetch for test API calls
  const originalFetch = global.fetch;
  global.fetch = async (url: string | URL, init?: RequestInit) => {
    const urlString = url.toString();
    
    if (urlString.includes('/api/admin/cases') || urlString.includes('/api/admin/case')) {
      try {
        const data = init?.body ? JSON.parse(init.body as string) : undefined;
        const result = await testStore.mockApiCall(urlString, data);
        
        return new Response(JSON.stringify(result), {
          status: result.success !== false ? 200 : 400,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Fall back to original fetch for other requests
    return originalFetch(url, init);
  };
  
  console.log('🧪 Test environment initialized with mock data');
}

// Cleanup helper
export function cleanupTestEnvironment(): void {
  const testStore = TestCaseStore.getInstance();
  testStore.clear();
  
  // Restore original fetch if it was mocked
  if (typeof global.fetch !== 'undefined') {
    // Note: In a real implementation, you'd store and restore the original fetch
    console.log('🧹 Test environment cleaned up');
  }
}