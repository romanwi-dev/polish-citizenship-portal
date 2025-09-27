import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type SupportedLanguage = 'polish' | 'english' | 'portuguese' | 'spanish' | 'french' | 'german' | 'russian' | 'hebrew' | 'auto';

export interface TranslationRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: Exclude<SupportedLanguage, 'auto'>;
  documentType?: 'birth_certificate' | 'marriage_certificate' | 'passport' | 'legal_document' | 'general';
  preserveFormatting?: boolean;
  improvementFeedback?: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  documentType?: string;
  legalTerms?: Array<{
    original: string;
    translation: string;
    explanation: string;
  }>;
  suggestions?: string[];
  qualityPreview?: TranslationQualityPreview;
}

export interface TranslationQualityPreview {
  overallScore: number; // 0-100
  accuracy: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  fluency: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  terminology: {
    score: number;
    legalTermsHandled: number;
    totalLegalTerms: number;
    inconsistencies: Array<{
      term: string;
      translations: string[];
      suggestion: string;
    }>;
  };
  formatting: {
    score: number;
    preservedElements: string[];
    issues: string[];
  };
  risks: Array<{
    type: 'critical' | 'warning' | 'info';
    description: string;
    recommendation: string;
  }>;
  readabilityScore: number;
  recommendedActions: string[];
}

export class TranslationService {
  async translateDocument(request: TranslationRequest): Promise<TranslationResult> {
    try {
      const { text, sourceLanguage, targetLanguage, documentType, preserveFormatting, improvementFeedback } = request;

      // Determine source language if auto-detect
      let detectedSourceLanguage = sourceLanguage;
      if (sourceLanguage === 'auto') {
        detectedSourceLanguage = await this.detectLanguage(text);
      }

      // Skip translation if source and target are the same
      if (detectedSourceLanguage === targetLanguage) {
        return {
          originalText: text,
          translatedText: text,
          sourceLanguage: detectedSourceLanguage,
          targetLanguage: targetLanguage,
          confidence: 1.0,
          suggestions: ['No translation needed - source and target languages are the same']
        };
      }

      const systemPrompt = this.buildSystemPrompt(detectedSourceLanguage, targetLanguage, documentType, preserveFormatting);

      let userPrompt = `Please translate the following text:\n\n${text}`;
      
      if (improvementFeedback) {
        userPrompt += `\n\nPrevious translation feedback: ${improvementFeedback}\n\nPlease address these issues in the improved translation.`;
      }

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: userPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      // Parse the response - expect JSON format
      let result;
      try {
        // Clean and extract JSON from response
        let jsonText = content.text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }

        // Find JSON boundaries
        const startIndex = jsonText.indexOf('{');
        const lastIndex = jsonText.lastIndexOf('}');
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          jsonText = jsonText.substring(startIndex, lastIndex + 1);
        }

        result = JSON.parse(jsonText);
      } catch (parseError) {
        // Fallback: treat entire response as translation
        result = {
          translatedText: content.text,
          confidence: 0.8,
          legalTerms: [],
          suggestions: ['Translation completed but structured data not available']
        };
      }

      // Generate quality preview
      const qualityPreview = await this.generateQualityPreview(
        text,
        result.translatedText || content.text,
        detectedSourceLanguage,
        targetLanguage,
        documentType
      );

      return {
        originalText: text,
        translatedText: result.translatedText || content.text,
        sourceLanguage: detectedSourceLanguage,
        targetLanguage: targetLanguage,
        confidence: result.confidence || 0.8,
        documentType: documentType,
        legalTerms: result.legalTerms || [],
        suggestions: result.suggestions || [],
        qualityPreview: qualityPreview
      };

    } catch (error) {
      console.error("Translation failed:", error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateQualityPreview(
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string,
    documentType?: string
  ): Promise<TranslationQualityPreview> {
    try {
      const qualityPrompt = `You are an expert translation quality assessor. Analyze the following translation and provide a comprehensive quality assessment.

Original Text (${sourceLanguage}):
${originalText}

Translation (${targetLanguage}):
${translatedText}

Document Type: ${documentType || 'general'}

Please provide a detailed quality assessment in the following JSON format:
{
  "overallScore": 85,
  "accuracy": {
    "score": 90,
    "issues": ["Minor terminology inconsistency in legal terms"],
    "strengths": ["Accurate meaning preservation", "Proper context understanding"]
  },
  "fluency": {
    "score": 88,
    "issues": ["Slightly awkward phrasing in paragraph 2"],
    "suggestions": ["Consider rephrasing for better flow", "Use more natural target language expressions"]
  },
  "terminology": {
    "score": 85,
    "legalTermsHandled": 12,
    "totalLegalTerms": 15,
    "inconsistencies": [
      {
        "term": "obywatelstwo",
        "translations": ["citizenship", "nationality"],
        "suggestion": "Use 'citizenship' consistently for legal documents"
      }
    ]
  },
  "formatting": {
    "score": 95,
    "preservedElements": ["dates", "proper names", "document structure"],
    "issues": ["Minor spacing issue after comma"]
  },
  "risks": [
    {
      "type": "warning",
      "description": "Some legal terminology may require official verification",
      "recommendation": "Have certified translator review legal terms before official submission"
    }
  ],
  "readabilityScore": 82,
  "recommendedActions": [
    "Review legal terminology consistency",
    "Consider professional proofreading for official use",
    "Verify proper names and dates accuracy"
  ]
}

Focus on accuracy, fluency, terminology consistency, formatting preservation, and potential risks for official document use.`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2048,
        system: 'You are a professional translation quality assessor. Provide detailed, objective analysis in valid JSON format only.',
        messages: [{
          role: "user",
          content: qualityPrompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from AI');
      }

      // Parse the quality assessment
      let qualityResult;
      try {
        let jsonText = content.text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }

        const startIndex = jsonText.indexOf('{');
        const lastIndex = jsonText.lastIndexOf('}');
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          jsonText = jsonText.substring(startIndex, lastIndex + 1);
        }

        qualityResult = JSON.parse(jsonText);
      } catch (parseError) {
        // Fallback quality assessment
        qualityResult = {
          overallScore: 75,
          accuracy: { score: 75, issues: [], strengths: ["Translation completed"] },
          fluency: { score: 75, issues: [], suggestions: [] },
          terminology: { score: 75, legalTermsHandled: 0, totalLegalTerms: 0, inconsistencies: [] },
          formatting: { score: 80, preservedElements: [], issues: [] },
          risks: [{
            type: 'info',
            description: 'Quality assessment not available',
            recommendation: 'Manual review recommended'
          }],
          readabilityScore: 75,
          recommendedActions: ['Manual quality review recommended']
        };
      }

      return qualityResult;

    } catch (error) {
      console.error("Quality preview generation failed:", error);
      // Return basic fallback assessment
      return {
        overallScore: 60,
        accuracy: { score: 60, issues: ["Quality assessment failed"], strengths: [] },
        fluency: { score: 60, issues: [], suggestions: [] },
        terminology: { score: 60, legalTermsHandled: 0, totalLegalTerms: 0, inconsistencies: [] },
        formatting: { score: 60, preservedElements: [], issues: [] },
        risks: [{
          type: 'warning',
          description: 'Automatic quality assessment failed',
          recommendation: 'Professional review strongly recommended'
        }],
        readabilityScore: 60,
        recommendedActions: ['Professional translation review required']
      };
    }
  }

  private async detectLanguage(text: string): Promise<Exclude<SupportedLanguage, 'auto'>> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 100,
        system: 'You are a language detection expert. Determine the language of the text. Respond with only one word from: "polish", "english", "portuguese", "spanish", "french", "german", "russian", or "hebrew".',
        messages: [{
          role: "user",
          content: `Detect the language of this text: "${text.substring(0, 200)}"`
        }]
      });

      const content = response.content[0];
      const detectedLang = content.type === 'text' ? content.text.trim().toLowerCase() : 'english';
      
      const supportedLanguages: Array<Exclude<SupportedLanguage, 'auto'>> = [
        'polish', 'english', 'portuguese', 'spanish', 'french', 'german', 'russian', 'hebrew'
      ];
      
      if (supportedLanguages.includes(detectedLang as any)) {
        return detectedLang as Exclude<SupportedLanguage, 'auto'>;
      }
      
      // Default to English if unclear
      return 'english';
    } catch (error) {
      console.error("Language detection failed:", error);
      // Default to English if detection fails
      return 'english';
    }
  }

  private buildSystemPrompt(sourceLanguage: string, targetLanguage: string, documentType?: string, preserveFormatting?: boolean): string {
    const langMap = {
      polish: 'Polish',
      english: 'English',
      portuguese: 'Portuguese',
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
      russian: 'Russian',
      hebrew: 'Hebrew'
    };

    const sourceLang = langMap[sourceLanguage as keyof typeof langMap] || 'English';
    const targetLang = langMap[targetLanguage as keyof typeof langMap] || 'English';

    let prompt = `You are an expert legal translator specializing in Polish citizenship and immigration documents. 

Your task is to translate ${sourceLang} text to ${targetLang} with the following requirements:

1. LEGAL ACCURACY: Maintain precise legal terminology and concepts
2. OFFICIAL TERMINOLOGY: Use official government and legal language
3. CULTURAL CONTEXT: Adapt cultural references appropriately
4. NAMES & PLACES: Preserve proper names, places, and dates exactly
5. FORMATTING: ${preserveFormatting ? 'Maintain original formatting, line breaks, and structure' : 'Focus on content accuracy over formatting'}

`;

    if (documentType) {
      const documentGuidance = {
        birth_certificate: 'This is a birth certificate. Pay special attention to: personal details, parent information, birth location, dates, and official certifications.',
        marriage_certificate: 'This is a marriage certificate. Focus on: spouse details, marriage date and location, witness information, and official seals.',
        passport: 'This is a passport document. Ensure accuracy of: personal identification, nationality, passport numbers, issue/expiry dates, and official stamps.',
        legal_document: 'This is a legal document. Maintain: legal terminology, procedural language, statutory references, and formal tone.',
        general: 'General document translation with attention to context and meaning.'
      };

      prompt += `DOCUMENT TYPE: ${documentGuidance[documentType as keyof typeof documentGuidance]}\n\n`;
    }

    prompt += `Return your response in this exact JSON format:
{
  "translatedText": "The complete translated text",
  "confidence": 0.95,
  "legalTerms": [
    {
      "original": "original legal term",
      "translation": "translated term",
      "explanation": "brief explanation of the legal term"
    }
  ],
  "suggestions": ["Any helpful notes about the translation"]
}

Be extremely careful with:
- Legal terminology accuracy
- Proper names and places (do not translate these)
- Dates and numbers (maintain exact format)
- Official titles and certifications
- Government agency names and procedures`;

    return prompt;
  }

  async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.translateDocument(request);
        results.push(result);
      } catch (error) {
        results.push({
          originalText: request.text,
          translatedText: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          confidence: 0
        });
      }
    }
    
    return results;
  }

  async translateText(request: TranslationRequest): Promise<TranslationResult> {
    try {
      console.log(`Translating text from ${request.sourceLanguage} to ${request.targetLanguage}`);
      
      // Use the existing translateDocument method as base functionality
      const result = await this.translateDocument(request);
      
      return result;
    } catch (error: any) {
      console.error('Text translation failed:', error);
      return {
        originalText: request.text,
        translatedText: request.text, // Fallback to original text
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence: 0,
        documentType: request.documentType,
        legalTerms: [],
        suggestions: [`Translation failed: ${error.message || error}`],
        qualityPreview: {
          overallScore: 0,
          accuracy: { score: 0, issues: ["Translation service error"], strengths: [] },
          fluency: { score: 0, issues: [], suggestions: [] },
          terminology: { score: 0, legalTermsHandled: 0, totalLegalTerms: 0, inconsistencies: [] },
          formatting: { score: 0, preservedElements: [], issues: [] },
          risks: [{
            type: 'critical',
            description: 'Translation service failed',
            recommendation: 'Try again or use alternative translation method'
          }],
          readabilityScore: 0,
          recommendedActions: ['Service retry required']
        }
      };
    }
  }
}