import OpenAI from "openai";
import { GrokAIService } from './grok-ai-service';
import type { DataEntry } from '@shared/schema';

export interface OCRResult {
  provider: 'openai' | 'claude' | 'grok';
  confidence: number;
  extractedData: Partial<DataEntry>;
  rawText?: string;
  fieldMappings: Record<string, any>;
  errors?: string[];
}

export interface DocumentAnalysisResult {
  documentType: 'passport' | 'birth_certificate' | 'marriage_certificate' | 'id_card' | 'other';
  extractedFields: Partial<DataEntry>;
  confidence: number;
  primaryProvider: 'openai' | 'claude' | 'grok';
  backupResults?: OCRResult[];
  recommendations?: string[];
}

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class DataPopulationService {
  constructor() {
    // Services are initialized as needed
  }

  /**
   * Process document with triple-AI verification for maximum accuracy
   */
  async processDocumentWithTripleAI(
    imageBase64: string,
    documentType?: string,
    preferredProvider?: 'openai' | 'claude' | 'grok'
  ): Promise<DocumentAnalysisResult> {
    const results: OCRResult[] = [];
    const errors: string[] = [];

    try {
      // Primary extraction with preferred provider (default: OpenAI for vision)
      const primaryProvider = preferredProvider || 'openai';
      const primaryResult = await this.extractWithProvider(imageBase64, documentType, primaryProvider);
      results.push(primaryResult);

      // Backup extractions with other providers for verification
      const backupProviders = (['openai', 'claude', 'grok'] as const).filter(p => p !== primaryProvider);
      
      for (const provider of backupProviders) {
        try {
          const backupResult = await this.extractWithProvider(imageBase64, documentType, provider);
          results.push(backupResult);
        } catch (error) {
          console.warn(`Backup OCR with ${provider} failed:`, error);
          errors.push(`${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Cross-validate and merge results
      const finalResult = await this.crossValidateResults(results);
      
      return {
        documentType: this.detectDocumentType(finalResult.extractedData),
        extractedFields: finalResult.extractedData,
        confidence: finalResult.confidence,
        primaryProvider,
        backupResults: results.slice(1), // Exclude primary result
        recommendations: this.generateRecommendations(results)
      };

    } catch (error) {
      console.error('Triple-AI OCR processing failed:', error);
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract data using specific AI provider
   */
  private async extractWithProvider(
    imageBase64: string,
    documentType: string = 'unknown',
    provider: 'openai' | 'claude' | 'grok'
  ): Promise<OCRResult> {
    const prompt = this.buildExtractionPrompt(documentType);

    try {
      let response: string;
      let confidence = 0.8; // Default confidence

      switch (provider) {
        case 'openai':
          response = await this.analyzeWithOpenAI(imageBase64, prompt);
          confidence = 0.9; // OpenAI generally high confidence for vision
          break;
        
        case 'claude':
          response = await this.analyzeWithClaude(imageBase64, prompt);
          confidence = 0.85; // Claude good for document analysis
          break;
        
        case 'grok':
          response = await this.analyzeWithGrok(imageBase64, prompt);
          confidence = 0.8; // Grok newer, slightly lower confidence
          break;
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const extractedData = this.parseAIResponse(response);
      
      return {
        provider,
        confidence,
        extractedData,
        rawText: response,
        fieldMappings: extractedData,
        errors: []
      };

    } catch (error) {
      console.error(`OCR extraction failed for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Build comprehensive extraction prompt for AI analysis
   */
  private buildExtractionPrompt(documentType: string): string {
    return `
Analyze this document image and extract ALL visible personal information. Return data as JSON with these exact field names:

PERSONAL INFORMATION:
- applicantFirstName (first name/given names)
- applicantLastName (surname/family name)
- applicantBirthName (maiden name if different)
- applicantDateOfBirth (format: DD-MM-YYYY)
- applicantPlaceOfBirth (city, country)
- applicantGender (male/female)
- applicantDocumentType (passport/id/license)
- applicantDocumentNumber (document number)
- applicantNationality (nationality/citizenship)

ADDRESS INFORMATION:
- applicantCountry
- applicantStreet
- applicantHouseNumber
- applicantApartmentNumber
- applicantPostalCode
- applicantCity
- applicantPhone
- applicantEmail

FAMILY INFORMATION (if visible):
- fatherFirstName
- fatherLastName
- motherFirstName
- motherLastName
- motherBirthName
- spouseFirstName
- spouseLastName

DOCUMENT DETAILS:
- eventType (birth/marriage/death if applicable)
- eventDate
- eventPlace
- eventCountry

SPECIAL INSTRUCTIONS:
- For Polish documents, preserve Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- Convert all names to UPPERCASE
- Use DD-MM-YYYY format for dates
- If field not visible, omit from JSON
- For passport: focus on personal data page
- For certificates: extract all family member names

Return ONLY valid JSON with extracted fields.
    `.trim();
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIResponse(response: string): Partial<DataEntry> {
    try {
      // Handle markdown-wrapped JSON
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : response;
      
      const parsed = JSON.parse(jsonText);
      
      // Convert names to uppercase and clean data
      const cleanedData: Partial<DataEntry> = {};
      
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string') {
          const cleanValue = value.trim();
          if (cleanValue) {
            // Convert names to uppercase
            if (key.toLowerCase().includes('name') || key.toLowerCase().includes('surname')) {
              cleanedData[key as keyof DataEntry] = cleanValue.toUpperCase() as any;
            } else {
              cleanedData[key as keyof DataEntry] = cleanValue as any;
            }
          }
        }
      }
      
      return cleanedData;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {};
    }
  }

  /**
   * Cross-validate results from multiple AI providers
   */
  private async crossValidateResults(results: OCRResult[]): Promise<OCRResult> {
    if (results.length === 0) {
      throw new Error('No OCR results to validate');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Merge results with confidence weighting
    const mergedData: Partial<DataEntry> = {};
    const fieldCounts: Record<string, Record<string, number>> = {};

    // Count occurrences of each field value across providers
    for (const result of results) {
      for (const [field, value] of Object.entries(result.extractedData)) {
        if (value && typeof value === 'string') {
          if (!fieldCounts[field]) {
            fieldCounts[field] = {};
          }
          if (!fieldCounts[field][value]) {
            fieldCounts[field][value] = 0;
          }
          fieldCounts[field][value] += result.confidence;
        }
      }
    }

    // Select most confident value for each field
    for (const [field, valueCounts] of Object.entries(fieldCounts)) {
      const bestValue = Object.entries(valueCounts).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0];
      
      mergedData[field as keyof DataEntry] = bestValue as any;
    }

    // Calculate overall confidence
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    return {
      provider: results[0].provider, // Use primary provider
      confidence: avgConfidence,
      extractedData: mergedData,
      fieldMappings: mergedData,
      errors: results.flatMap(r => r.errors || [])
    };
  }

  /**
   * Detect document type from extracted data
   */
  private detectDocumentType(data: Partial<DataEntry>): DocumentAnalysisResult['documentType'] {
    const hasPassportNumber = !!data.applicantDocumentNumber && data.applicantDocumentType?.toLowerCase().includes('passport');
    const hasBirthInfo = !!data.applicantDateOfBirth && !!data.applicantPlaceOfBirth;
    const hasMarriageInfo = !!data.marriageDate || !!data.marriagePlace;
    const hasIDInfo = data.applicantDocumentType?.toLowerCase().includes('id') || data.applicantDocumentType?.toLowerCase().includes('dowód');

    if (hasPassportNumber) return 'passport';
    if (hasIDInfo) return 'id_card';
    if (hasMarriageInfo) return 'marriage_certificate';
    if (hasBirthInfo) return 'birth_certificate';
    
    return 'other';
  }

  /**
   * Generate recommendations based on multiple AI results
   */
  private generateRecommendations(results: OCRResult[]): string[] {
    const recommendations: string[] = [];
    
    if (results.length > 1) {
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      
      if (avgConfidence < 0.7) {
        recommendations.push('Document quality is low - consider uploading a clearer image');
      }
      
      if (avgConfidence > 0.9) {
        recommendations.push('High confidence extraction - data appears reliable');
      }
      
      // Check for conflicting data between providers
      const conflicts = this.findDataConflicts(results);
      if (conflicts.length > 0) {
        recommendations.push(`Please verify: ${conflicts.join(', ')}`);
      }
    }
    
    return recommendations;
  }

  /**
   * Find conflicting data between AI providers
   */
  private findDataConflicts(results: OCRResult[]): string[] {
    const conflicts: string[] = [];
    const fieldsToCheck = ['applicantFirstName', 'applicantLastName', 'applicantDateOfBirth', 'applicantDocumentNumber'];
    
    for (const field of fieldsToCheck) {
      const values = results
        .map(r => r.extractedData[field as keyof DataEntry])
        .filter(v => v && typeof v === 'string');
      
      const uniqueValues = [...new Set(values)];
      if (uniqueValues.length > 1) {
        conflicts.push(field.replace('applicant', '').replace(/([A-Z])/g, ' $1').toLowerCase().trim());
      }
    }
    
    return conflicts;
  }

  /**
   * Intelligent field mapping for Polish documents
   */
  async mapPolishDocumentFields(
    extractedData: Partial<DataEntry>,
    documentType: string
  ): Promise<Partial<DataEntry>> {
    const mappedData = { ...extractedData };

    // Apply Polish-specific transformations
    if (mappedData.applicantFirstName) {
      mappedData.applicantFirstName = this.normalizePolishName(mappedData.applicantFirstName);
    }
    
    if (mappedData.applicantLastName) {
      mappedData.applicantLastName = this.normalizePolishName(mappedData.applicantLastName);
    }

    // Handle Polish date formats
    if (mappedData.applicantDateOfBirth) {
      mappedData.applicantDateOfBirth = this.normalizePolishDate(mappedData.applicantDateOfBirth);
    }

    return mappedData;
  }

  /**
   * Normalize Polish names and characters
   */
  private normalizePolishName(name: string): string {
    return name
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' '); // Normalize spaces
  }

  /**
   * Normalize Polish date formats
   */
  private normalizePolishDate(date: string): string {
    // Convert various date formats to DD-MM-YYYY
    const cleaned = date.replace(/[^\d.-]/g, '');
    
    // Handle DD.MM.YYYY or DD-MM-YYYY
    if (/^\d{2}[.-]\d{2}[.-]\d{4}$/.test(cleaned)) {
      return cleaned.replace(/\./g, '-');
    }
    
    // Handle YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      const [year, month, day] = cleaned.split('-');
      return `${day}-${month}-${year}`;
    }
    
    return cleaned;
  }

  /**
   * Analyze image with OpenAI Vision API
   */
  private async analyzeWithOpenAI(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ],
          },
        ],
        max_tokens: 1500,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI vision analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze image with Claude (placeholder - would need Anthropic client)
   */
  private async analyzeWithClaude(imageBase64: string, prompt: string): Promise<string> {
    // For now, fallback to OpenAI until Claude vision is properly integrated
    console.log('Claude analysis not yet implemented, falling back to OpenAI');
    return this.analyzeWithOpenAI(imageBase64, prompt);
  }

  /**
   * Analyze image with Grok Vision API
   */
  private async analyzeWithGrok(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await GrokAIService.analyzeDocument(imageBase64, 'auto-detect');
      return response.message;
    } catch (error) {
      console.error('Grok vision analysis error:', error);
      throw error;
    }
  }
}