import { OCRResult } from './ocr-service';

export interface AutoFillData {
  familyTreeData: {
    applicant: {
      id: string;
      firstName: string;
      lastName: string;
      maidenName?: string;
      birthDate: string;
      birthPlace: string;
      deathDate?: string;
      deathPlace?: string;
      marriageDate?: string;
      marriagePlace?: string;
      emigrationDate?: string;
      emigrationPlace?: string;
      naturalizationDate?: string;
      naturalizationPlace?: string;
    };
    parents?: {
      father?: {
        id: string;
        firstName: string;
        lastName: string;
        birthPlace?: string;
      };
      mother?: {
        id: string;
        firstName: string;
        lastName: string;
        maidenName?: string;
        birthPlace?: string;
      };
    };
    spouse?: {
      id: string;
      firstName: string;
      lastName: string;
      maidenName?: string;
      marriageDate?: string;
      marriagePlace?: string;
    };
  };
  clientDetailsData: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    birthPlace?: string;
    currentAddress?: string;
    nationality?: string;
    passportNumber?: string;
    phoneNumber?: string;
    email?: string;
  };
}

export class AutoFillService {
  /**
   * Converts OCR results into structured data for auto-filling forms
   */
  static processOCRForAutoFill(ocrResult: OCRResult): AutoFillData {
    const { structuredData } = ocrResult;
    
    // Generate unique IDs for family members
    const applicantId = `person-${Date.now()}`;
    const fatherId = `father-${Date.now() + 1}`;
    const motherId = `mother-${Date.now() + 2}`;
    const spouseId = `spouse-${Date.now() + 3}`;

    // Extract applicant data (main person from the document)
    const applicant = {
      id: applicantId,
      firstName: structuredData.personalInfo?.firstNames || '',
      lastName: structuredData.personalInfo?.lastName || '',
      maidenName: undefined,
      birthDate: structuredData.personalInfo?.birthDate || '',
      birthPlace: structuredData.personalInfo?.birthPlace || '',
      deathDate: undefined,
      deathPlace: undefined,
      marriageDate: structuredData.marriageInfo?.marriageDate,
      marriagePlace: structuredData.marriageInfo?.marriagePlace,
      emigrationDate: undefined,
      emigrationPlace: undefined,
      naturalizationDate: undefined,
      naturalizationPlace: undefined,
    };

    // Build family tree data
    const familyTreeData: any = {
      applicant,
      parents: undefined,
      spouse: undefined,
    };

    // Add parent information if available
    if (structuredData.parentInfo) {
      familyTreeData.parents = {};
      
      if (structuredData.parentInfo.fatherName) {
        const fatherNames = AutoFillService.parseFullName(structuredData.parentInfo.fatherName);
        familyTreeData.parents.father = {
          id: fatherId,
          firstName: fatherNames.firstName,
          lastName: fatherNames.lastName,
          birthPlace: structuredData.parentInfo.fatherBirthPlace,
        };
      }
      
      if (structuredData.parentInfo.motherName) {
        const motherNames = AutoFillService.parseFullName(structuredData.parentInfo.motherName);
        familyTreeData.parents.mother = {
          id: motherId,
          firstName: motherNames.firstName,
          lastName: motherNames.lastName,
          maidenName: motherNames.maidenName,
          birthPlace: structuredData.parentInfo.motherBirthPlace,
        };
      }
    }

    // Add spouse information if available
    if (structuredData.marriageInfo?.spouseName) {
      const spouseNames = AutoFillService.parseFullName(structuredData.marriageInfo.spouseName);
      familyTreeData.spouse = {
        id: spouseId,
        firstName: spouseNames.firstName,
        lastName: spouseNames.lastName,
        maidenName: spouseNames.maidenName,
        marriageDate: structuredData.marriageInfo.marriageDate,
        marriagePlace: structuredData.marriageInfo.marriagePlace,
      };
    }

    // Build client details data
    const clientDetailsData = {
      firstName: structuredData.personalInfo?.firstNames,
      lastName: structuredData.personalInfo?.lastName,
      birthDate: structuredData.personalInfo?.birthDate,
      birthPlace: structuredData.personalInfo?.birthPlace,
      currentAddress: undefined,
      nationality: structuredData.personalInfo?.nationality,
      passportNumber: structuredData.personalInfo?.passportNumber,
      phoneNumber: undefined,
      email: undefined,
    };

    return {
      familyTreeData,
      clientDetailsData,
    };
  }

  /**
   * Parse a full name into first, last, and maiden names
   */
  private static parseFullName(fullName: string): { firstName: string; lastName: string; maidenName?: string } {
    const parts = fullName.trim().split(/\s+/);
    
    // Check for maiden name pattern (née or born)
    const maidenMatch = fullName.match(/(?:née|born|z domu)\s+([A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/i);
    const maidenName = maidenMatch ? maidenMatch[1] : undefined;
    
    // Remove maiden name from parts
    if (maidenMatch) {
      fullName = fullName.replace(maidenMatch[0], '').trim();
      const cleanParts = fullName.trim().split(/\s+/);
      return {
        firstName: cleanParts.slice(0, -1).join(' ') || '',
        lastName: cleanParts[cleanParts.length - 1] || '',
        maidenName,
      };
    }
    
    // Standard name parsing
    if (parts.length === 1) {
      return { firstName: '', lastName: parts[0] };
    } else if (parts.length === 2) {
      return { firstName: parts[0], lastName: parts[1] };
    } else {
      return {
        firstName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1],
      };
    }
  }

  /**
   * Validate the extracted data before auto-filling
   */
  static validateAutoFillData(data: AutoFillData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate dates
    const dateFields = [
      data.familyTreeData.applicant.birthDate,
      data.familyTreeData.applicant.marriageDate,
      data.clientDetailsData.birthDate,
    ];
    
    dateFields.forEach(date => {
      if (date && !this.isValidDate(date)) {
        errors.push(`Invalid date format: ${date}`);
      }
    });
    
    // Validate names
    if (!data.familyTreeData.applicant.firstName && !data.familyTreeData.applicant.lastName) {
      errors.push('No name information extracted');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a date string is valid
   */
  private static isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

export default AutoFillService;
