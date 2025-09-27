// Cases 2.0 Type Definitions

export interface CaseData {
  id: string
  name: string
  email: string
  stage: string
  tier: 'VIP' | 'GLOBAL' | 'STANDARD' | 'BASIC'
  score: number
  confidence: number
  ageMonths: number
  difficulty: number
  updatedAt: string
  processing: string
  state: string
  created_at?: string
  updated_at?: string
}

export interface CaseDetails extends CaseData {
  client: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  documents: DocumentStatus[]
  payments: PaymentStatus[]
  tasks: TaskItem[]
  familyTree: FamilyTreeData
  timeline: TimelineEvent[]
}

export interface DocumentStatus {
  id: string
  type: string
  status: 'UPLOADED' | 'PENDING' | 'REJECTED' | 'APPROVED'
  name?: string
  uploadedAt?: string
}

export interface PaymentStatus {
  id: string
  description: string
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  amount: number
  currency: string
  dueDate?: string
  notes?: string
}

export interface TaskItem {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  assignee?: string
  dueDate?: string
  description?: string
}

export interface FamilyTreeData {
  applicant_first_name?: string
  applicant_family_name?: string
  father_first_name?: string
  father_last_name?: string
  mother_first_name?: string
  mother_last_name?: string
  paternal_grandfather_first_name?: string
  paternal_grandfather_last_name?: string
  paternal_grandmother_first_name?: string
  paternal_grandmother_last_name?: string
  maternal_grandfather_first_name?: string
  maternal_grandfather_last_name?: string
  maternal_grandmother_first_name?: string
  maternal_grandmother_last_name?: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'MILESTONE' | 'UPDATE' | 'DOCUMENT' | 'PAYMENT' | 'TASK'
  status?: string
}

export type TabId = 'overview' | 'timeline' | 'documents' | 'payments' | 'tasks' | 'cap' | 'family-tree'