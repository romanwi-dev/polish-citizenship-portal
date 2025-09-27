import { Express } from "express";
import { TranslationService, TranslationRequest } from "./translation-service";

const translationService = new TranslationService();

export function registerTranslationRoutes(app: Express) {
  // Translate text
  app.post("/api/translation/translate", async (req, res) => {
    try {
      const request: TranslationRequest = req.body;
      
      // Validate required fields
      if (!request.text || !request.targetLanguage) {
        return res.status(400).json({ 
          error: "Missing required fields: text and targetLanguage" 
        });
      }

      // Set defaults
      request.sourceLanguage = request.sourceLanguage || 'auto';
      request.documentType = request.documentType || 'general';
      request.preserveFormatting = request.preserveFormatting !== false;

      const result = await translationService.translateDocument(request);
      
      res.json({
        success: true,
        translation: result
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({
        error: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // Batch translate multiple texts
  app.post("/api/translation/batch", async (req, res) => {
    try {
      const { requests } = req.body;
      
      if (!Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({ 
          error: "Invalid requests array" 
        });
      }

      // Validate each request
      for (const request of requests) {
        if (!request.text || !request.targetLanguage) {
          return res.status(400).json({ 
            error: "Each request must have text and targetLanguage" 
          });
        }
      }

      const results = await translationService.batchTranslate(requests);
      
      res.json({
        success: true,
        translations: results
      });
    } catch (error) {
      console.error("Batch translation error:", error);
      res.status(500).json({
        error: `Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // Get supported languages and document types
  app.get("/api/translation/config", (req, res) => {
    res.json({
      supportedLanguages: [
        { code: 'polish', name: 'Polish', nativeName: 'Polski' },
        { code: 'english', name: 'English', nativeName: 'English' },
        { code: 'portuguese', name: 'Portuguese', nativeName: 'Português' },
        { code: 'spanish', name: 'Spanish', nativeName: 'Español' },
        { code: 'french', name: 'French', nativeName: 'Français' },
        { code: 'german', name: 'German', nativeName: 'Deutsch' },
        { code: 'russian', name: 'Russian', nativeName: 'Русский' },
        { code: 'hebrew', name: 'Hebrew', nativeName: 'עברית' }
      ],
      documentTypes: [
        { code: 'birth_certificate', name: 'Birth Certificate' },
        { code: 'marriage_certificate', name: 'Marriage Certificate' },
        { code: 'passport', name: 'Passport' },
        { code: 'legal_document', name: 'Legal Document' },
        { code: 'general', name: 'General Text' }
      ],
      features: [
        'Legal terminology accuracy',
        'Cultural context adaptation',
        'Official government language',
        'Proper name preservation',
        'Format preservation'
      ]
    });
  });

  // Quick translate endpoint for short texts
  app.post("/api/translation/quick", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ 
          error: "Missing text or targetLanguage" 
        });
      }

      // Quick translation with minimal processing
      const request: TranslationRequest = {
        text: text.substring(0, 1000), // Limit to 1000 chars for quick translate
        sourceLanguage: 'auto',
        targetLanguage,
        documentType: 'general',
        preserveFormatting: false
      };

      const result = await translationService.translateDocument(request);
      
      res.json({
        success: true,
        originalText: result.originalText,
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        confidence: result.confidence
      });
    } catch (error) {
      console.error("Quick translation error:", error);
      res.status(500).json({
        error: `Quick translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
}