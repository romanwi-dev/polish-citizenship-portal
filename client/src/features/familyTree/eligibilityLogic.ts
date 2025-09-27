import { FamilyTreeData, EligibilityResult, CAPItem, NodeStatus } from './types';
import { parsePL } from '@/lib/date';

/**
 * Polish Bloodline Eligibility Logic
 * Implements Roman's rules for Polish citizenship by descent
 */

export const validateEligibility = (data: FamilyTreeData): EligibilityResult => {
  const blockers: string[] = [];
  const warnings: string[] = [];
  let path = '';

  // CRITICAL RULE: Great-grandfather (male) must be specified
  if (!data.greatGrandparents.great_grandfather_full_name?.trim()) {
    blockers.push('Great-grandfather (male) must be specified for depth-level proof');
  }

  // Validate eligibility path
  const hasApplicant = !!data.applicant.applicant_full_name?.trim();
  const hasPolishParent = !!data.polishParent.polish_parent_full_name?.trim();
  const hasPolishGrandparent = !!data.polishGrandparent.polish_grandparent_full_name?.trim();
  const hasGreatGrandfather = !!data.greatGrandparents.great_grandfather_full_name?.trim();

  if (!hasApplicant) {
    blockers.push('Applicant information is required');
  }
  if (!hasPolishParent) {
    blockers.push('Polish parent information is required');
  }
  if (!hasPolishGrandparent) {
    blockers.push('Polish grandparent information is required');
  }

  // Build eligibility path description
  if (hasApplicant && hasPolishParent && hasPolishGrandparent && hasGreatGrandfather) {
    path = 'Applicant → Polish Parent (any gender) → Polish Grandparent (any gender) → Great Grandfather (male REQUIRED)';
  } else {
    path = 'Incomplete lineage path';
  }

  // Date consistency checks
  const dateWarnings = validateDateConsistency(data);
  warnings.push(...dateWarnings);

  // Naturalization timing checks
  const naturalizationWarnings = validateNaturalizationTiming(data);
  warnings.push(...naturalizationWarnings);

  const isEligible = blockers.length === 0;

  return {
    isEligible,
    blockers,
    warnings,
    path
  };
};

/**
 * Generate CAP items based on eligibility validation
 */
export const generateCAPItems = (data: FamilyTreeData): CAPItem[] => {
  const items: CAPItem[] = [];
  const eligibility = validateEligibility(data);

  // Critical blocker: Missing great-grandfather
  if (!data.greatGrandparents.great_grandfather_full_name?.trim()) {
    items.push({
      key: 'tree.male_ancestor_required',
      level: 'blocker',
      message: 'Great-grandfather (male) must be specified for depth-level proof.',
      action: 'Open Family Tree'
    });
  }

  // Other blockers
  eligibility.blockers.forEach((blocker, index) => {
    if (!blocker.includes('Great-grandfather')) { // Already handled above
      items.push({
        key: `tree.blocker_${index}`,
        level: 'blocker',
        message: blocker,
        action: 'Complete Family Tree'
      });
    }
  });

  // Warnings
  eligibility.warnings.forEach((warning, index) => {
    items.push({
      key: `tree.warning_${index}`,
      level: 'warning',
      message: warning,
      action: 'Review Family Tree'
    });
  });

  return items;
};

/**
 * Validate date consistency across generations
 */
const validateDateConsistency = (data: FamilyTreeData): string[] => {
  const warnings: string[] = [];

  // Helper to parse dates safely
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr?.trim()) return null;
    try {
      return parsePL(dateStr);
    } catch {
      return null;
    }
  };

  // Check applicant dates
  const applicantBirth = parseDate(data.applicant.applicant_date_of_birth);
  const applicantMarriage = parseDate(data.applicant.applicant_date_of_marriage);
  
  if (applicantBirth && applicantMarriage && applicantMarriage < applicantBirth) {
    warnings.push('Applicant marriage date is before birth date');
  }

  // Check Polish parent dates
  const parentBirth = parseDate(data.polishParent.polish_parent_date_of_birth);
  const parentMarriage = parseDate(data.polishParent.polish_parent_date_of_marriage);
  const parentNaturalization = parseDate(data.polishParent.polish_parent_date_of_naturalization);

  if (parentBirth) {
    if (parentMarriage && parentMarriage < parentBirth) {
      warnings.push('Polish parent marriage date is before birth date');
    }
    if (parentNaturalization && parentNaturalization < parentBirth) {
      warnings.push('Polish parent naturalization date is before birth date');
    }
  }

  // Check Polish grandparent dates
  const grandparentBirth = parseDate(data.polishGrandparent.polish_grandparent_date_of_birth);
  const grandparentMarriage = parseDate(data.polishGrandparent.polish_grandparent_date_of_mariage);
  const grandparentNaturalization = parseDate(data.polishGrandparent.polish_grandparent_date_of_naturalization);

  if (grandparentBirth) {
    if (grandparentMarriage && grandparentMarriage < grandparentBirth) {
      warnings.push('Polish grandparent marriage date is before birth date');
    }
    if (grandparentNaturalization && grandparentNaturalization < grandparentBirth) {
      warnings.push('Polish grandparent naturalization date is before birth date');
    }
  }

  return warnings;
};

/**
 * Validate naturalization timing implications
 */
const validateNaturalizationTiming = (data: FamilyTreeData): string[] => {
  const warnings: string[] = [];

  // Helper to parse dates safely
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr?.trim()) return null;
    try {
      return parsePL(dateStr);
    } catch {
      return null;
    }
  };

  // Check if parent naturalized before applicant birth (potential loss of citizenship)
  const parentNaturalization = parseDate(data.polishParent.polish_parent_date_of_naturalization);
  const applicantBirth = parseDate(data.applicant.applicant_date_of_birth);

  if (parentNaturalization && applicantBirth && parentNaturalization < applicantBirth) {
    warnings.push('Polish parent naturalized before applicant birth - may affect citizenship transmission');
  }

  // Check if grandparent naturalized before parent birth
  const grandparentNaturalization = parseDate(data.polishGrandparent.polish_grandparent_date_of_naturalization);
  const parentBirth = parseDate(data.polishParent.polish_parent_date_of_birth);

  if (grandparentNaturalization && parentBirth && grandparentNaturalization < parentBirth) {
    warnings.push('Polish grandparent naturalized before parent birth - may affect citizenship transmission');
  }

  return warnings;
};

/**
 * Calculate node status for UI display
 */
export const getNodeStatus = (nodeData: any, requiredFields: string[]): NodeStatus => {
  if (!nodeData) {
    return { level: 'missing', message: 'No data provided' };
  }

  const presentFields = requiredFields.filter(field => 
    nodeData[field] && nodeData[field].toString().trim() !== ''
  );

  if (presentFields.length === 0) {
    return { level: 'missing', message: 'All fields missing' };
  } else if (presentFields.length < requiredFields.length) {
    return { 
      level: 'partial', 
      message: `${presentFields.length}/${requiredFields.length} fields completed` 
    };
  } else {
    return { level: 'ok', message: 'All required fields completed' };
  }
};

/**
 * Get required fields for each node type
 */
export const getRequiredFields = (nodeType: 'applicant' | 'polishParent' | 'polishGrandparent' | 'greatGrandparents'): string[] => {
  switch (nodeType) {
    case 'applicant':
      return ['applicant_full_name', 'applicant_date_of_birth', 'applicant_place_of_birth'];
    case 'polishParent':
      return ['polish_parent_full_name', 'polish_parent_date_of_birth', 'polish_parent_place_of_birth'];
    case 'polishGrandparent':
      return ['polish_grandparent_full_name', 'polish_grandparent_date_of_birth', 'polish_grandparent_place_of_birth'];
    case 'greatGrandparents':
      return ['great_grandfather_full_name']; // Only male ancestor required
    default:
      return [];
  }
};