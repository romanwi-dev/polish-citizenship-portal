import OpenAI from "openai";
import { z } from "zod";

// Document validation schemas
export const DocumentValidationSchema = z.object({
  isValid: z.boolean(),
  documentType: z.string(),
  confidence: z.number().min(0).max(100),
  issues: z.array(z.object({
    type: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    field: z.string().optional()
  })),
  extractedData: z.record(z.any()).optional(),
  suggestions: z.array(z.string()).optional(),
  language: z.string().optional(),
  quality: z.object({
    clarity: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
    authenticity: z.number().min(0).max(100)
  }).optional()
});

export type DocumentValidation = z.infer<typeof DocumentValidationSchema>;

export class DocumentValidationService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async validateDocument(
    imageBase64: string,
    documentType: string,
    metadata?: { fileName?: string; fileSize?: number }
  ): Promise<DocumentValidation> {
    try {
      // Create a specific prompt based on document type
      const prompt = this.createValidationPrompt(documentType, metadata);

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert document validator specializing in Polish citizenship documents. 
                     Analyze documents for authenticity, completeness, and compliance with Polish citizenship requirements.
                     Always respond with valid JSON format matching the specified schema.`
          },
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
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and parse the response
      const validation = DocumentValidationSchema.parse({
        isValid: result.isValid ?? false,
        documentType: result.documentType || documentType,
        confidence: result.confidence ?? 0,
        issues: result.issues || [],
        extractedData: result.extractedData || {},
        suggestions: result.suggestions || [],
        language: result.language,
        quality: result.quality || {
          clarity: 0,
          completeness: 0,
          authenticity: 0
        }
      });

      return validation;
    } catch (error) {
      console.error("Document validation error:", error);
      
      // Return a default validation result on error
      return {
        isValid: false,
        documentType: documentType,
        confidence: 0,
        issues: [{
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to validate document'
        }],
        quality: {
          clarity: 0,
          completeness: 0,
          authenticity: 0
        }
      };
    }
  }

  private createValidationPrompt(documentType: string, metadata?: any): string {
    const basePrompt = `Analyze this document image and validate it for Polish citizenship application purposes.
    
    Document Type: ${documentType}
    ${metadata?.fileName ? `File Name: ${metadata.fileName}` : ''}
    
    Please analyze and return a JSON response with the following structure:
    {
      "isValid": boolean (whether the document meets requirements),
      "documentType": string (detected document type),
      "confidence": number (0-100, your confidence in the validation),
      "issues": [
        {
          "type": "error" | "warning" | "info",
          "message": string (description of the issue),
          "field": string (optional, specific field with issue)
        }
      ],
      "extractedData": {
        // Key data extracted from the document (names, dates, numbers, etc.)
      },
      "suggestions": [string] (list of improvement suggestions),
      "language": string (detected language of the document),
      "quality": {
        "clarity": number (0-100, document clarity/readability),
        "completeness": number (0-100, how complete the document is),
        "authenticity": number (0-100, likelihood of authenticity)
      }
    }`;

    // Add specific validation rules based on document type
    const typeSpecificPrompts: Record<string, string> = {
      'birth-certificate': `
        Focus on:
        - Verify all required fields are present (name, date of birth, place of birth, parents' names)
        - Check for official seals and signatures
        - Validate date formats and consistency
        - Ensure the document is a certified copy if not original
        - Extract key genealogical data for citizenship verification`,
      
      'passport': `
        Focus on:
        - Check passport validity and expiration date
        - Verify photo page completeness
        - Extract personal identification data
        - Check for any alterations or damage
        - Validate passport number format`,
      
      'marriage-certificate': `
        Focus on:
        - Verify both parties' names and details
        - Check marriage date and location
        - Validate official seals and signatures
        - Ensure document is properly certified
        - Extract relevant data for citizenship chain`,
      
      'citizenship-proof': `
        Focus on:
        - Verify Polish citizenship indicators
        - Check document authenticity markers
        - Validate issuance authority
        - Extract citizenship confirmation details
        - Verify document date and validity period`,
      
      'identity-document': `
        Focus on:
        - Verify photo matches document type
        - Check personal data completeness
        - Validate document number formats
        - Check expiration dates
        - Extract all identity information`
    };

    return basePrompt + (typeSpecificPrompts[documentType] || '');
  }

  async performQuickValidation(fileName: string, fileSize: number): Promise<{
    valid: boolean;
    message: string;
  }> {
    // Quick validation without AI for basic checks
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    if (!validExtensions.includes(extension)) {
      return {
        valid: false,
        message: `Invalid file type. Accepted formats: ${validExtensions.join(', ')}`
      };
    }
    
    if (fileSize > maxSize) {
      return {
        valid: false,
        message: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`
      };
    }
    
    return {
      valid: true,
      message: 'File format and size are valid'
    };
  }
}