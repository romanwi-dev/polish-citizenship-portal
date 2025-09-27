import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock document requirements and HAC rules engine
interface CaseDocument {
  type: string;
  name: string;
  status: 'required' | 'optional' | 'missing';
  uploaded: boolean;
}

interface CaseAssessment {
  caseId: string;
  documents: CaseDocument[];
  warnings: string[];
  status: 'GREEN' | 'AMBER' | 'RED';
  canProceed: boolean;
  overrideReason?: string;
  overrideBy?: string;
}

// Mock HAC (Hierarchical Access Control) rules engine
const hacRules = {
  // Required documents for Polish citizenship cases
  requiredDocuments: [
    { type: 'passport', name: 'Valid Passport Copy', required: true },
    { type: 'birth_certificate', name: 'Birth Certificate', required: true },
    { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', required: true },
    { type: 'marriage_certificate', name: 'Marriage Certificate', required: false },
  ],

  // Assess case completeness
  assessCase: (caseId: string, documents: CaseDocument[]): CaseAssessment => {
    const warnings: string[] = [];
    const requiredDocs = hacRules.requiredDocuments.filter(d => d.required);
    
    // Check for missing required documents
    const missingRequired = requiredDocs.filter(required => 
      !documents.find(doc => doc.type === required.type && doc.uploaded)
    );

    // Check for optional documents that might be needed
    const optionalDocs = hacRules.requiredDocuments.filter(d => !d.required);
    const missingOptional = optionalDocs.filter(optional =>
      !documents.find(doc => doc.type === optional.type && doc.uploaded)
    );

    // Generate warnings
    if (missingRequired.length > 0) {
      missingRequired.forEach(doc => {
        warnings.push(`Required document missing: ${doc.name}`);
      });
    }

    if (missingOptional.length > 0) {
      missingOptional.forEach(doc => {
        warnings.push(`Optional document missing: ${doc.name} (may be required for specific cases)`);
      });
    }

    // Determine status
    let status: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    if (missingRequired.length > 0) {
      status = 'RED';
    } else if (missingOptional.length > 0) {
      status = 'AMBER';
    }

    return {
      caseId,
      documents,
      warnings,
      status,
      canProceed: status === 'GREEN' || status === 'AMBER'
    };
  },

  // Apply override to bypass warnings/requirements
  applyOverride: (assessment: CaseAssessment, reason: string, overrideBy: string): CaseAssessment => {
    return {
      ...assessment,
      canProceed: true, // Override allows proceeding regardless of status
      overrideReason: reason,
      overrideBy: overrideBy,
      warnings: [
        ...assessment.warnings,
        `OVERRIDE APPLIED: ${reason} (by ${overrideBy})`
      ]
    };
  },

  // Check if case can proceed to next step
  canProceedToSubmission: (assessment: CaseAssessment): boolean => {
    // Can proceed if GREEN status OR if override applied
    return assessment.status === 'GREEN' || !!assessment.overrideReason;
  }
};

describe('HAC Rules Engine', () => {
  let mockDocuments: CaseDocument[];

  beforeEach(() => {
    mockDocuments = [];
  });

  describe('Document Assessment', () => {
    it('should warn when required documents are missing', () => {
      // Case with no documents
      const assessment = hacRules.assessCase('TEST-001', mockDocuments);

      expect(assessment.status).toBe('RED');
      expect(assessment.warnings).toContain('Required document missing: Valid Passport Copy');
      expect(assessment.warnings).toContain('Required document missing: Birth Certificate');
      expect(assessment.warnings).toContain('Required document missing: Polish Ancestor Documentation');
      expect(assessment.canProceed).toBe(false);
    });

    it('should be silent when all required documents are present', () => {
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: true },
        { type: 'birth_certificate', name:'Birth Certificate', status: 'required', uploaded: true },
        { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', status: 'required', uploaded: true },
        { type: 'marriage_certificate', name: 'Marriage Certificate', status: 'optional', uploaded: true },
      ];

      const assessment = hacRules.assessCase('TEST-002', mockDocuments);

      expect(assessment.status).toBe('GREEN');
      expect(assessment.warnings.filter(w => w.includes('Required document missing'))).toHaveLength(0);
      expect(assessment.canProceed).toBe(true);
    });

    it('should show AMBER status when optional documents are missing', () => {
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: true },
        { type: 'birth_certificate', name: 'Birth Certificate', status: 'required', uploaded: true },
        { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', status: 'required', uploaded: true },
        // Missing marriage certificate (optional)
      ];

      const assessment = hacRules.assessCase('TEST-003', mockDocuments);

      expect(assessment.status).toBe('AMBER');
      expect(assessment.warnings).toContain('Optional document missing: Marriage Certificate (may be required for specific cases)');
      expect(assessment.canProceed).toBe(true); // Can proceed with AMBER
    });

    it('should identify documents correctly by type', () => {
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: true },
        // Missing birth certificate and ancestor docs
      ];

      const assessment = hacRules.assessCase('TEST-004', mockDocuments);

      expect(assessment.status).toBe('RED');
      expect(assessment.warnings).not.toContain('Required document missing: Valid Passport Copy');
      expect(assessment.warnings).toContain('Required document missing: Birth Certificate');
      expect(assessment.warnings).toContain('Required document missing: Polish Ancestor Documentation');
    });

    it('should not count non-uploaded documents', () => {
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: false }, // Not uploaded
        { type: 'birth_certificate', name: 'Birth Certificate', status: 'required', uploaded: true },
        { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', status: 'required', uploaded: true },
      ];

      const assessment = hacRules.assessCase('TEST-005', mockDocuments);

      expect(assessment.status).toBe('RED');
      expect(assessment.warnings).toContain('Required document missing: Valid Passport Copy');
      expect(assessment.canProceed).toBe(false);
    });
  });

  describe('Override Functionality', () => {
    let redAssessment: CaseAssessment;

    beforeEach(() => {
      // Create a RED assessment (missing required docs)
      redAssessment = hacRules.assessCase('TEST-OVERRIDE', mockDocuments);
    });

    it('should allow override to bypass RED status', () => {
      const overriddenAssessment = hacRules.applyOverride(
        redAssessment,
        'Client has special circumstances - documents in Polish archives',
        'senior.agent@example.com'
      );

      expect(overriddenAssessment.canProceed).toBe(true);
      expect(overriddenAssessment.overrideReason).toBe('Client has special circumstances - documents in Polish archives');
      expect(overriddenAssessment.overrideBy).toBe('senior.agent@example.com');
      expect(overriddenAssessment.warnings).toContain('OVERRIDE APPLIED: Client has special circumstances - documents in Polish archives (by senior.agent@example.com)');
    });

    it('should allow override to bypass AMBER status', () => {
      // Create AMBER assessment
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: true },
        { type: 'birth_certificate', name: 'Birth Certificate', status: 'required', uploaded: true },
        { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', status: 'required', uploaded: true },
      ];
      const amberAssessment = hacRules.assessCase('TEST-AMBER-OVERRIDE', mockDocuments);

      const overriddenAssessment = hacRules.applyOverride(
        amberAssessment,
        'Marriage certificate not applicable for this case type',
        'agent@example.com'
      );

      expect(overriddenAssessment.canProceed).toBe(true);
      expect(overriddenAssessment.overrideReason).toBe('Marriage certificate not applicable for this case type');
    });

    it('should preserve original warnings when override is applied', () => {
      const originalWarnings = redAssessment.warnings.slice(); // Copy array
      
      const overriddenAssessment = hacRules.applyOverride(
        redAssessment,
        'Override reason',
        'agent@example.com'
      );

      // Should have original warnings plus override warning
      originalWarnings.forEach(warning => {
        expect(overriddenAssessment.warnings).toContain(warning);
      });
      expect(overriddenAssessment.warnings).toContain('OVERRIDE APPLIED: Override reason (by agent@example.com)');
    });

    it('should not block next steps when override is applied', () => {
      const overriddenAssessment = hacRules.applyOverride(
        redAssessment,
        'Override for testing',
        'test.agent@example.com'
      );

      expect(hacRules.canProceedToSubmission(overriddenAssessment)).toBe(true);
    });
  });

  describe('Submission Readiness', () => {
    it('should allow GREEN status cases to proceed', () => {
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: true },
        { type: 'birth_certificate', name: 'Birth Certificate', status: 'required', uploaded: true },
        { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', status: 'required', uploaded: true },
        { type: 'marriage_certificate', name: 'Marriage Certificate', status: 'optional', uploaded: true },
      ];

      const assessment = hacRules.assessCase('TEST-GREEN', mockDocuments);
      
      expect(assessment.status).toBe('GREEN');
      expect(hacRules.canProceedToSubmission(assessment)).toBe(true);
    });

    it('should block RED status cases without override', () => {
      const assessment = hacRules.assessCase('TEST-RED-BLOCKED', mockDocuments);
      
      expect(assessment.status).toBe('RED');
      expect(hacRules.canProceedToSubmission(assessment)).toBe(false);
    });

    it('should allow RED status cases with override', () => {
      const redAssessment = hacRules.assessCase('TEST-RED-OVERRIDE', mockDocuments);
      const overriddenAssessment = hacRules.applyOverride(
        redAssessment,
        'Special approval from supervisor',
        'supervisor@example.com'
      );
      
      expect(hacRules.canProceedToSubmission(overriddenAssessment)).toBe(true);
    });

    it('should handle AMBER status cases appropriately', () => {
      mockDocuments = [
        { type: 'passport', name: 'Valid Passport Copy', status: 'required', uploaded: true },
        { type: 'birth_certificate', name: 'Birth Certificate', status: 'required', uploaded: true },
        { type: 'polish_ancestor_docs', name: 'Polish Ancestor Documentation', status: 'required', uploaded: true },
      ];

      const assessment = hacRules.assessCase('TEST-AMBER', mockDocuments);
      
      expect(assessment.status).toBe('AMBER');
      // AMBER status can proceed (warning only)
      expect(hacRules.canProceedToSubmission(assessment)).toBe(false); // Based on current rules, AMBER needs override
    });
  });
});