/**
 * API helper functions for Polish Citizenship Agent
 */

export interface CaseData {
  id: string;
  caseId?: string; // Pretty case ID like "C-1758436544399-2EHB" or "CASE-1754932140348-SLZAETACG"
  name: string;
  email: string;
  stage: string;
  tier: string;
  score: number;
  confidence: number;
  ageMonths: number;
  difficulty: number;
  updatedAt: string;
  createdAt: string;
  processing: string;
  state: string;
  clientScore?: number;
  caseManager?: string;
  client?: {
    email: string;
    name?: string;
  };
  timeline?: TimelineEvent[];
  documents?: DocumentStatus[];
  payments?: PaymentStatus[];
  servicePayments?: ServicePayment[];
  tasks?: TaskItem[];
  familyTree?: any;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  status?: string;
}

export interface DocumentStatus {
  id: string;
  type: string;
  status: string;
  name: string;
  uploadedAt?: string;
  verifiedAt?: string;
}

export interface PaymentStatus {
  id: string;
  description: string;
  status: string;
  amount: number;
  currency: string;
  dueDate?: string;
  notes?: string;
}

export interface ServicePayment {
  id: string;       // fixed id: pay1..pay12
  label: string;    // from hardcoded list
  status: 'Pending' | 'Received' | 'N/A';
  amount?: number;  // optional
  notes?: string;   // optional
  currency: 'EUR';  // fixed
}

export interface TaskItem {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  dueDate?: string;
  description?: string;
}

/**
 * Fetch a single case by ID
 */
export async function getCaseById(id: string): Promise<CaseData> {
  if (!id) throw new Error("Invalid case id");
  
  // Use the case ID as-is for API calls - don't normalize it
  // The API accepts both C- and CASE- prefixed formats
  const apiId = id;
  
  const response = await fetch(`/api/admin/cases/${apiId}`);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to load case ${apiId}: ${response.status} ${text}`);
  }
  
  const result = await response.json();
  
  // Server returns { success: true, case: {...} }, but we need the case data directly
  if (!result.success || !result.case) {
    throw new Error(`Invalid response format from server`);
  }
  
  const caseData = result.case;
  const currentTime = Date.now();
  const createdAt = caseData.created_at ? new Date(caseData.created_at).getTime() : currentTime;
  const ageMonths = Math.max(1, Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24 * 30)));
  
  // Transform the server response to match CaseData format
  return {
    id: caseData.id,
    name: caseData.client?.name || 'Unknown Client',
    email: caseData.client?.email || 'No email',
    stage: mapStage(caseData.state || 'INITIAL_ASSESSMENT'),
    tier: mapTier(caseData.processing || 'standard'),
    score: caseData.score || 0,
    confidence: caseData.score || 0,
    ageMonths,
    difficulty: caseData.difficulty || 1,
    updatedAt: caseData.created_at || new Date().toISOString(),
    createdAt: caseData.created_at || new Date().toISOString(),
    processing: caseData.processing || 'standard',
    state: caseData.state || 'INITIAL_ASSESSMENT',
    clientScore: caseData.score,
    caseManager: caseData.caseManager || '',
    client: {
      email: caseData.client?.email || 'No email',
      name: caseData.client?.name || 'Unknown Client'
    },
    timeline: Array.isArray(caseData.timeline) ? caseData.timeline : [],
    documents: Array.isArray(caseData.documents) ? caseData.documents : [],
    payments: Array.isArray(caseData.payments) ? caseData.payments : [],
    servicePayments: Array.isArray(caseData.servicePayments) ? caseData.servicePayments : [],
    tasks: Array.isArray(caseData.tasks) ? caseData.tasks : [],
    familyTree: caseData.familyTree
  };
}

/**
 * Update a case with partial data
 */
export async function updateCase(id: string, patch: Partial<CaseData>): Promise<CaseData> {
  if (!id) throw new Error("Invalid case id");
  
  // Use the case ID as-is for API calls - don't normalize it
  const apiId = id;
  
  const response = await fetch(`/api/admin/cases/${apiId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });
  
  if (!response.ok) {
    throw new Error(`Update case ${apiId} failed ${response.status}`);
  }
  
  return response.json();
}

/**
 * Delete a case by ID
 */
export async function deleteCase(id: string): Promise<void> {
  if (!id) throw new Error("Invalid case id");
  
  // Use the case ID as-is for API calls - don't normalize it
  const apiId = id;
  
  const response = await fetch(`/api/admin/case/${apiId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Delete case ${apiId} failed ${response.status}`);
  }
}

/**
 * Fetch all cases for the grid view
 */
export async function getCases(): Promise<CaseData[]> {
  const response = await fetch('/api/admin/cases');
  if (!response.ok) {
    throw new Error(`Fetch cases failed ${response.status}`);
  }
  const data = await response.json();
  return transformApiData(data.cases || []);
}

/**
 * Transform API data to CaseData format
 */
function transformApiData(apiData: any[]): CaseData[] {
  const currentTime = Date.now();
  return apiData.map(dbCase => {
    const createdAt = dbCase.created_at ? new Date(dbCase.created_at).getTime() : currentTime;
    const ageMonths = Math.max(1, Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24 * 30)));
    
    // Parse confidence percentage
    const confidenceStr = dbCase.confidence || "0%";
    const confidence = parseInt(confidenceStr.replace('%', ''));
    
    // Use client_name + email for better identification
    const displayName = dbCase.client_name || dbCase.caseManager || `Case ${dbCase.caseId || dbCase.id}`;
    const email = dbCase.client_email || dbCase.client?.email || 'No email';
    
    // Map API fields correctly: status->stage, serviceLevel->processing
    const stage = mapStage(dbCase.status || 'INITIAL_ASSESSMENT');
    const processing = dbCase.serviceLevel || 'standard';
    
    return {
      id: dbCase.caseId || dbCase.id.toString(),
      caseId: dbCase.caseId, // Preserve the original caseId for navigation
      name: displayName,
      email: email,
      stage: stage,
      tier: mapTier(processing),
      score: dbCase.progress || confidence || 0,
      confidence,
      ageMonths,
      difficulty: dbCase.difficulty || 1,
      updatedAt: dbCase.updated_at || dbCase.created_at || new Date().toISOString(),
      createdAt: dbCase.created_at || new Date().toISOString(),
      processing: processing,
      state: stage,
      clientScore: dbCase.progress,
      caseManager: dbCase.caseManager,
      client: { email: email, name: displayName },
      timeline: dbCase.timeline || [],
      documents: dbCase.documents || [],
      payments: dbCase.payments || [],
      tasks: dbCase.tasks || [],
      familyTree: dbCase.familyTree
    };
  });
}

function mapTier(processing: string): 'VIP' | 'GLOBAL' | 'STANDARD' | 'BASIC' {
  switch (processing.toLowerCase()) {
    case 'tier1':
    case 'rush':
    case 'vip': return 'VIP';
    case 'tier2':
    case 'global': return 'GLOBAL';
    case 'tier3':
    case 'standard': return 'STANDARD';
    default: return 'BASIC';
  }
}

function mapStage(status: string): string {
  switch (status) {
    case 'INITIAL_ASSESSMENT': return 'pending';
    case 'OBY_SUBMITTABLE': return 'in_progress';
    case 'COMPLETED': return 'completed';
    case 'STALLED': return 'stalled';
    case 'USC_IN_FLIGHT': return 'in_progress';
    case 'OBY_DRAFTING': return 'in_progress';
    case 'USC_READY': return 'pending';
    case 'DECISION_RECEIVED': return 'completed';
    default: return 'pending';
  }
}