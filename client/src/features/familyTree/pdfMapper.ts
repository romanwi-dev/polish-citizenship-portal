import { FamilyTreeData } from './types';
import { formatPL } from '@/lib/date';

/**
 * PDF Field Mapper - Maps family tree data to exact PDF field codes
 * Field codes match the PDF form field names exactly as provided
 */

export interface PDFFieldMapping {
  [fieldCode: string]: string;
}

export const mapFamilyTreeToPDFFields = (data: FamilyTreeData): PDFFieldMapping => {
  const mapping: PDFFieldMapping = {};

  // APPLICANT section
  mapping['applicant_full_name'] = data.applicant.applicant_full_name || '';
  mapping['applicant_date_of_birth'] = data.applicant.applicant_date_of_birth ? formatPL(new Date(data.applicant.applicant_date_of_birth)) : '';
  mapping['applicant_place_of_birth'] = data.applicant.applicant_place_of_birth || '';
  mapping['applicant_date_of_marriage'] = data.applicant.applicant_date_of_marriage ? formatPL(new Date(data.applicant.applicant_date_of_marriage)) : '';
  mapping['applicant_place_of_marriage'] = data.applicant.applicant_place_of_marriage || '';
  mapping['applicant_spouse_full_name_and_maiden_name'] = data.applicant.applicant_spouse_full_name_and_maiden_name || '';

  // MINOR CHILDREN (0-3 dynamic)
  data.minorChildren.forEach((child, index) => {
    const childNum = index + 1;
    if (childNum <= 3) {
      mapping[`minor_${childNum}_full_name`] = child.minor_full_name || '';
      mapping[`minor_${childNum}_date_of_birth`] = child.minor_date_of_birth ? formatPL(new Date(child.minor_date_of_birth)) : '';
      if (childNum <= 2) { // Only first 2 children have place_of_birth in PDF
        mapping[`minor_${childNum}_place_of_birth`] = child.minor_place_of_birth || '';
      }
    }
  });

  // POLISH PARENT section
  mapping['polish_parent_full_name'] = data.polishParent.polish_parent_full_name || '';
  mapping['polish_parent_date_of_birth'] = data.polishParent.polish_parent_date_of_birth ? formatPL(new Date(data.polishParent.polish_parent_date_of_birth)) : '';
  mapping['polish_parent_place_of_birth'] = data.polishParent.polish_parent_place_of_birth || '';
  mapping['polish_parent_date_of_marriage'] = data.polishParent.polish_parent_date_of_marriage ? formatPL(new Date(data.polishParent.polish_parent_date_of_marriage)) : '';
  mapping['polish_parent_place_of_marriage'] = data.polishParent.polish_parent_place_of_marriage || '';
  mapping['polish_parent_date_of_emigration'] = data.polishParent.polish_parent_date_of_emigration ? formatPL(new Date(data.polishParent.polish_parent_date_of_emigration)) : '';
  mapping['polish_parent_date_of_naturalization'] = data.polishParent.polish_parent_date_of_naturalization ? formatPL(new Date(data.polishParent.polish_parent_date_of_naturalization)) : '';
  mapping['polish_parent_spouse_full_name'] = data.polishParent.polish_parent_spouse_full_name || '';

  // POLISH GRANDPARENT section
  mapping['polish_grandparent_full_name'] = data.polishGrandparent.polish_grandparent_full_name || '';
  mapping['polish_grandparent_date_of_birth'] = data.polishGrandparent.polish_grandparent_date_of_birth ? formatPL(new Date(data.polishGrandparent.polish_grandparent_date_of_birth)) : '';
  mapping['polish_grandparent_place_of_birth'] = data.polishGrandparent.polish_grandparent_place_of_birth || '';
  // Note: PDF has "mariage" spelling - keeping exact match
  mapping['polish_grandparent_date_of_mariage'] = data.polishGrandparent.polish_grandparent_date_of_mariage ? formatPL(new Date(data.polishGrandparent.polish_grandparent_date_of_mariage)) : '';
  mapping['polish_grandparent_place_of_mariage'] = data.polishGrandparent.polish_grandparent_place_of_mariage || '';
  mapping['polish_grandparent_date_of_emigration'] = data.polishGrandparent.polish_grandparent_date_of_emigration ? formatPL(new Date(data.polishGrandparent.polish_grandparent_date_of_emigration)) : '';
  mapping['polish_grandparent_date_of_naturalization'] = data.polishGrandparent.polish_grandparent_date_of_naturalization ? formatPL(new Date(data.polishGrandparent.polish_grandparent_date_of_naturalization)) : '';
  mapping['polish_grandparent_spouse_full_name'] = data.polishGrandparent.polish_grandparent_spouse_full_name || '';

  // GREAT-GRANDPARENTS section
  mapping['great_grandfather_full_name'] = data.greatGrandparents.great_grandfather_full_name || '';
  mapping['great_grandfather_date_of_birth'] = data.greatGrandparents.great_grandfather_date_of_birth ? formatPL(new Date(data.greatGrandparents.great_grandfather_date_of_birth)) : '';
  mapping['great_grandfather_place_of_birth'] = data.greatGrandparents.great_grandfather_place_of_birth || '';
  mapping['great_grandfather_date_of_marriage'] = data.greatGrandparents.great_grandfather_date_of_marriage ? formatPL(new Date(data.greatGrandparents.great_grandfather_date_of_marriage)) : '';
  mapping['great_grandfather_place_of_marriage'] = data.greatGrandparents.great_grandfather_place_of_marriage || '';
  // Note: PDF has "emigartion" spelling - keeping exact match
  mapping['great_grandfather_date_of_emigartion'] = data.greatGrandparents.great_grandfather_date_of_emigartion ? formatPL(new Date(data.greatGrandparents.great_grandfather_date_of_emigartion)) : '';
  mapping['great_grandfather_date_of_naturalization'] = data.greatGrandparents.great_grandfather_date_of_naturalization ? formatPL(new Date(data.greatGrandparents.great_grandfather_date_of_naturalization)) : '';
  mapping['great_grandmother_full_name'] = data.greatGrandparents.great_grandmother_full_name || '';

  return mapping;
};

/**
 * Sample mapping for report (showing 8 key field mappings)
 */
export const getSampleMapping = (data: FamilyTreeData): string => {
  const mapping = mapFamilyTreeToPDFFields(data);
  return `Sample PDF Field Mappings:
applicant_full_name → "${mapping['applicant_full_name']}"
applicant_date_of_birth → "${mapping['applicant_date_of_birth']}"
polish_parent_full_name → "${mapping['polish_parent_full_name']}"
polish_grandparent_full_name → "${mapping['polish_grandparent_full_name']}"
great_grandfather_full_name → "${mapping['great_grandfather_full_name']}"
minor_1_full_name → "${mapping['minor_1_full_name']}"
polish_parent_date_of_emigration → "${mapping['polish_parent_date_of_emigration']}"
great_grandfather_date_of_emigartion → "${mapping['great_grandfather_date_of_emigartion']}"`;
};

/**
 * Get all non-empty field mappings for PDF export
 */
export const getPopulatedFields = (data: FamilyTreeData): PDFFieldMapping => {
  const allMappings = mapFamilyTreeToPDFFields(data);
  const populated: PDFFieldMapping = {};
  
  Object.entries(allMappings).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      populated[key] = value;
    }
  });
  
  return populated;
};