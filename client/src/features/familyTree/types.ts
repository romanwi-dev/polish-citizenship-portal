// Family Tree Types - Exact field codes matching PDF layout
export interface ApplicantData {
  applicant_full_name: string;
  applicant_date_of_birth: string;
  applicant_place_of_birth: string;
  applicant_date_of_marriage: string;
  applicant_place_of_marriage: string;
  applicant_spouse_full_name_and_maiden_name: string;
}

export interface MinorChild {
  minor_full_name: string;
  minor_date_of_birth: string;
  minor_place_of_birth: string;
}

export interface PolishParentData {
  polish_parent_full_name: string;
  polish_parent_date_of_birth: string;
  polish_parent_place_of_birth: string;
  polish_parent_date_of_marriage: string;
  polish_parent_place_of_marriage: string;
  polish_parent_date_of_emigration: string;
  polish_parent_date_of_naturalization: string;
  polish_parent_spouse_full_name: string;
}

export interface PolishGrandparentData {
  polish_grandparent_full_name: string;
  polish_grandparent_date_of_birth: string;
  polish_grandparent_place_of_birth: string;
  polish_grandparent_date_of_mariage: string; // Keep PDF spelling
  polish_grandparent_place_of_mariage: string; // Keep PDF spelling
  polish_grandparent_date_of_emigration: string;
  polish_grandparent_date_of_naturalization: string;
  polish_grandparent_spouse_full_name: string;
}

export interface GreatGrandparentsData {
  great_grandfather_full_name: string; // REQUIRED for eligibility
  great_grandfather_date_of_birth: string;
  great_grandfather_place_of_birth: string;
  great_grandfather_date_of_marriage: string;
  great_grandfather_place_of_marriage: string;
  great_grandfather_date_of_emigartion: string; // Keep PDF spelling
  great_grandfather_date_of_naturalization: string;
  great_grandmother_full_name: string; // Optional
}

export interface FamilyTreeData {
  applicant: ApplicantData;
  minorChildren: MinorChild[]; // 0-3 children
  polishParent: PolishParentData;
  polishGrandparent: PolishGrandparentData;
  greatGrandparents: GreatGrandparentsData;
}

export interface NodeStatus {
  level: 'ok' | 'partial' | 'missing';
  message?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  blockers: string[];
  warnings: string[];
  path: string; // Description of the eligibility path
}

export interface CAPItem {
  key: string;
  level: 'blocker' | 'warning' | 'info';
  message: string;
  action?: string;
}

// Default empty tree data
export const createEmptyFamilyTree = (): FamilyTreeData => ({
  applicant: {
    applicant_full_name: '',
    applicant_date_of_birth: '',
    applicant_place_of_birth: '',
    applicant_date_of_marriage: '',
    applicant_place_of_marriage: '',
    applicant_spouse_full_name_and_maiden_name: '',
  },
  minorChildren: [],
  polishParent: {
    polish_parent_full_name: '',
    polish_parent_date_of_birth: '',
    polish_parent_place_of_birth: '',
    polish_parent_date_of_marriage: '',
    polish_parent_place_of_marriage: '',
    polish_parent_date_of_emigration: '',
    polish_parent_date_of_naturalization: '',
    polish_parent_spouse_full_name: '',
  },
  polishGrandparent: {
    polish_grandparent_full_name: '',
    polish_grandparent_date_of_birth: '',
    polish_grandparent_place_of_birth: '',
    polish_grandparent_date_of_mariage: '',
    polish_grandparent_place_of_mariage: '',
    polish_grandparent_date_of_emigration: '',
    polish_grandparent_date_of_naturalization: '',
    polish_grandparent_spouse_full_name: '',
  },
  greatGrandparents: {
    great_grandfather_full_name: '',
    great_grandfather_date_of_birth: '',
    great_grandfather_place_of_birth: '',
    great_grandfather_date_of_marriage: '',
    great_grandfather_place_of_marriage: '',
    great_grandfather_date_of_emigartion: '',
    great_grandfather_date_of_naturalization: '',
    great_grandmother_full_name: '',
  },
});