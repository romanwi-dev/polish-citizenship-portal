import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { caseProgress, clientDetails, familyTreeData } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and initialize OBY schema validator
const schemaPath = path.join(__dirname, '../../schemas/oby.schema.json');
const obySchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validateOBY = ajv.compile(obySchema);

export interface OBYMappingResult {
  success: boolean;
  data?: any;
  errors?: string[];
  warnings?: string[];
}

export interface FamilyTreeMember {
  id: string;
  firstName?: string;
  lastName?: string;
  maidenName?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  nationality?: string;
  relationship?: string;
  polishCitizen?: boolean;
  citizenshipLost?: boolean;
  citizenshipLostDate?: string;
  citizenshipLostReason?: string;
  emigrationDate?: string;
  emigrationDestination?: string;
  marriageDate?: string;
  marriagePlace?: string;
  birthCertNumber?: string;
  deathCertNumber?: string;
  marriageCertNumber?: string;
  passportNumber?: string;
}

export interface FamilyTreeData {
  applicant?: FamilyTreeMember;
  parent1?: FamilyTreeMember;
  parent2?: FamilyTreeMember;
  grandparent1?: FamilyTreeMember;
  grandparent2?: FamilyTreeMember;
  [key: string]: any;
}

/**
 * Generate OBY JSON from case data
 */
export async function generateOBYFromCase(caseId: string): Promise<OBYMappingResult> {
  try {
    const warnings: string[] = [];

    // Fetch case progress data
    const caseData = await db
      .select()
      .from(caseProgress)
      .where(eq(caseProgress.caseId, caseId))
      .limit(1);

    if (!caseData.length) {
      return {
        success: false,
        errors: [`Case with ID ${caseId} not found`]
      };
    }

    const caseRecord = caseData[0];

    // Fetch client details
    const clientData = await db
      .select()
      .from(clientDetails)
      .where(eq(clientDetails.userId, caseRecord.userId))
      .limit(1);

    // Fetch family tree data
    const familyData = await db
      .select()
      .from(familyTreeData)
      .where(eq(familyTreeData.userId, caseRecord.userId))
      .limit(1);

    const client = clientData[0];
    const familyTree: FamilyTreeData = familyData[0]?.treeData as FamilyTreeData || {};

    // Build OBY JSON structure
    const obyData = {
      _meta: {
        schemaVersion: "1.0.0",
        generatedAt: new Date().toISOString(),
        caseId: caseId,
        clientId: caseRecord.userId
      },

      applicant: mapApplicantData(client, familyTree.applicant, warnings),
      parent1: mapParentData(familyTree.parent1, 'P1', warnings),
      parent2: mapParentData(familyTree.parent2, 'P2', warnings),
      grandparent1: mapGrandparentData(familyTree.grandparent1, 'GP1', warnings),
      grandparent2: mapGrandparentData(familyTree.grandparent2, 'GP2', warnings),
      lineage: mapLineageData(familyTree, warnings),
      contact: mapContactData(client, warnings),
      addresses: mapAddressData(client, warnings),
      documents: mapDocumentData(caseRecord, warnings),
      declarations: mapDeclarationData(warnings)
    };

    // Validate against schema
    const isValid = validateOBY(obyData);
    
    if (!isValid) {
      const errors = validateOBY.errors?.map(error => 
        `${error.instancePath || '/'} ${error.message}` + 
        (error.data !== undefined ? ` (got: ${JSON.stringify(error.data)})` : '')
      ) || ['Unknown validation error'];
      
      return {
        success: false,
        errors,
        warnings,
        data: obyData // Return data even if invalid for debugging
      };
    }

    return {
      success: true,
      data: obyData,
      warnings
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to generate OBY JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Map applicant data to OBY schema
 */
function mapApplicantData(client: any, applicant: FamilyTreeMember | undefined, warnings: string[]): any {
  const result: any = {};

  // Map from client details
  if (client) {
    result['OBY-A-GN'] = client.firstName || '';
    result['OBY-A-SN'] = client.lastName || '';
    result['OBY-A-DOB'] = client.birthDate || '';
    result['OBY-A-POB'] = client.birthPlace || '';
    result['OBY-A-POB-COUNTRY'] = extractCountryFromPlace(client.birthPlace);
    result['OBY-A-NATIONALITY'] = client.nationality || '';
    result['OBY-A-PASSPORT-NO'] = client.passportNumber || '';
    result['OBY-A-MARITAL-STATUS'] = normalizeMaritalStatus(client.maritalStatus);
    result['OBY-A-PROFESSION'] = client.occupation || '';
    result['OBY-A-EMAIL'] = client.email || '';
    result['OBY-A-PHONE'] = client.phone || '';
  }

  // Overlay with family tree applicant data if available
  if (applicant) {
    if (applicant.firstName) result['OBY-A-GN'] = applicant.firstName;
    if (applicant.lastName) result['OBY-A-SN'] = applicant.lastName;
    if (applicant.birthDate) result['OBY-A-DOB'] = applicant.birthDate;
    if (applicant.birthPlace) result['OBY-A-POB'] = applicant.birthPlace;
    if (applicant.nationality) result['OBY-A-NATIONALITY'] = applicant.nationality;
    if (applicant.passportNumber) result['OBY-A-PASSPORT-NO'] = applicant.passportNumber;
  }

  // Check required fields
  if (!result['OBY-A-GN']) warnings.push('Missing applicant given names');
  if (!result['OBY-A-SN']) warnings.push('Missing applicant surname');
  if (!result['OBY-A-DOB']) warnings.push('Missing applicant date of birth');
  if (!result['OBY-A-POB']) warnings.push('Missing applicant place of birth');

  return result;
}

/**
 * Map parent data to OBY schema
 */
function mapParentData(parent: FamilyTreeMember | undefined, prefix: 'P1' | 'P2', warnings: string[]): any {
  const result: any = {};

  if (!parent) {
    warnings.push(`Missing ${prefix === 'P1' ? 'first' : 'second'} parent data`);
    return result;
  }

  result[`OBY-${prefix}-GN`] = parent.firstName || '';
  result[`OBY-${prefix}-SN`] = parent.lastName || '';
  result[`OBY-${prefix}-MAIDEN`] = parent.maidenName || '';
  result[`OBY-${prefix}-DOB`] = parent.birthDate || '';
  result[`OBY-${prefix}-POB`] = parent.birthPlace || '';
  result[`OBY-${prefix}-POB-COUNTRY`] = extractCountryFromPlace(parent.birthPlace);
  result[`OBY-${prefix}-DOD`] = parent.deathDate || '';
  result[`OBY-${prefix}-POD`] = parent.deathPlace || '';
  result[`OBY-${prefix}-NATIONALITY`] = parent.nationality || '';
  result[`OBY-${prefix}-POLISH-CITIZEN`] = parent.polishCitizen || false;
  result[`OBY-${prefix}-CITIZENSHIP-LOST`] = parent.citizenshipLost || false;
  result[`OBY-${prefix}-CITIZENSHIP-LOST-DATE`] = parent.citizenshipLostDate || '';
  result[`OBY-${prefix}-CITIZENSHIP-LOST-REASON`] = parent.citizenshipLostReason || '';
  result[`OBY-${prefix}-EMIGRATION-DATE`] = parent.emigrationDate || '';
  result[`OBY-${prefix}-EMIGRATION-DESTINATION`] = parent.emigrationDestination || '';
  result[`OBY-${prefix}-MARRIAGE-DATE`] = parent.marriageDate || '';
  result[`OBY-${prefix}-MARRIAGE-PLACE`] = parent.marriagePlace || '';
  result[`OBY-${prefix}-BIRTH-CERT-NO`] = parent.birthCertNumber || '';
  result[`OBY-${prefix}-DEATH-CERT-NO`] = parent.deathCertNumber || '';
  result[`OBY-${prefix}-MARRIAGE-CERT-NO`] = parent.marriageCertNumber || '';
  result[`OBY-${prefix}-PASSPORT-NO`] = parent.passportNumber || '';

  // Check critical fields
  if (!parent.firstName) warnings.push(`Missing ${prefix} parent given names`);
  if (!parent.lastName) warnings.push(`Missing ${prefix} parent surname`);

  return result;
}

/**
 * Map grandparent data to OBY schema
 */
function mapGrandparentData(grandparent: FamilyTreeMember | undefined, prefix: 'GP1' | 'GP2', warnings: string[]): any {
  const result: any = {};

  if (!grandparent) {
    warnings.push(`Missing ${prefix === 'GP1' ? 'first' : 'second'} grandparent data`);
    return result;
  }

  result[`OBY-${prefix}-GN`] = grandparent.firstName || '';
  result[`OBY-${prefix}-SN`] = grandparent.lastName || '';
  result[`OBY-${prefix}-MAIDEN`] = grandparent.maidenName || '';
  result[`OBY-${prefix}-DOB`] = grandparent.birthDate || '';
  result[`OBY-${prefix}-POB`] = grandparent.birthPlace || '';
  result[`OBY-${prefix}-POB-COUNTRY`] = extractCountryFromPlace(grandparent.birthPlace);
  result[`OBY-${prefix}-DOD`] = grandparent.deathDate || '';
  result[`OBY-${prefix}-POD`] = grandparent.deathPlace || '';
  result[`OBY-${prefix}-RELATIONSHIP`] = normalizeRelationship(grandparent.relationship);
  result[`OBY-${prefix}-POLISH-CITIZEN`] = grandparent.polishCitizen || false;
  result[`OBY-${prefix}-CITIZENSHIP-LOST`] = grandparent.citizenshipLost || false;
  result[`OBY-${prefix}-CITIZENSHIP-LOST-DATE`] = grandparent.citizenshipLostDate || '';
  result[`OBY-${prefix}-EMIGRATION-DATE`] = grandparent.emigrationDate || '';
  result[`OBY-${prefix}-EMIGRATION-DESTINATION`] = grandparent.emigrationDestination || '';
  result[`OBY-${prefix}-BIRTH-CERT-NO`] = grandparent.birthCertNumber || '';
  result[`OBY-${prefix}-DEATH-CERT-NO`] = grandparent.deathCertNumber || '';

  return result;
}

/**
 * Map lineage/ancestry data
 */
function mapLineageData(familyTree: FamilyTreeData, warnings: string[]): any {
  const result: any = {};

  // Analyze family tree to determine lineage details
  const hasPolishParent = familyTree.parent1?.polishCitizen || familyTree.parent2?.polishCitizen;
  const hasPolishGrandparent = familyTree.grandparent1?.polishCitizen || familyTree.grandparent2?.polishCitizen;

  result['OBY-L-CLAIM-BASIS'] = 'jus-sanguinis'; // Default for descent applications
  
  if (hasPolishParent) {
    result['OBY-L-GENERATION'] = 'parent';
    result['OBY-L-ANCESTOR-LINE'] = familyTree.parent1?.polishCitizen ? 'paternal' : 'maternal';
  } else if (hasPolishGrandparent) {
    result['OBY-L-GENERATION'] = 'grandparent';
    result['OBY-L-ANCESTOR-LINE'] = familyTree.grandparent1?.polishCitizen ? 'paternal' : 'maternal';
  } else {
    warnings.push('No Polish ancestor found in family tree');
  }

  result['OBY-L-CONTINUOUS-LINEAGE'] = assessContinuousLineage(familyTree);
  result['OBY-L-POST-1920-CITIZENSHIP'] = true; // Default assumption
  
  return result;
}

/**
 * Map contact information
 */
function mapContactData(client: any, warnings: string[]): any {
  const result: any = {};

  if (client) {
    result['OBY-C-EMAIL'] = client.email || '';
    result['OBY-C-PHONE'] = client.phone || '';
    result['OBY-C-PREFERRED-CONTACT'] = 'email'; // Default
    result['OBY-C-PREFERRED-LANGUAGE'] = 'english'; // Default
  }

  return result;
}

/**
 * Map address information
 */
function mapAddressData(client: any, warnings: string[]): any {
  const result: any = {};

  if (client) {
    result['OBY-ADDR-CURRENT-STREET'] = client.address || '';
    result['OBY-ADDR-CURRENT-CITY'] = client.city || '';
    result['OBY-ADDR-CURRENT-POSTAL'] = client.postalCode || '';
    result['OBY-ADDR-CURRENT-COUNTRY'] = client.country || '';
    result['OBY-ADDR-MAILING-SAME'] = true; // Default assumption
  }

  return result;
}

/**
 * Map document status
 */
function mapDocumentData(caseRecord: any, warnings: string[]): any {
  const result: any = {};

  // Map based on case progress
  const documentsCollected = caseRecord.documentsCollected || 0;
  const documentsRequired = caseRecord.documentsRequired || 12;
  
  // Basic document status - would need more detailed document tracking for accurate mapping
  result['OBY-DOC-BIRTH-CERT'] = documentsCollected > 0;
  result['OBY-DOC-PASSPORT'] = documentsCollected > 0;
  result['OBY-DOC-PARENT-BIRTH-CERT'] = documentsCollected > 2;
  result['OBY-DOC-GRANDPARENT-BIRTH-CERT'] = documentsCollected > 4;
  
  if (documentsCollected < documentsRequired) {
    warnings.push(`Document collection incomplete: ${documentsCollected}/${documentsRequired}`);
  }

  return result;
}

/**
 * Map legal declarations
 */
function mapDeclarationData(warnings: string[]): any {
  return {
    'OBY-DECL-ACCURACY': false, // Requires explicit user confirmation
    'OBY-DECL-ALLEGIANCE': false, // Requires explicit user confirmation  
    'OBY-DECL-NO-TERRORISM': false, // Requires explicit user confirmation
    'OBY-DECL-NO-TREASON': false, // Requires explicit user confirmation
    'OBY-DECL-OATH-WILLINGNESS': false // Requires explicit user confirmation
  };
}

// Utility functions

function extractCountryFromPlace(place: string | undefined): string {
  if (!place) return '';
  
  // Simple country extraction - could be enhanced with a country database
  const commonCountries = ['Poland', 'USA', 'United States', 'Germany', 'France', 'UK', 'Canada', 'Australia'];
  for (const country of commonCountries) {
    if (place.toLowerCase().includes(country.toLowerCase())) {
      return country;
    }
  }
  
  // Return the last part after comma as likely country
  const parts = place.split(',');
  return parts[parts.length - 1].trim();
}

function normalizeMaritalStatus(status: string | undefined): string {
  if (!status) return 'single';
  
  const normalized = status.toLowerCase();
  if (normalized.includes('married')) return 'married';
  if (normalized.includes('divorced')) return 'divorced';
  if (normalized.includes('widow')) return 'widowed';
  return 'single';
}

function normalizeRelationship(relationship: string | undefined): string {
  if (!relationship) return 'paternal-grandfather';
  
  const normalized = relationship.toLowerCase();
  if (normalized.includes('grandmother')) {
    return normalized.includes('maternal') ? 'maternal-grandmother' : 'paternal-grandmother';
  }
  if (normalized.includes('grandfather')) {
    return normalized.includes('maternal') ? 'maternal-grandfather' : 'paternal-grandfather';
  }
  
  return 'paternal-grandfather'; // Default
}

function assessContinuousLineage(familyTree: FamilyTreeData): boolean {
  // Simple assessment - would need more complex logic for accurate determination
  const parent1Lost = familyTree.parent1?.citizenshipLost;
  const parent2Lost = familyTree.parent2?.citizenshipLost;
  const gp1Lost = familyTree.grandparent1?.citizenshipLost;
  const gp2Lost = familyTree.grandparent2?.citizenshipLost;
  
  // If no one lost citizenship, assume continuous lineage
  return !(parent1Lost || parent2Lost || gp1Lost || gp2Lost);
}