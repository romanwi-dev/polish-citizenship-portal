/**
 * CAP (Checks Authority Panel) Rules Engine
 * Pure function implementation for case evaluation
 */

import { id } from '@/lib/id';

// Type definitions matching the specification
export interface Task {
  id: string;
  title: string;
  type: 'USC' | 'OBY' | 'Translation' | 'Archive' | 'General';
  status: 'open' | 'blocked' | 'done';
  due?: string; // ISO
  assignee?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CAPSnapshot {
  lastRunAt?: string; // ISO
  rules: number; // total evaluated
  warnings: number;
  blockers: number;
  canProceed: boolean; // true if no blockers
  items: CAPItem[];
}

export interface CAPItem {
  id: string;
  key: string; // stable rule key
  level: 'warning' | 'blocker';
  message: string;
  hint?: string;
  action?: 'open-documents' | 'open-payments' | 'open-family-tree' | 'open-tasks' | 'create-task';
  overridden?: boolean;
  overrideReason?: string;
}

export interface CaseWithCAP {
  id: string;
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
  timeline?: any[];
  documents?: any[];
  payments?: any[];
  servicePayments?: any[];
  tasks?: Task[];
  familyTree?: any;
  cap?: CAPSnapshot;
}

/**
 * Pure function to evaluate CAP rules against case data
 * Returns a complete CAPSnapshot with warnings and blockers
 */
export function runCAP(caseData: CaseWithCAP): CAPSnapshot {
  const items: CAPItem[] = [];
  let warnings = 0;
  let blockers = 0;

  // R1: docs_missing - If any Document slot status === 'missing' → WARNING per slot
  if (caseData.documents && caseData.documents.length > 0) {
    const missingDocs = caseData.documents.filter(doc => doc.status === 'missing');
    if (missingDocs.length > 0) {
      missingDocs.forEach(doc => {
        items.push({
          id: id(),
          key: 'docs_missing',
          level: 'warning',
          message: `Missing document: ${doc.name}`,
          hint: `Document "${doc.name}" is required but has not been uploaded`,
          action: 'open-documents'
        });
        warnings++;
      });
    }
  }

  // R2: payments_pending - If any Payment status === 'Pending' → WARNING (list first 3)
  if (caseData.servicePayments && caseData.servicePayments.length > 0) {
    const pendingPayments = caseData.servicePayments.filter(payment => payment.status === 'Pending');
    if (pendingPayments.length > 0) {
      const displayPayments = pendingPayments.slice(0, 3);
      displayPayments.forEach(payment => {
        items.push({
          id: id(),
          key: 'payments_pending',
          level: 'warning',
          message: `Pending payment: ${payment.label}`,
          hint: payment.amount ? `Amount: €${payment.amount}` : 'Payment amount not specified',
          action: 'open-payments'
        });
        warnings++;
      });
      
      // Add summary if more than 3
      if (pendingPayments.length > 3) {
        items.push({
          id: id(),
          key: 'payments_pending_summary',
          level: 'warning',
          message: `${pendingPayments.length - 3} additional pending payments`,
          hint: 'View payments tab for complete list',
          action: 'open-payments'
        });
        warnings++;
      }
    }
  }

  // R3: timeline_stalled - If last Timeline event older than 90 days → WARNING
  if (caseData.timeline && caseData.timeline.length > 0) {
    const lastEvent = caseData.timeline[caseData.timeline.length - 1];
    const lastEventDate = new Date(lastEvent.date);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    if (lastEventDate < ninetyDaysAgo) {
      items.push({
        id: id(),
        key: 'timeline_stalled',
        level: 'warning',
        message: 'Timeline stalled - no recent activity',
        hint: `Last event was ${Math.floor((Date.now() - lastEventDate.getTime()) / (24 * 60 * 60 * 1000))} days ago`,
        action: 'create-task'
      });
      warnings++;
    }
  }

  // R4: tree_male_ancestor_required - If Family Tree great_grandfather_full_name is empty → BLOCKER
  if (caseData.familyTree) {
    const greatGrandfatherName = caseData.familyTree.great_grandfather_full_name;
    if (!greatGrandfatherName || greatGrandfatherName.trim() === '') {
      items.push({
        id: id(),
        key: 'tree_male_ancestor_required',
        level: 'blocker',
        message: 'Great-grandfather information required',
        hint: 'Polish citizenship requires verified male ancestor lineage',
        action: 'open-family-tree'
      });
      blockers++;
    }
  } else {
    // No family tree data at all
    items.push({
      id: id(),
      key: 'tree_male_ancestor_required',
      level: 'blocker',
      message: 'Family tree data missing',
      hint: 'Complete family tree is required for Polish citizenship application',
      action: 'open-family-tree'
    });
    blockers++;
  }

  // R5: date_conflict - If any date parse fails or marriage < birth → BLOCKER
  if (caseData.familyTree) {
    const dateFields = [
      { field: 'birth_date', name: 'birth date' },
      { field: 'marriage_date', name: 'marriage date' },
      { field: 'death_date', name: 'death date' },
      { field: 'parent_birth_date', name: 'parent birth date' },
      { field: 'parent_marriage_date', name: 'parent marriage date' },
      { field: 'grandfather_birth_date', name: 'grandfather birth date' },
      { field: 'great_grandfather_birth_date', name: 'great-grandfather birth date' }
    ];

    for (const { field, name } of dateFields) {
      const dateValue = caseData.familyTree[field];
      if (dateValue && dateValue.trim() !== '') {
        try {
          const parsedDate = new Date(dateValue);
          if (isNaN(parsedDate.getTime())) {
            items.push({
              id: id(),
              key: 'date_conflict',
              level: 'blocker',
              message: `Invalid ${name} format`,
              hint: `Date "${dateValue}" cannot be parsed. Use DD.MM.YYYY format`,
              action: 'open-family-tree'
            });
            blockers++;
          }
        } catch (error) {
          items.push({
            id: id(),
            key: 'date_conflict',
            level: 'blocker',
            message: `Invalid ${name}`,
            hint: `Date parsing failed for ${name}`,
            action: 'open-family-tree'
          });
          blockers++;
        }
      }
    }

    // Check marriage < birth logic
    if (caseData.familyTree.birth_date && caseData.familyTree.marriage_date) {
      try {
        const birthDate = new Date(caseData.familyTree.birth_date);
        const marriageDate = new Date(caseData.familyTree.marriage_date);
        
        if (!isNaN(birthDate.getTime()) && !isNaN(marriageDate.getTime()) && marriageDate < birthDate) {
          items.push({
            id: id(),
            key: 'date_conflict',
            level: 'blocker',
            message: 'Marriage date before birth date',
            hint: 'Marriage date cannot be earlier than birth date',
            action: 'open-family-tree'
          });
          blockers++;
        }
      } catch (error) {
        // Already handled by individual date validation above
      }
    }
  }

  // R6: translations_needed - If Documents have status 'partial' and "needs translation" flag → WARNING
  if (caseData.documents && caseData.documents.length > 0) {
    const documentsNeedingTranslation = caseData.documents.filter(doc => 
      doc.status === 'partial' && doc.needsTranslation
    );
    
    if (documentsNeedingTranslation.length > 0) {
      documentsNeedingTranslation.forEach(doc => {
        items.push({
          id: id(),
          key: 'translations_needed',
          level: 'warning',
          message: `Translation required: ${doc.name}`,
          hint: 'Document needs official Polish translation',
          action: 'create-task'
        });
        warnings++;
      });
    }
  }

  // Calculate total rules evaluated
  const totalRules = 6; // R1-R6

  return {
    lastRunAt: new Date().toISOString(),
    rules: totalRules,
    warnings,
    blockers,
    canProceed: blockers === 0, // Can proceed only if no blockers (unless overridden)
    items
  };
}