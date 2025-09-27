import { OCRResult } from './ocr-service';

export interface ClientDetailsData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthPlace?: string;
  currentAddress?: string;
  nationality?: string;
  passportNumber?: string;
  phoneNumber?: string;
  email?: string;
}

export interface FamilyTreeData {
  // Applicant (Main Person)
  applicantName?: string;
  applicantBirthDate?: string;
  applicantBirthPlace?: string;
  applicantSpouseName?: string;
  applicantMarriageDate?: string;
  applicantMarriagePlace?: string;
  applicantEmigrationDate?: string;
  applicantNaturalizationDate?: string;
  
  // Applicant's Children
  child1Name?: string;
  child1BirthDate?: string;
  child2Name?: string;
  child2BirthDate?: string;
  child3Name?: string;
  child3BirthDate?: string;
  
  // Polish Parent (Bloodline)
  polishParentName?: string;
  polishParentBirthDate?: string;
  polishParentBirthPlace?: string;
  polishParentEmigrationDate?: string;
  polishParentNaturalizationDate?: string;
  parentSpouseName?: string;
  parentSpouseBirthDate?: string;
  parentsMarriageDate?: string;
  
  // Polish Grandparents
  polishGrandfatherName?: string;
  polishGrandfatherBirthDate?: string;
  polishGrandfatherBirthPlace?: string;
  polishGrandmotherName?: string;
  polishGrandmotherBirthDate?: string;
  polishGrandmotherBirthPlace?: string;
  polishGrandparentName?: string;
  polishGrandparentBirthDate?: string;
  polishGrandparentBirthPlace?: string;
  polishGrandparentEmigrationDate?: string;
  polishGrandparentMarriageDate?: string;
  polishGrandparentNaturalizationDate?: string;
  
  // Polish Great Grandparents
  polishGreatGrandfatherName?: string;
  polishGreatGrandfatherBirthDate?: string;
  polishGreatGrandfatherBirthPlace?: string;
  polishGreatGrandmotherName?: string;
  polishGreatGrandmotherBirthDate?: string;
  polishGreatGrandmotherBirthPlace?: string;
  greatGrandfatherName?: string;
  greatGrandfatherBirthDate?: string;
  greatGrandfatherBirthPlace?: string;
  greatGrandfatherEmigrationDate?: string;
  greatGrandfatherNaturalizationDate?: string;
  greatGrandmotherName?: string;
  greatGrandmotherBirthDate?: string;
  greatGrandmotherBirthPlace?: string;
  greatGrandparentsMarriageDate?: string;
  greatGrandparentsMarriagePlace?: string;
}

export interface DocumentMapping {
  clientDetails: ClientDetailsData;
  familyTree: FamilyTreeData;
  documentType: string;
  confidence: number;
  source: 'ocr' | 'manual';
  timestamp: string;
}

export class DocumentDataMapper {
  /**
   * Maps OCR results to form data structures based on document type and PDF templates
   */
  static mapOCRToFormData(ocrResult: OCRResult, documentType: string): DocumentMapping {
    const { structuredData, confidence } = ocrResult;
    
    // Initialize empty data structures
    const clientDetails: ClientDetailsData = {};
    const familyTree: FamilyTreeData = {};
    
    // Map based on document type with Polish naming conventions
    switch (documentType.toLowerCase()) {
      case 'applicant-passport':
      case 'applicant-birth':
        this.mapApplicantDocument(structuredData, clientDetails, familyTree);
        break;
        
      case 'applicant-marriage':
        this.mapMarriageDocument(structuredData, clientDetails, familyTree);
        break;
        
      case 'parents-marriage':
        this.mapParentsMarriageDocument(structuredData, familyTree);
        break;
        
      case 'grandparents-birth':
      case 'grandparents-marriage':
      case 'great-grandparents-birth':
        this.mapGrandparentsDocument(structuredData, familyTree);
        break;
        
      default:
        // Generic mapping for unknown document types
        this.mapGenericDocument(structuredData, clientDetails, familyTree);
        break;
    }
    
    return {
      clientDetails,
      familyTree,
      documentType,
      confidence,
      source: 'ocr',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Maps applicant's personal documents (passport, birth certificate)
   */
  private static mapApplicantDocument(
    data: any, 
    clientDetails: ClientDetailsData, 
    familyTree: FamilyTreeData
  ) {
    // Handle different OCR data structures - check if data exists first
    if (!data) {
      console.log('No data provided to mapApplicantDocument');
      return;
    }
    
    // Handle different possible data structures
    const personalInfo = (data && typeof data === 'object') 
      ? (data.personalInfo || data.extractedData || data) 
      : {};
    const parentInfo = (data && typeof data === 'object') 
      ? (data.parentInfo || data.parents || {}) 
      : {};
    
    // Map to Client Details form
    if (personalInfo.firstName) {
      clientDetails.firstName = this.formatPolishName(personalInfo.firstName);
    }
    if (personalInfo.lastName) {
      clientDetails.lastName = this.formatPolishSurname(personalInfo.lastName);
    }
    clientDetails.birthDate = personalInfo.birthDate;
    clientDetails.birthPlace = personalInfo.birthPlace;
    clientDetails.nationality = personalInfo.nationality;
    clientDetails.passportNumber = personalInfo.passportNumber;
    
    // Map to Family Tree (Applicant section)
    if (personalInfo.firstName && personalInfo.lastName) {
      familyTree.applicantName = `${this.formatPolishName(personalInfo.firstName)} ${this.formatPolishSurname(personalInfo.lastName)}`;
    }
    familyTree.applicantBirthDate = personalInfo.birthDate;
    familyTree.applicantBirthPlace = personalInfo.birthPlace;
    
    // Map maiden name if available - store in applicant name with format
    if (personalInfo.maidenName) {
      const maidenSuffix = ` (maiden: ${this.formatPolishSurname(personalInfo.maidenName)})`;
      if (familyTree.applicantName && !familyTree.applicantName.includes('maiden:')) {
        familyTree.applicantName += maidenSuffix;
      }
    }
    
    // Map parent information to Family Tree
    if (parentInfo.fatherName) {
      familyTree.polishParentName = this.formatFullPolishName(parentInfo.fatherName);
      familyTree.polishParentBirthPlace = parentInfo.fatherBirthPlace;
      // Map father's maiden name if available
      if (parentInfo.fatherMaidenName) {
        // Add maiden name to parent name if available
        const maidenSuffix = ` (maiden: ${this.formatPolishSurname(parentInfo.fatherMaidenName)})`;
        if (!familyTree.polishParentName?.includes('maiden:')) {
          familyTree.polishParentName += maidenSuffix;
        }
      }
    }
    if (parentInfo.motherName) {
      // If no father info, mother becomes the Polish parent
      if (!familyTree.polishParentName) {
        familyTree.polishParentName = this.formatFullPolishName(parentInfo.motherName);
        familyTree.polishParentBirthPlace = parentInfo.motherBirthPlace;
        // Map mother's maiden name if available
        if (parentInfo.motherMaidenName) {
          const maidenSuffix = ` (maiden: ${this.formatPolishSurname(parentInfo.motherMaidenName)})`;
          if (!familyTree.polishParentName?.includes('maiden:')) {
            familyTree.polishParentName += maidenSuffix;
          }
        }
      } else {
        // Mother is the spouse of the Polish parent
        familyTree.parentSpouseName = this.formatFullPolishName(parentInfo.motherName);
        // Map mother's maiden name if available
        if (parentInfo.motherMaidenName) {
          const maidenSuffix = ` (maiden: ${this.formatPolishSurname(parentInfo.motherMaidenName)})`;
          if (familyTree.parentSpouseName && !familyTree.parentSpouseName.includes('maiden:')) {
            familyTree.parentSpouseName += maidenSuffix;
          }
        }
      }
    }
  }
  
  /**
   * Maps marriage certificate data
   */
  private static mapMarriageDocument(
    data: any,
    clientDetails: ClientDetailsData,
    familyTree: FamilyTreeData
  ) {
    const marriageInfo = data.marriageInfo || {};
    const personalInfo = data.personalInfo || {};
    
    // Map marriage details
    if (marriageInfo.spouseName) {
      familyTree.applicantSpouseName = this.formatFullPolishName(marriageInfo.spouseName);
    }
    // Map spouse's maiden name if available
    if (marriageInfo.spouseMaidenName) {
      // Add maiden name to spouse name
      const maidenSuffix = ` (maiden: ${this.formatPolishSurname(marriageInfo.spouseMaidenName)})`;
      if (familyTree.applicantSpouseName && !familyTree.applicantSpouseName.includes('maiden:')) {
        familyTree.applicantSpouseName += maidenSuffix;
      }
    }
    if (marriageInfo.marriageDate) {
      familyTree.parentsMarriageDate = marriageInfo.marriageDate;
    }
    
    // Also map personal info if available
    if (personalInfo.firstName && personalInfo.lastName) {
      clientDetails.firstName = this.formatPolishName(personalInfo.firstName);
      clientDetails.lastName = this.formatPolishSurname(personalInfo.lastName);
      familyTree.applicantName = `${clientDetails.firstName} ${clientDetails.lastName}`;
    }
  }
  
  /**
   * Maps grandparents and great-grandparents data
   */
  private static mapGrandparentsDocument(
    data: any,
    familyTree: FamilyTreeData
  ) {
    const grandparentsInfo = data.grandparentsInfo || data.polishGrandparents || {};
    const greatGrandparentsInfo = data.greatGrandparentsInfo || data.polishGreatGrandparents || {};
    
    // Map Polish Grandparents
    if (grandparentsInfo.grandfatherName) {
      familyTree.polishGrandfatherName = this.formatFullPolishName(grandparentsInfo.grandfatherName);
      if (grandparentsInfo.grandfatherMaidenName) {
        // Add maiden name to grandfather name
        const maidenSuffix = ` (maiden: ${this.formatPolishSurname(grandparentsInfo.grandfatherMaidenName)})`;
        if (!familyTree.polishGrandfatherName?.includes('maiden:')) {
          familyTree.polishGrandfatherName += maidenSuffix;
        }
      }
    }
    if (grandparentsInfo.grandmotherName) {
      familyTree.polishGrandmotherName = this.formatFullPolishName(grandparentsInfo.grandmotherName);
      if (grandparentsInfo.grandmotherMaidenName) {
        // Add maiden name to grandmother name
        const maidenSuffix = ` (maiden: ${this.formatPolishSurname(grandparentsInfo.grandmotherMaidenName)})`;
        if (!familyTree.polishGrandmotherName?.includes('maiden:')) {
          familyTree.polishGrandmotherName += maidenSuffix;
        }
      }
    }
    
    // Map Polish Great Grandparents
    if (greatGrandparentsInfo.greatGrandfatherName) {
      familyTree.polishGreatGrandfatherName = this.formatFullPolishName(greatGrandparentsInfo.greatGrandfatherName);
      if (greatGrandparentsInfo.greatGrandfatherMaidenName) {
        // Add maiden name to great grandfather name
        const maidenSuffix = ` (maiden: ${this.formatPolishSurname(greatGrandparentsInfo.greatGrandfatherMaidenName)})`;
        if (!familyTree.polishGreatGrandfatherName?.includes('maiden:')) {
          familyTree.polishGreatGrandfatherName += maidenSuffix;
        }
      }
    }
    if (greatGrandparentsInfo.greatGrandmotherName) {
      familyTree.polishGreatGrandmotherName = this.formatFullPolishName(greatGrandparentsInfo.greatGrandmotherName);
      if (greatGrandparentsInfo.greatGrandmotherMaidenName) {
        // Add maiden name to great grandmother name
        const maidenSuffix = ` (maiden: ${this.formatPolishSurname(greatGrandparentsInfo.greatGrandmotherMaidenName)})`;
        if (!familyTree.polishGreatGrandmotherName?.includes('maiden:')) {
          familyTree.polishGreatGrandmotherName += maidenSuffix;
        }
      }
    }
  }

  /**
   * Maps parents' marriage certificate
   */
  private static mapParentsMarriageDocument(
    data: any,
    familyTree: FamilyTreeData
  ) {
    const marriageInfo = data.marriageInfo || {};
    const personalInfo = data.personalInfo || {};
    
    // Extract parent names from marriage certificate
    if (marriageInfo.spouseName && personalInfo.firstName) {
      // Assume first person is Polish parent, spouse is the other parent
      familyTree.polishParentName = this.formatFullPolishName(personalInfo.firstName + ' ' + personalInfo.lastName);
      familyTree.parentSpouseName = this.formatFullPolishName(marriageInfo.spouseName);
      familyTree.parentsMarriageDate = marriageInfo.marriageDate;
    }
  }
  
  /**
   * Generic mapping for unknown document types
   */
  private static mapGenericDocument(
    data: any,
    clientDetails: ClientDetailsData,
    familyTree: FamilyTreeData
  ) {
    const personalInfo = data.personalInfo || {};
    const extractedData = data.extractedData || data.personalInfo || data;
    
    // Map available personal information
    if (personalInfo.firstName) {
      clientDetails.firstName = this.formatPolishName(personalInfo.firstName);
    }
    if (personalInfo.lastName) {
      clientDetails.lastName = this.formatPolishSurname(personalInfo.lastName);
    }
    if (personalInfo.firstName && personalInfo.lastName) {
      familyTree.applicantName = `${this.formatPolishName(personalInfo.firstName)} ${this.formatPolishSurname(personalInfo.lastName)}`;
    }
    
    clientDetails.birthDate = personalInfo.birthDate;
    clientDetails.birthPlace = personalInfo.birthPlace;
    familyTree.applicantBirthDate = personalInfo.birthDate;
    familyTree.applicantBirthPlace = personalInfo.birthPlace;
    
    // Try to extract maiden names from any available fields
    if (extractedData.maidenName && familyTree.applicantName && !familyTree.applicantName.includes('maiden:')) {
      const maidenSuffix = ` (maiden: ${this.formatPolishSurname(extractedData.maidenName)})`;
      familyTree.applicantName += maidenSuffix;
    }
    if (extractedData.spouseMaidenName && familyTree.applicantSpouseName && !familyTree.applicantSpouseName.includes('maiden:')) {
      const maidenSuffix = ` (maiden: ${this.formatPolishSurname(extractedData.spouseMaidenName)})`;
      familyTree.applicantSpouseName += maidenSuffix;
    }
    if (extractedData.motherMaidenName && familyTree.parentSpouseName && !familyTree.parentSpouseName.includes('maiden:')) {
      const maidenSuffix = ` (maiden: ${this.formatPolishSurname(extractedData.motherMaidenName)})`;
      familyTree.parentSpouseName += maidenSuffix;
    }
    if (extractedData.fatherMaidenName && familyTree.polishParentName && !familyTree.polishParentName.includes('maiden:')) {
      const maidenSuffix = ` (maiden: ${this.formatPolishSurname(extractedData.fatherMaidenName)})`;
      familyTree.polishParentName += maidenSuffix;
    }
  }
  
  /**
   * Formats Polish first/middle names (capitalize first letter only)
   */
  private static formatPolishName(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Formats Polish surnames (ALL CAPS)
   */
  private static formatPolishSurname(surname: string): string {
    if (!surname) return '';
    return surname.toUpperCase();
  }
  
  /**
   * Formats full Polish name (First Middle SURNAME)
   */
  private static formatFullPolishName(fullName: string): string {
    if (!fullName) return '';
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return this.formatPolishSurname(parts[0]);
    }
    
    // Last part is surname (ALL CAPS), rest are first/middle names
    const surnames = parts.slice(-1);
    const firstNames = parts.slice(0, -1);
    
    const formattedFirstNames = firstNames
      .map(name => this.formatPolishName(name))
      .join(' ');
    const formattedSurname = this.formatPolishSurname(surnames[0]);
    
    return `${formattedFirstNames} ${formattedSurname}`.trim();
  }
  
  /**
   * Merges document data with existing form data, with document data taking precedence
   */
  static mergeWithExistingData<T extends Record<string, any>>(
    documentData: T,
    existingData: T
  ): T {
    const merged = { ...existingData };
    
    // Document data always overrides existing data
    Object.keys(documentData).forEach(key => {
      if (documentData[key] !== undefined && documentData[key] !== '') {
        (merged as any)[key] = documentData[key];
      }
    });
    
    return merged;
  }
  
  /**
   * Validates and processes multiple documents to create comprehensive form data
   */
  static processMultipleDocuments(ocrResults: Array<{ result: OCRResult, type: string }>): {
    clientDetails: ClientDetailsData;
    familyTree: FamilyTreeData;
    processingLog: string[];
  } {
    const processingLog: string[] = [];
    let consolidatedClientDetails: ClientDetailsData = {};
    let consolidatedFamilyTree: FamilyTreeData = {};
    
    // Process each document and merge results
    ocrResults.forEach(({ result, type }, index) => {
      processingLog.push(`Processing document ${index + 1}: ${type}`);
      
      const mapping = this.mapOCRToFormData(result, type);
      
      // Merge with consolidated data (document data takes precedence)
      consolidatedClientDetails = this.mergeWithExistingData(
        mapping.clientDetails,
        consolidatedClientDetails
      );
      
      consolidatedFamilyTree = this.mergeWithExistingData(
        mapping.familyTree,
        consolidatedFamilyTree
      );
      
      processingLog.push(`Confidence: ${mapping.confidence}, Fields populated: ${Object.keys(mapping.clientDetails).length + Object.keys(mapping.familyTree).length}`);
    });
    
    processingLog.push(`Final consolidation complete. Total fields: ${Object.keys(consolidatedClientDetails).length + Object.keys(consolidatedFamilyTree).length}`);
    
    return {
      clientDetails: consolidatedClientDetails,
      familyTree: consolidatedFamilyTree,
      processingLog
    };
  }
}