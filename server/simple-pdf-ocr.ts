import fs from 'fs';
import path from 'path';

export interface PassportData {
  firstName: string;
  lastName: string;
  passportNumber: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  issueDate: string;
  expiryDate: string;
}

export interface OCRResult {
  success: boolean;
  passportData: PassportData;
  extractedText: string;
  confidence: number;
  method: string;
}

export class SimplePDFOCR {
  async extractPassportFromPDF(pdfBuffer: Buffer): Promise<OCRResult> {
    try {
      console.log('🔍 Starting simple PDF text extraction...');
      
      // Convert PDF buffer to text using multiple encoding approaches
      const approaches = [
        { name: 'latin1', text: pdfBuffer.toString('latin1') },
        { name: 'ascii', text: pdfBuffer.toString('ascii') },
        { name: 'utf8', text: pdfBuffer.toString('utf8') }
      ];
      
      let bestResult: PassportData = {
        firstName: '',
        lastName: '',
        passportNumber: '',
        birthDate: '',
        birthPlace: '',
        nationality: '',
        issueDate: '',
        expiryDate: ''
      };
      
      let bestScore = 0;
      let extractedText = '';
      
      for (const approach of approaches) {
        console.log(`📄 Trying ${approach.name} encoding...`);
        console.log(`📄 First 500 chars of ${approach.name}:`, approach.text.substring(0, 500));
        
        const result = this.extractFromText(approach.text);
        const score = this.scoreResult(result);
        
        console.log(`📊 ${approach.name} extraction result:`, result);
        console.log(`📊 ${approach.name} score:`, score);
        
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
          extractedText = approach.text.substring(0, 1000);
        }
      }
      
      console.log('✅ Best extraction result:', bestResult);
      console.log('📊 Score:', bestScore);
      
      return {
        success: bestScore > 0,
        passportData: bestResult,
        extractedText: `Simple PDF OCR: ${bestResult.firstName} ${bestResult.lastName} ${bestResult.passportNumber}`,
        confidence: Math.min(bestScore / 3, 1), // Normalize score to 0-1
        method: 'simple-buffer-extraction'
      };
      
    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      return {
        success: false,
        passportData: {
          firstName: '', lastName: '', passportNumber: '', birthDate: '',
          birthPlace: '', nationality: '', issueDate: '', expiryDate: ''
        },
        extractedText: '',
        confidence: 0,
        method: 'error'
      };
    }
  }
  
  private extractFromText(text: string): PassportData {
    const patterns = {
      // Enhanced passport number patterns
      passportNumber: [
        /(?:PASSPORT\s+(?:NO|NUMBER)|NÚMERO|NUMER|DOKUMENT)\s*:?\s*([A-Z]{1,3}\s*[0-9]{6,9})/gi,
        /([A-Z]{2}\s*[0-9]{7})/g,
        /([A-Z][0-9]{8})/g,
        /([A-Z]{3}[0-9]{6})/g
      ],
      
      // Enhanced name patterns with multiple languages and formats
      surname: [
        /(?:SURNAME|NAZWISKO|APELLIDOS?|ФАМИЛИЯ|Family\s+name|Last\s+name)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,30})/gi,
        /(?:^|\n)\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{3,})\s*(?:\n|$)/gm,
        // Polish passport specific patterns
        /([A-ZĄĆĘŁŃÓŚŹŻ]{3,}(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ]{2,})*)/g,
        // Common European passport patterns
        /([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{4,}(?:\s+[A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{3,})*)/g
      ],
      
      // Enhanced given names patterns
      givenNames: [
        /(?:GIVEN\s+NAMES?|FIRST\s+NAMES?|IMIONA|NOMBRE|ИМЯ|Forenames?|Given\s+name)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,30})/gi,
        /(?:Name|Nome|Christian\s+name)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,30})/gi,
        // Try to find names before dates or other passport elements
        /([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{2,}(?:\s+[A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{2,}){1,2})(?=.*\d{2}[.\/-]\d{2}[.\/-]\d{4})/g
      ],
      
      // Date patterns
      dates: [
        /(\d{2}[.\/-]\d{2}[.\/-]\d{4})/g,
        /(\d{4}[.\/-]\d{2}[.\/-]\d{2})/g
      ],
      
      // Nationality patterns
      nationality: [
        /(?:NATIONALITY|NACIONALIDAD|OBYWATELSTWO)\s*:?\s*([A-Z]{3,})/gi
      ]
    };
    
    const result: PassportData = {
      firstName: '',
      lastName: '',
      passportNumber: '',
      birthDate: '',
      birthPlace: '',
      nationality: '',
      issueDate: '',
      expiryDate: ''
    };
    
    // Extract passport number
    for (const pattern of patterns.passportNumber) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.passportNumber = match[1].replace(/\s/g, '').trim();
        console.log('🔍 Found passport number:', result.passportNumber);
        break;
      }
    }
    
    // Extract surname - try all patterns and score them
    const surnameMatches = [];
    for (const pattern of patterns.surname) {
      const matches = [...text.matchAll(pattern)];
      surnameMatches.push(...matches.map(m => m[1] || m[0]));
    }
    
    if (surnameMatches.length > 0) {
      // Filter and score potential surnames
      const validSurnames = surnameMatches
        .filter(name => name && name.length >= 2 && name.length <= 30)
        .filter(name => !['PDF', 'TYPE', 'CODE', 'PASSPORT', 'DATE', 'PLACE', 'DOCUMENT', 'PAGE'].includes(name.toUpperCase()))
        .map(name => name.trim().toUpperCase());
      
      if (validSurnames.length > 0) {
        result.lastName = validSurnames[0];
        console.log('🔍 Found surname:', result.lastName);
      }
    }
    
    // Extract given names - try all patterns
    const givenNameMatches = [];
    for (const pattern of patterns.givenNames) {
      const matches = [...text.matchAll(pattern)];
      givenNameMatches.push(...matches.map(m => m[1] || m[0]));
    }
    
    if (givenNameMatches.length > 0) {
      // Filter and score potential given names
      const validGivenNames = givenNameMatches
        .filter(name => name && name.length >= 2 && name.length <= 30)
        .filter(name => !['PDF', 'TYPE', 'CODE', 'PASSPORT', 'DATE', 'PLACE', 'DOCUMENT', 'PAGE'].includes(name.toUpperCase()))
        .filter(name => name !== result.lastName) // Don't duplicate surname
        .map(name => name.trim().toUpperCase());
      
      if (validGivenNames.length > 0) {
        result.firstName = validGivenNames[0];
        console.log('🔍 Found given names:', result.firstName);
      }
    }
    
    // If still no names found, try a more aggressive extraction
    if (!result.firstName && !result.lastName) {
      console.log('🔍 Trying aggressive name extraction...');
      const allCapsWords = text.match(/[A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{3,}/g) || [];
      const potentialNames = allCapsWords
        .filter(word => word.length >= 3 && word.length <= 20)
        .filter(word => !['PDF', 'TYPE', 'CODE', 'PASSPORT', 'DATE', 'PLACE', 'DOCUMENT', 'PAGE', 'REPUBLIC', 'POLAND', 'BIRTH', 'ISSUE', 'EXPIRY'].includes(word))
        .slice(0, 10);
      
      console.log('🔍 Potential names found:', potentialNames);
      
      if (potentialNames.length >= 2) {
        result.firstName = potentialNames[0];
        result.lastName = potentialNames[1];
        console.log('🔍 Using aggressive extraction - First:', result.firstName, 'Last:', result.lastName);
      } else if (potentialNames.length === 1) {
        result.lastName = potentialNames[0];
        console.log('🔍 Using aggressive extraction - Last name only:', result.lastName);
      }
    }
    
    // Extract nationality
    for (const pattern of patterns.nationality) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.nationality = match[1].trim().toUpperCase();
        console.log('🔍 Found nationality:', result.nationality);
        break;
      }
    }
    
    // Extract dates (birth, issue, expiry)
    const dateMatches = [];
    for (const pattern of patterns.dates) {
      const matches = [...text.matchAll(pattern)];
      dateMatches.push(...matches.map(m => m[1]));
    }
    
    if (dateMatches.length > 0) {
      result.birthDate = dateMatches[0] || '';
      result.issueDate = dateMatches[1] || '';
      result.expiryDate = dateMatches[2] || '';
    }
    
    return result;
  }
  
  private scoreResult(result: PassportData): number {
    let score = 0;
    
    if (result.firstName) score += 2;
    if (result.lastName) score += 2;
    if (result.passportNumber) score += 3; // Passport number is most important
    if (result.nationality) score += 1;
    if (result.birthDate) score += 1; // Dates are valuable too
    if (result.issueDate) score += 0.5;
    if (result.expiryDate) score += 0.5;
    
    return score;
  }
}